// CorrecteurPanel.test.tsx — Rendu du panneau « المصحح الآلي » (jsdom).
// Vérifie le branchement UI : chips d'entités, sanction ATP (38 uniquement),
// verdicts du barème officiel présélectionné, état vide.
//
// Pierre 2 : la section de notation obligatoire « التنقيط الإلزامي » (registre
// attendusBac2025) rejoint le panneau ; l'ancien libellé « التنقيط على المقياس
// الرسمي » devient honnête : « تقرير بنود المقياس (تشخيصي — ليس تنقيطاً) ».

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CorrecteurPanel from './CorrecteurPanel';

afterEach(cleanup);

describe('CorrecteurPanel', () => {
  it('affiche les entités trouvées + l unité inférée (réponse immunité → unite 4)', () => {
    render(<CorrecteurPanel text="يحدث الاستنساخ العكسي ثم الإدماج في ADN الخلية" defaultOpen />);
    expect(screen.getAllByText(/مفاهيم موجودة/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/الاستنساخ العكسي/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/دور البروتينات في الدفاع عن الذات/).length).toBeGreaterThan(0);
  });

  it('affiche la sanction conflit ATP (valeur officielle = 38 uniquement)', () => {
    render(<CorrecteurPanel text="الحصيلة الطاقوية هي 30-32 ATP" defaultOpen />);
    expect(screen.getAllByText(/حصيلة التنفس/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/38 ATP لكل غلوكوز/).length).toBeGreaterThan(0);
  });

  it('barème officiel présélectionné : verdicts, total et avertissement', () => {
    render(
      <CorrecteurPanel
        text="مرحلة التثبيت ثم الاستنساخ العكسي ثم الإدماج"
        defaultOpen
        defaultBaremeQuestionId="bac2024_S1/S1-Ex1/Q1"
      />,
    );
    expect(screen.getAllByText(/تقرير بنود المقياس/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/أداة مساعدة للتصحيح/).length).toBeGreaterThan(0);
    // 4 items crédités (0.25×4 = 1) sur un total de 1.5
    expect(screen.getAllByText(/1 \/ 1\.5 ن/).length).toBeGreaterThan(0);
  });

  it('attendus obligatoires 2025 : le sélecteur expose les 6 groupes (Pierre 2)', () => {
    render(
      <CorrecteurPanel
        text="تمثل الوثيقة تأثير Mtb على المشبك الكيميائي. نلاحظ أن Mtb يمنع ارتباط الأدينوزين بمستقبله ومنه يزداد النشاط العصبي."
        defaultOpen
      />
    );
    const selects = screen.getAllByRole('combobox');
    const selectAttendus = selects.find((s) =>
      Array.from((s as HTMLSelectElement).options).some((o) => o.text.includes('نقل الدم'))
    );
    expect(selectAttendus).toBeDefined();
    expect((selectAttendus as HTMLSelectElement).options.length).toBe(7); // aucun + 6 groupes
  });

  it('texte vide → aucun rendu', () => {
    const { container } = render(<CorrecteurPanel text="   " defaultOpen />);
    expect(container.firstChild).toBeNull();
  });
});
describe('CorrecteurPanel — contrôle de forme selon la consigne (sprint 23)', () => {
  it('ne contrôle rien tant que la consigne n’est pas choisie', () => {
    render(<CorrecteurPanel text="نلاحظ ارتفاع النشاط من 10% إلى 80%" defaultOpen />);
    expect(screen.getByTestId('structure-consigne')).toBeTruthy();
    expect(screen.queryByTestId('structure-score')).toBeNull();
  });

  it('valide une analyse chiffrée quand la consigne « حلّل » est choisie', async () => {
    const user = userEvent.setup();
    render(
      <CorrecteurPanel
        text="نلاحظ في المجال من 0 إلى 5 دقيقة ارتفاع النشاط من 10% إلى 80% أي كلما زاد التركيز كلما زاد النشاط."
        defaultOpen
      />,
    );
    await user.selectOptions(screen.getByTestId('structure-famille'), 'verb_analyser');
    // Trois exigences (chiffres, unités, tendance) ; la vigilance « pas de
    // cause » n'entre pas dans le décompte, elle alerte sans sanctionner.
    expect(screen.getByTestId('structure-score').textContent).toContain('3 / 3');
    expect(screen.getByTestId('structure-check-pas_de_cause').textContent).toContain('✓');
  });

  it('signale l’explication glissée dans un تحليل, avec le conseil associé', async () => {
    const user = userEvent.setup();
    render(
      <CorrecteurPanel
        text="نلاحظ ارتفاع النشاط من 10% إلى 80% لأن الأنزيم يرتبط بالركيزة."
        defaultOpen
      />,
    );
    await user.selectOptions(screen.getByTestId('structure-famille'), 'verb_analyser');
    const ligne = screen.getByTestId('structure-check-pas_de_cause');
    expect(ligne.textContent).toContain('⚠︎');
    expect(ligne.textContent).toContain('التفسير');
  });

  it('reproche au texte scientifique l’absence de problématique et de conclusion', async () => {
    const user = userEvent.setup();
    render(<CorrecteurPanel text="البروتين جزيء حيوي مهم في الخلية." defaultOpen />);
    await user.selectOptions(screen.getByTestId('structure-famille'), 'verb_texte_scientifique');
    expect(screen.getByTestId('structure-check-intro_probleme').textContent).toContain('✗');
    expect(screen.getByTestId('structure-check-conclusion').textContent).toContain('✗');
  });
});
