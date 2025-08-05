import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser, resendVerificationEmail } from '../services/authService';
import FormSelect from './select/FormSelect';
import { statesLGAWardList } from '../utils/StateLGAWard';
import { OptionType } from '../utils/lookups';
import { formatStateName, formatLocationName } from '../utils/textUtils';
import { countryCodes } from '../utils/countryCodes';
import { formatPhoneForStorage } from '../utils/phoneUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  initialTab?: 'login' | 'signup';
  joinCode?: string;
  votingBlocName?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'login',
  joinCode,
  votingBlocName
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [states, setStates] = useState<OptionType[]>([]);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+234', // Default to Nigeria
    votingState: '',
    votingLGA: '',
    isDiaspora: false,
    country: ''
  });

  // Initialize states list
  useEffect(() => {
    const stateOptions = statesLGAWardList.map((s, i) => ({
      id: i,
      label: formatStateName(s.state), // Display formatted name
      value: s.state, // Keep original value for backend
    }));
    setStates(stateOptions);
  }, []);

  const getLgas = (stateName: string): OptionType[] => {
    const found = statesLGAWardList.find(s => s.state === stateName);
    return found ? found.lgas.map((l, i) => ({
      id: i,
      label: formatLocationName(l.lga), // Display formatted name
      value: l.lga // Keep original value for backend
    })) : [];
  };

  const validatePhone = (phone: string): boolean => {
    // Accepts numbers with optional +, dashes, and must be 8-20 digits
    // Updated to not allow spaces since we're preventing them in input
    const phoneRegex = /^\+?[0-9\-]{8,20}$/;
    // Should not contain @ (to prevent emails) or spaces
    return phoneRegex.test(phone) && !phone.includes('@') && !phone.includes(' ');
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResendVerification(false);

    try {
      const result = await loginUser({
        email: loginData.email,
        password: loginData.password
      });

      if (result.success) {
        onAuthSuccess();
      }
    } catch (error: any) {
      console.log('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error types
      if (error.errorType === 'EMAIL_NOT_FOUND') {
        errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
      } else if (error.errorType === 'EMAIL_NOT_VERIFIED') {
        errorMessage = 'Please verify your email address before logging in. Check your inbox for a verification email.';
        setShowResendVerification(true);
      } else if (error.errorType === 'INVALID_PASSWORD') {
        errorMessage = 'Incorrect password. Please check your password and try again.';
      } else if (error.errorType === 'NETWORK_ERROR') {
        errorMessage = 'Connection error. Please check your internet connection and try again.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await resendVerificationEmail(loginData.email);
      setError('Verification email sent! Please check your inbox and spam folder.');
      setShowResendVerification(false);
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!validatePhone(signupData.phone)) {
      setError('Please enter a valid WhatsApp phone number (digits only, no emails).');
      setLoading(false);
      return;
    }

    try {
      // Store voting bloc join intent if provided
      if (joinCode) {
        localStorage.setItem('pending-voting-bloc-join', JSON.stringify({
          joinCode,
          votingBlocName,
          timestamp: new Date().toISOString()
        }));
      }

      // Format phone number for storage (add leading zero for Nigerian numbers)
      const formattedPhone = formatPhoneForStorage(signupData.phone, signupData.countryCode);

      // Prepare registration data
      const registrationData: {
        name: string;
        email: string;
        password: string;
        phone: string;
        countryCode: string;
        votingState?: string;
        votingLGA?: string;
        country?: string;
        isDiaspora?: boolean;
        pendingVotingBlocJoin?: {
          joinCode: string;
          votingBlocName: string;
          timestamp: string;
        };
      } = {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        phone: formattedPhone,
        countryCode: signupData.countryCode,
        // Format location data as Title Case before sending to backend
        votingState: !signupData.isDiaspora && signupData.votingState ? formatStateName(signupData.votingState) : undefined,
        votingLGA: !signupData.isDiaspora && signupData.votingLGA ? formatLocationName(signupData.votingLGA) : undefined,
        country: signupData.isDiaspora ? signupData.country : undefined,
        isDiaspora: signupData.isDiaspora
      };

      // Add pending voting bloc join info if available
      if (joinCode && votingBlocName) {
        registrationData.pendingVotingBlocJoin = {
          joinCode,
          votingBlocName,
          timestamp: new Date().toISOString()
        };
      }

      const result = await registerUser(registrationData);

      // Show success message and switch to login
      setError('');
      setActiveTab('login');
      setLoginData(prev => ({ ...prev, email: signupData.email }));

      // Show success message based on server response
      const successMsg = result.message || 'Registration successful! Please check your email to verify your account, then login.';
      alert(successMsg);
    } catch (error: any) {
      console.log('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error types
      if (error.errorType === 'EMAIL_EXISTS') {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.errorType === 'PHONE_EXISTS') {
        errorMessage = 'An account with this phone number already exists. Please use a different phone number.';
      } else if (error.errorType === 'NETWORK_ERROR') {
        errorMessage = 'Connection error. Please check your internet connection and try again.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'login' ? 'Login' : 'Create Account'}
            </h2>
            {votingBlocName && (
              <p className="text-sm text-gray-600 mt-1">
                Join "{votingBlocName}" voting bloc
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'login'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'signup'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
              {showResendVerification && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    className="text-blue-600 hover:text-blue-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingVerification ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={signupData.countryCode}
                      onChange={(e) => setSignupData(prev => ({ ...prev, countryCode: e.target.value }))}
                      className="w-20 pr-1 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      title="Select country code"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code} title={country.name}>
                          {country.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="tel"
                      required
                      value={signupData.phone}
                      onChange={(e) => {
                        // Remove spaces and non-numeric characters except + and -
                        const cleanValue = e.target.value.replace(/[^\d\-+]/g, '');
                        setSignupData(prev => ({ ...prev, phone: cleanValue }));
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        // Handle paste events to clean the pasted content
                        const pastedText = e.clipboardData.getData('text');
                        const cleanValue = pastedText.replace(/[^\d\-+]/g, '');
                        setSignupData(prev => ({ ...prev, phone: cleanValue }));
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter digits only (spaces are not allowed)
                </p>
              </div>

              {/* Voting Location Section */}
              <div className="space-y-3">
                {/* Diaspora/Foreign User Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDiaspora"
                    checked={signupData.isDiaspora}
                    onChange={(e) => {
                      setSignupData(prev => ({
                        ...prev,
                        isDiaspora: e.target.checked,
                        // Clear opposing fields when switching modes
                        votingState: e.target.checked ? '' : prev.votingState,
                        votingLGA: e.target.checked ? '' : prev.votingLGA,
                        country: e.target.checked ? prev.country : ''
                      }));
                    }}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isDiaspora" className="text-sm text-gray-700">
                    I am a Nigerian in the diaspora or a foreigner
                  </label>
                </div>

                {/* Conditional Rendering: Country or State/LGA */}
                {signupData.isDiaspora ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country of Residence
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your country of residence"
                      value={signupData.country}
                      onChange={(e) => setSignupData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the country where you currently reside
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormSelect
                        label="Voting State"
                        options={states}
                        defaultSelected={signupData.votingState}
                        onChange={(opt) => {
                          if (opt) {
                            setSignupData(prev => ({
                              ...prev,
                              votingState: opt.value,
                              votingLGA: '' // Reset LGA when state changes
                            }));
                          } else {
                            setSignupData(prev => ({
                              ...prev,
                              votingState: '',
                              votingLGA: ''
                            }));
                          }
                        }}
                      />
                    </div>

                    <div>
                      <FormSelect
                        label="Voting LGA"
                        options={getLgas(signupData.votingState)}
                        defaultSelected={signupData.votingLGA}
                        onChange={(opt) => {
                          setSignupData(prev => ({
                            ...prev,
                            votingLGA: opt ? opt.value : ''
                          }));
                        }}
                        disabled={!signupData.votingState}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our terms of service and privacy policy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
