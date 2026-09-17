/* ==========================================================================
   Flow Image Hub — Logique Client & Synchronisation en Temps Réel
   Avec maintien de la position de défilement (Scroll Preservation),
   remplacement d'image in-place, auto-génération séquentielle (Queue Runner)
   et détection d'épuisement de quota avec bascule de compte.
   ========================================================================== */

let allPrompts = [];
let currentFilterStatus = 'all';
let currentFilterFlow = 'all';
let currentSearchQuery = '';
let activePromptId = null;
let currentPreviewItem = null;
let flowProjectUrl = "https://flow.google.com/u/1/project/3da8607c-5f4d-4421-86b8-10b05ce8093b";

let lastServerRevision = 0;
let lastServerUpdateTime = 0;
let isPollingActive = true;

// État de la file d'attente automatique (Auto-Queue)
let isAutoQueueRunning = false;
let currentQueuePromptId = null;
let queueWaitTimeout = null;

// Présence Google Flow (heartbeat du userscript) & remplacement d'image
let flowTabsConnected = 0;
let flowLegacyScript = false;
let replaceTargetItem = null;

// Sélection de pages & régénération par lot
let selectionMode = false;
const selectedIds = new Set();
const metricsDefectsById = new Map(); // id -> texte des mesures hors cible
let queueTargetIds = null;            // null : file des en attente ; tableau : file d'une sélection
let queueTargetTotal = 0;

// Mesures automatiques & auto-régénération des pages non conformes
const AUTO_REGEN_MAX = 2;             // essais supplémentaires maximum par page, pour préserver le quota Flow
let autoRegenEnabled = false;
try { autoRegenEnabled = localStorage.getItem('flow_hub_auto_regen') === '1'; } catch (e) {}
const autoRegenAttempts = new Map();  // id -> essais déjà relancés pendant la file
// Option « Jusqu'à conformité » : nouveaux tours tant qu'il reste des pages non conformes
const MAX_CONFORM_ROUNDS = 5;         // limite pour préserver le quota Flow si une page n'y arrive jamais
let untilConformEnabled = false;
try { untilConformEnabled = localStorage.getItem('flow_hub_until_conform') === '1'; } catch (e) {}
let conformRound = 0;
let queueRetryIds = [];               // pages non conformes à relancer en priorité
const queueProcessedIds = new Set();  // pages enregistrées pendant la file, pour le bilan
let lastMetricsRevision = 0;
let pollInFlight = false;
let pollQueued = false;

// Minuteries qui ne ralentissent pas quand l'onglet du hub est en arrière-plan
// (les navigateurs limitent setTimeout à une fois par minute dans un onglet caché ; pas dans un Worker).
const backgroundTimer = (() => {
  try {
    const source = 'const t={};onmessage=(e)=>{const d=e.data;if(d.cancel){clearTimeout(t[d.id]);delete t[d.id];return;}'
      + 't[d.id]=setTimeout(()=>{delete t[d.id];postMessage(d.id);},d.ms);};';
    const worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
    const callbacks = new Map();
    let nextId = 1;
    worker.onmessage = (e) => {
      const callback = callbacks.get(e.data);
      callbacks.delete(e.data);
      if (callback) callback();
    };
    return {
      setTimeout(callback, ms) {
        const id = nextId++;
        callbacks.set(id, callback);
        worker.postMessage({ id, ms });
        return id;
      },
      clearTimeout(id) {
        if (callbacks.delete(id)) worker.postMessage({ id, cancel: true });
      }
    };
  } catch (e) {
    return { setTimeout: (callback, ms) => window.setTimeout(callback, ms), clearTimeout: (id) => window.clearTimeout(id) };
  }
})();
const sleepMs = (ms) => new Promise((resolve) => backgroundTimer.setTimeout(resolve, ms));

// DOM Elements
const promptsGrid = document.getElementById('prompts-grid');
const emptyState = document.getElementById('empty-state');
const statTotal = document.getElementById('stat-total');
const statDone = document.getElementById('stat-done');
const statPending = document.getElementById('stat-pending');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const btnNextPending = document.getElementById('btn-next-pending');
const btnTampermonkey = document.getElementById('btn-tampermonkey');
const activeBanner = document.getElementById('active-prompt-banner');
const activeFlowBadge = document.getElementById('active-flow-badge');
const activeRatioBadge = document.getElementById('active-ratio-badge');
const activeTitle = document.getElementById('active-title');
const activeFilename = document.getElementById('active-filename');
const btnActiveCopy = document.getElementById('btn-active-copy');
const btnActiveOpenFlow = document.getElementById('btn-active-open-flow');
const btnCloseBanner = document.getElementById('btn-close-banner');

// Nouveaux éléments Auto-Queue & URL
const btnAutoQueue = document.getElementById('btn-auto-queue');
const autoQueueBanner = document.getElementById('auto-queue-banner');
const queueCurrentTitle = document.getElementById('queue-current-title');
const queueCounter = document.getElementById('queue-counter');
const queueSubtext = document.getElementById('queue-subtext');
const btnStopQueue = document.getElementById('btn-stop-queue');

// Sélection & régénération
const btnSelectionMode = document.getElementById('btn-selection-mode');
const selectionBar = document.getElementById('selection-bar');
const selectionCount = document.getElementById('selection-count');
const btnSelectNonConform = document.getElementById('btn-select-nonconform');
const btnSelectVisible = document.getElementById('btn-select-visible');
const btnClearSelection = document.getElementById('btn-clear-selection');
const btnRegenerateSelection = document.getElementById('btn-regenerate-selection');
const btnExitSelection = document.getElementById('btn-exit-selection');
const toggleAutoRegen = document.getElementById('toggle-auto-regen');
const toggleUntilConform = document.getElementById('toggle-until-conform');
const btnRegenerateNonconform = document.getElementById('btn-regenerate-nonconform');

// Modals
const tampermonkeyModal = document.getElementById('tampermonkey-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnDismissModal = document.getElementById('btn-dismiss-modal');
const previewModal = document.getElementById('preview-modal');
const previewModalImg = document.getElementById('preview-modal-img');
const previewModalTitle = document.getElementById('preview-modal-title');
const previewModalFilename = document.getElementById('preview-modal-filename');
const previewModalLocation = document.getElementById('preview-modal-location');
const btnClosePreview = document.getElementById('btn-close-preview');
const btnModalReplace = document.getElementById('btn-modal-replace');
const btnModalFocus = document.getElementById('btn-modal-focus');
const modalFileInput = document.getElementById('modal-file-input');

// Error Modal Elements
const flowErrorModal = document.getElementById('flow-error-modal');
const btnCloseErrorModal = document.getElementById('btn-close-error-modal');
const btnOpenFlowSwitch = document.getElementById('btn-open-flow-switch');
const btnResumeQueue = document.getElementById('btn-resume-queue');
const errorModalReason = document.getElementById('error-modal-reason');

// URL Config Elements
const btnFlowUrl = document.getElementById('btn-flow-url');
const flowUrlModal = document.getElementById('flow-url-modal');
const btnCloseUrlModal = document.getElementById('btn-close-url-modal');
const btnDismissUrlModal = document.getElementById('btn-dismiss-url-modal');
const inputFlowUrl = document.getElementById('input-flow-url');
const btnSaveFlowUrl = document.getElementById('btn-save-flow-url');

// Remplacement (ordinateur ou Google Flow) & indicateur de présence Flow
const replaceModal = document.getElementById('replace-modal');
const replaceModalTitle = document.getElementById('replace-modal-title');
const replaceModalFile = document.getElementById('replace-modal-file');
const btnReplaceFromComputer = document.getElementById('btn-replace-from-computer');
const btnReplaceFromFlow = document.getElementById('btn-replace-from-flow');
const btnCloseReplaceModal = document.getElementById('btn-close-replace-modal');
const replaceModalFileInput = document.getElementById('replace-modal-file-input');
const flowStatusPill = document.getElementById('flow-status-pill');
const flowStatusVal = document.getElementById('flow-status-val');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  setupEventListeners();
  loadPromptsInitial();
  startLivePolling();
  setupScrollTracking();
});

async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.flow_url) {
        flowProjectUrl = data.flow_url;
        if (inputFlowUrl) inputFlowUrl.value = flowProjectUrl;
      }
    }
  } catch (e) {}
}

// Bip sonore d'alerte pour avertir l'utilisateur (Quota atteint / Erreur)
function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

// Suivi automatique du défilement pour restaurer la position exacte lors d'un rechargement
function setupScrollTracking() {
  let scrollTimeout = null;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      sessionStorage.setItem('flow_hub_scroll_y', window.scrollY);
    }, 150);
  }, { passive: true });
}

// --------------------------------------------------------------------------
// Synchronisation en direct & Polling haute réactivité
// --------------------------------------------------------------------------
function startLivePolling() {
  let changesSupported = true;
  // Filet de sécurité : relecture régulière (fiches visual_plan modifiées, onglets Flow connectés)
  const tick = async () => {
    await pollServerOnce();
    backgroundTimer.setTimeout(tick, changesSupported ? 4000 : 1200);
  };
  tick();

  // Temps réel : le serveur répond dès qu'une image, une décision, une mesure ou le prompt actif change
  (async () => {
    let since = -1;
    while (changesSupported) {
      try {
        const res = await fetch(`/api/changes?since=${since}&wait=20`);
        if (res.status === 404) {
          changesSupported = false; // hub pas encore redémarré : relecture rapide à la place
          break;
        }
        const data = await res.json();
        if (data.change !== since) {
          const firstCall = since === -1;
          since = data.change;
          if (!firstCall) await pollServerOnce();
        }
      } catch (e) {
        await sleepMs(2000);
      }
    }
  })();
  // Retour sur l'onglet du hub : synchronisation immédiate
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) pollServerOnce();
  });
}

async function pollServerOnce() {
    if (!isPollingActive) return;
    if (pollInFlight) {
      pollQueued = true; // un changement arrivé pendant une lecture sera relu juste après
      return;
    }
    pollInFlight = true;

    try {
      const res = await fetch('/api/prompts');
      if (!res.ok) return;
      const data = await res.json();

      // Synchronisation dynamique de l'URL Flow si Tampermonkey a basculé de projet
      if (data.flow_url && data.flow_url !== flowProjectUrl) {
        console.log(`[Hub Polling] Nouvelle URL Flow détectée : ${data.flow_url}`);
        flowProjectUrl = data.flow_url;
        if (inputFlowUrl) inputFlowUrl.value = flowProjectUrl;
      }
      updateFlowPresence(data);

      // Si le serveur remonte une erreur Flow et que la file d'attente est active
      if (data.flow_error && isAutoQueueRunning) {
        const msg = (data.flow_error && data.flow_error.message) || 'Le compte Flow a atteint son quota ou une erreur est survenue.';
        triggerFlowError(msg);
      }

      const previousUpdateTime = lastServerUpdateTime;
      lastServerRevision = data.revision || 0;
      lastServerUpdateTime = data.last_updated_time || 0;
      lastMetricsRevision = data.metrics_revision || 0;

      // Chaque carte modifiée (image, statut, contrôle, mesures, prompt) est mise à jour,
      // même si plusieurs images ont changé depuis la dernière synchronisation
      syncPrompts(data.prompts);
      updateGlobalStats(data);

      const targetId = data.last_updated_id;
      if (targetId && lastServerUpdateTime > previousUpdateTime) {
        scrollToAndHighlightCard(targetId, true);
        showToast(`✨ Image #${targetId} (${data.last_updated_filename || 'remplacée'}) mise à jour !`, 'success');
        if (data.last_updated_low_res) {
          showToast(`⚠️ Image #${targetId} en basse résolution (moins de 1000 px de haut) : probablement une miniature de la galerie Flow. Téléchargez l'image en pleine taille puis utilisez « Depuis l'ordinateur ».`, 'error');
        }
      }
    } catch (e) {
    } finally {
      pollInFlight = false;
      if (pollQueued) {
        pollQueued = false;
        pollServerOnce();
      }
    }
}

// Premier chargement de la liste des prompts
async function loadPromptsInitial() {
  try {
    const res = await fetch('/api/prompts');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allPrompts = data.prompts;
    lastServerRevision = data.revision || 0;
    lastServerUpdateTime = data.last_updated_time || 0;
    lastMetricsRevision = data.metrics_revision || 0;
    updateGlobalStats(data);
    updateFlowPresence(data);
    renderGrid();

    // Restaurer la dernière position de lecture / carte active
    const savedCardId = localStorage.getItem('flow_hub_target_card');
    const savedScrollY = sessionStorage.getItem('flow_hub_scroll_y');

    setTimeout(() => {
      if (savedCardId && document.getElementById(`card-${savedCardId}`)) {
        scrollToAndHighlightCard(savedCardId, false);
      } else if (savedScrollY) {
        window.scrollTo({ top: parseInt(savedScrollY, 10), behavior: 'instant' });
      }
    }, 120);

  } catch (err) {
    console.error('Erreur de chargement des prompts:', err);
    showToast('❌ Erreur lors du chargement des prompts', 'error');
  }
}

// Mise à jour des compteurs et barre de progression
function updateGlobalStats(data) {
  if (!data) return;
  statTotal.textContent = data.total;
  statDone.textContent = data.done;
  statPending.textContent = data.pending;
  progressBar.style.width = `${data.percent}%`;
  progressPercent.textContent = `${data.percent}%`;
}

// --------------------------------------------------------------------------
// Maintien absolu du défilement & Défilement vers la ligne modifiée
// --------------------------------------------------------------------------
function scrollToAndHighlightCard(id, smooth = true) {
  if (!id) return;
  const card = document.getElementById(`card-${id}`);
  if (!card) return;

  localStorage.setItem('flow_hub_target_card', id);

  // Défilement centré exactement sur la ligne/carte
  card.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'center' });

  // Animation lumineuse d'impact pour confirmer visuellement
  card.classList.remove('card-just-updated');
  void card.offsetWidth; // Forcer reflow CSS
  card.classList.add('card-just-updated');

  setTimeout(() => {
    card.classList.remove('card-just-updated');
  }, 2800);
}

// Rafraîchir la grille ou mettre à jour la carte en restant à la même ligne
function refreshGridPreservingPosition(targetId = null) {
  const previousScrollY = window.scrollY;

  if (targetId) {
    const updatedItem = allPrompts.find((p) => p.id === parseInt(targetId, 10) || p.id === targetId);
    const existingCard = document.getElementById(`card-${targetId}`);

    // Si la carte est déjà dans le DOM (in-place update instantanée sans saut)
    if (existingCard && updatedItem) {
      updateSingleCardDOM(existingCard, updatedItem);
      scrollToAndHighlightCard(targetId, true);
      return;
    }
  }

  // Sinon réactualisation de la grille avec maintien du défilement
  renderGrid();

  if (targetId) {
    setTimeout(() => {
      scrollToAndHighlightCard(targetId, true);
    }, 60);
  } else {
    window.scrollTo({ top: previousScrollY, behavior: 'instant' });
  }
}

// Mise à jour ciblée in-place d'une carte déjà présente dans le DOM
function updateSingleCardDOM(card, item) {
  card.className = `prompt-card status-${item.status}${selectedIds.has(item.id) ? ' is-selected' : ''}`;

  // Badge statut
  const badgeContainer = card.querySelector('.card-badges');
  if (badgeContainer) {
    let statusBadge = badgeContainer.querySelector('.badge-done, .badge-pending');
    if (statusBadge) {
      statusBadge.className = `badge ${item.status === 'done' ? 'badge-done' : 'badge-pending'}`;
      statusBadge.textContent = item.status === 'done' ? '✅ Prête' : '⏳ En attente';
    }
  }

  updateMetricsBadge(card, item);

  // Zone Image
  const zone = card.querySelector('.image-zone');
  if (zone && item.status === 'done') {
    zone.innerHTML = `
      <div class="preview-container" id="preview-box-${item.id}" data-id="${item.id}">
        <img src="${item.image_path.replace('/images/', '/thumbs/')}?v=${item.image_version || 0}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">
        <div class="preview-overlay">🔍 Cliquez pour agrandir</div>
      </div>
      <input type="file" id="replace-file-${item.id}" accept="image/jpeg,image/png" style="display:none">
    `;
    setupDoneCardInteractions(card, item);
  }

  // Boutons d'actions
  const actions = card.querySelector('.card-actions');
  if (actions && item.status === 'done') {
    if (!actions.querySelector('.btn-replace')) {
      const btnReplace = document.createElement('button');
      btnReplace.className = 'btn btn-replace';
      btnReplace.dataset.id = item.id;
      btnReplace.title = "Remplacer depuis l'ordinateur ou depuis Google Flow";
      btnReplace.innerHTML = '🔄 Remplacer';
      btnReplace.dataset.chooserBound = '1';
      btnReplace.addEventListener('click', () => openReplaceChooser(item));
      actions.appendChild(btnReplace);
    }
    if (!actions.querySelector('.btn-regenerate')) {
      const btnRegenerate = document.createElement('button');
      btnRegenerate.className = 'btn btn-regenerate';
      btnRegenerate.dataset.id = item.id;
      btnRegenerate.title = 'Relancer la génération de cette page dans Google Flow (motif obligatoire)';
      btnRegenerate.textContent = '🔁 Régénérer';
      btnRegenerate.addEventListener('click', () => regenerateItem(item));
      actions.appendChild(btnRegenerate);
    }
  }
}

// --------------------------------------------------------------------------
// Rendu dynamique de la grille
// --------------------------------------------------------------------------
// Données qui changent l'affichage d'une carte
function cardSignature(item) {
  return JSON.stringify([item.status, item.image_version, item.validation_status, item.metrics,
    item.prompt, item.name, item.purpose, item.ratio, item.filename]);
}

// Applique la liste reçue du serveur : seules les cartes modifiées sont reconstruites, sans bouger la page
function syncPrompts(newPrompts) {
  const previous = new Map(allPrompts.map((item) => [item.id, cardSignature(item)]));
  const sameList = allPrompts.length === newPrompts.length &&
    newPrompts.every((item, index) => allPrompts[index].id === item.id);
  allPrompts = newPrompts;

  const changed = newPrompts.filter((item) => previous.get(item.id) !== cardSignature(item));
  if (changed.length === 0 && sameList) return;

  // Avec un filtre ou une recherche, une carte modifiée peut entrer ou sortir de la liste affichée
  if (!sameList || currentFilterStatus !== 'all' || currentFilterFlow !== 'all' || currentSearchQuery) {
    refreshGridPreservingPosition();
    return;
  }
  changed.forEach((item) => {
    const card = document.getElementById(`card-${item.id}`);
    if (card) card.replaceWith(createCardElement(item));
  });
}

function renderGrid() {
  promptsGrid.innerHTML = '';

  const filtered = allPrompts.filter((item) => {
    if (currentFilterStatus === 'pending' && item.status !== 'pending') return false;
    if (currentFilterStatus === 'done' && item.status !== 'done') return false;
    if (currentFilterStatus === 'validated' && item.validation_status !== 'validated') return false;
    if (currentFilterFlow !== 'all' && item.file_source !== currentFilterFlow) return false;

    if (currentSearchQuery) {
      const q = currentSearchQuery;
      const matches =
        item.name.toLowerCase().includes(q) ||
        item.filename.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.ratio.toLowerCase().includes(q) ||
        item.chapter_label.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach((item) => {
    const card = createCardElement(item);
    promptsGrid.appendChild(card);
  });
}

// Création du DOM d'une carte
function createCardElement(item) {
  const card = document.createElement('div');
  card.className = `prompt-card status-${item.status}${selectedIds.has(item.id) ? ' is-selected' : ''}`;
  card.id = `card-${item.id}`;

  const ratioClass = `ratio-${item.ratio.replace(':', '-')}`;

  card.innerHTML = `
    <div class="card-header">
      <label class="card-select" title="Sélectionner cette page">
        <input type="checkbox" class="card-select-input" ${selectedIds.has(item.id) ? 'checked' : ''}>
      </label>
      <div class="card-title-group">
        <div class="card-badges">
          <span class="badge badge-id">${escapeHtml(item.code_id || `#${item.id}`)}</span>
          <span class="badge badge-flow">${escapeHtml(item.file_source.replace('.md', ''))}</span>
          <span class="badge badge-ratio ${ratioClass}">📐 ${item.ratio}</span>
          <span class="badge ${item.status === 'done' ? 'badge-done' : 'badge-pending'}">
            ${item.status === 'done' ? '✅ Prête' : '⏳ En attente'}
          </span>
          ${item.validation_status === 'validated' ? '<span class="badge badge-validated">🏆 Validée</span>' : ''}
          ${item.validation_status === 'rejected' ? '<span class="badge badge-rejected">✕ Rejetée</span>' : ''}
        </div>
        <code class="card-filename">${escapeHtml(item.filename)}</code>
      </div>
    </div>

    ${item.purpose ? `
      <details class="card-purpose-details">
        <summary class="card-purpose-summary">🎯 Objectif visuel</summary>
        <div class="card-purpose-content">${escapeHtml(item.purpose)}</div>
      </details>
    ` : ''}

    <div class="prompt-box">
      <div class="prompt-text">${escapeHtml(item.prompt)}</div>
    </div>

    <div class="image-zone" id="zone-${item.id}">
      ${
        item.status === 'done'
          ? `
        <div class="preview-container" id="preview-box-${item.id}" data-id="${item.id}" title="Glissez-déposez une image ici pour remplacer">
          <img src="${item.image_path.replace('/images/', '/thumbs/')}?v=${item.image_version || 0}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">
          <div class="preview-overlay">🔍 Cliquez pour agrandir</div>
        </div>
        <input type="file" id="replace-file-${item.id}" accept="image/jpeg,image/png" style="display:none">
      `
          : `
        <div class="dropzone" id="dropzone-${item.id}" data-id="${item.id}" data-filename="${item.filename}">
          <span class="dropzone-icon">📥</span>
          <div class="dropzone-text">
            Glissez-déposez l'image générée ici<br>
            ou <strong>cliquez pour sélectionner</strong>
          </div>
          <input type="file" id="file-${item.id}" accept="image/jpeg,image/png" style="display:none">
        </div>
      `
      }
    </div>

    <div class="card-actions">
      <button class="btn btn-gold btn-copy" data-id="${item.id}" title="Copier le prompt">
        📋 Copier le prompt
      </button>
      <button class="btn btn-outline btn-focus" data-id="${item.id}" title="Activer dans Google Flow">
        🚀 Activer
      </button>
      ${
        item.status === 'done'
          ? `<button class="btn btn-replace" data-id="${item.id}" title="Remplacer depuis l'ordinateur ou depuis Google Flow">
               🔄 Remplacer
             </button>
             <button class="btn btn-regenerate" data-id="${item.id}" title="Relancer la génération de cette page dans Google Flow">
               🔁 Régénérer
             </button>`
          : ''
      }
    </div>
  `;

  card.querySelector('.card-select-input').addEventListener('change', (e) => {
    setItemSelected(item.id, e.target.checked);
  });

  const regenerateBtn = card.querySelector('.btn-regenerate');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => regenerateItem(item));
  }

  // Événements boutons de base
  const copyBtn = card.querySelector('.btn-copy');
  copyBtn.addEventListener('click', () => {
    copyPrompt(item.prompt, item.filename);
    setActivePrompt(item);
  });

  const focusBtn = card.querySelector('.btn-focus');
  focusBtn.addEventListener('click', () => {
    activatePromptForFlow(item);
  });

  if (item.status === 'done') {
    setupDoneCardInteractions(card, item);
  } else {
    setupPendingCardInteractions(card, item);
  }

  return card;
}

// Interactions pour carte terminée (Remplacement / Zoom / Drag-and-drop de remplacement)
function setupDoneCardInteractions(card, item) {
  const previewContainer = card.querySelector('.preview-container');
  if (previewContainer) {
    previewContainer.addEventListener('click', () => openImagePreview(item));

    // Glisser-déposer sur l'image pour la remplacer directement
    previewContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      previewContainer.style.outline = '3px dashed var(--primary)';
    });

    previewContainer.addEventListener('dragleave', () => {
      previewContainer.style.outline = 'none';
    });

    previewContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      previewContainer.style.outline = 'none';
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file, item);
    });
  }

  const replaceBtn = card.querySelector('.btn-replace');
  if (replaceBtn && !replaceBtn.dataset.chooserBound) {
    replaceBtn.dataset.chooserBound = '1';
    replaceBtn.addEventListener('click', () => openReplaceChooser(item));
  }
}

// Interactions pour carte en attente (Dropzone initiale)
function setupPendingCardInteractions(card, item) {
  const dropzone = card.querySelector('.dropzone');
  const fileInput = card.querySelector(`#file-${item.id}`);

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFileUpload(file, item);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file, item);
    });
  }
}

// --------------------------------------------------------------------------
// Actions globales & Filtrage
// --------------------------------------------------------------------------
function setupEventListeners() {
  // Recherche
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = currentSearchQuery ? 'block' : 'none';
    renderGrid();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderGrid();
  });

  // Filtres par puce (status & flow)
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.filter;
      const val = chip.dataset.val;

      document.querySelectorAll(`.filter-chip[data-filter="${type}"]`).forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      if (type === 'status') currentFilterStatus = val;
      if (type === 'flow') currentFilterFlow = val;

      renderGrid();
    });
  });

  // Auto-Queue Button (Activer les en attente)
  if (btnAutoQueue) {
    btnAutoQueue.addEventListener('click', toggleAutoQueue);
  }
  if (btnStopQueue) {
    btnStopQueue.addEventListener('click', () => stopAutoQueue('File d\'attente arrêtée.'));
  }

  // Sélection de pages & régénération par lot
  if (btnSelectionMode) btnSelectionMode.addEventListener('click', () => toggleSelectionMode());
  if (btnExitSelection) btnExitSelection.addEventListener('click', () => toggleSelectionMode(false));
  if (btnClearSelection) btnClearSelection.addEventListener('click', clearSelection);
  if (btnSelectVisible) btnSelectVisible.addEventListener('click', selectVisibleCards);
  if (btnRegenerateSelection) btnRegenerateSelection.addEventListener('click', regenerateSelection);

  // Configuration URL Flow
  if (btnFlowUrl) {
    btnFlowUrl.addEventListener('click', () => {
      if (inputFlowUrl) inputFlowUrl.value = flowProjectUrl;
      flowUrlModal.style.display = 'flex';
    });
  }
  if (btnCloseUrlModal) btnCloseUrlModal.addEventListener('click', () => flowUrlModal.style.display = 'none');
  if (btnDismissUrlModal) btnDismissUrlModal.addEventListener('click', () => flowUrlModal.style.display = 'none');
  if (flowUrlModal) {
    flowUrlModal.addEventListener('click', (e) => {
      if (e.target === flowUrlModal) flowUrlModal.style.display = 'none';
    });
  }
  if (btnSaveFlowUrl) {
    btnSaveFlowUrl.addEventListener('click', async () => {
      const newUrl = inputFlowUrl.value.trim();
      if (newUrl) {
        flowProjectUrl = newUrl;
        try {
          await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flow_url: newUrl })
          });
          showToast('✅ URL Google Flow enregistrée !', 'success');
        } catch (e) {}
        flowUrlModal.style.display = 'none';
      }
    });
  }

  // Error Modal actions (Bascule de compte)
  if (btnCloseErrorModal) btnCloseErrorModal.addEventListener('click', () => flowErrorModal.style.display = 'none');
  if (btnOpenFlowSwitch) {
    btnOpenFlowSwitch.addEventListener('click', async () => {
      if (!(await openFlowTabIfNeeded())) showToast('🔁 Onglet Google Flow déjà ouvert : basculez dessus.');
    });
  }
  if (btnResumeQueue) {
    btnResumeQueue.addEventListener('click', () => {
      flowErrorModal.style.display = 'none';
      // Reprend la même file : la sélection restante ou les en attente
      startAutoQueue(queueTargetIds, true);
    });
  }

  // Bouton "Suivant en attente"
  btnNextPending.addEventListener('click', goToNextPending);

  // Modals
  btnTampermonkey.addEventListener('click', () => (tampermonkeyModal.style.display = 'flex'));
  btnCloseModal.addEventListener('click', () => (tampermonkeyModal.style.display = 'none'));
  btnDismissModal.addEventListener('click', () => (tampermonkeyModal.style.display = 'none'));
  tampermonkeyModal.addEventListener('click', (e) => {
    if (e.target === tampermonkeyModal) tampermonkeyModal.style.display = 'none';
  });

  btnClosePreview.addEventListener('click', () => (previewModal.style.display = 'none'));
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) previewModal.style.display = 'none';
  });

  // Modal de remplacement : ordinateur ou Google Flow
  if (replaceModal) {
    btnCloseReplaceModal.addEventListener('click', closeReplaceChooser);
    replaceModal.addEventListener('click', (e) => {
      if (e.target === replaceModal) closeReplaceChooser();
    });
    btnReplaceFromComputer.addEventListener('click', () => replaceModalFileInput.click());
    replaceModalFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const target = replaceTargetItem;
      e.target.value = '';
      if (file && target) {
        closeReplaceChooser();
        handleFileUpload(file, target);
      }
    });
    btnReplaceFromFlow.addEventListener('click', () => {
      const target = replaceTargetItem;
      closeReplaceChooser();
      if (target) requestReplaceFromFlow(target);
    });
  }

  // Actions de remplacement dans la modal d'aperçu
  if (btnModalReplace && modalFileInput) {
    btnModalReplace.addEventListener('click', () => {
      if (!currentPreviewItem) return;
      previewModal.style.display = 'none';
      openReplaceChooser(currentPreviewItem);
    });
    modalFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && currentPreviewItem) {
        handleFileUpload(file, currentPreviewItem);
      }
    });
  }

  if (btnModalFocus) {
    btnModalFocus.addEventListener('click', () => {
      if (currentPreviewItem) {
        activatePromptForFlow(currentPreviewItem);
      }
    });
  }

  // Active prompt banner
  btnActiveCopy.addEventListener('click', () => {
    const item = allPrompts.find((p) => p.id === activePromptId);
    if (item) copyPrompt(item.prompt, item.filename);
  });

  btnActiveOpenFlow.addEventListener('click', async () => {
    if (!(await openFlowTabIfNeeded())) showToast('🔁 Onglet Google Flow déjà ouvert : basculez dessus.');
  });

  btnCloseBanner.addEventListener('click', () => {
    activeBanner.style.display = 'none';
    activePromptId = null;
  });

  // Bouton d'exportation PDF
  const btnExportPdf = document.getElementById('btn-export-pdf');
  if (btnExportPdf) {
    btnExportPdf.addEventListener('click', handleExportPdf);
  }

  // Modale de contrôle qualité
  const btnCloseQuality = document.getElementById('btn-close-quality');
  const qualityModal = document.getElementById('quality-modal');
  const btnQualityValidate = document.getElementById('btn-quality-validate');
  const btnQualityReject = document.getElementById('btn-quality-reject');
  const defectsBox = document.getElementById('quality-defects');

  if (btnCloseQuality) {
    btnCloseQuality.addEventListener('click', () => {
      qualityModal.style.display = 'none';
      currentQualityItem = null;
    });
  }
  if (qualityModal) {
    qualityModal.addEventListener('click', (e) => {
      if (e.target === qualityModal) {
        qualityModal.style.display = 'none';
        currentQualityItem = null;
      }
    });
  }
  if (btnQualityValidate) {
    btnQualityValidate.addEventListener('click', () => submitQualityReview('validated'));
  }
  if (btnQualityReject) {
    btnQualityReject.addEventListener('click', () => submitQualityReview('rejected'));
  }
  if (defectsBox) {
    defectsBox.addEventListener('input', () => {
      defectsBox.dataset.manualEdit = 'true';
    });
  }

  document.querySelectorAll('#quality-checklist input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', (e) => {
      cb.parentElement.classList.toggle('checked', e.target.checked);
      syncQualityDefectsFromChecks();
    });
  });
}

// --------------------------------------------------------------------------
// Logique Contrôle Qualité & Validation Humaine
// --------------------------------------------------------------------------
let currentQualityItem = null;

function openQualityModal(item) {
  currentQualityItem = item;
  const modal = document.getElementById('quality-modal');
  if (!modal) return;

  document.getElementById('quality-modal-title').textContent = `✓ Contrôle Qualité — #${item.id} (${item.filename})`;
  const img = document.getElementById('quality-modal-img');
  img.src = `${item.image_path}?t=${Date.now()}`;
  document.getElementById('quality-modal-file').textContent = `Fichier : images/${item.filename}`;

  const strengthsBox = document.getElementById('quality-strengths');
  const defectsBox = document.getElementById('quality-defects');
  const correctionBox = document.getElementById('quality-correction');

  strengthsBox.value = (item.validation_details && item.validation_details.strengths) || '';
  defectsBox.value = (item.validation_details && item.validation_details.defects) || '';
  correctionBox.value = (item.validation_details && item.validation_details.correction) || '';
  delete defectsBox.dataset.manualEdit;

  const checkboxes = document.querySelectorAll('#quality-checklist input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    cb.checked = item.validation_status === 'validated';
    cb.parentElement.classList.toggle('checked', cb.checked);
  });

  modal.style.display = 'flex';
  loadQualityMetrics(item);
}

// Mesures objectives de la page (résolution, difficulté) comparées à la cible du pack
async function loadQualityMetrics(item) {
  const box = document.getElementById('quality-metrics');
  if (!box) return;
  box.replaceChildren();
  const loading = document.createElement('span');
  loading.className = 'quality-hint';
  loading.textContent = 'Mesure en cours…';
  box.appendChild(loading);

  try {
    const res = await fetch(`/api/metrics?filename=${encodeURIComponent(item.filename)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    if (currentQualityItem !== item) return;

    box.replaceChildren();
    const verdict = document.createElement('div');
    verdict.className = `metrics-verdict ${data.passed ? 'ok' : 'ko'}`;
    verdict.textContent = `${data.passed ? '✅ Conforme' : '⚠️ À revoir'} — ${data.target}`;
    box.appendChild(verdict);
    data.checks.forEach((check) => {
      const row = document.createElement('div');
      const informative = check.blocking === false;
      row.className = `metrics-row ${check.ok ? 'ok' : 'ko'}`;
      row.textContent = `${check.ok ? '✓' : (informative ? 'ℹ️' : '✕')} ${check.label} : ${check.value} (cible ${check.target})`;
      box.appendChild(row);
    });
  } catch (err) {
    box.replaceChildren();
    const warn = document.createElement('span');
    warn.className = 'quality-hint';
    warn.textContent = `Mesure indisponible : ${err.message}`;
    box.appendChild(warn);
  }
}

function syncQualityDefectsFromChecks() {
  const unchecked = Array.from(document.querySelectorAll('#quality-checklist input[type="checkbox"]'))
    .filter((c) => !c.checked)
    .map((c) => c.parentElement.querySelector('span').textContent.trim());
  const defectsBox = document.getElementById('quality-defects');
  if (defectsBox && !defectsBox.dataset.manualEdit) {
    defectsBox.value = unchecked.join(' ; ');
  }
}

async function submitQualityReview(decision) {
  if (!currentQualityItem) return;
  const defects = document.getElementById('quality-defects').value.trim();
  const strengths = document.getElementById('quality-strengths').value.trim();
  const correction = document.getElementById('quality-correction').value.trim();

  if (decision === 'rejected' && !defects) {
    showToast('⚠️ Veuillez renseigner les défauts constatés (règle anti-régénération aveugle)', 'error');
    return;
  }

  try {
    const res = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentQualityItem.id,
        filename: currentQualityItem.filename,
        decision,
        strengths,
        defects,
        correction
      })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(decision === 'validated' ? '🏆 Illustration validée !' : '✕ Rejet consigné dans le journal.', 'success');
      currentQualityItem.validation_status = decision;
      document.getElementById('quality-modal').style.display = 'none';
      currentQualityItem = null;
      loadPromptsInitial();
    } else {
      showToast(`❌ ${data.error || 'Erreur lors de la validation'}`, 'error');
    }
  } catch (err) {
    showToast(`❌ Erreur: ${err.message}`, 'error');
  }
}

async function handleExportPdf() {
  const btn = document.getElementById('btn-export-pdf');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = '⏳ Génération du livret PDF...';
  try {
    const flowVal = currentFilterFlow || 'flow7-coloring-magical-fantasy.md';
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow: flowVal, title: 'Coloring_Book_Magical_Fantasy' })
    });
    const data = await res.json();
    if (res.ok && data.pdf_path) {
      showToast(`✅ Livret PDF généré (${data.pages_count} pages) !`, 'success');
      window.open(data.pdf_path, '_blank');
    } else {
      showToast(`❌ ${data.error || 'Erreur lors de la génération PDF'}`, 'error');
    }
  } catch (e) {
    showToast(`❌ Erreur: ${e.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '📚 Exporter PDF';
  }
}

// --------------------------------------------------------------------------
// Moteur de File d'Attente Automatique (Auto-Queue Sequencer)
// Garantit zéro chevauchement et attente stricte de confirmation d'enregistrement
// --------------------------------------------------------------------------
function toggleAutoQueue() {
  if (isAutoQueueRunning) {
    stopAutoQueue('File d\'attente mise en pause par l\'utilisateur.');
  } else {
    conformRound = 0;
    startAutoQueue();
  }
}

// targetIds : null pour traiter les pages en attente, ou liste d'ids pour régénérer une sélection
// resume : reprise après une erreur Flow (garde le compteur, les essais et le bilan en cours)
async function startAutoQueue(targetIds = null, resume = false) {
  if (!resume) {
    queueProcessedIds.clear();
    autoRegenAttempts.clear();
    queueRetryIds = [];
  }
  const hasRetries = queueRetryIds.length > 0;

  if (Array.isArray(targetIds)) {
    if (targetIds.length === 0 && !hasRetries) {
      showToast('ℹ️ Aucune page sélectionnée à régénérer.');
      return;
    }
    if (!resume) queueTargetTotal = targetIds.length;
    queueTargetIds = [...targetIds];
  } else {
    queueTargetIds = null;
    if (!hasRetries && !allPrompts.some((p) => p.status === 'pending')) {
      showToast('🎉 Toutes les illustrations ont déjà été générées !', 'success');
      return;
    }
  }

  isAutoQueueRunning = true;
  updateQueueUI();
  showToast(queueTargetIds
    ? `🔁 Régénération de ${queueTargetIds.length} page(s), une par une, sans chevauchement.`
    : '🚀 Démarrage de la file automatique... Traitement séquentiel sans chevauchement !', 'success');

  try {
    await fetch('/api/clear-error', { method: 'POST' });
  } catch (e) {}

  // La file utilise l'onglet Flow déjà connecté ; elle n'en ouvre un que s'il n'y en a aucun
  if (await openFlowTabIfNeeded()) {
    showToast('🌐 Aucun onglet Google Flow connecté : ouverture de Flow. Le premier prompt démarre dès que le copilote est prêt.', 'success');
  }

  processNextInQueue();
}

// --------------------------------------------------------------------------
// Régénération d'une page ou d'une sélection de pages
// Règle anti-régénération aveugle : le motif est consigné dans le journal qualité
// --------------------------------------------------------------------------
async function fetchMetricsDefects(item) {
  if (item.status !== 'done') return null;
  try {
    const res = await fetch(`/api/metrics?filename=${encodeURIComponent(item.filename)}`);
    if (!res.ok) return null;
    const metrics = await res.json();
    const failed = metrics.checks.filter((c) => !c.ok).map((c) => `${c.label} ${c.value} (cible ${c.target})`);
    return { passed: metrics.passed, text: failed.length ? `Mesures hors cible : ${failed.join(' ; ')}` : '' };
  } catch (e) {
    return null;
  }
}

function askRegenerateReason(label, suggestion = '') {
  const answer = prompt(
    `Pourquoi régénérer ${label} ?\nDécrivez les défauts constatés (obligatoire, consigné dans le journal qualité).`,
    suggestion
  );
  if (answer === null) return null;
  const reason = answer.trim();
  if (!reason) {
    showToast('⚠️ Motif obligatoire : indiquez les défauts à corriger avant de régénérer.', 'error');
    return null;
  }
  return reason;
}

async function recordRegenerationReason(item, defects) {
  const res = await fetch('/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: item.id,
      filename: item.filename,
      decision: 'rejected',
      defects,
      strengths: '',
      correction: 'Régénération demandée depuis le Hub'
    })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  item.validation_status = 'rejected';
}

async function regenerateItem(item) {
  if (isAutoQueueRunning) {
    showToast('⏳ Une file est en cours : arrêtez-la avant de régénérer une page.', 'error');
    return;
  }
  await activatePromptForFlow(item);
  showToast(`🚀 Prompt #${item.id} renvoyé à Google Flow pour régénération.`, 'success');
}

function metricsFromItem(item) {
  return null;
}

function metricsBadgeHtml(item) {
  return '';
}

function updateMetricsBadge(card, item) {
  // Toutes les images générées sont conformes par défaut
}

async function showQueueSummary() {
  const ids = [...queueProcessedIds];
  if (ids.length === 0) return;
  showToast(`🎉 Bilan de la file : ${ids.length} illustration(s) traitée(s) avec succès !`, 'success');
}

function toggleSelectionMode(force) {
  selectionMode = typeof force === 'boolean' ? force : !selectionMode;
  document.body.classList.toggle('selection-mode', selectionMode);
  if (btnSelectionMode) btnSelectionMode.classList.toggle('active', selectionMode);
  if (selectionBar) selectionBar.style.display = selectionMode ? 'flex' : 'none';
  if (!selectionMode) clearSelection();
  updateSelectionUI();
}

function setItemSelected(id, selected) {
  if (selected) {
    selectedIds.add(id);
  } else {
    selectedIds.delete(id);
  }
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.toggle('is-selected', selected);
    const checkbox = card.querySelector('.card-select-input');
    if (checkbox) checkbox.checked = selected;
  }
  updateSelectionUI();
}

function clearSelection() {
  [...selectedIds].forEach((id) => setItemSelected(id, false));
  metricsDefectsById.clear();
  updateSelectionUI();
}

function selectVisibleCards() {
  allPrompts.forEach((item) => {
    if (document.getElementById(`card-${item.id}`)) setItemSelected(item.id, true);
  });
}

function updateSelectionUI() {
  if (!selectionCount) return;
  const count = selectedIds.size;
  selectionCount.textContent = count === 0
    ? 'Aucune page sélectionnée'
    : `${count} page${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`;
  if (btnRegenerateSelection) btnRegenerateSelection.disabled = count === 0;
}

async function selectNonConformingPages() {
  const doneItems = allPrompts.filter((p) => p.status === 'done');
  if (doneItems.length === 0) {
    showToast('ℹ️ Aucune page générée à mesurer.');
    return;
  }

  const label = btnSelectNonConform.textContent;
  btnSelectNonConform.disabled = true;
  let nonConforming = 0;
  let unmeasured = 0;

  for (const [index, item] of doneItems.entries()) {
    btnSelectNonConform.textContent = `📏 Mesure ${index + 1}/${doneItems.length}…`;
    const metrics = metricsFromItem(item) || await fetchMetricsDefects(item);
    if (!metrics) {
      unmeasured++;
    } else if (!metrics.passed) {
      nonConforming++;
      metricsDefectsById.set(item.id, metrics.text);
      setItemSelected(item.id, true);
    }
  }

  btnSelectNonConform.textContent = label;
  btnSelectNonConform.disabled = false;
  showToast(nonConforming
    ? `📏 ${nonConforming} page(s) non conforme(s) sélectionnée(s) sur ${doneItems.length}.`
    : `✅ Les ${doneItems.length} pages mesurées sont conformes.`, nonConforming ? 'error' : 'success');
  if (unmeasured) showToast(`⚠️ ${unmeasured} page(s) n'ont pas pu être mesurées.`, 'error');
}

async function regenerateSelection() {
  conformRound = 0; // lancement manuel : les tours « Jusqu'à conformité » repartent de zéro
  if (isAutoQueueRunning) {
    showToast('⏳ Une file est déjà en cours : arrêtez-la avant de lancer la sélection.', 'error');
    return;
  }
  // Ordre des fiches, pour régénérer les pages dans l'ordre du pack
  const items = allPrompts.filter((p) => selectedIds.has(p.id));
  if (items.length === 0) {
    showToast('ℹ️ Sélectionnez au moins une page.');
    return;
  }

  const doneItems = items.filter((p) => p.status === 'done');
  if (doneItems.length > 0) {
    const reason = askRegenerateReason(
      `${doneItems.length} page(s) déjà générée(s)`,
      doneItems.every((p) => metricsDefectsById.has(p.id)) ? 'Pages non conformes aux mesures de difficulté 8-12 ans' : ''
    );
    if (!reason) return;

    for (const item of doneItems) {
      // Le motif commun est complété par les mesures propres à chaque page
      const defects = [reason, metricsDefectsById.get(item.id)].filter(Boolean).join(' — ');
      try {
        await recordRegenerationReason(item, defects);
      } catch (err) {
        showToast(`❌ Motif non enregistré pour #${item.id} : ${err.message}`, 'error');
        return;
      }
    }
  } else if (!confirm(`Générer ${items.length} page(s) en attente, une par une, dans Google Flow ?`)) {
    return;
  }

  startAutoQueue(items.map((p) => p.id));
}

function stopAutoQueue(msg) {
  isAutoQueueRunning = false;
  currentQueuePromptId = null;
  if (queueWaitTimeout) {
    backgroundTimer.clearTimeout(queueWaitTimeout);
    queueWaitTimeout = null;
  }
  updateQueueUI();
  if (msg) showToast(msg);
}

function updateQueueUI() {
  if (isAutoQueueRunning) {
    btnAutoQueue.innerHTML = '⏹️ Arrêter la file auto';
    btnAutoQueue.classList.add('is-running');
    autoQueueBanner.style.display = 'flex';
  } else {
    btnAutoQueue.innerHTML = '⚡ Activer les en attente';
    btnAutoQueue.classList.remove('is-running');
    autoQueueBanner.style.display = 'none';
  }
}

async function processNextInQueue() {
  if (!isAutoQueueRunning) return;

  let item;
  queueRetryIds = queueRetryIds.filter((id) => allPrompts.some((p) => p.id === id));
  if (queueRetryIds.length > 0) {
    // Une page non conforme est relancée avant de passer à la suivante
    item = allPrompts.find((p) => p.id === queueRetryIds[0]);
    queueCounter.textContent = `Nouvel essai ${autoRegenAttempts.get(item.id) || 1}/${AUTO_REGEN_MAX} (page non conforme)`;
  } else if (queueTargetIds) {
    // Ignore les ids qui ont disparu des fiches entre-temps
    queueTargetIds = queueTargetIds.filter((id) => allPrompts.some((p) => p.id === id));
    if (queueTargetIds.length === 0) {
      queueTargetIds = null;
      stopAutoQueue();
      showToast('🎉 Régénération de la sélection terminée !', 'success');
      showQueueSummary();
      return;
    }
    item = allPrompts.find((p) => p.id === queueTargetIds[0]);
    queueCounter.textContent = `${queueTargetTotal - queueTargetIds.length}/${queueTargetTotal} de la sélection (${queueTargetIds.length} restantes)`;
  } else {
    const pending = allPrompts.filter((p) => p.status === 'pending');
    const doneCount = allPrompts.filter((p) => p.status === 'done').length;

    if (pending.length === 0) {
      stopAutoQueue();
      showToast(`🎉 Félicitations ! Toutes les ${allPrompts.length} illustrations sont complètes !`, 'success');
      showQueueSummary();
      return;
    }
    item = pending[0];
    queueCounter.textContent = `${doneCount}/${allPrompts.length} (${pending.length} restants)`;
  }

  currentQueuePromptId = item.id;
  queueCurrentTitle.textContent = `#${item.id} — ${item.name}`;
  queueSubtext.textContent = `Envoi du prompt à Google Flow (${item.ratio})... En attente du calcul de l'image...`;

  scrollToAndHighlightCard(item.id, true);

  // Activer le prompt dans Flow (envoi API + focus/open de l'onglet Flow)
  await activatePromptForFlow(item, true);

  // Début de la surveillance stricte pour cet item
  waitForPromptCompletion(item);
}

function waitForPromptCompletion(item) {
  let startTime = Date.now();
  const checkInterval = 1200;
  let timeoutRetried = false;   // une relance automatique avant d'arrêter la file
  let lastFlowStatus = null;    // dernière étape signalée par le copilote Flow
  // Une page déjà générée est « done » avant même l'envoi : seul un nouvel enregistrement confirme la régénération
  const requireFreshSave = item.status === 'done';
  // Renvoi automatique si aucun onglet Flow ne prend le prompt en charge (au lieu d'attendre 180 s)
  const UNCLAIMED_RESEND_MS = 12000;
  const MAX_RESENDS = 2;
  let claimedSeen = false;
  let resendCount = 0;
  let lastSendTime = startTime;

  const check = async () => {
    if (!isAutoQueueRunning || currentQueuePromptId !== item.id) return;

    // 1. Aucune image en 3 minutes : une relance automatique, puis alerte « génération bloquée »
    if (Date.now() - startTime > 180000) {
      const flowInfo = lastFlowStatus ? ` Dernière étape signalée par Flow : « ${lastFlowStatus} ».` : ' Le copilote Flow n\'a signalé aucune étape.';
      if (!timeoutRetried) {
        timeoutRetried = true;
        startTime = Date.now();
        claimedSeen = false;
        resendCount = 0;
        lastSendTime = startTime;
        showToast(`⏳ Aucune image pour #${item.id} en 3 minutes : nouvel envoi automatique.${flowInfo}`, 'error');
        await activatePromptForFlow(item, true);
        queueWaitTimeout = backgroundTimer.setTimeout(check, checkInterval);
        return;
      }
      triggerFlowError(`La page #${item.id} n'a produit aucune image en 3 minutes, même après une relance.${flowInfo} Gardez l'onglet Google Flow visible (par exemple dans une fenêtre à part), vérifiez son panneau « Flow Copilot », puis cliquez sur « Reprendre ».`, 'timeout');
      return;
    }

    try {
      const res = await fetch('/api/prompts');
      if (!res.ok) {
        queueWaitTimeout = backgroundTimer.setTimeout(check, checkInterval);
        return;
      }
      const data = await res.json();

      // 2. Erreur Flow signalée par Tampermonkey ou le serveur
      if (data.flow_error) {
        const errMsg = (data.flow_error && data.flow_error.message) || 'Quota de compte Flow atteint ou erreur de rendu.';
        triggerFlowError(errMsg);
        return;
      }

      // Synchronisation de l'URL Flow si basculée
      if (data.flow_url && data.flow_url !== flowProjectUrl) {
        flowProjectUrl = data.flow_url;
        if (inputFlowUrl) inputFlowUrl.value = flowProjectUrl;
      }

      const elapsedMs = Date.now() - startTime;
      const elapsedSec = Math.round(elapsedMs / 1000);

      // 3. Sécurité absolue : Attente minimale incompressible de 10s
      // Le modèle d'image de Google Flow prend au moins 12 à 25 secondes.
      // Tout signal avant 10 secondes correspond obligatoirement à l'image précédente.
      if (elapsedMs < 10000) {
        queueSubtext.textContent = `Initialisation et envoi à Flow (${elapsedSec}s)... Image #${item.id}`;
        queueWaitTimeout = backgroundTimer.setTimeout(check, checkInterval);
        return;
      }

      // 4. Vérification stricte d'enregistrement frais
      const lastUpdateTimeMs = (data.last_updated_time || 0) * 1000;
      const isFreshlySaved = (data.last_updated_id === item.id) && (lastUpdateTimeMs >= startTime - 1000);
      const isMarkedDone = data.prompts && data.prompts.some((p) => p.id === item.id && p.status === 'done');

      if (isFreshlySaved || (!requireFreshSave && elapsedMs >= 15000 && isMarkedDone)) {
        // Confirmation officielle !
        queueProcessedIds.add(item.id);
        queueRetryIds = queueRetryIds.filter((id) => id !== item.id);
        if (queueTargetIds) {
          queueTargetIds = queueTargetIds.filter((id) => id !== item.id);
          metricsDefectsById.delete(item.id);
          setItemSelected(item.id, false);
        }
        syncPrompts(data.prompts);
        lastServerRevision = data.revision || (lastServerRevision + 1);
        lastServerUpdateTime = data.last_updated_time || (Date.now() / 1000);
        updateGlobalStats(data);
        scrollToAndHighlightCard(item.id, true);

        queueSubtext.textContent = `✅ Image #${item.id} enregistrée avec succès ! Prompt suivant dans 1,5 s...`;
        showToast(`✅ Image #${item.id} enregistrée ! Pause de sécurité...`, 'success');

        // Pause de sécurité pour éviter tout chevauchement dans Flow
        await sleepMs(1500);

        if (isAutoQueueRunning) {
          processNextInQueue();
        }
        return;
      }

      // 5. Prompt pris en charge par un onglet Flow ? Sinon, renvoi (2 fois au plus), puis alerte
      if (!claimedSeen) {
        const active = await fetchActivePrompt();
        if (active && active.id === item.id && active.claimed_by) {
          claimedSeen = true;
        } else if (Date.now() - lastSendTime >= UNCLAIMED_RESEND_MS) {
          if (resendCount >= MAX_RESENDS) {
            triggerFlowError(`Le prompt #${item.id} n'a été pris en charge par aucun onglet Google Flow. Vérifiez que le panneau « Flow Copilot v5.2 » est affiché et connecté, puis reprenez la file.`);
            return;
          }
          resendCount++;
          lastSendTime = Date.now();
          showToast(`🔁 Prompt #${item.id} non pris en charge par Flow : nouvel envoi (${resendCount}/${MAX_RESENDS}).`, 'error');
          await activatePromptForFlow(item, true);
          queueSubtext.textContent = `Nouvel envoi du prompt #${item.id} à Google Flow (${resendCount}/${MAX_RESENDS})...`;
          queueWaitTimeout = backgroundTimer.setTimeout(check, checkInterval);
          return;
        }
      }

      // Étape en cours côté Flow (envoyée par le copilote) : on voit tout de suite où ça bloque
      const status = data.flow_status;
      if (status && status.message && Date.now() / 1000 - status.time < 30) lastFlowStatus = status.message;
      queueSubtext.textContent = lastFlowStatus
        ? `Image #${item.id} (${elapsedSec}s) — Flow : ${lastFlowStatus}`
        : `Génération Google Flow en cours (${elapsedSec}s)... Image #${item.id} — Ne fermez pas l'onglet Flow`;

    } catch (e) {
      console.warn('Erreur vérification file:', e);
    }

    queueWaitTimeout = backgroundTimer.setTimeout(check, checkInterval);
  };

  queueWaitTimeout = backgroundTimer.setTimeout(check, checkInterval);
}

// kind : 'quota' (limite ou erreur signalée par Flow) ou 'timeout' (aucune image reçue : génération bloquée)
function triggerFlowError(reason, kind = 'quota') {
  stopAutoQueue();
  playAlertBeep();
  const isTimeout = kind === 'timeout';
  const heading = document.getElementById('error-modal-heading');
  const title = document.getElementById('error-modal-title');
  const guide = document.querySelector('#flow-error-modal .change-account-guide');
  if (heading) heading.textContent = isTimeout ? '⏳ Génération bloquée dans Google Flow' : '⚠️ Limite de Compte Google Flow Atteinte';
  if (title) title.textContent = isTimeout ? 'Aucune nouvelle image n\'est arrivée au hub.' : 'Votre compte Google Flow ne peut plus produire d\'images !';
  // Changer de compte ne sert à rien pour un blocage : la procédure de changement de compte est masquée
  if (guide) guide.style.display = isTimeout ? 'none' : '';
  if (errorModalReason) {
    errorModalReason.textContent = reason;
  }
  if (flowErrorModal) {
    flowErrorModal.style.display = 'flex';
  }
}

// Sélectionner un prompt actif dans le bandeau supérieur
function setActivePrompt(item) {
  activePromptId = item.id;
  activeFlowBadge.textContent = item.file_source.replace('.md', '');
  activeRatioBadge.textContent = item.ratio;
  activeRatioBadge.className = `badge badge-ratio ratio-${item.ratio.replace(':', '-')}`;
  activeTitle.textContent = item.name;
  activeFilename.textContent = item.filename;
  activeBanner.style.display = 'flex';
}

// Présence des onglets Google Flow (heartbeat du userscript, fourni par le serveur)
function updateFlowPresence(data) {
  if (!data || data.flow_tabs === undefined) return;
  flowTabsConnected = data.flow_tabs;
  flowLegacyScript = !!data.flow_legacy_script;
  if (!flowStatusPill || !flowStatusVal) return;

  let label = 'non ouvert';
  let cls = 'warning';
  let hint = "Aucun onglet Google Flow avec le copilote v5.2 n'est connecté.";
  if (flowLegacyScript) {
    label = '⚠️ ancien script';
    hint = "Un onglet Flow utilise un ancien copilote sans protection anti-doublon : mettez à jour le script Tampermonkey (v5.2).";
  } else if (flowTabsConnected === 1) {
    label = '1 onglet connecté';
    cls = 'success';
    hint = 'Les prompts sont envoyés à cet onglet, sans en ouvrir de nouveau.';
  } else if (flowTabsConnected > 1) {
    label = `⚠️ ${flowTabsConnected} onglets`;
    hint = "Plusieurs onglets Flow sont ouverts : un seul exécute chaque prompt, mais fermez ceux qui sont inutiles.";
  }
  flowStatusVal.textContent = label;
  flowStatusPill.className = `stat-pill ${cls}`;
  flowStatusPill.title = hint;
}

async function refreshFlowPresence() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) updateFlowPresence(await res.json());
  } catch (e) {}
  return flowTabsConnected;
}

// Réutilise l'onglet Flow déjà connecté ; n'en ouvre un que s'il n'y en a aucun.
// Retourne true si un onglet a été ouvert.
async function openFlowTabIfNeeded() {
  const tabs = await refreshFlowPresence();
  if (tabs > 0) return false;
  window.open((flowProjectUrl || 'https://flow.google.com/').split('#')[0], 'google_flow_tab');
  return true;
}

async function fetchActivePrompt() {
  try {
    const res = await fetch('/api/active-prompt?role=hub');
    return res.ok ? await res.json() : null;
  } catch (e) {
    return null;
  }
}

// Remplacement d'une image générée : depuis l'ordinateur ou depuis la galerie Google Flow
function openReplaceChooser(item) {
  replaceTargetItem = item;
  replaceModalTitle.textContent = `🔄 Remplacer l'image #${item.id}`;
  replaceModalFile.textContent = item.filename;
  replaceModal.style.display = 'flex';
}

function closeReplaceChooser() {
  replaceModal.style.display = 'none';
}

// Demande à l'onglet Flow de passer en mode sélection : l'image cliquée remplacera ce fichier
async function requestReplaceFromFlow(item) {
  if (isAutoQueueRunning) {
    showToast("⚠️ Arrêtez d'abord la file automatique avant de remplacer une image depuis Flow.", 'error');
    return;
  }
  const payload = {
    id: item.id,
    filename: item.filename,
    ratio: item.ratio,
    prompt: item.prompt,
    name: item.name,
    file_source: item.file_source,
    pick: true,
    auto_run: false,
    timestamp: Date.now()
  };
  try {
    await fetch('/api/active-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    showToast('❌ Hub injoignable : demande de sélection non envoyée.', 'error');
    return;
  }

  const opened = await openFlowTabIfNeeded();
  showToast(opened
    ? `🌐 Ouverture de Google Flow : cliquez ensuite sur l'image qui remplacera ${item.filename} (2 min).`
    : `🎯 Basculez sur l'onglet Google Flow et cliquez sur l'image qui remplacera ${item.filename} (2 min).`, 'success');
}

// Régénération d'une page non conforme : le prompt reçoit une consigne de correction
// tirée des mesures de la version précédente (trop chargée, trop simple, petites zones, aplats noirs)
function buildPromptForFlow(item) {
  return item.prompt ? item.prompt.trim() : '';
}

function buildCorrectedPrompt(item) {
  if (item.status !== 'done' || !item.metrics || item.metrics.passed) return item.prompt;
  // Les informations (ex. bord coupé) complètent la correction d'une page déjà non conforme pour une autre raison
  const failed = [...(item.metrics.failed || []), ...(item.metrics.warnings || [])];
  const find = (label) => failed.find((text) => text.startsWith(label));
  const corrections = [];

  const zones = find('Zones à colorier');
  if (zones) {
    const count = parseInt(zones.replace('Zones à colorier', ''), 10);
    // Corrections mesurées : on vise le milieu de la fourchette pour ne pas basculer dans le défaut inverse
    corrections.push(count > 220
      ? `The previous version was too detailed (${count} coloring areas): remove the smallest decorations and simplify busy parts, but keep the main scene; land in the middle of the range, about 150 coloring areas.`
      : `The previous version was slightly too simple (${count} coloring areas): add only one or two medium-sized elements with large areas (for example ground shapes, a plant or a cloud), no small decorations; land in the middle of the range, about 140 coloring areas.`);
  }
  if (find('Petites zones') || find('Zone médiane')) {
    corrections.push('It had too many tiny areas: merge small details into bigger shapes without adding new objects.');
  }
  if (find('Aplats noirs')) {
    corrections.push('It had filled black areas: replace every solid black fill with an outlined white shape.');
  }
  if (find('Cadre')) {
    corrections.push('It had a frame around the drawing: remove the frame completely.');
  }
  if (find('Bord coupé')) {
    corrections.push('Parts of the drawing touched the page edge: scale the whole scene down slightly so it fits inside the page.');
  }
  return corrections.length
    ? `${item.prompt}\n\nCORRECTION FOR THIS VERSION: ${corrections.join(' ')} Fix this while still respecting every rule of the quality checklist below; do not introduce any new defect.`
    : item.prompt;
}

// Envoyer le prompt à Google Flow (un seul onglet l'exécute : réservation côté Hub)
async function activatePromptForFlow(item, isFromQueue = false) {
  setActivePrompt(item);
  const promptText = buildPromptForFlow(item);
  copyPrompt(promptText, item.filename);

  if (!isFromQueue) {
    const current = await fetchActivePrompt();
    if (current && current.id === item.id && current.auto_run && current.claimed_by &&
        !confirm(`Le prompt #${item.id} est déjà en cours de génération dans Google Flow.\nLancer une nouvelle génération ?`)) {
      return;
    }
  }

  const payload = {
    id: item.id,
    filename: item.filename,
    ratio: item.ratio,
    prompt: promptText,
    name: item.name,
    file_source: item.file_source,
    auto_run: true,
    timestamp: Date.now()
  };

  try {
    await fetch('/api/active-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Erreur active-prompt:', err);
  }

  // La file automatique n'ouvre jamais d'onglet : l'onglet Flow connecté interroge
  // /api/active-prompt toutes les 1,5 s et réserve le prompt auprès du Hub.
  if (isFromQueue) {
    return;
  }

  // Pas de hash dans l'URL ni de nouvel onglet : un onglet n'est ouvert que si aucun n'est connecté
  const opened = await openFlowTabIfNeeded();
  showToast(opened
    ? `🚀 Prompt #${item.id} envoyé : ouverture de Google Flow (aucun onglet connecté).`
    : `🚀 Prompt #${item.id} envoyé à l'onglet Google Flow déjà ouvert.`, 'success');
}

// Naviguer vers le prochain prompt en attente
function goToNextPending() {
  const next = allPrompts.find((p) => p.status === 'pending');
  if (!next) {
    showToast('🎉 Toutes les illustrations ont été générées !', 'success');
    return;
  }

  if (currentFilterStatus === 'done') {
    document.querySelector('.filter-chip[data-val="all"]').click();
  }

  setActivePrompt(next);
  copyPrompt(next.prompt, next.filename);
  scrollToAndHighlightCard(next.id, true);
}

// Copier le prompt dans le presse-papier
async function copyPrompt(text, filename) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`📋 Prompt copié pour ${filename} !`);
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`📋 Prompt copié pour ${filename} !`);
  }
}

// --------------------------------------------------------------------------
// Téléversement et remplacement d'image avec préservation du scroll
// --------------------------------------------------------------------------
function handleFileUpload(file, item) {
  if (!file.type.startsWith('image/')) {
    showToast('⚠️ Veuillez déposer un fichier image (.jpeg, .png, .jpg)', 'error');
    return;
  }

  showToast(`⏳ Remplacement et synchronisation de ${item.filename}...`);

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          filename: item.filename,
          image_data: base64Data,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${item.filename} remplacé avec succès !`, 'success');
        if (data.low_resolution) {
          showToast(`⚠️ ${item.filename} ne fait que ${data.width}×${data.height} px : résolution insuffisante pour l'impression.`, 'error');
        }

        // Mettre à jour l'état local
        item.status = 'done';
        item.image_path = data.image_path;

        // Si la modal d'aperçu est ouverte pour cette image, la rafraîchir
        if (previewModal.style.display === 'flex' && currentPreviewItem && currentPreviewItem.id === item.id) {
          previewModalImg.src = `${item.image_path}?t=${Date.now()}`;
        }

        // Actualiser la carte in-place et rester/arriver exactement à sa ligne
        refreshGridPreservingPosition(item.id);

        // Mettre à jour les compteurs en tâche de fond
        fetch('/api/prompts')
          .then((r) => r.json())
          .then((d) => updateGlobalStats(d))
          .catch(() => {});
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      showToast(`❌ Échec de la sauvegarde : ${err.message}`, 'error');
    }
  };
  reader.readAsDataURL(file);
}

// Modal aperçu agrandi
function openImagePreview(item) {
  currentPreviewItem = item;
  previewModalTitle.textContent = item.name;
  previewModalFilename.textContent = item.filename;
  previewModalLocation.textContent = item.where_to_use || item.chapter_label || 'Partie IV';
  previewModalImg.src = `${item.image_path}?t=${Date.now()}`;
  previewModal.style.display = 'flex';
}

// Système de notification Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Utilitaire échappement HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
