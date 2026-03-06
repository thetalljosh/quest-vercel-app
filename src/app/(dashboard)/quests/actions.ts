"use server";

import { db } from "@/shared/db/client";
import { quests, questLogs, profiles } from "@/shared/db/schema";
import { auth } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { QuestStatus, QuestType } from "@/shared/lib/constants";
import {
  checkLevelUp,
  distributeStatPoints,
} from "@/features/character/lib/xpEngine";

export async function moveQuestAction(
  questId: string,
  newStatus: QuestStatus
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [quest] = await db
    .select()
    .from(quests)
    .where(and(eq(quests.id, questId), eq(quests.userId, session.user.id)))
    .limit(1);

  if (!quest) throw new Error("Quest not found");

  const wasCompleted = quest.status === "completed";
  const becomingCompleted = !wasCompleted && newStatus === "completed";

  await db
    .update(quests)
    .set({
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(quests.id, questId), eq(quests.userId, session.user.id))
    );

  if (becomingCompleted) {
    await awardXp(session.user.id, {
      xpReward: quest.xpReward,
      questType: quest.questType,
    });
  }

  await logStatusChange(quest.id, session.user.id, newStatus, becomingCompleted ? quest.xpReward : null);

  revalidatePath("/quests");
  revalidatePath("/character");
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
  status: QuestStatus,
  xpAwarded: number | null
) {
  const action =
    status === "completed"
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
