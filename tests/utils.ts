import { Page } from '@playwright/test';

export const mockAuth = async (page: Page) => {
  await page.evaluate(() => {
    window.localStorage.setItem('mock-auth', JSON.stringify({
      user: {
        email: 'test@example.com',
        name: 'Test User'
      }
    }));
  });
};

export const mockReport = async (page: Page) => {
  await page.evaluate(() => {
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
};

export const mockAvatarPreferences = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.setItem('avatarPreferences', JSON.stringify({
      hairStyle: ['variant41'],
      eyeStyle: ['variant19'],
      mouthStyle: ['happy05'],
      glassesStyle: ['variant04'],
      hairColor: ['FF0000']
    }));
  });
};
