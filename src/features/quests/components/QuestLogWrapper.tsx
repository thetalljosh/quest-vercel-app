"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";
import { QuestLogView } from "@/features/quests/components/QuestLogView";
import type { Quest } from "@/features/quests/types";
import {
  KANBAN_CLOSED_COLUMNS,
  type QuestPriority,
  type QuestStatus,
  type QuestType,
} from "@/shared/lib/constants";
import { calculateXpReward } from "@/features/character/lib/xpEngine";

interface QuestLogWrapperProps {
  initialQuests: Quest[];
  moveAction: (questId: string, newStatus: QuestStatus) => Promise<number>;
  updateMetaAction: (
    questId: string,
    questType: QuestType,
    priority: QuestPriority
  ) => Promise<void>;
}

type OptimisticUpdate =
  | { kind: "status"; questId: string; newStatus: QuestStatus }
  | {
      kind: "meta";
      questId: string;
      questType: QuestType;
      priority: QuestPriority;
      xpReward: number;
    };
type QuestView = "log" | "kanban";
const STORAGE_KEY = "quest-view";
const CLOSED_KEY = "show-closed-kanban";

export function QuestLogWrapper({
  initialQuests,
  moveAction,
  updateMetaAction,
}: QuestLogWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<QuestView>("log");
  const [showClosed, setShowClosed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    (state, update) => {
      if (update.kind === "status") {
        return state.map((quest) =>
          quest.id === update.questId ? { ...quest, status: update.newStatus } : quest
        );
      }

      return state.map((quest) =>
        quest.id === update.questId
          ? {
              ...quest,
              questType: update.questType,
              priority: update.priority,
              xpReward: update.xpReward,
            }
          : quest
      );
    }
  );

  function handleMoveQuest(questId: string, newStatus: QuestStatus) {
    const quest = quests.find((item) => item.id === questId);
    const isReopening =
      !!quest &&
      KANBAN_CLOSED_COLUMNS.includes(quest.status) &&
      !KANBAN_CLOSED_COLUMNS.includes(newStatus);

    if (isReopening) {
      const confirmed = window.confirm(
        "Reopening this quest will break your completion streak. Continue?"
      );
      if (!confirmed) return;
    }

    addOptimistic({ kind: "status", questId, newStatus });
    startTransition(async () => {
      const xpAwarded = await moveAction(questId, newStatus);

      if (xpAwarded > 0) {
        setToastMessage(`+${xpAwarded} XP gained`);
      }
    });
  }

  function handleUpdateQuestMeta(
    questId: string,
    questType: QuestType,
    priority: QuestPriority
  ) {
    const xpReward = calculateXpReward(questType, priority);

    addOptimistic({
      kind: "meta",
      questId,
      questType,
      priority,
      xpReward,
    });

    startTransition(async () => {
      await updateMetaAction(questId, questType, priority);
    });
  }

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

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
          onUpdateQuestMeta={handleUpdateQuestMeta}
          showClosed={showClosed}
        />
      )}

      {toastMessage && (
        <div className="pointer-events-none fixed top-5 right-5 z-50">
          <div className="parchment-card rounded-lg px-4 py-2 text-sm font-semibold text-[var(--accent)] shadow-lg">
            {toastMessage}
          </div>
        </div>
      )}
    </section>
  );
}
