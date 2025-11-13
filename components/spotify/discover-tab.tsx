"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Music, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationBanner } from "@/components/ui/notification-banner";

type SpotifyTrack = {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
  };
  duration_ms: number;
  external_urls: { spotify: string };
  preview_url?: string | null;
  popularity?: number;
};

type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height?: number; width?: number }>;
  external_urls: { spotify: string };
};

type RecommendationSource = "top_tracks" | "top_artists" | "currently_playing";

export function DiscoverTab() {
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [source, setSource] = useState<RecommendationSource>("top_tracks");
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term");

  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    fetchSourceData();
  }, [timeRange]);

  useEffect(() => {
    if (source === "top_tracks" && topTracks.length > 0) {
      fetchRecommendations();
    } else if (source === "top_artists" && topArtists.length > 0) {
      fetchRecommendations();
    } else if (source === "currently_playing" && currentlyPlaying) {
      fetchRecommendations();
    }
  }, [source]);

  const fetchSourceData = async () => {
    try {
      // Fetch top tracks
      const tracksResponse = await fetch(`/api/spotify/top-tracks?time_range=${timeRange}&limit=5`, {
        cache: "no-store",
      });
      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        setTopTracks(tracksData.tracks || []);
      }

      // Fetch top artists
      const artistsResponse = await fetch(`/api/spotify/top-artists?time_range=${timeRange}&limit=5`, {
        cache: "no-store",
      });
      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json();
        setTopArtists(artistsData.artists || []);
      }

      // Fetch currently playing
      const currentlyPlayingResponse = await fetch("/api/spotify/currently-playing", {
        cache: "no-store",
      });
      if (currentlyPlayingResponse.ok) {
        const currentlyPlayingData = await currentlyPlayingResponse.json();
        if (currentlyPlayingData.track) {
          setCurrentlyPlaying(currentlyPlayingData.track);
        }
      }
    } catch (err) {
      console.error("Failed to fetch source data:", err);
    }
  };

  const fetchRecommendations = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      let seedTracks = "";
      let seedArtists = "";

      if (source === "top_tracks") {
        // Use top 5 tracks as seeds
        seedTracks = topTracks.slice(0, 5).map((track) => track.id).join(",");
      } else if (source === "top_artists") {
        // Use top 5 artists as seeds
        seedArtists = topArtists.slice(0, 5).map((artist) => artist.id).join(",");
      } else if (source === "currently_playing" && currentlyPlaying) {
        // Use currently playing track as seed
        seedTracks = currentlyPlaying.id;
      }

      if (!seedTracks && !seedArtists) {
        setError("Keine Seeds verfügbar. Bitte höre zuerst Musik auf Spotify.");
        setRecommendations([]);
        return;
      }

      let url = `/api/spotify/recommendations?limit=20`;
      if (seedTracks) url += `&seed_tracks=${seedTracks}`;
      if (seedArtists) url += `&seed_artists=${seedArtists}`;
      if (forceRefresh) url += `&refresh=true`;

      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Empfehlungen.");
      }

      const data = await response.json();
      setRecommendations(data.tracks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSpotifyUri = (spotifyUrl: string): string => {
    try {
      const url = new URL(spotifyUrl);
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const type = pathParts[0];
        const id = pathParts[1];
        return `spotify:${type}:${id}`;
      }
    } catch (error) {
      console.error("Invalid Spotify URL:", spotifyUrl);
    }
    return spotifyUrl;
  };

  const sourceLabel =
    source === "top_tracks"
      ? "Top Tracks"
      : source === "top_artists"
      ? "Top Artists"
      : "Aktueller Song";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Entdecken</h2>
          <p className="text-sm text-muted-foreground">
            Personalisierte Musik-Empfehlungen basierend auf deinem Geschmack
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Empfehlungsquelle</CardTitle>
          <CardDescription>Wähle die Basis für deine Empfehlungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Basierend auf:</label>
              <Select
                value={source}
                onValueChange={(value: any) => setSource(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_tracks">Top Tracks</SelectItem>
                  <SelectItem value="top_artists">Top Artists</SelectItem>
                  <SelectItem value="currently_playing">Aktueller Song</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {source !== "currently_playing" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Zeitraum:</label>
                <Select
                  value={timeRange}
                  onValueChange={(value: any) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_term">Letzte 4 Wochen</SelectItem>
                    <SelectItem value="medium_term">Letzte 6 Monate</SelectItem>
                    <SelectItem value="long_term">Gesamte Zeit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={() => fetchRecommendations(true)}
              disabled={loading}
              className="ml-auto"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Neue Empfehlungen
            </Button>
          </div>

          {error && (
            <NotificationBanner
              variant="error"
              description={error}
            />
          )}
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Empfehlungen basierend auf: {sourceLabel}
          </CardTitle>
          <CardDescription>
            {recommendations.length} Songs gefunden, die dir gefallen könnten
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && recommendations.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center">
              <Music className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Keine Empfehlungen verfügbar</p>
              <p className="text-sm text-muted-foreground">
                Wähle eine andere Quelle oder höre zuerst Musik auf Spotify.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommendations.map((track) => (
                <a
                  key={track.id}
                  href={getSpotifyUri(track.external_urls.spotify)}
                  className="group space-y-3 rounded-2xl p-3 transition-colors hover:bg-accent"
                >
                  {track.album.images[0] ? (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="aspect-square w-full rounded-2xl object-cover shadow-md transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-square w-full rounded-2xl bg-muted" />
                  )}
                  <div className="space-y-1">
                    <p className="truncate font-semibold group-hover:underline">
                      {track.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDuration(track.duration_ms)}</span>
                      {track.popularity !== undefined && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {track.popularity}%
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
