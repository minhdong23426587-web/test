import { test, expect } from '@playwright/test';

test('landing page hides admin index', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Enterprise Security Platform' })).toBeVisible();
  await expect(page).not.toHaveURL(/\/admin/);
});
