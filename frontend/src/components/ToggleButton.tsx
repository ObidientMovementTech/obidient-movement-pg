// import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContexts";

const ToggleButton = () => {
  const {toggleTheme } = useTheme();  
  return (
    
      <button
        onClick={toggleTheme}
        className={`w-16 h-6 flex items-center rounded-full p-1 transition-colors duration-300 bg-primary-light  bg-secondary-dark`}
      >
        <div className={` flex justify-between relative w-full`}>
          <div className="w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-background-light dark:bg-bg-secondary-dark dark:translate-x-10 absolute"></div>
          <MoonIcon className="w-4 h-4 text-white" />
          <SunIcon className="w-4 h-4 text-white" />
        </div>
      </button>
  );
};

export default ToggleButton;
