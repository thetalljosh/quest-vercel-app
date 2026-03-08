"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

const NAV_LINKS = [
  { href: "/quests", label: "Quests" },
  { href: "/character", label: "Character" },
  { href: "/guilds", label: "Guilds" },
];

export function MobileNav({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-lg"
        aria-label="Toggle navigation menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 shadow-lg">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rpg-link text-base"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="max-w-[200px] truncate text-sm text-[var(--muted-text)]">
              {displayName}
            </span>
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
