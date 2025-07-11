import { useState } from "react";
import Toast from "../../components/Toast.js";
// import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  // const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending reset email");

      setMessage(data.message);
      setToastType("success");
    } catch (err: any) {
      setMessage(err.message || "Server error");
      setToastType("error");
    } finally {
      setShowToast(true);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between px-4 py-8 max-w-[450px] w-full gap-4"
    >
      <p className="text-gray-dark dark:text-gray-100 text-2xl">
        Forgot Password
      </p>
      <div>
        <label className="block text-dark dark:text-gray-100 mb-2 text-sm">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-accent-green text-white rounded-lg p-2"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      {showToast && (
        <Toast message={message} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </form>
  );
}
