// ============================================================
// corsApk.cablage.test.ts — verrou de CÂBLAGE pour le CORS APK.
//
// Le WebView Capacitor (origine https://localhost) applique le mode CORS
// strict : sans Access-Control-Allow-Origin, TOUTES les réponses d'API
// sont bloquées côté téléphone (l'inscription échouait avec le message
// générique « تعذّر إنشاء الحساب »). Ces verrous empêchent toute
// régression du middleware développé le 23/10/2026 :
//   · la liste d'origines reste FERMÉE (jamais « * ») ;
//   · l'origine est reflétée (pas une constante large) ;
//   · le preflight OPTIONS reçoit une réponse 204 explicite ;
//   · OPTIONS ne peut atteindre aucune route métier.
// ============================================================
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const lire = (...p: string[]) => fs.readFileSync(path.resolve(process.cwd(), ...p), 'utf-8');
const serverSrc = () => lire('server.ts');

const blocCors = (src: string) => {
  const debut = src.indexOf('const originesApk = new Set(');
  expect(debut).toBeGreaterThan(-1);
  return src.slice(debut, src.indexOf('app.get("/api/health"'));
};

describe('middleware CORS pour l’APK Capacitor', () => {
  it('la liste d’origines est fermée : les deux schémas Capacitor, jamais de joker', () => {
    const src = blocCors(serverSrc());
    expect(src).toContain('"https://localhost"'); // Capacitor Android (androidScheme https)
    expect(src).toContain('"capacitor://localhost"'); // Capacitor iOS
    expect(src).not.toContain('Access-Control-Allow-Origin: "*"');
    expect(src).not.toContain('Access-Control-Allow-Origin\', "*"');
  });

  it('l’origine envoyée au client est celle REÇUE (reflet), avec Vary: Origin', () => {
    const src = blocCors(serverSrc());
    expect(src).toContain('res.setHeader("Access-Control-Allow-Origin", origine)');
    expect(src).toContain('res.setHeader("Vary", "Origin")');
  });

  it('le preflight OPTIONS reçoit une réponse 204 courte, avant les routes', () => {
    const src = blocCors(serverSrc());
    expect(src).toContain('if (req.method === "OPTIONS")');
    expect(src).toContain('res.status(204).end()');
    // Le middleware est déclaré AVANT la première route : un OPTIONS ne
    // peut jamais tomber dans le 404/405 métier.
    const tout = serverSrc();
    expect(tout.indexOf('const originesApk = new Set(')).toBeLessThan(
      tout.indexOf('app.get("/api/health"'),
    );
  });

  it('les en-têtes de requête autorisés couvrent JSON + jeton', () => {
    const src = blocCors(serverSrc());
    expect(src).toContain('"Content-Type, Authorization, X-Requested-With"');
  });
});
