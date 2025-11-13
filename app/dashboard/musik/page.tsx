"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Music, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const REFRESH_INTERVAL = 10_000; // 10 Sekunden

export default function MusikPage() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>([]);
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term");

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsMissing, setSettingsMissing] = useState(false);

  // Fetch currently playing track
  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    const fetchCurrentlyPlaying = async (isBackground = false) => {
      if (!active) return;

      if (!isBackground) {
        setIsFetching(true);
      }

      try {
        controller?.abort();
        controller = new AbortController();

        const response = await fetch("/api/spotify/currently-playing", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!active) return;

        if (response.status === 404 || response.status === 400) {
          const data = await response.json();
          if (data.error?.includes("Spotify-Verbindung fehlt")) {
            setSettingsMissing(true);
          }
          setCurrentlyPlaying(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!active) return;

        setCurrentlyPlaying(data);
        setSettingsMissing(false);
        setError(null);
      } catch (err) {
        if (!active) return;
        if ((err as Error).name === "AbortError") return;

        console.error("Currently playing konnte nicht geladen werden.", err);
        setError("Spotify-Daten konnten nicht geladen werden.");
      } finally {
        if (!isBackground) {
          setIsFetching(false);
        }
      }
    };

    fetchCurrentlyPlaying();
    const intervalId = window.setInterval(() => fetchCurrentlyPlaying(true), REFRESH_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCurrentlyPlaying(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Fetch top tracks and artists based on time range
  useEffect(() => {
    let active = true;

    const fetchTopData = async () => {
      try {
        const [tracksRes, artistsRes, playlistsRes, recentRes] = await Promise.all([
          fetch(`/api/spotify/top-tracks?time_range=${timeRange}`, { cache: "no-store" }),
          fetch(`/api/spotify/top-artists?time_range=${timeRange}`, { cache: "no-store" }),
          fetch("/api/spotify/playlists", { cache: "no-store" }),
          fetch("/api/spotify/recently-played", { cache: "no-store" }),
        ]);

        if (!active) return;

        if (tracksRes.ok) {
          const tracksData = await tracksRes.json();
          setTopTracks(tracksData.tracks || []);
        }

        if (artistsRes.ok) {
          const artistsData = await artistsRes.json();
          setTopArtists(artistsData.artists || []);
        }

        if (playlistsRes.ok) {
          const playlistsData = await playlistsRes.json();
          setPlaylists(playlistsData.playlists || []);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentlyPlayed(recentData.tracks || []);
        }
      } catch (err) {
        if (!active) return;
        console.error("Spotify-Daten konnten nicht geladen werden.", err);
      }
    };

    fetchTopData();

    return () => {
      active = false;
    };
  }, [timeRange]);

  if (settingsMissing) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Musik</p>
          <h2 className="text-3xl font-bold tracking-tight">Spotify Integration</h2>
        </div>

        <NotificationBanner
          variant="info"
          title="Spotify-Verbindung fehlt"
          description="Konfiguriere deine Spotify-Einstellungen, um fortzufahren."
        >
          <Link href="/dashboard/settings?tab=spotify">
            <Button variant="default" size="sm">
              Zu den Einstellungen
            </Button>
          </Link>
        </NotificationBanner>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Musik</p>
          <h2 className="text-3xl font-bold tracking-tight">Spotify Dashboard</h2>
          <p className="text-muted-foreground">Deine Musik-Statistiken und aktuell abgespielte Tracks</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          disabled={isFetching}
          className="w-full sm:w-auto"
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {error ? (
        <NotificationBanner variant="error" title="Fehler beim Laden der Daten" description={error} />
      ) : null}

      {/* Currently Playing */}
      {currentlyPlaying?.playing && currentlyPlaying.track ? (
        <Card className="rounded-2xl border bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Wird gerade abgespielt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {currentlyPlaying.track.album.images[0] ? (
                <img
                  src={currentlyPlaying.track.album.images[0].url}
                  alt={currentlyPlaying.track.album.name}
                  className="h-32 w-32 rounded-xl shadow-md"
                />
              ) : null}
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold">{currentlyPlaying.track.name}</h3>
                <p className="text-muted-foreground">
                  {currentlyPlaying.track.artists.map((a) => a.name).join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">{currentlyPlaying.track.album.name}</p>
                {currentlyPlaying.track.external_urls?.spotify ? (
                  <a
                    href={currentlyPlaying.track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Auf Spotify öffnen
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Music className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Momentan wird nichts abgespielt</p>
          </CardContent>
        </Card>
      )}

      {/* Time Range Selector */}
      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium">Zeitraum:</Label>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short_term">Letzte 4 Wochen</SelectItem>
            <SelectItem value="medium_term">Letzte 6 Monate</SelectItem>
            <SelectItem value="long_term">Alle Zeit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top Tracks */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Top Tracks</CardTitle>
          <CardDescription>Deine meist gehörten Songs</CardDescription>
        </CardHeader>
        <CardContent>
          {topTracks.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Keine Tracks gefunden</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topTracks.slice(0, 8).map((track) => (
                <a
                  key={track.id}
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 rounded-xl border p-3 transition hover:bg-accent hover:shadow-md"
                >
                  {track.album.images[0] ? (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="h-16 w-16 rounded-lg shadow-sm"
                    />
                  ) : null}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-semibold">{track.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Artists */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Top Artists</CardTitle>
          <CardDescription>Deine meist gehörten Künstler</CardDescription>
        </CardHeader>
        <CardContent>
          {topArtists.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Keine Künstler gefunden</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {topArtists.slice(0, 10).map((artist) => (
                <a
                  key={artist.id}
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 rounded-xl border p-4 transition hover:bg-accent hover:shadow-md"
                >
                  {artist.images[0] ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="h-24 w-24 rounded-full shadow-sm"
                    />
                  ) : null}
                  <div className="text-center">
                    <p className="font-semibold">{artist.name}</p>
                    {artist.genres.length > 0 ? (
                      <p className="text-xs text-muted-foreground">{artist.genres.slice(0, 2).join(", ")}</p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playlists and Recently Played Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Playlists */}
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Playlists</CardTitle>
            <CardDescription>Deine gespeicherten Playlists</CardDescription>
          </CardHeader>
          <CardContent>
            {playlists.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Keine Playlists gefunden</p>
            ) : (
              <div className="space-y-3">
                {playlists.slice(0, 6).map((playlist) => (
                  <a
                    key={playlist.id}
                    href={playlist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 rounded-xl border p-3 transition hover:bg-accent hover:shadow-md"
                  >
                    {playlist.images[0] ? (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        className="h-16 w-16 rounded-lg shadow-sm"
                      />
                    ) : null}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold">{playlist.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {playlist.tracks.total} Tracks
                        {playlist.owner?.display_name ? ` • ${playlist.owner.display_name}` : ""}
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
          <CardHeader>
            <CardTitle>Zuletzt gespielt</CardTitle>
            <CardDescription>Deine kürzlich gehörten Songs</CardDescription>
          </CardHeader>
          <CardContent>
            {recentlyPlayed.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Keine Tracks gefunden</p>
            ) : (
              <div className="space-y-3">
                {recentlyPlayed.slice(0, 6).map((item, index) => (
                  <a
                    key={`${item.track.id}-${index}`}
                    href={item.track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 rounded-xl border p-3 transition hover:bg-accent hover:shadow-md"
                  >
                    {item.track.album.images[0] ? (
                      <img
                        src={item.track.album.images[0].url}
                        alt={item.track.album.name}
                        className="h-12 w-12 rounded-lg shadow-sm"
                      />
                    ) : null}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold">{item.track.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.track.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
