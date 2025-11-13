import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";
import { spotifyTimeRangeSchema } from "@/lib/validation/spotify";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    // Hole den Zeitraum-Parameter
    const searchParams = request.nextUrl.searchParams;
    const timeRangeParam = searchParams.get("time_range") || "medium_term";

    const timeRangeResult = spotifyTimeRangeSchema.safeParse(timeRangeParam);
    const timeRange = timeRangeResult.success ? timeRangeResult.data : "medium_term";

    const { data, error } = await spotifyApiRequest<any>(
      session.user.id,
      `/me/top/tracks?time_range=${timeRange}&limit=20`
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ tracks: [] });
    }

    // Extrahiere relevante Daten
    const tracks = data.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      artists: item.artists?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      })),
      album: {
        id: item.album?.id,
        name: item.album?.name,
        images: item.album?.images,
      },
      duration_ms: item.duration_ms,
      external_urls: item.external_urls,
    }));

    return NextResponse.json({ tracks: tracks || [] });
  } catch (error) {
    console.error("Top tracks fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
