export type { QuestType, QuestStatus, QuestPriority, StatName } from "@/shared/lib/constants";

export interface Profile {
  id: string;
  displayName: string;
  level: number;
  currentXp: number;
  totalXp: number;
  unspentStatPoints: number;
  statStamina: number;
  statIntellect: number;
  statWillpower: number;
  statCharisma: number;
  statCuriosity: number;
  statPerception: number;
  createdAt: Date;
}
