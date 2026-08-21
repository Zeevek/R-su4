// Éditeur PDF — tout se passe en local dans le navigateur (aucun envoi réseau).
'use strict';

pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdf.worker.min.js';
const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;

/* ---------- État global ---------- */
let libDoc = null;                 // PDFDocument (pdf-lib) — source de vérité structurelle
let helveticaFont = null;          // police embarquée dans libDoc
const sources = [];                // [{ pdfjsDoc }] pour le rendu visuel des pages importées
let pages = [];                    // [{ id, libPage, isBlank, blankSize?, srcId?, srcPageIndex?, annotations:[] }]
let currentIndex = -1;             // page affichée dans le viewer principal
let zoom = 1;
let currentTool = 'select';
let selectedAnn = null;            // { entry, ann, el }
let idCounter = 1;
const genId = () => 'a' + (idCounter++);
let redactWarned = false;
const allEntries = new Map(); // id -> entry, jamais purgé : garantit que l'undo retrouve toujours le bon PDFPage

const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 60;

/* ---------- Raccourcis DOM ---------- */
const $ = (sel) => document.querySelector(sel);
const fileInput = $('#fileInput');
const mergeInput = $('#mergeInput');
const imageInput = $('#imageInput');
const viewer = $('#viewer');
const pagesList = $('#pagesList');
const emptyState = $('#emptyState');
const toast = $('#toast');
const colorPicker = $('#colorPicker');
const sizePicker = $('#sizePicker');
const sizeLabel = $('#sizeLabel');

function showToast(msg, ms = 2600){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), ms);
}

function hexToRgb01(hex){
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '#000000');
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16) / 255, g: parseInt(m[2], 16) / 255, b: parseInt(m[3], 16) / 255 };
}

/* ================= Historique (undo/redo) ================= */
function snapshotState(){
  return JSON.stringify(pages.map(p => ({
    id: p.id, isBlank: !!p.isBlank, blankSize: p.blankSize || null,
    srcId: p.srcId, srcPageIndex: p.srcPageIndex,
    rotation: p.libPage ? p.libPage.getRotation().angle : 0,
    rasterize: !!p.rasterize,
    annotations: p.annotations
  })));
}
function pushHistory(){
  undoStack.push(snapshotState());
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
  updateUndoButtons();
}
function restoreFromSnapshot(json){
  const meta = JSON.parse(json);
  // `allEntries` conserve toutes les pages créées (même retirées de `pages`), donc leur
  // PDFPage vivant est toujours retrouvable ici, y compris après une suppression annulée.
  const newPages = meta.map(m => {
    const entry = allEntries.get(m.id);
    entry.annotations = m.annotations;
    entry.rasterize = m.rasterize;
    entry.libPage.setRotation(degrees(m.rotation));
    return entry;
  });
  pages = newPages;
  resyncPageOrder();
  if (currentIndex >= pages.length) currentIndex = pages.length - 1;
  renderThumbnails();
  renderCurrentPage();
  updateUndoButtons();
}
function undo(){
  if (!undoStack.length) return;
  redoStack.push(snapshotState());
  restoreFromSnapshot(undoStack.pop());
}
function redo(){
  if (!redoStack.length) return;
  undoStack.push(snapshotState());
  restoreFromSnapshot(redoStack.pop());
}
function updateUndoButtons(){
  $('#btnUndo').disabled = undoStack.length === 0;
  $('#btnRedo').disabled = redoStack.length === 0;
}

/* ================= Ouverture / fusion de PDF ================= */
async function openPdfFile(file, { merge } = {}){
  const bytes = new Uint8Array(await file.arrayBuffer());
  let otherLibDoc;
  try {
    if (!merge) {
      libDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      helveticaFont = await libDoc.embedFont(StandardFonts.Helvetica);
      pages = [];
      sources.length = 0;
      otherLibDoc = libDoc;
    } else {
      if (!libDoc) return openPdfFile(file, { merge: false });
      otherLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    }
  } catch (e) {
    console.error(e);
    showToast('❌ Impossible de lire ce PDF (protégé ou corrompu ?)');
    return;
  }

  let pdfjsDoc;
  try {
    pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  } catch (e) {
    console.error(e);
    showToast('❌ Le rendu visuel de ce PDF a échoué.');
    return;
  }
  const srcId = sources.push({ pdfjsDoc }) - 1;
  const addedCount = otherLibDoc.getPageCount();

  if (!merge) {
    // libDoc vient d'être chargé : ses pages sont déjà les bonnes, on les référence directement
    // (pas besoin de les copier — ça préserverait moins bien l'AcroForm existant).
    libDoc.getPages().forEach((libPage, i) => {
      const entry = { id: genId(), libPage, srcId, srcPageIndex: i, annotations: [] };
      allEntries.set(entry.id, entry);
      pages.push(entry);
    });
  } else {
    const copiedPages = await libDoc.copyPages(otherLibDoc, otherLibDoc.getPageIndices());
    copiedPages.forEach((p, i) => {
      libDoc.addPage(p);
      const entry = { id: genId(), libPage: p, srcId, srcPageIndex: i, annotations: [] };
      allEntries.set(entry.id, entry);
      pages.push(entry);
    });
  }

  resyncPageOrder();
  undoStack.length = 0; redoStack.length = 0; updateUndoButtons();
  emptyState.style.display = 'none';
  viewer.classList.add('show');
  currentIndex = merge ? currentIndex : 0;
  if (currentIndex < 0) currentIndex = 0;
  await detectFormFields();
  renderThumbnails();
  renderCurrentPage();
  showToast(merge ? `➕ ${addedCount} page(s) ajoutée(s)` : `✅ ${file.name} ouvert (${pages.length} page(s))`);
}

function resyncPageOrder(){
  if (!libDoc) return;
  for (let i = libDoc.getPageCount() - 1; i >= 0; i--) libDoc.removePage(i);
  pages.forEach((entry, idx) => libDoc.insertPage(idx, entry.libPage));
}

/* ================= Pages : ajout / suppression / rotation / réorganisation ================= */
async function addBlankPage(afterIndex){
  const size = [595.28, 841.89]; // A4
  if (!libDoc) {
    libDoc = await PDFDocument.create();
    helveticaFont = await libDoc.embedFont(StandardFonts.Helvetica);
  }
  pushHistory();
  // Un mini-PDF jetable donne une page pdf.js pour cette page blanche : ça permet de réutiliser
  // exactement le même moteur de rendu/rotation que pour les pages importées (pas de cas particulier).
  const tmp = await PDFDocument.create();
  tmp.addPage(size);
  const tmpBytes = await tmp.save();
  const pdfjsDoc = await pdfjsLib.getDocument({ data: tmpBytes }).promise;
  const srcId = sources.push({ pdfjsDoc }) - 1;

  const libPage = libDoc.addPage(size);
  const entry = { id: genId(), libPage, isBlank: true, srcId, srcPageIndex: 0, annotations: [] };
  allEntries.set(entry.id, entry);
  const at = (afterIndex == null ? pages.length - 1 : afterIndex) + 1;
  pages.splice(at, 0, entry);
  resyncPageOrder();
  currentIndex = at;
  emptyState.style.display = 'none';
  viewer.classList.add('show');
  renderThumbnails();
  renderCurrentPage();
}

function rotatePage(idx, delta){
  pushHistory();
  const entry = pages[idx];
  const cur = entry.libPage.getRotation().angle;
  entry.libPage.setRotation(degrees(((cur + delta) % 360 + 360) % 360));
  renderThumbnails();
  if (idx === currentIndex) renderCurrentPage();
}

async function duplicatePage(idx){
  pushHistory();
  const src = pages[idx];
  const [copy] = await libDoc.copyPages(libDoc, [libDoc.getPages().indexOf(src.libPage)]);
  const entry = {
    id: genId(), libPage: copy, isBlank: src.isBlank,
    srcId: src.srcId, srcPageIndex: src.srcPageIndex,
    annotations: JSON.parse(JSON.stringify(src.annotations))
  };
  allEntries.set(entry.id, entry);
  pages.splice(idx + 1, 0, entry);
  resyncPageOrder();
  renderThumbnails();
}

function deletePage(idx){
  if (pages.length <= 1) { showToast('Impossible de supprimer la dernière page.'); return; }
  pushHistory();
  pages.splice(idx, 1);
  resyncPageOrder();
  if (currentIndex >= pages.length) currentIndex = pages.length - 1;
  renderThumbnails();
  renderCurrentPage();
}

function movePage(oldIndex, newIndex){
  if (oldIndex === newIndex) return;
  pushHistory();
  const [p] = pages.splice(oldIndex, 1);
  pages.splice(newIndex, 0, p);
  resyncPageOrder();
  if (currentIndex === oldIndex) currentIndex = newIndex;
  renderThumbnails();
  renderCurrentPage();
}

function toggleRasterize(idx){
  pushHistory();
  pages[idx].rasterize = !pages[idx].rasterize;
  renderThumbnails();
}

/* ================= Rendu : vignettes ================= */
async function renderThumbnails(){
  pagesList.innerHTML = '';
  for (let i = 0; i < pages.length; i++){
    const entry = pages[i];
    const wrap = document.createElement('div');
    wrap.className = 'page-thumb' + (i === currentIndex ? ' current' : '');
    wrap.draggable = true;
    wrap.dataset.idx = i;

    const canvas = document.createElement('canvas');
    await renderEntryToCanvas(entry, canvas, 0.16);
    wrap.appendChild(canvas);

    const num = document.createElement('div');
    num.className = 'num';
    num.textContent = `${i + 1}${entry.rasterize ? ' 🧊' : ''}`;
    wrap.appendChild(num);

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.innerHTML = `
      <label title="Sélectionner pour extraire/supprimer"><input type="checkbox" class="chk"></label>
      <button data-a="rotL" title="Rotation -90°">⟲</button>
      <button data-a="rotR" title="Rotation +90°">⟳</button>
      <button data-a="dup" title="Dupliquer">⧉</button>
      <button data-a="raster" title="Rastériser (garantit la suppression du contenu masqué)">🧊</button>
      <button data-a="del" title="Supprimer">🗑️</button>`;
    wrap.appendChild(actions);

    wrap.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('label')) return;
      currentIndex = i; renderThumbnails(); renderCurrentPage();
    });
    actions.querySelector('[data-a=rotL]').onclick = () => rotatePage(i, -90);
    actions.querySelector('[data-a=rotR]').onclick = () => rotatePage(i, 90);
    actions.querySelector('[data-a=dup]').onclick = () => duplicatePage(i);
    actions.querySelector('[data-a=raster]').onclick = () => toggleRasterize(i);
    actions.querySelector('[data-a=del]').onclick = () => deletePage(i);
    actions.querySelector('.chk').checked = !!entry._selected;
    actions.querySelector('.chk').onchange = (e) => { entry._selected = e.target.checked; updateSelectionBar(); };

    wrap.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', String(i)); });
    wrap.addEventListener('dragover', (e) => { e.preventDefault(); wrap.classList.add('dragover'); });
    wrap.addEventListener('dragleave', () => wrap.classList.remove('dragover'));
    wrap.addEventListener('drop', (e) => {
      e.preventDefault(); wrap.classList.remove('dragover');
      const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
      movePage(from, i);
    });

    pagesList.appendChild(wrap);
  }
  updateSelectionBar();
}

function updateSelectionBar(){
  const any = pages.some(p => p._selected);
  $('#selectionActions').hidden = !any;
}

async function renderEntryToCanvas(entry, canvas, scaleOverride){
  const ctx = canvas.getContext('2d');
  const src = sources[entry.srcId];
  const page = await src.pdfjsDoc.getPage(entry.srcPageIndex + 1);
  const rotation = entry.libPage.getRotation().angle;
  const scale = (scaleOverride || zoom) * 1.3229;
  const viewport = page.getViewport({ scale, rotation });
  canvas.width = viewport.width; canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { width: viewport.width, height: viewport.height, viewport };
}

/* ================= Rendu : page principale + calques d'annotation ================= */
async function renderCurrentPage(){
  viewer.innerHTML = '';
  if (currentIndex < 0 || !pages[currentIndex]) return;
  const entry = pages[currentIndex];

  const stage = document.createElement('div');
  stage.className = 'page-stage';

  const canvas = document.createElement('canvas');
  canvas.className = 'base';
  const { width, height, viewport } = await renderEntryToCanvas(entry, canvas, zoom);
  entry._viewport = viewport;
  stage.style.width = width + 'px';
  stage.style.height = height + 'px';
  stage.appendChild(canvas);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'overlay-svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.style.position = 'absolute'; svg.style.inset = '0'; svg.style.pointerEvents = 'none';
  stage.appendChild(svg);

  const overlay = document.createElement('div');
  overlay.className = 'overlay' + (currentTool === 'select' ? ' mode-select' : '');
  overlay.style.width = width + 'px';
  overlay.style.height = height + 'px';
  stage.appendChild(overlay);

  viewer.appendChild(stage);

  attachOverlayInteractions(entry, overlay, svg);
  redrawAnnotations(entry, overlay, svg);
}

/* Conversion écran(px) <-> PDF(pt) via le viewport pdf.js (gère rotation et zoom). */
function screenToPdf(entry, x, y){
  const [px, py] = entry._viewport.convertToPdfPoint(x, y);
  return { x: px, y: py };
}
function pdfToScreen(entry, x, y){
  const [sx, sy] = entry._viewport.convertToViewportPoint(x, y);
  return { x: sx, y: sy };
}

/* ================= Dessin des annotations existantes ================= */
function redrawAnnotations(entry, overlay, svg){
  overlay.querySelectorAll('.ann').forEach(n => n.remove());
  svg.innerHTML = '';
  entry.annotations.forEach(ann => drawOneAnnotation(entry, ann, overlay, svg));
}

function svgEl(tag, attrs){
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function boxToScreen(entry, ann){
  const p1 = pdfToScreen(entry, ann.x, ann.y);
  const p2 = pdfToScreen(entry, ann.x + ann.width, ann.y - ann.height);
  return {
    left: Math.min(p1.x, p2.x), top: Math.min(p1.y, p2.y),
    width: Math.abs(p2.x - p1.x), height: Math.abs(p2.y - p1.y)
  };
}

function drawOneAnnotation(entry, ann, overlay, svg){
  if (ann.type === 'text'){
    const box = boxToScreen(entry, { x: ann.x, y: ann.y, width: 260, height: ann.fontSize * 1.3 });
    const div = document.createElement('div');
    div.className = 'ann ann-text';
    div.style.left = box.left + 'px'; div.style.top = box.top + 'px';
    div.style.color = ann.color; div.style.fontSize = (ann.fontSize * zoom * 1.3229) + 'px';
    div.style.minWidth = '20px'; div.style.minHeight = '1em';
    div.textContent = ann.text;
    bindAnnCommon(div, entry, ann);
    div.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      div.contentEditable = 'true'; div.focus();
      document.getSelection().selectAllChildren(div);
    });
    div.addEventListener('blur', () => {
      div.contentEditable = 'false';
      ann.text = div.textContent;
      if (!ann.text.trim()){ entry.annotations = entry.annotations.filter(a => a !== ann); redrawAnnotations(entry, overlay, svg); }
    });
    overlay.appendChild(div);
  } else if (ann.type === 'image'){
    const box = boxToScreen(entry, ann);
    const div = document.createElement('div');
    div.className = 'ann ann-image';
    div.style.left = box.left + 'px'; div.style.top = box.top + 'px';
    div.style.width = box.width + 'px'; div.style.height = box.height + 'px';
    const img = document.createElement('img'); img.src = ann.dataUrl; div.appendChild(img);
    const handle = document.createElement('div'); handle.className = 'handle'; div.appendChild(handle);
    bindAnnCommon(div, entry, ann);
    bindResizeHandle(handle, entry, ann, () => redrawAnnotations(entry, overlay, svg));
    overlay.appendChild(div);
  } else if (ann.type === 'rect' || ann.type === 'redact'){
    const box = boxToScreen(entry, ann);
    const r = svgEl('rect', {
      x: box.left, y: box.top, width: box.width, height: box.height,
      fill: ann.type === 'redact' ? ann.color : (ann.filled ? ann.color : 'none'),
      stroke: ann.type === 'redact' ? 'none' : ann.color,
      'stroke-width': ann.lineWidth * zoom * 1.3229, 'pointer-events': 'visiblePainted',
      'data-id': ann._id
    });
    r.addEventListener('mousedown', (e) => selectAnnotationSvg(e, entry, ann));
    svg.appendChild(r);
  } else if (ann.type === 'ellipse'){
    const box = boxToScreen(entry, ann);
    const e1 = svgEl('ellipse', {
      cx: box.left + box.width / 2, cy: box.top + box.height / 2, rx: box.width / 2, ry: box.height / 2,
      fill: ann.filled ? ann.color : 'none', stroke: ann.color,
      'stroke-width': ann.lineWidth * zoom * 1.3229, 'pointer-events': 'visiblePainted'
    });
    e1.addEventListener('mousedown', (e) => selectAnnotationSvg(e, entry, ann));
    svg.appendChild(e1);
  } else if (ann.type === 'line'){
    const p1 = pdfToScreen(entry, ann.x1, ann.y1), p2 = pdfToScreen(entry, ann.x2, ann.y2);
    const l = svgEl('line', {
      x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: ann.color,
      'stroke-width': ann.lineWidth * zoom * 1.3229, 'stroke-linecap': 'round', 'pointer-events': 'stroke'
    });
    l.addEventListener('mousedown', (e) => selectAnnotationSvg(e, entry, ann));
    svg.appendChild(l);
  } else if (ann.type === 'draw'){
    const pts = ann.points.map(p => pdfToScreen(entry, p[0], p[1]));
    const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
    const path = svgEl('path', {
      d, fill: 'none', stroke: ann.color, 'stroke-width': ann.lineWidth * zoom * 1.3229,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'stroke'
    });
    path.addEventListener('mousedown', (e) => selectAnnotationSvg(e, entry, ann));
    svg.appendChild(path);
  }
}

function bindAnnCommon(div, entry, ann){
  div.addEventListener('mousedown', (e) => {
    if (currentTool !== 'select') return;
    if (e.target.classList.contains('handle')) return;
    e.stopPropagation();
    selectAnnotation(entry, ann, div);
    const startPt = screenToPdf(entry, e.offsetX + div.offsetLeft, e.offsetY + div.offsetTop);
    const originX = ann.x, originY = ann.y;
    const stageEl = div.closest('.page-stage'); // capturé avant redraw : redrawAnnotations recrée `div`
    const onMove = (ev) => {
      const stage = stageEl.getBoundingClientRect();
      const cx = ev.clientX - stage.left, cy = ev.clientY - stage.top;
      const cur = screenToPdf(entry, cx, cy);
      ann.x = originX + (cur.x - startPt.x);
      ann.y = originY + (cur.y - startPt.y);
      const overlay = div.parentElement, svg = overlay.previousElementSibling;
      redrawAnnotations(entry, overlay, svg);
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    pushHistory();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function bindResizeHandle(handle, entry, ann, onChange){
  handle.addEventListener('mousedown', (e) => {
    e.stopPropagation(); e.preventDefault();
    pushHistory();
    const stageEl = handle.closest('.page-stage'); // capturé avant redraw : redrawAnnotations recrée `handle`
    const onMove = (ev) => {
      const stage = stageEl.getBoundingClientRect();
      const cx = ev.clientX - stage.left, cy = ev.clientY - stage.top;
      const p = screenToPdf(entry, cx, cy);
      ann.width = Math.max(10, p.x - ann.x);
      ann.height = Math.max(10, ann.y - p.y);
      onChange();
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function selectAnnotation(entry, ann, el){
  selectedAnn = { entry, ann, el };
  document.querySelectorAll('.ann.selected').forEach(n => n.classList.remove('selected'));
  if (el) el.classList.add('selected');
  showSelectionPanel(ann);
}
function selectAnnotationSvg(e, entry, ann){
  if (currentTool !== 'select') return;
  e.stopPropagation();
  selectedAnn = { entry, ann, el: null };
  showSelectionPanel(ann);
}
function showSelectionPanel(ann){
  const box = $('#selectionBox'); box.hidden = false;
  $('#selectionProps').innerHTML = `<div>Type : <b>${ann.type}</b></div>`;
}
function deleteSelectedAnnotation(){
  if (!selectedAnn) return;
  pushHistory();
  const { entry, ann } = selectedAnn;
  entry.annotations = entry.annotations.filter(a => a !== ann);
  selectedAnn = null;
  $('#selectionBox').hidden = true;
  renderCurrentPage();
}

/* ================= Interactions de création (outils) ================= */
function attachOverlayInteractions(entry, overlay, svg){
  let drafting = null;

  overlay.addEventListener('mousedown', (e) => {
    if (e.target.closest('.ann')) return; // laissé à bindAnnCommon
    e.preventDefault(); // sinon le focus posé sur le champ texte est écrasé par l'action native du navigateur
    const stage = overlay.closest('.page-stage').getBoundingClientRect();
    const x = e.clientX - stage.left, y = e.clientY - stage.top;
    const p = screenToPdf(entry, x, y);

    if (currentTool === 'select'){
      selectedAnn = null; $('#selectionBox').hidden = true;
      document.querySelectorAll('.ann.selected').forEach(n => n.classList.remove('selected'));
      return;
    }
    if (currentTool === 'text'){
      pushHistory();
      const ann = { _id: genId(), type: 'text', x: p.x, y: p.y, text: '', fontSize: Number(sizePicker.value) || 16, color: colorPicker.value };
      entry.annotations.push(ann);
      redrawAnnotations(entry, overlay, svg);
      const div = [...overlay.querySelectorAll('.ann-text')].pop();
      if (div){ div.contentEditable = 'true'; div.focus(); }
      return;
    }
    if (currentTool === 'draw' || currentTool === 'sign'){
      pushHistory();
      drafting = { type: 'draw', points: [[p.x, p.y]], color: colorPicker.value, lineWidth: Number(sizePicker.value) || 3 };
      entry.annotations.push(drafting);
      const onMove = (ev) => {
        const cx = ev.clientX - stage.left, cy = ev.clientY - stage.top;
        const cp = screenToPdf(entry, cx, cy);
        drafting.points.push([cp.x, cp.y]);
        redrawAnnotations(entry, overlay, svg);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
        if (drafting.points.length < 2) entry.annotations = entry.annotations.filter(a => a !== drafting);
        drafting = null;
      };
      document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
      return;
    }
    if (currentTool === 'redact' && !redactWarned){
      redactWarned = true;
      showToast('⬛ Masque visuel : le contenu original reste dans le fichier. Utilise 🧊 « Rastériser » sur la page pour le supprimer réellement.', 5200);
    }
    if (['rect', 'ellipse', 'redact'].includes(currentTool)){
      pushHistory();
      const type = currentTool === 'redact' ? 'redact' : currentTool;
      drafting = { type, x: p.x, y: p.y, width: 0, height: 0, color: colorPicker.value, lineWidth: Number(sizePicker.value) || 2, filled: false };
      entry.annotations.push(drafting);
      const onMove = (ev) => {
        const cx = ev.clientX - stage.left, cy = ev.clientY - stage.top;
        const cp = screenToPdf(entry, cx, cy);
        drafting.x = Math.min(p.x, cp.x); drafting.y = Math.max(p.y, cp.y);
        drafting.width = Math.abs(cp.x - p.x); drafting.height = Math.abs(cp.y - p.y);
        redrawAnnotations(entry, overlay, svg);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
        if (drafting.width < 2 || drafting.height < 2) entry.annotations = entry.annotations.filter(a => a !== drafting);
        drafting = null;
      };
      document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
      return;
    }
    if (currentTool === 'line'){
      pushHistory();
      drafting = { type: 'line', x1: p.x, y1: p.y, x2: p.x, y2: p.y, color: colorPicker.value, lineWidth: Number(sizePicker.value) || 2 };
      entry.annotations.push(drafting);
      const onMove = (ev) => {
        const cx = ev.clientX - stage.left, cy = ev.clientY - stage.top;
        const cp = screenToPdf(entry, cx, cy);
        drafting.x2 = cp.x; drafting.y2 = cp.y;
        redrawAnnotations(entry, overlay, svg);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
        drafting = null;
      };
      document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
      return;
    }
  });
}

/* ================= Insertion d'image ================= */
function readFileAsDataUrl(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
async function placeImageOnCurrentPage(file){
  if (currentIndex < 0) { showToast('Ouvre ou crée une page avant d’insérer une image.'); return; }
  const dataUrl = await readFileAsDataUrl(file);
  const dims = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = dataUrl;
  });
  const entry = pages[currentIndex];
  const pageW = parseFloat(entry.libPage.getWidth());
  const pageH = parseFloat(entry.libPage.getHeight());
  const targetW = Math.min(pageW * 0.5, 300);
  const targetH = targetW * (dims.h / dims.w);
  pushHistory();
  entry.annotations.push({
    _id: genId(), type: 'image', dataUrl,
    x: (pageW - targetW) / 2, y: (pageH + targetH) / 2, width: targetW, height: targetH
  });
  setTool('select');
  renderCurrentPage();
}

/* ================= Champs de formulaire (AcroForm) ================= */
async function detectFormFields(){
  const box = $('#formFieldsBox'), list = $('#formFieldsList');
  list.innerHTML = '';
  let fields = [];
  try { fields = libDoc.getForm().getFields(); } catch (e) { fields = []; }
  if (!fields.length){ box.hidden = true; return; }
  box.hidden = false;
  fields.forEach(f => {
    const name = f.getName();
    const row = document.createElement('div');
    // Le bundle pdf-lib est minifié : les noms de classe ne sont pas fiables, on utilise `instanceof`.
    if (f instanceof PDFLib.PDFTextField){
      row.innerHTML = `<label>${name}</label><input type="text" value="${(f.getText() || '').replace(/"/g, '&quot;')}">`;
      row.querySelector('input').addEventListener('input', (e) => { try { f.setText(e.target.value); } catch (err) {} });
    } else if (f instanceof PDFLib.PDFCheckBox){
      row.innerHTML = `<label><input type="checkbox" ${f.isChecked() ? 'checked' : ''}> ${name}</label>`;
      row.querySelector('input').addEventListener('change', (e) => { try { e.target.checked ? f.check() : f.uncheck(); } catch (err) {} });
    } else if (f instanceof PDFLib.PDFDropdown || f instanceof PDFLib.PDFOptionList){
      const opts = f.getOptions();
      row.innerHTML = `<label>${name}</label><select>${opts.map(o => `<option>${o}</option>`).join('')}</select>`;
      const sel = row.querySelector('select');
      try { sel.value = f.getSelected()[0]; } catch (e) {}
      sel.addEventListener('change', (e) => { try { f.select(e.target.value); } catch (err) {} });
    } else if (f instanceof PDFLib.PDFRadioGroup){
      const opts = f.getOptions();
      row.innerHTML = `<label>${name}</label><select>${opts.map(o => `<option>${o}</option>`).join('')}</select>`;
      const sel = row.querySelector('select');
      try { sel.value = f.getSelected(); } catch (e) {}
      sel.addEventListener('change', (e) => { try { f.select(e.target.value); } catch (err) {} });
    } else {
      row.innerHTML = `<label>${name}</label>`;
    }
    list.appendChild(row);
  });
}
// L'aperçu (et la rastérisation) s'appuient sur un rendu pdf.js figé au moment de l'ouverture :
// après un aplatissement de formulaire, il faut regénérer cette source pour que la valeur saisie
// devienne visible (sinon on continue d'afficher/rastériser l'apparence d'origine du champ).
async function refreshSourcesFromLibDoc(){
  const bytes = await libDoc.save();
  const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const srcId = sources.push({ pdfjsDoc }) - 1;
  pages.forEach((entry, idx) => { entry.srcId = srcId; entry.srcPageIndex = idx; });
}

$('#btnFlattenForm').addEventListener('click', async () => {
  pushHistory();
  try {
    const form = libDoc.getForm();
    // Sans ça, les valeurs saisies peuvent rester invisibles une fois le formulaire aplati.
    form.updateFieldAppearances(helveticaFont);
    form.flatten();
    await refreshSourcesFromLibDoc();
    showToast('🧷 Formulaire aplati.');
    $('#formFieldsBox').hidden = true;
    renderThumbnails();
    renderCurrentPage();
  } catch (e) { showToast('❌ Impossible d’aplatir ce formulaire.'); }
});

/* ================= Export final ================= */
function computeCombinedRotation(entry){
  return entry.libPage.getRotation().angle;
}

function dataUrlToBytes(dataUrl){
  const base64 = dataUrl.split(',')[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/* Rendu Canvas2D d'une page + ses annotations (pour la rastérisation garantissant une vraie suppression). */
async function renderEntryFlattenedToCanvas(entry, scale){
  const canvas = document.createElement('canvas');
  const { viewport } = await renderEntryToCanvas(entry, canvas, scale);
  const ctx = canvas.getContext('2d');
  const vp = viewport;
  for (const ann of entry.annotations){
    drawAnnotationOnCanvas2D(ctx, entry, ann, vp, scale);
  }
  return canvas;
}
function annPtToCanvas(entry, vp, x, y, scale){
  return vp.convertToViewportPoint(x, y);
}
function drawAnnotationOnCanvas2D(ctx, entry, ann, vp, scale){
  ctx.save();
  if (ann.type === 'text'){
    const [sx, sy] = annPtToCanvas(entry, vp, ann.x, ann.y - ann.fontSize * 0.85, scale);
    ctx.fillStyle = ann.color; ctx.font = `${ann.fontSize * scale * 1.3229}px Helvetica, Arial, sans-serif`;
    ctx.textBaseline = 'alphabetic';
    (ann.text || '').split('\n').forEach((line, i) => ctx.fillText(line, sx, sy + i * ann.fontSize * scale * 1.3229 * 1.2));
  } else if (ann.type === 'image'){
    const [sx, sy] = annPtToCanvas(entry, vp, ann.x, ann.y, scale);
    const img = new Image(); img.src = ann.dataUrl;
    ctx.drawImage(img, sx, sy, ann.width * scale * 1.3229, ann.height * scale * 1.3229);
  } else if (ann.type === 'rect' || ann.type === 'redact'){
    const [sx, sy] = annPtToCanvas(entry, vp, ann.x, ann.y, scale);
    const w = ann.width * scale * 1.3229, h = ann.height * scale * 1.3229;
    if (ann.type === 'redact' || ann.filled){ ctx.fillStyle = ann.color; ctx.fillRect(sx, sy, w, h); }
    else { ctx.strokeStyle = ann.color; ctx.lineWidth = ann.lineWidth * scale * 1.3229; ctx.strokeRect(sx, sy, w, h); }
  } else if (ann.type === 'ellipse'){
    const [sx, sy] = annPtToCanvas(entry, vp, ann.x + ann.width / 2, ann.y - ann.height / 2, scale);
    ctx.beginPath(); ctx.ellipse(sx, sy, Math.abs(ann.width) * scale * 1.3229 / 2, Math.abs(ann.height) * scale * 1.3229 / 2, 0, 0, Math.PI * 2);
    if (ann.filled){ ctx.fillStyle = ann.color; ctx.fill(); } else { ctx.strokeStyle = ann.color; ctx.lineWidth = ann.lineWidth * scale * 1.3229; ctx.stroke(); }
  } else if (ann.type === 'line'){
    const [x1, y1] = annPtToCanvas(entry, vp, ann.x1, ann.y1, scale), [x2, y2] = annPtToCanvas(entry, vp, ann.x2, ann.y2, scale);
    ctx.strokeStyle = ann.color; ctx.lineWidth = ann.lineWidth * scale * 1.3229; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  } else if (ann.type === 'draw'){
    ctx.strokeStyle = ann.color; ctx.lineWidth = ann.lineWidth * scale * 1.3229; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ann.points.forEach((p, i) => {
      const [sx, sy] = annPtToCanvas(entry, vp, p[0], p[1], scale);
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();
  }
  ctx.restore();
}

function triggerDownload(bytes, filename){
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function exportPdf(onlyIndices){
  if (!libDoc || !pages.length){ showToast('Aucun document à exporter.'); return; }
  showToast('⏳ Génération du PDF…', 1500);
  const outDoc = await PDFDocument.create();
  const outFont = await outDoc.embedFont(StandardFonts.Helvetica);
  const list = onlyIndices ? onlyIndices.map(i => pages[i]) : pages;

  for (const entry of list){
    if (entry.rasterize){
      const canvas = await renderEntryFlattenedToCanvas(entry, Math.max(zoom, 2));
      const dataUrl = canvas.toDataURL('image/png');
      const png = await outDoc.embedPng(dataUrlToBytes(dataUrl));
      const wPt = parseFloat(entry.libPage.getWidth());
      const hPt = parseFloat(entry.libPage.getHeight());
      const rotated = [90, 270].includes(computeCombinedRotation(entry));
      const pageSize = rotated ? [hPt, wPt] : [wPt, hPt];
      const newPage = outDoc.addPage(pageSize);
      newPage.drawImage(png, { x: 0, y: 0, width: pageSize[0], height: pageSize[1] });
      continue;
    }
    const idx = libDoc.getPages().indexOf(entry.libPage);
    const [copied] = await outDoc.copyPages(libDoc, [idx]);
    const newPage = outDoc.addPage(copied);
    const total = computeCombinedRotation(entry);
    newPage.setRotation(degrees(total));
    for (const ann of entry.annotations){
      await drawAnnotationOnPdfLibFor(outDoc, newPage, ann, outFont);
    }
  }

  const bytes = await outDoc.save();
  triggerDownload(bytes, onlyIndices ? 'extrait.pdf' : 'document-modifie.pdf');
  showToast('✅ PDF exporté.');
}
async function drawAnnotationOnPdfLibFor(outDoc, page, ann, font){
  const c = hexToRgb01(ann.color || '#000000');
  if (ann.type === 'text'){
    const baseline = ann.y - ann.fontSize * 0.85;
    page.drawText(ann.text || '', { x: ann.x, y: baseline, size: ann.fontSize, font, color: rgb(c.r, c.g, c.b), lineHeight: ann.fontSize * 1.2 });
  } else if (ann.type === 'image'){
    const isPng = ann.dataUrl.startsWith('data:image/png');
    const bytes = dataUrlToBytes(ann.dataUrl);
    const img = isPng ? await outDoc.embedPng(bytes) : await outDoc.embedJpg(bytes);
    page.drawImage(img, { x: ann.x, y: ann.y - ann.height, width: ann.width, height: ann.height });
  } else if (ann.type === 'rect' || ann.type === 'redact'){
    page.drawRectangle({
      x: ann.x, y: ann.y - ann.height, width: ann.width, height: ann.height,
      color: (ann.type === 'redact' || ann.filled) ? rgb(c.r, c.g, c.b) : undefined,
      borderColor: ann.type === 'redact' ? undefined : rgb(c.r, c.g, c.b),
      borderWidth: ann.type === 'redact' ? 0 : ann.lineWidth
    });
  } else if (ann.type === 'ellipse'){
    page.drawEllipse({
      x: ann.x + ann.width / 2, y: ann.y - ann.height / 2, xScale: ann.width / 2, yScale: ann.height / 2,
      color: ann.filled ? rgb(c.r, c.g, c.b) : undefined,
      borderColor: rgb(c.r, c.g, c.b), borderWidth: ann.lineWidth
    });
  } else if (ann.type === 'line'){
    page.drawLine({ start: { x: ann.x1, y: ann.y1 }, end: { x: ann.x2, y: ann.y2 }, thickness: ann.lineWidth, color: rgb(c.r, c.g, c.b) });
  } else if (ann.type === 'draw'){
    for (let i = 1; i < ann.points.length; i++){
      page.drawLine({
        start: { x: ann.points[i - 1][0], y: ann.points[i - 1][1] },
        end: { x: ann.points[i][0], y: ann.points[i][1] },
        thickness: ann.lineWidth, color: rgb(c.r, c.g, c.b)
      });
    }
  }
}

/* ================= Outils / raccourcis / UI générale ================= */
function setTool(tool){
  currentTool = tool;
  document.querySelectorAll('.tool').forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
  if (tool === 'redact') colorPicker.value = '#000000';
  const overlay = viewer.querySelector('.overlay');
  if (overlay) overlay.classList.toggle('mode-select', tool === 'select');
  sizePicker.title = tool === 'text' ? 'Taille du texte' : 'Épaisseur du trait';
}

document.querySelectorAll('.tool').forEach(btn => btn.addEventListener('click', () => setTool(btn.dataset.tool)));

sizePicker.addEventListener('input', () => sizeLabel.textContent = sizePicker.value);

$('#btnOpen').addEventListener('click', () => fileInput.click());
$('#btnOpenEmpty').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => { if (e.target.files[0]) openPdfFile(e.target.files[0]); e.target.value = ''; });

$('#btnMerge').addEventListener('click', () => mergeInput.click());
mergeInput.addEventListener('change', async (e) => {
  for (const f of e.target.files) await openPdfFile(f, { merge: true });
  e.target.value = '';
});

imageInput.addEventListener('change', (e) => { if (e.target.files[0]) placeImageOnCurrentPage(e.target.files[0]); e.target.value = ''; });
document.querySelector('[data-tool=image]').addEventListener('click', () => imageInput.click());

$('#btnAddBlank').addEventListener('click', () => { addBlankPage(currentIndex); });
$('#btnSave').addEventListener('click', () => exportPdf());
$('#btnUndo').addEventListener('click', undo);
$('#btnRedo').addEventListener('click', redo);
$('#btnDeleteSelected').addEventListener('click', deleteSelectedAnnotation);

$('#btnExtractSelected').addEventListener('click', () => {
  const idxs = pages.map((p, i) => p._selected ? i : -1).filter(i => i >= 0);
  if (!idxs.length) return;
  exportPdf(idxs);
});
$('#btnDeleteSelectedPages').addEventListener('click', () => {
  const idxs = pages.map((p, i) => p._selected ? i : -1).filter(i => i >= 0);
  if (!idxs.length) return;
  if (idxs.length >= pages.length){ showToast('Impossible de supprimer toutes les pages.'); return; }
  pushHistory();
  idxs.sort((a, b) => b - a).forEach(i => pages.splice(i, 1));
  resyncPageOrder();
  if (currentIndex >= pages.length) currentIndex = pages.length - 1;
  renderThumbnails(); renderCurrentPage();
});

function setZoom(z){
  zoom = Math.max(0.25, Math.min(4, z));
  $('#zoomLabel').textContent = Math.round(zoom * 100) + '%';
  renderCurrentPage(); renderThumbnails();
}
$('#btnZoomIn').addEventListener('click', () => setZoom(zoom + 0.15));
$('#btnZoomOut').addEventListener('click', () => setZoom(zoom - 0.15));

document.addEventListener('keydown', (e) => {
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  const editing = document.activeElement && document.activeElement.isContentEditable;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || editing) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && editing) { /* laisse l'édition native gérer */ }
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'){ e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y'){ e.preventDefault(); redo(); return; }
  if (e.key === 'Delete' || e.key === 'Backspace'){ if (selectedAnn) { e.preventDefault(); deleteSelectedAnnotation(); } return; }
  const map = { v: 'select', t: 'text', d: 'draw', r: 'rect', e: 'ellipse', l: 'line', i: 'image', m: 'redact', s: 'sign' };
  const tool = map[e.key.toLowerCase()];
  if (tool){
    if (tool === 'image'){ imageInput.click(); return; }
    setTool(tool);
  }
});

/* Glisser-déposer un ou plusieurs PDF n'importe où sur la page */
const dropOverlay = $('#dropOverlay');
let dragCounter = 0;
window.addEventListener('dragenter', (e) => { e.preventDefault(); dragCounter++; dropOverlay.hidden = false; });
window.addEventListener('dragleave', (e) => { e.preventDefault(); dragCounter--; if (dragCounter <= 0) dropOverlay.hidden = true; });
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', async (e) => {
  e.preventDefault(); dragCounter = 0; dropOverlay.hidden = true;
  const files = [...e.dataTransfer.files].filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
  if (!files.length) return;
  // Si un document est déjà ouvert, on fusionne toujours (jamais d'écrasement silencieux du travail en cours).
  const hasDoc = !!libDoc && pages.length > 0;
  for (let i = 0; i < files.length; i++) await openPdfFile(files[i], { merge: hasDoc || i > 0 });
});

window.addEventListener('beforeunload', (e) => {
  if (libDoc && pages.length){ e.preventDefault(); e.returnValue = ''; }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
