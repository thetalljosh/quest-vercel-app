"use client";

import { useEffect, useMemo, useState } from "react";
import type { Quest } from "@/features/quests/types";
import { formatDate } from "@/shared/lib/utils";
import {
  KANBAN_CLOSED_COLUMNS,
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

type QuestLogTab = "current" | "archive";

export function QuestLogView({ quests, onMoveQuest }: QuestLogViewProps) {
  const [activeTab, setActiveTab] = useState<QuestLogTab>("current");
  const [selectedId, setSelectedId] = useState<string | null>(quests[0]?.id ?? null);

  const sortedQuests = useMemo(
    () => [...quests].sort((a, b) => b.xpReward - a.xpReward),
    [quests]
  );

  const filteredQuests = useMemo(() => {
    if (activeTab === "archive") {
      return sortedQuests.filter((quest) => KANBAN_CLOSED_COLUMNS.includes(quest.status));
    }
    return sortedQuests.filter((quest) => !KANBAN_CLOSED_COLUMNS.includes(quest.status));
  }, [activeTab, sortedQuests]);

  useEffect(() => {
    if (!filteredQuests.length) {
      setSelectedId(null);
      return;
    }

    const isSelectedVisible = selectedId
      ? filteredQuests.some((quest) => quest.id === selectedId)
      : false;

    if (!isSelectedVisible) {
      setSelectedId(filteredQuests[0].id);
    }
  }, [filteredQuests, selectedId]);

  const selectedQuest = useMemo(() => {
    if (!selectedId) return filteredQuests[0] ?? null;
    return filteredQuests.find((quest) => quest.id === selectedId) ?? filteredQuests[0] ?? null;
  }, [selectedId, filteredQuests]);

  return (
    <div className="book-shell parchment-card grid min-h-[480px] grid-cols-1 gap-0 overflow-hidden rounded-xl lg:grid-cols-[320px_1fr]">
      <section className="book-page-left parchment-sunken border-r border-[var(--border)] p-4">
        <div className="mb-3 flex items-end gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("current")}
            className={`quest-tab ${activeTab === "current" ? "quest-tab-active" : "opacity-75"}`}
          >
            Current
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("archive")}
            className={`quest-tab ${activeTab === "archive" ? "quest-tab-active" : "opacity-75"}`}
          >
            Archive
          </button>
        </div>

        <h2 className="rpg-heading mb-2 text-lg">Quest Log</h2>
        <div className="ornamental-divider mb-3" />
        <div className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
          {filteredQuests.map((quest) => {
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
                  <span className="truncate pr-2">{QUEST_TYPE_LABELS[quest.questType]}</span>
                  <span>+{quest.xpReward} XP</span>
                </div>
              </button>
            );
          })}
          {filteredQuests.length === 0 && (
            <p className="px-2 py-4 text-sm text-[var(--muted-text)]">
              {activeTab === "archive"
                ? "No archived quests yet."
                : "No current quests yet. Accept a new quest below."}
            </p>
          )}
        </div>
      </section>

      <section className="book-page-right p-5 lg:p-6">
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
