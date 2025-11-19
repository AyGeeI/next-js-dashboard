"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Button } from "@/components/ui/button";
import { FormWrapper } from "@/components/common/form-wrapper";
import { FormField } from "@/components/common/form-field";
import { ValidatedInput } from "@/components/common/validated-input";
import { LoadingScreen } from "@/components/common/loading-screen";
import { toast } from "sonner";

// ============================================================================
// Validation Schema
// ============================================================================

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// Component
// ============================================================================

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Default values from search params
  const defaultIdentifier = searchParams?.get("identifier") || "";

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: data.identifier }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Deine Anfrage konnte nicht verarbeitet werden.");
        return;
      }

      setSuccess(result.message || "Falls ein Konto existiert, senden wir dir einen Link.");
      toast.success("E-Mail unterwegs");
    } catch (err) {
      console.error("[ForgotPassword] error:", err);
      setError("Unerwarteter Fehler. Bitte versuche es später erneut.");
    }
  };

  return (
    
      <Card className="w-full max-w-lg rounded-md border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Passwort vergessen</CardTitle>
          <CardDescription>
            Wir senden dir einen Link zum Zurücksetzen. Der Link ist 30 Minuten gültig.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormWrapper
            schema={forgotPasswordSchema}
            onSubmit={handleSubmit}
            defaultValues={{ identifier: defaultIdentifier }}
            enableBeforeUnload={false}
          >
            {({ register, formState: { errors, isSubmitting } }) => (
              <div className="space-y-4">
                {success && (
                  <NotificationBanner
                    variant="success"
                    title="E-Mail unterwegs"
                    description={success}
                  />
                )}

                <FormField
                  label="E-Mail oder Benutzername"
                  error={errors.identifier?.message}
                  required
                  helperText="Wir akzeptieren deine Login-E-Mail oder deinen eindeutigen Nutzernamen."
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

                {error && (
                  <NotificationBanner
                    variant="error"
                    title="Anfrage fehlgeschlagen"
                    description={error}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Wird gesendet..." : "Link anfordern"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Zurück zum Login?{" "}
                  <Link href="/sign-in" className="text-primary hover:underline">
                    Anmelden
                  </Link>
                </div>
              </>
            )}
          </FormWrapper>
        </CardContent>
    </Card>
  
  );
}

// ============================================================================
// Page with Suspense
// ============================================================================

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Formular wird vorbereitet..." />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
