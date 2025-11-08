# Upstash Redis Setup für Rate Limiting

## Warum Redis?

Rate Limiting benötigt einen schnellen Key-Value-Store, um Login-Versuche pro IP-Adresse zu tracken. Ohne Redis läuft das Rate-Limiting im "fail-open" Modus (kein Schutz!).

## Setup-Optionen

### Option 1: Vercel Marketplace (Empfohlen)

**Vorteile:**
- Automatische Integration
- Environment Variables werden automatisch gesetzt
- Kostenloser Free Tier (10.000 Requests/Tag)

**Schritte:**

1. Gehe zu [Vercel Dashboard](https://vercel.com/dashboard)
2. Wähle dein Projekt aus
3. Klicke auf **"Integrations"** → **"Browse Marketplace"**
4. Suche nach **"Upstash Redis"**
5. Klicke auf **"Add Integration"**
6. Folge dem Setup-Wizard
7. Wähle dein Projekt aus
8. Die folgenden Environment Variables werden automatisch gesetzt:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Option 2: Manuelles Setup

**Schritte:**

1. Gehe zu [https://console.upstash.com](https://console.upstash.com)
2. Erstelle einen kostenlosen Account
3. Klicke auf **"Create Database"**
4. Wähle:
   - **Type:** Regional
   - **Region:** Europe (eu-central-1) - empfohlen für Deutschland
   - **Eviction:** No eviction
5. Kopiere die **REST API Credentials**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

6. Füge die Credentials zu deiner `.env.local` Datei hinzu:

```env
# Upstash Redis (für Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token_here"
```

7. **In Vercel** (für Production):
   - Gehe zu Projekt → **Settings** → **Environment Variables**
   - Füge dieselben Variablen hinzu
   - Redeploy das Projekt

## Rate-Limit-Konfiguration

Die aktuelle Konfiguration in `lib/rate-limit.ts`:

```typescript
export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 Versuche / 10 Minuten
  analytics: true,
  prefix: "ratelimit:login",
});
```

### Anpassungen (optional)

**Strengeres Limit (3 Versuche / 15 Minuten):**
```typescript
limiter: Ratelimit.slidingWindow(3, "15 m")
```

**Lockereres Limit (10 Versuche / 5 Minuten):**
```typescript
limiter: Ratelimit.slidingWindow(10, "5 m")
```

## Testen des Rate-Limits

### Lokal testen

1. Starte den Dev-Server: `npm run dev`
2. Öffne `http://localhost:3000/sign-in`
3. Versuche **6x** mit falschen Credentials einzuloggen
4. Beim 6. Versuch sollte die Fehlermeldung erscheinen:
   ```
   Zu viele Login-Versuche. Bitte versuchen Sie es in einigen Minuten erneut.
   ```

### Redis Connection überprüfen

Im Upstash Dashboard siehst du:
- **Commands:** Anzahl der Redis-Operationen
- **Data Browser:** Gespeicherte Keys (z.B. `ratelimit:login:192.168.1.1`)

## Troubleshooting

### Rate-Limiting funktioniert nicht

**Prüfe:**
1. Sind die Environment Variables gesetzt?
   ```bash
   # Im Terminal
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. Dev-Server neu gestartet nach Hinzufügen der Variables?
   ```bash
   # Strg+C, dann:
   npm run dev
   ```

3. Check in `lib/rate-limit.ts`:
   ```typescript
   if (!loginRatelimit) {
     console.warn("Rate limiting is not configured. Upstash Redis credentials missing.");
     // Läuft im fail-open Modus (kein Schutz!)
   }
   ```

### Fehler: "Connection failed"

- Prüfe, ob die URL korrekt ist (mit `https://`)
- Prüfe, ob der Token korrekt kopiert wurde (keine Leerzeichen!)
- Prüfe Upstash Dashboard → Database Status (sollte "Active" sein)

### Fehler: "Rate limit exceeded" sofort beim ersten Login

- Rate-Limit-Key könnte bereits existieren
- Im Upstash Dashboard → **Data Browser** → Key löschen: `ratelimit:login:your-ip`
- Oder warte 10 Minuten

## Alternative: Vercel KV

Falls du bereits Vercel KV nutzt, kannst du das auch verwenden:

1. Installiere Vercel KV:
   ```bash
   npm install @vercel/kv
   ```

2. Ändere `lib/rate-limit.ts`:
   ```typescript
   import { kv } from '@vercel/kv';
   import { Ratelimit } from "@upstash/ratelimit";

   export const loginRatelimit = new Ratelimit({
     redis: kv, // Verwende Vercel KV statt Upstash
     limiter: Ratelimit.slidingWindow(5, "10 m"),
   });
   ```

## Kosten

### Upstash Free Tier
- **10.000 Requests/Tag**
- **256 MB Daten**
- Ausreichend für kleine bis mittlere Anwendungen

### Upstash Pay-as-you-go
- Ab $0.20 pro 100.000 Requests
- Keine monatliche Grundgebühr

### Vercel KV
- Gratis in Hobby-Plan: 30.000 Requests/Monat
- Pro Plan: $1/100.000 Requests

## Best Practices

1. **Rate-Limit nur für kritische Endpunkte:**
   - Login
   - Passwort-Reset
   - API-Endpoints mit sensiblen Daten

2. **Monitoring:**
   - Überwache Redis-Usage im Dashboard
   - Setze Alerts bei >80% Nutzung

3. **Cache-Invalidierung:**
   - Bei Account-Löschung: Redis-Keys für diesen User löschen
   - Bei IP-Änderung: Alte Keys laufen automatisch ab

4. **Sicherheit:**
   - Speichere Tokens nur in `.env.local` (nie committen!)
   - Verwende verschiedene Tokens für Dev/Production

## Weiterführende Dokumentation

- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Upstash Ratelimit Docs](https://github.com/upstash/ratelimit)
- [Vercel Integration](https://vercel.com/integrations/upstash)
