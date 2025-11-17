# Dashboard Design Guidelines

Diese Guidelines definieren ein konsistentes, modernes Designsystem für ein webbasiertes Dashboard auf Basis von **shadcn/ui** im React/Next.js-Umfeld. Sie vereinen die Stärken bekannter Dashboards wie Stripe, Linear, Grafana, Datadog, Mixpanel & Co. in einem einheitlichen System.

## Zielgruppe

- **Designer:innen** – UX/UI, Visual Design, Design System
- **Entwickler:innen** – Frontend (React/Next, TypeScript, shadcn/ui, Tailwind)
- **Product Owner / Produktmanager:innen** – Struktur, Priorisierung, UX-Entscheidungen

## Technologie

- **Framework:** React / Next.js
- **UI-Basis:** shadcn/ui – zugängliche, anpassbare Komponenten als „Source of Truth“ für das Designsystem
- **Styling:** Tailwind CSS (Utility-Klassen, Theming, Dark Mode)
- **Komponenten-Organisation:** `/components/ui/*` nach shadcn-Konvention

---

## Design Principles

### 1. Konsistenz

- Nutze ausschließlich Komponenten aus dem gemeinsamen Designsystem (`@/components/ui/*`) oder klar dokumentierte Ableitungen.
- Gleiche Patterns für gleiche Probleme:
  - Immer dieselbe Art von Filterleiste
  - Einheitliche Gestaltung von KPI-Karten
  - Einheitliche Fehlermeldungen
- Orientierung an Stripe & Shopify: wiederkehrende Layouts, konsistente Card- und Tabellenmuster.

### 2. Klarheit & Fokus auf Daten

- Primäres Ziel von Dashboards ist **Verstehen**, nicht „Beeindrucken“:
  - Klar lesbare Charts (keine unnötigen 3D-Effekte)
  - Wenige, gut gewählte KPI-Kennzahlen pro Screen
  - Deutliche Unterscheidung von Primär- und Sekundärinformationen
- Angelehnt an Linear: minimalistische, ruhige Oberflächen, starke Typografie, wenige, gezielte Farben.

### 3. Informationshierarchie

- Wichtigste Elemente oben/links, weniger wichtige weiter unten/rechts.
- **Reihenfolge auf Overview-Seiten:**
  1. Globale Filter (Zeitraum, Scope, Suchfeld)
  2. KPI-Karten (max. 4–6)
  3. Wichtige Charts (Trends, Funnels)
  4. Tabellen / Detaildaten (listenartig, sortierbar)
- Wie in Grafana/Datadog: Daten in klar abgegrenzten Panels mit eigener Headline, Controls und Content.

### 4. Minimalismus vs. Informationsdichte

- Starte minimal (nur nötige Kennzahlen) und biete zusätzliche Details über:
  - Sekundäre Tabs
  - Expand/Collapse (Accordions)
  - Detail-Panels (Drawer/Sheet)
- Linear als Vorbild: hohe Informationsdichte, aber wenig visuelles Rauschen durch reduzierte Chrome, klare Abstände und Dark Mode.

### 5. Inspirationsquellen

- **Stripe Dashboard:** klare Hauptnavigation, strukturierte KPI-Karten & Tabellen, starke Keyboard-Shortcuts.
- **Linear:** fokussierter Dark-Mode, schnelle Interaktion, starke Typografie, wenig visuelles Rauschen.
- **Grafana & Datadog:** flexible Panel-Struktur, gute Best Practices für Monitoring-Dashboards, klare Stat-Panels.
- **Mixpanel/Amplitude:** gute Muster für Funnel-/Retention-Analysen und Filter/Time-Range-Kombinationen.

---

## Layout & Grid

### Grundlegendes Layout

- **Maximale Content-Breite:** `max-w-7xl` oder `max-w-[1200px]` zentriert.
- **Seitenränder:**  
  - Desktop: `px-8` links/rechts  
  - Tablet: `px-4`  
  - Mobile: `px-4`
- **Vertikale Abstände:**  
  - Zwischen großen Sektionen: `mt-10`–`mt-12`  
  - Zwischen Karten/Panels: `gap-4`–`gap-6`
- **Grid-System:**
  - Desktop: 12-Spalten Grid (`grid-cols-12`), Gutter `gap-4`
  - Mobile: 1 Spalte, Elemente untereinander
  - Panels nutzen in der Regel 3–6 Spalten (z.B. KPI-Karte `col-span-3`)

### Breakpoints / Responsiveness

- **Mobile (≤ 640px):**
  - Einspaltig
  - Navigation hinter Burger-Menu (`Sheet`)
  - KPI-Karten gestapelt
- **Tablet (641–1024px):**
  - Zwei Spalten möglich (`md:grid-cols-2`)
  - Seitenleiste ggf. einklappbar
- **Desktop (≥ 1024px):**
  - 3–4 Spalten (KPIs, Charts, Tables)
  - Permanente Side-Navigation + Top-Bar

### Typische Dashboard-Layouts

1. **Overview (Stripe-/Shopify-inspiriert):**  
   - Top-Bar mit globalen Filtern (Zeitraum, Suche, Scope)
   - Erste Zeile: 3–4 KPI-Karten
   - Zweite Zeile: Hauptchart (z.B. Umsatz über Zeit)
   - Dritte Zeile: wichtigste Tabelle (z.B. Transaktionen, Nutzer)

2. **Details (Linear-inspiriert):**  
   - Linke Spalte: Kontextnavigation (z.B. Tabs: Overview / Events / Settings)
   - Rechte Spalte: Detailinhalt (Formulare, Timeline, Activity Log)
   - Sticky Header mit Titel, Primary Action, Status-Badge

3. **Monitoring (Grafana-/Datadog-inspiriert):**  
   - Mehrere Panels in einem Grid (Stat-Panels, Time Series, Heatmaps)
   - Panels konsistent beschriftet, gleiche Zeitfilter
   - Kritische KPIs oben, sekundäre Metriken darunter

---

## Navigation

### Top-Navigation vs. Side-Navigation

- **Top-Navigation** (z.B. Stripe):  
  - Für wenige, grobe Produktbereiche (z.B. *Dashboard, Berichte, Einstellungen*).
- **Side-Navigation:**  
  - Für tiefe Informationsarchitekturen (z.B. Monitoring-Ansichten, komplexe Bereiche).
  - Kollabierbar, um auf kleineren Screens Platz zu sparen.

**Empfehlung:** Kombination aus Top-Bar (Kontext + Global Actions) und Left Sidebar (App-Navigation).

### Hauptnavigation

- **shadcn-Komponenten:** `NavigationMenu` oder eigene Sidebar auf Basis von `Button`/`Link`/`ScrollArea`.
- Elemente:
  - Logo / App-Name
  - Primäre Bereiche (max. 6)
  - Sektionen mit Titel (optional, bei komplexeren Strukturen)

**Regeln:**

- Labels ein- bis zweisilbig, in Klartext, keine internen Abkürzungen.
- Aktive Route klar hervorgehoben (Background + linke Border).
- Icons nur zusammen mit Text-Label, nie allein.

### Sekundärnavigation / Tabs

- **Komponente:** `Tabs`
- Einsatz:
  - Unterteilung einer Seite in logisch zusammenhängende Bereiche (z.B. *Overview, Events, Settings*).
  - Keine Navigation zwischen völlig unterschiedlichen Features.
- Darstellung:
  - Tabs horizontal unterhalb des Page Headers.
  - Aktiver Tab mit Primary-Farbe oder Bottom-Border.

### Breadcrumbs

- **Komponente:** `Breadcrumb`
- Einsatz:
  - Für tiefe Hierarchien (z.B. *Organisation / Projekt / Dashboard / Detail*).
- Position:
  - Oberhalb des Page Titles, links ausgerichtet.
- Verhalten:
  - Letztes Breadcrumb-Element nicht klickbar (aktuelle Seite).
  - Mobile ggf. nur 2–3 letzte Stufen anzeigen.

### Zustände & Interaktion (Navigation)

- **States:**
  - Default: dezenter Text, kein Hintergrund
  - Hover: leicht erhöhter Hintergrund (`bg-accent`), Cursor-Pointer
  - Active: Hintergrund + linke Border oder dominante Textfarbe
  - Disabled (selten nötig): entgraut, kein Hover
- **Keyboard:**
  - Fokus-Reihenfolge von links nach rechts, oben nach unten.
  - `Tab` navigiert zwischen Navigationselementen, `Enter`/`Space` aktiviert.
- **ARIA:**
  - `aria-current="page"` für aktive Navigationseinträge.
  - `role="tablist"`, `role="tab"`, `aria-selected` für Tabs.

---

## Farben & Theming

### Basis-Farbpalette

An shadcn/ui-Tokens angelehnt:

- **Primary:** Hauptaktionsfarbe (Buttons, aktive Tabs, wichtige Links)
- **Secondary:** neutrale Aktionsfarbe (sekundäre Buttons)
- **Accent:** dezente Hervorhebung (Hover-Flächen, Badges)
- **Background:** Seitenhintergrund
- **Foreground:** Standard-Text
- **Muted:** Flächen für sekundäre Infos
- **Border:** Linien, Trennungen
- **Destructive:** Fehler, kritische Aktionen
- **Success, Warning, Info:** Statusfarben

### Light/Dark Mode

- **Light Mode:** Standard, hohe Lesbarkeit, neutrale Hintergründe.
- **Dark Mode:** optional, besonders für Monitoring/Dev-Kontexte (Linear/Grafana-Stil).

Regeln:

- Gleiche Informationshierarchie in beiden Modi.
- Keine rein farb-basierten Codes (immer auch Icon/Form/Label).
- Kontrast in beiden Modi testen (WCAG 2.1 AA).

### Kontrastvorgaben

- Text auf Hintergrund mindestens **AA** (4.5:1), Überschriften und große KPIs mindestens 3:1.
- Disabled-States dürfen weniger Kontrast haben, müssen aber unterscheidbar sein.

### Statusfarben im Dashboard

- **Success (grün):** erfolgreiche Operationen, positive Trends (Umsatz ↑).
- **Warning (gelb/orange):** Aufmerksamkeit nötig, aber kein unmittelbarer Fehler.
- **Error/Destructive (rot):** Fehlermeldungen, kritische Zustände.
- **Info (blau):** neutrale Hinweise.

Konsistent anwenden in:

- Badges (Status eines Objekts)
- Tabellentext/Feldstatus
- Charts (z.B. Linie für „Error Rate“ rot)

---

## Typografie

### Basis

- **Primärfont:** Sans-Serif (z.B. `Inter`, `system-ui`).
- **Mono:** Monospaced für Code/IDs/numerische Spalten (z.B. `ui-monospace`).

### Hierarchie

- **H1 (Page Title):** `text-2xl font-semibold`
- **H2 (Section Title):** `text-xl font-semibold`
- **H3 (Subsection):** `text-lg font-semibold`
- **Body:** `text-sm` bis `text-base`, normal
- **Caption/Meta:** `text-xs text-muted-foreground`

### Typische Kombinationen für Dashboards

- **KPI-Tiles:**
  - Label: `text-xs uppercase tracking-wide text-muted-foreground`
  - Wert: `text-2xl font-semibold`
  - Delta: `text-xs flex items-center` + Pfeil-Icon + Statusfarbe

- **Tabellenüberschriften:**
  - `text-xs font-medium uppercase tracking-wide text-muted-foreground`
  - Immer linksbündig, außer rechte Spalte für Aktionen.

- **Filter/Controls:**
  - Label: `text-xs font-medium text-muted-foreground`
  - Input-Text: `text-sm`

---

## Komponenten / Bedienelemente (Controls)

### Allgemeine Regeln

- **Spacing innen:** Standard `px-3 py-2` für Controls.
- **Icon-Größe:** 16–20px, links neben Text (außer speziell definiert).
- **Fokus:** Deutlicher Fokus-Ring (`outline outline-2 outline-ring`).

---

### Buttons

**Komponente:** `Button`

**Verwendungszweck:**

- Primäre Aktionen (Form absenden, „Create“, „Save“)
- Sekundäre Aktionen („Cancel“, „More…“)
- Icon-Only nur für sehr bekannte Aktionen (z.B. „Refresh“, „Settings“)

**Varianten:**

- `variant="default"` – Primärbutton (Primary-Farbe, prominent)
- `variant="secondary"` – Sekundärbutton, dezenter Hintergrund
- `variant="outline"` – Neutrale Aktion, besonders in Toolbars
- `variant="ghost"` – Icon-Buttons in dichten Layouts
- `variant="destructive"` – Löschaktionen, kritische Operationen

**Größen:**

- `size="default"` – Standard
- `size="sm"` – in Tabellenzeilen, Toolbars
- `size="icon"` – nur Icon, quadratisch

```tsx
<Button variant="default">
  Create report
</Button>

<Button variant="outline" size="sm">
  Export CSV
</Button>

<Button variant="ghost" size="icon" aria-label="Refresh data">
  <RefreshCw className="h-4 w-4" />
</Button>
```

**Zustände:**

- Default: klare Primary-Farbe
- Hover: etwas dunklere/hellere Variante, kein übertriebener Shadow
- Active: leichte Skalierung oder dunklerer Hintergrund
- Disabled: reduzierte Deckkraft, kein Hover
- Loading: Spinner (z.B. Icon ersetzen), Button bleibt gleiche Breite

**Best Practices:**

- Pro View maximal **ein** Primärbutton.
- Vermeide Text wie „Hier klicken“ – immer konkrete Handlung („Bericht speichern“).
- Zerstörerische Aktionen nur als `destructive` und mit Bestätigung (AlertDialog).

---

### Formularfelder

**Komponenten:**

- `Input`, `Textarea`
- `Select`, Combobox (z.B. auf Basis `Command`)
- `Checkbox`, `RadioGroup`
- `Switch`, `Slider`
- `Popover` + Kalenderkomponente als DatePicker

#### Allgemeine Regeln

- Label immer über dem Feld, `text-xs font-medium`.
- Hilfetext optional unter dem Feld, `text-xs text-muted-foreground`.
- Fehlermeldung in Rot + Icon, kurz und eindeutig.

#### Input / Textarea

**Einsatz:**

- Freitext, E-Mail, Zahlen (mit Validierung).
- `Textarea` für mehrzeilige Inhalte (Kommentare, Beschreibungen).

**Visuelles Design:**

- Border: `border border-input rounded-md`
- Innenabstand: `px-3 py-2`
- Placeholder: dezent (kein Ersatz für Label).

**States:**

- Focus: Border + Ring in Primary-Farbe
- Error: Border in Destructive-Farbe + Fehlermeldung darunter.

#### Select / Combobox

**Einsatz:**

- `Select` für kurze, bekannte Listen (z.B. Status, Rolle).
- `Combobox` für lange Listen mit Suche (z.B. Nutzer, Projekte).

**Verhalten:**

- Immer Tastatur-bedienbar (`ArrowDown`, `Enter`).
- Aktuelle Auswahl klar sichtbar, Option „Clear“ wenn sinnvoll.

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Zeitraum wählen" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="7d">Letzte 7 Tage</SelectItem>
    <SelectItem value="30d">Letzte 30 Tage</SelectItem>
    <SelectItem value="custom">Benutzerdefiniert…</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox / Radio / Switch

- **Checkbox:** Mehrfachauswahl, Feature-Toggles in Listen.
- **RadioGroup:** Exklusive Auswahl (z.B. Zeitaggregation: Tag/Woche/Monat).
- **Switch:** Sofortiger On/Off-Status (z.B. „Alerts aktivieren“).

Regeln:

- Immer mit Label (klickbar) und optionaler Kurzbeschreibung.
- Switch nur, wenn Änderung sofort wirkt (kein Submit nötig).

#### Slider

- Für Wertebereiche (z.B. Schwellwerte, Zeitfenster).
- Immer min/max-Werte textlich darstellen.

#### DatePicker

- Kombination aus `Popover` + `Input` + Kalenderkomponente.
- Unterstützt Presets (Heute, letzte 7 Tage, letzter Monat) wie bei Stripe, Mixpanel etc.

---

### Filter & Suche

**Komponenten:**

- `Input` mit Icon
- `Badge` oder `Toggle` für Filterchips
- `Popover` oder `Sheet` für Advanced-Filter
- Optional: `Command`/`CommandDialog` für globale Suche

#### Search-Input

- In Top-Bar oder über der Haupttabelle.
- Icon (Lupe) links im Feld.
- Placeholder beschreibt Suchbereich („Transaktionen durchsuchen“).

```tsx
<div className="relative w-full max-w-sm">
  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input className="pl-9" placeholder="Transaktionen durchsuchen" />
</div>
```

#### Filter-Chips

- `Badge` oder `Toggle` mit klaren Labels (z.B. „Aktiv“, „Fehlerhaft“).
- Aktive Filter deutlich hervorgehoben (farbiger Hintergrund).
- „Alle Filter zurücksetzen“-Aktion sichtbar anbieten.

#### Advanced-Filter-Panel

- `Sheet` von rechts oder `Popover` unter einem „Filter“-Button.
- Enthält Formular mit mehreren Feldern (Status, Zeitraum, Typ, etc.).
- „Anwenden“ + „Zurücksetzen“ Buttons am unteren Rand.

---

### Tables & Data Grids

**Komponente:** `Table` (+ z.B. `@tanstack/react-table`)

#### Aufbau

- **Header:** klare Spaltennamen, sortierbare Spalten mit Sortier-Icon.
- **Body:** Zeilen mit Hover-Hintergrund, clickable Row optional.
- **Footer / Toolbar:**
  - Paginierung
  - Zeilenzahl-Auswahl
  - Quick-Filter / Suche

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Datum</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Betrag</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Rows */}
  </TableBody>
</Table>
```

#### Verhaltensregeln

- **Sortierung:** Standardmäßig nach wichtigster Metrik (z.B. Datum).
- **Paginierung:** Standard, keine Infinite Scroll bei Business-Daten.
- **Inline-Editing:** Nur für einfache Felder, mit klarer Bestätigung (Check/X).

#### Best Practices

- Dichte, aber lesbare Zeilen (z.B. `py-2`).
- Actions rechtsbündig (z.B. „Details“, „Bearbeiten“).
- Lange Texte truncaten, mit Tooltip auf Hover.

---

### Karten & KPIs

**Komponenten:** `Card`, `Badge`, `Separator`

**Ziel:** Schnelles Verständnis wichtiger Kennzahlen, inspiriert von Stripe-Statistiken, Grafana-Stat-Panels und Shopify-Dashboards.

#### Struktur einer KPI-Karte

- Oben: Label (klein, uppercase)
- Mitte: KPI-Wert (groß, prägnant)
- Unten: Delta/Trend (inkl. Zeitraum, z.B. „+12 % vs. letzte Woche“)

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
      Umsatz (30 Tage)
    </CardTitle>
    <Badge variant="outline">EUR</Badge>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-semibold">124.380 €</div>
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
      <span className="text-emerald-600">+12,4 %</span>
      <span>vs. vorheriger Zeitraum</span>
    </p>
  </CardContent>
</Card>
```

#### Regeln

- Max. 4–6 KPI-Karten in der ersten Zeile.
- Alle Karten gleiche Höhe und Ausrichtung.
- Zeitkontext immer angeben (z.B. „Heute“, „Letzte 7 Tage“).

---

### Dialoge & Overlays

**Komponenten:** `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`

#### Dialog

- Für komplexere, aber nicht destruktive Aktionen (Formulare, Details).
- Blockiert Hintergrund, Fokus bleibt im Dialog.

#### AlertDialog

- Für kritische Aktionen (Löschen, Deaktivieren).
- Immer mit klarer Erklärung und `destructive` Button.

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Konto löschen</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Konto wirklich löschen?</AlertDialogTitle>
      <AlertDialogDescription>
        Diese Aktion kann nicht rückgängig gemacht werden.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground">
        Löschen
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Sheet / Drawer

- Seitliches Panel, z.B. für:
  - Detail-Ansicht eines Listenelements
  - Erweiterte Filter
  - Einstellungen

#### Popover

- Kleine Overlays für sekundäre Informationen (z.B. „Weitere Optionen“, Color Pickers).

#### Tooltip

- Kurzinfos zu Icons/Shortcuts.
- Keinerlei kritische Informationen nur im Tooltip.

---

### Feedback & Status

**Komponenten:** `Toast`, `Alert`, `Skeleton`, `Progress`

#### Toast

- Kurz, oben rechts oder unten rechts.
- Max. 2–3 gleichzeitig sichtbar.
- Varianten: success, error, info.

#### Alert

- Inline-Feedback im Content (z.B. Hinweis „Daten nicht aktuell“).

#### Loading (Skeleton/Spinner)

- Skeletons für Listen/Karten und Tabellenzeilen.
- Spinner nur für Buttons oder sehr kleine Bereiche.

#### Error States

- Deutliche Texte, erklären *was* falsch ist und *wie* man es behebt.
- Optional: „Retry“-Button in Nähe der Fehlermeldung.

---

## Zustände & Statusbilder

### Loading States

- **Seitenweise:**  
  - Skeletons an Position der späteren Inhalte.
- **Komponentenweise:**  
  - Button mit Spinner, disabled.  
  - Tabellen: Skeleton-Zeilen.

### Empty States

- Kurzer, hilfreicher Text:
  - „Noch keine Daten für diesen Zeitraum.“
  - „Es wurden keine Transaktionen gefunden.“
- Optionales Icon/Illustration.
- Primäre CTA, z.B.:
  - „Filter zurücksetzen“
  - „Datenerfassung einrichten“

### Error States

- Inline-Fehler bei Formularfeldern: kurzer Text, roter Rahmen.
- Globale Fehler (z.B. API Down): `Alert` oberhalb des Hauptinhalts.
- Optional: Offline-Hinweis (z.B. Banner oben).

---

## Tabellen & Datenvisualisierung

### Tabellen

- **Header:** Sticky bei langen Tabellen, wenn sinnvoll.
- **Zeilen:** Hover-Hintergrund, Zeile optional klickbar (aber dann nicht gleichzeitig Checkbox für Mehrfachauswahl).
- **Zebra-Stripes:** Nur, wenn Zeilen sehr dicht sind – ansonsten Hover reicht.

### Paginierung vs. Infinite Scroll

- **Paginierung** (Standard):
  - Klarer Überblick über Seitenzahl.
  - Gut für Reporting & Business-User.
- **Infinite Scroll** nur für unkritische, „endlose“ Listen.

### Filter- und Suchmuster

- Filter oben, klar erkennbar.
- Aktive Filter als Chips darstellen.
- „Filter löschen“-Aktion immer fokussiert erreichbar.

### Charts (allgemeine Guidelines)

- **Bevorzugte Chart-Typen:**
  - Line/Area Charts für Zeitreihen
  - Bar Charts für Vergleiche (Kategorien)
  - Donut/Pie nur sparsam und mit wenigen Kategorien
  - Stat-Kacheln für Einzelwerte

- **Farben & Legenden:**
  - Primary-Farben für Haupt-Metriken
  - Sekundäre Linien in abgeschwächten Tönen
  - Gut lesbare Legende mit klaren Einheiten

- **Interaktion:**
  - Tooltips mit Datum/Uhrzeit, Wert, Einheit
  - Hover-States, die Linie hervorheben
  - Zoom-/Brush-Funktionen bei Zeitreihen (wenn relevant)

---

## Accessibility (A11y)

### Fokus-Indikatoren

- Deutlich sichtbarer Fokus-Ring für alle interaktiven Elemente.
- Kein Entfernen des Standard-Fokus ohne Ersatz.

### Tastaturbedienbarkeit

- Alle Komponenten müssen per Tastatur vollständig bedienbar sein.
- Reihenfolge: Header → Navigation → Hauptinhalt → Footer.
- Dialoge fangen den Fokus ein und geben ihn beim Schließen zurück.

### Kontrast

- Farben auf AA-Niveau testen (insbesondere Text auf Hintergrund).
- State-Veränderungen nicht nur über Farbe auszeichnen (z.B. Icon, Border).

### ARIA-Attribute

- `role="dialog"`, `aria-modal="true"` für Dialoge.
- Tabs: `role="tablist"`, `role="tab"`, `aria-controls`, `aria-selected`.
- Tabellen: `<table>`, `<thead>`, `<tbody>` semantisch korrekt.
- Icons ohne sichtbaren Text: `aria-label` oder `aria-hidden`.

### Screenreader-Texte

- Für Icon-Only Buttons (z.B. Refresh, Export) immer `aria-label`.
- Leere States beschreiben:
  - „Keine Daten im ausgewählten Zeitraum“ statt nur „Keine Daten“.

---

## Beispiele & Patterns

### 1. Overview Dashboard

**Layout:**

- Top-Bar:
  - Seitentitel „Dashboard“
  - Zeitraum-Select („Letzte 30 Tage“)
  - Search-Input
- Erste Zeile:
  - 4 KPI-Karten (Umsatz, Bestellungen, aktive Nutzer, Fehlerquote)
- Zweite Zeile:
  - Line Chart „Umsatz über Zeit“
- Dritte Zeile:
  - Tabelle „Top-Kunden“ mit Pagination

**Ideen aus Referenzen:**

- Stripe: Struktur der Overview-Seite mit klaren KPIs und Tabellen.
- Shopify: klare Trennung von Overview-KPIs und Listenansicht.

### 2. Detailseite (Objekt-Detail)

**Layout:**

- Breadcrumb oben
- H1: Objektname (z.B. „Kunde: ACME Inc.“)
- Rechts daneben: Status-Badge, Primäraktion („Bearbeiten“)
- Tabs: Overview / Events / Einstellungen
- Overview-Tab:
  - Linke Spalte: Details (Form-like Cards)
  - Rechte Spalte: Aktivitätshistorie (Timeline)

**Ideen aus Referenzen:**

- Linear: klare Headerzeile mit Titel, Status und Aktionen.
- Intercom: gute Muster für Activity/Conversation-Historien.

### 3. Monitoring Dashboard

**Layout:**

- Filter-Leiste (Service, Region, Zeitraum)
- Grid mit Panels (2–3 Spalten):
  - Stat-Panels (CPU, RAM, Error Rate)
  - Time-Series Charts
  - Event-Log Tabelle

**Ideen aus Referenzen:**

- Grafana/Datadog: Panel-basierte Darstellung, hervorgehobene Stat-Panels.
- Stripe Radar/Monitoring-Bereiche: klare Gefahr-/Warn-Visualisierungen.

---

## Anhang

### Übersicht verwendeter shadcn/ui Komponenten

- **Layout & Navigation**
  - `NavigationMenu` – Hauptnavigation
  - `Breadcrumb` – Pfadnavigation
  - `Tabs` – Sekundäre Navigation
  - `ScrollArea` – scrollbare Container
- **Typografie & Struktur**
  - `Card`, `Separator`, `Badge`
- **Formulare**
  - `Button`, `Input`, `Textarea`
  - `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`
  - `Label`, `Form`
- **Datenanzeige**
  - `Table` – Tabellen / Data Grids
  - `Skeleton` – Loading States
- **Overlays & Dialoge**
  - `Dialog`, `AlertDialog`
  - `Sheet`, `Popover`, `Tooltip`
  - `DropdownMenu`
- **Feedback**
  - `Toast`, `Alert`, `Progress`

### Glossar

- **KPI:** Key Performance Indicator – zentrale Kennzahl.
- **Overview:** Übersichtsseite mit wichtigsten Metriken.
- **Detailseite:** Seite für ein einzelnes Objekt (z.B. Kunde, Projekt).
- **Panel:** Abgegrenzter Bereich in einem Dashboard (Chart, Karte, Tabelle).
- **A11y:** Accessibility (Barrierefreiheit).

### Stil- und Qualitätsanforderungen

- Halte dich an diese Guidelines, bevor du neue Patterns einführst.
- Jede neue Komponente oder Variation muss:
  - einen dokumentierten Einsatzzweck haben,
  - mit bestehenden Komponenten konsistent sein,
  - auf Desktop und Mobile getestet sein,
  - grundlegende A11y-Anforderungen erfüllen.
- Bei Unsicherheit: orientiere dich an den Referenz-Dashboards (Stripe, Linear, Grafana, Datadog, Mixpanel, Amplitude) und überführe Patterns bewusst in dieses einheitliche, shadcn/ui-basierte System.
