import { useState } from "react";
import { toast } from "react-hot-toast";
import { UserProfile } from "../../../context/UserContext";
import { updateProfile, requestEmailChange, verifyOTP, deleteAccount as deleteAccountService, updateNotificationPreferences } from "../../../services/userService";
import { useUser } from "../../../context/UserContext";
import OTPVerificationModal from "../../../components/modals/OTPVerificationModal";
import DeleteAccountModal from "../../../components/modals/DeleteAccountModal";
import { useNavigate } from "react-router";

interface AccountSettingsProps {
  profile: UserProfile;
}

export default function AccountSettings({ profile }: AccountSettingsProps) {
  const { refreshProfile } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    email: false,
    phone: false,
    affiliations: false,
    notifications: false,
    account: false
  });

  // Email states
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(profile.email || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState("");

  // Phone states
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(profile.phone || "");

  // 2FA states
  const [isVerifying, setIsVerifying] = useState(false);

  // Notifications states
  const [notificationsEmail, setNotificationsEmail] = useState(profile.notificationPreferences?.email ?? true);
  const [notificationsPush, setNotificationsPush] = useState(profile.notificationPreferences?.push ?? true);
  const [notificationsBroadcast, setNotificationsBroadcast] = useState(profile.notificationPreferences?.broadcast ?? true);

  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!emailPassword) {
      toast.error("Please enter your current password");
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, email: true }));
      toast.loading("Processing your request...", { id: "email-change" });

      // Request email change - this will either complete the process or trigger 2FA
      await requestEmailChange(newEmail, emailPassword);

      // If user has 2FA enabled, show OTP modal
      if (profile.twoFactorEnabled) {
        setPendingEmailChange(newEmail);
        setShowEmailOtpModal(true);
        toast.success("Please enter your 2FA code to continue", { id: "email-change" });
      } else {
        // For non-2FA users, the email change request is sent directly
        toast.success("Email change request sent. Please check your new email for verification.", { id: "email-change" });
        setIsEditingEmail(false);
        setEmailPassword("");
      }
    } catch (error) {
      console.error("Email change request error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to request email change. Please check your password and try again.",
        { id: "email-change" }
      );
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  // Handle OTP verification for email change
  const handleEmailOtpVerify = async (otp: string) => {
    try {
      setIsVerifying(true);
      toast.loading("Verifying...", { id: "email-otp" });

      // Verify the OTP for email change
      await verifyOTP(otp, "email_change");

      toast.success("Email change request sent. Please check your new email for verification.", { id: "email-otp" });
      setShowEmailOtpModal(false);
      setIsEditingEmail(false);
      setEmailPassword("");
      setPendingEmailChange("");
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(
        error instanceof Error ? error.message : "Invalid verification code",
        { id: "email-otp" }
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number (simple check for now)
    if (newPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, phone: true }));
      // Update the phone number
      await updateProfile({ phone: newPhone });
      toast.success("Phone number updated successfully");
      setIsEditingPhone(false);
      refreshProfile();
    } catch (error) {
      console.error("Phone update error:", error);
      toast.error("Failed to update phone number");
    } finally {
      setIsLoading(prev => ({ ...prev, phone: false }));
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (password: string, confirmationText: string) => {
    try {
      setIsLoading(prev => ({ ...prev, account: true }));
      toast.loading("Deleting your account...", { id: "delete-account" });

      await deleteAccountService(password, confirmationText);

      toast.success("Your account has been deleted successfully", { id: "delete-account" });
      navigate("/");
      // Account deleted and user redirected to home page
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("Failed to delete account. Please try again later.", { id: "delete-account" });
    } finally {
      setIsLoading(prev => ({ ...prev, account: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Contact Information</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-800 font-medium">Email Address</h4>
              {!isEditingEmail && (
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition"
                >
                  Change Email
                </button>
              )}
            </div>

            {!isEditingEmail ? (
              <p className="text-gray-600">{profile.email || "No email provided"}</p>
            ) : (
              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <label htmlFor="new-email" className="block text-sm font-medium text-gray-700">New Email Address</label>
                  <input
                    type="email"
                    id="new-email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
                <div>
                  <label htmlFor="email-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    id="email-password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading.email}
                    className={`${isLoading.email ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006837] hover:bg-[#005229]'} text-white px-4 py-2 rounded transition flex items-center`}
                  >
                    {isLoading.email && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading.email ? "Updating..." : "Update Email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setNewEmail(profile.email || "");
                      setEmailPassword("");
                    }}
                    disabled={isLoading.email}
                    className={`${isLoading.email ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700 px-4 py-2 rounded transition`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Phone Number */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-800 font-medium">Phone Number</h4>
              {!isEditingPhone && (
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition"
                >
                  Change Phone
                </button>
              )}
            </div>

            {!isEditingPhone ? (
              <p className="text-gray-600">{profile.phone || "No phone provided"}</p>
            ) : (
              <form onSubmit={handlePhoneChange} className="space-y-4">
                <div>
                  <label htmlFor="new-phone" className="block text-sm font-medium text-gray-700">New Phone Number</label>
                  <input
                    type="tel"
                    id="new-phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading.phone}
                    className={`${isLoading.phone ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006837] hover:bg-[#005229]'} text-white px-4 py-2 rounded transition flex items-center`}
                  >
                    {isLoading.phone && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading.phone ? "Updating..." : "Update Phone"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPhone(false);
                      setNewPhone(profile.phone || "");
                    }}
                    disabled={isLoading.phone}
                    className={`${isLoading.phone ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700 px-4 py-2 rounded transition`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Notification Preferences</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-800 font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">Receive updates, alerts, and announcements via email</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={notificationsEmail}
                  onChange={() => setNotificationsEmail(!notificationsEmail)}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-gray-800 font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">Receive real-time alerts when using the platform</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={notificationsPush}
                  onChange={() => setNotificationsPush(!notificationsPush)}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-gray-800 font-medium">Broadcast Messages</h4>
                <p className="text-sm text-gray-500 mt-1">Receive broadcast messages about important platform updates</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="broadcast-notifications"
                  checked={notificationsBroadcast}
                  onChange={() => setNotificationsBroadcast(!notificationsBroadcast)}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="pt-4 mt-2">
              <button
                onClick={async () => {
                  try {
                    setIsLoading(prev => ({ ...prev, notifications: true }));
                    toast.loading("Updating preferences...", { id: "notifications" });

                    await updateNotificationPreferences({
                      email: notificationsEmail,
                      push: notificationsPush,
                      broadcast: notificationsBroadcast
                    });

                    toast.success("Notification preferences updated", { id: "notifications" });
                    refreshProfile();
                  } catch (error) {
                    console.error("Notification preferences update error:", error);
                    toast.error("Failed to update notification preferences", { id: "notifications" });
                  } finally {
                    setIsLoading(prev => ({ ...prev, notifications: false }));
                  }
                }}
                className="bg-[#006837] text-white px-4 py-2 rounded hover:bg-[#005229] transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>      {/* Data Privacy Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Data & Privacy</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-gray-800 font-medium mb-2">Download Your Data</h4>
              <p className="text-sm text-gray-600 mb-3">Request a copy of your personal data from our platform</p>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
                Request Data Export
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-gray-800 font-medium mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 mb-3">Permanently delete your account and all associated data</p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal for Email */}
      <OTPVerificationModal
        isOpen={showEmailOtpModal}
        onClose={() => setShowEmailOtpModal(false)}
        onVerify={handleEmailOtpVerify}
        purpose="email_change"
        email={profile.email}
        isLoading={isVerifying}
        pendingEmail={pendingEmailChange} // Pass the pending email to display in the modal
      />

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        email={profile.email || ""}
        isLoading={isLoading.account}
      />
    </div>
  );
}
