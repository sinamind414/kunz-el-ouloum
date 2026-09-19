export type Etoile = 'A' | 'B' | 'C' | 'D' | 'E';

export const GRILLE: Array<{ min: number; lettre: Etoile }> = [
  { min: 16, lettre: 'A' },
  { min: 14, lettre: 'B' },
  { min: 10, lettre: 'C' },
  { min: 7,  lettre: 'D' },
  { min: 0,  lettre: 'E' },
];

export const LIBELLES_ARABE: Record<Etoile | '—', string> = {
  'A': 'ممتاز',
  'B': 'جيد جدا',
  'C': 'جيد',
  'D': 'متوسط',
  'E': 'يحتاج عملا',
  '—': 'غير مقيم',
};

export function versEtoile(noteCalibré: number, aDesMots: boolean): Etoile | '—' {
  if (noteCalibré === 0) {
    return aDesMots ? 'E' : '—';
  }
  const grille = GRILLE.find(g => noteCalibré >= g.min);
  return grille ? grille.lettre : 'E';
}