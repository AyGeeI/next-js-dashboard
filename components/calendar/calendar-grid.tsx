"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "MEETING" | "PERSONAL" | "DEADLINE" | "APPOINTMENT";
}

interface CalendarGridProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const EVENT_TYPE_COLORS = {
  MEETING: "bg-primary/10 text-primary border-primary/20",
  PERSONAL: "bg-[hsl(142,70%,36%)]/10 text-[hsl(142,70%,36%)] border-[hsl(142,70%,36%)]/20",
  DEADLINE: "bg-[hsl(0,72%,51%)]/10 text-[hsl(0,72%,51%)] border-[hsl(0,72%,51%)]/20",
  APPOINTMENT: "bg-[hsl(32,95%,44%)]/10 text-[hsl(32,95%,44%)] border-[hsl(32,95%,44%)]/20",
};

export function CalendarGrid({ events, onDateClick, onEventClick }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert to Monday-based (0 = Monday)
  const firstDayMonday = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get days from previous month to fill the grid
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: firstDayMonday },
    (_, i) => daysInPrevMonth - firstDayMonday + i + 1
  );

  // Get days from next month to fill the grid
  const totalCells = Math.ceil((firstDayMonday + daysInMonth) / 7) * 7;
  const nextMonthDays = Array.from(
    { length: totalCells - firstDayMonday - daysInMonth },
    (_, i) => i + 1
  );

  // Get today's date for highlighting
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Get events for a specific date
  const getEventsForDate = (day: number, monthOffset: number = 0) => {
    const date = new Date(year, month + monthOffset, day);
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day: number, monthOffset: number = 0) => {
    const date = new Date(year, month + monthOffset, day);
    onDateClick?.(date);
  };

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="rounded-md"
          >
            Heute
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-9 w-9 rounded-md"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-9 w-9 rounded-md"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-md border bg-card shadow-sm">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Previous month days */}
          {prevMonthDays.map((day, idx) => (
            <div
              key={`prev-${idx}`}
              className="min-h-[100px] border-b border-r p-2 text-muted-foreground/50 last:border-r-0"
            >
              <div className="text-sm">{day}</div>
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "group relative min-h-[100px] border-b border-r p-2 text-left transition-colors last:border-r-0 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isCurrentDay && "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors motion-safe:transition-all motion-safe:duration-200",
                    isCurrentDay &&
                      "bg-primary text-primary-foreground ring-2 ring-primary/20"
                  )}
                >
                  {day}
                </div>

                {/* Event badges */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={cn(
                        "w-full truncate rounded-md border px-2 py-1 text-xs font-medium transition-all hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 motion-safe:duration-200",
                        EVENT_TYPE_COLORS[event.type]
                      )}
                      aria-label={`${event.title} um ${event.time}`}
                    >
                      {event.time} {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      +{dayEvents.length - 2} weitere
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Next month days */}
          {nextMonthDays.map((day, idx) => (
            <div
              key={`next-${idx}`}
              className="min-h-[100px] border-b border-r p-2 text-muted-foreground/50 last:border-r-0"
            >
              <div className="text-sm">{day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-md border bg-card p-4 text-sm shadow-sm">
        <span className="font-medium text-muted-foreground">Legende:</span>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Meeting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[hsl(142,70%,36%)]" />
          <span>Persönlich</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[hsl(0,72%,51%)]" />
          <span>Deadline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[hsl(32,95%,44%)]" />
          <span>Termin</span>
        </div>
      </div>
    </div>
  );
}
