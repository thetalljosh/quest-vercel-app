import { db } from "@/shared/db/client";
import { profiles, questLogs, quests } from "@/shared/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Profile } from "@/features/character/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return (row as Profile) ?? null;
}

export async function getRecentQuestLogs(userId: string, limit = 10) {
  return db
    .select()
    .from(questLogs)
    .leftJoin(quests, eq(questLogs.questId, quests.id))
    .where(eq(questLogs.userId, userId))
    .orderBy(desc(questLogs.createdAt))
    .limit(limit)
    .then((rows) => rows.map((row) => ({
      id: row.quest_logs.id,
      action: row.quest_logs.action,
      xpAwarded: row.quest_logs.xpAwarded,
      createdAt: row.quest_logs.createdAt,
      questTitle: row.quests?.title ?? "Unknown Quest",
    })));
}

export async function getCompletionStreak(userId: string): Promise<number> {
  const rows = await db
    .select({ action: questLogs.action })
    .from(questLogs)
    .where(eq(questLogs.userId, userId))
    .orderBy(desc(questLogs.createdAt))
    .limit(200);

  let streak = 0;

  for (const row of rows) {
    if (row.action === "reopened") {
      break;
    }

    if (row.action === "completed") {
      streak++;
    }
  }

  return streak;
}
