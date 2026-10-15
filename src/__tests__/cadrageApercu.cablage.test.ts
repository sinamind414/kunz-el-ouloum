// ============================================================
// cadrageApercu.cablage.test.ts — verrou de CÂBLAGE.
//
// Le 14/10/2026, l'aperçu de l'application était un ÉCRAN BLANC : le serveur
// envoyait « X-Frame-Options: DENY » et « frame-ancestors 'none' », alors que
// l'aperçu affiche l'application DANS UNE IFRAME. Le navigateur refusait le
// cadre, sans message visible côté élève — la panne la plus difficile à
// diagnostiquer, parce que le serveur répond 200.
//
// Ces verrous empêchent les deux erreurs symétriques :
//   · ouvrir le cadre pour tout le monde (régression de sécurité) ;
//   · refermer le cadre par défaut (retour de l'écran blanc).
// Le mode aperçu doit rester EXPLICITE, nommé, et sans joker.
// ============================================================
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const serverSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');

/** Retire commentaires et doc : on verrouille le CODE, pas les explications. */
const sansCommentaires = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

describe('cadrage de l’aperçu — le mode iframe est explicite, jamais implicite', () => {
  it('le refus de cadrage reste le DÉFAUT (protection anti-clickjacking)', () => {
    const code = sansCommentaires(serverSrc());
    // Le repli existe toujours : sans FRAME_ANCESTORS, on refuse.
    expect(code).toContain("frame-ancestors 'none'");
    // Et X-Frame-Options: DENY n'est posé QUE dans la branche de refus.
    expect(code).toMatch(/if \(!ancetresCadre\) \{[\s\S]{0,160}X-Frame-Options", "DENY"/);
    // L'invariant porte sur l'EN-TÊTE POSÉ (setHeader), pas sur le mot : il peut
    // légitimement apparaître dans un message de journal.
    expect(code.match(/setHeader\("X-Frame-Options"/g) || []).toHaveLength(1);
  });

  it('l’ouverture du cadre est pilotée par FRAME_ANCESTORS, et n’existe pas en dur', () => {
    const code = sansCommentaires(serverSrc());
    expect(code).toContain('process.env.FRAME_ANCESTORS');
    // La liste vient de l'environnement : aucune origine n'est écrite en dur
    // dans le code du serveur (sinon l'aperçu d'une autre machine casse).
    expect(code).toContain('`frame-ancestors ${ancetresCadre}`');
  });

  it('aucun joker : jamais « frame-ancestors * » ni une origine nulle', () => {
    const code = sansCommentaires(serverSrc());
    expect(code).not.toMatch(/frame-ancestors\s*\*/);
    expect(code).not.toContain('frame-ancestors *');
    // Un refus muet (valeur vide passée telle quelle) serait pire que DENY :
    // la valeur est découpée en espaces et testée pour être non vide.
    expect(code).toContain('(process.env.FRAME_ANCESTORS || "").trim()');
  });

  it('quand le cadre est ouvert, X-Frame-Options disparaît vraiment de la réponse', () => {
    const code = sansCommentaires(serverSrc());
    // Le setHeader de X-Frame-Options est DANS la garde : la branche « aperçu »
    // n'émet aucun X-Frame-Options (ALLOW-FROM est abandonné partout, et le
    // laisser à DENY annulerait l'autorisation).
    const garde = code.indexOf('if (!ancetresCadre) {');
    const xfo = code.indexOf('setHeader("X-Frame-Options"');
    expect(garde).toBeGreaterThan(-1);
    expect(xfo).toBeGreaterThan(garde);
  });
});
