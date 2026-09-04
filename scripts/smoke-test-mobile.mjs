import { chromium } from "playwright";

/**
 * Smoke test for the **phone** prototype.
 *
 * The counter terminal has its own suite in `smoke-test.mjs`. This is the same
 * idea against `mobile.html`, and it exists for a specific reason: the two
 * builds are separate application shells over one store, so a reducer change
 * can break either. Testing only the terminal would let the phone rot silently,
 * and the phone is the one nobody opens out of habit.
 *
 * The viewport is the device: 402x797, the same canvas the Storybook `Mobile
 * Screens` category is drawn against. A test at desktop width would pass on
 * layouts that overflow on the hardware.
 */

const BASE = process.env.SMOKE_URL ?? "http://localhost:8098/tf-birdie-ds-v1/prototype/mobile.html";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 402, height: 797 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const step = async (label, fn) => {
    try {
        await fn();
        console.log(`  PASS  ${label}`);
    } catch (e) {
        console.log(`  FAIL  ${label} — ${e.message.split("\n")[0]}`);
        process.exitCode = 1;
    }
};

console.log("mobile prototype");
await page.goto(BASE, { waitUntil: "networkidle" });

await step("sign-in renders its own numeric keypad", async () => {
    await page.waitForSelector('input[aria-label="Enter your PIN"]', { timeout: 8000 });
    const keys = await page.getByRole("button", { name: /^[0-9]$/ }).count();
    if (keys !== 10) throw new Error(`${keys} number keys, expected 10`);
});

await step("a four-digit PIN signs in and lands on the register", async () => {
    for (const d of ["1", "2", "3", "4"]) await page.getByRole("button", { name: d, exact: true }).click();
    await page.waitForSelector("text=Pro Shop", { timeout: 8000 });
});

await step("categories carry photography and item counts", async () => {
    const body = await page.textContent("body");
    if (!/\d+ items/.test(body)) throw new Error("no item counts");
});

await step("drilling a category lists its products", async () => {
    await page
        .getByRole("button")
        .filter({ hasText: /items$/ })
        .first()
        .click();
    await page.waitForTimeout(400);
    const body = await page.textContent("body");
    if (!body.includes("$")) throw new Error("no priced products");
});

await step("tapping a product adds it and the nav count updates", async () => {
    await page.getByRole("button").filter({ hasText: /\$/ }).first().click();
    await page.waitForTimeout(400);
    if (!/Order · 1/.test(await page.textContent("body"))) throw new Error("nav count did not update");
});

await step("the Order tab shows the live cart", async () => {
    await page.getByRole("tab", { name: /Order/ }).click();
    await page.waitForTimeout(300);
    const body = await page.textContent("body");
    if (!body.includes("Ticket")) throw new Error("no ticket header");
    if (!/PAY \$/i.test(body)) throw new Error("no pay button carrying the total");
});

await step("Pay opens the tender with the amount owed", async () => {
    await page.getByRole("button", { name: /^PAY \$/i }).click();
    await page.waitForTimeout(500);
    const body = await page.textContent("body");
    if (!body.includes("Total owed")) throw new Error("no total owed");
    const tabs = await page.getByRole("tab").allTextContents();
    if (tabs.length !== 5) throw new Error(`${tabs.length} tender tabs, expected 5`);
});

await step("cash settles the ticket and prints an order number", async () => {
    await page.getByRole("button", { name: /^Exact/ }).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: /^TAKE \$/i }).click();
    await page.waitForTimeout(900);
    const body = await page.textContent("body");
    if (!body.includes("Paid in full")) throw new Error("sale did not complete");
    if (!/Order \d/.test(body)) throw new Error("no order number");
});

await step("the drawer carries every destination", async () => {
    await page.getByRole("button", { name: /back to register/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "menu" }).click();
    await page.waitForTimeout(300);
    const body = await page.textContent("body");
    for (const row of ["Tee Sheet", "Tabs", "Tables", "Gift Cards", "Inventory"]) {
        if (!body.includes(row)) throw new Error(`drawer missing ${row}`);
    }
});

await step("nothing overflows the 402px canvas", async () => {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (overflow) throw new Error("horizontal overflow at 402px");
});

await browser.close();

if (errors.length) {
    console.log(`\n${errors.length} runtime error(s):`);
    for (const e of errors.slice(0, 5)) console.log(`  ${e}`);
    process.exitCode = 1;
} else {
    console.log("\nNo runtime errors.");
}
