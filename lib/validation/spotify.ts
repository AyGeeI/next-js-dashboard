import { z } from "zod";

// Schema für Spotify-Einstellungen (Client Credentials)
export const spotifySettingsSchema = z.object({
  clientId: z
    .string()
    .trim()
    .min(32, "Client ID ist zu kurz.")
    .max(128, "Client ID ist zu lang."),
  clientSecret: z
    .string()
    .trim()
    .min(32, "Client Secret ist zu kurz.")
    .max(128, "Client Secret ist zu lang."),
});

export type SpotifySettingsInput = z.infer<typeof spotifySettingsSchema>;

// Schema für Zeitraum-Parameter bei Top Tracks/Artists
export const spotifyTimeRangeSchema = z.enum(["short_term", "medium_term", "long_term"]);

export type SpotifyTimeRange = z.infer<typeof spotifyTimeRangeSchema>;

// Schema für Spotify API Responses (für Validierung)
export const spotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  album: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(z.object({
      url: z.string(),
      height: z.number().optional(),
      width: z.number().optional(),
    })),
  }),
  duration_ms: z.number(),
  external_urls: z.object({
    spotify: z.string(),
  }),
});

export const spotifyArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  genres: z.array(z.string()),
  images: z.array(z.object({
    url: z.string(),
    height: z.number().optional(),
    width: z.number().optional(),
  })),
  external_urls: z.object({
    spotify: z.string(),
  }),
});

export const spotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(z.object({
    url: z.string(),
    height: z.number().optional(),
    width: z.number().optional(),
  })),
  tracks: z.object({
    total: z.number(),
  }),
  external_urls: z.object({
    spotify: z.string(),
  }),
});
