
  /* ---- home menu, card creation workshop, tutorial (v31) ----
     Nothing is forced: no border and no text until the user asks for one. Every element is a layer named "… · création".
     The form is read back from those layers, so it always tells the truth after a deletion, an undo or a reload. */
  const CR_RAR = { "Commune": "C", "Peu commune": "U", "Rare": "R", "Super rare": "SR", "Ultra rare": "UR", "Secrète": "SEC", "Hyper rare": "HR" };
  const CR_TAG = " · création";
  const CR_FIN = [["i-none", "Encre de couleur, sans effet"], ["f-gold", "Dorure or brillant"], ["f-gold-matte", "Dorure or mat"], ["f-silver", "Dorure argent"], ["f-copper", "Dorure cuivre"], ["f-rose", "Dorure rose gold"], ["f-black", "Dorure noire"], ["f-holo", "Dorure holographique"], ["h-rainbow", "Film holo arc-en-ciel"], ["i-gold", "Encre métallique or"], ["i-silver", "Encre métallique argent"], ["f-emboss-gold", "Gaufrage doré, en relief"]];
  const CR_DEF = { border: "none", bw: 3, pos: "edge", gap: 4, finish: "i-none", accent: "#e8b44a", panel: "none", name: "", type: "", effect: "", artist: "", rarity: "", showRar: false, showNum: false };
  const CR = { ...CR_DEF };
  const crNum = v => String(+(+v).toFixed(1)).replace(".", ",");
  const crFind = name => project.front.layers.find(l => l.name === name + CR_TAG);
  const crLabel = l => l.name.endsWith(CR_TAG) ? l.name.slice(0, -CR_TAG.length) : l.name;
  function renderHome() { const n = project.cards.length; $("#homeState").textContent = `Série en cours : « ${project.title || "Ma série"} », ${n} carte${n > 1 ? "s" : ""}. Ton travail est enregistré sur cet appareil.`; }
  function crRead() {
    Object.assign(CR, CR_DEF); const b = crFind("Bordure"), p = crFind("Fond des textes"), old = crFind("Cadre"), ty = crFind("Type");
    if (b) { CR.border = ["thin", "double", "ornate"].includes(b.frame.style) ? b.frame.style : "thin"; CR.bw = b.frame.width; CR.accent = b.frame.color; if (b.frame.inset > 0) { CR.pos = "in"; CR.gap = b.frame.inset; } CR.finish = CR_FIN.some(f => f[0] === b.presetId) ? b.presetId : "i-none"; }
    if (p) { CR.panel = p.frame.style === "classic" ? "boxes" : "band"; if (!b) CR.accent = p.frame.color; }
    if (old && !b && !p) { const s = old.frame.style; CR.border = "thin"; CR.accent = old.frame.color; CR.bw = +(old.frame.width * (s === "fullart" ? 0.7 : 1)).toFixed(2); CR.panel = s === "fullart" ? "band" : s === "classic" ? "boxes" : "none"; }
    if (!b && !p && !old && ty) CR.accent = ty.text.color;
    const t = n => { const l = crFind(n); return l ? l.text.text : ""; };
    CR.name = t("Nom"); CR.type = t("Type"); CR.effect = t("Effet").replace(/\n/g, " "); CR.artist = t("Artiste").replace(/^Illus\. /, "");
    const rn = t("Rareté et numéro"); CR.showNum = /\d\/\d/.test(rn); CR.showRar = !!rn && !/^\d/.test(rn); CR.rarity = curCard().rarity || ""; ui.crPanel = CR.panel;
  }
  function crUi() {
    const d = fmtDims(), mm = v => crNum(v / 100 * d.w) + " mm";
    $("#crBorderOpts").hidden = CR.border === "none"; $("#crGapW").hidden = CR.pos !== "in"; $("#o-cr-bw").value = mm(CR.bw); $("#o-cr-gap").value = mm(CR.gap);
    $("#crFinNote").hidden = CR.finish === "i-none"; $("#crCutNote").hidden = !(CR.border !== "none" && CR.pos === "edge" && CR.bw / 100 * d.w < 2.5);
  }
  function crList() {
    const box = $("#crList"), ls = project.front.layers; box.textContent = "";
    for (let i = ls.length - 1; i >= 0; i--) {
      const l = ls[i], row = document.createElement("div"); row.className = "crrow";
      row.innerHTML = ICO(l.kind === "image" ? "card" : l.kind === "text" ? "edit" : l.kind === "frame" ? "frame" : "layers", true) + '<span class="crrow__n"></span><span class="crrow__s"></span>';
      row.children[1].textContent = crLabel(l); row.children[2].textContent = l.kind === "text" ? l.text.text.replace(/\n/g, " ") : l.kind === "image" ? "Illustration" : "";
      const del = document.createElement("button"); del.type = "button"; del.className = "btn icon ghost"; del.title = "Supprimer"; del.setAttribute("aria-label", "Supprimer " + crLabel(l)); del.innerHTML = ICO("trash", true); del.addEventListener("click", () => crDelete(l)); row.append(del); box.append(row);
    }
    $("#crEmpty").hidden = ls.length > 0; const made = ls.some(l => l.name.endsWith(CR_TAG)); $("#crClear").disabled = !made; $("#crReplace").disabled = !ls.some(l => l.name.endsWith(CR_TAG) && l.kind === "text");
  }
  function crSync() {
    crRead();
    for (const k of Object.keys(CR)) { const el = $("#cr-" + k); if (!el || document.activeElement === el) continue; if (el.type === "checkbox") el.checked = !!CR[k]; else el.value = CR[k]; }
    const d = fmtDims(), b = project.print.bleed, px = v => Math.round(v / 25.4 * 300);
    $("#crFormat").textContent = `Ta carte fait ${crNum(d.w)} × ${crNum(d.h)} mm. Prépare l'illustration en ${crNum(d.w + 2 * b)} × ${crNum(d.h + 2 * b)} mm, fond perdu de ${crNum(b)} mm compris, soit ${px(d.w + 2 * b)} × ${px(d.h + 2 * b)} px à 300 dpi.`;
    imgSync(); crUi(); crList();
  }
  /* The form is live: a change rebuilds only the layer it concerns. A text the user moved keeps its place until the text background changes or "Replacer les textes" is pressed (loud === 2). */
  function crCompose(loud) {
    if (ui.face !== "front") setFace("front"); const doc = project.front; const boxes = CR.panel === "boxes", moved = ui.crPanel !== CR.panel || loud === 2; ui.crPanel = CR.panel; let changed = false;
    const drop = name => { const l = crFind(name); if (!l) return; doc.layers.splice(doc.layers.indexOf(l), 1); for (const g of [R, RB, T, PK]) if (g) g.drop(l.id); if (ui.selId === l.id) ui.selId = doc.layers[0] ? doc.layers[0].id : null; changed = true; };
    const put = (kind, name, sig, apply, pos) => {
      let l = crFind(name); const fresh = !l;
      if (fresh) { l = newLayer(kind, name + CR_TAG); applyPreset(l, "i-none"); l.fx.mask = 0; l.fx.maskInvert = 0;
        /* borders and text backgrounds go under the texts, the background under the border */
        let i = kind === "frame" ? doc.layers.findIndex(q => q.name.endsWith(CR_TAG) && (q.kind === "text" || (name === "Fond des textes" && q.kind === "frame"))) : -1; if (i < 0) i = doc.layers.length; doc.layers.splice(i, 0, l); }
      if (!fresh && l._crSig === sig && !moved) return; apply(l); if (pos && (fresh || moved)) { l.y = pos.y; l.x = pos.x === undefined ? 0.5 : pos.x; } l._crSig = sig; regen(l); changed = true; };
    const txt = (name, text, y, size, o, x) => { if (!text) { drop(name); return; } const props = Object.assign({ text, size, font: "Figtree", weight: "700", spacing: 1, color: "#ffffff", stroke: "#15120c", strokeW: 6, align: "center", upper: false, shadow: true }, o || {}); put("text", name, JSON.stringify(props), l => Object.assign(l.text, props), { x, y }); };
    drop("Cadre"); const on = CR.border !== "none", ins = on && CR.pos === "in" ? CR.gap : 0;
    if (!on) drop("Bordure"); else put("frame", "Bordure", [CR.border, CR.accent, CR.bw, ins, CR.finish].join("|"), l => { Object.assign(l.frame, { style: CR.border, color: CR.accent, width: CR.bw, inset: ins }); if (l.presetId !== CR.finish) { applyPreset(l, CR.finish); l.fx.mask = 0; l.fx.maskInvert = 0; } });
    const pw = on ? Math.max(1.5, CR.bw) : 3;
    if (CR.panel === "none") drop("Fond des textes"); else put("frame", "Fond des textes", [CR.panel, CR.accent, pw, ins].join("|"), l => Object.assign(l.frame, { style: boxes ? "classic" : "fullart", color: CR.accent, width: pw, inset: ins, noEdge: true }));
    /* default places stay clear of the border: "edge" is how far the border reaches into the card, as a fraction of its width */
    const a = aspect(), edge = on ? (ins + CR.bw) / 100 : 0, pm = (ins + pw * 1.6) / 100;
    const ny = boxes ? pm * a + 0.0425 : Math.max(0.085, edge * a + 0.05), fx = Math.max(0.03, (boxes ? pm + 0.02 : edge + 0.025) - 0.07), fy = boxes ? 0.915 : Math.min(0.935, 1 - edge * a - 0.03);
    txt("Nom", CR.name.trim(), ny, 4.8, { upper: true, spacing: 3, font: "Sora", weight: "600", strokeW: 5 });
    txt("Type", CR.type.trim(), boxes ? 0.615 : 0.69, 2.4, { weight: "600", color: CR.accent, upper: true, spacing: 8 });
    let eff = ""; if (CR.effect.trim()) { const size = 2.3, max = Math.max(18, Math.floor(0.84 * a / (size / 100 * 0.5))); const lines = []; for (const par of CR.effect.trim().split("\n")) { let cur = ""; for (const w of par.split(/\s+/)) { if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; } lines.push(cur); } eff = lines.slice(0, 7).join("\n"); }
    txt("Effet", eff, boxes ? 0.765 : 0.805, 2.3, { weight: "500" });
    txt("Artiste", CR.artist.trim() ? "Illus. " + CR.artist.trim() : "", fy, 1.7, { weight: "600", align: "left" }, 0.5 + fx);
    const parts = []; if (CR.showRar && CR_RAR[CR.rarity]) parts.push(CR_RAR[CR.rarity]); if (CR.showNum) parts.push(pad3(project.cardIndex + 1) + "/" + pad3(project.cards.length));
    txt("Rareté et numéro", parts.join(" · "), fy, 1.7, { weight: "600", align: "right" }, 0.5 - fx);
    const c = curCard(); if (CR.name.trim() && c.name !== CR.name.trim()) { c.name = CR.name.trim(); changed = true; } if (CR.rarity && c.rarity !== CR.rarity) { c.rarity = CR.rarity; changed = true; }
    if (changed) { refreshLayers(); syncInspector(); invalidateThumbs(); updateCardNav(); ui.dirty = true; if (!ui.crLive) commit(); crList(); }
    crUi(); if (loud === 2) toast("Textes replacés à leur position d'origine"); else if (moved && changed) shimmer();
  }
  /* fonts first: text drawn on a canvas before its font is ready would keep the fallback font */
  function crRun(loud) { const ready = document.fonts && document.fonts.load ? Promise.all(["600 20px Sora", "700 20px Figtree", "600 20px Figtree", "500 20px Figtree"].map(f => document.fonts.load(f).catch(() => 0))) : Promise.resolve(); Promise.race([ready, new Promise(r => setTimeout(r, 1200))]).then(() => crCompose(loud)); }
  function crDelete(l) { if (!l || !project.front.layers.includes(l)) return; const label = crLabel(l); if (ui.face !== "front") setFace("front"); removeLayer(project.front, l.id); invalidateThumbs(); updateCardNav(); crSync(); toast(`« ${label} » supprimé. Ctrl + Z pour annuler`); }
  function crClear() {
    const doc = project.front, gone = doc.layers.filter(l => l.name.endsWith(CR_TAG)); if (!gone.length) { toast("Aucune bordure ni texte à effacer sur cette carte"); return; }
    for (const l of gone) { doc.layers.splice(doc.layers.indexOf(l), 1); for (const g of [R, RB, T, PK]) if (g) g.drop(l.id); } if (gone.some(l => l.id === ui.selId)) ui.selId = doc.layers[0] ? doc.layers[0].id : null;
    refreshLayers(); syncInspector(); invalidateThumbs(); updateCardNav(); ui.dirty = true; commit(); crSync(); toast("Bordure et textes effacés, l'illustration est conservée. Ctrl + Z pour annuler");
  }
  { const rs = $("#cr-rarity"); for (const [label] of RARITIES) { const o = document.createElement("option"); o.value = label; o.textContent = label + " (" + (CR_RAR[label] || "") + ")"; rs.append(o); }
    const fs = $("#cr-finish"); for (const [id, label] of CR_FIN) if (PRESET_BY_ID[id]) { const o = document.createElement("option"); o.value = id; o.textContent = label; fs.append(o); }
    /* choices apply at once, typed text after a short pause, sliders while they move (one undo step when released) */
    for (const k of Object.keys(CR)) { const el = $("#cr-" + k); if (!el) continue; const kind = el.type === "checkbox" ? "check" : el.type === "range" ? "range" : el.type === "color" ? "color" : (el.tagName === "TEXTAREA" || el.type === "text") ? "text" : "select";
      if (kind === "range") { el.addEventListener("input", () => { CR[k] = +el.value; crUi(); if (!ui.crLiveT) ui.crLiveT = setTimeout(() => { ui.crLiveT = 0; ui.crLive = true; crCompose(false); ui.crLive = false; }, 90); }); el.addEventListener("change", () => { clearTimeout(ui.crLiveT); ui.crLiveT = 0; CR[k] = +el.value; crCompose(false); commit(); }); continue; }
      el.addEventListener(kind === "select" || kind === "check" ? "change" : "input", () => { CR[k] = kind === "check" ? el.checked : el.value; crUi(); clearTimeout(ui.crT); ui.crT = setTimeout(() => crRun(false), kind === "text" ? 450 : kind === "color" ? 220 : 0); }); }
    $("#crReplace").addEventListener("click", () => { clearTimeout(ui.crT); crRun(2); });
    $("#crClear").addEventListener("click", () => { clearTimeout(ui.crT); crClear(); });
    /* Texts are placed with the mouse, directly on the card: hover shows the box of a text, dragging moves it, a click keeps it selected (cross or Delete key removes it) */
    const [, crMx] = cv(8, 8); const boxEl = document.createElement("div"); boxEl.className = "crbox"; boxEl.hidden = true; const delBtn = document.createElement("button"); delBtn.type = "button"; delBtn.className = "crbox__del"; delBtn.title = "Supprimer ce texte (touche Suppr)"; delBtn.setAttribute("aria-label", "Supprimer ce texte"); delBtn.innerHTML = ICO("close", true); boxEl.append(delBtn); $("#protect").append(boxEl); let drag = null, picked = null;
    const alive = l => l && project.front.layers.includes(l) ? l : null;
    const boxOf = l => { const t = l.text, H = 1000 / aspect(), size = H * t.size / 100; crMx.font = `${t.weight} ${size}px "${t.font}", "Manrope", sans-serif`; if ("letterSpacing" in crMx) crMx.letterSpacing = (t.spacing * size / 100) + "px"; const lines = (t.upper ? t.text.toUpperCase() : t.text).split("\n"); const w = Math.max(...lines.map(q => crMx.measureText(q).width)) / 1000 * l.scale, h = lines.length * size * 1.15 / H * l.scale; const ax = l.x + (t.align === "left" ? -0.43 : t.align === "right" ? 0.43 : 0) * l.scale; return { x: t.align === "left" ? ax : t.align === "right" ? ax - w : ax - w / 2, y: l.y - h / 2, w, h }; };
    const show = l => { l = alive(l); if (!l || ui.page !== "creation") { boxEl.hidden = true; return; } const b = boxOf(l); boxEl.hidden = false; boxEl.classList.toggle("is-picked", l === picked); boxEl.style.left = (b.x - 0.012) * 100 + "%"; boxEl.style.top = (b.y - 0.008) * 100 + "%"; boxEl.style.width = (b.w + 0.024) * 100 + "%"; boxEl.style.height = (b.h + 0.016) * 100 + "%"; };
    const onDel = e => e.target === delBtn || delBtn.contains(e.target);
    const hit = e => { if (ui.page !== "creation" || ui.face !== "front") return null; const r = card.getBoundingClientRect(); const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height; const ls = project.front.layers; for (let i = ls.length - 1; i >= 0; i--) { const l = ls[i]; if (l.kind !== "text" || !l.visible || !l.text.text) continue; const b = boxOf(l); if (u >= b.x - 0.02 && u <= b.x + b.w + 0.02 && v >= b.y - 0.014 && v <= b.y + b.h + 0.014) return { l, u, v, r }; } return null; };
    bench.addEventListener("pointermove", e => { if (drag) { e.stopPropagation(); const u = (e.clientX - drag.r.left) / drag.r.width, v = (e.clientY - drag.r.top) / drag.r.height; drag.l.x = Math.min(1.4, Math.max(-0.4, drag.x0 + u - drag.u)); drag.l.y = Math.min(drag.img ? 1.5 : 1.05, Math.max(drag.img ? -0.5 : -0.05, drag.y0 + v - drag.v)); drag.moved = true; if (drag.img) imgSync(); else show(drag.l); ui.dirty = true; return; } if (onDel(e)) { e.stopPropagation(); return; } const h = hit(e); show(h ? h.l : picked); bench.style.cursor = h ? "move" : ui.imgMove ? "grab" : ""; if (h || ui.imgMove) e.stopPropagation(); }, true);
    bench.addEventListener("pointerdown", e => { if (e.button !== 0 || onDel(e)) return; const h = hit(e); if (!h) { if (picked) { picked = null; show(null); } const im = ui.imgMove && !e.target.closest(".lighthandle") ? imgTarget() : null; if (im) { e.stopPropagation(); e.preventDefault(); const r = card.getBoundingClientRect(); drag = { l: im, img: true, u: (e.clientX - r.left) / r.width, v: (e.clientY - r.top) / r.height, r, x0: im.x, y0: im.y, moved: false }; try { bench.setPointerCapture(e.pointerId); } catch (err) {} } return; } e.stopPropagation(); e.preventDefault(); drag = { l: h.l, u: h.u, v: h.v, r: h.r, x0: h.l.x, y0: h.l.y, moved: false }; picked = h.l; show(picked); try { bench.setPointerCapture(e.pointerId); } catch (err) {} ui.selDoc = project.front.id; ui.selId = h.l.id; }, true);
    const endDrag = e => { if (!drag) return; e.stopPropagation(); const d = drag; drag = null; if (d.moved) { refreshLayers(); if (d.img) syncInspector(); invalidateThumbs(); commit(); } }; bench.addEventListener("pointerup", endDrag, true); bench.addEventListener("pointercancel", endDrag, true);
    bench.addEventListener("pointerleave", () => { if (!drag) show(picked); });
    /* with "Déplacer à la souris" on, the wheel over the card resizes the illustration instead of zooming the view */
    bench.addEventListener("wheel", e => { if (!ui.imgMove) return; const r = card.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return; const im = imgTarget(); if (!im) return; e.preventDefault(); e.stopPropagation(); im.scale = Math.min(6, Math.max(0.1, im.scale * (e.deltaY < 0 ? 1.04 : 1 / 1.04))); ui.dirty = true; imgSync(); clearTimeout(ui.imgT); ui.imgT = setTimeout(() => { invalidateThumbs(); syncInspector(); commit(); }, 400); }, { capture: true, passive: false });
    delBtn.addEventListener("pointerdown", e => e.stopPropagation());
    delBtn.addEventListener("click", e => { e.stopPropagation(); const l = alive(picked); picked = null; show(null); if (l) crDelete(l); });
    document.addEventListener("keydown", e => { if (ui.page !== "creation" || !alive(picked) || /input|textarea|select/i.test((document.activeElement && document.activeElement.tagName) || "")) return; if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); const l = picked; picked = null; show(null); crDelete(l); } else if (e.key === "Escape") { picked = null; show(null); } });
    for (const b of $$("[data-go]")) b.addEventListener("click", () => { setPage(b.dataset.go); const m = $(".main .page:not([hidden])"); if (m) m.scrollTop = 0; });
    setTimeout(() => { const h = (location.hash || "").slice(1); setPage(PAGE_TEXT[h] ? h : "accueil"); }, 0);
  }
