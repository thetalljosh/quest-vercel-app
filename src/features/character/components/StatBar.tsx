interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
}

export function StatBar({
  label,
  value,
  maxValue = 100,
  color,
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted-text)]">{label}</span>
        <span className="text-xs font-bold">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
