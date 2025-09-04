import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

import FeedsScreen from '../screens/FeedsScreen';
import MessagingScreen from '../screens/MessagingScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Simple icon component (we'll use text for now, can replace with proper icons later)
const TabIcon = ({ name, focused }) => (
  <Text style={{ color: focused ? '#2e7d32' : '#666', fontSize: 20 }}>
    {name === 'Feeds' ? '📰' : name === 'Messages' ? '💬' : '👤'}
  </Text>
);

// Profile screen placeholder
const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Profile Screen - Coming Soon</Text>
  </View>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Feeds" component={FeedsScreen} />
      <Tab.Screen name="Messages" component={MessagingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
