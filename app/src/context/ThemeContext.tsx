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

// 1. Update Context Props Interface (remove isThemeInitialized)
interface ThemeContextProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// 2. Create the context
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// 3. Define the default theme: ALWAYS LIGHT mode on initial load
const DEFAULT_THEME_IS_DARK = true;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // 4. Initialize state with the default (LIGHT mode)
  const [darkMode, setDarkMode] = useState<boolean>(DEFAULT_THEME_IS_DARK);

  // 5. Simplified Effect: Apply class based on state
  useEffect(() => {
    // This effect runs on the client after initial render and whenever darkMode changes.
    // It ensures the body class matches the current state.
    const bodyClassList = document.documentElement.classList;
    bodyClassList.remove(darkMode ? "light" : "dark");
    bodyClassList.add(darkMode ? "dark" : "light");

    // No localStorage interaction needed.
  }, [darkMode]); // Re-run only when darkMode state changes.

  // 6. Toggle function (no initialization guard needed)
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => !prevMode);
  }, []); // No dependencies needed for this simple toggle

  // 7. Provide the state and toggle function
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 8. Custom hook to use the theme context (uses updated ThemeContextProps)
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
