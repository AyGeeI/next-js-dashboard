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
    const { uri, device_id } = body;

    if (!uri) {
      return NextResponse.json({ error: "URI ist erforderlich." }, { status: 400 });
    }

    // Erstelle die URL mit optionalem device_id Parameter
    let url = "/me/player/play";
    if (device_id) {
      url += `?device_id=${device_id}`;
    }

    const requestBody = {
      uris: [uri],
      position_ms: 0,
    };

    const { error } = await spotifyApiRequest<any>(
      session.user.id,
      url,
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
    console.error("Play now request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
