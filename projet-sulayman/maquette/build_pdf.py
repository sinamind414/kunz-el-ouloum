#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Maquette PDF — « Sulaymân, le Prophète-Roi »
Moteur de composition : fpdf2 + shaping HarfBuzz.
Deux passes : la première mesure les pages, la seconde insère le sommaire paginé.
"""

import re, os, sys
from fpdf import FPDF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "assets", "fonts")

# ---------------------------------------------------------------- dimensions
PW, PH = 152.4, 228.6          # 6 × 9 in
M_TOP, M_BOT = 20.0, 21.0
M_IN, M_OUT = 19.0, 16.0
BODY = 10.6                    # corps de texte
LEAD = 6.15                    # interlignage

# ---------------------------------------------------------------- couleurs
INK     = (26, 26, 28)
INK_2   = (78, 78, 84)
ACCENT  = (28, 58, 74)         # bleu pétrole profond
GOLD    = (150, 116, 56)
RULE    = (208, 200, 186)
PAPER   = (252, 251, 248)
DARK    = (24, 42, 54)
CREAM   = (240, 233, 216)
CREAM_BODY = (214, 208, 194)
GREEN   = (22, 118, 72)
AMBER   = (170, 124, 26)
RED     = (152, 46, 42)

TAGS = {"🟢": GREEN, "🟡": AMBER, "🔴": RED}

# ---------------------------------------------------------------- helpers
def clean(t):
    t = t.replace("\u00a0", " ")
    return t.strip()

def strip_md(t):
    """Supprime le balisage markdown pour mesurer le texte."""
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t)
    t = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"\1", t)
    t = re.sub(r"__(.+?)__", r"\1", t)
    t = t.replace("`", "")
    return t

def md(t):
    """Convertit le markdown source vers le markdown compris par fpdf2."""
    t = t.replace("**", "\x00")           # protège le gras
    t = re.sub(r"(?<!\w)\*(\S(?:.*?\S)?)\*(?!\w)", r"__\1__", t)
    t = t.replace("\x00", "**")
    t = t.replace("`", "")
    return t


def inline_tags(t):
    """Retire les pastilles en incise et nettoie les espaces doubles."""
    t = t.replace("🟢 ", "").replace("🟡 ", "").replace("🔴 ", "")
    t = re.sub(r"\s{2,}", " ", t)
    return t


def split_source(t):
    """Isole la référence finale d'un paragraphe : '— 🟢 **Q** *an-Naml* 27:16.'"""
    m = re.search(r"\s*—\s*(🟢|🟡|🔴)?\s*\*\*([QSRL])\*\*\s*(.+?)\s*$", t)
    if not m:
        return t, None, None
    tag = m.group(1)
    letter = m.group(2)
    ref = strip_md(m.group(3)).strip()
    body = t[:m.start()].rstrip()
    body = re.sub(r"\s*—\s*$", "", body)
    return body, letter, (tag, ref)


def ar_ratio(t):
    ar = sum(1 for c in t if "\u0600" <= c <= "\u06FF")
    letters = sum(1 for c in t if c.isalpha())
    return ar / letters if letters else 0


class Book(FPDF):
    def __init__(self):
        super().__init__(unit="mm", format=(PW, PH), orientation="P")
        for k, f in [("", "EBGaramond-Regular"), ("I", "EBGaramond-Italic"),
                     ("B", "EBGaramond-Bold"), ("BI", "EBGaramond-SemiBold")]:
            self.add_font("Serif", k, os.path.join(FONTS, f + ".ttf"))
        for k, f in [("", "SourceSans-Regular"), ("B", "SourceSans-SemiBold")]:
            self.add_font("Sans", k, os.path.join(FONTS, f + ".ttf"))
        self.add_font("Ar", "", os.path.join(FONTS, "Amiri-Regular.ttf"))
        self.add_font("Ar", "B", os.path.join(FONTS, "Amiri-Bold.ttf"))
        self.set_text_shaping(True)
        self.set_fallback_fonts(["Ar"])
        self.set_margins(M_OUT, M_TOP, M_OUT)
        self.set_auto_page_break(True, M_BOT)
        self.set_title("Sulaymân, le Prophète-Roi — Le Coran, la Sunna et les légendes")
        self.set_author("[Auteur]")
        self.set_creator("Maquette générée — v1.0")
        self.running_chapter = ""
        self.running_part = ""
        self.no_header_pages = set()
        self.no_number_pages = set()
        self.entries = []
        self.in_front = True
        self.toc_map = {}

    # -- marges miroir
    def _mirror(self):
        if self.page_no() % 2 == 0:
            self.set_left_margin(M_IN);  self.set_right_margin(M_OUT)
        else:
            self.set_left_margin(M_OUT); self.set_right_margin(M_IN)

    def text_w(self):
        self._mirror()
        return PW - self.l_margin - self.r_margin

    def x_text(self):
        self._mirror()
        return self.l_margin

    # -- fond
    def paint_paper(self):
        self.set_fill_color(*PAPER)
        self.rect(0, 0, PW, PH, "F")

    # -- pied / tête
    def footer(self):
        if self.in_front:
            return
        _y = self.get_y()
        if self.page_no() in self.no_number_pages:
            return
        self._mirror()
        self.set_font("Serif", "", 8.6)
        self.set_text_color(*INK_2)
        y = PH - 12.0
        txt = str(self.page_no())
        self.set_xy(self.l_margin, y)
        self.cell(self.text_w(), 4, txt, align="C")
        self.set_y(_y)

    def header(self):
        self.paint_paper()
        _y = self.get_y()
        if self.in_front or self.page_no() in self.no_header_pages:
            return
        self._mirror()
        self.set_font("Sans", "", 6.9)
        self.set_text_color(*INK_2)
        self.set_char_spacing(0.28)
        y = 11.0
        if self.page_no() % 2 == 0:
            t = self.running_part or "Sulaymân, le Prophète-Roi"
            self.set_xy(self.l_margin, y)
            self.cell(self.text_w(), 4, t.upper(), align="L")
        else:
            t = self.running_chapter or "Sulaymân, le Prophète-Roi"
            self.set_xy(self.l_margin, y)
            self.cell(self.text_w(), 4, t.upper(), align="R")
        self.set_char_spacing(0)
        self.set_y(_y)

    # -- ornements
    def rule(self, y=None, w=None, color=RULE, lw=0.25):
        if y is None:
            y = self.get_y()
        if w is None:
            w = self.text_w()
        self.set_draw_color(*color)
        self.set_line_width(lw)
        self.line(self.x_text(), y, self.x_text() + w, y)

    def diamond(self, x, y, s=1.5, color=GOLD):
        self.set_fill_color(*color)
        self.set_draw_color(*color)
        pts = [(x, y - s), (x + s, y), (x, y + s), (x - s, y)]
        p0 = pts[0]
        for i in range(1, len(pts)):
            self.line(pts[i-1][0], pts[i-1][1], pts[i][0], pts[i][1])
        self.line(pts[-1][0], pts[-1][1], p0[0], p0[1])

    def dot(self, x, y, r=1.15, color=INK):
        self.set_fill_color(*color)
        self.ellipse(x - r, y - r, 2 * r, 2 * r, "F")

    # -- gestion des pages
    def new_page(self, recto=False, header=True, folio=True):
        nxt = self.page_no() + 1
        if recto and nxt % 2 == 0:
            self.no_header_pages.add(nxt)
            self.no_number_pages.add(nxt)
            self.add_page()
            nxt += 1
        if not header:
            self.no_header_pages.add(nxt)
        if not folio:
            self.no_number_pages.add(nxt)
        self.add_page()
        return nxt

    def new_recto(self):
        return self.new_page(recto=True)

    # -- titre courant
    def set_running(self, chapter=None, part=None):
        if chapter is not None:
            self.running_chapter = chapter
        if part is not None:
            self.running_part = part


# ---------------------------------------------------------------- parseur
def cut_note(txt):
    """Retire tout ce qui suit la note pour l'auteur."""
    for marker in ("# ⚠️ NOTE POUR L'AUTEUR", "## ⚠️ NOTE POUR L'AUTEUR",
                   "⚠️ NOTE POUR L'AUTEUR"):
        i = txt.find(marker)
        if i != -1:
            txt = txt[:i]
    # coupe aussi la double barre qui précède la note
    txt = re.sub(r"\n-{3,}\s*\n-{3,}\s*$", "\n", txt)
    return txt


def blocks(txt):
    """Découpe le markdown en blocs typés."""
    txt = cut_note(txt)
    lines = txt.replace("\r", "").split("\n")
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]
        s = ln.strip()

        if not s:
            i += 1; continue

        # séparateur
        if re.fullmatch(r"-{3,}|\*{3,}|_{3,}", s):
            i += 1; continue

        # titres
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            out.append(("h", len(m.group(1)), clean(m.group(2))))
            i += 1; continue

        # citation
        if s.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            out.append(("quote", clean(" ".join(buf))))
            continue

        # tableau
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|?[\s:|-]+\|", lines[i+1]):
            header = [c.strip() for c in s.strip("|").split("|")]
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            out.append(("table", header, rows))
            continue

        # liste
        if re.match(r"^[-*]\s+", s) or re.match(r"^\d+\.\s+", s):
            items = []
            while i < len(lines) and (re.match(r"^[-*]\s+", lines[i].strip()) or
                                      re.match(r"^\d+\.\s+", lines[i].strip())):
                st = lines[i].strip()
                ordered = bool(re.match(r"^\d+\.\s+", st))
                body = re.sub(r"^([-*]|\d+\.)\s+", "", st)
                items.append((ordered, body))
                i += 1
            out.append(("list", items))
            continue

        # paragraphe
        buf = [s]
        i += 1
        while i < len(lines):
            n = lines[i].strip()
            if (not n or n.startswith(">") or n.startswith("#") or
                n.startswith("|") or re.fullmatch(r"-{3,}", n) or
                re.match(r"^[-*]\s+", n) or re.match(r"^\d+\.\s+", n)):
                break
            buf.append(n); i += 1
        out.append(("p", clean(" ".join(buf))))
    return out


# ---------------------------------------------------------------- rendu
class Builder:
    def __init__(self, toc_entries=None):
        self.b = Book()
        self.toc_entries = toc_entries or {}
        self.collected = []

    # ---------- primitives
    def para(self, text, size=BODY, style="", align="J", lead=None,
             first_indent=0.0, space_after=2.2, color=INK, font="Serif",
             allow_ref=True):
        b = self.b
        lead = lead or (size * 0.58)
        tag_letter = None
        if allow_ref:
            body, letter, ref = split_source(text)
            if letter:
                text, tag_letter, refdata = body, letter, ref
                tag_emoji, ref_txt = refdata
        b._mirror()
        b.set_font(font, style)
        b.set_text_color(*color)
        b.set_font_size(size)
        x0 = b.x_text()
        if first_indent:
            b.set_x(x0 + first_indent)
        b.multi_cell(b.text_w() - first_indent, lead, inline_tags(md(text)),
                     align=align, markdown=True, new_x="LMARGIN", new_y="NEXT")
        if tag_letter:
            b.ln(0.3)
            col = TAGS.get(tag_emoji, INK_2)
            label = f"{tag_letter} · {strip_md(ref_txt)}"
            b.set_font("Sans", "", 7.4)
            b.set_char_spacing(0.12)
            b.set_char_spacing(0.18)
            b.dot(x0 + 1.0, b.get_y() + 2.0, 1.0, col)
            b.set_xy(x0 + 3.2, b.get_y())
            b.set_text_color(*INK_2)
            b.multi_cell(b.text_w() - 3.2, 4.0, label, align="L",
                         new_x="LMARGIN", new_y="NEXT")
            b.set_char_spacing(0)
        b.ln(space_after)

    def quote(self, text):
        b = self.b
        # sépare la source (« — 🟢 Q *ref* »)
        body, src, tag = text, None, None
        m = re.search(r"—\s*(🟢|🟡|🔴)?\s*\*\*(Q|S|R|L)\*\*\s*(.*)$", body)
        if m:
            tag = m.group(1)
            letter = m.group(2)
            src = clean(f"{letter} · {strip_md(m.group(3))}")
            body = body[:m.start()].strip().rstrip("—").strip()
        body = strip_md(body).strip()

        is_ar = ar_ratio(body) > 0.5
        b._mirror()
        x0 = b.x_text()
        w = b.text_w()
        pad = 5.0
        y_top = b.get_y()

        # filet vertical
        b.set_draw_color(*GOLD)
        b.set_line_width(0.5)

        if is_ar:
            b.set_font("Ar", "", 14.5)
            b.set_text_color(*INK)
            b.set_xy(x0 + pad, y_top + 0.8)
            b.multi_cell(w - 2 * pad, 9.6, body, align="C",
                         new_x="LMARGIN", new_y="NEXT")
            y_end = b.get_y()
            b.line(x0, y_top, x0, y_end - 1.0)
        else:
            b.set_font("Serif", "I", BODY + 0.35)
            b.set_text_color(*INK)
            b.set_xy(x0 + pad, y_top)
            b.multi_cell(w - 2 * pad, LEAD + 0.45, inline_tags(md(body)), align="J",
                         markdown=True, new_x="LMARGIN", new_y="NEXT")
            y_end = b.get_y()
            b.line(x0, y_top, x0, y_end - 1.2)

        if src:
            b.ln(0.6)
            b.set_font("Sans", "", 7.2)
            b.set_char_spacing(0.2)
            col = TAGS.get(tag, INK_2)
            label = src
            b.set_xy(x0 + pad, b.get_y())
            tw = b.get_string_width(label)
            b.dot(x0 + pad + 1.0, b.get_y() + 2.1, 1.05, col)
            b.set_xy(x0 + pad + 3.2, b.get_y())
            b.set_text_color(*INK_2)
            b.cell(tw + 1, 4.2, label)
            b.set_char_spacing(0)
            b.ln(4.2)
        b.ln(3.2)

    def table(self, header, rows):
        b = self.b
        b._mirror()
        x0 = b.x_text()
        w = b.text_w()
        n = len(header)
        if n == 0:
            return
        narrow = n >= 4
        fs = 8.0 if narrow else 8.8
        cols = [w / n] * n
        if n == 2:
            cols = [w * 0.42, w * 0.58]

        def draw_head():
            y = b.get_y()
            b.set_font("Sans", "B", fs - 0.4)
            b.set_text_color(*ACCENT)
            hh = 0
            for j, cell in enumerate(header):
                b.set_xy(x0 + sum(cols[:j]) + 1.0, y + 1.2)
                b.multi_cell(cols[j] - 2.0, fs * 0.52, strip_md(md(cell)), align="L",
                             new_x="LMARGIN", new_y="NEXT")
                hh = max(hh, b.get_y() - y)
            b.set_xy(x0, y)
            b.set_y(y + hh + 1.6)
            b.set_draw_color(*GOLD)
            b.set_line_width(0.4)
            b.line(x0, b.get_y(), x0 + w, b.get_y())
            b.ln(1.8)

        draw_head()

        for k, row in enumerate(rows):
            y = b.get_y()
            if y > PH - M_BOT - 16:
                b.add_page()
                b.ln(2.0)
                draw_head()
                y = b.get_y()
            hrow = 0
            b.set_font("Serif", "", fs)
            b.set_text_color(*INK)
            for j, cell in enumerate(row[:n]):
                b.set_xy(x0 + sum(cols[:j]) + 1.0, y)
                b.multi_cell(cols[j] - 2.0, fs * 0.56, strip_md(md(cell)), align="L",
                             new_x="LMARGIN", new_y="NEXT")
                hrow = max(hrow, b.get_y() - y)
            b.set_xy(x0, y)
            b.set_y(y + hrow + 1.0)
            if k < len(rows) - 1:
                b.set_draw_color(*RULE)
                b.set_line_width(0.15)
                b.line(x0, b.get_y(), x0 + w, b.get_y())
                b.ln(1.0)
        b.ln(3.4)

    def bullet_list(self, items):
        b = self.b
        n = 0
        for ordered, body in items:
            body = re.sub(r"^(\d+)\.\s*", "", body)
            b._mirror()
            x0 = b.x_text()
            w = b.text_w()
            if ordered:
                n += 1
                marker = f"{n}."
                mw = 6.0
            else:
                marker = "–"
                mw = 4.4
            b.set_font("Serif", "", BODY)
            b.set_text_color(*INK)
            b.set_xy(x0 + 1.0, b.get_y())
            b.cell(mw - 0.6, LEAD, marker, align="L")
            b.set_xy(x0 + mw, b.get_y())
            b.multi_cell(w - mw, LEAD, inline_tags(md(body)), align="J", markdown=True,
                         new_x="LMARGIN", new_y="NEXT")
            b.ln(1.4)
        b.ln(2.0)

    # ---------- titres
    def h_section(self, level, text):
        b = self.b
        tag = None
        for e, c in TAGS.items():
            if text.startswith(e):
                tag = c; text = text[len(e):].strip()
        text = clean(text)
        if not text:
            return

        if level == 2:
            b.ln(4.0)
            need = 22
            if b.get_y() > PH - M_BOT - need:
                b.add_page()
            y = b.get_y()
            if tag:
                b.dot(b.x_text() + 1.1, y + 2.4, 1.25, tag)
            b.set_xy(b.x_text() + (3.6 if tag else 0), y)
            b.set_font("Serif", "BI", 12.6)
            b.set_text_color(*ACCENT)
            b.multi_cell(b.text_w() - (3.6 if tag else 0), 6.4,
                         strip_md(md(text)), align="L",
                         new_x="LMARGIN", new_y="NEXT")
            b.ln(2.4)
        elif level == 3:
            b.ln(3.0)
            y = b.get_y()
            if tag:
                b.dot(b.x_text() + 1.1, y + 2.2, 1.1, tag)
            b.set_xy(b.x_text() + (3.4 if tag else 0), y)
            b.set_font("Sans", "B", 8.6)
            b.set_text_color(*INK)
            b.set_char_spacing(0.22)
            b.multi_cell(b.text_w() - (3.4 if tag else 0), 5.2,
                         strip_md(md(text)).upper(), align="L",
                         new_x="LMARGIN", new_y="NEXT")
            b.set_char_spacing(0)
            b.ln(2.0)
        else:
            b.ln(2.6)
            self.para(strip_md(text), size=BODY + 0.6, style="I", align="L",
                      space_after=2.6)

    def chapter_open(self, text):
        b = self.b
        m0 = re.match(r"^Chapitre\s+(\d+)\s*—\s*(.*)$", strip_md(text))
        title0 = m0.group(2) if m0 else strip_md(text)
        b.set_running(chapter=title0)
        b.new_page(recto=True, header=False, folio=False)
        y = 63.0
        b.set_xy(b.x_text(), y)
        b.set_font("Sans", "", 7.6)
        b.set_text_color(*GOLD)
        b.set_char_spacing(0.55)
        b.cell(b.text_w(), 4, "CHAPITRE", align="C")
        b.set_char_spacing(0)
        b.set_y(y + 7.0)

        m = re.match(r"^Chapitre\s+(\d+)\s*—\s*(.*)$", strip_md(text))
        num, title = (m.group(1), m.group(2)) if m else ("", strip_md(text))
        if num:
            b.set_font("Serif", "", 30)
            b.set_text_color(*GOLD)
            b.cell(b.text_w(), 13, num, align="C")
            b.ln(13)
            b.ln(3.0)

        b.set_font("Serif", "BI", 17.5)
        b.set_text_color(*INK)
        self.mc(b.text_w(), 9.4, title, align="C",
                     new_x="LMARGIN", new_y="NEXT")
        b.ln(5.0)
        cx = PW / 2
        b.set_draw_color(*GOLD); b.set_line_width(0.4)
        b.line(cx - 13, b.get_y(), cx - 3.4, b.get_y())
        b.line(cx + 3.4, b.get_y(), cx + 13, b.get_y())
        self.b.diamond(cx, b.get_y(), 1.5, GOLD)
        b.ln(11.0)
        self.collected.append((1, f"{num + '. ' if num else ''}{title}", b.page_no()))

    ROMAN = {1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI"}
    PART_ORDER = {"première":1,"deuxième":2,"troisième":3,"quatrième":4}

    def part_num(self, label):
        for k,v in self.PART_ORDER.items():
            if label.strip().lower().startswith(k):
                return self.ROMAN[v]
        return ""

    def part_open(self, text):
        b = self.b
        b.set_running(chapter="", part=strip_md(text))
        b.new_page(recto=True, header=False, folio=False)
        num, title = "", strip_md(text)
        m = re.match(r"^(.*?)\s*—\s*(.*)$", title)
        if m:
            num, title = m.group(1), m.group(2)
        rn = self.part_num(num)
        top = 74
        b.set_y(top)
        b.set_font("Sans", "", 7.2); b.set_text_color(*GOLD); b.set_char_spacing(1.1)
        b.cell(b.text_w(), 4, "PARTIE", align="C")
        b.set_char_spacing(0)
        b.ln(9)
        b.set_font("Serif", "", 54); b.set_text_color(*ACCENT)
        b.cell(b.text_w(), 22, rn, align="C")
        b.ln(27)
        b.set_font("Serif", "BI", 19); b.set_text_color(*INK)
        b.multi_cell(b.text_w() - 20, 9.5, title, align="C",
                     new_x="LMARGIN", new_y="NEXT")
        b.ln(6)
        yy = b.get_y()
        b.set_draw_color(*GOLD); b.set_line_width(0.5)
        b.line(b.w / 2 - 17, yy, b.w / 2 - 3.4, yy)
        b.line(b.w / 2 + 3.4, yy, b.w / 2 + 17, yy)
        b.diamond(b.w / 2, yy, 1.5, GOLD)
        b.ln(10)
        b.set_font("Sans", "", 7.2); b.set_text_color(*INK_2); b.set_char_spacing(0.8)
        b.cell(b.text_w(), 4, self.part_chapters(rn), align="C")
        b.set_char_spacing(0)
        self.collected.append((0, f"{rn} · {title}", b.page_no()))

    def part_chapters(self, rn):
        spans = {"I": "CHAPITRES 1 – 3", "II": "CHAPITRES 4 – 7",
                 "III": "CHAPITRES 8 – 10", "IV": "CHAPITRES 11 – 12"}
        return spans.get(rn, "")

    def chapter_open(self, text):
        b = self.b
        m0 = re.match(r"^Chapitre\s+(\d+)\s*—\s*(.*)$", strip_md(text))
        title0 = m0.group(2) if m0 else strip_md(text)
        b.set_running(chapter=title0)
        b.new_page(recto=True, header=False, folio=False)
        y = 63.0
        b.set_xy(b.x_text(), y)
        b.set_font("Sans", "", 7.6)
        b.set_text_color(*GOLD)
        b.set_char_spacing(0.55)
        b.cell(b.text_w(), 4, "CHAPITRE", align="C")
        b.set_char_spacing(0)
        b.set_y(y + 7.0)

        m = re.match(r"^Chapitre\s+(\d+)\s*—\s*(.*)$", strip_md(text))
        num, title = (m.group(1), m.group(2)) if m else ("", strip_md(text))
        if num:
            b.set_font("Serif", "", 30)
            b.set_text_color(*GOLD)
            b.cell(b.text_w(), 13, num, align="C")
            b.ln(13)
            b.ln(3.0)

        b.set_font("Serif", "BI", 17.5)
        b.set_text_color(*INK)
        self.mc(b.text_w(), 9.4, title, align="C",
                     new_x="LMARGIN", new_y="NEXT")
        b.ln(5.0)
        cx = PW / 2
        b.set_draw_color(*GOLD); b.set_line_width(0.4)
        b.line(cx - 13, b.get_y(), cx - 3.4, b.get_y())
        b.line(cx + 3.4, b.get_y(), cx + 13, b.get_y())
        self.b.diamond(cx, b.get_y(), 1.5, GOLD)
        b.ln(11.0)
        self.collected.append((1, f"{num + '. ' if num else ''}{title}", b.page_no()))

    ROMAN = {1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI"}
    PART_ORDER = {"première":1,"deuxième":2,"troisième":3,"quatrième":4}

    def part_num(self, label):
        for k,v in self.PART_ORDER.items():
            if label.strip().lower().startswith(k):
                return self.ROMAN[v]
        return ""

    def annexe_open(self, text):
        b = self.b
        t0 = strip_md(text).replace("Annexe", "").strip()
        m0 = re.match(r"^(\d+)\s*—\s*(.*)$", t0)
        b.set_running(chapter=("Annexe " + m0.group(1) + " — " + m0.group(2)) if m0 else t0,
                      part="Annexes")
        b.new_page(recto=True, header=False, folio=False)
        b.set_xy(b.x_text(), 80.0)
        b.set_font("Sans", "", 7.6)
        b.set_text_color(*GOLD)
        b.set_char_spacing(0.6)
        b.cell(b.text_w(), 4, "ANNEXES", align="C")
        b.set_char_spacing(0)
        b.set_y(89.0)
        title = strip_md(text).replace("Annexe", "").strip()
        m = re.match(r"^(\d+)\s*—\s*(.*)$", title)
        if m:
            b.set_font("Serif", "", 30)
            b.set_text_color(*GOLD)
            b.cell(b.text_w(), 13, m.group(1), align="C")
            b.ln(15)
            title = m.group(2)
        b.set_font("Serif", "BI", 16)
        b.set_text_color(*INK)
        self.mc(b.text_w(), 8.6, title, align="C", new_x="LMARGIN", new_y="NEXT")
        b.ln(8)
        if m0:
            if m0.group(1) == "1":
                self.collected.append((0, "Annexes", b.page_no()))
            self.collected.append((1, f"Annexe {m0.group(1)} — {m0.group(2)}", b.page_no()))

    # ---------- markdown complet
    def render_md(self, path):
        b = self.b
        txt = open(path, encoding="utf-8").read()
        # supprime l'en-tête de fichier (titre du livre, sous-titre, accroche)
        m = re.search(r"^#\s+(Chapitre\s+\d+|Partie|Annexes?|Annexe\s+\d+)", txt, re.M)
        if m and txt.find("# Sulaym") != -1:
            txt = txt[m.start():]
        bl = blocks(txt)
        started = False
        for blk in bl:
            kind = blk[0]
            if kind == "h":
                lvl, t = blk[1], blk[2]
                if lvl == 1:
                    st = strip_md(t)
                    if st.lower().startswith("chapitre"):
                        self.chapter_open(st); started = True; continue
                    if st.lower().startswith("partie"):
                        self.part_open(st); continue
                    if re.match(r"^Annexes?$", st, re.I):
                        continue
                    # titre générique (front matter des fichiers)
                    continue
                if lvl == 2 and re.match(r"^Annexe\s+\d+", strip_md(t)):
                    self.annexe_open(t); continue
                self.h_section(lvl, t)
            elif kind == "p":
                t = blk[1]
                self.para(t)
            elif kind == "quote":
                self.quote(blk[1])
            elif kind == "table":
                self.table(blk[1], blk[2])
            elif kind == "list":
                self.bullet_list(blk[1])

    def mc(self, w, h, txt, **kw):
        """multi_cell qui repart toujours du bord de texte."""
        b = self.b
        b._mirror()
        b.set_x(b.x_text())
        kw.setdefault("new_x", "LMARGIN")
        kw.setdefault("new_y", "NEXT")
        b.multi_cell(w, h, txt, **kw)

    # ---------- pages liminaires
    def cover(self):
        b = self.b
        b.in_front = True
        b.add_page()
        # fond
        b.set_fill_color(24, 42, 54)
        b.rect(0, 0, PW, PH, "F")
        # liseré
        b.set_draw_color(*GOLD); b.set_line_width(0.4)
        b.rect(9, 9, PW - 18, PH - 18, "D")

        b.set_xy(18, 30)
        b.set_font("Sans", "", 7.2); b.set_text_color(*GOLD); b.set_char_spacing(0.8)
        b.cell(PW - 36, 4, "LES PROPHÈTES · SOURCES ET LÉGENDES", align="C")
        b.set_char_spacing(0)

        b.set_xy(18, 44)
        b.set_font("Ar", "", 20); b.set_text_color(212, 188, 138)
        self.mc(PW - 36, 12, "سليمان النبيُّ الملك", align="C")

        b.set_y(72)
        b.set_font("Serif", "BI", 33); b.set_text_color(247, 243, 234)
        self.mc(PW - 36, 15, "Sulaymân", align="C")
        b.set_font("Serif", "", 21); b.set_text_color(247, 243, 234)
        self.mc(PW - 36, 11, "le Prophète-Roi", align="C")

        b.ln(7)
        cx = PW / 2
        b.set_draw_color(*GOLD); b.set_line_width(0.5)
        b.line(cx - 20, b.get_y(), cx - 4, b.get_y())
        b.line(cx + 4, b.get_y(), cx + 20, b.get_y())
        b.diamond(cx, b.get_y(), 1.7, GOLD)

        b.ln(7)
        b.set_font("Serif", "I", 13.5); b.set_text_color(222, 214, 198)
        self.mc(PW - 40, 8, "Le Coran, la Sunna et les légendes", align="C")

        b.ln(3)
        b.set_font("Sans", "", 7.4); b.set_text_color(190, 176, 150)
        b.set_char_spacing(0.42)
        self.mc(PW - 40, 5, "CE QUI EST RÉVÉLÉ · CE QUI EST RAPPORTÉ · CE QUI EST INVENTÉ", align="C")
        b.set_char_spacing(0)

        b.set_y(PH - 42)
        b.set_font("Serif", "", 13); b.set_text_color(240, 235, 224)
        b.cell(PW - 36, 6, "[AUTEUR]", align="C")
        b.set_y(PH - 30)
        b.set_font("Sans", "", 7.0); b.set_text_color(170, 158, 136)
        b.set_char_spacing(0.5)
        b.cell(PW - 36, 4, "TOME 1", align="C")
        b.set_char_spacing(0)

    def half_title(self):
        b = self.b
        b.add_page()
        b.set_y(78)
        b.set_font("Serif", "", 16); b.set_text_color(*INK)
        b.cell(b.text_w(), 8, "Sulaymân, le Prophète-Roi", align="C")

    def title_page(self):
        b = self.b
        b.add_page()
        b.set_y(50)
        b.set_font("Sans", "", 7.2); b.set_text_color(*GOLD); b.set_char_spacing(0.7)
        b.cell(b.text_w(), 4, "LES PROPHÈTES · SOURCES ET LÉGENDES", align="C")
        b.set_char_spacing(0)
        b.set_y(62)
        b.set_font("Serif", "BI", 25); b.set_text_color(*INK)
        self.mc(b.text_w(), 11.5, "Sulaymân", align="C")
        b.set_font("Serif", "", 17)
        self.mc(b.text_w(), 9, "le Prophète-Roi", align="C")
        b.ln(4)
        b.set_font("Serif", "I", 12); b.set_text_color(*INK_2)
        self.mc(b.text_w(), 7, "Le Coran, la Sunna et les légendes", align="C")
        b.ln(3)
        b.set_font("Sans", "", 7.0); b.set_text_color(*INK_2); b.set_char_spacing(0.35)
        self.mc(b.text_w(), 4.6, "CE QUI EST RÉVÉLÉ · CE QUI EST RAPPORTÉ · CE QUI EST INVENTÉ", align="C")
        b.set_char_spacing(0)
        b.ln(16)
        cx = PW / 2
        b.set_draw_color(*GOLD); b.set_line_width(0.4)
        b.line(cx - 15, b.get_y(), cx - 3.4, b.get_y())
        b.line(cx + 3.4, b.get_y(), cx + 15, b.get_y())
        b.diamond(cx, b.get_y(), 1.5, GOLD)
        b.ln(16)
        b.set_font("Serif", "", 13)
        b.cell(b.text_w(), 7, "[AUTEUR]", align="C")
        b.set_y(PH - 42)
        b.set_font("Sans", "", 7.2); b.set_text_color(*INK_2); b.set_char_spacing(0.4)
        b.cell(b.text_w(), 4, "TOME 1", align="C")
        b.set_char_spacing(0)
        b.set_y(PH - 34)
        b.set_font("Serif", "", 10.5)
        b.cell(b.text_w(), 5, "[ÉDITION]", align="C")

    def legend_page(self):
        b = self.b
        b.add_page()
        b.set_y(46)
        b.set_font("Sans", "", 7.4); b.set_text_color(*GOLD); b.set_char_spacing(0.7)
        b.cell(b.text_w(), 4, "MODE DE LECTURE", align="C")
        b.set_char_spacing(0)
        b.ln(4)
        b.set_font("Serif", "BI", 17); b.set_text_color(*INK)
        b.cell(b.text_w(), 9, "Les quatre étiquettes", align="C")
        b.ln(13)
        b.set_font("Serif", "", 10.4); b.set_text_color(*INK)
        self.mc(b.text_w(), 6.1,
            "Dans tout ce livre, chaque information porte une étiquette. "
            "Elle vous dit, à chaque ligne, ce que vous êtes en train de lire.",
            align="J", new_x="LMARGIN", new_y="NEXT")
        b.ln(7)

        items = [
            (GREEN, "Q", "VERSET CORANIQUE",
             "L'information vient du Coran. La référence complète est donnée : sourate et verset."),
            (GREEN, "S", "HADITH AUTHENTIFIÉ",
             "L'information vient d'un hadith rapporté dans les deux recueils les plus sûrs, "
             "ou dont l'authenticité a été établie. Le recueil et le chapitre sont cités."),
            (AMBER, "R", "RÉCIT RAPPORTÉ",
             "L'information vient d'un exégète classique ou d'une tradition ancienne dont "
             "l'authenticité n'est pas établie. Elle est présentée comme rapportée, jamais comme révélée."),
            (RED, "L", "LÉGENDE",
             "L'information n'a aucune base dans le Coran ni dans la Sunna authentique. "
             "Elle est citée pour être identifiée et mise en garde — jamais pour être crue."),
        ]
        for col, letter, title, desc in items:
            y = b.get_y()
            b.set_draw_color(*RULE); b.set_line_width(0.2)
            b.line(b.x_text(), y, b.x_text() + b.text_w(), y)
            b.ln(3.4)
            b.dot(b.x_text() + 1.2, b.get_y() + 3.0, 1.5, col)
            b.set_xy(b.x_text() + 5.0, b.get_y())
            b.set_font("Serif", "B", 14); b.set_text_color(*INK)
            b.cell(7, 6, letter)
            b.set_font("Sans", "B", 7.6); b.set_text_color(*INK_2)
            b.set_char_spacing(0.3)
            b.cell(0, 6, title)
            b.set_char_spacing(0)
            b.ln(6.6)
            b.set_x(b.x_text() + 5.0)
            b.set_font("Serif", "", 9.6); b.set_text_color(*INK)
            self.mc(b.text_w() - 5.0, 5.2, desc, align="L",
                         new_x="LMARGIN", new_y="NEXT")
            b.ln(3.4)
        b.set_draw_color(*RULE); b.set_line_width(0.2)
        b.line(b.x_text(), b.get_y(), b.x_text() + b.text_w(), b.get_y())

    def colophon(self):
        b = self.b
        b.add_page()
        b.set_y(112)
        b.set_font("Serif", "BI", 9.4); b.set_text_color(*INK)
        b.cell(b.text_w(), 5, "Sulaymân, le Prophète-Roi", align="L")
        b.ln(5)
        b.set_font("Serif", "", 8.4); b.set_text_color(*INK_2)
        self.mc(b.text_w(), 4.6,
                     "Le Coran, la Sunna et les légendes — Tome 1 de la collection "
                     "« Les Prophètes, sources et légendes ».", align="L",
                     new_x="LMARGIN", new_y="NEXT")
        b.ln(4)
        lines = [
            "© [année] [Auteur]. Tous droits réservés.",
            "",
            "Édition : [ÉDITION]",
            "Maquette et composition : [à compléter]",
            "ISBN : [à compléter]",
            "",
            "Traduction du Coran : traduction de l'auteur, établie depuis l'arabe.",
            "Aucune traduction française protégée n'a été reproduite.",
            "",
            "Aucune représentation figurée. Chaque hadith est référencé. "
            "Chaque verset a été recopié du mushaf.",
            "",
            "Manuscrit relu et validé par [nom, fonction, institution].",
            "",
            "Collection « Les Prophètes, sources et légendes » — volume 1.",
        ]
        for l in lines:
            if l == "":
                b.ln(2.4)
            else:
                b.set_font("Serif", "", 8.2)
                self.mc(b.text_w(), 4.4, l, align="L", new_x="LMARGIN", new_y="NEXT")

    def toc(self, entries):
        b = self.b
        b.new_page(recto=True, header=False)
        b.set_y(46)
        b.set_font("Sans", "", 7.6); b.set_text_color(*GOLD); b.set_char_spacing(0.7)
        b.cell(b.text_w(), 4, "SOMMAIRE", align="C")
        b.set_char_spacing(0)
        b.ln(4)
        b.set_font("Serif", "BI", 18); b.set_text_color(*INK)
        b.cell(b.text_w(), 10, "Sommaire", align="C")
        b.ln(15)

        for lvl, title, page in entries:
            if b.get_y() > PH - M_BOT - 12:
                b.new_page(header=False)
                b.ln(6)
            y = b.get_y()
            if lvl == 0:
                b.ln(2.6)
                b.set_font("Sans", "B", 7.4)
                b.set_text_color(*ACCENT)
                b.set_char_spacing(0.4)
                label = title.upper()
                b.set_xy(b.x_text(), y)
                b.cell(b.text_w() - 8, 4.6, label, align="L")
                b.set_char_spacing(0)
                b.ln(5.0)
            else:
                b.set_font("Serif", "", 10.4)
                b.set_text_color(*INK)
                b.set_xy(b.x_text() + 4, y)
                tw = b.get_string_width(title)
                b.cell(b.text_w() - 12, 5.2, title, align="L")
                b.set_font("Serif", "", 9.6)
                b.set_text_color(*INK_2)
                b.set_xy(PW - b.r_margin - 8, y)
                b.cell(8, 5.2, str(page), align="R")
                # points de conduite
                b.set_draw_color(*RULE); b.set_line_width(0.15)
                b.set_dash_pattern(dash=0.4, gap=1.1)
                b.line(b.x_text() + 6 + tw + 1.5, y + 3.3,
                       PW - b.r_margin - 9.5, y + 3.3)
                b.set_dash_pattern()
                b.ln(5.4)

    def back_cover(self):
        b = self.b
        b.new_page(header=False, folio=False)
        b.set_auto_page_break(False)
        # fond bleu nuit
        b.set_fill_color(*DARK); b.rect(0, 0, b.w, b.h, "F")
        b.set_draw_color(*GOLD); b.set_line_width(0.6)
        b.rect(9, 9, b.w - 18, b.h - 18)
        b.set_draw_color(70, 92, 104); b.set_line_width(0.2)
        b.rect(11.2, 11.2, b.w - 22.4, b.h - 22.4)

        b.set_font("Serif", "BI", 13.4); b.set_text_color(*CREAM)
        y = 34
        b.set_y(y); b.set_x(22)
        b.multi_cell(b.w - 44, 7.6,
            "Tapez « Salomon » et vous trouverez l'anneau.",
            align="L", new_x="LMARGIN", new_y="NEXT")
        b.ln(7)

        paras = [
            "Le sceau gravé qui commande aux esprits. Les talismans. Les vidéos sur les "
            "trésors enfouis. Un prophète transformé en sorcier, et son histoire devenue "
            "un marché.",
            "Le Coran, lui, ne parle pas de l'anneau. Il ne nomme jamais la reine de Saba. "
            "Il ne dit pas que Sulaymân comprenait le langage de tous les animaux, ni qu'un "
            "démon prit sa place sur le trône.",
            "Ce livre reprend les versets consacrés à Sulaymân, un par un, et il fait une "
            "chose simple : il distingue.",
            "Ce qui vient du Coran. Ce qui vient de la Sunna authentique. Ce qui vient des "
            "exégètes. Et ce que quinze siècles de conteurs ont inventé.",
        ]
        b.set_font("Serif", "", 9.9); b.set_text_color(*CREAM_BODY)
        for t in paras:
            b.set_x(22)
            b.multi_cell(b.w - 44, 6.0, t, align="J", new_x="LMARGIN", new_y="NEXT")
            b.ln(3.6)

        b.ln(6)
        b.set_draw_color(*GOLD); b.set_line_width(0.4)
        b.line(22, b.get_y(), b.w - 22, b.get_y())
        b.ln(7)
        b.set_font("Serif", "BI", 13.2); b.set_text_color(*CREAM)
        b.set_x(22)
        b.multi_cell(b.w - 44, 8.0, "Les légendes naissent là où le texte s'arrête.",
                     align="C", new_x="LMARGIN", new_y="NEXT")

        # emplacement du code-barres ISBN
        bx, by, bw2, bh2 = b.w - 48, b.h - 44, 26, 14
        b.set_fill_color(250, 249, 245); b.rect(bx, by, bw2, bh2, "F")
        b.set_font("Sans", "", 5.2); b.set_text_color(130, 130, 130)
        b.set_xy(bx, by + bh2 / 2 - 1.2)
        b.cell(bw2, 2.6, "ISBN", align="C")

        # mentions techniques
        b.set_y(b.h - 54)
        b.set_font("Sans", "", 6.2); b.set_text_color(*GOLD); b.set_char_spacing(0.42)
        b.set_x(22)
        b.multi_cell(b.w - 44, 4.4,
                     "AUCUNE REPRÉSENTATION FIGURÉE\n"
                     "CHAQUE HADITH RÉFÉRENCÉ  ·  CHAQUE VERSET RECOPIÉ DU MUSHAF",
                     align="L", new_x="LMARGIN", new_y="NEXT")
        b.set_char_spacing(0)

        b.set_font("Sans", "", 6.4); b.set_text_color(*GOLD); b.set_char_spacing(0.5)
        b.set_y(b.h - 24); b.set_x(22)
        b.cell(b.w - 44, 4, "LES PROPHÈTES · SOURCES ET LÉGENDES  —  TOME 1", align="L")
        b.set_char_spacing(0)

    def final_page(self):
        b = self.b
        b.new_page(recto=True, header=False, folio=False)
        b.set_y(84)
        cx = PW / 2
        b.set_draw_color(*GOLD); b.set_line_width(0.4)
        b.line(cx - 14, b.get_y(), cx - 3.4, b.get_y())
        b.line(cx + 3.4, b.get_y(), cx + 14, b.get_y())
        b.diamond(cx, b.get_y(), 1.5, GOLD)
        b.ln(14)
        b.set_font("Serif", "I", 12.6); b.set_text_color(*INK)
        self.mc(b.text_w() - 16, 7.4, "Les légendes naissent là où le texte s'arrête.",
                     align="C", new_x="LMARGIN", new_y="NEXT")
        b.ln(10)
        b.set_font("Sans", "", 7.2); b.set_text_color(*INK_2); b.set_char_spacing(0.5)
        self.mc(b.text_w() - 16, 5, "COLLECTION « LES PROPHÈTES, SOURCES ET LÉGENDES »\nTOME 1 · SULAYMÂN", align="C")
        b.set_char_spacing(0)


FILES = [
    ("part", "Première partie — Le cadre"),
    "CHAPITRE_01_Pourquoi_ce_livre.md",
    "CHAPITRE_02_Les_quatre_dons.md",
    "CHAPITRE_03_Le_jugement_et_les_deux_hommes.md",
    ("part", "Deuxième partie — Le royaume"),
    "CHAPITRE_04_Les_armees_et_les_oiseaux.md",
    "CHAPITRE_05_La_huppe_et_Saba.md",
    "CHAPITRE_06_La_lettre_et_le_conseil.md",
    "CHAPITRE_07_Le_trone_et_le_savoir.md",
    ("part", "Troisième partie — La chute et la mort"),
    "CHAPITRE_08_Le_palais_de_cristal.md",
    "CHAPITRE_09_Les_jinn_le_mihrab_et_la_gratitude.md",
    "CHAPITRE_10_Le_baton_et_la_mort.md",
    ("part", "Quatrième partie — Le tri"),
    "CHAPITRE_11_La_magie_et_le_faux_proces.md",
    "CHAPITRE_12_Les_legendes_une_par_une.md",
]


def build(entries=None, out="LIVRE_Sulayman_v1.pdf"):
    bld = Builder()
    b = bld.b
    bld.cover()
    bld.half_title()
    bld.title_page()
    bld.legend_page()
    bld.colophon()

    # pages réservées pour le sommaire
    b.in_front = False
    bld.toc(entries or [])
    b.in_front = True

    b.in_front = False
    for item in FILES:
        if isinstance(item, tuple):
            bld.part_open(item[1])
        else:
            bld.render_md(os.path.join(ROOT, item))

    # annexes
    for n, f in enumerate(["ANNEXES.md"]):
        bld.render_md(os.path.join(ROOT, f))

    bld.final_page()
    bld.back_cover()
    b.output(os.path.join(os.path.dirname(os.path.abspath(__file__)), out))
    return bld.collected, b.page_no()


def add_bookmarks(pdf_path, entries):
    import pymupdf
    d = pymupdf.open(pdf_path)
    toc = [[1, "Couverture", 1], [1, "Page de titre", 3]]
    for lvl, title, page in entries:
        if lvl == 0:
            toc.append([1, title, page])
        else:
            toc.append([2, title, page])
    toc.append([1, "Annexes", next((p for l, t, p in entries if t.startswith("Annexe 1")), 129)])
    d.set_toc(toc)
    d.set_metadata({
        "title": "Sulaymân, le Prophète-Roi — Le Coran, la Sunna et les légendes",
        "author": "[Auteur]",
        "subject": "Collection Les Prophètes, sources et légendes — Tome 1",
        "keywords": "islam, prophètes, Sulaymân, Salomon, Coran, Sunna, isrâ'îliyyât, légendes",
        "creator": "Maquette v1.0",
        "producer": "fpdf2 + PyMuPDF",
    })
    d.saveIncr()
    d.close()


if __name__ == "__main__":
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    # passe 1
    e1, n1 = build(entries=None, out="_pass1.pdf")
    # passe 2 : sommaire paginé
    e2, n2 = build(entries=e1, out="LIVRE_Sulayman_v1.pdf")
    add_bookmarks(os.path.join(os.path.dirname(os.path.abspath(__file__)), "LIVRE_Sulayman_v1.pdf"), e2)
    print(f"pages={n2}  entrées sommaire={len(e2)}")
