/**
 * scripts/profigure/normalizeStandaloneSvgs.ts — Phase 2 « ProFigure »
 *
 * Normalise les 112 SVG standalone (110 schémas + 2 cibles svt) SANS redessiner :
 *  1. Marker orphelin  : si `url(#arrow)` est référencé sans <marker id="arrow">,
 *     injecte un marker standard (fill="context-stroke" → couleur du tracé appelant).
 *  2. Root <svg>       : classe `pfe-figure`, role="img", aria-label repris d'un
 *     contenu EXISTANT uniquement (<title> → <text> titre → <text> max font-size
 *     ≥ 18px). Aucun contenu inventé (règle AGENTS 5) : sinon pas d'aria-label.
 *  3. ids              : préfixe `pf-` sur tous les ids + réécriture de TOUTES les
 *     références internes (url(#…), href/xlink:href, sélecteurs CSS #id dans
 *     <style>, refs SMIL id.click) — garde-fou : collision pf-X déjà présent → erreur.
 *  4. Validation       : parse XML (jsdom), viewBox/width/height intacts, comptes
 *     d'éléments géométriques intacts, empreinte des textes <text>/<title>/<tspan>
 *     identique, toutes les références #… résolvent vers un id existant.
 *  5. Idempotence      : transform(transform(x)) === transform(x) exigé.
 *
 * Usage : npx tsx scripts/profigure/normalizeStandaloneSvgs.ts [--check]
 * Hors scripts/tools/ par AGENTS.md (répertoire « ne jamais modifier »).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DOSSIERS = ['public/assets/images/schemas', 'public/assets/svt'];

const MARKER_ARROW =
  '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" ' +
  'orient="auto-start-reverse" fill="context-stroke"><path d="M 1 1 L 9 5 L 1 9 z"/></marker></defs>';

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function listSvg(): string[] {
  const out: string[] = [];
  for (const d of DOSSIERS) {
    const base = join(RACINE, d);
    const walk = (dir: string): void => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.svg')) out.push(p);
      }
    };
    walk(base);
  }
  return out.sort();
}

const decodeEntities = (s: string): string =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');

const escapeAttr = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const collapseWs = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** Empreinte texte : contenu de <text>/<title>/<tspan> (le préfixage d'ids n'y touche jamais). */
const textFingerprint = (s: string): string => {
  const matches = s.match(/<(?:text|title|tspan)\b[\s\S]*?<\/(?:text|title|tspan)>/g) || [];
  return matches.map((m) => collapseWs(m.replace(/<[^>]+>/g, ' '))).join('\u0001');
};

/** Comptage d'éléments géométriques (la normalisation n'en doit créer ni détruire). */
const geoCounts = (s: string): Record<string, number> => {
  const tags = ['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'image', 'use', 'marker'];
  const r: Record<string, number> = {};
  for (const t of tags) r[t] = (s.match(new RegExp(`<${t}\\b`, 'g')) || []).length;
  return r;
};

const rootTag = (s: string): string | null => {
  const m = s.match(/<svg\b[^>]*>/);
  return m ? m[0] : null;
};

const attrOf = (tag: string, name: string): string | null => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

/** aria-label : contenu EXISTANT uniquement — <title> puis <text> titre puis <text> max font-size ≥ 18. */
function deriveAriaLabel(svg: string): string | null {
  const title = svg.match(/<title[^>]*>([\s\S]*?)<\/title>/);
  if (title) {
    const v = collapseWs(decodeEntities(title[1].replace(/<[^>]+>/g, ' ')));
    if (v) return v.slice(0, 200);
  }
  const texts: { cls: string; size: number; content: string }[] = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) {
    const attrs = m[1];
    const content = collapseWs(decodeEntities(m[2].replace(/<[^>]+>/g, ' ')));
    if (!content) continue;
    const cls = (attrs.match(/\sclass="([^"]*)"/) || ['', ''])[1];
    const sizeM = attrs.match(/font-size="(\d+(?:\.\d+)?)"/);
    texts.push({ cls, size: sizeM ? Number(sizeM[1]) : 0, content });
  }
  const heading = texts.find((t) => /(^|\s)(title|heading|ttl)(\s|$)/i.test(t.cls) || t.cls.trim() === 't');
  if (heading) return heading.content.slice(0, 200);
  let best: { cls: string; size: number; content: string } | null = null;
  for (const t of texts) if (t.size >= 18 && (!best || t.size > best.size)) best = t;
  return best ? best.content.slice(0, 200) : null;
}

interface Transform {
  out: string;
  changes: string[];
}

function transform(src: string): Transform {
  let out = src;
  const changes: string[] = [];

  // ── 1. marker arrow orphelin ──────────────────────────────────────────────
  if (/url\(#arrow\)/.test(out) && !/\sid="arrow"/.test(out)) {
    const t = rootTag(out);
    if (!t) throw new Error('root <svg> introuvable');
    out = out.replace(t, t + MARKER_ARROW);
    changes.push('marker arrow ajouté');
  }

  // ── 2. root <svg> : class / role / aria-label ─────────────────────────────
  const tag = rootTag(out);
  if (!tag) throw new Error('root <svg> introuvable');
  let newTag = tag;
  if (attrOf(newTag, 'class') === null) {
    newTag = newTag.replace(/^<svg/, '<svg class="pfe-figure"');
    changes.push('class pfe-figure');
  } else if (!/\bpfe-figure\b/.test(newTag)) {
    newTag = newTag.replace(/\sclass="([^"]*)"/, (_m, v: string) => ` class="${v} pfe-figure"`);
    changes.push('class pfe-figure');
  }
  if (attrOf(newTag, 'role') === null) {
    newTag = newTag.replace(/^<svg/, '<svg role="img"');
    changes.push('role img');
  }
  if (attrOf(newTag, 'aria-label') === null) {
    const label = deriveAriaLabel(out);
    if (label) {
      newTag = newTag.replace(/^<svg/, `<svg aria-label="${escapeAttr(label)}"`);
      changes.push('aria-label');
    }
  }
  if (newTag !== tag) out = out.replace(tag, newTag);

  // ── 3. préfixe pf- sur ids + toutes références internes ───────────────────
  const ids: string[] = [];
  const idRe = /(?<![-\w:])id="([^"]+)"/g;
  let im: RegExpExecArray | null;
  while ((im = idRe.exec(out)) !== null) ids.push(im[1]);
  const toPrefix = ids.filter((i) => !i.startsWith('pf-')).sort((a, b) => b.length - a.length);
  for (const id of toPrefix) {
    if (ids.includes(`pf-${id}`)) throw new Error(`collision id : "${id}" et "pf-${id}" coexistent`);
  }
  if (toPrefix.length > 0) {
    for (const id of toPrefix) {
      const esc = escapeRe(id);
      const pf = `pf-${id}`;
      out = out.replace(new RegExp(`url\\((["']?)#${esc}\\1\\)`, 'g'), (_m, q: string) => `url(${q}#${pf}${q})`);
      out = out.replace(
        new RegExp(`((?:xlink:)?href=)(["'])#${esc}\\2`, 'g'),
        (_m, a: string, q: string) => `${a}${q}#${pf}${q}`,
      );
      out = out.replace(new RegExp(`(?<![\\w-])${esc}\\.(?=click\\b|begin\\b|end\\b|repeat\\b)`, 'g'), `${pf}.`);
      out = out.replace(new RegExp(`(?<![-\\w:])id="${esc}"`, 'g'), `id="${pf}"`);
    }
    // sélecteurs CSS #id dans <style> (uniquement les ids connus → pas de faux positif hexa)
    out = out.replace(/<style(\b[^>]*)?>([\s\S]*?)<\/style>/g, (_m, attrs: string | undefined, css: string) => {
      let c = css;
      for (const id of toPrefix) c = c.replace(new RegExp(`#${escapeRe(id)}(?![\\w-])`, 'g'), `#pf-${id}`);
      return `<style${attrs || ''}>${c}</style>`;
    });
    changes.push(`${toPrefix.length} ids pf-`);
  }

  return { out, changes };
}

/** Validation : invariant par rapport à l'original. Retourne la liste d'erreurs. */
function validate(orig: string, out: string): string[] {
  const errs: string[] = [];
  const tOrig = rootTag(orig);
  const tOut = rootTag(out);
  if (!tOut) return ['root <svg> absent après normalisation'];

  // viewBox / width / height intacts
  for (const a of ['viewBox', 'width', 'height']) {
    const v0 = tOrig ? attrOf(tOrig, a) : null;
    const v1 = attrOf(tOut, a);
    if (v0 !== v1) errs.push(`${a} modifié : ${v0} → ${v1}`);
  }
  if (attrOf(tOut, 'viewBox') === null) errs.push('viewBox absent');

  // présence normalisée
  if (!/\bpfe-figure\b/.test(attrOf(tOut, 'class') || '')) errs.push('classe pfe-figure absente');
  if (attrOf(tOut, 'role') !== 'img') errs.push('role="img" absent');

  // comptes géométriques (le marker injecté ajoute légitimement 1 <path> + 1 <marker>)
  const markerPf = MARKER_ARROW.replace('id="arrow"', 'id="pf-arrow"');
  const outSansMarker = out.split(markerPf).join('').split(MARKER_ARROW).join('');
  const g0 = geoCounts(orig);
  const g1 = geoCounts(outSansMarker);
  for (const k of Object.keys(g0)) if (g0[k] !== g1[k]) errs.push(`géométrie <${k}> : ${g0[k]} → ${g1[k]}`);

  // empreinte des textes
  if (textFingerprint(orig) !== textFingerprint(out)) errs.push('textes <text>/<title> modifiés');

  // références internes résolues
  const ids = new Set<string>();
  const idRe = /(?<![-\w:])id="([^"]+)"/g;
  let im: RegExpExecArray | null;
  while ((im = idRe.exec(out)) !== null) ids.add(im[1]);
  const targets = new Set<string>();
  for (const m of out.matchAll(/url\((["']?)#([^)"']+)\1\)/g)) targets.add(m[2]);
  for (const m of out.matchAll(/(?:xlink:)?href=(["'])#([^"']+)\1/g)) targets.add(m[2]);
  for (const t of targets) if (!ids.has(t)) errs.push(`référence orpheline #${t}`);

  // ids préfixés
  for (const id of ids) if (!id.startsWith('pf-')) errs.push(`id non préfixé : ${id}`);

  // parse XML
  try {
    const dom = new JSDOM('');
    const doc = new dom.window.DOMParser().parseFromString(out, 'text/xml');
    const root = doc.documentElement;
    const perr = root ? root.localName === 'parsererror' : true;
    if (perr || !root || root.localName !== 'svg') errs.push('parse XML invalide');
  } catch (e) {
    errs.push(`parse XML exception : ${String(e)}`);
  }
  return errs;
}

// ── main ────────────────────────────────────────────────────────────────────
const CHECK = process.argv.includes('--check');
const files = listSvg();
let changed = 0;
const errFiles: string[] = [];
const stats = { marker: 0, aria: 0, prefixed: 0 };

for (const f of files) {
  const rel = f.replace(RACINE + '\\', '').replace(/\\/g, '/');
  try {
    const src = readFileSync(f, 'utf8');
    const { out, changes } = transform(src);
    if (out !== src) {
      // idempotence stricte : transformer la sortie doit être un no-op
      const again = transform(out);
      if (again.out !== out) throw new Error('non-idempotent');
      const errs = validate(src, out);
      if (errs.length > 0) {
        errFiles.push(`${rel} : ${errs.join(' | ')}`);
        continue;
      }
      changed++;
      if (changes.some((c) => c.includes('marker'))) stats.marker++;
      if (changes.includes('aria-label')) stats.aria++;
      if (changes.some((c) => c.includes('ids pf-'))) stats.prefixed++;
      if (CHECK) {
        console.log(`→ ${rel} — à normaliser (${changes.join(', ')})`);
      } else {
        writeFileSync(f, out, 'utf8');
        console.log(`✓ ${rel} — normalisé (${changes.join(', ')})`);
      }
    } else if (!CHECK) {
      // déjà normalisé : revalider (garde-fou après édition manuelle éventuelle)
      const errs = validate(src, src);
      if (errs.length > 0) errFiles.push(`${rel} : ${errs.join(' | ')}`);
    }
  } catch (e) {
    errFiles.push(`${rel} : ${String(e)}`);
  }
}

console.log('');
console.log(
  `${CHECK ? 'check' : 'écriture'} — ${files.length} SVG, ${changed} ${CHECK ? 'à normaliser' : 'modifié(s)'}, ` +
    `marker:${stats.marker} aria:${stats.aria} ids-pf:${stats.prefixed}`,
);
if (errFiles.length > 0) {
  console.log(`ERREURS (${errFiles.length}) :`);
  for (const e of errFiles) console.log('  ✗ ' + e);
  process.exit(1);
}



