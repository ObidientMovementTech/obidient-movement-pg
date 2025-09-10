import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Bell, Clock, MessageSquare, AlertTriangle, Info, X, ExternalLink } from 'lucide-react-native';
import { globalStyles, typography } from '../styles/globalStyles';
import { mobileAPI } from '../services/api';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock notifications data - replace with actual API call
  const mockNotifications = [
    {
      id: 1,
      title: '🔔 New Update',
      message: 'New community update: Town Hall Meeting scheduled for this weekend',
      type: 'general',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      data: { type: 'feed', feedId: '123' }
    },
    {
      id: 2,
      title: '🚨 URGENT',
      message: 'Important: Election monitoring training tomorrow at 9 AM',
      type: 'urgent',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      data: { type: 'feed', feedId: '124' }
    },
    {
      id: 3,
      title: '🔔 New Update',
      message: 'Community outreach program registration now open',
      type: 'general',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      data: { type: 'feed', feedId: '125' }
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔔 Loading notifications from API...');

      const response = await mobileAPI.getNotifications();
      console.log('📝 Notifications response:', response.data);

      if (response.data.success) {
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'general',
          timestamp: new Date(notification.createdAt),
          read: notification.read,
          data: { type: notification.type } // Simple data structure
        }));

        setNotifications(formattedNotifications);
      } else {
        console.error('API returned error:', response.data.message);
        setNotifications([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
      // Fallback to empty array instead of showing alert
      setNotifications([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read locally first for immediate UI update
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Mark as read on server
    try {
      await mobileAPI.markNotificationRead(notification.id);
      console.log('📖 Notification marked as read:', notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    // Show modal for detailed view
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const handleModalAction = () => {
    setModalVisible(false);

    // Navigate based on notification type
    if (selectedNotification?.type === 'feed') {
      navigation.navigate('Feeds');
    }
    // For adminBroadcast, just close modal (user already read the message)
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle size={20} color="#dc2626" />;
      case 'message':
        return <MessageSquare size={20} color="#077b32" />;
      default:
        return <Info size={20} color="#077b32" />;
    }
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.slimNotificationItem,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.slimNotificationIcon}>
        {getNotificationIcon(notification.type)}
      </View>

      <View style={styles.slimNotificationContent}>
        <View style={styles.slimTitleRow}>
          <Text style={[
            styles.slimTitle,
            !notification.read && styles.unreadTitle
          ]} numberOfLines={1}>
            {notification.title}
          </Text>
          <View style={styles.slimTimestampContainer}>
            <Clock size={10} color="#64748b" />
            <Text style={styles.slimTimestamp}>
              {formatTimestamp(notification.timestamp)}
            </Text>
          </View>
        </View>

        <Text style={[
          styles.slimMessage,
          !notification.read && styles.unreadMessage
        ]} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

      {!notification.read && <View style={styles.slimUnreadDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={typography.body1}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Bell size={24} color="#077b32" />
        <Text style={[typography.h2, styles.headerTitle]}>
          Notifications
        </Text>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#077b32']}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#e2e8f0" />
            <Text style={[typography.h3, styles.emptyTitle]}>
              No notifications yet
            </Text>
            <Text style={[typography.body2, styles.emptyMessage]}>
              You'll see important updates and announcements here
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map(renderNotificationItem)}
          </View>
        )}
      </ScrollView>

      {/* Notification Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                {selectedNotification && getNotificationIcon(selectedNotification.type)}
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>
              {selectedNotification?.title}
            </Text>

            <Text style={styles.modalMessage}>
              {selectedNotification?.message}
            </Text>

            <View style={styles.modalFooter}>
              {selectedNotification?.type === 'feed' ? (
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={handleModalAction}
                >
                  <ExternalLink size={16} color="#077b32" />
                  <Text style={styles.modalActionText}>View in Feeds</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    marginLeft: 12,
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    paddingTop: 8,
  },
  // Slim notification card styles
  slimNotificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 3,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 70,
    maxHeight: 90,
  },
  unreadNotification: {
    backgroundColor: '#f0fdf4',
    borderColor: '#d1fae5',
  },
  slimNotificationIcon: {
    marginRight: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  slimNotificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  slimTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slimTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    color: '#1e293b',
    fontWeight: '600',
  },
  slimMessage: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    lineHeight: 16,
  },
  unreadMessage: {
    color: '#374151',
  },
  slimTimestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slimTimestamp: {
    marginLeft: 3,
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'Poppins-Regular',
  },
  slimUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#077b32',
    marginLeft: 8,
    position: 'absolute',
    right: 8,
    top: 8,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalFooter: {
    alignItems: 'center',
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#077b32',
  },
  modalActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#077b32',
  },
  modalCloseButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  modalCloseText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748b',
  },
});

export default NotificationsScreen;
