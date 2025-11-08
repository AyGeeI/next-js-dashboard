# Next.js Dashboard

Ein modernes Dashboard mit Next.js, React, shadcn/ui, Tailwind CSS und Auth.js. Dieses Projekt folgt dem [Implementierungsplan](./dashboard-implementierungsplan.md) und verwendet Dummy-Daten für alle Widgets.

## Features

- **Authentifizierung**: Credentials-basierte Anmeldung mit Auth.js (NextAuth v5)
- **Dashboard-Shell**: Responsive Sidebar-Navigation und Header
- **Dark/Light Mode**: Theme-Toggle mit Neon-Türkis als Akzentfarbe
- **Widgets**: Wetter, Finanzen, Kalender mit Dummy-Daten
- **TypeScript**: Vollständige Type-Safety
- **Tailwind CSS**: Utility-First CSS Framework
- **shadcn/ui**: Hochwertige, anpassbare UI-Komponenten

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, shadcn/ui, Tailwind CSS, lucide-react
- **Authentifizierung**: Auth.js (NextAuth v5) mit Credentials Provider
- **Datenbank**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS mit next-themes

## Erste Schritte

### Voraussetzungen

- Node.js 18+ installiert
- PostgreSQL-Datenbank (lokal oder remote)

### Installation

1. **Dependencies installieren**

```bash
npm install
```

2. **Umgebungsvariablen konfigurieren**

Kopieren Sie `.env.example` nach `.env.local` und passen Sie die Werte an:

```bash
cp .env.example .env.local
```

Wichtige Variablen:
- `DATABASE_URL`: Ihre PostgreSQL-Verbindungszeichenfolge
- `AUTH_SECRET`: Generieren Sie ein Secret mit `openssl rand -base64 32`
- `NEXTAUTH_URL`: Ihre App-URL (lokal: `http://localhost:3000`)

3. **Datenbank initialisieren**

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. **Entwicklungsserver starten**

```bash
npm run dev
```

Die App läuft nun auf [http://localhost:3000](http://localhost:3000)

## Projekt-Struktur

```
├── app/
│   ├── (auth)/
│   │   ├── sign-in/          # Login-Seite
│   │   └── sign-up/          # Registrierungs-Seite
│   ├── dashboard/
│   │   ├── layout.tsx        # Dashboard-Layout mit Sidebar
│   │   ├── page.tsx          # Dashboard-Übersicht
│   │   ├── wetter/           # Wetter-Widget
│   │   ├── finanzen/         # Finanz-Widget
│   │   └── kalender/         # Kalender-Widget
│   └── api/
│       ├── auth/             # Auth.js Routes
│       └── echo/             # Beispiel-API-Route
├── components/
│   ├── layout/               # Sidebar, Header, ThemeToggle
│   ├── widgets/              # CardMetric, ChartMini
│   └── ui/                   # shadcn/ui Komponenten
├── lib/
│   ├── auth/                 # Auth.js-Konfiguration
│   ├── prisma.ts             # Prisma Client
│   ├── mocks.ts              # Dummy-Daten
│   └── utils.ts              # Utility-Funktionen
├── prisma/
│   └── schema.prisma         # Datenbankschema
└── styles/
    └── globals.css           # Globale Styles mit Theme
```

## Verfügbare Scripts

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Produktions-Build erstellen
- `npm run start` - Produktionsserver starten
- `npm run lint` - ESLint ausführen
- `npm run prisma:studio` - Prisma Studio öffnen
- `npm run prisma:migrate` - Datenbank-Migration erstellen und ausführen
- `npm run prisma:generate` - Prisma Client generieren

## Verwendung

### Registrierung

1. Navigieren Sie zu `/sign-up`
2. Erstellen Sie ein Konto mit E-Mail und Passwort
3. Nach erfolgreicher Registrierung werden Sie zur Login-Seite weitergeleitet

### Anmeldung

1. Navigieren Sie zu `/sign-in`
2. Melden Sie sich mit Ihren Zugangsdaten an
3. Sie werden zum Dashboard weitergeleitet

### Dashboard

Nach der Anmeldung haben Sie Zugriff auf:

- **Übersicht** (`/dashboard`): Hauptdashboard mit Metriken und Charts
- **Wetter** (`/dashboard/wetter`): Wetter-Widget mit 5-Tage-Vorhersage
- **Finanzen** (`/dashboard/finanzen`): Finanzübersicht mit Transaktionen
- **Kalender** (`/dashboard/kalender`): Kalender mit anstehenden Events

Alle Daten sind Dummy-Daten aus [lib/mocks.ts](./lib/mocks.ts).

## Theme

Das Dashboard unterstützt Dark/Light Mode mit einem **Neon-Türkis** Akzent:

- **Light Mode**: `hsl(174 95% 45%)`
- **Dark Mode**: `hsl(174 90% 52%)`

Wechseln Sie zwischen den Modi über den Toggle-Button im Header.

## API-Routen

### Echo-Route

Beispiel-API-Route zum Testen von Fetch-Flows:

```bash
# GET Request
curl http://localhost:3000/api/echo

# POST Request
curl -X POST http://localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Deployment

### Vercel (Empfohlen)

1. Repository zu GitHub pushen
2. In Vercel importieren
3. Environment Variables konfigurieren
4. Deploy

Vercel erkennt Next.js automatisch und konfiguriert das Build-Setup.

### Environment Variables in Vercel

Fügen Sie folgende Variablen hinzu:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL` (Ihre Vercel-Domain)

## Nächste Schritte

Dieses Projekt verwendet ausschließlich Dummy-Daten. Für eine produktive Anwendung:

1. **Echte Daten-Integration**:
   - Wetter: OpenWeatherMap API
   - Finanzen: Banking-API oder eigene Datenbank
   - Kalender: Google Calendar API

2. **Testing**:
   - Playwright für E2E-Tests
   - RTL/Vitest für Unit-Tests

3. **Weitere Features**:
   - Benutzer-Profile
   - Benachrichtigungen
   - Export-Funktionen
   - Mobile App

## Lizenz

ISC

## Kontakt

Bei Fragen oder Problemen öffnen Sie ein Issue auf [GitHub](https://github.com/AyGeeI/next-js-dashboard/issues).
