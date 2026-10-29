# 🧭 SPEC KIT — BOUSSOLE v2 (بوصلة الإجابة · 4 خطوات + مفتاح واحد)

Kit autonome à donner à **ton agent IA dans VS Code** pour appliquer la Boussole v2
(refonte validée : audit de la v1 NSOE, `boussole_svt_v2.html`).

---

## 📦 Contenu du kit

```
spec_kit/
├── README.md                          ← ce fichier (mode d'emploi)
├── SPEC_BOUSSOLE_NSOE.md              ← spécification v2 + v2.1 (lecture + adaptation par l'agent)
├── apply_patches.sh                   ← application automatique (full ou --delta)
├── verify.sh                          ← 59 contrôles (fichiers + marqueurs v2/v2.1/correctifs + tsc + anti-mock)
├── patches/                           ← pour une base VIERGE, dans l'ordre :
│   0001 correctifs bugs + 12e verbe + Q&R méthodo
│   0002 carnet de bord + stats honnêtes
│   0003 Boussole v1 (NSOE) — historique, remplacée par la v2 en 0005
│   0004 v1 : rang + vents + rituel + onboarding
│   0005 ✅ BOUSSOLE v2 — 4 étapes + مفتاح (refonte complète de la v1)
│   0006 ✅ BOUSSOLE v2.1 — compléments de l'audit (drill mafteh, démo duo, fiche, quarts)
│   0007 ✅ CORRECTIFS assimilation — le diagnostic devient honnête (9 fixes)
│   0008 ✅ AUDIT suite — bugs forts (mocks, مفتاح périmé) + 20 vraies règles de critères
│   0009 ✅ DUEL Scoreur vs Boussole — 12/12 gabarits, 3 mines de faux positifs dégagées
└── patches_v2_delta/                  ← pour une base DÉJÀ en v1 (kit précédent) :
    0001 ✅ BOUSSOLE v2 (delta v1 → v2)
    0002 ✅ BOUSSOLE v2.1 (compléments)
    0003 ✅ CORRECTIFS assimilation (9 fixes)
    0004 ✅ AUDIT suite — bugs forts + 20 vraies règles
    0005 ✅ DUEL Scoreur vs Boussole — 12/12 gabarits
```

**Après application (full ou delta), l'état final est identique : BOUSSOLE v2.1.**
Chaque chemin a été testé : `tsc` 0 erreur + `build` OK + `verify.sh` 59/59.

---

## 🚀 Voie A — Application automatique (recommandée)

```bash
# Cas 1 : base vierge (avant toute boussole)
cd <ton-repo> && bash ../spec_kit/apply_patches.sh          # 0001 → 0005

# Cas 2 : base déjà en v1 (tu avais déjà appliqué l'ancien kit)
cd <ton-repo> && bash ../spec_kit/apply_patches.sh --delta  # seulement la v2

# Dans les deux cas :
bash ../spec_kit/verify.sh
```

**Conditions** : tout le code commité avant application ; identité git configurée (le script le fait).

## 🤖 Voie B — Ton agent IA (si un patch ne s'applique pas, ou pour comprendre/maintenir)

1. Copie `SPEC_BOUSSOLE_NSOE.md` dans le repo (`docs/`).
2. Prompt : *« Lis docs/SPEC_BOUSSOLE_NSOE.md et applique les lots manquants. Vérifie avec tsc puis build. »*
3. La spec décrit chaque lot : fichiers à créer (rôle exact), fichiers à modifier (recherche/remplace), points de vigilance, textes arabes complets.

## ✅ Résultat attendu (BOUSSOLE v2)

| Ce que voit l'élève | Détail |
|---|---|
| **4 étapes** | اِقْرَأْ · اِجْمَعْ · اِرْبِطْ · اِخْتِمْ (bleu/vert/orange/violet) — 4 questions mécaniques |
| **Un seul mafteh** | 🔑 « هل الفعل يسمح بـ«لأنّ» ؟ » — 2 familles de verbes au lieu de 12 trajets |
| **3 phrases-types** | «انطلاقًا من الوثيقة (…) نلاحظ أنّ…» · «وهذا لأنّ … وبالتالي…» · «ومنه نستنتج أنّ…» |
| **Fil d'étapes** | remplace la rose des vents ; segment 3 = lampe du مفتاح (verte ✗/barrée) |
| **Porte du مفتاح (10 s)** | une question, 2 boutons avant d'écrire (niveaux 3-4) ; choix archivé et corrigé AVANT les fautes |
| **Rapport 5 lignes** | 🔑 + 1.+ 2.+ 3.+ 4. avec remède mécanique chacun — même note, adressée |
| **Contrôles** | = les 4 étapes relues à l'envers (rien à mémoriser) · temps : quart · moitié · quart |
| **Niveaux d'aide** | مع النموذج · إكمال الفراغات · كتابة بالبطاقة · بكالوريا (chaque niveau parcourt les 4 étapes) |
| **خريطة الأخطاء (تقدمي)** | une adresse par erreur + « أولوية العلاج » (l'étape la plus faible → exercice suivant) |
| **Fiche élève** | une page arabe : 4 cases + مفتاح + auto-contrôle + règle d'or (la seule chose à consulter) |

**Retiré de l'interface** : rose des vents, gestes théâtraux (→ pouce/4 doigts), lexique marin
(vents, caps, îles…), statistique non sourcée, minutages fixes, renommage des stades en caps.
**Conservé** : nom « بوصلة », règle d'or mot pour mot, localisation des erreurs, 8 tags du correcteur
(tags + scoreur INCHANGÉS), grades نوتي/ملاح/ربان/قبطان (couche motivation, zéro mot de méthode).

### ➕ v2.1 — ce qui transforme la mémorisation en compétence (audit, « les 10 % »)
| Ajout | Composant | Ce que ça fait |
|---|---|---|
| **Micro-drill du مفتاح** | `SwitchDrillModal` | 60 s, 12 verbes en rafale : مفتوح / مغلق ? feedback immédiat (chemin)، score, relances — bouton « درّب المفتاح (60 ث) » dans le panneau |
| **Démo « même document, deux consignes »** | `SwitchDuoDemo` | courbe de glycémie SVG + tableau حلّل vs فسّر : colonnes 1-2-4 identiques, étape 3 illuminée — « الفرق لا يأتي من المعرفة بل من مفتاح واحد » (audit §4) |
| **Fiche élève imprimable** | `BoussoleCardPrint` | une page arabe (4 cases + مفتاح + contrôles + temps + règle d'or), impression via `@media print` — bouton « البطاقة + طباعة » |
| **Chrono en quarts** | `QuarterTimerBar` | au niveau بكالوريا : 3 segments (25/50/25) + phase courante vécue « أنت الآن في: ٣ اربط / اكتب » — le dernier quart ne se négocie pas |

---

## ⚠️ Notes

- **Aucune modification du moteur de score** (methodologyScorer) : la boussole réadresse les 8 erreurs déjà détectées.
- Tout reste **100 % local** (localStorage).
- `patches/` contient aussi l'historique v1 (0003-0004) car elle fait partie de la trajectoire validée ;
  la v2 (0005) remplace tout hors interface. Si tu veux un historique vierge, applique seulement `--delta`
  sur une base ayant déjà reçu la v1 — ou laisse ton agent appliquer la SPEC seule.
