  /* ================= Dielines (gabarits de découpe) — all dimensions in millimetres ================= */
  const DL = { cut: "#111111", bleed: "#e0115f", safe: "#1a9c4b", fold: "#2457c5", label: "#444" };
  function svgDoc(wmm, hmm, inner, title) {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${wmm}mm" height="${hmm}mm" viewBox="0 0 ${wmm} ${hmm}" font-family="Manrope, Arial, sans-serif">
<title>${title}</title>
<rect x="0" y="0" width="${wmm}" height="${hmm}" fill="#ffffff"/>
${inner}
</svg>`;
  }
  const fmtMM = v => (Math.round(v * 100) / 100).toString().replace(".", ",");
  function legend(x, y) {
    const row = (dy, col, dash, txt) => `<line x1="${x}" y1="${y + dy}" x2="${x + 10}" y2="${y + dy}" stroke="${col}" stroke-width="0.35"${dash ? ` stroke-dasharray="${dash}"` : ""}/><text x="${x + 12}" y="${y + dy + 1.1}" font-size="3" fill="${DL.label}">${txt}</text>`;
    return `<g>${row(0, DL.bleed, "", "Fond perdu (bleed) : étendre le visuel jusqu'ici")}${row(5, DL.cut, "", "Ligne de coupe (format fini)")}${row(10, DL.safe, "1.5 1", "Zone de sécurité : textes et éléments importants à l'intérieur")}${row(15, DL.fold, "2 1", "Pli / rainage")}</g>`;
  }
  function dimLabel(x1, y1, x2, y2, txt) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const vert = Math.abs(x2 - x1) < 0.01;
    return `<g stroke="${DL.label}" stroke-width="0.25"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></g><text x="${mx + (vert ? 1.5 : 0)}" y="${my + (vert ? 0 : -1)}" font-size="2.8" fill="${DL.label}" text-anchor="${vert ? "start" : "middle"}"${vert ? ` transform="rotate(90 ${mx + 1.5} ${my})"` : ""}>${txt}</text>`;
  }
  function roundedRect(x, y, w, h, r, stroke, dash, extra = "") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="${stroke}" stroke-width="0.35"${dash ? ` stroke-dasharray="${dash}"` : ""}${extra}/>`;
  }
  /* --- card: trim, bleed, safe, corner radius --- */
  function cardDieline(W, H, r, bleed, safe, opts = {}) {
    const M = 20; const wmm = W + 2 * bleed + 2 * M, hmm = H + 2 * bleed + 2 * M + 24;
    const ox = M + bleed, oy = M + bleed;
    let g = "";
    if (opts.image) g += `<image href="${opts.image}" x="${M}" y="${M}" width="${W + 2 * bleed}" height="${H + 2 * bleed}" preserveAspectRatio="none"/>`;
    g += roundedRect(M, M, W + 2 * bleed, H + 2 * bleed, r + bleed, DL.bleed, "");
    g += roundedRect(ox, oy, W, H, r, DL.cut, "");
    g += roundedRect(ox + safe, oy + safe, W - 2 * safe, H - 2 * safe, Math.max(0.5, r - safe), DL.safe, "1.5 1");
    g += dimLabel(ox, oy - 8, ox + W, oy - 8, `${fmtMM(W)} mm`) + dimLabel(ox - 8, oy, ox - 8, oy + H, `${fmtMM(H)} mm`);
    g += `<text x="${ox + W + bleed + 2}" y="${oy + 4}" font-size="2.6" fill="${DL.label}">fond perdu ${fmtMM(bleed)} mm</text><text x="${ox + W + bleed + 2}" y="${oy + 8}" font-size="2.6" fill="${DL.label}">sécurité ${fmtMM(safe)} mm</text><text x="${ox + W + bleed + 2}" y="${oy + 12}" font-size="2.6" fill="${DL.label}">angles r = ${fmtMM(r)} mm</text><text x="${ox + W + bleed + 2}" y="${oy + 16}" font-size="2.6" fill="${DL.label}">épaisseur 0,33 mm</text>`;
    g += legend(M, oy + H + bleed + 8);
    return { svg: svgDoc(wmm, hmm, g, `Plan de découpe carte ${fmtMM(W)} × ${fmtMM(H)} mm`), wmm, hmm, panels: [{ name: "recto", x: M, y: M, w: W + 2 * bleed, h: H + 2 * bleed }] };
  }
  /* --- booster: flow-wrap pouch, flat film: half back | front | half back | fin seal; crimps top and bottom --- */
  function boosterDieline(W, H, crimp, fin, bleed, safe, opts = {}) {
    const M = 20; const Wf = 2 * W + fin, Hf = H; const wmm = Wf + 2 * bleed + 2 * M + 30, hmm = Hf + 2 * bleed + 2 * M + 26;
    const ox = M + bleed, oy = M + bleed; const half = W / 2;
    const panels = [{ name: "dos gauche", x: ox, y: oy, w: half, h: Hf }, { name: "recto", x: ox + half, y: oy, w: W, h: Hf }, { name: "dos droit", x: ox + half + W, y: oy, w: half, h: Hf }, { name: "soudure", x: ox + 2 * W, y: oy, w: fin, h: Hf }];
    let g = "";
    if (opts.image) g += `<image href="${opts.image}" x="${ox + half}" y="${oy + crimp}" width="${W}" height="${Hf - 2 * crimp}" preserveAspectRatio="none"/>`;
    if (opts.back) g += `<image href="${opts.back}" x="${ox}" y="${oy + crimp}" width="${half}" height="${Hf - 2 * crimp}" preserveAspectRatio="xMaxYMid slice"/><image href="${opts.back}" x="${ox + half + W}" y="${oy + crimp}" width="${half}" height="${Hf - 2 * crimp}" preserveAspectRatio="xMinYMid slice"/>`;
    g += `<rect x="${M}" y="${M}" width="${Wf + 2 * bleed}" height="${Hf + 2 * bleed}" fill="none" stroke="${DL.bleed}" stroke-width="0.35"/>`;
    g += `<rect x="${ox}" y="${oy}" width="${Wf}" height="${Hf}" fill="none" stroke="${DL.cut}" stroke-width="0.35"/>`;
    g += `<rect x="${ox}" y="${oy}" width="${Wf}" height="${crimp}" fill="${DL.fold}" fill-opacity="0.08" stroke="none"/><rect x="${ox}" y="${oy + Hf - crimp}" width="${Wf}" height="${crimp}" fill="${DL.fold}" fill-opacity="0.08" stroke="none"/>`;
    g += `<rect x="${ox + 2 * W}" y="${oy}" width="${fin}" height="${Hf}" fill="${DL.fold}" fill-opacity="0.12" stroke="none"/>`;
    for (const x of [ox + half, ox + half + W, ox + 2 * W]) g += `<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + Hf}" stroke="${DL.fold}" stroke-width="0.35" stroke-dasharray="2 1"/>`;
    for (const y of [oy + crimp, oy + Hf - crimp]) g += `<line x1="${ox}" y1="${y}" x2="${ox + Wf}" y2="${y}" stroke="${DL.fold}" stroke-width="0.35" stroke-dasharray="2 1"/>`;
    g += `<rect x="${ox + half + safe}" y="${oy + crimp + safe}" width="${W - 2 * safe}" height="${Hf - 2 * crimp - 2 * safe}" fill="none" stroke="${DL.safe}" stroke-width="0.35" stroke-dasharray="1.5 1"/>`;
    const lab = (x, y, t) => `<text x="${x}" y="${y}" font-size="3" fill="${DL.label}" text-anchor="middle">${t}</text>`;
    g += lab(ox + half / 2, oy + Hf / 2, "dos (½)") + lab(ox + half + W / 2, oy + crimp + 6, "RECTO") + lab(ox + half + W + half / 2, oy + Hf / 2, "dos (½)") + lab(ox + 2 * W + fin / 2, oy + Hf / 2 - 4, "soudure") + lab(ox + Wf / 2, oy + crimp / 2 + 1, "sertissage haut (non imprimé)") + lab(ox + Wf / 2, oy + Hf - crimp / 2 + 1, "sertissage bas (non imprimé)");
    g += dimLabel(ox, oy - 8, ox + Wf, oy - 8, `film ${fmtMM(Wf)} mm`) + dimLabel(ox - 8, oy, ox - 8, oy + Hf, `${fmtMM(Hf)} mm`) + dimLabel(ox + half, oy + Hf + 6, ox + half + W, oy + Hf + 6, `recto ${fmtMM(W)} mm`);
    g += legend(M, oy + Hf + bleed + 12);
    return { svg: svgDoc(wmm, hmm, g, `Plan de découpe booster ${fmtMM(W)} × ${fmtMM(H)} mm`), wmm, hmm, panels };
  }
  /* --- straight tuck end box: glue | side | front | side | back ; tuck on front (top) and back (bottom); dust flaps on sides --- */
  function tuckBoxDieline(W, H, D, bleed, safe, opts = {}) {
    const glue = Math.min(15, W * 0.2), tuck = Math.min(15, D * 0.6), dust = D * 0.85; const M = 20;
    const cols = [glue, D, W, D, W]; const totalW = cols.reduce((a, b) => a + b, 0); const topH = D + tuck, botH = D + tuck;
    const wmm = totalW + 2 * bleed + 2 * M + 30, hmm = H + topH + botH + 2 * bleed + 2 * M + 26;
    const ox = M + bleed, oy = M + bleed + topH; const xs = [ox]; for (const c of cols) xs.push(xs[xs.length - 1] + c);
    const panels = [{ name: "collage", x: xs[0], y: oy, w: glue, h: H }, { name: "côté gauche", x: xs[1], y: oy, w: D, h: H }, { name: "recto", x: xs[2], y: oy, w: W, h: H }, { name: "côté droit", x: xs[3], y: oy, w: D, h: H }, { name: "dos", x: xs[4], y: oy, w: W, h: H }, { name: "dessus", x: xs[2], y: oy - D, w: W, h: D }, { name: "dessous", x: xs[4], y: oy + H, w: W, h: D }];
    let g = "";
    if (opts.image) g += `<image href="${opts.image}" x="${xs[2]}" y="${oy}" width="${W}" height="${H}" preserveAspectRatio="none"/><image href="${opts.image}" x="${xs[4]}" y="${oy}" width="${W}" height="${H}" preserveAspectRatio="none"/>`;
    if (opts.sideColor) { for (const [x, w] of [[xs[1], D], [xs[3], D]]) g += `<rect x="${x}" y="${oy}" width="${w}" height="${H}" fill="${opts.sideColor}"/>`; g += `<rect x="${xs[2]}" y="${oy - D}" width="${W}" height="${D}" fill="${opts.sideColor}"/><rect x="${xs[4]}" y="${oy + H}" width="${W}" height="${D}" fill="${opts.sideColor}"/>`; }
    if (opts.title) { g += `<text x="${xs[1] + D / 2}" y="${oy + H / 2}" font-size="${Math.min(D * 0.45, 9)}" fill="#fff" text-anchor="middle" transform="rotate(-90 ${xs[1] + D / 2} ${oy + H / 2})" font-weight="700">${opts.title}</text><text x="${xs[3] + D / 2}" y="${oy + H / 2}" font-size="${Math.min(D * 0.45, 9)}" fill="#fff" text-anchor="middle" transform="rotate(90 ${xs[3] + D / 2} ${oy + H / 2})" font-weight="700">${opts.title}</text><text x="${xs[2] + W / 2}" y="${oy - D / 2 + 2}" font-size="${Math.min(D * 0.4, 8)}" fill="#fff" text-anchor="middle" font-weight="700">${opts.title}</text>`; }
    // outline (cut) as one path
    const rT = Math.min(4, tuck * 0.5);
    const path = [
      `M ${xs[0]} ${oy + 3}`, `L ${xs[0] + 3} ${oy}`, `L ${xs[1]} ${oy}`, /* glue flap top */
      `L ${xs[1] + 2} ${oy - dust}`, `L ${xs[2] - 2} ${oy - dust}`, `L ${xs[2]} ${oy}`, /* dust flap left */
      `L ${xs[2]} ${oy - D}`, `L ${xs[2] + 2} ${oy - D - tuck + rT}`, `Q ${xs[2] + 2} ${oy - D - tuck} ${xs[2] + 2 + rT} ${oy - D - tuck}`, `L ${xs[3] - 2 - rT} ${oy - D - tuck}`, `Q ${xs[3] - 2} ${oy - D - tuck} ${xs[3] - 2} ${oy - D - tuck + rT}`, `L ${xs[3]} ${oy - D}`, `L ${xs[3]} ${oy}`, /* top tuck on front */
      `L ${xs[3] + 2} ${oy - dust}`, `L ${xs[4] - 2} ${oy - dust}`, `L ${xs[4]} ${oy}`, /* dust flap right */
      `L ${xs[5]} ${oy}`, `L ${xs[5]} ${oy + H}`, /* back panel right edge */
      `L ${xs[4]} ${oy + H}`, `L ${xs[4]} ${oy + H + D}`, `L ${xs[4] + 2} ${oy + H + D + tuck - rT}`, `Q ${xs[4] + 2} ${oy + H + D + tuck} ${xs[4] + 2 + rT} ${oy + H + D + tuck}`, `L ${xs[5] - 2 - rT} ${oy + H + D + tuck}`, `Q ${xs[5] - 2} ${oy + H + D + tuck} ${xs[5] - 2} ${oy + H + D + tuck - rT}`, `L ${xs[5]} ${oy + H + D}`, `L ${xs[5]} ${oy + H}`, /* bottom tuck on back */
      `L ${xs[4]} ${oy + H}`, `L ${xs[4] - 2} ${oy + H + dust}`, `L ${xs[3] + 2} ${oy + H + dust}`, `L ${xs[3]} ${oy + H}`, /* dust flap right bottom */
      `L ${xs[2]} ${oy + H}`, `L ${xs[2] - 2} ${oy + H + dust}`, `L ${xs[1] + 2} ${oy + H + dust}`, `L ${xs[1]} ${oy + H}`, /* dust flap left bottom */
      `L ${xs[0] + 3} ${oy + H}`, `L ${xs[0]} ${oy + H - 3}`, `Z`,
    ].join(" ");
    g += `<path d="${path}" fill="none" stroke="${DL.cut}" stroke-width="0.4" stroke-linejoin="round"/>`;
    // bleed outline (offset) approximated as rectangle around whole dieline
    g += `<rect x="${M}" y="${M}" width="${totalW + 2 * bleed}" height="${H + topH + botH + 2 * bleed}" fill="none" stroke="${DL.bleed}" stroke-width="0.3" stroke-dasharray="3 1.5"/>`;
    // folds
    for (let i = 1; i < 5; i++) g += `<line x1="${xs[i]}" y1="${oy}" x2="${xs[i]}" y2="${oy + H}" stroke="${DL.fold}" stroke-width="0.35" stroke-dasharray="2 1"/>`;
    g += `<line x1="${xs[1]}" y1="${oy}" x2="${xs[5]}" y2="${oy}" stroke="${DL.fold}" stroke-width="0.35" stroke-dasharray="2 1"/><line x1="${xs[1]}" y1="${oy + H}" x2="${xs[5]}" y2="${oy + H}" stroke="${DL.fold}" stroke-width="0.35" stroke-dasharray="2 1"/>`;
    g += `<line x1="${xs[2]}" y1="${oy - D}" x2="${xs[3]}" y2="${oy - D}" stroke="${DL.fold}" stroke-width="0.35" stroke-dasharray="2 1"/><line x1="${xs[4]}" y1="${oy + H + D}" x2="${xs[5]}" y2="${oy + H + D}" stroke="${DL.fold}" stroke-width="0.35" stroke-dasharray="2 1"/>`;
    // safe areas on printed panels
    for (const pn of panels.filter(p => p.name !== "collage")) g += `<rect x="${pn.x + safe}" y="${pn.y + safe}" width="${pn.w - 2 * safe}" height="${pn.h - 2 * safe}" fill="none" stroke="${DL.safe}" stroke-width="0.3" stroke-dasharray="1.5 1"/>`;
    const lab = (x, y, t) => `<text x="${x}" y="${y}" font-size="3" fill="${DL.label}" text-anchor="middle">${t}</text>`;
    for (const pn of panels) lab(pn.x + pn.w / 2, pn.y + pn.h / 2, pn.name) && (g += lab(pn.x + pn.w / 2, pn.y + pn.h / 2 + 1, pn.name.toUpperCase()));
    g += lab(xs[2] + W / 2, oy - D - tuck / 2 + 1, "languette") + lab(xs[4] + W / 2, oy + H + D + tuck / 2 + 1, "languette");
    g += dimLabel(xs[2], oy - D - tuck - 6, xs[3], oy - D - tuck - 6, `L ${fmtMM(W)} mm`) + dimLabel(xs[1], oy - D - tuck - 11, xs[2], oy - D - tuck - 11, `P ${fmtMM(D)} mm`) + dimLabel(xs[5] + 6, oy, xs[5] + 6, oy + H, `H ${fmtMM(H)} mm`);
    g += legend(M, oy + H + botH + bleed + 10);
    return { svg: svgDoc(wmm, hmm, g, `Plan de découpe boîte à rabats ${fmtMM(W)} × ${fmtMM(H)} × ${fmtMM(D)} mm`), wmm, hmm, panels };
  }
