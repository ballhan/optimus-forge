import { test, expect } from "@playwright/test";

test("inspect head and back without disrupting transformation", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(process.env.STUDY_URL || "http://127.0.0.1:5173");
  await expect(page.locator("#loading")).toHaveCount(0);
  await page.getByRole("button", { name: "Inspect upper body" }).click();
  await expect(page.locator("#detail")).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: "artifacts/upper-body.png" });
  await page.getByRole("button", { name: "Reset camera", exact: true }).click();
  await page.mouse.move(850, 430);
  await page.mouse.down();
  await page.mouse.move(1310, 430, { steps: 12 });
  await page.mouse.up();
  await page.waitForFunction(() => !window.study.state.cameraMoving);
  await page.screenshot({ path: "artifacts/back.png" });
  await page.getByRole("button", { name: "Inspect upper body" }).click();
  await page.locator("#transform").fill("1000");
  await expect(page.locator("#detail")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.waitForFunction(() => window.study.state.progress === 1);
  await expect(page.locator("#mode")).toHaveText("Vehicle mode");
});
