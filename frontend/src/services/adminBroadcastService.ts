import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AdminBroadcast {
  _id: string;
  title: string;
  message: string;
  sentBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getAdminBroadcasts = async (): Promise<AdminBroadcast[]> => {
  const res = await axios.get(`${BASE_URL}/admin-broadcasts`, {
    withCredentials: true,
  });
  return res.data;
};

export const getAdminBroadcastById = async (id: string): Promise<AdminBroadcast> => {
  const res = await axios.get(`${BASE_URL}/admin-broadcasts/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const sendAdminBroadcast = async (title: string, message: string): Promise<AdminBroadcast> => {
  const res = await axios.post(
    `${BASE_URL}/admin-broadcasts/send`,
    { title, message },
    {
      withCredentials: true,
    }
  );
  return res.data.broadcast;
};

export const updateAdminBroadcast = async (id: string, title: string, message: string): Promise<AdminBroadcast> => {
  const res = await axios.put(
    `${BASE_URL}/admin-broadcasts/${id}`,
    { title, message },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const deleteAdminBroadcast = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/admin-broadcasts/${id}`, {
    withCredentials: true,
  });
};
