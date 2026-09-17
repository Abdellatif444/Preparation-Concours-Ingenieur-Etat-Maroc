"""about_photos.py — Génère les photos « About » de la boutique Etsy à partir de nos vraies pages.

Etsy affiche ces photos en 760 × 468 px ; on produit donc du 1520 × 936 (2×).
Aucune page inventée : toutes les vignettes viennent de images/.

Inspiration assumée du marché (docs/ETSY_BRAND_MARKET_ANALYSIS.md §4.6) :
grille du contenu, exemple de contrôle, formats, étapes de téléchargement.

Sorties dans brand/ :
  pagewhim-about-inside.jpg    ce qu'il y a dans un livre
  pagewhim-about-checked.jpg   la preuve du contrôle page par page
  pagewhim-about-sizes.jpg     A4 et US Letter
  pagewhim-about-steps.jpg     acheter, télécharger, imprimer

Usage : python tools/about_photos.py
"""
import glob
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "brand")
IMAGES = os.path.join(ROOT, "images")
W, H = 1520, 936
CREAM = (255, 248, 238)
NAVY = (31, 42, 68)
CORAL = (255, 122, 89)
MINT = (127, 209, 185)
WHITE = (255, 255, 255)
FONT_DIR = r"C:\Windows\Fonts"


def font(names, size):
    for name in names:
        path = os.path.join(FONT_DIR, name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


TITLE = lambda s: font(["georgiab.ttf", "Candarab.ttf", "segoeuib.ttf"], s)
BODY = lambda s: font(["georgia.ttf", "Candara.ttf", "segoeui.ttf"], s)


def pages(*names):
    if names:
        return [os.path.join(IMAGES, n) for n in names]
    return sorted(glob.glob(os.path.join(IMAGES, "*.png")))


def card(path, height, border=10):
    page = Image.open(path).convert("RGB")
    width = round(height * page.width / page.height)
    page = page.resize((width, height), Image.LANCZOS)
    card = Image.new("RGB", (width + 2 * border, height + 2 * border), WHITE)
    card.paste(page, (border, border))
    return card


def shadow(canvas, box, blur=12, alpha=60):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rectangle(box, fill=(31, 42, 68, alpha))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def base(title, subtitle=None):
    canvas = Image.new("RGBA", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)
    t = TITLE(60)
    draw.text(((W - draw.textlength(title, font=t)) / 2, 54), title, font=t, fill=NAVY)
    if subtitle:
        s = BODY(30)
        draw.text(((W - draw.textlength(subtitle, font=s)) / 2, 132), subtitle, font=s, fill=NAVY)
    return canvas


def paste(canvas, image, cx, cy):
    x, y = int(cx - image.width / 2), int(cy - image.height / 2)
    shadow(canvas, (x + 6, y + 10, x + image.width + 6, y + image.height + 10))
    canvas.paste(image, (x, y))


def inside_book():
    canvas = base("Inside a coloring book", "30 original pages, one clear subject on each")
    files = pages()[:8]
    for index, path in enumerate(files):
        thumb = card(path, 290, border=7)
        column, row = index % 4, index // 4
        paste(canvas, thumb, 230 + column * 355, 400 + row * 330)
    return canvas


def checked():
    canvas = base("Every page checked, one by one")
    paste(canvas, card(pages("col-mf-21-knight-dragon-picnic.png")[0], 620), 430, 540)
    draw = ImageDraw.Draw(canvas)
    body = BODY(34)
    checks = [
        "Closed outlines, easy to colour inside",
        "No grey shading, no solid black fills",
        "Nothing cut off by the edge of the page",
        "Pure white background, ready to print",
    ]
    for index, line in enumerate(checks):
        y = 330 + index * 110
        draw.ellipse((830, y, 872, y + 42), fill=MINT, outline=NAVY, width=4)
        draw.line([(841, y + 22), (850, y + 32), (863, y + 11)], fill=NAVY, width=6)
        draw.text((900, y - 2), line, font=body, fill=NAVY)
    return canvas


def sizes():
    """Les deux feuilles sont dessinées à leurs vraies proportions : A4 est plus élancé."""
    canvas = base("Two sizes, ready to print", "The same book in A4 and in US Letter")
    draw = ImageDraw.Draw(canvas)
    art = Image.open(pages("col-mf-02-royal-pegasus.png")[0]).convert("RGB")
    height = 560
    for name, size, ratio, cx in (("A4", "21 x 29.7 cm", 1 / 1.414, 430),
                                  ("US Letter", "8.5 x 11 in", 8.5 / 11, 1090)):
        width = round(height * ratio)
        sheet = Image.new("RGB", (width, height), WHITE)
        inner = art.copy()
        inner.thumbnail((width - 46, height - 46), Image.LANCZOS)
        sheet.paste(inner, ((width - inner.width) // 2, (height - inner.height) // 2))
        paste(canvas, sheet, cx, 500)
        title = TITLE(44)
        draw.text((cx - draw.textlength(name, font=title) / 2, 800), name, font=title, fill=NAVY)
        body = BODY(30)
        draw.text((cx - draw.textlength(size, font=body) / 2, 858), size, font=body, fill=CORAL)
    return canvas


def steps():
    canvas = base("How it works", "No waiting, nothing is shipped")
    draw = ImageDraw.Draw(canvas)
    items = [("1", "Buy the book", "Pay on Etsy"),
             ("2", "Download", "Your files are ready right away"),
             ("3", "Print at home", "A4 or US Letter, as many times as you like")]
    for index, (number, head, detail) in enumerate(items):
        cx = 310 + index * 450
        draw.ellipse((cx - 78, 380, cx + 78, 536), fill=CORAL)
        number_font = TITLE(84)
        draw.text((cx - draw.textlength(number, font=number_font) / 2, 410), number, font=number_font, fill=WHITE)
        head_font = TITLE(42)
        draw.text((cx - draw.textlength(head, font=head_font) / 2, 610), head, font=head_font, fill=NAVY)
        body = BODY(30)
        words, line, y = detail.split(), "", 690
        for word in words:
            trial = (line + " " + word).strip()
            if draw.textlength(trial, font=body) > 380:
                draw.text((cx - draw.textlength(line, font=body) / 2, y), line, font=body, fill=NAVY)
                line, y = word, y + 44
            else:
                line = trial
        draw.text((cx - draw.textlength(line, font=body) / 2, y), line, font=body, fill=NAVY)
    return canvas


def main():
    for name, builder in (("inside", inside_book), ("checked", checked), ("sizes", sizes), ("steps", steps)):
        path = os.path.join(BRAND, f"pagewhim-about-{name}.jpg")
        builder().convert("RGB").save(path, quality=90, optimize=True)
        print(f"pagewhim-about-{name}.jpg: {W}x{H} px, {os.path.getsize(path) // 1024} Ko")


if __name__ == "__main__":
    main()
