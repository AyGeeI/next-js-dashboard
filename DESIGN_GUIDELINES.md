# Dashboard Design-Richtlinien

## Sprache & Inhalte
- Deutsch mit korrekten Umlauten (ä, ö, ü, ß) auf allen Seiten, in E-Mails und im Dashboard verwenden.
- Klare, kurze Texte bevorzugen; Hilfetexte statt Platzhalter nutzen.
- Status- und Fehlermeldungen sollen konkrete Handlungen empfehlen (z. B. "Bestätige deine E-Mail-Adresse").

## Farb- und Themekonzept
- Light Theme: Graustufen für Flächen/Typografie, Neonblau (`hsl(210 100% 45%)`) als einzige Akzentfarbe.
- Dark Theme: Graustufen für Flächen/Typografie, Neon-Türkis (`hsl(174 95% 52%)`) als einzige Akzentfarbe.
- Keine weiteren Farbcodes für Stati verwenden; Differenzierung über Helligkeit, Opazität oder Typografie lösen.
- Ring-, Fokus- und Hover-Zustände nutzen denselben Akzentfarbton, um Konsistenz zu wahren.

## Komponenten & Layout
- shadcn/ui-Komponenten als Grundlage nutzen (Card, Button, Input, Tooltip usw.).
- Layouts müssen von Mobil (320 px) bis Desktop flüssig skalieren (flex-col -> lg:flex-row, auto-fit Grids).
- Navigationsbereiche auf kleinen Viewports stapeln oder als Scroll-Row ausgeben; keine festen Höhen erzwingen.
- Karten/Widgets nutzen großzügige Abstände (`p-4+`) und reagieren auf Hover mit Graustufen-Änderungen.

## Formulare & Interaktion
- Keine Platzhaltertexte; Kontext über Labels und kurze Hilfetexte (`text-xs text-muted-foreground`) geben.
- Tooltips per `TooltipProvider` mit `delayDuration <= 150 ms` konfigurieren, damit Hinweise sofort erscheinen.
- Passwort-Anforderungen visuell über Balken + Klartext erklären; Farbunterschiede nur über Graustufen/Akzent.
- Buttons mit klaren Status-Labels versehen ("Wird gesendet…", "Registrieren" etc.).

## Barrierefreiheit & Feedback
- Fokuszustände mit Akzentfarbe und ausreichendem Kontrast darstellen (`ring-2 ring-primary`).
- Inhaltliche Änderungen (Erfolg/Fehler) in Cards mit Icons + Text ankündigen; Farben nur unterstützend nutzen.
- Temperatur-/Währungs-/Datumsausgaben stets lokalisiert (`de-DE`, `€`, `°C`).
- E-Mails enthalten klickbare Buttons plus Klartext-Link als Fallback.
