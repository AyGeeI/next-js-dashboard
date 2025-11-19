/**
 * Verify Email Page
 *
 * E-Mail Verifizierung mit Token
 *
 * Features:
 * - Auto-Verifizierung beim Laden
 * - Status-Anzeige (verifying, success, error)
 * - LoadingScreen für Suspense
 * - Toast für Feedback
 * - Redirect nach Success
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MailQuestion, RefreshCw, AlertCircle } from "lucide-react";
import { LoadingScreen } from "@/components/common/loading-screen";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type Status = "idle" | "verifying" | "success" | "error";

// ============================================================================
// Component
// ============================================================================

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [message, setMessage] = useState(
    token ? "Wir prüfen deine Bestätigung..." : "Kein Token gefunden. Bitte prüfe deine E-Mail-Bestätigung."
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Kein Verifizierungs-Token gefunden.");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      setMessage("Wir prüfen deine Bestätigung...");

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Token konnte nicht verifiziert werden.");
          toast.error("Verifizierung fehlgeschlagen");
          return;
        }

        setStatus("success");
        setMessage(data.message || "E-Mail erfolgreich bestätigt.");
        toast.success("E-Mail bestätigt!");

        // Auto-Redirect nach 3 Sekunden
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage("Verifizierung fehlgeschlagen. Bitte versuche es später erneut.");
        toast.error("Verbindungsfehler");
      }
    };

    verify();
  }, [token, router]);

  const renderIcon = () => {
    switch (status) {
      case "verifying":
        return <LoadingSpinner size="lg" />;
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-success" />;
      case "error":
        return <AlertCircle className="h-16 w-16 text-destructive" />;
      default:
        return <MailQuestion className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-success/50 bg-success/5";
      case "error":
        return "border-destructive/50 bg-destructive/5";
      default:
        return "border-border/80 bg-card/95";
    }
  };

  return (
    <Card
      className={`w-full max-w-lg rounded-md border shadow-xl shadow-primary/5 backdrop-blur transition-colors ${getStatusColor()}`}
    >
      <CardHeader>
        <CardTitle>E-Mail bestätigen</CardTitle>
        <CardDescription>
          Wir müssen deine Adresse verifizieren, bevor du dich anmelden kannst.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Icon & Message */}
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          {renderIcon()}
          <p className="text-sm text-muted-foreground">{message}</p>
          {status === "success" && (
            <p className="text-xs text-muted-foreground">
              Du wirst in wenigen Sekunden weitergeleitet...
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {status === "error" && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/sign-up")}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Neue E-Mail anfordern
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Token abgelaufen? Fordere eine neue Bestätigungs-E-Mail an.
              </p>
            </>
          )}

          {status !== "verifying" && (
            <Button onClick={() => router.push("/sign-in")} variant={status === "error" ? "default" : "outline"}>
              Zur Anmeldung
            </Button>
          )}

          {status === "idle" && (
            <div className="text-center text-xs text-muted-foreground">
              <p>Hast du keine E-Mail erhalten?</p>
              <Link href="/sign-up" className="text-primary hover:underline">
                Erneut registrieren
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Page with Suspense
// ============================================================================

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingScreen message="E-Mail-Bestätigung wird geladen..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
