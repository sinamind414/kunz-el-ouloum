// synonyms.ts
// Synonymes AR/FR pour la détection de cibles moléculaires et de niveaux
// (utilisés par ValidationEngine, pas de matching keyword binaire agressif).

import { normalizeAr } from './normalizeAr';

export interface SynonymGroup {
  key: string;
  forms: string[];
}

export const SYNONYM_GROUPS: SynonymGroup[] = [
  {
    key: 'moleculaire',
    forms: ['المستوى الجزيئي', 'المستوى الجزيئي', 'جزيء', 'جزيئي', 'niveau moleculaire'],
  },
  {
    key: 'cellulaire',
    forms: ['المستوى الخلوي', 'الخلية', 'غشاء', 'مستقبل', 'قناة', 'نواة', 'ريبوزوم', 'ميتوكوندري'],
  },
  {
    key: 'physiologique',
    forms: ['المستوى الوظيفي', 'الوظيفي', 'الفسيولوجي', 'العضوي', 'الكلي', 'العضلة', 'العضوية'],
  },
  {
    key: 'enzyme',
    forms: ['إنزيم', 'انزيم', 'enzyme', 'أريبونوكلياز', 'ارن بوليميراز', 'بوليميراز'],
  },
  {
    key: 'recepteur',
    forms: ['مستقبل', 'recepteur', 'récepteur', 'مستقبل نيكوتيني'],
  },
  {
    key: 'canal',
    forms: ['قناة', 'canal', 'قناة أيونية', 'قناة ايونية'],
  },
  {
    key: 'ach',
    forms: ['الاستيل كولين', 'أستيل كولين', 'استيل كولين', 'ach', 'acetylcholine'],
  },
  {
    key: 'ppm',
    forms: ['كمون اللوحة المحركة', 'كمون اللوحه المحركه', 'ppm'],
  },
  {
    key: 'ppse',
    forms: ['كمون ما بعد التشابك', 'كمون ما بعد التشابكيه', 'ppse'],
  },
];

/** Renvoie true si `raw` contient une des formes du groupe. */
export function matchesSynonym(raw: string, key: string): boolean {
  const group = SYNONYM_GROUPS.find((g) => g.key === key);
  if (!group) return false;
  return group.forms.some((form) => containsWord(raw, form));
}

/** Contient le mot (latin insensible à la casse, arabe normalisé). */
function containsWord(raw: string, word: string): boolean {
  if (/[a-zA-Z]/.test(word)) {
    return normalizeAr(raw).toLowerCase().includes(word.toLowerCase());
  }
  return normalizeAr(raw).includes(normalizeAr(word));
}

/** Détecte un niveau d'analyse (moléculaire / cellulaire / physiologique). */
export function detectLevels(raw: string): string[] {
  const levels: string[] = [];
  if (matchesSynonym(raw, 'moleculaire')) levels.push('moleculaire');
  if (matchesSynonym(raw, 'cellulaire')) levels.push('cellulaire');
  if (matchesSynonym(raw, 'physiologique')) levels.push('physiologique');
  return levels;
}
