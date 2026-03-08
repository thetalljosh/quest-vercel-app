import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import Link from "next/link";
import { MobileNav } from "@/shared/components/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const displayName = session.user.name ?? session.user.email;

  return (
    <div className="min-h-screen">
      <nav className="rpg-nav relative px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Logo — always visible */}
          <Link href="/quests" className="rpg-heading text-lg text-[var(--accent)] md:text-xl">
            ⚔️ QuestLog
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-5 md:flex">
            <NavLink href="/quests">Quests</NavLink>
            <NavLink href="/character">Character</NavLink>
            <NavLink href="/guilds">Guilds</NavLink>
          </div>

          {/* Desktop user info */}
          <div className="hidden items-center gap-3 md:flex">
            <span className="max-w-[160px] truncate text-sm text-[var(--muted-text)]">
              {displayName}
            </span>
            <SignOutButton />
          </div>

          {/* Mobile hamburger */}
          <MobileNav displayName={displayName ?? ""} />
        </div>
        <div className="mx-auto mt-2 max-w-6xl md:mt-3">
          <div className="ornamental-divider" />
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)]/80 px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent-muted)] hover:text-[var(--accent-text)]"
    >
      {children}
    </Link>
  );
}
