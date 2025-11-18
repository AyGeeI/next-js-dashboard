"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string | null;
  images: Array<{ url: string; height?: number; width?: number }>;
  tracks: { total: number };
  external_urls: { spotify: string };
  owner?: { display_name: string };
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

export function LibraryTab() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>([]);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(false);
  const [fetchingRecentlyPlayed, setFetchingRecentlyPlayed] = useState(false);

  useEffect(() => {
    fetchPlaylists();
    fetchRecentlyPlayed();

    // Auto-refresh every 30 seconds
    const playlistInterval = setInterval(fetchPlaylists, 30000);
    const recentInterval = setInterval(fetchRecentlyPlayed, 30000);

    return () => {
      clearInterval(playlistInterval);
      clearInterval(recentInterval);
    };
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Playlists */}
      <Card className="rounded-md border bg-card shadow-sm">
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
                  <div className="h-16 w-16 animate-pulse rounded-md bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.slice(0, 15).map((playlist) => (
                <a
                  key={playlist.id}
                  href={getSpotifyUri(playlist.external_urls.spotify)}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                >
                  {playlist.images[0] ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-muted" />
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
      <Card className="rounded-md border bg-card shadow-sm">
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
                  <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentlyPlayed.slice(0, 20).map((item, index) => (
                <div
                  key={`${item.track.id}-${index}`}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                >
                  {item.track.album.images[0] && (
                    <img
                      src={item.track.album.images[0].url}
                      alt={item.track.album.name}
                      className="h-12 w-12 rounded-md object-cover"
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
