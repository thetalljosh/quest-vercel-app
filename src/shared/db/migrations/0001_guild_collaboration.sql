CREATE TYPE "public"."guild_role" AS ENUM('creator', 'admin', 'member');
CREATE TYPE "public"."guild_request_status" AS ENUM('pending', 'approved', 'rejected');

CREATE TABLE "guilds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(120) NOT NULL,
  "description" text,
  "creator_id" uuid NOT NULL,
  "crest_preset" varchar(40) DEFAULT 'lion' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "guild_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "guild_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" "guild_role" DEFAULT 'member' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "guild_join_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "guild_id" uuid NOT NULL,
  "requester_id" uuid NOT NULL,
  "status" "guild_request_status" DEFAULT 'pending' NOT NULL,
  "token" varchar(255),
  "reviewed_by_id" uuid,
  "reviewed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "quests" ADD COLUMN "guild_id" uuid;

ALTER TABLE "guilds"
  ADD CONSTRAINT "guilds_creator_id_users_id_fk"
  FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade;

ALTER TABLE "guild_members"
  ADD CONSTRAINT "guild_members_guild_id_guilds_id_fk"
  FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade;

ALTER TABLE "guild_members"
  ADD CONSTRAINT "guild_members_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;

ALTER TABLE "guild_join_requests"
  ADD CONSTRAINT "guild_join_requests_guild_id_guilds_id_fk"
  FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade;

ALTER TABLE "guild_join_requests"
  ADD CONSTRAINT "guild_join_requests_requester_id_users_id_fk"
  FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade;

ALTER TABLE "guild_join_requests"
  ADD CONSTRAINT "guild_join_requests_reviewed_by_id_users_id_fk"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null;

ALTER TABLE "quests"
  ADD CONSTRAINT "quests_guild_id_guilds_id_fk"
  FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE set null;