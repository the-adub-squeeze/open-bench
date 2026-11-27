import { expect, test } from "@playwright/test";

/**
 * Live-ish smoke against the built SPA + configured Supabase.
 * Requires VITE_SUPABASE_* in the environment used for `bun run build`.
 * Against production: PLAYWRIGHT_BASE_URL=https://the-adub-squeeze.github.io/open-bench/ bun run test:e2e
 */
test.describe("Open Bench community smoke", () => {
  test("loads ledger and community CTAs", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("heading", { name: /A free shop/i })).toBeVisible();
    await expect(page.getByTestId("ledger")).toBeVisible();
    await expect(page.getByTestId("donate-form")).toBeVisible();
    await expect(page.getByTestId("suggest-form")).toBeVisible();
  });

  test("suggests a space and shows success", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("./#spaces");
    await page.getByTestId("suggest-title").fill(`Smoke shed ${stamp}`);
    await page.getByTestId("suggest-submit").click();
    await expect(page.getByTestId("suggest-success")).toBeVisible();
    await expect(page.getByText(`Smoke shed ${stamp}`)).toBeVisible();
  });

  test("logs a community donation onto the ledger", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("./#donate");
    await page.getByTestId("donate-amount").fill("7");
    await page.getByTestId("donate-name").fill(`Smoke neighbor ${stamp}`);
    await page.getByTestId("donate-method").fill("integration test");
    await page.getByTestId("donate-submit").click();
    await expect(page.getByTestId("donate-success")).toBeVisible();
    await page.goto("./#ledger");
    await expect(page.getByText(`Donation from Smoke neighbor ${stamp}`)).toBeVisible();
    await expect(page.getByTestId("ledger").getByText("$7")).toBeVisible();
  });
});
