// manuelErrata.ts
// Errata OFFICIELS du manuel scolaire — tableaux « تصويب الأخطاء » du دليل الأستاذ
// [L6] (docs/sources/دليل-الأستاذ-2017.txt), p.25/29/36/55 (D1), p.59 (D2 U1),
// p.92/124 (D1 U4/U5), p.133-134 (U5 تصويبات), p.273 (U6), p.131 (Maths).
//
// Usage correcteur : un terme erroné du MANUEL ne doit JAMAIS être sanctionné
// chez l'élève (source : A_COMPTE_COMME) ; la forme correcte officielle est
// recommandée à la place (formeCorrecte). Un terme correct ne doit pas être
// marqué faux parce que le manuel imprime autre chose.

import { normalizeAr } from '../lib/validation/normalizeAr';

export interface Erratum {
  /** Mot-clé erroné tel qu'imprimé dans le manuel. */
  faux: string;
  /** Forme correcte officielle (دليل الأستاذ). */
  formeCorrecte: string;
  /** Contexte pédagogique (unité / document / page du manuel). */
  contexte: string;
  /** Commentaire officiel du guide. */
  note?: string;
  /**
   * Paires [molécule, ion] dont l'assertion inversée doit être détectée.
   * Utile quand les deux lignes d'un tableau du manuel étaient permutées :
   * l'élève peut répéter l'inversion sous une AUTRE formulation que le texte
   * exact « faux » (ex. « Tetrodotoxine مادة مثبطة لانتقال K⁺ » au lieu de
   * « Tetraethyl-ammonium مادة مثبطة لانتقال Na⁺ »).
   */
  pairesInversees?: ReadonlyArray<readonly [string, string]>;
}

export const ERRATA: ReadonlyArray<Erratum> = [
  // ── Unité 1 : تركيب البروتين (p.25) ─────────────────────────────────────────
  {
    faux: 'الوزن الجزيئي لـ ARNr هو 3.6x10⁶ / الوزن الجزيئي لـ ARNt هو 2.5x10⁶',
    formeCorrecte: 'الوزن الجزيئي لـ ARNr: 3.6x10⁴ — الوزن الجزيئي لـ ARNt: 2.5x10⁴',
    contexte: 'D1U1, p.25',
    note: 'Corrige aussi l\u2019erreur du sujet BAC 1999 : 3 types d\u2019ARNr (poids différents), pas 3 types d\u2019ARNt',
  },
  // ── Unité 2 (p.36) : le manuel 3 = تمرين 4 ────────────────────────────────
  {
    faux: 'السؤال 3 من التمرين 3 هو عبارة عن تمرين 4',
    formeCorrecte: 'هو عبارة عن تمرين 4 (مصنف ضمن تمارين الوحدة الأولى من المجال 2، ص.203)',
    contexte: 'D1U2, p.55',
  },
  // ── Unité 5 : الاتصال العصبي (p.132-134) ─────────────────────────────────
  {
    faux: 'Tetraethyl-ammonium مادة مثبطة لانتقال Na⁺',
    formeCorrecte: 'Tetrodotoxine مادة مثبطة لانتقال Na⁺ — Tetraethyl-ammonium مادة مثبطة لانتقال K⁺',
    contexte: 'D1U5, الوثيقة 3 (مصدر الكمون في الغشاء قبل مشبكي), p.132',
    note: 'Les deux lignes du tableau d\u2019errata étaient inversées dans le manuel',
    // L'inversion miroir (TTX+K⁺) doit être détectée aussi : l'élève qui
    // recopie le manuel peut permuter les deux lignes dans les deux sens.
    pairesInversees: [
      ['Tetrodotoxine', 'K⁺'],
      ['Tetraethyl-ammonium', 'Na⁺'],
      ['TEA', 'Na⁺'],
    ],
  },
  {
    faux: 'منحنيات الوثيقة 4 غير موجودة في الصفحة 167',
    formeCorrecte: 'منحنيات الوثيقة 4 الموجودة في الصفحة 167 تابعة للتمرين 2',
    contexte: 'D1U5, التمرين 2, p.167',
  },
  {
    faux: 'المبين في الشكل 2 (بيانات التمرين 1)',
    formeCorrecte: 'المبين في الشكل 1',
    contexte: 'D1U5, التمرين 1, السطران 22 و26, p.166',
  },
  {
    faux: 'الوثيقة الموجودة على يسار الصفحة = الوثيقة 2 والوثيقة الموجودة على يمينها = الوثيقة 2',
    formeCorrecte: 'الوثيقة الموجودة على يمين الصفحة = الوثيقة 3 — الوثيقة الموجودة على يسارها = الوثيقة 4',
    contexte: 'D1U5, p.170',
  },
  {
    faux: 'الوثيقة الموجودة في أسفل الصفحة = الوثيقة 1 (التمرين 5)',
    formeCorrecte: 'الوثيقة 2',
    contexte: 'D1U5, التمرين 5, p.171',
  },
  // ── Unité 4 : المناعة (p.92, 97, 107, 121, 124) ──────────────────────────
  {
    faux: 'نتائج الهجرة الكهربائية للمصل (النشاط 5)',
    formeCorrecte: 'تعكس النتائج',
    contexte: 'D1U4, النشاط 5: مصدر الأجسام المضادة, الوثيقة 1, p.92',
  },
  {
    faux: 'التكرير في كلمة الطريقة (الحالة الثانية للدفاع عن العضوية)',
    formeCorrecte: 'طريقة تأثيرها ومصدرها',
    contexte: 'D1U4, الحالة الثانية, السطر 3, p.97',
  },
  {
    faux: 'المدخل: النشاط 8 (سبب فقدان المناعة المكتسبة)',
    formeCorrecte: 'النشاط 9',
    contexte: 'D1U4, المدخل, p.107',
  },
  {
    faux: 'حقن عدد كبير من LT4 (التمرين 3)',
    formeCorrecte: 'حقن عدد كبير من جزيئات المستقبلات الغشائية المنزوعة من LT4',
    contexte: 'D1U4, التمرين 3, السطر 6, p.121',
  },
  {
    faux: 'غياب التحلل الخلوي في الخانة 3 من السطر 1 في الجدول (التمرين 7)',
    formeCorrecte: 'وجود تحلل خلوي',
    contexte: 'D1U4, التمرين 7, جدول الوثيقة 1, p.124',
  },
  // ── Domaine 2 : التحولات الطاقوية (p.59, 183, 201-203, 225, 233) ──────────
  {
    faux: 'نقص بيانات من منحنى التمرين 2 (ص.36)',
    formeCorrecte: 'المنحنى كاملا ومصحح بالدليل',
    contexte: 'D2, p.36',
  },
  {
    faux: 'نفس الشروط التجريبية السابقة (ص.183)',
    formeCorrecte: 'في شروط تجريبية مناسبة تسمح بقياس كمية الأكسجين المنطلق',
    contexte: 'D2U1, إظهار مصدر الأكسجين المنطلق, p.183',
  },
  {
    faux: 'حل (تمرين 1 سؤال 2, ص.201)',
    formeCorrecte: 'حلل',
    contexte: 'D2U1, خطأ مطبعي',
  },
  {
    faux: 'خطأ في ترقيم الوثائق: الوثيقة 4 هي 2 والوثيقة 2 هي 3 (ص.202)',
    formeCorrecte: 'ترقيم الوثائق كما في الدليل',
    contexte: 'D2U1, التمرين 2',
  },
  {
    faux: 'التمرين 5 غير مرقم (ص.203)',
    formeCorrecte: 'يرقم ثم يحول إلى الوحدة 2 من المجال 1',
    contexte: 'D2, ص.203',
    note: 'Le التمرين 5 (شحنات الببتيدات) est transféré à la section « تمارين الوحدة 2 من المجال 1 »',
  },
  {
    faux: 'تم تنمي (ص.225)',
    formeCorrecte: 'تمت تنمية',
    contexte: 'D2U2, ص.225',
  },
  {
    faux: 'وسط هوائي + محلول غلوكوز (مكرر مرتين)',
    formeCorrecte: 'وسط هوائي (أ) + محلول غلوكوز — وسط لاهوائي (ب) + محلول غلوكوز',
    contexte: 'D2U2, ص.225',
  },
  {
    faux: 'موقع الأسهم في منحنى التمرين 1 (ص.233)',
    formeCorrecte: 'المنحنى مصحح في الدليل',
    contexte: 'D2U3, التمرين 1',
  },
  // ── Domaine 3 : التكتونية (p.246-252, 283-298) ────────────────────────────
  {
    faux: '(2) دراسة مخطط بنيوف بالخطأ «سمحت» مكتوبة «لسحت» (ص.247)',
    formeCorrecte: 'سمحت',
    contexte: 'D3U1, ص.246-247',
  },
  {
    faux: 'زيادة عنوان (السطر 23, ص.250): نمذجة حركة تيارات الحمل',
    formeCorrecte: '(4) نمذجة حركة تيارات الحمل على مستوى الكرة الأرضية',
    contexte: 'D3U1, النشاط 3, ص.250',
  },
  {
    faux: '(4) مقارنة بين ناقلية الصخور ونقلية قطعة حديد (ص.252)',
    formeCorrecte: '(5) مقارنة بين ناقلية الصخور وناقلية الحديد',
    contexte: 'D3U1, النشاط 3, السطر الأول, ص.252',
  },
  {
    faux: 'رسوبات غير متماسكة (السطر الثالث في الجدول, ص.284)',
    formeCorrecte: 'رسوبات متماسكة',
    contexte: 'D3U2, أستثمر وأوظف معلوماتي, التمرين 4',
  },
  {
    faux: 'أثر (السطر الثاني في التمرين الثالث, ص.283)',
    formeCorrecte: 'تم إستخراج',
    contexte: 'D3U2, أستثمر وأوظف معلوماتي',
  },
  {
    faux: 'ما هي سرعة الموجات الزلزالية (ص.286, التمرين 6)',
    formeCorrecte: 'ما هي سرعة الموجات الزلزالية (أ)',
    contexte: 'D3U2, أستثمر وأوظف معلوماتي, السطر السادس',
  },
  {
    faux: '2- وضح برسم (ص.293, السطر 21)',
    formeCorrecte: '3- وضح برسم',
    contexte: 'D3U3, ص.293',
  },
  {
    faux: 'الوثيقة (8) (ص.293, السطر 25)',
    formeCorrecte: 'الوثيقة (9ب)',
    contexte: 'D3U3, ص.293',
  },
  {
    faux: 'تشكل التضاريس المميزة (عنوان, ص.294)',
    formeCorrecte: 'تشكل الصخور المميزة',
    contexte: 'D3U3, النشاط 3, ص.294',
  },
  {
    faux: 'في الأنابيب الثلاثة (ص.298, السطر 10)',
    formeCorrecte: 'في الأنابيب الثلاثة بعد ساعة من التسخين',
    contexte: 'D3U3, النشاط 3, ص.298',
  },
  // ── شعبة الرياضيات (p.110, 131, 134, 138) ─────────────────────────────────
  {
    faux: 'التأثير الإيجابي للإنسان على مستقبل الكوكب (وحدات المجال 8, ص.110)',
    formeCorrecte: 'العلاقة بين نشاطات الإنسان والتلوث الجوي',
    contexte: 'شعبة الرياضيات, وحدات المجال 2, ص.110',
  },
  {
    faux: 'رھانات من أجل بیئة متوازنة (وحدات المجال 11, ص.110)',
    formeCorrecte: 'التأثير الإيجابي للإنسان على مستقبل الكوكب',
    contexte: 'شعبة الرياضيات, وحدات المجال 2, ص.110',
  },
  {
    faux: 'الصفحة 132 (السؤال 2, ص.134)',
    formeCorrecte: 'الصفحة 131',
    contexte: 'شعبة الرياضيات',
  },
  {
    faux: 'بالتلوث الزراعي وبالتلوث الصناعي (الحصيلة المعرفية, ص.138)',
    formeCorrecte: 'بالنشاط الزراعي والنشاط الصناعي',
    contexte: 'شعبة الرياضيات, النشاط 2 والنشاط 3',
  },
];

/**
 * Termes scientifiques à NE PAS sanctionner si l'élève les emploie :
 * le manuel lui-même les imprime de façon erronée/inversée.
 * Chaque entrée = { formes tolérées → raison (errata officiel) }.
 */
export const TERMES_A_COMPTE_COMME: ReadonlyArray<{
  formes: string[];
  raison: string;
}> = [
  {
    formes: ['8120', 'gP120', 'GP120'],
    raison: 'gp120 (glycoprotéine VIH) — le manuel écrit parfois gP120/GP120',
  },
  {
    formes: ['Tetrodotoxine', 'Tétrodotoxine'],
    raison: 'TTX bloque Na⁺ (errata U5 : les inhibiteurs TTX/TEA étaient inversés)',
  },
  {
    formes: ['Tetraethyl-ammonium', 'TEA'],
    raison: 'TEA bloque K⁺ (errata U5)',
  },
  {
    formes: ['3.6x10⁴', '2.5x10⁴'],
    raison: 'Poids moléculaires ARNr/ARNt corrigés par le دليل (p.25)',
  },
];

// ── Détection des assertions inversées (paires permutées du manuel) ──────────

/** Mots de liaison « inhibe » reliant une molécule à un ion (normalisés au vol). */
const MOTS_LIAISON_INHIBITION: ReadonlyArray<string> = [
  'مثبطة', 'مثبط', 'مثبطات', 'يثبط', 'تثبيط',
];

/** Fenêtre max (tokens) entre molécule et ion dans « X مثبطة لانتقال Y ». */
const FENETRE_ASSERTION = 5;

function tokensDe(texte: string): string[] {
  return normalizeAr(texte).toLowerCase().split(/\s+/).filter(Boolean);
}

/** Positions (index du 1er token) où la forme apparaît comme séquence exacte de tokens. */
function positionsDe(tokens: string[], forme: string): number[] {
  const parts = normalizeAr(forme).toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return [];
  const out: number[] = [];
  for (let i = 0; i + parts.length <= tokens.length; i++) {
    if (parts.every((p, k) => tokens[i + k] === p)) out.push(i);
  }
  return out;
}

/**
 * L'assertion « molécule inhibe ion » (forme inversée de l'erratum) est-elle
 * présente ? On exige l'ordre molécule → mot de liaison → ion dans une
 * fenêtre serrée : les pairages CORRECTS (TTX/Na⁺, TEA/K⁺) et une simple
 * co-présence dans deux phrases distinctes ne déclenchent pas de faux positif.
 */
function assertionInversee(texte: string, paire: readonly [string, string]): boolean {
  const tokens = tokensDe(texte);
  if (tokens.length === 0) return false;
  const liaison = new Set(MOTS_LIAISON_INHIBITION.map((m) => normalizeAr(m)));
  const [molecule, ion] = paire;
  for (const i of positionsDe(tokens, molecule)) {
    for (const j of positionsDe(tokens, ion)) {
      if (j <= i || j - i > FENETRE_ASSERTION) continue;
      if (tokens.slice(i + 1, j).some((tk) => liaison.has(tk))) return true;
    }
  }
  return false;
}

/** Cherche un erratum dont le texte erroné apparaît dans la réponse. */
export function chercherErratum(texte: string): Erratum | null {
  const t = texte.trim();
  if (!t) return null;
  // 1re passe : le texte erroné exact imprimé par le manuel.
  for (const e of ERRATA) {
    if (t.includes(e.faux) || e.faux.includes(t)) return e;
  }
  // 2e passe : assertions inversées (paires permutées) — l'élève peut
  // reformuler l'erreur au lieu de recopier le texte exact du manuel.
  for (const e of ERRATA) {
    if (e.pairesInversees?.some((paire) => assertionInversee(t, paire))) return e;
  }
  return null;
}

/** La réponse contient-elle une forme tolérée par errata officiel ? */
export function estFormeToleree(token: string): { raison: string } | null {
  const t = token.trim().toLowerCase();
  if (!t) return null;
  for (const g of TERMES_A_COMPTE_COMME) {
    if (g.formes.some((f) => f.toLowerCase() === t)) return { raison: g.raison };
  }
  return null;
}
