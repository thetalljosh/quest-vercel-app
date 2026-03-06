"use client";

import { useDraggable } from "@dnd-kit/core";
import { QuestCard } from "@/features/quests/components/QuestCard";
import type { Quest } from "@/features/quests/types";
import type { QuestPriority, QuestType } from "@/shared/lib/constants";

interface DraggableQuestCardProps {
  quest: Quest;
  onUpdateQuestMeta?: (
    questId: string,
    questType: QuestType,
    priority: QuestPriority
  ) => void;
}

export function DraggableQuestCard({
  quest,
  onUpdateQuestMeta,
}: DraggableQuestCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: quest.id });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-grab transition-shadow ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <QuestCard quest={quest} onUpdateQuestMeta={onUpdateQuestMeta} />
    </div>
  );
}
