"""logo_finish.py — Finit le logo Pagewhim à partir de l'emblème généré.

Entrée  : brand/sources/logo-embleme-v1.jpeg (emblème sans texte, généré dans Flow)
Sorties : brand/pagewhim-logo-1000.png     — emblème + nom + slogan (page boutique Etsy)
          brand/pagewhim-logo-500.png      — même image en 500 px
          brand/pagewhim-logo-icone-500.png — version simplifiée, lisible en tout petit

Le texte est écrit ici avec une vraie police : les générateurs d'images déforment les lettres.

Usage : python tools/logo_finish.py [--source <fichier>] [--nom-y 0.76] [--slogan-y 0.88]
"""
import argparse
import math
import os

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "brand")
DEFAULT_SOURCE = os.path.join(BRAND, "sources", "logo-embleme-v1.jpeg")

CREAM = (255, 248, 238)
NAVY = (31, 42, 68)
CORAL = (255, 122, 89)
MINT = (127, 209, 185)
FONT_DIR = r"C:\Windows\Fonts"


def font(names, size):
    for name in names:
        path = os.path.join(FONT_DIR, name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def trim(image, tolerance=14):
    """Recadre sur le contenu, en ignorant le fond uni des bords."""
    background = Image.new("RGB", image.size, image.getpixel((2, 2)))
    diff = ImageChops.difference(image, background).convert("L").point(lambda v: 255 if v > tolerance else 0)
    box = diff.getbbox()
    return image.crop(box) if box else image


def normalize_background(image, tolerance=26):
    """Remplace le beige du générateur par le crème exact de la marque."""
    pixels = image.load()
    width, height = image.size
    reference = image.getpixel((1, 1))
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            if abs(r - reference[0]) <= tolerance and abs(g - reference[1]) <= tolerance and abs(b - reference[2]) <= tolerance:
                pixels[x, y] = CREAM
    return image


def draw_spaced(draw, text, fnt, center_x, y, fill, spacing):
    widths = [draw.textlength(char, font=fnt) for char in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = center_x - total / 2
    for char, width in zip(text, widths):
        draw.text((x, y), char, font=fnt, fill=fill)
        x += width + spacing


def build_logo(source, size, name_y, tagline_y, ecrire_texte=True):
    """Recadre et centre l'emblème. Le texte n'est écrit que si la source ne le porte pas déjà."""
    emblem = normalize_background(trim(Image.open(source).convert("RGB")))
    side = max(emblem.size)
    canvas = Image.new("RGB", (side, side), CREAM)
    canvas.paste(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2))
    canvas = canvas.resize((size, size), Image.LANCZOS)
    if not ecrire_texte:
        return canvas

    draw = ImageDraw.Draw(canvas)
    name_font = font(["georgiab.ttf", "Candarab.ttf", "segoeuib.ttf"], round(size * 0.080))
    tagline_font = font(["georgia.ttf", "Candara.ttf", "segoeui.ttf"], round(size * 0.027))
    draw_spaced(draw, "pagewhim", name_font, size / 2, size * name_y, NAVY, size * 0.006)
    draw_spaced(draw, "PAGES FOR CURIOUS MINDS", tagline_font, size / 2, size * tagline_y, NAVY, size * 0.008)
    return canvas


def build_icon(size=500):
    """Icône simplifiée : livre ouvert, moitié coloriée, une étoile. Lisible à 32 px."""
    scale = 4
    s = size * scale
    u = s / 1000
    image = Image.new("RGB", (s, s), CREAM)
    draw = ImageDraw.Draw(image)
    stroke = int(46 * u)

    left = [(120 * u, 400 * u), (490 * u, 345 * u), (490 * u, 800 * u), (120 * u, 845 * u)]
    right = [(510 * u, 345 * u), (880 * u, 400 * u), (880 * u, 845 * u), (510 * u, 800 * u)]
    draw.polygon(left, fill=(255, 255, 255))
    draw.polygon(right, fill=CORAL)
    for shape in (left, right):
        points = shape + [shape[0]]
        draw.line(points, fill=NAVY, width=stroke, joint="curve")
        for x, y in points:
            draw.ellipse((x - stroke / 2, y - stroke / 2, x + stroke / 2, y + stroke / 2), fill=NAVY)
    draw.line([(500 * u, 345 * u), (500 * u, 810 * u)], fill=NAVY, width=stroke)

    points = []
    for index in range(8):
        angle = -math.pi / 2 + index * math.pi / 4
        radius = 105 * u if index % 2 == 0 else 30 * u
        points.append((500 * u + radius * math.cos(angle), 175 * u + radius * math.sin(angle)))
    draw.polygon(points, fill=MINT)
    draw.line(points + [points[0]], fill=NAVY, width=int(30 * u), joint="curve")
    return image.resize((size, size), Image.LANCZOS)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    parser.add_argument("--nom-y", type=float, default=0.712)
    parser.add_argument("--slogan-y", type=float, default=0.830)
    args = parser.parse_args()

    logo = build_logo(args.source, 1000, args.nom_y, args.slogan_y)
    for name, image in (
        ("pagewhim-logo-1000.png", logo),
        ("pagewhim-logo-500.png", logo.resize((500, 500), Image.LANCZOS)),
        ("pagewhim-logo-icone-500.png", build_icon(500)),
    ):
        path = os.path.join(BRAND, name)
        image.save(path, optimize=True)
        print(f"{name}: {image.width}×{image.height} px, {os.path.getsize(path) // 1024} Ko")


if __name__ == "__main__":
    main()
