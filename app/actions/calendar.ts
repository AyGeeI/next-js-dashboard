"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import {
  createEventSchema,
  updateEventSchema,
  deleteEventSchema,
  getEventsSchema,
  getEventByIdSchema,
  type CreateEventInput,
  type UpdateEventInput,
  type DeleteEventInput,
  type GetEventsInput,
  type GetEventByIdInput,
} from "@/lib/validation/calendar";
import { revalidatePath } from "next/cache";

/**
 * Create a new calendar event
 */
export async function createEvent(data: CreateEventInput) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Du musst angemeldet sein, um Events zu erstellen.",
      };
    }

    // Validate input
    const validated = createEventSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Ungültige Eingabedaten.",
      };
    }

    // Create event in database
    const event = await prisma.calendarEvent.create({
      data: {
        ...validated.data,
        date: new Date(validated.data.date),
        userId: session.user.id,
      },
    });

    // Revalidate calendar page
    revalidatePath("/dashboard/kalender");

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
}

/**
 * Get all events for the current user
 */
export async function getEvents(filters?: GetEventsInput) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Du musst angemeldet sein, um Events zu sehen.",
        events: [],
      };
    }

    // Validate filters if provided
    if (filters) {
      const validated = getEventsSchema.safeParse(filters);
      if (!validated.success) {
        return {
          success: false,
          error: "Ungültige Filter-Parameter.",
          events: [],
        };
      }
    }

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    // Fetch events from database
    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    });

    return {
      success: true,
      events,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      events: [],
    };
  }
}

/**
 * Get a single event by ID
 */
export async function getEventById(data: GetEventByIdInput) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Du musst angemeldet sein, um Events zu sehen.",
        event: null,
      };
    }

    // Validate input
    const validated = getEventByIdSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Ungültige Event-ID.",
        event: null,
      };
    }

    // Fetch event from database
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: validated.data.id,
        userId: session.user.id, // Ensure user can only access their own events
      },
    });

    if (!event) {
      return {
        success: false,
        error: "Event nicht gefunden.",
        event: null,
      };
    }

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      event: null,
    };
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(data: UpdateEventInput) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Du musst angemeldet sein, um Events zu bearbeiten.",
      };
    }

    // Validate input
    const validated = updateEventSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Ungültige Eingabedaten.",
      };
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: validated.data.id,
        userId: session.user.id,
      },
    });

    if (!existingEvent) {
      return {
        success: false,
        error: "Event nicht gefunden oder keine Berechtigung.",
      };
    }

    // Prepare update data
    const { id, ...updateData } = validated.data;
    const processedData: any = { ...updateData };

    // Convert date string to Date object if provided
    if (updateData.date) {
      processedData.date = new Date(updateData.date);
    }

    // Update event in database
    const event = await prisma.calendarEvent.update({
      where: {
        id: validated.data.id,
      },
      data: processedData,
    });

    // Revalidate calendar page
    revalidatePath("/dashboard/kalender");

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(data: DeleteEventInput) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Du musst angemeldet sein, um Events zu löschen.",
      };
    }

    // Validate input
    const validated = deleteEventSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Ungültige Event-ID.",
      };
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: validated.data.id,
        userId: session.user.id,
      },
    });

    if (!existingEvent) {
      return {
        success: false,
        error: "Event nicht gefunden oder keine Berechtigung.",
      };
    }

    // Delete event from database
    await prisma.calendarEvent.delete({
      where: {
        id: validated.data.id,
      },
    });

    // Revalidate calendar page
    revalidatePath("/dashboard/kalender");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
}

/**
 * Get event statistics for the dashboard
 */
export async function getEventStats() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Du musst angemeldet sein.",
        stats: null,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Count upcoming events
    const upcomingEvents = await prisma.calendarEvent.count({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
        },
      },
    });

    // Count meetings this month
    const meetings = await prisma.calendarEvent.count({
      where: {
        userId: session.user.id,
        type: "MEETING",
        date: {
          gte: today,
          lte: endOfMonth,
        },
      },
    });

    // Count deadlines this month
    const deadlines = await prisma.calendarEvent.count({
      where: {
        userId: session.user.id,
        type: "DEADLINE",
        date: {
          gte: today,
          lte: endOfMonth,
        },
      },
    });

    // Get next appointment
    const nextAppointment = await prisma.calendarEvent.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: now,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return {
      success: true,
      stats: {
        upcomingEvents,
        meetings,
        deadlines,
        nextAppointment: nextAppointment
          ? {
              title: nextAppointment.title,
              date: nextAppointment.date,
              time: nextAppointment.time,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten.",
      stats: null,
    };
  }
}
