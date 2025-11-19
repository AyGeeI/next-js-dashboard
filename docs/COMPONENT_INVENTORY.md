# Komponenten-Inventur

Vollständige Übersicht aller existierenden Komponenten im Projekt (Stand: 2025-11-18)

---

## UI-Komponenten (shadcn/ui)

### Basis-Komponenten

| Komponente | Pfad | Status | Verwendung |
|------------|------|--------|------------|
| Button | `/components/ui/button.tsx` | ✅ Standard | Überall |
| Input | `/components/ui/input.tsx` | ⚠️ Erweitern | Auth, Settings, Forms |
| Label | `/components/ui/label.tsx` | ✅ Standard | Forms |
| Card | `/components/ui/card.tsx` | ✅ Standard | Dashboard, Widgets |
| Separator | `/components/ui/separator.tsx` | ✅ Standard | Layout |
| Skeleton | `/components/ui/skeleton.tsx` | ⚠️ Erweitern | Loading-States |

### Form-Komponenten

| Komponente | Pfad | Status | Verwendung |
|------------|------|--------|------------|
| Form | `/components/ui/form.tsx` | ⚠️ Nicht genutzt | - |
| Select | `/components/ui/select.tsx` | ✅ Standard | Settings |
| Switch | `/components/ui/switch.tsx` | ✅ Standard | Sign-In, Settings |
| Slider | `/components/ui/slider.tsx` | ✅ Standard | (noch nicht genutzt) |
| Textarea | `/components/ui/textarea.tsx` | ✅ Standard | (noch nicht genutzt) |

### Feedback-Komponenten

| Komponente | Pfad | Status | Verwendung |
|------------|------|--------|------------|
| Toast | `/components/ui/toast.tsx` | ⚠️ Ersetzen | - |
| Toaster | `/components/ui/toaster.tsx` | ⚠️ Ersetzen | Layout |
| NotificationBanner | `/components/ui/notification-banner.tsx` | ⚠️ Erweitern | Auth, Settings |
| AlertDialog | `/components/ui/alert-dialog.tsx` | ✅ Standard | (bereit) |
| Dialog | `/components/ui/dialog.tsx` | ✅ Standard | Modals |

### Navigation-Komponenten

| Komponente | Pfad | Status | Verwendung |
|------------|------|--------|------------|
| Breadcrumb | `/components/ui/breadcrumb.tsx` | ✅ Vorhanden | ❌ Nicht verwendet |
| Tabs | `/components/ui/tabs.tsx` | ✅ Standard | Settings |
| Tooltip | `/components/ui/tooltip.tsx` | ✅ Standard | Sidebar, Sign-Up |
| DropdownMenu | `/components/ui/dropdown-menu.tsx` | ✅ Standard | UserMenu |

---

## Layout-Komponenten

| Komponente | Pfad | Status | Inkonsistenzen |
|------------|------|--------|----------------|
| Header | `/components/layout/header.tsx` | ⚠️ Erweitern | Fehlt: Breadcrumbs, Search, Notifications |
| Sidebar | `/components/layout/sidebar.tsx` | ⚠️ Erweitern | Fehlt: Sections, Badges, Footer |
| SidebarContext | `/components/layout/sidebar-context.tsx` | ✅ Standard | - |
| SidebarToggleButton | `/components/layout/sidebar-toggle-button.tsx` | ✅ Standard | - |
| UserMenu | `/components/layout/user-menu.tsx` | ✅ Gut | - |

---

## Widget-Komponenten

| Komponente | Pfad | Status | Inkonsistenzen |
|------------|------|--------|----------------|
| CardMetric | `/components/widgets/card-metric.tsx` | ⚠️ Erweitern | Fehlt: Click-Handler, Loading, Tooltip |
| ChartMini | `/components/widgets/chart-mini.tsx` | ⚠️ Ersetzen | Nicht interaktiv, kein Export |

---

## Feature-Komponenten

### Auth

| Komponente | Pfad | Status | Notizen |
|------------|------|--------|---------|
| AutoLogout | `/components/auth/auto-logout.tsx` | ✅ Standard | - |

### Calendar

| Komponente | Pfad | Status | Notizen |
|------------|------|--------|---------|
| CalendarGrid | `/components/calendar/calendar-grid.tsx` | ✅ Standard | - |
| EventCard | `/components/calendar/event-card.tsx` | ✅ Standard | - |
| EventForm | `/components/calendar/event-form.tsx` | ✅ Standard | - |
| EventModal | `/components/calendar/event-modal.tsx` | ✅ Standard | - |

### Spotify

| Komponente | Pfad | Status | Notizen |
|------------|------|--------|---------|
| DeviceSelectorModal | `/components/spotify/device-selector-modal.tsx` | ✅ Standard | - |
| LibraryTab | `/components/spotify/library-tab.tsx` | ✅ Standard | - |
| OverviewTab | `/components/spotify/overview-tab.tsx` | ✅ Standard | - |
| PlaybackBar | `/components/spotify/playback-bar.tsx` | ✅ Standard | - |
| QueueWidget | `/components/spotify/queue-widget.tsx` | ✅ Standard | - |
| StatisticsTab | `/components/spotify/statistics-tab.tsx` | ✅ Standard | - |
| TopChartsTab | `/components/spotify/top-charts-tab.tsx` | ✅ Standard | - |

### Theme

| Komponente | Pfad | Status | Notizen |
|------------|------|--------|---------|
| ThemeProvider | `/components/theme-provider.tsx` | ✅ Standard | - |
| ThemeToggle | `/components/theme-toggle.tsx` | ✅ Standard | - |

---

## Seiten-Übersicht

### Auth-Seiten

| Seite | Pfad | Input-Types | Inkonsistenzen |
|-------|------|-------------|----------------|
| Sign-In | `/app/(auth)/sign-in/page.tsx` | Text, Password (2x) | ❌ Kein PasswordInput-Component |
| Sign-Up | `/app/(auth)/sign-up/page.tsx` | Text (3x), Password (2x) | ❌ Password-Toggle manuell implementiert |
| Forgot-Password | `/app/(auth)/forgot-password/page.tsx` | Text (1x) | ✅ OK |
| Reset-Password | `/app/(auth)/reset-password/page.tsx` | Password (2x) | ❌ Kein PasswordInput-Component |
| Verify-Email | `/app/(auth)/verify-email/page.tsx` | - | ✅ OK |

### Dashboard-Seiten

| Seite | Pfad | Components | Inkonsistenzen |
|-------|------|-----------|----------------|
| Dashboard | `/app/dashboard/page.tsx` | CardMetric, ChartMini | ❌ Keine Loading-States |
| Wetter | `/app/dashboard/wetter/page.tsx` | - | ❌ Kein Breadcrumb |
| Musik | `/app/dashboard/musik/page.tsx` | Spotify-Tabs | ❌ Kein Breadcrumb |
| Finanzen | `/app/dashboard/finanzen/page.tsx` | - | ❌ Kein Breadcrumb |
| Kalender | `/app/dashboard/kalender/page.tsx` | Calendar-Components | ❌ Kein Breadcrumb |
| Settings | `/app/dashboard/settings/page.tsx` | Tabs, Switch, Select | ❌ Password-Toggle inkonsistent |
| Account | `/app/dashboard/account/page.tsx` | - | ❌ Noch nicht implementiert |
| Admin | `/app/dashboard/admin/page.tsx` | - | ✅ Basis vorhanden |

---

## Inkonsistenzen-Analyse

### 🔴 Kritische Inkonsistenzen

#### 1. Passwort-Felder

**Problem:** Jede Seite implementiert Password-Toggle unterschiedlich

**Sign-In (sign-in/page.tsx:151-170):**
```tsx
<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    className="pr-10"
  />
  <button
    type="button"
    className="absolute inset-y-0 right-0 flex items-center rounded-md px-3"
    onClick={() => setShowPassword((prev) => !prev)}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

**Sign-Up (sign-up/page.tsx:252-274):**
```tsx
<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    className="pr-10"
  />
  <button
    type="button"
    className="absolute inset-y-0 right-0 flex items-center rounded-md px-3"
    onClick={() => setShowPassword((prev) => !prev)}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

**Settings (settings/page.tsx:651-673):**
```tsx
<div className="relative">
  <Input
    type={showWeatherKey ? "text" : "password"}
    className="pr-12"
  />
  <button
    type="button"
    className="absolute inset-y-0 right-0 flex items-center rounded-md px-3"
    onClick={() => setShowWeatherKey((prev) => !prev)}
  >
    {showWeatherKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

**Unterschiede:**
- ✅ Icon-Größe: Konsistent (h-4 w-4)
- ✅ Position: Konsistent (right-0)
- ❌ className: Inkonsistent (pr-10 vs pr-12)
- ❌ State-Variable: Unterschiedliche Namen (showPassword, showWeatherKey, etc.)
- ❌ Code-Duplizierung: 70+ Zeilen duplizierter Code

**Vorkommen:**
- sign-in/page.tsx: 2x (password, confirmPassword)
- sign-up/page.tsx: 2x (password, confirmPassword)
- reset-password/page.tsx: 2x (vermutlich)
- settings/page.tsx: 3x (weather-api-key, spotify-client-id, spotify-client-secret)

**Total: ~9 Duplikate** → **Sollte 1 Komponente sein**

#### 2. Input-Validierung

**Problem:** Keine konsistente Inline-Validierung

**Sign-Up:**
- ✅ Field-Level-Errors (`fieldErrors.username`)
- ❌ Keine Inline-Validierung während Eingabe
- ❌ Keine Success-States

**Settings:**
- ❌ Keine Field-Level-Errors
- ✅ Form-Level-Validierung
- ❌ Keine Inline-Validierung

**Forgot-Password:**
- ✅ Field-Level-Error (`fieldError`)
- ❌ Keine Inline-Validierung

#### 3. Loading-States

**Problem:** Inkonsistente Loading-Darstellung

**Sign-In Button:**
```tsx
<Button disabled={loading}>
  {loading ? "Wird angemeldet..." : "Anmelden"}
</Button>
```

**Sign-Up Button:**
```tsx
<Button disabled={loading}>
  {loading ? "Wird registriert..." : "Registrieren"}
</Button>
```

**Settings Buttons:**
```tsx
<Button disabled={savingWeatherSettings}>
  {savingWeatherSettings ? "Speichere..." : "Einstellungen speichern"}
</Button>
```

**Inkonsistenzen:**
- ❌ Kein Spinner-Icon
- ❌ Unterschiedliche Texte ("Wird angemeldet", "Speichere")
- ❌ Unterschiedliche State-Variable-Namen

#### 4. Form-Structure

**Problem:** Keine konsistente Form-Struktur

- ❌ Sign-In: Manuelles onSubmit
- ❌ Sign-Up: Manuelles onSubmit
- ❌ Settings: Manuelles onSubmit (pro Tab)
- ❌ Keine react-hook-form
- ❌ Keine Zod-Validierung

#### 5. Breadcrumbs

**Problem:** Breadcrumb-Komponente existiert, wird aber nicht verwendet

- ✅ Component: `/components/ui/breadcrumb.tsx`
- ❌ Nirgendwo verwendet
- ❌ Settings: Fehlt
- ❌ Account: Fehlt
- ❌ Admin: Fehlt
- ❌ Widget-Seiten: Fehlt

#### 6. Skeleton-Loading

**Problem:** Skeleton-Komponente existiert, wird aber kaum verwendet

- ✅ Component: `/components/ui/skeleton.tsx`
- ❌ Dashboard: Keine Skeletons für Metrics/Charts
- ❌ Settings: Keine Skeletons
- ❌ Auth: Fallback-Skeletons zu basic

### 🟡 Mittlere Inkonsistenzen

#### 7. Error-Handling

**Sign-In:**
```tsx
{error && (
  <NotificationBanner
    variant="error"
    title="Anmeldung fehlgeschlagen"
    description={error}
  />
)}
```

**Sign-Up:**
```tsx
{error && (
  <NotificationBanner
    variant="error"
    title="Registrierung fehlgeschlagen"
    description={error}
  />
)}
```

**Settings:**
```tsx
{weatherStatus && (
  <NotificationBanner
    variant={weatherStatus.type}
    title={weatherStatus.title}
    description={weatherStatus.description}
  />
)}
```

**Inkonsistenzen:**
- ✅ Component: Konsistent (NotificationBanner)
- ❌ State-Structure: Inkonsistent (string vs object)
- ❌ Title: Unterschiedlich

#### 8. Toast vs NotificationBanner

**Problem:** Keine klare Regel wann was verwendet wird

- Sign-In: NotificationBanner für Errors
- Sign-Up: NotificationBanner für Errors + Success
- Settings: NotificationBanner für Errors + Success
- ❌ Toast wird nirgendwo verwendet (obwohl Toaster im Layout)

**Sollte sein:**
- Toast: Kurze Feedback-Messages (Success, Info)
- NotificationBanner: Persistente Errors/Warnings

---

## Fehlende Komponenten

### High Priority

1. **PasswordInput** - Wiederverwendbare Passwort-Input mit Toggle
2. **ValidatedInput** - Input mit Inline-Validierung
3. **FormWrapper** - react-hook-form + Zod Integration
4. **LoadingSpinner** - Wiederverwendbarer Spinner
5. **CommandPalette** - Globale Suche (⌘K)

### Medium Priority

6. **SearchableSelect** - Select mit Search-Funktion
7. **DataTable** - Table mit Sortierung, Pagination
8. **LoadingScreen** - Full-Page-Loading
9. **ErrorBoundary** - Graceful Error-Handling
10. **MobileNav** - Mobile-Navigation (Sheet/Bottom-Nav)

### Low Priority

11. **NotificationBell** - Notifications-Center
12. **PageHeader** - Konsistenter Page-Header mit Breadcrumbs
13. **EmptyState** - Wiederverwendbare Empty-States
14. **ConfirmDialog** - Bestätigungs-Dialog

---

## Component-Usage-Map

### Input-Component

**Verwendet in:**
- sign-in/page.tsx: 1x (identifier)
- sign-up/page.tsx: 3x (username, name, email)
- forgot-password/page.tsx: 1x (identifier)
- reset-password/page.tsx: 0x (nur Password)
- settings/page.tsx: 7x (zip, country, apiKey, clientId, clientSecret)

**Total: 12 Verwendungen**

### Password-Input (manuell)

**Verwendet in:**
- sign-in/page.tsx: 1x (password)
- sign-up/page.tsx: 2x (password, confirmPassword)
- reset-password/page.tsx: 2x (vermutlich)
- settings/page.tsx: 3x (apiKey, clientId, clientSecret)

**Total: 8-9 Verwendungen**

### Button-Component

**Verwendet in:**
- Überall: ~50+ Verwendungen
- Varianten: default (Submit), outline (Secondary), ghost (Icon), destructive (Delete)

### CardMetric-Component

**Verwendet in:**
- dashboard/page.tsx: 4x

### NotificationBanner-Component

**Verwendet in:**
- sign-in/page.tsx: 2x (info, error)
- sign-up/page.tsx: 2x (success, error)
- forgot-password/page.tsx: 1x (success/error)
- settings/page.tsx: 2x (weather, spotify)

**Total: 7 Verwendungen**

---

## Zusammenfassung

### Statistiken

- **UI-Komponenten (shadcn):** 19
- **Layout-Komponenten:** 5
- **Widget-Komponenten:** 2
- **Feature-Komponenten:** 11
- **Seiten:** 13

### Probleme

- 🔴 **9x Passwort-Toggle dupliziert** → PasswordInput-Component erstellen
- 🔴 **12x Input ohne Validation** → ValidatedInput-Component erstellen
- 🔴 **13x Forms ohne react-hook-form** → FormWrapper-Component erstellen
- 🟡 **Breadcrumb vorhanden aber nicht verwendet** → Integrieren
- 🟡 **Skeleton vorhanden aber kaum verwendet** → Mehr verwenden
- 🟡 **Toast vorhanden aber nicht verwendet** → Strategie definieren

### Nächste Schritte

1. ✅ **Phase 0.2:** Dependencies installieren
2. ✅ **Phase 0.3:** Basis-Setup (Hooks, Utils)
3. ✅ **Phase 1.1:** Enhanced Input Components erstellen
4. Alle Duplikate durch neue Komponenten ersetzen

---

*Erstellt: 2025-11-18*
*Letzte Aktualisierung: 2025-11-18*
