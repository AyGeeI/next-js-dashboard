import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const notificationSettings = [
  {
    id: "weekly-report",
    title: "Wöchentlicher Report",
    description: "Zusammenfassung der wichtigsten Kennzahlen als E-Mail.",
    defaultEnabled: true,
  },
  {
    id: "alerts",
    title: "Echtzeit-Benachrichtigungen",
    description: "Bei kritischen Ereignissen sofort informiert werden.",
    defaultEnabled: true,
  },
  {
    id: "reminders",
    title: "Aufgaben-Erinnerungen",
    description: "Geplante Aufgaben regelmäßig bestätigen lassen.",
    defaultEnabled: false,
  },
];

const dashboardPreferences = [
  {
    id: "compact-cards",
    title: "Kompakte Karten",
    description: "Mehr Inhalte auf einen Blick durch geringere Abstände.",
    defaultEnabled: false,
  },
  {
    id: "auto-theme",
    title: "Automatisches Theme",
    description: "Passt das Design automatisch an die System-Einstellungen an.",
    defaultEnabled: true,
  },
  {
    id: "animations",
    title: "Animationen",
    description: "Weiche Übergänge für Diagramme und Widgets aktivieren.",
    defaultEnabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Einstellungen</p>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard & Kommunikation steuern</h2>
        <p className="max-w-2xl text-muted-foreground">
          Lege fest, wie dein Dashboard aussehen soll und welche Informationen dich erreichen.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Passe Layout und Darstellung deiner Widgets individuell an.
            </p>
          </div>
          <div className="space-y-4">
            {dashboardPreferences.map((item) => (
              <PreferenceToggle key={item.id} {...item} />
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">Benachrichtigungen</h3>
            <p className="text-sm text-muted-foreground">
              Entscheide, wann dich das Dashboard informiert.
            </p>
          </div>
          <div className="space-y-4">
            {notificationSettings.map((item) => (
              <PreferenceToggle key={item.id} {...item} />
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Allgemeines</h3>
          <p className="text-sm text-muted-foreground">
            Weitere Optionen für Sprache, Datenfreigabe und Integrationen.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SelectField
            id="language"
            label="Sprache"
            defaultValue="de"
            options={[
              { label: "Deutsch", value: "de" },
              { label: "Englisch", value: "en" },
              { label: "Französisch", value: "fr" },
            ]}
          />
          <SelectField
            id="data-retention"
            label="Datenaufbewahrung"
            defaultValue="12"
            options={[
              { label: "3 Monate", value: "3" },
              { label: "6 Monate", value: "6" },
              { label: "12 Monate", value: "12" },
              { label: "24 Monate", value: "24" },
            ]}
          />
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Einstellungen werden lokal gespeichert und können jederzeit geändert werden.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline">
              Zurücksetzen
            </Button>
            <Button type="button">Einstellungen speichern</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface PreferenceToggleProps {
  id: string;
  title: string;
  description: string;
  defaultEnabled: boolean;
}

function PreferenceToggle({ id, title, description, defaultEnabled }: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3">
      <div>
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultEnabled} />
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  defaultValue: string;
  options: Array<{ label: string; value: string }>;
}

function SelectField({ id, label, defaultValue, options }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        defaultValue={defaultValue}
        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
