import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Newspaper, MessageCircle, User } from 'lucide-react-native';
import { colors } from '../styles/globalStyles';
import { useMessage } from '../context';

const TabBarBadge = ({ count }) => {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {displayCount}
      </Text>
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { unreadCount } = useMessage();

  const getIcon = (routeName, focused, color, size) => {
    const iconProps = {
      size: size,
      color: color,
      strokeWidth: focused ? 2 : 1.5,
    };

    switch (routeName) {
      case 'Home':
        return <Home {...iconProps} />;
      case 'Feeds':
        return <Newspaper {...iconProps} />;
      case 'Messages':
        return <MessageCircle {...iconProps} />;
      case 'Profile':
        return <User {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? colors.tabActive : colors.tabInactive;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              {getIcon(route.name, isFocused, color, 22)}
              {route.name === 'Messages' && (
                <TabBarBadge count={unreadCount} />
              )}
            </View>
            <Text style={[styles.label, { color }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 5,
    paddingBottom: 5,
    height: 65,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.tabBackground,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomTabBar;
