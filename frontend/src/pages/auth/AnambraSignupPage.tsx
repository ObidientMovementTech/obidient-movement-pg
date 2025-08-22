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
import { formatPhoneForStorage } from "../../utils/phoneUtils.js";
import ListBoxComp from "../../components/select/ListBox.js";

const AnambraSignupPage = () => {
  const navigate = useNavigate();
  const { profile, isLoading: isAuthLoading } = useUserContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234"); // Default to Nigeria
  const [confirmPassword, setConfirmPassword] = useState("");
  const [votingState] = useState("Anambra"); // Fixed to Anambra
  const [votingLGA, setVotingLGA] = useState("");
  const [votingWard, setVotingWard] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!isAuthLoading && profile) {
      navigate("/dashboard");
    }
  }, [profile, isAuthLoading, navigate]);

  // Get Anambra state data
  const anambraState = statesLGAWardList.find(s => s.state === "Anambra");

  const getLgas = (): OptionType[] => {
    return anambraState ? anambraState.lgas.map((l, i) => ({
      id: i,
      label: formatLocationName(l.lga), // Display formatted name
      value: l.lga // Keep original value for backend
    })) : [];
  };

  const getWards = (lgaName: string): OptionType[] => {
    if (!anambraState) return [];
    const foundLga = anambraState.lgas.find(l => l.lga === lgaName);
    return foundLga ? foundLga.wards.map((w, i) => ({
      id: i,
      label: formatLocationName(w), // Display formatted name
      value: w // Keep original value for backend
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

    if (!votingLGA) {
      displayError("Please select your voting LGA.");
      setIsLoading(false);
      return;
    }

    if (!votingWard) {
      displayError("Please select your voting ward.");
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
        votingState: formatStateName(votingState),
        votingLGA: formatLocationName(votingLGA),
        votingWard: formatLocationName(votingWard),
        isDiaspora: false,
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
      {/* Header with Election Info */}
      <div className="text-left mb-6 relative">
        {/* Candidate Image - Half in, Half out effect */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src="/george-moghalu.jpeg"
              alt="George Moghalu - Gubernatorial Candidate"
              className="w-24 h-24 rounded-full border-4 border-white shadow-2xl object-cover relative z-10 bg-white"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-900 text-white p-6 pt-8 rounded-lg mb-4 relative -mt-12">
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold">Anambra Gubernatorial Election 2025</h2>
            <p className="text-sm text-green-100 mt-1">Register to participate in Anambra State's future</p>
            <p className="text-xs text-green-200 mt-2 font-medium">Supporting George Moghalu</p>
          </div>
        </div>

        <p className="get-started-text text-gray-dark dark:text-gray-100 text-2xl">
          Join the Movement
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Register now to be part of Anambra's democratic process
        </p>
      </div>

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
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 px-3 py-2">
            <ListBoxComp
              defaultSelected={countryCode}
              onChange={(country) => setCountryCode(country.code)}
            />
          </div>
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

      {/* Voting Location Section - Anambra Fixed */}
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Your Voting Location</h3>
          </div>

          {/* Fixed State Display */}
          <div className="mb-4">
            <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
              Voting State
            </label>
            <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed">
              Anambra State
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This registration is specifically for Anambra State residents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormSelect
                label="Voting LGA"
                options={getLgas()}
                defaultSelected={votingLGA}
                onChange={(opt) => {
                  if (opt) {
                    setVotingLGA(opt.value);
                    setVotingWard(''); // Reset ward when LGA changes
                  } else {
                    setVotingLGA('');
                    setVotingWard('');
                  }
                }}
                placeholder="Select your LGA"
              />
            </div>

            <div>
              <FormSelect
                label="Voting Ward"
                options={getWards(votingLGA)}
                defaultSelected={votingWard}
                onChange={(opt) => {
                  setVotingWard(opt ? opt.value : '');
                }}
                disabled={!votingLGA}
                placeholder="Select your ward"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Select your specific voting location in Anambra State
          </p>
        </div>
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
        {isLoading ? "Registering..." : "Register for Anambra Election"}
      </button>

      <div className="text-center">
        <Link
          to="/auth/sign-up"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent-green transition-colors"
        >
          Not an Anambra resident? Use general registration
        </Link>
      </div>

      {showToast && (
        <Toast message={message} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </form>
  );
};

export default AnambraSignupPage;

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
