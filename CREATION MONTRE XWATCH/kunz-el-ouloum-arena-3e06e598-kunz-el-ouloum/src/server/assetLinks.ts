// assetLinks.ts — Digital Asset Links : la brique qui rend une TWA crédible (H2).
//
// Ce que c'est, en clair
// ----------------------
// Une application Android « TWA » (Trusted Web Activity) n'est qu'un navigateur
// sans barre d'adresse qui affiche le site. Pour qu'Android accepte d'effacer sa
// barre d'adresse — c'est-à-dire pour que l'application ne soit pas perçue comme
// « un site dans une coquille » —, le SITE doit déclarer qu'il appartient bien à
// l'application : c'est le fichier `/.well-known/assetlinks.json`, où figure
// l'empreinte SHA-256 du certificat de signature de l'APK.
//
// La règle de ce module : NE JAMAIS SERVIR UN PLACEHOLDER COMME S'IL ÉTAIT VALIDE.
// Un `assetlinks.json` incomplet ne fait pas échouer le build : il fait
// silencieusement disparaître la barre d'adresse… non — il fait silencieusement
// ÉCHOUER la vérification, et l'application publiée affiche une barre d'adresse
// à chaque écran, sans que personne ne comprenne pourquoi. Mieux vaut un 404
// explicite et une trace dans les journaux du serveur qu'un fichier présent mais
// inexploitable.
//
// Ce module est PUR (aucun accès disque) : il décide, il ne lit pas. Le serveur
// lit le fichier et lui passe le contenu. C'est ce qui le rend testable.

export type StatutAssetLinks = 'valide' | 'absent' | 'placeholder' | 'invalide';

export interface VerdictAssetLinks {
  statut: StatutAssetLinks;
  /** JSON à servir, uniquement quand `statut === 'valide'`. */
  json?: unknown;
  /** Message humain : ce qu'il faut faire, ou ce qui ne va pas. */
  message: string;
}

/** Marqueurs du gabarit non renseigné (cf. `store/assetlinks.json`). */
const MARQUEURS_PLACEHOLDER = ['REMPLACER', 'REPLACE_ME', 'TODO', 'xxxxxxxx'];

/**
 * Vérifie qu'un contenu d'`assetlinks.json` est SERVABLE.
 * @param contenu contenu brut du fichier, ou `null` s'il est absent
 */
export function verifierAssetLinks(contenu: string | null): VerdictAssetLinks {
  if (contenu === null || contenu.trim() === '') {
    return {
      statut: 'absent',
      message:
        "store/assetlinks.json est absent : l'application Android publiée affichera sa barre d'adresse. " +
        'Voir store/README.md, étape « Digital Asset Links ».',
    };
  }

  const restes = MARQUEURS_PLACEHOLDER.filter((m) => contenu.includes(m));
  if (restes.length > 0) {
    return {
      statut: 'placeholder',
      message:
        `store/assetlinks.json contient encore le gabarit (${restes.join(', ')}). ` +
        'Remplacer le nom de paquet et l’empreinte SHA-256 du certificat de signature, ' +
        'puis redémarrer le serveur. Servir ce fichier en l’état ne débloquerait rien : ' +
        'Android rejetterait la vérification, et l’application publiée resterait avec la barre d’adresse.',
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(contenu);
  } catch (e) {
    return {
      statut: 'invalide',
      message: `store/assetlinks.json n’est pas un JSON valide : ${(e as Error).message}`,
    };
  }

  // Structure attendue : un tableau de déclarations, chacune avec une cible
  // Android et au moins une empreinte SHA-256 de certificat.
  if (!Array.isArray(json) || json.length === 0) {
    return { statut: 'invalide', message: 'store/assetlinks.json doit être un tableau non vide.' };
  }
  for (const declaration of json as Record<string, unknown>[]) {
    const cible = declaration?.target as Record<string, unknown> | undefined;
    if (cible?.namespace !== 'android_app') {
      return {
        statut: 'invalide',
        message: 'chaque déclaration doit viser {"namespace":"android_app", …}.',
      };
    }
    if (typeof cible.package_name !== 'string' || cible.package_name.length < 5) {
      return { statut: 'invalide', message: 'chaque déclaration doit porter un « package_name ».' };
    }
    const empreintes = cible.sha256_cert_fingerprints;
    if (!Array.isArray(empreintes) || empreintes.length === 0) {
      return {
        statut: 'invalide',
        message:
          'chaque déclaration doit porter au moins une empreinte dans « sha256_cert_fingerprints » ' +
          '(obtenue par `keytool -list -v -keystore …` ou par la Play Console).',
      };
    }
    for (const e of empreintes as unknown[]) {
      if (typeof e !== 'string' || !/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(e)) {
        return {
          statut: 'invalide',
          message:
            'empreinte SHA-256 au mauvais format : 32 octets en hexadécimal majuscule séparés par « : » — ' +
            `reçu : ${JSON.stringify(e)}`,
        };
      }
    }
  }

  return { statut: 'valide', json, message: 'Digital Asset Links servi (vérification TWA possible).' };
}
