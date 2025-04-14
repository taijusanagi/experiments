// context/ThemeContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";

interface ThemeContextProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage or default to true (dark mode)
  // Use a function for useState initializer to run localStorage check only once
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      // Check for system preference if no saved mode
      if (savedMode === null) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return savedMode === "true";
    }
    return true; // Default server-side or if window is undefined initially
  });

  useEffect(() => {
    // Apply class to body and save preference to localStorage
    if (typeof window !== "undefined") {
      document.body.classList.remove(darkMode ? "light" : "dark");
      document.body.classList.add(darkMode ? "dark" : "light");
      localStorage.setItem("darkMode", String(darkMode));
    }
  }, [darkMode]);

  // Ensure toggle function has stable identity
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => !prevMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
