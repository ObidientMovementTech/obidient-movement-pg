import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mobileAPI } from '../services/api';

const FeedsScreen = ({ navigation }) => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const response = await mobileAPI.getFeeds();

      if (response.data.success) {
        setFeeds(response.data.feeds || []);
      }
    } catch (error) {
      console.error('Error loading feeds:', error);
      Alert.alert('Error', 'Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeeds();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  const renderFeedItem = ({ item }) => (
    <View style={styles.feedItem}>
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>{item.title}</Text>
        <Text style={styles.feedDate}>
          {new Date(item.published_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.feedMessage}>{item.message}</Text>
      {item.feed_type && (
        <View style={[styles.badge, getBadgeStyle(item.feed_type)]}>
          <Text style={styles.badgeText}>{item.feed_type.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'urgent':
        return { backgroundColor: '#f44336' };
      case 'announcement':
        return { backgroundColor: '#2196f3' };
      default:
        return { backgroundColor: '#4caf50' };
    }
  };

  if (loading && feeds.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading feeds...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feeds & Alerts</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={feeds}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.feedsList}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No feeds available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFeeds}>
              <Text style={styles.retryButtonText}>Retry</Text>
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
  refreshButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
  },
  feedsList: {
    padding: 16,
  },
  feedItem: {
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
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  feedDate: {
    fontSize: 12,
    color: '#666',
  },
  feedMessage: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerContent: {
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
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default FeedsScreen;
