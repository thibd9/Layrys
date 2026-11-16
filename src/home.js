
  /* ---- home and sidebar (v43) ----
     The home is the cockpit of the series: its name, where the work stands, the current card rendered live (its finishes follow the pointer),
     the five steps as one connected path, the tools, and the cards of the series. The sidebar shows the same series at its foot.
     State lives on the function (renderHome may be called while the page starts, before this module has run). */
  function homeSt() { return renderHome.st || (renderHome.st = { px: 0.2, py: 0.35, seq: 0, intro: 0, back: "", sig: "", timer: 0, raf: 0 }); }
  function homeStep() { let s = "image"; try { s = localStorage.getItem("layrys-step") || "image"; } catch (e) {} return STEPS.includes(s) ? s : "image"; }
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
    $("#homeState").textContent = `${n} carte${n > 1 ? "s" : ""} · ${$("#formatVal").textContent} · enregistré sur cet appareil`;
    $("#homeGo").dataset.go = st; $("#homeGoT").textContent = st === "image" ? "Commencer par l'illustration" : "Reprendre : " + PAGE_TEXT[st][0];
    for (const b of $$(".jstep")) { const here = b.dataset.go === st && st !== "image"; b.classList.toggle("is-here", here); if (here) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); }
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
    $$("#homeFan i").forEach((el, j) => bg(el, at(j).thumb));
    const box = $("#homeCards"); box.textContent = "";
    cards.forEach((k, i) => { const b = document.createElement("button"), im = document.createElement("span"), t = document.createElement("span"); b.type = "button"; b.className = "hcard" + (i === i0 ? " is-cur" : ""); b.title = "Ouvrir « " + (k.name || "Carte " + (i + 1)) + " » dans Finitions"; im.className = "hcard__img"; bg(im, k.thumb); t.className = "hcard__t"; t.textContent = k.name || "Carte " + (i + 1); b.append(im, t); b.addEventListener("click", () => { setCard(i); setPage("atelier"); }); box.append(b); });
    railSync();
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
  }
