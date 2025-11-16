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

    // Seed parameters (mind. einer erforderlich)
    const seedArtists = searchParams.get("seed_artists");
    const seedTracks = searchParams.get("seed_tracks");
    const seedGenres = searchParams.get("seed_genres");

    // Optional: Limit (default 20)
    const limit = searchParams.get("limit") || "20";

    // Validierung: mindestens ein Seed erforderlich
    if (!seedArtists && !seedTracks && !seedGenres) {
      return NextResponse.json(
        { error: "Mindestens ein seed_artists, seed_tracks oder seed_genres Parameter ist erforderlich." },
        { status: 400 }
      );
    }

    // Cache-Key basierend auf den Seeds erstellen
    const cacheKey = createCacheKey(
      session.user.id,
      "recommendations",
      `${seedArtists || ""}_${seedTracks || ""}_${seedGenres || ""}_${limit}`
    );

    if (forceRefresh) {
      clearCacheData(cacheKey);
    }

    const cachedData = getCacheData<any>(cacheKey);
    if (cachedData && !forceRefresh) {
      return NextResponse.json(cachedData);
    }

    // URL mit Parametern erstellen
    let url = `/recommendations?limit=${limit}`;
    if (seedArtists) url += `&seed_artists=${seedArtists}`;
    if (seedTracks) url += `&seed_tracks=${seedTracks}`;
    if (seedGenres) url += `&seed_genres=${seedGenres}`;

    const { data, error } = await spotifyApiRequest<any>(
      session.user.id,
      url
    );

    if (error) {
      console.error("Recommendations API error:", { error, url, seedArtists, seedTracks, seedGenres });
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ tracks: [] });
    }

    // Extrahiere relevante Daten
    const tracks = data.tracks?.map((item: any) => ({
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
      preview_url: item.preview_url,
      popularity: item.popularity,
    })) || [];

    const result = { tracks };

    // Speichere im Cache
    setCacheData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendations fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
