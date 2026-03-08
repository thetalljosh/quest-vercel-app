import { auth } from "@/features/auth/lib/auth";
import { getProfile } from "@/features/character/lib/queries";
import { TraitAllocationPanel } from "@/features/character/components/TraitAllocationPanel";
import { allocateInitialTraits } from "@/features/character/actions";
import { redirect } from "next/navigation";

export default async function CharacterCreatePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getProfile(session.user.id);
  if (!profile) {
    redirect("/character");
  }

  const totalTraits =
    profile.statStamina +
    profile.statIntellect +
    profile.statWillpower +
    profile.statCharisma +
    profile.statCuriosity +
    profile.statPerception;

  if (totalTraits > 0 || profile.unspentStatPoints < 12) {
    redirect("/character");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="rpg-heading text-3xl">Forge Your Character</h1>
      <p className="text-sm text-[var(--muted-text)]">
        You have 12 points to distribute across your six core traits.
      </p>

      <TraitAllocationPanel
        availablePoints={12}
        title="Initial Trait Allocation"
        description="This sets your starting build. You can gain and spend more points as you level up."
        submitLabel="Begin Adventure"
        requireExactAllocation
        action={allocateInitialTraits}
      />
    </div>
  );
}
