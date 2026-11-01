// rappelCorpusMission.test.ts — audit Capitaine 2026-10-17 (§4.1, P1) :
// « le moteur programme un retour sans que le Capitaine ne consulte cette
// file pour poser la question due ; prochainRappelDu n'a aucun appel hors
// tests ». Le corpus (spacedRecallPrompts) était doublement orphelin : sa
// banque SM-2 s'ALIMENTE (planifierRappelsPourErreurs) mais sa question
// n'était jamais posée, et la file n'était jamais consultée.
//
// Contrat : la mission du jour — quand un rappel de concept est échu — POSE
// la vraie question du corpus ; la réponse LIBRE est notée SM-2
// (noterReponseLibre, preuves déclarées dans le corpus) ; la mission se
// clôt ; une intention forte libère sans pièger l'élève.
import { afterEach, describe, expect, it } from 'vitest';
import { getDailyMission, processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession, type BotSession } from '../../utils/sessionManager';
import { etatRappel, CLE_RAPPEL_ADAPTATIF } from '../../lib/rappelAdaptatif';
import { prochainRappelDu } from '../../lib/rappelConcepts';

const JOUR = 86_400_000;

function semerRappelEchu(conceptId: string, retardJours: number): void {
  localStorage.setItem(
    CLE_RAPPEL_ADAPTATIF,
    JSON.stringify({
      [conceptId]: { ease: 2.5, intervalDays: 1, dueAt: Date.now() - retardJours * JOUR, reps: 0, lapses: 0 },
    }),
  );
}

function missionFrais(): BotSession {
  return { ...getDefaultSession() };
}

afterEach(() => {
  localStorage.clear();
});

describe('la mission consulte la file des rappels de concepts (audit §4.1)', () => {
  it('un rappel échu DEVIENT la mission : la vraie question du corpus est posée', () => {
    semerRappelEchu('transcription', 3);
    const r = getDailyMission(missionFrais());
    // La question stage-0 du corpus : « في أي اتجاه يُركّب ARNm؟ »
    expect(r.action.text).toContain('في أي اتجاه يُركّب ARNm؟');
    // Le retard réel est nommé (3 jours) — pas une fausse urgence.
    expect(r.action.text).toContain('3');
    // L'état retient qu'une question de rappel est EN ATTENTE d'une réponse.
    expect(r.session.pendingCorpusRecallId).toBe('transcription');
  });

  it('sans rappel dû → la mission reste celle d avant (aucun 0-x invasif)', () => {
    const r = getDailyMission(missionFrais());
    expect(r.session.pendingCorpusRecallId ?? null).toBeNull();
  });
});

describe('la réponse libre du corpus est notée SM-2 (audit §4.1)', () => {
  it('réponse avec les preuves attendues → verdict + prochain délai annoncé', () => {
    semerRappelEchu('transcription', 3);
    const pose = getDailyMission(missionFrais());
    const rep = processStudentInput(pose.session, 'يُركَّب ARNm في الاتجاه من 5 إلى 3 على قالب ADN');
    // Le verdict mesure la mémoire (preuves: 5, 3, ARNm) et annonce le délai.
    expect(rep.action.text).toContain('✅');
    expect(etatRappel('transcription')?.reps).toBe(1);
    // La mission du jour est clôturée par cette restitution.
    expect(rep.session.lastMissionDate).not.toBeNull();
  });

  it('réponse insuffisante → pas de ✅ mensonger, lapses remontés', () => {
    semerRappelEchu('transcription', 3);
    const pose = getDailyMission(missionFrais());
    const rep = processStudentInput(pose.session, 'لا أعرف');
    expect(rep.action.text).not.toContain('✅');
    expect(etatRappel('transcription')?.lapses ?? 0).toBeGreaterThanOrEqual(1);
  });

  it('intention forte (menu) libère la question SANS juger la personne', () => {
    semerRappelEchu('transcription', 3);
    const pose = getDailyMission(missionFrais());
    const rep = processStudentInput(pose.session, 'القائمة الرئيسية');
    expect(rep.action.text).not.toContain('في أي اتجاه');
    expect(rep.session.pendingCorpusRecallId ?? null).toBeNull();
  });

  it('après restitution, prochainRappelDu avance (la file tourne vraiment)', () => {
    semerRappelEchu('transcription', 3);
    const pose = getDailyMission(missionFrais());
    const rep = processStudentInput(pose.session, 'يُركَّب ARNm في الاتجاه من 5 إلى 3 على قالب ADN');
    // L'espacement réel repousse l'échéance : le même rappel n'est plus dû.
    expect(prochainRappelDu()?.itemId ?? null).not.toBe('transcription');
    expect(rep.session.pendingCorpusRecallId ?? null).toBeNull();
  });
});
