
  /* ---- v34: the layers of the card stay in view at the top of the inspector, each with a thumbnail of its mask ---- */
  const stackThumbs = new Map();
  function stackMaskThumb(l) {
    if (!T || !l.src) return "";
    const ca = aspect(), key = [l.id, l.version, l.maskVersion, l.fx.mask, l.fx.maskInvert, l.fx.maskThr, l.fx.maskSoft, l.fx.maskGrow, l.fx.pattern, l.fx.scale, l.fx.angle, l.win, l.pickTol, JSON.stringify(l.picks), l.x, l.y, l.scale, l.rot, ca].join("|");
    const hit = stackThumbs.get(l.id); if (hit && hit.key === key) return hit.url;
    thumbCanvas.width = 60; thumbCanvas.height = Math.round(60 / ca);
    const temp = { ...l, opacity: 1, blend: "normal", visible: true, fx: { ...l.fx, accent: 0 } };
    T.renderDoc({ stock: "#000000", layers: [temp], coat: 0 }, { pointer: [0.5, 0.5], tilt: [0, 0], aspect: ca, intensity: 1, seed: ui.seed, selectedId: null, view: 9, viewAll: true, clearColor: [0, 0, 0], noCoat: true });
    const url = thumbCanvas.toDataURL("image/png"); stackThumbs.set(l.id, { key, url }); return url;
  }
  const stackSub = l => { const p = PRESET_BY_ID[l.presetId]; return (p ? p.label : "Sans finition") + " · " + (MASK_LABEL[l.fx.mask] || "partout") + (l.fx.maskInvert ? ", inversé" : ""); };
  function stackRender() {
    const list = $("#stackList"); if (!list) return; const doc = curDoc(); list.textContent = ""; $("#stackDoc").textContent = doc.id === "back" ? "du verso" : "du recto";
    if (!doc.layers.length) { const p = document.createElement("p"); p.className = "note"; p.textContent = "Aucun calque. Importe une illustration pour commencer."; list.append(p); return; }
    for (const l of [...doc.layers].reverse()) {
      const row = document.createElement("div"); row.className = "stack__row" + (l.fx.clip ? " is-sub" : "") + (l.visible ? "" : " off"); row.setAttribute("role", "option"); row.tabIndex = 0; row.dataset.id = l.id; row.setAttribute("aria-selected", String(l.id === ui.selId && ui.selDoc === doc.id));
      const th = document.createElement("button"); th.type = "button"; th.className = "stack__th"; th.title = "Voir ce masque sur la carte"; th.setAttribute("aria-label", "Voir le masque de " + l.name); let url = ""; try { url = stackMaskThumb(l); } catch (e) {} if (url) th.style.backgroundImage = `url(${url})`;
      th.addEventListener("click", e => { e.stopPropagation(); const same = sel() === l && ui.view === 9; selectLayer(doc.id, l.id); const b = document.querySelector(`[data-view="${same ? 0 : 9}"]`); if (b) b.click(); });
      const meta = document.createElement("div"); meta.className = "stack__meta"; const b = document.createElement("b"); b.textContent = l.name; const s = document.createElement("span"); s.textContent = stackSub(l); meta.append(b, s);
      const eye = document.createElement("button"); eye.type = "button"; eye.className = "stack__eye"; eye.innerHTML = ICO(l.visible ? "eye" : "eyeoff", 1); eye.title = l.visible ? "Masquer ce calque" : "Afficher ce calque"; eye.setAttribute("aria-label", eye.title); eye.addEventListener("click", e => { e.stopPropagation(); l.visible = !l.visible; refreshLayers(); ui.dirty = true; commit(); });
      row.append(th, meta, eye); row.addEventListener("click", () => selectLayer(doc.id, l.id)); row.addEventListener("keydown", e => { if (e.target === row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); row.click(); } });
      list.append(row);
    }
    const cur = list.querySelector('[aria-selected="true"]'); if (cur && cur.scrollIntoView) { const a = cur.offsetTop, z = a + cur.offsetHeight; if (a < list.scrollTop) list.scrollTop = a; else if (z > list.scrollTop + list.clientHeight) list.scrollTop = z - list.clientHeight; }
  }
  /* a zone setting moved: refresh the thumbnails and the captions in place, without rebuilding the rows */
  function stackSoon() { clearTimeout(ui.stackT); ui.stackT = setTimeout(() => { const list = $("#stackList"); if (!list || ui.page !== "atelier") return; const doc = curDoc(); for (const row of list.children) { const l = doc.layers.find(q => q.id === row.dataset.id); if (!l) continue; let url = ""; try { url = stackMaskThumb(l); } catch (e) {} if (url) row.children[0].style.backgroundImage = `url(${url})`; row.children[1].children[1].textContent = stackSub(l); } }, 220); }
  { $("#stackAdd").addEventListener("click", () => addFinishLayer());
    $("#stackAll").addEventListener("click", () => setTab("layers"));
    document.addEventListener("input", e => { if (e.target && e.target.closest && e.target.closest("#insp, #maskBar")) stackSoon(); });
    stackRender();
  }
