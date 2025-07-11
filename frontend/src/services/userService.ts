import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function updateProfile(data: any) {
  // PATCH /users/me
  const res = await axios.patch(`${API_BASE}/users/me`, data, {
    withCredentials: true
  });
  return res.data;
}

export async function requestPasswordChange(currentPassword?: string) {
  try {
    const res = await axios.post(`${API_BASE}/users/change-password-request`,
      currentPassword ? { currentPassword } : {},
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Password change request failed");
    }
    throw new Error("Password change request failed. Please try again.");
  }
}

export async function verifyOTP(otp: string, purpose: 'password_reset' | 'email_verification' | '2fa_setup' | 'email_change') {
  try {
    const res = await axios.post(`${API_BASE}/users/verify-otp`, {
      otp,
      purpose
    }, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Verification code verification failed");
    }
    throw new Error("Verification failed. Please try again with a valid code.");
  }
}

export async function changePassword(currentPassword: string, newPassword: string, otpVerified: boolean = false) {
  try {
    const res = await axios.post(`${API_BASE}/users/change-password`, {
      currentPassword,
      newPassword,
      otpVerified
    }, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Password change failed");
    }
    throw new Error("Password change failed. Please try again.");
  }
}

export async function sendVerificationEmail() {
  try {
    const res = await axios.post(`${API_BASE}/users/send-email-verification`, {}, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to send verification email");
    }
    throw new Error("Failed to send verification email. Please try again.");
  }
}

export async function setup2FA() {
  try {
    const res = await axios.post(`${API_BASE}/users/setup-2fa`, {}, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to setup 2FA");
    }
    throw new Error("Failed to setup 2FA. Please try again.");
  }
}

export async function verify2FA(token: string) {
  try {
    const res = await axios.post(`${API_BASE}/users/verify-2fa`, {
      token
    }, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to verify 2FA code");
    }
    throw new Error("Failed to verify 2FA code. Please try again.");
  }
}

export async function disable2FA(token: string) {
  try {
    const res = await axios.post(`${API_BASE}/users/disable-2fa`, {
      token
    }, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to disable 2FA");
    }
    throw new Error("Failed to disable 2FA. Please try again.");
  }
}

export async function requestEmailChange(newEmail: string, currentPassword: string) {
  try {
    const res = await axios.post(`${API_BASE}/users/change-email-request`, {
      newEmail,
      currentPassword
    }, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Email change request failed");
    }
    throw new Error("Email change request failed. Please try again.");
  }
}

export async function verifyEmailChange(token: string) {
  try {
    const res = await axios.get(`${API_BASE}/users/verify-email-change/${token}`, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Email verification failed");
    }
    throw new Error("Email verification failed. Please try again.");
  }
}

export async function updateNotificationPreferences(preferences: {
  email: boolean;
  push: boolean;
  broadcast: boolean;
}) {
  try {
    const res = await axios.patch(`${API_BASE}/users/notification-preferences`, preferences, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to update notification preferences");
    }
    throw new Error("Failed to update notification preferences. Please try again.");
  }
}

export async function deleteAccount(password: string, confirmationText: string) {
  try {
    const res = await axios.post(`${API_BASE}/users/delete-account`, {
      password,
      confirmationText
    }, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Account deletion failed");
    }
    throw new Error("Account deletion failed. Please try again.");
  }
}
