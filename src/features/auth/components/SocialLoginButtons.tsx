"use client";

import { signInWithProvider } from "@/features/auth/actions";

const PROVIDERS = [
  { id: "google", label: "Google", icon: "🌐" },
  { id: "github", label: "GitHub", icon: "🐙" },
] as const;

export function SocialLoginButtons() {
  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => signInWithProvider(id)}
          className="parchment-sunken flex items-center justify-center gap-2 rounded-lg
                     px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors"
        >
          <span>{icon}</span>
          Continue with {label}
        </button>
      ))}
    </div>
  );
}
