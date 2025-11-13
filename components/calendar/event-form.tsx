"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { createEventSchema, type CreateEventInput } from "@/lib/validation/calendar";
import { createEvent, updateEvent } from "@/app/actions/calendar";
import { NotificationBanner } from "@/components/ui/notification-banner";

interface EventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultDate?: Date;
  editEvent?: {
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
  };
}

const EVENT_TYPES = [
  { value: "MEETING", label: "Meeting" },
  { value: "PERSONAL", label: "Persönlich" },
  { value: "DEADLINE", label: "Deadline" },
  { value: "APPOINTMENT", label: "Termin" },
] as const;

export function EventForm({ onSuccess, onCancel, defaultDate, editEvent }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = !!editEvent;

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const form = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: editEvent?.title || "",
      description: editEvent?.description ?? "",
      date: formatDateForInput(editEvent?.date || defaultDate || new Date()),
      time: editEvent?.time || "10:00",
      duration: editEvent?.duration ?? "60 Min",
      type: editEvent?.type || ("PERSONAL" as const),
      location: editEvent?.location ?? "",
      attendees: editEvent?.attendees || [],
      reminder: editEvent?.reminder ?? undefined,
    },
  });

  const onSubmit = async (data: CreateEventInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = isEditing
        ? await updateEvent({ id: editEvent.id, ...data })
        : await createEvent(data);

      if (result.success) {
        setSuccess(
          isEditing
            ? "Event erfolgreich aktualisiert."
            : "Event erfolgreich erstellt."
        );
        form.reset();
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        setError(result.error || "Ein Fehler ist aufgetreten.");
      }
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <NotificationBanner variant="error" title="Fehler">
            {error}
          </NotificationBanner>
        )}

        {success && (
          <NotificationBanner variant="success" title="Erfolg">
            {success}
          </NotificationBanner>
        )}

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Team-Meeting"
                  disabled={isSubmitting}
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung (optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Details zum Event"
                  disabled={isSubmitting}
                  className="min-h-[100px] rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date and Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Datum</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Uhrzeit</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duration and Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dauer (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="60 Min"
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormDescription>z. B. 60 Min oder 2 Std</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typ</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Wähle einen Typ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ort (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Konferenzraum A"
                  disabled={isSubmitting}
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Abbrechen
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? isEditing
                ? "Wird aktualisiert …"
                : "Wird erstellt …"
              : isEditing
              ? "Aktualisieren"
              : "Erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
