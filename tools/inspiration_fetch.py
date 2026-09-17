"""inspiration_fetch.py — Constitue le dossier d'inspiration des boutiques Etsy observées.

Télécharge les images publiques relevées le 2026-09-15 (logo, bannière, miniatures
de boutique, galerie des fiches phares) et assemble une planche par boutique et par fiche.

⚠️ Usage interne d'observation uniquement. Ces images appartiennent à leurs boutiques :
ne jamais les republier, les réutiliser dans nos fiches, ni les committer (dossier ignoré par Git).

Entrée  : inspiration_boutique/sources.json
Sortie  : inspiration_boutique/<boutique>/... + planches + INDEX.md

Usage : python tools/inspiration_fetch.py
"""
import json
import os
import time
import urllib.error
import urllib.request

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "inspiration_boutique")
SOURCES = os.path.join(OUT, "sources.json")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
PAUSE = 0.4
FONT_DIR = r"C:\Windows\Fonts"


def font(size):
    for name in ("segoeuib.ttf", "arialbd.ttf"):
        path = os.path.join(FONT_DIR, name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def download(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return True
    os.makedirs(os.path.dirname(path), exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read()
    except (urllib.error.URLError, TimeoutError) as error:
        print(f"  ⚠️ {os.path.basename(path)} : {error}")
        return False
    with open(path, "wb") as handle:
        handle.write(data)
    time.sleep(PAUSE)
    return True


def open_image(path):
    try:
        return Image.open(path).convert("RGB")
    except Exception:
        return None


def contact_sheet(title, banner_path, logo_path, image_paths, out_path, columns=4, cell=300):
    """Assemble une planche : bandeau titre, bannière, logo, puis grille d'images."""
    pad = 12
    header = 54
    banner = open_image(banner_path) if banner_path else None
    logo = open_image(logo_path) if logo_path else None
    images = [img for img in (open_image(p) for p in image_paths) if img]

    width = columns * cell + (columns + 1) * pad
    banner_height = 0
    if banner:
        banner_height = round(banner.height * (width - 2 * pad) / banner.width) + pad
    logo_height = (cell // 2 + pad) if logo else 0
    rows = (len(images) + columns - 1) // columns
    grid_height = rows * cell + (rows + 1) * pad if rows else 0
    sheet = Image.new("RGB", (width, header + banner_height + logo_height + grid_height + pad), "white")
    draw = ImageDraw.Draw(sheet)
    draw.rectangle((0, 0, width, header), fill="#1F2A44")
    title_font = font(24)
    while draw.textlength(title, font=title_font) > width - 2 * pad and len(title) > 12:
        title = title[:-5] + "…"
    draw.text((pad, 14), title, font=title_font, fill="white")

    y = header + pad
    if banner:
        resized = banner.resize((width - 2 * pad, banner_height - pad), Image.LANCZOS)
        sheet.paste(resized, (pad, y))
        y += banner_height
    if logo:
        size = cell // 2
        sheet.paste(logo.resize((size, size), Image.LANCZOS), (pad, y))
        draw.text((pad + size + pad, y + size // 2), "logo", font=font(18), fill="#1F2A44")
        y += logo_height

    for index, image in enumerate(images):
        col, row = index % columns, index // columns
        box = image.copy()
        box.thumbnail((cell, cell), Image.LANCZOS)
        x = pad + col * (cell + pad) + (cell - box.width) // 2
        sheet.paste(box, (x, y + row * (cell + pad) + (cell - box.height) // 2))

    sheet.save(out_path, quality=88, optimize=True)
    print(f"  ✅ {os.path.relpath(out_path, ROOT)} ({os.path.getsize(out_path) // 1024} Ko)")


def main():
    with open(SOURCES, encoding="utf-8") as handle:
        data = json.load(handle)

    lines = [
        "# Inspiration boutiques Etsy",
        "",
        f"Images publiques relevées le {data.get('date', '2026-09-15')} sur etsy.com, pour observation interne.",
        "",
        "⚠️ Ces visuels appartiennent à leurs boutiques : ne jamais les republier ni les réutiliser.",
        "L'analyse est dans [docs/ETSY_BRAND_MARKET_ANALYSIS.md](../docs/ETSY_BRAND_MARKET_ANALYSIS.md).",
        "",
    ]

    for shop in data["shops"]:
        name = shop["name"]
        print(name)
        folder = os.path.join(OUT, name)
        banner_path = logo_path = None
        if shop.get("banner"):
            banner_path = os.path.join(folder, "banniere.jpg")
            if not download(shop["banner"], banner_path):
                banner_path = None
        if shop.get("logo"):
            logo_path = os.path.join(folder, "logo.jpg")
            if not download(shop["logo"], logo_path):
                logo_path = None
        thumbs = []
        for number, url in enumerate(shop.get("thumbs", []), start=1):
            path = os.path.join(folder, "fiches", f"{number:02d}.jpg")
            if download(url, path):
                thumbs.append(path)
        sheet = os.path.join(OUT, f"planche-boutique-{name}.jpg")
        contact_sheet(f"{name} — boutique  ·  {shop.get('note', '')}", banner_path, logo_path, thumbs, sheet)
        lines.append(f"- **{name}** — [planche](planche-boutique-{name}.jpg) · {shop.get('note', '')}")

    lines += ["", "## Fiches phares", ""]
    for listing in data["listings"]:
        key = listing["key"]
        print(key)
        folder = os.path.join(OUT, listing["shop"], "galerie-" + key)
        images = []
        for number, url in enumerate(listing["images"], start=1):
            path = os.path.join(folder, f"{number:02d}.jpg")
            if download(url, path):
                images.append(path)
        sheet = os.path.join(OUT, f"planche-fiche-{listing['shop']}-{key}.jpg")
        contact_sheet(f"{listing['shop']} — {listing['title']}", None, None, images, sheet)
        lines.append(
            f"- **{listing['shop']} — {listing['title']}** — "
            f"[planche](planche-fiche-{listing['shop']}-{key}.jpg) · {listing.get('note', '')}"
        )

    with open(os.path.join(OUT, "INDEX.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")
    print("INDEX.md écrit")


if __name__ == "__main__":
    main()
