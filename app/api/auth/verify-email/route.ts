import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Ungueltiger oder fehlender Token." },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token wurde nicht gefunden oder ist bereits verbraucht." },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "Token ist abgelaufen. Bitte fordere eine neue Bestaetigung an." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "Zuordnung fuer dieses Token konnte nicht gefunden werden." },
        { status: 400 }
      );
    }

    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: verificationToken.identifier },
    });

    return NextResponse.json({ message: "E-Mail erfolgreich bestaetigt." });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
