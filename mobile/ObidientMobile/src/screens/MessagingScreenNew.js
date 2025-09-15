import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mobileAPI } from '../services/api';
import { colors, typography, globalStyles } from '../styles/globalStyles';
import { useUser } from '../context';

const MessagingScreen = ({ navigation }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('inbox'); // 'send', 'inbox', 'sent'
  const [selectedLevel, setSelectedLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Dynamic recipient levels based on user's designation and voting location
  const getAvailableRecipientLevels = () => {
    // Prioritize voting location over assigned location
    const userVotingState = user?.votingState || user?.assignedState;
    const userVotingLGA = user?.votingLGA || user?.assignedLGA;
    const userVotingWard = user?.votingWard || user?.assignedWard;

    const allLevels = [
      { value: 'peter_obi', label: 'Peter Obi', description: 'Presidential Candidate' },
      { value: 'national', label: 'National Coordinator', description: 'National Level' },
      { value: 'state', label: 'State Coordinator', description: userVotingState ? `${userVotingState} State` : 'Your Voting State' },
      { value: 'lga', label: 'LGA Coordinator', description: userVotingLGA && userVotingState ? `${userVotingLGA}, ${userVotingState}` : 'Your Voting LGA' },
      { value: 'ward', label: 'Ward Coordinator', description: userVotingWard && userVotingLGA ? `${userVotingWard}, ${userVotingLGA}` : 'Your Voting Ward' },
    ];

    // Everyone can message Peter Obi and up the hierarchy
    const userDesignation = user?.designation;

    if (userDesignation === 'Community Member' || userDesignation === 'Volunteer') {
      return allLevels; // Can message anyone up the hierarchy
    } else if (userDesignation === 'Ward Coordinator') {
      return allLevels.filter(level =>
        ['peter_obi', 'national', 'state', 'lga'].includes(level.value)
      );
    } else if (userDesignation === 'LGA Coordinator') {
      return allLevels.filter(level =>
        ['peter_obi', 'national', 'state'].includes(level.value)
      );
    } else if (userDesignation === 'State Coordinator') {
      return allLevels.filter(level =>
        ['peter_obi', 'national'].includes(level.value)
      );
    }

    return allLevels;
  };

  const loadMessages = async () => {
    try {
      const [sentResponse, inboxResponse] = await Promise.all([
        mobileAPI.getMyMessages(),
        mobileAPI.getLeadershipMessages(1, 20, 'all')
      ]);

      if (sentResponse.data.success) {
        setMyMessages(sentResponse.data.messages || []);
      }

      if (inboxResponse.data.success) {
        setInboxMessages(inboxResponse.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleSendMessage = async () => {
    if (!selectedLevel || !subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await mobileAPI.sendMessage({
        recipientLevel: selectedLevel,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          response.data.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setSubject('');
                setMessage('');
                setSelectedLevel('');
                setActiveTab('sent'); // Switch to sent tab
                loadMessages(); // Refresh messages
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseToMessage = async () => {
    if (!responseText.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    setLoading(true);
    try {
      const response = await mobileAPI.respondToMessage(selectedMessage.id, responseText.trim());

      if (response.data.success) {
        Alert.alert('Success', 'Response sent successfully');
        setShowResponseModal(false);
        setResponseText('');
        setSelectedMessage(null);
        loadMessages(); // Refresh messages
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      Alert.alert('Error', 'Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await mobileAPI.markMessageAsRead(messageId);
      loadMessages(); // Refresh to show updated status
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'delivered': return colors.info;
      case 'read': return colors.primary;
      case 'responded': return colors.success;
      default: return colors.gray;
    }
  };

  // Render message item for inbox
  const renderInboxMessage = ({ item }) => {
    const isUnread = item.status === 'delivered';

    return (
      <TouchableOpacity
        style={[styles.messageCard, isUnread && styles.unreadMessage]}
        onPress={() => {
          setSelectedMessage(item);
          if (isUnread) {
            markAsRead(item.id);
          }
        }}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.sender_name}</Text>
          <View style={styles.statusContainer}>
            {isUnread && <View style={styles.unreadDot} />}
            <Text style={styles.messageDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Text style={styles.messageSubject}>{item.subject}</Text>
        <Text style={styles.senderDesignation}>{item.sender_designation}</Text>
        <Text style={styles.messagePreview} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.messageFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          {item.response && (
            <Text style={styles.hasResponseText}>✓ Responded</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render message item for sent messages
  const renderSentMessage = ({ item }) => (
    <View style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <Text style={styles.recipientLevel}>To: {item.recipientLevel}</Text>
        <Text style={styles.messageDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.messageSubject}>{item.subject}</Text>
      <Text style={styles.messagePreview} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.messageFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase() || 'SENT'}</Text>
        </View>
        {item.response && (
          <TouchableOpacity
            style={styles.viewResponseButton}
            onPress={() => Alert.alert('Response', item.response)}
          >
            <Text style={styles.viewResponseText}>View Response</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  useEffect(() => {
    loadMessages();
  }, []);

  // Tab rendering functions
  const renderComposeTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Send Message to Leadership</Text>
      <Text style={styles.sectionSubtitle}>
        Messages are routed to coordinators in your voting location
      </Text>

      {/* Voting Location Info */}
      {(user?.votingState || user?.assignedState) ? (
        <View style={styles.locationInfoCard}>
          <Text style={styles.locationInfoTitle}>Your Voting Location:</Text>
          <Text style={styles.locationInfoText}>
            {user?.votingState || user?.assignedState} State
            {(user?.votingLGA || user?.assignedLGA) && ` → ${user?.votingLGA || user?.assignedLGA} LGA`}
            {(user?.votingWard || user?.assignedWard) && ` → ${user?.votingWard || user?.assignedWard} Ward`}
          </Text>
        </View>
      ) : (
        <View style={[styles.locationInfoCard, { backgroundColor: colors.warning + '20', borderLeftColor: colors.warning }]}>
          <Text style={styles.locationInfoTitle}>⚠️ Location Required:</Text>
          <Text style={styles.locationInfoText}>
            Please update your voting location in your profile to send messages to local coordinators.
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Recipient Level *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelsContainer}>
          {getAvailableRecipientLevels().map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.levelButton,
                selectedLevel === level.value && styles.selectedLevelButton
              ]}
              onPress={() => setSelectedLevel(level.value)}
            >
              <Text style={[
                styles.levelButtonText,
                selectedLevel === level.value && styles.selectedLevelButtonText
              ]}>
                {level.label}
              </Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Subject *</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Enter message subject"
          placeholderTextColor={colors.textTertiary}
          maxLength={100}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Message *</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message here..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={5}
          maxLength={1000}
        />
        <Text style={styles.charCount}>{message.length}/1000</Text>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, loading && styles.disabledButton]}
        onPress={handleSendMessage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.sendButtonText}>Send Message</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderInboxTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Received Messages ({inboxMessages.length})</Text>
      <FlatList
        data={inboxMessages}
        renderItem={renderInboxMessage}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages received yet</Text>
          </View>
        }
      />
    </View>
  );

  const renderSentTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Sent Messages ({myMessages.length})</Text>
      <FlatList
        data={myMessages}
        renderItem={renderSentMessage}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages sent yet</Text>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leadership Messages</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'inbox', label: 'Inbox', count: inboxMessages.filter(m => m.status === 'delivered').length },
          { key: 'send', label: 'Compose', count: null },
          { key: 'sent', label: 'Sent', count: myMessages.length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.key)}
          >
            <View style={styles.tabButtonContent}>
              <Text style={[styles.tabButtonText, activeTab === tab.key && styles.activeTabButtonText]}>
                {tab.label}
              </Text>
              {tab.count !== null && tab.count > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'send' && renderComposeTab()}
      {activeTab === 'inbox' && renderInboxTab()}
      {activeTab === 'sent' && renderSentTab()}

      {/* Message Detail Modal */}
      <Modal
        visible={!!selectedMessage}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedMessage(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Message Details</Text>
            <View style={styles.placeholder} />
          </View>

          {selectedMessage && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.messageSubjectFull}>{selectedMessage.subject}</Text>
              <Text style={styles.messageSenderFull}>
                From: {selectedMessage.sender_name} ({selectedMessage.sender_designation})
              </Text>
              <Text style={styles.messageDateFull}>
                {new Date(selectedMessage.created_at).toLocaleString()}
              </Text>

              <View style={styles.messageBodyContainer}>
                <Text style={styles.messageBodyText}>{selectedMessage.message}</Text>
              </View>

              {selectedMessage.response && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseTitle}>Your Response:</Text>
                  <Text style={styles.responseText}>{selectedMessage.response}</Text>
                  <Text style={styles.responseDate}>
                    Sent: {new Date(selectedMessage.responded_at).toLocaleString()}
                  </Text>
                </View>
              )}

              {!selectedMessage.response && (
                <TouchableOpacity
                  style={styles.respondButton}
                  onPress={() => setShowResponseModal(true)}
                >
                  <Text style={styles.respondButtonText}>Send Response</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowResponseModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Response</Text>
            <TouchableOpacity onPress={handleResponseToMessage} disabled={loading}>
              <Text style={[styles.modalSendText, loading && styles.disabledText]}>
                {loading ? 'Sending...' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Your Response</Text>
            <TextInput
              style={[styles.input, styles.responseInput]}
              value={responseText}
              onChangeText={setResponseText}
              placeholder="Type your response here..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{responseText.length}/1000</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
  header: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    fontSize: 18,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
  },
  tabButtonContent: {
    alignItems: 'center',
    position: 'relative',
  },
  tabButtonText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },
  activeTabButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tabContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    margin: 12,
    marginBottom: 6,
    fontSize: 18,
  },
  sectionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginHorizontal: 12,
    marginBottom: 8,
    fontStyle: 'italic',
    fontSize: 13,
  },
  locationInfoCard: {
    backgroundColor: colors.surfaceVariant,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  locationInfoTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 11,
  },
  locationInfoText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
    fontSize: 13,
  },
  inputContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
    fontSize: 13,
  },
  input: {
    ...globalStyles.input,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 2,
    fontSize: 11,
  },
  levelsContainer: {
    flexDirection: 'row',
  },
  levelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 110,
  },
  selectedLevelButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelButtonText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
    fontSize: 12,
  },
  selectedLevelButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  levelDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 1,
    fontSize: 10,
  },
  sendButton: {
    ...globalStyles.button,
    margin: 12,
    marginTop: 6,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    ...globalStyles.buttonText,
  },
  messageCard: {
    ...globalStyles.card,
    margin: 10,
    marginBottom: 6,
    padding: 12,
  },
  unreadMessage: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  senderName: {
    ...typography.h5,
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  messageDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  messageSubject: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 3,
    fontSize: 13,
  },
  senderDesignation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
    fontSize: 11,
  },
  messagePreview: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
    fontSize: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  hasResponseText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  recipientLevel: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  viewResponseButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewResponseText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    ...globalStyles.container,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseText: {
    ...typography.body1,
    color: colors.primary,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  modalSendText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  disabledText: {
    color: colors.textTertiary,
  },
  placeholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: 12,
  },
  messageSubjectFull: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 6,
    fontSize: 16,
  },
  messageSenderFull: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: 3,
    fontSize: 13,
  },
  messageDateFull: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 12,
    fontSize: 11,
  },
  messageBodyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  messageBodyText: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 20,
    fontSize: 13,
  },
  responseContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  responseTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: 8,
  },
  responseText: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  responseDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  respondButton: {
    ...globalStyles.button,
    marginTop: 16,
  },
  respondButtonText: {
    ...globalStyles.buttonText,
  },
  responseInput: {
    height: 120,
    textAlignVertical: 'top',
  },
});

export default MessagingScreen;
