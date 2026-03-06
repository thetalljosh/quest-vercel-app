export const QUEST_TYPES = [
  "main",
  "character",
  "event",
  "world",
  "side",
  "commission",
] as const;

export type QuestType = (typeof QUEST_TYPES)[number];

export const QUEST_STATUSES = [
  "backlog",
  "active",
  "in_progress",
  "review",
  "completed",
  "failed",
] as const;

export type QuestStatus = (typeof QUEST_STATUSES)[number];

export const QUEST_PRIORITIES = [
  "critical",
  "high",
  "moderate",
  "low",
] as const;

export type QuestPriority = (typeof QUEST_PRIORITIES)[number];

export const GUILD_ROLES = [
  "creator",
  "admin",
  "member",
] as const;

export type GuildRole = (typeof GUILD_ROLES)[number];

export const BOARD_SCOPES = [
  "personal",
  "guild",
  "combined",
] as const;

export type BoardScope = (typeof BOARD_SCOPES)[number];

export const GUILD_CREST_PRESETS = [
  "lion",
  "phoenix",
  "raven",
  "oak",
  "wolf",
] as const;

export type GuildCrestPreset = (typeof GUILD_CREST_PRESETS)[number];

export const QUEST_LOG_ACTIONS = [
  "created",
  "started",
  "completed",
  "failed",
  "moved",
  "reopened",
] as const;

export type QuestLogAction = (typeof QUEST_LOG_ACTIONS)[number];

export const STAT_NAMES = [
  "stamina",
  "intellect",
  "willpower",
] as const;

export type StatName = (typeof STAT_NAMES)[number];

/** Base XP reward ranges per quest type [min, max]. */
export const XP_BASE_RANGES: Record<QuestType, [number, number]> = {
  commission: [10, 25],
  side: [25, 50],
  character: [30, 60],
  world: [40, 75],
  event: [50, 100],
  main: [100, 200],
};

/** Priority multiplier applied to base XP. */
export const PRIORITY_MULTIPLIERS: Record<QuestPriority, number> = {
  low: 1,
  moderate: 1.25,
  high: 1.5,
  critical: 2,
};

/** Stat point increments awarded per quest type completion. */
export const STAT_REWARDS: Record<QuestType, Record<StatName, number>> = {
  main: { stamina: 1, intellect: 2, willpower: 2 },
  character: { stamina: 0, intellect: 1, willpower: 2 },
  event: { stamina: 2, intellect: 1, willpower: 1 },
  world: { stamina: 1, intellect: 2, willpower: 0 },
  side: { stamina: 1, intellect: 1, willpower: 0 },
  commission: { stamina: 1, intellect: 0, willpower: 0 },
};

/** Kanban columns in display order. */
export const KANBAN_COLUMNS: QuestStatus[] = [
  "backlog",
  "active",
  "in_progress",
  "review",
];

export const KANBAN_CLOSED_COLUMNS: QuestStatus[] = [
  "completed",
  "failed",
];

/** Color classes for quest type badges. */
export const QUEST_TYPE_COLORS: Record<QuestType, string> = {
  main: "bg-amber-500 text-white",
  character: "bg-purple-500 text-white",
  event: "bg-red-500 text-white",
  world: "bg-green-600 text-white",
  side: "bg-blue-500 text-white",
  commission: "bg-gray-500 text-white",
};

/** Human-readable labels. */
export const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  main: "Main Quest",
  character: "Character Quest",
  event: "Event Quest",
  world: "World Quest",
  side: "Side Quest",
  commission: "Commission",
};

export const QUEST_TYPE_ICONS: Record<QuestType, string> = {
  main: "◈",
  character: "✦",
  event: "✶",
  world: "❖",
  side: "◇",
  commission: "⌘",
};

export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = {
  backlog: "Backlog",
  active: "Active",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
  failed: "Failed",
};

export const PRIORITY_LABELS: Record<QuestPriority, string> = {
  critical: "Critical",
  high: "High",
  moderate: "Moderate",
  low: "Low",
};

export const GUILD_CREST_LABELS: Record<GuildCrestPreset, string> = {
  lion: "Lion",
  phoenix: "Phoenix",
  raven: "Raven",
  oak: "Oak",
  wolf: "Wolf",
};
