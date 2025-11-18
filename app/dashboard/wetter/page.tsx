"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { CardMetric } from "@/components/widgets/card-metric";
import { Cloud, Droplets, MapPin, RefreshCcw, Wind } from "lucide-react";

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
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<{ title: string; description?: string } | null>(null);
  const [settingsMissing, setSettingsMissing] = useState(false);

  useEffect(() => {
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
        controller?.abort();
        controller = new AbortController();

        const response = await fetch("/api/weather/current", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!active) {
          return;
        }

        if (response.status === 404) {
          setSettingsMissing(true);
          setWeather(null);
          setLastUpdated(null);
          setError(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as WeatherApiResponse;
        if (!active) {
          return;
        }

        setWeather(payload);
        setSettingsMissing(false);
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
          description: "Bitte prüfe deine Einstellungen oder versuche es später erneut.",
        });
      } finally {
        if (!isBackground) {
          setIsFetching(false);
        }
      }
    };

    fetchWeather();
    const intervalId = window.setInterval(() => fetchWeather(true), REFRESH_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchWeather(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const condition = getCondition(weather);
  const temperature = kelvinToCelsius(weather?.main?.temp);
  const feelsLike = kelvinToCelsius(weather?.main?.feels_like);
  const humidity = formatPercent(weather?.main?.humidity);
  const windSpeed = formatWindSpeed(weather?.wind?.speed);
  const location = formatLocation(weather);
  const pressure = weather?.main?.pressure ? `${weather.main.pressure} hPa` : "-";
  const clouds = weather?.clouds?.all != null ? `${weather.clouds.all} %` : "-";
  const visibility = weather?.visibility != null ? formatVisibility(weather.visibility) : "-";
  const windDirection = formatWindDirection(weather?.wind?.deg);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Wetter</h1>
        <p className="text-sm text-muted-foreground">
          Aktuelle Wetterdaten und Vorhersagen für deinen Standort
        </p>
      </div>

      {settingsMissing ? (
        <NotificationBanner
          className="relative z-0"
          variant="info"
          title="Keine Wetter-Einstellungen vorhanden."
          description="Hinterlege Postleitzahl, Ländercode und deinen OpenWeatherMap API-Key, damit wir Live-Daten abrufen können."
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/settings">Einstellungen öffnen</Link>
            </Button>
          }
        />
      ) : null}

      {error ? (
        <NotificationBanner
          className="relative z-0"
          variant="error"
          title={error.title}
          description={error.description}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric title="Temperatur" value={formatTemperature(temperature)} icon={Cloud} description={condition} />
        <CardMetric title="Luftfeuchtigkeit" value={humidity} icon={Droplets} />
        <CardMetric title="Windgeschwindigkeit" value={windSpeed} icon={Wind} description={windDirection} />
        <CardMetric title="Standort" value={location.value} icon={MapPin} description={location.description} />
      </div>

      <Card className="rounded-md border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Aktuelle Messwerte</CardTitle>
            <p className="text-xs text-muted-foreground">
              Echtzeitdaten basierend auf deinen gespeicherten OpenWeatherMap Angaben.
            </p>
          </div>
          {isFetching ? (
            <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden="true" />
              Aktualisiere...
            </span>
          ) : null}
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Gefühlt wie" value={formatTemperature(feelsLike)} />
            <DetailItem label="Luftdruck" value={pressure} />
            <DetailItem label="Bewölkung" value={clouds} />
            <DetailItem label="Sichtweite" value={visibility} />
            <DetailItem label="Windrichtung" value={windDirection} />
            <DetailItem label="Windgeschwindigkeit" value={windSpeed} />
          </dl>
          <p className="mt-6 text-xs text-muted-foreground">
            Zuletzt aktualisiert {formatRelativeUpdate(lastUpdated)} · automatische Aktualisierung jede Minute.
          </p>
        </CardContent>
      </Card>
    </div>
  );
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

function formatLocation(weather: WeatherApiResponse | null) {
  const city = weather?.name?.trim();
  const country = weather?.sys?.country?.trim();

  if (city && country) {
    return {
      value: city,
      description: country,
    };
  }

  if (city) {
    return {
      value: city,
      description: "Keine Länderangabe",
    };
  }

  if (country) {
    return {
      value: country,
      description: "Keine Stadtangabe",
    };
  }

  return {
    value: "-",
    description: "Keine Standortinformationen",
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

function formatRelativeUpdate(date: Date | null) {
  if (!date) {
    return "noch nicht verfügbar";
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes === 0) {
    return "gerade eben";
  }

  if (minutes === 1) {
    return "vor 1 Minute";
  }

  return `vor ${minutes} Minuten`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-md border bg-muted/30 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold text-foreground">{value}</dd>
    </div>
  );
}
