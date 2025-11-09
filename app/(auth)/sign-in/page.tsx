"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Eye, EyeOff } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [forgotFieldError, setForgotFieldError] = useState("");
  const verificationEmail = pendingEmail || (identifier.includes("@") ? identifier : "");

  useEffect(() => {
    if (searchParams?.get("registered")) {
      setInfo("Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (forgotOpen && identifier && !forgotIdentifier) {
      setForgotIdentifier(identifier);
    }
  }, [forgotOpen, identifier, forgotIdentifier]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const result = await loginAction(identifier, password, rememberMe);

      if (result.error) {
        setError(result.error);
        if (result.errorCode === "EMAIL_NOT_VERIFIED") {
          setInfo("Bitte bestätige deine E-Mail-Adresse, um dich anzumelden.");
          setPendingEmail(result.pendingEmail || (identifier.includes("@") ? identifier : ""));
        }
      } else if (result.success) {
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");

        router.push(from || "/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = pendingEmail || (identifier.includes("@") ? identifier : "");

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
      setPendingEmail(targetEmail);
    } catch (err) {
      setError("Versand fehlgeschlagen. Bitte versuche es später erneut.");
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (forgotLoading) {
      return;
    }

    const value = forgotIdentifier.trim() || identifier.trim();

    if (!value) {
      setForgotFieldError("Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein.");
      return;
    }

    setForgotFieldError("");
    setForgotStatus(null);
    setForgotLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors) && data.errors[0]?.message) {
          setForgotFieldError(data.errors[0].message);
        }
        setForgotStatus({
          type: "error",
          message: data.error || "Anfrage konnte nicht verarbeitet werden.",
        });
        return;
      }

      setForgotStatus({
        type: "success",
        message: data.message || "Wir haben dir eine E-Mail mit weiteren Schritten gesendet.",
      });
      setForgotIdentifier(value);
    } catch (err) {
      console.error("Forgot password error:", err);
      setForgotStatus({
        type: "error",
        message: "Etwas ist schiefgelaufen. Bitte versuche es später erneut.",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
      <Card className="w-full max-w-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>Melde dich mit E-Mail oder Benutzername an.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="identifier">E-Mail oder Benutzername</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
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
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  disabled={loading}
                />
                <div className="leading-tight">
                  <Label htmlFor="rememberMe" className="cursor-pointer text-base font-medium">
                    Angemeldet bleiben
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ohne Aktivität 30 Min. online, mit dieser Option 24 Stunden.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-primary transition hover:text-primary/80"
                onClick={() => {
                  setForgotOpen((prev) => !prev);
                  setForgotStatus(null);
                  setForgotFieldError("");
                }}
                aria-expanded={forgotOpen}
                aria-controls="forgot-password-panel"
              >
                Passwort vergessen?
              </button>
            </div>

            {error && (
              <NotificationBanner
                variant="error"
                title="Anmeldung fehlgeschlagen"
                description={error}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Registrieren
              </Link>
            </div>
          </form>
          {forgotOpen && (
            <form
              id="forgot-password-panel"
              className="mt-4 space-y-3 rounded-2xl border border-dashed border-border/60 bg-accent/10 p-4"
              onSubmit={handleForgotPassword}
            >
              <p className="text-sm text-muted-foreground">
                Wir schicken dir einen Link zum Zurücksetzen. Der Link ist 30 Minuten gültig.
              </p>
              <div className="space-y-2">
                <Label htmlFor="forgotIdentifier">E-Mail oder Benutzername</Label>
                <Input
                  id="forgotIdentifier"
                  value={forgotIdentifier}
                  onChange={(event) => setForgotIdentifier(event.target.value)}
                  placeholder="z. B. maria@beispiel.de"
                  disabled={forgotLoading}
                />
                {forgotFieldError && <p className="text-xs text-destructive">{forgotFieldError}</p>}
              </div>
              {forgotStatus && (
                <NotificationBanner
                  variant={forgotStatus.type === "success" ? "success" : "error"}
                  title={forgotStatus.type === "success" ? "E-Mail unterwegs" : "Anfrage fehlgeschlagen"}
                  description={forgotStatus.message}
                />
              )}
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForgotOpen(false)}
                  disabled={forgotLoading}
                >
                  Schließen
                </Button>
                <Button type="submit" size="sm" disabled={forgotLoading}>
                  {forgotLoading ? "Wird gesendet ..." : "Link anfordern"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={(
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
          <Card className="w-full max-w-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Anmelden</CardTitle>
              <CardDescription>Bitte warten...</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Wir laden die nötigen Daten.
            </CardContent>
          </Card>
        </div>
      )}
    >
      <SignInContent />
    </Suspense>
  );
}
