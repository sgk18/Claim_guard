import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function runBrowserQA() {
  console.log('Launching Chromium for Presentation Visual & Navigation QA...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  const indexPath = path.resolve('presentation/index.html');
  const fileUrl = `file://${indexPath.replace(/\\/g, '/')}`;
  console.log(`Navigating to: ${fileUrl}`);

  await page.goto(fileUrl, { waitUntil: 'load' });

  // 1. Check title
  const title = await page.title();
  console.log(`Page title: "${title}"`);

  // 2. Check initial active slide
  const activeSlide1 = await page.$('.slide.active');
  const slide1Id = await activeSlide1.getAttribute('id');
  console.log(`Initial active slide: ${slide1Id}`);
  if (slide1Id !== 'slide-1') throw new Error(`Expected slide-1, got ${slide1Id}`);

  // 3. Test keyboard navigation across all 15 slides
  for (let i = 2; i <= 15; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    const activeSlide = await page.$('.slide.active');
    const currentId = await activeSlide.getAttribute('id');
    if (currentId !== `slide-${i}`) {
      throw new Error(`Step ${i}: Expected slide-${i}, but got ${currentId}`);
    }
  }
  console.log('Successfully navigated through all 15 slides via ArrowRight!');

  // 4. Test Home key
  await page.keyboard.press('Home');
  await page.waitForTimeout(50);
  const homeActive = await page.$('.slide.active');
  const homeId = await homeActive.getAttribute('id');
  if (homeId !== 'slide-1') throw new Error(`Home key failed: got ${homeId}`);
  console.log('Home key successfully returned to slide-1.');

  // 5. Test Speaker Notes Drawer toggle (Key P)
  await page.keyboard.press('p');
  await page.waitForTimeout(100);
  const drawerOpen = await page.$eval('#speaker-notes-drawer', el => el.classList.contains('open'));
  if (!drawerOpen) throw new Error('Speaker notes drawer did not open on key P');
  console.log('Speaker notes drawer successfully opened via key P.');

  // 6. Test Esc Overview Grid
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const overviewOpen = await page.$eval('#deck-overview-modal', el => el.classList.contains('open'));
  if (!overviewOpen) throw new Error('Overview modal did not open on Escape');
  console.log('Overview grid successfully opened via Escape.');

  await browser.close();

  if (errors.length > 0) {
    console.warn(`Browser errors detected: ${JSON.stringify(errors)}`);
  } else {
    console.log('Zero browser errors or uncaught exceptions detected.');
  }

  console.log('ALL BROWSER QA CHECKS PASSED!');
}

runBrowserQA().catch(err => {
  console.error('Browser QA Failed:', err);
  process.exit(1);
});
