"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const notificationSettings = [
  {
    id: "weekly-report",
    title: "Wöchentlicher Report",
    description: "Zusammenfassung der wichtigsten Kennzahlen als E-Mail.",
    defaultEnabled: true,
  },
  {
    id: "alerts",
    title: "Echtzeit-Benachrichtigungen",
    description: "Bei kritischen Ereignissen sofort informiert werden.",
    defaultEnabled: true,
  },
  {
    id: "reminders",
    title: "Aufgaben-Erinnerungen",
    description: "Geplante Aufgaben regelmäßig bestätigen lassen.",
    defaultEnabled: false,
  },
];

const dashboardPreferences = [
  {
    id: "compact-cards",
    title: "Kompakte Karten",
    description: "Mehr Inhalte auf einen Blick durch geringere Abstände.",
    defaultEnabled: false,
  },
  {
    id: "auto-theme",
    title: "Automatisches Theme",
    description: "Passt das Design automatisch an die System-Einstellungen an.",
    defaultEnabled: true,
  },
  {
    id: "animations",
    title: "Animationen",
    description: "Weiche Übergänge für Diagramme und Widgets aktivieren.",
    defaultEnabled: true,
  },
];

type WeatherSettings = {
  zip: string;
  countryCode: string;
  apiKey: string;
};

type WeatherStatus = {
  type: "success" | "error";
  title: string;
  description?: string;
};

type SpotifySettings = {
  clientId: string;
  clientSecret: string;
  isConnected: boolean;
};

type SpotifyStatus = {
  type: "success" | "error" | "info";
  title: string;
  description?: string;
};

const WEATHER_DEFAULTS: WeatherSettings = {
  zip: "",
  countryCode: "de",
  apiKey: "",
};

const SPOTIFY_DEFAULTS: SpotifySettings = {
  clientId: "",
  clientSecret: "",
  isConnected: false,
};

function createWeatherDefaults(): WeatherSettings {
  return { ...WEATHER_DEFAULTS };
}

function createSpotifyDefaults(): SpotifySettings {
  return { ...SPOTIFY_DEFAULTS };
}

export default function SettingsPage() {
  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>(createWeatherDefaults());
  const [savedWeatherSettings, setSavedWeatherSettings] = useState<WeatherSettings>(createWeatherDefaults());
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus | null>(null);
  const [loadingWeatherSettings, setLoadingWeatherSettings] = useState(true);
  const [savingWeatherSettings, setSavingWeatherSettings] = useState(false);
  const [showWeatherKey, setShowWeatherKey] = useState(false);

  const [spotifySettings, setSpotifySettings] = useState<SpotifySettings>(createSpotifyDefaults());
  const [savedSpotifySettings, setSavedSpotifySettings] = useState<SpotifySettings>(createSpotifyDefaults());
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatus | null>(null);
  const [loadingSpotifySettings, setLoadingSpotifySettings] = useState(true);
  const [savingSpotifySettings, setSavingSpotifySettings] = useState(false);
  const [connectingSpotify, setConnectingSpotify] = useState(false);
  const [showSpotifyClientId, setShowSpotifyClientId] = useState(false);
  const [showSpotifyClientSecret, setShowSpotifyClientSecret] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadWeatherSettings() {
      try {
        const response = await fetch("/api/weather/settings", { cache: "no-store" });
        if (!active) {
          return;
        }

        if (response.status === 404) {
          const defaults = createWeatherDefaults();
          setWeatherSettings(defaults);
          setSavedWeatherSettings(defaults);
          return;
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setWeatherStatus({
            type: "error",
            title: payload?.error ?? "Wetter-Einstellungen konnten nicht geladen werden.",
            description: "Bitte versuche es später erneut.",
          });
          return;
        }

        const data = (await response.json()) as WeatherSettings;
        setWeatherSettings(data);
        setSavedWeatherSettings(data);
        setWeatherStatus(null);
      } catch (error) {
        if (!active) {
          return;
        }
        console.error("Wetter-Einstellungen konnten nicht geladen werden.", error);
        setWeatherStatus({
          type: "error",
          title: "Wetter-Einstellungen konnten nicht geladen werden.",
          description: "Bitte versuche es später erneut.",
        });
      } finally {
        if (active) {
          setLoadingWeatherSettings(false);
        }
      }
    }

    loadWeatherSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSpotifySettings() {
      try {
        const response = await fetch("/api/spotify/settings", { cache: "no-store" });
        if (!active) {
          return;
        }

        if (response.status === 404) {
          const defaults = createSpotifyDefaults();
          setSpotifySettings(defaults);
          setSavedSpotifySettings(defaults);
          return;
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setSpotifyStatus({
            type: "error",
            title: payload?.error ?? "Spotify-Einstellungen konnten nicht geladen werden.",
            description: "Bitte versuche es später erneut.",
          });
          return;
        }

        const data = (await response.json()) as SpotifySettings;
        setSpotifySettings(data);
        setSavedSpotifySettings(data);
        setSpotifyStatus(null);
      } catch (error) {
        if (!active) {
          return;
        }
        console.error("Spotify-Einstellungen konnten nicht geladen werden.", error);
        setSpotifyStatus({
          type: "error",
          title: "Spotify-Einstellungen konnten nicht geladen werden.",
          description: "Bitte versuche es später erneut.",
        });
      } finally {
        if (active) {
          setLoadingSpotifySettings(false);
        }
      }
    }

    loadSpotifySettings();

    // Prüfe URL-Parameter für Spotify OAuth Callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "spotify_connected") {
      setSpotifyStatus({
        type: "success",
        title: "Spotify erfolgreich verbunden!",
        description: "Du kannst jetzt die Spotify-Funktionen nutzen.",
      });
      // Entferne Parameter aus URL
      window.history.replaceState({}, "", "/dashboard/settings");
      // Lade Einstellungen neu, um den aktualisierten Verbindungsstatus zu erhalten
      loadSpotifySettings();
    } else if (urlParams.get("error")) {
      const errorParam = urlParams.get("error");
      let errorMessage = "Die Verbindung zu Spotify ist fehlgeschlagen.";
      if (errorParam === "spotify_auth_denied") {
        errorMessage = "Die Autorisierung wurde abgebrochen.";
      } else if (errorParam === "spotify_no_settings") {
        errorMessage = "Bitte konfiguriere zuerst deine Client-Credentials.";
      }
      setSpotifyStatus({
        type: "error",
        title: "Spotify-Verbindung fehlgeschlagen",
        description: errorMessage,
      });
      window.history.replaceState({}, "", "/dashboard/settings");
    }

    return () => {
      active = false;
    };
  }, []);

  const isWeatherDirty = useMemo(
    () => JSON.stringify(weatherSettings) !== JSON.stringify(savedWeatherSettings),
    [weatherSettings, savedWeatherSettings]
  );

  const isWeatherValid = useMemo(
    () =>
      weatherSettings.zip.trim() !== "" &&
      weatherSettings.countryCode.trim() !== "" &&
      weatherSettings.apiKey.trim() !== "",
    [weatherSettings]
  );

  const weatherFormDisabled = loadingWeatherSettings || savingWeatherSettings;

  const isSpotifyDirty = useMemo(
    () =>
      spotifySettings.clientId !== savedSpotifySettings.clientId ||
      spotifySettings.clientSecret !== savedSpotifySettings.clientSecret,
    [spotifySettings, savedSpotifySettings]
  );

  const isSpotifyValid = useMemo(
    () => spotifySettings.clientId.trim() !== "" && spotifySettings.clientSecret.trim() !== "",
    [spotifySettings]
  );

  const spotifyFormDisabled = loadingSpotifySettings || savingSpotifySettings;

  const handleWeatherChange =
    (field: keyof WeatherSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setWeatherSettings((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setWeatherStatus(null);
    };

  const handleSpotifyChange =
    (field: keyof Omit<SpotifySettings, "isConnected">) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSpotifySettings((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setSpotifyStatus(null);
    };

  const handleWeatherReset = () => {
    setWeatherSettings({ ...savedWeatherSettings });
    setWeatherStatus(null);
  };

  const handleSpotifyReset = () => {
    setSpotifySettings({ ...savedSpotifySettings });
    setSpotifyStatus(null);
  };

  const handleWeatherSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isWeatherDirty || !isWeatherValid) {
      return;
    }

    setSavingWeatherSettings(true);
    setWeatherStatus(null);

    try {
      const response = await fetch("/api/weather/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zip: weatherSettings.zip.trim(),
          countryCode: weatherSettings.countryCode.trim(),
          apiKey: weatherSettings.apiKey.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const description =
          Array.isArray(payload?.errors) && payload.errors.length > 0
            ? payload.errors.map((err: { message: string }) => err.message).join(" ")
            : payload?.description ?? "Bitte überprüfe deine Eingaben und versuche es erneut.";

        setWeatherStatus({
          type: "error",
          title: payload?.error ?? "Speichern nicht möglich.",
          description,
        });
        return;
      }

      const updatedSettings = (payload?.settings as WeatherSettings) ?? createWeatherDefaults();
      setWeatherSettings(updatedSettings);
      setSavedWeatherSettings(updatedSettings);
      setWeatherStatus({
        type: "success",
        title: "Wetter-Einstellungen gespeichert.",
        description: "Wir nutzen den OpenWeatherMap Schlüssel bei der nächsten Abfrage.",
      });
    } catch (error) {
      console.error("Wetter-Einstellungen konnten nicht gespeichert werden.", error);
      setWeatherStatus({
        type: "error",
        title: "Speichern nicht möglich.",
        description: "Bitte prüfe deine Netzwerkverbindung und versuche es erneut.",
      });
    } finally {
      setSavingWeatherSettings(false);
    }
  };

  const handleSpotifySave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSpotifyDirty || !isSpotifyValid) {
      return;
    }

    setSavingSpotifySettings(true);
    setSpotifyStatus(null);

    try {
      const response = await fetch("/api/spotify/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: spotifySettings.clientId.trim(),
          clientSecret: spotifySettings.clientSecret.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const description =
          payload?.errors && Array.isArray(payload.errors)
            ? payload.errors.map((e: any) => `${e.field}: ${e.message}`).join(", ")
            : payload?.description ?? "Bitte überprüfe deine Eingaben und versuche es erneut.";

        setSpotifyStatus({
          type: "error",
          title: payload?.error ?? "Speichern nicht möglich.",
          description,
        });
        return;
      }

      const updatedSettings = (payload?.settings as SpotifySettings) ?? createSpotifyDefaults();
      setSpotifySettings(updatedSettings);
      setSavedSpotifySettings(updatedSettings);
      setSpotifyStatus({
        type: "success",
        title: "Spotify-Einstellungen gespeichert.",
        description: "Du kannst jetzt dein Spotify-Konto verbinden.",
      });
    } catch (error) {
      console.error("Spotify-Einstellungen konnten nicht gespeichert werden.", error);
      setSpotifyStatus({
        type: "error",
        title: "Speichern nicht möglich.",
        description: "Bitte prüfe deine Netzwerkverbindung und versuche es erneut.",
      });
    } finally {
      setSavingSpotifySettings(false);
    }
  };

  const handleSpotifyConnect = async () => {
    setConnectingSpotify(true);
    setSpotifyStatus(null);

    try {
      const response = await fetch("/api/spotify/auth");
      const data = await response.json();

      if (!response.ok || !data.authUrl) {
        setSpotifyStatus({
          type: "error",
          title: "Verbindung nicht möglich.",
          description: data.error ?? "Bitte konfiguriere zuerst deine Client-Credentials.",
        });
        setConnectingSpotify(false);
        return;
      }

      // Leite zur Spotify-Autorisierungsseite weiter
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Spotify-Verbindung konnte nicht gestartet werden.", error);
      setSpotifyStatus({
        type: "error",
        title: "Verbindung nicht möglich.",
        description: "Bitte versuche es später erneut.",
      });
      setConnectingSpotify(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Einstellungen</p>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard & Kommunikation steuern</h2>
        <p className="max-w-2xl text-muted-foreground">
          Lege fest, wie dein Dashboard aussehen soll und welche Informationen dich erreichen.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList aria-label="Einstellungsbereiche">
          <TabsTrigger value="general">Allgemeines</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="weather">Wetter</TabsTrigger>
          <TabsTrigger value="spotify">Spotify</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Allgemeines</CardTitle>
              <CardDescription>Weitere Optionen für Sprache, Datenfreigabe und Integrationen.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="language"
                label="Sprache"
                defaultValue="de"
                options={[
                  { label: "Deutsch", value: "de" },
                  { label: "Englisch", value: "en" },
                  { label: "Französisch", value: "fr" },
                ]}
              />
              <SelectField
                id="data-retention"
                label="Datenaufbewahrung"
                defaultValue="12"
                options={[
                  { label: "3 Monate", value: "3" },
                  { label: "6 Monate", value: "6" },
                  { label: "12 Monate", value: "12" },
                  { label: "24 Monate", value: "24" },
                ]}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Einstellungen werden lokal gespeichert und können jederzeit geändert werden.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline">
                  Zurücksetzen
                </Button>
                <Button type="button">Einstellungen speichern</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Benachrichtigungen</CardTitle>
              <CardDescription>Entscheide, wann dich das Dashboard informiert.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((item) => (
                <PreferenceToggle key={item.id} {...item} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Dashboard</CardTitle>
              <CardDescription>Passe Layout und Darstellung deiner Widgets individuell an.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardPreferences.map((item) => (
                <PreferenceToggle key={item.id} {...item} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather">
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Wetter</CardTitle>
              <CardDescription>
                Hinterlege Postleitzahl, Ländercode und deinen OpenWeatherMap API-Key. Wir speichern die Angaben sicher
                in deinem Konto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weatherStatus ? (
                <NotificationBanner
                  className="mb-6"
                  variant={weatherStatus.type}
                  title={weatherStatus.title}
                  description={weatherStatus.description}
                />
              ) : null}

              <form className="space-y-6" onSubmit={handleWeatherSave}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="weather-zip">Postleitzahl</Label>
                      <p className="text-xs text-muted-foreground">
                        Verwende eine fünfstellige Postleitzahl des gewünschten Standorts.
                      </p>
                    </div>
                    <Input
                      id="weather-zip"
                      name="zip"
                      value={weatherSettings.zip}
                      onChange={handleWeatherChange("zip")}
                      required
                      inputMode="numeric"
                      disabled={weatherFormDisabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="weather-country">Ländercode</Label>
                      <p className="text-xs text-muted-foreground">
                        ISO-3166 Code mit zwei Buchstaben, z. B. DE oder AT.
                      </p>
                    </div>
                    <Input
                      id="weather-country"
                      name="countryCode"
                      value={weatherSettings.countryCode}
                      onChange={handleWeatherChange("countryCode")}
                      required
                      className="uppercase"
                      disabled={weatherFormDisabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="weather-api-key">OpenWeatherMap API-Key</Label>
                    <p className="text-xs text-muted-foreground">
                      Den Schlüssel findest du im OpenWeather Dashboard unter „API Keys“.
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="weather-api-key"
                      name="apiKey"
                      type={showWeatherKey ? "text" : "password"}
                      value={weatherSettings.apiKey}
                      onChange={handleWeatherChange("apiKey")}
                      required
                      disabled={weatherFormDisabled}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => setShowWeatherKey((prev) => !prev)}
                      aria-label={showWeatherKey ? "API-Key verbergen" : "API-Key anzeigen"}
                      aria-pressed={showWeatherKey}
                      disabled={weatherFormDisabled}
                    >
                      {showWeatherKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wir nutzen diesen OpenWeatherMap Schlüssel, um wetter-by-zip Anfragen serverseitig auszuführen.
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Die Angaben werden verschlüsselt in der Datenbank gespeichert und nicht im Browser zwischengespeichert.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleWeatherReset}
                      disabled={!isWeatherDirty || weatherFormDisabled}
                    >
                      Zurücksetzen
                    </Button>
                    <Button type="submit" disabled={!isWeatherDirty || !isWeatherValid || weatherFormDisabled}>
                      {savingWeatherSettings ? "Speichere..." : "Einstellungen speichern"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spotify">
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Spotify</CardTitle>
              <CardDescription>
                Hinterlege deine Spotify App Client-Credentials, um dein Spotify-Konto zu verbinden. Erstelle eine App
                im{" "}
                <a
                  href="https://developer.spotify.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Spotify Developer Dashboard
                </a>
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              {spotifyStatus ? (
                <NotificationBanner
                  className="mb-6"
                  variant={spotifyStatus.type}
                  title={spotifyStatus.title}
                  description={spotifyStatus.description}
                />
              ) : null}

              {spotifySettings.isConnected ? (
                <div className="mb-6 rounded-2xl border border-success bg-success/10 p-4">
                  <p className="text-sm font-semibold text-success">Spotify-Konto verbunden</p>
                  <p className="text-xs text-muted-foreground">
                    Du kannst jetzt die Spotify-Funktionen im Musik-Bereich nutzen.
                  </p>
                </div>
              ) : null}

              <form className="space-y-6" onSubmit={handleSpotifySave}>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="spotify-client-id">Client ID</Label>
                    <p className="text-xs text-muted-foreground">
                      Die Client ID findest du in den Einstellungen deiner Spotify App.
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="spotify-client-id"
                      name="clientId"
                      type={showSpotifyClientId ? "text" : "password"}
                      value={spotifySettings.clientId}
                      onChange={handleSpotifyChange("clientId")}
                      required
                      disabled={spotifyFormDisabled}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => setShowSpotifyClientId((prev) => !prev)}
                      aria-label={showSpotifyClientId ? "Client ID verbergen" : "Client ID anzeigen"}
                      aria-pressed={showSpotifyClientId}
                      disabled={spotifyFormDisabled}
                    >
                      {showSpotifyClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="spotify-client-secret">Client Secret</Label>
                    <p className="text-xs text-muted-foreground">
                      Das Client Secret findest du ebenfalls in den App-Einstellungen.
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="spotify-client-secret"
                      name="clientSecret"
                      type={showSpotifyClientSecret ? "text" : "password"}
                      value={spotifySettings.clientSecret}
                      onChange={handleSpotifyChange("clientSecret")}
                      required
                      disabled={spotifyFormDisabled}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => setShowSpotifyClientSecret((prev) => !prev)}
                      aria-label={showSpotifyClientSecret ? "Client Secret verbergen" : "Client Secret anzeigen"}
                      aria-pressed={showSpotifyClientSecret}
                      disabled={spotifyFormDisabled}
                    >
                      {showSpotifyClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vergiss nicht, in deiner Spotify App die Redirect URI{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback
                    </code>{" "}
                    hinzuzufügen.
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Die Credentials werden sicher in der Datenbank gespeichert.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSpotifyReset}
                        disabled={!isSpotifyDirty || spotifyFormDisabled}
                      >
                        Zurücksetzen
                      </Button>
                      <Button type="submit" disabled={!isSpotifyDirty || !isSpotifyValid || spotifyFormDisabled}>
                        {savingSpotifySettings ? "Speichere..." : "Einstellungen speichern"}
                      </Button>
                    </div>
                  </div>

                  {!spotifySettings.isConnected && isSpotifyValid && !isSpotifyDirty ? (
                    <div className="flex flex-col gap-3 border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Nachdem du deine Credentials gespeichert hast, verbinde dein Spotify-Konto:
                      </p>
                      <Button
                        type="button"
                        variant="default"
                        onClick={handleSpotifyConnect}
                        disabled={connectingSpotify || spotifyFormDisabled}
                        className="w-full sm:w-auto"
                      >
                        {connectingSpotify ? "Verbinde..." : "Mit Spotify verbinden"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PreferenceToggleProps {
  id: string;
  title: string;
  description: string;
  defaultEnabled: boolean;
}

function PreferenceToggle({ id, title, description, defaultEnabled }: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3">
      <div>
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultEnabled} />
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  defaultValue: string;
  options: Array<{ label: string; value: string }>;
}

function SelectField({ id, label, defaultValue, options }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select defaultValue={defaultValue}>
        <SelectTrigger id={id} aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
