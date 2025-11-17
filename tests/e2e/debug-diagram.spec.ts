import { test, expect } from '@playwright/test';

test.describe('E2E Diagram Debugging', () => {
  test('should capture diagram state and console logs', async ({ page }) => {
    // Capture all console messages from the browser
    page.on('console', (msg) => console.log(`Browser Console: ${msg.text()}`));

    // 1. Navigate to the running application
    await page.goto('/');

    // 2. Click on the 'taskfile' skill (using the 'option' role we discovered)
    await page.getByRole('option', { name: 'taskfile This skill provides' }).click();

    // 3. Click on the 'Diagram' tab
    await page.getByRole('tab', { name: 'Diagram' }).click();

    // 4. Wait for the SVG element to be present in the DOM
    const svgLocator = page.locator('div[role="img"] svg');
    await svgLocator.waitFor({ state: 'attached', timeout: 10000 });

    // 5. Take a screenshot for visual verification
    await page.screenshot({ path: 'e2e-debug-screenshot.png', fullPage: true });
    console.log('Screenshot saved to e2e-debug-screenshot.png');

    // 6. Execute a script in the browser to inspect the DOM and get computed styles
    const diagramState = await page.evaluate(() => {
      const diagramContainer = document.querySelector('[role="img"]');
      const svgElement = diagramContainer?.querySelector('svg');

      if (!diagramContainer || !svgElement) {
        return { error: 'Could not find diagram container or SVG element.' };
      }

      const containerRect = diagramContainer.getBoundingClientRect();
      const svgRect = svgElement.getBoundingClientRect();

      return {
        container: {
          className: diagramContainer.className,
          rect: {
            x: containerRect.x,
            y: containerRect.y,
            width: containerRect.width,
            height: containerRect.height,
          },
        },
        svg: {
          rect: { x: svgRect.x, y: svgRect.y, width: svgRect.width, height: svgRect.height },
          preserveAspectRatio: svgElement.getAttribute('preserveAspectRatio'),
        },
      };
    });

    // 7. Log the collected state to the terminal
    console.log('--- E2E DIAGRAM STATE ---');
    console.log(JSON.stringify(diagramState, null, 2));
    console.log('--- END E2E DIAGRAM STATE ---');

    // The test will now implicitly pass if no errors were thrown
    expect(diagramState.error).toBeUndefined();
    expect(diagramState.svg?.rect.height).toBeGreaterThan(50); // Assert a reasonable height
  });
});
