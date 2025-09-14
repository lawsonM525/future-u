import { test, expect } from '@playwright/test';

// Reuse the project's pattern of mocking auth via localStorage
async function mockAuth(page) {
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    window.localStorage.setItem('mock-auth', JSON.stringify({
      user: { email: 'test@example.com', name: 'Test User' },
    }));
  });
  await page.reload();
}

test.describe('Sharing UI', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test('dashboard Share Progress opens ShareSheet with options', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    await page.getByRole('button', { name: /Share Progress/i }).click();

    await expect(page.getByText(/Share highlight/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Twitter/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /LinkedIn/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Download Card/i })).toBeVisible();

    await page.getByRole('button', { name: /Close/i }).click();
    await expect(page.getByText(/Share highlight/i)).not.toBeVisible();
  });

  test('report header Share opens ShareSheet', async ({ page }) => {
    // Navigate directly to a report type ("latest" is acceptable as the dynamic [type] param)
    await page.goto('http://localhost:3000/report/latest');

    // Click the header Share button
    await page.getByRole('button', { name: /^Share$/ }).first().click();

    await expect(page.getByText(/Share highlight/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Download Card/i })).toBeVisible();
  });
});
