"use client";

import { Calendar, Clock, MapPin, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  date: Date;
  time: string;
  duration?: string | null;
  type: "MEETING" | "PERSONAL" | "DEADLINE" | "APPOINTMENT";
  location?: string | null;
}

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
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

export function EventCard({ event, onClick }: EventCardProps) {
  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(event.date));

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        "group w-full rounded-md border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-safe:duration-200",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          {/* Header with type badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary motion-safe:transition-colors motion-safe:duration-200">
              {event.title}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                EVENT_TYPE_COLORS[event.type]
              )}
            >
              <Info className="h-3 w-3" />
              {EVENT_TYPE_LABELS[event.type]}
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {event.description}
            </p>
          )}

          {/* Date, Time, Duration */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {event.time} {event.duration && `(${event.duration})`}
              </span>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
