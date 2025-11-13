import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state"); // track, context, or off
    const deviceId = searchParams.get("device_id");

    if (!state || !["track", "context", "off"].includes(state)) {
      return NextResponse.json({ error: "State parameter (track/context/off) ist erforderlich." }, { status: 400 });
    }

    let url = `/me/player/repeat?state=${state}`;
    if (deviceId) {
      url += `&device_id=${deviceId}`;
    }

    const { error } = await spotifyApiRequest<any>(
      session.user.id,
      url,
      { method: "PUT" }
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Repeat request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
