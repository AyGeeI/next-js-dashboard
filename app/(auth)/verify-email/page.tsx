"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MailQuestion, RefreshCw } from "lucide-react";

type Status = "idle" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [message, setMessage] = useState(
    token ? "Wir pruefen deine Bestaetigung..." : "Kein Token gefunden. Bitte pruefe deine E-Mail-Bestaetigung."
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      setMessage("Wir pruefen deine Bestaetigung...");

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
          return;
        }

        setStatus("success");
        setMessage(data.message || "E-Mail erfolgreich bestaetigt.");
      } catch (err) {
        setStatus("error");
        setMessage("Verifizierung fehlgeschlagen. Bitte versuche es spaeter erneut.");
      }
    };

    verify();
  }, [token]);

  const renderIcon = () => {
    switch (status) {
      case "verifying":
        return <Loader2 className="h-10 w-10 animate-spin text-primary" />;
      case "success":
        return <CheckCircle2 className="h-10 w-10 text-emerald-500" />;
      case "error":
        return <MailQuestion className="h-10 w-10 text-amber-500" />;
      default:
        return <MailQuestion className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>E-Mail bestaetigen</CardTitle>
          <CardDescription>Wir muessen deine Adresse verifizieren, bevor du dich anmelden kannst.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            {renderIcon()}
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          <div className="flex flex-col gap-3">
            {status === "error" && (
              <Button variant="outline" onClick={() => router.push("/sign-in")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Neue E-Mail anfordern
              </Button>
            )}
            <Button onClick={() => router.push("/sign-in")}>Zur Anmeldung</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
