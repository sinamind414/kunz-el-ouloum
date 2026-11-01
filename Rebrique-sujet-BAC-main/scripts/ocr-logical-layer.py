#!/usr/bin/env python3
"""Reconstruit un PDF « image + couche texte LOGIQUE » depuis un PDF source.

Contexte : les PDF dzexams ont une couche texte irrécupérable (ordre visuel
+ paires de lettres échangées). tesseract reconnaît juste (mots logiques)
mais tous les sérialiseurs couchent les mots de gauche à droite. Ce script
écrit donc la couche lui-même : police simple Helvetica (jamais rastérisée,
render mode 3 = invisible) + ToUnicode maison qui mappe chaque octet vers le
caractère logique canonique (U+0600–U+06FF, pas de formes de présentation).
Aucune police arabe requise, aucun façonnage : l'extraction rend l'arabe
logique, que le navigateur met en forme à la copie.

Pipeline : rendu 300 dpi → tesseract TSV → tri RTL droite→gauche par ligne
→ page de texte invisible → qpdf --overlay sur l'image.

Usage (sur le runner CI) :
    python3 scripts/ocr-logical-layer.py <src.pdf> <dest.pdf> <qa.txt> [--dpi N] [--min-conf C]
"""

import csv
import re
import subprocess
import sys
import tempfile
import traceback
from pathlib import Path

import fitz  # pymupdf
from bidi.algorithm import get_display

DPI = 300
MIN_CONF = 0.0
ARABIC_RE = re.compile(r"[\u0600-\u06FF]")
LATIN_RE = re.compile(r"[A-Za-z]")
QA: list = []


def qa(msg: str) -> None:
    QA.append(msg)
    print(msg, flush=True)


def read_tsv(path: Path):
    words = []
    dropped = 0
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
        for row in reader:
            try:
                if int(row["level"]) != 5:
                    continue
                text = (row["text"] or "").strip()
                if not text:
                    continue
                if float(row["conf"]) < MIN_CONF:
                    dropped += 1
                    continue
                # tesseract donne du LOGIQUE ; les consommateurs pdf.js appliquent
                # bidi à l'extraction : on écrit du VISUEL exact (pur + mixte).
                text = get_display(text)
                words.append(
                    {
                        "line": (int(row["block_num"]), int(row["par_num"]), int(row["line_num"])),
                        "left": int(row["left"]),
                        "top": int(row["top"]),
                        "w": int(row["width"]),
                        "h": int(row["height"]),
                        "conf": float(row["conf"]),
                        "text": text,
                    }
                )
            except (ValueError, KeyError):
                continue
    return words, dropped


def byte_pool():
    pool = [b for b in range(0x20, 0x7F) if b not in (0x28, 0x29, 0x5C)]
    pool += list(range(0xA0, 0x100))
    return pool


def encode_word(word, code_of):
    out = bytearray()
    for ch in word:
        code = code_of.get(ch)
        if code is None:
            continue
        if code in (0x28, 0x29, 0x5C):
            out.append(0x5C)
        out.append(code)
    return bytes(out)


def build_text_page(txt_doc, ordered_lines, page_w_pt, page_h_pt):
    """Page de texte invisible : alphabet de la page → octets → ToUnicode."""
    alphabet = []
    for _, words in ordered_lines:
        for w in words:
            for ch in w["text"]:
                if ch not in alphabet:
                    alphabet.append(ch)
    pool = byte_pool()
    if len(alphabet) > len(pool):
        alphabet = alphabet[: len(pool)]
    code_of = {ch: pool[i] for i, ch in enumerate(alphabet)}
    # Largeurs relatives mesurées (moyenne par caractère).
    acc: dict = {}
    for _, words in ordered_lines:
        for w in words:
            fs = max(w["h"] * 72 / DPI * 0.72, 4)
            if not w["text"]:
                continue
            rel = (w["w"] * 72 / DPI) / (len(w["text"]) * fs) * 1000
            for ch in w["text"]:
                if ch in code_of:
                    s, n = acc.get(ch, (0.0, 0))
                    acc[ch] = (s + min(max(rel, 200), 1200), n + 1)
    widths = []
    for code in range(32, 256):
        ch = next((c for c, b in code_of.items() if b == code), None)
        if ch is not None and ch in acc:
            s, n = acc[ch]
            widths.append(str(int(s / n)))
        else:
            widths.append("500")
    # ToUnicode CMap (blocs de 100 max).
    items = sorted(code_of.items(), key=lambda kv: kv[1])
    bfchars = []
    for i in range(0, len(items), 100):
        block = items[i : i + 100]
        bfchars.append(f"{len(block)} beginbfchar")
        for ch, code in block:
            bfchars.append(f"<{code:02X}> <{ord(ch):04X}>")
        bfchars.append("endbfchar")
    cmap = (
        "/CIDInit /ProcSet findresource begin 12 dict begin begincmap "
        "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def "
        "/CMapName /Adobe-Identity-UCS def /CMapType 2 def "
        "1 begincodespacerange <00> <FF> endcodespacerange "
        + " ".join(bfchars)
        + " endcmap CMapName currentdict /CMap defineresource pop end end"
    )
    page = txt_doc.new_page(width=page_w_pt, height=page_h_pt)
    txref = txt_doc.get_new_xref()
    txt_doc.update_object(txref, "<< >>")
    txt_doc.update_stream(txref, cmap.encode("ascii"))
    fxref = txt_doc.get_new_xref()
    txt_doc.update_object(
        fxref,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /FirstChar 32 /LastChar 255 "
        f"/Widths [{' '.join(widths)}] /Encoding /WinAnsiEncoding /ToUnicode {txref} 0 R >>",
    )
    txt_doc.xref_set_key(page.xref, "Resources", f"<< /Font << /F1 {fxref} 0 R >> >>")
    ops = []
    for _, words in ordered_lines:
        for w in words:
            enc = encode_word(w["text"], code_of)
            if not enc:
                continue
            fs = max(w["h"] * 72 / DPI * 0.72, 4)
            x_pt = w["left"] * 72 / DPI
            baseline = w["base"]
            ops.append(
                f"BT /F1 {fs:.2f} Tf 3 Tr 1 0 0 1 {x_pt:.2f} {baseline:.2f} Tm (".encode("ascii")
                + enc
                + b") Tj ET"
            )
    content = b"\n".join(ops)
    existing = page.get_contents()
    if existing:
        txt_doc.update_stream(existing[0], content)
    else:
        cxref = txt_doc.get_new_xref()
        txt_doc.update_object(cxref, "<< >>")
        txt_doc.update_stream(cxref, content)
        txt_doc.xref_set_key(page.xref, "Contents", f"{cxref} 0 R")
    return len(alphabet)


def main(src: str, dest: str, qa_path: str) -> int:
    failures = 0
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        doc = fitz.open(src)
        qa(f"SRC {src} : {doc.page_count} pages (dpi={DPI} min-conf={MIN_CONF:g})")
        img_doc = fitz.open()
        txt_doc = fitz.open()
        for pno in range(doc.page_count):
            try:
                page = doc[pno]
                pix = page.get_pixmap(dpi=DPI)
                w_pt, h_pt = pix.width * 72 / DPI, pix.height * 72 / DPI
                img = tmpdir / f"p{pno}.jpg"
                pix.save(str(img), jpg_quality=85)
                ip = img_doc.new_page(width=w_pt, height=h_pt)
                ip.insert_image(fitz.Rect(0, 0, w_pt, h_pt), stream=img.read_bytes())
                base = tmpdir / f"p{pno}"
                r = subprocess.run(
                    ["tesseract", str(img), str(base), "-l", "ara+fra+eng", "tsv"],
                    capture_output=True,
                    text=True,
                    timeout=600,
                )
                if r.returncode != 0:
                    qa(f"page {pno + 1} : TESSERACT EXIT {r.returncode} :: {r.stderr[:200]}")
                    failures += 1
                    txt_doc.new_page(width=w_pt, height=h_pt)
                    continue
                words, dropped = read_tsv(base.with_suffix(".tsv"))
                if dropped:
                    qa(f"page {pno + 1} : rejetés conf<{MIN_CONF:g} : {dropped}")
                if pno == 0:
                    for w in words[:8]:
                        qa(f"  TSV {w['left']:4d} c={w['conf']:5.1f} {ascii(w['text'])}")
                lines: dict = {}
                for w in words:
                    lines.setdefault(w["line"], []).append(w)
                ordered = []
                rtl_count = 0
                for key in sorted(lines, key=lambda k: min(w["top"] for w in lines[k])):
                    line = lines[key]
                    joined = " ".join(w["text"] for w in line)
                    rtl = len(ARABIC_RE.findall(joined)) >= len(LATIN_RE.findall(joined))
                    rtl_count += 1 if rtl else 0
                    srt = sorted(line, key=lambda w: w["left"], reverse=rtl)
                    # Base uniforme par ligne : les extracteurs trient par y,
                    # des y distincts par mot entrelacent les lignes voisines.
                    bottom = max(w["top"] + 0.8 * w["h"] for w in line)
                    base = h_pt - bottom * 72 / DPI
                    for w in srt:
                        w["base"] = base
                    ordered.append((key, srt))
                nalpha = build_text_page(txt_doc, ordered, w_pt, h_pt)
                confs = [w["conf"] for w in words]
                lo = sum(1 for c in confs if c < 30)
                qa(f"page {pno + 1} : mots={len(words)} lignes={len(lines)} rtl={rtl_count} alpha={nalpha} conf<30={lo}")
                if pno == 0 and ordered:
                    for _, ws in ordered:
                        if sum(1 for w in ws if ARABIC_RE.search(w["text"])) >= 3:
                            qa("  INTENT " + ascii(" ".join(w["text"] for w in ws[:6])))
                            break
            except Exception as e:  # noqa: BLE001
                qa(f"page {pno + 1} : ERREUR {type(e).__name__}: {str(e)[:300]}")
                for line in traceback.format_exc().strip().splitlines()[-4:]:
                    qa(f"    {line.strip()[:160]}")
                failures += 1
        img_path = tmpdir / "img.pdf"
        txt_path = tmpdir / "txt.pdf"
        img_doc.save(str(img_path))
        txt_doc.save(str(txt_path))
        qa(f"img={img_path.stat().st_size} txt={txt_path.stat().st_size} échecs={failures}")
        r = subprocess.run(
            ["qpdf", str(img_path), "--overlay", str(txt_path), "--", dest],
            capture_output=True,
            text=True,
            timeout=300,
        )
        qa(f"qpdf exit={r.returncode} {r.stderr[:200]}")
        if r.returncode != 0:
            Path(qa_path).write_text("\n".join(QA) + "\n", encoding="utf-8")
            return 2
        final = fitz.open(dest)
        qa(f"FINAL {dest} : {final.page_count} pages, {Path(dest).stat().st_size} octets")
        for pno in range(min(final.page_count, 2)):
            qa(f"--- page {pno + 1} couche finale ---")
            qa(final[pno].get_text()[:500].replace("\n", " / "))
        qa("VERDICT : extraits fitz ci-dessus = tri+bidi (non contractuel) ;")
        qa("vrai verdict = correcteur pdf.js du dépôt (sandbox) sur les PDF.")
        final.close()
    Path(qa_path).write_text("\n".join(QA) + "\n", encoding="utf-8")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--dpi" in args:
        DPI = int(args[args.index("--dpi") + 1])
    if "--min-conf" in args:
        MIN_CONF = float(args[args.index("--min-conf") + 1])
    try:
        code = main(sys.argv[1], sys.argv[2], sys.argv[3])
    except Exception as e:  # noqa: BLE001
        Path(sys.argv[3]).write_text(
            "\n".join(QA) + f"\nPLANTAGE SCRIPT: {type(e).__name__}: {e}\n", encoding="utf-8"
        )
        raise
    sys.exit(code)
