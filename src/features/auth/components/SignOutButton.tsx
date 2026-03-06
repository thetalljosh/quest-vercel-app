import { signOutAction } from "@/features/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm
                   text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
      >
        Sign Out
      </button>
    </form>
  );
}
