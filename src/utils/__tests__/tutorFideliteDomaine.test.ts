// src/utils/__tests__/tutorFideliteDomaine.test.ts — LE BANC DE FIDÉLITÉ AU DOMAINE.
//
// Recommandation n° 5 de l'audit du 14/10/2026 : le banc de mesure qui a mis au
// jour les quatre réponses hors sujet doit devenir un test permanent.
//
// DÉFAUT VERROUILLÉ (audit §5.1). Le moteur servait, avec 70 % de confiance
// affichée, des extraits d'un AUTRE chapitre :
//   كيف تتشكل الجبال؟        → un cours sur l'ADN et la transcription
//   ما هي البنيات الجيولوجية؟ → un QCM sur les structures secondaires d'une protéine
//   ما هي البؤرة الزلزالية؟   → une image de polysome pendant la traduction
//   لماذا للتنفس مردود أعلى؟  → une question sur les groupes sanguins (O⁻)
//
// Pourquoi c'est le défaut le plus coûteux du moteur : l'élève reçoit un texte
// plausible, bien écrit, tiré d'un vrai cours — sur un autre chapitre. Il
// l'apprend. Ailleurs, une erreur se voit ; ici, elle s'enseigne.
//
// RÈGLE ADOPTÉE : pour une question de programme, le tuteur doit soit servir un
// extrait DU BON DOMAINE (ou transverse : fiche, méthode, guide), soit avouer
// honnêtement qu'il n'a rien trouvé. Jamais servir un extrait d'un autre domaine,
// jamais déclarer « hors programme » une question du programme.
import { describe, expect, it } from 'vitest';
import { processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession } from '../sessionManager';
import { LESSON_INDEX } from '../../data/lessonIndex';
import { KNOWLEDGE_CARDS } from '../../data/smartBotData';

/** Unités → domaines du programme (1 : protéines/génétique, 2 : énergétique, 3 : géologie). */
const DOMAINES: Record<number, [number, number]> = { 1: [1, 5], 2: [6, 8], 3: [9, 11] };

const domaineDeLExtrait = (titre: string): number | null => {
  const ch = LESSON_INDEX.find((c) => c.title === titre || c.lessonTitle === titre);
  if (!ch || ch.unitId == null) return null;
  for (const [d, [min, max]] of Object.entries(DOMAINES)) {
    if (ch.unitId >= min && ch.unitId <= max) return Number(d);
  }
  return null;
};

const sessionNeuve = () => ({ ...getDefaultSession(), activeDomainId: 1 });

interface Verdict {
  statut: 'domaine-ok' | 'transverse-ok' | 'ignorance' | 'hors-domaine' | 'hors-programme';
  source: string;
  debut: string;
}

function juger(question: string, domaineAttendu: number): Verdict {
  const r = processStudentInput(sessionNeuve(), question);
  const texte = r.action.text || '';
  const source = r.action.sources?.[0];
  const debut = texte.slice(0, 70).replace(/\n/g, ' ');

  if (texte.includes('خارج قاعدة')) return { statut: 'hors-programme', source: String(source?.title), debut };
  if (texte.includes('لم أجد في دروسي')) return { statut: 'ignorance', source: String(source?.title), debut };

  // Morchid v3, M1 (15/10/2026) : une carte interne n'est pas « transverse ».
  // Le verrou initial ne jugeait le domaine que pour source.type === 'lesson' ;
  // or 18 réponses sur 23 du banc viennent de cartes internes qui passaient
  // sans contrôle — un verrou qui ne verrouille pas ce que le moteur fait le
  // plus souvent. KnowledgeCard porte déjà domainId : on l'exige.
  if (source?.type === 'internal_card') {
    const card = KNOWLEDGE_CARDS.find((c) => c.title === source.title);
    if (card) {
      return {
        statut: card.domainId === domaineAttendu ? 'domaine-ok' : 'hors-domaine',
        source: String(source.title),
        debut,
      };
    }
  }

  const domaine = source?.type === 'lesson' ? domaineDeLExtrait(String(source.title)) : null;
  if (domaine == null) return { statut: 'transverse-ok', source: String(source?.title), debut };
  return { statut: domaine === domaineAttendu ? 'domaine-ok' : 'hors-domaine', source: String(source?.title), debut };
}

/** Les 23 questions de l'annexe de l'audit — domaine non ambigu. */
const BANC: Array<[string, number]> = [
  // Domaine 3 — tectonique
  ['ما هي بنية الكرة الأرضية؟', 3],
  ['ما هي الموجات الزلزالية؟', 3],
  ['اشرح الغوص', 3],
  ['كيف تتشكل الجبال؟', 3],
  ['ما هي البنيات الجيولوجية؟', 3],
  ['ما هي الصفائح التكتونية؟', 3],
  ['ما هو الوشاح؟', 3],
  ['كيف نحدد باطن الأرض؟', 3],
  ['ما هي البؤرة الزلزالية؟', 3],
  // Domaine 2 — énergétique
  ['ما هو التركيب الضوئي؟', 2],
  ['ما هي حلقة كالفن؟', 2],
  ['اشرح التنفس الخلوي', 2],
  ['قارن بين التنفس والتخمر', 2],
  ['ما هو ATP؟', 2],
  ['لماذا للتنفس مردود أعلى؟', 2],
  ['ما هي المرحلة الكيميوضوئية؟', 2],
  // Domaine 1 — protéines et génétique
  ['ما هو الاستنساخ؟', 1],
  ['اشرح الترجمة', 1],
  ['ما دور ARN بوليميراز؟', 1],
  ['ما هي الاستجابة المناعية؟', 1],
  ['ما هو الاتصال العصبي؟', 1],
  ['ما هي الحمولة الوراثية؟', 1],
  ['لماذا يتأثر الإنزيم بالحرارة؟', 1],
];

describe('banc de fidélité au domaine — 23 questions du programme', () => {
  for (const [question, attendu] of BANC) {
    it(`« ${question} » → domaine ${attendu} ou aveu d’ignorance`, () => {
      const v = juger(question, attendu);
      expect(
        v.statut,
        `${question}\n  → ${v.statut} (source « ${v.source} »)\n  → ${v.debut}`,
      ).not.toBe('hors-domaine');
      expect(v.statut, `${question}\n  → ${v.debut}`).not.toBe('hors-programme');
    });
  }
});

describe('les quatre réponses fausses de l’audit ne reviennent pas', () => {
  // Verrou nommé : le texte fautif servi le 14/10/2026 est interdit pour cette
  // question précise. Un test générique ne suffirait pas — c'est CE document-là
  // qui était faux.
  const INTERDITS: Array<[string, string]> = [
    ['كيف تتشكل الجبال؟', 'استنساخ المعلومات الوراثية'],
    ['ما هي البنيات الجيولوجية؟', 'النموذج الشريطي للبروتين'],
    ['ما هي البؤرة الزلزالية؟', 'متعدد الريبوزوم'],
    ['لماذا للتنفس مردود أعلى؟', 'زمرة دموية'],
  ];

  for (const [question, texteInterdit] of INTERDITS) {
    it(`« ${question} » ne reçoit plus « ${texteInterdit} »`, () => {
      const r = processStudentInput(sessionNeuve(), question);
      expect(r.action.text).not.toContain(texteInterdit);
    });
  }

  it('et la question de géologie reçoit bien du contenu de géologie', () => {
    const r = processStudentInput(sessionNeuve(), 'كيف تتشكل الجبال؟');
    expect(r.action.text).toContain('جبال');
  });
});

describe('la confiance affichée n’est plus une valeur de façade', () => {
  it('une correspondance faible n’est pas annoncée à 70 %', () => {
    // Avant : `confidence: 70` en dur pour tout extrait de recherche, quelle que
    // soit la force de la preuve. « كيف تتشكل الجبال؟ » valait 19 points et
    // s'affichait quand même à 70 %.
    const r = processStudentInput(sessionNeuve(), 'كيف تتشكل الجبال؟');
    const c = r.action.confidence ?? 0;
    expect(c).toBeLessThan(70);
    expect(c).toBeGreaterThan(0);
  });
});
