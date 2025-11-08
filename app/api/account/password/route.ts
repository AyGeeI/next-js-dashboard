import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { compare, hash } from "bcryptjs";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { passwordChangeSchema } from "@/lib/validation/account";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = passwordChangeSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        { error: "Validierung fehlgeschlagen.", errors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const passwordsMatch = await compare(currentPassword, user.passwordHash);

    if (!passwordsMatch) {
      return NextResponse.json(
        {
          error: "Aktuelles Passwort ist nicht korrekt.",
          errors: [{ field: "currentPassword", message: "Passwort stimmt nicht überein." }],
        },
        { status: 400 }
      );
    }

    const newHash = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newHash,
        passwordChangedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/account");

    return NextResponse.json({ message: "Passwort wurde aktualisiert." });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
