"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import type { Quest } from "@/features/quests/types";
import {
  KANBAN_COLUMNS,
  KANBAN_CLOSED_COLUMNS,
  QUEST_STATUS_LABELS,
} from "@/shared/lib/constants";
import type { QuestStatus } from "@/shared/lib/constants";

interface KanbanBoardProps {
  quests: Quest[];
  onMoveQuest: (questId: string, newStatus: QuestStatus) => void;
  showClosed?: boolean;
}

export function KanbanBoard({
  quests,
  onMoveQuest,
  showClosed = false,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columns = showClosed
    ? [...KANBAN_COLUMNS, ...KANBAN_CLOSED_COLUMNS]
    : KANBAN_COLUMNS;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const questId = active.id as string;
    const newStatus = over.id as QuestStatus;
    const quest = quests.find((q) => q.id === questId);

    if (quest && quest.status !== newStatus) {
      onMoveQuest(questId, newStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        className={showClosed
          ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
          : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"}
      >
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            title={QUEST_STATUS_LABELS[status]}
            quests={quests.filter((q) => q.status === status)}
          />
        ))}
      </div>
    </DndContext>
  );
}
