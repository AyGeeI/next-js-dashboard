"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Speaker, Tv, Check, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { useToast } from "@/components/ui/use-toast";

type SpotifyDevice = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
};

type DeviceSelectorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeviceSelectorModal({ open, onOpenChange }: DeviceSelectorModalProps) {
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/spotify/devices", { cache: "no-store" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Fehler beim Laden der Geräte.");
      }

      const data = await response.json();
      setDevices(data.devices || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDevices();
    }
  }, [open]);

  const handleTransfer = async (deviceId: string, deviceName: string) => {
    setTransferring(deviceId);
    setError(null);

    try {
      const response = await fetch("/api/spotify/player/transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Fehler beim Wechseln des Geräts.");
      }

      toast({
        title: "Gerät gewechselt",
        description: `Wiedergabe wurde zu "${deviceName}" übertragen.`,
      });

      // Refresh devices to show updated active state
      setTimeout(() => {
        fetchDevices();
      }, 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Fehler beim Wechseln des Geräts",
        description: errorMsg,
      });
    } finally {
      setTransferring(null);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "computer":
        return <Monitor className="h-5 w-5" />;
      case "smartphone":
        return <Smartphone className="h-5 w-5" />;
      case "speaker":
        return <Speaker className="h-5 w-5" />;
      case "tv":
        return <Tv className="h-5 w-5" />;
      default:
        return <Speaker className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verfügbare Geräte</DialogTitle>
          <DialogDescription>
            Wähle ein Gerät aus, auf dem die Musik abgespielt werden soll.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <NotificationBanner
              variant="error"
              description={error}
            />
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {devices.length} {devices.length === 1 ? "Gerät" : "Geräte"} gefunden
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDevices}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
          </div>

          {loading && devices.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-2xl border bg-muted"
                />
              ))}
            </div>
          ) : devices.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <Speaker className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Keine Geräte gefunden</p>
              <p className="text-sm text-muted-foreground">
                Starte Spotify auf einem Gerät, um es hier anzuzeigen.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => !device.is_active && handleTransfer(device.id, device.name)}
                  disabled={device.is_active || transferring === device.id}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    device.is_active
                      ? "border-primary bg-primary/10"
                      : "hover:bg-accent"
                  } ${transferring === device.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <p className="font-semibold">{device.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {device.type}
                          {device.volume_percent !== null &&
                            ` • ${device.volume_percent}% Lautstärke`}
                        </p>
                      </div>
                    </div>

                    {device.is_active && (
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Check className="h-4 w-4" />
                        Aktiv
                      </div>
                    )}

                    {transferring === device.id && (
                      <div className="text-sm text-muted-foreground">
                        Wechsle...
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
