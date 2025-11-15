"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type CurrentlyPlaying = {
  playing: boolean;
  track: SpotifyTrack & { progress_ms?: number; is_playing?: boolean } | null;
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
  const [progress, setProgress] = useState(0);
  const [fetchingCurrentlyPlaying, setFetchingCurrentlyPlaying] = useState(false);

  // Fetch currently playing track (auto-refresh every second)
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
          if (data.track?.progress_ms !== undefined) {
            setProgress(data.track.progress_ms);
          }
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
    const intervalId = setInterval(() => fetchCurrentlyPlaying(true), 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Update progress bar in real-time
  useEffect(() => {
    if (!currentlyPlaying?.track?.is_playing) return;

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1000;
        const duration = currentlyPlaying.track?.duration_ms || 0;
        return newProgress >= duration ? duration : newProgress;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentlyPlaying?.track?.is_playing, currentlyPlaying?.track?.duration_ms]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatProgress = (progressMs: number, durationMs: number) => {
    const prog = (progressMs / durationMs) * 100;
    return Math.min(100, Math.max(0, prog)).toFixed(0);
  };

  return (
    <div className="space-y-8">
      {/* Currently Playing */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Wird gerade abgespielt</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {fetchingCurrentlyPlaying && !currentlyPlaying ? (
            <div className="flex items-center gap-4">
              <div className="h-32 w-32 animate-pulse rounded-2xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : !currentlyPlaying?.track || !currentlyPlaying?.track?.is_playing ? (
            <div className="rounded-2xl border border-dashed p-12 text-center">
              <Music className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                Aktuell wird nichts abgespielt
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Starte die Wiedergabe auf Spotify, um den aktuellen Track hier zu sehen.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {currentlyPlaying.track.album.images[0] && (
                <img
                  src={currentlyPlaying.track.album.images[0].url}
                  alt={currentlyPlaying.track.album.name}
                  className="h-32 w-32 rounded-2xl object-cover shadow-lg"
                />
              )}
              <div className="flex-1">
                <a
                  href={getSpotifyUri(currentlyPlaying.track.external_urls.spotify)}
                  className="text-2xl font-bold hover:underline"
                >
                  {currentlyPlaying.track.name}
                </a>
                <p className="mt-1 text-base text-muted-foreground">
                  {currentlyPlaying.track.artists.map((artist) => artist.name).join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentlyPlaying.track.album.name}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${formatProgress(
                          progress,
                          currentlyPlaying.track.duration_ms
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatDuration(progress)} / {formatDuration(currentlyPlaying.track.duration_ms)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Widget */}
      <QueueWidget />
    </div>
  );
}
