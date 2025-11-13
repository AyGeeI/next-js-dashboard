"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Music, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QueueWidget } from "./queue-widget";

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
};

type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height?: number; width?: number }>;
  external_urls: { spotify: string };
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string | null;
  images: Array<{ url: string; height?: number; width?: number }>;
  tracks: { total: number };
  external_urls: { spotify: string };
  owner?: { display_name: string };
};

type CurrentlyPlaying = {
  playing: boolean;
  track: SpotifyTrack & { progress_ms?: number; is_playing?: boolean } | null;
};

type RecentlyPlayedTrack = {
  played_at: string;
  track: SpotifyTrack;
};

function getSpotifyUri(spotifyUrl: string): string {
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
}

export function OverviewTab() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>([]);
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term");

  const [fetchingCurrentlyPlaying, setFetchingCurrentlyPlaying] = useState(false);
  const [fetchingTopTracks, setFetchingTopTracks] = useState(false);
  const [fetchingTopArtists, setFetchingTopArtists] = useState(false);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(false);
  const [fetchingRecentlyPlayed, setFetchingRecentlyPlayed] = useState(false);

  // Fetch currently playing track (auto-refresh alle 10 Sekunden)
  useEffect(() => {
    const fetchCurrentlyPlaying = async (isBackground = false) => {
      if (!isBackground) {
        setFetchingCurrentlyPlaying(true);
      }

      try {
        const response = await fetch("/api/spotify/currently-playing", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setCurrentlyPlaying(data);
        }
      } catch (err) {
        console.error("Currently playing fetch failed:", err);
      } finally {
        if (!isBackground) {
          setFetchingCurrentlyPlaying(false);
        }
      }
    };

    fetchCurrentlyPlaying();
    const intervalId = setInterval(() => fetchCurrentlyPlaying(true), 10000);

    return () => clearInterval(intervalId);
  }, []);

  // Initial load für andere Daten
  useEffect(() => {
    fetchTopTracks();
    fetchTopArtists();
    fetchPlaylists();
    fetchRecentlyPlayed();
  }, []);

  // Wenn sich der Zeitraum ändert
  useEffect(() => {
    if (timeRange) {
      fetchTopTracks();
      fetchTopArtists();
    }
  }, [timeRange]);

  const fetchTopTracks = async (forceRefresh = false) => {
    setFetchingTopTracks(true);
    try {
      const url = forceRefresh
        ? `/api/spotify/top-tracks?time_range=${timeRange}&refresh=true`
        : `/api/spotify/top-tracks?time_range=${timeRange}`;
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setTopTracks(data.tracks || []);
      }
    } catch (err) {
      console.error("Top tracks fetch failed:", err);
    } finally {
      setFetchingTopTracks(false);
    }
  };

  const fetchTopArtists = async (forceRefresh = false) => {
    setFetchingTopArtists(true);
    try {
      const url = forceRefresh
        ? `/api/spotify/top-artists?time_range=${timeRange}&refresh=true`
        : `/api/spotify/top-artists?time_range=${timeRange}`;
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setTopArtists(data.artists || []);
      }
    } catch (err) {
      console.error("Top artists fetch failed:", err);
    } finally {
      setFetchingTopArtists(false);
    }
  };

  const fetchPlaylists = async (forceRefresh = false) => {
    setFetchingPlaylists(true);
    try {
      const url = forceRefresh ? `/api/spotify/playlists?refresh=true` : `/api/spotify/playlists`;
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error("Playlists fetch failed:", err);
    } finally {
      setFetchingPlaylists(false);
    }
  };

  const fetchRecentlyPlayed = async (forceRefresh = false) => {
    setFetchingRecentlyPlayed(true);
    try {
      const url = forceRefresh
        ? `/api/spotify/recently-played?refresh=true`
        : `/api/spotify/recently-played`;
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setRecentlyPlayed(data.tracks || []);
      }
    } catch (err) {
      console.error("Recently played fetch failed:", err);
    } finally {
      setFetchingRecentlyPlayed(false);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatProgress = (progressMs: number, durationMs: number) => {
    const progress = (progressMs / durationMs) * 100;
    return Math.min(100, Math.max(0, progress)).toFixed(0);
  };

  return (
    <div className="space-y-8">
      {/* Currently Playing */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Wird gerade abgespielt</CardTitle>
            <CardDescription>Aktualisiert sich alle 10 Sekunden</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {fetchingCurrentlyPlaying && !currentlyPlaying ? (
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 animate-pulse rounded-2xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : !currentlyPlaying?.track ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <Music className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Aktuell wird nichts abgespielt
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {currentlyPlaying.track.album.images[0] && (
                <img
                  src={currentlyPlaying.track.album.images[0].url}
                  alt={currentlyPlaying.track.album.name}
                  className="h-24 w-24 rounded-2xl object-cover shadow-md"
                />
              )}
              <div className="flex-1">
                <a
                  href={getSpotifyUri(currentlyPlaying.track.external_urls.spotify)}
                  className="text-xl font-bold hover:underline"
                >
                  {currentlyPlaying.track.name}
                </a>
                <p className="text-sm text-muted-foreground">
                  {currentlyPlaying.track.artists.map((artist) => artist.name).join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentlyPlaying.track.album.name}
                </p>
                {currentlyPlaying.track.progress_ms !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${formatProgress(
                            currentlyPlaying.track.progress_ms,
                            currentlyPlaying.track.duration_ms
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(currentlyPlaying.track.progress_ms)} /{" "}
                      {formatDuration(currentlyPlaying.track.duration_ms)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Widget */}
      <QueueWidget />

      {/* Time Range Selector */}
      <div className="flex items-center gap-4">
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

      {/* Top Tracks */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Top Tracks</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchTopTracks(true)}
            disabled={fetchingTopTracks}
          >
            <RefreshCcw className={`h-4 w-4 ${fetchingTopTracks ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {fetchingTopTracks && topTracks.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-16 w-16 animate-pulse rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topTracks.slice(0, 9).map((track, index) => (
                <div key={track.id} className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  {track.album.images[0] && (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <a
                      href={getSpotifyUri(track.external_urls.spotify)}
                      className="block truncate font-semibold hover:underline"
                    >
                      {track.name}
                    </a>
                    <p className="truncate text-sm text-muted-foreground">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Artists */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Top Artists</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchTopArtists(true)}
            disabled={fetchingTopArtists}
          >
            <RefreshCcw className={`h-4 w-4 ${fetchingTopArtists ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {fetchingTopArtists && topArtists.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
                  <div className="h-4 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {topArtists.slice(0, 10).map((artist) => (
                <a
                  key={artist.id}
                  href={getSpotifyUri(artist.external_urls.spotify)}
                  className="group space-y-2"
                >
                  {artist.images[0] ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="aspect-square w-full rounded-2xl object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-square w-full rounded-2xl bg-muted" />
                  )}
                  <p className="truncate text-center font-semibold group-hover:underline">
                    {artist.name}
                  </p>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playlists */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Playlists</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchPlaylists(true)}
            disabled={fetchingPlaylists}
          >
            <RefreshCcw className={`h-4 w-4 ${fetchingPlaylists ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {fetchingPlaylists && playlists.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-16 w-16 animate-pulse rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.slice(0, 10).map((playlist) => (
                <a
                  key={playlist.id}
                  href={getSpotifyUri(playlist.external_urls.spotify)}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  {playlist.images[0] ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold hover:underline">{playlist.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {playlist.tracks.total} Tracks
                      {playlist.owner && ` • ${playlist.owner.display_name}`}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Played */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Kürzlich gehört</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchRecentlyPlayed(true)}
            disabled={fetchingRecentlyPlayed}
          >
            <RefreshCcw
              className={`h-4 w-4 ${fetchingRecentlyPlayed ? "animate-spin" : ""}`}
            />
          </Button>
        </CardHeader>
        <CardContent>
          {fetchingRecentlyPlayed && recentlyPlayed.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentlyPlayed.slice(0, 10).map((item, index) => (
                <div
                  key={`${item.track.id}-${index}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  {item.track.album.images[0] && (
                    <img
                      src={item.track.album.images[0].url}
                      alt={item.track.album.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <a
                      href={getSpotifyUri(item.track.external_urls.spotify)}
                      className="block truncate font-medium hover:underline"
                    >
                      {item.track.name}
                    </a>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(item.track.duration_ms)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
