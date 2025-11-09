import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { adminUserUpdateSchema } from "@/lib/validation/admin";

const ADMIN_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

function serializeUser(user: { id: string; name: string | null; username: string; email: string; role: "ADMIN" | "STANDARD"; createdAt: Date }) {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Zugriff verweigert." }, { status: 403 });
  }

  const { userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validationResult = adminUserUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json({ error: "Validierung fehlgeschlagen.", errors }, { status: 400 });
    }

    const { name, username, email, role } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedName = name?.trim();
    const safeName = normalizedName && normalizedName.length > 0 ? normalizedName : null;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Benutzer wurde nicht gefunden." }, { status: 404 });
    }

    const emailOwner = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (emailOwner) {
      return NextResponse.json(
        {
          error: "Es existiert bereits ein Konto mit dieser E-Mail-Adresse.",
          errors: [{ field: "email", message: "E-Mail wird bereits verwendet." }],
        },
        { status: 409 }
      );
    }

    const usernameOwner = await prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (usernameOwner) {
      return NextResponse.json(
        {
          error: "Dieser Benutzername ist bereits vergeben.",
          errors: [{ field: "username", message: "Benutzername wird bereits verwendet." }],
        },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: safeName,
        email: normalizedEmail,
        username: normalizedUsername,
        role,
      },
      select: ADMIN_SELECT,
    });

    return NextResponse.json({
      message: "Benutzer wurde aktualisiert.",
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("Admin user update failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
