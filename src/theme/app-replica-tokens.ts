/**
 * Tokens for the **as-is replica** of the shipping Birdie POS app.
 *
 * These are read off the reference screenshots in `references/072926/` and exist
 * to document what the app looks like *today*. They are deliberately separate
 * from `tokens.ts` (the Birdie design system) — that file is the target state,
 * this one is the current state, and the two must not be conflated.
 *
 * The shipping app is Material Design 2: flat surfaces, 4px radii, ALL-CAPS
 * button labels, and a wider, more literal palette than the design system uses.
 */

export const appColors = {
    /** Top app bar, most bottom-bar buttons, drawer header. */
    slate: "#37414A",
    slateDark: "#2E363E",
    /** Login background, dialog header bars, the active category chip. */
    navy: "#1E2536",
    navyDeep: "#161C29",

    /** Primary / confirm — SIGN IN, SAVE, PAY when enabled, active view toggle. */
    green: "#5CAF6E",
    greenDark: "#4A9159",
    /** Paid tee times on the sheet. */
    greenTee: "#3D7A4D",
    /** Add to Cart on the dark tee-time detail screen. */
    greenDeep: "#1B5E20",

    /** The date bar on the tee sheet. Used for nothing else. */
    orange: "#ED9A4E",

    /** Booked tee times. Two shades alternate across adjacent slots. */
    purple: "#5B2FD6",
    purpleAlt: "#6F42E0",

    /** POP button, destructive rows. */
    red: "#E53950",
    /** Cancel / No Show on the dark detail screen. */
    redDark: "#7F1D1D",

    /** Disabled buttons and inactive category chips. */
    grey: "#9E9E9E",
    greyLight: "#C4C4C4",
    /** BLOCKED tee-sheet slots. */
    blocked: "#BDBDBD",

    /** Page canvas behind cards. */
    canvas: "#F1F3F5",
    canvasAlt: "#EEEEEE",
    surface: "#FFFFFF",
    /** The tinted filter bar on the Tabs screen. */
    filterBar: "#E8E4EE",

    divider: "#E0E0E0",
    textPrimary: "#1F2328",
    textSecondary: "#5F6771",
    textDisabled: "#9AA1A9",

    /** Seat colors on the Tables screen — assigned per seat index, cyclic. */
    seat: ["#3D7FA6", "#E8455F", "#C97B8B", "#6B8E5A", "#B08A3E", "#7A5FA6"],
} as const;

/**
 * The shipping app's chrome dimensions, in CSS px at the reference viewport
 * (~2580×1620 device pixels ≈ 1290×810 CSS px, a 10" tablet in landscape).
 */
export const appLayout = {
    appBarHeight: 64,
    /** Bottom action bar — a single row of equal-width buttons. */
    actionBarHeight: 72,
    actionBarGap: 8,
    /** Left-hand order/cart panel on the selling screens. */
    orderPanelWidth: 380,
    /** The flyout navigation drawer. */
    drawerWidth: 340,
    /** Dark identity block at the top of the drawer. */
    drawerHeaderHeight: 260,
    /** Secondary bar under the app bar — date nav on the tee sheet. */
    subBarHeight: 64,
    /** Stats strip under the date nav. */
    statBarHeight: 36,
    gutter: 16,
} as const;

/** MD2 shape: near-square. Nothing in the shipping app is meaningfully rounded. */
export const appRadius = {
    none: 0,
    button: 4,
    card: 4,
    tile: 2,
} as const;

export const appFont = {
    /** Roboto throughout — this is a stock Android Material app. */
    sans: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

/** Status → color for tee-sheet slots. */
export const teeSlotColors = {
    booked: appColors.purple,
    bookedAlt: appColors.purpleAlt,
    paid: appColors.greenTee,
    blocked: appColors.blocked,
    /** Multi-course view renders reservations on a dark navy card instead. */
    multi: "#2E3A4D",
    open: appColors.surface,
} as const;
