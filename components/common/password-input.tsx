/**
 * PasswordInput Component
 *
 * Wiederverwendbare Passwort-Input-Komponente mit konsistentem Verhalten
 *
 * Features:
 * - Password visibility toggle (Eye/EyeOff Icon)
 * - Optional: Password strength indicator
 * - Optional: Copy-to-clipboard button
 * - Konsistente Icon-Position und -Größe
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PasswordInput id="password" name="password" />
 *
 * // With strength indicator (für neue Passwörter)
 * <PasswordInput
 *   id="password"
 *   showStrengthIndicator
 *   onStrengthChange={(strength) => console.log(strength)}
 * />
 *
 * // With copy button (für API-Keys)
 * <PasswordInput
 *   id="api-key"
 *   showCopyButton
 *   placeholder="Ihr API-Schlüssel"
 * />
 * ```
 */

"use client";

import * as React from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordRequirements,
} from "@/lib/utils/validation";
import {
  PASSWORD_STRENGTH,
  INPUT_ICON_SIZE,
  TOAST_DURATION,
} from "@/lib/constants/ui";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface PasswordStrength {
  score: number;
  label: "Noch kein Passwort" | "Schwach" | "Solide" | "Stark";
  color: string;
  textColor: string;
}

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Zeigt Passwort-Stärke-Indikator unter dem Input
   */
  showStrengthIndicator?: boolean;

  /**
   * Zeigt Copy-to-Clipboard-Button
   */
  showCopyButton?: boolean;

  /**
   * Callback wenn sich Passwort-Stärke ändert
   */
  onStrengthChange?: (strength: PasswordStrength) => void;

  /**
   * Zeigt Anforderungen als Checklist
   */
  showRequirements?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      className,
      showStrengthIndicator = false,
      showCopyButton = false,
      showRequirements = false,
      onStrengthChange,
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [strength, setStrength] = React.useState<PasswordStrength>({
      score: 0,
      label: "Noch kein Passwort",
      color: PASSWORD_STRENGTH.weak.color,
      textColor: PASSWORD_STRENGTH.weak.textColor,
    });

    // Calculate password strength
    const password = (value as string) || "";

    React.useEffect(() => {
      if (!showStrengthIndicator && !showRequirements) return;

      const score = calculatePasswordStrength(password);
      const label = getPasswordStrengthLabel(password);

      let strengthData: PasswordStrength;

      if (score >= PASSWORD_STRENGTH.strong.minScore) {
        strengthData = {
          score,
          label,
          color: PASSWORD_STRENGTH.strong.color,
          textColor: PASSWORD_STRENGTH.strong.textColor,
        };
      } else if (score >= PASSWORD_STRENGTH.medium.minScore) {
        strengthData = {
          score,
          label,
          color: PASSWORD_STRENGTH.medium.color,
          textColor: PASSWORD_STRENGTH.medium.textColor,
        };
      } else {
        strengthData = {
          score,
          label,
          color: PASSWORD_STRENGTH.weak.color,
          textColor: PASSWORD_STRENGTH.weak.textColor,
        };
      }

      setStrength(strengthData);

      if (onStrengthChange) {
        onStrengthChange(strengthData);
      }
    }, [password, showStrengthIndicator, showRequirements, onStrengthChange]);

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
      if (!password) return;

      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        toast.success("In Zwischenablage kopiert", {
          duration: TOAST_DURATION.short,
        });

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        toast.error("Kopieren fehlgeschlagen");
      }
    };

    // Requirements checklist
    const requirements = showRequirements
      ? getPasswordRequirements(password)
      : [];

    // Calculate padding based on buttons
    const paddingRight = showCopyButton ? "pr-20" : "pr-10";

    return (
      <div className="w-full space-y-2">
        {/* Input with buttons */}
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(paddingRight, className)}
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />

          {/* Buttons container */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            {/* Copy button */}
            {showCopyButton && (
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                onClick={copyToClipboard}
                disabled={disabled || !password}
                aria-label={copied ? "Kopiert" : "In Zwischenablage kopieren"}
              >
                {copied ? (
                  <Check className={INPUT_ICON_SIZE} aria-hidden="true" />
                ) : (
                  <Copy className={INPUT_ICON_SIZE} aria-hidden="true" />
                )}
              </button>
            )}

            {/* Toggle visibility button */}
            <button
              type="button"
              className={cn(
                "flex items-center justify-center rounded-md px-3 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                disabled && "cursor-not-allowed opacity-50"
              )}
              onClick={togglePasswordVisibility}
              disabled={disabled}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className={INPUT_ICON_SIZE} aria-hidden="true" />
              ) : (
                <Eye className={INPUT_ICON_SIZE} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Strength indicator */}
        {showStrengthIndicator && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Passwortstärke</span>
              <span
                className={cn(
                  "font-medium",
                  password ? strength.textColor : "text-muted-foreground"
                )}
              >
                {strength.label}
              </span>
            </div>

            {/* Strength bars */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => {
                const isActive = strength.score > index * 2;
                return (
                  <span
                    key={index}
                    className={cn(
                      "h-1.5 rounded-sm bg-muted transition-colors",
                      isActive && strength.color
                    )}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Requirements checklist */}
        {showRequirements && password && (
          <ul className="space-y-1 text-xs" role="list">
            {requirements.map((req, index) => (
              <li
                key={index}
                className={cn(
                  "flex items-center gap-2",
                  req.fulfilled ? "text-success" : "text-muted-foreground"
                )}
              >
                {req.fulfilled ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <span className="h-3 w-3 flex items-center justify-center">
                    <span className="h-1 w-1 rounded-full bg-current" />
                  </span>
                )}
                <span>{req.requirement}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
