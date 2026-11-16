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
    ui.dirty = true; mockInvalidate(true); const tb = $("#themeBtn"); if (tb) { const dk = isDark(); tb.innerHTML = ICO(dk ? "sun" : "moon"); tb.title = dk ? "Passer en mode clair" : "Passer en mode sombre"; tb.setAttribute("aria-label", tb.title); }
  }
  for (const b of $$("[data-theme-set]")) b.addEventListener("click", () => setTheme(b.dataset.themeSet));
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (ui.theme === "auto") mockInvalidate(true); }); } catch (e) {}

