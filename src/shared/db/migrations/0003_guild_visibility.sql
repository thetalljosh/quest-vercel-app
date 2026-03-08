ALTER TABLE "guilds" ADD COLUMN "is_public" boolean NOT NULL DEFAULT true;
ALTER TABLE "guilds" ADD COLUMN "join_phrase" varchar(120);
