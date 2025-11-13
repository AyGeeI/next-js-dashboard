import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";
import { spotifyTimeRangeSchema } from "@/lib/validation/spotify";
import { getCacheData, setCacheData, createCacheKey, clearCacheData } from "@/lib/spotify/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    // Hole den Zeitraum-Parameter
    const searchParams = request.nextUrl.searchParams;
    const timeRangeParam = searchParams.get("time_range") || "medium_term";
    const forceRefresh = searchParams.get("refresh") === "true";

    const timeRangeResult = spotifyTimeRangeSchema.safeParse(timeRangeParam);
    const timeRange = timeRangeResult.success ? timeRangeResult.data : "medium_term";

    const cacheKey = createCacheKey(session.user.id, "top-artists", timeRange);

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
      `/me/top/artists?time_range=${timeRange}&limit=20`
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ artists: [] });
    }

    // Extrahiere relevante Daten
    const artists = data.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres || [],
      images: item.images || [],
      external_urls: item.external_urls,
    }));

    const result = { artists: artists || [] };

    // Speichere im Cache
    setCacheData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Top artists fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
