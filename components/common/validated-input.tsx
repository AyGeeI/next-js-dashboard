/**
 * ValidatedInput Component
 *
 * Input mit Inline-Validierung, Error/Success-States und aria-Attributen
 *
 * Features:
 * - Inline-Validierung während der Eingabe
 * - Debounced validation (konfigurierbar)
 * - Error-State mit Icon und Message
 * - Success-State mit Icon (optional)
 * - Async-Validierung (z.B. für Username/Email-Verfügbarkeit)
 * - Full accessibility support (aria-invalid, aria-describedby)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ValidatedInput
 *   label="E-Mail"
 *   type="email"
 *   error={errors.email}
 * />
 *
 * // With helper text
 * <ValidatedInput
 *   label="Username"
 *   helperText="Mindestens 3 Zeichen"
 *   error={errors.username}
 * />
 *
 * // With async validation
 * <ValidatedInput
 *   label="Username"
 *   validationFn={async (value) => {
 *     const available = await checkUsername(value);
 *     return available ? undefined : "Username bereits vergeben";
 *   }}
 *   showSuccessState
 * />
 * ```
 */

"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { INPUT_DEBOUNCE_MS, INPUT_ICON_SIZE } from "@/lib/constants/ui";
import { getFieldAriaIds } from "@/lib/utils/form";

// ============================================================================
// Types
// ============================================================================

export interface ValidatedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * Label-Text
   */
  label?: string;

  /**
   * Fehler-Message
   */
  error?: string;

  /**
   * Hilfe-Text unterhalb des Inputs
   */
  helperText?: string;

  /**
   * Zeigt Success-State (grüner Rahmen + Check-Icon)
   */
  showSuccessState?: boolean;

  /**
   * Async-Validierungs-Funktion
   * Gibt Error-Message zurück oder undefined wenn valide
   */
  validationFn?: (value: string) => Promise<string | undefined>;

  /**
   * Debounce-Delay für Validierung in ms
   */
  debounceMs?: number;

  /**
   * Callback wenn Validierung abgeschlossen
   */
  onValidationComplete?: (error: string | undefined) => void;
}

// ============================================================================
// Component
// ============================================================================

export const ValidatedInput = React.forwardRef<
  HTMLInputElement,
  ValidatedInputProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      showSuccessState = false,
      validationFn,
      debounceMs = INPUT_DEBOUNCE_MS.normal,
      onValidationComplete,
      value,
      onChange,
      disabled,
      id,
      name,
      required,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      (value as string) || ""
    );
    const [validationError, setValidationError] = React.useState<string | undefined>();
    const [isValidating, setIsValidating] = React.useState(false);
    const [isValid, setIsValid] = React.useState(false);

    // Debounce value for validation
    const debouncedValue = useDebounce(internalValue, debounceMs);

    // Generate ARIA IDs
    const fieldId = id || name || "input";
    const ariaIds = getFieldAriaIds(fieldId);

    // Combined error (external or validation)
    const displayError = error || validationError;

    // Determine state
    const hasError = !!displayError;
    const hasSuccess = !hasError && showSuccessState && isValid && internalValue.length > 0;

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      setIsValid(false);
      setValidationError(undefined);

      if (onChange) {
        onChange(e);
      }
    };

    // Run validation
    React.useEffect(() => {
      if (!validationFn || !debouncedValue) {
        setValidationError(undefined);
        setIsValidating(false);
        return;
      }

      const validate = async () => {
        setIsValidating(true);

        try {
          const error = await validationFn(debouncedValue);
          setValidationError(error);
          setIsValid(!error);

          if (onValidationComplete) {
            onValidationComplete(error);
          }
        } catch (err) {
          console.error("Validation error:", err);
          setValidationError("Validierung fehlgeschlagen");
          setIsValid(false);
        } finally {
          setIsValidating(false);
        }
      };

      validate();
    }, [debouncedValue, validationFn, onValidationComplete]);

    // Sync external value
    React.useEffect(() => {
      if (value !== undefined && value !== internalValue) {
        setInternalValue(value as string);
      }
    }, [value]);

    return (
      <div className="w-full space-y-2">
        {/* Label */}
        {label && (
          <Label
            htmlFor={ariaIds.fieldId}
            id={ariaIds.labelId}
            className="text-xs font-medium"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}

        {/* Helper text */}
        {helperText && !hasError && (
          <p
            id={ariaIds.helpId}
            className="text-xs text-muted-foreground"
          >
            {helperText}
          </p>
        )}

        {/* Input with icon */}
        <div className="relative">
          <Input
            ref={ref}
            id={ariaIds.fieldId}
            name={name}
            value={internalValue}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={cn(
              className,
              hasError && "border-destructive focus-visible:ring-destructive pr-10",
              hasSuccess && "border-success focus-visible:ring-success pr-10"
            )}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={
              displayError
                ? ariaIds.errorId
                : helperText
                  ? ariaIds.helpId
                  : undefined
            }
            {...props}
          />

          {/* Status icon */}
          {(hasError || hasSuccess || isValidating) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isValidating && (
                <Loader2
                  className={cn(INPUT_ICON_SIZE, "animate-spin text-muted-foreground")}
                  aria-hidden="true"
                />
              )}
              {hasError && !isValidating && (
                <XCircle
                  className={cn(INPUT_ICON_SIZE, "text-destructive")}
                  aria-hidden="true"
                />
              )}
              {hasSuccess && !isValidating && (
                <CheckCircle2
                  className={cn(INPUT_ICON_SIZE, "text-success")}
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {displayError && (
          <p
            id={ariaIds.errorId}
            className="text-xs text-destructive flex items-center gap-1"
            role="alert"
          >
            <XCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span>{displayError}</span>
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";
