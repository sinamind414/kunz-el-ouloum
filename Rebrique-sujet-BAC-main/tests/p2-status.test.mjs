import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildP2Status,
  summarizeUsabilityStudy,
  validUsabilitySession
} from "../scripts/report-p2-status.mjs";

const VALID_SESSION = {
  id: "p2-test-01",
  participantCode: "student-test-01",
  consentVerified: true,
  realParticipant: true,
  deviceClass: "android-low-360",
  lowEndDevice: true,
  completed: true,
  secondsToFirstQuestion: 75,
  observerInterventions: 0,
  misunderstoodTerms: [],
  draftInsertedAndVerified: true,
  testedAt: "2025-01-15"
};

test("le validateur refuse une session non consentie, non réelle ou incohérente", () => {
  assert.equal(validUsabilitySession(VALID_SESSION), true);
  assert.equal(validUsabilitySession({ ...VALID_SESSION, consentVerified: false }), false);
  assert.equal(validUsabilitySession({ ...VALID_SESSION, realParticipant: false }), false);
  assert.equal(validUsabilitySession({ ...VALID_SESSION, lowEndDevice: false }), false);
  assert.equal(validUsabilitySession({ ...VALID_SESSION, participantCode: "" }), false);
  assert.equal(validUsabilitySession({ ...VALID_SESSION, deviceClass: "  " }), false);
  assert.equal(
    validUsabilitySession({ ...VALID_SESSION, completed: true, secondsToFirstQuestion: null }),
    false
  );
  assert.equal(validUsabilitySession({ ...VALID_SESSION, testedAt: "2026-02-31" }), false);
  assert.equal(validUsabilitySession({ ...VALID_SESSION, testedAt: "2999-01-01" }), false);
  assert.equal(
    validUsabilitySession({ ...VALID_SESSION, completed: false, secondsToFirstQuestion: null }),
    true,
    "un abandon avant la première question doit rester mesurable sans inventer une durée"
  );
});

test("plusieurs sessions du même élève ne ferment pas artificiellement P2.7", () => {
  const sessions = Array.from({ length: 5 }, (_, index) => ({
    ...VALID_SESSION,
    id: `p2-repeat-${index}`
  }));
  const summary = summarizeUsabilityStudy({
    protocolVersion: 1,
    requiredParticipants: 1,
    sessions
  });
  assert.equal(summary.validSessions, 5);
  assert.equal(summary.uniqueParticipants, 1);
  assert.equal(summary.requiredParticipants, 5, "le seuil ne peut jamais être abaissé sous cinq élèves");
  assert.equal(summary.abandonmentRate, 0);
  assert.equal(summary.medianSecondsToFirstQuestion, 75);
  assert.equal(summary.observerInterventions, 0);
  assert.equal(summary.verifiedDraftInsertions, 5);
  assert.deepEqual(summary.misunderstoodTermCounts, {});
  assert.equal(summary.complete, false);
});

test("le statut P2 ferme les six lots techniques sans inventer cinq élèves", () => {
  const status = buildP2Status();
  const byId = Object.fromEntries(status.gates.map((gate) => [gate.id, gate]));
  assert.equal(status.complete, false);
  assert.equal(status.completedGates, 6);
  assert.equal(status.totalGates, 7);
  for (const id of ["P2.1", "P2.2", "P2.3", "P2.4", "P2.5", "P2.6"]) {
    assert.equal(byId[id].complete, true, `${id} devrait être fermé par une preuve automatisée`);
  }
  assert.equal(byId["P2.7"].complete, false);
  assert.equal(status.usability.uniqueParticipants, 0);
  assert.equal(status.usability.requiredParticipants, 5);
});
