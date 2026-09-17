"""pack_builder.py — Construit le pack vendable d'un livre de coloriage.

L'export du hub empile les images telles quelles : à 896 px déclarés en 300 DPI,
on obtient des pages de 76 x 102 mm, inutilisables. Ce script fait le vrai travail :

  1. agrandissement des pages vers 300 DPI (LANCZOS) ;
  2. nettoyage du trait : contraste puis écrasement des gris, sans casser l'anti-aliasing ;
  3. mise en page A4 et US Letter, image centrée avec marges ;
  4. contrôle de conformité avant inclusion (coloring_metrics) ;
  5. contrôle du poids : Etsy accepte 20 Mo par fichier.

Sorties dans exports/<nom-du-pack>/ :
  <pack>-A4.pdf
  <pack>-US-Letter.pdf
  <pack>-PNG-300dpi.zip   (pages en 2550 x 3300, à ouvrir sur tablette ou à réimprimer)

Usage :
  python tools/pack_builder.py --nom "Magical-Fantasy-Vol-1"
  python tools/pack_builder.py --nom "Test" --pages 3 --sans-controle
"""
import argparse
import glob
import io
import os
import sys
import zipfile

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "images")
EXPORTS = os.path.join(ROOT, "exports")
sys.path.insert(0, os.path.join(ROOT, "tools", "flow_image_hub"))

DPI = 300
MM = 25.4
FORMATS = {
    "A4": (210 / MM * DPI, 297 / MM * DPI),
    "US-Letter": (8.5 * DPI, 11 * DPI),
}
LIMIT_MB = 20


def sheet_size(name):
    w, h = FORMATS[name]
    return round(w), round(h)


def prepare(path, target_width, target_height):
    """Agrandit la page vers 300 DPI et renforce le trait sans créer d'aplats gris."""
    page = Image.open(path).convert("L")
    scale = min(target_width / page.width, target_height / page.height)
    size = (round(page.width * scale), round(page.height * scale))
    page = page.resize(size, Image.LANCZOS)
    page = ImageOps.autocontrast(page, cutoff=0)
    # Les gris clairs deviennent blancs, les gris foncés deviennent noirs,
    # et une courte transition est gardée pour que le trait ne soit pas crénelé.
    table = [0 if v < 96 else (255 if v > 176 else round((v - 96) * 255 / 80)) for v in range(256)]
    return page.point(table)


def compose(path, format_name, margin_mm):
    width, height = sheet_size(format_name)
    margin = round(margin_mm / MM * DPI)
    page = prepare(path, width - 2 * margin, height - 2 * margin)
    sheet = Image.new("L", (width, height), 255)
    sheet.paste(page, ((width - page.width) // 2, (height - page.height) // 2))
    return sheet


def conformes(paths, controle=True):
    if not controle:
        return paths, []
    import coloring_metrics as cm
    kept, rejected = [], []
    for path in paths:
        result = cm.measure(path)
        (kept if result.get("passed") else rejected).append(path)
    return kept, rejected


def build_pdf(paths, format_name, margin_mm, out_path):
    sheets = [compose(p, format_name, margin_mm) for p in paths]
    first, rest = sheets[0], sheets[1:]
    first.save(out_path, "PDF", resolution=float(DPI), save_all=True, append_images=rest)
    return os.path.getsize(out_path)


def build_zip(paths, out_path):
    width, height = sheet_size("US-Letter")
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in paths:
            page = prepare(path, width, height)
            buffer = io.BytesIO()
            page.save(buffer, "PNG", optimize=True, dpi=(DPI, DPI))
            archive.writestr(os.path.basename(path), buffer.getvalue())
    return os.path.getsize(out_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--nom", default="Magical-Fantasy-Vol-1")
    parser.add_argument("--source", default=IMAGES)
    parser.add_argument("--marge-mm", type=float, default=12.0)
    parser.add_argument("--pages", type=int, default=0, help="limiter le nombre de pages (essai)")
    parser.add_argument("--sans-controle", action="store_true", help="ignorer les mesures de conformité")
    args = parser.parse_args()

    paths = sorted(glob.glob(os.path.join(args.source, "*.png")))
    if args.pages:
        paths = paths[:args.pages]
    if not paths:
        print("Aucune page trouvée.")
        return

    kept, rejected = conformes(paths, controle=not args.sans_controle)
    for path in rejected:
        print(f"  écartée (non conforme) : {os.path.basename(path)}")
    if not kept:
        print("Aucune page conforme : rien à assembler.")
        return

    out_dir = os.path.join(EXPORTS, args.nom)
    os.makedirs(out_dir, exist_ok=True)
    print(f"{len(kept)} pages retenues sur {len(paths)}")

    for format_name in FORMATS:
        out_path = os.path.join(out_dir, f"{args.nom}-{format_name}.pdf")
        size = build_pdf(kept, format_name, args.marge_mm, out_path)
        width, height = sheet_size(format_name)
        flag = "OK" if size <= LIMIT_MB * 1024 * 1024 else f"TROP LOURD (> {LIMIT_MB} Mo)"
        print(f"  {os.path.basename(out_path)}: {len(kept)} pages, {width}x{height} px, "
              f"{size / 1024 / 1024:.1f} Mo  {flag}")

    zip_path = os.path.join(out_dir, f"{args.nom}-PNG-300dpi.zip")
    size = build_zip(kept, zip_path)
    flag = "OK" if size <= LIMIT_MB * 1024 * 1024 else f"TROP LOURD (> {LIMIT_MB} Mo)"
    print(f"  {os.path.basename(zip_path)}: {size / 1024 / 1024:.1f} Mo  {flag}")


if __name__ == "__main__":
    main()
