// src/utils/figureZoomRuntime.ts
// ─────────────────────────────────────────────────────────────────────────────
// RUNTIME DE ZOOM UNIVERSEL DES FIGURES (SVG & images) — SOURCE UNIQUE DE VÉRITÉ
//
// Deux surfaces consomment exactement ce même code :
//   1. LES LEÇONS HTML (public/lessons/*.html, public/miftah.html) — affichées
//      dans une iframe `srcdoc` isolée : le runtime est INJECTÉ dans le fichier
//      par `npm run figures:zoom` (scripts/tools/applyFigureZoom.ts). Un script
//      injecté dans l'iframe ne peut pas être mutualisé en fichier externe
//      (srcdoc = base URL héritée, et hors ligne on ne veut aucune requête).
//   2. L'APPLICATION REACT — `src/components/FigureZoomLayer.tsx` injecte le même
//      bloc dans le document de l'app (SVG des animations, graphes, cartes…).
//
// COMPORTEMENT : au survol d'une figure (≥ 150×100, hors boutons/liens/SVG
// décoratifs) une pastille « تكبير » apparaît ; un clic (ou la pastille) ouvre
// la superposition plein écran avec zoom +/−, %, إعادة الملاءمة, glisser pour
// déplacer, molette, pincement 2 doigts, double-clic, Esc, et un bouton qui
// ouvre la figure seule dans une fenêtre (zoom natif du navigateur + impression).
//
// CONTRAINTES DE FORME (imposées par src/data/lessonRenderParcours.test.ts) :
//   - le JS injecté ne doit contenir AUCUNE des séquences littérales
//     `<div`, `id="` ni `</script` : les tests comptent les `<div>`, scannent
//     `id="..."` (id dupliqué = échec) et le parseur HTML clôturerait le script.
//     D'où createElement/setAttribute et <figure>/<section> dans le document
//     autonome.
//   - aucun `${` dans le code injecté (String.raw + concaténation).
// ─────────────────────────────────────────────────────────────────────────────

/** Id du <style> injecté (unique dans chaque document). */
export const FIGURE_ZOOM_STYLE_ID = 'pfe-zoom-style';
/** Id du <script> injecté (unique dans chaque document). */
export const FIGURE_ZOOM_SCRIPT_ID = 'pfe-zoom-runtime';

/** Marqueurs de bloc : permettent une réinjection idempotente (mise à niveau). */
export const FIGURE_ZOOM_MARKER_START = '<!-- PFE-ZOOM v1 — démarrage (généré, ne pas éditer à la main) -->';
export const FIGURE_ZOOM_MARKER_END = '<!-- PFE-ZOOM v1 — fin (généré) -->';

/** Feuille de style du zoom (pastille + superposition). */
export const FIGURE_ZOOM_CSS = String.raw`
    /* PFE-ZOOM — pastille de zoom */
    .pfe-zoom-badge {
        position: fixed;
        z-index: 2147483000;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        border: 0;
        border-radius: 999px;
        background: #006d37;
        color: #fff;
        font: 700 13px/1.1 system-ui, "Segoe UI", Tahoma, sans-serif;
        box-shadow: 0 6px 18px rgba(0, 0, 0, .28);
        cursor: pointer;
        direction: rtl;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity .12s ease;
        -webkit-tap-highlight-color: transparent;
    }
    .pfe-zoom-badge.is-visible { opacity: 1; visibility: visible; pointer-events: auto; }
    .pfe-zoom-badge:hover { background: #00562b; }
    .pfe-zoom-badge svg { width: 15px; height: 15px; }

    /* Verrou de défilement du document pendant l'agrandissement */
    html.pfe-zoom-lock, html.pfe-zoom-lock body { overflow: hidden !important; }

    /* PFE-ZOOM — superposition plein écran */
    .pfe-zoom-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483100;
        display: none;
        flex-direction: column;
        background: rgba(6, 12, 9, .95);
        color: #f4faf6;
        direction: rtl;
        font-family: system-ui, "Segoe UI", Tahoma, sans-serif;
        touch-action: none;
        overscroll-behavior: contain;
    }
    .pfe-zoom-overlay.is-open { display: flex; }
    .pfe-zoom-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 10px 14px;
        background: rgba(255, 255, 255, .07);
        border-bottom: 1px solid rgba(255, 255, 255, .14);
    }
    .pfe-zoom-title {
        flex: 1 1 200px;
        min-width: 0;
        font-weight: 700;
        font-size: 15px;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .pfe-zoom-btn {
        min-width: 42px;
        height: 38px;
        padding: 0 12px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, .22);
        background: rgba(255, 255, 255, .1);
        color: #fff;
        font: 700 15px/1 system-ui, "Segoe UI", Tahoma, sans-serif;
        cursor: pointer;
    }
    .pfe-zoom-btn:hover { background: rgba(255, 255, 255, .24); }
    .pfe-zoom-btn.is-close { background: #b3261e; border-color: #b3261e; }
    .pfe-zoom-pct {
        min-width: 64px;
        text-align: center;
        font-weight: 700;
        font-size: 14px;
        font-variant-numeric: tabular-nums;
    }
    .pfe-zoom-stage {
        position: relative;
        flex: 1 1 auto;
        overflow: hidden;
        cursor: grab;
        touch-action: none;
        background: rgba(255, 255, 255, .04);
    }
    .pfe-zoom-stage.is-dragging { cursor: grabbing; }
    .pfe-zoom-canvas { position: absolute; top: 0; left: 0; transform-origin: 0 0; will-change: transform; }
    .pfe-zoom-canvas svg,
    .pfe-zoom-canvas img {
        display: block;
        max-width: none !important;
        max-height: none !important;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 14px 46px rgba(0, 0, 0, .5);
    }
    .pfe-zoom-foot {
        padding: 8px 14px;
        font-size: 12.5px;
        line-height: 1.5;
        color: rgba(244, 250, 246, .78);
        text-align: center;
        border-top: 1px solid rgba(255, 255, 255, .12);
    }
    @media (max-width: 640px) {
        .pfe-zoom-title { font-size: 13.5px; }
        .pfe-zoom-foot { font-size: 11.5px; }
    }
`;

/** Script de zoom (vanilla, ES5, aucun `${`, cf. contraintes d'en-tête). */
export const FIGURE_ZOOM_JS = String.raw`
(function () {
    'use strict';
    if (window.__pfeZoomRuntime) { return; }
    window.__pfeZoomRuntime = true;

    var MIN_W = 150;            /* taille minimale d'une figure « zoomable »  */
    var MIN_H = 100;
    var ZMIN = 0.3;
    var ZMAX = 20;
    var STEP = 1.25;
    var HINT = 'اسحب للتحريك · عجلة الفأرة أو + / − للتكبير · نقر مزدوج = تبديل الملاءمة · Esc للإغلاق';

    var badge = null;
    var badgeFig = null;
    var overlay = null;
    var stage = null;
    var canvas = null;
    var titleEl = null;
    var pctEl = null;
    var openFig = null;
    var cloneSeq = 0;
    var bound = [];             /* écouteurs globaux mémorisés (démontage exact) */
    var wired = false;          /* écouteurs clavier/fullscreen branchés (idempotent) */
    var st = { s: 1, base: 1, tx: 0, ty: 0, nw: 0, nh: 0, fit: true };

    /* ── Utilitaires ─────────────────────────────────────────────────────── */
    function node(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        if (text !== undefined && text !== null) { n.textContent = text; }
        return n;
    }

    function button(label, tip, fn, extra) {
        var b = node('button', 'pfe-zoom-btn' + (extra ? ' ' + extra : ''), label);
        b.setAttribute('type', 'button');
        b.setAttribute('title', tip);
        b.setAttribute('aria-label', tip);
        b.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            fn();
        });
        return b;
    }

    function textOf(n) {
        return n ? String(n.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    /* Écouteur global mémorisé : indispensable pour un démontage EXACT (tests
       automatisés multi-documents, démontage d'une couche React, SPA). */
    function bind(target, type, fn, capture) {
        var cap = !!capture;
        target.addEventListener(type, fn, cap);
        bound.push([target, type, fn, cap]);
    }

    /* Élément interdit au zoom : contrôles, liens, icônes décoratives. */
    function blocked(el) {
        if (!el || !el.closest) { return true; }
        if (el.closest('button,a,label,select,input,textarea,header,nav,footer,.no-zoom,[data-no-zoom],[data-pfe-zoom-skip]')) { return true; }
        return el.getAttribute('aria-hidden') === 'true';
    }

    function bigEnough(el) {
        var r = el.getBoundingClientRect();
        return r.width >= MIN_W && r.height >= MIN_H;
    }

    /* Remonte du nœud cliqué vers la figure (svg ou image) la plus proche. */
    function figureFrom(target) {
        var el = target && target.nodeType === 1 ? target : (target ? target.parentElement : null);
        while (el && el !== document.documentElement) {
            var tag = el.tagName ? el.tagName.toLowerCase() : '';
            if (tag === 'svg' || tag === 'img') {
                if (blocked(el) || !bigEnough(el)) { return null; }
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    /* ── Clonage : préfixe les ids pour éviter tout doublon dans le document ─ */
    function rewriteRefs(value, map) {
        return value.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g, function (m, q, id) {
            return map[id] ? 'url(' + q + '#' + map[id] + q + ')' : m;
        });
    }

    function prepareClone(source) {
        var clone = source.cloneNode(true);
        cloneSeq += 1;
        var prefix = 'pfez' + cloneSeq + '-';
        if (clone.tagName.toLowerCase() === 'img') { return clone; }

        var map = {};
        var withId = clone.querySelectorAll('[id]');
        var i;
        for (i = 0; i < withId.length; i++) {
            var oldId = withId[i].getAttribute('id');
            map[oldId] = prefix + oldId;
            withId[i].setAttribute('id', prefix + oldId);
        }
        if (clone.getAttribute('id')) {
            var rootId = clone.getAttribute('id');
            map[rootId] = prefix + rootId;
            clone.setAttribute('id', prefix + rootId);
        }

        /* Réécrit les références internes d'un nœud (racine INCLUSE) : attributs
           de peinture, marker-*, href/xlink:href, et le texte des <style> embarqués
           (sélecteurs #id ou url(#id)) qui portent souvent les marqueurs de flèches. */
        var attrs = ['fill', 'stroke', 'filter', 'clip-path', 'mask', 'style', 'marker-start', 'marker-mid', 'marker-end'];
        function rewriteNode(n) {
            for (var k = 0; k < attrs.length; k++) {
                var v = n.getAttribute(attrs[k]);
                if (v && v.indexOf('#') > -1) { n.setAttribute(attrs[k], rewriteRefs(v, map)); }
            }
            var href = n.getAttribute('href');
            if (href && href.charAt(0) === '#' && map[href.slice(1)]) {
                n.setAttribute('href', '#' + map[href.slice(1)]);
            }
            var xlink = n.getAttribute('xlink:href');
            if (xlink && xlink.charAt(0) === '#' && map[xlink.slice(1)]) {
                n.setAttribute('xlink:href', '#' + map[xlink.slice(1)]);
            }
            if ((n.tagName || '').toLowerCase() === 'style' && n.textContent) {
                n.textContent = n.textContent.replace(/#([A-Za-z_][A-Za-z0-9_-]*)/g, function (m, id) {
                    return map[id] ? '#' + map[id] : m;
                });
            }
        }
        var all = clone.querySelectorAll('*');
        rewriteNode(clone);
        for (i = 0; i < all.length; i++) {
            rewriteNode(all[i]);
        }
        return clone;
    }

    /* ── Pastille flottante au survol ─────────────────────────────────────── */
    function ensureBadge() {
        if (badge) { return; }
        badge = node('button', 'pfe-zoom-badge', '\uD83D\uDD0D تكبير');
        badge.setAttribute('type', 'button');
        badge.setAttribute('title', 'تكبير الشكل لقراءته بوضوح');
        badge.setAttribute('aria-label', 'تكبير الشكل');
        badge.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (badgeFig) { open(badgeFig); }
        });
        document.body.appendChild(badge);
    }

    function positionBadge() {
        if (!badge || !badgeFig) { return; }
        var r = badgeFig.getBoundingClientRect();
        var w = badge.offsetWidth || 96;
        var h = badge.offsetHeight || 32;
        var left = r.left + 8;
        var top = r.bottom - h - 8;
        if (top < 8) { top = r.top + 8; }
        if (left + w > window.innerWidth - 8) { left = Math.max(8, r.right - w - 8); }
        if (top + h > window.innerHeight - 8) { top = Math.max(8, window.innerHeight - h - 8); }
        badge.style.left = Math.max(8, left) + 'px';
        badge.style.top = Math.max(8, top) + 'px';
    }

    function showBadge(fig) {
        ensureBadge();
        badgeFig = fig;
        positionBadge();
        badge.classList.add('is-visible');
    }

    function hideBadge() {
        badgeFig = null;
        if (badge) { badge.classList.remove('is-visible'); }
    }

    /* Titre porté par la figure elle-même : le plus fiable (aria-label sur les
       figures ProFigure, alt sur les schémas image, <title>/<desc> sinon). */
    function ownTitle(el) {
        var t = el.getAttribute('aria-label') || el.getAttribute('data-title') || '';
        if (!t && el.tagName.toLowerCase() === 'img') { t = el.getAttribute('alt') || ''; }
        if (!t && el.querySelector) { t = textOf(el.querySelector('title,desc')); }
        return t ? String(t).replace(/\s+/g, ' ').trim() : '';
    }

    function figureTitle(el) {
        var self = ownTitle(el);
        if (self) { return self; }
        var host = el.closest ? el.closest('figure,.svg-container,.doc-visual,.visual-card,section') : null;
        if (host) {
            var cap = host.querySelector('figcaption,.svg-caption,.figure-caption,.caption,.svg-title');
            var capText = textOf(cap);
            if (capText) { return capText; }
        }
        var probe = el;
        var hops = 0;
        while (probe && hops < 60) {
            probe = probe.previousElementSibling || probe.parentElement;
            hops += 1;
            if (!probe || probe === document.body) { break; }
            var head = /^H[1-4]$/.test(probe.tagName || '') ? probe : probe.querySelector('h1,h2,h3,h4');
            var headText = textOf(head);
            if (headText) { return headText; }
        }
        return textOf(document.querySelector('h1,h2')) || 'الشكل';
    }

    /* Taille « naturelle » : viewBox pour un SVG (vectoriel net à 100 %), pixels pour une image. */
    function naturalSize(el) {
        if (el.tagName.toLowerCase() === 'img') {
            var r = el.getBoundingClientRect();
            return [el.naturalWidth || r.width || 900, el.naturalHeight || r.height || 600];
        }
        var vb = el.viewBox && el.viewBox.baseVal;
        if (vb && vb.width && vb.height) { return [vb.width, vb.height]; }
        var box = el.getBoundingClientRect();
        return [box.width || 900, box.height || 500];
    }

    /* ── Manipulation : glisser, molette, pincement, double-clic ──────────── */
    function bindStage() {
        var pointers = {};
        var drag = null;
        var pinch = null;

        function count() {
            var n = 0;
            for (var k in pointers) { if (pointers[k]) { n += 1; } }
            return n;
        }

        function list() {
            var out = [];
            for (var k in pointers) { if (pointers[k]) { out.push(pointers[k]); } }
            return out;
        }

        function distance(a, b) {
            var dx = a.clientX - b.clientX;
            var dy = a.clientY - b.clientY;
            return Math.sqrt(dx * dx + dy * dy) || 1;
        }

        function release(e) {
            delete pointers[e.pointerId];
            if (count() < 2) { pinch = null; }
            if (count() === 0) {
                drag = null;
                stage.classList.remove('is-dragging');
            }
        }

        stage.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) { return; }
            pointers[e.pointerId] = e;
            try { stage.setPointerCapture(e.pointerId); } catch (err) {}
            if (count() === 1) {
                drag = { x: e.clientX, y: e.clientY, tx: st.tx, ty: st.ty };
                stage.classList.add('is-dragging');
            } else if (count() === 2) {
                drag = null;
                var two = list();
                var p = localPoint(two[0]);
                var q = localPoint(two[1]);
                pinch = { d: distance(two[0], two[1]), s: st.s, cx: (p[0] + q[0]) / 2, cy: (p[1] + q[1]) / 2 };
            }
            e.preventDefault();
        });

        stage.addEventListener('pointermove', function (e) {
            if (!pointers[e.pointerId]) { return; }
            pointers[e.pointerId] = e;
            if (pinch && count() === 2) {
                var pair = list();
                var mid = localPoint(pair[0]);
                zoomTo(pinch.s * (distance(pair[0], pair[1]) / pinch.d), mid[0], mid[1]);
                return;
            }
            if (drag) {
                st.tx = drag.tx + (e.clientX - drag.x);
                st.ty = drag.ty + (e.clientY - drag.y);
                st.fit = false;
                apply();
            }
        });

        stage.addEventListener('pointerup', release);
        stage.addEventListener('pointercancel', release);
        stage.addEventListener('lostpointercapture', release);

        stage.addEventListener('wheel', function (e) {
            e.preventDefault();
            var p = localPoint(e);
            zoomBy(e.deltaY < 0 ? 1.14 : 1 / 1.14, p[0], p[1]);
        }, { passive: false });

        stage.addEventListener('dblclick', function (e) {
            e.preventDefault();
            if (st.fit || st.s <= st.base * 1.05) {
                var p = localPoint(e);
                zoomTo(Math.max(1, st.base * 2), p[0], p[1]);
            } else {
                fitView();
            }
        });
    }

    /* ── Superposition plein écran ────────────────────────────────────────── */
    function stageSize() {
        var r = stage.getBoundingClientRect();
        return [r.width, r.height];
    }

    function apply() {
        canvas.style.transform = 'translate(' + st.tx + 'px,' + st.ty + 'px) scale(' + st.s + ')';
        if (pctEl) { pctEl.textContent = Math.round(st.s * 100) + '%'; }
    }

    function fitView() {
        var s = stageSize();
        var pad = 28;
        var k = Math.min((s[0] - pad) / st.nw, (s[1] - pad) / st.nh);
        if (!isFinite(k) || k <= 0) { k = 1; }
        st.s = k;
        st.base = k;
        st.fit = true;
        st.tx = (s[0] - st.nw * k) / 2;
        st.ty = (s[1] - st.nh * k) / 2;
        apply();
    }

    function zoomTo(target, px, py) {
        var s = stageSize();
        if (px === undefined) { px = s[0] / 2; }
        if (py === undefined) { py = s[1] / 2; }
        var next = Math.min(ZMAX, Math.max(ZMIN, target));
        var f = next / st.s;
        st.tx = px - (px - st.tx) * f;
        st.ty = py - (py - st.ty) * f;
        st.s = next;
        st.fit = false;
        apply();
    }

    function zoomBy(factor, px, py) {
        zoomTo(st.s * factor, px, py);
    }

    function localPoint(e) {
        var r = stage.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    }

    function ensureOverlay() {
        if (overlay) { return; }

        overlay = node('section', 'pfe-zoom-overlay');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'عرض الشكل مكبَّرًا');

        var bar = node('div', 'pfe-zoom-bar');
        titleEl = node('div', 'pfe-zoom-title', '');
        pctEl = node('span', 'pfe-zoom-pct', '100%');
        bar.appendChild(titleEl);
        bar.appendChild(pctEl);
        bar.appendChild(button('−', 'تصغير', function () { zoomBy(1 / STEP); }));
        bar.appendChild(button('+', 'تكبير', function () { zoomBy(STEP); }));
        bar.appendChild(button('ملاءمة', 'إعادة الملاءمة إلى الشاشة', function () { fitView(); }));
        bar.appendChild(button('100%', 'الحجم الأصلي للشكل', function () { zoomTo(1); }));
        bar.appendChild(button('نافذة', 'فتح الشكل في نافذة مستقلة', openStandalone));
        bar.appendChild(button('إغلاق', 'إغلاق (Esc)', close, 'is-close'));

        stage = node('div', 'pfe-zoom-stage');
        canvas = node('div', 'pfe-zoom-canvas');
        stage.appendChild(canvas);

        overlay.appendChild(bar);
        overlay.appendChild(stage);
        overlay.appendChild(node('div', 'pfe-zoom-foot', HINT));
        document.body.appendChild(overlay);

        bindStage();
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) { close(); }
        });
    }

    function open(fig) {
        if (!fig) { return; }
        ensureOverlay();
        openFig = fig;
        hideBadge();
        canvas.innerHTML = '';
        canvas.appendChild(prepareClone(fig));

        var nat = naturalSize(fig);
        st.nw = Math.max(1, nat[0]);
        st.nh = Math.max(1, nat[1]);
        canvas.firstChild.style.width = st.nw + 'px';
        canvas.firstChild.style.height = st.nh + 'px';
        titleEl.textContent = figureTitle(fig);

        overlay.classList.add('is-open');
        document.documentElement.classList.add('pfe-zoom-lock');
        fitView();
        goFullscreen();
        /* Idempotent : une seule paire d'écouteurs actifs à la fois. */
        if (!wired) {
            wired = true;
            document.addEventListener('keydown', onKey, true);
            window.addEventListener('resize', onResize);
            document.addEventListener('fullscreenchange', onResize);
        }
    }

    function close() {
        if (!overlay) { return; }
        overlay.classList.remove('is-open');
        document.documentElement.classList.remove('pfe-zoom-lock');
        if (wired) {
            wired = false;
            document.removeEventListener('keydown', onKey, true);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('fullscreenchange', onResize);
        }
        if (document.fullscreenElement && document.exitFullscreen) {
            try { document.exitFullscreen(); } catch (err) {}
        }
        canvas.innerHTML = '';
        openFig = null;
        st.fit = true;
        hideBadge();
    }

    function goFullscreen() {
        var fn = overlay.requestFullscreen || overlay.webkitRequestFullscreen || overlay.msRequestFullscreen;
        if (!fn) { return; }
        try {
            var p = fn.call(overlay);
            if (p && p.catch) { p.catch(function () {}); }
        } catch (err) {}
    }

    function onResize() {
        if (!overlay || !overlay.classList.contains('is-open')) { return; }
        if (st.fit) { fitView(); } else { apply(); }
    }

    function onKey(e) {
        if (!overlay || !overlay.classList.contains('is-open')) { return; }
        var k = e.key;
        if (k === 'Escape') { close(); }
        else if (k === '+' || k === '=') { zoomBy(STEP); }
        else if (k === '-' || k === '_') { zoomBy(1 / STEP); }
        else if (k === '0') { fitView(); }
        else if (k === 'ArrowUp') { st.ty += 48; apply(); }
        else if (k === 'ArrowDown') { st.ty -= 48; apply(); }
        else if (k === 'ArrowRight') { st.tx -= 48; apply(); }
        else if (k === 'ArrowLeft') { st.tx += 48; apply(); }
        else { return; }
        e.preventDefault();
        e.stopPropagation();
    }

    /* ── Figure seule dans une fenêtre (zoom natif du navigateur + impression) */
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function openStandalone() {
        if (!openFig) { return; }
        var clone = prepareClone(openFig);
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.maxWidth = 'none';

        var styles = '';
        var sheets = document.querySelectorAll('style');
        for (var i = 0; i < sheets.length; i++) { styles += String(sheets[i].textContent || ''); }

        var title = escapeHtml(figureTitle(openFig));
        var extra = 'html,body{margin:0;background:#fff;color:#111}' +
            'body{padding:18px 16px 64px;font-family:system-ui,"Segoe UI",Tahoma,sans-serif;direction:rtl}' +
            '.pfe-standalone-title{font-size:17px;font-weight:700;margin:0 0 14px;line-height:1.5}' +
            '.pfe-standalone-fig{margin:0;padding:12px;border:1px solid #e2e8e0;border-radius:16px;background:#fff}' +
            '.pfe-standalone-fig svg,.pfe-standalone-fig img{width:100%;height:auto;max-width:none}' +
            '.pfe-standalone-tip{margin-top:16px;font-size:13.5px;color:#3f5147;text-align:center;line-height:1.7}' +
            '@media print{.pfe-standalone-tip{display:none}}';

        var doc = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<title>' + title + '</title>' +
            '<style>' + styles + '</style><style>' + extra + '</style></head><body>' +
            '<h1 class="pfe-standalone-title">' + title + '</h1>' +
            '<figure class="pfe-standalone-fig">' + clone.outerHTML + '</figure>' +
            '<p class="pfe-standalone-tip">استعمل Ctrl مع عجلة الفأرة، أو أزرار التكبير في المتصفح · ' +
            'F11 لملء الشاشة · Ctrl + P للطباعة</p></body></html>';

        var w = window.open('', '_blank');
        if (!w) { return; }
        w.document.open();
        w.document.write(doc);
        w.document.close();
    }

    /* ── Câblage des événements (délégation : aucun nœud ajouté aux figures) ─ */
    bind(document, 'pointerover', function (e) {
        if (overlay && overlay.classList.contains('is-open')) { return; }
        if (badge && badge.contains(e.target)) { return; }
        var fig = figureFrom(e.target);
        if (!fig) {
            if (badgeFig) { hideBadge(); }
            return;
        }
        if (fig !== badgeFig) { showBadge(fig); }
    }, true);

    bind(document, 'pointerout', function (e) {
        if (!badgeFig) { return; }
        if (badge && badge.contains(e.target)) { return; }
        /* La pastille est montée dans document.body, JAMAIS dans la figure :
           en passant de la figure à la pastille, relatedTarget vaut la pastille,
           figureFrom() remonte jusqu'au <html> et renvoie null, ce qui masquait
           la pastille au moment exact où l'on visait le clic. Elle est donc
           traitée comme l'intérieur de la figure. */
        if (badge && badge.contains(e.relatedTarget)) { return; }
        if (figureFrom(e.relatedTarget) !== badgeFig) { hideBadge(); }
    }, true);

    var pending = false;
    bind(window, 'scroll', function () {
        if (!badgeFig || pending) { return; }
        pending = true;
        window.requestAnimationFrame(function () {
            pending = false;
            if (badgeFig) { positionBadge(); }
        });
    }, true);

    bind(window, 'resize', function () {
        if (badgeFig) { positionBadge(); }
    });

    bind(document, 'click', function (e) {
        if (e.button !== 0 || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
        if (overlay && overlay.classList.contains('is-open')) { return; }
        if (badge && badge.contains(e.target)) { return; }
        var fig = figureFrom(e.target);
        if (!fig) { return; }
        e.preventDefault();
        open(fig);
    }, true);

    /* Démontage exact : ferme, retire pastille/superposition et détache tous les
       écouteurs (le runtime peut alors être rebranché sur un autre document). */
    function destroy() {
        close();
        for (var i = 0; i < bound.length; i++) {
            var h = bound[i];
            h[0].removeEventListener(h[1], h[2], h[3]);
        }
        bound.length = 0;
        if (badge && badge.parentNode) { badge.parentNode.removeChild(badge); }
        if (overlay && overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
        badge = null;
        badgeFig = null;
        overlay = null;
        stage = null;
        canvas = null;
        titleEl = null;
        pctEl = null;
        openFig = null;
        window.__pfeZoomRuntime = false;
        window.__pfeZoom = null;
    }

    /* API publique minimale (tests automatiques + usages programmatiques). */
    window.__pfeZoom = { open: open, close: close, figureAt: figureFrom, destroy: destroy };
})();

`;

/**
 * Bloc complet prêt à injecter : marqueurs + <style> + <script>.
 * Sans saut de ligne initial/final pour que la réinjection soit strictement
 * idempotente (aucune dérive du fichier à chaque exécution).
 */
export const FIGURE_ZOOM_BLOCK = [
  FIGURE_ZOOM_MARKER_START,
  `<style id="${FIGURE_ZOOM_STYLE_ID}">${FIGURE_ZOOM_CSS}</style>`,
  `<script id="${FIGURE_ZOOM_SCRIPT_ID}">${FIGURE_ZOOM_JS}</script>`,
  FIGURE_ZOOM_MARKER_END,
].join('\n');

/** Le document contient-il déjà le runtime (bloc marqué) ? */
export function hasFigureZoom(html: string): boolean {
  const start = html.indexOf(FIGURE_ZOOM_MARKER_START);
  if (start < 0) return false;
  return html.indexOf(FIGURE_ZOOM_MARKER_END, start) > start;
}

/**
 * Injecte (ou met à niveau) le runtime de zoom dans un document HTML.
 * Idempotent : si le bloc marqué existe, il est REMPLACÉ par la version courante
 * (mise à niveau automatique quand ce module évolue).
 */
export function injectFigureZoom(html: string): { html: string; changed: boolean } {
  if (hasFigureZoom(html)) {
    const start = html.indexOf(FIGURE_ZOOM_MARKER_START);
    const end = html.indexOf(FIGURE_ZOOM_MARKER_END, start) + FIGURE_ZOOM_MARKER_END.length;
    const next = html.slice(0, start) + FIGURE_ZOOM_BLOCK + html.slice(end);
    return { html: next, changed: next !== html };
  }

  const body = html.lastIndexOf('</body>');
  if (body < 0) throw new Error('injection du zoom impossible : </body> introuvable');
  return {
    html: html.slice(0, body) + FIGURE_ZOOM_BLOCK + '\n' + html.slice(body),
    changed: true,
  };
}

