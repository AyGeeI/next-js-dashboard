"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AdminRole = "ADMIN" | "STANDARD";

export type AdminUser = {
  id: string;
  name: string | null;
  username: string;
  email: string;
  role: AdminRole;
  createdAt: string;
};

type EditableUserFields = {
  name: string;
  username: string;
  email: string;
  role: AdminRole;
};

type CreateUserFields = EditableUserFields & {
  password: string;
  confirmPassword: string;
};

type FieldErrors<T extends string> = Partial<Record<T, string>>;

type StatusMessage = {
  type: "success" | "error";
  title: string;
  description?: string;
};

type ApiIssue = {
  field?: string;
  message: string;
};

const ROLE_OPTIONS: Array<{ label: string; value: AdminRole }> = [
  { label: "Administrator", value: "ADMIN" },
  { label: "Standard", value: "STANDARD" },
];

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(isoDate: string) {
  return DATE_FORMATTER.format(new Date(isoDate));
}

function toEditableFields(user: AdminUser | null): EditableUserFields {
  return {
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "STANDARD",
  };
}

function createInitialCreateForm(): CreateUserFields {
  return {
    name: "",
    username: "",
    email: "",
    role: "STANDARD",
    password: "",
    confirmPassword: "",
  };
}

export interface UserManagementProps {
  initialUsers: AdminUser[];
}

export function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUsers[0]?.id ?? null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUser, users]);

  const [editForm, setEditForm] = useState<EditableUserFields>(toEditableFields(selectedUser));
  const [editBaseline, setEditBaseline] = useState<EditableUserFields>(toEditableFields(selectedUser));
  const [editErrors, setEditErrors] = useState<FieldErrors<keyof EditableUserFields>>({});
  const [editStatus, setEditStatus] = useState<StatusMessage | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState<CreateUserFields>(createInitialCreateForm());
  const [createErrors, setCreateErrors] = useState<FieldErrors<keyof CreateUserFields>>({});
  const [createStatus, setCreateStatus] = useState<StatusMessage | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  useEffect(() => {
    setEditForm(toEditableFields(selectedUser));
    setEditBaseline(toEditableFields(selectedUser));
    setEditErrors({});
    setEditStatus(null);
  }, [selectedUser]);

  const isEditDirty = Boolean(
    selectedUser &&
      (editForm.name !== editBaseline.name ||
        editForm.username !== editBaseline.username ||
        editForm.email !== editBaseline.email ||
        editForm.role !== editBaseline.role)
  );

  const handleEditChange =
    (field: keyof EditableUserFields) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleEditRoleChange = (value: string) => {
    setEditForm((prev) => ({
      ...prev,
      role: value as AdminRole,
    }));
  };

  const handleCreateChange =
    (field: keyof CreateUserFields) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setCreateForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleCreateRoleChange = (value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      role: value as AdminRole,
    }));
  };

  const handleEditReset = () => {
    setEditForm(editBaseline);
    setEditErrors({});
    setEditStatus(null);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser || editSubmitting) {
      return;
    }

    setEditSubmitting(true);
    setEditStatus(null);
    setEditErrors({});

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const issues = data.errors as ApiIssue[];
          setEditErrors(
            issues.reduce<FieldErrors<keyof EditableUserFields>>((acc, issue) => {
              if (issue.field && issue.message) {
                acc[issue.field as keyof EditableUserFields] = issue.message;
              }
              return acc;
            }, {})
          );
        }

        setEditStatus({
          type: "error",
          title: data.error ?? "Benutzer konnte nicht aktualisiert werden.",
          description: "Bitte prüfe die Angaben und versuche es erneut.",
        });
        return;
      }

      const updatedUser = data.user as AdminUser;
      setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      const nextFields = toEditableFields(updatedUser);
      setEditBaseline(nextFields);
      setEditForm(nextFields);
      setEditStatus({
        type: "success",
        title: data.message ?? "Benutzer aktualisiert.",
      });
    } catch (error) {
      console.error("User update failed", error);
      setEditStatus({
        type: "error",
        title: "Aktualisierung fehlgeschlagen.",
        description: "Bitte versuche es später erneut.",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createSubmitting) {
      return;
    }

    setCreateSubmitting(true);
    setCreateErrors({});
    setCreateStatus(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const issues = data.errors as ApiIssue[];
          setCreateErrors(
            issues.reduce<FieldErrors<keyof CreateUserFields>>((acc, issue) => {
              if (issue.field && issue.message) {
                acc[issue.field as keyof CreateUserFields] = issue.message;
              }
              return acc;
            }, {})
          );
        }

        setCreateStatus({
          type: "error",
          title: data.error ?? "Benutzer konnte nicht angelegt werden.",
          description: "Bitte korrigiere die Eingaben und versuche es erneut.",
        });
        return;
      }

      const createdUser = data.user as AdminUser;
      setUsers((prev) => [createdUser, ...prev]);
      setCreateForm(createInitialCreateForm());
      setCreateStatus({
        type: "success",
        title: data.message ?? "Benutzer erfolgreich angelegt.",
        description: "Teile die Zugangsdaten sicher mit dem neuen Mitglied.",
      });
      setSelectedUserId(createdUser.id);
    } catch (error) {
      console.error("Create user failed", error);
      setCreateStatus({
        type: "error",
        title: "Erstellung fehlgeschlagen.",
        description: "Bitte versuche es später erneut.",
      });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const userCount = users.length;
  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>Benutzerübersicht</CardTitle>
              <CardDescription>
                {userCount === 0
                  ? "Noch keine Benutzer angelegt."
                  : `${userCount} Konten · ${adminCount} Administrator${adminCount === 1 ? "" : "en"}`}
              </CardDescription>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatBox label="Gesamt" value={userCount} />
              <StatBox label="Administrator" value={adminCount} accent />
              <StatBox label="Standard" value={userCount - adminCount} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {userCount === 0 ? (
              <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 px-6 py-12 text-center">
                <p className="text-sm font-semibold text-muted-foreground">Noch keine Benutzer vorhanden.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lege rechts einen Benutzer an, um hier Details zu sehen.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Benutzername
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        E-Mail
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Rolle
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Erstellt am
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        Aktion
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className={cn(
                          "bg-background transition-colors hover:bg-primary/5",
                          selectedUserId === user.id && "bg-primary/5"
                        )}
                      >
                        <td className="px-4 py-3 font-semibold">{user.username}</td>
                        <td className="px-4 py-3">{user.name || "—"}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                              user.role === "ADMIN"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {user.role === "ADMIN" ? "Administrator" : "Standard"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant={selectedUserId === user.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            Bearbeiten
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle>Benutzerprofil bearbeiten</CardTitle>
              <CardDescription>Aktualisiere Kontaktdaten und Rollen in wenigen Sekunden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {editStatus ? (
                <NotificationBanner
                  variant={editStatus.type}
                  title={editStatus.title}
                  description={editStatus.description}
                />
              ) : null}
              {selectedUser ? (
                <form className="space-y-4" onSubmit={handleEditSubmit}>
                  <Field>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input id="edit-name" value={editForm.name} onChange={handleEditChange("name")} autoComplete="name" />
                    <HelperText>Optional, wird in Übersichten angezeigt.</HelperText>
                    {editErrors.name ? <ErrorText>{editErrors.name}</ErrorText> : null}
                  </Field>
                  <Field>
                    <Label htmlFor="edit-username">Benutzername</Label>
                    <Input
                      id="edit-username"
                      value={editForm.username}
                      onChange={handleEditChange("username")}
                      autoComplete="username"
                      required
                    />
                    {editErrors.username ? <ErrorText>{editErrors.username}</ErrorText> : null}
                  </Field>
                  <Field>
                    <Label htmlFor="edit-email">E-Mail-Adresse</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditChange("email")}
                      autoComplete="email"
                      required
                    />
                    {editErrors.email ? <ErrorText>{editErrors.email}</ErrorText> : null}
                  </Field>
                  <Field>
                    <Label htmlFor="edit-role">Rolle</Label>
                    <Select value={editForm.role} onValueChange={handleEditRoleChange}>
                      <SelectTrigger id="edit-role">
                        <SelectValue aria-label="Rolle wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editErrors.role ? <ErrorText>{editErrors.role}</ErrorText> : null}
                  </Field>
                  <div className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>Konto erstellt am {formatDate(selectedUser.createdAt)}</span>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" onClick={handleEditReset} disabled={!isEditDirty || editSubmitting}>
                        Zurücksetzen
                      </Button>
                      <Button type="submit" disabled={!isEditDirty || editSubmitting}>
                        {editSubmitting ? "Speichere..." : "Änderungen speichern"}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Wähle einen Benutzer aus der Liste, um Details zu bearbeiten.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle>Neuen Benutzer anlegen</CardTitle>
              <CardDescription>Alle Eingaben werden validiert, bevor das Konto aktiv wird.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {createStatus ? (
                <NotificationBanner
                  variant={createStatus.type}
                  title={createStatus.title}
                  description={createStatus.description}
                />
              ) : null}
              <form className="space-y-4" onSubmit={handleCreateSubmit}>
                <Field>
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={handleCreateChange("name")}
                    autoComplete="name"
                  />
                  <HelperText>Optional, kann jederzeit ergänzt werden.</HelperText>
                  {createErrors.name ? <ErrorText>{createErrors.name}</ErrorText> : null}
                </Field>
                <Field>
                  <Label htmlFor="create-username">Benutzername</Label>
                  <Input
                    id="create-username"
                    value={createForm.username}
                    onChange={handleCreateChange("username")}
                    autoComplete="username"
                    required
                  />
                  {createErrors.username ? <ErrorText>{createErrors.username}</ErrorText> : null}
                </Field>
                <Field>
                  <Label htmlFor="create-email">E-Mail-Adresse</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={handleCreateChange("email")}
                    autoComplete="email"
                    required
                  />
                  {createErrors.email ? <ErrorText>{createErrors.email}</ErrorText> : null}
                </Field>
                <Field>
                  <Label htmlFor="create-role">Rolle</Label>
                  <Select value={createForm.role} onValueChange={handleCreateRoleChange}>
                    <SelectTrigger id="create-role">
                      <SelectValue aria-label="Rolle wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createErrors.role ? <ErrorText>{createErrors.role}</ErrorText> : null}
                </Field>
                <Field>
                  <Label htmlFor="create-password">Passwort</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createForm.password}
                    onChange={handleCreateChange("password")}
                    autoComplete="new-password"
                    required
                    minLength={12}
                  />
                  <HelperText>Mindestens 12 Zeichen mit Groß-/Kleinbuchstaben, Ziffer und Sonderzeichen.</HelperText>
                  {createErrors.password ? <ErrorText>{createErrors.password}</ErrorText> : null}
                </Field>
                <Field>
                  <Label htmlFor="create-confirm">Passwort bestätigen</Label>
                  <Input
                    id="create-confirm"
                    type="password"
                    value={createForm.confirmPassword}
                    onChange={handleCreateChange("confirmPassword")}
                    autoComplete="new-password"
                    required
                  />
                  {createErrors.confirmPassword ? <ErrorText>{createErrors.confirmPassword}</ErrorText> : null}
                </Field>
                <div className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>Neue Benutzer können sich direkt anmelden und ihr Passwort später ändern.</span>
                  <Button type="submit" disabled={createSubmitting}>
                    {createSubmitting ? "Lege an..." : "Benutzer erstellen"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: number;
  accent?: boolean;
}

function StatBox({ label, value, accent }: StatBoxProps) {
  return (
    <div className="rounded-2xl border bg-muted/40 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold", accent && "text-primary")}>{value}</p>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

function ErrorText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-destructive">{children}</p>;
}
