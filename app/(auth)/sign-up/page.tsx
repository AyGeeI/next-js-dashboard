\"use client\";

import { useMemo, useState } from \"react\";
import Link from \"next/link\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from \"@/components/ui/card\";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";
import { Eye, EyeOff, Info, MailCheck, RefreshCw, AlertCircle } from \"lucide-react\";
import { cn } from \"@/lib/utils\";

type FieldErrors = Record<string, string>;

const passwordRequirements = [
  \"Mindestens 12 Zeichen\",
  \"Gross- und Kleinbuchstaben\",
  \"Mindestens eine Zahl\",
  \"Mindestens ein Sonderzeichen\",
];

const passwordStrengthMap = {
  weak: { label: \"Schwach\", bar: \"bg-destructive\", text: \"text-destructive\" },
  medium: { label: \"Mittel\", bar: \"bg-amber-500\", text: \"text-amber-600\" },
  strong: { label: \"Stark\", bar: \"bg-emerald-500\", text: \"text-emerald-600\" },
} as const;

function evaluatePasswordStrength(password: string) {
  if (!password) {
    return { score: 0, ...passwordStrengthMap.weak, label: \"Noch kein Passwort\" };
  }

  const lengthScore = password.length >= 16 ? 2 : password.length >= 12 ? 1 : 0;
  const varietyScore = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const totalScore = lengthScore + varietyScore;

  if (totalScore >= 5) {
    return { score: 3, ...passwordStrengthMap.strong };
  }

  if (totalScore >= 3) {
    return { score: 2, ...passwordStrengthMap.medium };
  }

  return { score: password ? 1 : 0, ...passwordStrengthMap.weak };
}

export default function SignUpPage() {
  const [name, setName] = useState(\"\");
  const [username, setUsername] = useState(\"\");
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");
  const [confirmPassword, setConfirmPassword] = useState(\"\");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(\"\");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(\"\");
  const [pendingEmail, setPendingEmail] = useState(\"\");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(\"\");
    setSuccess(\"\");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch(\"/api/auth/register\", {
        method: \"POST\",
        headers: {
          \"Content-Type\": \"application/json\",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const parsedErrors: FieldErrors = {};
          for (const issue of data.errors) {
            parsedErrors[issue.field] = issue.message;
          }
          setFieldErrors(parsedErrors);
        }
        setError(data.error || \"Registrierung fehlgeschlagen.\");
        return;
      }

      setSuccess(data.message || \"Registrierung erfolgreich. Bitte bestaetige deine E-Mail-Adresse.\");
      setPendingEmail(data.pendingEmail || email);
      setName(\"\");
      setUsername(\"\");
      setEmail(\"\");
      setPassword(\"\");
      setConfirmPassword(\"\");
    } catch (err) {
      setError(\"Ein Fehler ist aufgetreten. Bitte versuche es spaeter erneut.\");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) {
      return;
    }

    setResending(true);
    setError(\"\");

    try {
      const response = await fetch(\"/api/auth/resend-verification\", {
        method: \"POST\",
        headers: {
          \"Content-Type\": \"application/json\",
        },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || \"E-Mail konnte nicht erneut gesendet werden.\");
        return;
      }

      setSuccess(data.message || \"Wir haben dir eine neue E-Mail gesendet.\");
    } catch (err) {
      setError(\"Versand fehlgeschlagen. Bitte versuche es spaeter erneut.\");
    } finally {
      setResending(false);
    }
  };

  return (
    <TooltipProvider>
      <div className=\"flex min-h-screen items-center justify-center p-4\">
        <Card className=\"w-full max-w-lg\">
          <CardHeader>
            <CardTitle>Registrieren</CardTitle>
            <CardDescription>Erstelle dein Konto in wenigen Schritten.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className=\"space-y-4\">
              {success && (
                <div className=\"rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900\">
                  <div className=\"flex items-start gap-2\">
                    <MailCheck className=\"mt-0.5 h-5 w-5\" />
                    <div>
                      <p className=\"font-medium\">Bitte bestaetige deine E-Mail-Adresse.</p>
                      <p className=\"mt-1 text-muted-foreground\">
                        {success}
                        {pendingEmail && (
                          <span className=\"block\">Wir haben an {pendingEmail} gesendet.</span>
                        )}
                      </p>
                      <div className=\"mt-3 flex flex-wrap gap-2\">
                        <Button type=\"button\" variant=\"outline\" onClick={handleResendVerification} disabled={resending}>
                          {resending ? (
                            <span className=\"flex items-center gap-2\">
                              <RefreshCw className=\"h-4 w-4 animate-spin\" />
                              Wird gesendet...
                            </span>
                          ) : (
                            \"E-Mail erneut senden\"
                          )}
                        </Button>
                        <Button type=\"button\" variant=\"link\" asChild>
                          <Link href=\"/sign-in\">Zur Anmeldung</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className=\"grid gap-4 md:grid-cols-2\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"username\">Benutzername</Label>
                  <Input
                    id=\"username\"
                    autoComplete=\"username\"
                    placeholder=\"dein.name\"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                  {fieldErrors.username && <p className=\"text-xs text-destructive\">{fieldErrors.username}</p>}
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"name\">Name (optional)</Label>
                  <Input
                    id=\"name\"
                    placeholder=\"Max Mustermann\"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"email\">E-Mail-Adresse</Label>
                <Input
                  id=\"email\"
                  type=\"email\"
                  autoComplete=\"email\"
                  placeholder=\"mail@beispiel.de\"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                {fieldErrors.email && <p className=\"text-xs text-destructive\">{fieldErrors.email}</p>}
              </div>

              <div className=\"space-y-2\">
                <div className=\"flex items-center gap-2\">
                  <Label htmlFor=\"password\" className=\"flex items-center gap-1\">
                    Passwort
                    <Tooltip>
                      <TooltipTrigger type=\"button\" className=\"rounded-full p-1 text-muted-foreground\">
                        <Info className=\"h-4 w-4\" aria-hidden=\"true\" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <ul className=\"space-y-1 text-xs\">
                          {passwordRequirements.map((req) => (
                            <li key={req}>- {req}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </div>
                <div className=\"relative\">
                  <Input
                    id=\"password\"
                    type={showPassword ? \"text\" : \"password\"}
                    autoComplete=\"new-password\"
                    placeholder=\"Mindestens 12 Zeichen\"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={12}
                    maxLength={72}
                    disabled={loading}
                    className=\"pr-10\"
                  />
                  <button
                    type=\"button\"
                    className=\"absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground\"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? \"Passwort verbergen\" : \"Passwort anzeigen\"}
                  >
                    {showPassword ? <EyeOff className=\"h-4 w-4\" /> : <Eye className=\"h-4 w-4\" />}
                  </button>
                </div>
                <div className=\"space-y-1\">
                  <div className=\"flex items-center justify-between text-xs\">
                    <span className=\"text-muted-foreground\">Passwortstaerke</span>
                    <span className={cn(\"font-medium\", password ? passwordStrength.text : \"text-muted-foreground\")}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className=\"grid grid-cols-3 gap-2\">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className={cn(
                          \"h-1.5 rounded-full bg-muted transition-colors\",
                          passwordStrength.score > index ? passwordStrength.bar : \"\"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"confirmPassword\">Passwort bestaetigen</Label>
                <div className=\"relative\">
                  <Input
                    id=\"confirmPassword\"
                    type={showConfirmPassword ? \"text\" : \"password\"}
                    autoComplete=\"new-password\"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className=\"pr-10\"
                  />
                  <button
                    type=\"button\"
                    className=\"absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground\"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? \"Passwort verbergen\" : \"Passwort anzeigen\"}
                  >
                    {showConfirmPassword ? <EyeOff className=\"h-4 w-4\" /> : <Eye className=\"h-4 w-4\" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className=\"text-xs text-destructive\">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {error && (
                <div className=\"flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive\">
                  <AlertCircle className=\"h-4 w-4\" />
                  <span>{error}</span>
                </div>
              )}

              <Button type=\"submit\" className=\"w-full\" disabled={loading}>
                {loading ? \"Wird registriert...\" : \"Registrieren\"}
              </Button>

              <div className=\"text-center text-sm text-muted-foreground\">
                Bereits ein Konto?{\" "}
                <Link href=\"/sign-in\" className=\"text-primary hover:underline\">
                  Anmelden
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
