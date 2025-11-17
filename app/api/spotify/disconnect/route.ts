import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    // Lösche die Spotify-Tokens, behalte aber die Client-Credentials
    await prisma.spotifyPreference.update({
      where: { userId: session.user.id },
      data: {
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Spotify disconnect failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
