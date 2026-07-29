import { createTheme, alpha } from "@mui/material/styles";
import type {} from "@mui/material/themeCssVarsAugmentation";

import { brand, breakpoints, fontFamily, fontSize, layout, motion, neutral, radius, spacingUnit, status, touchTarget } from "./tokens";

/**
 * The Birdie POS theme.
 *
 * Built on MUI v9 with CSS theme variables enabled, so light/dark switch without
 * a re-render and tokens are inspectable as `--mui-*` custom properties in devtools —
 * which matters here, because this Storybook's job is to be *read* as a spec by
 * whoever builds the Expo app, not just to run.
 *
 * The component overrides at the bottom are the substance: they encode the
 * landscape-tablet rules (48dp floor, 16px body, tight vertical rhythm) as
 * defaults, so a screen built from plain MUI components is tablet-correct
 * without anyone remembering to make it so.
 */

/* Extra tokens carried on the theme, reachable as `theme.birdie.*`. */
declare module "@mui/material/styles" {
    interface Theme {
        birdie: {
            touchTarget: typeof touchTarget;
            layout: typeof layout;
            radius: typeof radius;
            motion: typeof motion;
        };
    }
    interface ThemeOptions {
        birdie?: Theme["birdie"];
    }
}

export const birdieTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: "class",
    },

    birdie: { touchTarget, layout, radius, motion },

    breakpoints: { values: breakpoints },

    spacing: spacingUnit,

    shape: { borderRadius: radius.md },

    colorSchemes: {
        light: {
            palette: {
                primary: {
                    light: brand[400],
                    main: brand[600],
                    dark: brand[800],
                    contrastText: "#ffffff",
                },
                secondary: {
                    light: neutral[600],
                    main: neutral[800],
                    dark: neutral[900],
                    contrastText: "#ffffff",
                },
                success: {
                    light: status.success.light,
                    main: status.success.main,
                    dark: status.success.dark,
                    contrastText: status.success.contrast,
                },
                warning: {
                    light: status.warning.light,
                    main: status.warning.main,
                    dark: status.warning.dark,
                    contrastText: status.warning.contrast,
                },
                error: { light: status.error.light, main: status.error.main, dark: status.error.dark, contrastText: status.error.contrast },
                info: { light: status.info.light, main: status.info.main, dark: status.info.dark, contrastText: status.info.contrast },
                grey: neutral,
                background: {
                    default: neutral[100],
                    paper: "#ffffff",
                },
                text: {
                    primary: neutral[900],
                    secondary: neutral[600],
                    disabled: neutral[400],
                },
                divider: neutral[200],
            },
        },
        dark: {
            palette: {
                primary: {
                    light: brand[300],
                    main: brand[400],
                    dark: brand[600],
                    contrastText: neutral[950],
                },
                secondary: {
                    light: neutral[200],
                    main: neutral[300],
                    dark: neutral[500],
                    contrastText: neutral[950],
                },
                success: { light: status.success.light, main: "#34d399", dark: status.success.main, contrastText: neutral[950] },
                warning: { light: status.warning.light, main: "#f2b23b", dark: status.warning.main, contrastText: neutral[950] },
                error: { light: status.error.light, main: "#f4695f", dark: status.error.main, contrastText: neutral[950] },
                info: { light: status.info.light, main: "#5aa2f7", dark: status.info.main, contrastText: neutral[950] },
                grey: neutral,
                background: {
                    default: neutral[950],
                    paper: neutral[900],
                },
                text: {
                    primary: neutral[50],
                    secondary: neutral[400],
                    disabled: neutral[600],
                },
                divider: alpha(neutral[400], 0.24),
            },
        },
    },

    /**
     * Type scale for counter distance. Every step is at least 15px; `button` is
     * 16px and no longer uppercase — ALL CAPS costs legibility at a glance and
     * POS buttons are read in a hurry, not admired.
     */
    typography: {
        fontFamily: fontFamily.sans,
        htmlFontSize: 16,
        fontSize: fontSize.body1,
        h1: { fontSize: fontSize.display, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" },
        h2: { fontSize: fontSize.h3, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.015em" },
        h3: { fontSize: fontSize.h4, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" },
        h4: { fontSize: fontSize.h5, fontWeight: 600, lineHeight: 1.3 },
        h5: { fontSize: fontSize.h6, fontWeight: 600, lineHeight: 1.35 },
        h6: { fontSize: fontSize.subtitle, fontWeight: 600, lineHeight: 1.4 },
        subtitle1: { fontSize: fontSize.subtitle, fontWeight: 500, lineHeight: 1.45 },
        subtitle2: { fontSize: fontSize.body1, fontWeight: 600, lineHeight: 1.45 },
        body1: { fontSize: fontSize.body1, lineHeight: 1.5 },
        body2: { fontSize: fontSize.body2, lineHeight: 1.5 },
        button: { fontSize: fontSize.body1, fontWeight: 600, textTransform: "none", letterSpacing: 0 },
        caption: { fontSize: fontSize.caption, lineHeight: 1.4, letterSpacing: "0.01em" },
        overline: { fontSize: fontSize.caption, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" },
    },

    transitions: {
        duration: {
            shortest: motion.instant,
            shorter: motion.fast,
            short: motion.normal,
            standard: motion.normal,
            complex: motion.slow,
            enteringScreen: motion.fast,
            leavingScreen: motion.instant,
        },
    },

    components: {
        /* Touch behavior that applies app-wide. */
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    // The POS is a fixed-canvas app: no page-level scroll, no
                    // pull-to-refresh, no double-tap zoom stealing a tender tap.
                    height: "100%",
                    overscrollBehavior: "none",
                    WebkitTextSizeAdjust: "100%",
                    touchAction: "manipulation",
                },
                body: {
                    height: "100%",
                    // Long-press text selection is noise on a POS — the operator
                    // is tapping, not reading prose. Re-enable per-component where
                    // copying actually matters (receipt numbers, guest details).
                    WebkitTapHighlightColor: "transparent",
                    userSelect: "none",
                },
                "input, textarea": { userSelect: "text" },
            },
        },

        MuiButton: {
            defaultProps: { variant: "contained", disableElevation: true },
            styleOverrides: {
                root: {
                    minHeight: touchTarget.comfortable,
                    borderRadius: radius.md,
                    paddingInline: 20,
                    "&.MuiButton-sizeSmall": { minHeight: touchTarget.min, paddingInline: 16, fontSize: fontSize.body2 },
                    "&.MuiButton-sizeLarge": { minHeight: touchTarget.large, paddingInline: 28, fontSize: fontSize.subtitle },
                },
            },
        },

        MuiIconButton: {
            styleOverrides: {
                root: {
                    // An icon button is the easiest control to under-size; pin the
                    // floor here so no screen can accidentally ship a 36px target.
                    minWidth: touchTarget.min,
                    minHeight: touchTarget.min,
                    borderRadius: radius.md,
                },
                sizeLarge: { minWidth: touchTarget.comfortable, minHeight: touchTarget.comfortable },
            },
        },

        MuiToggleButton: {
            styleOverrides: {
                root: {
                    minHeight: touchTarget.comfortable,
                    borderRadius: radius.md,
                    textTransform: "none",
                    fontSize: fontSize.body1,
                    paddingInline: 20,
                },
            },
        },

        MuiFab: {
            styleOverrides: { root: { minHeight: touchTarget.large, minWidth: touchTarget.large } },
        },

        MuiTextField: {
            defaultProps: { variant: "outlined", fullWidth: true },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: radius.md,
                    minHeight: touchTarget.comfortable,
                    backgroundColor: "var(--mui-palette-background-paper)",
                },
                input: { fontSize: fontSize.body1, paddingBlock: 16 },
            },
        },

        MuiInputLabel: {
            styleOverrides: { root: { fontSize: fontSize.body1 } },
        },

        MuiSelect: {
            styleOverrides: {
                select: { minHeight: `${touchTarget.comfortable - 32}px !important`, display: "flex", alignItems: "center" },
            },
        },

        MuiMenuItem: {
            styleOverrides: { root: { minHeight: touchTarget.comfortable, fontSize: fontSize.body1, paddingInline: 20 } },
        },

        MuiListItemButton: {
            styleOverrides: { root: { minHeight: touchTarget.comfortable, borderRadius: radius.md } },
        },

        MuiCheckbox: {
            styleOverrides: { root: { padding: 12 } }, // 24px glyph + 24px padding = 48dp
        },
        MuiRadio: {
            styleOverrides: { root: { padding: 12 } },
        },
        MuiSwitch: {
            defaultProps: { size: "medium" },
        },

        MuiTab: {
            styleOverrides: {
                root: { minHeight: touchTarget.comfortable, textTransform: "none", fontSize: fontSize.body1, fontWeight: 600 },
            },
        },
        MuiTabs: {
            styleOverrides: { root: { minHeight: touchTarget.comfortable } },
        },

        MuiChip: {
            styleOverrides: {
                root: { height: 36, fontSize: fontSize.body2, borderRadius: radius.sm },
                // Only *interactive* chips need the 48dp floor; a read-only status
                // chip is a label, and forcing it to 48 would wreck table density.
                clickable: { height: touchTarget.min, paddingInline: 6 },
            },
        },

        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    borderRadius: radius.lg,
                    border: "1px solid var(--mui-palette-divider)",
                    backgroundImage: "none",
                },
            },
        },

        MuiPaper: {
            styleOverrides: { root: { backgroundImage: "none" } },
        },

        MuiDialog: {
            styleOverrides: { paper: { borderRadius: radius.xl } },
        },
        MuiDialogTitle: {
            styleOverrides: { root: { fontSize: fontSize.h5, fontWeight: 700, paddingBlock: 20 } },
        },
        MuiDialogActions: {
            styleOverrides: { root: { padding: 20, gap: touchTarget.minGap } },
        },

        MuiTableCell: {
            styleOverrides: {
                root: { fontSize: fontSize.body2, paddingBlock: 12 },
                head: {
                    fontWeight: 600,
                    fontSize: fontSize.caption,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--mui-palette-text-secondary)",
                },
            },
        },
        MuiTableRow: {
            styleOverrides: { root: { "&.MuiTableRow-hover": { minHeight: touchTarget.min } } },
        },

        MuiTooltip: {
            // Tooltips are hover affordances and a finger has no hover. They stay
            // available for docked/stylus use, but no POS flow may depend on one.
            defaultProps: { enterTouchDelay: 400, leaveTouchDelay: 3000 },
            styleOverrides: { tooltip: { fontSize: fontSize.body2, padding: "8px 12px", borderRadius: radius.sm } },
        },

        MuiAlert: {
            styleOverrides: { root: { borderRadius: radius.md, fontSize: fontSize.body1, paddingBlock: 12 } },
        },

        MuiSnackbar: {
            defaultProps: { anchorOrigin: { vertical: "bottom", horizontal: "center" } },
        },

        MuiAppBar: {
            defaultProps: { elevation: 0, color: "default" },
            styleOverrides: {
                root: { borderBottom: "1px solid var(--mui-palette-divider)", backgroundImage: "none" },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: { minHeight: `${layout.appBarHeight}px !important`, paddingInline: layout.gutter },
            },
        },

        MuiSlider: {
            styleOverrides: { thumb: { width: 28, height: 28 }, rail: { height: 8 }, track: { height: 8 } },
        },
    },
});

export default birdieTheme;
