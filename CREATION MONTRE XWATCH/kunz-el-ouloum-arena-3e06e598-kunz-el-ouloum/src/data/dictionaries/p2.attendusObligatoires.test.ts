// p2.attendusObligatoires.test.ts — LA RÈGLE DURE de Pierre 2, verrouillée :
// aucune note ne peut sortir du produit hors du moteur à attendus ; le
// diagnostic barème ne triche plus (matching borné) ; l'UI l'affiche comme tel.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { evaluerBareme, listBaremeQuestions } from './baremeCorrecteur';

describe('P2 — règle « attendus obligatoires » (verrous d architecture)', () => {
  it('le diagnostic barème matche aux frontières : « ATPase » ne crédite pas l item ATP', () => {
    const q =
      listBaremeQuestions().find((x) => x.items.some((i) => /ATP/.test(i.ar || i.fr || ''))) ??
      null;
    expect(q).not.toBeNull();
    const sans = evaluerBareme('الأنزيم ATPase يكسر الرابطة الغلوكوزية.', q!.id);
    const itemAtp = sans!.verdicts.find((v) => /ATP/.test(v.item.ar || v.item.fr || ''))!;
    expect(itemAtp.credite).toBe(false);
    const avec = evaluerBareme('يتشكل ATP في الهيولى.', q!.id);
    const itemAtp2 = avec!.verdicts.find((v) => /ATP/.test(v.item.ar || v.item.fr || ''))!;
    expect(itemAtp2.credite).toBe(true);
  });

  it('CorrecteurPanel : la note vient du moteur calibré ; le barème est affiché تشخيصي', () => {
    const src = readFileSync(join(process.cwd(), 'src/components/CorrecteurPanel.tsx'), 'utf-8');
    expect(src).toContain('noterExerciceCalibre');
    expect(src).toContain('ليس تنقيطاً');
    expect(src).not.toContain('noterDepuisCouverture');
    expect(src).not.toContain('evaluerReponseKeywords');
    // Règle dure : plus aucun try/catch qui avalerait l absence d attendus.
    expect(src).not.toContain('catch {');
  });

  it('la boucle élève note EXCLUSIVEMENT via noterCopieCalibree (attendus)', () => {
    const src = readFileSync(join(process.cwd(), 'src/components/Bac2025ExamView.tsx'), 'utf-8');
    expect(src).toContain('noterCopieCalibree');
    expect(src).not.toContain('evaluerReponseKeywords');
    expect(src).not.toContain('noterDepuisCouverture');
  });

  it('le moteur supervisé (banc R4) n importe aucun chemin de note legacy', () => {
    const src = readFileSync(join(process.cwd(), 'src/supervision/evaluerCopies.ts'), 'utf-8');
    expect(src).toContain('noterCopieCalibree');
    expect(src).not.toContain('noterDepuisCouverture');
  });
});
