import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface MobileFeed {
  id: number;
  title: string;
  message: string;
  feed_type: 'general' | 'urgent' | 'announcement';
  priority: 'low' | 'normal' | 'high';
  image_url?: string;
  published_at: string;
  created_at: string;
  created_by: number;
}

export interface CreateFeedData {
  title: string;
  message: string;
  feedType?: 'general' | 'urgent' | 'announcement';
  priority?: 'low' | 'normal' | 'high';
  imageUrl?: string;
}

export interface CreateMobileFeedRequest {
  title: string;
  message: string;
  feedType?: 'general' | 'urgent' | 'announcement';
  priority?: 'low' | 'normal' | 'high';
  imageUrl?: string;
}

export interface UpdateMobileFeedRequest {
  title?: string;
  message?: string;
  feedType?: 'general' | 'urgent' | 'announcement';
  priority?: 'low' | 'normal' | 'high';
  imageUrl?: string;
}

export interface FeedPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface GetFeedsResponse {
  success: boolean;
  feeds: MobileFeed[];
  pagination: FeedPagination;
}

// Get all mobile feeds (admin only)
export const getMobileFeeds = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axios.get(`${API_BASE}/mobile/feeds?page=${page}&limit=${limit}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new mobile feed (admin only)
export const createMobileFeed = async (feedData: CreateMobileFeedRequest) => {
  try {
    const response = await axios.post(`${API_BASE}/mobile/feeds`, feedData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a mobile feed (admin only)
export const deleteMobileFeed = async (feedId: number) => {
  try {
    const response = await axios.delete(`${API_BASE}/mobile/feeds/${feedId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a mobile feed (admin only)
export const updateMobileFeed = async (feedId: number, feedData: UpdateMobileFeedRequest) => {
  try {
    const response = await axios.put(`${API_BASE}/mobile/feeds/${feedId}`, feedData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
