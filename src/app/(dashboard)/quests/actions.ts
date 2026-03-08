"use server";

import { db } from "@/shared/db/client";
import { quests, questLogs } from "@/shared/db/schema";
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
  awardXpForQuest,
} from "@/features/character/lib/xpEngine";
import {
  assertCanEditQuest,
  logStatusChange,
} from "@/features/quests/lib/questHelpers";

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
    await awardXpForQuest(session.user.id, { xpReward: quest.xpReward });
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
