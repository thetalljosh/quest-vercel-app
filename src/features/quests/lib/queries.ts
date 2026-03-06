import { db } from "@/shared/db/client";
import { quests, guildMembers, guilds } from "@/shared/db/schema";
import { eq, asc, and, inArray, isNull, or } from "drizzle-orm";
import type { Quest } from "@/features/quests/types";
import type { GuildCrestPreset } from "@/shared/lib/constants";

export async function getQuestsByUser(userId: string): Promise<Quest[]> {
  const memberships = await db
    .select({ guildId: guildMembers.guildId })
    .from(guildMembers)
    .where(eq(guildMembers.userId, userId));

  const guildIds = memberships.map((m) => m.guildId);

  const rows = await db
    .select({
      id: quests.id,
      userId: quests.userId,
      guildId: quests.guildId,
      title: quests.title,
      description: quests.description,
      questType: quests.questType,
      status: quests.status,
      priority: quests.priority,
      xpReward: quests.xpReward,
      dueDate: quests.dueDate,
      completedAt: quests.completedAt,
      sortOrder: quests.sortOrder,
      createdAt: quests.createdAt,
      updatedAt: quests.updatedAt,
      guildName: guilds.name,
      guildCrestPreset: guilds.crestPreset,
    })
    .from(quests)
    .leftJoin(guilds, eq(quests.guildId, guilds.id))
    .where(
      guildIds.length
        ? or(
            and(eq(quests.userId, userId), isNull(quests.guildId)),
            inArray(quests.guildId, guildIds)
          )
        : and(eq(quests.userId, userId), isNull(quests.guildId))
    )
    .orderBy(asc(quests.sortOrder));

  return rows.map((row) => ({
    ...row,
    guildCrestPreset: (row.guildCrestPreset as GuildCrestPreset | null) ?? null,
  })) as Quest[];
}
