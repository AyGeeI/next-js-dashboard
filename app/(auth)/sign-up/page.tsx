"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { RefreshCw } from "lucide-react";
import { FormWrapper } from "@/components/common/form-wrapper";
import { FormField } from "@/components/common/form-field";
import { ValidatedInput } from "@/components/common/validated-input";
import { PasswordInput } from "@/components/common/password-input";
import { LoadingScreen } from "@/components/common/loading-screen";
import { toast } from "sonner";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/utils/validation";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/constants/ui";

// ============================================================================
// Validation Schema
// ============================================================================

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "Mindestens 3 Zeichen erforderlich")
      .max(30, "Maximal 30 Zeichen erlaubt")
      .regex(/^[a-zA-Z0-9_]+$/, "Nur Buchstaben, Zahlen und Unterstriche erlaubt"),
    name: z.string().optional(),
    email: z.string().email("Ungültige E-Mail-Adresse"),
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

type SignUpFormData = z.infer<typeof signUpSchema>;

// ============================================================================
// Component
// ============================================================================

export default function SignUpPage() {
  const [success, setSuccess] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  const handleSubmit = async (data: SignUpFormData) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registrierung fehlgeschlagen.");
        return;
      }

      setSuccess(result.message || "Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse.");
      setPendingEmail(result.pendingEmail || data.email);
      toast.success("Registrierung erfolgreich");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    }
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) {
      return;
    }

    setResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "E-Mail konnte nicht erneut gesendet werden.");
        return;
      }

      setSuccess(data.message || "Wir haben dir eine neue E-Mail gesendet.");
      toast.success("Bestätigungs-E-Mail erneut gesendet");
    } catch (err) {
      setError("Versand fehlgeschlagen. Bitte versuche es später erneut.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
      <Card className="w-full max-w-lg rounded-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle>Registrieren</CardTitle>
          <CardDescription>Erstelle dein Konto in wenigen Schritten.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormWrapper
            schema={signUpSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              username: "",
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            enableBeforeUnload={false}
          >
            {({ register, formState: { errors, isSubmitting } }) => (
              <div className="space-y-4">
                {success && (
                  <NotificationBanner
                    variant="success"
                    title="Registrierung erfolgreich"
                    description={success}
                    action={
                      <div className="flex flex-col gap-2 text-right sm:flex-row sm:text-left">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleResendVerification}
                          disabled={resending || !pendingEmail}
                        >
                          {resending ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Wird gesendet ...
                            </span>
                          ) : (
                            "E-Mail erneut senden"
                          )}
                        </Button>
                        <Button type="button" variant="link" asChild>
                          <Link href="/sign-in">Zur Anmeldung</Link>
                        </Button>
                      </div>
                    }
                  >
                    {pendingEmail && <>Wir haben an {pendingEmail} gesendet.</>}
                  </NotificationBanner>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Benutzername"
                    error={errors.username?.message}
                    required
                    helperText="3-30 Zeichen, nur Buchstaben, Zahlen, Unterstriche"
                  >
                    <ValidatedInput
                      {...register("username")}
                      autoComplete="username"
                      disabled={isSubmitting}
                      autoFocus
                      placeholder="benutzername"
                    />
                  </FormField>

                  <FormField
                    label="Name"
                    error={errors.name?.message}
                    helperText="Optional"
                  >
                    <ValidatedInput
                      {...register("name")}
                      disabled={isSubmitting}
                      placeholder="Max Mustermann"
                    />
                  </FormField>
                </div>

                <FormField
                  label="E-Mail-Adresse"
                  error={errors.email?.message}
                  required
                  helperText="Wir senden dir einen Bestätigungslink"
                >
                  <ValidatedInput
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    placeholder="name@example.com"
                  />
                </FormField>

                <FormField
                  label="Passwort"
                  error={errors.password?.message}
                  required
                >
                  <PasswordInput
                    {...register("password")}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    showStrengthIndicator
                    showRequirements
                    placeholder="••••••••"
                  />
                </FormField>

                <FormField
                  label="Passwort bestätigen"
                  error={errors.confirmPassword?.message}
                  required
                >
                  <PasswordInput
                    {...register("confirmPassword")}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    placeholder="••••••••"
                  />
                </FormField>

                {error && (
                  <NotificationBanner
                    variant="error"
                    title="Registrierung fehlgeschlagen"
                    description={error}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Wird registriert..." : "Registrieren"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Bereits ein Konto?{" "}
                  <Link href="/sign-in" className="text-primary hover:underline">
                    Anmelden
                  </Link>
                </div>
              </div>
            )}
          </FormWrapper>
        </CardContent>
      </Card>
    </div>
  );
}
