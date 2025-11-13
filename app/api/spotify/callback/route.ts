import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Fehlerbehandlung
    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=spotify_auth_denied`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=spotify_no_code`, request.url)
      );
    }

    // Überprüfe State-Parameter
    if (state !== session.user.id) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=spotify_invalid_state`, request.url)
      );
    }

    // Hole die Spotify-Einstellungen
    const settings = await prisma.spotifyPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=spotify_no_settings`, request.url)
      );
    }

    // Tausche Authorization Code gegen Access Token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${settings.clientId}:${settings.clientSecret}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Spotify token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=spotify_token_exchange_failed`, request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    // Speichere die Tokens in der Datenbank
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await prisma.spotifyPreference.update({
      where: { userId: session.user.id },
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
      },
    });

    // Erfolgreiche Verbindung
    return NextResponse.redirect(
      new URL(`/dashboard/settings?success=spotify_connected`, request.url)
    );
  } catch (error) {
    console.error("Spotify callback failed:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=spotify_callback_error`, request.url)
    );
  }
}
