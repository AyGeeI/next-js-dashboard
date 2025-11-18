# UI & Usability Verbesserungsvorschläge

Umfassende Analyse und Verbesserungsvorschläge für Dashboard, Registrierung und Login basierend auf den DESIGN_GUIDELINES.md und Best Practices.

---

## 1. Authentifizierung (Login & Registrierung)

### 1.1 Login-Seite (sign-in/page.tsx)

#### Kritische Verbesserungen

**A) Visuelles Feedback & Ladezustände**
- ✅ **Bereits vorhanden**: Password visibility toggle
- ❌ **Fehlt**: Loading-Spinner im Button ist nur Text, sollte auch Icon haben
- ❌ **Fehlt**: Disabled-State-Styling für Inputs während des Ladens
- **Vorschlag**: Button mit Spinner-Icon ergänzen für besseres visuelles Feedback

**B) Error Handling & Messaging**
- ✅ **Bereits vorhanden**: NotificationBanner für Fehler
- ❌ **Fehlt**: Inline-Validierung während der Eingabe
- ❌ **Fehlt**: Spezifische Fehlermeldungen bei Feldebene (z.B. "E-Mail nicht gefunden")
- **Vorschlag**:
  - Echtzeit-Validierung für E-Mail-Format
  - Field-level error messages unter den Inputs
  - Autocomplete-Attribute für bessere Browser-Integration

**C) Accessibility**
- ✅ **Bereits vorhanden**: aria-label für Password-Toggle
- ❌ **Fehlt**: Focus-Management nach Fehlermeldung (Fokus sollte auf erstes Fehlerfeld springen)
- ❌ **Fehlt**: aria-describedby für Error-Messages
- ❌ **Fehlt**: aria-live Region für Status-Updates
- **Vorschlag**:
  ```tsx
  <Input
    id="identifier"
    aria-describedby={error ? "identifier-error" : undefined}
    aria-invalid={error ? "true" : "false"}
  />
  {error && <p id="identifier-error" role="alert">{error}</p>}
  ```

**D) UX-Verbesserungen**
- ❌ **Fehlt**: Autofocus auf erstem Input-Feld
- ❌ **Fehlt**: Enter-Taste submittet Form nicht klar kommuniziert
- ❌ **Fehlt**: "Angemeldet bleiben"-Erklärung (wie lange?)
- **Vorschlag**:
  - Autofocus auf identifier-Input: `autoFocus` prop
  - Tooltip für "Angemeldet bleiben": "Hält dich für 30 Tage angemeldet"
  - Success-State nach Login (kurze Bestätigung vor Redirect)

**E) Mobile Optimierung**
- ✅ **Bereits vorhanden**: Responsive Layout mit px-4
- ❌ **Fehlt**: inputMode für E-Mail-Feld ("email")
- ❌ **Fehlt**: Größere Touch-Targets für Mobile (min. 44×44px)
- **Vorschlag**:
  ```tsx
  <Input inputMode="email" /> // für E-Mail-Feld
  ```

### 1.2 Registrierungs-Seite (sign-up/page.tsx)

#### Kritische Verbesserungen

**A) Passwort-Stärke & Validierung**
- ✅ **Bereits vorhanden**: Passwort-Stärke-Indikator, Tooltip mit Anforderungen
- ❌ **Fehlt**: Live-Validierung der Anforderungen (Checkmark-Liste)
- ❌ **Fehlt**: Visuelles Feedback welche Anforderung erfüllt/nicht erfüllt ist
- **Vorschlag**:
  ```tsx
  // Anforderungen mit Check/X-Icons
  <ul className="space-y-1 text-xs">
    {requirements.map(req => (
      <li className="flex items-center gap-2">
        {req.fulfilled ?
          <CheckCircle className="h-3 w-3 text-success" /> :
          <XCircle className="h-3 w-3 text-muted-foreground" />
        }
        <span className={req.fulfilled ? "text-success" : ""}>{req.label}</span>
      </li>
    ))}
  </ul>
  ```

**B) Formular-Flow**
- ❌ **Fehlt**: Tab-Reihenfolge könnte optimiert werden
- ❌ **Fehlt**: Multi-Step-Ansatz für weniger Overwhelm (optional)
- ❌ **Fehlt**: Progress-Indicator (z.B. "Schritt 1 von 2")
- **Vorschlag**:
  - Formular in 2 Schritte aufteilen:
    1. Account-Info (Username, E-Mail)
    2. Passwort & Bestätigung
  - Oder: Stepper-Indikator für bessere Orientierung

**C) Success-State**
- ✅ **Bereits vorhanden**: Success-Banner mit Resend-Option
- ❌ **Fehlt**: Formular wird nicht disabled nach Erfolg
- ❌ **Fehlt**: Klare visuelle Trennung zwischen Success und neuer Registrierung
- **Vorschlag**:
  - Formular ausblenden oder disablen nach erfolgreichem Submit
  - "Neue Registrierung"-Button wenn User will neues Konto erstellen
  - Countdown-Timer für automatische Weiterleitung (optional)

**D) Feldvalidierung**
- ✅ **Bereits vorhanden**: Field-level errors (fieldErrors)
- ❌ **Fehlt**: Username-Verfügbarkeit in Echtzeit prüfen
- ❌ **Fehlt**: E-Mail-Format-Validierung vor Submit
- **Vorschlag**:
  - Debounced API-Call für Username-Verfügbarkeit
  - Client-side E-Mail-Regex-Validierung
  - Visuelles Feedback (Check/X-Icon am Input-Ende)

### 1.3 Passwort vergessen (forgot-password/page.tsx)

#### Kritische Verbesserungen

**A) UX-Flow**
- ✅ **Bereits vorhanden**: Klare Beschreibung, 30-Minuten-Info
- ❌ **Fehlt**: Link zurück zu Login zu weit unten
- ❌ **Fehlt**: Zeitstempel wann Link angefordert wurde
- **Vorschlag**:
  - Breadcrumb: "← Zurück zum Login" oben links
  - Nach Erfolg: "E-Mail gesendet um [Uhrzeit]"
  - Resend-Button mit Cooldown (z.B. 60 Sekunden)

**B) Security-Hinweise**
- ❌ **Fehlt**: Rate-Limiting-Hinweis für User
- ❌ **Fehlt**: "Spam-Ordner prüfen"-Hinweis
- **Vorschlag**:
  - Info-Banner: "Aus Sicherheitsgründen max. 3 Anfragen pro Stunde"
  - Nach Submit: "Bitte prüfe auch deinen Spam-Ordner"

---

## 2. Dashboard-Layout & Navigation

### 2.1 Sidebar (components/layout/sidebar.tsx)

#### Kritische Verbesserungen

**A) Navigation-Struktur**
- ✅ **Bereits vorhanden**: Tooltips im collapsed-State
- ❌ **Fehlt**: Gruppierung von Navigationselementen (Sections)
- ❌ **Fehlt**: Badge/Counter für Notifications (z.B. neue Nachrichten)
- **Vorschlag**:
  ```tsx
  // Gruppierung nach Bereichen
  const navSections = [
    {
      title: "Hauptmenü",
      items: [
        { name: "Übersicht", href: "/dashboard", icon: LayoutDashboard },
        { name: "Kalender", href: "/dashboard/kalender", icon: Calendar },
      ]
    },
    {
      title: "Widgets",
      items: [
        { name: "Wetter", href: "/dashboard/wetter", icon: Cloud },
        { name: "Musik", href: "/dashboard/musik", icon: Music },
        { name: "Finanzen", href: "/dashboard/finanzen", icon: DollarSign },
      ]
    }
  ];
  ```

**B) Mobile-Navigation**
- ❌ **Fehlt**: Hamburger-Menu für Mobile-Geräte
- ❌ **Fehlt**: Sheet/Drawer für Mobile-Navigation
- ❌ **Fehlt**: Navigation schließt sich automatisch nach Klick (Mobile)
- **Vorschlag**:
  - Sheet-Component für Mobile (<768px)
  - Auto-Close nach Navigation auf Mobile
  - Backdrop-Blur wenn Sidebar geöffnet

**C) Keyboard Navigation**
- ❌ **Fehlt**: Keyboard-Shortcuts für Navigation (z.B. g+d für Dashboard)
- ❌ **Fehlt**: Skip-to-Content-Link
- **Vorschlag**:
  - Command/Ctrl+K für Command-Palette
  - Shortcuts wie in Linear: g+h (Home), g+c (Calendar)
  - Visuelle Anzeige der Shortcuts (Tooltip oder Legend)

**D) Active-State**
- ✅ **Bereits vorhanden**: Active-State mit border-l-2
- ❌ **Fehlt**: Submenu-Support für verschachtelte Routen
- ❌ **Fehlt**: "Öffnen in neuem Tab"-Option (Rechtsklick)
- **Vorschlag**:
  - Nested Navigation mit Collapse/Expand
  - Context-Menu für erweiterte Optionen

### 2.2 Header (components/layout/header.tsx)

#### Kritische Verbesserungen

**A) Informationsdichte**
- ✅ **Bereits vorhanden**: Personalisierte Begrüßung, Datum
- ❌ **Fehlt**: Breadcrumbs für tiefe Navigation
- ❌ **Fehlt**: Globale Suche
- ❌ **Fehlt**: Notifications-Center
- **Vorschlag**:
  ```tsx
  // Breadcrumb-Integration
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>Dashboard</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>Finanzen</BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
  ```

**B) Globale Aktionen**
- ❌ **Fehlt**: Globale Suchfunktion (Command+K)
- ❌ **Fehlt**: Notifications-Badge
- ❌ **Fehlt**: Quick-Actions (z.B. "Neue Aufgabe erstellen")
- **Vorschlag**:
  - Command-Palette mit Fuzzy-Search
  - Notification-Bell mit Badge-Counter
  - Quick-Action-Dropdown ("+"-Button)

**C) User-Menu**
- ✅ **Bereits vorhanden**: Gutes User-Menu mit Rolle, Avatar
- ❌ **Fehlt**: Keyboard-Navigation im Dropdown
- ❌ **Fehlt**: Status-Indikator (Online/Offline)
- **Vorschlag**:
  - Arrow-Keys für Navigation im Menu
  - Grüner Dot für "Online"-Status
  - Letzte Aktivität anzeigen

### 2.3 Dashboard-Übersicht (dashboard/page.tsx)

#### Kritische Verbesserungen

**A) KPI-Karten**
- ✅ **Bereits vorhanden**: CardMetric mit Delta-Anzeige
- ❌ **Fehlt**: Zeitraum-Auswahl für KPIs (Last 7/30/90 days)
- ❌ **Fehlt**: Drill-Down-Funktionalität (Klick auf Karte → Details)
- ❌ **Fehlt**: Export-Funktion (CSV/PDF)
- **Vorschlag**:
  ```tsx
  // Zeitraum-Filter
  <Select defaultValue="30d">
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Zeitraum wählen" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="7d">Letzte 7 Tage</SelectItem>
      <SelectItem value="30d">Letzte 30 Tage</SelectItem>
      <SelectItem value="90d">Letzte 90 Tage</SelectItem>
    </SelectContent>
  </Select>
  ```

**B) Charts**
- ✅ **Bereits vorhanden**: ChartMini-Widget
- ❌ **Fehlt**: Interaktive Tooltips mit Datenpunkten
- ❌ **Fehlt**: Zoom/Pan-Funktionalität
- ❌ **Fehlt**: Vergleichsansicht (z.B. aktuelles vs. vorheriges Jahr)
- **Vorschlag**:
  - Recharts oder Chart.js mit interaktiven Features
  - Brush-Component für Zeitraum-Auswahl
  - Toggle für Vergleichsdaten

**C) Schnellzugriff-Karten**
- ✅ **Bereits vorhanden**: Gute Link-Karten mit Hover
- ❌ **Fehlt**: Personalisierung (User kann Favoriten festlegen)
- ❌ **Fehlt**: Drag-and-Drop zum Umsortieren
- ❌ **Fehlt**: "Pin"-Funktion für häufig genutzte Bereiche
- **Vorschlag**:
  - Drag-and-Drop mit dnd-kit
  - Einstellungen-Modal für Personalisierung
  - Persistierung der Reihenfolge im User-Profil

**D) Empty States**
- ❌ **Fehlt**: Empty-State-Handling (wenn keine Daten vorhanden)
- ❌ **Fehlt**: Onboarding-Flow für neue User
- **Vorschlag**:
  ```tsx
  {metrics.length === 0 ? (
    <Card className="p-12 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Noch keine Daten</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Verbinde deine Services, um Daten zu erfassen.
      </p>
      <Button className="mt-4">Services konfigurieren</Button>
    </Card>
  ) : (
    // Normal content
  )}
  ```

---

## 3. Settings-Seite

### 3.1 Tab-Navigation (dashboard/settings/page.tsx)

#### Kritische Verbesserungen

**A) Tabs-Struktur**
- ✅ **Bereits vorhanden**: Gute Tabs mit Allgemeines, Benachrichtigungen, etc.
- ❌ **Fehlt**: Scroll-to-Section für bessere Mobile-UX
- ❌ **Fehlt**: "Änderungen nicht gespeichert"-Warnung beim Tab-Wechsel
- ❌ **Fehlt**: Badge für Tabs mit Problemen (z.B. "Wetter ⚠")
- **Vorschlag**:
  - beforeUnload-Event für ungespeicherte Änderungen
  - Validation-State pro Tab
  - Mobile: Accordion statt Tabs

**B) Formular-Handling**
- ✅ **Bereits vorhanden**: Dirty-Check für Wetter und Spotify
- ❌ **Fehlt**: Globales Dirty-State-Management über alle Tabs
- ❌ **Fehlt**: "Alle speichern"-Button im Header
- ❌ **Fehlt**: Auto-Save-Funktionalität (optional)
- **Vorschlag**:
  - Globaler "Speichern"-Button wenn irgendein Tab dirty
  - Toast nach erfolgreichem Speichern
  - Auto-Save nach 2 Sekunden Inaktivität (opt-in)

**C) API-Key-Eingaben**
- ✅ **Bereits vorhanden**: Password-Type mit Toggle
- ❌ **Fehlt**: "API-Key testen"-Funktion
- ❌ **Fehlt**: Letzter Test-Zeitstempel
- ❌ **Fehlt**: Gültigkeits-Indikator
- **Vorschlag**:
  ```tsx
  <div className="mt-2 flex items-center gap-2">
    <Button type="button" variant="outline" size="sm">
      API-Key testen
    </Button>
    {testResult && (
      <Badge variant={testResult.valid ? "success" : "destructive"}>
        {testResult.valid ? "Gültig" : "Ungültig"}
      </Badge>
    )}
  </div>
  ```

### 3.2 Allgemeine Settings

#### Kritische Verbesserungen

**A) PreferenceToggle-Component**
- ✅ **Bereits vorhanden**: Gutes Layout mit Switch
- ❌ **Fehlt**: State-Management (Switches sind nicht funktional)
- ❌ **Fehlt**: Persistierung der Einstellungen
- ❌ **Fehlt**: Sofortige Anwendung vs. Save-Button
- **Vorschlag**:
  - Zustand in Context/State speichern
  - API-Endpunkt für Persistierung
  - Toast-Feedback bei Änderung

**B) Sprach- und Datenaufbewahrung**
- ✅ **Bereits vorhanden**: Select-Komponenten
- ❌ **Fehlt**: Tatsächliche Funktionalität
- ❌ **Fehlt**: Warnung bei sensiblen Änderungen (z.B. Daten löschen)
- **Vorschlag**:
  - i18n-Integration für Sprache
  - Confirmation-Dialog für Datenaufbewahrung-Änderung

---

## 4. Allgemeine UI-Verbesserungen

### 4.1 Accessibility (A11y)

**Kritische Probleme**

**A) Keyboard-Navigation**
- ❌ **Fehlt**: Skip-to-Content-Link
- ❌ **Fehlt**: Fokus-Trapping in Modals/Dialogs
- ❌ **Fehlt**: Konsistente Tab-Reihenfolge
- **Vorschlag**:
  ```tsx
  // Skip-to-Content
  <a href="#main-content" className="sr-only focus:not-sr-only">
    Zum Hauptinhalt springen
  </a>
  ```

**B) Screen-Reader-Support**
- ❌ **Fehlt**: aria-live Regions für dynamische Updates
- ❌ **Fehlt**: Beschreibende Labels für Icon-Only-Buttons
- ❌ **Fehlt**: Landmark-Regions (main, nav, aside)
- **Vorschlag**:
  - `<main id="main-content">` um Hauptinhalt
  - `aria-live="polite"` für Toast-Messages
  - `aria-label` für alle Icon-Buttons

**C) Farbkontrast**
- ⚠️ **Zu prüfen**: Kontrast von text-muted-foreground auf verschiedenen Backgrounds
- **Vorschlag**:
  - Kontrast-Check mit Tools wie Stark oder axe DevTools
  - Mindestens WCAG AA (4.5:1 für normalen Text)

### 4.2 Loading States

**A) Skeleton-Loading**
- ❌ **Fehlt**: Skeleton-States für Dashboard-Karten
- ❌ **Fehlt**: Skeleton für Sidebar-Navigation
- ❌ **Fehlt**: Progressive Loading (wichtigste Inhalte zuerst)
- **Vorschlag**:
  ```tsx
  // Dashboard-Skeleton
  {loading ? (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    // Real content
  )}
  ```

**B) Optimistic Updates**
- ❌ **Fehlt**: Sofortiges Feedback bei Benutzeraktionen
- **Vorschlag**:
  - Optimistic UI für Like/Star/Toggle-Aktionen
  - Rollback bei Fehler

### 4.3 Error Handling

**A) Globale Error-Boundary**
- ❌ **Fehlt**: Error-Boundary-Component für graceful degradation
- ❌ **Fehlt**: "Etwas ist schiefgelaufen"-Seite
- **Vorschlag**:
  ```tsx
  // error.tsx
  export default function Error({
    error,
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Etwas ist schiefgelaufen</CardTitle>
            <CardDescription>
              Ein unerwarteter Fehler ist aufgetreten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={reset}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  ```

**B) Network-Error-Handling**
- ❌ **Fehlt**: Offline-Indikator
- ❌ **Fehlt**: Retry-Mechanismus mit exponential backoff
- **Vorschlag**:
  - Online/Offline-Listener
  - Banner: "Keine Internetverbindung"
  - Auto-Retry wenn Verbindung wiederhergestellt

### 4.4 Performance

**A) Code-Splitting**
- ⚠️ **Zu prüfen**: Dynamic imports für große Components
- **Vorschlag**:
  ```tsx
  const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
    loading: () => <Skeleton className="h-[400px]" />,
    ssr: false,
  });
  ```

**B) Virtualisierung**
- ❌ **Fehlt**: Virtualisierung für lange Listen/Tabellen
- **Vorschlag**:
  - @tanstack/react-virtual für große Datensätze
  - Infinite Scroll mit Intersection Observer

**C) Bildoptimierung**
- ⚠️ **Zu prüfen**: Next.js Image-Component verwendet?
- **Vorschlag**:
  - `next/image` für alle Bilder
  - Lazy-Loading für Below-the-fold-Inhalte

---

## 5. Mobile-Optimierungen

### 5.1 Responsive Layout

**A) Breakpoints**
- ✅ **Bereits vorhanden**: Tailwind-Breakpoints (sm, md, lg)
- ❌ **Fehlt**: Tablet-spezifische Optimierungen
- ❌ **Fehlt**: Landscape-Orientierung
- **Vorschlag**:
  - Custom-Breakpoint für Tablets (768px-1024px)
  - Media-Query für Landscape

**B) Touch-Targets**
- ⚠️ **Zu prüfen**: Mindestgröße 44×44px für alle interaktiven Elemente
- **Vorschlag**:
  - Button min-height: 44px
  - Padding für größere Touch-Areas

**C) Mobile-Navigation**
- ❌ **Fehlt**: Bottom-Navigation für wichtigste Bereiche
- ❌ **Fehlt**: Swipe-Gesten für Sidebar
- **Vorschlag**:
  ```tsx
  // Bottom-Nav für Mobile
  <nav className="fixed bottom-0 left-0 right-0 lg:hidden">
    <div className="flex justify-around border-t bg-card">
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center p-3"
        >
          <item.icon className="h-6 w-6" />
          <span className="text-xs">{item.name}</span>
        </Link>
      ))}
    </div>
  </nav>
  ```

### 5.2 Formular-Optimierung

**A) Input-Types**
- ⚠️ **Teilweise vorhanden**: type="email" vorhanden
- ❌ **Fehlt**: inputMode für bessere Mobile-Keyboards
- **Vorschlag**:
  - inputMode="numeric" für Postleitzahl
  - inputMode="email" für E-Mail-Felder
  - autocomplete-Attribute für alle Felder

---

## 6. Advanced Features

### 6.1 Personalisierung

**A) Dashboard-Customization**
- ❌ **Fehlt**: Widget-Auswahl (Welche Widgets anzeigen?)
- ❌ **Fehlt**: Layout-Customization (Reihenfolge ändern)
- ❌ **Fehlt**: Theme-Presets (Neben Light/Dark: z.B. "High Contrast")
- **Vorschlag**:
  - Drag-and-Drop-Grid mit react-grid-layout
  - Widget-Bibliothek zum Hinzufügen/Entfernen
  - Persistierung im User-Profil

**B) Favoriten & Shortcuts**
- ❌ **Fehlt**: Favoriten-System
- ❌ **Fehlt**: Zuletzt angesehen
- ❌ **Fehlt**: Custom-Shortcuts
- **Vorschlag**:
  - Star-Icon bei Navigationsitems
  - "Kürzlich besucht"-Bereich im Dashboard
  - Keyboard-Shortcuts-Manager

### 6.2 Collaboration

**A) Aktivitäts-Feed**
- ❌ **Fehlt**: Aktivitätslog (Wer hat was geändert?)
- ❌ **Fehlt**: Notifications-System
- **Vorschlag**:
  - Timeline-Component für Aktivitäten
  - Echtzeit-Notifications mit WebSockets

**B) Sharing**
- ❌ **Fehlt**: Teilen von Dashboard-Ansichten
- ❌ **Fehlt**: Export-Funktionalität
- **Vorschlag**:
  - "Teilen"-Button für Dashboard/Reports
  - CSV/PDF-Export für Daten

### 6.3 Help & Onboarding

**A) Onboarding**
- ❌ **Fehlt**: Welcome-Tour für neue User
- ❌ **Fehlt**: Contextual-Help (?)
- ❌ **Fehlt**: Tooltips für komplexe Features
- **Vorschlag**:
  ```tsx
  // Tour mit react-joyride
  <Joyride
    steps={[
      {
        target: '.dashboard-overview',
        content: 'Hier siehst du deine wichtigsten Kennzahlen',
      },
      // ...
    ]}
  />
  ```

**B) Hilfe-System**
- ❌ **Fehlt**: Help-Center/Docs-Link
- ❌ **Fehlt**: In-App-Chat-Support
- ❌ **Fehlt**: FAQ-Bereich
- **Vorschlag**:
  - Floating-Action-Button für Support
  - Intercom/Crisp-Integration
  - Contextual-Help-Links

---

## 7. Sicherheit & Datenschutz

### 7.1 Authentifizierung

**A) Multi-Factor-Auth (MFA)**
- ❌ **Fehlt**: 2FA-Option
- **Vorschlag**:
  - TOTP-Integration (Google Authenticator)
  - Backup-Codes
  - SMS-Option (optional)

**B) Session-Management**
- ✅ **Bereits vorhanden**: "Angemeldet bleiben"-Option
- ❌ **Fehlt**: Aktive Sessions anzeigen
- ❌ **Fehlt**: "Alle Geräte abmelden"-Funktion
- **Vorschlag**:
  - Sessions-Übersicht in Account-Settings
  - Device-Info (Browser, OS, Standort)
  - "Session beenden"-Button pro Gerät

### 7.2 Datenschutz

**A) Privacy-Controls**
- ❌ **Fehlt**: Datenschutz-Einstellungen
- ❌ **Fehlt**: GDPR-Compliance-Features (Daten exportieren/löschen)
- **Vorschlag**:
  - "Meine Daten herunterladen"-Button
  - "Konto löschen"-Workflow mit Bestätigung
  - Privacy-Policy-Link prominent platziert

---

## 8. Priorisierung

### Must-Have (Kritisch für Launch)

1. **Login/Registrierung**
   - ✅ Inline-Validierung für alle Formularfelder
   - ✅ Verbessertes Error-Handling mit Field-Level-Errors
   - ✅ Autofocus und Enter-to-Submit
   - ✅ Mobile-optimierte Inputs (inputMode)

2. **Dashboard**
   - ✅ Empty-States für alle Widgets
   - ✅ Loading-Skeletons
   - ✅ Error-Boundary
   - ✅ Mobile-Navigation (Sheet/Drawer)

3. **Accessibility**
   - ✅ Skip-to-Content-Link
   - ✅ aria-labels für alle Interactive-Elements
   - ✅ Keyboard-Navigation
   - ✅ Kontrast-Check (WCAG AA)

### Should-Have (Wichtig für UX)

1. **Navigation**
   - ✅ Breadcrumbs
   - ✅ Globale Suche (Command-K)
   - ✅ Notifications-Center
   - ✅ Keyboard-Shortcuts

2. **Dashboard**
   - ✅ Zeitraum-Filter für KPIs
   - ✅ Interaktive Charts
   - ✅ Export-Funktionalität

3. **Settings**
   - ✅ API-Key-Testing
   - ✅ Dirty-State-Warning
   - ✅ Auto-Save

### Nice-to-Have (Für zukünftige Releases)

1. **Personalisierung**
   - ⭐ Drag-and-Drop-Dashboard
   - ⭐ Custom-Themes
   - ⭐ Widget-Bibliothek

2. **Collaboration**
   - ⭐ Sharing
   - ⭐ Aktivitäts-Feed
   - ⭐ Echtzeit-Updates

3. **Advanced**
   - ⭐ 2FA
   - ⭐ Onboarding-Tour
   - ⭐ In-App-Help

---

## 9. Zusammenfassung

### Stärken des aktuellen Projekts

1. ✅ Gute Grundlage mit shadcn/ui und Tailwind
2. ✅ Konsistentes Design-System (DESIGN_GUIDELINES.md)
3. ✅ Bereits einige gute UX-Features (Password-Toggle, Dirty-Check)
4. ✅ Responsive-Layout-Ansätze vorhanden
5. ✅ Dark-Mode-Support

### Hauptsächliche Verbesserungsbereiche

1. ❌ **Accessibility**: Mehr ARIA-Attribute, Keyboard-Navigation
2. ❌ **Mobile-UX**: Bottom-Nav, bessere Touch-Targets, Swipe-Gesten
3. ❌ **Error-Handling**: Globale Error-Boundary, besseres Feedback
4. ❌ **Loading-States**: Skeletons, Progressive-Loading
5. ❌ **Navigation**: Breadcrumbs, globale Suche, Shortcuts
6. ❌ **Personalisierung**: Dashboard-Customization, Favoriten
7. ❌ **Forms**: Inline-Validation, besseres Feedback
8. ❌ **Empty-States**: Überall wo Daten fehlen könnten

### Nächste Schritte

**Phase 1: Fundament (Woche 1-2)**
- Accessibility-Verbesserungen
- Error-Boundaries
- Loading-States
- Mobile-Navigation

**Phase 2: UX-Polish (Woche 3-4)**
- Inline-Validierung
- Breadcrumbs
- Globale Suche
- Keyboard-Shortcuts

**Phase 3: Advanced Features (Woche 5-6)**
- Dashboard-Personalisierung
- Notifications-System
- Onboarding-Tour
- Export-Funktionalität

---

*Erstellt: 2025-11-18*
*Basis: DESIGN_GUIDELINES.md + Code-Analyse*
