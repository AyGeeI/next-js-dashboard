"use client";

import { FormEvent, useMemo, useState } from "react";

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

const WEATHER_STORAGE_KEY = "dashboard.weather-settings";

type WeatherSettings = {
  serviceUrl: string;
  zip: string;
  countryCode: string;
  apiKey: string;
};

type WeatherStatus = {
  type: "success" | "error";
  title: string;
  description?: string;
};

const WEATHER_DEFAULTS: WeatherSettings = {
  serviceUrl: "https://n8n.vyrnix.net/webhook/weather-by-zip",
  zip: "",
  countryCode: "de",
  apiKey: "",
};

function createWeatherDefaults(): WeatherSettings {
  return { ...WEATHER_DEFAULTS };
}

function getInitialWeatherState(): { value: WeatherSettings; status: WeatherStatus | null } {
  if (typeof window === "undefined") {
    return { value: createWeatherDefaults(), status: null };
  }

  try {
    const stored = window.localStorage.getItem(WEATHER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<WeatherSettings>;
      const merged = { ...createWeatherDefaults(), ...parsed };
      return { value: merged, status: null };
    }
  } catch (error) {
    console.error("Wetter-Einstellungen konnten nicht geladen werden.", error);
    return {
      value: createWeatherDefaults(),
      status: {
        type: "error",
        title: "Wetter-Einstellungen konnten nicht geladen werden.",
        description: "Bitte prüfe deinen Browser-Speicher oder versuche es erneut.",
      },
    };
  }

  return { value: createWeatherDefaults(), status: null };
}

export default function SettingsPage() {
  const initialWeatherState = useMemo(() => getInitialWeatherState(), []);
  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>(initialWeatherState.value);
  const [savedWeatherSettings, setSavedWeatherSettings] = useState<WeatherSettings>(initialWeatherState.value);
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus | null>(initialWeatherState.status);

  const isWeatherDirty = useMemo(
    () => JSON.stringify(weatherSettings) !== JSON.stringify(savedWeatherSettings),
    [weatherSettings, savedWeatherSettings]
  );

  const isWeatherValid = useMemo(
    () =>
      weatherSettings.serviceUrl.trim() !== "" &&
      weatherSettings.zip.trim() !== "" &&
      weatherSettings.countryCode.trim() !== "" &&
      weatherSettings.apiKey.trim() !== "",
    [weatherSettings]
  );

  const handleWeatherChange =
    (field: keyof WeatherSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setWeatherSettings((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setWeatherStatus(null);
    };

  const handleWeatherReset = () => {
    setWeatherSettings({ ...savedWeatherSettings });
    setWeatherStatus(null);
  };

  const handleWeatherSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isWeatherDirty || !isWeatherValid) {
      return;
    }

    try {
      window.localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(weatherSettings));
      setSavedWeatherSettings({ ...weatherSettings });
      setWeatherStatus({
        type: "success",
        title: "Wetter-Einstellungen gespeichert.",
        description: "Die Angaben werden für den nächsten Abruf verwendet.",
      });
    } catch (error) {
      console.error("Wetter-Einstellungen konnten nicht gespeichert werden.", error);
      setWeatherStatus({
        type: "error",
        title: "Speichern nicht möglich.",
        description: "Bitte erlaube lokale Speicherung oder versuche es erneut.",
      });
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
                Hinterlege die Angaben für den API-Call (
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  /webhook/weather-by-zip?zip=&country-code=&api=
                </code>
                ).
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
                <div className="space-y-2">
                  <Label htmlFor="weather-url">Endpoint-URL</Label>
                  <Input
                    id="weather-url"
                    name="serviceUrl"
                    type="url"
                    value={weatherSettings.serviceUrl}
                    onChange={handleWeatherChange("serviceUrl")}
                    placeholder="https://n8n.vyrnix.net/webhook/weather-by-zip"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Basis des Requests (HTTPS). Der Query-String wird automatisch ergänzt.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weather-zip">Postleitzahl</Label>
                    <Input
                      id="weather-zip"
                      name="zip"
                      value={weatherSettings.zip}
                      onChange={handleWeatherChange("zip")}
                      placeholder="27798"
                      required
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weather-country">Ländercode</Label>
                    <Input
                      id="weather-country"
                      name="countryCode"
                      value={weatherSettings.countryCode}
                      onChange={handleWeatherChange("countryCode")}
                      placeholder="de"
                      required
                      className="uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weather-api-key">API-Schlüssel</Label>
                  <Input
                    id="weather-api-key"
                    name="apiKey"
                    value={weatherSettings.apiKey}
                    onChange={handleWeatherChange("apiKey")}
                    placeholder="****************"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Wird ausschließlich im Browser gespeichert und für den Fetch-Aufruf genutzt.
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Die Angaben werden verschlüsselt im Browser gespeichert und beim Seitenaufruf geladen.
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleWeatherReset} disabled={!isWeatherDirty}>
                      Zurücksetzen
                    </Button>
                    <Button type="submit" disabled={!isWeatherDirty || !isWeatherValid}>
                      Einstellungen speichern
                    </Button>
                  </div>
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
