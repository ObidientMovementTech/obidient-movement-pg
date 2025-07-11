import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useTheme } from "../../context/ThemeContexts.tsx";

const ToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  
  if (theme === "dark") {
    return (
      <button
        onClick={toggleTheme}
        className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3  hover:bg-black/10 duration-300 delay-100 dark:text-text-dark dark:hover:bg-white/10 text-text-light"
      >
        <SunIcon className="size-4  fill-accent-green" />
        Light
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3  hover:bg-black/10 duration-300 delay-100 dark:text-text-dark dark:hover:bg-white/10 text-text-light"
    >
      <MoonIcon className="w-4 h-4 fill-accent-green" />
      Dark
    </button>
  );
};

export default ToggleButton;
