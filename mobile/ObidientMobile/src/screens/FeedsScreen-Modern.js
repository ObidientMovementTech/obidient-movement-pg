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
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Heart, MessageCircle, Share2, Eye, Bookmark, ChevronRight, Calendar, User, MapPin } from 'lucide-react-native';
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
  const [likedFeeds, setLikedFeeds] = useState(new Set());
  const [bookmarkedFeeds, setBookmarkedFeeds] = useState(new Set());

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const response = await mobileAPI.getFeeds();

      if (response.data.success) {
        const feedsData = response.data.feeds || [];
        console.log('📱 Feeds received:', feedsData);
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

  const retryImageLoad = (feedId, imageUrl) => {
    console.log('📱 Retrying image load for feed:', feedId);
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(feedId);
      return newSet;
    });
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

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const feedDate = new Date(dateString);
    const diffMs = now - feedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return feedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: feedDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleLike = (feedId) => {
    setLikedFeeds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedId)) {
        newSet.delete(feedId);
      } else {
        newSet.add(feedId);
      }
      return newSet;
    });
  };

  const handleBookmark = (feedId) => {
    setBookmarkedFeeds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedId)) {
        newSet.delete(feedId);
      } else {
        newSet.add(feedId);
      }
      return newSet;
    });
  };

  const handleShare = async (feed) => {
    try {
      await Share.share({
        message: `${feed.title}\n\n${feed.message}\n\n- Obidient Movement`,
        title: feed.title,
      });
    } catch (error) {
      console.error('Error sharing feed:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'normal': return '#4CAF50';
      case 'low': return '#2196F3';
      default: return '#666666';
    }
  };

  const getFeedTypeIcon = (feedType) => {
    switch (feedType) {
      case 'urgent': return '🚨';
      case 'announcement': return '📢';
      case 'general': return '📰';
      default: return '📝';
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderFeedItem = ({ item }) => {
    const isLiked = likedFeeds.has(item.id);
    const isBookmarked = bookmarkedFeeds.has(item.id);

    return (
      <View style={styles.feedCard}>
        {/* Header - Author/Source Info */}
        <View style={styles.feedHeader}>
          <View style={styles.authorSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://via.placeholder.com/40x40/00A86B/FFFFFF?text=OM' }}
                style={styles.avatar}
              />
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
            </View>

            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>Obidient Movement</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.feedTypeText}>
                  {getFeedTypeIcon(item.feed_type)} {item.feed_type}
                </Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.timeText}>{formatTimeAgo(item.published_at)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => handleBookmark(item.id)} style={styles.bookmarkButton}>
            <Bookmark
              size={18}
              color={isBookmarked ? '#00A86B' : '#666666'}
              fill={isBookmarked ? '#00A86B' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <TouchableOpacity onPress={() => openFeedDetail(item)} activeOpacity={0.95}>
          <View style={styles.contentSection}>
            <Text style={styles.feedTitle}>{item.title}</Text>
            <Text style={styles.feedMessage}>
              {truncateText(item.message)}
            </Text>
            {item.message.length > 150 && (
              <TouchableOpacity onPress={() => openFeedDetail(item)}>
                <Text style={styles.readMoreText}>Read more</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Image */}
          {item.image_url && item.image_url.trim() !== '' && !imageErrors.has(item.id) && (
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: item.image_url,
                  cache: 'reload',
                  headers: { 'User-Agent': 'ObidientMobile/1.0' }
                }}
                style={styles.feedImage}
                resizeMode="cover"
                onLoad={() => {
                  setImageErrors(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.id);
                    return newSet;
                  });
                }}
                onError={(error) => {
                  console.log('📱 Image load error:', error.nativeEvent, 'URL:', item.image_url);
                  const retryCount = imageRetries.get(item.id) || 0;

                  if (retryCount < 2) {
                    setImageRetries(prev => new Map(prev.set(item.id, retryCount + 1)));
                    setTimeout(() => {
                      setImageErrors(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(item.id);
                        return newSet;
                      });
                    }, 1000 * (retryCount + 1));
                  } else {
                    setImageErrors(prev => new Set([...prev, item.id]));
                  }
                }}
              />

              {/* Image Overlay for Type Badge */}
              <View style={styles.imageOverlay}>
                <View style={[styles.typeBadgeOverlay, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.typeBadgeOverlayText}>{item.priority?.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Image Placeholder when image fails */}
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
        </TouchableOpacity>

        {/* Actions Bar */}
        <View style={styles.actionsBar}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionButton}>
              <Heart
                size={20}
                color={isLiked ? '#FF4444' : '#666666'}
                fill={isLiked ? '#FF4444' : 'transparent'}
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openFeedDetail(item)} style={styles.actionButton}>
              <MessageCircle size={20} color="#666666" />
              <Text style={styles.actionText}>Discuss</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionButton}>
              <Share2 size={18} color="#666666" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => openFeedDetail(item)} style={styles.viewMoreButton}>
            <Eye size={16} color="#00A86B" />
            <Text style={styles.viewMoreText}>View Full</Text>
            <ChevronRight size={16} color="#00A86B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'urgent':
        return { backgroundColor: '#E53E3E' };
      case 'announcement':
        return { backgroundColor: '#3182CE' };
      default:
        return { backgroundColor: '#00A86B' };
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
      <SafeAreaView style={styles.centerContent}>
        <View>
          <Text>Loading feeds...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🇳🇬</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Obidient Feed</Text>
              <Text style={styles.headerSubtitle}>Stay informed, stay united</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <MessageCircle size={22} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={onRefresh}
            >
              <Text style={[styles.refreshIcon, refreshing && styles.refreshingIcon]}>⚡</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Live Updates</Text>
          </View>
          <Text style={styles.feedCount}>
            {feeds.length} {feeds.length === 1 ? 'update' : 'updates'}
          </Text>
        </View>

        <FlatList
          data={feeds}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00A86B']}
              tintColor={'#00A86B'}
              progressBackgroundColor="#FFFFFF"
            />
          }
          contentContainerStyle={styles.feedsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.feedSeparator} />}
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },

  // Modern Header Styles
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    fontFamily: 'Poppins-Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#718096',
    fontFamily: 'Poppins-Regular',
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  refreshIcon: {
    fontSize: 18,
  },
  refreshingIcon: {
    opacity: 0.5,
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A86B',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: '#00A86B',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  feedCount: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Poppins-Regular',
  },

  // Feed List
  feedsList: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  feedSeparator: {
    height: 8,
  },

  // Feed Card - Social Media Style
  feedCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  // Feed Header (Author Section)
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  priorityIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Poppins-SemiBold',
  },
  verifiedBadge: {
    marginLeft: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedTypeText: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Poppins-Regular',
  },
  separator: {
    fontSize: 12,
    color: '#CBD5E0',
    marginHorizontal: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontFamily: 'Poppins-Regular',
  },
  bookmarkButton: {
    padding: 8,
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    lineHeight: 22,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  feedMessage: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  readMoreText: {
    fontSize: 14,
    color: '#00A86B',
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'Poppins-SemiBold',
  },

  // Image Container
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  feedImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  typeBadgeOverlay: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeOverlayText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },

  // Image Placeholder
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  retryText: {
    fontSize: 12,
    color: '#00A86B',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  // Actions Bar
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 16,
  },
  actionText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
    fontFamily: 'Poppins-Medium',
  },
  likedText: {
    color: '#FF4444',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#00A86B',
    fontWeight: '600',
    marginHorizontal: 4,
    fontFamily: 'Poppins-SemiBold',
  },

  // Loading & Empty States
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
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: '#00A86B',
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
    fontFamily: 'Poppins-SemiBold',
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
    color: '#00A86B',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Medium',
  },
  modalDate: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  modalMessage: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});

export default FeedsScreen;
