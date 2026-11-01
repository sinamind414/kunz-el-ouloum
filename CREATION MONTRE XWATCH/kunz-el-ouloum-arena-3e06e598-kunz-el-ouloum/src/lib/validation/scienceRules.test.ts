// scienceRules.test.ts — Preuve du fix respiration.json (patterns [Preview corrompus)
//
// Avant le fix : patterns regex invalides → catch silencieux dans
// verifierScience → les erreurs graves glycolyse/Krebs N'étaient JAMAIS détectées.
// Contrats :
//   1. Patterns regex valides (pas d'exception à la construction)
//   2. «الغليكوليز داخل الميتوكوندريا» → flag grave glycolyse_mitochondrie
//   3. «دورة كريبس في الهيولى» → flag grave Krebs_hyaloplasme
//   4. Copie correcte (glycolyse في الهيولى, Krebs في المصفوفة) → status ok,
//      AUCUN faux positif
//   5. «36 ATP» → flag grave erreur_36_atp → status error
import { describe, it, expect } from 'vitest';
import { verifierScience } from './scienceRules';

const COPIE_CORRECTE =
  'يحدث الغليكوليز في الهيولى وينتج 2 ATP ثم تحدث دورة كريبس في المصفوفة ' +
  'الميتوكوندرية وتنتج 2 ATP وأخيرا تسير السلسلة التنفسية على الغشاء الداخلي ' +
  'للميتوكوندري وتنتج 34 ATP وبذلك ينتقل التحلل من الهيولى والميتوكوندري ' +
  'فيكون المجموع 38 ATP';

describe('verifierScience — respiration (patterns purgés)', () => {
  it('patterns regex valides : construction RegExp sans exception', async () => {
    // Si un pattern est invalide, new RegExp throw — on ne doit jamais crasher
    // (le catch silencieux de verifierScience l'ignorerait : ici on l'expose).
    const j = (await import('../../data/scienceRules/respiration.json' as string)).default;
    for (const err of j.errors) {
      expect(() => new RegExp(err.pattern)).not.toThrow();
    }
  });

  it('glycolyse DANS la mitochondrie → erreur grave détectée', async () => {
    const r = await verifierScience('الغليكوليز يحدث داخل الميتوكوندريا حسب الوثيقة', 'respiration');
    expect(r.flags.some(f => f.code === 'glycolyse_mitochondrie' && f.severity === 'grave')).toBe(true);
    expect(r.status).toBe('error');
  });

  it('dورة كريبس dans l\'hyaloplasme → erreur grave détectée', async () => {
    const r = await verifierScience('تتم دورة كريبس في الهيولى الخلوية عند الخلية', 'respiration');
    expect(r.flags.some(f => f.code === 'Krebs_hyaloplasme' && f.severity === 'grave')).toBe(true);
    expect(r.status).toBe('error');
  });

  it('copie correcte → ok, aucun faux positif grave', async () => {
    const r = await verifierScience(COPIE_CORRECTE, 'respiration');
    expect(r.flags.filter(f => f.severity === 'grave')).toEqual([]);
    expect(r.facts_missing).toEqual([]);
    expect(r.status).toBe('ok');
  });

  it('36 ATP au lieu de 38 → erreur grave', async () => {
    const r = await verifierScience('ينتج التنفس الخلوي 36 ATP في المجموع', 'respiration');
    expect(r.flags.some(f => f.code === 'erreur_36_atp' && f.severity === 'grave')).toBe(true);
    expect(r.status).toBe('error');
  });

  it('règle inconnue → RULE_NOT_FOUND en warning (pas de crash)', async () => {
    const r = await verifierScience('نص', 'theme_inexistant_xyz');
    expect(r.flags.some(f => f.code === 'RULE_NOT_FOUND')).toBe(true);
  });
});
