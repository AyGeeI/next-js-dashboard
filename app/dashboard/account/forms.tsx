"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileFieldErrors = Partial<Record<"name" | "username", string>>;
type PasswordFieldErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;
type ApiIssue = {
  field?: string;
  message: string;
};

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
          const errors = data.errors.reduce<ProfileFieldErrors>((acc, issue: ApiIssue) => {
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
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
          <Label htmlFor="username">Benutzername</Label>
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
          <p className="text-xs text-muted-foreground">
            Benutzername muss eindeutig sein und kann nur Buchstaben, Zahlen sowie . _ - enthalten.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input
          id="email"
          type="email"
          value={email}
          readOnly
          disabled
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">E-Mail-Adressen können aus Sicherheitsgründen nicht geändert werden.</p>
      </div>

      {status && (
        <div
          className={`rounded-md border px-4 py-2 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-destructive/50 bg-destructive/10 text-destructive"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Änderungen werden sofort gespeichert und gelten für alle verbundenen Dienste.
        </p>
        <Button type="submit" disabled={submitting || !isDirty}>
          {submitting ? "Speichere ..." : "Änderungen speichern"}
        </Button>
      </div>
    </form>
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
          const errors = data.errors.reduce<PasswordFieldErrors>((acc, issue: ApiIssue) => {
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
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Aktuelles Passwort"
              autoComplete="current-password"
              minLength={12}
              disabled={submitting}
              className="h-11"
            />
            {fieldErrors.currentPassword && (
              <p className="text-sm text-destructive">{fieldErrors.currentPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Neues Passwort</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Neues Passwort"
              autoComplete="new-password"
              minLength={12}
              disabled={submitting}
              className="h-11"
            />
            {fieldErrors.newPassword && (
              <p className="text-sm text-destructive">{fieldErrors.newPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Neues Passwort bestätigen"
              autoComplete="new-password"
              minLength={12}
              disabled={submitting}
              className="h-11"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {status && (
          <div
            className={`rounded-md border px-4 py-2 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-destructive/50 bg-destructive/10 text-destructive"
            }`}
          >
            {status.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={submitting || !canSubmit}>
          {submitting ? "Aktualisiere ..." : "Passwort aktualisieren"}
        </Button>
      </div>
    </form>
  );
}
