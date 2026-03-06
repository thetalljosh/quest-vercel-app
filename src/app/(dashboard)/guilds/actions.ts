"use server";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/shared/db/client";
import {
  guilds,
  guildJoinRequests,
  guildMembers,
  users,
} from "@/shared/db/schema";
import {
  GUILD_CREST_PRESETS,
  type GuildCrestPreset,
} from "@/shared/lib/constants";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { sendEmail } from "@/shared/lib/email";

function buildAppUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

export async function createGuildAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const crestPreset = String(formData.get("crestPreset") ?? "lion") as GuildCrestPreset;

  if (!name) throw new Error("Guild name is required");
  if (!GUILD_CREST_PRESETS.includes(crestPreset)) {
    throw new Error("Invalid crest preset");
  }

  const [guild] = await db
    .insert(guilds)
    .values({
      name,
      description: description || null,
      creatorId: session.user.id,
      crestPreset,
    })
    .returning();

  await db.insert(guildMembers).values({
    guildId: guild.id,
    userId: session.user.id,
    role: "creator",
  });

  revalidatePath("/guilds");
  revalidatePath("/quests");
}

export async function requestJoinGuildAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guildId = String(formData.get("guildId") ?? "");
  if (!guildId) throw new Error("Guild is required");

  const [guild] = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild) throw new Error("Guild not found");

  const [existingMember] = await db
    .select({ id: guildMembers.id })
    .from(guildMembers)
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, session.user.id)))
    .limit(1);

  if (existingMember) {
    throw new Error("You are already a member of this guild");
  }

  const [existingPending] = await db
    .select({ id: guildJoinRequests.id })
    .from(guildJoinRequests)
    .where(
      and(
        eq(guildJoinRequests.guildId, guildId),
        eq(guildJoinRequests.requesterId, session.user.id),
        eq(guildJoinRequests.status, "pending")
      )
    )
    .limit(1);

  if (existingPending) {
    throw new Error("A pending request already exists");
  }

  const token = crypto.randomBytes(24).toString("hex");

  const [request] = await db
    .insert(guildJoinRequests)
    .values({
      guildId,
      requesterId: session.user.id,
      token,
      status: "pending",
    })
    .returning();

  const [creator] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, guild.creatorId))
    .limit(1);

  if (creator?.email) {
    const approveLink = buildAppUrl(
      `/api/guilds/requests/approve?requestId=${request.id}&token=${token}`
    );
    const guildPageLink = buildAppUrl("/guilds");

    await sendEmail({
      to: creator.email,
      subject: `${session.user.name ?? session.user.email} requested to join ${guild.name}`,
      html: `
        <p><strong>${session.user.name ?? session.user.email}</strong> requested to join <strong>${guild.name}</strong>.</p>
        <p>You can approve via email:</p>
        <p><a href="${approveLink}">Approve Request</a></p>
        <p>Or review all requests in the app:</p>
        <p><a href="${guildPageLink}">Open Guilds</a></p>
      `,
    });
  }

  revalidatePath("/guilds");
}

export async function approveGuildJoinRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Request is required");

  await approveGuildJoinRequestById(requestId, session.user.id);
  revalidatePath("/guilds");
  revalidatePath("/quests");
}

export async function rejectGuildJoinRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Request is required");

  const [request] = await db
    .select({
      id: guildJoinRequests.id,
      guildId: guildJoinRequests.guildId,
      status: guildJoinRequests.status,
    })
    .from(guildJoinRequests)
    .where(eq(guildJoinRequests.id, requestId))
    .limit(1);

  if (!request || request.status !== "pending") {
    throw new Error("Request is not pending");
  }

  await assertCanReviewGuildRequest(session.user.id, request.guildId);

  await db
    .update(guildJoinRequests)
    .set({
      status: "rejected",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
      token: null,
    })
    .where(eq(guildJoinRequests.id, requestId));

  revalidatePath("/guilds");
}

export async function approveGuildJoinRequestByToken(
  requestId: string,
  token: string
) {
  const [request] = await db
    .select({
      id: guildJoinRequests.id,
      guildId: guildJoinRequests.guildId,
      requesterId: guildJoinRequests.requesterId,
      status: guildJoinRequests.status,
      token: guildJoinRequests.token,
    })
    .from(guildJoinRequests)
    .where(eq(guildJoinRequests.id, requestId))
    .limit(1);

  if (!request || request.status !== "pending" || !request.token || request.token !== token) {
    return false;
  }

  const [existingMember] = await db
    .select({ id: guildMembers.id })
    .from(guildMembers)
    .where(
      and(
        eq(guildMembers.guildId, request.guildId),
        eq(guildMembers.userId, request.requesterId)
      )
    )
    .limit(1);

  if (!existingMember) {
    await db.insert(guildMembers).values({
      guildId: request.guildId,
      userId: request.requesterId,
      role: "member",
    });
  }

  await db
    .update(guildJoinRequests)
    .set({
      status: "approved",
      reviewedAt: new Date(),
      updatedAt: new Date(),
      token: null,
    })
    .where(eq(guildJoinRequests.id, requestId));

  revalidatePath("/guilds");
  revalidatePath("/quests");
  return true;
}

async function approveGuildJoinRequestById(requestId: string, reviewerUserId: string) {
  const [request] = await db
    .select({
      id: guildJoinRequests.id,
      guildId: guildJoinRequests.guildId,
      requesterId: guildJoinRequests.requesterId,
      status: guildJoinRequests.status,
    })
    .from(guildJoinRequests)
    .where(eq(guildJoinRequests.id, requestId))
    .limit(1);

  if (!request || request.status !== "pending") {
    throw new Error("Request is not pending");
  }

  await assertCanReviewGuildRequest(reviewerUserId, request.guildId);

  const [existingMember] = await db
    .select({ id: guildMembers.id })
    .from(guildMembers)
    .where(
      and(
        eq(guildMembers.guildId, request.guildId),
        eq(guildMembers.userId, request.requesterId)
      )
    )
    .limit(1);

  if (!existingMember) {
    await db.insert(guildMembers).values({
      guildId: request.guildId,
      userId: request.requesterId,
      role: "member",
    });
  }

  await db
    .update(guildJoinRequests)
    .set({
      status: "approved",
      reviewedById: reviewerUserId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
      token: null,
    })
    .where(eq(guildJoinRequests.id, requestId));
}

async function assertCanReviewGuildRequest(userId: string, guildId: string) {
  const [guild] = await db
    .select({ creatorId: guilds.creatorId })
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild) throw new Error("Guild not found");
  if (guild.creatorId === userId) return;

  const [membership] = await db
    .select({ role: guildMembers.role })
    .from(guildMembers)
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, userId)))
    .limit(1);

  if (!membership || (membership.role !== "creator" && membership.role !== "admin")) {
    throw new Error("You do not have permission to review requests");
  }
}
