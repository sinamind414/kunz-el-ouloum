import { test, expect, type Page } from '@playwright/test';
import { DATA_VERSION } from '../../src/config/appConfig';

const BASE_URL = 'http://localhost:3000';

async function clickByStrippedText(page: Page, text: string): Promise<boolean> {
  return page.evaluate((target: string) => {
    const strip = (s: string) => s.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED\u08D0-\u08E3]/g, '');
    const btn = Array.from(document.querySelectorAll<HTMLElement>('button')).find(b =>
      strip(b.textContent || '').includes(target)
    );
    if (btn) { btn.click(); return true; }
    return false;
  }, text);
}

async function dismissSplash(page: Page, options: { waitForNetworkIdle?: boolean } = {}) {
  if (options.waitForNetworkIdle === false) {
    await page.waitForLoadState('domcontentloaded');
  } else {
    await page.waitForLoadState('networkidle');
  }
  await page.waitForTimeout(1000);
  for (let i = 0; i < 8; i++) {
    const clicked = await page.evaluate(() => {
      const strip = (s: string) => s.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED\u08D0-\u08E3]/g, '');
      const btn = Array.from(document.querySelectorAll<HTMLElement>('button')).find(b => {
        const t = strip(b.textContent || '');
        return t.includes('افتح كنز') || t.includes('ابدأ رحلة');
      });
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clicked) break;
    await page.waitForTimeout(2000);
  }
}

async function openLessonsTab(page: Page) {
  await page.waitForSelector('aside', { state: 'visible', timeout: 15000 });
  await page.locator('aside').getByRole('button', { name: 'الدروس' }).click();
  await page.waitForTimeout(1000);
}

async function openDocumentAnalysis(page: Page) {
  await page.locator('aside').getByRole('button', { name: 'أتدرب' }).click();
  await page.getByRole('button', { name: /تحليل وثائق/ }).click();
  await expect(page.getByText(/تحليل الوثائق/)).toBeVisible();
}

async function waitForServiceWorkerControl(page: Page) {
  await expect.poll(async () => page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'missing';
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) return 'waiting-active';
    return navigator.serviceWorker.controller ? 'controlled' : 'waiting-controller';
  }), { timeout: 30000 }).toBe('controlled');
}

test.describe('Parcours élève Kunz El Ouloum', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('kunz_user', JSON.stringify({ id: 'e2e-guest', email: 'guest@kunz.local', name: 'طالب زائر' }));
      localStorage.setItem('svt_data_version', DATA_VERSION);
    });
    await page.reload();
    await dismissSplash(page);
  });

  const textAnswers: Record<string, string[]> = {
    'الاستنساخ وتدخل الإنزيم': [
      'ARN بوليميراز',
      '',                          // hotspot block
      'A U G C U A',
      'كيف تنتقل المعلومة الوراثية من النواة إلى الهيولى لتركيب البروتين؟',
    ],
    'الترجمة والشفرة الوراثية': [
      '99',
      '',                          // hotspot block
      'AAA',
      'الاستنساخ يتم في النواة وينتج ARNm والترجمة في الهيولى وينتج بروتين',
    ],
  };

  const hotspotObs: Record<string, string> = {
    'الاستنساخ وتدخل الإنزيم': 'تمركز ARN بوليميراز على ADN لفك اللولب',
    'الترجمة والشفرة الوراثية': 'الريبوزوم يقرأ ARNm ويتعرف ARNt على الرامزة',
  };

  const hotspotConclusion: Record<string, string> = {
    'الاستنساخ وتدخل الإنزيم': 'السلسلة الناسخة تقوم بتخليق ARNm عبر التكامل القواعدي',
    'الترجمة والشفرة الوراثية': 'تتشكل رابطة ببتيدية حسب الشفرة الوراثية ويتتالي الأحماض',
  };

  async function solveLesson(page: Page, lessonTitle: string) {
    const answers = textAnswers[lessonTitle];
    const obs = hotspotObs[lessonTitle];
    const conclusion = hotspotConclusion[lessonTitle];

    const waitForBlockValidation = async (block: ReturnType<Page['locator']>) => {
      await expect.poll(async () => {
        if (await page.getByRole('button', { name: 'إنهاء الممارسة والانتقال' }).isVisible().catch(() => false)) {
          return 'completed';
        }
        if (await block.count() === 0) return 'completed';
        return await block.getAttribute('data-block-state');
      }, { timeout: 3000 }).toBe('completed');
    };

    for (let attempt = 0; attempt < 40; attempt++) {
      const practice = page.getByRole('button', { name: 'إنهاء الممارسة والانتقال' });
      if (await practice.isVisible({ timeout: 500 }).catch(() => false)) return;

      const currentBlock = page.locator('[data-testid="lesson-block"][data-block-state="current"]');
      if (!(await currentBlock.isVisible({ timeout: 2000 }).catch(() => false))) return;
      const idx = Number(await currentBlock.getAttribute('data-block-index'));
      const block = page.locator(`[data-testid="lesson-block"][data-block-index="${idx}"]`);

      const answer = answers[idx];
      if (answer === '') {
        // Hotspot block
        const textareas = block.locator('textarea');
        const count = await textareas.count();
        for (let t = 0; t < count; t++) {
          await textareas.nth(t).fill(t === 0 ? obs : conclusion);
        }
        const img = block.locator('img.cursor-crosshair');
        if (await img.isVisible({ timeout: 1000 }).catch(() => false)) {
          const box = await img.boundingBox();
          if (box) { await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5); await page.waitForTimeout(800); }
        }
        const endBtn = block.getByRole('button', { name: 'إنهاء التحليل' });
        if (await endBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await endBtn.click();
        }
        await waitForBlockValidation(block);
        continue;
      } else {
        // Text block
        const input = block.getByPlaceholder('اكتب الكلمة السرية هنا...');
        await input.fill(answer);
        await block.getByRole('button', { name: 'تحقق', exact: true }).click();
        await waitForBlockValidation(block);
        continue;
      }
    }

    throw new Error(`Lesson ${lessonTitle} did not reach exit practice`);
  }

  test('E2E-01 — Leçon active réussie (transcription → uracile → BAC → traduction)', async ({ page }) => {
    await openLessonsTab(page);
    await clickByStrippedText(page, 'الاستنساخ وتدخل الإنزيم');
    await page.waitForTimeout(3000);

    await solveLesson(page, 'الاستنساخ وتدخل الإنزيم');
    await page.waitForTimeout(2000);

    const document = page.getByTestId('live-document');
    await document.locator('textarea').fill('ظهور الوسم أولاً في النواة بينما ظهور الوسم لاحقاً في الهيولى يدل على انتقال المعلومة عبر ARNm. على المستوى الجزيئي ينتقل ARNm داخل الخلية ويحمل نسخة المعلومة.');
    await document.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }).click();
    await expect(document.getByText(/أحسنت، ربطت الملاحظة/)).toBeVisible();

    const bac = page.getByTestId('bac-challenge');
    await bac.locator('textarea').fill('على المستوى الجزيئي يحتوي ARNm اليوراسيل وينتج عن الاستنساخ، بينما على المستوى الخلوي يظهر أولاً في النواة ثم ينتقل إلى الهيولى ويحمل نسخة المعلومة.');
    await bac.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }).click();
    await expect(bac.getByText(/طبّقت المنهجية بنجاح/)).toBeVisible();
    const finishPractice = page.getByRole('button', { name: 'إنهاء الممارسة والانتقال' });
    if (await finishPractice.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finishPractice.click();
      await page.waitForTimeout(1000);
    }
    await expect(page.getByText('أكملت الوثيقة وتحدي BAC بنجاح')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'تابع إلى الدرس التالي' }).click();
    await expect(page.getByRole('heading', { name: 'الترجمة والشفرة الوراثية' })).toBeVisible();
  });

  test('E2E-02 — Erreur et consolidation non bloquante (traduction → insuffisant → failed → enzymes)', async ({ page }) => {
    await openLessonsTab(page);
    await clickByStrippedText(page, 'الترجمة والشفرة الوراثية');
    await page.waitForTimeout(3000);

    await solveLesson(page, 'الترجمة والشفرة الوراثية');
    await page.waitForTimeout(2000);

    const document = page.getByTestId('live-document');
    await document.locator('textarea').fill('إجابة ناقصة');
    await document.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }).click();

    const bac = page.getByTestId('bac-challenge');
    await bac.locator('textarea').fill('إجابة قصيرة جدا');
    await bac.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }).click();
    const finishPractice = page.getByRole('button', { name: 'إنهاء الممارسة والانتقال' });
    if (await finishPractice.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finishPractice.click();
      await page.waitForTimeout(1000);
    }
    await expect(page.getByText('أنهيت الممارسة مع فكرة تحتاج إلى تثبيت')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'تابع إلى الدرس التالي' }).click();
    await expect(page.getByRole('heading', { name: /الإنزيمات والحفز/ })).toBeVisible();
  });

  test('E2E-03 — Leçon HTML 1/44 → dernière phase → leçon suivante 2/44', async ({ page }) => {
    await openLessonsTab(page);
    await clickByStrippedText(page, 'التخصص الوظيفي للبروتينات');
    await page.waitForTimeout(1000);
    await clickByStrippedText(page, 'تركيب البروتين');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /الدرس 1/ }).first().click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=الدرس 1 / 44', { timeout: 15000 });

    for (let i = 0; i < 50; i++) {
      const nextPhaseBtn = page.getByRole('button', { name: 'التالية' });
      if (await nextPhaseBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextPhaseBtn.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }

    await expect(page.getByText('الدرس 1 / 44')).toBeVisible();
    const nextLessonBtn = page.getByRole('button', { name: 'تابع إلى الدرس التالي' });
    await expect(nextLessonBtn).toBeVisible();
    await nextLessonBtn.click();
    await expect(page.getByText('الدرس 2 / 44')).toBeVisible({ timeout: 10000 });
  });

  test('E2E-04 — Import de progression prévisualisé puis confirmé', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('svt_progress', JSON.stringify({
        xp: 7,
        streak: 0,
        completedUnits: [],
        completedQuestionsCount: 0,
        studyMinutes: 0,
        flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
        quizScoreHistory: [],
      }));
    });
    await page.locator('aside').getByRole('button', { name: 'تقدمي' }).click();
    const transfer = {
      format: 'kunz-progression',
      version: 1,
      exportedAt: '2026-07-27T10:00:00.000Z',
      data: {
        progress: {
          xp: 321,
          streak: 5,
          completedUnits: [1],
          completedQuestionsCount: 20,
          studyMinutes: 90,
          flashcardStats: { again: 1, hard: 2, good: 3, easy: 4 },
          quizScoreHistory: [{ date: '27/07/2026', score: 8, total: 10, unitTitle: 'Unité 1' }],
        },
        units: [{ id: 1, progress: 80, isLocked: false }],
        learningErrors: [],
        evidences: [],
        mastery: {},
        recalls: [],
        snapshots: [],
      },
    };
    await page.locator('input[type="file"]').setInputFiles({
      name: 'kunz-progression.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(transfer)),
    });

    await expect(page.getByTestId('import-preview')).toBeVisible();
    await expect(page.getByTestId('import-preview').getByText('321')).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('svt_progress') ?? '{}').xp)).toBe(7);

    await page.getByRole('button', { name: 'استيراد التقدم' }).click();
    await expect(page.getByTestId('import-success')).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('svt_progress') ?? '{}').xp)).toBe(321);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kunz_missions_v3') ?? 'null'))).toEqual([]);
  });

  test('E2E-05 — Curare affiche le document avant la production', async ({ page }) => {
    await openDocumentAnalysis(page);
    await page.getByRole('button', { name: /جدول تجارب تأثير الكورار/ }).click();

    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'تركيز الكورار' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'انقباض ضعيف جداً أو غائب' })).toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('button', { name: 'صحّح إجابتي' })).toBeVisible();
  });

  test('E2E-06 — Asset indisponible bloque toute production et correction', async ({ page }) => {
    await openDocumentAnalysis(page);
    await page.getByRole('button', { name: /مقارنة بين كمون ما بعد التشابك/ }).click();

    await expect(page.getByText('هذه الوثيقة غير جاهزة بعد.')).toBeVisible();
    await expect(page.getByText('لا يمكن تحليلها دون عرض الجدول أو المنحنى.')).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'صحّح إجابتي' })).toHaveCount(0);
  });

  test('E2E-07 — Shell et leçon HTML restent disponibles hors ligne après première visite', async ({ page }) => {
    await waitForServiceWorkerControl(page);
    await page.reload();
    await waitForServiceWorkerControl(page);

    await page.context().setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await dismissSplash(page, { waitForNetworkIdle: false });

    await expect.poll(async () => page.evaluate(() => navigator.onLine)).toBe(false);
    const manifestCached = await page.evaluate(async () => {
      try {
        const response = await fetch('/manifest.json');
        return response.ok;
      } catch {
        return false;
      }
    });
    expect(manifestCached).toBe(true);

    await openLessonsTab(page);
    await clickByStrippedText(page, 'التخصص الوظيفي للبروتينات');
    await page.waitForTimeout(1000);
    await clickByStrippedText(page, 'تركيب البروتين');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /الدرس 1/ }).first().click();

    await expect(page.getByText('الدرس 1 / 44')).toBeVisible({ timeout: 15000 });
  });
});
