import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getNotifications = async () => {
  const res = await axios.get(`${BASE_URL}/notifications`, {
    withCredentials: true,
  });

  if (!Array.isArray(res.data)) {
    console.warn("Expected an array but got:", res.data);
    return [];
  }

  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/notifications/mark-all-read`,
      {},
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/notifications/${notificationId}/read`,
      {},
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Failed to mark notification ${notificationId} as read:`, error);
    throw error;
  }
};

export const getNotificationSettings = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/notifications/settings`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to get notification settings:", error);
    throw error;
  }
};

export const updateNotificationSettings = async (settings: any) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/notifications/settings`,
      settings,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/notifications/${notificationId}`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Failed to delete notification ${notificationId}:`, error);
    throw error;
  }
};

export const deleteSelectedNotifications = async (notificationIds: string[]) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/notifications`,
      {
        data: { ids: notificationIds },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to delete selected notifications:", error);
    throw error;
  }
};
