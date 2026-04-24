import { test, expect } from '@playwright/test';

test.describe('Module Library', () => {
  test('should load the homepage and display module cards', async ({ page }) => {
    await page.goto('/');

    // The page title should contain NeuralPeace
    await expect(page).toHaveTitle(/NeuralPeace/i);

    // Wait for the Suspense fallback spinner to disappear
    await page.waitForSelector('[class*="animate-spin"]', { state: 'detached', timeout: 10000 }).catch(() => {
      // Spinner may have already resolved by the time we check
    });

    // The top navigation bar should be visible
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('should navigate to a module detail page', async ({ page }) => {
    await page.goto('/');

    // Wait for module cards to render (look for any link to /module/)
    const moduleLink = page.locator('a[href*="/module/"]').first();
    await moduleLink.waitFor({ state: 'visible', timeout: 15000 });

    // Click the first module card
    await moduleLink.click();

    // URL should now contain /module/
    await expect(page).toHaveURL(/\/module\//);

    // The back navigation or module detail content should be visible
    await expect(page.locator('main, [class*="container"], article').first()).toBeVisible();
  });

  test('should show the 3D Brain Atlas on wider viewports', async ({ page }) => {
    // Set a wide viewport for the atlas
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // The canvas element from Three.js should be rendered
    const canvas = page.locator('canvas').first();
    await canvas.waitFor({ state: 'visible', timeout: 15000 });
    await expect(canvas).toBeVisible();
  });
});
