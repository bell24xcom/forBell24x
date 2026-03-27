import { expect, test } from '@playwright/test';
import { checkA11y } from './_helpers/axe';

// Keep this list lean but representative; add more paths as needed.
const PUBLIC_ROUTES = [
  '/', '/pricing', '/marketplace', '/suppliers', '/contact', '/help',
  '/privacy', '/terms', '/login', '/register', '/wallet',
  '/dashboard/ai-features', '/fintech', '/voice-rfq',
  // categories (sample a few)
  '/categories/textiles', '/categories/garments',
];

test.describe('Public pages – smoke + a11y', () => {
  for (const path of PUBLIC_ROUTES) {
    test(`loads without 404: ${path}`, async ({ page, baseURL }) => {
      const url = new URL(path, baseURL).toString();
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(resp?.ok(), `HTTP not ok for ${url}`).toBeTruthy();

      // Guard against framework 404
      await expect(page.locator('text=/404|could not be found/i')).toHaveCount(0);

      await checkA11y(page, `page-${path.replace(/\W+/g, '_')}`);
    });
  }
});
