import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('create, edit, connect, persist, search, and explore a card', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /A place for ideas/ })).toBeVisible();
  await expect(page.locator('.idea-card')).toHaveCount(5);
  await page.screenshot({ path: 'test-results/restack-desktop.png', fullPage: true });

  await page.locator('.topbar').getByRole('button', { name: /New card/ }).click();
  await expect(page.getByRole('dialog', { name: 'Edit card' })).toBeVisible();
  await page.getByLabel('Card title').fill('A testable thought');
  await page.getByLabel('Card content').fill('Local by design. Connected by choice.');
  await page.getByLabel('Tags separated by commas').fill('testing, offline');
  await page.getByLabel('Tags separated by commas').press('Enter');
  await page.getByRole('button', { name: 'violet card' }).click();
  await page.locator('.link-candidates button').filter({ hasText: 'Offline is a feature.' }).click();
  await expect(page.locator('.linked-card')).toContainText('Offline is a feature.');
  await page.screenshot({ path: 'test-results/restack-editor.png', fullPage: true });
  await page.getByRole('button', { name: 'Close editor' }).click();
  await expect(page.locator('.idea-card').filter({ hasText: 'A testable thought' })).toBeVisible();

  await page.reload();
  await page.locator('.idea-card').filter({ hasText: 'A testable thought' }).click();
  await expect(page.getByLabel('Card title')).toHaveValue('A testable thought');
  await expect(page.getByLabel('Card content')).toHaveValue('Local by design. Connected by choice.');
  await page.getByRole('button', { name: 'Close editor' }).click();

  await page.keyboard.press('Control+k');
  await page.getByLabel('Search cards').fill('testable');
  await expect(page.locator('.search-result')).toHaveCount(1);
  await page.getByLabel('Search cards').press('Enter');
  await expect(page.getByLabel('Card title')).toHaveValue('A testable thought');
  await page.getByRole('button', { name: 'Close editor' }).click();

  await page.locator('.main-nav').getByRole('button', { name: /Constellation/ }).click();
  await expect(page.locator('.graph-node')).toHaveCount(6);
  await expect(page.locator('.graph-focus-card')).toContainText('A testable thought');
  await page.screenshot({ path: 'test-results/restack-graph.png', fullPage: true });
  await page.locator('.graph-focus-card').getByRole('button', { name: /Open card/ }).click();
  await expect(page.getByLabel('Card title')).toHaveValue('A testable thought');
});

test('exports and imports portable workspaces', async ({ page }) => {
  await page.goto('/');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.topbar').getByRole('button', { name: 'Export' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^restack-.*\.json$/);
  const path = await download.path();
  const exported = JSON.parse(await readFile(path!, 'utf8'));
  expect(exported.version).toBe(1);
  expect(exported.cards).toHaveLength(5);

  page.on('dialog', (dialog) => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: 'import.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, cards: [{ id: 'imported', title: 'Imported memory', body: 'Portable by design.', tags: ['archive'], links: [] }] })),
  });
  await expect(page.locator('.idea-card')).toHaveCount(1);
  await expect(page.locator('.idea-card')).toContainText('Imported memory');
});

test('keeps the mobile deck and navigation usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.idea-card')).toHaveCount(5);
  await page.screenshot({ path: 'test-results/restack-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await expect(page.locator('.sidebar')).toHaveClass(/mobile-open/);
  await page.locator('.main-nav').getByRole('button', { name: /Constellation/ }).click();
  await expect(page.locator('.sidebar')).not.toHaveClass(/mobile-open/);
  await expect(page.locator('.graph-shell')).toBeVisible();
  await page.getByRole('button', { name: /New card/ }).click();
  await expect(page.getByRole('dialog', { name: 'Edit card' })).toBeVisible();
  await page.getByLabel('Card title').fill('Pocket-sized idea');
  await page.getByRole('button', { name: 'Close editor' }).click();
  await expect(page.locator('.graph-focus-card')).toContainText('Pocket-sized idea');
});
