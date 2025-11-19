/**
 * Auth Layout
 *
 * Layout für alle Authentication-Seiten
 *
 * Features:
 * - Konsistente Card-Größen
 * - Fade-in Animationen
 * - Background-Pattern (Gradient + Dots)
 * - Mobile-optimiert
 * - Skip-to-Content Link für Accessibility
 * - Centered Layout
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | vyrnix.net",
    default: "Authentifizierung",
  },
  description: "Anmelden oder registrieren bei vyrnix.net",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Zum Hauptinhalt springen
      </a>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-accent/30" />

        {/* Dot Pattern */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Gradient Orbs */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Content */}
      <main
        id="main-content"
        className="relative flex min-h-screen items-center justify-center px-4 py-12"
      >
        {/* Fade-in Animation */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
