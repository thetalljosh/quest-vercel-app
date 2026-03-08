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
  "charisma",
  "curiosity",
  "perception",
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

export const STAT_LABELS: Record<StatName, string> = {
  stamina: "Stamina",
  intellect: "Intellect",
  willpower: "Willpower",
  charisma: "Charisma",
  curiosity: "Curiosity",
  perception: "Perception",
};

export const STAT_COLORS: Record<StatName, string> = {
  stamina: "bg-red-500",
  intellect: "bg-blue-500",
  willpower: "bg-purple-500",
  charisma: "bg-pink-500",
  curiosity: "bg-emerald-500",
  perception: "bg-amber-500",
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

/** RPG-themed words used to generate private guild join phrases. */
export const PHRASE_WORDS = [
  "ember", "shadow", "rune", "forge", "crest", "vale", "iron",
  "storm", "frost", "flame", "thorn", "crown", "blade", "dawn",
  "dusk", "ash", "stone", "hawk", "wolf", "oak", "pine", "silver",
  "bolt", "gale", "moss", "fang", "claw", "bone", "shield", "helm",
  "torch", "mist", "drake", "wyrm", "shard", "veil", "spire",
  "hollow", "ridge", "cairn", "sigil", "glyph", "anvil", "scroll",
  "oracle", "titan", "golem", "raven", "lion", "stag", "viper",
  "echo", "brine", "rift", "peak", "grove", "basalt", "onyx",
  "cobalt", "crimson", "verdant", "arcane", "mystic", "primal",
  "ancient", "eternal", "silent", "hidden", "sacred", "fallen",
  "wild", "iron", "golden", "obsidian", "crystal", "amber",
  "sapphire", "ivory", "phantom", "warden", "sentinel", "nomad",
  "pilgrim", "herald", "arbiter", "keeper", "hunter", "seeker",
  "wanderer", "champion", "tempest", "summit", "abyss", "zenith",
  "harbor", "bastion", "citadel", "rampart", "paragon", "spectre",
] as const;
