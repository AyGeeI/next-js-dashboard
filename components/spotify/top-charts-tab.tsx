"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function TopChartsTab() {
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term");
  const [fetchingTopTracks, setFetchingTopTracks] = useState(false);
  const [fetchingTopArtists, setFetchingTopArtists] = useState(false);

  useEffect(() => {
    fetchTopTracks();
    fetchTopArtists();
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

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Zeitraum:</label>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
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
      <Card className="rounded-md border bg-card shadow-sm">
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
                  <div className="h-16 w-16 animate-pulse rounded-md bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topTracks.slice(0, 20).map((track, index) => (
                <div key={track.id} className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary">
                    {index + 1}
                  </div>
                  {track.album.images[0] && (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="h-16 w-16 rounded-md object-cover"
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
      <Card className="rounded-md border bg-card shadow-sm">
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
                  <div className="aspect-square w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-4 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {topArtists.slice(0, 20).map((artist, index) => (
                <a
                  key={artist.id}
                  href={getSpotifyUri(artist.external_urls.spotify)}
                  className="group relative space-y-2"
                >
                  <div className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white backdrop-blur-sm">
                    {index + 1}
                  </div>
                  {artist.images[0] ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="aspect-square w-full rounded-md object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-square w-full rounded-md bg-muted" />
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
    </div>
  );
}
