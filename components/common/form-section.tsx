/**
 * FormSection Component
 *
 * Section-Container für gruppierte Form-Fields
 * Mit optionalem Titel und Beschreibung
 *
 * @example
 * ```tsx
 * <FormSection
 *   title="Persönliche Daten"
 *   description="Diese Informationen sind für dein Profil sichtbar"
 * >
 *   <FormField label="Name">
 *     <Input />
 *   </FormField>
 *   <FormField label="E-Mail">
 *     <Input type="email" />
 *   </FormField>
 * </FormSection>
 * ```
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface FormSectionProps {
  /**
   * Section-Titel
   */
  title?: string;

  /**
   * Section-Beschreibung
   */
  description?: string;

  /**
   * Form-Fields (children)
   */
  children: React.ReactNode;

  /**
   * Zusätzliche Klassen für Container
   */
  className?: string;

  /**
   * Zusätzliche Klassen für Content
   */
  contentClassName?: string;
}

// ============================================================================
// Component
// ============================================================================

export function FormSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn("space-y-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
