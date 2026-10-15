// secret.ts — obtenir un JWT_SECRET sans bloquer le développement
// (sprint 59).
//
// Règle d'origine : pas de secret ⇒ refus de démarrer. L'intention est juste —
// un secret par défaut en production rend les jetons forgeables, donc tous les
// comptes usurpables. Mais appliquée sans distinction, elle bloque aussi le
// développeur qui clone le dépôt pour regarder l'application tourner, alors
// que celle-ci n'a besoin d'aucun compte pour fonctionner.
//
// Compromis retenu :
//   · en PRODUCTION, rien ne change — absence de secret = refus, sans appel ;
//   · en DÉVELOPPEMENT, un secret ÉPHÉMÈRE est tiré au hasard à chaque
//     démarrage, avec un avertissement visible. Éphémère est essentiel : les
//     jetons émis meurent au redémarrage, donc ce secret ne peut pas se
//     retrouver en production « par habitude ».

import { randomBytes } from 'node:crypto';

/**
 * Valeurs de template du dépôt (docker-compose.yml, README, anciens exemples).
 * En production, les utiliser comme JWT_SECRET rend les jetons forgeables par
 * quiconque a lu ce dépôt public — elles sont donc refusées, quelle que soit
 * leur longueur (36 caractères pour la valeur compose : elle passait le seuil
 * de 32).
 */
const SECRETS_PAR_DEFAUT_INTERDITS: readonly string[] = [
  'change-moi-64-caracteres-aleatoires',
  'change-me-strong',
  'change-moi-strong-123',
];

export interface ResolutionSecret {
  secret: string;
  /** Vrai si le secret a été tiré au hasard pour cette session. */
  ephemere: boolean;
  /** Message à journaliser (null si tout est normal). */
  avertissement: string | null;
}

export class SecretManquantError extends Error {
  constructor() {
    super(
      'REFUS DE DÉMARRAGE : JWT_SECRET manquant en production. ' +
        'Définissez-le (ex. openssl rand -hex 32) avant de déployer.',
    );
    this.name = 'SecretManquantError';
  }
}

export class SecretParDefautError extends Error {
  constructor() {
    super(
      'REFUS DE DÉMARRAGE : JWT_SECRET vaut une valeur de TEMPLATE de ce dépôt ' +
        '(publique — les jetons seraient forgeables). ' +
        'Générez-en un : openssl rand -hex 32.',
    );
    this.name = 'SecretParDefautError';
  }
}

/**
 * Résout le secret de signature des jetons.
 * @throws SecretManquantError en production quand le secret est absent.
 * @throws SecretParDefautError en production quand le secret vaut une valeur de template.
 */
export function resoudreSecret(
  env: { JWT_SECRET?: string; NODE_ENV?: string } = process.env,
): ResolutionSecret {
  const fourni = (env.JWT_SECRET ?? '').trim();
  if (fourni) {
    const production = env.NODE_ENV === 'production';
    if (production && SECRETS_PAR_DEFAUT_INTERDITS.includes(fourni)) {
      throw new SecretParDefautError();
    }
    const faible = fourni.length < 32;
    const modele = SECRETS_PAR_DEFAUT_INTERDITS.includes(fourni);
    return {
      secret: fourni,
      ephemere: false,
      avertissement: faible
        ? `[auth] JWT_SECRET court (${fourni.length} caractères) : 32 au minimum sont recommandés.`
        : modele
          ? "[auth] JWT_SECRET vaut une valeur de MODÈLE du dépôt : acceptable en développement, refusé en production, à remplacer avant tout déploiement."
          : null,
    };
  }

  const production = env.NODE_ENV === 'production';
  if (production) throw new SecretManquantError();

  return {
    secret: randomBytes(32).toString('hex'),
    ephemere: true,
    avertissement:
      '[auth] JWT_SECRET absent : secret ÉPHÉMÈRE généré pour cette session de développement.\n' +
      '[auth] Les comptes fonctionnent, mais toute session est invalidée au redémarrage.\n' +
      "[auth] En production, l'absence de secret reste un refus de démarrage.",
  };
}
