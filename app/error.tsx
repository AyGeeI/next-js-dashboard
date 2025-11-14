"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (z.B. Sentry)
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Ein Fehler ist aufgetreten
          </h1>
          <p className="text-muted-foreground">
            Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Fehler-ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="default">
            Erneut versuchen
          </Button>
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
          >
            Zum Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
