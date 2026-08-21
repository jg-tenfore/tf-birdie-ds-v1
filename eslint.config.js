import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import tseslint from "typescript-eslint";

/**
 * Deliberately narrow.
 *
 * This repo is a design system and a prototype, not an application with a test
 * suite behind it. A lint config that argues about style would fight Prettier
 * and get switched off; the rules kept here are the ones that catch things
 * `tsc` does not — hooks called conditionally, a `useEffect` missing a
 * dependency, an unused import left behind by a refactor, a promise nobody
 * awaited.
 *
 * Formatting is Prettier's job and is not duplicated here.
 */
export default tseslint.config(
    { ignores: ["dist/**", "storybook-static/**", "node_modules/**", "references/**", "store/**", "src/data/store-catalog.ts"] },

    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    ...storybook.configs["flat/recommended"],

    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            globals: { ...globals.browser, ...globals.es2024 },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        rules: {
            // An underscore prefix is the established way to say "deliberately
            // unused" — a destructured prop kept for documentation, a caught
            // error that is genuinely ignored.
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
            ],
            // The prototype uses `any` in a few places where the shape is a
            // fixture rather than a contract. Worth seeing, not worth blocking.
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },

    {
        // Node scripts, not browser code.
        //
        // Browser globals are included too, and not by mistake: the Playwright
        // scripts pass callbacks to `page.evaluate()`, which serialises them and
        // runs them **in the page**. `document` and `getComputedStyle` are
        // genuinely defined where those bodies execute, and ESLint has no way to
        // know it is looking at two runtimes in one file.
        files: ["scripts/**/*.mjs", "*.config.{js,mjs,ts}", ".storybook/**/*.{ts,tsx}"],
        languageOptions: { globals: { ...globals.node, ...globals.browser } },
    },
);
