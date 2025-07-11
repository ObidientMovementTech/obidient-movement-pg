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

const GetStartedPage = () => {
  const navigate = useNavigate();
  const { profile, isLoading: isAuthLoading } = useUserContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    const { validPassword, message: pwdMessage, is_ok } = validatePassword(password, confirmPassword);
    if (!is_ok) {
      displayError(pwdMessage);
      setIsLoading(false);
      return;
    }

    try {
      await registerUser({
        name,
        email,
        phone,
        password: validPassword,
      });
      setMessage("Signup successful! Please check your email.");
      setToastType("success");
      setShowToast(true);
      navigate("/auth/verify");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Signup failed";
      displayError(msg);
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
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">Phone Number</label>
        <input
          type="tel"
          placeholder="Phone"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
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