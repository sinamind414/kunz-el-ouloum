// src/data/glossaireCapitaine.ts — GLOSSAIRE DU CAPITAINE (étage 2, 2026-11-07).
//
// RÈGLE D'OR : AUCUNE définition n'est écrite dans ce fichier. Toutes viennent
// de `FILL_BLANK_QUESTIONS` (121 micro-tests servis, `acceptedAnswers` issus
// des 500 QCM). Les contrats de verbes et les verdicts sont COPIÉS de
// `smartTutorEngine.ts` et vérifiés mot pour mot par
// `glossaireCapitaine.lock.test.ts` — une dérive silencieuse est impossible.
//
// Décisions utilisateur câblées ici :
//   H1 la bulle du capitaine répond (une seule voix) ;
//   H2 l'élève tape le mot, librement ;
//   H3 une question-sonde AVANT le contenu ;
//   H6 les sources sont celles du dépôt, pas un corpus externe.
//
// Ce module est chargé À LA DEMANDE (lazy) : il ne doit jamais entrer dans le
// bundle d'entrée (plafond 700 Ko, `poidsEntree.verrou.test.ts`).

import { normalizeArabic } from '../utils/arabicNormalize';
import { FILL_BLANK_QUESTIONS } from './fillBlanks';
import { NON_EXIGIBLES, PROGRESSION_OFFICIELLE } from './curriculumOfficial';

// ── Les 10 contrats de verbes, source : smartTutorEngine.ts (VERB_CONTRACTS) ──
// `verb` est la forme de détection, `labelAr` la forme affichée, `contractAr`
// le contrat يُطلب / يُمنع. Le verrou compare ce tableau au fichier du moteur.
export const CONTRATS_VERBES: ReadonlyArray<{
  verb: string;
  labelAr: string;
  contractAr: string;
}> = [
  { verb: 'فسر', labelAr: 'فسّر', contractAr: 'يُطلب: رابط سببي إجباري («لأنّ» / «بسبب» / «يعود ذلك إلى»)\nيُمنع: البقاء في الوصف' },
  { verb: 'علل', labelAr: 'علّل', contractAr: 'يُطلب: تعليل بمعرفة من الدرس («يعود ذلك إلى…»)\nيُمنع: الوصف المجرد' },
  { verb: 'برر', labelAr: 'برّر', contractAr: 'يُطلب: حجّة علمية من الدرس\nيُمنع: التأكيد دون سبب' },
  { verb: 'حلل', labelAr: 'حلّل', contractAr: 'يُطلب: وصف + مقارنة + تغيّرات بالأرقام\nيُمنع: التعليل («لأنّ») — التحليل لا يفسّر' },
  { verb: 'استخرج', labelAr: 'استخرج', contractAr: 'يُطلب: معطى من الوثيقة كما هو\nيُمنع: كل تفسير أو تعليل' },
  { verb: 'قارن', labelAr: 'قارن', contractAr: 'يُطلب: طرفان + عناصر مقارنة + فرق صريح\nيُمنع: وصف طرف واحد' },
  { verb: 'اقترح', labelAr: 'اقترح', contractAr: 'يُطلب: فرضية قابلة للدحض + اختبار ممكن\nيُمنع: تأكيد غير قابل للاختبار' },
  { verb: 'استنتج', labelAr: 'استنتج', contractAr: 'يُطلب: علاقة أو آلية في جملة واحدة\nيُمنع: إعادة وصف المعطيات' },
  { verb: 'صف', labelAr: 'صِف', contractAr: 'يُطلب: وصف مباشر لما تُظهره الوثيقة\nيُمنع: التفسير («لأنّ»)' },
  { verb: 'بين', labelAr: 'بيّن', contractAr: 'يُطلب: شرح الآلية بمراحلها وربط منطقي («مما يؤدي» / «وذلك لـ»)\nيُمنع: الاكتفاء بالوصف' },
];

/** Verdicts du moteur (`probeVerdictThenContent`), réutilisés tels quels. */
export const VERDICTS_ESSAI = {
  aveu: '👍 **الاعتراف بالجهل أول خطوات التعلّم الصادق.** إليك الشرح من الأساس — ثمّ أعِد المحاولة بكلماتك:',
  juste: '✅ **إجابتك في محلّها.** إليك الشرح — وابدأ منه حيث أصبت:',
  aRevoir: '📌 **إجابتك غير موفقة** — اقرأ الشرح بعناية خاصة لبدايته:',
  direct: '📖 طلبت الشرح مباشرة — إليك الجواب.',
} as const;

// ── Les 14 variantes relevées dans COMPARAISON_LEXIQUE_LIVRE_2026-11-05.md ──
// Ce sont des équivalences CONSTATÉES (alias → nom du livre / de l'app), pas
// des définitions. Quand le nom canonique a une fiche, on la sert ; sinon on
// renvoie le nom sans jamais fabriquer de contenu.
export const VARIANTES_LEXIQUE: ReadonlyArray<{ alias: string; canonique: string }> = [
  { alias: 'الحمض الريبي النووي المرسال', canonique: 'ARNm' },
  { alias: 'التخريب الفراغي', canonique: 'التخريب' },
  { alias: 'السرعة القصوى للتفاعل', canonique: 'Vmax' },
  { alias: 'مؤشرات HLA-I', canonique: 'HLA' },
  { alias: 'مؤشرات HLA-II', canonique: 'HLA-II' },
  { alias: 'مؤشرات السيادة المناعية', canonique: 'BCR / TCR' },
  { alias: 'الكمون التنبيهي بعد المشبكي', canonique: 'PPSE' },
  { alias: 'الكمون التثبيطي بعد المشبكي', canonique: 'PPSI' },
  { alias: 'الدمج العصبي', canonique: 'الإدماج' },
  { alias: 'إنزيم روبيسكو', canonique: 'RuBisCO' },
  { alias: 'السلاسل الجبلية حديثة التكون', canonique: 'السلاسل الجبلية' },
  { alias: 'التحول التكتوني', canonique: 'التحول' },
  { alias: 'التكامل التحفيزي', canonique: 'التكامل الحفزي' },
  { alias: 'فيروس نقص المناعة البشرية', canonique: 'VIH / السيدا' },
];

/** U8 : présente au programme, absente du lexique joint — exclusion DOCUMENTÉE. */
const U8 = PROGRESSION_OFFICIELLE.find((u) => u.uniteId === 8);
export const U8_GLOSSAIRE = {
  uniteId: 8,
  titreAr: U8?.titre ?? 'تحويل الطاقة على المستوى ما فوق البنية الخلوية',
  heures: U8?.heures ?? 2,
  semaines: U8?.semaines ?? 0.5,
  statut: 'exclusion-documentee' as const,
  raisonAr: 'وحدة رسمية (2 ساعات، نصف أسبوع) محصورة في المخطط التحصيلي الخلوي : aucun terme propre du lexique joint, donc aucune fiche inventée.',
};

export type StatutReponse = 'definition' | 'verbe' | 'alias' | 'non-exigible' | 'inconnu';

export interface ReponseGlossaire {
  statut: StatutReponse;
  termeAr: string;
  /** Définition courte فصحى — TOUJOURS `acceptedAnswers[0]`, jamais écrite ici. */
  definitionAr?: string;
  /** Contrat يُطلب / يُمنع — TOUJOURS `CONTRATS_VERBES`. */
  contratAr?: string;
  etiquetteAr?: string;
  /** Renvoi vers la leçon (R12) : unité + leçon réelles. */
  renvoiAr?: string;
  /** La sonde posée AVANT le contenu (H3) ; vide quand il n'y a rien à essayer. */
  sondeAr: string;
  /** Le contenu affiché APRÈS la tentative. */
  contenuAr: string;
  /** Une seule tentative suffit pour un mot (R15). */
  donneLieuASonde: boolean;
}

interface Fiche {
  termeAr: string;
  definitionAr: string;
  uniteId: number;
  lessonId: number;
}

/** Les 121 termes sont extraits des énoncés « أكمل: X يرتبط هنا بـ: ». */
const REGEX_TERME = /أكمل:\s*(.+?)\s*يرتبط هنا بـ/;

export const FICHES_GLOSSAIRE: ReadonlyArray<Fiche> = FILL_BLANK_QUESTIONS.map((q) => ({
  termeAr: (q.microTest.prompt.match(REGEX_TERME)?.[1] ?? '').trim(),
  definitionAr: q.microTest.acceptedAnswers[0] ?? '',
  uniteId: q.unitId,
  lessonId: q.lessonId,
})).filter((f) => f.termeAr.length > 0 && f.definitionAr.length > 0);

const INDEX = new Map<string, Fiche>();
for (const f of FICHES_GLOSSAIRE) {
  const cle = normalizeArabic(f.termeAr);
  if (!INDEX.has(cle)) INDEX.set(cle, f);
}

const ETIQUETTE_NON_EXIGIBLE = 'غير ممتحن فيه';
const ECHEC_AR = 'لم أجد هذا اللفظ في المعجم المعتمد. جرّب كلمة أخرى، أو افتح الدرس.';

function ficheEnReponse(f: Fiche, aliasUtilise?: string): ReponseGlossaire {
  return {
    statut: 'definition',
    termeAr: f.termeAr,
    definitionAr: f.definitionAr,
    etiquetteAr: aliasUtilise ? `وصلتَ إليه من « ${aliasUtilise} »` : undefined,
    renvoiAr: `الوحدة ${f.uniteId} · الدرس ${f.lessonId}`,
    sondeAr: `قبل أن أشرح، حاول أن تعرّف « ${f.termeAr} » بكلماتك.`,
    contenuAr: f.definitionAr,
    donneLieuASonde: true,
  };
}

/**
 * Point d'entrée unique. L'ordre est celui de la spec : verbe → non-exigible →
 * variante → fiche → échec explicite. Aucun chemin ne fabrique de définition.
 */
export function chercherMot(saisieBrute: string): ReponseGlossaire {
  const cle = normalizeArabic(saisieBrute);
  if (!cle) {
    return { statut: 'inconnu', termeAr: '', sondeAr: '', contenuAr: ECHEC_AR, donneLieuASonde: false };
  }

  // 1. Verbe de consigne → contrat (jamais une définition).
  const contrat = CONTRATS_VERBES.find(
    (c) => normalizeArabic(c.verb) === cle || normalizeArabic(c.labelAr) === cle,
  );
  if (contrat) {
    return {
      statut: 'verbe',
      termeAr: contrat.labelAr,
      contratAr: contrat.contractAr,
      sondeAr: `قبل أن أشرح، ما الذي يُطلب منك في تعليمة « ${contrat.labelAr} »؟`,
      contenuAr: contrat.contractAr,
      donneLieuASonde: true,
    };
  }

  // 2. Contenu du manuel écarté par le ministère → ÉTIQUETTE, pas un cours.
  const exclus = NON_EXIGIBLES.find((n) => cle.includes(normalizeArabic(n.terme)));
  if (exclus) {
    return {
      statut: 'non-exigible',
      termeAr: exclus.terme,
      etiquetteAr: ETIQUETTE_NON_EXIGIBLE,
      sondeAr: '',
      contenuAr: `« ${exclus.terme} » ورد في الكتاب المدرسي، لكنه خارج المنهاج المعتمد (${ETIQUETTE_NON_EXIGIBLE}). لا أشرحه هنا ; راجع درسك.`,
      donneLieuASonde: false,
    };
  }

  // 3. Variante de nom → nom canonique, et sa fiche SI elle existe.
  const variante = VARIANTES_LEXIQUE.find((v) => normalizeArabic(v.alias) === cle);
  if (variante) {
    const fiche = INDEX.get(normalizeArabic(variante.canonique));
    if (fiche) return ficheEnReponse(fiche, variante.alias);
    return {
      statut: 'alias',
      termeAr: variante.canonique,
      sondeAr: '',
      contenuAr: `الاسم المعتمد في الكتاب : « ${variante.canonique} ». لا تعريف قصير لهذا اللفظ في المعجم — افتح الدرس.`,
      donneLieuASonde: false,
    };
  }

  // 4. Fiche directe.
  const fiche = INDEX.get(cle);
  if (fiche) return ficheEnReponse(fiche);

  // 5. Échec explicite : jamais de définition fabriquée (R4, R11).
  return {
    statut: 'inconnu',
    termeAr: saisieBrute.trim(),
    sondeAr: '',
    contenuAr: ECHEC_AR,
    donneLieuASonde: false,
  };
}

/**
 * Verdict d'UNE ligne sur la tentative (R16). `لا أعرف` ouvre le contenu par
 * la base, sans accuser l'élève. Une tentative trop courte n'est pas jugée.
 */
export function verdictEssai(reponse: ReponseGlossaire, essaiBrute: string): string {
  const essai = normalizeArabic(essaiBrute);
  if (!essai || essai.length < 3) return VERDICTS_ESSAI.direct;
  if (/لا اعرف|لا ادرى|ما ادري|ما اعرف/.test(essai)) return VERDICTS_ESSAI.aveu;

  const motsCles = normalizeArabic(reponse.contenuAr)
    .split(/\s+/)
    .filter((m) => m.length >= 4);
  const touche = motsCles.some((m) => essai.includes(m));
  return touche ? VERDICTS_ESSAI.juste : VERDICTS_ESSAI.aRevoir;
}
