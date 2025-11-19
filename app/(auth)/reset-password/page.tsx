"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { FormWrapper } from "@/components/common/form-wrapper";
import { FormField } from "@/components/common/form-field";
import { PasswordInput } from "@/components/common/password-input";
import { LoadingScreen } from "@/components/common/loading-screen";
import { toast } from "sonner";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/constants/ui";

// ============================================================================
// Validation Schema
// ============================================================================

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen erforderlich`)
      .max(PASSWORD_MAX_LENGTH, `Maximal ${PASSWORD_MAX_LENGTH} Zeichen erlaubt`)
      .regex(/[a-z]/, "Mindestens einen Kleinbuchstaben erforderlich")
      .regex(/[A-Z]/, "Mindestens einen Großbuchstaben erforderlich")
      .regex(/\d/, "Mindestens eine Zahl erforderlich")
      .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen erforderlich"),
    confirmPassword: z.string().min(1, "Bitte bestätige dein Passwort"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// Component
// ============================================================================

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const tokenMissing = token.length === 0;

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Der Reset-Link ist ungültig oder abgelaufen.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Passwort konnte nicht zurückgesetzt werden.");
        return;
      }

      setSuccess(result.message || "Passwort wurde aktualisiert.");
      toast.success("Passwort gespeichert");

      setTimeout(() => {
        router.push("/sign-in");
      }, 2400);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    }
  };

  return (
    
      <Card className="w-full max-w-lg rounded-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Passwort zurücksetzen</CardTitle>
          <CardDescription>
            Vergib ein neues Passwort und melde dich anschließend erneut an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormWrapper
            schema={resetPasswordSchema}
            onSubmit={handleSubmit}
            defaultValues={{ password: "", confirmPassword: "" }}
            enableBeforeUnload={false}
          >
            {({ register, formState: { errors, isSubmitting } }) => (
              <div className="space-y-4">
                {success && (
                  <NotificationBanner
                    variant="success"
                    title="Passwort gespeichert"
                    description={success}
                  />
                )}

                {tokenMissing && (
                  <NotificationBanner
                    variant="warning"
                    title="Token fehlt"
                    description="Bitte öffne den Link direkt aus der E-Mail zum Zurücksetzen."
                  />
                )}

                <FormField
                  label="Neues Passwort"
                  error={errors.password?.message}
                  required
                >
                  <PasswordInput
                    {...register("password")}
                    autoComplete="new-password"
                    disabled={isSubmitting || tokenMissing}
                    showStrengthIndicator
                    showRequirements
                    placeholder="••••••••"
                  />
                </FormField>

                <FormField
                  label="Neues Passwort bestätigen"
                  error={errors.confirmPassword?.message}
                  required
                >
                  <PasswordInput
                    {...register("confirmPassword")}
                    autoComplete="new-password"
                    disabled={isSubmitting || tokenMissing}
                    placeholder="••••••••"
                  />
                </FormField>

                {error && (
                  <NotificationBanner
                    variant="error"
                    title="Zurücksetzen fehlgeschlagen"
                    description={error}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting || tokenMissing}>
                  {isSubmitting ? "Wird gespeichert..." : "Passwort aktualisieren"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Zurück zum Login?{" "}
                  <Link href="/sign-in" className="text-primary hover:underline">
                    Anmelden
                  </Link>
                </div>
              </div>
            )}
          </FormWrapper>
        </CardContent>
    </Card>
  
  );
}

// ============================================================================
// Page with Suspense
// ============================================================================

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Formular wird vorbereitet..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
