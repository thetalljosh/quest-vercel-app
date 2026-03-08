import { db } from "@/shared/db/client";
import { guildMembers, questLogs, quests } from "@/shared/db/schema";
import type { QuestStatus } from "@/shared/lib/constants";
import { and, eq } from "drizzle-orm";

export function isClosedStatus(status: QuestStatus): boolean {
  return status === "completed" || status === "failed";
}

export async function assertCanEditQuest(
  actingUserId: string,
  ownerUserId: string,
  guildId: string | null
) {
  if (!guildId) {
    if (actingUserId !== ownerUserId) {
      throw new Error("You do not have permission to edit this quest");
    }
    return;
  }

  const [membership] = await db
    .select({ id: guildMembers.id })
    .from(guildMembers)
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, actingUserId)))
    .limit(1);

  if (!membership) {
    throw new Error("You are not a member of this guild");
  }
}

export async function insertQuestLog(
  questId: string,
  userId: string,
  action: string,
  xpAwarded?: number | null
) {
  await db.insert(questLogs).values({
    questId,
    userId,
    action,
    xpAwarded: xpAwarded ?? null,
  });
}

export async function logStatusChange(
  questId: string,
  userId: string,
  oldStatus: QuestStatus,
  status: QuestStatus,
  xpAwarded: number | null
) {
  const reopening = isClosedStatus(oldStatus) && !isClosedStatus(status);

  const action = reopening
    ? "reopened"
    : status === "completed"
      ? "completed"
      : status === "failed"
        ? "failed"
        : "moved";

  await insertQuestLog(questId, userId, action, xpAwarded);
}

export async function getQuestById(questId: string) {
  const [quest] = await db
    .select()
    .from(quests)
    .where(eq(quests.id, questId))
    .limit(1);

  return quest ?? null;
}
