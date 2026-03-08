import { db } from "@/shared/db/client";
import {
  guilds,
  guildMembers,
  guildJoinRequests,
  profiles,
  users,
} from "@/shared/db/schema";
import { and, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import type { GuildOption } from "@/features/guilds/types";
import type { GuildCrestPreset } from "@/shared/lib/constants";

export async function getUserGuildOptions(userId: string): Promise<GuildOption[]> {
  const rows = await db
    .select({
      id: guilds.id,
      name: guilds.name,
      crestPreset: guilds.crestPreset,
      role: guildMembers.role,
      creatorId: guilds.creatorId,
    })
    .from(guildMembers)
    .innerJoin(guilds, eq(guildMembers.guildId, guilds.id))
    .where(eq(guildMembers.userId, userId));

  return rows.map((row) => ({
    ...row,
    crestPreset: row.crestPreset as GuildCrestPreset,
  }));
}

export async function getGuildDashboardData(userId: string) {
  const myGuilds = await db
    .select({
      id: guilds.id,
      name: guilds.name,
      description: guilds.description,
      creatorId: guilds.creatorId,
      crestPreset: guilds.crestPreset,
      createdAt: guilds.createdAt,
      role: guildMembers.role,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(guildMembers)
    .innerJoin(guilds, eq(guildMembers.guildId, guilds.id))
    .innerJoin(users, eq(guilds.creatorId, users.id))
    .where(eq(guildMembers.userId, userId))
    .orderBy(desc(guilds.createdAt));

  const pendingApprovals = await db
    .select({
      id: guildJoinRequests.id,
      guildId: guilds.id,
      guildName: guilds.name,
      guildCrestPreset: guilds.crestPreset,
      requesterId: guildJoinRequests.requesterId,
      requesterName: users.name,
      requesterEmail: users.email,
      status: guildJoinRequests.status,
      createdAt: guildJoinRequests.createdAt,
    })
    .from(guildJoinRequests)
    .innerJoin(guilds, eq(guildJoinRequests.guildId, guilds.id))
    .innerJoin(users, eq(guildJoinRequests.requesterId, users.id))
    .where(
      and(
        eq(guildJoinRequests.status, "pending"),
        or(
          eq(guilds.creatorId, userId),
          sql`exists (
            select 1
            from ${guildMembers} gm
            where gm.guild_id = ${guilds.id}
              and gm.user_id = ${userId}
              and gm.role in ('creator', 'admin')
          )`
        )
      )
    )
    .orderBy(desc(guildJoinRequests.createdAt));

  const outgoingRequests = await db
    .select({
      id: guildJoinRequests.id,
      guildName: guilds.name,
      guildCrestPreset: guilds.crestPreset,
      status: guildJoinRequests.status,
      createdAt: guildJoinRequests.createdAt,
    })
    .from(guildJoinRequests)
    .innerJoin(guilds, eq(guildJoinRequests.guildId, guilds.id))
    .where(eq(guildJoinRequests.requesterId, userId))
    .orderBy(desc(guildJoinRequests.createdAt));

  const discoverGuilds = await db
    .select({
      id: guilds.id,
      name: guilds.name,
      crestPreset: guilds.crestPreset,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(guilds)
    .innerJoin(users, eq(guilds.creatorId, users.id))
    .where(
      and(
        ne(guilds.creatorId, userId),
        sql`not exists (
          select 1
          from ${guildMembers} gm
          where gm.guild_id = ${guilds.id}
            and gm.user_id = ${userId}
        )`
      )
    )
    .orderBy(desc(guilds.createdAt));

  return {
    myGuilds: myGuilds.map((row) => ({
      ...row,
      crestPreset: row.crestPreset as GuildCrestPreset,
    })),
    pendingApprovals: pendingApprovals.map((row) => ({
      ...row,
      guildCrestPreset: row.guildCrestPreset as GuildCrestPreset,
    })),
    outgoingRequests: outgoingRequests.map((row) => ({
      ...row,
      guildCrestPreset: row.guildCrestPreset as GuildCrestPreset,
    })),
    discoverGuilds: discoverGuilds.map((row) => ({
      ...row,
      crestPreset: row.crestPreset as GuildCrestPreset,
    })),
  };
}

export async function getUserGuildRole(userId: string, guildId: string) {
  const [row] = await db
    .select({ role: guildMembers.role })
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, userId), eq(guildMembers.guildId, guildId)))
    .limit(1);

  return row?.role ?? null;
}

export async function getCreatorGuildMemberRoster(creatorUserId: string) {
  const creatorGuilds = await db
    .select({
      id: guilds.id,
      name: guilds.name,
      crestPreset: guilds.crestPreset,
    })
    .from(guilds)
    .where(eq(guilds.creatorId, creatorUserId))
    .orderBy(desc(guilds.createdAt));

  if (!creatorGuilds.length) {
    return [];
  }

  const guildIds = creatorGuilds.map((guild) => guild.id);

  const memberRows = await db
    .select({
      guildId: guildMembers.guildId,
      userId: guildMembers.userId,
      role: guildMembers.role,
      userName: users.name,
      userEmail: users.email,
    })
    .from(guildMembers)
    .innerJoin(users, eq(guildMembers.userId, users.id))
    .where(inArray(guildMembers.guildId, guildIds));

  return creatorGuilds.map((guild) => ({
    id: guild.id,
    name: guild.name,
    crestPreset: guild.crestPreset as GuildCrestPreset,
    members: memberRows
      .filter((member) => member.guildId === guild.id)
      .map((member) => ({
        userId: member.userId,
        role: member.role,
        userName: member.userName,
        userEmail: member.userEmail,
      })),
  }));
}

export async function getGuildCombinedTraits(guildIds: string[]) {
  if (!guildIds.length) {
    return [];
  }

  const rows = await db
    .select({
      guildId: guildMembers.guildId,
      statStamina: profiles.statStamina,
      statIntellect: profiles.statIntellect,
      statWillpower: profiles.statWillpower,
      statCharisma: profiles.statCharisma,
      statCuriosity: profiles.statCuriosity,
      statPerception: profiles.statPerception,
    })
    .from(guildMembers)
    .innerJoin(profiles, eq(guildMembers.userId, profiles.id))
    .where(inArray(guildMembers.guildId, guildIds));

  return guildIds.map((guildId) => {
    const members = rows.filter((row) => row.guildId === guildId);

    const totals = members.reduce(
      (acc, member) => ({
        stamina: acc.stamina + member.statStamina,
        intellect: acc.intellect + member.statIntellect,
        willpower: acc.willpower + member.statWillpower,
        charisma: acc.charisma + member.statCharisma,
        curiosity: acc.curiosity + member.statCuriosity,
        perception: acc.perception + member.statPerception,
      }),
      {
        stamina: 0,
        intellect: 0,
        willpower: 0,
        charisma: 0,
        curiosity: 0,
        perception: 0,
      }
    );

    return {
      guildId,
      memberCount: members.length,
      totals,
    };
  });
}
