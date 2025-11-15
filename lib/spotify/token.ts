import { prisma } from "@/lib/prisma";

/**
 * Holt einen gültigen Spotify Access Token für den Benutzer.
 * Aktualisiert den Token automatisch, falls er abgelaufen ist.
 */
export async function getValidSpotifyToken(userId: string): Promise<string | null> {
  const settings = await prisma.spotifyPreference.findUnique({
    where: { userId },
  });

  if (!settings || !settings.refreshToken) {
    return null;
  }

  // Überprüfe, ob der Token noch gültig ist (mit 5 Minuten Puffer)
  const now = new Date();
  const expiresAt = settings.tokenExpiresAt;

  if (expiresAt && expiresAt > new Date(now.getTime() + 5 * 60 * 1000)) {
    // Token ist noch gültig
    return settings.accessToken;
  }

  // Token ist abgelaufen oder fehlt - erneuere ihn
  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${settings.clientId}:${settings.clientSecret}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: settings.refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Spotify token refresh failed:", await tokenResponse.text());
      return null;
    }

    const tokenData = await tokenResponse.json();
    const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Aktualisiere die Tokens in der Datenbank
    await prisma.spotifyPreference.update({
      where: { userId },
      data: {
        accessToken: tokenData.access_token,
        // Refresh Token wird nur manchmal neu ausgestellt
        refreshToken: tokenData.refresh_token || settings.refreshToken,
        tokenExpiresAt: newExpiresAt,
      },
    });

    return tokenData.access_token;
  } catch (error) {
    console.error("Failed to refresh Spotify token:", error);
    return null;
  }
}

/**
 * Macht einen authentifizierten Request zur Spotify API.
 */
export async function spotifyApiRequest<T>(
  userId: string,
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  const token = await getValidSpotifyToken(userId);

  if (!token) {
    return {
      data: null,
      error: "Spotify-Verbindung fehlt oder ist abgelaufen. Bitte verbinde dich erneut in den Einstellungen.",
    };
  }

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(options?.headers as Record<string, string>),
    };

    // Add Content-Type for requests with a body
    if (options?.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          data: null,
          error: "Spotify-Autorisierung fehlgeschlagen. Bitte verbinde dich erneut.",
        };
      }
      if (response.status === 204) {
        // No Content - z.B. wenn nichts abgespielt wird
        return { data: null, error: null };
      }

      // Try to get error details from Spotify API
      let errorMessage = `Spotify API error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Spotify API error details:", {
          status: response.status,
          endpoint,
          error: errorData,
        });

        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }

        // Handle common Spotify errors with user-friendly messages
        if (errorData.error?.reason === "NO_ACTIVE_DEVICE") {
          errorMessage = "Kein aktives Spotify-Gerät gefunden. Bitte öffne Spotify auf einem Gerät und starte die Wiedergabe.";
        } else if (errorData.error?.reason === "PREMIUM_REQUIRED") {
          errorMessage = "Diese Funktion erfordert Spotify Premium.";
        } else if (response.status === 403) {
          errorMessage = "Zugriff verweigert. Möglicherweise fehlen Berechtigungen. Bitte verbinde dich erneut mit Spotify.";
        }
      } catch {
        const errorText = await response.text();
        console.error("Spotify API error:", {
          status: response.status,
          endpoint,
          text: errorText,
        });
      }

      return { data: null, error: errorMessage };
    }

    // Handle empty responses (e.g., for some PUT/POST requests)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("Spotify API request failed:", error);
    return { data: null, error: "Fehler beim Abrufen der Spotify-Daten." };
  }
}
