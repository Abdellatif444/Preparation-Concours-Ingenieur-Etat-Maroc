#!/usr/bin/env python3
"""
flow_parser.py — Parser des fichiers visual_plan/*.md
Extrait chaque fiche image (packs de coloriage) avec son id, nom de fichier cible, ratio, prompt, et statut.
Norme des fiches : docs/PROMPT_STANDARD.md
"""

import os
import re
import json
import glob

def resolve_paths(custom_docs_dir=None, custom_images_dir=None):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, "..", ".."))
    
    docs_dir = custom_docs_dir
    if not docs_dir or not os.path.isdir(docs_dir):
        cand1 = os.path.join(project_root, "visual_plan")
        cand2 = os.path.join(project_root, "docs", "visual_plan")
        docs_dir = cand1 if os.path.isdir(cand1) else cand2

    images_dir = custom_images_dir or os.path.join(project_root, "images")
    os.makedirs(images_dir, exist_ok=True)
    return docs_dir, images_dir

def parse_visual_plans(docs_dir=None, images_dir=None):
    docs_dir, images_dir = resolve_paths(docs_dir, images_dir)
    
    plan_files = [
        ("flow_concours_mef.md", "Flow Concours MEF"),
    ]

    # Auto-discover any additional flow or coloring markdown files
    if os.path.isdir(docs_dir):
        known = {f[0].lower() for f in plan_files}
        for item in sorted(os.listdir(docs_dir)):
            if item.endswith(".md") and item.lower() not in known:
                label = os.path.splitext(item)[0].replace("-", " ").replace("_", " ").title()
                plan_files.append((item, label))
    
    existing_images = set()
    if os.path.isdir(images_dir):
        for f in os.listdir(images_dir):
            existing_images.add(f.lower())

    all_prompts = []
    global_id = 1

    for filename, flow_label in plan_files:
        file_path = os.path.join(docs_dir, filename)
        if not os.path.exists(file_path):
            continue

        with open(file_path, "r", encoding="utf-8") as fp:
            content = fp.read()

        # Check if file has IMG-REPORT sections
        if "IMG-REPORT-" in content:
            # Extract table mapping ID -> short concise visual title
            table_titles = {}
            for row in re.findall(r'\|\s*\*\*?(IMG-REPORT-\d+)\*\*?\s*\|\s*[^|]+\|\s*[^|]+\|\s*([^|]+)\|', content):
                clean_t = row[1].strip().replace('$\\rightarrow$', '→').replace('\\rightarrow', '→')
                table_titles[row[0].strip()] = clean_t

            sections = re.split(r'\n(?=##+\s+IMG-REPORT-)', content)
            for sec in sections:
                header_match = re.search(r'##+\s+(IMG-REPORT-\d+)', sec)
                if not header_match:
                    continue
                img_id_str = header_match.group(1)

                fn_match = re.search(r'\*\*Nom du fichier\s*:\*\*\s*`?(?:images/)?([^`\n\r]+)`?', sec)
                if fn_match:
                    canonical_filename = fn_match.group(1).strip()
                else:
                    canonical_filename = f"{img_id_str.lower().replace('-', '_')}.png"
                raw_filename = canonical_filename

                sec_match = re.search(r'\*\*Section\s*:\*\*\s*\n?([^\n\r*]+)', sec)
                where_to_use = sec_match.group(1).strip() if sec_match else ""

                obj_match = re.search(r'\*\*Objectif visuel\s*:\*\*\s*\n?([^\n\r*]+)', sec)
                purpose = obj_match.group(1).strip() if obj_match else ""

                short_title = table_titles.get(img_id_str, "")
                if short_title:
                    clean_name = f"[{img_id_str}] {short_title}"
                else:
                    clean_name = f"[{img_id_str}]"

                type_m = re.search(r'\*\*Type\s*:\*\*\s*\n?([^\n\r*]+)', sec)
                visual_type = type_m.group(1).strip() if type_m else "infographic"

                ratio_m = re.search(r'\*\*Ratio\s*:\*\*\s*\n?([0-9]+:[0-9]+)', sec)
                ratio = ratio_m.group(1).strip() if ratio_m else "16:9"

                prompt_m = re.search(r'\*\*Prompt Flow\s*:\*\*\s*\n```[a-zA-Z]*\n([\s\S]*?)\n```', sec)
                prompt_text = prompt_m.group(1).strip() if prompt_m else ""

                prio_m = re.search(r'\*\*Priorit[ée]\s*:\*\*\s*\n?([^\n\r*]+)', sec)
                priority = prio_m.group(1).strip() if prio_m else ""

                file_exists = (canonical_filename.lower() in existing_images) or (raw_filename.lower() in existing_images)

                all_prompts.append({
                    "id": global_id,
                    "code_id": img_id_str,
                    "file_source": filename,
                    "flow_label": flow_label,
                    "chapter_label": where_to_use or flow_label,
                    "raw_filename": raw_filename,
                    "filename": canonical_filename,
                    "name": clean_name,
                    "purpose": purpose,
                    "where_to_use": where_to_use,
                    "visual_type": visual_type,
                    "ratio": ratio,
                    "priority": priority,
                    "prompt": prompt_text,
                    "status": "done" if file_exists else "pending",
                    "image_path": f"/images/{canonical_filename}" if file_exists else None
                })
                global_id += 1
            continue

        sections = re.split(r'\n(?=### Image )', content)
        
        for sec in sections:
            if not sec.strip().startswith("### Image"):
                continue

            header_match = re.search(r'### Image\s+(\d+)\s+—\s+`?([^`\n]+)`?', sec)
            if not header_match:
                continue

            img_num_str, raw_filename = header_match.groups()
            
            canonical_filename = raw_filename.strip()
            if canonical_filename.endswith(".jpg"):
                canonical_filename = canonical_filename[:-4] + ".jpeg"
            elif not canonical_filename.endswith(".jpeg") and not canonical_filename.endswith(".png"):
                canonical_filename += ".jpeg"

            name_m = re.search(r'-\s+\*\*Name:\*\*\s*(.+)', sec)
            name = name_m.group(1).strip() if name_m else raw_filename

            purpose_m = re.search(r'-\s+\*\*Purpose:\*\*\s*(.+)', sec)
            purpose = purpose_m.group(1).strip() if purpose_m else ""

            where_m = re.search(r'-\s+\*\*Where to use:\*\*\s*(.+)', sec)
            where_to_use = where_m.group(1).strip() if where_m else ""

            type_m = re.search(r'-\s+\*\*Visual type:\*\*\s*(.+)', sec)
            visual_type = type_m.group(1).strip() if type_m else "diagram"

            ratio_m = re.search(r'-\s+\*\*Size/ratio:\*\*\s*([0-9]+:[0-9]+)', sec)
            ratio = ratio_m.group(1).strip() if ratio_m else "16:9"

            prompt_m = re.search(r'-\s+\*\*Prompt\s*\(English\):\*\*\s*\n```[a-zA-Z]*\n([\s\S]*?)\n```', sec)
            prompt_text = ""
            if prompt_m:
                prompt_text = prompt_m.group(1).strip()
            else:
                prompt_fallback = re.search(r'Prompt[\s\S]*?```[a-zA-Z]*\n([\s\S]*?)\n```', sec)
                if prompt_fallback:
                    prompt_text = prompt_fallback.group(1).strip()

            file_exists = (canonical_filename.lower() in existing_images) or (raw_filename.lower() in existing_images)
            
            chapter_m = re.findall(r'##+ (?:Chapter \d+|FLOW \d+|Part [IVX]+)[^\n]*', content[:content.find(sec)])
            chapter_label = chapter_m[-1].strip('# ') if chapter_m else flow_label

            all_prompts.append({
                "id": global_id,
                "file_source": filename,
                "flow_label": flow_label,
                "chapter_label": chapter_label,
                "raw_filename": raw_filename,
                "filename": canonical_filename,
                "name": name,
                "purpose": purpose,
                "where_to_use": where_to_use,
                "visual_type": visual_type,
                "ratio": ratio,
                "prompt": prompt_text,
                "status": "done" if file_exists else "pending",
                "image_path": f"/images/{canonical_filename}" if file_exists else None
            })
            global_id += 1

    return all_prompts

if __name__ == "__main__":
    docs_dir, images_dir = resolve_paths()
    prompts = parse_visual_plans(docs_dir, images_dir)
    print(f"Docs dir: {docs_dir}")
    print(f"Images dir: {images_dir}")
    print(f"Total parsed prompts: {len(prompts)}")
    done_count = sum(1 for p in prompts if p["status"] == "done")
    pending_count = len(prompts) - done_count
    print(f"Done: {done_count}, Pending: {pending_count}")

