/**
 * UI Constants
 *
 * Zentrale Konstanten für konsistentes UI-Verhalten im gesamten Projekt
 */

// ============================================================================
// Toast & Notifications
// ============================================================================

export const TOAST_DURATION = {
  short: 3000,   // 3 Sekunden
  normal: 5000,  // 5 Sekunden (Standard)
  long: 7000,    // 7 Sekunden
  infinite: 0,   // Kein Auto-Dismiss
} as const;

export const TOAST_POSITION = "bottom-right" as const;

export const TOAST_MAX_VISIBLE = 3;

// ============================================================================
// Form & Input
// ============================================================================

export const INPUT_DEBOUNCE_MS = {
  fast: 150,     // Für UI-Feedback
  normal: 300,   // Standard für Validierung
  slow: 500,     // Für API-Calls
  search: 300,   // Für Suche
} as const;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

// ============================================================================
// Animations & Transitions
// ============================================================================

export const TRANSITIONS = {
  fast: "transition-all duration-150",
  normal: "transition-all duration-200",
  slow: "transition-all duration-300",
  colors: "transition-colors duration-200",
} as const;

export const ANIMATIONS = {
  fadeIn: "animate-in fade-in-0",
  fadeOut: "animate-out fade-out-0",
  slideIn: "animate-in slide-in-from-bottom-4",
  slideOut: "animate-out slide-out-to-bottom-4",
  scaleIn: "animate-in zoom-in-95",
  scaleOut: "animate-out zoom-out-95",
} as const;

// ============================================================================
// Loading States
// ============================================================================

export const SPINNER_SIZE = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
} as const;

export const LOADING_TEXT = {
  saving: "Speichere...",
  loading: "Wird geladen...",
  submitting: "Wird gesendet...",
  deleting: "Wird gelöscht...",
  processing: "Verarbeite...",
  connecting: "Verbinde...",
  disconnecting: "Trenne...",
  testing: "Teste...",
  authenticating: "Authentifiziere...",
} as const;

// ============================================================================
// Touch & Click
// ============================================================================

export const TOUCH_TARGET_MIN_SIZE = 44; // px (iOS/Android Guidelines)

export const CLICK_DELAY_MS = 0; // Kein Delay für bessere Responsiveness

// ============================================================================
// Tooltips & Popovers
// ============================================================================

export const TOOLTIP_DELAY_MS = 150;

export const POPOVER_OFFSET = 8; // px

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  commandPalette: { key: "k", metaKey: true, ctrlKey: true },
  search: { key: "/", metaKey: false },
  help: { key: "?", shiftKey: true },

  // Navigation
  goHome: { key: "h", prefix: "g" },
  goSettings: { key: "s", prefix: "g" },
  goAccount: { key: "a", prefix: "g" },

  // Actions
  save: { key: "s", metaKey: true, ctrlKey: true },
  cancel: { key: "Escape" },
} as const;

// ============================================================================
// Breakpoints (matching Tailwind)
// ============================================================================

export const BREAKPOINTS = {
  sm: 640,   // px
  md: 768,   // px
  lg: 1024,  // px
  xl: 1280,  // px
  "2xl": 1536, // px
} as const;

// ============================================================================
// Z-Index Layers
// ============================================================================

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ============================================================================
// Icon Sizes
// ============================================================================

export const ICON_SIZE = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

// Standard-Icon-Größe für Buttons
export const BUTTON_ICON_SIZE = ICON_SIZE.sm; // h-4 w-4

// Standard-Icon-Größe für Input-Addons (Password-Toggle, etc.)
export const INPUT_ICON_SIZE = ICON_SIZE.sm; // h-4 w-4

// ============================================================================
// Spacing & Layout
// ============================================================================

export const CONTAINER_MAX_WIDTH = "max-w-7xl";

export const PAGE_PADDING = {
  mobile: "px-4",
  desktop: "px-8",
} as const;

export const SECTION_SPACING = {
  small: "space-y-4",
  normal: "space-y-6",
  large: "space-y-10",
} as const;

// ============================================================================
// Password Strength
// ============================================================================

export const PASSWORD_STRENGTH = {
  weak: {
    label: "Schwach",
    color: "bg-destructive",
    textColor: "text-destructive",
    minScore: 0,
  },
  medium: {
    label: "Solide",
    color: "bg-warning",
    textColor: "text-warning",
    minScore: 3,
  },
  strong: {
    label: "Stark",
    color: "bg-success",
    textColor: "text-success",
    minScore: 5,
  },
} as const;

export const PASSWORD_REQUIREMENTS = [
  "Mindestens 12 Zeichen",
  "Groß- und Kleinbuchstaben",
  "Mindestens eine Zahl",
  "Mindestens ein Sonderzeichen",
] as const;

// ============================================================================
// Validation Messages
// ============================================================================

export const VALIDATION_MESSAGES = {
  required: "Dieses Feld ist erforderlich",
  email: "Bitte gib eine gültige E-Mail-Adresse ein",
  password: {
    tooShort: `Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein`,
    tooLong: `Passwort darf maximal ${PASSWORD_MAX_LENGTH} Zeichen lang sein`,
    noUppercase: "Passwort muss mindestens einen Großbuchstaben enthalten",
    noLowercase: "Passwort muss mindestens einen Kleinbuchstaben enthalten",
    noNumber: "Passwort muss mindestens eine Zahl enthalten",
    noSpecialChar: "Passwort muss mindestens ein Sonderzeichen enthalten",
    mismatch: "Passwörter stimmen nicht überein",
  },
  username: {
    tooShort: `Benutzername muss mindestens ${USERNAME_MIN_LENGTH} Zeichen lang sein`,
    tooLong: `Benutzername darf maximal ${USERNAME_MAX_LENGTH} Zeichen lang sein`,
    invalid: "Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten",
  },
} as const;

// ============================================================================
// Accessibility
// ============================================================================

export const A11Y = {
  skipToContentId: "main-content",
  skipToContentLabel: "Zum Hauptinhalt springen",

  // ARIA Live Regions
  liveRegionPolite: "polite",
  liveRegionAssertive: "assertive",

  // Focus Management
  focusRingClasses: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
} as const;

// ============================================================================
// Data Display
// ============================================================================

export const TABLE_PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_TABLE_PAGE_SIZE = 25;

export const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  info: "hsl(var(--info))",
  muted: "hsl(var(--muted-foreground))",
} as const;

// ============================================================================
// Time & Date
// ============================================================================

export const DATE_FORMATS = {
  short: "dd.MM.yyyy",
  long: "dd. MMMM yyyy",
  withTime: "dd.MM.yyyy HH:mm",
  time: "HH:mm",
} as const;

export const TIME_RANGES = {
  "7d": "Letzte 7 Tage",
  "30d": "Letzte 30 Tage",
  "90d": "Letzte 90 Tage",
  "12m": "Letztes Jahr",
  "all": "Alle",
} as const;

// ============================================================================
// API & Network
// ============================================================================

export const API_TIMEOUT_MS = 30000; // 30 Sekunden

export const RETRY_ATTEMPTS = 3;

export const RETRY_DELAY_MS = {
  first: 1000,   // 1 Sekunde
  second: 2000,  // 2 Sekunden
  third: 4000,   // 4 Sekunden
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  theme: "theme",
  sidebarCollapsed: "sidebar-collapsed",
  recentSearches: "recent-searches",
  onboardingCompleted: "onboarding-completed",
  dashboardLayout: "dashboard-layout",
} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type ToastDuration = typeof TOAST_DURATION[keyof typeof TOAST_DURATION];
export type TransitionClass = typeof TRANSITIONS[keyof typeof TRANSITIONS];
export type AnimationClass = typeof ANIMATIONS[keyof typeof ANIMATIONS];
export type SpinnerSize = typeof SPINNER_SIZE[keyof typeof SPINNER_SIZE];
export type IconSize = typeof ICON_SIZE[keyof typeof ICON_SIZE];
export type Breakpoint = keyof typeof BREAKPOINTS;
export type TimeRange = keyof typeof TIME_RANGES;
