import { useState } from "react";

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  qrCodeUrl: string;
  isLoading?: boolean;
}

export default function TwoFactorSetupModal({
  isOpen,
  onClose,
  onVerify,
  qrCodeUrl,
  isLoading = false
}: TwoFactorSetupModalProps) {
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

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

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Set Up Two-Factor Authentication</h2>

        <div className="space-y-4">
          <p className="text-gray-600">
            Scan this QR code with your authenticator app (like Google Authenticator or Authy).
          </p>

          <div className="flex justify-center my-6">
            <img
              src={qrCodeUrl}
              alt="Two-Factor Authentication QR code"
              className="border border-gray-300 p-2 rounded-md w-48 h-48"
            />
          </div>

          <div className="bg-[#f0f7f3] border border-[#cce9d9] p-4 rounded-md">
            <h3 className="text-[#006837] font-medium text-sm mb-2">How to set up:</h3>
            <ol className="text-gray-700 text-sm list-decimal pl-5 space-y-1">
              <li>Download an authenticator app if you don't have one (Google Authenticator, Authy, Microsoft Authenticator)</li>
              <li>Scan the QR code with your app</li>
              <li>Enter the 6-digit code shown in your app</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
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
              {isLoading ? "Verifying..." : "Verify and Enable 2FA"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
