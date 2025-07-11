import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const getOwnedVotingBlocs = async () => {
  const res = await axios.get(`${API_BASE}/voting-blocs/owned`, {
    withCredentials: true,
  });
  return res.data;
};

export const getJoinedVotingBlocs = async () => {
  const res = await axios.get(`${API_BASE}/voting-blocs/joined`, {
    withCredentials: true,
  });
  return res.data;
};

export const createVotingBloc = async (data: {
  name: string;
  description: string;
  richDescription: string;
  goals: string[];
  targetCandidate: string;
  scope: string;
  location: {
    state: string;
    lga: string;
    ward?: string;
  };
  bannerImageUrl: string;
  toolkits?: { label: string; url: string; type: string }[];
}) => {
  const res = await axios.post(`${API_BASE}/voting-blocs`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const getVotingBlocById = async (id: string) => {
  const res = await axios.get(`${API_BASE}/voting-blocs/${id}`, { withCredentials: true });
  return res.data;
};

export const updateVotingBloc = async (id: string, data: any) => {
  const res = await axios.put(`${API_BASE}/voting-blocs/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const deleteVotingBloc = async (id: string) => {
  const res = await axios.delete(`${API_BASE}/voting-blocs/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const joinVotingBloc = async (joinCode: string) => {
  const res = await axios.post(`${API_BASE}/voting-blocs/join`, { joinCode }, {
    withCredentials: true,
  });
  return res.data;
};

export const leaveVotingBloc = async (id: string) => {
  const res = await axios.post(`${API_BASE}/voting-blocs/${id}/leave`, {}, {
    withCredentials: true,
  });
  return res.data;
};

export const getVotingBlocByJoinCode = async (joinCode: string) => {
  // Add cache-busting timestamp to ensure fresh data
  const timestamp = new Date().getTime();
  const res = await axios.get(`${API_BASE}/voting-blocs/join-code/${joinCode}?_t=${timestamp}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getAllVotingBlocs = async (params: {
  page?: number;
  limit?: number;
  scope?: string;
  state?: string;
  lga?: string;
} = {}) => {
  const res = await axios.get(`${API_BASE}/voting-blocs`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

export const uploadVotingBlocBannerImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(`${API_BASE}/voting-blocs/upload-banner`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const uploadRichDescriptionImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(`${API_BASE}/voting-blocs/upload-rich-description-image`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const sendInvitation = async (votingBlocId: string, invitedUserId: string, inviteType: 'whatsapp' | 'sms' | 'link') => {
  const res = await axios.post(`${API_BASE}/voting-blocs/invite`, {
    votingBlocId,
    invitedUserId,
    inviteType,
  }, {
    withCredentials: true,
  });
  return res.data;
};

export const getLeaderboard = async (params: {
  level?: 'national' | 'state' | 'lga' | 'ward';
  state?: string;
  lga?: string;
  ward?: string;
} = {}) => {
  const res = await axios.get(`${API_BASE}/voting-blocs/leaderboard`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

// Get voting bloc invitations with status
export const getVotingBlocInvitations = async (id: string) => {
  const res = await axios.get(`${API_BASE}/voting-blocs/${id}/invitations`, {
    withCredentials: true,
  });
  return res.data;
};

// Send member invitation via email/phone
export const sendMemberInvitation = async (id: string, data: {
  email?: string;
  phone?: string;
  inviteType: 'email' | 'whatsapp' | 'sms';
  message?: string;
}) => {
  const res = await axios.post(`${API_BASE}/voting-blocs/${id}/invite-member`, data, {
    withCredentials: true,
  });
  return res.data;
};

// Resend invitation
export const resendInvitation = async (id: string, invitationId: string) => {
  const res = await axios.post(`${API_BASE}/voting-blocs/${id}/resend-invitation`, {
    invitationId,
  }, {
    withCredentials: true,
  });
  return res.data;
};

// Clear responded invitations (accepted/declined) from history
export const clearRespondedInvitations = async (id: string) => {
  const res = await axios.delete(`${API_BASE}/voting-blocs/${id}/invitations/clear-history`, {
    withCredentials: true,
  });
  return res.data;
};

// Send broadcast message to all members
export const sendBroadcastMessage = async (id: string, data: {
  message: string;
  messageType: 'announcement' | 'update' | 'reminder';
  channels: ('email' | 'whatsapp' | 'sms' | 'in-app')[];
}) => {
  const res = await axios.post(`${API_BASE}/voting-blocs/${id}/broadcast`, data, {
    withCredentials: true,
  });
  return res.data;
};

// Remove member from voting bloc
export const removeMember = async (id: string, memberId: string, reason?: string) => {
  const res = await axios.delete(`${API_BASE}/voting-blocs/${id}/members/${memberId}`, {
    data: { reason },
    withCredentials: true,
  });
  return res.data;
};

// Send private message to a specific member
export const sendPrivateMessage = async (id: string, memberId: string, message: string) => {
  const res = await axios.post(`${API_BASE}/voting-blocs/${id}/members/${memberId}/message`, {
    message,
    messageType: 'private'
  }, {
    withCredentials: true,
  });
  return res.data;
};

// Get member engagement analytics
export const getMemberEngagement = async (id: string) => {
  const res = await axios.get(`${API_BASE}/voting-blocs/${id}/engagement`, {
    withCredentials: true,
  });
  return res.data;
};

// Get member metadata with tags
export const getMemberMetadata = async (id: string) => {
  const res = await axios.get(`${API_BASE}/voting-blocs/${id}/member-metadata`, {
    withCredentials: true,
  });
  return res.data;
};

// Update member tags
export const updateMemberTags = async (id: string, memberId: string, data: {
  decisionTag?: 'Undecided' | 'Not-interested' | 'Committed' | 'Voted';
  contactTag?: 'No Response' | 'Messaged recently' | 'Called recently' | 'Not Reachable';
  notes?: string;
  engagementLevel?: 'Low' | 'Medium' | 'High';
}) => {
  const res = await axios.put(`${API_BASE}/voting-blocs/${id}/members/${memberId}/tags`, data, {
    withCredentials: true,
  });
  return res.data;
};
