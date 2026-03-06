import { NextResponse } from "next/server";
import { approveGuildJoinRequestByToken } from "@/app/(dashboard)/guilds/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");
  const token = searchParams.get("token");

  if (!requestId || !token) {
    return NextResponse.redirect(new URL("/guilds?approved=0", request.url));
  }

  const approved = await approveGuildJoinRequestByToken(requestId, token);
  return NextResponse.redirect(new URL(`/guilds?approved=${approved ? "1" : "0"}`, request.url));
}
