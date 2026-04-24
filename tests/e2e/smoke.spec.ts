import { expect, test } from "@playwright/test";

test("core map exploration flow", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.waitForTimeout(3200);
  const startButton = page.getByRole("button", { name: "开始探索" });
  const hasGuideOpen = await startButton.isVisible({ timeout: 1500 }).catch(() => false);
  if (hasGuideOpen) {
    await startButton.click();
  }

  await expect(page.getByTestId("map-compliance-note")).toContainText("bzdt.ch.mnr.gov.cn");
  const sichuanProvince = page.getByTestId("province-sichuan").last();
  await expect(sichuanProvince).toBeVisible({ timeout: 45000 });
  await sichuanProvince.click();
  await expect(page).toHaveURL(/\/province\/sichuan$/);
  await expect(page.getByTestId("province-map-compliance-note")).toContainText("bzdt.ch.mnr.gov.cn");

  await page.getByRole("button").nth(1).click();
  await page.getByTestId("food-card").first().click();
  await expect(page.getByTestId("sidebar-open")).toBeVisible();

  await page.getByTestId("back-home").click();
  await expect(page).toHaveURL(/\/$/);
});
