import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CHECK_WIDTHS = [
  { label: 'mobile', width: 375, height: 900 },
  { label: 'desktop', width: 1024, height: 900 },
];

async function expectNoAxeViolations(page: Page, includeSelectors: string[]) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);

  for (const selector of includeSelectors) {
    builder = builder.include(selector);
  }

  const results = await builder.analyze();

  const formatted = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));

  expect(formatted).toEqual([]);
}

for (const viewport of CHECK_WIDTHS) {
  test.describe(`A11y checks (${viewport.label})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('navigation passes scoped accessibility checks', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expectNoAxeViolations(page, ['nav']);

      if (viewport.width < 1024) {
        await page.locator('button[aria-controls="mobile-nav-menu"]').click();
        await expectNoAxeViolations(page, ['#mobile-nav-menu']);
      }
    });

    test('data tabs pass scoped accessibility checks', async ({ page }) => {
      await page.goto('/');
      await page.locator('#data').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.locator('#tab-sankey').click();

      await expectNoAxeViolations(page, ['#data [role="tablist"]', '#dataviz-panel']);
    });

    test('pledge form passes scoped accessibility checks', async ({ page }) => {
      await page.goto('/');
      await page.locator('#closing form').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      await expectNoAxeViolations(page, ['#closing form']);
    });
  });
}
