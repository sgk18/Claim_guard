import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Presentation Package Integrity Tests', async (t) => {
  await t.test('All presentation files exist', () => {
    const requiredFiles = [
      'presentation/index.html',
      'presentation/styles.css',
      'presentation/script.js',
      'presentation/README.md',
      'presentation/presentation-script.md',
      'presentation/demo-script.md',
      'presentation/audio/audio-script.md',
      'ClaimGuard_Product_Pitch.pptx',
      'docs/PRESENTATION_SKILLS.md',
      'docs/PRESENTATION_ARCHITECTURE.md',
      'docs/PRESENTATION_QA.md',
      'docs/IMAGE_GENERATION.md',
      'docs/PITCH_SCRIPT.md'
    ];

    for (const file of requiredFiles) {
      assert.ok(fs.existsSync(file), `File missing: ${file}`);
    }
  });

  await t.test('All 15 speaker notes exist and are non-empty', () => {
    for (let i = 1; i <= 15; i++) {
      const num = i < 10 ? `0${i}` : `${i}`;
      const notePath = `presentation/speaker-notes/slide-${num}.md`;
      assert.ok(fs.existsSync(notePath), `Speaker note missing: ${notePath}`);
      const content = fs.readFileSync(notePath, 'utf8');
      assert.ok(content.length > 200, `Speaker note too short: ${notePath}`);
      assert.ok(content.includes('SLIDE PURPOSE'), `Missing SLIDE PURPOSE in ${notePath}`);
      assert.ok(content.includes('SAY THIS'), `Missing SAY THIS in ${notePath}`);
      assert.ok(content.includes('SIMPLE EXPLANATION'), `Missing SIMPLE EXPLANATION in ${notePath}`);
      assert.ok(content.includes('TECHNICAL EXPLANATION'), `Missing TECHNICAL EXPLANATION in ${notePath}`);
    }
  });

  await t.test('All 6 custom product images exist in presentation/images', () => {
    const requiredImages = [
      'cover-ecosystem.jpg',
      'employee-mobile.jpg',
      'manager-dashboard.jpg',
      'ocr-extraction.jpg',
      'fraud-risk.jpg',
      'onboarding-pairing.jpg'
    ];

    for (const img of requiredImages) {
      const imgPath = path.join('presentation', 'images', img);
      assert.ok(fs.existsSync(imgPath), `Image missing: ${imgPath}`);
      const stat = fs.statSync(imgPath);
      assert.ok(stat.size > 50000, `Image too small: ${imgPath}`);
    }
  });

  await t.test('HTML contains all 15 slides with data attributes', () => {
    const html = fs.readFileSync('presentation/index.html', 'utf8');
    for (let i = 1; i <= 15; i++) {
      assert.ok(html.includes(`id="slide-${i}"`), `Slide ${i} missing from HTML`);
      assert.ok(html.includes(`data-say=`), `data-say missing for slide ${i}`);
      assert.ok(html.includes(`data-tech=`), `data-tech missing for slide ${i}`);
    }
  });

  await t.test('PPTX file size is greater than 1MB', () => {
    const stat = fs.statSync('ClaimGuard_Product_Pitch.pptx');
    assert.ok(stat.size > 1000000, `PPTX file size is too small: ${stat.size} bytes`);
  });
});
