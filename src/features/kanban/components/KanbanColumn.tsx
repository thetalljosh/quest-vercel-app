"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableQuestCard } from "./DraggableQuestCard";
import type { Quest } from "@/features/quests/types";
import type { QuestStatus } from "@/shared/lib/constants";

interface KanbanColumnProps {
  status: QuestStatus;
  title: string;
  quests: Quest[];
}

export function KanbanColumn({ status, title, quests }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const statusIcons: Record<QuestStatus, string> = {
    backlog: "🗂️",
    active: "⚔️",
    in_progress: "⏳",
    review: "🕯️",
    completed: "🏆",
    failed: "☠️",
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[220px] flex-col rounded-xl border p-3
                  transition-colors ${
                    isOver
                      ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                      : "parchment-sunken border-[var(--border)]"
                  }`}
    >
      <h2 className="rpg-subhead mb-3 text-xs">
        <span className="mr-1">{statusIcons[status]}</span>
        {title}
        <span className="ml-2 text-[var(--muted-text)]">({quests.length})</span>
      </h2>

      <div className="flex flex-col gap-2">
        {quests.map((quest) => (
          <DraggableQuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </div>
  );
}
