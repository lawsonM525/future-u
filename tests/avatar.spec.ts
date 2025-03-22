import { test, expect } from '@playwright/test';

test.describe('Avatar Customization', () => {
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
    });
    await page.reload();
  });

  test('customize avatar', async ({ page }) => {
    // Navigate to dashboard
    await page.getByRole('link', { name: /View Your Dashboard/i }).click();

    // Click customize character button
    await page.getByRole('link', { name: /Customize Character/i }).click();

    // Test avatar customization options
    const customizationTests = [
      { option: 'Hair Style', value: 'variant41' },
      { option: 'Eye Style', value: 'variant19' },
      { option: 'Mouth Style', value: 'happy05' },
      { option: 'Glasses Style', value: 'variant04' }
    ];

    for (const { option, value } of customizationTests) {
      // Find the option section and select a value
      const select = page.getByLabel(new RegExp(option, 'i'));
      await select.selectOption(value);
      
      // Verify the selection was applied (the preview should update)
      await expect(select).toHaveValue(value);
    }

    // Test randomize button
    await page.getByRole('button', { name: /Randomize/i }).click();

    // Test color picker
    const colorPicker = page.getByLabel(/Hair Color/i);
    await colorPicker.fill('#FF0000');
    await expect(colorPicker).toHaveValue('#FF0000');

    // Save changes
    await page.getByRole('button', { name: /Save Changes/i }).click();

    // Verify we're redirected back to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('verify avatar persistence', async ({ page }) => {
    // Go to dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Verify avatar is displayed
    await expect(page.locator('avatar-creator')).toBeVisible();

    // Check localStorage for saved preferences
    const preferences = await page.evaluate(() => {
      return localStorage.getItem('avatarPreferences');
    });
    expect(preferences).toBeTruthy();
  });
});
