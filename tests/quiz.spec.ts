import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('http://localhost:3000');
    
    // Click the sign in button (using the actual button text from our UI)
    await page.getByRole('link', { name: /Sign in/i }).click();

    // Wait for the Google sign-in button and click it
    await page.getByRole('button', { name: /Continue with Google/i }).click();

    // Since we can't actually test Google OAuth in E2E tests, we'll mock the auth
    // You'll need to set up a test user in your database and use environment variables
    await page.evaluate(() => {
      window.localStorage.setItem('mock-auth', JSON.stringify({
        user: {
          email: 'test@example.com',
          name: 'Test User'
        }
      }));
    });

    // Reload the page to apply the mock auth
    await page.reload();
  });

  test('complete career quiz', async ({ page }) => {
    // Navigate to quiz selection
    await page.getByRole('link', { name: /Take Career Quiz/i }).click();
    
    // Click on Strategy quiz
    await page.getByRole('link', { name: /Strategy/i }).click();

    // Sample quiz answers
    const answers = [
      'Strongly Agree',
      'Agree',
      'Neutral',
      'Disagree',
      'Strongly Disagree'
    ];

    // Keep clicking answers and Next until we reach the end
    while (true) {
      try {
        // Find the current question container
        const questionContainer = await page.locator('.question-container').first();
        
        // Pick a random answer
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        await questionContainer
          .locator('button', { hasText: randomAnswer })
          .click();

        // Try to click Next, if it fails we're probably at the end
        const nextButton = page.getByRole('button', { name: /Next/i });
        if (await nextButton.isVisible()) {
          await nextButton.click();
        } else {
          // If Next is not visible, try to submit
          await page.getByRole('button', { name: /Submit/i }).click();
          break;
        }
      } catch (e) {
        // If we can't find more questions, break the loop
        break;
      }
    }

    // Verify we get to the results page
    await expect(page.getByRole('heading', { name: /Career Strategy/i })).toBeVisible();
    
    // Verify key sections are present
    await expect(page.getByText(/Action Items/i)).toBeVisible();
    await expect(page.getByText(/Career Paths/i)).toBeVisible();
  });
});
