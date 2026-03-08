ALTER TABLE "profiles" ADD COLUMN "unspent_stat_points" integer DEFAULT 12 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "stat_charisma" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "stat_curiosity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "stat_perception" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "stat_stamina" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "stat_intellect" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "stat_willpower" SET DEFAULT 0;--> statement-breakpoint
