"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";
import { QuestLogView } from "@/features/quests/components/QuestLogView";
import type { Quest } from "@/features/quests/types";
import { KANBAN_CLOSED_COLUMNS, type QuestStatus } from "@/shared/lib/constants";

interface QuestLogWrapperProps {
  initialQuests: Quest[];
  moveAction: (questId: string, newStatus: QuestStatus) => Promise<void>;
}

type OptimisticUpdate = { questId: string; newStatus: QuestStatus };
type QuestView = "log" | "kanban";
const STORAGE_KEY = "quest-view";
const CLOSED_KEY = "show-closed-kanban";

export function QuestLogWrapper({
  initialQuests,
  moveAction,
}: QuestLogWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<QuestView>("log");
  const [showClosed, setShowClosed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "log" || stored === "kanban") {
      setView(stored);
    }

    const closedStored = localStorage.getItem(CLOSED_KEY);
    if (closedStored === "true") {
      setShowClosed(true);
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
      <div className="mb-3 flex flex-wrap items-end justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setView("log");
            localStorage.setItem(STORAGE_KEY, "log");
          }}
          className={`quest-tab ${
            view === "log"
              ? "quest-tab-active"
              : ""
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
          className={`quest-tab ${
            view === "kanban"
              ? "quest-tab-active"
              : ""
          }`}
        >
          📋 Kanban
        </button>

        {view === "kanban" && (
          <button
            type="button"
            onClick={() => {
              const next = !showClosed;
              setShowClosed(next);
              localStorage.setItem(CLOSED_KEY, String(next));
            }}
            className={`quest-tab ${
              showClosed
                ? "quest-tab-active"
                : ""
            }`}
          >
            {showClosed ? "📕 Hide Closed" : "📖 Show Closed"}
          </button>
        )}
      </div>

      {view === "log" ? (
        <QuestLogView quests={quests} onMoveQuest={handleMoveQuest} />
      ) : (
        <KanbanBoard
          quests={showClosed ? quests : quests.filter((q) => !KANBAN_CLOSED_COLUMNS.includes(q.status))}
          onMoveQuest={handleMoveQuest}
          showClosed={showClosed}
        />
      )}
    </section>
  );
}
