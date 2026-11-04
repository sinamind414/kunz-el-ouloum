# P1 — preuves externes requises pour fermer les trois lots bloqués

Le dépôt peut contrôler les preuves, mais il ne peut pas les fabriquer. `npm run p1:check` doit rester rouge tant que les éléments ci-dessous ne sont pas fournis et audités.

## P1.1 / P1.2 — 58 inventaires officiels

Pour chacun des 58 couples année/sujet configurés (29 sessions × 2, SE 2021 comprise depuis sa structuration OCR du 2026-09-20) :

1. énoncé officiel identifiable et date de vérification ;
2. liste exhaustive des exercices, questions et sous-questions, dans l'ordre ;
3. page de chaque tâche et références exactes aux documents utilisés ;
4. maximum de points vérifié sur un barème officiel traçable ;
5. total par exercice et par sujet cohérent avec la configuration ;
6. mapping explicite tâche officielle → geste(s) N/S/E/W, sans transformer les quatre gestes en quatre fausses questions ;
7. statut `complete` uniquement après relecture exhaustive.

Un thème, un corrigé non attribué ou une consigne reconstruite ne suffit pas. Une URL accessible ne prouve pas que son contenu a été relu. Le premier pilote couvre seulement 2025/S1/E1.

> **2026-09-23 — ce qui a avancé, sans fermer P1.1.** SE 2020 a été relu page
> par page sur l'image (`docs/RELECTURE_SE_2020_CHECKLIST.md`, deux passes) et
> ses 17 consignes recopiées mot à mot (`docs/PLAN_SE_2013_2020.md`, journal de
> Phase 3). Le compte de consignes officielles reste **277** : 2020 échange des
> pôles entre exercices, n'en certifie aucun de plus. Le critère 2 (liste
> exhaustive) et le critère 7 (`complete`) ne sont **pas** satisfaits : un
> exercice imprimé porte souvent deux ou trois consignes pour quatre pôles, et
> sept cadrages n'ont aucune phrase imprimée. Les inventaires 2020 restent
> `partial`, `p1:check` reste rouge. Rien ici ne s'assouplit.
>
> **Même date — SE 2019, second résultat du plan.** Les 9 pages du livret ont
> été relues deux fois sur image (`docs/RELECTURE_SE_2019_CHECKLIST.md`) et les
> **17 consignes officielles** recopiées mot à mot (`docs/PLAN_SE_2013_2020.md`,
> journal SE 2019). Le total passe donc de 277 à **294** pôles `official` et le
> besoin en copies de 4 155 à **4 410** (15 par pôle). Ce n'est pas 2020 qui a
> fait bouger le compte : 2020 échangeait des pôles entre exercices sans en
> certifier un de plus. Ici, 2019 certifie — et les six exercices de l'année
> étaient encodés sur d'autres thèmes que les pages imprimées, donc la
> certification a exigé une réécriture complète, pas une retouche. Le critère 2
> (liste exhaustive) et le critère 7 (`complete`) restent **non satisfaits** :
> sept cadrages de 2019 n'ont aucune phrase imprimée autonome, les inventaires
> 2019 sont `partial`, `p1:check` reste rouge. Aucun critère n'est déplacé.
>
> **2026-09-24 — SE 2016, troisième résultat du plan.** Les 10 pages du livret
> ont été relues deux fois sur image (`docs/RELECTURE_SE_2016_CHECKLIST.md`,
> passes du 2026-09-23) puis l'encodage a été revérifié sur l'image le
> 2026-09-24 (`docs/PLAN_SE_2013_2020.md`, journal SE 2016). **18 consignes**
> sont désormais recopiées mot à mot, et les deux erreurs de barème relevées à
> l'impression (`التمرين الثالث: (07 نقاط)` sur les deux sujets) sont
> corrigées : S1-E3 et S2-E3 passent de 8 à 7 points, les deux sujets
> totalisent 20 points. Le total passe donc de 294 à **312** pôles `official`
> et le besoin en copies de 4 410 à **4 680** (15 par pôle). Ce n'est pas un
> assouplissement : le dénominateur suit le nombre réel de consignes
> officielles, il ne baisse jamais. Le critère 2 (liste exhaustive) et le
> critère 7 (`complete`) restent **non satisfaits** : les six pôles N de 2016
> n'ont aucune phrase imprimée de cadrage, douze pôles regroupent plusieurs
> consignes imprimées, les inventaires 2016 restent `partial` et `p1:check`
> reste rouge.

## P1.5 — corpus humain

Le périmètre numérique actuel contient 312 pôles dont la consigne est marquée officielle (213 jusqu'au 2026-09-19 ; +48 par la structuration OCR des Maths 2013–2015 + 2017 استثنائية ; +16 par celle de SE 2021, le 2026-09-20 ; +17 par la relecture image de SE 2019, le 2026-09-23 ; +18 par la relecture image de SE 2016, le 2026-09-24). La politique exige au minimum 15 copies par pôle : **4 680 réponses réelles** au minimum, chacune avec :

- consentement et anonymisation vérifiables ;
- transcription fidèle ;
- deux corrections indépendantes, aveugles l'une à l'autre et au moteur ;
- arbitrage en cas d'écart matériel ;
- manifeste d'audit et empreintes SHA-256 contrôlés par une troisième personne.

Les quatre catégories (`strong`, `weak`, `scientifically-wrong`, `off-topic`) doivent apparaître pour chaque pôle. Même avec cette couverture, la promotion numérique reste refusée si un seuil échoue :

- MAE normalisée > 15 % ;
- biais normalisé absolu > 5 % ;
- faux positifs > 10 % ;
- faux négatifs > 10 % ;
- désaccord intercorrecteurs normalisé > 15 %.

## Commandes de contrôle

```bash
npm run coverage:official
npm run calibration
npm run calibration:check
npm run p1:status
npm run p1:check # doit échouer aujourd'hui
```

Ne jamais contourner le dernier échec en abaissant les seuils après observation des résultats, en dupliquant une copie, en inventant un correcteur ou en promouvant un inventaire partiel.
