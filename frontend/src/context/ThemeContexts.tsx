import { createContext, useState, useContext, ReactNode, useEffect } from "react";

// Define the type
type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined
);


type childrenProps = {
  children: ReactNode;
};


export const ThemeProvider = ({ children }: childrenProps) => {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [])


  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Update the document class to match the theme
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

