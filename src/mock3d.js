  /* ================= Mock3D v2: a small mesh renderer for product mockups =================
     Units are millimetres, y is up, z points to the viewer. Every item is a mesh (or a unit quad) placed by a frame
     (origin + three axes). Lighting: one key light fixed in the scene, one fill light attached to the camera, a rim light,
     a procedural studio environment, soft shadows projected on the floor and a faint floor reflection.
     The floor is only drawn when the camera is above it, so the object can be examined from below. */
  const Mock3D = (() => {
    const D = Math.PI / 180;
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const persp = (fovy, asp, n, f) => { const t = 1 / Math.tan(fovy / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; };
    const lookAt = (e, c, up) => { const z = norm(sub(e, c)), x = norm(cross(up, z)), y = cross(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]; };
    const mmul = (a, b) => { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };

    /* ---- meshes: interleaved position, normal, uv; named index groups ---- */
    function builder() {
      const v = [], idx = [], groups = {}; let start = 0;
      return { v, vert(px, py, pz, nx, ny, nz, u, w) { v.push(px, py, pz, nx, ny, nz, u, w); return v.length / 8 - 1; }, tri(a, b, c) { idx.push(a, b, c); }, quad(a, b, c, d) { idx.push(a, b, c, a, c, d); }, group(name) { groups[name] = [start, idx.length - start]; start = idx.length; }, done() { return { v: new Float32Array(v), i: new Uint16Array(idx), groups }; } };
    }
    const quadMesh = () => { const B = builder(); B.quad(B.vert(-0.5, -0.5, 0, 0, 0, 1, 0, 0), B.vert(0.5, -0.5, 0, 0, 0, 1, 1, 0), B.vert(0.5, 0.5, 0, 0, 0, 1, 1, 1), B.vert(-0.5, 0.5, 0, 0, 0, 1, 0, 1)); B.group("all"); return B.done(); };
    /* a rounded rectangle extruded along z, with optional bevelled rims: cards, slabs, acrylic blocks, boards, cylinders (r = w / 2) */
    function slabMesh(w, h, d, r, bev) {
      const B = builder(); r = Math.max(0, Math.min(r, w / 2, h / 2)); const seg = r < 0.05 ? 1 : (r > 10 ? 12 : 7); const pts = [];
      for (const [cx, cy, a0] of [[w / 2 - r, -h / 2 + r, -90], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180]])
        for (let i = 0; i <= seg; i++) { const a = (a0 + 90 * i / seg) * D; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a), Math.sin(a)]); }
      const n = pts.length, hz = d / 2, b = Math.max(0, Math.min(bev || 0, hz * 0.9, Math.min(w, h) * 0.2));
      const face = s => {
        const c = B.vert(0, 0, s * hz, 0, 0, s, 0.5, 0.5); const ring = pts.map(p => { const x = p[0] - p[2] * b, y = p[1] - p[3] * b; return B.vert(x, y, s * hz, 0, 0, s, s > 0 ? x / w + 0.5 : 0.5 - x / w, y / h + 0.5); });
        for (let i = 0; i < n; i++) { const a = ring[i], bb = ring[(i + 1) % n]; if (s > 0) B.tri(c, a, bb); else B.tri(c, bb, a); }
      };
      face(1); B.group("front"); face(-1); B.group("back");
      const levels = b > 0 ? [[hz, b, 0.7, 0.7], [hz - b, 0, 0.7, 0.7], [hz - b, 0, 1, 0], [-hz + b, 0, 1, 0], [-hz + b, 0, 0.7, -0.7], [-hz, b, 0.7, -0.7]] : [[hz, 0, 1, 0], [-hz, 0, 1, 0]];
      const rings = levels.map(([z, inset, nk, nz]) => pts.map((p, i) => B.vert(p[0] - p[2] * inset, p[1] - p[3] * inset, z, p[2] * nk, p[3] * nk, nz, i / n, (z + hz) / d)));
      for (let k = 0; k + 1 < rings.length; k += 2) for (let i = 0; i < n; i++) { const j = (i + 1) % n; B.quad(rings[k][i], rings[k + 1][i], rings[k + 1][j], rings[k][j]); }
      B.group("side"); return B.done();
    }
    /* a sealed film pouch (booster): bulged body, pleats near the seals, flat crimped ends; "open" leaves the top torn open */
    function pillowMesh(w, h, depth, crimp, open, light) {
      const B = builder(); const nx = light ? 10 : 20, ny = light ? 18 : 40; const body = h / 2 - crimp; const y1 = open ? body : h / 2;
      const prof = y => { const ay = Math.abs(y); if (open && y > 0) return [1 - 0.2 * Math.pow(y / body, 3), 1]; if (ay >= body) return [0, 0]; const s = Math.min(1, (body - ay) / (h * 0.19)); return [Math.sqrt(1 - (1 - s) * (1 - s)), s]; };
      const zf = (x, y, side) => { const [fy, s] = prof(y); const fx = Math.pow(Math.max(0, 1 - (2 * x / w) * (2 * x / w)), 0.42); const wr = (Math.sin(x * 0.78 + side * 1.3 + (y > 0 ? 0 : 2.2)) + 0.55 * Math.sin(x * 1.9 + side * 2.1)) * 0.5 * Math.exp(-s * 3.2) * Math.sqrt(fy); return side * (0.14 + (depth / 2) * fx * fy + wr * fx * Math.min(1, depth / 6)); };
      for (const side of [1, -1]) {
        const base = B.v.length / 8, e = 0.3;
        for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
          const x = -w / 2 + w * i / nx, y = -h / 2 + (y1 + h / 2) * j / ny; const z = zf(x, y, side);
          const xa = Math.max(-w / 2, x - e), xb = Math.min(w / 2, x + e), ya = Math.max(-h / 2, y - e), yb = Math.min(y1, y + e);
          let dzx = (zf(xb, y, side) - zf(xa, y, side)) / (xb - xa), dzy = (zf(x, yb, side) - zf(x, ya, side)) / (yb - ya); dzx = Math.max(-3, Math.min(3, dzx)); dzy = Math.max(-3, Math.min(3, dzy));
          const l = Math.hypot(dzx, dzy, 1); B.vert(x, y, z, -side * dzx / l, -side * dzy / l, side / l, side > 0 ? x / w + 0.5 : 0.5 - x / w, y / h + 0.5);
        }
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = base + j * (nx + 1) + i, b = a + 1, c = a + nx + 1, dd = c + 1; if (side > 0) { B.tri(a, b, dd); B.tri(a, dd, c); } else { B.tri(a, dd, b); B.tri(a, c, dd); } }
        B.group(side > 0 ? "front" : "back");
      }
      return B.done();
    }
    /* a tube along a circular arc in the xy plane (binder rings) */
    function ringMesh(R, r, a0, a1) {
      const B = builder(); const seg = 30, sides = 8;
      for (let i = 0; i <= seg; i++) { const a = (a0 + (a1 - a0) * i / seg) * D, ex = Math.cos(a), ey = Math.sin(a); for (let k = 0; k <= sides; k++) { const ph = k / sides * 2 * Math.PI, c = Math.cos(ph), s = Math.sin(ph); B.vert(ex * (R + r * c), ey * (R + r * c), r * s, ex * c, ey * c, s, i / seg, k / sides); } }
      for (let i = 0; i < seg; i++) for (let k = 0; k < sides; k++) { const a = i * (sides + 1) + k, b = a + sides + 1; B.quad(a, b, b + 1, a + 1); }
      B.group("all"); return B.done();
    }

    /* a rounded rectangular ring (bumpers, frames): outer size w x h, band width, extruded along z */
    function frameMesh(w, h, d, ro, band, ri) {
      const B = builder(); const seg = 6; const outline = (ww, hh, r) => { r = Math.max(0.01, Math.min(r, ww / 2, hh / 2)); const pts = []; for (const [cx, cy, a0] of [[ww / 2 - r, -hh / 2 + r, -90], [ww / 2 - r, hh / 2 - r, 0], [-ww / 2 + r, hh / 2 - r, 90], [-ww / 2 + r, -hh / 2 + r, 180]]) for (let i = 0; i <= seg; i++) { const a = (a0 + 90 * i / seg) * D; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a), Math.sin(a)]); } return pts; };
      const O = outline(w, h, ro), I = outline(w - 2 * band, h - 2 * band, ri), n = O.length, hz = d / 2;
      for (const s of [1, -1]) { const a = O.map(p => B.vert(p[0], p[1], s * hz, 0, 0, s, p[0] / w + 0.5, p[1] / h + 0.5)), b = I.map(p => B.vert(p[0], p[1], s * hz, 0, 0, s, p[0] / w + 0.5, p[1] / h + 0.5)); for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (s > 0) B.quad(a[i], a[j], b[j], b[i]); else B.quad(a[i], b[i], b[j], a[j]); } B.group(s > 0 ? "front" : "back"); }
      for (const [P, sg, name] of [[O, 1, "side"], [I, -1, "inner"]]) { const a = P.map((p, i) => B.vert(p[0], p[1], hz, p[2] * sg, p[3] * sg, 0, i / n, 1)), b = P.map((p, i) => B.vert(p[0], p[1], -hz, p[2] * sg, p[3] * sg, 0, i / n, 0)); for (let i = 0; i < n; i++) { const j = (i + 1) % n; B.quad(a[i], b[i], b[j], a[j]); } B.group(name); }
      return B.done();
    }
    /* a convex polygon (counter-clockwise, in the xy plane) extruded along z: sloped side walls of a display tray */
    function polyMesh(pts, d) {
      const B = builder(); const hz = d / 2; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const x0 = Math.min(...xs), y0 = Math.min(...ys), sw = Math.max(...xs) - x0 || 1, sh = Math.max(...ys) - y0 || 1;
      for (const s of [1, -1]) { const v = pts.map(p => B.vert(p[0], p[1], s * hz, 0, 0, s, s > 0 ? (p[0] - x0) / sw : 1 - (p[0] - x0) / sw, (p[1] - y0) / sh)); for (let i = 1; i + 1 < v.length; i++) { if (s > 0) B.tri(v[0], v[i], v[i + 1]); else B.tri(v[0], v[i + 1], v[i]); } B.group(s > 0 ? "front" : "back"); }
      for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l; B.quad(B.vert(p[0], p[1], hz, nx, ny, 0, 0, 1), B.vert(p[0], p[1], -hz, nx, ny, 0, 0, 0), B.vert(q[0], q[1], -hz, nx, ny, 0, 1, 0), B.vert(q[0], q[1], hz, nx, ny, 0, 1, 1)); }
      B.group("side"); return B.done();
    }

    const VS = `attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv;
uniform mat4 uVP, uM; uniform mat3 uN; uniform mediump int uPass; uniform vec3 uKey; uniform vec4 uSh;
varying vec2 vUv; varying vec3 vPos, vN;
void main(){ vec4 wp=uM*vec4(aPos,1.); vN=uN*aNor; vUv=aUv; vPos=wp.xyz;
  if(uPass==1){ float t=max((wp.y-uSh.x)/max(uKey.y,0.2),0.); vec3 pp=wp.xyz-uKey*t; gl_Position=vec4((pp.x-uSh.y)/uSh.w, (pp.z-uSh.z)/uSh.w, 0., 1.); }
  else gl_Position=uVP*wp; }`;
    const FS = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#define DERIV 1
#endif
precision highp float;
varying vec2 vUv; varying vec3 vPos, vN;
uniform sampler2D uTex, uShadowTex;
uniform vec4 uColor, uUvRect, uP, uSh;
uniform vec2 uSize;
uniform float uRad, uClip, uCast, uMirror, uExp, uShAmt, uEnvAmt;
uniform mediump int uKind, uPass;
uniform vec3 uCam, uKey, uKeyCol, uFill, uFillCol, uAmbCol, uRimDir, uRimCol, uBg, uDim;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x), mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x), f.y); }
float rr(vec2 p, vec2 b, float r){ vec2 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
float aaw(float d){
#ifdef DERIV
  return max(fwidth(d), 1e-4);
#else
  return 0.25;
#endif
}
vec3 envR(vec3 R){
  float y=R.y; vec3 c=mix(vec3(0.05,0.055,0.07), vec3(0.55,0.58,0.66), smoothstep(-0.4,0.9,y)); float a=atan(R.x,R.z);
  c+=vec3(1.)*smoothstep(0.78,0.97,sin(a*2.+0.7))*smoothstep(0.0,0.45,y)*smoothstep(1.,0.72,y);
  c+=vec3(1.,0.98,0.95)*smoothstep(0.86,0.99,y)*0.9;
  c+=vec3(0.9,0.93,1.)*smoothstep(0.90,1.,sin(a*3.-1.1))*smoothstep(-0.35,0.15,y)*0.28;
  return c*uEnvAmt;
}
vec3 difL(vec3 N){ return uKeyCol*max(dot(N,uKey),0.)+uFillCol*(0.5+0.5*dot(N,uFill))+uAmbCol*(0.75+0.25*N.y); }
float ggx(float ndh, float a){ float a2=a*a; float d=ndh*ndh*(a2-1.)+1.; return a2/(3.14159*d*d); }
float ln(float dd, float w, float px){ return 1.-smoothstep(w, w+px, abs(dd)); }
void main(){
  float cov=1., d=-1000.;
  if(uSize.x>0.){ vec2 p=(vUv-0.5)*uSize; d=rr(p, uSize*0.5, min(uRad, min(uSize.x,uSize.y)*0.5)); if(uClip>0.5){ cov=clamp(0.5-d/aaw(d),0.,1.); if(cov<=0.003) discard; } }
  if(uKind==9 && uP.w>0.5){ float yy=min(vUv.y,1.-vUv.y)*uSize.y; float tooth=abs(fract(vUv.x*uSize.x/2.2)-0.5)*2.4; if(yy<tooth) discard; }
  if(uPass==1){ gl_FragColor=vec4(0.,0.,0.,uCast*cov); return; }
  float mk=1.; if(uMirror>0.){ if(vPos.y>uSh.x) discard; mk=uMirror*exp((vPos.y-uSh.x)/42.); }
  vec3 V=normalize(uCam-vPos); vec3 N=normalize(vN); if(dot(N,V)<0.) N=-N;
  float ndv=max(dot(N,V),0.); vec3 H=normalize(uKey+V); float ndh=max(dot(N,H),0.); float ndl=max(dot(N,uKey),0.);
  float fres=pow(1.-ndv,4.); vec3 R=reflect(-V,N); float rim=pow(1.-ndv,2.5)*smoothstep(-0.2,0.6,dot(N,uRimDir));
  vec3 c=vec3(0.); float a=1.;
  if(uKind==0){ vec4 t=texture2D(uTex, uUvRect.xy+vUv*uUvRect.zw); c=t.rgb*min(difL(N),vec3(1.3))+(uKeyCol*min(ggx(ndh,0.16)*ndl*0.05,0.6)+envR(R)*(0.02+fres*0.3)+uRimCol*rim*0.25)*uP.x*uDim; }
  else if(uKind==1){ vec3 base=uColor.rgb; float gl=0.;
    if(uUvRect.w>1.5){ if(uUvRect.w<2.5||uUvRect.w>3.5) base=mix(uUvRect.xyz, base, clamp((vPos.y-uP.y)*uP.z,0.,1.));
      if(uUvRect.w>2.5){ vec3 c3=floor(vPos*2.6); float hh=fract(sin(dot(c3,vec3(12.9898,78.233,37.719)))*43758.5453); float ph=fract(hh*17.3+dot(V,vec3(3.1,2.3,1.7))*2.2); gl=step(0.86,hh)*pow(max(0.,1.-abs(ph-0.5)*3.6),3.)*2.4; } }
    else if(uP.y>0.){ vec2 q=uSize.x>0.?(vUv-0.5)*uSize:vUv*120.; base*=1.+(vn(q*uP.y)-0.5)*uP.z; }
    else if(uP.y<0.){ /* wood: growth rings stretched along the grain, fibres and pores. On a frame the grain follows each side and meets at the mitres */
      bool straight=uP.y<-50.; float s=straight?-uP.y-100.:-uP.y; vec2 q=uSize.x>0.?(vUv-0.5)*uSize:vUv*vec2(220.,24.);
      bool hz=straight||uSize.x<=0.||min(vUv.y,1.-vUv.y)*uSize.y<min(vUv.x,1.-vUv.x)*uSize.x; vec2 g=hz?q:q.yx;
      float warp=vn(vec2(g.x*0.011,g.y*0.05)*s)*7.; float rings=0.5+0.5*sin((g.y*0.42*s+warp)*6.2831); float fib=vn(vec2(g.x*0.06,g.y*2.6)*s); float pore=vn(vec2(g.x*0.5,g.y*7.)*s);
      base*=(1.-uP.z*0.75)+uP.z*(0.52*smoothstep(0.1,0.9,rings)+0.5*fib)+0.07*(pore-0.5); }
    float rough=mix(0.55,0.08,uP.x), metal=uP.w; vec3 sc=mix(vec3(1.),base,metal); vec3 ch=mix(vec3(0.04,0.045,0.06), vec3(0.82,0.86,0.94), smoothstep(-0.12,0.22,R.y)); ch+=vec3(1.)*pow(max(0.,sin(atan(R.x,R.z)*3.+1.)),8.)*0.7*smoothstep(-0.1,0.5,R.y);
    c=(base*difL(N)*(1.-0.62*metal)+uKeyCol*min(ggx(ndh,rough)*ndl*mix(0.04,1.4,metal)*0.3,2.)*sc+mix(envR(R)*(0.03+fres*0.45*uP.x), (envR(R)*0.4+ch*0.85*uEnvAmt)*base, metal)+uRimCol*rim*0.2*uP.x+vec3(gl)*(0.35+0.65*difL(N)))*uDim; a=uColor.a; }
  else if(uKind==2){ float edge=(uSize.x>0.&&uP.y>0.)?smoothstep(-uP.y,0.,d):0.; float shn=0.; if(uSize.x>0.){ vec2 q=(vUv-0.5)*uSize; float tt=q.x/uSize.x+q.y/uSize.y*0.6+R.x*1.6+R.y*0.9; shn=0.26*uP.x*(exp(-pow((tt-0.15)*4.5,2.))+0.5*exp(-pow((tt+0.42)*9.,2.))); } float refl=(0.08+0.75*fres)*uP.x; float spec=min(ggx(ndh,0.05)*ndl*0.02,1.5)*uP.x; vec3 dl=difL(N);
    vec3 add=(envR(R)*refl+uKeyCol*spec+uRimCol*rim*0.35*uP.x+vec3(edge*uP.z)*mix(vec3(1.),uColor.rgb,0.3)*(0.55+0.45*dl)+vec3(uP.w)*dl*0.85+vec3(shn)*(0.45+0.55*dl))*uDim;
    float ta=uColor.a; float al=clamp(ta+dot(add,vec3(0.3333))*0.85+uP.w*0.5,0.,1.);
    gl_FragColor=vec4((uColor.rgb*uDim*ta*dl*0.9+add)*uExp, al)*cov*mk; return; }
  else if(uKind==11){ vec2 q=(vUv-0.5)*uSize; vec3 dl=difL(N); float edge=uP.y>0.?smoothstep(-uP.y,0.,d):0.;
    float sx=uSize.x*0.5-abs(q.x), sb=q.y+uSize.y*0.5, st=uSize.y*0.5-q.y; float si=uUvRect.y;
    float band=si>0.?max(1.-smoothstep(si-0.2,si+0.2,sx), 1.-smoothstep(si*0.8-0.2,si*0.8+0.2,sb)):0.;
    float ln=si>0.?max(exp(-pow((sx-si)/0.3,2.)), exp(-pow((sb-si*0.8)/0.3,2.))):0.;
    if(uUvRect.w>0.) ln=max(ln, exp(-pow((st-uUvRect.w)/0.32,2.))*step(si,sx));
    float tt=q.x/uSize.x+q.y/uSize.y*0.6+R.x*1.6+R.y*0.9; float sheen=uUvRect.x*(exp(-pow((tt-0.15)*4.5,2.))+0.45*exp(-pow((tt+0.42)*9.,2.)));
    float body=uColor.a+band*uUvRect.z*0.45+uP.w; float ea=clamp(edge*uP.z+ln*uUvRect.z,0.,1.);
    float refl=(0.04+0.6*fres)*uP.x; float spec=min(ggx(ndh,0.05)*ndl*0.02,1.5)*uP.x;
    vec3 add=(envR(R)*refl+uKeyCol*spec+uRimCol*rim*0.35*uP.x+vec3(sheen)*(0.45+0.55*dl))*uDim;
    float sa=clamp(body+ea,0.,1.); float al=clamp(sa+dot(add,vec3(0.3333))*0.85,0.,1.);
    gl_FragColor=vec4((uColor.rgb*(0.5+0.5*dl)*uDim*sa+add)*uExp, al)*cov*mk; return; }
  else if(uKind==12){ vec2 q=(vUv-0.5)*uSize; vec3 dl=difL(N); vec2 hs=uSize*0.5; float cy=uUvRect.z; vec2 wh=uUvRect.xy; float top=cy+wh.y; float px=max(aaw(q.x),aaw(q.y))*1.1;
    float dW=rr(q-vec2(0.,cy), wh, 1.2);
    float dIn=min(rr(q-vec2(0.,(top-hs.y+1.8)*0.5), vec2(hs.x-1.8,(top+hs.y-1.8)*0.5), 1.3), rr(q-vec2(0.,top+1.6), vec2(hs.x-7.4,2.2), 0.9));
    float dRail=rr(vec2(abs(q.x)-(hs.x-3.35), q.y-cy), vec2(0.7,wh.y-7.), 0.6);
    float dClip=rr(vec2(abs(q.x)-hs.x*0.48, q.y+hs.y-4.3), vec2(2.9,2.1), 0.6);
    float dTab=rr(q-vec2(0.,hs.y-0.4), vec2(7.6,1.5), 0.7); float dSeat=length(q-vec2(0.,hs.y-5.2))-2.05;
    float lb=max(max(ln(dW,0.15,px),ln(dIn,0.12,px)), max(max(ln(dRail,0.1,px),ln(dClip,0.12,px)), max(ln(dTab,0.11,px),ln(dSeat,0.13,px))));
    float o2=0.34; float ld=max(max(ln(dW-o2,0.2,px),ln(dIn+o2,0.16,px)), max(max(ln(dRail+o2,0.12,px),ln(dClip+o2,0.14,px)), max(ln(dTab+o2,0.12,px),ln(dSeat-o2,0.16,px))));
    float outl=smoothstep(-1.,0.,d), outd=ln(d+1.5,0.3,px);
    float fr=smoothstep(-px,px,dW); float seat=(1.-smoothstep(-px,px,dSeat))*0.2;
    float tt=q.x/uSize.x+q.y/uSize.y*0.6+R.x*1.6+R.y*0.9; float sheen=0.3*(exp(-pow((tt-0.15)*4.5,2.))+0.45*exp(-pow((tt+0.42)*9.,2.)));
    float body=mix(uP.w,uP.z,fr)+seat; float ea=clamp(outl*0.42+lb*uP.y,0.,1.); float refl=(0.04+0.6*fres)*uP.x*(0.6+0.6*fr); float spec=min(ggx(ndh,0.05)*ndl*0.02,1.5)*uP.x;
    vec3 add=(envR(R)*refl+uKeyCol*spec+uRimCol*rim*0.35*uP.x+vec3(sheen)*(0.45+0.55*dl))*uDim;
    float sa=clamp(body+ea,0.,1.); float al=clamp(sa+(ld*0.26+outd*0.2)*(1.-lb)+dot(add,vec3(0.3333))*0.85,0.,1.);
    gl_FragColor=vec4((uColor.rgb*(0.6+0.5*dl)*uDim*sa+add)*uExp, al)*cov*mk; return; }
  else if(uKind==13){ float e=abs(vUv.y-0.5)*2.; float l2=smoothstep(0.55,1.,e); vec3 dl=difL(N); float pipe=0.5+0.5*sin(vUv.x*31.4+R.x*5.+R.z*4.);
    float a2=clamp(uColor.a*(0.6+0.85*pipe)+l2*0.72+fres*0.3,0.,1.); vec3 add=(envR(R)*(0.3+0.7*fres)+uKeyCol*min(ggx(ndh,0.08)*ndl*0.08,1.4)+vec3(pow(pipe,6.))*0.22*(0.5+0.5*dl))*uDim;
    gl_FragColor=vec4((uColor.rgb*(0.62+0.5*dl)*uDim*a2+add)*uExp, clamp(a2+dot(add,vec3(0.3333))*0.8,0.,1.))*cov*mk; return; }
  else if(uKind==14){ vec2 q=(vUv-0.5)*uSize; vec3 dl=difL(N); vec2 hs=uSize*0.5; float px=max(aaw(q.x),aaw(q.y))*1.1;
    float dW=rr(q-vec2(0.,uUvRect.z), uUvRect.xy, 2.6), dW2=rr(q-vec2(0.,uUvRect.z), uUvRect.xy+vec2(2.4), 3.4), dL=rr(q-vec2(0.,uUvRect.w), vec2(hs.x-4.1,11.9), 1.3), dR=d+3.2;
    float lb=max(max(ln(dW,0.14,px),ln(dW2,0.1,px)), max(ln(dL,0.14,px),ln(dR,0.12,px))); float o2=0.34; float ld=max(max(ln(dW-o2,0.2,px),ln(dW2+o2,0.14,px)), max(ln(dL-o2,0.2,px),ln(dR+o2,0.16,px)));
    float clear=min(smoothstep(-px,px,dW), smoothstep(-px,px,dL)); float tt=q.x/uSize.x+q.y/uSize.y*0.6+R.x*1.6+R.y*0.9; float sheen=0.28*(exp(-pow((tt-0.15)*4.5,2.))+0.45*exp(-pow((tt+0.42)*9.,2.)));
    float body=mix(uP.w,uP.z,clear); float ea=clamp(lb*uP.y,0.,1.); float refl=(0.05+0.65*fres)*uP.x; float spec=min(ggx(ndh,0.05)*ndl*0.02,1.5)*uP.x;
    vec3 add=(envR(R)*refl+uKeyCol*spec+uRimCol*rim*0.35*uP.x+vec3(sheen)*(0.45+0.55*dl))*uDim;
    float sa=clamp(body+ea,0.,1.); float al=clamp(sa+ld*0.24*(1.-lb)+dot(add,vec3(0.3333))*0.85,0.,1.);
    gl_FragColor=vec4((uColor.rgb*(0.6+0.5*dl)*uDim*sa+add)*uExp, al)*cov*mk; return; }
  else if(uKind==3){ float s=1.-smoothstep(-2.4*uP.x, 0., d); a=uColor.a*s*(0.35+0.65*s); gl_FragColor=vec4(uColor.rgb*a, a); return; }
  else if(uKind==4){ vec2 q=(vUv-0.5)*2.; float r=length(q); float disc=clamp(0.5-(r-1.)/aaw(r),0.,1.); vec2 hq=abs(q); float hx=max(hq.x*0.866+hq.y*0.5, hq.y); float sock=1.-smoothstep(0.30,0.35,hx);
    float ang=atan(q.y,q.x), la=atan(uKey.y+V.y*0.7, uKey.x+V.x*0.7+R.x*0.9); float con=pow(abs(cos(ang-la)),5.); float cham=smoothstep(0.76,0.88,r)*(1.-smoothstep(0.94,1.,r)); float lathe=0.93+0.07*sin(r*80.);
    vec3 m=(uColor.rgb*(0.2+1.05*con+0.55*cham)*(0.5+0.65*difL(N))*lathe+envR(R)*0.3*uColor.rgb+uKeyCol*min(ggx(ndh,0.1)*ndl*0.3,1.4)); vec3 hole=uColor.rgb*(0.05+0.14*smoothstep(0.12,0.33,hx))*(0.6+0.4*difL(N));
    c=mix(m,hole,sock)*uDim; gl_FragColor=vec4(c*uExp,1.)*disc*mk; return; }
  else if(uKind==5){ float r=length(vPos.xz-uP.xy)/uP.z; float fall=1.-smoothstep(0.30,1.,r); vec3 base=uColor.rgb; float st=uP.w;
    if(st>0.5&&st<1.5){ float pl=floor(vPos.z/95.); float g=vn(vec2(vPos.x*0.012+pl*5.1, vPos.z*0.55))*0.6+vn(vec2(vPos.x*0.06+pl*2.3, vPos.z*2.4))*0.4; base*=0.78+0.4*g; float fz=fract(vPos.z/95.); base*=1.-0.35*(smoothstep(0.02,0.,fz)+smoothstep(0.98,1.,fz)); }
    else if(st>1.5&&st<2.5){ base*=0.88+0.22*vn(vPos.xz*1.7)*vn(vPos.xz*0.37+3.); }
    else if(st>2.5){ base*=0.80+0.3*vn(vPos.xz*0.045)+0.1*vn(vPos.xz*0.7); }
    vec2 suv=(vPos.xz-uSh.yz)/uSh.w*0.5+0.5; float sh=0.; if(suv.x>0.&&suv.x<1.&&suv.y>0.&&suv.y<1.) sh=texture2D(uShadowTex,suv).a*uShAmt;
    c=base*(0.5+0.5*difL(vec3(0.,1.,0.)))*(1.-sh)*uDim*uExp; gl_FragColor=vec4(mix(uBg, c, fall), 1.); return; }
  else if(uKind==6){ float fy=vUv.y*uP.y; float f=fract(fy); float fw=0.;
#ifdef DERIV
    fw=fwidth(fy);
#endif
    float k=1.-smoothstep(0.3,0.8,fw);
    float core=smoothstep(0.42-fw,0.47,f)*(1.-smoothstep(0.53,0.58+fw,f)); float gp=uP.y>1.5?1.-smoothstep(0.,0.06+fw,min(f,1.-f)):0.;
    core=mix(0.13,core,k); gp=mix(0.12,gp,k); float hs=uP.y>1.5?fract(sin(floor(fy)*91.7)*43758.5):0.5; float tone=0.93+0.09*mix(0.5,hs,k);
    if(uP.x>0.5) c=(uColor.rgb*(0.35+0.4*difL(N))+envR(R)*0.55*uColor.rgb+uKeyCol*min(ggx(ndh,0.2)*ndl*0.25,1.2)*uColor.rgb)*(1.-0.3*gp)*uDim;
    else c=mix(uColor.rgb*tone, vec3(0.07,0.07,0.09), core*uP.z)*(1.-0.38*gp)*min(difL(N)*0.72+0.36,vec3(1.08))*uDim; }
  else if(uKind==7){ vec4 t=texture2D(uTex, uUvRect.xy+vUv*uUvRect.zw); c=t.rgb*min(difL(N),vec3(1.25))*uDim; a=t.a*uColor.a; }
  else if(uKind==8){ float dh=rr((vUv-0.5)*uSize, uUvRect.xy, uUvRect.z); cov*=clamp(0.5+dh/aaw(dh),0.,1.); if(cov<=0.003) discard; vec3 base=uColor.rgb*(1.+(vn((vUv-0.5)*uSize*uP.y)-0.5)*uP.z); float bev=1.-smoothstep(uP.w*0.85, uP.w, dh); base=mix(base, vec3(0.97,0.96,0.93)*(0.86+0.14*smoothstep(0.,uP.w,dh)), bev); c=base*difL(N)*uDim; }
  else if(uKind==9){ vec4 t=texture2D(uTex, uUvRect.xy+vUv*uUvRect.zw); float yy=min(vUv.y,1.-vUv.y); float inCr=1.-smoothstep(uP.y-0.004,uP.y+0.004,yy);
    float ridge=sin(vUv.y*uSize.y*6.2832/1.3); vec3 Nf=normalize(N+vec3(0.,1.,0.)*ridge*0.6*inCr); vec3 Rf=reflect(-V,Nf); float nhf=max(dot(Nf,H),0.);
    vec3 film=t.rgb*mix(1., 0.84+0.28*ridge, inCr*0.7);
    c=film*min(difL(Nf),vec3(1.35))*0.95+(envR(Rf)*(0.16+0.6*fres)+uKeyCol*min(ggx(nhf,0.13)*max(dot(Nf,uKey),0.)*0.06,0.9)+uRimCol*rim*0.3)*uP.x*uDim; }
  else if(uKind==10){ if(uP.y>0.){ float gy=uP.z>0.5?1.-vUv.y:vUv.y; float g=pow(clamp(gy,0.,1.),uP.y)*smoothstep(0.,0.06,vUv.x)*smoothstep(1.,0.94,vUv.x); gl_FragColor=vec4(uColor.rgb*uP.x*g*cov*mk, 0.); return; } gl_FragColor=vec4(uColor.rgb*uP.x*uColor.a, uColor.a)*cov*mk; return; }
  gl_FragColor=vec4(c*uExp*a, a)*cov*mk;
}`;
    const BVS = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv=aPos*0.5+0.5; gl_Position=vec4(aPos,0.,1.); }`;
    const BFS = `precision mediump float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir;
void main(){ float a=texture2D(uTex,vUv).a*0.227; a+=(texture2D(uTex,vUv+uDir*1.385).a+texture2D(uTex,vUv-uDir*1.385).a)*0.316; a+=(texture2D(uTex,vUv+uDir*3.231).a+texture2D(uTex,vUv-uDir*3.231).a)*0.0703; gl_FragColor=vec4(0.,0.,0.,a); }`;

    function create(canvas) {
      const gl = canvas.getContext("webgl", { antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
      if (!gl) throw new Error("WebGL indisponible");
      gl.getExtension("OES_standard_derivatives"); const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const link = (vs, fs, attrs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); attrs.forEach((n, i) => gl.bindAttribLocation(p, i, n)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
      const prog = link(VS, FS, ["aPos", "aNor", "aUv"]), bprog = link(BVS, BFS, ["aPos"]);
      const U = {}; for (const n of ["uVP", "uM", "uN", "uPass", "uKey", "uSh", "uTex", "uShadowTex", "uColor", "uUvRect", "uP", "uSize", "uRad", "uClip", "uCast", "uMirror", "uExp", "uShAmt", "uEnvAmt", "uKind", "uCam", "uKeyCol", "uFill", "uFillCol", "uAmbCol", "uRimDir", "uRimCol", "uBg", "uDim"]) U[n] = gl.getUniformLocation(prog, n);
      const UB = { uTex: gl.getUniformLocation(bprog, "uTex"), uDir: gl.getUniformLocation(bprog, "uDir") };
      gl.useProgram(prog); gl.uniform1i(U.uTex, 0); gl.uniform1i(U.uShadowTex, 1);
      for (let i = 0; i < 3; i++) gl.enableVertexAttribArray(i);
      const fsq = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, fsq); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const meshes = new Map(); let bound = null;
      function mesh(key, build) { let m = meshes.get(key); if (!m) { const g = build(); m = { vbo: gl.createBuffer(), ibo: gl.createBuffer(), groups: g.groups }; gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo); gl.bufferData(gl.ARRAY_BUFFER, g.v, gl.STATIC_DRAW); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.i, gl.STATIC_DRAW); meshes.set(key, m); bound = null; } return m; }
      mesh("quad", quadMesh);
      const bind = m => { if (bound === m) return; bound = m; gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo); };
      const texes = new Map();
      function tex(key) {
        let t = texes.get(key);
        if (!t) { t = { t: gl.createTexture(), w: 1, h: 1, key }; gl.bindTexture(gl.TEXTURE_2D, t.t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([120, 120, 126, 255])); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); texes.set(key, t); }
        return t;
      }
      function upload(t, src) {
        const w = src.width, h = src.height; gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t.t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        const pot = (w & (w - 1)) === 0 && (h & (h - 1)) === 0; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (pot) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }
        else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        t.w = w; t.h = h;
      }
      /* shadow targets */
      const SH = 512; const target = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SH, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null); return { t, f }; };
      const TA = target(), TB = target();
      function camera(view) {
        const y = view.yaw * D, p = view.pitch * D; const tgt = [view.tx, view.ty, view.tz];
        const back = [Math.sin(y) * Math.cos(p), Math.sin(p), Math.cos(y) * Math.cos(p)]; const eye = add(tgt, mul(back, view.dist));
        const right = norm(cross([0, 1, 0], back)), up = cross(back, right); return { eye, tgt, right, up, back };
      }
      function resize(scale) {
        const dpr = Math.min((window.devicePixelRatio || 1) * (scale || 1), 2.5); const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; return true; } return false;
      }
      let curDim = [1, 1, 1], glowOn = false;
      function drawItem(q, mirror, fy) {
        if (q.glow) { gl.uniform3f(U.uDim, Math.max(curDim[0], q.glow[0]), Math.max(curDim[1], q.glow[1]), Math.max(curDim[2], q.glow[2])); glowOn = true; } else if (glowOn) { gl.uniform3fv(U.uDim, curDim); glowOn = false; }
        const f = q.f; let o = f.o, x = f.x, y = f.y, z = f.z;
        if (mirror) { o = [o[0], 2 * fy - o[1], o[2]]; x = [x[0], -x[1], x[2]]; y = [y[0], -y[1], y[2]]; z = [z[0], -z[1], z[2]]; }
        const sx = q.w || 1, sy = q.h || 1;
        gl.uniformMatrix4fv(U.uM, false, [x[0] * sx, x[1] * sx, x[2] * sx, 0, y[0] * sy, y[1] * sy, y[2] * sy, 0, z[0], z[1], z[2], 0, o[0], o[1], o[2], 1]);
        gl.uniformMatrix3fv(U.uN, false, [x[0], x[1], x[2], y[0], y[1], y[2], z[0], z[1], z[2]]);
        if (q.size) gl.uniform2f(U.uSize, q.size[0], q.size[1]); else gl.uniform2f(U.uSize, 0, 0);
        gl.uniform1f(U.uRad, q.rad || 0); gl.uniform1f(U.uClip, q.clip ? 1 : 0); gl.uniform1i(U.uKind, q.kind); gl.uniform4fv(U.uColor, q.color); gl.uniform4fv(U.uP, q.p);
        const uv = q.uv || [0, 1, 1, -1]; gl.uniform4f(U.uUvRect, uv[0], uv[1], uv[2], uv[3]);
        if (q.tex) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, q.tex.t); }
        const m = meshes.get(q.mesh); if (!m) return; const g = m.groups[q.group || "all"]; if (!g) return; bind(m); gl.drawElements(gl.TRIANGLES, g[1], gl.UNSIGNED_SHORT, g[0] * 2);
      }
      function draw(scene, view, L) {
        const w = canvas.width, h = canvas.height; const cam = camera(view); const fy = scene.floorY; const above = cam.eye[1] > fy + 0.5;
        const near = Math.max(4, view.dist * 0.04), far = view.dist * 5 + 3000; const Vm = lookAt(cam.eye, cam.tgt, [0, 1, 0]); const VP = mmul(persp((view.fov || 26) * D, w / h, near, far), Vm);
        const dim = L.dim || [1, 1, 1]; const bg = [scene.bg[0] * dim[0], scene.bg[1] * dim[1], scene.bg[2] * dim[2]];
        const fill = norm(add(add(mul(cam.back, 0.75), mul(cam.up, 0.45)), mul(cam.right, 0.25))), rimD = norm(add(add(mul(cam.back, -0.8), mul(cam.up, 0.5)), mul(cam.right, -0.25)));
        gl.useProgram(prog); bound = null;
        gl.uniformMatrix4fv(U.uVP, false, VP); gl.uniform3fv(U.uCam, cam.eye); gl.uniform3fv(U.uKeyCol, L.keyCol); gl.uniform3fv(U.uFillCol, L.fillCol); gl.uniform3fv(U.uAmbCol, L.ambCol); gl.uniform3fv(U.uRimCol, L.rimCol);
        gl.uniform3fv(U.uBg, bg); gl.uniform3fv(U.uDim, dim); curDim = dim; glowOn = false; gl.uniform1f(U.uExp, L.exp || 1); gl.uniform1f(U.uEnvAmt, L.env === undefined ? 1 : L.env); gl.uniform1f(U.uShAmt, above ? (L.shadow || 0) : 0);
        const R = scene.shadowR || 400; gl.uniform4f(U.uSh, fy, scene.target[0], scene.target[2], R);
        const lights = mirror => { const my = v => mirror ? [v[0], -v[1], v[2]] : v; gl.uniform3fv(U.uKey, my(L.key)); gl.uniform3fv(U.uFill, my(fill)); gl.uniform3fv(U.uRimDir, my(rimD)); };
        lights(false);
        /* 1. soft shadows: silhouettes projected on the floor along the key light, then blurred */
        if (above && (L.shadow || 0) > 0.01) {
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
          gl.bindFramebuffer(gl.FRAMEBUFFER, TA.f); gl.viewport(0, 0, SH, SH); gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1i(U.uPass, 1); gl.uniform1f(U.uMirror, 0);
          for (const q of scene.items) { const cast = q.cast === undefined ? (q.layer === 2 ? 1 : 0) : q.cast; if (cast <= 0 || q.kind === 3 || q.kind === 5) continue; gl.uniform1f(U.uCast, cast); drawItem(q, false, fy); }
          gl.disable(gl.BLEND); gl.useProgram(bprog); gl.bindBuffer(gl.ARRAY_BUFFER, fsq); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(UB.uTex, 0);
          const soft = L.soft === undefined ? 1 : L.soft;
          for (const [src, dst, dx, dy] of [[TA, TB, 1.2 * soft, 0], [TB, TA, 0, 1.2 * soft], [TA, TB, 2.6 * soft, 0], [TB, TA, 0, 2.6 * soft]]) { gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f); gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform2f(UB.uDir, dx / SH, dy / SH); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
          gl.useProgram(prog); bound = null;
        }
        /* 2. the scene */
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
        gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.uniform1i(U.uPass, 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, TA.t); gl.activeTexture(gl.TEXTURE0);
        const pass = (filter, mirror) => {
          const list = [];
          for (const q of scene.items) { if (!filter(q)) continue; const o = q.f.o, oy = mirror ? 2 * fy - o[1] : o[1]; if (q.cull) { const z = q.f.z, zy = mirror ? -z[1] : z[1]; if (z[0] * (cam.eye[0] - o[0]) + zy * (cam.eye[1] - oy) + z[2] * (cam.eye[2] - o[2]) <= 0) continue; } list.push([q, Vm[2] * o[0] + Vm[6] * oy + Vm[10] * o[2] + Vm[14]]); }
          list.sort((a, b) => (a[0].layer - b[0].layer) || (a[1] - b[1])); lights(mirror); gl.uniform1f(U.uMirror, mirror ? (L.mirror || 0) : 0);
          for (const [q] of list) { gl.depthMask(q.layer === 2); drawItem(q, mirror, fy); }
        };
        if (above) { pass(q => q.layer < 2, false); if ((L.mirror || 0) > 0.01) pass(q => q.layer >= 2 && q.kind !== 3, true); }
        pass(q => q.layer >= 2, false);
        gl.depthMask(true); return cam;
      }
      return { gl, canvas, tex, upload, mesh, draw, camera, resize };
    }
    return { create, slabMesh, pillowMesh, ringMesh, frameMesh, polyMesh, V: { sub, add, mul, dot, cross, norm } };
  })();

  /* ================= MockScenes: product geometry ================= */
  const MockScenes = (() => {
    const D = Math.PI / 180; const { mul } = Mock3D.V;
    /* easing: in-out for travel, out for arrivals, a small overshoot for lids that settle */
    const eio = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), eout = t => 1 - Math.pow(1 - t, 3), eback = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); const clampN = (v, a, b) => Math.min(b, Math.max(a, v)); const T = 0.33;
    /* columns of Ry(yaw) * Rx(pitch) * Rz(roll); negative pitch leans the top away from the viewer, -90 lays the object flat, face up */
    const m3 = (yaw, pitch, roll) => {
      const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D), cp = Math.cos(pitch * D), sp = Math.sin(pitch * D), cr = Math.cos(roll * D), sr = Math.sin(roll * D);
      const Rz = [[cr, sr, 0], [-sr, cr, 0], [0, 0, 1]], Rx = [[1, 0, 0], [0, cp, sp], [0, -sp, cp]], Ry = [[cy, 0, -sy], [0, 1, 0], [sy, 0, cy]];
      const ap = (M, v) => [M[0][0] * v[0] + M[1][0] * v[1] + M[2][0] * v[2], M[0][1] * v[0] + M[1][1] * v[1] + M[2][1] * v[2], M[0][2] * v[0] + M[1][2] * v[1] + M[2][2] * v[2]];
      return Rz.map(c => ap(Ry, ap(Rx, c)));
    };
    const ROOT = { o: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
    const pt = (f, x, y, z) => [f.o[0] + f.x[0] * x + f.y[0] * y + f.z[0] * z, f.o[1] + f.x[1] * x + f.y[1] * y + f.z[1] * z, f.o[2] + f.x[2] * x + f.y[2] * y + f.z[2] * z];
    const dir = (f, v) => [f.x[0] * v[0] + f.y[0] * v[1] + f.z[0] * v[2], f.x[1] * v[0] + f.y[1] * v[1] + f.z[1] * v[2], f.x[2] * v[0] + f.y[2] * v[1] + f.z[2] * v[2]];
    const frame = (f, x, y, z, yaw = 0, pitch = 0, roll = 0) => { const c = m3(yaw, pitch, roll); return { o: pt(f, x, y, z), x: dir(f, c[0]), y: dir(f, c[1]), z: dir(f, c[2]) }; };
    const flipF = f => ({ o: f.o, x: mul(f.x, -1), y: f.y, z: mul(f.z, -1) });
    const faceF = (f, name, w, h, d) => {
      if (name === "front") return [{ o: pt(f, 0, 0, d / 2), x: f.x, y: f.y, z: f.z }, w, h];
      if (name === "back") return [{ o: pt(f, 0, 0, -d / 2), x: mul(f.x, -1), y: f.y, z: mul(f.z, -1) }, w, h];
      if (name === "right") return [{ o: pt(f, w / 2, 0, 0), x: mul(f.z, -1), y: f.y, z: f.x }, d, h];
      if (name === "left") return [{ o: pt(f, -w / 2, 0, 0), x: f.z, y: f.y, z: mul(f.x, -1) }, d, h];
      if (name === "top") return [{ o: pt(f, 0, h / 2, 0), x: f.x, y: mul(f.z, -1), z: f.y }, w, d];
      return [{ o: pt(f, 0, -h / 2, 0), x: f.x, y: f.z, z: mul(f.y, -1) }, w, d];
    };
    const HEX = h => { const n = parseInt(String(h || "#000").replace("#", ""), 16) || 0; return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
    const glass = (a = 0.04, gloss = 1, ew = 0, ea = 0, frost = 0, tint = [0.93, 0.96, 1]) => ({ kind: 2, layer: 4, color: [tint[0], tint[1], tint[2], a], p: [gloss, ew, ea, frost], cast: 0.16 + frost });
    const solid = (rgb, gloss = 0.15, a = 1, noise, metal = 0) => ({ kind: 1, layer: a < 1 ? 4 : 2, color: [rgb[0], rgb[1], rgb[2], a], p: [gloss, noise ? noise[0] : 0, noise ? noise[1] : 0, metal], cast: a < 1 ? 0.35 : 1 });
    const metal = (rgb, gloss = 0.8) => solid(rgb, gloss, 1, null, 1);
    /* wood. straight: a plank, grain along its length; otherwise a frame, grain along each side */
    const woodM = (rgb, gloss = 0.28, amt = 0.34, straight = false) => ({ kind: 1, layer: 2, color: [rgb[0], rgb[1], rgb[2], 1], p: [gloss, straight ? -101 : -1, amt, 0], cast: 1 });
    /* acrylic: clear polished faces, edges that pipe the light */
    const acrylEdge = (a = 0.26, tint = [0.9, 0.97, 1]) => ({ kind: 13, layer: 4, color: [tint[0], tint[1], tint[2], a], p: [1, 0, 0, 0], cast: 0.3 });
    const acryl = (a = 0.04) => ({ front: glass(a + 0.015, 1, 2.6, 0.6, 0, [0.9, 0.96, 1]), back: glass(a + 0.015, 1, 2.6, 0.6, 0, [0.9, 0.96, 1]), side: acrylEdge() });
    /* holder plastic: a = body opacity, ew/ea = outline width (mm) and strength; k: tint, sheen, seam (inset in mm), seamA, lip (mm below the top), frost */
    const plast = (a, gloss, ew, ea, k = {}) => { const t = k.tint || [0.84, 0.91, 1]; return { kind: 11, layer: 4, color: [t[0], t[1], t[2], a], p: [gloss, ew, ea, k.frost || 0], uv: [k.sheen || 0, k.seam || 0, k.seamA || 0, k.lip || 0], cast: k.cast === undefined ? 0.2 : k.cast }; };
    const STEEL = [0.82, 0.84, 0.88], GOLD = [0.96, 0.78, 0.36];
    /* outer dimensions of bare graded slabs: width, height, thickness, corner radius, name.
       Independent measurements (Card Capsule, Slabster, PreGrade Cards), not manufacturer specifications. CollectAura, PCA and CCC are not listed: their dimensions are not verified. */
    const SLABS = { psa: [80.25, 135.75, 6.25, 3.2, "PSA"], bgs: [83, 130.75, 8.5, 2.6, "Beckett BGS"], cgc: [80.25, 135, 7.5, 3.4, "CGC"], sgc: [86.25, 138.5, 8.5, 2.6, "SGC"], tag: [80, 134.75, 7.25, 3, "TAG"], psaT: [80.25, 135.75, 10.25, 3.2, "PSA épais"], cgcT: [80.25, 135, 12.5, 3.4, "CGC épais"] };
    const slabDims = (o, W, H) => { let F = SLABS[o.format] || SLABS.psa; if (o.format === "custom") F = [clampN(+o.cw || 80.25, 60, 160), clampN(+o.ch || 135.75, 90, 240), clampN(+o.cd || 6.25, 3, 25), 3, "sur mesure"]; return [Math.max(F[0], W + 14), Math.max(F[1], H + 40), F[2], F[3], F[4]]; };

    /* counter display: packs in 2 or 3 columns; the lid is as deep as the tray, it folds back to become the header */
    const displayDims = pk => { const N = clampN(Math.round(pk.packs || 24), 1, 60), cols = N > 24 ? 3 : 2, rows = Math.ceil(N / cols); const step = rows <= 6 ? 9.5 : 6.4; return { N, cols, rows, step, TW: cols * pk.w + (cols + 1) * 3, TD: Math.max(52, Math.round(rows * step + 22)), hf: 25, hb: 62 }; };
    const binderGrid = o => (o && String(o.grid) === "4") ? [2, 2] : (o && String(o.grid) === "12") ? [4, 3] : [3, 3];
    const binderDims = (W, H, cols = 3, rows = 3) => { const g = 4, pw = W + 4, ph = H + 5, mL = 22; const PW = cols * pw + (cols + 1) * g + mL, PH = rows * ph + (rows + 1) * g; return { g, pw, ph, mL, PW, PH, CW: PW + 14, CH: PH + 16, S: 36 }; };

    function build(id, E) {
      const W = E.W, H = E.H, R = E.R; const Q = [], slots = []; const o = E.opts || {}; let floorY = 0;
      const item = (mesh, group, f, m) => { const q = { mesh, group: group || "all", f, kind: 1, color: [1, 1, 1, 1], p: [0, 0, 0, 0], layer: 2, ...m }; Q.push(q); return q; };
      const quad = (f, x, y, z, w, h, m) => item("quad", "all", frame(f, x, y, z), { w, h, size: [w, h], clip: 1, ...m });
      const slab = (f, x, y, z, w, h, d, r, bev, mats) => {
        const key = "s" + [w, h, d, r, bev].map(v => (+v).toFixed(2)).join("_"); E.mesh(key, () => Mock3D.slabMesh(w, h, d, r, bev)); const sf = frame(f, x, y, z);
        for (const g of ["front", "back", "side"]) { const m = mats[g] || mats.all; if (m) item(key, g, sf, { size: [w, h], rad: r, ...m }); } return sf;
      };
      const box = (f, x, y, z, w, h, d, mat, only) => { const bf = frame(f, x, y, z); for (const name of only || ["front", "back", "left", "right", "top", "bottom"]) { const m = typeof mat === "function" ? mat(name) : mat; if (!m) continue; const [ff, fw, fh] = faceF(bf, name, w, h, d); quad(ff, 0, 0, 0, fw, fh, m); } return bf; };
      const ec = E.edge;
      const card = (f, x, y, z, slot, gloss = 1) => {
        const sf = slab(f, x, y, z, W, H, T, R, 0, { front: { kind: 0, tex: E.tex("s" + slot + "f"), p: [gloss, 0, 0, 0] }, back: { kind: 0, tex: E.tex("s" + slot + "b"), p: [gloss, 0, 0, 0] }, side: { kind: 6, color: [ec.rgb[0], ec.rgb[1], ec.rgb[2], 1], p: [ec.metal, 1, ec.core, 0] } });
        if (!slots[slot]) slots[slot] = { c: sf.o, r: sf.x, u: sf.y, n: sf.z }; return sf;
      };
      const floor = (y, radius) => { floorY = y; quad(frame(ROOT, 0, y, 0, 0, -90, 0), 0, 0, 0, radius * 2.4, radius * 2.4, { kind: 5, layer: 0, clip: 0, color: [E.floor.color[0], E.floor.color[1], E.floor.color[2], 1], p: [0, 0, radius, E.floor.style] }); };
      const contact = (x, z, w, d, rot = 0, a = 0.5, blur = 2.4) => { quad(frame(ROOT, x, floorY + 0.2, z, rot, -90, 0), 0, 0, 0, w + blur * 2.4, d + blur * 2.4, { kind: 3, layer: 1, rad: Math.min(w, d) / 2 + blur * 1.2, color: [0, 0, 0, a * E.floor.shadow], p: [blur, 0, 0, 0] }); };
      const ring = (f, x, y, z, w, h, d, ro, band, ri, m) => { const key = "f" + [w, h, d, ro, band, ri].map(v => (+v).toFixed(2)).join("_"); E.mesh(key, () => Mock3D.frameMesh(w, h, d, ro, band, ri)); const sf = frame(f, x, y, z); const mm = (m.front || m.side || m.all) ? m : { all: m }; for (const g of ["front", "back", "side", "inner"]) { const q = mm[g] || mm.all; if (q) item(key, g, sf, (q.kind === 1 && q.p[1] < 0 && (g === "front" || g === "back")) ? { ...q, size: [w, h] } : { ...q }); } return sf; };
      const poly = (f, pts, d, mats) => { const key = "g" + pts.flat().map(v => (+v).toFixed(1)).join("_") + "_" + d; E.mesh(key, () => Mock3D.polyMesh(pts, d)); for (const g of ["front", "back", "side"]) { const mm = mats[g] || mats.all; if (mm) item(key, g, f, { ...mm }); } };
      const rod = (P, Q, dia, m) => { const V = Mock3D.V; const z = V.norm(V.sub(Q, P)); let x = V.cross([0, 1, 0], z); if (Math.hypot(x[0], x[1], x[2]) < 1e-3) x = [1, 0, 0]; x = V.norm(x); const y = V.cross(z, x); return slab({ o: [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2, (P[2] + Q[2]) / 2], x, y, z }, 0, 0, 0, dia, dia, Math.hypot(Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]), dia / 2, Math.min(0.4, dia * 0.3), { all: m }); };
      const cyl = (f, x, y, z, dia, len, m) => slab(f, x, y, z, dia, dia, len, dia / 2, Math.min(0.4, len * 0.3), { all: m });
      /* magnetic holder (one-touch), after a dimensioned drawing: 73 x 110 x 8.2 mm outside, 64 x 90 mm well, for a standard card */
      const oneTouch = (f, x, y, z, slot) => {
        const OW = W + 10, OH = H + 21.5, OD = 8.2, cy = -2.2, ww = W + 0.6, wh = H + 1.2; const bf = frame(f, x, y, z);
        const face = { kind: 12, layer: 4, color: [0.93, 0.96, 1, 1], p: [1, 0.6, 0.05, 0.012], uv: [ww / 2, wh / 2, cy, 0], cast: 0.2 }; const rim = acrylEdge(0.2, [0.93, 0.98, 1]);
        for (const s of [1, -1]) slab(bf, 0, 0, s * OD / 4, OW, OH, OD / 2 - 0.1, 2.4, 0.55, { front: s > 0 ? face : null, back: s < 0 ? face : null, side: rim });
        const wall = { ...glass(0.03, 0.8, 0, 0, 0.14, [0.95, 0.98, 1]), cast: 0 }; box(bf, 0, cy, 0, ww, wh, 2.6, wall, ["left", "right", "top", "bottom"]);
        /* magnet: a gold disc with a dark core, set in the top bar */
        const my = OH / 2 - 5.2; cyl(bf, 0, my, 0, 2.7, 3.4, metal(GOLD, 0.9));
        for (const s of [1, -1]) { const ff = s > 0 ? frame(bf, 0, 0, 1.76) : flipF(frame(bf, 0, 0, -1.76)); quad(ff, 0, my, 0, 2.5, 2.5, { ...metal([0.98, 0.83, 0.42], 0.95), rad: 1.25, layer: 3, cast: 0 }); quad(ff, 0, my, 0.03, 0.95, 0.95, { ...solid([0.33, 0.24, 0.1], 0.5), rad: 0.475, layer: 3, cast: 0 }); }
        if (slot >= 0) card(bf, 0, cy, 0, slot); return [OW, OH, OD];
      };
      /* soft sleeve, rigid toploader or semi-rigid holder, centred on its frame; slot < 0 leaves it empty */
      const holderDims = kind => kind === "sleeve" ? [W + 3, H + 3.5, 0.55] : kind === "semi" ? [W + 21, H + 37, 0.9] : [W + 13.2, H + 13.6, 1.9];
      const holder = (f, x, y, z, kind, slot) => {
        const [TW, TH, TD] = holderDims(kind); const matte = kind === "sleeve" && o.finish === "matte"; let fr, bk, sd, rad, base;
        if (kind === "sleeve") { fr = plast(0.03, matte ? 0.3 : 1, 0.8, 0.3, { sheen: matte ? 0.14 : 0.5, seam: 1.5, seamA: 0.32, frost: matte ? 0.07 : 0.008, tint: [0.9, 0.94, 1] }); bk = (E.art && E.art["sleeve.back"]) ? { kind: 0, tex: E.tex("sleeveb"), p: [matte ? 0.15 : 0.7, 0, 0, 0] } : (o.tint && o.tint !== "clear") ? solid(HEX(o.tint), matte ? 0.04 : 0.4) : fr; sd = glass(0.16, 0.6); rad = 0.9; base = 1.2; }
        else if (kind === "semi") { fr = plast(0.05, 1, 1.1, 0.36, { sheen: 0.42, seam: 2, seamA: 0.42, lip: 6.5, frost: 0.012, tint: [0.82, 0.91, 1] }); bk = plast(0.05, 1, 1.1, 0.36, { sheen: 0.2, seam: 2, seamA: 0.42, tint: [0.82, 0.91, 1] }); sd = solid([0.8, 0.89, 0.98], 0.6, 0.5); rad = 3; base = 3.2; }
        else { fr = plast(0.045, 1, 1.5, 0.46, { sheen: 0.36, seam: 3.4, seamA: 0.5, lip: 2.4, tint: [0.78, 0.88, 1] }); bk = plast(0.045, 1, 1.5, 0.46, { sheen: 0.16, seam: 3.4, seamA: 0.5, tint: [0.78, 0.88, 1] }); sd = solid([0.76, 0.87, 0.98], 0.6, 0.6); rad = 2.5; base = 3; }
        const sf = slab(f, x, y, z, TW, TH, TD, rad, kind === "sleeve" ? 0 : 0.2, { front: fr, back: bk, side: sd }); if (kind === "sleeve" && o.double) { const inn = plast(0.02, 1, 0.6, 0.24, { sheen: 0.18, seam: 0.7, seamA: 0.24, tint: [0.92, 0.95, 1] }); slab(sf, 0, -TH / 2 + base + H / 2 + 0.4, 0, W + 1.4, H + 1.4, 0.42, 0.6, 0, { front: inn, back: (E.art && E.art["sleeve.back"]) || (o.tint && o.tint !== "clear") ? null : inn }); }
        if (slot >= 0) card(sf, 0, -TH / 2 + base + H / 2, 0, slot); return [TW, TH, TD];
      };
      /* graded slab: a clear body recessed inside a raised rim, the label sealed inside its compartment above the card well. guard: silicone bumper, magnetic metal frame or soft sleeve */
      const graded = (f, x, y, z, slot, so, lean = 0, guard = "") => {
        const [SW, SH, SD, SR] = slabDims(so, W, H); const LH = 21; const cy = -13.25, ly = SH / 2 - 6 - LH / 2; const tint = [0.9, 0.94, 1]; const gy = guard === "bumper" ? 1.7 : guard === "metal" ? 2.5 : 0; const bd = Math.max(2.4, SD - 1.8);
        const bf = frame(frame(f, x, y, z, 0, lean, 0), 0, SH / 2 + gy, 0); const face = { kind: 14, layer: 4, color: [0.92, 0.95, 1, 1], p: [1, 0.55, 0.045, 0.012], uv: [(W + 4.6) / 2, (H + 4.6) / 2, cy, ly], cast: 0.2 };
        slab(bf, 0, 0, 0, SW - 0.6, SH - 0.6, bd, SR, 0.3, { front: face, back: face });
        ring(bf, 0, 0, 0, SW, SH, SD, SR, 2.7, Math.max(0.8, SR - 1.7), { front: glass(0.05, 1, 0, 0, 0.03, tint), back: glass(0.05, 1, 0, 0, 0.03, tint), side: acrylEdge(0.2), inner: acrylEdge(0.08) });
        if (so.format === "sgc") quad(bf, 0, 0, -0.3, SW - 6.5, SH - 6.5, { ...solid([0.03, 0.03, 0.035], 0.1), rad: 2 });
        /* the label is inside the slab, on both faces of a thin insert */
        for (const s of [1, -1]) quad(s > 0 ? frame(bf, 0, 0, 0.45) : flipF(frame(bf, 0, 0, -0.62)), 0, ly, 0, SW - 9, LH, { kind: 7, tex: E.tex(s > 0 ? "label" + slot : "labelb"), rad: 1.2, cull: true, layer: 3 });
        card(bf, 0, cy, 0, slot);
        if (guard === "bumper") {
          const c1 = HEX(so.gcolor || "#d0202a"), fin = so.gfinish || "", bm = solid(c1, fin.indexOf("glit") >= 0 ? 0.42 : 0.24);
          if (fin) { const c2 = fin.indexOf("grad") >= 0 ? HEX(so.gcolor2 || "#7a3fd0") : c1; bm.p = [bm.p[0], pt(bf, 0, -(SH + 3.4) / 2, 0)[1], 1 / (SH + 3.4), 0]; bm.uv = [c2[0], c2[1], c2[2], fin === "grad" ? 2 : fin === "glit" ? 3 : 4]; }
          ring(bf, 0, 0, 0, SW + 3.4, SH + 3.4, SD + 1.8, 4.2, 4.3, 2.7, bm);
        }
        else if (guard === "metal") { const mc = HEX(so.gcolor || "#1b1b1f"); ring(bf, 0, 0, 0, SW + 5, SH + 5, SD + 2.2, 3.2, 5.6, 1.6, metal([mc[0] * 0.8 + 0.12, mc[1] * 0.8 + 0.12, mc[2] * 0.8 + 0.12], 0.75)); for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) cyl(bf, sx * (SW / 2 - 0.2), sy * (SH / 2 - 0.2), 0, 3, SD + 3, metal(STEEL, 0.85)); }
        else if (guard === "sleeve") slab(bf, 0, 2, 0, SW + 3.5, SH + 8, SD + 0.9, 2.2, 0, { all: { ...glass(0.035, 0.9, 1.4, 0.12), cast: 0.05 } });
        return [SW, SH, SD, gy];
      };
      const pillow = (f, x, y, z, w, h, depth, crimp, open, front, back, light) => {
        const key = "p" + [w, h, depth, crimp, open ? 1 : 0, light ? 1 : 0].map(v => (+v).toFixed(1)).join("_"); E.mesh(key, () => Mock3D.pillowMesh(w, h, depth, crimp, open, light)); const pf = frame(f, x, y, z);
        item(key, "front", pf, { kind: 9, tex: front, size: [w, h], p: [1, crimp / h, 0, 1] }); item(key, "back", pf, { kind: 9, tex: back, size: [w, h], p: [1, crimp / h, 0, 1] }); return pf;
      };
      let ext = [W * 1.7, H * 1.45], cam = { yaw: -20, pitch: 8 }, target = [0, 0, 0], caption = "", scenePack = null;

      if (id === "card") {
        floor(-H / 2 - 6, 300); card(frame(ROOT, 0, 0, 0, 0, -5, 0), 0, 0, 0, 0);
        caption = `Carte seule · ${W} × ${H} mm · épaisseur 0,33 mm`;
      } else if (id === "fan") {
        const n = clampN(o.count || 5, 2, 9); const spread = Math.min(15, 64 / (n - 1)); const piv = -H * 1.55; const G = frame(ROOT, 0, 0, 0, 0, -8, 0);
        const amax = (n - 1) / 2 * spread * D; const drop = Math.abs(piv) * (1 - Math.cos(amax)) + (W / 2) * Math.sin(amax); const span = 2 * (Math.abs(piv) * Math.sin(amax) + (W / 2) * Math.cos(amax) + (H / 2) * Math.sin(amax));
        floor(-(H / 2) * Math.cos(amax) - drop - 5, 340);
        for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * spread; card(frame(G, 0, piv, (i - (n - 1) / 2) * 1.1, 0, 0, -a), 0, -piv, 0, i); }
        ext = [span + 30, H * 1.5 + drop]; target = [0, -drop * 0.35, 0]; cam = { yaw: -14, pitch: 8 }; caption = `Éventail · ${n} cartes`;
      } else if (id === "row") {
        const n = clampN(o.count || 4, 2, 7), gap = 10, total = n * W + (n - 1) * gap; floor(-H / 2 - 5, 380);
        for (let i = 0; i < n; i++) { const t = i - (n - 1) / 2; card(frame(ROOT, t * (W + gap), 0, -t * t * 3.2, -t * 7, -5, 0), 0, 0, 0, i); }
        ext = [total + 36, H * 1.4]; cam = { yaw: -10, pitch: 7 }; caption = `Rangée · ${n} cartes`;
      } else if (id === "stack") {
        const N = clampN(o.pile || 30, 2, 150), th = N * T, k = clampN(o.loose === undefined ? 2 : o.loose, 0, 3); floor(0, 340);
        const rnd = i => { const v = Math.sin(i * 127.1 + N * 3.7) * 43758.5453; return v - Math.floor(v); }; const tidy = o.tidy === "1";
        const parts = []; let left = N, pi = 0; while (left > 0) { const top = left <= 3; const n = top ? 1 : Math.max(1, Math.min(left - 3, Math.round((N > 40 ? 5 : 2) + rnd(pi + 9) * (N > 40 ? 9 : 4)))); parts.push(n); left -= n; pi++; }
        let z0 = 0, G = null; parts.forEach((n, i) => {
          const amp = tidy ? 0.12 : (n === 1 ? 1 : 0.55); const dx = (rnd(i) - 0.5) * 2 * amp, dy = (rnd(i + 31) - 0.5) * 2 * amp, rot = (rnd(i + 57) - 0.5) * (tidy ? 0.3 : n === 1 ? 3.2 : 1.5); const d = n * T - 0.012;
          G = frame(ROOT, dx, z0 + n * T / 2, dy, 14 + rot, -90, 0); z0 += n * T;
          slab(G, 0, 0, 0, W, H, d, R, 0, { front: { kind: 0, tex: E.tex("s0f"), p: [1, 0, 0, 0] }, back: { kind: 0, tex: E.tex("s0b"), p: [1, 0, 0, 0] }, side: { kind: 6, color: [ec.rgb[0], ec.rgb[1], ec.rgb[2], 1], p: [ec.metal, n, ec.core, 0] } });
        });
        slots[0] = { c: pt(G, 0, 0, T / 2), r: G.x, u: G.y, n: G.z }; contact(0, 0, W + 1, H + 1, 14, 0.5, 2.6);
        const loose = [[W * 1.02, H * 0.3, -22], [-W * 0.98, H * 0.36, 17], [W * 0.15, H * 1.02, 82]];
        for (let i = 0; i < k; i++) { const [x, z, r] = loose[i]; card(frame(ROOT, x, T / 2 + 0.05 + i * 0.36, z, r, -90, 0), 0, 0, 0, i + 1); contact(x, z, W, H, r, 0.3, 1.6); }
        ext = [W * (k ? 3.9 : 2.1), H * (k > 2 ? 3.0 : k ? 2.5 : 1.9)]; target = [0, th / 2, k > 2 ? H * 0.45 : k ? H * 0.22 : 0]; cam = { yaw: -20, pitch: 42 };
        caption = `Pile · ${N} cartes · ${th.toFixed(1).replace(".", ",")} mm d'épaisseur`;
      } else if (id === "binder") {
        /* ring binder lying on the table; t = 0 closed, 1 open. The spine swings 90 degrees and the front cover 180 degrees. Each sheet holds nine cards per side and turns around the rings. */
        const t = clampN(E.anim && E.anim.open !== undefined ? E.anim.open : 1, 0, 1); const [gc, gr] = binderGrid(o), NP = gc * gr; const { g, pw, ph, mL, PW, PH, CW, CH, S } = binderDims(W, H, gc, gr); const bt = 3;
        const col = HEX(o.color || "#1c1f29"), inner = [col[0] * 0.55 + 0.1, col[1] * 0.55 + 0.1, col[2] * 0.55 + 0.1]; floor(0, 640);
        const TF = frame(ROOT, (CW + S) / 2 * t, 0, 0, 0, -90, 0); const board = (outer, inn) => ({ front: outer, back: inn, side: solid(col, 0.25, 1, [1.2, 0.06]) }); const leather = solid(col, 0.28, 1, [1.4, 0.07]), lining = solid(inner, 0.08, 1, [2.2, 0.05]);
        slab(TF, 0, 0, bt / 2, CW, CH, bt, 4, 0.6, board(lining, leather));                                   // back cover, inner face up
        const ths = (90 + 90 * t) * D, thc = 180 * t * D; const A = [-CW / 2, bt / 2]; const sx = Math.cos(ths), sz = Math.sin(ths); const Bp = [A[0] + S * sx, A[1] + S * sz];
        const hinge = (cx, cz, ex, ez) => ({ o: pt(TF, cx, 0, cz), x: dir(TF, [ex, 0, ez]), y: dir(TF, [0, 1, 0]), z: dir(TF, [-ez, 0, ex]) });
        slab(hinge(A[0] + S / 2 * sx, A[1] + S / 2 * sz, sx, sz), 0, 0, 0, S, CH, bt, 2, 0.6, board({ kind: 0, tex: E.tex("bspine"), p: [0.5, 0, 0, 0] }, lining));
        const cx2 = Math.cos(thc), cz2 = Math.sin(thc); const cf = hinge(Bp[0] + CW / 2 * cx2, Bp[1] + CW / 2 * cz2, cx2, cz2);
        slab(cf, 0, 0, 0, CW, CH, bt, 4, 0.6, board({ kind: 0, tex: E.tex("bcover"), p: [0.5, 0, 0, 0] }, lining));
        const rk = "ring"; E.mesh(rk, () => Mock3D.ringMesh(12, 1.1, 0, 360));
        for (const yy of [-PH * 0.33, 0, PH * 0.33]) item(rk, "all", { o: pt(TF, -CW / 2 + 12, yy, bt + 10.5), x: dir(TF, [1, 0, 0]), y: dir(TF, [0, 0, 1]), z: dir(TF, [0, -1, 0]) }, metal(STEEL, 0.9));
        const sheets = clampN(Math.round(o.sheets || 2), 1, 3); const pg = t > 0.985 ? clampN(E.anim && E.anim.page !== undefined ? E.anim.page : 0, 0, sheets) : 0; const K = Math.min(sheets, Math.floor(pg + 1e-6)), fr = pg - K;
        const xr = -CW / 2 + 11, z0 = bt + 0.9, ox = PW / 2 - 1; const film = { ...glass(0.025, 0.85, 0.9, 0.13), rad: 2, cast: 0 }, sheetMat = { ...solid([0.06, 0.065, 0.075], 0.1), rad: 4 };
        for (let k = sheets - 1; k >= 0; k--) {
          const a = k < K ? 1 : k === K ? fr : 0, e = eio(a), phi = Math.PI * e; const zr = z0 + (sheets - 1 - k) * 1.3, zl = z0 + k * 1.3 + 0.3; const SF = hinge(xr, zr + (zl - zr) * e, Math.cos(phi), Math.sin(phi));
          quad(SF, ox, 0, 0, PW, PH, sheetMat); const showF = (k === K && a < 1) || (k === K + 1 && fr > 0), showB = k === K - 1 || (k === K && fr > 0), nearF = k >= K - 1 && k <= K + 1, nearB = k >= K - 2 && k <= K;
          if (showF) for (const hy of [-PH * 0.33, 0, PH * 0.33]) quad(SF, ox - PW / 2 + 9, hy, 0.15, 6.5, 6.5, { ...solid(inner, 0), rad: 3.25, layer: 3 });
          for (let r = 0; r < gr; r++) for (let c = 0; c < gc; c++) {
            const px = cc => ox - PW / 2 + mL + g + pw / 2 + cc * (pw + g), cy = PH / 2 - g - ph / 2 - r * (ph + g);
            if (showF) { card(SF, px(c), cy - 0.5, 0.5, k * 2 * NP + r * gc + c); quad(SF, px(c), cy, 1.05, pw, ph, film); }
            else if (nearF) { const wf = frame(SF, px(c), cy - 0.5, 0.5); slots[k * 2 * NP + r * gc + c] = { c: wf.o, r: wf.x, u: wf.y, n: wf.z, warm: true }; }   // not drawn: only its image is prepared
            if (showB) { card(flipF(frame(SF, px(gc - 1 - c), cy - 0.5, -0.5)), 0, 0, 0, k * 2 * NP + NP + r * gc + c); quad(flipF(frame(SF, px(gc - 1 - c), cy, -1.05)), 0, 0, 0, pw, ph, film); }
            else if (nearB) { const wf = flipF(frame(SF, px(gc - 1 - c), cy - 0.5, -0.5)); slots[k * 2 * NP + NP + r * gc + c] = { c: wf.o, r: wf.x, u: wf.y, n: wf.z, warm: true }; }
          }
        }
        contact(TF.o[0], 0, CW, CH, 0, 0.5, 3);
        ext = [CW + (CW + S) * t + 50, (CH + 60) * 0.9 + S * (1 - t)]; target = [0, 10 + S * 0.3 * (1 - t), 8]; cam = { yaw: 0, pitch: 52 };
        caption = t < 0.5 ? "Classeur à anneaux, fermé" : `Classeur à anneaux · ${sheets} feuillet${sheets > 1 ? "s" : ""} de ${2 * NP} pochettes · double page ${K + 1} / ${sheets + 1}`;
      } else if (id === "sleeve" || id === "toploader" || id === "semi") {
        const [TW, TH, TD] = holderDims(id); floor(0, 320); const fx = v => String(+v.toFixed(1)).replace(".", ",");
        holder(frame(ROOT, 0, TH / 2 + 0.3, 0, 0, -5, 0), 0, 0, 0, id, 0); contact(0, 0, TW, TD + 1.5, 0, 0.42, 1.8); ext = [TW * 1.7, TH * 1.45]; target = [0, TH * 0.5, 0];
        caption = id === "sleeve" ? `Pochette souple · ${fx(TW)} × ${fx(TH)} mm` : id === "semi" ? `Étui semi-rigide · ${fx(TW)} × ${fx(TH)} mm · envoi en gradation` : `Toploader rigide · ${fx(TW)} × ${fx(TH)} mm`;
      } else if (id === "onetouch") {
        const OW = W + 10, OH = H + 21.5, OD = 8.2; floor(0, 300);
        oneTouch(frame(ROOT, 0, OH / 2 + 0.2, 0, 0, -4, 0), 0, 0, 0, 0); contact(0, 0, OW * 0.98, OD + 2, 0, 0.5); ext = [OW * 1.7, OH * 1.45]; target = [0, OH * 0.5, 0]; cam = { yaw: -22, pitch: 8 };
        caption = `Boîtier magnétique · ${Math.round(OW)} × ${Math.round(OH)} × 8,2 mm · logement ${Math.round(W + 0.6)} × ${Math.round(H + 1.2)} mm`;
      } else if (id === "stand") {
        const top = o.inside === "toploader"; const [OW, OH, OD] = top ? holderDims("toploader") : [W + 10, H + 21.5, 8.2]; const model = o.model || "easel"; floor(0, 340); const ac = acryl(); let name = "";
        /* the holder leans back by a degrees, its bottom edge centred at height y0 and depth z0 */
        const put = (y0, z0, a) => { const HF = frame(ROOT, 0, y0 + (OH / 2) * Math.cos(a * D), z0 - (OH / 2) * Math.sin(a * D), 0, -a, 0); if (top) holder(HF, 0, 0, 0, "toploader", 0); else oneTouch(HF, 0, 0, 0, 0); return HF; };
        if (model === "block") {
          const bw = OW + 26, bd = 36, bh = 16; slab(frame(ROOT, 0, bh / 2, 0, 0, -90, 0), 0, 0, 0, bw, bd, bh, 4, 1.1, ac); quad(frame(ROOT, 0, bh + 0.06, 1.4, 0, -90, 0), 0, 0, 0, OW + 1.6, OD + 1.4, { ...glass(0.04, 0.5, 0.7, 0.42), rad: 1, cast: 0 });
          put(bh - 9, 2.4, 8); contact(0, 0, bw, bd, 0, 0.45); name = "Socle en acrylique à rainure";
        } else if (model === "wood") {
          const wd = { all: woodM([0.66, 0.47, 0.28], 0.22, 0.36, true) }, bw = OW + 16; slab(frame(ROOT, 0, 2, -3, 0, -90, 0), 0, 0, 0, bw, 50, 4, 2.5, 0.6, wd); slab(frame(ROOT, 0, 12, -18, 0, -90, 0), 0, 0, 0, bw, 22, 16, 2.5, 1, wd); slab(frame(ROOT, 0, 8.5, 13.5, 0, -90, 0), 0, 0, 0, bw, 13, 9, 2.5, 1, wd);
          put(4.2, 7 - OD / 2 - 0.4 + 1, 12); contact(0, -3, bw, 50, 0, 0.5); name = "Chevalet en bois";
        } else if (model === "wire") {
          const a = 15, mt = metal(o.metal === "gold" ? GOLD : o.metal === "black" ? [0.07, 0.07, 0.08] : STEEL, o.metal === "black" ? 0.6 : 0.88), dia = 2.6, yA = OH * 0.8, zf = 12, ta = Math.tan(a * D), zA = zf - yA * ta, fx = OW * 0.4, lx = h => fx - (fx - 3) * (h / yA);
          for (const s of [1, -1]) { rod([s * fx, 0, zf], [s * 3, yA, zA], dia, mt); rod([s * fx * 0.82, 5, zf - 5 * ta], [s * fx * 0.82, 5, zf + 14], dia, mt); rod([s * fx * 0.82, 5, zf + 14], [s * fx * 0.82, 12, zf + 15.5], dia, mt); contact(s * fx, zf, 7, 7, 0, 0.3, 1.2); }
          rod([-lx(5), 5, zf - 5 * ta], [lx(5), 5, zf - 5 * ta], dia, mt); rod([-lx(yA * 0.55), yA * 0.55, zf - yA * 0.55 * ta], [lx(yA * 0.55), yA * 0.55, zf - yA * 0.55 * ta], dia, mt); rod([-4.5, yA, zA], [4.5, yA, zA], dia + 1, mt);
          const zr = zA - OH * 0.38; rod([0, yA, zA], [0, 0, zr], dia, mt); contact(0, zr, 7, 7, 0, 0.3, 1.2);
          put(5 + dia / 2 + 0.1, zf + (dia / 2 + OD / 2 + 0.3) / Math.cos(a * D) - (5 + dia / 2) * ta, a); name = "Chevalet trépied en métal";
        } else if (model === "led") {
          const bw = OW + 22, bd = 40, bh = 13, led = HEX(o.led || "#ffffff"); slab(frame(ROOT, 0, bh / 2, 0, 0, -90, 0), 0, 0, 0, bw, bd, bh, 4, 1, { all: solid([0.04, 0.04, 0.05], 0.5) });
          quad(frame(ROOT, 0, bh + 0.06, 2, 0, -90, 0), 0, 0, 0, OW + 2, OD + 2.6, { kind: 10, color: [led[0], led[1], led[2], 1], p: [1.5, 0, 0, 0], clip: 0, cast: 0, layer: 3 });
          const HF = put(bh - 1.5, 2, 6); for (const s of [1, -1]) quad(s > 0 ? frame(HF, 0, 0, OD / 2 + 0.5) : flipF(frame(HF, 0, 0, -OD / 2 - 0.5)), 0, -OH * 0.2, 0, OW, OH * 0.6, { kind: 10, layer: 4, color: [led[0], led[1], led[2], 1], p: [0.42, 2.2, 1, 0], clip: 0, cast: 0 });
          const lg = [0.2 + led[0] * 0.5, 0.2 + led[1] * 0.5, 0.2 + led[2] * 0.5]; for (const it of Q) if (it.layer >= 2 && it.kind !== 3 && it.kind !== 5) it.glow = lg; contact(0, 0, bw, bd, 0, 0.5); name = "Socle lumineux à LED";
        } else {
          /* folded acrylic easel: base plate, front ledge, back rest parallel to the holder */
          const a = 16, bw = OW + 16, bd = 64; slab(frame(ROOT, 0, 1.5, -10, 0, -90, 0), 0, 0, 0, bw, bd, 3, 5, 0.6, ac); slab(ROOT, 0, 3 + 5, 20.5, bw, 10, 3, 1.4, 0.6, ac);
          const HF = put(3.2, 18.6 - OD / 2 - 0.3, a); slab(HF, 0, -OH * 0.14, -OD / 2 - 1.8, OW * 0.66, OH * 0.72, 3, 5, 0.6, ac); contact(0, -10, bw, bd, 0, 0.45); name = "Chevalet en acrylique plié";
        }
        ext = [OW * 1.9, OH * 1.45]; target = [0, OH * 0.5, 0]; cam = { yaw: -24, pitch: 10 }; caption = `${name} · ${top ? "toploader" : "boîtier magnétique"}`;
      } else if (id === "slab") {
        const [SW, SH, SD, , name] = slabDims(o, W, H); const st = o.stand === true ? "acryl" : (o.stand || ""); floor(0, 340); let lean = -3, by = 0;
        if (st === "acryl") { lean = -12; by = 4; const ac = acryl(0.08); slab(frame(ROOT, 0, 6, -5, 0, -90, 0), 0, 0, 0, 90, 36, 12, 3, 0.8, ac); contact(0, -5, 90, 36, 0, 0.45); }
        else if (st === "wood") { lean = -12; by = 4; const wd = { all: woodM([0.66, 0.47, 0.28], 0.22, 0.36, true) }; slab(frame(ROOT, 0, 2, -3, 0, -90, 0), 0, 0, 0, 90, 48, 4, 2.5, 0.6, wd); slab(frame(ROOT, 0, 4 + 8, -17, 0, -90, 0), 0, 0, 0, 90, 20, 16, 2.5, 1, wd); slab(frame(ROOT, 0, 4 + 4.5, 12.5, 0, -90, 0), 0, 0, 0, 90, 13, 9, 2.5, 1, wd); contact(0, -3, 90, 48, 0, 0.5); }
        const [, , , gy] = graded(ROOT, 0, by, 0, 0, o, lean, o.guard || ""); if (!st) contact(0, 0, SW * 0.98, SD + (o.guard ? 2 : 0), 0, 0.5);
        const fx = v => String(+v.toFixed(2)).replace(".", ","); ext = [Math.max(SW, st ? 96 : SW) * 1.6, (SH + gy * 2) * 1.3]; target = [0, SH * 0.5, 0];
        caption = `Slab ${name} · ${fx(SW)} × ${fx(SH)} × ${fx(SD)} mm` + (o.guard === "bumper" ? " · bumper silicone" + ((o.gfinish || "").indexOf("glit") >= 0 ? " pailleté" : "") + ((o.gfinish || "").indexOf("grad") >= 0 ? " dégradé" : "") : o.guard === "metal" ? " · cadre métallique magnétique" : o.guard === "sleeve" ? " · pochette souple" : "") + (st === "wood" ? " · chevalet en bois" : st === "acryl" ? " · support transparent" : ""); const tot = SD + (o.guard === "bumper" ? 1.8 : o.guard === "metal" ? 2.2 : o.guard === "sleeve" ? 0.9 : 0); if (st && tot > 9.5) caption += ` · rainure de 10 mm trop étroite : prévoir ${fx(Math.ceil(tot + 1))} mm`;
      } else if (id === "riser") {
        const [SW, SH, , , name] = slabDims(o, W, H); const TW = 3 * (SW + 12) + 10, dp = 38; floor(0, 520);
        for (let k = 0; k < 2; k++) { const hk = 16 + k * 74; slab(frame(ROOT, 0, hk / 2, -k * dp, 0, -90, 0), 0, 0, 0, TW, dp, hk, 2.5, 0.8, { front: glass(0.035, 1, 1.4, 0.26), back: glass(0.035, 1, 0, 0), side: acrylEdge(0.12) }); for (let i = 0; i < 3; i++) graded(ROOT, (i - 1) * (SW + 12), hk, -k * dp + 2, k * 3 + i, o, -7); }
        contact(0, -dp / 2, TW, dp * 2, 0, 0.45, 3); ext = [TW * 1.2, (SH + 96) * 1.2]; target = [0, (SH + 90) * 0.47, -dp / 2]; cam = { yaw: -18, pitch: 12 };
        caption = `Présentoir à gradins · 6 slabs format ${name}`;
      } else if (id === "wall9") {
        const [SW, SH, SD, , name] = slabDims(o, W, H); const gp = 9, bar = 16, dep = 24; const IW = 3 * SW + 4 * gp, IH = 3 * SH + 4 * gp, FW = IW + 2 * bar, FH = IH + 2 * bar; const fc = HEX(o.frame || "#16161a"); const wood = /^#(8a5a33|b98d5b)$/i.test(o.frame || ""); const G = frame(ROOT, 0, FH / 2, 0, 0, -4, 0); floor(-1, 820);
        ring(G, 0, 0, 0, FW, FH, dep, 2, bar, 0.5, (wood ? woodM(fc, 0.3, 0.36) : solid(fc, 0.35)));
        quad(G, 0, 0, -dep / 2 + 3, IW + 1, IH + 1, solid(HEX(o.mat || "#15161a"), 0.03, 1, [2.6, 0.07])); quad(flipF(frame(G, 0, 0, -dep / 2 + 0.5)), 0, 0, 0, IW + 1, IH + 1, solid([0.2, 0.17, 0.14], 0.02, 1, [0.6, 0.25]));
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) graded(frame(G, (c - 1) * (SW + gp), (1 - r) * (SH + gp) - SH / 2, -dep / 2 + 3.6 + SD / 2), 0, 0, 0, r * 3 + c, o, 0);
        contact(0, -8, FW, dep, 0, 0.5, 3); ext = [FW * 1.25, FH * 1.18]; target = [0, FH / 2, 0]; cam = { yaw: -20, pitch: 6 };
        caption = `Cadre mural 3 × 3 · ${Math.round(FW)} × ${Math.round(FH)} mm · 9 slabs format ${name}`;
      } else if (id === "led14") {
        const [SW, SH, SD, , name] = slabDims(o, W, H); const gp = 7, bar = 12, dep = 46, rowH = SH + 24; const IW = 7 * SW + 8 * gp, IH = 2 * rowH + 6, FW = IW + 2 * bar, FH = IH + 2 * bar; const G = frame(ROOT, 0, FH / 2, 0); floor(-1, 980); const led = HEX(o.led || "#ffffff");
        ring(G, 0, 0, 0, FW, FH, dep, 3, bar, 1, solid([0.035, 0.035, 0.04], 0.45));
        quad(G, 0, 0, -dep / 2 + 2, IW + 1, IH + 1, solid([0.075, 0.077, 0.088], 0.05)); quad(flipF(frame(G, 0, 0, -dep / 2 + 0.5)), 0, 0, 0, IW + 1, IH + 1, solid([0.05, 0.05, 0.055], 0.05));
        for (let r = 0; r < 2; r++) {
          const y0 = IH / 2 - 3 - r * (rowH + 3);
          quad(frame(G, 0, y0 - rowH, -1, 0, -90, 0), 0, 0, 0, IW, dep - 6, solid([0.06, 0.06, 0.07], 0.35));
          const strip = { kind: 10, color: [led[0], led[1], led[2], 1], p: [1.8, 0, 0, 0], clip: 0, cast: 0 }; const wash = (pw, k, flip) => ({ kind: 10, layer: 4, color: [led[0], led[1], led[2], 1], p: [pw, k, flip ? 1 : 0, 0], clip: 0, cast: 0 });
          slab(G, 0, y0 - 2.2, dep / 2 - 8, IW - 2, 4.4, 5, 1, 0, { all: solid([0.05, 0.05, 0.06], 0.4) });
          quad(G, 0, y0 - 3.4, dep / 2 - 5.45, IW - 8, 1.5, strip); quad(frame(G, 0, y0 - 4.45, dep / 2 - 8, 0, 90, 0), 0, 0, 0, IW - 8, 3.4, strip);
          quad(G, 0, y0 - rowH / 2, -dep / 2 + 2.3, IW, rowH, wash(0.5, 1.3)); quad(G, 0, y0 - rowH * 0.31, dep / 2 - 12, IW, rowH * 0.62, wash(0.1, 2.2));
          quad(frame(G, 0, y0 - rowH + 0.3, -1, 0, -90, 0), 0, 0, 0, IW, dep - 8, wash(0.16, 0.6));
          for (let c = 0; c < 7; c++) graded(frame(G, (c - 3) * (SW + gp), y0 - rowH + 0.4, -3), 0, 0, 0, r * 7 + c, o, -4);
        }
        quad(G, 0, 0, dep / 2 - 1.5, IW, IH, { ...glass(0.012, 0.9), cast: 0 }); contact(0, 0, FW, dep, 0, 0.5, 3);
        const lg = [0.25 + led[0] * 0.6, 0.25 + led[1] * 0.6, 0.25 + led[2] * 0.6]; for (const it of Q) if ((it.layer === undefined || it.layer >= 2) && it.kind !== 3 && it.kind !== 5) it.glow = lg;
        ext = [FW * 1.12, FH * 1.25]; target = [0, FH / 2, 0]; cam = { yaw: -16, pitch: 5 }; caption = `Vitrine LED · ${Math.round(FW)} × ${Math.round(FH)} × ${dep} mm · 14 slabs format ${name}`;
      } else if (id === "acryl1" || id === "acryl3") {
        const tri = id === "acryl3", px = W + 18; const BW = tri ? 3 * W + 4 * 18 : W + 46, BH = H + (tri ? 52 : 56), BD = clampN(o.thick || 20, 10, 40); const lit = o.led ? HEX(o.led) : null, bh2 = lit ? 15 : 0; floor(-BH / 2 - bh2, tri ? 460 : 340);
        const bf = slab(ROOT, 0, 0, 0, BW, BH, BD, 1.5, 0.9, { front: glass(0.045, 1, 2.6, 0.58, 0, [0.9, 0.96, 1]), back: glass(0.045, 1, 2.6, 0.58, 0, [0.9, 0.96, 1]), side: lit ? glass(0.42, 1, 0, 0, 0.35, [0.45 + lit[0] * 0.55, 0.45 + lit[1] * 0.55, 0.45 + lit[2] * 0.55]) : acrylEdge(0.3) });
        for (const s of [1, -1]) quad(s > 0 ? frame(bf, 0, 0, BD / 2 + 0.06) : flipF(frame(bf, 0, 0, -BD / 2 - 0.06)), 0, 0, 0, BW - 5, BH - 5, { ...glass(0, 0.6, 0.6, 0.3), rad: 0.8, cast: 0 });
        if (lit) { slab(frame(ROOT, 0, -BH / 2 - bh2 / 2, 0, 0, -90, 0), 0, 0, 0, BW + 12, BD + 20, bh2, 3, 1, { all: solid([0.04, 0.04, 0.05], 0.5) }); quad(frame(ROOT, 0, -BH / 2 + 0.25, 0, 0, -90, 0), 0, 0, 0, BW - 3, BD - 3, { kind: 10, color: [lit[0], lit[1], lit[2], 1], p: [1.6, 0, 0, 0], clip: 0, cast: 0, layer: 3 }); for (const s of [1, -1]) quad(s > 0 ? frame(bf, 0, 0, BD / 2 + 0.3) : flipF(frame(bf, 0, 0, -BD / 2 - 0.3)), 0, -BH * 0.19, 0, BW, BH * 0.62, { kind: 10, layer: 4, color: [lit[0], lit[1], lit[2], 1], p: [0.5, 2.2, 1, 0], clip: 0, cast: 0 }); quad(bf, 0, -BH / 2 + 1.2, BD / 2 + 0.35, BW - 2, 2.4, { kind: 10, layer: 4, color: [lit[0], lit[1], lit[2], 1], p: [1.5, 0, 0, 0], clip: 0, cast: 0 }); }
        box(bf, 0, 0, 0, BW + 0.3, BH + 0.3, 0.9, n => (n === "front" || n === "back") ? null : { ...solid([1, 1, 1], 0.2, 0.36), cast: 0 });
        (tri ? [-px, 0, px] : [0]).forEach((cx, i) => { quad(bf, cx, 0, 0, W + 5, H + 5, { ...solid([1, 1, 1], 0, 0.14), layer: 3, rad: R + 1.5, cast: 0 }); card(bf, cx, 0, 0, i); });
        const sx = BW / 2 - 9, sy = BH / 2 - 9; for (const [x, y] of (tri ? [[-sx, sy], [0, sy], [sx, sy], [-sx, -sy], [0, -sy], [sx, -sy]] : [[-sx, sy], [sx, sy], [-sx, -sy], [sx, -sy]])) {
          cyl(bf, x, y, 0, 3, BD - 0.4, metal(STEEL, 0.85)); for (const s of [1, -1]) { cyl(bf, x, y, s * (BD / 2 + 0.55), 9, 1.5, metal(STEEL, 0.92)); const hf = s > 0 ? frame(bf, x, y, BD / 2 + 1.34) : flipF(frame(bf, x, y, -BD / 2 - 1.34)); quad(hf, 0, 0, 0, 9, 9, { kind: 4, layer: 3, color: [STEEL[0], STEEL[1], STEEL[2], 1], cull: true }); }
        }
        contact(0, 0, BW + (lit ? 12 : 0), BD + (lit ? 20 : 0), 0, 0.5); ext = tri ? [BW * 1.22, BH * 1.5] : [BW * 1.5, BH * 1.3]; target = [0, -bh2 / 2, 0]; cam = { yaw: tri ? -20 : -24, pitch: 8 };
        caption = tri ? `Bloc acrylique triple · ${BW} × ${BH} × ${BD} mm · 6 vis inox` : `Bloc acrylique · ${BW} × ${BH} × ${BD} mm · 4 vis inox`; if (lit) { caption += " · socle lumineux"; const lg = [0.2 + lit[0] * 0.5, 0.2 + lit[1] * 0.5, 0.2 + lit[2] * 0.5]; for (const it of Q) if ((it.layer === undefined || it.layer >= 2) && it.kind !== 3 && it.kind !== 5) it.glow = lg; }
      } else if (id === "frame1" || id === "frame3") {
        /* picture frame: a moulding with a real profile (outer rail, cove, inner lip), fillet, glass behind the rabbet, bevel-cut mat, kraft back with its hanger */
        const tri = id === "frame3"; const prof = o.profile || "step"; const bar = prof === "float" ? 9 : prof === "wide" ? 23 : 15, dep = tri ? 34 : prof === "float" ? 32 : 26;
        const fc = HEX(o.frame || "#16161a"), mc = HEX(o.mat || (tri ? "#2b2f36" : "#ece7dc")); const wood = /^#(8a5a33|b98d5b|6b2f1f)$/i.test(o.frame || ""), gilt = /^#(c9a24a|b9bec7)$/i.test(o.frame || "");
        const holdW = W + 10, holdH = H + 21.5; const sz = o.size === "s" ? 0 : o.size === "l" ? 2 : 1; const gapT = [10, 16, 28][sz], padT = [16, 24, 42][sz]; const IW = tri ? 3 * holdW + 4 * gapT : W + [44, 78, 126][sz], IH = tri ? holdH + 2 * padT : H + [54, 92, 150][sz];
        const FW = IW + 2 * bar, FH = IH + 2 * bar; const G = frame(ROOT, 0, 0, 0, 0, -5, 0); floor(-FH / 2 - 1, tri ? 560 : 380);
        const tone = k => [fc[0] * k, fc[1] * k, fc[2] * k], mat = k => gilt ? metal([fc[0] * 0.85 * k + 0.08, fc[1] * 0.85 * k + 0.08, fc[2] * 0.85 * k + 0.08], 0.72) : (wood ? woodM(tone(k), 0.3, 0.36) : solid(tone(k), 0.35));
        let lipZ = dep / 2;                                                     // front of the innermost part of the moulding
        if (prof === "flat") ring(G, 0, 0, 0, FW, FH, dep, 1, bar, 0.4, mat(1));
        else if (prof === "float") { ring(G, 0, 0, 0, FW, FH, dep, 1, bar * 0.5, 0.4, mat(1)); ring(G, 0, 0, -dep / 2 + 3, FW - bar + 0.4, FH - bar + 0.4, 6, 0.6, bar * 0.5 + 0.2, 0.3, solid([0.03, 0.03, 0.035], 0.04)); lipZ = -dep / 2 + 6; }
        else if (tri) { ring(G, 0, 0, 0, FW, FH, dep, 1.2, bar * 0.5, 0.5, mat(1)); ring(G, 0, 0, -1.8, FW - bar + 0.3, FH - bar + 0.3, dep - 3.6, 0.6, bar * 0.5 + 0.15, 0.4, mat(0.74)); lipZ = dep / 2 - 3.6; }
        else { ring(G, 0, 0, 0, FW, FH, dep, 1.2, bar * 0.42, 0.5, mat(1)); ring(G, 0, 0, -2.2, FW - bar * 0.84 + 0.3, FH - bar * 0.84 + 0.3, dep - 4.4, 0.6, bar * 0.36 + 0.15, 0.4, mat(0.72)); ring(G, 0, 0, -4.2, FW - bar * 1.56 + 0.3, FH - bar * 1.56 + 0.3, dep - 8.4, 0.5, bar * 0.22 + 0.15, 0.3, mat(1.05)); lipZ = dep / 2 - 8.4; }
        if (o.fillet && prof !== "float") ring(G, 0, 0, lipZ + 0.5, IW + 4.6, IH + 4.6, 1.4, 0.5, 2.3, 0.3, metal(o.fillet === "silver" ? STEEL : GOLD, 0.88));
        const BF = flipF(frame(G, 0, 0, -dep / 2 + 1)); quad(BF, 0, 0, 0, IW, IH, solid([0.52, 0.42, 0.3], 0.02, 1, [0.7, 0.22])); slab(flipF(frame(G, 0, FH / 2 - bar - 9, -dep / 2 + 0.4)), 0, 0, 0, 42, 7, 1, 1, 0.2, { all: metal(STEEL, 0.7) });
        const mz = prof === "float" ? -dep / 2 + 7 : tri ? dep / 2 - 17 : dep / 2 - 10;
        if (tri) {
          quad(G, 0, 0, mz, IW, IH, solid(mc, 0.03, 1, [2.6, 0.07]));
          for (let i = 0; i < 3; i++) { const x = (i - 1) * (holdW + gapT); quad(G, x + 1.2, -1.6, mz + 0.2, holdW + 4, holdH + 4, { kind: 3, layer: 3, rad: 8, color: [0, 0, 0, 0.5], p: [5, 0, 0, 0] }); oneTouch(G, x, 0, mz + 4.6, i); }
        } else {
          const ww = W + 8, wh = H + 8; quad(G, 0, 0, mz, IW, IH, { kind: 8, color: [mc[0], mc[1], mc[2], 1], p: [0.03, 2.6, 0.07, 1.6], uv: [ww / 2, wh / 2, R + 1.5, 0] });
          ring(G, 0, 0, mz + 0.05, ww + 3.2, wh + 3.2, 0.5, R + 3.1, 1.6, R + 1.5, solid([0.97, 0.96, 0.93], 0.04));       // the white core of the board shows on the bevel cut
          if (o.mat2) { const m2 = HEX(o.mat2); quad(G, 0, 0, mz - 0.7, ww + 6, wh + 6, { kind: 8, color: [m2[0], m2[1], m2[2], 1], p: [0.03, 2.6, 0.07, 1.6], uv: [(W + 2.4) / 2, (H + 2.4) / 2, R + 0.6, 0] }); }
          quad(G, 0, 0, mz - 2.4, ww + 6, wh + 6, solid([mc[0] * 0.55, mc[1] * 0.55, mc[2] * 0.55], 0.02)); quad(G, 0.8, -1.2, mz - 2.2, W + 2, H + 2, { kind: 3, layer: 3, rad: R + 3, color: [0, 0, 0, 0.45], p: [3, 0, 0, 0] }); card(G, 0, 0, mz - 1.8, 0);
          if (o.plate && (IH - wh) / 2 >= 20) slab(G, 0, -wh / 2 - (IH - wh) / 4 - 1, mz + 0.5, 38, 9.5, 0.9, 1.2, 0.25, { front: { kind: 0, tex: E.tex("plate"), p: [0.9, 0, 0, 0] }, side: metal(GOLD, 0.8) });
        }
        const gz = prof === "flat" ? dep / 2 - 2.5 : prof === "float" ? mz + 9 : tri ? lipZ - 1.4 : mz + 1.3;
        if (o.glass !== "none" && prof !== "float") quad(G, 0, 0, gz, IW, IH, { ...(o.glass === "matte" ? glass(0.03, 0.22, 0, 0, 0.035) : glass(0.015, 0.9)), cast: 0 });
        contact(0, -FH * 0.044, FW, dep, 0, 0.5); ext = [FW * 1.22, FH * (tri ? 1.6 : 1.25)]; cam = { yaw: tri ? -22 : -18, pitch: 6 };
        const pn = prof === "flat" ? "moulure plate" : prof === "float" ? "caisse américaine" : prof === "wide" ? "moulure large à gorge" : "moulure à gorge";
        caption = (tri ? `Cadre triptyque · ${Math.round(FW)} × ${Math.round(FH)} × ${dep} mm · 3 boîtiers magnétiques` : `Carte encadrée · ${Math.round(FW)} × ${Math.round(FH)} × ${dep} mm · passe-partout biseauté${o.mat2 ? " double" : ""}`) + " · " + pn;
      } else if (id === "booster" || id === "blister") {
        const PW = E.pack.w, PH = E.pack.h, cr = E.pack.crimp; const bl = id === "blister"; const G = frame(ROOT, 0, 0, 0, 0, -6, 0);
        if (bl) {
          const BKW = PW + 36, BKH = PH + 70; floor(-BKH / 2 - 3, 380); slab(G, 0, 0, -0.4, BKW, BKH, 0.8, 4, 0, { front: { kind: 0, tex: E.tex("blister"), p: [0.5, 0, 0, 0] }, back: solid([0.78, 0.76, 0.72], 0.05, 1, [1.6, 0.08]), side: solid([0.85, 0.83, 0.8], 0.05) });
          slab(G, 0, -16, 4.3, PW + 12, PH + 12, 8.6, 7, 2.6, { front: glass(0.04, 1, 2.2, 0.16), side: glass(0.1, 1) }); scenePack = pillow(G, 0, -16, 3.4, PW, PH, 5.2, cr, false, E.tex("packf"), E.tex("packb"));
          ext = [BKW * 1.7, BKH * 1.3]; caption = `Blister · carton ${BKW} × ${BKH} mm avec booster sous coque`;
        } else {
          const t = clampN(E.anim && E.anim.open !== undefined ? E.anim.open : (o.open ? 1 : 0), 0, 1), isOpen = t > 0.012; const fy = -PH / 2 - 4; const mx = (a, b, k) => a + (b - a) * k; const sm = v => { const k = clampN(v, 0, 1); return k * k * (3 - 2 * k); };
          floor(fy, 340); scenePack = pillow(G, 0, 0, 0, PW, PH, 8, cr, isOpen, E.tex("packf"), E.tex("packb"));
          if (isOpen) {
            const e = sm(t / 0.45), p0 = pt(G, 0, PH / 2 - cr / 2, 0.3), p1 = [PW * 0.84, fy + 0.7, 20]; const sf = frame(ROOT, mx(p0[0], p1[0], e), mx(p0[1], p1[1], e) + Math.sin(e * Math.PI) * 30, mx(p0[2], p1[2], e), mx(0, -28, e), mx(-6, -90, e), mx(0, 10, e) * Math.sin(e * Math.PI));
            for (const s of [1, -1]) quad(s > 0 ? frame(sf, 0, 0, 0.2) : flipF(frame(sf, 0, 0, -0.2)), 0, 0, 0, PW, cr, { kind: 0, tex: E.tex(s > 0 ? "packf" : "packb"), uv: [0, cr / PH, 1, -cr / PH], p: [1, 0, 0, 0], cull: true, clip: 0 });
            if (e > 0.98) contact(p1[0], p1[2], PW, cr, -28, 0.25, 1.4);
            for (let i = 0; i < 3; i++) { const eb = eout(clampN((t - 0.28 - i * 0.07) / 0.58, 0, 1)); card(frame(G, (i - 1) * 3.5 * eb, PH / 2 - cr - H / 2 + mx(-9 - i * 1.5, 34 + (2 - i) * 6, eb), (i - 1) * 0.7, 0, 0, -(i - 1) * 5 * eb), 0, 0, 0, i); }
          }
          ext = [PW * (1.8 + 0.5 * t), (PH + 50 * t) * 1.35]; target = [PW * 0.16 * t, 18 * t, 0]; caption = `Booster ${t > 0.5 ? "ouvert" : "scellé"} · ${PW} × ${PH} mm · ${E.pack.cards} cartes`;
        }
        cam = { yaw: -22, pitch: 7 };
      } else if (id === "display") {
        const PW = E.pack.w, PH = E.pack.h; const { N, cols, rows, step, TW: TWd, TD, hf, hb } = displayDims(E.pack); const hd = TD; const colr = HEX(E.pack.color); const dark = [colr[0] * 0.5, colr[1] * 0.5, colr[2] * 0.5]; floor(0, 600);
        const t = clampN(E.anim && E.anim.open !== undefined ? E.anim.open : (o.closed ? 0 : 1), 0, 1), e = eio(t); const mx = (a, b, k) => a + (b - a) * k;
        const withCards = o.cards !== "0" && !o.closed; const G = frame(ROOT, 0, 0, withCards ? -36 * e : 0); const inner = solid(dark, 0.05), outer = solid(colr, 0.25, 1, [1.2, 0.05]); const art = (k, uv) => ({ kind: 0, tex: E.tex(k), p: [0.6, 0, 0, 0], ...(uv ? { uv } : {}) });
        slab(frame(G, 0, 0.5, 0, 0, -90, 0), 0, 0, 0, TWd, TD, 1, 1, 0, { front: inner, back: outer, side: outer }); slab(G, 0, hb / 2, -TD / 2, TWd, hb, 1, 1, 0, { front: inner, back: outer, side: outer });
        /* front: the low lip stays, the part above it folds away when the display opens */
        const fo = frame(G, 0, 0, TD / 2 + 0.5), fi = flipF(frame(G, 0, 0, TD / 2 - 0.5)); quad(fo, 0, hf / 2, 0, TWd, hf, art("boxfront", [0, 1, 1, -hf / hb])); quad(fi, 0, hf / 2, 0, TWd, hf, inner);
        const hu = (hb - hf) * (1 - e); if (hu > 0.4) { quad(fo, 0, hf + hu / 2, 0, TWd, hu, art("boxfront", [0, 1 - hf / hb, 1, -hu / hb])); quad(fi, 0, hf + hu / 2, 0, TWd, hu, inner); }
        const fh = Math.round(mx(hb, hf, e));
        poly({ o: pt(G, TWd / 2, 0, 0), x: mul(G.z, -1), y: G.y, z: G.x }, [[-TD / 2, 0], [TD / 2, 0], [TD / 2, hb], [-TD / 2, fh]], 1, { front: art("boxs"), back: inner, side: outer });
        poly({ o: pt(G, -TWd / 2, 0, 0), x: G.z, y: G.y, z: mul(G.x, -1) }, [[-TD / 2, 0], [TD / 2, 0], [TD / 2, fh], [-TD / 2, hb]], 1, { front: art("boxs"), back: inner, side: outer });
        /* lid, hinged on the back wall: flat on the box when closed, standing as the header when open (its inner face carries the header art) */
        slab(frame(G, 0, hb + 0.6, -TD / 2 - 0.7 * e, 0, mx(90, -7, eback(t)), 0), 0, hd / 2, 0, TWd, hd, 1, 6, 0, { front: art("boxf"), back: art("boxtop", [1, 0, -1, 1]), side: outer });
        if (t > 0.03) for (let k = 0; k < N; k++) { const c = k % cols, r = Math.floor(k / cols); const lean = mx(30, 9, rows > 1 ? r / (rows - 1) : 1); const pf = pillow(frame(G, (c - (cols - 1) / 2) * (PW + 3), 2 + r * 0.2, TD / 2 - 12 - r * step, 0, -mx(63, lean, eio(clampN((t - 0.1) / 0.9, 0, 1))), 0), 0, PH / 2, 0, PW, PH, 5.5, E.pack.crimp, false, E.tex("packf"), E.tex("packb"), true); if (!scenePack) scenePack = pf; }
        const zc = -36 + TD / 2 + 21 + H / 2; if (withCards && t > 0.38) { const z0 = G.o[2] + TD / 2 - H / 2 - 4; [[-(W + 12.5), zc - 2, 14], [2, zc + 5, -7], [W + 14.5, zc - 3, 11]].forEach(([x, z, r], i) => { const s = eout(clampN((t - 0.38 - i * 0.05) / 0.5, 0, 1)), cx = x * s, cz = mx(z0, z, s); card(frame(ROOT, cx, T / 2 + 0.05, cz, r * s, -90, 0), 0, 0, 0, i); if (s > 0.6) contact(cx, cz, W, H, r * s, 0.3 * (s - 0.6) / 0.4, 1.6); }); }
        contact(0, G.o[2], TWd, TD, 0, 0.5, 3); const eo = withCards ? [Math.max(258, TWd * 1.8), Math.max(258, (hb + hd) * 1.6)] : [TWd * 1.4, (hb + Math.max(hd, 56)) * 1.25], to = withCards ? [0, 60, 26] : [0, (hb + hd) * 0.45, -8];
        ext = [mx(TWd * 1.75, eo[0], e), mx(hb * 3.3, eo[1], e)]; target = [0, mx(hb * 0.5, to[1], e), mx(0, to[2], e)]; cam = { yaw: -22, pitch: 22 };
        caption = `Display ${t > 0.5 ? "ouvert" : "fermé"} · ${N} boosters (${cols} × ${rows}) · ${TWd} × ${TD} × ${hb} mm`;
      } else if (id === "etb" || id === "deckbox") {
        const etb = id === "etb"; const [bw, bh, bd] = etb ? [191, 165, 89] : [72, 95, 45]; floor(0, etb ? 560 : 340); const t = clampN(E.anim && E.anim.open !== undefined ? E.anim.open : (o.open ? 1 : 0), 0, 1), e = eio(t);
        const seam = etb ? 0.2 : 0.72, hB = bh * seam, hL = bh - hB; const colr = HEX(E.pack.color), dark = [colr[0] * 0.32, colr[1] * 0.32, colr[2] * 0.32]; const fk = etb ? "boxf" : "boxdeck";
        const face = (n, v0, v1) => ({ kind: 0, tex: E.tex(n === "front" || n === "back" ? fk : "boxs"), p: [0.7, 0, 0, 0], cull: true, clip: 0, uv: [0, 1 - v0, 1, -(v1 - v0)] });
        box(ROOT, 0, hB / 2, 0, bw, hB, bd, n => n === "top" ? null : n === "bottom" ? solid(colr, 0.2) : face(n, 0, seam)); box(ROOT, 0, hB / 2 + 0.5, 0, bw - 1.4, hB - 1, bd - 1.4, n => n === "top" ? null : { ...solid(dark, 0.05), clip: 0 });
        if (etb) quad(frame(ROOT, 0, hB - 4, 0, 0, -90, 0), 0, 0, 0, bw - 1.6, bd - 1.6, solid([dark[0] * 0.7, dark[1] * 0.7, dark[2] * 0.7], 0.04));
        else { const dz = bd - 9, DF = frame(ROOT, 0, 1.4 + H / 2, 0); slab(DF, 0, 0, 0, W, H, dz, R, 0, { front: { kind: 0, tex: E.tex("s0f"), p: [1, 0, 0, 0] }, back: { kind: 0, tex: E.tex("s0b"), p: [1, 0, 0, 0] }, side: { kind: 6, color: [ec.rgb[0], ec.rgb[1], ec.rgb[2], 1], p: [ec.metal, Math.round(dz / T), ec.core, 0] } }); slots[0] = { c: pt(DF, 0, 0, dz / 2), r: DF.x, u: DF.y, n: DF.z }; }
        const lidFace = n => n === "bottom" ? null : n === "top" ? { kind: 0, tex: E.tex("boxt"), p: [0.7, 0, 0, 0], cull: true, clip: 0 } : face(n, seam, 1); const lidIn = n => n === "bottom" ? null : { ...solid(dark, 0.05), clip: 0 };
        if (etb) { const LF = frame(ROOT, bw * 0.16 * e, hB * (1 - e) + Math.sin(e * Math.PI) * hL * 0.42, -(bd + 16) * e, 0, -9 * e, 0); box(LF, 0, hL / 2, 0, bw + 0.5, hL, bd + 0.5, lidFace); box(LF, 0, hL / 2 - 0.5, 0, bw - 0.9, hL - 1, bd - 0.9, lidIn); }
        else { const LF = frame(ROOT, 0, hB, -bd / 2, 0, -112 * eback(t), 0); box(LF, 0, hL / 2, bd / 2, bw + 0.5, hL, bd + 0.5, lidFace); box(LF, 0, hL / 2 - 0.5, bd / 2, bw - 0.9, hL - 1, bd - 0.9, lidIn); }
        if (t < 0.02) box(ROOT, 0, hB, 0, bw + 0.25, 0.7, bd + 0.25, n => (n === "top" || n === "bottom") ? null : { ...solid([0, 0, 0], 0, 0.45), layer: 3, cast: 0 });
        contact(0, 0, bw, bd, 0, 0.5, 3); ext = [bw * (1.6 + (etb ? 0.25 : 0) * e), (bh + (etb ? 0 : 26) * e) * 1.5]; target = [etb ? bw * 0.06 * e : 0, bh * 0.5 + (etb ? -bh * 0.08 : 10) * e, -(etb ? bd * 0.5 : 14) * e]; cam = { yaw: -30, pitch: 14 + 10 * e };
        caption = (etb ? "Coffret · ≈ 191 × 165 × 89 mm" : "Deck box · ≈ 72 × 95 × 45 mm · 60 à 100 cartes") + (t > 0.5 ? " · ouvert" : "");
      } else if (id === "playmat") {
        /* neoprene playmat, 24 x 14 inches, with a deck and a few cards in play */
        const MW = 610, MH = 355, MT = 2; floor(0, 900); const G = frame(ROOT, 0, MT / 2, 0, 0, -90, 0); const rubber = solid([0.05, 0.05, 0.055], 0.05, 1, [3, 0.12]);
        slab(G, 0, 0, 0, MW, MH, MT, 7, 0.4, { front: { kind: 0, tex: E.tex("mat"), p: [0.1, 0, 0, 0] }, back: rubber, side: rubber });
        if (o.stitch !== "0") ring(G, 0, 0, 0.1, MW + 0.8, MH + 0.8, MT + 0.5, 7.4, 3.2, 4.2, solid(HEX(o.stitchColor || "#101012"), 0.08, 1, [3, 0.3]));
        const nd = 40, th = nd * T, DF = frame(ROOT, MW * 0.37, MT + th / 2, MH * 0.1, 5, -90, 0);
        slab(DF, 0, 0, 0, W, H, th, R, 0, { front: { kind: 0, tex: E.tex("s0f"), p: [1, 0, 0, 0] }, back: { kind: 0, tex: E.tex("s0b"), p: [1, 0, 0, 0] }, side: { kind: 6, color: [ec.rgb[0], ec.rgb[1], ec.rgb[2], 1], p: [ec.metal, nd, ec.core, 0] } }); slots[0] = { c: pt(DF, 0, 0, th / 2), r: DF.x, u: DF.y, n: DF.z };
        const k = clampN(Math.round(o.count || 4), 1, 5); for (let i = 0; i < k; i++) card(frame(ROOT, (i - (k - 1) / 2) * (W + 10) - MW * 0.07, MT + T / 2 + 0.06, -MH * 0.04 + (i % 2) * 3, i % 2 ? 2.5 : -2, -90, 0), 0, 0, 0, i + 1);
        contact(0, 0, MW, MH, 0, 0.5, 4); ext = [MW * 1.06, MH * 1.2]; target = [0, 0, 14]; cam = { yaw: -12, pitch: 52 }; caption = `Tapis de jeu · 610 × 355 × 2 mm · néoprène${o.stitch !== "0" ? ", bords cousus" : ", coupe franche"}`;
      } else if (id === "tin") {
        /* collector tin: pressed metal body, printed lid that lifts off */
        const TW = 170, TDp = 115, THt = 46, LH = 10; floor(0, 520); const t = clampN(E.anim && E.anim.open !== undefined ? E.anim.open : (o.open ? 1 : 0), 0, 1), e = eio(t); const mx = (a, b, k) => a + (b - a) * k;
        const mc = HEX(o.metal || "#b9bec7"), body = metal([mc[0] * 0.85 + 0.08, mc[1] * 0.85 + 0.08, mc[2] * 0.85 + 0.08], 0.82), inside = metal([0.62, 0.64, 0.68], 0.55);
        ring(frame(ROOT, 0, THt / 2, 0, 0, -90, 0), 0, 0, 0, TW, TDp, THt, 14, 1.3, 12.8, { front: body, back: body, side: body, inner: inside }); quad(frame(ROOT, 0, 0.9, 0, 0, -90, 0), 0, 0, 0, TW - 2, TDp - 2, { ...inside, rad: 13 });
        const pn = 30, ph2 = pn * T, PF = frame(ROOT, -18, 1 + ph2 / 2, 2, 8, -90, 0); slab(PF, 0, 0, 0, W, H, ph2, R, 0, { front: { kind: 0, tex: E.tex("s0f"), p: [1, 0, 0, 0] }, back: { kind: 0, tex: E.tex("s0b"), p: [1, 0, 0, 0] }, side: { kind: 6, color: [ec.rgb[0], ec.rgb[1], ec.rgb[2], 1], p: [ec.metal, pn, ec.core, 0] } }); slots[0] = { c: pt(PF, 0, 0, ph2 / 2), r: PF.x, u: PF.y, n: PF.z };
        const LF = frame(ROOT, 0, mx(THt - LH / 2 + 1.2, (TDp + 1.6) / 2 + 0.4, e) + Math.sin(e * Math.PI) * 34, mx(0, -(TDp / 2 + 20), e), 0, mx(-90, -11, e), 0);
        slab(LF, 0, 0, 0, TW + 1.8, TDp + 1.8, LH, 14.9, 1.6, { front: { kind: 0, tex: E.tex("tinlid"), p: [1, 0, 0, 0] }, back: inside, side: body });
        contact(0, 0, TW, TDp, 0, 0.5, 3); ext = [TW * 1.5, mx(THt * 3.6, (TDp + THt) * 1.3, e)]; target = [0, mx(THt * 0.5, TDp * 0.42, e), mx(0, -TDp * 0.3, e)]; cam = { yaw: -24, pitch: mx(34, 24, e) };
        caption = `Boîte métal · 170 × 115 × 46 mm · couvercle illustré${t > 0.5 ? " · ouverte" : ""}`;
      } else if (id === "coin") {
        /* game coin: one standing, one lying to show the reverse */
        const DI = 37, CT = 2.8; floor(0, 240); const mc = o.metal === "silver" ? STEEL : o.metal === "copper" ? [0.86, 0.5, 0.32] : GOLD; const edge = metal(mc, 0.9), ff = k => ({ kind: 0, tex: E.tex(k), p: [1, 0, 0, 0] });
        slab(frame(ROOT, -DI * 0.35, DI / 2 + 0.2, 0, -16, -9, 0), 0, 0, 0, DI, DI, CT, DI / 2, 0.5, { front: ff("coinf"), back: ff("coinb"), side: edge });
        slab(frame(ROOT, DI * 0.72, CT / 2 + 0.1, DI * 0.42, 24, -90, 0), 0, 0, 0, DI, DI, CT, DI / 2, 0.5, { front: ff("coinb"), back: ff("coinf"), side: edge });
        contact(-DI * 0.35, 0, DI * 0.9, CT + 3, -16, 0.45, 1.6); contact(DI * 0.72, DI * 0.42, DI, DI, 0, 0.4, 2);
        ext = [DI * 3.3, DI * 2.1]; target = [DI * 0.15, DI * 0.42, 6]; cam = { yaw: -14, pitch: 16 }; caption = "Pièce de jeu · Ø 37 mm · épaisseur 2,8 mm";
      } else if (id === "storage") {
        /* cardboard storage box with a row of cards and index dividers */
        const cap = String(o.cap) === "400" ? 400 : 800, BL = cap === 400 ? 200 : 375, BWd = 70, BHt = 95, wt = 1.6; floor(0, 640); const cb = { ...solid([0.93, 0.92, 0.89], 0.05, 1, [1.4, 0.06]), clip: 0 }, cin = { ...solid([0.84, 0.83, 0.79], 0.03, 1, [1.4, 0.06]), clip: 0 };
        box(ROOT, 0, BHt / 2, 0, BL, BHt, BWd, n => n === "top" ? null : cb); box(ROOT, 0, BHt / 2 + 0.7, 0, BL - 2 * wt, BHt - 1.4, BWd - 2 * wt, n => n === "top" ? null : cin);
        const nC = Math.round(cap * 0.62), len = nC * T, cx = -BL / 2 + wt + 3 + len / 2, CF = frame(ROOT, cx, 2 + H / 2, 0, 90, -4, 0);
        slab(CF, 0, 0, 0, W, H, len, R, 0, { front: { kind: 0, tex: E.tex("s0f"), p: [1, 0, 0, 0] }, back: { kind: 0, tex: E.tex("s0b"), p: [1, 0, 0, 0] }, side: { kind: 6, color: [ec.rgb[0], ec.rgb[1], ec.rgb[2], 1], p: [ec.metal, nC, ec.core, 0] } }); slots[0] = { c: pt(CF, 0, 0, len / 2), r: CF.x, u: CF.y, n: CF.z };
        ["#e2590a", "#1f56c9", "#18935a"].forEach((c, i) => slab(CF, 0, 4, -len / 2 + len * (0.22 + i * 0.27), W + 1.5, H + 8, 0.7, 2.5, 0, { all: solid(HEX(c), 0.2) }));
        contact(0, 0, BL, BWd, 0, 0.5, 3); ext = [BL * 1.2, BHt * 2.5]; target = [0, BHt * 0.42, 0]; cam = { yaw: -32, pitch: 30 }; caption = `Boîte de rangement en carton · ${cap} cartes · ${BL} × ${BWd} × ${BHt} mm · intercalaires`;
      }
      return { items: Q, slots: slots.filter(Boolean).length ? slots : [], pack: scenePack, ext, cam, target, caption, floorY, shadowR: Math.max(ext[0], ext[1]) * 1.15 };
    }
    return { build, SLABS, slabDims, displayDims, binderDims, binderGrid };
  })();
