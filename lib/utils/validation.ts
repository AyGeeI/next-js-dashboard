/**
 * Validation Utilities
 *
 * Wiederverwendbare Validierungs-Funktionen für Forms
 */

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  VALIDATION_MESSAGES,
} from "@/lib/constants/ui";

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validiert E-Mail-Format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validiert E-Mail und gibt Error-Message zurück
 */
export function validateEmail(email: string): string | undefined {
  if (!email) {
    return VALIDATION_MESSAGES.required;
  }

  if (!isValidEmail(email)) {
    return VALIDATION_MESSAGES.email;
  }

  return undefined;
}

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Prüft ob Passwort Großbuchstaben enthält
 */
export function hasUppercase(password: string): boolean {
  return /[A-Z]/.test(password);
}

/**
 * Prüft ob Passwort Kleinbuchstaben enthält
 */
export function hasLowercase(password: string): boolean {
  return /[a-z]/.test(password);
}

/**
 * Prüft ob Passwort Zahlen enthält
 */
export function hasNumber(password: string): boolean {
  return /\d/.test(password);
}

/**
 * Prüft ob Passwort Sonderzeichen enthält
 */
export function hasSpecialChar(password: string): boolean {
  return /[^A-Za-z0-9]/.test(password);
}

/**
 * Passwort-Stärke berechnen (0-6)
 *
 * @returns Score von 0 (sehr schwach) bis 6 (sehr stark)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let score = 0;

  // Längen-Score
  if (password.length >= 16) score += 2;
  else if (password.length >= PASSWORD_MIN_LENGTH) score += 1;

  // Variety-Score
  if (hasUppercase(password)) score += 1;
  if (hasLowercase(password)) score += 1;
  if (hasNumber(password)) score += 1;
  if (hasSpecialChar(password)) score += 1;

  return Math.min(score, 6);
}

/**
 * Passwort-Stärke als Label
 */
export function getPasswordStrengthLabel(
  password: string
): "Noch kein Passwort" | "Schwach" | "Solide" | "Stark" {
  if (!password) return "Noch kein Passwort";

  const score = calculatePasswordStrength(password);

  if (score >= 5) return "Stark";
  if (score >= 3) return "Solide";
  return "Schwach";
}

/**
 * Passwort-Anforderungen prüfen
 *
 * @returns Array mit nicht erfüllten Anforderungen
 */
export function getPasswordRequirements(password: string): {
  requirement: string;
  fulfilled: boolean;
}[] {
  return [
    {
      requirement: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen`,
      fulfilled: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      requirement: "Groß- und Kleinbuchstaben",
      fulfilled: hasUppercase(password) && hasLowercase(password),
    },
    {
      requirement: "Mindestens eine Zahl",
      fulfilled: hasNumber(password),
    },
    {
      requirement: "Mindestens ein Sonderzeichen",
      fulfilled: hasSpecialChar(password),
    },
  ];
}

/**
 * Validiert Passwort und gibt Error-Message zurück
 */
export function validatePassword(password: string): string | undefined {
  if (!password) {
    return VALIDATION_MESSAGES.required;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return VALIDATION_MESSAGES.password.tooShort;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return VALIDATION_MESSAGES.password.tooLong;
  }

  if (!hasUppercase(password)) {
    return VALIDATION_MESSAGES.password.noUppercase;
  }

  if (!hasLowercase(password)) {
    return VALIDATION_MESSAGES.password.noLowercase;
  }

  if (!hasNumber(password)) {
    return VALIDATION_MESSAGES.password.noNumber;
  }

  if (!hasSpecialChar(password)) {
    return VALIDATION_MESSAGES.password.noSpecialChar;
  }

  return undefined;
}

/**
 * Validiert Passwort-Bestätigung
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) {
    return VALIDATION_MESSAGES.required;
  }

  if (password !== confirmPassword) {
    return VALIDATION_MESSAGES.password.mismatch;
  }

  return undefined;
}

// ============================================================================
// Username Validation
// ============================================================================

/**
 * Validiert Username-Format (nur Buchstaben, Zahlen, Unterstriche)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
}

/**
 * Validiert Username und gibt Error-Message zurück
 */
export function validateUsername(username: string): string | undefined {
  if (!username) {
    return VALIDATION_MESSAGES.required;
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return VALIDATION_MESSAGES.username.tooShort;
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return VALIDATION_MESSAGES.username.tooLong;
  }

  if (!isValidUsername(username)) {
    return VALIDATION_MESSAGES.username.invalid;
  }

  return undefined;
}

// ============================================================================
// Generic Validators
// ============================================================================

/**
 * Validiert ob Feld nicht leer ist
 */
export function validateRequired(value: string): string | undefined {
  if (!value || value.trim().length === 0) {
    return VALIDATION_MESSAGES.required;
  }

  return undefined;
}

/**
 * Validiert Mindestlänge
 */
export function validateMinLength(
  value: string,
  minLength: number
): string | undefined {
  if (value.length < minLength) {
    return `Mindestens ${minLength} Zeichen erforderlich`;
  }

  return undefined;
}

/**
 * Validiert Maximallänge
 */
export function validateMaxLength(
  value: string,
  maxLength: number
): string | undefined {
  if (value.length > maxLength) {
    return `Maximal ${maxLength} Zeichen erlaubt`;
  }

  return undefined;
}

/**
 * Validiert gegen Regex-Pattern
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  errorMessage: string
): string | undefined {
  if (!pattern.test(value)) {
    return errorMessage;
  }

  return undefined;
}

/**
 * Validiert numerischen Wert
 */
export function validateNumber(value: string): string | undefined {
  if (isNaN(Number(value))) {
    return "Bitte gib eine gültige Zahl ein";
  }

  return undefined;
}

/**
 * Validiert numerischen Bereich
 */
export function validateNumberRange(
  value: string,
  min?: number,
  max?: number
): string | undefined {
  const num = Number(value);

  if (isNaN(num)) {
    return "Bitte gib eine gültige Zahl ein";
  }

  if (min !== undefined && num < min) {
    return `Wert muss mindestens ${min} sein`;
  }

  if (max !== undefined && num > max) {
    return `Wert darf maximal ${max} sein`;
  }

  return undefined;
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Validiert URL-Format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validiert URL und gibt Error-Message zurück
 */
export function validateUrl(url: string): string | undefined {
  if (!url) {
    return VALIDATION_MESSAGES.required;
  }

  if (!isValidUrl(url)) {
    return "Bitte gib eine gültige URL ein";
  }

  return undefined;
}

// ============================================================================
// Phone Number Validation (DE)
// ============================================================================

/**
 * Validiert deutsche Telefonnummer (basic)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Einfache Validierung: mindestens 6 Ziffern, erlaubt +, -, /, (, ), Leerzeichen
  const phoneRegex = /^[\d\s\-\+\/\(\)]{6,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validiert Telefonnummer und gibt Error-Message zurück
 */
export function validatePhoneNumber(phone: string): string | undefined {
  if (!phone) {
    return VALIDATION_MESSAGES.required;
  }

  if (!isValidPhoneNumber(phone)) {
    return "Bitte gib eine gültige Telefonnummer ein";
  }

  return undefined;
}

// ============================================================================
// Postcode Validation (DE)
// ============================================================================

/**
 * Validiert deutsche Postleitzahl
 */
export function isValidPostcode(postcode: string): boolean {
  const postcodeRegex = /^\d{5}$/;
  return postcodeRegex.test(postcode);
}

/**
 * Validiert Postleitzahl und gibt Error-Message zurück
 */
export function validatePostcode(postcode: string): string | undefined {
  if (!postcode) {
    return VALIDATION_MESSAGES.required;
  }

  if (!isValidPostcode(postcode)) {
    return "Bitte gib eine gültige 5-stellige Postleitzahl ein";
  }

  return undefined;
}

// ============================================================================
// Country Code Validation
// ============================================================================

/**
 * Validiert ISO-3166 Ländercode (2 Buchstaben)
 */
export function isValidCountryCode(code: string): boolean {
  const countryCodeRegex = /^[A-Z]{2}$/;
  return countryCodeRegex.test(code);
}

/**
 * Validiert Ländercode und gibt Error-Message zurück
 */
export function validateCountryCode(code: string): string | undefined {
  if (!code) {
    return VALIDATION_MESSAGES.required;
  }

  if (!isValidCountryCode(code.toUpperCase())) {
    return "Bitte gib einen gültigen 2-stelligen Ländercode ein (z.B. DE)";
  }

  return undefined;
}

// ============================================================================
// Async Validators (für API-Calls)
// ============================================================================

/**
 * Prüft ob Username verfügbar ist (API-Call)
 */
export async function checkUsernameAvailability(
  username: string
): Promise<string | undefined> {
  try {
    const response = await fetch(
      `/api/auth/check-username?username=${encodeURIComponent(username)}`
    );
    const data = await response.json();

    if (!data.available) {
      return "Dieser Benutzername ist bereits vergeben";
    }

    return undefined;
  } catch (error) {
    console.error("Username-Verfügbarkeit konnte nicht geprüft werden:", error);
    return "Verfügbarkeit konnte nicht geprüft werden";
  }
}

/**
 * Prüft ob E-Mail verfügbar ist (API-Call)
 */
export async function checkEmailAvailability(
  email: string
): Promise<string | undefined> {
  try {
    const response = await fetch(
      `/api/auth/check-email?email=${encodeURIComponent(email)}`
    );
    const data = await response.json();

    if (!data.available) {
      return "Diese E-Mail-Adresse ist bereits registriert";
    }

    return undefined;
  } catch (error) {
    console.error("E-Mail-Verfügbarkeit konnte nicht geprüft werden:", error);
    return "Verfügbarkeit konnte nicht geprüft werden";
  }
}

// ============================================================================
// Combined Validators
// ============================================================================

/**
 * Kombiniert mehrere Validatoren
 *
 * @example
 * ```ts
 * const validate = combineValidators(
 *   validateRequired,
 *   (value) => validateMinLength(value, 3),
 *   validateEmail
 * );
 *
 * const error = validate("test@");
 * ```
 */
export function combineValidators(
  ...validators: Array<(value: string) => string | undefined>
): (value: string) => string | undefined {
  return (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
}
