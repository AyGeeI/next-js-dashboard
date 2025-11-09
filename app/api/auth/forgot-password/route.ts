import { NextRequest, NextResponse } from "next/server";
import { loginIdentifierSchema } from "@/lib/validation/auth";
import { findUserByIdentifier } from "@/lib/auth/user";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifierInput = body?.identifier ?? body?.email ?? "";
    const validation = loginIdentifierSchema.safeParse(identifierInput);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Bitte gib eine gültige E-Mail-Adresse oder deinen Benutzernamen ein.",
          errors: validation.error.issues.map((issue) => ({
            field: "identifier",
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const identifier = validation.data;
    const user = await findUserByIdentifier(identifier);

    if (user?.email) {
      try {
        const { token } = await createPasswordResetToken(user.id);
        await sendPasswordResetEmail(user.email, token);
      } catch (emailError) {
        console.error("[Password Reset] Versand fehlgeschlagen:", emailError);
        return NextResponse.json(
          { error: "E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      message: "Falls ein Konto existiert, senden wir dir in Kürze eine E-Mail mit weiteren Schritten.",
    });
  } catch (error) {
    console.error("[Password Reset] Unexpected error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 },
    );
  }
}
