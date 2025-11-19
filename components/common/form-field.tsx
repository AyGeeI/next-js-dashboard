/**
 * FormField Component
 *
 * Wrapper-Komponente für konsistente Form-Fields
 * Kombiniert Label + Input + Error + Helper-Text
 *
 * @example
 * ```tsx
 * <FormField
 *   label="E-Mail"
 *   helperText="Wir senden dir einen Bestätigungslink"
 *   error={errors.email?.message}
 *   required
 * >
 *   <Input type="email" {...register("email")} />
 * </FormField>
 * ```
 */

"use client";

import * as React from "react";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { getFieldAriaIds } from "@/lib/utils/form";

// ============================================================================
// Types
// ============================================================================

export interface FormFieldProps {
  /**
   * Label-Text
   */
  label?: string;

  /**
   * Hilfe-Text unterhalb des Inputs
   */
  helperText?: string;

  /**
   * Fehler-Message
   */
  error?: string;

  /**
   * Erforderlich?
   */
  required?: boolean;

  /**
   * Input-Element (children)
   */
  children: React.ReactElement;

  /**
   * ID des Input-Elements (für Label-Zuordnung)
   */
  htmlFor?: string;

  /**
   * Zusätzliche Klassen für Container
   */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function FormField({
  label,
  helperText,
  error,
  required = false,
  children,
  htmlFor,
  className,
}: FormFieldProps) {
  // Extract id from child or use htmlFor
  const childId =
    htmlFor ||
    (React.isValidElement(children) && children.props.id) ||
    (React.isValidElement(children) && children.props.name) ||
    "field";

  const ariaIds = getFieldAriaIds(childId);

  // Clone child with aria attributes
  const childWithAria = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: ariaIds.fieldId,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error
          ? ariaIds.errorId
          : helperText
            ? ariaIds.helpId
            : undefined,
      } as any)
    : children;

  return (
    <div className={cn("w-full space-y-2", className)}>
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

      {/* Helper text (nur wenn kein Error) */}
      {helperText && !error && (
        <p
          id={ariaIds.helpId}
          className="text-xs text-muted-foreground"
        >
          {helperText}
        </p>
      )}

      {/* Input */}
      {childWithAria}

      {/* Error message */}
      {error && (
        <p
          id={ariaIds.errorId}
          className="text-xs text-destructive flex items-center gap-1"
          role="alert"
        >
          <XCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
