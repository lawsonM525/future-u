import { test, expect } from '@playwright/test';

test.describe('Dashboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('http://localhost:3000');
    
    // Mock authentication
    await page.evaluate(() => {
      window.localStorage.setItem('mock-auth', JSON.stringify({
        user: {
          email: 'test@example.com',
          name: 'Test User'
        }
      }));

      // Mock a career report
      localStorage.setItem('mock-report', JSON.stringify({
        careers: [
          { id: 'software-engineer', title: 'Software Engineer', match: 95 },
          { id: 'product-manager', title: 'Product Manager', match: 85 }
        ],
        actionItems: [
          'Learn new programming languages',
          'Build portfolio projects'
        ],
        strategy: 'Focus on technical skill development'
      }));
    });
    await page.reload();
  });

  test('verify dashboard layout', async ({ page }) => {
    // Navigate to dashboard
    await page.getByRole('link', { name: /View Your Dashboard/i }).click();

    // Check user profile section
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByRole('link', { name: /Customize Character/i })).toBeVisible();

    // Check career strategy section
    await expect(page.getByRole('heading', { name: /Career Strategy/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View Your Career Strategy/i })).toBeVisible();

    // Check timeline section
    await expect(page.getByRole('heading', { name: /Timeline/i })).toBeVisible();

    // Check resources section
    await expect(page.getByRole('heading', { name: /Resources/i })).toBeVisible();
  });

  test('navigate to career strategy', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Click on career strategy link
    await page.getByRole('link', { name: /View Your Career Strategy/i }).click();

    // Verify we're on the report page
    await expect(page).toHaveURL(/.*report/);
    await expect(page.getByText(/Software Engineer/)).toBeVisible();
    await expect(page.getByText(/Product Manager/)).toBeVisible();
  });

  test('timeline interaction', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Verify timeline events are visible
    await expect(page.getByText(/Career Strategy Review/)).toBeVisible();
    await expect(page.getByText(/Skills Assessment/)).toBeVisible();
    await expect(page.getByText(/Networking Event/)).toBeVisible();
  });

  test('resources section', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Check if resource links are present and clickable
    const resourceLinks = await page.getByRole('link').filter({
      has: page.locator('[data-testid="resource-item"]')
    }).all();
    
    expect(resourceLinks.length).toBeGreaterThan(0);
  });
});
