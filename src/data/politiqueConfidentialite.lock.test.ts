// politiqueConfidentialite.lock.test.ts — le texte PROMIS aux élèves décrit ce
// que le code FAIT. Verrous : mentions obligatoires présentes (honnêteté
// minimale) + structure complète. Toute modification du texte doit refléter
// une modification réelle du comportement — pas un smoothie juridique.

import { describe, expect, it } from 'vitest';
import { DERNIERE_MISE_A_JOUR, SECTIONS_CONFIDENTIALITE } from './politiqueConfidentialite';

const texteComplet = SECTIONS_CONFIDENTIALITE.map((s) => `${s.titre} ${s.paragraphes.join(' ')}`).join('\n');

describe('politique de confidentialité — le texte promis couvre ce que le code fait', () => {
  it('structure : ≥7 sections, chacune titrée et argumentée', () => {
    expect(SECTIONS_CONFIDENTIALITE.length).toBeGreaterThanOrEqual(7);
    for (const s of SECTIONS_CONFIDENTIALITE) {
      expect(s.titre.length, s.titre).toBeGreaterThan(3);
      expect(s.paragraphes.length, s.titre).toBeGreaterThan(0);
      for (const p of s.paragraphes) expect(p.length).toBeGreaterThan(15);
    }
  });

  it('mentions OBLIGATOIRES (vérifiées contre le code réel)', () => {
    expect(texteComplet).toContain('bcrypt'); // server.ts : bcrypt.hash(password, 10)
    expect(texteComplet).toContain('JWT'); // server.ts : jwt.sign … expiresIn 7d
    expect(texteComplet).toContain('18-07'); // référence légale générique
    expect(texteComplet).toContain('لا نبيع'); // aucun partage/vente
    expect(texteComplet).toContain('حذف'); // droit à la suppression
    expect(texteComplet).toContain('وضع الزائر'); // invité = rien ne quitte l'appareil
    expect(texteComplet).toContain('إلكترونيا تلقائيا'); // بريدا (accusatif) // pas de SMTP : reset par code prof
  });

  it('honnêteté de périmètre : NIENT les collectes qui ne sont pas faites', () => {
    expect(texteComplet).toContain('لا نجمع أبدا'); // pas de téléphone/adresse/photos
    expect(texteComplet).toContain('لا يوجد إعلانات'); // pas d'ads ni tracking externe
  });

  it('date de mise à jour au format ISO', () => {
    expect(DERNIERE_MISE_A_JOUR).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
