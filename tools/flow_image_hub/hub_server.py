#!/usr/bin/env python3
"""
hub_server.py — Serveur local du Flow Image Hub
Fournit une API REST pour lister les prompts des packs de coloriage, téléverser/renommer automatiquement les images générées,
et servir l'interface web locale avec support CORS pour Tampermonkey/Flow.
"""

import os
import sys
import io
import json
import mimetypes
import queue
import socket
import threading
import time
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
import flow_parser
from flow_parser import parse_visual_plans, resolve_paths
import coloring_metrics

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
DOCS_DIR, IMAGES_DIR = resolve_paths()
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
CONFIG_FILE = os.path.join(BASE_DIR, "flow_config.json")
VALIDATIONS_FILE = os.path.join(BASE_DIR, "validation_state.json")
LOG_FILE = os.path.join(PROJECT_ROOT, "docs", "quality_control_log.md")
EXPORTS_DIR = os.path.join(PROJECT_ROOT, "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

PORT = 8085


# ---------------------------------------------------------------------------
# Clic système réel (Windows) : SetCursorPos + mouse_event via ctypes, sans dépendance.
# Le processus est déclaré « DPI aware » pour que les coordonnées soient en pixels physiques,
# c'est-à-dire celles que le copilote calcule avec window.devicePixelRatio.
# ---------------------------------------------------------------------------
_OS_CLICK_LOCK = threading.Lock()


def _ensure_dpi_aware():
    if sys.platform != "win32":
        return
    try:
        import ctypes
        try:
            ctypes.windll.shcore.SetProcessDpiAwareness(2)   # PROCESS_PER_MONITOR_DPI_AWARE
        except Exception:
            ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass


_ensure_dpi_aware()


def _find_flow_window():
    """HWND de la fenêtre Chrome/Edge dont le titre contient « Flow » (ou None)."""
    import ctypes, ctypes.wintypes as wt
    user32 = ctypes.windll.user32
    found = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)
    def _cb(hwnd, _):
        if not user32.IsWindowVisible(hwnd):
            return True
        n = user32.GetWindowTextLengthW(hwnd)
        if not n:
            return True
        buf = ctypes.create_unicode_buffer(n + 1)
        user32.GetWindowTextW(hwnd, buf, n + 1)
        cls = ctypes.create_unicode_buffer(256)
        user32.GetClassNameW(hwnd, cls, 256)
        title = buf.value.replace("\xa0", " ")
        if "flow" in title.lower() and "chrome_widgetwin" in cls.value.lower():
            score = 2 if "google flow" in title.lower() else 1
            found.append((score, hwnd, title))
        return True

    user32.EnumWindows(_cb, 0)
    if not found:
        return None, None
    found.sort(key=lambda t: -t[0])
    return found[0][1], found[0][2]


def _find_render_widget(hwnd):
    """Zone de rendu de la page (Chrome/Edge) : descendant « Chrome_RenderWidgetHostHWND » le plus grand et visible."""
    import ctypes, ctypes.wintypes as wt
    user32 = ctypes.windll.user32
    found = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, wt.HWND, wt.LPARAM)
    def _cb(child, _):
        cls = ctypes.create_unicode_buffer(256)
        user32.GetClassNameW(child, cls, 256)
        if cls.value == "Chrome_RenderWidgetHostHWND" and user32.IsWindowVisible(child):
            r = wt.RECT()
            user32.GetWindowRect(child, ctypes.byref(r))
            found.append(((r.right - r.left) * (r.bottom - r.top), child, (r.left, r.top, r.right, r.bottom)))
        return True

    user32.EnumChildWindows(hwnd, _cb, 0)
    if not found:
        return None, None
    found.sort(key=lambda t: -t[0])
    return found[0][1], found[0][2]


def os_prepare_flow_window():
    """Restaure la fenêtre Flow si elle est réduite, SANS la mettre au premier plan."""
    if sys.platform != "win32":
        return {"success": False, "error": "Windows uniquement"}
    import ctypes, ctypes.wintypes as wt
    user32 = ctypes.windll.user32
    hwnd, title = _find_flow_window()
    if not hwnd:
        return {"success": False, "error": "fenêtre Flow introuvable (le titre de l'onglet doit contenir « Flow »)"}
    was_iconic = bool(user32.IsIconic(hwnd))
    if was_iconic:
        user32.ShowWindow(hwnd, 4)  # SW_SHOWNOACTIVATE : restaure sans activer
        time.sleep(0.4)
    rect = wt.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    return {"success": True, "title": title, "was_minimized": was_iconic,
            "rect": [rect.left, rect.top, rect.right, rect.bottom]}


def os_click(x, y, restore=True, method="post", client=None):
    """Clic réel sur la fenêtre Flow.

    method = "post"       : messages souris adressés à la fenêtre Chrome (ne vole pas le focus, fonctionne
                            même si la fenêtre est derrière une autre).
    method = "foreground" : passe Flow au premier plan, clique avec la souris, puis rend le premier plan
                            et le curseur à leur état précédent.
    x, y : coordonnées écran en pixels physiques (calculées par le copilote).
    """
    if sys.platform != "win32":
        return {"success": False, "error": "clic système disponible uniquement sous Windows"}
    import ctypes, ctypes.wintypes as wt
    user32 = ctypes.windll.user32
    MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP = 0x0002, 0x0004
    WM_MOUSEMOVE, WM_LBUTTONDOWN, WM_LBUTTONUP, MK_LBUTTON = 0x0200, 0x0201, 0x0202, 0x0001
    left, top = user32.GetSystemMetrics(76), user32.GetSystemMetrics(77)
    screen_w, screen_h = user32.GetSystemMetrics(78), user32.GetSystemMetrics(79)
    if method != "post" and not (left <= x < left + screen_w and top <= y < top + screen_h):
        return {"success": False, "error": f"coordonnées hors écran ({x}, {y})"}

    class POINT(ctypes.Structure):
        _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]

    hwnd, title = _find_flow_window()
    info = {"success": True, "x": x, "y": y, "method": method, "window": title,
            "screen": [screen_w, screen_h]}

    # Capture de débogage : croix rouge sur le point visé (tools/flow_image_hub/click_debug.png)
    try:
        from PIL import ImageGrab, ImageDraw
        shot = ImageGrab.grab(all_screens=True)
        draw = ImageDraw.Draw(shot)
        draw.line((x - 40, y, x + 40, y), fill=(255, 0, 0), width=3)
        draw.line((x, y - 40, x, y + 40), fill=(255, 0, 0), width=3)
        draw.ellipse((x - 18, y - 18, x + 18, y + 18), outline=(255, 0, 0), width=3)
        box = (max(0, x - 400), max(0, y - 250), min(shot.width, x + 400), min(shot.height, y + 250))
        shot.crop(box).save(os.path.join(BASE_DIR, "click_debug.png"))
    except Exception as e:
        info["debug"] = f"capture impossible : {e}"

    with _OS_CLICK_LOCK:
        if method == "post":
            if not hwnd:
                return {"success": False, "error": "fenêtre Flow introuvable pour le clic adressé"}
            # Cible : la zone de rendu de la page (descendant Chrome_RenderWidgetHostHWND).
            # Ses coordonnées client = celles du viewport de la page × devicePixelRatio : aucune
            # conversion écran n'est nécessaire, donc aucun décalage dû aux bordures ou aux onglets.
            target, target_rect = _find_render_widget(hwnd)
            info["render_widget"] = target_rect
            if target and client:
                cx, cy = int(client[0]), int(client[1])
            else:
                target = target or hwnd
                pt = POINT(x, y)
                user32.ScreenToClient(target, ctypes.byref(pt))
                cx, cy = pt.x, pt.y
            lparam = ((cy & 0xFFFF) << 16) | (cx & 0xFFFF)
            info["client"] = [cx, cy]
            info["target_is_render_widget"] = bool(target_rect)
            user32.PostMessageW(target, WM_MOUSEMOVE, 0, lparam)
            time.sleep(0.05)
            user32.PostMessageW(target, WM_LBUTTONDOWN, MK_LBUTTON, lparam)
            time.sleep(0.06)
            user32.PostMessageW(target, WM_LBUTTONUP, 0, lparam)
            return info

        # method == "foreground"
        prev_fg = user32.GetForegroundWindow()
        before = POINT()
        user32.GetCursorPos(ctypes.byref(before))
        if hwnd:
            if user32.IsIconic(hwnd):
                user32.ShowWindow(hwnd, 9)  # SW_RESTORE
            # Astuce Windows : une frappe ALT autorise SetForegroundWindow depuis un autre processus
            user32.keybd_event(0x12, 0, 0, 0)
            user32.keybd_event(0x12, 0, 0x0002, 0)
            user32.SetForegroundWindow(hwnd)
            time.sleep(0.35)
        user32.SetCursorPos(x, y)
        time.sleep(0.08)
        user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        time.sleep(0.06)
        user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        time.sleep(0.25)
        if restore:
            user32.SetCursorPos(before.x, before.y)
            if prev_fg and prev_fg != hwnd:
                user32.keybd_event(0x12, 0, 0, 0)
                user32.keybd_event(0x12, 0, 0x0002, 0)
                user32.SetForegroundWindow(prev_fg)
        info["restored_foreground"] = bool(prev_fg)
        return info

# Une image générée par Flow fait 896x1200 ; une miniature capturée dans la galerie fait 382x512
MIN_UPLOAD_HEIGHT = 1000

# Présence des onglets Google Flow (heartbeat du userscript) et verrou anti-doublon
FLOW_CLIENT_TTL = 25       # secondes sans contact avant de considérer un onglet comme fermé (la requête longue revient toutes les 20 s)
LEGACY_CLIENT_TTL = 6      # ancien userscript sans identifiant (interrogation toutes les 1,5 s)
CLAIM_STALE_AFTER = 15     # un prompt réservé par un onglet disparu peut être repris par un autre
CLAIM_LOCK = threading.Lock()
ACTIVE_COND = threading.Condition()  # réveille les onglets Flow en attente dès que le prompt actif change
CHANGE_COND = threading.Condition()  # réveille les pages du hub dès qu'une donnée affichée change
CHANGE_STATE = {"n": 0}
FLOW_CLIENTS = {}          # client_id du userscript -> dernier contact
FLOW_WAITING = {}          # client_id -> requêtes longues en cours (onglet ouvert, en attente d'un prompt)
FLOW_PRESENCE = {"legacy_last_seen": 0.0}  # heartbeat d'un ancien userscript (sans client_id)
METRICS_CACHE = {}         # nom de fichier -> (date de modification, mesures)
METRICS_LOCK = threading.Lock()
METRICS_QUEUE = queue.Queue()
METRICS_QUEUED = set()     # fichiers en attente de mesure (évite les doublons dans la file)
METRICS_STATE = {"revision": 0}  # incrémenté à chaque nouvelle mesure, pour rafraîchir les badges

def cached_metrics(filename):
    """Mesures en cache si l'image n'a pas changé depuis, sinon None."""
    try:
        mtime = os.path.getmtime(os.path.join(IMAGES_DIR, filename))
    except OSError:
        return None
    cached = METRICS_CACHE.get(filename)
    return cached[1] if cached and cached[0] == mtime else None

def measure_now(filename):
    file_path = os.path.join(IMAGES_DIR, filename)
    mtime = os.path.getmtime(file_path)
    result = coloring_metrics.measure(file_path)
    with METRICS_LOCK:
        METRICS_CACHE[filename] = (mtime, result)
        METRICS_STATE["revision"] += 1
    notify_change()
    return result

def schedule_metrics(filename):
    """Programme la mesure d'une image en arrière-plan (la liste des prompts reste rapide)."""
    with METRICS_LOCK:
        if filename in METRICS_QUEUED:
            return
        METRICS_QUEUED.add(filename)
    METRICS_QUEUE.put(filename)

def metrics_worker():
    while True:
        filename = METRICS_QUEUE.get()
        with METRICS_LOCK:
            METRICS_QUEUED.discard(filename)
        try:
            if os.path.isfile(os.path.join(IMAGES_DIR, filename)):
                thumbnail_bytes(filename)  # miniature prête avant que le hub ne l'affiche
                if cached_metrics(filename) is None:
                    measure_now(filename)
        except Exception as e:
            print(f"[Flow Hub] Mesure impossible pour {filename} : {e}")

THUMB_WIDTH = 360
THUMB_CACHE = {}           # nom de fichier -> (date de modification, JPEG)
THUMB_LOCK = threading.Lock()

def thumbnail_bytes(filename):
    """Miniature JPEG d'une page pour la grille du hub, recalculée seulement quand l'image change."""
    from PIL import Image
    file_path = os.path.join(IMAGES_DIR, filename)
    mtime = os.path.getmtime(file_path)
    cached = THUMB_CACHE.get(filename)
    if cached and cached[0] == mtime:
        return cached[1]
    with Image.open(file_path) as im:
        # Pages en noir et blanc : niveaux de gris et réduction rapide (reducing_gap) suffisent pour un aperçu
        height = round(im.height * THUMB_WIDTH / im.width)
        small = im.convert("L").resize((THUMB_WIDTH, height), Image.BILINEAR, reducing_gap=2.0)
        out = io.BytesIO()
        small.save(out, "JPEG", quality=85)
    data = out.getvalue()
    with THUMB_LOCK:
        THUMB_CACHE[filename] = (mtime, data)
    return data

def metrics_summary(result):
    def describe(c):
        return f"{c['label']} {c['value']} (cible {c['target']})"
    return {
        "passed": result["passed"],
        # « failed » : critères qui rendent la page non conforme ; « warnings » : informations (ex. bord coupé)
        "failed": [describe(c) for c in result["checks"] if not c["ok"] and c.get("blocking", True)],
        "warnings": [describe(c) for c in result["checks"] if not c["ok"] and not c.get("blocking", True)],
    }

def client_alive(client_id, ttl):
    """Un onglet est vivant s'il attend un prompt (requête longue en cours) ou s'est manifesté récemment."""
    return FLOW_WAITING.get(client_id, 0) > 0 or time.time() - FLOW_CLIENTS.get(client_id, 0) <= ttl

def flow_presence():
    now = time.time()
    for client_id, seen in list(FLOW_CLIENTS.items()):
        if now - seen > 3600 and FLOW_WAITING.get(client_id, 0) <= 0:
            FLOW_CLIENTS.pop(client_id, None)
            FLOW_WAITING.pop(client_id, None)
    return {
        "flow_tabs": sum(1 for client_id in list(FLOW_CLIENTS) if client_alive(client_id, FLOW_CLIENT_TTL)),
        "flow_legacy_script": now - FLOW_PRESENCE["legacy_last_seen"] <= LEGACY_CLIENT_TTL,
    }

def load_validations():
    if os.path.isfile(VALIDATIONS_FILE):
        try:
            with open(VALIDATIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_validations(data):
    try:
        with open(VALIDATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception:
        pass

def append_quality_log(entry):
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    item_id = entry.get("id")
    filename = entry.get("filename", "")
    decision = entry.get("decision", "rejected").upper()
    strengths = (entry.get("strengths") or "").strip()
    defects = (entry.get("defects") or "").strip()
    correction = (entry.get("correction") or "").strip()
    import time
    date_str = time.strftime('%Y-%m-%d %H:%M:%S')

    lines = [
        f"\n### Contrôle Qualité — Image #{item_id} (`{filename}`)",
        f"- **Date :** {date_str}",
        f"- **Décision :** {decision}",
    ]
    if strengths:
        lines.append(f"- **Points forts observés :** {strengths}")
    if defects:
        lines.append(f"- **Défauts constatés :** {defects}")
    if correction:
        lines.append(f"- **Correction à appliquer :** {correction}")
    lines.append("")

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write("\n".join(lines))

def normalize_image_format(img_bytes, filename):
    """Réencode l'image dans le format réel de son extension (.png ou .jpeg).
    Le userscript capture en JPEG : sans conversion, un fichier .png contiendrait du JPEG."""
    try:
        from PIL import Image
    except ImportError:
        return img_bytes
    import io
    target = "PNG" if filename.lower().endswith(".png") else "JPEG"
    with Image.open(io.BytesIO(img_bytes)) as im:
        if im.format == target:
            return img_bytes
        if target == "JPEG" and im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        elif target == "PNG" and im.mode not in ("1", "L", "LA", "P", "RGB", "RGBA", "I"):
            im = im.convert("RGB")
        out = io.BytesIO()
        if target == "JPEG":
            im.save(out, target, quality=95)
        else:
            im.save(out, target)
        return out.getvalue()

def load_saved_config():
    if os.path.isfile(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception:
        pass

_initial_cfg = load_saved_config()

ACTIVE_STATE = {
    "active_prompt": None,
    "flow_url": _initial_cfg.get("flow_url", "https://flow.google.com/"),
    "revision": 0,
    "prompt_rev": 0,
    "last_updated_id": None,
    "last_updated_filename": None,
    "last_updated_time": 0,
    "flow_error": None
}

def notify_change():
    """Signale aux pages du hub qu'il faut relire les données (images, décisions, mesures, prompt actif)."""
    with CHANGE_COND:
        CHANGE_STATE["n"] += 1
        CHANGE_COND.notify_all()

def bump_revision():
    ACTIVE_STATE["revision"] = ACTIVE_STATE.get("revision", 0) + 1
    notify_change()

def set_active_prompt(prompt):
    """Change le prompt actif et réveille les onglets Flow en attente."""
    with ACTIVE_COND:
        ACTIVE_STATE["active_prompt"] = prompt
        ACTIVE_STATE["prompt_rev"] += 1
        ACTIVE_COND.notify_all()
    notify_change()

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class DualStackHTTPServer(ThreadedHTTPServer):
    """Écoute en IPv6 et en IPv4 sur le même port.
    Sous Windows, « localhost » essaie d'abord ::1 (IPv6) : un serveur IPv4 seul fait attendre
    chaque requête (refus puis nouvel essai en IPv4), ce qui ralentissait tout le hub."""
    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        super().server_bind()

class HubRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Support CORS pour permettre au script Tampermonkey sur Flow de communiquer
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With")
        # Images versionnées (?v=date de modification) : le navigateur les garde en mémoire,
        # la version change dès que l'image est remplacée. Tout le reste est toujours relu.
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith(("/images/", "/thumbs/")) and "v=" in parsed.query:
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # 0. API: Prompt actif et Config pour Flow
        if path == "/api/active-prompt":
            query = urllib.parse.parse_qs(parsed_url.query)
            client_id = None
            if query.get("role", [""])[0] != "hub":
                client_id = query.get("client", [None])[0]
                if client_id:
                    FLOW_CLIENTS[client_id] = time.time()
                else:
                    FLOW_PRESENCE["legacy_last_seen"] = time.time()

            # Requête longue (userscript 5.2) : l'onglet Flow attend un changement de prompt, jusqu'à 25 s.
            # La réponse part dès qu'un prompt est envoyé, même si le navigateur ralentit les minuteries de l'onglet.
            client_rev = query.get("rev", [None])[0]
            try:
                wait = min(max(float(query.get("wait", ["0"])[0]), 0.0), 25.0)
            except ValueError:
                wait = 0.0
            if client_id and wait > 0 and client_rev is not None:
                deadline = time.time() + wait
                with ACTIVE_COND:
                    FLOW_WAITING[client_id] = FLOW_WAITING.get(client_id, 0) + 1
                    try:
                        while str(ACTIVE_STATE["prompt_rev"]) == client_rev:
                            remaining = deadline - time.time()
                            if remaining <= 0:
                                break
                            ACTIVE_COND.wait(remaining)
                    finally:
                        FLOW_WAITING[client_id] -= 1
                        FLOW_CLIENTS[client_id] = time.time()

            active_data = dict(ACTIVE_STATE["active_prompt"] or {"active": False})
            active_data["rev"] = ACTIVE_STATE["prompt_rev"]
            try:
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(active_data, ensure_ascii=False).encode("utf-8"))
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass  # onglet Flow fermé pendant l'attente
            return

        # Attente côté serveur pour le copilote : dans un onglet caché, setTimeout est ralenti, pas une réponse réseau
        if path == "/api/wait":
            try:
                ms = min(max(int(urllib.parse.parse_qs(parsed_url.query).get("ms", ["0"])[0]), 0), 10000)
            except ValueError:
                ms = 0
            time.sleep(ms / 1000)
            try:
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"ok": true}')
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass
            return

        # Temps réel pour la page du hub : répond dès qu'une donnée change (ou après 20 s)
        if path == "/api/changes":
            query = urllib.parse.parse_qs(parsed_url.query)
            try:
                since = int(query.get("since", ["-1"])[0])
                wait = min(max(float(query.get("wait", ["0"])[0]), 0.0), 25.0)
            except ValueError:
                since, wait = -1, 0.0
            deadline = time.time() + wait
            with CHANGE_COND:
                while CHANGE_STATE["n"] == since:
                    remaining = deadline - time.time()
                    if remaining <= 0:
                        break
                    CHANGE_COND.wait(remaining)
                current = CHANGE_STATE["n"]
            try:
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"change": current}).encode("utf-8"))
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass
            return

        if path == "/api/config":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({
                "flow_url": ACTIVE_STATE["flow_url"],
                "flow_error": ACTIVE_STATE.get("flow_error"),
                **flow_presence()
            }).encode("utf-8"))
            return

        # 0.5 API : mesures objectives d'une page (résolution, difficulté) pour le contrôle qualité
        if path == "/api/metrics":
            filename = os.path.basename(urllib.parse.parse_qs(parsed_url.query).get("filename", [""])[0])
            file_path = os.path.join(IMAGES_DIR, filename)
            if not filename or not os.path.isfile(file_path):
                self.send_response(404)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Image introuvable"}).encode("utf-8"))
                return
            try:
                result = cached_metrics(filename) or measure_now(filename)
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        # 1. API: Liste de tous les prompts
        if path == "/api/prompts":
            import importlib
            importlib.reload(flow_parser)
            prompts = flow_parser.parse_visual_plans(DOCS_DIR, IMAGES_DIR)
            validations = load_validations()
            
            for p in prompts:
                v = validations.get(str(p["id"]))
                if v:
                    p["validation_status"] = v.get("status")
                    p["validation_details"] = v
                else:
                    p["validation_status"] = "unreviewed" if p["status"] == "done" else "pending"

                # Pour le rapport MEF, toutes les images générées sont conformes par défaut
                p["metrics"] = None
                p["image_version"] = None
                if p["status"] == "done":
                    try:
                        p["image_version"] = int(os.path.getmtime(os.path.join(IMAGES_DIR, p["filename"])) * 1000)
                    except OSError:
                        pass

            total = len(prompts)
            done = sum(1 for p in prompts if p["status"] == "done")
            validated = sum(1 for p in prompts if p.get("validation_status") == "validated")
            pending = total - done
            
            # Statistiques par flow
            flows = {}
            for p in prompts:
                fl = p["flow_label"]
                if fl not in flows:
                    flows[fl] = {"total": 0, "done": 0, "pending": 0, "validated": 0}
                flows[fl]["total"] += 1
                if p["status"] == "done":
                    flows[fl]["done"] += 1
                else:
                    flows[fl]["pending"] += 1
                if p.get("validation_status") == "validated":
                    flows[fl]["validated"] += 1

            data = {
                "total": total,
                "done": done,
                "validated": validated,
                "pending": pending,
                "percent": round((done / total * 100), 1) if total > 0 else 0,
                "revision": ACTIVE_STATE.get("revision", 0),
                "last_updated_id": ACTIVE_STATE.get("last_updated_id"),
                "last_updated_filename": ACTIVE_STATE.get("last_updated_filename"),
                "last_updated_time": ACTIVE_STATE.get("last_updated_time", 0),
                "last_updated_low_res": ACTIVE_STATE.get("last_updated_low_res", False),
                "metrics_revision": METRICS_STATE["revision"],
                "nonconform": 0,
                "flow_url": ACTIVE_STATE.get("flow_url"),
                "flow_error": ACTIVE_STATE.get("flow_error"),
                **flow_presence(),
                "flow_status": ACTIVE_STATE.get("flow_status"),
                "flows": flows,
                "prompts": prompts
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))
            return

        # 1.5 Servir les exports PDF générés
        if path.startswith("/exports/"):
            filename = os.path.basename(path)
            file_path = os.path.join(EXPORTS_DIR, filename)
            if os.path.isfile(file_path):
                self.send_response(200)
                self.send_header("Content-Type", "application/pdf")
                self.send_header("Content-Length", str(os.path.getsize(file_path)))
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.end_headers()
                return

        # 1.9 Miniatures des cartes de la grille (les pages en pleine taille restent servies par /images/)
        if path.startswith("/thumbs/"):
            filename = os.path.basename(path)
            if not os.path.isfile(os.path.join(IMAGES_DIR, filename)):
                self.send_response(404)
                self.end_headers()
                return
            try:
                data = thumbnail_bytes(filename)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return
            self.send_response(200)
            self.send_header("Content-Type", "image/jpeg")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        # 2. Servir les images depuis images/
        if path.startswith("/images/"):
            filename = os.path.basename(path)
            file_path = os.path.join(IMAGES_DIR, filename)
            if os.path.isfile(file_path):
                mime, _ = mimetypes.guess_type(file_path)
                self.send_response(200)
                self.send_header("Content-Type", mime or "image/jpeg")
                self.send_header("Content-Length", str(os.path.getsize(file_path)))
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.end_headers()
                return

        # 2.5 Servir le script Tampermonkey
        if path == "/flow_tampermonkey.user.js":
            script_path = os.path.join(BASE_DIR, "flow_tampermonkey.user.js")
            if os.path.isfile(script_path):
                self.send_response(200)
                self.send_header("Content-Type", "application/javascript; charset=utf-8")
                self.send_header("Content-Length", str(os.path.getsize(script_path)))
                self.end_headers()
                with open(script_path, "rb") as f:
                    self.wfile.write(f.read())
                return

        # 3. Servir l'interface web statique depuis public/
        if path == "/" or path == "":
            target_file = os.path.join(PUBLIC_DIR, "index.html")
        else:
            rel_path = path.lstrip("/")
            target_file = os.path.join(PUBLIC_DIR, rel_path)

        if os.path.isfile(target_file):
            mime, _ = mimetypes.guess_type(target_file)
            self.send_response(200)
            self.send_header("Content-Type", mime or "text/plain")
            self.send_header("Content-Length", str(os.path.getsize(target_file)))
            self.end_headers()
            with open(target_file, "rb") as f:
                self.wfile.write(f.read())
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # Définir le prompt actif pour automatisation
        if path == "/api/active-prompt":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                req_json = json.loads(post_data.decode("utf-8"))
                req_json.pop("claimed_by", None)
                set_active_prompt(req_json)
                mode = "sélection d'image" if req_json.get("pick") else "génération"
                print(f"[Flow Hub] Active prompt set ({mode}): #{req_json.get('id')} - {req_json.get('filename')}")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "active": req_json}).encode("utf-8"))
            except Exception as e:
                self.send_error(400, str(e))
            return

        # Réserver le prompt actif pour un seul onglet Flow (anti-doublon)
        if path == "/api/claim-prompt":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
            try:
                req_json = json.loads(post_data.decode("utf-8"))
            except Exception:
                req_json = {}
            client_id = req_json.get("client")
            timestamp = req_json.get("timestamp")

            with CLAIM_LOCK:
                active = ACTIVE_STATE["active_prompt"]
                owner = active.get("claimed_by") if active else None
                if not client_id or not active or active.get("timestamp") != timestamp:
                    result = {"granted": False, "reason": "stale"}
                elif owner == client_id:
                    # Une activation ne s'exécute qu'une fois, même si le même onglet la redemande
                    result = {"granted": False, "reason": "already_claimed"}
                elif owner and client_alive(owner, CLAIM_STALE_AFTER):
                    result = {"granted": False, "reason": "claimed"}
                else:
                    active["claimed_by"] = client_id
                    result = {"granted": True}

            if client_id:
                FLOW_CLIENTS[client_id] = time.time()
            print(f"[Flow Hub] Réservation du prompt #{active.get('id') if active else '-'} par {client_id} : {result}")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
            return

        # Marquer le prompt actif comme terminé
        if path == "/api/prompt-done":
            content_length = int(self.headers.get("Content-Length", 0))
            body = {}
            if content_length > 0:
                try:
                    body = json.loads(self.rfile.read(content_length).decode("utf-8")) or {}
                except Exception:
                    body = {}
            active = ACTIVE_STATE["active_prompt"]
            done_timestamp = body.get("timestamp")
            # Un « terminé » en retard ne doit pas effacer le prompt suivant déjà envoyé par la file
            if done_timestamp is not None and active and active.get("timestamp") != done_timestamp:
                print(f"[Flow Hub] Fin ignorée pour #{body.get('id')} : le prompt actif est déjà #{active.get('id')}.")
            else:
                print(f"[Flow Hub] Active prompt completed: {active.get('filename') if active else 'none'}")
                set_active_prompt(None)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
            return

        # Mettre à jour l'URL Flow
        if path == "/api/config":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                req_json = json.loads(post_data.decode("utf-8"))
                if "flow_url" in req_json:
                    clean_url = req_json["flow_url"].split("#")[0]
                    ACTIVE_STATE["flow_url"] = clean_url
                    ACTIVE_STATE["flow_error"] = None
                    save_config({"flow_url": clean_url})
                    print(f"[Flow Hub] Flow URL synchronisée et mémorisée : {clean_url}")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "flow_url": ACTIVE_STATE["flow_url"]}).encode("utf-8"))
            except Exception as e:
                self.send_error(400, str(e))
            return

        # Étape en cours du copilote Flow (affichée dans le bandeau de la file du hub)
        if path == "/api/flow-status":
            content_length = int(self.headers.get("Content-Length", 0))
            try:
                body = json.loads(self.rfile.read(content_length).decode("utf-8")) if content_length > 0 else {}
            except Exception:
                body = {}
            ACTIVE_STATE["flow_status"] = {
                "message": str(body.get("message", ""))[:300],
                "id": body.get("id"),
                "client": body.get("client"),
                "time": time.time(),
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"success": true}')
            return

        # Clic système RÉEL (API Windows) aux coordonnées écran envoyées par le copilote.
        # Google Flow ignore les clics simulés par un script (événements non « trusted ») ; un clic
        # produit par le système d'exploitation est, lui, indiscernable d'un clic humain.
        if path == "/api/os-click":
            content_length = int(self.headers.get("Content-Length", 0))
            try:
                body = json.loads(self.rfile.read(content_length).decode("utf-8")) if content_length > 0 else {}
                if body.get("method") == "prepare":
                    result = os_prepare_flow_window()
                else:
                    result = os_click(int(body.get("x")), int(body.get("y")), bool(body.get("restore", True)),
                                      str(body.get("method", "post")), body.get("client"))
                result["window"] = body.get("window")
                ACTIVE_STATE["last_os_click"] = {"time": time.time(), "request": body, "result": result}
                try:
                    # Pas d'emoji ici : la console Windows (cp1252) ne les encode pas
                    print(f"[Flow Hub] Clic systeme demande en ({body.get('x')}, {body.get('y')}) fenetre={body.get('window')} -> {result}", flush=True)
                    with open(os.path.join(BASE_DIR, "click_debug.log"), "a", encoding="utf-8") as lf:
                        lf.write(json.dumps({"t": time.strftime("%H:%M:%S"), "request": body, "result": result}, ensure_ascii=False) + "\n")
                except Exception:
                    pass
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
            except Exception as e:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
            return

        # Signaler une erreur ou quota sur Flow
        if path == "/api/flow-error":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                req_json = json.loads(post_data.decode("utf-8")) if content_length > 0 else {}
                ACTIVE_STATE["flow_error"] = req_json
                notify_change()
                print(f"[Flow Hub] ⚠️ Erreur ou Quota Flow signalé : {req_json}")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "error": req_json}).encode("utf-8"))
            except Exception as e:
                self.send_error(400, str(e))
            return

        # Effacer l'erreur Flow (ex: reprise après changement de compte)
        if path == "/api/clear-error":
            ACTIVE_STATE["flow_error"] = None
            notify_change()
            print("[Flow Hub] État d'erreur Flow réinitialisé.")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
            return

        # Téléversement d'image et renommage automatique
        if path in ("/api/upload", "/api/upload-raw"):
            upload_started = time.time()
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            try:
                if path == "/api/upload-raw":
                    # Envoi binaire (copilote 5.2) : l'image telle quelle, sans base64 ni JSON
                    query = urllib.parse.parse_qs(parsed_url.query)
                    filename = os.path.basename(query.get("filename", [""])[0])
                    raw_id = query.get("id", [""])[0]
                    prompt_id = int(raw_id) if raw_id.isdigit() else None
                    raw_bytes = post_data
                    if not filename or not raw_bytes:
                        self.send_error(400, "filename and image bytes required")
                        return
                else:
                    # Payload JSON avec base64 (anciens copilotes et boutons « Depuis l'ordinateur »)
                    req_json = json.loads(post_data.decode("utf-8"))
                    filename = req_json.get("filename")
                    base64_data = req_json.get("image_data") # data:image/jpeg;base64,...
                    prompt_id = req_json.get("id")

                    if not filename or not base64_data:
                        self.send_error(400, "filename and image_data required")
                        return

                    import base64
                    if "," in base64_data:
                        base64_data = base64_data.split(",", 1)[1]
                    raw_bytes = base64.b64decode(base64_data)

                # Normaliser l'extension
                if not filename.endswith(".jpeg") and not filename.endswith(".png") and not filename.endswith(".jpg"):
                    filename += ".jpeg"
                elif filename.endswith(".jpg"):
                    filename = filename[:-4] + ".jpeg"

                img_bytes = normalize_image_format(raw_bytes, filename)
                width = height = None
                try:
                    from PIL import Image
                    with Image.open(io.BytesIO(img_bytes)) as probe:
                        width, height = probe.size
                except Exception:
                    pass
                low_resolution = bool(height and height < MIN_UPLOAD_HEIGHT)
                dest_path = os.path.join(IMAGES_DIR, filename)
                
                with open(dest_path, "wb") as f:
                    f.write(img_bytes)
                schedule_metrics(filename)

                if not prompt_id:
                    try:
                        prompts = parse_visual_plans(DOCS_DIR, IMAGES_DIR)
                        for p in prompts:
                            if p["filename"].lower() == filename.lower() or p.get("raw_filename", "").lower() == filename.lower():
                                prompt_id = p["id"]
                                break
                    except Exception:
                        pass

                # Nouvelle image = nouveau contrôle qualité : l'ancienne décision ne s'applique plus
                validations = load_validations()
                if prompt_id is not None and str(prompt_id) in validations:
                    del validations[str(prompt_id)]
                    save_validations(validations)
                    print(f"[Flow Hub] Image #{prompt_id} remplacée : décision qualité précédente réinitialisée (à recontrôler).")

                bump_revision()
                ACTIVE_STATE["last_updated_id"] = prompt_id
                ACTIVE_STATE["last_updated_filename"] = filename
                ACTIVE_STATE["last_updated_time"] = time.time()
                ACTIVE_STATE["last_updated_low_res"] = low_resolution
                ACTIVE_STATE["flow_error"] = None
                if low_resolution:
                    print(f"[Flow Hub] ⚠️ {filename} enregistré en basse résolution ({width}x{height}) : miniature de galerie probable.")

                print(f"[Flow Hub] Saved/Replaced image -> {filename} (#{prompt_id}) ({len(img_bytes)} bytes) "
                      f"en {(time.time() - upload_started) * 1000:.0f} ms [Rev {ACTIVE_STATE['revision']}]")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "id": prompt_id,
                    "filename": filename,
                    "image_path": f"/images/{filename}",
                    "revision": ACTIVE_STATE["revision"],
                    "width": width,
                    "height": height,
                    "low_resolution": low_resolution,
                    "message": f"Image {filename} successfully saved in images/"
                }).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        # Contrôle qualité et validation humaine (avec motif obligatoire si rejet)
        if path == "/api/validate":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                req_json = json.loads(post_data.decode("utf-8"))
                prompt_id = str(req_json.get("id"))
                decision = req_json.get("decision")
                defects = (req_json.get("defects") or "").strip()
                
                if decision not in ("validated", "rejected"):
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "decision must be validated or rejected"}).encode("utf-8"))
                    return

                if decision == "rejected" and not defects:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Un rejet exige la saisie des défauts constatés (règle anti-régénération aveugle)"}).encode("utf-8"))
                    return

                append_quality_log(req_json)
                validations = load_validations()
                validations[prompt_id] = {
                    "status": decision,
                    "filename": req_json.get("filename"),
                    "time": time.time(),
                    "defects": defects,
                    "strengths": (req_json.get("strengths") or "").strip(),
                    "correction": (req_json.get("correction") or "").strip()
                }
                save_validations(validations)
                
                bump_revision()
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "status": decision}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        # Compilation en livret PDF haute définition (Print-ready 300 DPI)
        if path == "/api/export-pdf":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
            try:
                from PIL import Image
                req_json = json.loads(post_data.decode("utf-8")) if post_data else {}
                flow_filter = req_json.get("flow", "flow7-coloring-magical-fantasy.md")
                book_title = req_json.get("title", "Coloring_Book_Magical_Fantasy")
                
                prompts = parse_visual_plans(DOCS_DIR, IMAGES_DIR)
                target_prompts = [p for p in prompts if flow_filter == "all" or p["file_source"] == flow_filter]
                
                image_pages = []
                for p in target_prompts:
                    img_file = os.path.join(IMAGES_DIR, p["filename"])
                    if os.path.isfile(img_file):
                        try:
                            im = Image.open(img_file).convert("RGB")
                            image_pages.append(im)
                        except Exception:
                            pass
                
                if not image_pages:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Aucune image disponible pour générer le PDF de ce pack."}).encode("utf-8"))
                    return

                pdf_filename = f"{book_title}_{int(time.time())}.pdf"
                pdf_path = os.path.join(EXPORTS_DIR, pdf_filename)
                
                first_page = image_pages[0]
                rest_pages = image_pages[1:] if len(image_pages) > 1 else []
                first_page.save(pdf_path, "PDF", resolution=300.0, save_all=True, append_images=rest_pages)
                
                print(f"[Flow Hub] Export PDF généré : {pdf_filename} ({len(image_pages)} pages)")
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "pdf_file": pdf_filename,
                    "pdf_path": f"/exports/{pdf_filename}",
                    "pages_count": len(image_pages)
                }).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()

def run_server(port=PORT):
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    try:
        httpd = DualStackHTTPServer(("::", port), HubRequestHandler)
    except OSError:
        httpd = ThreadedHTTPServer(("", port), HubRequestHandler)  # machine sans IPv6
    threading.Thread(target=metrics_worker, daemon=True, name="metrics-worker").start()
    print(f"\n=======================================================")
    print(f" Flow Image Hub actif : http://localhost:{port}/")
    print(f" Images cibles : {IMAGES_DIR}")
    print(f" Visual Plans  : {DOCS_DIR}")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur.")
        httpd.server_close()

if __name__ == "__main__":
    run_server(PORT)
