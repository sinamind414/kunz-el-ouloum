# Checklist de relecture humaine — BAC 2022 (PR #10, SHA `5b8a2c3`)

**Relecteur attendu : le propriétaire (professeur de SVT).**
Document de référence : [PDF ONEC via dzexams](https://www.dzexams.com/uploads/sujets/officiels/bac/2022/dzexams-bac-sciences-2311208.pdf)
— Sujet 1 : pp. 1-5 · Sujet 2 : pp. 6-10 · Corrigé officiel (الإجابة النموذجية) : pp. 11-21.
Seconde source corrigé : [eddirasa](https://eddirasa.com/correction-bac-science-2022-se/).

Mode d'emploi : pour chaque ligne `official`, comparer mot à mot le `bacPrompt` avec la question
du PDF à la page indiquée. Pour chaque ligne `reconstructed`, vérifier seulement que la reformulation
est fidèle au sens du sujet/corrigé (pas de comparaison mot à mot possible). Cocher ✅ ou noter la
correction à apporter.

---

## ⚠️ Anomalies détectées AVANT ta relecture (vérification automatique)

Ces trois points ont été détectés mécaniquement sur le texte de la branche. À trancher en priorité :

### A1 — « اللادوات » au lieu de « اللاذات » (10 occurrences, S1-E1)

Le terme du programme SVT est **اللاذات** (le non-soi). « اللادوات » n'est pas un mot — c'est
très probablement une déformation OCR de la couche texte inversée (ذ → د + و parasite).
Le fichier contient les DEUX orthographes (3× اللاذات, 10× اللادوات), ce qui est incohérent en soi.
**Occurrences uniquement dans les champs d'affichage (desc, prompt, bacPrompt, notes) — aucun
impact sur le matching, mais les élèves verront ce mot déformé à l'écran.**

- [ ] Confirmer sur le PDF p.1 : le sujet officiel écrit-il اللاذات ? → si oui, correction globale requise.

### A2 — « كسمه » dans une note de provenance (probable « أكسبه »)

Dans `bacPromptNotes` de S1-E1-N, la citation du préambule contient « كسمه قدرة التمییز » —
probablement « أكسبه قدرة التمييز » déformé par l'OCR. Champ non affiché aux élèves, mais la
citation prétend être une lecture du PDF.

- [ ] Vérifier le préambule p.1 et corriger la citation si besoin.

### A3 — Caractères persans dans le texte arabe (101 occurrences dans le bloc 2022)

Le bloc 2022 contient 101 fois le **yeh persan ی (U+06CC)** au lieu du yeh arabe ي (U+064A) —
ex. « الهیولي », « الجینتامسین ». Résidu direct de la couche OCR. Vérifié : **aucune occurrence
dans les champs de matching (keywords/modelAnswer/wrongConcepts) du bloc 2022**, donc pas
d'impact sur le moteur pour 2022 — mais c'est typographiquement incorrect à l'écran.

⚠️ En revanche, **3 lignes `keywords` préexistantes (années antérieures, lignes ~496, 521, 677 :
« الخلایا », « العصبیه », « فرضیه/انزیم ») contiennent ce yeh persan dans des champs de MATCHING**,
et `normalizeArabic` ne convertit pas U+06CC → ي. Un élève qui tape le yeh arabe normal ne
matchera jamais ces mots-clés. **Bug préexistant, pas introduit par la PR #10, mais réel.**

- [ ] Décision : normaliser ی→ي partout (recommandé — voir prompt Antigravity, tâche T2).

---

## Sujet 1 — Exercice 1 (5 pts) : الغشاء الهيولي والتمييز بين الذات واللاذات
PDF p.1 · corrigé pp.11-12

| Pôle | Source | Consigne encodée | OK ? |
|---|---|---|---|
| N (1pt) | reconstructed | المشكل: كيف يحدد الغشاء الهیولي ذات الخلية ويتعرف على اللادوات انطلاقا من مكوناته البروتينية؟ ⚠️ A1 | [ ] |
| S (1pt) | **official** | صف بنية الغشاء الهیولي واذكر مميزات مكوناته. | [ ] |
| E (2pt) | **official** | وضح في نص علمي مهيكل ومنظم دور مختلف مكونات الغشاء الهیولي المتدخلة في تحديد الذات والتعرف على اللادوات انطلاقا مما تقدمه الوثيقة واعتمادا على معلوماتك. ⚠️ A1 | [ ] |
| W (1pt) | reconstructed | ما الدور الحاسم للبروتينات الغشائية في قدرة الخلية على التمييز بين الذات واللاذات؟ | [ ] |

## Sujet 1 — Exercice 2 (7 pts) : مناطق التشابك في النخاع الشوكي (الغلوتامات / GABA)
PDF p.2 · corrigé pp.12-13

| Pôle | Source | Consigne encodée | OK ? |
|---|---|---|---|
| N (1pt) | reconstructed | المشكل: كيف تؤمن البروتينات الغشائية على مستوى مناطق التشابك في النخاع الشوكي تقلص العضلة واسترخائها (المنعكس العضلي)؟ | [ ] |
| S (2,5pt) | **official** | بيّن باستغلالك لنتائج الشكل (ب) العلاقة بين أنواع المشابك الممثّلة في الشكل (أ) والمبلغات العصبية المدروسة. | [ ] |
| E (2,5pt) | **official** | اشرح كيف تتدخّل البروتينات الغشائية على مستوى المشابك في كبح وصول الرسالة العصبية إلى العضلة وتأمين استرخائها وذلك باستغلال معطيات الشكل (ب) من الوثيقة (2). | [ ] |
| W (1pt) | reconstructed | ما أثر تثبيط GABA على مستوى المشابكين (ع1-ع2) و(ع2-ع3) على الرسالة العصبية الموجهة إلى العضلة؟ | [ ] |

## Sujet 1 — Exercice 3 (8 pts) : الجينتاميسين وانحلال البشرة الفقاعية
PDF pp.3-5 · corrigé pp.13-15 · ⚠️ A3 : orthographe « الجینتامسین » (yeh persan + squelette à confirmer sur le PDF)

| Pôle | Source | Consigne encodée | OK ? |
|---|---|---|---|
| N (0,5pt) | **official** | اقترح فرضية وجيهة تسمح بتحديد طريقة تأثير الجینتامسین اعتمادا على معطيات الشكل (د) من الوثيقة (1). | [ ] |
| S (2pt) | **official** | بيّن تأثير المعالجة بالجینتامسین ضد البكتيريا وعلى الشخص المصاب مبرزا المشكل المطروح وذلك باستغلال منهجي للأشكال (أ، ب، ج) من الوثيقة (1). | [ ] |
| E (4pt) | **official** | وضح باستغلال معطيات الوثيقة (2) طريقة تأثير الجینتامسین مصادقا على صحة الفرضية المقترحة. | [ ] |
| W (1,5pt) | **official** | برّر انطلاقا مما توصلت إليه من هذه الدراسة الاهتمامات المتزايدة بالمضاد الحيوي الجینتامسین (gentamicine) في الأساليب العلاجية. | [ ] |

## Sujet 2 — Exercice 1 (5 pts) : السيانور وكمون الراحة
PDF p.6 · corrigé p.16

| Pôle | Source | Consigne encodée | OK ? |
|---|---|---|---|
| N (1pt) | reconstructed | المشكل: كيف تؤثر مادة السّيانور (المانعة لتركيب ATP) على الكمون الغشائي للليف العصبي أثناء الراحة؟ | [ ] |
| S (1pt) | **official** | حدّد مصدر كمون الراحة. | [ ] |
| E (2pt) | **official** | اشرح مستعينا بالوثيقة واعتمادا على معلوماتك في نص علمي منظم ومهيكل، كيفية تأثير مادة السّيانور على الكمون الغشائي للليف العصبي أثناء الراحة. | [ ] |
| W (1pt) | reconstructed | ما الخطر الصحي لمادة السّيانور على الإنسان من خلال تأثيرها على كمون الراحة؟ | [ ] |

## Sujet 2 — Exercice 2 (7 pts) : α-amanitine ودواء ATAC
PDF pp.6-8 · corrigé pp.16-18

| Pôle | Source | Consigne encodée | OK ? |
|---|---|---|---|
| N (1pt) | reconstructed | المشكل: كيف تؤثر مادة (α-amanitine) على تركيب البروتين، وكيف يستغل الباحثون خاصيتها في علاج بعض الأورام السرطانية؟ | [ ] |
| S (2,5pt) | **official** | وضّح كيفية تأثير مادة (α-amanitine) على تركيب البروتين باستغلالك لشكلي الوثيقة (1). | [ ] |
| E (2,5pt) | **official** | اشرح آلية تأثير دواء (ATAC) على الخلايا السرطانية مبرزا دور الأجسام المضادة في ذلك، انطلاقا من استغلال معطيات الوثيقة (2). | [ ] |
| W (1pt) | reconstructed | ما النتيجة العلاجية لتوقف النسخ في الخلايا السرطانية بواسطة الدواء ATAC؟ | [ ] |

## Sujet 2 — Exercice 3 (8 pts) : غاز الميثان والمكمل الغذائي 3-NOP
PDF pp.8-10 · corrigé pp.18-20 · rappel : la partie 1 était partiellement illisible (S en `reconstructed`)

| Pôle | Source | Consigne encodée | OK ? |
|---|---|---|---|
| N (0,5pt) | reconstructed | المشكل: كيف يمكن استغلال خصائص أنزيم M (وخلطائه) للتقليل من انبعاث غاز الميثان (CH₄) دون الإضرار بالتفاعلات الهضمية للأبقار؟ | [ ] |
| S (2pt) | reconstructed | بيّن أن التفاعلات الهضمية تفضي إلى إنتاج غاز الميثان أثناء الاجتراء باستغلال الأشكال (أ) و(ب) من الوثيقة (1). | [ ] |
| E (4pt) | **official** | وضّح تأثير المكمل الغذائي (3-NOP) على إنتاج وانبعاث غاز (CH₄) ما سمح بالمصادقة على الفرضية المقترحة مستغلا معطيات أشكال الوثيقة (2). | [ ] |
| W (1,5pt) | **official** | لخّص في مخطط الآلية التي تسمح بالتقليل من التلوث بغاز (CH₄) دون الإضرار بالتفاعلات الهضمية للأبقار. | [ ] |

---

## Signature de relecture

- Relu par : ______________  Date : ______________
- Corrections demandées (liste ou « aucune ») : ______________
- Pendant la relecture, jeter aussi un œil aux `keywords` de chaque pôle 2022 : correspondent-ils
  aux éléments valorisés par le corrigé officiel (pp. 11-21) ?

Une fois cette checklist remplie, transmettre les corrections à la session Antigravity
(voir `docs/NEXT_SESSION_PROMPT.md`, tâche T1) qui les appliquera puis mergera la PR #10.
