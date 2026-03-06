import { auth } from "@/features/auth/lib/auth";
import {
  getCompletionStreak,
  getProfile,
  getRecentQuestLogs,
} from "@/features/character/lib/queries";
import { CharacterSheet } from "@/features/character/components/CharacterSheet";
import { formatDate } from "@/shared/lib/utils";

export default async function CharacterPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const profile = await getProfile(session.user.id);
  if (!profile) return <p>No character found. Complete a quest to begin!</p>;

  const logs = await getRecentQuestLogs(session.user.id);
  const completionStreak = await getCompletionStreak(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="rpg-heading text-3xl">Character Sheet</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <CharacterSheet profile={profile} completionStreak={completionStreak} />

        <div className="parchment-card rounded-xl p-6">
          <h2 className="rpg-heading mb-2 text-xl">Adventure Log</h2>
          <div className="ornamental-divider mb-4" />
          {logs.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">No adventures yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="parchment-sunken flex items-center justify-between rounded-lg
                             px-3 py-2 text-sm"
                >
                  <span className="capitalize">
                    {log.action.replaceAll("_", " ")} • {log.questTitle}
                  </span>
                  <span className="text-xs text-[var(--muted-text)]">
                    {formatDate(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
