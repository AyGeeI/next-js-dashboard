"use client";

import { useState, useEffect } from "react";
import { CardMetric } from "@/components/widgets/card-metric";
import { Calendar, Clock, Users, AlertCircle, Plus } from "lucide-react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { EventCard } from "@/components/calendar/event-card";
import { EventModal } from "@/components/calendar/event-modal";
import { EventForm } from "@/components/calendar/event-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvents, getEventStats } from "@/app/actions/calendar";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  date: Date;
  time: string;
  duration?: string | null;
  type: "MEETING" | "PERSONAL" | "DEADLINE" | "APPOINTMENT";
  location?: string | null;
  attendees?: string[];
  reminder?: number | null;
}

export default function KalenderPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsResult, statsResult] = await Promise.all([
        getEvents(),
        getEventStats(),
      ]);

      if (eventsResult.success) {
        setEvents(eventsResult.events as CalendarEvent[]);
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateDialogOpen(true);
  };

  const handleEventUpdated = () => {
    loadData();
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    setSelectedDate(undefined);
    loadData();
  };

  // Get upcoming events (next 7 days)
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Kalender</h2>
          <p className="text-muted-foreground">
            Verwalte deine Termine und Events
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Neues Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle>Neues Event erstellen</DialogTitle>
              <DialogDescription>
                Erstelle ein neues Event in deinem Kalender.
              </DialogDescription>
            </DialogHeader>
            <EventForm
              defaultDate={selectedDate}
              onSuccess={handleCreateSuccess}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setSelectedDate(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardMetric
            title="Anstehende Events"
            value={stats?.upcomingEvents || 0}
            icon={Calendar}
            description="Ab heute"
          />
          <CardMetric
            title="Meetings"
            value={stats?.meetings || 0}
            icon={Users}
            description="Diesen Monat"
          />
          <CardMetric
            title="Deadlines"
            value={stats?.deadlines || 0}
            icon={AlertCircle}
            description="Diesen Monat"
          />
          <CardMetric
            title="Nächster Termin"
            value={stats?.nextAppointment?.time || "-"}
            icon={Clock}
            description={stats?.nextAppointment?.title || "Keine Termine"}
          />
        </div>
      )}

      {/* Calendar Grid */}
      {isLoading ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <CalendarGrid
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {/* Upcoming Events List */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Kommende Events (nächste 7 Tage)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Keine anstehenden Events in den nächsten 7 Tagen
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Erstelle dein erstes Event mit dem Button oben.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
}
