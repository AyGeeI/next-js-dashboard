"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Fehler beim Laden</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Diese Seite konnte nicht geladen werden. Dies könnte an einem temporären Problem liegen.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} variant="default" className="flex-1">
              Seite neu laden
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
              className="flex-1"
            >
              Zur Startseite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
