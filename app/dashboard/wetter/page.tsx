"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { CardMetric } from "@/components/widgets/card-metric";
import { Cloud, Droplets, MapPin, RefreshCcw, Wind } from "lucide-react";

type WeatherSettings = {
  serviceUrl: string;
  zip: string;
  countryCode: string;
  apiKey: string;
};

type WeatherApiResponse = {
  name?: string;
  sys?: { country?: string };
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  wind?: { speed?: number; deg?: number };
  weather?: Array<{ main?: string; description?: string }>;
  clouds?: { all?: number };
  visibility?: number;
};

const WEATHER_STORAGE_KEY = "dashboard.weather-settings";
const REFRESH_INTERVAL = 60_000;

const conditionTranslations: Record<string, string> = {
  Thunderstorm: "Gewitter",
  Drizzle: "Nieselregen",
  Rain: "Regen",
  Snow: "Schnee",
  Clear: "Klar",
  Clouds: "Wolkig",
  Mist: "Nebel",
  Smoke: "Rauch",
  Haze: "Dunst",
  Dust: "Staub",
  Fog: "Nebel",
  Sand: "Sandsturm",
  Ash: "Asche",
  Squall: "Böiger Wind",
  Tornado: "Tornado",
};

export default function WetterPage() {
  const [settings, setSettings] = useState<WeatherSettings | null>(null);
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<{ title: string; description?: string } | null>(null);

  useEffect(() => {
    const stored = readSettings();
    if (stored) {
      setSettings(stored);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === WEATHER_STORAGE_KEY) {
        const nextValue = event.newValue ? parseSettings(event.newValue) : null;
        setSettings(nextValue);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const refreshed = readSettings();
        if (refreshed) {
          setSettings(refreshed);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!settings) {
      return;
    }

    let active = true;
    let controller: AbortController | null = null;

    const fetchWeather = async (isBackground = false) => {
      if (!active) {
        return;
      }

      if (!isBackground) {
        setIsFetching(true);
      }

      try {
        controller = new AbortController();
        const endpoint = buildUrl(settings);
        const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as WeatherApiResponse;
        if (!active) {
          return;
        }

        setWeather(payload);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!active) {
          return;
        }

        if ((err as Error).name === "AbortError") {
          return;
        }

        console.error("Wetterdaten konnten nicht geladen werden.", err);
        setError({
          title: "Wetterdaten konnten nicht geladen werden.",
          description: "Bitte überprüfe deine API-Angaben oder versuche es später erneut.",
        });
      } finally {
        if (!isBackground) {
          setIsFetching(false);
        }
      }
    };

    fetchWeather();
    const intervalId = window.setInterval(() => fetchWeather(true), REFRESH_INTERVAL);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, [settings]);

  const condition = getCondition(weather);
  const temperature = kelvinToCelsius(weather?.main?.temp);
  const feelsLike = kelvinToCelsius(weather?.main?.feels_like);
  const humidity = formatPercent(weather?.main?.humidity);
  const windSpeed = formatWindSpeed(weather?.wind?.speed);
  const location = formatLocation(weather, settings);
  const pressure = weather?.main?.pressure ? `${weather.main.pressure} hPa` : "-";
  const clouds = weather?.clouds?.all != null ? `${weather.clouds.all} %` : "-";
  const visibility = weather?.visibility != null ? formatVisibility(weather.visibility) : "-";
  const windDirection = formatWindDirection(weather?.wind?.deg);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Wetter</h2>
        <p className="text-muted-foreground">
          Live-Daten aus deiner Wetter-Integration. Die Werte werden beim Laden und anschließend jede Minute aktualisiert.
        </p>
        {lastUpdated ? (
          <p className="text-sm text-muted-foreground">
            Letztes Update: <span className="font-medium text-foreground">{formatTime(lastUpdated)}</span>
          </p>
        ) : null}
      </div>

      {!settings ? (
        <NotificationBanner
          variant="info"
          title="Keine Wetter-Einstellungen vorhanden."
          description="Wähle im Tab »Wetter« auf der Einstellungsseite deinen Endpoint, die Postleitzahl und den API-Schlüssel."
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/settings">Einstellungen öffnen</Link>
            </Button>
          }
        />
      ) : null}

      {error ? (
        <NotificationBanner variant="error" title={error.title} description={error.description} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Temperatur"
          value={formatTemperature(temperature)}
          icon={Cloud}
          description={condition}
        />
        <CardMetric title="Luftfeuchtigkeit" value={humidity} icon={Droplets} />
        <CardMetric title="Windgeschwindigkeit" value={windSpeed} icon={Wind} description={windDirection} />
        <CardMetric title="Standort" value={location.value} icon={MapPin} description={location.description} />
      </div>

      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Aktuelle Messwerte</CardTitle>
            <p className="text-sm text-muted-foreground">
              Daten basieren auf deiner letzten Abfrage und aktualisieren sich automatisch.
            </p>
          </div>
          {isFetching ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden="true" />
              Aktualisiere...
            </span>
          ) : null}
        </CardHeader>
        <CardContent>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Gefühlt wie" value={formatTemperature(feelsLike)} />
            <DetailItem label="Luftdruck" value={pressure} />
            <DetailItem label="Bewölkung" value={clouds} />
            <DetailItem label="Sichtweite" value={visibility} />
            <DetailItem label="Windrichtung" value={windDirection} />
            <DetailItem label="Nächste Aktualisierung" value="innerhalb von 60 Sekunden" />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function readSettings(): WeatherSettings | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(WEATHER_STORAGE_KEY);
  return raw ? parseSettings(raw) : null;
}

function parseSettings(raw: string): WeatherSettings | null {
  try {
    const candidate = JSON.parse(raw) as Partial<WeatherSettings>;
    if (
      typeof candidate?.serviceUrl === "string" &&
      typeof candidate?.zip === "string" &&
      typeof candidate?.countryCode === "string" &&
      typeof candidate?.apiKey === "string"
    ) {
      return {
        serviceUrl: candidate.serviceUrl.trim(),
        zip: candidate.zip.trim(),
        countryCode: candidate.countryCode.trim().toLowerCase(),
        apiKey: candidate.apiKey.trim(),
      };
    }
    return null;
  } catch (error) {
    console.error("Ungültige Wetter-Einstellungen.", error);
    return null;
  }
}

function buildUrl(settings: WeatherSettings) {
  const url = new URL(settings.serviceUrl);
  url.searchParams.set("zip", settings.zip);
  url.searchParams.set("country-code", settings.countryCode);
  url.searchParams.set("api", settings.apiKey);
  url.searchParams.set("_ts", Date.now().toString());
  return url.toString();
}

function kelvinToCelsius(value?: number | null) {
  if (typeof value !== "number") {
    return null;
  }
  return value - 273.15;
}

function formatTemperature(value: number | null) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value)} °C`;
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number") {
    return "-";
  }
  return `${value.toFixed(0)} %`;
}

function formatWindSpeed(value?: number | null) {
  if (typeof value !== "number") {
    return "-";
  }
  const kmh = value * 3.6;
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(kmh)} km/h`;
}

function formatWindDirection(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  const directions = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
  const index = Math.round(value / 45) % 8;
  return `${directions[index]} (${value.toFixed(0)}°)`;
}

function formatVisibility(value: number) {
  if (Number.isNaN(value)) {
    return "-";
  }
  const km = value / 1000;
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(km)} km`;
}

function formatLocation(weather: WeatherApiResponse | null, settings: WeatherSettings | null) {
  const city = weather?.name?.trim();
  const country = weather?.sys?.country?.trim() ?? settings?.countryCode?.toUpperCase();
  const fallback = settings ? `${settings.zip} ${settings.countryCode.toUpperCase()}` : "-";

  if (city && country) {
    return {
      value: city,
      description: `${country} · PLZ ${settings?.zip ?? "-"}`,
    };
  }

  return {
    value: fallback,
    description: city ?? "Keine Stadtangabe",
  };
}

function getCondition(weather: WeatherApiResponse | null) {
  const entry = weather?.weather?.[0];
  if (!entry) {
    return "Keine Angabe";
  }

  if (entry.main && conditionTranslations[entry.main]) {
    return conditionTranslations[entry.main];
  }

  return capitalize(entry.description ?? "Unbekannt");
}

function capitalize(value: string) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-2xl border bg-muted/30 p-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}
