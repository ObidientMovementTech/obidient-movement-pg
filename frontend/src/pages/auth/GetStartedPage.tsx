import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import Toast from "../../components/Toast.js";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";
import validatePassword from "../../utils/validatePassword.js";
import { registerUser } from "../../services/authService.js";
import { useUserContext } from "../../context/UserContext.js";
import FormSelect from "../../components/select/FormSelect.js";
import { statesLGAWardList } from "../../utils/StateLGAWard.js";
import { OptionType } from "../../utils/lookups.js";
import { formatStateName, formatLocationName } from "../../utils/textUtils.js";
import { countryCodes } from "../../utils/countryCodes.js";
import { formatPhoneForStorage } from "../../utils/phoneUtils.js";

const GetStartedPage = () => {
  const navigate = useNavigate();
  const { profile, isLoading: isAuthLoading } = useUserContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234"); // Default to Nigeria
  const [confirmPassword, setConfirmPassword] = useState("");
  const [votingState, setVotingState] = useState("");
  const [votingLGA, setVotingLGA] = useState("");
  const [isDiaspora, setIsDiaspora] = useState(false);
  const [country, setCountry] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<OptionType[]>([]);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!isAuthLoading && profile) {
      // Check if there's a cause code to redirect to
      const causeCode = localStorage.getItem('support-cause-code');
      if (causeCode) {
        localStorage.removeItem('support-cause-code');
        navigate(`/cause/${causeCode}`);
      } else {
        navigate("/dashboard");
      }
    }
  }, [profile, isAuthLoading, navigate]);

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const validatePhone = (phone: string): boolean => {
    // Accepts numbers with optional +, spaces, dashes, and must be 8-20 digits
    // But now we're preventing spaces from being entered, so update validation
    const phoneRegex = /^\+?[0-9\-]{8,20}$/;
    // Should not contain @ (to prevent emails) or spaces
    return phoneRegex.test(phone) && !phone.includes('@') && !phone.includes(' ');
  };

  const displayError = (msg: string) => {
    setMessage(msg);
    setToastType("error");
    setShowToast(true);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);


    if (!validateEmail(email)) {
      displayError("Invalid email address format.");
      setIsLoading(false);
      return;
    }

    if (!validatePhone(phone)) {
      displayError("Please enter a valid WhatsApp phone number (digits only, no emails).");
      setIsLoading(false);
      return;
    }

    const { validPassword, message: pwdMessage, is_ok } = validatePassword(password, confirmPassword);
    if (!is_ok) {
      displayError(pwdMessage);
      setIsLoading(false);
      return;
    }

    try {
      // Format phone number for storage (add leading zero for Nigerian numbers)
      const formattedPhone = formatPhoneForStorage(phone, countryCode);

      const result = await registerUser({
        name,
        email,
        phone: formattedPhone,
        countryCode,
        password: validPassword,
        votingState: !isDiaspora && votingState ? formatStateName(votingState) : undefined,
        votingLGA: !isDiaspora && votingLGA ? formatLocationName(votingLGA) : undefined,
        country: isDiaspora ? country : undefined,
        isDiaspora,
      });

      setMessage(result.message || "Signup successful! Please check your email.");
      setToastType("success");
      setShowToast(true);
      navigate("/auth/verify");
    } catch (error: any) {
      console.log('Registration error:', error);

      // Handle specific error types with detailed messages
      let errorMessage = "Signup failed. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      }

      // Handle validation errors with specific field information
      if (error.errorType === 'VALIDATION_ERROR' && error.fieldErrors) {
        const fieldMessages = [];

        if (error.fieldErrors.email) {
          fieldMessages.push("Email: " + error.fieldErrors.email.join(', '));
        }
        if (error.fieldErrors.phone) {
          fieldMessages.push("Phone: " + error.fieldErrors.phone.join(', '));
        }
        if (error.fieldErrors.password) {
          fieldMessages.push("Password: " + error.fieldErrors.password.join(', '));
        }
        if (error.fieldErrors.name) {
          fieldMessages.push("Name: " + error.fieldErrors.name.join(', '));
        }

        if (fieldMessages.length > 0) {
          errorMessage = fieldMessages.join('\n');
        }
      }
      // Add specific handling for common error types
      else if (error.errorType === 'EMAIL_EXISTS') {
        errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
      } else if (error.errorType === 'PHONE_EXISTS') {
        errorMessage = "An account with this phone number already exists. Please use a different phone number.";
      } else if (error.errorType === 'NETWORK_ERROR') {
        errorMessage = "Connection error. Please check your internet connection and try again.";
      }

      displayError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-8 max-w-[450px] w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto"></div>
          <p className="text-gray-600 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSignUp}
      className="flex flex-col justify-between px-4 py-8 max-w-[450px] w-full gap-4"
    >
      <p className="get-started-text text-gray-dark dark:text-gray-100 text-2xl">
        Let's get started
      </p>
      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">Name</label>
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
          Email
        </label>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">WhatsApp Phone Number</label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-20 pr-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm"
            title="Select country code"
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code} title={country.name}>
                {country.code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="Phone Number"
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            value={phone}
            onChange={(e) => {
              // Remove spaces and non-numeric characters except + and -
              const cleanValue = e.target.value.replace(/[^\d\-+]/g, '');
              setPhone(cleanValue);
            }}
            onPaste={(e) => {
              e.preventDefault();
              // Handle paste events to clean the pasted content
              const pastedText = e.clipboardData.getData('text');
              const cleanValue = pastedText.replace(/[^\d\-+]/g, '');
              setPhone(cleanValue);
            }}
            required
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter digits only (spaces are not allowed)
        </p>
      </div>

      {/* Voting Location Section */}
      <div className="space-y-4">
        {/* Diaspora/Foreign User Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isDiaspora"
            checked={isDiaspora}
            onChange={(e) => {
              setIsDiaspora(e.target.checked);
              // Clear voting location fields when switching to diaspora
              if (e.target.checked) {
                setVotingState('');
                setVotingLGA('');
              } else {
                setCountry('');
              }
            }}
            className="h-4 w-4 text-accent-green border-gray-300 rounded focus:ring-accent-green"
          />
          <label htmlFor="isDiaspora" className="text-sm text-gray-700 dark:text-gray-200">
            I am a Nigerian in the diaspora or a foreigner
          </label>
        </div>

        {/* Conditional Rendering: Country or State/LGA */}
        {isDiaspora ? (
          <div>
            <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
              Country of Residence
            </label>
            <input
              type="text"
              placeholder="Enter your country of residence"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the country where you currently reside
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormSelect
                label="Voting State"
                options={states}
                defaultSelected={votingState}
                onChange={(opt) => {
                  if (opt) {
                    setVotingState(opt.value);
                    setVotingLGA(''); // Reset LGA when state changes
                  } else {
                    setVotingState('');
                    setVotingLGA('');
                  }
                }}
              />
            </div>

            <div>
              <FormSelect
                label="Voting LGA"
                options={getLgas(votingState)}
                defaultSelected={votingLGA}
                onChange={(opt) => {
                  setVotingLGA(opt ? opt.value : '');
                }}
                disabled={!votingState}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
          Password
        </label>
        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center"
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? (
              <EyeSlashIcon className="size-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <EyeIcon className="size-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
        <DisplayPasswordRules password={password} />
      </div>

      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>


      </div>
      <p className="account-txt text-dark dark:text-gray-300 text-sm mt-2">
        You already have an account?{' '}
        <Link to="/auth/login" className="underline text-accent-green">
          Log in
        </Link>
      </p>

      <button
        type="submit"
        className={`flex items-center justify-center bg-accent-green text-white w-full font-medium py-2 px-6 rounded-lg hover:scale-95 duration-300 ${isLoading ? "opacity-50" : ""
          }`}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Sign Up"}
      </button>

      {showToast && (
        <Toast message={message} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </form>
  );
};

export default GetStartedPage;

function DisplayPasswordRules({ password = "" }) {
  const { is_ok, message } = validatePassword(password, password);
  return (
    <div className="text-black dark:text-white text-sm flex gap-1 items-center py-2">
      {is_ok ? (
        <CheckCircleIcon className="fill-accent-green size-4" />
      ) : (
        <XCircleIcon className="fill-accent-red size-6 text-background-dark" />
      )}
      <p>{message}</p>
    </div>
  );
}