import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import Toast from "../../components/Toast.js";
import { loginUser, verify2FALogin, resendVerificationEmail } from "../../services/authService.js";
import Login2FAModal from "../../components/modals/Login2FAModal.js";
import { useUserContext } from "../../context/UserContext.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const { profile, isLoading, refreshProfile } = useUserContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // 2FA
  const [loginToken, setLoginToken] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);

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

      // Wait a small moment to allow state propagation
      setTimeout(() => {
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

  const handle2FAVerification = async (code: string) => {
    setIsLoginLoading(true);
    try {
      await verify2FALogin(loginToken, code);
      displayToast("Login successful!", "success");
      setShow2FAModal(false);
      await refreshProfile();
      setTimeout(() => navigate("/dashboard"), 200);
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
