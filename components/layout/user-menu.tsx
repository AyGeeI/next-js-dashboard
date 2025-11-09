"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type UserInfo = {
  name?: string | null;
  email?: string | null;
  username?: string | null;
  role?: "ADMIN" | "STANDARD" | null;
};

interface UserMenuProps {
  user?: UserInfo | null;
  logoutAction: (formData: FormData) => Promise<void>;
}

export function UserMenu({ user, logoutAction }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const initials = getInitials(user);
  const subtitle = user?.email ?? "Profil verwalten";
  const roleLabel = formatRole(user?.role);

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="text-sm font-semibold uppercase tracking-wide">{initials}</span>
        <span className="sr-only">{"Benutzermen\u00FC \u00F6ffnen"}</span>
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute top-12 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover text-sm shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-0 sm:w-72 sm:max-w-none sm:translate-x-0"
        >
          <div className="bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground">
                {initials}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold leading-tight">
                  {user?.name ?? "Angemeldeter Benutzer"}
                </p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="rounded-xl border border-dashed border-border bg-background px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rolle
              </p>
              <p className="text-sm font-semibold">{roleLabel}</p>
            </div>
          </div>

          <Separator className="bg-border/60" />

          <nav className="py-2">
            <MenuLink
              href="/dashboard/account"
              title="Konto"
              description={"Pers\u00F6nliche Daten & Sicherheit"}
              icon={UserRound}
              onNavigate={() => setIsOpen(false)}
            />
            <MenuLink
              href="/dashboard/settings"
              title="Einstellungen"
              description="Dashboard & Benachrichtigungen"
              icon={Settings}
              onNavigate={() => setIsOpen(false)}
            />
          </nav>

          <Separator className="bg-border/60" />

          <form
            action={logoutAction}
            className="px-2 py-2"
            onSubmit={() => setIsOpen(false)}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block">Abmelden</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Sitzung sicher beenden
                </span>
              </span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

interface MenuLinkProps {
  href: string;
  title: string;
  description: string;
  icon: typeof Settings;
  onNavigate: () => void;
}

function MenuLink({ href, title, description, icon: Icon, onNavigate }: MenuLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
      onClick={onNavigate}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-medium leading-tight">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
}

function getInitials(user?: UserInfo | null) {
  if (!user) return "DU";

  const source = user.name ?? user.username ?? user.email ?? "";
  if (!source) return "DU";

  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "DU";
}

function formatRole(role?: "ADMIN" | "STANDARD" | null) {
  if (role === "ADMIN") {
    return "Administrator";
  }
  return "Standard";
}


