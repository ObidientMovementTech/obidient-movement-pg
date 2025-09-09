import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, fonts } from '../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';

const MessagesScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Icon name="chatbubbles-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Messages Coming Soon</Text>
          <Text style={styles.emptySubtitle}>
            Connect with other Obidient Movement members and stay in touch with the community.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Direct messaging with members</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Group conversations</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Event coordination</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Real-time notifications</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notifyButton}>
            <Icon name="notifications-outline" size={20} color="white" />
            <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featureList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: 12,
  },
  notifyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  notifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
});

export default MessagesScreen;
