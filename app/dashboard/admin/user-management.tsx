"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

type EditableUserFieldsWithPassword = EditableUserFields & {
  changePassword: boolean;
  password: string;
  confirmPassword: string;
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

function toEditableFields(user: AdminUser | null): EditableUserFieldsWithPassword {
  return {
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "STANDARD",
    changePassword: false,
    password: "",
    confirmPassword: "",
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

  // Create Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserFields>(createInitialCreateForm());
  const [createErrors, setCreateErrors] = useState<FieldErrors<keyof CreateUserFields>>({});
  const [createStatus, setCreateStatus] = useState<StatusMessage | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditableUserFieldsWithPassword>(toEditableFields(null));
  const [editBaseline, setEditBaseline] = useState<EditableUserFieldsWithPassword>(toEditableFields(null));
  const [editErrors, setEditErrors] = useState<FieldErrors<keyof EditableUserFieldsWithPassword>>({});
  const [editStatus, setEditStatus] = useState<StatusMessage | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const isEditDirty = Boolean(
    editingUser &&
      (editForm.name !== editBaseline.name ||
        editForm.username !== editBaseline.username ||
        editForm.email !== editBaseline.email ||
        editForm.role !== editBaseline.role ||
        editForm.changePassword)
  );

  // Create handlers
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

      // Close dialog after short delay
      setTimeout(() => {
        setCreateDialogOpen(false);
        setCreateStatus(null);
      }, 2000);
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

  // Edit handlers
  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    const fields = toEditableFields(user);
    setEditForm(fields);
    setEditBaseline(fields);
    setEditErrors({});
    setEditStatus(null);
    setEditDialogOpen(true);
  };

  const handleEditChange =
    (field: keyof EditableUserFieldsWithPassword) => (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleEditPasswordToggle = (checked: boolean) => {
    setEditForm((prev) => ({
      ...prev,
      changePassword: checked,
      password: "",
      confirmPassword: "",
    }));
    // Clear password errors when toggling
    setEditErrors((prev) => {
      const { password, confirmPassword, ...rest } = prev;
      return rest;
    });
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingUser || editSubmitting) {
      return;
    }

    setEditSubmitting(true);
    setEditStatus(null);
    setEditErrors({});

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
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
            issues.reduce<FieldErrors<keyof EditableUserFieldsWithPassword>>((acc, issue) => {
              if (issue.field && issue.message) {
                acc[issue.field as keyof EditableUserFieldsWithPassword] = issue.message;
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
      setEditStatus({
        type: "success",
        title: data.message ?? "Benutzer aktualisiert.",
      });

      // Close dialog after short delay
      setTimeout(() => {
        setEditDialogOpen(false);
        setEditStatus(null);
      }, 1500);
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

  // Delete handlers
  const openDeleteDialog = (user: AdminUser) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser || deleteSubmitting) {
      return;
    }

    setDeleteSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Benutzer konnte nicht gelöscht werden.");
        return;
      }

      setUsers((prev) => prev.filter((user) => user.id !== deletingUser.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("User delete failed", error);
      alert("Löschen fehlgeschlagen. Bitte versuche es später erneut.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const userCount = users.length;
  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Benutzerübersicht</CardTitle>
              <CardDescription>
                {userCount === 0
                  ? "Noch keine Benutzer angelegt."
                  : `${userCount} Konten · ${adminCount} Administrator${adminCount === 1 ? "" : "en"}`}
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Neuer Benutzer</span>
            </Button>
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
                Klicke oben auf &quot;Neuer Benutzer&quot;, um einen Benutzer anzulegen.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto rounded-2xl border md:block">
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
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users.map((user) => (
                      <tr key={user.id} className="bg-background transition-colors hover:bg-primary/5">
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              aria-label={`${user.username} bearbeiten`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              aria-label={`${user.username} löschen`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {users.map((user) => (
                  <Card key={user.id} className="rounded-2xl shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="font-semibold">{user.username}</p>
                            {user.name && <p className="text-sm text-muted-foreground">{user.name}</p>}
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                              user.role === "ADMIN"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {user.role === "ADMIN" ? "Admin" : "Standard"}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">Erstellt am {formatDate(user.createdAt)}</p>
                        </div>
                        <div className="flex gap-2 border-t pt-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="flex-1 gap-2"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Bearbeiten
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="flex-1 gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Löschen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
            <DialogDescription>
              Alle Eingaben werden validiert, bevor das Konto aktiv wird.
            </DialogDescription>
          </DialogHeader>
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
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createSubmitting}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={createSubmitting}>
                {createSubmitting ? "Lege an..." : "Benutzer erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Benutzerprofil bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisiere Kontaktdaten, Rollen und optional das Passwort.
            </DialogDescription>
          </DialogHeader>
          {editStatus ? (
            <NotificationBanner
              variant={editStatus.type}
              title={editStatus.title}
              description={editStatus.description}
            />
          ) : null}
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

            {/* Password Change Section */}
            <div className="space-y-4 rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="change-password-toggle" className="cursor-pointer">
                    Passwort ändern
                  </Label>
                  <HelperText>Aktiviere diese Option, um ein neues Passwort zu setzen.</HelperText>
                </div>
                <input
                  id="change-password-toggle"
                  type="checkbox"
                  checked={editForm.changePassword}
                  onChange={(e) => handleEditPasswordToggle(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
              </div>

              {editForm.changePassword && (
                <div className="space-y-4 border-t pt-4">
                  <Field>
                    <Label htmlFor="edit-password">Neues Passwort</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={editForm.password}
                      onChange={handleEditChange("password")}
                      autoComplete="new-password"
                      minLength={12}
                    />
                    <HelperText>Mindestens 12 Zeichen mit Groß-/Kleinbuchstaben, Ziffer und Sonderzeichen.</HelperText>
                    {editErrors.password ? <ErrorText>{editErrors.password}</ErrorText> : null}
                  </Field>
                  <Field>
                    <Label htmlFor="edit-confirm">Passwort bestätigen</Label>
                    <Input
                      id="edit-confirm"
                      type="password"
                      value={editForm.confirmPassword}
                      onChange={handleEditChange("confirmPassword")}
                      autoComplete="new-password"
                    />
                    {editErrors.confirmPassword ? <ErrorText>{editErrors.confirmPassword}</ErrorText> : null}
                  </Field>
                </div>
              )}
            </div>

            {editingUser && (
              <p className="text-xs text-muted-foreground">
                Konto erstellt am {formatDate(editingUser.createdAt)}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={editSubmitting}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={!isEditDirty || editSubmitting}>
                {editSubmitting ? "Speichere..." : "Änderungen speichern"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Benutzer <strong>{deletingUser?.username}</strong> ({deletingUser?.email}) wirklich
              löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmitting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSubmitting ? "Lösche..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
