/* ── State ─────────────────────────────────────────────────────────────────── */
let data = [];           // The loaded mapping array
let fileName = '';       // Original filename for save
let deleteTarget = null; // Index queued for deletion

/* ── DOM References ────────────────────────────────────────────────────────── */
const fileInput       = document.getElementById('file-input');
const saveBtn         = document.getElementById('save-btn');
const addBtn          = document.getElementById('add-btn');
const dropZone        = document.getElementById('drop-zone');
const toolbar         = document.getElementById('toolbar');
const mainContent     = document.getElementById('main-content');
const container       = document.getElementById('entries-container');
const fileInfo        = document.getElementById('file-info');
// const searchInput     = document.getElementById('search-input');
const editToggle      = document.getElementById('edit-mode-toggle');
const toast           = document.getElementById('toast');
const modalBackdrop   = document.getElementById('modal-backdrop');
const modalCancel     = document.getElementById('modal-cancel');
const modalConfirm    = document.getElementById('modal-confirm');

/* ── File Loading ──────────────────────────────────────────────────────────── */
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) loadFile(file);
  fileInput.value = '';
});

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.json')) {
    loadFile(file);
  } else {
    showToast('Please drop a valid .json file.', 'error');
  }
});

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array.');
      data = parsed.map(item => ({
        map_id:   item.map_id  ?? '',
        sanskrit: item.sanskrit ?? '',
        english:  item.english  ?? '',
        notes:    item.notes    ?? ''
      }));
      fileName = file.name;
      renderAll();
      switchToEditor();
      showToast(`Loaded ${data.length} verse${data.length !== 1 ? 's' : ''} from "${file.name}"`, 'success');
    } catch (err) {
      showToast(`Error parsing JSON: ${err.message}`, 'error');
    }
  };
  reader.readAsText(file);
}

function switchToEditor() {
  dropZone.classList.add('hidden');
  toolbar.classList.remove('hidden');
  mainContent.classList.remove('hidden');
  saveBtn.disabled = false;
  addBtn.disabled  = false;
  updateFileInfo();
}

function updateFileInfo() {
  fileInfo.textContent = `${fileName}  ·  ${data.length} verse${data.length !== 1 ? 's' : ''}`;
}


/* ── Render ──────────────────────────────────────────────────────────────────── */
// DOM structure:
//   inserter(before=0) · card(0) · inserter(before=1) · card(1) · … · inserter(before=n)
function renderAll() {
  container.innerHTML = '';

  if (data.length === 0) {
    container.appendChild(buildInserter(0));
    return;
  }

  data.forEach((item, idx) => {
    container.appendChild(buildInserter(idx));
    container.appendChild(buildCard(item, idx));
  });
  container.appendChild(buildInserter(data.length));

  // applySearch(searchInput.value);
}


/* ── Inserter ────────────────────────────────────────────────────────────────── */
function buildInserter(before) {
  const el = document.createElement('div');
  el.className = 'inserter';
  el.dataset.before = before;

  el.innerHTML = `
    <div class="inserter-line"></div>
    <button class="inserter-btn" title="Insert verse here">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none"
           viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      Insert verse here
    </button>
    <div class="inserter-line"></div>
  `;

  el.querySelector('.inserter-btn').addEventListener('click', () => insertAt(before));
  return el;
}

function insertAt(before) {
  data.splice(before, 0, { map_id: '', sanskrit: '', english: '', notes: '' });
  renderAll();
  updateFileInfo();

  // Ensure edit mode is on
  if (!editToggle.checked) {
    editToggle.checked = true;
    document.body.classList.add('edit-mode');
    container.querySelectorAll('textarea.edit-area').forEach(autoResize);
  }

  // Scroll new card into view and focus its ID field
  const newCard = container.querySelector(`.entry-card[data-idx="${before}"]`);
  if (newCard) {
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => newCard.querySelector('.id-input')?.focus(), 220);
  }
}


/* ── Card ────────────────────────────────────────────────────────────────────── */
function buildCard(item, idx) {
  const card = document.createElement('article');
  card.className = 'entry-card';
  card.dataset.idx = idx;

  const hasNotes = (item.notes ?? '').trim().length > 0;

  card.innerHTML = `
    <div class="entry-inner">

      <div class="map-id-row">
        <div class="map-id-display">
          <span class="id-label">Verse</span>
          <span class="id-value">${escHtml(String(item.map_id))}</span>
        </div>
        <div class="map-id-editable">
          <span class="id-label">ID</span>
          <input class="id-input" type="text"
                 value="${escAttr(String(item.map_id))}"
                 data-field="map_id" data-idx="${idx}"
                 placeholder="auto" />
        </div>
        <div class="entry-actions">
          <button class="action-btn delete-btn" data-idx="${idx}" title="Delete verse">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
                       01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2
                       0a1 1 0 00-1-1h-4a1 1 0 00-1 1H5" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="sanskrit-block">
        <div class="field-label">Sanskrit</div>
        <div class="sanskrit-text">${escHtml(item.sanskrit)}</div>
        <textarea class="edit-area sanskrit-edit"
                  data-field="sanskrit" data-idx="${idx}" rows="3">${escHtml(item.sanskrit)}</textarea>
      </div>

      <div class="english-block">
        <div class="field-label">Translation</div>
        <div class="english-text">${escHtml(item.english)}</div>
        <textarea class="edit-area english-edit"
                  data-field="english" data-idx="${idx}" rows="4">${escHtml(item.english)}</textarea>
      </div>

      <div class="notes-block${hasNotes ? '' : ' empty-notes'}">
        <div class="field-label">Notes &amp; Commentary</div>
        <div class="notes-display">${hasNotes ? escHtml(item.notes) : 'No notes yet…'}</div>
        <textarea class="edit-area notes-edit"
                  data-field="notes" data-idx="${idx}" rows="3"
                  placeholder="Add notes or commentary…">${escHtml(item.notes)}</textarea>
      </div>

    </div>
  `;

  card.querySelectorAll('textarea[data-field]').forEach(ta => {
    ta.addEventListener('input', () => { syncField(ta); autoResize(ta); });
    autoResize(ta);
  });

  card.querySelector('.id-input').addEventListener('input', e => syncField(e.target));

  card.querySelector('.delete-btn').addEventListener('click', e => {
    confirmDelete(parseInt(e.currentTarget.dataset.idx, 10));
  });

  return card;
}

function syncField(el) {
  const idx   = parseInt(el.dataset.idx, 10);
  const field = el.dataset.field;
  const val   = el.value;

  data[idx][field] = val;

  const card = container.querySelector(`.entry-card[data-idx="${idx}"]`);
  if (!card) return;

  if (field === 'map_id') {
    card.querySelector('.id-value').textContent = val;
  } else if (field === 'sanskrit') {
    card.querySelector('.sanskrit-text').textContent = val;
  } else if (field === 'english') {
    card.querySelector('.english-text').textContent = val;
  } else if (field === 'notes') {
    const notesDisplay = card.querySelector('.notes-display');
    const notesBlock   = card.querySelector('.notes-block');
    if (val.trim()) {
      notesDisplay.textContent = val;
      notesBlock.classList.remove('empty-notes');
    } else {
      notesDisplay.textContent = 'No notes yet…';
      notesBlock.classList.add('empty-notes');
    }
  }
}

function autoResize(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}


/* ── Edit Mode ───────────────────────────────────────────────────────────────── */
editToggle.addEventListener('change', () => {
  document.body.classList.toggle('edit-mode', editToggle.checked);
  if (editToggle.checked) {
    container.querySelectorAll('textarea.edit-area').forEach(autoResize);
  }
});

// Keyboard shortcut: Ctrl+E (or Cmd+E) toggles Edit Mode.
// Ignore when the user is typing in an input, textarea, or contenteditable.
document.addEventListener('keydown', (e) => {
  if (!e) return;
  const key = e.key || '';
  const mod = e.ctrlKey || e.metaKey;

  const active = document.activeElement;
  const tag = active && active.tagName ? active.tagName.toUpperCase() : '';
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable);

  // Toggle Edit Mode with Ctrl/Cmd+E
  if (mod && (key === 'e' || key === 'E')) {
    if (isTyping) return;
    e.preventDefault();
    editToggle.checked = !editToggle.checked;
    editToggle.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  // Save with Ctrl/Cmd+S
  if (mod && (key === 's' || key === 'S')) {
    if (isTyping) return;
    e.preventDefault();
    saveJSON();
    return;
  }
});



/* ── Header "Add Verse" → append at end ─────────────────────────────────────── */
addBtn.addEventListener('click', () => insertAt(data.length));


/* ── Delete ──────────────────────────────────────────────────────────────────── */
function confirmDelete(idx) {
  deleteTarget = idx;
  modalBackdrop.classList.remove('hidden');
}

modalCancel.addEventListener('click', () => {
  deleteTarget = null;
  modalBackdrop.classList.add('hidden');
});

modalConfirm.addEventListener('click', () => {
  if (deleteTarget === null) return;
  data.splice(deleteTarget, 1);
  deleteTarget = null;
  modalBackdrop.classList.add('hidden');
  renderAll();
  updateFileInfo();
  showToast('Verse deleted.', 'success');
});

modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) {
    deleteTarget = null;
    modalBackdrop.classList.add('hidden');
  }
});


/* ── Search / Filter ─────────────────────────────────────────────────────────── */
// searchInput.addEventListener('input', () => applySearch(searchInput.value));

function applySearch(query) {
  const q = query.trim().toLowerCase();
  let visible = 0;

  container.querySelectorAll('.entry-card').forEach(card => {
    const idx  = parseInt(card.dataset.idx, 10);
    const item = data[idx];
    const match = !q
      || String(item.map_id).toLowerCase().includes(q)
      || item.sanskrit.toLowerCase().includes(q)
      || item.english.toLowerCase().includes(q)
      || item.notes.toLowerCase().includes(q);

    card.classList.toggle('hidden-entry', !match);
    if (match) visible++;
  });

  // Hide inserters while searching (confusing in a filtered view)
  container.querySelectorAll('.inserter').forEach(ins => {
    ins.classList.toggle('inserter-hidden', !!q);
  });

  let noRes = container.querySelector('.no-results');
  if (visible === 0 && q) {
    if (!noRes) {
      noRes = document.createElement('p');
      noRes.className = 'no-results';
      container.appendChild(noRes);
    }
    noRes.textContent = `No verses matched "${query}".`;
  } else {
    noRes?.remove();
  }
}


/* ── Save JSON ───────────────────────────────────────────────────────────────── */
saveBtn.addEventListener('click', saveJSON);

function isBlankEntry(item) {
  return (
    String(item.map_id ?? '').trim() === '' &&
    (item.sanskrit ?? '').trim() === '' &&
    (item.english  ?? '').trim() === '' &&
    (item.notes    ?? '').trim() === ''
  );
}

function saveJSON() {
  if (!data.length) { showToast('Nothing to save.', 'error'); return; }

  // 1. Drop completely blank entries
  const nonempty = data.filter(item => !isBlankEntry(item));
  const pruned   = data.length - nonempty.length;

  // 2. Auto-assign IDs where blank.
  //    Walk through: if a verse has no ID, give it (highest seen so far) + 1.
  let maxSeen = nonempty.reduce((max, item) => {
    const n = Number(item.map_id);
    return isFinite(n) && String(item.map_id).trim() !== '' ? Math.max(max, n) : max;
  }, 0);

  const output = nonempty.map(item => {
    let id = item.map_id;
    if (String(id).trim() === '') {
      maxSeen += 1;
      id = maxSeen;
    } else {
      const n = Number(id);
      id = isFinite(n) ? n : id;
      if (typeof id === 'number') maxSeen = Math.max(maxSeen, id);
    }

    const obj = { map_id: id, sanskrit: item.sanskrit, english: item.english };
    if ((item.notes ?? '').trim()) obj.notes = item.notes;
    return obj;
  });

  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = fileName || 'mappings.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  let msg = `Saved "${a.download}"`;
  if (pruned > 0) msg += ` · ${pruned} blank verse${pruned !== 1 ? 's' : ''} removed`;
  showToast(msg, 'success');
}


/* ── Toast ───────────────────────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className   = 'toast show' + (type ? ` ${type}` : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}


/* ── Helpers ─────────────────────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}
