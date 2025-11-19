/**
 * Mark All Notifications as Read API
 *
 * POST /api/notifications/read-all - Alle Notifications als gelesen markieren
 */

import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Auth-Check
  // TODO: In Datenbank aktualisieren

  console.log("All notifications marked as read");

  return NextResponse.json({ success: true });
}
