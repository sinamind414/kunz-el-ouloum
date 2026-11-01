# 🧪 Test utilisateur 5 minutes — protocole « 3 élèves »

> **Pourquoi ce document** : aucun principe de design (Hick, Miller, progressive disclosure)
> ne remplace l'observation d'un vrai candidat. Ce protocole est exécutable par n'importe qui
> en **une heure** (3 élèves × 5 min + dépouillement). C'est le seul « test » qui valide
> réellement la simplicité de l'interface.

> ⚠️ **État au 2026-09-06 : ce protocole n'a jamais été exécuté.** Aucune grille remplie,
> aucun verbatim, aucun résultat n'existe dans le dépôt, et
> `tests/hard-benchmark/cases.json` est toujours `{"cases": []}`. Tant que la section 7
> n'est pas remplie et committée, toutes les affirmations du README sur la « simplicité »
> de l'interface sont des hypothèses, pas des observations.

> 🔁 **Les libellés ci-dessous ont été revérifiés ligne à ligne sur l'UI réelle le
> 2026-09-06** (l'ancienne tâche T1 demandait de cliquer « ابدأ جلسة مدتها 10 دقائق »,
> un bouton supprimé depuis par l'épure de l'interface — le protocole pointait donc sur
> du vide). Ce document pourrit vite : **revérifier les trois libellés avant chaque
> passation**, sinon l'élève cherche un bouton qui n'existe plus et la donnée est perdue.

---

## 1. Préparation (10 min, une seule fois)

- Téléphone ou PC, PWA installée, session déjà ouverte sur le hub (les élèves ne partent jamais de zéro).
- Enregistreur vocal ou prise de notes brute. **Silence total pendant les tâches.**
- 3 élèves profils différents : un faible Moyenne (~10/20), un moyen (~14), un bon (~18). Jamais 3 bons.

## 2. Règle d'or

**Tu n'aides jamais pendant le test.** Tu lis la tâche, tu te tais, tu notes.
Une hésitation, un clic mort, une question (« c'est quoi ça ? ») = **donnée précieuse**, pas un échec de l'élève.

## 3. Les 3 tâches (lire telles quelles)

| #   | Consigne à lire à l'élève                              | Succès si…                                                                                                                                                                                     | Ce que ça teste                                                                                                                             |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | « اختر بكالوريا 2025 وابدأ »                            | Espace de travail (التمرين 01) visible en < 45 s et sans aide, via le parcours réel en 3 étapes : carte `2025` → «♞ أنا هادئ ومستعد \| تصفح PDF وحاسبة الاختيار (25 دقيقة)» → «🔒 تثبيت نهائي للموضوع 01 وعزل مستنداته» | Friction d'entrée du parcours réel, et **compréhension de l'écran stratégie** : l'élève ne doit pas croire que le PDF/calculatrice est déjà l'examen |
| T2  | « اكتب إجابة للسنّ اجمع — وإن أردت مساعدة فهي موجودة » | Réponse saisie dans le champ du pôle اجمع ; note s'il trouve le dépliant 🧭 (`افتح ورقة المسودة`) seul                                                                                           | Progressive disclosure du workspace                                                                                                           |
| T3  | « جرّب تدريب شحذ المفتاح جولة واحدة »                  | Section «🔑 تدريب المفتاح» dépliée + bouton «🔑 ابدأ التدريب» lancé en < 60 s                                                                                                                   | Découvrabilité de la section repliée                                                                                                          |

## 4. Grille d'observation (1 ligne par élève et par tâche)

```
Élève … / Tâche …
- Temps : …… s
- Hésitations > 5 s : où exactement (écran/élément) : ………
- Clics morts (élément cliqué sans effet) : ………
- Verbatim exact (citations brutes) : ………
- Aide consultée spontanément : oui / non
```

## 5. Décisions après les 3 tests (dépouillement 15 min)

1. **Hésitation > 5 s ou clic mort sur un élément** → cet élément est coupé, déplacé ou rendu invisible par défaut. Pas de débat : la donnée tranche.
2. **2 élèves sur 3 échouent une tâche** → la tâche (pas l'élève) est repensée avant tout nouveau code.
3. **3 sur 3 réussissent** → on ne touche à rien. Zéro itération cosmétique sans signal.
4. Tout changement décidé est livré avec un test verrou (comme « le guide reste calme ») pour ne pas régresser.

## 6. Ce qu'il ne faut PAS faire

- Ne pas tutorer, ne pas rassurer, ne pas expliquer l'interface.
- Ne pas tester 3 bons élèves « pour que ça passe ».
- Ne pas empiler des fonctionnalités en réponse à un verbatim isolé : 1 signalement = anecdote, 2+ = signal.

## 7. Résultats (à remplir **et committer** — sinon le test n'a pas eu lieu)

Un test non consigné est indiscernable d'un test non fait. Cette section est la seule
preuve acceptable ; la remplir **avant** toute nouvelle fonctionnalité.

| Date | Élève (profil, anonyme) | Tâche | Temps | Hésitations > 5 s | Clics morts | Verbatim brut | Aide spontanée |
| ---- | ----------------------- | ----- | ----- | ----------------- | ----------- | ------------- | -------------- |
|      |                         |       |       |                   |             |               |                |

**Décisions prises après dépouillement** (élément coupé / déplacé / inchangé, avec le
test verrou ajouté) :

- _à remplir_
