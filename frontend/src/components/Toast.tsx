import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set timeout for auto-close
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Add another timeout for the fade-out animation
      setTimeout(() => {
        onClose();
      }, 300); // Match this with the CSS transition duration
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 px-5 py-3 rounded-md shadow-lg flex items-center gap-3 transition-all duration-300 z-50
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        ${type === "success"
          ? "bg-white text-green-800 border-l-4 border-green-500"
          : "bg-white text-red-800 border-l-4 border-red-500"}`}
    >
      {type === "success" ? (
        <CheckCircle className="text-green-500" size={18} />
      ) : (
        <XCircle className="text-red-500" size={18} />
      )}
      <span className="font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className={`ml-4 p-1 rounded-full hover:bg-gray-100
          ${type === "success" ? "text-green-700" : "text-red-700"}`}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
