// ============================================================
// routageDomaine.ts — à quel DOMAINE du programme appartient la question ?
//
// POURQUOI CE MODULE EXISTE (audit du 14/10/2026, défaut §5.1).
// Le moteur servait `كيف تتشكل الجبال؟` (géologie) avec un cours sur l'ADN, et
// `ما هي البنيات الجيولوجية؟` avec un QCM sur les structures secondaires d'une
// protéine. Diagnostic : le score de pertinence NE SÉPARE PAS le bon du mauvais.
// Mesuré sur les deux populations —
//
//   réponses justes mais faibles  : 16, 19, 28
//   réponses fausses             : 13, 16, 19, 19
//
// Les deux se recouvrent totalement : aucun seuil ne peut les distinguer. En
// revanche, le DOMAINE sépare parfaitement, parce que la question dit toujours
// de quoi elle parle :
//
//   كيف تتشكل الجبال؟        → 6 extraits en géologie, dont un sur l'Himalaya
//   لماذا للتنفس مردود أعلى؟  → 0 extrait en énergétique
//
// Ce module ne fait qu'une chose : décider du domaine d'une question à partir de
// son vocabulaire. Il est PUR — aucune dépendance au moteur — donc mesurable
// seul. Le moteur lui fournit le vocabulaire de chaque domaine, construit sur
// les titres et mots-clés des extraits déjà indexés : rien à écrire à la main,
// rien à maintenir quand une leçon s'ajoute.
// ============================================================

export type VocabulaireDomaine = Record<number, Set<string>>;

/**
 * Un jeton sans son article défini. En arabe « ال » colle au mot : « الجبال » et
 * « جبال » sont le même mot pour un élève, jamais pour un `Set`. Sans ce
 * décollement, le routage ne reconnaîtrait que les formes déjà présentes dans un
 * titre — c'est-à-dire les questions déjà bien formulées.
 */
export function sansArticle(token: string): string {
  // Le reste doit rester identifiable : « الغوص » → « غوص » (3 lettres, oui),
  // mais « الب » → « ب » (1 lettre, non) et « الات » → « ات » (2, non).
  if (token.length >= 5 && token.startsWith('ال')) return token.slice(2);
  return token;
}

/** Construit le vocabulaire de chaque domaine. Une entrée sans domaine (les
 *  fiches de méthode, les guides, le livre) est TRANSVERSE : elle n'identifie
 *  aucun domaine et ne doit donc peser sur aucun. */
export function construireVocabulaire(
  entrees: Array<{ domaine: number | null; tokens: string[] }>,
): VocabulaireDomaine {
  const vocab: VocabulaireDomaine = {};
  for (const e of entrees) {
    if (e.domaine == null) continue;
    const set = (vocab[e.domaine] ||= new Set<string>());
    for (const t of e.tokens) {
      if (!t || t.length < 3) continue;
      set.add(t);
      set.add(sansArticle(t));
    }
  }
  return vocab;
}

/**
 * Domaine probable de la question, ou `null` si l'on ne peut pas trancher.
 *
 * Chaque jeton trouvé rapporte d'autant MOINS qu'il est partagé entre plusieurs
 * domaines : un mot présent partout (« دراسة », « دور ») n'identifie rien, un mot
 * propre à un domaine (Himalaya, ribosome) identifie beaucoup. C'est le même
 * principe qu'une fréquence de document, appliqué à trois domaines.
 *
 * On exige un vainqueur NET (strictement supérieur au deuxième). En cas de doute
 * on rend `null` : le moteur ne filtre alors rien, plutôt que de filtrer à tort.
 */
export function domaineProbable(tokens: string[], vocab: VocabulaireDomaine): number | null {
  if (tokens.length === 0) return null;
  const domaines = Object.keys(vocab).map(Number);
  if (domaines.length < 2) return null;

  const scores = domaines
    .map((d) => {
      let poids = 0;
      for (const t of tokens) {
        if (!t || t.length < 3) continue;
        const formes = [t, sansArticle(t)];
        if (!formes.some((f) => vocab[d]?.has(f))) continue;
        // Partagé par plusieurs domaines → ne les distingue pas. Présent dans
        // TOUS → ne distingue rien du tout : poids nul, et non un tiers de
        // point. Sinon le domaine au vocabulaire le plus court gagnait par
        // simple effet de division (« دور / دراسة / نشاط / علاقة » désignaient
        // un domaine alors qu'ils sont communs aux trois).
        const dans = domaines.filter((x) => formes.some((f) => vocab[x]?.has(f))).length;
        if (dans >= domaines.length) continue;
        poids += 1 / dans;
      }
      // Normalisation par la TAILLE du vocabulaire : le domaine le plus fourni
      // contient mécaniquement plus de mots (dont des mots banals comme
      // « تتشكل »). Sans cette division, la géologie ne gagnait jamais contre un
      // domaine 2,3 fois plus gros. Racine carrée : on tempère sans écraser.
      return { d, s: poids / Math.sqrt(vocab[d]?.size || 1) };
    })
    .sort((a, b) => b.s - a.s);

  const [premier, second] = scores;
  if (premier.s <= 0) return null;
  // PLANCHER DE BRUIT : un mot banal présent dans deux domaines produit un
  // score réel mais insignifiant (« مثال » → 0,0108). En dessous, on ne prétend
  // pas avoir identifié un sujet — sinon un geste comme « أعطني مثال » passerait
  // pour une question de cours et serait traité comme telle.
  if (premier.s < 0.02) return null;
  // Vainqueur net : strictement devant, et avec de quoi s'appuyer.
  if (second && second.s >= premier.s) return null;
  return premier.d;
}

/** Domaine d'une unité du programme. `null` = extrait transverse (méthode,
 *  guide, livre) : il n'appartient à aucun domaine, donc il n'est jamais
 *  disqualifié par le filtre. */
export function domaineDeUnite(
  unitId: number | null | undefined,
  bornes: Record<number, [number, number]>,
): number | null {
  if (unitId == null) return null;
  for (const [d, [min, max]] of Object.entries(bornes)) {
    if (unitId >= min && unitId <= max) return Number(d);
  }
  return null;
}
