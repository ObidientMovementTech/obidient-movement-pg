// src/pages/auth/ResendPage.tsx
import { useState } from "react";
import Toast from "../../components/Toast.js";
// import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ResendPage() {
  // const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email");
      setToastType("error");
      setShowToast(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setMessage(data.message);
      setToastType("success");
    } catch (err: any) {
      setMessage(err.message);
      setToastType("error");
    } finally {
      setShowToast(true);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center p-8 max-w-md mx-auto gap-4">
      <h2 className="text-2xl dark:text-white">Resend Verification Email</h2>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 border rounded-lg"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent-green text-white py-2 rounded-lg w-full"
      >
        {loading ? "Sending..." : "Resend Email"}
      </button>
      {showToast && (
        <Toast
          message={message}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </form>
  );
}
