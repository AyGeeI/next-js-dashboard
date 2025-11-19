/**
 * Form Utilities
 *
 * Hilfsfunktionen für Formular-Handling
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// Form Data Handling
// ============================================================================

/**
 * Konvertiert FormData zu Plain Object
 */
export function formDataToObject(formData: FormData): Record<string, any> {
  const object: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Handle multiple values for same key
    if (object[key]) {
      if (Array.isArray(object[key])) {
        object[key].push(value);
      } else {
        object[key] = [object[key], value];
      }
    } else {
      object[key] = value;
    }
  });

  return object;
}

/**
 * Konvertiert Object zu FormData
 */
export function objectToFormData(object: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(object).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item);
      });
    } else if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });

  return formData;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Extrahiert Fehler-Message aus Error-Object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Ein unerwarteter Fehler ist aufgetreten";
}

/**
 * Formatiert Zod-Errors für Field-Level-Errors
 */
export function formatZodErrors(errors: any): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  if (errors?.issues) {
    errors.issues.forEach((issue: any) => {
      const path = issue.path.join(".");
      if (!formattedErrors[path]) {
        formattedErrors[path] = issue.message;
      }
    });
  }

  return formattedErrors;
}

/**
 * Formatiert API-Errors für Field-Level-Errors
 */
export function formatApiErrors(
  errors: Array<{ field: string; message: string }>
): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  errors.forEach((error) => {
    formattedErrors[error.field] = error.message;
  });

  return formattedErrors;
}

// ============================================================================
// Field Utilities
// ============================================================================

/**
 * Generiert eindeutige Field-ID
 */
export function generateFieldId(name: string, prefix?: string): string {
  const id = prefix ? `${prefix}-${name}` : name;
  return id.replace(/\./g, "-").replace(/\[|\]/g, "");
}

/**
 * Generiert ARIA-IDs für Field
 */
export function getFieldAriaIds(name: string, prefix?: string) {
  const baseId = generateFieldId(name, prefix);

  return {
    fieldId: baseId,
    labelId: `${baseId}-label`,
    errorId: `${baseId}-error`,
    helpId: `${baseId}-help`,
  };
}

// ============================================================================
// Input Formatting
// ============================================================================

/**
 * Formatiert Telefonnummer während der Eingabe
 */
export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length <= 3) {
    return cleaned;
  }

  if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }

  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
}

/**
 * Formatiert Postleitzahl (nur Zahlen, max 5)
 */
export function formatPostcode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}

/**
 * Formatiert Kreditkartennummer (4er-Gruppen)
 */
export function formatCreditCard(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(" ").slice(0, 19); // Max 16 Digits + 3 Spaces
}

/**
 * Formatiert IBAN (4er-Gruppen)
 */
export function formatIban(value: string): string {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(" ").slice(0, 34); // Max IBAN-Länge
}

/**
 * Formatiert Währung (z.B. "1234.56" -> "1.234,56 €")
 */
export function formatCurrency(value: number | string, currency = "EUR"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return "0,00 €";
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(num);
}

/**
 * Formatiert Prozent (z.B. "12.5" -> "12,5%")
 */
export function formatPercent(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return "0%";
  }

  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num / 100);
}

// ============================================================================
// Sanitization
// ============================================================================

/**
 * Entfernt alle Whitespace am Anfang/Ende
 */
export function trimValue(value: string): string {
  return value.trim();
}

/**
 * Entfernt alle nicht-numerischen Zeichen
 */
export function sanitizeNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Erlaubt nur Buchstaben, Zahlen und Unterstriche
 */
export function sanitizeUsername(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Entfernt gefährliche HTML-Tags (basic)
 */
export function sanitizeHtml(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
}

// ============================================================================
// Dirty State Tracking
// ============================================================================

/**
 * Vergleicht zwei Objekte für Dirty-State-Check
 */
export function isDirty(
  current: Record<string, any>,
  original: Record<string, any>
): boolean {
  return JSON.stringify(current) !== JSON.stringify(original);
}

/**
 * Findet geänderte Fields
 */
export function getChangedFields(
  current: Record<string, any>,
  original: Record<string, any>
): string[] {
  const changed: string[] = [];

  Object.keys(current).forEach((key) => {
    if (current[key] !== original[key]) {
      changed.push(key);
    }
  });

  return changed;
}

// ============================================================================
// Auto-Save
// ============================================================================

/**
 * Throttled Auto-Save Helper
 */
export function createAutoSave(
  saveFn: (data: any) => Promise<void> | void,
  delay: number = 2000
): {
  save: (data: any) => void;
  cancel: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;

  const save = (data: any) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      saveFn(data);
    }, delay);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { save, cancel };
}

// ============================================================================
// Field Dependencies
// ============================================================================

/**
 * Prüft ob Field sichtbar sein soll (basierend auf Conditional Logic)
 */
export function shouldShowField(
  conditions: Record<string, any>,
  formValues: Record<string, any>
): boolean {
  return Object.entries(conditions).every(([field, expectedValue]) => {
    const actualValue = formValues[field];

    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(actualValue);
    }

    return actualValue === expectedValue;
  });
}

// ============================================================================
// Class Name Helpers
// ============================================================================

/**
 * Hilfsfunktion für Input-Class-Names
 */
export function inputClasses(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Standard Input Classes
 */
export const INPUT_BASE_CLASSES =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Error Input Classes
 */
export const INPUT_ERROR_CLASSES = "border-destructive focus-visible:ring-destructive";

/**
 * Success Input Classes
 */
export const INPUT_SUCCESS_CLASSES = "border-success focus-visible:ring-success";

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Setzt Fokus auf erstes Fehlerfeld
 */
export function focusFirstError(formRef: HTMLFormElement | null): void {
  if (!formRef) return;

  const firstError = formRef.querySelector('[aria-invalid="true"]') as HTMLElement;

  if (firstError) {
    firstError.focus();
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/**
 * Setzt Fokus auf Field nach ID
 */
export function focusField(fieldId: string): void {
  const field = document.getElementById(fieldId);

  if (field) {
    field.focus();
    field.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ============================================================================
// File Upload Helpers
// ============================================================================

/**
 * Konvertiert File zu Base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validiert File-Type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validiert File-Size
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Formatiert File-Size für Anzeige
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
