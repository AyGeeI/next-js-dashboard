/**
 * useDebounce Hook
 *
 * Hook zum Debouncing von Werten (z.B. für Search-Inputs)
 */

import { useState, useEffect } from "react";

/**
 * Debounced Value Hook
 *
 * @param value - Der zu debouncende Wert
 * @param delay - Delay in Millisekunden (default: 300ms)
 * @returns Der gedebouncte Wert
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // API-Call nur wenn sich debouncedSearchTerm ändert
 *   if (debouncedSearchTerm) {
 *     fetchSearchResults(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced Callback Hook
 *
 * @param callback - Die zu debouncende Funktion
 * @param delay - Delay in Millisekunden (default: 300ms)
 * @param deps - Abhängigkeiten (wie bei useEffect)
 * @returns Die gedebouncte Funktion
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback(
 *   (term: string) => {
 *     fetchSearchResults(term);
 *   },
 *   500,
 *   []
 * );
 *
 * <Input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * Leading Debounce Hook
 *
 * Führt die Funktion sofort beim ersten Call aus,
 * dann erst wieder nach dem Delay
 *
 * @example
 * ```tsx
 * const handleClick = useLeadingDebounce(() => {
 *   // Wird sofort beim ersten Click ausgeführt
 *   // Danach erst wieder nach 1000ms
 * }, 1000);
 * ```
 */
export function useLeadingDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args: Parameters<T>) => {
    if (!timeoutId) {
      // First call - execute immediately
      callback(...args);
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      setTimeoutId(null);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * Throttle Hook
 *
 * Führt die Funktion maximal einmal pro Intervall aus
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottle(() => {
 *   // Wird maximal alle 100ms ausgeführt
 *   checkScrollPosition();
 * }, 100);
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [lastRun, setLastRun] = useState(0);

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun >= delay) {
      callback(...args);
      setLastRun(now);
    }
  };
}
