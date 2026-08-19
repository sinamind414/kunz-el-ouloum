import { test, expect, type Page } from '@playwright/test';
import { DATA_VERSION } from '../../src/config/appConfig';

const BASE_URL = 'http://localhost:3000';

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

// Navigation dans LessonsView (structure réelle : cartes <article> avec boutons).
async function openFirstDomain(page: Page) {
  await page.getByRole('button', { name: 'افتح المجال ←' }).first().click();
  await page.waitForTimeout(800);
}

async function openFirstUnit(page: Page) {
  await page.getByRole('button', { name: 'افتح الوحدة ←' }).first().click();
  await page.waitForTimeout(800);
}

async function openLessonCardByTitle(page: Page, titleText: string) {
  const card = page.locator('article', { hasText: titleText }).first();
  await card.getByRole('button', { name: /افتح/ }).click();
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
    // DATA_VERSION est une constante Node : elle doit être passée en argument
    // du callback (exécuté dans le navigateur), sinon ReferenceError.
    await page.evaluate((version) => {
      localStorage.setItem('kunz_user', JSON.stringify({ id: 'e2e-guest', email: 'guest@kunz.local', name: 'طالب زائر' }));
      localStorage.setItem('svt_data_version', version);
      // Au premier lancement, SplashView ouvre la modale des CGU par-dessus le
      // bouton « ابدأ رحلة » : sans acceptation préalable, les clics du test
      // n'atteignent jamais le parcours.
      localStorage.setItem('kunz_terms_accepted', 'true');
      // Élève avancé (XP > 150) : déverrouille « تحليل وثائق » et « تحدي BAC »
      // dans l'onglet أتدرب (TrainingView.isFirstSessions).
      localStorage.setItem('svt_progress', JSON.stringify({
        xp: 200,
        streak: 0,
        completedUnits: [],
        completedQuestionsCount: 0,
        studyMinutes: 0,
        flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
        quizScoreHistory: [],
      }));
    }, DATA_VERSION);
    await page.reload();
    await dismissSplash(page);
  });

  // ARCH-001 : la valeur première de l'E2E est de prouver que les vues lazy
  // (chunks séparés) se chargent réellement dans le build de production.
  test('E2E-01 — La leçon active s\'ouvre depuis la liste (chunk lazy chargé en production)', async ({ page }) => {
    await openLessonsTab(page);
    await openFirstDomain(page);
    await openFirstUnit(page);
    await openLessonCardByTitle(page, 'استنساخ المعلومات الوراثية');
    await page.waitForTimeout(3000);

    await expect(page.getByRole('heading', { name: /استنساخ المعلومات الوراثية/ }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('lesson-block').first()).toBeVisible({ timeout: 15000 });
  });

  test('E2E-02 — La leçon de traduction s\'ouvre et affiche ses blocs', async ({ page }) => {
    await openLessonsTab(page);
    await openFirstDomain(page);
    await openFirstUnit(page);
    await openLessonCardByTitle(page, 'الدرس 4');
    await page.waitForTimeout(3000);

    await expect(page.getByRole('heading', { name: /الترجمة/ }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('lesson-block').first()).toBeVisible({ timeout: 15000 });
  });

  test('E2E-03 — Leçon HTML 1/44 → dernière phase → leçon suivante 2/44', async ({ page }) => {
    await openLessonsTab(page);
    await openFirstDomain(page);
    await openFirstUnit(page);
    await openLessonCardByTitle(page, 'الدرس 1 :');
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
    // Deux champs fichier existent sur la page (import/export) : viser celui
    // de l'import par son libellé accessible.
    await page.getByLabel('ملف تقدم Kunz').setInputFiles({
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
    // Première visite EN LIGNE : ouvre le parcours pour que le service worker
    // mette en cache les chunks lazy (LessonsView, HtmlLessonViewer) et la
    // leçon — c'est le comportement réel d'un élève avant de repasser hors
    // ligne.
    await openLessonsTab(page);
    await openFirstDomain(page);
    await openFirstUnit(page);
    await openLessonCardByTitle(page, 'الدرس 1 :');
    await expect(page.getByText('الدرس 1 / 44')).toBeVisible({ timeout: 15000 });

    await page.reload();
    await waitForServiceWorkerControl(page);

    await page.context().setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await dismissSplash(page, { waitForNetworkIdle: false });

    // Preuve réelle de coupure réseau : /api/health n'est pas servi par le
    // service worker (exclu du handler sw.js) → le fetch doit échouer.
    // (navigator.onLine n'est pas fiable sous certains Chromium headless.)
    const networkReallyOff = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/health');
        return response.ok;
      } catch {
        return false;
      }
    });
    expect(networkReallyOff).toBe(false);
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
    await openFirstDomain(page);
    await openFirstUnit(page);
    await openLessonCardByTitle(page, 'الدرس 1 :');

    await expect(page.getByText('الدرس 1 / 44')).toBeVisible({ timeout: 15000 });
  });
});
