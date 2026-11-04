/* ============================================================
   ARCHIVE — Sujets BAC SVT (liens externes vérifiés)
   ------------------------------------------------------------
   Rôle : catalogue de consultation, PAS d'entraînement 4D.
   Chaque entrée pointe vers la page annales dzexams qui contient
   le sujet officiel (الموضوعان 1 و 2) et le تصحيح النموذجي dans
   son viewer, + le lien PDF direct quand il a été observé.

   Contenu réel du tableau (16 entrées, constat du 2026-08-31) :
   - 15 entrées شعبة رياضيات : 2013 → 2026 (2017 en deux sessions) ;
   - 1 entrée شعبة علوم تجريبية : 2021 uniquement.
   Les autres années SE (2013–2020 et 2022–2026) ne sont plus des cartes
   d'archive : elles sont encodées en entraînement 4D dans
   data/years/se/year-*.js. Depuis le 2026-09-19, TOUTES les années Maths
   2013–2026 sont également encodées dans data/years/m/year-*.js et le
   hub les affiche comme épreuves (identifiants 2013-m … 2026-m), toutes en
   4D (2013–2015 + 2017 استثنائية et SE 2021 par OCR Tesseract, 2026-09-20 —
   plus aucune armature « copie libre » ; voir PROMPT_DECISIONS_PROPRIETAIRE.md).
   Le hub ne propose donc PLUS de carte de consultation Maths : les
   entrées ci-dessous servent de source (page annales + PDF direct), pas
   d'écran. 2021 SE ouvre une épreuve en « copie libre » (armature seule,
   aucune consigne encodée) : son PDF officiel est chiffré, sans couche
   texte exploitable — aucun énoncé n'a été fabriqué pour combler ce trou,
   et le champ `notes` de l'entrée le rappelle.
   Index racine : uniquement se et m. Le troisième onglet du hub
   (« باكالوريات أجنبية », clé `foreign`) n'a AUCUNE entrée ici : dzexams
   n'indexe que le BAC algérien, et aucun lien étranger n'a été inventé.

   Répartition des contrôles au 2026-08-31 : 12 access_confirmed,
   4 consulted, 10 contentVerified=true, 12 viewers bloqués.

   Métrique de contrôle par entrée :
   - page: "consulted"        -> page ouverte, viewer fonctionnel,
     contenu visuellement vérifié ;
   - page: "access_confirmed" -> page ouverte, viewer bloqué ; le
     PDF direct a été téléchargé et validé mécaniquement ;
   - attachments: true        -> le viewer expose les pièces jointes
     « sujet » et « …-correction » ;
   - viewer: "ok"             -> le viewer en ligne s'affiche ;
   - viewer: "blocked"        -> viewer « 0 pages » (PDF chiffré
     côté PDF.js) mais lien « تحميل » présent ;
   - contentVerified          -> booléen ; true si le PDF a été
     téléchargé et validé (sujet + correction) ;
   - pdfUrl                   -> lien PDF direct observé sur la page.

   Trou documenté, non inventé : l'index dzexams de la شعبة رياضيات
   n'expose qu'une entrée 2016 (session principale). Pas de session
   exceptionnelle 2016/m sur cette source (2017 y figure deux fois).

   Absence revendiquée : dzexams ne propose AUCUNE catégorie
   « علوم الطبيعة والحياة » pour la شعبة تقني رياضي (page racine
   /ar/bac/sciences-naturelles : uniquement se et m, revérifié le
   2026-08-31). La filière n'a pas d'épreuve SVT au BAC national.
   Aucun lien n'a donc été inventé.
   Cet ancien troisième onglet est devenu le 2026-09-19 l'espace
   « باكالوريات أجنبية » (clé `foreign`), réservé à des sujets NON
   algériens. Il est volontairement vide : aucun index étranger n'a été
   vérifié, aucun énoncé ni barème n'a été recopiés. Le hub l'affiche
   comme un espace à remplir, sans lien.

   La session exceptionnelle (« الدورة الاستثنائية ») n'existe sur
   dzexams que pour 2016 (se) et 2017 (se et m). 2016 Maths n'a
   qu'une entrée (session principale) — voir ARCHIVE.gaps.
   ============================================================ */

const ANNALES = "https://www.dzexams.com/ar/annales";

export const ARCHIVE = {
  verifiedAt: "2026-08-31",
  years: "2013-2026",
  streamOrder: ["se", "m", "foreign"],
  sourceLabel: "dzexams.com — sujets officiels + تصحيح النموذجي (viewer / PDF)",
  sourceRoot: "https://www.dzexams.com/ar/bac/sciences-naturelles",
  /* Sessions absentes de la source — ne pas inventer de lien. */
  gaps: [
    {
      year: "2016",
      stream: "m",
      // Pas de localPdfUrls ici : l'entrée documente une session absente de la
      // source. Y rattacher les PDF de la session principale ferait afficher le
      // mauvais sujet dès que les trous seront rendus quelque part.
      session: "exceptional",
      reason:
        "Index dzexams /ar/bac/sciences-naturelles/m : une seule ligne 2016 (session principale). 2017 y figure deux fois. Constat 2026-08-31 — aucun URL fabriqué."
    },
    {
      year: "all",
      stream: "foreign",
      session: "main",
      reason:
        "Espace « باكالوريات أجنبية » ouvert le 2026-09-19 : aucun sujet non algérien n'a été vérifié ni chargé à ce jour. dzexams n'indexe que le BAC algérien (se et m) — il n'existe donc aucune source vérifiée à citer ici. Aucun lien, énoncé ni barème étranger n'a été inventé ; l'onglet reste vide en attendant un contenu dûment sourcé."
    }
  ],
  streams: {
    se: {
      id: "se",
      label: "شعبة علوم تجريبية",
      indexUrl: "https://www.dzexams.com/ar/bac/sciences-naturelles/se"
    },
    m: {
      id: "m",
      label: "شعبة رياضيات",
      indexUrl: "https://www.dzexams.com/ar/bac/sciences-naturelles/m"
    },
    /* Pas de `indexUrl` : aucune source de sujets étrangers n'a été vérifiée.
       Une URL inventée serait pire qu'un champ absent — cf. ARCHIVE.gaps. */
    foreign: {
      id: "foreign",
      label: "باكالوريات أجنبية"
    }
  },
  sessions: {
    main: "الدورة الرئيسية",
    exceptional: "الدورة الاستثنائية"
  },
  entries: [
    /* ---------------- شعبة علوم تجريبية ----------------
       Aucune entrée : toutes les sessions SE (2013-2026) sont des
       années d'entraînement 4D activées dans l'application — la règle
       « une année 4D SE n'a pas de carte d'archive » (pas de confusion
       de produits). La dernière armature « copie libre », SE 2021, a
       été structurée le 2026-09-20 à partir de l'OCR du sujet officiel
       (scripts/extracted/SE/2021) et son entrée d'archive retirée. */

    /* ---------------- شعبة رياضيات ---------------- */
    {
      year: "2026",
      stream: "m",
      session: "main",
      url: `${ANNALES}/bHJKeCsxNEVvOVNCYm5jODBpVktjQT09`,
      localPdfUrls: ["/subjects/M/2026/sujet-1.pdf", "/subjects/M/2026/sujet-2.pdf"],
      pdfUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2026/dzexams-bac-sciences-naturelles-1343688.pdf",
      page: "access_confirmed",
      contentVerified: false,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-31) : titre BAC 2026 filière Maths confirmé ; viewer 0 pages ; lien تحميل observé. Octets PDF non récupérés (TLS). Encodé 4D sous l id 2026-m depuis énoncé + corrigé officiels eddirasa (hub Maths : carte entraînement, pas consultation)."
    },
    {
      year: "2025",
      stream: "m",
      session: "main",
      url: `${ANNALES}/VUc5WWNPWjNiTHUwQko3cTVmNnNnZz09`,
      localPdfUrls: ["/subjects/M/2025/sujet-1.pdf", "/subjects/M/2025/sujet-2.pdf"],
      pdfUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2025/dzexams-bac-sciences-naturelles-1554243.pdf",
      page: "access_confirmed",
      contentVerified: false,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-31) : titre BAC 2025 filière Maths confirmé ; viewer 0 pages ; lien تحميل observé. Octets PDF non récupérés (TLS). Encodé 4D sous l id 2025-m depuis énoncé + corrigé officiels eddirasa (hub Maths : carte entraînement, pas consultation)."
    },
    {
      year: "2024",
      stream: "m",
      session: "main",
      url: `${ANNALES}/Y200ZkJ4b092OS9JZ0w3ck4zemNJZz09`,
      localPdfUrls: ["/subjects/M/2024/sujet-1.pdf", "/subjects/M/2024/sujet-2.pdf"],
      pdfUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2024/dzexams-bac-sciences-naturelles-1482576.pdf",
      page: "access_confirmed",
      contentVerified: false,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-31) : titre BAC 2024 filière Maths confirmé ; viewer 0 pages ; lien تحميل observé. Octets PDF non récupérés (TLS). Encodé 4D sous l id 2024-m depuis énoncé + corrigé officiels eddirasa (hub Maths : carte entraînement, pas consultation)."
    },
    {
      year: "2023",
      stream: "m",
      session: "main",
      url: `${ANNALES}/RHdQRjNWUTg5b1VwaGVlKzIxT01EUT09`,
      localPdfUrls: ["/subjects/M/2023/sujet-1.pdf", "/subjects/M/2023/sujet-2.pdf"],
      pdfUrl:
        "https://www.dzexams.com/uploads/sujets/officiels/bac/2023/dzexams-bac-sciences-naturelles-1077342.pdf",
      page: "access_confirmed",
      contentVerified: false,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-31) : titre BAC 2023 filière Maths confirmé ; viewer 0 pages ; lien تحميل observé. Octets PDF non récupérés (TLS). Encodé 4D sous l id 2023-m depuis énoncé + corrigé officiels eddirasa (hub Maths : carte entraînement, pas consultation)."
    },
    {
      year: "2022",
      stream: "m",
      session: "main",
      url: `${ANNALES}/bFpLK2JlVmpzUzMzYTFTSnpjcDZGZz09`,
      localPdfUrls: ["/subjects/M/2022/sujet-1.pdf", "/subjects/M/2022/sujet-2.pdf"],
      pdfUrl: "https://www.dzexams.com/uploads/sujets/officiels/bac/2022/dzexams-bac-sciences-1777391.pdf",
      page: "access_confirmed",
      contentVerified: false,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-31) : titre BAC 2022 filière Maths confirmé ; viewer 0 pages ; lien تحميل observé. Octets PDF non récupérés (TLS). Encodé 4D sous l id 2022-m depuis énoncé + corrigé officiels eddirasa (hub Maths : carte entraînement, pas consultation)."
    },
    {
      year: "2021",
      stream: "m",
      localPdfUrls: ["/subjects/M/2021/sujet-1.pdf", "/subjects/M/2021/sujet-2.pdf"],
      session: "main",
      url: `${ANNALES}/T2tYS3FTcFRwWCtCbXV2QmFyRTcydz09`,
      page: "consulted",
      contentVerified: true,
      attachments: true,
      viewer: "ok",
      notes:
        "Page ouverte (2026-08-31) : 12 pages ; pièces jointes sciences-m-bac2021 + sciences-m-bac2021-correction ; couche texte inversée lisible. Sujet 1 : CMH et greffe rénale ; Macrolide / Mex.R. Encodé 4D sous l id 2021-m (hub Maths : carte entraînement, pas consultation)."
    },
    {
      year: "2020",
      stream: "m",
      localPdfUrls: ["/subjects/M/2020/sujet-1.pdf", "/subjects/M/2020/sujet-2.pdf"],
      session: "main",
      url: `${ANNALES}/dlFvUnNHKzlTdm5xZHJHMm4vL2hYZz09`,
      page: "consulted",
      contentVerified: true,
      attachments: true,
      viewer: "ok",
      notes:
        "Page ouverte (2026-08-30) : 10 pages ; pièces jointes sciences-m-bac2020 + sciences-m-bac2020-correction ; sujet : structure des protéines/électrophorèse, cancer de la peau (Ras/p53), CMH et rejet de greffe."
    },
    {
      year: "2019",
      stream: "m",
      session: "main",
      url: `${ANNALES}/b2w2cDdSYTdOK05FMjNEMnNGeUlsdz09`,
      localPdfUrls: ["/subjects/M/2019/sujet-1.pdf", "/subjects/M/2019/sujet-2.pdf"],
      pdfUrl: "https://www.dzexams.com/uploads/sujets/officiels/bac/2019/dzexams-bac-sciences-2280992.pdf",
      page: "access_confirmed",
      contentVerified: true,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-30) : titre et filière confirmés; viewer « 0 pages » ; lien de téléchargement direct présent. Contenu du PDF téléchargé et validé via lien direct (HTTP 200, en-tête %PDF, fichier complet)."
    },
    {
      year: "2018",
      stream: "m",
      session: "main",
      url: `${ANNALES}/aDMxL2FtWlZwZ3NmeThCMG5WNk50UT09`,
      localPdfUrls: ["/subjects/M/2018/sujet-1.pdf", "/subjects/M/2018/sujet-2.pdf"],
      pdfUrl: "https://www.dzexams.com/uploads/sujets/officiels/bac/2018/dzexams-bac-sciences-1967487.pdf",
      page: "access_confirmed",
      contentVerified: true,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-30) : titre et filière confirmés; viewer « 0 pages » ; lien تحميل présent. PDF dzexams validé mécaniquement. Corrigé eddirasa OCR RTL (2026-09-01) : https://eddirasa.com/wp-content/uploads/2018/07/eddirasa-com-correction-bac-math-science-2018.pdf (6 p., 7+13/6+14 ; VIH/LT4/IL-2 ; Ac/tétanos ; ribonucléase). Énoncé 2018 M non lu ici. 4D non encodé."
    },
    {
      year: "2017",
      stream: "m",
      // Session exceptionnelle : fichiers distincts de la session principale
      // (sha256 différents). L'entrée pointait auparavant vers les PDF de la
      // session principale, ce qui faisait afficher le mauvais sujet à l'élève
      // et laissait les vrais PDF orphelins.
      localPdfUrls: ["/subjects/M/2017/exceptional/sujet-1.pdf", "/subjects/M/2017/exceptional/sujet-2.pdf"],
      session: "exceptional",
      url: `${ANNALES}/eU1zMTNYMTJTLzROeWhLTkxaajRWZz09`,
      page: "consulted",
      contentVerified: true,
      attachments: true,
      viewer: "ok",
      notes:
        "Page ouverte (2026-08-30). En-tête : « الدورة الاستثنائية 2017 », شعبة رياضيات. Pièces jointes bac2017_2-sciences-m + bac2017_2-sciences-m-correction ; 11 pages ; sujet : immunité/lyse, traduction, immunoglobulines, structures protéiques (Rastop)."
    },
    {
      year: "2017",
      stream: "m",
      session: "main",
      url: `${ANNALES}/bEdWa2IycjEzcUY1S3FmUnpxdzhrQT09`,
      localPdfUrls: ["/subjects/M/2017/sujet-1.pdf", "/subjects/M/2017/sujet-2.pdf"],
      pdfUrl: "https://www.dzexams.com/uploads/sujets/officiels/bac/2017/dzexams-bac-sciences-2275712.pdf",
      page: "access_confirmed",
      contentVerified: true,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-30) : titre et filière confirmés; viewer « 0 pages » ; lien de téléchargement direct présent (chemin /2017/, session 1). Contenu du PDF téléchargé et validé via lien direct (HTTP 200, en-tête %PDF, fichier complet)."
    },
    {
      year: "2016",
      stream: "m",
      localPdfUrls: ["/subjects/M/2016/sujet-1.pdf", "/subjects/M/2016/sujet-2.pdf"],
      session: "main",
      url: `${ANNALES}/TW9GY3FMeVdkeFBBNGIwMmppdi9xQT09`,
      page: "consulted",
      contentVerified: true,
      attachments: true,
      viewer: "ok",
      notes:
        "Page ouverte (2026-08-30) : 11 pages ; pièces jointes sciences-m-bac2016 + sciences-m-bac2016-correction ; sujet : traduction/Anagène, immunité humorale, membrane cellulaire/CMH."
    },
    {
      year: "2015",
      stream: "m",
      session: "main",
      url: `${ANNALES}/QjZpdDhZUjhQOXhSMzZvQnFvVlFjQT09`,
      localPdfUrls: ["/subjects/M/2015/sujet-1.pdf", "/subjects/M/2015/sujet-2.pdf"],
      pdfUrl: "https://www.dzexams.com/uploads/sujets/officiels/bac/2015/dzexams-bac-sciences-2723927.pdf",
      page: "access_confirmed",
      contentVerified: true,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-30) : titre et filière confirmés; viewer « 0 pages » ; lien de téléchargement direct présent. Contenu du PDF téléchargé et validé via lien direct (HTTP 200, en-tête %PDF, fichier complet)."
    },
    {
      year: "2014",
      stream: "m",
      session: "main",
      url: `${ANNALES}/MXlQMjVhL2ZLK25mcEpTWnI5N3JtQT09`,
      localPdfUrls: ["/subjects/M/2014/sujet-1.pdf", "/subjects/M/2014/sujet-2.pdf"],
      pdfUrl: "https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-2369148.pdf",
      page: "access_confirmed",
      contentVerified: true,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-30) : titre et filière confirmés; viewer « 0 pages » ; lien de téléchargement direct présent. Contenu du PDF téléchargé et validé via lien direct (HTTP 200, en-tête %PDF, fichier complet)."
    },
    {
      year: "2013",
      stream: "m",
      session: "main",
      url: `${ANNALES}/UmdYdlc3em1RWmJQWEJCbW52Vm12dz09`,
      localPdfUrls: ["/subjects/M/2013/sujet-1.pdf", "/subjects/M/2013/sujet-2.pdf"],
      pdfUrl: "https://www.dzexams.com/uploads/sujets/officiels/bac/2013/dzexams-bac-sciences-2770867.pdf",
      page: "access_confirmed",
      contentVerified: true,
      attachments: false,
      viewer: "blocked",
      notes:
        "Page ouverte (2026-08-30) : titre et filière confirmés; viewer « 0 pages » ; lien de téléchargement direct présent. Contenu du PDF téléchargé et validé via lien direct (HTTP 200, en-tête %PDF, fichier complet)."
    }
  ]
};

/** Regroupe les entrées par filière, années décroissantes. */
export function archiveByStream() {
  const groups = {};
  for (const [id, stream] of Object.entries(ARCHIVE.streams)) {
    groups[id] = {
      ...stream,
      entries: ARCHIVE.entries
        .filter((e) => e.stream === id)
        .sort((a, b) => (a.year === b.year ? 0 : a.year < b.year ? 1 : -1))
    };
  }
  return groups;
}

const SESSION_ORDER = { main: 0, exceptional: 1 };

/** Années de consultation pour une filière, une carte par année. */
export function catalogYearsForStream(streamId) {
  const entries = ARCHIVE.entries.filter((e) => e.stream === streamId);
  const years = [...new Set(entries.map((e) => e.year))].sort((a, b) => (a < b ? 1 : -1));
  return years.map((year) => ({
    year,
    entries: entries
      .filter((e) => e.year === year)
      .sort((a, b) => (SESSION_ORDER[a.session] ?? 9) - (SESSION_ORDER[b.session] ?? 9))
  }));
}
