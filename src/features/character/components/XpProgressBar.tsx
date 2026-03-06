interface XpProgressBarProps {
  currentXp: number;
  nextLevelXp: number;
}

export function XpProgressBar({ currentXp, nextLevelXp }: XpProgressBarProps) {
  const percentage = nextLevelXp > 0
    ? Math.min((currentXp / nextLevelXp) * 100, 100)
    : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--muted-text)]">Experience</span>
        <span className="text-[var(--muted-text)]">
          {currentXp} / {nextLevelXp} XP
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
