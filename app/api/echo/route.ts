import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Echo API Route funktioniert!",
    timestamp: new Date().toISOString(),
    data: [
      { id: 1, title: "Hallo Dashboard", value: 42 },
      { id: 2, title: "Test-Daten", value: 123 },
      { id: 3, title: "Dummy-Content", value: 789 },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    message: "Daten empfangen!",
    receivedData: body,
    timestamp: new Date().toISOString(),
  });
}
