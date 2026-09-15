import { test, expect } from "@playwright/test";

const page_url = () =>
  (process.env.STUDY_URL || "http://127.0.0.1:5173") + "/bumblebee.html";

test("scout robot, scrub, coupe, mechanisms and silhouette", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(page_url());
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForFunction(() => window.study?.state.assemblies > 20);
  await expect(page).toHaveTitle("Form Foundry — Bumblebee");
  expect(await page.evaluate(() => window.study.state.model)).toBe("bumblebee");
  expect(
    await page.evaluate(() => window.study.state.connectedJoints),
  ).toBeGreaterThan(30);
  expect(await page.evaluate(() => window.study.state.fingerJoints)).toBe(30);
  await page.screenshot({ path: "artifacts/bee-robot.png" });

  // The robot stands on the platform rather than hovering above or sinking in.
  const stance = await page.evaluate(() => {
    const feet = window.study
      .bounds()
      .filter((p) => p.name.startsWith("claw foot"));
    return Math.min(...feet.map((p) => p.min[1]));
  });
  expect(stance).toBeGreaterThan(-0.2);
  expect(stance).toBeLessThan(0.2);

  for (const value of [250, 500, 750]) {
    await page.locator("#transform").fill(String(value));
    await page.waitForFunction(
      (v) => window.study.state.progress === v / 1000,
      value,
    );
    await page.screenshot({ path: `artifacts/bee-stage-${value}.png` });
  }
  await expect(page.locator("#mode")).toHaveText("Transformation in progress");
  await page.locator("#transform").fill("1000");
  await page.waitForFunction(() => window.study.state.progress === 1);
  await expect(page.locator("#mode")).toHaveText("Vehicle mode");
  await page.screenshot({ path: "artifacts/bee-coupe.png" });

  // Nothing may stand above the roofline or hang through the road surface.
  const coupe = await page.evaluate(() => {
    const parts = window.study.bounds();
    const top = Math.max(...parts.map((p) => p.max[1]));
    const bottom = Math.min(...parts.map((p) => p.min[1]));
    const nose = Math.max(...parts.map((p) => p.max[2]));
    const tail = Math.min(...parts.map((p) => p.min[2]));
    const halfWidth = Math.max(...parts.map((p) => Math.max(p.max[0], -p.min[0])));
    return { top, bottom, length: nose - tail, halfWidth };
  });
  expect(coupe.top).toBeLessThan(1.75);
  expect(coupe.bottom).toBeGreaterThan(-0.05);
  expect(coupe.length).toBeGreaterThan(4.4);
  expect(coupe.halfWidth).toBeLessThan(1.35);

  await page.locator("#transform").fill("0");
  await page.waitForFunction(() => window.study.state.progress === 0);
  await page.locator("#armor").fill("100");
  await page.locator("#grip").fill("100");
  await page.waitForFunction(
    () => window.study.state.armor === 1 && window.study.state.grip === 1,
  );
  await page.locator("#systems").click();
  await expect(page.locator("#systems")).toHaveAttribute("aria-pressed", "true");
  const frames = await page.evaluate(() => window.study.state.renderedFrames);
  await page.waitForFunction(
    (n) => window.study.state.renderedFrames > n + 8,
    frames,
  );
  expect(
    await page.evaluate(() => window.study.state.rotorPhase),
  ).toBeGreaterThan(0);
  await page.screenshot({ path: "artifacts/bee-mechanisms.png" });
  await page.locator("#systems").click();

  await page.locator("#play").click();
  await expect(page.locator("#play-label")).toHaveText("Pause");
  await page.waitForFunction(() => window.study.state.target > 0.02);
  await page.locator("#play").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/bee-mobile.png", fullPage: true });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("the collection links both studies", async ({ page }) => {
  await page.goto(page_url());
  await expect(page.locator(".editions a[aria-current=page]")).toHaveText(
    "002 — Bumblebee",
  );
  await page.locator(".editions a", { hasText: "Optimus" }).click();
  await expect(page).toHaveTitle("Form Foundry — Optimus Prime");
  await page.locator(".editions a", { hasText: "Bumblebee" }).click();
  await expect(page).toHaveTitle("Form Foundry — Bumblebee");
});
