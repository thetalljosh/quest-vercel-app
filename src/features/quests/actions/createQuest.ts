"use server";

import { db } from "@/shared/db/client";
import { quests, questLogs, guildMembers } from "@/shared/db/schema";
import { auth } from "@/features/auth/lib/auth";
import { questCreateSchema } from "@/features/quests/types/schemas";
import { calculateXpReward } from "@/features/character/lib/xpEngine";
import { revalidatePath } from "next/cache";
import type { QuestType, QuestPriority } from "@/shared/lib/constants";
import { and, eq } from "drizzle-orm";

export async function createQuest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const raw = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    questType: formData.get("questType"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate") || undefined,
    guildId: formData.get("guildId") || undefined,
  };

  const parsed = questCreateSchema.parse(raw);
  const xpReward = calculateXpReward(
    parsed.questType as QuestType,
    (parsed.priority ?? "moderate") as QuestPriority
  );

  if (parsed.guildId) {
    const [membership] = await db
      .select({ id: guildMembers.id })
      .from(guildMembers)
      .where(
        and(
          eq(guildMembers.guildId, parsed.guildId),
          eq(guildMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership) {
      throw new Error("You are not a member of this guild");
    }
  }

  const [quest] = await db
    .insert(quests)
    .values({
      userId: session.user.id,
      guildId: parsed.guildId ?? null,
      title: parsed.title,
      description: parsed.description ?? null,
      questType: parsed.questType,
      priority: parsed.priority ?? "moderate",
      xpReward,
      dueDate: parsed.dueDate ?? null,
    })
    .returning();

  await insertQuestLog(quest.id, session.user.id, "created");
  revalidatePath("/quests");
  return quest;
}

async function insertQuestLog(
  questId: string,
  userId: string,
  action: string,
  xpAwarded?: number
) {
  await db.insert(questLogs).values({
    questId,
    userId,
    action,
    xpAwarded: xpAwarded ?? null,
  });
}
