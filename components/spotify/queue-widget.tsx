"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Music, Heart, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { useToast } from "@/components/ui/use-toast";

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
  uri?: string;
};

type QueueData = {
  currently_playing: SpotifyTrack | null;
  queue: SpotifyTrack[];
};

export function QueueWidget() {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedTracks, setSavedTracks] = useState<Set<string>>(new Set());
  const [processingTrack, setProcessingTrack] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/spotify/queue", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Warteschlange.");
      }

      const data = await response.json();
      setQueueData(data);

      // Check which tracks are saved
      if (data.queue && data.queue.length > 0) {
        const trackIds = data.queue.slice(0, 10).map((t: SpotifyTrack) => t.id).join(",");
        checkSavedTracks(trackIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      toast({
        variant: "destructive",
        title: "Fehler",
        description: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSavedTracks = async (ids: string) => {
    try {
      const response = await fetch(`/api/spotify/tracks/check-saved?ids=${ids}`);
      if (response.ok) {
        const data = await response.json();
        const saved = new Set<string>();
        const idArray = ids.split(",");
        data.saved.forEach((isSaved: boolean, index: number) => {
          if (isSaved) {
            saved.add(idArray[index]);
          }
        });
        setSavedTracks(saved);
      }
    } catch (err) {
      console.error("Failed to check saved tracks:", err);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Refresh queue every 15 seconds
    const intervalId = setInterval(fetchQueue, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSaveTrack = async (trackId: string, trackName: string) => {
    setProcessingTrack(trackId);
    try {
      const response = await fetch("/api/spotify/tracks/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [trackId] }),
      });

      if (response.ok) {
        setSavedTracks(prev => new Set([...prev, trackId]));
        toast({
          variant: "success",
          title: "Erfolgreich gespeichert",
          description: `"${trackName}" wurde zu deinen Lieblingssongs hinzugefügt.`,
        });
      } else {
        throw new Error("Fehler beim Speichern");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Track konnte nicht gespeichert werden.",
      });
    } finally {
      setProcessingTrack(null);
    }
  };

  const handlePlayNow = async (uri: string, trackName: string) => {
    setProcessingTrack(uri);
    try {
      const response = await fetch("/api/spotify/player/play-now", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri }),
      });

      if (response.ok) {
        toast({
          title: "Wird abgespielt",
          description: `"${trackName}" wird jetzt abgespielt.`,
        });
        // Refresh queue after a short delay
        setTimeout(fetchQueue, 500);
      } else {
        throw new Error("Fehler beim Abspielen");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Track konnte nicht abgespielt werden.",
      });
    } finally {
      setProcessingTrack(null);
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

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Warteschlange</CardTitle>
          <CardDescription>Als Nächstes</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchQueue}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <NotificationBanner
            variant="error"
            description={error}
          />
        )}

        {loading && !queueData ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3"
              >
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : !queueData?.queue || queueData.queue.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <Music className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Warteschlange leer</p>
            <p className="text-sm text-muted-foreground">
              Füge Songs zur Warteschlange hinzu.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {queueData.queue.slice(0, 15).map((track, index) => {
              const trackUri = track.uri || getSpotifyUri(track.external_urls.spotify);
              const isSaved = savedTracks.has(track.id);
              const isProcessing = processingTrack === track.id || processingTrack === trackUri;

              return (
                <div
                  key={`${track.id}-${index}`}
                  className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  {track.album.images[0] && (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <a
                      href={getSpotifyUri(track.external_urls.spotify)}
                      className="block truncate font-medium hover:underline"
                    >
                      {track.name}
                    </a>
                    <p className="truncate text-sm text-muted-foreground">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(track.duration_ms)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePlayNow(trackUri, track.name)}
                        disabled={isProcessing}
                        title="Sofort abspielen"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSaveTrack(track.id, track.name)}
                        disabled={isSaved || isProcessing}
                        title={isSaved ? "Bereits gespeichert" : "Zu Lieblingssongs"}
                      >
                        <Heart className={`h-4 w-4 ${isSaved ? "fill-current text-primary" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {queueData.queue.length > 15 && (
              <p className="pt-2 text-center text-sm text-muted-foreground">
                und {queueData.queue.length - 15} weitere Songs...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
