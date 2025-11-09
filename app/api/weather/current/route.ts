import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

const WEATHER_SERVICE_ENDPOINT =
  process.env.WEATHER_SERVICE_ENDPOINT ?? "https://n8n.vyrnix.net/webhook/weather-by-zip";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const preference = await prisma.weatherPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!preference) {
      return NextResponse.json({ error: "Keine Wetter-Einstellungen vorhanden." }, { status: 404 });
    }

    const requestUrl = new URL(WEATHER_SERVICE_ENDPOINT);
    requestUrl.searchParams.set("zip", preference.zip);
    requestUrl.searchParams.set("country-code", preference.countryCode);
    requestUrl.searchParams.set("api", preference.apiKey);

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Weather service responded with error:", response.status, text);
      return NextResponse.json(
        { error: "Abruf der Wetterdaten fehlgeschlagen." },
        { status: 502 }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Weather data fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
