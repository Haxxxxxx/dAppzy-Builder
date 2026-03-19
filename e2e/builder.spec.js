import { test, expect } from '@playwright/test';

test.describe('Builder Smoke Tests', () => {
  test('should load the app and show wallet connection', async ({ page }) => {
    await page.goto('/');

    // App should render without crashing
    await expect(page.locator('body')).toBeVisible();

    // Should show wallet connection screen (user not authenticated)
    await expect(page.locator('.app-container')).toBeVisible({ timeout: 10000 });
  });
});
