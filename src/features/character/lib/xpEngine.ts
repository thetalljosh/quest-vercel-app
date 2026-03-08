import type { QuestType, QuestPriority } from "@/shared/lib/constants";
import {
  XP_BASE_RANGES,
  PRIORITY_MULTIPLIERS,
} from "@/shared/lib/constants";
import { db } from "@/shared/db/client";
import { profiles } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

/**
 * Calculate XP reward for a quest based on type and priority.
 * Returns the midpoint of the base range scaled by priority multiplier.
 */
export function calculateXpReward(
  questType: QuestType,
  priority: QuestPriority
): number {
  const [min, max] = XP_BASE_RANGES[questType];
  const base = Math.round((min + max) / 2);
  const multiplier = PRIORITY_MULTIPLIERS[priority];
  return Math.round(base * multiplier);
}

/**
 * Compute XP required to reach a given level.
 * Formula: cumulative sum of floor(100 * i^1.5) for i = 1..level.
 */
export function xpThresholdForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += Math.floor(100 * Math.pow(i, 1.5));
  }
  return total;
}

/**
 * Determine if totalXp warrants a level-up from currentLevel.
 * Returns the new level and whether a level-up occurred.
 */
export function checkLevelUp(
  currentLevel: number,
  totalXp: number
): { newLevel: number; didLevelUp: boolean } {
  let level = currentLevel;
  while (totalXp >= xpThresholdForLevel(level + 1)) {
    level++;
  }
  return { newLevel: level, didLevelUp: level > currentLevel };
}

function pointsGrantedForLevel(level: number): number {
  return Math.ceil(level / 5);
}

export async function awardXpForQuest(
  userId: string,
  quest: { xpReward: number }
): Promise<{ xpAwarded: number; didLevelUp: boolean; newLevel: number; levelsGained: number }> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) {
    return {
      xpAwarded: 0,
      didLevelUp: false,
      newLevel: 1,
      levelsGained: 0,
    };
  }

  const newTotal = profile.totalXp + quest.xpReward;
  const newCurrent = profile.currentXp + quest.xpReward;
  const { newLevel, didLevelUp } = checkLevelUp(profile.level, newTotal);
  const levelsGained = Math.max(0, newLevel - profile.level);

  let pointsAwarded = 0;
  if (levelsGained > 0) {
    for (let level = profile.level + 1; level <= newLevel; level++) {
      pointsAwarded += pointsGrantedForLevel(level);
    }
  }

  await db
    .update(profiles)
    .set({
      totalXp: newTotal,
      currentXp: newCurrent,
      level: newLevel,
      unspentStatPoints: profile.unspentStatPoints + pointsAwarded,
    })
    .where(eq(profiles.id, userId));

  return {
    xpAwarded: quest.xpReward,
    didLevelUp,
    newLevel,
    levelsGained,
  };
}
