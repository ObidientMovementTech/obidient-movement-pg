import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <button
      onClick={handleBackClick}
      className={`flex items-center rounded-full p-2 dark:border-text-dark bg-accent-green/50 ${className}`}
    >
      <ArrowLeftIcon className="h-5 w-5 dark:text-text-dark" />
      {/* <span className="ml-2">Back</span> */}
    </button>
  );
};

export default BackButton;
