import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import {
  approveGuildJoinRequestAction,
  createGuildAction,
  deleteGuildAction,
  joinPrivateGuildAction,
  regenerateJoinPhraseAction,
  rejectGuildJoinRequestAction,
  requestJoinGuildAction,
  setGuildMemberRoleAction,
  toggleGuildVisibilityAction,
  transferGuildOwnershipAction,
} from "./actions";
import {
  getCreatorGuildMemberRoster,
  getGuildCombinedTraits,
  getGuildDashboardData,
} from "@/features/guilds/lib/queries";
import { GUILD_CREST_LABELS, GUILD_CREST_PRESETS } from "@/shared/lib/constants";
import { GuildCrest } from "@/features/guilds/components/GuildCrest";
import { GuildTraitRadar } from "@/features/guilds/components/GuildTraitRadar";
import { ConfirmButton } from "@/features/guilds/components/ConfirmButton";

interface GuildsPageProps {
  searchParams: Promise<{ creator?: string; approved?: string }>;
}

export default async function GuildsPage({ searchParams }: GuildsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const params = await searchParams;
  const creatorFilter = params.creator ?? "all";

  const data = await getGuildDashboardData(session.user.id);
  const creatorGuildRosters = await getCreatorGuildMemberRoster(userId);
  const guildTraitData = await getGuildCombinedTraits(data.myGuilds.map((guild) => guild.id));

  const filteredGuilds = data.myGuilds.filter((guild) => {
    if (creatorFilter === "self") {
      return guild.creatorId === userId;
    }
    if (creatorFilter === "other") {
      return guild.creatorId !== userId;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="rpg-heading text-3xl">Guilds</h1>

      {params.approved === "1" && (
        <div className="parchment-sunken rounded-lg p-3 text-sm">
          Join request approved via email.
        </div>
      )}

      <div className="parchment-card rounded-xl p-5">
        <h2 className="rpg-heading text-xl">Create Guild</h2>
        <div className="ornamental-divider my-3" />
        <form action={createGuildAction} className="grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Guild name" className="rpg-input" />
          <select name="crestPreset" className="rpg-select" defaultValue="lion">
            {GUILD_CREST_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {GUILD_CREST_LABELS[preset]}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Guild description"
            rows={2}
            className="rpg-textarea md:col-span-2"
          />
          <button type="submit" className="rpg-button px-4 py-2 text-sm md:col-span-2">
            Forge Guild
          </button>
        </form>
      </div>

      <div className="parchment-card rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="rpg-heading text-xl">My Guilds</h2>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
            <a href="/guilds?creator=all" className={`quest-tab ${creatorFilter === "all" ? "quest-tab-active" : ""}`}>
              All
            </a>
            <a href="/guilds?creator=self" className={`quest-tab ${creatorFilter === "self" ? "quest-tab-active" : ""}`}>
              Creator: Me
            </a>
            <a href="/guilds?creator=other" className={`quest-tab ${creatorFilter === "other" ? "quest-tab-active" : ""}`}>
              Creator: Other
            </a>
          </div>
        </div>
        <div className="ornamental-divider mb-3" />
        {filteredGuilds.length === 0 ? (
          <p className="text-sm text-[var(--muted-text)]">No guilds for this filter yet.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filteredGuilds.map((guild) => {
              const isOwner = guild.creatorId === userId;

              return (
                <li key={guild.id} className="parchment-sunken rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <GuildCrest preset={guild.crestPreset} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="rpg-heading text-lg">{guild.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            guild.isPublic
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {guild.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-text)]">
                        Role: {guild.role} • Creator: {guild.creatorName ?? guild.creatorEmail}
                      </p>
                    </div>
                  </div>
                  {guild.description && (
                    <p className="mt-2 text-sm text-[var(--muted-text)]">{guild.description}</p>
                  )}

                  {/* Private guild join phrase (visible to owner only) */}
                  {isOwner && !guild.isPublic && guild.joinPhrase && (
                    <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2">
                      <p className="text-[10px] uppercase tracking-wider text-amber-300">
                        Join Phrase
                      </p>
                      <p className="mt-0.5 font-mono text-sm text-amber-200">
                        {guild.joinPhrase}
                      </p>
                      <form action={regenerateJoinPhraseAction} className="mt-1">
                        <input type="hidden" name="guildId" value={guild.id} />
                        <button
                          type="submit"
                          className="text-[10px] uppercase tracking-wider text-amber-400 underline hover:text-amber-300"
                        >
                          Regenerate
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Owner controls */}
                  {isOwner && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={toggleGuildVisibilityAction}>
                        <input type="hidden" name="guildId" value={guild.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--border)]"
                        >
                          Make {guild.isPublic ? "Private" : "Public"}
                        </button>
                      </form>
                      <ConfirmButton
                        action={deleteGuildAction}
                        hiddenFields={{ guildId: guild.id }}
                        confirmMessage="Are you sure you want to delete this guild? This cannot be undone."
                        className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        Delete Guild
                      </ConfirmButton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {guildTraitData.length > 0 && (
        <div className="parchment-card rounded-xl p-5">
          <h2 className="rpg-heading text-xl">Guild Trait Radar</h2>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Compare total guild traits and per-member averages.
          </p>
          <div className="ornamental-divider my-3" />

          <div className="space-y-3">
            {data.myGuilds.map((guild) => {
              const stats = guildTraitData.find((entry) => entry.guildId === guild.id);
              if (!stats) return null;

              return (
                <GuildTraitRadar
                  key={guild.id}
                  guildName={guild.name}
                  memberCount={stats.memberCount}
                  totals={stats.totals}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="parchment-card rounded-xl p-5">
          <h2 className="rpg-heading text-xl">Pending Requests</h2>
          <div className="ornamental-divider my-3" />
          {data.pendingApprovals.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">No pending requests.</p>
          ) : (
            <ul className="space-y-3">
              {data.pendingApprovals.map((request) => (
                <li key={request.id} className="parchment-sunken rounded-lg p-3">
                  <p className="text-sm">
                    <strong>{request.requesterName ?? request.requesterEmail}</strong> wants to join <strong>{request.guildName}</strong>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <form action={approveGuildJoinRequestAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <button type="submit" className="rpg-button px-3 py-1.5 text-xs">Approve</button>
                    </form>
                    <form action={rejectGuildJoinRequestAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <button type="submit" className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs">Reject</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="parchment-card rounded-xl p-5">
          <h2 className="rpg-heading text-xl">Discover Guilds</h2>
          <div className="ornamental-divider my-3" />

          {/* Join private guild form */}
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
              Join a Private Guild
            </p>
            <form action={joinPrivateGuildAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                name="guildName"
                required
                placeholder="Guild name"
                className="rpg-input text-sm"
              />
              <input
                name="joinPhrase"
                required
                placeholder="Join phrase (e.g. ember-forge-summit)"
                className="rpg-input text-sm"
              />
              <button type="submit" className="rpg-button px-3 py-1.5 text-xs whitespace-nowrap">
                Join
              </button>
            </form>
          </div>

          {data.discoverGuilds.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">No public guilds available to join.</p>
          ) : (
            <ul className="space-y-3">
              {data.discoverGuilds.map((guild) => (
                <li key={guild.id} className="parchment-sunken rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <GuildCrest preset={guild.crestPreset} size="sm" />
                    <div>
                      <p className="font-semibold">{guild.name}</p>
                      <p className="text-xs text-[var(--muted-text)]">Created by {guild.creatorName ?? guild.creatorEmail}</p>
                    </div>
                  </div>
                  <form action={requestJoinGuildAction} className="mt-2">
                    <input type="hidden" name="guildId" value={guild.id} />
                    <button type="submit" className="rpg-button px-3 py-1.5 text-xs">Request Join</button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {data.outgoingRequests.length > 0 && (
            <>
              <h3 className="rpg-heading mt-6 text-lg">My Requests</h3>
              <ul className="mt-2 space-y-2">
                {data.outgoingRequests.map((request) => (
                  <li key={request.id} className="text-sm text-[var(--muted-text)]">
                    {request.guildName} • {request.status}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {creatorGuildRosters.length > 0 && (
        <div className="parchment-card rounded-xl p-5">
          <h2 className="rpg-heading text-xl">Admin Role Management</h2>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            As creator, you can promote members to admin or demote admins back to member.
          </p>
          <div className="ornamental-divider my-3" />

          <div className="space-y-4">
            {creatorGuildRosters.map((guild) => (
              <div key={guild.id} className="parchment-sunken rounded-lg p-3">
                <div className="mb-3 flex items-center gap-2">
                  <GuildCrest preset={guild.crestPreset} size="sm" />
                  <p className="rpg-heading text-lg">{guild.name}</p>
                </div>

                <ul className="space-y-2">
                  {guild.members.map((member) => (
                    <li
                      key={member.userId}
                      className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {member.userName ?? member.userEmail}
                        </p>
                        <p className="text-xs text-[var(--muted-text)]">
                          {member.userEmail} • {member.role}
                        </p>
                      </div>

                      {member.role !== "creator" && (
                        <div className="flex gap-2">
                          <form action={setGuildMemberRoleAction}>
                            <input type="hidden" name="guildId" value={guild.id} />
                            <input type="hidden" name="memberUserId" value={member.userId} />
                            <input
                              type="hidden"
                              name="role"
                              value={member.role === "admin" ? "member" : "admin"}
                            />
                            <button type="submit" className="rpg-button px-3 py-1.5 text-xs">
                              {member.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                            </button>
                          </form>

                          {member.role === "admin" && (
                            <ConfirmButton
                              action={transferGuildOwnershipAction}
                              hiddenFields={{ guildId: guild.id, newOwnerUserId: member.userId }}
                              confirmMessage="Transfer ownership to this admin? You will be demoted to admin."
                              className="rounded-md border border-amber-500/40 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10"
                            >
                              Transfer Ownership
                            </ConfirmButton>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
