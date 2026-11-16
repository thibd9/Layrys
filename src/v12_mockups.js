  /* ================= Layrys v12: card list, card sheet, appearance, manipulable 3D mockups ================= */
  const CAT_NAME = { foil: "Dorure à chaud", holo: "Film holographique", varnish: "Vernis sélectif", emboss: "Embossage", ink: "Encre spéciale" };
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  /* ---- cards of the series, under the stage ---- */
  let lazyTimer = null;
  function lazyCards() {
    clearTimeout(lazyTimer);
    lazyTimer = setTimeout(() => {
      if (!T) return; if (ui.busy) return lazyCards();
      const c = project.cards.find(c => (!c.thumb || c.pre == null) && !c.front.layers.some(l => l.kind === "image" && l.visible && !l.src)); if (!c) return;
      if (!c.thumb) c.thumb = snapshotDoc(c.front, 320, [0.35, 0.3], [0, 0]) || "x";
      if (c.pre == null) { try { c.pre = swapCard(c, () => preflightItems(true).filter(it => it.level === "warn").length); } catch (e) { c.pre = 0; } }
      renderCardList(); if (ui.page === "maquettes") { renderMkSlots(); renderMkPicker(); }
    }, 140);
  }
  function renderCardList() {
    const el = $("#cardList"); if (!el) return; el.innerHTML = ""; const n = project.cards.length; $("#cardsCount").textContent = "· " + n;
    project.cards.forEach((c, i) => {
      const row = document.createElement("div"); row.className = "crow"; row.setAttribute("role", "button"); row.tabIndex = 0; row.setAttribute("aria-selected", String(i === project.cardIndex));
      const num = document.createElement("span"); num.className = "crow__num"; num.textContent = pad3(i + 1);
      const th = document.createElement("span"); th.className = "crow__th"; if (c.thumb && c.thumb.length > 4) th.style.backgroundImage = `url(${c.thumb})`;
      const meta = document.createElement("div"); meta.className = "crow__meta"; const b = document.createElement("b"); b.textContent = c.name + (c.rarity && !c.name.includes(c.rarity) ? " · " + c.rarity : "");
      const s = document.createElement("span"); const dot = document.createElement("i"); dot.className = "pre-dot" + (c.pre ? " warn" : ""); dot.title = c.pre == null ? "Contrôle en cours" : c.pre ? `${c.pre} point(s) à vérifier avant impression` : "Prête pour l'impression"; if (c.pre == null) dot.style.opacity = ".35";
      const fs = document.createElement("span"); fs.textContent = finishSummary(c); fs.style.cssText = "overflow:hidden;text-overflow:ellipsis"; s.append(dot, fs); meta.append(b, s);
      const acts = document.createElement("div"); acts.className = "crow__acts";
      const mk = (ico, title, fn) => { const bt = document.createElement("button"); bt.type = "button"; bt.innerHTML = ICO(ico, 1); bt.title = title; bt.setAttribute("aria-label", title); bt.addEventListener("click", e => { e.stopPropagation(); fn(); }); return bt; };
      acts.append(mk("up", "Monter dans la série", () => moveCard(i, -1)), mk("down", "Descendre dans la série", () => moveCard(i, 1)), mk("copy", "Dupliquer", () => duplicateCard(i)), mk("trash", "Supprimer", () => deleteCard(i)));
      row.append(num, th, meta, acts); row.addEventListener("click", () => { if (i !== project.cardIndex) setCard(i); });
      row.addEventListener("keydown", e => { if (e.target === row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); row.click(); } });
      el.append(row);
    });
    if (project.cards.some(c => !c.thumb || c.pre == null)) lazyCards();
  }
  $("#cardsNew").addEventListener("click", newCard); $("#cardsRarity").addEventListener("click", declineRarities); $("#cardsAll").addEventListener("click", () => setPage("serie"));
  $("#cardsFiles").addEventListener("change", e => { cardsFromFiles(e.target.files); e.target.value = ""; });

  /* ---- card sheet ---- */
  let sheetTimer = null;
  function renderSheet() {
    const c = curCard(); if (!c || !$("#sheetName")) return;
    if (document.activeElement !== $("#sheetName")) $("#sheetName").value = c.name; $("#sheetRarity").value = c.rarity || ""; if (document.activeElement !== $("#sheetNotes")) $("#sheetNotes").value = c.notes || "";
    clearTimeout(sheetTimer); sheetTimer = setTimeout(() => {
      if (ui.page !== "atelier") return;
      const procs = $("#sheetProcs"); procs.innerHTML = ""; const set = new Set([...procsOf(project.front), ...procsOf(project.back)]);
      if (!set.size) { const p = document.createElement("span"); p.className = "note"; p.textContent = "Impression quadri seule, sans finition."; procs.append(p); }
      for (const pr of ["holo", "foil", "varnish", "emboss", "ink"]) if (set.has(pr)) { const sp = document.createElement("span"); sp.className = "proc"; const d = document.createElement("i"); d.className = "proc-dot " + pr; sp.append(d, CAT_NAME[pr]); procs.append(sp); }
      const ps = $("#sheetPasses"); ps.innerHTML = ""; for (const st of fabricationSteps()) { const li = document.createElement("li"); li.textContent = st; ps.append(li); }
      const pre = $("#sheetPre"); pre.innerHTML = ""; let items = []; try { items = preflightItems(true); } catch (e) {} const warns = items.filter(it => it.level === "warn");
      for (const it of (warns.length ? warns : items.filter(it => it.level === "ok").slice(0, 3))) { const r = document.createElement("div"); r.className = it.level; const i = document.createElement("i"); const sp = document.createElement("span"); sp.textContent = it.text; r.append(i, sp); pre.append(r); }
      const badge = $("#sheetBadge"); badge.textContent = warns.length ? `${warns.length} point${warns.length > 1 ? "s" : ""} à vérifier` : "Prête à imprimer"; badge.className = "badge " + (warns.length ? "warn" : "ok");
    }, 380);
  }
  $("#sheetName").addEventListener("input", e => { curCard().name = e.target.value || "Carte"; updateCardNav(); }); $("#sheetName").addEventListener("change", () => { regenTokens(); renderSeries(false); autosave(); });
  $("#sheetRarity").addEventListener("change", e => { curCard().rarity = e.target.value; renderCardList(); autosave(); });
  $("#sheetNotes").addEventListener("change", e => { curCard().notes = e.target.value; autosave(); });
  $("#sheetToPlans").addEventListener("click", () => { project.dieline.kind = "card"; renderDielineOpts(); setPage("plans"); });
  $("#sheetPdf").addEventListener("click", () => exportPdf().catch(err => { console.error(err); toast("Export PDF impossible : " + (err && err.message || err)); }));

  /* ---- a layer that is a snapshot of the interface itself (mockup image 420 px, finish thumbnail 220 px, contact sheet 320 px, binder 360 px) was dropped by mistake ---- */
  const STRAY_W = [220, 320, 360, 420];
  const isStray = (doc, l) => l.kind === "image" && !!l.src && !l.assetId && !l.keep && STRAY_W.includes(l.w) && doc.layers.filter(x => x.kind === "image" && x.src).length > 1;
  function checkStray() {
    const el = $("#strayNote"); if (!el) return; const doc = curDoc(); const list = doc.layers.filter(l => isStray(doc, l)); el.hidden = !list.length; if (!list.length) return;
    $("#strayText").textContent = list.length > 1 ? `${list.length} calques ressemblent à des images de l'interface déposées par erreur sur la carte. Ton illustration est toujours dessous.` : `Le calque « ${list[0].name} » ressemble à une image de maquette déposée par erreur sur la carte. Ton illustration est toujours dessous.`;
  }
  $("#strayFix").addEventListener("click", () => { const doc = curDoc(); const list = doc.layers.filter(l => isStray(doc, l)); for (const l of list) removeLayer(doc, l.id); const c = curCard(); c.thumb = ""; c.pre = null; toast(list.length > 1 ? "Calques retirés. Ctrl Z pour annuler." : "Calque retiré. Ctrl Z pour annuler."); });
  $("#strayKeep").addEventListener("click", () => { const doc = curDoc(); for (const l of doc.layers.filter(l => isStray(doc, l))) l.keep = true; checkStray(); autosave(); });

  /* ---- appearance: theme and interface font ---- */
  const FONTS = [["", "Sora et Figtree", "géométrique, par défaut", ""], ["rounded", "Outfit", "ronde et douce", "Outfit:wght@400;500;600;700"], ["editorial", "Bricolage et Instrument", "plus de caractère", "Bricolage+Grotesque:wght@500;600;700&family=Instrument+Sans:wght@400;500;600;700"], ["classic", "DM Sans", "neutre et compacte", "DM+Sans:wght@400;500;600;700"], ["system", "Police du système", "celle de ton appareil", ""]];
  const loadedFonts = new Set();
  function setFont(id, silent) {
    const f = FONTS.find(x => x[0] === id) || FONTS[0];
    if (f[3] && !loadedFonts.has(f[0])) { const ln = document.createElement("link"); ln.rel = "stylesheet"; ln.href = "https://fonts.googleapis.com/css2?family=" + f[3] + "&display=swap"; document.head.append(ln); loadedFonts.add(f[0]); }
    if (f[0]) document.documentElement.dataset.font = f[0]; else delete document.documentElement.dataset.font; ui.font = f[0]; if (!silent) lsSet("layrys-font", f[0]);
    const el = $("#fontList"); el.innerHTML = ""; for (const [fid, name, sub] of FONTS) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(fid === ui.font)); const nb = document.createElement("b"); nb.textContent = name; const sp = document.createElement("span"); sp.textContent = sub; b.append(nb, sp); b.addEventListener("click", () => setFont(fid)); el.append(b); }
  }
  function isDark() { const t = document.documentElement.dataset.theme; return t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches); }
  function setTheme(t, silent) {
    ui.theme = t; if (t === "dark" || t === "light") document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; if (!silent) lsSet("layrys-theme", t);
    for (const b of $$("[data-theme-set]")) b.setAttribute("aria-pressed", String(b.dataset.themeSet === t));
    ui.dirty = true; mockInvalidate(true);
  }
  for (const b of $$("[data-theme-set]")) b.addEventListener("click", () => setTheme(b.dataset.themeSet));
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (ui.theme === "auto") mockInvalidate(true); }); } catch (e) {}

  /* ================= mockups ================= */
  const PRODUCTS = [
    ["Cartes", [["card", "Carte seule", "flottante", "card", 1], ["fan", "Éventail", "2 à 9 cartes", "fan", 0], ["row", "Rangée", "2 à 7 cartes", "row", 0], ["stack", "Pile de cartes", "épaisseur réelle", "pile", 0], ["binder", "Page de classeur", "9 pochettes", "grid", 9]]],
    ["Protections", [["sleeve", "Pochette", "souple", "card", 1], ["toploader", "Toploader", "rigide", "case", 1], ["onetouch", "Boîtier magnétique", "one-touch", "case", 1], ["slab", "Slab gradé", "avec étiquette", "slab", 1]]],
    ["Présentation", [["acryl1", "Bloc acrylique", "1 carte, 4 vis", "block", 1], ["acryl3", "Bloc triple", "3 cartes, 6 vis", "block", 3], ["frame1", "Carte encadrée", "passe-partout", "frame", 1], ["frame3", "Cadre triptyque", "3 boîtiers", "frame", 3]]],
    ["Emballages", [["booster", "Booster", "sachet soudé", "booster", 0], ["display", "Display", "présentoir", "cube", 0], ["etb", "Coffret", "boîte fermée", "cube", 0], ["deckbox", "Deck box", "60 à 100 cartes", "cube", 0]]],
  ];
  const MK = { r: null, failed: false, scene: null, view: { yaw: -18, pitch: 6, dist: 420, tx: 0, ty: 0, tz: 0, fov: 26 }, home: null, goal: null, dirty: true, texDirty: true, queue: [], vkey: "", raf: 0, last: 0, slotSel: 0, demo: new Map(), stamp: 1, drag: null, pointers: new Map(), pinch: null, packDoc: null, texSize: 512 };
  const mkProd = () => { for (const [, list] of PRODUCTS) for (const p of list) if (p[0] === project.mock.product) return p; return PRODUCTS[2][1][0]; };
  const mkOpts = () => (project.mock.opts[project.mock.product] = project.mock.opts[project.mock.product] || {});
  function mkSlotCount() { const id = mkProd()[0], o = mkOpts(); if (id === "fan") return clamp(o.count || 5, 2, 9); if (id === "row") return clamp(o.count || 4, 2, 7); if (id === "stack") return 1 + clamp(o.loose === undefined ? 2 : o.loose, 0, 3); return mkProd()[4]; }
  function mkPool() {
    const cards = project.cards, i0 = project.cardIndex; const used = new Set(cards.flatMap(c => c.front.layers.map(l => l.assetId).filter(Boolean)));
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
    loadArt(art).then(im => { setSrc(l, im); l.assetId = art.id; fitLayer(l, "cover"); if (l.fx.mask === 4) { l.fx.mask = 10; l.maskImg = null; } d.ready = true; MK.texDirty = true; MK.dirty = true; }).catch(() => { d.ready = true; });
    return tpl;
  }
  const mkCardFor = ref => (ref && ref[0] === "c" ? project.cards.find(c => c.id === ref.slice(2)) : ref ? demoCard(ref.slice(2)) : null) || curCard();
  function mkRefInfo(ref) { if (ref[0] === "c") { const i = project.cards.findIndex(c => c.id === ref.slice(2)); const c = project.cards[i]; return c ? { name: c.name, sub: "Carte " + pad3(i + 1), thumb: c.thumb && c.thumb.length > 4 ? c.thumb : "", pos: "" } : null; } const a = ART_LIBRARY.find(x => x.id === ref.slice(2)); return a ? { name: a.name, sub: "Exemple", thumb: a.src, pos: "50% 22%" } : null; }

  /* ---- textures drawn on a 2D canvas: slab labels, box faces ---- */
  function potFrom(c, pw, ph) { const [o, x] = cv(pw, ph); x.imageSmoothingQuality = "high"; x.drawImage(c, 0, 0, pw, ph); return o; }
  function logoPaths(x, px, py, h, color) { const paths = $$(".logo__tile svg path").map(p => p.getAttribute("d")); x.save(); x.translate(px, py); x.scale(h / 100, h / 100); x.fillStyle = color; for (const d of paths) { try { x.fill(new Path2D(d)); } catch (e) {} } x.restore(); }
  function slabLabel(back) {
    const W = 1400, H = 520; const [c, x] = cv(W, H); const o = project.mock.opts.slab || {}; const card = mkCardFor(mkAssign()[0]); const idx = Math.max(0, project.cards.indexOf(card));
    x.fillStyle = "#fbfaf6"; x.fillRect(0, 0, W, H); x.strokeStyle = "#17150f"; x.lineWidth = 6; x.strokeRect(14, 14, W - 28, H - 28);
    x.fillStyle = "#17150f"; x.textBaseline = "alphabetic";
    if (back) {
      logoPaths(x, 90, 110, 300, "#17150f"); x.font = "700 86px Sora, Figtree, sans-serif"; x.fillText("LAYRYS", 400, 220); x.font = "600 44px Figtree, sans-serif"; x.fillText("GRADING · AUTHENTIFICATION", 400, 290);
      x.font = "500 36px Figtree, sans-serif"; x.fillStyle = "#645e51"; x.fillText("Certificat LY" + String(20260000 + idx * 137 + 4219), 400, 360);
      let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const q = 13, cell = 22, qx = W - 90 - q * cell, qy = 110; x.fillStyle = "#17150f";
      for (let i = 0; i < q; i++) for (let j = 0; j < q; j++) { const corner = (i < 4 && j < 4) || (i > q - 5 && j < 4) || (i < 4 && j > q - 5); if (corner ? ((i % (q - 4) === 0 || i % (q - 4) === 3 || j % (q - 4) === 0 || j % (q - 4) === 3) || (i % (q - 4) > 0 && i % (q - 4) < 3 && j % (q - 4) > 0 && j % (q - 4) < 3 && false)) : rnd() > 0.52) x.fillRect(qx + i * cell, qy + j * cell, cell, cell); }
      return potFrom(c, 1024, 512);
    }
    x.fillRect(36, 36, 250, H - 72); logoPaths(x, 100, 70, 230, "#fbfaf6"); x.fillStyle = "#fbfaf6"; x.font = "700 46px Sora, Figtree, sans-serif"; x.textAlign = "center"; x.fillText("LAYRYS", 161, 372); x.font = "600 30px Figtree, sans-serif"; x.fillText("GRADING", 161, 414);
    x.textAlign = "left"; x.fillStyle = "#17150f"; const tx = 322, tw = W - tx - 330; const fitText = (t, y, font) => { x.font = font; let s = t; while (x.measureText(s).width > tw && s.length > 4) s = s.slice(0, -2); x.fillText(s === t ? t : s.trimEnd() + "…", tx, y); };
    fitText((o.title || card.name || "Carte").toUpperCase(), 104, "700 58px Sora, Figtree, sans-serif"); fitText((project.title || "").toUpperCase(), 164, "600 42px Figtree, sans-serif");
    x.fillStyle = "#645e51"; fitText(`${new Date().getFullYear()} · ${fmt().game} · N° ${pad3(idx + 1)}/${pad3(project.cards.length)}${card.rarity ? " · " + card.rarity.toUpperCase() : ""}`, 218, "500 36px Figtree, sans-serif");
    x.fillStyle = "#17150f"; x.fillRect(tx, 250, tw, 3); const g = parseFloat(String(o.grade || "10").replace(",", ".")) || 10; const sub = [["CENTRAGE", Math.min(10, g)], ["COINS", Math.min(10, g)], ["CÔTÉS", Math.min(10, g)], ["SURFACE", Math.min(10, g + 0.5)]];
    sub.forEach(([n, v], i) => { const cx = tx + (i % 2) * (tw / 2), cy = 318 + Math.floor(i / 2) * 62; x.font = "600 34px Figtree, sans-serif"; x.fillStyle = "#645e51"; x.fillText(n, cx, cy); x.font = "700 40px Sora, Figtree, sans-serif"; x.fillStyle = "#17150f"; x.fillText(String(v).replace(".", ","), cx + tw / 2 - 110, cy); });
    for (let i = 0, bx = tx; bx < tx + tw - 8; i++) { const w = 3 + ((i * 7) % 5) * 2; x.fillRect(bx, 432, w, 46); bx += w + 4 + (i % 3) * 3; }
    x.fillRect(W - 300, 36, 4, H - 72); x.textAlign = "center"; x.font = "700 250px Sora, Figtree, sans-serif"; const gs = String(o.grade || "10"); x.font = `700 ${gs.length > 2 ? 170 : 250}px Sora, Figtree, sans-serif`; x.fillText(gs, W - 150, 300);
    x.font = "700 46px Figtree, sans-serif"; x.fillText((o.mention || "GEM MINT").toUpperCase(), W - 150, 400, 250);
    return potFrom(c, 1024, 512);
  }
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
  function packBack() {
    const p = project.pack; const [c, x] = cv(512, 1024); const g = x.createLinearGradient(0, 0, 512, 1024); g.addColorStop(0, "#3a2f6b"); g.addColorStop(1, p.boxColor); x.fillStyle = g; x.fillRect(0, 0, 512, 1024);
    x.fillStyle = "rgba(255,255,255,.12)"; x.fillRect(246, 0, 20, 1024); x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "800 54px Unbounded, Sora, sans-serif"; x.fillText(p.title, 256, 190, 440);
    x.font = "600 30px Figtree, sans-serif"; x.fillText(`${p.cards} cartes à collectionner`, 256, 250, 440); x.fillStyle = "rgba(255,255,255,.8)"; x.font = "500 22px Figtree, sans-serif";
    ["Série " + (project.title || ""), "Dès 6 ans. Ne convient pas aux enfants de moins de 3 ans.", "Contenu aléatoire. Conserver l'emballage."].forEach((t, i) => x.fillText(t, 256, 660 + i * 38, 440));
    x.fillStyle = "#fff"; x.fillRect(156, 800, 200, 96); x.fillStyle = "#111"; for (let i = 0, bx = 168; bx < 344; i++) { const w = 2 + ((i * 5) % 4) * 2; x.fillRect(bx, 810, w, 66); bx += w + 3 + (i % 2) * 2; }
    return c;
  }
  function mkStatic() {
    if (!MK.r) return; const id = mkProd()[0], r = MK.r, p = project.pack;
    if (id === "slab") { r.upload(r.tex("label"), slabLabel(false)); r.upload(r.tex("labelb"), slabLabel(true)); }
    if (id === "booster" || id === "display") { const ca = p.boosterW / (p.boosterH - 2 * p.crimp); const ml = mainLayer(curCard()); if (!MK.packLayer) MK.packLayer = newLayer("image", "Booster"); const l = MK.packLayer; setSrc(l, packCanvas({ title: p.title, sub: p.sub, cards: p.cards, c1: p.boxColor, c2: "#3a2f6b" }, ml && ml.src ? ml.src : null, ca)); l.scale = 1; l.x = 0.5; l.y = 0.5; l.rot = 0; applyPreset(l, PRESET_BY_ID[p.finish] ? p.finish : "h-oil"); l.fx.mask = 0; MK.packDoc = { id: "pack", layers: [l], stock: p.boxColor, coat: 0.5 }; MK.packAspect = ca; r.upload(r.tex("packb"), packBack()); } else MK.packDoc = null;
    if (id === "display") { const [bw, , bd] = boxDims(p.packs); r.upload(r.tex("boxf"), boxArt(bw / (p.boosterH + 34), `${p.packs} BOOSTERS · ${p.cards} CARTES`)); r.upload(r.tex("boxlow"), boxPlain(bw, p.boosterH * 0.42, p.title, `${p.packs} boosters`)); r.upload(r.tex("boxs"), boxPlain(bd, p.boosterH * 0.42, p.sub || p.title)); }
    if (id === "etb") { r.upload(r.tex("boxf"), boxArt(191 / 165, "COFFRET")); r.upload(r.tex("boxs"), boxPlain(89, 165, p.title, p.sub)); r.upload(r.tex("boxt"), boxPlain(191, 89, p.title, "boosters, pochettes, dés")); }
    if (id === "deckbox") { r.upload(r.tex("boxdeck"), boxArt(72 / 95, "DECK")); r.upload(r.tex("boxs"), boxPlain(45, 95, p.title)); r.upload(r.tex("boxt"), boxPlain(72, 45, p.title)); }
  }

  /* ---- scene ---- */
  function cssRgb(name) { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); const m = /^#([0-9a-f]{6})$/i.exec(v); return m ? hexRgb(v) : [0.86, 0.85, 0.82]; }
  function mkFloor() {
    const f = project.mock.floor || "studio"; const dark = f === "dark" || (f === "studio" && isDark());
    if (f === "wood") return { bg: [0.09, 0.075, 0.065], color: [0.56, 0.4, 0.26], style: 1, shadow: 1.25 };
    if (f === "felt") return { bg: [0.03, 0.07, 0.055], color: [0.1, 0.34, 0.24], style: 2, shadow: 1.2 };
    if (f === "slate") return { bg: [0.06, 0.065, 0.075], color: [0.25, 0.27, 0.3], style: 3, shadow: 1.3 };
    if (f === "studio") return { bg: cssRgb("--stage"), color: cssRgb("--stage-2"), style: 0, shadow: dark ? 1.5 : 0.75 };
    return dark ? { bg: [0.035, 0.035, 0.043], color: [0.12, 0.12, 0.14], style: 0, shadow: 1.5 } : { bg: [0.86, 0.85, 0.82], color: [0.94, 0.93, 0.9], style: 0, shadow: 0.75 };
  }
  function fitDist(ext) { const c = MK.r.canvas; const asp = Math.max(0.3, c.clientWidth / Math.max(1, c.clientHeight)); return Math.max(ext[1], ext[0] / asp) / (2 * Math.tan(13 * Math.PI / 180)) * 1.06; }
  function mockBuild(resetView) {
    if (!MK.r) return; const pr = mkProd(), d = fmtDims(), p = project.pack, fl = mkFloor(); const n = mkSlotCount(); MK.slotSel = Math.min(MK.slotSel, Math.max(0, n - 1));
    MK.texSize = ui.quality < 1 ? (n > 3 ? 256 : 512) : (n > 3 ? 512 : 1024);
    const sc = MockScenes.build(pr[0], { W: d.w, H: d.h, R: d.r, opts: mkOpts(), tex: k => MK.r.tex(k), floor: fl, core: project.print.core === "white core" ? "white" : "black", pack: { w: p.boosterW, h: p.boosterH, crimp: p.crimp, cards: p.cards, packs: p.packs, color: p.boxColor, paper: p.finish === "i-none" }, box: boxDims(p.packs) });
    sc.bg = fl.bg; MK.scene = sc; MK.home = { yaw: sc.cam.yaw, pitch: sc.cam.pitch, dist: fitDist(sc.ext), tx: sc.target[0], ty: sc.target[1], tz: sc.target[2] };
    if (resetView || !MK.viewFor || MK.viewFor !== pr[0]) { Object.assign(MK.view, MK.home); MK.goal = null; MK.viewFor = pr[0]; }
    $("#mkTitle").textContent = pr[1]; $("#mkCaption").textContent = sc.caption; mkStatic(); MK.texDirty = true; MK.dirty = true;
    renderMkProducts(); renderMkSlots(); renderMkPicker(); renderMkFields();
  }
  function mkLight() {
    const L = lightDef(); let dir = [-0.45, 0.7, 0.8]; if (L.kind === "fixed") dir = [(L.x - 50) / 50 * 1.1, (50 - L.y) / 50 * 1.1 + 0.2, 0.85]; else if (L.kind === "anim") { const [x, y] = L.fn(performance.now() / 1000 * (ui.light === "candle" ? 3 : 0.8)); dir = [(x - 50) / 50 * 1.2, (50 - y) / 50 * 1.2 + 0.2, 0.85]; }
    const w = L.warm || 0; return { dir, col: [1 + 0.12 * w, 1 - 0.04 * Math.abs(w), 1 - 0.28 * w], dim: L.env === 1 ? [0.2, 0.13, 0.5] : L.env === 2 ? [0.035, 0.04, 0.06] : [1, 1, 1], L };
  }
  function mkRenderTex(frame, doc, key, cam, lt, aspectWH, w, h) {
    const V = Mock3D.V; const toEye = V.norm(V.sub(cam.eye, frame.c)); const vl = [V.dot(toEye, frame.r), V.dot(toEye, frame.u), V.dot(toEye, frame.n)], ll = [V.dot(cam.L, frame.r), V.dot(cam.L, frame.u), V.dot(cam.L, frame.n)];
    const lz = Math.max(ll[2], 0.12), z = 0.6 * (lt.L.z || 1); const pointer = [clamp(0.5 + (ll[0] / lz) * z / (1.1 * aspectWH), -1.5, 2.5), clamp(0.5 + (ll[1] / lz) * z / 1.1, -1.5, 2.5)];
    thumbCanvas.width = w; thumbCanvas.height = h;
    T.renderDoc(doc, { pointer, tilt: [Math.asin(clamp(vl[0], -0.95, 0.95)), Math.asin(clamp(vl[1], -0.95, 0.95))], aspect: aspectWH, intensity: ui.intensity * (ll[2] > 0 ? 1 : 0.3), seed: ui.seed, selectedId: null, view: 0, light: { warm: lt.L.warm || 0, z: lt.L.z || 1 }, proof: ui.proof, env: lt.L.env || 0 });
    MK.r.upload(MK.r.tex(key), thumbCanvas);
  }
  function mkRenderSlot(i, cam, lt) {
    const s = MK.scene.slots[i]; if (!s) return; const c = mkCardFor(mkAssign()[i]); const V = Mock3D.V; const front = V.dot(V.sub(cam.eye, s.c), s.n) >= 0;
    const fr = front ? s : { c: s.c, r: V.mul(s.r, -1), u: s.u, n: V.mul(s.n, -1) }; mkRenderTex(fr, front ? c.front : c.back, "s" + i + (front ? "f" : "b"), cam, lt, aspect(), MK.texSize, MK.texSize);
  }
  function mockFrame(now) {
    MK.raf = 0; if (ui.page !== "maquettes" || !MK.r || !MK.scene) return;
    const dt = Math.min(0.05, (now - MK.last) / 1000 || 0.016); MK.last = now; const v = MK.view; let moving = false;
    if (MK.goal) { const k = 1 - Math.exp(-dt * 9); let far = 0; for (const key of ["yaw", "pitch", "dist", "tx", "ty", "tz"]) { const d = MK.goal[key] - v[key]; v[key] += d * k; far = Math.max(far, Math.abs(d) / (key === "dist" ? v.dist * 0.01 : 0.2)); } if (far < 1) { Object.assign(v, MK.goal); MK.goal = null; } moving = true; }
    if (project.mock.auto && !MK.drag && !reduceMotion) { v.yaw += dt * 16; moving = true; }
    const lt = mkLight(); const anim = lt.L.kind === "anim" && !reduceMotion;
    if (MK.r.resize(ui.quality < 1 ? 0.6 : 1)) { MK.dirty = true; if (MK.home) MK.home.dist = fitDist(MK.scene.ext); }
    if ((moving || anim || MK.dirty || MK.queue.length) && !ui.busy && T) {
      const cam = MK.r.camera(v, lt); const vkey = [v.yaw, v.pitch, v.dist, v.tx, v.ty, v.tz, lt.dir.join(), ui.light].map(x => typeof x === "number" ? x.toFixed(2) : x).join("|");
      if (vkey !== MK.vkey || MK.texDirty) { MK.vkey = vkey; MK.texDirty = false; MK.queue = MK.scene.slots.map((s, i) => i).filter(i => MK.scene.slots[i]); if (MK.packDoc && MK.scene.pack) MK.queue.push("pack"); }
      let budget = ui.quality < 1 ? 1 : (MK.queue.length <= 3 ? 3 : 4);
      while (MK.queue.length && budget-- > 0) { const i = MK.queue.shift(); if (i === "pack") { const p = project.pack; mkRenderTex(MK.scene.pack, MK.packDoc, "packf", cam, lt, MK.packAspect || p.boosterW / p.boosterH, ui.quality < 1 ? 256 : 512, ui.quality < 1 ? 512 : 1024); } else mkRenderSlot(i, cam, lt); }
      MK.r.draw(MK.scene, v, lt); MK.dirty = false;
    }
    MK.raf = requestAnimationFrame(mockFrame);
  }
  function mockDirty() { MK.dirty = true; }
  function mockInvalidate(rebuild) { MK.stamp++; if (ui.page !== "maquettes" || !MK.r) return; if (rebuild) mockBuild(false); else { MK.texDirty = true; MK.dirty = true; } }
  function mockEnter() {
    if (!MK.r && !MK.failed) { try { MK.r = Mock3D.create($("#mkCanvas")); } catch (e) { console.error(e); MK.failed = true; $("#mkCaption").textContent = "WebGL n'est pas disponible : les maquettes en volume ne peuvent pas s'afficher."; } }
    if (!MK.r) return; MK.stamp++; $("#mkFloor").value = project.mock.floor || "studio"; $("#mkAuto").setAttribute("aria-pressed", String(!!project.mock.auto));
    MK.r.resize(ui.quality < 1 ? 0.6 : 1); mockBuild(false); MK.last = performance.now(); if (!MK.raf) MK.raf = requestAnimationFrame(mockFrame);
  }
  function mockLeave() { if (MK.raf) { cancelAnimationFrame(MK.raf); MK.raf = 0; } if (T) for (const d of MK.demo.values()) for (const doc of [d.card.front, d.card.back]) for (const l of doc.layers) T.drop(l.id); MK.demo.clear(); }
  function mockSet(id) { project.mock.product = id; MK.slotSel = 0; mockBuild(true); autosave(); }
  async function mockCapture() {
    if (!MK.r || !MK.scene) return; MK.r.draw(MK.scene, MK.view, mkLight()); $("#captureImg").src = MK.r.canvas.toDataURL("image/png"); $("#captureBox").hidden = false;
    const blob = await toBlob(MK.r.canvas); if (blob) saveFile("layrys-maquette-" + slugify(mkProd()[1]) + ".png", blob);
  }

  /* ---- mockup interface ---- */
  function renderMkProducts() {
    const el = $("#mkProducts"); el.innerHTML = "";
    for (const [group, list] of PRODUCTS) {
      const g = document.createElement("div"); g.className = "prodgroup"; const h = document.createElement("h3"); h.textContent = group; const grid = document.createElement("div"); grid.className = "products";
      for (const [id, name, sub, ico] of list) { const b = document.createElement("button"); b.type = "button"; b.className = "prod"; b.dataset.prod = id; b.setAttribute("aria-pressed", String(project.mock.product === id)); b.innerHTML = ICO(ico); const t = document.createElement("div"); const nb = document.createElement("b"); nb.textContent = name; const sp = document.createElement("span"); sp.textContent = sub; t.append(nb, sp); b.append(t); b.addEventListener("click", () => mockSet(id)); grid.append(b); }
      g.append(h, grid); el.append(g);
    }
  }
  function renderMkSlots() {
    const el = $("#mkSlots"); if (!el) return; el.innerHTML = ""; const n = mkSlotCount(), id = mkProd()[0]; const variable = id === "fan" || id === "row" || id === "stack";
    $("#mkCountWrap").hidden = !variable; $("#mkCount").value = n; for (const b of ["mkDiff", "mkSame", "mkShuffle"]) $("#" + b).hidden = n < 2;
    $("#mkSlotsNote").textContent = n ? `· ${n} emplacement${n > 1 ? "s" : ""}` : ""; $("#mkPicker").hidden = !n; $("#mkPickTitle").parentElement.hidden = !n;
    if (!n) { const p = document.createElement("p"); p.className = "note"; p.textContent = "Ce produit reprend l'illustration de la carte active. Titre, couleur et finition du sachet se règlent dans Options."; el.append(p); return; }
    const a = mkAssign();
    for (let i = 0; i < n; i++) { const info = mkRefInfo(a[i]) || { name: "", thumb: "" }; const b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.setAttribute("aria-pressed", String(i === MK.slotSel)); b.title = info.name; const im = document.createElement("i"); if (info.thumb) { im.style.backgroundImage = `url(${info.thumb})`; if (info.pos) im.style.backgroundPosition = info.pos; } b.append(im, id === "stack" ? (i === 0 ? "Dessus" : "Étalée " + i) : String(i + 1)); b.addEventListener("click", () => { MK.slotSel = i; renderMkSlots(); renderMkPicker(); }); el.append(b); }
    $("#mkPickTitle").textContent = n > 1 ? `Choisir la carte de l'emplacement ${MK.slotSel + 1}` : "Choisir la carte";
  }
  function renderMkPicker() {
    const el = $("#mkPicker"); if (!el) return; el.innerHTML = ""; const n = mkSlotCount(); if (!n) return; const a = mkAssign(); const cur = a[MK.slotSel];
    const refs = project.cards.map(c => "c:" + c.id).concat(ART_LIBRARY.map(x => "d:" + x.id));
    for (const ref of refs) { const info = mkRefInfo(ref); if (!info) continue; const b = document.createElement("button"); b.type = "button"; b.className = "pick"; b.setAttribute("aria-pressed", String(ref === cur)); const im = document.createElement("i"); if (info.thumb) { im.style.backgroundImage = `url(${info.thumb})`; if (info.pos) im.style.backgroundPosition = info.pos; } const nb = document.createElement("b"); nb.textContent = info.name; const sp = document.createElement("span"); sp.textContent = info.sub; b.append(im, nb, sp); b.title = info.sub === "Exemple" ? "Illustration d'exemple, avec les finitions de la carte active" : info.name;
      b.addEventListener("click", () => { a[MK.slotSel] = ref; if (n > 1) MK.slotSel = (MK.slotSel + 1) % n; MK.texDirty = true; MK.dirty = true; if (mkProd()[0] === "slab") mkStatic(); renderMkSlots(); renderMkPicker(); autosave(); }); el.append(b); }
  }
  function renderMkFields() {
    const el = $("#mkFields"); el.innerHTML = ""; const id = mkProd()[0], o = mkOpts(), p = project.pack; const kv = document.createElement("div"); kv.className = "kv";
    const field = (label, node) => { const lab = document.createElement("label"); lab.className = "field"; lab.textContent = label; lab.append(node); kv.append(lab); };
    const sel = (label, opts, val, fn) => { const se = document.createElement("select"); for (const [v, t] of opts) { const op = document.createElement("option"); op.value = v; op.textContent = t; se.append(op); } se.value = val; se.addEventListener("change", () => { fn(se.value); mockBuild(false); autosave(); }); field(label, se); };
    const inp = (label, type, val, fn, attrs) => { const i = document.createElement("input"); i.type = type; i.value = val; Object.assign(i, attrs || {}); i.addEventListener("change", () => { fn(i.value); mockBuild(false); autosave(); }); field(label, i); };
    if (id === "stack") inp("Cartes dans la pile", "number", o.pile || 30, v => { o.pile = clamp(+v || 30, 2, 150); }, { min: 2, max: 150 });
    if (id === "sleeve") { sel("Teinte du dos", [["clear", "Transparente"], ["#0d0d10", "Noire"], ["#1f3fae", "Bleue"], ["#b3202a", "Rouge"], ["#1c7a45", "Verte"], ["#5b2a9b", "Violette"], ["#f1efe9", "Blanche"]], o.tint || "clear", v => { o.tint = v; }); sel("Finition", [["gloss", "Brillante"], ["matte", "Mate"]], o.finish || "gloss", v => { o.finish = v; }); }
    if (id === "slab") { inp("Note", "text", o.grade || "10", v => { o.grade = v.slice(0, 4) || "10"; }, { maxLength: 4 }); inp("Mention", "text", o.mention || "GEM MINT", v => { o.mention = v; }, { maxLength: 14 }); inp("Titre de l'étiquette", "text", o.title || "", v => { o.title = v; }, { maxLength: 40, placeholder: "Nom de la carte" }); }
    if (id === "acryl1" || id === "acryl3") sel("Épaisseur du bloc", [["15", "15 mm"], ["20", "20 mm"], ["30", "30 mm"]], String(o.thick || 20), v => { o.thick = +v; });
    if (id === "frame1" || id === "frame3") { sel("Format du cadre", [["s", "Compact"], ["m", "Standard"], ["l", "Grand, marges larges"]], o.size || "m", v => { o.size = v; }); sel("Cadre", [["#16161a", "Noir"], ["#f2f0ea", "Blanc"], ["#8a5a33", "Noyer"], ["#b98d5b", "Chêne"]], o.frame || "#16161a", v => { o.frame = v; }); sel("Fond", [["#ece7dc", "Crème"], ["#2b2f36", "Anthracite"], ["#111114", "Noir"], ["#ffffff", "Blanc"], ["#243a5e", "Bleu nuit"]], o.mat || (id === "frame3" ? "#2b2f36" : "#ece7dc"), v => { o.mat = v; }); }
    if (id === "binder") sel("Classeur", [["#1c1f29", "Anthracite"], ["#2a1a3d", "Prune"], ["#1a2a3d", "Marine"], ["#3d2a1a", "Cuir"], ["#eae6dc", "Crème"]], o.color || "#1c1f29", v => { o.color = v; });
    if (mkProd()[4] === 0 && id !== "fan" && id !== "row" && id !== "stack") {
      inp("Titre", "text", p.title, v => { p.title = v; $("#packTitle").value = v; }, { maxLength: 24 }); inp("Sous-titre", "text", p.sub, v => { p.sub = v; $("#packSub").value = v; }, { maxLength: 32 }); inp("Couleur", "color", p.boxColor, v => { p.boxColor = v; $("#boxColor").value = v; });
      if (id === "booster" || id === "display") sel("Finition du sachet", [["h-oil", "Film holographique"], ["h-silver", "Métallisé argent"], ["h-secret", "Holo diagonales"], ["h-cosmic", "Holo cosmos"], ["h-mosaic", "Holo mosaïque"], ["i-none", "Mat imprimé"]], p.finish, v => { p.finish = v; if ([...$("#packFinish").options].some(op => op.value === v)) $("#packFinish").value = v; });
      inp("Cartes par booster", "number", p.cards, v => { p.cards = Math.max(1, +v || 1); $("#cardsPerPack").value = p.cards; }, { min: 1, max: 60 });
      if (id === "display") inp("Boosters par display", "number", p.packs, v => { p.packs = Math.max(1, +v || 1); $("#packsPerBox").value = p.packs; }, { min: 1, max: 60 });
    }
    if (kv.children.length) el.append(kv);
    const pr = PROTECTIONS.find(x => x.id === id); const n = document.createElement("p"); n.className = "note"; n.textContent = ({ card: "La carte seule, pour juger le reflet sous tous les angles.", fan: "Choisis le nombre de cartes et la carte de chaque emplacement.", row: "Une rangée pour comparer les cartes d'une série.", stack: "La pile montre l'épaisseur réelle : 0,33 mm par carte. Les cartes étalées se règlent avec le compteur.", acryl1: "Bloc en deux plaques d'acrylique serrées par quatre vis inox. La carte est logée dans une réserve.", acryl3: "Bloc pour trois cartes, six vis inox.", frame1: "Cadre caisse avec passe-partout biseauté et verre.", frame3: "Cadre caisse avec trois boîtiers magnétiques sur fond teinté.", slab: "Boîtier scellé avec étiquette. La note et la mention sont libres." })[id] || (pr ? pr.dims : ""); if (n.textContent) el.append(n);
  }
  $("#mkFloor").addEventListener("change", e => { project.mock.floor = e.target.value; mockBuild(false); autosave(); });
  $("#mkAuto").addEventListener("click", () => { project.mock.auto = !project.mock.auto; $("#mkAuto").setAttribute("aria-pressed", String(project.mock.auto)); MK.dirty = true; });
  $("#mkShot").addEventListener("click", () => mockCapture());
  $("#mkReset").addEventListener("click", () => { if (MK.home) MK.goal = { ...MK.home }; });
  $("#mkZoomIn").addEventListener("click", () => { MK.goal = { ...(MK.goal || MK.view), dist: Math.max(40, (MK.goal || MK.view).dist / 1.3) }; }); $("#mkZoomOut").addEventListener("click", () => { MK.goal = { ...(MK.goal || MK.view), dist: Math.min(6000, (MK.goal || MK.view).dist * 1.3) }; });
  for (const b of $$("#mkViews [data-mv]")) b.addEventListener("click", () => { if (!MK.home) return; const h = MK.home; const turn = Math.round((MK.view.yaw - h.yaw) / 360) * 360; const base = { ...h, dist: MK.view.dist, tx: h.tx, ty: h.ty, tz: h.tz }; const m = b.dataset.mv; MK.goal = m === "front" ? { ...base, yaw: turn, pitch: 0 } : m === "side" ? { ...base, yaw: turn - 78, pitch: 4 } : m === "top" ? { ...base, yaw: turn, pitch: 80 } : m === "back" ? { ...base, yaw: turn + 180, pitch: 4 } : { ...base, yaw: turn + h.yaw, pitch: h.pitch }; });
  $("#mkMore").addEventListener("click", () => { const id = mkProd()[0], o = mkOpts(); if (id === "stack") o.loose = clamp((o.loose === undefined ? 2 : o.loose) + 1, 0, 3); else o.count = clamp((o.count || (id === "fan" ? 5 : 4)) + 1, 2, id === "fan" ? 9 : 7); mockBuild(false); autosave(); });
  $("#mkLess").addEventListener("click", () => { const id = mkProd()[0], o = mkOpts(); if (id === "stack") o.loose = clamp((o.loose === undefined ? 2 : o.loose) - 1, 0, 3); else o.count = clamp((o.count || (id === "fan" ? 5 : 4)) - 1, 2, id === "fan" ? 9 : 7); mockBuild(false); autosave(); });
  const mkFill = fn => { const id = mkProd()[0], n = mkSlotCount(); project.mock.assign[id] = Array.from({ length: n }, (x, i) => fn(i)); MK.texDirty = true; MK.dirty = true; if (id === "slab") mkStatic(); renderMkSlots(); renderMkPicker(); autosave(); };
  $("#mkDiff").addEventListener("click", () => { const pool = mkPool(); mkFill(i => pool[i % pool.length]); });
  $("#mkSame").addEventListener("click", () => { const ref = "c:" + curCard().id; mkFill(() => ref); });
  $("#mkShuffle").addEventListener("click", () => { const a = mkAssign().slice(0, mkSlotCount()); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } mkFill(i => a[i]); });
  (function () {
    const st = $("#mkStage"); const ptr = MK.pointers;
    const pan = (dx, dy) => { const v = MK.view; const cam = MK.r.camera(v, null); const k = v.dist * 2 * Math.tan(13 * Math.PI / 180) / Math.max(1, st.clientHeight); v.tx -= (cam.right[0] * dx - cam.up[0] * dy) * k; v.ty -= (cam.right[1] * dx - cam.up[1] * dy) * k; v.tz -= (cam.right[2] * dx - cam.up[2] * dy) * k; };
    st.addEventListener("contextmenu", e => e.preventDefault());
    st.addEventListener("pointerdown", e => {
      if (!MK.r || e.target.closest(".stage__zoom")) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); st.setPointerCapture(e.pointerId); MK.goal = null; st.classList.add("grabbing");
      if (ptr.size === 2) { const [a, b] = [...ptr.values()]; MK.pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), dist: MK.view.dist, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2 }; MK.drag = null; return; }
      MK.drag = { x: e.clientX, y: e.clientY, mode: (e.shiftKey || e.button === 2 || e.button === 1) ? "pan" : "orbit" };
    });
    st.addEventListener("pointermove", e => {
      if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); const v = MK.view;
      if (MK.pinch && ptr.size === 2) { const [a, b] = [...ptr.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); v.dist = clamp(MK.pinch.dist * MK.pinch.d / Math.max(10, d), 40, 6000); const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2; pan(cx - MK.pinch.cx, cy - MK.pinch.cy); MK.pinch.cx = cx; MK.pinch.cy = cy; MK.dirty = true; return; }
      if (!MK.drag) return; const dx = e.clientX - MK.drag.x, dy = e.clientY - MK.drag.y; MK.drag.x = e.clientX; MK.drag.y = e.clientY;
      if (MK.drag.mode === "pan") pan(dx, dy); else { v.yaw -= dx * 0.42; v.pitch = clamp(v.pitch + dy * 0.32, -86, 88); }
      MK.dirty = true;
    });
    const end = e => { ptr.delete(e.pointerId); if (ptr.size < 2) MK.pinch = null; if (!ptr.size) { MK.drag = null; st.classList.remove("grabbing"); } };
    st.addEventListener("pointerup", end); st.addEventListener("pointercancel", end);
    st.addEventListener("wheel", e => { if (!MK.r) return; e.preventDefault(); MK.goal = null; MK.view.dist = clamp(MK.view.dist * Math.exp(e.deltaY * 0.0012), 40, 6000); MK.dirty = true; }, { passive: false });
    st.addEventListener("dblclick", e => { if (e.target.closest(".stage__zoom")) return; if (MK.home) MK.goal = { ...MK.home }; });
    const cvs = $("#mkCanvas"); cvs.tabIndex = 0;
    cvs.addEventListener("keydown", e => { const v = MK.view; const k = e.key; if (k === "ArrowLeft") v.yaw += 6; else if (k === "ArrowRight") v.yaw -= 6; else if (k === "ArrowUp") v.pitch = clamp(v.pitch + 5, -86, 88); else if (k === "ArrowDown") v.pitch = clamp(v.pitch - 5, -86, 88); else if (k === "+" || k === "=") v.dist = Math.max(40, v.dist / 1.15); else if (k === "-") v.dist = Math.min(6000, v.dist * 1.15); else return; e.preventDefault(); MK.goal = null; MK.dirty = true; });
    if (window.ResizeObserver) new ResizeObserver(() => { MK.dirty = true; }).observe(st);
  })();

  /* ---- boot of the v12 parts ---- */
  ui.theme = lsGet("layrys-theme") || "auto"; for (const b of $$("[data-theme-set]")) b.setAttribute("aria-pressed", String(b.dataset.themeSet === ui.theme));
  setFont(lsGet("layrys-font") || "", true);
  window.Layrys.mock = MK; window.Layrys.mockSet = mockSet; window.Layrys.setTheme = setTheme; window.Layrys.setFont = setFont; window.Layrys.setTab = setTab;
