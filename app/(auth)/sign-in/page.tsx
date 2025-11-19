"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { FormWrapper } from "@/components/common/form-wrapper";
import { FormField } from "@/components/common/form-field";
import { ValidatedInput } from "@/components/common/validated-input";
import { PasswordInput } from "@/components/common/password-input";
import { LoadingScreen } from "@/components/common/loading-screen";
import { toast } from "sonner";

// ============================================================================
// Validation Schema
// ============================================================================

const signInSchema = z.object({
  identifier: z.string().min(1, "Bitte gib deine E-Mail oder deinen Benutzernamen ein"),
  password: z.string().min(1, "Bitte gib dein Passwort ein"),
});

type SignInFormData = z.infer<typeof signInSchema>;

// ============================================================================
// Component
// ============================================================================

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resending, setResending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const verificationEmail = pendingEmail || "";

  useEffect(() => {
    if (searchParams?.get("registered")) {
      setInfo("Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest.");
    }
  }, [searchParams]);

  const handleSubmit = async (data: SignInFormData) => {
    setError("");
    setInfo("");

    try {
      const result = await loginAction(data.identifier, data.password, rememberMe);

      if (result.error) {
        setError(result.error);
        if (result.errorCode === "EMAIL_NOT_VERIFIED") {
          setInfo("Bitte bestätige deine E-Mail-Adresse, um dich anzumelden.");
          setPendingEmail(result.pendingEmail || (data.identifier.includes("@") ? data.identifier : ""));
        }
      } else if (result.success) {
        toast.success("Erfolgreich angemeldet");
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");

        router.push(from || "/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = pendingEmail;

    if (!targetEmail) {
      setError("Bitte gib zuerst deine E-Mail-Adresse ein.");
      return;
    }

    setError("");
    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "E-Mail konnte nicht erneut gesendet werden.");
        return;
      }

      setInfo(data.message || "Wir haben dir eine neue E-Mail gesendet.");
      toast.success("Bestätigungs-E-Mail erneut gesendet");
      setPendingEmail(targetEmail);
    } catch (err) {
      setError("Versand fehlgeschlagen. Bitte versuche es später erneut.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-lg rounded-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>Melde dich mit E-Mail oder Benutzername an.</CardDescription>
      </CardHeader>
        <CardContent>
          <FormWrapper
            schema={signInSchema}
            onSubmit={handleSubmit}
            defaultValues={{ identifier: "", password: "" }}
            enableBeforeUnload={false}
          >
            {({ register, formState: { errors, isSubmitting } }) => (
              <div className="space-y-4">
                {info && (
                  <NotificationBanner
                    variant="info"
                    title="Bestätigung erforderlich"
                    description={info}
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={resending || !verificationEmail}
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
                    }
                  >
                    {verificationEmail && <>E-Mail: {verificationEmail}</>}
                  </NotificationBanner>
                )}

                <FormField
                  label="E-Mail oder Benutzername"
                  error={errors.identifier?.message}
                  required
                >
                  <ValidatedInput
                    {...register("identifier")}
                    type="text"
                    autoComplete="username"
                    disabled={isSubmitting}
                    autoFocus
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
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    placeholder="••••••••"
                  />
                </FormField>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="rememberMe" className="cursor-pointer text-xs font-medium">
                      Angemeldet bleiben
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary transition hover:text-primary/80"
                  >
                    Passwort vergessen?
                  </Link>
                </div>

                {error && (
                  <NotificationBanner
                    variant="error"
                    title="Anmeldung fehlgeschlagen"
                    description={error}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Wird angemeldet..." : "Anmelden"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Noch kein Konto?{" "}
                  <Link href="/sign-up" className="text-primary hover:underline">
                    Registrieren
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

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Anmeldung wird vorbereitet..." />}>
      <SignInContent />
    </Suspense>
  );
}
