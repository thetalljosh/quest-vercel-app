import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────

export const questTypeEnum = pgEnum("quest_type", [
  "main",
  "character",
  "event",
  "world",
  "side",
  "commission",
]);

export const questStatusEnum = pgEnum("quest_status", [
  "backlog",
  "active",
  "in_progress",
  "review",
  "completed",
  "failed",
]);

export const questPriorityEnum = pgEnum("quest_priority", [
  "critical",
  "high",
  "moderate",
  "low",
]);

export const guildRoleEnum = pgEnum("guild_role", [
  "creator",
  "admin",
  "member",
]);

export const guildRequestStatusEnum = pgEnum("guild_request_status", [
  "pending",
  "approved",
  "rejected",
]);

// ── Auth.js tables (managed by @auth/drizzle-adapter) ──
// Column names must use snake_case to match adapter expectations.

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("accounts", {
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ── Application tables ─────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  level: integer("level").notNull().default(1),
  currentXp: integer("current_xp").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  statStamina: integer("stat_stamina").notNull().default(5),
  statIntellect: integer("stat_intellect").notNull().default(5),
  statWillpower: integer("stat_willpower").notNull().default(5),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const guilds = pgTable("guilds", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  crestPreset: varchar("crest_preset", { length: 40 }).notNull().default("lion"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const guildMembers = pgTable("guild_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  guildId: uuid("guild_id")
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: guildRoleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const guildJoinRequests = pgTable("guild_join_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  guildId: uuid("guild_id")
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
  requesterId: uuid("requester_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: guildRequestStatusEnum("status").notNull().default("pending"),
  token: varchar("token", { length: 255 }),
  reviewedById: uuid("reviewed_by_id").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const quests = pgTable("quests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  guildId: uuid("guild_id").references(() => guilds.id, { onDelete: "set null" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  questType: questTypeEnum("quest_type").notNull(),
  status: questStatusEnum("status").notNull().default("backlog"),
  priority: questPriorityEnum("priority").notNull().default("moderate"),
  xpReward: integer("xp_reward").notNull().default(0),
  dueDate: timestamp("due_date", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const questLogs = pgTable("quest_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  questId: uuid("quest_id")
    .notNull()
    .references(() => quests.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(),
  xpAwarded: integer("xp_awarded"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
