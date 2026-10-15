// errorTaxonomy.ts — LA TAXONOMIE DES ERREURS, isolée pour ne pas peser.
//
// POURQUOI CE FICHIER EXISTE (14/10/2026). `ERROR_TAXONOMY` vivait dans
// `methodologyEngine.ts` (105 Ko de contenu méthodologique). Or deux modules du
// CHEMIN CRITIQUE en ont besoin — `utils/profilErreurs.ts` (pour valider un code
// d'erreur) et, par ricochet, la bulle du capitaine. Résultat mesuré : l'entrée
// du bundle passait de 166 Ko à 270 Ko, soit +59 % sur la cible de 170 Ko, pour
// lire une trentaine de libellés.
//
// C'est exactement le défaut que `brandAssets.ts` documente pour `LOGO_URL` :
// une petite constante qui entraîne tout un corpus. Même remède : la donnée est
// DÉPLACÉE ici (elle n'est pas recopiée) et `methodologyEngine.ts` la ré-exporte,
// donc les consommateurs existants ne changent pas.

export type StepId = 1 | 2 | 3 | 4;

export type ErrorStep = StepId | 'switch';
export interface ErrorTaxonomyItem {
  code: string; nameAr: string; nameFr: string; descriptionAr: string;
  example: string; counterActionAr: string; step: ErrorStep;
}
export const ERROR_TAXONOMY: Record<string, ErrorTaxonomyItem> = {
  // ── FAMILLE « NOTIONS » ──────────────────────────────────────────────────
  // POURQUOI CE CODE EXISTE (14/10/2026, point A de l'analyse LITE).
  // `utils/profilErreurs.ts` documentait une famille « confusions de notions »
  // (ADN/ARNm, codon/anticodon) qu'AUCUN code ne pouvait stocker : la garde de
  // `enregistrerErreurs` n'accepte que les clés de cette taxonomie, et aucune ne
  // décrit une confusion de notions. La famille était donc un commentaire, pas
  // une donnée.
  //
  // Cette entrée ne prétend RIEN sur l'élève : elle est enregistrée uniquement
  // quand l'élève DÉCLARE lui-même « je ne connaissais pas la notion » à la fin
  // d'un QCM (voir `data/diagnosticQuiz.ts`). Le libellé vient de lui, jamais
  // d'une déduction de l'application — c'est la seule source honnête possible,
  // puisqu'aucune question du corpus ne porte d'étiquette de notion.
  //
  // `step: 2` (دليل) : la ceinture qui attrape cette erreur est « هل ذكرت
  // الوثيقة والقيمة والوحدة؟ » — c'est-à-dire nommer correctement l'objet
  // biologique en jeu, ce qui est exactement ce qu'une confusion empêche.
  notion_confusion: { code:'notion_confusion', nameAr:'الخلط بين مفهومين أو مصطلحين', nameFr:'Confusion entre deux notions', descriptionAr:'استعمال مصطلح علمي مكان آخر (ADN مكان ARNm، codon مكان anticodon، ملاحظة مكان تفسير) خلال الإجابة.', example:'قول «ينقل الـ ARNm المعلومة الوراثية» بينما الناقل هو الـ ARNm والمخزّن هو الـ ADN.', counterActionAr:'اكتب جدولًا من عمودين: المصطلح، ثم ما يميّزه وحده. ثم أعد صياغة الجملة بالمصطلح الصحيح.', step:2 },
  missing_unit: { code:'missing_unit', nameAr:'غياب الوحدة القياسية', nameFr:'Unité absente', descriptionAr:'ذكر أرقام مجردة دون إرفاقها بوحدتها القياسية الفيزيائية أو الحيوية.', example:'كتابة "تصل القيمة إلى 1.8" بدلاً من "1.8 غ/ل".', counterActionAr:'أعد كتابة كل قيمة عددية متبوعة بوحدتها (غ/ل، %، دقيقة، وحدة اعتبارية).', step:2 },
  missing_reference: { code:'missing_reference', nameAr:'غياب ذكر السند (الوثيقة / المنحنى / الجدول)', nameFr:'Support non nommé', descriptionAr:'الانطلاق في الوصف دون تسمية الوثيقة أو نوعها أو المجال المدروس.', example:'قول "تتزايد الأجسام المضادة" دون ذكر "انطلاقاً من الوثيقة 1".', counterActionAr:'ابدأ دائماً بـ "انطلاقاً من الوثيقة (س)" أو "تمثل الوثيقة... حيث نلاحظ".', step:2 },
  premature_interpretation: { code:'premature_interpretation', nameAr:'تفسير مبكر أثناء التحليل', nameFr:'Interprétation prématurée', descriptionAr:'استعمال الروابط السببية (لأن، راجع إلى، بسبب) داخل مهمة التحليل الوصفي.', example:'قول "تتناقص النسبة لأن الإنزيم تخرب" في سؤال "حلل المنحنى".', counterActionAr:'احذف أي تفسير واكتفِ بوصف ما تراه العين بدقة، واختم بالاستنتاج فقط.', step:'switch' },
  conditional_hypothesis: { code:'conditional_hypothesis', nameAr:'صياغة الفرضية بصيغة الشك', nameFr:'Hypothèse non assertive', descriptionAr:'استخدام كلمات التردد أو التعطيل في الفرضية التفسيرية (ربما، لعل).', example:'قول "ربما يؤثر الدواء على الريبوزوم".', counterActionAr:'صغ الفرضية بجملة إخبارية جازمة قابلة للاختبار التجريبي.', step:3 },
  missing_conclusion: { code:'missing_conclusion', nameAr:'غياب الجملة الختامية', nameFr:'Absence de phrase-bilan', descriptionAr:'التوقف عند تفكيك المعطيات دون تقديم خلاصة تجيب صراحة عن المشكل.', example:'إنهاء التحليل عند آخر نقطة في المنحنى دون سطر استنتاجي.', counterActionAr:'اختم دائماً بـ "الاستنتاج: [إعادة صياغة الهدف من الوثيقة كحقيقة علمية]".', step:4 },
  verb_confusion: { code:'verb_confusion', nameAr:'الخلط بين أفعال الأداء', nameFr:'Confusion entre verbes', descriptionAr:'تقديم تفسير لسؤال تحليل، أو الاكتفاء بالوصف في سؤال تفسير.', example:'تقديم آلية بيولوجية لسؤال "حلل"، أو وصف سطحي لسؤال "فسر".', counterActionAr:'افحص الفعل في بداية التعليمة جيداً والتزم بهيكل الفيشة المخصص له.', step:1 },
  comparison_without_criteria: { code:'comparison_without_criteria', nameAr:'مقارنة عشوائية دون معايير', nameFr:'Comparaison sans critères', descriptionAr:'سرد حالة الشاهد ثم سرد حالة التجربة في فقرتين منفصلتين.', example:'وصف الفأر 1 في 5 أسطر ثم وصف الفأر 2 في 5 أسطر دون تقاطع.', counterActionAr:'قارن وجهاً لوجه حسب المعيار مستعملاً "بينما / في حين".', step:2 },
  unbalanced_comparison: { code:'unbalanced_comparison', nameAr:'مقارنة غير متوازنة', nameFr:'Comparaison non équilibrée', descriptionAr:'معالجة معيار لعنصر وإهمال العنصر المقابل لنفس المعيار.', example:'ذكر سرعة التفاعل عند 37° دون مقارنتها بسرعة التفاعل عند 0°.', counterActionAr:'تأكد من معالجة كلا العنصرين في كل معيار مقارنة.', step:3 },
  unsupported_claim: { code:'unsupported_claim', nameAr:'ربط بلا سند (تأكيد دون «لأنّ»)', nameFr:'Affirmation sans lien causal', descriptionAr:'في سؤال تفسيري: إطلاق تأكيد دون ربطه بسببه أو بآليته أو بالفرضية المقابلة.', example:'قول "الفرضية الأولى صحيحة" دون "لأنّ الوثيقة تُظهر أنّ…".', counterActionAr:'أضف الرابط: «وهذا لأنّ … وبالتالي …» — أو احذف التأكيد الذي لا سند له.', step:3 }
};
