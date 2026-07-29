/**
 * Birdie POS design tokens.
 *
 * Every value here is chosen for one target: a **landscape Android tablet**
 * mounted at a point-of-sale station, operated by a standing staff member with
 * a finger (often a wet or gloved one), at roughly 40–70 cm viewing distance.
 *
 * That target drives three decisions that differ from a desktop web system:
 *   1. Touch targets start at 48dp, not 32–36px.
 *   2. Body text starts at 16px, never 14px.
 *   3. Layout is width-rich and height-poor, so vertical space is rationed.
 */

/* ------------------------------------------------------------------ *
 * Brand palette — Tenfore green, shared with the Fox & Buck systems.
 * ------------------------------------------------------------------ */

export const brand = {
    25: "#f6fcf8",
    50: "#ecfaf1",
    100: "#d1f2dd",
    200: "#a6e4bc",
    300: "#74d098",
    400: "#4ab675",
    500: "#339c5d",
    600: "#227c48", // primary interactive color
    700: "#1b643b",
    800: "#185031",
    900: "#144229",
    950: "#0a2617",
} as const;

/**
 * Neutrals. Slightly cool so the green brand reads as the only warm-ish accent
 * on screen — important when the POS is mostly chrome and the brand marks the
 * one action you want the operator to take.
 */
export const neutral = {
    25: "#fcfcfd",
    50: "#f9fafb",
    100: "#f2f4f7",
    200: "#e4e7ec",
    300: "#d0d5dd",
    400: "#98a2b3",
    500: "#667085",
    600: "#475467",
    700: "#344054",
    800: "#1d2939",
    900: "#101828",
    950: "#0c111d",
} as const;

/**
 * Status colors. Deliberately *not* green: brand green means "this is the
 * action to take", so a green success chip next to a green Charge button
 * would be ambiguous at a glance. Success here is a teal-shifted green that
 * separates cleanly from brand-600 under glare.
 */
export const status = {
    success: { light: "#d3f8e0", main: "#0e9f6e", dark: "#046c4e", contrast: "#ffffff" },
    warning: { light: "#fdf6b2", main: "#d9820a", dark: "#8e4b10", contrast: "#ffffff" },
    error: { light: "#fde2e1", main: "#d92d20", dark: "#912018", contrast: "#ffffff" },
    info: { light: "#d8e9fd", main: "#1570ef", dark: "#12518f", contrast: "#ffffff" },
} as const;

/* ------------------------------------------------------------------ *
 * Touch targets
 * ------------------------------------------------------------------ */

/**
 * Android's accessibility minimum is 48dp; WCAG 2.2 AA (2.5.8) asks for 24px
 * minimum, AAA (2.5.5) for 44px. 48 satisfies all three, so it is the floor —
 * nothing tappable in this system may be shorter than `min`.
 *
 * The larger sizes exist because POS work is *fast and eyes-off*: an operator
 * ringing up a round hits Charge without looking. The higher the cost of a
 * mis-tap, the bigger the target.
 */
export const touchTarget = {
    /** 48dp — absolute floor for any tappable element (icon buttons, list rows, tabs). */
    min: 48,
    /** 56dp — default for primary form controls and menu buttons. */
    comfortable: 56,
    /** 64dp — tender keys, order-grid tiles, numeric keypad. */
    large: 64,
    /** 80dp — the destructive/irreversible ones: Charge, Void, Refund. */
    critical: 80,
    /** Minimum gap between two adjacent targets, so a fat finger can't hit both. */
    minGap: 8,
} as const;

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

/**
 * Material 3 window size classes, in CSS px. A landscape 10" tablet lands in
 * `expanded`; a 12.4" lands in `large`. `compact`/`medium` are kept only so
 * components degrade sanely — they are not design targets for this product.
 */
export const breakpoints = {
    xs: 0, // compact  — phone portrait (not a target)
    sm: 600, // medium   — phone landscape / small tablet portrait (not a target)
    md: 840, // expanded — TARGET: 10" tablet landscape
    lg: 1200, // large    — TARGET: 12"+ tablet landscape
    xl: 1600, // extra-large — desk-docked tablet / external display
} as const;

/**
 * The standing POS chrome. Height is the scarce resource in landscape
 * (800px total on the most common device), so these are deliberately tight —
 * together they consume 136px, leaving ~664px of working canvas at 1280×800.
 */
export const layout = {
    /** Top app bar: store, till, operator, connection status. */
    appBarHeight: 64,
    /** Bottom action bar: the primary commit action for the current screen. */
    actionBarHeight: 72,
    /** Left icon rail — always visible, never a hamburger on a tablet. */
    navRailWidth: 88,
    /** Expanded nav drawer, when the rail is opened. */
    navDrawerWidth: 280,
    /** Right-hand order/cart panel — the constant companion of every POS screen. */
    orderPanelWidth: 380,
    /** Wider order panel at `lg` and up. */
    orderPanelWidthLarge: 440,
    /** Page gutter. */
    gutter: 24,
} as const;

/**
 * Reference devices. All landscape — this product has no portrait mode, and
 * these are the exact viewports wired into the Storybook toolbar.
 */
export const devices = {
    tablet10: { name: 'Tablet 10" landscape (1280×800)', width: 1280, height: 800 },
    tablet11: { name: 'Tablet 11" landscape (1366×768)', width: 1366, height: 768 },
    tablet12: { name: 'Tablet 12.4" landscape (1600×1000)', width: 1600, height: 1000 },
    tablet8: { name: 'Tablet 8" landscape (1024×768)', width: 1024, height: 768 },
    counterDisplay: { name: "Counter display (1920×1080)", width: 1920, height: 1080 },
} as const;

/* ------------------------------------------------------------------ *
 * Shape, spacing, motion
 * ------------------------------------------------------------------ */

/** 8px base grid. POS layouts stay on multiples of 8 so tiles align across panels. */
export const spacingUnit = 8;

/**
 * Radii run larger than a desktop system: at arm's length a 4px corner reads as
 * a hard edge, and softer tiles are easier to parse as discrete tap targets.
 */
export const radius = {
    none: 0,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    pill: 999,
} as const;

/**
 * Motion is fast by design. A POS operator repeats the same interaction hundreds
 * of times a shift; anything above ~200ms starts to feel like lag rather than polish.
 */
export const motion = {
    instant: 80,
    fast: 120,
    normal: 180,
    slow: 240,
} as const;

/** Typography scale, in px. Body starts at 16 — 14px is unreadable at counter distance. */
export const fontSize = {
    caption: 13,
    body2: 15,
    body1: 16,
    subtitle: 18,
    h6: 20,
    h5: 24,
    h4: 28,
    h3: 34,
    /** Amounts due, totals — the number the operator and the guest both look at. */
    display: 44,
} as const;

export const fontFamily = {
    /** Roboto is the Android system face; matching it keeps the web reference honest. */
    sans: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    /** Tabular figures for prices, quantities, and receipt columns. */
    mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;
