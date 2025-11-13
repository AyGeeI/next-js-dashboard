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
    const positionMs = searchParams.get("position_ms");
    const deviceId = searchParams.get("device_id");

    if (!positionMs) {
      return NextResponse.json({ error: "Position_ms parameter ist erforderlich." }, { status: 400 });
    }

    const position = parseInt(positionMs, 10);
    if (isNaN(position) || position < 0) {
      return NextResponse.json({ error: "Position_ms muss eine positive Zahl sein." }, { status: 400 });
    }

    let url = `/me/player/seek?position_ms=${position}`;
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
    console.error("Seek request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
