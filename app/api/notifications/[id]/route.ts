/**
 * Delete Notification API
 *
 * DELETE /api/notifications/:id - Notification löschen
 */

import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Auth-Check
  // TODO: Aus Datenbank löschen

  console.log(`Notification ${params.id} deleted`);

  return NextResponse.json({ success: true });
}
