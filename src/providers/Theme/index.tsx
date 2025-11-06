"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

interface ColorThemeContextType {
  colorTheme: string | null;
  setColorTheme: (theme: string | null) => void;
}

const ColorThemeContext = React.createContext<
  ColorThemeContextType | undefined
>(undefined);

export function ColorThemeProvider({
  children,
  defaultColorTheme = null,
  storageKey = "payload-theme",
}: {
  children: React.ReactNode;
  defaultColorTheme?: string | null;
  storageKey?: string;
}) {
  const [colorTheme, setColorThemeState] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  // Handle client-side mounting to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(storageKey);
    setColorThemeState(stored || defaultColorTheme);
  }, [defaultColorTheme, storageKey]);

  // Apply color theme to document
  React.useEffect(() => {
    if (!isClient) return;

    const root = document.documentElement;

    // Apply color theme
    if (colorTheme) {
      root.setAttribute("data-theme", colorTheme);
    } else {
      root.removeAttribute("data-theme");
    }
  }, [colorTheme, isClient]);

  // Save to localStorage
  React.useEffect(() => {
    if (!isClient) return;

    if (colorTheme) {
      localStorage.setItem(storageKey, colorTheme);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [colorTheme, storageKey, isClient]);

  const setColorTheme = React.useCallback((theme: string | null) => {
    setColorThemeState(theme);
  }, []);

  const value = React.useMemo(
    () => ({
      colorTheme,
      setColorTheme,
    }),
    [colorTheme, setColorTheme]
  );

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = React.useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}

export function useTheme() {
  const nextTheme = useNextTheme();
  const colorTheme = useColorTheme();

  return {
    // Next-themes functionality (mode switching)
    theme: nextTheme.theme,
    setTheme: nextTheme.setTheme,
    themes: nextTheme.themes,
    systemTheme: nextTheme.systemTheme,
    resolvedTheme: nextTheme.resolvedTheme,

    // Color theme functionality
    colorTheme: colorTheme.colorTheme,
    setColorTheme: colorTheme.setColorTheme,
  };
}

export function ThemeProvider({
  children,
  defaultColorTheme = "violet",
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & {
  children: React.ReactNode;
  defaultColorTheme?: string;
}) {
  return (
    <NextThemesProvider {...props}>
      <ColorThemeProvider defaultColorTheme={defaultColorTheme}>
        {children}
      </ColorThemeProvider>
    </NextThemesProvider>
  );
}
