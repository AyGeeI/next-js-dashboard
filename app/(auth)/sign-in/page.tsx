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
import { RefreshCw, Eye, EyeOff } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams?.get("registered")) {
      setInfo("Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const result = await loginAction(email, password);

      if (result.error) {
        setError(result.error);
        if (result.errorCode === "EMAIL_NOT_VERIFIED") {
          setInfo("Bitte bestätige deine E-Mail-Adresse, um dich anzumelden.");
          setPendingEmail(result.pendingEmail || email);
        }
      } else if (result.success) {
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");

        if (from) {
          router.push(from);
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = pendingEmail || email;

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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
      <Card className="w-full max-w-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>Melde dich mit deinen Zugangsdaten an.</CardDescription>
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
                    disabled={resending || (!pendingEmail && !email)}
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
                {(pendingEmail || email) && <>E-Mail: {pendingEmail || email}</>}
              </NotificationBanner>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
