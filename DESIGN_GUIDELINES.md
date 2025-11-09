# Dashboard Design-Richtlinien

## Sprache & Inhalte
- Alle Texte, Fehlermeldungen und E-Mails werden auf Deutsch mit korrekten Umlauten (ä, ö, ü, ß) und klarer Nutzeransprache verfasst.
- Hinweise sind kurz, beschreiben den konkreten nächsten Schritt und verwenden aktive Verben (z. B. „Bestätige deine E-Mail-Adresse“).
- Hilfetexte werden als Tooltips neben dem Label eingebunden, nicht als Platzhalter im Feld.

## Farb- & Themekonzept (WCAG 2.2 AA)
- Light Theme basiert auf neutralen Grautönen; Primärfarbe ist `hsl(222 85% 45%)`. Dark Theme nutzt tiefe Grautöne und `hsl(174 84% 45%)` als Akzent.
- Semantische Farben sind fest definiert und erfüllen AA-Kontrast:
  - Success `hsl(142 70% 36%)`
  - Warning `hsl(32 95% 44%)`
  - Error `hsl(0 72% 51%)`
  - Info `hsl(221 83% 53%)`
- Fokus, Hover und Ring-Zustände greifen auf die Primärfarbe zurück (`ring-2 ring-primary`), Ausnahmen nur bei destruktiven Aktionen.
- Vorder- und Hintergrundfarben müssen stets ein Kontrastverhältnis ≥ 4,5:1 erreichen; dunkle Texte auf hellen Flächen und umgekehrt.
- Der Theme-Wechsel erfolgt über einen Toggle/Switch mit Sonne links und Mond rechts; der Zustand ist klar erkennbar und lässt sich per Tap oder Tastatur umschalten.

## Komponenten & Layout
- shadcn/ui ist die Basis: Cards, Buttons, Inputs, Tooltip, Select, Skeleton, NotificationBanner etc. Keine rohen HTML-Kontrollen, sofern es eine shadcn-Variante gibt.
- Layouts skalieren fluid (`grid`, `flex`, `auto-fit`) von 320 px bis Desktop. Seitenabstände mindestens `p-4`, auf größeren Viewports `p-6`.
- Navigationsleisten sind scrollbar oder stapeln auf schmalen Bildschirmen; keine festen Höhen erzwingen.
- Links oben steht immer das Branding `vyrnix.net` zusammen mit dem Start-Icon; der Text ersetzt generische "Dashboard"-Labels.
- Die Sidebar lässt sich über ein Icon komprimieren. Im kompakten Modus bleiben ausschließlich Icons sichtbar und der Hauptbereich erhält zusätzliche Breite.
- Das Benutzer-Icon, das das Menü öffnet, entspricht dem Menü-Avatar (`rounded-2xl`, türkiser Hintergrund, Initialen in Versalien).
- Karten besitzen großzügig Radius (`rounded-2xl`), Schatten (`shadow-sm` bzw. `shadow-xl` bei Hover) und reagieren mit Farbe/Bewegung auf Fokus und Hover.

## Notifications & Feedback
- Alle Statusmeldungen verwenden `NotificationBanner` mit den Varianten `info`, `success`, `warning`, `error`. Farben, Icons und Typografie werden dadurch konsistent gesteuert.
- Meldungen enthalten optional Titel + Beschreibung + Aktionen (Buttons/Links). Text bleibt neutral schwarz/weiß, Farbakzente übernehmen Border und Icon.
- Banner sind für schmale Container optimiert: Icon, Text und Aktionen stapeln sich vertikal, Aktionen dürfen 100% Breite einnehmen.
- Erfolg/Fehler-Kommunikation wird zusätzlich zu Farbe immer über Text und Icon vermittelt, damit Screenreader-Nutzende und Menschen mit Sehschwäche informiert sind.
- Im Fehlerfall `role="alert"`, sonst `role="status"`; Buttons im Banner schließen oder lösen direkt die empfohlene Handlung aus (z. B. „E-Mail erneut senden“).

## Formulare & Interaktion
- Inputs nutzen `Label` und optional `Description/Tooltip`. Feldbeschreibungen erscheinen nur, wenn ein echter Mehrwert besteht und diese keine offensichtliche Funktionen beschreiben; Fehlertexte stehen jeweils direkt unter dem Feld.
- Platzhalter in Eingabefeldern sind untersagt. Relevante Hinweise stehen als Label, Description oder Tooltip zur Verfügung, damit Screenreader dieselben Informationen erhalten.
- Auswahlfelder werden mit dem shadcn `Select` umgesetzt. Native `<select>` kommen nur zum Einsatz, wenn Barrierefreiheit dadurch verbessert wird.
- Passwortstärke nutzt Balken + Klartext. Farbzuordnung: schwach = `text-destructive`, solide = `text-warning`, stark = `text-success`.
- Buttons signalisieren Status: „Wird gesendet …“, „Aktualisieren“, „Speichern“. Fortlaufende Aktionen (z. B. Resend) kombinieren Icon + Spinner.
- Interaktive Icons (z. B. Passwort anzeigen) erhalten `aria-pressed`, sichtbare Fokusrahmen (`focus-visible:ring-2`) und Tastaturzugänglichkeit.

## Skeletons & Ladezustände
- Jeder Datenbereich bekommt einen eigenen `loading.tsx`, der mit dem shadcn `Skeleton` gestaltet wird (z. B. Dashboard-Übersicht, Konto-Einstellungen).
- Skeletons spiegeln die spätere Struktur (Grids, Cards, Buttons), nutzen weiche Übergänge (`animate-pulse`) und vermeiden harte Sprünge beim Einblenden.
- Async-Komponenten werden – falls sinnvoll – zusätzlich mit Suspense-Fallbacks versehen, damit auch Teilbereiche freundlich laden.

## Motion & Mikrointeraktionen
- Bewegungen erfolgen subtil, performant und respektieren `prefers-reduced-motion` (Tailwind `motion-safe`/`motion-reduce` Klassen).
- Diagramme animieren nur Höhe/Opacity der Balken (`transition-[height,opacity] duration-500`). Keine aufwendigen Keyframes nötig.
- Fokus- und Hover-Zustände bleiben immer sichtbar, Animationen dürfen nie alleinige Informationsträger sein.

## Barrierefreiheit & Datenformat
- Datums-, Währungs- und Temperatureinheiten werden mit `Intl` bzw. `toLocaleString("de-DE")` formatiert.
- Buttons oder Links mit Icons enthalten `aria-label` bzw. sichtbare Labels.
- E-Mails und Systemnachrichten liefern immer CTA-Buttons plus Klartext-Link als Fallback.
