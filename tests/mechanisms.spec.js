import { test, expect } from "@playwright/test";
test("armor hinges, articulated grip, and live systems work in both modes", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(process.env.STUDY_URL || "http://127.0.0.1:5173");
  await page.waitForFunction(
    () => window.primeStudy?.state.fingerJoints === 30,
  );
  expect(await page.evaluate(() => window.primeStudy.state.armorHinges)).toBe(
    14,
  );
  await page.locator("#armor").fill("100");
  await page.locator("#grip").fill("100");
  await page.waitForFunction(
    () =>
      window.primeStudy.state.armor === 1 && window.primeStudy.state.grip === 1,
  );
  await page.screenshot({ path: "artifacts/mechanisms-open.png" });
  await page.locator("#systems").click();
  await expect(page.locator("#systems")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const frames = await page.evaluate(
    () => window.primeStudy.state.renderedFrames,
  );
  await page.waitForFunction(
    (n) => window.primeStudy.state.renderedFrames > n + 8,
    frames,
  );
  await page.locator("#systems").click();
  const pausedPhase = await page.evaluate(
    () => window.primeStudy.state.rotorPhase,
  );
  await page.locator("#grip").fill("0");
  await page.waitForFunction(() => window.primeStudy.state.grip === 0);
  expect(await page.evaluate(() => window.primeStudy.state.rotorPhase)).toBe(
    pausedPhase,
  );
  await page.screenshot({ path: "artifacts/mechanisms-hand-open.png" });
  await page.locator("#transform").fill("1000");
  await page.waitForFunction(() => window.primeStudy.state.progress === 1);
  await page.screenshot({ path: "artifacts/mechanisms-truck.png" });
  await page.locator("#transform").fill("0");
  await page.waitForFunction(() => window.primeStudy.state.progress === 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/mechanisms-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
