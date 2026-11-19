  /* ================= Shader (one program, one layer per draw) ================= */
  const VERT = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.,1.); }`;
  const FRAG = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#define HAS_DERIV 1
#endif
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage, uMask, uAux, uAux2, uDepthTex, uReliefTex;
uniform vec2 uRes, uPointer, uTilt, uAuxTexel, uCenter, uHalf;
uniform float uAspect, uIntensity, uSeed, uScale, uAngle, uBands, uSparkle, uSpecPow, uFoilAmt, uSat, uGlare, uBump, uHueShift, uRelief, uInk, uImgRelief, uDepth, uEdgeFoil, uFlatOnly, uPickTol, uMaskInvert, uDetail, uCavity, uLightZ, uWarm, uMaskThr, uMaskSoft, uAccentOn, uAccentAmt, uAccentRelief, uAccentInvert, uAccentWithin, uRot, uOpacity, uProof;
uniform int uPattern, uMaskMode, uBlend, uView, uReliefSrc, uDepthSrc, uPalette, uAccentMask, uAccentType, uPickN, uCoat, uEnv;
uniform vec4 uWindow;
uniform float uClipZone, uLightSoft;
uniform int uReliefZone;
uniform vec3 uTint, uAccentTint;
uniform vec3 uPicks[4];

float hash21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
vec2 hash22(vec2 p){ float h = hash21(p); return vec2(h, hash21(p+h+1.7)); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1)); return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p=p*2.03+17.1; a*=.5; } return v; }
vec3 screen(vec3 a, vec3 b){ return 1.-(1.-a)*(1.-b); }
float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
float satur(vec3 c){ float mx=max(c.r,max(c.g,c.b)); float mn=min(c.r,min(c.g,c.b)); return mx<0.02?0.:(mx-mn)/mx; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
vec3 ramp4(vec3 a, vec3 b, vec3 c, vec3 d, float t){ t=fract(t)*4.; vec3 r=mix(a,b,smoothstep(0.,1.,t)); r=mix(r,c,smoothstep(1.,2.,t)); r=mix(r,d,smoothstep(2.,3.,t)); r=mix(r,a,smoothstep(3.,4.,t)); return r; }
vec3 palette(float t){
  if(uPalette==0) return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67)));
  if(uPalette==1) return 0.5+0.5*cos(6.28318*(vec3(1.0,1.0,0.5)*t+vec3(0.80,0.90,0.30)));
  if(uPalette==2) return 0.78+0.22*cos(6.28318*(t+vec3(0.0,0.33,0.67)));
  if(uPalette==3) return mix(vec3(1.0,0.84,0.45), vec3(0.78,0.84,0.98), 0.5+0.5*cos(6.28318*t));
  if(uPalette==4) return ramp4(vec3(0.05,0.95,0.70), vec3(0.25,0.45,1.0), vec3(0.75,0.25,0.95), vec3(1.0,0.35,0.65), t);
  if(uPalette==5) return ramp4(vec3(0.55,0.05,0.0), vec3(1.0,0.35,0.05), vec3(1.0,0.80,0.25), vec3(1.0,0.97,0.75), t);
  if(uPalette==6) return ramp4(vec3(0.10,0.25,0.75), vec3(0.35,0.80,1.0), vec3(0.95,1.0,1.0), vec3(0.65,0.80,1.0), t);
  if(uPalette==7) return ramp4(vec3(1.0,0.86,0.90), vec3(0.85,1.0,0.92), vec3(0.86,0.90,1.0), vec3(1.0,0.97,0.88), t);
  if(uPalette==8) return ramp4(vec3(0.05,0.55,0.35), vec3(0.95,0.80,0.35), vec3(0.10,0.75,0.65), vec3(0.03,0.35,0.25), t);
  if(uPalette==10) return ramp4(vec3(0.95,0.15,0.2), vec3(1.0,0.55,0.25), vec3(1.0,0.9,0.5), vec3(0.8,0.1,0.35), t);
  if(uPalette==11) return ramp4(vec3(0.1,0.3,0.9), vec3(0.2,0.8,1.0), vec3(0.6,0.3,1.0), vec3(0.05,0.15,0.6), t);
  if(uPalette==12) return ramp4(vec3(0.1,0.6,0.3), vec3(0.6,0.95,0.4), vec3(0.1,0.85,0.75), vec3(0.05,0.35,0.2), t);
  if(uPalette==13) return ramp4(vec3(0.5,0.2,0.9), vec3(0.95,0.4,0.9), vec3(0.4,0.5,1.0), vec3(0.3,0.1,0.6), t);
  if(uPalette==14) return ramp4(vec3(0.10,0.75,0.45), vec3(0.10,0.60,0.85), vec3(0.60,0.30,0.90), vec3(0.95,0.30,0.60), t);
  if(uPalette==15) return ramp4(vec3(0.95,0.72,0.25), vec3(0.85,0.45,0.20), vec3(0.25,0.70,0.35), vec3(0.55,0.65,0.20), t);
  return uTint;
}
vec4 hexCoord(vec2 p){ vec2 r=vec2(1.,1.7320508); vec2 h=r*.5; vec2 a=mod(p,r)-h; vec2 b=mod(p-h,r)-h; vec2 gv = dot(a,a)<dot(b,b)?a:b; return vec4(p-gv, gv); }
float hexDist(vec2 p){ p=abs(p); return max(dot(p, normalize(vec2(1.,1.7320508))), p.x); }
vec3 voronoi(vec2 p){
  vec2 n=floor(p), f=fract(p); vec2 mg=vec2(0.), mr=vec2(0.); float md=8.;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){ vec2 g=vec2(float(i),float(j)); vec2 o=hash22(n+g); vec2 r=g+o-f; float d=dot(r,r); if(d<md){ md=d; mr=r; mg=g; } }
  md=8.;
  for(int j=-2;j<=2;j++) for(int i=-2;i<=2;i++){ vec2 g=mg+vec2(float(i),float(j)); vec2 o=hash22(n+g); vec2 r=g+o-f; if(dot(mr-r,mr-r)>0.00001) md=min(md, dot(0.5*(mr+r), normalize(r-mr))); }
  return vec3(md, n+mg);
}
float ggx(float ndh, float a){ float a2=a*a; float d=ndh*ndh*(a2-1.)+1.; return a2*a2/(d*d); }
float groove(float t){ float f=fract(t); return smoothstep(0.0,0.5,f)*smoothstep(1.0,0.5,f); }
float grooveD(float t){ float f=fract(t); return (f<0.5?1.:-1.)*2.; }
float tigerF(vec2 p){ float w=fbm(p*vec2(0.45,1.1)+uSeed); float s=sin((p.x*0.9+w*2.6)*3.14159); float taper=vnoise(p*vec2(0.5,2.2)+7.); return smoothstep(0.15,0.45, s-(taper-0.5)*1.3); }
float topoF(vec2 p){ return fbm(p*0.45+uSeed)*9.; }
float lavaF(vec2 p){ return fbm(p*0.5+uSeed*1.7)+0.25*vnoise(p*0.23+3.); }
float ridgeF(vec2 p){ return p.y*2.4+(fbm(p*0.3+uSeed)-0.5)*7.; }
float frostF(vec2 p){ float a=abs(fbm(p*0.9+uSeed)-0.5)*2.; float b=abs(vnoise(p*2.7+5.)-0.5)*2.; return 1.-min(a,b*1.3); }
void pattern2(vec2 p, vec2 uv, out float h, out vec2 n, out float edge, out float phase){
  h=0.5; n=vec2(0.); edge=1.; phase=0.;
  if(uPattern==43){ /* mosaic: cubical blocks of two sizes */ vec2 big=floor(p*0.5); float ub=step(0.55, hash21(big+3.7)); vec2 id=mix(floor(p), big+100., ub); vec2 f=mix(fract(p), fract(p*0.5), ub); vec2 r=hash22(id); n=(r-.5)*2.2; float bd=min(min(f.x,1.-f.x),min(f.y,1.-f.y))*mix(1.,2.,ub); edge=0.35+0.65*smoothstep(0.02,0.07,bd); phase=hash21(id+9.1)*0.9; h=r.x; }
  else if(uPattern==44){ /* checkerboard (x-fractor) */ vec2 id=floor(p); vec2 f=fract(p)-.5; float o=mod(id.x+id.y,2.); n=(o<0.5?vec2(0.7,0.5):vec2(-0.7,-0.5)); float bd=0.5-max(abs(f.x),abs(f.y)); edge=mix(0.55,1.,o)*(0.6+0.4*smoothstep(0.0,0.05,bd)); phase=o*0.5+0.02*(id.x+id.y); h=o; }
  else if(uPattern==45){ /* discs with concentric rings (mojo) */ vec2 q=p; float row=floor(q.y); q.x+=mod(row,2.)*0.5; vec2 f=fract(q)-.5; float r=length(f); float t=r*7.; h=groove(t); n=normalize(f+1e-4)*grooveD(t)*0.9; phase=0.09*floor(t)+hash21(floor(q))*0.3; edge=0.75+0.25*h; }
  else if(uPattern==46){ /* pulsar: rosettes of radial spokes */ vec2 q=p; float row=floor(q.y); q.x+=mod(row,2.)*0.5; vec2 f=fract(q)-.5; float r=length(f); float a=atan(f.y,f.x); float t=a*12./6.2831; float disc=smoothstep(0.48,0.44,r)*smoothstep(0.05,0.09,r); h=groove(t)*disc; n=vec2(-sin(a),cos(a))*grooveD(t)*disc*1.1; edge=0.45+0.55*disc; phase=(0.04*floor(t+6.)+hash21(floor(q))*0.25)*disc; }
  else if(uPattern==47){ /* velocity: speed dashes */ float row=floor(p.y*3.); float r1=hash21(vec2(row,1.3)); float x=p.x*0.6+r1*7.; float seg=floor(x); float fx=fract(x); float len=0.35+0.55*hash21(vec2(seg,row)); float fy=fract(p.y*3.)-.5; float dash=smoothstep(len,len-0.06,fx)*smoothstep(0.0,0.06,fx)*smoothstep(0.42,0.3,abs(fy)); h=dash; n=vec2(0.,sign(fy))*dash*1.2+vec2((fx/len-0.5)*0.8,0.)*dash; edge=0.4+0.6*dash; phase=hash21(vec2(seg,row)+4.)*0.35+fx*0.2; }
  else if(uPattern==48){ /* tiger stripes */ float st=tigerF(p); n=vec2(tigerF(p+vec2(.05,0.))-st, tigerF(p+vec2(0.,.05))-st)*-4.; h=st; edge=0.35+0.65*st; phase=st*0.3+p.y*0.05; }
  else if(uPattern==49){ /* bubbles */ vec2 id=floor(p); vec2 f=fract(p); vec2 c=0.5+(hash22(id)-.5)*0.4; float R=0.2+0.26*hash21(id+2.2); vec2 d=f-c; float r=length(d); float ins=smoothstep(R,R-0.03,r); float rim=smoothstep(R*0.55,R,r)*ins; n=normalize(d+1e-4)*rim*2.; h=ins*(1.-0.5*rim); edge=0.5+0.5*ins; phase=(hash21(id+5.)*0.5+r*0.3)*ins; }
  else if(uPattern==50){ /* starfoil: scattered four-point stars */ vec2 id=floor(p); vec2 f=fract(p)-.5; vec2 rr=hash22(id); f-=(rr-.5)*0.45; f=rot(rr.x*1.57)*f; float sz=0.24+0.22*hash21(id+8.); float d=pow(abs(f.x),0.6)+pow(abs(f.y),0.6); float k=pow(sz,0.6); float star=smoothstep(k,k*0.8,d)*step(0.3,rr.y); n=(hash22(id+3.)-.5)*2.4*star; h=star; edge=0.3+0.7*star; phase=hash21(id+7.)*0.8*star; }
  else if(uPattern==51){ /* contour lines (fingerprint) */ float t=topoF(p); float tx=topoF(p+vec2(.04,0.)), ty=topoF(p+vec2(0.,.04)); h=groove(t); n=normalize(vec2(tx-t,ty-t)+1e-5)*grooveD(t)*0.9; phase=0.05*floor(t)+0.1*h; edge=0.8+0.2*h; }
  else if(uPattern==52){ /* lava lamp blobs */ float f=lavaF(p); float fx=lavaF(p+vec2(.05,0.)), fy=lavaF(p+vec2(0.,.05)); float blob=smoothstep(0.5,0.56,f); float rim=smoothstep(0.44,0.52,f)*(1.-smoothstep(0.56,0.66,f)); n=vec2(fx-f,fy-f)*-28.*rim; h=blob; edge=0.55+0.45*blob; phase=f*1.6+blob*0.25; }
  else if(uPattern==53){ /* triangle facets (shattered glass, atomic) */ vec2 q=vec2(p.x-p.y*0.57735, p.y*1.1547); vec2 id=floor(q); vec2 f=fract(q); float up=step(f.x+f.y,1.); vec2 tid=id*2.+vec2(up,0.); vec2 r=hash22(tid); n=(r-.5)*2.6; float bd=min(min(f.x,f.y),abs(f.x+f.y-1.)*0.7071); bd=min(bd,min(1.-f.x,1.-f.y)); edge=0.4+0.6*smoothstep(0.0,0.035,bd); phase=hash21(tid+2.3)*0.9; h=r.x; }
  else if(uPattern==54){ /* wavy rays */ vec2 q=p-vec2(0.,0.5*uScale); float a=atan(q.y,q.x); float r=length(q); float t=a*26./6.2831+sin(r*1.4)*0.9; h=groove(t); vec2 tg=vec2(-sin(a),cos(a)); n=tg*grooveD(t)*1.1+normalize(q+1e-4)*cos(r*1.4)*0.3; phase=0.03*floor(t)+0.1*h+r*0.02; }
  else if(uPattern==55){ /* speckle */ vec2 id=floor(p); vec2 f=fract(p); vec2 c=0.5+(hash22(id)-.5)*0.6; float R=0.1+0.22*hash21(id+4.4); float r=length(f-c); float dotm=smoothstep(R,R*0.7,r)*step(0.25,hash21(id+1.9)); n=(hash22(id+6.)-.5)*2.6*dotm; h=dotm; edge=0.42+0.58*dotm; phase=hash21(id+9.)*0.7*dotm; }
  else if(uPattern==56){ /* wide waves */ float t=p.y*1.6+sin(p.x*1.1)*0.9+sin(p.x*0.43+1.7)*0.7; float dx=cos(p.x*1.1)*0.99+cos(p.x*0.43+1.7)*0.3; h=groove(t); n=vec2(dx*0.5,1.)*grooveD(t)*0.8; phase=0.06*floor(t)+0.18*h; }
  else if(uPattern==57){ /* guilloche rosettes */ vec2 f=fract(p)-.5; float r=length(f); float a=atan(f.y,f.x); float t=r*10.+sin(a*8.)*0.8*smoothstep(0.,0.3,r); h=groove(t); n=normalize(f+1e-4)*grooveD(t)*0.9; phase=0.03*floor(t)+0.12*h; edge=0.8+0.2*h; }
  else if(uPattern==58){ /* sparse confetti shapes */ vec2 id=floor(p); vec2 f=fract(p)-.5; vec2 rr=hash22(id); f-=(rr-.5)*0.5; f=rot(rr.y*6.2831)*f; float kind=hash21(id+11.); float sz=0.17+0.14*hash21(id+5.5); float d=kind<0.34?length(f):(kind<0.67?max(abs(f.x),abs(f.y)):max(abs(f.x)*0.866+f.y*0.5,-f.y)); float sh=smoothstep(sz,sz-0.025,d)*step(0.3,hash21(id+2.7)); n=(hash22(id+3.3)-.5)*2.2*sh; h=sh; edge=0.26+0.74*sh; phase=hash21(id+7.9)*0.9*sh; }
  else if(uPattern==59){ /* chevrons */ float fx=fract(p.x*0.5); float z=abs(fx-0.5)*2.; float t=p.y*1.4+z*1.2; h=groove(t); float sx=fx<0.5?-1.:1.; n=vec2(sx*0.85,1.)*grooveD(t)*0.8; phase=0.05*floor(t)+0.15*h; }
  else if(uPattern==60){ /* kaleidoscope */ float a=atan(p.y,p.x); float r=length(p); float seg=6.2831/12.; float am=abs(mod(a,seg)-seg*0.5); vec2 q=vec2(cos(am),sin(am))*r*1.5; vec2 id=floor(q); vec2 rr=hash22(id); n=(rr-.5)*2.2; vec2 f=fract(q); float bd=min(min(f.x,1.-f.x),min(f.y,1.-f.y)); edge=0.5+0.5*smoothstep(0.,0.06,bd); phase=hash21(id+1.7)*0.8+r*0.05; h=rr.x; }
  else if(uPattern==61){ /* truchet arcs (maze) */ vec2 id=floor(p); vec2 f=fract(p); float fl=hash21(id)<0.5?-1.:1.; if(fl<0.) f.x=1.-f.x; float d1=length(f), d2=length(f-1.); float da=abs(d1-0.5), db=abs(d2-0.5); float d=min(da,db); float line=smoothstep(0.16,0.1,d); vec2 dir=da<db?normalize(f+1e-4)*sign(d1-0.5):normalize(f-1.+1e-4)*sign(d2-0.5); dir.x*=fl; n=dir*line*smoothstep(0.02,0.1,d)*1.6; h=line; edge=0.5+0.5*line; phase=0.1*line+(p.x+p.y)*0.03; }
  else if(uPattern==63){ /* engraved ridges, as on textured full-art cards */ float t=ridgeF(p); float tx=ridgeF(p+vec2(.04,0.)), ty=ridgeF(p+vec2(0.,.04)); h=groove(t); n=normalize(vec2(tx-t,ty-t)+1e-5)*grooveD(t)*0.75; phase=0.04*floor(t)+0.08*h; edge=0.84+0.16*h; }
  else if(uPattern==64){ /* sandblast: shallow random pits */ vec2 q=p; vec2 id=floor(q); vec2 f=fract(q)-.5; vec2 o=(hash22(id)-.5)*0.5; float r=length(f-o); float R=0.2+0.22*hash21(id+1.3); float pit=smoothstep(R,R*0.3,r); n=-normalize(f-o+1e-4)*pit*(1.-pit)*4.2; h=1.-pit; edge=1.-0.22*pit; phase=hash21(id+4.)*0.2; }
  else if(uPattern==65){ /* pebble grain (shagreen): tight domes */ vec4 hc=hexCoord(p*1.4); vec2 gv=hc.zw; float r=length(gv); h=smoothstep(0.5,0.1,r); n=normalize(gv+1e-4)*smoothstep(0.08,0.42,r)*smoothstep(0.52,0.4,r)*1.8; edge=0.55+0.45*smoothstep(0.5,0.38,r); phase=hash21(hc.xy)*0.25; }
  else if(uPattern==66){ /* basket weave */ vec2 id=floor(p); vec2 f=fract(p); float o=mod(id.x+id.y,2.); vec2 g=o<0.5?f:f.yx; float sq=fract(g.y*3.); float ridge=smoothstep(0.,0.18,sq)*smoothstep(1.,0.82,sq); float arch=sin(g.x*3.14159); h=ridge*(0.4+0.6*arch); vec2 nn=vec2(cos(g.x*3.14159)*0.9, (sq<0.5?1.:-1.)*(1.-ridge)*1.6); n=o<0.5?nn:nn.yx; edge=0.5+0.5*ridge*(0.5+0.5*arch); phase=0.12*o+0.03*floor(g.y*3.); }
  else if(uPattern==67){ /* laid paper: fine lines and chain lines */ float t=p.y*5.; float l=groove(t); float fx=fract(p.x*0.4)-0.5; float c=smoothstep(0.035,0.,abs(fx)); h=l*0.7+c*0.3; n=vec2(-sign(fx)*c*1.2, grooveD(t)*0.45); edge=0.9+0.1*l-0.2*c; phase=0.01*floor(t); }
  else if(uPattern==68){ /* frost crystals */ float f=frostF(p); float fx=frostF(p+vec2(.04,0.)), fy=frostF(p+vec2(0.,.04)); h=f; n=vec2(fx-f,fy-f)*-7.; edge=0.5+0.5*smoothstep(0.55,0.9,f); phase=f*0.6; }
  else if(uPattern==69){ /* crocodile: large irregular scales */ vec3 v=voronoi(p*0.8); float bd=v.x; h=smoothstep(0.,0.3,bd); vec2 gb=vec2(voronoi(p*0.8+vec2(.03,0.)).x-bd, voronoi(p*0.8+vec2(0.,.03)).x-bd)/0.03; n=(hash22(v.yz)-.5)*0.35*h+gb*smoothstep(0.2,0.,bd)*1.5; edge=0.38+0.62*smoothstep(0.012,0.07,bd); phase=hash21(v.yz+2.)*0.4; }
  else if(uPattern==70){ /* herringbone weave */ float col=floor(p.x); float dir=mod(col,2.)<1.?1.:-1.; float fx=fract(p.x); float t=(p.y+dir*fx)*3.; h=groove(t); n=vec2(dir*0.7,1.)*grooveD(t)*0.7; float seam=smoothstep(0.,0.06,min(fx,1.-fx)); edge=(0.75+0.25*h)*(0.6+0.4*seam); phase=0.05*floor(t)+0.2*mod(col,2.); }
  else if(uPattern==62){ /* plaid */ float a=groove(p.x)*0.6+groove(p.x*0.37+0.2)*0.4; float b=groove(p.y)*0.6+groove(p.y*0.37+0.5)*0.4; h=a*b+0.25*(a+b); n=vec2(grooveD(p.x)*b, grooveD(p.y)*a)*0.7; edge=0.6+0.4*max(a,b); phase=0.07*floor(p.x)+0.11*floor(p.y); }
}
void pattern(vec2 p, vec2 uv, out float h, out vec2 n, out float edge, out float phase){
  h=0.5; n=vec2(0.); edge=1.; phase=0.;
  if(uPattern==1){ float s=sin(p.x*6.2831); h=0.5+0.5*s; n=vec2(cos(p.x*6.2831),0.); phase=p.x; }
  else if(uPattern==2){ vec4 hc=hexCoord(p); vec2 r=hash22(hc.xy); n=(r-.5)*2.; float d=hexDist(hc.zw); edge=smoothstep(0.5,0.44,d); phase=hash21(hc.xy+1.3); h=hash21(hc.xy); }
  else if(uPattern==3){ vec3 v=voronoi(p); vec2 r=hash22(v.yz); n=(r-.5)*2.; edge=smoothstep(0.0,0.05,v.x); phase=hash21(v.yz); h=1.-edge; }
  else if(uPattern==4){ float d=length(p); float w=sin(d*6.2831*1.5); h=0.5+0.5*w; n=normalize(p+1e-4)*cos(d*6.2831*1.5); n+=vec2(.35)*cos((p.x+p.y)*22.); phase=d*0.35+0.08*sin((p.x+p.y)*22.); }
  else if(uPattern==5){ float a=p.y*6.2831 + sin(p.x*6.2831*0.45)*1.6; h=0.5+0.5*sin(a); n=vec2(0., cos(a)); phase=p.y*0.25+0.12*sin(a); }
  else if(uPattern==6){ vec2 f=fract(p)-.5; vec2 q=abs(f); float d=q.x+q.y; h=d; n=sign(f)*vec2(1.); edge=mix(0.55,1.,smoothstep(0.47,0.5,d)); phase=hash21(floor(p))*0.4+d*0.3; }
  else if(uPattern==7){ float sa=floor(fract(p.x)*5.)/5.; float sb=floor(fract(p.y)*5.)/5.; n=vec2(sa-.4, sb-.4)*2.5; h=(sa+sb)*.5; phase=h*0.6; edge=0.65+0.35*abs(sa-sb); }
  else if(uPattern==8){ vec2 q=p+uSeed; float f=fbm(q); float f2=fbm(q*2.3+vec2(5.2,1.3)); h=f; n=vec2(fbm(q+vec2(.08,0.))-f, fbm(q+vec2(0.,.08))-f)*14.; phase=f*2.2+f2*0.6; edge=smoothstep(0.2,0.7,f); }
  else if(uPattern==9){ float e=0.35; float c=vnoise(p); n=vec2(vnoise(p+vec2(e,0.))-vnoise(p-vec2(e,0.)), vnoise(p+vec2(0.,e))-vnoise(p-vec2(0.,e)))*2.2; h=c; phase=c*0.25; }
  else if(uPattern==10){ vec4 hc=hexCoord(p); float d=hexDist(hc.zw); float line=smoothstep(0.42,0.47,d); n=normalize(hc.zw+1e-4)*line*1.5; edge=mix(1.,0.55,line); phase=hash21(hc.xy)*0.25; h=line; }
  else if(uPattern==11){ float s=vnoise(vec2(p.x*0.6, p.y*70.)); float s2=vnoise(vec2(p.x*3., p.y*200.)); n=vec2(0., (s-.5)*2.+(s2-.5)); h=s; phase=0.; }
  else if(uPattern==12){ float s=sin(p.x*6.2831); h=0.5+0.5*s; n=vec2(cos(p.x*6.2831),0.)*0.6; phase=p.x; float sc=step(0.5,fract(uv.x*uAspect*260.)); edge=0.55+0.45*sc; }
  else if(uPattern==13){ float wob=sin(p.x*0.9+uSeed)*0.35+sin(p.x*2.7+p.y*0.4)*0.12; float t=p.y+wob; h=groove(t); n=vec2(-0.25*cos(p.x*0.9+uSeed)*grooveD(t), grooveD(t)); phase=0.04*floor(t)+0.05*h; }
  else if(uPattern==14){ float t1=p.y+sin(p.x*0.8)*0.2; float t2=p.x+sin(p.y*0.8)*0.2; float h1=groove(t1), h2=groove(t2*1.07); h=max(h1,h2); n=vec2(grooveD(t2*1.07)*0.9, grooveD(t1)); phase=0.03*(floor(t1)+floor(t2))+0.1*h; edge=0.85+0.15*h; }
  else if(uPattern==15){ vec2 q=p-vec2(0.0,-0.35*uScale); float a=atan(q.y,q.x); float r=length(q); float t=a*22./6.2831; float g=groove(t); h=g; vec2 tang=vec2(-sin(a),cos(a)); n=tang*grooveD(t)*1.2; float ring=groove(r*0.5); n+=normalize(q+1e-4)*grooveD(r*0.5)*0.25; h=mix(h,ring,0.3); phase=0.02*floor(t)+0.08*ring; }
  else if(uPattern==16){ float a=sin(p.x*6.2831*0.5)+sin(p.y*6.2831*0.5); float b=sin((p.x*0.7+p.y*0.7)*6.2831*0.5)*1.2; float t=(a+b)*1.6; h=groove(t); float dx=cos(p.x*3.1416)*3.1416*1.6+cos((p.x+p.y)*0.7*3.1416)*0.7*3.1416*1.2*1.6; float dy=cos(p.y*3.1416)*3.1416*1.6+cos((p.x+p.y)*0.7*3.1416)*0.7*3.1416*1.2*1.6; n=vec2(dx,dy)*grooveD(t)*0.25; phase=0.12*h+0.03*floor(t); }
  else if(uPattern==17){ vec2 q=p; float row=floor(q.y); q.x+=mod(row,2.)*0.5; vec2 c=vec2(floor(q.x)+0.5, row+0.1); vec2 d=q-c; float r=length(d); float inside=step(r,0.62); float rim=smoothstep(0.62,0.5,r); h=mix(0.2,1.,rim)*inside; n=normalize(d+1e-4)*(1.-rim)*2.*inside; edge=0.7+0.3*inside; phase=0.06*hash21(c)+0.08*rim; }
  else if(uPattern==18){ float t=p.y; h=groove(t); n=vec2(0., grooveD(t)); phase=0.012*floor(t); }
  else if(uPattern==19){ float t1=p.y; float t2=(rot(0.12)*p).y*1.03; float h1=groove(t1), h2=groove(t2); h=h1*h2; n=vec2(0., grooveD(t1))*h2+vec2(sin(0.12),cos(0.12))*grooveD(t2)*h1; phase=0.02*floor(t1)+0.3*h; edge=0.6+0.4*h; }
  else if(uPattern==20){ vec2 id=floor(p); vec2 f=fract(p)-.5; vec2 r=hash22(id); float a=r.x*6.2831; vec2 d=vec2(cos(a),sin(a)); float along=dot(f,d); float across=abs(dot(f,vec2(-d.y,d.x))); float streak=smoothstep(0.07,0.0,across)*step(abs(along),0.44)*step(0.3,r.y); n=vec2(-d.y,d.x)*streak*2.2; h=streak; edge=0.9+0.1*streak; phase=hash21(id+5.)*0.15; }
  else if(uPattern==21){ vec2 id=floor(p); vec2 f=fract(p)-.5; vec2 r=hash22(id); vec2 q=rot(r.x*6.2831)*(f-(hash22(id+1.)-.5)*0.4); float fl=step(abs(q.x),0.28)*step(abs(q.y),0.18); n=(hash22(id+3.)-.5)*2.*fl; h=fl; edge=0.55+0.45*fl; phase=hash21(id+7.)*0.5; }
  else if(uPattern==22){ vec2 g=p*2.; vec2 f=fract(g)-.5; float nz=fbm(p*0.35+uSeed); float rad=0.18+0.3*nz; float dotm=smoothstep(rad,rad-0.06,length(f)); float stroke=vnoise(vec2(p.x*0.4,p.y*9.)); h=max(dotm,stroke*0.6); n=normalize(f+1e-4)*dotm*1.5+vec2(0.,(stroke-.5)*1.2); edge=0.7+0.3*h; phase=0.1*nz+0.2*dotm; }
  else if(uPattern==23){ vec3 v=voronoi(p); vec2 r=hash22(v.yz); vec3 v2=voronoi(p*3.1+7.); n=(r-.5)*1.6+(hash22(v2.yz)-.5)*0.5; edge=smoothstep(0.0,0.03,v.x)*(0.85+0.15*smoothstep(0.,0.05,v2.x)); phase=hash21(v.yz)*0.6; h=1.-smoothstep(0.0,0.04,v.x); }
  else if(uPattern==24){ float d=length(p-vec2(0.6,0.3)); float w=sin(d*6.2831*0.8+sin(p.x*3.)*0.5); h=0.5+0.5*w; n=normalize(p-vec2(0.6,0.3)+1e-4)*cos(d*6.2831*0.8)*0.9; phase=d*0.25+0.1*w; }
  else if(uPattern==25){ vec3 v=voronoi(p); vec2 c=floor(p)+hash22(v.yz); float dome=smoothstep(0.0,0.25,v.x); n=normalize(p-c+1e-4)*(1.-dome)*1.5; h=dome; edge=0.8+0.2*dome; phase=hash21(v.yz)*0.1; }
  else if(uPattern==26){ float a=sin(p.x*6.2831), b=sin(p.y*6.2831); h=0.5+0.25*(a+b); n=vec2(cos(p.x*6.2831), cos(p.y*6.2831)); phase=0.; }
  else if(uPattern==27){ vec3 v=voronoi(p); vec2 id=v.yz; vec2 c=id+hash22(id); vec2 d=p-c; float dome=smoothstep(0.0,0.45,v.x); n=normalize(d+1e-4)*(1.-dome)*2.2; h=dome; edge=0.9+0.1*dome; phase=hash21(id)*0.08; }
  else if(uPattern==28){ vec2 id=floor(p); float o=mod(id.x+id.y,2.); vec2 f=fract(p); float s=o<0.5?sin(f.y*6.2831*3.):sin(f.x*6.2831*3.); h=0.5+0.5*s; n=o<0.5?vec2(0.,cos(f.y*6.2831*3.)):vec2(cos(f.x*6.2831*3.),0.); float cut=smoothstep(0.0,0.06,f.x)*smoothstep(1.0,0.94,f.x)*smoothstep(0.0,0.06,f.y)*smoothstep(1.0,0.94,f.y); edge=0.45+0.55*cut; phase=o*0.1; }
  else if(uPattern==29){ float nx=vnoise(p*0.8+3.), ny=vnoise(p*0.8+9.); float a=sin(p.x*6.2831), b=sin(p.y*6.2831); h=0.5+0.25*(a+b); n=vec2(cos(p.x*6.2831)*(0.6+0.8*nx), cos(p.y*6.2831)*(0.6+0.8*ny)); edge=0.8+0.2*vnoise(p*2.); phase=0.; }
  else if(uPattern==30){ float t1=p.x+p.y, t2=p.x-p.y; float g1=groove(t1), g2=groove(t2); h=g1*g2; n=vec2(grooveD(t1)+grooveD(t2), grooveD(t1)-grooveD(t2))*0.7*(0.3+0.7*h); edge=0.6+0.4*h; phase=0.02*(floor(t1)+floor(t2)); }
  else if(uPattern==31){ vec2 q=p; float row=floor(q.y); q.x+=mod(row,2.)*0.5; vec2 f=fract(q)-.5; float ang=mod(row,2.)<0.5?0.785:-0.785; vec2 r=rot(ang)*f; float sd=length(r*vec2(1.,2.6)); float raised=smoothstep(0.42,0.3,sd); n=normalize(r*vec2(1.,6.8)+1e-4)*raised*(1.-smoothstep(0.1,0.3,sd))*2.; n=rot(-ang)*n; h=raised; edge=0.75+0.25*raised; phase=0.; }
  else if(uPattern==32){ vec2 id=floor(p); vec2 f=fract(p); vec2 r=hash22(id); float tr=0.; if(r.x<0.5) tr=smoothstep(0.08,0.05,abs(f.y-0.5)); else tr=smoothstep(0.08,0.05,abs(f.x-0.5)); float pad=smoothstep(0.16,0.12,length(f-0.5))*step(0.6,r.y); float ring=pad*smoothstep(0.05,0.08,length(f-0.5)); h=max(tr,ring); n=vec2(0.); if(r.x<0.5) n=vec2(0.,sign(f.y-0.5))*tr; else n=vec2(sign(f.x-0.5),0.)*tr; n+=normalize(f-0.5+1e-4)*ring; edge=0.55+0.45*h; phase=hash21(id)*0.2; }
  else if(uPattern==33){ vec2 f=fract(p)-.5; float r=length(f); float dome=smoothstep(0.42,0.3,r); n=normalize(f+1e-4)*dome*(1.-smoothstep(0.0,0.3,r))*2.; h=dome; edge=0.75+0.25*dome; phase=0.; }
  else if(uPattern==34){ float w=fbm(p*1.3+uSeed)*3.; float v=pow(1.-abs(sin((p.x+p.y*0.4+w)*2.)),6.); float wx=fbm(p*1.3+uSeed+vec2(.05,0.))*3.; float wy=fbm(p*1.3+uSeed+vec2(0.,.05))*3.; float vx=pow(1.-abs(sin((p.x+0.05+p.y*0.4+wx)*2.)),6.); float vy=pow(1.-abs(sin((p.x+(p.y+0.05)*0.4+wy)*2.)),6.); n=vec2(vx-v, vy-v)*-6.; h=v; edge=0.85+0.15*fbm(p*4.); phase=w*0.15+v*0.3; }
  else if(uPattern==35){ vec2 q=p*vec2(1.,0.22); float r=length(q)+fbm(p*1.5)*0.7; float t=r*3.; h=groove(t); n=normalize(q+1e-4)*grooveD(t)*0.6; n.y+=(vnoise(vec2(p.x*40.,p.y*2.))-.5)*0.8; edge=0.75+0.25*h; phase=0.03*floor(t); }
  else if(uPattern==36){ float f=fbm(p*1.2+uSeed); float t=p.x*0.8+f*2.5; float s=sin(t*6.2831); h=0.5+0.5*s; float fx=fbm(p*1.2+uSeed+vec2(.04,0.)); float fy=fbm(p*1.2+uSeed+vec2(0.,.04)); n=vec2((fx-f)*2.5*25.+0.8, (fy-f)*2.5*25.)*cos(t*6.2831)*0.12; phase=t*0.5+f; }
  else if(uPattern==37){ float t=p.x; h=groove(t); n=vec2(grooveD(t),0.)*1.2; phase=0.05*floor(t)+0.2*h; }
  else if(uPattern==38){ float h1=sin(length(p-vec2(0.3,0.2))*18.), h2=sin(length(p-vec2(-0.5,0.4))*14.+1.), h3=sin(length(p-vec2(0.1,-0.6))*22.+2.); h=0.5+(h1+h2+h3)/6.; n=normalize(p-vec2(0.3,0.2)+1e-4)*cos(length(p-vec2(0.3,0.2))*18.)*0.6+normalize(p-vec2(-0.5,0.4)+1e-4)*cos(length(p-vec2(-0.5,0.4))*14.+1.)*0.5; phase=h*0.5; }
  else if(uPattern==39){ vec2 q=p; float row=floor(q.y); q.x+=mod(row,2.)*0.5; vec2 f=fract(q)-.5; vec2 e=f*vec2(1.,1.4); float r=length(e); float sc=smoothstep(0.5,0.42,r); n=normalize(e+1e-4)*(1.-smoothstep(0.1,0.5,r))*1.5*sc; h=sc*(0.5+0.5*vnoise(p*6.)); edge=0.7+0.3*sc; phase=hash21(floor(q))*0.08; }
  else if(uPattern==40){ /* halo: curved shine arcs */ float d=length(p-vec2(0.2,-0.9)); float t=d*2.2; h=groove(t); n=normalize(p-vec2(0.2,-0.9)+1e-4)*grooveD(t)*0.8; phase=0.07*floor(t)+0.15*h; edge=0.85+0.15*h; }
  else if(uPattern==41){ /* step pattern: stair-stepped bands */ float t=p.x*0.7+floor(p.y*2.)*0.25; float sb=floor(fract(t)*6.)/6.; h=sb; n=vec2(1.,0.3)*(sb-0.4)*2.; phase=sb*0.5; edge=0.7+0.3*sb; }
  else if(uPattern==42){ /* dot grid (prismatic collector's) */ vec2 f=fract(p)-.5; float r=length(f); float dotm=smoothstep(0.3,0.22,r); n=normalize(f+1e-4)*dotm*1.8; h=dotm; edge=0.75+0.25*dotm; phase=hash21(floor(p))*0.4; }
  else if(uPattern>42){ pattern2(p, uv, h, n, edge, phase); }
}
float sparkle(vec2 uv, vec3 H, float scale, float seed){
  vec2 p=uv*vec2(uAspect,1.)*scale; vec2 id=floor(p); vec2 f=fract(p);
  vec2 r=hash22(id+seed); vec3 n=normalize(vec3((r-.5)*1.7, 1.));
  vec2 c=0.5+(hash22(id+seed+3.1)-.5)*0.5; float d=length(f-c);
  float s=pow(max(dot(n,H),0.), 90.); float dot_=smoothstep(0.22,0.0,d);
  return s*dot_*step(0.35, hash21(id+seed+7.7));
}
/* a full turn of saturated hues, smooth at the joins */
vec3 hueRGB(float h){ vec3 c=clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.); return c*c*(3.-2.*c); }
/* glitter: flakes of film, each with its own tilt and its own colour; one lights up when it sends the lamp to the eye, and the brightest throw a four-point glint */
vec3 glitter(vec2 uv, vec3 H, float scale, float seed){
  vec2 p=uv*vec2(uAspect,1.)*scale; vec2 id=floor(p); vec2 f=fract(p);
  vec2 r=hash22(id+seed); vec3 n=normalize(vec3((r-.5)*1.9, 1.));
  vec2 d=f-(0.5+(hash22(id+seed+3.1)-.5)*0.5); float dd=length(d);
  float s=pow(max(dot(n,H),0.), 150.);
  float core=smoothstep(0.24,0.0,dd);
  float star=(exp(-abs(d.x)*42.)*exp(-abs(d.y)*7.)+exp(-abs(d.y)*42.)*exp(-abs(d.x)*7.))*step(0.78, hash21(id+seed+9.1));
  vec3 tint=mix(vec3(1.), hueRGB(hash21(id+seed+5.5)), 0.6);
  return tint*s*(core*1.5+star*1.1)*step(0.4, hash21(id+seed+7.7));
}
vec3 bump3(vec3 x, vec3 yo){ vec3 y=1.-x*x; return clamp(y-yo,0.,1.); }
/* visible spectrum: x = 0 at 400 nm, 1 at 700 nm; black outside, as a grating sends no visible light there */
vec3 spectral(float x){
  if(x<-0.08||x>1.08) return vec3(0.);
  vec3 c=bump3(vec3(3.54585104,2.93225262,2.41593945)*(x-vec3(0.69549072,0.49228336,0.27699880)), vec3(0.02312639,0.15225084,0.52607955))+bump3(vec3(3.90307140,3.21182957,3.96587128)*(x-vec3(0.11748627,0.86755042,0.66077860)), vec3(0.84897130,0.88445281,0.73949448));
  return c*smoothstep(-0.08,0.03,x)*smoothstep(1.08,0.97,x);
}
/* s: path difference in micrometres between neighbouring grooves. Orders 1 to 3 overlap, as on a real film */
vec3 grating(float s){ return spectral((s-0.40)/0.30)+0.62*spectral((s*0.5-0.40)/0.30)+0.4*spectral((s/3.-0.40)/0.30); }
vec3 env(vec3 R){
  float y=R.y; vec3 sky=mix(vec3(0.55,0.58,0.65), vec3(1.0,1.0,1.0), smoothstep(-0.1,0.6,y));
  vec3 ground=mix(vec3(0.08,0.08,0.1), vec3(0.3,0.3,0.34), smoothstep(-1.,0.,y));
  vec3 e=mix(ground, sky, smoothstep(-0.05,0.05,y));
  float a=atan(R.x, R.z); e+=0.35*smoothstep(0.92,1.,sin(a*3.+1.2))*smoothstep(0.1,0.5,y); e-=0.25*smoothstep(0.6,1.,sin(a*5.+0.4))*(1.-abs(y));
  return clamp(e,0.,1.5);
}
vec4 aux(vec2 uv){ return texture2D(uAux, vec2(uv.x,1.-uv.y)); }
vec4 aux2(vec2 uv){ return texture2D(uAux2, vec2(uv.x,1.-uv.y)); }
uniform float uMaskGrow;
float subjAt(vec2 uv){ float s=aux2(uv).r; if(uMaskGrow!=0.){ float g=abs(uMaskGrow); float b=texture2D(uAux2, vec2(uv.x,1.-uv.y), 3.+3.*g).r; float t=.5-uMaskGrow*.44; s=smoothstep(t-.06,t+.06,mix(s,b,min(1.,g*4.))); } return s; }
float satOf(vec3 c){ float mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b)); return mx<.024?0.:(mx-mn)/mx; }
float heightAt(vec2 uv){ vec4 a=aux(uv); return mix(a.r, a.b, uDetail); }
float edgeAt(vec2 uv){ return aux(uv).g; }
float thresh(float v){ return smoothstep(uMaskThr-uMaskSoft, uMaskThr+uMaskSoft, v); }
float maskFor(int mode, float inv, vec2 uv, vec3 img, float ph){
  float m=1.;
  if(mode==1||mode==2){ float e=0.004; float t=1.-uWindow.x, b=uWindow.z, l=uWindow.w, r=1.-uWindow.y; float inside=smoothstep(l-e,l+e,uv.x)*smoothstep(r+e,r-e,uv.x)*smoothstep(b-e,b+e,uv.y)*smoothstep(t+e,t-e,uv.y); m=mode==1?inside:1.-inside; }
  else if(mode==4) m=texture2D(uMask, vec2(uv.x,1.-uv.y)).r;
  else if(mode==5) m=thresh(lum(img));
  else if(mode==6) m=1.-thresh(lum(img));
  else if(mode==7) m=1.-thresh(subjAt(uv));
  else if(mode==9) m=thresh(subjAt(uv));
  else if(mode==8){ m=0.; for(int i=0;i<4;i++){ if(i<uPickN){ float d=distance(img,uPicks[i]); m=max(m, 1.-smoothstep(uPickTol*0.6,uPickTol*1.3,d)); } } }
  else if(mode==10) m=thresh(edgeAt(uv)*2.2);
  else if(mode==11) m=1.-thresh(satOf(img));
  else if(mode==12) m=thresh(satOf(img));
  else if(mode==13) m=thresh(ph);
  return mix(m,1.-m,inv);
}
vec3 tanh3(vec3 x){ vec3 e=exp(2.*clamp(x,-10.,10.)); return (e-1.)/(e+1.); }
vec3 softclip(vec3 c){ return mix(c, 0.82+0.18*tanh3((c-0.82)/0.18), step(0.82,c)); }
/* soft proof: compress colours that CMYK inks cannot reach, ink black is not zero, paper white is slightly warm */
vec3 proofInk(vec3 c){ float l=lum(c); float mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b)); float sat=mx-mn; vec3 d=mix(c, vec3(l), 0.24*smoothstep(0.45,1.0,sat)); d=0.05+d*0.88; return d*vec3(1.0,0.985,0.955); }
void main(){
  vec2 cuv=vUv;
  vec2 pc=(cuv-0.5)*vec2(uAspect,1.);
  vec3 V=normalize(vec3(sin(uTilt.x), sin(uTilt.y), cos(uTilt.x)*cos(uTilt.y)));
  vec3 Lp=vec3((uPointer-0.5)*vec2(uAspect,1.)*1.1, uLightZ);
  vec3 L=normalize(Lp-vec3(pc,0.));
  vec3 H=normalize(L+V);
  vec3 N0=vec3(0.,0.,1.);
  vec3 lightCol=vec3(1.+0.12*uWarm, 1.-0.04*abs(uWarm), 1.-0.28*uWarm);
  if(uCoat==1){ float n0h=max(dot(N0,H),0.); float ndv=max(dot(N0,V),0.); float g=(ggx(n0h,mix(0.07,0.36,uLightSoft))*0.28*mix(1.,0.5,uLightSoft)+ggx(n0h,mix(0.17,0.55,uLightSoft))*0.07)*(1.+1.4*pow(1.-ndv,4.)); float fres=pow(1.-ndv,3.)*0.15; vec3 cc=lightCol*(g*uGlare+fres*uGlare*0.5); if(uEnv==1) cc*=vec3(0.22,0.12,0.5); else if(uEnv==2) cc*=0.03; gl_FragColor=vec4(cc,1.); return; }
  /* layer space */
  vec2 lp=rot(-uRot)*((cuv-uCenter)*vec2(uAspect,1.));
  vec2 luv0=lp/(2.*uHalf)+0.5;
  float inside=step(0.,luv0.x)*step(luv0.x,1.)*step(0.,luv0.y)*step(luv0.y,1.);
  if(inside<0.5){ gl_FragColor=vec4(0.); return; }
  vec2 uv=luv0;
  if(uDepthSrc>0 && uDepth>0.){
    vec2 off=vec2(sin(uTilt.x), sin(uTilt.y))*uDepth*0.06;
    for(int i=0;i<2;i++){
      float d;
      if(uDepthSrc==1) d=aux2(uv).g; else if(uDepthSrc==2) d=1.-aux2(uv).g;
      else if(uDepthSrc==3) d=aux2(uv).r;
      else if(uDepthSrc==5) d=maskFor(uMaskMode, uMaskInvert, uv, texture2D(uImage, vec2(uv.x,1.-uv.y)).rgb, 0.5);
      else d=texture2D(uDepthTex, vec2(uv.x,1.-uv.y)).r;
      uv=luv0+off*(d-0.5);
    }
    uv=clamp(uv,0.002,0.998);
  }
  vec4 tex=texture2D(uImage, vec2(uv.x,1.-uv.y));
  vec3 raw=tex.rgb; vec3 img=uProof>0.5?proofInk(raw):raw; float a=tex.a*uOpacity;
  float edge=edgeAt(uv);
  /* where the relief applies: everywhere, on the detected subject, on the contours, or on a painted zone */
  float rz=1.; if(uReliefZone==1) rz=smoothstep(0.35,0.65,aux2(uv).r); else if(uReliefZone==2) rz=smoothstep(0.06,0.3,edge); else if(uReliefZone==3) rz=texture2D(uReliefTex, vec2(uv.x,1.-uv.y)).r;
  vec2 pcp=pc; if(uBlend==0) pcp+=vec2(sin(uTilt.x), sin(uTilt.y))*0.045+(uPointer-0.5)*vec2(0.02,0.02);
  vec2 p=rot(uAngle)*pcp*uScale;
  float ph; vec2 np; float pedge; float phase;
  pattern(p, cuv, ph, np, pedge, phase);
  float m=maskFor(uMaskMode, uMaskInvert, uv, raw, ph);
  if(uView==1){ gl_FragColor=vec4(img*a,a); return; }
  if(uView==3){ gl_FragColor=vec4(mix(img*0.25, vec3(1.), m)*a,a); return; }
  if(uView==5){ gl_FragColor=vec4(vec3(heightAt(uv))*a,a); return; }
  if(uView==6){ gl_FragColor=vec4(vec3(edge)*a,a); return; }
  if(uView==7){ gl_FragColor=vec4(mix(img*0.25, vec3(1.), thresh(aux2(uv).r))*a,a); return; }
  if(uView==9){ gl_FragColor=vec4(vec3(m)*a,a); return; }
  if(uView==10){ float ma=uAccentOn>0.5?maskFor(uAccentMask, uAccentInvert, uv, raw, ph)*mix(1.,m,uAccentWithin):0.; gl_FragColor=vec4(vec3(ma)*a,a); return; }
  float flat_=1.-uFlatOnly*smoothstep(0.05,0.35,edge);
#ifdef HAS_DERIV
  float cellsPx=1./max(fwidth(p.x)+fwidth(p.y), 1e-5);
  float aaF=smoothstep(1.6, 4.5, cellsPx);
#else
  float aaF=1.;
#endif
  vec2 nP=np*uBump*0.35*flat_*aaF; pedge=mix(1., pedge, aaF);
  vec2 tx=vec2(uAuxTexel.x,0.), ty=vec2(0.,uAuxTexel.y);
  vec2 gH=(vec2(heightAt(uv+tx)-heightAt(uv-tx), heightAt(uv+ty)-heightAt(uv-ty))*0.62+vec2(heightAt(uv+tx*2.5)-heightAt(uv-tx*2.5), heightAt(uv+ty*2.5)-heightAt(uv-ty*2.5))*0.152)*vec2(1.,-1.);
  vec2 gE=vec2(edgeAt(uv+tx)-edgeAt(uv-tx), edgeAt(uv+ty)-edgeAt(uv-ty))*vec2(1.,-1.);
  vec2 n=vec2(0.);
  if(uReliefSrc==0) n=nP;
  else if(uReliefSrc==1) n=-gH*uImgRelief*14.;
  else if(uReliefSrc==2) n=gE*uImgRelief*10.;
  else if(uReliefSrc==3){ vec2 gM=vec2(maskFor(uMaskMode,uMaskInvert,uv+tx*2., raw, ph)-maskFor(uMaskMode,uMaskInvert,uv-tx*2., raw, ph), maskFor(uMaskMode,uMaskInvert,uv+ty*2., raw, ph)-maskFor(uMaskMode,uMaskInvert,uv-ty*2., raw, ph))*vec2(1.,-1.); n=-gM*uImgRelief*6.; }
  else if(uReliefSrc==4){ float lm=aux(uv).b; float t=p.y; float f=fract(t); float w=0.15+0.7*(1.-lm); float line=smoothstep(w+0.08,w,abs(f-0.5)*2.); n=vec2(0., (f<0.5?1.:-1.)*line*2.)*uBump*0.35; pedge=mix(1.,0.75,line); phase=0.02*floor(t); ph=line; }
  else if(uReliefSrc==5) n=nP-gH*uImgRelief*14.;
  else n=gE*uImgRelief*8.-gH*uImgRelief*8.;
  n*=rz;
  vec3 N=normalize(vec3(n, 1.));
  if(uView==4){ gl_FragColor=vec4((N*0.5+0.5)*a,a); return; }
  float NdH=max(dot(N,H),0.);
  float rough=sqrt(2./(uSpecPow*4.+14.)); rough=mix(rough, max(rough,0.62), uLightSoft*0.85);
  float spec=ggx(NdH, rough);
  float NdV=max(dot(N0,V),0.);
  float n0h=max(dot(N0,H),0.);
  float broad=pow(n0h, 12.);
  float relief=clamp((dot(N,L)-dot(N0,L))*uRelief*1.1, -0.6, 0.7); relief=relief>0.?relief:relief*(uReliefSrc==0?0.6:0.45);
  float cav=aux2(uv).b*uCavity;
  float t=phase + (1.-NdH)*uBands*12. + uHueShift;
  vec3 rainbow=palette(t); rainbow=mix(vec3(lum(rainbow)), rainbow, uSat);
  float sp=(sparkle(cuv,H,150.,0.)+sparkle(cuv,H,95.,2.))*uSparkle;
  float inkVis=mix(0.15+0.85*lum(img), 1.0, uInk);
  float edgeF=mix(1., smoothstep(0.05,0.35,edge)*1.6+0.05, clamp(uEdgeFoil,0.,1.)) * (1.+max(uEdgeFoil-1.,0.)*edge*2.);
  vec3 foil=(rainbow*(0.18+0.82*spec)*pedge*(0.55+0.45*broad) + sp*mix(vec3(1.),rainbow,0.5*uSat))*inkVis*edgeF*lightCol;
  vec3 col=img;
  if(uBlend==0){
    /* holographic film, seen through the ink. A wide spectral gradient lies across the card and slides as the eye and the lamp move; a second grating, crossed, keeps it from being plain stripes.
       A luminous pillar runs through the lamp across the grooves, white at its heart. Each cell of the pattern has its own groove direction: it shifts the hue a little and, above all,
       decides when the cell flashes. The film tints the artwork (a silver base, more coloured in the pillar) and its own light is added by colour dodge: blacks stay black, light inks burn
       into colour, dark inks take a coloured sheen */
    vec2 dl=Lp.xy-pc; vec2 vw=vec2(sin(uTilt.x), sin(uTilt.y))*1.5+dl*0.55;
    float th=(uPattern==1?uAngle:phase*3.14159)+0.6; vec2 gd=vec2(cos(th),sin(th));
    vec2 gm=vec2(cos(uAngle+0.6), sin(uAngle+0.6)); vec2 gx=vec2(-gm.y,gm.x);
    float cell=uPattern==1?0.:1.;
    float s1=dot(pc,gm)*(0.32+0.42*uBands)+dot(vw,gm)*0.85+(dot(vw,gd)-dot(vw,gm))*0.22*cell+dot(N.xy,gd)*0.36+phase*0.12*cell+uHueShift;
    float s2=dot(pc,gx)*(0.22+0.3*uBands)-dot(vw,gx)*0.6+phase*0.3*cell+0.31;
    vec3 c1=uPalette==0?hueRGB(s1):palette(s1); vec3 c2=uPalette==0?hueRGB(s2+0.5):palette(s2+0.4);
    vec3 dif=mix(c1,c2,0.24); dif=mix(vec3(1.),dif,0.82); dif*=mix(1.,0.74/max(lum(dif),0.22),0.55); dif=mix(vec3(lum(dif)),dif,min(uSat*1.1,1.5));
    float dg=dot(pc-Lp.xy,gm); float pil=exp(-pow(dg*1.5,2.));
    /* thinner streaks run beside the pillar, as on a film that is not perfectly flat */
    float strk=exp(-pow((dg-0.34)*6.,2.))*0.55+exp(-pow((dg+0.46)*8.,2.))*0.4+exp(-pow((dg-0.78)*11.,2.))*0.3;
    float near=1./(1.+1.5*mix(1.,0.25,uLightSoft)*dot(dl,dl));
    float flash=mix(1., 0.86+0.7*pow(abs(dot(normalize(vw+vec2(1e-3)),gd)),2.), cell);
#ifdef HAS_DERIV
    float cpx=1./max(fwidth(pc.y),1e-5); float ml=1.-0.12*smoothstep(300.,640.,cpx)*(0.5+0.5*sin(dot(pc,gm)*470.));
#else
    float ml=1.;
#endif
    vec3 spk=(glitter(cuv,H,150.,0.)+glitter(cuv,H,95.,2.)+glitter(cuv,H,46.,5.)*1.3)*uSparkle;
    float k=clamp(uFoilAmt,0.,1.);
    float cAmt=clamp((0.2+0.34*pil)*min(uSat,1.4),0.,0.8);
    vec3 tint=mix(vec3(0.86,0.88,0.92),dif,cAmt);
    float bright=(0.92+(0.3*pil+0.16*strk)*(0.35+0.65*near)+0.42*spec)*mix(1.,flash,0.6)*mix(1.,pedge,0.3)*ml;
    vec3 flm=img*tint*bright;
    vec3 glow=dif*(0.05+(0.36*pil+0.22*strk)*flash)*(0.3+0.7*near)*pedge*edgeF;
    vec3 hv=(glow+spk*(0.6+0.5*dif))*lightCol*mix(0.55+0.5*lum(img),1.,uInk);
    vec3 film=min(flm/max(1.-hv*0.62,vec3(0.25)),vec3(1.6))+hv*0.34+lightCol*pow(pil,5.)*near*0.14;
    foil=(dif*(0.3+0.7*pil)*flash*pedge+spk)*edgeF*lightCol;
    col=mix(img,film,k)+hv*max(uFoilAmt-1.,0.)*0.7;
  }
  else if(uBlend==2){ float Li=lum(img);
    /* metal foil. The drawing is pressed into it: its lines and shading stay readable and catch the light, instead of a flat coloured shape */
    vec3 Nm=normalize(vec3(n-(uReliefSrc==0?(gH*5.+gE*1.5)*rz:vec2(0.)),1.)); vec3 e=env(reflect(-V,Nm)); float nh=max(dot(Nm,H),0.);
    float tone=mix(mix(0.2,1.05,smoothstep(0.02,0.95,Li)), mix(0.42,1.05,smoothstep(0.02,0.9,Li)), uInk);
    vec3 lit=uTint*tone*(0.36+0.5*min(e,vec3(1.2))+0.75*mix(1.,0.42,uLightSoft)*ggx(nh,mix(0.42,0.85,uLightSoft)))+mix(vec3(1.),uTint,0.5)*(ggx(nh,mix(0.16,0.5,uLightSoft))*0.55*mix(1.,0.55,uLightSoft)+spec*0.2)*pedge*edgeF*lightCol+rainbow*spec*uSat*0.5+sp;
    col=mix(img, lit, clamp(uFoilAmt,0.,1.)); }
  else if(uBlend==3){ float Li=lum(img); col=mix(img, rainbow*mix(0.25,1.25,Li)*pedge, clamp(uFoilAmt,0.,1.))+sp+vec3(spec)*0.25; }
  else if(uBlend==7){ vec3 veil=mix(img, rainbow, 0.35*clamp(uFoilAmt,0.,1.)*(0.4+0.6*broad)*inkVis); col=veil+vec3(spec)*0.35*pedge*lightCol*inkVis+sp; }
  else col=img;
  col=col*(1.+relief)*(1.-cav*0.6)+max(relief,0.)*0.12;
  col=mix(img, col, m*uIntensity);
  float maAcc=0.;
  if(uAccentOn>0.5){
    float ma=maskFor(uAccentMask, uAccentInvert, uv, raw, ph)*clamp(uAccentAmt,0.,1.)*uIntensity*mix(1., m, uAccentWithin); maAcc=ma;
    vec2 na=(-gH*14.+gE*4.)*uAccentRelief+(hash22(floor(cuv*vec2(uAspect,1.)*320.))-.5)*0.1;
    vec3 N2=normalize(vec3(na,1.)); float sp2=pow(max(dot(N2,H),0.),70.); vec3 e2=env(reflect(-V,N2)); float Li=lum(img);
    float rel2=clamp((dot(N2,L)-dot(N0,L))*uAccentRelief*0.8,-0.5,0.6);
    vec3 acc;
    if(uAccentType<=4){ acc=uAccentTint*mix(0.5,1.0,pow(Li,0.8))*(0.3+0.65*e2)*(1.+rel2)+vec3(sp2)*0.5*lightCol; }
    else if(uAccentType>=9 && uAccentType<=15){ vec3 tb=uAccentTint*mix(0.35,1.05,pow(Li,0.7)); acc=tb*(0.45+0.75*e2)*(1.+rel2)+vec3(pow(max(dot(N2,H),0.),120.))*0.85*lightCol+rainbow*sp2*0.15; }
    else if(uAccentType==5){ vec3 hv2=L+V; vec2 ht2=hv2.xy-N2.xy*dot(hv2,N2); float th2=phase*3.14159+0.6; vec3 rb=grating(abs(dot(ht2,vec2(cos(th2),sin(th2))))*1.7); acc=(img*vec3(0.82,0.84,0.88)*(0.5+0.42*e2)+rb*1.4*mix(img,vec3(1.),0.35)+vec3(sp2)*0.3*lightCol)*(1.+rel2); }
    else if(uAccentType==6){ acc=img*(1.+rel2*0.5)+vec3(pow(max(dot(N2,H),0.),120.))*0.9*lightCol; }
    else if(uAccentType==7){ acc=img; }
    else if(uAccentType==16){ acc=img+vec3(sp2)*0.04; }
    else if(uAccentType==17){ acc=mix(img, vec3(0.93,0.95,0.86), 0.16)+vec3(sp2)*0.05; }
    else if(uAccentType==18){ float heat=exp(-dot(pc-(uPointer-0.5)*vec2(uAspect,1.), pc-(uPointer-0.5)*vec2(uAspect,1.))*9.); acc=mix(uAccentTint*(0.75+0.25*Li)+vec3(sp2)*0.12, img, smoothstep(0.25,0.7,heat)); }
    else { vec3 glow=uAccentTint; acc=img+glow*(0.6+0.4*broad)*1.2; }
    col=mix(col, acc, ma);
  }
  if(uView==2){ vec3 f=(uBlend==2||uBlend==3)?col:foil*uFoilAmt*(1.+relief)+relief*0.3; gl_FragColor=vec4(f*m*uIntensity*a, a); return; }
  /* a thick gloss varnish deepens the colours under it and carries a broad reflection of the lamp */
  float wet=clamp(uGlare-0.75,0.,1.)*m*uIntensity; if(wet>0.){ vec3 dc=pow(max(col,0.),vec3(1.2))*1.05; dc=mix(vec3(lum(dc)),dc,1.2); col=mix(col,dc,wet)+lightCol*ggx(NdH,0.5)*0.16*wet; }
  float g=(ggx(max(dot(N,H),0.), mix(0.07,0.36,uLightSoft))*0.3*mix(1.,0.5,uLightSoft)+ggx(n0h, mix(0.17,0.55,uLightSoft))*0.07)*(1.+1.4*pow(1.-NdV,4.));
  float fres=pow(1.-NdV,3.)*0.15;
  float sheenR=(ggx(NdH,0.34)-ggx(n0h,0.34))*0.2*min(uGlare,1.)*min(1.,uRelief)*(uReliefSrc==0?1.:0.45); sheenR=sheenR>0.?min(sheenR,0.2):sheenR*0.4;
  col+=lightCol*(g*uGlare*mix(1.,m,0.7)+fres*uGlare*0.5+sheenR*m);
  if(uEnv>0){
    vec3 emit=vec3(0.);
    if(uEnv==1){ float wl=lum(img); col=col*vec3(0.15,0.09,0.40)+vec3(0.03,0.05,0.22)*wl*wl*wl; if(uAccentType==16||uAccentType==8) emit=uAccentTint*maAcc*1.25; else if(uAccentType==17) emit=uAccentTint*maAcc*0.55; }
    else { col*=vec3(0.03,0.035,0.05); if(uAccentType==17) emit=uAccentTint*maAcc*1.05; }
    col+=emit*(0.9+0.1*sin(uSeed*3.+uv.y*40.));
  }
  vec3 outc=clamp(softclip(col),0.,1.)+(hash21(gl_FragCoord.xy)-0.5)/255.;
  float az=a*mix(1., m, uClipZone);
  gl_FragColor=vec4(outc*az, az);
}`;
