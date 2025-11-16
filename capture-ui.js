import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:1420');

  // Wait for app to load
  await page.waitForTimeout(2000);

  // Screenshot 1: Initial load (skill list)
  await page.screenshot({ path: '/tmp/screenshot-1-initial.png', fullPage: true });
  console.log('Screenshot 1: Initial load saved');

  // Click first skill
  const firstSkill = page.locator('[data-testid="skill-list-item"]').first();
  await firstSkill.click();
  await page.waitForTimeout(1000);

  // Screenshot 2: Skill selected - Overview tab
  await page.screenshot({ path: '/tmp/screenshot-2-skill-overview.png', fullPage: true });
  console.log('Screenshot 2: Skill overview saved');

  // Screenshot 3: Click Content tab
  await page.locator('button[role="tab"]', { hasText: 'Content' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/screenshot-3-content-tab.png', fullPage: true });
  console.log('Screenshot 3: Content tab saved');

  // Screenshot 4: Check breadcrumbs
  await page.screenshot({ path: '/tmp/screenshot-4-breadcrumbs.png', clip: { x: 0, y: 0, width: 1200, height: 150 } });
  console.log('Screenshot 4: Breadcrumbs saved');

  // Screenshot 5: Header area with compact toggle
  await page.screenshot({ path: '/tmp/screenshot-5-header.png', clip: { x: 0, y: 0, width: 1200, height: 200 } });
  console.log('Screenshot 5: Header with toggle saved');

  // Wait before closing
  await page.waitForTimeout(2000);

  await browser.close();
  console.log('Done! Screenshots saved to /tmp/');
})();
