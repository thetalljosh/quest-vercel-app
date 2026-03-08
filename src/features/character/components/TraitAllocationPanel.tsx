"use client";

import { useMemo, useState } from "react";
import {
  STAT_COLORS,
  STAT_LABELS,
  STAT_NAMES,
  type StatName,
} from "@/shared/lib/constants";

interface TraitAllocationPanelProps {
  availablePoints: number;
  title: string;
  description?: string;
  submitLabel: string;
  requireExactAllocation?: boolean;
  action: (formData: FormData) => void | Promise<void>;
}

type AllocationState = Record<StatName, number>;

const EMPTY_ALLOCATION: AllocationState = {
  stamina: 0,
  intellect: 0,
  willpower: 0,
  charisma: 0,
  curiosity: 0,
  perception: 0,
};

export function TraitAllocationPanel({
  availablePoints,
  title,
  description,
  submitLabel,
  requireExactAllocation = false,
  action,
}: TraitAllocationPanelProps) {
  const [allocation, setAllocation] = useState<AllocationState>(EMPTY_ALLOCATION);

  const spent = useMemo(
    () => STAT_NAMES.reduce((sum, stat) => sum + allocation[stat], 0),
    [allocation]
  );

  const remaining = availablePoints - spent;
  const canSubmit = requireExactAllocation
    ? remaining === 0
    : spent > 0 && remaining >= 0;

  function adjustStat(stat: StatName, delta: number) {
    setAllocation((current) => {
      const nextValue = current[stat] + delta;
      if (nextValue < 0) return current;

      const nextSpent =
        STAT_NAMES.reduce((sum, key) => sum + current[key], 0) - current[stat] + nextValue;

      if (nextSpent > availablePoints) {
        return current;
      }

      return {
        ...current,
        [stat]: nextValue,
      };
    });
  }

  return (
    <div className="parchment-card rounded-xl p-5">
      <h2 className="rpg-heading text-xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-[var(--muted-text)]">{description}</p>}
      <div className="ornamental-divider my-3" />

      <p className="mb-4 text-sm font-semibold text-[var(--accent)]">
        Points Remaining: {remaining}
      </p>

      <form action={action} className="space-y-3">
        {STAT_NAMES.map((stat) => (
          <div
            key={stat}
            className="parchment-sunken flex items-center justify-between rounded-lg px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold">{STAT_LABELS[stat]}</p>
              <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-sunken)]">
                <div
                  className={`h-full ${STAT_COLORS[stat]}`}
                  style={{ width: `${Math.min((allocation[stat] / Math.max(availablePoints, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustStat(stat, -1)}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
                disabled={allocation[stat] <= 0}
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm font-bold">{allocation[stat]}</span>
              <button
                type="button"
                onClick={() => adjustStat(stat, 1)}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
                disabled={remaining <= 0}
              >
                +
              </button>
            </div>
            <input type="hidden" name={stat} value={allocation[stat]} readOnly />
          </div>
        ))}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rpg-button mt-2 w-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
