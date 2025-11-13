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
    const volumePercent = searchParams.get("volume_percent");
    const deviceId = searchParams.get("device_id");

    if (!volumePercent) {
      return NextResponse.json({ error: "Volume percent parameter (0-100) ist erforderlich." }, { status: 400 });
    }

    const volume = parseInt(volumePercent, 10);
    if (isNaN(volume) || volume < 0 || volume > 100) {
      return NextResponse.json({ error: "Volume muss zwischen 0 und 100 liegen." }, { status: 400 });
    }

    let url = `/me/player/volume?volume_percent=${volume}`;
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
    console.error("Volume request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
