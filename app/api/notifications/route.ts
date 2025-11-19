/**
 * Notifications API
 *
 * GET /api/notifications - Alle Notifications abrufen
 *
 * TODO: In Produktion durch echte DB-Abfrage ersetzen
 */

import { NextResponse } from "next/server";

// Mock Notifications (später aus DB holen)
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Willkommen im Dashboard",
    message: "Danke, dass du vyrnix.net verwendest!",
    type: "system",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
  },
  {
    id: "2",
    title: "Neues Update verfügbar",
    message: "Version 1.0.1 steht zum Download bereit",
    type: "update",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    link: "/dashboard/settings",
  },
  {
    id: "3",
    title: "Wetter-Widget aktualisiert",
    message: "Die Wettervorhersage wurde aktualisiert",
    type: "info",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    link: "/dashboard/widgets/weather",
  },
];

export async function GET() {
  // TODO: Auth-Check
  // TODO: Aus Datenbank holen

  return NextResponse.json(MOCK_NOTIFICATIONS);
}
