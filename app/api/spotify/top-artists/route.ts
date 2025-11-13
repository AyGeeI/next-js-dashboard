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

    return NextResponse.json({ artists: artists || [] });
  } catch (error) {
    console.error("Top artists fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
