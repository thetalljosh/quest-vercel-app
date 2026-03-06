import type {
  QuestType,
  QuestStatus,
  QuestPriority,
  GuildCrestPreset,
} from "@/shared/lib/constants";

export interface Quest {
  id: string;
  userId: string;
  guildId?: string | null;
  guildName?: string | null;
  guildCrestPreset?: GuildCrestPreset | null;
  title: string;
  description: string | null;
  questType: QuestType;
  status: QuestStatus;
  priority: QuestPriority;
  xpReward: number;
  dueDate: Date | null;
  completedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestLog {
  id: string;
  questId: string;
  userId: string;
  action: string;
  xpAwarded: number | null;
  createdAt: Date;
}
