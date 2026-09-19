// sanctionsCorrecteur.ts — Sanctions pédagogiques dérivées du DICTIONNAIRE FINAL.
//
// Sources build : faux_amis (confusions sanctionnables + double-sens) et conflits
// (atp_bilan_respiration). Décision correcteur (2026-09-14) : pour le bilan
// respiratoire, la valeur retenue est UNIQUEMENT 38 ATP/glucose — une réponse qui
// pose 30/32/30-32/36/37 est taguée CONFLIT_REF avec rappel du barème officiel DZ
// (livre 8, حصيلة التنفس L9843). Le décompte ATP n'a jamais été demandé aux BAC
// 2023-2025 (contexte_bac du build) — le tag est donc préventif.
// Les double-sens (Km, matrice, noyau) restent des alertes « vigilance » : jamais
// pénalisants (règle moteur du build : flag AMBIGUITE_LEXICALE).
// Détection sur le texte normalisé (normalizeAr) : hamzas unifiées, casse latine libre.

import { normalizeAr } from '../../lib/validation/normalizeAr';

export type SanctionGravite = 'forte' | 'vigilance';

export interface Sanction {
  type: 'FAUX_AMI' | 'CONFLIT_REF' | 'VIGILANCE';
  id: string;
  gravite: SanctionGravite;
  titreAr: string;
  /** Ce qui a déclenché la sanction dans la réponse. */
  constatAr: string;
  /** La règle à appliquer / la correction attendue. */
  correctionAr: string;
}

// ── Déclencheurs (sur texte normalisé + minuscule) ───────────────────────────

// Faux ami « courbe_michaelis_forme » : aucune entité Michaelis dans le build —
// graphies couvertes : مايكاليس / مايكليس / مايكل / ميكاليس / Michaelis / Menten.
const RE_MICHAELIS = /مايك|ميكال|michaelis|menten|مينتن|منتن/;
// « جرسية الشكل » → normalisé « جرسيه الشكل » ; « en cloche » latin.
const RE_CLOCHE = /جرسي|الجرس|cloche/;

// Faux ami « hemoglobine_vs_globule » : HbA (molécule) vs GR (cellule).
const RE_HEMOGLOBINE = /هيموغلوب|هيمغلوب|hba|(^| )hb( |$)/;
const RE_SPHERIQUE = /كروي|مستدير|كوره/;
// AUDIT 2026-09-16 : contexte « cellule » — la phrase décrit le GLOBULE
// (ex. « الكريه الحمراء خلية … تحتوي الهيموغلوبين ») : co-occurrence légitime,
// on dégrade la sanction en vigilance. « forte » réservée aux réponses qui
// attribuent la forme cellulaire au MOLÉCULE sans contexte cellulaire clair.
const RE_CONTEXTE_CELLULE = /خلية|خلوه|كريه|كريات|الدم|خلايا/;

// Conflit « atp_bilan_respiration » — valeurs modernes NON acceptées (décision).
// AUDIT 2026-09-16 : PRÉ-CONDITION de contexte énergétique. Le seul nombre
// 30/32/36/37 isolé (température 37°, numéro de document, année…) ne déclenche
// PLUS la sanction — il faut en plus ATP / حصيلة / غلوكوز dans la réponse.
const RE_ATP_MAUVAISE = /(^| )(30|32|36|37)( |$)|30 [-–—]?32/;
const RE_CONTEXTE_ATP = /atp|حصيله|حصيلة|غلوكوز|جلوكوز/;

// Vigilance « km_kilometre_vs_michaelis » : Km + contexte enzymatique.
const RE_KM = /(^| )km( |$)/;
const RE_ENZYME = /انزيم|تاكسد|مايك|michaelis|affinite/;

// Vigilance « matrice_double_sens » : المصفوفة (D2U2) ET القالبية/المستنسخة (D1U1).
const RE_MATRICE = /مصفوف/;
const RE_BRIN = /قالبي|مستنسخ/;

// Vigilance « noyau_double_sens » : النواة (D1) ET اللب (D3).
const RE_NOYAU = /النواة|النواه|نواة الخليه/;
const RE_LB = /اللب|لب الارض/;

// ── Extension C6 (audit 2026-09-19, 6 → 26) — confusions classiques des 3
// domaines du programme bac SVT. Déclencheurs CONSERVATEURS (co-occurrence de
// 2-3 marqueurs) : une règle qui se déclenche sur une comparaison légitime
// est dégradée en « vigilance » (jamais pénalisante). Sources : corrigé
// officiel 2025, rapports de correction, dictionnaire final.

// Synapse (U5/S1-Ex3) : l'acétylcholinestérase n'est pas libérée — elle dégrade.
const RE_ESTERASE = /استراز/;
const RE_LIBERE = /(يتحرر|تتحرر|يفرز|تفرز)/;
// Génétique (U1) : l'affirmation « anticodon sur ARNm » (l'inversion, pas la
// co-occurrence — « يتعرف anticodon على رامزة ARNm » est correcte).
const RE_ANTICODON_ARNM = /((رامز[هة]? المضاده|anticodon)[^\n]{0,15}(على|علي|في)\s+(?!رامز)[^\n]{0,12}arnm|arnm[^\n]{0,25}(يحمل|تحمل|عليه)[^\n]{0,25}(رامز[هة]? المضاده|anticodon))/;
// Énergie : le ribosome fabrique la protéine, il ne produit pas d'ATP.
const RE_RIBOSOME = /ريبوزوم/;
const RE_ATP = /atp/;
const RE_PROD = /(ينتج|يصنع)/;
// Immunité (U4/S2-Ex3) : antibiotique ≠ anticorps.
const RE_ANTIBIO = /(مضاد حيوي|مضاد الحيويه)/;
const RE_CONTEXTE_IMMUN = /(مناع|لقاح|مستضد|اجسام مضاده)/;
// Immunité : moelle osseuse (B) ≠ moelle épinière (réflexes).
const RE_MOELLE_EPINIERE = /(النخاع الشوكي|نخاع الشوكي)/;
const RE_LYMPH_B = /(لمفاوي|خلية ب|الخلايا البائزه)/;
// SLA (SOD/EDA) ≠ SEP (démyélinisation).
const RE_SEP = /التصلب المتعدد/;
const RE_CONTEXTE_SLA = /(sod|eda|الادارافون|الاوكسيد الفائق)/;
// Le Hb est DANS les GR — pas libre dans le plasma.
const RE_HEMOGLOBINE2 = /الهيموغلوب/;
const RE_PLASMA = /في البلازمه/;
// Photosynthèse : « phase à l'obscurité » ≠ « la nuit ».
const RE_PHOTOSYNTHESE = /البناء الضوئي/;
const RE_SANS_LUMIERE = /(ليلا|في الظلام|في الظلمه|غياب الضوء|بدون ضوء)/;

/**
 * Analyse les sanctions pédagogiques d'une réponse.
 * forte = confusion sanctionnable / conflit de référence ; vigilance = simple
 * signal advisory (double-sens), jamais pénalisant.
 */
export function evaluerSanctions(reponse: string): Sanction[] {
  const brut = reponse || '';
  if (!brut.trim()) return [];
  const norm = normalizeAr(brut).toLowerCase();
  const out: Sanction[] = [];

  if (RE_MICHAELIS.test(norm) && RE_CLOCHE.test(norm)) {
    out.push({
      type: 'FAUX_AMI',
      id: 'courbe_michaelis_forme',
      gravite: 'forte',
      titreAr: 'منحنى مايكاليس-مينتن وصف بأنه «جرسي الشكل»',
      constatAr: 'وصف منحنى مايكاليس-مينتن بالشكل الجرسي خلط بين منحنيات التشبع ومنحنيات pH/الحرارة.',
      correctionAr: 'منحنى مايكاليس-مينتن = تشبع زائدي (هضبة عند Vmax). الشكل الجرسي يعود لمنحنيات pH/درجة الحرارة فقط — JAMAIS لمايكاليس.',
    });
  }

  if (RE_HEMOGLOBINE.test(norm) && RE_SPHERIQUE.test(norm)) {
    // AUDIT 2026-09-16 : « forte » uniquement si le MOLÉCULE semble qualifié de
    // cellule sans contexte cellulaire ; si la réponse parle bien de la cellule
    // (كريه/خلية/الدم), la co-occurrence est légitime → vigilance.
    const contexteCellule = RE_CONTEXTE_CELLULE.test(norm);
    out.push({
      type: 'FAUX_AMI',
      id: 'hemoglobine_vs_globule',
      gravite: contexteCellule ? 'vigilance' : 'forte',
      titreAr: 'خلط بين الجزيء (HbA) والخلية (الكريه الحمراء)',
      constatAr: 'وصف الهيموغلوبين بالشكل الكروي قد يعني اعتباره خلية — وهو بروتين.',
      correctionAr: 'الكريه الحمراء = خلية مقعرة الوجهين (ثنائية التقعر)؛ HbA = بروتين رباعي الوحدات (جزيء). تُقبل «المنجلية» للكريه المصاب بفقر الدم المنجلي.',
    });
  }

  if (RE_ATP_MAUVAISE.test(norm) && RE_CONTEXTE_ATP.test(norm)) {
    out.push({
      type: 'CONFLIT_REF',
      id: 'atp_bilan_respiration',
      gravite: 'forte',
      titreAr: 'حصيلة التنفس — قيمة ATP غير المقررة',
      constatAr: 'وردت في الإجابة قيمة حديثة (30-32 أو 36/37 ATP لكل غلوكوز) مع ذكر ATP.',
      correctionAr: 'القيمة المقررة رسميا: 38 ATP لكل غلوكوز (حصيلة التنفس — الكتاب المدرسي L9843). تُقبل 38 فقط في الحصيلة. ملاحظة: الحصيلة الكمية لم تُطلب في BAC 2023-2025.',
    });
  }

  if (RE_KM.test(norm) && RE_ENZYME.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'km_kilometre_vs_michaelis',
      gravite: 'vigilance',
      titreAr: '«Km» مزدوجة المعنى',
      constatAr: 'وردت Km في سياق إنزيمي: تأكد أنها ثابتة مايكاليس (قرابة تأثير الإنزيم بالوسط).',
      correctionAr: 'في الجيولوجيا (D3) Km = كيلومترات؛ في الإنزيميات Km = ثابتة مايكاليس (تأثير). لفظ واحد لمعنيين — وضّح السياق.',
    });
  }

  if (RE_MATRICE.test(norm) && RE_BRIN.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'matrice_double_sens',
      gravite: 'vigilance',
      titreAr: '«ماتريس» مزدوجة المعنى',
      constatAr: 'الإجابة تجمع المصفوفة (ميتوكوندريا) والسلسلة القالبية/المستنسخة (ADN).',
      correctionAr: 'المصفوفة = matrice mitochondriale (D2U2)؛ السلسلة القالبية/المستنسخة = brin matrice (D1U1). مصطلحان مختلفان رغم الترجمة الفرنسية المشتركة.',
    });
  }

  if (RE_NOYAU.test(norm) && RE_LB.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'noyau_double_sens',
      gravite: 'vigilance',
      titreAr: '«نواة/لب» مزدوجة المعنى',
      constatAr: 'الإجابة تجمع النواة الخلوية (D1) ولب الأرض (D3).',
      correctionAr: 'النواة = noyau cellulaire (D1U1)؛ اللب = noyau terrestre (D3). تأكد من السياق لتجنب اللبس بين المجالين.',
    });
  }

  // ── Extension C6 : confusions classiques (synapse, immunité, énergie, génétique) ──

  if (RE_ESTERASE.test(norm) && RE_LIBERE.test(norm)) {
    out.push({
      type: 'FAUX_AMI',
      id: 'acetylcholinesterase_liberee',
      gravite: 'forte',
      titreAr: 'الأستيل كولين استراز وُصفت بأنها «متحررة»',
      constatAr: 'الإجابة تذكر استراز مع تحرر/إفراز — والأستيل كولين استراز إنزيم تآزري مثبت في الشق المشبكي.',
      correctionAr: 'المتحرر من الحويصلات هو الأستيل كولين (الناقل). الاستراز إنزيم في الشق: مهمته تفكيك ACh بعد تأثيره (تيرمين الإشارة) — لا تتحرر ولا تفرز.',
    });
  }

  if (RE_ANTICODON_ARNM.test(norm)) {
    out.push({
      type: 'FAUX_AMI',
      id: 'anticodon_sur_arnm',
      gravite: 'forte',
      titreAr: 'الرامزة المضادة منسوبة إلى ARNm',
      constatAr: 'الإجابة تجمع «الرامزة المضادة» مع ARNm.',
      correctionAr: 'الرامزة المضادة (anticodon) على ARNt — هي التي تتعرف على رامزة ARNm بالتكامل. ARNm يحمل الرامزات (codons) لا الرامزة المضادة.',
    });
  }

  if (RE_RIBOSOME.test(norm) && RE_ATP.test(norm) && RE_PROD.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'ribosome_produit_atp',
      gravite: 'vigilance',
      titreAr: 'الريبوزوم «ينتج» ATP؟',
      constatAr: 'الإجابة تجمع الريبوزوم مع إنتاج/تصنيع ATP.',
      correctionAr: 'الريبوزوم يصنع البروتين (الترجمة). ATP ينتجه التحلل السكري (الهيولى) والتنفس الخلوي (الميتوكوندريا). تحقق من الفعل: يستهلك ATP نعم، ينتجه لا.',
    });
  }

  if (RE_ANTIBIO.test(norm) && RE_CONTEXTE_IMMUN.test(norm)) {
    out.push({
      type: 'FAUX_AMI',
      id: 'antibiotique_vs_anticorps',
      gravite: 'forte',
      titreAr: '«مضاد حيوي» في سياق مناعي',
      constatAr: 'الإجابة تذكر مضاداً حيوياً مع سياق مناعة/لقاح/أجسام مضادة.',
      correctionAr: 'في المناعة الاسم الصحيح هو «الجسم المضاد» (anticorps) — بروتين تصنعه الخلايا البلازمية. المضاد الحيوي (antibiotique) دواء ضد البكتيريا، لا علاقة له بالاستجابة المناعية.',
    });
  }

  if (RE_MOELLE_EPINIERE.test(norm) && RE_LYMPH_B.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'moelle_epiniere_vs_osseuse',
      gravite: 'vigilance',
      titreAr: 'النخاع الشوكي أم النخاع العظمي؟',
      constatAr: 'الإجابة تجمع النخاع الشوكي مع اللمفاويات B.',
      correctionAr: 'نضج اللمفاويات B في النخاع العظمي (moelle osseuse). النخاع الشوكي (moelle épinière) مركز المنعكسات — عضو من الجهاز العصبي.',
    });
  }

  if (RE_SEP.test(norm) && RE_CONTEXTE_SLA.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'sep_vs_sla',
      gravite: 'vigilance',
      titreAr: 'التصلب المتعدد أم الجانبي الضموري؟',
      constatAr: 'الإجابة تجمع «التصلب المتعدد» مع SOD/الإيدارافون/الأوكسيد الفائق.',
      correctionAr: 'التصلب الجانبي الضموري (SLA): طفرة SOD وتراكم ROS — دواؤه EDA. التصلب المتعدد (SEP): تلف غمد الميالين بآلية مناعية — مسار مختلف تماماً.',
    });
  }

  if (RE_HEMOGLOBINE2.test(norm) && RE_PLASMA.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'hb_libre_plasma',
      gravite: 'vigilance',
      titreAr: 'الهيموغلوبين «في البلازما»؟',
      constatAr: 'الإجابة تضع الهيموغلوبين في البلازما.',
      correctionAr: 'الهيموغلوبين محتشى داخل الكريات الحمراء (75 % من محتواها البروتيني). ما يُقاس في البلازما بعد الانحلال هو الهيموغلوبين المتحرر + البيليروبين (شواهد التحلل في نقل الدم).',
    });
  }

  if (RE_PHOTOSYNTHESE.test(norm) && RE_SANS_LUMIERE.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'phase_obscure_nuit',
      gravite: 'vigilance',
      titreAr: '«مرحلة الظلام» ليست ليلاً',
      constatAr: 'الإجابة تجمع البناء الضوئي مع الليل/الظلام.',
      correctionAr: '«المرحلة الظلمانية» (تثبيت CO2 على RuBP) تعني مستقلة عن الضوء مباشرة — تحدث نهاراً أيضاً. الليل يوقف المرحلة الكيميائية الضوئية فقط، ومنه يتوقف التثبيت لاحقاً.',
    });
  }

  if (/(كلوروبلاست|البلاستيدات الخضراء)/.test(norm) && /(تنفس خلوي|سلسله تنفسيه|حلقه كربس)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'chloroplaste_respiration',
      gravite: 'vigilance',
      titreAr: 'التنفس الخلوي والبلاستيدات الخضراء في الإجابة نفسها',
      constatAr: 'الإجابة تجمع البلاستيدات الخضراء مع التنفس الخلوي/حلقة كربس/السلسلة التنفسية.',
      correctionAr: 'التنفس الخلوي: هيولى (تحلل سكري) ثم ميتوكوندريا (كربس + سلسلة). البلاستيدات الخضراء: البناء الضوئي. إن كانت المقارنة مقصودة فرتبها؛ وإلا فراجع العضية.',
    });
  }

  if (/(التحلل السكري|التحلل الانسدادي)/.test(norm) && /الميتوكوندري/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'glycolyse_mitochondrie',
      gravite: 'vigilance',
      titreAr: 'التحلل السكري والميتوكوندريا',
      constatAr: 'الإجابة تجمع التحلل السكري مع الميتوكوندريا.',
      correctionAr: 'التحلل السكري في الهيولى (مقر التحويل الجزئي). الميتوكوندريا: أكسدة حمض البيروفيك + حلقة كربس + السلسلة التنفسية. 2-DG يعطل إنزيم الخطوة الأولى في الهيولى (بكالوريا 2025 — الموضوع الثاني).',
    });
  }

  if (/(ltc|السامه|ت السامه)/.test(norm) && /(الانترلوكين|interleukin|lt4)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'ltc_vs_lth',
      gravite: 'vigilance',
      titreAr: 'LTC و LT4/الإنترلوكينات في الإجابة نفسها',
      constatAr: 'الإجابة تجمع اللمفاويات السامة (LTC) مع الإنترلوكينات/LT4.',
      correctionAr: 'LTC: البرفورين + الغرانزيمات (قتل خلطي). LT4 (LTh): الإنترلوكينات (تكاثر وتمايز). انسب كل وساطة إلى خلية الصنع.',
    });
  }

  if (/المستضد/.test(norm) && /(في المصل|مصل الدم)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'antigene_dans_serum',
      gravite: 'vigilance',
      titreAr: 'المستضد «في المصل»؟',
      constatAr: 'الإجابة تجمع المستضد مع المصل.',
      correctionAr: 'المستضد (A/B/H) مثبت على سطح أغشية خلايا الدم الحمراء. المصل يحوي الأجسام المضادة (anti-A/anti-B) — نقل الدم 2025: الاتجاه المعاكس هو ما يسبب المعقدات المناعية.',
    });
  }

  if (/(البرفورين|الغرانزيمات)/.test(norm) && /(اجسام مضاده|خلية ب|الخلايا البائزه|بلازموسيت)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'perforine_vs_plasmocyte',
      gravite: 'vigilance',
      titreAr: 'البرفورين مع البلازموسيت/الأجسام المضادة',
      constatAr: 'الإجابة تجمع البرفورين/الغرانزيمات مع الأجسام المضادة أو الخلايا البائية.',
      correctionAr: 'سلاح LTC = البرفورين (ثقوب) + الغرانزيمات (استموات). الخلية البائية تتمايز إلى بلازموسيت يفرز أجساماً مضادة (وساطة خلطية). وساطتان مختلفتان — لا تُنسبا لنفس الخلية.',
    });
  }

  if (/atp/.test(norm) && /(ادن|adn)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'atp_vs_adn_typo',
      gravite: 'vigilance',
      titreAr: 'ADN أم ATP؟',
      constatAr: 'وردت ATP وADN معاً في إجابة قصيرة — احتمال خلط صرفي (T/D).',
      correctionAr: 'ADN = الدنا (داعمة الوراثة). ATP = أدينوزين ثلاثي الفوسفات (عملة الطاقة). الحرف الواحد يغير المعنى كلياً — تحقق من كل رمز.',
    });
  }

  if (/(تثبت الفرضيه|برهنت الفرضيه|برهان الفرضيه)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'hypothese_prouvee',
      gravite: 'vigilance',
      titreAr: 'الفرضية لا «تثبت»',
      constatAr: 'الإجابة تستعمل «تثبيت/برهنة الفرضية».',
      correctionAr: 'لغة التحليل الرسمية: التجربة «تؤكد/تدعم صحة الفرضية» أو «تنفيها». التصحيح الرسمي 2025 يستعمل يؤكد صحة الفرضية — الإثبات القطعي خارج المنهج.',
    });
  }

  if (/(تخمر|تخمل)/.test(norm) && /(38|حصيله)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'fermentation_bilan_38',
      gravite: 'vigilance',
      titreAr: 'حصيلة ATP مع التخمر',
      constatAr: 'الإجابة تجمع التخمر مع حصيلة/38 ATP.',
      correctionAr: 'التخمر (لا هوائي): تحلل سكري فقط = 2 ATP لكل غلوكوز، وإعادة تأكسد NADH بالحمض/الكحول. حصيلة 38 ATP للتنفس الخلوي التام (المقر رسمياً).',
    });
  }

  if (/المناعه الخلطيه/.test(norm) && /(ltc|السامه|ت السامه)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'humorale_vs_cellulaire',
      gravite: 'vigilance',
      titreAr: 'المناعة الخلطية مع اللمفاويات السامة',
      constatAr: 'الإجابة تجمع المناعة الخلطية مع LTC.',
      correctionAr: 'الخلطية = أجسام مضادة حرة تفرزها الخلايا البلازمية (انشطة B). الخلوية = LTC مهاجمة مباشرة (البرفورين/الغرانزيم). تصنيف الوساطة يحدد اسم المناعة.',
    });
  }

  if (/(2 dg|2-dg|ديوكسي جلوكوز)/.test(norm) && /(يزيد|تزيد|زياده|زيادة)/.test(norm) && /atp/.test(norm)) {
    out.push({
      type: 'FAUX_AMI',
      id: 'dg2_augmente_atp',
      gravite: 'forte',
      titreAr: '2-DG «تزيد» ATP',
      constatAr: 'الإجابة تجمع 2-DG مع زيادة إنتاج ATP.',
      correctionAr: 'العكس هو الصحيح (بكالوريا 2025): 2-DG تعطل إنزيم الخطوة الأولى فيتوقف تشكل ATP وتتوقف تغذية الخلايا السرطانية — لهذا تعتبر ضداً للسرطان.',
    });
  }

  if (/rubisco/.test(norm) && /(كاربونيه|anhydrase)/.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'rubisco_vs_ca',
      gravite: 'vigilance',
      titreAr: 'Rubisco وأنزيم الكربونيك أنhydrase',
      constatAr: 'الإجابة تجمع Rubisco مع الكاربونيك أنhydrase.',
      correctionAr: 'Rubisco: تثبيت CO2 على RuBP (APG). CA: تفكيك HCO3⁻ إلى CO2 (في البيرنويدة). وصف البيرنويدة يذكرهما معاً — لكن دوريهما مختلفان تماماً.',
    });
  }

  return out;
}