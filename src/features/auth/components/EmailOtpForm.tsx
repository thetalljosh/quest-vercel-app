"use client";

import { signInWithEmail } from "@/features/auth/actions";

export function EmailOtpForm() {
  return (
    <form action={signInWithEmail} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-sm font-medium text-[var(--muted-text)]">
        Sign in with email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        placeholder="adventurer@example.com"
        className="rpg-input px-4 py-3"
      />
      <button
        type="submit"
        className="rpg-button px-4 py-3 text-sm"
      >
        Send Magic Link ✉️
      </button>
    </form>
  );
}
