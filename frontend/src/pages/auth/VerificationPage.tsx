import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { verifyEmailCode, resendVerificationEmail } from "../../services/authService";
import { useUserContext } from "../../context/UserContext";
import Toast from "../../components/Toast";

const CODE_LENGTH = 6;

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshProfile } = useUserContext();

  const email = (location.state as any)?.email || "";
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If no email was passed, show a fallback with manual email entry
  const [manualEmail, setManualEmail] = useState("");
  const activeEmail = email || manualEmail;

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const code = digits.join("");
  const isCodeComplete = code.length === CODE_LENGTH;

  const handleVerify = async () => {
    if (!activeEmail) {
      setToast({ message: "Please enter your email address.", type: "error" });
      return;
    }
    if (!isCodeComplete) return;

    setIsVerifying(true);
    try {
      await verifyEmailCode(activeEmail, code);
      setToast({ message: "Email verified successfully!", type: "success" });
      await refreshProfile();
      setTimeout(() => navigate("/dashboard", { replace: true }), 800);
    } catch (err: any) {
      setToast({ message: err.message || "Verification failed.", type: "error" });
      // Clear inputs on error
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!activeEmail || cooldown > 0) return;
    setIsResending(true);
    try {
      await resendVerificationEmail(activeEmail);
      setToast({ message: "A new code has been sent to your email.", type: "success" });
      setCooldown(60);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setToast({ message: err.message || "Failed to resend code.", type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when all digits filled
  useEffect(() => {
    if (isCodeComplete && activeEmail && !isVerifying) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-[450px] w-full gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Verify your email
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {activeEmail ? (
            <>We sent a 6-digit code to <span className="font-medium text-gray-700 dark:text-gray-200">{activeEmail}</span></>
          ) : (
            "Enter your email and the 6-digit code we sent you."
          )}
        </p>
      </div>

      {/* Manual email input if not passed via state */}
      {!email && (
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#006837] focus:border-[#006837] transition"
          />
        </div>
      )}

      {/* OTP Input */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-xl font-semibold border rounded-lg transition-all duration-150
              ${digit
                ? "border-[#006837] bg-[#006837]/5 dark:bg-[#006837]/10"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              }
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-[#006837] focus:border-[#006837]`}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!isCodeComplete || isVerifying || !activeEmail}
        className={`w-full py-3 rounded-lg text-white font-medium transition-all duration-150
          ${!isCodeComplete || isVerifying || !activeEmail
            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
            : "bg-[#006837] hover:bg-[#00592e] active:scale-[0.98]"
          }`}
      >
        {isVerifying ? "Verifying…" : "Verify Email"}
      </button>

      {/* Resend */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Didn't get the code?{" "}
          {cooldown > 0 ? (
            <span className="text-gray-400">Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending || !activeEmail}
              className="text-[#006837] font-medium hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending…" : "Resend Code"}
            </button>
          )}
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Check your spam folder if you don't see it.
        </p>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Wrong email?{" "}
        <Link to="/auth/get-started" className="text-[#006837] font-medium hover:underline">
          Go back
        </Link>
      </p>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default VerificationPage;
