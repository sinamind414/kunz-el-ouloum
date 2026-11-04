/* ============================================================
   POLITIQUE DU MODE BAC — décision produit, à relire avant tout changement
   ------------------------------------------------------------
   Demande explicite : « je veux que cette chose mode exercice
   disparaisse, je veux juste le mode bac et qu'il soit fonctionnel. »

   Le mode BAC est donc le SEUL mode de session. Il ouvre l'épreuve sur
   l'inventaire des tâches du sujet (data/official-tasks.js), généré
   mécaniquement depuis data/years/** (scripts/generate-official-inventories.mjs).

   Ce que cette politique ASSOUPLIT, et à quel prix pour l'élève :

   - allowPartialInventory     : un inventaire « partial » suffit.
     → prix : le sujet n'est pas déclaré intégralement inventorié.
   - allowReconstructedPrompts : les étapes reconstruites (promptSource
     "reconstructed") sont proposées comme tâches.
     → prix : chacune est badgée ⚠️ dans l'écran d'épreuve ; l'application
       n'affirme jamais que c'est la question officielle du sujet.
   - allowProvisionalScoring   : le barème n'est pas vérifié (0 copie
       doublement annotée) mais l'épreuve est ouverte.
     → prix : AUCUNE note chiffrée n'est affichée, avant ni après remise.
   - allowUnreviewedDocuments  : les renvois de page ne sont pas certifiés.

   Ce qui reste STRICT, quoi qu'il arrive :

   - requireInventoriedSubject       : un sujet sans inventaire reste fermé ;
   - requireEveryExerciseInventoried : pas d'exercice vide dans l'épreuve ;
   - requireEveryTaskMapped          : chaque tâche est rattachée à une étape ;
   - requirePointsMatch              : les points concordent avec le sujet ;
   - aucune erreur de métadonnée tolérée.

   Rien ici ne rend une consigne « officielle » ni un barème « vérifié » :
   cela reste du travail humain (relecture des PDF + double annotation).
   ============================================================ */

export const BAC_MODE_POLICY = Object.freeze({
  schemaVersion: 1,

  singleMode: true,

  requireInventoriedSubject: true,
  requireEveryExerciseInventoried: true,
  requireEveryTaskMapped: true,
  requirePointsMatch: true,

  allowPartialInventory: true,
  allowReconstructedPrompts: true,
  allowProvisionalScoring: true,
  allowUnreviewedDocuments: true,

  neverShowNumericScores: true,
  neverClaimOfficialCorrection: true
});

/** Libellés arabes affichés à l'élève pour chaque assouplissement actif.
 *  L'absence de note chiffrée n'est plus annoncée par une phrase : le
 *  propriétaire a demandé de retirer ce texte de tout ce que le site sert. */
export const BAC_MODE_NOTICES = Object.freeze({
  reconstructed: "⚠️ خطوة مُعاد بناؤها لأغراض التدريب، وليست نصّ التعليمات الرسمية.",
  unverifiedPages: "إحالات الصفحات غير مراجعة بشرياً."
});
