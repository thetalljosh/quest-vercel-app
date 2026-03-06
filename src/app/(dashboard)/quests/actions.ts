"use server";

import { db } from "@/shared/db/client";
import { quests, questLogs, profiles, guildMembers } from "@/shared/db/schema";
import { auth } from "@/features/auth/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { QuestStatus, QuestType } from "@/shared/lib/constants";
import {
  QUEST_PRIORITIES,
  QUEST_TYPES,
  type QuestPriority,
} from "@/shared/lib/constants";
import {
  calculateXpReward,
  checkLevelUp,
  distributeStatPoints,
} from "@/features/character/lib/xpEngine";

export async function moveQuestAction(
  questId: string,
  newStatus: QuestStatus
): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [quest] = await db
    .select()
    .from(quests)
    .where(eq(quests.id, questId))
    .limit(1);

  if (!quest) throw new Error("Quest not found");
  await assertCanEditQuest(session.user.id, quest.userId, quest.guildId);

  const wasClosed = isClosedStatus(quest.status);
  const reopening = wasClosed && !isClosedStatus(newStatus);
  const becomingCompleted = newStatus === "completed";

  const [lastCompletion] = await db
    .select({ id: questLogs.id })
    .from(questLogs)
    .where(and(eq(questLogs.questId, quest.id), eq(questLogs.action, "completed")))
    .orderBy(desc(questLogs.createdAt))
    .limit(1);

  const shouldAwardXp = becomingCompleted && !lastCompletion;

  await db
    .update(quests)
    .set({
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(quests.id, questId));

  if (shouldAwardXp) {
    await awardXp(session.user.id, {
      xpReward: quest.xpReward,
      questType: quest.questType,
    });
  }

  await logStatusChange(
    quest.id,
    session.user.id,
    quest.status,
    newStatus,
    shouldAwardXp ? quest.xpReward : null
  );

  revalidatePath("/quests");
  revalidatePath("/character");

  return shouldAwardXp ? quest.xpReward : 0;
}

export async function updateQuestCardMetaAction(
  questId: string,
  questType: QuestType,
  priority: QuestPriority
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!QUEST_TYPES.includes(questType)) {
    throw new Error("Invalid quest type");
  }

  if (!QUEST_PRIORITIES.includes(priority)) {
    throw new Error("Invalid priority");
  }

  const [quest] = await db
    .select()
    .from(quests)
    .where(eq(quests.id, questId))
    .limit(1);

  if (!quest) throw new Error("Quest not found");
  await assertCanEditQuest(session.user.id, quest.userId, quest.guildId);

  const xpReward = calculateXpReward(questType, priority);

  await db
    .update(quests)
    .set({
      questType,
      priority,
      xpReward,
      updatedAt: new Date(),
    })
    .where(eq(quests.id, questId));

  await db.insert(questLogs).values({
    questId,
    userId: session.user.id,
    action: "moved",
  });

  revalidatePath("/quests");
}

async function awardXp(
  userId: string,
  quest: { xpReward: number; questType: QuestType }
) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) return;

  const newTotal = profile.totalXp + quest.xpReward;
  const newCurrent = profile.currentXp + quest.xpReward;
  const { newLevel } = checkLevelUp(profile.level, newTotal);
  const stats = distributeStatPoints(quest.questType);

  await db
    .update(profiles)
    .set({
      totalXp: newTotal,
      currentXp: newCurrent,
      level: newLevel,
      statStamina: profile.statStamina + stats.stamina,
      statIntellect: profile.statIntellect + stats.intellect,
      statWillpower: profile.statWillpower + stats.willpower,
    })
    .where(eq(profiles.id, userId));
}

async function logStatusChange(
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

  await db.insert(questLogs).values({
    questId,
    userId,
    action,
    xpAwarded,
  });
}

function isClosedStatus(status: QuestStatus): boolean {
  return status === "completed" || status === "failed";
}

async function assertCanEditQuest(
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
