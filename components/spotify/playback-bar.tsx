"use client";

import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  progress_ms?: number;
  is_playing?: boolean;
  external_urls: { spotify: string };
};

type CurrentlyPlaying = {
  playing: boolean;
  track: SpotifyTrack | null;
};

type PlaybackBarProps = {
  onDeviceSelect: () => void;
};

export function PlaybackBar({ onDeviceSelect }: PlaybackBarProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleState, setShuffleState] = useState(false);
  const [repeatState, setRepeatState] = useState<"off" | "track" | "context">("off");
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const { toast } = useToast();

  // Fetch currently playing track (every second)
  useEffect(() => {
    const fetchCurrentlyPlaying = async () => {
      try {
        const response = await fetch("/api/spotify/currently-playing", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setCurrentlyPlaying(data);
          if (data.track) {
            setIsPlaying(data.track.is_playing || false);
            setProgress(data.track.progress_ms || 0);
            setDuration(data.track.duration_ms || 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch currently playing:", error);
      }
    };

    fetchCurrentlyPlaying();
    const intervalId = setInterval(fetchCurrentlyPlaying, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Update progress bar while playing
  useEffect(() => {
    if (!isPlaying || isSeeking) return;

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1000;
        return newProgress >= duration ? duration : newProgress;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, duration, isSeeking]);

  const handlePlayPause = async () => {
    try {
      const endpoint = isPlaying ? "/api/spotify/player/pause" : "/api/spotify/player/play";
      const method = "PUT";
      const response = await fetch(endpoint, { method });

      if (response.ok) {
        setIsPlaying(!isPlaying);
      } else {
        throw new Error("Fehler beim Abspielen/Pausieren");
      }
    } catch (error) {
      console.error("Play/Pause failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Wiedergabe konnte nicht gesteuert werden.",
      });
    }
  };

  const handleNext = async () => {
    try {
      const response = await fetch("/api/spotify/player/next", { method: "POST" });
      if (response.ok) {
        // Refresh currently playing after a short delay
        setTimeout(() => {
          fetch("/api/spotify/currently-playing", { cache: "no-store" })
            .then((res) => res.json())
            .then(setCurrentlyPlaying);
        }, 500);
      } else {
        throw new Error("Fehler beim Überspringen");
      }
    } catch (error) {
      console.error("Next track failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Nächster Track konnte nicht abgespielt werden.",
      });
    }
  };

  const handlePrevious = async () => {
    try {
      const response = await fetch("/api/spotify/player/previous", { method: "POST" });
      if (response.ok) {
        setTimeout(() => {
          fetch("/api/spotify/currently-playing", { cache: "no-store" })
            .then((res) => res.json())
            .then(setCurrentlyPlaying);
        }, 500);
      } else {
        throw new Error("Fehler beim Zurückspringen");
      }
    } catch (error) {
      console.error("Previous track failed:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Vorheriger Track konnte nicht abgespielt werden.",
      });
    }
  };

  const handleShuffle = async () => {
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
    }
  };

  const handleRepeat = async () => {
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

  const handleSeek = async (value: number[]) => {
    const newPosition = value[0];
    setProgress(newPosition);
  };

  const handleSeekComplete = async (value: number[]) => {
    const newPosition = value[0];
    setIsSeeking(false);

    try {
      await fetch(`/api/spotify/player/seek?position_ms=${Math.floor(newPosition)}`, { method: "PUT" });
    } catch (error) {
      console.error("Seek failed:", error);
    }
  };

  const formatTime = (ms: number) => {
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

  if (!currentlyPlaying?.track) {
    return null;
  }

  const { track } = currentlyPlaying;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-screen-2xl px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Track Info */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {track.album.images[0] && (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <a
                href={getSpotifyUri(track.external_urls.spotify)}
                className="block truncate font-semibold text-foreground hover:underline"
              >
                {track.name}
              </a>
              <p className="truncate text-sm text-muted-foreground">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShuffle}
                className={shuffleState ? "text-primary" : "text-muted-foreground"}
              >
                <Shuffle className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={handlePlayPause}
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={handleNext}>
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleRepeat}
                className={repeatState !== "off" ? "text-primary" : "text-muted-foreground"}
              >
                <Repeat className="h-4 w-4" />
                {repeatState === "track" && (
                  <span className="absolute -bottom-1 text-xs font-bold">1</span>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex w-96 items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatTime(progress)}</span>
              <Slider
                value={[progress]}
                max={duration}
                step={1000}
                onValueChange={handleSeek}
                onValueCommit={handleSeekComplete}
                onPointerDown={() => setIsSeeking(true)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Device */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>

            <Button variant="ghost" size="icon" onClick={onDeviceSelect}>
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
