import { expect, test } from "@playwright/test";

test("le shell est précaché sans jamais embarquer de payload d'année ni de PDF", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#year-grid")).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);

  const precached = await page.evaluate(async () => {
    const urls = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) urls.push(request.url);
    }
    return urls;
  });
  expect(precached.some((url) => url.endsWith("/index.html"))).toBe(true);
  // Les années et les sujets restent à la demande : c'est ce qui rend
  // l'installation légère et le message « غير محفوظة » honnête.
  expect(precached.some((url) => /data\/years\//.test(url))).toBe(false);
  expect(precached.some((url) => url.endsWith(".pdf"))).toBe(false);
});

test("le shell et une année déjà ouverte redémarrent hors ligne", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.locator("#year-grid")).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);

  await page.locator('#year-grid [data-year="2025"]').click();
  await expect(page.locator("#view-guide")).toBeVisible();
  await page.waitForFunction(async () =>
    Boolean(await caches.match("/data/years/se/year-2025.js", { ignoreSearch: true }))
  );
  await context.setOffline(true);
  await page.reload();

  await expect(page.locator("#view-guide")).toBeVisible();
  // Chromium's CDP network emulation keeps navigator.onLine=true after reload;
  // connectivity is therefore asserted below after a real service-worker miss.
  await expect(page.locator("#operational-status [data-build-id]")).toHaveText(/^[a-f0-9]{12}$/);
  await context.setOffline(false);
});

test("une année jamais ouverte annonce clairement son indisponibilité hors ligne", async ({
  page,
  context
}) => {
  await page.goto("/");
  await expect(page.locator("#year-grid")).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.locator('#year-grid [data-year="2024"]').click();
  await expect(page.locator("#view-hub")).toBeVisible();
  await expect(page.locator(".toast")).toContainText("غير محفوظة");
  await expect(page.locator("#operational-status")).toHaveAttribute("data-online", "false");
  await context.setOffline(false);
});

test("l’écran stratégie ne télécharge que le sujet réellement affiché", async ({ page }) => {
  const pdfRequests = [];
  page.on("request", (request) => {
    if (request.url().includes(".pdf")) pdfRequests.push(request.url());
  });
  await page.goto("/");
  await page.locator('#year-grid [data-year="2025"]').click();

  // Hub et écran de calme : aucun mégabit dépensé avant le choix du sujet.
  expect(pdfRequests).toEqual([]);

  await page.locator("#guide-next").click();
  const preview = page.locator("#pdf-preview-container [data-pdf-canvas]");
  await expect(preview).toBeVisible();
  await expect.poll(() => pdfRequests.length, { timeout: 15000 }).toBeGreaterThanOrEqual(1);
  expect(new Set(pdfRequests).size, "un seul sujet à la fois").toBe(1);
  expect(pdfRequests[0]).toContain("/subjects/SE/2025/sujet-1.pdf");

  // Le second sujet n'est téléchargé que lorsque l'élève le demande.
  await page.locator('#view-strategy [data-preview="2"]').click();
  await expect
    .poll(() => pdfRequests.some((url) => url.includes("sujet-2.pdf")), { timeout: 15000 })
    .toBe(true);
});
