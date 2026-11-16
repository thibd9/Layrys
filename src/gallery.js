  /* ================= illustrations: strip under the stage and large library window ================= */
  const tallCache = new WeakMap(); ui.imports = [];
  function tallThumb(src) {
    let u = tallCache.get(src);
    if (!u) { const w = src.naturalWidth || src.width, h = src.naturalHeight || src.height; const [c, x] = cv(300, 420); const s = Math.max(300 / w, 420 / h); x.fillStyle = "#111"; x.fillRect(0, 0, 300, 420); x.drawImage(src, (300 - w * s) / 2, (420 - h * s) / 2, w * s, h * s); u = c.toDataURL("image/jpeg", 0.82); tallCache.set(src, u); }
    return u;
  }
  /* every distinct image imported in this session or used by a card of the series, most recent first */
  function myImages() {
    const seen = new Map(); const put = (src, name, w, h) => { if (src && !seen.has(src)) seen.set(src, { src, name, w, h }); };
    for (const it of ui.imports) put(it.src, it.name, it.src.naturalWidth || it.src.width, it.src.naturalHeight || it.src.height);
    for (const c of project.cards) for (const l of c.front.layers) if (l.kind === "image" && l.src && !l.assetId) put(l.src, l.name, l.w, l.h);
    for (const l of curDoc().layers) if (l.kind === "image" && l.src && !l.assetId) put(l.src, l.name, l.w, l.h);
    return [...seen.values()];
  }
  const dpiOf = w => Math.round(w / (fmtDims().w / 25.4));
  function useImage(it) {
    const doc = curDoc(), l = sel();
    if (l && l.kind === "image" && ui.selDoc === doc.id) { setSrc(l, it.src); delete l.assetId; l.name = it.name; fitLayer(l, "cover"); refreshLayers(); syncInspector(); invalidateThumbs(); ui.dirty = true; commit(); }
    else addImageLayer(doc, it.src, it.name, "f-gold");
    toast("Illustration : " + it.name);
  }
  function removeImage(it) {
    const doc = curDoc(); const used = doc.layers.filter(l => l.src === it.src); ui.imports = ui.imports.filter(x => x.src !== it.src);
    for (const l of used) removeLayer(doc, l.id); const c = curCard(); c.thumb = ""; c.pre = null;
    const elsewhere = project.cards.some(cd => cd !== c && cd.front.layers.some(l => l.src === it.src));
    refreshLayers(); toast(elsewhere ? "Retirée de cette carte. Elle reste utilisée par une autre carte de la série." : used.length ? "Illustration retirée. Ctrl Z pour annuler." : "Illustration retirée de la bibliothèque.");
  }
  function hideArt(art) { if (!project.hiddenArts.includes(art.id)) project.hiddenArts.push(art.id); refreshLayers(); autosave(); toast("Exemple masqué. Tu peux le réafficher depuis la bibliothèque."); }
  function libTile(o) {
    const t = document.createElement("div"); t.className = "gtile"; t.setAttribute("aria-selected", String(!!o.current));
    const im = document.createElement("button"); im.type = "button"; im.className = "gtile__img"; im.style.backgroundImage = `url(${o.thumb})`; if (o.pos) im.style.backgroundPosition = o.pos; im.title = "Utiliser « " + o.name + " » comme illustration"; im.setAttribute("aria-label", im.title); im.addEventListener("click", o.use);
    if (o.current) { const tag = document.createElement("span"); tag.className = "gtile__tag"; tag.textContent = "Sur la carte"; im.append(tag); }
    const meta = document.createElement("div"); meta.className = "gtile__meta"; const b = document.createElement("b"); b.textContent = o.name; const s = document.createElement("span"); s.textContent = o.sub; if (o.low) s.className = "low"; meta.append(b, s);
    const acts = document.createElement("div"); acts.className = "gtile__acts"; const mk = (ico, title, fn) => { const bt = document.createElement("button"); bt.type = "button"; bt.innerHTML = ICO(ico, 1); bt.title = title; bt.setAttribute("aria-label", title); bt.addEventListener("click", fn); return bt; };
    acts.append(mk("plus", "Ajouter comme nouveau calque", o.add), mk("trash", o.delTitle, o.del)); t.append(im, meta, acts); return t;
  }
  function renderLib() {
    const strip = $("#libStrip"); if (!strip) return; const cur = sel(); const mine = myImages(); const arts = ART_LIBRARY.filter(a => !project.hiddenArts.includes(a.id)); const q = plain($("#galSearch").value).trim();
    const mineTiles = () => mine.filter(it => !q || plain(it.name).includes(q)).map(it => libTile({ thumb: tallThumb(it.src), name: it.name, sub: `${it.w} × ${it.h} px · ${dpiOf(it.w)} dpi`, low: dpiOf(it.w) < 250, current: !!(cur && cur.src === it.src), use: () => useImage(it), add: () => { addImageLayer(curDoc(), it.src, it.name, "h-rainbow"); toast("Nouveau calque : " + it.name); }, del: () => removeImage(it), delTitle: "Retirer cette illustration" }));
    const artTiles = () => arts.filter(a => !q || plain(a.name).includes(q)).map(a => libTile({ thumb: a.src, pos: "50% 22%", name: a.name, sub: "Exemple fourni · 900 × 1260 px", current: !!(cur && cur.assetId === a.id), use: () => useArt(a), add: () => addArtLayer(a), del: () => hideArt(a), delTitle: "Masquer cet exemple" }));
    strip.innerHTML = ""; const add = document.createElement("label"); add.className = "gtile add"; add.htmlFor = "file"; add.innerHTML = ICO("upload") + "<b>Importer</b><span>ou déposer une image sur la carte</span>"; strip.append(add, ...mineTiles(), ...artTiles());
    { const ig = $("#imgGrid"); if (ig && ui.page === "image") { ig.innerHTML = ""; ig.append(...mineTiles(), ...artTiles()); } }
    $("#libCount").textContent = `· ${mine.length} importée${mine.length > 1 ? "s" : ""}, ${arts.length} exemple${arts.length > 1 ? "s" : ""}`;
    if (!$("#gallery").hidden) {
      const gm = $("#galMine"); gm.innerHTML = ""; const gadd = document.createElement("label"); gadd.className = "gtile add"; gadd.htmlFor = "file"; gadd.innerHTML = ICO("upload") + "<b>Importer des images</b><span>PNG, JPEG ou WebP. Tu peux aussi les déposer ici.</span>"; gm.append(gadd, ...mineTiles());
      $("#galMineCount").textContent = "· " + mine.length; const gl = $("#galLib"); gl.innerHTML = ""; const at = artTiles(); if (at.length) gl.append(...at); else { const p = document.createElement("p"); p.className = "note"; p.textContent = q ? "Aucun exemple ne correspond à la recherche." : "Tous les exemples sont masqués."; gl.append(p); }
      $("#galRestore").hidden = !project.hiddenArts.length; $("#galRestore").textContent = `Réafficher les exemples masqués (${project.hiddenArts.length})`;
    }
  }
  function openGallery() { $("#gallery").hidden = false; renderLib(); $("#galClose").focus(); }
  function closeGallery() { $("#gallery").hidden = true; }
  $("#libOpen").addEventListener("click", openGallery); $("#galClose").addEventListener("click", closeGallery); $("#galSearch").addEventListener("input", renderLib);
  $("#galRestore").addEventListener("click", () => { project.hiddenArts = []; refreshLayers(); autosave(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#gallery").hidden) closeGallery(); });
  (function () {
    const body = $("#galBody");
    body.addEventListener("dragover", e => { if (pageDrag || !hasFiles(e)) return; e.preventDefault(); body.classList.add("dropping"); });
    body.addEventListener("dragleave", () => body.classList.remove("dropping"));
    body.addEventListener("drop", e => { e.preventDefault(); body.classList.remove("dropping"); const own = pageDrag; pageDrag = false; if (own) return; importImages([...e.dataTransfer.files].filter(f => f.type.startsWith("image/"))); });
  })();
  $("#themeBtn").addEventListener("click", () => setTheme(isDark() ? "light" : "dark"));
