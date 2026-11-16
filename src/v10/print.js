  /* ================= Print export: artwork with bleed, process masks, flat packaging, zip ================= */
  const MM_PER_IN = 25.4;
  function pxOf(mm, dpi) { return Math.round(mm / MM_PER_IN * dpi); }
  function renderDocMM(doc, wmm, hmm, bleed, dpi, o) {
    if (!T) return null; const cw = pxOf(wmm + 2 * bleed, dpi), ch = pxOf(hmm + 2 * bleed, dpi);
    thumbCanvas.width = cw; thumbCanvas.height = ch;
    const bx = bleed / (wmm + 2 * bleed), by = bleed / (hmm + 2 * bleed);
    T.renderDoc(doc, { pointer: [0.5, 0.5], tilt: [0, 0], aspect: (wmm + 2 * bleed) / (hmm + 2 * bleed), intensity: 1, seed: ui.seed, selectedId: null, view: 0, bleed: [bx, by], noCoat: true, ...o });
    const [c, x] = cv(cw, ch); x.drawImage(thumbCanvas, 0, 0); return c;
  }
  function artworkCanvas(doc, wmm, hmm, bleed, dpi) { return renderDocMM(doc, wmm, hmm, bleed, dpi, { view: 1, viewAll: true }); }
  function processOf(layer) { const p = PRESET_BY_ID[layer.presetId]; return p ? p.cat : "none"; }
  function processMaskCanvas(doc, proc, wmm, hmm, bleed, dpi) {
    const main = doc.layers.filter(l => l.visible && l.src && processOf(l) === proc && !(PRESET_BY_ID[l.presetId]?.id === "i-none")).map(l => l.id);
    const acc = doc.layers.filter(l => l.visible && l.src && l.fx.accent && ACCENT_PROCESS(l.fx.accentType) === proc).map(l => l.id);
    if (!main.length && !acc.length) return null;
    const black = [0, 0, 0]; let out = null;
    if (main.length) out = renderDocMM(doc, wmm, hmm, bleed, dpi, { view: 9, viewAll: true, only: main, clearColor: black, blendOverride: "add" });
    if (acc.length) { const a = renderDocMM(doc, wmm, hmm, bleed, dpi, { view: 10, viewAll: true, only: acc, clearColor: black, blendOverride: "add" }); if (!out) out = a; else { const x = out.getContext("2d"); x.globalCompositeOperation = "lighter"; x.drawImage(a, 0, 0); } }
    const x = out.getContext("2d"); const d = x.getImageData(0, 0, out.width, out.height); const p = d.data;
    for (let i = 0; i < p.length; i += 4) { const v = Math.max(p[i], p[i+1], p[i+2]); p[i] = p[i+1] = p[i+2] = v; p[i+3] = 255; } x.putImageData(d, 0, 0);
    return out;
  }
  function flatBoosterCanvas(front, back, W, H, crimp, fin, bleed, dpi, baseColor) {
    const Wf = 2 * W + fin; const [c, x] = cv(pxOf(Wf + 2 * bleed, dpi), pxOf(H + 2 * bleed, dpi)); const s = dpi / MM_PER_IN;
    x.fillStyle = baseColor; x.fillRect(0, 0, c.width, c.height);
    const half = W / 2; const ox = bleed, oy = bleed;
    if (back) { x.save(); x.beginPath(); x.rect(ox * s, (oy + crimp) * s, half * s, (H - 2 * crimp) * s); x.clip(); x.drawImage(back, (ox - half) * s, (oy + crimp) * s, W * s, (H - 2 * crimp) * s); x.restore(); x.save(); x.beginPath(); x.rect((ox + half + W) * s, (oy + crimp) * s, half * s, (H - 2 * crimp) * s); x.clip(); x.drawImage(back, (ox + half + W) * s, (oy + crimp) * s, W * s, (H - 2 * crimp) * s); x.restore(); }
    if (front) x.drawImage(front, (ox + half) * s, (oy + crimp) * s, W * s, (H - 2 * crimp) * s);
    x.fillStyle = "rgba(255,255,255,0.08)"; x.fillRect(0, 0, c.width, (oy + crimp) * s); x.fillRect(0, (oy + H - crimp) * s, c.width, c.height - (oy + H - crimp) * s);
    return c;
  }
  function flatBoxCanvas(front, W, H, D, bleed, dpi, color, title) {
    const glue = Math.min(15, W * 0.2), tuck = Math.min(15, D * 0.6); const cols = [glue, D, W, D, W]; const totalW = cols.reduce((a, b) => a + b, 0); const topH = D + tuck, botH = D + tuck;
    const s = dpi / MM_PER_IN; const [c, x] = cv(pxOf(totalW + 2 * bleed, dpi), pxOf(H + topH + botH + 2 * bleed, dpi));
    x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    const xs = [bleed]; for (const w of cols) xs.push(xs[xs.length - 1] + w); const oy = bleed + topH;
    if (front) { x.drawImage(front, xs[2] * s, oy * s, W * s, H * s); x.drawImage(front, xs[4] * s, oy * s, W * s, H * s); }
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = `700 ${Math.min(D * 0.4, 9) * s}px Unbounded, Arial, sans-serif`;
    for (const [px, rot] of [[xs[1] + D / 2, -Math.PI / 2], [xs[3] + D / 2, Math.PI / 2]]) { x.save(); x.translate(px * s, (oy + H / 2) * s); x.rotate(rot); x.fillText(title, 0, 0); x.restore(); }
    x.fillText(title, (xs[2] + W / 2) * s, (oy - D / 2) * s); x.fillText(title, (xs[4] + W / 2) * s, (oy + H + D / 2) * s);
    return c;
  }
  /* ---- local uncompressed zip (no external library), ported from the Prisme reference ---- */
  const utf8 = new TextEncoder();
  const crcTable = Array.from({ length: 256 }, (_, v) => { for (let i = 0; i < 8; i++) v = (v & 1) ? (0xedb88320 ^ (v >>> 1)) : (v >>> 1); return v >>> 0; });
  function crc32(data) { let n = -1; for (const v of data) n = crcTable[(n ^ v) & 255] ^ (n >>> 8); return (n ^ -1) >>> 0; }
  const zipWords = arr => { const b = new Uint8Array(arr.reduce((n, [w]) => n + w, 0)), d = new DataView(b.buffer); let p = 0; for (const [w, v] of arr) { if (w === 2) d.setUint16(p, v, true); else d.setUint32(p, v, true); p += w; } return b; };
  function makeZip(files) {
    const local = [], index = []; let offset = 0, indexBytes = 0;
    const now = new Date(), date = (Math.max(0, now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate(), time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    for (const [file, body] of files) {
      const name = utf8.encode(file), data = typeof body === "string" ? utf8.encode(body) : body, check = crc32(data), n = data.length;
      const common = [[2, 20], [2, 2048], [2, 0], [2, time], [2, date], [4, check], [4, n], [4, n], [2, name.length], [2, 0]];
      const a = zipWords([[4, 0x04034b50], ...common]); local.push(a, name, data);
      const c = zipWords([[4, 0x02014b50], [2, 20], ...common, [2, 0], [2, 0], [2, 0], [4, 0], [4, offset]]); index.push(c, name); indexBytes += c.length + name.length; offset += a.length + name.length + n;
    }
    return new Blob([...local, ...index, zipWords([[4, 0x06054b50], [2, 0], [2, 0], [2, files.length], [2, files.length], [4, indexBytes], [4, offset], [2, 0]])], { type: "application/zip" });
  }
  const bytesOf = async blob => new Uint8Array(await blob.arrayBuffer());
  const toBlob = (c, type = "image/png", q) => new Promise(res => c.toBlob(res, type, q));
  function slugFor(face) { const d = fmtDims(); return `PRISME · ${fmt().game} · ${face} · ${d.w} × ${d.h} mm · fond perdu ${project.print.bleed} mm · ${project.print.dpi} dpi · carton 0,33 mm · ${new Date().toLocaleDateString("fr-FR")}`; }
  /* print-ready PDF: one page per face (colour) and per process plate (grey), TrimBox and BleedBox set, vector marks in CMYK */
  async function buildPrintPdf() {
    const d = fmtDims(); const bleed = project.print.bleed, dpi = project.print.dpi; const pages = []; const procLabel = { varnish: "vernis", foil: "dorure", holo: "holographique", emboss: "embossage", ink: "encre speciale" };
    for (const [face, doc] of [["recto", project.front], ["verso", project.back]]) {
      if (!doc.layers.some(l => l.visible && l.src)) continue;
      const art = artworkCanvas(doc, d.w, d.h, bleed, dpi); if (art) pages.push({ g: sheetGeom(d.w, d.h, bleed), image: await canvasToPdfImage(art, false), slug: slugFor(face) + " · couleur" });
      const procs = new Set(); for (const l of doc.layers) { if (!l.visible) continue; const prc = processOf(l); if (prc !== "none" && l.presetId !== "i-none") procs.add(prc); if (l.fx.accent) { const ap = ACCENT_PROCESS(l.fx.accentType); if (ap !== "none") procs.add(ap); } }
      for (const prc of procs) { const m = processMaskCanvas(doc, prc, d.w, d.h, bleed, dpi); if (m) pages.push({ g: sheetGeom(d.w, d.h, bleed), image: await canvasToPdfImage(m, true), slug: slugFor(face) + " · masque " + procLabel[prc] + " (blanc = procede)" }); }
    }
    if (!pages.length) throw new Error("aucun visuel");
    return buildPdf(pages, { title: `Prisme · ${fmt().game} · ${d.w} × ${d.h} mm` });
  }
  async function exportPdf() { if (!T) { toast("WebGL indisponible"); return; } toast("Préparation du PDF…"); const blob = await buildPrintPdf(); await saveFile("prisme-carte_pret-a-imprimer.pdf", blob); toast("PDF prêt : traits de coupe, repères, fond perdu, barres de contrôle"); }
  async function exportPrintFiles() {
    if (!T) { toast("WebGL indisponible"); return; }
    toast("Préparation des fichiers d'impression…");
    const d = fmtDims(); const bleed = project.print.bleed, safe = project.print.safe, dpi = project.print.dpi; const files = [];
    const lines = [`PRISME · FICHE TECHNIQUE`, ``, `Format : ${fmt().game} · ${d.w} × ${d.h} mm · angles r = ${d.r} mm`, `Fond perdu : ${bleed} mm de chaque côté (fichiers ${d.w + 2 * bleed} × ${d.h + 2 * bleed} mm)`, `Zone de sécurité : ${safe} mm à l'intérieur de la coupe`, `Résolution des visuels : ${dpi} dpi · profil cible CMJN (conversion chez l'imprimeur)`, `Support : carton ${project.print.core} 300 g/m², épaisseur 0,33 mm`, `Laminage : ${({ gloss: "brillant", satin: "satiné", matte: "mat", none: "sans vernis machine" })[project.coatKind]}`, `Tranche : ${project.edge ? ({ gold: "dorée", silver: "argentée", black: "noire", red: "rouge" })[project.edge] : "non teintée"}`, ``];
    const procLabel = { varnish: "vernis", foil: "dorure", holo: "holographique", emboss: "embossage", ink: "encre speciale" };
    for (const [face, doc] of [["recto", project.front], ["verso", project.back]]) {
      if (!doc.layers.some(l => l.visible && l.src)) continue;
      const art = artworkCanvas(doc, d.w, d.h, bleed, dpi); if (art) { files.push([`${face}/${face}_visuel_${dpi}dpi_fond-perdu.png`, await bytesOf(await toBlob(art))]); files.push([`${face}/${face}_visuel_${dpi}dpi_reperes.png`, await bytesOf(await toBlob(markedSheet(art, d.w, d.h, bleed, dpi, slugFor(face))))]); }
      lines.push(`${face.toUpperCase()}`);
      const procs = new Set(); for (const l of doc.layers) { if (!l.visible) continue; const pr = processOf(l); if (pr !== "none" && l.presetId !== "i-none") procs.add(pr); if (l.fx.accent) { const ap = ACCENT_PROCESS(l.fx.accentType); if (ap !== "none") procs.add(ap); } }
      for (const pr of procs) { const m = processMaskCanvas(doc, pr, d.w, d.h, bleed, dpi); if (m) files.push([`${face}/${face}_masque_${procLabel[pr]}.png`, await bytesOf(await toBlob(m))]); }
      for (const l of doc.layers) { if (!l.visible) continue; const p = PRESET_BY_ID[l.presetId]; lines.push(`  - calque « ${l.name} » (${KIND_LABEL[l.kind]}) : ${p ? CAT_LABEL[p.cat] + " · " + p.label : "sans finition"} · zone : ${MASK_LABEL[l.fx.mask] || l.fx.mask}${l.fx.accent ? ` · accent : ${ACCENTS.find(a => a.type === l.fx.accentType)?.label} sur ${MASK_LABEL[l.fx.accentMask]}` : ""}`); }
      lines.push(`  Masques : blanc = application du procédé, noir = rien. Un fichier par procédé (${[...procs].map(p => procLabel[p]).join(", ") || "aucun"}).`, ``);
    }
    const pdf = await buildPrintPdf(); files.push(["carte_pret-a-imprimer.pdf", await bytesOf(pdf)]);
    const cardDL = cardDieline(d.w, d.h, d.r, bleed, safe); files.push(["plans/plan-de-decoupe_carte.svg", cardDL.svg]);
    const pk = project.pack; const frontArt = artworkCanvas(project.front, d.w, d.h, 0, 150); const backArt = project.back.layers.some(l => l.visible && l.src) ? artworkCanvas(project.back, d.w, d.h, 0, 150) : null;
    const bW = pk.boosterW, bH = pk.boosterH, crimp = pk.crimp, fin = pk.fin;
    files.push(["plans/plan-de-decoupe_booster.svg", boosterDieline(bW, bH, crimp, fin, bleed, safe).svg]);
    const bf = flatBoosterCanvas(frontArt, backArt, bW, bH, crimp, fin, bleed, 150, pk.boxColor); files.push(["plans/maquette-a-plat_booster_150dpi.png", await bytesOf(await toBlob(bf))]);
    const [W, H, D] = boxDims(pk.packs); files.push(["plans/plan-de-decoupe_display.svg", tuckBoxDieline(W, H, D, bleed, safe).svg]);
    const bx = flatBoxCanvas(frontArt, W, H, D, bleed, 150, pk.boxColor, pk.title); files.push(["plans/maquette-a-plat_display_150dpi.png", await bytesOf(await toBlob(bx, "image/jpeg", 0.9))]);
    lines.push(`PACKAGING`, `  Booster (sachet soudé) : face ${bW} × ${bH} mm, sertissages ${crimp} mm haut et bas, soudure dorsale ${fin} mm, film à plat ${2 * bW + fin} × ${bH} mm`, `  Display : boîte à rabats ${W} × ${H} × ${D} mm pour ${pk.packs} boosters de ${pk.cards} cartes (gabarit straight tuck end, collage ${Math.min(15, W * 0.2)} mm)`, ``, `Plans : trait continu noir = coupe, pointillé bleu = pli, magenta = fond perdu, vert = sécurité. Fichiers SVG à l'échelle 1:1 en millimètres.`, ``, `PDF prêt à imprimer : une page couleur par face et une page par masque de procédé, boîtes TrimBox (format fini) et BleedBox (fond perdu), traits de coupe, repères de montage, barres de contrôle CMJN, ligne de marquage.`, `Fichiers « _reperes.png » : mêmes visuels avec traits de coupe et repères, pour contrôle à l'écran.`, ``, `Note : les rendus holographiques de l'application sont des simulations ; seuls les visuels, masques et PDF de ce dossier sont destinés à l'imprimeur.`);
    files.unshift(["fiche-technique.txt", lines.join("\r\n")]);
    const blob = makeZip(files); await saveFile("prisme-fichiers-impression.zip", blob); toast("Fichiers d'impression prêts");
  }
