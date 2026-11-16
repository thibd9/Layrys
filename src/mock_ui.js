  /* ================= mockups (v13): products, lighting, textures, scene, interface ================= */
  const PRODUCTS = [
    ["Cartes", [["card", "Carte seule", "épaisseur 0,33 mm", "card", 1], ["fan", "Éventail", "2 à 9 cartes", "fan", 0], ["row", "Rangée", "2 à 7 cartes", "row", 0], ["stack", "Pile de cartes", "tranche réelle", "pile", 0]]],
    ["Protections", [["sleeve", "Pochette", "souple", "card", 1], ["toploader", "Toploader", "rigide 3 × 4", "case", 1], ["semi", "Semi-rigide", "envoi en gradation", "case", 1], ["onetouch", "Boîtier magnétique", "one-touch 35 pt", "case", 1], ["slab", "Slab gradé", "PSA, BGS, CGC, SGC, TAG", "slab", 1]]],
    ["Présentation", [["stand", "Supports", "chevalets et socles", "case", 1], ["riser", "Gradins", "6 slabs", "slab", 6], ["wall9", "Cadre mural 3 × 3", "9 slabs", "grid", 9], ["led14", "Vitrine LED", "14 slabs éclairés", "slab", 14], ["acryl1", "Bloc acrylique", "1 carte, 4 vis", "block", 1], ["acryl3", "Bloc triple", "3 cartes, 6 vis", "block", 3], ["frame1", "Carte encadrée", "passe-partout", "frame", 1], ["frame3", "Cadre triptyque", "3 boîtiers", "frame", 3], ["binder", "Classeur", "s'ouvre, 9 pochettes", "grid", 9]]],
    ["Accessoires", [["playmat", "Tapis de jeu", "610 × 355 mm, néoprène", "mat", 5], ["coin", "Pièce de jeu", "Ø 37 mm", "coin", 0], ["storage", "Boîte de rangement", "400 ou 800 cartes", "boxo", 1]]],
    ["Emballages", [["tin", "Boîte métal", "couvercle illustré", "tin", 1], ["booster", "Booster", "sachet soudé", "booster", 0], ["blister", "Blister", "booster sous coque", "booster", 0], ["display", "Display", "12, 24 ou 36 boosters", "cube", 0], ["etb", "Coffret", "boîte fermée", "cube", 0], ["deckbox", "Deck box", "60 à 100 cartes", "cube", 0]]],
  ];
  /* lighting moods: key light direction (azimuth from the front, elevation), colours, fill, ambient, rim, environment, shadow strength, and the light used for the holographic render of the cards */
  const AMBIANCES = [
    ["studio", "Studio doux", { az: -35, el: 52, key: [1, 0.98, 0.95], ki: 0.62, fill: [0.34, 0.35, 0.37], amb: [0.3, 0.3, 0.31], rim: [0.3, 0.3, 0.32], env: 1, sh: 0.5, warm: 0, z: 1.2 }],
    ["contrast", "Contrasté", { az: -55, el: 40, key: [1, 0.97, 0.92], ki: 0.95, fill: [0.13, 0.14, 0.16], amb: [0.15, 0.15, 0.17], rim: [0.55, 0.55, 0.6], env: 0.8, sh: 0.78, warm: 0.05, z: 0.8 }],
    ["vitrine", "Vitrine", { az: 0, el: 74, key: [1, 0.9, 0.72], ki: 0.82, fill: [0.24, 0.22, 0.18], amb: [0.24, 0.22, 0.19], rim: [0.25, 0.22, 0.18], env: 0.9, sh: 0.6, warm: 0.4, z: 1.5 }],
    ["jour", "Lumière du jour", { az: 42, el: 46, key: [1, 1, 1], ki: 0.7, fill: [0.28, 0.31, 0.36], amb: [0.34, 0.36, 0.4], rim: [0.15, 0.17, 0.2], env: 1.1, sh: 0.45, warm: -0.15, z: 1.3 }],
    ["contre", "Contre-jour", { az: 152, el: 36, key: [1, 0.96, 0.9], ki: 0.9, fill: [0.36, 0.36, 0.38], amb: [0.2, 0.2, 0.22], rim: [0.9, 0.88, 0.85], env: 0.8, sh: 0.6, warm: 0.1, z: 1 }],
    ["neon", "Néon", { az: -70, el: 30, key: [1, 0.35, 0.85], ki: 0.75, fill: [0.12, 0.26, 0.34], amb: [0.14, 0.14, 0.2], rim: [0.15, 0.8, 0.95], env: 0.6, sh: 0.5, warm: -0.3, z: 1 }],
    ["sunset", "Crépuscule", { az: -78, el: 22, key: [1, 0.62, 0.35], ki: 0.92, fill: [0.16, 0.17, 0.26], amb: [0.2, 0.17, 0.2], rim: [0.6, 0.35, 0.18], env: 0.7, sh: 0.62, warm: 0.8, z: 1 }],
    ["uv", "Lampe UV", { az: 0, el: 60, key: [1, 1, 1], ki: 0.5, fill: [0.3, 0.3, 0.3], amb: [0.32, 0.32, 0.32], rim: [0, 0, 0], env: 0.3, sh: 0.25, warm: -0.25, z: 1.4, cenv: 1, dim: [0.2, 0.13, 0.5] }],
    ["dark", "Dans le noir", { az: 0, el: 60, key: [1, 1, 1], ki: 0.5, fill: [0.3, 0.3, 0.3], amb: [0.32, 0.32, 0.32], rim: [0, 0, 0], env: 0.05, sh: 0.05, warm: 0, z: 1.3, cenv: 2, dim: [0.035, 0.04, 0.06] }],
  ];
  const MK = { r: null, failed: false, scene: null, view: { yaw: -18, pitch: 6, dist: 420, tx: 0, ty: 0, tz: 0, fov: 26 }, home: null, goal: null, dirty: true, texDirty: true, queue: [], vkey: "", raf: 0, last: 0, slotSel: 0, demo: new Map(), stamp: 1, drag: null, pointers: new Map(), pinch: null, packDoc: null, texSize: 512, anim: { open: 1, lin: 1, goal: 1, page: 0, pageGoal: 0 }, userMoved: false, labelImg: null, labelSrc: "", texReady: new Set(), art: new Map(), artKey: "", mo: { t: 0, yaw: 0, ty: 0, pitch: 0 } };
  const mkProd = () => { for (const [, list] of PRODUCTS) for (const p of list) if (p[0] === project.mock.product) return p; return PRODUCTS[2][1][2]; };
  const mkOpts = () => (project.mock.opts[project.mock.product] = project.mock.opts[project.mock.product] || {});
  function mkSlotCount() { const id = mkProd()[0], o = mkOpts(); if (id === "fan") return clamp(o.count || 5, 2, 9); if (id === "row") return clamp(o.count || 4, 2, 7); if (id === "stack") return 1 + clamp(o.loose === undefined ? 2 : o.loose, 0, 3); if (id === "booster") return o.open ? 3 : 0; if (id === "display") return (o.cards === "0" || o.closed) ? 0 : 3; if (id === "binder") { const g = MockScenes.binderGrid(o); return 2 * g[0] * g[1] * clamp(Math.round(o.sheets || 2), 1, 3); } if (id === "playmat") return 1 + clamp(Math.round(o.count || 4), 1, 5); if (id === "deckbox") return 1; return mkProd()[4]; }
  const isSlabProd = id => id === "slab" || id === "riser" || id === "wall9" || id === "led14";
  function mkPool() {
    const cards = project.cards, i0 = project.cardIndex; const used = new Set(cards.map(c => (mainLayer(c) || {}).assetId).filter(Boolean));
    return [...cards.slice(i0), ...cards.slice(0, i0)].map(c => "c:" + c.id).concat(ART_LIBRARY.filter(a => !used.has(a.id)).map(a => "d:" + a.id));
  }
  function mkAssign() {
    const id = mkProd()[0], n = mkSlotCount(); const a = project.mock.assign[id] = project.mock.assign[id] || []; const pool = mkPool();
    for (let i = 0; i < n; i++) { const v = a[i]; const ok = v && (v[0] === "c" ? project.cards.some(c => c.id === v.slice(2)) : ART_LIBRARY.some(x => x.id === v.slice(2))); if (!ok) a[i] = pool[i % pool.length]; }
    return a;
  }
  function demoCard(artId) {
    const tpl = curCard(); let d = MK.demo.get(artId); const stamp = tpl.id + ":" + MK.stamp;
    if (d && d.stamp === stamp) return d.ready ? d.card : tpl;
    if (d && d.card && T) for (const doc of [d.card.front, d.card.back]) for (const l of doc.layers) T.drop(l.id);
    const art = ART_LIBRARY.find(a => a.id === artId); const c = cloneCard(tpl, art ? art.name : "Exemple"); d = { card: c, ready: false, stamp }; MK.demo.set(artId, d);
    const l = mainLayer(c); if (!art || !l) { d.ready = true; return c; }
    c.front.layers = c.front.layers.filter(x => x === l || x.kind !== "image");   // an example card shows one illustration: the other image layers of the model would hide it
    loadArt(art).then(im => { setSrc(l, im); l.assetId = art.id; l.name = art.name; l.visible = true; l.opacity = 1; fitLayer(l, "cover"); if (l.fx.mask === 4) { l.fx.mask = 10; l.maskImg = null; } d.ready = true; MK.texReady.clear(); MK.texDirty = true; MK.dirty = true; }).catch(() => { d.ready = true; });
    return tpl;
  }
  const mkCardFor = ref => (ref && ref[0] === "c" ? project.cards.find(c => c.id === ref.slice(2)) : ref ? demoCard(ref.slice(2)) : null) || curCard();
  function mkRefInfo(ref) { if (ref[0] === "c") { const i = project.cards.findIndex(c => c.id === ref.slice(2)); const c = project.cards[i]; return c ? { name: c.name, sub: "Carte " + pad3(i + 1), thumb: c.thumb && c.thumb.length > 4 ? c.thumb : "", pos: "" } : null; } const a = ART_LIBRARY.find(x => x.id === ref.slice(2)); return a ? { name: a.name, sub: "Exemple", thumb: a.src, pos: "50% 22%" } : null; }

  /* ---- visuals imported by the user, one per face; each face states the size it expects ---- */
  function mkArtFaces(id) {
    const p = project.pack, d = fmtDims(); const bo = [["booster.front", "Face avant du sachet", p.boosterW, p.boosterH], ["booster.back", "Dos du sachet", p.boosterW, p.boosterH]];
    if (id === "booster") return bo; if (id === "blister") return [["blister.card", "Carton du blister", p.boosterW + 36, p.boosterH + 70], ...bo];
    if (id === "display") { const D = MockScenes.displayDims({ w: p.boosterW, packs: p.packs }); return [["display.lid", "Fronton (intérieur du couvercle)", D.TW, D.TD], ["display.top", "Dessus du couvercle", D.TW, D.TD], ["display.front", `Face avant (ouvert, seuls les ${D.hf} mm du bas restent)`, D.TW, D.hb], ["display.side", "Côtés", D.TD, D.hb], ...bo]; }
    if (id === "etb") return [["etb.front", "Faces avant et arrière", 191, 165], ["etb.side", "Côtés", 89, 165], ["etb.top", "Dessus", 191, 89]];
    if (id === "deckbox") return [["deck.front", "Faces avant et arrière", 72, 95], ["deck.side", "Côtés", 45, 95], ["deck.top", "Dessus", 72, 45]];
    if (id === "playmat") return [["playmat.face", "Face du tapis", 610, 355]]; if (id === "tin") return [["tin.lid", "Couvercle", 172, 117]]; if (id === "coin") return [["coin.front", "Côté face", 37, 37], ["coin.back", "Côté pile", 37, 37]]; if (id === "sleeve") return [["sleeve.back", "Dos de la pochette", d.w + 3, d.h + 3.5]];
    if (id === "binder") { const B = MockScenes.binderDims(d.w, d.h, ...MockScenes.binderGrid(mkOpts())); return [["binder.cover", "Couverture", B.CW, B.CH], ["binder.spine", "Dos du classeur", B.S, B.CH]]; }
    return [];
  }
  function mkArtImg(key) {
    const src = (project.mock.art || {})[key]; if (!src) return null; let e = MK.art.get(key);
    if (!e || e.src !== src) { e = { src, im: new Image(), ok: false }; MK.art.set(key, e); e.im.onload = () => { e.ok = true; if (ui.page === "maquettes" && MK.r) { mkStatic(); MK.texDirty = true; MK.dirty = true; } }; e.im.src = src; }
    return e.ok ? e.im : null;
  }
  /* the image fills the face; it is cropped around its centre when the proportions differ */
  function coverTo(im, wmm, hmm, pw, ph) { const [c, x] = cv(pw, ph); const ta = wmm / hmm, iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; let sw = iw, sh = ih, sx = 0, sy = 0; if (iw / ih > ta) { sw = ih * ta; sx = (iw - sw) / 2; } else { sh = iw / ta; sy = (ih - sh) / 2; } x.imageSmoothingQuality = "high"; x.drawImage(im, sx, sy, sw, sh, 0, 0, pw, ph); return c; }
  const faceTex = (key, wmm, hmm, fallback, pw = 1024, ph = 1024) => { const im = mkArtImg(key); return im ? coverTo(im, wmm, hmm, pw, ph) : fallback(); };
  const mkArtInput = document.createElement("input"); mkArtInput.type = "file"; mkArtInput.accept = "image/*"; mkArtInput.hidden = true; mkArtInput.id = "mkArtFile"; document.body.append(mkArtInput);
  mkArtInput.addEventListener("change", e => { const f = e.target.files[0], key = MK.artKey; e.target.value = ""; if (!f || !key) return; loadFile(f, im => { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, k = Math.min(1, 1800 / Math.max(iw, ih)); const [c, x] = cv(Math.max(1, Math.round(iw * k)), Math.max(1, Math.round(ih * k))); const png = key === "label.logo"; if (!png) { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); } x.drawImage(im, 0, 0, c.width, c.height); (project.mock.art = project.mock.art || {})[key] = png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.9); mkArtImg(key); mockBuild(false); autosave(); toast("Visuel importé"); }); });

  /* ---- textures drawn on a 2D canvas: slab labels, binder covers, box faces ---- */
  function potFrom(c, pw, ph) { const [o, x] = cv(pw, ph); x.imageSmoothingQuality = "high"; x.drawImage(c, 0, 0, pw, ph); return o; }
  function logoPaths(x, px, py, h, color) { const paths = $$(".logo__tile svg path").map(p => p.getAttribute("d")); x.save(); x.translate(px, py); x.scale(h / 100, h / 100); x.fillStyle = color; for (const d of paths) { try { x.fill(new Path2D(d)); } catch (e) {} } x.restore(); }
  function boxArt(aspectWH, band) {
    const p = project.pack; const ml = mainLayer(curCard()); const c = packCanvas({ title: p.title, sub: p.sub, cards: p.cards, c1: p.boxColor, c2: "#3a2f6b" }, ml && ml.src ? ml.src : null, aspectWH);
    if (band) { const x = c.getContext("2d"); const W = c.width, H = c.height; x.fillStyle = "rgba(0,0,0,.62)"; x.fillRect(0, H * 0.935, W, H * 0.065); x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = `700 ${Math.round(H * 0.034)}px Figtree, sans-serif`; x.fillText(band, W / 2, H * 0.968); }
    return potFrom(c, 1024, 1024);
  }
  function boxPlain(w, h, title, sub) {
    const p = project.pack; const [c, x] = cv(1024, Math.max(64, Math.round(1024 * h / w))); const g = x.createLinearGradient(0, 0, c.width, c.height); g.addColorStop(0, p.boxColor); g.addColorStop(1, "#3a2f6b"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = "rgba(0,0,0,.5)"; x.shadowBlur = 12; const fs = Math.min(c.height * 0.3, c.width * 0.11); x.font = `800 ${fs}px Unbounded, Sora, sans-serif`; x.fillText(title, c.width / 2, c.height * (sub ? 0.42 : 0.5), c.width * 0.86);
    if (sub) { x.font = `600 ${fs * 0.36}px Figtree, sans-serif`; x.fillText(sub, c.width / 2, c.height * 0.68, c.width * 0.86); }
    return potFrom(c, 1024, 512);
  }
  function displayFront(D) {
    const p = project.pack; const [c, x] = cv(1024, 512); const g = x.createLinearGradient(0, 0, 1024, 512); g.addColorStop(0, p.boxColor); g.addColorStop(1, "#3a2f6b"); x.fillStyle = g; x.fillRect(0, 0, 1024, 512); const ly = 512 * (1 - D.hf / D.hb);
    x.fillStyle = "rgba(0,0,0,.26)"; x.fillRect(0, ly, 1024, 512 - ly); x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = "rgba(0,0,0,.5)"; x.shadowBlur = 10;
    x.font = `800 ${Math.round((512 - ly) * 0.52)}px Unbounded, Sora, sans-serif`; x.fillText(p.title, 512, ly + (512 - ly) / 2, 900); x.font = `800 ${Math.round(ly * 0.3)}px Unbounded, Sora, sans-serif`; x.fillText(p.sub || p.title, 512, ly * 0.42, 900);
    x.font = `600 ${Math.round(ly * 0.13)}px Figtree, sans-serif`; x.fillText(`${D.N} BOOSTERS · ${p.cards} CARTES PAR BOOSTER`, 512, ly * 0.74, 900); return c;
  }
  function matDefault() {
    const p = project.pack; const [c, x] = cv(1024, 512); const g = x.createLinearGradient(0, 0, 1024, 512); g.addColorStop(0, "#15121f"); g.addColorStop(1, p.boxColor); x.fillStyle = g; x.fillRect(0, 0, 1024, 512); const ml = mainLayer(curCard());
    if (ml && ml.src) { try { const im = ml.src, iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, dw = 620, dh = 512, s = Math.max(dw / iw, dh / ih); x.drawImage(im, (iw - dw / s) / 2, (ih - dh / s) * 0.25, dw / s, dh / s, 404, 0, dw, dh); const f = x.createLinearGradient(404, 0, 780, 0); f.addColorStop(0, "#15121f"); f.addColorStop(1, "rgba(21,18,31,0)"); x.fillStyle = f; x.fillRect(404, 0, 380, 512); } catch (e) {} }
    x.fillStyle = "#fff"; x.textBaseline = "alphabetic"; x.font = "800 62px Unbounded, Sora, sans-serif"; x.fillText(p.title, 56, 424, 420); x.font = "600 26px Figtree, sans-serif"; x.globalAlpha = 0.8; x.fillText(p.sub || "Tapis de jeu", 58, 466, 420); x.globalAlpha = 1; return c;
  }
  function coinFace(back) {
    const [c, x] = cv(512, 512); const m = mkOpts().metal; const cols = m === "silver" ? ["#f4f6fa", "#aab0bb", "#6d7380"] : m === "copper" ? ["#ffd0ad", "#c9774a", "#7a3d20"] : ["#fff0b8", "#e2b23c", "#8a6412"];
    const g = x.createRadialGradient(190, 170, 20, 256, 256, 300); g.addColorStop(0, cols[0]); g.addColorStop(0.55, cols[1]); g.addColorStop(1, cols[2]); x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = cols[2]; x.lineWidth = 10; x.beginPath(); x.arc(256, 256, 226, 0, 7); x.stroke(); x.strokeStyle = cols[0]; x.lineWidth = 3; x.beginPath(); x.arc(256, 256, 211, 0, 7); x.stroke();
    if (back) { x.fillStyle = cols[2]; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "800 62px Unbounded, Sora, sans-serif"; x.fillText((project.pack.title || "Layrys").toUpperCase().slice(0, 9), 256, 236, 350); x.font = "600 30px Figtree, sans-serif"; x.fillText("PILE", 256, 316); } else logoPaths(x, 256 - 106, 256 - 120, 240, cols[2]);
    return c;
  }
  function plateTex() {
    const [c, x] = cv(512, 128); const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, "#f3dc98"); g.addColorStop(0.5, "#c9a24a"); g.addColorStop(1, "#8f6c22"); x.fillStyle = g; x.fillRect(0, 0, 512, 128); x.strokeStyle = "rgba(60,40,5,.55)"; x.lineWidth = 3; x.strokeRect(9, 9, 494, 110);
    const name = (mkOpts().plateText || mkCardFor(mkAssign()[0]).name || "Carte").toUpperCase(); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "rgba(255,245,210,.55)"; x.font = "700 44px Sora, Figtree, sans-serif"; x.fillText(name, 256, 53, 450); x.fillStyle = "#3a2706"; x.fillText(name, 256, 51, 450);
    x.font = "600 21px Figtree, sans-serif"; x.fillStyle = "rgba(58,39,6,.8)"; x.fillText((project.title || "").toUpperCase(), 256, 93, 450); return c;
  }
  function packBack() {
    const p = project.pack; const [c, x] = cv(512, 1024); const g = x.createLinearGradient(0, 0, 512, 1024); g.addColorStop(0, "#3a2f6b"); g.addColorStop(1, p.boxColor); x.fillStyle = g; x.fillRect(0, 0, 512, 1024);
    x.fillStyle = "rgba(255,255,255,.12)"; x.fillRect(246, 0, 20, 1024); x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "800 54px Unbounded, Sora, sans-serif"; x.fillText(p.title, 256, 190, 440);
    x.font = "600 30px Figtree, sans-serif"; x.fillText(`${p.cards} cartes à collectionner`, 256, 250, 440); x.fillStyle = "rgba(255,255,255,.8)"; x.font = "500 22px Figtree, sans-serif";
    ["Série " + (project.title || ""), "Dès 6 ans. Ne convient pas aux enfants de moins de 3 ans.", "Contenu aléatoire. Conserver l'emballage."].forEach((t, i) => x.fillText(t, 256, 660 + i * 38, 440));
    x.fillStyle = "#fff"; x.fillRect(156, 800, 200, 96); x.fillStyle = "#111"; for (let i = 0, bx = 168; bx < 344; i++) { const w = 2 + ((i * 5) % 4) * 2; x.fillRect(bx, 810, w, 66); bx += w + 3 + (i % 2) * 2; }
    return c;
  }
  const LABEL_STYLES = { blanc: ["#fbfaf6", "#17150f", "#645e51"], noir: ["#131316", "#f4f1ea", "#b3aea2"], or: ["#e9c468", "#1c1304", "#5b4410"] };
  function labelRatio() { const d = fmtDims(); return (MockScenes.slabDims(mkOpts(), d.w, d.h)[0] - 9) / 21; }
  function slabLabel(slot, back) {
    const o = mkOpts(); const W = 1400, H = Math.round(W / labelRatio()), k = H / 413; const [c, x] = cv(W, H); const card = mkCardFor(mkAssign()[slot] || mkAssign()[0]); const idx = Math.max(0, project.cards.indexOf(card)); const [bg, fg, mut] = o.label === "custom" ? (() => { const b = o.labelBg || "#1f56c9", dk = lumHex(b) < 0.55; return [b, dk ? "#ffffff" : "#15130d", dk ? "rgba(255,255,255,.74)" : "rgba(20,18,12,.62)"]; })() : (LABEL_STYLES[o.label] || LABEL_STYLES.blanc);
    const grader = (o.grader === undefined ? "LAYRYS" : o.grader).toUpperCase(), gsub = (o.graderSub === undefined ? "GRADING" : o.graderSub).toUpperCase(), logo = o.logo !== "0"; const cert = o.cert ? o.cert + (mkSlotCount() > 1 ? "-" + (slot + 1) : "") : "LY" + String(20260000 + idx * 137 + 4219);
    x.fillStyle = bg; x.fillRect(0, 0, W, H); x.strokeStyle = fg; x.lineWidth = 6; x.strokeRect(12, 12, W - 24, H - 24); x.fillStyle = fg; x.textBaseline = "alphabetic";
    if (back) {
      const bx = logo ? 80 + H * 0.72 : 80; const ownB = mkArtImg("label.logo"); if (logo && ownB) { x.fillRect(80, H * 0.16, H * 0.6, H * 0.68); mkContain(x, ownB, 80 + H * 0.06, H * 0.23, H * 0.48, H * 0.54); } else if (logo) logoPaths(x, 80, H * 0.16, H * 0.68, fg); x.font = `700 ${78 * k}px Sora, Figtree, sans-serif`; x.fillText(grader, bx, H * 0.47, W * 0.5); x.font = `600 ${38 * k}px Figtree, sans-serif`; x.fillText((gsub ? gsub + " · " : "") + (o.backLine === undefined ? "AUTHENTIFICATION" : o.backLine).toUpperCase(), bx, H * 0.62, W * 0.5);
      x.font = `500 ${32 * k}px Figtree, sans-serif`; x.fillStyle = mut; x.fillText("Certificat " + cert, bx, H * 0.78, W * 0.5);
      let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const q = 13, cell = Math.floor(H * 0.052), qx = W - 70 - q * cell, qy = Math.round((H - q * cell) / 2); x.fillStyle = fg;
      for (let i = 0; i < q; i++) for (let j = 0; j < q; j++) { const fi = i < 4 ? i : i > q - 5 ? i - (q - 4) : -1, fj = j < 4 ? j : j > q - 5 ? j - (q - 4) : -1; const finder = fi >= 0 && fj >= 0 && !(i > q - 5 && j > q - 5); if (finder ? (fi === 0 || fi === 3 || fj === 0 || fj === 3) : rnd() > 0.52) x.fillRect(qx + i * cell, qy + j * cell, cell, cell); }
      return potFrom(c, 1024, 512);
    }
    const lw = Math.round(H * 0.56); x.fillRect(30, 30, lw, H - 60); const own = mkArtImg("label.logo"); if (logo) { const lh = (H - 60) * 0.5; if (own) mkContain(x, own, 30 + 14, 30 + (H - 60) * 0.11, lw - 28, lh); else logoPaths(x, 30 + (lw - lh * 0.88) / 2, 30 + (H - 60) * 0.11, lh, bg); } /* the mark is 88 wide for 100 high: centred in the block */ x.fillStyle = bg; x.textAlign = "center"; x.font = `700 ${(logo ? 40 : 52) * k}px Sora, Figtree, sans-serif`; x.fillText(grader, 30 + lw / 2, H * (logo ? 0.76 : 0.5), lw - 16); x.font = `600 ${26 * k}px Figtree, sans-serif`; x.fillText(gsub, 30 + lw / 2, H * (logo ? 0.86 : 0.62), lw - 16);
    x.textAlign = "left"; x.fillStyle = fg; const tx = 30 + lw + 34, gw = Math.round(H * 0.66), tw = W - tx - gw - 40; const fit = (t, y, font) => { x.font = font; let s = t; while (x.measureText(s).width > tw && s.length > 4) s = s.slice(0, -2); x.fillText(s === t ? t : s.trimEnd() + "…", tx, y); };
    fit((o.title || card.name || "Carte").toUpperCase(), H * 0.25, `700 ${54 * k}px Sora, Figtree, sans-serif`); fit((o.line2 === undefined ? (project.title || "") : o.line2).toUpperCase(), H * 0.39, `600 ${38 * k}px Figtree, sans-serif`);
    x.fillStyle = mut; fit(o.line3 || `${new Date().getFullYear()} · ${fmt().game} · N° ${pad3(idx + 1)}/${pad3(project.cards.length)}${card.rarity ? " · " + card.rarity.toUpperCase() : ""}`, H * 0.52, `500 ${32 * k}px Figtree, sans-serif`);
    x.fillStyle = fg; x.fillRect(tx, H * 0.58, tw, 3); const g = parseFloat(String(o.grade || "10").replace(",", ".")) || 10;
    if (o.subs === "0") { x.font = `600 ${34 * k}px Figtree, sans-serif`; x.fillStyle = mut; x.fillText("CERTIFICAT", tx, H * 0.71); x.font = `700 ${40 * k}px Sora, Figtree, sans-serif`; x.fillStyle = fg; x.fillText(cert, tx, H * 0.84, tw); }
    else mkSubGrades(o, g).forEach(([n, v], i) => { if (!n && !v) return; const cx = tx + (i % 2) * (tw / 2), cy = H * (0.71 + Math.floor(i / 2) * 0.13); x.font = `600 ${30 * k}px Figtree, sans-serif`; x.fillStyle = mut; x.fillText(String(n).toUpperCase(), cx, cy, tw / 2 - 110); x.font = `700 ${34 * k}px Sora, Figtree, sans-serif`; x.fillStyle = fg; x.fillText(String(v).replace(".", ","), cx + tw / 2 - 96, cy); });
    if (o.barcode !== "0") for (let i = 0, bx = tx; bx < tx + tw - 8; i++) { const w = 3 + ((i * 7) % 5) * 2; x.fillRect(bx, H * 0.9, w, H * 0.055); bx += w + 4 + (i % 3) * 3; }
    x.fillRect(W - gw - 22, 30, 4, H - 60); x.textAlign = "center"; const gs = String(o.grade || "10"); x.font = `700 ${(gs.length > 2 ? 150 : 215) * k}px Sora, Figtree, sans-serif`; x.fillText(gs, W - gw / 2 - 16, H * 0.62);
    x.font = `700 ${40 * k}px Figtree, sans-serif`; x.fillText((o.mention || "GEM MINT").toUpperCase(), W - gw / 2 - 16, H * 0.84, gw - 30);
    return potFrom(c, 1024, 512);
  }
  /* the four sub-grades: labels and values can be typed; an empty value follows the main grade */
  function mkSubGrades(o, g) { const L = o.subL || [], V = o.subV || [], dv = [Math.min(10, g), Math.min(10, g), Math.min(10, g), Math.min(10, g + 0.5)]; return ["Centrage", "Coins", "Côtés", "Surface"].map((n, i) => [L[i] === undefined ? n : L[i], (V[i] === undefined || V[i] === "") ? String(dv[i]) : V[i]]); }
  function mkContain(x, im, bx, by, bw, bh) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, s = Math.min(bw / iw, bh / ih); x.drawImage(im, bx + (bw - iw * s) / 2, by + (bh - ih * s) / 2, iw * s, ih * s); }
  /* an imported label image fills the label area (cropped to its proportions) */
  function slabLabelTex(slot) {
    const im = MK.labelImg; if (!im || !im.complete || !im.naturalWidth) return slabLabel(slot, false);
    const [c, x] = cv(1024, 512); const la = im.naturalWidth / im.naturalHeight, ta = labelRatio(); let sw = im.naturalWidth, sh = im.naturalHeight, sx = 0, sy = 0; if (la > ta) { sw = sh * ta; sx = (im.naturalWidth - sw) / 2; } else { sh = sw / ta; sy = (im.naturalHeight - sh) / 2; }
    x.fillStyle = "#fff"; x.fillRect(0, 0, 1024, 512); x.drawImage(im, sx, sy, sw, sh, 0, 0, 1024, 512); return c;
  }
  function loadLabel() { const src = project.mock.label || ""; if (src === MK.labelSrc) return; MK.labelSrc = src; MK.labelImg = null; if (!src) return; const im = new Image(); im.onload = () => { MK.labelImg = im; if (ui.page === "maquettes") { mkStatic(); MK.dirty = true; } }; im.src = src; }
  const lumHex = h => { const c = hexRgb(h); return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; };
  function binderCover() {
    const col = mkOpts().color || "#1c1f29"; const [c, x] = cv(830, 1024); const ink = lumHex(col) < 0.5 ? "#e9c468" : "#1c1304"; x.fillStyle = col; x.fillRect(0, 0, 830, 1024);
    x.strokeStyle = ink; x.globalAlpha = 0.55; x.lineWidth = 3; x.strokeRect(46, 46, 738, 932); x.strokeRect(60, 60, 710, 904); x.globalAlpha = 1;
    logoPaths(x, 415 - 77, 250, 175, ink); x.fillStyle = ink; x.textAlign = "center"; x.font = "700 70px Sora, Figtree, sans-serif"; x.fillText((project.title || "Ma série").toUpperCase().slice(0, 16), 415, 560, 640);
    x.font = "500 30px Figtree, sans-serif"; x.globalAlpha = 0.8; x.fillText(`COLLECTION · ${project.cards.length} CARTE${project.cards.length > 1 ? "S" : ""}`, 415, 618, 640); x.fillRect(335, 660, 160, 3); x.globalAlpha = 1;
    return potFrom(c, 1024, 1024);
  }
  function binderSpine() {
    const col = mkOpts().color || "#1c1f29"; const [c, x] = cv(120, 1024); const ink = lumHex(col) < 0.5 ? "#e9c468" : "#1c1304"; x.fillStyle = col; x.fillRect(0, 0, 120, 1024);
    x.save(); x.translate(60, 512); x.rotate(-Math.PI / 2); x.fillStyle = ink; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "700 46px Sora, Figtree, sans-serif"; x.fillText((project.title || "Ma série").toUpperCase().slice(0, 18), 0, 2, 760); x.restore();
    x.fillStyle = ink; x.globalAlpha = 0.6; x.fillRect(22, 60, 76, 3); x.fillRect(22, 961, 76, 3); return potFrom(c, 128, 1024);
  }
  function blisterCard() {
    const p = project.pack; const bw = p.boosterW + 36, bh = p.boosterH + 70; const [c, x] = cv(720, Math.round(720 * bh / bw)); const H = c.height, mm = 720 / bw; const g = x.createLinearGradient(0, 0, 720, H); g.addColorStop(0, "#3a2f6b"); g.addColorStop(1, p.boxColor); x.fillStyle = g; x.fillRect(0, 0, 720, H);
    x.fillStyle = "rgba(0,0,0,.82)"; const hw = 30 * mm, hh = 7 * mm, hx = 360 - hw / 2, hy = 9 * mm; x.beginPath(); x.moveTo(hx + hh / 2, hy); x.arcTo(hx + hw, hy, hx + hw, hy + hh, hh / 2); x.arcTo(hx + hw, hy + hh, hx, hy + hh, hh / 2); x.arcTo(hx, hy + hh, hx, hy, hh / 2); x.arcTo(hx, hy, hx + hw, hy, hh / 2); x.fill();
    x.fillStyle = "#fff"; x.textAlign = "center"; x.shadowColor = "rgba(0,0,0,.5)"; x.shadowBlur = 14; x.font = `800 ${8.5 * mm}px Unbounded, Sora, sans-serif`; x.fillText(p.title, 360, 31 * mm, 640); x.font = `600 ${3.6 * mm}px Figtree, sans-serif`; x.fillText(`${p.sub} · ${p.cards} cartes`, 360, 38 * mm, 640); x.shadowBlur = 0;
    x.fillStyle = "rgba(255,255,255,.75)"; x.font = `500 ${2.7 * mm}px Figtree, sans-serif`; x.fillText("Série " + (project.title || ""), 360, H - 6 * mm, 640);
    return potFrom(c, 1024, 1024);
  }
  function mkStatic() {
    if (!MK.r) return; const id = mkProd()[0], r = MK.r, p = project.pack;
    if (isSlabProd(id)) { const n = mkSlotCount(); for (let i = 0; i < n; i++) r.upload(r.tex("label" + i), slabLabelTex(i)); r.upload(r.tex("labelb"), slabLabel(0, true)); }
    if (id === "booster" || id === "display" || id === "blister") {
      const ca = p.boosterW / p.boosterH; const ml = mainLayer(curCard()); if (!MK.packLayer) MK.packLayer = newLayer("image", "Booster"); const l = MK.packLayer; const own = mkArtImg("booster.front");
      setSrc(l, own ? coverTo(own, p.boosterW, p.boosterH, 768, Math.round(768 / ca)) : packCanvas({ title: p.title, sub: p.sub, cards: p.cards, c1: p.boxColor, c2: "#3a2f6b" }, ml && ml.src ? ml.src : null, ca)); l.scale = 1; l.x = 0.5; l.y = 0.5; l.rot = 0; applyPreset(l, PRESET_BY_ID[p.finish] ? p.finish : "h-oil"); l.fx.mask = 0;
      MK.packDoc = { id: "pack", layers: [l], stock: p.boxColor, coat: 0.5 }; MK.packAspect = ca; r.upload(r.tex("packb"), faceTex("booster.back", p.boosterW, p.boosterH, packBack, 512, 1024));
    } else MK.packDoc = null;
    if (id === "blister") r.upload(r.tex("blister"), faceTex("blister.card", p.boosterW + 36, p.boosterH + 70, blisterCard));
    if (id === "display") { const D = MockScenes.displayDims({ w: p.boosterW, packs: p.packs }); r.upload(r.tex("boxf"), faceTex("display.lid", D.TW, D.TD, () => boxArt(D.TW / D.TD, `${D.N} BOOSTERS · ${p.cards} CARTES`))); r.upload(r.tex("boxtop"), faceTex("display.top", D.TW, D.TD, () => boxPlain(D.TW, D.TD, p.title, p.sub || `${D.N} boosters`), 1024, 512)); r.upload(r.tex("boxfront"), faceTex("display.front", D.TW, D.hb, () => displayFront(D), 1024, 512)); r.upload(r.tex("boxs"), faceTex("display.side", D.TD, D.hb, () => boxPlain(D.TD, D.hb, p.sub || p.title), 1024, 512)); }
    if (id === "etb") { r.upload(r.tex("boxf"), faceTex("etb.front", 191, 165, () => boxArt(191 / 165, "COFFRET"))); r.upload(r.tex("boxs"), faceTex("etb.side", 89, 165, () => boxPlain(89, 165, p.title, p.sub), 512, 1024)); r.upload(r.tex("boxt"), faceTex("etb.top", 191, 89, () => boxPlain(191, 89, p.title, "boosters, pochettes, dés"), 1024, 512)); }
    if (id === "deckbox") { r.upload(r.tex("boxdeck"), faceTex("deck.front", 72, 95, () => boxArt(72 / 95, "DECK"))); r.upload(r.tex("boxs"), faceTex("deck.side", 45, 95, () => boxPlain(45, 95, p.title), 512, 1024)); r.upload(r.tex("boxt"), faceTex("deck.top", 72, 45, () => boxPlain(72, 45, p.title), 1024, 512)); }
    if (id === "frame1" && mkOpts().plate) r.upload(r.tex("plate"), plateTex());
    if (id === "playmat") r.upload(r.tex("mat"), faceTex("playmat.face", 610, 355, matDefault, 2048, 1024));
    if (id === "tin") r.upload(r.tex("tinlid"), faceTex("tin.lid", 172, 117, () => boxArt(172 / 117, "ÉDITION COLLECTOR")));
    if (id === "coin") { r.upload(r.tex("coinf"), faceTex("coin.front", 37, 37, () => coinFace(false), 512, 512)); r.upload(r.tex("coinb"), faceTex("coin.back", 37, 37, () => coinFace(true), 512, 512)); }
    if (id === "sleeve") { const sb = mkArtImg("sleeve.back"); if (sb) r.upload(r.tex("sleeveb"), coverTo(sb, fmtDims().w + 3, fmtDims().h + 3.5, 512, 1024)); }
    if (id === "binder") { const B = MockScenes.binderDims(fmtDims().w, fmtDims().h, ...MockScenes.binderGrid(mkOpts())); r.upload(r.tex("bcover"), faceTex("binder.cover", B.CW, B.CH, binderCover)); r.upload(r.tex("bspine"), faceTex("binder.spine", B.S, B.CH, binderSpine, 128, 1024)); }
  }

  /* ---- scene ---- */
  function cssRgb(name) { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); const m = /^#([0-9a-f]{6})$/i.exec(v); return m ? hexRgb(v) : [0.86, 0.85, 0.82]; }
  function fitDist(ext) { const c = MK.r.canvas; const asp = Math.max(0.3, c.clientWidth / Math.max(1, c.clientHeight)); return Math.max(ext[1], ext[0] / asp) / (2 * Math.tan(13 * Math.PI / 180)) * 1.06; }
  function mkFloor() {
    const f = project.mock.floor || "studio"; const dark = f === "dark" || (f === "studio" && isDark());
    if (f === "wood") return { bg: [0.09, 0.075, 0.065], color: [0.56, 0.4, 0.26], style: 1, shadow: 1.2, mirror: 0.07 };
    if (f === "felt") return { bg: [0.03, 0.07, 0.055], color: [0.1, 0.34, 0.24], style: 2, shadow: 1.2, mirror: 0 };
    if (f === "slate") return { bg: [0.06, 0.065, 0.075], color: [0.25, 0.27, 0.3], style: 3, shadow: 1.25, mirror: 0.14 };
    if (f === "studio") return { bg: cssRgb("--stage"), color: cssRgb("--stage-2"), style: 0, shadow: dark ? 1.4 : 0.9, mirror: dark ? 0.24 : 0.12 };
    return dark ? { bg: [0.035, 0.035, 0.043], color: [0.12, 0.12, 0.14], style: 0, shadow: 1.4, mirror: 0.24 } : { bg: [0.86, 0.85, 0.82], color: [0.94, 0.93, 0.9], style: 0, shadow: 0.9, mirror: 0.12 };
  }
  function mkEdge() { const e = project.edge; if (e === "gold") return { rgb: [0.96, 0.78, 0.36], metal: 1, core: 0 }; if (e === "silver") return { rgb: [0.85, 0.87, 0.9], metal: 1, core: 0 }; if (e === "black") return { rgb: [0.06, 0.06, 0.07], metal: 0, core: 0 }; if (e === "red") return { rgb: [0.8, 0.12, 0.12], metal: 0, core: 0 }; return { rgb: [0.93, 0.92, 0.88], metal: 0, core: project.print.core === "white core" ? 0 : 0.85 }; }
  const mkAmb = () => { const st = project.mock.light = project.mock.light || {}; return AMBIANCES.find(a => a[0] === st.amb) || AMBIANCES[0]; };
  /* products with their own light: their cards stay visible in the dark */
  const mkSelfLit = () => { const id = mkProd()[0]; return id === "led14" || (id === "acryl3" && !!mkOpts().led) || (id === "stand" && mkOpts().model === "led"); };
  function mkLight() {
    const st = project.mock.light = project.mock.light || {}; const A = mkAmb()[2]; const num = (v, d) => (v === undefined || v === null ? d : v);
    const az = num(st.az, A.az) * Math.PI / 180, el = clamp(num(st.el, A.el), 12, 88) * Math.PI / 180, pw = num(st.power, 1);
    return { key: [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)], keyCol: A.key.map(v => v * A.ki * pw), fillCol: A.fill.map(v => v * (0.55 + 0.45 * pw)), ambCol: A.amb, rimCol: A.rim, env: A.env, exp: 1, dim: A.dim || [1, 1, 1], shadow: Math.min(0.95, A.sh * num(st.shadow, 1) * mkFloor().shadow), soft: 1, mirror: mkFloor().mirror * num(st.mirror, 1), card: { warm: A.warm, z: A.z, env: mkSelfLit() && A.cenv === 2 ? 0 : (A.cenv || 0) } };
  }
  /* ---- animations: products that open, and a motion of the whole mockup ---- */
  const MK_OPEN = { binder: 1.15, booster: 1.9, display: 1.4, etb: 1.2, deckbox: 0.9, tin: 1.3 };
  const mkAnimated = () => project.mock.animate !== false && !reduceMotion;
  function mkAnimInit(play) {
    const id = mkProd()[0], o = mkOpts(); clearTimeout(MK.animTimer); let g = 1; if (id === "booster" || id === "etb" || id === "deckbox" || id === "tin") g = o.open ? 1 : 0; else if (id === "display") g = o.closed ? 0 : 1;
    MK.anim = { open: g, lin: g, goal: g, page: 0, pageGoal: 0 }; if (id === "binder" && play && mkAnimated()) { MK.anim.open = MK.anim.lin = MK.anim.goal = 0; MK.animTimer = setTimeout(() => binderPlay(1), 650); }
  }
  function mkToggleOpen() {
    const id = mkProd()[0], o = mkOpts(); const open = !(MK.anim.goal > 0.5); if (id === "booster" || id === "etb" || id === "deckbox" || id === "tin") o.open = open; if (id === "display") o.closed = !open; if (id === "binder" && !open) { MK.anim.page = 0; MK.anim.pageGoal = 0; }
    clearTimeout(MK.animTimer); MK.anim.goal = open ? 1 : 0; if (!mkAnimated()) { MK.anim.lin = MK.anim.goal; MK.anim.open = MK.anim.goal; } const n = mkSlotCount(); MK.slotSel = Math.min(MK.slotSel, Math.max(0, n - 1)); mockGeometry(); $("#mkCaption").textContent = MK.scene.caption; MK.dirty = true; renderMkSlots(); renderMkPicker(); renderMkFields(); mkTabsSync(); autosave();
  }
  const mkMoReset = () => { MK.mo.yaw = MK.mo.ty = MK.mo.pitch = 0; };
  /* motion is applied as an offset on the view, so the mockup can still be turned by hand while it moves */
  function mkMotion(dt) {
    const v = MK.view, st = MK.mo; const mo = reduceMotion ? "" : (project.mock.motion || ""); const free = !MK.drag; if (mo === "sway" || mo === "float") st.osc = mo;
    const spinTo = mo === "spin" && free ? 1 : 0, oscTo = (mo === "sway" || mo === "float") && free ? 1 : 0; st.spin = (st.spin || 0) + (spinTo - (st.spin || 0)) * (1 - Math.exp(-dt * 3)); st.amp = (st.amp || 0) + (oscTo - (st.amp || 0)) * (1 - Math.exp(-dt * (oscTo ? 2.4 : 4)));
    if (!spinTo && st.spin < 0.003) st.spin = 0; if (!oscTo && st.amp < 0.003) st.amp = 0; if (!st.spin && !st.amp && !st.yaw && !st.ty && !st.pitch) return false;
    st.t += dt; if (st.spin) v.yaw += dt * 16 * st.spin; let yaw = 0, ty = 0, pitch = 0;
    if (st.osc === "sway") yaw = 16 * Math.sin(st.t * 0.9); else if (st.osc === "float") { ty = Math.sin(st.t * 1.2) * (MK.scene ? MK.scene.ext[1] * 0.022 : 2); yaw = 5 * Math.sin(st.t * 0.6); pitch = 2 * Math.sin(st.t * 0.8 + 1); }
    const k = 1 - Math.exp(-dt * 9), ny = st.yaw + (yaw * st.amp - st.yaw) * k, nt = st.ty + (ty * st.amp - st.ty) * k, np = st.pitch + (pitch * st.amp - st.pitch) * k; const done = !st.amp && Math.abs(ny) + Math.abs(nt) + Math.abs(np) < 0.01;
    const fy = done ? 0 : ny, ft = done ? 0 : nt, fp = done ? 0 : np; v.yaw += fy - st.yaw; v.ty += ft - st.ty; v.pitch = clamp(v.pitch + fp - st.pitch, -89, 89); st.yaw = fy; st.ty = ft; st.pitch = fp; return true;
  }
  function mockGeometry() {
    const pr = mkProd(), d = fmtDims(), p = project.pack, fl = mkFloor();
    const sc = MockScenes.build(pr[0], { W: d.w, H: d.h, R: d.r, opts: mkOpts(), tex: k => MK.r.tex(k), mesh: (k, b) => MK.r.mesh(k, b), floor: fl, edge: mkEdge(), anim: MK.anim, art: Object.fromEntries(Object.keys(project.mock.art || {}).map(k => [k, true])), pack: { w: p.boosterW, h: p.boosterH, crimp: p.crimp, cards: p.cards, packs: p.packs, color: p.boxColor }, box: boxDims(p.packs) });
    sc.bg = fl.bg; MK.scene = sc; MK.home = { yaw: sc.cam.yaw, pitch: sc.cam.pitch, dist: fitDist(sc.ext), tx: sc.target[0], ty: sc.target[1], tz: sc.target[2] }; return sc;
  }
  function mockBuild(resetView) {
    if (!MK.r) return; const pr = mkProd(); const n = mkSlotCount(); MK.slotSel = Math.min(MK.slotSel, Math.max(0, n - 1)); MK.texSize = ui.quality < 1 ? (n > 3 ? 256 : 512) : (n > 3 ? 512 : 1024);
    loadLabel(); MK.texReady.clear(); const sc = mockGeometry();
    if (resetView || MK.viewFor !== pr[0]) { Object.assign(MK.view, MK.home); mkMoReset(); MK.goal = null; MK.viewFor = pr[0]; MK.userMoved = false; }
    $("#mkTitle").textContent = pr[1]; $("#mkCaption").textContent = sc.caption; mkStatic(); MK.texDirty = true; MK.dirty = true;
    renderMkProducts(); renderMkSlots(); renderMkPicker(); renderMkFields(); renderMkLights(); mkTabsSync();
  }
  function mkRenderTex(frame, doc, key, cam, lt, aspectWH, w, h) {
    const V = Mock3D.V; const toEye = V.norm(V.sub(cam.eye, frame.c)); const vl = [V.dot(toEye, frame.r), V.dot(toEye, frame.u), V.dot(toEye, frame.n)], ll = [V.dot(lt.key, frame.r), V.dot(lt.key, frame.u), V.dot(lt.key, frame.n)];
    const lz = Math.max(ll[2], 0.14), z = 0.6 * (lt.card.z || 1); const pointer = [clamp(0.5 + (ll[0] / lz) * z / (1.1 * aspectWH), -1.5, 2.5), clamp(0.5 + (ll[1] / lz) * z / 1.1, -1.5, 2.5)];
    thumbCanvas.width = w; thumbCanvas.height = h;
    T.renderDoc(doc, { pointer, tilt: [Math.asin(clamp(vl[0], -0.95, 0.95)), Math.asin(clamp(vl[1], -0.95, 0.95))], aspect: aspectWH, intensity: ui.intensity * (ll[2] > 0 ? 1 : 0.35), seed: ui.seed, selectedId: null, view: 0, light: { warm: lt.card.warm || 0, z: lt.card.z || 1 }, proof: ui.proof, env: lt.card.env || 0 });
    MK.r.upload(MK.r.tex(key), thumbCanvas);
  }
  function mkRenderSlot(i, cam, lt) {
    const s = MK.scene.slots[i]; if (!s) return; const c = mkCardFor(mkAssign()[i]); const V = Mock3D.V; const front = !!s.warm || V.dot(V.sub(cam.eye, s.c), s.n) >= 0;
    const fr = front ? s : { c: s.c, r: V.mul(s.r, -1), u: s.u, n: V.mul(s.n, -1) }; mkRenderTex(fr, front ? c.front : c.back, "s" + i + (front ? "f" : "b"), cam, lt, aspect(), MK.texSize, MK.texSize); MK.texReady.add("s" + i + (front ? "f" : "b"));
  }
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const mkTexKey = (i, cam) => { const s = MK.scene.slots[i], V = Mock3D.V; return "s" + i + (s.warm || V.dot(V.sub(cam.eye, s.c), s.n) >= 0 ? "f" : "b"); };
  function mockFrame(now) {
    MK.raf = 0; if (ui.page !== "maquettes" || !MK.r || !MK.scene) return;
    const raw = (now - MK.last) / 1000 || 0.016; MK.last = now; const real = Math.min(ui.quality < 1 ? 0.25 : 0.066, raw), dt = Math.min(0.05, raw); /* on a slow device the opening finishes on time rather than frame by frame */ MK.ft = MK.ft === undefined ? 0.016 : MK.ft * 0.88 + Math.min(raw, 0.1) * 0.12; const v = MK.view; let moving = false;
    const pid = mkProd()[0]; let rebuilt = false;
    if (MK.anim.lin !== MK.anim.goal) { const dur = MK_OPEN[pid]; MK.anim.lin = dur && mkAnimated() ? clamp(MK.anim.lin + Math.sign(MK.anim.goal - MK.anim.lin) * real / dur, 0, 1) : MK.anim.goal; MK.anim.open = pid === "binder" ? easeIO(MK.anim.lin) : MK.anim.lin; rebuilt = true; if (MK.anim.lin === MK.anim.goal) renderMkFields(); }
    if (pid === "binder" && MK.anim.page !== MK.anim.pageGoal) { const d = MK.anim.pageGoal - MK.anim.page, st = real / 0.95; MK.anim.page = (!mkAnimated() || Math.abs(d) <= st) ? MK.anim.pageGoal : MK.anim.page + Math.sign(d) * st; rebuilt = true; }
    if (rebuilt) { mockGeometry(); if (!MK.userMoved) { Object.assign(v, MK.home); mkMoReset(); } $("#mkCaption").textContent = MK.scene.caption; moving = true; MK.animating = true; }
    else if (MK.animating) { MK.animating = false; MK.texDirty = true; moving = true; }
    if (MK.goal) { const k = 1 - Math.exp(-dt * 9); let far = 0; for (const key of ["yaw", "pitch", "dist", "tx", "ty", "tz"]) { const d = MK.goal[key] - v[key]; v[key] += d * k; far = Math.max(far, Math.abs(d) / (key === "dist" ? v.dist * 0.01 : 0.2)); } if (far < 1) { Object.assign(v, MK.goal); MK.goal = null; } moving = true; }
    if (MK.inertia && !MK.drag) { const f = dt * 60, k = Math.exp(-dt * 4.2); v.yaw += MK.inertia.yaw * f; v.pitch = clamp(v.pitch + MK.inertia.pitch * f, -89, 89); MK.inertia.yaw *= k; MK.inertia.pitch *= k; if (Math.abs(MK.inertia.yaw) + Math.abs(MK.inertia.pitch) < 0.02) MK.inertia = null; moving = true; }
    if (mkMotion(dt)) moving = true;
    const lt = mkLight();
    if (MK.r.resize(ui.quality < 1 ? 0.6 : 1)) { MK.dirty = true; if (MK.home) MK.home.dist = fitDist(MK.scene.ext); }
    if ((moving || MK.dirty || MK.queue.length || MK.warmLeft) && !ui.busy && T) {
      const cam = MK.r.camera(v); const vkey = [v.yaw, v.pitch, v.dist, v.tx, v.ty, v.tz, lt.key.join(), (project.mock.light || {}).amb, MK.anim.open, MK.anim.page].map(x => typeof x === "number" ? x.toFixed(2) : x).join("|");
      const hidden = pid === "binder" && MK.anim.open < 0.04; const all = hidden ? [] : MK.scene.slots.map((s, i) => i).filter(i => MK.scene.slots[i]), vis = all.filter(i => !MK.scene.slots[i].warm);
      /* while something opens, the images of the cards are refreshed a few times per second only: the movement keeps its frames */
      const throttled = MK.animating && !MK.texDirty && now - (MK.texAt || 0) < 160;
      if ((vkey !== MK.vkey || MK.texDirty) && !throttled) { MK.vkey = vkey; MK.texDirty = false; MK.texAt = now; const k0 = vis.length ? (MK.rr || 0) % vis.length : 0; MK.queue = vis.slice(k0).concat(vis.slice(0, k0)); if (MK.packDoc && MK.scene.pack) MK.queue.unshift("pack"); }
      /* a card that has never been drawn goes first; hidden neighbours are prepared when nothing else is waiting */
      const fresh = vis.filter(i => !MK.texReady.has(mkTexKey(i, cam))); if (fresh.length) MK.queue = fresh.concat(MK.queue.filter(i => fresh.indexOf(i) < 0));
      const warm = all.filter(i => MK.scene.slots[i].warm && !MK.texReady.has(mkTexKey(i, cam))); MK.warmLeft = warm.length; if (!MK.queue.length && warm.length && !MK.animating) MK.queue.push(warm[0]);
      let budget = ui.quality < 1 ? 1 : (MK.ft > 0.026 ? 1 : MK.ft > 0.02 ? 2 : 3); if (MK.animating) budget = 1; if (fresh.length) budget = Math.max(budget, Math.min(fresh.length, MK.animating ? 2 : (ui.quality < 1 ? 2 : 4)));
      while (MK.queue.length && budget-- > 0) { const i = MK.queue.shift(); if (i !== "pack") MK.rr = (MK.rr || 0) + 1; if (i === "pack") { if (!MK.scene.pack) continue; const p = project.pack; const s = MK.scene.pack; mkRenderTex({ c: s.o, r: s.x, u: s.y, n: s.z }, MK.packDoc, "packf", cam, lt, MK.packAspect || p.boosterW / p.boosterH, ui.quality < 1 ? 256 : 512, ui.quality < 1 ? 512 : 1024); } else if (MK.scene.slots[i]) mkRenderSlot(i, cam, lt); }
      MK.r.draw(MK.scene, v, lt); MK.dirty = false;
    }
    MK.raf = requestAnimationFrame(mockFrame);
  }
  function mockDirty() { MK.dirty = true; }
  function mockInvalidate(rebuild) { MK.stamp++; MK.texReady.clear(); if (ui.page !== "maquettes" || !MK.r) return; if (rebuild) mockBuild(false); else { MK.texDirty = true; MK.dirty = true; } }
  function binderPlay(goal) { MK.anim.goal = goal; MK.dirty = true; }
  function mockEnter() {
    if (!MK.r && !MK.failed) { try { MK.r = Mock3D.create($("#mkCanvas")); } catch (e) { console.error(e); MK.failed = true; $("#mkCaption").textContent = "WebGL n'est pas disponible : les maquettes en volume ne peuvent pas s'afficher."; } }
    if (!MK.r) return; MK.stamp++; $("#mkFloor").value = project.mock.floor || "studio"; if (project.mock.auto && !project.mock.motion) project.mock.motion = "spin"; project.mock.auto = false; $("#mkMotion").value = project.mock.motion || ""; mkAnimInit(false);
    MK.r.resize(ui.quality < 1 ? 0.6 : 1); mockBuild(false); MK.last = performance.now(); if (!MK.raf) MK.raf = requestAnimationFrame(mockFrame);
  }
  function mockLeave() { if (MK.raf) { cancelAnimationFrame(MK.raf); MK.raf = 0; } if (T) for (const d of MK.demo.values()) for (const doc of [d.card.front, d.card.back]) for (const l of doc.layers) T.drop(l.id); MK.demo.clear(); }
  function mockSet(id) {
    project.mock.product = id; MK.slotSel = 0; mkAnimInit(true);
    mockBuild(true); autosave();
  }
  async function mockCapture() {
    if (!MK.r || !MK.scene) return; MK.r.draw(MK.scene, MK.view, mkLight()); $("#captureImg").src = MK.r.canvas.toDataURL("image/png"); $("#captureBox").hidden = false;
    const blob = await toBlob(MK.r.canvas); if (blob) saveFile("layrys-maquette-" + slugify(mkProd()[1]) + ".png", blob);
  }

  /* ---- mockup interface ---- */
  function renderMkProducts() {
    const cats = $("#mkCats"), el = $("#mkProducts"); cats.innerHTML = ""; el.innerHTML = ""; const curCat = PRODUCTS.findIndex(([, list]) => list.some(p => p[0] === project.mock.product)); if (MK.cat === undefined || MK.catFor !== project.mock.product) { MK.cat = Math.max(0, curCat); MK.catFor = project.mock.product; }
    PRODUCTS.forEach(([group], i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = group; b.setAttribute("aria-pressed", String(i === MK.cat)); b.addEventListener("click", () => { MK.cat = i; renderMkProducts(); }); cats.append(b); });
    for (const [id, name, sub, ico] of PRODUCTS[MK.cat][1]) { const b = document.createElement("button"); b.type = "button"; b.className = "prod"; b.dataset.prod = id; b.title = name + " · " + sub; b.setAttribute("aria-pressed", String(project.mock.product === id)); b.innerHTML = ICO(ico); const t = document.createElement("div"); const nb = document.createElement("b"); nb.textContent = name; const sp = document.createElement("span"); sp.textContent = sub; t.append(nb, sp); b.append(t); b.addEventListener("click", () => mockSet(id)); el.append(b); }
    const on = el.querySelector('[aria-pressed="true"]'); if (on && el.scrollWidth > el.clientWidth) { const x0 = on.offsetLeft - el.offsetLeft; if (x0 < el.scrollLeft + 8 || x0 + on.offsetWidth > el.scrollLeft + el.clientWidth - 8) el.scrollLeft = Math.max(0, x0 - 12); }
  }
  /* side panel of the mockups: options, visuals, cards, light */
  function mkTab(t) { const tab = $(`#mkTabs [data-mktab="${t}"]`); if (!tab || tab.hidden) t = "opt"; ui.mkTab = t; for (const b of $$("#mkTabs [data-mktab]")) b.setAttribute("aria-selected", String(b.dataset.mktab === t)); for (const p of $$("#mkSide [data-mkpane]")) p.hidden = p.dataset.mkpane !== t; }
  function renderMkSlots() {
    const el = $("#mkSlots"); if (!el) return; el.innerHTML = ""; const n = mkSlotCount(), id = mkProd()[0]; const variable = id === "fan" || id === "row" || id === "stack";
    $("#mkCountWrap").hidden = !variable; $("#mkCount").value = n; for (const b of ["mkDiff", "mkSame", "mkShuffle"]) $("#" + b).hidden = n < 2;
    $("#mkSlotsNote").textContent = n ? `· ${n} emplacement${n > 1 ? "s" : ""}` : ""; $("#mkTabCount").textContent = n ? " · " + n : ""; $("#mkPicker").hidden = !n; $("#mkPickTitle").parentElement.hidden = !n;
    if (!n) { const p = document.createElement("p"); p.className = "note"; p.textContent = id === "booster" ? "Le sachet reprend l'illustration de la carte active, ou ton propre visuel. Clique sur « Ouvrir le booster » dans Options pour en faire sortir trois cartes." : "Ce produit reprend l'illustration de la carte active, ou tes propres visuels importés dans Options."; el.append(p); return; }
    if (id === "display") { const p = document.createElement("p"); p.className = "note"; p.style.cssText = "flex:none;max-width:220px;align-self:center"; p.textContent = "Les trois cartes posées devant le présentoir."; el.append(p); }
    const a = mkAssign();
    for (let i = 0; i < n; i++) { const info = mkRefInfo(a[i]) || { name: "", thumb: "" }; const b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.setAttribute("aria-pressed", String(i === MK.slotSel)); b.title = info.name; const im = document.createElement("i"); if (info.thumb) { im.style.backgroundImage = `url(${info.thumb})`; if (info.pos) im.style.backgroundPosition = info.pos; } b.append(im, id === "stack" ? (i === 0 ? "Dessus" : "Étalée " + i) : id === "binder" ? (() => { const g = MockScenes.binderGrid(mkOpts()), np = g[0] * g[1]; return `${Math.floor(i / np) + 1}.${i % np + 1}`; })() : id === "playmat" && i === 0 ? "Deck" : String(i + (id === "playmat" ? 0 : 1))); b.addEventListener("click", () => { MK.slotSel = i; renderMkSlots(); renderMkPicker(); }); el.append(b); }
    $("#mkPickTitle").textContent = n > 1 ? `Choisir la carte de l'emplacement ${MK.slotSel + 1}` : "Choisir la carte";
  }
  function renderMkPicker() {
    const el = $("#mkPicker"); if (!el) return; el.innerHTML = ""; const n = mkSlotCount(); if (!n) return; const a = mkAssign(); const cur = a[MK.slotSel];
    const refs = project.cards.map(c => "c:" + c.id).concat(ART_LIBRARY.map(x => "d:" + x.id));
    for (const ref of refs) { const info = mkRefInfo(ref); if (!info) continue; const b = document.createElement("button"); b.type = "button"; b.className = "pick"; b.setAttribute("aria-pressed", String(ref === cur)); const im = document.createElement("i"); if (info.thumb) { im.style.backgroundImage = `url(${info.thumb})`; if (info.pos) im.style.backgroundPosition = info.pos; } const nb = document.createElement("b"); nb.textContent = info.name; const sp = document.createElement("span"); sp.textContent = info.sub; b.append(im, nb, sp); b.title = info.sub === "Exemple" ? "Illustration d'exemple, avec les finitions de la carte active" : info.name;
      b.addEventListener("click", () => { a[MK.slotSel] = ref; MK.texReady.clear(); if (mkProd()[0] === "frame1") mkStatic(); if (n > 1) MK.slotSel = (MK.slotSel + 1) % n; MK.texDirty = true; MK.dirty = true; if (isSlabProd(mkProd()[0])) mkStatic(); renderMkSlots(); renderMkPicker(); autosave(); }); el.append(b); }
  }
  function renderMkFields() {
    const el = $("#mkFields"), art = $("#mkArt"); el.innerHTML = ""; art.innerHTML = ""; const id = mkProd()[0], o = mkOpts(), p = project.pack; const kv = document.createElement("div"); kv.className = "kv"; const kvL = document.createElement("div"); kvL.style.cssText = "display:grid;gap:8px"; let into = kv; const sec = t => { const h = document.createElement("p"); h.className = "thk__title"; h.textContent = t; const k2 = document.createElement("div"); k2.className = "kv"; kvL.append(h, k2); into = k2; }; const lp = $("#mkLabel"); lp.innerHTML = "";
    const field = (label, node) => { const lab = document.createElement("label"); lab.className = "field"; lab.textContent = label; lab.append(node); into.append(lab); };
    const sel = (label, opts, val, fn) => { const se = document.createElement("select"); for (const [v, t] of opts) { const op = document.createElement("option"); op.value = v; op.textContent = t; se.append(op); } se.value = val; se.addEventListener("change", () => { fn(se.value); mockBuild(false); autosave(); }); field(label, se); };
    const inp = (label, type, val, fn, attrs) => { const i = document.createElement("input"); i.type = type; i.value = val; Object.assign(i, attrs || {}); i.addEventListener("change", () => { fn(i.value); mockBuild(false); autosave(); }); field(label, i); };
    const OPEN_LABELS = { binder: ["Ouvrir le classeur", "Fermer le classeur"], booster: ["Ouvrir le booster", "Refermer le booster"], display: ["Ouvrir le display", "Fermer le display"], etb: ["Ouvrir le coffret", "Fermer le coffret"], deckbox: ["Ouvrir la deck box", "Fermer la deck box"], tin: ["Ouvrir la boîte", "Fermer la boîte"] };
    if (OPEN_LABELS[id]) {
      const row = document.createElement("div"); row.className = "row"; const open = MK.anim.goal > 0.5; const b = document.createElement("button"); b.type = "button"; b.className = "btn primary"; b.id = id === "binder" ? "mkBinderBtn" : "mkOpenBtn"; b.innerHTML = ICO(open ? "close" : "right", 1) + " " + OPEN_LABELS[id][open ? 1 : 0]; b.addEventListener("click", () => mkToggleOpen()); row.append(b);
      if (id === "binder" && open) { const sheets = clamp(Math.round(o.sheets || 2), 1, 3); const turn = (txt, d, off, pid) => { const pb = document.createElement("button"); pb.type = "button"; pb.className = "btn small"; pb.id = pid; pb.textContent = txt; pb.disabled = off; pb.addEventListener("click", () => { MK.anim.pageGoal = clamp(Math.round(MK.anim.pageGoal) + d, 0, sheets); MK.dirty = true; renderMkFields(); }); row.append(pb); }; turn("Page précédente", -1, MK.anim.pageGoal <= 0, "mkPagePrev"); turn("Page suivante", 1, MK.anim.pageGoal >= sheets, "mkPageNext"); }
      const lab = document.createElement("label"); lab.className = "check"; const cb = document.createElement("input"); cb.type = "checkbox"; cb.id = "mkAnimate"; cb.checked = project.mock.animate !== false; cb.addEventListener("change", () => { project.mock.animate = cb.checked; autosave(); }); lab.append(cb, " Ouverture animée"); row.append(lab); el.append(row);
    }
    if (id === "stack") { inp("Cartes dans la pile", "number", o.pile || 30, v => { o.pile = clamp(+v || 30, 2, 150); }, { min: 2, max: 150 }); sel("Rangement", [["", "Naturel, légèrement décalé"], ["1", "Bien taquée"]], o.tidy || "", v => { o.tidy = v; }); }

    if (id === "sleeve") { sel("Teinte du dos", [["clear", "Transparente"], ["#0d0d10", "Noire"], ["#1f3fae", "Bleue"], ["#b3202a", "Rouge"], ["#1c7a45", "Verte"], ["#5b2a9b", "Violette"], ["#f1efe9", "Blanche"]], o.tint || "clear", v => { o.tint = v; }); sel("Finition", [["gloss", "Brillante"], ["matte", "Mate"]], o.finish || "gloss", v => { o.finish = v; }); sel("Double pochette", [["", "Non"], ["1", "Oui, avec pochette intérieure"]], o.double ? "1" : "", v => { o.double = !!v; }); }
    if (isSlabProd(id)) {
      sel("Format du boîtier", [["psa", "PSA · 80,25 × 135,75 × 6,25"], ["bgs", "Beckett BGS · 83 × 130,75 × 8,5"], ["cgc", "CGC · 80,25 × 135 × 7,5"], ["sgc", "SGC · 86,25 × 138,5 × 8,5, fond noir"], ["tag", "TAG · 80 × 134,75 × 7,25"], ["psaT", "PSA épais · 10,25 mm"], ["cgcT", "CGC épais · 12,5 mm"], ["custom", "Sur mesure…"]], o.format || "psa", v => { o.format = v; });
      if (o.format === "custom") { inp("Largeur (mm)", "number", o.cw || 80.25, v => { o.cw = +v || 80.25; }, { min: 60, max: 160, step: 0.25 }); inp("Hauteur (mm)", "number", o.ch || 135.75, v => { o.ch = +v || 135.75; }, { min: 90, max: 240, step: 0.25 }); inp("Épaisseur (mm)", "number", o.cd || 6.25, v => { o.cd = +v || 6.25; }, { min: 3, max: 25, step: 0.25 }); }
      if (id === "slab") {
        sel("Présentation", [["", "Posé"], ["acryl", "Support transparent"], ["wood", "Chevalet en bois"]], o.stand === true ? "acryl" : (o.stand || ""), v => { o.stand = v; });
        sel("Protection", [["", "Aucune"], ["bumper", "Bumper silicone"], ["metal", "Cadre métallique magnétique"], ["sleeve", "Pochette souple"]], o.guard || "", v => { o.guard = v; if (v === "metal" && !o.gset) o.gcolor = "#1b1b1f"; if (v === "bumper" && !o.gset) o.gcolor = "#d0202a"; });
        const GCOL = [["#d0202a", "Rouge"], ["#101012", "Noir"], ["#1b1b1f", "Anthracite"], ["#1f56c9", "Bleu"], ["#18935a", "Vert"], ["#6dff3a", "Vert fluo"], ["#f2c230", "Jaune"], ["#ff8a1e", "Orange"], ["#e8589a", "Rose"], ["#ff9cc4", "Rose bonbon"], ["#7a3fd0", "Violet"], ["#f1efe9", "Blanc"], ["#c9a24a", "Or"], ["#b9bec7", "Argent"]];
        if (o.guard === "bumper" || o.guard === "metal") sel("Couleur de la protection", GCOL, o.gcolor || "#d0202a", v => { o.gcolor = v; o.gset = 1; });
        if (o.guard === "bumper") { sel("Finition du bumper", [["", "Unie"], ["glit", "Pailletée"], ["grad", "Dégradée"], ["gradglit", "Dégradée et pailletée"]], o.gfinish || "", v => { o.gfinish = v; }); if ((o.gfinish || "").indexOf("grad") >= 0) sel("Deuxième couleur (en bas)", GCOL, o.gcolor2 || "#7a3fd0", v => { o.gcolor2 = v; }); }
      }
      if (id === "wall9") { sel("Cadre", [["#16161a", "Noir"], ["#f2f0ea", "Blanc"], ["#8a5a33", "Noyer"], ["#b98d5b", "Chêne"]], o.frame || "#16161a", v => { o.frame = v; }); sel("Fond", [["#15161a", "Noir"], ["#2b2f36", "Anthracite"], ["#ece7dc", "Crème"], ["#243a5e", "Bleu nuit"], ["#5a1620", "Bordeaux"]], o.mat || "#15161a", v => { o.mat = v; }); }
      if (id === "led14") sel("Couleur des LED", [["#ffffff", "Blanc froid"], ["#ffe2b0", "Blanc chaud"], ["#66b3ff", "Bleu"], ["#ff5fd0", "Rose"], ["#7dffb0", "Vert"]], o.led || "#ffffff", v => { o.led = v; });
      sec("Organisme");
      sel("Couleur de l'étiquette", [["blanc", "Blanche"], ["noir", "Noire"], ["or", "Dorée"], ["custom", "Personnalisée…"]], o.label || "blanc", v => { o.label = v; });
      if (o.label === "custom") inp("Teinte de l'étiquette", "color", o.labelBg || "#1f56c9", v => { o.labelBg = v; });
      inp("Organisme", "text", o.grader === undefined ? "LAYRYS" : o.grader, v => { o.grader = v; }, { maxLength: 14 }); inp("Sous-titre de l'organisme", "text", o.graderSub === undefined ? "GRADING" : o.graderSub, v => { o.graderSub = v; }, { maxLength: 18 });
      sel("Logo", [["", "Affiché"], ["0", "Masqué"]], o.logo === "0" ? "0" : "", v => { o.logo = v; });
      sec("Carte"); if (id === "slab") inp("Nom de la carte", "text", o.title || "", v => { o.title = v; }, { maxLength: 40, placeholder: "Nom de la carte active" });
      inp("Ligne 2", "text", o.line2 === undefined ? (project.title || "") : o.line2, v => { o.line2 = v; }, { maxLength: 44 }); inp("Ligne 3", "text", o.line3 || "", v => { o.line3 = v; }, { maxLength: 60, placeholder: "Année, jeu, numéro, rareté" });
      sec("Note"); inp("Note", "text", o.grade || "10", v => { o.grade = v.slice(0, 4) || "10"; }, { maxLength: 4 }); inp("Mention", "text", o.mention || "GEM MINT", v => { o.mention = v; }, { maxLength: 14 });
      sec("Sous-notes"); sel("Sous-notes", [["", "Affichées"], ["0", "Masquées, certificat à la place"]], o.subs === "0" ? "0" : "", v => { o.subs = v; }); into.lastChild.style.gridColumn = "1 / -1";
      if (o.subs !== "0") { const cur = mkSubGrades(o, parseFloat(String(o.grade || "10").replace(",", ".")) || 10); cur.forEach(([n], i) => { inp(`Sous-note ${i + 1}`, "text", n, v => { o.subL = (o.subL || ["Centrage", "Coins", "Côtés", "Surface"]).slice(); o.subL[i] = v; }, { maxLength: 12 }); inp(`Valeur ${i + 1}`, "text", (o.subV || [])[i] || "", v => { o.subV = (o.subV || ["", "", "", ""]).slice(); o.subV[i] = v.trim().slice(0, 4); }, { maxLength: 4, placeholder: cur[i][1].replace(".", ",") }); }); }
      sec("Certificat et dos"); inp("N° de certificat", "text", o.cert || "", v => { o.cert = v.trim(); }, { maxLength: 18, placeholder: "Automatique" }); sel("Code-barres", [["", "Affiché"], ["0", "Masqué"]], o.barcode === "0" ? "0" : "", v => { o.barcode = v; }); inp("Texte du dos", "text", o.backLine === undefined ? "Authentification" : o.backLine, v => { o.backLine = v; }, { maxLength: 24 });
      into = kv;
    }
    if (id === "playmat") { sel("Cartes en jeu", [1, 2, 3, 4, 5].map(k => [String(k), k + (k > 1 ? " cartes" : " carte")]), String(clamp(Math.round(o.count || 4), 1, 5)), v => { o.count = +v; }); sel("Bords", [["", "Cousus"], ["0", "Coupe franche"]], o.stitch === "0" ? "0" : "", v => { o.stitch = v; }); if (o.stitch !== "0") sel("Couleur de la couture", [["#101012", "Noire"], ["#f1efe9", "Blanche"], ["#d0202a", "Rouge"], ["#1f56c9", "Bleue"], ["#c9a24a", "Or"]], o.stitchColor || "#101012", v => { o.stitchColor = v; }); }
    if (id === "tin") sel("Métal", [["#b9bec7", "Argent"], ["#c9a24a", "Or"], ["#1b1b1f", "Noir"], ["#1f56c9", "Bleu"], ["#b3202a", "Rouge"]], o.metal || "#b9bec7", v => { o.metal = v; });
    if (id === "coin") sel("Métal", [["", "Or"], ["silver", "Argent"], ["copper", "Cuivre"]], o.metal || "", v => { o.metal = v; });
    if (id === "storage") sel("Capacité", [["800", "800 cartes"], ["400", "400 cartes"]], String(o.cap || "800"), v => { o.cap = v; });
    if (id === "stand") {
      sel("Modèle de support", [["easel", "Chevalet en acrylique plié"], ["block", "Socle en acrylique à rainure"], ["wood", "Chevalet en bois"], ["wire", "Chevalet trépied en métal"], ["led", "Socle lumineux à LED"]], o.model || "easel", v => { o.model = v; });
      sel("Protection posée dessus", [["", "Boîtier magnétique"], ["toploader", "Toploader"]], o.inside === "toploader" ? "toploader" : "", v => { o.inside = v; });
      if (o.model === "wire") sel("Métal", [["", "Acier"], ["gold", "Doré"], ["black", "Noir"]], o.metal || "", v => { o.metal = v; });
      if (o.model === "led") sel("Couleur des LED", [["#ffffff", "Blanc froid"], ["#ffe2b0", "Blanc chaud"], ["#66b3ff", "Bleu"], ["#ff5fd0", "Rose"], ["#7dffb0", "Vert"]], o.led || "#ffffff", v => { o.led = v; });
    }
    if (id === "acryl3") sel("Socle lumineux", [["", "Sans socle"], ["#ffffff", "LED blanches"], ["#66b3ff", "LED bleues"], ["#ff5fd0", "LED roses"], ["#ffcf70", "LED ambrées"]], o.led || "", v => { o.led = v; });
    if (id === "display") { sel("Format du display", [["12", "12 boosters"], ["24", "24 boosters"], ["36", "36 boosters"]].concat([12, 24, 36].includes(+p.packs) ? [] : [[String(p.packs), p.packs + " boosters"]]), String(p.packs), v => { p.packs = +v; $("#packsPerBox").value = p.packs; }); sel("Cartes posées devant", [["", "Trois cartes"], ["0", "Aucune"]], o.cards === "0" ? "0" : "", v => { o.cards = v; }); }
    if (id === "binder") { const np = MockScenes.binderGrid(o)[0] * MockScenes.binderGrid(o)[1]; sel("Pochettes par page", [["4", "4 pochettes (2 × 2)"], ["9", "9 pochettes (3 × 3)"], ["12", "12 pochettes (4 × 3)"]], String(o.grid || "9"), v => { o.grid = v; MK.anim.page = MK.anim.pageGoal = 0; }); sel("Feuillets", [1, 2, 3].map(k => [String(k), `${k} feuillet${k > 1 ? "s" : ""}, ${k * 2 * np} cartes`]), String(clamp(Math.round(o.sheets || 2), 1, 3)), v => { o.sheets = +v; MK.anim.page = MK.anim.pageGoal = 0; }); }
    if (id === "acryl1" || id === "acryl3") sel("Épaisseur du bloc", [["15", "15 mm"], ["20", "20 mm"], ["30", "30 mm"]], String(o.thick || 20), v => { o.thick = +v; });
    if (id === "frame1" || id === "frame3") {
      sel("Format du cadre", [["s", "Compact"], ["m", "Standard"], ["l", "Grand, marges larges"]], o.size || "m", v => { o.size = v; });
      sel("Moulure", [["", "À gorge, profil étagé"], ["wide", "Large, à gorge"], ["flat", "Plate moderne"], ["float", "Caisse américaine"]], o.profile || "", v => { o.profile = v; });
      sel("Couleur du cadre", [["#16161a", "Noir"], ["#f2f0ea", "Blanc"], ["#8a5a33", "Noyer"], ["#b98d5b", "Chêne"], ["#6b2f1f", "Acajou"], ["#c9a24a", "Doré"], ["#b9bec7", "Argenté"]], o.frame || "#16161a", v => { o.frame = v; });
      if (o.profile !== "float") { sel("Filet intérieur", [["", "Aucun"], ["gold", "Doré"], ["silver", "Argenté"]], o.fillet || "", v => { o.fillet = v; }); sel("Verre", [["", "Brillant"], ["matte", "Antireflet"], ["none", "Sans verre"]], o.glass || "", v => { o.glass = v; }); }
      sel(id === "frame3" ? "Fond" : "Passe-partout", [["#ece7dc", "Crème"], ["#ffffff", "Blanc"], ["#2b2f36", "Anthracite"], ["#111114", "Noir"], ["#243a5e", "Bleu nuit"], ["#5a1620", "Bordeaux"], ["#1f4a36", "Vert sapin"]], o.mat || (id === "frame3" ? "#2b2f36" : "#ece7dc"), v => { o.mat = v; });
      if (id === "frame1") { sel("Second passe-partout", [["", "Aucun"], ["#c9a24a", "Liseré doré"], ["#111114", "Liseré noir"], ["#ffffff", "Liseré blanc"], ["#5a1620", "Liseré bordeaux"], ["#243a5e", "Liseré bleu nuit"]], o.mat2 || "", v => { o.mat2 = v; }); sel("Plaque gravée", [["", "Aucune"], ["1", "Laiton, nom de la carte"]], o.plate ? "1" : "", v => { o.plate = !!v; }); if (o.plate) inp("Texte de la plaque", "text", o.plateText || "", v => { o.plateText = v; }, { maxLength: 28, placeholder: "Nom de la carte" }); }
    }
    if (id === "binder") sel("Couleur du classeur", [["#1c1f29", "Anthracite"], ["#2a1a3d", "Prune"], ["#1a2a3d", "Marine"], ["#5a2c1a", "Cuir"], ["#7a1420", "Bordeaux"], ["#eae6dc", "Crème"]], o.color || "#1c1f29", v => { o.color = v; });
    if (id === "booster" || id === "blister" || id === "display" || id === "etb" || id === "deckbox") {
      inp("Titre", "text", p.title, v => { p.title = v; $("#packTitle").value = v; }, { maxLength: 24 }); inp("Sous-titre", "text", p.sub, v => { p.sub = v; $("#packSub").value = v; }, { maxLength: 32 }); inp("Couleur", "color", p.boxColor, v => { p.boxColor = v; $("#boxColor").value = v; });
      if (id === "booster" || id === "display" || id === "blister") sel("Finition du sachet", [["h-oil", "Film holographique"], ["h-silver", "Métallisé argent"], ["h-secret", "Holo diagonales"], ["h-cosmic", "Holo cosmos"], ["h-mosaic", "Holo mosaïque"], ["h-starfoil", "Holo starfoil"], ["i-none", "Mat imprimé"]], p.finish, v => { p.finish = v; if ([...$("#packFinish").options].some(op => op.value === v)) $("#packFinish").value = v; });
      inp("Cartes par booster", "number", p.cards, v => { p.cards = Math.max(1, +v || 1); $("#cardsPerPack").value = p.cards; }, { min: 1, max: 60 });
      if (id === "display") inp("Boosters par display", "number", p.packs, v => { p.packs = Math.max(1, +v || 1); $("#packsPerBox").value = p.packs; }, { min: 1, max: 60 });
    }
    if (kv.children.length) el.append(kv);
    if (kvL.children.length) {
      const t1 = document.createElement("p"); t1.className = "note"; t1.textContent = "Chaque information de l'étiquette se modifie ici. Un champ vidé disparaît de l'étiquette."; lp.append(t1, kvL);
      const has = !!(project.mock.art || {})["label.logo"]; const lr = document.createElement("div"); lr.className = "artrow"; lr.dataset.art = "label.logo"; const tx = document.createElement("div"); const nb = document.createElement("b"); nb.textContent = "Logo de l'organisme"; const sp = document.createElement("span"); sp.textContent = "PNG à fond transparent, clair de préférence · environ 400 × 400 px"; tx.append(nb, sp);
      const imp = document.createElement("button"); imp.type = "button"; imp.className = "btn small"; imp.innerHTML = ICO("upload", 1) + (has ? " Remplacer" : " Importer"); imp.addEventListener("click", () => { MK.artKey = "label.logo"; mkArtInput.click(); }); lr.append(tx, imp);
      if (has) { const rm = document.createElement("button"); rm.type = "button"; rm.className = "btn small ghost"; rm.innerHTML = ICO("trash", 1); rm.title = "Revenir au logo par défaut"; rm.setAttribute("aria-label", "Retirer le logo importé"); rm.addEventListener("click", () => { delete project.mock.art["label.logo"]; MK.art.delete("label.logo"); mockBuild(false); autosave(); }); lr.append(rm); }
      lp.append(lr);
    }
    const faces = mkArtFaces(id);
    if (faces.length) {
      const box = document.createElement("div"); box.className = "artlist"; const h = document.createElement("p"); h.className = "thk__title"; h.textContent = "Tes visuels, face par face"; box.append(h); const fr = v => String(+(+v).toFixed(1)).replace(".", ","), px = v => Math.round(v / 25.4 * 300);
      for (const [key, name, wmm, hmm] of faces) {
        const has = !!(project.mock.art || {})[key]; const row = document.createElement("div"); row.className = "artrow"; row.dataset.art = key; const tx = document.createElement("div"); const nb = document.createElement("b"); nb.textContent = name; const sp = document.createElement("span"); sp.textContent = `${fr(wmm)} × ${fr(hmm)} mm · ${px(wmm)} × ${px(hmm)} px à 300 dpi`; tx.append(nb, sp);
        const imp = document.createElement("button"); imp.type = "button"; imp.className = "btn small"; imp.innerHTML = ICO("upload", 1) + (has ? " Remplacer" : " Importer"); imp.addEventListener("click", () => { MK.artKey = key; mkArtInput.click(); }); row.append(tx, imp);
        if (has) { const rm = document.createElement("button"); rm.type = "button"; rm.className = "btn small ghost"; rm.innerHTML = ICO("trash", 1); rm.title = "Retirer ce visuel"; rm.setAttribute("aria-label", "Retirer le visuel : " + name); rm.addEventListener("click", () => { delete project.mock.art[key]; MK.art.delete(key); mockBuild(false); autosave(); }); row.append(rm); }
        box.append(row);
      }
      const nt = document.createElement("p"); nt.className = "note"; nt.textContent = "Prépare chaque image à ces dimensions pour qu'elle tombe juste. Si les proportions diffèrent, elle est recadrée autour de son centre. Sans visuel importé, la maquette utilise l'illustration de la carte active."; box.append(nt); art.append(box);
    }
    if (isSlabProd(id)) {
      const row = document.createElement("div"); row.className = "row"; const lab = document.createElement("label"); lab.className = "btn small"; lab.htmlFor = "mkLabelFile"; lab.innerHTML = ICO("upload", 1) + " Importer mon étiquette"; row.append(lab);
      if (project.mock.label) { const rm = document.createElement("button"); rm.type = "button"; rm.className = "btn small ghost"; rm.innerHTML = ICO("trash", 1) + " Retirer l'étiquette importée"; rm.addEventListener("click", () => { project.mock.label = ""; loadLabel(); mockBuild(false); autosave(); }); row.append(rm); }
      const tk = document.createElement("div"); tk.className = "thk"; const tt = document.createElement("p"); tt.className = "thk__title"; tt.textContent = "Épaisseurs comparées"; tk.append(tt); const cur = o.format || "psa"; const fr = v => String(v).replace(".", ",");
      for (const [k, F] of Object.entries(MockScenes.SLABS)) { const b = document.createElement("button"); b.type = "button"; b.className = "thk__row"; b.setAttribute("aria-pressed", String(k === cur)); const nm = document.createElement("span"); nm.textContent = F[4]; const bar = document.createElement("i"); bar.style.width = (F[2] / 12.5 * 100) + "%"; const val = document.createElement("span"); val.textContent = fr(F[2]) + " mm"; b.append(nm, bar, val); b.title = `${F[4]} : ${fr(F[0])} × ${fr(F[1])} × ${fr(F[2])} mm`; b.addEventListener("click", () => { o.format = k; mockBuild(false); autosave(); }); tk.append(b); }
      el.append(tk); const src = document.createElement("p"); src.className = "note"; src.textContent = "Mesures indépendantes de boîtiers nus (Card Capsule, Slabster, PreGrade Cards), pas des cotes constructeur. Le BGS est environ 36 % plus épais que le PSA."; el.append(src);
      const lt = document.createElement("p"); lt.className = "thk__title"; lt.textContent = "Étiquette entièrement importée"; lp.append(lt, row); const nt = document.createElement("p"); nt.className = "note"; nt.textContent = `Tu peux aussi importer une image complète : elle remplace toute l'étiquette et les champs ci-dessus ne s'appliquent plus. Format conseillé : paysage, environ ${labelRatio().toFixed(1).replace(".", ",")} pour 1 (par exemple 1400 × ${Math.round(1400 / labelRatio())} px).`; lp.append(nt);
    }
    const n = document.createElement("p"); n.className = "note"; n.textContent = ({ card: "La carte seule, avec sa tranche de 0,33 mm. Regarde-la sous tous les angles, même par-dessous.", fan: "Choisis le nombre de cartes et la carte de chaque emplacement.", row: "Une rangée pour comparer les cartes d'une série.", stack: "La pile montre l'épaisseur réelle : 0,33 mm par carte. Les cartes étalées se règlent avec le compteur.", toploader: "Toploader 3 × 4 pouces en PVC rigide.", semi: "Étui semi-rigide, le format demandé pour un envoi en gradation.", onetouch: "Boîtier une pièce à fermeture aimantée, 73 × 109,5 × 7,9 mm pour une carte standard.", stand: "Cinq supports au choix, pour un boîtier magnétique ou un toploader. Le socle à LED éclaire la carte, même dans l'ambiance « Dans le noir ».", riser: "Deux gradins en acrylique pour six slabs. Chaque slab reçoit sa propre carte.", acryl1: "Bloc en deux plaques d'acrylique serrées par quatre vis inox. La carte est logée dans une réserve.", acryl3: "Bloc pour trois cartes, six vis inox.", frame1: "Cadre caisse avec passe-partout biseauté et verre.", frame3: "Cadre caisse avec trois boîtiers magnétiques sur fond teinté.", slab: "Cotes extérieures mesurées par des tiers sur des boîtiers nus, pas des cotes constructeur. CollectAura, PCA et CCC ne sont pas proposés : leurs cotes ne sont pas vérifiées. Utilise « Sur mesure » dès que tu les as. Les supports suivent ta base de conception : rainure de 10 mm, 90 mm de large, 12° d'inclinaison.", wall9: "Cadre caisse mural pour neuf slabs, sur fond teinté.", led14: "Vitrine à deux rangées de sept slabs, éclairée par deux bandeaux de LED. Essaie l'ambiance « Dans le noir ».", display: "Présentoir ouvert : plateau à bord bas, deux colonnes de boosters inclinés, fronton à coins arrondis. Trois cartes peuvent être posées devant.", binder: "Classeur à anneaux. Le bouton l'ouvre et le referme, la couverture reprend le nom de la série.", booster: "Sachet soudé en volume : gonflé au centre, plissé près des soudures, bords crantés.", blister: "Booster sous coque transparente, sur carton à trou d'accroche.", playmat: "Tapis en néoprène au format tournoi, 24 × 14 pouces. Le premier emplacement est le deck, les suivants sont les cartes en jeu.", tin: "Boîte métal de collection. Le couvercle porte ton visuel ; la boîte contient une pile de cartes.", coin: "Pièce de pile ou face, avec un visuel par côté. Sans visuel, elle porte ton logo et le titre de la série.", storage: "Boîte de rangement en carton avec intercalaires de couleur. La première carte de la rangée est celle de l'emplacement." })[id] || ""; if (n.textContent) el.append(n);
  }
  function mkTabsSync() { const has = $("#mkArt").children.length > 0; $('#mkTabs [data-mktab="art"]').hidden = !has; $('#mkTabs [data-mktab="label"]').hidden = !isSlabProd(mkProd()[0]); mkTab(ui.mkTab || "opt"); }
  function renderMkLights() {
    const el = $("#mkLights"); if (!el) return; el.innerHTML = ""; const st = project.mock.light = project.mock.light || {}; const cur = mkAmb()[0]; const lab = document.createElement("span"); lab.className = "lights__label"; lab.innerHTML = ICO("sun", 1) + "Éclairage"; el.append(lab);
    for (const [id, name, A] of AMBIANCES) { if (id === "uv") { const sep = document.createElement("span"); sep.className = "sep"; el.append(sep); } const b = document.createElement("button"); b.type = "button"; b.dataset.amb = id; b.setAttribute("aria-pressed", String(cur === id)); const i = document.createElement("i"); i.style.setProperty("--lamp", id === "uv" ? "#8a5cff" : id === "dark" ? "#20362a" : `rgb(${A.key.map(v => Math.round(v * 255)).join(",")})`); b.append(i, name); b.addEventListener("click", () => { st.amb = id; st.az = null; st.el = null; renderMkLights(); MK.texDirty = true; MK.dirty = true; autosave(); }); el.append(b); }
    const A = mkAmb()[2]; const num = (v, d) => (v === undefined || v === null ? d : v);
    const set = (id, v, txt) => { $("#" + id).value = v; $("#o-" + id).value = txt; };
    set("mkAz", num(st.az, A.az), Math.round(num(st.az, A.az)) + "°"); set("mkEl", num(st.el, A.el), Math.round(num(st.el, A.el)) + "°"); set("mkPower", Math.round(num(st.power, 1) * 100), Math.round(num(st.power, 1) * 100) + " %"); set("mkShadow", Math.round(num(st.shadow, 1) * 100), Math.round(num(st.shadow, 1) * 100) + " %"); set("mkMirror", Math.round(num(st.mirror, 1) * 100), Math.round(num(st.mirror, 1) * 100) + " %");
  }
  for (const [id, key, k] of [["mkAz", "az", 1], ["mkEl", "el", 1], ["mkPower", "power", 0.01], ["mkShadow", "shadow", 0.01], ["mkMirror", "mirror", 0.01]]) { $("#" + id).addEventListener("input", e => { const st = project.mock.light = project.mock.light || {}; st[key] = +e.target.value * k; $("#o-" + id).value = k === 1 ? e.target.value + "°" : e.target.value + " %"; MK.texDirty = true; MK.dirty = true; }); $("#" + id).addEventListener("change", () => autosave()); }
  $("#mkLightReset").addEventListener("click", () => { const st = project.mock.light = project.mock.light || {}; st.az = null; st.el = null; st.power = 1; st.shadow = 1; st.mirror = 1; renderMkLights(); MK.texDirty = true; MK.dirty = true; autosave(); });
  $("#mkLabelFile").addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if (!f) return; loadFile(f, im => { const w = Math.min(1600, im.naturalWidth || im.width); const [c, x] = cv(w, Math.max(1, Math.round(w * (im.naturalHeight || im.height) / (im.naturalWidth || im.width)))); x.drawImage(im, 0, 0, c.width, c.height); project.mock.label = c.toDataURL("image/jpeg", 0.92); loadLabel(); autosave(); toast("Étiquette importée"); renderMkFields(); }); });
  $("#mkFloor").addEventListener("change", e => { project.mock.floor = e.target.value; mockBuild(false); autosave(); });
  $("#mkMotion").addEventListener("change", e => { project.mock.motion = e.target.value; MK.dirty = true; autosave(); });
  $("#mkShot").addEventListener("click", () => mockCapture());
  $("#mkReset").addEventListener("click", () => { if (MK.home) { MK.goal = { ...MK.home }; MK.userMoved = false; } });
  $("#mkZoomIn").addEventListener("click", () => { MK.userMoved = true; MK.goal = { ...(MK.goal || MK.view), dist: Math.max(40, (MK.goal || MK.view).dist / 1.3) }; }); $("#mkZoomOut").addEventListener("click", () => { MK.userMoved = true; MK.goal = { ...(MK.goal || MK.view), dist: Math.min(6000, (MK.goal || MK.view).dist * 1.3) }; });
  for (const b of $$("#mkViews [data-mv]")) b.addEventListener("click", () => { if (!MK.home) return; const h = MK.home; const turn = Math.round((MK.view.yaw - h.yaw) / 360) * 360; const base = { ...h, dist: MK.view.dist }; const m = b.dataset.mv; MK.userMoved = true; MK.goal = m === "front" ? { ...base, yaw: turn, pitch: 0 } : m === "side" ? { ...base, yaw: turn - 78, pitch: 4 } : m === "top" ? { ...base, yaw: turn, pitch: 80 } : m === "under" ? { ...base, yaw: turn - 20, pitch: -38 } : m === "back" ? { ...base, yaw: turn + 180, pitch: 4 } : { ...base, yaw: turn + h.yaw, pitch: h.pitch }; });
  $("#mkMore").addEventListener("click", () => { const id = mkProd()[0], o = mkOpts(); if (id === "stack") o.loose = clamp((o.loose === undefined ? 2 : o.loose) + 1, 0, 3); else o.count = clamp((o.count || (id === "fan" ? 5 : 4)) + 1, 2, id === "fan" ? 9 : 7); mockBuild(false); autosave(); });
  $("#mkLess").addEventListener("click", () => { const id = mkProd()[0], o = mkOpts(); if (id === "stack") o.loose = clamp((o.loose === undefined ? 2 : o.loose) - 1, 0, 3); else o.count = clamp((o.count || (id === "fan" ? 5 : 4)) - 1, 2, id === "fan" ? 9 : 7); mockBuild(false); autosave(); });
  const mkFill = fn => { const id = mkProd()[0], n = mkSlotCount(); project.mock.assign[id] = Array.from({ length: n }, (x, i) => fn(i)); MK.texReady.clear(); MK.texDirty = true; MK.dirty = true; if (isSlabProd(id)) mkStatic(); renderMkSlots(); renderMkPicker(); autosave(); };
  $("#mkDiff").addEventListener("click", () => { const pool = mkPool(); mkFill(i => pool[i % pool.length]); });
  $("#mkSame").addEventListener("click", () => { const ref = "c:" + curCard().id; mkFill(() => ref); });
  $("#mkShuffle").addEventListener("click", () => { const a = mkAssign().slice(0, mkSlotCount()); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } mkFill(i => a[i]); });
  (function () {
    const st = $("#mkStage"); const ptr = MK.pointers;
    const pan = (dx, dy) => { const v = MK.view; const cam = MK.r.camera(v, null); const k = v.dist * 2 * Math.tan(13 * Math.PI / 180) / Math.max(1, st.clientHeight); v.tx -= (cam.right[0] * dx - cam.up[0] * dy) * k; v.ty -= (cam.right[1] * dx - cam.up[1] * dy) * k; v.tz -= (cam.right[2] * dx - cam.up[2] * dy) * k; };
    st.addEventListener("contextmenu", e => e.preventDefault());
    st.addEventListener("pointerdown", e => {
      if (!MK.r || e.target.closest(".stage__zoom")) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); st.setPointerCapture(e.pointerId); MK.goal = null; MK.inertia = null; MK.dragV = null; MK.userMoved = true; st.classList.add("grabbing");
      if (ptr.size === 2) { const [a, b] = [...ptr.values()]; MK.pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), dist: MK.view.dist, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2 }; MK.drag = null; return; }
      MK.drag = { x: e.clientX, y: e.clientY, mode: (e.shiftKey || e.button === 2 || e.button === 1) ? "pan" : "orbit" };
    });
    st.addEventListener("pointermove", e => {
      if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); const v = MK.view;
      if (MK.pinch && ptr.size === 2) { const [a, b] = [...ptr.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); v.dist = clamp(MK.pinch.dist * MK.pinch.d / Math.max(10, d), 40, 6000); const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2; pan(cx - MK.pinch.cx, cy - MK.pinch.cy); MK.pinch.cx = cx; MK.pinch.cy = cy; MK.dirty = true; return; }
      if (!MK.drag) return; const dx = e.clientX - MK.drag.x, dy = e.clientY - MK.drag.y; MK.drag.x = e.clientX; MK.drag.y = e.clientY;
      if (MK.drag.mode === "pan") pan(dx, dy); else { v.yaw -= dx * 0.42; v.pitch = clamp(v.pitch + dy * 0.32, -89, 89); const p = MK.dragV; MK.dragV = { yaw: (p ? p.yaw * 0.5 : 0) - dx * 0.42 * (p ? 0.5 : 1), pitch: (p ? p.pitch * 0.5 : 0) + dy * 0.32 * (p ? 0.5 : 1), t: performance.now() }; }
      MK.dirty = true;
    });
    const end = e => { ptr.delete(e.pointerId); if (ptr.size < 2) MK.pinch = null; if (!ptr.size) { if (MK.drag && MK.drag.mode === "orbit" && MK.dragV && performance.now() - MK.dragV.t < 70 && !reduceMotion) MK.inertia = { yaw: clamp(MK.dragV.yaw, -8, 8), pitch: clamp(MK.dragV.pitch, -6, 6) }; MK.dragV = null; MK.drag = null; st.classList.remove("grabbing"); } };
    st.addEventListener("pointerup", end); st.addEventListener("pointercancel", end);
    st.addEventListener("wheel", e => { if (!MK.r) return; e.preventDefault(); MK.userMoved = true; MK.inertia = null; const g = MK.goal || MK.view; MK.goal = { yaw: MK.view.yaw, pitch: MK.view.pitch, tx: MK.view.tx, ty: MK.view.ty, tz: MK.view.tz, dist: clamp(g.dist * Math.exp(e.deltaY * 0.0014), 40, 6000) }; MK.dirty = true; }, { passive: false });
    st.addEventListener("dblclick", e => { if (e.target.closest(".stage__zoom")) return; if (MK.home) { MK.goal = { ...MK.home }; MK.userMoved = false; } });
    const cvs = $("#mkCanvas"); cvs.tabIndex = 0;
    cvs.addEventListener("keydown", e => { const v = MK.view; const k = e.key; if (k === "ArrowLeft") v.yaw += 6; else if (k === "ArrowRight") v.yaw -= 6; else if (k === "ArrowUp") v.pitch = clamp(v.pitch + 5, -89, 89); else if (k === "ArrowDown") v.pitch = clamp(v.pitch - 5, -89, 89); else if (k === "+" || k === "=") v.dist = Math.max(40, v.dist / 1.15); else if (k === "-") v.dist = Math.min(6000, v.dist * 1.15); else return; e.preventDefault(); MK.goal = null; MK.dirty = true; });
    if (window.ResizeObserver) new ResizeObserver(() => { MK.dirty = true; }).observe(st);
  })();

  for (const b of $$("#mkTabs [data-mktab]")) b.addEventListener("click", () => mkTab(b.dataset.mktab));
  /* drawer of the Atelier: illustrations or cards of the set, can be folded to give the card more room */
  function dockTab(t) { ui.dock = t; for (const b of $$("#dockTabs [data-dock]")) b.setAttribute("aria-pressed", String(b.dataset.dock === t)); for (const p of $$("#atelierDock [data-dockpane]")) p.hidden = p.dataset.dockpane !== t; }
  function dockFold(min) { const d = $("#atelierDock"), b = $("#dockToggle"); d.classList.toggle("is-min", min); b.setAttribute("aria-expanded", String(!min)); b.setAttribute("aria-label", min ? "Déplier le tiroir" : "Replier le tiroir"); b.title = min ? "Déplier le tiroir" : "Replier le tiroir"; lsSet("layrys-dock", min ? "min" : "open"); }
  for (const b of $$("#dockTabs [data-dock]")) b.addEventListener("click", () => { if ($("#atelierDock").classList.contains("is-min")) dockFold(false); dockTab(b.dataset.dock); });
  $("#dockToggle").addEventListener("click", () => dockFold(!$("#atelierDock").classList.contains("is-min")));
  { const st = lsGet("layrys-dock"); const d = $("#atelierDock"), b = $("#dockToggle"); const min = st === "min" || (st !== "open" && innerHeight < 800 && innerWidth > 980); d.classList.toggle("is-min", min); b.setAttribute("aria-expanded", String(!min)); b.setAttribute("aria-label", min ? "Déplier le tiroir" : "Replier le tiroir"); b.title = b.getAttribute("aria-label"); }

  /* ---- booster composition: how often a card comes out, how many copies to print ---- */
  const PULL_DEFAULT = { "Commune": 6, "Peu commune": 3, "Rare": 1, "Super rare": 0.33, "Ultra rare": 0.17, "Secrète": 0.03, "Hyper rare": 0.014 };
  function pullState() { const p = project.pack; p.pull = p.pull || {}; p.pull.rates = p.pull.rates || {}; p.pull.displays = p.pull.displays || 100; return p.pull; }
  function renderPull() {
    const el = $("#pullTable"); if (!el) return; const p = project.pack, st = pullState(); const groups = new Map(); for (const c of project.cards) { const r = c.rarity || "Sans rareté"; groups.set(r, (groups.get(r) || 0) + 1); }
    const order = RARITIES.map(r => r[0]), rank = n => (order.indexOf(n) < 0 ? 99 : order.indexOf(n)); const names = [...groups.keys()].sort((a, b) => rank(a) - rank(b));
    if (document.activeElement !== $("#pullCards")) $("#pullCards").value = p.cards; if (document.activeElement !== $("#pullDisplays")) $("#pullDisplays").value = st.displays;
    el.innerHTML = ""; let total = 0, worst = 0; const fr = (v, d = 1) => (+(+v).toFixed(d)).toLocaleString("fr-FR");
    for (const name of names) {
      const n = groups.get(name); const rate = st.rates[name] !== undefined ? st.rates[name] : (PULL_DEFAULT[name] !== undefined ? PULL_DEFAULT[name] : (names.length === 1 ? p.cards : 1)); total += rate;
      const every = rate > 0 ? n / rate : Infinity, copies = rate > 0 ? st.displays * p.packs * rate / n : 0; let H = 0; for (let i = 1; i <= n; i++) H += 1 / i; if (rate > 0) worst = Math.max(worst, every * H);
      const row = document.createElement("div"); row.className = "pull__row"; const a = document.createElement("div"); const nb = document.createElement("b"); nb.textContent = name; const ns = document.createElement("span"); ns.textContent = `${n} carte${n > 1 ? "s" : ""} dans la série`; a.append(nb, ns);
      const inp = document.createElement("input"); inp.type = "number"; inp.min = "0"; inp.max = "60"; inp.step = "0.01"; inp.value = rate; inp.setAttribute("aria-label", `Cartes ${name} par booster`); inp.addEventListener("change", () => { st.rates[name] = Math.max(0, +inp.value || 0); renderPull(); autosave(); });
      const b = document.createElement("div"); const b1 = document.createElement("b"); b1.textContent = rate > 0 ? (every <= 1 ? "Chaque carte sort dans tous les boosters" : `Une carte précise tous les ${fr(every)} boosters`) : "Absente des boosters"; const b2 = document.createElement("span"); b2.textContent = rate > 0 ? `${Math.ceil(copies).toLocaleString("fr-FR")} exemplaires à imprimer par carte` : "—"; b.append(b1, b2); row.append(a, inp, b); el.append(row);
    }
    const ok = Math.abs(total - p.cards) <= 0.06; const boosters = st.displays * p.packs; const sum = $("#pullSum"); sum.classList.toggle("warn", !ok);
    sum.textContent = `Total : ${fr(total, 2)} cartes par booster` + (ok ? `, conforme aux ${p.cards} prévues.` : ` alors que le booster en contient ${p.cards} : ajuste les lignes.`) + (worst > 0 && isFinite(worst) ? ` Pour réunir toute la série, compte environ ${Math.ceil(worst).toLocaleString("fr-FR")} boosters, soit ${fr(worst / p.packs)} display${+(worst / p.packs).toFixed(1) >= 2 ? "s" : ""} (estimation).` : "") + ` Tirage de ${st.displays.toLocaleString("fr-FR")} display${st.displays > 1 ? "s" : ""} de ${p.packs} : ${boosters.toLocaleString("fr-FR")} boosters, ${(boosters * p.cards).toLocaleString("fr-FR")} cartes.`;
  }
  function exportCsv() {
    const esc = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; const rows = [["N°", "Nom", "Rareté", "Finition", "Procédés", "Notes"]];
    project.cards.forEach((c, i) => { const l = mainLayer(c); const fin = l && PRESET_BY_ID[l.presetId] ? PRESET_BY_ID[l.presetId].label : ""; const procs = [...new Set(c.front.layers.filter(x => x.visible && PRESET_BY_ID[x.presetId] && x.presetId !== "i-none").map(x => PRESET_BY_ID[x.presetId].label))].join(" + "); rows.push([pad3(i + 1), c.name, c.rarity || "", fin, procs, c.notes || ""]); });
    saveFile(`layrys-${slugify(project.title)}-liste.csv`, new Blob(["﻿" + rows.map(r => r.map(esc).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" })); toast("Liste des cartes exportée");
  }
  $("#pullCards").addEventListener("change", e => { project.pack.cards = clamp(Math.round(+e.target.value || 1), 1, 60); const c = $("#cardsPerPack"); if (c) c.value = project.pack.cards; renderPull(); autosave(); });
  $("#pullDisplays").addEventListener("change", e => { pullState().displays = clamp(Math.round(+e.target.value || 1), 1, 100000); renderPull(); autosave(); });
  $("#csvBtn").addEventListener("click", () => exportCsv());

  /* ---- boot of the v12 parts ---- */
  setTheme(lsGet("layrys-theme") || "light", true);
  setFont(lsGet("layrys-font") || "", true);
  window.Layrys.renderPull = renderPull; window.Layrys.mock = MK; window.Layrys.mockSet = mockSet; window.Layrys.setTheme = setTheme; window.Layrys.setFont = setFont; window.Layrys.setTab = setTab;

