import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { data, error } = await spotifyApiRequest<any>(
      session.user.id,
      "/me/player/currently-playing"
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data || !data.item) {
      // Nichts wird gerade abgespielt
      return NextResponse.json({ playing: false, track: null });
    }

    // Extrahiere relevante Daten
    const track = {
      id: data.item.id,
      name: data.item.name,
      artists: data.item.artists?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      })) || [],
      album: {
        id: data.item.album?.id,
        name: data.item.album?.name,
        images: data.item.album?.images || [],
      },
      duration_ms: data.item.duration_ms,
      progress_ms: data.progress_ms,
      is_playing: data.is_playing,
      external_urls: data.item.external_urls,
    };

    return NextResponse.json({
      playing: data.is_playing,
      track,
    });
  } catch (error) {
    console.error("Currently playing fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
