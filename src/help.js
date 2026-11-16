
  /* ---- v32: size and framing of the illustration, help bubbles on the options ---- */
  function imgTarget() { const doc = curDoc(), l = sel(); if (l && l.kind === "image" && l.src && doc.layers.includes(l)) return l; const imgs = doc.layers.filter(q => q.kind === "image" && q.src); return [...imgs].reverse().find(q => q.visible) || imgs[0] || null; }
  /* scale at which the picture just fills the card and its bleed */
  function imgCover(l) { const ca = aspect(), la = l.w / l.h, d = fmtDims(), b = project.print.bleed; return Math.max((d.w + 2 * b) / d.w, (d.h + 2 * b) / d.h * la / ca); }
  function imgSync() {
    const box = $("#crImg"); if (!box) return; const l = imgTarget();
    { const d = fmtDims(), b = project.print.bleed, n = v => String(+(+v).toFixed(1)).replace(".", ","), px = v => Math.round(v / 25.4 * 300); $("#crFormat").textContent = `Ta carte fait ${n(d.w)} × ${n(d.h)} mm. Prépare l'image en ${n(d.w + 2 * b)} × ${n(d.h + 2 * b)} mm, fond perdu de ${n(b)} mm compris, soit ${px(d.w + 2 * b)} × ${px(d.h + 2 * b)} px à 300 dpi.`; } box.hidden = !l; $("#crNoArt").hidden = !!l;
    for (const b of $$("[data-imgmove]")) b.setAttribute("aria-pressed", String(!!ui.imgMove)); $("#crImgMoveNote").hidden = !ui.imgMove; if (!ui.picking && !ui.brush) $("#hint").textContent = ui.imgMove ? "Glisser pour déplacer l'image · Molette pour sa taille" : HINT; if (!l) return;
    const set = (id, v, txt) => { const el = $("#" + id); if (document.activeElement !== el) el.value = v; $("#o-" + id).value = txt; }, sg = v => (v > 0 ? "+" : "") + v + " %";
    const p = Math.round(l.scale / imgCover(l) * 100), ox = Math.round((l.x - 0.5) * 100), oy = Math.round((l.y - 0.5) * 100); set("crImgS", p, p + " %"); set("crImgX", ox, sg(ox)); set("crImgY", oy, sg(oy));
    const d = fmtDims(), b = project.print.bleed, wmm = l.scale * d.w, hmm = wmm * l.h / l.w;
    $("#crImgWarn").hidden = wmm >= d.w + 2 * b - 0.01 && hmm >= d.h + 2 * b - 0.01 && Math.abs(l.x - 0.5) * d.w <= (wmm - d.w - 2 * b) / 2 + 0.01 && Math.abs(l.y - 0.5) * d.h <= (hmm - d.h - 2 * b) / 2 + 0.01;
  }
  /* automatic centring: the picture fills the card, then slides as far as the bleed allows so that the detected subject sits in the middle */
  function imgAutoCenter(l) {
    const ca = aspect(), la = l.w / l.h, d = fmtDims(), b = project.print.bleed, sw = (d.w + 2 * b) / d.w, sh = (d.h + 2 * b) / d.h; let onSubject = false;
    l.scale = Math.max(l.scale, imgCover(l)); l.rot = 0; let u = 0.5, v = 0.5;
    try { const a = l.analysis && l.analysis.canvas2; if (a) { const W = a.width, H = a.height, px = a.getContext("2d").getImageData(0, 0, W, H).data; let n = 0, sx = 0, sy = 0; for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) if (px[(y * W + x) * 4] > 127) { n++; sx += x; sy += y; } if (n > W * H / 16 * 0.02 && n < W * H / 16 * 0.97) { u = sx / n / W; v = sy / n / H; onSubject = true; } } } catch (e) {}
    const hx = Math.max(0, (l.scale - sw) / 2), hy = Math.max(0, (l.scale * ca / la - sh) / 2);
    l.x = 0.5 + Math.max(-hx, Math.min(hx, -(u - 0.5) * l.scale)); l.y = 0.5 + Math.max(-hy, Math.min(hy, -(v - 0.5) * l.scale * ca / la));
    return onSubject && (Math.abs(l.x - 0.5) > 0.004 || Math.abs(l.y - 0.5) > 0.004);
  }
  const HELP = {
    stDur: "Durée totale de l'animation. Plus elle est longue, plus le mouvement est lent.", stZoom: "Rapproche ou éloigne la caméra. Au-delà de 100 %, la carte remplit davantage le cadre.", stCam: "Angle de la caméra : positif, elle regarde la carte d'en haut et le sol se découvre ; négatif, elle la regarde d'en bas.",
    stFxAmt: "Force commune du halo, des rayons, du bokeh, de la lueur de contour, des particules et du grain.", stSeqOn: "Compose une vidéo plus longue : chaque mouvement part de l'endroit où le précédent s'est arrêté.", stFlip: "Joue le mouvement en miroir : ce qui venait de la gauche vient de la droite.",
    crImgS: "100 % : l'image remplit la carte, fond perdu compris. En dessous, le carton apparaît sur les bords. Au-dessus, tu zoomes dans l'image.",
    crImgX: "Décale l'image vers la gauche ou la droite.", crImgY: "Décale l'image vers le haut ou le bas.",
    "cr-border": "Aucune : l'illustration va jusqu'au bord. Simple : un trait plein. Double filet : un trait épais et un fin. Ornée : filets et losanges dans les coins.",
    "cr-bw": "Largeur du trait, mesurée sur la carte imprimée. Au bord de la carte, compte au moins 2,5 mm pour que la coupe paraisse régulière.",
    "cr-pos": "Au bord : la bordure touche la découpe, comme sur une carte classique. À l'intérieur : elle flotte en retrait et l'illustration reste visible autour.",
    "cr-gap": "Distance entre le bord de la carte et la bordure. Garde au moins 3 mm : c'est la zone de sécurité de la coupe.",
    "cr-finish": "Encre : imprimée dans la couleur choisie. Dorure : film métallique pressé à chaud, qui brille quand la carte bouge. Holo : reflets arc-en-ciel. Gaufrage : dorure en relief.",
    "cr-accent": "Couleur du trait quand la finition est une encre, et couleur du sous-titre.",
    "cr-panel": "Assombrit l'image sous les textes pour qu'ils restent lisibles. Bandeau : dégradé en bas de carte. Cartouches : deux cadres, un pour le nom, un pour le texte.",
    "cr-name": "Le nom en haut de la carte. Il renomme aussi la carte dans la série.", "cr-type": "Une ligne courte sous l'illustration : classe, famille, élément.",
    "cr-effect": "Le texte de règle ou d'ambiance. Il passe à la ligne tout seul, sur 7 lignes au plus.",
    "cr-rarity": "Niveau de rareté de la carte dans la série. Il sert aussi aux taux de tirage de la page Série.", "cr-artist": "Crédit de l'illustrateur, en bas à gauche, précédé de « Illus. ».",
    "cr-showRar": "Ajoute le code de rareté (C, R, SR…) en bas à droite de la carte.", "cr-showNum": "Ajoute le numéro de la carte sur le total de la série, par exemple 004/024.",
    foil: "Force de la finition. À 0 % elle disparaît ; au-delà de 100 % elle est exagérée pour mieux la juger.",
    maskThr: "Déplace la limite de la zone : plus bas, la zone s'agrandit ; plus haut, elle se resserre.", maskSoft: "Faible : bord net. Élevé : fondu progressif entre la zone et le reste.",
    maskGrow: "Élargit ou resserre la zone autour du sujet, comme un débord ou un retrait de quelques dixièmes de millimètre.", pickTol: "Écart de couleur accepté autour de la couleur choisie.",
    wt: "Distance entre le haut de la carte et la zone.", wb: "Distance entre le bas de la carte et la zone.", wl: "Distance entre le bord gauche et la zone.", wr: "Distance entre le bord droit et la zone.",
    reliefZone: "Limite le relief à une partie de la finition : le sujet, les contours ou une zone peinte.", reliefSrc: "D'où vient le relief : du motif de la finition, de la luminosité de l'image, de ses contours, ou d'un mélange.",
    imgRelief: "Hauteur du relief tiré de l'illustration : les zones claires montent, les sombres descendent. En négatif, c'est l'inverse (débossage).",
    bump: "Profondeur du grain ou du motif gravé dans la finition.", scale: "Taille du motif. Petit : grain fin. Grand : motif large et lisible.", angle: "Fait tourner le motif : lignes, hachures, rayons.",
    glare: "Force du reflet de la lampe. Élevée, la surface paraît vernie.", sat: "Vivacité de l'arc-en-ciel du film holographique.", relief: "Accentue les ombres du relief pour le rendre plus lisible.",
    sparkle: "Quantité de points brillants qui s'allument quand la carte bouge.", bands: "Peu de bandes : larges aplats de couleur. Beaucoup : arc-en-ciel serré.",
    ink: "Laisse le film métallique apparaître sous les zones sombres de l'image. À 0 %, les encres sombres le cachent.", cavity: "Assombrit les creux fins de l'image pour donner du volume.",
    detail: "Ajoute au relief les petits détails de l'image : traits, hachures.", blur: "Lisse le relief tiré de l'image. Faible : relief nerveux. Élevé : formes douces et bombées.",
    depth: "Décale légèrement l'image quand la carte s'incline, pour un effet de profondeur.", edgeFoil: "Ajoute du métal le long des traits de l'illustration.",
    specPow: "Faible : reflet large et doux, satiné. Élevé : reflet petit et net, miroir.", lightZ: "Petite : lumière rasante qui creuse le relief. Grande : lumière large et uniforme.",
    warm: "Teinte de la lumière : chaude (dorée) ou froide (bleutée).", intensity: "Force de l'éclairage sur toute la carte.", tilt: "Angle maximal de la carte quand tu la fais pivoter à la souris.",
    pattern: "Dessin du film ou du gaufrage : lignes, mosaïque, étoiles, grain…", blend: "Comportement de la matière : film holographique, métal, vernis ou encre.", palette: "Couleurs de l'iridescence.", tint: "Couleur du métal.",
    depthSrc: "Ce qui crée la profondeur quand la carte s'incline : la luminosité de l'image ou le sujet détecté.", quality: "Baisse la qualité si l'affichage saccade ; l'export n'est pas touché.",
    flatOnly: "N'applique le motif que dans les zones unies de l'image, pas sur les détails.", marks: "Affiche le fond perdu, le trait de coupe et la zone de sécurité.",
    accentType: "Procédé ajouté par-dessus la finition du calque : dorure, vernis, encre…", accentAmt: "Force du second procédé.", accentRelief: "Relief du second procédé.", accentWithin: "Le second procédé ne sort pas de la zone de la finition principale.",
    lightSel: "Type d'éclairage qui révèle la finition. « Lampe réglable » se place à la main sur la carte.", mlP: "Force de la lampe.", mlW: "Lumière chaude (dorée) ou froide (bleutée).",
    layerX: "Position horizontale du calque. 50 % : centré.", layerY: "Position verticale du calque. 50 % : centré.", layerScale: "Taille du calque. 100 % : largeur de la carte.", layerRot: "Fait pivoter le calque.", layerOpacity: "Transparence du calque.",
    layerBlend: "Façon dont le calque se mélange à ceux du dessous.", frWidth: "Épaisseur du cadre, en pourcentage de la largeur de la carte.", frPanelA: "Opacité du fond placé derrière les textes.", txtStrokeW: "Épaisseur du contour des lettres. Un contour sombre garde le texte lisible partout.", txtSpacing: "Espace entre les lettres.",
  };
  function addHint(input, text) {
    const box = input.closest(".slider, .field, .check"); if (!box || box.querySelector(".hint")) return;
    const h = document.createElement("button"); h.type = "button"; h.className = "hint"; h.tabIndex = -1; h.textContent = "?"; h.dataset.hint = text; h.setAttribute("aria-label", "Aide"); input.setAttribute("aria-description", text);
    if (box.classList.contains("slider")) { const s = box.querySelector(":scope > span"); if (s) s.append(h); }
    else if (box.classList.contains("check")) box.append(h);
    else { const t = [...box.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!t) return; const w = document.createElement("span"); w.className = "flabel"; box.insertBefore(w, t); w.append(t, h); }
  }
  { for (const id of Object.keys(HELP)) { const el = document.getElementById(id); if (el) addHint(el, HELP[id]); }
    /* options that only had a native tooltip get the same bubble */
    for (const box of $$(".slider[title], label.field[title]")) { const el = box.querySelector("input, select, textarea"); if (el && !box.querySelector(".hint")) { addHint(el, box.title); box.removeAttribute("title"); } }
    const pop = document.createElement("div"); pop.className = "hintpop"; pop.setAttribute("role", "tooltip"); pop.hidden = true; document.body.append(pop); let cur = null;
    const open = h => { if (cur && cur !== h) cur.removeAttribute("aria-expanded"); cur = h; pop.textContent = h.dataset.hint; pop.hidden = false; const r = h.getBoundingClientRect(), w = pop.offsetWidth, ph = pop.offsetHeight; let y = r.bottom + 8; if (y + ph > innerHeight - 8) y = r.top - ph - 8; pop.style.left = Math.min(innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)) + "px"; pop.style.top = Math.max(8, y) + "px"; h.setAttribute("aria-expanded", "true"); };
    const close = () => { if (cur) cur.removeAttribute("aria-expanded"); cur = null; pop.hidden = true; };
    const hintOf = e => e.target && e.target.closest ? e.target.closest(".hint") : null;
    document.addEventListener("pointerover", e => { const h = hintOf(e); if (h) open(h); else if (cur && e.pointerType === "mouse") close(); });
    document.addEventListener("click", e => { const h = hintOf(e); if (h) { e.preventDefault(); e.stopPropagation(); open(h); } else close(); }, true);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); }); window.addEventListener("scroll", close, true);
    $("#pageNext").addEventListener("click", () => { const to = $("#pageNext").dataset.to; if (to) { setPage(to); const m = $(".main .page:not([hidden])"); if (m) m.scrollTop = 0; } });
    $("#crLib").addEventListener("click", () => $("#libOpen").click());
    /* size and place of the illustration */
    const live = fn => { const l = imgTarget(); if (!l) return; fn(l); ui.dirty = true; imgSync(); }, done = () => { invalidateThumbs(); syncInspector(); commit(); };
    $("#crImgS").addEventListener("input", e => live(l => { l.scale = imgCover(l) * e.target.value / 100; })); $("#crImgX").addEventListener("input", e => live(l => { l.x = 0.5 + e.target.value / 100; })); $("#crImgY").addEventListener("input", e => live(l => { l.y = 0.5 + e.target.value / 100; }));
    for (const id of ["crImgS", "crImgX", "crImgY"]) $("#" + id).addEventListener("change", done);
    $("#crImgAuto").addEventListener("click", () => { let on = false; live(l => { on = imgAutoCenter(l); }); done(); toast(on ? "Image centrée sur le sujet, carte entièrement couverte" : "Image centrée, carte entièrement couverte"); });
    $("#crImgCover").addEventListener("click", () => { live(l => fitLayer(l, "cover")); done(); }); $("#crImgContain").addEventListener("click", () => { live(l => fitLayer(l, "contain")); done(); });
    const mv = document.createElement("button"); mv.type = "button"; mv.className = "chip"; mv.dataset.imgmove = ""; mv.setAttribute("aria-pressed", "false"); mv.title = "Glisse l'image sur la carte pour la déplacer, molette pour changer sa taille"; mv.innerHTML = ICO("hand", true) + " Déplacer à la souris"; const fr = $("#fitRow .row"); if (fr) fr.append(mv);
    for (const b of $$("[data-imgmove]")) b.addEventListener("click", () => { ui.imgMove = !ui.imgMove; imgSync(); toast(ui.imgMove ? "Glisse l'image sur la carte, molette pour la taille. Reclique pour revenir à l'inclinaison" : "Déplacement de l'image désactivé"); });
  }
