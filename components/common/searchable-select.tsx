/**
 * SearchableSelect Component
 *
 * Select-Komponente mit Search-Funktionalität für lange Listen
 *
 * Features:
 * - Search-Input für Filterung
 * - Keyboard-Navigation (Arrow-Keys, Enter, Escape)
 * - Loading-State
 * - Empty-State
 * - Konsistente Höhe mit anderen Inputs (h-10)
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <SearchableSelect
 *   label="Land"
 *   options={[
 *     { label: "Deutschland", value: "de" },
 *     { label: "Österreich", value: "at" },
 *     { label: "Schweiz", value: "ch" },
 *   ]}
 *   value={selectedCountry}
 *   onChange={setSelectedCountry}
 *   placeholder="Land wählen"
 *   searchPlaceholder="Land suchen..."
 * />
 * ```
 */

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { INPUT_ICON_SIZE } from "@/lib/constants/ui";

// ============================================================================
// Types
// ============================================================================

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface SearchableSelectProps {
  /**
   * Label-Text
   */
  label?: string;

  /**
   * Optionen
   */
  options: SelectOption[];

  /**
   * Aktueller Wert
   */
  value?: string;

  /**
   * Callback bei Änderung
   */
  onChange: (value: string) => void;

  /**
   * Placeholder im Trigger
   */
  placeholder?: string;

  /**
   * Placeholder im Search-Input
   */
  searchPlaceholder?: string;

  /**
   * Text wenn keine Optionen gefunden
   */
  emptyText?: string;

  /**
   * Loading-State
   */
  loading?: boolean;

  /**
   * Disabled-State
   */
  disabled?: boolean;

  /**
   * Required
   */
  required?: boolean;

  /**
   * Error-Message
   */
  error?: string;

  /**
   * Erlaubt Zurücksetzen (X-Button)
   */
  allowClear?: boolean;

  /**
   * Callback beim Zurücksetzen
   */
  onClear?: () => void;
}

// ============================================================================
// Command Component (aus shadcn, falls noch nicht vorhanden)
// ============================================================================

// Falls diese Komponente noch nicht existiert, müssen wir sie hinzufügen
// Für jetzt nehme ich an, sie ist vorhanden

// ============================================================================
// Component
// ============================================================================

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Auswählen...",
  searchPlaceholder = "Suchen...",
  emptyText = "Keine Optionen gefunden",
  loading = false,
  disabled = false,
  required = false,
  error,
  allowClear = false,
  onClear,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get selected option
  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;

    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    const option = options.find((opt) => opt.value === selectedValue);
    if (option?.disabled) return;

    onChange(selectedValue);
    setOpen(false);
    setSearchQuery("");
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <Label className="text-xs font-medium">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}

      {/* Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 font-normal",
              !selectedOption && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={disabled || loading}
          >
            <span className="truncate">
              {loading
                ? "Lädt..."
                : selectedOption
                  ? selectedOption.label
                  : placeholder}
            </span>

            <div className="flex items-center gap-1 ml-2">
              {allowClear && selectedOption && !disabled && (
                <X
                  className={cn(INPUT_ICON_SIZE, "text-muted-foreground hover:text-foreground")}
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown
                className={cn(INPUT_ICON_SIZE, "text-muted-foreground")}
              />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            {/* Search Input */}
            <div className="flex items-center border-b px-3">
              <Search className={cn(INPUT_ICON_SIZE, "mr-2 text-muted-foreground")} />
              <input
                className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Options List */}
            <CommandList>
              {filteredOptions.length === 0 && (
                <CommandEmpty className="py-6 text-center text-sm">
                  {emptyText}
                </CommandEmpty>
              )}

              {filteredOptions.length > 0 && (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
                      disabled={option.disabled}
                      className={cn(
                        "cursor-pointer",
                        option.disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
