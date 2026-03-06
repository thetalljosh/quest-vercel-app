"use client";

import { useMemo, useState } from "react";
import type { Quest } from "@/features/quests/types";
import { formatDate } from "@/shared/lib/utils";
import {
  QUEST_STATUS_LABELS,
  QUEST_TYPE_LABELS,
  QUEST_TYPE_ICONS,
  PRIORITY_LABELS,
  type QuestStatus,
} from "@/shared/lib/constants";

interface QuestLogViewProps {
  quests: Quest[];
  onMoveQuest: (questId: string, newStatus: QuestStatus) => void;
}

const STATUS_ACTIONS: QuestStatus[] = [
  "active",
  "in_progress",
  "review",
  "completed",
  "failed",
];

export function QuestLogView({ quests, onMoveQuest }: QuestLogViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(quests[0]?.id ?? null);

  const sortedQuests = useMemo(
    () => [...quests].sort((a, b) => b.xpReward - a.xpReward),
    [quests]
  );

  const selectedQuest = useMemo(() => {
    if (!selectedId) return sortedQuests[0] ?? null;
    return sortedQuests.find((quest) => quest.id === selectedId) ?? sortedQuests[0] ?? null;
  }, [selectedId, sortedQuests]);

  return (
    <div className="parchment-card grid min-h-[480px] grid-cols-1 gap-0 overflow-hidden rounded-xl lg:grid-cols-[320px_1fr]">
      <section className="parchment-sunken border-r border-[var(--border)] p-4">
        <h2 className="rpg-heading mb-2 text-lg">Quest Log</h2>
        <div className="ornamental-divider mb-3" />
        <div className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
          {sortedQuests.map((quest) => {
            const isSelected = selectedQuest?.id === quest.id;
            return (
              <button
                key={quest.id}
                type="button"
                onClick={() => setSelectedId(quest.id)}
                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)]"
                }`}
              >
                <p className="rpg-heading flex items-center gap-1 truncate text-sm">
                  <span className="text-[var(--accent)]">{QUEST_TYPE_ICONS[quest.questType]}</span>
                  {quest.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-[var(--muted-text)]">
                  <span>{QUEST_TYPE_LABELS[quest.questType]}</span>
                  <span>+{quest.xpReward} XP</span>
                </div>
              </button>
            );
          })}
          {sortedQuests.length === 0 && (
            <p className="px-2 py-4 text-sm text-[var(--muted-text)]">
              No quests yet. Accept a new quest below.
            </p>
          )}
        </div>
      </section>

      <section className="p-5 lg:p-6">
        {!selectedQuest ? (
          <p className="text-sm text-[var(--muted-text)]">Select a quest to view details.</p>
        ) : (
          <>
            <h3 className="rpg-heading text-2xl">{selectedQuest.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted-text)]">
              {QUEST_TYPE_LABELS[selectedQuest.questType]} • {PRIORITY_LABELS[selectedQuest.priority]} Priority
              • {QUEST_STATUS_LABELS[selectedQuest.status]}
            </p>

            <div className="ornamental-divider my-4" />

            <p className="min-h-[120px] whitespace-pre-wrap text-[15px] leading-relaxed">
              {selectedQuest.description || "No quest details written yet."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <InfoField label="XP Reward" value={`+${selectedQuest.xpReward}`} />
              <InfoField
                label="Due Date"
                value={selectedQuest.dueDate ? formatDate(selectedQuest.dueDate) : "None"}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {STATUS_ACTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onMoveQuest(selectedQuest.id, status)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                    selectedQuest.status === status
                      ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-text)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {QUEST_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="parchment-sunken rounded-md px-3 py-2">
      <p className="rpg-subhead">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
