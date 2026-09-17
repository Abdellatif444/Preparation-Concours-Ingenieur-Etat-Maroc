"""banner_finish.py — Finit la bannière Etsy à partir de l'atelier généré.

Entrée  : brand/sources/banniere-atelier-v1.jpeg (scène sans texte, générée dans Flow)
Sortie  : brand/pagewhim-banner-3360x840.jpg (grande bannière Etsy, 4:1)
          brand/sources/apercu-mobile.jpg (les 40 % centraux, seuls visibles sur téléphone)

Deux modes, car une image 16:9 ne rentre pas dans un cadre 4:1 sans perte :
  --mode bande  : la scène est agrandie et une bande de 840 px est découpée (le haut et le bas sortent du cadre)
  --mode entier : la scène est gardée entière au centre, les côtés sont prolongés par son propre décor

Le nom et la promesse sont écrits ici avec une vraie police : les générateurs déforment les lettres.

Usage : python tools/banner_finish.py --mode entier
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "brand")
DEFAULT_SOURCE = os.path.join(BRAND, "sources", "banniere-atelier-v1.jpeg")
OUT = os.path.join(BRAND, "pagewhim-banner-3360x840.jpg")

WIDTH, HEIGHT = 3360, 840
NAVY = (31, 42, 68)
FONT_DIR = r"C:\Windows\Fonts"

# Position du panneau de bois dans la scène source, en ratio de l'image.
PANEL = {"x0": 0.381, "x1": 0.622, "y0": 0.200, "y1": 0.437}


def font(names, size):
    for name in names:
        path = os.path.join(FONT_DIR, name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_spaced(draw, text, fnt, center_x, y, fill, spacing):
    widths = [draw.textlength(char, font=fnt) for char in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = center_x - total / 2
    for char, width in zip(text, widths):
        draw.text((x, y), char, font=fnt, fill=fill)
        x += width + spacing


def write_sign(banner, panel_box):
    """Écrit le nom et la promesse à l'intérieur du panneau de bois."""
    x0, y0, x1, y1 = panel_box
    center_x = (x0 + x1) / 2
    panel_width = x1 - x0
    panel_height = y1 - y0
    draw = ImageDraw.Draw(banner)

    name_font = font(["georgiab.ttf", "Candarab.ttf", "segoeuib.ttf"], round(panel_width * 0.155))
    promise_font = font(["georgia.ttf", "Candara.ttf", "segoeui.ttf"], round(panel_width * 0.054))
    draw_spaced(draw, "pagewhim", name_font, center_x, y0 + panel_height * 0.20, NAVY, panel_width * 0.006)
    draw_spaced(draw, "PRINTABLE COLORING PAGES", promise_font, center_x, y0 + panel_height * 0.52, NAVY, panel_width * 0.010)
    draw_spaced(draw, "for kids, teens and adults", promise_font, center_x, y0 + panel_height * 0.72, NAVY, panel_width * 0.002)
    return banner


def mode_bande(scene, top):
    scale = WIDTH / scene.width
    enlarged = scene.resize((WIDTH, round(scene.height * scale)), Image.LANCZOS)
    top = max(0, min(top, enlarged.height - HEIGHT))
    banner = enlarged.crop((0, top, WIDTH, top + HEIGHT))
    panel = (
        PANEL["x0"] * WIDTH,
        PANEL["y0"] * enlarged.height - top,
        PANEL["x1"] * WIDTH,
        PANEL["y1"] * enlarged.height - top,
    )
    return banner, panel


def mode_entier(scene):
    """Scène gardée entière au centre ; les côtés sont prolongés par son propre décor, adouci."""
    scale = HEIGHT / scene.height
    middle = scene.resize((round(scene.width * scale), HEIGHT), Image.LANCZOS)
    side = (WIDTH - middle.width) // 2 + 2

    banner = Image.new("RGB", (WIDTH, HEIGHT), (255, 248, 238))
    # Les côtés sont remplis par l'étirement d'une fine bande de bord : un simple
    # dégradé de couleur, sans motif reconnaissable (un miroir répéterait le panneau).
    edge = 24
    for left_side in (True, False):
        box = (0, 0, edge, HEIGHT) if left_side else (middle.width - edge, 0, middle.width, HEIGHT)
        strip = middle.crop(box).resize((side, HEIGHT), Image.LANCZOS)
        strip = strip.filter(ImageFilter.GaussianBlur(18))
        strip = ImageEnhance.Color(strip).enhance(0.65)
        strip = Image.blend(strip, Image.new("RGB", strip.size, (255, 248, 238)), 0.30)
        banner.paste(strip, (0, 0) if left_side else (WIDTH - strip.width, 0))
    left = (WIDTH - middle.width) // 2
    banner.paste(middle, (left, 0))

    panel = (
        left + PANEL["x0"] * middle.width,
        PANEL["y0"] * HEIGHT,
        left + PANEL["x1"] * middle.width,
        PANEL["y1"] * HEIGHT,
    )
    return banner, panel


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    parser.add_argument("--mode", choices=["bande", "entier"], default="entier")
    parser.add_argument("--top", type=int, default=60, help="mode bande : décalage vertical du recadrage")
    parser.add_argument("--sans-texte", action="store_true", help="produit la bannière sans écrire le nom")
    args = parser.parse_args()

    scene = Image.open(args.source).convert("RGB")
    banner, panel = mode_bande(scene, args.top) if args.mode == "bande" else mode_entier(scene)
    if not args.sans_texte:
        banner = write_sign(banner, panel)

    banner.save(OUT, quality=92, optimize=True)
    print(f"{os.path.basename(OUT)} [{args.mode}]: {banner.width}×{banner.height} px, {os.path.getsize(OUT) // 1024} Ko")

    checks = os.path.join(BRAND, "checks")
    os.makedirs(checks, exist_ok=True)
    preview = banner.crop((round(WIDTH * 0.30), 0, round(WIDTH * 0.70), HEIGHT))
    preview_path = os.path.join(checks, "apercu-mobile.jpg")
    preview.save(preview_path, quality=88)
    print(f"apercu-mobile.jpg: {preview.width}×{preview.height} px")


if __name__ == "__main__":
    main()
