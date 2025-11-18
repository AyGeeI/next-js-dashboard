"use client";

import { useEffect, useState } from "react";
import { Music, Play, Pause, SkipBack, SkipForward, Heart, Repeat, Shuffle, Volume2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
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
  const [isLiked, setIsLiked] = useState(false);
  const [checkingLiked, setCheckingLiked] = useState(false);
  const [shuffleState, setShuffleState] = useState(false);
  const [repeatState, setRepeatState] = useState<"off" | "track" | "context">("off");
  const [volume, setVolume] = useState(50);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { toast } = useToast();

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

  // Check if current track is liked
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!currentlyPlaying?.track?.id) return;

      setCheckingLiked(true);
      try {
        const response = await fetch(`/api/spotify/tracks/check-saved?ids=${currentlyPlaying.track.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.saved?.[0] || false);
        }
      } catch (error) {
        console.error("Failed to check if track is liked:", error);
      } finally {
        setCheckingLiked(false);
      }
    };

    checkIfLiked();
  }, [currentlyPlaying?.track?.id]);

  const handlePlayPause = async () => {
    setLoadingAction("playpause");
    try {
      const endpoint = currentlyPlaying?.track?.is_playing
        ? "/api/spotify/player/pause"
        : "/api/spotify/player/play";
      const response = await fetch(endpoint, { method: "PUT" });

      if (!response.ok) {
        throw new Error("Fehler beim Abspielen/Pausieren");
      }
    } catch (error) {
      console.error("Play/Pause failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Wiedergabe konnte nicht gesteuert werden.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleNext = async () => {
    setLoadingAction("next");
    try {
      const response = await fetch("/api/spotify/player/next", { method: "POST" });
      if (!response.ok) {
        throw new Error("Fehler beim Überspringen");
      }
    } catch (error) {
      console.error("Next track failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Nächster Track konnte nicht abgespielt werden.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePrevious = async () => {
    setLoadingAction("previous");
    try {
      const response = await fetch("/api/spotify/player/previous", { method: "POST" });
      if (!response.ok) {
        throw new Error("Fehler beim Zurückspringen");
      }
    } catch (error) {
      console.error("Previous track failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Vorheriger Track konnte nicht abgespielt werden.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShuffle = async () => {
    setLoadingAction("shuffle");
    try {
      const newState = !shuffleState;
      const response = await fetch(`/api/spotify/player/shuffle?state=${newState}`, { method: "PUT" });
      if (response.ok) {
        setShuffleState(newState);
      } else {
        throw new Error("Fehler beim Ändern des Shuffle-Modus");
      }
    } catch (error) {
      console.error("Shuffle failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Shuffle-Modus konnte nicht geändert werden.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRepeat = async () => {
    setLoadingAction("repeat");
    const states: Array<"off" | "track" | "context"> = ["off", "context", "track"];
    const currentIndex = states.indexOf(repeatState);
    const newState = states[(currentIndex + 1) % states.length];

    try {
      const response = await fetch(`/api/spotify/player/repeat?state=${newState}`, { method: "PUT" });
      if (response.ok) {
        setRepeatState(newState);
      } else {
        throw new Error("Fehler beim Ändern des Wiederholungs-Modus");
      }
    } catch (error) {
      console.error("Repeat failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Wiederholungs-Modus konnte nicht geändert werden.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    try {
      await fetch(`/api/spotify/player/volume?volume_percent=${newVolume}`, { method: "PUT" });
    } catch (error) {
      console.error("Volume change failed:", error);
    }
  };

  const handleToggleLike = async () => {
    if (!currentlyPlaying?.track?.id) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState); // Optimistic update

    try {
      const endpoint = newLikedState
        ? "/api/spotify/tracks/save"
        : "/api/spotify/tracks/remove";
      const response = await fetch(endpoint, {
        method: newLikedState ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [currentlyPlaying.track.id] }),
      });

      if (!response.ok) {
        // Revert on error
        setIsLiked(!newLikedState);
        throw new Error("Fehler beim Speichern");
      }

      toast({
        title: newLikedState ? "Zu Lieblingssongs hinzugefügt" : "Aus Lieblingssongs entfernt",
        description: currentlyPlaying.track.name,
      });
    } catch (error) {
      console.error("Toggle like failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Song konnte nicht gespeichert werden.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Currently Playing */}
      <Card className="rounded-md border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Wird gerade abgespielt</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {fetchingCurrentlyPlaying && !currentlyPlaying ? (
            <div className="flex items-center gap-4">
              <div className="h-32 w-32 animate-pulse rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : !currentlyPlaying?.track || !currentlyPlaying?.track?.is_playing ? (
            <div className="rounded-md border border-dashed p-12 text-center">
              <Music className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                Aktuell wird nichts abgespielt
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Starte die Wiedergabe auf Spotify, um den aktuellen Track hier zu sehen.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                {currentlyPlaying.track.album.images[0] && (
                  <img
                    src={currentlyPlaying.track.album.images[0].url}
                    alt={currentlyPlaying.track.album.name}
                    className="h-40 w-40 rounded-md object-cover shadow-lg"
                  />
                )}
                <div className="flex-1 space-y-4">
                  <div>
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
                  </div>

                  {/* Main Playback Controls */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShuffle}
                      disabled={loadingAction === "shuffle"}
                      className={`h-9 w-9 ${shuffleState ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {loadingAction === "shuffle" ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Shuffle className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={loadingAction === "previous"}
                      className="h-10 w-10"
                    >
                      {loadingAction === "previous" ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <SkipBack className="h-5 w-5" />
                      )}
                    </Button>

                    <Button
                      variant="default"
                      size="icon"
                      onClick={handlePlayPause}
                      disabled={loadingAction === "playpause"}
                      className="h-12 w-12 rounded-full"
                    >
                      {loadingAction === "playpause" ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : currentlyPlaying.track.is_playing ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      disabled={loadingAction === "next"}
                      className="h-10 w-10"
                    >
                      {loadingAction === "next" ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <SkipForward className="h-5 w-5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRepeat}
                      disabled={loadingAction === "repeat"}
                      className={`h-9 w-9 ${repeatState !== "off" ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {loadingAction === "repeat" ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <Repeat className="h-4 w-4" />
                          {repeatState === "track" && (
                            <span className="absolute -bottom-1 text-xs font-bold">1</span>
                          )}
                        </>
                      )}
                    </Button>

                    <div className="mx-2 h-6 w-px bg-border" />

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleLike}
                      disabled={checkingLiked}
                      className={`h-10 w-10 ${isLiked ? "text-red-500 hover:text-red-600" : ""}`}
                    >
                      {checkingLiked ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                      )}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {formatDuration(progress)}
                    </span>
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
                    <span className="text-xs text-muted-foreground w-12">
                      {formatDuration(currentlyPlaying.track.duration_ms)}
                    </span>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">{volume}%</span>
                  </div>
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
