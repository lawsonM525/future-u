import { test, expect } from '@playwright/test';

test.describe('OG Image API', () => {
  test('returns an image for report highlight', async ({ request }) => {
    const res = await request.get('/api/og/report-highlight?text=Hello%20World');
    expect(res.ok()).toBeTruthy();
    const ct = res.headers()['content-type'] || '';
    expect(ct).toContain('image/');
    const buf = await res.body();
    // Ensure non-trivial image size
    expect(buf.byteLength).toBeGreaterThan(1000);
  });
});
