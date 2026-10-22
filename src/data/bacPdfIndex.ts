// bacPdfIndex.ts - INDEX DES PDF OFFICIELS telechargeables (rubrique sujet
// BAC). Autorisation proprietaire 2026-10-22 (droits ONEC resolus) : les
// copies PDF de la piste SE vivent dans public/bac-sujets/ et sont servies
// en statique. Genere depuis l'inventaire MIFTAH (subjects/manifest.json,
// piste SE uniquement - l'app cible sciences experimentales). AUCUNE entree
// sans fichier reel sur disque : le verrou bacPdf.lock.test.ts relit le
// DISQUE a chaque run.
//
// Regle d'honnetete : l'UI n'affiche un bouton de telechargement QUE pour
// les entrees presentes ici - jamais de lien mort, jamais de sujet non lu.

export interface EntreePdfBac {
  year: number;
  sujet: 1 | 2;
  session: 'main' | 'exceptional';
  /** Chemin public servi en statique (public/bac-sujets/**). */
  chemin: string;
  pages: number;
  /** URL de provenance documentee (vide = collecte locale du proprietaire). */
  source: string;
}

export const BAC_PDF_INDEX: EntreePdfBac[] = [
  { year: 2013, sujet: 1, session: 'main', chemin: '/bac-sujets/2013/sujet-1.pdf', pages: 4, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2013/dzexams-bac-sciences-4463279.pdf' },
  { year: 2013, sujet: 2, session: 'main', chemin: '/bac-sujets/2013/sujet-2.pdf', pages: 4, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2013/dzexams-bac-sciences-4463279.pdf' },
  { year: 2014, sujet: 1, session: 'main', chemin: '/bac-sujets/2014/sujet-1.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-4380238.pdf' },
  { year: 2014, sujet: 2, session: 'main', chemin: '/bac-sujets/2014/sujet-2.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-4380238.pdf' },
  { year: 2015, sujet: 1, session: 'main', chemin: '/bac-sujets/2015/sujet-1.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2015/dzexams-bac-sciences-5906014.pdf' },
  { year: 2015, sujet: 2, session: 'main', chemin: '/bac-sujets/2015/sujet-2.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2015/dzexams-bac-sciences-5906014.pdf' },
  { year: 2016, sujet: 1, session: 'main', chemin: '/bac-sujets/2016/sujet-1.pdf', pages: 5, source: '' },
  { year: 2016, sujet: 2, session: 'main', chemin: '/bac-sujets/2016/sujet-2.pdf', pages: 5, source: '' },
  { year: 2017, sujet: 1, session: 'main', chemin: '/bac-sujets/2017/sujet-1.pdf', pages: 4, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2017/dzexams-bac-sciences-2581269.pdf' },
  { year: 2017, sujet: 2, session: 'main', chemin: '/bac-sujets/2017/sujet-2.pdf', pages: 4, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2017/dzexams-bac-sciences-2581269.pdf' },
  { year: 2018, sujet: 1, session: 'main', chemin: '/bac-sujets/2018/sujet-1.pdf', pages: 4, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2018/dzexams-bac-sciences-3509975.pdf' },
  { year: 2018, sujet: 2, session: 'main', chemin: '/bac-sujets/2018/sujet-2.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2018/dzexams-bac-sciences-3509975.pdf' },
  { year: 2019, sujet: 1, session: 'main', chemin: '/bac-sujets/2019/sujet-1.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2019/dzexams-bac-sciences-3051478.pdf' },
  { year: 2019, sujet: 2, session: 'main', chemin: '/bac-sujets/2019/sujet-2.pdf', pages: 4, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2019/dzexams-bac-sciences-3051478.pdf' },
  { year: 2020, sujet: 1, session: 'main', chemin: '/bac-sujets/2020/sujet-1.pdf', pages: 4, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2020/dzexams-bac-sciences-2356016.pdf' },
  { year: 2020, sujet: 2, session: 'main', chemin: '/bac-sujets/2020/sujet-2.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2020/dzexams-bac-sciences-2356016.pdf' },
  { year: 2021, sujet: 1, session: 'main', chemin: '/bac-sujets/2021/sujet-1.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2021/dzexams-bac-sciences-2728849.pdf' },
  { year: 2021, sujet: 2, session: 'main', chemin: '/bac-sujets/2021/sujet-2.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2021/dzexams-bac-sciences-2728849.pdf' },
  { year: 2022, sujet: 1, session: 'main', chemin: '/bac-sujets/2022/sujet-1.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2022/dzexams-bac-sciences-2311208.pdf' },
  { year: 2022, sujet: 2, session: 'main', chemin: '/bac-sujets/2022/sujet-2.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2022/dzexams-bac-sciences-2311208.pdf' },
  { year: 2023, sujet: 1, session: 'main', chemin: '/bac-sujets/2023/sujet-1.pdf', pages: 4, source: 'https://eddirasa.com/wp-content/uploads/2023/06/eddirasa.com-bac-sciences-se-2023.pdf' },
  { year: 2023, sujet: 2, session: 'main', chemin: '/bac-sujets/2023/sujet-2.pdf', pages: 6, source: 'https://eddirasa.com/wp-content/uploads/2023/06/eddirasa.com-bac-sciences-se-2023.pdf' },
  { year: 2024, sujet: 1, session: 'main', chemin: '/bac-sujets/2024/sujet-1.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2024/dzexams-bac-sciences-naturelles-1751784.pdf' },
  { year: 2024, sujet: 2, session: 'main', chemin: '/bac-sujets/2024/sujet-2.pdf', pages: 5, source: 'https://www.dzexams.com/uploads/sujets/officiels/bac/2024/dzexams-bac-sciences-naturelles-1751784.pdf' },
  { year: 2025, sujet: 1, session: 'main', chemin: '/bac-sujets/2025/sujet-1.pdf', pages: 11, source: '' },
  { year: 2025, sujet: 2, session: 'main', chemin: '/bac-sujets/2025/sujet-2.pdf', pages: 11, source: '' },
  { year: 2026, sujet: 1, session: 'main', chemin: '/bac-sujets/2026/sujet-1.pdf', pages: 5, source: '' },
  { year: 2026, sujet: 2, session: 'main', chemin: '/bac-sujets/2026/sujet-2.pdf', pages: 5, source: '' },
];

/** Le PDF officiel existe pour cette session (annee + sujet) ? */
export function pdfBacDisponible(year: number, sujet: number): boolean {
  return BAC_PDF_INDEX.some((e) => e.year === year && e.sujet === sujet);
}

/** Chemin public du PDF de session, ou null s'il n'est pas dans l'index. */
export function cheminPdfBac(year: number, sujet: number): string | null {
  const e = BAC_PDF_INDEX.find((x) => x.year === year && x.sujet === sujet);
  return e ? e.chemin : null;
}