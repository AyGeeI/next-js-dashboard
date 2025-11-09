"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Button } from "@/components/ui/button";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const preset = searchParams?.get("identifier");
    if (preset) {
      setIdentifier(preset);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!identifier.trim()) {
      setFieldError("Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein.");
      return;
    }

    setFieldError("");
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors) && data.errors[0]?.message) {
          setFieldError(data.errors[0].message);
        }
        setStatus({
          type: "error",
          message: data.error || "Deine Anfrage konnte nicht verarbeitet werden.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "Falls ein Konto existiert, senden wir dir einen Link.",
      });
    } catch (error) {
      console.error("[ForgotPassword] error:", error);
      setStatus({
        type: "error",
        message: "Unerwarteter Fehler. Bitte versuche es später erneut.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
      <Card className="w-full max-w-lg border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Passwort vergessen</CardTitle>
          <CardDescription>
            Wir senden dir einen Link zum Zurücksetzen. Der Link ist 30 Minuten gültig.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="identifier">E-Mail oder Benutzername</Label>
                <p className="text-xs text-muted-foreground">
                  Wir akzeptieren deine Login-E-Mail oder deinen eindeutigen Nutzernamen.
                </p>
              </div>
              <Input
                id="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                disabled={loading}
                required
              />
              {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
            </div>
            {status && (
              <NotificationBanner
                variant={status.type === "success" ? "success" : "error"}
                title={status.type === "success" ? "E-Mail unterwegs" : "Anfrage fehlgeschlagen"}
                description={status.message}
              />
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird gesendet ..." : "Link anfordern"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Zurück zum Login?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Anmelden
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={(
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
          <Card className="w-full max-w-lg border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Passwort vergessen</CardTitle>
              <CardDescription>Bitte warten...</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Wir bereiten das Formular vor.
            </CardContent>
          </Card>
        </div>
      )}
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
