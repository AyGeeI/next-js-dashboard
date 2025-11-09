import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { adminUserCreateSchema } from "@/lib/validation/admin";

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

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Zugriff verweigert." }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: ADMIN_SELECT,
    });

    return NextResponse.json({
      users: users.map(serializeUser),
    });
  } catch (error) {
    console.error("Admin users fetch failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Zugriff verweigert." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validationResult = adminUserCreateSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json({ error: "Validierung fehlgeschlagen.", errors }, { status: 400 });
    }

    const { name, username, email, role, password } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedName = name?.trim();
    const safeName = normalizedName && normalizedName.length > 0 ? normalizedName : null;

    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: "Es existiert bereits ein Konto mit dieser E-Mail-Adresse.",
          errors: [{ field: "email", message: "E-Mail wird bereits verwendet." }],
        },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          error: "Dieser Benutzername ist bereits vergeben.",
          errors: [{ field: "username", message: "Benutzername wird bereits verwendet." }],
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: safeName,
        username: normalizedUsername,
        email: normalizedEmail,
        role,
        passwordHash,
        emailVerified: new Date(),
      },
      select: ADMIN_SELECT,
    });

    return NextResponse.json(
      {
        message: "Benutzer wurde angelegt.",
        user: serializeUser(user),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin user creation failed:", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
