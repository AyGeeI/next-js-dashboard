import { z } from "zod";

/**
 * Event type enum validation
 */
export const eventTypeSchema = z.enum(["MEETING", "PERSONAL", "DEADLINE", "APPOINTMENT"], {
  message: "Bitte wähle einen gültigen Event-Typ.",
});

/**
 * Date validation schema
 */
export const dateSchema = z.string().refine(
  (date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  },
  { message: "Bitte gib ein gültiges Datum an." }
);

/**
 * Time validation schema (HH:MM format)
 */
export const timeSchema = z.string().regex(
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  "Bitte gib eine gültige Uhrzeit im Format HH:MM an."
);

/**
 * Duration validation schema
 */
export const durationSchema = z.string().regex(
  /^\d+\s?(Min|Std|min|std)$/,
  "Bitte gib eine gültige Dauer an (z. B. '60 Min' oder '2 Std')."
);

/**
 * Reminder validation schema (minutes before event)
 */
export const reminderSchema = z.number().int().min(0).max(10080, "Erinnerung darf maximal 7 Tage (10080 Minuten) im Voraus sein.");

/**
 * Create event schema
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Titel ist erforderlich.")
    .max(100, "Titel darf maximal 100 Zeichen lang sein."),
  description: z
    .string()
    .max(500, "Beschreibung darf maximal 500 Zeichen lang sein.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  date: dateSchema,
  time: timeSchema,
  duration: durationSchema.optional().or(z.literal("").transform(() => undefined)),
  type: eventTypeSchema.optional().default("PERSONAL"),
  location: z
    .string()
    .max(200, "Ort darf maximal 200 Zeichen lang sein.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  attendees: z.array(z.string()).optional().default([]),
  reminder: reminderSchema.optional(),
});

/**
 * Update event schema (all fields optional except id)
 */
export const updateEventSchema = z.object({
  id: z.string().cuid("Ungültige Event-ID."),
  title: z
    .string()
    .min(1, "Titel ist erforderlich.")
    .max(100, "Titel darf maximal 100 Zeichen lang sein.")
    .optional(),
  description: z
    .string()
    .max(500, "Beschreibung darf maximal 500 Zeichen lang sein.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  date: dateSchema.optional(),
  time: timeSchema.optional(),
  duration: durationSchema.optional().or(z.literal("").transform(() => undefined)),
  type: eventTypeSchema.optional(),
  location: z
    .string()
    .max(200, "Ort darf maximal 200 Zeichen lang sein.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  attendees: z.array(z.string()).optional(),
  reminder: reminderSchema.optional(),
});

/**
 * Delete event schema
 */
export const deleteEventSchema = z.object({
  id: z.string().cuid("Ungültige Event-ID."),
});

/**
 * Get events schema (for filtering)
 */
export const getEventsSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  type: eventTypeSchema.optional(),
});

/**
 * Get event by ID schema
 */
export const getEventByIdSchema = z.object({
  id: z.string().cuid("Ungültige Event-ID."),
});

/**
 * Type exports for TypeScript
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
export type GetEventsInput = z.infer<typeof getEventsSchema>;
export type GetEventByIdInput = z.infer<typeof getEventByIdSchema>;
export type EventType = z.infer<typeof eventTypeSchema>;
