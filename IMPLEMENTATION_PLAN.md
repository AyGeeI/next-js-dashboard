# Implementierungsplan: UI/UX Verbesserungen

Detaillierter Plan zur Umsetzung aller Verbesserungsvorschläge mit Fokus auf **Konsistenz** und **Wiederverwendbarkeit**.

---

## Grundprinzip: Component-First-Ansatz

**Ziel:** Jedes Bedienelement existiert genau **einmal** als wiederverwendbare Komponente mit konsistentem Verhalten.

**Regeln:**
1. Gleiche Bedienelemente = Gleiche Komponente
2. Alle Komponenten in `/components/ui/*` (shadcn-Konvention)
3. Erweiterte Komponenten in `/components/common/*`
4. Dokumentation in Storybook oder ähnlich (optional)
5. TypeScript für Type-Safety

---

## Phase 0: Vorbereitung & Analyse (Woche 0)

### 0.1 Komponenten-Inventur

**Aufgabe:** Analyse aller existierenden Komponenten und ihrer Verwendung

```bash
# Zu dokumentieren:
- Welche UI-Komponenten existieren?
- Wo werden sie verwendet?
- Welche Varianten/Props gibt es?
- Welche Inkonsistenzen existieren?
```

**Deliverables:**
- [ ] `COMPONENT_INVENTORY.md` - Liste aller Komponenten
- [ ] `COMPONENT_USAGE_MAP.md` - Wo wird was verwendet
- [ ] `INCONSISTENCIES.md` - Gefundene Inkonsistenzen

### 0.2 Dependencies Installation

**Aufgabe:** Alle benötigten Packages installieren

```bash
# Neue Dependencies
pnpm add @tanstack/react-virtual
pnpm add cmdk
pnpm add react-hook-form @hookform/resolvers zod
pnpm add date-fns
pnpm add recharts
pnpm add nuqs
pnpm add sonner
pnpm add vaul

# Dev Dependencies
pnpm add -D @axe-core/react
```

**Deliverables:**
- [ ] Alle Dependencies installiert
- [ ] package.json aktualisiert
- [ ] Keine Breaking Changes

### 0.3 Basis-Setup

**Aufgabe:** Projekt-weite Konfigurationen

**Files zu erstellen/aktualisieren:**
- [ ] `/lib/constants/ui.ts` - UI-Konstanten (z.B. TOAST_DURATION, INPUT_DEBOUNCE)
- [ ] `/lib/hooks/use-media-query.ts` - Responsive-Hook
- [ ] `/lib/hooks/use-debounce.ts` - Debounce-Hook
- [ ] `/lib/utils/validation.ts` - Validierungs-Helpers
- [ ] `/lib/utils/form.ts` - Form-Helpers

---

## Phase 1: Core Component Library (Woche 1-2)

**Ziel:** Standardisierte, wiederverwendbare Basis-Komponenten erstellen

### 1.1 Enhanced Input Components

#### 1.1.1 Password Input Component

**File:** `/components/common/password-input.tsx`

**Features:**
- ✅ Password-Toggle (Eye/EyeOff Icon)
- ✅ Strength-Indicator (optional)
- ✅ Copy-to-Clipboard (optional)
- ✅ Konsistente Icon-Position (rechts, 12px vom Rand)
- ✅ Konsistente Icon-Größe (h-4 w-4)
- ✅ Accessibility (aria-labels, aria-pressed)

**Props:**
```typescript
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
  showCopyButton?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
}
```

**Verwendung:**
```tsx
// Auth-Seiten
<PasswordInput
  id="password"
  showStrengthIndicator={isRegisterPage}
  autoComplete="new-password"
/>

// Settings (API-Keys)
<PasswordInput
  id="api-key"
  showCopyButton
  placeholder="Ihr API-Schlüssel"
/>
```

**Tasks:**
- [ ] Komponente erstellen
- [ ] Strength-Evaluator implementieren
- [ ] Copy-to-Clipboard implementieren
- [ ] Alle Passwort-Inputs ersetzen:
  - [ ] `/app/(auth)/sign-in/page.tsx` (2x)
  - [ ] `/app/(auth)/sign-up/page.tsx` (2x)
  - [ ] `/app/(auth)/reset-password/page.tsx` (falls existiert)
  - [ ] `/app/dashboard/settings/page.tsx` (3x: Weather API, Spotify Client ID, Secret)
  - [ ] `/app/dashboard/account/page.tsx` (Password-Change)

#### 1.1.2 Enhanced Input with Validation

**File:** `/components/common/validated-input.tsx`

**Features:**
- ✅ Inline-Validierung
- ✅ Error-State mit Icon
- ✅ Success-State mit Icon (optional)
- ✅ Debounced-Validation
- ✅ aria-describedby für Errors
- ✅ aria-invalid für Accessibility

**Props:**
```typescript
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  showSuccessState?: boolean;
  validationFn?: (value: string) => Promise<string | undefined>;
  debounceMs?: number;
}
```

**Verwendung:**
```tsx
<ValidatedInput
  label="E-Mail-Adresse"
  type="email"
  error={errors.email}
  helperText="Wir senden dir einen Bestätigungslink"
  validationFn={async (email) => {
    // Check if email exists
    return isValid ? undefined : "E-Mail bereits vergeben"
  }}
/>
```

**Tasks:**
- [ ] Komponente erstellen
- [ ] Validierungs-Logic implementieren
- [ ] Debounce implementieren
- [ ] Success/Error-Icons
- [ ] Alle Text-Inputs ersetzen:
  - [ ] Sign-in: identifier (1x)
  - [ ] Sign-up: username, email (2x)
  - [ ] Forgot-password: identifier (1x)
  - [ ] Settings: alle Inputs (7x)
  - [ ] Account: alle Inputs

#### 1.1.3 Select mit Konsistentem Styling

**File:** Erweitere existierende `/components/ui/select.tsx`

**Features:**
- ✅ Konsistente Höhe mit Inputs (h-10)
- ✅ Search-Funktionalität für lange Listen
- ✅ Loading-State
- ✅ Empty-State
- ✅ Keyboard-Navigation

**Neue Komponente:** `/components/common/searchable-select.tsx`

**Props:**
```typescript
interface SearchableSelectProps {
  options: Array<{ label: string; value: string; disabled?: boolean }>;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  label?: string;
}
```

**Tasks:**
- [ ] SearchableSelect erstellen
- [ ] Search-Logic implementieren
- [ ] Empty-State
- [ ] Alle Selects prüfen und ggf. ersetzen:
  - [ ] Settings: Language, Data-Retention (2x)
  - [ ] Weitere Selects im Projekt

### 1.2 Form Components

#### 1.2.1 Form-Wrapper mit react-hook-form

**File:** `/components/common/form-wrapper.tsx`

**Features:**
- ✅ Integriert react-hook-form
- ✅ Zod-Validierung
- ✅ Dirty-State-Tracking
- ✅ Auto-Save (optional)
- ✅ Submit-Handler mit Loading-State

**Props:**
```typescript
interface FormWrapperProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: T;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
}
```

**Verwendung:**
```tsx
<FormWrapper
  schema={loginSchema}
  onSubmit={handleLogin}
  defaultValues={{ identifier: "", password: "" }}
>
  {({ register, formState: { errors, isSubmitting } }) => (
    <>
      <ValidatedInput
        {...register("identifier")}
        label="E-Mail oder Benutzername"
        error={errors.identifier?.message}
      />
      <PasswordInput
        {...register("password")}
      />
      <Button type="submit" loading={isSubmitting}>
        Anmelden
      </Button>
    </>
  )}
</FormWrapper>
```

**Tasks:**
- [ ] FormWrapper erstellen
- [ ] Zod-Schemas definieren für:
  - [ ] Login
  - [ ] Register
  - [ ] Forgot-Password
  - [ ] Settings (Weather, Spotify)
- [ ] Alle Forms migrieren:
  - [ ] Sign-in
  - [ ] Sign-up
  - [ ] Forgot-password
  - [ ] Settings (alle Tabs)

#### 1.2.2 Field-Components

**Files:**
- `/components/common/form-field.tsx` - Wrapper für Label + Input + Error
- `/components/common/form-section.tsx` - Section mit Title + Description

**FormField Props:**
```typescript
interface FormFieldProps {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```

**Verwendung:**
```tsx
<FormField
  label="E-Mail-Adresse"
  helperText="Wir senden dir einen Bestätigungslink"
  error={errors.email}
  required
>
  <Input type="email" {...register("email")} />
</FormField>
```

**Tasks:**
- [ ] FormField erstellen
- [ ] FormSection erstellen
- [ ] Alle manuellen Label+Input+Error-Kombinationen ersetzen

### 1.3 Feedback Components

#### 1.3.1 Unified Toast System

**File:** `/components/common/toast-provider.tsx`

**Aufgabe:** Ersetze current Toast durch Sonner

**Features:**
- ✅ Konsistente Position (bottom-right)
- ✅ Auto-Dismiss nach 5s
- ✅ Action-Support (Undo, etc.)
- ✅ Promise-Toast (loading → success/error)

**Verwendung:**
```tsx
// Einfach
toast.success("Einstellungen gespeichert");

// Mit Action
toast.success("Datei gelöscht", {
  action: {
    label: "Rückgängig",
    onClick: () => undoDelete()
  }
});

// Promise
toast.promise(
  saveSettings(),
  {
    loading: "Speichere...",
    success: "Gespeichert!",
    error: "Fehler beim Speichern"
  }
);
```

**Tasks:**
- [ ] Sonner installieren und konfigurieren
- [ ] ToastProvider in Root-Layout einbinden
- [ ] Alle Toast-Calls migrieren
- [ ] Custom-Styling gemäß Design-Guidelines

#### 1.3.2 Enhanced NotificationBanner

**File:** Erweitere `/components/ui/notification-banner.tsx`

**Neue Features:**
- ✅ Dismiss-Button (optional)
- ✅ Icon automatisch basierend auf Variant
- ✅ Action-Buttons konsistent positioniert
- ✅ Collapse/Expand für lange Texte

**Props:**
```typescript
interface NotificationBannerProps {
  variant: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
  collapsible?: boolean;
}
```

**Tasks:**
- [ ] Erweitere NotificationBanner
- [ ] Standardisiere Icon-Usage
- [ ] Alle NotificationBanner-Verwendungen prüfen

#### 1.3.3 Loading Components

**Files:**
- `/components/common/loading-spinner.tsx`
- `/components/common/loading-skeleton.tsx`
- `/components/common/loading-screen.tsx`

**LoadingSkeleton für verschiedene Layouts:**
```tsx
// Preset-Skeletons
<SkeletonCard /> // Für Metric-Cards
<SkeletonChart /> // Für Charts
<SkeletonTable /> // Für Tabellen
<SkeletonForm /> // Für Forms

// Custom
<Skeleton className="h-12 w-full" />
```

**Tasks:**
- [ ] LoadingSpinner erstellen
- [ ] Preset-Skeletons erstellen
- [ ] LoadingScreen für Full-Page-Loading
- [ ] Überall implementieren:
  - [ ] Dashboard-Page (Skeletons für Metrics, Charts)
  - [ ] Settings (Skeletons für Forms)
  - [ ] Auth-Pages (LoadingScreen für Fallbacks)

### 1.4 Navigation Components

#### 1.4.1 Breadcrumbs

**File:** `/components/common/breadcrumbs.tsx`

**Features:**
- ✅ Auto-generiert aus Route
- ✅ Custom-Labels möglich
- ✅ Mobile: nur letzte 2-3 Crumbs
- ✅ Separator konsistent
- ✅ Letzter Crumb nicht klickbar

**Props:**
```typescript
interface BreadcrumbsProps {
  items?: Array<{ label: string; href: string }>;
  maxItems?: number; // Für Mobile
}
```

**Verwendung:**
```tsx
// Auto-generiert
<Breadcrumbs />

// Custom
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Einstellungen", href: "/dashboard/settings" },
    { label: "Wetter", href: "/dashboard/settings?tab=weather" }
  ]}
/>
```

**Tasks:**
- [ ] Breadcrumbs-Komponente erstellen
- [ ] Auto-Generation aus Pathname
- [ ] Mobile-Optimierung
- [ ] In Header integrieren
- [ ] Auf allen Sub-Seiten einbauen:
  - [ ] Settings
  - [ ] Account
  - [ ] Admin
  - [ ] Alle Widget-Seiten

#### 1.4.2 Command Palette

**File:** `/components/common/command-palette.tsx`

**Features:**
- ✅ ⌘K / Ctrl+K zum Öffnen
- ✅ Fuzzy-Search
- ✅ Kategorien (Navigation, Actions, Settings)
- ✅ Recent-Items
- ✅ Keyboard-Navigation

**Verwendung:**
```tsx
// In Root-Layout
<CommandPalette />

// User drückt ⌘K → Dialog öffnet sich
// Suchen nach: "Wetter", "Settings", "Logout", etc.
```

**Tasks:**
- [ ] CommandPalette erstellen (mit cmdk)
- [ ] Search-Items definieren
- [ ] Keyboard-Shortcut registrieren
- [ ] In Root-Layout einbinden
- [ ] Recent-Items-Tracking
- [ ] Actions implementieren (Navigation, Logout, etc.)

#### 1.4.3 Mobile Navigation

**File:** `/components/layout/mobile-nav.tsx`

**Features:**
- ✅ Sheet/Drawer von links
- ✅ Backdrop-Blur
- ✅ Auto-Close nach Navigation
- ✅ Bottom-Navigation für Haupt-Items (optional)

**Tasks:**
- [ ] MobileNav-Sheet erstellen
- [ ] Hamburger-Button in Header
- [ ] Auto-Close implementieren
- [ ] Bottom-Nav für wichtigste 4-5 Items (optional)
- [ ] Swipe-Gesten (optional, mit vaul)

### 1.5 Data Display Components

#### 1.5.1 Enhanced CardMetric

**File:** Erweitere `/components/widgets/card-metric.tsx`

**Neue Features:**
- ✅ Click-Handler für Drill-Down
- ✅ Loading-State
- ✅ Empty-State
- ✅ Tooltip mit mehr Infos
- ✅ Trend-Chart (Mini-Sparkline)

**Props:**
```typescript
interface CardMetricProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  onClick?: () => void;
  loading?: boolean;
  trend?: Array<number>; // Für Sparkline
  tooltip?: string;
}
```

**Tasks:**
- [ ] CardMetric erweitern
- [ ] Loading-State hinzufügen
- [ ] Click-Handler implementieren
- [ ] Sparkline-Integration (optional)
- [ ] Tooltip mit mehr Kontext

#### 1.5.2 Enhanced Charts

**Files:**
- `/components/common/chart-line.tsx`
- `/components/common/chart-bar.tsx`
- `/components/common/chart-area.tsx`

**Features:**
- ✅ Konsistente Farben (aus Theme)
- ✅ Interaktive Tooltips
- ✅ Responsive
- ✅ Loading-State
- ✅ Empty-State
- ✅ Export-Funktion (als PNG/CSV)

**Verwendung:**
```tsx
<ChartLine
  data={chartData}
  xKey="date"
  yKey="value"
  title="Aktivität der letzten 30 Tage"
  loading={isLoading}
  onExport={handleExport}
/>
```

**Tasks:**
- [ ] Chart-Komponenten mit Recharts erstellen
- [ ] Konsistentes Styling
- [ ] Tooltips konfigurieren
- [ ] Loading/Empty-States
- [ ] Export-Funktionalität
- [ ] Alle Charts ersetzen:
  - [ ] `/components/widgets/chart-mini.tsx` → neue ChartLine
  - [ ] Dashboard: beide Charts
  - [ ] Weitere Chart-Verwendungen

#### 1.5.3 Table mit Features

**File:** `/components/common/data-table.tsx`

**Features:**
- ✅ Sortierung
- ✅ Paginierung
- ✅ Search/Filter
- ✅ Row-Selection
- ✅ Column-Visibility
- ✅ Loading-State (Skeleton-Rows)
- ✅ Empty-State

**Tasks:**
- [ ] DataTable mit @tanstack/react-table erstellen
- [ ] Sortierung implementieren
- [ ] Pagination implementieren
- [ ] Search/Filter
- [ ] Skeleton-Loading
- [ ] Empty-State
- [ ] In Projekt verwenden (wenn Tabellen benötigt)

---

## Phase 2: Layout & Navigation (Woche 3)

### 2.1 Enhanced Header

**File:** `/components/layout/header.tsx`

**Aufgaben:**
- [ ] Breadcrumbs integrieren
- [ ] Search-Button (öffnet Command-Palette)
- [ ] Notifications-Bell (Badge mit Anzahl)
- [ ] Responsive-Optimierung

**Struktur:**
```tsx
<header>
  <div className="flex items-center gap-3">
    <SidebarToggle />
    <Breadcrumbs />
  </div>

  <div className="flex items-center gap-3">
    <Button variant="ghost" size="icon" onClick={openCommandPalette}>
      <Search />
    </Button>
    <NotificationBell />
    <ThemeToggle />
    <UserMenu />
  </div>
</header>
```

### 2.2 Enhanced Sidebar

**File:** `/components/layout/sidebar.tsx`

**Aufgaben:**
- [ ] Navigation in Sections gruppieren
- [ ] Badge-Support für Notifications
- [ ] Footer mit Version/Links
- [ ] Mobile: Sheet-Integration
- [ ] Keyboard-Navigation verbessern

**Struktur:**
```tsx
<aside>
  <SidebarHeader>
    <Logo />
  </SidebarHeader>

  <SidebarNav>
    <NavSection title="Hauptmenü">
      <NavItem href="/dashboard" icon={Home} badge={3}>
        Dashboard
      </NavItem>
      {/* ... */}
    </NavSection>

    <NavSection title="Widgets">
      <NavItem href="/dashboard/wetter" icon={Cloud}>
        Wetter
      </NavItem>
      {/* ... */}
    </NavSection>
  </SidebarNav>

  <SidebarFooter>
    <small>v1.0.0</small>
  </SidebarFooter>
</aside>
```

### 2.3 Mobile Bottom Navigation

**File:** `/components/layout/bottom-nav.tsx`

**Aufgaben:**
- [ ] Komponente erstellen
- [ ] Nur auf Mobile anzeigen (lg:hidden)
- [ ] 4-5 wichtigste Items
- [ ] Active-State
- [ ] Badge-Support

**Struktur:**
```tsx
<nav className="fixed bottom-0 inset-x-0 lg:hidden">
  <div className="flex justify-around">
    <BottomNavItem href="/dashboard" icon={Home}>
      Home
    </BottomNavItem>
    <BottomNavItem href="/dashboard/kalender" icon={Calendar}>
      Kalender
    </BottomNavItem>
    {/* ... */}
  </div>
</nav>
```

### 2.4 Notifications System

**Files:**
- `/components/layout/notification-bell.tsx`
- `/components/layout/notifications-panel.tsx`
- `/lib/hooks/use-notifications.ts`

**Features:**
- ✅ Badge mit Anzahl
- ✅ Panel/Popover mit Liste
- ✅ "Alle als gelesen markieren"
- ✅ Kategorien (System, Updates, etc.)
- ✅ Persistent (in DB speichern)

**Tasks:**
- [ ] NotificationBell erstellen
- [ ] NotificationsPanel erstellen
- [ ] useNotifications-Hook
- [ ] API-Endpoints für Notifications
- [ ] In Header integrieren

---

## Phase 3: Auth Pages Refactoring (Woche 4)

**Ziel:** Alle Auth-Seiten mit neuen Komponenten refactoren

### 3.1 Sign-In Page

**File:** `/app/(auth)/sign-in/page.tsx`

**Änderungen:**
- [ ] FormWrapper verwenden
- [ ] ValidatedInput für identifier
- [ ] PasswordInput für password
- [ ] Enhanced Switch für rememberMe
- [ ] Toast statt NotificationBanner (für Erfolg)
- [ ] NotificationBanner nur für persistente Errors
- [ ] Loading-States mit Skeleton

**Neue Features:**
- [ ] Autofocus auf erstem Input
- [ ] Inline-Validierung
- [ ] Keyboard-Shortcuts (Enter to Submit)
- [ ] "Angemeldet bleiben"-Tooltip

### 3.2 Sign-Up Page

**File:** `/app/(auth)/sign-up/page.tsx`

**Änderungen:**
- [ ] FormWrapper verwenden
- [ ] ValidatedInput für username, email
- [ ] PasswordInput mit showStrengthIndicator
- [ ] Live-Validation für alle Felder
- [ ] Username-Verfügbarkeit prüfen (debounced)
- [ ] Email-Verfügbarkeit prüfen (debounced)

**Neue Features:**
- [ ] Passwort-Anforderungen als Checklist (✓/✗)
- [ ] Success-State verbessern (Formular ausblenden)
- [ ] Progress-Indicator (optional: Multi-Step)
- [ ] Countdown für Auto-Redirect

### 3.3 Forgot-Password Page

**File:** `/app/(auth)/forgot-password/page.tsx`

**Änderungen:**
- [ ] FormWrapper verwenden
- [ ] ValidatedInput für identifier
- [ ] Toast für Success-Message
- [ ] Breadcrumb "← Zurück zum Login"

**Neue Features:**
- [ ] Rate-Limiting-Hinweis
- [ ] Resend-Cooldown (60s)
- [ ] Spam-Ordner-Hinweis

### 3.4 Auth Layout Improvements

**File:** `/app/(auth)/layout.tsx`

**Änderungen:**
- [ ] Konsistente Card-Größen
- [ ] Animationen (fade-in)
- [ ] Background-Pattern verbessern
- [ ] Mobile-Optimierung
- [ ] Skip-to-Content-Link

---

## Phase 4: Dashboard Refactoring (Woche 5)

### 4.1 Dashboard Overview

**File:** `/app/dashboard/page.tsx`

**Änderungen:**
- [ ] CardMetric (enhanced) verwenden
- [ ] Charts (enhanced) verwenden
- [ ] Loading-States (Skeletons)
- [ ] Empty-States für alle Sections
- [ ] Zeitraum-Filter hinzufügen

**Neue Features:**
- [ ] KPI-Zeitraum-Auswahl (7d/30d/90d)
- [ ] Click-to-Drill-Down auf Metrics
- [ ] Chart-Export-Funktion
- [ ] Schnellzugriff-Personalisierung

**Struktur:**
```tsx
<div className="space-y-10">
  <PageHeader
    title="Dashboard Übersicht"
    description="Ihr persönliches Cockpit"
    action={<TimeRangeSelect />}
  />

  {loading ? (
    <SkeletonMetrics count={4} />
  ) : metrics.length === 0 ? (
    <EmptyState
      icon={BarChart}
      title="Noch keine Daten"
      description="Verbinde deine Services, um Daten zu erfassen."
      action={<Button>Services konfigurieren</Button>}
    />
  ) : (
    <MetricsGrid metrics={metrics} />
  )}

  <ChartsGrid charts={charts} loading={chartsLoading} />

  <QuickAccessSection customizable />
</div>
```

### 4.2 Widget Pages

**Files:**
- `/app/dashboard/wetter/page.tsx`
- `/app/dashboard/musik/page.tsx`
- `/app/dashboard/finanzen/page.tsx`
- `/app/dashboard/kalender/page.tsx`

**Für alle Widget-Pages:**
- [ ] Breadcrumbs hinzufügen
- [ ] Loading-States
- [ ] Empty-States
- [ ] Error-Boundaries
- [ ] Konsistente Page-Header
- [ ] Back-Button (Mobile)

### 4.3 Account Page

**File:** `/app/dashboard/account/page.tsx`

**Sections:**
1. **Profil-Informationen**
   - [ ] FormWrapper
   - [ ] ValidatedInput für Name, Email, Username
   - [ ] Avatar-Upload
   - [ ] Dirty-State-Warning

2. **Passwort ändern**
   - [ ] PasswordInput (3x: current, new, confirm)
   - [ ] Strength-Indicator für neues Passwort
   - [ ] Separate Form

3. **Sicherheit**
   - [ ] 2FA-Setup (Phase 6)
   - [ ] Aktive Sessions anzeigen
   - [ ] "Alle Geräte abmelden"-Button

4. **Datenschutz**
   - [ ] "Meine Daten exportieren"-Button
   - [ ] "Konto löschen"-Button (mit AlertDialog)

### 4.4 Admin Page

**File:** `/app/dashboard/admin/page.tsx`

**Sections:**
1. **Benutzerverwaltung**
   - [ ] DataTable mit Sortierung, Search
   - [ ] Rollen-Änderung
   - [ ] Benutzer sperren/entsperren

2. **System-Statistiken**
   - [ ] CardMetrics für System-Metriken
   - [ ] Charts für Nutzung

**Tasks:**
- [ ] DataTable implementieren
- [ ] User-Management-API
- [ ] Rollen-Management
- [ ] Audit-Log (optional)

---

## Phase 5: Settings Refactoring (Woche 6)

### 5.1 Settings-Layout

**File:** `/app/dashboard/settings/page.tsx`

**Änderungen:**
- [ ] Tabs mit Badge-Support (für Errors/Warnings)
- [ ] Dirty-State über alle Tabs hinweg
- [ ] "Änderungen nicht gespeichert"-Warning
- [ ] Globaler "Speichern"-Button (sticky)
- [ ] Mobile: Accordion statt Tabs

### 5.2 Tab: Allgemeines

**Änderungen:**
- [ ] SearchableSelect für Language
- [ ] SearchableSelect für Data-Retention
- [ ] State-Management implementieren
- [ ] Persistierung via API

**Neue Features:**
- [ ] i18n-Integration (optional)
- [ ] Bestätigung für kritische Änderungen

### 5.3 Tab: Benachrichtigungen

**Änderungen:**
- [ ] PreferenceToggle mit State
- [ ] Persistierung via API
- [ ] Sofortige Anwendung (kein Save-Button)

**Neue Features:**
- [ ] Toast bei Änderung
- [ ] Kategorien gruppieren
- [ ] "Alle deaktivieren"-Button

### 5.4 Tab: Dashboard

**Änderungen:**
- [ ] PreferenceToggle mit State
- [ ] Persistierung via API
- [ ] Live-Preview der Änderungen (optional)

### 5.5 Tab: Wetter

**Änderungen:**
- [ ] FormWrapper
- [ ] ValidatedInput für Zip, Country
- [ ] PasswordInput für API-Key
- [ ] "API-Key testen"-Button
- [ ] Test-Result-Badge

**Neue Features:**
```tsx
<FormSection title="OpenWeatherMap-Konfiguration">
  <FormField label="Postleitzahl">
    <ValidatedInput
      inputMode="numeric"
      pattern="[0-9]{5}"
      validationFn={validateZip}
    />
  </FormField>

  <FormField label="API-Schlüssel">
    <PasswordInput showCopyButton />
  </FormField>

  <Button
    variant="outline"
    onClick={testApiKey}
    loading={testing}
  >
    API-Key testen
  </Button>

  {testResult && (
    <Badge variant={testResult.valid ? "success" : "destructive"}>
      {testResult.message}
    </Badge>
  )}
</FormSection>
```

### 5.6 Tab: Spotify

**Änderungen:**
- [ ] Analog zu Wetter-Tab
- [ ] PasswordInput für Client-ID und Secret
- [ ] Connection-Status-Badge
- [ ] "Verbinden"/"Trennen"-Buttons
- [ ] OAuth-Flow beibehalten

---

## Phase 6: Advanced Features (Woche 7-8)

### 6.1 Error Boundaries

**Files:**
- `/app/error.tsx` - Globale Error-Seite
- `/app/dashboard/error.tsx` - Dashboard-Error
- `/components/common/error-boundary.tsx` - Wiederverwendbar

**Tasks:**
- [ ] Error.tsx erstellen
- [ ] Error-Boundary-Component
- [ ] Error-Logging implementieren
- [ ] "Fehler melden"-Button
- [ ] Retry-Mechanismus

### 6.2 Offline Support

**File:** `/components/common/offline-indicator.tsx`

**Features:**
- ✅ Banner bei Offline
- ✅ Auto-Hide bei Online
- ✅ Queued-Actions anzeigen (optional)

**Tasks:**
- [ ] Online/Offline-Listener
- [ ] OfflineIndicator-Component
- [ ] In Root-Layout einbinden
- [ ] Retry-Queue (optional)

### 6.3 Keyboard Shortcuts

**File:** `/lib/hooks/use-keyboard-shortcuts.ts`

**Shortcuts:**
- `⌘K` / `Ctrl+K` - Command-Palette
- `g+h` - Home/Dashboard
- `g+s` - Settings
- `g+a` - Account
- `?` - Shortcuts-Übersicht

**Tasks:**
- [ ] useKeyboardShortcuts-Hook
- [ ] Shortcuts registrieren
- [ ] Shortcuts-Overlay (mit `?`)
- [ ] In Dokumentation aufnehmen

### 6.4 Onboarding Tour

**File:** `/components/common/onboarding-tour.tsx`

**Features:**
- ✅ Step-by-Step-Guide für neue User
- ✅ Highlight wichtiger Bereiche
- ✅ Überspringbar
- ✅ Nur beim ersten Login

**Library:** `react-joyride` oder Custom

**Tasks:**
- [ ] Tour-Component erstellen
- [ ] Steps definieren
- [ ] User-State (Tour gesehen?)
- [ ] Trigger beim ersten Login
- [ ] "Tour erneut starten" in Settings

### 6.5 Personalisierung

**Features:**
- ✅ Dashboard-Layout anpassen (Drag-and-Drop)
- ✅ Widgets hinzufügen/entfernen
- ✅ Favoriten-System
- ✅ Farbschema-Presets

**Tasks:**
- [ ] Drag-and-Drop mit dnd-kit
- [ ] Widget-Bibliothek-Modal
- [ ] Favoriten-Stern bei Nav-Items
- [ ] Persistierung in User-Preferences
- [ ] Reset-to-Default-Button

### 6.6 Two-Factor Authentication

**Files:**
- `/app/dashboard/account/two-factor/page.tsx`
- `/components/common/qr-code.tsx`
- `/lib/2fa/totp.ts`

**Features:**
- ✅ TOTP-Setup mit QR-Code
- ✅ Backup-Codes
- ✅ Verification-Flow
- ✅ Deaktivieren mit Passwort

**Tasks:**
- [ ] 2FA-Setup-Page
- [ ] QR-Code-Generierung
- [ ] Verification-Endpoint
- [ ] Login-Flow anpassen (2FA-Code eingeben)
- [ ] Backup-Codes generieren

### 6.7 Sessions Management

**File:** `/app/dashboard/account/sessions/page.tsx`

**Features:**
- ✅ Liste aller aktiven Sessions
- ✅ Device-Info (Browser, OS, Location)
- ✅ "Session beenden" pro Device
- ✅ "Alle anderen abmelden"

**Tasks:**
- [ ] Sessions-API
- [ ] Sessions-Table
- [ ] Revoke-Funktionalität
- [ ] IP/Location-Detection

---

## Phase 7: Accessibility & Testing (Woche 9)

### 7.1 Accessibility Audit

**Tools:**
- axe DevTools
- Lighthouse
- WAVE
- Keyboard-Only-Testing

**Tasks:**
- [ ] Alle Seiten mit axe prüfen
- [ ] Kontraste prüfen (WCAG AA)
- [ ] Keyboard-Navigation testen
- [ ] Screen-Reader-Testing (NVDA/VoiceOver)

**Fix-Liste:**
- [ ] aria-labels ergänzen
- [ ] aria-describedby für Errors
- [ ] aria-live für dynamische Updates
- [ ] Landmark-Regions (main, nav, aside)
- [ ] Skip-to-Content-Link
- [ ] Focus-Management in Dialogs
- [ ] Heading-Hierarchie prüfen

### 7.2 Skip-to-Content

**File:** `/components/common/skip-to-content.tsx`

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
>
  Zum Hauptinhalt springen
</a>
```

**Tasks:**
- [ ] Component erstellen
- [ ] In Root-Layout einbinden
- [ ] #main-content ID setzen

### 7.3 Focus-Management

**Tasks:**
- [ ] Focus-Trap in Dialogs/Modals
- [ ] Focus-Return nach Dialog-Close
- [ ] Focus auf erstes Error-Feld bei Validation
- [ ] Focus auf neuen Content nach Navigation

### 7.4 Testing

**Files:**
- `/tests/e2e/auth.spec.ts`
- `/tests/e2e/dashboard.spec.ts`
- `/tests/accessibility/a11y.spec.ts`

**Tasks:**
- [ ] E2E-Tests für Auth-Flow (Playwright)
- [ ] E2E-Tests für Dashboard-Navigation
- [ ] Accessibility-Tests (axe-playwright)
- [ ] Component-Tests (Vitest + Testing-Library)

---

## Phase 8: Performance & Polish (Woche 10)

### 8.1 Performance Optimizations

**Tasks:**
- [ ] Dynamic Imports für große Components
- [ ] Image-Optimization (next/image)
- [ ] Code-Splitting prüfen
- [ ] Bundle-Size analysieren (webpack-bundle-analyzer)
- [ ] Lighthouse-Score > 90

**Optimierungen:**
```tsx
// Dynamic Import für schwere Charts
const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <SkeletonChart />,
  ssr: false,
});

// Virtualisierung für lange Listen
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 8.2 Animations & Transitions

**File:** `/lib/constants/animations.ts`

**Konsistente Animationen:**
```ts
export const TRANSITIONS = {
  fast: "transition-all duration-150",
  normal: "transition-all duration-200",
  slow: "transition-all duration-300",
} as const;

export const ANIMATIONS = {
  fadeIn: "animate-in fade-in-0",
  slideIn: "animate-in slide-in-from-bottom-4",
  scaleIn: "animate-in zoom-in-95",
} as const;
```

**Tasks:**
- [ ] Animations-Konstanten definieren
- [ ] Überall konsistent anwenden
- [ ] prefers-reduced-motion beachten
- [ ] Micro-Interactions hinzufügen (Hover, Focus)

### 8.3 SEO & Meta-Tags

**Files:**
- `/app/layout.tsx` - Root-Metadata
- `/app/(auth)/*/page.tsx` - Auth-Page-Metadata
- `/app/dashboard/*/page.tsx` - Dashboard-Metadata

**Tasks:**
- [ ] Metadata für alle Seiten
- [ ] OG-Tags
- [ ] Twitter-Cards
- [ ] Favicon-Set
- [ ] manifest.json

### 8.4 Final Polish

**Tasks:**
- [ ] Alle TODOs im Code abarbeiten
- [ ] Console-Errors beheben
- [ ] Warnings beheben
- [ ] Dead-Code entfernen
- [ ] Code-Formatting (Prettier)
- [ ] Linting (ESLint)

---

## Komponenten-Konsistenz-Matrix

### Passwort-Felder

| Seite | Component | Props | Features |
|-------|-----------|-------|----------|
| Sign-In | `<PasswordInput>` | `id="password"` | Toggle |
| Sign-Up | `<PasswordInput>` | `id="password" showStrengthIndicator` | Toggle, Strength |
| Sign-Up | `<PasswordInput>` | `id="confirmPassword"` | Toggle |
| Settings (Weather) | `<PasswordInput>` | `id="weather-api-key" showCopyButton` | Toggle, Copy |
| Settings (Spotify) | `<PasswordInput>` | `id="spotify-client-id" showCopyButton` | Toggle, Copy |
| Settings (Spotify) | `<PasswordInput>` | `id="spotify-client-secret" showCopyButton` | Toggle, Copy |
| Account (Change PW) | `<PasswordInput>` | `id="current-password"` | Toggle |
| Account (Change PW) | `<PasswordInput>` | `id="new-password" showStrengthIndicator` | Toggle, Strength |
| Account (Change PW) | `<PasswordInput>` | `id="confirm-password"` | Toggle |

**Konsistenz-Regeln:**
- Icon immer rechts (right-3)
- Icon-Größe immer h-4 w-4
- Toggle-Button immer mit aria-label
- Strength-Indicator immer unter Input
- Copy-Button immer neben Toggle (links davon)

### Input-Felder

| Seite | Component | Validation | Features |
|-------|-----------|------------|----------|
| Sign-In | `<ValidatedInput>` | Email-Format | Inline |
| Sign-Up | `<ValidatedInput>` | Username-Verfügbarkeit | Inline, Debounced |
| Sign-Up | `<ValidatedInput>` | Email-Verfügbarkeit | Inline, Debounced |
| Settings | `<ValidatedInput>` | Custom per Field | Inline |
| Account | `<ValidatedInput>` | Custom per Field | Inline |

**Konsistenz-Regeln:**
- Error immer unterhalb (text-xs text-destructive)
- Helper-Text immer unter Label (text-xs text-muted-foreground)
- Success-Icon nur bei async-Validation (Check-Circle)
- Error-Icon immer (X-Circle)

### Buttons

| Variant | Use-Case | Loading-State |
|---------|----------|---------------|
| `default` | Primary-Actions (Submit, Save) | Spinner + Text |
| `outline` | Secondary-Actions (Cancel, Reset) | Spinner + Text |
| `ghost` | Icon-Buttons, Tertiary | Spinner |
| `destructive` | Delete, Logout | Spinner + Text |
| `link` | Navigation, External | - |

**Konsistenz-Regeln:**
- Loading: `disabled={loading}` + Spinner-Icon
- Icon-Size in Buttons: h-4 w-4
- Spacing: Icon + Text mit gap-2
- Text während Loading: "Wird geladen..." / "Speichere..." etc.

### Toasts

| Typ | Verwendung | Duration | Action |
|-----|------------|----------|--------|
| Success | Erfolgreiche Aktion | 5s | Optional (z.B. "Rückgängig") |
| Error | Fehler (nicht-kritisch) | 7s | Optional ("Erneut versuchen") |
| Info | Hinweise | 5s | - |
| Warning | Warnungen | 7s | Optional ("Verstanden") |
| Promise | Async-Actions | Auto | - |

**Konsistenz-Regeln:**
- Position: bottom-right
- Max. 3 gleichzeitig
- Auto-Dismiss nach duration
- Swipe-to-Dismiss

### Loading-States

| Context | Component | Behavior |
|---------|-----------|----------|
| Page-Load | `<LoadingScreen>` | Full-Page-Spinner |
| Section-Load | `<Skeleton*>` | Layout-Skeletons |
| Button-Load | Button mit Spinner | Disabled + Icon |
| Inline-Load | `<Spinner size="sm">` | Inline-Spinner |

**Konsistenz-Regeln:**
- Skeletons haben gleiche Dimensions wie Content
- Spinner-Größen: sm (h-4), md (h-6), lg (h-8)
- Animation: spin (2s linear infinite)

---

## Testing-Checkliste

### Jede Komponente

- [ ] Alle Props funktionieren
- [ ] Loading-State funktioniert
- [ ] Error-State funktioniert
- [ ] Disabled-State funktioniert
- [ ] Keyboard-Navigation funktioniert
- [ ] Screen-Reader-Test (aria-*)
- [ ] Mobile-Test (Touch-Targets)
- [ ] Dark-Mode-Test

### Jede Seite

- [ ] Loading-State (Skeleton)
- [ ] Empty-State
- [ ] Error-Boundary
- [ ] Breadcrumbs (wo nötig)
- [ ] Back-Button (Mobile)
- [ ] Keyboard-Navigation
- [ ] Screen-Reader-Navigation
- [ ] Mobile-Responsive
- [ ] Tablet-Responsive
- [ ] Desktop-Responsive

### Jedes Formular

- [ ] Validation (inline)
- [ ] Error-Messages (field-level)
- [ ] Success-State
- [ ] Loading-State (Submit)
- [ ] Dirty-State-Warning
- [ ] Reset funktioniert
- [ ] Autofocus
- [ ] Tab-Order korrekt
- [ ] Enter-to-Submit
- [ ] Escape-to-Cancel (Modals)

---

## Migration-Strategie

### Schritt-für-Schritt-Migration

1. **Component erstellen** (z.B. PasswordInput)
2. **Tests schreiben** (Component-Tests)
3. **In einem File verwenden** (z.B. sign-in)
4. **Testen** (Manuell + E2E)
5. **In allen Files verwenden** (Search & Replace)
6. **Alte Implementation löschen**
7. **Commit + Push**

### Branch-Strategie

```
main
  ├── feature/phase-1-components
  ├── feature/phase-2-layout
  ├── feature/phase-3-auth
  ├── feature/phase-4-dashboard
  ├── feature/phase-5-settings
  ├── feature/phase-6-advanced
  ├── feature/phase-7-a11y
  └── feature/phase-8-polish
```

**Regeln:**
- Jede Phase = eigener Branch
- Feature-Branch = klein und fokussiert
- Daily-Commits
- PR nach jeder Phase
- Code-Review verpflichtend
- Tests müssen grün sein

---

## Rollout-Plan

### Woche 1-2: Phase 1 (Components)
- [ ] Mon-Tue: Input-Components
- [ ] Wed-Thu: Form-Components
- [ ] Fri: Feedback-Components
- [ ] Mon: Navigation-Components
- [ ] Tue-Wed: Data-Display-Components
- [ ] Thu-Fri: Testing + PR

### Woche 3: Phase 2 (Layout)
- [ ] Mon-Tue: Header + Sidebar
- [ ] Wed: Mobile-Nav
- [ ] Thu-Fri: Notifications + Testing

### Woche 4: Phase 3 (Auth)
- [ ] Mon: Sign-In
- [ ] Tue: Sign-Up
- [ ] Wed: Forgot-Password
- [ ] Thu: Auth-Layout
- [ ] Fri: Testing + PR

### Woche 5: Phase 4 (Dashboard)
- [ ] Mon-Tue: Dashboard-Overview
- [ ] Wed: Widget-Pages
- [ ] Thu: Account-Page
- [ ] Fri: Admin-Page + Testing

### Woche 6: Phase 5 (Settings)
- [ ] Mon: Settings-Layout + Allgemeines
- [ ] Tue: Benachrichtigungen + Dashboard-Tab
- [ ] Wed: Wetter-Tab
- [ ] Thu: Spotify-Tab
- [ ] Fri: Testing + PR

### Woche 7-8: Phase 6 (Advanced)
- [ ] Week 7: Error-Boundaries, Offline, Shortcuts, Onboarding
- [ ] Week 8: Personalisierung, 2FA, Sessions

### Woche 9: Phase 7 (A11y & Testing)
- [ ] A11y-Audit + Fixes
- [ ] E2E-Tests
- [ ] Component-Tests

### Woche 10: Phase 8 (Performance & Polish)
- [ ] Performance-Optimizations
- [ ] Animations
- [ ] SEO
- [ ] Final-Polish

---

## Success-Kriterien

### Technisch

- [ ] Alle Komponenten wiederverwendbar
- [ ] 100% TypeScript-Coverage
- [ ] 90%+ Code-Coverage (Tests)
- [ ] 0 ESLint-Errors
- [ ] 0 Console-Errors/Warnings
- [ ] Lighthouse-Score > 90 (alle Kategorien)
- [ ] Bundle-Size < 500KB (first load)

### Accessibility

- [ ] WCAG 2.1 AA konform
- [ ] Keyboard-Navigation vollständig
- [ ] Screen-Reader-kompatibel
- [ ] Kontrast-Ratio > 4.5:1
- [ ] Focus-Indikatoren überall

### UX

- [ ] Konsistente Bedienung über alle Seiten
- [ ] Max. 3 Klicks zu jeder Funktion
- [ ] < 2s Ladezeit (LCP)
- [ ] < 100ms Input-Response (FID)
- [ ] Intuitive Navigation
- [ ] Hilfreiche Error-Messages

### Code-Qualität

- [ ] DRY (Don't Repeat Yourself)
- [ ] Single-Responsibility-Principle
- [ ] Dokumentierte Komponenten (JSDoc)
- [ ] Konsistente Naming-Conventions
- [ ] Geordnete Imports (ESLint)

---

## Komponenten-Dokumentation

### Template für Komponenten-Docs

**File:** `/components/[category]/[name]/README.md`

```markdown
# ComponentName

## Beschreibung

Kurze Beschreibung des Zwecks.

## Props

| Prop | Type | Default | Required | Beschreibung |
|------|------|---------|----------|--------------|
| propName | string | - | ✅ | Was macht dieser Prop? |

## Verwendung

\`\`\`tsx
<ComponentName prop="value" />
\`\`\`

## Varianten

Beschreibung der verschiedenen Varianten.

## Accessibility

- aria-*: Welche ARIA-Attribute werden gesetzt?
- Keyboard: Welche Keyboard-Shortcuts?

## Beispiele

Weitere Beispiele.
```

---

## Dokumentation aktualisieren

Nach jeder Phase:
- [ ] `CHANGELOG.md` aktualisieren
- [ ] `README.md` aktualisieren (Features)
- [ ] Komponenten-Docs aktualisieren
- [ ] Storybook aktualisieren (optional)

---

**Erstellt:** 2025-11-18
**Version:** 1.0
**Nächstes Review:** Nach Phase 1
