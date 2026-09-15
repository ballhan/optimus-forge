import { test, expect } from "@playwright/test";
test("robot, scrub, vehicle, reverse and display controls", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(process.env.STUDY_URL || "http://127.0.0.1:5173");
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForFunction(() => window.study?.state.assemblies > 20);
  expect(
    await page.evaluate(() => window.study.state.connectedJoints),
  ).toBeGreaterThan(30);
  await expect(page).toHaveTitle("Form Foundry — Optimus Prime");
  await page.screenshot({ path: "artifacts/robot.png" });
  for (const value of [100, 250, 400, 600, 750, 900]) {
    await page.locator("#transform").fill(String(value));
    await page.waitForFunction(
      (v) => window.study.state.progress === v / 1000,
      value,
    );
    await page.screenshot({ path: `artifacts/stage-${value}.png` });
  }
  await page.locator("#transform").fill("500");
  await expect(page.locator("#mode")).toHaveText("Transformation in progress");
  await page.waitForFunction(
    () => Math.abs(window.study.state.progress - 0.5) < 0.001,
  );
  await page.screenshot({ path: "artifacts/midpoint.png" });
  await page.locator("#transform").fill("1000");
  await page.waitForFunction(() => window.study.state.progress === 1);
  await expect(page.locator("#mode")).toHaveText("Vehicle mode");
  await page.screenshot({ path: "artifacts/truck.png" });
  await page.locator("#play").click();
  await expect(page.locator("#play-label")).toHaveText("Pause");
  await page.waitForFunction(() => window.study.state.target < 0.98);
  await page.locator("#play").click();
  await page.locator("#wire").click();
  await expect(page.locator("#wire")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#wire").click();
  await page.locator("#rotate").click();
  await expect(page.locator("#rotate")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#reset").click();
  await expect(page.locator("#rotate")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("#lighting").click();
  await expect(page.locator("#lighting")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(await page.evaluate(() => window.study.state.cinema)).toBe(false);
  await page.locator("#lighting").click();
  await page.locator("#transform").fill("0");
  await page.waitForFunction(() => window.study.state.progress === 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
  await page.locator("#transform").focus();
  await page.keyboard.press("End");
  await page.waitForFunction(() => window.study.state.progress === 1);
  await page.screenshot({ path: "artifacts/mobile-truck.png", fullPage: true });
  await page.locator("#play").click();
  await page.waitForFunction(
    () => window.study.state.target === 0,
    {},
    { timeout: 45000 },
  );
  await expect(page.locator("#mode")).toHaveText("Robot mode");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
