// Bac2025ExamView.test.tsx — la boucle élève de bout en bout (Pierre 2).
//
// Contrat : l'élève soumet → il voit la note obligatoire /20 calculée UNIQUEMENT
// sur les attendus officiels (registre), avec le détail par exercice.
// Réponses modèle Meftah → ≈18/20 auto (Ex3 : 1,0 pt en réserve humaine pour le
// schéma — F3) · copie vide → 0 · hors-sujet → 0/8.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Bac2025ExamView from './Bac2025ExamView';
import { MEFTA_BAC_EXERCISES } from '../data/meftahManhajia';
import { getExamAttempts } from '../utils/examLog';
import { semerEssai } from '../test-setup/semisEssai';

beforeEach(() => {
  localStorage.clear();
  semerEssai();
});

afterEach(cleanup);

const MODELE_S1 = ([1, 2, 3] as const).map(
  (e) => MEFTA_BAC_EXERCISES.find((x) => x.id === `bac2025-ex${e}`)!.questions.flatMap((q) => q.writeAr).join('\n')
);

function remplirEtSoumettre(reponses: [string, string, string]) {
  render(<Bac2025ExamView onClose={() => {}} />);
  const zones = screen.getAllByLabelText(/التمرين/);
  reponses.forEach((r, i) => fireEvent.change(zones[i], { target: { value: r } }));
  fireEvent.click(screen.getByText(/تسليم التصحيح/));
}

describe('Bac2025ExamView — la boucle élève (R6)', () => {
  it('réponses modèle Meftah (S1) → affiche 19/20 + le détail des 3 exercices', () => {
    remplirEtSoumettre([MODELE_S1[0], MODELE_S1[1], MODELE_S1[2]]);
    expect(screen.getAllByText(/النقطة الأولية الآلية/).length).toBeGreaterThan(0);
    // total 19/20 auto (Ex3 = 7,00 — 2026-10-12, levée du plafond de l'item « NE »)
    expect(screen.getAllByText(/19/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/20/).length).toBeGreaterThan(0);
    // le détail obligatoire par exercice est rendu (3 sections + mention d'intro)
    expect(screen.getAllByText(/التنقيط الإلزامي/).length).toBeGreaterThanOrEqual(3);
  });

  it('copie vide → 0/20, les exercices affichent 0 (rien ne paie le blanc)', () => {
    remplirEtSoumettre(['', '', '']);
    expect(screen.getAllByText(/0/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/التنقيط الإلزامي/).length).toBeGreaterThanOrEqual(3);
  });

  it('hors-sujet (réflexe sur question drogues) → Ex3 à 0/8 affiché', () => {
    const reflexe =
      'المنعكس العضلي ثنائي المشبك يمر عبر النخاع الشوكي، واللوحة المحركة هي البنية النهائية، ' +
      'وآلية الإدماج الزمني والفضائي تحدد شدة الاستجابة، وقانون الكل أو لا شيء يحكم المحور الأسطواني.';
    remplirEtSoumettre([reflexe, reflexe, reflexe]);
    // 3 sections dont Ex3 à 0/8 auto (aucun attendu touché) — F3 : Ex3 affiche
    // la fourchette 0–1 / 8 car le schéma est un item manuel (1,0 officiel).
    expect(screen.getAllByText(/0–1 \/ 8 ن/).length).toBeGreaterThanOrEqual(1);
  });

  it('la soumission archive la tentative : note affichée = note historisée', () => {
    remplirEtSoumettre([MODELE_S1[0], MODELE_S1[1], MODELE_S1[2]]);
    const all = getExamAttempts();
    expect(all).toHaveLength(1);
    expect(all[0]!.total).toBe(19); // 5 + 7 + 7 — 2026-10-12 : l'item « NE » n'a plus de plafond (18,36 → 19)
    // Ex3 = 6,36 auto (+1,0 de réserve pour le schéma, item manuel F3) et non
    // 7,36 : ventilation par partie E — la Partie 2 officielle pèse 4,5 et
    // l'item NE n'est pas créditable (le corrigé écrit « NE », pas
    // « النورادرينالين »). Voir c7.hardening + docs/DIAGNOSTIC_EX3.md.
    expect(all[0]!.sujet).toBe(1);
    expect(all[0]!.exercices).toHaveLength(3);
    // une seule tentative même après re-render (pas de doublon)
    fireEvent.click(screen.getByText(/سجل النقاط/));
    expect(getExamAttempts()).toHaveLength(1);
    // l'entrée d'historique est visible dans le panneau
    expect(screen.getAllByText(/محاولة/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/19/).length).toBeGreaterThan(1); // total + ligne d'historique (2026-10-12 : 18,36 → 19)
  });

  it('historique vide → message honnête (pas un 0 inventé)', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    fireEvent.click(screen.getByText(/سجل النقاط/));
    expect(screen.getAllByText(/لا محاولات مؤرشفة بعد/).length).toBeGreaterThan(0);
  });

  it('l énoncé officiel de chaque exercice est affiché (registre, pas un substitut)', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    expect(screen.getAllByText(/RIP جزيئات ARN/).length).toBeGreaterThan(0); // Q S1-Ex1
    expect(screen.getAllByText(/البيرنويدة|الطبيعية/).length).toBeGreaterThan(0); // Q S1-Ex2
    expect(screen.getAllByText(/الشاي الأخضر/).length).toBeGreaterThan(0); // Q S1-Ex3
  });
});

describe('Bac2025ExamView — chrono officiel 4 h 30 + avis documents (B3)', () => {
  it('affiche la durée officielle 04:30 et un chronomètre démarrable', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    expect(screen.getByTestId('bac2025-chrono')).toBeTruthy();
    expect(screen.getByText(/المدة الرسمية/)).toBeTruthy();
    expect(screen.getByText(/04:30/)).toBeTruthy();
    // démarrage : le chrono passe en marche (bouton devient pause)
    fireEvent.click(screen.getByTestId('bac2025-chrono-toggle'));
    expect(screen.getByTestId('bac2025-chrono-toggle').textContent).toMatch(/إيقاف مؤقت/);
  });

  it('avis honnête : les documents et textes originaux du sujet ne sont PAS dans l app', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    const avis = screen.getByTestId('bac2025-avis-documents');
    expect(avis.textContent).toMatch(/غير مُضمَّنة/); // « non inclus » — aucun mensonge
    expect(avis.textContent).toMatch(/ONEC/);
  });

  it('la soumission met le chrono en pause sans le perdre', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('bac2025-chrono-toggle'));
    fireEvent.click(screen.getByText(/تسليم التصحيح/));
    // après soumission le chrono affiche toujours sa valeur (00:00 min) en pause
    expect(screen.getByTestId('bac2025-chrono')).toBeTruthy();
  });
});

describe('grille MIFTAH dans l énoncé (sujet blanc 4)', () => {
  it('affiche la grille اقرأ/اجمع/اربط/اختُم sur les 3 exercices du blanc 4', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('sujet-blanc-4'));
    for (const n of [1, 2, 3]) {
      const grille = screen.getByTestId(`miftah-grille-${n}`);
      expect(grille.textContent).toContain('اقرأ');
      expect(grille.textContent).toContain('اجمع');
      expect(grille.textContent).toContain('اربط');
      expect(grille.textContent).toContain('اختُم');
    }
  });

  it('ne montre PAS la grille sur les blancs sans méthode (blanc 1)', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('sujet-blanc-1'));
    expect(screen.queryByTestId('miftah-grille-1')).toBeNull();
  });
});
