"use client";

import { useState } from "react";
import { useTheme, type ThemeAccent, type ThemeFont } from "@/shared/components/ThemeProvider";

const ACCENTS: Array<{ id: ThemeAccent; label: string; color: string }> = [
  { id: "gold", label: "Gold", color: "#c89022" },
  { id: "crimson", label: "Crimson", color: "#a8352e" },
  { id: "royal", label: "Royal", color: "#3159b9" },
  { id: "emerald", label: "Emerald", color: "#2f8c5a" },
  { id: "amethyst", label: "Amethyst", color: "#7b4aa3" },
];

const FONTS: Array<{ id: ThemeFont; label: string }> = [
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans" },
  { id: "dyslexic", label: "Dyslexic" },
];

export function ThemePanel() {
  const [open, setOpen] = useState(false);
  const { mode, accent, font, toggleMode, setAccent, setFont } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-64 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/95 p-4 shadow-xl backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="rpg-subhead">Display</p>
            <button
              type="button"
              onClick={toggleMode}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-sm"
              aria-label="Toggle light and dark mode"
            >
              {mode === "light" ? "🌙" : "☀️"}
            </button>
          </div>

          <div className="mb-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">Color</p>
            <div className="flex items-center gap-2">
              {ACCENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => setAccent(item.id)}
                  className="h-6 w-6 rounded-full border"
                  style={{
                    backgroundColor: item.color,
                    borderColor: accent === item.id ? "var(--foreground)" : "var(--border)",
                    outline: accent === item.id ? "2px solid var(--foreground)" : "none",
                    outlineOffset: "1px",
                  }}
                  aria-label={`Set ${item.label} accent`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">Font</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {FONTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFont(item.id)}
                  className={`rounded-md border px-2 py-1.5 ${
                    font === item.id
                      ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-text)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/95 text-lg shadow-lg backdrop-blur-sm"
        aria-label="Open display settings"
      >
        ⚙️
      </button>
    </div>
  );
}
