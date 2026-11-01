// answerStructureCheck.test.ts — verrous des contrôles de forme (sprint 23).
//
// Chaque famille est testée avec une réponse CONFORME et une réponse
// DÉFAILLANTE : un contrôle qui passe toujours ne sert à rien, et un contrôle
// qui échoue toujours décourage. Les textes d'exemple sont écrits pour ce test,
// ils ne proviennent pas des sujets officiels.

import { describe, expect, it } from 'vitest';
import {
  FAMILIES_WITH_CHECKS,
  checkAnswerForVerb,
  checkAnswerStructure,
  structureVerdict,
} from './answerStructureCheck';
import { VERB_FAMILIES } from './verbDemands';

const okDe = (familyId: string, texte: string) =>
  checkAnswerStructure(familyId, texte).filter((c) => c.nature === 'attendu' && !c.ok);

describe('contrôles de forme — couverture', () => {
  it('couvre toutes les familles de consignes', () => {
    for (const f of VERB_FAMILIES) {
      expect(FAMILIES_WITH_CHECKS, f.id).toContain(f.id);
    }
  });

  it('ne dit rien sur un texte vide plutôt que de tout marquer en rouge', () => {
    expect(checkAnswerStructure('verb_analyser', '   ')).toEqual([]);
  });

  it('accepte la formulation brute de la consigne', () => {
    expect(checkAnswerForVerb('حلّل المخطط', 'نلاحظ ارتفاع القيمة من 10% إلى 50%').length)
      .toBeGreaterThan(0);
    expect(checkAnswerForVerb('consigne inconnue xyz', 'نص')).toEqual([]);
  });
});

describe('contrôles de forme — تحليل contre تفسير', () => {
  const analyseCorrecte =
    'نلاحظ في المجال من 0 إلى 5 دقيقة ارتفاع النشاط من 10% إلى 80% ، أي كلما زاد التركيز كلما زاد النشاط.';
  const analyseQuiExplique =
    'نلاحظ ارتفاع النشاط من 10% إلى 80% لأن الأنزيم يرتبط بالركيزة على مستوى الموقع الفعال.';

  it('valide une analyse chiffrée avec unités et tendance', () => {
    expect(okDe('verb_analyser', analyseCorrecte)).toEqual([]);
  });

  it('alerte quand une cause s’invite dans le تحليل', () => {
    const alertes = structureVerdict('verb_analyser', analyseQuiExplique)!.alertes;
    expect(alertes.map((a) => a.id)).toContain('pas_de_cause');
  });

  it('reproche à une analyse sans chiffres ni tendance de n’être qu’un commentaire', () => {
    const manquants = okDe('verb_analyser', 'نلاحظ أن النشاط مرتفع ثم ينخفض قليلاً').map((c) => c.id);
    expect(manquants).toContain('chiffres');
    expect(manquants).toContain('unites');
  });

  it('exige de l’explication un connecteur causal et un niveau', () => {
    const faible = okDe('verb_expliquer', 'ينخفض النشاط بشكل واضح في الوثيقة 1').map((c) => c.id);
    expect(faible).toContain('connecteur');
    const bonne = okDe(
      'verb_expliquer',
      'ينخفض النشاط كما تبيّن الوثيقة 1 و يعود ذلك جزيئياً إلى ارتباط المثبّط بالموقع الفعال.',
    );
    expect(bonne).toEqual([]);
  });
});

describe('contrôles de forme — texte scientifique et schéma', () => {
  it('exige problématique, conclusion, appui documentaire et volume', () => {
    const mauvais = okDe('verb_texte_scientifique', 'البروتين جزيء حيوي مهم جداً في الخلية.').map(
      (c) => c.id,
    );
    expect(mauvais).toContain('intro_probleme');
    expect(mauvais).toContain('conclusion');
    expect(mauvais).toContain('longueur');
  });

  it('valide un texte structuré', () => {
    const bon =
      'تطرح هذه الدراسة مشكلاً علمياً: كيف يؤثر المثبّط على النشاط الأنزيمي؟ تبيّن الوثيقة 1 انخفاض السرعة من 100% إلى 20% عند رفع التركيز، كما تبيّن الوثيقة 2 ارتباط المادة بالموقع الفعال مباشرة و بشكل واضح في النمذجة المقدمة. و منه نستنتج أن المادة مثبّط تنافسي يحتل الموقع الفعال مكان الركيزة.';
    expect(okDe('verb_texte_scientifique', bon)).toEqual([]);
  });

  it('refuse un « schéma » écrit en liste de points', () => {
    const manquants = okDe('verb_schema_bilan', 'أولاً المستضد ثانياً البلعمة ثالثاً العرض').map(
      (c) => c.id,
    );
    expect(manquants).toContain('fleches');
  });

  it('valide un schéma à trois flèches', () => {
    expect(okDe('verb_schema_bilan', 'مستضد ← بلعمي ← عرض ← LT4')).toEqual([]);
  });
});

describe('contrôles de forme — démarche scientifique', () => {
  it('exige une modalité dans l’hypothèse', () => {
    expect(okDe('verb_hypothese', 'المادة تثبّط الأنزيم').map((c) => c.id)).toContain('modalite');
    expect(
      okDe('verb_hypothese', 'قد يعود انخفاض النشاط إلى ارتباط المادة بالموقع الفعال مما يؤدي إلى منع التحفيز'),
    ).toEqual([]);
  });

  it('exige un verdict et une preuve dans la validation', () => {
    const manquants = okDe('verb_valider', 'الفرضية المقترحة تبدو منطقية جداً').map((c) => c.id);
    expect(manquants).toContain('preuve');
    expect(manquants).toContain('verdict');
  });

  it('alerte sur un rejet tranché sans donnée à l’appui', () => {
    const v = structureVerdict('verb_valider', 'الفرضية الثانية خاطئة و ننفيها تماماً')!;
    expect(v.alertes.map((a) => a.id)).toContain('prudence');
  });

  it('accepte une validation prudente et chiffrée', () => {
    const v = structureVerdict(
      'verb_valider',
      'تنصّ الفرضية على أن المادة تثبّط الاستنساخ، و بما أن الوثيقة 2 تبيّن بقاء النشاط عند 100% فإن الفرضية غير مدعومة بالمعطيات.',
    )!;
    expect(v.alertes).toEqual([]);
    expect(v.satisfaits).toBe(v.total);
  });
});

describe('contrôles de forme — bilan lisible', () => {
  it('compte les exigences satisfaites sans compter les vigilances', () => {
    const v = structureVerdict('verb_conclure', 'نستنتج أن المادة مثبّط تنافسي.')!;
    expect(v.total).toBe(2);
    expect(v.satisfaits).toBe(2);
    expect(v.titleAr).toBeTruthy();
  });

  it('reproche à une conclusion bavarde sa longueur', () => {
    const longue = `نستنتج أن ${'المادة تثبط الأنزيم و تخفض السرعة و ترتبط بالموقع الفعال '.repeat(6)}`;
    expect(okDe('verb_conclure', longue).map((c) => c.id)).toContain('brievete');
  });

  it('renvoie null pour une famille inconnue', () => {
    expect(structureVerdict('famille_imaginaire', 'نص')).toBeNull();
  });
});
