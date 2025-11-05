import React from 'react';
import { ShieldCheck, ArrowRight, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
  prevStep: (stepDecrement?: number) => void;
}

const GoogleAuthStep: React.FC<Props> = ({ data, updateData, nextStep, prevStep }) => {
  const handleGoogleLogin = () => {
    // Redirect to Google OAuth with token in state
    const googleAuthUrl = `${API_URL}/auth/onboarding/google?token=${data.token}`;
    window.location.href = googleAuthUrl;
  };

  const handleManualRegistration = () => {
    // Set bypassGoogle flag and proceed to next step
    updateData({
      bypassGoogle: true,
      googleData: null
    });
    nextStep();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <ShieldCheck className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in with Google</h2>
          <p className="text-gray-600 mt-1">Quick and secure authentication</p>
        </div>
      </div>

      <div className="mb-8">
        {data.reconciliation === 'update_required' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-yellow-900 mb-2">Account Update Required</p>
            <p className="text-sm text-yellow-700">
              We found an existing account with your phone number.
              Please sign in with Google to verify and update your account.
            </p>
            {data.existingUser && (
              <div className="mt-3 text-sm text-yellow-800">
                <p><strong>Current Name:</strong> {data.existingUser.name}</p>
                <p><strong>Designation:</strong> {data.existingUser.designation}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-lg">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
          </div>
        </div>

        {/* Manual Registration Option */}
        <button
          onClick={handleManualRegistration}
          className="w-full bg-gray-50 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-medium hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition flex items-center justify-center gap-3"
        >
          <User className="w-6 h-6 text-gray-600" />
          <span className="text-lg">Register with Phone & Password</span>
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="font-medium text-gray-900">Recommended: Sign in with Google</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>No email verification needed:</strong> Start immediately without waiting for verification emails</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Secure:</strong> Uses Google's industry-standard OAuth 2.0 security</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Fast:</strong> Complete registration in minutes, not hours</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Easy:</strong> Perfect for users who are not tech-savvy</span>
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => prevStep()}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
        <p className="text-sm text-gray-500">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthStep;
