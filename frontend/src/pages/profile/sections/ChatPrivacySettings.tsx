import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { getChatSettings, updateChatSettings, type ChatSettings } from '../../../services/chatSettingsService';
import { getBlockedUsers, type BlockedUser } from '../../../services/blockService';
import { useBlock } from '../../../context/BlockContext';

export default function ChatPrivacySettings() {
  const navigate = useNavigate();
  const { unblockUser } = useBlock();
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [settingsData, blockedData] = await Promise.all([
        getChatSettings(),
        getBlockedUsers(1, 100),
      ]);
      setSettings(settingsData);
      setBlockedUsers(blockedData.blocked || []);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = async (key: string, value: string | boolean) => {
    setUpdating(key);
    try {
      const updated = await updateChatSettings({ [key]: value });
      setSettings(updated);
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setUpdating(null);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser(userId);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User unblocked');
    } catch {
      toast.error('Failed to unblock user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Chat & Privacy</h1>
        </div>

        <div className="space-y-6">
          {/* Who Can Message Me */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Who Can Message Me
              </h3>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-4">
                Control who can start a direct message with you.
              </p>
              <div className="space-y-2">
                {([
                  { value: 'everyone', label: 'Everyone', desc: 'Anyone in the community' },
                  { value: 'coordinators_only', label: 'Coordinators Only', desc: 'Only coordinators can message you' },
                  { value: 'nobody', label: 'Nobody', desc: 'Block all new direct messages' },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      settings?.who_can_dm === opt.value
                        ? 'border-green-700 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="who_can_dm"
                      value={opt.value}
                      checked={settings?.who_can_dm === opt.value}
                      onChange={() => handleUpdate('who_can_dm', opt.value)}
                      disabled={updating === 'who_can_dm'}
                      className="accent-green-700"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                    {updating === 'who_can_dm' && settings?.who_can_dm !== opt.value && (
                      <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy Toggles */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Privacy
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {([
                { key: 'show_online_status', label: 'Show Online Status', desc: "Others can see when you're online", icon: '👁️' },
                { key: 'read_receipts', label: 'Read Receipts', desc: "Others can see when you've read messages", icon: '✓✓' },
                { key: 'show_typing_indicator', label: 'Typing Indicator', desc: "Others can see when you're typing", icon: '⌨️' },
                { key: 'allow_message_requests', label: 'Message Requests', desc: 'Allow messages from people without a shared group', icon: '✉️' },
              ] as const).map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-base">{toggle.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-gray-800">{toggle.label}</span>
                      <p className="text-xs text-gray-500">{toggle.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdate(toggle.key, !settings?.[toggle.key])}
                    disabled={updating === toggle.key}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings?.[toggle.key] ? 'bg-green-700' : 'bg-gray-300'
                    } ${updating === toggle.key ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings?.[toggle.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked Users */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Blocked Users
              </h3>
            </div>
            <div className="p-4">
              {blockedUsers.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🚫</div>
                  <p className="text-sm font-medium text-gray-500">No blocked users</p>
                  <p className="text-xs text-gray-400 mt-1">Users you block will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-500">
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user.name || 'Unknown'}
                        </p>
                        {user.designation && (
                          <p className="text-xs text-gray-500 truncate">{user.designation}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnblock(user.id)}
                        className="text-xs font-semibold text-green-700 px-3 py-1.5 border border-green-700/30 rounded-lg hover:bg-green-50 transition"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
