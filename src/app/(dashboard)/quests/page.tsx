import { auth } from "@/features/auth/lib/auth";
import { getQuestsByUser } from "@/features/quests/lib/queries";
import { QuestLogWrapper } from "@/features/quests/components/QuestLogWrapper";
import { QuestForm } from "@/features/quests/components/QuestForm";
import { moveQuestAction } from "./actions";

export default async function QuestsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const quests = await getQuestsByUser(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="rpg-heading text-3xl">Quest Board</h1>
      </div>

      <QuestLogWrapper
        initialQuests={quests}
        moveAction={moveQuestAction}
      />

      <div className="parchment-card mx-auto w-full max-w-xl rounded-xl p-5">
        <h2 className="rpg-heading mb-2 text-xl">Accept New Quest</h2>
        <div className="ornamental-divider mb-4" />
        <QuestForm />
      </div>
    </div>
  );
}
