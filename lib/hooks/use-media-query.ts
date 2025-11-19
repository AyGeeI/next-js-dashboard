/**
 * useMediaQuery Hook
 *
 * Hook für responsive Design - prüft Media Queries
 */

import { useState, useEffect } from "react";

/**
 * Hook zum Prüfen von Media Queries
 *
 * @param query - Media Query String (z.B. "(min-width: 768px)")
 * @returns boolean - Ob die Media Query zutrifft
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Server-Side Rendering Check
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Initial value
    setMatches(mediaQuery.matches);

    // Event Listener für Änderungen
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern Browsers
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Vordefinierte Media Query Hooks für häufige Breakpoints
 */

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsLargeDesktop() {
  return useMediaQuery("(min-width: 1280px)");
}

/**
 * Tailwind Breakpoints
 */

export function useIsSmallScreen() {
  return useMediaQuery("(min-width: 640px)");
}

export function useIsMediumScreen() {
  return useMediaQuery("(min-width: 768px)");
}

export function useIsLargeScreen() {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsExtraLargeScreen() {
  return useMediaQuery("(min-width: 1280px)");
}

export function useIs2ExtraLargeScreen() {
  return useMediaQuery("(min-width: 1536px)");
}

/**
 * Accessibility & User Preferences
 */

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function usePrefersDarkMode() {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

export function usePrefersHighContrast() {
  return useMediaQuery("(prefers-contrast: high)");
}

/**
 * Device Orientation
 */

export function useIsPortrait() {
  return useMediaQuery("(orientation: portrait)");
}

export function useIsLandscape() {
  return useMediaQuery("(orientation: landscape)");
}

/**
 * Touch Support
 */

export function useIsTouchDevice() {
  return useMediaQuery("(hover: none) and (pointer: coarse)");
}

export function useIsHoverCapable() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
