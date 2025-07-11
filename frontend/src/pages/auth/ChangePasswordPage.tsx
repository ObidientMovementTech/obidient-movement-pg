import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import Toast from "../../components/Toast.js";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import validatePassword from "../../utils/validatePassword.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Extract token from query params
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const displayError = (msg: string) => {
    setMessage(msg);
    setToastType("error");
    setShowToast(true);
  };

  useEffect(() => {
    // If no token is provided, either redirect to forgot password page or show an error
    if (!token) {
      setTokenValid(false);
      setMessage("Invalid or missing password reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!token) {
      displayError("Invalid or missing token.");
      setIsLoading(false);
      return;
    }

    const { validPassword, message: pwdMsg, is_ok } = validatePassword(password, confirmPassword);
    if (!is_ok) {
      displayError(pwdMsg);
      setIsLoading(false);
      return;
    }

    try {
      // API call to reset password
      const res = await axios.post(`${API_BASE}/auth/reset-password/${token}`, {
        newPassword: validPassword
      });

      setMessage(res.data.message);
      setToastType("success");
      setShowToast(true);

      // Redirect to login after a short delay
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err: any) {
      displayError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Reset Password</h2>

      {!tokenValid ? (
        <div className="text-red-500 mb-4">
          {message}
          <p className="mt-3">
            <button
              onClick={() => navigate("/auth/forgot-password")}
              className="text-blue-500 hover:underline"
            >
              Request new password reset
            </button>
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between px-4 py-8 max-w-[450px] w-full gap-4"
        >
          {message && (
            <div className={`mb-4 ${toastType === "error" ? "text-red-500" : "text-green-500"}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
              New Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="New Password"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? <EyeSlashIcon className="size-6" /> : <EyeIcon className="size-6" />}
              </button>
            </div>
            <DisplayPasswordRules password={password} />
          </div>

          <div>
            <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`bg-accent-green text-white rounded-lg py-2 ${isLoading ? "opacity-50" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Reset Password"}
          </button>

          {showToast && (
            <Toast message={message} type={toastType} onClose={() => setShowToast(false)} />
          )}
        </form>
      )}
    </div>
  );
}

export default ChangePasswordPage;

function DisplayPasswordRules({ password = "" }) {
  const { is_ok, message } = validatePassword(password, password);
  return (
    <div className="text-black text-sm flex gap-1 items-center py-2">
      {is_ok ? (
        <CheckCircleIcon className="fill-accent-green size-4" />
      ) : (
        <XCircleIcon className="fill-accent-red size-6 text-background-dark" />
      )}
      <p>{message}</p>
    </div>
  );
}