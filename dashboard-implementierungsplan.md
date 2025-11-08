# Implementierungsplan: Next.js + React + shadcn/ui Dashboard (ohne AI, mit Dummy-Daten)

Dieser Plan beschreibt eine moderne, saubere Webapp mit **Next.js (App Router)**, **React**, **shadcn/ui**, **Tailwind CSS** und **Auth.js** (Anmeldung/Registrierung über Credentials). Nach Login/Registrierung landen Nutzer:innen im **Dashboard** mit **Sidebar** (z. B. Wetter, Finanzen, Kalender …) und einem **Dark/Light-Theme**. Alle Widgets/Sections starten **ausschließlich mit Dummy-Daten**. Lokales Testing ist vorgesehen, Deployment erfolgt über **GitHub → Vercel**.

---

## 1) Ziele & Leitplanken

- Saubere, wartbare Architektur (App Router, Server/Client Components).
- Einfache **Auth (Credentials)** mit **Prisma + Postgres**.
- **Dashboard-Shell**: Sidebar-Navigation + Header, responsives Grid für Widgets.
- **Theming**: Dark/Light über `next-themes`, **Neon-Türkis** als Akzent.
- **Keine echten Datenquellen**: Alle Sektionen/Widgets verwenden **Mock/Dummy-Daten**.
- **CI/CD**: GitHub-Repo → Vercel mit Preview-Deployments; Envs streng getrennt.

---

## 2) Architektur & Tech-Stack (ohne AI)

- **Framework**: Next.js (App Router), TypeScript, ESLint.
- **UI**: React, **shadcn/ui** (+ Radix), **Tailwind CSS**, **lucide-react** (Icons), **next-themes**.
- **Auth**: **Auth.js (NextAuth v5)** mit **Prisma Adapter** und **Credentials-Login** (E-Mail/Passwort, `bcrypt`).
- **DB/ORM**: **PostgreSQL** + **Prisma** (lokal & Produktion).
- **Testing** (optional ab Sprint 2): Playwright (E2E), RTL/Vitest (Unit).

---

## 3) Projektstruktur (App Router)

```txt
app/
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
  dashboard/
    layout.tsx        # Sidebar + Header + ThemeToggle
    page.tsx          # Übersicht: Dummy-Widgets (Cards)
    wetter/page.tsx   # Dummy-Section-Beispiel
    finanzen/page.tsx # Dummy-Section-Beispiel
    kalender/page.tsx # Dummy-Section-Beispiel
  api/
    echo/route.ts     # Beispiel-Route: Dummy-JSON
components/
  layout/
    sidebar.tsx
    header.tsx
    theme-toggle.tsx
  widgets/
    card-metric.tsx
    chart-mini.tsx    # einfacher, lib-freier Mini-Chart; reine Dummies
  ui/                 # shadcn generierte Komponenten
lib/
  auth/               # Auth.js-Konfiguration (adapter, handlers)
  prisma/             # Prisma client
  mocks.ts            # zentrale Dummy-Daten
styles/
  globals.css
  tailwind.css
middleware.ts         # Route-Guard für /dashboard/*
prisma/
  schema.prisma
.env.example
```

**Hinweis:** Die API-Route `app/api/echo/route.ts` liefert nur Dummy-JSON, um Fetch-Flows zu testen.

---

## 4) Setup & Installation (lokal)

```bash
# Projekt erzeugen
pnpm create next-app@latest ai-dashboard --ts --eslint --tailwind
cd ai-dashboard

# UI/Theme
pnpm add next-themes lucide-react

# shadcn/ui initialisieren und Kern-Komponenten hinzufügen
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button card navigation-menu separator switch

# Auth + DB
pnpm add next-auth @auth/prisma-adapter bcrypt
pnpm add @prisma/client
pnpm add -D prisma

# (optional) Tests
pnpm add -D @playwright/test @testing-library/react vitest
```

---

## 5) Styling & Theme (Dark/Light + Neon‑Türkis)

- **ThemeProvider** (Client) im `app/layout.tsx` einbinden (`next-themes`).
- **Neon‑Türkis** als Akzent (`--primary`) in `styles/globals.css` pflegen.
- **shadcn/ui** nutzt HSL/OKLCH Tokens; aktive Elemente mit `text-primary` / `bg-primary` hervorheben.

```tsx
// app/layout.tsx (Ausschnitt)
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```css
/* styles/globals.css: Neon‑Türkis als Akzent */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 174 95% 45%;       /* Neon-Türkis (Light) */
  --primary-foreground: 0 0% 100%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 174 90% 52%;       /* Neon-Türkis (Dark) */
  --primary-foreground: 224 71% 4%;
}
```

---

## 6) Authentifizierung (Credentials) & Schutz

1. **Prisma initialisieren**
   ```bash
   npx prisma init
   ```
   - `DATABASE_URL` in `.env.local` setzen.

2. **Prisma Schema (vereinfacht)**
   ```prisma
   model User {
     id            String   @id @default(cuid())
     email         String   @unique
     name          String?
     passwordHash  String
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt
     @@map("users")
   }
   ```

3. **Auth.js einbinden**
   - Credentials-Provider: Registrierung schreibt `passwordHash` via `bcrypt`, Login verifiziert.
   - **Route-Guard** (`middleware.ts`): schützt `/dashboard/*` und leitet nicht eingeloggte Nutzer:innen auf `/sign-in` um.

---

## 7) Dashboard-Shell & Navigation

- **Sidebar**: statische Menüpunkte (Wetter, Finanzen, Kalender, …); aktive Route mit Akzentfarbe.
- **Header**: App-Titel, Theme-Toggle, User-Menü (Avatar/Sign-out).
- **Grid**: `app/dashboard/page.tsx` rendert **Cards** mit Dummy-Werten (aus `lib/mocks.ts`).

```tsx
// components/widgets/card-metric.tsx
import { Card } from "@/components/ui/card";

export function CardMetric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-primary">{value}</div>
    </Card>
  );
}
```

```tsx
// app/dashboard/page.tsx
import { CardMetric } from "@/components/widgets/card-metric";

const MOCK = [
  { title: "Heute", value: "Alles läuft 🎯" },
  { title: "Beispiel-Wert", value: 1234 },
  { title: "Nächster Termin", value: "Dummy 10:30" },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MOCK.map((m, i) => <CardMetric key={i} title={m.title} value={m.value} />)}
    </div>
  );
}
```

---

## 8) Dummy-Daten & API‑Platzhalter

- Zentralisierte **Mock-Daten** in `lib/mocks.ts` (Exports für jede Section).
- Beispiel-API (`app/api/echo/route.ts`) zum Testen des Fetch-Flows:
  ```ts
  export async function GET() {
    return Response.json({ ok: true, data: [{ id: 1, title: "Hallo Dashboard", value: 42 }] });
  }
  ```
- Später lassen sich die Dummies schrittweise durch echte Integrationen ersetzen (z. B. per Route Handlers).

---

## 9) Umgebungen & Secrets

- **.env.local** (nur lokal, nicht committen) enthält `DATABASE_URL`, `AUTH_SECRET`.
- In **Vercel** pro Umgebung (`Development`, `Preview`, `Production`) dieselben Keys pflegen.
- `NEXT_PUBLIC_*` nur für Werte, die der Browser wirklich braucht (hier zunächst keine).

**Beispiel `.env.example`:**
```bash
# Datenbank (Postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/ai_dashboard"

# Auth.js
AUTH_SECRET="generate_a_strong_secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 10) Deployment (GitHub → Vercel)

1. Repo auf GitHub pushen.
2. In **Vercel**: „Import Project“ → GitHub-Repo wählen → Deploy.
3. **Preview Deployments** für Branches/PRs automatisch.
4. **Environment Variables** in Vercel pflegen (alle drei Umgebungen).
5. **Prisma**: Migrations via `prisma migrate deploy` während des Builds oder nach dem ersten Deploy ausführen.

---

## 11) Tests & Qualität (optional, ab Sprint 2)

- **E2E**: Playwright—Smoke-Suite (Sign-up/Sign-in, Redirect-Schutz, Dashboard-Rendering).
- **Unit**: RTL/Vitest—Sidebar/Widgets rendern mit Dummies.
- **ESLint/TypeScript**: Standard-Checks in CI.

---

## 12) Milestones (inkrementell, Dummy-first)

1) **Scaffold & UI**: Next.js + Tailwind + shadcn, Theme (Neon‑Türkis), Sidebar/Header/Toggle.  
2) **Auth**: Prisma + Auth.js (Credentials), `middleware.ts`-Guard.  
3) **Dashboard & Dummies**: Sections & Cards, `lib/mocks.ts`, `/api/echo`.  
4) **Deploy**: GitHub → Vercel, Envs & Prisma-Migrationen.  
5) **(Optional)** Tests & Hardening.

---

## 13) Nützliche Scripts

```jsonc
// package.json (Auszug)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

---

### Fertig. 
Mit diesem Plan hast du eine sofort lauffähige Grundlage (Dummy‑Daten), klare Projektstruktur, Theme mit Neon‑Türkis, Auth via Credentials und ein Deployment‑Setup über GitHub → Vercel. 
