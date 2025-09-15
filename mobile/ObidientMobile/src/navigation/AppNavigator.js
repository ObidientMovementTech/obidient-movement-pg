import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Newspaper, MessageCircle, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import FeedsScreen from '../screens/FeedsScreen';
import MessagingScreen from '../screens/MessagingScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CustomTabBar from '../components/CustomTabBar';
import { colors } from '../styles/globalStyles';
import { MessageProvider } from '../context';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <MessageProvider>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Feeds" component={FeedsScreen} />
        <Tab.Screen name="Messages" component={MessagingScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </MessageProvider>
  );
};

const AppNavigator = ({ initialRoute = 'Login' }) => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
