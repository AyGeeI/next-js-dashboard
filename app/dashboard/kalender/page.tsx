import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardMetric } from "@/components/widgets/card-metric";
import { mockCalendarEvents } from "@/lib/mocks";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";

export default function KalenderPage() {
  const upcomingEvents = mockCalendarEvents.slice(0, 3);
  const totalEvents = mockCalendarEvents.length;
  const meetings = mockCalendarEvents.filter((e) => e.type === "meeting").length;
  const deadlines = mockCalendarEvents.filter((e) => e.type === "deadline").length;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "border-l-blue-500";
      case "personal":
        return "border-l-green-500";
      case "deadline":
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">Meeting</span>;
      case "personal":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Privat</span>;
      case "deadline":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">Deadline</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Kalender</h2>
        <p className="text-muted-foreground">
          Ihre anstehenden Termine und Events (Dummy-Daten)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Anstehende Events"
          value={totalEvents}
          icon={Calendar}
          description="In den nächsten 7 Tagen"
        />
        <CardMetric
          title="Meetings"
          value={meetings}
          icon={Users}
          description="Geplante Besprechungen"
        />
        <CardMetric
          title="Deadlines"
          value={deadlines}
          icon={AlertCircle}
          description="Wichtige Termine"
        />
        <CardMetric
          title="Nächster Termin"
          value={upcomingEvents[0]?.time || "-"}
          icon={Clock}
          description={upcomingEvents[0]?.title || "Keine Termine"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kommende Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCalendarEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-lg border-l-4 bg-card p-4 ${getEventTypeColor(
                  event.type
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      {getEventTypeBadge(event.type)}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString("de-DE", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                        {event.duration && ` (${event.duration})`}
                      </span>
                    </div>
                  </div>
                </div>
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
            Kalendereinträge aus einer Datenbank oder Kalender-API (z.B. Google
            Calendar) angezeigt werden.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
