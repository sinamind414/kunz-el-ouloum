#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ocr_pdf.py — OCR de manuels SVT arabes scannés via l'API Mistral OCR.

Adapté du repo Pythonation/Mistral-Arabic-OCR-test pour le projet Kunz El Ouloum.
Traite en lot des PDF scannés (livres) et produit un Markdown arabe propre,
page par page, avec reprise sur erreur, logs et retry automatique.

Usage:
    python ocr_pdf.py                 # traite tous les PDF du dossier input/
    python ocr_pdf.py --input mes_livres --output out

Structure produite:
    output/<nom_livre>/page_01.md
    output/<nom_livre>/page_02.md
    ...
    output/<nom_livre>/_complet.md    # concaténation de toutes les pages
"""

import argparse
import base64
import csv
import logging
import os
import sys
import time

from dotenv import load_dotenv
from mistralai import Mistral
from mistralai.models.sdkerror import SDKError

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INPUT = os.path.join(ROOT, "input")
DEFAULT_OUTPUT = os.path.join(ROOT, "output")
STATE_FILE = os.path.join(ROOT, "processed_files.csv")
LOG_FILE = os.path.join(ROOT, "ocr.log")
MODEL = "mistral-ocr-latest"
MAX_RETRIES = 4
RETRY_BASE_DELAY = 5  # secondes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("ocr")


def load_key() -> str:
    load_dotenv(os.path.join(ROOT, ".env"))
    key = os.environ.get("MISTRAL_API_KEY", "")
    if not key or key == "colle_ta_cle_ici":
        log.error(
            "MISTRAL_API_KEY manquante. Copie .env.example -> .env et ajoute ta clé "
            "(https://console.mistral.ai/api-keys)."
        )
        sys.exit(1)
    return key


def load_state() -> dict:
    state = {}
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                state[row["file"]] = row["status"]
    return state


def save_state(state: dict):
    with open(STATE_FILE, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["file", "status", "pages", "updated"])
        for k, v in state.items():
            w.writerow([k, v["status"], v.get("pages", ""), v.get("updated", "")])


def ocr_pdf(client: Mistral, path: str) -> list:
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.ocr.process(
                model=MODEL,
                document={"type": "pdf", "document_base64": b64},
                include_image_base64=False,
            )
            return resp.pages
        except SDKError as e:
            if attempt == MAX_RETRIES:
                raise
            delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
            log.warning("Erreur API (%s). Retry %d/%d dans %ds", e, attempt, MAX_RETRIES, delay)
            time.sleep(delay)
    return []


def write_lesson(book_dir: str, pages: list):
    os.makedirs(book_dir, exist_ok=True)
    full = []
    for i, page in enumerate(pages, start=1):
        md = page.markdown or ""
        full.append(md)
        fname = os.path.join(book_dir, f"page_{i:02d}.md")
        with open(fname, "w", encoding="utf-8") as f:
            f.write(f"<!-- source_page: {i} -->\n\n")
            f.write(md.strip() + "\n")
    with open(os.path.join(book_dir, "_complet.md"), "w", encoding="utf-8") as f:
        for i, md in enumerate(full, start=1):
            f.write(f"\n\n<!-- ===== PAGE {i} ===== -->\n\n")
            f.write(md.strip() + "\n")


def main():
    ap = argparse.ArgumentParser(description="OCR PDF SVT arabes -> Markdown")
    ap.add_argument("--input", default=DEFAULT_INPUT)
    ap.add_argument("--output", default=DEFAULT_OUTPUT)
    args = ap.parse_args()

    client = Mistral(api_key=load_key())
    state = load_state()
    os.makedirs(args.input, exist_ok=True)
    os.makedirs(args.output, exist_ok=True)

    pdfs = sorted(
        f for f in os.listdir(args.input)
        if f.lower().endswith(".pdf")
    )
    if not pdfs:
        log.warning("Aucun PDF dans %s. Dépose tes livres scannés ici.", args.input)
        return

    log.info("Démarrage OCR : %d PDF détecté(s) dans %s", len(pdfs), args.input)

    for pdf in pdfs:
        if state.get(pdf, {}).get("status") == "done":
            log.info("Déjà traité (skip) : %s", pdf)
            continue
        path = os.path.join(args.input, pdf)
        book_name = os.path.splitext(pdf)[0]
        book_dir = os.path.join(args.output, book_name)
        log.info("OCR en cours : %s", pdf)
        try:
            pages = ocr_pdf(client, path)
            write_lesson(book_dir, pages)
            state[pdf] = {"status": "done", "pages": len(pages), "updated": time.ctime()}
            save_state(state)
            log.info("Terminé : %s (%d pages) -> %s", pdf, len(pages), book_dir)
        except Exception as e:
            state[pdf] = {"status": "failed", "pages": "", "updated": time.ctime()}
            save_state(state)
            log.error("ÉCHEC sur %s : %s", pdf, e)

    log.info("Pipeline OCR terminé. Markdown dans %s", args.output)


if __name__ == "__main__":
    main()
