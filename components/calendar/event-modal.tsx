"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Trash2, Pencil, Info } from "lucide-react";
import { deleteEvent } from "@/app/actions/calendar";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { EventForm } from "./event-form";

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

interface EventModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated?: () => void;
}

const EVENT_TYPE_LABELS = {
  MEETING: "Meeting",
  PERSONAL: "Persönlich",
  DEADLINE: "Deadline",
  APPOINTMENT: "Termin",
};

const EVENT_TYPE_COLORS = {
  MEETING: "bg-primary/10 text-primary border-primary/20",
  PERSONAL: "bg-[hsl(142,70%,36%)]/10 text-[hsl(142,70%,36%)] border-[hsl(142,70%,36%)]/20",
  DEADLINE: "bg-[hsl(0,72%,51%)]/10 text-[hsl(0,72%,51%)] border-[hsl(0,72%,51%)]/20",
  APPOINTMENT: "bg-[hsl(32,95%,44%)]/10 text-[hsl(32,95%,44%)] border-[hsl(32,95%,44%)]/20",
};

export function EventModal({ event, open, onOpenChange, onEventUpdated }: EventModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(event.date));

  const handleDelete = async () => {
    if (!confirm("Möchtest du dieses Event wirklich löschen?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteEvent({ id: event.id });

      if (result.success) {
        onOpenChange(false);
        onEventUpdated?.();
      } else {
        setError(result.error || "Fehler beim Löschen des Events.");
      }
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onEventUpdated?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-md">
        {isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle>Event bearbeiten</DialogTitle>
              <DialogDescription>
                Bearbeite die Details des Events.
              </DialogDescription>
            </DialogHeader>
            <EventForm
              editEvent={event}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <DialogTitle className="text-2xl">{event.title}</DialogTitle>
                  <div
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm font-medium ${
                      EVENT_TYPE_COLORS[event.type]
                    }`}
                  >
                    <Info className="h-4 w-4" />
                    {EVENT_TYPE_LABELS[event.type]}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-9 w-9 rounded-md"
                    aria-label="Event bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-9 w-9 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Event löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {error && (
              <NotificationBanner variant="error" title="Fehler">
                {error}
              </NotificationBanner>
            )}

            <div className="space-y-4">
              {/* Date and Time */}
              <div className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Datum</p>
                    <p className="font-medium">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uhrzeit</p>
                    <p className="font-medium">
                      {event.time} {event.duration && `(${event.duration})`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="rounded-md border bg-card p-4 shadow-sm">
                  <h3 className="mb-2 font-semibold">Beschreibung</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-3 rounded-md border bg-card p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ort</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="rounded-md border bg-card p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Teilnehmer</h3>
                  </div>
                  <ul className="ml-[52px] space-y-1">
                    {event.attendees.map((attendee, index) => (
                      <li key={index} className="text-muted-foreground">
                        {attendee}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reminder */}
              {event.reminder !== null && event.reminder !== undefined && (
                <div className="rounded-md border bg-[hsl(221,83%,53%)]/10 p-4 text-[hsl(221,83%,53%)]">
                  <p className="text-sm font-medium">
                    Erinnerung: {event.reminder} Minuten vor dem Event
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
