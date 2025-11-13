import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { data, error } = await spotifyApiRequest<any>(
      session.user.id,
      "/me/player/queue"
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ currently_playing: null, queue: [] });
    }

    // Extrahiere currently playing track
    const currentlyPlaying = data.currently_playing ? {
      id: data.currently_playing.id,
      name: data.currently_playing.name,
      artists: data.currently_playing.artists?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      })) || [],
      album: {
        id: data.currently_playing.album?.id,
        name: data.currently_playing.album?.name,
        images: data.currently_playing.album?.images || [],
      },
      duration_ms: data.currently_playing.duration_ms,
      external_urls: data.currently_playing.external_urls,
    } : null;

    // Extrahiere Queue
    const queue = data.queue?.map((item: any) => ({
      id: item.id,
      name: item.name,
      artists: item.artists?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      })) || [],
      album: {
        id: item.album?.id,
        name: item.album?.name,
        images: item.album?.images || [],
      },
      duration_ms: item.duration_ms,
      external_urls: item.external_urls,
    })) || [];

    return NextResponse.json({
      currently_playing: currentlyPlaying,
      queue,
    });
  } catch (error) {
    console.error("Queue fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
