  /* ================= Print marks and a minimal PDF writer (JPEG and Flate images, vector marks in CMYK, Helvetica slug) ================= */
  const PT = 72 / 25.4;
  const MARK_M = 10;                      // margin around the bleed box for crop marks, registration and colour bars (mm)
  const pdfEscape = s => s.replace(/[\\()]/g, m => "\\" + m);
  const latin1 = s => { let out = ""; for (const ch of s) { const c = ch.charCodeAt(0); out += c < 256 ? ch : "?"; } return out; };
  async function deflateBytes(bytes) { if (typeof CompressionStream === "undefined") return null; try { const cs = new CompressionStream("deflate"); const w = cs.writable.getWriter(); w.write(bytes); w.close(); return new Uint8Array(await new Response(cs.readable).arrayBuffer()); } catch (e) { return null; } }
  const COLOR_BAR = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [1, 1, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [1, 1, 1, 0], [0, 0, 0, .75], [0, 0, 0, .5], [0, 0, 0, .25], [0, 0, 0, 0]];
  const cmykRgb = ([c, m, y, k]) => `rgb(${Math.round(255 * (1 - c) * (1 - k))},${Math.round(255 * (1 - m) * (1 - k))},${Math.round(255 * (1 - y) * (1 - k))})`;
  /* geometry of a marked sheet: trim w×h with bleed b, page = bleed box + MARK_M on each side */
  function sheetGeom(w, h, b) { const M = MARK_M; return { M, pw: w + 2 * b + 2 * M, ph: h + 2 * b + 2 * M, bx: M, by: M, bw: w + 2 * b, bh: h + 2 * b, tx: M + b, ty: M + b, tw: w, th: h, b }; }
  /* raster version of the marks (for PNG exports) */
  function drawMarksCanvas(x, g, s, slug, opts = {}) {
    const { tx, ty, tw, th, b, bx, by, bw, bh } = g; const off = b + 1, len = 5; const lw = Math.max(1, 0.2 * s);
    x.save(); x.lineWidth = lw; x.strokeStyle = opts.dark ? "#fff" : "#000"; x.fillStyle = x.strokeStyle;
    const seg = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1 * s, y1 * s); x.lineTo(x2 * s, y2 * s); x.stroke(); };
    for (const [cx, dirx] of [[tx, -1], [tx + tw, 1]]) for (const [cy, diry] of [[ty, -1], [ty + th, 1]]) { seg(cx + dirx * off, cy, cx + dirx * (off + len), cy); seg(cx, cy + diry * off, cx, cy + diry * (off + len)); }
    const reg = (cx, cy) => { x.beginPath(); x.arc(cx * s, cy * s, 1.6 * s, 0, Math.PI * 2); x.stroke(); seg(cx - 2.6, cy, cx + 2.6, cy); seg(cx, cy - 2.6, cx, cy + 2.6); x.beginPath(); x.arc(cx * s, cy * s, 0.35 * s, 0, Math.PI * 2); x.fill(); };
    reg(tx + tw / 2, by - 5); reg(tx + tw / 2, by + bh + 5); reg(bx - 5, ty + th / 2); reg(bx + bw + 5, ty + th / 2);
    if (!opts.noBars) { const sq = 4; const total = COLOR_BAR.length * sq; let cx0 = tx + tw / 2 - total / 2; const cy0 = by + bh + 2.2; if (cx0 < bx) cx0 = bx; COLOR_BAR.forEach((c, i) => { x.fillStyle = cmykRgb(c); x.fillRect((cx0 + i * sq) * s, cy0 * s, sq * s, sq * s); x.strokeStyle = "#000"; x.lineWidth = Math.max(0.5, 0.1 * s); x.strokeRect((cx0 + i * sq) * s, cy0 * s, sq * s, sq * s); }); }
    x.fillStyle = opts.dark ? "#fff" : "#000"; x.font = `${Math.max(6, 2.3 * s)}px Inter, Helvetica, Arial, sans-serif`; x.textBaseline = "alphabetic";
    if (slug) x.fillText(slug, bx * s, (by - 4) * s);
    if (opts.guides) { x.setLineDash([3 * s / 4, 2 * s / 4]); x.lineWidth = Math.max(1, 0.15 * s); x.strokeStyle = "#e0115f"; x.strokeRect(bx * s, by * s, bw * s, bh * s); x.strokeStyle = opts.dark ? "#fff" : "#000"; x.strokeRect(tx * s, ty * s, tw * s, th * s); if (opts.safe) { x.strokeStyle = "#1a9c4b"; x.strokeRect((tx + opts.safe) * s, (ty + opts.safe) * s, (tw - 2 * opts.safe) * s, (th - 2 * opts.safe) * s); } x.setLineDash([]); }
    x.restore();
  }
  /* PDF vector marks in mm (y down); converted to PDF space (y up) */
  function marksOps(g, dark) {
    const { tx, ty, tw, th, b, bx, by, bw, bh, ph } = g; const off = b + 1, len = 5; const Y = y => ((ph - y) * PT).toFixed(3), X = x => (x * PT).toFixed(3);
    let o = `q ${dark ? "1 G 1 g" : "0 0 0 1 K 0 0 0 1 k"} ${(0.2 * PT).toFixed(3)} w\n`;
    const seg = (x1, y1, x2, y2) => { o += `${X(x1)} ${Y(y1)} m ${X(x2)} ${Y(y2)} l S\n`; };
    for (const [cx, dirx] of [[tx, -1], [tx + tw, 1]]) for (const [cy, diry] of [[ty, -1], [ty + th, 1]]) { seg(cx + dirx * off, cy, cx + dirx * (off + len), cy); seg(cx, cy + diry * off, cx, cy + diry * (off + len)); }
    const circle = (cx, cy, r) => { const k = 0.5523 * r; const p = (x, y) => `${X(x)} ${Y(y)}`; o += `${p(cx + r, cy)} m ${p(cx + r, cy + k)} ${p(cx + k, cy + r)} ${p(cx, cy + r)} c ${p(cx - k, cy + r)} ${p(cx - r, cy + k)} ${p(cx - r, cy)} c ${p(cx - r, cy - k)} ${p(cx - k, cy - r)} ${p(cx, cy - r)} c ${p(cx + k, cy - r)} ${p(cx + r, cy - k)} ${p(cx + r, cy)} c `; };
    const reg = (cx, cy) => { circle(cx, cy, 1.6); o += "S\n"; seg(cx - 2.6, cy, cx + 2.6, cy); seg(cx, cy - 2.6, cx, cy + 2.6); circle(cx, cy, 0.35); o += "f\n"; };
    reg(tx + tw / 2, by - 5); reg(tx + tw / 2, by + bh + 5); reg(bx - 5, ty + th / 2); reg(bx + bw + 5, ty + th / 2);
    const sq = 4; const total = COLOR_BAR.length * sq; let cx0 = Math.max(bx, tx + tw / 2 - total / 2); const cy0 = by + bh + 2.2;
    COLOR_BAR.forEach((c, i) => { o += `${c.map(v => v.toFixed(2)).join(" ")} k ${X(cx0 + i * sq)} ${Y(cy0 + sq)} ${(sq * PT).toFixed(3)} ${(sq * PT).toFixed(3)} re f\n`; });
    o += `0 0 0 1 K ${(0.1 * PT).toFixed(3)} w ${X(cx0)} ${Y(cy0 + sq)} ${(total * PT).toFixed(3)} ${(sq * PT).toFixed(3)} re S\n`;
    return o + "Q\n";
  }
  /* low-level document: shared image objects, pages, cross-reference table */
  function pdfDoc() {
    const objs = []; const enc = str => Uint8Array.from(str, c => c.charCodeAt(0) & 255); const add = body => { objs.push(body); return objs.length; };
    const catalogId = add(null), pagesId = add(null), fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const pageIds = []; const imgIds = new Map();
    const image = im => { let id = imgIds.get(im); if (!id) { id = add({ dict: `<< /Type /XObject /Subtype /Image /Width ${im.px} /Height ${im.py} /ColorSpace /${im.cs} /BitsPerComponent 8 /Filter /${im.filter} /Length ${im.data.length} >>`, stream: im.data }); imgIds.set(im, id); } return id; };
    const page = (pw, ph, content, xobjs, boxes) => { const bytes = enc(content); const cid = add({ dict: `<< /Length ${bytes.length} >>`, stream: bytes }); const xo = xobjs && xobjs.length ? `/XObject << ${xobjs.map(([n, id]) => `/${n} ${id} 0 R`).join(" ")} >>` : ""; pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${(pw * PT).toFixed(3)} ${(ph * PT).toFixed(3)}] ${boxes || ""} /Resources << /Font << /F1 ${fontId} 0 R >> ${xo} >> /Contents ${cid} 0 R >>`)); };
    const finish = meta => {
      objs[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
      objs[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => id + " 0 R").join(" ")}] /Count ${pageIds.length} >>`;
      const infoId = add(`<< /Producer (Layrys Studio) /Title (${pdfEscape(latin1((meta && meta.title) || "Carte"))}) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}) >>`);
      const parts = []; let offset = 0; const offsets = []; const push = chunk => { const bb = typeof chunk === "string" ? enc(chunk) : chunk; parts.push(bb); offset += bb.length; };
      push("%PDF-1.4\n"); push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
      objs.forEach((o, i) => { offsets.push(offset); push(`${i + 1} 0 obj\n`); if (typeof o === "string") push(o + "\n"); else { push(o.dict + "\nstream\n"); push(o.stream); push("\nendstream\n"); } push("endobj\n"); });
      const xref = offset; let xr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`; for (const off of offsets) xr += String(off).padStart(10, "0") + " 00000 n \n"; push(xr);
      push(`trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
      return new Blob(parts, { type: "application/pdf" });
    };
    return { image, page, finish };
  }
  /* one card per page: [{ g, image, slug, dark }] with TrimBox and BleedBox */
  function buildPdf(pages, meta) {
    const doc = pdfDoc();
    for (const p of pages) {
      const g = p.g; let content = ""; const xo = [];
      if (p.image) { xo.push(["Im0", doc.image(p.image)]); content += `q ${(g.bw * PT).toFixed(3)} 0 0 ${(g.bh * PT).toFixed(3)} ${(g.bx * PT).toFixed(3)} ${((g.ph - g.by - g.bh) * PT).toFixed(3)} cm /Im0 Do Q\n`; }
      content += marksOps(g, p.dark);
      if (p.slug) content += `BT ${p.dark ? "1 g" : "0 0 0 1 k"} /F1 6.5 Tf ${(g.bx * PT).toFixed(2)} ${((g.ph - g.by + 4) * PT).toFixed(2)} Td (${pdfEscape(latin1(p.slug))}) Tj ET\n`;
      const box = (x, y, w, h) => `[${(x * PT).toFixed(3)} ${((g.ph - y - h) * PT).toFixed(3)} ${((x + w) * PT).toFixed(3)} ${((g.ph - y) * PT).toFixed(3)}]`;
      doc.page(g.pw, g.ph, content, xo, `/TrimBox ${box(g.tx, g.ty, g.tw, g.th)} /BleedBox ${box(g.bx, g.by, g.bw, g.bh)}`);
    }
    return doc.finish(meta);
  }
  /* imposition: several cards per press sheet, crop marks for every cut line */
  const SHEETS = { A4: [210, 297], A3: [297, 420], SRA3: [320, 450], LETTER: [215.9, 279.4] };
  function imposeLayout(key, w, h, b) {
    const [sw, sh] = SHEETS[key] || SHEETS.A3; const M = 12; const cw = w + 2 * b, ch = h + 2 * b;
    const fit = (W, H) => [Math.max(0, Math.floor((W - 2 * M) / cw)), Math.max(0, Math.floor((H - 2 * M) / ch))];
    const p = fit(sw, sh), l = fit(sh, sw); const land = l[0] * l[1] > p[0] * p[1]; const [cols, rows] = land ? l : p; const pw = land ? sh : sw, ph = land ? sw : sh;
    return { key, pw, ph, cols, rows, per: cols * rows, cw, ch, x0: (pw - cols * cw) / 2, y0: (ph - rows * ch) / 2, b, w, h };
  }
  function cropLines(L) {
    const out = []; const gx0 = L.x0, gy0 = L.y0, gx1 = L.x0 + L.cols * L.cw, gy1 = L.y0 + L.rows * L.ch; const len = 5, gap = 1.5;
    for (let c = 0; c < L.cols; c++) for (const x of [gx0 + c * L.cw + L.b, gx0 + c * L.cw + L.b + L.w]) { out.push([x, gy0 - gap - len, x, gy0 - gap]); out.push([x, gy1 + gap, x, gy1 + gap + len]); }
    for (let r = 0; r < L.rows; r++) for (const y of [gy0 + r * L.ch + L.b, gy0 + r * L.ch + L.b + L.h]) { out.push([gx0 - gap - len, y, gx0 - gap, y]); out.push([gx1 + gap, y, gx1 + gap + len, y]); }
    return out;
  }
  /* slots: [{ front, back }] of PDF images; the back sheet mirrors the columns so both sides register after a long-edge flip */
  function buildImposition(L, slots, withBack, slugBase) {
    const sheets = []; let n = 0;
    for (let s = 0; s < slots.length; s += L.per) {
      const chunk = slots.slice(s, s + L.per); n++;
      const items = side => { const out = []; chunk.forEach((sl, k) => { const col = k % L.cols, row = Math.floor(k / L.cols); const c2 = side === "back" ? L.cols - 1 - col : col; const im = side === "back" ? sl.back : sl.front; if (im) out.push({ img: im, x: L.x0 + c2 * L.cw, y: L.y0 + row * L.ch, w: L.cw, h: L.ch }); }); return out; };
      sheets.push({ pw: L.pw, ph: L.ph, items: items("front"), lines: cropLines(L), slug: `${slugBase} · feuille ${n} recto · ${chunk.length} cartes` });
      if (withBack && chunk.some(sl => sl.back)) sheets.push({ pw: L.pw, ph: L.ph, items: items("back"), lines: cropLines(L), slug: `${slugBase} · feuille ${n} verso (colonnes inversees, retournement bord long)` });
    }
    return sheets;
  }
  function buildSheetsPdf(sheets, meta) {
    const doc = pdfDoc();
    for (const sh of sheets) {
      let content = ""; const names = new Map();
      for (const it of sh.items) { const id = doc.image(it.img); let nm = names.get(id); if (!nm) { nm = "Im" + names.size; names.set(id, nm); } content += `q ${(it.w * PT).toFixed(3)} 0 0 ${(it.h * PT).toFixed(3)} ${(it.x * PT).toFixed(3)} ${((sh.ph - it.y - it.h) * PT).toFixed(3)} cm /${nm} Do Q\n`; }
      content += `q 0 0 0 1 K ${(0.2 * PT).toFixed(3)} w\n` + sh.lines.map(([x1, y1, x2, y2]) => `${(x1 * PT).toFixed(3)} ${((sh.ph - y1) * PT).toFixed(3)} m ${(x2 * PT).toFixed(3)} ${((sh.ph - y2) * PT).toFixed(3)} l S`).join("\n") + "\nQ\n";
      if (sh.slug) content += `BT 0 0 0 1 k /F1 7 Tf ${(8 * PT).toFixed(2)} ${(4 * PT).toFixed(2)} Td (${pdfEscape(latin1(sh.slug))}) Tj ET\n`;
      doc.page(sh.pw, sh.ph, content, [...names].map(([id, nm]) => [nm, id]));
    }
    return doc.finish(meta);
  }
  async function canvasToPdfImage(canvas, gray) {
    if (gray) { const x = canvas.getContext("2d"); const d = x.getImageData(0, 0, canvas.width, canvas.height).data; const g = new Uint8Array(canvas.width * canvas.height); for (let i = 0, j = 0; i < d.length; i += 4, j++) g[j] = d[i]; const z = await deflateBytes(g); if (z) return { data: z, filter: "FlateDecode", cs: "DeviceGray", px: canvas.width, py: canvas.height }; }
    const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.95)); return { data: new Uint8Array(await blob.arrayBuffer()), filter: "DCTDecode", cs: "DeviceRGB", px: canvas.width, py: canvas.height };
  }
  /* a raster sheet: artwork with bleed centred on a white page with marks (for PNG) */
  function markedSheet(artCanvas, w, h, b, dpi, slug, opts = {}) {
    const g = sheetGeom(w, h, b); const s = dpi / 25.4; const [c, x] = cv(Math.round(g.pw * s), Math.round(g.ph * s));
    x.fillStyle = opts.dark ? "#000" : "#fff"; x.fillRect(0, 0, c.width, c.height);
    if (artCanvas) x.drawImage(artCanvas, g.bx * s, g.by * s, g.bw * s, g.bh * s);
    drawMarksCanvas(x, g, s, slug, { dark: opts.dark, guides: !!opts.guides, safe: opts.safe });
    return c;
  }
