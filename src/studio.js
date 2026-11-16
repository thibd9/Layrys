
  /* ---- v39: Studio. A small stage of its own films the cards: the card renderer draws the visible faces (so the finish reacts to the move),
     a second WebGL canvas places them in space: backdrop, floor (glossy, matte, playmat or none), shadows, reflection, halo, spotlight, rarity aura, foil glints,
     trail, particles, title, grain. Movements for one card, scenes for several cards and for a deck, sequences of movements.
     Several cards never cut through one another: a group turns as one rigid block, its cards stay parallel and are stacked by their thickness. ---- */
  const ST_CATS = [["all", "Tous"], ["in", "Entrées et sorties"], ["rot", "Rotations"], ["light", "Lumière et détails"], ["loop", "Boucles"], ["multi", "Plusieurs cartes"], ["deck", "Deck"], ["custom", "Personnalisé"]];
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
    ["custom", "Mouvement personnalisé", "Tes propres poses, enchaînées en douceur", 8, "custom"],
    ["fan", "Éventail", "Les cartes s'ouvrent en éventail, comme une main", 8, "multi"],
    ["parade", "Défilé", "Les cartes tournent en carrousel", 10, "multi"],
    ["cascade", "Cascade", "Elles tombent en ligne avec un rebond, puis une vague les parcourt", 8, "multi"],
    ["duo", "Recto et verso", "La même carte, face et dos côte à côte", 8, "multi"],
    ["deck", "Formation du deck", "Éparpillées sur la table, les cartes se rassemblent en pile", 9, "deck"],
    ["shuffle", "Mélange", "Coupe en deux, les cartes tombent en alternance, puis tout se resserre", 9, "deck"],
    ["deal", "Distribution", "Trois cartes distribuées face cachée, puis retournées une à une", 10, "deck"],
    ["ribbon", "Ruban", "Le deck s'étale en arc, se resserre et se rouvre, puis se referme", 9, "deck"],
  ];
  const ST_BACKS = [["dark", "Studio sombre", "#2c2824", "#0b0a09"], ["warm", "Nuit ambrée", "#5c2609", "#1a0a03"], ["blue", "Nuit bleue", "#1c2c50", "#060a15"], ["violet", "Velours violet", "#3d1d58", "#0d0616"], ["green", "Vert profond", "#12402f", "#04120c"], ["light", "Cyclo clair", "#f5f2ec", "#cdc7b9"], ["auto", "Couleur de la carte", "", ""], ["custom", "Personnalisé", "", ""]];
  const ST_FLOORS = [["none", "Aucun"], ["gloss", "Brillant"], ["matte", "Mat"], ["mat", "Tapis de jeu"]];
  const ST_FX = [["shadow", "Ombre portée"], ["spot", "Projecteur"], ["halo", "Halo derrière la carte"], ["rim", "Aura de rareté"], ["sweep", "Reflet qui balaie la carte"], ["glint", "Étincelles sur la finition"], ["trail", "Traînée de mouvement"], ["dust", "Poussières lumineuses"], ["rays", "Rayons de lumière"], ["title", "Nom de la carte"], ["grain", "Grain de film"], ["vignette", "Vignettage"]];
  const ST_FMT = { "1:1": [1080, 1080], "4:5": [1080, 1350], "9:16": [1080, 1920], "16:9": [1920, 1080] };
  const ST_RARE = { "Commune": [0.8, 0.82, 0.86], "Peu commune": [0.42, 0.9, 0.58], "Rare": [0.4, 0.66, 1], "Super rare": [0.72, 0.5, 1], "Ultra rare": [1, 0.8, 0.34], "Secrète": null, "Hyper rare": null };
  const ST = { g: null, t: 0, clock: 0, last: 0, raf: 0, playing: true, rec: null, anim: "hero", cat: "all", seqOn: false, seq: [], back: "dark", floor: "gloss", fmt: "4:5", dur: 8, loop: true, zoom: 1, cam: 4, flip: false, fxAmt: 1, count: 5, cards: [], rotate: false, lap: 0, kSel: 0, kLoop: true,
    keys: [{ yaw: -38, pitch: 6, roll: -3, x: -0.05, y: 0, z: -0.1 }, { yaw: 24, pitch: -5, roll: 2, x: 0.04, y: 0.02, z: 0.3 }, { yaw: 0, pitch: 0, roll: 0, x: 0, y: 0, z: 0 }],
    fx: { shadow: true, spot: false, halo: true, rim: false, sweep: true, glint: false, trail: false, dust: false, rays: false, title: false, grain: false, vignette: true }, c1: "#3b1d4a", c2: "#0c0612", keep: null, pw: 0 };
  const stAnim = id => ST_ANIMS.find(a => a[0] === id) || ST_ANIMS[0], stMulti = id => { const c = stAnim(id)[4]; return c === "multi" || c === "deck"; };
  try { const s = JSON.parse(localStorage.getItem("layrys-studio") || "null"); if (s) { for (const k of ["anim", "back", "floor", "fmt", "dur", "loop", "c1", "c2", "zoom", "cam", "flip", "fxAmt", "seqOn", "count", "rotate", "kLoop"]) if (s[k] !== undefined) ST[k] = s[k]; if (Array.isArray(s.keys) && s.keys.length) ST.keys = s.keys.slice(0, 8).map(k => ({ yaw: +k.yaw || 0, pitch: +k.pitch || 0, roll: +k.roll || 0, x: +k.x || 0, y: +k.y || 0, z: +k.z || 0 })); if (Array.isArray(s.cards)) ST.cards = s.cards.filter(x => typeof x === "string").slice(0, 40); for (const [k] of ST_FX) if (s.fx && typeof s.fx[k] === "boolean") ST.fx[k] = s.fx[k]; if (s.fx && s.fx.floor === false && s.floor === undefined) ST.floor = "matte"; if (Array.isArray(s.seq)) ST.seq = s.seq.filter(id => ST_ANIMS.some(a => a[0] === id) && !stMulti(id)).slice(0, 6); if (!ST_FMT[ST.fmt]) ST.fmt = "4:5"; if (!ST_ANIMS.some(a => a[0] === ST.anim)) ST.anim = "hero"; if (!ST_BACKS.some(a => a[0] === ST.back)) ST.back = "dark"; if (!ST_FLOORS.some(a => a[0] === ST.floor)) ST.floor = "gloss"; ST.count = Math.max(2, Math.min(24, Math.round(+ST.count) || 5)); } } catch (e) {}
  const stSave = () => { try { localStorage.setItem("layrys-studio", JSON.stringify({ anim: ST.anim, back: ST.back, floor: ST.floor, fmt: ST.fmt, dur: ST.dur, loop: ST.loop, c1: ST.c1, c2: ST.c2, zoom: ST.zoom, cam: ST.cam, flip: ST.flip, fxAmt: ST.fxAmt, seqOn: ST.seqOn, seq: ST.seq, count: ST.count, cards: ST.cards, rotate: ST.rotate, keys: ST.keys, kLoop: ST.kLoop, fx: ST.fx })); } catch (e) {} };
  const stIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, stOut = t => 1 - Math.pow(1 - t, 3), stSeg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))), TAU = Math.PI * 2;
  const stBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }, stBeat = (t, c, w) => Math.exp(-Math.pow((t - c) / w, 2)), stHash = k => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
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
    else if (id === "custom") { const ks = ST.keys, n = ks.length; if (n) { const segs = n === 1 ? 1 : ST.kLoop ? n : n - 1, pos = Math.min(segs - 1e-6, Math.max(0, t) * segs), i = Math.floor(pos), e = stIO(pos - i), A = ks[i % n], B = ks[(i + 1) % n], Rd = Math.PI / 180, mx = (u, v) => u + (v - u) * e; p.yaw = mx(A.yaw, B.yaw) * Rd; p.pitch = mx(A.pitch, B.pitch) * Rd; p.roll = mx(A.roll, B.roll) * Rd; p.x = mx(A.x, B.x); p.y = mx(A.y, B.y); p.z = mx(A.z, B.z); } }
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
  const ST_FLOOR_Y = -0.585, ST_THK = 0.0075;
  /* the cards on stage, as indexes in the series: the ones the user picked, in the order picked; without a choice, the whole series from the displayed card on */
  function stChosen() { const n = project.cards.length, cur = project.cardIndex, idx = ST.cards.map(id => project.cards.findIndex(c => c.id === id)).filter(i => i >= 0); if (idx.length) return idx; const all = []; for (let k = 0; k < n; k++) all.push((cur + k) % n); return all; }
  function stStep(t) { if (!(ST.seqOn && ST.seq.length)) return 0; const steps = stSeqSteps(); const i = steps.findIndex(s => t < s.b); return i < 0 ? steps.length - 1 : i; }
  /* Scattered layout of the "gather" scene, worked out once per number of cards: places on a ring that leaves the middle free for the pile,
     resting height of each card (how many cards lie under it) and the order in which they leave: the ones on top first, as a hand would take them. */
  function stScatter(N) {
    if (ST.scat && ST.scat.n === N) return ST.scat; const x = [], y = [], roll = [], lvl = [];
    for (let k = 0; k < N; k++) { const ph = k * 2.399 + 0.7, r0 = 1.32 + 0.5 * stHash(k + 1); x.push(Math.cos(ph) * r0); y.push(Math.sin(ph) * r0 * 0.95); roll.push((stHash(k + 31) - 0.5) * 2.6); let L = 0; for (let j = 0; j < k; j++) if (Math.hypot(x[k] - x[j], y[k] - y[j]) < 1.23) L = Math.max(L, lvl[j] + 1); lvl.push(L); }
    const order = [...Array(N).keys()].sort((i, j) => lvl[j] - lvl[i] || i - j), rank = []; order.forEach((k, r) => { rank[k] = r; }); ST.scat = { n: N, x, y, roll, lvl, rank }; return ST.scat;
  }
  /* What is on stage at time t. One card, or a group: grp = orientation and place of the whole group (a rigid block), inst = the cards inside it.
     Inside a group the cards keep the same orientation and differ only by their place, their in-plane turn (roll) and their height (z):
     parallel planes cannot cross, and every scene is laid out so that two cards never share a height where they overlap.
     A card turns over (yaw) only alone, lifted, with nothing above or beside it within its reach.
     ext = half width and half height to frame; table = lying on the floor; stack = cards lie on one another (they cast shadows on those beneath);
     zoomK = how much the camera has moved in. On the table, x runs to the right, y away from the camera, z up. */
  function stScene(t) {
    const cur = project.cardIndex, id = ST.seqOn && ST.seq.length ? "" : ST.anim, a = aspect(), grp = { yaw: 0, pitch: 0, x: 0, y: 0, z: 0 }, ch = stChosen(), lead = ST.cards.length ? ch[0] : cur;
    if (!id || !stMulti(id)) return { inst: [{ ci: ST.rotate && ch.length > 1 ? ch[(ST.lap + stStep(t)) % ch.length] : lead, p: stPoseAt(t) }], grp, ext: null, single: true, table: false, stack: false, zoomK: 1 };
    const cap = { fan: 13, parade: 12, cascade: 9, duo: 2 }[id] || 24, N = id === "duo" ? 2 : Math.max(2, Math.min(cap, ST.count)), ci = k => id === "duo" ? lead : ch[k % ch.length], inst = [], mid = (N - 1) / 2, thk = ST_THK; let ext = { w: 1, h: 0.7 }, table = false, zoomK = 1;
    if (id === "deck" || id === "shuffle" || id === "deal" || id === "ribbon") { table = true; grp.pitch = -Math.PI / 2; grp.y = ST_FLOOR_Y + 0.004; }
    for (let k = 0; k < N; k++) { const p = stP0(), f = k - mid, h1 = stHash(k + 1), h2 = stHash(k + 31);
      if (id === "fan") {
        /* a hand of cards: it opens with a little overshoot, breathes, and the whole hand sways as one */
        const s = stBack(stSeg(t, 0.05, 0.36)), br = 1 + 0.04 * Math.sin(t * TAU * 1.5) * stSeg(t, 0.42, 0.55), step = Math.min(0.25, 1.4 / Math.max(1, N - 1)), ang = f * step * s * br, L = 1.3;
        p.roll = -ang; p.x = Math.sin(ang) * L; p.y = Math.cos(ang) * L - L - 0.03; p.z = k * thk * 1.6; grp.yaw = 0.18 * Math.sin(t * TAU) * stSeg(t, 0.2, 0.45); grp.pitch = 0.05; stSweep(p, t, 0.44 + k * 0.02, 0.76 + k * 0.02); ext = { w: Math.sin(step * mid) * L + a * 0.62, h: 0.82 };
      } else if (id === "parade") { const Rr = Math.max(0.95, N * 0.27), ph = -t * TAU + k * TAU / N; p.x = Math.sin(ph) * Rr; p.z = Math.cos(ph) * Rr - Rr; p.yaw = ph * 0.62; p.y = 0.02 * Math.sin(t * TAU * 2 + k); ext = { w: Rr + a * 0.3, h: 0.66 };
      } else if (id === "cascade") {
        /* the cards drop into a row one after another, each with a small bounce; then a wave runs along the row. The first card is already falling when the film starts */
        const t0 = k * (0.42 / N), u = stSeg(t, t0 - 0.14, t0 + 0.04), sp = Math.min(0.5, 1.9 / N), w = stSeg(t, 0.72, 0.94);
        p.x = f * sp; p.y = 1.9 * (1 - u * u) * (u < 1 ? 1 : 0) + 0.07 * Math.sin(Math.PI * stSeg(t, t0 + 0.04, t0 + 0.14)) + 0.06 * stBeat(k / Math.max(1, N - 1), w * 1.4 - 0.2, 0.16) * (w > 0 && w < 1 ? 1 : 0);
        p.roll = (1 - u) * 0.45 * (k % 2 ? 1 : -1); p.z = k * 0.03; p.burst = k === N - 1 ? 0.45 * stBeat(t, t0 + 0.04, 0.04) : 0; grp.yaw = 0.12 * Math.sin(t * TAU) * stSeg(t, 0.6, 0.8); stSweep(p, t, 0.6 + k * 0.015, 0.76 + k * 0.015); ext = { w: mid * sp + a * 0.6, h: 0.66 };
      } else if (id === "duo") { const sg = k ? 1 : -1; p.x = sg * (a * 0.5 + 0.07); p.yaw = (k ? Math.PI : 0) - sg * (0.24 + 0.1 * Math.sin(t * TAU)); p.y = 0.025 * Math.sin(t * TAU + k * Math.PI); p.pitch = 0.04; if (!k) stSweep(p, t, 0.3, 0.7); ext = { w: a + 0.2, h: 0.66 };
      } else if (id === "deck") {
        /* cards lie scattered around the middle; the ones on top leave first: each slides to the middle, straightens and lands on the pile from above; a last tap squares the deck.
           A card that left earlier is always higher than the next one while they overlap, and lower once both are near the pile: they never meet */
        const sc = stScatter(N), r = sc.rank[k], t0 = 0.08 + r * (0.54 / N), u = stSeg(t, t0, t0 + 0.22), e = stIO(u), sq = stIO(stSeg(t, 0.84, 0.91)), bend = 0.1 * Math.sin(Math.PI * u), rr0 = Math.hypot(sc.x[k], sc.y[k]);
        p.x = sc.x[k] * (1 - e) + (h1 - 0.5) * 0.03 * e * (1 - sq) - sc.y[k] / rr0 * bend; p.y = sc.y[k] * (1 - e) + (h2 - 0.5) * 0.03 * e * (1 - sq) + sc.x[k] / rr0 * bend; p.roll = sc.roll[k] * (1 - stBack(u)) + (h1 - 0.5) * 0.1 * e * (1 - sq);
        p.z = sc.lvl[k] * thk * (1 - e) + r * thk * e + 0.12 * Math.sin(Math.PI * u) + 0.025 * Math.sin(Math.PI * stSeg(t, 0.88, 0.95)); p.lx = Math.sin(t * TAU) * 0.6; p.burst = k ? 0 : 0.45 * stBeat(t, 0.91, 0.04); stSweep(p, t, 0.91, 0.995);
        grp.yaw = -0.16 + 0.36 * stIO(t); zoomK = 1 + 1.7 * stIO(stSeg(t, 0.64, 0.97)); ext = { w: 2.45, h: 1.75 };
      } else if (id === "shuffle") {
        /* riffle. The deck is cut: the top half is lifted over and set down beside the other, clear of it. Both halves are raised, brought together so that their ends overlap
           (the right one half a thickness higher: the planes never coincide), the cards fall in turn from the left and from the right, then the two halves are pushed into one */
        const half = Math.ceil(N / 2), left = k < half, i = left ? k : k - half, m = left ? 2 * i : Math.min(N - 1, 2 * i + 1), side = left ? -1 : 1;
        const cutL = stSeg(t, 0.03, 0.16), cut = stIO(cutL), up = stIO(stSeg(t, 0.17, 0.25)), inn = stIO(stSeg(t, 0.26, 0.32)), t0 = 0.34 + m * (0.4 / N), u = stSeg(t, t0, t0 + 0.06), push = stBack(stSeg(t, 0.8, 0.9)), tap = Math.sin(Math.PI * stSeg(t, 0.9, 0.97));
        const zHeld = (left ? k : k + (i - k) * cut) * thk + (left ? 0 : 0.2 * Math.sin(Math.PI * cutL)) + (0.26 + (left ? 0 : thk * 0.5)) * up, zDown = m * thk;
        p.x = side * (0.38 * cut - 0.08 * inn) * (1 - push); p.roll = -side * 0.05 * cut * (1 - push); p.z = zHeld + (zDown - zHeld) * u * u + 0.018 * Math.sin(Math.PI * stSeg(t, t0 + 0.06, t0 + 0.1)) + 0.025 * tap; p.lx = Math.sin(t * TAU) * 0.6;
        p.burst = k ? 0 : 0.45 * stBeat(t, 0.91, 0.04); stSweep(p, t, 0.92, 0.995); grp.yaw = 0.12 - 0.26 * stIO(t); zoomK = 1 + 0.3 * stIO(stSeg(t, 0.78, 0.97)); ext = { w: 0.98, h: 0.8 };
      } else if (id === "deal") {
        /* the deck lies face down at the back; three cards are dealt to three separate places in front, still face down, then turned over one at a time.
           The places do not overlap and only one card turns at once, lifted above its place: nothing is within its reach */
        const M = Math.min(3, N - 1), j = N - 1 - k, dealt = j < M, dy = 0.6;
        if (!dealt) { p.y = dy; p.z = k * thk; p.yaw = Math.PI; }
        else { const sx = (j - (M - 1) / 2) * 0.78, sy = -0.55, t0 = 0.05 + j * 0.1, u = stSeg(t, t0, t0 + 0.2), e = stOut(u), t1 = 0.5 + j * 0.14, v = stSeg(t, t1, t1 + 0.13), fl = stIO(v);
          p.x = sx * e; p.y = dy + (sy - dy) * e; p.roll = Math.PI * (1 - e) + (h1 - 0.5) * 0.08 * e * (1 - fl); p.z = k * thk * (1 - e) + 0.1 * Math.sin(Math.PI * u) + 0.52 * Math.sin(Math.PI * v); p.yaw = Math.PI * (1 - fl); p.burst = 0.4 * stBeat(t, t1 + 0.13, 0.03); stSweep(p, t, t1 + 0.14, t1 + 0.4); }
        p.lx = Math.sin(t * TAU) * 0.6; grp.yaw = 0.08 * Math.sin(t * TAU * 0.5); zoomK = 1 + 0.1 * stIO(stSeg(t, 0.5, 0.95)); ext = { w: 0.78 + a * 0.5 + 0.2, h: 1.2 };
      } else {
        /* ribbon: the deck spreads into an even arc, the ribbon closes up and opens again like a bellows, then it gathers. The cards only slide on one another */
        const sp = Math.min(0.24, 2.5 / N), s = stOut(stSeg(t, 0.06, 0.34)), gth = stIO(stSeg(t, 0.8, 0.93)), bre = 1 - 0.42 * Math.pow(Math.sin(Math.PI * stSeg(t, 0.4, 0.76) * 2), 2), e = s * (1 - gth) * bre, pos = k / Math.max(1, N - 1);
        p.x = f * sp * e; p.y = -Math.pow(f / (mid + 0.001), 2) * 0.14 * e; p.roll = -f / (mid + 0.001) * 0.32 * e; p.z = k * thk + 0.025 * Math.sin(Math.PI * stSeg(t, 0.93, 0.99)); p.lx = Math.sin(t * TAU) * 0.6; stSweep(p, t, 0.36 + pos * 0.05, 0.5 + pos * 0.05);
        grp.yaw = 0.08 * Math.sin(t * TAU); zoomK = 1 + 0.25 * stIO(stSeg(t, 0.82, 0.98)); ext = { w: mid * sp + a * 0.62, h: 0.82 };
      }
      if (ST.flip) { p.roll = -p.roll; p.x = -p.x; if (!table) p.yaw = -p.yaw; } inst.push({ ci: ci(k), p });
    }
    if (ST.flip) grp.yaw = -grp.yaw; return { inst, grp, ext, single: false, table, stack: id !== "duo" && id !== "parade", zoomK };
  }
  /* 4 x 4 matrices, column major */
  const m4 = { mul: (a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
    id: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), tr: (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]), sc: (x, y, z) => new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
    rx: a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }, ry: a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }, rz: a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); },
    persp: (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); },
    pt: (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]],
    chain: (...ms) => ms.reduce((a, b) => m4.mul(a, b)) };
  const stRgb = h => { const n = parseInt(String(h).replace("#", ""), 16) || 0; return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  function stInit() {
    if (ST.g) return ST.g; const cvs = $("#stCanvas"); const gl = cvs.getContext("webgl", { alpha: false, antialias: true, preserveDrawingBuffer: false }); if (!gl) return null;
    const prog = (vs, fs, attr) => { const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("studio shader: " + gl.getShaderInfoLog(s)); return s; }; const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, attr); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("studio link: " + gl.getProgramInfoLog(p)); const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); } return { p, u }; };
    const flat = "attribute vec2 aPos; varying vec2 vUv; void main(){ vUv=aPos+.5; gl_Position=vec4(aPos*2.,0.,1.); }";
    const bg = prog(flat,
      "precision mediump float; varying vec2 vUv; uniform vec3 uC1,uC2,uHaloCol; uniform float uAspect,uVig,uHalo,uFloor,uFl,uTime,uRays,uSpot; uniform vec2 uCard,uCardR;\n" +
      "float h21(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }\n" +
      "void main(){ vec2 p=vUv*2.-1.; p.x*=uAspect; float r=length(p-vec2(0.,.12)); vec3 col=mix(uC1,uC2,smoothstep(0.,1.55,r));\n" +
      " float fl=smoothstep(uFloor+.03,uFloor-.5,p.y); col=mix(col, col*.82+uC1*.1, fl*.55*uFl);\n" +
      " vec2 q=(p-uCard)/uCardR; float ql=length(q); col+=uHaloCol*uHalo*exp(-dot(q,q)*1.25);\n" +
      " if(uRays>0.){ float an=atan(q.y,q.x); float ry=pow((sin(an*6.+uTime*.21)*.5+.5)*(sin(an*11.-uTime*.13)*.5+.5),1.6); col+=uHaloCol*uRays*ry*exp(-ql*.5)*smoothstep(.25,1.1,ql)*.9; }\n" +
      " if(uSpot>0.){ float up=clamp((1.05-p.y)/2.1,0.,1.); float bw=.1+up*.42*uCardR.x*1.6; float beam=exp(-pow((p.x-uCard.x)/bw,2.))*smoothstep(uFloor-.02,uFloor+.3,p.y)*(.35+.65*up); col+=uHaloCol*uSpot*beam*.34; }\n" +
      " col*=mix(1., smoothstep(1.9,.45,length(p*vec2(.9,1.))), uVig); col+=(h21(gl_FragCoord.xy)-.5)/255.; gl_FragColor=vec4(col,1.); }", "aPos");
    const card = prog("attribute vec2 aPos; uniform mat4 uMVP,uM; varying vec2 vUv; varying float vWy; void main(){ vUv=aPos+.5; vWy=(uM*vec4(aPos,0.,1.)).y; gl_Position=uMVP*vec4(aPos,0.,1.); }",
      "precision mediump float; varying vec2 vUv; varying float vWy; uniform sampler2D uTex; uniform vec2 uSize,uCardSize; uniform float uRad,uAlpha,uFade,uShade,uSweep,uSweepAmt,uClip,uClipY,uTime,uGlint; uniform int uMode; uniform vec3 uCol,uPool,uGlow,uFar; uniform vec2 uSoft,uLit;\n" +
      "float rr(vec2 p, vec2 hf, float r){ vec2 d=abs(p)-(hf-vec2(r)); return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }\n" +
      "float h21(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }\n" +
      "void main(){ if(uMode==2){ vec2 q=(vUv-.5)*2.; float r=dot(q,q); gl_FragColor=vec4(uCol, exp(-r*3.4)*(1.-smoothstep(.75,1.,r))*uAlpha); return; }\n" +
      " if(uMode==5){ vec2 w=(vUv-.5)*uSize; float d=length(w-uPool.xy); float pool=exp(-d*d*uPool.z); float fade=1.-smoothstep(uSize.x*.16,uSize.x*.46,length(w)); vec3 c=mix(uCol*(.55+.95*pool), uFar, smoothstep(.4,4.2,w.y))+uGlow*exp(-d*d*.75);\n" +
      "  if(uFade>.5){ vec2 g=floor(w*150.); c*=.9+.18*h21(g); float ring=1.-smoothstep(.0,.014,abs(d-1.12)); c+=uCol*.3*ring; } gl_FragColor=vec4(c,fade*uAlpha); return; }\n" +
      " if(uClip*(vWy-uClipY)<0.) discard;\n" +
      " if(uMode==1){ gl_FragColor=vec4(uCol*uShade,uAlpha); return; }\n" +
      " if(uMode==4){ vec4 t=texture2D(uTex,vUv); gl_FragColor=vec4(t.rgb, t.a*uAlpha); return; }\n" +
      " if(uMode==6){ float sd=rr((vUv-.5)*uSize, uCardSize*.5, uRad); gl_FragColor=vec4(0.,0.,0.,(1.-smoothstep(-uFade*.5,uFade,sd))*uAlpha); return; }\n" +
      " if(uMode==3){ float sd=max(rr((vUv-.5)*uSize, uCardSize*.5, uRad),0.); float gw=exp(-sd*34.)*(1.-smoothstep(.07,.145,sd))*smoothstep(uSoft.x,uSoft.y,vWy); gl_FragColor=vec4(uCol*gw*uAlpha,0.); return; }\n" +
      " float sd=rr((vUv-.5)*uSize, uSize*.5, uRad); float a=1.-smoothstep(-.004,.0012,sd); if(a<.01) discard;\n" +
      " vec3 c=texture2D(uTex,vUv).rgb*uShade; c*=1.-.09*smoothstep(-.03,0.,sd); vec2 ld=(vUv-uLit)*vec2(1.,1.25); float sh=exp(-dot(ld,ld)*2.3); c=c*(.94+.1*sh)+.022*sh; float s=(vUv.x*.8+(1.-vUv.y)*.38)-uSweep; c+=vec3(1.,.97,.9)*uSweepAmt*exp(-s*s*34.);\n" +
      " if(uGlint>0.){ for(int i=0;i<7;i++){ float fi=float(i); vec2 gp=vec2(.12+.76*h21(vec2(fi,2.7)), .1+.8*h21(vec2(fi,8.3))); float tw=pow(max(0.,sin(uTime*(1.1+.5*h21(vec2(fi,4.1)))+fi*2.3+uShade*9.)),10.); vec2 dd=abs((vUv-gp)*uSize); float st=exp(-dd.x*70.)*exp(-dd.y*420.)+exp(-dd.y*70.)*exp(-dd.x*420.)+exp(-dot(dd,dd)*1800.)*.8; c+=vec3(1.,.98,.92)*st*tw*uGlint; } }\n" +
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
  /* draws the face of a card that looks at the camera; it.nx, it.ny = how that face is turned away from the viewer (view space) */
  function stRenderFace(g, it, o) {
    const gl = g.gl, p = it.p, front = it.front, c = it.ci === project.cardIndex ? project : project.cards[it.ci]; if (!c) return; let e = g.faces.get(it.ci); if (!e) { e = { f: g.tex(), b: g.tex(), fs: -1, bs: -1 }; g.faces.set(it.ci, e); }
    const cl = v => Math.max(-0.7, Math.min(0.7, v)), loc = cl(Math.asin(Math.max(-1, Math.min(1, it.nx)))), lp = cl(Math.asin(Math.max(-1, Math.min(1, -it.ny))));
    const lx = Math.max(-0.2, Math.min(1.2, 0.5 + p.lx * 0.5 - Math.sin(loc) * 0.55)), ly = 0.7 + lp * 1.2; gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.activeTexture(gl.TEXTURE0);
    if (front) { e.fs = g.tick; R.renderDoc(c.front, { ...o, pointer: [lx, ly], tilt: [loc * 0.9, lp * 0.9] }); gl.bindTexture(gl.TEXTURE_2D, e.f); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas); }
    else { e.bs = g.tick; const gb = ensureBack(); if (!gb || !c.back) return; gb.renderDoc(c.back, { ...o, pointer: [1 - lx, ly], tilt: [-loc * 0.9, lp * 0.9] }); gl.bindTexture(gl.TEXTURE_2D, e.b); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasBack); }
  }
  /* lower third: the name of the card and of the series, drawn once on a 2D canvas */
  function stTitle(g, light, ci, many) {
    const c = project.cards[ci] || curCard(), name = many ? (project.title || "Ma série") : (c && c.name) || "Carte " + (ci + 1), sub = many ? many + " cartes" : project.title || "", key = name + "|" + sub + "|" + light; if (g.title.key === key) return; g.title.key = key;
    const [cvs2, x] = cv(1024, 220); x.clearRect(0, 0, 1024, 220); x.textAlign = "center"; x.textBaseline = "middle"; const ink = light ? "#17140f" : "#ffffff"; if (!light) { x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = 18; x.shadowOffsetY = 3; }
    let size = 78; x.font = `600 ${size}px "Sora", "Figtree", "Segoe UI", sans-serif`; while (size > 34 && x.measureText(name).width > 960) { size -= 4; x.font = `600 ${size}px "Sora", "Figtree", "Segoe UI", sans-serif`; } x.fillStyle = ink; x.fillText(name, 512, 84);
    if (sub) { x.font = '500 34px "Figtree", "Segoe UI", sans-serif'; x.globalAlpha = 0.72; if ("letterSpacing" in x) x.letterSpacing = "3px"; x.fillText(sub.toUpperCase(), 512, 164); x.globalAlpha = 1; }
    const gl = g.gl; gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, g.title.t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cvs2);
  }
  /* colour of the aura: the rarity of the card when it has one (the two rarest shimmer through the rainbow), the colour of the backdrop otherwise */
  function stAura(ci, fallback) { const c = project.cards[ci], r = c && c.rarity; if (!r || !(r in ST_RARE)) return fallback; const v = ST_RARE[r]; if (v) return v; const h = ST.clock * 0.35 + ci; return [0.6 + 0.4 * Math.sin(h), 0.6 + 0.4 * Math.sin(h + 2.1), 0.6 + 0.4 * Math.sin(h + 4.2)]; }
  function stDraw(t) {
    const g = ST.g; if (!g || !R) return; const gl = g.gl; stResize(); g.tick++; const W = g.cvs.width, H = g.cvs.height, asp = W / H, a = aspect(), fx = ST.fx, amt = ST.fxAmt, sc = stScene(t), insts = sc.inst, L = lightDef(), floorOn = ST.floor !== "none", floorY = ST_FLOOR_Y;
    /* camera: a card is one unit tall; the framing follows the format, the scene and the two camera sliders. A deck on the table is watched from above */
    const frac = asp > 1.2 ? 0.7 : asp < 0.7 ? 0.5 : asp < 0.9 ? 0.6 : 0.64, fov = 0.5, th = Math.tan(fov / 2); let D = 1 / (2 * frac * th); if (sc.ext) D = Math.max(D, (sc.ext.w + 0.1) / (th * asp), (sc.ext.h + 0.12) / th); D /= ST.zoom * (sc.zoomK || 1);
    const camDeg = sc.table ? Math.max(ST.cam + 30, 36) : ST.cam, cam = camDeg * Math.PI / 180, look = sc.table ? floorY + 0.08 : -0.02;
    const P = m4.persp(fov, asp, Math.max(0.3, D * 0.3), D * 5 + 8), V = m4.chain(m4.tr(0, 0, -D), m4.rx(cam), m4.tr(0, -look, 0)), VP = m4.mul(P, V), d = fmtDims(), rad = d.r / d.h;
    const G = m4.chain(m4.tr(sc.grp.x, sc.grp.y, sc.grp.z), m4.ry(sc.grp.yaw), m4.rx(sc.grp.pitch));
    /* each card: its matrix in the world, its centre, the face that looks at the camera and how that face is turned */
    for (const it of insts) { const p = it.p; it.M = m4.chain(G, m4.tr(p.x, p.y, p.z), m4.ry(p.yaw), m4.rx(p.pitch), m4.rz(p.roll)); it.w = m4.pt(it.M, 0, 0, 0); const MV = m4.mul(V, it.M), vz = m4.pt(MV, 0, 0, 0); let nx = MV[8], ny = MV[9], nz = MV[10]; it.front = -(nx * vz[0] + ny * vz[1] + nz * vz[2]) >= 0; if (!it.front) { nx = -nx; ny = -ny; nz = -nz; } it.nx = nx; it.ny = ny; it.shade = 0.72 + 0.28 * Math.max(0, nz); it.depth = vz[2];
      const cs = [[-a / 2, -0.5], [a / 2, -0.5], [-a / 2, 0.5], [a / 2, 0.5]].map(q => m4.pt(it.M, q[0], q[1], 0)); it.minY = Math.min(...cs.map(q => q[1])); const xs = cs.map(q => q[0]), zs = cs.map(q => q[2]); it.fp = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2, Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)]; }
    const o = { aspect: a, intensity: ui.intensity * (L.power || 1), seed: ui.seed, selectedId: null, view: 0, light: { warm: L.warm, z: L.z, soft: L.soft || 0 }, proof: false, env: L.env || 0 };
    /* faces: any face never drawn is drawn now; beyond that, the two that waited longest are refreshed, so many cards cost no more than two */
    const stamp = it => { const e = g.faces.get(it.ci); return e ? (it.front ? e.fs : e.bs) : -1; };
    for (const it of insts) if (stamp(it) < 0) stRenderFace(g, it, o); const order = [...insts].sort((x, y) => stamp(x) - stamp(y)); for (let i = 0; i < Math.min(2, order.length); i++) if (stamp(order[i]) < g.tick) stRenderFace(g, order[i], o);
    const [c1, c2] = stColors(), lum = c1[0] * 0.3 + c1[1] * 0.59 + c1[2] * 0.11, lightBg = lum > 0.5, haloCol = lightBg ? [0.5, 0.48, 0.42] : [Math.min(1, c1[0] * 1.6 + 0.3), Math.min(1, c1[1] * 1.5 + 0.24), Math.min(1, c1[2] * 1.5 + 0.2)];
    const proj = (x, y, z) => { const w = VP[3] * x + VP[7] * y + VP[11] * z + VP[15]; return [(VP[0] * x + VP[4] * y + VP[8] * z + VP[12]) / w, (VP[1] * x + VP[5] * y + VP[9] * z + VP[13]) / w, w]; };
    const lead = sc.single ? insts[0].w : [sc.grp.x, sc.grp.y + (sc.table ? 0.1 : 0), sc.grp.z - (sc.table ? 0 : 0.2)], burst = Math.max(...insts.map(it => it.p.burst)), cc = proj(lead[0], lead[1], lead[2]), hs = 1 / Math.max(0.2, cc[2]) / th, wide = sc.single ? 1 : 1.9;
    gl.viewport(0, 0, W, H); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
    gl.useProgram(g.bg.p); gl.bindBuffer(gl.ARRAY_BUFFER, g.quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(g.bg.u.uC1, c1); gl.uniform3fv(g.bg.u.uC2, c2); gl.uniform1f(g.bg.u.uAspect, asp); gl.uniform1f(g.bg.u.uTime, ST.clock); gl.uniform1f(g.bg.u.uVig, fx.vignette ? (lightBg ? 0.35 : 0.8) : 0); gl.uniform1f(g.bg.u.uFloor, proj(0, floorY, 0)[1]); gl.uniform1f(g.bg.u.uFl, floorOn ? 0.5 : 0);
    gl.uniform2f(g.bg.u.uCard, cc[0] * asp, cc[1]); gl.uniform2f(g.bg.u.uCardR, (a * 0.5 + 0.42) * hs * wide, 0.95 * hs); gl.uniform3fv(g.bg.u.uHaloCol, haloCol); gl.uniform1f(g.bg.u.uHalo, (fx.halo ? (lightBg ? 0.18 : 0.34) * amt : 0) + burst * (lightBg ? 0.3 : 0.75));
    gl.uniform1f(g.bg.u.uRays, fx.rays ? (lightBg ? 0.22 : 0.5) * amt + burst * 0.3 : 0); gl.uniform1f(g.bg.u.uSpot, fx.spot ? (lightBg ? 0.5 : 1) * amt : 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const normal = () => gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND); normal(); gl.useProgram(g.card.p); const u = g.card.u; gl.uniform1i(u.uTex, 0); gl.activeTexture(gl.TEXTURE0); gl.uniform1f(u.uTime, ST.clock); gl.uniform1f(u.uClip, 0); gl.uniform1f(u.uClipY, floorY); gl.uniform1f(u.uGlint, 0); gl.uniformMatrix4fv(u.uM, false, m4.id());
    /* clip: 1 keeps what is above the floor, -1 what is below (the reflection); a card that crosses the floor rises out of it */
    const face = (it, M, alpha, fade, clip, sw) => { const e = g.faces.get(it.ci); if (!e) return; const Mf = m4.chain(M, it.front ? m4.id() : m4.ry(Math.PI), m4.sc(a, 1, 1)); gl.bindTexture(gl.TEXTURE_2D, it.front ? e.f : e.b); gl.uniformMatrix4fv(u.uMVP, false, m4.mul(VP, Mf)); gl.uniformMatrix4fv(u.uM, false, Mf); gl.uniform1f(u.uClip, floorOn && !sc.table ? clip : 0); /* cards lying on the table are never cut by it */ gl.uniform1i(u.uMode, 0); gl.uniform2f(u.uSize, a, 1); gl.uniform1f(u.uRad, rad); gl.uniform1f(u.uAlpha, alpha); gl.uniform1f(u.uFade, fade); gl.uniform1f(u.uShade, it.shade); gl.uniform2f(u.uLit, 0.5 - it.nx * 0.9, 0.62 - it.ny * 0.9); gl.uniform1f(u.uSweep, sw); gl.uniform1f(u.uSweepAmt, fx.sweep && sw > -0.9 && it.front ? 0.5 : 0); gl.uniform1f(u.uGlint, fx.glint && it.front && fade === 0 && alpha === 1 ? 0.9 * amt : 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.uniform1f(u.uClip, 0); gl.uniform1f(u.uGlint, 0); };
    const far = [...insts].sort(sc.stack ? (x, y) => x.p.z - y.p.z || x.depth - y.depth : (x, y) => x.depth - y.depth); /* a stack is drawn from the bottom up, so each shadow falls on what is already there */
    if (floorOn) {
      /* the floor: a plane that fades into the backdrop, lit by a pool of light under the cards */
      const kind = ST.floor, size = 14, col = kind === "gloss" ? [c2[0] * 0.5 + c1[0] * 0.22, c2[1] * 0.5 + c1[1] * 0.22, c2[2] * 0.5 + c1[2] * 0.22] : kind === "mat" ? [c1[0] * 0.82 + 0.03, c1[1] * 0.82 + 0.03, c1[2] * 0.82 + 0.03] : [c1[0] * 0.7 + 0.02, c1[1] * 0.7 + 0.02, c1[2] * 0.7 + 0.02];
      gl.uniformMatrix4fv(u.uMVP, false, m4.chain(VP, m4.tr(0, floorY, 0), m4.rx(-Math.PI / 2), m4.sc(size, size, 1))); gl.uniform1i(u.uMode, 5); gl.uniform2f(u.uSize, size, size); gl.uniform3fv(u.uCol, lightBg ? [col[0] * 1.02, col[1] * 1.02, col[2] * 1.02] : col); gl.uniform3f(u.uPool, lead[0], -lead[2], fx.spot ? 0.5 : 0.22); { const hy = proj(0, floorY, -30)[1], k = Math.min(1, Math.max(0, Math.abs(hy - 0.12) / 1.55)), e = k * k * (3 - 2 * k); gl.uniform3f(u.uFar, c1[0] + (c2[0] - c1[0]) * e, c1[1] + (c2[1] - c1[1]) * e, c1[2] + (c2[2] - c1[2]) * e); } { const ac = fx.rim ? stAura(insts[0].ci, haloCol) : haloCol, gk = ((fx.rim ? 0.22 : 0) + (fx.halo ? 0.1 : 0)) * amt * (lightBg ? 0.4 : 1) + burst * 0.25; gl.uniform3f(u.uGlow, ac[0] * gk, ac[1] * gk, ac[2] * gk); } /* the floor takes the colour of the halo and of the aura: the light does not stop at the horizon */ gl.uniform1f(u.uFade, kind === "mat" ? 1 : 0); gl.uniform1f(u.uAlpha, kind === "gloss" ? 0.8 : 0.95); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      /* shadows: a wide soft one and a tight contact one under each card or pile, lighter as the card rises */
      if (fx.shadow) { const done = []; for (const it of far) { const lift = it.minY - floorY; if (lift > 1.7 || lift < -0.6) continue; if (done.some(q => Math.abs(q[0] - it.fp[0]) < 0.12 && Math.abs(q[1] - it.fp[1]) < 0.12)) continue; done.push(it.fp); const up = Math.max(0, lift); gl.uniform1i(u.uMode, 2); gl.uniform3f(u.uCol, 0, 0, 0);
        for (const [pad, al, kf] of sc.table ? [[0.6, 0.26, 2.2]] : [[0.55, 0.36, 2.2], [0.14, 0.5, 9]]) { gl.uniformMatrix4fv(u.uMVP, false, m4.chain(VP, m4.tr(it.fp[0], floorY + 0.001, it.fp[1]), m4.rx(-Math.PI / 2), m4.sc((it.fp[2] + pad) * (1 + up * 0.5), (Math.max(it.fp[3], 0.12) + pad) * (1 + up * 0.5), 1))); gl.uniform1f(u.uAlpha, al * (lightBg ? 0.55 : 1) / (1 + up * kf)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } } }
      /* reflection, on a glossy floor only: each card mirrored under the floor, fading away from it */
      if (kind === "gloss") { const mir = m4.chain(m4.tr(0, 2 * floorY, 0), m4.sc(1, -1, 1)); for (const it of far) face(it, m4.mul(mir, it.M), lightBg ? 0.2 : 0.34, 1, -1, it.p.sw); }
    }
    /* aura: a glow that hugs the outline of each card, in the colour of its rarity. It fades out towards the floor instead of being cut by it, and a glossy floor mirrors it */
    if (fx.rim) { gl.blendFunc(gl.ONE, gl.ONE); const m = 0.3, mir = m4.chain(m4.tr(0, 2 * floorY, 0), m4.sc(1, -1, 1)), passes = floorOn && ST.floor === "gloss" && !sc.table ? [1, 0] : [0]; gl.uniform1i(u.uMode, 3); gl.uniform2f(u.uSize, a + m, 1 + m); gl.uniform2f(u.uCardSize, a, 1); gl.uniform1f(u.uRad, rad);
      for (const it of far) { const k = (lightBg ? 0.26 : 0.42) * amt * it.shade / (sc.single ? 1 : 1.6); /* a thin rim of light, not a neon tube */ gl.uniform3fv(u.uCol, stAura(it.ci, haloCol));
        for (const refl of passes) { const Mr = m4.mul(refl ? m4.mul(mir, it.M) : it.M, m4.sc(a + m, 1 + m, 1)); gl.uniformMatrix4fv(u.uMVP, false, m4.mul(VP, Mr)); gl.uniformMatrix4fv(u.uM, false, Mr); gl.uniform1f(u.uClip, refl ? -1 : 0); if (!floorOn || sc.table) gl.uniform2f(u.uSoft, -99, -98); else if (refl) gl.uniform2f(u.uSoft, floorY - 0.45, floorY); else gl.uniform2f(u.uSoft, floorY - 0.22, floorY + 0.03); gl.uniform1f(u.uAlpha, k * (refl ? 0.4 : 1)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } }
      gl.uniform1f(u.uClip, 0); normal(); }
    /* motion trail: where the card was a few hundredths of a second ago */
    if (fx.trail && sc.single) { const it = insts[0]; for (let k = 3; k >= 1; k--) { const tt = t - k * 0.03 / ST.dur; if (tt < 0) continue; const q = stPoseAt(tt); face(it, m4.chain(G, m4.tr(q.x, q.y, q.z), m4.ry(q.yaw), m4.rx(q.pitch), m4.rz(q.roll)), [0, 0.2, 0.12, 0.07][k], 0, 1, q.sw); } }
    /* the cards: visible face, then the four edges of the board */
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.clear(gl.DEPTH_BUFFER_BIT);
    for (const it of far) {
      /* shadow of the card on what lies under it: the highest card beneath, or the table. The higher the card, the softer, lighter and further the shadow */
      if (sc.stack && fx.shadow) { const p = it.p; let zb = sc.table ? -0.0006 : null; for (const q of insts) { if (q === it || q.p.z >= p.z - 1e-5) continue; if (Math.abs(q.p.x - p.x) < a * 0.96 && Math.abs(q.p.y - p.y) < 0.96) zb = Math.max(zb === null ? -1e9 : zb, q.p.z); }
        if (zb !== null) { const hgt = Math.max(0, p.z - zb), soft = 0.016 + 0.2 * hgt, cw = Math.max(0.06, a * Math.abs(Math.cos(p.yaw))), mg = soft * 2.4, Ms = m4.chain(G, m4.tr(p.x + hgt * 0.14, p.y - hgt * 0.18, zb + 0.0011), m4.rz(p.roll), m4.sc(cw + mg, 1 + mg, 1));
          gl.depthMask(false); gl.uniformMatrix4fv(u.uMVP, false, m4.mul(VP, Ms)); gl.uniform1f(u.uClip, 0); gl.uniform1i(u.uMode, 6); gl.uniform2f(u.uSize, cw + mg, 1 + mg); gl.uniform2f(u.uCardSize, cw, 1); gl.uniform1f(u.uRad, rad); gl.uniform1f(u.uFade, soft); gl.uniform1f(u.uAlpha, (lightBg ? 0.3 : 0.52) / (1 + hgt * 4)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.depthMask(true); } }
      face(it, it.M, 1, 0, 1, it.p.sw); const thk = ST_THK * 0.8; gl.uniform1i(u.uMode, 1); gl.uniform1f(u.uAlpha, 1); gl.uniform3f(u.uCol, 0.9, 0.88, 0.83); gl.uniform1f(u.uShade, 0.62 + 0.38 * (1 - (it.shade - 0.72) / 0.28)); /* the edge of the board catches the light as the card turns away */ gl.uniform1f(u.uClip, floorOn && !sc.table ? 1 : 0);
      for (const sgn of [-1, 1]) { let Me = m4.chain(it.M, m4.tr(sgn * a / 2, 0, 0), m4.ry(Math.PI / 2), m4.sc(thk, 1 - 2 * rad, 1)); gl.uniformMatrix4fv(u.uMVP, false, m4.mul(VP, Me)); gl.uniformMatrix4fv(u.uM, false, Me); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); Me = m4.chain(it.M, m4.tr(0, sgn / 2, 0), m4.rx(Math.PI / 2), m4.sc(a - 2 * rad, thk, 1)); gl.uniformMatrix4fv(u.uMVP, false, m4.mul(VP, Me)); gl.uniformMatrix4fv(u.uM, false, Me); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } gl.uniform1f(u.uClip, 0); }
    /* particles, hidden by the cards when they pass behind */
    if (fx.dust || burst > 0.02) { gl.depthMask(false); gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(g.dust.p); gl.bindBuffer(gl.ARRAY_BUFFER, g.pts); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.uniformMatrix4fv(g.dust.u.uVP, false, VP); gl.uniform1f(g.dust.u.uTime, ST.clock); gl.uniform1f(g.dust.u.uPx, H / 180); gl.uniform1f(g.dust.u.uAmt, (fx.dust ? (lightBg ? 0.35 : 0.8) * amt : 0) + burst * 0.9); gl.uniform3fv(g.dust.u.uCol, lightBg ? [0.5, 0.45, 0.35] : [1, 0.86, 0.62]); gl.drawArrays(gl.POINTS, 0, g.N); gl.depthMask(true); gl.bindBuffer(gl.ARRAY_BUFFER, g.quad); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); }
    gl.disable(gl.DEPTH_TEST);
    /* title in the lower third, then the film grain over everything */
    if (fx.title) { stTitle(g, lightBg, insts[0].ci, sc.single || ST.anim === "duo" ? 0 : insts.length); normal(); gl.useProgram(g.card.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, g.title.t); let sy = 0.25, sx = sy * (1024 / 220) / asp; if (sx > 1.75) { sy *= 1.75 / sx; sx = 1.75; } gl.uniformMatrix4fv(u.uMVP, false, m4.chain(m4.tr(0, -0.78, 0), m4.sc(sx, sy, 1))); gl.uniform1f(u.uClip, 0); gl.uniform1i(u.uMode, 4); gl.uniform1f(u.uAlpha, ST.rec || ST.playing ? stSeg(t, 0.03, 0.14) : 1); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    if (fx.grain) { gl.blendFunc(gl.DST_COLOR, gl.ZERO); gl.useProgram(g.grain.p); gl.uniform1f(g.grain.u.uTime, ST.clock); gl.uniform1f(g.grain.u.uAmt, 0.11 * amt); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    gl.disable(gl.BLEND);
  }
  function stUi() {
    const multiSel = stMulti(ST.anim), seq = ST.seqOn;
    for (const b of $$("#stCats [data-cat]")) b.setAttribute("aria-pressed", String(b.dataset.cat === ST.cat));
    for (const b of $$("#stAnims [data-anim]")) { const an = stAnim(b.dataset.anim), group = stMulti(an[0]); b.hidden = ST.cat !== "all" && an[4] !== ST.cat; b.disabled = seq && group; b.setAttribute("aria-pressed", String(!seq && b.dataset.anim === ST.anim)); }
    for (const b of $$("#stBacks [data-back]")) b.setAttribute("aria-pressed", String(b.dataset.back === ST.back)); for (const b of $$("#stFormat [data-fmt]")) b.setAttribute("aria-pressed", String(b.dataset.fmt === ST.fmt)); for (const b of $$("#stFloor [data-floor]")) b.setAttribute("aria-pressed", String(b.dataset.floor === ST.floor));
    $("#stSeqOn").checked = seq; $("#stSeqBox").hidden = !seq; const list = $("#stSeq"); list.textContent = "";
    ST.seq.forEach((id, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip stseq"; b.title = "Retirer de l'enchaînement"; b.innerHTML = "<i></i><span></span>" + ICO("close", 1); b.children[0].textContent = i + 1; b.children[1].textContent = stAnim(id)[1]; b.addEventListener("click", () => { ST.seq.splice(i, 1); if (ST.seq.length) ST.dur = stSeqDur(); ST.t = 0; stSave(); stUi(); }); list.append(b); });
    $("#stSeqHint").textContent = !ST.seq.length ? "Clique sur des mouvements dans l'ordre voulu : ils s'ajoutent ici, six au plus." : ST.seq.length >= 6 ? "Six mouvements, c'est le maximum. Clique sur un élément de la liste pour le retirer." : "Clique sur un autre mouvement pour l'ajouter, ou sur un élément de la liste pour le retirer.";
    const cust = ST.anim === "custom" && !seq; $("#stCustom").hidden = !cust; if (cust) { ST.kSel = Math.max(0, Math.min(ST.keys.length - 1, ST.kSel)); const kl = $("#stKeys"); kl.textContent = ""; ST.keys.forEach((k, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", String(i === ST.kSel)); b.textContent = "Pose " + (i + 1); b.addEventListener("click", () => { ST.kSel = i; stKeySeek(); stUi(); }); kl.append(b); });
      const k = ST.keys[ST.kSel]; if (k) for (const [id, f, mul, unit] of ST_KF) { const el = $("#" + id); if (document.activeElement !== el) el.value = Math.round(k[f] * mul); $("#o-" + id).value = (k[f] * mul > 0 ? "+" : "") + Math.round(k[f] * mul) + unit; } $("#stKeyDel").disabled = ST.keys.length < 2; $("#stKeyAdd").disabled = ST.keys.length >= 8; $("#stKeyLoop").checked = !!ST.kLoop; }
    const counted = multiSel && !seq && ST.anim !== "duo"; $("#stCountW").hidden = !counted; { const cap = { fan: 13, parade: 12, cascade: 9 }[ST.anim] || 24, shown = Math.min(cap, ST.count); $("#stCount").max = cap; $("#stCount").value = shown; $("#o-stCount").value = shown + " cartes"; }
    $("#stColors").hidden = ST.back !== "custom"; $("#stC1").value = ST.c1; $("#stC2").value = ST.c2; $("#stDur").value = ST.dur; $("#o-stDur").value = crNum(ST.dur) + " s"; $("#stZoom").value = Math.round(ST.zoom * 100); $("#o-stZoom").value = Math.round(ST.zoom * 100) + " %"; $("#stCam").value = ST.cam; $("#o-stCam").value = (ST.cam > 0 ? "+" : "") + ST.cam + "°"; $("#stFxAmt").value = Math.round(ST.fxAmt * 100); $("#o-stFxAmt").value = Math.round(ST.fxAmt * 100) + " %";
    $("#stFlip").checked = !!ST.flip; $("#stLoop").checked = ST.loop; for (const [k] of ST_FX) { const el = $("#stfx-" + k); if (el) { el.checked = !!ST.fx[k]; if (k === "trail") el.disabled = multiSel && !seq; if (k === "shadow") el.disabled = ST.floor === "none"; } }
    $("#stFloorNote").textContent = { none: "Pas de sol : la carte flotte devant le décor, sans ombre ni reflet.", gloss: "Sol brillant : la carte s'y reflète.", matte: "Sol mat : une surface et une ombre, sans reflet.", mat: "Tapis de jeu : surface tissée, avec le cercle de lumière sous les cartes." }[ST.floor];
    $("#stPlay").innerHTML = ICO(ST.playing ? "pause" : "play"); $("#stPlay").title = ST.playing ? "Mettre en pause (Espace)" : "Lire (Espace)"; $("#stPlay").setAttribute("aria-label", $("#stPlay").title);
    const ch = stChosen(), li = ST.cards.length ? ch[0] : project.cardIndex, c = project.cards[li] || curCard(); $("#stName").textContent = (c && c.name) || "Carte " + (li + 1); const [ew, eh] = ST_FMT[ST.fmt]; const n = ch.length;
    $("#stRotate").checked = !!ST.rotate; $("#stRotate").disabled = multiSel && !seq; stCardsUi();
    $("#stMultiNote").hidden = !(counted && n < ST.count); $("#stMultiNote").textContent = n < 2 ? "Une seule carte sur scène : elle est répétée. Choisis-en d'autres dans « Cartes sur scène », ou ajoute une carte." : `${n} cartes sur scène pour ${ST.count} places : elles sont reprises en boucle.`;
    $("#stRecNote").textContent = `Vidéo ${ew} × ${eh} px, ${crNum(ST.dur)} s, enregistrée en temps réel. L'image PNG reprend l'instant affiché.`;
  }
  /* the picker: one thumbnail per card of the series; a click puts the card on stage or takes it off, and the order of the clicks is the order on stage */
  function stCardsUi() {
    const box = $("#stCards"); if (!box || ui.page !== "studio") return; ST.cards = ST.cards.filter(id => project.cards.some(c => c.id === id));
    const sig = project.cards.map(c => c.id + (c.thumb ? 1 : 0) + c.name).join("|") + "#" + ST.cards.join(",") + "#" + project.cardIndex;
    if (sig !== ST.cardsSig) { ST.cardsSig = sig; box.textContent = "";
      project.cards.forEach((c, i) => { if (T && !c.thumb) { try { c.thumb = snapshotDoc(c.front, 320, [0.35, 0.3], [0, 0]); } catch (e) {} } const rank = ST.cards.indexOf(c.id), b = document.createElement("button"); b.type = "button"; b.className = "stcard"; b.setAttribute("aria-pressed", String(rank >= 0)); const nm = c.name || "Carte " + (i + 1); b.title = nm + (rank >= 0 ? " · retirer de la scène" : " · mettre sur scène"); b.setAttribute("aria-label", b.title); if (c.thumb) b.style.backgroundImage = `url(${c.thumb})`;
        if (rank >= 0) { const t = document.createElement("i"); t.textContent = rank + 1; b.append(t); } else if (!ST.cards.length && i === project.cardIndex) b.classList.add("is-lead");
        b.addEventListener("click", () => { const k = ST.cards.indexOf(c.id); if (k >= 0) ST.cards.splice(k, 1); else ST.cards.push(c.id); ST.lap = 0; stSave(); stUi(); }); box.append(b); }); }
    const k = ST.cards.length; $("#stCardsNote").textContent = k ? `${k} carte${k > 1 ? "s" : ""} choisie${k > 1 ? "s" : ""}. Les numéros donnent l'ordre d'apparition ; clique sur une carte pour l'ajouter ou la retirer.` : project.cards.length > 1 ? "Aucun choix : toute la série est utilisée, à partir de la carte affichée. Clique sur des cartes pour choisir lesquelles montrer, et dans quel ordre." : "Ta série n'a qu'une carte. Ajoute-en une pour varier ce qui est montré.";
    $("#stCardsAll").disabled = !k;
  }
  const ST_KF = [["stKyaw", "yaw", 1, "°"], ["stKpitch", "pitch", 1, "°"], ["stKroll", "roll", 1, "°"], ["stKx", "x", 100, " %"], ["stKy", "y", 100, " %"], ["stKz", "z", 100, " %"]];
  /* shows the selected pose on stage: the timeline jumps to it and stops */
  function stKeySeek() { const n = ST.keys.length, segs = n <= 1 ? 1 : ST.kLoop ? n : n - 1; ST.playing = false; ST.t = Math.min(1, ST.kSel / segs); }
  function stTime() { const el = $("#stSeek"); if (document.activeElement !== el || ST.playing) el.value = Math.round(ST.t * 1000); $("#stTime").value = crNum(ST.t * ST.dur) + " / " + crNum(ST.dur) + " s"; }
  function stFrame(now) {
    ST.raf = 0; if (ui.page !== "studio") return; const dt = Math.min(0.1, (now - ST.last) / 1000 || 0.016); ST.last = now; ST.clock += dt;
    if (ST.playing) { ST.t += dt / ST.dur; if (ST.t >= 1) { if (ST.rec) { ST.t = 1; ST.playing = false; const done = ST.rec.done; setTimeout(done, 120); } else if (ST.loop) { ST.t -= Math.floor(ST.t); ST.lap++; } else { ST.t = 1; ST.playing = false; stUi(); } } }
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
    let finish; const ended = new Promise(res => { finish = res; }); ST.rec = { done: finish }; ST.t = 0; ST.lap = 0; ST.playing = true; $("#stSide").classList.add("is-busy"); $("#stRec").disabled = true; stUi(); stDraw(0);
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
    const an = $("#stAnims"); for (const [id, label, sub, dur] of ST_ANIMS) { const b = document.createElement("button"); b.type = "button"; b.className = "sttile"; b.dataset.anim = id; b.innerHTML = "<b></b><span></span>"; b.children[0].textContent = label; b.children[1].textContent = sub;
      b.addEventListener("click", () => { if (ST.seqOn) { if (stMulti(id)) return; if (ST.seq.length >= 6) { toast("Six mouvements au plus dans un enchaînement"); return; } ST.seq.push(id); ST.dur = stSeqDur(); } else { ST.anim = id; ST.dur = dur; if (stAnim(id)[4] === "deck") { if (ST.count < 10) ST.count = 16; if (ST.floor === "none") ST.floor = "mat"; } else if (stMulti(id) && ST.count > 9) ST.count = 5; } ST.t = 0; ST.playing = true; stSave(); stUi(); }); an.append(b); }
    const bk = $("#stBacks"); for (const [id, label, c1, c2] of ST_BACKS) { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.back = id; const sw = document.createElement("i"); sw.className = "stsw"; sw.style.background = c1 ? `radial-gradient(circle at 50% 35%, ${c1}, ${c2})` : id === "auto" ? "conic-gradient(#e2590a, #e8b44a, #2a6fd6, #9b3fd0, #e2590a)" : "linear-gradient(135deg, #888, #222)"; b.append(sw, document.createTextNode(label)); b.addEventListener("click", () => { ST.back = id; stSave(); stUi(); }); bk.append(b); }
    const fl = $("#stFloor"); for (const [id, label] of ST_FLOORS) { const b = document.createElement("button"); b.type = "button"; b.dataset.floor = id; b.textContent = label; b.addEventListener("click", () => { ST.floor = id; stSave(); stUi(); }); fl.append(b); }
    const fxb = $("#stFx"); for (const [k, label] of ST_FX) { const l = document.createElement("label"); l.className = "check"; const i = document.createElement("input"); i.type = "checkbox"; i.id = "stfx-" + k; i.addEventListener("change", () => { ST.fx[k] = i.checked; stSave(); }); l.append(i, document.createTextNode(" " + label)); fxb.append(l); }
    for (const b of $$("#stFormat [data-fmt]")) b.addEventListener("click", () => { ST.fmt = b.dataset.fmt; stSave(); stUi(); });
    $("#stC1").addEventListener("input", e => { ST.c1 = e.target.value; stSave(); }); $("#stC2").addEventListener("input", e => { ST.c2 = e.target.value; stSave(); });
    $("#stDur").addEventListener("input", e => { ST.dur = +e.target.value; stSave(); stUi(); }); $("#stZoom").addEventListener("input", e => { ST.zoom = e.target.value / 100; stSave(); stUi(); }); $("#stCam").addEventListener("input", e => { ST.cam = +e.target.value; stSave(); stUi(); }); $("#stFxAmt").addEventListener("input", e => { ST.fxAmt = e.target.value / 100; stSave(); stUi(); });
    $("#stCount").addEventListener("input", e => { ST.count = Math.max(2, Math.min(24, +e.target.value)); stSave(); stUi(); });
    $("#stFlip").addEventListener("change", e => { ST.flip = e.target.checked; stSave(); }); $("#stLoop").addEventListener("change", e => { ST.loop = e.target.checked; stSave(); });
    $("#stSeqOn").addEventListener("change", e => { ST.seqOn = e.target.checked; if (ST.seqOn && !ST.seq.length && !stMulti(ST.anim)) ST.seq = [ST.anim]; if (ST.seqOn && ST.seq.length) ST.dur = stSeqDur(); else ST.dur = stAnim(ST.anim)[3]; if (ST.seqOn && (ST.cat === "multi" || ST.cat === "deck")) ST.cat = "all"; ST.t = 0; ST.playing = true; stSave(); stUi(); });
    $("#stSeqClear").addEventListener("click", () => { ST.seq = []; ST.t = 0; stSave(); stUi(); });
    $("#stRandom").addEventListener("click", () => { const pick = arr => arr[Math.floor(Math.random() * arr.length)]; ST.seqOn = false; const an2 = pick(ST_ANIMS); ST.anim = an2[0]; ST.dur = an2[3]; ST.back = pick(ST_BACKS.filter(x => x[0] !== "custom"))[0]; ST.flip = Math.random() < 0.5; ST.floor = an2[4] === "deck" ? pick(["mat", "matte", "gloss"]) : pick(["gloss", "gloss", "matte", "mat", "none"]); if (an2[4] === "deck" && ST.count < 10) ST.count = 16;
      for (const [k] of ST_FX) ST.fx[k] = Math.random() < 0.4; ST.fx.shadow = true; ST.fx.vignette = true; ST.fx.title = false; ST.t = 0; ST.playing = true; ST.cat = "all"; stSave(); stUi(); toast(an2[1] + " · " + ST_BACKS.find(x => x[0] === ST.back)[1]); });
    $("#stPlay").addEventListener("click", () => { if (ST.rec) return; if (!ST.playing && ST.t >= 1) ST.t = 0; ST.playing = !ST.playing; stUi(); });
    $("#stSeek").addEventListener("input", e => { if (ST.rec) return; ST.playing = false; ST.t = e.target.value / 1000; stUi(); });
    const step = dir => { const n = project.cards.length; if (n > 1) { const from = ST.cards.length ? stChosen()[0] : project.cardIndex; ST.cards = []; setCard((from + dir + n) % n); ST.autoKey = null; ST.lap = 0; stSave(); stUi(); } };
    for (const [id, f, mul] of ST_KF) $("#" + id).addEventListener("input", e => { const k = ST.keys[ST.kSel]; if (!k) return; k[f] = +e.target.value / mul; stKeySeek(); stSave(); stUi(); });
    $("#stKeyAdd").addEventListener("click", () => { if (ST.keys.length >= 8) return; const k = ST.keys[ST.kSel] || { yaw: 0, pitch: 0, roll: 0, x: 0, y: 0, z: 0 }; ST.keys.splice(ST.kSel + 1, 0, { ...k, yaw: Math.max(-360, Math.min(360, k.yaw + 30)) }); ST.kSel++; stKeySeek(); stSave(); stUi(); });
    $("#stKeyDel").addEventListener("click", () => { if (ST.keys.length < 2) return; ST.keys.splice(ST.kSel, 1); ST.kSel = Math.max(0, ST.kSel - 1); stKeySeek(); stSave(); stUi(); });
    $("#stKeyLoop").addEventListener("change", e => { ST.kLoop = e.target.checked; stSave(); stUi(); });
    /* the selected pose is also set by hand on the preview: drag turns the card, Shift + drag moves it, the wheel brings it closer */
    { const el = $("#stCanvas"); let kd = null; const live = () => ST.anim === "custom" && !ST.seqOn && !ST.rec && ST.keys[ST.kSel], cl = (v, a2, b2) => Math.max(a2, Math.min(b2, v));
      el.addEventListener("pointerdown", e => { const k = live(); if (!k || e.button !== 0) return; kd = { x: e.clientX, y: e.clientY, k: { ...k }, shift: e.shiftKey }; try { el.setPointerCapture(e.pointerId); } catch (err) {} stKeySeek(); stUi(); e.preventDefault(); });
      el.addEventListener("pointermove", e => { const k = live(); if (!kd || !k) return; const dx = e.clientX - kd.x, dy = e.clientY - kd.y, hgt = Math.max(100, el.clientHeight); if (kd.shift) { k.x = cl(kd.k.x + dx / hgt * 1.7, -1.5, 1.5); k.y = cl(kd.k.y - dy / hgt * 1.7, -1.5, 1.5); } else { k.yaw = cl(Math.round(kd.k.yaw + dx * 0.5), -360, 360); k.pitch = cl(Math.round(kd.k.pitch + dy * 0.4), -80, 80); } stUi(); });
      const end = () => { if (kd) { kd = null; stSave(); } }; el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
      el.addEventListener("wheel", e => { const k = live(); if (!k) return; e.preventDefault(); k.z = cl(k.z + (e.deltaY < 0 ? 0.05 : -0.05), -1.5, 1.2); stKeySeek(); stSave(); stUi(); }, { passive: false }); }
    $("#stRotate").addEventListener("change", e => { ST.rotate = e.target.checked; ST.lap = 0; stSave(); stUi(); });
    $("#stCardsAll").addEventListener("click", () => { ST.cards = []; ST.lap = 0; stSave(); stUi(); });
    $("#stCardsNew").addEventListener("click", () => { newCard(); ST.cardsSig = ""; setTimeout(() => { ST.cardsSig = ""; stUi(); }, 2200); stUi(); }); $("#stPrev").addEventListener("click", () => step(-1)); $("#stNext").addEventListener("click", () => step(1));
    $("#stRec").addEventListener("click", () => studioRecord().catch(e => { console.error(e); ST.rec = null; $("#stRec").disabled = false; toast("Vidéo impossible : " + (e && e.message || e)); })); $("#stShot").addEventListener("click", () => studioShot());
    document.addEventListener("keydown", e => { if (ui.page !== "studio" || e.key !== " " || /input|textarea|select|button/i.test((document.activeElement && document.activeElement.tagName) || "")) return; e.preventDefault(); $("#stPlay").click(); });
    if (window.Layrys) { window.Layrys.studio = ST; window.Layrys.studioDraw = stDraw; window.Layrys.studioUi = stUi; }
  }
