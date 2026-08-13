import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ComponentProps } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CoachView from './CoachView';
import { STORAGE_KEYS } from '../data/store';
import { ACTIVE_LESSONS } from '../data/activeLessons';
import { CONCEPT_ROUTES } from '../data/conceptRoutes';
import { DOCUMENT_PRACTICE_CONTEXTS } from '../data/documentPracticeContexts';

/**
 * Contre-épreuve du « المرشد الموجه » — CoachView (constats #51 à #54).
 *
 * CoachView est la seconde surface de la boussole (icône Compass). Elle est
 * restée la SEULE surface d'orientation jamais instruite : 531 tests verts
 * n'en exécutaient pas une seule ligne, ce qui a laissé survivre quatre
 * défauts mesurés par sonde avant l'écriture de ce fichier.
 *
 * Chaque assertion encode le comportement ATTENDU, jamais le comportement
 * observé : toutes échouaient avant le correctif.
 */

type CoachProps = ComponentProps<typeof CoachView>;

function renderCoach(overrides: Partial<CoachProps> = {}) {
  const onStartLesson = vi.fn();
  const onSignOut = vi.fn();
  const props: CoachProps = {
    onStartLesson,
    onSignOut,
    ...overrides,
  };
  render(<CoachView {...props} />);
  return { onStartLesson, onSignOut };
}

/** Écrit une erreur d'apprentissage active telle que la produit le moteur réel. */
function seedActiveError(conceptId: string, unitId: number, kind = 'document') {
  const now = Date.now();
  localStorage.setItem(
    STORAGE_KEYS.learningErrors,
    JSON.stringify([
      {
        id: `err_${conceptId}_${now}`,
        kind,
        conceptId,
        unitId,
        ruleIds: [],
        labelAr: `وثيقة: ${conceptId}`,
        count: 2,
        firstSeenAt: now,
        lastSeenAt: now,
        reviewStage: 0,
        reviewStartedAt: now,
        nextReviewAt: now + 86_400_000,
      },
    ])
  );
}

/**
 * Oracle indépendant : unité réelle de chaque leçon, reconstruite depuis les
 * routes de concepts. Sert à vérifier qu'une remédiation ouvre bien un contenu
 * de l'unité où l'élève a échoué — et non « la leçon par défaut ».
 */
const LESSON_UNIT = new Map<string, number>();
for (const route of Object.values(CONCEPT_ROUTES)) {
  if (route.lessonId && route.unitId != null && ACTIVE_LESSONS[route.lessonId] !== undefined) {
    LESSON_UNIT.set(route.lessonId, route.unitId);
  }
}

describe('Boussole — المرشد الموجه : cibles réellement ouvrables (#51)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  // #51 : les erreurs de type « document » portent un conceptId de synthèse
  // `unit:N` (8 des 19 conceptId de documentPracticeContexts). resolveLessonId
  // renvoyait alors `unit:5` tel quel ; InteractiveLessonView ne le trouvant
  // nulle part, getExperimentalLesson servait SILENCIEUSEMENT la leçon de
  // transcription (unité 1). L'élève en échec sur l'unité 5 recevait donc un
  // cours d'unité 1, sans le moindre message.
  it('n’ouvre jamais une leçon d’une autre unité que celle de l’erreur', async () => {
    seedActiveError('unit:5', 5);
    const user = userEvent.setup();
    const { onStartLesson } = renderCoach();

    const review = await screen.findByTestId('weak-point-action-unit:5');
    await user.click(review);

    expect(onStartLesson).toHaveBeenCalledTimes(1);
    const lessonId = onStartLesson.mock.calls[0][0];
    expect(ACTIVE_LESSONS[lessonId]).toBeDefined();
    expect(LESSON_UNIT.get(lessonId)).toBe(5);
  });

  // Contre-épreuve exhaustive : sur TOUS les conceptId réellement produits en
  // production, une remédiation doit soit ouvrir une leçon de la bonne unité,
  // soit — quand l'unité n'a aucune leçon (7, 8, 10, 11) — rediriger l'élève
  // sans jamais ouvrir un contenu hors-sujet.
  it('n’envoie aucun conceptId de production vers un contenu hors-sujet', async () => {
    const contexts = Array.isArray(DOCUMENT_PRACTICE_CONTEXTS)
      ? DOCUMENT_PRACTICE_CONTEXTS
      : Object.values(DOCUMENT_PRACTICE_CONTEXTS);
    const seen = new Map<string, number>();
    for (const c of contexts as { conceptId: string; unitId: number }[]) {
      if (!seen.has(c.conceptId)) seen.set(c.conceptId, c.unitId);
    }
    expect(seen.size).toBeGreaterThan(10);

    const offTopic: string[] = [];
    for (const [conceptId, unitId] of seen) {
      cleanup();
      localStorage.clear();
      seedActiveError(conceptId, unitId);
      const onNavigateToTab = vi.fn();
      const { onStartLesson } = renderCoach({ onNavigateToTab });
      const button = await screen.findByTestId(`weak-point-action-${conceptId}`);
      await userEvent.setup().click(button);

      const lessonId = onStartLesson.mock.calls[0]?.[0];
      if (lessonId === undefined) {
        // Aucune leçon ouverte : acceptable uniquement si l'élève est redirigé.
        if (onNavigateToTab.mock.calls.length === 0) offTopic.push(`${conceptId} -> rien`);
        continue;
      }
      if (ACTIVE_LESSONS[lessonId] === undefined) {
        offTopic.push(`${conceptId} -> leçon inexistante ${lessonId}`);
      } else if (LESSON_UNIT.get(lessonId) !== unitId) {
        offTopic.push(`${conceptId} (unité ${unitId}) -> ${lessonId} (unité ${LESSON_UNIT.get(lessonId)})`);
      }
    }
    expect(offTopic).toEqual([]);
  });
});

describe('Boussole — المرشد الموجه : libellés lisibles (#52)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  // #52 : buildConceptLabel ne couvrait que 8 concepts. 16 des 19 conceptIds
  // réellement produits retombaient sur `return conceptId`, affichant un
  // identifiant latin (« immunity_memory », « unit:5 ») en pleine interface
  // arabe RTL, dans une phrase qui se lit « نقطة ضعفك: unit:5 ».
  it('n’affiche jamais un identifiant technique à l’élève', async () => {
    seedActiveError('immunity_memory', 4);
    renderCoach();

    const label = await screen.findByTestId('weak-point-label-immunity_memory');
    expect(label.textContent ?? '').not.toMatch(/immunity_memory|unit:\d+/);
    // Le libellé doit contenir de l'arabe.
    expect(label.textContent ?? '').toMatch(/[\u0600-\u06FF]/);
  });

  it('donne un libellé arabe à tout conceptId de production', async () => {
    const contexts = (
      Array.isArray(DOCUMENT_PRACTICE_CONTEXTS)
        ? DOCUMENT_PRACTICE_CONTEXTS
        : Object.values(DOCUMENT_PRACTICE_CONTEXTS)
    ) as Array<{ conceptId: string }>;
    const conceptIds = [...new Set(contexts.map((c) => c.conceptId))];

    const raw: string[] = [];
    for (const conceptId of conceptIds) {
      cleanup();
      localStorage.clear();
      seedActiveError(conceptId, 1);
      renderCoach();
      const label = await screen.findByTestId(`weak-point-label-${conceptId}`);
      const text = label.textContent ?? '';
      if (text.includes(conceptId) || !/[\u0600-\u06FF]/.test(text)) raw.push(conceptId);
    }
    expect(raw).toEqual([]);
  });
});

describe('Boussole — المرشد الموجه : verdicts non contradictoires (#53)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  // #53 : « أنت جاهز في » retenait le niveau `developing`, atteint dès UNE
  // preuve à 60/100, sans jamais exclure les concepts en erreur active. Un
  // même concept pouvait donc s'afficher simultanément comme point faible
  // « يتطلب تدخلاً عاجلاً » et comme acquis « أنت جاهز في » — vérifié par
  // simulation sur `synapse`.
  it('ne déclare jamais « prêt » un concept encore en erreur active', async () => {
    const now = Date.now();
    seedActiveError('synapse', 6);
    localStorage.setItem(
      STORAGE_KEYS.mastery,
      JSON.stringify({
        synapse: {
          conceptId: 'synapse',
          knowledge: { level: 'developing', evidenceCount: 1, lastEvidenceAt: now, lastScore: 60 },
          document: { level: 'unknown', evidenceCount: 0 },
          methodology: {},
        },
      })
    );

    renderCoach();

    expect(await screen.findByTestId('weak-point-label-synapse')).toBeTruthy();
    expect(screen.queryByTestId('mastered-synapse')).toBeNull();
  });

  // Isole le PREMIER garde-fou : un concept seulement `developing` (une preuve
  // à 60/100, aucune erreur active) n'est pas une maîtrise établie.
  it('ne déclare pas « prêt » un concept simplement en progrès', async () => {
    const now = Date.now();
    localStorage.setItem(
      STORAGE_KEYS.mastery,
      JSON.stringify({
        photosynthese: {
          conceptId: 'photosynthese',
          knowledge: { level: 'developing', evidenceCount: 1, lastEvidenceAt: now, lastScore: 60 },
          document: { level: 'unknown', evidenceCount: 0 },
          methodology: {},
        },
      })
    );
    renderCoach();
    await screen.findByText(/الدروس الرسمية/);
    expect(screen.queryByTestId('mastered-photosynthese')).toBeNull();
  });

  // Isole le SECOND garde-fou : même `mastered`, un concept encore en erreur
  // active ne doit pas être annoncé comme acquis.
  it('ne déclare pas « prêt » un concept maîtrisé mais en erreur active', async () => {
    const now = Date.now();
    seedActiveError('subduction', 9);
    localStorage.setItem(
      STORAGE_KEYS.mastery,
      JSON.stringify({
        subduction: {
          conceptId: 'subduction',
          knowledge: { level: 'mastered', evidenceCount: 4, lastEvidenceAt: now, lastScore: 92 },
          document: { level: 'unknown', evidenceCount: 0 },
          methodology: {},
        },
      })
    );
    renderCoach();
    expect(await screen.findByTestId('weak-point-label-subduction')).toBeTruthy();
    expect(screen.queryByTestId('mastered-subduction')).toBeNull();
  });

  // Une maîtrise réelle (mastered, sans erreur active) doit rester affichée :
  // le correctif ne doit pas vider la section par excès de prudence.
  it('affiche toujours une maîtrise réellement établie', async () => {
    const now = Date.now();
    localStorage.setItem(
      STORAGE_KEYS.mastery,
      JSON.stringify({
        subduction: {
          conceptId: 'subduction',
          knowledge: { level: 'mastered', evidenceCount: 3, lastEvidenceAt: now, lastScore: 90 },
          document: { level: 'unknown', evidenceCount: 0 },
          methodology: {},
        },
      })
    );

    renderCoach();
    expect(await screen.findByTestId('mastered-subduction')).toBeTruthy();
  });
});

describe('Boussole — المرشد الموجه : promesse du bouton (#54)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  // #54 : le bouton annonce « اختبار تشخيصي شامل ... في المجالات الثلاثة »
  // (test diagnostique couvrant les TROIS domaines) mais appelait
  // onStartLesson('lecon_transcription') — une seule leçon du domaine 1.
  // Le libellé et l'action doivent cesser de se contredire.
  it('n’annonce pas un diagnostic des trois domaines pour ouvrir une leçon d’unité 1', async () => {
    const user = userEvent.setup();
    const onNavigateToTab = vi.fn();
    const { onStartLesson } = renderCoach({ onNavigateToTab });

    const cta = await screen.findByTestId('diagnostic-action');
    await user.click(cta);

    const openedSingleLesson =
      onStartLesson.mock.calls.length > 0 && onStartLesson.mock.calls[0][0] === 'lecon_transcription';
    expect(openedSingleLesson).toBe(false);
    // Le bouton doit conduire quelque part : navigation ou contenu réel.
    expect(onNavigateToTab.mock.calls.length + onStartLesson.mock.calls.length).toBeGreaterThan(0);
  });
});

describe('Boussole — المرشد الموجه : repli câblé en production (#54)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  // Les replis #51/#54 passent par `onNavigateToTab`. Cette prop est
  // optionnelle : si App.tsx ne la fournit pas, les boutons deviennent
  // silencieusement inertes en production alors que les tests restent verts.
  // Ce garde-fou lit la source d'App.tsx pour empêcher la régression.
  it('App.tsx fournit bien onNavigateToTab à CoachView', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
    const mount = source.slice(source.indexOf('<CoachView'), source.indexOf('</Suspense>', source.indexOf('<CoachView')));
    expect(mount).toContain('onNavigateToTab');
  });

  // Unités 7, 8, 10 et 11 n'ont aucune leçon : l'élève doit être redirigé,
  // jamais laissé sur un bouton mort ni envoyé dans une autre unité.
  it('redirige l’élève quand son unité n’a aucune leçon', async () => {
    seedActiveError('unit:7', 7);
    const user = userEvent.setup();
    const onNavigateToTab = vi.fn();
    const { onStartLesson } = renderCoach({ onNavigateToTab });

    await user.click(await screen.findByTestId('weak-point-action-unit:7'));

    expect(onStartLesson).not.toHaveBeenCalled();
    expect(onNavigateToTab).toHaveBeenCalledWith('training');
  });
});
