import { useState } from "react";
import { X, Send, Mail, Smartphone } from "lucide-react";
import { BroadcastMessageForm } from "../../types/votingBloc";

interface BroadcastMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: BroadcastMessageForm) => Promise<void>;
  memberCount: number;
  loading?: boolean;
}

export default function BroadcastMessageModal({
  isOpen,
  onClose,
  onSend,
  memberCount,
  loading = false
}: BroadcastMessageModalProps) {
  const [form, setForm] = useState<BroadcastMessageForm>({
    message: '',
    messageType: 'announcement',
    channels: ['email', 'in-app']
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BroadcastMessageForm, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BroadcastMessageForm, string>> = {};

    if (!form.message.trim()) {
      newErrors.message = 'Please enter your message';
    } else if (form.message.length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }

    if (form.channels.length === 0) {
      newErrors.channels = 'Please select at least one communication channel';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSend(form);
      setForm({
        message: '',
        messageType: 'announcement',
        channels: ['email', 'in-app']
      });
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleChannelToggle = (channel: 'email' | 'whatsapp' | 'sms' | 'in-app') => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
    if (errors.channels) {
      setErrors(prev => ({ ...prev, channels: undefined }));
    }
  };

  const messageTypeDescriptions = {
    announcement: 'Important updates or news about your voting bloc',
    update: 'Regular updates on activities, goals, or progress',
    reminder: 'Reminders about events, deadlines, or actions to take'
  };

  const channelOptions = [
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      description: 'Send via email notifications',
      color: 'blue'
    },
    {
      id: 'in-app',
      icon: Smartphone,
      label: 'In-App',
      description: 'Send as app notifications',
      color: 'orange'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Send Broadcast Message</h3>
            <p className="text-sm text-gray-500 mt-1">
              Send a message to all {memberCount} members of your voting bloc
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Message Type
            </label>
            <div className="space-y-2">
              {Object.entries(messageTypeDescriptions).map(([type, description]) => (
                <label key={type} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    value={type}
                    checked={form.messageType === type}
                    onChange={(e) => setForm(prev => ({ ...prev, messageType: e.target.value as any }))}
                    className="mt-1 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{type}</div>
                    <div className="text-sm text-gray-500">{description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Communication Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Communication Channels
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {channelOptions.map(({ id, icon: Icon, label, description, color }) => (
                <label
                  key={id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${form.channels.includes(id as any)
                    ? `border-${color}-500 bg-${color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={form.channels.includes(id as any)}
                    onChange={() => handleChannelToggle(id as any)}
                    className={`mt-1 text-${color}-600 focus:ring-${color}-500`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="font-medium text-gray-900">{label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.channels && (
              <p className="mt-2 text-sm text-red-600">{errors.channels}</p>
            )}
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              value={form.message}
              onChange={(e) => {
                setForm(prev => ({ ...prev, message: e.target.value }));
                if (errors.message) {
                  setErrors(prev => ({ ...prev, message: undefined }));
                }
              }}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${errors.message ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Write your message to all members of your voting bloc..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {form.message.length}/1000 characters
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Send size={14} />
                Will reach {memberCount} members
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.message && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Message Preview</h4>
              <div className="bg-white rounded border p-3">
                <div className="text-xs text-gray-500 mb-2 uppercase">
                  {form.messageType} • Via {form.channels.join(', ')}
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{form.message}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.message.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  {`Send to ${memberCount} Members`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
