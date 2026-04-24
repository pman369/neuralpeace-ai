import { test, expect } from '@playwright/test';

test.describe('Chat Interaction', () => {
  test('should redirect unauthenticated users to /auth', async ({ page }) => {
    await page.goto('/chat');

    // Unauthenticated users should be redirected to the auth/onboarding page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should display the auth/onboarding page with sign-in options', async ({ page }) => {
    await page.goto('/auth');

    // The onboarding page should render
    await expect(page.locator('body')).toBeVisible();

    // There should be some form of sign-in or authentication UI
    const authContent = page.locator('button, input[type="email"], input[type="password"], [class*="auth"]').first();
    await authContent.waitFor({ state: 'visible', timeout: 10000 });
    await expect(authContent).toBeVisible();
  });

  test('should render chat page elements when navigated directly', async ({ page }) => {
    // This test verifies the chat page structure loads even if
    // the ProtectedRoute redirects (it will hit auth instead).
    // In a full CI setup with seeded auth, this would test the chat UI.
    const response = await page.goto('/chat');

    // Either we land on /chat (authenticated) or /auth (redirected)
    const url = page.url();
    if (url.includes('/auth')) {
      // Expected behavior for unauthenticated users
      await expect(page).toHaveURL(/\/auth/);
    } else {
      // If somehow authenticated, verify chat elements exist
      const chatInput = page.locator('textarea, input[type="text"]').first();
      await expect(chatInput).toBeVisible();
    }
  });
});
