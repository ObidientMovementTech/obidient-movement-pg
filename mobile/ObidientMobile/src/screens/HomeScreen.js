import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Home,
  Newspaper,
  MessageCircle,
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  Bell,
  ChevronRight
} from 'lucide-react-native';
import { mobileAPI, storage } from '../services/api';
import { colors, typography } from '../styles/globalStyles';
import NotificationPermissionManager from '../services/notificationPermissionManager';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [recentFeeds, setRecentFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadRecentFeeds();
    handleNotificationPermissions();
  }, []);

  const handleNotificationPermissions = async () => {
    try {
      console.log('🏠 HomeScreen: Checking notification permissions...');

      // First check current status for debugging
      const currentStatus = await NotificationPermissionManager.getCurrentPermissionStatus();
      console.log('🔍 Current permission status:', currentStatus);

      const result = await NotificationPermissionManager.handleNotificationPermissionFlow();

      if (result.success) {
        if (result.alreadyHandled) {
          console.log('🔔 Notification permissions already handled');
        } else if (result.granted) {
          console.log('✅ Notification permissions granted!');
        } else if (result.userDeclined) {
          console.log('❌ User declined notification permissions');
        }
      } else {
        console.error('❌ Error handling notification permissions:', result.error);
      }
    } catch (error) {
      console.error('❌ Unexpected error in notification permission flow:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await storage.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadRecentFeeds = async () => {
    try {
      setLoading(true);
      const response = await mobileAPI.getFeeds();

      if (response.data.success) {
        // Get the first 3 feeds for recent feeds, exactly like FeedsScreen
        const allFeeds = response.data.feeds || [];
        console.log('🏠 Recent feeds loaded:', allFeeds.length);
        setRecentFeeds(allFeeds.slice(0, 3));
      } else {
        console.log('🏠 Feeds API returned unsuccessful response');
        setRecentFeeds([]);
      }
    } catch (error) {
      console.error('🏠 Error loading recent feeds:', error);
      setRecentFeeds([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFeedTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'announcement': return '#FF6B35';
      case 'news': return '#2E7D32';
      case 'event': return '#1976D2';
      case 'urgent': return '#D32F2F';
      default: return '#757575';
    }
  };

  const FeedCard = ({ feed, index }) => (
    <TouchableOpacity
      style={[
        styles.feedCard,
        { marginLeft: index === 0 ? 20 : 10 }
      ]}
      onPress={() => navigation.navigate('Feeds')}
      activeOpacity={0.9}
    >
      {feed.image_url && (
        <Image
          source={{ uri: feed.image_url }}
          style={styles.feedImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.feedContent}>
        <View style={styles.feedHeader}>
          <View style={[styles.typeBadge, { backgroundColor: getFeedTypeColor(feed.feed_type) }]}>
            <Text style={styles.typeBadgeText}>{feed.feed_type || 'News'}</Text>
          </View>
          <Text style={styles.feedDate}>{formatDate(feed.published_at)}</Text>
        </View>
        <Text style={styles.feedTitle} numberOfLines={2}>
          {feed.title}
        </Text>
        <Text style={styles.feedText} numberOfLines={3}>
          {feed.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ icon: Icon, title, subtitle, onPress, color = colors.primary }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} strokeWidth={2} />
      </View>
      <View style={styles.quickActionText}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#C7C7CC" strokeWidth={2} />
    </TouchableOpacity>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Obidient'} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Bell size={24} color="#FFFFFF" strokeWidth={2} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Feeds Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Feeds</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Feeds')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.feedsScroll}
            snapToInterval={CARD_WIDTH + 10}
            decelerationRate="fast"
          >
            {(recentFeeds || []).map((feed, index) => (
              <FeedCard key={feed.id} feed={feed} index={index} />
            ))}
            {recentFeeds.length === 0 && !loading && (
              <View style={styles.emptyFeeds}>
                <Newspaper size={48} color="#E0E0E0" strokeWidth={1.5} />
                <Text style={styles.emptyFeedsText}>No feeds available</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.quickActions}>
            <QuickActionCard
              icon={Newspaper}
              title="Latest Feeds"
              subtitle="View all updates"
              onPress={() => navigation.navigate('Feeds')}
              color={colors.primary}
            />

            <QuickActionCard
              icon={MessageCircle}
              title="Send Message"
              subtitle="Contact coordinators"
              onPress={() => navigation.navigate('Messages')}
              color="#1976D2"
            />

            <QuickActionCard
              icon={Users}
              title="My Profile"
              subtitle="View account details"
              onPress={() => navigation.navigate('Profile')}
              color="#388E3C"
            />
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userName: {
    ...typography.h2,
    color: '#FFFFFF',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: '#1C1C1E',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  feedsScroll: {
    paddingRight: 20,
  },
  feedCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 10,
  },
  feedImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  feedContent: {
    padding: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  feedDate: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  feedTitle: {
    ...typography.body1,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: 22,
  },
  feedText: {
    ...typography.body2,
    color: '#48484A',
    lineHeight: 20,
    marginTop: 4,
  },
  emptyFeeds: {
    width: CARD_WIDTH,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  emptyFeedsText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  quickActions: {
    paddingHorizontal: 20,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    ...typography.caption,
    color: '#8E8E93',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
