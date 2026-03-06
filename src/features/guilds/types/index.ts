import type { GuildCrestPreset, GuildRole } from "@/shared/lib/constants";

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  creatorName: string | null;
  creatorEmail: string;
  crestPreset: GuildCrestPreset;
  createdAt: Date;
}

export interface GuildMembership {
  id: string;
  guildId: string;
  userId: string;
  role: GuildRole;
  createdAt: Date;
}

export interface GuildJoinRequest {
  id: string;
  guildId: string;
  requesterId: string;
  requesterName: string | null;
  requesterEmail: string;
  guildName: string;
  guildCrestPreset: GuildCrestPreset;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface GuildOption {
  id: string;
  name: string;
  crestPreset: GuildCrestPreset;
  role: GuildRole;
  creatorId: string;
}
