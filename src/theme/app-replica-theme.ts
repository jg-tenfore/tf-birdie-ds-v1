import { createTheme } from "@mui/material/styles";

import { appColors, appFont, appLayout, appRadius } from "./app-replica-tokens";

/**
 * The **as-is replica theme** — MUI configured to look like the shipping Birdie
 * POS app rather than like the Birdie design system.
 *
 * Applied only to `App Screens/*` stories, via a decorator. Foundations and
 * Components keep `birdieTheme`, because that library is the target state and
 * must not become a copy of the current app.
 *
 * Key differences from `birdieTheme`:
 *   - ALL-CAPS button labels (MD2 default), which the design system rejects
 *   - 4px radii instead of 10–14px
 *   - Slate/navy chrome instead of neutral surfaces with a green accent
 *   - No enforced 48dp floor — this documents what ships, including where the
 *     current app falls short of it
 */
export const appReplicaTheme = createTheme({
    cssVariables: { colorSchemeSelector: "class" },

    breakpoints: { values: { xs: 0, sm: 600, md: 840, lg: 1200, xl: 1600 } },

    shape: { borderRadius: appRadius.button },

    palette: {
        mode: "light",
        primary: { main: appColors.green, dark: appColors.greenDark, contrastText: "#fff" },
        secondary: { main: appColors.slate, dark: appColors.slateDark, contrastText: "#fff" },
        error: { main: appColors.red, dark: appColors.redDark, contrastText: "#fff" },
        warning: { main: appColors.orange, contrastText: "#fff" },
        info: { main: appColors.navy, contrastText: "#fff" },
        success: { main: appColors.greenTee, contrastText: "#fff" },
        background: { default: appColors.canvas, paper: appColors.surface },
        text: { primary: appColors.textPrimary, secondary: appColors.textSecondary, disabled: appColors.textDisabled },
        divider: appColors.divider,
    },

    typography: {
        fontFamily: appFont.sans,
        htmlFontSize: 16,
        h1: { fontSize: 34, fontWeight: 400 },
        h2: { fontSize: 28, fontWeight: 400 },
        h3: { fontSize: 24, fontWeight: 400 },
        h4: { fontSize: 20, fontWeight: 400 },
        h5: { fontSize: 18, fontWeight: 500 },
        h6: { fontSize: 16, fontWeight: 500 },
        subtitle1: { fontSize: 16, fontWeight: 400 },
        subtitle2: { fontSize: 14, fontWeight: 500 },
        body1: { fontSize: 15, fontWeight: 400 },
        body2: { fontSize: 13, fontWeight: 400 },
        // ALL CAPS with letter-spacing — the MD2 button style the app ships.
        button: { fontSize: 14, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" },
        caption: { fontSize: 12 },
        overline: { fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" },
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: { height: "100%", overscrollBehavior: "none", touchAction: "manipulation" },
                body: { height: "100%", WebkitTapHighlightColor: "transparent" },
            },
        },

        MuiButton: {
            defaultProps: { variant: "contained", disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: appRadius.button,
                    minHeight: 48,
                    paddingInline: 16,
                    // v9 removed the `contained<Color>` styleOverride slots; the
                    // variants API is the supported way to target a combination.
                    variants: [
                        {
                            // Bottom-bar buttons are slate, not brand green — green
                            // is reserved for the confirming action in each bar.
                            props: { variant: "contained", color: "secondary" },
                            style: { backgroundColor: appColors.slate, "&:hover": { backgroundColor: appColors.slateDark } },
                        },
                    ],
                },
            },
        },

        MuiAppBar: {
            defaultProps: { elevation: 0, color: "default" },
            styleOverrides: {
                root: { backgroundColor: appColors.slate, color: "#fff", backgroundImage: "none" },
            },
        },
        MuiToolbar: {
            styleOverrides: { root: { minHeight: `${appLayout.appBarHeight}px !important`, paddingInline: 16 } },
        },

        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiCard: {
            defaultProps: { elevation: 1 },
            styleOverrides: { root: { borderRadius: appRadius.card, backgroundImage: "none" } },
        },

        MuiTextField: { defaultProps: { variant: "standard", fullWidth: true } },
        MuiInputBase: { styleOverrides: { input: { fontSize: 16 } } },

        MuiDialog: { styleOverrides: { paper: { borderRadius: appRadius.card } } },
        MuiDialogTitle: {
            styleOverrides: {
                // Dialog headers are a solid navy bar with centered white text.
                root: { backgroundColor: appColors.navy, color: "#fff", textAlign: "center", fontSize: 20, paddingBlock: 16 },
            },
        },

        MuiTableCell: {
            styleOverrides: {
                root: { fontSize: 14, paddingBlock: 12 },
                head: { fontWeight: 500, color: appColors.textSecondary },
            },
        },

        MuiListItemButton: { styleOverrides: { root: { minHeight: 56 } } },
        MuiChip: { styleOverrides: { root: { borderRadius: appRadius.button } } },
        MuiTab: { styleOverrides: { root: { textTransform: "uppercase", fontSize: 14 } } },
    },
});

export default appReplicaTheme;
