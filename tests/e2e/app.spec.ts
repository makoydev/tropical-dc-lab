import { expect, test } from "@playwright/test";

test("home page links into the simulator", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "TropicalDC Lab" })).toBeVisible();
  await page.getByRole("link", { name: "Start Simulation" }).click();
  await expect(page.getByRole("heading", { name: "Walk through a tropical data centre" })).toBeVisible();
});

test("simulator renders the 3D data centre and updates controls", async ({ page }) => {
  await page.goto("/simulator");

  await expect(page.getByLabel("Interactive 3D tropical data centre simulator")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(() => canvasHasRenderedPixels(page)).toBe(true);

  const itLoad = page.getByLabel("IT Load");
  await itLoad.fill("2500");
  await expect(page.getByText("2,500 kW")).toBeVisible();
});

test("3D scene renders on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/simulator");

  await expect(page.getByLabel("Interactive 3D tropical data centre simulator")).toBeVisible();
  await expect.poll(() => canvasHasRenderedPixels(page)).toBe(true);
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

async function canvasHasRenderedPixels(page: import("@playwright/test").Page) {
  return page.locator("canvas").evaluate((canvas) => {
    const element = canvas as HTMLCanvasElement;
    const context = element.getContext("webgl2") ?? element.getContext("webgl");
    if (!context || element.width < 100 || element.height < 100) {
      return false;
    }

    const pixels = new Uint8Array(4 * 40 * 40);
    const x = Math.max(0, Math.floor(element.width / 2) - 20);
    const y = Math.max(0, Math.floor(element.height / 2) - 20);
    context.readPixels(x, y, 40, 40, context.RGBA, context.UNSIGNED_BYTE, pixels);
    let nonDarkPixels = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      if (red + green + blue > 25) {
        nonDarkPixels += 1;
      }
    }

    return nonDarkPixels > 30;
  });
}
