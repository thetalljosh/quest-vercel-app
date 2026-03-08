import { db } from "@/shared/db/client";
import { profiles } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { checkLevelUp } from "./xpEngine";

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
