"use server";

import { db } from "@/shared/db/client";
import { quests } from "@/shared/db/schema";
import { auth } from "@/features/auth/lib/auth";
import { questDeleteSchema } from "@/features/quests/types/schemas";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertCanEditQuest, getQuestById } from "@/features/quests/lib/questHelpers";

export async function deleteQuest(questIdRaw: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { questId } = questDeleteSchema.parse({
    questId: questIdRaw,
  });

  const quest = await getQuestById(questId);
  if (!quest) throw new Error("Quest not found");

  await assertCanEditQuest(session.user.id, quest.userId, quest.guildId);

  await db.delete(quests).where(eq(quests.id, questId));

  revalidatePath("/quests");
}
