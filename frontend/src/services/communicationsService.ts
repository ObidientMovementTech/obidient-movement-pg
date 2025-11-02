import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CommunicationCampaign {
  id: number;
  title: string;
  type: "sms" | "voice";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  lgas: string[];
  message_template?: string;
  audio_asset_id?: number;
  created_by: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  total_recipients: number;
  total_batches: number;
  processed_batches: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  total_cost: number;
  error_message?: string;
}

export interface AudioAsset {
  id: number;
  filename: string;
  original_name: string;
  file_url: string;
  duration_seconds?: number;
  uploaded_by: number;
  uploaded_at: string;
}

export interface CreateSMSCampaignRequest {
  title: string;
  lgas: string[];
  messageTemplate: string;
}

export interface CreateVoiceCampaignRequest {
  title: string;
  lgas: string[];
  audioAssetId?: number;
  fallbackAudioUrl?: string;
}

export interface CampaignStats {
  campaign: CommunicationCampaign;
  progressPercentage: number;
  deliveryRate: number;
  avgCostPerRecipient: number;
  estimatedTimeRemaining?: string;
}

// SMS Campaign Management
export const createSMSCampaign = async (data: CreateSMSCampaignRequest): Promise<CommunicationCampaign> => {
  const res = await axios.post(
    `${BASE_URL}/api/communications/sms`,
    data,
    { withCredentials: true }
  );
  return res.data.campaign;
};

// Voice Campaign Management
export const createVoiceCampaign = async (data: CreateVoiceCampaignRequest): Promise<CommunicationCampaign> => {
  const res = await axios.post(
    `${BASE_URL}/api/communications/voice`,
    data,
    { withCredentials: true }
  );
  return res.data.campaign;
};

// Campaign List & Details
export const getCampaigns = async (type?: "sms" | "voice"): Promise<CommunicationCampaign[]> => {
  const params = type ? { type } : {};
  const res = await axios.get(`${BASE_URL}/api/communications/campaigns`, {
    params,
    withCredentials: true,
  });

  const raw = res.data;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (Array.isArray(raw?.campaigns)) {
    return raw.campaigns;
  }

  return [];
};

export const getCampaignById = async (id: number): Promise<CampaignStats> => {
  const res = await axios.get(`${BASE_URL}/api/communications/campaigns/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const cancelCampaign = async (id: number): Promise<CommunicationCampaign> => {
  const res = await axios.post(
    `${BASE_URL}/api/communications/campaigns/${id}/cancel`,
    {},
    { withCredentials: true }
  );
  return res.data.campaign;
};

// Audio Asset Management
export const uploadAudioAsset = async (file: File): Promise<AudioAsset> => {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await axios.post(
    `${BASE_URL}/api/communications/audio-assets`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data.audioAsset;
};

export const getAudioAssets = async (): Promise<AudioAsset[]> => {
  const res = await axios.get(`${BASE_URL}/api/communications/audio-assets`, {
    withCredentials: true,
  });
  return res.data.audioAssets;
};

// Dashboard Stats
export interface DashboardStats {
  totalCampaigns: number;
  totalSmsCampaigns: number;
  totalVoiceCampaigns: number;
  totalRecipients: number;
  totalDelivered: number;
  totalFailed: number;
  totalCost: number;
  deliveryRate: number;
  recentCampaigns: CommunicationCampaign[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const campaigns = await getCampaigns();

  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return {
      totalCampaigns: 0,
      totalSmsCampaigns: 0,
      totalVoiceCampaigns: 0,
      totalRecipients: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalCost: 0,
      deliveryRate: 0,
      recentCampaigns: [],
    };
  }

  const totalCampaigns = campaigns.length;
  const totalSmsCampaigns = campaigns.filter(c => c.type === "sms").length;
  const totalVoiceCampaigns = campaigns.filter(c => c.type === "voice").length;
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.total_recipients, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered_count, 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + c.failed_count, 0);
  const totalCost = campaigns.reduce((sum, c) => sum + parseFloat(c.total_cost.toString()), 0);
  const deliveryRate = totalRecipients > 0 ? (totalDelivered / totalRecipients) * 100 : 0;
  const recentCampaigns = campaigns.slice(0, 5);

  return {
    totalCampaigns,
    totalSmsCampaigns,
    totalVoiceCampaigns,
    totalRecipients,
    totalDelivered,
    totalFailed,
    totalCost,
    deliveryRate,
    recentCampaigns,
  };
};

// Location Data (States & LGAs)
export const getAvailableStates = async (): Promise<string[]> => {
  const res = await axios.get(`${BASE_URL}/api/locations/states`, {
    withCredentials: true,
  });
  return res.data.states;
};

export const getLgasForState = async (state: string): Promise<string[]> => {
  const res = await axios.get(`${BASE_URL}/api/locations/states/${encodeURIComponent(state)}/lgas`, {
    withCredentials: true,
  });
  return res.data.lgas;
};

export interface VoterCountResponse {
  state: string;
  lgas: string[];
  voterCount: number;
}

export const getVoterCount = async (state: string, lgas: string[]): Promise<VoterCountResponse> => {
  const res = await axios.post(
    `${BASE_URL}/api/locations/voter-count`,
    { state, lgas },
    { withCredentials: true }
  );
  return res.data;
};
