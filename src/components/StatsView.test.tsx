// StatsView.test.tsx
//
// #56 — Anti-fiction sur l'écran de statistiques (SpecKit P0.1).
//
// L'écran « تقدمي » est la réponse de l'application à « où j'en suis ? ».
// Un graphique inventé y est plus nocif qu'ailleurs : l'élève n'a aucun
// moyen de distinguer une courbe fabriquée d'une mesure de son travail.
//
// LIMITE DE L'ENVIRONNEMENT, mesurée avant d'écrire ces tests :
// `recharts` ne rend AUCUN `<svg>` sous jsdom (`ResponsiveContainer` mesure
// une largeur nulle) — sonde : 0 `svg.recharts-surface`. Toute assertion
// portant sur le CONTENU d'un graphique passerait donc à vide, y compris
// sur le code défectueux. Les assertions ci-dessous portent uniquement sur
// des éléments réellement rendus : les titres de section, les mentions
// visibles, et la source elle-même.

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import StatsView from './StatsView';
import { UserProgress, Unit } from '../types';

afterEach(cleanup);

// Élève vierge : exactement le DEFAULT_PROGRESS d'App.tsx.
function virginProgress(over: Partial<UserProgress> = {}): UserProgress {
  return {
    xp: 0,
    streak: 0,
    completedUnits: [],
    completedQuestionsCount: 0,
    studyMinutes: 0,
    flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
    quizScoreHistory: [],
    ...over,
  };
}

const VIRGIN_UNITS: Unit[] = [
  { id: 1, title: 'تركيب البروتين', progress: 0, isLocked: false } as Unit,
  { id: 2, title: 'بنية ووظيفة البروتين', progress: 0, isLocked: true } as Unit,
];

const WORKED_UNITS: Unit[] = [
  { id: 1, title: 'تركيب البروتين', progress: 65, isLocked: false } as Unit,
  { id: 2, title: 'بنية ووظيفة البروتين', progress: 0, isLocked: true } as Unit,
];

describe("#56 — aucune progression fabriquée sur l'écran de statistiques", () => {
  it("n'annonce aucune trajectoire mensuelle à un élève qui n'a rien fait", () => {
    render(<StatsView progress={virginProgress()} units={VIRGIN_UNITS} />);

    // Le titre de section est rendu par jsdom (vérifié par sonde) : son
    // absence est donc une assertion réelle, pas un passage à vide. La
    // section promettait « l'évolution du niveau des unités sur le mois »
    // à partir de 4 semaines codées en dur montant jusqu'à 100 %.
    expect(screen.queryByText(/تطور مستوى الوحدات على مدار الشهر/)).toBeNull();
  });

  it('affiche un état vide explicite plutôt qu\'un graphique, sans donnée réelle', () => {
    render(<StatsView progress={virginProgress()} units={VIRGIN_UNITS} />);
    expect(screen.getByTestId('units-progress-empty')).toBeTruthy();
  });

  it("affiche la progression réelle des unités dès qu'elle existe", () => {
    render(<StatsView progress={virginProgress({ xp: 120 })} units={WORKED_UNITS} />);

    expect(screen.queryByTestId('units-progress-empty')).toBeNull();
    const chart = screen.getByTestId('units-progress-real');
    // La valeur affichée doit être celle de l'unité, pas une valeur inventée.
    expect(chart.textContent).toContain('65');
    expect(chart.textContent).toContain('تركيب البروتين');
  });

  it('ne conserve aucune série de progression codée en dur dans la source', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/StatsView.tsx'), 'utf-8');

    // `monthlyUnitProgress` inventait une trajectoire d'apprentissage
    // (20 → 50 → 80 → 100 %) sans jamais lire `progress` ni `units`.
    expect(source).not.toMatch(/const monthlyUnitProgress\s*=\s*\[/);
    expect(source).not.toMatch(/'الأسبوع 1'/);
  });

  it('n\'affiche aucune donnée fabriquée : états vides honnêtes à la place des graphiques de démonstration', () => {
    const { container } = render(<StatsView progress={virginProgress()} units={VIRGIN_UNITS} />);

    // Les trois graphiques (quiz, timeline, cartes) affichaient des mocks
    // (3/4, 75 %…) déguisés en vraies données. Désormais, un élève vierge
    // ne voit que des états vides honnêtes qui l'orientent vers sa première
    // action réelle.
    expect(container.textContent).toMatch(/لا توجد بيانات بعد/);
    expect(container.textContent).toMatch(/لا توجد نتائج بعد/);
    expect(container.textContent).toMatch(/تظهر مستويات التذكر بالتكرار المتباعد بعد تقييمك/);
    // Aucune valeur inventée ne doit apparaître (score simulé des anciens mocks).
    expect(container.textContent).not.toContain('3 / 4');
    expect(container.textContent).not.toMatch(/تجريبي/);
  });
});

// ---------------------------------------------------------------------------
// #57 — Le « kit de certification » : usurpation d'en-tête officiel.
//
// L'écran proposait « تصدير كشف النقاط الرسمي » : un document portant
// l'en-tête « الجمهورية الجزائرية الديمقراطية الشعبية » puis « وزارة التربية
// الوطنية • الديوان الوطني للامتحانات والمسابقات » — l'ONEC étant l'organisme
// qui délivre RÉELLEMENT les résultats du BAC — et un cachet « تمت المصادقة ».
// Mesuré par sonde sur un élève à 0 XP : les quatre mentions étaient présentes,
// avec « أظهر تحكماً ممتازاً » et « 0 XP » sur le même document.
//
// Les propres CGU de l'application (TermsModal.tsx) affirment qu'elle « ne
// remplace en aucun cas le programme officiel, le manuel ou le professeur ».
// L'en-tête contredisait donc frontalement l'engagement affiché.
// ---------------------------------------------------------------------------

describe('#57 — la bulletin exporté ne se fait pas passer pour un document officiel', () => {
  const WORKED = virginProgress({ xp: 120, completedQuestionsCount: 10 });

  // Le modal est monté par un setState : un `btn.click()` nu ne le rend pas
  // (React ne flushe pas hors de `act`). Sans `fireEvent`, les assertions
  // `not.toContain` ci-dessous passeraient À VIDE sur un modal jamais ouvert.
  // Le garde-fou `expect(...unofficial-notice...)` vérifie l'ouverture réelle.
  function openReport() {
    const { container } = render(<StatsView progress={WORKED} units={WORKED_UNITS} />);
    const btn = container.querySelector('#generate-report-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    // Preuve que le modal est bien monté avant toute assertion d'absence.
    expect(screen.getByTestId('certificate-unofficial-notice')).toBeTruthy();
    return container;
  }

  it("n'appose ni les armes de la République ni le nom de l'ONEC", () => {
    const container = openReport();
    const text = container.textContent || '';

    expect(text).not.toContain('الجمهورية الجزائرية الديمقراطية الشعبية');
    expect(text).not.toContain('الديوان الوطني للامتحانات والمسابقات');
    // « المصادقة » = authentification/homologation : une app privée ne l'a pas.
    expect(text).not.toContain('تمت المصادقة');
  });

  it('porte un avertissement visible indiquant que la carte est non officielle', () => {
    const container = openReport();
    const notice = screen.getByTestId('certificate-unofficial-notice');
    expect(notice.textContent).toMatch(/ليست وثيقة رسمية/);
    void container;
  });

  it("ne prétend plus attester d'une « maîtrise excellente » de la méthodologie", () => {
    const container = openReport();
    expect(container.textContent).not.toContain('أظهر تحكماً ممتازاً');
  });

  it("l'en-tête du PNG téléchargé est lui aussi débadgé (lecture de la source)", () => {
    // Le canvas n'est pas rasterisé sous jsdom : on lit donc la source, seule
    // preuve observable pour le chemin d'export image.
    const src = readFileSync(resolve(process.cwd(), 'src/components/StatsView.tsx'), 'utf8');
    const canvasCalls = src
      .split('\n')
      .filter((l) => l.includes('ctx.fillText('))
      .join('\n');

    expect(canvasCalls).not.toContain('الجمهورية الجزائرية الديمقراطية الشعبية');
    expect(canvasCalls).not.toContain('وزارة التربية الوطنية');
    // Le cachet du PNG : « تمت المصادقة » revendique une homologation.
    // (Mutation W : ce cachet a survécu à la première campagne — le DOM ne
    // le contient pas, seul le canvas l'écrivait.)
    expect(canvasCalls).not.toContain('تمت المصادقة');
    expect(canvasCalls).toContain('ليست وثيقة رسمية');
  });

  it("n'offre aucune carte à exporter tant que l'élève n'a rien fait", () => {
    const { container } = render(<StatsView progress={virginProgress()} units={VIRGIN_UNITS} />);

    expect(container.querySelector('#generate-report-btn')).toBeNull();
    expect(screen.getByTestId('report-locked-hint')).toBeTruthy();
  });

  it("rouvre l'export dès qu'un premier quiz est enregistré", () => {
    const { container } = render(
      <StatsView
        progress={virginProgress({
          quizScoreHistory: [{ date: '2026-01-01', score: 4, total: 10, unitTitle: 'تركيب البروتين' }],
        })}
        units={WORKED_UNITS}
      />
    );
    expect(container.querySelector('#generate-report-btn')).toBeTruthy();
    expect(screen.queryByTestId('report-locked-hint')).toBeNull();
  });
});
