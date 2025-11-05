import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Props {
  data: any;
}

const CompletionStep: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const storageKey = data?.token ? `onboarding-data-${data.token}` : null;

  useEffect(() => {
    // Auto-submit when component mounts
    handleSubmit();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields before submission
      if (!data.phone) {
        throw new Error('Phone number is missing. Please go back and enter your phone number.');
      }

      if (!data.name) {
        throw new Error('Name is missing. Please go back and enter your name.');
      }

      const requestBody: Record<string, unknown> = {
        phone: data.phone,
        name: data.name,
        votingState: data.votingState,
        votingLGA: data.votingLGA,
        votingWard: data.votingWard,
        votingPU: data.votingPU,
        pollingUnitCode: data.pollingUnitCode, // Include PU code for monitoring_location
        supportGroup: data.supportGroup,
        profileImage: data.profileImage,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        accountName: data.accountName,
        bypassGoogle: data.bypassGoogle,
      };

      // Debug logging
      console.log('Submitting onboarding with data:', {
        phone: data.phone,
        name: data.name,
        bypassGoogle: data.bypassGoogle,
        hasGoogleData: !!data.googleData,
        hasPassword: !!data.password
      });

      if (!data.bypassGoogle && data.googleData) {
        requestBody.googleData = data.googleData;
      }

      // Include password for manual registration
      if (data.bypassGoogle && data.password) {
        requestBody.password = data.password;
      }

      const response = await axios.post(
        `${API_URL}/auth/onboarding/complete`,
        requestBody,
        {
          headers: { 'x-onboarding-token': data.token },
        }
      );

      setUserData(response.data.data);
      setSuccess(true);

      if (storageKey && typeof window !== 'undefined') {
        window.sessionStorage.removeItem(storageKey);
      }

      // Store token
      localStorage.setItem('authToken', response.data.data.token);

      // Celebrate! 🎉
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto text-center">
        <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Completing Your Registration</h2>
        <p className="text-gray-600 mb-6">
          Please wait while we set up your account...
        </p>
        <div className="bg-gray-50 rounded-lg p-6">
          <ul className="space-y-3 text-sm text-left">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Verifying your information</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Creating your account</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Assigning your role</span>
            </li>
            <li className="flex items-center gap-3 opacity-50">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="text-gray-500">Setting up your dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something Went Wrong</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (success && userData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto text-center">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome Aboard! 🎉
        </h2>

        <p className="text-lg text-gray-600 mb-8">
          Your registration is complete, {userData.user.name}!
        </p>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Your Details:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Designation:</span>
              <span className="font-medium text-gray-900">{userData.user.designation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{userData.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{userData.user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">State:</span>
              <span className="font-medium text-gray-900">{userData.user.votingState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LGA:</span>
              <span className="font-medium text-gray-900">{userData.user.votingLGA}</span>
            </div>
            {userData.user.votingWard && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ward:</span>
                <span className="font-medium text-gray-900">{userData.user.votingWard}</span>
              </div>
            )}
            {userData.user.votingPU && (
              <div className="flex justify-between">
                <span className="text-gray-600">Polling Unit:</span>
                <span className="font-medium text-gray-900">{userData.user.votingPU}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Support Group:</span>
              <span className="font-medium text-gray-900">{userData.user.supportGroup}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm font-medium text-blue-900 mb-2">What's Next?</p>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>You'll be redirected to your dashboard in a few seconds</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Complete your profile and familiarize yourself with the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Your coordinator will reach out with training information</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 mx-auto text-lg"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Redirecting automatically in 3 seconds...
        </p>
      </div>
    );
  }

  return null;
};

export default CompletionStep;
