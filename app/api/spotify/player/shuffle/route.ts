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
    const state = searchParams.get("state"); // true or false
    const deviceId = searchParams.get("device_id");

    if (!state || (state !== "true" && state !== "false")) {
      return NextResponse.json({ error: "State parameter (true/false) ist erforderlich." }, { status: 400 });
    }

    let url = `/me/player/shuffle?state=${state}`;
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
    console.error("Shuffle request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
