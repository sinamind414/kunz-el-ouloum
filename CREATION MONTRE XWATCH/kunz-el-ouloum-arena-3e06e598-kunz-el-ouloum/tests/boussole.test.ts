import { evaluateStudentProduction } from '../src/utils/methodologyScorer';
import { VERB_CARDS_V2, TRAINING_EXERCISES } from '../src/data/methodologyEngine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

function hasError(rep: ReturnType<typeof evaluateStudentProduction>, tag: string) {
  return rep.detectedErrors.some((e: any) => e.tag === tag);
}

console.log('\n=== B.O.U.S.S.E.L.E v2 Tests ===\n');

// 1. v2 invariants : les réponses-modèles sont propres
console.log('1) v2 · good/bad examples');
for (const card of VERB_CARDS_V2) {
  const good = evaluateStudentProduction(card.id, card.goodExample.answer, undefined, 3, { switchChoice: card.switch });
  assert(good.detectedErrors.length === 0, `${card.verbAr} goodExample : aucune erreur (${good.detectedErrors.map((e: any) => e.tag).join(',') || 'ok'})`);
  assert(good.icm >= 90, `${card.verbAr} goodExample : ICM ≥ 90 (${good.icm})`);
  assert(good.switchLine.choiceCorrect === true, `${card.verbAr} goodExample : switchLine.choiceCorrect`);
  assert(good.switchLine.violated === false, `${card.verbAr} goodExample : switchLine.violated=false`);
  const bad = evaluateStudentProduction(card.id, card.badExample.answer);
  assert(hasError(bad, card.badExample.errorTag), `${card.verbAr} badExample : déclenche ${card.badExample.errorTag} (${bad.detectedErrors.map((e: any) => e.tag).join(',')})`);
}

// 2. v2 invariants : expert answers des exercices
console.log('\n2) v2 · expert answers des exercices');
for (const ex of TRAINING_EXERCISES) {
  const r = evaluateStudentProduction(ex.verbId, ex.stage1.expertAnswer, undefined, 4, { switchChoice: null });
  assert(r.detectedErrors.length === 0, `${ex.id} expertAnswer : aucune erreur (${r.detectedErrors.map((e: any) => e.tag).join(',') || 'ok'})`);
  assert(r.switchLine.choiceCorrect === null, `${ex.id} expertAnswer : choiceCorrect=null`);
}

// 3. Exclusion mutuelle de l'interrupteur
console.log('\n3) v2 · exclusion mutuelle de l\'interrupteur');
const closed = evaluateStudentProduction('verb_analyse_v1', 'تمثل الوثيقة 1 منحنى … نلاحظ تناقصاً من 4 غ/ل إلى 0 غ/ل لأن الإنزيم تخرب. الاستنتاج: …');
assert(hasError(closed, 'premature_interpretation'), 'fermé : لأنّ → premature_interpretation');
assert(!hasError(closed, 'unsupported_claim'), 'fermé : jamais unsupported_claim');
const open = evaluateStudentProduction('verb_explain_v1', 'الملاحظة: انعدام النشاط. النشاط الإنزيمي منعدم عند pH=6. الاستنتاج: الإنزيم حساس للـ pH.');
assert(hasError(open, 'unsupported_claim'), 'ouvert : pas de lien → unsupported_claim');
assert(!hasError(open, 'premature_interpretation'), 'ouvert : jamais premature_interpretation');

// 4. Duel scoreur vs boussole (bons textes → ICM élevé)
console.log('\n4) Duel 12/12 (textes corrects)');
const duelCases = [
  { verbId: 'verb_analyse_v1', text: 'تمثل الوثيقة 1 منحنى تطور نسبة الإشعاع في العضيات الخلوية بدلالة الزمن حيث نلاحظ ارتفاعاً في الشبكة الهيولية ليبلغ 80% عند د 5 ثم انتقالاً إلى جهاز غولجي. الاستنتاج: يتم تركيب البروتين في الشبكة الهيولية ثم ينتقل لجهاز غولجي.' },
  { verbId: 'verb_explain_v1', text: 'الملاحظة: يصل السيال العصبي إلى النهاية قبل المشبكية. يعود ذلك إلى أن Ca2+ يدخل إلى الخلية مما يسبب تحرير الأستيل كولين في الشق المشبكي. وبالتالي توليد كمون عمل بعد مشبكي. الاستنتاج: ينقل السيال رسالته.' },
  { verbId: 'verb_compare_v1', text: 'أوجه التشابه: كلاهما استجابة مناعية نوعية مكتسبة تعتمد على التكاثر اللمفاوي وامتلاك ذاكرة مناعية. بينما الاستجابة الخلطية تستخدم أجساماً مضادة، في حين تستخدم الاستجابة الخلوية الخلايا LTc. الخلاصة: تتكامل الاستجابتان لضمان القضاء الشامل.' },
];
duelCases.forEach((c, i) => {
  const rep = evaluateStudentProduction(c.verbId, c.text, undefined, 3);
  assert(rep.icm >= 75, `duel ${i + 1}: ICM=${rep.icm}% (expected ≥75)`);
});

// 5. Anti-faux positifs
console.log('\n5) Anti-false-positives');
const antiFp = [
  { verbId: 'verb_analyse_v1', text: 'الوثيقة 1 منحنى الإشعاع في الشبكة الهيولية يبلغ 80% عند د 5. الاستنتاج: يتم تركيب البروتين.' },
];
antiFp.forEach((c, i) => {
  const rep = evaluateStudentProduction(c.verbId, c.text, undefined, 3);
  assert(!hasError(rep, 'missing_reference'), `anti-fp ${i + 1}: no missing_reference`);
});

// 6. Intégrité données
console.log('\n6) Training exercises & VERB_CARDS integrity');
assert(TRAINING_EXERCISES.length >= 4, `≥4 exercises (found ${TRAINING_EXERCISES.length})`);
TRAINING_EXERCISES.forEach((ex, i) => {
  assert(ex.stage1.segments.length >= 3, `exercise ${i + 1}: ≥3 segments`);
  assert(ex.stage2.blanks.length >= 3, `exercise ${i + 1}: ≥3 blanks`);
});
assert(VERB_CARDS_V2.length >= 4, `≥4 verbs v2 (found ${VERB_CARDS_V2.length})`);
VERB_CARDS_V2.forEach((v, i) => {
  assert(v.criteria.length >= 2, `verb ${i + 1}: ≥2 criteria (found ${v.criteria.length})`);
  assert(v.verbAr.length > 0, `verb ${i + 1}: has Arabic label`);
});

console.log(`\n=== Résultats: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
