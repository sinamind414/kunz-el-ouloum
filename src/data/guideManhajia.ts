// guideManhajia.ts — GÉNÉRÉ par scripts/build_guide_manhajia.ts — NE PAS ÉDITER À LA MAIN.
// الدليل العام للمنهجية : guide fusionné de méthodologie SVT BAC 3AS.
// Source : GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md (racine du dépôt) — parser couvrant titres, listes,
// cases à cocher, citations et tableaux Markdown.
// Verrou : src/data/guideManhajia.lock.test.ts.

import type { IconeCle } from './lessonIcons';

export type KindGuide = 'titre' | 'point' | 'puce' | 'note' | 'texte' | 'tableau';

export interface BlocGuide {
  kind: KindGuide;
  /** Numéro d'une liste ordonnée (bloc « point »). */
  num?: string;
  texte: string;
  /** Profondeur d'un titre : 2 = « ### », 3 = « #### ». */
  niveau?: number;
  /** Bloc « tableau ». */
  entetes?: string[];
  lignes?: string[][];
  /** Ancre cliquable (table des matières) → id de section. */
  cible?: string;
}

export interface SousGuide {
  id: string;
  titre: string;
  /** Index du premier bloc (inclus) dans section.blocs. */
  from: number;
}

export interface SectionGuide {
  id: string;
  titre: string;
  icone: IconeCle;
  blocs: BlocGuide[];
  sous?: SousGuide[];
}

/** Titre du document (# de la source). */
export const GUIDE_TITRE = "📘 GUIDE FUSED — Méthodologie SVT BAC 3AS Sciences Expérimentales";

export const GUIDE_SECTIONS: SectionGuide[] = [
  {
    "id": "sommaire",
    "titre": "TABLE DES MATIÈRES",
    "icone": "Grid3x3",
    "blocs": [
      {
        "kind": "point",
        "num": "1",
        "texte": "Introduction — Pourquoi ce guide ?",
        "cible": "s1"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "Le nouveau format du BAC depuis 2017",
        "cible": "s2"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "Typologie complète des verbes d'action",
        "cible": "s3"
      },
      {
        "kind": "puce",
        "texte": "3.1 Verbes simples (mobilisation des connaissances)",
        "cible": "s3"
      },
      {
        "kind": "puce",
        "texte": "3.2 Verbes d'analyse et d'interprétation",
        "cible": "s3"
      },
      {
        "kind": "puce",
        "texte": "3.3 Verbes de raisonnement scientifique (Exercice 3)",
        "cible": "s3"
      },
      {
        "kind": "puce",
        "texte": "3.4 Tableau de reconnaissance rapide",
        "cible": "s3"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Structure de la réponse — Les deux approches",
        "cible": "s4"
      },
      {
        "kind": "puce",
        "texte": "4.1 La structure en 3 parties",
        "cible": "s4"
      },
      {
        "kind": "puce",
        "texte": "4.2 La méthode d'analyse de document",
        "cible": "s4"
      },
      {
        "kind": "puce",
        "texte": "4.3 La méthode du schéma fonctionnel",
        "cible": "s4"
      },
      {
        "kind": "point",
        "num": "5",
        "texte": "Méthode par exercice — Types 1, 2, 3",
        "cible": "s5"
      },
      {
        "kind": "puce",
        "texte": "5.1 Exercice 1 (5 pts) — Récupération et organisation",
        "cible": "s5"
      },
      {
        "kind": "puce",
        "texte": "5.2 Exercice 2 (7 pts) — Analyse et interprétation",
        "cible": "s5"
      },
      {
        "kind": "puce",
        "texte": "5.3 Exercice 3 (8 pts) — Démarche scientifique complète",
        "cible": "s5"
      },
      {
        "kind": "point",
        "num": "6",
        "texte": "Méthodologie de révision",
        "cible": "s6"
      },
      {
        "kind": "point",
        "num": "7",
        "texte": "Pièges à éviter",
        "cible": "s7"
      },
      {
        "kind": "point",
        "num": "8",
        "texte": "Checklist de préparation",
        "cible": "s8"
      },
      {
        "kind": "point",
        "num": "9",
        "texte": "Conclusion — Le message ultime",
        "cible": "s9"
      }
    ]
  },
  {
    "id": "s1",
    "titre": "1. INTRODUCTION — POURQUOI CE GUIDE ?",
    "icone": "Lightbulb",
    "blocs": [
      {
        "kind": "texte",
        "texte": "Deux ressources de référence ont été croisées et fusionnées pour produire ce guide unique de méthodologie SVT BAC 3AS Sciences Expérimentales."
      },
      {
        "kind": "texte",
        "texte": "Le premier ouvrage (2023) apporte :"
      },
      {
        "kind": "puce",
        "texte": "Une taxinomie systématique des verbes d'action avec définitions, niveaux (simple/composé), exercices concernés et exemples traités"
      },
      {
        "kind": "puce",
        "texte": "Une méthode détaillée d'analyse de document (étapes, mots-clés, exemples)"
      },
      {
        "kind": "puce",
        "texte": "Une coverage scientifique étendue (génétique moléculaire, biotechnologies, physiologie détaillée, immunologie, communication nerveuse)"
      },
      {
        "kind": "texte",
        "texte": "Le second ouvrage (2021), rédigé par une élève brillante (ayant obtenu une moyenne exceptionnelle au baccalauréat), apporte :"
      },
      {
        "kind": "puce",
        "texte": "Une perspective pratique et vécue sur la réussite à l'examen"
      },
      {
        "kind": "puce",
        "texte": "Des conseils de structuration de la réponse (titres, ordre, présentation)"
      },
      {
        "kind": "puce",
        "texte": "Une méthodologie de révision complète (gestion du temps, sessions, auto-évaluation)"
      },
      {
        "kind": "puce",
        "texte": "Des conseils psychologiques et motivationnels"
      },
      {
        "kind": "texte",
        "texte": "Ce guide fusion est conçu pour servir de référence méthodologique complète à tout élève de 3AS Sciences Expérimentales préparant le baccalauréat."
      }
    ]
  },
  {
    "id": "s2",
    "titre": "2. LE NOUVEAU FORMAT DU BAC DEPUIS 2017",
    "icone": "Target",
    "blocs": [
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "2.1. Répartition des points et durée"
      },
      {
        "kind": "tableau",
        "texte": "Exercice · Points · Durée estimée · Type de tâche · Verbes typiques · Exercice 1 · 5 pts · ~45 min · استرجاع، تنظيم، هيكلة (récupération + organisation) · تعرف, عرف, حدد, ذكر, عدد, رتب, صنف, ميز, وصف بنية, رسم تخطيطي · Exercice 2 · 7 pts · ~1h15 · Analyse et interprétation · تحليل, تفسير, مقارنة, مناقشة, استنتاج, علّق, أنقد, علل/برر, فسر/وضّح/بين, اشرح · Exercice 3 · 8 pts · ~2h · Démarche scientifique complète (مسعى علمي) · صياغ مشكل علني, اقتراح فرضية, التحقق من صحة, إثبات, نقاش, اكتب نصا علميا, أنجز مخططا",
        "entetes": [
          "Exercice",
          "Points",
          "Durée estimée",
          "Type de tâche",
          "Verbes typiques"
        ],
        "lignes": [
          [
            "Exercice 1",
            "5 pts",
            "~45 min",
            "استرجاع، تنظيم، هيكلة (récupération + organisation)",
            "تعرف, عرف, حدد, ذكر, عدد, رتب, صنف, ميز, وصف بنية, رسم تخطيطي"
          ],
          [
            "Exercice 2",
            "7 pts",
            "~1h15",
            "Analyse et interprétation",
            "تحليل, تفسير, مقارنة, مناقشة, استنتاج, علّق, أنقد, علل/برر, فسر/وضّح/بين, اشرح"
          ],
          [
            "Exercice 3",
            "8 pts",
            "~2h",
            "Démarche scientifique complète (مسعى علمي)",
            "صياغ مشكل علني, اقتراح فرضية, التحقق من صحة, إثبات, نقاش, اكتب نصا علميا, أنجز مخططا"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "2.2. Ce que change le nouveau format par rapport à l'ancien (BAC 2013)"
      },
      {
        "kind": "tableau",
        "texte": "Ancien format (2013) · Nouveau format (2017+) · Questions multiples imbriquées (a → b → c) · 3 exercices structurés, consignes courtes et autonomes · Documents nombreux, questions dispersées · Documents ciblés, questions précises et focalisées · Privilégie le savoir acquis · Privilégie la démarche scientifique et le raisonnement · Perte en chaîne si un point manqué · Organisation autonome, structuration de la réponse · Questions fermées surtout · Questions ouvertes et tâches complexes",
        "entetes": [
          "Ancien format (2013)",
          "Nouveau format (2017+)"
        ],
        "lignes": [
          [
            "Questions multiples imbriquées (a → b → c)",
            "3 exercices structurés, consignes courtes et autonomes"
          ],
          [
            "Documents nombreux, questions dispersées",
            "Documents ciblés, questions précises et focalisées"
          ],
          [
            "Privilégie le savoir acquis",
            "Privilégie la démarche scientifique et le raisonnement"
          ],
          [
            "Perte en chaîne si un point manqué",
            "Organisation autonome, structuration de la réponse"
          ],
          [
            "Questions fermées surtout",
            "Questions ouvertes et tâches complexes"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "2.3. Conséquences pratiques pour l'élève"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Il faut savoir structurer sa pensée — pas juste réciter des notions"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "La reconnaissance des verbes d'action est cruciale — elle dicte la nature de la réponse attendue"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "La qualité de la rédaction compte — présentation, clarté, précision terminologique"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Le schéma doit être bien pensé — pas juste une illustration, mais un outil de communication scientifique"
      }
    ],
    "sous": [
      {
        "id": "s2-h0",
        "titre": "2.1. Répartition des points et durée",
        "from": 0
      },
      {
        "id": "s2-h1",
        "titre": "2.2. Ce que change le nouveau format par rapport à l'ancien (BAC 2013)",
        "from": 2
      },
      {
        "id": "s2-h2",
        "titre": "2.3. Conséquences pratiques pour l'élève",
        "from": 4
      }
    ]
  },
  {
    "id": "s3",
    "titre": "3. TYPOLOGIE COMPLÈTE DES VERBES D'ACTION",
    "icone": "Compass",
    "blocs": [
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "3.1 Verbes simples (mobilisation des connaissances)"
      },
      {
        "kind": "texte",
        "texte": "Ces verbes appellent une réponse ciblée, directe, sans ambigüité. L'élève sait exactement ce qu'on attend."
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "A. Identification / Nommage"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Ce qu'il faut faire · Exemple d'utilisation · تعرف / سمّ / تعريف · Nommer, identifier, donner le nom exact · Donner le nom précis de l'élément demandé (structure, concept, molécule, organite) · \"سم البيانات المرقمة\", \"تعريف الإنزيم\", \"تعريف المورثة\" · ذكر عناصر · Citer les constituants · Lister brièvement les éléments sans détails excessifs · \"ذكر مراحل الانقسام\", \"ذكر عناصر التركيب الوراثي\", \"ذكر شروط التنفس\" · حدد · Identifier, délimiter, préciser · Donner précisément ce qui est demandé, sans développement excessif · \"حدد دور الضوء\", \"حدد العوامل المؤثرة\", \"حدد المشكل المطروح\" · ملحوظة / لاحظ · Observer, constater, relever · Identifier ce qui est visible dans le document, ce qu'on peut constater · \"نلاحظ que...\", \"ملاحظة المجهر\"",
        "entetes": [
          "Verbe",
          "Définition",
          "Ce qu'il faut faire",
          "Exemple d'utilisation"
        ],
        "lignes": [
          [
            "تعرف / سمّ / تعريف",
            "Nommer, identifier, donner le nom exact",
            "Donner le nom précis de l'élément demandé (structure, concept, molécule, organite)",
            "\"سم البيانات المرقمة\", \"تعريف الإنزيم\", \"تعريف المورثة\""
          ],
          [
            "ذكر عناصر",
            "Citer les constituants",
            "Lister brièvement les éléments sans détails excessifs",
            "\"ذكر مراحل الانقسام\", \"ذكر عناصر التركيب الوراثي\", \"ذكر شروط التنفس\""
          ],
          [
            "حدد",
            "Identifier, délimiter, préciser",
            "Donner précisément ce qui est demandé, sans développement excessif",
            "\"حدد دور الضوء\", \"حدد العوامل المؤثرة\", \"حدد المشكل المطروح\""
          ],
          [
            "ملحوظة / لاحظ",
            "Observer, constater, relever",
            "Identifier ce qui est visible dans le document, ce qu'on peut constater",
            "\"نلاحظ que...\", \"ملاحظة المجهر\""
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "B. Description / Structuration conceptuelle"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Ce qu'il faut faire · Exemple · وصف بنية · Décrire une structure en détail · Mentionner tous les composants, leur localisation, leur forme, leurs caractéristiques, les relations entre eux · بنية الغشاء الهيولي, بنية الإنزيم, البنية الفراغية للبروتين · صنف (Classer) · Ranger en groupes selon des critères · Donner les critères de classification, puis classer les éléments · الأغذية (حسب التركيب/الوظيفة/المصدر), الخلايا (حسب المادة الوراثية/عدد الخلايا) · ميز (Distinguer) · Opposer deux éléments · Identifier le paramètre de comparaison, puis opposer les différences de façon structurée · انقسام نباتي vs حيواني, مناعة خلطية vs خلوية, خلية نباتية vs حيوانية",
        "entetes": [
          "Verbe",
          "Définition",
          "Ce qu'il faut faire",
          "Exemple"
        ],
        "lignes": [
          [
            "وصف بنية",
            "Décrire une structure en détail",
            "Mentionner tous les composants, leur localisation, leur forme, leurs caractéristiques, les relations entre eux",
            "بنية الغشاء الهيولي, بنية الإنزيم, البنية الفراغية للبروتين"
          ],
          [
            "صنف (Classer)",
            "Ranger en groupes selon des critères",
            "Donner les critères de classification, puis classer les éléments",
            "الأغذية (حسب التركيب/الوظيفة/المصدر), الخلايا (حسب المادة الوراثية/عدد الخلايا)"
          ],
          [
            "ميز (Distinguer)",
            "Opposer deux éléments",
            "Identifier le paramètre de comparaison, puis opposer les différences de façon structurée",
            "انقسام نباتي vs حيواني, مناعة خلطية vs خلوية, خلية نباتية vs حيوانية"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "C. Énumération / Séquence / Ordonnancement"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Format attendu · اذكر (Citer) · Lister brièvement · Liste concise, ordre important si séquence temporelle ou logique · عدد (Enumérer) · Lister les étapes dans l'ordre · Séquence chronologique ou logique, numérotation recommandée · رتب / نظم · Organiser dans un ordre cohérent · Séquence ordonnée selon un critère (temporel, logique, fonctionnel)",
        "entetes": [
          "Verbe",
          "Définition",
          "Format attendu"
        ],
        "lignes": [
          [
            "اذكر (Citer)",
            "Lister brièvement",
            "Liste concise, ordre important si séquence temporelle ou logique"
          ],
          [
            "عدد (Enumérer)",
            "Lister les étapes dans l'ordre",
            "Séquence chronologique ou logique, numérotation recommandée"
          ],
          [
            "رتب / نظم",
            "Organiser dans un ordre cohérent",
            "Séquence ordonnée selon un critère (temporel, logique, fonctionnel)"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "3.2 Verbes d'analyse et d'interprétation (Exercice 1 et 2)"
      },
      {
        "kind": "texte",
        "texte": "Ces verbes appellent une organisation autonome de la réponse. L'élève doit structurer sa pensée."
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "D. Analyse des données"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Étape 1 → Étape 2 → Étape 3 → Étape 4 → Étape 5 · حلل (Analyser) · Décomposer, identifier les composantes, observer les tendances, les valeurs remarquables · تعريف الوثيقة → تفكيك المعطيات → إيجاد العلاقات → استنتاج · استخرج · Extraire l'information pertinente · Identifier ce qui est demandé → Extraire l'information clé liée au but · تحليل ثم تفسير · Combiner analyse + interprétation · D'abord décrire/identifier (analyse) → Puis expliquer le mécanisme (interprétation)",
        "entetes": [
          "Verbe",
          "Définition",
          "Étape 1 → Étape 2 → Étape 3 → Étape 4 → Étape 5"
        ],
        "lignes": [
          [
            "حلل (Analyser)",
            "Décomposer, identifier les composantes, observer les tendances, les valeurs remarquables",
            "تعريف الوثيقة → تفكيك المعطيات → إيجاد العلاقات → استنتاج"
          ],
          [
            "استخرج",
            "Extraire l'information pertinente",
            "Identifier ce qui est demandé → Extraire l'information clé liée au but"
          ],
          [
            "تحليل ثم تفسير",
            "Combiner analyse + interprétation",
            "D'abord décrire/identifier (analyse) → Puis expliquer le mécanisme (interprétation)"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "E. Interprétation / Explication"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Ce qu'il faut faire · Exemple · فسر / وضّح / بين · Clarifier, expliciter un mécanisme, établir un lien de cause à effet · Observer → Identifier la cause/effet → Expliquer en étapes logiques (cause → effet, ou étapes séquentielles) · دور اليوريدين المشع, mecanisme du transport synaptique · اشرح · Expliquer en détail · Peut être simple (explication directe) ou complexe (analyse + explication) · آلية النقل المشبكي, مبدأ التصوير الإشعاعي · تفسير النتيجة / تفسير الظاهرة · Donner le sens des données · Observer → Identifier les tendances → Expliquer le mécanisme sous-jacent (connaissances + documents) · تفسير نتائج expérimentales, تفسير آلية",
        "entetes": [
          "Verbe",
          "Définition",
          "Ce qu'il faut faire",
          "Exemple"
        ],
        "lignes": [
          [
            "فسر / وضّح / بين",
            "Clarifier, expliciter un mécanisme, établir un lien de cause à effet",
            "Observer → Identifier la cause/effet → Expliquer en étapes logiques (cause → effet, ou étapes séquentielles)",
            "دور اليوريدين المشع, mecanisme du transport synaptique"
          ],
          [
            "اشرح",
            "Expliquer en détail",
            "Peut être simple (explication directe) ou complexe (analyse + explication)",
            "آلية النقل المشبكي, مبدأ التصوير الإشعاعي"
          ],
          [
            "تفسير النتيجة / تفسير الظاهرة",
            "Donner le sens des données",
            "Observer → Identifier les tendances → Expliquer le mécanisme sous-jacent (connaissances + documents)",
            "تفسير نتائج expérimentales, تفسير آلية"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "F. Comparaison"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Structure recommandée · قارن (Comparer) · Confronter deux éléments sur un même paramètre · 1) Identifier le paramètre commun 2) Citer les ressemblances 3) Citer les différences 4) استنتاج si demandé · مقارنة منحنين / مقارنة نتائج · Comparer des données graphiques ou tabulaires · Identifier les axes, les tendances, les différences de valeurs, les points d'intersection, les paliers · مقارنة بين بنيتين / بين ظاهرتين · Confronter deux structures ou phénomènes · Identifier les caractéristiques de chacun → Établir les ressemblances et différences sous forme de tableau ou de points structurés",
        "entetes": [
          "Verbe",
          "Définition",
          "Structure recommandée"
        ],
        "lignes": [
          [
            "قارن (Comparer)",
            "Confronter deux éléments sur un même paramètre",
            "1) Identifier le paramètre commun 2) Citer les ressemblances 3) Citer les différences 4) استنتاج si demandé"
          ],
          [
            "مقارنة منحنين / مقارنة نتائج",
            "Comparer des données graphiques ou tabulaires",
            "Identifier les axes, les tendances, les différences de valeurs, les points d'intersection, les paliers"
          ],
          [
            "مقارنة بين بنيتين / بين ظاهرتين",
            "Confronter deux structures ou phénomènes",
            "Identifier les caractéristiques de chacun → Établir les ressemblances et différences sous forme de tableau ou de points structurés"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "G. Jugement / Évaluation / Argumentation"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Ce qu'il faut faire · Exemple · علّق (Commenter) · Analyser, juger, nuancer · Observation → Jugement → Justification, avantages/inconvénients, prise de position éclairée · استخدام البوتوكس, المثبطات المناعية · أنقد (Critiquer) · Évaluer de manière constructive · Avantages → Inconvénients → Avis éclairé, appuyé par des arguments solides · استخدام البوتوكس, المثبطات المناعية · علل / برر (Argumenter) · Justifier, convaincre · Arguments → Preuves (documents, connaissances) → Exemples → Avis personnel ou position · استخدام الكربون المشع · نقاش صحة / مناقشة صحة · Évaluer la validité · Confronter les arguments pour et contre → Confirmer ou infirmer avec justification",
        "entetes": [
          "Verbe",
          "Définition",
          "Ce qu'il faut faire",
          "Exemple"
        ],
        "lignes": [
          [
            "علّق (Commenter)",
            "Analyser, juger, nuancer",
            "Observation → Jugement → Justification, avantages/inconvénients, prise de position éclairée",
            "استخدام البوتوكس, المثبطات المناعية"
          ],
          [
            "أنقد (Critiquer)",
            "Évaluer de manière constructive",
            "Avantages → Inconvénients → Avis éclairé, appuyé par des arguments solides",
            "استخدام البوتوكس, المثبطات المناعية"
          ],
          [
            "علل / برر (Argumenter)",
            "Justifier, convaincre",
            "Arguments → Preuves (documents, connaissances) → Exemples → Avis personnel ou position",
            "استخدام الكربون المشع"
          ],
          [
            "نقاش صحة / مناقشة صحة",
            "Évaluer la validité",
            "Confronter les arguments pour et contre → Confirmer ou infirmer avec justification"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "3.3 Verbes de raisonnement scientifique (Exercice 3 — مسعى علمي)"
      },
      {
        "kind": "texte",
        "texte": "Ces verbes structurent la démarche scientifique complète."
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "H. Formulation du problème et hypothèse"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Processus · صياغ مشكل علني · Formuler le problème à résoudre · Identifier le but sous-jacent (لماذا؟ كيف؟ أين؟ متى؟ ما هو...) → Reformuler sous forme de question précise · اقتراح فرضية · Proposer une explication testable · Proposer une explication plausible, testable, fondée sur les données disponibles et les connaissances · اختيار فرضية · Sélectionner la plus pertinente · Choisir en fonction du réalisme, du pouvoir explicatif, de la testabilité",
        "entetes": [
          "Verbe",
          "Définition",
          "Processus"
        ],
        "lignes": [
          [
            "صياغ مشكل علني",
            "Formuler le problème à résoudre",
            "Identifier le but sous-jacent (لماذا؟ كيف؟ أين؟ متى؟ ما هو...) → Reformuler sous forme de question précise"
          ],
          [
            "اقتراح فرضية",
            "Proposer une explication testable",
            "Proposer une explication plausible, testable, fondée sur les données disponibles et les connaissances"
          ],
          [
            "اختيار فرضية",
            "Sélectionner la plus pertinente",
            "Choisir en fonction du réalisme, du pouvoir explicatif, de la testabilité"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "I. Vérification / Démonstration"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Ce qu'il faut faire · التحقق من صحة الفرضية · Vérifier si l'hypothèse est soutenue par les données · Confronter hypothèse avec les données → Confirmer ou infirmer avec justification · إثبات / تأكيد صحة · Étayer une affirmation · Arguments + Preuves (documents, connaissances) + Logique → Conclusion affirmée · نقاش · Discuter un point de vue · Analyser les arguments → Confronter les positions → Nuancer, prendre position",
        "entetes": [
          "Verbe",
          "Définition",
          "Ce qu'il faut faire"
        ],
        "lignes": [
          [
            "التحقق من صحة الفرضية",
            "Vérifier si l'hypothèse est soutenue par les données",
            "Confronter hypothèse avec les données → Confirmer ou infirmer avec justification"
          ],
          [
            "إثبات / تأكيد صحة",
            "Étayer une affirmation",
            "Arguments + Preuves (documents, connaissances) + Logique → Conclusion affirmée"
          ],
          [
            "نقاش",
            "Discuter un point de vue",
            "Analyser les arguments → Confronter les positions → Nuancer, prendre position"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "J. Production synthétique"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Définition · Format attendu · اكتب نصا علميا (Composer) · Rédiger une réponse structurée · 3 parties : مقدمة (contexte + problème) → عرض (développement argumenté, données + connaissances) → خاتمة (synthèse + réponse explicite) · أنجز مخططا تخطيطيا · Produire un schéma structuré · Structure logique + Légendes + Flèches si nécessaire + Titre · أنجز رسمًا تخطيطيًا تفسيريًا · Schéma fonctionnel avec commentaire · Montrer le mécanisme/phénomène + Légendes + Commentaire explicatif · أنجز رسمًا تخطيطيًا وظيفيًا · Schéma montrant les relations fonctionnelles · Phénomènes/étapes numérotées + Légendes + Mise en relation fonctionnelle",
        "entetes": [
          "Verbe",
          "Définition",
          "Format attendu"
        ],
        "lignes": [
          [
            "اكتب نصا علميا (Composer)",
            "Rédiger une réponse structurée",
            "3 parties : مقدمة (contexte + problème) → عرض (développement argumenté, données + connaissances) → خاتمة (synthèse + réponse explicite)"
          ],
          [
            "أنجز مخططا تخطيطيا",
            "Produire un schéma structuré",
            "Structure logique + Légendes + Flèches si nécessaire + Titre"
          ],
          [
            "أنجز رسمًا تخطيطيًا تفسيريًا",
            "Schéma fonctionnel avec commentaire",
            "Montrer le mécanisme/phénomène + Légendes + Commentaire explicatif"
          ],
          [
            "أنجز رسمًا تخطيطيًا وظيفيًا",
            "Schéma montrant les relations fonctionnelles",
            "Phénomènes/étapes numérotées + Légendes + Mise en relation fonctionnelle"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "3.4 Tableau de reconnaissance rapide des verbes"
      },
      {
        "kind": "tableau",
        "texte": "Verbe · Niveau · Exercice typique · Réponse attendue · Points clés · تعرف، سمّ، عرف، حدد، ملحوظة · Simple · 1, 2 · Réponse ciblée, directe, concise · Précision terminologique + concision · وصف بنية، ذكر عناصر، صنف، ميز · Simple · 1 · Description / Classification ciblée · Ordre, exhaustivité relative, critères si classification · ذكر، عدد، رتب، نظم · Simple · 1 · Énumération ordonnée · Respect de l'ordre si séquence · رسم تخطيطي · Simple/Composé · 1, 2, 3 · Schéma avec légendes, flèches si nécessaire, titre · Qualité du dessin + légendes complètes · حلل، قارن، مقارنة · Composé · 2 · Analyse → استنتاج · Décomposer → Identifier tendances → Établir relations → Conclure · فسر، وضّح، بين، اشرح، تفسير · Composé · 2 · Observation → Explication mécanisme · Ne pas confondre observation et explication · علّق, أنقد, علل/برر, نقاش صحة · Composé · 2 · Jugement argumenté, nuancé · Avantages + inconvénients + avis éclairé · استخرج, استنتاج · Composé · 2, 3 · Info clé liée au but · Tirer la conclusion liée au but de l'exercice · اكتب نصا علميا (Composer) · Composé · 2, 3 · 3 parties : مقدمة, عرض, خاتمة · Structure claire, titre par idée, ordre logique · أنجز مخططا / رسم تخطيطي · Composé · 1, 2, 3 · Schéma avec légendes, flèches, titre · Clarity, exhaustivité relative, justesse · صياغ مشكل علني · Composé · 3 · Question précise + but · Identifier le but sous-jacent, reformuler sous forme de question · اقتراح فرضية · Composé · 3 · Hypothèse testable, plausible, fondée · Proposer une explication testable, pas une simple affirmation · التحقق من صحة, إثبات, نقاش, أثبت · Composé · 3 · Confronter hypothèse avec données → conclure · Confronter explicitement, confirmer ou infirmer avec justification",
        "entetes": [
          "Verbe",
          "Niveau",
          "Exercice typique",
          "Réponse attendue",
          "Points clés"
        ],
        "lignes": [
          [
            "تعرف، سمّ، عرف، حدد، ملحوظة",
            "Simple",
            "1, 2",
            "Réponse ciblée, directe, concise",
            "Précision terminologique + concision"
          ],
          [
            "وصف بنية، ذكر عناصر، صنف، ميز",
            "Simple",
            "1",
            "Description / Classification ciblée",
            "Ordre, exhaustivité relative, critères si classification"
          ],
          [
            "ذكر، عدد، رتب، نظم",
            "Simple",
            "1",
            "Énumération ordonnée",
            "Respect de l'ordre si séquence"
          ],
          [
            "رسم تخطيطي",
            "Simple/Composé",
            "1, 2, 3",
            "Schéma avec légendes, flèches si nécessaire, titre",
            "Qualité du dessin + légendes complètes"
          ],
          [
            "حلل، قارن، مقارنة",
            "Composé",
            "2",
            "Analyse → استنتاج",
            "Décomposer → Identifier tendances → Établir relations → Conclure"
          ],
          [
            "فسر، وضّح، بين، اشرح، تفسير",
            "Composé",
            "2",
            "Observation → Explication mécanisme",
            "Ne pas confondre observation et explication"
          ],
          [
            "علّق, أنقد, علل/برر, نقاش صحة",
            "Composé",
            "2",
            "Jugement argumenté, nuancé",
            "Avantages + inconvénients + avis éclairé"
          ],
          [
            "استخرج, استنتاج",
            "Composé",
            "2, 3",
            "Info clé liée au but",
            "Tirer la conclusion liée au but de l'exercice"
          ],
          [
            "اكتب نصا علميا (Composer)",
            "Composé",
            "2, 3",
            "3 parties : مقدمة, عرض, خاتمة",
            "Structure claire, titre par idée, ordre logique"
          ],
          [
            "أنجز مخططا / رسم تخطيطي",
            "Composé",
            "1, 2, 3",
            "Schéma avec légendes, flèches, titre",
            "Clarity, exhaustivité relative, justesse"
          ],
          [
            "صياغ مشكل علني",
            "Composé",
            "3",
            "Question précise + but",
            "Identifier le but sous-jacent, reformuler sous forme de question"
          ],
          [
            "اقتراح فرضية",
            "Composé",
            "3",
            "Hypothèse testable, plausible, fondée",
            "Proposer une explication testable, pas une simple affirmation"
          ],
          [
            "التحقق من صحة, إثبات, نقاش, أثبت",
            "Composé",
            "3",
            "Confronter hypothèse avec données → conclure",
            "Confronter explicitement, confirmer ou infirmer avec justification"
          ]
        ]
      }
    ],
    "sous": [
      {
        "id": "s3-h0",
        "titre": "3.1 Verbes simples (mobilisation des connaissances)",
        "from": 0
      },
      {
        "id": "s3-h1",
        "titre": "3.2 Verbes d'analyse et d'interprétation (Exercice 1 et 2)",
        "from": 8
      },
      {
        "id": "s3-h2",
        "titre": "3.3 Verbes de raisonnement scientifique (Exercice 3 — مسعى علمي)",
        "from": 18
      },
      {
        "id": "s3-h3",
        "titre": "3.4 Tableau de reconnaissance rapide des verbes",
        "from": 26
      }
    ]
  },
  {
    "id": "s4",
    "titre": "4. STRUCTURE DE LA RÉPONSE — LES DEUX APPROCHES",
    "icone": "FileText",
    "blocs": [
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "4.1 La structure en 3 parties (مقدمة + عرض + خاتمة)"
      },
      {
        "kind": "texte",
        "texte": "Les deux ouvrages s'accordent sur cette structure fondamentale pour tout texte scientifique."
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "مقدمة (Introduction)"
      },
      {
        "kind": "texte",
        "texte": "Fonction : Orienter le lecteur, contextualiser, annoncer le plan, poser le problème."
      },
      {
        "kind": "texte",
        "texte": "Ce qu'elle doit contenir :"
      },
      {
        "kind": "puce",
        "texte": "Contexte général du phénomène (principe, définition rapide, contexte biologique)"
      },
      {
        "kind": "puce",
        "texte": "Rappel des connaissances de base nécessaires pour aborder le sujet"
      },
      {
        "kind": "puce",
        "texte": "Transition vers le problème ou la question centrale"
      },
      {
        "kind": "texte",
        "texte": "Conseil méthodologique clé :"
      },
      {
        "kind": "note",
        "texte": "« Il faut identifier les mots-clés et la notion sous-jacente. Déchiffrer le mot-clé, c'est déchiffrer la question. »"
      },
      {
        "kind": "texte",
        "texte": "Exemple (extrait des deux ouvrages, sur un sujet de mécanisme enzymatique) :"
      },
      {
        "kind": "note",
        "texte": "_\"Les enzymes catalysent de nombreuses réactions métaboliques au sein de la cellule. Définition d'un enzyme + rôle dans la régulation des réactions + importance pour le fonctionnement cellulaire → puis poser la question centrale : comment expliquer le mécanisme d'action de cet enzyme ?\"_"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "عرض (Développement)"
      },
      {
        "kind": "texte",
        "texte": "Fonction : Développer les arguments, présenter les données, expliquer les mécanismes, structurer logiquement l'information."
      },
      {
        "kind": "texte",
        "texte": "Organisation recommandée :"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Par idée principale — un paragraphe (ou un bloc structuré) par idée"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "Ordre logique — chronologique, de cause à effet, du général au particulier, ou dans l'ordre des étapes"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "Connecteurs de liaison explicites — إذن، حيث، لذلك، عليه، علاوة على ذلك، بالمقابل، 그리고، ..."
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Précision terminologique — les termes scientifiques justes, pas des approximations"
      },
      {
        "kind": "point",
        "num": "5",
        "texte": "Titre par idée — chaque idée ou groupe d'idées doit avoir un titre clair (ou une étiquette) pour guider le correcteur"
      },
      {
        "kind": "texte",
        "texte": "Conseil méthodologique clé (du second ouvrage) :"
      },
      {
        "kind": "note",
        "texte": "« Il faut écrire le titre de chaque idée d'information dans le même ordre que dans l'énoncé. »"
      },
      {
        "kind": "texte",
        "texte": "→ Chaque idée doit avoir un titre clair, dans un ordre logique et cohérent avec le sujet."
      },
      {
        "kind": "texte",
        "texte": "Conseil complémentaire (du premier ouvrage) :"
      },
      {
        "kind": "note",
        "texte": "« Lors de l'analyse de document, identifier les tendances, les valeurs remarquables, les relations causales potentielles avant d'interpréter. Séparer l'analyse de l'interprétation. »"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "خاتمة (Conclusion)"
      },
      {
        "kind": "texte",
        "texte": "Fonction : Synthétiser, répondre explicitement au problème posé, ouvrir si pertinent."
      },
      {
        "kind": "texte",
        "texte": "Ce qu'elle doit contenir :"
      },
      {
        "kind": "puce",
        "texte": "Synthèse des points principaux (1 à 3 phrases)"
      },
      {
        "kind": "puce",
        "texte": "Réponse claire et explicite au problème posé (la conclusion doit répondre à la question posée)"
      },
      {
        "kind": "puce",
        "texte": "Éventuellement : ouverture, limite, perspective, ou lien avec un sujet connexe"
      },
      {
        "kind": "texte",
        "texte": "Conseil méthodologique clé :"
      },
      {
        "kind": "note",
        "texte": "« La conclusion doit être la réponse explicite au problème posé. Pas de nouvelle information dans la conclusion. »"
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "4.2 La méthode d'analyse de document"
      },
      {
        "kind": "texte",
        "texte": "Le premier ouvrage a détaillé la méthode d'analyse de document en 5 étapes structurées :"
      },
      {
        "kind": "texte",
        "texte": "Étapes d'analyse d'un document scientifique :"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "تعريف الوثيقة / تعريف البيانات (Définir le document)"
      },
      {
        "kind": "puce",
        "texte": "Qu'est-ce que ce document représente ? (photographie, schéma, tableau, graphique, expérience...)"
      },
      {
        "kind": "puce",
        "texte": "Quelles sont les conditions expérimentales si pertinentes ?"
      },
      {
        "kind": "puce",
        "texte": "Quel est le contexte ?"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "تفكيك المعطيات (Décomposer les données)"
      },
      {
        "kind": "puce",
        "texte": "Identifier les composantes, les données, les valeurs, les axes, les tendances"
      },
      {
        "kind": "puce",
        "texte": "Dégager les valeurs remarquables (paliers, pics, points d'intersection, changements de tendance)"
      },
      {
        "kind": "puce",
        "texte": "Identifier les relations apparentes entre les éléments"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "إيجاد العلاقات (Établir les relations)"
      },
      {
        "kind": "puce",
        "texte": "Chercher les relations de cause à effet potentielles"
      },
      {
        "kind": "puce",
        "texte": "Chercher les relations de corrélation (proportionnalité, inversement)"
      },
      {
        "kind": "puce",
        "texte": "Chercher les relations fonctionnelles (rôle, fonction, mécanisme)"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "التفسير (Interpréter — si demandé)"
      },
      {
        "kind": "puce",
        "texte": "Expliquer ce que les données signifient dans le contexte du sujet"
      },
      {
        "kind": "puce",
        "texte": "Mobiliser les connaissances + les documents pour expliciter le mécanisme"
      },
      {
        "kind": "puce",
        "texte": "Ne pas confondre observation (données) et interprétation (explication)"
      },
      {
        "kind": "point",
        "num": "5",
        "texte": "استنتاج (Conclure)"
      },
      {
        "kind": "puce",
        "texte": "Tirer la conclusion liée au but de l'exercice"
      },
      {
        "kind": "puce",
        "texte": "Confronter les informations extraites avec le but sous-jacent"
      },
      {
        "kind": "texte",
        "texte": "Mots-clés typiques de chaque étape (à utiliser dans la rédaction) :"
      },
      {
        "kind": "puce",
        "texte": "Analyse : \"تمثل الوثيقة...، حيث نلاحظ...، نلاحظ أن...\""
      },
      {
        "kind": "puce",
        "texte": "Interprétation : \"وهذا يراجع إلى...، يدل على...، لأن...\""
      },
      {
        "kind": "puce",
        "texte": "Relation : \"كلما...، كلما...، هناك علاقة...\""
      },
      {
        "kind": "puce",
        "texte": "Conclusion : \"ومنه نستنتج أن...، وهذا ما يجعلنا نطرح...\""
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "4.3 La méthode du schéma fonctionnel"
      },
      {
        "kind": "texte",
        "texte": "Le premier ouvrage a détaillé la méthode du schéma fonctionnel (et le second ouvrage a apporté des conseils complémentaires sur la qualité de la production graphique)."
      },
      {
        "kind": "texte",
        "texte": "Étapes de production d'un schéma fonctionnel :"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Identifier le type de schéma demandé"
      },
      {
        "kind": "puce",
        "texte": "Schéma descriptif (description de structure) : mettre en évidence les composants et leur organisation"
      },
      {
        "kind": "puce",
        "texte": "Schéma fonctionnel (représentation d'un mécanisme/fonctionnement) : mettre en évidence les phénomènes, les étapes, les relations fonctionnelles"
      },
      {
        "kind": "puce",
        "texte": "Schéma fonctionnel avec transposition (comparaison état normal / état pathologique, par exemple)"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "Lister les éléments à représenter"
      },
      {
        "kind": "puce",
        "texte": "Composants (structures, organites, molécules, etc.)"
      },
      {
        "kind": "puce",
        "texte": "Étapes ou phénomènes (évènements, transformations, réactions)"
      },
      {
        "kind": "puce",
        "texte": "Relations (flèches, influences, régulations)"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "Choisir une disposition claire"
      },
      {
        "kind": "puce",
        "texte": "Ordre logique (chronologique, fonctionnel, hiérarchique)"
      },
      {
        "kind": "puce",
        "texte": "Direction des flèches cohérente"
      },
      {
        "kind": "puce",
        "texte": "Gestion de l'espace (ne pas surcharger, laisser de l'air)"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Ajouter les légendes"
      },
      {
        "kind": "puce",
        "texte": "Chaque élément représenté doit avoir une légende ou une indication claire"
      },
      {
        "kind": "puce",
        "texte": "Les flèches doivent avoir un sens clair (formation, transport, activation, inhibition, etc.)"
      },
      {
        "kind": "puce",
        "texte": "Numéroter si nécessaire (schéma fonctionnel) + légende en bas (même titre)"
      },
      {
        "kind": "point",
        "num": "5",
        "texte": "Ajouter un titre clair"
      },
      {
        "kind": "puce",
        "texte": "Titre qui décrit ce que le schéma représente (le mécanisme, le phénomène, la fonction)"
      },
      {
        "kind": "point",
        "num": "6",
        "texte": "Vérifier"
      },
      {
        "kind": "puce",
        "texte": "Est-ce complet ? (tous les éléments demandés sont présents)"
      },
      {
        "kind": "puce",
        "texte": "Est-ce clair ? (compréhensible sans avoir besoin de l'énoncé)"
      },
      {
        "kind": "puce",
        "texte": "Est-ce juste ? (les informations sont scientifiquement correctes)"
      },
      {
        "kind": "texte",
        "texte": "Conseils complémentaires (du second ouvrage) :"
      },
      {
        "kind": "puce",
        "texte": "\"Si le schéma est descriptif, privilégier le descriptif précis. Si fonctionnel, privilégier les relations fonctionnelles.\""
      },
      {
        "kind": "puce",
        "texte": "\"Les flèches doivent avoir un sens clair. Les légendes doivent être précises.\""
      },
      {
        "kind": "puce",
        "texte": "\"Un schéma sans titre ni légendes est incomplet — chaque élément dessiné doit être identifiable.\""
      },
      {
        "kind": "texte",
        "texte": "Types de schémas (du premier ouvrage) :"
      },
      {
        "kind": "puce",
        "texte": "رسم تخطيطي تفسيري : schéma qui interprète un phénomène biologique (visible au microscope ou observé) — mettre en évidence la structure/le mécanisme et l'expliquer par des légendes"
      },
      {
        "kind": "puce",
        "texte": "رسم تخطيطي وظيفي : schéma qui met en évidence les relations fonctionnelles, les étapes, les phénomènes séquentiels — numérotation des étapes + légende des flèches"
      }
    ],
    "sous": [
      {
        "id": "s4-h0",
        "titre": "4.1 La structure en 3 parties (مقدمة + عرض + خاتمة)",
        "from": 0
      },
      {
        "id": "s4-h1",
        "titre": "4.2 La méthode d'analyse de document",
        "from": 33
      },
      {
        "id": "s4-h2",
        "titre": "4.3 La méthode du schéma fonctionnel",
        "from": 60
      }
    ]
  },
  {
    "id": "s5",
    "titre": "5. MÉTHODE PAR EXERCICE — TYPES 1, 2, 3",
    "icone": "Gauge",
    "blocs": [
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "5.1 Exercice 1 (5 pts) — Récupération et organisation"
      },
      {
        "kind": "texte",
        "texte": "Objectif : Montrer que tu sais extraire et organiser les informations directement disponibles dans les documents et ta connaissance."
      },
      {
        "kind": "texte",
        "texte": "Verbes typiques : تعرف, سمّ, عرف, حدد, ملحوظة, ذكر, عدد, رتب, وصف بنية, صنف, ميز, رسم تخطيطي (descriptif ou fonctionnel simple)"
      },
      {
        "kind": "texte",
        "texte": "Durée indicative : ~45 minutes"
      },
      {
        "kind": "texte",
        "texte": "Méthode détaillée :"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Lire l'intégralité de l'énoncé et des documents avant de commencer"
      },
      {
        "kind": "puce",
        "texte": "Ne pas se lancer dans la première question sans avoir une vue d'ensemble"
      },
      {
        "kind": "puce",
        "texte": "Identifier la logique globale de l'exercice"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "Identifier les verbes d'action dans chaque consigne"
      },
      {
        "kind": "puce",
        "texte": "Déterminer pour chaque question : simple ou composé ?"
      },
      {
        "kind": "puce",
        "texte": "Adapter sa réponse en conséquence (ciblée vs développée)"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "Pour les questions simples (تعريف, ذكر, عدد, وصف, ميز, etc.)"
      },
      {
        "kind": "puce",
        "texte": "Lire le document concerné attentivement"
      },
      {
        "kind": "puce",
        "texte": "Identifier exactement ce qui est demandé"
      },
      {
        "kind": "puce",
        "texte": "Donner la réponse directe, concise, précise"
      },
      {
        "kind": "puce",
        "texte": "Si schéma demandé : identifier les éléments à nommer/décrire, ajouter les légendes, titre"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Pour les questions de schéma"
      },
      {
        "kind": "puce",
        "texte": "Identifier le type ( descriptif / fonctionnel)"
      },
      {
        "kind": "puce",
        "texte": "Lister les éléments à représenter"
      },
      {
        "kind": "puce",
        "texte": "Dessiner proprement, avec légendes et flèches si nécessaire"
      },
      {
        "kind": "puce",
        "texte": "Ajouter un titre clair"
      },
      {
        "kind": "point",
        "num": "5",
        "texte": "Vérifier"
      },
      {
        "kind": "puce",
        "texte": "Chaque réponse correspond-elle exactement à la consigne ?"
      },
      {
        "kind": "puce",
        "texte": "Les légendes sont-elles complètes ?"
      },
      {
        "kind": "puce",
        "texte": "Les termes sont-ils précis ?"
      },
      {
        "kind": "texte",
        "texte": "Pièges à éviter :"
      },
      {
        "kind": "puce",
        "texte": "Trop écrire au-delà de ce qui est demandé (perdre du temps, risquer de s'éloigner du sujet)"
      },
      {
        "kind": "puce",
        "texte": "Oublier les légendes sur un schéma"
      },
      {
        "kind": "puce",
        "texte": "Confondre deux éléments similaires dans un document"
      },
      {
        "kind": "puce",
        "texte": "Ne pas respecter l'ordre des étapes demandées (si séquence)"
      },
      {
        "kind": "puce",
        "texte": "Réponse approximative (termes imprécis, descriptions vagues)"
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "5.2 Exercice 2 (7 pts) — Analyse et interprétation"
      },
      {
        "kind": "texte",
        "texte": "Objectif : Montrer que tu sais analyser des données, les interpréter, confronter des informations, discuter, argumenter."
      },
      {
        "kind": "texte",
        "texte": "Verbes typiques : تحليل, تفسير, مقارنة, مناقشة, استنتاج, علّق, أنقد, علل/برر, فسر/وضّح/بين, اشرح, تحليل مقارن"
      },
      {
        "kind": "texte",
        "texte": "Durée indicative : ~1h15 à 1h30"
      },
      {
        "kind": "texte",
        "texte": "Structure générale de l'exercice 2 :"
      },
      {
        "kind": "puce",
        "texte": "Partie 1 (souvent) : données présentées (expériences, graphiques, tableaux, schémas), questions d'analyse et d'interprétation"
      },
      {
        "kind": "puce",
        "texte": "Partie 2 (souvent) : confrontation, discussion, confirmation/infirmation, argumentation"
      },
      {
        "kind": "texte",
        "texte": "Méthode détaillée par type de tâche :"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "⬇️ Analyse de données (تحليل)"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "تعريف الوثيقة : Qu'est-ce que ce document représente ?"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "تفكيك المعطيات : Identifier les données, les valeurs, les axes, les tendances, les valeurs remarquables"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "إيجاد العلاقات : Chercher les relations entre les éléments (cause/effet, corrélation,anomalie, différence)"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "استنتاج intermédiaire (si demandé) : Tirer les conclusions intermédiaires liées au but"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "⬇️ Interprétation (تفسير)"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Observer les données (déjà fait à l'étape d'analyse)"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "Identifier le mécanisme sous-jacent (connaissances + documents)"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "Expliquer en étapes logiques (cause → effet, ou étapes séquentielles)"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Utiliser des connecteurs de cause à effet : بالتالي، إذن، لذلك، حيث، هذا يراجع إلى..."
      },
      {
        "kind": "point",
        "num": "5",
        "texte": "Ne pas confondre observation et explication — les données ≠ le mécanisme"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "⬇️ Comparaison (مقارنة)"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Identifier le paramètre commun (le critère de comparaison)"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "Citer les ressemblances (points communs)"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "Citer les différences (points distinctifs)"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Aboutir à un استنتاج si demandé"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "⬇️ Discussion / Commentaire / Jugement (مناقشة, علّق, أنقد, نقاش صحة)"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Identifier les arguments pour et contre"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "Confronter les points de vue"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "Donner un avis éclairé (avantages / inconvénients, position nuancée)"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "Appuyer par des preuves (documents ou connaissances)"
      },
      {
        "kind": "texte",
        "texte": "Pièges à éviter :"
      },
      {
        "kind": "puce",
        "texte": "Confondre observation et interprétation (les données ≠ le mécanisme)"
      },
      {
        "kind": "puce",
        "texte": "Donner une interprétation sans être fondée sur les données"
      },
      {
        "kind": "puce",
        "texte": "Bafouer un point de vue sans nuance (quand le sujet demande la nuance)"
      },
      {
        "kind": "puce",
        "texte": "Ne pas aboutir à un استنتاج quand c'est demandé"
      },
      {
        "kind": "puce",
        "texte": "Utiliser des termes imprécis (approximatifs plutôt que scientifiques)"
      },
      {
        "kind": "puce",
        "texte": "Ne pas structurer la réponse (paragraphes sans titre, idées hors ordre)"
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "5.3 Exercice 3 (8 pts) — Démarche scientifique complète (مسعى علمي)"
      },
      {
        "kind": "texte",
        "texte": "Objectif : Montrer que tu sais mener une démarche scientifique complète, de la formulation du problème à la conclusion."
      },
      {
        "kind": "texte",
        "texte": "Verbes typiques : صياغ مشكل علني, اقتراح فرضية, التحقق من صحة الفرضية, إثبات, نقاش, اكتب نصا علميا, أنجز مخططا, تحليل مقارن"
      },
      {
        "kind": "texte",
        "texte": "Durée indicative : ~2h"
      },
      {
        "kind": "texte",
        "texte": "Structure générale de l'exercice 3 :"
      },
      {
        "kind": "puce",
        "texte": "Partie 1 : Présentation d'une situation / d'un problème, propositions d'hypothèses"
      },
      {
        "kind": "puce",
        "texte": "Partie 2 : Exploitation de documents pour vérifier/infirmer les hypothèses, analyse comparative"
      },
      {
        "kind": "puce",
        "texte": "Partie 3 : Synthèse — texte scientifique ou schéma récapitulatif"
      },
      {
        "kind": "texte",
        "texte": "Méthode détaillée — 6 étapes :"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "Étape 1 — Formulation du problème (صياغ مشكل علني)"
      },
      {
        "kind": "texte",
        "texte": "But : Identifier ce qu'on cherche vraiment à comprendre."
      },
      {
        "kind": "texte",
        "texte": "Comment :"
      },
      {
        "kind": "puce",
        "texte": "Lire attentivement tous les documents et l'énoncé"
      },
      {
        "kind": "puce",
        "texte": "Identifier le but sous-jacent (لماذا؟ كيف؟ أين؟ متى؟ ما هو...)"
      },
      {
        "kind": "puce",
        "texte": "Reformuler en une question précise"
      },
      {
        "kind": "puce",
        "texte": "Parfois, le but est explicite (clarifié par l'énoncé) ; parfois il est implicite (à déduire de la logique)"
      },
      {
        "kind": "texte",
        "texte": "Exemple (extrait des deux ouvrages) :"
      },
      {
        "kind": "note",
        "texte": "\"Comment l'information génétique passe-t-elle du noyau au cytoplasme avec transfert de l'ARNm à travers les pores nucléaires ?\""
      },
      {
        "kind": "texte",
        "texte": "Ou plus généralement :"
      },
      {
        "kind": "note",
        "texte": "\"ما هو الآلية qui permet [...] ?\" / \"كيف fonctionne [...] ?\" / \"ما هي les facteurs qui influencent [...] ?\""
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "Étape 2 — Proposition d'hypothèse (اقتراح فرضية)"
      },
      {
        "kind": "texte",
        "texte": "But : Proposer une explication plausible et testable."
      },
      {
        "kind": "texte",
        "texte": "Comment (du premier ouvrage) :"
      },
      {
        "kind": "puce",
        "texte": "S'appuyer sur les données disponibles + les connaissances"
      },
      {
        "kind": "puce",
        "texte": "Proposer une explication testable (qui pourrait être vérifiée ou infirmée par une expérience ou par des données)"
      },
      {
        "kind": "puce",
        "texte": "Une hypothèse peut être partiellement bonne ; plusieurs hypothèses peuvent coexister"
      },
      {
        "kind": "puce",
        "texte": "Elle doit être reformulable en une proposition testable"
      },
      {
        "kind": "texte",
        "texte": "Comment (du second ouvrage) :"
      },
      {
        "kind": "note",
        "texte": "\"اقتراح فرضية : proposition conjecturale, testable, plausible, pertinente\""
      },
      {
        "kind": "texte",
        "texte": "Ce qu'il faut éviter (du second ouvrage) :"
      },
      {
        "kind": "puce",
        "texte": "Ne pas confondre hypothèse et explication détaillée — l'hypothèse est une proposition de départ, pas une explication complète"
      },
      {
        "kind": "puce",
        "texte": "Ne pas proposer une hypothèse qui est déjà confirmée par les données"
      },
      {
        "kind": "texte",
        "texte": "Exemple d'hypothèse testable :"
      },
      {
        "kind": "note",
        "texte": "\"Il est possible que le rôle de l'uridine radioactive dans la traduction soit de permettre le suivi des ARN messagers synthétisés\""
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "Étape 3 — Choix du protocole de test (si demandé)"
      },
      {
        "kind": "texte",
        "texte": "But : Proposer une expérience de vérification pertinente."
      },
      {
        "kind": "texte",
        "texte": "Comment :"
      },
      {
        "kind": "puce",
        "texte": "Identifier les variables pertinentes (ce qu'on veut tester)"
      },
      {
        "kind": "puce",
        "texte": "Proposer des conditions expérimentales qui permettront de confirmer ou infirmer l'hypothèse"
      },
      {
        "kind": "puce",
        "texte": "Justifier le choix du protocole (pourquoi cette expérience, qu'est-ce qu'elle va permettre de conclure)"
      },
      {
        "kind": "texte",
        "texte": "Ce qu'il faut montrer :"
      },
      {
        "kind": "puce",
        "texte": "Que tu comprends ce qu'une expérience de test doit faire (manipuler une variable, mesurer l'effet, confronter à l'hypothèse)"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "Étape 4 — Analyse et interprétation des données (Partie 2 de l'exercice)"
      },
      {
        "kind": "texte",
        "texte": "Méthode (identique à l'exercice 2) :"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "تعريف الوثيقة (si nouveau document)"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "تفكيك المعطيات (identifier les données, valeurs, tendances)"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "تفسير (expliquer ce que les données montrent, le mécanisme sous-jacent)"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "استنتاج (confirmer ou infirmer l'hypothèse avec justification)"
      },
      {
        "kind": "texte",
        "texte": "Important (du premier ouvrage) : confronter chaque donnée avec l'hypothèse, et conclure explicitement"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "Étape 5 — Vérification / infirment / discussion (confronter avec les données)"
      },
      {
        "kind": "texte",
        "texte": "Méthode :"
      },
      {
        "kind": "puce",
        "texte": "Si les données soutiennent l'hypothèse : confirmer avec justification (lignes de données + interprétation)"
      },
      {
        "kind": "puce",
        "texte": "Si les données infirment l'hypothèse : expliquer pourquoi, proposer une alternative si pertinent"
      },
      {
        "kind": "puce",
        "texte": "Si les données sont partiellement en accord : nuancer, identifier les points forts et les limites"
      },
      {
        "kind": "texte",
        "texte": "Conseil (du second ouvrage) :"
      },
      {
        "kind": "note",
        "texte": "\"إذا كانت الأسئلة : هل تأكدت من صحة الفرضية؟ → الإجابة : نعم ou لا, ثم justification\""
      },
      {
        "kind": "texte",
        "texte": "→ Ne pas juste dire \"نعم\" ou \"لا\", mais appuyer par les données"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "Étape 6 — Production synthétique (si demandé : نص علمي / مخطط)"
      },
      {
        "kind": "texte",
        "texte": "Texte scientifique :"
      },
      {
        "kind": "puce",
        "texte": "مقدمة : contexte, rappel des connaissances, annonce du mécanisme/phénomène traité, problème posé"
      },
      {
        "kind": "puce",
        "texte": "عرض : explication détaillée en étapes, avec les données et connaissances, connecteurs logiques, titres par idée"
      },
      {
        "kind": "puce",
        "texte": "خاتمة : synthèse, réponse claire au problème, éventuellement ouverture"
      },
      {
        "kind": "texte",
        "texte": "Schéma fonctionnel :"
      },
      {
        "kind": "puce",
        "texte": "Montrer le mécanisme/phénomène de façon claire et complète"
      },
      {
        "kind": "puce",
        "texte": "Légendes précises pour chaque élément"
      },
      {
        "kind": "puce",
        "texte": "Flèches si nécessaire (sens, progression, transformation)"
      },
      {
        "kind": "puce",
        "texte": "Titre clair"
      },
      {
        "kind": "texte",
        "texte": "Conseil du second ouvrage :"
      },
      {
        "kind": "note",
        "texte": "\"Dans le schéma fonctionnel du partie III, il faut représenter l'état normal ET l'état pathologique (ou l'état avec intervention) — même si le sujet ne le demande pas explicitement.\""
      }
    ],
    "sous": [
      {
        "id": "s5-h0",
        "titre": "5.1 Exercice 1 (5 pts) — Récupération et organisation",
        "from": 0
      },
      {
        "id": "s5-h1",
        "titre": "5.2 Exercice 2 (7 pts) — Analyse et interprétation",
        "from": 31
      },
      {
        "id": "s5-h2",
        "titre": "5.3 Exercice 3 (8 pts) — Démarche scientifique complète (مسعى علمي)",
        "from": 67
      }
    ]
  },
  {
    "id": "s6",
    "titre": "6. MÉTHODOLOGIE DE RÉVISION",
    "icone": "Boxes",
    "blocs": [
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "6.1. Principes fondamentaux"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "1. La pratique > la théorie passive"
      },
      {
        "kind": "puce",
        "texte": "90% du savoir se acquiert par la pratique et l'auto-évaluation, 10% par la théorie"
      },
      {
        "kind": "puce",
        "texte": "La reconstitution du savoir par la pratique seule permet d'atteindre la méthode idéale"
      },
      {
        "kind": "puce",
        "texte": "Il faut résoudre des exercices variés dans toutes les unités"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "2. L'importance de l'auto-évaluation continue"
      },
      {
        "kind": "puce",
        "texte": "Après chaque leçon, faire des exercices types"
      },
      {
        "kind": "puce",
        "texte": "Comparer avec les corrigés (si disponibles) ou avec sa propre logique"
      },
      {
        "kind": "puce",
        "texte": "Identifier ses points faibles et les travailler spécifiquement"
      },
      {
        "kind": "puce",
        "texte": "Ne pas accumuler le savoir sans le vérifier"
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "3. La structuration de la révision"
      },
      {
        "kind": "tableau",
        "texte": "Phase · Contenu · Durée indicative · Revue des concepts · Réviser les notions, compléter les fiches, ajouter des schémas · 1-2h par session · Auto-évaluation par unité · Résoudre des exercices types par unité · Après revue du concept · Sujets complets d'entraînement · Résoudre des sujets bac complets, chronométrés · Avant les tests blancs · Test blanc · Simulation d'examen, chronométré, sans aide · Avant le bac",
        "entetes": [
          "Phase",
          "Contenu",
          "Durée indicative"
        ],
        "lignes": [
          [
            "Revue des concepts",
            "Réviser les notions, compléter les fiches, ajouter des schémas",
            "1-2h par session"
          ],
          [
            "Auto-évaluation par unité",
            "Résoudre des exercices types par unité",
            "Après revue du concept"
          ],
          [
            "Sujets complets d'entraînement",
            "Résoudre des sujets bac complets, chronométrés",
            "Avant les tests blancs"
          ],
          [
            "Test blanc",
            "Simulation d'examen, chronométré, sans aide",
            "Avant le bac"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "4. La gestion du temps (du second ouvrage)"
      },
      {
        "kind": "texte",
        "texte": "Conseils :"
      },
      {
        "kind": "puce",
        "texte": "Ne pas reprendre directement l'école pour les matières intensives (maths, SVT)"
      },
      {
        "kind": "puce",
        "texte": "Sessions de révision : 3-4h maximum, avec pauses"
      },
      {
        "kind": "puce",
        "texte": "\"تجزئة\" la révision par unité, pas tout d'un coup"
      },
      {
        "kind": "puce",
        "texte": "Pas de révision la nuit avant (concentration trop faible, besoin de sommeil)"
      },
      {
        "kind": "texte",
        "texte": "Plan de révision type :"
      },
      {
        "kind": "tableau",
        "texte": "Période · Activité · Début du programme · Revue des notions + fiches + premiers exercices types · Milieu du programme · Compléter fiches, exercices variés par unité, premiers sujets d'entraînement · Après fin du programme · Sujets complets chronométrés, tests blancs, correction des erreurs · Semaine du bac · Revue finale des fiches, 1-2 sujets complets, repos mental",
        "entetes": [
          "Période",
          "Activité"
        ],
        "lignes": [
          [
            "Début du programme",
            "Revue des notions + fiches + premiers exercices types"
          ],
          [
            "Milieu du programme",
            "Compléter fiches, exercices variés par unité, premiers sujets d'entraînement"
          ],
          [
            "Après fin du programme",
            "Sujets complets chronométrés, tests blancs, correction des erreurs"
          ],
          [
            "Semaine du bac",
            "Revue finale des fiches, 1-2 sujets complets, repos mental"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "5. Les pièges de la révision (du second ouvrage)"
      },
      {
        "kind": "tableau",
        "texte": "Piège · Solution · La révision passive (relire sans s'auto-évaluer) · Toujours faire des exercices après la lecture · La procrastination · Commencer tôt, petits pas réguliers · La surcharge mentale (trop de choses sans organisation) · Découper par unité, un sujet à la fois · La comparaison avec les autres élèves · Se concentrer sur sa propre progression · Le manque de confiance en soi · Se rappeler sa progression, se rappeler que la pratique améliore · La révision non focalisée (diffuse, sans objectif) · Définir un objectif par session (réviser une unité, résoudre un type d'exercice)",
        "entetes": [
          "Piège",
          "Solution"
        ],
        "lignes": [
          [
            "La révision passive (relire sans s'auto-évaluer)",
            "Toujours faire des exercices après la lecture"
          ],
          [
            "La procrastination",
            "Commencer tôt, petits pas réguliers"
          ],
          [
            "La surcharge mentale (trop de choses sans organisation)",
            "Découper par unité, un sujet à la fois"
          ],
          [
            "La comparaison avec les autres élèves",
            "Se concentrer sur sa propre progression"
          ],
          [
            "Le manque de confiance en soi",
            "Se rappeler sa progression, se rappeler que la pratique améliore"
          ],
          [
            "La révision non focalisée (diffuse, sans objectif)",
            "Définir un objectif par session (réviser une unité, résoudre un type d'exercice)"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 3,
        "texte": "6. Conseils psychologiques & motivationnels (du second ouvrage)"
      },
      {
        "kind": "puce",
        "texte": "\"Le cerveau n'est pas une machine électrique qui fonctionne sans arrêt. Il a aussi besoin d'énergie\""
      },
      {
        "kind": "puce",
        "texte": "\"Rechargez votre énergie par une alimentation saine, un sommeil de qualité, et des pauses\""
      },
      {
        "kind": "puce",
        "texte": "\"La confiance en soi vient de la préparation méthodeique\""
      },
      {
        "kind": "texte",
        "texte": "Message clé : le bac est une épreuve, mais avec une bonne préparation méthodique, on peut la réussir. Il faut à la fois :"
      },
      {
        "kind": "puce",
        "texte": "Comprendre le contenu (fiches, cours, exercices)"
      },
      {
        "kind": "puce",
        "texte": "S'entraîner sur la forme (exercices, chronométrage, rédaction)"
      },
      {
        "kind": "puce",
        "texte": "Gérer le mental (confiance, gestion du stress, repos, équilibre)"
      },
      {
        "kind": "texte",
        "texte": "Piège émotionnel à éviter (du second ouvrage) :"
      },
      {
        "kind": "puce",
        "texte": "La peur du bilan, du résultat"
      },
      {
        "kind": "puce",
        "texte": "La comparaison sociale (« les autres sont meilleurs »)"
      },
      {
        "kind": "puce",
        "texte": "La pression du temps qui conduit à la précipitation"
      },
      {
        "kind": "texte",
        "texte": "Stratégie face à l'échec ou à la difficulté (du second ouvrage) :"
      },
      {
        "kind": "puce",
        "texte": "Analyser les erreurs (comprendre pourquoi on a eu tort)"
      },
      {
        "kind": "puce",
        "texte": "Identifier le point bloquant précis"
      },
      {
        "kind": "puce",
        "texte": "Travailler spécifiquement ce point"
      },
      {
        "kind": "puce",
        "texte": "Répéter jusqu'à automatisation"
      }
    ],
    "sous": [
      {
        "id": "s6-h0",
        "titre": "6.1. Principes fondamentaux",
        "from": 0
      }
    ]
  },
  {
    "id": "s7",
    "titre": "7. PIÈGES À ÉVITER",
    "icone": "ShieldCheck",
    "blocs": [
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "7.1. Pièges dans la lecture de l'énoncé"
      },
      {
        "kind": "tableau",
        "texte": "Piège · Conséquence · Solution · Ne pas identifier les verbes d'action · Répondre à côté, perdre des points · Lister les verbes, déterminer simple/composé · Penser que tous les exercices sont pareils · Méthode inadaptée · Adapter la méthode selon le type d'exercice (1, 2, 3) · Ne pas lire TOUS les documents avant de commencer · Manquer des informations, inachevé · Lire l'ensemble avant de répondre, identifier la logique · Confondre observation et interprétation (exercice 2) · Réponse superficielle ou hors sujet · Séparer analyse (données) et interprétation (explication) · Penser que le problème est la question explicite (exercice 3) · Problème mal formulé, réponse non ciblée · Identifier le but sous-jacent, reformuler en question",
        "entetes": [
          "Piège",
          "Conséquence",
          "Solution"
        ],
        "lignes": [
          [
            "Ne pas identifier les verbes d'action",
            "Répondre à côté, perdre des points",
            "Lister les verbes, déterminer simple/composé"
          ],
          [
            "Penser que tous les exercices sont pareils",
            "Méthode inadaptée",
            "Adapter la méthode selon le type d'exercice (1, 2, 3)"
          ],
          [
            "Ne pas lire TOUS les documents avant de commencer",
            "Manquer des informations, inachevé",
            "Lire l'ensemble avant de répondre, identifier la logique"
          ],
          [
            "Confondre observation et interprétation (exercice 2)",
            "Réponse superficielle ou hors sujet",
            "Séparer analyse (données) et interprétation (explication)"
          ],
          [
            "Penser que le problème est la question explicite (exercice 3)",
            "Problème mal formulé, réponse non ciblée",
            "Identifier le but sous-jacent, reformuler en question"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "7.2. Pièges dans la réponse"
      },
      {
        "kind": "tableau",
        "texte": "Piège · Conséquence · Solution · Trop écrire (hors sujet) → perdre des points, perdre du temps · Se limiter à ce qui est demandé, mais avec précision et complétude relative · Réponse non structurée → illisible, mal notée · Utiliser la structure en 3 parties (pour texte) ou la méthode structurée (pour analyse) · Schéma sans légendes / flèches / titre → incomplet · Toujours ajouter légendes, flèches si nécessaire, titre · Termes imprécis / approximatifs → moins de crédit, moins de précision · Utiliser les termes scientifiques justes, précis · Oublier l'استنتاج quand c'est demandé · Vérifier si chaque question demande un استنتاج, et le faire · Donner un avis sans justification (discussion/commentaire) · Appuyer chaque affirmation par des preuves (documents ou connaissances) · Confondre hypothèse testable et simple affirmation · Vérifier que l'hypothèse est testable, fondée, plausible · Ne pas confronter les données avec l'hypothèse (exercice 3) · Confronter explicitement, confirmer ou infirmer avec justification",
        "entetes": [
          "Piège",
          "Conséquence",
          "Solution"
        ],
        "lignes": [
          [
            "Trop écrire (hors sujet) → perdre des points, perdre du temps",
            "Se limiter à ce qui est demandé, mais avec précision et complétude relative"
          ],
          [
            "Réponse non structurée → illisible, mal notée",
            "Utiliser la structure en 3 parties (pour texte) ou la méthode structurée (pour analyse)"
          ],
          [
            "Schéma sans légendes / flèches / titre → incomplet",
            "Toujours ajouter légendes, flèches si nécessaire, titre"
          ],
          [
            "Termes imprécis / approximatifs → moins de crédit, moins de précision",
            "Utiliser les termes scientifiques justes, précis"
          ],
          [
            "Oublier l'استنتاج quand c'est demandé",
            "Vérifier si chaque question demande un استنتاج, et le faire"
          ],
          [
            "Donner un avis sans justification (discussion/commentaire)",
            "Appuyer chaque affirmation par des preuves (documents ou connaissances)"
          ],
          [
            "Confondre hypothèse testable et simple affirmation",
            "Vérifier que l'hypothèse est testable, fondée, plausible"
          ],
          [
            "Ne pas confronter les données avec l'hypothèse (exercice 3)",
            "Confronter explicitement, confirmer ou infirmer avec justification"
          ]
        ]
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "7.3. Pièges dans la révision"
      },
      {
        "kind": "tableau",
        "texte": "Piège · Conséquence · Solution · Révision passive (relire sans exercices) · Connaissance fragile, non mobilisée · Toujours faire des exercices après lecture · Procrastination · Retard, accumulation, stress · Commencer tôt, petits pas, planning · Surcharge (trop simultanément) · Confusion, inefficacité · Découper par unité, un sujet à la fois · Manque de sommeil / repos · Perte de concentration, fatigue mentale · Respecter les besoins de récupération, dormir suffisamment · Comparaison avec les autres · Perte de confiance, anxiété · Se concentrer sur sa propre progression, pas sur celle des autres · Fixer sur les points négatifs sans voir la progression · Démotivation · Se rappeler les progrès, se féliciter des réussites",
        "entetes": [
          "Piège",
          "Conséquence",
          "Solution"
        ],
        "lignes": [
          [
            "Révision passive (relire sans exercices)",
            "Connaissance fragile, non mobilisée",
            "Toujours faire des exercices après lecture"
          ],
          [
            "Procrastination",
            "Retard, accumulation, stress",
            "Commencer tôt, petits pas, planning"
          ],
          [
            "Surcharge (trop simultanément)",
            "Confusion, inefficacité",
            "Découper par unité, un sujet à la fois"
          ],
          [
            "Manque de sommeil / repos",
            "Perte de concentration, fatigue mentale",
            "Respecter les besoins de récupération, dormir suffisamment"
          ],
          [
            "Comparaison avec les autres",
            "Perte de confiance, anxiété",
            "Se concentrer sur sa propre progression, pas sur celle des autres"
          ],
          [
            "Fixer sur les points négatifs sans voir la progression",
            "Démotivation",
            "Se rappeler les progrès, se féliciter des réussites"
          ]
        ]
      }
    ],
    "sous": [
      {
        "id": "s7-h0",
        "titre": "7.1. Pièges dans la lecture de l'énoncé",
        "from": 0
      },
      {
        "id": "s7-h1",
        "titre": "7.2. Pièges dans la réponse",
        "from": 2
      },
      {
        "id": "s7-h2",
        "titre": "7.3. Pièges dans la révision",
        "from": 4
      }
    ]
  },
  {
    "id": "s8",
    "titre": "8. CHECKLIST DE PRÉPARATION",
    "icone": "Activity",
    "blocs": [
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "8.1. Avant l'examen (phase de révision)"
      },
      {
        "kind": "puce",
        "texte": "☐ Maîtriser les notions de chaque unité (fiches complètes, schémas, mécanismes)"
      },
      {
        "kind": "puce",
        "texte": "☐ Savoir reconnaître les verbes d'action et associer la réponse appropriée"
      },
      {
        "kind": "puce",
        "texte": "☐ S'entraîner sur des exercices types par unité (variés, pas juste un type)"
      },
      {
        "kind": "puce",
        "texte": "☐ Résoudre des sujets complets chronométrés (simulation d'examen)"
      },
      {
        "kind": "puce",
        "texte": "☐ Corriger ses erreurs : comprendre pourquoi, noter les leçons tirées"
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "8.2. Le jour de l'examen"
      },
      {
        "kind": "puce",
        "texte": "☐ Lire TOUS les documents avant de commencer (ne pas se lancer dans la question 1 sans vue d'ensemble)"
      },
      {
        "kind": "puce",
        "texte": "☐ Identifier les verbes d'action dans chaque consigne"
      },
      {
        "kind": "puce",
        "texte": "☐ Déterminer le type d'exercice (1, 2, ou 3) et adapter la méthode"
      },
      {
        "kind": "puce",
        "texte": "☐ Gérer le temps (Exercice 1: ~45 min, Exercice 2: ~1h15, Exercice 3: ~2h)"
      },
      {
        "kind": "puce",
        "texte": "☐ Vérifier que toutes les questions sont répondues (pas de question oubliée)"
      },
      {
        "kind": "puce",
        "texte": "☐ Laisser du temps pour la relecture (vérifier, corriger, compléter)"
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "8.3. Pendant la réponse — Checklist par consigne"
      },
      {
        "kind": "texte",
        "texte": "Pour chaque consigne, vérifier :"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "☐ Identifier le verbe d'action (simple ou composé ?)"
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "☐ Choisir la méthode adaptée (réponse ciblée vs réponse structurée)"
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "☐ Répondre avec précision, clarté, terminologie scientifique juste"
      },
      {
        "kind": "point",
        "num": "4",
        "texte": "☐ (Si schéma) Ajouter légendes, flèches si nécessaire, titre"
      },
      {
        "kind": "point",
        "num": "5",
        "texte": "☐ (Si analyse) Suivre la méthode (تعريف → تفكيك → تفسير → استنتاج)"
      },
      {
        "kind": "point",
        "num": "6",
        "texte": "☐ (Si discussion/jugement) Confronter, nuancer, appuyer par des preuves"
      },
      {
        "kind": "point",
        "num": "7",
        "texte": "☐ (Si exercice 3) Formuler problème → hypothèse → confronter avec données → conclure"
      },
      {
        "kind": "point",
        "num": "8",
        "texte": "☐ (Si texte scientifique) Structure 3 parties : مقدمة, عرض, خاتمة"
      },
      {
        "kind": "titre",
        "niveau": 2,
        "texte": "8.4. Après réponse — Vérification"
      },
      {
        "kind": "puce",
        "texte": "☐ Vérifier que toutes les questions sont répondues (aucune oubliée)"
      },
      {
        "kind": "puce",
        "texte": "☐ Vérifier la précision terminologique (termes scientifiques justes, pas d'approximations)"
      },
      {
        "kind": "puce",
        "texte": "☐ Vérifier que les schémas sont complets (légendes, flèches, titre)"
      },
      {
        "kind": "puce",
        "texte": "☐ Vérifier que les استنتاجs sont présents quand demandés"
      },
      {
        "kind": "puce",
        "texte": "☐ Vérifier la cohérence logique de la réponse (les idées suivent-elles les unes les autres ?)"
      },
      {
        "kind": "puce",
        "texte": "☐ Vérifier l'orthographe et la présentation (lisibilité, titres, paragraphes)"
      }
    ],
    "sous": [
      {
        "id": "s8-h0",
        "titre": "8.1. Avant l'examen (phase de révision)",
        "from": 0
      },
      {
        "id": "s8-h1",
        "titre": "8.2. Le jour de l'examen",
        "from": 6
      },
      {
        "id": "s8-h2",
        "titre": "8.3. Pendant la réponse — Checklist par consigne",
        "from": 13
      },
      {
        "id": "s8-h3",
        "titre": "8.4. Après réponse — Vérification",
        "from": 23
      }
    ]
  },
  {
    "id": "s9",
    "titre": "9. CONCLUSION — LE MESSAGE ULTIME",
    "icone": "Brain",
    "blocs": [
      {
        "kind": "texte",
        "texte": "Ce guide fusion synthétise deux approches complémentaires :"
      },
      {
        "kind": "puce",
        "texte": "La précision technique et systématique du premier ouvrage sur la taxinomie des verbes et la méthode d'analyse"
      },
      {
        "kind": "puce",
        "texte": "La perspective pratique, vécue et psychologique du second ouvrage sur la révision, la gestion, la confiance en soi"
      },
      {
        "kind": "texte",
        "texte": "Le message ultime pour l'élève :"
      },
      {
        "kind": "point",
        "num": "1",
        "texte": "Le bac SVT n'est pas une épreuve de mémoire : c'est une épreuve de raisonnement scientifique. Il ne suffit pas de savoir — il faut savoir mobiliser ses connaissances pour répondre à des questions précises."
      },
      {
        "kind": "point",
        "num": "2",
        "texte": "La clé est la méthode : savoir reconnaître ce qu'on demande (verbes d'action), structurer sa réponse (structure, schéma, analyse), et s'entraîner (pratique, chronométrage, correction des erreurs)."
      },
      {
        "kind": "point",
        "num": "3",
        "texte": "La réussite vient de la préparation méthodique : connaissances + entraînement + gestion mentale + confiance."
      },
      {
        "kind": "texte",
        "texte": "Citation de clôture (du second ouvrage) :"
      },
      {
        "kind": "note",
        "texte": "« Le cerveau n'est pas une machine électrique qui fonctionne sans arrêt. Il a aussi besoin d'énergie. »"
      },
      {
        "kind": "note",
        "texte": "« La confiance en soi vient de la préparation. »"
      }
    ]
  },
  {
    "id": "annexe",
    "titre": "ANNEXE — RÉFÉRENCE RAPIDE DES VERBES (Fiche mémo)",
    "icone": "Microscope",
    "blocs": [
      {
        "kind": "tableau",
        "texte": "Famille · Verbes · Réponse attendue · Exercice typique · Identification / Nommage · تعرف, سمّ, عرف, حدد, ملحوظة, ذكر عناصر · Réponse ciblée, directe · 1, 2 · Description / Structuration · وصف بنية, صنف, ميز · Description détaillée / Classification / Opposition · 1 · Énumération / Séquence · ذكر, عدد, رتب, نظم · Liste ordonnée, concise · 1 · Schéma · رسم تخطيطي, أنجز مخططا, رسم تخطيطي تفسيري, رسم تخطيطي وظيفي · Schéma avec légendes + flèches + titre · 1, 2, 3 · Analyse · حلل, تحليل مقارن, تحليل ثم تفسير · Décomposer → identifier tendances → relations → استنتاج · 2 · Interprétation · فسر, وضّح, بين, اشرح, تفسير, تفسير الظاهرة · Observer → expliquer le mécanisme → étapes logiques · 2 · Comparaison · قارن, مقارنة, مقارنة منحنين, مقارنة نتائج · Réssemblances + différences sur paramètre commun → استنتاج · 2 · Jugement / Argumentation · علّق, أنقد, علل/برر, نقاش صحة · Avantages + inconvénients + avis éclairé + preuves · 2 · Conclusion / Inférence · استخرج, استنتاج · Info clé liée au but, conclusion logique · 2, 3 · Texte scientifique · اكتب نصا علميا (Composer) · 3 parties : مقدمة, عرض, خاتمة · 2, 3 · Problème & Hypothèse · صياغ مشكل علني, اقتراح فرضية · Question précise + hypothèse testable, plausible, fondée · 3 · Vérification · التحقق من صحة الفرضية, إثبات, نقاش, أثبت, تأكيد صحة · Confronter hypothèse avec données → confirmer ou infirmer avec justification · 3 · Synthèse · أنجز مخططا، أنجز رسمًا تخطيطيًا · Schéma récapitulatif complet (état normal + état pathologique si pertinent) · 3",
        "entetes": [
          "Famille",
          "Verbes",
          "Réponse attendue",
          "Exercice typique"
        ],
        "lignes": [
          [
            "Identification / Nommage",
            "تعرف, سمّ, عرف, حدد, ملحوظة, ذكر عناصر",
            "Réponse ciblée, directe",
            "1, 2"
          ],
          [
            "Description / Structuration",
            "وصف بنية, صنف, ميز",
            "Description détaillée / Classification / Opposition",
            "1"
          ],
          [
            "Énumération / Séquence",
            "ذكر, عدد, رتب, نظم",
            "Liste ordonnée, concise",
            "1"
          ],
          [
            "Schéma",
            "رسم تخطيطي, أنجز مخططا, رسم تخطيطي تفسيري, رسم تخطيطي وظيفي",
            "Schéma avec légendes + flèches + titre",
            "1, 2, 3"
          ],
          [
            "Analyse",
            "حلل, تحليل مقارن, تحليل ثم تفسير",
            "Décomposer → identifier tendances → relations → استنتاج",
            "2"
          ],
          [
            "Interprétation",
            "فسر, وضّح, بين, اشرح, تفسير, تفسير الظاهرة",
            "Observer → expliquer le mécanisme → étapes logiques",
            "2"
          ],
          [
            "Comparaison",
            "قارن, مقارنة, مقارنة منحنين, مقارنة نتائج",
            "Réssemblances + différences sur paramètre commun → استنتاج",
            "2"
          ],
          [
            "Jugement / Argumentation",
            "علّق, أنقد, علل/برر, نقاش صحة",
            "Avantages + inconvénients + avis éclairé + preuves",
            "2"
          ],
          [
            "Conclusion / Inférence",
            "استخرج, استنتاج",
            "Info clé liée au but, conclusion logique",
            "2, 3"
          ],
          [
            "Texte scientifique",
            "اكتب نصا علميا (Composer)",
            "3 parties : مقدمة, عرض, خاتمة",
            "2, 3"
          ],
          [
            "Problème & Hypothèse",
            "صياغ مشكل علني, اقتراح فرضية",
            "Question précise + hypothèse testable, plausible, fondée",
            "3"
          ],
          [
            "Vérification",
            "التحقق من صحة الفرضية, إثبات, نقاش, أثبت, تأكيد صحة",
            "Confronter hypothèse avec données → confirmer ou infirmer avec justification",
            "3"
          ],
          [
            "Synthèse",
            "أنجز مخططا، أنجز رسمًا تخطيطيًا",
            "Schéma récapitulatif complet (état normal + état pathologique si pertinent)",
            "3"
          ]
        ]
      },
      {
        "kind": "texte",
        "texte": "Fichier généré à partir de l'analyse fusionnée de deux ouvrages de référence SVT BAC 3AS Algérie. À intégrer dans l'application Kunz El Ouloum pour exploitation pédagogique."
      }
    ]
  }
];

export const GUIDE_STATS = {
  sections: 11,
  blocs: 382,
  tableaux: 20,
  entrees: 226,
};
