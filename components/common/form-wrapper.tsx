/**
 * FormWrapper Component
 *
 * Wrapper für Formulare mit react-hook-form + Zod-Validierung
 *
 * Features:
 * - Integriert react-hook-form
 * - Zod-Schema-Validierung
 * - Dirty-State-Tracking
 * - Optional: Auto-Save
 * - Submit-Handler mit Loading-State
 * - Before-Unload-Warning bei ungespeicherten Änderungen
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email("Ungültige E-Mail"),
 *   password: z.string().min(12, "Mindestens 12 Zeichen"),
 * });
 *
 * <FormWrapper
 *   schema={schema}
 *   onSubmit={async (data) => {
 *     await saveData(data);
 *   }}
 *   defaultValues={{ email: "", password: "" }}
 * >
 *   {({ register, formState: { errors, isSubmitting } }) => (
 *     <>
 *       <FormField label="E-Mail" error={errors.email?.message}>
 *         <Input {...register("email")} />
 *       </FormField>
 *       <Button type="submit" loading={isSubmitting}>
 *         Speichern
 *       </Button>
 *     </>
 *   )}
 * </FormWrapper>
 * ```
 */

"use client";

import * as React from "react";
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";
import { cn } from "@/lib/utils";
import { isDirty, createAutoSave } from "@/lib/utils/form";

// ============================================================================
// Types
// ============================================================================

export interface FormWrapperProps<T extends FieldValues> {
  /**
   * Zod-Validierungs-Schema
   */
  schema: ZodSchema<T>;

  /**
   * Submit-Handler
   */
  onSubmit: (data: T) => Promise<void> | void;

  /**
   * Default-Werte
   */
  defaultValues?: DefaultValues<T>;

  /**
   * Children als Render-Funktion
   */
  children: (methods: UseFormReturn<T>) => React.ReactNode;

  /**
   * Aktiviert Auto-Save
   */
  enableAutoSave?: boolean;

  /**
   * Auto-Save-Delay in ms
   */
  autoSaveDelay?: number;

  /**
   * Callback bei Auto-Save
   */
  onAutoSave?: (data: T) => Promise<void> | void;

  /**
   * Before-Unload-Warning aktivieren
   */
  enableBeforeUnload?: boolean;

  /**
   * Before-Unload-Message
   */
  beforeUnloadMessage?: string;

  /**
   * Callback nach erfolgreichem Submit
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback bei Error
   */
  onError?: (error: Error) => void;

  /**
   * Zusätzliche Klassen
   */
  className?: string;

  /**
   * Form-ID
   */
  id?: string;
}

// ============================================================================
// Component
// ============================================================================

export function FormWrapper<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  enableAutoSave = false,
  autoSaveDelay = 2000,
  onAutoSave,
  enableBeforeUnload = true,
  beforeUnloadMessage = "Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?",
  onSuccess,
  onError,
  className,
  id,
}: FormWrapperProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur", // Validierung beim Verlassen des Feldes
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting, dirtyFields },
  } = methods;

  const formRef = React.useRef<HTMLFormElement>(null);

  // Watch all values for auto-save
  const watchedValues = watch();

  // Track dirty state
  const isFormDirty = React.useMemo(() => {
    return Object.keys(dirtyFields).length > 0;
  }, [dirtyFields]);

  // Auto-Save
  const autoSaveRef = React.useRef<ReturnType<typeof createAutoSave> | null>(
    null
  );

  React.useEffect(() => {
    if (!enableAutoSave || !onAutoSave) return;

    if (!autoSaveRef.current) {
      autoSaveRef.current = createAutoSave(onAutoSave, autoSaveDelay);
    }

    if (isFormDirty) {
      autoSaveRef.current.save(watchedValues);
    }

    return () => {
      if (autoSaveRef.current) {
        autoSaveRef.current.cancel();
      }
    };
  }, [watchedValues, isFormDirty, enableAutoSave, onAutoSave, autoSaveDelay]);

  // Before-Unload-Warning
  React.useEffect(() => {
    if (!enableBeforeUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = beforeUnloadMessage;
        return beforeUnloadMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFormDirty, enableBeforeUnload, beforeUnloadMessage]);

  // Submit handler
  const onSubmitHandler = async (data: T) => {
    try {
      await onSubmit(data);

      if (onSuccess) {
        onSuccess(data);
      }

      // Reset dirty state nach erfolgreichem Submit
      methods.reset(data, { keepValues: true });
    } catch (error) {
      console.error("Form submission error:", error);

      if (onError && error instanceof Error) {
        onError(error);
      }

      // Re-throw für weitere Error-Handling
      throw error;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        id={id}
        onSubmit={handleSubmit(onSubmitHandler)}
        className={cn("space-y-6", className)}
        noValidate // Wir verwenden Zod für Validierung
      >
        {children(methods)}
      </form>
    </FormProvider>
  );
}

/**
 * Helper-Hook zum Zugriff auf Form-Context
 *
 * @example
 * ```tsx
 * function MyFormField() {
 *   const { register, formState: { errors } } = useFormContext<FormData>();
 *
 *   return (
 *     <FormField error={errors.email?.message}>
 *       <Input {...register("email")} />
 *     </FormField>
 *   );
 * }
 * ```
 */
export { useFormContext } from "react-hook-form";
