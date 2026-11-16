  /* ================= Application (Layrys: print studio for trading cards) ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const round = (v, p = 3) => parseFloat(v.toFixed(p));
  const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
  const uid = () => Math.random().toString(36).slice(2, 9);
  const ICO = (n, s) => `<svg class="ic${s ? " s" : ""}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const FX_KEYS = Object.keys(base);
  const presetFx = p => { const o = {}; for (const k of FX_KEYS) o[k] = p[k]; return o; };
  const MASK_LABEL = { 0: "partout", 1: "intérieur", 2: "bordure", 4: "zone peinte", 5: "clairs", 6: "sombres", 7: "fond", 8: "une couleur", 9: "sujet", 10: "contours", 11: "peu saturé", 12: "couleurs vives", 13: "motif" };
  const KIND_LABEL = { image: "Image", text: "Texte", frame: "Cadre", bg: "Fond", badge: "Badge", back: "Dos" };
  const CORE_COLORS = { "black core": "#26262b", "blue core": "#2a3a7a", "white core": "#eceae4" };
  const NUANCIER = [["pick", "Sélection"], ["holo", "Holo"], ["foil", "Métaux"], ["varnish", "Vernis"], ["emboss", "Textures"], ["ink", "Encres"], ["combo", "Combinaisons"]];
  const PICKS = ["h-rainbow", "f-gold", "h-etched", "v-3d", "e-image", "i-silver", "h-mosaic", "h-starfoil", "h-shatter", "h-lava", "i-uv", "i-glow"];
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
  const LIGHTS = [
    ["studio", "Lumière studio", "suit le curseur", { kind: "follow", warm: 0, z: 1 }],
    ["soft", "Studio diffus", "suit le curseur, large", { kind: "follow", warm: 0, z: 1.7 }],
    ["spot", "Spot serré", "suit le curseur, dur", { kind: "follow", warm: 0, z: 0.55 }],
    ["warm", "Soleil chaud", "suit le curseur", { kind: "follow", warm: 0.7, z: 1.1 }],
    ["cold", "Néon froid", "suit le curseur", { kind: "follow", warm: -0.7, z: 1 }],
    ["manual", "Lampe réglable", "position, hauteur, intensité et température au choix", { kind: "fixed", manual: 1, x: 30, y: 22, warm: 0, z: 1 }],
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
    ["uv", "Lampe UV", "révèle les encres UV et fluo", { kind: "fixed", x: 50, y: 34, warm: -0.25, z: 1.4, env: 1 }],
    ["dark", "Dans le noir", "révèle les encres phosphorescentes", { kind: "fixed", x: 50, y: 40, warm: 0, z: 1.3, env: 2 }],
  ];
  /* the adjustable lamp: where it stands over the card (percent), its height, its power and its warmth */
  const ML = Object.assign({ x: 30, y: 22, z: 1, warm: 0, power: 1, soft: 0.2 }, (() => { try { return JSON.parse(localStorage.getItem("layrys-lamp") || "{}"); } catch (e) { return {}; } })());
  const lightDef = () => { const d = (LIGHTS.find(l => l[0] === ui.light) || LIGHTS[0])[3]; const o = { ...d, z: (d.z || 1) * ML.z, warm: Math.max(-1, Math.min(1, (d.warm || 0) + ML.warm)), power: ML.power, soft: ML.soft }; if (d.manual) { o.x = ML.x; o.y = ML.y; } return o; };
  const ANGLES = [["De face", 0, 0], ["Inclinée à gauche", -16, 4], ["Inclinée à droite", 16, 4], ["Vue plongeante", 0, 14], ["Vue rasante", 24, -10]];

  const project = {
    formatId: "pokemon", custom: { w: 63, h: 88, r: 3 },
    front: { id: "front", layers: [], stock: "#f6f3ec", coat: 0.6 }, back: { id: "back", layers: [], stock: "#f6f3ec", coat: 0.6 },
    edge: "", coatKind: "gloss", coat: 60,
    print: { bleed: 3, safe: 3, dpi: 300, core: "black core" },
    protect: { mode: "none", sleeveFinish: "clear", sleeveTint: "transparent", grade: "10", mention: "GEM MINT", title: "2026 LAYRYS", binderColor: "#1c1f29" },
    pack: { kind: "booster", title: "SÉRIE 01", sub: "BOOSTER", packs: 36, cards: 10, boxColor: "#1b1d2a", finish: "h-oil", boosterW: 67, boosterH: 117, crimp: 10, fin: 12 },
    dieline: { kind: "card", boxW: 135, boxH: 122, boxD: 74, showArt: true },
    backStyle: { style: "official", c1: "#1c2f6b", c2: "#e8b44a", text: "", v: 2 },
    support: "booster", variants: { booster: "metal", display: "24", sleeve: "clair", onetouch: "cristal", single: "sombre", fan: "3", stack: "blanc", frame: "noir", table: "bois" },
  };
  /* a project is a series of cards; project.front and project.back always point at the active card */
  project.title = "Ma série"; project.impose = { sheet: "A3", what: "serie", copies: 1, back: true };
  project.mock = { product: "acryl1", opts: {}, assign: {}, floor: "studio", auto: false, light: {}, label: "" }; project.hiddenArts = [];
  project.cards = [{ id: uid(), name: "Carte 1", front: project.front, back: project.back, thumb: "", pre: null }]; project.cardIndex = 0;
  const curCard = () => project.cards[project.cardIndex] || project.cards[0];
  const allDocs = () => project.cards.flatMap(c => [c.front, c.back]);
  const params = new URLSearchParams(location.search);
  const ui = { page: "atelier", face: "front", cat: "pick", seeAll: false, fmtGroup: "all", view: 0, selDoc: "front", selId: null, zoom: 1, panX: 0, panY: 0, panMode: false, space: false, picking: 0, brush: false, brushErase: false, brushSize: 8, light: "studio", angle: 0, tilt: 16, intensity: 1, seed: Math.random() * 10, flipping: 0, baseScale: 1, quality: params.get("perf") === "low" ? 0.45 : 1.5, dirty: true, marks: false, drag: null, packDirty: false, compare: false, cmpWith: "art", proof: false, busy: false };

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
    return { id: uid(), kind, name, src: null, w: 1, h: 1, analysis: null, version: 0, maskImg: null, maskVersion: 0, depthImg: null, depthVersion: 0, reliefImg: null, reliefVersion: 0,
      x: 0.5, y: 0.5, scale: 1, rot: 0, opacity: 1, blend: "normal", visible: true, fx: { ...base }, picks: [], pickTol: 0.22, win: [0.06, 0.06, 0.06, 0.06], presetId: "i-none",
      text: { text: "TITRE", font: "Unbounded", weight: "700", size: 8, spacing: 2, color: "#ffffff", stroke: "#000000", strokeW: 0, align: "center", upper: true, shadow: true },
      frame: { style: "thin", color: "#e8b44a", panel: "#101218", width: 3, panelA: 0.7 },
      bg: { type: "linear", c1: "#1a1446", c2: "#c9522f", angle: 90 },
      badge: { shape: "circle", text: "SR", color: "#e8b44a", textColor: "#1a1200" } };
  }
  /* the image analysis only depends on the source and the blur: share it between layers and cards */
  const analysisCache = new WeakMap();
  /* the subject belongs to the illustration: corrected once, it serves every layer and every card that shows this picture */
  const subjBySrc = new WeakMap(); let subjSeq = 0;
  function analysisFor(src, blur) { let m = analysisCache.get(src); if (!m) { m = new Map(); analysisCache.set(src, m); } const sb = subjBySrc.get(src), k = String(blur) + (sb ? ":" + sb._sid : ""); if (!m.has(k)) { if (m.size > 3) m.clear(); m.set(k, analyze(src, blur, sb)); } return m.get(k); }
  function setSubject(src, img) { if (!src) return; if (img) { img._sid = ++subjSeq; subjBySrc.set(src, img); } else subjBySrc.delete(src); const docs = new Set([project.front, project.back]); for (const c of project.cards) { for (const d of [c.front, c.back]) if (d && d.layers) { docs.add(d); if (d.layers.some(l => l.src === src)) { c.thumb = ""; c.pre = null; } } } for (const d of docs) if (d && d.layers) for (const l of d.layers) if (l.kind === "image" && l.src === src) { l.analysis = analysisFor(src, l.fx.blur); l.version++; } ui.dirty = true; }
  function setSrc(layer, src) { layer.src = src; layer.w = src.naturalWidth || src.width; layer.h = src.naturalHeight || src.height; layer.analysis = analysisFor(src, layer.fx.blur); layer.version++; }
  /* very light print grain: each pixel moves by a little over one percent at most, always the same way for a given card */
  function printGrain(c) { try { const x = c.getContext("2d"), im = x.getImageData(0, 0, c.width, c.height), d = im.data; let s = 1234567; for (let i = 0; i < d.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; const k = (((s >> 16) & 255) / 255 - 0.5) * 10; d[i] += k; d[i + 1] += k; d[i + 2] += k; } x.putImageData(im, 0, 0); } catch (e) {} return c; }
  function regen(layer) {
    const ca = aspect();
    if (layer.kind === "text") setSrc(layer, textCanvas({ ...layer.text, text: resolveTokens(layer.text.text, layer) }, ca));
    else if (layer.kind === "frame") setSrc(layer, frameCanvas(layer.frame, ca));
    else if (layer.kind === "bg") setSrc(layer, bgCanvas(layer.bg, ca));
    else if (layer.kind === "badge") setSrc(layer, badgeCanvas(layer.badge, ca));
    else if (layer.kind === "back") setSrc(layer, printGrain(backCanvas(project.backStyle.style, project.backStyle.c1, project.backStyle.c2, project.backStyle.text, ca)));
    else if (layer.kind === "image" && layer.src) { layer.analysis = analysisFor(layer.src, layer.fx.blur); layer.version++; }
  }
  let regenTimer = null;
  function regenSoon(layer) { clearTimeout(regenTimer); regenTimer = setTimeout(() => { regen(layer); refreshLayers(); invalidateThumbs(); ui.dirty = true; }, 50); }
  function applyPreset(layer, id) {
    const p = PRESET_BY_ID[id]; if (!p) return; const prevBlur = layer.fx.blur; const keepMask = layer.fx.mask, keepInv = layer.fx.maskInvert, keepClip = layer.fx.clip;
    layer.fx = presetFx(p); layer.presetId = id; ui.baseScale = p.scale; if (keepClip) layer.fx.clip = keepClip;
    if (p.mask === 0) { layer.fx.mask = keepMask; layer.fx.maskInvert = keepInv; }
    if (p.blur !== prevBlur && layer.src) { layer.analysis = analysisFor(layer.src, layer.fx.blur); layer.version++; }
    ui.dirty = true;
  }
  /* "cover" fills the bleed box, not only the trimmed card, so nothing white can show after cutting */
  function fitLayer(layer, mode) { const ca = aspect(), la = layer.w / layer.h; const d = fmtDims(), b = project.print.bleed; const sw = (d.w + 2 * b) / d.w, sh = (d.h + 2 * b) / d.h; if (mode === "cover") layer.scale = Math.max(sw, sh * la / ca); else if (mode === "contain") layer.scale = Math.min(1, la / ca); layer.x = 0.5; layer.y = 0.5; layer.rot = 0; }
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
  function duplicateLayer(doc, id) { const l = doc.layers.find(x => x.id === id); if (!l) return; const c = JSON.parse(JSON.stringify({ ...l, src: null, analysis: null, maskImg: null, depthImg: null, reliefImg: null })); c.id = uid(); c.name = l.name + " copie"; c.src = l.src; c.analysis = l.analysis; c.maskImg = l.maskImg; c.depthImg = l.depthImg; c.reliefImg = l.reliefImg; c.version = 1; doc.layers.splice(doc.layers.indexOf(l) + 1, 0, c); ui.selId = c.id; refreshLayers(); syncInspector(); ui.dirty = true; commit(); }
  function moveLayer(doc, id, dir) { const i = doc.layers.findIndex(l => l.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= doc.layers.length) return; [doc.layers[i], doc.layers[j]] = [doc.layers[j], doc.layers[i]]; refreshLayers(); ui.dirty = true; commit(); }

  /* ---- undo / redo (layer parameters, not pixels) ---- */
  const history = { stack: [], idx: -1, muted: false };
  const SRC = new Map();
  function snapshot() {
    const L = l => { SRC.set(l.id, { src: l.src, maskImg: l.maskImg, depthImg: l.depthImg, reliefImg: l.reliefImg, w: l.w, h: l.h }); return { id: l.id, kind: l.kind, name: l.name, x: l.x, y: l.y, scale: l.scale, rot: l.rot, opacity: l.opacity, blend: l.blend, visible: l.visible, fx: { ...l.fx }, picks: l.picks.map(p => [...p]), pickTol: l.pickTol, win: [...l.win], presetId: l.presetId, text: { ...l.text }, frame: { ...l.frame }, bg: { ...l.bg }, badge: { ...l.badge }, maskVersion: l.maskVersion, blur: l.fx.blur }; };
    return JSON.stringify({ formatId: project.formatId, custom: { ...project.custom }, edge: project.edge, coatKind: project.coatKind, coat: project.coat, print: { ...project.print }, backStyle: { ...project.backStyle }, front: { stock: project.front.stock, layers: project.front.layers.map(L) }, back: { stock: project.back.stock, layers: project.back.layers.map(L) } });
  }
  function restore(json) {
    const d = JSON.parse(json); history.muted = true;
    project.formatId = d.formatId; Object.assign(project.custom, d.custom); project.edge = d.edge; project.coatKind = d.coatKind; project.coat = d.coat; Object.assign(project.print, d.print); Object.assign(project.backStyle, d.backStyle);
    for (const id of ["front", "back"]) {
      const old = new Map(project[id].layers.map(l => [l.id, l])); project[id].stock = d[id].stock;
      project[id].layers = d[id].layers.map(s => { const l = old.get(s.id) || newLayer(s.kind, s.name); const keep = SRC.get(s.id); Object.assign(l, { kind: s.kind, name: s.name, x: s.x, y: s.y, scale: s.scale, rot: s.rot, opacity: s.opacity, blend: s.blend, visible: s.visible, fx: { ...base, ...s.fx }, picks: s.picks, pickTol: s.pickTol, win: s.win, presetId: s.presetId, text: s.text, frame: s.frame, bg: s.bg, badge: s.badge });
        if (!l.src && keep && keep.src) { l.w = keep.w; l.h = keep.h; setSrc(l, keep.src); } else if (l.src && l.analysis && Math.abs((l.analysis.blur ?? l.fx.blur) - l.fx.blur) > 0.01) { l.analysis = analysisFor(l.src, l.fx.blur); l.version++; }
        if (keep && keep.maskImg && l.maskImg !== keep.maskImg) { l.maskImg = keep.maskImg; l.maskVersion++; } if (keep && keep.reliefImg && l.reliefImg !== keep.reliefImg) { l.reliefImg = keep.reliefImg; l.reliefVersion = (l.reliefVersion || 0) + 1; }
        if (l.kind !== "image" && !l.src) regen(l); return l; });
    }
    history.muted = false; syncGlobalsToUI(); applyFormat(); refreshLayers(); syncInspector(); ui.dirty = true; if (ui.page === "creation") crSync(); if (ui.page === "image") imgSync();
  }
  function commit() { if (history.muted) return; const s = snapshot(); if (history.stack[history.idx] === s) return; history.stack.length = history.idx + 1; history.stack.push(s); if (history.stack.length > 60) history.stack.shift(); history.idx = history.stack.length - 1; updateUndo(); autosave(); onCommit(); }
  function undo() { if (history.idx <= 0) return; history.idx--; restore(history.stack[history.idx]); updateUndo(); toast("Annulé"); }
  function redo() { if (history.idx >= history.stack.length - 1) return; history.idx++; restore(history.stack[history.idx]); updateUndo(); toast("Rétabli"); }
  function updateUndo() { $("#undo").disabled = history.idx <= 0; $("#redo").disabled = history.idx >= history.stack.length - 1; }
  $("#undo").addEventListener("click", undo); $("#redo").addEventListener("click", redo);
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && $("#maskEditor").hidden && !/input|textarea|select/i.test(document.activeElement?.tagName || "")) { if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) { e.preventDefault(); redo(); } } });

  /* ---- layers list, menu, illustration strip ---- */
  const thumbCache = new Map();
  function thumbOf(l) { const key = l.id + ":" + l.version; let u = thumbCache.get(key); if (!u) { const [c, x] = cv(96, 96); const la = l.w / l.h; const w = la >= 1 ? 96 : 96 * la, h = la >= 1 ? 96 / la : 96; x.fillStyle = "#111"; x.fillRect(0, 0, 96, 96); x.drawImage(l.src, (96 - w) / 2, (96 - h) / 2, w, h); u = c.toDataURL("image/jpeg", 0.7); thumbCache.set(key, u); } return u; }
  function wideThumb(l) { const key = "w:" + l.id + ":" + l.version; let u = thumbCache.get(key); if (!u) { const [c, x] = cv(340, 190); const la = l.w / l.h; let w = 340, h = 340 / la; if (h < 190) { h = 190; w = 190 * la; } x.fillStyle = "#111"; x.fillRect(0, 0, 340, 190); x.drawImage(l.src, (340 - w) / 2, Math.min(0, (190 - h) * 0.3), w, h); u = c.toDataURL("image/jpeg", 0.8); thumbCache.set(key, u); } return u; }
  function refreshLayers() {
    const doc = curDoc(); const list = $("#layerList"); list.innerHTML = ""; $("#layersDoc").textContent = doc.id === "back" ? "· verso" : "· recto"; $("#layerCount").textContent = doc.layers.length;
    if (!doc.layers.length) { const p = document.createElement("p"); p.className = "note"; p.textContent = "Aucun calque. Importe une image pour commencer."; list.append(p); }
    [...doc.layers].reverse().forEach(l => {
      const row = document.createElement("div"); row.className = "layer-row" + (l.visible ? "" : " off"); row.setAttribute("role", "button"); row.tabIndex = 0; row.draggable = true; row.dataset.id = l.id; row.setAttribute("aria-selected", String(l.id === ui.selId && ui.selDoc === doc.id));
      const th = document.createElement("div"); th.className = "th"; if (l.src && (l.kind === "image" || l.kind === "back")) th.style.backgroundImage = `url(${thumbOf(l)})`; else th.textContent = KIND_LABEL[l.kind].slice(0, 2);
      const meta = document.createElement("div"); meta.className = "meta2"; const b = document.createElement("b"); b.textContent = l.name; const s = document.createElement("span"); const p = PRESET_BY_ID[l.presetId]; s.textContent = (p ? p.label : "—") + " · " + (MASK_LABEL[l.fx.mask] || ""); meta.append(b, s);
      const acts = document.createElement("div"); acts.className = "acts";
      const mk = (t, title, fn) => { const bt = document.createElement("button"); bt.type = "button"; bt.innerHTML = ICO(t, 1); bt.title = title; bt.setAttribute("aria-label", title); bt.addEventListener("click", e => { e.stopPropagation(); fn(); }); return bt; };
      acts.append(mk(l.visible ? "eye" : "eyeoff", "Afficher / masquer", () => { l.visible = !l.visible; refreshLayers(); ui.dirty = true; commit(); }), mk("up", "Monter", () => moveLayer(doc, l.id, 1)), mk("down", "Descendre", () => moveLayer(doc, l.id, -1)), mk("close", "Supprimer", () => removeLayer(doc, l.id)));
      row.append(th, meta, acts); row.addEventListener("click", () => selectLayer(doc.id, l.id));
      row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); row.click(); } });
      list.append(row);
    });
    // layer menu on the stage
    const menu = $("#layerMenu"); menu.innerHTML = "";
    for (const l of [...doc.layers].reverse()) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(l.id === ui.selId)); b.textContent = l.name; const sm = document.createElement("small"); sm.textContent = KIND_LABEL[l.kind]; b.append(sm); b.addEventListener("click", () => { selectLayer(doc.id, l.id); closeMenus(); }); menu.append(b); }
    const sep = document.createElement("div"); sep.className = "sep"; menu.append(sep); const all = document.createElement("button"); all.type = "button"; all.textContent = "Gérer les calques…"; all.addEventListener("click", () => { closeMenus(); setTab("layers"); }); menu.append(all);
    stackRender(); renderLib();
    const l = sel(); $("#layerBtnName").textContent = l ? l.name : "Aucun calque"; $("#fxname").textContent = l ? (PRESET_BY_ID[l.presetId]?.label || "") + (l.fx.mask ? " · " + MASK_LABEL[l.fx.mask] : "") : ""; $("#fxTag").firstElementChild.className = "proc-dot " + ((l && PRESET_BY_ID[l.presetId] && l.presetId !== "i-none") ? PRESET_BY_ID[l.presetId].cat : "");
    updateCardNav();
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
  function selectFormat(id) { project.formatId = id; const f = fmt(); project.pack.packs = f.pack.packs; project.pack.cards = f.pack.cards; $("#packsPerBox").value = f.pack.packs; $("#cardsPerPack").value = f.pack.cards; applyFormat(); renderFormats(); mockInvalidate(true); if (ui.page === "plans") renderDieline(); commit(); }
  function applyCardWidth() {
    const d = fmtDims(); const a = d.w / d.h; const bw = bench.clientWidth || 640; const bh = Math.max(170, (bench.clientHeight || 620) - 64);
    let w = Math.min(bw - 70, a >= 1 ? 560 : 440, bh * a);
    if (ui.marks) w = Math.min(w, (bw - 56) * 0.72, bh * a * 0.72);
    const px = Math.max(120, Math.round(w)); card.style.setProperty("--card-w", px + "px"); protect.style.setProperty("--card-w", px + "px");
    const ppm = px / d.w; card.style.setProperty("--thick", Math.max(1.5, 0.33 * ppm).toFixed(2) + "px"); card.style.setProperty("--bleed-px", (project.print.bleed * ppm).toFixed(2) + "px"); drawMarks(ppm);
  }
  function applyFormat() {
    const d = fmtDims(); const a = d.w / d.h; const rad = d.r / d.w * 100;
    for (const el of [card, document.documentElement]) el.style.setProperty("--card-aspect", round(a, 4));
    card.style.setProperty("--card-radius", `${round(rad, 2)}% / ${round(rad * a, 2)}%`);
    for (const doc of allDocs()) for (const l of doc.layers) if (l.kind !== "image") regen(l);
    for (const c of project.cards) { c.thumb = ""; c.pre = null; }
    $("#formatVal").textContent = `${d.w} × ${d.h} mm`; fmtViz(); $("#dims").textContent = `${d.w} × ${d.h} mm / ${ui.face === "back" ? "verso" : "recto"} / 0,33 mm`;
    resize(); invalidateThumbs(); refreshLayers(); renderSeries(true); ui.dirty = true;
  }
  function drawMarks(ppm) {
    const svg = $("#marksSvg"); const d = fmtDims(); const b = project.print.bleed, s = project.print.safe; const g = sheetGeom(d.w, d.h, b); card.style.setProperty("--mark-px", ((b + g.M) * ppm).toFixed(2) + "px");
    const W = g.pw * ppm, H = g.ph * ppm; svg.setAttribute("viewBox", `0 0 ${W} ${H}`); const r = d.r * ppm; const off = b + 1, len = 5; let o = "";
    const seg = (x1, y1, x2, y2) => { o += `<line x1="${x1 * ppm}" y1="${y1 * ppm}" x2="${x2 * ppm}" y2="${y2 * ppm}" stroke="currentColor" stroke-width="1.1"/>`; };
    for (const [cx, dx] of [[g.tx, -1], [g.tx + g.tw, 1]]) for (const [cy, dy] of [[g.ty, -1], [g.ty + g.th, 1]]) { seg(cx + dx * off, cy, cx + dx * (off + len), cy); seg(cx, cy + dy * off, cx, cy + dy * (off + len)); }
    const reg = (cx, cy) => { o += `<circle cx="${cx * ppm}" cy="${cy * ppm}" r="${1.6 * ppm}" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="${cx * ppm}" cy="${cy * ppm}" r="${0.35 * ppm}" fill="currentColor"/>`; seg(cx - 2.6, cy, cx + 2.6, cy); seg(cx, cy - 2.6, cx, cy + 2.6); };
    reg(g.tx + g.tw / 2, g.by - 5); reg(g.tx + g.tw / 2, g.by + g.bh + 5); reg(g.bx - 5, g.ty + g.th / 2); reg(g.bx + g.bw + 5, g.ty + g.th / 2);
    const sq = 4, total = COLOR_BAR.length * sq; const cx0 = Math.max(g.bx, g.tx + g.tw / 2 - total / 2), cy0 = g.by + g.bh + 2.2; COLOR_BAR.forEach((c, i) => { o += `<rect x="${(cx0 + i * sq) * ppm}" y="${cy0 * ppm}" width="${sq * ppm}" height="${sq * ppm}" fill="${cmykRgb(c)}" stroke="currentColor" stroke-width="0.5"/>`; });
    o += `<rect x="${g.bx * ppm}" y="${g.by * ppm}" width="${g.bw * ppm}" height="${g.bh * ppm}" rx="${(d.r + b) * ppm}" fill="none" stroke="#ff5fa0" stroke-width="1.2"/><rect x="${g.tx * ppm}" y="${g.ty * ppm}" width="${g.tw * ppm}" height="${g.th * ppm}" rx="${r}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="6 3"/><rect x="${(g.tx + s) * ppm}" y="${(g.ty + s) * ppm}" width="${(g.tw - 2 * s) * ppm}" height="${(g.th - 2 * s) * ppm}" rx="${Math.max(1, (d.r - s) * ppm)}" fill="none" stroke="#3ddc84" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    o += `<text x="${g.bx * ppm}" y="${(g.by + g.bh + 9.5) * ppm}" font-size="${Math.max(9, 2.3 * ppm)}" fill="currentColor" font-family="Figtree, sans-serif">${fmt().game} · ${d.w} × ${d.h} mm · fond perdu ${b} mm · sécurité ${s} mm · ${project.print.dpi} dpi · 0,33 mm</text>`;
    svg.innerHTML = o;
  }
  function resize() {
    if (ui.page === "studio") return; /* the Studio drives the card canvases itself */
    if (!R) return; applyCardWidth(); const dpr = Math.min((window.devicePixelRatio || 1) * ui.quality, 3);
    const w = Math.max(1, Math.round(card.clientWidth * dpr)), h = Math.max(1, Math.round(card.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    if (RB && (canvasBack.width !== w || canvasBack.height !== h)) { canvasBack.width = w; canvasBack.height = h; }
  }
  window.addEventListener("resize", () => { resize(); ui.dirty = true; });
  if (window.ResizeObserver) new ResizeObserver(() => { resize(); ui.dirty = true; }).observe(bench);
  document.addEventListener("input", () => { ui.dirty = true; }); document.addEventListener("change", () => { ui.dirty = true; }); document.addEventListener("click", () => { ui.dirty = true; });

  /* ---- popovers and menus ---- */
  const POPS = [["#helpBtn", "#helpPop"], ["#exportBtn", "#exportMenu"], ["#layerBtn", "#layerMenu"], ["#lookBtn", "#lookPop"]];
  function closeMenus(except) { for (const [, p] of POPS) if (p !== except) $(p).hidden = true; }
  for (const [b, p] of POPS) $(b).addEventListener("click", e => { e.stopPropagation(); const el = $(p); const open = el.hidden; closeMenus(p); el.hidden = !open; if (!el.hidden && p === "#formatPop") $("#fmtFilter").focus(); });
  for (const [, p] of POPS) $(p).addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => closeMenus()); document.addEventListener("keydown", e => { if (e.key === "Escape") { closeMenus(); setPicking(0); setBrush(false); } });

  /* ---- import ---- */
  function loadFile(file, cb) { if (!file || !file.type.startsWith("image/")) return; const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => { cb(im, file.name); URL.revokeObjectURL(u); }; im.src = u; }
  function importImages(files) { const doc = curDoc(); [...files].forEach(f => loadFile(f, (im, name) => { const nm = name.replace(/\.[^.]+$/, "").slice(0, 24); ui.imports.unshift({ src: im, name: nm }); addImageLayer(doc, im, nm); toast("Illustration ajoutée : " + name); })); }
  $("#file").addEventListener("change", e => { importImages(e.target.files); e.target.value = ""; });
  $("#maskfile").addEventListener("change", e => loadFile(e.target.files[0], im => { const l = sel(); if (!l) return; l.maskImg = im; l.maskVersion++; l.fx.mask = 4; syncInspector(); refreshLayers(); commit(); }));
  $("#depthfile").addEventListener("change", e => loadFile(e.target.files[0], im => { const l = sel(); if (!l) return; l.depthImg = im; l.depthVersion++; l.fx.depthSrc = 4; syncInspector(); }));
  $("#backfile").addEventListener("change", e => loadFile(e.target.files[0], im => { addImageLayer(project.back, im, "Dos importé", "i-none"); if (ui.face !== "back") setFace("back"); }));
  document.addEventListener("paste", e => { if (ui.page !== "atelier" || /input|textarea/i.test(document.activeElement?.tagName || "")) return; const items = [...(e.clipboardData?.items || [])].filter(i => i.type.startsWith("image/")); if (items.length) importImages(items.map(i => i.getAsFile())); });
  /* only files that come from outside the page are imported: an image of the interface (mockup, finish thumbnail, contact sheet) must never become a layer */
  let pageDrag = false;
  document.addEventListener("dragstart", e => { pageDrag = true; if (e.target && e.target.tagName === "IMG") e.preventDefault(); }, true);
  document.addEventListener("dragend", () => { pageDrag = false; }, true);
  const hasFiles = e => !!e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");
  bench.addEventListener("dragover", e => { if (pageDrag || !hasFiles(e)) return; e.preventDefault(); bench.classList.add("dropping"); });
  bench.addEventListener("dragleave", () => bench.classList.remove("dropping"));
  bench.addEventListener("drop", e => { e.preventDefault(); bench.classList.remove("dropping"); const own = pageDrag; pageDrag = false; if (own) return; importImages([...e.dataTransfer.files].filter(f => f.type.startsWith("image/"))); });
  /* a finish layer: a copy of the illustration that shows only its zone, so several processes can be stacked on the same image */
  function addFinishLayer() {
    const doc = selDoc(); const cur = sel(); const base = (cur && cur.kind === "image" && cur.src) ? cur : [...doc.layers].reverse().find(l => l.kind === "image" && l.src && l.visible); if (!base) { toast("Ajoute d'abord une illustration"); return; }
    const c = JSON.parse(JSON.stringify({ ...base, src: null, analysis: null, maskImg: null, depthImg: null, reliefImg: null })); c.id = uid(); c.src = base.src; c.analysis = base.analysis; c.maskImg = null; c.depthImg = base.depthImg; c.version = 1; c.assetId = null;
    applyPreset(c, "v-gloss"); c.fx.mask = 9; c.fx.maskInvert = 0; c.fx.clip = 1; c.name = "Masque " + (doc.layers.filter(q => q.fx.clip).length + 2);
    doc.layers.splice(doc.layers.indexOf(base) + 1, 0, c); ui.selId = c.id; refreshLayers(); syncInspector(); setTab("fx"); ui.dirty = true; commit(); toast("Masque ajouté sur le sujet : choisis sa finition, puis sa zone dans l'onglet Zone");
  }
  $("#addKind").addEventListener("change", e => { const v = e.target.value; if (!v) return; if (v === "finish") addFinishLayer(); else if (v === "serial" || v === "cardname") addTokenText(v); else addKind(v); e.target.value = ""; });
  $("#sample").addEventListener("click", () => { addImageLayer(curDoc(), makeFox(), "Illustration exemple"); });

  /* ---- swatch book ---- */
  const plain = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const fxQuery = () => plain(ui.fxq).trim();
  function catPresets() { const q = fxQuery(); if (q) { const words = q.split(/\s+/); return PRESETS.filter(p => { const hay = plain(p.label + " " + p.sub + " " + CAT_LABEL[p.cat] + " " + p.id); return words.every(w => hay.includes(w)); }); } if (ui.cat === "pick") return PICKS.map(id => PRESET_BY_ID[id]).filter(Boolean); if (ui.cat === "combo") return []; return PRESETS.filter(p => p.cat === ui.cat); }
  function renderCatTabs() { const el = $("#catTabs"); el.innerHTML = ""; for (const [id, label] of NUANCIER) { const b = document.createElement("button"); b.type = "button"; b.className = "pill"; b.textContent = label; b.setAttribute("aria-pressed", String(ui.cat === id && !fxQuery())); b.addEventListener("click", () => { ui.cat = id; ui.fxq = ""; $("#fxSearch").value = ""; renderCatTabs(); renderEffects(); }); el.append(b); } }
  const fxThumbCache = new Map(); let thumbQueue = [], thumbRunning = false;
  function invalidateThumbs() { thumbQueue = []; renderEffects(); }
  function thumbKey(l, id) { return `${l.id}:${l.version}:${id}:${round(aspect(), 3)}:${selDoc().stock}:${l.fx.mask}`; }
  function renderEffects() {
    const grid = $("#effects"); grid.innerHTML = ""; const l = sel(); thumbQueue = [];
    const items = (ui.cat === "combo" && !fxQuery()) ? RECIPES.map(([label, desc, r]) => ({ id: "combo:" + label, label, title: desc, recipe: r })) : catPresets().map(p => ({ id: p.id, label: p.label, title: p.sub || p.label, preset: p }));
    const shown = items; if (!items.length) { const em = document.createElement("p"); em.className = "fx-empty"; em.textContent = "Aucune finition ne correspond. Essaie « or », « holo », « vernis » ou « UV »."; grid.append(em); }
    for (const it of shown) {
      const b = document.createElement("button"); b.type = "button"; b.className = "fx"; b.title = it.title; const pressed = l && (it.preset ? l.presetId === it.id : false); b.setAttribute("aria-pressed", String(!!pressed));
      const im = document.createElement("img"); im.alt = ""; const key = l ? thumbKey(l, it.id) : null; const cached = key && fxThumbCache.get(key); if (cached) im.src = cached; else if (l && T) thumbQueue.push({ it, im, key, l });
      const s = document.createElement("span"); s.textContent = it.label; b.append(im, s); grid.append(b);
      b.addEventListener("click", () => { clearTimeout(ui.pvT); endPreview(); const L = sel(); if (!L) { toast("Importe d'abord une illustration"); return; } if (it.recipe) applyRecipe(L, it.recipe, it.label, it.title); else applyPreset(L, it.id); syncInspector(); refreshLayers(); commit(); shimmer(); });
      if (!it.recipe) { b.addEventListener("pointerenter", e => { if (e.pointerType !== "mouse") return; clearTimeout(ui.pvT); ui.pvT = setTimeout(() => previewFx(it.id), 170); }); b.addEventListener("pointerleave", () => { clearTimeout(ui.pvT); endPreview(); }); }
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
  $("#fxSearch").addEventListener("input", e => { ui.fxq = e.target.value; renderCatTabs(); renderEffects(); });
  function renderAccentQuick() {
    const el = $("#accentQuick"); el.innerHTML = ""; const l = sel();
    for (const a of ACCENTS) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(!!(l && l.fx.accent && l.fx.accentType === a.type))); const d = document.createElement("span"); d.className = "dot"; d.style.background = a.css; const s = document.createElement("span"); s.textContent = a.label; b.append(d, s); b.addEventListener("click", () => { const L = sel(); if (!L) { toast("Importe d'abord une illustration"); return; } L.fx.accent = 1; L.fx.accentType = a.type; L.fx.accentColor = ""; if (L.fx.accentMask === 8 && !L.picks.length) setPicking(2); syncInspector(); commit(); }); el.append(b); }
  }

  /* ---- inspector ---- */
  const PCT = v => Math.round(v * 100) + "%";
  const NUM = { imgRelief: [100, PCT], blur: [1, v => v + " px"], detail: [100, PCT], cavity: [100, PCT], bump: [100, PCT], angle: [1, v => Math.round(v) + "°"], depth: [100, PCT], relief: [100, PCT], foil: [100, PCT], sat: [100, PCT], bands: [100, v => v.toFixed(2)], sparkle: [100, PCT], edgeFoil: [100, PCT], ink: [100, PCT], glare: [100, PCT], specPow: [1, v => String(Math.round(v))], lightZ: [100, v => v.toFixed(2)], warm: [100, v => (v > 0 ? "chaud " : v < 0 ? "froid " : "neutre ") + Math.abs(Math.round(v * 100)) + "%"], maskThr: [100, PCT], maskSoft: [100, PCT], maskGrow: [100, v => (v > 0 ? "+" : "") + Math.round(v * 100) + "%"], accentAmt: [100, PCT], accentRelief: [100, PCT] };
  const SELS = [["reliefSrc", "reliefSrc"], ["pattern", "pattern"], ["depthSrc", "depthSrc"], ["blend", "blend"], ["palette", "palette"], ["accentType", "accentType"]];
  function syncInspector() {
    { const rz = $("#reliefZone"), L0 = sel(); if (rz && L0) rz.value = String(L0.fx.reliefZone || 0); }
    const l = sel();
    for (const id of ["edText", "edFrame", "edBg", "edBadge"]) $("#" + id).hidden = true;
    $("#backFold").hidden = ui.face !== "back";
    if (!l) { $("#fxTitle").textContent = "Aucun calque"; $("#fxSub").textContent = "Importe une illustration pour commencer"; $("#layerName").value = ""; $("#layerKind").textContent = "—"; for (const b of $$("#zones [data-mask], #accentZones [data-amask], #invertChip")) b.setAttribute("aria-pressed", "false"); for (const id of ["winRow", "thrRow", "pickRow", "brushRow"]) $("#" + id).hidden = true; maskBarSync(); renderAccentQuick(); renderEffects(); return; }
    const p = PRESET_BY_ID[l.presetId]; $("#fxTitle").textContent = p ? p.label : "—"; $("#fxSub").textContent = p ? (CAT_LABEL[p.cat] + (p.sub ? " · " + p.sub : "")) : ""; $("#fxNote").textContent = p ? p.note || "" : ""; $("#fxDot").className = "proc-dot " + (p && p.id !== "i-none" ? p.cat : "");
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
    $("#winRow").hidden = !(m.mask === 1 || m.mask === 2); $("#thrRow").hidden = ![5, 6, 7, 9, 10, 11, 12, 13].includes(m.mask); $("#pickRow").hidden = !(m.mask === 8 || (m.accent && m.accentMask === 8)); $("#brushRow").hidden = m.mask !== 4; maskBarSync();
    for (const [i, id] of ["wt", "wr", "wb", "wl"].entries()) { $("#" + id).value = l.win[i] * 100; $("#o-" + id).value = Math.round(l.win[i] * 100) + "%"; }
    $("#pickTol").value = Math.round(l.pickTol * 100); $("#o-pickTol").value = Math.round(l.pickTol * 100) + "%"; renderSwatches();
    for (const b of $$("#zones [data-mask]")) b.setAttribute("aria-pressed", String(+b.dataset.mask === m.mask)); $("#brushBtn").setAttribute("aria-pressed", String(m.mask === 4)); $("#invertChip").setAttribute("aria-pressed", String(!!m.maskInvert));
    for (const b of $$("#accentZones [data-amask]")) b.setAttribute("aria-pressed", String(+b.dataset.amask === m.accentMask));
    renderAccentQuick(); renderEffects();
    $("#fxname").textContent = (p ? p.label : "") + (m.mask ? " · " + MASK_LABEL[m.mask] : "");
  }
  for (const k of Object.keys(NUM)) { const el = $("#" + k); el.addEventListener("input", e => { const l = sel(); if (!l) return; const [mul, f] = NUM[k]; l.fx[k] = +e.target.value / mul; $("#o-" + k).value = f(l.fx[k]); if (k === "blur") { clearTimeout(regenTimer); regenTimer = setTimeout(() => { if (l.src) { l.analysis = analysisFor(l.src, l.fx.blur); l.version++; ui.dirty = true; } }, 80); } }); el.addEventListener("change", commit); }
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
  function setTab(t) { ui.tab = t; for (const b of $$("#inspTabs [data-tab]")) b.setAttribute("aria-selected", String(b.dataset.tab === t)); for (const p of $$("#insp [data-pane]")) p.hidden = p.dataset.pane !== t; if (t === "fx") pumpThumbs(); }
  for (const b of $$("#inspTabs [data-tab]")) b.addEventListener("click", () => setTab(b.dataset.tab));
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
  $("#stock").addEventListener("change", e => { for (const doc of allDocs()) doc.stock = e.target.value; invalidateThumbs(); commit(); });
  $("#core").addEventListener("change", e => { project.print.core = e.target.value; applyCore(); commit(); });
  function applyCore() { card.style.setProperty("--core-color", CORE_COLORS[project.print.core] || "#26262b"); }
  function applyEdge() { card.classList.remove("edge-gold", "edge-silver", "edge-black", "edge-red"); if (project.edge) card.classList.add("edge-" + project.edge); }
  $("#edge").addEventListener("change", e => { project.edge = e.target.value; applyEdge(); commit(); });
  $("#coatKind").addEventListener("change", e => { project.coatKind = e.target.value; applyCoat(); commit(); });
  $("#coat").addEventListener("input", e => { project.coat = +e.target.value; $("#o-coat").value = e.target.value + "%"; applyCoat(); }); $("#coat").addEventListener("change", commit);
  function applyCoat() { const k = project.coatKind; const v = project.coat / 100; const f = k === "none" ? 0 : k === "matte" ? 0.15 : k === "satin" ? 0.5 : 1; for (const doc of allDocs()) doc.coat = v * (doc.id === "back" ? Math.min(f, 0.12) : f); /* the back of a card is matte whatever the front */ $("#stockBtn").innerHTML = `Carton <small>0,33 mm · ${({ gloss: "brillant", satin: "satiné", matte: "mat", none: "sans vernis" })[k]}</small>`; }
  $("#marks").addEventListener("change", e => { ui.marks = e.target.checked; card.classList.toggle("show-marks", ui.marks); resize(); });
  function syncGlobalsToUI() { $("#stock").value = project.front.stock; $("#edge").value = project.edge; $("#coatKind").value = project.coatKind; $("#core").value = project.print.core; $("#coat").value = project.coat; $("#o-coat").value = project.coat + "%"; $("#bleed").value = project.print.bleed; $("#safe").value = project.print.safe; $("#dpi").value = project.print.dpi; $("#backC1").value = project.backStyle.c1; $("#backC2").value = project.backStyle.c2; $("#backText").value = project.backStyle.text || ""; applyCoat(); applyCore(); applyEdge(); renderBacks(); }

  /* ---- back of card ---- */
  function ensureBackLayer() { let l = project.back.layers.find(x => x.kind === "back"); if (!l) { l = newLayer("back", "Motif du dos"); applyPreset(l, project.backStyle.style === "official" ? "i-none" : "h-rainbow"); regen(l); project.back.layers.unshift(l); } return l; }
  { const im = new Image(); im.onload = () => { backCanvas.img = im; for (const doc of allDocs()) for (const l of doc.layers) if (l.kind === "back") regen(l); for (const c of project.cards) { c.thumb = ""; c.pre = null; } renderBacks(); ui.dirty = true; }; im.src = BACK_OFFICIAL_SRC; }
  function renderBacks() {
    const el = $("#backs"); el.innerHTML = ""; const ca = aspect(); { const off = project.backStyle.style === "official"; $("#backC1").closest(".kv").hidden = off; $("#backText").closest("label").hidden = off; }
    for (const [id, label] of BACK_STYLES) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(project.backStyle.style === id)); const c = backCanvas(id, project.backStyle.c1, project.backStyle.c2, project.backStyle.text, ca); const small = document.createElement("canvas"); small.width = 112; small.height = Math.round(112 / ca); small.getContext("2d").drawImage(c, 0, 0, small.width, small.height); const s = document.createElement("span"); s.textContent = label; b.append(small, s); b.addEventListener("click", () => { project.backStyle.style = id; const l = ensureBackLayer(); regen(l); renderBacks(); syncBacks(); selectLayer("back", l.id); ui.dirty = true; commit(); }); el.append(b); }
  }
  for (const [id, key] of [["backC1", "c1"], ["backC2", "c2"], ["backText", "text"]]) $("#" + id).addEventListener("input", e => { project.backStyle[key] = e.target.value; const l = ensureBackLayer(); regenSoon(l); clearTimeout(ui.backsTimer); ui.backsTimer = setTimeout(() => { renderBacks(); syncBacks(); }, 200); });
  function setFace(f) {
    const prev = ui.face; ui.face = f; for (const b of $$("[data-face]")) b.setAttribute("aria-pressed", String(b.dataset.face === f));
    flipEl.style.setProperty("--flip", f === "back" ? "180deg" : "0deg"); if (prev !== f) ui.flipping = performance.now() + 950;
    if (f === "back") { ensureBack(); ensureBackLayer(); ui.selDoc = "back"; if (!project.back.layers.find(l => l.id === ui.selId)) ui.selId = project.back.layers[project.back.layers.length - 1]?.id || null; }
    else { ui.selDoc = "front"; if (!project.front.layers.find(l => l.id === ui.selId)) ui.selId = project.front.layers[project.front.layers.length - 1]?.id || null; }
    $("#dims").textContent = `${fmtDims().w} × ${fmtDims().h} mm / ${f === "back" ? "verso" : "recto"} / 0,33 mm`;
    refreshLayers(); syncInspector(); if (ui.compare) updateCmp(); ui.dirty = true;
  }
  for (const b of $$("[data-face]")) b.addEventListener("click", () => setFace(b.dataset.face));
  $("#flipBtn").addEventListener("click", () => setFace(ui.face === "back" ? "front" : "back"));

  /* ---- pages ---- */
  const PAGE_TEXT = { accueil: ["Accueil", "Ta série, le parcours et les outils."], format: ["Format", "Choisis la taille de la carte et son carton. Tout le reste s'y adapte."], image: ["Illustration", "Choisis l'image de la carte, puis cadre-la."], studio: ["Studio", "Filme ta carte : un mouvement, un décor, des effets, puis la vidéo."], creation: ["Cadre et texte", "Option : ajoute un cadre, un nom ou des textes si ton illustration n'en a pas déjà."], guide: ["Comprendre une carte", "Les bases d'une carte, de l'illustration à l'impression."], atelier: ["Finitions", "Choisis une finition et sa zone. Incline la carte pour examiner le reflet."], serie: ["Série", "Toutes les cartes du set, les raretés et les planches d'imposition."], plans: ["Impression", "Plans de découpe à l'échelle, marges et contrôle avant impression."], maquettes: ["Maquettes", "Manipule tes cartes en volume : blocs acryliques, cadres, slab, boosters."] };
  const STEPS = ["format", "image", "atelier", "serie", "plans"];
  function setPage(p) {
    const was = ui.page; ui.page = p; if (STEPS.includes(p)) { try { localStorage.setItem("layrys-step", p); } catch (e) {} } for (const b of $$("[data-page]")) b.setAttribute("aria-pressed", String(b.dataset.page === p));
    for (const id of ["accueil", "format", "image", "studio", "creation", "guide", "atelier", "serie", "plans", "maquettes"]) $("#page-" + id).hidden = id !== p;
    { const sp = $("#stagePanel"); if (p === "image") $("#imageStageHost").append(sp); else if (p === "creation") $("#creationStageHost").append(sp); else if (p === "atelier") $("#atelierStageHost").append(sp); } /* the card follows the page that works on it */
    if (p === "accueil") renderHome(); if (p === "creation") crSync(); if (p === "format") fmtViz(); if (p === "image") splitSet(ui.split);
    if (was === "studio" && p !== "studio") studioLeave(); if (p === "studio") studioEnter();
    if (p === "image") { ui.imgMove = true; if (ui.view !== 0) { const b0 = $('[data-view="0"]'); if (b0) b0.click(); } renderLib(); imgSync(); } else if (was === "image") { ui.imgMove = false; bench.style.cursor = ""; imgSync(); }
    $("#pageTitle").textContent = PAGE_TEXT[p][0]; $("#pageSub").textContent = PAGE_TEXT[p][1];
    { const i = STEPS.indexOf(p), h = $("#pageTitle"), nx = $("#pageNext"); if (i >= 0) h.dataset.step = String(i + 1); else delete h.dataset.step; nx.hidden = i < 0 || i === STEPS.length - 1; if (!nx.hidden) { nx.dataset.to = STEPS[i + 1]; $("#pageNextT").textContent = "Étape suivante : " + PAGE_TEXT[STEPS[i + 1]][0]; } } /* the five steps, in the order of the work */
    if (p === "maquettes") mockEnter(); else mockLeave();
    if (p === "atelier") { renderCardList(); renderSheet(); }
    if (p === "plans") { renderDieline(); renderPreflight(); }
    if (p === "serie") renderSeries(true);
    resize(); ui.dirty = true; window.scrollTo({ top: 0, behavior: "smooth" });
  }
  for (const b of $$("[data-page]")) b.addEventListener("click", () => setPage(b.dataset.page));
  $("#toPlans").addEventListener("click", () => { const k = project.mock.product; project.dieline.kind = (k === "booster" || k === "display" || k === "etb" || k === "deckbox") ? k : "card"; renderDielineOpts(); setPage("plans"); });

  /* ---- light and angle ---- */
  const LAMP = { studio: "#fff1cf", soft: "#fff8ea", spot: "#ffffff", warm: "#ffc46b", cold: "#a9d4ff", vitrine: "#ffd9a0", candle: "#ff9a3c", uv: "#8a5cff", dark: "#20362a" };
  function renderLights() {
    for (const el of [$("#lightMenu")]) {
      if (!el) continue; el.innerHTML = ""; const lab = document.createElement("span"); lab.className = "lights__label"; lab.innerHTML = ICO("sun", 1) + "Lumière"; el.append(lab); let lastKind = "";
      for (const [id, label, small, def] of LIGHTS) {
        const kind = def.env ? "env" : def.kind; if (lastKind && kind !== lastKind) { const sep = document.createElement("span"); sep.className = "sep"; el.append(sep); } lastKind = kind;
        const b = document.createElement("button"); b.type = "button"; b.dataset.light = id; b.title = small ? label + " : " + small : label; b.setAttribute("aria-pressed", String(ui.light === id));
        const i = document.createElement("i"); i.style.setProperty("--lamp", LAMP[id] || (def.warm > 0.2 ? "#ffd08a" : def.warm < -0.2 ? "#b5d8ff" : "#fff1cf")); const t = label.replace("Fixe · ", "").replace("Animée · ", "");
        b.append(i, t.charAt(0).toUpperCase() + t.slice(1)); b.addEventListener("click", () => setLight(id)); el.append(b);
      }
    }
  }
  function setLight(id) { ui.light = id; const [, label, small] = LIGHTS.find(l => l[0] === id) || LIGHTS[0]; $("#lightName").textContent = small ? label + " · " + small : label; renderLights(); closeMenus(); interacting = false; interactEnd(true); ui.dirty = true; mockDirty(); mlSync(); }
  renderLights();
  function setAngle(i) { ui.angle = (i + ANGLES.length) % ANGLES.length; $("#angName").textContent = ANGLES[ui.angle][0]; interactEnd(true); }
  $("#angPrev").addEventListener("click", () => setAngle(ui.angle - 1)); $("#angNext").addEventListener("click", () => setAngle(ui.angle + 1));

  /* ---- packaging ---- */
  function snapshotDoc(doc, px, pointer = [0.35, 0.7], tilt = [-0.18, 0.1], o = {}) { if (!T) return ""; const a = o.aspect || aspect(); thumbCanvas.width = px; thumbCanvas.height = Math.round(px / a); T.renderDoc(doc, { pointer, tilt, aspect: a, intensity: 1, seed: ui.seed, selectedId: null, view: 0, ...o }); return thumbCanvas.toDataURL("image/jpeg", 0.9); }
  function packDoc() {
    const p = project.pack; const ca = p.boosterW / p.boosterH; const art = project.front.layers.find(l => l.kind === "image" && l.visible && l.src)?.src || null;
    if (!ui.packLayer) ui.packLayer = newLayer("image", "Booster"); const l = ui.packLayer;
    setSrc(l, packCanvas({ title: p.title, sub: p.sub, cards: p.cards, c1: p.boxColor, c2: "#3a2f6b" }, art, ca)); l.scale = 1; l.x = 0.5; l.y = 0.5; applyPreset(l, p.finish); l.fx.mask = 0;
    return { id: "pack", layers: [l], stock: p.boxColor, coat: 0.5 };
  }
  function boxDims(packs) { if (packs >= 36) return [135, 122, 74]; if (packs >= 30) return [130, 120, 70]; if (packs >= 24) return [110, 128, 84]; if (packs >= 16) return [95, 110, 62]; return [85, 105, 75]; }
  for (const [id, key, num] of [["packTitle", "title", 0], ["packSub", "sub", 0], ["packsPerBox", "packs", 1], ["cardsPerPack", "cards", 1], ["boxColor", "boxColor", 0], ["packFinish", "finish", 0]]) $("#" + id).addEventListener("change", e => { project.pack[key] = num ? Math.max(1, +e.target.value || 1) : e.target.value; if (ui.page === "plans") { renderDieline(); renderPreflight(); } });

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
    const el = $("#preflight"); el.innerHTML = ""; const items = preflightItems(false); let warn = 0;
    for (const it of items) { const r = document.createElement("div"); r.className = it.level; const i = document.createElement("i"); const sp = document.createElement("span"); sp.textContent = it.text; r.append(i, sp); el.append(r); if (it.level === "warn") warn++; }
    const badge = $("#preBadge"); badge.textContent = warn ? `${warn} point${warn > 1 ? "s" : ""} à vérifier` : "Prêt"; badge.className = "badge " + (warn ? "warn" : "ok");
    const ps = $("#passes"); ps.innerHTML = ""; for (const st of fabricationSteps()) { const li = document.createElement("li"); li.textContent = st; ps.append(li); }
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
  $("#zoomIn").addEventListener("click", () => { stagewrap.classList.add("smooth"); zoomTo(ui.zoom * 1.25, 0, 0); }); $("#zoomOut").addEventListener("click", () => { stagewrap.classList.add("smooth"); zoomTo(ui.zoom / 1.25, 0, 0); }); $("#zoomFit").addEventListener("click", () => { stagewrap.classList.add("smooth"); ui.zoom = 1; ui.panX = ui.panY = 0; applyZoom(); });
  for (const ev of ["wheel", "pointerdown"]) bench.addEventListener(ev, () => stagewrap.classList.remove("smooth"), { capture: true, passive: true });
  $("#panMode").addEventListener("click", () => { ui.panMode = !ui.panMode; $("#panMode").setAttribute("aria-pressed", String(ui.panMode)); bench.classList.toggle("panning", ui.panMode); });
  document.addEventListener("keydown", e => { if (e.code === "Space" && !/input|textarea|select|button/i.test(document.activeElement?.tagName || "")) { ui.space = true; bench.classList.add("panning"); e.preventDefault(); } });
  document.addEventListener("keyup", e => { if (e.code === "Space") { ui.space = false; bench.classList.toggle("panning", ui.panMode); } });
  const pointers = new Map(); let panDrag = null, pinch = null, painting = false;
  const brushCursor = $("#brushCursor");
  bench.addEventListener("pointerdown", e => {
    if (e.target.closest(".stage__zoom")) return;
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
    if (ui.drag) { interact(e, true); return; }
    if (lightDef().kind !== "follow") return;
    if (card.contains(e.target)) interact(e, false); else if (interacting) interactEnd();
  });
  const endPtr = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; panDrag = null; if (painting) { painting = false; commit(); } if (ui.drag) { ui.drag = null; interactEnd(); } else if (e.pointerType !== "mouse" && interacting) interactEnd(); };
  bench.addEventListener("pointerup", endPtr); bench.addEventListener("pointercancel", endPtr);
  bench.addEventListener("pointerleave", () => { if (!ui.drag && !panDrag && lightDef().kind === "follow") interactEnd(); });

  /* ---- springs and render loop ---- */
  class Spring { constructor(v, k, d) { this.v = { ...v }; this.last = { ...v }; this.target = { ...v }; this.stiffness = k; this.damping = d; } set(t) { Object.assign(this.target, t); } tick(dt) { for (const k in this.v) { const delta = this.target[k] - this.v[k]; const vel = (this.v[k] - this.last[k]) / (dt || 1); const d = (vel + (this.stiffness * delta - this.damping * vel)) * dt; this.last[k] = this.v[k]; if (Math.abs(d) < 0.0005 && Math.abs(delta) < 0.0005) { this.v[k] = this.target[k]; } else this.v[k] += d; } } settled() { for (const k in this.v) if (this.v[k] !== this.target[k]) return false; return true; } }
  const sRotate = new Spring({ x: 0, y: 0 }, 0.066, 0.25), sPointer = new Spring({ x: 30, y: 22, o: 1 }, 0.066, 0.25);
  const setSprings = (k, d) => { for (const s of [sRotate, sPointer]) { s.stiffness = k; s.damping = d; } };
  let interacting = false, idle = true, idleTimer = null, lastT = performance.now(), showcaseR = 0;
  function interact(e, tilt) {
    interacting = true; idle = false; clearTimeout(idleTimer); const rect = card.getBoundingClientRect();
    const px = clamp(round((100 / rect.width) * (e.clientX - rect.left)), -40, 140), py = clamp(round((100 / rect.height) * (e.clientY - rect.top)), -40, 140);
    setSprings(0.066, 0.25); if (lightDef().kind === "follow") sPointer.set({ x: clamp(px), y: clamp(py), o: 1 });
    if (tilt) sRotate.set({ x: round(((clamp(px) - 50) / 50) * ui.tilt), y: round(-((clamp(py) - 50) / 50) * ui.tilt) });
  }
  function interactEnd(hard) { interacting = false; setSprings(hard ? 0.09 : 0.045, hard ? 0.35 : 0.32); const a = ANGLES[ui.angle]; sRotate.set({ x: a[1], y: a[2] }); const L = lightDef(); if (L.kind === "fixed") sPointer.set({ x: L.x, y: L.y, o: 1 }); else if (L.kind === "follow") sPointer.set({ x: 30, y: 22, o: 1 }); /* at rest the lamp is parked up left: the finish stays fully visible */ clearTimeout(idleTimer); idleTimer = setTimeout(() => { idle = true; }, 2500); }
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function showcase() { const L = lightDef(); if (L.kind !== "anim" || reduceMotion) return; showcaseR += ui.light === "candle" ? 0.05 : 0.012; sPointer.stiffness = 0.04; sPointer.damping = 0.5; const [x, y] = L.fn(showcaseR); sPointer.set({ x, y, o: 0.95 }); }
  for (const b of $$("[data-view]")) b.addEventListener("click", () => { ui.view = +b.dataset.view; for (const o of $$("[data-view]")) o.setAttribute("aria-pressed", String(o === b)); maskBarSync(); });
  /* one short tilt back and forth, to show how a finish reacts to the light */
  function shimmer() { if (reduceMotion || (ui.page !== "atelier" && ui.page !== "creation")) return; setSprings(0.1, 0.42); ui.shim = performance.now(); }
  /* preview of a finish while its tile is hovered: nothing is saved until the click */
  function previewFx(id) { const L = sel(); if (!L || !L.src || ui.pv || L.presetId === id) return; ui.pv = { layer: L, fx: L.fx, presetId: L.presetId, analysis: L.analysis, baseScale: ui.baseScale, tag: $("#fxname").textContent }; applyPreset(L, id); const p = PRESET_BY_ID[id]; $("#fxname").textContent = "Aperçu : " + (p ? p.label : ""); ui.dirty = true; }
  function endPreview() { const s = ui.pv; if (!s) return; ui.pv = null; s.layer.fx = s.fx; s.layer.presetId = s.presetId; if (s.layer.analysis !== s.analysis) { s.layer.analysis = s.analysis; s.layer.version++; } ui.baseScale = s.baseScale; $("#fxname").textContent = s.tag; ui.dirty = true; }
  function mlSync() {
    const on = ui.light === "manual"; $("#lightPanel").hidden = !on; const hd = $("#lightHandle"); if (hd) { hd.hidden = !on; hd.style.left = ML.x + "%"; hd.style.top = ML.y + "%"; }
    const ls = $("#lightSel"); if (!ls.options.length) { const names = { follow: "Suit le curseur", fixed: "Fixe", anim: "Animée", env: "Spéciale" }; let grp = null, last = ""; for (const [id, label, , def] of LIGHTS) { const k = def.env ? "env" : def.kind; if (k !== last) { grp = document.createElement("optgroup"); grp.label = names[k] || k; ls.append(grp); last = k; } const op = document.createElement("option"); op.value = id; const t = label.replace("Fixe · ", "").replace("Animée · ", ""); op.textContent = t.charAt(0).toUpperCase() + t.slice(1); grp.append(op); } }
    ls.value = ui.light; const set = (id, v, t) => { $("#" + id).value = v; $("#o-" + id).value = t; };
    set("mlX", ML.x, Math.round(ML.x) + " %"); set("mlY", ML.y, Math.round(ML.y) + " %"); set("mlS", Math.round(ML.soft * 100), ML.soft < 0.12 ? "nette" : ML.soft < 0.5 ? "douce" : "très diffuse"); set("mlZ", Math.round(ML.z * 100), ML.z < 0.6 ? "rasante" : ML.z > 1.6 ? "haute" : "moyenne"); set("mlP", Math.round(ML.power * 100), Math.round(ML.power * 100) + " %"); set("mlW", Math.round(ML.warm * 100), ML.warm > 0.15 ? "chaude" : ML.warm < -0.15 ? "froide" : "neutre");
  }
  function mlApply() { try { localStorage.setItem("layrys-lamp", JSON.stringify(ML)); } catch (e) {} mlSync(); if (ui.light === "manual") { setSprings(0.12, 0.45); sPointer.set({ x: ML.x, y: ML.y, o: 1 }); } ui.dirty = true; }
  function frame(now) {
    if (ui.shim) { const t = (now - ui.shim) / 1900, a = ANGLES[ui.angle]; if (t >= 1 || interacting) { ui.shim = 0; if (!interacting) sRotate.set({ x: a[1], y: a[2] }); } else { const k = Math.sin(Math.PI * t); sRotate.set({ x: a[1] + 18 * Math.sin(t * Math.PI * 2) * k, y: a[2] + 7 * Math.sin(t * Math.PI * 4) * k }); } }
    const dt = Math.min(3, (now - lastT) * 60 / 1000); lastT = now; showcase(); sRotate.tick(dt); sPointer.tick(dt);
    const r = sRotate.v, p = sPointer.v; tiltEl.style.setProperty("--rotate-x", r.x.toFixed(3) + "deg"); tiltEl.style.setProperty("--rotate-y", r.y.toFixed(3) + "deg");
    const L = lightDef(); const o = { pointer: [p.x / 100, 1 - p.y / 100], tilt: [r.x * Math.PI / 180, -r.y * Math.PI / 180], aspect: aspect(), intensity: ui.intensity * (0.35 + 0.65 * p.o) * (L.power || 1), seed: ui.seed, selectedId: ui.selId, view: ui.view, light: { warm: L.warm, z: L.z, soft: L.soft || 0 }, proof: ui.proof, env: L.env || 0 , only: ((ui.view === 9 || ui.view === 7 || ui.view === 4) && ui.selId) ? [ui.selId] : undefined };
    const moving = interacting || (L.kind === "anim" && !reduceMotion) || now < ui.flipping || ui.dirty || !sRotate.settled() || !sPointer.settled();
    if (R && ui.page !== "maquettes" && ui.page !== "studio" && !ui.busy && moving) {
      ui.dirty = false; const back = ui.face === "back"; const both = now < ui.flipping; if (both) ensureBack(); resize();
      if (!back || both) R.renderDoc(project.front, { ...o, selectedId: ui.selDoc === "front" ? ui.selId : null });
      if (back || both) { const g = ensureBack(); if (g) g.renderDoc(project.back, { ...o, tilt: [-o.tilt[0], o.tilt[1]], pointer: [1 - o.pointer[0], o.pointer[1]], selectedId: ui.selDoc === "back" ? ui.selId : null }); }
    }
    requestAnimationFrame(frame);
  }

  /* ---- export, project, autosave ---- */
  let toastTimer = null; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800); }
  async function saveFile(name, data) {
    if (window.claude && typeof window.claude.use === "function") { const dl = await window.claude.use("downloads").catch(() => null); if (dl) { try { await dl.save({ filename: name, data }); toast("Enregistré : " + name); } catch (e) { if (!e || e.code !== "declined") toast("Enregistrement indisponible ici"); } return; } }
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); const a = document.createElement("a"); a.href = url; a.download = name; document.body.append(a); try { a.click(); } catch (e) {} a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function ensureZipUnused() { if (typeof JSZip !== "undefined") return Promise.resolve(true); const urls = ["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js", "https://unpkg.com/jszip@3.10.1/dist/jszip.min.js"]; return urls.reduce((pr, u) => pr.then(ok => ok || new Promise(res => { const sc = document.createElement("script"); sc.src = u; sc.onload = () => res(typeof JSZip !== "undefined"); sc.onerror = () => res(false); document.head.append(sc); })), Promise.resolve(false)); }
  async function capturePng() { if (ui.page === "maquettes") return mockCapture(); if (!R) return; const src = ui.face === "back" ? canvasBack : canvas; $("#captureImg").src = src.toDataURL("image/png"); $("#captureBox").hidden = false; const blob = await toBlob(src); if (blob) saveFile("layrys-" + slugify(curCard().name) + "-" + (ui.face === "back" ? "verso" : "recto") + ".png", blob); }
  $("#captureClose").addEventListener("click", () => { $("#captureBox").hidden = true; });
  for (const b of $$("[data-export]")) b.addEventListener("click", () => { closeMenus(); const k = b.dataset.export; if (k === "png") capturePng(); else if (k === "svg") exportSvg(); else if (k === "flat") exportFlat(); else if (k === "pdf") exportPdf().catch(err => { console.error(err); toast("Export PDF impossible : " + (err && err.message || err)); }); else if (k === "save") saveProject(); else if (k === "video") exportVideo().catch(err => { console.error(err); ui.busy = false; toast("Vidéo impossible : " + (err && err.message || err)); }); else if (k === "impose") exportImposition().catch(err => { console.error(err); toast("Planche impossible : " + (err && err.message || err)); }); else if (k === "print") exportPrintFiles().catch(err => { console.error(err); toast("Export impossible : " + (err && err.message || err)); }); });
  const encCache = new WeakMap();
  function encodeSrc(l, maxPx, q) { const key = maxPx + ":" + q; let m = encCache.get(l.src); if (!m) { m = {}; encCache.set(l.src, m); } if (!m[key]) { const w = Math.min(maxPx, l.w); const [c, x] = cv(w, Math.max(1, Math.round(w * l.h / l.w))); x.drawImage(l.src, 0, 0, c.width, c.height); const alpha = l.analysis && l.analysis.hasAlpha; m[key] = (q < 1 && !alpha) ? c.toDataURL("image/jpeg", q) : c.toDataURL("image/png"); } return m[key]; }
  function serializeLayer(l, ref) {
    const o = { id: l.id, kind: l.kind, name: l.name, keep: l.keep ? 1 : undefined, x: l.x, y: l.y, scale: l.scale, rot: l.rot, opacity: l.opacity, blend: l.blend, visible: l.visible, fx: l.fx, picks: l.picks, pickTol: l.pickTol, win: l.win, presetId: l.presetId, text: l.text, frame: l.frame, bg: l.bg, badge: l.badge };
    if (l.kind === "image" && l.src) o.src = ref(l);
    { const sb = l.kind === "image" && l.src && subjBySrc.get(l.src); if (sb) { if (!sb._url) { const [c, x] = cv(1024, Math.max(1, Math.round(1024 * l.h / l.w))); x.drawImage(sb, 0, 0, c.width, c.height); sb._url = c.toDataURL("image/png"); } o.subj = sb._url; } }
    if (l.maskImg) { if (!l._mk || l._mk.v !== l.maskVersion) { const [c, x] = cv(1024, Math.max(1, Math.round(1024 * l.h / l.w))); x.drawImage(l.maskImg, 0, 0, c.width, c.height); l._mk = { v: l.maskVersion, url: c.toDataURL("image/png") }; } o.mask = l._mk.url; }
    if (l.reliefImg) { if (!l._rk || l._rk.v !== l.reliefVersion) { const [c, x] = cv(1024, Math.max(1, Math.round(1024 * l.h / l.w))); x.drawImage(l.reliefImg, 0, 0, c.width, c.height); l._rk = { v: l.reliefVersion, url: c.toDataURL("image/png") }; } o.relief = l._rk.url; }
    return o;
  }
  /* version 4: a series of cards; every distinct image is stored once and referenced by the layers that use it */
  function projectData(maxPx = 1600, q = 1) {
    const images = {}; const keys = new Map(); let n = 0;
    const ref = l => { if (l.assetId) return "lib:" + l.assetId; let k = keys.get(l.src); if (!k) { k = "i" + (++n); keys.set(l.src, k); images[k] = encodeSrc(l, maxPx, q); } return "img:" + k; };
    const D = doc => ({ stock: doc.stock, layers: doc.layers.map(l => serializeLayer(l, ref)) });
    return { version: 4, app: "layrys", title: project.title, formatId: project.formatId, custom: project.custom, edge: project.edge, coatKind: project.coatKind, coat: project.coat, print: project.print, protect: project.protect, pack: project.pack, dieline: project.dieline, backStyle: project.backStyle, support: project.support, impose: project.impose, mock: project.mock, hiddenArts: project.hiddenArts, cardIndex: project.cardIndex, images, cards: project.cards.map(c => ({ id: c.id, name: c.name, rarity: c.rarity || "", notes: c.notes || "", front: D(c.front), back: D(c.back) })) };
  }
  function saveProject() { saveFile(`layrys-${slugify(project.title)}.json`, new Blob([JSON.stringify(projectData())], { type: "application/json" })); }
  $("#loadProject").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { loadProjectData(JSON.parse(rd.result)); toast("Projet ouvert"); } catch (err) { console.error(err); toast("Fichier de projet illisible"); } }; rd.readAsText(f); e.target.value = ""; });
  /* local persistence: IndexedDB (large projects), localStorage as fallback */
  function idb() { return new Promise((res, rej) => { if (!window.indexedDB) return rej(new Error("no idb")); const req = indexedDB.open("prisme-studio", 1); req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains("projects")) req.result.createObjectStore("projects"); }; req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); }
  function idbGet(key) { return idb().then(db => new Promise((res, rej) => { const tx = db.transaction("projects", "readonly"); const g = tx.objectStore("projects").get(key); g.onsuccess = () => res(g.result); g.onerror = () => rej(g.error); })); }
  function idbSet(key, value) { return idb().then(db => new Promise((res, rej) => { const tx = db.transaction("projects", "readwrite"); tx.objectStore("projects").put(value, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); })); }
  let saveTimer = null;
  function autosave() { clearTimeout(saveTimer); saveTimer = setTimeout(async () => { const n = project.cards.length; const stamp = () => { $("#saveState").textContent = `Enregistré localement · ${n} carte${n > 1 ? "s" : ""} · ` + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }; try { await idbSet("atelier", projectData(1600, 0.9)); stamp(); return; } catch (e) {} try { localStorage.setItem("prisme-project", JSON.stringify(projectData(1000, 0.82))); stamp(); } catch (e) { $("#saveState").textContent = "Projet trop lourd pour la sauvegarde automatique : utilise Exporter → Enregistrer le projet"; } }, 800); }
  function loadProjectData(d) {
    history.muted = true;
    project.formatId = FORMATS.some(f => f.id === d.formatId) ? d.formatId : "pokemon"; Object.assign(project.custom, d.custom || {}); project.edge = d.edge || ""; project.coatKind = d.coatKind || "gloss"; project.coat = d.coat ?? 60; Object.assign(project.print, d.print || {}); Object.assign(project.protect, d.protect || {}); Object.assign(project.pack, d.pack || {}); Object.assign(project.dieline, d.dieline || {}); Object.assign(project.backStyle, d.backStyle || {}); ui.backMigrate = !(d.backStyle && d.backStyle.v >= 2); if (ui.backMigrate) project.backStyle.style = "official"; project.backStyle.v = 2; Object.assign(project.impose, d.impose || {}); project.support = d.support || "booster"; project.title = d.title || "Ma série"; if (d.mock) { Object.assign(project.mock, d.mock); project.mock.opts = project.mock.opts || {}; project.mock.assign = project.mock.assign || {}; project.mock.light = project.mock.light || {}; } project.hiddenArts = Array.isArray(d.hiddenArts) ? d.hiddenArts.filter(x => typeof x === "string") : [];
    for (const doc of allDocs()) for (const l of doc.layers) for (const g of [R, RB, T, PK]) if (g) g.drop(l.id);
    const cardsData = d.cards && d.cards.length ? d.cards : [{ name: "Carte 1", front: d.front, back: d.back }];
    const imgCache = new Map(); const getImg = url => { if (!imgCache.has(url)) imgCache.set(url, new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; })); return imgCache.get(url); };
    let pending = 0, finished = false; const toRegen = [];
    const finish = () => { if (finished) return; finished = true; history.muted = false; history.stack = []; history.idx = -1; for (const c of project.cards) { c.thumb = ""; c.pre = null; } refreshLayers(); syncInspector(); invalidateThumbs(); renderSeries(true); ui.dirty = true; commit(); };
    const done = () => { if (--pending <= 0) finish(); };
    project.cards = cardsData.map((cd, ci) => {
      const card = { id: cd.id || uid(), name: cd.name || "Carte " + (ci + 1), rarity: cd.rarity || "", notes: cd.notes || "", thumb: "", pre: null, front: { id: "front", layers: [], stock: (cd.front && cd.front.stock) || "#f6f3ec", coat: 0.6 }, back: { id: "back", layers: [], stock: (cd.back && cd.back.stock) || "#f6f3ec", coat: 0.6 } };
      for (const id of ["front", "back"]) for (const sl of (cd[id] && cd[id].layers) || []) {
        const l = newLayer(sl.kind, sl.name); Object.assign(l, { x: sl.x, y: sl.y, scale: sl.scale, rot: sl.rot, opacity: sl.opacity, blend: sl.blend, visible: sl.visible, fx: { ...base, ...sl.fx }, picks: sl.picks || [], pickTol: sl.pickTol ?? 0.22, win: sl.win || l.win, keep: !!sl.keep, presetId: PRESET_BY_ID[sl.presetId] ? sl.presetId : "i-none", text: { ...l.text, ...sl.text }, frame: { ...l.frame, ...sl.frame }, bg: { ...l.bg, ...sl.bg }, badge: { ...l.badge, ...sl.badge } }); if (ui.backMigrate && l.kind === "back" && l.presetId === "h-rainbow") applyPreset(l, "i-none"); card[id].layers.push(l);
        if (sl.kind === "image" && sl.src) {
          let pr = null; if (sl.src.startsWith("lib:")) { const art = ART_LIBRARY.find(a => a.id === sl.src.slice(4)); if (art) { l.assetId = art.id; pr = loadArt(art); } } else if (sl.src.startsWith("img:")) { const url = (d.images || {})[sl.src.slice(4)]; if (url) pr = getImg(url); } else pr = getImg(sl.src);
          if (pr) { pending++; pr.then(im => sl.subj && !subjBySrc.get(im) ? getImg(sl.subj).then(si => { si._sid = ++subjSeq; subjBySrc.set(im, si); return im; }, () => im) : im).then(im => { setSrc(l, im); done(); }).catch(done); }
        } else if (sl.kind !== "image") toRegen.push(l);
        if (sl.mask) { const mi = new Image(); mi.onload = () => { l.maskImg = mi; l.maskVersion++; ui.dirty = true; }; mi.src = sl.mask; }
        if (sl.relief) { const ri = new Image(); ri.onload = () => { l.reliefImg = ri; l.reliefVersion = (l.reliefVersion || 0) + 1; ui.dirty = true; }; ri.src = sl.relief; }
      }
      return card;
    });
    project.cardIndex = Math.min(Math.max(0, d.cardIndex || 0), project.cards.length - 1); project.front = project.cards[project.cardIndex].front; project.back = project.cards[project.cardIndex].back;
    for (const l of toRegen) regen(l);
    $("#packTitle").value = project.pack.title; $("#packSub").value = project.pack.sub; $("#packsPerBox").value = project.pack.packs; $("#cardsPerPack").value = project.pack.cards; $("#boxColor").value = project.pack.boxColor; $("#packFinish").value = PRESET_BY_ID[project.pack.finish] ? project.pack.finish : "h-oil"; $("#boosterW").value = project.pack.boosterW; $("#boosterH").value = project.pack.boosterH; $("#crimp").value = project.pack.crimp; $("#fin").value = project.pack.fin; $("#boxW").value = project.dieline.boxW; $("#boxH").value = project.dieline.boxH; $("#boxD").value = project.dieline.boxD;
    $("#impSheet").value = project.impose.sheet; $("#impWhat").value = project.impose.what; $("#impCopies").value = project.impose.copies; $("#impBack").checked = !!project.impose.back;
    syncGlobalsToUI(); ui.selDoc = "front"; ui.selId = project.front.layers[project.front.layers.length - 1]?.id || null; ui.face = "front"; flipEl.style.setProperty("--flip", "0deg"); for (const b of $$("[data-face]")) b.setAttribute("aria-pressed", String(b.dataset.face === "front")); applyFormat(); renderFormats(); renderDielineOpts(); if (ui.page !== "atelier") setPage("atelier"); if (pending === 0) finish();
  }

  /* ---- boot ---- */
  const patSel = $("#pattern"); for (const [k, v] of Object.entries(P)) { const o = document.createElement("option"); o.value = v; o.textContent = PATTERN_LABELS[k]; patSel.append(o); }
  const palSel = $("#palette"); PALETTES.forEach((n, i) => { const o = document.createElement("option"); o.value = i; o.textContent = n; palSel.append(o); });
  const tintSel = $("#tint"); for (const [k, lab] of Object.entries(TINT_LABELS)) { const o = document.createElement("option"); o.value = k; o.textContent = lab; tintSel.append(o); }
  const accSel = $("#accentType"); for (const a of ACCENTS) { const o = document.createElement("option"); o.value = a.type; o.textContent = a.label; accSel.append(o); }
  renderFormats(); renderCatTabs(); renderDielineOpts(); renderRef();
  $("#fmtFilter").addEventListener("input", renderFormats);
  function defaultProject() {
    const art = ART_LIBRARY[0]; const l = newLayer("image", art.name); l.assetId = art.id; project.front.layers.push(l); ensureBackLayer(); ui.selDoc = "front"; ui.selId = l.id;
    applyPreset(l, "f-gold"); l.fx.mask = 10; l.fx.maskThr = 0.4; syncGlobalsToUI(); applyFormat(); refreshLayers(); syncInspector();
    loadArt(art).then(im => { setSrc(l, im); fitLayer(l, "cover"); applyFormat(); refreshLayers(); syncInspector(); invalidateThumbs(); ui.dirty = true; commit(); }).catch(() => { setSrc(l, makeFox()); fitLayer(l, "cover"); refreshLayers(); syncInspector(); commit(); });
  }
  (async () => {
    await null; let restored = false;
    if (!params.get("fresh")) { try { let d = await idbGet("atelier").catch(() => null); if (!d) { const saved = localStorage.getItem("prisme-project"); if (saved) d = JSON.parse(saved); } if (d && ((d.version === 4 && d.cards && d.cards.length) || (d.version === 3 && d.front && d.front.layers.length))) { loadProjectData(d); restored = true; } } catch (e) { console.warn(e); } }
    if (!restored) defaultProject();
  })();
  applyZoom(); updateUndo(); requestAnimationFrame(frame);
  if (document.fonts && document.fonts.load) Promise.all(["700 40px Unbounded", "800 40px Cinzel", "700 40px Manrope"].map(f => document.fonts.load(f).catch(() => null))).then(() => { for (const doc of allDocs()) for (const l of doc.layers) if (l.kind === "text" || l.kind === "badge" || l.kind === "back") regen(l); for (const c of project.cards) c.thumb = ""; renderBacks(); ui.dirty = true; });
  $("#shimBtn").addEventListener("click", () => shimmer());
  { /* the lamp can be dragged over the card, or set with the sliders */
    const hd = document.createElement("button"); hd.type = "button"; hd.id = "lightHandle"; hd.className = "lighthandle"; hd.hidden = true; hd.setAttribute("aria-label", "Lampe : glisser pour la déplacer, flèches pour ajuster"); hd.title = "Glisser pour déplacer la lampe"; $("#protect").append(hd); let drag = false;
    const at = e => { const r = card.getBoundingClientRect(); ML.x = clamp(Math.round(100 / r.width * (e.clientX - r.left)), -40, 140); ML.y = clamp(Math.round(100 / r.height * (e.clientY - r.top)), -40, 140); mlApply(); };
    hd.addEventListener("pointerdown", e => { e.stopPropagation(); e.preventDefault(); drag = true; hd.setPointerCapture(e.pointerId); hd.classList.add("grabbing"); });
    hd.addEventListener("pointermove", e => { e.stopPropagation(); if (drag) at(e); });
    const end = e => { e.stopPropagation(); drag = false; hd.classList.remove("grabbing"); }; hd.addEventListener("pointerup", end); hd.addEventListener("pointercancel", end);
    hd.addEventListener("keydown", e => { const k = e.key, st = e.shiftKey ? 10 : 2; if (k === "ArrowLeft") ML.x = clamp(ML.x - st, -40, 140); else if (k === "ArrowRight") ML.x = clamp(ML.x + st, -40, 140); else if (k === "ArrowUp") ML.y = clamp(ML.y - st, -40, 140); else if (k === "ArrowDown") ML.y = clamp(ML.y + st, -40, 140); else return; e.preventDefault(); e.stopPropagation(); mlApply(); });
    for (const [id, fn] of [["mlX", v => { ML.x = v; }], ["mlY", v => { ML.y = v; }], ["mlS", v => { ML.soft = v / 100; }], ["mlZ", v => { ML.z = v / 100; }], ["mlP", v => { ML.power = v / 100; }], ["mlW", v => { ML.warm = v / 100; }]]) $("#" + id).addEventListener("input", e => { fn(+e.target.value); mlApply(); });
    $("#mlReset").addEventListener("click", () => { Object.assign(ML, { x: 30, y: 22, z: 1, warm: 0, power: 1, soft: 0.2 }); mlApply(); });
    $("#lightSel").addEventListener("change", e => setLight(e.target.value));
    $("#reliefZone").addEventListener("change", e => { const l = sel(); if (!l) return; const v = +e.target.value; if (v === 3 && !l.reliefImg) { openMaskEditor("relief"); return; } l.fx.reliefZone = v; ui.dirty = true; invalidateThumbs(); commit(); });
    $("#reliefDetect").addEventListener("click", () => openMaskEditor("relief", "detect"));
    $("#reliefPaint").addEventListener("click", () => openMaskEditor("relief"));
    mlSync();
  }
  window.Layrys = window.Prisme = { shimmer, setCard, declineRarities, newCard, openMaskEditor, toggleCompare, toggleProof, exportVideo, exportImposition, exportPdf, preflightItems, renderSeries, setLight, LIGHTS, project, ui, PRESETS, FORMATS, sel, applyPreset, setPage, setFace, addImageLayer, snapshotDoc, exportPrintFiles, currentDieline, selectFormat, commit };
