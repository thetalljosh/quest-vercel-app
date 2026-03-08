"use client";

import { useMemo, useState } from "react";
import { STAT_LABELS, STAT_NAMES, type StatName } from "@/shared/lib/constants";

interface TraitTotals {
  stamina: number;
  intellect: number;
  willpower: number;
  charisma: number;
  curiosity: number;
  perception: number;
}

interface GuildTraitRadarProps {
  guildName: string;
  memberCount: number;
  totals: TraitTotals;
}

function toPoint(angle: number, radius: number, center = 120) {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function GuildTraitRadar({ guildName, memberCount, totals }: GuildTraitRadarProps) {
  const [mode, setMode] = useState<"sum" | "average">("sum");

  const valuesByStat: Record<StatName, number> = useMemo(() => {
    if (mode === "sum") {
      return totals;
    }

    const divisor = Math.max(memberCount, 1);
    return {
      stamina: Number((totals.stamina / divisor).toFixed(2)),
      intellect: Number((totals.intellect / divisor).toFixed(2)),
      willpower: Number((totals.willpower / divisor).toFixed(2)),
      charisma: Number((totals.charisma / divisor).toFixed(2)),
      curiosity: Number((totals.curiosity / divisor).toFixed(2)),
      perception: Number((totals.perception / divisor).toFixed(2)),
    };
  }, [memberCount, mode, totals]);

  const maxValue = useMemo(() => {
    const values = STAT_NAMES.map((stat) => valuesByStat[stat]);
    return Math.max(1, ...values);
  }, [valuesByStat]);

  const polygonPoints = STAT_NAMES.map((stat, index) => {
    const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / STAT_NAMES.length;
    const normalized = valuesByStat[stat] / maxValue;
    return toPoint(angle, normalized * 78);
  });

  const polygonString = polygonPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="parchment-sunken rounded-lg p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="rpg-heading text-base">{guildName} Traits</p>
          <p className="text-xs text-[var(--muted-text)]">{memberCount} member{memberCount === 1 ? "" : "s"}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("sum")}
            className={`quest-tab ${mode === "sum" ? "quest-tab-active" : ""}`}
          >
            Sum
          </button>
          <button
            type="button"
            onClick={() => setMode("average")}
            className={`quest-tab ${mode === "average" ? "quest-tab-active" : ""}`}
          >
            Average
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[260px_1fr]">
        <svg viewBox="0 0 240 240" className="mx-auto h-60 w-60">
          <circle cx="120" cy="120" r="78" fill="transparent" stroke="var(--border)" strokeDasharray="4 4" />
          <circle cx="120" cy="120" r="52" fill="transparent" stroke="var(--border)" strokeDasharray="4 4" />
          <circle cx="120" cy="120" r="26" fill="transparent" stroke="var(--border)" strokeDasharray="4 4" />

          {STAT_NAMES.map((stat, index) => {
            const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / STAT_NAMES.length;
            const axisEnd = toPoint(angle, 90);
            const labelPos = toPoint(angle, 104);

            return (
              <g key={stat}>
                <line x1="120" y1="120" x2={axisEnd.x} y2={axisEnd.y} stroke="var(--border)" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="var(--muted-text)"
                >
                  {STAT_LABELS[stat]}
                </text>
              </g>
            );
          })}

          <polygon
            points={polygonString}
            fill="color-mix(in srgb, var(--accent) 35%, transparent)"
            stroke="var(--accent)"
            strokeWidth="2"
          />
          {polygonPoints.map((point, index) => (
            <circle
              key={`${STAT_NAMES[index]}-dot`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="var(--accent)"
            />
          ))}
        </svg>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STAT_NAMES.map((stat) => (
            <div key={stat} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm">
              <p className="text-xs text-[var(--muted-text)]">{STAT_LABELS[stat]}</p>
              <p className="font-semibold">{valuesByStat[stat]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
