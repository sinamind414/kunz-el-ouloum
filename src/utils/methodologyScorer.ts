import {
  getVerbCardV2, ERROR_TAXONOMY,
  Switch, StepId, Step3Mode,
} from '../data/methodologyEngine';

export interface StepLine {
  step: StepId;
  applicable: boolean;
  passed: boolean;
  errorTags: string[];
  remedyAr?: string;
}

export interface SwitchLine {
  truth: Switch;
  choice: Switch | null;
  choiceCorrect: boolean | null;
  violated: boolean;
  remedyAr?: string;
}

export interface ScoreReport {
  icm: number;
  criteriaResults: {
    criterionId: string; label: string; passed: boolean;
    feedback: string; probe: string; errorTag?: string;
  }[];
  detectedErrors: {
    tag: string; nameAr: string; descriptionAr: string;
    counterActionAr: string; step: StepId | 'switch'; sampleText?: string;
  }[];
  switchLine: SwitchLine;
  stepReport: StepLine[];
  nextPedagogicalStage: 1 | 2 | 3 | 4;
  pedagogicalDecisionAr: string;
}

export interface SwitchContext {
  switchChoice: Switch | null;
}

// Audit Fable-5 (2026-09-25) : « car » borné par \b — sinon « carbone »,
// « caractéristique », « carreau » déclenchaient premature_interpretation.
const CLOSED_FORBIDDEN_RE = /(لأنّ?|راجع إلى|بسبب|يفسر ذلك|نعلل|يدل على أن|\bcar\b|parce que|s'explique)/i;
const STEP3_EVIDENCE: Record<Step3Mode, RegExp | null> = {
  explain:    /(لأنّ?|يعود ذلك|يرجع|بسبب|مما يؤدي|وبالتالي|يفسر ذلك|نتيجة ل)/i,
  confront:   /(بينما|في المقابل|في حين|مقابل|يقابله|كلاهما|أوجه التشابه|أوجه الاختلاف|alors que|tandis que)/i,
  hypothesis: /(نفترض|الفرضية|نقترح)/i,
  dual:       /(من الوثيقة|انطلاقا من الوثيقة|الوثيقة.*ومن الدرس|وثيقة.*درس|من الدرس)/i,
  none:       null,
};
const DOUBT_RE      = /(ربما|قد يكون|لعل|احتمال|يمكن أن يكون|peut-être)/i;
const CONCLUSION_RE = /(الاستنتاج|نستنتج|الخلاصة|نخلص|يؤكد صحة|خاتمة|ومنه|conclusion)/i;
const TITLE_RE      = /(العنوان|عنوان\s*:)/i;
const REFERENCE_RE  = /(الوثيق|الوثائق|منحنى|جدول|الملاحظة|الشاهد|الشكل|الرسم|التجربة|document|graphe)/i;
// Audit Fable-5 (2026-09-25) : hyp_c1 — un mot biologique générique seul
// (« بروتين », « هرمون ») ne suffit plus pour valider l'ancrage. On exige
// maintenant 2 marqueurs biologiques DISTINCTS (un « système concret » =
// au moins deux composants en interaction : ligand+récepteur, enzyme+site,
// cellule+organe…) ou un ancrage expérimental explicite (support/donnée).
// La liste couvre les 3 domaines du programme (cellule, énergie, géologie
// n'étant pas un ancrage hyp) + système nerveux/immunitaire.
const ANCRAGE_BIO_RE = /(مستقبل|قنوات|قناة|عضل|جزيء|بروتين|مورث|إنزيم|هرمون|خلية|خلايا|عضية|ميتوكوندريا|ريبوزوم|الشبكة|غولجي|النواة|غشاء|وسط|ظروف|تفاعل|جسم|عضو|الدم|سائل|نبات|فأر|إنسان|كائن|عصب|مشبك|إفراز|غدة|ناقل|أدينوزين|كولين|سم|فيروس|بكتيريا|مناعة|لقاح|مستضد|جين|صبغي|حمض|أمين|سكر|غلوكوز|أكسجين)/gi;
const DOC_NUMBER_RE = /(?:الوثيقة|الوثيقتين|الوثيقتان|الوثائق|المنحنى|المنحنيين|الجدول|الجدولين|الشكل|الشكلين|الرسم|النموذج|التجربة|الملاحظة|الصورة|الفرضية)[\u0600-\u06FF]*\s*\d+(?:\s*(?:و|،|,)\s*\d+)*/g;

const NUMBER_RE = /(?<![A-Za-z=+\-\/\d.,])\d+(?:[.,]\d+)?(?![A-Za-z+\-\d])/g;
// C7 : « détailler la mécanisme » = marqueur sémantique, plus un seuil de caractères
// (la concision que Meftah enseigne n'est plus punie ; le verbiage ne paie plus).
const MECHANISM_RE = /(بفضل|بسبب|لأنّ?|يعود|عن طريق|ومنه|يؤدي إلى|ينتج عن|ينشّط|ينشط|يثبّط|يرتبط|المستقبل|الأنزيم|الإنزيم|القناة|الناقل|بروتين|جزيئي|خلوي|الترميز|المتلقية)/;
const UNIT_AFTER_RE  = /(غ\/ل|g\/l|%|دقيقة|دقائق|دق\b|min|ساعة|ساعات|ثانية|ثواني|s\b|وحدة اعتبارية|ua|°|درجة|ميكرومول|مول|نل|مل|لتر|مم|سم|نانومتر|كيلومتر|خلايا|بلورات|وحدات|يوم|أيام|أسبوع|شهر|سنة)/i;
const UNIT_BEFORE_RE = /(?:^|\s)(?:د|دقيقة|الدقيقة|ph)\s*=?\s*/i;

function bareNumbers(text: string): string[] {
  const t = text.replace(DOC_NUMBER_RE, ' ');
  const out: string[] = [];
  for (const m of t.matchAll(NUMBER_RE)) {
    const i = m.index ?? 0;
    const after  = t.slice(i + m[0].length, i + m[0].length + 14);
    const before = t.slice(Math.max(0, i - 8), i);
    if (!UNIT_AFTER_RE.test(after) && !UNIT_BEFORE_RE.test(before)) out.push(m[0]);
  }
  return out;
}

export function evaluateStudentProduction(
  verbId: string,
  userText: string,
  _draftText?: { verb: string; steps: string; finalSentence: string },
  currentStage: 1 | 2 | 3 | 4 = 3,
  switchContext?: SwitchContext
): ScoreReport {
  const card = getVerbCardV2(verbId);
  // Audit 2026-09-19 (C7) : plus de fallback silencieux — un verbId inconnu
  // notait contre la carte [0] (analyse) sans avertissement (ex. « hypothesize »
  // issu de l'espace d'ids reflexes.ts → critères an_c* absurdes pour une
  // hypothèse). Toute erreur d'id doit crier, jamais noter au hasard.
  if (!card) throw new Error(`[methodologyScorer] verbId inconnu : « ${verbId} » — aucune note silencieuse (audit 2026-09-19 C7)`);
  const sw = card.switch;
  const writes = (s: StepId) => card.path.includes(s);
  const text = (userText || '').trim().toLowerCase();
  const detected = new Set<string>();

  const numbers = Array.from(text.replace(DOC_NUMBER_RE, ' ').matchAll(NUMBER_RE));
  const bare = bareNumbers(text);

  if (sw === 'closed' && CLOSED_FORBIDDEN_RE.test(text)) {
    detected.add('premature_interpretation');
  }
  if (sw === 'open') {
    const re = card.step3Evidence ?? STEP3_EVIDENCE[card.step3Mode];
    if (re && !re.test(text)) detected.add('unsupported_claim');
  }

  if (writes(2)) {
    if (bare.length > 0) detected.add('missing_unit');
    if (card.format !== 'diagram' && card.format !== 'compare' && !REFERENCE_RE.test(text)) {
      detected.add('missing_reference');
    }
    if (card.format === 'compare' && !STEP3_EVIDENCE.confront!.test(text)) {
      detected.add('comparison_without_criteria');
    }
  } else if (card.step3Mode === 'none' && numbers.length > 0 && verbId !== 'verb_list_v1' && verbId !== 'verb_define_v1') {
    // V3.1: حفظ list uses numbered 1. 2. 3. — not verb_confusion
    const isListNumbering = verbId === 'verb_list_v1' && /^\s*\d+[\.)]/.test(text);
    if (!isListNumbering) detected.add('verb_confusion');
  }

  if (card.step3Mode === 'hypothesis' && DOUBT_RE.test(text)) {
    detected.add('conditional_hypothesis');
  }

  if (writes(4) && verbId !== 'verb_define_v1' && verbId !== 'verb_list_v1') {
    const closingRe = card.format === 'diagram' ? TITLE_RE : CONCLUSION_RE;
    if (!closingRe.test(text)) detected.add('missing_conclusion');
  }
  // V3.1 حفظ: لا خاتمة منفصلة — التعريف/القائمة هي الجواب الكامل (spec §وضع الحفظ)
  if ((verbId === 'verb_define_v1' || verbId === 'verb_list_v1') && writes(4)) {
    // pas de missing_conclusion : la fin de la définition/liste vaut conclusion
    detected.delete('missing_conclusion');
  }

  const criteriaResults: ScoreReport['criteriaResults'] = [];
  let weightedPass = 0, weightedTotal = 0;

  for (const c of card.criteria) {
    let passed = false;
    let feedback = '';
    const compass = c.wording.compass;

    // C7 : contenu de l'exercice possédé par la carte (verifAr) — ET logique.
    if (c.verifAr?.length) {
      passed = c.verifAr.every((source) => new RegExp(source, 'i').test(text));
      feedback = passed ? `${c.wording.ar_label}: مستوفى.` : `تنبيه: « ${compass} » - ${c.wording.probe}`;
    } else switch (c.id) {
      case 'an_c1': case 'ex_c1': case 'val_c1':
        passed = REFERENCE_RE.test(text) && text.length > 25;
        feedback = passed ? 'تم تحديد الوثيقة والسياق بنجاح.' : `تنبيه: « ${compass} » - لم يتم ذكر السند بوضوح.`;
        break;
      case 'comp_c1':
        passed = (/(كلاهما|أوجه التشابه|الطرف|بين\s.+\s?و)/.test(text) || REFERENCE_RE.test(text)) && text.length > 25;
        feedback = passed ? 'تمت تسمية طرفي المقارنة.' : `تنبيه: « ${compass} » - سمِّ الطرفين قبل المقارنة.`;
        break;
      case 'an_c2':
        passed = bare.length === 0;
        feedback = passed ? 'تم تفكيك المعطيات وإرفاق القيم بالوحدات القياسية.' : `تنبيه: « ${compass} » - كل رقم متبوعاً بوحدته (غ/ل، %، دقيقة).`;
        break;
      case 'an_c3':
        passed = !detected.has('premature_interpretation');
        feedback = passed ? 'ممتاز: التحليل وصفي وخالٍ من التعليل المسبق.' : `خطأ منهجي: « ${compass} » - تم رصد كلمات تعليل داخل التحليل!`;
        break;
      case 'an_c4': case 'ex_c4': case 'comp_c4': case 'ded_c1': case 'val_c3': case 'sch_c3':
        // C7 : la conclusion est déjà un marqueur sémantique (missing_conclusion).
        // Le seuil « 50 caractères » punissait la conclusion concise.
        passed = !detected.has('missing_conclusion');
        feedback = passed ? 'تمت صياغة الجملة الختامية بنجاح.' : `تنبيه: « ${compass} » - غياب الجملة الختامية.`;
        break;
      case 'ex_c2': case 'hyp_c2':
        passed = MECHANISM_RE.test(text);
        feedback = passed ? 'تم استحضار الآلية البيولوجية.' : `تنبيه: « ${compass} » - فصِّل الآلية الجزيئية/الخلوية.`;
        break;
      case 'ex_c3': case 'val_c2': case 'exp_m_c3':
        passed = !detected.has('unsupported_claim');
        feedback = passed ? 'تم الربط بسند صريح.' : `تنبيه: « ${compass} » - أين رابطك («لأنّ» / «يتوافق مع» / «بالربط»)؟`;
        break;
      case 'comp_c2': case 'comp_c3':
        passed = !detected.has('comparison_without_criteria');
        feedback = passed ? 'تم الربط المقارن بأدوات التقابل.' : `تنبيه: « ${compass} » - استخدم «بينما / في حين».`;
        break;
      case 'hyp_c3':
        passed = !detected.has('conditional_hypothesis');
        feedback = passed ? 'صياغة إخبارية جازمة.' : `خطأ منهجي: « ${compass} » - تجنب صيغ الشك.`;
        break;
      case 'ded_c2': // D2 (MARQUE §11) : استنتج = فيلم — le critère clé est le lien causal
        passed = !detected.has('unsupported_claim');
        feedback = passed ? 'تم الربط السببي صراحة بالآلية.' : `تنبيه: « ${compass} » - أين آلية النتيجة («لأنّ» / «يعود ذلك إلى» / «عن طريق»)?`;
        break;
      case 'def_c1':
        // Audit Fable-5 (2026-09-25) : la liste des marqueurs d'appartenance et
        // des verbes de propriété était trop fermée — une définition canonique
        // en « عبارة عن » ou « يُعرَّف » échouait injustement.
        passed = text.length > 20 && text.length < 500 &&
          /(هو|هي|عبارة عن|يُعرَّف|يُعرَف|يعرَّف|يُسمَّى|يسمى)\s+.+\s+(يتميز|يسرّع|يحتوي|يمتلك|يقوم|يتكون|يشتمل|يؤمن|يحقق|يساهم|يمنح|يختص)/.test(text);
        feedback = passed ? 'تم ذكر الانتماء والخاصية.' : `تنبيه: « ${compass} » - اذكر الانتماء والخاصية.`;
        break;
      case 'def_c2':
        passed = /(بفضل|حيث|يمنح|دور|وظيفة|بروتين|حفّاز|موقع فعّال|تخصص)/i.test(text);
        feedback = passed ? 'دور ومصطلح علمي حاضران.' : `تنبيه: « ${compass} » - أضف الدور والمصطلح.`;
        break;
      case 'def_c3':
        passed = !REFERENCE_RE.test(text) && bare.length === 0;
        feedback = passed ? 'بلا وثيقة ولا أرقام — تعريف نقي.' : `تنبيه: « ${compass} » - لا تذكر وثيقة في التعريف.`;
        break;
      case 'list_c1': case 'list_c2': case 'list_c3': {
        const isList = /(^|\n)\s*\d+[\.)\-]\s*\S/.test(text) || /(^|\n)\s*[•\-\*]\s*\S/.test(text);
        const lineCount = text.split(/\n/).filter(l=>l.trim().length>0).length;
        const hasSentence = /\.\s+[A-Z\u0600-\u06FF]/.test(text) && text.length > 80 && !isList;
        if (c.id === 'list_c1') {
          passed = isList;
          feedback = passed ? 'قائمة مرقّمة حاضرة.' : `تنبيه: « ${compass} » - اكتب قائمة مرقّمة.`;
        } else if (c.id === 'list_c2') {
          // Audit Fable-5 (2026-09-25) : la fourchette 2-5 était codée en dur et
          // ignorait le nombre exigé par la question. Le compte vient de la carte
          // (expectedCount) ; tolerance +1 pour absorber un retour à la ligne.
          const minList = c.expectedCount ?? 2;
          const maxList = c.expectedCount != null ? c.expectedCount + 1 : 5;
          passed = isList && lineCount >= minList && lineCount <= maxList;
          feedback = passed ? 'عدد الأسطر مطابق.' : `تنبيه: « ${compass} » - احترم العدد المطلوب (${minList} عناصر).`;
        } else {
          passed = isList && !hasSentence;
          feedback = passed ? 'بلا فقرة نثرية.' : `تنبيه: « ${compass} » - تجنب الفقرة.`;
        }
        break;
      }
      case 'hyp_c1': { // المنطلق التجريبي — سند مذكور أو نظام بيولوجي ملموس (كانون المثال النموذجي)
        // Audit Fable-5 (2026-09-25) : un mot biologique générique seul (بروتين،
        // هرمون…) validait le critère sans aucun ancrage concret. On exige
        // maintenant 2 marqueurs biologiques distincts — un « système » concret
        // (composants en interaction) — ou un ancrage expérimental explicite.
        const ancres = new Set<string>();
        for (const m of text.matchAll(ANCRAGE_BIO_RE)) ancres.add(m[0].toLowerCase());
        passed =
          REFERENCE_RE.test(text) ||
          /(المعطى|الملاحظة|نتائج|النتيجة|التجربة|الوثيق)/i.test(text) ||
          ancres.size >= 2;
        feedback = passed ? 'المنطلق التجريبي مذكور.' : `تنبيه: « ${compass} » - انطلق من المعطى التجريبي الذي يطرح المشكل.`;
        break;
      }
      case 'exp_m_c1': // الوثيقة الأولى + نتيجتها
        passed = REFERENCE_RE.test(text) && /(يتبين|نستخرج|نلاحظ|تؤكد|تظهر|النتيجة)/i.test(text);
        feedback = passed ? 'الوثيقة الأولى مستغلة بنتيجتها.' : `تنبيه: « ${compass} » - استغل الوثيقة الأولى وأبرز نتيجتها (يتبين أن…).`;
        break;
      case 'exp_m_c2': // الوثيقة الثانية + الجسر
        passed = /(الوثيقة\s*2|الوثيقتين|ومن الوثيقة|بالربط|بالاستناد|وكذلك|إضافة إلى)/i.test(text);
        feedback = passed ? 'الوثيقة الثانية مربوطة بالسياق.' : `تنبيه: « ${compass} » - استغل الوثيقة الثانية واربطها (« بالربط بين معطيات الوثيقتين »).`;
        break;
      case 'sch_c1': // عناصر في أشكال منظمة (كانون المثال: [ عنصر ] + أسهم ──►)
        passed = /(مخطط|رسم|إطار|سهم|شكل|\[|←|→|►|◄|▼|▲)/i.test(text);
        feedback = passed ? 'العناصر داخل أشكال منظمة.' : `تنبيه: « ${compass} » - ضع العناصر الفاعلة داخل أشكال منظمة (أطر، أسهم).`;
        break;
      case 'sch_c2': // اتجاهات الأسهم + المعنى الوظيفي
        passed = /(→|←|►|◄|▼|▲|↔|──)/.test(text) || /(سهم|اتجاه).*(تحفيز|تثبيط|[+−-])/.test(text);
        feedback = passed ? 'اتجاهات الأسهم ومعانيها مضبوطة.' : `تنبيه: « ${compass} » - اضبط اتجاه الأسهم ومعناها الوظيفي (+/−، تحفيز/تثبيط).`;
        break;
      case 'calc_c2':
        passed = /(بالتعويض|تعويض|=)/.test(text) && /=/.test(text);
        feedback = passed ? 'التعويض حاضر.' : `تنبيه: « ${compass} » - عوّض خطوة بخطوة.`;
        break;
      case 'calc_c3':
        passed = /%/.test(text) && /(ومنه|النتيجة|=)/.test(text) && bare.length===0;
        feedback = passed ? 'النتيجة بوحدتها.' : `تنبيه: « ${compass} » - لا تنس % ومع «ومنه».`;
        break;
      default:
        // C7 : fin du fallback silencieux — un critère inconnu est un BUG de
        // carte, pas une copie à noter sur « 40 caractères ».
        throw new Error(`[methodologyScorer] criterionId inconnu du scoreur: ${c.id} — ajouter le cas ou verifAr à la carte`);
    }

    const w = c.weight || 1;
    weightedTotal += w;
    if (passed) weightedPass += w;
    else if (c.errorTag) detected.add(c.errorTag);

    criteriaResults.push({ criterionId: c.id, label: c.wording.ar_label, passed, feedback, probe: c.wording.probe, errorTag: c.errorTag });
  }

  const icm = weightedTotal > 0 ? Math.round((weightedPass / weightedTotal) * 100) : 0;

  const remedyOf = (tags: string[]) => tags[0] ? ERROR_TAXONOMY[tags[0]]?.counterActionAr : undefined;

  const choice = switchContext?.switchChoice ?? null;
  const violated = detected.has(card.typicalErrorTag);
  const switchLine: SwitchLine = {
    truth: sw,
    choice,
    choiceCorrect: choice === null ? null : choice === sw,
    violated,
    remedyAr: violated ? ERROR_TAXONOMY[card.typicalErrorTag].counterActionAr
            : choice !== null && choice !== sw ? 'اسأل قبل الكتابة: هل الفعل يسمح بـ«لأنّ»؟' : undefined,
  };

  const stepReport: StepLine[] = ([1, 2, 3, 4] as StepId[]).map(step => {
    const applicable = step === 1 || writes(step);
    const tags = [...detected].filter(t => ERROR_TAXONOMY[t]?.step === step && t !== 'premature_interpretation');
    return { step, applicable, passed: applicable && tags.length === 0, errorTags: tags, remedyAr: remedyOf(tags) };
  });

  let nextPedagogicalStage: 1 | 2 | 3 | 4 = currentStage;
  let pedagogicalDecisionAr = '';
  if (icm < 60) {
    nextPedagogicalStage = 2;
    pedagogicalDecisionAr = 'مستوى ICM أقل من 60% — العودة إلى المرحلة 2 (الإكمال) لترسيخ الروابط المنهجية.';
  } else if (icm < 90) {
    nextPedagogicalStage = 3;
    pedagogicalDecisionAr = 'مستوى ICM بين 60% و 89% — المتابعة في المرحلة 3 مع التركيز على الخطوة الناقصة.';
  } else {
    nextPedagogicalStage = 4;
    pedagogicalDecisionAr = 'إتقان ممتاز (ICM ≥ 90%) — جاهز للمرحلة 4 (بكالوريا، بلا بطاقة).';
  }

  const detectedErrors = [...detected].map(tag => {
    const e = ERROR_TAXONOMY[tag];
    return e
      ? { tag, nameAr: e.nameAr, descriptionAr: e.descriptionAr, counterActionAr: e.counterActionAr, step: e.step }
      : { tag, nameAr: 'ملاحظة منهجية', descriptionAr: '', counterActionAr: 'راجع بطاقة الفعل.', step: 1 as StepId };
  });

  return { icm, criteriaResults, detectedErrors, switchLine, stepReport, nextPedagogicalStage, pedagogicalDecisionAr };
}
