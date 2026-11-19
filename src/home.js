
  /* ---- home and sidebar (v43) ----
     The home is the cockpit of the series: its name, where the work stands, the current card rendered live (its finishes follow the pointer),
     the five steps as one connected path, the tools, and the cards of the series. The sidebar shows the same series at its foot.
     State lives on the function (renderHome may be called while the page starts, before this module has run). */
  function homeSt() { return renderHome.st || (renderHome.st = { px: 0.2, py: 0.35, seq: 0, intro: 0, back: "", sig: "", timer: 0, raf: 0 }); }
  function homeStep() { let s = "format"; try { s = localStorage.getItem("layrys-step") || "format"; } catch (e) {} return STEPS.includes(s) ? s : "format"; }
  const homeSnap = d => { try { return snapshotDoc(d, 320, [0.35, 0.3], [0, 0]); } catch (e) { return ""; } };
  /* the current card, drawn by the card renderer with the light where the pointer is */
  function heroDraw() {
    const H = homeSt(), cv = $("#heroCard"), c = curCard(); if (!cv || !T || !c || ui.page !== "accueil") return;
    const a = aspect(), w = 560, h = Math.round(w / a); thumbCanvas.width = w; thumbCanvas.height = h;
    try { T.renderDoc(c.front, { pointer: [H.px, H.py], tilt: [(0.5 - H.py) * 0.4, (H.px - 0.5) * 0.5], aspect: a, intensity: 1, seed: ui.seed, selectedId: null, view: 0 }); } catch (e) { return; }
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } cv.getContext("2d").drawImage(thumbCanvas, 0, 0, w, h);
  }
  function heroAim(x, y) {
    const H = homeSt(), cards = $("#heroCards"); H.px = Math.max(0, Math.min(1, x)); H.py = Math.max(0, Math.min(1, y));
    cards.style.setProperty("--ry", ((H.px - 0.5) * 22).toFixed(2) + "deg"); cards.style.setProperty("--rx", ((0.5 - H.py) * 12).toFixed(2) + "deg");
    if (!H.raf) H.raf = requestAnimationFrame(() => { H.raf = 0; heroDraw(); });
  }
  /* on arrival the light glides once across the card, then the pointer leads */
  function heroIntro() {
    const H = homeSt(); if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { heroAim(0.2, 0.35); return; }
    const t0 = performance.now(), id = H.intro = ++H.seq, step = now => { if (H.intro !== id || ui.page !== "accueil") return; const u = Math.min(1, (now - t0) / 1800), e = 1 - Math.pow(1 - u, 3); heroAim(0.95 - 0.75 * e, 0.18 + 0.17 * e); if (u < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function renderHome() {
    const H = homeSt(), n = project.cards.length, st = homeStep(), d = fmtDims(), a = aspect(), r = d.r == null ? 3 : d.r;
    $("#homeTitle").textContent = project.title || "Ma série";
    $("#homeState").textContent = ` · ${n} carte${n > 1 ? "s" : ""} · ${$("#formatVal").textContent}`;
    $("#homeGo").dataset.go = st; $("#homeGoT").textContent = st === "format" ? "Commencer : choisir le format" : "Reprendre : " + PAGE_TEXT[st][0];
    for (const b of $$(".jstep")) { const here = b.dataset.go === st && st !== "format"; b.classList.toggle("is-here", here); if (here) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); }
    const home = $(".home"); home.style.setProperty("--car", a.toFixed(4)); home.style.setProperty("--crad", `${(r / d.w * 100).toFixed(2)}% / ${(r / d.h * 100).toFixed(2)}%`);
    H.back = ""; H.sig = ""; homeFill(); clearInterval(H.timer); H.timer = setInterval(homeFill, 900); heroIntro();
  }
  /* fills what needs the renderer, a little at a time: the images may still be loading when the home opens */
  function homeFill() {
    const H = homeSt(); if (ui.page !== "accueil") { clearInterval(H.timer); H.timer = 0; return; } if (document.hidden) return;
    const cards = project.cards, c = curCard(); if (!c) return; let made = 0;
    for (const k of cards) if (T && !k.thumb && made < 2) { k.thumb = homeSnap(k.front); made++; }
    if (T && !H.back) H.back = homeSnap(c.back);
    heroDraw();
    const sig = cards.map(k => k.id + ":" + (k.thumb ? k.thumb.length : 0) + ":" + k.name).join("|") + "#" + project.cardIndex + "#" + H.back.length; if (sig === H.sig) { railSync(); return; } H.sig = sig;
    const i0 = project.cardIndex, at = j => cards[(i0 + j) % cards.length], bg = (el, u) => { el.style.backgroundImage = u ? `url(${u})` : ""; };
    const mid = $("#heroMid"); mid.hidden = cards.length < 2; if (cards.length > 1) bg(mid, at(1).thumb); bg($("#heroBack"), H.back);
    $$("#homeFan i").forEach((el, j) => bg(el, at(j).thumb)); $$(".jthumb").forEach(el => bg(el, at(+el.dataset.k || 0).thumb));
    const box = $("#homeCards"); box.textContent = "";
    cards.forEach((k, i) => { const b = document.createElement("button"), im = document.createElement("span"), t = document.createElement("span"); b.type = "button"; b.className = "hcard" + (i === i0 ? " is-cur" : ""); b.title = "Ouvrir « " + (k.name || "Carte " + (i + 1)) + " » dans Finitions"; im.className = "hcard__img"; bg(im, k.thumb); t.className = "hcard__t"; t.textContent = k.name || "Carte " + (i + 1); b.append(im, t); b.addEventListener("click", () => { setCard(i); setPage("atelier"); }); box.append(b); });
    railSync();
  }
  /* the Format step: the card drawn to scale with its bleed, its cut and its safe zone, and the figures a printer asks for */
  function fmtViz() {
    const box = $("#fmtViz"); if (!box) return; const d = fmtDims(), b = project.print.bleed, sf = project.print.safe, r = d.r == null ? 3 : d.r, n = v => String(+(+v).toFixed(1)).replace(".", ","), px = v => Math.round(v / 25.4 * 300);
    const m = 15, W = d.w + 2 * (b + m), H = d.h + 2 * (b + m), x0 = b + m, y0 = b + m, c = curCard(), th = c && c.thumb && c.thumb.startsWith("data:image/") ? c.thumb : "", yd = y0 + d.h + b + 7, xd = x0 + d.w + b + 7;
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gabarit de la carte à l'échelle : ${n(d.w)} par ${n(d.h)} millimètres"><defs><clipPath id="fmtClip"><rect x="${x0}" y="${y0}" width="${d.w}" height="${d.h}" rx="${r}"/></clipPath></defs>` +
      `<rect x="${x0 - b}" y="${y0 - b}" width="${d.w + 2 * b}" height="${d.h + 2 * b}" fill="var(--err)" fill-opacity=".09" stroke="var(--err)" stroke-width=".35" stroke-dasharray="1.6 1.2"/>` +
      `<rect x="${x0}" y="${y0}" width="${d.w}" height="${d.h}" rx="${r}" fill="var(--surface)"/>` + (th ? `<image href="${th}" x="${x0}" y="${y0}" width="${d.w}" height="${d.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#fmtClip)" opacity=".92"/>` : "") +
      `<rect x="${x0}" y="${y0}" width="${d.w}" height="${d.h}" rx="${r}" fill="none" stroke="currentColor" stroke-width=".5"/>` +
      `<rect x="${x0 + sf}" y="${y0 + sf}" width="${d.w - 2 * sf}" height="${d.h - 2 * sf}" rx="${Math.max(0.5, r - sf * 0.6)}" fill="none" stroke="var(--ok)" stroke-width=".4" stroke-dasharray="1.6 1.2"/>` +
      `<g stroke="currentColor" stroke-width=".3" fill="none"><path d="M${x0} ${yd}H${x0 + d.w}M${x0} ${yd - 1.6}v3.2M${x0 + d.w} ${yd - 1.6}v3.2M${xd} ${y0}V${y0 + d.h}M${xd - 1.6} ${y0}h3.2M${xd - 1.6} ${y0 + d.h}h3.2"/></g>` +
      `<text x="${x0 + d.w / 2}" y="${yd + 5.2}" text-anchor="middle">${n(d.w)} mm</text><text x="${xd + 2.4}" y="${y0 + d.h / 2}" text-anchor="middle" transform="rotate(90 ${xd + 2.4} ${y0 + d.h / 2})">${n(d.h)} mm</text></svg>`;
    $("#fmtName").textContent = project.formatId === "custom" ? "Format personnalisé" : fmt().game;
    $("#fmtFacts").innerHTML = [["Format fini", `${n(d.w)} × ${n(d.h)} mm`], ["Avec fond perdu", `${n(d.w + 2 * b)} × ${n(d.h + 2 * b)} mm`], ["Zone sûre", `${n(d.w - 2 * sf)} × ${n(d.h - 2 * sf)} mm`], ["Coins arrondis", `rayon ${n(r)} mm`], ["Image à préparer", `${px(d.w + 2 * b)} × ${px(d.h + 2 * b)} px`]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    $("#jvW").textContent = n(d.w) + " mm"; $("#jvH").textContent = n(d.h) + " mm";
  }
  /* Illustration: the other face beside the one being worked on */
  function splitDraw() {
    const cv = $("#splitCv"); if (!ui.split || ui.page !== "image" || !T || document.hidden) return; const back = ui.face !== "back"; if (back) { try { ensureBackLayer(); } catch (e) {} }
    const doc = back ? project.back : project.front, d = fmtDims(), a = aspect(), r = d.r == null ? 3 : d.r, w = 640, hh = Math.round(w / a); thumbCanvas.width = w; thumbCanvas.height = hh;
    try { T.renderDoc(doc, { pointer: [0.35, 0.7], tilt: [0, 0], aspect: a, intensity: 1, seed: ui.seed, selectedId: null, view: 0 }); } catch (e) { return; }
    if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; } cv.getContext("2d").drawImage(thumbCanvas, 0, 0, w, hh); cv.style.borderRadius = `${(r / d.w * 100).toFixed(2)}% / ${(r / d.h * 100).toFixed(2)}%`; cv.style.aspectRatio = a.toFixed(4);
    $("#splitName").textContent = back ? "Verso" : "Recto";
  }
  function splitSet(on) {
    ui.split = !!on; try { localStorage.setItem("layrys-split", on ? "1" : ""); } catch (e) {} for (const b of $$("[data-split]")) b.setAttribute("aria-pressed", String((b.dataset.split === "1") === ui.split));
    $("#splitPanel").hidden = !ui.split; $("#page-image").classList.toggle("is-split", ui.split); resize(); ui.dirty = true; splitDraw();
  }
  /* the series at the foot of the sidebar */
  function railSync() {
    const c = curCard(), t = $("#railThumb"); if (!t || !c) return; const n = project.cards.length;
    $("#railTitle").textContent = project.title || "Ma série"; $("#railMeta").textContent = `${n} carte${n > 1 ? "s" : ""} · ${$("#formatVal").textContent}`;
    if (t.offsetParent !== null && T && !c.thumb && ui.page !== "studio" && !document.hidden) c.thumb = homeSnap(c.front);
    const key = c.id + ":" + (c.thumb ? c.thumb.length : 0); if (c.thumb && t.dataset.k !== key) { t.dataset.k = key; t.style.backgroundImage = `url(${c.thumb})`; }
  }
  {
    const hero = $("#hero"), root = document.documentElement, tg = $("#railToggle"), key = "layrys-rail";
    hero.addEventListener("pointermove", e => { if (e.pointerType === "touch") return; const r = hero.getBoundingClientRect(); homeSt().intro = 0; heroAim((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
    hero.addEventListener("pointerleave", () => heroAim(0.2, 0.35));
    const lab = () => { const min = root.dataset.rail === "min"; tg.title = min ? "Déployer le menu" : "Réduire le menu"; tg.setAttribute("aria-label", tg.title); tg.setAttribute("aria-expanded", String(!min)); };
    tg.addEventListener("click", () => { if (root.dataset.rail === "min") delete root.dataset.rail; else root.dataset.rail = "min"; try { localStorage.setItem(key, root.dataset.rail || ""); } catch (e) {} lab(); resize(); ui.dirty = true; });
    lab(); railSync(); setInterval(railSync, 2500); if (ui.page === "accueil") renderHome();
    try { ui.split = localStorage.getItem("layrys-split") === "1"; } catch (e) {}
    for (const b of $$("[data-split]")) b.addEventListener("click", () => splitSet(b.dataset.split === "1"));
    const swap = () => { setFace(ui.face === "back" ? "front" : "back"); setTimeout(splitDraw, 60); }; $("#splitSwap").addEventListener("click", swap); $("#splitCv").addEventListener("click", swap);
    { const sd = $("#stageDark"), bn = $("#bench"); let dk = true; try { dk = localStorage.getItem("layrys-stage") !== "light"; } catch (e) {}
      const setDk = v => { dk = v; bn.dataset.dark = v ? "1" : "0"; sd.setAttribute("aria-pressed", String(v)); sd.title = v ? "Scène sombre : clique pour une scène claire" : "Scène claire : clique pour une scène sombre"; try { localStorage.setItem("layrys-stage", v ? "dark" : "light"); } catch (e) {} };
      sd.addEventListener("click", () => setDk(!dk)); setDk(dk); }
    setInterval(splitDraw, 500); fmtViz(); if (ui.page === "image") splitSet(ui.split);
  }
