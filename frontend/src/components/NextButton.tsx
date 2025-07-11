import { Link } from "react-router";

export const NextButtonLink = ({ content = "", disabled = false, value = "" }) => {
  return (
    <Link
      className={`flex items-center justify-center bg-accent-green text-white w-full font-bold py-2 px-6 rounded-lg hover:scale-95 duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      onClick={(e) => disabled && e.preventDefault()}
      to={value}
    >
      <span>{content}</span>
    </Link>
  );
};

type NextButtonType = {
  content?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const NextButton = ({
  content = "",
  onClick,
  disabled = false,
  type = "submit",
}: NextButtonType) => {
  return (
    <button
      className={`flex items-center justify-center bg-accent-green text-white w-full font-bold py-3 px-6 rounded-xl hover:scale-95 duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export default NextButton;
