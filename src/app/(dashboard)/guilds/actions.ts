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
  PHRASE_WORDS,
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

export async function setGuildMemberRoleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guildId = String(formData.get("guildId") ?? "");
  const memberUserId = String(formData.get("memberUserId") ?? "");
  const role = String(formData.get("role") ?? "") as "admin" | "member";

  if (!guildId || !memberUserId) {
    throw new Error("Guild and member are required");
  }

  if (role !== "admin" && role !== "member") {
    throw new Error("Invalid role");
  }

  const [guild] = await db
    .select({ creatorId: guilds.creatorId })
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild) throw new Error("Guild not found");
  if (guild.creatorId !== session.user.id) {
    throw new Error("Only the guild creator can manage admin roles");
  }

  if (memberUserId === guild.creatorId) {
    throw new Error("Cannot modify creator role");
  }

  const [member] = await db
    .select({ id: guildMembers.id })
    .from(guildMembers)
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, memberUserId)))
    .limit(1);

  if (!member) {
    throw new Error("Guild member not found");
  }

  await db
    .update(guildMembers)
    .set({ role })
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, memberUserId)));

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

// ── Phrase generation ──────────────────────────────────

function generateJoinPhrase(): string {
  const words: string[] = [];
  while (words.length < 3) {
    const idx = crypto.randomInt(0, PHRASE_WORDS.length);
    const w = PHRASE_WORDS[idx];
    if (!words.includes(w)) words.push(w);
  }
  return words.join("-");
}

// ── Guild deletion (owner only) ────────────────────────

export async function deleteGuildAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guildId = String(formData.get("guildId") ?? "");
  if (!guildId) throw new Error("Guild is required");

  const [guild] = await db
    .select({ creatorId: guilds.creatorId })
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild) throw new Error("Guild not found");
  if (guild.creatorId !== session.user.id) {
    throw new Error("Only the guild owner can delete a guild");
  }

  await db.delete(guilds).where(eq(guilds.id, guildId));

  revalidatePath("/guilds");
  revalidatePath("/quests");
}

// ── Ownership transfer (owner → admin) ─────────────────

export async function transferGuildOwnershipAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guildId = String(formData.get("guildId") ?? "");
  const newOwnerUserId = String(formData.get("newOwnerUserId") ?? "");
  if (!guildId || !newOwnerUserId) throw new Error("Guild and new owner are required");

  const [guild] = await db
    .select({ creatorId: guilds.creatorId })
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild) throw new Error("Guild not found");
  if (guild.creatorId !== session.user.id) {
    throw new Error("Only the guild owner can transfer ownership");
  }
  if (newOwnerUserId === session.user.id) {
    throw new Error("You are already the owner");
  }

  // Verify target is a current admin
  const [targetMember] = await db
    .select({ role: guildMembers.role })
    .from(guildMembers)
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, newOwnerUserId)))
    .limit(1);

  if (!targetMember || targetMember.role !== "admin") {
    throw new Error("New owner must be an admin of this guild");
  }

  // Update guild creator
  await db
    .update(guilds)
    .set({ creatorId: newOwnerUserId })
    .where(eq(guilds.id, guildId));

  // Promote new owner to creator role
  await db
    .update(guildMembers)
    .set({ role: "creator" })
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, newOwnerUserId)));

  // Demote old owner to admin
  await db
    .update(guildMembers)
    .set({ role: "admin" })
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.userId, session.user.id)));

  revalidatePath("/guilds");
}

// ── Toggle guild visibility (owner only) ───────────────

export async function toggleGuildVisibilityAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guildId = String(formData.get("guildId") ?? "");
  if (!guildId) throw new Error("Guild is required");

  const [guild] = await db
    .select({ creatorId: guilds.creatorId, isPublic: guilds.isPublic })
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild) throw new Error("Guild not found");
  if (guild.creatorId !== session.user.id) {
    throw new Error("Only the guild owner can change visibility");
  }

  const nowPublic = !guild.isPublic;

  await db
    .update(guilds)
    .set({
      isPublic: nowPublic,
      joinPhrase: nowPublic ? null : generateJoinPhrase(),
    })
    .where(eq(guilds.id, guildId));

  revalidatePath("/guilds");
}

// ── Regenerate join phrase (owner only) ────────────────

export async function regenerateJoinPhraseAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guildId = String(formData.get("guildId") ?? "");
  if (!guildId) throw new Error("Guild is required");

  const [guild] = await db
    .select({ creatorId: guilds.creatorId, isPublic: guilds.isPublic })
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild) throw new Error("Guild not found");
  if (guild.creatorId !== session.user.id) {
    throw new Error("Only the guild owner can regenerate the join phrase");
  }
  if (guild.isPublic) {
    throw new Error("Only private guilds have a join phrase");
  }

  await db
    .update(guilds)
    .set({ joinPhrase: generateJoinPhrase() })
    .where(eq(guilds.id, guildId));

  revalidatePath("/guilds");
}

// ── Join private guild by name + phrase ────────────────

export async function joinPrivateGuildAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guildName = String(formData.get("guildName") ?? "").trim();
  const joinPhrase = String(formData.get("joinPhrase") ?? "").trim().toLowerCase();

  if (!guildName || !joinPhrase) {
    throw new Error("Guild name and join phrase are required");
  }

  const [guild] = await db
    .select({ id: guilds.id, joinPhrase: guilds.joinPhrase, isPublic: guilds.isPublic })
    .from(guilds)
    .where(eq(guilds.name, guildName))
    .limit(1);

  if (!guild || guild.isPublic || guild.joinPhrase !== joinPhrase) {
    throw new Error("No matching private guild found. Check the name and phrase.");
  }

  const [existingMember] = await db
    .select({ id: guildMembers.id })
    .from(guildMembers)
    .where(and(eq(guildMembers.guildId, guild.id), eq(guildMembers.userId, session.user.id)))
    .limit(1);

  if (existingMember) {
    throw new Error("You are already a member of this guild");
  }

  await db.insert(guildMembers).values({
    guildId: guild.id,
    userId: session.user.id,
    role: "member",
  });

  revalidatePath("/guilds");
  revalidatePath("/quests");
}
