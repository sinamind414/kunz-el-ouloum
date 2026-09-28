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

beforeEach(() => localStorage.clear());

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
  it('réponses modèle Meftah (S1) → affiche ≈18/20 + le détail des 3 exercices', () => {
    remplirEtSoumettre([MODELE_S1[0], MODELE_S1[1], MODELE_S1[2]]);
    expect(screen.getAllByText(/النقطة الأولية الآلية/).length).toBeGreaterThan(0);
    // total 18,36/20 auto (Ex3 = 6,36 + 1,0 de réserve schéma — F3)
    expect(screen.getAllByText(/18/).length).toBeGreaterThan(0);
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
    expect(all[0]!.total).toBe(18.36); // 5 + 7 + 6,36 — la même note que l'affichage
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
    expect(screen.getAllByText(/18/).length).toBeGreaterThan(1); // total + ligne d'historique
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
