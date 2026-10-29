# Qualification des échecs ARTEMIS — vérification UI mobile

> **Date :** 28/10/2026 · **Type :** qualification d'échecs d'OUTIL (pas de l'application) · **Statut :** non commité (défaut).
> Périmètre : l'agent mobile autonome ARTEMIS (modèle Flash) a échoué à exécuter seul le flux de vérification UI de la tranche P1-2 ; le pilotage ADB manuel du même flux a réussi intégralement (voir `verification-ui-p1-2-rappel-espaces-2026-10-28.md`).

## Contexte et méthode

- **Appareil :** émulateur Android emulator-5554 (1080×2400), navigateur AOSP « WebView Browser Tester 124.0.6367.219 », app Web servie sur `http://10.0.2.2:3000` (serveur dev local).
- **Objectif confiné aux tâches :** navigation splash → accueil → tuteur → tape « الملخصات » → unité 1 → leçon 1 → vérifier les sections du résumé doré (🎯 المهمة / 🔗 خطوات الفهم / 🧠 سؤال المراجعة), puis mission de rappel.
- **Sources examinées :** traces ARTEMIS du jour (`C:\Users\zakaria\Documents\tools\artemis\traces\`), fichiers `status.json` et `recording.json`, journaux d'étapes en replay, captures `mobile_get_device_state`, et 4 répertoires d'échec antérieurs (23/10/2026).

## Faits relevés (preuves)

1. **Arbre d'accessibilité aveugle pour le contenu web.** Les correspondances de hiérarchie dans la trace `49b2c0e0` ne contiennent que des nœuds système : `com.android.launcher3:id/{back,home,recent_apps}`, `com.android.systemui:id/clock`, notifications — **aucun nœud du WebView**. Le navigateur AOSP n'expose pas le DOM à l'accessibilité.
2. **La tâche du jour 1 a échoué autrement** (`status.json:10`, trace `90d5918d`, 21:00:44→21:07:40) : « Process terminated prior to server startup. »
3. **La tâche du jour 2 a dérivé puis échoué** (trace `49b2c0e0`, 21:07:40, 321,6 s) : l'agent a tapé en coordonnées normalisées [500,890] puis [300,970] (étapes 1 et 3, T+11 s/T+02:09) en raisonnant sur les captures ; à l'issue, **l'appareil était sur YouTube** (capture post-échec). Erreur terminale : « TimeoutError: LLM call timed out after 180 seconds. » (`status.json:10`, `notifications.jsonl`).
4. **Étapes de raisonnement documentées** : à l'étape 1, l'agent visait le CTA « ابدأ رحلة التعلم » à [500,890] en coordonnées normalisées, mais a justifié son choix par l'élément « le plus proche » « التمارين والتدريب » [500,865][665,935] — deux zones différentes identifiées, cible ambigüe, tap quand même.
5. **Quota LLM épuisé pendant l'exécution** : `replay/data/90d5918d.../step_07/traces.json` (28/10) et `step_19` de la trace `58269a78` (23/10) : répétées « ClientError: 429 » — `RESOURCE_EXHAUSTED`, `generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5` (gemini-2.5-flash, free tier, « retry in 20.3 s »). Décalage « retry telemetry » tronqué dans les logs.
6. **Historique d'échecs répétés** : 4 répertoires `_FAIL` du 23/10 (3 tâches web + 1 tâche mobile) + 2 du 28/10 ; et à l'inverse, `mobile_diagnose` avait renvoyé **ready (5/5)** au début de session — l'environnement appareil est jugé sain par l'outil lui-même.
7. **Preuve d'enregistrement** : `recording.mp4` (20,5 Mo, 306 s) pour la trace `49b2c0e0` — l'échec est rejouable visuellement.

## Interprétation (faits ⇢ causes)

- **Cause confirmée n°1 — visibilité :** le contenu Web n'est pas dans l'arbre d'accessibilité ; l'agent ne peut donc PAS cibler autrement que par des coordonnées devinées sur capture. Tous les ratés documentés (étape 1, ambiguïté CTA/onglet) s'expliquent par là. Ce n'est **pas** un défaut de l'application : l'app répond parfaitement en pilotage direct ADB.
- **Cause confirmée n°2 — capacité LLM :** quota free tier 5 req/min + timeout 180 s ; une tâche multi-étapes épuise le quota et stalle l'agent en pleine tâche.
- **Mécanisme exact du basculement vers YouTube : cause indéterminée** — les étapes tardives (> 3) n'ont pas été décortiquées une à une ; hypothèse la plus plausible : tap hors-cible interprété par l'arbre launcher-only (recents/home) ou geste système — à départager par relecture vidéo (`recording.mp4`) si nécessaire. Sans relecture, cette cause reste une hypothèse.
- L'échec ARTEMIS **ne requalifie en rien** l'app : le même flux exécuté manuellement (méthode ADB, captures successives) a réussi et donné une preuve UI complète de P1-2.

## Limites de cette qualification

1. L'inspection des étapes tardives de `49b2c0e0` n'est pas exhaustive (recherche par mots-clés, pas relecture pas-à-pas des ~10 étapes) ; la séquence exacte menant à YouTube n'est donc pas établie.
2. Les échecs du 23/10 (3 `web_*`) n'ont pas été ré-audité un à un ; seuls les schémas d'erreur (429 documenté, FAIL répétés) sont cités.
3. L'état ARTEMIS (versions, config LLM effective) n'a pas été comparé à une version antérieure fonctionnelle — aucune « régression » n'est revendiquée pour l'outil : pas de comparaison étayée disponible.
4. Une seule app/web cible a été testée ; l'incapacité au DOM n'est documentée que pour « WebView Browser Tester 124.0.6367.219 » sur cet émulateur.

## Actions priorisées (recommandations — toute exécution demandera validation)

1. **Continuer le pilotage ADB manuel** pour les vérifications UI de cette app : méthode prouvée (14 captures, flux complet sans dérive). Le scripter légèrement (taps fichier + captures automatiques) suffirait.
2. **Installer un navigateur exposant l'accessibilité** (Chrome stable au lieu du WebView Browser Tester) dans l'émulateur, et idéalement tester directement l'**APK signé** (vues natives mieux exposées) — cela supprimerait la cause n°1. Aucun APK étant encore construit, c'est conditionné à cette décision.
3. **Augmenter le quota Gemini (palier payant)** ou réduire la fréquence d'appels modèle d'ARTEMIS (moins d'étapes par tour, budget accru) ; sinon **limiter ARTEMIS à des tâches courtes** (≤ ~5 tours, une seule navigation) avec sondes `mobile_manage_task` rapprochées.
4. **Instantané d'émulateur minimal** : snapshot sans YouTube et applications distrayantes installées, pour rendre toute dérive sans conséquence.
5. Si la dérive YouTube doit être élucidée : relecture de `recording.mp4` (20,5 Mo, traces ` ...\task_49b2c0e0-..._FAIL_...`).
