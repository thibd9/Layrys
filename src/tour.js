
  /* ---- v36: guided tour. A small guide stays in the corner and walks through the making of a card, step by step.
     Nothing is blocked: the app stays usable under the highlight, and the guide notices when the step is done. ---- */
  const tourMain = () => { const imgs = project.front.layers.filter(l => l.kind === "image" && l.src); return [...imgs].reverse().find(l => l.visible) || imgs[0] || null; };
  const TOUR = [
    { page: "accueil", title: "Bienvenue dans Layrys", text: "Je te guide pour fabriquer ta première carte, de l'image au fichier d'impression. Tu peux manipuler l'app pendant que je t'explique, et quitter quand tu veux." },
    { page: "format", target: "#formats", title: "Choisis le format", text: "Tout part de là : la taille de la carte et son carton. Prends le jeu le plus proche du tien, tu pourras en changer plus tard." },
    { page: "image", target: "#imgGrid", title: "Choisis ton illustration", text: "C'est l'image de ta carte. Clique sur un exemple, ou importe ta propre image avec le bouton au-dessus.", todo: "Clique sur une image",
      start: s => { const l = tourMain(); s.v = l ? l.src : null; }, done: s => { const l = tourMain(); return !!l && l.src !== s.v; } },
    { page: "image", target: "#card", title: "Cadre l'image", text: "Glisse l'image sur la carte pour la placer. La molette l'agrandit ou la réduit. Elle doit couvrir toute la carte, bords compris.", todo: "Déplace ou redimensionne l'image",
      start: s => { const l = tourMain(); s.v = l ? [l.x, l.y, l.scale].join() : ""; }, done: s => { const l = tourMain(); return !!l && [l.x, l.y, l.scale].join() !== s.v; } },
    { page: "atelier", tab: "fx", target: "#effects", title: "Pose une finition", text: "Une finition, c'est l'effet d'impression : holo, dorure, vernis, relief. Survole une vignette pour la voir sur la carte, clique pour l'appliquer.", todo: "Clique sur une finition",
      start: s => { const l = sel(); s.v = l ? l.presetId : ""; }, done: s => { const l = sel(); return !!l && l.presetId !== s.v; } },
    { page: "atelier", tab: "zone", target: "#zones", title: "Choisis où elle va", text: "Une finition ne couvre pas forcément toute la carte. Indique sa zone : partout, le sujet, les contours. Cette zone devient le masque envoyé à l'imprimeur.", todo: "Clique sur une zone",
      start: s => { const l = sel(); s.v = l ? l.fx.mask + ":" + l.fx.maskInvert : ""; }, done: s => { const l = sel(); return !!l && l.fx.mask + ":" + l.fx.maskInvert !== s.v; } },
    { page: "atelier", target: "#card", title: "Regarde le reflet", text: "Fais glisser la carte pour l'incliner : la finition réagit à la lumière comme sur une vraie carte. Le bouton « Miroiter » le fait pour toi.", todo: "Incline la carte",
      start: s => { s.v = false; }, done: s => { if (!s.v) { const a = parseFloat(getComputedStyle(tiltEl).getPropertyValue("--rotate-x")) || 0, b = parseFloat(getComputedStyle(tiltEl).getPropertyValue("--rotate-y")) || 0; if (Math.abs(a) + Math.abs(b) > 2) s.v = true; } return s.v; } },
    { page: "atelier", target: "#stack", title: "Superpose plusieurs finitions", text: "Chaque finition est un calque, avec la vignette de son masque. « Ajouter un masque » en pose une autre par-dessus, par exemple un vernis brillant sur le sujet." },
    { page: "serie", title: "Construis ta série", text: "Ajoute les autres cartes, donne-leur une rareté, décline une même carte en plusieurs versions. Chaque carte garde ses propres finitions." },
    { page: "plans", target: "#exportBtn", title: "Prépare l'impression", text: "Cette page réunit le plan de découpe et le contrôle avant impression. Le bouton « Exporter » donne le dossier pour l'imprimeur : visuels, masques de finition, plans." },
    { page: "maquettes", target: "#mkStage", title: "Vois-la en volume", text: "Booster, slab gradé, cadre, classeur : choisis un support dans la barre du haut, puis fais-le tourner à la souris." },
    { page: "accueil", title: "Tu connais le parcours", text: "Ton travail est enregistré sur cet appareil. Si ton illustration n'a ni cadre ni nom, l'option « Cadre et texte » du menu en ajoute. Tu peux relancer ce guide à tout moment depuis le menu." },
  ];
  const tour = { i: -1, st: {}, timer: 0, el: null };
  function tourBuild() {
    if (tour.el) return; const el = document.createElement("div"); el.className = "tour"; el.hidden = true;
    el.innerHTML = '<div class="tour__ring" hidden></div><section class="tour__card" role="dialog" aria-label="Guide pas à pas" aria-live="polite"><header class="tour__head"><span class="tour__av"></span><div><span class="tour__count"></span><b class="tour__title"></b></div><button type="button" class="tour__x" title="Quitter le guide" aria-label="Quitter le guide">' + ICO("close", 1) + '</button></header><p class="tour__text"></p><p class="tour__todo" hidden></p><div class="tour__bar"><i></i></div><footer class="tour__foot"><button type="button" class="link-btn tour__prev">Précédent</button><button type="button" class="btn primary small tour__next">Suivant</button></footer></section>';
    document.body.append(el); tour.el = el; const logo = document.querySelector(".brand .brand__mark"); if (logo) { const av = el.querySelector(".tour__av"); av.classList.add("guideav"); av.append(logo.cloneNode(true)); }
    el.querySelector(".tour__x").addEventListener("click", () => tourEnd(false)); el.querySelector(".tour__prev").addEventListener("click", () => tourGo(tour.i - 1)); el.querySelector(".tour__next").addEventListener("click", () => { if (tour.i >= TOUR.length - 1) tourEnd(true); else tourGo(tour.i + 1); });
  }
  function tourTick() {
    if (tour.i < 0) return; const s = TOUR[tour.i], el = tour.el, ring = el.querySelector(".tour__ring"); const t = s.target ? document.querySelector(s.target) : null; const r = t && ui.page === s.page ? t.getBoundingClientRect() : null;
    if (r && r.width > 4 && r.height > 4) { const p = 7; ring.hidden = false; ring.style.left = Math.max(2, r.left - p) + "px"; ring.style.top = Math.max(2, r.top - p) + "px"; ring.style.width = Math.min(innerWidth - 4, r.width + 2 * p) + "px"; ring.style.height = Math.min(innerHeight - 4, r.height + 2 * p) + "px"; } else ring.hidden = true;
    if (s.done) { let ok = false; try { ok = !!s.done(tour.st); } catch (e) {} const td = el.querySelector(".tour__todo"); if (ok !== tour.ok) { tour.ok = ok; td.classList.toggle("is-done", ok); td.innerHTML = ICO(ok ? "check" : "right", 1) + "<span></span>"; td.lastChild.textContent = ok ? "C'est fait. Tu peux passer à la suite." : "À toi : " + s.todo; el.querySelector(".tour__next").classList.toggle("is-ready", ok); } }
  }
  function tourGo(i) {
    tourBuild(); i = Math.max(0, Math.min(TOUR.length - 1, i)); tour.i = i; tour.st = {}; tour.ok = null; const s = TOUR[i], el = tour.el; el.hidden = false;
    if (ui.page !== s.page) { setPage(s.page); const m = $(".main .page:not([hidden])"); if (m) m.scrollTop = 0; } if (s.tab) setTab(s.tab); if (s.start) { try { s.start(tour.st); } catch (e) {} }
    el.querySelector(".tour__count").textContent = "Étape " + (i + 1) + " sur " + TOUR.length; el.querySelector(".tour__title").textContent = s.title; el.querySelector(".tour__text").textContent = s.text;
    const td = el.querySelector(".tour__todo"); td.hidden = !s.done; td.textContent = ""; el.querySelector(".tour__bar i").style.width = ((i + 1) / TOUR.length * 100) + "%";
    el.querySelector(".tour__prev").hidden = i === 0; const nx = el.querySelector(".tour__next"); nx.textContent = i === 0 ? "C'est parti" : i === TOUR.length - 1 ? "Terminer" : "Suivant"; nx.classList.toggle("is-ready", !s.done);
    const t = s.target ? document.querySelector(s.target) : null; if (t && t.scrollIntoView) { const q = t.getBoundingClientRect(); if (q.width > 0 && (q.top < 56 || q.top > innerHeight - 140)) { try { t.scrollIntoView({ block: q.height < innerHeight * 0.6 ? "center" : "start" }); } catch (e) {} } }
    clearInterval(tour.timer); tour.timer = setInterval(tourTick, 220); setTimeout(tourTick, 30); document.documentElement.classList.add("touring");
  }
  function tourStart() { closeMenus(); tourGo(0); }
  function tourEnd(finished) { clearInterval(tour.timer); tour.i = -1; if (tour.el) tour.el.hidden = true; document.documentElement.classList.remove("touring"); try { localStorage.setItem("layrys-tour", "done"); } catch (e) {} if (finished) toast("Guide terminé. À toi de jouer"); }
  { for (const b of $$("[data-tour]")) b.addEventListener("click", tourStart);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && tour.i >= 0 && $("#maskEditor").hidden && !/input|textarea|select/i.test((document.activeElement && document.activeElement.tagName) || "")) tourEnd(false); });
    window.addEventListener("resize", () => tourTick());
    if (window.Layrys) { window.Layrys.tourStart = tourStart; window.Layrys.tourGo = tourGo; window.Layrys.tourState = () => ({ i: tour.i, ok: tour.ok }); }
    /* the help menu offers the guide and the reference page */
    const hp = $("#helpPop"); if (hp) { const row = document.createElement("div"); row.className = "row"; const a = document.createElement("button"); a.type = "button"; a.className = "btn small"; a.innerHTML = ICO("book", 1) + " Lancer le guide pas à pas"; a.addEventListener("click", tourStart); const b = document.createElement("button"); b.type = "button"; b.className = "link-btn"; b.textContent = "Comprendre une carte"; b.addEventListener("click", () => { closeMenus(); setPage("guide"); }); row.append(a, b); hp.prepend(row); }
  }
