import type { Profile } from "@/features/character/types";
import { xpThresholdForLevel } from "@/features/character/lib/xpEngine";
import { LevelBadge } from "./LevelBadge";
import { XpProgressBar } from "./XpProgressBar";
import { StatBar } from "./StatBar";
import { STAT_COLORS, STAT_LABELS, STAT_NAMES } from "@/shared/lib/constants";

interface CharacterSheetProps {
  profile: Profile;
  completionStreak: number;
}

export function CharacterSheet({ profile, completionStreak }: CharacterSheetProps) {
  const nextLevelXp = xpThresholdForLevel(profile.level + 1);

  return (
    <div className="parchment-card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="rpg-heading text-xl">
          {profile.displayName}
        </h2>
        <LevelBadge level={profile.level} />
      </div>

      <div className="mt-4">
        <XpProgressBar currentXp={profile.currentXp} nextLevelXp={nextLevelXp} />
      </div>

      <div className="mt-4 parchment-sunken rounded-lg px-3 py-2">
        <p className="rpg-subhead">Completion Streak</p>
        <p className="rpg-heading mt-1 text-lg">
          🔥 {completionStreak}
        </p>
      </div>

      <div className="mt-3 parchment-sunken rounded-lg px-3 py-2">
        <p className="rpg-subhead">Unspent Trait Points</p>
        <p className="rpg-heading mt-1 text-lg">✨ {profile.unspentStatPoints}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {STAT_NAMES.map((stat) => {
          const valueByStat = {
            stamina: profile.statStamina,
            intellect: profile.statIntellect,
            willpower: profile.statWillpower,
            charisma: profile.statCharisma,
            curiosity: profile.statCuriosity,
            perception: profile.statPerception,
          };

          return (
            <StatBar
              key={stat}
              label={STAT_LABELS[stat]}
              value={valueByStat[stat]}
              color={STAT_COLORS[stat]}
            />
          );
        })}
      </div>
    </div>
  );
}
