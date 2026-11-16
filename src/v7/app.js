  /* ================= Application (v7: print studio) ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const round = (v, p = 3) => parseFloat(v.toFixed(p));
  const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
  const uid = () => Math.random().toString(36).slice(2, 9);
  const FX_KEYS = Object.keys(base);
  const presetFx = p => { const o = {}; for (const k of FX_KEYS) o[k] = p[k]; return o; };
  const MASK_LABEL = { 0: "toute la carte", 1: "fenêtre image", 2: "bordure", 4: "masque importé", 5: "clairs", 6: "sombres", 7: "fond", 8: "couleurs choisies", 9: "sujet", 10: "contours", 11: "peu saturé", 12: "couleurs vives", 13: "motif" };
  const KIND_LABEL = { image: "Image", text: "Texte", frame: "Cadre", bg: "Fond", badge: "Badge", back: "Dos" };
  const CORE_COLORS = { "black core": "#26262b", "blue core": "#2a3a7a", "white core": "#eceae4" };

  const project = {
    formatId: "pokemon", custom: { w: 63, h: 88, r: 3 },
    front: { id: "front", layers: [], stock: "#f6f3ec", coat: 0.6 }, back: { id: "back", layers: [], stock: "#f6f3ec", coat: 0.6 },
    edge: "", coatKind: "gloss",
    print: { bleed: 3, safe: 3, dpi: 300, core: "black core" },
    protect: { mode: "none", sleeveFinish: "clear", sleeveTint: "transparent", grade: "10", mention: "GEM MINT", title: "2026 HOLO CARD LAB", binderColor: "#1c1f29" },
    pack: { kind: "booster", title: "SÉRIE 01", sub: "BOOSTER", packs: 36, cards: 10, boxColor: "#1b1d2a", finish: "h-oil", boosterW: 67, boosterH: 117, crimp: 10, fin: 12 },
    dieline: { kind: "card", boxW: 135, boxH: 122, boxD: 74, showArt: true },
    backStyle: { style: "geo", c1: "#1c2f6b", c2: "#e8b44a", text: "" },
  };
  const params = new URLSearchParams(location.search);
  const ui = { mainView: "front", cat: "holo", fmtGroup: "all", view: 0, selDoc: "front", selId: null, zoom: 1, panX: 0, panY: 0, panMode: false, space: false, picking: 0, auto: false, tilt: 16, intensity: 1, seed: Math.random() * 10, flipping: 0, baseScale: 1, quality: params.get("perf") === "low" ? 0.45 : 1.5, dirty: true, marks: false, drag: null, packDirty: false };

  const fmt = () => FORMATS.find(f => f.id === project.formatId) || FORMATS[0];
  const fmtDims = () => project.formatId === "custom" ? project.custom : fmt();
  const aspect = () => { const d = fmtDims(); return d.w / d.h; };
  const curDoc = () => (ui.mainView === "back" ? project.back : project.front);
  const selDoc = () => project[ui.selDoc];
  const sel = () => selDoc().layers.find(l => l.id === ui.selId) || null;

  /* ---- GL contexts ---- */
  const canvas = $("#gl"), canvasBack = $("#glBack"), card = $("#card"), tiltEl = $("#tiltIn"), bench = $("#bench"), stagewrap = $("#stagewrap"), protect = $("#protect"), flipEl = $("#flip");
  let R = null, RB = null, T = null, PK = null;
  try { R = makeGL(canvas); } catch (e) { console.error(e); }
  if (!R) { const d = document.createElement("div"); d.className = "nogl"; d.textContent = "WebGL n'est pas disponible dans ce navigateur. Le studio a besoin de WebGL pour le rendu."; bench.append(d); }
  const thumbCanvas = document.createElement("canvas"); try { T = R ? makeGL(thumbCanvas) : null; } catch (e) { T = null; }
  function ensureBack() { if (!RB && R) { try { RB = makeGL(canvasBack); } catch (e) { RB = null; } } return RB; }
  function loseGL(g) { try { const ext = g && g.gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); } catch (e) {} }

  /* ---- layers ---- */
  function newLayer(kind, name) {
    return { id: uid(), kind, name, src: null, w: 1, h: 1, analysis: null, version: 0, maskImg: null, maskVersion: 0, depthImg: null, depthVersion: 0,
      x: 0.5, y: 0.5, scale: 1, rot: 0, opacity: 1, blend: "normal", visible: true, fx: { ...base }, picks: [], pickTol: 0.22, win: [0.06, 0.06, 0.06, 0.06], presetId: "i-none",
      text: { text: "TITRE", font: "Unbounded", weight: "700", size: 8, spacing: 2, color: "#ffffff", stroke: "#000000", strokeW: 0, align: "center", upper: true, shadow: true },
      frame: { style: "thin", color: "#e8b44a", panel: "#101218", width: 3, panelA: 0.7 },
      bg: { type: "linear", c1: "#1a1446", c2: "#c9522f", angle: 90 },
      badge: { shape: "circle", text: "SR", color: "#e8b44a", textColor: "#1a1200" } };
  }
  function setSrc(layer, src) { layer.src = src; layer.w = src.naturalWidth || src.width; layer.h = src.naturalHeight || src.height; layer.analysis = analyze(src, layer.fx.blur); layer.version++; }
  function regen(layer) {
    const ca = aspect();
    if (layer.kind === "text") setSrc(layer, textCanvas(layer.text, ca));
    else if (layer.kind === "frame") setSrc(layer, frameCanvas(layer.frame, ca));
    else if (layer.kind === "bg") setSrc(layer, bgCanvas(layer.bg, ca));
    else if (layer.kind === "badge") setSrc(layer, badgeCanvas(layer.badge, ca));
    else if (layer.kind === "back") setSrc(layer, backCanvas(project.backStyle.style, project.backStyle.c1, project.backStyle.c2, project.backStyle.text, ca));
    else if (layer.kind === "image" && layer.src) { layer.analysis = analyze(layer.src, layer.fx.blur); layer.version++; }
  }
  let regenTimer = null;
  function regenSoon(layer) { clearTimeout(regenTimer); regenTimer = setTimeout(() => { regen(layer); refreshLayerList(); invalidateThumbs(); ui.dirty = true; }, 50); }
  function applyPreset(layer, id) {
    const p = PRESET_BY_ID[id]; if (!p) return; const prevBlur = layer.fx.blur; const keepMask = layer.fx.mask, keepInv = layer.fx.maskInvert;
    layer.fx = presetFx(p); layer.presetId = id; ui.baseScale = p.scale;
    if (p.mask === 0) { layer.fx.mask = keepMask; layer.fx.maskInvert = keepInv; }
    if (p.blur !== prevBlur && layer.src) { layer.analysis = analyze(layer.src, layer.fx.blur); layer.version++; }
    ui.dirty = true;
  }
  function fitLayer(layer, mode) { const ca = aspect(), la = layer.w / layer.h; if (mode === "cover") layer.scale = Math.max(1, la / ca); else if (mode === "contain") layer.scale = Math.min(1, la / ca); layer.x = 0.5; layer.y = 0.5; layer.rot = 0; }
  function addLayer(doc, layer, select = true) { doc.layers.push(layer); if (select) { ui.selDoc = doc.id; ui.selId = layer.id; } refreshLayerList(); syncInspector(); invalidateThumbs(); ui.dirty = true; }
  function addImageLayer(doc, img, name, presetId = "h-rainbow") { const l = newLayer("image", name || "Image"); setSrc(l, img); fitLayer(l, "cover"); applyPreset(l, presetId); addLayer(doc, l); return l; }
  function addKind(kind) {
    const doc = curDoc(); const l = newLayer(kind, { text: "Texte", frame: "Cadre", bg: "Fond", badge: "Badge" }[kind]);
    if (kind === "text") { l.y = 0.12; applyPreset(l, "f-gold"); }
    if (kind === "frame") applyPreset(l, "f-gold");
    if (kind === "bg") applyPreset(l, "i-none");
    if (kind === "badge") { l.x = 0.86; l.y = 0.08; l.scale = 0.42; applyPreset(l, "f-gold"); }
    regen(l);
    if (kind === "bg") { doc.layers.unshift(l); ui.selDoc = doc.id; ui.selId = l.id; refreshLayerList(); syncInspector(); invalidateThumbs(); ui.dirty = true; } else addLayer(doc, l);
  }
  function removeLayer(doc, id) { const i = doc.layers.findIndex(l => l.id === id); if (i < 0) return; doc.layers.splice(i, 1); for (const g of [R, RB, T, PK]) if (g) g.drop(id); if (ui.selId === id) ui.selId = doc.layers[Math.min(i, doc.layers.length - 1)]?.id || null; refreshLayerList(); syncInspector(); ui.dirty = true; }
  function duplicateLayer(doc, id) { const l = doc.layers.find(x => x.id === id); if (!l) return; const c = JSON.parse(JSON.stringify({ ...l, src: null, analysis: null, maskImg: null, depthImg: null })); c.id = uid(); c.name = l.name + " copie"; c.src = l.src; c.analysis = l.analysis; c.maskImg = l.maskImg; c.depthImg = l.depthImg; c.version = 1; doc.layers.splice(doc.layers.indexOf(l) + 1, 0, c); ui.selId = c.id; refreshLayerList(); syncInspector(); ui.dirty = true; }
  function moveLayer(doc, id, dir) { const i = doc.layers.findIndex(l => l.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= doc.layers.length) return; [doc.layers[i], doc.layers[j]] = [doc.layers[j], doc.layers[i]]; refreshLayerList(); ui.dirty = true; }

  /* ---- layer list ---- */
  function refreshLayerList() {
    const doc = curDoc(); const list = $("#layerList"); list.innerHTML = ""; $("#layersDoc").textContent = doc.id === "back" ? "· verso" : "· recto";
    if (!doc.layers.length) { const p = document.createElement("p"); p.className = "note"; p.textContent = "Aucun calque. Importez une image pour commencer."; list.append(p); }
    [...doc.layers].reverse().forEach(l => {
      const row = document.createElement("div"); row.className = "layer-row" + (l.visible ? "" : " off"); row.setAttribute("role", "button"); row.tabIndex = 0; row.setAttribute("aria-selected", String(l.id === ui.selId && ui.selDoc === doc.id));
      const th = document.createElement("div"); th.className = "th"; if (l.src && (l.kind === "image" || l.kind === "back")) th.style.backgroundImage = `url(${thumbOf(l)})`; else th.textContent = KIND_LABEL[l.kind].slice(0, 2);
      const meta = document.createElement("div"); meta.className = "meta"; const b = document.createElement("b"); b.textContent = l.name; const s = document.createElement("span"); const p = PRESET_BY_ID[l.presetId]; s.textContent = (p ? p.label : "—") + " · " + (MASK_LABEL[l.fx.mask] || ""); meta.append(b, s);
      const acts = document.createElement("div"); acts.className = "acts";
      const mk = (t, title, fn) => { const bt = document.createElement("button"); bt.type = "button"; bt.textContent = t; bt.title = title; bt.setAttribute("aria-label", title); bt.addEventListener("click", e => { e.stopPropagation(); fn(); }); return bt; };
      acts.append(mk(l.visible ? "👁" : "◌", "Afficher / masquer", () => { l.visible = !l.visible; refreshLayerList(); ui.dirty = true; }), mk("▲", "Monter", () => moveLayer(doc, l.id, 1)), mk("▼", "Descendre", () => moveLayer(doc, l.id, -1)), mk("✕", "Supprimer", () => removeLayer(doc, l.id)));
      row.append(th, meta, acts); row.addEventListener("click", () => { ui.selDoc = doc.id; ui.selId = l.id; refreshLayerList(); syncInspector(); invalidateThumbs(); });
      row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); row.click(); } });
      list.append(row);
    });
    const l = sel(); $("#fxTarget").textContent = l ? l.name : "aucun calque";
    $("#fxname").textContent = l ? (l.name + " · " + (PRESET_BY_ID[l.presetId]?.label || "")) : "";
  }
  const thumbCache = new Map();
  function thumbOf(l) { const key = l.id + ":" + l.version; let u = thumbCache.get(key); if (!u) { const [c, x] = cv(88, 88); const la = l.w / l.h; const w = la >= 1 ? 88 : 88 * la, h = la >= 1 ? 88 / la : 88; x.fillStyle = "#111"; x.fillRect(0, 0, 88, 88); x.drawImage(l.src, (88 - w) / 2, (88 - h) / 2, w, h); u = c.toDataURL("image/jpeg", 0.7); thumbCache.set(key, u); } return u; }

  /* ---- format ---- */
  function renderFormats() {
    const groups = $("#fmtGroups"); groups.innerHTML = ""; const q = $("#fmtFilter").value.trim().toLowerCase();
    for (const [id, label] of FORMAT_GROUPS) { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = label; b.setAttribute("aria-pressed", String(ui.fmtGroup === id)); b.addEventListener("click", () => { ui.fmtGroup = id; renderFormats(); }); groups.append(b); }
    const list = $("#formats"); list.innerHTML = "";
    for (const f of FORMATS) {
      if (ui.fmtGroup !== "all" && f.group !== ui.fmtGroup) continue; if (q && !(f.game + " " + f.pub).toLowerCase().includes(q)) continue;
      const b = document.createElement("button"); b.type = "button"; b.className = "format-row"; b.setAttribute("aria-pressed", String(f.id === project.formatId));
      const sh = document.createElement("div"); sh.className = "shape"; sh.style.height = Math.round(26 * f.h / f.w) + "px"; sh.style.borderRadius = Math.max(1, f.r / f.w * 26) + "px";
      const t = document.createElement("div"); const tb = document.createElement("b"); tb.textContent = f.game; const ts = document.createElement("span"); ts.textContent = f.pub; t.append(tb, ts);
      const d = document.createElement("div"); d.className = "dim"; d.textContent = `${f.w} × ${f.h}`;
      b.append(sh, t, d); b.addEventListener("click", () => selectFormat(f.id)); list.append(b);
    }
    const cu = $("#fmtCustom"); cu.hidden = project.formatId !== "custom"; cu.innerHTML = "";
    if (project.formatId === "custom") for (const [k, label] of [["w", "Largeur (mm)"], ["h", "Hauteur (mm)"], ["r", "Rayon (mm)"]]) { const lab = document.createElement("label"); lab.className = "field"; lab.textContent = label; const inp = document.createElement("input"); inp.type = "number"; inp.step = "0.5"; inp.min = "5"; inp.max = "400"; inp.value = project.custom[k]; inp.addEventListener("change", () => { project.custom[k] = Math.max(2, +inp.value || 2); applyFormat(); }); lab.append(inp); cu.append(lab); }
  }
  function selectFormat(id) { project.formatId = id; const f = fmt(); project.pack.packs = f.pack.packs; project.pack.cards = f.pack.cards; $("#packsPerBox").value = f.pack.packs; $("#cardsPerPack").value = f.pack.cards; applyFormat(); renderFormats(); if (ui.mainView === "pack") buildPackScene(); if (ui.mainView === "dieline") renderDieline(); }
  function renderFmtCurrent() {
    const f = fmt(), d = fmtDims(); const el = $("#fmtCurrent"); el.innerHTML = "";
    const b = document.createElement("b"); b.textContent = f.game; const m = document.createElement("span"); m.className = "mono"; m.textContent = `${d.w} × ${d.h} mm · angles r ${d.r} mm · épaisseur 0,33 mm`; const n = document.createElement("span"); n.className = "note"; n.textContent = f.pack.note || "";
    el.append(b, m, n);
    if (f.finishes.length) { const row = document.createElement("div"); row.className = "chips"; const lbl = document.createElement("span"); lbl.className = "note"; lbl.textContent = "Finitions de ce jeu :"; row.append(lbl); for (const id of f.finishes) { const pr = PRESET_BY_ID[id]; if (!pr) continue; const c = document.createElement("button"); c.type = "button"; c.className = "chip"; c.textContent = pr.label; c.title = pr.sub; c.addEventListener("click", () => { const l = sel(); if (!l) { toast("Sélectionnez un calque"); return; } applyPreset(l, id); syncInspector(); refreshLayerList(); }); row.append(c); } el.append(row); }
    $("#dims").textContent = `${d.w} × ${d.h} mm · 0,33 mm`;
  }
  function applyCardWidth() {
    const d = fmtDims(); const a = d.w / d.h; const bw = bench.clientWidth || 640; const bh = Math.max(380, window.innerHeight - 260);
    let w = Math.min(bw - 56, a >= 1 ? 560 : 420, bh * a);
    if (ui.mainView === "protect") { const m = project.protect.mode; if (m === "slab") w = Math.min(w, (bw - 56) * 0.74, bh * a * 0.7); else if (m === "onetouch" || m === "toploader") w = Math.min(w, (bw - 56) * 0.8, bh * a * 0.85); }
    if (ui.marks) w = Math.min(w, (bw - 56) * 0.86, bh * a * 0.86);
    const px = Math.max(120, Math.round(w)); card.style.setProperty("--card-w", px + "px"); protect.style.setProperty("--card-w", px + "px");
    const ppm = px / d.w; card.style.setProperty("--thick", Math.max(1.5, 0.33 * ppm).toFixed(2) + "px"); card.style.setProperty("--bleed-px", (project.print.bleed * ppm).toFixed(2) + "px"); drawMarks(ppm);
  }
  function applyFormat() {
    const d = fmtDims(); const a = d.w / d.h; const rad = d.r / d.w * 100;
    for (const el of [card, document.documentElement]) el.style.setProperty("--card-aspect", round(a, 4));
    card.style.setProperty("--card-radius", `${round(rad, 2)}% / ${round(rad * a, 2)}%`);
    for (const doc of [project.front, project.back]) for (const l of doc.layers) if (l.kind !== "image") regen(l);
    resize(); invalidateThumbs(); refreshLayerList(); renderFmtCurrent(); ui.dirty = true;
  }
  function drawMarks(ppm) {
    const svg = $("#marksSvg"); const d = fmtDims(); const b = project.print.bleed, s = project.print.safe; const W = (d.w + 2 * b) * ppm, H = (d.h + 2 * b) * ppm; const r = d.r * ppm;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="${(d.r + b) * ppm}" fill="none" stroke="#e0115f" stroke-width="1.2"/><rect x="${b * ppm}" y="${b * ppm}" width="${d.w * ppm}" height="${d.h * ppm}" rx="${r}" fill="none" stroke="#111" stroke-width="1.2" stroke-dasharray="6 3"/><rect x="${(b + s) * ppm}" y="${(b + s) * ppm}" width="${(d.w - 2 * s) * ppm}" height="${(d.h - 2 * s) * ppm}" rx="${Math.max(1, (d.r - s) * ppm)}" fill="none" stroke="#1a9c4b" stroke-width="1.2" stroke-dasharray="4 3"/><text x="${b * ppm + 6}" y="-6" font-size="11" fill="#e0115f" font-family="Manrope, sans-serif">fond perdu ${b} mm</text><text x="${(b + s) * ppm + 6}" y="${(b + s) * ppm + 14}" font-size="11" fill="#1a9c4b" font-family="Manrope, sans-serif">sécurité ${s} mm</text>`;
  }
  function resize() {
    if (!R) return; applyCardWidth(); const dpr = Math.min((window.devicePixelRatio || 1) * ui.quality, 3);
    const w = Math.max(1, Math.round(card.clientWidth * dpr)), h = Math.max(1, Math.round(card.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    if (RB && (canvasBack.width !== w || canvasBack.height !== h)) { canvasBack.width = w; canvasBack.height = h; }
  }
  window.addEventListener("resize", () => { resize(); ui.dirty = true; });
  if (window.ResizeObserver) new ResizeObserver(() => { resize(); ui.dirty = true; }).observe(bench);
  document.addEventListener("input", () => { ui.dirty = true; }); document.addEventListener("change", () => { ui.dirty = true; }); document.addEventListener("click", () => { ui.dirty = true; });

  /* ---- import ---- */
  function loadFile(file, cb) { if (!file || !file.type.startsWith("image/")) return; const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => { cb(im, file.name); URL.revokeObjectURL(u); }; im.src = u; }
  function importImages(files) { const doc = curDoc(); [...files].forEach(f => loadFile(f, (im, name) => { addImageLayer(doc, im, name.replace(/\.[^.]+$/, "").slice(0, 24)); toast("Calque ajouté : " + name); })); }
  $("#file").addEventListener("change", e => { importImages(e.target.files); e.target.value = ""; });
  $("#maskfile").addEventListener("change", e => loadFile(e.target.files[0], im => { const l = sel(); if (!l) return; l.maskImg = im; l.maskVersion++; l.fx.mask = 4; syncInspector(); refreshLayerList(); }));
  $("#depthfile").addEventListener("change", e => loadFile(e.target.files[0], im => { const l = sel(); if (!l) return; l.depthImg = im; l.depthVersion++; l.fx.depthSrc = 4; syncInspector(); }));
  $("#backfile").addEventListener("change", e => loadFile(e.target.files[0], im => { addImageLayer(project.back, im, "Dos importé", "i-none"); if (ui.mainView !== "back") setMainView("back"); }));
  document.addEventListener("paste", e => { const items = [...(e.clipboardData?.items || [])].filter(i => i.type.startsWith("image/")); if (items.length) importImages(items.map(i => i.getAsFile())); });
  bench.addEventListener("dragover", e => { e.preventDefault(); bench.classList.add("dropping"); });
  bench.addEventListener("dragleave", () => bench.classList.remove("dropping"));
  bench.addEventListener("drop", e => { e.preventDefault(); bench.classList.remove("dropping"); importImages(e.dataTransfer.files); });
  $("#addKind").addEventListener("change", e => { if (e.target.value) { addKind(e.target.value); e.target.value = ""; } });
  $("#sample").addEventListener("click", () => { addImageLayer(curDoc(), makeFox(), "Illustration exemple"); });

  /* ---- effects browser ---- */
  function renderCatTabs() { const el = $("#catTabs"); el.innerHTML = ""; for (const [id, label] of CATS) { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.setAttribute("aria-pressed", String(ui.cat === id)); b.addEventListener("click", () => { ui.cat = id; renderCatTabs(); renderEffects(); }); el.append(b); } }
  const fxThumbCache = new Map(); let thumbQueue = [], thumbRunning = false;
  function invalidateThumbs() { thumbQueue = []; renderEffects(); }
  function renderEffects() {
    const grid = $("#effects"); grid.innerHTML = ""; const l = sel(); thumbQueue = [];
    for (const p of PRESETS.filter(p => p.cat === ui.cat)) {
      const b = document.createElement("button"); b.type = "button"; b.className = "thumbbtn"; b.dataset.fx = p.id; b.title = p.sub || p.label; b.setAttribute("aria-pressed", String(!!l && l.presetId === p.id));
      const key = l ? `${l.id}:${l.version}:${p.id}:${round(aspect(), 3)}:${selDoc().stock}:${l.fx.mask}` : null; const cached = key && fxThumbCache.get(key);
      const im = document.createElement("img"); im.alt = ""; im.width = 66; im.height = 92; if (cached) im.src = cached; else if (l && T) thumbQueue.push({ p, im, key, l });
      const s = document.createElement("span"); s.textContent = p.label; b.append(im, s); grid.append(b);
      b.addEventListener("click", () => { const L = sel(); if (!L) { toast("Sélectionnez d'abord un calque"); return; } applyPreset(L, p.id); syncInspector(); refreshLayerList(); });
    }
    const p = l && PRESET_BY_ID[l.presetId]; $("#fxNote").textContent = p ? (CAT_LABEL[p.cat] + " · " + p.label + ". " + (p.note || "")) : "Sélectionnez un calque pour lui attribuer un procédé d'impression.";
    pumpThumbs();
  }
  function pumpThumbs() {
    if (thumbRunning) return; thumbRunning = true;
    const step = () => {
      const a = aspect(); let n = 0;
      while (thumbQueue.length && n < (ui.quality < 1 ? 1 : 4)) {
        const { p, im, key, l } = thumbQueue.shift(); if (!l.src || !l.analysis) continue;
        thumbCanvas.width = 160; thumbCanvas.height = Math.round(160 / a);
        const temp = { ...l, fx: { ...presetFx(p), mask: p.mask || l.fx.mask, maskInvert: l.fx.maskInvert } }; const doc = { stock: selDoc().stock, layers: [temp], coat: 0 };
        T.renderDoc(doc, { pointer: [0.3, 0.72], tilt: [-0.2, 0.12], aspect: a, intensity: 1, seed: ui.seed, selectedId: null, view: 0 });
        const url = thumbCanvas.toDataURL("image/jpeg", 0.82); fxThumbCache.set(key, url); im.src = url; n++;
      }
      if (thumbQueue.length) requestAnimationFrame(step); else thumbRunning = false;
    };
    requestAnimationFrame(step);
  }
  const RECIPES = [
    ["Traits dorés", "Dorure à chaud sur les contours du dessin", { preset: "f-gold", mask: 10, thr: 0.4 }],
    ["Traits argentés", "Dorure argent sur les contours", { preset: "f-silver", mask: 10, thr: 0.4 }],
    ["Bordure dorée", "Dorure à chaud sur la bordure, illustration intacte", { preset: "f-gold", mask: 2 }],
    ["Holo sur l'illustration", "Film holographique dans la fenêtre, bordure intacte", { preset: "h-rainbow", mask: 1 }],
    ["Fond holo + traits dorés", "Film holographique cosmos sur le fond, dorure sur les contours", { preset: "h-cosmic", mask: 7, accent: [0, 10] }],
    ["Fond gravé, sujet mat", "Holo gravé lignes derrière le personnage", { preset: "h-etched", mask: 7 }],
    ["Sujet holo, fond mat", "Film holographique arc-en-ciel sur le personnage seulement", { preset: "h-rainbow", mask: 9 }],
    ["Vernis 3D sur le sujet", "Vernis UV épais sur le personnage", { preset: "v-3d", mask: 9 }],
    ["Traits embossés", "Microgravure des contours", { preset: "e-contours", mask: 10, thr: 0.4 }],
    ["Encre or sur les clairs", "Encre métallique or dans les zones claires", { preset: "i-gold", mask: 5 }],
    ["Dorure sur les couleurs vives", "Dorure or sur les couleurs saturées", { preset: "f-gold", mask: 12 }],
    ["Bordure argent + holo", "Holo arc-en-ciel sur l'image, argent sur la bordure", { preset: "h-rainbow", mask: 1, accent: [1, 2] }],
  ];
  function renderRecipes() { const el = $("#recipes"); for (const [label, desc, r] of RECIPES) { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = label; b.title = desc; b.addEventListener("click", () => { const l = sel(); if (!l) { toast("Sélectionnez d'abord un calque"); return; } applyPreset(l, r.preset); l.fx.mask = r.mask; l.fx.maskInvert = 0; if (r.thr) l.fx.maskThr = r.thr; if (r.accent) { l.fx.accent = 1; l.fx.accentType = r.accent[0]; l.fx.accentMask = r.accent[1]; l.fx.accentColor = ""; } else l.fx.accent = 0; syncInspector(); refreshLayerList(); toast(label + " · " + desc); }); el.append(b); } }
  function renderAccentQuick() {
    const el = $("#accentQuick"); el.innerHTML = ""; const l = sel();
    for (const a of ACCENTS) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(!!(l && l.fx.accent && l.fx.accentType === a.type))); const d = document.createElement("span"); d.className = "dot"; d.style.background = a.css; const s = document.createElement("span"); s.textContent = a.label; b.append(d, s); b.addEventListener("click", () => { const L = sel(); if (!L) { toast("Sélectionnez d'abord un calque"); return; } L.fx.accent = 1; L.fx.accentType = a.type; L.fx.accentColor = ""; if (L.fx.accentMask === 8 && !L.picks.length) setPicking(2); syncInspector(); }); el.append(b); }
  }

  /* ---- inspector ---- */
  const PCT = v => Math.round(v * 100) + "%";
  const NUM = { imgRelief: [100, PCT], blur: [1, v => v + " px"], detail: [100, PCT], cavity: [100, PCT], bump: [100, PCT], angle: [1, v => Math.round(v) + "°"], depth: [100, PCT], relief: [100, PCT], foil: [100, PCT], sat: [100, PCT], bands: [100, v => v.toFixed(2)], sparkle: [100, PCT], edgeFoil: [100, PCT], ink: [100, PCT], glare: [100, PCT], specPow: [1, v => String(Math.round(v))], lightZ: [100, v => v.toFixed(2)], warm: [100, v => (v > 0 ? "chaud " : v < 0 ? "froid " : "neutre ") + Math.abs(Math.round(v * 100)) + "%"], maskThr: [100, PCT], maskSoft: [100, PCT], accentAmt: [100, PCT], accentRelief: [100, PCT] };
  const SELS = [["reliefSrc", "reliefSrc"], ["pattern", "pattern"], ["depthSrc", "depthSrc"], ["blend", "blend"], ["palette", "palette"], ["accentType", "accentType"]];
  function syncInspector() {
    const l = sel(); $(".inspector").style.opacity = l ? "1" : ".6";
    for (const id of ["edText", "edFrame", "edBg", "edBadge"]) $("#" + id).hidden = true;
    $("#backFold").hidden = ui.mainView !== "back";
    if (!l) { $("#layerName").value = ""; $("#layerKind").textContent = "—"; for (const b of $$("#zones [data-mask], #accentZones [data-amask], #invertChip")) b.setAttribute("aria-pressed", "false"); renderAccentQuick(); renderEffects(); return; }
    $("#layerName").value = l.name; $("#layerKind").textContent = KIND_LABEL[l.kind]; $("#layerVisible").checked = l.visible; $("#layerBlend").value = l.blend;
    $("#layerOpacity").value = Math.round(l.opacity * 100); $("#o-layerOpacity").value = PCT(l.opacity);
    $("#layerX").value = Math.round(l.x * 100); $("#o-layerX").value = Math.round(l.x * 100) + "%"; $("#layerY").value = Math.round(l.y * 100); $("#o-layerY").value = Math.round(l.y * 100) + "%";
    $("#layerScale").value = Math.round(l.scale * 100); $("#o-layerScale").value = Math.round(l.scale * 100) + "%"; $("#layerRot").value = Math.round(l.rot); $("#o-layerRot").value = Math.round(l.rot) + "°";
    if (l.kind === "text") { $("#edText").hidden = false; const t = l.text; $("#txtText").value = t.text; $("#txtFont").value = t.font; $("#txtWeight").value = t.weight; $("#txtSize").value = t.size; $("#o-txtSize").value = t.size + "%"; $("#txtSpacing").value = t.spacing; $("#o-txtSpacing").value = t.spacing; $("#txtColor").value = t.color; $("#txtStroke").value = t.stroke; $("#txtStrokeW").value = t.strokeW; $("#o-txtStrokeW").value = t.strokeW; $("#txtAlign").value = t.align; $("#txtUpper").checked = t.upper; $("#txtShadow").checked = t.shadow; }
    if (l.kind === "frame") { $("#edFrame").hidden = false; const f = l.frame; $("#frStyle").value = f.style; $("#frColor").value = f.color; $("#frPanel").value = f.panel; $("#frWidth").value = f.width; $("#o-frWidth").value = f.width + "%"; $("#frPanelA").value = Math.round(f.panelA * 100); $("#o-frPanelA").value = PCT(f.panelA); }
    if (l.kind === "bg") { $("#edBg").hidden = false; const b = l.bg; $("#bgType").value = b.type; $("#bgC1").value = b.c1; $("#bgC2").value = b.c2; $("#bgAngle").value = b.angle; $("#o-bgAngle").value = b.angle + "°"; }
    if (l.kind === "badge") { $("#edBadge").hidden = false; const b = l.badge; $("#bdShape").value = b.shape; $("#bdText").value = b.text; $("#bdColor").value = b.color; $("#bdTextColor").value = b.textColor; }
    const m = l.fx;
    for (const [k, [mul, f]] of Object.entries(NUM)) { $("#" + k).value = m[k] * mul; $("#o-" + k).value = f(m[k]); }
    const bs = ui.baseScale || m.scale || 1; $("#scale").value = Math.round(100 * m.scale / bs); $("#o-scale").value = "×" + (m.scale / bs).toFixed(2);
    for (const [id, key] of SELS) $("#" + id).value = m[key]; $("#tint").value = m.tint;
    $("#flatOnly").checked = !!m.flatOnly; $("#accent").checked = !!m.accent; $("#accentInvert").checked = !!m.accentInvert; $("#accentWithin").checked = !!m.accentWithin;
    $("#depthRow").hidden = m.depthSrc !== 4; $("#pickRow").hidden = !(m.mask === 8 || (m.accent && m.accentMask === 8)); $("#customMaskRow").hidden = m.mask !== 4;
    for (const [i, id] of ["wt", "wr", "wb", "wl"].entries()) { $("#" + id).value = l.win[i] * 100; $("#o-" + id).value = Math.round(l.win[i] * 100) + "%"; }
    $("#pickTol").value = Math.round(l.pickTol * 100); $("#o-pickTol").value = Math.round(l.pickTol * 100) + "%"; renderSwatches();
    for (const b of $$("#zones [data-mask]")) b.setAttribute("aria-pressed", String(+b.dataset.mask === m.mask)); $("#invertChip").setAttribute("aria-pressed", String(!!m.maskInvert));
    for (const b of $$("#accentZones [data-amask]")) b.setAttribute("aria-pressed", String(+b.dataset.amask === m.accentMask));
    renderAccentQuick();
    const p = PRESET_BY_ID[l.presetId]; if (p && p.cat !== ui.cat) { ui.cat = p.cat; renderCatTabs(); } renderEffects();
    $("#fxname").textContent = l.name + " · " + (p ? p.label : "");
  }
  for (const k of Object.keys(NUM)) $("#" + k).addEventListener("input", e => { const l = sel(); if (!l) return; const [mul, f] = NUM[k]; l.fx[k] = +e.target.value / mul; $("#o-" + k).value = f(l.fx[k]); if (k === "blur") { clearTimeout(regenTimer); regenTimer = setTimeout(() => { if (l.src) { l.analysis = analyze(l.src, l.fx.blur); l.version++; ui.dirty = true; } }, 80); } });
  $("#scale").addEventListener("input", e => { const l = sel(); if (!l) return; l.fx.scale = (ui.baseScale || 1) * e.target.value / 100; $("#o-scale").value = "×" + (e.target.value / 100).toFixed(2); });
  for (const [id, key] of SELS) $("#" + id).addEventListener("change", e => { const l = sel(); if (!l) return; l.fx[key] = +e.target.value; if (key === "accentType") l.fx.accentColor = ""; syncInspector(); });
  $("#tint").addEventListener("change", e => { const l = sel(); if (l) l.fx.tint = e.target.value; });
  for (const id of ["flatOnly", "accent", "accentInvert", "accentWithin"]) $("#" + id).addEventListener("change", e => { const l = sel(); if (l) { l.fx[id] = e.target.checked ? 1 : 0; syncInspector(); } });
  for (const b of $$("#zones [data-mask]")) b.addEventListener("click", () => { const l = sel(); if (!l) { toast("Sélectionnez d'abord un calque"); return; } l.fx.mask = +b.dataset.mask; if (l.fx.mask === 8 && !l.picks.length) setPicking(1); if (l.fx.mask === 4 && !l.maskImg) toast("Importez un masque (blanc = procédé) dans « Zone de la finition »"); syncInspector(); refreshLayerList(); });
  $("#invertChip").addEventListener("click", () => { const l = sel(); if (l) { l.fx.maskInvert = l.fx.maskInvert ? 0 : 1; syncInspector(); } });
  for (const b of $$("#accentZones [data-amask]")) b.addEventListener("click", () => { const l = sel(); if (!l) return; l.fx.accentMask = +b.dataset.amask; l.fx.accent = 1; if (l.fx.accentMask === 8 && !l.picks.length) setPicking(2); syncInspector(); });
  for (const [i, id] of ["wt", "wr", "wb", "wl"].entries()) $("#" + id).addEventListener("input", e => { const l = sel(); if (l) { l.win[i] = +e.target.value / 100; $("#o-" + id).value = e.target.value + "%"; } });
  $("#pickTol").addEventListener("input", e => { const l = sel(); if (l) { l.pickTol = e.target.value / 100; $("#o-pickTol").value = e.target.value + "%"; } });
  $("#pickbtn").addEventListener("click", () => setPicking(ui.picking ? 0 : 1));
  $("#pickclear").addEventListener("click", () => { const l = sel(); if (l) { l.picks = []; renderSwatches(); } });
  const HINT = "Survolez pour déplacer la lumière · glissez pour incliner · molette pour zoomer · déposez des images ici";
  function setPicking(on) { ui.picking = on; bench.classList.toggle("picking", !!on); $("#pickbtn").setAttribute("aria-pressed", String(!!on)); $("#hint").textContent = on ? "Cliquez sur la carte pour choisir une couleur (Maj + clic pour en ajouter, 4 max)" : HINT; }
  function renderSwatches() { const el = $("#pickswatches"); el.innerHTML = ""; const l = sel(); if (!l) return; for (const c of l.picks) { const s = document.createElement("span"); s.className = "swatch"; s.style.background = `rgb(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)})`; el.append(s); } }
  function pickAt(e) {
    const l = sel(); if (!l || !l.analysis) return; const rect = card.getBoundingClientRect(); const u = (e.clientX - rect.left) / rect.width, v = (e.clientY - rect.top) / rect.height;
    const ca = aspect(), la = l.w / l.h; const hw = l.scale * ca / 2, hh = hw / la; const px = (u - l.x) * ca, py = (v - l.y); const r = -l.rot * Math.PI / 180; const rx = px * Math.cos(r) - py * Math.sin(r), ry = px * Math.sin(r) + py * Math.cos(r);
    const lu = rx / (2 * hw) + 0.5, lv = ry / (2 * hh) + 0.5; if (lu < 0 || lu > 1 || lv < 0 || lv > 1) { toast("Cliquez à l'intérieur du calque sélectionné"); return; }
    const A = l.analysis; const ix = Math.min(A.w - 1, Math.floor(lu * A.w)), iy = Math.min(A.h - 1, Math.floor(lv * A.h)); const j = (iy * A.w + ix) * 4; const d = A.data; const col = [d[j] / 255, d[j+1] / 255, d[j+2] / 255];
    if (e.shiftKey && l.picks.length < 4) l.picks.push(col); else l.picks = [col];
    renderSwatches(); if (!e.shiftKey) setPicking(0);
  }
  $("#layerName").addEventListener("input", e => { const l = sel(); if (l) { l.name = e.target.value; refreshLayerList(); } });
  $("#layerVisible").addEventListener("change", e => { const l = sel(); if (l) { l.visible = e.target.checked; refreshLayerList(); } });
  $("#layerBlend").addEventListener("change", e => { const l = sel(); if (l) l.blend = e.target.value; });
  $("#layerOpacity").addEventListener("input", e => { const l = sel(); if (l) { l.opacity = e.target.value / 100; $("#o-layerOpacity").value = e.target.value + "%"; } });
  $("#layerX").addEventListener("input", e => { const l = sel(); if (l) { l.x = e.target.value / 100; $("#o-layerX").value = e.target.value + "%"; } });
  $("#layerY").addEventListener("input", e => { const l = sel(); if (l) { l.y = e.target.value / 100; $("#o-layerY").value = e.target.value + "%"; } });
  $("#layerScale").addEventListener("input", e => { const l = sel(); if (l) { l.scale = e.target.value / 100; $("#o-layerScale").value = e.target.value + "%"; } });
  $("#layerRot").addEventListener("input", e => { const l = sel(); if (l) { l.rot = +e.target.value; $("#o-layerRot").value = e.target.value + "°"; } });
  for (const b of $$("[data-fit]")) b.addEventListener("click", () => { const l = sel(); if (l) { fitLayer(l, b.dataset.fit); syncInspector(); } });
  $("#layerUp").addEventListener("click", () => { const l = sel(); if (l) moveLayer(selDoc(), l.id, 1); });
  $("#layerDown").addEventListener("click", () => { const l = sel(); if (l) moveLayer(selDoc(), l.id, -1); });
  $("#layerDup").addEventListener("click", () => { const l = sel(); if (l) duplicateLayer(selDoc(), l.id); });
  $("#layerDel").addEventListener("click", () => { const l = sel(); if (l) removeLayer(selDoc(), l.id); });
  const bindKind = (id, kind, key, parse, after) => $("#" + id).addEventListener("input", e => { const l = sel(); if (!l || l.kind !== kind) return; l[kind][key] = parse ? parse(e.target.value, e.target) : e.target.value; if (after) after(l); regenSoon(l); });
  bindKind("txtText", "text", "text"); bindKind("txtFont", "text", "font"); bindKind("txtWeight", "text", "weight"); bindKind("txtSize", "text", "size", v => +v, () => { $("#o-txtSize").value = $("#txtSize").value + "%"; }); bindKind("txtSpacing", "text", "spacing", v => +v, () => { $("#o-txtSpacing").value = $("#txtSpacing").value; });
  bindKind("txtColor", "text", "color"); bindKind("txtStroke", "text", "stroke"); bindKind("txtStrokeW", "text", "strokeW", v => +v, () => { $("#o-txtStrokeW").value = $("#txtStrokeW").value; }); bindKind("txtAlign", "text", "align"); bindKind("txtUpper", "text", "upper", (v, t) => t.checked); bindKind("txtShadow", "text", "shadow", (v, t) => t.checked);
  bindKind("frStyle", "frame", "style"); bindKind("frColor", "frame", "color"); bindKind("frPanel", "frame", "panel"); bindKind("frWidth", "frame", "width", v => +v, () => { $("#o-frWidth").value = $("#frWidth").value + "%"; }); bindKind("frPanelA", "frame", "panelA", v => v / 100, () => { $("#o-frPanelA").value = $("#frPanelA").value + "%"; });
  bindKind("bgType", "bg", "type"); bindKind("bgC1", "bg", "c1"); bindKind("bgC2", "bg", "c2"); bindKind("bgAngle", "bg", "angle", v => +v, () => { $("#o-bgAngle").value = $("#bgAngle").value + "°"; });
  bindKind("bdShape", "badge", "shape"); bindKind("bdText", "badge", "text"); bindKind("bdColor", "badge", "color"); bindKind("bdTextColor", "badge", "textColor");
  $("#intensity").addEventListener("input", e => { ui.intensity = e.target.value / 100; $("#o-intensity").value = e.target.value + "%"; });
  $("#tilt").addEventListener("input", e => { ui.tilt = +e.target.value; $("#o-tilt").value = e.target.value + "°"; });
  $("#quality").value = String(ui.quality); $("#quality").addEventListener("change", e => { ui.quality = +e.target.value; resize(); });
  $("#stock").addEventListener("change", e => { project.front.stock = project.back.stock = e.target.value; invalidateThumbs(); });
  $("#core").addEventListener("change", e => { project.print.core = e.target.value; applyCore(); });
  function applyCore() { card.style.setProperty("--core-color", CORE_COLORS[project.print.core] || "#26262b"); }
  function applyEdge() { card.classList.remove("edge-gold", "edge-silver", "edge-black", "edge-red"); if (project.edge) card.classList.add("edge-" + project.edge); }
  $("#edge").addEventListener("change", e => { project.edge = e.target.value; applyEdge(); });
  $("#coatKind").addEventListener("change", e => { project.coatKind = e.target.value; applyCoat(); });
  $("#coat").addEventListener("input", e => { $("#o-coat").value = e.target.value + "%"; applyCoat(); });
  function applyCoat() { const k = project.coatKind; const v = +$("#coat").value / 100; const f = k === "none" ? 0 : k === "matte" ? 0.15 : k === "satin" ? 0.5 : 1; project.front.coat = project.back.coat = v * f; }
  $("#marks").addEventListener("change", e => { ui.marks = e.target.checked; card.classList.toggle("show-marks", ui.marks); resize(); });

  /* ---- back of card ---- */
  function ensureBackLayer() { let l = project.back.layers.find(x => x.kind === "back"); if (!l) { l = newLayer("back", "Motif du dos"); applyPreset(l, "h-rainbow"); regen(l); project.back.layers.unshift(l); } return l; }
  function renderBacks() {
    const el = $("#backs"); el.innerHTML = ""; const ca = aspect();
    for (const [id, label] of BACK_STYLES) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(project.backStyle.style === id)); const c = backCanvas(id, project.backStyle.c1, project.backStyle.c2, project.backStyle.text, ca); const small = document.createElement("canvas"); small.width = 116; small.height = Math.round(116 / ca); small.getContext("2d").drawImage(c, 0, 0, small.width, small.height); const s = document.createElement("span"); s.textContent = label; b.append(small, s); b.addEventListener("click", () => { project.backStyle.style = id; const l = ensureBackLayer(); regen(l); renderBacks(); ui.selDoc = "back"; ui.selId = l.id; refreshLayerList(); syncInspector(); ui.dirty = true; }); el.append(b); }
  }
  for (const [id, key] of [["backC1", "c1"], ["backC2", "c2"], ["backText", "text"]]) $("#" + id).addEventListener("input", e => { project.backStyle[key] = e.target.value; const l = ensureBackLayer(); regenSoon(l); clearTimeout(ui.backsTimer); ui.backsTimer = setTimeout(renderBacks, 200); });
  $("#flipBtn").addEventListener("click", () => setMainView(ui.mainView === "back" ? "front" : "back"));
  $("#straight").addEventListener("click", () => { ui.auto = false; $("#auto").checked = false; interactEnd(true); });

  /* ---- views ---- */
  function setMainView(v) {
    const prev = ui.mainView; ui.mainView = v; for (const b of $$("[data-mainview]")) b.setAttribute("aria-pressed", String(b.dataset.mainview === v));
    $("#packScene").hidden = v !== "pack"; $("#dielineView").hidden = v !== "dieline"; $("#tiltRoot").hidden = v === "pack" || v === "dieline";
    for (const [id, on] of [["blk-protect", v === "protect"], ["blk-pack", v === "pack"], ["blk-dieline", v === "dieline"]]) $("#" + id).hidden = !on;
    flipEl.style.setProperty("--flip", v === "back" ? "180deg" : "0deg"); if ((prev === "back") !== (v === "back")) ui.flipping = performance.now() + 950;
    if (v === "back") { ensureBack(); ensureBackLayer(); ui.selDoc = "back"; if (!project.back.layers.find(l => l.id === ui.selId)) ui.selId = project.back.layers[project.back.layers.length - 1]?.id || null; }
    else if (ui.selDoc === "back") { ui.selDoc = "front"; ui.selId = project.front.layers[project.front.layers.length - 1]?.id || null; }
    applyProtect(v === "protect" ? project.protect.mode : "none");
    if (v === "pack") buildPackScene(); if (v === "dieline") renderDieline();
    resize(); refreshLayerList(); syncInspector(); ui.dirty = true;
  }
  for (const b of $$("[data-mainview]")) b.addEventListener("click", () => setMainView(b.dataset.mainview));

  /* ---- protection ---- */
  function renderProtectOpts() {
    const el = $("#protectOpts"); el.innerHTML = "";
    for (const p of PROTECTIONS) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(project.protect.mode === p.id)); const s = document.createElement("span"); s.textContent = p.name; const sm = document.createElement("small"); sm.textContent = p.sub; b.append(s, sm); b.addEventListener("click", () => { project.protect.mode = p.id; renderProtectOpts(); applyProtect(p.id); resize(); }); el.append(b); }
    const ref = $("#protectRef"); ref.innerHTML = ""; const t = document.createElement("table"); t.className = "ref"; const hr = document.createElement("tr"); for (const h of ["Protection", "Dimensions"]) { const th = document.createElement("th"); th.textContent = h; hr.append(th); } t.append(hr); for (const p of PROTECTIONS.slice(1)) { const tr = document.createElement("tr"); const a = document.createElement("td"); a.textContent = p.name; const b = document.createElement("td"); b.textContent = p.dims; tr.append(a, b); t.append(tr); } ref.append(t);
  }
  function applyProtect(mode) {
    const pr = project.protect; protect.dataset.mode = mode === "binder" ? "none" : mode; protect.classList.toggle("matte", pr.sleeveFinish === "matte"); protect.style.setProperty("--sleeve-tint", pr.sleeveTint);
    $("#slabLabelTitle").textContent = pr.title; $("#slabLabelGrade").textContent = pr.grade; $("#slabLabelMention").textContent = pr.mention; $("#slabLabelSub").textContent = fmt().game + " · " + fmtDims().w + " × " + fmtDims().h + " mm";
    const binder = $("#binder");
    if (mode === "binder") { binder.hidden = false; binder.style.setProperty("--binder-color", pr.binderColor); protect.hidden = true; binder.innerHTML = ""; const snap = snapshotDoc(project.front, 360); for (let i = 0; i < 9; i++) { const pk = document.createElement("div"); pk.className = "pocket" + (i === 4 ? " live" : ""); if (i === 4) pk.append(card); else { const im = document.createElement("img"); im.alt = ""; im.src = snap; pk.append(im); } binder.append(pk); } }
    else { binder.hidden = true; protect.hidden = false; if (card.parentElement !== protect) protect.append(card); }
  }
  for (const [id, key] of [["sleeveFinish", "sleeveFinish"], ["sleeveTint", "sleeveTint"], ["slabGrade", "grade"], ["slabMention", "mention"], ["slabTitle", "title"], ["binderColor", "binderColor"]]) for (const ev of ["input", "change"]) $("#" + id).addEventListener(ev, e => { project.protect[key] = e.target.value; if (ui.mainView === "protect") applyProtect(project.protect.mode); });

  /* ---- packaging ---- */
  function snapshotDoc(doc, px, pointer = [0.35, 0.7], tilt = [-0.18, 0.1], o = {}) { if (!T) return ""; const a = o.aspect || aspect(); thumbCanvas.width = px; thumbCanvas.height = Math.round(px / a); T.renderDoc(doc, { pointer, tilt, aspect: a, intensity: 1, seed: ui.seed, selectedId: null, view: 0, ...o }); return thumbCanvas.toDataURL("image/jpeg", 0.9); }
  function packDoc() {
    const p = project.pack; const ca = p.boosterW / p.boosterH; const art = project.front.layers.find(l => l.kind === "image" && l.visible && l.src)?.src || null;
    if (!ui.packLayer) ui.packLayer = newLayer("image", "Booster"); const l = ui.packLayer;
    setSrc(l, packCanvas({ title: p.title, sub: p.sub, cards: p.cards, c1: p.boxColor, c2: "#3a2f6b" }, art, ca)); l.scale = 1; l.x = 0.5; l.y = 0.5; applyPreset(l, p.finish); l.fx.mask = 0;
    return { id: "pack", layers: [l], stock: p.boxColor, coat: 0.5 };
  }
  function boxDims(packs) { if (packs >= 36) return [135, 122, 74]; if (packs >= 30) return [130, 120, 70]; if (packs >= 24) return [110, 128, 84]; if (packs >= 16) return [95, 110, 62]; return [85, 105, 75]; }
  function buildPackScene() {
    const obj = $("#packObj"); obj.innerHTML = ""; const p = project.pack; const kind = p.kind; const S = kind === "booster" ? 3.4 : kind === "shelf" ? 2.2 : 2.4;
    if (PK) { loseGL(PK); PK = null; } ui.packCanvas = null;
    ui.packDocCache = packDoc(); const ba = p.boosterW / p.boosterH; const packImg = snapshotDoc(ui.packDocCache, 420, [0.4, 0.75], [-0.2, 0.12], { aspect: ba });
    const mkBooster = (live) => {
      const b = document.createElement("div"); b.className = "booster"; b.style.setProperty("--bw", Math.round(p.boosterW * S) + "px"); b.style.setProperty("--bh", Math.round(p.boosterH * S) + "px");
      const pouch = document.createElement("div"); pouch.className = "pouch";
      let ok = false;
      if (live && R) { const c = document.createElement("canvas"); pouch.append(c); try { PK = makeGL(c); ok = !!PK; } catch (e) { PK = null; } if (ok) ui.packCanvas = c; else pouch.innerHTML = ""; }
      if (!ok) { const im = document.createElement("img"); im.alt = ""; im.src = packImg; pouch.append(im); }
      const crT = document.createElement("div"); crT.className = "crimp top"; const crB = document.createElement("div"); crB.className = "crimp bottom"; const seam = document.createElement("div"); seam.className = "seam"; const gloss = document.createElement("div"); gloss.className = "gloss";
      b.append(pouch, crT, crB, seam, gloss); return b;
    };
    const mkBox = (dims, label, sub) => {
      const [w, h, d] = dims.map(v => Math.round(v * S)); const box = document.createElement("div"); box.className = "box3d"; box.style.setProperty("--bw", w + "px"); box.style.setProperty("--bh", h + "px"); box.style.setProperty("--bd", d + "px"); box.style.setProperty("--box-color", p.boxColor);
      for (const [name, t] of Object.entries({ front: "art", back: "art", left: "side", right: "side", top: "side", bottom: "plain" })) { const f = document.createElement("div"); f.className = "f " + name; if (t === "art") { const im = document.createElement("img"); im.alt = ""; im.src = packImg; f.append(im); if (name === "front") { const band = document.createElement("div"); band.className = "band"; band.textContent = label; f.append(band); } } else if (t === "side") { f.classList.add("side-art"); const wrap = document.createElement("div"); const sp = document.createElement("span"); sp.textContent = p.title; const sm = document.createElement("small"); sm.textContent = sub; wrap.append(sp, sm); f.append(wrap); } box.append(f); }
      return box;
    };
    const cap = $("#packCaption");
    if (kind === "booster") { obj.append(mkBooster(true)); cap.textContent = `Booster · ${p.boosterW} × ${p.boosterH} mm · ${p.cards} cartes · rendu holographique en direct`; }
    else if (kind === "display") { const dims = boxDims(p.packs); obj.append(mkBox(dims, `${p.packs} BOOSTERS`, `${p.packs} boosters × ${p.cards} cartes`)); cap.textContent = `Display ${p.packs} boosters · ≈ ${dims[0]} × ${dims[1]} × ${dims[2]} mm · ${p.packs * p.cards} cartes`; }
    else if (kind === "etb") { obj.append(mkBox([191, 165, 89], "COFFRET", "boosters, pochettes, dés et accessoires")); cap.textContent = "Coffret · ≈ 191 × 165 × 89 mm"; }
    else if (kind === "deckbox") { obj.append(mkBox([72, 95, 45], "DECK", "60 à 100 cartes en pochettes")); cap.textContent = "Deck box · ≈ 72 × 95 × 45 mm"; }
    else { const shelf = document.createElement("div"); shelf.className = "packshelf"; const dims = boxDims(p.packs); shelf.append(mkBox(dims, `${p.packs} BOOSTERS`, `${p.packs} × ${p.cards} cartes`), mkBooster(true)); obj.append(shelf); cap.textContent = "Vitrine · display et booster"; }
    obj.style.setProperty("--rx", "-24deg"); obj.style.setProperty("--ry", "-8deg"); ui.packDirty = true; ui.dirty = true;
  }
  function renderPackOpts() {
    const el = $("#packOpts"); el.innerHTML = "";
    for (const o of PACK_OPTS) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(project.pack.kind === o.id)); const s = document.createElement("span"); s.textContent = o.name; const sm = document.createElement("small"); sm.textContent = o.sub; b.append(s, sm); b.addEventListener("click", () => { project.pack.kind = o.id; renderPackOpts(); buildPackScene(); }); el.append(b); }
    const ref = $("#packRef"); ref.innerHTML = ""; const t = document.createElement("table"); t.className = "ref"; const hr = document.createElement("tr"); for (const h of ["Jeu", "Cartes / booster", "Boosters / display"]) { const th = document.createElement("th"); th.textContent = h; hr.append(th); } t.append(hr);
    for (const f of FORMATS.filter(f => f.group !== "other")) { const tr = document.createElement("tr"); for (const [v, mono] of [[f.game, 0], [f.pack.cards, 1], [f.pack.packs, 1]]) { const td = document.createElement("td"); if (mono) td.className = "mono"; td.textContent = v; tr.append(td); } t.append(tr); } ref.append(t);
  }
  for (const [id, key, num] of [["packTitle", "title", 0], ["packSub", "sub", 0], ["packsPerBox", "packs", 1], ["cardsPerPack", "cards", 1], ["boxColor", "boxColor", 0], ["packFinish", "finish", 0]]) $("#" + id).addEventListener("change", e => { project.pack[key] = num ? Math.max(1, +e.target.value || 1) : e.target.value; if (ui.mainView === "pack") buildPackScene(); if (ui.mainView === "dieline") renderDieline(); });
  (() => { let dragging = false, lx = 0, ly = 0, rx = -24, ry = -8; const sc = $("#packScene"); sc.addEventListener("pointerdown", e => { dragging = true; lx = e.clientX; ly = e.clientY; sc.setPointerCapture(e.pointerId); }); sc.addEventListener("pointermove", e => { if (dragging) { rx += (e.clientX - lx) * 0.4; ry -= (e.clientY - ly) * 0.3; ry = clamp(ry, -60, 60); lx = e.clientX; ly = e.clientY; const o = $("#packObj"); o.style.setProperty("--rx", rx + "deg"); o.style.setProperty("--ry", ry + "deg"); } const r = sc.getBoundingClientRect(); ui.packPointer = [clamp((e.clientX - r.left) / r.width, 0, 1), 1 - clamp((e.clientY - r.top) / r.height, 0, 1)]; ui.packDirty = true; }); sc.addEventListener("pointerup", () => dragging = false); sc.addEventListener("pointercancel", () => dragging = false); })();

  /* ---- dielines ---- */
  const DIELINE_OPTS = [["card", "Carte", "coupe, fond perdu, sécurité"], ["booster", "Booster", "sachet à plat"], ["display", "Display", "boîte à rabats"], ["etb", "Coffret", "191 × 165 × 89 mm"], ["deckbox", "Deck box", "72 × 95 × 45 mm"]];
  const boxOf = k => k === "display" ? [project.dieline.boxW, project.dieline.boxH, project.dieline.boxD] : k === "etb" ? [191, 165, 89] : [72, 95, 45];
  function snapshotArtwork(doc, px, bleed) { if (!T) return null; const d = fmtDims(); const c = renderDocMM(doc, d.w, d.h, bleed, px / ((d.w + 2 * bleed) / 25.4), { view: 0 }); return c ? c.toDataURL("image/jpeg", 0.85) : null; }
  function currentDieline(withArt) {
    const d = fmtDims(); const pr = project.print; const k = project.dieline.kind; const p = project.pack;
    const hasBack = project.back.layers.some(l => l.visible && l.src);
    if (k === "card") return cardDieline(d.w, d.h, d.r, pr.bleed, pr.safe, { image: withArt ? snapshotArtwork(project.front, 300, pr.bleed) : null });
    const art = withArt ? snapshotDoc(project.front, 300, [0.5, 0.5], [0, 0]) : null;
    if (k === "booster") return boosterDieline(p.boosterW, p.boosterH, p.crimp, p.fin, pr.bleed, pr.safe, { image: art, back: withArt && hasBack ? snapshotDoc(project.back, 300, [0.5, 0.5], [0, 0]) : null });
    const dims = boxOf(k);
    return tuckBoxDieline(dims[0], dims[1], dims[2], pr.bleed, pr.safe, { image: art, sideColor: withArt ? p.boxColor : null, title: withArt ? p.title : null });
  }
  function renderDieline() {
    const view = $("#dielineView"); const r = currentDieline(project.dieline.showArt); view.innerHTML = r.svg; const svg = view.querySelector("svg"); if (svg) { svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.width = "100%"; }
    const cap = document.createElement("p"); cap.className = "note"; cap.style.marginTop = "10px"; cap.textContent = `Plan ${r.wmm.toFixed(0)} × ${r.hmm.toFixed(0)} mm à l'échelle 1:1 dans le SVG exporté · fond perdu ${project.print.bleed} mm · sécurité ${project.print.safe} mm`; view.append(cap);
    $("#dlBooster").hidden = project.dieline.kind !== "booster"; $("#dlBox").hidden = project.dieline.kind !== "display";
  }
  function renderDielineOpts() { const el = $("#dielineOpts"); el.innerHTML = ""; for (const [id, name, sub] of DIELINE_OPTS) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(project.dieline.kind === id)); const s = document.createElement("span"); s.textContent = name; const sm = document.createElement("small"); sm.textContent = sub; b.append(s, sm); b.addEventListener("click", () => { project.dieline.kind = id; renderDielineOpts(); if (ui.mainView !== "dieline") setMainView("dieline"); else renderDieline(); }); el.append(b); } }
  for (const [id, obj, key] of [["bleed", "print", "bleed"], ["safe", "print", "safe"], ["dpi", "print", "dpi"], ["boosterW", "pack", "boosterW"], ["boosterH", "pack", "boosterH"], ["crimp", "pack", "crimp"], ["fin", "pack", "fin"], ["boxW", "dieline", "boxW"], ["boxH", "dieline", "boxH"], ["boxD", "dieline", "boxD"]]) $("#" + id).addEventListener("change", e => { const v = +e.target.value; if (!isFinite(v)) return; project[obj][key] = v; if (ui.mainView === "dieline") renderDieline(); resize(); if (ui.mainView === "pack" && obj === "pack") buildPackScene(); });
  $("#dlArt").addEventListener("change", e => { project.dieline.showArt = e.target.checked; if (ui.mainView === "dieline") renderDieline(); });
  $("#boxAuto").addEventListener("click", () => { const [w, h, d] = boxDims(project.pack.packs); project.dieline.boxW = w; project.dieline.boxH = h; project.dieline.boxD = d; $("#boxW").value = w; $("#boxH").value = h; $("#boxD").value = d; if (ui.mainView === "dieline") renderDieline(); });
  $("#dlExportSvg").addEventListener("click", () => { const r = currentDieline(false); saveFile(`plan-de-decoupe_${project.dieline.kind}.svg`, new Blob([r.svg], { type: "image/svg+xml" })); });
  $("#dlExportPng").addEventListener("click", async () => {
    if (!T) { toast("WebGL indisponible"); return; }
    const d = fmtDims(), pr = project.print, p = project.pack, k = project.dieline.kind; let c;
    if (k === "card") c = artworkCanvas(project.front, d.w, d.h, pr.bleed, pr.dpi);
    else { const front = artworkCanvas(project.front, d.w, d.h, 0, 150); const back = project.back.layers.some(l => l.visible && l.src) ? artworkCanvas(project.back, d.w, d.h, 0, 150) : null;
      if (k === "booster") c = flatBoosterCanvas(front, back, p.boosterW, p.boosterH, p.crimp, p.fin, pr.bleed, 150, p.boxColor); else { const dims = boxOf(k); c = flatBoxCanvas(front, dims[0], dims[1], dims[2], pr.bleed, 150, p.boxColor, p.title); } }
    if (c) saveFile(`maquette-a-plat_${k}.png`, await toBlob(c));
  });

  /* ---- reference ---- */
  function renderRef() {
    const rf = $("#refFormats"); const t = document.createElement("table"); t.className = "ref"; const hr = document.createElement("tr"); for (const h of ["Jeu", "Format", "Rayon", "Boosters"]) { const th = document.createElement("th"); th.textContent = h; hr.append(th); } t.append(hr);
    for (const f of FORMATS) { const tr = document.createElement("tr"); for (const [v, mono] of [[f.game, 0], [`${f.w} × ${f.h} mm`, 1], [`≈ ${f.r} mm`, 1], [f.group === "other" ? "—" : `${f.pack.cards} c. · ${f.pack.packs} b.`, 1]]) { const td = document.createElement("td"); if (mono) td.className = "mono"; td.textContent = v; tr.append(td); } t.append(tr); }
    rf.innerHTML = ""; rf.append(t);
    const gl = $("#refFinishes"); gl.innerHTML = "";
    for (const g of FINISH_GLOSSARY) { const box = document.createElement("div"); box.className = "g"; const b = document.createElement("b"); b.textContent = g.game; box.append(b); for (const [name, desc, preset] of g.items) { const p = document.createElement("p"); const nb = document.createElement("b"); nb.textContent = name + " · "; nb.style.display = "inline"; nb.style.fontSize = "inherit"; p.append(nb, desc); box.append(p); const tags = document.createElement("div"); tags.className = "tags"; const bt = document.createElement("button"); bt.type = "button"; bt.className = "chip"; bt.textContent = "Appliquer « " + (PRESET_BY_ID[preset]?.label || preset) + " »"; bt.addEventListener("click", () => { const l = sel(); if (!l) { toast("Sélectionnez d'abord un calque"); return; } applyPreset(l, preset); syncInspector(); refreshLayerList(); }); tags.append(bt); box.append(tags); } gl.append(box); }
    const src = $("#refSources"); src.innerHTML = ""; const h = document.createElement("h3"); h.textContent = "Sources consultées"; src.append(h); const ul = document.createElement("ul"); ul.style.margin = "6px 0 0"; ul.style.paddingLeft = "18px"; ul.style.fontSize = "12px"; for (const [t2, u] of SOURCES) { const li = document.createElement("li"); const a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; a.textContent = t2; li.append(a); ul.append(li); } src.append(ul);
    const n = document.createElement("p"); n.className = "note"; n.style.marginTop = "8px"; n.textContent = "Les valeurs marquées ≈ sont approximatives ; vérifiez auprès de l'imprimeur avant production."; src.append(n);
  }

  /* ---- zoom and pan ---- */
  function applyZoom() { stagewrap.style.transform = `translate(${ui.panX}px, ${ui.panY}px) scale(${ui.zoom})`; $("#zoomOutp").value = Math.round(ui.zoom * 100) + "%"; }
  function zoomTo(z, cx, cy) { z = clamp(z, 0.4, 5); if (cx !== undefined) { const k = z / ui.zoom; ui.panX = cx - (cx - ui.panX) * k; ui.panY = cy - (cy - ui.panY) * k; } ui.zoom = z; applyZoom(); }
  bench.addEventListener("wheel", e => { e.preventDefault(); const r = bench.getBoundingClientRect(); const cx = e.clientX - r.left - r.width / 2, cy = e.clientY - r.top - r.height / 2; zoomTo(ui.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), cx, cy); }, { passive: false });
  $("#zoomIn").addEventListener("click", () => zoomTo(ui.zoom * 1.25, 0, 0)); $("#zoomOut").addEventListener("click", () => zoomTo(ui.zoom / 1.25, 0, 0)); $("#zoomFit").addEventListener("click", () => { ui.zoom = 1; ui.panX = ui.panY = 0; applyZoom(); });
  $("#panMode").addEventListener("click", () => { ui.panMode = !ui.panMode; $("#panMode").setAttribute("aria-pressed", String(ui.panMode)); bench.classList.toggle("panning", ui.panMode); });
  document.addEventListener("keydown", e => { if (e.code === "Space" && !/input|textarea|select|button/i.test(document.activeElement?.tagName || "")) { ui.space = true; bench.classList.add("panning"); e.preventDefault(); } });
  document.addEventListener("keyup", e => { if (e.code === "Space") { ui.space = false; bench.classList.toggle("panning", ui.panMode); } });
  const pointers = new Map(); let panDrag = null, pinch = null;
  bench.addEventListener("pointerdown", e => {
    if (ui.mainView === "pack" || ui.mainView === "dieline") return;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: ui.zoom }; panDrag = null; if (ui.drag) { ui.drag = null; interactEnd(); } return; }
    if (ui.picking) { pickAt(e); return; }
    if (ui.panMode || ui.space || e.button === 1 || !card.contains(e.target)) { panDrag = { x: e.clientX, y: e.clientY, px: ui.panX, py: ui.panY }; bench.setPointerCapture(e.pointerId); return; }
    ui.drag = true; bench.setPointerCapture(e.pointerId); interact(e, true);
  });
  bench.addEventListener("pointermove", e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomTo(pinch.z * d / pinch.d, 0, 0); return; }
    if (panDrag) { ui.panX = panDrag.px + (e.clientX - panDrag.x); ui.panY = panDrag.py + (e.clientY - panDrag.y); applyZoom(); return; }
    if (ui.mainView === "pack" || ui.mainView === "dieline") return;
    if (ui.drag || card.contains(e.target)) interact(e, !!ui.drag); else if (interacting) interactEnd();
  });
  const endPtr = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; panDrag = null; if (ui.drag) { ui.drag = null; interactEnd(); } else if (e.pointerType !== "mouse" && interacting) interactEnd(); };
  bench.addEventListener("pointerup", endPtr); bench.addEventListener("pointercancel", endPtr);
  bench.addEventListener("pointerleave", () => { if (!ui.drag && !panDrag) interactEnd(); });

  /* ---- springs and render loop ---- */
  class Spring { constructor(v, k, d) { this.v = { ...v }; this.last = { ...v }; this.target = { ...v }; this.stiffness = k; this.damping = d; } set(t) { Object.assign(this.target, t); } tick(dt) { for (const k in this.v) { const delta = this.target[k] - this.v[k]; const vel = (this.v[k] - this.last[k]) / (dt || 1); const d = (vel + (this.stiffness * delta - this.damping * vel)) * dt; this.last[k] = this.v[k]; if (Math.abs(d) < 0.0005 && Math.abs(delta) < 0.0005) { this.v[k] = this.target[k]; } else this.v[k] += d; } } settled() { for (const k in this.v) if (this.v[k] !== this.target[k]) return false; return true; } }
  const sRotate = new Spring({ x: 0, y: 0 }, 0.066, 0.25), sPointer = new Spring({ x: 50, y: 50, o: 0 }, 0.066, 0.25);
  const setSprings = (k, d) => { for (const s of [sRotate, sPointer]) { s.stiffness = k; s.damping = d; } };
  let interacting = false, idle = true, idleTimer = null, lastT = performance.now(), showcaseR = 0;
  function interact(e, tilt) {
    interacting = true; idle = false; clearTimeout(idleTimer); const rect = card.getBoundingClientRect();
    const px = clamp(round((100 / rect.width) * (e.clientX - rect.left)), -40, 140), py = clamp(round((100 / rect.height) * (e.clientY - rect.top)), -40, 140);
    setSprings(0.066, 0.25); sPointer.set({ x: clamp(px), y: clamp(py), o: 1 });
    if (tilt) sRotate.set({ x: round(((clamp(px) - 50) / 50) * ui.tilt), y: round(-((clamp(py) - 50) / 50) * ui.tilt) });
  }
  function interactEnd(hard) { interacting = false; setSprings(hard ? 0.09 : 0.045, hard ? 0.35 : 0.32); sRotate.set({ x: 0, y: 0 }); sPointer.set({ x: 50, y: 50, o: 0 }); clearTimeout(idleTimer); idleTimer = setTimeout(() => { idle = true; }, 2500); }
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function showcase() { if (!ui.auto || !idle || reduceMotion) return; showcaseR += 0.012; setSprings(0.02, 0.5); sPointer.set({ x: 50 + Math.sin(showcaseR) * 42, y: 50 + Math.cos(showcaseR * 0.9) * 38, o: 0.95 }); }
  $("#auto").addEventListener("change", e => { ui.auto = e.target.checked; if (!ui.auto && !interacting) interactEnd(); });
  for (const b of $$("[data-view]")) b.addEventListener("click", () => { ui.view = +b.dataset.view; for (const o of $$("[data-view]")) o.setAttribute("aria-pressed", String(o === b)); });
  function frame(now) {
    const dt = Math.min(3, (now - lastT) * 60 / 1000); lastT = now; showcase(); sRotate.tick(dt); sPointer.tick(dt);
    const r = sRotate.v, p = sPointer.v; tiltEl.style.setProperty("--rotate-x", r.x.toFixed(3) + "deg"); tiltEl.style.setProperty("--rotate-y", r.y.toFixed(3) + "deg");
    const o = { pointer: [p.x / 100, 1 - p.y / 100], tilt: [r.x * Math.PI / 180, -r.y * Math.PI / 180], aspect: aspect(), intensity: ui.intensity * (0.35 + 0.65 * p.o), seed: ui.seed, selectedId: ui.selId, view: ui.view };
    const moving = interacting || (ui.auto && idle && !reduceMotion) || now < ui.flipping || ui.dirty || !sRotate.settled() || !sPointer.settled();
    if (R && ui.mainView !== "pack" && ui.mainView !== "dieline" && moving) {
      ui.dirty = false; const back = ui.mainView === "back"; const both = now < ui.flipping; if (both) ensureBack(); resize();
      if (!back || both) R.renderDoc(project.front, { ...o, selectedId: ui.selDoc === "front" ? ui.selId : null });
      if (back || both) { const g = ensureBack(); if (g) g.renderDoc(project.back, { ...o, tilt: [-o.tilt[0], o.tilt[1]], pointer: [1 - o.pointer[0], o.pointer[1]], selectedId: ui.selDoc === "back" ? ui.selId : null }); }
    }
    if (PK && ui.mainView === "pack" && ui.packCanvas && ui.packDocCache && (ui.packDirty || ui.auto)) { ui.packDirty = false; const c = ui.packCanvas; const dpr = Math.min((window.devicePixelRatio || 1) * ui.quality, 3); const w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr)); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } const pp = ui.packPointer || [0.4, 0.7]; PK.renderDoc(ui.packDocCache, { pointer: pp, tilt: [(pp[0] - 0.5) * 0.5, (pp[1] - 0.5) * 0.4], aspect: project.pack.boosterW / project.pack.boosterH, intensity: 1, seed: ui.seed, selectedId: null, view: 0 }); }
    requestAnimationFrame(frame);
  }

  /* ---- capture, export, project ---- */
  let toastTimer = null; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600); }
  async function saveFile(name, data) {
    if (window.claude && typeof window.claude.use === "function") { const dl = await window.claude.use("downloads").catch(() => null); if (dl) { try { await dl.save({ filename: name, data }); toast("Enregistré : " + name); } catch (e) { if (!e || e.code !== "declined") toast("Enregistrement indisponible ici"); } return; } }
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); const a = document.createElement("a"); a.href = url; a.download = name; document.body.append(a); try { a.click(); } catch (e) {} a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  $("#capture").addEventListener("click", async () => { if (!R) return; const src = ui.mainView === "back" ? canvasBack : canvas; const url = src.toDataURL("image/png"); $("#captureImg").src = url; $("#captureBox").hidden = false; const blob = await toBlob(src); if (blob) saveFile("holo-card-" + (ui.mainView === "back" ? "verso" : "recto") + ".png", blob); });
  $("#captureClose").addEventListener("click", () => { $("#captureBox").hidden = true; });
  function ensureZip() { if (typeof JSZip !== "undefined") return Promise.resolve(true); const urls = ["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js", "https://unpkg.com/jszip@3.10.1/dist/jszip.min.js"]; return urls.reduce((pr, u) => pr.then(ok => ok || new Promise(res => { const sc = document.createElement("script"); sc.src = u; sc.onload = () => res(typeof JSZip !== "undefined"); sc.onerror = () => res(false); document.head.append(sc); })), Promise.resolve(false)); }
  $("#exportPrint").addEventListener("click", () => ensureZip().then(ok => { if (!ok) { toast("Bibliothèque zip inaccessible (connexion requise)"); return; } return exportPrintFiles(); }).catch(err => { console.error(err); toast("Export impossible : " + (err && err.message || err)); }));
  function serializeLayer(l) { const o = { id: l.id, kind: l.kind, name: l.name, x: l.x, y: l.y, scale: l.scale, rot: l.rot, opacity: l.opacity, blend: l.blend, visible: l.visible, fx: l.fx, picks: l.picks, pickTol: l.pickTol, win: l.win, presetId: l.presetId, text: l.text, frame: l.frame, bg: l.bg, badge: l.badge }; if (l.kind === "image" && l.src) { const w = Math.min(1600, l.w); const [c, x] = cv(w, Math.round(w * l.h / l.w)); x.drawImage(l.src, 0, 0, c.width, c.height); o.src = c.toDataURL("image/png"); } return o; }
  $("#saveProject").addEventListener("click", () => { const data = { version: 2, formatId: project.formatId, custom: project.custom, edge: project.edge, coatKind: project.coatKind, coat: +$("#coat").value, print: project.print, protect: project.protect, pack: project.pack, dieline: project.dieline, backStyle: project.backStyle, front: { stock: project.front.stock, layers: project.front.layers.map(serializeLayer) }, back: { stock: project.back.stock, layers: project.back.layers.map(serializeLayer) } }; saveFile("holo-card-projet.json", new Blob([JSON.stringify(data)], { type: "application/json" })); });
  $("#loadProject").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { loadProjectData(JSON.parse(rd.result)); toast("Projet ouvert"); } catch (err) { console.error(err); toast("Fichier de projet illisible"); } }; rd.readAsText(f); e.target.value = ""; });
  function loadProjectData(d) {
    project.formatId = FORMATS.some(f => f.id === d.formatId) ? d.formatId : "pokemon"; Object.assign(project.custom, d.custom || {}); project.edge = d.edge || ""; project.coatKind = d.coatKind || "gloss"; $("#coat").value = d.coat ?? 60; Object.assign(project.print, d.print || {}); Object.assign(project.protect, d.protect || {}); Object.assign(project.pack, d.pack || {}); Object.assign(project.dieline, d.dieline || {}); Object.assign(project.backStyle, d.backStyle || {});
    for (const id of ["front", "back"]) { for (const l of project[id].layers) for (const g of [R, RB, T, PK]) if (g) g.drop(l.id); project[id].layers = []; project[id].stock = (d[id] && d[id].stock) || project[id].stock;
      for (const s of (d[id] && d[id].layers) || []) { const l = newLayer(s.kind, s.name); Object.assign(l, { x: s.x, y: s.y, scale: s.scale, rot: s.rot, opacity: s.opacity, blend: s.blend, visible: s.visible, fx: { ...base, ...s.fx }, picks: s.picks || [], pickTol: s.pickTol ?? 0.22, win: s.win || l.win, presetId: PRESET_BY_ID[s.presetId] ? s.presetId : "i-none", text: { ...l.text, ...s.text }, frame: { ...l.frame, ...s.frame }, bg: { ...l.bg, ...s.bg }, badge: { ...l.badge, ...s.badge } }); project[id].layers.push(l);
        if (s.kind === "image" && s.src) { const im = new Image(); im.onload = () => { setSrc(l, im); refreshLayerList(); invalidateThumbs(); ui.dirty = true; }; im.src = s.src; } else regen(l); } }
    $("#stock").value = project.front.stock; $("#edge").value = project.edge; $("#coatKind").value = project.coatKind; $("#core").value = project.print.core; $("#bleed").value = project.print.bleed; $("#safe").value = project.print.safe; $("#dpi").value = project.print.dpi;
    $("#packTitle").value = project.pack.title; $("#packSub").value = project.pack.sub; $("#packsPerBox").value = project.pack.packs; $("#cardsPerPack").value = project.pack.cards; $("#boxColor").value = project.pack.boxColor; $("#packFinish").value = PRESET_BY_ID[project.pack.finish] ? project.pack.finish : "h-oil"; $("#boosterW").value = project.pack.boosterW; $("#boosterH").value = project.pack.boosterH; $("#crimp").value = project.pack.crimp; $("#fin").value = project.pack.fin; $("#boxW").value = project.dieline.boxW; $("#boxH").value = project.dieline.boxH; $("#boxD").value = project.dieline.boxD; $("#dlArt").checked = !!project.dieline.showArt;
    $("#backC1").value = project.backStyle.c1; $("#backC2").value = project.backStyle.c2; $("#backText").value = project.backStyle.text || "";
    applyCoat(); applyCore(); applyEdge();
    ui.selDoc = "front"; ui.selId = project.front.layers[project.front.layers.length - 1]?.id || null; applyFormat(); renderFormats(); renderBacks(); renderProtectOpts(); renderPackOpts(); renderDielineOpts(); setMainView("front");
  }

  /* ---- boot ---- */
  const patSel = $("#pattern"); for (const [k, v] of Object.entries(P)) { const o = document.createElement("option"); o.value = v; o.textContent = PATTERN_LABELS[k]; patSel.append(o); }
  const palSel = $("#palette"); PALETTES.forEach((n, i) => { const o = document.createElement("option"); o.value = i; o.textContent = n; palSel.append(o); });
  const tintSel = $("#tint"); for (const [k, lab] of Object.entries(TINT_LABELS)) { const o = document.createElement("option"); o.value = k; o.textContent = lab; tintSel.append(o); }
  const accSel = $("#accentType"); for (const a of ACCENTS) { const o = document.createElement("option"); o.value = a.type; o.textContent = a.label; accSel.append(o); }
  renderFormats(); renderCatTabs(); renderRecipes(); renderProtectOpts(); renderPackOpts(); renderDielineOpts(); renderRef(); renderBacks();
  $("#fmtFilter").addEventListener("input", renderFormats);
  (function buildDefaultProject() {
    const art = newLayer("image", "Illustration"); setSrc(art, makeFox()); fitLayer(art, "cover"); applyPreset(art, "h-etched"); project.front.layers.push(art);
    ensureBackLayer();
    ui.selDoc = "front"; ui.selId = art.id; ui.baseScale = PRESET_BY_ID["h-etched"].scale;
  })();
  applyCoat(); applyCore(); applyEdge(); applyFormat(); refreshLayerList(); syncInspector(); applyZoom();
  $("#badge").textContent = `${PRESETS.length} procédés · ${FORMATS.length} formats`;
  requestAnimationFrame(frame);
  if (document.fonts && document.fonts.load) Promise.all(["700 40px Unbounded", "800 40px Cinzel", "700 40px Manrope"].map(f => document.fonts.load(f).catch(() => null))).then(() => { for (const doc of [project.front, project.back]) for (const l of doc.layers) if (l.kind === "text" || l.kind === "badge" || l.kind === "back") regen(l); renderBacks(); ui.dirty = true; });
  window.HoloLab = { project, ui, PRESETS, FORMATS, sel, applyPreset, setMainView, addImageLayer, snapshotDoc, exportPrintFiles, currentDieline, selectFormat };
