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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mobileAPI } from '../services/api';

const MessagingScreen = ({ navigation }) => {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [showCompose, setShowCompose] = useState(false);

  const recipientLevels = [
    { value: 'peter_obi', label: 'Peter Obi' },
    { value: 'national', label: 'National Coordinator' },
    { value: 'state', label: 'State Coordinator' },
    { value: 'lga', label: 'LGA Coordinator' },
    { value: 'ward', label: 'Ward Coordinator' },
  ];

  const loadMessages = async () => {
    try {
      const response = await mobileAPI.getMyMessages();
      if (response.data.success) {
        setMyMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
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
        subject,
        message,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Message sent successfully!');
        setSubject('');
        setMessage('');
        setSelectedLevel('');
        setShowCompose(false);
        loadMessages(); // Reload messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const renderMessage = ({ item }) => (
    <View style={styles.messageItem}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageSubject}>{item.subject}</Text>
        <Text style={styles.messageDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.messageRecipient}>
        To: {recipientLevels.find(r => r.value === item.recipient_level)?.label}
      </Text>
      <Text style={styles.messageContent} numberOfLines={3}>
        {item.message}
      </Text>
      <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
      </View>
      {item.response && (
        <View style={styles.responseSection}>
          <Text style={styles.responseLabel}>Response:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'assigned':
        return { backgroundColor: '#ff9800' };
      case 'responded':
        return { backgroundColor: '#4caf50' };
      case 'closed':
        return { backgroundColor: '#9e9e9e' };
      default:
        return { backgroundColor: '#2196f3' };
    }
  };

  if (showCompose) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCompose(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Message</Text>
        </View>

        <ScrollView style={styles.composeForm}>
          <Text style={styles.label}>Send to:</Text>
          <View style={styles.recipientOptions}>
            {recipientLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.recipientOption,
                  selectedLevel === level.value && styles.selectedRecipient,
                ]}
                onPress={() => setSelectedLevel(level.value)}
              >
                <Text
                  style={[
                    styles.recipientText,
                    selectedLevel === level.value && styles.selectedRecipientText,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Subject:</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Enter subject"
          />

          <Text style={styles.label}>Message:</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your message"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.buttonDisabled]}
            onPress={handleSendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.sendButtonText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => setShowCompose(true)}
        >
          <Text style={styles.composeButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowCompose(true)}
            >
              <Text style={styles.startButtonText}>Send First Message</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  backButton: {
    fontSize: 16,
    color: '#2e7d32',
  },
  composeButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  composeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  messageDate: {
    fontSize: 12,
    color: '#666',
  },
  messageRecipient: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  messageContent: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  responseSection: {
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
  },
  composeForm: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recipientOptions: {
    marginBottom: 20,
  },
  recipientOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedRecipient: {
    backgroundColor: '#e8f5e8',
    borderColor: '#2e7d32',
  },
  recipientText: {
    fontSize: 14,
    color: '#333',
  },
  selectedRecipientText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageInput: {
    height: 120,
  },
  sendButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default MessagingScreen;
