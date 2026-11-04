import { expect, test } from "@playwright/test";

/* ------------------------------------------------------------------
   Validation mobile réelle (chromium, viewport téléphone).
   NOTE: ces tests tournent dans la CI (playwright install chromium)
   ; localement le sandbox ne peut pas télécharger le navigateur.
   Ils suivent le produit : une seule session, l'épreuve, terminée
   par « ✓ تسليم الورقة » — l'ancien mode entraînement n'existe plus.
   ------------------------------------------------------------------ */

const PHONES = [
  { name: "iPhone 13 mini", width: 375, height: 812 },
  { name: "Galaxy S20", width: 360, height: 800 },
  { name: "iPhone 14 Pro Max", width: 430, height: 932 }
];

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, "défilement horizontal détecté").toBeLessThanOrEqual(1);
}

for (const phone of PHONES) {
  test(`[${phone.name}] hub sans débordement horizontal`, async ({ page }) => {
    await page.setViewportSize({ width: phone.width, height: phone.height });
    await page.goto("/");
    await expect(page.locator("#year-grid")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test(`[${phone.name}] parcours guide → stratégie → épreuve sans débordement`, async ({ page }) => {
    await page.setViewportSize({ width: phone.width, height: phone.height });
    await page.goto("/");
    await page.locator('#year-grid [data-year="2025"]').click();
    await expect(page.locator("#view-guide")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.locator("#guide-next").click();
    await expect(page.locator("#view-strategy")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.locator('#view-strategy [data-confirm="1"][data-session-mode="bac"]').click();
    await expect(page.locator("#view-workspace")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test(`[${phone.name}] la copie est utilisable au doigt`, async ({ page }) => {
    await page.setViewportSize({ width: phone.width, height: phone.height });
    await page.goto("/");
    await page.locator('#year-grid [data-year="2025"]').click();
    await page.locator("#guide-next").click();
    await page.locator('#view-strategy [data-confirm="1"][data-session-mode="bac"]').click();
    await expect(page.locator("#view-workspace")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const field = page.locator("#view-workspace textarea").first();
    await expect(field).toBeVisible();
    await field.fill("إجابة التجربة على الهاتف");
    await expect(field).toHaveValue("إجابة التجربة على الهاتف");
  });
}

test("[phone] les deux sujets restent ouverts à l'épreuve malgré un inventaire partiel", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.locator('#year-grid [data-year="2025"]').click();
  await page.locator("#guide-next").click();
  await expect(page.locator('[data-subject-coverage="partial"]')).toHaveCount(2);
  await expect(page.locator('[data-exam-openable="true"]')).toHaveCount(2);
  // Le partiel est dit : le nombre de tâches inventoriées est affiché.
  await expect(page.locator("#view-strategy")).toContainText("جرد المهام");
});

test("[phone] parcours Maths : durée 2 h 30 et deux exercices", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.locator("#btn-stream-fab").click();
  await expect(page.locator("#stream-fab-label")).toContainText("رياضيات");
  await page.locator('#year-grid [data-year="2026-m"]').click();
  await expect(page.locator("#global-timer")).toHaveText("02:30:00");
  await expect(page.locator("#view-guide")).toContainText("2س30د");
  await page.locator("#guide-next").click();
  await page.locator('#view-strategy [data-confirm="1"][data-session-mode="bac"]').click();
  await expect(page.locator("#view-workspace [data-exercise-free]")).toHaveCount(2);
  await expectNoHorizontalOverflow(page);
});

test("[phone] tous les états d'écran sans débordement (tiroir du sujet, modale)", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.locator("#year-grid")).toBeVisible();

  // Parcours complet jusqu'à la copie
  await page.locator('#year-grid [data-year="2025"]').click();
  await page.locator("#guide-next").click();
  await page.locator('#view-strategy [data-confirm="1"][data-session-mode="bac"]').click();
  await expect(page.locator("#view-workspace")).toBeVisible();

  // Tiroir du sujet ouvert (le PDF est rendu dans l'application)
  await page.locator("#simulation-pdf").click();
  await expect(page.locator(".drawer.open")).toBeVisible();
  let overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await page.locator(".drawer [data-close]").click();

  // Modale de remise de copie. Le rapport a été retiré de la copie
  // (épure élève — verrouillé par tests/all-buttons.test.mjs), la modale
  // réellement atteignable pendant l'épreuve est donc celle de la remise.
  await page.locator("#simulation-finish").click();
  await expect(page.locator(".modal")).toBeVisible();
  overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await page.locator("#simulation-finish-no").click();
  await expect(page.locator(".modal")).toHaveCount(0);
});
