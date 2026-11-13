import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.resolve(here, '..');
const rawDir = path.join(videoDir, '.capture');
await mkdir(rawDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: rawDir, size: { width: 1600, height: 900 } },
});
const page = await context.newPage();
const video = page.video();
const started = Date.now();
const marks = [];
const mark = (name) => {
  const at = (Date.now() - started) / 1000;
  marks.push({ name, at });
  console.log(`${at.toFixed(1)}s ${name}`);
};
const pause = async (ms) => { await page.waitForTimeout(ms); };

try {
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.locator('.idea-card').first().waitFor();
  mark('deck-ready');
  await pause(4500);

  await page.locator('.topbar').getByRole('button', { name: /New card/ }).click();
  mark('new-card');
  await pause(900);
  await page.getByLabel('Card title').press('Control+A');
  await page.getByLabel('Card title').pressSequentially('A ritual for disconnected days', { delay: 32 });
  await pause(900);
  await page.getByLabel('Card content').pressSequentially(
    'Leave one handwritten note by the door. No feed, no sync, no urgency.\n\nA small prompt for paying attention to the room you are already in.',
    { delay: 12 },
  );
  await pause(900);
  await page.getByLabel('Tags separated by commas').pressSequentially('rituals, offline, field notes', { delay: 32 });
  await page.getByLabel('Tags separated by commas').press('Enter');
  await page.getByRole('button', { name: 'sky card' }).click();
  mark('card-authored');
  await pause(2200);

  await page.locator('.link-candidates button').filter({ hasText: 'Offline is a feature.' }).click();
  mark('link-created');
  await pause(2200);
  await page.locator('.linked-card').click();
  await page.locator('.backlinks').scrollIntoViewIfNeeded();
  mark('backlink-visible');
  await pause(3000);
  await page.getByRole('button', { name: 'Close editor' }).click();
  await pause(1200);
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.idea-card').filter({ hasText: 'A ritual for disconnected days' }).waitFor();
  mark('persisted-after-reload');
  await pause(2500);

  await page.keyboard.press('Control+k');
  await page.getByLabel('Search cards').pressSequentially('disconnected', { delay: 55 });
  mark('search-results');
  await pause(1800);
  await page.getByLabel('Search cards').press('Enter');
  await pause(2200);
  await page.getByRole('button', { name: 'Close editor' }).click();
  mark('search-complete');
  await pause(900);

  await page.locator('.main-nav').getByRole('button', { name: /Constellation/ }).click();
  mark('constellation-opened');
  await pause(3500);
  await page.locator('.graph-node').filter({ hasText: 'HyperCard' }).click();
  await pause(1700);
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await pause(1600);
  await page.locator('.graph-focus-card').getByRole('button', { name: /Open card/ }).click();
  mark('graph-card-opened');
  await pause(2400);
  await page.getByRole('button', { name: 'Close editor' }).click();
  await pause(900);

  await page.locator('.main-nav').getByRole('button', { name: /Card deck/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.topbar').getByRole('button', { name: 'Export' }).click();
  await downloadPromise;
  mark('workspace-exported');
  await pause(3000);
  mark('capture-complete');
} finally {
  await context.close();
  if (video) await video.saveAs(path.join(videoDir, 'assets', 'restack-screen.webm'));
  await writeFile(path.join(videoDir, 'capture-timings.json'), JSON.stringify(marks, null, 2));
  await browser.close();
}
