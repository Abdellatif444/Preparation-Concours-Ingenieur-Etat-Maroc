#!/usr/bin/env python3
"""
md_to_pdf.py — Convertit un document Markdown de docs/ en PDF imprimable (A4).

Sans dépendance Python externe : le Markdown est converti en HTML (sous-ensemble utilisé
dans docs/ : titres, paragraphes, listes, tableaux, citations, blocs de code, liens,
gras, italique, code), puis imprimé en PDF par Chrome ou Edge en mode headless.

Usage (depuis la racine du projet) :
    python tools/md_to_pdf.py docs/ETSY_SHOP_SETUP_MOROCCO.md docs/ETSY_SHOP_SETUP_MOROCCO.pdf
"""

import html
import os
import re
import subprocess
import sys
import tempfile

BROWSER_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

CSS = """
@page { size: A4; margin: 16mm 14mm 18mm 14mm; }
body { font-family: "Segoe UI", "Helvetica Neue", Arial, "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
       font-size: 10.5pt; line-height: 1.5; color: #1f2328; }
h1 { font-size: 20pt; color: #a4410e; border-bottom: 3px solid #f1641e; padding-bottom: 6px; margin-top: 0; }
h2 { font-size: 15pt; color: #222; border-bottom: 1px solid #d0d7de; padding-bottom: 4px;
     margin-top: 22px; break-after: avoid; }
h3 { font-size: 12pt; color: #333; margin-top: 16px; break-after: avoid; }
h4 { font-size: 10.5pt; color: #333; margin: 14px 0 6px; break-after: avoid; }
p, li { orphans: 3; widows: 3; }
table { border-collapse: collapse; width: 100%; margin: 8px 0 12px; font-size: 9.5pt; break-inside: auto; }
tr { break-inside: avoid; }
th, td { border: 1px solid #d0d7de; padding: 5px 7px; text-align: left; vertical-align: top; }
th { background: #f6f1eb; }
blockquote { margin: 10px 0; padding: 8px 12px; background: #fff8f0; border-left: 4px solid #f1641e; color: #333; }
blockquote p { margin: 3px 0; }
code { font-family: Consolas, "Courier New", monospace; font-size: 9pt; background: #f3f4f6;
       padding: 1px 4px; border-radius: 3px; }
pre { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 4px; padding: 8px 10px;
      white-space: pre-wrap; break-inside: avoid; }
pre code { background: none; padding: 0; }
a { color: #0b5cad; text-decoration: none; }
hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
ul { padding-left: 20px; }
ul.checklist { list-style: none; padding-left: 4px; }
"""


def slugify(text):
    """Identifiant d'ancre compatible avec les liens de sommaire GitHub."""
    text = re.sub(r"<[^>]+>", "", text).strip().lower()
    text = re.sub(r"[^\w\- ]", "", text)
    return text.replace(" ", "-")


def inline(text):
    """Convertit le Markdown en ligne (code, liens, gras, italique) en HTML échappé."""
    codes = []

    def keep_code(m):
        codes.append("<code>%s</code>" % html.escape(m.group(1)))
        return "\x00%d\x00" % (len(codes) - 1)

    text = re.sub(r"`([^`]+)`", keep_code, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", lambda m: '<a href="%s">%s</a>' % (m.group(2), m.group(1)), text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    return re.sub(r"\x00(\d+)\x00", lambda m: codes[int(m.group(1))], text)


def split_row(line):
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def markdown_to_html(md):
    lines = md.splitlines()
    out = []
    i = 0
    paragraph = []

    def flush_paragraph():
        if paragraph:
            out.append("<p>%s</p>" % inline(" ".join(paragraph)))
            paragraph.clear()

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            flush_paragraph()
            block = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block.append(lines[i])
                i += 1
            out.append("<pre><code>%s</code></pre>" % html.escape("\n".join(block)))
            i += 1
            continue

        if not stripped:
            flush_paragraph()
            i += 1
            continue

        heading = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if heading:
            flush_paragraph()
            level, title = len(heading.group(1)), heading.group(2)
            out.append('<h%d id="%s">%s</h%d>' % (level, slugify(title), inline(title), level))
            i += 1
            continue

        if re.match(r"^-{3,}$", stripped):
            flush_paragraph()
            out.append("<hr>")
            i += 1
            continue

        if stripped.startswith("|") and i + 1 < len(lines) and re.match(r"^\|?\s*:?-{3,}", lines[i + 1].strip()):
            flush_paragraph()
            header = split_row(stripped)
            rows = []
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            out.append("<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>" % (
                "".join("<th>%s</th>" % inline(c) for c in header),
                "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in row) for row in rows),
            ))
            continue

        if stripped.startswith(">"):
            flush_paragraph()
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].strip())
                i += 1
            out.append("<blockquote>%s</blockquote>" % "".join("<p>%s</p>" % inline(q) for q in quote if q))
            continue

        list_item = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)
        if list_item:
            flush_paragraph()
            ordered = list_item.group(2)[0].isdigit()
            tag = "ol" if ordered else "ul"
            html_list = ["<%s>" % tag]
            depth_open = False
            while i < len(lines):
                item = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", lines[i])
                if not item:
                    break
                nested = len(item.group(1)) >= 2
                if nested and not depth_open:
                    html_list[-1] = html_list[-1].replace("</li>", "") + "<ul>"
                    depth_open = True
                elif not nested and depth_open:
                    html_list.append("</ul></li>")
                    depth_open = False
                html_list.append("<li>%s</li>" % inline(item.group(3)))
                i += 1
            if depth_open:
                html_list.append("</ul></li>")
            html_list.append("</%s>" % tag)
            if not ordered and all(li.startswith("<li>☐") for li in html_list if li.startswith("<li>")):
                html_list[0] = '<ul class="checklist">'
            out.append("".join(html_list))
            continue

        paragraph.append(stripped)
        i += 1

    flush_paragraph()
    return "\n".join(out)


def find_browser():
    for path in BROWSER_CANDIDATES:
        if os.path.isfile(path):
            return path
    sys.exit("Chrome ou Edge introuvable : installez l'un des deux ou ajoutez son chemin dans BROWSER_CANDIDATES.")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    source, target = (os.path.abspath(p) for p in sys.argv[1:3])

    with open(source, "r", encoding="utf-8") as f:
        md = f.read()
    title_match = re.search(r"^#\s+(.+)$", md, re.M)
    title = html.escape(title_match.group(1)) if title_match else os.path.basename(source)
    document = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>%s</title><style>%s</style></head><body>%s</body></html>' % (
        title, CSS, markdown_to_html(md))

    with tempfile.TemporaryDirectory() as tmp:
        html_path = os.path.join(tmp, "document.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(document)
        if os.path.exists(target):
            os.remove(target)
        subprocess.run([
            find_browser(), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
            "--user-data-dir=" + os.path.join(tmp, "profile"),
            "--print-to-pdf=" + target, "file:///" + html_path.replace("\\", "/"),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)

    if not os.path.isfile(target) or os.path.getsize(target) == 0:
        sys.exit("Échec : le PDF n'a pas été créé.")
    print("PDF généré : %s (%d Ko)" % (target, os.path.getsize(target) // 1024))


if __name__ == "__main__":
    main()
