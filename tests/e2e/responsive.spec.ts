import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { label: 'mobile-320', width: 320, height: 900 },
  { label: 'mobile-375', width: 375, height: 900 },
  { label: 'tablet-768', width: 768, height: 1024 },
  { label: 'desktop-1024', width: 1024, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`Responsive audit ${viewport.label}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('layout prevents horizontal overflow', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const topOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });

      const topCanScrollHorizontally = await page.evaluate(() => {
        const startX = window.scrollX;
        window.scrollTo({ left: 200, top: window.scrollY });
        const moved = window.scrollX > startX;
        window.scrollTo({ left: startX, top: window.scrollY });
        return moved;
      });

      await page.keyboard.press('End');

      const bottomOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });

      const bottomCanScrollHorizontally = await page.evaluate(() => {
        const startX = window.scrollX;
        window.scrollTo({ left: 200, top: window.scrollY });
        const moved = window.scrollX > startX;
        window.scrollTo({ left: startX, top: window.scrollY });
        return moved;
      });

      expect(topCanScrollHorizontally).toBeFalsy();
      expect(bottomCanScrollHorizontally).toBeFalsy();
      expect(topOverflow).toBeLessThanOrEqual(32);
      expect(bottomOverflow).toBeLessThanOrEqual(32);
    });

    test('section spacing and typography remain readable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const metrics = await page.evaluate(() => {
        const container = document.querySelector('.section-container');
        const heroTitle = document.querySelector('#hero h1');

        if (!container || !heroTitle) {
          return null;
        }

        const containerStyle = window.getComputedStyle(container);
        const heroStyle = window.getComputedStyle(heroTitle);

        return {
          paddingLeft: parseFloat(containerStyle.paddingLeft),
          paddingRight: parseFloat(containerStyle.paddingRight),
          heroFontSize: parseFloat(heroStyle.fontSize),
          heroLineHeight: parseFloat(heroStyle.lineHeight),
        };
      });

      expect(metrics).not.toBeNull();
      expect(metrics!.paddingLeft).toBeGreaterThanOrEqual(12);
      expect(metrics!.paddingRight).toBeGreaterThanOrEqual(12);
      expect(metrics!.heroFontSize).toBeGreaterThanOrEqual(28);
      expect(metrics!.heroLineHeight).toBeGreaterThan(metrics!.heroFontSize * 1.05);
    });

    test('navigation mode matches viewport', async ({ page }) => {
      await page.goto('/');

      const desktopNav = page.locator('nav .hidden.lg\\:flex').first();
      const hamburger = page.locator('button[aria-controls="mobile-nav-menu"]');

      if (viewport.width < 1024) {
        await expect(hamburger).toBeVisible();
        await expect(desktopNav).toBeHidden();
      } else {
        await expect(hamburger).toBeHidden();
        await expect(desktopNav).toBeVisible();
      }
    });
  });
}
