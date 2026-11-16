  /* ================= Engine: WebGL contexts, image analysis, procedural layers ================= */
  function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d", { willReadFrequently: true })]; }
  function rr(x, X, Y, w, h, r) { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function hexRgb(h) { const n = parseInt(h.replace("#", ""), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
  function hexA(h, a) { const n = parseInt(h.replace("#", ""), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

  const UNIFORMS = ["uImage","uMask","uAux","uAux2","uDepthTex","uRes","uPointer","uTilt","uAuxTexel","uCenter","uHalf","uAspect","uIntensity","uSeed","uScale","uAngle","uBands","uSparkle","uSpecPow","uFoilAmt","uSat","uGlare","uBump","uHueShift","uRelief","uInk","uImgRelief","uDepth","uEdgeFoil","uFlatOnly","uPickTol","uMaskInvert","uDetail","uCavity","uLightZ","uWarm","uMaskThr","uMaskSoft","uAccentOn","uAccentAmt","uAccentRelief","uAccentInvert","uAccentWithin","uRot","uOpacity","uProof","uPattern","uMaskMode","uBlend","uView","uReliefSrc","uDepthSrc","uPalette","uAccentMask","uAccentType","uPickN","uCoat","uWindow","uTint","uAccentTint","uPicks"];
  function makeGL(canvas) {
    const gl = canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: true, alpha: true });
    if (!gl) throw new Error("WebGL indisponible"); gl.getExtension("OES_standard_derivatives");
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; for (const n of UNIFORMS) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.uImage, 0); gl.uniform1i(U.uMask, 1); gl.uniform1i(U.uAux, 2); gl.uniform1i(U.uAux2, 3); gl.uniform1i(U.uDepthTex, 4);
    const mkTex = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128,128,128,255])); return t; };
    const cache = new Map();
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic"); const maxAniso = aniso ? gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
    const potCache = new WeakMap();
    function potCanvas(source) { const w = source.naturalWidth || source.width, h = source.naturalHeight || source.height; const pot = v => Math.min(2048, Math.pow(2, Math.ceil(Math.log2(Math.max(2, v))))); const pw = pot(w), ph = pot(h); if (pw === w && ph === h) return source; let c = potCache.get(source); if (c && c.width === pw && c.height === ph && c.dataset.v === String(source.dataset && source.dataset.v || "")) return c; const [cc, x] = cv(pw, ph); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; x.drawImage(source, 0, 0, pw, ph); potCache.set(source, cc); return cc; }
    function upload(t, source) { gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, potCanvas(source)); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, maxAniso)); }
    function ensure(layer) {
      let c = cache.get(layer.id);
      if (!c) { c = { t: [mkTex(), mkTex(), mkTex(), mkTex(), mkTex()], version: -1, mv: -1, dv: -1 }; cache.set(layer.id, c); }
      if (c.version !== layer.version) { gl.activeTexture(gl.TEXTURE0); upload(c.t[0], layer.src); gl.activeTexture(gl.TEXTURE2); upload(c.t[2], layer.analysis.canvas); gl.activeTexture(gl.TEXTURE3); upload(c.t[3], layer.analysis.canvas2); c.version = layer.version; }
      if (c.mv !== layer.maskVersion && layer.maskImg) { if (layer.maskImg.dataset) layer.maskImg.dataset.v = String(layer.maskVersion); gl.activeTexture(gl.TEXTURE1); upload(c.t[1], layer.maskImg); c.mv = layer.maskVersion; }
      if (c.dv !== layer.depthVersion && layer.depthImg) { gl.activeTexture(gl.TEXTURE4); upload(c.t[4], layer.depthImg); c.dv = layer.depthVersion; }
      for (let i = 0; i < 5; i++) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, c.t[i]); }
    }
    function drop(id) { const c = cache.get(id); if (c) { for (const t of c.t) gl.deleteTexture(t); cache.delete(id); } }
    function setBlend(mode) {
      gl.enable(gl.BLEND);
      if (mode === "screen") gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
      else if (mode === "multiply") gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
      else if (mode === "add") gl.blendFunc(gl.ONE, gl.ONE);
      else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    const f1 = (n, v) => gl.uniform1f(U[n], v), i1 = (n, v) => gl.uniform1i(U[n], v);
    function setLayer(layer, o, view, ca) {
      const m = layer.fx; const la = layer.w / layer.h; let hw = layer.scale * ca / 2, hh = hw / la; let cx = layer.x, cy = 1 - layer.y; let pscale = m.scale;
      if (o.bleed) { const [bx, by] = o.bleed; cx = bx + cx * (1 - 2 * bx); cy = by + cy * (1 - 2 * by); hw *= (1 - 2 * by); hh *= (1 - 2 * by); pscale = m.scale / (1 - 2 * by); }
      gl.uniform2f(U.uCenter, cx, cy); gl.uniform2f(U.uHalf, hw, hh); f1("uRot", layer.rot * Math.PI / 180); f1("uOpacity", layer.opacity);
      gl.uniform2f(U.uAuxTexel, 1 / layer.analysis.w, 1 / layer.analysis.h);
      f1("uScale", pscale); f1("uAngle", m.angle * Math.PI / 180); f1("uBands", m.bands); f1("uSparkle", m.sparkle); f1("uSpecPow", m.specPow); f1("uFoilAmt", m.foil); f1("uSat", m.sat); f1("uGlare", m.glare); f1("uBump", m.bump); f1("uHueShift", m.hue);
      f1("uRelief", m.relief); f1("uInk", m.ink); f1("uImgRelief", m.imgRelief); f1("uDepth", m.depth); f1("uEdgeFoil", m.edgeFoil); f1("uFlatOnly", m.flatOnly); f1("uPickTol", layer.pickTol); f1("uMaskInvert", m.maskInvert);
      f1("uDetail", m.detail); f1("uCavity", m.cavity); f1("uLightZ", o.light ? m.lightZ * o.light.z : m.lightZ); f1("uWarm", o.light ? Math.max(-1, Math.min(1, m.warm + o.light.warm)) : m.warm); f1("uMaskThr", m.maskThr); f1("uMaskSoft", m.maskSoft);
      f1("uAccentOn", m.accent); f1("uAccentAmt", m.accentAmt); f1("uAccentRelief", m.accentRelief); f1("uAccentInvert", m.accentInvert); f1("uAccentWithin", m.accentWithin);
      i1("uPattern", m.pattern); i1("uBlend", m.blend); i1("uMaskMode", m.mask); i1("uView", view); i1("uReliefSrc", m.reliefSrc); i1("uDepthSrc", m.depthSrc); i1("uPalette", m.palette); i1("uAccentMask", m.accentMask); i1("uAccentType", m.accentType); i1("uPickN", layer.picks.length); i1("uCoat", 0);
      const win = layer.win; gl.uniform4f(U.uWindow, win[0], win[1], win[2], win[3]);
      const tn = TINTS[m.tint] || TINTS.silver; gl.uniform3f(U.uTint, tn[0], tn[1], tn[2]);
      const acc = ACCENTS.find(a => a.type === m.accentType); let at = TINTS[acc ? acc.tint : "gold"]; if (m.accentColor) at = hexRgb(m.accentColor); gl.uniform3f(U.uAccentTint, at[0], at[1], at[2]);
      const pk = new Float32Array(12); layer.picks.forEach((c, i) => { pk[i*3] = c[0]; pk[i*3+1] = c[1]; pk[i*3+2] = c[2]; }); gl.uniform3fv(U.uPicks, pk);
    }
    function renderDoc(doc, o) {
      const w = canvas.width, h = canvas.height; gl.viewport(0, 0, w, h);
      const st = o.clearColor || hexRgb(doc.stock || "#f6f3ec");
      gl.disable(gl.BLEND); gl.clearColor(st[0], st[1], st[2], o.clearAlpha === undefined ? 1 : o.clearAlpha); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uRes, w, h); gl.uniform2f(U.uPointer, o.pointer[0], o.pointer[1]); gl.uniform2f(U.uTilt, o.tilt[0], o.tilt[1]);
      f1("uAspect", o.aspect); f1("uIntensity", o.intensity); f1("uSeed", o.seed); f1("uProof", o.proof ? 1 : 0);
      for (const layer of doc.layers) {
        if (!layer.visible || !layer.src || !layer.analysis) continue;
        if (o.only && !o.only.includes(layer.id)) continue;
        ensure(layer); setLayer(layer, o, (o.viewAll || layer.id === o.selectedId) ? o.view : 0, o.aspect); setBlend(o.blendOverride || layer.blend);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if ((doc.coat || 0) > 0 && o.view === 0 && !o.noCoat) { i1("uCoat", 1); f1("uGlare", doc.coat); f1("uWarm", o.light ? o.light.warm : 0); f1("uLightZ", o.light ? 0.6 * o.light.z : 0.6); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); i1("uCoat", 0); }
    }
    return { gl, canvas, renderDoc, drop, cache };
  }

  /* ---- image analysis: height, edges, saturation, subject, cavity, coarse depth ---- */
  function flatten(src, W, H, blurPx) { const [c, x] = cv(W, H); x.fillStyle = "#fff"; x.fillRect(0, 0, W, H); if (blurPx > 0) x.filter = `blur(${blurPx}px)`; x.drawImage(src, 0, 0, W, H); x.filter = "none"; return x.getImageData(0, 0, W, H).data; }
  function lumOf(d, n) { const out = new Float32Array(n); for (let i = 0, j = 0; i < n; i++, j += 4) out[i] = (0.299 * d[j] + 0.587 * d[j+1] + 0.114 * d[j+2]) / 255; return out; }
  function boxBlur(a, W, H, R) {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, c = 0; for (let k = -R; k <= R; k++) { const xx = x + k; if (xx >= 0 && xx < W) { s += a[y * W + xx]; c++; } } tmp[y * W + x] = s / c; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, c = 0; for (let k = -R; k <= R; k++) { const yy = y + k; if (yy >= 0 && yy < H) { s += tmp[yy * W + x]; c++; } } out[y * W + x] = s / c; }
    return out;
  }
  function subjectFromColor(d0, W, H) {
    const n = W * H; const bw = Math.max(2, Math.round(W * 0.03)), bh = Math.max(2, Math.round(H * 0.03));
    const bins = new Map();
    const addPx = i => { const j = i * 4; const k = ((d0[j] >> 4) << 8) | ((d0[j+1] >> 4) << 4) | (d0[j+2] >> 4); let b = bins.get(k); if (!b) { b = [0, 0, 0, 0]; bins.set(k, b); } b[0]++; b[1] += d0[j]; b[2] += d0[j+1]; b[3] += d0[j+2]; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (y < bh || y >= H - bh || x < bw || x >= W - bw) addPx(y * W + x);
    const total = [...bins.values()].reduce((s, b) => s + b[0], 0);
    const cents = [...bins.values()].filter(b => b[0] > total * 0.004).sort((a, b) => b[0] - a[0]).slice(0, 10).map(b => [b[1] / b[0] / 255, b[2] / b[0] / 255, b[3] / b[0] / 255]);
    if (!cents.length) cents.push([0, 0, 0]);
    const dist = new Float32Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; const r = d0[j] / 255, g = d0[j+1] / 255, b = d0[j+2] / 255; let md = 9; for (const c of cents) { const dd = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2; if (dd < md) md = dd; } dist[i] = Math.sqrt(md) / 1.732; }
    const thr = 0.14; const bg = new Uint8Array(n); const q = new Int32Array(n); let qh = 0, qt = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (y === 0 || y === H - 1 || x === 0 || x === W - 1) { const i = y * W + x; if (dist[i] < thr && !bg[i]) { bg[i] = 1; q[qt++] = i; } } }
    while (qh < qt) { const i = q[qh++]; const x = i % W; const nb = [i - 1, i + 1, i - W, i + W]; for (let k = 0; k < 4; k++) { const t = nb[k]; if (t < 0 || t >= n) continue; if ((k === 0 && x === 0) || (k === 1 && x === W - 1)) continue; if (!bg[t] && dist[t] < thr) { bg[t] = 1; q[qt++] = t; } } }
    const seen = new Uint8Array(n);
    for (let s = 0; s < n; s++) { if (bg[s] || seen[s] || dist[s] >= thr) continue; let h2 = 0, t2 = 0; q[t2++] = s; seen[s] = 1; while (h2 < t2) { const i = q[h2++]; const x = i % W; const nb = [i - 1, i + 1, i - W, i + W]; for (let k = 0; k < 4; k++) { const t = nb[k]; if (t < 0 || t >= n) continue; if ((k === 0 && x === 0) || (k === 1 && x === W - 1)) continue; if (!seen[t] && dist[t] < thr) { seen[t] = 1; q[t2++] = t; } } }
      if (t2 > n * 0.12) for (let k = 0; k < t2; k++) bg[q[k]] = 1; }
    const subj = new Float32Array(n); for (let i = 0; i < n; i++) subj[i] = bg[i] ? 0 : 1;
    return boxBlur(subj, W, H, 3);
  }
  function analyze(src, blurPx) {
    const sw = src.naturalWidth || src.width, shh = src.naturalHeight || src.height;
    const W = sw >= 900 ? 1024 : 768, H = Math.max(48, Math.min(2048, Math.round(W * shh / sw)));
    const [c0, x0] = cv(W, H); x0.drawImage(src, 0, 0, W, H); const d0 = x0.getImageData(0, 0, W, H).data;
    const n = W * H, A = new Float32Array(n), S = new Float32Array(n); let hasAlpha = false;
    for (let i = 0; i < n; i++) { const j = i * 4; A[i] = d0[j+3] / 255; if (A[i] < 0.98) hasAlpha = true; const mx = Math.max(d0[j], d0[j+1], d0[j+2]), mn = Math.min(d0[j], d0[j+1], d0[j+2]); S[i] = mx < 6 ? 0 : (mx - mn) / mx * A[i]; }
    const dF = flatten(src, W, H, 0); const L = lumOf(dF, n);
    const Lb = lumOf(flatten(src, W, H, blurPx), n), Ls = lumOf(flatten(src, W, H, 0.8), n), Lm = lumOf(flatten(src, W, H, 4), n), Lc = lumOf(flatten(src, W, H, 12), n);
    const E = new Float32Array(n); let emax = 1e-4;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; const gx = -Ls[i-W-1] - 2*Ls[i-1] - Ls[i+W-1] + Ls[i-W+1] + 2*Ls[i+1] + Ls[i+W+1]; const gy = -Ls[i-W-1] - 2*Ls[i-W] - Ls[i-W+1] + Ls[i+W-1] + 2*Ls[i+W] + Ls[i+W+1]; const e = Math.sqrt(gx * gx + gy * gy); E[i] = e; if (e > emax) emax = e; }
    const subj = hasAlpha ? boxBlur(A, W, H, 2) : subjectFromColor(dF, W, H);
    const [c, x] = cv(W, H); const out = x.createImageData(W, H); const o = out.data; const norm = 1 / (emax * 0.55);
    const [c2, x2] = cv(W, H); const out2 = x2.createImageData(W, H); const o2 = out2.data;
    for (let i = 0; i < n; i++) { const j = i * 4; o[j] = Math.round(Lb[i] * 255); o[j+1] = Math.round(Math.min(1, E[i] * norm) * 255); o[j+2] = Math.round(L[i] * 255); o[j+3] = Math.round(S[i] * 255);
      o2[j] = Math.round(subj[i] * 255); o2[j+1] = Math.round(Lc[i] * 255); o2[j+2] = Math.round(Math.max(0, Math.min(1, (Lm[i] - L[i]) * 3)) * 255); o2[j+3] = 255; }
    x.putImageData(out, 0, 0); x2.putImageData(out2, 0, 0);
    return { canvas: c, canvas2: c2, w: W, h: H, data: d0, hasAlpha };
  }

  /* ---- procedural layer sources (card-sized canvases with alpha) ---- */
  const DOC_W = 1000;
  function textCanvas(t, ca) {
    const W = DOC_W, H = Math.round(W / ca), [c, x] = cv(W, H); const size = H * t.size / 100;
    x.font = `${t.weight} ${size}px "${t.font}", "Manrope", sans-serif`; x.textAlign = t.align; x.textBaseline = "middle"; x.lineJoin = "round";
    if ("letterSpacing" in x) x.letterSpacing = (t.spacing * size / 100) + "px";
    const txt = t.upper ? t.text.toUpperCase() : t.text; const lines = txt.split("\n"); const lh = size * 1.15;
    const x0 = t.align === "left" ? W * 0.07 : t.align === "right" ? W * 0.93 : W / 2;
    lines.forEach((ln, i) => {
      const y = H / 2 + (i - (lines.length - 1) / 2) * lh;
      if (t.shadow) { x.shadowColor = "rgba(0,0,0,.65)"; x.shadowBlur = size * 0.2; x.shadowOffsetY = size * 0.06; }
      if (t.strokeW > 0) { x.lineWidth = t.strokeW * size / 40; x.strokeStyle = t.stroke; x.strokeText(ln, x0, y); }
      x.shadowBlur = 0; x.shadowOffsetY = 0; x.fillStyle = t.color; x.fillText(ln, x0, y);
    });
    return c;
  }
  function frameCanvas(f, ca) {
    const W = DOC_W, H = Math.round(W / ca), [c, x] = cv(W, H); const bw = W * f.width / 100; const col = f.color; const panel = hexA(f.panel, f.panelA);
    const corner = W * 0.045;
    const stroke = (inset, w) => { x.lineWidth = w; x.strokeStyle = col; rr(x, inset + w / 2, inset + w / 2, W - inset * 2 - w, H - inset * 2 - w, Math.max(2, corner - inset)); x.stroke(); };
    if (f.style === "thin") stroke(0, bw);
    else if (f.style === "double") { stroke(0, bw * 0.6); stroke(bw * 1.4, bw * 0.3); }
    else if (f.style === "classic") {
      stroke(0, bw);
      x.fillStyle = panel; rr(x, bw * 1.6, bw * 1.6, W - bw * 3.2, H * 0.085, corner * 0.5); x.fill();
      rr(x, bw * 1.6, H * 0.64, W - bw * 3.2, H * 0.3, corner * 0.5); x.fill();
      x.lineWidth = Math.max(2, bw * 0.25); x.strokeStyle = col; rr(x, bw * 1.6, bw * 1.6, W - bw * 3.2, H * 0.085, corner * 0.5); x.stroke(); rr(x, bw * 1.6, H * 0.64, W - bw * 3.2, H * 0.3, corner * 0.5); x.stroke();
    } else if (f.style === "fullart") {
      const g = x.createLinearGradient(0, H * 0.6, 0, H); g.addColorStop(0, hexA(f.panel, 0)); g.addColorStop(0.45, hexA(f.panel, f.panelA)); g.addColorStop(1, hexA(f.panel, Math.min(1, f.panelA + 0.2)));
      x.fillStyle = g; x.fillRect(0, H * 0.6, W, H * 0.4); stroke(0, bw * 0.7);
      x.fillStyle = col; x.fillRect(bw * 2, H * 0.72, W - bw * 4, Math.max(2, bw * 0.18));
    } else if (f.style === "ornate") {
      stroke(0, bw * 0.7); stroke(bw * 1.3, bw * 0.25);
      x.fillStyle = col; const s = W * 0.06;
      for (const [cx, cy] of [[bw * 1.3, bw * 1.3], [W - bw * 1.3, bw * 1.3], [bw * 1.3, H - bw * 1.3], [W - bw * 1.3, H - bw * 1.3]]) { x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s, cy); x.lineTo(cx, cy + s); x.lineTo(cx - s, cy); x.closePath(); x.fill(); x.fillStyle = "rgba(0,0,0,0.35)"; x.beginPath(); x.arc(cx, cy, s * 0.3, 0, Math.PI * 2); x.fill(); x.fillStyle = col; }
      x.fillRect(W * 0.3, bw * 1.3 - bw * 0.15, W * 0.4, bw * 0.3); x.fillRect(W * 0.3, H - bw * 1.3 - bw * 0.15, W * 0.4, bw * 0.3);
    } else if (f.style === "window") {
      stroke(0, bw);
      const ax = W * 0.08, ay = H * 0.1, aw = W * 0.84, ah = H * 0.37;
      x.fillStyle = panel; x.fillRect(bw, bw, W - bw * 2, H - bw * 2);
      x.clearRect(ax, ay, aw, ah);
      x.lineWidth = Math.max(2, bw * 0.4); x.strokeStyle = col; x.strokeRect(ax, ay, aw, ah);
      x.fillStyle = hexA(f.panel, Math.min(1, f.panelA + 0.15)); rr(x, ax, H * 0.52, aw, H * 0.3, corner * 0.4); x.fill(); x.strokeStyle = col; x.lineWidth = Math.max(2, bw * 0.25); rr(x, ax, H * 0.52, aw, H * 0.3, corner * 0.4); x.stroke();
    }
    return c;
  }
  function bgCanvas(b, ca) {
    const W = DOC_W, H = Math.round(W / ca), [c, x] = cv(W, H);
    if (b.type === "solid") { x.fillStyle = b.c1; x.fillRect(0, 0, W, H); }
    else if (b.type === "radial") { const g = x.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.7); g.addColorStop(0, b.c1); g.addColorStop(1, b.c2); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    else if (b.type === "rays") { x.fillStyle = b.c2; x.fillRect(0, 0, W, H); x.fillStyle = b.c1; const n = 24; for (let i = 0; i < n; i += 2) { const a0 = i / n * Math.PI * 2 + b.angle * Math.PI / 180, a1 = (i + 1) / n * Math.PI * 2 + b.angle * Math.PI / 180; x.beginPath(); x.moveTo(W / 2, H / 2); x.lineTo(W / 2 + Math.cos(a0) * W * 2, H / 2 + Math.sin(a0) * W * 2); x.lineTo(W / 2 + Math.cos(a1) * W * 2, H / 2 + Math.sin(a1) * W * 2); x.closePath(); x.fill(); } }
    else { const a = b.angle * Math.PI / 180; const r = Math.max(W, H) * 0.6; const g = x.createLinearGradient(W / 2 - Math.cos(a) * r, H / 2 - Math.sin(a) * r, W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r); g.addColorStop(0, b.c1); g.addColorStop(1, b.c2); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    return c;
  }
  function badgeCanvas(b, ca) {
    const W = DOC_W, H = Math.round(W / ca), [c, x] = cv(W, H); const s = W * 0.16; const cx = W / 2, cy = H / 2;
    x.fillStyle = b.color; x.strokeStyle = "rgba(0,0,0,0.35)"; x.lineWidth = s * 0.06; x.beginPath();
    if (b.shape === "circle") x.arc(cx, cy, s, 0, Math.PI * 2);
    else if (b.shape === "hex") { for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; x.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } x.closePath(); }
    else if (b.shape === "star") { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5; const r = k % 2 ? s * 0.48 : s; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); }
    else if (b.shape === "diamond") { x.moveTo(cx, cy - s); x.lineTo(cx + s * 0.8, cy); x.lineTo(cx, cy + s); x.lineTo(cx - s * 0.8, cy); x.closePath(); }
    else if (b.shape === "shield") { x.moveTo(cx - s, cy - s * 0.8); x.lineTo(cx + s, cy - s * 0.8); x.lineTo(cx + s, cy + s * 0.2); x.quadraticCurveTo(cx + s, cy + s * 0.9, cx, cy + s * 1.1); x.quadraticCurveTo(cx - s, cy + s * 0.9, cx - s, cy + s * 0.2); x.closePath(); }
    else { rr(x, cx - s * 1.4, cy - s * 0.55, s * 2.8, s * 1.1, s * 0.55); }
    x.fill(); x.stroke();
    x.fillStyle = b.textColor; x.font = `800 ${s * 0.85}px "Unbounded", "Arial Black", sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(b.text, cx, cy + s * 0.04);
    return c;
  }
  function backCanvas(style, c1, c2, text, ca) {
    const W = DOC_W, H = Math.round(W / ca), [c, x] = cv(W, H); const cx = W / 2, cy = H / 2;
    x.fillStyle = c1; x.fillRect(0, 0, W, H);
    const edge = W * 0.045; x.strokeStyle = c2; x.lineWidth = W * 0.012; rr(x, edge, edge, W - edge * 2, H - edge * 2, W * 0.03); x.stroke();
    x.save(); rr(x, edge * 1.6, edge * 1.6, W - edge * 3.2, H - edge * 3.2, W * 0.02); x.clip();
    if (style === "geo") { x.strokeStyle = hexA(c2, 0.35); x.lineWidth = 2; for (let i = -H; i < W + H; i += W * 0.08) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H, H); x.stroke(); x.beginPath(); x.moveTo(i, H); x.lineTo(i + H, 0); x.stroke(); } }
    else if (style === "cosmos") { for (let i = 0; i < 500; i++) { x.fillStyle = hexA(c2, Math.random() * 0.8 + 0.1); x.beginPath(); x.arc(Math.random() * W, Math.random() * H, Math.random() * 2.5 + 0.5, 0, Math.PI * 2); x.fill(); } for (let i = 0; i < 6; i++) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, W * (0.2 + i * 0.1)); g.addColorStop(0, hexA(c2, 0)); g.addColorStop(0.9, hexA(c2, 0.12)); g.addColorStop(1, hexA(c2, 0)); x.fillStyle = g; x.fillRect(0, 0, W, H); } }
    else if (style === "classic") { x.strokeStyle = hexA(c2, 0.6); x.lineWidth = W * 0.006; for (let r = W * 0.12; r < W * 0.75; r += W * 0.06) { x.beginPath(); x.ellipse(cx, cy, r, r * 1.3, 0, 0, Math.PI * 2); x.stroke(); } x.fillStyle = hexA(c2, 0.12); for (let i = 0; i < 4; i++) { x.save(); x.translate(cx, cy); x.rotate(i * Math.PI / 2); x.beginPath(); x.moveTo(0, -H * 0.42); x.lineTo(W * 0.08, -H * 0.25); x.lineTo(0, -H * 0.1); x.lineTo(-W * 0.08, -H * 0.25); x.closePath(); x.fill(); x.restore(); } }
    else if (style === "waves") { x.strokeStyle = hexA(c2, 0.45); x.lineWidth = W * 0.008; for (let y = -W * 0.1; y < H + W * 0.1; y += W * 0.05) { x.beginPath(); for (let px = 0; px <= W; px += 10) x.lineTo(px, y + Math.sin(px / W * Math.PI * 4) * W * 0.03); x.stroke(); } }
    else if (style === "hex") { const R = W * 0.055, Hh = Math.sqrt(3) * R; x.strokeStyle = hexA(c2, 0.5); x.lineWidth = W * 0.006; for (let row = -1; row < H / Hh + 2; row++) for (let col = -1; col < W / (1.5 * R) + 2; col++) { const hx = col * 1.5 * R, hy = row * Hh + (col % 2 ? Hh / 2 : 0); x.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k; x.lineTo(hx + R * 0.88 * Math.cos(a), hy + R * 0.88 * Math.sin(a)); } x.closePath(); x.stroke(); } }
    else if (style === "sun") { x.fillStyle = hexA(c2, 0.18); const n = 36; for (let i = 0; i < n; i += 2) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a0) * W * 2, cy + Math.sin(a0) * W * 2); x.lineTo(cx + Math.cos(a1) * W * 2, cy + Math.sin(a1) * W * 2); x.closePath(); x.fill(); } }
    else if (style === "shield") { x.fillStyle = hexA(c2, 0.14); x.beginPath(); x.moveTo(cx - W * 0.32, cy - H * 0.28); x.lineTo(cx + W * 0.32, cy - H * 0.28); x.lineTo(cx + W * 0.32, cy + H * 0.05); x.quadraticCurveTo(cx + W * 0.32, cy + H * 0.28, cx, cy + H * 0.36); x.quadraticCurveTo(cx - W * 0.32, cy + H * 0.28, cx - W * 0.32, cy + H * 0.05); x.closePath(); x.fill(); x.strokeStyle = c2; x.lineWidth = W * 0.01; x.stroke(); }
    x.restore();
    const g = x.createRadialGradient(cx, cy, W * 0.05, cx, cy, W * 0.42); g.addColorStop(0, hexA(c2, style === "minimal" ? 0 : 0.35)); g.addColorStop(1, hexA(c2, 0)); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = c2; x.beginPath(); x.arc(cx, cy, W * 0.16, 0, Math.PI * 2); x.fill(); x.fillStyle = c1; x.beginPath(); x.arc(cx, cy, W * 0.135, 0, Math.PI * 2); x.fill();
    x.fillStyle = c2; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5; const r = k % 2 ? W * 0.045 : W * 0.1; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill();
    if (text) { x.fillStyle = c2; x.font = `700 ${W * 0.065}px "Unbounded", "Arial Black", sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; if ("letterSpacing" in x) x.letterSpacing = W * 0.012 + "px"; x.fillText(text, cx, cy + W * 0.3); x.font = `600 ${W * 0.028}px "Manrope", sans-serif`; x.fillStyle = hexA(c2, 0.7); x.fillText("TRADING CARD", cx, cy + W * 0.365); }
    return c;
  }
  function packCanvas(p, art, ca) {
    const W = DOC_W, H = Math.round(W / ca), [c, x] = cv(W, H);
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, p.c1); g.addColorStop(1, p.c2); x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (art) { const la = art.width / art.height; const aw = W * 0.86, ah = aw / la; x.save(); rr(x, W * 0.07, H * 0.17, aw, Math.min(ah, H * 0.62), W * 0.03); x.clip(); x.drawImage(art, W * 0.07, H * 0.17, aw, ah); x.restore(); x.strokeStyle = "rgba(255,255,255,0.5)"; x.lineWidth = 3; rr(x, W * 0.07, H * 0.17, aw, Math.min(ah, H * 0.62), W * 0.03); x.stroke(); }
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 16;
    x.font = `800 ${W * 0.09}px "Unbounded", "Arial Black", sans-serif`; x.fillText(p.title, W / 2, H * 0.1);
    x.font = `700 ${W * 0.035}px "Manrope", sans-serif`; x.fillText(p.sub, W / 2, H * 0.86); x.shadowBlur = 0;
    x.fillStyle = "rgba(255,255,255,0.85)"; x.font = `600 ${W * 0.028}px "Manrope", sans-serif`; x.fillText(`${p.cards} CARTES`, W / 2, H * 0.92);
    return c;
  }

  /* ---- sample illustrations ---- */
  function flame(x, bx, by, w, h, col1, col2, blur) {
    x.save(); x.shadowColor = col2; x.shadowBlur = blur;
    const g = x.createLinearGradient(bx, by, bx, by - h); g.addColorStop(0, col1); g.addColorStop(0.6, col2); g.addColorStop(1, "rgba(255,250,210,0.95)");
    x.fillStyle = g; x.beginPath(); x.moveTo(bx - w / 2, by); x.bezierCurveTo(bx - w * 0.7, by - h * 0.35, bx - w * 0.1, by - h * 0.55, bx + w * 0.05, by - h); x.bezierCurveTo(bx + w * 0.25, by - h * 0.55, bx + w * 0.75, by - h * 0.4, bx + w / 2, by); x.closePath(); x.fill(); x.restore();
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  function makeFox() {
    const W = 800, H = 1000, [c, x] = cv(W, H);
    const sky = x.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#07081c"); sky.addColorStop(0.45, "#1d1446"); sky.addColorStop(0.72, "#5a2a5e"); sky.addColorStop(0.86, "#c9522f"); sky.addColorStop(1, "#ffb36a");
    x.fillStyle = sky; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 420; i++) { x.fillStyle = `rgba(255,255,255,${rnd(0.25, 1)})`; x.beginPath(); x.arc(rnd(0, W), rnd(0, H * 0.62), rnd(0.6, 2.4), 0, Math.PI * 2); x.fill(); }
    x.save(); x.globalCompositeOperation = "screen";
    for (const [col, yy, lw] of [["rgba(80,255,200,0.35)", 140, 60], ["rgba(140,120,255,0.3)", 220, 70], ["rgba(255,120,200,0.22)", 300, 50]]) { x.strokeStyle = col; x.lineWidth = lw; x.shadowBlur = 60; x.shadowColor = col; x.beginPath(); x.moveTo(-50, yy + 80); x.bezierCurveTo(220, yy - 90, 420, yy + 150, 860, yy - 40); x.stroke(); }
    x.restore();
    x.save(); const mg = x.createRadialGradient(560, 270, 20, 560, 270, 240); mg.addColorStop(0, "rgba(255,236,190,0.55)"); mg.addColorStop(0.35, "rgba(255,210,150,0.18)"); mg.addColorStop(1, "rgba(255,200,140,0)"); x.fillStyle = mg; x.fillRect(0, 0, W, H);
    const moon = x.createRadialGradient(535, 250, 10, 560, 270, 125); moon.addColorStop(0, "#fffaf0"); moon.addColorStop(0.7, "#ffe4a8"); moon.addColorStop(1, "#f0b86b");
    x.fillStyle = moon; x.shadowColor = "rgba(255,220,160,0.9)"; x.shadowBlur = 50; x.beginPath(); x.arc(560, 270, 122, 0, Math.PI * 2); x.fill();
    x.shadowBlur = 0; x.fillStyle = "rgba(220,170,120,0.25)"; for (const [cx, cy, r] of [[520, 240, 22], [590, 300, 16], [580, 220, 10], [540, 315, 12]]) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
    x.restore();
    const ridge = (yBase, amp, col, seed) => { x.fillStyle = col; x.beginPath(); x.moveTo(-10, H); x.lineTo(-10, yBase); let px = -10, k = 0; while (px < W + 10) { px += rnd(40, 110); x.lineTo(px, yBase - Math.abs(Math.sin(seed + k * 1.7)) * amp - rnd(0, amp * 0.4)); k++; } x.lineTo(W + 10, H); x.closePath(); x.fill(); };
    ridge(690, 150, "rgba(58,34,88,0.85)", 1); ridge(740, 120, "rgba(38,22,58,0.95)", 4); ridge(800, 90, "#160c22", 9);
    const gz = x.createLinearGradient(0, 740, 0, H); gz.addColorStop(0, "rgba(255,150,80,0)"); gz.addColorStop(1, "rgba(255,140,70,0.35)"); x.fillStyle = gz; x.fillRect(0, 740, W, H - 740);
    x.fillStyle = "#120818"; x.fillRect(0, 870, W, H - 870); const gl2 = x.createLinearGradient(0, 870, 0, 960); gl2.addColorStop(0, "rgba(255,120,60,0.35)"); gl2.addColorStop(1, "rgba(255,120,60,0)"); x.fillStyle = gl2; x.fillRect(0, 870, W, 90);
    x.save(); x.fillStyle = "rgba(0,0,0,0.5)"; x.filter = "blur(14px)"; x.beginPath(); x.ellipse(360, 870, 190, 30, 0, 0, Math.PI * 2); x.fill(); x.restore();
    const fur = (cx, cy, r) => { const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r); g.addColorStop(0, "#ffb050"); g.addColorStop(0.55, "#f0742a"); g.addColorStop(1, "#9c2e14"); return g; };
    x.save(); x.shadowColor = "rgba(255,150,60,0.6)"; x.shadowBlur = 30; const tg = x.createLinearGradient(440, 790, 660, 410); tg.addColorStop(0, "#c23c16"); tg.addColorStop(0.55, "#ff8a2a"); tg.addColorStop(1, "#ffe08a");
    x.fillStyle = tg; x.beginPath(); x.moveTo(440, 810); x.bezierCurveTo(540, 780, 620, 670, 630, 550); x.bezierCurveTo(635, 490, 660, 450, 680, 420); x.bezierCurveTo(710, 470, 700, 550, 685, 610); x.bezierCurveTo(660, 730, 580, 840, 450, 852); x.closePath(); x.fill(); x.restore();
    flame(x, 675, 435, 70, 150, "rgba(255,120,40,0.9)", "#ffc24a", 30); flame(x, 660, 460, 40, 90, "rgba(255,170,60,0.9)", "#fff0a0", 20);
    x.fillStyle = fur(280, 790, 110); x.beginPath(); x.ellipse(285, 780, 95, 80, -0.2, 0, Math.PI * 2); x.fill(); x.fillStyle = fur(440, 790, 110); x.beginPath(); x.ellipse(435, 785, 90, 78, 0.2, 0, Math.PI * 2); x.fill();
    x.fillStyle = fur(360, 690, 170); x.beginPath(); x.moveTo(360, 520); x.bezierCurveTo(490, 530, 520, 690, 500, 840); x.lineTo(220, 840); x.bezierCurveTo(200, 690, 230, 530, 360, 520); x.closePath(); x.fill();
    const cg = x.createLinearGradient(0, 590, 0, 840); cg.addColorStop(0, "#fff1d8"); cg.addColorStop(1, "#f7c58f"); x.fillStyle = cg; x.beginPath(); x.moveTo(360, 600); x.bezierCurveTo(430, 620, 440, 750, 420, 840); x.lineTo(300, 840); x.bezierCurveTo(280, 750, 290, 620, 360, 600); x.closePath(); x.fill();
    x.fillStyle = "#ffe5c2"; for (const px of [305, 415]) { x.beginPath(); x.ellipse(px, 842, 42, 18, 0, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = fur(360, 460, 130); x.beginPath(); x.moveTo(360, 350); x.bezierCurveTo(450, 350, 490, 420, 482, 480); x.bezierCurveTo(475, 535, 420, 575, 360, 578); x.bezierCurveTo(300, 575, 245, 535, 238, 480); x.bezierCurveTo(230, 420, 270, 350, 360, 350); x.closePath(); x.fill();
    x.fillStyle = "#f0742a"; x.beginPath(); x.moveTo(248, 490); x.lineTo(198, 538); x.lineTo(270, 550); x.closePath(); x.fill(); x.beginPath(); x.moveTo(472, 490); x.lineTo(522, 538); x.lineTo(450, 550); x.closePath(); x.fill();
    const ear = (ax, ay, bx, by, cx2, cy2, flip) => { x.fillStyle = fur(ax, ay, 90); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.lineTo(cx2, cy2); x.closePath(); x.fill(); x.fillStyle = "#5a1a24"; x.beginPath(); x.moveTo(ax + 14 * flip, ay - 10); x.lineTo(bx + 4 * flip, by + 40); x.lineTo(cx2 - 18 * flip, cy2 - 6); x.closePath(); x.fill(); };
    ear(282, 410, 238, 280, 342, 368, 1); ear(438, 410, 482, 280, 378, 368, -1);
    flame(x, 242, 288, 40, 80, "rgba(255,120,40,0.85)", "#ffd36a", 22); flame(x, 478, 288, 40, 80, "rgba(255,120,40,0.85)", "#ffd36a", 22);
    const mz = x.createLinearGradient(0, 490, 0, 580); mz.addColorStop(0, "#fff3dc"); mz.addColorStop(1, "#f5c48e"); x.fillStyle = mz; x.beginPath(); x.ellipse(360, 538, 62, 44, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#2b1020"; x.beginPath(); x.moveTo(360, 538); x.lineTo(346, 520); x.lineTo(374, 520); x.closePath(); x.fill(); x.strokeStyle = "#2b1020"; x.lineWidth = 3; x.beginPath(); x.moveTo(360, 538); x.lineTo(360, 552); x.stroke();
    for (const ex of [312, 408]) { x.save(); x.shadowColor = "rgba(120,240,255,0.95)"; x.shadowBlur = 22; const eg = x.createRadialGradient(ex, 482, 2, ex, 482, 18); eg.addColorStop(0, "#ffffff"); eg.addColorStop(0.5, "#9df5ff"); eg.addColorStop(1, "#1aa7c9"); x.fillStyle = eg; x.beginPath(); x.ellipse(ex, 482, 15, 20, 0, 0, Math.PI * 2); x.fill(); x.restore(); x.fillStyle = "#0a1a2a"; x.beginPath(); x.ellipse(ex, 484, 4, 14, 0, 0, Math.PI * 2); x.fill(); }
    x.save(); x.globalCompositeOperation = "screen"; x.strokeStyle = "rgba(255,230,180,0.75)"; x.lineWidth = 6; x.lineCap = "round"; x.shadowColor = "rgba(255,220,160,0.6)"; x.shadowBlur = 12; x.beginPath(); x.moveTo(450, 385); x.bezierCurveTo(490, 430, 488, 490, 465, 530); x.stroke(); x.beginPath(); x.moveTo(475, 590); x.bezierCurveTo(520, 670, 520, 750, 505, 825); x.stroke(); x.restore();
    for (let i = 0; i < 70; i++) { x.save(); x.shadowColor = "#ffb347"; x.shadowBlur = 10; x.fillStyle = `rgba(255,${Math.floor(rnd(150, 220))},80,${rnd(0.4, 1)})`; x.beginPath(); x.arc(rnd(400, 760), rnd(370, 870), rnd(1, 3.2), 0, Math.PI * 2); x.fill(); x.restore(); }
    return c;
  }
  function makeSigil() {
    const W = 800, H = 1000, [c, x] = cv(W, H);
    x.fillStyle = "#07070b"; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { const r = rnd(80, 280); const g = x.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(${Math.floor(rnd(30, 70))},${Math.floor(rnd(10, 30))},${Math.floor(rnd(50, 90))},${rnd(0.08, 0.22)})`); g.addColorStop(1, "rgba(0,0,0,0)"); x.save(); x.translate(rnd(0, W), rnd(0, H)); x.fillStyle = g; x.fillRect(-r, -r, r * 2, r * 2); x.restore(); }
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(200,190,255,${rnd(0.05, 0.5)})`; x.fillRect(rnd(0, W), rnd(0, H), rnd(0.6, 1.8), rnd(0.6, 1.8)); }
    const cx = 400, cy = 500;
    x.save(); x.shadowColor = "rgba(150,120,255,0.55)"; x.shadowBlur = 40; x.strokeStyle = "#8f86c8"; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 280, 0, Math.PI * 2); x.stroke(); x.restore();
    x.strokeStyle = "#3a3650"; x.lineWidth = 16; x.beginPath(); x.arc(cx, cy, 280, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "#5c5680"; x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, 290, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(cx, cy, 270, 0, Math.PI * 2); x.stroke();
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; const r1 = 248, r2 = i % 4 === 0 ? 220 : 236; x.strokeStyle = "#6a6490"; x.lineWidth = i % 4 === 0 ? 3 : 1.5; x.beginPath(); x.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); x.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); x.stroke(); }
    const tri = (rt, col) => { x.save(); x.translate(cx, cy); x.rotate(rt); x.strokeStyle = col; x.lineWidth = 5; x.beginPath(); for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 3; x.lineTo(Math.cos(a) * 200, Math.sin(a) * 200); } x.closePath(); x.stroke(); x.restore(); };
    tri(0, "#4a4468"); tri(Math.PI, "#4a4468");
    const eye = x.createRadialGradient(cx, cy, 4, cx, cy, 85); eye.addColorStop(0, "#efe8ff"); eye.addColorStop(0.25, "#9b86ff"); eye.addColorStop(0.6, "#2b1f55"); eye.addColorStop(1, "rgba(10,8,20,0)");
    x.save(); x.shadowColor = "rgba(160,130,255,0.9)"; x.shadowBlur = 50; x.fillStyle = eye; x.beginPath(); x.arc(cx, cy, 85, 0, Math.PI * 2); x.fill(); x.restore();
    x.fillStyle = "#07070b"; x.beginPath(); x.ellipse(cx, cy, 12, 42, 0, 0, Math.PI * 2); x.fill();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; x.fillStyle = "#2c2840"; x.save(); x.translate(cx + Math.cos(a) * 145, cy + Math.sin(a) * 145); x.rotate(a); x.fillRect(-18, -18, 36, 36); x.restore(); x.strokeStyle = "#7b74a8"; x.lineWidth = 1.5; x.save(); x.translate(cx + Math.cos(a) * 145, cy + Math.sin(a) * 145); x.rotate(a + Math.PI / 4); x.strokeRect(-12, -12, 24, 24); x.restore(); }
    x.fillStyle = "#4b4766"; x.font = "700 22px Manrope, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.save(); x.translate(cx + Math.cos(a) * 330, cy + Math.sin(a) * 330); x.rotate(a + Math.PI / 2); x.fillText("ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ"[i], 0, 0); x.restore(); }
    return c;
  }
