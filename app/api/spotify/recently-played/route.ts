import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";
import { getCacheData, setCacheData, createCacheKey, clearCacheData } from "@/lib/spotify/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "true";

    const cacheKey = createCacheKey(session.user.id, "recently-played");

    // Wenn forceRefresh, lösche den Cache
    if (forceRefresh) {
      clearCacheData(cacheKey);
    }

    // Prüfe Cache
    const cachedData = getCacheData<any>(cacheKey);
    if (cachedData && !forceRefresh) {
      return NextResponse.json(cachedData);
    }

    const { data, error } = await spotifyApiRequest<any>(
      session.user.id,
      "/me/player/recently-played?limit=20"
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ tracks: [] });
    }

    // Extrahiere relevante Daten
    const tracks = data.items?.map((item: any) => ({
      played_at: item.played_at,
      track: {
        id: item.track?.id,
        name: item.track?.name,
        artists: item.track?.artists?.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: item.track?.album?.id,
          name: item.track?.album?.name,
          images: item.track?.album?.images,
        },
        duration_ms: item.track?.duration_ms,
        external_urls: item.track?.external_urls,
      },
    }));

    const result = { tracks: tracks || [] };

    // Speichere im Cache
    setCacheData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recently played fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
