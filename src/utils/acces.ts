// ============================================================
// acces.ts — PASSE-GARDE d'accès client (miroir de
// src/server/facturation.ts). Le serveur reste la source de
// vérité ; ici on garde une LECTURE CACHE pour que :
//   · l'app offline-first garde son comportement (bonne foi) ;
//   · l'échéance tictaque même sans réseau (le 30 juin est local).
//
// Modèle (décision propriétaire 23-24/10/2026) :
//   · invité            → unité 1 seulement ;
//   · essai (30 jours)  → tout ;
//   · abonnement saison → tout, jusqu'au 30 juin ;
//   · gratuit           → unité 1 seulement.
// LIMITE ASSUMÉE : la lecture locale peut être trafiquée par un
// élève déterminé — la facturation (codes, échéances) reste
// côté serveur.
// ============================================================

import { getApiToken } from './api';

export const UNITE_GRATUITE = 1;
export const PRIX_SAISON_DA = 1200;

export type StatutAcces = 'invite' | 'essai' | 'abonnement' | 'gratuit';

export interface EtatAccesClient {
  statut: StatutAcces;
  /** Fin d'essai ou d'abonnement « YYYY-MM-DD » (null sinon). */
  expireLe: string | null;
}

const CLE_ACCES = 'kunz_acces';
const CLE_APPAREIL = 'kunz_appareil';

/**
 * Empreinte d'appareil — socle WEB : UUID tiré du CSPRNG au premier
 * lancement, gardé dans le stockage local. Sur Android (APK), c'est
 * `identiteAppareilAsync()` qui prend le relais avec l'ANDROID_ID natif.
 * L'empreinte NE quitte PAS l'appareil : elle ne sert qu'à lier la licence.
 */
export function identiteAppareil(): string {
  let id = localStorage.getItem(CLE_APPAREIL);
  if (!id || id.length < 16) {
    const octets = new Uint8Array(16);
    crypto.getRandomValues(octets);
    id = Array.from(octets, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(CLE_APPAREIL, id);
  }
  return id;
}

/** Empreinte résolue une seule fois par session de l'app. */
let empreinteResolue: Promise<string> | null = null;

/**
 * Empreinte d'appareil ASYNC — la vraie dans l'APK :
 * sur Android natif, l'ANDROID_ID du système (@capacitor/device) est
 * utilisé — il SURVIT à la désinstallation/réinstallation de l'app, donc
 * l'élève qui réinstalle ne perd PAS son abonnement (moins de support
 * WhatsApp). Sur le web (et en cas d'échec natif), repli sur l'UUID
 * CSPRNG du socle web. Les modules Capacitor sont importés dynamiquement :
 * en web pur ils ne sont jamais chargés.
 */
export function identiteAppareilAsync(): Promise<string> {
  if (!empreinteResolue) {
    empreinteResolue = (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { Device } = await import('@capacitor/device');
          const info = await Device.getId();
          if (typeof info.identifier === 'string' && info.identifier.length >= 8) {
            localStorage.setItem(CLE_APPAREIL, info.identifier);
            return info.identifier;
          }
        }
      } catch {
        // Web pur / plugin absent : le repli CSPRNG est correct ici.
      }
      return identiteAppareil();
    })();
  }
  return empreinteResolue;
}

function lireCache(): EtatAccesClient | null {
  try {
    const brut = localStorage.getItem(CLE_ACCES);
    if (!brut) return null;
    const valeur = JSON.parse(brut) as Partial<EtatAccesClient> | null;
    if (!valeur || typeof valeur.statut !== 'string') return null;
    return { statut: valeur.statut as StatutAcces, expireLe: valeur.expireLe ?? null };
  } catch {
    return null;
  }
}

function ecrireCache(etat: EtatAccesClient): void {
  try {
    localStorage.setItem(CLE_ACCES, JSON.stringify(etat));
  } catch {
    // Stockage plein / privé : l'app continue, l'état sera re-fetché au pire cas.
  }
}

/** État courant : invité sans token, sinon le cache (défaut prudent : gratuit). */
export function accesActuel(): EtatAccesClient {
  if (!getApiToken()) return { statut: 'invite', expireLe: null };
  return lireCache() ?? { statut: 'gratuit', expireLe: null };
}

/** Jours restants calculés LOCALEMENT (l'échéance ne ment jamais). */
export function joursRestantsDe(expireLe: string | null): number {
  if (!expireLe) return 0;
  const fin = Date.parse(`${expireLe}T23:59:59.999Z`);
  if (Number.isNaN(fin)) return 0;
  return Math.max(0, Math.ceil((fin - Date.now()) / (24 * 60 * 60 * 1000)));
}

/** L'état affichable, corrigé par l'horloge locale (jamais un essai zombie). */
function accesEffectif(): EtatAccesClient {
  const etat = accesActuel();
  if ((etat.statut === 'essai' || etat.statut === 'abonnement') && etat.expireLe) {
    const fin = Date.parse(`${etat.expireLe}T23:59:59.999Z`);
    if (!Number.isNaN(fin) && fin < Date.now()) {
      return { statut: 'gratuit', expireLe: null };
    }
  }
  return etat;
}

/**
 * Le contenu de cette unité est-il ouvert ?
 * Unité 1 : TOUJOURS (invité compris) — c'est la promesse gratuite.
 */
export function uniteOuverte(unitId: number | undefined | null): boolean {
  if (unitId === UNITE_GRATUITE) return true;
  const { statut } = accesEffectif();
  return statut === 'essai' || statut === 'abonnement';
}

/**
 * Rubrique SANS unité propre (sujets BAC, blancs, examens hub…) :
 * ouverte pendant l'essai ou l'abonnement, fermée sinon.
 */
export function rubriquePayanteOuverte(): boolean {
  const { statut } = accesEffectif();
  return statut === 'essai' || statut === 'abonnement';
}

export function joursRestants(): number {
  return joursRestantsDe(accesActuel().expireLe);
}

/** Réponse de GET /api/billing/entitlement. */
export interface ReponseEntitlement {
  statut: 'abonnement' | 'essai' | 'gratuit';
  expireLe: string | null;
  joursRestants: number;
  prixSaisonDA: number;
  uniteGratuite: number;
}

/** Interroge le serveur et rejoue le cache. Échec réseau = garder l'ancien état (grace). */
export async function rafraichirAcces(): Promise<EtatAccesClient> {
  const token = getApiToken();
  if (!token) {
    ecrireCache({ statut: 'invite', expireLe: null });
    return { statut: 'invite', expireLe: null };
  }
  try {
    const empreinte = await identiteAppareilAsync();
    const res = await fetch('/api/billing/entitlement', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-appareil-id': empreinte,
      },
    });
    if (res.status === 401) {
      // Token expiré : l'état retombe sur invité (l'app reconnectera l'élève).
      ecrireCache({ statut: 'invite', expireLe: null });
      return { statut: 'invite', expireLe: null };
    }
    const data = (await res.json()) as Partial<ReponseEntitlement> | {};
    if (!res.ok || !('statut' in data)) throw new Error('request_failed');
    const etat: EtatAccesClient = {
      statut: (data as ReponseEntitlement).statut,
      expireLe: (data as ReponseEntitlement).expireLe ?? null,
    };
    ecrireCache(etat);
    return etat;
  } catch {
    // Hors ligne : on RETIENT le dernier état connu (la bonne foi d'abord,
    // l'échéance locale verrouille toute seule quand arrive le 30 juin).
    return accesActuel();
  }
}

/** Réponse de POST /api/billing/activer (erreurs = codes du serveur). */
export type ResultatActivationClient =
  | { ok: true; expireLe: string }
  | { ok: false; erreur: string };

/** Active un code d'activation. Rejoue l'état en cas de succès. */
export async function activerCode(code: string): Promise<ResultatActivationClient> {
  const token = getApiToken();
  if (!token) return { ok: false, erreur: 'not_connected' };
  try {
    const empreinte = await identiteAppareilAsync();
    const res = await fetch('/api/billing/activer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code, appareilId: empreinte }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; expireLe?: string };
    if (!res.ok || !data.expireLe) {
      return { ok: false, erreur: data.error || 'request_failed' };
    }
    ecrireCache({ statut: 'abonnement', expireLe: data.expireLe });
    return { ok: true, expireLe: data.expireLe };
  } catch {
    return { ok: false, erreur: 'network' };
  }
}
