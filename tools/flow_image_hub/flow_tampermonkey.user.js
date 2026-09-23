// ==UserScript==
// @name         Flow Image Hub — Assistant Automatique Webnovel
// @namespace    https://github.com/webnovel-playbook
// @version      5.6
// @description  Copilot Google Flow synchronisé au Hub : une seule génération par activation (verrou Hub), une seule copie active par page, prompt collé une seule fois, réception immédiate même en arrière-plan.
// @updateURL    http://localhost:8085/flow_tampermonkey.user.js
// @downloadURL  http://localhost:8085/flow_tampermonkey.user.js
// @author       Hakay
// @match        https://flow.google.com/*
// @match        https://flow.google/*
// @match        *://flow.google.com/*
// @match        *://flow.google/*
// @match        *://labs.google/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      localhost
// @connect      127.0.0.1
// @connect      *
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    // Une seule instance par page : jamais dans un cadre intégré, jamais deux copies du script
    if (window.top !== window.self) return;
    // Deux verrous : un attribut sur <html> (qu'une page React peut effacer) et une clé de session
    // propre à ce chargement de page (performance.timeOrigin est identique pour toutes les copies du script).
    const INSTANCE_ATTR = 'data-flow-copilot';
    const PAGE_LOCK_PREFIX = 'flow_copilot_page_';
    const PAGE_LOCK_KEY = `${PAGE_LOCK_PREFIX}${Math.round(performance.timeOrigin)}`;
    const rootEl = document.documentElement;
    let pageLocked = false;
    try { pageLocked = !!sessionStorage.getItem(PAGE_LOCK_KEY); } catch (e) { }
    if ((rootEl && rootEl.hasAttribute(INSTANCE_ATTR)) || pageLocked) {
        console.warn('[Flow Copilot] Une autre copie du script est déjà active sur cette page : cette copie reste inactive.');
        return;
    }
    const CLIENT_ID = `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    if (rootEl) rootEl.setAttribute(INSTANCE_ATTR, CLIENT_ID);
    try {
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith(PAGE_LOCK_PREFIX) && key !== PAGE_LOCK_KEY)
            .forEach((key) => sessionStorage.removeItem(key));
        sessionStorage.setItem(PAGE_LOCK_KEY, CLIENT_ID);
    } catch (e) { }

    // Filet de sécurité : si plusieurs copies ont tout de même démarré, une seule reste active (voir injectUI)
    let isActive = true;
    const timers = [];

    console.log('🚀 [Flow Copilot v5.6 - anti-doublon] Initialisation sur', location.href, CLIENT_ID);

    // 127.0.0.1 plutôt que localhost : sous Windows, localhost essaie d'abord IPv6 et peut ajouter ~2 s par requête
    const HUB_URL = 'http://127.0.0.1:8085';
    let isExecuting = false;
    let isClaiming = false;
    let pendingPromptData = null; // prompt reçu pendant un enregistrement : exécuté juste après
    let lastReportedStatus = null; // dernière étape envoyée au Hub (évite les envois répétés)
    let lastProcessedTimestamp = 0;
    let currentPrompt = null;
    let lastAppliedRatio = null; // Flow garde le ratio choisi : inutile de rouvrir son menu s'il ne change pas

    // Dans un onglet caché, le navigateur ralentit setTimeout (jusqu'à une fois par minute) :
    // on attend alors via le Hub, dont la réponse réseau n'est pas ralentie ; sinon setTimeout classique.
    const sleep = async (ms) => {
        if (document.hidden && ms >= 500 && typeof GM_xmlhttpRequest !== 'undefined') {
            const res = await hubRequest('GET', `/api/wait?ms=${Math.round(ms)}`, null, ms + 5000);
            if (res) return;
        }
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    // Synchronisation automatique de l'URL du projet Flow actif vers le Hub
    function syncFlowUrlToHub() {
        const cleanUrl = location.href.split('#')[0];
        if (cleanUrl.includes('flow.google') || cleanUrl.includes('labs.google')) {
            const payload = JSON.stringify({ flow_url: cleanUrl });
            if (typeof GM_xmlhttpRequest !== 'undefined') {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: `${HUB_URL}/api/config`,
                    headers: { 'Content-Type': 'application/json' },
                    data: payload
                });
            } else {
                fetch(`${HUB_URL}/api/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload
                }).catch(() => { });
            }
        }
    }

    // Remontée d'erreur ou d'épuisement de quota vers le Hub
    function reportFlowError(errType, message) {
        console.warn(`[Flow Copilot] ⚠️ Signalement erreur au Hub: ${errType} - ${message}`);
        const payload = JSON.stringify({ error: errType, message: message });
        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: 'POST',
                url: `${HUB_URL}/api/flow-error`,
                headers: { 'Content-Type': 'application/json' },
                data: payload
            });
        } else {
            fetch(`${HUB_URL}/api/flow-error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload
            }).catch(() => { });
        }
    }

    function isVisible(el) {
        if (!el) return false;
        try {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 5 && rect.height > 5;
        } catch (e) {
            return false;
        }
    }

    // =========================================================================
    // 1. EXPLORATION PROFONDE SHADOW DOM & TEXTE
    // =========================================================================
    function findDeepText(targetText, root = document) {
        let matches = [];
        try {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                if ((node.nodeValue || '').trim() === targetText) {
                    if (node.parentElement) matches.push(node.parentElement);
                }
            }
        } catch (e) { }

        // Récursion dans tous les Shadow Roots
        try {
            const all = root.querySelectorAll('*');
            for (const el of all) {
                if (el.shadowRoot) {
                    matches = matches.concat(findDeepText(targetText, el.shadowRoot));
                }
            }
        } catch (e) { }

        return matches;
    }

    function findDeepRatioOption(targetRatio, root = document) {
        const clean = targetRatio.replace(/\s+/g, '');
        let matches = [];

        // 1. Text walker
        try {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                const val = (node.nodeValue || '').trim();
                if (val === clean || val.includes(clean)) {
                    if (node.parentElement) matches.push(node.parentElement);
                }
            }
        } catch (e) { }

        // 2. Query selector by attributes
        try {
            const attrMatches = root.querySelectorAll(`[aria-label*="${clean}"], [title*="${clean}"], [data-value*="${clean}"]`);
            for (const el of attrMatches) {
                matches.push(el);
            }
        } catch (e) { }

        // 3. Récursion dans tous les Shadow Roots
        try {
            const all = root.querySelectorAll('*');
            for (const el of all) {
                if (el.shadowRoot) {
                    matches = matches.concat(findDeepRatioOption(targetRatio, el.shadowRoot));
                }
            }
        } catch (e) { }

        return matches;
    }

    // =========================================================================
    // 2. GESTION DU RATIO DANS LE POPOVER GOOGLE FLOW (OPTION B AMÉLIORÉE)
    // =========================================================================
    function findRatioPill() {
        const all = Array.from(document.querySelectorAll('button, [role="button"], div, span'));
        const candidates = all.filter(el => {
            if (el.closest('#webnovel-flow-hub-widget')) return false;
            // textContent ne force pas le navigateur à recalculer la mise en page (innerText, si)
            const t = (el.textContent || '').trim();
            if (!t.includes('Banana') && !t.includes('Nano')) return false;
            return isVisible(el);
        });

        if (candidates.length > 0) {
            candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
            const best = candidates[0];
            return best.closest('button, [role="button"]') || best;
        }
        return null;
    }

    function findRatioPopover() {
        const all = Array.from(document.querySelectorAll('div, [role="dialog"], [role="menu"], [popover], section'));
        const candidates = all.filter(el => {
            if (el.closest('#webnovel-flow-hub-widget') || el.id === 'webnovel-flow-hub-widget') return false;
            const text = el.textContent || '';
            if (!text.includes('16:9') || !text.includes('9:16')) return false;
            return isVisible(el);
        });

        if (candidates.length === 0) return null;
        candidates.sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return (ra.width * ra.height) - (rb.width * rb.height);
        });
        return candidates[0];
    }

    function findRatioButtonInPopover(targetRatio) {
        const clean = targetRatio.replace(/\s+/g, '');
        const popover = findRatioPopover();
        const root = popover || document.body;

        // Stratégie 1 : Position parmi les 5 boutons ordonnés (16:9, 4:3, 1:1, 3:4, 9:16)
        const ratioOrder = ['16:9', '4:3', '1:1', '3:4', '9:16'];
        const targetIdx = ratioOrder.indexOf(clean);

        if (popover && targetIdx !== -1) {
            const allElements = Array.from(popover.querySelectorAll('*')).filter(el => {
                if (el.closest('#webnovel-flow-hub-widget')) return false;
                const t = (el.textContent || '').trim();
                if (!(t === '16:9' || t === '4:3' || t === '1:1' || t === '3:4' || t === '9:16')) return false;
                return isVisible(el);
            });

            const uniqueBoxes = [];
            for (const el of allElements) {
                const box = el.closest('button, [role="button"], [role="radio"], [role="option"]') || el.parentElement || el;
                if (!uniqueBoxes.includes(box) && box !== popover) {
                    uniqueBoxes.push(box);
                }
            }

            uniqueBoxes.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

            if (uniqueBoxes.length >= 5) {
                console.log(`[Flow Copilot] Boutons ratios ordonnés trouvés (${uniqueBoxes.length}) :`, uniqueBoxes);
                return uniqueBoxes[targetIdx];
            }
        }

        // Stratégie 2 : Recherche récursive de texte exact HORS widget
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const val = (node.nodeValue || '').trim();
            if (val === clean) {
                const p = node.parentElement;
                if (p && !p.closest('#webnovel-flow-hub-widget')) {
                    return p.closest('button, [role="button"], [role="radio"], [role="option"]') || p.parentElement || p;
                }
            }
        }

        // Stratégie 3 : Attributs aria-label ou data-value
        const attrMatches = Array.from(root.querySelectorAll(`[aria-label*="${clean}"], [title*="${clean}"], [data-value*="${clean}"]`))
            .filter(el => !el.closest('#webnovel-flow-hub-widget') && isVisible(el));
        if (attrMatches.length > 0) return attrMatches[0];

        return null;
    }

    function fireDeepClick(el) {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;

        const eventProps = {
            bubbles: true,
            cancelable: true,
            composed: true,
            clientX: clientX,
            clientY: clientY,
            screenX: clientX + (window.screenX || 0),
            screenY: clientY + (window.screenY || 0),
            button: 0,
            buttons: 1
        };

        function send(target, type, Cls) {
            try { target.dispatchEvent(new Cls(type, eventProps)); } catch (e) { }
        }

        try { el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' }); } catch (e) { }

        const targets = [el];
        if (el.firstElementChild) targets.push(el.firstElementChild);
        if (el.parentElement && el.parentElement !== document.body) targets.push(el.parentElement);

        for (const t of targets) {
            try {
                if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
                t.focus();
            } catch (e) { }

            send(t, 'pointerover', PointerEvent);
            send(t, 'mouseenter', MouseEvent);
            send(t, 'pointerdown', PointerEvent);
            send(t, 'mousedown', MouseEvent);
            send(t, 'pointerup', PointerEvent);
            send(t, 'mouseup', MouseEvent);
            send(t, 'click', MouseEvent);
            try { t.click(); } catch (e) { }

            try {
                t.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', keyCode: 32, bubbles: true, composed: true }));
                t.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true, composed: true }));
                t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, composed: true }));
                t.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, composed: true }));
            } catch (e) { }
        }
    }

    async function applyRatioWithKeyboardAndScroll(targetRatio) {
        const targetClean = targetRatio.replace(/\s+/g, '');
        console.log(`[Flow Copilot] === Réglage ratio : ${targetClean} ===`);
        updateStatus(`📐 Réglage ratio (${targetClean})...`, '#F2B705', true);

        // 1. Vérifier si le popover est déjà ouvert, sinon cliquer sur le pill
        let popover = findRatioPopover();
        if (!popover) {
            const pill = findRatioPill();
            if (pill) {
                console.log('📌 [Flow Copilot] Clic pour ouvrir le popover :', pill);
                pill.click();
                for (let i = 0; i < 15 && !popover; i++) {
                    await sleep(100);
                    popover = findRatioPopover();
                }
            }
        }

        await sleep(250);

        // 2. Trouver le bouton de ratio dans le popover
        let ratioBtn = findRatioButtonInPopover(targetClean);
        for (let i = 0; i < 10 && !ratioBtn; i++) {
            await sleep(100);
            ratioBtn = findRatioButtonInPopover(targetClean);
        }

        if (ratioBtn) {
            console.log('🎯 [Flow Copilot] Bouton ratio trouvé :', ratioBtn);
            fireDeepClick(ratioBtn);
            await sleep(350);
            updateStatus(`✅ Ratio ${targetClean} appliqué !`, '#2A9D8F', false);
            return true;
        } else {
            console.warn(`⚠️ [Flow Copilot] Bouton ratio ${targetClean} introuvable.`);
            updateStatus(`⚠️ Cliquez sur ${targetClean} dans le menu`, '#E4572E', true);
            return false;
        }
    }

    // =========================================================================
    // 3. CAPTURE DE L'IMAGE TOUT À GAUCHE
    // =========================================================================
    function getNewestGalleryImage() {
        const allImgs = Array.from(document.querySelectorAll('img')).filter(img => {
            if (!img.src) return false;
            if (img.src.includes('avatar') || img.src.includes('googleusercontent.com/a/')) return false;

            const r = img.getBoundingClientRect();
            return r.width > 120 && r.height > 120 && r.top >= 0 && r.left >= 0 && img.complete && img.naturalWidth > 200;
        });

        if (allImgs.length === 0) return null;

        allImgs.sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            if (Math.abs(ra.top - rb.top) < 60) {
                return ra.left - rb.left; // La plus à gauche d'abord
            }
            return ra.top - rb.top;
        });

        return allImgs[0];
    }

    function getImageFingerprint(imgEl) {
        if (!imgEl) return null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgEl, 0, 0, 16, 16);
            return canvas.toDataURL('image/jpeg', 0.5);
        } catch (e) {
            return (imgEl.src || '') + '_' + imgEl.naturalWidth + 'x' + imgEl.naturalHeight;
        }
    }

    // Image affichée copiée localement (aucun téléchargement) ; impossible si Google bloque la lecture de l'image
    function canvasToBlob(imgEl) {
        return new Promise((resolve) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = imgEl.naturalWidth;
                canvas.height = imgEl.naturalHeight;
                canvas.getContext('2d').drawImage(imgEl, 0, 0);
                canvas.toBlob((blob) => resolve(blob && blob.size > 5000 ? blob : null), 'image/png');
            } catch (e) {
                resolve(null);
            }
        });
    }

    // Téléchargement direct par la page (bien plus rapide que Tampermonkey quand Google l'autorise)
    async function fetchImageBlob(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) return null;
            const blob = await res.blob();
            return blob.size > 5000 ? blob : null;
        } catch (e) {
            return null;
        } finally {
            clearTimeout(timer);
        }
    }

    // Adresse de l'image d'origine quand l'URL Google demande une taille réduite (ex. « =s512 », « =w382-h512 »)
    function toFullSizeUrl(src) {
        if (!src) return src;
        return src.replace(/=(?:s\d+|w\d+-h\d+)(-[a-z0-9-]*)?$/i, '=s0');
    }

    // Hauteur réelle d'une image téléchargée (0 si illisible)
    async function blobHeight(blob) {
        try {
            const bitmap = await createImageBitmap(blob);
            const height = bitmap.height;
            bitmap.close();
            return height;
        } catch (e) {
            return 0;
        }
    }

    // Dernier recours : téléchargement par Tampermonkey (délai maximum 30 s, 2 essais)
    function gmDownloadBlob(url, attempt = 1) {
        return new Promise((resolve) => {
            if (typeof GM_xmlhttpRequest === 'undefined') return resolve(null);
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                responseType: 'blob',
                timeout: 30000,
                onload: (resp) => resolve(resp.status < 400 && resp.response && resp.response.size > 5000 ? resp.response : null),
                onerror: () => resolve(null),
                ontimeout: () => resolve(null)
            });
        }).then((blob) => blob || (attempt < 2 ? gmDownloadBlob(url, attempt + 1) : null));
    }

    // target : nom de fichier (boutons manuels) ou prompt exécuté (file automatique).
    // Retourne une promesse résolue quand l'enregistrement est terminé (ou a échoué).
    async function captureAndSave(imgEl, target) {
        const promptData = typeof target === 'string' ? currentPrompt : target;
        const filename = typeof target === 'string' ? target : target.filename;
        if (!imgEl) {
            updateStatus("❌ Aucune image tout à gauche.", '#E4572E');
            return false;
        }
        const started = Date.now();
        updateStatus(`Récupération de l'image ${filename}...`, '#F2B705', true);

        // La galerie Flow affiche souvent une miniature (ex. 382×512) : on garde la première version
        // en pleine taille (hauteur ≥ 1000 px), sinon la plus grande trouvée.
        const fullSizeUrl = toFullSizeUrl(imgEl.src);
        const attempts = [
            () => fullSizeUrl !== imgEl.src ? fetchImageBlob(fullSizeUrl) : null,
            () => canvasToBlob(imgEl),
            () => fetchImageBlob(imgEl.src),
            () => gmDownloadBlob(fullSizeUrl),
            () => fullSizeUrl !== imgEl.src ? gmDownloadBlob(imgEl.src) : null
        ];
        let blob = null;
        let bestHeight = 0;
        for (const attempt of attempts) {
            const candidate = await attempt();
            if (!candidate) continue;
            const height = await blobHeight(candidate);
            if (height > bestHeight) {
                blob = candidate;
                bestHeight = height;
            }
            if (bestHeight >= 1000) break;
            updateStatus(`Recherche de l'image en pleine taille (${bestHeight} px trouvés)...`, '#F2B705', true);
        }
        if (!blob) {
            updateStatus(`❌ Image de ${filename} impossible à récupérer depuis Flow.`, '#E4572E');
            reportFlowError('capture_failed', `Image de ${filename} impossible à récupérer depuis Flow.`);
            return false;
        }
        return sendUpload(filename, blob, promptData, started, (Date.now() - started) / 1000);
    }

    function postBlobToHub(path, blob, timeoutMs) {
        return new Promise((resolve) => {
            const url = `${HUB_URL}${path}`;
            const headers = { 'Content-Type': blob.type || 'application/octet-stream' };
            if (typeof GM_xmlhttpRequest !== 'undefined') {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url,
                    data: blob,
                    headers,
                    timeout: timeoutMs,
                    onload: (resp) => {
                        let json = null;
                        try { json = JSON.parse(resp.responseText); } catch (e) { }
                        resolve({ status: resp.status, json });
                    },
                    onerror: () => resolve({ status: 0, json: null }),
                    ontimeout: () => resolve({ status: -1, json: null })
                });
            } else {
                fetch(url, { method: 'POST', body: blob, headers })
                    .then(async (r) => resolve({ status: r.status, json: await r.json().catch(() => null) }))
                    .catch(() => resolve({ status: 0, json: null }));
            }
        });
    }

    function blobToDataUrl(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result || null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    }

    // Envoi binaire au hub (sans base64 ni JSON) : délai maximum 60 s, 3 essais,
    // puis ancien format si le hub n'a pas été redémarré, puis erreur signalée (plus d'attente silencieuse)
    async function sendUpload(filename, blob, promptData = currentPrompt, started = Date.now(), fetchedIn = 0) {
        const idParam = promptData && promptData.id != null ? `&id=${encodeURIComponent(promptData.id)}` : '';
        const sizeKb = Math.round(blob.size / 1024);

        let rawSupported = true;
        for (let attempt = 1; attempt <= 3; attempt++) {
            updateStatus(`Envoi de ${filename} au hub (${sizeKb} Ko)${attempt > 1 ? ` — essai ${attempt}/3` : ''}...`, '#F2B705', true);
            const sendStart = Date.now();
            let info = null;
            if (rawSupported) {
                const res = await postBlobToHub(`/api/upload-raw?filename=${encodeURIComponent(filename)}${idParam}`, blob, 15000);
                info = res.json;
                // Hub pas encore redémarré (route absente) ou envoi binaire refusé par Tampermonkey :
                // ancien format tout de suite, sans attendre un nouvel essai
                if (!(info && info.success) && (res.status === 404 || res.status === 0)) rawSupported = false;
            }
            if (!rawSupported && !(info && info.success)) {
                const dataUrl = await blobToDataUrl(blob);
                info = dataUrl ? await hubRequest('POST', '/api/upload', { id: promptData ? promptData.id : null, filename, image_data: dataUrl }, 15000) : null;
            }
            if (info && info.success) {
                const total = ((Date.now() - started) / 1000).toFixed(1);
                const sent = ((Date.now() - sendStart) / 1000).toFixed(1);
                if (info.low_resolution) {
                    updateStatus(`⚠️ ${filename} enregistré en basse résolution (${info.width}×${info.height}) : miniature de la galerie probable.`, '#E4572E', false);
                } else {
                    updateStatus(`✅ ${filename} enregistré en ${total} s (image ${fetchedIn.toFixed(1)} s, envoi ${sent} s, ${sizeKb} Ko).`, '#2A9D8F', false);
                }
                // Ne libère que ce prompt : un prompt suivant déjà envoyé par la file reste actif
                await hubRequest('POST', '/api/prompt-done', {
                    id: promptData ? promptData.id : null,
                    timestamp: promptData ? promptData.timestamp : null
                });
                return true;
            }
            if (attempt < 3) await sleep(1000);
        }
        updateStatus(`❌ Envoi de ${filename} impossible : le hub ne répond pas.`, '#E4572E');
        reportFlowError('upload_failed', `Enregistrement de ${filename} impossible : le hub ne répond pas.`);
        return false;
    }

    // =========================================================================
    // 3.5 SÉLECTION MANUELLE D'UNE IMAGE À REMPLACER (PICK & REPLACE v4.7)
    // =========================================================================
    let isPickMode = false;
    let hoveredCardEl = null;
    let pickFromHub = false;
    let pickCleanup = null;
    let pickTimer = null;

    function findImageAtPoint(x, y, path = []) {
        // 1. Chercher par composedPath (Shadow DOM / structure interne)
        for (const el of path) {
            if (el.tagName === 'IMG' && el.src && !el.src.includes('avatar')) {
                return el;
            }
            if (el.querySelector) {
                const found = el.querySelector('img');
                if (found && found.src && !found.src.includes('avatar') && found.naturalWidth > 100) {
                    return found;
                }
            }
        }

        // 2. Chercher par coordonnées géométriques (l'image dont la boîte contient x, y)
        const allImgs = Array.from(document.querySelectorAll('img')).filter(i => {
            if (!i.src || i.src.includes('avatar') || i.src.includes('googleusercontent.com/a/')) return false;
            if (!isVisible(i)) return false;
            const r = i.getBoundingClientRect();
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        });

        if (allImgs.length > 0) {
            allImgs.sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
            return allImgs[0];
        }

        // 3. Chercher l'image la plus proche du clic (dans un rayon de 350px)
        const candidates = Array.from(document.querySelectorAll('img')).filter(i => {
            if (!i.src || i.src.includes('avatar') || i.src.includes('googleusercontent.com/a/')) return false;
            return isVisible(i) && (i.naturalWidth > 120 || i.width > 120);
        });

        let best = null;
        let minDist = 350;
        for (const img of candidates) {
            const r = img.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dist = Math.hypot(x - cx, y - cy);
            if (dist < minDist) {
                minDist = dist;
                best = img;
            }
        }

        return best;
    }

    function cancelPickMode() {
        if (pickCleanup) pickCleanup();
    }

    function enablePickToReplace(options = {}) {
        const fromHub = !!options.fromHub;
        const timeoutMs = options.timeoutMs || 45000;
        if (!currentPrompt) {
            updateStatus("❌ Aucun prompt actif sélectionné.", '#E4572E');
            return;
        }

        if (isPickMode) {
            cancelPickMode();
            if (!fromHub) {
                updateStatus("Mode choix d'image annulé.", '#CBD5E1');
                return;
            }
        }

        isPickMode = true;
        pickFromHub = fromHub;
        updateStatus(fromHub
            ? `👉 Demande du Hub : cliquez sur l'image qui remplacera ${currentPrompt.filename}`
            : `👉 Cliquez sur l'image voulue pour remplacer ${currentPrompt.filename}...`, '#F2B705', true);

        // Boîte visuelle de survol dorée (ne bloque pas les clics)
        let highlightBox = document.getElementById('copilot-pick-highlight');
        if (!highlightBox) {
            highlightBox = document.createElement('div');
            highlightBox.id = 'copilot-pick-highlight';
            highlightBox.style.cssText = [
                'position: fixed !important',
                'border: 4px solid #F2B705 !important',
                'border-radius: 8px !important',
                'box-shadow: 0 0 20px rgba(242,183,5,0.7) !important',
                'pointer-events: none !important',
                'z-index: 2147483640 !important',
                'transition: all 0.1s ease !important',
                'display: none !important'
            ].join(';');
            document.body.appendChild(highlightBox);
        }

        function onPickMove(e) {
            if (!isPickMode) return;
            if (e.target.closest('#webnovel-flow-hub-widget')) {
                if (highlightBox) highlightBox.style.display = 'none';
                return;
            }

            const path = e.composedPath ? e.composedPath() : [e.target];
            const img = findImageAtPoint(e.clientX, e.clientY, path);
            if (img && highlightBox) {
                const r = (img.closest('[role="listitem"], [role="article"]') || img).getBoundingClientRect();
                highlightBox.style.display = 'block';
                highlightBox.style.top = `${r.top}px`;
                highlightBox.style.left = `${r.left}px`;
                highlightBox.style.width = `${r.width}px`;
                highlightBox.style.height = `${r.height}px`;
            } else if (highlightBox) {
                highlightBox.style.display = 'none';
            }
        }

        function onPickClick(e) {
            if (!isPickMode) return;
            if (e.target.closest('#webnovel-flow-hub-widget')) return;

            const path = e.composedPath ? e.composedPath() : [e.target];
            const img = findImageAtPoint(e.clientX, e.clientY, path);

            if (img && img.src) {
                e.preventDefault();
                e.stopPropagation();
                cleanup();

                updateStatus(`⏳ Remplacement par l'image choisie...`, '#F2B705', true);
                captureAndSave(img, currentPrompt.filename);
                console.log('🎯 [Flow Copilot] Image sélectionnée avec succès :', img);
            } else {
                updateStatus('❌ Aucune image sous le curseur. Réessayez.', '#E4572E');
            }
        }

        function cleanup() {
            isPickMode = false;
            pickFromHub = false;
            pickCleanup = null;
            clearTimeout(pickTimer);
            document.removeEventListener('mousemove', onPickMove, true);
            document.removeEventListener('click', onPickClick, true);
            const box = document.getElementById('copilot-pick-highlight');
            if (box && box.parentNode) box.parentNode.removeChild(box);
        }
        pickCleanup = cleanup;

        document.addEventListener('mousemove', onPickMove, true);
        document.addEventListener('click', onPickClick, true);

        // Annulation automatique (45 s en manuel, plus long quand la demande vient du Hub)
        pickTimer = setTimeout(() => {
            if (isPickMode) {
                cleanup();
                updateStatus('Mode sélection terminé.', '#CBD5E1');
            }
        }, timeoutMs);
    }

    // =========================================================================
    // 4. INTERFACE DU COPILOT
    // =========================================================================
    let widgetEl = null;
    let titleEl = null;
    let fileEl = null;
    let ratioEl = null;
    let statusMsgEl = null;
    let statusDotEl = null;
    let btnTestRatio = null;

    function deactivate(reason) {
        if (!isActive) return;
        isActive = false;
        timers.forEach((timer) => clearInterval(timer));
        document.querySelectorAll('[id="webnovel-flow-hub-widget"]').forEach((w) => {
            if (w.dataset.client === CLIENT_ID) w.remove();
        });
        console.warn(`[Flow Copilot] Copie ${CLIENT_ID} désactivée : ${reason}.`);
    }

    function injectUI() {
        if (!isActive) return;
        // Plusieurs copies sur la même page : la première installée reste active ; à égalité, l'identifiant le plus petit
        const widgets = Array.from(document.querySelectorAll('[id="webnovel-flow-hub-widget"]'));
        const hasMine = widgets.some((w) => w.dataset.client === CLIENT_ID);
        const rivals = widgets.map((w) => w.dataset.client).filter((id) => id && id !== CLIENT_ID);
        if (rivals.length > 0 && (!hasMine || rivals.some((id) => id < CLIENT_ID))) {
            deactivate('une autre copie du copilote est déjà active sur cette page');
            return;
        }
        if (widgets.length > 0) return;
        const parent = document.body || document.documentElement;
        if (!parent) return;

        widgetEl = document.createElement('div');
        widgetEl.id = 'webnovel-flow-hub-widget';
        widgetEl.dataset.client = CLIENT_ID;

        // Position mémorisée ou position par défaut (haut droite)
        let initialTop = '18px';
        let initialLeft = 'auto';
        let initialRight = '18px';

        try {
            const savedPosRaw = localStorage.getItem('webnovel_flow_widget_pos');
            if (savedPosRaw) {
                const savedPos = JSON.parse(savedPosRaw);
                const maxL = Math.max(10, window.innerWidth - 380);
                const maxT = Math.max(10, window.innerHeight - 150);
                const l = Math.min(Math.max(10, savedPos.left), maxL);
                const t = Math.min(Math.max(10, savedPos.top), maxT);
                initialLeft = `${l}px`;
                initialTop = `${t}px`;
                initialRight = 'auto';
            }
        } catch (e) { }

        widgetEl.style.cssText = [
            'position: fixed !important',
            `top: ${initialTop} !important`,
            `right: ${initialRight} !important`,
            initialLeft !== 'auto' ? `left: ${initialLeft} !important` : '',
            'width: 360px !important',
            'background: #12152B !important',
            'color: #FFFFFF !important',
            'border: 2px solid #F2B705 !important',
            'border-radius: 12px !important',
            'padding: 12px 14px !important',
            'box-shadow: 0 12px 40px rgba(0,0,0,0.88) !important',
            'z-index: 2147483647 !important',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
            'font-size: 13px !important',
            'line-height: 1.4 !important',
            'backdrop-filter: blur(10px) !important',
            'transition: width 0.2s ease, box-shadow 0.2s ease !important'
        ].filter(Boolean).join(';');

        // Header déplaçable (Drag handle)
        const header = document.createElement('div');
        header.id = 'copilot-drag-header';
        header.title = '⠿ Glissez pour déplacer le cadre • Double-clic pour réinitialiser en haut à droite';
        header.style.cssText = [
            'display: flex !important',
            'justify-content: space-between !important',
            'align-items: center !important',
            'margin-bottom: 8px !important',
            'cursor: grab !important',
            'user-select: none !important',
            '-webkit-user-select: none !important',
            'padding: 2px 0 6px 0 !important',
            'border-bottom: 1px solid rgba(255,255,255,0.08) !important'
        ].join(';');

        const headerLeft = document.createElement('div');
        headerLeft.style.cssText = 'display:flex; align-items:center; gap:6px; pointer-events:none;';

        const dragIcon = document.createElement('span');
        dragIcon.textContent = '⠿';
        dragIcon.style.cssText = 'color:#F2B705; font-size:16px; opacity:0.8; line-height:1; font-weight:bold;';

        const brand = document.createElement('span');
        brand.textContent = '🦊 Flow Copilot v5.6';
        brand.style.cssText = 'font-weight:700; color:#F2B705; font-size:13.5px; letter-spacing:0.2px;';

        headerLeft.appendChild(dragIcon);
        headerLeft.appendChild(brand);

        const headerRight = document.createElement('div');
        headerRight.style.cssText = 'display:flex; align-items:center; gap:6px;';

        const badge = document.createElement('span');
        badge.textContent = 'Connecté';
        badge.id = 'copilot-badge';
        badge.style.cssText = 'background:#2A9D8F; color:#fff; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:700; pointer-events:none;';

        const btnCollapse = document.createElement('button');
        btnCollapse.id = 'copilot-btn-collapse';
        btnCollapse.textContent = '−';
        btnCollapse.title = 'Réduire / Agrandir';
        btnCollapse.style.cssText = 'background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.25); border-radius:4px; width:22px; height:22px; font-size:15px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1;';

        headerRight.appendChild(badge);
        headerRight.appendChild(btnCollapse);

        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        const card = document.createElement('div');
        card.style.cssText = 'background:rgba(255,255,255,0.08); padding:10px 12px; border-radius:8px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.12);';

        titleEl = document.createElement('div');
        titleEl.textContent = 'En attente d\'un ordre du Hub...';
        titleEl.style.cssText = 'font-weight:600; color:#FFFFFF; margin-bottom:4px; font-size:12px;';

        fileEl = document.createElement('div');
        fileEl.textContent = 'Cliquez sur "Activer" dans le Hub';
        fileEl.style.cssText = 'color:#F2B705; font-family:monospace; font-size:11px; word-break:break-all;';

        const ratioRow = document.createElement('div');
        ratioRow.style.cssText = 'margin-top:6px; font-size:12px; color:#FFFFFF; display:flex; align-items:center; gap:8px; background:rgba(242,183,5,0.15); padding:4px 8px; border-radius:6px; border:1px solid rgba(242,183,5,0.3);';
        const ratioLabel = document.createElement('span');
        ratioLabel.textContent = '📐 Ratio requis :';
        ratioLabel.style.cssText = 'font-weight:600; color:#F2B705;';
        ratioEl = document.createElement('span');
        ratioEl.textContent = '-';
        ratioEl.style.cssText = 'color:#FFFFFF; font-weight:800; font-size:13px; background:#2A9D8F; padding:1px 8px; border-radius:4px;';
        ratioRow.appendChild(ratioLabel);
        ratioRow.appendChild(ratioEl);

        card.appendChild(titleEl);
        card.appendChild(fileEl);
        card.appendChild(ratioRow);

        const statusRow = document.createElement('div');
        statusRow.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:11px; color:#CBD5E1;';

        statusDotEl = document.createElement('div');
        statusDotEl.style.cssText = 'width:8px; height:8px; border-radius:50%; background:#2A9D8F; flex-shrink:0;';

        statusMsgEl = document.createElement('div');
        statusMsgEl.textContent = 'Prêt.';
        statusMsgEl.style.cssText = 'flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';

        statusRow.appendChild(statusDotEl);
        statusRow.appendChild(statusMsgEl);

        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex; flex-direction:column; gap:6px;';

        // Ligne de sauvegarde / remplacement
        const captureRow = document.createElement('div');
        captureRow.style.cssText = 'display:flex; gap:6px;';

        const btnCaptureNow = document.createElement('button');
        btnCaptureNow.id = 'copilot-btn-capture';
        btnCaptureNow.textContent = '📸 Remplacer (Gauche)';
        btnCaptureNow.title = 'Remplacer par la dernière image générée tout à gauche';
        btnCaptureNow.style.cssText = 'flex:1; background:#2A9D8F; color:#FFFFFF; border:none; border-radius:6px; padding:9px 8px; font-weight:700; font-size:11px; cursor:pointer;';
        btnCaptureNow.addEventListener('click', () => {
            const filename = currentPrompt ? currentPrompt.filename : 'f4-c15-p01-what-if-poster.jpeg';
            const img = getNewestGalleryImage();
            if (img) captureAndSave(img, filename);
            else updateStatus('❌ Image tout à gauche introuvable.', '#E4572E');
        });

        const btnPickReplace = document.createElement('button');
        btnPickReplace.id = 'copilot-btn-pick-replace';
        btnPickReplace.textContent = '🎯 Choisir & Remplacer';
        btnPickReplace.title = 'Cliquez sur n\'importe quelle image de la galerie pour remplacer le fichier actif';
        btnPickReplace.style.cssText = 'flex:1; background:rgba(42,157,143,0.2); color:#2A9D8F; border:1px solid #2A9D8F; border-radius:6px; padding:9px 8px; font-weight:700; font-size:11px; cursor:pointer;';
        btnPickReplace.addEventListener('click', () => enablePickToReplace());

        captureRow.appendChild(btnCaptureNow);
        captureRow.appendChild(btnPickReplace);

        const subActions = document.createElement('div');
        subActions.style.cssText = 'display:flex; gap:6px;';

        const btnRun = document.createElement('button');
        btnRun.id = 'copilot-btn-run';
        btnRun.textContent = '⚡ Coller & Générer';
        btnRun.style.cssText = 'flex:1; background:#F2B705; color:#12152B; border:none; border-radius:6px; padding:8px 10px; font-weight:700; font-size:12px; cursor:pointer;';
        btnRun.addEventListener('click', () => {
            if (currentPrompt) runPipeline(currentPrompt);
            else updateStatus('Aucun prompt en mémoire.', '#E4572E');
        });

        btnTestRatio = document.createElement('button');
        btnTestRatio.id = 'copilot-btn-test-ratio';
        const initialRatio = (currentPrompt && currentPrompt.ratio) ? currentPrompt.ratio : '16:9';
        btnTestRatio.textContent = `📐 Forcer ${initialRatio}`;
        btnTestRatio.style.cssText = 'background:rgba(242,183,5,0.15); color:#F2B705; border:1px solid #F2B705; border-radius:6px; padding:8px 8px; font-weight:700; font-size:11px; cursor:pointer; white-space:nowrap;';
        btnTestRatio.addEventListener('click', () => {
            const r = (currentPrompt && currentPrompt.ratio) ? currentPrompt.ratio : '16:9';
            applyRatioWithKeyboardAndScroll(r);
        });

        const btnCheck = document.createElement('button');
        btnCheck.id = 'copilot-btn-check';
        btnCheck.textContent = '🔄 Hub';
        btnCheck.style.cssText = 'background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:8px 8px; font-weight:600; font-size:11px; cursor:pointer;';
        btnCheck.addEventListener('click', async () => {
            const data = await hubRequest('GET', `/api/active-prompt?client=${encodeURIComponent(CLIENT_ID)}`);
            if (data) handlePromptData(data);
        });

        // Diagnostic visuel : entoure en rouge le bouton que le script prend pour la flèche « Générer »
        // et le champ de prompt, et décrit les deux dans le statut (à photographier en cas de problème).
        const btnDiag = document.createElement('button');
        btnDiag.id = 'copilot-btn-diag';
        btnDiag.textContent = '🔎 Tester la flèche';
        btnDiag.title = 'Montre en rouge le bouton Générer et le champ de prompt détectés (sans rien envoyer)';
        btnDiag.style.cssText = 'background:#2B2D42; color:#F2B705; border:1px solid #F2B705; border-radius:6px; padding:8px 10px; font-weight:700; font-size:12px; cursor:pointer;';
        btnDiag.addEventListener('click', () => {
            const input = findPromptInput();
            const btn = findSubmitButton(input);
            const describe = (el) => {
                if (!el) return 'introuvable';
                const r = el.getBoundingClientRect();
                return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} aria="${el.getAttribute('aria-label') || ''}" texte="${(el.innerText || '').trim().slice(0, 20)}" ${Math.round(r.width)}×${Math.round(r.height)} @(${Math.round(r.left)},${Math.round(r.top)}) disabled=${!!el.disabled || el.getAttribute('aria-disabled') === 'true'}`;
            };
            const outline = (el, color) => {
                if (!el) return;
                const old = el.style.outline;
                el.style.outline = `3px solid ${color}`;
                setTimeout(() => { el.style.outline = old; }, 6000);
            };
            outline(input, '#00B4D8');
            outline(btn, '#E4572E');
            const around = describeBottomRightElements();
            const report = `Flèche : ${describe(btn)} | Champ : ${describe(input)} | Éléments en bas à droite : ${around.join(' ; ') || 'aucun'}`;
            console.log('[Flow Copilot] 🔎 Diagnostic —', report, { btn, input, around });
            updateStatus(`🔎 ${report}`, btn ? '#F2B705' : '#E4572E', false);
            reportFlowError('diagnostic', report);
        });

        subActions.appendChild(btnRun);
        subActions.appendChild(btnTestRatio);
        subActions.appendChild(btnDiag);
        subActions.appendChild(btnCheck);

        actions.appendChild(captureRow);
        actions.appendChild(subActions);

        widgetEl.appendChild(header);
        widgetEl.appendChild(card);
        widgetEl.appendChild(statusRow);
        widgetEl.appendChild(actions);

        // ---------------------------------------------------------------------
        // Logique Réduire / Déplier
        // ---------------------------------------------------------------------
        let isCollapsed = false;
        try {
            isCollapsed = localStorage.getItem('webnovel_flow_widget_collapsed') === 'true';
        } catch (e) { }

        function applyCollapse(collapsed) {
            isCollapsed = collapsed;
            try { localStorage.setItem('webnovel_flow_widget_collapsed', isCollapsed); } catch (e) { }
            btnCollapse.textContent = isCollapsed ? '+' : '−';
            btnCollapse.title = isCollapsed ? 'Agrandir le panneau' : 'Réduire le panneau';
            card.style.display = isCollapsed ? 'none' : 'block';
            statusRow.style.display = isCollapsed ? 'none' : 'flex';
            actions.style.display = isCollapsed ? 'none' : 'flex';
            widgetEl.style.width = isCollapsed ? '250px' : '360px';
        }

        btnCollapse.addEventListener('click', (e) => {
            e.stopPropagation();
            applyCollapse(!isCollapsed);
        });

        if (isCollapsed) applyCollapse(true);

        // ---------------------------------------------------------------------
        // Logique de Déplacement (Drag & Drop)
        // ---------------------------------------------------------------------
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let elemStartX = 0;
        let elemStartY = 0;

        function onPointerDown(e) {
            if (e.target.closest('#copilot-btn-collapse')) return;

            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            const rect = widgetEl.getBoundingClientRect();
            elemStartX = rect.left;
            elemStartY = rect.top;

            widgetEl.style.left = `${elemStartX}px`;
            widgetEl.style.top = `${elemStartY}px`;
            widgetEl.style.right = 'auto';

            header.style.cursor = 'grabbing';
            dragIcon.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';

            window.addEventListener('pointermove', onPointerMove, { passive: false });
            window.addEventListener('pointerup', onPointerUp);
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            e.preventDefault();

            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;

            const maxLeft = Math.max(10, window.innerWidth - widgetEl.offsetWidth - 10);
            const maxTop = Math.max(10, window.innerHeight - widgetEl.offsetHeight - 10);

            const newLeft = Math.min(Math.max(10, elemStartX + deltaX), maxLeft);
            const newTop = Math.min(Math.max(10, elemStartY + deltaY), maxTop);

            widgetEl.style.left = `${newLeft}px`;
            widgetEl.style.top = `${newTop}px`;
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;

            header.style.cursor = 'grab';
            dragIcon.style.cursor = 'grab';
            document.body.style.userSelect = '';

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            try {
                const rect = widgetEl.getBoundingClientRect();
                localStorage.setItem('webnovel_flow_widget_pos', JSON.stringify({
                    left: Math.round(rect.left),
                    top: Math.round(rect.top)
                }));
            } catch (e) { }
        }

        header.addEventListener('pointerdown', onPointerDown);

        // Double-clic sur l'en-tête pour réinitialiser la position en haut à droite
        header.addEventListener('dblclick', (e) => {
            if (e.target.closest('#copilot-btn-collapse')) return;
            widgetEl.style.left = 'auto';
            widgetEl.style.right = '18px';
            widgetEl.style.top = '18px';
            try { localStorage.removeItem('webnovel_flow_widget_pos'); } catch (e) { }
            updateStatus('📍 Position réinitialisée en haut à droite.', '#2A9D8F');
        });

        parent.appendChild(widgetEl);
    }

    function updateWidgetUI(data) {
        if (!data) return;
        if (titleEl) titleEl.textContent = `#${data.id} — ${data.name || ''}`;
        if (fileEl) fileEl.textContent = data.filename;
        if (ratioEl) ratioEl.textContent = data.ratio;
        if (btnTestRatio && data.ratio) {
            btnTestRatio.textContent = `📐 Forcer ${data.ratio}`;
        }
    }

    function updateStatus(msg, color = '#CBD5E1', isActive = false) {
        if (statusMsgEl) {
            statusMsgEl.textContent = msg;
            statusMsgEl.style.color = color;
        }
        if (statusDotEl) {
            statusDotEl.style.background = isActive ? '#F2B705' : '#2A9D8F';
            statusDotEl.style.boxShadow = isActive ? '0 0 8px #F2B705' : 'none';
        }
        reportStatusToHub(msg);
    }

    // L'étape en cours est affichée dans le bandeau de la file du Hub (pour voir où ça bloque)
    function reportStatusToHub(msg) {
        if (msg === lastReportedStatus) return;
        lastReportedStatus = msg;
        hubRequest('POST', '/api/flow-status', {
            client: CLIENT_ID,
            id: currentPrompt ? currentPrompt.id : null,
            message: msg
        });
    }

    // =========================================================================
    // 5. RÉCEPTION DU PROMPT & ACTIONS DOM
    // =========================================================================
    function hubRequest(method, path, body, timeoutMs = 3000) {
        return new Promise((resolve) => {
            const url = `${HUB_URL}${path}`;
            const data = body ? JSON.stringify(body) : undefined;
            if (typeof GM_xmlhttpRequest !== 'undefined') {
                GM_xmlhttpRequest({
                    method,
                    url,
                    data,
                    timeout: timeoutMs,
                    headers: { 'Content-Type': 'application/json' },
                    onload: (resp) => {
                        try { resolve(JSON.parse(resp.responseText)); } catch (e) { resolve(null); }
                    },
                    onerror: () => resolve(null),
                    ontimeout: () => resolve(null)
                });
            } else {
                fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: data })
                    .then((r) => r.json())
                    .then(resolve)
                    .catch(() => resolve(null));
            }
        });
    }

    // Requête longue vers le Hub : il répond dès que le prompt actif change (ou après 20 s).
    // Contrairement à setInterval, la réponse réseau n'est pas ralentie quand l'onglet Flow est en arrière-plan,
    // et le Hub sait que cet onglet est ouvert tant qu'une requête attend (il n'en ouvre donc pas un autre).
    async function pollLoop() {
        let promptRev = null;
        while (isActive) {
            const revParam = promptRev === null ? '' : `&rev=${promptRev}`;
            const data = await hubRequest('GET', `/api/active-prompt?client=${encodeURIComponent(CLIENT_ID)}&wait=20${revParam}`, null, 30000);
            if (!isActive) break;
            if (!data) {
                await sleep(2000); // Hub arrêté ou injoignable
                continue;
            }
            if (data.rev === undefined) {
                await sleep(1500); // ancien Hub sans requête longue
            } else {
                promptRev = data.rev;
            }
            handlePromptData(data);
        }
    }

    function handlePromptData(data) {
        if (!isActive) return;
        if (!data.id) {
            // Remplacement terminé depuis un autre onglet ou annulé par le Hub
            if (isPickMode && pickFromHub) {
                cancelPickMode();
                updateStatus('Sélection terminée (autre onglet ou Hub).', '#CBD5E1');
            }
            return;
        }
        if (data.timestamp === lastProcessedTimestamp) return;
        if (isExecuting || isClaiming) {
            // Le hub n'envoie chaque prompt qu'une fois : on le garde pour la fin de l'enregistrement en cours
            pendingPromptData = data;
            return;
        }

        currentPrompt = data;
        updateWidgetUI(data);
        if (isPickMode) cancelPickMode();

        if (data.pick) {
            lastProcessedTimestamp = data.timestamp;
            enablePickToReplace({ fromHub: true, timeoutMs: 120000 });
        } else if (data.auto_run) {
            lastProcessedTimestamp = data.timestamp;
            claimAndRun(data);
        }
    }

    // Un seul onglet Flow a le droit d'exécuter une activation donnée : le Hub attribue la réservation
    async function claimAndRun(data) {
        isClaiming = true;
        updateStatus(`🔒 Réservation du prompt #${data.id} auprès du Hub...`, '#F2B705', true);
        try {
            const res = await hubRequest('POST', '/api/claim-prompt', { timestamp: data.timestamp, client: CLIENT_ID });
            if (res && res.granted) {
                runPipeline(data);
            } else {
                const why = res && res.reason === 'claimed'
                    ? 'déjà pris en charge par un autre onglet Flow'
                    : 'réservation refusée par le Hub';
                updateStatus(`⏸️ Prompt #${data.id} ${why} : aucune génération ici.`, '#CBD5E1', false);
            }
        } finally {
            isClaiming = false;
            runPendingPrompt();
        }
    }

    function runPendingPrompt() {
        if (!pendingPromptData || isExecuting || isClaiming) return;
        const data = pendingPromptData;
        pendingPromptData = null;
        handlePromptData(data);
    }

    function findPromptInput() {
        // 1. Chercher par sélecteurs classiques (contenteditable, textarea, role="textbox")
        const allCandidates = Array.from(document.querySelectorAll('[contenteditable="true"], textarea, [role="textbox"], input[type="text"]'))
            .filter(el => !el.closest('#webnovel-flow-hub-widget') && isVisible(el));

        // Priorité aux éléments situés dans la barre du bas
        const bottom = allCandidates.filter(el => el.getBoundingClientRect().bottom >= window.innerHeight - 200);
        if (bottom.length > 0) return bottom[bottom.length - 1];
        if (allCandidates.length > 0) return allCandidates[allCandidates.length - 1];

        // 2. Chercher par placeholder / aria-label contenant "what do you want"
        const byAttr = Array.from(document.querySelectorAll('*')).find(el => {
            if (el.closest('#webnovel-flow-hub-widget') || !isVisible(el)) return false;
            const ph = (el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
            return ph.includes('what do you want') || ph.includes('create') || ph.includes('prompt');
        });
        if (byAttr) return byAttr.closest('[contenteditable="true"]') || byAttr.closest('textarea') || byAttr;

        // 3. Chercher par texte "What do you want to create"
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue && node.nodeValue.includes('What do you want to create')) {
                const parent = node.parentElement;
                if (parent && !parent.closest('#webnovel-flow-hub-widget')) {
                    return parent.closest('[contenteditable="true"]') || parent.closest('textarea') || parent.closest('div[role="textbox"]') || parent;
                }
            }
        }
        return null;
    }

    const normalizeText = (s) => (s || '').replace(/\s+/g, ' ').trim();

    function readInputText(el) {
        return typeof el.value === 'string' ? el.value : (el.innerText || el.textContent || '');
    }

    function selectAllInInput(inputEl) {
        try {
            if (inputEl.select) {
                inputEl.select();
            } else {
                const range = document.createRange();
                range.selectNodeContents(inputEl);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } catch (e) { }
    }

    // Le prompt remplace tout le contenu du champ, une seule fois.
    // (v5.1 envoyait en plus un faux événement « insertText » après l'insertion : certains éditeurs l'appliquaient
    // une deuxième fois, d'où le prompt collé en double.)
    function fillPromptText(inputEl, text) {
        const wanted = normalizeText(text);
        inputEl.focus();
        selectAllInInput(inputEl);

        let inserted = false;
        try {
            inserted = document.execCommand('insertText', false, text);
        } catch (e) { }

        if (!inserted || normalizeText(readInputText(inputEl)) !== wanted) {
            selectAllInInput(inputEl);
            try { document.execCommand('delete', false); } catch (e) { }
            if (typeof inputEl.value === 'string') {
                const proto = inputEl instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
                const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
                if (setter) setter.call(inputEl, text);
                else inputEl.value = text;
            } else {
                inputEl.textContent = text;
            }
            // Événement sans texte : l'éditeur relit le champ sans rien réinsérer
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Vrai si le champ contient le prompt plus d'une fois ou beaucoup plus de texte que le prompt
    function promptLooksDuplicated(inputEl, text) {
        const wanted = normalizeText(text);
        const current = normalizeText(readInputText(inputEl));
        const head = wanted.slice(0, 60);
        const occurrences = head ? current.split(head).length - 1 : 0;
        return occurrences > 1 || current.length > wanted.length * 1.3;
    }

    function findSubmitButton(inputEl) {
        const widget = document.getElementById('webnovel-flow-hub-widget');
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'))
            .filter(b => !(widget && widget.contains(b)));

        // 1. Libellé accessible explicite (le plus fiable)
        const byAria = buttons.find(b => {
            const aria = ((b.getAttribute('aria-label') || '') + ' ' + (b.getAttribute('title') || '')).toLowerCase();
            return aria.includes('generate') || aria.includes('send') || aria.includes('submit')
                || aria.includes('create') || aria.includes('générer') || aria.includes('envoyer');
        });
        if (byAria) return byAria;

        // 2. Sinon : la flèche « → » est le petit bouton le PLUS À DROITE du composeur, en bas de page.
        //    Le bouton « + » (ajout de média) est lui aussi petit et sans texte, mais tout à gauche :
        //    on ne prend jamais un bouton situé à gauche du milieu du champ de prompt.
        const inputRect = inputEl ? inputEl.getBoundingClientRect() : null;
        const minX = inputRect ? inputRect.left + inputRect.width / 2 : window.innerWidth / 2;
        // Icônes Material affichées sous forme de texte-ligature (ex. « arrow_forward ») : ce texte n'est pas visible
        // mais apparaît dans innerText. On accepte les icônes de type flèche/envoi, on refuse ajout/pièce jointe/micro.
        const ARROW_ICONS = /^(arrow_forward|arrow_upward|arrow_right_alt|send|north_east|east|play_arrow|→|➜|>)$/i;
        const FORBIDDEN_ICONS = /(^|\b)(add|attach_file|attachment|mic|more_vert|more_horiz|close|tune|settings)(\b|$)/i;
        const isSmallBottomRight = (el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            if (r.top < window.innerHeight - 200 || r.width > 70 || r.height > 70) return false;
            return r.left >= minX;
        };
        const looksLikeArrow = (el) => {
            const t = (el.innerText || el.textContent || '').trim();
            if (t.includes('Banana') || t.includes('Agent') || t === '+' || FORBIDDEN_ICONS.test(t)) return false;
            if (ARROW_ICONS.test(t)) return true;
            if (t.length > 3) return false; // texte visible réel : ce n'est pas une icône seule
            const icon = el.querySelector('svg, img, i, span');
            const iconName = icon ? ((icon.getAttribute('aria-label') || icon.getAttribute('data-icon') || icon.getAttribute('alt') || icon.textContent || '').trim()) : '';
            if (FORBIDDEN_ICONS.test(iconName)) return false;
            return !!el.querySelector('svg, img') || ARROW_ICONS.test(iconName) || t.includes('→') || t.includes('>');
        };
        const enabled = (el) => !(el.disabled || el.getAttribute('aria-disabled') === 'true');

        let candidates = buttons.filter(b => isSmallBottomRight(b) && enabled(b) && looksLikeArrow(b));
        if (!candidates.length) {
            // La flèche n'est peut-être pas un <button> : n'importe quel petit élément cliquable en bas à droite
            candidates = Array.from(document.querySelectorAll('div, span, a'))
                .filter(el => !(widget && widget.contains(el)) && !(inputEl && inputEl.contains(el)))
                .filter(el => isSmallBottomRight(el) && looksLikeArrow(el))
                .filter(el => { const cs = getComputedStyle(el); return cs.cursor === 'pointer' || el.onclick || el.getAttribute('tabindex') !== null; });
        }
        if (candidates.length) {
            candidates.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
            return candidates[0];
        }
        return null;
    }

    // Pour le diagnostic : les petits éléments de la zone en bas à droite (là où doit se trouver la flèche)
    function describeBottomRightElements() {
        const widget = document.getElementById('webnovel-flow-hub-widget');
        const out = [];
        for (const el of document.querySelectorAll('button, [role="button"], div, span, a, i')) {
            if (widget && widget.contains(el)) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0 || r.width > 70 || r.height > 70) continue;
            if (r.top < window.innerHeight - 200 || r.left < window.innerWidth * 0.55) continue;
            if (el.children.length > 3) continue;
            out.push(`${el.tagName.toLowerCase()} "${(el.innerText || el.textContent || '').trim().slice(0, 20)}" aria="${el.getAttribute('aria-label') || ''}" ${Math.round(r.width)}×${Math.round(r.height)}@(${Math.round(r.left)},${Math.round(r.top)}) svg=${!!el.querySelector('svg')} cursor=${getComputedStyle(el).cursor}`);
            if (out.length >= 12) break;
        }
        return out;
    }

    // Le champ contient-il encore (presque) tout le prompt ? Flow vide le champ dès qu'il accepte la demande.
    function promptStillInInput(inputEl, text) {
        try {
            const current = (inputEl.value !== undefined ? inputEl.value : (inputEl.innerText || inputEl.textContent || '')).trim();
            if (!current) return false;
            const head = text.trim().slice(0, 80);
            return current.length > text.length * 0.6 && current.includes(head);
        } catch (e) { return false; }
    }

    // Indices qu'une génération vient de démarrer. Attention : Flow GARDE le texte du prompt dans le champ
    // après l'envoi, donc « champ vidé » n'est qu'un indice parmi d'autres, jamais une condition.
    function generationSeemsStarted(inputEl, text, beforeImgCount) {
        if (!promptStillInInput(inputEl, text)) return 'champ vidé';
        if (findProgressPercent()) return 'pourcentage affiché';
        const btn = findSubmitButton(inputEl);
        if (!btn) return 'bouton Générer masqué';
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return 'bouton Générer désactivé';
        const aria = ((btn.getAttribute('aria-label') || '') + ' ' + (btn.getAttribute('title') || '')).toLowerCase();
        if (aria.includes('stop') || aria.includes('arrêter') || aria.includes('cancel') || aria.includes('annuler')) return 'bouton Stop visible';
        const imgCount = document.querySelectorAll('img').length;
        if (imgCount > beforeImgCount) return 'nouvelle vignette';
        return null;
    }

    function dispatchEnter(inputEl) {
        try { inputEl.focus(); } catch (e) { }
        for (const type of ['keydown', 'keypress', 'keyup']) {
            inputEl.dispatchEvent(new KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, composed: true }));
        }
    }

    // Soumission : UN clic sur la flèche ; si aucun signe de démarrage après 6 s, UNE seule relance par la touche Entrée.
    // On ne relance jamais plus (risque de générer la même image plusieurs fois) : la boucle d'attente tranche ensuite.
    async function submitPromptVerified(inputEl, text) {
        const beforeImgCount = document.querySelectorAll('img').length;
        const btn = findSubmitButton(inputEl);
        if (btn) {
            console.log('🚀 [Flow Copilot] Clic sur le bouton Générer :', btn, btn.getAttribute('aria-label'));
            try { btn.scrollIntoView({ block: 'nearest' }); } catch (e) { }
            // Séquence pointer/mouse complète (comme pour le ratio) : certains boutons réagissent au
            // pointerdown/pointerup et ignorent un simple .click() programmatique.
            fireDeepClick(btn);
        } else {
            console.warn('[Flow Copilot] Bouton Générer introuvable : envoi de la touche Entrée');
            dispatchEnter(inputEl);
        }
        for (let i = 0; i < 12; i++) {
            await sleep(500);
            const sign = generationSeemsStarted(inputEl, text, beforeImgCount);
            if (sign) { console.log('[Flow Copilot] Génération démarrée (indice :', sign, ')'); return true; }
        }
        console.warn('[Flow Copilot] Aucun signe de démarrage après 6 s : relance unique par la touche Entrée');
        updateStatus('Aucun signe de démarrage, relance unique (touche Entrée)...', '#F2B705', true);
        dispatchEnter(inputEl);
        for (let i = 0; i < 8; i++) {
            await sleep(500);
            const sign = generationSeemsStarted(inputEl, text, beforeImgCount);
            if (sign) { console.log('[Flow Copilot] Génération démarrée après relance (indice :', sign, ')'); return true; }
        }
        return false;
    }

    // Pourcentage de progression affiché par Flow (ex. « 42% »), hors panneau du copilote.
    // Lecture des textes uniquement : aucun calcul de style sur chaque élément de la page.
    function findProgressPercent() {
        if (!document.body) return null;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const match = (node.nodeValue || '').match(/\b\d{1,2}%/);
            if (match && node.parentElement && !node.parentElement.closest('#webnovel-flow-hub-widget')) return match[0];
        }
        return null;
    }

    // =========================================================================
    // 6. PIPELINE D'EXÉCUTION COMPLET (OPTION B)
    // =========================================================================
    async function runPipeline(promptData) {
        if (isExecuting) return;
        isExecuting = true;

        try {
            updateWidgetUI(promptData);
            updateStatus(`Étape 1/4 : Préparation de ${promptData.filename}...`, '#F2B705', true);

            // 1. Saisie du prompt avec retry
            updateStatus('Étape 1/3 : Recherche du champ prompt...', '#F2B705', true);
            let input = findPromptInput();
            for (let i = 0; i < 15 && !input; i++) {
                await sleep(200);
                input = findPromptInput();
            }
            if (!input) {
                const bottomArea = document.elementFromPoint(window.innerWidth / 3, window.innerHeight - 60);
                if (bottomArea) {
                    bottomArea.click();
                    await sleep(300);
                    input = findPromptInput();
                }
            }
            if (!input) throw new Error("Champ de prompt introuvable. Cliquez dans 'What do you want to create?'.");

            fillPromptText(input, promptData.prompt);
            await sleep(250);

            // 2. Réglage du ratio, seulement s'il diffère du dernier ratio appliqué sur cette page
            if (lastAppliedRatio !== promptData.ratio) {
                updateStatus(`Étape 2/3 : Réglage du ratio (${promptData.ratio})...`, '#F2B705', true);
                if (await applyRatioWithKeyboardAndScroll(promptData.ratio)) lastAppliedRatio = promptData.ratio;
                await sleep(300);
            }

            try {
                input.focus();
                input.click();
            } catch (e) { }
            await sleep(300);

            // Contrôle avant génération : jamais de prompt en double dans le champ
            if (promptLooksDuplicated(input, promptData.prompt)) {
                console.warn('[Flow Copilot] Prompt en double détecté dans le champ : nouvelle saisie unique.');
                fillPromptText(input, promptData.prompt);
                await sleep(400);
                if (promptLooksDuplicated(input, promptData.prompt)) {
                    throw new Error('Le champ contient le prompt en double : génération annulée. Videz le champ puis relancez depuis le Hub.');
                }
            }

            // 3. Mémorisation ULTRA-PRÉCISE de l'état EXACT immédiatement avant le clic
            const beforeTopLeft = getNewestGalleryImage();
            const beforeTopLeftSrc = beforeTopLeft ? beforeTopLeft.src : '';
            const beforeFingerprint = beforeTopLeft ? getImageFingerprint(beforeTopLeft) : '';
            const beforeAllSrcs = new Set(
                Array.from(document.querySelectorAll('img'))
                    .map(i => i.src)
                    .filter(s => s && !s.includes('avatar') && !s.includes('googleusercontent.com/a/'))
            );
            console.log('[Flow Copilot] 📸 Image de tête AVANT soumission :', beforeTopLeftSrc.slice(0, 60));

            // 4. UN SEUL clic propre sur la flèche de génération
            updateStatus('Étape 3/3 : Lancement de la génération...', '#F2B705', true);
            const submitTime = Date.now();
            const submitted = await submitPromptVerified(input, promptData.prompt);
            if (!submitted) {
                // Pas de preuve de démarrage : on n'abandonne pas (Flow ne donne pas toujours d'indice),
                // on laisse la boucle d'attente détecter l'image ; l'utilisateur est prévenu.
                console.warn('[Flow Copilot] Démarrage non confirmé : attente de l\'image quand même.');
                updateStatus('Démarrage non confirmé. Si rien n\'apparaît dans 30 s, cliquez vous-même sur la flèche ➜.', '#F2B705', true);
            }

            // 5. Attente active de la fin réelle de la génération
            updateStatus('Génération lancée... En cours de calcul...', '#F2B705', true);

            const start = Date.now();
            let newImg = null;
            let detectedError = null;

            while (Date.now() - start < 240000) {
                const elapsedSinceClick = Date.now() - submitTime;

                // A.0 Détection infaillible de Quota / Limite d'utilisation sur Google Flow
                try {
                    const fullText = (document.body.innerText || '').toLowerCase();
                    const widget = document.getElementById('webnovel-flow-hub-widget');
                    const widgetText = widget ? (widget.innerText || '').toLowerCase() : '';
                    const cleanPageText = fullText.replace(widgetText, '');

                    const limitKeywords = [
                        "you've reached your usage limit",
                        "reached your usage limit",
                        "usage limit",
                        "rate limit",
                        "quota exceeded",
                        "too many requests",
                        "try again later",
                        "generation failed",
                        "unable to generate",
                        "failed to generate"
                    ];

                    for (const kw of limitKeywords) {
                        if (cleanPageText.includes(kw)) {
                            detectedError = "Quota ou limite d'utilisation atteinte sur Google Flow (Usage limit). Basculez de compte Google.";
                            break;
                        }
                    }
                } catch (e) { }

                if (detectedError) {
                    console.warn('[Flow Copilot] 🛑 Quota ou Erreur Flow détectée :', detectedError);
                    updateStatus(`⚠️ Limite/Quota : ${detectedError}`, '#E4572E', false);
                    reportFlowError('quota_or_limit', detectedError);
                    break;
                }

                // A. GARANTIE ABSOLUE DE DURÉE MINIMALE :
                // Nano Banana Pro prend toujours au moins 10 à 25 secondes pour générer une image.
                // Si moins de 10 secondes se sont écoulées, l'image présente à l'écran est FORCÉMENT l'ancienne !
                if (elapsedSinceClick < 10000) {
                    updateStatus(`Génération en cours (${Math.round(elapsedSinceClick / 1000)}s)...`, '#F2B705', true);
                    await sleep(1000);
                    continue;
                }

                // B. L'arrivée d'une nouvelle image est vérifiée avant tout pourcentage affiché :
                // un « % » présent ailleurs sur la page ne doit plus bloquer la fin de la génération.

                // C. Vérifier si une NOUVELLE image est apparue tout à gauche
                const currentTopLeft = getNewestGalleryImage();
                if (currentTopLeft && currentTopLeft.complete && currentTopLeft.naturalWidth >= 250) {
                    // VERIFICATIONS ULTRA-STRICTES ANTI-FAUX-POSITIF :
                    const isSameNode = (beforeTopLeft && currentTopLeft === beforeTopLeft);
                    const isSameSrc = (beforeTopLeftSrc && currentTopLeft.src === beforeTopLeftSrc);
                    const wasInBeforeList = beforeAllSrcs.has(currentTopLeft.src);

                    let isSameFingerprint = false;
                    if (beforeFingerprint) {
                        const currentFingerprint = getImageFingerprint(currentTopLeft);
                        isSameFingerprint = (currentFingerprint === beforeFingerprint);
                    }

                    if (!(isSameNode || isSameSrc || wasInBeforeList || isSameFingerprint)) {
                        // D. NOUVELLE IMAGE CONFIRMÉE !
                        console.log('🎉 [Flow Copilot] NOUVELLE IMAGE VALIDÉE pour', promptData.filename, ':', currentTopLeft.src.slice(0, 60));
                        updateStatus('Nouvelle image confirmée ! Finalisation...', '#2A9D8F', true);
                        await sleep(800); // stabilisation du rendu
                        newImg = currentTopLeft;
                        break;
                    }
                }

                // C. Toujours l'ancienne image : afficher la progression de Flow si elle est visible
                const foundPct = findProgressPercent();
                updateStatus(foundPct
                    ? `Calcul en cours (${foundPct})...`
                    : `Flow génère l'image (30 à 90 s en général)... ${Math.round(elapsedSinceClick / 1000)}s`, '#F2B705', true);
                await sleep(1000);
            }

            if (newImg) {
                await captureAndSave(newImg, promptData);
            } else {
                if (!detectedError) {
                    reportFlowError('timeout', 'Délai d\'attente dépassé sans réponse du modèle.');
                }
                updateStatus('Cliquez sur "📸 Sauvegarder l\'image de gauche".', '#E4572E');
            }

        } catch (err) {
            console.error('[Webnovel Flow Copilot]', err);
            updateStatus(`❌ Erreur : ${err.message}`, '#E4572E', false);
            reportFlowError('pipeline_error', err.message);
        } finally {
            isExecuting = false;
            runPendingPrompt();
        }
    }

    function init() {
        injectUI();
        if (!isActive) return;
        syncFlowUrlToHub();
        pollLoop();

        window.addEventListener('popstate', syncFlowUrlToHub);
        timers.push(setInterval(injectUI, 2000));
        timers.push(setInterval(syncFlowUrlToHub, 2000));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
