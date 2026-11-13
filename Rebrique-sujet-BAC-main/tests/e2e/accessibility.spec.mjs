import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, "défilement horizontal détecté").toBeLessThanOrEqual(1);
}

test("le lien d’évitement est le premier arrêt clavier et cible le contenu", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.locator(".skip-link");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("le changement d’écran place le focus sur le nouvel écran", async ({ page }) => {
  await page.goto("/");
  await page.locator('#year-grid [data-year="2025"]').click();
  /* L'écran de préparation n'a plus de titre : il a été retiré le 2026-09-19
     avec les autres textes qui distrayaient l'élève. announceScreen retombe
     alors sur le nom accessible de la section (SCREEN_NAMES) et c'est la
     section elle-même qui reçoit le focus. Le contrat est inchangé : le focus
     quitte l'écran précédent, et l'écran reste nommé pour un lecteur d'écran. */
  await expect(page.locator("#view-guide")).toBeFocused();
  await expect(page.locator("#view-guide")).toHaveAttribute("aria-label", "دليل الاستعداد");
  await page.locator("#guide-next").click();
  await expect(page.locator("#view-strategy h2")).toBeFocused();
});

test("les exercices restent accessibles dans n’importe quel ordre sans réponse préalable", async ({
  page
}) => {
  await page.goto("/");
  await page.locator('#year-grid [data-year="2025"]').click();
  await page.locator("#guide-next").click();
  await page.locator('#view-strategy [data-confirm="1"][data-session-mode="bac"]').click();
  /* Décision du propriétaire (2026-09-20) : la copie affiche les exercices du
     sujet et leur barème, jamais les questions — elles se lisent dans le PDF.
     Tous les exercices sont rédigables en même temps, sans verrou. */
  const fields = page.locator("#view-workspace [data-exercise-free]");
  await expect(fields).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    await expect(fields.nth(index)).toBeEnabled();
  }
  // Le champ du troisième exercice est là dès l'ouverture : aucune réponse préalable exigée.
  await expect(page.locator('#view-workspace [data-exercise-free="3"]')).toBeVisible();
  await expect(page.locator('#view-workspace [data-exercise-pdf="3"]')).toBeVisible();
  // Aucune question affichée : la source des questions est le sujet officiel.
  await expect(page.locator("#view-workspace [data-task-answer]")).toHaveCount(0);
});

test("la remise de copie est confirmée par une boîte de dialogue accessible", async ({ page }) => {
  await page.goto("/");
  await page.locator('#year-grid [data-year="2025"]').click();
  await page.locator("#guide-next").click();
  await page.locator('#view-strategy [data-confirm="1"][data-session-mode="bac"]').click();
  await page.locator("#simulation-finish").click();
  const modal = page.locator(".modal");
  await expect(modal).toBeVisible();
  await expect(modal.locator("#simulation-finish-yes")).toBeVisible();
  await page.locator("#simulation-finish-no").click();
  await expect(modal).toHaveCount(0);
  await expect(page.locator("#view-workspace")).toBeVisible();
});

test("reflow équivalent à un zoom de 200 % sur un écran de 1280 px", async ({ page }) => {
  // WCAG 1.4.10: 1280 CSS px à 200 % laisse une largeur utile équivalente à 640 CSS px.
  await page.setViewportSize({ width: 640, height: 720 });
  await page.goto("/");
  await expect(page.locator("#year-grid")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator('#year-grid [data-year="2025"]').click();
  await page.locator("#guide-next").click();
  await page.locator('#view-strategy [data-confirm="1"][data-session-mode="bac"]').click();
  await expect(page.locator("#view-workspace")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  // Le sujet s'ouvre dans un tiroir : lui aussi doit tenir sans débordement.
  await page.locator("#simulation-pdf").click();
  await expect(page.locator(".drawer.open")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
