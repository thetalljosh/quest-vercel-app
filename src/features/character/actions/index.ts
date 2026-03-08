"use server";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/shared/db/client";
import { profiles } from "@/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const traitAllocationSchema = z.object({
  stamina: z.coerce.number().int().min(0),
  intellect: z.coerce.number().int().min(0),
  willpower: z.coerce.number().int().min(0),
  charisma: z.coerce.number().int().min(0),
  curiosity: z.coerce.number().int().min(0),
  perception: z.coerce.number().int().min(0),
});

function getSpentPoints(allocation: z.infer<typeof traitAllocationSchema>) {
  return (
    allocation.stamina +
    allocation.intellect +
    allocation.willpower +
    allocation.charisma +
    allocation.curiosity +
    allocation.perception
  );
}

export async function allocateInitialTraits(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const allocation = traitAllocationSchema.parse({
    stamina: formData.get("stamina"),
    intellect: formData.get("intellect"),
    willpower: formData.get("willpower"),
    charisma: formData.get("charisma"),
    curiosity: formData.get("curiosity"),
    perception: formData.get("perception"),
  });

  const spent = getSpentPoints(allocation);
  if (spent !== 12) {
    throw new Error("You must allocate exactly 12 trait points.");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  if (!profile) throw new Error("Profile not found");

  if (
    profile.statStamina +
      profile.statIntellect +
      profile.statWillpower +
      profile.statCharisma +
      profile.statCuriosity +
      profile.statPerception >
    0
  ) {
    redirect("/character");
  }

  if (profile.unspentStatPoints < 12) {
    throw new Error("Not enough unspent trait points.");
  }

  await db
    .update(profiles)
    .set({
      statStamina: allocation.stamina,
      statIntellect: allocation.intellect,
      statWillpower: allocation.willpower,
      statCharisma: allocation.charisma,
      statCuriosity: allocation.curiosity,
      statPerception: allocation.perception,
      unspentStatPoints: profile.unspentStatPoints - spent,
    })
    .where(eq(profiles.id, session.user.id));

  revalidatePath("/character");
  revalidatePath("/guilds");
  redirect("/character");
}

export async function allocateTraitPoints(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const allocation = traitAllocationSchema.parse({
    stamina: formData.get("stamina"),
    intellect: formData.get("intellect"),
    willpower: formData.get("willpower"),
    charisma: formData.get("charisma"),
    curiosity: formData.get("curiosity"),
    perception: formData.get("perception"),
  });

  const spent = getSpentPoints(allocation);
  if (spent <= 0) {
    throw new Error("Allocate at least one point.");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  if (!profile) throw new Error("Profile not found");

  if (spent > profile.unspentStatPoints) {
    throw new Error("You cannot spend more points than available.");
  }

  await db
    .update(profiles)
    .set({
      statStamina: profile.statStamina + allocation.stamina,
      statIntellect: profile.statIntellect + allocation.intellect,
      statWillpower: profile.statWillpower + allocation.willpower,
      statCharisma: profile.statCharisma + allocation.charisma,
      statCuriosity: profile.statCuriosity + allocation.curiosity,
      statPerception: profile.statPerception + allocation.perception,
      unspentStatPoints: profile.unspentStatPoints - spent,
    })
    .where(and(eq(profiles.id, session.user.id), eq(profiles.unspentStatPoints, profile.unspentStatPoints)));

  revalidatePath("/character");
  revalidatePath("/guilds");
}
