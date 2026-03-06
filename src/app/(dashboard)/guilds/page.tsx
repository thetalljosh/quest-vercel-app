import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import {
  approveGuildJoinRequestAction,
  createGuildAction,
  rejectGuildJoinRequestAction,
  requestJoinGuildAction,
  setGuildMemberRoleAction,
} from "./actions";
import {
  getCreatorGuildMemberRoster,
  getGuildDashboardData,
} from "@/features/guilds/lib/queries";
import { GUILD_CREST_LABELS, GUILD_CREST_PRESETS } from "@/shared/lib/constants";
import { GuildCrest } from "@/features/guilds/components/GuildCrest";

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
            {filteredGuilds.map((guild) => (
              <li key={guild.id} className="parchment-sunken rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <GuildCrest preset={guild.crestPreset} />
                  <div>
                    <p className="rpg-heading text-lg">{guild.name}</p>
                    <p className="text-xs text-[var(--muted-text)]">
                      Role: {guild.role} • Creator: {guild.creatorName ?? guild.creatorEmail}
                    </p>
                  </div>
                </div>
                {guild.description && (
                  <p className="mt-2 text-sm text-[var(--muted-text)]">{guild.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

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
