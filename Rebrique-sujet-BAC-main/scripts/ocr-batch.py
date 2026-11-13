#!/usr/bin/env python3
"""Pilote une série de reconstructions LOGIQUES (manifest-driven).

Lit subjects/manifest.json, sélectionne les sujets demandés et lance
scripts/ocr-logical-layer.py sur chacun (tolérant : un échec n'arrête
pas la série, mais le code de sortie final est non nul).

Usage (sur le runner CI) :
    python3 scripts/ocr-batch.py <outdir> --only SE:2013,2014,2025,2026
    python3 scripts/ocr-batch.py <outdir> --only M:2013-2019
    python3 scripts/ocr-batch.py <outdir> --only SE:2025 --dpi 450 --min-conf 15
"""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def parse_only(specs):
    """'M:2013-2019' / 'SE:2013,2014' -> {(track, year)} (year None = tous)."""
    wanted = set()
    for spec in specs:
        if ":" in spec:
            track, years = spec.split(":", 1)
            for part in years.split(","):
                part = part.strip()
                if "-" in part:
                    a, b = part.split("-", 1)
                    for y in range(int(a), int(b) + 1):
                        wanted.add((track.strip().upper(), y))
                elif part:
                    wanted.add((track.strip().upper(), int(part)))
        else:
            wanted.add((spec.strip().upper(), None))
    return wanted


def main(outdir, only_specs, extra):
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    wanted = parse_only(only_specs)
    manifest = json.loads((ROOT / "subjects" / "manifest.json").read_text(encoding="utf-8"))
    batch = []
    failures = 0
    done = 0
    for entry in manifest:
        track = str(entry.get("track", "")).upper()
        year = int(entry.get("year", 0))
        if (track, year) not in wanted and (track, None) not in wanted:
            continue
        src = ROOT / entry["file"]
        tag = f"{track}-{year}-{entry.get('session', 'main')}-sujet-{entry.get('subject')}"
        dest = outdir / f"{tag}.pdf"
        qa = outdir / f"qa-{tag}.txt"
        if not src.exists():
            line = f"SKIP {src} absent"
            print(line, flush=True)
            batch.append(line)
            continue
        print(f"=== {src} ===", flush=True)
        batch.append(f"=== {src} ===")
        r = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "ocr-logical-layer.py"), str(src), str(dest), str(qa)]
            + extra,
        )
        if r.returncode == 0 and dest.exists():
            line = f"OK {dest} {dest.stat().st_size} bytes"
            done += 1
        else:
            line = f"FAILED {src} (exit {r.returncode})"
            failures += 1
        print(line, flush=True)
        batch.append(line)
    batch.append(f"done={done} failures={failures}")
    (outdir / "BATCH.txt").write_text("\n".join(batch) + "\n", encoding="utf-8")
    print(f"done={done} failures={failures}", flush=True)
    return 1 if failures else 0


if __name__ == "__main__":
    if len(sys.argv) < 4 or sys.argv[2] != "--only":
        print(__doc__)
        sys.exit(2)
    rest = sys.argv[3:]
    cut = next((i for i, a in enumerate(rest) if a.startswith("--")), len(rest))
    sys.exit(main(sys.argv[1], rest[:cut], rest[cut:]))
