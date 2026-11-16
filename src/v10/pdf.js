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
  /* raster version of the marks (for PNG exports and the on-screen overlay drawn by the app) */
  function drawMarksCanvas(x, g, s, slug, opts = {}) {
    const { tx, ty, tw, th, b, bx, by, bw, bh, pw, ph } = g; const off = b + 1, len = 5; const lw = Math.max(1, 0.2 * s);
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
  /* pages: [{ g, image: { data, filter, cs, px, py } | null, slug, dark }] */
  function buildPdf(pages, meta) {
    const objs = []; const add = body => { objs.push(body); return objs.length; }; const enc = { encode: str => Uint8Array.from(str, c => c.charCodeAt(0) & 255) };
    const catalogId = add(null), pagesId = add(null), fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const pageIds = [];
    for (const p of pages) {
      const g = p.g; let content = ""; let xobj = "";
      if (p.image) { const im = p.image; const id = add({ dict: `<< /Type /XObject /Subtype /Image /Width ${im.px} /Height ${im.py} /ColorSpace /${im.cs} /BitsPerComponent 8 /Filter /${im.filter} /Length ${im.data.length} >>`, stream: im.data }); xobj = `/XObject << /Im0 ${id} 0 R >>`; content += `q ${(g.bw * PT).toFixed(3)} 0 0 ${(g.bh * PT).toFixed(3)} ${(g.bx * PT).toFixed(3)} ${((g.ph - g.by - g.bh) * PT).toFixed(3)} cm /Im0 Do Q\n`; }
      content += marksOps(g, p.dark);
      if (p.slug) content += `BT ${p.dark ? "1 g" : "0 0 0 1 k"} /F1 6.5 Tf ${(g.bx * PT).toFixed(2)} ${((g.ph - g.by + 4) * PT).toFixed(2)} Td (${pdfEscape(latin1(p.slug))}) Tj ET\n`;
      const bytes = enc.encode(content); const cid = add({ dict: `<< /Length ${bytes.length} >>`, stream: bytes });
      const box = (x, y, w, h) => `[${(x * PT).toFixed(3)} ${((g.ph - y - h) * PT).toFixed(3)} ${((x + w) * PT).toFixed(3)} ${((g.ph - y) * PT).toFixed(3)}]`;
      pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${(g.pw * PT).toFixed(3)} ${(g.ph * PT).toFixed(3)}] /TrimBox ${box(g.tx, g.ty, g.tw, g.th)} /BleedBox ${box(g.bx, g.by, g.bw, g.bh)} /Resources << /Font << /F1 ${fontId} 0 R >> ${xobj} >> /Contents ${cid} 0 R >>`));
    }
    objs[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => id + " 0 R").join(" ")}] /Count ${pageIds.length} >>`;
    const infoId = add(`<< /Producer (Prisme Studio) /Title (${pdfEscape(latin1(meta.title || "Carte"))}) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}) >>`);
    const parts = []; let offset = 0; const offsets = []; const push = chunk => { const bb = typeof chunk === "string" ? enc.encode(chunk) : chunk; parts.push(bb); offset += bb.length; };
    push("%PDF-1.4\n"); push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
    objs.forEach((o, i) => { offsets.push(offset); push(`${i + 1} 0 obj\n`); if (typeof o === "string") push(o + "\n"); else { push(o.dict + "\nstream\n"); push(o.stream); push("\nendstream\n"); } push("endobj\n"); });
    const xref = offset; let xr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`; for (const off of offsets) xr += String(off).padStart(10, "0") + " 00000 n \n"; push(xr);
    push(`trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: "application/pdf" });
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
