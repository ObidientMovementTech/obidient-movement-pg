import { useState, useEffect } from "react";
import {
  getAdminBroadcasts,
  sendAdminBroadcast,
  updateAdminBroadcast,
  deleteAdminBroadcast,
  AdminBroadcast
} from "../../../services/adminBroadcastService";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Check,
  Send,
  Calendar,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const truncateMessage = (message: string, maxLength: number = 120) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const toggleMessageExpansion = (broadcastId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(broadcastId)) {
      newExpanded.delete(broadcastId);
    } else {
      newExpanded.add(broadcastId);
    }
    setExpandedMessages(newExpanded);
  };

  useEffect(() => {
    const fetchBroadcasts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminBroadcasts();
        setBroadcasts(data);
      } catch (err) {
        setError("Failed to load broadcast messages. You might not have admin privileges.");
        console.error("Error fetching broadcasts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcasts();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const newBroadcast = await sendAdminBroadcast(title, message);
      setBroadcasts([newBroadcast, ...broadcasts]);
      setIsCreating(false);
      setTitle("");
      setMessage("");
      // Refresh to get the populated sentBy field
      handleRefresh();
    } catch (err) {
      setError("Failed to send broadcast message");
      console.error("Error sending broadcast:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (broadcast: AdminBroadcast) => {
    setEditingId(broadcast._id);
    setTitle(broadcast.title);
    setMessage(broadcast.message);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
  };

  const handleUpdate = async (id: string) => {
    if (!title.trim() || !message.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const updatedBroadcast = await updateAdminBroadcast(id, title, message);

      setBroadcasts(broadcasts.map(broadcast =>
        broadcast._id === id ? { ...broadcast, ...updatedBroadcast } : broadcast
      ));

      setEditingId(null);
      setTitle("");
      setMessage("");
      // Refresh to get the populated sentBy field
      handleRefresh();
    } catch (err) {
      setError("Failed to update broadcast message");
      console.error("Error updating broadcast:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminBroadcast(id);
      setBroadcasts(broadcasts.filter(broadcast => broadcast._id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete broadcast message");
      console.error("Error deleting broadcast:", err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Megaphone className="text-[#006837]" /> General Broadcast Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Send announcements to all users on the Obidient Movement platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#006837] text-white rounded-md hover:bg-[#005028] transition-colors"
            >
              <Plus size={18} />
              <span>New Broadcast</span>
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh"
            aria-label="Refresh broadcast list"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {isCreating ? "Create New Broadcast" : "Edit Broadcast"}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#006837] focus:border-[#006837] text-gray-900"
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#006837] focus:border-[#006837] text-gray-900"
                placeholder="Write your broadcast message here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={isCreating ? () => setIsCreating(false) : handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : () => editingId && handleUpdate(editingId)}
                className="flex items-center gap-2 px-4 py-2 bg-[#006837] text-white rounded-md hover:bg-[#005028] transition-colors"
                disabled={submitting || !title.trim() || !message.trim()}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </>
                ) : isCreating ? (
                  <>
                    <Send size={18} />
                    <span>Send Broadcast</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcasts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#006837] border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading broadcasts...</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No broadcasts yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Create your first broadcast message to announce important information to all users.
            </p>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#006837] text-white rounded-md hover:bg-[#005028] transition-colors"
              >
                <Plus size={18} />
                <span>New Broadcast</span>
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {broadcasts.map((broadcast) => (
              <li key={broadcast._id} className="p-5">
                {showDeleteConfirm === broadcast._id ? (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <p className="text-red-700 mb-3">Are you sure you want to delete this broadcast?</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 text-sm border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(broadcast._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          {broadcast.title}
                          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                            General Broadcast
                          </span>
                        </h3>
                        <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                          {expandedMessages.has(broadcast._id)
                            ? broadcast.message
                            : truncateMessage(broadcast.message)
                          }
                          {broadcast.message.length > 120 && (
                            <button
                              onClick={() => toggleMessageExpansion(broadcast._id)}
                              className="ml-2 text-[#006837] hover:text-[#005028] font-medium text-sm underline transition-colors"
                            >
                              {expandedMessages.has(broadcast._id) ? "Show less" : "Show more"}
                            </button>
                          )}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(broadcast.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>Sent by {broadcast.sentBy?.firstName || 'Admin'} {broadcast.sentBy?.lastName || ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(broadcast)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(broadcast._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
