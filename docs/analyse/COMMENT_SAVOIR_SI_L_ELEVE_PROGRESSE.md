# Comment savoir, **dans l'application**, qu'un élève apprend

> Sprint 63. Guide pratique : où regarder, quel chiffre lire, ce qu'il prouve,
> et ce qu'il faut faire ensuite. Chaque signal cité existe dans le code et est
> couvert par la suite de tests.

---

## Les six signaux, du plus faible au plus fort

| # | Signal | Où le lire | Ce qu'il prouve | Ce qu'il ne prouve **pas** |
|---|---|---|---|---|
| 1 | XP, série de jours, minutes | تقدمي (haut) | de la régularité | rien sur l'apprentissage |
| 2 | Tâches du plan cochées | خطة المراجعة | que le programme est suivi | que quelque chose est retenu |
| 3 | Score des QCM | fin de quiz | de la **reconnaissance** | qu'il saura rédiger |
| 4 | Schémas refaits de mémoire | ارسم من الذاكرة (score /16) | de la **restitution active** | qu'il saura l'exploiter |
| 5 | **Réponses rédigées** | ما كتبته أنا | de la **production** — rare et coûteuse | que le fond est juste |
| 6 | **Évolution de la forme dans le temps** | هل أتقدّم فعلاً؟ | **l'apprentissage lui-même** | le niveau scientifique |

**Le seul signal qui réponde vraiment à la question est le n° 6.** Les cinq
autres sont des conditions, pas des preuves.

---

## Le signal n° 6, en détail : « هل أتقدّم فعلاً؟ »

Écran **تقدمي**, panneau en bas.

### Ce qui est calculé

Pour chaque famille de consigne (حلّل, فسّر, اكتب في نص علمي…), on compare le
**taux d'exigences de forme satisfaites** entre la **première moitié** et la
**seconde moitié** des réponses rédigées.

### Comment lire le verdict

| Ce qui s'affiche | Signification | Action recommandée |
|---|---|---|
| « اكتب N أجوبة أخرى… أي حكم يكون تخميناً » | moins de 6 rédactions | faire écrire, rien d'autre |
| « تقدّم واضح: +X نقطة مئوية » | la forme s'améliore réellement | passer à une consigne plus exigeante |
| « مستواك مستقرّ عند X٪ » | ni progrès ni recul | choisir **une** exigence ratée et la travailler seule |
| « تراجع بـ X نقطة » | la forme se dégrade | vérifier s'il est passé à des consignes plus dures ; sinon, revoir « ما تنساه غالباً » |
| « لم تكتب أي جواب في … رغم أنها تمثّل X٪ » | **angle mort** | imposer deux rédactions dans cette unité |

### Les seuils, et pourquoi ils existent

- **6 rédactions minimum** pour un verdict : en dessous, le hasard domine ;
- **± 5 points** de variation pour parler de tendance : en deçà, c'est du bruit ;
- **4 rédactions** dans une famille pour la juger séparément.

Ces seuils sont dans le code et testés. L'application **refuse de féliciter**
tant qu'ils ne sont pas atteints — c'est délibéré : un tableau de bord qui
félicite tout le monde ne sert personne.

---

## Le raccourci pour un professeur ou un parent

Écran **أفكار التمارين** → **راجع ما كتبته** → **تقرير للأستاذ** → imprimer.

La feuille A4 contient désormais quatre blocs :

1. combien de réponses, sur quels sujets officiels, combien de mots ;
2. **« هل تتحسّن بنية أجوبته؟ »** — le verdict et la tendance par consigne *(ajout du sprint 63)* ;
3. les unités travaillées ;
4. ce qui manque le plus souvent.

Et une ligne qui évite tout malentendu :
> **هذا التقرير لا يحمل أي علامة.**

---

## Les trois questions à se poser devant l'écran

1. **Écrit-il ?** Si « réponses rédigées » reste à 0, aucun autre chiffre ne
   compte. C'est le seuil où l'app cesse d'être consultée pour être utilisée.
2. **Écrit-il là où ça rapporte ?** Le bloc de couverture confronte son travail
   au poids réel des unités (U4 20 %, U1 18,6 %, U5 18,6 %…). Un élève peut
   travailler beaucoup et mal viser.
3. **Écrit-il mieux qu'avant ?** C'est le verdict. S'il est « stable » depuis
   trois semaines, le problème n'est pas la quantité de travail mais sa nature :
   il refait ce qu'il sait déjà faire.

---

## Ce que l'application **ne peut pas** dire, et ne dira pas

- si une réponse est **scientifiquement juste** — le contrôle porte sur la
  forme (chiffres, unités, connecteur causal, structure) ;
- quelle **note** il aurait — aucun barème automatique n'est appliqué ;
- s'il **réussira** le BAC — la pression mesurée est une tendance sur
  11 sessions, pas une prédiction.

Ces limites sont affichées dans l'application elle-même
(« فحص شكلي فقط », « لا يحمل أي علامة »), et c'est ce qui rend le reste
crédible.
