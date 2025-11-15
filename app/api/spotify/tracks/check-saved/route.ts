import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json({ error: "IDs parameter ist erforderlich." }, { status: 400 });
    }

    const { data, error } = await spotifyApiRequest<boolean[]>(
      session.user.id,
      `/me/tracks/contains?ids=${ids}`
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ saved: data || [] });
  } catch (error) {
    console.error("Check saved tracks request failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
