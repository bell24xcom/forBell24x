import { expect, test } from '@playwright/test';
import { checkA11y } from './_helpers/axe';

const ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/analytics',
  '/admin/users',
  '/admin/rfqs',
  '/admin/suppliers',
  '/admin/security',
  '/admin/monitoring',
  '/admin/launch-metrics',
];

test.describe('Admin – loads & key widgets', () => {
  for (const path of ADMIN_ROUTES) {
    test(`admin route works: ${path}`, async ({ page, baseURL }) => {
      const url = new URL(path, baseURL).toString();
      const resp = await page.goto(url);
      expect(resp?.ok(), `HTTP not ok for ${url}`).toBeTruthy();

      // Common sanity checks
      await expect(page.locator('text=/dashboard|analytics|admin|rfq|supplier|security|monitoring|launch/i')).toHaveCountGreaterThan(0);

      await checkA11y(page, `admin-${path.replace(/\W+/g, '_')}`);
    });
  }
});
