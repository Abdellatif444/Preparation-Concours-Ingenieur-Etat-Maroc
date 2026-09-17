"""brand_build.py — Reconstruit tous les visuels finaux de la marque depuis brand/sources/.

Règle : `brand/sources/` ne contient que les images générées dans Flow et n'est JAMAIS modifié.
Tout ce qui est publiable est (re)produit dans `brand/`, et les images de contrôle dans `brand/checks/`.

Le texte (nom, promesse, slogan) est déjà écrit dans les images sources par Flow :
le script ne fait que recadrer, mettre aux bonnes tailles et caler le fond.
Utiliser --ecrire-texte seulement si une source est fournie sans texte.

Sorties dans brand/ :
  pagewhim-logo-1000.png             logo complet (Etsy demande au moins 500×500)
  pagewhim-logo-500.png              même logo en 500 px
  pagewhim-logo-icone-500.png        version simplifiée, lisible en tout petit
  pagewhim-banner-3360x840.jpg       grande bannière Etsy (Big Banner)
  pagewhim-banner-mini-1200x160.jpg  mini bannière Etsy
  pagewhim-about-pages.jpg           photo « About » (3 pages réelles), 1520×936

Sorties dans brand/checks/ :
  apercu-mobile.jpg                  les 40 % centraux de la bannière, seuls visibles sur téléphone
  logo-tailles.png                   le logo et l'icône à 260, 96 et 48 px

Usage : python tools/brand_build.py [--banniere entier|bande] [--ecrire-texte]
"""
import argparse
import os
import sys

from PIL import Image

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
BRAND = os.path.join(ROOT, "brand")
SOURCES = os.path.join(BRAND, "sources")
CHECKS = os.path.join(BRAND, "checks")
sys.path.insert(0, TOOLS)

import banner_finish  # noqa: E402
import brand_assets  # noqa: E402
import logo_finish  # noqa: E402

MINI = (1200, 160)


def newest(prefixes):
    """Dernier fichier source dont le nom commence par l'un des préfixes."""
    candidates = [
        os.path.join(SOURCES, name)
        for name in sorted(os.listdir(SOURCES))
        if any(name.lower().startswith(prefix) for prefix in prefixes)
    ]
    return max(candidates, key=os.path.getmtime) if candidates else None


def save(image, name, **options):
    path = os.path.join(BRAND, name)
    image.save(path, **options)
    print(f"  {name}: {image.width}×{image.height} px, {os.path.getsize(path) // 1024} Ko")


def build_logo(source, ecrire_texte):
    print(f"Logo  ← {os.path.relpath(source, ROOT)}")
    logo = logo_finish.build_logo(source, 1000, 0.712, 0.830, ecrire_texte=ecrire_texte)
    save(logo, "pagewhim-logo-1000.png", optimize=True)
    save(logo.resize((500, 500), Image.LANCZOS), "pagewhim-logo-500.png", optimize=True)
    icon = logo_finish.build_icon(500)
    save(icon, "pagewhim-logo-icone-500.png", optimize=True)

    os.makedirs(CHECKS, exist_ok=True)
    sheet = Image.new("RGB", (490, 560), "white")
    for row, image in enumerate((logo, icon)):
        y = row * 280
        sheet.paste(image.resize((260, 260), Image.LANCZOS), (10, y))
        sheet.paste(image.resize((96, 96), Image.LANCZOS), (290, y))
        sheet.paste(image.resize((48, 48), Image.LANCZOS), (400, y))
    sheet.save(os.path.join(CHECKS, "logo-tailles.png"))
    print("  checks/logo-tailles.png")


def build_banner(source, mode, ecrire_texte):
    print(f"Bannière  ← {os.path.relpath(source, ROOT)} [{mode}]")
    scene = Image.open(source).convert("RGB")
    banner, panel = banner_finish.mode_bande(scene, 60) if mode == "bande" else banner_finish.mode_entier(scene)
    if ecrire_texte:
        banner = banner_finish.write_sign(banner, panel)
    save(banner, "pagewhim-banner-3360x840.jpg", quality=92, optimize=True)

    # Mini bannière : bande centrée sur le panneau, au ratio 7,5:1.
    height = round(banner.width / (MINI[0] / MINI[1]))
    center_y = (panel[1] + panel[3]) / 2
    top = max(0, min(round(center_y - height / 2), banner.height - height))
    mini = banner.crop((0, top, banner.width, top + height)).resize(MINI, Image.LANCZOS)
    save(mini, "pagewhim-banner-mini-1200x160.jpg", quality=92, optimize=True)

    os.makedirs(CHECKS, exist_ok=True)
    preview = banner.crop((round(banner.width * 0.30), 0, round(banner.width * 0.70), banner.height))
    preview.save(os.path.join(CHECKS, "apercu-mobile.jpg"), quality=88)
    print("  checks/apercu-mobile.jpg")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--banniere", choices=["entier", "bande"], default="entier")
    parser.add_argument("--ecrire-texte", action="store_true",
                        help="écrire le nom et la promesse (seulement si la source n'a pas de texte)")
    parser.add_argument("--source-logo", default=None)
    parser.add_argument("--source-banniere", default=None)
    args = parser.parse_args()

    os.makedirs(BRAND, exist_ok=True)
    logo_source = args.source_logo or newest(["logo"])
    banner_source = args.source_banniere or newest(["banniere", "banner"])

    if logo_source:
        build_logo(logo_source, args.ecrire_texte)
    else:
        print("Logo : aucune source dans brand/sources/")
    if banner_source:
        build_banner(banner_source, args.banniere, args.ecrire_texte)
    else:
        print("Bannière : aucune source dans brand/sources/")

    print("Photo « About »  ← images/ (pages réelles)")
    save(brand_assets.build_about_photo(), "pagewhim-about-pages.jpg", quality=90, optimize=True)


if __name__ == "__main__":
    main()
