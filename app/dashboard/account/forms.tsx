"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileFieldErrors = Partial<Record<"name" | "username", string>>;
type PasswordFieldErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;
type ApiIssue = {
  field?: string;
  message: string;
};

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

interface StatusMessage {
  type: "success" | "error";
  message: string;
}

interface ProfileFormProps {
  initialName: string;
  initialUsername: string;
  email: string;
}

export function ProfileForm({ initialName, initialUsername, email }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [savedValues, setSavedValues] = useState({ name: initialName, username: initialUsername });
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isDirty = name !== savedValues.name || username !== savedValues.username;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const issues = data.errors as ApiIssue[];
          const errors = issues.reduce<ProfileFieldErrors>((acc, issue) => {
            if (issue?.field) {
              acc[issue.field as keyof ProfileFieldErrors] = issue.message;
            }
            return acc;
          }, {});
          setFieldErrors(errors);
        }

        setStatus({
          type: "error",
          message: data.error || "Profil konnte nicht aktualisiert werden.",
        });
        return;
      }

      const updatedName = data.user?.name ?? "";
      const updatedUsername = data.user?.username ?? "";

      setName(updatedName);
      setUsername(updatedUsername);
      setSavedValues({ name: updatedName, username: updatedUsername });

      setStatus({
        type: "success",
        message: data.message || "Profil wurde aktualisiert.",
      });

      router.refresh();
    } catch {
      setStatus({
        type: "error",
        message: "Aktualisierung fehlgeschlagen. Bitte versuche es später erneut.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={120}>
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Vollständiger Name</Label>
              <Input
                id="fullName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Vor- und Nachname"
                autoComplete="name"
                disabled={submitting}
                className="h-11"
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="username">Benutzername</Label>
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                    aria-label="Hinweise zum Benutzernamen anzeigen"
                  >
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p className="max-w-[220px] text-xs">
                      Benutzername muss eindeutig sein und kann nur Buchstaben, Zahlen sowie . _ - enthalten.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="z. B. max.mustermann"
                autoComplete="username"
                disabled={submitting}
                className="h-11"
              />
              {fieldErrors.username && <p className="text-sm text-destructive">{fieldErrors.username}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input id="email" type="email" value={email} readOnly disabled className="h-11" />
            <p className="text-xs text-muted-foreground">
              E-Mail-Adressen können aus Sicherheitsgründen nicht geändert werden.
            </p>
          </div>

          {status && (
            <NotificationBanner
              variant={status.type === "success" ? "success" : "error"}
              title={status.type === "success" ? "Profil aktualisiert" : "Profil konnte nicht aktualisiert werden"}
              description={status.message}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Änderungen werden sofort gespeichert und gelten für alle verbundenen Dienste.
          </p>
          <Button type="submit" disabled={submitting || !isDirty}>
            {submitting ? "Speichere ..." : "Änderungen speichern"}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}

interface PasswordFormProps {
  lastChangedLabel: string;
}

export function PasswordForm({ lastChangedLabel }: PasswordFormProps) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<PasswordFieldErrors>({});
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const issues = data.errors as ApiIssue[];
          const errors = issues.reduce<PasswordFieldErrors>((acc, issue) => {
            if (issue?.field) {
              acc[issue.field as keyof PasswordFieldErrors] = issue.message;
            }
            return acc;
          }, {});
          setFieldErrors(errors);
        }

        setStatus({
          type: "error",
          message: data.error || "Passwort konnte nicht geändert werden.",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setStatus({
        type: "success",
        message: data.message || "Passwort wurde aktualisiert.",
      });

      router.refresh();
    } catch {
      setStatus({
        type: "error",
        message: "Passwort konnte nicht geändert werden. Bitte versuche es später erneut.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;

  return (
    <TooltipProvider delayDuration={120}>
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Sicherheit</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Aktualisiere dein Passwort regelmäßig. Es muss dieselben Anforderungen wie bei der Registrierung erfüllen.
        </p>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-dashed px-4 py-3 text-sm">
            <p className="font-medium">Passwort zuletzt geändert</p>
            <p className="text-muted-foreground">{lastChangedLabel}</p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Aktuelles Passwort"
                  autoComplete="current-password"
                  minLength={12}
                  disabled={submitting}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={showCurrentPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  aria-pressed={showCurrentPassword}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.currentPassword && (
                <p className="text-sm text-destructive">{fieldErrors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                    aria-label="Passwortanforderungen anzeigen"
                  >
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <ul className="space-y-1 text-xs">
                      {passwordRequirements.map((req) => (
                        <li key={req}>{req}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Neues Passwort"
                  autoComplete="new-password"
                  minLength={12}
                  disabled={submitting}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  aria-pressed={showNewPassword}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.newPassword && <p className="text-sm text-destructive">{fieldErrors.newPassword}</p>}

              <div className="space-y-1 rounded-lg border border-dashed px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Passwortstärke</span>
                  <span className={cn("font-medium", newPassword ? passwordStrength.text : "text-muted-foreground")}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={`strength-${index}`}
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
              <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Neues Passwort bestätigen"
                  autoComplete="new-password"
                  minLength={12}
                  disabled={submitting}
                  className="h-11 pr-10"
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
          </div>

          {status && (
            <NotificationBanner
              variant={status.type === "success" ? "success" : "error"}
              title={status.type === "success" ? "Passwort aktualisiert" : "Passwort konnte nicht aktualisiert werden"}
              description={status.message}
            />
          )}

          <Button type="submit" className="w-full" disabled={submitting || !canSubmit}>
            {submitting ? "Aktualisiere ..." : "Passwort aktualisieren"}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
