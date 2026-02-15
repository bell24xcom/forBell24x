import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';

export async function checkA11y(page: Page, contextName: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa']) // pragmatic scope
    .analyze();
  test.info().attach(`a11y-${contextName}`, {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: 'application/json'
  });
  // Fail on serious/critical issues only
  const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? 'minor'));
  expect(serious, `${contextName} has serious/critical a11y issues`).toHaveLength(0);
}
