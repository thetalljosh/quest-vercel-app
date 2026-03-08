import type { QuestType, QuestPriority } from "@/shared/lib/constants";
import {
  XP_BASE_RANGES,
  PRIORITY_MULTIPLIERS,
} from "@/shared/lib/constants";

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
