# F11 — QCM du livre et bilan diagnostique

## Contrat et périmètre

Audit du 30/10/2026, référence `9bccc8b` (code produit inchangé depuis les lots
précédents). Élève invité sur Chromium local ; parcours d'essai **simulé côté
client**, sans compte réel ni validation de facturation. Bureau 1280×900 et
sondage mobile tactile 390×844. Aucun correctif produit.

Besoin : travailler un chapitre, comprendre ses erreurs, obtenir un résultat
et identifier les domaines à revoir. Un score calculé doit correspondre aux
réponses affichées. Les droits doivent être cohérents entre portes d'entrée.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Entrée générale | `TrainingHubView.tsx`, `ExamensHubView.tsx` | Entraînement → examens → chapitres ; garde globale payante |
| Entrée d'unité | `ParcoursView.tsx`, `App.tsx`, `LessonsView.tsx` | Jalon du parcours → QCM filtré par unité |
| Chapitres | `QcmLivreView.tsx`, `data/qcmLivre.ts`, `data/bookIndex.ts` | 41 questions sur 24 des 55 chapitres indexés ; propositions mélangées |
| Bilan | `QcmBilanView.tsx`, `data/qcmBilan.ts` | Pool actuel de 91 questions ; tirage 5 par domaine, 15 au total |
| Sauvegarde | `App.tsx`, `enregistrerScoreLivre` | Historique local avec `source: 'livre'` et numéro du chapitre |
| Tests | `QcmLivreView.test.tsx`, `qcmLivreOnComplete.test.tsx`, verrous des deux banques | Exécutés dans les 246 tests du lot |

Les commentaires anciens citant 28 questions livre ou un pool de 78/81 ne sont
pas les volumes actuels : le pool observé contient D1=45, D2=17, D3=29 questions.
Documents historiques : `docs/AUDIT_QCM_BILAN_2026-09-20.md` et
`docs/AUDIT_QCM_VS_LIVRE_2026-09-20.md` ; ils ne remplacent pas ces mesures.

## Scénarios et preuves

Preuves : [relevé principal](preuves/lot03/browser-results.json),
[compléments](preuves/lot03/supplement-results.json), captures 03–07 et 23–24.

| Scénario | Résultat observé |
|---|---|
| Invité → hub examens | Paywall avant même le choix d'un chapitre |
| Invité → déclarations de leçons U1 → jalon | QCM U1 ouvert sans token ; aucun store injecté pour ce scénario |
| Chapitre 1, 2 questions, une erreur volontaire | 1/2 ; réponse verrouillée, bonne option et explication affichées ; images chargées |
| Transmission du résultat | `svt_progress.quizScoreHistory` modifié avec score du livre ; replanification locale associée |
| Retour aux chapitres puis réouverture | Réponses de la tentative remises à zéro ; historique conservé |
| Bilan complet, une erreur volontaire | 14/15 avec résultats par domaine et renvoi textuel vers la révision |
| Persistance du bilan | Aucune modification du stockage observée ; résultat uniquement dans l'état du composant |
| Rechargement | Retour à l'accueil ; aucune reprise de la tentative en cours |
| Mobile | Liste lisible sur le viewport testé ; ce n'est pas un APK réel |

Les renvois du bilan sont des indications textuelles de chapitre/leçon, pas des
boutons ouvrant directement la leçon. L'absence de persistance du bilan est une
limite de contrat, distincte d'une panne du calcul du score.

## Défaut reproduit — L03-01, majeur

**Droits différents selon l'entrée.** Avec un contexte invité neuf, ouvrir
Entraînement → Examens : paywall. Revenir à l'accueil, ouvrir le parcours,
déclarer les leçons U1 comme mémorisées, puis ouvrir son jalon : QCM gratuit
accessible. Depuis cette liste, « اختبار تشخيصي شامل » lance aussi les domaines
2 et 3, pourtant bloqués par le hub général. Les captures 23–24 et les trois
écrans successifs du complément prouvent l'accès sans token.

Attendu : une politique commune aux deux portes. Observé : la garde globale du
hub et les gardes par chapitre ne couvrent pas le bilan, qui n'a pas de garde
propre. Ce n'est pas une preuve d'accès à une API payante, ni un test de licence.

## Verdict et proposition MVP

**Partielle : entraînement et score de chapitre fonctionnels sur l'échantillon,
droits incohérents.** Conserver les QCM de chapitre, fusionner les entrées et
clarifier le rôle du bilan par rapport au quiz F10. Harmoniser les gardes avant
conservation commerciale. Décider si le bilan est une consultation ponctuelle
ou un diagnostic durable, puis documenter sa sauvegarde et sa reprise.

Valeur BAC plausible : correction immédiate et travail ciblé. Fréquence réelle
inconnue. Pas de validation scientifique exhaustive, d'essai serveur authentifié,
de synchronisation, de démarrage hors ligne à froid ou de CI distante.
Les réponses de scénario proviennent des attendus et vérifient le câblage.
