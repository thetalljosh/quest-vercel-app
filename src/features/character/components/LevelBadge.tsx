interface LevelBadgeProps {
  level: number;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]
                     bg-[var(--accent-muted)] px-3 py-1 text-sm font-bold text-[var(--accent-text)]">
      ⚔️ Level {level}
    </span>
  );
}
