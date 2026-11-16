
  /* ---- v38: Studio. A small stage of its own films the cards: the card renderer draws the visible faces (so the finish reacts to the move),
     a second WebGL canvas places them in space with a backdrop, floor reflection, shadow, halo, light rays, bokeh, rim glow, motion trail, particles, title and film grain.
     Movements for one card, scenes for several cards of the series, and sequences of movements played back to back. ---- */
  const ST_CATS = [["all", "Tous"], ["in", "Entrées et sorties"], ["rot", "Rotations"], ["light", "Lumière et détails"], ["loop", "Boucles"], ["multi", "Plusieurs cartes"]];
  const ST_ANIMS = [
    ["hero", "Entrée en scène", "La carte arrive, se pose et capte la lumière", 8, "in"],
    ["drop", "Chute et rebond", "Elle tombe, rebondit deux fois et se stabilise", 7, "in"],
    ["slide", "Glissé latéral", "Arrivée par le côté, avec un léger dépassement", 7, "in"],
    ["whirl", "Tourbillon", "Trois tours rapides qui ralentissent jusqu'à l'arrêt", 7, "in"],
    ["reveal", "Révélation", "Le dos d'abord, puis la face dans un éclat", 7, "in"],
    ["exit", "Sortie de scène", "Elle s'élève en tournant et quitte le cadre", 5, "in"],
    ["spin", "Rotation complète", "Un tour entier, recto puis verso", 8, "rot"],
    ["flip", "Recto verso", "Retournement net, une pause sur chaque face", 8, "rot"],
    ["table", "Retournement à plat", "Bascule autour de l'axe horizontal", 8, "rot"],
    ["spiral", "Spirale", "Deux tours en montant vers la caméra", 7, "rot"],
    ["sweep", "Balayage de lumière", "De trois quarts, la lumière traverse la carte", 7, "light"],
    ["detail", "Zoom sur les détails", "La caméra s'approche et parcourt la carte", 10, "light"],
    ["pulse", "Battement", "Quatre pulsations, avec éclat du halo", 6, "light"],
    ["float", "Flottement", "Lévitation douce, parfaite en boucle", 8, "loop"],
    ["tilt", "Inclinaison lente", "Va-et-vient régulier", 6, "loop"],
    ["hand", "Tenue en main", "Petits mouvements naturels, comme filmée à la main", 8, "loop"],
    ["pendulum", "Pendule", "Balancement suspendu à un point haut", 6, "loop"],
    ["fan", "Éventail", "Les cartes de la série s'ouvrent en éventail", 8, "multi"],
    ["parade", "Défilé", "Les cartes tournent en carrousel", 10, "multi"],
    ["cascade", "Cascade", "Elles tombent l'une après l'autre, en ligne", 8, "multi"],
    ["duo", "Recto et verso", "La même carte, face et dos côte à côte", 8, "multi"],
  ];
  const ST_BACKS = [["dark", "Studio sombre", "#2c2824", "#0b0a09"], ["warm", "Nuit ambrée", "#5c2609", "#1a0a03"], ["blue", "Nuit bleue", "#1c2c50", "#060a15"], ["violet", "Velours violet", "#3d1d58", "#0d0616"], ["green", "Vert profond", "#12402f", "#04120c"], ["light", "Cyclo clair", "#f5f2ec", "#cdc7b9"], ["auto", "Couleur de la carte", "", ""], ["custom", "Personnalisé", "", ""]];
  const ST_FX = [["floor", "Reflet au sol"], ["shadow", "Ombre portée"], ["halo", "Halo derrière la carte"], ["rim", "Lueur de contour"], ["rays", "Rayons de lumière"], ["bokeh", "Bokeh d'arrière-plan"], ["sweep", "Reflet qui balaie la carte"], ["trail", "Traînée de mouvement"], ["dust", "Particules lumineuses"], ["title", "Nom de la carte"], ["grain", "Grain de film"], ["vignette", "Vignettage"]];
  const ST_FMT = { "1:1": [1080, 1080], "4:5": [1080, 1350], "9:16": [1080, 1920], "16:9": [1920, 1080] };
  const ST = { g: null, t: 0, clock: 0, last: 0, raf: 0, playing: true, rec: null, anim: "hero", cat: "all", seqOn: false, seq: [], back: "dark", fmt: "4:5", dur: 8, loop: true, zoom: 1, cam: 4, flip: false, fxAmt: 1,
    fx: { floor: true, shadow: true, halo: true, rim: false, rays: false, bokeh: false, sweep: true, trail: false, dust: false, title: false, grain: false, vignette: true }, c1: "#3b1d4a", c2: "#0c0612", keep: null, pw: 0 };
  const stAnim = id => ST_ANIMS.find(a => a[0] === id) || ST_ANIMS[0], stMulti = id => stAnim(id)[4] === "multi";
  try { const s = JSON.parse(localStorage.getItem("layrys-studio") || "null"); if (s) { for (const k of ["anim", "back", "fmt", "dur", "loop", "c1", "c2", "zoom", "cam", "flip", "fxAmt", "seqOn"]) if (s[k] !== undefined) ST[k] = s[k]; Object.assign(ST.fx, s.fx || {}); if (Array.isArray(s.seq)) ST.seq = s.seq.filter(id => ST_ANIMS.some(a => a[0] === id && a[4] !== "multi")).slice(0, 6); if (!ST_FMT[ST.fmt]) ST.fmt = "4:5"; if (!ST_ANIMS.some(a => a[0] === ST.anim)) ST.anim = "hero"; if (!ST_BACKS.some(a => a[0] === ST.back)) ST.back = "dark"; } } catch (e) {}
  const stSave = () => { try { localStorage.setItem("layrys-studio", JSON.stringify({ anim: ST.anim, back: ST.back, fmt: ST.fmt, dur: ST.dur, loop: ST.loop, c1: ST.c1, c2: ST.c2, zoom: ST.zoom, cam: ST.cam, flip: ST.flip, fxAmt: ST.fxAmt, seqOn: ST.seqOn, seq: ST.seq, fx: ST.fx })); } catch (e) {} };
  const stIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, stOut = t => 1 - Math.pow(1 - t, 3), stSeg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))), TAU = Math.PI * 2;
  const stBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }, stBeat = (t, c, w) => Math.exp(-Math.pow((t - c) / w, 2));
  const stP0 = () => ({ yaw: 0, pitch: 0, roll: 0, x: 0, y: 0, z: 0, sw: -1, burst: 0, lx: 0 });
  const stSweep = (p, t, a, b) => { p.sw = t < a || t > b ? -1 : stSeg(t, a, b) * 1.9 - 0.4; };
  /* pose of one card at time t (0..1): angles in radians, offsets in card heights (z towards the camera), sw = position of the light sweep (-1 = none), burst = flash of the halo */
  function stPose(id, t) {
    const p = stP0();
    if (id === "hero") { const a = stOut(stSeg(t, 0, 0.24)), s = stSeg(t, 0.24, 0.84), e = stIO(stSeg(t, 0.84, 1)); p.y = -1.5 * (1 - a); p.z = -1.4 * (1 - a) + 0.18 * e; p.yaw = -1.1 * (1 - a) + 0.3 * Math.sin(s * TAU * 0.75) * (1 - e); p.pitch = 0.22 * (1 - a) + 0.05 * Math.sin(s * TAU); p.roll = -0.12 * (1 - a); p.burst = Math.max(0, 1 - Math.abs(t - 0.24) / 0.1); stSweep(p, t, 0.36, 0.66); }
    else if (id === "drop") { const f = stSeg(t, 0, 0.26), b1 = stSeg(t, 0.26, 0.48), b2 = stSeg(t, 0.48, 0.62), s = stSeg(t, 0.62, 1); p.y = t < 0.26 ? 2.1 * (1 - f * f) : t < 0.48 ? 0.3 * Math.sin(Math.PI * b1) : t < 0.62 ? 0.09 * Math.sin(Math.PI * b2) : 0; p.roll = 0.22 * (1 - f); p.pitch = -0.1 * stBeat(t, 0.27, 0.03) - 0.04 * stBeat(t, 0.49, 0.025); p.yaw = 0.35 * (1 - f) + 0.2 * Math.sin(s * TAU * 0.5); p.burst = 0.55 * stBeat(t, 0.27, 0.04); stSweep(p, t, 0.66, 0.92); }
    else if (id === "slide") { const a = stBack(stSeg(t, 0, 0.3)), s = stSeg(t, 0.3, 1); p.x = -2.3 * (1 - a); p.yaw = -0.95 * (1 - a) + 0.24 * Math.sin(s * TAU * 0.75); p.roll = 0.12 * (1 - a); p.pitch = 0.05 * Math.sin(s * TAU); p.z = 0.14 * stIO(stSeg(t, 0.8, 1)); stSweep(p, t, 0.42, 0.72); }
    else if (id === "whirl") { const a = stOut(stSeg(t, 0, 0.68)), s = stSeg(t, 0.68, 1); p.yaw = TAU * 3 * a + 0.14 * Math.sin(s * Math.PI * 2); p.z = -0.5 * (1 - a) + 0.16 * stIO(s); p.y = 0.1 * Math.sin(Math.PI * a); p.pitch = 0.06; p.burst = stBeat(t, 0.68, 0.06); stSweep(p, t, 0.72, 0.96); }
    else if (id === "reveal") { const a = stIO(stSeg(t, 0.3, 0.52)), e = stIO(stSeg(t, 0.6, 1)); p.yaw = Math.PI * (1 - a) + 0.12 * Math.sin(t * TAU) * (1 - a) - 0.16 * Math.sin(e * Math.PI); p.pitch = 0.05; p.z = 0.2 * Math.sin(Math.PI * stSeg(t, 0.3, 0.52)) + 0.2 * e; p.burst = Math.max(0, 1 - Math.abs(t - 0.5) / 0.14); stSweep(p, t, 0.52, 0.8); }
    else if (id === "exit") { const w = stSeg(t, 0, 0.22), a = stIO(stSeg(t, 0.22, 1)); p.y = -0.07 * Math.sin(Math.PI * w) + 2.3 * a * a; p.yaw = TAU * a; p.z = -0.7 * a; p.roll = 0.2 * a; p.pitch = 0.12 * a; }
    else if (id === "spin") { p.yaw = stIO(t) * TAU; p.pitch = 0.07 * Math.sin(t * TAU); p.y = 0.015 * Math.sin(t * TAU * 2); }
    else if (id === "flip") { const a = stIO(stSeg(t, 0.2, 0.4)), b = stIO(stSeg(t, 0.64, 0.84)); p.yaw = (a + b) * Math.PI + 0.1 * Math.sin(t * TAU * 2); p.pitch = 0.05; p.z = 0.12 * Math.sin(Math.PI * stSeg(t, 0.2, 0.4)) + 0.12 * Math.sin(Math.PI * stSeg(t, 0.64, 0.84)); }
    else if (id === "table") { const a = stIO(stSeg(t, 0.18, 0.42)), b = stIO(stSeg(t, 0.6, 0.84)), up = Math.sin(Math.PI * stSeg(t, 0.18, 0.42)) + Math.sin(Math.PI * stSeg(t, 0.6, 0.84)); p.pitch = -0.32 + (a + b) * Math.PI; p.y = 0.16 * up; p.z = 0.1 * up; p.yaw = 0.16 * Math.sin(t * TAU); }
    else if (id === "spiral") { const a = stOut(stSeg(t, 0, 0.8)), e = stIO(stSeg(t, 0.8, 1)); p.yaw = TAU * 2 * a + 0.1 * Math.sin(e * Math.PI); p.y = -1.25 * (1 - a); p.z = -1.0 * (1 - a) + 0.15 * e; p.pitch = 0.14 * (1 - a) + 0.04; p.roll = 0.1 * (1 - a); p.burst = 0.5 * stBeat(t, 0.8, 0.07); }
    else if (id === "sweep") { p.yaw = -0.4 + 0.12 * Math.sin(t * TAU); p.pitch = 0.06; p.sw = stIO(stSeg(t, 0.12, 0.88)) * 1.9 - 0.4; p.lx = stIO(t) * 2 - 1; }
    else if (id === "detail") { const a = stIO(stSeg(t, 0, 0.24)), b = stIO(stSeg(t, 0.28, 0.72)), c = stIO(stSeg(t, 0.78, 1)); p.z = 1.25 * (a - c); p.y = (-0.2 + 0.4 * b) * (a - c); p.x = 0.05 * Math.sin(b * Math.PI) * (a - c); p.yaw = 0.2 * Math.sin(t * TAU * 1.5); p.pitch = 0.06 * Math.cos(t * TAU); }
    else if (id === "pulse") { const k = stBeat(t, 0.2, 0.035) + 0.7 * stBeat(t, 0.31, 0.03) + stBeat(t, 0.66, 0.035) + 0.7 * stBeat(t, 0.77, 0.03); p.z = 0.2 * k; p.burst = 0.6 * k; p.yaw = 0.18 * Math.sin(t * TAU); p.pitch = 0.05 * Math.cos(t * TAU); }
    else if (id === "float") { p.y = 0.035 * Math.sin(t * TAU); p.yaw = 0.3 * Math.sin(t * TAU); p.pitch = 0.07 * Math.sin(t * TAU * 2 + 1); p.roll = 0.025 * Math.sin(t * TAU + 2); }
    else if (id === "hand") { p.yaw = 0.16 * Math.sin(t * TAU) + 0.07 * Math.sin(t * TAU * 3 + 1); p.pitch = 0.08 * Math.sin(t * TAU * 2 + 0.5) + 0.03 * Math.sin(t * TAU * 5); p.roll = 0.03 * Math.sin(t * TAU * 2 + 2) + 0.015 * Math.sin(t * TAU * 4); p.z = 0.1 + 0.05 * Math.sin(t * TAU); p.x = 0.02 * Math.sin(t * TAU * 2 + 1); p.y = 0.015 * Math.sin(t * TAU * 3); }
    else if (id === "pendulum") { const r = 0.34 * Math.sin(t * TAU * 2), L = 1.15; p.roll = r; p.x = Math.sin(r) * L; p.y = (1 - Math.cos(r)) * L; p.yaw = 0.2 * Math.sin(t * TAU); }
    else { p.yaw = 0.46 * Math.sin(t * TAU); p.pitch = 0.1 * Math.cos(t * TAU); }
    return p;
  }
  const stWrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  /* a sequence plays several movements back to back; each one starts from where the previous one ended, over a short blend */
  function stSeqSteps() { const ids = ST.seq.length ? ST.seq : [ST.anim]; const tot = ids.reduce((s, id) => s + stAnim(id)[3], 0); let a = 0; return ids.map(id => { const w = stAnim(id)[3] / tot, o = { id, a, b: a + w }; a += w; return o; }); }
  function stPoseAt(t) {
    let p; if (ST.seqOn && ST.seq.length) { const steps = stSeqSteps(); let i = steps.findIndex(s => t < s.b); if (i < 0) i = steps.length - 1; const s = steps[i], u = stSeg(t, s.a, s.b); p = stPose(s.id, u);
      if (i > 0 && u < 0.16) { const q = stPose(steps[i - 1].id, 1), k = stIO(u / 0.16); for (const f of ["x", "y", "z", "roll"]) p[f] = q[f] + (p[f] - q[f]) * k; p.yaw = p.yaw + stWrap(q.yaw - p.yaw) * (1 - k); p.pitch = p.pitch + stWrap(q.pitch - p.pitch) * (1 - k); } }
    else p = stPose(ST.anim, t);
    if (ST.flip) { p.yaw = -p.yaw; p.roll = -p.roll; p.x = -p.x; p.lx = -p.lx; } return p;
  }
  /* what is on stage at time t: one card, or several cards of the series; ext = half width and half height the camera must show */
  function stScene(t) {
    const cur = project.cardIndex, n = project.cards.length, id = ST.seqOn && ST.seq.length ? "" : ST.anim, a = aspect();
    if (!id || !stMulti(id)) return { inst: [{ ci: cur, p: stPoseAt(t) }], ext: null, single: true };
    const count = id === "duo" ? 2 : Math.min(5, Math.max(3, n)), ci = k => id === "duo" ? cur : (cur + k) % n, inst = []; let ext = { w: 1, h: 0.7 };
    for (let k = 0; k < count; k++) { const p = stP0(), f = k - (count - 1) / 2;
      if (id === "fan") { const s = stOut(stSeg(t, 0.04, 0.36)), ang = f * 0.25 * s, L = 1.3; p.roll = -ang; p.x = Math.sin(ang) * L; p.y = Math.cos(ang) * L - L - 0.03; p.z = k * 0.012; p.yaw = 0.14 * Math.sin(t * TAU) * s + f * 0.03 * s; p.pitch = 0.05; stSweep(p, t, 0.42 + k * 0.03, 0.74 + k * 0.03); ext = { w: Math.sin(0.25 * (count - 1) / 2) * L + a * 0.62, h: 0.72 }; }
      else if (id === "parade") { const Rr = Math.max(0.95, count * 0.27), ph = -t * TAU + k * TAU / count; p.x = Math.sin(ph) * Rr; p.z = Math.cos(ph) * Rr - Rr; p.yaw = ph * 0.62; p.y = 0.02 * Math.sin(t * TAU * 2 + k); ext = { w: Rr + a * 0.3, h: 0.66 }; }
      else if (id === "cascade") { const t0 = 0.04 + k * 0.1, u = stSeg(t, t0, t0 + 0.3), d = stOut(u), sp = Math.min(0.5, 1.9 / count); p.x = f * sp; p.y = 2.2 * (1 - d) + 0.05 * Math.sin(Math.PI * stSeg(t, t0 + 0.3, t0 + 0.42)); p.roll = (1 - d) * 0.5 * (k % 2 ? 1 : -1) - f * 0.03; p.yaw = (1 - d) * 1.3 + 0.1 * Math.sin(t * TAU + k); p.z = k * 0.012; p.burst = k === count - 1 ? 0.5 * stBeat(t, t0 + 0.3, 0.05) : 0; stSweep(p, t, 0.62 + k * 0.03, 0.9 + k * 0.03); ext = { w: (count - 1) / 2 * sp + a * 0.6, h: 0.66 }; }
      else { const sg = k ? 1 : -1; p.x = sg * (a * 0.5 + 0.07); p.yaw = (k ? Math.PI : 0) - sg * (0.24 + 0.1 * Math.sin(t * TAU)); p.y = 0.025 * Math.sin(t * TAU + k * Math.PI); p.pitch = 0.04; if (!k) stSweep(p, t, 0.3, 0.7); ext = { w: a + 0.2, h: 0.66 }; }
      if (ST.flip) { p.yaw = -p.yaw; p.roll = -p.roll; p.x = -p.x; } inst.push({ ci: ci(k), p });
    }
    return { inst, ext, single: false };
  }
  /* 4 x 4 matrices, column major */
  const m4 = { mul: (a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
    id: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), tr: (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]), sc: (x, y, z) => new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
    rx: a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }, ry: a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }, rz: a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); },
    persp: (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); },
    chain: (...ms) => ms.reduce((a, b) => m4.mul(a, b)) };
  const stRgb = h => { const n = parseInt(String(h).replace("#", ""), 16) || 0; return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  function stInit() {
    if (ST.g) return ST.g; const cvs = $("#stCanvas"); const gl = cvs.getContext("webgl", { alpha: false, antialias: true, preserveDrawingBuffer: false }); if (!gl) return null;
    const prog = (vs, fs, attr) => { const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("studio shader: " + gl.getShaderInfoLog(s)); return s; }; const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, attr); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("studio link: " + gl.getProgramInfoLog(p)); const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); } return { p, u }; };
    const flat = "attribute vec2 aPos; varying vec2 vUv; void main(){ vUv=aPos+.5; gl_Position=vec4(aPos*2.,0.,1.); }";
    const bg = prog(flat,
      "precision mediump float; varying vec2 vUv; uniform vec3 uC1,uC2,uHaloCol; uniform float uAspect,uVig,uHalo,uFloor,uTime,uRays,uBokeh; uniform vec2 uCard,uCardR;\n" +
      "float h21(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }\n" +
      "void main(){ vec2 p=vUv*2.-1.; p.x*=uAspect; float r=length(p-vec2(0.,.12)); vec3 col=mix(uC1,uC2,smoothstep(0.,1.55,r));\n" +
      " float fl=smoothstep(uFloor+.03,uFloor-.5,p.y); col=mix(col, col*.82+uC1*.1, fl*.55);\n" +
      " if(uBokeh>0.){ for(int i=0;i<9;i++){ float fi=float(i); vec2 c=vec2((h21(vec2(fi,1.3))-.5)*2.6*uAspect+sin(uTime*.07+fi)*.12, (h21(vec2(fi,7.7))-.35)*1.7+cos(uTime*.05+fi*2.)*.08); float rad=.1+.16*h21(vec2(fi,3.1)); float d=length(p-c); col+=uHaloCol*uBokeh*(.05+.07*h21(vec2(fi,9.2)))*smoothstep(rad,rad*.72,d)*(.75+.25*sin(uTime*.6+fi*1.7)); } }\n" +
      " vec2 q=(p-uCard)/uCardR; float ql=length(q); col+=uHaloCol*uHalo*exp(-dot(q,q)*1.25);\n" +
      " if(uRays>0.){ float an=atan(q.y,q.x); float ry=pow((sin(an*6.+uTime*.21)*.5+.5)*(sin(an*11.-uTime*.13)*.5+.5),1.6); col+=uHaloCol*uRays*ry*exp(-ql*.5)*smoothstep(.25,1.1,ql)*.9; }\n" +
      " col*=mix(1., smoothstep(1.9,.45,length(p*vec2(.9,1.))), uVig); col+=(h21(gl_FragCoord.xy)-.5)/255.; gl_FragColor=vec4(col,1.); }", "aPos");
    const card = prog("attribute vec2 aPos; uniform mat4 uMVP; varying vec2 vUv; void main(){ vUv=aPos+.5; gl_Position=uMVP*vec4(aPos,0.,1.); }",
      "precision mediump float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uSize,uCardSize; uniform float uRad,uAlpha,uFade,uShade,uSweep,uSweepAmt; uniform int uMode; uniform vec3 uCol;\n" +
      "float rr(vec2 p, vec2 hf, float r){ vec2 d=abs(p)-(hf-vec2(r)); return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }\n" +
      "void main(){ if(uMode==2){ vec2 q=(vUv-.5)*2.; float r=dot(q,q); gl_FragColor=vec4(uCol, exp(-r*3.4)*(1.-smoothstep(.75,1.,r))*uAlpha); return; }\n" +
      " if(uMode==1){ gl_FragColor=vec4(uCol*uShade,uAlpha); return; }\n" +
      " if(uMode==4){ vec4 t=texture2D(uTex,vUv); gl_FragColor=vec4(t.rgb, t.a*uAlpha); return; }\n" +
      " if(uMode==3){ float sd=max(rr((vUv-.5)*uSize, uCardSize*.5, uRad),0.); gl_FragColor=vec4(uCol*exp(-sd*24.)*uAlpha,0.); return; }\n" +
      " float sd=rr((vUv-.5)*uSize, uSize*.5, uRad); float a=1.-smoothstep(-.004,.0012,sd); if(a<.01) discard;\n" +
      " vec3 c=texture2D(uTex,vUv).rgb*uShade; float s=(vUv.x*.8+(1.-vUv.y)*.38)-uSweep; c+=vec3(1.,.97,.9)*uSweepAmt*exp(-s*s*34.);\n" +
      " a*=uAlpha*mix(1., pow(1.-vUv.y,2.4), uFade); gl_FragColor=vec4(c,a); }", "aPos");
    const dust = prog("attribute vec3 aSeed; uniform mat4 uVP; uniform float uTime,uPx,uAmt; varying float vA;\n" +
      "void main(){ float sp=.025+.05*aSeed.z; vec3 p=vec3((aSeed.x-.5)*3.6, mod(aSeed.y+uTime*sp,1.)*2.8-1.4, (fract(aSeed.z*7.13)-.5)*2.6); p.x+=sin(uTime*.4+aSeed.y*30.)*.06;\n" +
      " vec4 c=uVP*vec4(p,1.); gl_Position=c; float tw=.55+.45*sin(uTime*(1.4+aSeed.x*2.)+aSeed.z*40.); vA=tw*uAmt*(.3+.7*aSeed.z); gl_PointSize=max(1.,uPx*(1.4+4.6*aSeed.z)/c.w); }",
      "precision mediump float; varying float vA; uniform vec3 uCol; void main(){ vec2 q=gl_PointCoord*2.-1.; float r=dot(q,q); gl_FragColor=vec4(uCol*vA*exp(-r*3.2)*(1.-smoothstep(.7,1.,r)),0.); }", "aSeed");
    const grain = prog(flat, "precision mediump float; varying vec2 vUv; uniform float uTime,uAmt; float h21(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }\n" +
      "void main(){ float n=h21(gl_FragCoord.xy+fract(uTime)*vec2(91.7,37.3)); gl_FragColor=vec4(vec3(1.-uAmt*n),1.); }", "aPos");
    const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]), gl.STATIC_DRAW);
    const N = 150, seeds = new Float32Array(N * 3); let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < N * 3; i++) seeds[i] = rnd(); const pts = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pts); gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    const tex = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 18, 16, 255])); return t; };
    ST.g = { gl, cvs, bg, card, dust, grain, quad, pts, N, tex, faces: new Map(), title: { t: tex(), key: "" }, tick: 0 }; return ST.g;
  }
  function stColors() {
    const b = ST_BACKS.find(x => x[0] === ST.back) || ST_BACKS[0]; if (ST.back === "custom") return [stRgb(ST.c1), stRgb(ST.c2)];
    if (ST.back === "auto") { const l = tourMain(); const key = l ? l.src : null; if (ST.autoKey !== key || !ST.autoCol) { let r = 0.2, g = 0.17, bl = 0.14; try { const d = l.analysis.data; let n = 0, sr = 0, sg = 0, sb = 0; for (let i = 0; i < d.length; i += 4 * 97) { const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); const w = (mx - mn) / 255 + 0.05; sr += d[i] * w; sg += d[i + 1] * w; sb += d[i + 2] * w; n += w; } r = sr / n / 255; g = sg / n / 255; bl = sb / n / 255; } catch (e) {} ST.autoKey = key; ST.autoCol = [[r * 0.5 + 0.03, g * 0.5 + 0.03, bl * 0.5 + 0.03], [r * 0.1, g * 0.1, bl * 0.1]]; } return ST.autoCol; }
    return [stRgb(b[2]), stRgb(b[3])];
  }
  function stResize() {
    const g = ST.g; if (!g) return; const [ew, eh] = ST_FMT[ST.fmt]; const view = $("#stView"), bw = Math.max(120, view.clientWidth - 24), bh = Math.max(120, view.clientHeight - 24); const k = Math.min(bw / ew, bh / eh), cw = Math.round(ew * k), ch = Math.round(eh * k);
    g.cvs.style.width = cw + "px"; g.cvs.style.height = ch + "px"; let W, H; if (ST.rec) { W = ew; H = eh; } else { const dpr = Math.min(2, window.devicePixelRatio || 1) * (ui.quality < 1 ? 0.5 : 1); W = Math.max(2, Math.round(cw * dpr)); H = Math.max(2, Math.round(ch * dpr)); }
    if (g.cvs.width !== W || g.cvs.height !== H) { g.cvs.width = W; g.cvs.height = H; }
    /* the faces are rendered a little larger than they appear, never more than 900 px wide; the size is checked against the canvases themselves, so anything else that resizes them is put right at once */
    const a = aspect(), pw = Math.max(260, Math.min(900, Math.round(H * 0.8 * a))), ph = Math.round(pw / a); ST.pw = pw; if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
    const gb = ensureBack(); if (gb) { if (!project.back.layers.some(l => l.kind === "back")) ensureBackLayer(); if (canvasBack.width !== pw || canvasBack.height !== ph) { canvasBack.width = pw; canvasBack.height = ph; } }
  }
  /* which face of a card looks at the camera, and how the light falls on it */
  const stFront = p => Math.cos(p.yaw) * Math.cos(p.pitch) >= 0;
  function stRenderFace(g, it, o) {
    const gl = g.gl, p = it.p, front = it.front, c = it.ci === project.cardIndex ? project : project.cards[it.ci]; if (!c) return; let e = g.faces.get(it.ci); if (!e) { e = { f: g.tex(), b: g.tex(), fs: -1, bs: -1 }; g.faces.set(it.ci, e); }
    const sy = Math.sin(p.yaw) * (Math.cos(p.yaw) >= 0 ? 1 : -1), loc = Math.asin(Math.max(-1, Math.min(1, sy))), lp = Math.asin(Math.max(-1, Math.min(1, Math.sin(p.pitch)))) * (Math.cos(p.pitch) < 0 ? -1 : 1);
    const lx = Math.max(-0.2, Math.min(1.2, 0.5 + p.lx * 0.5 - Math.sin(loc) * 0.55)), ly = 0.7 + lp * 1.2; gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.activeTexture(gl.TEXTURE0);
    if (front) { e.fs = g.tick; R.renderDoc(c.front, { ...o, pointer: [lx, ly], tilt: [loc * 0.9, lp * 0.9] }); gl.bindTexture(gl.TEXTURE_2D, e.f); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas); }
    else { e.bs = g.tick; const gb = ensureBack(); if (!gb || !c.back) return; gb.renderDoc(c.back, { ...o, pointer: [1 - lx, ly], tilt: [-loc * 0.9, lp * 0.9] }); gl.bindTexture(gl.TEXTURE_2D, e.b); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasBack); }
  }
  /* lower third: the name of the card and of the series, drawn once on a 2D canvas */
  function stTitle(g, light) {
    const c = curCard(), name = (c && c.name) || "Carte " + (project.cardIndex + 1), sub = project.title || "", key = name + "|" + sub + "|" + light; if (g.title.key === key) return; g.title.key = key;
    const [cvs2, x] = cv(1024, 220); x.clearRect(0, 0, 1024, 220); x.textAlign = "center"; x.textBaseline = "middle"; const ink = light ? "#17140f" : "#ffffff"; if (!light) { x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = 18; x.shadowOffsetY = 3; }
    let size = 78; x.font = `600 ${size}px "Sora", "Figtree", "Segoe UI", sans-serif`; while (size > 34 && x.measureText(name).width > 960) { size -= 4; x.font = `600 ${size}px "Sora", "Figtree", "Segoe UI", sans-serif`; } x.fillStyle = ink; x.fillText(name, 512, 84);
    if (sub) { x.font = '500 34px "Figtree", "Segoe UI", sans-serif'; x.globalAlpha = 0.72; if ("letterSpacing" in x) x.letterSpacing = "3px"; x.fillText(sub.toUpperCase(), 512, 164); x.globalAlpha = 1; }
    const gl = g.gl; gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, g.title.t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cvs2);
  }
  function stDraw(t) {
    const g = ST.g; if (!g || !R) return; const gl = g.gl; stResize(); g.tick++; const W = g.cvs.width, H = g.cvs.height, asp = W / H, a = aspect(), fx = ST.fx, amt = ST.fxAmt, sc = stScene(t), insts = sc.inst, L = lightDef();
    const o = { aspect: a, intensity: ui.intensity * (L.power || 1), seed: ui.seed, selectedId: null, view: 0, light: { warm: L.warm, z: L.z, soft: L.soft || 0 }, proof: false, env: L.env || 0 };
    /* faces: any face never drawn is drawn now; beyond that, the two that waited longest are refreshed, so several cards cost no more than two */
    for (const it of insts) it.front = stFront(it.p); const stamp = it => { const e = g.faces.get(it.ci); return e ? (it.front ? e.fs : e.bs) : -1; };
    for (const it of insts) if (stamp(it) < 0) stRenderFace(g, it, o); const order = [...insts].sort((x, y) => stamp(x) - stamp(y)); for (let i = 0; i < Math.min(2, order.length); i++) if (stamp(order[i]) < g.tick) stRenderFace(g, order[i], o);
    /* camera: a card is one unit tall; the framing follows the format, the scene and the two camera sliders */
    const frac = asp > 1.2 ? 0.7 : asp < 0.7 ? 0.5 : asp < 0.9 ? 0.6 : 0.64, fov = 0.5, th = Math.tan(fov / 2); let D = 1 / (2 * frac * th); if (sc.ext) D = Math.max(D, (sc.ext.w + 0.1) / (th * asp), (sc.ext.h + 0.12) / th); D /= ST.zoom;
    const P = m4.persp(fov, asp, 0.1, 60), V = m4.chain(m4.tr(0, 0, -D), m4.rx(ST.cam * Math.PI / 180), m4.tr(0, 0.02, 0)), VP = m4.mul(P, V), floorY = -0.585, d = fmtDims(), rad = d.r / d.h;
    const [c1, c2] = stColors(), lum = c1[0] * 0.3 + c1[1] * 0.59 + c1[2] * 0.11, lightBg = lum > 0.5, haloCol = lightBg ? [0.5, 0.48, 0.42] : [Math.min(1, c1[0] * 1.6 + 0.3), Math.min(1, c1[1] * 1.5 + 0.24), Math.min(1, c1[2] * 1.5 + 0.2)];
    const proj = (x, y, z) => { const w = VP[3] * x + VP[7] * y + VP[11] * z + VP[15]; return [(VP[0] * x + VP[4] * y + VP[8] * z + VP[12]) / w, (VP[1] * x + VP[5] * y + VP[9] * z + VP[13]) / w, w]; };
    const lead = sc.single ? insts[0].p : { x: 0, y: 0, z: -0.2 }, burst = Math.max(...insts.map(it => it.p.burst)), cc = proj(lead.x, lead.y, lead.z), hs = 1 / Math.max(0.2, cc[2]) / th, wide = sc.single ? 1 : 1.9;
    gl.viewport(0, 0, W, H); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
    gl.useProgram(g.bg.p); gl.bindBuffer(gl.ARRAY_BUFFER, g.quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(g.bg.u.uC1, c1); gl.uniform3fv(g.bg.u.uC2, c2); gl.uniform1f(g.bg.u.uAspect, asp); gl.uniform1f(g.bg.u.uTime, ST.clock); gl.uniform1f(g.bg.u.uVig, fx.vignette ? (lightBg ? 0.35 : 0.8) : 0); gl.uniform1f(g.bg.u.uFloor, proj(0, floorY, 0)[1]);
    gl.uniform2f(g.bg.u.uCard, cc[0] * asp, cc[1]); gl.uniform2f(g.bg.u.uCardR, (a * 0.5 + 0.42) * hs * wide, 0.95 * hs); gl.uniform3fv(g.bg.u.uHaloCol, haloCol); gl.uniform1f(g.bg.u.uHalo, (fx.halo ? (lightBg ? 0.18 : 0.34) * amt : 0) + burst * (lightBg ? 0.3 : 0.75));
    gl.uniform1f(g.bg.u.uRays, fx.rays ? (lightBg ? 0.22 : 0.5) * amt + burst * 0.3 : 0); gl.uniform1f(g.bg.u.uBokeh, fx.bokeh ? (lightBg ? 0.5 : 1) * amt : 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const normal = () => gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND); normal(); gl.useProgram(g.card.p); const u = g.card.u; gl.uniform1i(u.uTex, 0); gl.activeTexture(gl.TEXTURE0);
    const baseOf = p => m4.chain(m4.tr(p.x, p.y, p.z), m4.ry(p.yaw), m4.rx(p.pitch), m4.rz(p.roll)), shadeOf = p => 0.74 + 0.26 * Math.abs(Math.cos(p.yaw) * Math.cos(p.pitch));
    const face = (it, M, p, alpha, fade) => { const e = g.faces.get(it.ci); if (!e) return; gl.bindTexture(gl.TEXTURE_2D, it.front ? e.f : e.b); gl.uniformMatrix4fv(u.uMVP, false, m4.chain(VP, M, it.front ? m4.id() : m4.ry(Math.PI), m4.sc(a, 1, 1))); gl.uniform1i(u.uMode, 0); gl.uniform2f(u.uSize, a, 1); gl.uniform1f(u.uRad, rad); gl.uniform1f(u.uAlpha, alpha); gl.uniform1f(u.uFade, fade); gl.uniform1f(u.uShade, shadeOf(p)); gl.uniform1f(u.uSweep, p.sw); gl.uniform1f(u.uSweepAmt, fx.sweep && p.sw > -0.9 && it.front ? 0.5 : 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    const far = [...insts].sort((x, y) => x.p.z - y.p.z);
    /* shadows on the floor: a soft blob under each card, lighter as the card rises */
    if (fx.shadow) for (const it of far) { const p = it.p, lift = Math.max(0, p.y + 0.085), sx = a * Math.max(0.2, Math.abs(Math.cos(p.yaw))) + 0.34, sz = 0.3 + a * Math.abs(Math.sin(p.yaw)) * 0.9; if (lift > 1.6) continue; gl.uniformMatrix4fv(u.uMVP, false, m4.chain(VP, m4.tr(p.x, floorY, p.z), m4.rx(-Math.PI / 2), m4.sc(sx * (1 + lift * 0.5), sz * (1 + lift * 0.5), 1))); gl.uniform1i(u.uMode, 2); gl.uniform3f(u.uCol, 0, 0, 0); gl.uniform1f(u.uAlpha, (lightBg ? 0.3 : 0.62) / (1 + lift * 2.4)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    /* reflections: each card mirrored under the floor, fading away from it */
    if (fx.floor) for (const it of far) face(it, m4.chain(m4.tr(0, 2 * floorY, 0), m4.sc(1, -1, 1), baseOf(it.p)), it.p, lightBg ? 0.2 : 0.34, 1);
    /* rim glow: a halo that hugs the outline of each card */
    if (fx.rim) { gl.blendFunc(gl.ONE, gl.ONE); const m = 0.3; for (const it of far) { gl.uniformMatrix4fv(u.uMVP, false, m4.chain(VP, baseOf(it.p), m4.sc(a + m, 1 + m, 1))); gl.uniform1i(u.uMode, 3); gl.uniform2f(u.uSize, a + m, 1 + m); gl.uniform2f(u.uCardSize, a, 1); gl.uniform1f(u.uRad, rad); gl.uniform3fv(u.uCol, haloCol); gl.uniform1f(u.uAlpha, (lightBg ? 0.3 : 0.62) * amt * shadeOf(it.p)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } normal(); }
    /* motion trail: where the card was a few hundredths of a second ago */
    if (fx.trail && sc.single) { const it = insts[0]; for (let k = 3; k >= 1; k--) { const tt = t - k * 0.03 / ST.dur; if (tt < 0) continue; const q = stPoseAt(tt); if (stFront(q) !== it.front) continue; face(it, baseOf(q), q, [0, 0.2, 0.12, 0.07][k], 0); } }
    /* the cards: visible face, then the four edges of the board */
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.clear(gl.DEPTH_BUFFER_BIT);
    for (const it of far) { const p = it.p, base = baseOf(p); face(it, base, p, 1, 0); const thk = 0.0058; gl.uniform1i(u.uMode, 1); gl.uniform1f(u.uAlpha, 1); gl.uniform3f(u.uCol, 0.9, 0.88, 0.83); gl.uniform1f(u.uShade, 0.62 + 0.38 * Math.abs(Math.sin(p.yaw)));
      for (const sgn of [-1, 1]) { gl.uniformMatrix4fv(u.uMVP, false, m4.chain(VP, base, m4.tr(sgn * a / 2, 0, 0), m4.ry(Math.PI / 2), m4.sc(thk, 1 - 2 * rad, 1))); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.uniformMatrix4fv(u.uMVP, false, m4.chain(VP, base, m4.tr(0, sgn / 2, 0), m4.rx(Math.PI / 2), m4.sc(a - 2 * rad, thk, 1))); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } }
    /* particles, hidden by the cards when they pass behind */
    if (fx.dust || burst > 0.02) { gl.depthMask(false); gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(g.dust.p); gl.bindBuffer(gl.ARRAY_BUFFER, g.pts); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.uniformMatrix4fv(g.dust.u.uVP, false, VP); gl.uniform1f(g.dust.u.uTime, ST.clock); gl.uniform1f(g.dust.u.uPx, H / 180); gl.uniform1f(g.dust.u.uAmt, (fx.dust ? (lightBg ? 0.35 : 0.8) * amt : 0) + burst * 0.9); gl.uniform3fv(g.dust.u.uCol, lightBg ? [0.5, 0.45, 0.35] : [1, 0.86, 0.62]); gl.drawArrays(gl.POINTS, 0, g.N); gl.depthMask(true); gl.bindBuffer(gl.ARRAY_BUFFER, g.quad); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); }
    gl.disable(gl.DEPTH_TEST);
    /* title in the lower third, then the film grain over everything */
    if (fx.title) { stTitle(g, lightBg); normal(); gl.useProgram(g.card.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, g.title.t); let sy = 0.25, sx = sy * (1024 / 220) / asp; if (sx > 1.75) { sy *= 1.75 / sx; sx = 1.75; } gl.uniformMatrix4fv(u.uMVP, false, m4.chain(m4.tr(0, -0.78, 0), m4.sc(sx, sy, 1))); gl.uniform1i(u.uMode, 4); gl.uniform1f(u.uAlpha, ST.rec || ST.playing ? stSeg(t, 0.03, 0.14) : 1); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    if (fx.grain) { gl.blendFunc(gl.DST_COLOR, gl.ZERO); gl.useProgram(g.grain.p); gl.uniform1f(g.grain.u.uTime, ST.clock); gl.uniform1f(g.grain.u.uAmt, 0.11 * amt); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    gl.disable(gl.BLEND);
  }
  function stUi() {
    const multiSel = stMulti(ST.anim), seq = ST.seqOn;
    for (const b of $$("#stCats [data-cat]")) b.setAttribute("aria-pressed", String(b.dataset.cat === ST.cat));
    for (const b of $$("#stAnims [data-anim]")) { const an = stAnim(b.dataset.anim); b.hidden = ST.cat !== "all" && an[4] !== ST.cat; b.disabled = seq && an[4] === "multi"; b.setAttribute("aria-pressed", String(!seq && b.dataset.anim === ST.anim)); }
    for (const b of $$("#stBacks [data-back]")) b.setAttribute("aria-pressed", String(b.dataset.back === ST.back)); for (const b of $$("#stFormat [data-fmt]")) b.setAttribute("aria-pressed", String(b.dataset.fmt === ST.fmt));
    $("#stSeqOn").checked = seq; $("#stSeqBox").hidden = !seq; const list = $("#stSeq"); list.textContent = "";
    ST.seq.forEach((id, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip stseq"; b.title = "Retirer de l'enchaînement"; b.innerHTML = "<i></i><span></span>" + ICO("close", 1); b.children[0].textContent = i + 1; b.children[1].textContent = stAnim(id)[1]; b.addEventListener("click", () => { ST.seq.splice(i, 1); if (ST.seq.length) ST.dur = stSeqDur(); ST.t = 0; stSave(); stUi(); }); list.append(b); });
    $("#stSeqHint").textContent = !ST.seq.length ? "Clique sur des mouvements dans l'ordre voulu : ils s'ajoutent ici, six au plus." : ST.seq.length >= 6 ? "Six mouvements, c'est le maximum. Clique sur un élément de la liste pour le retirer." : "Clique sur un autre mouvement pour l'ajouter, ou sur un élément de la liste pour le retirer.";
    $("#stColors").hidden = ST.back !== "custom"; $("#stC1").value = ST.c1; $("#stC2").value = ST.c2; $("#stDur").value = ST.dur; $("#o-stDur").value = crNum(ST.dur) + " s"; $("#stZoom").value = Math.round(ST.zoom * 100); $("#o-stZoom").value = Math.round(ST.zoom * 100) + " %"; $("#stCam").value = ST.cam; $("#o-stCam").value = (ST.cam > 0 ? "+" : "") + ST.cam + "°"; $("#stFxAmt").value = Math.round(ST.fxAmt * 100); $("#o-stFxAmt").value = Math.round(ST.fxAmt * 100) + " %";
    $("#stFlip").checked = !!ST.flip; $("#stLoop").checked = ST.loop; for (const [k] of ST_FX) { const el = $("#stfx-" + k); if (el) { el.checked = !!ST.fx[k]; if (k === "trail") el.disabled = multiSel && !seq; } }
    $("#stPlay").innerHTML = ICO(ST.playing ? "pause" : "play"); $("#stPlay").title = ST.playing ? "Mettre en pause (Espace)" : "Lire (Espace)"; $("#stPlay").setAttribute("aria-label", $("#stPlay").title);
    const c = curCard(); $("#stName").textContent = (c && c.name) || "Carte " + (project.cardIndex + 1); const [ew, eh] = ST_FMT[ST.fmt]; const n = project.cards.length;
    $("#stMultiNote").hidden = !(multiSel && !seq && ST.anim !== "duo" && n < 3); $("#stRecNote").textContent = `Vidéo ${ew} × ${eh} px, ${crNum(ST.dur)} s, enregistrée en temps réel. L'image PNG reprend l'instant affiché.`;
  }
  function stTime() { const el = $("#stSeek"); if (document.activeElement !== el || ST.playing) el.value = Math.round(ST.t * 1000); $("#stTime").value = crNum(ST.t * ST.dur) + " / " + crNum(ST.dur) + " s"; }
  function stFrame(now) {
    ST.raf = 0; if (ui.page !== "studio") return; const dt = Math.min(0.1, (now - ST.last) / 1000 || 0.016); ST.last = now; ST.clock += dt;
    if (ST.playing) { ST.t += dt / ST.dur; if (ST.t >= 1) { if (ST.rec) { ST.t = 1; ST.playing = false; const done = ST.rec.done; setTimeout(done, 120); } else if (ST.loop) ST.t -= Math.floor(ST.t); else { ST.t = 1; ST.playing = false; stUi(); } } }
    try { stDraw(ST.t); } catch (e) { if (!ST.err) { ST.err = true; console.error(e); toast("Le Studio n'a pas pu s'afficher : " + (e && e.message || e)); } }
    stTime(); ST.raf = requestAnimationFrame(stFrame);
  }
  function studioEnter() {
    let g = null; try { g = stInit(); } catch (e) { console.error(e); } $("#stNoGl").hidden = !!(g && R); if (!g || !R) return;
    ST.keep = [canvas.width, canvas.height]; ST.pw = 0; ST.err = false; for (const e of g.faces.values()) { e.fs = -1; e.bs = -1; } g.title.key = ""; stUi(); ST.last = performance.now(); if (!ST.raf) ST.raf = requestAnimationFrame(stFrame);
  }
  function studioLeave() { if (ST.raf) cancelAnimationFrame(ST.raf); ST.raf = 0; if (ST.keep) { canvas.width = ST.keep[0]; canvas.height = ST.keep[1]; ST.keep = null; } ST.pw = 0; try { resize(); } catch (e) {} ui.dirty = true; }
  async function studioRecord() {
    const g = ST.g; if (!g || ST.rec) return; if (typeof MediaRecorder === "undefined" || !g.cvs.captureStream) { toast("L'enregistrement vidéo n'est pas disponible dans ce navigateur"); return; }
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }); if (!mime) { toast("Aucun format vidéo pris en charge par ce navigateur"); return; }
    let finish; const ended = new Promise(res => { finish = res; }); ST.rec = { done: finish }; ST.t = 0; ST.playing = true; $("#stSide").classList.add("is-busy"); $("#stRec").disabled = true; stUi(); stDraw(0);
    const stream = g.cvs.captureStream(30), rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 10000000 }), chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); }; const stopped = new Promise(res => { rec.onstop = res; });
    rec.start(200); toast(`Enregistrement de la vidéo… ${crNum(ST.dur)} secondes`);
    try { await ended; rec.stop(); await stopped; } finally { for (const tr of stream.getTracks()) tr.stop(); ST.rec = null; ST.pw = 0; $("#stSide").classList.remove("is-busy"); $("#stRec").disabled = false; ST.t = 0; ST.playing = true; stUi(); }
    const blob = new Blob(chunks, { type: mime.split(";")[0] }); if (!blob.size) { toast("La vidéo n'a pas pu être enregistrée"); return; }
    await saveFile(`layrys-studio-${slugify(curCard().name || "carte")}-${ST.seqOn && ST.seq.length ? "enchainement" : ST.anim}.${mime.includes("mp4") ? "mp4" : "webm"}`, blob); toast("Vidéo prête");
  }
  async function studioShot() { const g = ST.g; if (!g) return; stDraw(ST.t); const blob = await toBlob(g.cvs); if (blob) { await saveFile(`layrys-studio-${slugify(curCard().name || "carte")}.png`, blob); toast("Image enregistrée"); } }
  /* a sequence lasts three quarters of the sum of its movements, between 3 and 16 seconds */
  function stSeqDur() { return Math.min(16, Math.max(3, Math.round(ST.seq.reduce((s, id) => s + stAnim(id)[3], 0) * 0.75 * 2) / 2)); }
  { const cats = $("#stCats"); for (const [id, label] of ST_CATS) { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.cat = id; b.textContent = label; b.addEventListener("click", () => { ST.cat = id; stUi(); }); cats.append(b); }
    const an = $("#stAnims"); for (const [id, label, sub, dur, cat] of ST_ANIMS) { const b = document.createElement("button"); b.type = "button"; b.className = "sttile"; b.dataset.anim = id; b.innerHTML = "<b></b><span></span>"; b.children[0].textContent = label; b.children[1].textContent = sub;
      b.addEventListener("click", () => { if (ST.seqOn) { if (cat === "multi") return; if (ST.seq.length >= 6) { toast("Six mouvements au plus dans un enchaînement"); return; } ST.seq.push(id); ST.dur = stSeqDur(); } else { ST.anim = id; ST.dur = dur; } ST.t = 0; ST.playing = true; stSave(); stUi(); }); an.append(b); }
    const bk = $("#stBacks"); for (const [id, label, c1, c2] of ST_BACKS) { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.back = id; const sw = document.createElement("i"); sw.className = "stsw"; sw.style.background = c1 ? `radial-gradient(circle at 50% 35%, ${c1}, ${c2})` : id === "auto" ? "conic-gradient(#e2590a, #e8b44a, #2a6fd6, #9b3fd0, #e2590a)" : "linear-gradient(135deg, #888, #222)"; b.append(sw, document.createTextNode(label)); b.addEventListener("click", () => { ST.back = id; stSave(); stUi(); }); bk.append(b); }
    const fxb = $("#stFx"); for (const [k, label] of ST_FX) { const l = document.createElement("label"); l.className = "check"; const i = document.createElement("input"); i.type = "checkbox"; i.id = "stfx-" + k; i.addEventListener("change", () => { ST.fx[k] = i.checked; stSave(); }); l.append(i, document.createTextNode(" " + label)); fxb.append(l); }
    for (const b of $$("#stFormat [data-fmt]")) b.addEventListener("click", () => { ST.fmt = b.dataset.fmt; stSave(); stUi(); });
    $("#stC1").addEventListener("input", e => { ST.c1 = e.target.value; stSave(); }); $("#stC2").addEventListener("input", e => { ST.c2 = e.target.value; stSave(); });
    $("#stDur").addEventListener("input", e => { ST.dur = +e.target.value; stSave(); stUi(); }); $("#stZoom").addEventListener("input", e => { ST.zoom = e.target.value / 100; stSave(); stUi(); }); $("#stCam").addEventListener("input", e => { ST.cam = +e.target.value; stSave(); stUi(); }); $("#stFxAmt").addEventListener("input", e => { ST.fxAmt = e.target.value / 100; stSave(); stUi(); });
    $("#stFlip").addEventListener("change", e => { ST.flip = e.target.checked; stSave(); }); $("#stLoop").addEventListener("change", e => { ST.loop = e.target.checked; stSave(); });
    $("#stSeqOn").addEventListener("change", e => { ST.seqOn = e.target.checked; if (ST.seqOn && !ST.seq.length && !stMulti(ST.anim)) ST.seq = [ST.anim]; if (ST.seqOn && ST.seq.length) ST.dur = stSeqDur(); else ST.dur = stAnim(ST.anim)[3]; if (ST.seqOn && ST.cat === "multi") ST.cat = "all"; ST.t = 0; ST.playing = true; stSave(); stUi(); });
    $("#stSeqClear").addEventListener("click", () => { ST.seq = []; ST.t = 0; stSave(); stUi(); });
    $("#stRandom").addEventListener("click", () => { const pick = arr => arr[Math.floor(Math.random() * arr.length)]; const singles = ST_ANIMS.filter(x => x[4] !== "multi"), pool = project.cards.length >= 3 ? ST_ANIMS : singles; ST.seqOn = false; const an2 = pick(pool); ST.anim = an2[0]; ST.dur = an2[3]; ST.back = pick(ST_BACKS.filter(x => x[0] !== "custom"))[0]; ST.flip = Math.random() < 0.5;
      for (const [k] of ST_FX) ST.fx[k] = Math.random() < 0.42; ST.fx.floor = true; ST.fx.shadow = true; ST.fx.vignette = true; ST.fx.title = false; ST.t = 0; ST.playing = true; ST.cat = "all"; stSave(); stUi(); toast(an2[1] + " · " + ST_BACKS.find(x => x[0] === ST.back)[1]); });
    $("#stPlay").addEventListener("click", () => { if (ST.rec) return; if (!ST.playing && ST.t >= 1) ST.t = 0; ST.playing = !ST.playing; stUi(); });
    $("#stSeek").addEventListener("input", e => { if (ST.rec) return; ST.playing = false; ST.t = e.target.value / 1000; stUi(); });
    const step = dir => { const n = project.cards.length; if (n > 1) { setCard((project.cardIndex + dir + n) % n); ST.autoKey = null; stUi(); } }; $("#stPrev").addEventListener("click", () => step(-1)); $("#stNext").addEventListener("click", () => step(1));
    $("#stRec").addEventListener("click", () => studioRecord().catch(e => { console.error(e); ST.rec = null; $("#stRec").disabled = false; toast("Vidéo impossible : " + (e && e.message || e)); })); $("#stShot").addEventListener("click", () => studioShot());
    document.addEventListener("keydown", e => { if (ui.page !== "studio" || e.key !== " " || /input|textarea|select|button/i.test((document.activeElement && document.activeElement.tagName) || "")) return; e.preventDefault(); $("#stPlay").click(); });
    if (window.Layrys) { window.Layrys.studio = ST; window.Layrys.studioDraw = stDraw; window.Layrys.studioUi = stUi; }
  }
