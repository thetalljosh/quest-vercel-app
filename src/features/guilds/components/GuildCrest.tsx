import type { GuildCrestPreset } from "@/shared/lib/constants";

const PRESET_STYLES: Record<GuildCrestPreset, { symbol: string; classes: string }> = {
  lion: {
    symbol: "♛",
    classes: "from-amber-300 via-amber-500 to-amber-700 text-amber-950",
  },
  phoenix: {
    symbol: "✶",
    classes: "from-red-300 via-orange-500 to-rose-700 text-rose-950",
  },
  raven: {
    symbol: "✦",
    classes: "from-slate-300 via-slate-500 to-slate-700 text-slate-100",
  },
  oak: {
    symbol: "❖",
    classes: "from-emerald-300 via-emerald-500 to-green-700 text-green-950",
  },
  wolf: {
    symbol: "✧",
    classes: "from-blue-300 via-blue-500 to-indigo-700 text-indigo-50",
  },
};

export function GuildCrest({
  preset,
  size = "md",
}: {
  preset: GuildCrestPreset;
  size?: "xs" | "sm" | "md";
}) {
  const style = PRESET_STYLES[preset];
  const sizeClasses =
    size === "xs"
      ? "h-4 w-4 text-[10px]"
      : size === "sm"
        ? "h-7 w-7 text-xs"
        : "h-10 w-10 text-sm";

  return (
    <span
      className={`inline-flex ${sizeClasses} items-center justify-center rounded-md border border-[var(--border)] bg-gradient-to-br ${style.classes} shadow-sm`}
      aria-label={`${preset} crest`}
      title={`${preset} crest`}
    >
      {style.symbol}
    </span>
  );
}
