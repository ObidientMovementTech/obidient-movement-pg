import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Toast from "../../components/Toast.js";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";
import validatePassword from "../../utils/validatePassword.js";
import { getRecaptchaToken } from "../../utils/recaptcha.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const recaptchaToken = await getRecaptchaToken('forgot_password');
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending reset code");
      showMessage("A verification code has been sent to your email.", "success");
      setStep("otp");
      setCooldown(60);
    } catch (err: any) {
      showMessage(err.message || "Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      showMessage("A new code has been sent to your email.", "success");
      setCooldown(60);
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
    } catch {
      showMessage("Failed to resend code", "error");
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  // Step 2: Verify OTP was entered, move to password step
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      showMessage("Please enter the full 6-digit code", "error");
      return;
    }
    setStep("password");
  };

  // Step 3: Reset password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { validPassword, message: pwdMsg, is_ok } = validatePassword(password, confirmPassword);
    if (!is_ok) {
      showMessage(pwdMsg, "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: otp.join(""), newPassword: validPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      showMessage("Password reset successful! Redirecting to login...", "success");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err: any) {
      showMessage(err.message || "Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between px-4 py-8 max-w-[450px] w-full gap-4">
      <p className="text-gray-dark dark:text-gray-100 text-2xl">
        {step === "email" && "Forgot Password"}
        {step === "otp" && "Enter Verification Code"}
        {step === "password" && "Set New Password"}
      </p>

      {step === "email" && (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email address and we'll send you a verification code.
          </p>
          <div>
            <label className="block text-dark dark:text-gray-100 mb-2 text-sm">Email</label>
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
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We sent a 6-digit code to <strong>{email}</strong>. Check your inbox and spam folder.
          </p>
          <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:border-accent-green focus:outline-none"
              />
            ))}
          </div>
          <button
            type="submit"
            className="bg-accent-green text-white rounded-lg p-2"
            disabled={otp.join("").length !== 6}
          >
            Verify Code
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-sm text-accent-green hover:underline disabled:text-gray-400"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <div>
            <label className="block text-dark dark:text-gray-100 mb-2 text-sm">New Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <EyeSlashIcon className="size-6" /> : <EyeIcon className="size-6" />}
              </button>
            </div>
            <DisplayPasswordRules password={password} />
          </div>
          <div>
            <label className="block text-dark dark:text-gray-100 mb-2 text-sm">Confirm Password</label>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-[#00123A10] dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              required
            />
          </div>
          <button
            type="submit"
            className={`bg-accent-green text-white rounded-lg p-2 ${loading ? "opacity-50" : ""}`}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {showToast && (
        <Toast message={message} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}

function DisplayPasswordRules({ password = "" }: { password: string }) {
  const { is_ok, message } = validatePassword(password, password);
  return (
    <div className="text-black dark:text-gray-300 text-sm flex gap-1 items-center py-2">
      {is_ok ? (
        <CheckCircleIcon className="fill-accent-green size-4" />
      ) : (
        <XCircleIcon className="fill-accent-red size-6 text-background-dark" />
      )}
      <p>{message}</p>
    </div>
  );
}
