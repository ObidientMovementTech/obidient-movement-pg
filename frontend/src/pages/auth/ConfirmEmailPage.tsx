import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Toast from "../../components/Toast.js";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ConfirmEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Check if we have query parameters indicating email was already confirmed
    const urlParams = new URLSearchParams(window.location.search);
    const emailVerified = urlParams.get('emailVerified');
    const error = urlParams.get('error');

    if (emailVerified === 'true') {
      setMessage("Email confirmed successfully! You are now logged in.");
      setToastType("success");
      setShowToast(true);

      // Redirect to dashboard after showing success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      return;
    }

    if (error === 'invalid_token') {
      setMessage("Invalid or expired confirmation link.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Only make API call if we have a token and no query params
    if (!token) return;

    axios
      .get(`${API_BASE}/auth/confirm-email/${token}`, { withCredentials: true })
      .then((res) => {
        setMessage(res.data?.message || "Email confirmed successfully!");
        setToastType("success");
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message || "Invalid or expired confirmation link.";
        setMessage(msg);
        setToastType("error");
      })
      .finally(() => setShowToast(true));
  }, [token, navigate]);

  return (
    <div className="flex flex-col justify-center items-center px-4 py-8 max-w-[450px] w-full gap-6 font-host">
      <h2 className="text-2xl font-medium dark:text-white text-gray-800">
        Email Confirmation
      </h2>

      {showToast && (
        <Toast
          message={message}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {toastType === "success" && (
        <button
          onClick={() => navigate("/auth/login")}
          className="text-accent-green underline text-sm hover:text-accent-green/80"
        >
          Proceed to Login
        </button>
      )}
    </div>
  );
}
