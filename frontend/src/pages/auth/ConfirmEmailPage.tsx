import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Toast from "../../components/Toast.js";
import { useUser } from "../../context/UserContext.js";
import { joinVotingBloc } from "../../services/votingBlocService.js";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ConfirmEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refreshProfile } = useUser();

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let hasProcessed = false;

    const processEmailConfirmation = async () => {
      if (hasProcessed) return;
      hasProcessed = true;

      // Check if we have query parameters indicating email was already confirmed
      const urlParams = new URLSearchParams(window.location.search);
      const emailVerified = urlParams.get('emailVerified');
      const error = urlParams.get('error');
      const joinCode = urlParams.get('joinCode');
      const autoJoin = urlParams.get('autoJoin');

      // Handle URL parameter scenarios (redirected from server)
      if (emailVerified === 'true') {
        await handleSuccessfulConfirmation({
          joinCode: joinCode,
          autoJoin: autoJoin === 'true'
        });
        return;
      }

      if (error === 'invalid_token') {
        setMessage("Invalid or expired confirmation link.");
        setToastType("error");
        setShowToast(true);
        return;
      }

      if (error === 'user_not_found') {
        setMessage("User not found. Please register again.");
        setToastType("error");
        setShowToast(true);
        return;
      }

      // If we have a token but no query params, user clicked the email link
      // Make API call to confirm email
      if (token && token !== 'invalid') {
        handleEmailConfirmation();
      }
    };

    processEmailConfirmation();
  }, [token]); // Only depend on token

  // Unified function to handle successful confirmation with or without voting bloc join
  const handleSuccessfulConfirmation = async (params: {
    joinCode?: string | null;
    autoJoin?: boolean;
  }) => {
    setMessage("Email confirmed successfully! You are now logged in.");
    setToastType("success");
    setShowToast(true);

    // Refresh user profile to get updated auth state
    await refreshProfile();

    // Handle auto-join if there's a pending voting bloc join
    if (params.joinCode && params.autoJoin) {
      setMessage("Email confirmed! Joining voting bloc...");
      setToastType("success");
      setShowToast(true);

      try {
        await joinVotingBloc(params.joinCode);
        console.log('✅ Successfully joined voting bloc:', params.joinCode);

        setMessage("Success! Taking you to the voting bloc page...");

        setTimeout(() => {
          navigate(`/voting-bloc/${params.joinCode}`, { replace: true });
        }, 500);
      } catch (joinError) {
        console.error('Failed to join voting bloc:', joinError);
        setMessage("Email confirmed but failed to join voting bloc. You can join manually from your dashboard.");
        setToastType("error");
        setShowToast(true);

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      }
    } else {
      // No pending voting bloc, redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    }
  };

  const handleEmailConfirmation = async () => {
    if (isProcessing) return; // Prevent multiple calls

    setIsProcessing(true);
    setMessage("Confirming your email...");
    setToastType("success");
    setShowToast(true);

    try {
      // Make API call to confirm email using POST with token in body
      const response = await axios.post(`${API_BASE}/auth/confirm-email`,
        { token },
        { withCredentials: true }
      );

      const { pendingVotingBlocJoin } = response.data;

      // Use the unified function to handle the rest
      await handleSuccessfulConfirmation({
        joinCode: pendingVotingBlocJoin?.joinCode,
        autoJoin: true // If there's a pending join, we want to auto-join
      });

    } catch (err: any) {
      console.error('Email confirmation error:', err);
      const errorMessage = err?.response?.data?.message || "Invalid or expired confirmation link.";
      setMessage(errorMessage);
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 py-8 max-w-[450px] w-full gap-6 font-host">
      <h2 className="text-2xl font-medium dark:text-white text-gray-800">
        Email Confirmation
      </h2>

      {isProcessing && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent-green border-t-transparent"></div>
          <span>Processing confirmation...</span>
        </div>
      )}

      {showToast && (
        <Toast
          message={message}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {toastType === "success" && !isProcessing && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {message.includes("voting bloc") ?
              "Taking you to the voting bloc page..." :
              "Taking you to your dashboard..."}
          </p>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="text-accent-green underline text-sm hover:text-accent-green/80"
          >
            Go to Dashboard Now
          </button>
        </div>
      )}

      {toastType === "error" && !isProcessing && (
        <button
          onClick={() => navigate("/auth/login", { replace: true })}
          className="text-accent-green underline text-sm hover:text-accent-green/80"
        >
          Go to Login
        </button>
      )}
    </div>
  );
}