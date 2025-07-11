import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, ArrowLeft, Clock, Filter, X, ChevronRight, Megaphone } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteSelectedNotifications
} from "../../../services/notificationService";
import NotificationDetailModal from "../../../components/modals/NotificationDetailModal";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

interface AllNotificationsPageProps {
  setActivePage?: (page: string) => void;
}

export default function AllNotificationsPage({ setActivePage }: AllNotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all"); // all, unread, read
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications(
        notifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleting(!isDeleting);
    // Reset selected notifications when toggling delete mode
    setSelectedNotifications([]);
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const confirmDeleteSelected = () => {
    if (selectedNotifications.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      setIsDeletingSelected(true);
      setShowBulkDeleteConfirm(false);
      await deleteSelectedNotifications(selectedNotifications);

      // Update local state
      setNotifications(prev =>
        prev.filter(notification => !selectedNotifications.includes(notification._id))
      );

      // Exit delete mode
      setIsDeleting(false);
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Failed to delete selected notifications:", error);
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const confirmDeleteNotification = (notificationId: string) => {
    setPendingDeleteId(notificationId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteNotification = async () => {
    if (!pendingDeleteId) return;

    try {
      await deleteNotification(pendingDeleteId);

      // Update local state
      setNotifications(prev =>
        prev.filter(notification => notification._id !== pendingDeleteId)
      );

      // Reset state
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    } catch (error) {
      console.error(`Failed to delete notification ${pendingDeleteId}:`, error);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const handleOpenNotification = async (notification: Notification) => {
    setSelectedNotification(notification);

    // Mark as read if it's not already read
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        // Update local state
        setNotifications(
          notifications.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  // Utility function to format time in a human-readable way
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      // Format date like "Jun 11" for older notifications
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'broadcast':
        return <Bell size={18} className="text-blue-500" />;
      case 'adminBroadcast':
        return <Megaphone size={18} className="text-orange-500" />;
      case 'invite':
        return <Bell size={18} className="text-purple-500" />;
      case 'supporterUpdate':
        return <Bell size={18} className="text-green-500" />;
      case 'system':
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage && setActivePage("Overview")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Bell className="text-[#006837]" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-[#8cc63f] text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isDeleting ? (
            <>
              <button
                onClick={confirmDeleteSelected}
                disabled={isDeletingSelected || selectedNotifications.length === 0}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm 
                  ${selectedNotifications.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'} 
                  border border-red-100 rounded-md transition-colors`}
              >
                <Trash2 size={16} />
                <span>{isDeletingSelected ? 'Deleting...' : `Delete (${selectedNotifications.length})`}</span>
              </button>
              <button
                onClick={toggleDeleteMode}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#f8fcf9] text-[#006837] border border-[#006837]/20 rounded-md hover:bg-[#8cc63f]/10 transition-colors"
                >
                  <CheckCheck size={16} />
                  <span>Mark all as read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={toggleDeleteMode}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              )}
            </>
          )}

          <div className="relative inline-block">
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter size={16} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent appearance-none focus:outline-none pr-6"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#006837] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-2 text-gray-600 text-sm">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 bg-[#f8fcf9] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#8cc63f]/20">
              <Bell size={28} className="text-[#8cc63f]" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {filter === "unread"
                ? "You've read all your notifications. Good job staying up to date!"
                : filter === "read"
                  ? "You don't have any read notifications yet."
                  : "You don't have any notifications yet. We'll notify you when there's something new."}
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-100">
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                <p className="text-gray-500 text-sm">
                  Showing {filteredNotifications.length} {filter !== "all" ? `${filter} ` : ""}notifications
                </p>
                {isDeleting && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <Trash2 size={14} />
                    <span>Select notifications to delete</span>
                  </div>
                )}
              </div>
            </div>
            <ul className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`relative ${!notification.read ? 'bg-[#f8fcf9]' : ''} 
                    ${selectedNotifications.includes(notification._id) ? 'bg-blue-50' : ''}
                    hover:bg-gray-50 transition-all duration-200`}
                >
                  {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8cc63f]"></div>}
                  <div className="px-4 sm:px-6 py-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {isDeleting ? (
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-10 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification._id)}
                              onChange={() => toggleSelectNotification(notification._id)}
                              className="h-5 w-5 rounded border-gray-300 text-[#006837] focus:ring-[#006837]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getTypeIcon(notification.type)}
                          </div>
                        </div>
                      )}

                      <div className="flex-grow min-w-0">
                        {/* Clickable content area */}
                        <div
                          onClick={() => !isDeleting && handleOpenNotification(notification)}
                          className={`${!isDeleting ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1">
                            <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'} pr-2 truncate`}>
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-[#8cc63f] rounded-full"></span>
                              )}
                              {notification.type === 'adminBroadcast' && (
                                <span className="ml-2 inline-block text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                  General Broadcast
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <Clock size={12} />
                                {formatTimeAgo(new Date(notification.createdAt))}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2 sm:line-clamp-1">
                            {notification.message}
                          </p>
                          {!isDeleting && (
                            <div className="flex items-center text-[#006837] text-xs font-medium mb-2">
                              <span>View full message</span>
                              <ChevronRight size={14} />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            {formatDate(notification.createdAt)}
                          </span>
                          <div className="flex flex-wrap gap-2 ml-auto">
                            {!notification.read && !isDeleting && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification._id);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-[#006837] hover:bg-[#8cc63f]/10 rounded transition-colors"
                              >
                                <Check size={14} />
                                <span>Mark as read</span>
                              </button>
                            )}
                            {isDeleting ? (
                              <button
                                onClick={() => toggleSelectNotification(notification._id)}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${selectedNotifications.includes(notification._id) ? 'bg-red-100 text-red-600' : 'text-[#006837] hover:bg-[#8cc63f]/10'}`}
                              >
                                {selectedNotifications.includes(notification._id) ? (
                                  <X size={14} />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                <span>{selectedNotifications.includes(notification._id) ? 'Selected' : 'Delete'}</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeleteNotification(notification._id);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Delete Selected Notifications Button */}
      {isDeleting && selectedNotifications.length > 0 && (
        <div className="mt-4">
          <button
            onClick={confirmDeleteSelected}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-600 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
          >
            {isDeletingSelected ? (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete selected notifications</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Notification Settings Link */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setActivePage && setActivePage("Account Settings")}
          className="text-[#006837] hover:underline text-sm"
        >
          Manage notification preferences
        </button>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={handleCloseModal}
          formatDate={formatDate}
          getTypeIcon={getTypeIcon}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && pendingDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Notification</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this notification?
              {pendingDeleteId && (
                <span className="block mt-2 p-3 bg-gray-50 text-sm rounded border border-gray-100">
                  <strong className="block text-gray-800 mb-1">
                    {notifications.find(n => n._id === pendingDeleteId)?.title}
                  </strong>
                  <span className="text-gray-600 line-clamp-2">
                    {notifications.find(n => n._id === pendingDeleteId)?.message}
                  </span>
                </span>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPendingDeleteId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNotification}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Notifications</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{selectedNotifications.length}</span> selected notification{selectedNotifications.length === 1 ? '' : 's'}?
              <span className="block mt-3 text-red-600 text-sm">
                This action cannot be undone.
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete {selectedNotifications.length} notification{selectedNotifications.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
