import { z } from "zod";
import {
  QUEST_TYPES,
  QUEST_STATUSES,
  QUEST_PRIORITIES,
} from "@/shared/lib/constants";

export const questCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  questType: z.enum(QUEST_TYPES),
  priority: z.enum(QUEST_PRIORITIES).default("moderate"),
  dueDate: z.coerce.date().optional(),
  guildId: z.string().uuid().optional(),
});

export const questUpdateStatusSchema = z.object({
  questId: z.string().uuid(),
  status: z.enum(QUEST_STATUSES),
  sortOrder: z.number().int().optional(),
});

export const questDeleteSchema = z.object({
  questId: z.string().uuid(),
});

export type QuestCreateInput = z.infer<typeof questCreateSchema>;
export type QuestUpdateStatusInput = z.infer<typeof questUpdateStatusSchema>;
