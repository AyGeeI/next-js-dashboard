"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Info, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string>;

const passwordRequirements = [
  "Mindestens 12 Zeichen",
  "Groß- und Kleinbuchstaben",
  "Mindestens eine Zahl",
  "Mindestens ein Sonderzeichen",
];

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

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const parsedErrors: FieldErrors = {};
          for (const issue of data.errors) {
            parsedErrors[issue.field] = issue.message;
          }
          setFieldErrors(parsedErrors);
        }
        setError(data.error || "Registrierung fehlgeschlagen.");
        return;
      }

      setSuccess(data.message || "Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse.");
      setPendingEmail(data.pendingEmail || email);
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) {
      return;
    }

    setResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "E-Mail konnte nicht erneut gesendet werden.");
        return;
      }

      setSuccess(data.message || "Wir haben dir eine neue E-Mail gesendet.");
    } catch (err) {
      setError("Versand fehlgeschlagen. Bitte versuche es später erneut.");
    } finally {
      setResending(false);
    }
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/30 px-4 py-12">
        <Card className="w-full max-w-lg border border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle>Registrieren</CardTitle>
            <CardDescription>Erstelle dein Konto in wenigen Schritten.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <NotificationBanner
                  variant="success"
                  title="Registrierung erfolgreich"
                  description={success}
                  action={
                    <div className="flex flex-col gap-2 text-right sm:flex-row sm:text-left">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendVerification}
                        disabled={resending || !pendingEmail}
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
                      <Button type="button" variant="link" asChild>
                        <Link href="/sign-in">Zur Anmeldung</Link>
                      </Button>
                    </div>
                  }
                >
                  {pendingEmail && <>Wir haben an {pendingEmail} gesendet.</>}
                </NotificationBanner>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Benutzername</Label>
                  <Input
                    id="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                  {fieldErrors.username && <p className="text-xs text-destructive">{fieldErrors.username}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="password" className="flex items-center gap-1">
                    Passwort
                    <Tooltip>
                      <TooltipTrigger type="button" className="rounded-full p-1 text-muted-foreground">
                        <Info className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Passwortanforderungen anzeigen</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <ul className="space-y-1 text-xs">
                          {passwordRequirements.map((req) => (
                            <li key={req}>• {req}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={12}
                    maxLength={72}
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
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Passwortstärke</span>
                    <span className={cn("font-medium", password ? passwordStrength.text : "text-muted-foreground")}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className={cn(
                          "h-1.5 rounded-full bg-muted transition-colors",
                          passwordStrength.score > index ? passwordStrength.bar : ""
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
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
                  <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {error && (
                <NotificationBanner
                  variant="error"
                  title="Registrierung fehlgeschlagen"
                  description={error}
                />
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird registriert..." : "Registrieren"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Bereits ein Konto?{" "}
                <Link href="/sign-in" className="text-primary hover:underline">
                  Anmelden
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
