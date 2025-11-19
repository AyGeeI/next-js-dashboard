/**
 * Delete Notification API
 *
 * DELETE /api/notifications/:id - Notification löschen
 */

import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO: Auth-Check
  // TODO: Aus Datenbank löschen

  const { id } = await params;
  console.log(`Notification ${id} deleted`);

  return NextResponse.json({ success: true });
}
