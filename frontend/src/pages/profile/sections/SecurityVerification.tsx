import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { UserProfile } from "../../../context/UserContext";
import {
  changePassword,
  requestPasswordChange,
  disable2FA
} from "../../../services/userService";
import { useUser } from "../../../context/UserContext";
import OTPVerificationModal from "../../../components/modals/OTPVerificationModal";
import TwoFactorSetupModal from "../../../components/modals/TwoFactorSetupModal";
import Disable2FAModal from "../../../components/modals/Disable2FAModal";
import { useSecurityHandlers } from "../../../hooks/useSecurityHandlers";

interface SecurityVerificationProps {
  profile: UserProfile;
  onKYCStart: () => void;
}

export default function SecurityVerification({ profile, onKYCStart }: SecurityVerificationProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { refreshProfile } = useUser();
  const [isLoading, setIsLoading] = useState({
    password: false,
    twoFactor: false
  });
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  // Use our security handlers hook for 2FA and email verification
  const {
    showOtpModal,
    setShowOtpModal,
    showTwoFactorSetupModal,
    setShowTwoFactorSetupModal,
    otpPurpose,
    setOtpPurpose,
    qrCodeUrl,
    isVerifying,
    handleEmailVerification,
    handle2FASetup,
    handleOtpVerify,
    handle2FAVerify
  } = useSecurityHandlers(refreshProfile);

  // Custom handler for OTP verification specifically for password changes
  const handlePasswordOtpVerify = async (otp: string) => {
    try {
      setIsLoading(prev => ({ ...prev, password: true }));

      // First verify the OTP
      await handleOtpVerify(otp);

      // Then complete the password change
      await changePassword(passwordChangeData.currentPassword, passwordChangeData.newPassword, true);

      toast.success("Password changed successfully");

      // Reset form
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handlePasswordChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate new password
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, password: true }));
      toast.loading("Sending verification code...", { id: "password-change" });

      // Save the password data
      setPasswordChangeData({
        currentPassword,
        newPassword
      });

      // Set the OTP purpose
      setOtpPurpose('password_reset');

      // Request password change with OTP
      await requestPasswordChange(currentPassword);

      // Show OTP modal
      setShowOtpModal(true);

      toast.success("Verification code sent to your email", { id: "password-change" });
    } catch (error) {
      console.error("Password change request error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to request password change", { id: "password-change" });
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  // Handle 2FA disable with code verification
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);

  // Initial function to open the disable 2FA modal
  const handleDisable2FAStart = () => {
    setShowDisable2FAModal(true);
  };

  // Handle 2FA disable with verification code
  const handleDisable2FA = async (code: string) => {
    try {
      setIsLoading(prev => ({ ...prev, twoFactor: true }));
      toast.loading("Disabling 2FA...", { id: "disable-2fa" });

      await disable2FA(code);

      toast.success("2FA disabled successfully", { id: "disable-2fa" });
      setShowDisable2FAModal(false);
      refreshProfile();
    } catch (error) {
      console.error("2FA disable error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to disable 2FA", { id: "disable-2fa" });
    } finally {
      setIsLoading(prev => ({ ...prev, twoFactor: false }));
    }
  };

  const handle2FASetupClick = async () => {
    setIsLoading(prev => ({ ...prev, twoFactor: true }));
    try {
      await handle2FASetup();
    } finally {
      setIsLoading(prev => ({ ...prev, twoFactor: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* KYC Verification Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Identity Verification</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">KYC Status</h4>
              <p className="text-sm text-gray-600 mb-4 md:mb-0">
                Know Your Customer (KYC) verification helps us confirm your identity and build trust within the community.
              </p>
            </div>

            <div className="flex items-center">
              <div className="mr-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profile.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  profile.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    profile.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {profile.kycStatus === 'approved' && '✓ Verified'}
                  {profile.kycStatus === 'pending' && '⏱ Pending Review'}
                  {profile.kycStatus === 'rejected' && '✗ Verification Rejected'}
                  {(profile.kycStatus === 'unsubmitted' || !profile.kycStatus) && '! Not Verified'}
                </span>
              </div>

              {profile.kycStatus !== 'approved' && profile.kycStatus !== 'pending' && (
                <button
                  onClick={onKYCStart}
                  className="bg-[#006837] text-white px-4 py-2 rounded hover:bg-[#005229] transition"
                >
                  {profile.kycStatus === 'rejected' ? 'Resubmit Verification' : 'Start Verification'}
                </button>
              )}
            </div>
          </div>

          {/* KYC Status Details */}
          {profile.kycStatus === 'pending' && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
              <h5 className="font-medium">Your verification is being reviewed</h5>
              <p className="text-sm mt-1">We're currently reviewing your submitted documents. This usually takes 1-2 business days.</p>
            </div>
          )}

          {profile.kycStatus === 'rejected' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              <h5 className="font-medium">Verification was rejected</h5>
              <p className="text-sm mt-1">Reason: {profile.kycRejectionReason || "Could not verify identity with provided documents."}</p>
            </div>
          )}

          {profile.kycStatus === 'approved' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
              <h5 className="font-medium">You're fully verified!</h5>
              <p className="text-sm mt-1">Your identity has been confirmed. You have access to all platform features.</p>
            </div>
          )}

          {(profile.kycStatus === 'unsubmitted' || !profile.kycStatus) && (
            <div className="mt-6 bg-[#e6f1ed] border border-[#b7e0d3] rounded-md p-4 text-[#006837]">
              <h5 className="font-medium">Why verify your identity?</h5>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Gain credibility in discussions and campaigns</li>
                <li>Participate in voting and democratic processes</li>
                <li>Create and lead verified activities</li>
                <li>Access exclusive features for verified users</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Account Security Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Account Security</h3>
        </div>
        <div className="p-6">
          {/* Email Verification Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-800 font-medium">Email Verification</h4>
              {profile.emailVerified ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Verified</span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Not Verified</span>
              )}
            </div>

            {!profile.emailVerified && (
              <div className="mt-2">
                <button
                  onClick={handleEmailVerification}
                  disabled={isVerifying}
                  className={`text-sm ${isVerifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006837] hover:bg-[#005229]'} text-white px-3 py-1 rounded transition`}
                >
                  {isVerifying ? "Sending..." : "Send Verification Email"}
                </button>
              </div>
            )}
          </div>

          {/* Password Management */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-gray-800 font-medium">Password</h4>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition"
                >
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handlePasswordChangeRequest} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading.password}
                    className={`${isLoading.password ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006837] hover:bg-[#005229]'} text-white px-4 py-2 rounded transition flex items-center`}
                  >
                    {isLoading.password && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading.password ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    disabled={isLoading.password}
                    className={`${isLoading.password ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700 px-4 py-2 rounded transition`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-800 font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
              </div>
              {profile.twoFactorEnabled === true ? (
                <button
                  onClick={handleDisable2FAStart}
                  disabled={isLoading.twoFactor}
                  className={`text-sm ${isLoading.twoFactor ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white px-3 py-1 rounded transition`}
                >
                  {isLoading.twoFactor ? "Disabling..." : "Disable 2FA"}
                </button>
              ) : (
                <button
                  onClick={handle2FASetupClick}
                  disabled={isLoading.twoFactor}
                  className={`text-sm ${isLoading.twoFactor ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006837] hover:bg-[#005229]'} text-white px-3 py-1 rounded transition`}
                >
                  {isLoading.twoFactor ? "Setting up..." : "Enable 2FA"}
                </button>
              )}
            </div>
            {profile.twoFactorEnabled === true && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3 text-green-700">
                <p className="text-sm">2FA is currently enabled on your account</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={otpPurpose === 'password_reset' ? handlePasswordOtpVerify : handleOtpVerify}
        purpose={otpPurpose}
        email={profile.email}
        isLoading={isVerifying || isLoading.password}
      />

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={showTwoFactorSetupModal}
        onClose={() => setShowTwoFactorSetupModal(false)}
        onVerify={handle2FAVerify}
        qrCodeUrl={qrCodeUrl}
        isLoading={isVerifying || isLoading.twoFactor}
      />

      {/* 2FA Disable Modal */}
      <Disable2FAModal
        isOpen={showDisable2FAModal}
        onClose={() => setShowDisable2FAModal(false)}
        onVerify={handleDisable2FA}
        isLoading={isLoading.twoFactor}
      />

      {/* Disable 2FA Modal */}
      <Disable2FAModal
        isOpen={showDisable2FAModal}
        onClose={() => setShowDisable2FAModal(false)}
        onVerify={handleDisable2FA}
        isLoading={isLoading.twoFactor}
      />
    </div>
  );
}
