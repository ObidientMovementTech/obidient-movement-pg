import React from "react";

type BackButtonType = {
  content?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const BackButton = ({
  content = "Back",
  onClick,
  disabled = false,
  type = "button"
}: BackButtonType) => {
  return (
    <button
      className={`flex items-center justify-center border border-gray-300 bg-white text-gray-700 w-full font-medium py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export default BackButton;
