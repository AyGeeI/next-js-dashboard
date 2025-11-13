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
      "/me/playlists?limit=20"
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ playlists: [] });
    }

    // Extrahiere relevante Daten
    const playlists = data.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      images: item.images || [],
      tracks: {
        total: item.tracks?.total || 0,
      },
      external_urls: item.external_urls,
      owner: {
        display_name: item.owner?.display_name,
      },
    }));

    return NextResponse.json({ playlists: playlists || [] });
  } catch (error) {
    console.error("Playlists fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
