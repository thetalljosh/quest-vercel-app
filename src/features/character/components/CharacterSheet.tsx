import type { Profile } from "@/features/character/types";
import { xpThresholdForLevel } from "@/features/character/lib/xpEngine";
import { LevelBadge } from "./LevelBadge";
import { XpProgressBar } from "./XpProgressBar";
import { StatBar } from "./StatBar";

interface CharacterSheetProps {
  profile: Profile;
}

export function CharacterSheet({ profile }: CharacterSheetProps) {
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

      <div className="mt-6 flex flex-col gap-3">
        <StatBar
          label="Stamina"
          value={profile.statStamina}
          color="bg-red-500"
        />
        <StatBar
          label="Intellect"
          value={profile.statIntellect}
          color="bg-blue-500"
        />
        <StatBar
          label="Willpower"
          value={profile.statWillpower}
          color="bg-purple-500"
        />
      </div>
    </div>
  );
}
