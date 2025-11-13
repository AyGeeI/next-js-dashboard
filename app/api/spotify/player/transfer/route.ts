import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const body = await request.json();
    const { device_ids, play } = body;

    if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
      return NextResponse.json({ error: "Device_ids array ist erforderlich." }, { status: 400 });
    }

    const requestBody = {
      device_ids,
      play: play !== undefined ? play : false,
    };

    const { error } = await spotifyApiRequest<any>(
      session.user.id,
      "/me/player",
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
      }
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transfer playback request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
