import { chromium } from "playwright";

const BASE = process.env.SMOKE_URL ?? "http://localhost:8098/tf-birdie-ds-v1/prototype/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

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

await page.goto(BASE, { waitUntil: "networkidle" });

await step("sign-in screen renders", async () => {
    await page.waitForSelector('input[aria-label="Enter your PIN"]', { timeout: 8000 });
});

await step("PIN sign-in routes to the register", async () => {
    await page.fill('input[aria-label="Enter your PIN"]', "1234");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForSelector("text=Pro Shop Order", { timeout: 8000 });
});

await step("empty cart shows the antler empty state", async () => {
    await page.waitForSelector("text=No items in order.", { timeout: 5000 });
});

await step("tapping a tile adds a line and a total", async () => {
    await page.getByRole("button", { name: /Green Fees/i }).click();
    await page.getByText("Green fee — 18", { exact: true }).first().click();
    await page.waitForSelector("text=Ticket #", { timeout: 5000 });
    const pay = await page
        .getByRole("button", { name: /Pay \$/ })
        .first()
        .textContent();
    if (!/Pay \$6[0-9]\./.test(pay)) throw new Error(`unexpected pay button: ${pay}`);
});

await step("quantity increases update the total", async () => {
    await page
        .getByRole("button", { name: /^Increase/ })
        .first()
        .click();
    const pay = await page
        .getByRole("button", { name: /Pay \$/ })
        .first()
        .textContent();
    if (!/Pay \$1[0-9][0-9]\./.test(pay)) throw new Error(`total did not double: ${pay}`);
});

await step("PAY routes to tender with the real amount", async () => {
    await page
        .getByRole("button", { name: /Pay \$/ })
        .first()
        .click();
    await page.waitForSelector("text=Amount due", { timeout: 5000 });
    await page.waitForSelector("text=How is this being paid?", { timeout: 5000 });
});

await step("cash tender computes change", async () => {
    await page.getByRole("button", { name: "Cash", exact: true }).click();
    await page.waitForSelector("text=Quick cash", { timeout: 5000 });
    await page.getByRole("button", { name: /^\$\d/ }).first().click();
    await page.waitForSelector("text=Change due", { timeout: 5000 });
});

await step("tender completes the sale", async () => {
    await page.getByRole("button", { name: /Tender \$/ }).click();
    await page.waitForSelector("text=Approved", { timeout: 5000 });
});

await step("completed sale appears in Order Lookup", async () => {
    await page.goto(`${BASE}#/orderlookup`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Cash", { timeout: 5000 });
});

await step("drawer navigates to the tee sheet", async () => {
    await page.goto(`${BASE}#/proshop`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /open navigation/i }).click();
    await page.getByRole("button", { name: "Tee Sheet", exact: true }).click();
    await page.waitForSelector("text=SATURDAY, JULY 29 2026", { timeout: 5000 });
});

await step("tee-sheet check-in creates a ticket in the register", async () => {
    await page.getByText("Ellis, J.", { exact: false }).first().click();
    await page.waitForSelector("text=Add all to ticket", { timeout: 5000 });
    await page.getByRole("button", { name: /Add all to ticket/ }).click();
    await page.waitForSelector("text=Green fee — 18 · Member", { timeout: 5000 });
});

await step("held ticket appears on the tabs list", async () => {
    await page.getByRole("button", { name: "Pop", exact: true }).click();
    await page.goto(`${BASE}#/tabs`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Ellis, J.", { timeout: 5000 });
});

console.log(errors.length ? `\nRUNTIME ERRORS (${errors.length}):` : "\nNo runtime errors.");
errors.slice(0, 6).forEach((e) => console.log("  " + e.slice(0, 160)));
if (errors.length) process.exitCode = 1;

await browser.close();
