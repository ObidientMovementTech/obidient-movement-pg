import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function getAdcStatus() {
  const res = await axios.get(`${API}/api/adc/status`, { withCredentials: true });
  return res.data;
}

export async function submitAdcCard(cardImageBase64: string) {
  const res = await axios.post(
    `${API}/api/adc/submit-card`,
    { cardImage: cardImageBase64 },
    { withCredentials: true }
  );
  return res.data;
}

// Admin
export async function getAdcSubmissions(params: Record<string, any> = {}) {
  const res = await axios.get(`${API}/api/adc/submissions`, {
    params,
    withCredentials: true,
  });
  return res.data;
}

export async function approveAdcUser(userId: string) {
  const res = await axios.patch(`${API}/api/adc/${userId}/approve`, {}, { withCredentials: true });
  return res.data;
}

export async function rejectAdcUser(userId: string, reason: string) {
  const res = await axios.patch(`${API}/api/adc/${userId}/reject`, { reason }, { withCredentials: true });
  return res.data;
}
