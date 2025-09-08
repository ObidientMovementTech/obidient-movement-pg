import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mobileAPI } from '../services/api';

const { width } = Dimensions.get('window');

const FeedsScreen = ({ navigation }) => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [imageRetries, setImageRetries] = useState(new Map());

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const response = await mobileAPI.getFeeds();

      if (response.data.success) {
        const feedsData = response.data.feeds || [];
        console.log('📱 Feeds received:', feedsData);
        // Log each feed to check image_url
        feedsData.forEach((feed, index) => {
          console.log(`📱 Feed ${index + 1}:`, {
            id: feed.id,
            title: feed.title,
            image_url: feed.image_url,
            hasImage: !!feed.image_url
          });
        });
        setFeeds(feedsData);
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

  const openFeedDetail = (feed) => {
    setSelectedFeed(feed);
    setModalVisible(true);
  };

  const closeFeedDetail = () => {
    setModalVisible(false);
    setSelectedFeed(null);
  };

  const retryImageLoad = (feedId, imageUrl) => {
    const currentRetries = imageRetries.get(feedId) || 0;
    if (currentRetries < 3) { // Max 3 retries
      console.log(`📱 Retrying image load for feed ${feedId}, attempt ${currentRetries + 1}`);
      setImageRetries(prev => new Map(prev.set(feedId, currentRetries + 1)));
      setImageErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedId);
        return newSet;
      });
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const feedDate = new Date(dateString);
    const diffInHours = Math.floor((now - feedDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return feedDate.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderFeedItem = ({ item }) => {
    console.log('📱 Rendering feed item:', {
      id: item.id,
      title: item.title,
      image_url: item.image_url,
      hasImage: !!item.image_url,
      imageUrlType: typeof item.image_url
    });

    return (
      <TouchableOpacity
        style={styles.feedCard}
        onPress={() => openFeedDetail(item)}
        activeOpacity={0.9}
      >
        {/* Feed Type Badge */}
        <View style={[styles.typeBadge, getTypeBadgeStyle(item.feed_type)]}>
          <Text style={styles.typeBadgeText}>{item.feed_type}</Text>
        </View>

        {/* Feed Image */}
        {item.image_url && item.image_url.trim() !== '' && !imageErrors.has(item.id) && (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: item.image_url,
                cache: 'reload', // Force reload to retry
                headers: {
                  'User-Agent': 'ObidientMobile/1.0',
                }
              }}
              style={styles.feedImage}
              resizeMode="cover"
              onLoad={() => {
                console.log('📱 Image loaded successfully:', item.image_url);
                // Clear any previous errors for this image
                setImageErrors(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(item.id);
                  return newSet;
                });
              }}
              onError={(error) => {
                console.log('📱 Image load error:', error.nativeEvent, 'URL:', item.image_url);
                console.log('📱 Retries for feed:', item.id, '=', imageRetries.get(item.id) || 0);

                const currentRetries = imageRetries.get(item.id) || 0;
                if (currentRetries < 2) { // Retry up to 2 times
                  setTimeout(() => {
                    retryImageLoad(item.id, item.image_url);
                  }, 1000 * (currentRetries + 1)); // Increasing delay
                } else {
                  setImageErrors(prev => new Set([...prev, item.id]));
                }
              }}
              onLoadStart={() => console.log('📱 Image load started:', item.image_url)}
              onLoadEnd={() => console.log('📱 Image load ended:', item.image_url)}
            />
          </View>
        )}

        {/* Image Placeholder when image fails to load */}
        {item.image_url && item.image_url.trim() !== '' && imageErrors.has(item.id) && (
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={() => retryImageLoad(item.id, item.image_url)}
          >
            <Text style={styles.placeholderText}>🖼️</Text>
            <Text style={styles.placeholderSubtext}>Image unavailable</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        )}

        {/* Feed Content */}
        <View style={styles.feedContent}>
          <Text style={styles.feedTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.feedMessage} numberOfLines={3}>
            {truncateText(item.message)}
          </Text>

          {/* Feed Footer */}
          <View style={styles.feedFooter}>
            <View style={styles.priorityContainer}>
              <View style={[styles.priorityDot, getPriorityStyle(item.priority)]} />
              <Text style={styles.priorityText}>{item.priority} priority</Text>
            </View>

            <Text style={styles.timeAgo}>
              {formatTimeAgo(item.published_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'urgent':
        return { backgroundColor: '#E53E3E' }; // Red for urgent
      case 'announcement':
        return { backgroundColor: '#3182CE' }; // Blue for announcement
      default:
        return { backgroundColor: '#006837' }; // Obidient green for general
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return { backgroundColor: '#E53E3E' };
      case 'normal':
        return { backgroundColor: '#F6AD55' };
      default:
        return { backgroundColor: '#68D391' };
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
        <Text style={styles.headerTitle}>Latest Reports ⚡</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={feeds}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#006837']}
            tintColor={'#006837'}
          />
        }
        contentContainerStyle={styles.feedsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>📱 No feeds available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFeeds}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Feed Detail Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeFeedDetail}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={closeFeedDetail}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            {selectedFeed && (
              <View style={[styles.modalTypeBadge, getTypeBadgeStyle(selectedFeed.feed_type)]}>
                <Text style={styles.modalTypeBadgeText}>{selectedFeed.feed_type}</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedFeed && (
              <>
                {/* Modal Image */}
                {selectedFeed.image_url && (
                  <Image
                    source={{ uri: selectedFeed.image_url }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}

                {/* Modal Content */}
                <View style={styles.modalTextContent}>
                  <Text style={styles.modalTitle}>{selectedFeed.title}</Text>

                  <View style={styles.modalMeta}>
                    <View style={styles.modalMetaItem}>
                      <View style={[styles.priorityDot, getPriorityStyle(selectedFeed.priority)]} />
                      <Text style={styles.modalMetaText}>{selectedFeed.priority} priority</Text>
                    </View>

                    <Text style={styles.modalDate}>
                      {formatTimeAgo(selectedFeed.published_at)}
                    </Text>
                  </View>

                  <Text style={styles.modalMessage}>{selectedFeed.message}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
  },
  refreshButton: {
    backgroundColor: '#006837',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  refreshButtonText: {
    fontSize: 16,
  },
  feedsList: {
    padding: 16,
    paddingBottom: 100,
  },
  feedCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(226, 232, 240, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#718096',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  retryText: {
    fontSize: 10,
    color: '#006837',
    marginTop: 2,
    fontWeight: '600',
  },
  feedContent: {
    padding: 16,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    lineHeight: 22,
  },
  feedMessage: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#006837',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#006837',
    fontWeight: '600',
  },
  modalTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalTypeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
  },
  modalTextContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
    lineHeight: 32,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalMetaText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  modalDate: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  modalMessage: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
});

export default FeedsScreen;
