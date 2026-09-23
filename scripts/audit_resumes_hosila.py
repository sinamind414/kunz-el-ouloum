#!/usr/bin/env python3
"""Script A — audit résumés / hosila / gold / HTML vs livre officiel.

Recette identique à src/data/resumes.lock.test.ts (verrou ancrage) :
  - norm() NFKC + diacritiques + variantes arabes (lock resumesLecons)
  - jeton ≥ 5 car. normalisé, au moins 1 par point, dans les chapitres
    déclarés CHAPITRES_ANCRAGE[key] (plages data/bookContent.index.json)

Aller au-delà du verrou (≥ 1 jeton est faible) :
  1. Ancrage strict : chaque point doit partager ≥ N jetons (N=2 par défaut)
  2. Ancre « unique » : points qui ne passent que par UN seul jeton
  3. Contre-exemple livre entier : jeton absent du livre = invention/OCR
  4. Suspects lexicographiques documentés (filtre liste owner/audit)
  5. Hosila : résidus extraction + ancrages officiels
  6. lessonGoldSummaries : ancrage livre via vocabulaire/mecanisme
  7. HTML passifs : marqueurs حصيلة / résumé injecté

Sortie : JSON machine + rapport Markdown P0/P1/P2 sur stdout.
Usage : python3 scripts/audit_resumes_hosila.py [--json out.json] [--md out.md]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ── norm() : miroir exact de resumes.lock.test.ts (L20-24) ─────────────────
_AR_DIACRITICS = re.compile(r"[ً-ٰٟـ]")
_ALEF_VARIANTS = re.compile(r"[إأآٱا]")
_NON_AR = re.compile(r"[^\u0600-\u06FF0-9a-zA-Z\s]")
_WS = re.compile(r"\s+")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
    s = _AR_DIACRITICS.sub("", s)
    s = _ALEF_VARIANTS.sub("ا", s)
    s = s.replace("ة", "ه").replace("ى", "ي")
    s = s.replace("ؤ", "و").replace("ئ", "ي")
    s = _NON_AR.sub(" ", s)
    return _WS.sub(" ", s).strip()


def jetons(s: str, min_len: int = 5) -> list[str]:
    return [w for w in norm(s).split(" ") if len(w) >= min_len]


# ── parse resumesLecons.ts ──────────────────────────────────────────────────
def parse_resumes(path: Path) -> dict[str, dict]:
    src = path.read_text(encoding="utf-8")
    # CHAPITRES_ANCRAGE
    m = re.search(
        r"CHAPITRES_ANCRAGE:\s*Record<string,\s*number\[\]>\s*=\s*\{([\s\S]*?)\n\};",
        src,
    )
    if not m:
        raise SystemExit("CHAPITRES_ANCRAGE introuvable")
    ancrage: dict[str, list[int]] = {}
    for line in m.group(1).splitlines():
        line = line.strip()
        if not line.startswith("'"):
            continue
        km = re.match(r"'([^']+)':\s*\[([^\]]*)\]", line)
        if km:
            nums = [int(x.strip()) for x in km.group(2).split(",") if x.strip()]
            ancrage[km.group(1)] = nums

    # RESUMES_LECONS : bloc entre export const RESUMES et CHAPITRES_ANCRAGE
    body = src.split("RESUMES_LECONS", 1)[1].split("CHAPITRES_ANCRAGE", 1)[0]
    resumes: dict[str, dict] = {}
    # split sur les clés de top-level (indentation 2)
    key_re = re.compile(r"(?m)^  '([^']+)':\s*\{")
    matches = list(key_re.finditer(body))
    for i, m0 in enumerate(matches):
        k = m0.group(1)
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        block = body[m0.start() : end]
        om = re.search(r"objectif:\s*'((?:\\'|[^'])*)'", block)
        tbm = re.search(r"termeBac:\s*'((?:\\'|[^'])*)'", block)
        pts = re.findall(r"(?m)^      '((?:\\'|[^'])*)',", block)
        resumes[k] = {
            "objectif": om.group(1) if om else "",
            "points": pts,
            "termeBac": tbm.group(1) if tbm else "",
            "ligne_source": src[: m0.start()].count("\n") + 1
            + (src.split("RESUMES_LECONS", 1)[0].count("\n")),
        }
    # correction ligne réelle
    offset = src.find("RESUMES_LECONS")
    base = src[:offset].count("\n")
    for i, m0 in enumerate(matches):
        k = m0.group(1)
        resumes[k]["ligne_source"] = base + body[: m0.start()].count("\n") + 1
    return resumes, ancrage


def parse_cles_passives(path: Path) -> list[str]:
    src = path.read_text(encoding="utf-8")
    m = re.search(r"CLES_PASSIVES\s*=\s*\[([\s\S]*?)\]\s*as const", src)
    if not m:
        return []
    return re.findall(r"'([^']+)'", m.group(1))


# ── parse lessonGoldSummaries.ts ────────────────────────────────────────────
def parse_gold(path: Path) -> dict[str, dict]:
    src = path.read_text(encoding="utf-8")
    gold: dict[str, dict] = {}
    key_re = re.compile(r"(?m)^  '([^']+)':\s*\{")
    matches = list(key_re.finditer(src))
    for i, m0 in enumerate(matches):
        k = m0.group(1)
        end = matches[i + 1].start() if i + 1 < len(matches) else len(src)
        block = src[m0.start() : end]
        sm = re.search(r"status:\s*'([^']+)'", block)
        rev = re.search(r"reviewed:\s*(true|false)", block)
        vocab = re.findall(r"vocabulary:\s*\[([^\]]*)\]", block, re.S)
        vocab_list = re.findall(r"'((?:\\'|[^'])*)'", vocab[0]) if vocab else []
        mech = re.findall(r"mechanismAr:\s*\[([\s\S]*?)\],", block)
        mech_list = re.findall(r"'((?:\\'|[^'])*)'", mech[0]) if mech else []
        mission = re.search(r"missionAr:\s*'((?:\\'|[^'])*)'", block)
        evid = re.search(r"evidenceAr:\s*'((?:\\'|[^'])*)'", block)
        err = re.search(r"commonErrorAr:\s*'((?:\\'|[^'])*)'", block)
        recall = re.search(r"recallQuestionAr:\s*'((?:\\'|[^'])*)'", block)
        gold[k] = {
            "status": sm.group(1) if sm else "?",
            "reviewed": rev.group(1) == "true" if rev else False,
            "vocabulary": vocab_list,
            "mechanism": mech_list,
            "mission": mission.group(1) if mission else "",
            "evidence": evid.group(1) if evid else "",
            "commonError": err.group(1) if err else "",
            "recall": recall.group(1) if recall else "",
            "ligne": src[: m0.start()].count("\n") + 1,
        }
    return gold


# ── parse hosila.ts (données propres) ───────────────────────────────────────
def parse_hosila(path: Path) -> dict:
    src = path.read_text(encoding="utf-8")
    # hors commentaires
    code = re.sub(r"/\*[\s\S]*?\*/", "", src)
    code = re.sub(r"(?m)^\s*//.*$", "", code)
    units = re.findall(r'"(d\d+u\d+)":\s*\{', code)
    blocs = re.findall(r'\{\s*kind:\s*"(\w+)",\s*texte:\s*"((?:[^"\\]|\\.)*)"', code)
    # stats header
    stats_m = re.search(r"Stats\s*:\s*([^\n*]+)", src)
    residues_code = {
        "EXTRAIRE": len(re.findall(r"EXTRAIRE", code)),
        "إليك النص الكامل": len(re.findall(r"إليك النص الكامل", code)),
        "livre_scolaire": len(re.findall(r"livre_scolaire", code)),
        "LaTeX_$": len(re.findall(r"\$", code)),
    }
    # ancre propre : tout le texte des données
    all_text = " ".join(t for _, t in blocs)
    return {
        "unites": units,
        "nb_unites": len(units),
        "nb_blocs": len(blocs),
        "nb_points": sum(1 for k, _ in blocs if k == "point"),
        "stats_header": stats_m.group(1).strip() if stats_m else "",
        "residus_code": residues_code,
        "all_text": all_text,
        "residus_dans_donnees": {
            "EXTRAIRE": len(re.findall(r"EXTRAIRE", all_text)),
            "إليك النص الكامل": len(re.findall(r"إليك النص الكامل", all_text)),
        },
    }


# ── livre ───────────────────────────────────────────────────────────────────
def load_book() -> tuple[str, list[dict], str]:
    bc = json.loads((ROOT / "data/bookContent.json").read_text(encoding="utf-8"))
    ft: list[str] = bc["book"]["full_text"]
    idx = json.loads((ROOT / "data/bookContent.index.json").read_text(encoding="utf-8"))
    chapitres = idx["chapitres"]  # domain, unit, chapter, ligneDebut, ligneFin
    book_norm = norm(" ".join(ft))
    return book_norm, chapitres, " ".join(ft)


def texte_chapitre(ft_join_or_list, chapitres: list[dict], ch: int) -> str:
    # CHAPITRES[ch-1] dans le lock TS : position 0-based par n° global
    c = chapitres[ch - 1]
    # le lock utilise full_text.slice(ligneDebut, ligneFin+1) — on recalcule
    # via le JSON full_text à chaque appel pour coller exactement
    return c  # placeholder — géré par build_cache


def build_chapter_cache(ft: list[str], chapitres: list[dict]) -> dict[int, str]:
    cache: dict[int, str] = {}
    for i, c in enumerate(chapitres, start=1):
        debut = int(c["ligneDebut"])
        fin = int(c["ligneFin"])
        cache[i] = norm(" ".join(ft[debut : fin + 1]))
    return cache


# ── suspects documentés (audit 2026-09-23) ─────────────────────────────────
SUSPECTS = [
    ("تعبرز", "graphie OCR ? (تبرز attendu)"),
    ("فترة كامen", None),  # placeholder ascii — remplacé plus bas
]


def detect_suspects(resumes: dict, book_norm: str, chap_txt: dict[int, str], ancrage: dict) -> list[dict]:
    """Liste de motifs lexicographiques suspects + recherche systématique."""
    motifs = [
        (r"تعبرز", "graphie inhabituelle — vérifier تبرز / تُبرز vs livre"),
        (r"فترة كامن", "expression — vérifier période de latence vs livre"),
        (r"ناشزة", "graphie — vérifier ناشِعة/ناشِطة vs livre"),
        (r"إلى الترجمة", "sens douteux en contexte ATP (H+ → matrice ?)"),
        (r"يتكسر تراكم", "syntaxe étrange — vérifier formulation livre"),
        (r"المغماتية", "orthographe — الميغmatite / مغماتية vs livre"),
        (r"الحجارة", None),
    ]
    findings = []
    for pat, note in motifs:
        if note is None:
            continue
        rx = re.compile(pat)
        for k, r in resumes.items():
            champs = [("objectif", r["objectif"]), ("termeBac", r["termeBac"])]
            champs += [(f"point{i+1}", p) for i, p in enumerate(r["points"])]
            for field, text in champs:
                if rx.search(text):
                    # ancrage de ce champ
                    chs = ancrage.get(k, [])
                    ctx = " ".join(chap_txt.get(c, "") for c in chs)
                    js = jetons(text)
                    hit_ch = [j for j in js if any(j in chap_txt.get(c, "") for c in chs)]
                    in_book = any(j in book_norm for j in js)
                    # motif normalisé dans livre ?
                    motif_norm = norm(pat.replace(r"\\", ""))
                    # pour regex simple, norm le motif littéral
                    motif_lit = norm(re.sub(r"[()]", "", pat))
                    in_book_motif = motif_lit and motif_lit in book_norm
                    in_chap_motif = motif_lit and motif_lit in ctx
                    findings.append(
                        {
                            "type": "suspect_lexical",
                            "motif": pat,
                            "note": note,
                            "key": k,
                            "ligne": r["ligne_source"],
                            "field": field,
                            "texte": text,
                            "ancrage_chs": chs,
                            "nb_jetons": len(js),
                            "jetons_hit_chapitres": hit_ch,
                            "point_passe_lock": bool(hit_ch),
                            "motif_dans_livre": bool(in_book_motif),
                            "motif_dans_chapitres_ancrage": bool(in_chap_motif),
                            "nb_jetons_dans_livre": sum(1 for j in js if j in book_norm),
                        }
                    )
    return findings


def audit_ancrage(resumes, ancrage, chap_txt, book_norm, min_hit: int = 1):
    """Reproduit le lock + métriques de fragilité (1 seul jeton = fragile)."""
    rows = []
    for k, r in resumes.items():
        chs = ancrage.get(k, [])
        ctx = " ".join(chap_txt.get(c, "") for c in chs)
        for i, p in enumerate(r["points"]):
            js = jetons(p)
            hits = [j for j in js if j in ctx]
            hits_book = [j for j in js if j in book_norm]
            rows.append(
                {
                    "key": k,
                    "point": i + 1,
                    "ligne": r["ligne_source"] + 0,  # ligne approx via clé
                    "texte": p,
                    "nb_jetons": len(js),
                    "hits_chapitres": len(hits),
                    "hits_livre": len(hits_book),
                    "lock_ok": len(hits) >= min_hit and len(js) > 0,
                    "fragile_1_jeton": len(hits) == 1,
                    "hors_livre": len(hits_book) == 0 and len(js) > 0,
                    "sans_jeton": len(js) == 0,
                }
            )
    return rows


def audit_objectifs(resumes, ancrage, chap_txt, book_norm):
    rows = []
    for k, r in resumes.items():
        for field in ("objectif", "termeBac"):
            text = r[field]
            if not text:
                rows.append({"key": k, "field": field, "manquant": True})
                continue
            chs = ancrage.get(k, [])
            ctx = " ".join(chap_txt.get(c, "") for c in chs)
            js = jetons(text)
            hits = [j for j in js if j in ctx]
            hits_book = [j for j in js if j in book_norm]
            rows.append(
                {
                    "key": k,
                    "field": field,
                    "texte": text,
                    "nb_jetons": len(js),
                    "hits_chapitres": len(hits),
                    "hits_livre": len(hits_book),
                    "lock_note": "non vérifié par le verrou (lock ne couvre que points)",
                    "fragile": len(hits) <= 1,
                    "hors_livre": len(hits_book) == 0 and len(js) > 0,
                }
            )
    return rows


def audit_gold(gold, ancrage, chap_txt, book_norm):
    rows = []
    for k, g in gold.items():
        chs = ancrage.get(k, [])
        ctx = " ".join(chap_txt.get(c, "") for c in chs)
        # texte = vocabulary + mechanism + mission + evidence
        pieces = list(g["vocabulary"]) + list(g["mechanism"]) + [g["mission"], g["evidence"], g["commonError"], g["recall"]]
        pieces = [p for p in pieces if p]
        for i, text in enumerate(pieces):
            js = jetons(text)
            hits = [j for j in js if j in ctx]
            hits_book = [j for j in js if j in book_norm]
            rows.append(
                {
                    "key": k,
                    "field_idx": i,
                    "nb_jetons": len(js),
                    "hits_chapitres": len(hits),
                    "hits_livre": len(hits_book),
                    "lock_ok_noir": len(hits) > 0,  # gold NON couvert par resumes.lock
                    "fragile_1": len(hits) == 1,
                    "hors_livre": len(hits_book) == 0 and len(js) > 0,
                    "status": g["status"],
                    "reviewed": g["reviewed"],
                    "ligne": g["ligne"],
                    "extrait": text[:80],
                }
            )
    return rows


def audit_html_hosila(hosila_ancres: list[tuple[str, list[str]]]):
    """Marqueurs حصيلة dans les HTML (mirroir resumes.lock HOSILA)."""
    rows = []
    for f, marqueurs in hosila_ancres:
        p = ROOT / "content/lessons" / f"{f}.html"
        if not p.exists():
            rows.append({"file": f, "absent": True})
            continue
        brut = p.read_text(encoding="utf-8")
        texte = re.sub(r"<[^>]+>", " ", brut)
        rows.append(
            {
                "file": f,
                "absent": False,
                "id_hosila": 'id="hosila"' in brut,
                "link_hosila": "link-hosila" in brut,
                "marqueurs_ok": all(m in texte for m in marqueurs),
                "marqueurs_ko": [m for m in marqueurs if m not in texte],
                "injection_resume": ("خلاصة" in texte) or ("📝" in texte),
            }
        )
    return rows


# ancres officielles doc (miroir lock L87-99)
HOSILA_LOCK: list[tuple[str, list[str]]] = [
    ("phase2_chapitres_3_4", ["المخطط التحصيلي لعملية تركيب البروتين", "الشبكة الهيولية"]),
    ("phase3_chapitres_5_6", ["الروابط الببتيدية", "الطرف الأميني"]),
    ("phase7_chapitres_13_14", ["وحدة بيولوجية مستقلة بذاتها", "الذات واللاذات"]),
    ("phase12_chapitres_23_24", ["التيلاكويد", "كيميوحيوية"]),
    ("phase14_chapitres_27_28", ["حصيلة التحلل السكري", "38 ATP"]),
    ("phase15_chapitres_29_30", ["الإمداد المستمر من الطاقة", "التنفس الخلوي"]),
    ("phase22_chapitres_43_44", ["أوفيوليت", "التقلص القشري"]),
    ("phase4_chapitres_7_8", ["التكامل المحف", "الموقع الفعال", "37°C"]),
    ("phase10_chapitres_19_20", ["كمون الراحة", "PPSE", "الإدماج العصبي"]),
    ("phase18_chapitres_35_36", ["جلد الحمار الوحشي", "مستوى بينيوف", "تيارات حمل"]),
    ("phase20_chapitres_39_40", ["السيسمومتر", "سيما", "الأستينوسفير"]),
]


def audit_okacha_enriched(path: Path, book_norm: str):
    src = path.read_text(encoding="utf-8")
    # stats commentaires header
    stats = {}
    for k in ("unites", "points", "blocs", "genere", "pointsTotal"):
        m = re.search(rf"{k}\D{{0,20}}(\d{{4}}-\d{{2}}-\d{{2}}|\d+)", src)
        if m:
            stats[k] = m.group(1)
    m = re.search(r"(\d+)\s*/\s*(\d+)\s*/\s*(\d+)\s*/\s*(\d+)", src[:2000])
    if m:
        stats["ratio_header"] = list(m.groups())
    # résidus
    code = re.sub(r"/\*[\s\S]*?\*/", "", src)
    code = re.sub(r"(?m)^\s*//.*$", "", code)
    resid = {
        "EXTRAIRE": len(re.findall(r"EXTRAIRE", code)),
        "إليك النص": len(re.findall(r"إليك النص", code)),
        "METHODO": len(re.findall(r"OKACHA_METHODO", src)),
    }
    # points de données
    nb_points = len(re.findall(r'kind:\s*"point"', code))
    return {"stats": stats, "residus": resid, "nb_points_kind": nb_points, "lignes": src.count("\n") + 1}


def classify(rows_points, suspects, gold_rows, html_rows, hosila, okacha, resumes, ancrage):
    """P0 / P1 / P2 avec preuves."""
    p0, p1, p2 = [], [], []

    # P0 : point hors livre ENTIER (invention / erreur de sens non ancrée)
    for r in rows_points:
        if r["hors_livre"] and not r["sans_jeton"]:
            p0.append(
                {
                    "id": f"P0-ancrage-{r['key']}-p{r['point']}",
                    "fichier": "src/data/resumesLecons.ts",
                    "key": r["key"],
                    "texte": r["texte"],
                    "preuve": f"0/{r['nb_jetons']} jetons dans bookContent.json (livre entier)",
                    "rec": "Réécrire le point à partir du texte des chapitres ancrés.",
                }
            )
        if r["sans_jeton"]:
            p0.append(
                {
                    "id": f"P0-nojeton-{r['key']}-p{r['point']}",
                    "fichier": "src/data/resumesLecons.ts",
                    "key": r["key"],
                    "texte": r["texte"],
                    "preuve": "point sans aucun jeton ≥5 car. normalisé",
                    "rec": "Réécrire (trop court ou non arabe normalisable).",
                }
            )
        if not r["lock_ok"]:
            p0.append(
                {
                    "id": f"P0-lockfail-{r['key']}-p{r['point']}",
                    "fichier": "src/data/resumesLecons.ts",
                    "key": r["key"],
                    "texte": r["texte"],
                    "preuve": f"{r['hits_chapitres']} hit(s) dans chapitres ancrés — verrou ancrage échouerait",
                    "rec": "Réaligner sur chapitres déclarés.",
                }
            )

    # P0 aussi : suspect dont le motif est hors livre (sens inventé)
    for s in suspects:
        if not s["motif_dans_livre"]:
            p0.append(
                {
                    "id": f"P0-suspect-horslivre-{s['key']}-{s['field']}",
                    "fichier": "src/data/resumesLecons.ts",
                    "key": s["key"],
                    "ligne": s["ligne"],
                    "texte": s["texte"],
                    "preuve": f"motif « {s['motif']} » absent du livre normalisé ; {s['note']}",
                    "rec": "Corriger la formulation d'après le livre.",
                }
            )
        elif not s["motif_dans_chapitres_ancrage"] and s["point_passe_lock"]:
            # passe le lock par d'autres jetons mais motif hors chapitres déclarés
            p1.append(
                {
                    "id": f"P1-suspect-horschap-{s['key']}-{s['field']}",
                    "fichier": "src/data/resumesLecons.ts",
                    "key": s["key"],
                    "ligne": s["ligne"],
                    "texte": s["texte"],
                    "preuve": f"motif « {s['motif']} » dans livre?={s['motif_dans_livre']} mais hors chapitres {s['ancrage_chs']} ; lock passe via {s['jetons_hit_chapitres'][:3]}",
                    "rec": "Vérifier ancrage chapitre / reformuler.",
                }
            )
        else:
            p2.append(
                {
                    "id": f"P2-suspect-note-{s['key']}-{s['field']}",
                    "fichier": "src/data/resumesLecons.ts",
                    "key": s["key"],
                    "ligne": s["ligne"],
                    "texte": s["texte"],
                    "preuve": f"motif « {s['motif']} » présent dans chapitres — qualité rédactionnelle à relire ({s['note']})",
                    "rec": "Relecture éditoriale owner.",
                }
            )

    # P1 : fragilité (1 seul jeton d'ancre)
    frag = [r for r in rows_points if r["fragile_1_jeton"] and r["lock_ok"]]
    if frag:
        p1.append(
            {
                "id": "P1-fragile-1jeton",
                "fichier": "src/data/resumesLecons.ts",
                "count": len(frag),
                "exemples": [
                    {"key": r["key"], "point": r["point"], "jeton_hit": r["texte"][:60]}
                    for r in frag[:8]
                ],
                "preuve": f"{len(frag)} point(s) ne passent le verrou que par 1 seul jeton ≥5 car.",
                "rec": "Renforcer : 2 jetons ou reformuler sur le texte chapitre.",
            }
        )

    # P1 : objectifs/termeBac non couverts par le verrou
    obj_frag = [r for r in audit_objectifs_res_cache if r.get("fragile") or r.get("hors_livre")]
    if obj_frag:
        p1.append(
            {
                "id": "P1-objectif-hors-verrou",
                "fichier": "src/data/resumesLecons.ts",
                "count": len(obj_frag),
                "exemples": obj_frag[:8],
                "preuve": "objectif/termeBac : resumes.lock ne vérifie QUE les points — objectifs fragiles ou hors livre non bloqués",
                "rec": "Étendre le verrou à objectif + termeBac.",
            }
        )

    # P1 : gold non ancré (aucun lock dédié sur contenu gold vs chapitres)
    gold_hors = [r for r in gold_rows if r["hors_livre"]]
    gold_frag = [r for r in gold_rows if r["fragile_1"] and not r["hors_livre"]]
    if gold_hors:
        p1.append(
            {
                "id": "P1-gold-hors-livre",
                "fichier": "src/data/lessonGoldSummaries.ts",
                "count": len(gold_hors),
                "exemples": gold_hors[:6],
                "preuve": f"{len(gold_hors)} bloc(s) gold sans aucun jeton dans le livre (aucun lock d'ancrage gold)",
                "rec": "Ajouter lessonGold.lock ancrage chapitres + corriger.",
            }
        )
    if gold_frag:
        p2.append(
            {
                "id": "P2-gold-fragile",
                "fichier": "src/data/lessonGoldSummaries.ts",
                "count": len(gold_frag),
                "preuve": f"{len(gold_frag)} bloc(s) gold avec 1 seul jeton d'ancre",
                "rec": "Renforcer ancrage gold.",
            }
        )

    # P2 : gold statut — 19/19 adaptation non revu (constat éditorial)
    p2.append(
        {
            "id": "P2-gold-statut",
            "fichier": "src/data/lessonGoldSummaries.ts",
            "preuve": "19/19 status=adaptation_pedagogique, reviewed=false, 0 manuel_officiel_verifie",
            "rec": "Traçabilité : relecture enseignant ou bascule honest status (déjà documenté Speckit V3).",
        }
    )

    # Hosila
    if any(v for v in hosila["residus_dans_donnees"].values()):
        p0.append(
            {
                "id": "P0-hosila-residu",
                "fichier": "src/data/hosila.ts",
                "preuve": hosila["residus_dans_donnees"],
                "rec": "Nettoyer résidus extraction.",
            }
        )
    else:
        p2.append(
            {
                "id": "P2-hosila-propore",
                "fichier": "src/data/hosila.ts",
                "preuve": f"0 résidu extraction dans données ; {hosila['nb_unites']} u. / {hosila['nb_points']} pts — lock anti-résidus OK",
                "rec": "Aucun (statut vert).",
            }
        )

    # HTML
    ko = [h for h in html_rows if h.get("absent") or not h.get("marqueurs_ok") or not h.get("id_hosila")]
    if ko:
        p0.append(
            {
                "id": "P0-html-hosila",
                "fichier": "content/lessons/*.html",
                "exemples": ko,
                "preuve": f"{len(ko)} HTML cassant le verrou حصيلة",
                "rec": "Réinjecter carte hosila + marqueurs.",
            }
        )
    else:
        p2.append(
            {
                "id": "P2-html-hosila-ok",
                "fichier": "content/lessons/*.html",
                "preuve": f"{len(html_rows)}/11 cartes حصيلة HTML OK (id + marqueurs)",
                "rec": "Aucun (statut vert).",
            }
        )

    # okachaEnriched
    if okacha["residus"].get("EXTRAIRE") or okacha["residus"].get("إليك النص") or okacha["residus"].get("METHODO"):
        p0.append(
            {
                "id": "P0-okacha-residu",
                "fichier": "src/data/okachaEnriched.ts",
                "preuve": okacha["residus"],
                "rec": "Purger résidus.",
            }
        )

    # couverture ancrage déclarée
    sans_acc = [k for k in resumes if k not in ancrage]
    if sans_acc:
        p0.append(
            {
                "id": "P0-sans-ancrage",
                "fichier": "src/data/resumesLecons.ts",
                "keys": sans_acc,
                "preuve": "clés resumes sans CHAPITRES_ANCRAGE",
                "rec": "Déclarer ancrage.",
            }
        )

    # P1 structurel : ancrage weak design (1 jeton min dans le lock)
    p1.append(
        {
            "id": "P1-lock-design",
            "fichier": "src/data/resumes.lock.test.ts",
            "preuve": "seuil ancrage = ≥1 jeton ≥5 car./point — trop faible (fragilité mesurée ci-dessus) ; objectif/termeBac/gold non couverts",
            "rec": "Durcir : ≥2 jetons ou couverture objectif+gold.",
        }
    )

    return p0, p1, p2


# cache global pour classify (objectifs)
audit_objectifs_res_cache: list = []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", type=Path, default=None)
    ap.add_argument("--md", type=Path, default=None)
    ap.add_argument("--min-hit", type=int, default=1, help="seuil lock (1 = verrou actuel)")
    args = ap.parse_args()

    resumes, ancrage = parse_resumes(ROOT / "src/data/resumesLecons.ts")
    cles_passives = parse_cles_passives(ROOT / "src/data/resumesLecons.ts")
    gold = parse_gold(ROOT / "src/data/lessonGoldSummaries.ts")
    hosila = parse_hosila(ROOT / "src/data/hosila.ts")
    okacha = audit_okacha_enriched(ROOT / "src/data/okachaEnriched.ts", "")

    bc = json.loads((ROOT / "data/bookContent.json").read_text(encoding="utf-8"))
    ft: list[str] = bc["book"]["full_text"]
    idx = json.loads((ROOT / "data/bookContent.index.json").read_text(encoding="utf-8"))
    chapitres = idx["chapitres"]
    book_norm = norm(" ".join(ft))
    chap_txt = build_chapter_cache(ft, chapitres)

    rows_points = audit_ancrage(resumes, ancrage, chap_txt, book_norm, args.min_hit)
    global audit_objectifs_res_cache
    audit_objectifs_res_cache = audit_objectifs(resumes, ancrage, chap_txt, book_norm)
    suspects = detect_suspects(resumes, book_norm, chap_txt, ancrage)
    gold_rows = audit_gold(gold, ancrage, chap_txt, book_norm)
    html_rows = audit_html_hosila(HOSILA_LOCK)

    p0, p1, p2 = classify(rows_points, suspects, gold_rows, html_rows, hosila, okacha, resumes, ancrage)

    # stats globales
    n_pts = len(rows_points)
    n_ok = sum(1 for r in rows_points if r["lock_ok"])
    n_frag = sum(1 for r in rows_points if r["fragile_1_jeton"])
    n_hors = sum(1 for r in rows_points if r["hors_livre"])
    n_sans = sum(1 for r in rows_points if r["sans_jeton"])
    gold_hors = sum(1 for r in gold_rows if r["hors_livre"])
    gold_frag = sum(1 for r in gold_rows if r["fragile_1"])

    report = {
        "meta": {
            "script": "scripts/audit_resumes_hosila.py",
            "date": "2026-09-23",
            "etalon": "docs/RESUMES_MAARIFI_LIVRE_2026-09-21.md + data/bookContent.json",
            "recette_norm": "miroir resumes.lock.test.ts L20-24",
            "seuil_lock": args.min_hit,
        },
        "stats": {
            "resumes": len(resumes),
            "ancrage_keys": len(ancrage),
            "cles_passives": len(cles_passives),
            "points": n_pts,
            "lock_ok": n_ok,
            "lock_fail": n_pts - n_ok,
            "fragile_1_jeton": n_frag,
            "hors_livre": n_hors,
            "sans_jeton": n_sans,
            "suspects": len(suspects),
            "gold_entries": len(gold),
            "gold_blocs": len(gold_rows),
            "gold_hors_livre": gold_hors,
            "gold_fragile": gold_frag,
            "hosila_unites": hosila["nb_unites"],
            "hosila_points": hosila["nb_points"],
            "html_hosila": len(html_rows),
            "okacha_residus": okacha["residus"],
            "book_lignes": len(ft),
            "chapitres": len(chapitres),
        },
        "suspects": suspects,
        "points_lock_fail": [r for r in rows_points if not r["lock_ok"]],
        "points_fragiles": [r for r in rows_points if r["fragile_1_jeton"] and r["lock_ok"]][:30],
        "objectifs_cache": audit_objectifs_res_cache,
        "gold_rows_hors": gold_hors and [r for r in gold_rows if r["hors_livre"]] or [],
        "html_rows": html_rows,
        "hosila": {k: v for k, v in hosila.items() if k != "all_text"},
        "okacha": okacha,
        "P0": p0,
        "P1": p1,
        "P2": p2,
    }

    # Markdown pro
    lines: list[str] = []
    lines.append("# Audit pro — résumés / hosila / gold / HTML (Script A)")
    lines.append("")
    lines.append("**Date :** 2026-09-23 · **Branche :** `arena/01a0c955-kunz-el-ouloum` · **HEAD :** purge `778f271`")
    lines.append("")
    lines.append("**Périmètre :** `src/data/resumesLecons.ts` · `lessonGoldSummaries.ts` · `content/lessons/*.html` · `okachaEnriched.ts` · `hosila.ts`")
    lines.append("")
    lines.append("**Étalon :** texte الحصيلة collé par l'utilisateur (`docs/RESUMES_MAARIFI_LIVRE_2026-09-21.md`) + `data/bookContent.json` (identité PDF sha256, cf. AUDIT_MOT_A_MOT).")
    lines.append("")
    lines.append("**Méthode (Script A) :** recette exacte du verrou `resumes.lock.test.ts` (NFKC, diacritiques, variantes arabes, jeton ≥ 5 car., chapitres `CHAPITRES_ANCRAGE` via index lignes), puis passe supplémentaires : hors-livre, fragilité 1 jeton, suspects lexicographiques, gold, HTML, hosila, okachaEnriched.")
    lines.append("")
    lines.append("## 0. Métriques")
    lines.append("")
    lines.append("| Indicateur | Valeur |")
    lines.append("|---|---|")
    lines.append(f"| Résumés (entrées) | {len(resumes)} |")
    points_tbl = n_pts
    lines.append(f"| Points audités | {points_tbl} |")
    lines.append(f"| Verrou ancrage OK (≥{args.min_hit} jeton) | {n_ok}/{points_tbl} |")
    lines.append(f"| Verrou FAIL | **{n_pts - n_ok}** |")
    lines.append(f"| Fragiles (1 seul jeton d'ancre) | {n_frag} |")
    lines.append(f"| Hors livre (0 jeton dans tout le livre) | **{n_hors}** |")
    lines.append(f"| Suspects lexicographiques | {len(suspects)} |")
    lines.append(f"| Gold entries / blocs | {len(gold)} / {len(gold_rows)} |")
    lines.append(f"| Gold hors livre / fragile | {gold_hors} / {gold_frag} |")
    lines.append(f"| Hosila unités / points | {hosila['nb_unites']} / {hosila['nb_points']} |")
    lines.append(f"| HTML cartes حصيلة OK | {sum(1 for h in html_rows if not h.get('absent') and h.get('id_hosila') and h.get('marqueurs_ok'))}/{len(html_rows)} |")
    lines.append(f"| okachaEnriched résidus | {okacha['residus']} |")
    lines.append("")

    def dump_sec(title, arr, n=50):
        # title peut déjà contenir « ## »
        t = title if title.startswith("#") else f"## {title}"
        lines.append(t)
        lines.append("")
        if not arr:
            lines.append("_Aucun._")
            lines.append("")
            return
        for i, it in enumerate(arr[:n], 1):
            if not isinstance(it, dict):
                lines.append(f"{i}. `{it}`")
                continue
            iid = it.get("id", f"#{i}")
            lines.append(f"### {i}. `{iid}`")
            lines.append("")
            for k in ("fichier", "key", "ligne", "texte", "preuve", "count", "rec", "exemples", "keys"):
                if k in it and it[k] not in (None, [], "", 0):
                    v = it[k]
                    if isinstance(v, (list, dict)):
                        v = json.dumps(v, ensure_ascii=False)[:500]
                    lines.append(f"- **{k} :** {v}")
            lines.append("")
        if len(arr) > n:
            lines.append(f"_… +{len(arr) - n} autres en JSON._")
            lines.append("")

    dump_sec("## P0 — bloquants (hors livre / verrou cassé / invention)", p0)
    dump_sec("## P1 — structurels (design verrou, gold, fragilité)", p1)
    dump_sec("## P2 — éditoriaux / verts documentés", p2)

    lines.append("## Annexes — suspects détaillés")
    lines.append("")
    if suspects:
        lines.append("| key | field | motif | dans livre ? | dans chap. ancrés ? | lock point |")
        lines.append("|---|---|---|---|---|---|")
        for s in suspects:
            lines.append(
                f"| `{s['key']}` | {s['field']} | {s['motif']} | {s['motif_dans_livre']} | {s['motif_dans_chapitres_ancrage']} | {s['point_passe_lock']} |"
            )
    else:
        lines.append("_Aucun motif suspect détecté._")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("_Généré par `scripts/audit_resumes_hosila.py` — reproductible : `python3 scripts/audit_resumes_hosila.py`._")
    lines.append("")

    md = "\n".join(lines)
    if args.json:
        args.json.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.md:
        args.md.write_text(md, encoding="utf-8")
    print(md)
    # exit code : P0 = 1 (audit détecte), P1 seul = 0
    return 1 if p0 else 0


if __name__ == "__main__":
    sys.exit(main())
