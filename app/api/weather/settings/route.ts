import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { weatherSettingsSchema } from "@/lib/validation/weather";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const settings = await prisma.weatherPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      return NextResponse.json({ error: "Keine Einstellungen gefunden." }, { status: 404 });
    }

    return NextResponse.json({
      zip: settings.zip,
      countryCode: settings.countryCode,
      apiKey: settings.apiKey,
    });
  } catch (error) {
    console.error("Weather settings (GET) failed:", error);
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
    const result = weatherSettingsSchema.safeParse(json);

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

    const { zip, countryCode, apiKey } = result.data;
    const normalizedZip = zip.trim();
    const normalizedCountry = countryCode.trim().toLowerCase();
    const normalizedApiKey = apiKey.trim();

    const preference = await prisma.weatherPreference.upsert({
      where: { userId: session.user.id },
      update: {
        zip: normalizedZip,
        countryCode: normalizedCountry,
        apiKey: normalizedApiKey,
      },
      create: {
        userId: session.user.id,
        zip: normalizedZip,
        countryCode: normalizedCountry,
        apiKey: normalizedApiKey,
      },
    });

    return NextResponse.json({
      message: "Wetter-Einstellungen gespeichert.",
      settings: {
        zip: preference.zip,
        countryCode: preference.countryCode,
        apiKey: preference.apiKey,
      },
    });
  } catch (error) {
    console.error("Weather settings (PUT) failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
