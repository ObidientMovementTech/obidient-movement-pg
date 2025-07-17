import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Helper function to extract error messages from various error formats
const getErrorMessage = (error: any): string => {
  // Check for axios error response with data
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  // Check for axios error response with string data
  else if (error.response?.data && typeof error.response.data === 'string') {
    return error.response.data;
  }
  // Check for axios error message
  else if (error.message) {
    return error.message;
  }
  // Default error message
  return "An unexpected error occurred";
};

// Submit KYC with base64-encoded files (serverless-compatible) 
// Updated for simplified 2-step KYC (no personal info required)
export const submitKYCData = async (
  personalInfo: any | null, // Now optional since personal info is handled separately
  validID: { idType: string; idNumber: string; idImageBase64: string },
  selfieBase64: string
) => {
  try {
    // Validate required fields (only ID and selfie now)
    if (!validID.idType || !validID.idNumber) {
      throw new Error("Valid ID information is incomplete");
    }

    // We don't validate selfieBase64 presence here since we might have already stored the URL

    // Prepare payload with base64 encoded files (if provided)
    const payload = {
      // Only include personalInfo if it exists (backward compatibility)
      ...(personalInfo ? { personalInfo } : {}),
      validIDType: validID.idType,
      validIDNumber: validID.idNumber,
      // Only include base64 data if provided (for new uploads)
      ...(validID.idImageBase64 ? { validIDBase64: validID.idImageBase64 } : {}),
      ...(selfieBase64 ? { selfieBase64: selfieBase64 } : {})
    };

    const res = await axios.post(`${API_BASE}/kyc/submit`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error: any) {
    console.error("KYC submission error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// Save personal info step separately
export const savePersonalInfoStep = async (personalInfo: any) => {
  try {
    // Validate required fields
    if (!personalInfo.first_name || !personalInfo.last_name) {
      throw new Error("First name and last name are required");
    }

    const payload = { personalInfo };

    const res = await axios.patch(`${API_BASE}/kyc/save-step/personal-info`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error: any) {
    console.error("Save personal info error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// Save valid ID step separately
export const saveValidIDStep = async (validID: {
  idType: string;
  idNumber: string;
  idImageBase64?: string
}) => {
  try {
    // Validate required fields
    if (!validID.idType || !validID.idNumber) {
      throw new Error("ID type and number are required");
    }

    const payload = {
      validIDType: validID.idType,
      validIDNumber: validID.idNumber,
      validIDBase64: validID.idImageBase64 || undefined,
    };

    console.log("Sending ID data to server. Image included:", !!validID.idImageBase64);

    const res = await axios.patch(`${API_BASE}/kyc/save-step/valid-id`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });

    // Return the data with the Cloudinary URL from the server response
    console.log("Valid ID step response:", res.data);

    // Extract validID info with the server-provided Cloudinary URL
    const result = {
      ...res.data,
      validIDUrl: res.data.validID?.idImageUrl // Extract the Cloudinary URL
    };

    return result;
  } catch (error: any) {
    console.error("Save valid ID error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// Save selfie step separately
export const saveSelfieStep = async (selfieBase64: string) => {
  try {
    // Validate required field
    if (!selfieBase64) {
      throw new Error("Selfie image is required");
    }

    const payload = { selfieBase64 };

    console.log("Sending selfie data to server for upload");

    const res = await axios.patch(`${API_BASE}/kyc/save-step/selfie`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });

    // Return the data including the Cloudinary URL
    console.log("Selfie step response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Save selfie error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// Get user's KYC status and data
export const getUserKYC = async () => {
  try {
    const res = await axios.get(`${API_BASE}/kyc/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    console.error("Get KYC data error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// Edit/update KYC
export const editKYCData = async (
  personalInfo?: any,
  validID?: { idType?: string; idNumber?: string; idImageBase64?: string },
  selfieBase64?: string
) => {
  try {
    // Build payload with only the fields that are provided
    const payload: any = {};

    if (personalInfo) {
      payload.personalInfo = personalInfo;
    }

    if (validID) {
      if (validID.idType) payload.validIDType = validID.idType;
      if (validID.idNumber) payload.validIDNumber = validID.idNumber;
      if (validID.idImageBase64) payload.validIDBase64 = validID.idImageBase64;
    }

    if (selfieBase64) {
      payload.selfieBase64 = selfieBase64;
    }

    const res = await axios.patch(`${API_BASE}/kyc/edit`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error: any) {
    console.error("Edit KYC error:", error);
    throw new Error(getErrorMessage(error));
  }
};
