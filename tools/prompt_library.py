#!/usr/bin/env python3
"""
prompt_library.py — Bibliothèque de prompts Pagewhim.

Familles de prompts (prompt_library/families/*.json) → contrôle → génération d'un volume
au format visual_plan/ lu par le hub. Le registre prompt_library/ledger.json mémorise les
scènes et combinaisons utilisées par chaque volume : un volume ne répète jamais un autre.

Usage (depuis la racine du projet) :
    python tools/prompt_library.py list
    python tools/prompt_library.py check
    python tools/prompt_library.py show cozy-tiny-worlds
    python tools/prompt_library.py build cozy-tiny-worlds --volume 1 --dry-run
    python tools/prompt_library.py build cozy-tiny-worlds --volume 1

Stratégie et justification du volume : docs/PROMPT_LIBRARY_STRATEGY.md
"""

import argparse
import json
import os
import random
import re
import sys
from collections import Counter
from datetime import date

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LIB_DIR = os.path.join(ROOT, "prompt_library")
FAMILIES_DIR = os.path.join(LIB_DIR, "families")
STYLES_FILE = os.path.join(LIB_DIR, "styles.json")
LEDGER_FILE = os.path.join(LIB_DIR, "ledger.json")
PLAN_DIR = os.path.join(ROOT, "visual_plan")

REQUIRED_FIELDS = [
    "id", "code", "name", "category", "niche", "theme", "audience", "difficulty", "style",
    "product", "season", "priority", "market_evidence", "repetition_risks", "variation_rules",
    "bundle_paths", "compositions", "avoid", "scenes", "remix",
]
REMIX_KEYS = ("characters", "activities", "places", "details")
DEFAULT_TEMPLATE = "{character} {activity} in {place}, with {detail}."
# Personnages et marques protégés : jamais dans une famille (propriété intellectuelle, règles Etsy)
PROTECTED_NAMES = re.compile(
    r"\b(disney|pixar|marvel|pok[eé]mon|hello kitty|sanrio|barbie|minecraft|harry potter|hogwarts|"
    r"frozen|elsa|stitch|winnie|pooh|toy story|mickey|minnie|peppa|bluey|paw patrol|sonic|mario|"
    r"zelda|ghibli|totoro|star wars|spider-?man|batman|lego|squishmallow)\b",
    re.IGNORECASE,
)
NEAR_DUPLICATE = 0.6  # part de mots communs au-delà de laquelle deux scènes se ressemblent trop
STOPWORDS = set(
    "a an the and with of in on at to for from by its his her their is are one two three four five six "
    "big large small little tiny some few few near next into onto over under around each that this".split()
)


def read_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def load_styles():
    return read_json(STYLES_FILE)


def load_families():
    families = {}
    for name in sorted(os.listdir(FAMILIES_DIR)):
        if name.endswith(".json"):
            data = read_json(os.path.join(FAMILIES_DIR, name))
            data["_file"] = name
            families[data.get("id", name)] = data
    return families


def load_ledger():
    return read_json(LEDGER_FILE) if os.path.isfile(LEDGER_FILE) else {}


def keywords(text):
    return {w for w in re.findall(r"[a-z]+", text.lower()) if len(w) > 2 and w not in STOPWORDS}


def similarity(a, b):
    wa, wb = keywords(a), keywords(b)
    return len(wa & wb) / len(wa | wb) if wa and wb else 0.0


def remix_capacity(family):
    remix = family["remix"]
    return len(remix["characters"]) * len(remix["activities"]) * len(remix["places"])


def slugify(text, limit=40):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    slug = re.sub(r"^(a|an|the)-", "", slug)
    return slug[:limit].rstrip("-") or "page"


def check_family(family, styles):
    """Erreurs bloquantes et avertissements d'une famille."""
    errors, warnings = [], []
    missing = [field for field in REQUIRED_FIELDS if field not in family]
    if missing:
        return [f"champs manquants : {', '.join(missing)}"], warnings
    if family["style"] not in styles["styles"]:
        errors.append(f"style inconnu : {family['style']}")
    if family["difficulty"] not in styles["levels"]:
        errors.append(f"niveau inconnu : {family['difficulty']}")
    for composition in family["compositions"]:
        if composition not in styles["compositions"]:
            errors.append(f"composition inconnue : {composition}")
    for key in REMIX_KEYS:
        if len(family["remix"].get(key, [])) < 6:
            errors.append(f"remix.{key} : au moins 6 éléments requis")
    if errors:
        return errors, warnings

    pages = family["product"]["pages_per_volume"]
    volumes = family["product"]["volumes_planned"]
    scenes = family["scenes"]
    if len(scenes) < pages:
        errors.append(f"{len(scenes)} scènes rédigées pour {pages} pages par volume")
    if len(scenes) + remix_capacity(family) < pages * volumes:
        errors.append("capacité insuffisante pour les volumes prévus")
    for title, count in Counter(scene["t"].strip().lower() for scene in scenes).items():
        if count > 1:
            errors.append(f"titre de scène en double : {title}")
    for i in range(len(scenes)):
        for j in range(i + 1, len(scenes)):
            score = similarity(scenes[i]["s"], scenes[j]["s"])
            if score >= NEAR_DUPLICATE:
                warnings.append(f"scènes proches ({score:.0%}) : « {scenes[i]['t']} » et « {scenes[j]['t']} »")
    match = PROTECTED_NAMES.search(json.dumps({k: v for k, v in family.items() if k != "_file"}, ensure_ascii=False))
    if match:
        errors.append(f"nom protégé interdit : {match.group(0)}")
    return errors, warnings


def build_prompt(family, styles, subject, composition):
    level = styles["levels"][family["difficulty"]]
    style = styles["styles"][family["style"]]
    subject = subject.strip()
    if not subject.endswith("."):
        subject += "."
    return "\n\n".join([
        f"{style['block']} Difficulty: {level['cue']}.",
        f"Subject: {subject}",
        f"Composition: {styles['compositions'][composition]}; the whole drawing stays inside the page with an empty white margin on all four borders.",
        f"Avoid: {family['avoid']}, {styles['avoid_common']}.",
    ])


def used_keys(entry, current_volume):
    """Scènes et combinaisons déjà prises par les autres volumes de la famille."""
    scenes, remix = set(), set()
    for volume, info in entry.get("volumes", {}).items():
        if volume != current_volume:
            scenes.update(info.get("scenes", []))
            remix.update(info.get("remix", []))
    return scenes, remix


def pick_pages(family, used_scenes, used_remix, pages, rng):
    """Scènes rédigées d'abord (dans l'ordre), puis combinaisons remix réparties sans répétition."""
    picked = []
    for index, scene in enumerate(family["scenes"]):
        if len(picked) == pages:
            break
        if index not in used_scenes:
            picked.append({"kind": "scene", "key": index, "title": scene["t"], "subject": scene["s"]})

    remix = family["remix"]
    template = family.get("remix_template", DEFAULT_TEMPLATE)
    combos = [(c, a, p) for c in range(len(remix["characters"]))
              for a in range(len(remix["activities"])) for p in range(len(remix["places"]))]
    rng.shuffle(combos)
    counts = {"c": Counter(), "a": Counter(), "p": Counter()}
    taken = set()
    while len(picked) < pages:
        best, best_score = None, None
        for c, a, p in combos:
            key = f"{c}-{a}-{p}"
            if key in used_remix or key in taken:
                continue
            # Répartition : le personnage, l'activité et le lieu les moins utilisés dans ce volume passent d'abord
            score = counts["c"][c] + counts["a"][a] + counts["p"][p]
            if best is None or score < best_score:
                best, best_score = (c, a, p), score
                if score == 0:
                    break
        if best is None:
            break
        c, a, p = best
        key = f"{c}-{a}-{p}"
        taken.add(key)
        counts["c"][c] += 1
        counts["a"][a] += 1
        counts["p"][p] += 1
        detail = remix["details"][len(picked) % len(remix["details"])]
        subject = template.format(character=remix["characters"][c], activity=remix["activities"][a],
                                  place=remix["places"][p], detail=detail)
        title = f"{remix['characters'][c]} — {remix['activities'][a]}"
        picked.append({"kind": "remix", "key": key, "title": title[:1].upper() + title[1:70],
                       "subject": subject[:1].upper() + subject[1:]})
    return picked


def render_plan(family, styles, volume, picked):
    level = styles["levels"][family["difficulty"]]
    style = styles["styles"][family["style"]]
    today = date.today().isoformat()
    lines = [
        f"# Visual Plan — {family['name']} — Volume {volume}",
        "",
        f"Généré depuis `prompt_library/families/{family['_file']}` par `tools/prompt_library.py` le {today}. "
        "Ne pas modifier à la main : corriger la famille, puis régénérer le volume.",
        "",
        f"- **Catégorie :** {family['category']} · **Niche :** {family['niche']}",
        f"- **Public :** {', '.join(family['audience'])} · **Difficulté :** {family['difficulty']} — {level['label']}",
        f"- **Style :** {style['name']} · **Pages :** {len(picked)}",
    ]
    if not level.get("hub_metrics_ready"):
        lines += ["", f"> ⚠️ Niveau {family['difficulty']} : les mesures automatiques du hub visent encore le niveau L3. "
                  "Contrôler ces pages à l'œil jusqu'à la calibration de ce niveau."]
    lines += ["", "---", ""]
    for number, page in enumerate(picked, 1):
        composition = family["compositions"][(number - 1) % len(family["compositions"])]
        filename = f"col-{family['code']}-v{volume}-{number:02d}-{slugify(page['title'])}.png"
        origin = "scène de la bibliothèque" if page["kind"] == "scene" else "combinaison remix"
        lines += [
            f"### Image {number:02d} — `{filename}`",
            f"- **Name:** {page['title']}",
            f"- **Purpose:** {family['name']}, volume {volume}, page {number} ({origin}).",
            f"- **Where to use:** Page {number} du livret « {family['name']} — Vol. {volume} ».",
            "- **Visual type:** coloring page line art (clean black and white)",
            "- **Background:** pure white (#FFFFFF, flat solid white background, zero texture, zero shading)",
            "- **Size/ratio:** 3:4 (vertical portrait)",
            "- **Prompt (English):**",
            "```",
            build_prompt(family, styles, page["subject"], composition),
            "```",
            "",
            "---",
            "",
        ]
    return "\n".join(lines)


def cmd_list(_args):
    styles, families, ledger = load_styles(), load_families(), load_ledger()
    rows = [("Famille", "Niv.", "Style", "Public", "Pages×vol.", "Scènes", "Capacité", "Volumes", "Hub")]
    total_scenes = total_pages = 0
    for family in sorted(families.values(), key=lambda f: (f.get("priority", 9), f["id"])):
        level = styles["levels"].get(family.get("difficulty"), {})
        pages = family["product"]["pages_per_volume"]
        volumes = family["product"]["volumes_planned"]
        done = len(ledger.get(family["id"], {}).get("volumes", {}))
        total_scenes += len(family["scenes"])
        total_pages += pages * volumes
        rows.append((family["id"], family["difficulty"], family["style"], ", ".join(family["audience"]),
                     f"{pages}×{volumes}", str(len(family["scenes"])),
                     str(len(family["scenes"]) + remix_capacity(family)), f"{done}/{volumes}",
                     "prêt" if level.get("hub_metrics_ready") else "à calibrer"))
    widths = [max(len(row[i]) for row in rows) for i in range(len(rows[0]))]
    for row in rows:
        print("  ".join(cell.ljust(width) for cell, width in zip(row, widths)))
    print(f"\n{len(families)} familles · {total_scenes} scènes rédigées · {total_pages} pages prévues sur les volumes planifiés")


def cmd_check(_args):
    styles, families = load_styles(), load_families()
    failed = False
    codes = Counter(family.get("code") for family in families.values())
    for code, count in codes.items():
        if count > 1:
            print(f"❌ code de famille utilisé {count} fois : {code}")
            failed = True
    for family_id, family in sorted(families.items()):
        errors, warnings = check_family(family, styles)
        status = "❌" if errors else ("⚠️ " if warnings else "✅")
        print(f"{status} {family_id} — {len(family.get('scenes', []))} scènes")
        for message in errors:
            print(f"    erreur : {message}")
        for message in warnings:
            print(f"    à revoir : {message}")
        failed = failed or bool(errors)
    sys.exit(1 if failed else 0)


def cmd_show(args):
    styles, families, ledger = load_styles(), load_families(), load_ledger()
    family = families.get(args.family)
    if not family:
        sys.exit(f"Famille inconnue : {args.family}. Familles : {', '.join(sorted(families))}")
    used_scenes, _ = used_keys(ledger.get(family["id"], {}), None)
    level = styles["levels"][family["difficulty"]]
    print(f"{family['name']} ({family['id']}, code {family['code']})")
    print(f"  Catégorie : {family['category']} · Niche : {family['niche']}")
    print(f"  Public : {', '.join(family['audience'])} · Niveau : {family['difficulty']} — {level['label']} · Style : {family['style']}")
    print(f"  Produit : {family['product']['pages_per_volume']} pages × {family['product']['volumes_planned']} volumes · Saison : {family['season']}")
    print("  Preuves marché :")
    for evidence in family["market_evidence"]:
        print(f"    - {evidence}")
    print("  Scènes (✓ = déjà utilisée par un volume) :")
    for index, scene in enumerate(family["scenes"]):
        print(f"    {'✓' if index in used_scenes else ' '} {index + 1:02d}. {scene['t']}")
    print(f"  Remix : {remix_capacity(family)} combinaisons possibles")


def cmd_build(args):
    styles, families, ledger = load_styles(), load_families(), load_ledger()
    family = families.get(args.family)
    if not family:
        sys.exit(f"Famille inconnue : {args.family}. Familles : {', '.join(sorted(families))}")
    errors, _ = check_family(family, styles)
    if errors:
        print("❌ Famille invalide :")
        for message in errors:
            print(f"  - {message}")
        sys.exit(1)

    entry = ledger.get(family["id"], {"volumes": {}})
    volume_key = str(args.volume)
    if volume_key in entry["volumes"] and not args.force:
        sys.exit(f"Le volume {args.volume} de {family['id']} existe déjà ({entry['volumes'][volume_key]['file']}). "
                 "Option --force pour le régénérer.")
    pages = args.pages or family["product"]["pages_per_volume"]
    used_scenes, used_remix = used_keys(entry, volume_key)
    picked = pick_pages(family, used_scenes, used_remix, pages, random.Random(f"{family['id']}-v{args.volume}"))
    if len(picked) < pages:
        sys.exit(f"Capacité épuisée : {len(picked)} pages disponibles sur {pages}. Ajouter des scènes ou des éléments remix.")

    out = os.path.abspath(args.out) if args.out else os.path.join(PLAN_DIR, f"lib-{family['id']}-vol{args.volume}.md")
    relative = os.path.relpath(out, ROOT).replace("\\", "/")
    scene_count = sum(page["kind"] == "scene" for page in picked)
    print(f"{family['name']} — volume {args.volume} : {pages} pages ({scene_count} scènes rédigées, {pages - scene_count} remix).")
    if args.dry_run:
        print(f"Simulation : rien n'est écrit. Fichier prévu : {relative}")
        for number, page in enumerate(picked, 1):
            print(f"  {number:02d}. [{page['kind']}] {page['title']}")
        return
    if os.path.exists(out) and not args.force:
        sys.exit(f"{relative} existe déjà. Option --force pour l'écraser.")

    with open(out, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(render_plan(family, styles, args.volume, picked))
    entry["volumes"][volume_key] = {
        "file": relative,
        "pages": pages,
        "date": date.today().isoformat(),
        "scenes": sorted(page["key"] for page in picked if page["kind"] == "scene"),
        "remix": sorted(page["key"] for page in picked if page["kind"] == "remix"),
    }
    ledger[family["id"]] = entry
    write_json(LEDGER_FILE, ledger)
    print(f"✅ Écrit : {relative}. Le hub le charge automatiquement (actualiser la page du hub).")
    level = styles["levels"][family["difficulty"]]
    if not level.get("hub_metrics_ready"):
        print(f"⚠️ Niveau {family['difficulty']} ({level['label']}) : les mesures du hub visent encore L3 ; contrôler à l'œil.")


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    parser = argparse.ArgumentParser(description="Bibliothèque de prompts Pagewhim")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("list", help="lister les familles, leur capacité et les volumes générés")
    commands.add_parser("check", help="contrôler toutes les familles (champs, capacité, doublons, noms protégés)")
    show = commands.add_parser("show", help="afficher une famille et ses scènes")
    show.add_argument("family")
    build = commands.add_parser("build", help="générer un volume au format visual_plan/")
    build.add_argument("family")
    build.add_argument("--volume", type=int, required=True)
    build.add_argument("--pages", type=int, help="nombre de pages (par défaut : celui de la famille)")
    build.add_argument("--out", help="fichier de sortie (par défaut : visual_plan/lib-<famille>-vol<N>.md)")
    build.add_argument("--dry-run", action="store_true", help="afficher les pages choisies sans rien écrire")
    build.add_argument("--force", action="store_true", help="régénérer un volume existant")
    args = parser.parse_args()
    {"list": cmd_list, "check": cmd_check, "show": cmd_show, "build": cmd_build}[args.command](args)


if __name__ == "__main__":
    main()
