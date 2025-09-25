import { test as setup } from '@playwright/test';

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('/');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});