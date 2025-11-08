import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardMetric } from "@/components/widgets/card-metric";
import { mockCalendarEvents } from "@/lib/mocks";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";

const eventTypeLabel: Record<string, string> = {
  meeting: "Meeting",
  personal: "Privat",
  deadline: "Deadline",
};

export default function KalenderPage() {
  const upcomingEvents = mockCalendarEvents.slice(0, 3);
  const totalEvents = mockCalendarEvents.length;
  const meetings = mockCalendarEvents.filter((e) => e.type === "meeting").length;
  const deadlines = mockCalendarEvents.filter((e) => e.type === "deadline").length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
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
          description="Wichtige Fälligkeiten"
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
              <div key={event.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      {eventTypeLabel[event.type] && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {eventTypeLabel[event.type]}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
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
            Dies sind Dummy-Daten. In einer produktiven Umgebung würden hier echte Kalendereinträge aus einer Datenbank
            oder einer API wie Google Calendar erscheinen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
