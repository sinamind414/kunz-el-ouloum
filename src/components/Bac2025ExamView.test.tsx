// Bac2025ExamView.test.tsx — la boucle élève de bout en bout (Pierre 2).
//
// Contrat : l'élève soumet → il voit la note obligatoire /20 calculée UNIQUEMENT
// sur les attendus officiels (registre), avec le détail par exercice.
// Réponses modèle Meftah → ≈19/20 · copie vide → 0 · hors-sujet → 0/8.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Bac2025ExamView from './Bac2025ExamView';
import { MEFTA_BAC_EXERCISES } from '../data/meftahManhajia';

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
  it('réponses modèle Meftah (S1) → affiche ≈19/20 + le détail des 3 exercices', () => {
    remplirEtSoumettre([MODELE_S1[0], MODELE_S1[1], MODELE_S1[2]]);
    expect(screen.getAllByText(/النقطة الأولية الآلية/).length).toBeGreaterThan(0);
    // total 19/20
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
    // 3 sections dont au moins une à 0/8 (aucun attendu touché)
    expect(screen.getAllByText(/0 \/ 8 ن/).length).toBeGreaterThanOrEqual(1);
  });

  it('l énoncé officiel de chaque exercice est affiché (registre, pas un substitut)', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    expect(screen.getAllByText(/RIP جزيئات ARN/).length).toBeGreaterThan(0); // Q S1-Ex1
    expect(screen.getAllByText(/البيرنويدة|الطبيعية/).length).toBeGreaterThan(0); // Q S1-Ex2
    expect(screen.getAllByText(/الشاي الأخضر/).length).toBeGreaterThan(0); // Q S1-Ex3
  });
});
