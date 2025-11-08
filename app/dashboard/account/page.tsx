import type { HTMLInputTypeAttribute } from "react";

import { auth } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Konto
        </p>
        <h2 className="text-3xl font-bold tracking-tight">Persönliche Daten verwalten</h2>
        <p className="max-w-2xl text-muted-foreground">
          Aktualisiere deine Stammdaten, um Teammitgliedern und automatisierten Workflows
          die richtigen Informationen zur Verfügung zu stellen.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <form className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="fullName"
              label="Vollständiger Name"
              defaultValue={user?.name ?? ""}
              placeholder="Vor- und Nachname"
            />
            <Field
              id="username"
              label="Benutzername"
              defaultValue={(user as any)?.username ?? ""}
              placeholder="z. B. max.mustermann"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="email"
              label="E-Mail-Adresse"
              type="email"
              defaultValue={user?.email ?? ""}
              placeholder="name@unternehmen.de"
            />
            <Field
              id="phone"
              label="Telefonnummer"
              type="tel"
              placeholder="+49 30 123456"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="role" label="Position" placeholder="z. B. Projektmanager" />
            <Field id="department" label="Team / Bereich" placeholder="Produkt & Strategie" />
          </div>
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Änderungen werden sofort für alle verbundenen Dienste übernommen.
            </p>
            <Button type="button">Änderungen speichern</Button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Profilstatus</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Verwalte die Sichtbarkeit deines Profils im Dashboard.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-emerald-500">Aktiv</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                <dt className="text-muted-foreground">Letzte Änderung</dt>
                <dd className="font-medium">
                  {new Date().toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Sicherheit</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Halte dein Passwort aktuell und sichere dein Konto mit modernen Methoden.
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-dashed px-4 py-3 text-sm">
                <p className="font-medium">Passwort zuletzt geändert</p>
                <p className="text-muted-foreground">Vor über 90 Tagen</p>
              </div>
              <Button type="button" variant="outline" className="w-full">
                Passwort aktualisieren
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
}

function Field({ id, label, defaultValue, placeholder, type = "text" }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11"
      />
    </div>
  );
}
