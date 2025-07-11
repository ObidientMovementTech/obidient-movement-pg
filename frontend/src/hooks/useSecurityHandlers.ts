// Functions to handle email verification and 2FA setup
import { useState } from "react";
import { toast } from "react-hot-toast";
import { sendVerificationEmail, setup2FA, verify2FA, verifyOTP } from "../services/userService";

export const useSecurityHandlers = (
  refreshProfile: () => void
) => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showTwoFactorSetupModal, setShowTwoFactorSetupModal] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'password_reset' | 'email_verification' | '2fa_setup'>('password_reset');
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Handle email verification
  const handleEmailVerification = async () => {
    try {
      toast.loading("Sending verification email...", { id: "email-verify" });

      await sendVerificationEmail();

      setOtpPurpose('email_verification');
      setShowOtpModal(true);

      toast.success("Verification code sent to your email", { id: "email-verify" });
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send verification email", { id: "email-verify" });
    }
  };

  // Handle 2FA setup
  const handle2FASetup = async () => {
    try {
      toast.loading("Setting up 2FA...", { id: "setup-2fa" });

      const response = await setup2FA();
      setQrCodeUrl(response.qrCode);
      setShowTwoFactorSetupModal(true);

      toast.success("2FA setup initiated", { id: "setup-2fa" });
    } catch (error) {
      console.error("2FA setup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to setup 2FA", { id: "setup-2fa" });
    }
  };

  // Handle OTP verification
  const handleOtpVerify = async (otp: string) => {
    try {
      setIsVerifying(true);
      await verifyOTP(otp, otpPurpose);

      if (otpPurpose === 'email_verification') {
        toast.success("Email verified successfully");
        refreshProfile();
      }

      setShowOtpModal(false);
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify code");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle 2FA code verification
  const handle2FAVerify = async (token: string) => {
    try {
      setIsVerifying(true);
      await verify2FA(token);

      toast.success("2FA enabled successfully");
      setShowTwoFactorSetupModal(false);
      refreshProfile();
    } catch (error) {
      console.error("2FA verification error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify 2FA code");
    } finally {
      setIsVerifying(false);
    }
  };

  return {
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
    handle2FAVerify,
  };
};
