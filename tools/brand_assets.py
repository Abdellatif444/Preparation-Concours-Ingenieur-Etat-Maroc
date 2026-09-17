"""brand_assets.py — Génère les visuels de la boutique Etsy Pagewhim.

Identité reprise de docs/ETSY_SHOP_NAME_STUDY.md (section 7.2) :
page au coin replié, couleurs crème / bleu nuit / corail / menthe.
Tailles Etsy (help.etsy.com, lu le 2026-09-15) : logo ≥ 500×500 px, < 10 Mo ;
grande bannière 3360×840 px recommandée (minimum 1200×300) ;
photos « About » affichées en 760×468 px, 2 Mo maximum.

Usage : python tools/brand_assets.py
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "brand")
IMAGES = os.path.join(ROOT, "images")

CREAM = "#FFF8EE"
NAVY = "#1F2A44"
CORAL = "#FF7A59"
MINT = "#7FD1B9"
WHITE = "#FFFFFF"

FONT_DIR = r"C:\Windows\Fonts"
SS = 4  # suréchantillonnage pour des contours lisses

BANNER_PAGES = [
    "col-mf-02-royal-pegasus.png",
    "col-mf-21-knight-dragon-picnic.png",
    "col-mf-27-tiny-dragon-bakery.png",
    "col-mf-06-celestial-astral-lighthouse.png",
]


def font(names, size):
    for name in names:
        path = os.path.join(FONT_DIR, name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def rounded_line(draw, points, color, width, closed=False):
    pts = list(points) + ([points[0]] if closed else [])
    draw.line(pts, fill=color, width=width, joint="curve")
    r = width / 2
    for x, y in pts:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


def sparkle_points(cx, cy, r, inner=0.3):
    pts = []
    for i in range(8):
        angle = -math.pi / 2 + i * math.pi / 4
        radius = r if i % 2 == 0 else r * inner
        pts.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return pts


def sparkle(draw, cx, cy, r, fill, outline, width):
    pts = sparkle_points(cx, cy, r)
    draw.polygon(pts, fill=fill)
    rounded_line(draw, pts, outline, width, closed=True)


def draw_icon(size, background=CREAM):
    """Logo : une page blanche au coin replié en corail, un trait de fantaisie et une étoile."""
    s = size * SS
    u = s / 1000
    img = Image.new("RGB", (s, s), background)
    d = ImageDraw.Draw(img)

    def p(x, y):
        return (x * u, y * u)

    stroke = int(34 * u)
    page = [p(270, 170), p(590, 170), p(730, 310), p(730, 840), p(270, 840)]
    d.polygon(page, fill=WHITE)
    rounded_line(d, page, NAVY, stroke, closed=True)

    fold = [p(590, 170), p(590, 310), p(730, 310)]
    d.polygon(fold, fill=CORAL)
    rounded_line(d, fold, NAVY, stroke, closed=True)

    # Trait « whim » : un coup de crayon libre qui fait une boucle et monte vers l'étoile.
    curve = []
    steps = 160
    for i in range(steps + 1):
        t = -math.pi + 2 * math.pi * i / steps
        x = 470 + 42 * t - 95 * math.sin(t)
        y = 585 - 95 * math.cos(t) - 32 * t
        curve.append(p(x, y))
    rounded_line(d, curve, CORAL, int(30 * u))

    sparkle(d, *p(580, 440), 82 * u, MINT, NAVY, int(22 * u))
    sparkle(d, *p(395, 330), 48 * u, MINT, NAVY, int(18 * u))
    return img.resize((size, size), Image.LANCZOS)


def page_card(filename, height, rotation):
    page = Image.open(os.path.join(IMAGES, filename)).convert("L")
    page = ImageOps.autocontrast(page).convert("RGB")
    width = round(height * page.width / page.height)
    page = page.resize((width, height), Image.LANCZOS)
    border = max(10, height // 36)
    card = ImageOps.expand(page, border=border, fill=WHITE)
    card = ImageOps.expand(card, border=max(3, height // 200), fill=NAVY)
    card = card.convert("RGBA").rotate(rotation, resample=Image.BICUBIC, expand=True)
    shadow = Image.new("RGBA", card.size, (31, 42, 68, 0))
    shadow.putalpha(card.getchannel("A").point(lambda a: int(a * 0.28)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(6, height // 40)))
    return card, shadow


def paste_card(canvas, filename, cx, cy, height, rotation):
    card, shadow = page_card(filename, height, rotation)
    off = max(6, height // 50)
    x, y = int(cx - card.width / 2), int(cy - card.height / 2)
    canvas.alpha_composite(shadow, (x + off, y + off * 2))
    canvas.alpha_composite(card, (x, y))


def centered_text(draw, text, fnt, cx, y, fill):
    w = draw.textlength(text, font=fnt)
    draw.text((cx - w / 2, y), text, font=fnt, fill=fill)


def build_banner():
    w, h = 3360, 840
    canvas = Image.new("RGBA", (w, h), CREAM)
    # Pages sur les côtés (recadrées sur mobile), texte au centre (toujours visible).
    paste_card(canvas, BANNER_PAGES[0], 330, 430, 600, 6)
    paste_card(canvas, BANNER_PAGES[1], 780, 440, 600, -4)
    paste_card(canvas, BANNER_PAGES[2], 2580, 440, 600, 4)
    paste_card(canvas, BANNER_PAGES[3], 3030, 430, 600, -6)

    d = ImageDraw.Draw(canvas)
    icon = draw_icon(250).convert("RGBA")
    title = font(["Candarab.ttf", "segoeuib.ttf", "arialbd.ttf"], 210)
    tagline = font(["segoeui.ttf", "arial.ttf"], 70)
    slogan = font(["Candarai.ttf", "segoeuii.ttf", "ariali.ttf"], 64)

    word = "pagewhim"
    word_w = d.textlength(word, font=title)
    block_w = icon.width + 40 + word_w
    x0 = int(w / 2 - block_w / 2)
    canvas.alpha_composite(icon, (x0, 180))
    d.text((x0 + icon.width + 40, 170), word, font=title, fill=NAVY)
    centered_text(d, "Original printable coloring pages", tagline, w / 2, 480, NAVY)
    centered_text(d, "Pages for curious minds.", slogan, w / 2, 590, CORAL)

    for cx, cy, r, color in [(1180, 620, 34, MINT), (2190, 150, 40, CORAL), (2250, 650, 26, MINT), (1120, 140, 24, CORAL)]:
        sparkle(d, cx, cy, r, color, NAVY, 7)
    return canvas.convert("RGB")


def build_about_photo():
    w, h = 1520, 936
    canvas = Image.new("RGBA", (w, h), CREAM)
    paste_card(canvas, BANNER_PAGES[0], 330, 470, 640, -5)
    paste_card(canvas, BANNER_PAGES[1], 760, 460, 680, 0)
    paste_card(canvas, BANNER_PAGES[2], 1190, 470, 640, 5)
    return canvas.convert("RGB")


def save(img, name, **options):
    path = os.path.join(OUT, name)
    img.save(path, **options)
    print(f"{name}: {img.width}×{img.height} px, {os.path.getsize(path) // 1024} Ko")


def main():
    os.makedirs(OUT, exist_ok=True)
    save(draw_icon(1000), "pagewhim-logo-1000.png", optimize=True)
    save(draw_icon(500), "pagewhim-logo-500.png", optimize=True)
    save(build_banner(), "pagewhim-banner-3360x840.jpg", quality=92, optimize=True)
    save(build_about_photo(), "pagewhim-about-pages.jpg", quality=90, optimize=True)


if __name__ == "__main__":
    main()
