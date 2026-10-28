import { test, expect, type Page } from '@playwright/test'

const token = 'a'.repeat(64)
const report = {
  status: 'ready', content: '## CURRENT STRENGTHS & TALENTS\n\nClear communication\nYou explain ideas clearly and connect research to practical projects.\n\n## STRATEGIES FOR GROWTH\n\nBuild your portfolio\n- Complete one education technology design project.\n- Ask an experienced designer for feedback.',
  summary: 'You are an aspiring product designer. Your goal is to build useful education technology over the next five years.',
  checkpoints: Array.from({ length: 6 }, (_, index) => ({ year: 2026 + index, title: index ? 'Develop your expertise' : 'Build your portfolio', description: 'Make steady progress through practical projects.', items: ['Completed a portfolio project', 'Documented your design decisions', 'Received feedback from a designer'] })),
  canRetry: true, stale: false, timelineError: false,
}

async function session(page: Page, signedIn = false) {
  await page.route('**/api/auth/session', route => route.fulfill({ json: signedIn ? { user: { id: 'test-account', name: 'Test User', email: 'test@example.com' }, expires: '2099-01-01T00:00:00Z' } : null }))
  await page.route('**/api/quiz-progress*', route => route.fulfill({ json: { progress: null } }))
}

async function readyReport(page: Page) {
  await page.route(`**/api/guest-reports/${token}`, route => route.fulfill({ json: report }))
}

test('the full quick quiz opens results without signing in, and emailed results reopen', async ({ page }) => {
  await session(page)
  let submission: { answers: Record<string, string> } | undefined
  let sentTo = ''
  await page.route('**/api/guest-reports', async route => {
    submission = route.request().postDataJSON()
    await route.fulfill({ status: 201, json: { url: `/results/${token}` } })
  })
  await readyReport(page)
  await page.route(`**/api/guest-reports/${token}/email`, async route => {
    sentTo = route.request().postDataJSON().email
    await route.fulfill({ json: { success: true } })
  })
  await page.goto('/quiz/quickie')
  await page.getByRole('button', { name: 'Start Quiz', exact: true }).click()
  for (let index = 0; index < 10; index++) {
    await expect(page.getByText(`Question ${index + 1} of 10`, { exact: true })).toBeVisible()
    await page.getByRole('textbox', { name: /^Answer for:/ }).fill(`I want to build useful education technology. I have design and communication experience. This is answer ${index + 1}.`)
    await page.getByRole('button', { name: index === 9 ? 'Finish' : 'Next', exact: true }).click()
  }
  await expect(page).toHaveURL(`/results/${token}`)
  await expect(page.getByRole('heading', { name: 'Your results', exact: true })).toBeVisible()
  expect(Object.keys(submission!.answers)).toHaveLength(10)
  await expect(page.getByText(/Clear communication/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in & save my report' })).toBeVisible()
  await page.getByLabel('Your email', { exact: true }).fill('reader@example.com')
  await page.getByRole('button', { name: 'Email me my report link', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Email sent')
  expect(sentTo).toBe('reader@example.com')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Your results', exact: true })).toBeVisible()
})

test('draft text survives a reload before pressing Next and survives Previous', async ({ page }) => {
  await session(page)
  await page.goto('/quiz/quickie')
  await page.getByRole('button', { name: 'Start Quiz', exact: true }).click()
  const answer = 'I want to become a product designer and work on accessible learning tools.'
  await page.getByRole('textbox', { name: /^Answer for:/ }).fill(answer)
  await page.reload()
  await page.getByRole('button', { name: 'Resume Quiz', exact: true }).click()
  await expect(page.getByRole('textbox', { name: /^Answer for:/ })).toHaveValue(answer)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.getByText('Question 2 of 10', { exact: true })).toBeVisible()
  const draft = 'My skills include design, writing, user research and basic web development.'
  await page.getByRole('textbox', { name: /^Answer for:/ }).fill(draft)
  await page.getByRole('button', { name: 'Previous', exact: true }).click()
  await expect(page.getByText('Question 1 of 10', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.getByRole('textbox', { name: /^Answer for:/ })).toHaveValue(draft)
})

test('the longest quiz navigation fits a narrow phone screen', async ({ page }) => {
  await session(page)
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/quiz/deep-dive')
  await page.getByRole('button', { name: 'Start Quiz', exact: true }).click()
  await expect(page.getByText('Question 1 of 100', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next', exact: true }).scrollIntoViewIfNeeded()
  await expect.poll(async () => {
    const box = await page.getByRole('button', { name: 'Next', exact: true }).boundingBox()
    return box ? box.x + box.width : 1000
  }).toBeLessThanOrEqual(375)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
})

test('randomize previews changes but Cancel preserves the saved avatar', async ({ page }) => {
  await session(page, true)
  const original = { skinColor: ['ffffff'], hair: ['variant03'], hairColor: ['000000'] }
  await page.addInitScript(value => {
    if (!localStorage.getItem('avatarPreferences')) localStorage.setItem('avatarPreferences', JSON.stringify(value))
  }, original)
  await page.goto('/customize-avatar')
  const preview = page.getByRole('img', { name: 'Avatar for test@example.com' }).first()
  await expect(preview).toBeVisible()
  const before = await preview.getAttribute('src')
  await page.getByRole('button', { name: 'Randomize Avatar', exact: true }).click()
  await expect(preview).not.toHaveAttribute('src', before!)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('avatarPreferences')!))).toEqual(original)
  await page.getByRole('link', { name: 'Cancel', exact: true }).click()
  await expect(page).toHaveURL('/dashboard')
  await page.reload()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('avatarPreferences')!))).toEqual(original)
})

test('explicit Save Changes persists avatar edits', async ({ page }) => {
  await session(page, true)
  await page.goto('/customize-avatar')
  await page.getByRole('button', { name: '#ff69b4', exact: true }).click()
  await page.getByRole('button', { name: 'Save Changes', exact: true }).first().click()
  await expect(page).toHaveURL('/dashboard')
  await page.reload()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('avatarPreferences')!).hairColor)).toEqual(['ff69b4'])
})

test('an OAuth return saves the completed report once and reaches the dashboard', async ({ page }) => {
  await session(page, true)
  await readyReport(page)
  let saves = 0
  await page.route(`**/api/guest-reports/${token}/save`, async route => {
    saves++
    await route.fulfill({ json: { url: '/dashboard' } })
  })
  await page.goto(`/results/${token}?save=1`)
  await expect(page).toHaveURL('/dashboard')
  expect(saves).toBe(1)
})

test('result links stay out of analytics and do not leak referrers', async ({ page }) => {
  await session(page)
  await readyReport(page)
  const response = await page.goto(`/results/${token}`)
  await expect(page.getByRole('heading', { name: 'Your results', exact: true })).toBeVisible()
  expect(response?.headers()['referrer-policy']).toBe('no-referrer')
  expect(response?.headers()['x-robots-tag']).toContain('noindex')
  expect(await page.locator('script[src*="googletagmanager"], script[src*="datafa.st"]').count()).toBe(0)
})

test('an email failure leaves the full report visible and permits another attempt', async ({ page }) => {
  await session(page)
  await readyReport(page)
  await page.route(`**/api/guest-reports/${token}/email`, route => route.fulfill({ status: 502, json: { error: 'The email could not be sent. Please try again.' } }))
  await page.goto(`/results/${token}`)
  await page.getByLabel('Your email', { exact: true }).fill('reader@example.com')
  await page.getByRole('button', { name: 'Email me my report link', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('could not be sent')
  await expect(page.getByText(/Clear communication/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Email me my report link', exact: true })).toBeEnabled()
})
