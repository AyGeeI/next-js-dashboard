import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    // Hole die Spotify-Einstellungen des Benutzers
    const settings = await prisma.spotifyPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Keine Spotify-Einstellungen gefunden. Bitte konfiguriere zuerst deine Client-Credentials." },
        { status: 404 }
      );
    }

    // Erstelle die Spotify Authorization URL
    const scopes = [
      "user-read-currently-playing",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-playback-position",
      "user-top-read",
      "user-read-recently-played",
      "playlist-read-private",
      "playlist-read-collaborative",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: settings.clientId,
      response_type: "code",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`,
      scope: scopes,
      state: session.user.id, // Verwende User-ID als State für zusätzliche Sicherheit
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Spotify auth URL generation failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
