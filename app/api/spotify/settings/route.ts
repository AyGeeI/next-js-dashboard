import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { spotifySettingsSchema } from "@/lib/validation/spotify";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const settings = await prisma.spotifyPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      return NextResponse.json({ error: "Keine Einstellungen gefunden." }, { status: 404 });
    }

    return NextResponse.json({
      clientId: settings.clientId,
      clientSecret: settings.clientSecret,
      isConnected: !!settings.refreshToken,
    });
  } catch (error) {
    console.error("Spotify settings (GET) failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const json = await request.json();
    const result = spotifySettingsSchema.safeParse(json);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        { error: "Validierung fehlgeschlagen.", errors },
        { status: 400 }
      );
    }

    const { clientId, clientSecret } = result.data;
    const normalizedClientId = clientId.trim();
    const normalizedClientSecret = clientSecret.trim();

    const preference = await prisma.spotifyPreference.upsert({
      where: { userId: session.user.id },
      update: {
        clientId: normalizedClientId,
        clientSecret: normalizedClientSecret,
      },
      create: {
        userId: session.user.id,
        clientId: normalizedClientId,
        clientSecret: normalizedClientSecret,
      },
    });

    return NextResponse.json({
      message: "Spotify-Einstellungen gespeichert.",
      settings: {
        clientId: preference.clientId,
        clientSecret: preference.clientSecret,
        isConnected: !!preference.refreshToken,
      },
    });
  } catch (error) {
    console.error("Spotify settings (PUT) failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
