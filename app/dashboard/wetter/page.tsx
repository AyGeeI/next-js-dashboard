import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardMetric } from "@/components/widgets/card-metric";
import { mockWeatherData } from "@/lib/mocks";
import { Cloud, Droplets, Wind, MapPin } from "lucide-react";

export default function WetterPage() {
  const { current, forecast } = mockWeatherData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wetter</h2>
        <p className="text-muted-foreground">
          Aktuelle Wetterinformationen und Vorhersage (Dummy-Daten)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Temperatur"
          value={`${current.temperature}°C`}
          icon={Cloud}
          description={current.condition}
        />
        <CardMetric
          title="Luftfeuchtigkeit"
          value={`${current.humidity}%`}
          icon={Droplets}
        />
        <CardMetric
          title="Windgeschwindigkeit"
          value={`${current.windSpeed} km/h`}
          icon={Wind}
        />
        <CardMetric
          title="Standort"
          value={current.location.split(",")[0]}
          icon={MapPin}
          description={current.location}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>5-Tage-Vorhersage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-5">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="flex flex-col items-center rounded-lg border p-4"
              >
                <p className="text-sm font-medium">{day.day}</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {day.temp}°
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {day.condition}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Hinweis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dies sind Dummy-Daten. In einer produktiven Umgebung würden hier echte
            Wetterdaten von einer API (z.B. OpenWeatherMap) angezeigt werden.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
