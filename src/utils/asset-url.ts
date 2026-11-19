/**
 * Resolves a static asset served by Storybook's `staticDirs`.
 *
 * Necessary because the deployed Storybook lives under a repo subpath
 * (`/tf-birdie-ds-v1/storybook/`) while dev serves from `/`. A hard-coded
 * `/logos/x.svg` works locally and 404s on GitHub Pages — the exact bug that
 * only shows up after deploy, so it is centralized here instead.
 */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

/**
 * Resolves a product photo from the store catalog.
 *
 * Takes a `StoreProduct.path` (e.g. `"equipment/golf-balls/foo.webp"`) and
 * returns a URL under the `/store-images` static dir.
 */
export const storeImage = (path: string) => assetUrl(`store-images/${path.replace(/^\//, "")}`);

/**
 * Resolves a profile photo from the `/avatars` static dir.
 *
 * Takes a file name (e.g. `"weston-farnsworth.jpg"`). Square source images,
 * because every consumer clips them to a circle.
 */
export const avatarImage = (file: string) => assetUrl(`avatars/${file.replace(/^\//, "")}`);
