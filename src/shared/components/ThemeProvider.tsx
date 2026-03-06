"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";
export type ThemeAccent = "gold" | "crimson" | "royal" | "emerald" | "amethyst";
export type ThemeFont = "serif" | "sans" | "dyslexic";

const STORAGE_KEYS = {
  mode: "theme-mode",
  accent: "theme-accent",
  font: "theme-font",
} as const;

const DEFAULTS: {
  mode: ThemeMode;
  accent: ThemeAccent;
  font: ThemeFont;
} = {
  mode: "light",
  accent: "gold",
  font: "serif",
};

interface ThemeContextValue {
  mode: ThemeMode;
  accent: ThemeAccent;
  font: ThemeFont;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
  setFont: (font: ThemeFont) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(mode: ThemeMode, accent: ThemeAccent, font: ThemeFont) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.dataset.accent = accent;
  root.dataset.font = font;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULTS.mode);
  const [accent, setAccentState] = useState<ThemeAccent>(DEFAULTS.accent);
  const [font, setFontState] = useState<ThemeFont>(DEFAULTS.font);

  useEffect(() => {
    const storedMode = localStorage.getItem(STORAGE_KEYS.mode) as ThemeMode | null;
    const storedAccent = localStorage.getItem(STORAGE_KEYS.accent) as ThemeAccent | null;
    const storedFont = localStorage.getItem(STORAGE_KEYS.font) as ThemeFont | null;

    const nextMode = storedMode ?? DEFAULTS.mode;
    const nextAccent = storedAccent ?? DEFAULTS.accent;
    const nextFont = storedFont ?? DEFAULTS.font;

    setModeState(nextMode);
    setAccentState(nextAccent);
    setFontState(nextFont);
    applyTheme(nextMode, nextAccent, nextFont);
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    localStorage.setItem(STORAGE_KEYS.mode, nextMode);
    applyTheme(nextMode, accent, font);
  }, [accent, font]);

  const setAccent = useCallback((nextAccent: ThemeAccent) => {
    setAccentState(nextAccent);
    localStorage.setItem(STORAGE_KEYS.accent, nextAccent);
    applyTheme(mode, nextAccent, font);
  }, [mode, font]);

  const setFont = useCallback((nextFont: ThemeFont) => {
    setFontState(nextFont);
    localStorage.setItem(STORAGE_KEYS.font, nextFont);
    applyTheme(mode, accent, nextFont);
  }, [mode, accent]);

  const toggleMode = useCallback(() => {
    const nextMode: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      accent,
      font,
      setMode,
      setAccent,
      setFont,
      toggleMode,
    }),
    [mode, accent, font, setMode, setAccent, setFont, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
