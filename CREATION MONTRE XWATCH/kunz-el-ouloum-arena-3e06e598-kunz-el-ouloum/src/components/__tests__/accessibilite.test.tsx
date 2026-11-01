// accessibilite.test.tsx — garde-fou d'accessibilité sur les écrans produits
// depuis le sprint 15 (sprint 47).
//
// Portée assumée : ce test ne remplace pas un audit complet (contraste,
// navigation clavier complète, lecteurs d'écran réels). Il vérifie trois
// défauts fréquents, mécaniques, et invisibles à l'œil :
//
//   1. un bouton sans nom accessible — « bouton » est tout ce qu'annonce un
//      lecteur d'écran, et c'est le cas typique du bouton à icône seule ;
//   2. un champ de saisie sans étiquette ni `aria-label` ;
//   3. une image sans attribut `alt`.
//
// L'application est en arabe, donc en RTL : on vérifie aussi que les écrans
// portent bien `dir="rtl"`, faute de quoi la ponctuation et les nombres
// s'affichent dans le désordre.

import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BacIdeasView from '../BacIdeasView';
import RevisionPlanView from '../RevisionPlanView';
import SituationBankView from '../SituationBankView';
import SchemaDrillView from '../SchemaDrillView';
import BackupPanel from '../BackupPanel';
import MockExamPanel from '../MockExamPanel';
import TrainingHubView from '../TrainingHubView';
import BacIdeaTrainer from '../BacIdeaTrainer';
import WritingReportSheet from '../WritingReportSheet';
import MicroCapsulePanel from '../MicroCapsulePanel';
import QuizView from '../QuizView';
import { IDEA_BY_ID } from '../../data/bacSessionIndex';
import { SVT_QUIZ_QUESTIONS } from '../../data';

afterEach(cleanup);

/** Nom accessible d'un élément : texte visible, aria-label ou title. */
function nomAccessible(el: HTMLElement): string {
  return (
    el.getAttribute('aria-label') ??
    el.getAttribute('title') ??
    (el.textContent ?? '')
  ).trim();
}

const ECRANS: { nom: string; rendre: () => HTMLElement }[] = [
  { nom: 'أفكار التمارين', rendre: () => render(<BacIdeasView />).container },
  { nom: 'خطة المراجعة', rendre: () => render(<RevisionPlanView />).container },
  { nom: 'تمارين بالوضعيات', rendre: () => render(<SituationBankView />).container },
  { nom: 'ارسم من الذاكرة', rendre: () => render(<SchemaDrillView />).container },
  { nom: 'نسخة احتياطية', rendre: () => render(<BackupPanel />).container },
  { nom: 'موضوع تجريبي', rendre: () => render(<MockExamPanel onTrain={() => {}} />).container },
  { nom: 'التمارين والتدريب', rendre: () => render(<TrainingHubView onOpen={() => {}} />).container },
  // Sprint 48 : l'audit s'étend aux écrans où l'élève PRODUIT et est ÉVALUÉ.
  {
    nom: 'ورشة الكتابة',
    rendre: () =>
      render(<BacIdeaTrainer idea={IDEA_BY_ID.bac2023_s2_e3} onClose={() => {}} />).container,
  },
  {
    nom: 'تقرير للأستاذ',
    rendre: () => {
      localStorage.setItem('kunz.bacTrainer.bac2023_s2_e3.verb_analyser', 'نلاحظ ارتفاعاً من 10% إلى 80%.');
      return render(<WritingReportSheet onClose={() => {}} />).container;
    },
  },
  { nom: 'فكرة في دقيقة', rendre: () => render(<MicroCapsulePanel unitId={4} />).container },
  {
    nom: 'الاختبار',
    rendre: () =>
      render(
        <QuizView
          unitId={1}
          unitTitle="تركيب البروتين"
          questions={SVT_QUIZ_QUESTIONS.filter((q) => q.unitId === 1).slice(0, 3)}
          onClose={() => {}}
          onQuizComplete={() => {}}
        />,
      ).container,
  },
];

describe('accessibilité — noms des commandes', () => {
  for (const ecran of ECRANS) {
    it(`${ecran.nom} : chaque bouton a un nom accessible`, () => {
      const container = ecran.rendre();
      const anonymes = Array.from(container.querySelectorAll('button'))
        .filter((b) => nomAccessible(b as HTMLElement) === '')
        .map((b) => (b as HTMLElement).getAttribute('data-testid') ?? b.outerHTML.slice(0, 80));
      expect(anonymes, `boutons sans nom : ${anonymes.join(' | ')}`).toEqual([]);
    });
  }
});

describe('accessibilité — champs et images', () => {
  for (const ecran of ECRANS) {
    it(`${ecran.nom} : chaque champ est étiqueté et chaque image a un alt`, () => {
      const container = ecran.rendre();

      const champsNus = Array.from(container.querySelectorAll('input, textarea, select'))
        .filter((c) => {
          const el = c as HTMLElement;
          if (el.getAttribute('type') === 'hidden') return false;
          if (el.getAttribute('aria-label') || el.getAttribute('placeholder')) return false;
          if (el.id && container.querySelector(`label[for="${el.id}"]`)) return false;
          return !el.closest('label');
        })
        .map((c) => (c as HTMLElement).getAttribute('data-testid') ?? c.outerHTML.slice(0, 80));
      expect(champsNus, `champs sans étiquette : ${champsNus.join(' | ')}`).toEqual([]);

      const imagesNues = Array.from(container.querySelectorAll('img'))
        .filter((i) => i.getAttribute('alt') === null)
        .map((i) => i.getAttribute('src') ?? '?');
      expect(imagesNues, `images sans alt : ${imagesNues.join(' | ')}`).toEqual([]);
    });
  }
});

// Pourquoi exiger `dir` au niveau de l'écran, alors que `index.html` porte
// déjà `dir="rtl"` : l'héritage disparaît dès qu'un écran est rendu dans un
// conteneur LTR — aperçu, feuille d'impression, intégration ailleurs. La
// déclaration locale est une ceinture en plus des bretelles.
describe('accessibilité — sens de lecture', () => {
  for (const ecran of ECRANS) {
    it(`${ecran.nom} : l’écran est déclaré en RTL`, () => {
      const container = ecran.rendre();
      const racineRtl =
        container.querySelector('[dir="rtl"]') !== null ||
        within(container).queryAllByText(/./).length === 0;
      expect(racineRtl, `aucun dir="rtl" sur ${ecran.nom}`).toBe(true);
    });
  }
});
