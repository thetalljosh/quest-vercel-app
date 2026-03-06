import type { Quest } from "@/features/quests/types";
import {
  QUEST_TYPE_LABELS,
  QUEST_TYPE_COLORS,
  PRIORITY_LABELS,
} from "@/shared/lib/constants";
import { formatDate } from "@/shared/lib/utils";

export function QuestCard({ quest }: { quest: Quest }) {
  return (
    <div className="parchment-card rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="rpg-heading text-sm font-semibold">
          {quest.title}
        </h3>
        <span className="shrink-0 text-xs font-bold text-[var(--accent)]">
          +{quest.xpReward} XP
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <QuestTypeBadge questType={quest.questType} />
        <PriorityBadge priority={quest.priority} />
      </div>

      {quest.dueDate && (
        <p className="mt-2 text-xs text-[var(--muted-text)]">
          Due: {formatDate(quest.dueDate)}
        </p>
      )}
    </div>
  );
}

function QuestTypeBadge({ questType }: { questType: Quest["questType"] }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold
                  uppercase tracking-wide ${QUEST_TYPE_COLORS[questType]}`}
    >
      {QUEST_TYPE_LABELS[questType]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Quest["priority"] }) {
  return (
    <span className="inline-block rounded-full border border-[var(--border)] px-2 py-0.5
                     text-[10px] font-medium text-[var(--muted-text)]">
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
