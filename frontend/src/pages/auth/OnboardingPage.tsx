import React, { useState, useEffect, lazy, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import axios from 'axios';
import { AlertCircle, Loader2 } from 'lucide-react';

// Lazy load step components so initial bundle stays light
const PhoneStep = lazy(() => import('./steps/PhoneStep'));
const GoogleAuthStep = lazy(() => import('./steps/GoogleAuthStep'));
const LocationStep = lazy(() => import('./steps/LocationStep'));
const ProfileStep = lazy(() => import('./steps/ProfileStep'));
const PasswordStep = lazy(() => import('./steps/PasswordStep'));
const BankDetailsStep = lazy(() => import('./steps/BankDetailsStep'));
const SupportGroupStep = lazy(() => import('./steps/SupportGroupStep'));
const CompletionStep = lazy(() => import('./steps/CompletionStep'));

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface OnboardingData {
  token: string;
  designation: string;
  phone: string;
  reconciliation?: 'new_user' | 'update_required' | 'account_exists' | 'existing_user';
  existingUser?: any;
  voterData?: any;
  googleData?: {
    googleId: string;
    email: string;
    displayName: string;
    photoUrl: string;
  } | null;
  name: string;
  votingState: string;
  votingLGA: string;
  votingWard: string;
  votingPU: string;
  supportGroup: string;
  profileImage?: string;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  password?: string;
  confirmPassword?: string;
  skipGoogle?: boolean;
  bypassGoogle?: boolean;
}

const OnboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token');
  const storageKey = tokenParam ? `onboarding-data-${tokenParam}` : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [tokenValidated, setTokenValidated] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    token: searchParams.get('token') || '',
    designation: '',
    phone: '',
    name: '',
    votingState: '',
    votingLGA: '',
    votingWard: '',
    votingPU: '',
    supportGroup: '',
    skipGoogle: false,
    bypassGoogle: false,
  });

  const hasHydratedRef = useRef(false);

  // Dynamic total steps calculation
  // Manual registration needs Password step (and name will be collected there)
  const needsPasswordStep = !onboardingData.googleData && onboardingData.bypassGoogle;

  // Calculate total steps dynamically
  let totalSteps = 7; // Base: Phone, Google, Location, Profile, Bank, Support, Completion
  if (needsPasswordStep) totalSteps++; // Add Password step for manual registration

  const lastStorageKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (storageKey && storageKey !== lastStorageKeyRef.current) {
      hasHydratedRef.current = false;
      lastStorageKeyRef.current = storageKey;
    }
  }, [storageKey]);

  // Validate token on mount
  useEffect(() => {
    const storedToken = onboardingData.token;

    if (!tokenParam) {
      setError('Invalid onboarding link. Please contact your coordinator.');
      setTokenValidated(false);
      return;
    }

    if (tokenParam === storedToken && tokenValidated) {
      return;
    }

    const controller = new AbortController();

    const validateToken = async () => {
      try {
        setError('');
        setTokenValidated(false);
        const response = await axios.get(`${API_URL}/auth/onboarding/token-info`, {
          params: { token: tokenParam },
          headers: { 'x-onboarding-token': tokenParam },
          signal: controller.signal,
        });

        setOnboardingData(prev => ({
          ...prev,
          token: response.data.data.token,
          designation: response.data.data.designation,
        }));
        setTokenValidated(true);
      } catch (err: any) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err.response?.data?.message || 'Invalid or expired onboarding link');
        setTokenValidated(false);
      }
    };

    validateToken();

    return () => {
      controller.abort();
    };
  }, [tokenParam, onboardingData.token, tokenValidated]);

  const googleHandledRef = useRef<string | null>(null);

  // Hydrate onboarding data from session storage (survives Google OAuth redirects)
  useEffect(() => {
    if (!storageKey || hasHydratedRef.current || typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOnboardingData(prev => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.error('Failed to restore onboarding data from storage:', err);
    } finally {
      hasHydratedRef.current = true;
    }
  }, [storageKey]);

  // Persist onboarding data (excluding sensitive fields) after hydration
  useEffect(() => {
    if (!storageKey || !hasHydratedRef.current || typeof window === 'undefined') {
      return;
    }

    try {
      const { password, confirmPassword, ...persistable } = onboardingData;
      window.sessionStorage.setItem(storageKey, JSON.stringify(persistable));
    } catch (err) {
      console.error('Failed to persist onboarding data:', err);
    }
  }, [onboardingData, storageKey]);

  // Handle Google OAuth callback
  useEffect(() => {
    const googleDataParam = searchParams.get('googleData');
    if (!googleDataParam || googleHandledRef.current === googleDataParam) {
      return;
    }

    try {
      const decoded = JSON.parse(atob(googleDataParam));
      setOnboardingData(prev => ({
        ...prev,
        googleData: decoded,
        name: decoded.displayName,
      }));
      setCurrentStep(3); // Move to location step
      googleHandledRef.current = googleDataParam;
    } catch (err) {
      console.error('Error parsing Google data:', err);
    }
  }, [searchParams]);

  const updateData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const nextStep = useCallback((stepIncrement = 1) => {
    setCurrentStep((prev) => Math.min(prev + stepIncrement, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback((stepDecrement = 1) => {
    setCurrentStep((prev) => Math.max(prev - stepDecrement, 1));
  }, []);

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    scrollToTop();
  }, [currentStep, scrollToTop]);

  if (!tokenValidated && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating your onboarding link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    // Build step mapping dynamically based on user type and auth method
    const steps: string[] = ['phone'];

    // Add google auth (skippable for existing users with verified email)
    if (!onboardingData.skipGoogle) {
      steps.push('google');
    }

    // Common steps
    steps.push('location', 'profile');

    // Add password step for manual registration (after profile)
    // Name will be collected in the password step for manual registration
    if (needsPasswordStep) {
      steps.push('password');
    }

    // Final steps
    steps.push('bank', 'support', 'completion');

    // Get current step type
    const currentStepType = steps[currentStep - 1];

    switch (currentStepType) {
      case 'phone':
        return <PhoneStep data={onboardingData} updateData={updateData} nextStep={nextStep} />;
      case 'google':
        return (
          <GoogleAuthStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 'location':
        return (
          <LocationStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 'profile':
        return (
          <ProfileStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 'password':
        return (
          <PasswordStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 'bank':
        return (
          <BankDetailsStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 'support':
        return (
          <SupportGroupStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 'completion':
        return <CompletionStep data={onboardingData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-poppins bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Onboarding</h1>
              <p className="text-sm text-gray-600 mt-1">
                {onboardingData.designation} Registration
              </p>
            </div>
            <img
              src="/obidientLogo.svg"
              alt="Obidient Movement"
              className="h-12"
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
          }
        >
          {renderStep()}
        </Suspense>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2025 Obidient Movement. All rights reserved.</p>
          <p className="mt-2">Need help? Contact your coordinator or email support@obidients.com</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
