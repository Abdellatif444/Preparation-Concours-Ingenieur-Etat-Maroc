#!/usr/bin/env python3
"""
coloring_metrics.py — Mesures objectives d'une page de coloriage.

Compare une page à la cible du pack enfants 8-12 ans, difficulté intermédiaire
(docs/ETSY_FIRST_LISTING_MARKET_STUDY.md, section 5.3) :
résolution, nombre de zones à colorier, part de petites zones, taille médiane
d'une zone et aplats noirs.

Usage (depuis la racine du projet) :
    python tools/flow_image_hub/coloring_metrics.py images/col-mf-02-royal-pegasus.png [autres pages...]
"""

import os
import sys

from PIL import Image, ImageFilter

ANALYSIS_SIZE = (448, 600)   # taille commune pour comparer des pages de résolutions différentes
INK_THRESHOLD = 180          # en dessous : trait noir
MIN_REGION_PX = 20           # ignore le bruit et l'intérieur des traits
SMALL_REGION_RATIO = 0.001   # zone « petite » : moins de 0,1 % de la page
FRAME_BAND = 0.15            # un cadre se trouve dans les 15 % extérieurs de chaque côté
EDGE_STRIP_PX = 2            # bande extrême de l'image d'analyse : de l'encre ici = dessin coupé par le bord

TARGET_KIDS_8_12 = {
    "label": "Enfants 8-12 ans · difficulté intermédiaire",
    "min_height": 1200,
    "zones": (100, 220),
    "max_small_share": 70.0,
    "min_median_zone_pct": 0.04,
    "max_solid_black_pct": 0.5,
    "frame_min_coverage": 0.75,   # trait parallèle au bord couvrant au moins 75 % du côté, sur les 4 côtés
    "max_edge_ink_pct": 0.5,      # part d'un côté touchée par le dessin au-delà de laquelle il est « coupé »
                                  # (calibré sur les 30 pages : toute encre au bord correspondait à un élément réellement coupé)
}

SIDES = {
    "haut": None,
    "bas": Image.FLIP_TOP_BOTTOM,
    "gauche": Image.TRANSPOSE,
    "droite": Image.TRANSVERSE,
}


def _oriented(binary, transform):
    """Image tournée pour que le côté étudié devienne le haut."""
    return binary if transform is None else binary.transpose(transform)


def _band_line_coverage(img, band):
    """Plus longue ligne d'encre parallèle au haut de l'image, dans la bande extérieure (part de la largeur)."""
    w, h = img.size
    data = img.tobytes()
    best = 0.0
    for y in range(max(1, min(int(h * band), h - 3))):
        # trois lignes de pixels fusionnées : un trait légèrement penché ou anti-crénelé reste continu
        merged = bytes(map(min, data[y * w:(y + 1) * w], data[(y + 1) * w:(y + 2) * w], data[(y + 2) * w:(y + 3) * w]))
        best = max(best, merged.count(0) / w)
    return best


def _edge_ink_pct(img, strip):
    """Part du bord supérieur de l'image touchée par le dessin."""
    w, _ = img.size
    data = img.tobytes()
    rows = [data[y * w:(y + 1) * w] for y in range(strip)]
    merged = bytes(map(min, *rows)) if len(rows) > 1 else rows[0]
    return merged.count(0) / w * 100


def _regions(data, width, height):
    """Aires des zones blanches fermées (celles qui ne touchent pas le bord)."""
    total = width * height
    visited = bytearray(total)
    areas = []
    for start in range(total):
        if data[start] == 0 or visited[start]:
            continue
        visited[start] = 1
        stack = [start]
        area = 0
        touches_border = False
        while stack:
            i = stack.pop()
            area += 1
            x, y = i % width, i // width
            if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                touches_border = True
            for j in (i - 1 if x > 0 else -1, i + 1 if x < width - 1 else -1,
                      i - width if y > 0 else -1, i + width if y < height - 1 else -1):
                if j >= 0 and data[j] and not visited[j]:
                    visited[j] = 1
                    stack.append(j)
        if not touches_border and area >= MIN_REGION_PX:
            areas.append(area)
    return sorted(areas)


def measure(path, target=TARGET_KIDS_8_12):
    with Image.open(path) as im:
        width, height = im.size
        gray = im.convert("L").resize(ANALYSIS_SIZE, Image.LANCZOS)

    w, h = ANALYSIS_SIZE
    total = w * h
    binary = gray.point(lambda v: 255 if v >= INK_THRESHOLD else 0)
    data = binary.tobytes()

    ink_pct = data.count(0) / total * 100
    areas = _regions(data, w, h)
    zones = len(areas)
    small_share = 100 * sum(1 for a in areas if a < total * SMALL_REGION_RATIO) / zones if zones else 0.0
    median_zone_pct = areas[zones // 2] / total * 100 if zones else 0.0

    # Un filtre « max » de 5 px efface les traits fins : ce qui reste noir est un aplat épais
    solid_black_pct = binary.filter(ImageFilter.MaxFilter(5)).tobytes().count(0) / total * 100

    # Cadre : un trait longe les 4 côtés ; bord coupé : le dessin touche le bord de l'image
    frame_coverage = {side: _band_line_coverage(_oriented(binary, t), FRAME_BAND) for side, t in SIDES.items()}
    has_frame = all(c >= target["frame_min_coverage"] for c in frame_coverage.values())
    edge_ink = {side: _edge_ink_pct(_oriented(binary, t), EDGE_STRIP_PX) for side, t in SIDES.items()}
    cut_sides = [side for side, pct in edge_ink.items() if pct > target["max_edge_ink_pct"]]

    bbox = binary.point(lambda v: 255 - v).getbbox()
    margins = [0.0, 0.0, 0.0, 0.0]
    if bbox:
        margins = [bbox[0] / w * 100, bbox[1] / h * 100, (w - bbox[2]) / w * 100, (h - bbox[3]) / h * 100]

    # Les comparaisons se font sur les valeurs arrondies affichées, pour éviter « 0.04 % » refusé contre « ≥ 0.04 % »
    small_share = round(small_share)
    median_zone_pct = round(median_zone_pct, 2)
    low, high = target["zones"]
    checks = [
        {"key": "resolution", "label": "Résolution", "value": f"{width}×{height}",
         "target": f"hauteur ≥ {target['min_height']} px", "ok": height >= target["min_height"]},
        {"key": "zones", "label": "Zones à colorier", "value": str(zones),
         "target": f"{low} à {high}", "ok": low <= zones <= high},
        {"key": "small_share", "label": "Petites zones", "value": f"{small_share:.0f} %",
         "target": f"≤ {target['max_small_share']:.0f} %", "ok": small_share <= target["max_small_share"]},
        {"key": "median_zone", "label": "Zone médiane", "value": f"{median_zone_pct:.2f} %",
         "target": f"≥ {target['min_median_zone_pct']:.2f} % de la page", "ok": median_zone_pct >= target["min_median_zone_pct"]},
        {"key": "solid_black", "label": "Aplats noirs", "value": f"{solid_black_pct:.2f} %",
         "target": f"≤ {target['max_solid_black_pct']:.1f} %", "ok": solid_black_pct <= target["max_solid_black_pct"]},
        {"key": "frame", "label": "Cadre", "value": "oui" if has_frame else "non",
         "target": "aucun cadre autour du dessin", "ok": not has_frame},
        # Information seulement : un élément qui touche le bord (branche, colline…) ne rend pas la page non conforme
        {"key": "edge_cut", "label": "Bord coupé", "value": ", ".join(cut_sides) if cut_sides else "aucun",
         "target": "marge blanche sur les 4 bords (information)", "ok": not cut_sides, "blocking": False},
    ]
    return {
        "file": os.path.basename(path),
        "width": width,
        "height": height,
        "ink_pct": round(ink_pct, 1),
        "zones": zones,
        "small_share_pct": round(small_share, 1),
        "median_zone_pct": round(median_zone_pct, 3),
        "solid_black_pct": round(solid_black_pct, 2),
        "margins_pct": [round(m, 1) for m in margins],
        "frame_coverage": {side: round(c, 2) for side, c in frame_coverage.items()},
        "edge_ink_pct": {side: round(p, 1) for side, p in edge_ink.items()},
        "target": target["label"],
        "checks": checks,
        "passed": all(c["ok"] for c in checks if c.get("blocking", True)),
    }


def main(paths):
    if not paths:
        sys.exit(__doc__)
    for path in paths:
        result = measure(path)
        status = "CONFORME" if result["passed"] else "À REVOIR"
        print(f"\n{result['file']} — {status} ({result['target']})")
        for check in result["checks"]:
            status = 'OK ' if check['ok'] else ('INFO' if not check.get('blocking', True) else 'NON')
            print(f"  {status:<4} {check['label']:<17} {check['value']:<12} cible {check['target']}")


if __name__ == "__main__":
    main(sys.argv[1:])
