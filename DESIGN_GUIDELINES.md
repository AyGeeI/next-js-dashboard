# Dashboard Design-Richtlinien

## Sprache & Inhalte
- Deutsch mit korrekten Umlauten (ä, ö, ü, ß) auf allen Seiten, in E-Mails und im Dashboard verwenden.
- Klare, kurze Texte bevorzugen; Hilfetexte statt Platzhalter nutzen.
- Status- und Fehlermeldungen sollen konkrete Handlungen empfehlen (z. B. "Bestätige deine E-Mail-Adresse").

## Farb- und Themekonzept
- Light Theme: Graustufen als Basis; Neonblau (`hsl(210 100% 45%)`) ist der Primärakzent.
- Dark Theme: Graustufen als Basis; Neon-Türkis (`hsl(174 95% 52%)`) ist der Primärakzent.
- Semantische Zustände dürfen zusätzliche Farben nutzen: z. B. Passwortstärke (rot/gelb/grün), positive Werte (grün), negative Werte (rot), Warnungen (gelb).
- Ring-, Fokus- und Hover-Zustände nutzen weiterhin den jeweiligen Primärakzent, außer bei klar bezeichneten Fehlermeldungen.

## Komponenten & Layout
- shadcn/ui-Komponenten als Grundlage nutzen (Card, Button, Input, Tooltip usw.).
- Layouts müssen von Mobil (320 px) bis Desktop flüssig skalieren (flex-col -> lg:flex-row, auto-fit Grids).
- Navigationsbereiche auf kleinen Viewports stapeln oder als Scroll-Row ausgeben; keine festen Höhen erzwingen.
- Karten/Widgets nutzen großzügige Abstände (`p-4+`) und reagieren auf Hover mit Graustufen-Änderungen.

## Formulare & Interaktion
- Keine Platzhaltertexte; Labels reichen als Kontext, Hilfetexte nur einsetzen wenn absolut nötig.
- Felder aufgeräumt halten: unter Inputs keine Beschreibungen anzeigen, stattdessen nur Fehlermeldungen.
- Tooltips per `TooltipProvider` mit `delayDuration <= 150 ms` konfigurieren, damit Hinweise sofort erscheinen.
- Passwort-Anforderungen visuell über Balken + Klartext erklären; Schwach/Mittel/Stark klar mit Rot/Gelb/Grün differenzieren, ergänzt durch Textlabels.
- Buttons mit klaren Status-Labels versehen ("Wird gesendet…", "Registrieren" etc.).

## Barrierefreiheit & Feedback
- Fokuszustände mit Akzentfarbe und ausreichendem Kontrast darstellen (`ring-2 ring-primary`).
- Inhaltliche Änderungen (Erfolg/Fehler) in Cards mit Icons + Text ankündigen; Farben nur unterstützend nutzen.
- Temperatur-/Währungs-/Datumsausgaben stets lokalisiert (`de-DE`, `€`, `°C`).
- E-Mails enthalten klickbare Buttons plus Klartext-Link als Fallback.
