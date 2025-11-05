import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate, useSearchParams } from "react-router";
import Toast from "../../components/Toast.js";
import { loginUser, verify2FALogin, resendVerificationEmail } from "../../services/authService.js";
import Login2FAModal from "../../components/modals/Login2FAModal.js";
import { useUserContext } from "../../context/UserContext.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const sanitizeRedirect = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { profile, isLoading, refreshProfile } = useUserContext();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);

  // 2FA
  const [loginToken, setLoginToken] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);

  useEffect(() => {
    if (!searchParams.toString()) return;

    const errorParam = searchParams.get("error");
    const statusParam = searchParams.get("status");
    const tempTokenParam = searchParams.get("tempToken");
    const requires2FA = searchParams.get("requires2FA");
    const emailParam = searchParams.get("email");
    const redirectParam = sanitizeRedirect(searchParams.get("redirect"));

    if (errorParam === "google_account_missing") {
      setMessage("We couldn't find an account linked to that Google email. Please sign up first or contact support.");
      setToastType("error");
      setShowToast(true);
    } else if (errorParam === "google_callback_error") {
      setMessage("Google sign-in failed. Please try again.");
      setToastType("error");
      setShowToast(true);
    }

    if (statusParam === "google-linked") {
      setMessage("Google account linked. Enter your verification code to continue.");
      setToastType("success");
      setShowToast(true);
    }

    if (emailParam) {
      setEmail(emailParam);
    }

    if (redirectParam) {
      setPostLoginRedirect(redirectParam);
    } else {
      setPostLoginRedirect(null);
    }

    if (requires2FA === "1" && tempTokenParam) {
      setLoginToken(tempTokenParam);
      setShow2FAModal(true);
      setIsLoginLoading(false);
    }

    setShowResendVerification(false);
    setIsGoogleRedirecting(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && profile) {
      const causeCode = localStorage.getItem("support-cause-code");
      if (causeCode) {
        localStorage.removeItem("support-cause-code");
        navigate(`/cause/${causeCode}`);
      } else {
        navigate("/dashboard");
      }
    }
  }, [profile, isLoading, navigate]);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const displayToast = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await resendVerificationEmail(email);
      displayToast("Verification email sent. Check your inbox.", "success");
      setShowResendVerification(false);
    } catch (error: any) {
      displayToast(error.message || "Failed to resend verification email.", "error");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setShowToast(false);
    setShowResendVerification(false);

    try {
      const res = await loginUser({ email, password });

      if (res.requires2FA) {
        setLoginToken(res.tempToken);
        setShow2FAModal(true);
        setIsLoginLoading(false);
        return;
      }

      displayToast(res.message || "Login successful!", "success");

      // Ensure user context updates before navigating
      await refreshProfile();

      const redirectAfterLogin = postLoginRedirect;
      setPostLoginRedirect(null);

      // Wait a small moment to allow state propagation
      setTimeout(() => {
        if (redirectAfterLogin) {
          if (redirectAfterLogin.startsWith("/cause/")) {
            localStorage.removeItem("support-cause-code");
          }
          navigate(redirectAfterLogin);
          return;
        }
        const causeCode = localStorage.getItem("support-cause-code");
        if (causeCode) {
          localStorage.removeItem("support-cause-code");
          navigate(`/cause/${causeCode}`);
        } else {
          navigate("/dashboard");
        }
      }, 200);
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";

      if (error.errorType === "EMAIL_NOT_FOUND" || error.errorType === "PHONE_NOT_FOUND")
        errorMessage = error.message || "No account found with these credentials.";
      else if (error.errorType === "EMAIL_NOT_VERIFIED") {
        errorMessage = "Please verify your email before logging in.";
        setShowResendVerification(true);
      } else if (error.errorType === "INVALID_PASSWORD")
        errorMessage = "Incorrect password.";
      else if (error.errorType === "NETWORK_ERROR")
        errorMessage = "Network error. Check your connection.";
      else if (error.errorType === "SERVER_ERROR")
        errorMessage = "Server error. Please try again later.";

      displayToast(error.message || errorMessage, "error");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleRedirecting(true);
    setShowToast(false);
    const causeCode = localStorage.getItem("support-cause-code");
    const redirectPath = causeCode ? `/cause/${causeCode}` : "/dashboard";
    const url = new URL(`${API_BASE}/auth/google`);
    url.searchParams.set("redirect", redirectPath);
    window.location.href = url.toString();
  };

  const handle2FAVerification = async (code: string) => {
    setIsLoginLoading(true);
    try {
      await verify2FALogin(loginToken, code);
      displayToast("Login successful!", "success");
      setShow2FAModal(false);
      await refreshProfile();
      const redirectAfterLogin = postLoginRedirect;
      setPostLoginRedirect(null);
      setTimeout(() => {
        if (redirectAfterLogin) {
          if (redirectAfterLogin.startsWith("/cause/")) {
            localStorage.removeItem("support-cause-code");
          }
          navigate(redirectAfterLogin);
          return;
        }
        const causeCode = localStorage.getItem("support-cause-code");
        if (causeCode) {
          localStorage.removeItem("support-cause-code");
          navigate(`/cause/${causeCode}`);
        } else {
          navigate("/dashboard");
        }
      }, 200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid verification code.";
      displayToast(msg, "error");
      setIsLoginLoading(false);
    }
  };

  if (isLoading) {
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
      onSubmit={handleLogin}
      className="flex flex-col justify-between px-4 py-8 max-w-[450px] w-full gap-4 font-host"
    >
      <p className="text-gray-dark dark:text-gray-100 text-2xl">Welcome Back!</p>

      {/* Email or Phone */}
      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">Email or Phone Number</label>
        <input
          type="text"
          placeholder="Email or Phone Number"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="account-txt text-dark dark:text-gray-300 text-sm mt-1">
          You don't have an account?{" "}
          <Link to="/auth/sign-up" className="underline text-accent-green">
            Sign up
          </Link>
        </p>
      </div>

      {/* Password */}
      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">Password</label>
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
        <p className="text-sm mt-1">
          <Link to="/auth/forgot-password" className="underline text-accent-green">
            Forgot password?
          </Link>
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className={`flex items-center justify-center bg-accent-green text-white w-full font-medium py-2 px-6 rounded-lg hover:scale-95 duration-300 ${isLoginLoading ? "opacity-50" : ""
          }`}
        disabled={isLoginLoading}
      >
        {isLoginLoading ? "Loading..." : "Login"}
      </button>

      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span>OR</span>
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isGoogleRedirecting}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
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
        <span className="font-medium">
          {isGoogleRedirecting ? "Redirecting..." : "Continue with Google"}
        </span>
      </button>

      {showToast && (
        <Toast message={message} type={toastType} onClose={() => setShowToast(false)} />
      )}

      {showResendVerification && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="text-blue-600 hover:text-blue-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendingVerification ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}

      <Login2FAModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onVerify={handle2FAVerification}
        isLoading={isLoginLoading}
        email={email}
      />
    </form>
  );
}
