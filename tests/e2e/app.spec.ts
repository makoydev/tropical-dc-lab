import { expect, test } from "@playwright/test";

test("home page links into the simulator", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "TropicalDC Lab" })).toBeVisible();
  await page.getByRole("link", { name: "Start Simulation" }).click();
  await expect(page.getByRole("heading", { name: "Tropical data centre model" })).toBeVisible();
});

test("simulator updates PUE when IT load changes", async ({ page }) => {
  await page.goto("/simulator");

  await expect(page.getByText("PUE").first()).toBeVisible();
  const itLoad = page.getByLabel("IT Load");
  await itLoad.fill("2500");
  await expect(page.getByText("2,500 kW")).toBeVisible();
});

test("core MVP routes render", async ({ page }) => {
  for (const [path, heading] of [
    ["/compare", "Cooling strategy trade-offs"],
    ["/recommendations", "Ranked improvement signals"],
    ["/learn", "Data centre sustainability basics"],
    ["/report", "TropicalDC Lab scenario report"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});
