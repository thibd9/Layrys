  /* ================= Layrys extras: series of cards, zone editor, compare, paper proof, video, shortcuts ================= */

  /* ---- text tokens: {n} card number, {total}, {nom} card name, {serie} series title ---- */
  function resolveTokens(t, layer) {
    if (!t || t.indexOf("{") < 0) return t; const cards = project.cards || [];
    let i = cards.findIndex(c => c.front.layers.includes(layer) || c.back.layers.includes(layer)); if (i < 0) i = project.cardIndex || 0; const c = cards[i] || {};
    return t.replace(/\{n\}/g, pad3(i + 1)).replace(/\{total\}/g, pad3(cards.length)).replace(/\{nom\}/g, c.name || "").replace(/\{serie\}/g, project.title || "");
  }
  function regenTokens() { for (const c of project.cards) for (const doc of [c.front, c.back]) for (const l of doc.layers) if (l.kind === "text" && l.text.text.indexOf("{") >= 0) { regen(l); c.thumb = ""; } ui.dirty = true; }
  function addTokenText(kind) {
    const doc = curDoc(); const l = newLayer("text", kind === "serial" ? "Numéro de série" : "Nom de la carte");
    if (kind === "serial") { Object.assign(l.text, { text: "{n}/{total}", font: "JetBrains Mono", weight: "700", size: 3.4, spacing: 1, upper: false, shadow: true }); l.x = 0.5 + 0.34; l.y = 0.5 + 0.455; applyPreset(l, "i-none"); }
    else { Object.assign(l.text, { text: "{nom}", font: "Unbounded", weight: "700", size: 6, spacing: 1, upper: true, shadow: true }); l.y = 0.5 + 0.4; applyPreset(l, "f-gold"); }
    doc.layers.push(l); regen(l); ui.selDoc = doc.id; ui.selId = l.id; refreshLayers(); syncInspector(); invalidateThumbs(); ui.dirty = true; commit();
  }

  /* ---- cards of the series ---- */
  function cloneLayer(l) {
    const c = JSON.parse(JSON.stringify({ ...l, src: null, analysis: null, maskImg: null, depthImg: null, _bb: null })); c.id = uid(); c.src = l.src; c.analysis = l.analysis; c.depthImg = l.depthImg; c.version = 1; c.maskVersion = 1; c.depthVersion = 1; c.maskImg = null;
    if (l.maskImg) { const w = l.maskImg.naturalWidth || l.maskImg.width, h = l.maskImg.naturalHeight || l.maskImg.height; const [m, x] = cv(w, h); x.drawImage(l.maskImg, 0, 0); m.dataset.brush = "1"; c.maskImg = m; }
    return c;
  }
  function cloneCard(c, name) { return { id: uid(), name, thumb: "", pre: null, front: { id: "front", stock: c.front.stock, coat: c.front.coat, layers: c.front.layers.map(cloneLayer) }, back: { id: "back", stock: c.back.stock, coat: c.back.coat, layers: c.back.layers.map(cloneLayer) } }; }
  function mainLayer(card) { return card.front.layers.find(l => l.kind === "image" && l.src) || card.front.layers.find(l => l.kind === "image") || null; }
  function setCard(i) {
    if (i < 0 || i >= project.cards.length) return; project.cardIndex = i; const c = project.cards[i]; project.front = c.front; project.back = c.back;
    if (ui.face === "back") { ensureBack(); ensureBackLayer(); }
    ui.selDoc = ui.face === "back" ? "back" : "front"; const doc = project[ui.selDoc]; ui.selId = doc.layers[doc.layers.length - 1]?.id || null;
    history.stack = []; history.idx = -1; history.muted = false; setPicking(0); setBrush(false);
    refreshLayers(); syncInspector(); invalidateThumbs(); renderSeries(false); if (ui.compare) updateCmp(); if (ui.page === "plans") { renderDieline(); renderPreflight(); } if (ui.page === "maquettes") buildSupport(); ui.dirty = true; commit();
  }
  function duplicateCard(i) { const src = project.cards[i]; const c = cloneCard(src, src.name + " copie"); project.cards.splice(i + 1, 0, c); regenTokens(); setCard(i + 1); autosave(); toast("Carte dupliquée"); }
  function deleteCard(i) {
    if (project.cards.length <= 1) { toast("Une série contient au moins une carte"); return; } const c = project.cards[i];
    for (const doc of [c.front, c.back]) for (const l of doc.layers) for (const g of [R, RB, T, PK]) if (g) g.drop(l.id);
    project.cards.splice(i, 1); regenTokens(); setCard(Math.min(i, project.cards.length - 1)); autosave(); toast("Carte supprimée");
  }
  function moveCard(i, dir) { const j = i + dir; if (j < 0 || j >= project.cards.length) return; const cur = curCard(); [project.cards[i], project.cards[j]] = [project.cards[j], project.cards[i]]; project.cardIndex = project.cards.indexOf(cur); regenTokens(); renderSeries(false); autosave(); }
  function recipeOn(l, r) { const keep = ui.baseScale; applyPreset(l, r.preset); ui.baseScale = keep; l.fx.mask = r.mask; l.fx.maskInvert = 0; if (r.thr) l.fx.maskThr = r.thr; if (r.accent) { l.fx.accent = 1; l.fx.accentType = r.accent[0]; l.fx.accentMask = r.accent[1]; l.fx.accentColor = ""; } else l.fx.accent = 0; }
  var RARITIES = [
    ["Commune", "impression seule", { preset: "i-none", mask: 0 }],
    ["Peu commune", "vernis sélectif sur le sujet", { preset: "v-gloss", mask: 9 }],
    ["Rare", "holo sur le fond", { preset: "h-rainbow", mask: 7 }],
    ["Ultra rare", "holo gravé et traits argentés", { preset: "h-etched", mask: 0, accent: [1, 10] }],
    ["Secrète", "holo micro-stries et traits dorés", { preset: "h-starlight", mask: 0, accent: [0, 10] }],
  ];
  function declineRarities() {
    const src = curCard(); const base = src.name.split(" · ")[0]; const li = src.front.layers.indexOf(mainLayer(src)); if (li < 0) { toast("Ajoute d'abord une illustration à la carte"); return; }
    const made = RARITIES.map(([label, , r]) => { const c = cloneCard(src, base + " · " + label); recipeOn(c.front.layers[li], r); return c; });
    project.cards.splice(project.cardIndex + 1, 0, ...made); regenTokens(); renderSeries(true); autosave(); toast(`${made.length} raretés créées à partir de « ${base} »`);
  }
  function syncFinishes() {
    const src = curCard(); const srcImgs = src.front.layers.filter(l => l.kind === "image"); if (!srcImgs.length || project.cards.length < 2) { toast("Il faut au moins deux cartes dans la série"); return; }
    for (const c of project.cards) { if (c === src) continue; c.front.layers.filter(l => l.kind === "image").forEach((l, i) => { const s = srcImgs[Math.min(i, srcImgs.length - 1)]; const blur = l.fx.blur; const mask = s.fx.mask === 4 ? (l.maskImg ? 4 : 0) : s.fx.mask; l.fx = { ...s.fx, mask }; l.presetId = s.presetId; l.picks = s.picks.map(p => [...p]); l.pickTol = s.pickTol; l.win = [...s.win]; l.opacity = s.opacity; l.blend = s.blend; if (l.src && blur !== l.fx.blur) { l.analysis = analysisFor(l.src, l.fx.blur); l.version++; } }); c.thumb = ""; c.pre = null; }
    renderSeries(true); autosave(); toast(`Finitions de « ${src.name} » appliquées à ${project.cards.length - 1} carte(s)`);
  }
  function newCard() {
    const src = curCard(); const used = new Set(project.cards.flatMap(c => c.front.layers.map(l => l.assetId).filter(Boolean))); const art = ART_LIBRARY.find(a => !used.has(a.id)) || ART_LIBRARY[project.cards.length % ART_LIBRARY.length];
    const c = cloneCard(src, "Carte " + (project.cards.length + 1)); let l = mainLayer(c);
    loadArt(art).then(im => {
      if (!l) { l = newLayer("image", art.name); applyPreset(l, "h-rainbow"); c.front.layers.push(l); }
      setSrc(l, im); l.assetId = art.id; l.name = art.name; fitLayer(l, "cover"); if (l.fx.mask === 4) { const cat = (PRESET_BY_ID[l.presetId] || {}).cat; l.fx.mask = (cat === "foil" || cat === "varnish" || cat === "emboss") ? 10 : 0; l.maskImg = null; }
      project.cards.push(c); regenTokens(); setCard(project.cards.length - 1); autosave(); toast("Nouvelle carte : " + art.name + ". Change son illustration dans l'atelier.");
    }).catch(() => toast("Illustration indisponible"));
  }
  function cardsFromFiles(files) {
    const list = [...files].filter(f => f.type.startsWith("image/")); if (!list.length) return; const tpl = curCard(); let left = list.length;
    list.forEach(f => loadFile(f, (im, name) => {
      const nm = name.replace(/\.[^.]+$/, "").slice(0, 32); const c = cloneCard(tpl, nm); let l = mainLayer(c); if (!l) { l = newLayer("image", nm); applyPreset(l, "h-rainbow"); c.front.layers.push(l); }
      setSrc(l, im); delete l.assetId; l.name = nm; fitLayer(l, "cover"); if (l.fx.mask === 4) { const cat = (PRESET_BY_ID[l.presetId] || {}).cat; l.fx.mask = (cat === "foil" || cat === "varnish" || cat === "emboss") ? 10 : 0; l.maskImg = null; }
      project.cards.push(c); if (--left === 0) { regenTokens(); renderSeries(true); autosave(); toast(`${list.length} carte(s) ajoutée(s) avec le traitement de « ${tpl.name} »`); }
    }));
  }
  function finishSummary(c) {
    const names = []; for (const l of c.front.layers) { if (!l.visible) continue; const p = PRESET_BY_ID[l.presetId]; if (p && p.id !== "i-none" && !names.includes(p.label)) names.push(p.label); if (l.fx.accent) { const a = ACCENTS.find(a => a.type === l.fx.accentType); if (a && !names.includes(a.label)) names.push(a.label); } }
    return names.length ? names.join(" + ") : "Impression seule";
  }
  function updateCardNav() { const n = project.cards.length, i = project.cardIndex; $("#cardNavName").textContent = n > 1 ? `Carte ${i + 1}/${n} · ${curCard().name}` : curCard().name; $("#cardPrev").disabled = i <= 0; $("#cardNext").disabled = i >= n - 1; }
  function syncBacks() { for (const c of project.cards) { if (c.back === project.back) continue; for (const l of c.back.layers) if (l.kind === "back") regen(l); c.thumb = ""; } }
  function renderSeries(full) {
    updateCardNav(); if (ui.page !== "serie") return;
    const el = $("#contact"); el.innerHTML = ""; const n = project.cards.length; $("#serieCount").textContent = `· ${n} carte${n > 1 ? "s" : ""}`;
    if (document.activeElement !== $("#serieTitle")) $("#serieTitle").value = project.title; if (document.activeElement !== $("#cardName")) $("#cardName").value = curCard().name;
    project.cards.forEach((c, i) => {
      if (T && (full || !c.thumb)) c.thumb = snapshotDoc(c.front, 320, [0.35, 0.3], [0, 0]);
      if (full || c.pre == null) { try { c.pre = swapCard(c, () => preflightItems(true).filter(it => it.level === "warn").length); } catch (e) { c.pre = 0; } }
      const item = document.createElement("div"); item.className = "ccard"; item.setAttribute("aria-selected", String(i === project.cardIndex));
      const b = document.createElement("button"); b.type = "button"; b.className = "ccard__img"; b.title = "Sélectionner · double-clic pour ouvrir dans l'atelier";
      const im = document.createElement("img"); im.alt = c.name; if (c.thumb) im.src = c.thumb; const num = document.createElement("span"); num.className = "ccard__num"; num.textContent = pad3(i + 1);
      const pre = document.createElement("span"); pre.className = "ccard__pre " + (c.pre ? "warn" : "ok"); pre.title = c.pre ? `${c.pre} point(s) à vérifier avant impression` : "Prête pour l'impression";
      b.append(im, num, pre); b.addEventListener("click", () => { if (i !== project.cardIndex) setCard(i); }); b.addEventListener("dblclick", () => { if (i !== project.cardIndex) setCard(i); setPage("atelier"); });
      const meta = document.createElement("div"); meta.className = "ccard__meta"; const nb = document.createElement("b"); nb.textContent = c.name; const ns = document.createElement("span"); ns.textContent = finishSummary(c); meta.append(nb, ns);
      const acts = document.createElement("div"); acts.className = "ccard__acts"; const mk = (t, title, fn) => { const bt = document.createElement("button"); bt.type = "button"; bt.textContent = t; bt.title = title; bt.setAttribute("aria-label", title); bt.addEventListener("click", fn); return bt; };
      acts.append(mk("◀", "Avancer dans la série", () => moveCard(i, -1)), mk("▶", "Reculer dans la série", () => moveCard(i, 1)), mk("⧉", "Dupliquer", () => duplicateCard(i)), mk("✎", "Ouvrir dans l'atelier", () => { if (i !== project.cardIndex) setCard(i); setPage("atelier"); }), mk("✕", "Supprimer", () => deleteCard(i)));
      item.append(b, meta, acts); el.append(item);
    });
    const add = document.createElement("div"); add.className = "ccard add"; const ab = document.createElement("button"); ab.type = "button"; ab.className = "ccard__img"; ab.textContent = "+ Nouvelle carte"; ab.addEventListener("click", newCard); add.append(ab); el.append(add);
    renderImposition();
  }
  function renderImposition() {
    const d = fmtDims(); const o = project.impose; const L = imposeLayout(o.sheet, d.w, d.h, project.print.bleed); const count = (o.what === "card" ? 1 : project.cards.length) * Math.max(1, o.copies); const sheetsN = L.per ? Math.ceil(count / L.per) : 0;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.pw} ${L.ph}" width="${L.pw > L.ph ? 300 : 210}" role="img" aria-label="Aperçu de la planche"><rect width="${L.pw}" height="${L.ph}" fill="#fff" stroke="#cfc9bb"/>`;
    for (let k = 0; k < L.per; k++) { const col = k % L.cols, row = Math.floor(k / L.cols); const x = L.x0 + col * L.cw, y = L.y0 + row * L.ch; const on = k < count; svg += `<rect x="${x}" y="${y}" width="${L.cw}" height="${L.ch}" fill="${on ? "#ffe3c4" : "#f3f1ea"}"/><rect x="${x + L.b}" y="${y + L.b}" width="${L.w}" height="${L.h}" rx="${d.r}" fill="${on ? "#f47a1a" : "#e2ded3"}"/>`; if (on) svg += `<text x="${x + L.cw / 2}" y="${y + L.ch / 2 + 4}" font-size="11" font-family="Inter, sans-serif" font-weight="700" text-anchor="middle" fill="#241300">${o.what === "card" ? pad3(project.cardIndex + 1) : pad3(Math.floor(k / Math.max(1, o.copies)) % project.cards.length + 1)}</text>`; }
    for (const [x1, y1, x2, y2] of cropLines(L)) svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1c1a16" stroke-width="0.5"/>`;
    $("#impPreview").innerHTML = svg + "</svg>";
    $("#impNote").textContent = L.per ? `${L.cols} × ${L.rows} = ${L.per} cartes par feuille ${L.pw > L.ph ? "(paysage)" : "(portrait)"} · ${count} carte${count > 1 ? "s" : ""} à monter · ${sheetsN} feuille${sheetsN > 1 ? "s" : ""}${o.back ? " recto verso" : ""}. Traits de coupe sur chaque ligne de coupe, gouttière de ${2 * L.b} mm entre les cartes.` : "La carte est trop grande pour cette feuille : choisis un format de feuille plus grand.";
  }
  function fabricationSteps() {
    const steps = []; const front = project.front, back = project.back; const hasBack = back.layers.some(l => l.visible && l.src); steps.push("Impression quadri CMJN " + (hasBack ? "recto verso" : "recto"));
    const procs = new Set([...procsOf(front), ...(hasBack ? procsOf(back) : [])]);
    if (procs.has("holo")) steps.push("Support ou film holographique, avec blanc de soutien sélectif sous les zones mates");
    if (procs.has("ink")) steps.push("Encre spéciale : un groupe d'impression supplémentaire");
    if (procs.has("foil")) { const tints = new Set(); for (const doc of [front, back]) for (const l of doc.layers) { if (!l.visible) continue; const p = PRESET_BY_ID[l.presetId]; if (p && p.cat === "foil") tints.add(p.label.replace(/^Dorure /, "")); if (l.fx.accent && ACCENT_PROCESS(l.fx.accentType) === "foil") { const a = ACCENTS.find(a => a.type === l.fx.accentType); if (a) tints.add(a.label.toLowerCase()); } } steps.push(`Dorure à chaud : ${tints.size} film${tints.size > 1 ? "s" : ""} (${[...tints].join(", ")}), un cliché par film`); }
    if (procs.has("emboss")) steps.push("Embossage : une forme et sa contre-forme");
    if (procs.has("varnish")) steps.push("Vernis sélectif : un écran de sérigraphie");
    steps.push("Laminage " + ({ gloss: "brillant", satin: "satiné", matte: "mat", none: "aucun" })[project.coatKind]); const d = fmtDims(); steps.push(`Découpe à la forme, angles r ${d.r} mm` + (project.edge ? ", puis teinte de tranche" : ""));
    return steps;
  }

  /* ---- preflight helpers ---- */
  /* share of a process plate that is thinner than 0.3 mm: binary opening with a 3 px square at 10 px/mm */
  function thinRatio(doc, prc) {
    const d = fmtDims(); const m = processMaskCanvas(doc, prc, d.w, d.h, 0, 254); if (!m) return null; const w = m.width, h = m.height; const px = m.getContext("2d").getImageData(0, 0, w, h).data; const n = w * h; const a = new Uint8Array(n); let total = 0;
    for (let i = 0; i < n; i++) if (px[i * 4] > 127) { a[i] = 1; total++; } if (total < 60) return null;
    const er = new Uint8Array(n); for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (a[i] && a[i - 1] && a[i + 1] && a[i - w] && a[i + w] && a[i - w - 1] && a[i - w + 1] && a[i + w - 1] && a[i + w + 1]) er[i] = 1; }
    let kept = 0; for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (a[i] && (er[i] || er[i - 1] || er[i + 1] || er[i - w] || er[i + w] || er[i - w - 1] || er[i - w + 1] || er[i + w - 1] || er[i + w + 1])) kept++; }
    return 1 - kept / total;
  }
  function alphaBox(l) {
    if (l._bb && l._bb.v === l.version) return l._bb.box; const w = 250, h = Math.max(8, Math.round(250 * l.h / l.w)); const [c, x] = cv(w, h); x.drawImage(l.src, 0, 0, w, h); const px = x.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if (px[(y * w + xx) * 4 + 3] > 40) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const box = x1 < 0 ? null : [x0 / w, y0 / h, (x1 + 1) / w, (y1 + 1) / h]; l._bb = { v: l.version, box }; return box;
  }
  function preflightItems(quick) {
    const d = fmtDims(); const b = project.print.bleed, safe = project.print.safe; const items = []; const add = (level, text) => items.push({ level, text });
    for (const [face, doc] of [["Recto", project.front], ["Verso", project.back]]) {
      const imgs = doc.layers.filter(l => l.kind === "image" && l.visible && l.src);
      if (!imgs.length) add(face === "Recto" ? "warn" : "ok", `${face} : ${face === "Recto" ? "aucune illustration importée" : "pas d'image, motif généré"}`);
      for (const l of imgs) {
        const wmm = l.scale * d.w; const dpi = l.w / (wmm / 25.4); add(dpi >= 300 ? "ok" : "warn", `${face} · « ${l.name} » : ${Math.round(dpi)} dpi à l'impression (${l.w} × ${l.h} px)` + (dpi >= 300 ? "" : ". Vise 300 dpi ou plus"));
        const hmm = wmm * l.h / l.w; const covers = wmm >= d.w + 2 * b - 0.01 && hmm >= d.h + 2 * b - 0.01 && Math.abs(l.x - 0.5) * d.w <= (wmm - d.w - 2 * b) / 2 + 0.01 && Math.abs(l.y - 0.5) * d.h <= (hmm - d.h - 2 * b) / 2 + 0.01; if (l === imgs[0]) add(covers ? "ok" : "warn", covers ? `${face} · le visuel couvre le fond perdu de ${b} mm` : `${face} · le visuel ne couvre pas le fond perdu (${b} mm) : agrandis-le dans « Recadrer »`);
        if (l.analysis && l.analysis.data) { const px = l.analysis.data; let hot = 0, tot = 0; for (let i = 0; i < px.length; i += 16) { const mx = Math.max(px[i], px[i + 1], px[i + 2]), mn = Math.min(px[i], px[i + 1], px[i + 2]); tot++; if (mx > 232 && (mx - mn) / mx > 0.88) hot++; } const r = hot / Math.max(1, tot); if (r > 0.06) add("warn", `${face} · « ${l.name} » : ${Math.round(r * 100)} % de couleurs très saturées, plus ternes une fois imprimées en CMJN. Vérifie avec « Épreuve papier »`); }
      }
      for (const l of doc.layers) {
        if (!l.visible) { add("info", `${face} · calque « ${l.name} » masqué : il ne sera pas exporté`); continue; }
        if ((l.kind === "text" || l.kind === "badge") && l.src && !l.rot) { const bb = alphaBox(l); if (bb) { const x0 = l.x + (bb[0] - 0.5) * l.scale, x1 = l.x + (bb[2] - 0.5) * l.scale, y0 = l.y + (bb[1] - 0.5) * l.scale, y1 = l.y + (bb[3] - 0.5) * l.scale; const sx = safe / d.w, sy = safe / d.h; const inside = x0 >= sx && x1 <= 1 - sx && y0 >= sy && y1 <= 1 - sy; add(inside ? "ok" : "warn", inside ? `${face} · « ${l.name} » est dans la zone de sécurité` : `${face} · « ${l.name} » dépasse la zone de sécurité de ${safe} mm : il risque d'être coupé`); } }
      }
      if (T) for (const prc of procsOf(doc)) { if (prc !== "foil" && prc !== "varnish" && prc !== "emboss") continue; let r = null; try { r = thinRatio(doc, prc); } catch (e) { r = null; } if (r == null) continue; const nm = { foil: "dorure", varnish: "vernis", emboss: "embossage" }[prc]; add(r > 0.25 ? "warn" : "ok", r > 0.25 ? `${face} · ${nm} : ${Math.round(r * 100)} % de la zone est plus fine que 0,3 mm et risque de mal marquer. Épaissis-la dans l'éditeur de zone (Dilater)` : `${face} · ${nm} : traits d'au moins 0,3 mm`); }
    }
    if (!quick) { add(safe >= 2 ? "ok" : "warn", `Sécurité ${safe} mm` + (safe >= 2 ? "" : " : 3 mm recommandés")); add(b >= 2 ? "ok" : "warn", `Fond perdu ${b} mm` + (b >= 2 ? "" : " : 3 mm recommandés")); }
    return items;
  }

  /* ---- before / after slider ---- */
  function updateCmp() {
    card.classList.toggle("comparing", !!ui.compare); $("#cmpBtn").setAttribute("aria-pressed", String(!!ui.compare)); const selEl = $("#cmpWith"); selEl.hidden = !ui.compare; if (!ui.compare || !T) return;
    const opts = [["art", "Sans finition"]].concat(project.cards.filter(c => c !== curCard()).map(c => ["card:" + c.id, "Carte : " + c.name])); if (!opts.some(o => o[0] === ui.cmpWith)) ui.cmpWith = "art";
    selEl.innerHTML = ""; for (const [v, t] of opts) { const o = document.createElement("option"); o.value = v; o.textContent = t; selEl.append(o); } selEl.value = ui.cmpWith;
    const back = ui.face === "back"; const px = Math.max(300, Math.min(1400, Math.round(card.clientWidth * Math.min(window.devicePixelRatio || 1, 2)))); const a = aspect(); let url, label;
    if (ui.cmpWith === "art") { thumbCanvas.width = px; thumbCanvas.height = Math.round(px / a); T.renderDoc(curDoc(), { pointer: [0.5, 0.5], tilt: [0, 0], aspect: a, intensity: 1, seed: ui.seed, selectedId: null, view: 1, viewAll: true, proof: ui.proof }); url = thumbCanvas.toDataURL("image/jpeg", 0.92); label = "Sans finition"; }
    else { const c = project.cards.find(c => "card:" + c.id === ui.cmpWith); url = snapshotDoc(back ? c.back : c.front, px, [0.35, 0.3], [0, 0], { proof: ui.proof }); label = c.name; }
    $(back ? "#cmpBack" : "#cmpFront").src = url; $("#cmpTagL").textContent = label; $("#cmpTagR").textContent = ui.cmpWith === "art" ? "Avec finition" : curCard().name;
  }
  function toggleCompare() { ui.compare = !ui.compare; if (ui.compare && !card.style.getPropertyValue("--cmp")) card.style.setProperty("--cmp", "50%"); updateCmp(); }
  function toggleProof() { ui.proof = !ui.proof; bench.classList.toggle("proofing", ui.proof); $("#proofBtn").setAttribute("aria-pressed", String(ui.proof)); if (ui.compare) updateCmp(); ui.dirty = true; if (ui.proof) toast("Épreuve papier : couleurs CMJN simulées sur l'image imprimée, les reflets restent ceux des finitions"); }
  (function () {
    const h = $("#cmpHandle"); let drag = false; const setPos = x => { const r = card.getBoundingClientRect(); card.style.setProperty("--cmp", clamp((x - r.left) / r.width * 100, 2, 98).toFixed(1) + "%"); };
    h.addEventListener("pointerdown", e => { e.stopPropagation(); e.preventDefault(); drag = true; h.setPointerCapture(e.pointerId); setPos(e.clientX); });
    h.addEventListener("pointermove", e => { if (drag) { e.stopPropagation(); setPos(e.clientX); } });
    const end = e => { if (drag) { drag = false; e.stopPropagation(); } }; h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end);
    h.addEventListener("keydown", e => { if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault(); e.stopPropagation(); const cur = parseFloat(card.style.getPropertyValue("--cmp")) || 50; card.style.setProperty("--cmp", clamp(cur + (e.key === "ArrowLeft" ? -4 : 4), 2, 98) + "%"); });
    $("#cmpBtn").addEventListener("click", toggleCompare); $("#cmpWith").addEventListener("change", e => { ui.cmpWith = e.target.value; updateCmp(); }); $("#proofBtn").addEventListener("click", toggleProof);
  })();

  /* ---- hook called after every committed change ---- */
  var commitTimer = null;
  function onCommit() { clearTimeout(commitTimer); commitTimer = setTimeout(() => { const c = curCard(); if (c) { c.thumb = ""; c.pre = null; } if (ui.compare) updateCmp(); if (ui.page === "serie") renderSeries(false); if (ui.page === "plans") renderPreflight(); }, 300); }

  /* ================= zone editor (full screen) ================= */
  var ME = { layer: null, w: 0, h: 0, mask: null, mx: null, px: null, tool: "brush", mode: "add", size: 44, hard: 0.85, tol: 0.18, contig: true, view: "over", undo: [], drawing: false, last: null, rect0: null, zoom: 1 };
  function meAlpha() { const d = ME.mx.getImageData(0, 0, ME.w, ME.h).data; const a = new Uint8ClampedArray(ME.w * ME.h); for (let i = 0, j = 3; i < a.length; i++, j += 4) a[i] = d[j]; return a; }
  function mePut(a) { const im = ME.mx.createImageData(ME.w, ME.h); const d = im.data; for (let i = 0, j = 0; i < a.length; i++, j += 4) { d[j] = d[j + 1] = d[j + 2] = 255; d[j + 3] = a[i]; } ME.mx.putImageData(im, 0, 0); }
  function mePush() { ME.undo.push(meAlpha()); if (ME.undo.length > 12) ME.undo.shift(); }
  function meUndo() { const a = ME.undo.pop(); if (a) { mePut(a); meRender(); meStats(); } else toast("Rien à annuler"); }
  function meRender() {
    const x = $("#meOv").getContext("2d"); x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, ME.w, ME.h); if (ME.view === "img") return;
    if (ME.view === "mask") { x.fillStyle = "#000"; x.fillRect(0, 0, ME.w, ME.h); x.drawImage(ME.mask, 0, 0); return; }
    x.drawImage(ME.mask, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = "#ff7a1a"; x.fillRect(0, 0, ME.w, ME.h); x.globalCompositeOperation = "source-over";
  }
  function meStats() { const a = meAlpha(); let s = 0; for (let i = 0; i < a.length; i += 4) s += a[i]; const pct = s / 255 / (a.length / 4) * 100; $("#meInfo").textContent = `Zone : ${pct < 10 ? pct.toFixed(1).replace(".", ",") : Math.round(pct)} % de l'illustration. Orange = finition appliquée.`; }
  function meFit() { const st = $("#meStage"); const aw = Math.max(120, st.clientWidth - 40), ah = Math.max(120, st.clientHeight - 40); const k = Math.min(aw / ME.w, ah / ME.h) * ME.zoom; const wrap = $("#meWrap"); wrap.style.width = Math.round(ME.w * k) + "px"; wrap.style.height = Math.round(ME.h * k) + "px"; }
  function meFromLum(source) { const [c, x] = cv(ME.w, ME.h); x.fillStyle = "#000"; x.fillRect(0, 0, ME.w, ME.h); x.drawImage(source, 0, 0, ME.w, ME.h); const z = x.getImageData(0, 0, ME.w, ME.h).data; const a = new Uint8ClampedArray(ME.w * ME.h); for (let i = 0, j = 0; i < a.length; i++, j += 4) a[i] = z[j]; return a; }
  function meZoneAlpha(mode, invert) {
    const l = ME.layer; const la = l.w / l.h; thumbCanvas.width = ME.w; thumbCanvas.height = ME.h; const temp = { ...l, x: 0.5, y: 0.5, scale: 1, rot: 0, opacity: 1, blend: "normal", visible: true, fx: { ...l.fx, mask: mode, maskInvert: invert ? 1 : 0, accent: 0 } };
    T.renderDoc({ stock: "#000000", layers: [temp], coat: 0 }, { pointer: [0.5, 0.5], tilt: [0, 0], aspect: la, intensity: 1, seed: ui.seed, selectedId: null, view: 9, viewAll: true, clearColor: [0, 0, 0], noCoat: true });
    return meFromLum(thumbCanvas);
  }
  function meZone(mode) { if (!T) return; mePush(); const z = meZoneAlpha(mode, 0); const a = meAlpha(); const add = ME.mode === "add"; for (let i = 0; i < a.length; i++) a[i] = add ? Math.max(a[i], z[i]) : Math.min(a[i], 255 - z[i]); mePut(a); meRender(); meStats(); }
  function meStamp(x, y) {
    const r = ME.size / 2; const g = ME.mx; g.globalCompositeOperation = ME.mode === "add" ? "source-over" : "destination-out";
    if (ME.hard >= 0.98) g.fillStyle = "#fff"; else { const gr = g.createRadialGradient(x, y, r * ME.hard, x, y, r); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; }
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); g.globalCompositeOperation = "source-over";
  }
  function meLine(a, b) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]); const n = Math.max(1, Math.ceil(d / Math.max(1, ME.size / 6))); for (let i = 1; i <= n; i++) meStamp(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n); }
  function meWand(x0, y0) {
    const w = ME.w, h = ME.h, px = ME.px; x0 = Math.floor(x0); y0 = Math.floor(y0); if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return; mePush();
    const i0 = (y0 * w + x0) * 4; const r0 = px[i0], g0 = px[i0 + 1], b0 = px[i0 + 2], a0 = px[i0 + 3]; const tol = ME.tol * 255 * 1.2; const tol2 = tol * tol * 3;
    const match = i => { const j = i * 4; const dr = px[j] - r0, dg = px[j + 1] - g0, db = px[j + 2] - b0, da = px[j + 3] - a0; return dr * dr + dg * dg + db * db + da * da <= tol2; };
    const a = meAlpha(); const val = ME.mode === "add" ? 255 : 0;
    if (!ME.contig) { for (let i = 0; i < w * h; i++) if (match(i)) a[i] = val; }
    else { const seen = new Uint8Array(w * h); const stack = new Int32Array(w * h); let sp = 0; stack[sp++] = y0 * w + x0; seen[y0 * w + x0] = 1;
      while (sp) { const i = stack[--sp]; a[i] = val; const x = i % w, y = (i - x) / w;
        if (x > 0 && !seen[i - 1] && match(i - 1)) { seen[i - 1] = 1; stack[sp++] = i - 1; } if (x < w - 1 && !seen[i + 1] && match(i + 1)) { seen[i + 1] = 1; stack[sp++] = i + 1; }
        if (y > 0 && !seen[i - w] && match(i - w)) { seen[i - w] = 1; stack[sp++] = i - w; } if (y < h - 1 && !seen[i + w] && match(i + w)) { seen[i + w] = 1; stack[sp++] = i + w; } } }
    mePut(a); meRender(); meStats();
  }
  function boxBlurU8(a, w, h, r) {
    const t = new Float32Array(a.length), o = new Uint8ClampedArray(a.length); const n = 2 * r + 1;
    for (let y = 0; y < h; y++) { let s = 0; const row = y * w; for (let x = -r; x <= r; x++) s += a[row + Math.min(w - 1, Math.max(0, x))]; for (let x = 0; x < w; x++) { t[row + x] = s / n; s += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)]; } }
    for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += t[Math.min(h - 1, Math.max(0, y)) * w + x]; for (let y = 0; y < h; y++) { o[y * w + x] = s / n; s += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x]; } }
    return o;
  }
  function meMorph(kind) {
    mePush(); const w = ME.w, h = ME.h; let a = meAlpha(); const r = 3;
    if (kind === "soft") a = boxBlurU8(a, w, h, r);
    else if (kind === "invert") { for (let i = 0; i < a.length; i++) a[i] = 255 - a[i]; }
    else if (kind === "fill") a.fill(255); else if (kind === "clear") a.fill(0);
    else { const grow = kind === "grow"; const t = new Uint8ClampedArray(a.length);
      for (let y = 0; y < h; y++) { const o = y * w; for (let x = 0; x < w; x++) { let v = a[o + x]; const k1 = Math.min(w - 1, x + r); for (let k = Math.max(0, x - r); k <= k1; k++) { const q = a[o + k]; if (grow ? q > v : q < v) v = q; } t[o + x] = v; } }
      for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) { let v = t[y * w + x]; const k1 = Math.min(h - 1, y + r); for (let k = Math.max(0, y - r); k <= k1; k++) { const q = t[k * w + x]; if (grow ? q > v : q < v) v = q; } a[y * w + x] = v; } }
    mePut(a); meRender(); meStats();
  }
  function openMaskEditor() {
    const l = sel(); if (!l || !l.src) { toast("Importe d'abord une illustration"); return; } if (!T) { toast("WebGL indisponible"); return; }
    setBrush(false); setPicking(0); closeMenus(); ME.layer = l; ME.w = 1024; ME.h = Math.max(16, Math.round(1024 * l.h / l.w)); ME.undo = []; ME.zoom = 1; $("#meZoom").value = 100; $("#o-meZoom").value = "100%";
    const imgC = $("#meImg"), ov = $("#meOv"); imgC.width = ov.width = ME.w; imgC.height = ov.height = ME.h; const ix = imgC.getContext("2d", { willReadFrequently: true }); ix.clearRect(0, 0, ME.w, ME.h); ix.drawImage(l.src, 0, 0, ME.w, ME.h); ME.px = ix.getImageData(0, 0, ME.w, ME.h).data;
    const [m, mx] = cv(ME.w, ME.h); ME.mask = m; ME.mx = mx;
    if (l.fx.mask === 4 && l.maskImg) mePut(meFromLum(l.maskImg)); else if (l.fx.mask !== 0 && l.fx.mask !== 4) mePut(meZoneAlpha(l.fx.mask, l.fx.maskInvert));
    const p = PRESET_BY_ID[l.presetId]; $("#meTitle").textContent = `${l.name} · ${p ? p.label : ""}`; $("#maskEditor").hidden = false; document.documentElement.style.overflow = "hidden"; meFit(); meRender(); meStats();
  }
  function closeMaskEditor() { $("#maskEditor").hidden = true; document.documentElement.style.overflow = ""; ME.layer = null; ME.undo = []; ME.px = null; }
  function applyMaskEditor() {
    const l = ME.layer; if (!l) return; const [c, x] = cv(ME.w, ME.h); x.fillStyle = "#000"; x.fillRect(0, 0, ME.w, ME.h); x.drawImage(ME.mask, 0, 0); c.dataset.brush = "1";
    l.maskImg = c; l.maskVersion++; l.fx.mask = 4; l.fx.maskInvert = 0; closeMaskEditor(); syncInspector(); refreshLayers(); invalidateThumbs(); ui.dirty = true; commit(); toast("Zone appliquée au calque");
  }
  (function () {
    const wrap = $("#meWrap"), cur = $("#meCursor"), rectEl = $("#meRect");
    const pos = e => { const r = wrap.getBoundingClientRect(); return [(e.clientX - r.left) * ME.w / r.width, (e.clientY - r.top) * ME.h / r.height, r]; };
    wrap.addEventListener("pointerdown", e => { if (!ME.layer) return; e.preventDefault(); const [x, y] = pos(e); if (ME.tool === "wand") { meWand(x, y); return; } mePush(); ME.drawing = true; wrap.setPointerCapture(e.pointerId); if (ME.tool === "brush") { meStamp(x, y); ME.last = [x, y]; meRender(); } else ME.rect0 = [x, y]; });
    wrap.addEventListener("pointermove", e => {
      if (!ME.layer) return; const [x, y, r] = pos(e); const k = r.width / ME.w; cur.style.left = (e.clientX - r.left) + "px"; cur.style.top = (e.clientY - r.top) + "px"; const dsz = ME.tool === "brush" ? Math.max(4, ME.size * k) : 12; cur.style.width = cur.style.height = dsz + "px"; cur.hidden = false;
      if (!ME.drawing) return;
      if (ME.tool === "brush") { meLine(ME.last, [x, y]); ME.last = [x, y]; meRender(); }
      else if (ME.rect0) { rectEl.hidden = false; rectEl.style.left = Math.min(ME.rect0[0], x) * k + "px"; rectEl.style.top = Math.min(ME.rect0[1], y) * k + "px"; rectEl.style.width = Math.abs(x - ME.rect0[0]) * k + "px"; rectEl.style.height = Math.abs(y - ME.rect0[1]) * k + "px"; }
    });
    const end = e => { if (!ME.drawing) return; ME.drawing = false; if (ME.tool === "rect" && ME.rect0) { const [x, y] = pos(e); const rx = Math.min(ME.rect0[0], x), ry = Math.min(ME.rect0[1], y), rw = Math.abs(x - ME.rect0[0]), rh = Math.abs(y - ME.rect0[1]); if (ME.mode === "add") { ME.mx.fillStyle = "#fff"; ME.mx.fillRect(rx, ry, rw, rh); } else ME.mx.clearRect(rx, ry, rw, rh); rectEl.hidden = true; ME.rect0 = null; meRender(); } meStats(); };
    wrap.addEventListener("pointerup", end); wrap.addEventListener("pointercancel", end); wrap.addEventListener("pointerleave", () => { cur.hidden = true; });
    const setTool = t => { ME.tool = t; for (const b of $$("#meTools [data-tool]")) b.setAttribute("aria-pressed", String(b.dataset.tool === t)); };
    const setMode = m => { ME.mode = m; for (const b of $$("#meMode [data-mode]")) b.setAttribute("aria-pressed", String(b.dataset.mode === m)); };
    const setView = v => { ME.view = v; for (const b of $$("#meView [data-v]")) b.setAttribute("aria-pressed", String(b.dataset.v === v)); wrap.classList.toggle("v-mask", v === "mask"); wrap.classList.toggle("v-img", v === "img"); meRender(); };
    for (const b of $$("#meTools [data-tool]")) b.addEventListener("click", () => setTool(b.dataset.tool));
    for (const b of $$("#meMode [data-mode]")) b.addEventListener("click", () => setMode(b.dataset.mode));
    for (const b of $$("#meView [data-v]")) b.addEventListener("click", () => setView(b.dataset.v));
    for (const b of $$("#meZones [data-zone]")) b.addEventListener("click", () => meZone(+b.dataset.zone));
    for (const [id, kind] of [["meGrow", "grow"], ["meShrink", "shrink"], ["meSoft", "soft"], ["meInvert", "invert"], ["meFill", "fill"], ["meClear", "clear"]]) $("#" + id).addEventListener("click", () => meMorph(kind));
    $("#meSize").addEventListener("input", e => { ME.size = +e.target.value; $("#o-meSize").value = e.target.value + " px"; });
    $("#meHard").addEventListener("input", e => { ME.hard = e.target.value / 100; $("#o-meHard").value = e.target.value + "%"; });
    $("#meTol").addEventListener("input", e => { ME.tol = e.target.value / 100; $("#o-meTol").value = e.target.value + "%"; });
    $("#meZoom").addEventListener("input", e => { ME.zoom = e.target.value / 100; $("#o-meZoom").value = e.target.value + "%"; meFit(); });
    $("#meContig").addEventListener("change", e => { ME.contig = e.target.checked; });
    $("#meUndo").addEventListener("click", meUndo); $("#meCancel").addEventListener("click", closeMaskEditor); $("#meApply").addEventListener("click", applyMaskEditor); $("#meOpen").addEventListener("click", openMaskEditor); $("#meOpen2").addEventListener("click", openMaskEditor);
    $("#meFile").addEventListener("change", e => { loadFile(e.target.files[0], im => { mePush(); mePut(meFromLum(im)); meRender(); meStats(); }); e.target.value = ""; });
    window.addEventListener("resize", () => { if (ME.layer) meFit(); });
    document.addEventListener("keydown", e => {
      if (!ME.layer) return; const tag = (document.activeElement && document.activeElement.tagName) || ""; if (/input|textarea|select/i.test(tag) && e.key !== "Escape") return; const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); meUndo(); return; } if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (k === "escape") closeMaskEditor(); else if (k === "b") setTool("brush"); else if (k === "w") setTool("wand"); else if (k === "r") setTool("rect"); else if (k === "x") setMode(ME.mode === "add" ? "sub" : "add");
      else if (k === "[" || k === "]") { ME.size = clamp(ME.size + (k === "[" ? -8 : 8), 4, 240); $("#meSize").value = ME.size; $("#o-meSize").value = ME.size + " px"; } else return; e.preventDefault();
    });
  })();

  /* ================= presentation video: the card rocks, spins once and settles (WebM) ================= */
  function drawTurn(x, W, H, pw, ph, yaw, tmp, name) {
    const g = x.createRadialGradient(W / 2, H * 0.38, 40, W / 2, H * 0.5, H * 0.75); g.addColorStop(0, "#2c241b"); g.addColorStop(1, "#0d0b09"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const cos = Math.cos(yaw), sin = Math.sin(yaw); const cx = W / 2, cy = H / 2 - 30; const d = 3.4 * pw;
    x.save(); x.translate(cx, cy + ph / 2 + 46); x.scale(Math.max(0.12, Math.abs(cos)) * pw * 0.62, 26); const sg = x.createRadialGradient(0, 0, 0, 0, 0, 1); sg.addColorStop(0, "rgba(0,0,0,.55)"); sg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = sg; x.fillRect(-1, -1, 2, 2); x.restore();
    const N = 110; const X = s => { const z = s * pw * sin; const p = d / (d + z); return [cx + s * pw * cos * p, p]; };
    for (let i = 0; i < N; i++) { const s0 = i / N - 0.5, s1 = (i + 1) / N - 0.5; const [xa, pa] = X(s0), [xb, pb] = X(s1); const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb); const hh = ph * (pa + pb) / 2; const u0 = cos >= 0 ? s0 + 0.5 : 0.5 - s1, u1 = cos >= 0 ? s1 + 0.5 : 0.5 - s0; x.drawImage(tmp, u0 * tmp.width, 0, Math.max(1, (u1 - u0) * tmp.width), tmp.height, x0, cy - hh / 2, x1 - x0 + 0.7, hh); }
    if (Math.abs(cos) < 0.05) { x.fillStyle = "#d8d2c2"; x.fillRect(cx - 1.2, cy - ph / 2, 2.4, ph); }
    x.fillStyle = "rgba(255,255,255,.55)"; x.font = "600 22px Inter, Helvetica, Arial, sans-serif"; x.textAlign = "center"; x.fillText("LAYRYS  ·  " + name, W / 2, H - 44); x.textAlign = "left";
  }
  async function exportVideo() {
    if (!R || typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) { toast("L'enregistrement vidéo n'est pas disponible dans ce navigateur"); return; }
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }); if (!mime) { toast("Aucun format vidéo pris en charge par ce navigateur"); return; }
    const W = 1080, H = 1350; const [c, x] = cv(W, H); const a = aspect(); const pw = Math.round(a >= 1 ? 820 : Math.min(700, 960 * a)), ph = Math.round(pw / a); const d = fmtDims(); const rad = d.r / d.w * pw;
    const keepW = canvas.width, keepH = canvas.height; ui.busy = true; canvas.width = pw; canvas.height = ph; const gb = ensureBack(); if (gb) { ensureBackLayer(); canvasBack.width = pw; canvasBack.height = ph; }
    const [tmp, tx] = cv(pw, ph); const L = lightDef(); const name = curCard().name; const dur = 6500;
    const frameAt = t => {
      let yaw; if (t < 0.42) yaw = Math.sin(t / 0.42 * Math.PI * 2) * 0.5; else if (t < 0.88) { const u = (t - 0.42) / 0.46; yaw = (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2) * Math.PI * 2; } else yaw = Math.sin((t - 0.88) / 0.12 * Math.PI) * 0.1;
      const front = Math.cos(yaw) >= 0; const loc = front ? Math.atan2(Math.sin(yaw), Math.cos(yaw)) : Math.atan2(Math.sin(yaw + Math.PI), Math.cos(yaw + Math.PI));
      const lx = 0.5 + 0.4 * Math.sin(t * Math.PI * 3 + 0.6), ly = 0.6 + 0.25 * Math.cos(t * Math.PI * 2); const o = { aspect: a, intensity: ui.intensity, seed: ui.seed, selectedId: null, view: 0, light: { warm: L.warm, z: L.z }, proof: ui.proof };
      if (front) R.renderDoc(project.front, { ...o, pointer: [lx, ly], tilt: [loc * 0.9, 0.06] }); else if (gb) gb.renderDoc(project.back, { ...o, pointer: [1 - lx, ly], tilt: [-loc * 0.9, 0.06] });
      tx.clearRect(0, 0, pw, ph); tx.save(); tx.beginPath(); if (tx.roundRect) tx.roundRect(0, 0, pw, ph, rad); else tx.rect(0, 0, pw, ph); tx.clip(); tx.drawImage(front || !gb ? canvas : canvasBack, 0, 0, pw, ph); tx.restore();
      drawTurn(x, W, H, pw, ph, yaw, tmp, name);
    };
    frameAt(0); const stream = c.captureStream(30); const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 }); const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const stopped = new Promise(res => { rec.onstop = res; }); rec.start(200); toast("Enregistrement de la vidéo… environ 7 secondes");
    try { const t0 = performance.now(); await new Promise(res => { const step = now => { const t = Math.min(1, (now - t0) / dur); frameAt(t); if (t >= 1) setTimeout(res, 150); else requestAnimationFrame(step); }; requestAnimationFrame(step); }); rec.stop(); await stopped; }
    finally { ui.busy = false; canvas.width = keepW; canvas.height = keepH; resize(); ui.dirty = true; for (const tr of stream.getTracks()) tr.stop(); }
    const blob = new Blob(chunks, { type: mime.split(";")[0] }); if (!blob.size) { toast("La vidéo n'a pas pu être enregistrée"); return; }
    await saveFile(`layrys-${slugify(name)}.${mime.includes("mp4") ? "mp4" : "webm"}`, blob); toast("Vidéo prête");
  }

  /* ---- keyboard shortcuts (atelier) ---- */
  document.addEventListener("keydown", e => {
    if (ME.layer || e.ctrlKey || e.metaKey || e.altKey) return; const tag = (document.activeElement && document.activeElement.tagName) || ""; if (/input|textarea|select/i.test(tag)) return; const k = e.key;
    if (k === "f" || k === "F") setFace(ui.face === "back" ? "front" : "back"); else if (k === "r" || k === "R") setAngle(0); else if (k === "m" || k === "M") $("#marks").click(); else if (k === "c" || k === "C") toggleCompare();
    else if (k === "p" || k === "P") toggleProof(); else if (k === "l" || k === "L") { const i = LIGHTS.findIndex(x => x[0] === ui.light); setLight(LIGHTS[(i + 1) % LIGHTS.length][0]); toast("Lumière : " + LIGHTS[(i + 1) % LIGHTS.length][1]); }
    else if (k === "e" || k === "E") openMaskEditor(); else if (k === "+" || k === "=") zoomTo(ui.zoom * 1.25, 0, 0); else if (k === "-") zoomTo(ui.zoom / 1.25, 0, 0); else if (k === "0") { ui.zoom = 1; ui.panX = ui.panY = 0; applyZoom(); }
    else if (k === "PageDown" || (k === "ArrowRight" && e.shiftKey)) setCard(project.cardIndex + 1); else if (k === "PageUp" || (k === "ArrowLeft" && e.shiftKey)) setCard(project.cardIndex - 1); else return; e.preventDefault();
  });

  /* ---- drag and drop to reorder layers ---- */
  (function () {
    const list = $("#layerList"); let dragId = null; const rows = () => $$(".layer-row", list);
    list.addEventListener("dragstart", e => { const row = e.target.closest && e.target.closest(".layer-row"); if (!row) return; dragId = row.dataset.id; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", dragId); } catch (err) {} row.classList.add("dragging"); });
    list.addEventListener("dragend", () => { dragId = null; for (const r of rows()) r.classList.remove("dragging", "over"); });
    list.addEventListener("dragover", e => { if (!dragId) return; const row = e.target.closest && e.target.closest(".layer-row"); if (!row) return; e.preventDefault(); for (const r of rows()) r.classList.toggle("over", r === row && r.dataset.id !== dragId); });
    list.addEventListener("drop", e => { const row = e.target.closest && e.target.closest(".layer-row"); if (!row || !dragId || row.dataset.id === dragId) return; e.preventDefault(); e.stopPropagation(); const doc = curDoc(); const from = doc.layers.findIndex(l => l.id === dragId), to = doc.layers.findIndex(l => l.id === row.dataset.id); if (from < 0 || to < 0) return; const [l] = doc.layers.splice(from, 1); doc.layers.splice(to, 0, l); dragId = null; refreshLayers(); ui.dirty = true; commit(); });
  })();

  /* ---- series page wiring ---- */
  (function () {
    $("#serieTitle").addEventListener("input", e => { project.title = e.target.value; }); $("#serieTitle").addEventListener("change", () => { regenTokens(); renderSeries(false); autosave(); });
    $("#cardName").addEventListener("input", e => { curCard().name = e.target.value; updateCardNav(); }); $("#cardName").addEventListener("change", () => { regenTokens(); renderSeries(false); autosave(); });
    $("#cardDup").addEventListener("click", () => duplicateCard(project.cardIndex)); $("#cardDel").addEventListener("click", () => deleteCard(project.cardIndex)); $("#cardOpen").addEventListener("click", () => setPage("atelier"));
    $("#rarityBtn").addEventListener("click", declineRarities); $("#syncFx").addEventListener("click", syncFinishes); $("#serieNew").addEventListener("click", newCard);
    $("#serieFiles").addEventListener("change", e => { cardsFromFiles(e.target.files); e.target.value = ""; });
    $("#impSheet").addEventListener("change", e => { project.impose.sheet = e.target.value; renderImposition(); autosave(); }); $("#impWhat").addEventListener("change", e => { project.impose.what = e.target.value; renderImposition(); autosave(); });
    $("#impCopies").addEventListener("change", e => { project.impose.copies = clamp(Math.round(+e.target.value || 1), 1, 200); e.target.value = project.impose.copies; renderImposition(); autosave(); }); $("#impBack").addEventListener("change", e => { project.impose.back = e.target.checked; renderImposition(); autosave(); });
    const guard = (fn, label) => () => fn().catch(err => { console.error(err); toast(label + " impossible : " + (err && err.message || err)); });
    $("#impExport").addEventListener("click", guard(exportImposition, "Planche")); $("#serieExport").addEventListener("click", guard(exportPrintFiles, "Export"));
    $("#cardPrev").addEventListener("click", () => setCard(project.cardIndex - 1)); $("#cardNext").addEventListener("click", () => setCard(project.cardIndex + 1)); $("#cardNavName").addEventListener("click", () => setPage("serie"));
  })();
