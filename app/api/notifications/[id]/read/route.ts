/**
 * Mark Notification as Read API
 *
 * POST /api/notifications/:id/read - Notification als gelesen markieren
 */

import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Auth-Check
  // TODO: In Datenbank aktualisieren

  console.log(`Notification ${params.id} marked as read`);

  return NextResponse.json({ success: true });
}
