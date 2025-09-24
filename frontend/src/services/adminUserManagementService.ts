import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface UserStatusUpdate {
  emailVerified?: boolean;
  suspended?: boolean;
}

interface UserProfileUpdate {
  name?: string;
  userName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  countryOfResidence?: string;
  votingState?: string;
  votingLGA?: string;
  votingWard?: string;
  votingPU?: string;
  gender?: string;
  ageRange?: string;
  citizenship?: string;
  isVoter?: boolean;
  stateOfOrigin?: string;
  role?: 'user' | 'admin';
  emailVerified?: boolean;
  kycStatus?: 'unsubmitted' | 'draft' | 'pending' | 'approved' | 'rejected';
  personalInfo?: Record<string, any>;
}

interface UserCreation {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'admin';
  emailVerified?: boolean;
  countryOfResidence?: string;
  votingState?: string;
  votingLGA?: string;
}

interface BulkActionData {
  role?: 'user' | 'admin';
  emailVerified?: boolean;
}

interface UserDesignationUpdate {
  designation: string;
  assignedState?: string | null;
  assignedLGA?: string | null;
  assignedWard?: string | null;
}

export const adminUserManagementService = {
  // Get all users with pagination and filters (OPTIMIZED)
  async getAllUsers(params: Record<string, any> = {}) {
    const response = await axios.get(`${API_BASE}/admin/user-management/users`, {
      params: {
        limit: 25, // Increased default for better UX
        ...params
      },
      withCredentials: true
    });
    return response.data;
  },

  // Fast search for typeahead/autocomplete (NEW)
  async fastSearch(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
      return { success: true, data: { users: [] } };
    }

    const response = await axios.get(`${API_BASE}/admin/user-management/users/search`, {
      params: { q: query, limit },
      withCredentials: true
    });
    return response.data;
  },

  // Get user statistics
  async getUserStatistics() {
    const response = await axios.get(`${API_BASE}/admin/user-management/users/statistics`, {
      withCredentials: true
    });
    return response.data;
  },

  // Get single user details
  async getUserDetails(userId: string) {
    const response = await axios.get(`${API_BASE}/admin/user-management/users/${userId}`, {
      withCredentials: true
    });
    return response.data;
  },

  // Update user role
  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const response = await axios.patch(`${API_BASE}/admin/user-management/users/${userId}/role`,
      { role },
      { withCredentials: true }
    );
    return response.data;
  },

  // Update user status
  async updateUserStatus(userId: string, status: UserStatusUpdate) {
    const response = await axios.patch(`${API_BASE}/admin/user-management/users/${userId}/status`,
      status,
      { withCredentials: true }
    );
    return response.data;
  },

  // Update user profile
  async updateUserProfile(userId: string, profileData: UserProfileUpdate) {
    const response = await axios.patch(`${API_BASE}/admin/user-management/users/${userId}/profile`,
      profileData,
      { withCredentials: true }
    );
    return response.data;
  },

  // Force password reset
  async forcePasswordReset(userId: string) {
    const response = await axios.post(`${API_BASE}/admin/user-management/users/${userId}/force-password-reset`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // Create new user
  async createUser(userData: UserCreation) {
    const response = await axios.post(`${API_BASE}/admin/user-management/users`,
      userData,
      { withCredentials: true }
    );
    return response.data;
  },

  // Delete user
  async deleteUser(userId: string) {
    const response = await axios.delete(`${API_BASE}/admin/user-management/users/${userId}`, {
      withCredentials: true
    });
    return response.data;
  },

  // Bulk operations
  async bulkUpdateUsers(userIds: string[], action: string, data: BulkActionData) {
    const response = await axios.post(`${API_BASE}/admin/user-management/users/bulk`, {
      userIds,
      action,
      data
    }, {
      withCredentials: true
    });
    return response.data;
  },

  // Email verification functions
  async resendVerificationEmail(userId: string) {
    const response = await axios.post(`${API_BASE}/admin/user-management/users/${userId}/resend-verification`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  async resendAllVerificationEmails() {
    const response = await axios.post(`${API_BASE}/admin/user-management/users/resend-all-verification`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  async getUnverifiedUsersStats() {
    const response = await axios.get(`${API_BASE}/admin/user-management/users/unverified/stats`, {
      withCredentials: true
    });
    return response.data;
  },

  // Update user designation and assignment
  async updateUserDesignation(userId: string, updateData: UserDesignationUpdate) {
    const response = await axios.put(`${API_BASE}/admin/user-management/users/${userId}/designation`, updateData, {
      withCredentials: true
    });
    return response.data;
  },

  // Export verified users to CSV
  async exportVerifiedUsersCSV() {
    const response = await axios.get(`${API_BASE}/admin/user-management/users/export/verified-csv`, {
      withCredentials: true,
      responseType: 'text' // Important for CSV data
    });
    return response;
  }
};
