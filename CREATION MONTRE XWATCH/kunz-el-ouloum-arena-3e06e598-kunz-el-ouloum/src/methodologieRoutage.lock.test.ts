// src/methodologieRoutage.lock.test.ts — verrou de routage du banc méthodologique.
//
// Constat de l'audit externe v4 (15/10/2026, axe 2, vérifié ici par sondage
// réel du moteur) : le savoir méthodologique existe (24 entrées), mais deux
// formulations d'élève naturelles le rendaient inatteignable, et une troisième
// servait un cours sur un AUTRE sujet à haute confiance :
//
//   · « كيف أجيب على سؤال حلل الوثيقة؟ »  → repli « لم أجد » (conf 20),
//     alors que meth_7 (« كيف أحلل وثيقة؟ ») porte exactement la réponse ;
//   · « كيفاش نحلل الوثيقة »              → même repli ;
//   · « واش نكتب في الاستنتاج »           → carte « تركيب البروتين » à conf 70
//     (la recherche de contenu matchait « الاستنتاج » comme vocabulaire de
//     cours). La question la plus fréquente de l'année recevait un chapitre
//     hors sujet affiché comme une réponse sûre.
//
// Le fix honnête (règle AGENTS n° 5 : aucun contenu inventé, le livre source
// n'étant pas dans le dépôt) : étendre les déclencheurs des entrées EXISTANTES
// — meth_7 pour l'analyse de document, meth_17 pour « استنتج » — vers les
// formulations d'élève mesurées. La قالب existing répond correctement.
import { describe, expect, it } from 'vitest';
import { processStudentInput } from './smartTutorEngine';
import { getDefaultSession } from './utils/sessionManager';

const session = () => ({ ...getDefaultSession(), activeDomainId: null });

describe('routage méthodologique — formulations réelles d’élève (audit v4)', () => {
  const CAS: Array<[string, string]> = [
    ['كيف أجيب على سؤال حلل الوثيقة؟', 'كيف أحلل وثيقة؟'],
    ['كيفاش نحلل الوثيقة', 'كيف أحلل وثيقة؟'],
    ['واش نكتب في الاستنتاج', 'استنتج'],
  ];

  for (const [saisie, attendu] of CAS) {
    it(`« ${saisie} » → une réponse méthodologique (pas un repli, pas un cours hors sujet)`, () => {
      const r = processStudentInput(session(), saisie);
      const src = r.action.sources?.[0];
      expect(
        src?.type,
        `「${saisie}」 → ${r.action.text.slice(0, 90)}`,
      ).toBe('methodology');
      expect(src?.title ?? '').toContain(attendu);
    });
  }
});
