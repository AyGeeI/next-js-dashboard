"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Eye, EyeOff, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const passwordStrengthMap = {
  weak: { label: "Schwach", bar: "bg-destructive", text: "text-destructive" },
  medium: { label: "Solide", bar: "bg-warning", text: "text-warning" },
  strong: { label: "Stark", bar: "bg-success", text: "text-success" },
} as const;

function evaluatePasswordStrength(password: string) {
  if (!password) {
    return { score: 0, ...passwordStrengthMap.weak, label: "Noch kein Passwort" };
  }

  const lengthScore = password.length >= 16 ? 2 : password.length >= 12 ? 1 : 0;
  const varietyScore = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const totalScore = lengthScore + varietyScore;

  if (totalScore >= 5) {
    return { score: 3, ...passwordStrengthMap.strong };
  }

  if (totalScore >= 3) {
    return { score: 2, ...passwordStrengthMap.medium };
  }

  return { score: password ? 1 : 0, ...passwordStrengthMap.weak };
}

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const tokenMissing = token.length === 0;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!token) {
      setStatus({
        type: "error",
        message: "Der Reset-Link ist ungültig oder abgelaufen.",
      });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const issues = data.errors as Array<{ field?: string; message: string }>;
          setFieldErrors(
            issues.reduce((acc, issue) => {
              if (issue.field && issue.message) {
                acc[issue.field as keyof FieldErrors] = issue.message;
              }
              return acc;
            }, {} as FieldErrors),
          );
        }

        setStatus({
          type: "error",
          message: data.error || "Passwort konnte nicht zurückgesetzt werden.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Passwort wurde aktualisiert.",
      });
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/sign-in");
      }, 2400);
    } catch (error) {
      console.error("Reset password error:", error);
      setStatus({
        type: "error",
        message: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
      <Card className="w-full max-w-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Passwort zurücksetzen</CardTitle>
          <CardDescription>
            Vergib ein neues Passwort und melde dich anschließend erneut an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status && (
              <NotificationBanner
                variant={status.type === "success" ? "success" : "error"}
                title={status.type === "success" ? "Passwort gespeichert" : "Zurücksetzen fehlgeschlagen"}
                description={status.message}
              />
            )}

            {tokenMissing && (
              <NotificationBanner
                variant="warning"
                title="Token fehlt"
                description="Bitte öffne den Link direkt aus der E-Mail zum Zurücksetzen."
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className="text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label="Passwortanforderungen anzeigen"
                    >
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      Mindestens 12 Zeichen, Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
              <div aria-live="polite" className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Passwortstärke</span>
                  <span className={`font-medium ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className={`h-1 rounded-full bg-muted transition-colors ${
                        strength.score > index ? strength.bar : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting || tokenMissing}>
              {submitting ? "Wird gespeichert ..." : "Passwort aktualisieren"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Zurück zum Login?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Anmelden
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={(
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
          <Card className="w-full max-w-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Passwort zurücksetzen</CardTitle>
              <CardDescription>Bitte warten...</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Wir bereiten das Formular vor.
            </CardContent>
          </Card>
        </div>
      )}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
