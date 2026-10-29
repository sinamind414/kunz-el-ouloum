# Vérification UI réelle — tranche P1-2 (rappel espacé, agenda d'ouverture)

> **Date :** 28/10/2026 · **Tranche :** P1-2, commit `34f2c73` (déjà poussé) · **Type :** vérification d'une modification déjà livrée — **aucun changement de code pendant cette vérification**.
> **Statut de ce fichier :** non commité (défaut) — commité uniquement sur demande explicite.

## Méthode

- **Cible :** code P1-2 servi par serveur de développement (`tsx server.ts`, backend SQLite) sur `http://10.0.2.2:3000`, accédé depuis l'émulateur Android (emulator-5554, 1080×2400) via le navigateur AOSP (WebView Browser Tester 124.0.6367.219). **Pas l'APK** — l'émulateur n'a pas d'APK à jour (jamais initié sans validation).
- **Pilotage :** ADB manuel (taps + capture `screencap` après chaque étape). Les coordonnées ont été relevées sur chaque capture (conversion rendu 900×2000 → appareil ×1,2).
- **ARTEMIS écarté** : deux tentatives autonomes échouées (clics à l'aveugle — le DOM n'est pas exposé à l'accessibilité par ce WebView ; agent dérivé vers YouTube, trace `49b2c0e0-3f5b-4ef4-ae8d-10059ea368fb` ; erreurs LLM 429/timeout dans les logs). Qualification : **cause outil/environnement, pas l'application** — l'app se rend et répond parfaitement en pilotage direct.

## Chaîne prouvée en situation réelle (4 maillons)

1. **« resume » → 74 résumés d'or.** Réponse du tuteur : « 📁 الملخصات الذهبية — جميع دروس المنهاج — يتوفر 74 ملخصاً يغطي 11 وحدة », étiquette source « دليل الدراسة », « الثقة: 90 % ». (Déclencheur FR accepté : `tutorGoldSummaryFlow.ts:83-98`.)
2. **Puce « ملخصات الوحدة 1 » → liste des 7 leçons** de l'unité (« اختر درساً لعرض ملخصه الذهبي »). Constat ergonomique : les lignes de leçons **dans le texte de la bulle ne sont pas cliquables** — seules les **puces quickActions sous la bulle** le sont (`formatUnitLessons` émet `quickActions: lessons.map(l => l.title)`, `tutorGoldSummaryFlow.ts:279`).
3. **Puce « الدرس 1 » → résumé doré verbatim affiché** : 🧠 سؤال المراجعة (objectif avant lecture + « أجب الآن »), 🎯 المهمة, 🔗 خطوات الفهم, 🔍 التحليل, 🔑 المفاهيم الأساسية (H-لوسين, الشبكة الهيولية الميبية…). Le clic passe par le moteur (`handleSend` → flow résumé) → **hook `smartTutorEngine.ts:2601`** → `planifierRappelPourLecon` (`src/lib/planificationRappels.ts:101`).
4. **Bouton « مهمة اليوم » → la mission servie est LE RAPPEL.** Bulle « 🔁 مراجعة موعدة » (chaîne exacte : `smartTutorEngine.ts:3023`) avec la question : *« لماذا استعمل العلماء الأحماض الأمينية المشعة تحديدا في هذه التجربة؟ »* = **stage 0**, concept `phase1_chapitres_1_2` (`src/data/spacedRecallPromptsAuto.ts:121`) — exactement le concept du résumé d'or ouvert. localStorage SRS vierge (scénario premier contact) → rappel aussitôt dû, servi en tête de mission **avant** toute mission de domaine et tout QCM.

Conclusion : la chaîne **ouverture d'un résumé d'or → programmation SM-2 → mission du jour qui sert le rappel dû** fonctionne en situation réelle, pas seulement dans les tests.

---

## Annexe (29–31/10/2026) — notation de la réponse libre vérifiée en UI : les DEUX branches

> Complément exécuté les 29–31/10 (horloge émulateur décalée par `adb root` + `date` pour franchir les jours ; clavier **ADBKeyboard** installé/activé comme IME, injection de texte arabe par broadcast **`ADB_INPUT_B64`** — l'action `ADB_INPUT_TEXT` se fait casser par les espaces du shell côté appareil, constaté : `pkg=العلماء` dans la confirmation du broadcast, un seul mot transmis).

### Chaîne prouvée (suite)

5. **Persistance réelle après reboot** : la session SRS (`localStorage`) et la mission en attente ont survécu à l'extinction/relance de l'émulateur (snapshot) — la question « 🔄 مراجعة موعدة » était toujours servie, XP=0 confirmant l'absence de toute mission close.
6. **Fermeture de mission par la branche notateur prouvée** : un envoi traverse la notation (composition + `completeDailyMission` + persistance) → « ✅ لقد أنجزت مهمة اليوم بنجاح ! » au jour suivant.
7. **Branche échec (`noterReponseLibre` → q<minEvidence)** : question servie « في أي اتجاه يُركَّب ARNm؟ » (concept ARNm, planifié le 28/10 par le hook d'ouverture du résumé d'or — second concept de la file, servi « متأخرة 1 يوم » par le tri SM-2 : le service du concept le plus en retard fonctionne). Réponse hors-sujet « xyz » envoyée → verdict **« ⚪ لم تكتمل الإجابة — سأعيد السؤال قريباً (الذاكرة تحتاج محاولات). »** + affichage des preuves attendues masquées 🔒 (« ARN • ADN بوليميراز • السلسلة القالبية • ARNm • البوراسيل • النواة ») + invitation à reformuler → re-planification SM-2 courte (concept resservi « متأخرة 1 jour » au day+1).
8. **Branche réussite (q≥minEvidence)** : question servie « لماذا استعمل العلماء الأحماض الأمينية المشعة تحديداً في هذه التجربة؟ » (concept H-لوسين `phase1_chapitres_1_2`, minEvidence 2 sur 6 preuves). Réponse arabe correcte injectée (³H-لوسين → الريبوزومات → الشبكة الهيولية المحببة → جهاز غولجي, via `inject-reponse-rappel-b64.mjs`) → verdict **« ✅ صَح — استرجاع صحيح. أعيدها عليك غداً. »** + « 🗓️ التقييم محفوظ في منظم المراجعات (SM-2). » + confiance « 90% ».

**Conclusion renforcée** : la boucle SM-2 complète en UI réelle — question → saisie (arabe ou ASCII) → notateur `noterReponseLibre` sur les preuves du corpus → verdict honnête échec/réussite → indices pédagogiques → re-planification → mission clôturée — est prouvée **sur ses deux branches**, et survit aux redémarrages.

### Écarts constatés (non bloquants, à qualifier)

1. **XP resté à 0** pendant toute la session malgré « ✅ لقد أنجزت مهمة اليوم بنجاح » et le verdict réussite — la hausse d'XP n'a jamais été observée en UI. À investiguer (calcul côté notateur ? affichage ? condition mission-close ?).
2. **Question servie ≠ dernier concept planifié** : la mission du 30/10 a servi ARNm (« في أي اتجاه »), celle du 31/10 a servi H-لوسين (« لماذا استعمل ») — cohérent avec un tri sur les dus/en-retard parmi les 2 concepts planifiés (rotation), mais l'ordre exact du tri n'a pas été audité dans `planificationRappels.ts` à cette occasion.

### Limites mises à jour

1. ~~Notation de la réponse libre non testée sur appareil~~ → **levée** : les deux branches sont vérifiées en UI (échec `xyz`, réussite arabe complète).
2. Un seul concept noté par branche (H-لوسين en réussite, ARNm en échec) ; les autres concepts restent couverts par le verrou données, pas visuellement.
3. Émulateur + navigateur AOSP + saisie par ADBKeyboard (broadcast) — pas l'APK, pas un vrai doigt/clavier. Les conditions APK restent non vérifiées.
4. Horloge émulateur décalée (28→31/10) pour franchir les jours — restaurée à l'heure réelle en fin de session ; les dates affichées dans les captures reflètent ce décalage.

## État environnement après vérification

- Serveur dev arrêté (port 3000 libéré, pid 10116 terminé).
- Captures `screen*.png` supprimées.
- Branche `master` au commit `34f2c73` — working tree propre côté tranche.
- Émulateur éteint à l'issue (sur demande).
- Dossiers concurrents non trackés intacts (« CREATION MONTRE XWATCH/ », « Python/ », « Rebrique-sujet-BAC-main/ », `licences-pg-2026-10-23.csv`, `marketing/SCRIPTS_LANCEMENT_GENZ.md`) — non commités.
