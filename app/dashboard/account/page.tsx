import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { PasswordForm, ProfileForm } from "./forms";

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(date: Date | null | undefined) {
  return date ? DATE_FORMATTER.format(date) : "Nicht verfügbar";
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      passwordChangedAt: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const roleLabel = user.role === "ADMIN" ? "Administrator" : "Standard";
  const registrationLabel = formatDate(user.createdAt);
  const passwordLabel = formatDate(user.passwordChangedAt);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Konto
        </p>
        <h1 className="text-2xl font-semibold">Persönliche Daten verwalten</h1>
        <p className="text-sm text-muted-foreground">
          Aktualisiere deine Stammdaten, um Teammitgliedern und Workflows die richtigen Informationen zur Verfügung zu
          stellen.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-start">
        <div className="lg:self-start">
          <ProfileForm
            initialName={user.name ?? ""}
            initialUsername={user.username ?? ""}
            email={user.email}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-md border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Profilstatus</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Verwalte, wie dein Profil innerhalb des Dashboards dargestellt wird.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Rolle</dt>
                <dd className="text-sm font-medium">{roleLabel}</dd>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="text-sm font-medium text-success">Aktiv</dd>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Registriert am</dt>
                <dd className="text-sm font-medium">{registrationLabel}</dd>
              </div>
            </dl>
          </div>

          <PasswordForm lastChangedLabel={passwordLabel} />
        </div>
      </div>
    </div>
  );
}
