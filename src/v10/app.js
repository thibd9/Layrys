  /* ================= Application (Prisme: light print studio) ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const round = (v, p = 3) => parseFloat(v.toFixed(p));
  const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
  const uid = () => Math.random().toString(36).slice(2, 9);
  const FX_KEYS = Object.keys(base);
  const presetFx = p => { const o = {}; for (const k of FX_KEYS) o[k] = p[k]; return o; };
  const MASK_LABEL = { 0: "partout", 1: "intérieur", 2: "bordure", 4: "zone peinte", 5: "clairs", 6: "sombres", 7: "fond", 8: "une couleur", 9: "sujet", 10: "contours", 11: "peu saturé", 12: "couleurs vives", 13: "motif" };
  const KIND_LABEL = { image: "Image", text: "Texte", frame: "Cadre", bg: "Fond", badge: "Badge", back: "Dos" };
  const CORE_COLORS = { "black core": "#26262b", "blue core": "#2a3a7a", "white core": "#eceae4" };
  const NUANCIER = [["pick", "Sélection"], ["holo", "Holo"], ["foil", "Métaux"], ["varnish", "Vernis"], ["emboss", "Textures"], ["ink", "Encres"], ["combo", "Combinaisons"]];
  const PICKS = ["h-rainbow", "f-gold", "h-etched", "v-3d", "e-image", "i-silver"];
  const RECIPES = [
    ["Traits dorés", "Dorure à chaud sur les contours du dessin", { preset: "f-gold", mask: 10, thr: 0.4 }],
    ["Traits argentés", "Dorure argent sur les contours", { preset: "f-silver", mask: 10, thr: 0.4 }],
    ["Bordure dorée", "Dorure sur la bordure, illustration intacte", { preset: "f-gold", mask: 2 }],
    ["Holo sur l'illustration", "Film holographique à l'intérieur, bordure intacte", { preset: "h-rainbow", mask: 1 }],
    ["Fond holo + traits dorés", "Holo cosmos sur le fond, dorure sur les contours", { preset: "h-cosmic", mask: 7, accent: [0, 10] }],
    ["Fond gravé, sujet mat", "Holo gravé lignes derrière le personnage", { preset: "h-etched", mask: 7 }],
    ["Sujet holo, fond mat", "Holo arc-en-ciel sur le personnage seulement", { preset: "h-rainbow", mask: 9 }],
    ["Vernis 3D sur le sujet", "Vernis UV épais sur le personnage", { preset: "v-3d", mask: 9 }],
    ["Traits embossés", "Microgravure des contours", { preset: "e-contours", mask: 10, thr: 0.4 }],
    ["Encre or sur les clairs", "Encre métallique or dans les zones claires", { preset: "i-gold", mask: 5 }],
    ["Dorure sur les couleurs vives", "Dorure or sur les couleurs saturées", { preset: "f-gold", mask: 12 }],
    ["Bordure argent + holo", "Holo arc-en-ciel à l'intérieur, argent sur la bordure", { preset: "h-rainbow", mask: 1, accent: [1, 2] }],
  ];
  const SUPPORTS = [
    { id: "booster", kind: "scene", mode: "booster", name: "Booster", sub: "Emballage", ico: "booster", variants: [["metal", "Film métallisé"], ["papier", "Papier"]] },
    { id: "single", kind: "scene", mode: "card", name: "Carte seule", sub: "Sur fond sombre", ico: "sleeve", variants: [["sombre", "Fond sombre"]] },
    { id: "fan", kind: "scene", mode: "fan", name: "Éventail", sub: "Plusieurs cartes", ico: "deck", variants: [["3", "3 cartes"], ["5", "5 cartes"]] },
    { id: "stack", kind: "scene", mode: "stack", name: "Pile de cartes", sub: "Épaisseur 0,33 mm", ico: "deck", variants: [["blanc", "Tranche blanche"], ["noir", "Tranche noire"]] },
    { id: "frame", kind: "scene", mode: "frame", name: "Carte encadrée", sub: "Au mur", ico: "hard", variants: [["noir", "Cadre noir"], ["bois", "Cadre bois"]] },
    { id: "table", kind: "scene", mode: "table", name: "Sur la table", sub: "Posée, en perspective", ico: "sleeve", variants: [["bois", "Table en bois"], ["ardoise", "Ardoise"]] },
    { id: "display", kind: "scene", mode: "display", name: "Display", sub: "Présentoir", ico: "box", variants: [["24", "24 boosters"], ["12", "12 boosters"]] },
    { id: "sleeve", kind: "scene", mode: "sleeve", name: "Pochette", sub: "Protection souple", ico: "sleeve", variants: [["clair", "Transparente"], ["mat", "Mate"]] },
    { id: "onetouch", kind: "scene", mode: "case", name: "Boîtier magnétique", sub: "Protection rigide", ico: "hard", variants: [["cristal", "Cristal"], ["fumé", "Fumé"]] },
    { id: "toploader", kind: "protect", name: "Toploader", sub: "Protection rigide, en direct", ico: "hard" }, { id: "slab", kind: "protect", name: "Slab gradé", sub: "Boîtier scellé, en direct", ico: "slab" },
    { id: "binder", kind: "protect", name: "Page de classeur", sub: "9 pochettes, en direct", ico: "binder" },
    { id: "etb", kind: "pack", name: "Coffret", sub: "Type coffret dresseur", ico: "etb" }, { id: "deckbox", kind: "pack", name: "Deck box", sub: "60 à 100 cartes", ico: "deck" },
  ];
  const LIGHTS = [
    ["studio", "Lumière studio", "suit le curseur", { kind: "follow", warm: 0, z: 1 }],
    ["soft", "Studio diffus", "suit le curseur, large", { kind: "follow", warm: 0, z: 1.7 }],
    ["spot", "Spot serré", "suit le curseur, dur", { kind: "follow", warm: 0, z: 0.55 }],
    ["warm", "Soleil chaud", "suit le curseur", { kind: "follow", warm: 0.7, z: 1.1 }],
    ["cold", "Néon froid", "suit le curseur", { kind: "follow", warm: -0.7, z: 1 }],
    ["topleft", "Fixe · haut gauche", "", { kind: "fixed", x: 28, y: 22, warm: 0, z: 1 }],
    ["topright", "Fixe · haut droite", "", { kind: "fixed", x: 72, y: 22, warm: 0, z: 1 }],
    ["zenith", "Fixe · zénith", "au-dessus", { kind: "fixed", x: 50, y: 4, warm: 0.1, z: 0.9 }],
    ["grazeL", "Rasante à gauche", "", { kind: "fixed", x: 2, y: 50, warm: 0, z: 0.45 }],
    ["grazeR", "Rasante à droite", "", { kind: "fixed", x: 98, y: 50, warm: 0, z: 0.45 }],
    ["vitrine", "Vitrine", "haute, douce, chaude", { kind: "fixed", x: 50, y: 10, warm: 0.35, z: 1.6 }],
    ["orbit", "Animée · orbite", "balayage lent", { kind: "anim", fn: t => [50 + Math.sin(t) * 42, 50 + Math.cos(t * 0.9) * 38], warm: 0, z: 1 }],
    ["sweep", "Animée · balayage horizontal", "", { kind: "anim", fn: t => [50 + Math.sin(t * 1.3) * 48, 42], warm: 0, z: 1 }],
    ["vsweep", "Animée · balayage vertical", "", { kind: "anim", fn: t => [46, 50 + Math.sin(t * 1.3) * 46], warm: 0, z: 1 }],
    ["candle", "Bougie", "vacillante, chaude", { kind: "anim", fn: t => [62 + Math.sin(t * 7) * 3 + Math.sin(t * 3.1) * 4, 72 + Math.cos(t * 5) * 3], warm: 0.9, z: 0.7 }],
  ];
  const lightDef = () => (LIGHTS.find(l => l[0] === ui.light) || LIGHTS[0])[3];
  const ANGLES = [["De face", 0, 0], ["Inclinée à gauche", -16, 4], ["Inclinée à droite", 16, 4], ["Vue plongeante", 0, 14], ["Vue rasante", 24, -10]];

  const project = {
    formatId: "pokemon", custom: { w: 63, h: 88, r: 3 },
    front: { id: "front", layers: [], stock: "#f6f3ec", coat: 0.6 }, back: { id: "back", layers: [], stock: "#f6f3ec", coat: 0.6 },
    edge: "", coatKind: "gloss", coat: 60,
    print: { bleed: 3, safe: 3, dpi: 300, core: "black core" },
    protect: { mode: "none", sleeveFinish: "clear", sleeveTint: "transparent", grade: "10", mention: "GEM MINT", title: "2026 PRISME", binderColor: "#1c1f29" },
    pack: { kind: "booster", title: "SÉRIE 01", sub: "BOOSTER", packs: 36, cards: 10, boxColor: "#1b1d2a", finish: "h-oil", boosterW: 67, boosterH: 117, crimp: 10, fin: 12 },
    dieline: { kind: "card", boxW: 135, boxH: 122, boxD: 74, showArt: true },
    backStyle: { style: "geo", c1: "#1c2f6b", c2: "#e8b44a", text: "" },
    support: "booster", variants: { booster: "metal", display: "24", sleeve: "clair", onetouch: "cristal", single: "sombre", fan: "3", stack: "blanc", frame: "noir", table: "bois" },
  };
  const params = new URLSearchParams(location.search);
  const ui = { page: "atelier", face: "front", cat: "pick", seeAll: false, fmtGroup: "all", view: 0, selDoc: "front", selId: null, zoom: 1, panX: 0, panY: 0, panMode: false, space: false, picking: 0, brush: false, brushErase: false, brushSize: 8, light: "studio", angle: 0, tilt: 16, intensity: 1, seed: Math.random() * 10, flipping: 0, baseScale: 1, quality: params.get("perf") === "low" ? 0.45 : 1.5, dirty: true, marks: false, drag: null, packDirty: false };

  const fmt = () => FORMATS.find(f => f.id === project.formatId) || FORMATS[0];
  const fmtDims = () => project.formatId === "custom" ? project.custom : fmt();
  const aspect = () => { const d = fmtDims(); return d.w / d.h; };
  const curDoc = () => (ui.face === "back" ? project.back : project.front);
  const selDoc = () => project[ui.selDoc];
  const sel = () => selDoc().layers.find(l => l.id === ui.selId) || null;

  /* ---- GL contexts ---- */
  const canvas = $("#gl"), canvasBack = $("#glBack"), card = $("#card"), tiltEl = $("#tiltIn"), bench = $("#bench"), stagewrap = $("#stagewrap"), protect = $("#protect"), flipEl = $("#flip"), stagePanel = $("#stagePanel");
  $("#atelierStageHost").append(stagePanel);
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
  function regenSoon(layer) { clearTimeout(regenTimer); regenTimer = setTimeout(() => { regen(layer); refreshLayers(); invalidateThumbs(); ui.dirty = true; }, 50); }
  function applyPreset(layer, id) {
    const p = PRESET_BY_ID[id]; if (!p) return; const prevBlur = layer.fx.blur; const keepMask = layer.fx.mask, keepInv = layer.fx.maskInvert;
    layer.fx = presetFx(p); layer.presetId = id; ui.baseScale = p.scale;
    if (p.mask === 0) { layer.fx.mask = keepMask; layer.fx.maskInvert = keepInv; }
    if (p.blur !== prevBlur && layer.src) { layer.analysis = analyze(layer.src, layer.fx.blur); layer.version++; }
    ui.dirty = true;
  }
  function fitLayer(layer, mode) { const ca = aspect(), la = layer.w / layer.h; if (mode === "cover") layer.scale = Math.max(1, la / ca); else if (mode === "contain") layer.scale = Math.min(1, la / ca); layer.x = 0.5; layer.y = 0.5; layer.rot = 0; }
  function addLayer(doc, layer, select = true) { doc.layers.push(layer); if (select) { ui.selDoc = doc.id; ui.selId = layer.id; } refreshLayers(); syncInspector(); invalidateThumbs(); ui.dirty = true; commit(); }
  function addImageLayer(doc, img, name, presetId = "h-rainbow") { const l = newLayer("image", name || "Image"); setSrc(l, img); fitLayer(l, "cover"); applyPreset(l, presetId); addLayer(doc, l); return l; }
  function addKind(kind) {
    const doc = curDoc(); const l = newLayer(kind, { text: "Texte", frame: "Cadre", bg: "Fond", badge: "Badge" }[kind]);
    if (kind === "text") { l.y = 0.12; applyPreset(l, "f-gold"); }
    if (kind === "frame") applyPreset(l, "f-gold");
    if (kind === "bg") applyPreset(l, "i-none");
    if (kind === "badge") { l.x = 0.86; l.y = 0.08; l.scale = 0.42; applyPreset(l, "f-gold"); }
    regen(l);
    if (kind === "bg") { doc.layers.unshift(l); ui.selDoc = doc.id; ui.selId = l.id; refreshLayers(); syncInspector(); invalidateThumbs(); ui.dirty = true; commit(); } else addLayer(doc, l);
  }
  function removeLayer(doc, id) { const i = doc.layers.findIndex(l => l.id === id); if (i < 0) return; doc.layers.splice(i, 1); for (const g of [R, RB, T, PK]) if (g) g.drop(id); if (ui.selId === id) ui.selId = doc.layers[Math.min(i, doc.layers.length - 1)]?.id || null; refreshLayers(); syncInspector(); ui.dirty = true; commit(); }
  function duplicateLayer(doc, id) { const l = doc.layers.find(x => x.id === id); if (!l) return; const c = JSON.parse(JSON.stringify({ ...l, src: null, analysis: null, maskImg: null, depthImg: null })); c.id = uid(); c.name = l.name + " copie"; c.src = l.src; c.analysis = l.analysis; c.maskImg = l.maskImg; c.depthImg = l.depthImg; c.version = 1; doc.layers.splice(doc.layers.indexOf(l) + 1, 0, c); ui.selId = c.id; refreshLayers(); syncInspector(); ui.dirty = true; commit(); }
  function moveLayer(doc, id, dir) { const i = doc.layers.findIndex(l => l.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= doc.layers.length) return; [doc.layers[i], doc.layers[j]] = [doc.layers[j], doc.layers[i]]; refreshLayers(); ui.dirty = true; commit(); }

  /* ---- undo / redo (layer parameters, not pixels) ---- */
  const history = { stack: [], idx: -1, muted: false };
  const SRC = new Map();
  function snapshot() {
    const L = l => { SRC.set(l.id, { src: l.src, maskImg: l.maskImg, depthImg: l.depthImg, w: l.w, h: l.h }); return { id: l.id, kind: l.kind, name: l.name, x: l.x, y: l.y, scale: l.scale, rot: l.rot, opacity: l.opacity, blend: l.blend, visible: l.visible, fx: { ...l.fx }, picks: l.picks.map(p => [...p]), pickTol: l.pickTol, win: [...l.win], presetId: l.presetId, text: { ...l.text }, frame: { ...l.frame }, bg: { ...l.bg }, badge: { ...l.badge }, maskVersion: l.maskVersion, blur: l.fx.blur }; };
    return JSON.stringify({ formatId: project.formatId, custom: { ...project.custom }, edge: project.edge, coatKind: project.coatKind, coat: project.coat, print: { ...project.print }, backStyle: { ...project.backStyle }, front: { stock: project.front.stock, layers: project.front.layers.map(L) }, back: { stock: project.back.stock, layers: project.back.layers.map(L) } });
  }
  function restore(json) {
    const d = JSON.parse(json); history.muted = true;
    project.formatId = d.formatId; Object.assign(project.custom, d.custom); project.edge = d.edge; project.coatKind = d.coatKind; project.coat = d.coat; Object.assign(project.print, d.print); Object.assign(project.backStyle, d.backStyle);
    for (const id of ["front", "back"]) {
      const old = new Map(project[id].layers.map(l => [l.id, l])); project[id].stock = d[id].stock;
      project[id].layers = d[id].layers.map(s => { const l = old.get(s.id) || newLayer(s.kind, s.name); const keep = SRC.get(s.id); Object.assign(l, { kind: s.kind, name: s.name, x: s.x, y: s.y, scale: s.scale, rot: s.rot, opacity: s.opacity, blend: s.blend, visible: s.visible, fx: { ...base, ...s.fx }, picks: s.picks, pickTol: s.pickTol, win: s.win, presetId: s.presetId, text: s.text, frame: s.frame, bg: s.bg, badge: s.badge });
        if (!l.src && keep && keep.src) { l.w = keep.w; l.h = keep.h; setSrc(l, keep.src); } else if (l.src && l.analysis && Math.abs((l.analysis.blur ?? l.fx.blur) - l.fx.blur) > 0.01) { l.analysis = analyze(l.src, l.fx.blur); l.version++; }
        if (keep && keep.maskImg && l.maskImg !== keep.maskImg) { l.maskImg = keep.maskImg; l.maskVersion++; }
        if (l.kind !== "image" && !l.src) regen(l); return l; });
    }
    history.muted = false; syncGlobalsToUI(); applyFormat(); refreshLayers(); syncInspector(); ui.dirty = true;
  }
  function commit() { if (history.muted) return; const s = snapshot(); if (history.stack[history.idx] === s) return; history.stack.length = history.idx + 1; history.stack.push(s); if (history.stack.length > 60) history.stack.shift(); history.idx = history.stack.length - 1; updateUndo(); autosave(); }
  function undo() { if (history.idx <= 0) return; history.idx--; restore(history.stack[history.idx]); updateUndo(); toast("Annulé"); }
  function redo() { if (history.idx >= history.stack.length - 1) return; history.idx++; restore(history.stack[history.idx]); updateUndo(); toast("Rétabli"); }
  function updateUndo() { $("#undo").disabled = history.idx <= 0; $("#redo").disabled = history.idx >= history.stack.length - 1; }
  $("#undo").addEventListener("click", undo); $("#redo").addEventListener("click", redo);
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && !/input|textarea|select/i.test(document.activeElement?.tagName || "")) { if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) { e.preventDefault(); redo(); } } });

  /* ---- layers list, menu, illustration strip ---- */
  const thumbCache = new Map();
  function thumbOf(l) { const key = l.id + ":" + l.version; let u = thumbCache.get(key); if (!u) { const [c, x] = cv(96, 96); const la = l.w / l.h; const w = la >= 1 ? 96 : 96 * la, h = la >= 1 ? 96 / la : 96; x.fillStyle = "#111"; x.fillRect(0, 0, 96, 96); x.drawImage(l.src, (96 - w) / 2, (96 - h) / 2, w, h); u = c.toDataURL("image/jpeg", 0.7); thumbCache.set(key, u); } return u; }
  function wideThumb(l) { const key = "w:" + l.id + ":" + l.version; let u = thumbCache.get(key); if (!u) { const [c, x] = cv(340, 190); const la = l.w / l.h; let w = 340, h = 340 / la; if (h < 190) { h = 190; w = 190 * la; } x.fillStyle = "#111"; x.fillRect(0, 0, 340, 190); x.drawImage(l.src, (340 - w) / 2, Math.min(0, (190 - h) * 0.3), w, h); u = c.toDataURL("image/jpeg", 0.8); thumbCache.set(key, u); } return u; }
  function refreshLayers() {
    const doc = curDoc(); const list = $("#layerList"); list.innerHTML = ""; $("#layersDoc").textContent = doc.id === "back" ? "· verso" : "· recto"; $("#layerCount").textContent = doc.layers.length;
    if (!doc.layers.length) { const p = document.createElement("p"); p.className = "note"; p.textContent = "Aucun calque. Importe une image pour commencer."; list.append(p); }
    [...doc.layers].reverse().forEach(l => {
      const row = document.createElement("div"); row.className = "layer-row" + (l.visible ? "" : " off"); row.setAttribute("role", "button"); row.tabIndex = 0; row.setAttribute("aria-selected", String(l.id === ui.selId && ui.selDoc === doc.id));
      const th = document.createElement("div"); th.className = "th"; if (l.src && (l.kind === "image" || l.kind === "back")) th.style.backgroundImage = `url(${thumbOf(l)})`; else th.textContent = KIND_LABEL[l.kind].slice(0, 2);
      const meta = document.createElement("div"); meta.className = "meta2"; const b = document.createElement("b"); b.textContent = l.name; const s = document.createElement("span"); const p = PRESET_BY_ID[l.presetId]; s.textContent = (p ? p.label : "—") + " · " + (MASK_LABEL[l.fx.mask] || ""); meta.append(b, s);
      const acts = document.createElement("div"); acts.className = "acts";
      const mk = (t, title, fn) => { const bt = document.createElement("button"); bt.type = "button"; bt.textContent = t; bt.title = title; bt.setAttribute("aria-label", title); bt.addEventListener("click", e => { e.stopPropagation(); fn(); }); return bt; };
      acts.append(mk(l.visible ? "👁" : "◌", "Afficher / masquer", () => { l.visible = !l.visible; refreshLayers(); ui.dirty = true; commit(); }), mk("▲", "Monter", () => moveLayer(doc, l.id, 1)), mk("▼", "Descendre", () => moveLayer(doc, l.id, -1)), mk("✕", "Supprimer", () => removeLayer(doc, l.id)));
      row.append(th, meta, acts); row.addEventListener("click", () => selectLayer(doc.id, l.id));
      row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); row.click(); } });
      list.append(row);
    });
    // layer menu on the stage
    const menu = $("#layerMenu"); menu.innerHTML = "";
    for (const l of [...doc.layers].reverse()) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(l.id === ui.selId)); b.textContent = l.name; const sm = document.createElement("small"); sm.textContent = KIND_LABEL[l.kind]; b.append(sm); b.addEventListener("click", () => { selectLayer(doc.id, l.id); closeMenus(); }); menu.append(b); }
    const sep = document.createElement("div"); sep.className = "sep"; menu.append(sep); const all = document.createElement("button"); all.type = "button"; all.textContent = "Gérer les calques…"; all.addEventListener("click", () => { $("#layersPanel").hidden = false; closeMenus(); $("#layersPanel").scrollIntoView({ behavior: "smooth", block: "nearest" }); }); menu.append(all);
    // illustration strip: imported layers first, then the example library
    const strip = $("#libStrip"); strip.innerHTML = "";
    for (const l of [...doc.layers].reverse()) { if (!l.src || l.assetId) continue; const b = document.createElement("button"); b.type = "button"; b.className = "lib__item" + (l.visible ? "" : " off"); b.setAttribute("aria-pressed", String(l.id === ui.selId && ui.selDoc === doc.id)); b.style.backgroundImage = `url(${wideThumb(l)})`; const nm = document.createElement("b"); nm.textContent = l.name; b.append(nm); b.title = "Sélectionner « " + l.name + " »"; b.addEventListener("click", () => selectLayer(doc.id, l.id)); strip.append(b); }
    const add = document.createElement("label"); add.className = "lib__item add"; add.htmlFor = "file"; add.textContent = "+ Importer"; strip.append(add);
    const cur = sel(); for (const art of ART_LIBRARY) { const b = document.createElement("button"); b.type = "button"; b.className = "lib__item"; b.setAttribute("aria-pressed", String(!!(cur && cur.assetId === art.id))); b.style.backgroundImage = `url(${art.src})`; b.style.backgroundPosition = "50% 22%"; const nm = document.createElement("b"); nm.textContent = art.name; b.append(nm); b.title = "Utiliser « " + art.name + " » comme illustration"; b.addEventListener("click", () => useArt(art)); const plus = document.createElement("span"); plus.className = "lib__plus"; plus.textContent = "+"; plus.title = "Ajouter comme nouveau calque"; plus.addEventListener("click", ev => { ev.stopPropagation(); addArtLayer(art); }); b.append(plus); strip.append(b); }
    const l = sel(); $("#layerBtnName").textContent = l ? l.name : "Aucun calque"; $("#fxname").textContent = l ? (PRESET_BY_ID[l.presetId]?.label || "") + (l.fx.mask ? " · " + MASK_LABEL[l.fx.mask] : "") : "";
  }
  const artImages = new Map();
  function loadArt(art) { return new Promise((res, rej) => { if (artImages.has(art.id)) return res(artImages.get(art.id)); const im = new Image(); im.onload = () => { artImages.set(art.id, im); res(im); }; im.onerror = rej; im.src = art.src; }); }
  function useArt(art) { loadArt(art).then(im => { const doc = curDoc(); const l = sel(); if (l && l.kind === "image" && ui.selDoc === doc.id) { setSrc(l, im); l.assetId = art.id; l.name = art.name; fitLayer(l, "cover"); refreshLayers(); syncInspector(); invalidateThumbs(); ui.dirty = true; commit(); } else { const nl = addImageLayer(doc, im, art.name, "f-gold"); nl.assetId = art.id; nl.fx.mask = 10; nl.fx.maskThr = 0.4; refreshLayers(); syncInspector(); commit(); } toast("Illustration : " + art.name); }).catch(() => toast("Illustration indisponible")); }
  function addArtLayer(art) { loadArt(art).then(im => { const nl = addImageLayer(curDoc(), im, art.name, "h-rainbow"); nl.assetId = art.id; refreshLayers(); syncInspector(); commit(); toast("Nouveau calque : " + art.name + ". Choisis sa finition et sa zone."); }).catch(() => toast("Illustration indisponible")); }
  function selectLayer(docId, id) { ui.selDoc = docId; ui.selId = id; refreshLayers(); syncInspector(); invalidateThumbs(); }

  /* ---- format ---- */
  function renderFormats() {
    const groups = $("#fmtGroups"); groups.innerHTML = ""; const q = $("#fmtFilter").value.trim().toLowerCase();
    for (const [id, label] of FORMAT_GROUPS) { const b = document.createElement("button"); b.type = "button"; b.className = "pill"; b.textContent = label; b.setAttribute("aria-pressed", String(ui.fmtGroup === id)); b.addEventListener("click", () => { ui.fmtGroup = id; renderFormats(); }); groups.append(b); }
    const list = $("#formats"); list.innerHTML = "";
    for (const f of FORMATS) {
      if (ui.fmtGroup !== "all" && f.group !== ui.fmtGroup) continue; if (q && !(f.game + " " + f.pub).toLowerCase().includes(q)) continue;
      const b = document.createElement("button"); b.type = "button"; b.className = "format-row"; b.setAttribute("aria-pressed", String(f.id === project.formatId));
      const sh = document.createElement("div"); sh.className = "shape"; sh.style.height = Math.round(22 * f.h / f.w) + "px"; sh.style.borderRadius = Math.max(1, f.r / f.w * 22) + "px";
      const t = document.createElement("div"); const tb = document.createElement("b"); tb.textContent = f.game; const ts = document.createElement("span"); ts.textContent = f.pub; t.append(tb, ts);
      const d = document.createElement("div"); d.className = "dim"; d.textContent = `${f.w} × ${f.h}`;
      b.append(sh, t, d); b.addEventListener("click", () => selectFormat(f.id)); list.append(b);
    }
    const cu = $("#fmtCustom"); cu.hidden = project.formatId !== "custom"; cu.innerHTML = "";
    if (project.formatId === "custom") for (const [k, label] of [["w", "Largeur (mm)"], ["h", "Hauteur (mm)"], ["r", "Rayon (mm)"]]) { const lab = document.createElement("label"); lab.className = "field"; lab.textContent = label; const inp = document.createElement("input"); inp.type = "number"; inp.step = "0.5"; inp.min = "5"; inp.max = "400"; inp.value = project.custom[k]; inp.addEventListener("change", () => { project.custom[k] = Math.max(2, +inp.value || 2); applyFormat(); commit(); }); lab.append(inp); cu.append(lab); }
    const f = fmt(); $("#fmtNote").textContent = `${f.game} · ${f.pack.note || ""}`;
  }
  function selectFormat(id) { project.formatId = id; const f = fmt(); project.pack.packs = f.pack.packs; project.pack.cards = f.pack.cards; $("#packsPerBox").value = f.pack.packs; $("#cardsPerPack").value = f.pack.cards; applyFormat(); renderFormats(); if (ui.page === "maquettes") buildSupport(); if (ui.page === "plans") renderDieline(); commit(); }
  function applyCardWidth() {
    const d = fmtDims(); const a = d.w / d.h; const bw = bench.clientWidth || 640; const bh = Math.max(380, window.innerHeight - 300);
    let w = Math.min(bw - 70, a >= 1 ? 560 : 440, bh * a);
    if (ui.page === "maquettes") { const m = project.protect.mode; if (m === "slab") w = Math.min(w, (bw - 56) * 0.7, bh * a * 0.62); else if (m === "onetouch") w = Math.min(w, (bw - 56) * 0.7, bh * a * 0.66); else if (m === "toploader") w = Math.min(w, (bw - 56) * 0.76, bh * a * 0.74); }
    if (ui.marks) w = Math.min(w, (bw - 56) * 0.72, bh * a * 0.72);
    const px = Math.max(120, Math.round(w)); card.style.setProperty("--card-w", px + "px"); protect.style.setProperty("--card-w", px + "px");
    const ppm = px / d.w; card.style.setProperty("--thick", Math.max(1.5, 0.33 * ppm).toFixed(2) + "px"); card.style.setProperty("--bleed-px", (project.print.bleed * ppm).toFixed(2) + "px"); drawMarks(ppm);
  }
  function applyFormat() {
    const d = fmtDims(); const a = d.w / d.h; const rad = d.r / d.w * 100;
    for (const el of [card, document.documentElement]) el.style.setProperty("--card-aspect", round(a, 4));
    card.style.setProperty("--card-radius", `${round(rad, 2)}% / ${round(rad * a, 2)}%`);
    for (const doc of [project.front, project.back]) for (const l of doc.layers) if (l.kind !== "image") regen(l);
    $("#formatVal").textContent = `${d.w} × ${d.h} mm`; $("#dims").textContent = `${d.w} × ${d.h} mm / ${ui.face === "back" ? "verso" : "recto"} / 0,33 mm`;
    resize(); invalidateThumbs(); refreshLayers(); ui.dirty = true;
  }
  function drawMarks(ppm) {
    const svg = $("#marksSvg"); const d = fmtDims(); const b = project.print.bleed, s = project.print.safe; const g = sheetGeom(d.w, d.h, b); card.style.setProperty("--mark-px", ((b + g.M) * ppm).toFixed(2) + "px");
    const W = g.pw * ppm, H = g.ph * ppm; svg.setAttribute("viewBox", `0 0 ${W} ${H}`); const r = d.r * ppm; const off = b + 1, len = 5; let o = "";
    const seg = (x1, y1, x2, y2) => { o += `<line x1="${x1 * ppm}" y1="${y1 * ppm}" x2="${x2 * ppm}" y2="${y2 * ppm}" stroke="#fff" stroke-width="1.1"/>`; };
    for (const [cx, dx] of [[g.tx, -1], [g.tx + g.tw, 1]]) for (const [cy, dy] of [[g.ty, -1], [g.ty + g.th, 1]]) { seg(cx + dx * off, cy, cx + dx * (off + len), cy); seg(cx, cy + dy * off, cx, cy + dy * (off + len)); }
    const reg = (cx, cy) => { o += `<circle cx="${cx * ppm}" cy="${cy * ppm}" r="${1.6 * ppm}" fill="none" stroke="#fff" stroke-width="1.1"/><circle cx="${cx * ppm}" cy="${cy * ppm}" r="${0.35 * ppm}" fill="#fff"/>`; seg(cx - 2.6, cy, cx + 2.6, cy); seg(cx, cy - 2.6, cx, cy + 2.6); };
    reg(g.tx + g.tw / 2, g.by - 5); reg(g.tx + g.tw / 2, g.by + g.bh + 5); reg(g.bx - 5, g.ty + g.th / 2); reg(g.bx + g.bw + 5, g.ty + g.th / 2);
    const sq = 4, total = COLOR_BAR.length * sq; const cx0 = Math.max(g.bx, g.tx + g.tw / 2 - total / 2), cy0 = g.by + g.bh + 2.2; COLOR_BAR.forEach((c, i) => { o += `<rect x="${(cx0 + i * sq) * ppm}" y="${cy0 * ppm}" width="${sq * ppm}" height="${sq * ppm}" fill="${cmykRgb(c)}" stroke="#fff" stroke-width="0.5"/>`; });
    o += `<rect x="${g.bx * ppm}" y="${g.by * ppm}" width="${g.bw * ppm}" height="${g.bh * ppm}" rx="${(d.r + b) * ppm}" fill="none" stroke="#ff5fa0" stroke-width="1.2"/><rect x="${g.tx * ppm}" y="${g.ty * ppm}" width="${g.tw * ppm}" height="${g.th * ppm}" rx="${r}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="6 3"/><rect x="${(g.tx + s) * ppm}" y="${(g.ty + s) * ppm}" width="${(g.tw - 2 * s) * ppm}" height="${(g.th - 2 * s) * ppm}" rx="${Math.max(1, (d.r - s) * ppm)}" fill="none" stroke="#3ddc84" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    o += `<text x="${g.bx * ppm}" y="${(g.by + g.bh + 9.5) * ppm}" font-size="${Math.max(9, 2.3 * ppm)}" fill="#fff" font-family="Inter, sans-serif">${fmt().game} · ${d.w} × ${d.h} mm · fond perdu ${b} mm · sécurité ${s} mm · ${project.print.dpi} dpi · 0,33 mm</text>`;
    svg.innerHTML = o;
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

  /* ---- popovers and menus ---- */
  const POPS = [["#stockBtn", "#stockPop"], ["#formatBtn", "#formatPop"], ["#helpBtn", "#helpPop"], ["#exportBtn", "#exportMenu"], ["#layerBtn", "#layerMenu"], ["#lightBtn", "#lightMenu"]];
  function closeMenus(except) { for (const [, p] of POPS) if (p !== except) $(p).hidden = true; }
  for (const [b, p] of POPS) $(b).addEventListener("click", e => { e.stopPropagation(); const el = $(p); const open = el.hidden; closeMenus(p); el.hidden = !open; if (!el.hidden && p === "#formatPop") $("#fmtFilter").focus(); });
  for (const [, p] of POPS) $(p).addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => closeMenus()); document.addEventListener("keydown", e => { if (e.key === "Escape") { closeMenus(); setPicking(0); setBrush(false); } });

  /* ---- import ---- */
  function loadFile(file, cb) { if (!file || !file.type.startsWith("image/")) return; const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => { cb(im, file.name); URL.revokeObjectURL(u); }; im.src = u; }
  function importImages(files) { const doc = curDoc(); [...files].forEach(f => loadFile(f, (im, name) => { addImageLayer(doc, im, name.replace(/\.[^.]+$/, "").slice(0, 24)); toast("Illustration ajoutée : " + name); })); }
  $("#file").addEventListener("change", e => { importImages(e.target.files); e.target.value = ""; });
  $("#maskfile").addEventListener("change", e => loadFile(e.target.files[0], im => { const l = sel(); if (!l) return; l.maskImg = im; l.maskVersion++; l.fx.mask = 4; syncInspector(); refreshLayers(); commit(); }));
  $("#depthfile").addEventListener("change", e => loadFile(e.target.files[0], im => { const l = sel(); if (!l) return; l.depthImg = im; l.depthVersion++; l.fx.depthSrc = 4; syncInspector(); }));
  $("#backfile").addEventListener("change", e => loadFile(e.target.files[0], im => { addImageLayer(project.back, im, "Dos importé", "i-none"); if (ui.face !== "back") setFace("back"); }));
  document.addEventListener("paste", e => { const items = [...(e.clipboardData?.items || [])].filter(i => i.type.startsWith("image/")); if (items.length) importImages(items.map(i => i.getAsFile())); });
  bench.addEventListener("dragover", e => { e.preventDefault(); bench.classList.add("dropping"); });
  bench.addEventListener("dragleave", () => bench.classList.remove("dropping"));
  bench.addEventListener("drop", e => { e.preventDefault(); bench.classList.remove("dropping"); importImages(e.dataTransfer.files); });
  $("#addKind").addEventListener("change", e => { if (e.target.value) { addKind(e.target.value); e.target.value = ""; } });
  $("#sample").addEventListener("click", () => { addImageLayer(curDoc(), makeFox(), "Illustration exemple"); });

  /* ---- swatch book ---- */
  function catPresets() { if (ui.cat === "pick") return PICKS.map(id => PRESET_BY_ID[id]); if (ui.cat === "combo") return []; return PRESETS.filter(p => p.cat === ui.cat); }
  function renderCatTabs() { const el = $("#catTabs"); el.innerHTML = ""; for (const [id, label] of NUANCIER) { const b = document.createElement("button"); b.type = "button"; b.className = "pill"; b.textContent = label; b.setAttribute("aria-pressed", String(ui.cat === id)); b.addEventListener("click", () => { ui.cat = id; ui.seeAll = false; renderCatTabs(); renderEffects(); }); el.append(b); } }
  const fxThumbCache = new Map(); let thumbQueue = [], thumbRunning = false;
  function invalidateThumbs() { thumbQueue = []; renderEffects(); }
  function thumbKey(l, id) { return `${l.id}:${l.version}:${id}:${round(aspect(), 3)}:${selDoc().stock}:${l.fx.mask}`; }
  function renderEffects() {
    const grid = $("#effects"); grid.innerHTML = ""; const l = sel(); thumbQueue = [];
    const items = ui.cat === "combo" ? RECIPES.map(([label, desc, r]) => ({ id: "combo:" + label, label, title: desc, recipe: r })) : catPresets().map(p => ({ id: p.id, label: p.label, title: p.sub || p.label, preset: p }));
    const total = items.length; const shown = ui.seeAll ? items : items.slice(0, 6);
    $("#seeAll").hidden = total <= 6; $("#seeAll").textContent = ui.seeAll ? "Réduire ↑" : `Tout voir (${total}) →`;
    for (const it of shown) {
      const b = document.createElement("button"); b.type = "button"; b.className = "fx"; b.title = it.title; const pressed = l && (it.preset ? l.presetId === it.id : false); b.setAttribute("aria-pressed", String(!!pressed));
      const im = document.createElement("img"); im.alt = ""; const key = l ? thumbKey(l, it.id) : null; const cached = key && fxThumbCache.get(key); if (cached) im.src = cached; else if (l && T) thumbQueue.push({ it, im, key, l });
      const s = document.createElement("span"); s.textContent = it.label; b.append(im, s); grid.append(b);
      b.addEventListener("click", () => { const L = sel(); if (!L) { toast("Importe d'abord une illustration"); return; } if (it.recipe) applyRecipe(L, it.recipe, it.label, it.title); else applyPreset(L, it.id); syncInspector(); refreshLayers(); commit(); });
    }
    pumpThumbs();
  }
  function applyRecipe(l, r, label, desc) { applyPreset(l, r.preset); l.fx.mask = r.mask; l.fx.maskInvert = 0; if (r.thr) l.fx.maskThr = r.thr; if (r.accent) { l.fx.accent = 1; l.fx.accentType = r.accent[0]; l.fx.accentMask = r.accent[1]; l.fx.accentColor = ""; } else l.fx.accent = 0; toast(label + " · " + desc); }
  function pumpThumbs() {
    if (thumbRunning) return; thumbRunning = true;
    const step = () => {
      const a = aspect(); let n = 0;
      while (thumbQueue.length && n < (ui.quality < 1 ? 1 : 3)) {
        const { it, im, key, l } = thumbQueue.shift(); if (!l.src || !l.analysis) continue;
        thumbCanvas.width = 220; thumbCanvas.height = Math.round(220 / a);
        let fx; if (it.recipe) { const p = PRESET_BY_ID[it.recipe.preset]; fx = { ...presetFx(p), mask: it.recipe.mask, maskInvert: 0 }; if (it.recipe.thr) fx.maskThr = it.recipe.thr; if (it.recipe.accent) { fx.accent = 1; fx.accentType = it.recipe.accent[0]; fx.accentMask = it.recipe.accent[1]; } } else fx = { ...presetFx(it.preset), mask: it.preset.mask || l.fx.mask, maskInvert: l.fx.maskInvert };
        const temp = { ...l, fx }; const doc = { stock: selDoc().stock, layers: [temp], coat: 0 };
        T.renderDoc(doc, { pointer: [0.32, 0.7], tilt: [-0.2, 0.12], aspect: a, intensity: 1, seed: ui.seed, selectedId: null, view: 0 });
        const url = thumbCanvas.toDataURL("image/jpeg", 0.82); fxThumbCache.set(key, url); im.src = url; n++;
      }
      if (thumbQueue.length) requestAnimationFrame(step); else thumbRunning = false;
    };
    requestAnimationFrame(step);
  }
  $("#seeAll").addEventListener("click", () => { ui.seeAll = !ui.seeAll; renderEffects(); });
  function renderAccentQuick() {
    const el = $("#accentQuick"); el.innerHTML = ""; const l = sel();
    for (const a of ACCENTS) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(!!(l && l.fx.accent && l.fx.accentType === a.type))); const d = document.createElement("span"); d.className = "dot"; d.style.background = a.css; const s = document.createElement("span"); s.textContent = a.label; b.append(d, s); b.addEventListener("click", () => { const L = sel(); if (!L) { toast("Importe d'abord une illustration"); return; } L.fx.accent = 1; L.fx.accentType = a.type; L.fx.accentColor = ""; if (L.fx.accentMask === 8 && !L.picks.length) setPicking(2); syncInspector(); commit(); }); el.append(b); }
  }

  /* ---- inspector ---- */
  const PCT = v => Math.round(v * 100) + "%";
  const NUM = { imgRelief: [100, PCT], blur: [1, v => v + " px"], detail: [100, PCT], cavity: [100, PCT], bump: [100, PCT], angle: [1, v => Math.round(v) + "°"], depth: [100, PCT], relief: [100, PCT], foil: [100, PCT], sat: [100, PCT], bands: [100, v => v.toFixed(2)], sparkle: [100, PCT], edgeFoil: [100, PCT], ink: [100, PCT], glare: [100, PCT], specPow: [1, v => String(Math.round(v))], lightZ: [100, v => v.toFixed(2)], warm: [100, v => (v > 0 ? "chaud " : v < 0 ? "froid " : "neutre ") + Math.abs(Math.round(v * 100)) + "%"], maskThr: [100, PCT], maskSoft: [100, PCT], accentAmt: [100, PCT], accentRelief: [100, PCT] };
  const SELS = [["reliefSrc", "reliefSrc"], ["pattern", "pattern"], ["depthSrc", "depthSrc"], ["blend", "blend"], ["palette", "palette"], ["accentType", "accentType"]];
  function syncInspector() {
    const l = sel();
    for (const id of ["edText", "edFrame", "edBg", "edBadge"]) $("#" + id).hidden = true;
    $("#backFold").hidden = ui.face !== "back";
    if (!l) { $("#fxTitle").textContent = "Aucun calque"; $("#fxSub").textContent = "Importe une illustration pour commencer"; $("#layerName").value = ""; $("#layerKind").textContent = "—"; for (const b of $$("#zones [data-mask], #accentZones [data-amask], #invertChip")) b.setAttribute("aria-pressed", "false"); for (const id of ["winRow", "thrRow", "pickRow", "brushRow"]) $("#" + id).hidden = true; renderAccentQuick(); renderEffects(); return; }
    const p = PRESET_BY_ID[l.presetId]; $("#fxTitle").textContent = p ? p.label : "—"; $("#fxSub").textContent = p ? (CAT_LABEL[p.cat] + (p.sub ? " · " + p.sub : "")) : ""; $("#fxNote").textContent = p ? p.note || "" : "";
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
    $("#depthRow").hidden = m.depthSrc !== 4;
    $("#winRow").hidden = !(m.mask === 1 || m.mask === 2); $("#thrRow").hidden = ![5, 6, 7, 9, 10, 11, 12, 13].includes(m.mask); $("#pickRow").hidden = !(m.mask === 8 || (m.accent && m.accentMask === 8)); $("#brushRow").hidden = m.mask !== 4;
    for (const [i, id] of ["wt", "wr", "wb", "wl"].entries()) { $("#" + id).value = l.win[i] * 100; $("#o-" + id).value = Math.round(l.win[i] * 100) + "%"; }
    $("#pickTol").value = Math.round(l.pickTol * 100); $("#o-pickTol").value = Math.round(l.pickTol * 100) + "%"; renderSwatches();
    for (const b of $$("#zones [data-mask]")) b.setAttribute("aria-pressed", String(+b.dataset.mask === m.mask)); $("#brushBtn").setAttribute("aria-pressed", String(m.mask === 4)); $("#invertChip").setAttribute("aria-pressed", String(!!m.maskInvert));
    for (const b of $$("#accentZones [data-amask]")) b.setAttribute("aria-pressed", String(+b.dataset.amask === m.accentMask));
    if (m.accent) $("#accentPanel").hidden = false;
    renderAccentQuick(); renderEffects();
    $("#fxname").textContent = (p ? p.label : "") + (m.mask ? " · " + MASK_LABEL[m.mask] : "");
  }
  for (const k of Object.keys(NUM)) { const el = $("#" + k); el.addEventListener("input", e => { const l = sel(); if (!l) return; const [mul, f] = NUM[k]; l.fx[k] = +e.target.value / mul; $("#o-" + k).value = f(l.fx[k]); if (k === "blur") { clearTimeout(regenTimer); regenTimer = setTimeout(() => { if (l.src) { l.analysis = analyze(l.src, l.fx.blur); l.version++; ui.dirty = true; } }, 80); } }); el.addEventListener("change", commit); }
  $("#scale").addEventListener("input", e => { const l = sel(); if (!l) return; l.fx.scale = (ui.baseScale || 1) * e.target.value / 100; $("#o-scale").value = "×" + (e.target.value / 100).toFixed(2); }); $("#scale").addEventListener("change", commit);
  for (const [id, key] of SELS) $("#" + id).addEventListener("change", e => { const l = sel(); if (!l) return; l.fx[key] = +e.target.value; if (key === "accentType") l.fx.accentColor = ""; syncInspector(); commit(); });
  $("#tint").addEventListener("change", e => { const l = sel(); if (l) { l.fx.tint = e.target.value; commit(); } });
  for (const id of ["flatOnly", "accent", "accentInvert", "accentWithin"]) $("#" + id).addEventListener("change", e => { const l = sel(); if (l) { l.fx[id] = e.target.checked ? 1 : 0; syncInspector(); commit(); } });
  for (const b of $$("#zones [data-mask]")) b.addEventListener("click", () => { const l = sel(); if (!l) { toast("Importe d'abord une illustration"); return; } setBrush(false); l.fx.mask = +b.dataset.mask; if (l.fx.mask === 8 && !l.picks.length) setPicking(1); syncInspector(); refreshLayers(); commit(); });
  $("#invertChip").addEventListener("click", () => { const l = sel(); if (l) { l.fx.maskInvert = l.fx.maskInvert ? 0 : 1; syncInspector(); commit(); } });
  for (const b of $$("#accentZones [data-amask]")) b.addEventListener("click", () => { const l = sel(); if (!l) return; l.fx.accentMask = +b.dataset.amask; l.fx.accent = 1; if (l.fx.accentMask === 8 && !l.picks.length) setPicking(2); syncInspector(); commit(); });
  for (const [i, id] of ["wt", "wr", "wb", "wl"].entries()) { $("#" + id).addEventListener("input", e => { const l = sel(); if (l) { l.win[i] = +e.target.value / 100; $("#o-" + id).value = e.target.value + "%"; } }); $("#" + id).addEventListener("change", commit); }
  $("#pickTol").addEventListener("input", e => { const l = sel(); if (l) { l.pickTol = e.target.value / 100; $("#o-pickTol").value = e.target.value + "%"; } });
  $("#pickbtn").addEventListener("click", () => setPicking(ui.picking ? 0 : 1));
  $("#pickclear").addEventListener("click", () => { const l = sel(); if (l) { l.picks = []; renderSwatches(); commit(); } });
  $("#noteBtn").addEventListener("click", () => { $("#fxNote").hidden = !$("#fxNote").hidden; });
  $("#layersBtn").addEventListener("click", () => { const p = $("#layersPanel"); p.hidden = !p.hidden; if (!p.hidden) p.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
  $("#layersClose").addEventListener("click", () => { $("#layersPanel").hidden = true; });
  $("#accentBtn").addEventListener("click", () => { const p = $("#accentPanel"); p.hidden = false; const l = sel(); if (l && !l.fx.accent) { l.fx.accent = 1; syncInspector(); } p.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
  $("#accentClose").addEventListener("click", () => { $("#accentPanel").hidden = true; });
  $("#fitBtn").addEventListener("click", () => { const r = $("#fitRow"); r.hidden = !r.hidden; });
  const HINT = "Glisser pour incliner · Molette pour zoomer";
  function setPicking(on) { ui.picking = on; if (on) setBrush(false); bench.classList.toggle("picking", !!on); $("#pickbtn").setAttribute("aria-pressed", String(!!on)); $("#hint").textContent = on ? "Clique sur la carte pour choisir une couleur (Maj + clic pour en ajouter)" : HINT; }
  function renderSwatches() { const el = $("#pickswatches"); el.innerHTML = ""; const l = sel(); if (!l) return; for (const c of l.picks) { const s = document.createElement("span"); s.className = "swatch"; s.style.background = `rgb(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)})`; el.append(s); } }
  function layerUV(l, e) { const rect = card.getBoundingClientRect(); const u = (e.clientX - rect.left) / rect.width, v = (e.clientY - rect.top) / rect.height; const ca = aspect(), la = l.w / l.h; const hw = l.scale * ca / 2, hh = hw / la; const px = (u - l.x) * ca, py = (v - l.y); const r = -l.rot * Math.PI / 180; const rx = px * Math.cos(r) - py * Math.sin(r), ry = px * Math.sin(r) + py * Math.cos(r); return [rx / (2 * hw) + 0.5, ry / (2 * hh) + 0.5]; }
  function pickAt(e) {
    const l = sel(); if (!l || !l.analysis) return; const [lu, lv] = layerUV(l, e); if (lu < 0 || lu > 1 || lv < 0 || lv > 1) { toast("Clique à l'intérieur de l'illustration"); return; }
    const A = l.analysis; const ix = Math.min(A.w - 1, Math.floor(lu * A.w)), iy = Math.min(A.h - 1, Math.floor(lv * A.h)); const j = (iy * A.w + ix) * 4; const d = A.data; const col = [d[j] / 255, d[j+1] / 255, d[j+2] / 255];
    if (e.shiftKey && l.picks.length < 4) l.picks.push(col); else l.picks = [col];
    renderSwatches(); if (!e.shiftKey) setPicking(0); commit();
  }
  /* brush mask: paint white (finish) or black on a layer-space canvas */
  function brushCanvas(l) { if (!(l.maskImg instanceof HTMLCanvasElement) || !l.maskImg.dataset.brush) { const w = 1024, h = Math.round(1024 * l.h / l.w); const [c, x] = cv(w, h); c.dataset.brush = "1"; if (l.maskImg) x.drawImage(l.maskImg, 0, 0, w, h); else { x.fillStyle = "#000"; x.fillRect(0, 0, w, h); } l.maskImg = c; } return l.maskImg; }
  function setBrush(on) { ui.brush = on; bench.classList.toggle("brushing", on); $("#brushBtn").setAttribute("aria-pressed", String(on || (sel() && sel().fx.mask === 4))); if (on) { setPicking(0); $("#hint").textContent = "Peins sur la carte · Gomme pour retirer · Échap pour terminer"; } else $("#hint").textContent = HINT; }
  function paintAt(l, e) { const c = brushCanvas(l); const x = c.getContext("2d"); const [lu, lv] = layerUV(l, e); const rpx = ui.brushSize / 100 / l.scale * c.width * 0.5; x.fillStyle = ui.brushErase ? "#000" : "#fff"; x.beginPath(); x.arc(lu * c.width, lv * c.height, rpx, 0, Math.PI * 2); x.fill(); l.maskVersion++; ui.dirty = true; }
  $("#brushBtn").addEventListener("click", () => { const l = sel(); if (!l) { toast("Importe d'abord une illustration"); return; } l.fx.mask = 4; brushCanvas(l); l.maskVersion++; setBrush(true); syncInspector(); refreshLayers(); });
  $("#brushErase").addEventListener("click", () => { ui.brushErase = !ui.brushErase; $("#brushErase").setAttribute("aria-pressed", String(ui.brushErase)); });
  $("#brushClear").addEventListener("click", () => { const l = sel(); if (!l) return; l.maskImg = null; brushCanvas(l); l.maskVersion++; ui.dirty = true; });
  $("#brushSize").addEventListener("input", e => { ui.brushSize = +e.target.value; $("#o-brushSize").value = e.target.value + "%"; });
  $("#layerName").addEventListener("input", e => { const l = sel(); if (l) { l.name = e.target.value; refreshLayers(); } }); $("#layerName").addEventListener("change", commit);
  $("#layerVisible").addEventListener("change", e => { const l = sel(); if (l) { l.visible = e.target.checked; refreshLayers(); commit(); } });
  $("#layerBlend").addEventListener("change", e => { const l = sel(); if (l) { l.blend = e.target.value; commit(); } });
  $("#layerOpacity").addEventListener("input", e => { const l = sel(); if (l) { l.opacity = e.target.value / 100; $("#o-layerOpacity").value = e.target.value + "%"; } });
  $("#layerX").addEventListener("input", e => { const l = sel(); if (l) { l.x = e.target.value / 100; $("#o-layerX").value = e.target.value + "%"; } });
  $("#layerY").addEventListener("input", e => { const l = sel(); if (l) { l.y = e.target.value / 100; $("#o-layerY").value = e.target.value + "%"; } });
  $("#layerScale").addEventListener("input", e => { const l = sel(); if (l) { l.scale = e.target.value / 100; $("#o-layerScale").value = e.target.value + "%"; } });
  $("#layerRot").addEventListener("input", e => { const l = sel(); if (l) { l.rot = +e.target.value; $("#o-layerRot").value = e.target.value + "°"; } });
  for (const id of ["layerOpacity", "layerX", "layerY", "layerScale", "layerRot"]) $("#" + id).addEventListener("change", commit);
  for (const b of $$("[data-fit]")) b.addEventListener("click", () => { const l = sel(); if (l) { fitLayer(l, b.dataset.fit); syncInspector(); commit(); } });
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
  $("#stock").addEventListener("change", e => { project.front.stock = project.back.stock = e.target.value; invalidateThumbs(); commit(); });
  $("#core").addEventListener("change", e => { project.print.core = e.target.value; applyCore(); commit(); });
  function applyCore() { card.style.setProperty("--core-color", CORE_COLORS[project.print.core] || "#26262b"); }
  function applyEdge() { card.classList.remove("edge-gold", "edge-silver", "edge-black", "edge-red"); if (project.edge) card.classList.add("edge-" + project.edge); }
  $("#edge").addEventListener("change", e => { project.edge = e.target.value; applyEdge(); commit(); });
  $("#coatKind").addEventListener("change", e => { project.coatKind = e.target.value; applyCoat(); commit(); });
  $("#coat").addEventListener("input", e => { project.coat = +e.target.value; $("#o-coat").value = e.target.value + "%"; applyCoat(); }); $("#coat").addEventListener("change", commit);
  function applyCoat() { const k = project.coatKind; const v = project.coat / 100; const f = k === "none" ? 0 : k === "matte" ? 0.15 : k === "satin" ? 0.5 : 1; project.front.coat = project.back.coat = v * f; $("#stockBtn").innerHTML = `0,33 <small>mm · ${({ gloss: "brillant", satin: "satiné", matte: "mat", none: "sans vernis" })[k]}</small>`; }
  $("#marks").addEventListener("change", e => { ui.marks = e.target.checked; card.classList.toggle("show-marks", ui.marks); resize(); });
  function syncGlobalsToUI() { $("#stock").value = project.front.stock; $("#edge").value = project.edge; $("#coatKind").value = project.coatKind; $("#core").value = project.print.core; $("#coat").value = project.coat; $("#o-coat").value = project.coat + "%"; $("#bleed").value = project.print.bleed; $("#safe").value = project.print.safe; $("#dpi").value = project.print.dpi; $("#backC1").value = project.backStyle.c1; $("#backC2").value = project.backStyle.c2; $("#backText").value = project.backStyle.text || ""; applyCoat(); applyCore(); applyEdge(); renderBacks(); }

  /* ---- back of card ---- */
  function ensureBackLayer() { let l = project.back.layers.find(x => x.kind === "back"); if (!l) { l = newLayer("back", "Motif du dos"); applyPreset(l, "h-rainbow"); regen(l); project.back.layers.unshift(l); } return l; }
  function renderBacks() {
    const el = $("#backs"); el.innerHTML = ""; const ca = aspect();
    for (const [id, label] of BACK_STYLES) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(project.backStyle.style === id)); const c = backCanvas(id, project.backStyle.c1, project.backStyle.c2, project.backStyle.text, ca); const small = document.createElement("canvas"); small.width = 112; small.height = Math.round(112 / ca); small.getContext("2d").drawImage(c, 0, 0, small.width, small.height); const s = document.createElement("span"); s.textContent = label; b.append(small, s); b.addEventListener("click", () => { project.backStyle.style = id; const l = ensureBackLayer(); regen(l); renderBacks(); selectLayer("back", l.id); ui.dirty = true; commit(); }); el.append(b); }
  }
  for (const [id, key] of [["backC1", "c1"], ["backC2", "c2"], ["backText", "text"]]) $("#" + id).addEventListener("input", e => { project.backStyle[key] = e.target.value; const l = ensureBackLayer(); regenSoon(l); clearTimeout(ui.backsTimer); ui.backsTimer = setTimeout(renderBacks, 200); });
  function setFace(f) {
    const prev = ui.face; ui.face = f; for (const b of $$("[data-face]")) b.setAttribute("aria-pressed", String(b.dataset.face === f));
    flipEl.style.setProperty("--flip", f === "back" ? "180deg" : "0deg"); if (prev !== f) ui.flipping = performance.now() + 950;
    if (f === "back") { ensureBack(); ensureBackLayer(); ui.selDoc = "back"; if (!project.back.layers.find(l => l.id === ui.selId)) ui.selId = project.back.layers[project.back.layers.length - 1]?.id || null; }
    else { ui.selDoc = "front"; if (!project.front.layers.find(l => l.id === ui.selId)) ui.selId = project.front.layers[project.front.layers.length - 1]?.id || null; }
    $("#dims").textContent = `${fmtDims().w} × ${fmtDims().h} mm / ${f === "back" ? "verso" : "recto"} / 0,33 mm`;
    refreshLayers(); syncInspector(); ui.dirty = true;
  }
  for (const b of $$("[data-face]")) b.addEventListener("click", () => setFace(b.dataset.face));
  $("#flipBtn").addEventListener("click", () => setFace(ui.face === "back" ? "front" : "back"));

  /* ---- pages ---- */
  const PAGE_TEXT = { atelier: ["Atelier d'impression", "Choisis une finition et sa zone. Incline la carte pour examiner le reflet."], plans: ["Plans de découpe", "Place tes visuels, vérifie les marges et télécharge le plan à l'échelle."], maquettes: ["Maquettes en volume", "Vérifie tes visuels sur un booster, un présentoir ou une protection."] };
  function setPage(p) {
    ui.page = p; for (const b of $$("[data-page]")) b.setAttribute("aria-pressed", String(b.dataset.page === p));
    for (const id of ["atelier", "plans", "maquettes"]) $("#page-" + id).hidden = id !== p;
    $("#pageTitle").textContent = PAGE_TEXT[p][0]; $("#pageSub").textContent = PAGE_TEXT[p][1];
    if (p === "maquettes") { $("#mqStageHost").append(stagePanel); $("#viewsRow").hidden = true; $("#marksLbl").hidden = true; buildSupport(); }
    else { if (stagePanel.parentElement !== $("#atelierStageHost")) $("#atelierStageHost").append(stagePanel); $("#viewsRow").hidden = false; $("#marksLbl").hidden = false; applyProtect("none"); $("#packScene").hidden = true; $("#sceneCanvas").hidden = true; ui.scene = null; $("#tiltRoot").hidden = false; protect.hidden = false; }
    if (p === "plans") { renderDieline(); renderPreflight(); }
    resize(); ui.dirty = true; window.scrollTo({ top: 0, behavior: "smooth" });
  }
  for (const b of $$("[data-page]")) b.addEventListener("click", () => setPage(b.dataset.page));
  $("#toPlans").addEventListener("click", () => { const s = SUPPORTS.find(x => x.id === project.support); project.dieline.kind = s && s.kind === "pack" && s.id !== "shelf" ? s.id : "card"; renderDielineOpts(); setPage("plans"); });

  /* ---- light and angle ---- */
  function renderLights() { const el = $("#lightMenu"); el.innerHTML = ""; let lastKind = ""; for (const [id, label, small, def] of LIGHTS) { if (lastKind && def.kind !== lastKind) { const sep = document.createElement("div"); sep.className = "sep"; el.append(sep); } lastKind = def.kind; const b = document.createElement("button"); b.type = "button"; b.dataset.light = id; b.setAttribute("aria-pressed", String(ui.light === id)); b.textContent = label; const sm = document.createElement("small"); sm.textContent = small; b.append(sm); b.addEventListener("click", () => setLight(id)); el.append(b); } }
  function setLight(id) { ui.light = id; const [, label] = LIGHTS.find(l => l[0] === id) || LIGHTS[0]; $("#lightName").textContent = label; renderLights(); closeMenus(); interacting = false; interactEnd(true); ui.dirty = true; }
  renderLights();
  function setAngle(i) { ui.angle = (i + ANGLES.length) % ANGLES.length; $("#angName").textContent = ANGLES[ui.angle][0]; interactEnd(true); }
  $("#angPrev").addEventListener("click", () => setAngle(ui.angle - 1)); $("#angNext").addEventListener("click", () => setAngle(ui.angle + 1));

  /* ---- supports (maquettes) ---- */
  function renderSupports() {
    const el = $("#supports"); el.innerHTML = "";
    for (const s of SUPPORTS) { const b = document.createElement("button"); b.type = "button"; b.className = "support"; b.setAttribute("aria-pressed", String(project.support === s.id)); const pic = document.createElement("div"); pic.className = "pic"; const ico = document.createElement("div"); ico.className = "ico " + s.ico; pic.append(ico); const txt = document.createElement("div"); txt.className = "txt"; const nb = document.createElement("b"); nb.textContent = s.name; const ns = document.createElement("span"); ns.textContent = s.sub; txt.append(nb, ns); b.append(pic, txt); b.addEventListener("click", () => { project.support = s.id; renderSupports(); buildSupport(); }); el.append(b); }
  }
  function buildSupport() {
    const s = SUPPORTS.find(x => x.id === project.support) || SUPPORTS[0]; const fields = $("#mqFields"); fields.innerHTML = "";
    const mkField = (label, el) => { const lab = document.createElement("label"); lab.className = "field"; lab.textContent = label; lab.append(el); return lab; };
    const mkSelect = (opts, val, fn) => { const se = document.createElement("select"); for (const [v, t] of opts) { const o = document.createElement("option"); o.value = v; o.textContent = t; se.append(o); } se.value = val; se.addEventListener("change", () => { fn(se.value); buildSupport(); }); return se; };
    const mkInput = (type, val, fn, attrs = {}) => { const i = document.createElement("input"); i.type = type; i.value = val; Object.assign(i, attrs); i.addEventListener("change", () => { fn(i.value); buildSupport(); }); return i; };
    $("#sceneCanvas").hidden = s.kind !== "scene"; ui.scene = null;
    if (s.kind === "scene") {
      project.protect.mode = "none"; applyProtect("none"); $("#tiltRoot").hidden = false; protect.hidden = true; $("#binder").hidden = true; $("#packScene").hidden = true; ui.scene = { mode: s.mode, id: s.id };
      const kv = document.createElement("div"); kv.className = "kv";
      kv.append(mkField("Présentation", mkSelect(s.variants, project.variants[s.id] || s.variants[0][0], v => { project.variants[s.id] = v; })));
      if (s.id === "booster" || s.id === "display" || s.id === "stack") kv.append(mkField(s.id === "stack" ? "Nombre de cartes" : "Cartes par booster", mkInput("number", project.pack.cards, v => { project.pack.cards = Math.max(1, +v || 1); $("#cardsPerPack").value = project.pack.cards; }, { min: 1, max: 60 })));
      const n = document.createElement("p"); n.className = "note"; n.textContent = ({ booster: "Sachet soudé 67 × 117 mm, sertissages haut et bas.", display: "Présentoir de comptoir avec fronton, boosters en rangs. Le recto habille le fronton et les boosters.", sleeve: "Pochette 66 × 91 mm, transparente ou mate.", onetouch: "Boîtier magnétique une pièce, fermeture aimantée, cristal ou fumé.", single: "La carte seule, avec son ombre portée.", fan: "Plusieurs exemplaires en éventail.", stack: "La pile montre l'épaisseur réelle du carton : 0,33 mm par carte.", frame: "Carte sous passe-partout dans un cadre.", table: "Carte posée à plat, vue en perspective." })[s.id] + " Glisse pour incliner, survole pour déplacer la lumière.";
      fields.append(kv, n); ui.dirty = true; renderScene(true);
    } else if (s.kind === "pack") {
      project.protect.mode = "none"; applyProtect("none"); $("#tiltRoot").hidden = true; $("#packScene").hidden = false; project.pack.kind = s.id; buildPackScene();
      const kv = document.createElement("div"); kv.className = "kv";
      kv.append(mkField("Présentation", mkSelect([["h-oil", "Film holographique"], ["h-silver", "Métallisé argent"], ["h-secret", "Holo diagonales"], ["h-cosmic", "Holo cosmos"], ["i-none", "Mat imprimé"]], project.pack.finish, v => { project.pack.finish = v; $("#packFinish").value = v; })));
      kv.append(mkField("Titre", mkInput("text", project.pack.title, v => { project.pack.title = v; $("#packTitle").value = v; }, { maxLength: 24 })));
      kv.append(mkField("Sous-titre", mkInput("text", project.pack.sub, v => { project.pack.sub = v; $("#packSub").value = v; }, { maxLength: 32 })));
      kv.append(mkField("Couleur de boîte", mkInput("color", project.pack.boxColor, v => { project.pack.boxColor = v; $("#boxColor").value = v; })));
      if (s.id !== "booster") kv.append(mkField("Boosters par display", mkInput("number", project.pack.packs, v => { project.pack.packs = Math.max(1, +v || 1); $("#packsPerBox").value = project.pack.packs; }, { min: 1, max: 60 })));
      kv.append(mkField("Cartes par booster", mkInput("number", project.pack.cards, v => { project.pack.cards = Math.max(1, +v || 1); $("#cardsPerPack").value = project.pack.cards; }, { min: 1, max: 60 })));
      fields.append(kv);
    } else {
      $("#packScene").hidden = true; $("#tiltRoot").hidden = false; project.protect.mode = s.id; applyProtect(s.id);
      const kv = document.createElement("div"); kv.className = "kv";
      if (s.id === "sleeve") { kv.append(mkField("Présentation", mkSelect([["clear", "Transparente brillante"], ["matte", "Mate"]], project.protect.sleeveFinish, v => { project.protect.sleeveFinish = v; }))); kv.append(mkField("Teinte", mkSelect([["transparent", "Incolore"], ["rgba(0,0,0,0.55)", "Noire"], ["rgba(20,40,120,0.45)", "Bleue"], ["rgba(140,20,30,0.45)", "Rouge"], ["rgba(20,90,50,0.45)", "Verte"], ["rgba(70,20,110,0.45)", "Violette"], ["rgba(255,255,255,0.35)", "Blanche"]], project.protect.sleeveTint, v => { project.protect.sleeveTint = v; }))); }
      if (s.id === "slab") { kv.append(mkField("Note", mkInput("text", project.protect.grade, v => { project.protect.grade = v; }, { maxLength: 4 }))); kv.append(mkField("Mention", mkInput("text", project.protect.mention, v => { project.protect.mention = v; }, { maxLength: 14 }))); kv.append(mkField("Étiquette", mkInput("text", project.protect.title, v => { project.protect.title = v; }, { maxLength: 48 }))); }
      if (s.id === "binder") kv.append(mkField("Classeur", mkSelect([["#1c1f29", "Anthracite"], ["#2a1a3d", "Prune"], ["#1a2a3d", "Marine"], ["#3d2a1a", "Cuir"], ["#eae6dc", "Crème"]], project.protect.binderColor, v => { project.protect.binderColor = v; })));
      const p = PROTECTIONS.find(x => x.id === s.id); const n = document.createElement("p"); n.className = "note"; n.textContent = p ? p.dims : ""; fields.append(kv, n);
    }
    resize(); ui.dirty = true;
  }
  function applyProtect(mode) {
    const pr = project.protect; protect.dataset.mode = mode === "binder" ? "none" : mode; protect.classList.toggle("matte", pr.sleeveFinish === "matte"); protect.style.setProperty("--sleeve-tint", pr.sleeveTint);
    $("#slabLabelTitle").textContent = pr.title; $("#slabLabelGrade").textContent = pr.grade; $("#slabLabelMention").textContent = pr.mention; $("#slabLabelSub").textContent = fmt().game + " · " + fmtDims().w + " × " + fmtDims().h + " mm";
    const binder = $("#binder");
    if (mode === "binder") { binder.hidden = false; binder.style.setProperty("--binder-color", pr.binderColor); protect.hidden = true; binder.innerHTML = ""; const snap = snapshotDoc(project.front, 360); for (let i = 0; i < 9; i++) { const pk = document.createElement("div"); pk.className = "pocket" + (i === 4 ? " live" : ""); if (i === 4) pk.append(card); else { const im = document.createElement("img"); im.alt = ""; im.src = snap; pk.append(im); } binder.append(pk); } }
    else { binder.hidden = true; protect.hidden = false; if (card.parentElement !== protect) protect.append(card); }
  }

  /* ---- product scenes (ported renderer): the live card snapshot is composited into the product ---- */
  const sceneCanvas = $("#sceneCanvas"); let sceneLast = 0;
  function renderScene(force) {
    if (!ui.scene || !T || sceneCanvas.hidden) return; const now = performance.now(); if (!force && now - sceneLast < 40) return; sceneLast = now;
    const s = SUPPORTS.find(x => x.id === ui.scene.id); const a = aspect(); const p = sPointer.v, r = sRotate.v;
    thumbCanvas.width = 630; thumbCanvas.height = Math.round(630 / a);
    const doc = ui.face === "back" ? project.back : project.front;
    const L = lightDef(); T.renderDoc(doc, { pointer: [p.x / 100, 1 - p.y / 100], tilt: [r.x * Math.PI / 180, -r.y * Math.PI / 180], aspect: a, intensity: ui.intensity * (0.5 + 0.5 * p.o), seed: ui.seed, selectedId: null, view: 0, light: { warm: L.warm, z: L.z } });
    const dpr = Math.min(window.devicePixelRatio || 1, 2); const cw = Math.min(980, bench.clientWidth - 40); const width = Math.round(cw * dpr), height = Math.round(width * 700 / 900);
    sceneCanvas.style.width = cw + "px"; sceneCanvas.style.height = Math.round(cw * 700 / 900) + "px";
    PrismScenes.draw(sceneCanvas, thumbCanvas, s.mode, { width, height, variant: project.variants[s.id] || s.variants[0][0], packSide: ui.face === "back" ? "back" : "front", background: false, count: project.pack.cards });
  }

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
      const pouch = document.createElement("div"); pouch.className = "pouch"; let ok = false;
      if (live && R) { const c = document.createElement("canvas"); pouch.append(c); try { PK = makeGL(c); ok = !!PK; } catch (e) { PK = null; } if (ok) ui.packCanvas = c; else pouch.innerHTML = ""; }
      if (!ok) { const im = document.createElement("img"); im.alt = ""; im.src = packImg; pouch.append(im); }
      for (const cls of ["crimp top", "crimp bottom", "seam", "gloss"]) { const d = document.createElement("div"); d.className = cls; b.append(d); }
      b.prepend(pouch); return b;
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
  for (const [id, key, num] of [["packTitle", "title", 0], ["packSub", "sub", 0], ["packsPerBox", "packs", 1], ["cardsPerPack", "cards", 1], ["boxColor", "boxColor", 0], ["packFinish", "finish", 0]]) $("#" + id).addEventListener("change", e => { project.pack[key] = num ? Math.max(1, +e.target.value || 1) : e.target.value; if (ui.page === "plans") { renderDieline(); renderPreflight(); } });
  (() => { let dragging = false, lx = 0, ly = 0, rx = -24, ry = -8; const sc = $("#packScene"); sc.addEventListener("pointerdown", e => { dragging = true; lx = e.clientX; ly = e.clientY; sc.setPointerCapture(e.pointerId); }); sc.addEventListener("pointermove", e => { if (dragging) { rx += (e.clientX - lx) * 0.4; ry -= (e.clientY - ly) * 0.3; ry = clamp(ry, -60, 60); lx = e.clientX; ly = e.clientY; const o = $("#packObj"); o.style.setProperty("--rx", rx + "deg"); o.style.setProperty("--ry", ry + "deg"); } const r = sc.getBoundingClientRect(); ui.packPointer = [clamp((e.clientX - r.left) / r.width, 0, 1), 1 - clamp((e.clientY - r.top) / r.height, 0, 1)]; ui.packDirty = true; }); sc.addEventListener("pointerup", () => dragging = false); sc.addEventListener("pointercancel", () => dragging = false); })();

  /* ---- dielines ---- */
  const DIELINE_OPTS = [["card", "Carte"], ["booster", "Booster"], ["display", "Présentoir"], ["etb", "Coffret"], ["deckbox", "Deck box"]];
  const boxOf = k => k === "display" ? [project.dieline.boxW, project.dieline.boxH, project.dieline.boxD] : k === "etb" ? [191, 165, 89] : [72, 95, 45];
  function snapshotArtwork(doc, px, bleed) { if (!T) return null; const d = fmtDims(); const c = renderDocMM(doc, d.w, d.h, bleed, px / ((d.w + 2 * bleed) / 25.4), { view: 0 }); return c ? c.toDataURL("image/jpeg", 0.85) : null; }
  function currentDieline(withArt) {
    const d = fmtDims(); const pr = project.print; const k = project.dieline.kind; const p = project.pack; const hasBack = project.back.layers.some(l => l.visible && l.src);
    if (k === "card") return cardDieline(d.w, d.h, d.r, pr.bleed, pr.safe, { image: withArt ? snapshotArtwork(project.front, 300, pr.bleed) : null });
    const art = withArt ? snapshotDoc(project.front, 300, [0.5, 0.5], [0, 0]) : null;
    if (k === "booster") return boosterDieline(p.boosterW, p.boosterH, p.crimp, p.fin, pr.bleed, pr.safe, { image: art, back: withArt && hasBack ? snapshotDoc(project.back, 300, [0.5, 0.5], [0, 0]) : null });
    const dims = boxOf(k); return tuckBoxDieline(dims[0], dims[1], dims[2], pr.bleed, pr.safe, { image: art, sideColor: withArt ? p.boxColor : null, title: withArt ? p.title : null });
  }
  function renderDieline() {
    const view = $("#dielineView"); const r = currentDieline(project.dieline.showArt); view.innerHTML = r.svg; const svg = view.querySelector("svg"); if (svg) { svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.width = "100%"; }
    const k = project.dieline.kind; const d = fmtDims(); const p = project.pack; const dims = boxOf(k);
    $("#dlTitle").textContent = { card: "Carte", booster: "Booster déplié", display: "Présentoir déplié", etb: "Coffret déplié", deckbox: "Deck box dépliée" }[k];
    $("#dlFoot").textContent = `Feuille ${r.wmm.toFixed(0)} × ${r.hmm.toFixed(0)} mm · fond perdu ${project.print.bleed} mm · sécurité ${project.print.safe} mm · SVG ≈ ${(r.svg.length / 1024).toFixed(0)} Ko`;
    $("#dlDims").textContent = k === "card" ? `${d.w} × ${d.h} mm` : k === "booster" ? `${p.boosterW} × ${p.boosterH} mm` : `${dims[0]} × ${dims[1]} × ${dims[2]} mm`;
    $("#dlDimsNote").textContent = k === "card" ? `Format fini, angles r ${d.r} mm, épaisseur 0,33 mm. Fichier avec fond perdu : ${d.w + 2 * project.print.bleed} × ${d.h + 2 * project.print.bleed} mm.` : k === "booster" ? `Dimensions du sachet mesuré à plat. Film ${2 * p.boosterW + p.fin} × ${p.boosterH} mm.` : "Boîte à rabats (straight tuck end), dimensions intérieures.";
    const stack = (p.cards * 0.33).toFixed(2).replace(".", ","); const fits = k === "booster" ? (p.boosterW - 2 * 3 >= d.w && p.boosterH - 2 * p.crimp - 2 >= d.h) : true;
    $("#stackNote").textContent = `Pile : ${p.cards} × 0,33 mm = ${stack} mm. Format des cartes : ${d.w} × ${d.h} mm.` + (k === "booster" ? (fits ? ` La pile tient avec ${((p.boosterW - d.w) / 2).toFixed(1).replace(".", ",")} mm de jeu par côté.` : " Attention : le sachet est trop petit pour les cartes.") : "");
    $("#dlBooster").hidden = k !== "booster"; $("#dlBox").hidden = k !== "display";
    for (const b of $$("#dlArtSeg [data-art]")) b.setAttribute("aria-pressed", String((b.dataset.art === "1") === !!project.dieline.showArt));
  }
  function renderDielineOpts() { const el = $("#dielineOpts"); el.innerHTML = ""; for (const [id, name] of DIELINE_OPTS) { const b = document.createElement("button"); b.type = "button"; b.textContent = name; b.setAttribute("aria-pressed", String(project.dieline.kind === id)); b.addEventListener("click", () => { project.dieline.kind = id; renderDielineOpts(); renderDieline(); }); el.append(b); } }
  for (const [id, obj, key] of [["bleed", "print", "bleed"], ["safe", "print", "safe"], ["dpi", "print", "dpi"], ["boosterW", "pack", "boosterW"], ["boosterH", "pack", "boosterH"], ["crimp", "pack", "crimp"], ["fin", "pack", "fin"], ["boxW", "dieline", "boxW"], ["boxH", "dieline", "boxH"], ["boxD", "dieline", "boxD"]]) $("#" + id).addEventListener("change", e => { const v = +e.target.value; if (!isFinite(v)) return; project[obj][key] = v; if (ui.page === "plans") { renderDieline(); renderPreflight(); } resize(); });
  for (const b of $$("#dlArtSeg [data-art]")) b.addEventListener("click", () => { project.dieline.showArt = b.dataset.art === "1"; renderDieline(); });
  $("#boxAuto").addEventListener("click", () => { const [w, h, d] = boxDims(project.pack.packs); project.dieline.boxW = w; project.dieline.boxH = h; project.dieline.boxD = d; $("#boxW").value = w; $("#boxH").value = h; $("#boxD").value = d; renderDieline(); });
  $("#dlExportSvg").addEventListener("click", () => exportSvg());
  function exportSvg() { const r = currentDieline(false); saveFile(`plan-de-decoupe_${project.dieline.kind}.svg`, new Blob([r.svg], { type: "image/svg+xml" })); }
  $("#dlPrint").addEventListener("click", () => {
    const r = currentDieline(project.dieline.showArt); const html = `<!doctype html><html><head><meta charset="utf-8"><title>Plan de découpe</title><style>@page{size:${r.wmm > r.hmm ? "landscape" : "portrait"};margin:8mm}body{margin:0}svg{width:${r.wmm}mm;height:${r.hmm}mm;display:block}</style></head><body>${r.svg}<script>setTimeout(()=>window.print(),400)<\/script></body></html>`;
    const w = window.open("", "_blank"); if (!w) { toast("Fenêtre bloquée : télécharge le SVG et imprime-le à 100 %"); return; } w.document.write(html); w.document.close();
  });
  async function exportFlat() {
    if (!T) { toast("WebGL indisponible"); return; } const d = fmtDims(), pr = project.print, p = project.pack, k = project.dieline.kind; let c;
    if (k === "card") c = artworkCanvas(project.front, d.w, d.h, pr.bleed, pr.dpi);
    else { const front = artworkCanvas(project.front, d.w, d.h, 0, 150); const back = project.back.layers.some(l => l.visible && l.src) ? artworkCanvas(project.back, d.w, d.h, 0, 150) : null;
      if (k === "booster") c = flatBoosterCanvas(front, back, p.boosterW, p.boosterH, p.crimp, p.fin, pr.bleed, 150, p.boxColor); else { const dims = boxOf(k); c = flatBoxCanvas(front, dims[0], dims[1], dims[2], pr.bleed, 150, p.boxColor, p.title); } }
    if (c) saveFile(`maquette-a-plat_${k}.png`, await toBlob(c));
  }
  $("#dlExportPng").addEventListener("click", exportFlat);
  function renderPreflight() {
    const el = $("#preflight"); el.innerHTML = ""; const d = fmtDims(); const b = project.print.bleed; let warn = 0; const add = (ok, txt) => { const r = document.createElement("div"); r.className = ok ? "ok" : "warn"; const i = document.createElement("i"); const s = document.createElement("span"); s.textContent = txt; r.append(i, s); el.append(r); if (!ok) warn++; };
    for (const [face, doc] of [["Recto", project.front], ["Verso", project.back]]) {
      const imgs = doc.layers.filter(l => l.kind === "image" && l.visible && l.src);
      if (!imgs.length) { add(face === "Recto" ? false : true, `${face} : ${face === "Recto" ? "aucune illustration importée" : "pas d'image, motif généré"}`); continue; }
      for (const l of imgs) { const wmm = l.scale * d.w; const dpi = l.w / (wmm / 25.4); add(dpi >= 300, `${face} · « ${l.name} » : ${Math.round(dpi)} dpi à l'impression (${l.w} × ${l.h} px)` + (dpi >= 300 ? "" : " — vise 300 dpi ou plus")); const hmm = wmm * l.h / l.w; const coversBleed = wmm >= d.w + 2 * b - 0.01 && hmm >= d.h + 2 * b - 0.01 && Math.abs(l.x - 0.5) * d.w <= (wmm - d.w - 2 * b) / 2 + 0.01 && Math.abs(l.y - 0.5) * d.h <= (hmm - d.h - 2 * b) / 2 + 0.01; add(coversBleed, coversBleed ? `${face} · le visuel couvre le fond perdu de ${b} mm` : `${face} · le visuel ne couvre pas le fond perdu (${b} mm) : agrandis-le ou recentre-le`); }
    }
    add(project.print.safe >= 2, `Sécurité ${project.print.safe} mm` + (project.print.safe >= 2 ? "" : " : 3 mm recommandés"));
    const badge = $("#preBadge"); badge.textContent = warn ? `${warn} point${warn > 1 ? "s" : ""} à vérifier` : "Prêt"; badge.className = "badge " + (warn ? "warn" : "ok");
  }

  /* ---- references (help) ---- */
  function renderRef() {
    const mkTable = (heads, rows) => { const t = document.createElement("table"); t.className = "ref"; const hr = document.createElement("tr"); for (const h of heads) { const th = document.createElement("th"); th.textContent = h; hr.append(th); } t.append(hr); for (const row of rows) { const tr = document.createElement("tr"); row.forEach((v, i) => { const td = document.createElement("td"); if (i > 0) td.className = "mono"; td.textContent = v; tr.append(td); }); t.append(tr); } return t; };
    $("#refFormats").append(mkTable(["Jeu", "Format", "Rayon", "Boosters"], FORMATS.map(f => [f.game, `${f.w} × ${f.h} mm`, `≈ ${f.r} mm`, f.group === "other" ? "—" : `${f.pack.cards} c. · ${f.pack.packs} b.`])));
    const pr = $("#protectRef"); const t2 = mkTable(["Protection", "Dimensions"], PROTECTIONS.slice(1).map(p => [p.name, p.dims])); for (const td of t2.querySelectorAll("td.mono")) { td.className = ""; } pr.append(t2);
    $("#packRef").append(mkTable(["Jeu", "Cartes / booster", "Boosters / display"], FORMATS.filter(f => f.group !== "other").map(f => [f.game, f.pack.cards, f.pack.packs])));
    const gl = $("#refFinishes");
    for (const g of FINISH_GLOSSARY) { const box = document.createElement("div"); box.className = "g"; const b = document.createElement("b"); b.textContent = g.game; box.append(b); for (const [name, desc, preset] of g.items) { const p = document.createElement("p"); const nb = document.createElement("b"); nb.textContent = name + " · "; nb.style.display = "inline"; nb.style.fontSize = "inherit"; p.append(nb, desc); box.append(p); const tags = document.createElement("div"); tags.className = "tags"; const bt = document.createElement("button"); bt.type = "button"; bt.className = "pill"; bt.textContent = "Appliquer « " + (PRESET_BY_ID[preset]?.label || preset) + " »"; bt.addEventListener("click", () => { const l = sel(); if (!l) { toast("Importe d'abord une illustration"); return; } applyPreset(l, preset); syncInspector(); refreshLayers(); commit(); closeMenus(); }); tags.append(bt); box.append(tags); } gl.append(box); }
    const src = $("#refSources"); const h = document.createElement("h3"); h.textContent = "Sources consultées"; src.append(h); const ul = document.createElement("ul"); ul.style.margin = "6px 0 0"; ul.style.paddingLeft = "18px"; ul.style.fontSize = "12px"; for (const [t, u] of SOURCES) { const li = document.createElement("li"); const a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; a.textContent = t; li.append(a); ul.append(li); } src.append(ul);
    const n = document.createElement("p"); n.className = "note"; n.style.marginTop = "8px"; n.textContent = "Les valeurs marquées ≈ sont approximatives ; vérifie-les auprès de l'imprimeur avant production."; src.append(n);
  }

  /* ---- zoom and pan ---- */
  function applyZoom() { stagewrap.style.transform = `translate(${ui.panX}px, ${ui.panY}px) scale(${ui.zoom})`; $("#zoomOutp").value = Math.round(ui.zoom * 100) + " %"; }
  function zoomTo(z, cx, cy) { z = clamp(z, 0.4, 5); if (cx !== undefined) { const k = z / ui.zoom; ui.panX = cx - (cx - ui.panX) * k; ui.panY = cy - (cy - ui.panY) * k; } ui.zoom = z; applyZoom(); }
  bench.addEventListener("wheel", e => { e.preventDefault(); const r = bench.getBoundingClientRect(); const cx = e.clientX - r.left - r.width / 2, cy = e.clientY - r.top - r.height / 2; zoomTo(ui.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), cx, cy); }, { passive: false });
  $("#zoomIn").addEventListener("click", () => zoomTo(ui.zoom * 1.25, 0, 0)); $("#zoomOut").addEventListener("click", () => zoomTo(ui.zoom / 1.25, 0, 0)); $("#zoomFit").addEventListener("click", () => { ui.zoom = 1; ui.panX = ui.panY = 0; applyZoom(); });
  $("#panMode").addEventListener("click", () => { ui.panMode = !ui.panMode; $("#panMode").setAttribute("aria-pressed", String(ui.panMode)); bench.classList.toggle("panning", ui.panMode); });
  document.addEventListener("keydown", e => { if (e.code === "Space" && !/input|textarea|select|button/i.test(document.activeElement?.tagName || "")) { ui.space = true; bench.classList.add("panning"); e.preventDefault(); } });
  document.addEventListener("keyup", e => { if (e.code === "Space") { ui.space = false; bench.classList.toggle("panning", ui.panMode); } });
  const pointers = new Map(); let panDrag = null, pinch = null, painting = false;
  const brushCursor = $("#brushCursor");
  bench.addEventListener("pointerdown", e => {
    if (!$("#packScene").hidden || e.target.closest(".stage__light")) return;
    if (ui.scene && ui.page === "maquettes") { if (ui.panMode || ui.space || e.button === 1) { panDrag = { x: e.clientX, y: e.clientY, px: ui.panX, py: ui.panY }; bench.setPointerCapture(e.pointerId); return; } ui.drag = true; bench.setPointerCapture(e.pointerId); interact(e, true); return; }
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: ui.zoom }; panDrag = null; if (ui.drag) { ui.drag = null; interactEnd(); } return; }
    if (ui.picking) { pickAt(e); return; }
    if (ui.brush && card.contains(e.target)) { const l = sel(); if (l) { painting = true; bench.setPointerCapture(e.pointerId); paintAt(l, e); } return; }
    if (ui.panMode || ui.space || e.button === 1 || !card.contains(e.target)) { panDrag = { x: e.clientX, y: e.clientY, px: ui.panX, py: ui.panY }; bench.setPointerCapture(e.pointerId); return; }
    ui.drag = true; bench.setPointerCapture(e.pointerId); interact(e, true);
  });
  bench.addEventListener("pointermove", e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (ui.brush) { const r = bench.getBoundingClientRect(); const l = sel(); const px = ui.brushSize / 100 * card.clientWidth * ui.zoom; brushCursor.style.left = (e.clientX - r.left) + "px"; brushCursor.style.top = (e.clientY - r.top) + "px"; brushCursor.style.width = brushCursor.style.height = px + "px"; if (painting && l) { paintAt(l, e); return; } }
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomTo(pinch.z * d / pinch.d, 0, 0); return; }
    if (panDrag) { ui.panX = panDrag.px + (e.clientX - panDrag.x); ui.panY = panDrag.py + (e.clientY - panDrag.y); applyZoom(); return; }
    if (!$("#packScene").hidden) return;
    if (ui.drag) { interact(e, true); return; }
    if (lightDef().kind !== "follow") return;
    if ((ui.scene && ui.page === "maquettes") || card.contains(e.target)) interact(e, false); else if (interacting) interactEnd();
  });
  const endPtr = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; panDrag = null; if (painting) { painting = false; commit(); } if (ui.drag) { ui.drag = null; interactEnd(); } else if (e.pointerType !== "mouse" && interacting) interactEnd(); };
  bench.addEventListener("pointerup", endPtr); bench.addEventListener("pointercancel", endPtr);
  bench.addEventListener("pointerleave", () => { if (!ui.drag && !panDrag && lightDef().kind === "follow") interactEnd(); });

  /* ---- springs and render loop ---- */
  class Spring { constructor(v, k, d) { this.v = { ...v }; this.last = { ...v }; this.target = { ...v }; this.stiffness = k; this.damping = d; } set(t) { Object.assign(this.target, t); } tick(dt) { for (const k in this.v) { const delta = this.target[k] - this.v[k]; const vel = (this.v[k] - this.last[k]) / (dt || 1); const d = (vel + (this.stiffness * delta - this.damping * vel)) * dt; this.last[k] = this.v[k]; if (Math.abs(d) < 0.0005 && Math.abs(delta) < 0.0005) { this.v[k] = this.target[k]; } else this.v[k] += d; } } settled() { for (const k in this.v) if (this.v[k] !== this.target[k]) return false; return true; } }
  const sRotate = new Spring({ x: 0, y: 0 }, 0.066, 0.25), sPointer = new Spring({ x: 50, y: 50, o: 0 }, 0.066, 0.25);
  const setSprings = (k, d) => { for (const s of [sRotate, sPointer]) { s.stiffness = k; s.damping = d; } };
  let interacting = false, idle = true, idleTimer = null, lastT = performance.now(), showcaseR = 0;
  function interact(e, tilt) {
    interacting = true; idle = false; clearTimeout(idleTimer); const rect = (ui.scene && ui.page === "maquettes") ? bench.getBoundingClientRect() : card.getBoundingClientRect();
    const px = clamp(round((100 / rect.width) * (e.clientX - rect.left)), -40, 140), py = clamp(round((100 / rect.height) * (e.clientY - rect.top)), -40, 140);
    setSprings(0.066, 0.25); if (lightDef().kind === "follow") sPointer.set({ x: clamp(px), y: clamp(py), o: 1 });
    if (tilt) sRotate.set({ x: round(((clamp(px) - 50) / 50) * ui.tilt), y: round(-((clamp(py) - 50) / 50) * ui.tilt) });
  }
  function interactEnd(hard) { interacting = false; setSprings(hard ? 0.09 : 0.045, hard ? 0.35 : 0.32); const a = ANGLES[ui.angle]; sRotate.set({ x: a[1], y: a[2] }); const L = lightDef(); if (L.kind === "fixed") sPointer.set({ x: L.x, y: L.y, o: 1 }); else if (L.kind === "follow") sPointer.set({ x: 50, y: 50, o: ui.angle ? 0.6 : 0 }); clearTimeout(idleTimer); idleTimer = setTimeout(() => { idle = true; }, 2500); }
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function showcase() { const L = lightDef(); if (L.kind !== "anim" || reduceMotion) return; showcaseR += L.fn === LIGHTS[LIGHTS.length - 1][3].fn ? 0.05 : 0.012; sPointer.stiffness = 0.04; sPointer.damping = 0.5; const [x, y] = L.fn(showcaseR); sPointer.set({ x, y, o: 0.95 }); }
  for (const b of $$("[data-view]")) b.addEventListener("click", () => { ui.view = +b.dataset.view; for (const o of $$("[data-view]")) o.setAttribute("aria-pressed", String(o === b)); });
  function frame(now) {
    const dt = Math.min(3, (now - lastT) * 60 / 1000); lastT = now; showcase(); sRotate.tick(dt); sPointer.tick(dt);
    const r = sRotate.v, p = sPointer.v; tiltEl.style.setProperty("--rotate-x", r.x.toFixed(3) + "deg"); tiltEl.style.setProperty("--rotate-y", r.y.toFixed(3) + "deg");
    const L = lightDef(); const o = { pointer: [p.x / 100, 1 - p.y / 100], tilt: [r.x * Math.PI / 180, -r.y * Math.PI / 180], aspect: aspect(), intensity: ui.intensity * (0.35 + 0.65 * p.o), seed: ui.seed, selectedId: ui.selId, view: ui.view, light: { warm: L.warm, z: L.z } };
    const moving = interacting || (L.kind === "anim" && !reduceMotion) || now < ui.flipping || ui.dirty || !sRotate.settled() || !sPointer.settled();
    if (R && $("#packScene").hidden && !ui.scene && moving) {
      ui.dirty = false; const back = ui.face === "back"; const both = now < ui.flipping; if (both) ensureBack(); resize();
      if (!back || both) R.renderDoc(project.front, { ...o, selectedId: ui.selDoc === "front" ? ui.selId : null });
      if (back || both) { const g = ensureBack(); if (g) g.renderDoc(project.back, { ...o, tilt: [-o.tilt[0], o.tilt[1]], pointer: [1 - o.pointer[0], o.pointer[1]], selectedId: ui.selDoc === "back" ? ui.selId : null }); }
    }
    if (ui.scene && ui.page === "maquettes" && moving) renderScene(false);
    if (PK && !$("#packScene").hidden && ui.packCanvas && ui.packDocCache && (ui.packDirty || lightDef().kind === "anim")) { ui.packDirty = false; const c = ui.packCanvas; const dpr = Math.min((window.devicePixelRatio || 1) * ui.quality, 3); const w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr)); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } const pp = ui.packPointer || [0.4, 0.7]; PK.renderDoc(ui.packDocCache, { pointer: pp, tilt: [(pp[0] - 0.5) * 0.5, (pp[1] - 0.5) * 0.4], aspect: project.pack.boosterW / project.pack.boosterH, intensity: 1, seed: ui.seed, selectedId: null, view: 0 }); }
    requestAnimationFrame(frame);
  }

  /* ---- export, project, autosave ---- */
  let toastTimer = null; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800); }
  async function saveFile(name, data) {
    if (window.claude && typeof window.claude.use === "function") { const dl = await window.claude.use("downloads").catch(() => null); if (dl) { try { await dl.save({ filename: name, data }); toast("Enregistré : " + name); } catch (e) { if (!e || e.code !== "declined") toast("Enregistrement indisponible ici"); } return; } }
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); const a = document.createElement("a"); a.href = url; a.download = name; document.body.append(a); try { a.click(); } catch (e) {} a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function ensureZipUnused() { if (typeof JSZip !== "undefined") return Promise.resolve(true); const urls = ["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js", "https://unpkg.com/jszip@3.10.1/dist/jszip.min.js"]; return urls.reduce((pr, u) => pr.then(ok => ok || new Promise(res => { const sc = document.createElement("script"); sc.src = u; sc.onload = () => res(typeof JSZip !== "undefined"); sc.onerror = () => res(false); document.head.append(sc); })), Promise.resolve(false)); }
  async function capturePng() { if (!R) return; const src = ui.face === "back" ? canvasBack : canvas; $("#captureImg").src = src.toDataURL("image/png"); $("#captureBox").hidden = false; const blob = await toBlob(src); if (blob) saveFile("prisme-" + (ui.face === "back" ? "verso" : "recto") + ".png", blob); }
  $("#captureClose").addEventListener("click", () => { $("#captureBox").hidden = true; });
  for (const b of $$("[data-export]")) b.addEventListener("click", () => { closeMenus(); const k = b.dataset.export; if (k === "png") capturePng(); else if (k === "svg") exportSvg(); else if (k === "flat") exportFlat(); else if (k === "pdf") exportPdf().catch(err => { console.error(err); toast("Export PDF impossible : " + (err && err.message || err)); }); else if (k === "save") saveProject(); else if (k === "print") exportPrintFiles().catch(err => { console.error(err); toast("Export impossible : " + (err && err.message || err)); }); });
  function serializeLayer(l, maxPx = 1600, q = 1) { const o = { id: l.id, kind: l.kind, name: l.name, x: l.x, y: l.y, scale: l.scale, rot: l.rot, opacity: l.opacity, blend: l.blend, visible: l.visible, fx: l.fx, picks: l.picks, pickTol: l.pickTol, win: l.win, presetId: l.presetId, text: l.text, frame: l.frame, bg: l.bg, badge: l.badge }; if (l.kind === "image" && l.assetId) o.src = "lib:" + l.assetId; else if (l.kind === "image" && l.src) { const w = Math.min(maxPx, l.w); const [c, x] = cv(w, Math.round(w * l.h / l.w)); x.drawImage(l.src, 0, 0, c.width, c.height); const alpha = l.analysis && l.analysis.hasAlpha; o.src = (q < 1 && !alpha) ? c.toDataURL("image/jpeg", q) : c.toDataURL("image/png"); } if (l.maskImg) { const [c, x] = cv(512, Math.round(512 * l.h / l.w)); x.drawImage(l.maskImg, 0, 0, c.width, c.height); o.mask = c.toDataURL("image/png"); } return o; }
  function projectData(maxPx, q) { return { version: 3, formatId: project.formatId, custom: project.custom, edge: project.edge, coatKind: project.coatKind, coat: project.coat, print: project.print, protect: project.protect, pack: project.pack, dieline: project.dieline, backStyle: project.backStyle, support: project.support, front: { stock: project.front.stock, layers: project.front.layers.map(l => serializeLayer(l, maxPx, q)) }, back: { stock: project.back.stock, layers: project.back.layers.map(l => serializeLayer(l, maxPx, q)) } }; }
  function saveProject() { saveFile("prisme-projet.json", new Blob([JSON.stringify(projectData())], { type: "application/json" })); }
  $("#loadProject").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { loadProjectData(JSON.parse(rd.result)); toast("Projet ouvert"); } catch (err) { console.error(err); toast("Fichier de projet illisible"); } }; rd.readAsText(f); e.target.value = ""; });
  /* local persistence: IndexedDB (large projects), localStorage as fallback */
  function idb() { return new Promise((res, rej) => { if (!window.indexedDB) return rej(new Error("no idb")); const req = indexedDB.open("prisme-studio", 1); req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains("projects")) req.result.createObjectStore("projects"); }; req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); }
  function idbGet(key) { return idb().then(db => new Promise((res, rej) => { const tx = db.transaction("projects", "readonly"); const g = tx.objectStore("projects").get(key); g.onsuccess = () => res(g.result); g.onerror = () => rej(g.error); })); }
  function idbSet(key, value) { return idb().then(db => new Promise((res, rej) => { const tx = db.transaction("projects", "readwrite"); tx.objectStore("projects").put(value, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); })); }
  let saveTimer = null;
  function autosave() { clearTimeout(saveTimer); saveTimer = setTimeout(async () => { const stamp = () => { $("#saveState").textContent = "Enregistré localement · " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }; try { await idbSet("atelier", projectData(1600, 0.9)); stamp(); return; } catch (e) {} try { localStorage.setItem("prisme-project", JSON.stringify(projectData(1000, 0.82))); stamp(); } catch (e) { $("#saveState").textContent = "Projet trop lourd pour la sauvegarde automatique : utilise Exporter → Enregistrer le projet"; } }, 800); }
  function loadProjectData(d) {
    history.muted = true;
    project.formatId = FORMATS.some(f => f.id === d.formatId) ? d.formatId : "pokemon"; Object.assign(project.custom, d.custom || {}); project.edge = d.edge || ""; project.coatKind = d.coatKind || "gloss"; project.coat = d.coat ?? 60; Object.assign(project.print, d.print || {}); Object.assign(project.protect, d.protect || {}); Object.assign(project.pack, d.pack || {}); Object.assign(project.dieline, d.dieline || {}); Object.assign(project.backStyle, d.backStyle || {}); project.support = d.support || "booster";
    let pending = 0; const done = () => { if (--pending <= 0) { history.muted = false; refreshLayers(); syncInspector(); invalidateThumbs(); commit(); } };
    for (const id of ["front", "back"]) { for (const l of project[id].layers) for (const g of [R, RB, T, PK]) if (g) g.drop(l.id); project[id].layers = []; project[id].stock = (d[id] && d[id].stock) || project[id].stock;
      for (const s of (d[id] && d[id].layers) || []) { const l = newLayer(s.kind, s.name); if (s.id) l.id = s.id; Object.assign(l, { x: s.x, y: s.y, scale: s.scale, rot: s.rot, opacity: s.opacity, blend: s.blend, visible: s.visible, fx: { ...base, ...s.fx }, picks: s.picks || [], pickTol: s.pickTol ?? 0.22, win: s.win || l.win, presetId: PRESET_BY_ID[s.presetId] ? s.presetId : "i-none", text: { ...l.text, ...s.text }, frame: { ...l.frame, ...s.frame }, bg: { ...l.bg, ...s.bg }, badge: { ...l.badge, ...s.badge } }); project[id].layers.push(l);
        if (s.kind === "image" && s.src && s.src.startsWith("lib:")) { const art = ART_LIBRARY.find(a => a.id === s.src.slice(4)); if (art) { pending++; l.assetId = art.id; loadArt(art).then(im => { setSrc(l, im); done(); }).catch(done); } }
        else if (s.kind === "image" && s.src) { pending++; const im = new Image(); im.onload = () => { setSrc(l, im); done(); }; im.onerror = done; im.src = s.src; } else regen(l);
        if (s.mask) { const mi = new Image(); mi.onload = () => { l.maskImg = mi; l.maskVersion++; ui.dirty = true; }; mi.src = s.mask; } } }
    $("#packTitle").value = project.pack.title; $("#packSub").value = project.pack.sub; $("#packsPerBox").value = project.pack.packs; $("#cardsPerPack").value = project.pack.cards; $("#boxColor").value = project.pack.boxColor; $("#packFinish").value = PRESET_BY_ID[project.pack.finish] ? project.pack.finish : "h-oil"; $("#boosterW").value = project.pack.boosterW; $("#boosterH").value = project.pack.boosterH; $("#crimp").value = project.pack.crimp; $("#fin").value = project.pack.fin; $("#boxW").value = project.dieline.boxW; $("#boxH").value = project.dieline.boxH; $("#boxD").value = project.dieline.boxD;
    syncGlobalsToUI(); ui.selDoc = "front"; ui.selId = project.front.layers[project.front.layers.length - 1]?.id || null; ui.face = "front"; flipEl.style.setProperty("--flip", "0deg"); for (const b of $$("[data-face]")) b.setAttribute("aria-pressed", String(b.dataset.face === "front")); applyFormat(); renderFormats(); renderSupports(); renderDielineOpts(); if (ui.page !== "atelier") setPage("atelier"); if (pending === 0) done();
  }

  /* ---- boot ---- */
  document.documentElement.dataset.theme = document.documentElement.dataset.theme || "light";
  const patSel = $("#pattern"); for (const [k, v] of Object.entries(P)) { const o = document.createElement("option"); o.value = v; o.textContent = PATTERN_LABELS[k]; patSel.append(o); }
  const palSel = $("#palette"); PALETTES.forEach((n, i) => { const o = document.createElement("option"); o.value = i; o.textContent = n; palSel.append(o); });
  const tintSel = $("#tint"); for (const [k, lab] of Object.entries(TINT_LABELS)) { const o = document.createElement("option"); o.value = k; o.textContent = lab; tintSel.append(o); }
  const accSel = $("#accentType"); for (const a of ACCENTS) { const o = document.createElement("option"); o.value = a.type; o.textContent = a.label; accSel.append(o); }
  renderFormats(); renderCatTabs(); renderSupports(); renderDielineOpts(); renderRef();
  $("#fmtFilter").addEventListener("input", renderFormats);
  function defaultProject() {
    const art = ART_LIBRARY[0]; const l = newLayer("image", art.name); l.assetId = art.id; project.front.layers.push(l); ensureBackLayer(); ui.selDoc = "front"; ui.selId = l.id;
    applyPreset(l, "f-gold"); l.fx.mask = 10; l.fx.maskThr = 0.4; syncGlobalsToUI(); applyFormat(); refreshLayers(); syncInspector();
    loadArt(art).then(im => { setSrc(l, im); fitLayer(l, "cover"); applyFormat(); refreshLayers(); syncInspector(); invalidateThumbs(); ui.dirty = true; commit(); }).catch(() => { setSrc(l, makeFox()); fitLayer(l, "cover"); refreshLayers(); syncInspector(); commit(); });
  }
  (async () => {
    let restored = false;
    if (!params.get("fresh")) { try { let d = await idbGet("atelier").catch(() => null); if (!d) { const saved = localStorage.getItem("prisme-project"); if (saved) d = JSON.parse(saved); } if (d && d.version === 3 && d.front && d.front.layers.length) { loadProjectData(d); restored = true; } } catch (e) { console.warn(e); } }
    if (!restored) defaultProject();
  })();
  applyZoom(); updateUndo(); requestAnimationFrame(frame);
  if (document.fonts && document.fonts.load) Promise.all(["700 40px Unbounded", "800 40px Cinzel", "700 40px Manrope"].map(f => document.fonts.load(f).catch(() => null))).then(() => { for (const doc of [project.front, project.back]) for (const l of doc.layers) if (l.kind === "text" || l.kind === "badge" || l.kind === "back") regen(l); renderBacks(); ui.dirty = true; });
  window.Prisme = { renderScene, setLight, LIGHTS, project, ui, PRESETS, FORMATS, sel, applyPreset, setPage, setFace, addImageLayer, snapshotDoc, exportPrintFiles, currentDieline, selectFormat, commit };
