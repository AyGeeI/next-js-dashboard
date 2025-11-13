import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { device_id, context_uri, uris, offset, position_ms } = body;

    // Erstelle den Request Body basierend auf den übergebenen Parametern
    const requestBody: any = {};
    if (context_uri) requestBody.context_uri = context_uri;
    if (uris) requestBody.uris = uris;
    if (offset !== undefined) requestBody.offset = offset;
    if (position_ms !== undefined) requestBody.position_ms = position_ms;

    // Erstelle die URL mit optionalem device_id Parameter
    let url = "/me/player/play";
    if (device_id) {
      url += `?device_id=${device_id}`;
    }

    const { error } = await spotifyApiRequest<any>(
      session.user.id,
      url,
      {
        method: "PUT",
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
      }
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Play request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
