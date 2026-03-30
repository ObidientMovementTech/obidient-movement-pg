import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Bell, Check, CheckCheck, Trash2, ArrowLeft, Clock, Filter, X, ChevronRight, Megaphone,
} from "lucide-react";
import {
  Box, Typography, IconButton, Button, Chip, CircularProgress, Dialog, Checkbox,
} from "@mui/material";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteSelectedNotifications,
} from "../../../services/notificationService";
import NotificationDetailModal from "../../../components/modals/NotificationDetailModal";

const FONT = '"Poppins", sans-serif';
const PRIMARY = "#006837";
const PRIMARY_LIGHT = "rgba(0,104,55,0.06)";
const ACCENT = "#8cc63f";

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
  const navigate = useNavigate();
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
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* ─── Header ─── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          mb: 4,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={() => (setActivePage ? setActivePage('Overview') : navigate('/dashboard'))}
            size="small"
            sx={{ color: '#6f7a70' }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bell size={22} color={PRIMARY} />
            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: '1.5rem',
                color: '#1a1c1c',
                letterSpacing: '-0.02em',
              }}
            >
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} new`}
                size="small"
                sx={{
                  fontFamily: FONT,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  height: 22,
                  bgcolor: ACCENT,
                  color: '#fff',
                  borderRadius: 3,
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {isDeleting ? (
            <>
              <Button
                size="small"
                onClick={confirmDeleteSelected}
                disabled={isDeletingSelected || selectedNotifications.length === 0}
                startIcon={<Trash2 size={14} />}
                sx={{
                  fontFamily: FONT,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  color: selectedNotifications.length === 0 ? '#bec9be' : '#ba1a1a',
                  bgcolor: selectedNotifications.length === 0 ? '#f3f3f4' : '#ffdad6',
                  '&:hover': { bgcolor: '#ffc9c6' },
                }}
              >
                {isDeletingSelected ? 'Deleting...' : `Delete (${selectedNotifications.length})`}
              </Button>
              <Button
                size="small"
                onClick={toggleDeleteMode}
                startIcon={<X size={14} />}
                sx={{
                  fontFamily: FONT,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  color: '#6f7a70',
                  bgcolor: '#f3f3f4',
                  '&:hover': { bgcolor: '#e8e8e8' },
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  startIcon={<CheckCheck size={14} />}
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    color: PRIMARY,
                    bgcolor: PRIMARY_LIGHT,
                    border: `1px solid rgba(0,104,55,0.15)`,
                    '&:hover': { bgcolor: 'rgba(0,104,55,0.1)' },
                  }}
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="small"
                  onClick={toggleDeleteMode}
                  startIcon={<Trash2 size={14} />}
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    color: '#6f7a70',
                    bgcolor: '#f3f3f4',
                    '&:hover': { bgcolor: '#e8e8e8' },
                  }}
                >
                  Delete
                </Button>
              )}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: '#f3f3f4',
                }}
              >
                <Filter size={14} color="#6f7a70" />
                <Box
                  component="select"
                  value={filter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
                  sx={{
                    fontFamily: FONT,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#6f7a70',
                    bgcolor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    pr: 1,
                  }}
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* ─── Notifications List ─── */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {isLoading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={28} sx={{ color: PRIMARY }} />
            <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6f7a70', mt: 2 }}>
              Loading notifications...
            </Typography>
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ py: 8, px: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: PRIMARY_LIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <Bell size={28} color={ACCENT} />
            </Box>
            <Typography
              sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.1rem', color: '#1a1c1c', mb: 1 }}
            >
              No notifications
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6f7a70', maxWidth: 340, mx: 'auto' }}>
              {filter === 'unread'
                ? "You've read all your notifications. Good job staying up to date!"
                : filter === 'read'
                ? "You don't have any read notifications yet."
                : "You don't have any notifications yet. We'll notify you when there's something new."}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Count bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 3,
                py: 1.5,
                bgcolor: '#f9f9f9',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#6f7a70' }}>
                Showing {filteredNotifications.length} {filter !== 'all' ? `${filter} ` : ''}notifications
              </Typography>
              {isDeleting && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ba1a1a' }}>
                  <Trash2 size={13} />
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600 }}>
                    Select to delete
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Items */}
            {filteredNotifications.map((notification, idx) => (
              <Box
                key={notification._id}
                sx={{
                  position: 'relative',
                  px: 3,
                  py: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  bgcolor: selectedNotifications.includes(notification._id)
                    ? '#eef2ff'
                    : !notification.read
                    ? PRIMARY_LIGHT
                    : '#fff',
                  borderBottom: idx < filteredNotifications.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: !notification.read ? 'rgba(0,104,55,0.08)' : '#f9f9f9' },
                  ...(
                    !notification.read
                      ? { borderLeft: `3px solid ${ACCENT}` }
                      : { borderLeft: '3px solid transparent' }
                  ),
                }}
              >
                {/* Left: checkbox or icon */}
                {isDeleting ? (
                  <Checkbox
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => toggleSelectNotification(notification._id)}
                    size="small"
                    sx={{
                      color: '#bec9be',
                      '&.Mui-checked': { color: PRIMARY },
                      mt: 0.25,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                      bgcolor: notification.type === 'adminBroadcast' ? '#fff7ed' : '#f3f3f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    {getTypeIcon(notification.type)}
                  </Box>
                )}

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    onClick={() => !isDeleting && handleOpenNotification(notification)}
                    sx={{ cursor: !isDeleting ? 'pointer' : 'default' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontFamily: FONT,
                            fontWeight: !notification.read ? 700 : 500,
                            fontSize: '0.88rem',
                            color: '#1a1c1c',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              bgcolor: ACCENT,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {notification.type === 'adminBroadcast' && (
                          <Chip
                            label="Broadcast"
                            size="small"
                            sx={{
                              fontFamily: FONT,
                              fontSize: '0.58rem',
                              fontWeight: 700,
                              height: 18,
                              borderRadius: 1.5,
                              bgcolor: '#fff7ed',
                              color: '#c2410c',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={11} color="#bec9be" />
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: '#bec9be' }}>
                          {formatTimeAgo(new Date(notification.createdAt))}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      noWrap
                      sx={{
                        fontFamily: FONT,
                        fontSize: '0.82rem',
                        color: '#6f7a70',
                        mb: 0.75,
                      }}
                    >
                      {notification.message}
                    </Typography>

                    {!isDeleting && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.25,
                          color: PRIMARY,
                          mb: 0.5,
                        }}
                      >
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600 }}>
                          View full message
                        </Typography>
                        <ChevronRight size={14} />
                      </Box>
                    )}
                  </Box>

                  {/* Actions row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
                    {!notification.read && !isDeleting && (
                      <Typography
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        sx={{
                          fontFamily: FONT,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: PRIMARY,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: PRIMARY_LIGHT },
                        }}
                      >
                        <Check size={13} /> Mark as read
                      </Typography>
                    )}
                    {!isDeleting && (
                      <Typography
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteNotification(notification._id);
                        }}
                        sx={{
                          fontFamily: FONT,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#ba1a1a',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: '#ffdad6' },
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Box>

      {/* ─── Bottom bar for bulk delete ─── */}
      {isDeleting && selectedNotifications.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            onClick={confirmDeleteSelected}
            startIcon={isDeletingSelected ? <CircularProgress size={14} color="inherit" /> : <Trash2 size={14} />}
            sx={{
              fontFamily: FONT,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2.5,
              py: 1.25,
              color: '#ba1a1a',
              bgcolor: '#ffdad6',
              '&:hover': { bgcolor: '#ffc9c6' },
            }}
          >
            {isDeletingSelected ? 'Deleting...' : 'Delete selected notifications'}
          </Button>
        </Box>
      )}

      {/* ─── Preferences link ─── */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography
          onClick={() => (setActivePage ? setActivePage('Account Settings') : navigate('/dashboard/profile'))}
          sx={{
            fontFamily: FONT,
            fontSize: '0.82rem',
            color: PRIMARY,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Manage notification preferences
        </Typography>
      </Box>

      {/* ─── Notification Detail Modal (uses MUI Dialog portal) ─── */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={handleCloseModal}
          formatDate={formatDate}
          getTypeIcon={getTypeIcon}
        />
      )}

      {/* ─── Delete Confirmation ─── */}
      <Dialog
        open={showDeleteConfirm && !!pendingDeleteId}
        onClose={() => { setShowDeleteConfirm(false); setPendingDeleteId(null); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.12)' } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.05rem', color: '#1a1c1c', mb: 1 }}>
            Delete Notification
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.88rem', color: '#6f7a70', mb: 1.5 }}>
            Are you sure you want to delete this notification?
          </Typography>
          {pendingDeleteId && (() => {
            const n = notifications.find((n) => n._id === pendingDeleteId);
            return n ? (
              <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: 3 }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.82rem', color: '#1a1c1c', mb: 0.5 }}>
                  {n.title}
                </Typography>
                <Typography
                  noWrap
                  sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#6f7a70' }}
                >
                  {n.message}
                </Typography>
              </Box>
            ) : null;
          })()}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              onClick={() => { setShowDeleteConfirm(false); setPendingDeleteId(null); }}
              sx={{
                fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600, textTransform: 'none',
                borderRadius: 2, color: '#6f7a70', bgcolor: '#f3f3f4', '&:hover': { bgcolor: '#e8e8e8' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteNotification}
              sx={{
                fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600, textTransform: 'none',
                borderRadius: 2, color: '#fff', bgcolor: '#ba1a1a', '&:hover': { bgcolor: '#93000a' },
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* ─── Bulk Delete Confirmation ─── */}
      <Dialog
        open={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.12)' } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.05rem', color: '#1a1c1c', mb: 1 }}>
            Delete Notifications
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.88rem', color: '#6f7a70', mb: 0.5 }}>
            Are you sure you want to delete{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>{selectedNotifications.length}</Box>{' '}
            selected notification{selectedNotifications.length === 1 ? '' : 's'}?
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#ba1a1a', mb: 3 }}>
            This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              onClick={() => setShowBulkDeleteConfirm(false)}
              sx={{
                fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600, textTransform: 'none',
                borderRadius: 2, color: '#6f7a70', bgcolor: '#f3f3f4', '&:hover': { bgcolor: '#e8e8e8' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSelected}
              sx={{
                fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600, textTransform: 'none',
                borderRadius: 2, color: '#fff', bgcolor: '#ba1a1a', '&:hover': { bgcolor: '#93000a' },
              }}
            >
              Delete {selectedNotifications.length} notification{selectedNotifications.length === 1 ? '' : 's'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
