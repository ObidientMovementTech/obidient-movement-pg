import { useState } from "react";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  purpose: 'password_reset' | 'email_verification' | '2fa_setup' | 'email_change';
  email: string;
  isLoading?: boolean;
  pendingEmail?: string; // The new email address being verified (for email_change)
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  onVerify,
  purpose,
  email,
  isLoading = false,
  pendingEmail
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp);
  };

  const purposeText = purpose === 'password_reset'
    ? 'Password Reset'
    : purpose === 'email_change'
      ? 'Email Change'
      : purpose === '2fa_setup'
        ? '2FA Setup'
        : 'Email Verification';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">{purposeText} Verification</h2>

        <p className="text-gray-600 mb-4">
          {purpose === 'email_change' && pendingEmail ? (
            <>
              You're changing your email from <strong>{email}</strong> to <strong>{pendingEmail}</strong>.<br />
              Please enter the verification code sent to <strong>{email}</strong> to continue.
            </>
          ) : (
            <>
              We've sent a verification code to <strong>{email}</strong>.
              Please enter the code below to continue.
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#006837] focus:border-[#006837]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006837] hover:bg-[#005229]'} text-white py-2 px-4 rounded-md transition flex items-center justify-center`}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
