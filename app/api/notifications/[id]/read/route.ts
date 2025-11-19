/**
 * Mark Notification as Read API
 *
 * POST /api/notifications/:id/read - Notification als gelesen markieren
 */

import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO: Auth-Check
  // TODO: In Datenbank aktualisieren

  const { id } = await params;
  console.log(`Notification ${id} marked as read`);

  return NextResponse.json({ success: true });
}
