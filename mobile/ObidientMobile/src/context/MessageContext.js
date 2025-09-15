import React, { createContext, useContext, useState } from 'react';
import { mobileAPI } from '../services/api';
import { useUser } from './UserContext';

const MessageContext = createContext();

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch unread message count (only when explicitly called)
  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await mobileAPI.getUnreadMessageCount();

      if (response.data?.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manually refresh unread count (call this when needed)
  const refreshUnreadCount = async () => {
    await fetchUnreadCount();
  };

  // Decrement unread count (call this when marking a message as read)
  const markAsRead = () => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Increment unread count (call this when receiving a new message)
  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  // Reset unread count (call this when user reads all messages)
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  const contextValue = {
    unreadCount,
    loading,
    fetchUnreadCount,
    refreshUnreadCount,
    markAsRead,
    incrementUnreadCount,
    resetUnreadCount
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};
