#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
md_to_lessons.py — Convertit des Markdown SVT curés en leçons de l'app
(Kunz El Ouloum). Produit un module TypeScript `src/ocrLessons.ts` compatible
avec la structure ExperimentalLesson de `src/lessonData.ts`.

La convention Markdown attendue (à appliquer sur le Markdown OCRisé) :

    # الدرس 1 : تذكير بالمكتسبات
    <!-- breadcrumb: المجال الأول : التخصص الوظيفي للبروتينات • الوحدة 1 : تركيب البروتين -->
    <!-- objective: 🎯 الهدف العلمي : ... -->
    <!-- objective: ⏱️ المدة التقديرية : 20 دقيقة -->

    ## المرحلة 1
    <!-- block: problem -->
    <!-- title: ⚠️ التناقض الظاهري -->
    texte du problème (paragraphes séparés par une ligne vide = textes[])

    <!-- block: text -->
    un autre texte

    <!-- block: quiz -->
    <!-- question: 1. Où se trouve ... ? -->
    <!-- option: أ) proposition A -->
    <!-- option: ب) proposition B -->
    <!-- option: ج) proposition C -->
    <!-- correct: 0 -->

Usage:
    python md_to_lessons.py                       # traite input_markdown/ -> src/ocrLessons.ts
    python md_to_lessons.py --src mon_lecon.md --slug lecon_3
    python md_to_lessons.py --src dossier_md --out src/ocrLessons.ts
"""

import argparse
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SRC = os.path.join(ROOT, "input_markdown")
DEFAULT_OUT = os.path.join(
    os.path.dirname(ROOT), "src", "ocrLessons.ts"
)

BLOCK_TYPES = {
    "problem", "document", "simulation",
    "scientific_text", "bac_tip", "quiz", "text",
}

COMMENT_RE = re.compile(r"^\s*<!--\s*(.*?)\s*-->\s*$")
BLOCK_RE = re.compile(r"<!--\s*block:\s*(\w+)\s*-->", re.IGNORECASE)


def ts_str(text: str) -> str:
    """Échappe un texte pour un littéral template TypeScript."""
    t = text.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return "`" + t.strip() + "`"


def slugify(name: str) -> str:
    base = os.path.splitext(os.path.basename(name))[0]
    base = re.sub(r"[^a-zA-Z0-9\u0600-\u06FF]+", "_", base)
    return base.strip("_").lower() or "lecon"


def parse_block(lines: list) -> dict:
    btype = "text"
    title = None
    question = None
    options = []
    correct = None
    texts = []
    for ln in lines:
        m = COMMENT_RE.match(ln)
        if m:
            inner = m.group(1).strip()
            if inner.lower().startswith("title:"):
                title = inner[6:].strip()
            elif inner.lower().startswith("question:"):
                question = inner[9:].strip()
            elif inner.lower().startswith("option:"):
                options.append(inner[7:].strip())
            elif inner.lower().startswith("correct:"):
                try:
                    correct = int(inner[8:].strip())
                except ValueError:
                    correct = None
            # 'block:' géré ailleurs
            continue
        texts.append(ln)
    # regroupe les paragraphes (séparés par ligne vide) en éléments texts[]
    paras = []
    cur = []
    for ln in texts:
        if ln.strip() == "":
            if cur:
                paras.append("\n".join(cur).strip())
                cur = []
        else:
            cur.append(ln)
    if cur:
        paras.append("\n".join(cur).strip())
    paras = [p for p in paras if p]

    block = {"type": btype}
    if title is not None:
        block["title"] = title
    if btype == "quiz":
        block["question"] = question or ""
        block["options"] = options
        if correct is not None:
            block["correct"] = correct
    else:
        if paras:
            block["texts"] = paras
    return block


def parse_phase(heading: str, body_lines: list) -> dict:
    # numéro de phase = 1er entier trouvé dans le titre du heading
    m = re.search(r"\d+", heading)
    step = m.group(0) if m else "1"
    # découpe par block
    blocks = []
    cur_lines = []
    cur_type = None
    for ln in body_lines:
        bm = BLOCK_RE.search(ln)
        if bm:
            if cur_type is not None:
                blk = parse_block(cur_lines)
                blk["type"] = cur_type
                blocks.append(blk)
            cur_type = bm.group(1).lower()
            # conserve le reste de la ligne (hors commentaire) comme texte
            rest = BLOCK_RE.sub("", ln).strip()
            cur_lines = [rest] if rest else []
        else:
            if cur_type is None:
                cur_type = "text"
            cur_lines.append(ln)
    if cur_type is not None:
        blk = parse_block(cur_lines)
        blk["type"] = cur_type
        blocks.append(blk)
    return {"step": step, "blocks": blocks}


def parse_lesson(md: str, default_title: str) -> dict:
    lines = md.splitlines()
    title_ar = default_title
    breadcrumb = ""
    objectives = []
    phases = []
    cur_heading = None
    cur_body = []

    def flush_phase():
        if cur_heading is not None:
            phases.append(parse_phase(cur_heading, cur_body))

    for ln in lines:
        if ln.startswith("# ") and not COMMENT_RE.match(ln):
            title_ar = ln[2:].strip()
            continue
        cm = COMMENT_RE.match(ln)
        if cm:
            inner = cm.group(1).strip()
            low = inner.lower()
            if low.startswith("breadcrumb:"):
                breadcrumb = inner[len("breadcrumb:"):].strip()
                continue
            if low.startswith("objective:"):
                objectives.append(inner[len("objective:"):].strip())
                continue
        if ln.startswith("## "):
            flush_phase()
            cur_heading = ln[3:].strip()
            cur_body = []
            continue
        if cur_heading is not None:
            cur_body.append(ln)
    flush_phase()
    if not phases:
        phases = [parse_phase("المرحلة 1", lines)]
    return {
        "titleAr": title_ar,
        "breadcrumb": breadcrumb,
        "objectives": objectives,
        "phases": phases,
    }


def emit_lesson(lesson: dict) -> str:
    out = []
    out.append("  {")
    out.append(f"    titleAr: {ts_str(lesson['titleAr'])},")
    out.append(f"    breadcrumb: {ts_str(lesson['breadcrumb'])},")
    out.append("    objectives: [" + ", ".join(ts_str(o) for o in lesson["objectives"]) + "],")
    out.append("    phases: [")
    for ph in lesson["phases"]:
        out.append("      {step: " + ts_str(ph["step"]) + ", blocks: [")
        for b in ph["blocks"]:
            parts = [f"{{type: `{b['type']}`"]
            if "title" in b:
                parts[0] = f"{{type: `{b['type']}`, title: {ts_str(b['title'])}"
            if b["type"] == "quiz":
                parts.append(f"question: {ts_str(b.get('question', ''))}")
                opts = ", ".join(ts_str(o) for o in b.get("options", []))
                parts.append(f"options: [{opts}]")
                if "correct" in b:
                    parts.append(f"correct: {b['correct']}")
            else:
                # merge title déjà ajouté ; ajoute texts si présents
                if "title" not in b and b.get("texts"):
                    pass
                if b.get("texts"):
                    txts = ", ".join(ts_str(t) for t in b["texts"])
                    parts.append(f"texts: [{txts}]")
            out.append("        " + ", ".join(parts) + "},")
        out.append("      ]},")
    out.append("    ],")
    out.append("  },")
    return "\n".join(out)


HEADER = """// Auto-generated by scripts/ocr/md_to_lessons.py
// Source: curated Markdown (OCR Mistral des manuels SVT arabes)

export interface LessonBlock {
  type: "problem" | "document" | "simulation" | "scientific_text" | "bac_tip" | "quiz" | "text";
  title?: string;
  texts?: string[];
  buttons?: string[];
  active?: boolean;
  question?: string;
  options?: string[];
  correct?: number;
}

export interface LessonPhase {
  step: string;
  blocks: LessonBlock[];
}

export interface ExperimentalLesson {
  titleAr: string;
  breadcrumb: string;
  objectives: string[];
  phases: LessonPhase[];
}

export const OCR_LESSONS: Record<string, ExperimentalLesson> = {
"""


def main():
    ap = argparse.ArgumentParser(description="Markdown SVT -> leçons TS")
    ap.add_argument("--src", default=DEFAULT_SRC, help="fichier .md ou dossier")
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--slug", default=None, help="clé (slug) si --src est un fichier")
    args = ap.parse_args()

    entries = []  # (slug, md)
    if os.path.isdir(args.src):
        for fn in sorted(os.listdir(args.src)):
            if fn.lower().endswith((".md", ".markdown")) and not fn.startswith("_"):
                with open(os.path.join(args.src, fn), encoding="utf-8") as f:
                    entries.append((slugify(fn), f.read()))
    elif os.path.isfile(args.src):
        with open(args.src, encoding="utf-8") as f:
            md = f.read()
        entries.append((args.slug or slugify(args.src), md))
    else:
        print(f"Aucune source trouvée : {args.src}")
        return

    lessons = []
    for slug, md in entries:
        default_title = slug.replace("_", " ")
        lessons.append((slug, parse_lesson(md, default_title)))

    body = ""
    for slug, les in lessons:
        body += f'  "{slug}": ' + emit_lesson(les) + "\n"
    content = HEADER + body + "};\n"

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Généré {len(lessons)} leçon(s) -> {args.out}")


if __name__ == "__main__":
    main()
