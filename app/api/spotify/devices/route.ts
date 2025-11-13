import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { spotifyApiRequest } from "@/lib/spotify/token";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { data, error } = await spotifyApiRequest<any>(
      session.user.id,
      "/me/player/devices"
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ devices: [] });
    }

    // Extrahiere relevante Daten
    const devices = data.devices?.map((device: any) => ({
      id: device.id,
      is_active: device.is_active,
      is_private_session: device.is_private_session,
      is_restricted: device.is_restricted,
      name: device.name,
      type: device.type,
      volume_percent: device.volume_percent,
    }));

    return NextResponse.json({ devices: devices || [] });
  } catch (error) {
    console.error("Devices fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
