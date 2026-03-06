"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";
import { QuestLogView } from "@/features/quests/components/QuestLogView";
import type { Quest } from "@/features/quests/types";
import type { QuestStatus } from "@/shared/lib/constants";

interface QuestLogWrapperProps {
  initialQuests: Quest[];
  moveAction: (questId: string, newStatus: QuestStatus) => Promise<void>;
}

type OptimisticUpdate = { questId: string; newStatus: QuestStatus };
type QuestView = "log" | "kanban";
const STORAGE_KEY = "quest-view";

export function QuestLogWrapper({
  initialQuests,
  moveAction,
}: QuestLogWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<QuestView>("log");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "log" || stored === "kanban") {
      setView(stored);
    }
  }, []);

  const [quests, addOptimistic] = useOptimistic<Quest[], OptimisticUpdate>(
    initialQuests,
    (state, { questId, newStatus }) =>
      state.map((quest) =>
        quest.id === questId ? { ...quest, status: newStatus } : quest
      )
  );

  function handleMoveQuest(questId: string, newStatus: QuestStatus) {
    addOptimistic({ questId, newStatus });
    startTransition(async () => {
      await moveAction(questId, newStatus);
    });
  }

  return (
    <section className={isPending ? "opacity-80" : ""}>
      <div className="mb-3 flex items-center justify-end gap-2 text-xs uppercase tracking-wider">
        <button
          type="button"
          onClick={() => {
            setView("log");
            localStorage.setItem(STORAGE_KEY, "log");
          }}
          className={`rounded-md border px-3 py-1.5 font-semibold ${
            view === "log"
              ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-text)]"
              : "border-[var(--border)] text-[var(--muted-text)]"
          }`}
        >
          📜 Quest Log
        </button>
        <button
          type="button"
          onClick={() => {
            setView("kanban");
            localStorage.setItem(STORAGE_KEY, "kanban");
          }}
          className={`rounded-md border px-3 py-1.5 font-semibold ${
            view === "kanban"
              ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-text)]"
              : "border-[var(--border)] text-[var(--muted-text)]"
          }`}
        >
          📋 Kanban
        </button>
      </div>

      {view === "log" ? (
        <QuestLogView quests={quests} onMoveQuest={handleMoveQuest} />
      ) : (
        <KanbanBoard quests={quests} onMoveQuest={handleMoveQuest} />
      )}
    </section>
  );
}
