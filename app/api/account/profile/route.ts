import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validation/account";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = profileUpdateSchema.safeParse(body);

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

    const userId = session.user.id;
    const { name, username } = validationResult.data;
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedName = name?.trim() ?? null;

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
        name: normalizedName && normalizedName.length > 0 ? normalizedName : null,
        username: normalizedUsername,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        passwordChangedAt: true,
        role: true,
      },
    });

    revalidatePath("/dashboard/account");

    return NextResponse.json({
      message: "Profil wurde aktualisiert.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
