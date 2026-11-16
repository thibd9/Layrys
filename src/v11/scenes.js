
  /* ================= Product previews (ported from the Prisme reference): booster, display, sleeve, case ================= */
  const PrismScenes = (() => {

  const W = 900;
  const H = 700;
  const transparent = 'rgba(0,0,0,0)';

  function surface(width, height) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    return c;
  }

  function gradient(ctx, x1, y1, x2, y2, stops) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const [position, color] of stops) g.addColorStop(position, color);
    return g;
  }

  function rounded(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  }

  function polygon(ctx, points, fill, stroke, weight = 1) {
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(...points[i]);
      else ctx.lineTo(...points[i]);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = weight; ctx.stroke(); }
  }

  function line(ctx, x1, y1, x2, y2, color, width = 1) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }

  function seedRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value = (Math.imul(1664525, value) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function imageSize(source) {
    const w = source?.naturalWidth ?? source?.width;
    const h = source?.naturalHeight ?? source?.height;
    return w > 0 && h > 0 ? {w,h} : null;
  }

  function printPanel(ctx, face, art, x, y, w, h, contain = false) {
    // The prepress editor has already cropped, oriented or padded its exact panel.
    if (imageSize(face)) { ctx.drawImage(face,x,y,w,h); return; }
    const source = imageSize(art);
    if (!source) return;
    const factor = contain ? Math.min(w/source.w,h/source.h) : Math.max(w/source.w,h/source.h);
    const imageW = source.w*factor, imageH = source.h*factor;
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    ctx.drawImage(art,x+(w-imageW)/2,y+(h-imageH)/2,imageW,imageH); ctx.restore();
  }

  function groundShadow(ctx, x, y, rx, ry, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(1,3,6,${alpha})`); g.addColorStop(.62, `rgba(1,3,6,${alpha * .57})`);
    g.addColorStop(1, transparent);
    ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }

  function foilInk(ctx, x, y, w, h) {
    return gradient(ctx, x, y, x + w, y + h, [
      [0, '#93713b'], [.16, '#faf1bd'], [.31, '#c9aa64'], [.48, '#9d7f50'],
      [.62, '#f8edc6'], [.82, '#b49c72'], [1, '#f0e5c1']
    ]);
  }

  // An opaque printed wrapper is reused on every individual pack in the display.
  function makePack(art, paper, scale, face, back = false) {
    const pw = 286, ph = 464;
    const wrapper = surface(Math.ceil(pw * scale), Math.ceil(ph * scale));
    const ctx = wrapper.getContext('2d'); ctx.scale(wrapper.width / pw, wrapper.height / ph);
    const rand = seedRandom(paper ? 9 : 48);
    ctx.save();
    const tooth = 5.5;
    ctx.beginPath(); ctx.moveTo(2, 2);
    for (let x = 2; x < pw - 3; x += tooth) {
      ctx.lineTo(x + tooth * .5, 4.2); ctx.lineTo(Math.min(x + tooth, pw - 2), 1);
    }
    ctx.lineTo(pw - 1, 22); ctx.bezierCurveTo(pw - 7, 56, pw - 5, 88, pw - 5, 118);
    ctx.lineTo(pw - 4, 341); ctx.bezierCurveTo(pw - 3, 389, pw - 6, 416, pw, 437);
    ctx.lineTo(pw - 1, ph - 2);
    for (let x = pw - 2; x > 2; x -= tooth) {
      ctx.lineTo(x - tooth * .5, ph - 4.6); ctx.lineTo(Math.max(1, x - tooth), ph - 1);
    }
    ctx.lineTo(0, 439); ctx.bezierCurveTo(6, 419, 5, 382, 5, 337);
    ctx.lineTo(6, 114); ctx.bezierCurveTo(6, 70, 6, 49, 1, 25); ctx.closePath();
    ctx.clip();

    ctx.fillStyle = paper ? '#27302c' : '#20262d'; ctx.fillRect(0, 0, pw, ph);
    printPanel(ctx,face,art,5,26,pw-10,ph-52,true);
    if (back) {
      // Overlapping fin seal. Only the reverse of a flow-wrapped pack has this fold.
      const fin = pw*.5;
      ctx.fillStyle = gradient(ctx,fin-1,0,fin+12,0,[[0,'rgba(8,12,15,.34)'],[.15,'rgba(220,228,221,.4)'],[.3,'rgba(95,103,104,.22)'],[.86,'rgba(66,73,72,.2)'],[1,'rgba(233,237,223,.42)']]);
      ctx.fillRect(fin-1,26,13,ph-52);
    }

    // Directional folds hug the edges while leaving the printed illustration legible.
    ctx.fillStyle = gradient(ctx, 0, 0, pw, 0, [
      [0,'rgba(0,0,0,.74)'],[.026,'rgba(238,240,232,.46)'],[.04,'rgba(0,0,0,.36)'],
      [.085,'rgba(0,0,0,.25)'],[.10,'rgba(244,247,236,.13)'],[.26,'rgba(243,246,239,.035)'],
      [.42,transparent],[.73,transparent],[.87,'rgba(0,0,0,.16)'],[.916,'rgba(241,248,246,.20)'],
      [.951,'rgba(0,0,0,.28)'],[.986,'rgba(201,212,206,.38)'],[1,'rgba(0,0,0,.43)']
    ]);
    ctx.save(); ctx.globalAlpha = paper ? .52 : 1; ctx.fillRect(0, 22, pw, ph - 43);
    for (const side of [0, 1]) {
      for (let i = 0; i < 20; i++) {
        const startY = 35 + rand() * (ph - 72);
        const endY = startY + (rand() - .5) * 95;
        const spread = 5 + rand() * (i % 8 === 0 ? 53 : 20);
        const edge = side ? pw - 2 : 2, end = side ? pw - spread : spread;
        const peak = edge + (end - edge) * .32;
        polygon(ctx, [[edge,startY],[end,endY],[peak,startY + 2.3]], `rgba(245,251,246,${.025 + rand() * .115})`);
        polygon(ctx, [[edge,startY+2],[end,endY],[peak,startY + 5]], `rgba(0,3,6,${.045 + rand() * .125})`);
      }
    }
    if (!paper) {
      ctx.fillStyle = gradient(ctx, 35, 0, 210, 75, [[0,transparent],[.50,transparent],[.545,'rgba(205,255,233,.115)'],[.572,'rgba(240,232,192,.07)'],[.62,transparent],[1,transparent]]);
      ctx.fillRect(0, 25, pw, ph - 50);
    }
    ctx.restore();

    for (let i = 0; i < (paper ? 1400 : 280); i++) {
      const px = rand() * pw, py = rand() * ph;
      ctx.fillStyle = i % 2 ? 'rgba(237,230,211,.12)' : 'rgba(5,8,13,.1)';
      ctx.fillRect(px, py, paper ? .75 : .45, paper ? .65 : .45);
    }

    for (const sy of [0, ph - 26]) {
      const seal = paper ? [[0,'#877359'],[.22,'#c1ac88'],[.54,'#ac9477'],[.9,'#bea987'],[1,'#8d795d']]
        : [[0,'#62676c'],[.07,'#ced2cb'],[.18,'#777e82'],[.32,'#a2a89e'],[.49,'#555d5e'],[.71,'#9ea5a2'],[.93,'#d1d4c8'],[1,'#66706f']];
      ctx.fillStyle = gradient(ctx, 0, 0, pw, 0, seal); ctx.fillRect(0, sy, pw, 26);
      for (let sx = 1; sx < pw; sx += paper ? 4.2 : 3.1) {
        line(ctx, sx, sy + 1, sx + .1, sy + 25, paper ? 'rgba(67,44,23,.20)' : 'rgba(20,28,32,.51)', 1.1);
        line(ctx, sx + .9, sy + 1, sx + 1, sy + 25, paper ? 'rgba(247,246,222,.15)' : 'rgba(248,251,241,.42)', .78);
      }
      for (const n of [6, 18, 22]) line(ctx, 0, sy + n, pw, sy + n + .1, 'rgba(20,31,33,.21)', .9);
      line(ctx, 0, sy ? sy : sy + 26, pw, sy ? sy : sy + 26, 'rgba(198,208,199,.65)', 1.25);
    }
    ctx.restore();
    return wrapper;
  }

  function drawBooster(ctx, art, opts, density) {
    const back = opts.packSide === 'back';
    const pack = makePack(art,opts.variant === 'papier',density,back ? opts.faces?.back : opts.faces?.front,back);
    groundShadow(ctx, 466, 589, 189, 28, .55);
    ctx.save(); ctx.translate(454, 349); ctx.rotate(-.075);
    ctx.shadowColor = 'rgba(0,1,6,.58)'; ctx.shadowBlur = 30; ctx.shadowOffsetX = 13; ctx.shadowOffsetY = 22;
    ctx.drawImage(pack, -143, -232, 286, 464); ctx.restore();
  }

  function drawDisplay(ctx, art, opts, density) {
    const small = String(opts.variant) === '12';
    const count = small ? 12 : 24, cols = small ? 2 : 3, rows = count / cols;
    const w = small ? 333 : 421, d = small ? 135 : 164;
    const x0 = (W - w - .57 * d) / 2, y0 = 535;
    const p = (x, depth, height) => [x0 + x + depth * .57, y0 + x * .12 - depth * .58 - height];
    const panels = opts.faces || {};
    const pack = makePack(art,false,density,opts.boosterFaces?.front);
    const packWidth = (w - 26 - (cols - 1) * 4) / cols;
    const packHeight = packWidth * 1.61;
    const headerImage = imageSize(panels.header);
    const headerPrint = headerImage ? Math.min(162,Math.max(74,w*headerImage.h/headerImage.w)) : 91;
    const headerHeight = packHeight + headerPrint;
    groundShadow(ctx, 456, y0 + 48, w * .65 + 36, 37, .68);
    // A tall reverse panel, with its top folded into an arched retail header.
    ctx.save(); ctx.translate(...p(0, d, headerHeight)); ctx.transform(1, .12, 0, 1, 0, 0);
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(0, 9, 11, 0, 27, 0);
    ctx.lineTo(w - 25, 0); ctx.bezierCurveTo(w - 9, 0, w, 9, w, 25); ctx.lineTo(w, headerHeight); ctx.lineTo(0, headerHeight); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#18282b'; ctx.fillRect(0,0,w,headerHeight);
    printPanel(ctx,panels.header,art,0,0,w,headerPrint);
    ctx.fillStyle = gradient(ctx,0,0,0,headerPrint,[[0,'rgba(8,17,20,.08)'],[.7,'rgba(8,17,20,.09)'],[1,'rgba(1,8,12,.28)']]); ctx.fillRect(0,0,w,headerPrint);
    ctx.restore();
    // Interior and far wall are underneath the back row of individually spaced packs.
    polygon(ctx,[p(0,0,0),p(w,0,0),p(w,d,0),p(0,d,0)],'#152024');
    polygon(ctx,[p(0,0,0),p(0,d,0),p(0,d,148),p(0,0,71)],'#293537','#858479');

    for (let row = rows - 1; row >= 0; row--) {
      const depth = 7 + (d - 20) * row / Math.max(1, rows - 1);
      for (let col = 0; col < cols; col++) {
        const x = 12 + col * (packWidth + 4);
        const tilt = ((row * 3 + col * 7) % 5) - 2;
        const origin = p(x, depth, packHeight + row * .35);
        ctx.save(); ctx.translate(origin[0] + 5, origin[1]);
        ctx.transform(1, .12, (-5 + tilt) / packHeight, 1, 0, 0);
        ctx.drawImage(pack, 0, 0, packWidth, packHeight);
        if (row) {
          ctx.fillStyle = `rgba(3,10,15,${.05 + row / rows * .10})`;
          ctx.fillRect(1.5,2,packWidth-3,packHeight-4);
        }
        ctx.restore();
      }
    }

    // The carton side rises towards the header, then drops away at the open front.
    ctx.save();
    polygon(ctx,[p(w,0,0),p(w,d,0),p(w,d,152),p(w,32,84),p(w,0,71)],'#283639','#89918a',1.2);
    ctx.clip(); ctx.translate(...p(w,0,152)); ctx.transform(.57,-.58,0,1,0,0);
    printPanel(ctx,panels.right,art,0,0,d,152);
    ctx.fillStyle = gradient(ctx,0,0,d,0,[[0,'rgba(3,9,12,.24)'],[.32,'rgba(4,11,14,.3)'],[1,'rgba(4,11,14,.43)']]);ctx.fillRect(0,0,d,152);ctx.restore();
    ctx.save(); ctx.translate(...p(0,0,76)); ctx.transform(1,.12,0,1,0,0);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w*.17,0); ctx.quadraticCurveTo(w*.22,0,w*.25,12);
    ctx.quadraticCurveTo(w*.28,19,w*.33,19); ctx.lineTo(w*.67,19); ctx.quadraticCurveTo(w*.72,19,w*.75,12);
    ctx.quadraticCurveTo(w*.79,0,w*.83,0); ctx.lineTo(w,0); ctx.lineTo(w,76); ctx.lineTo(0,76); ctx.closePath();
    ctx.fillStyle = gradient(ctx,0,0,w,76,[[0,'#263639'],[.38,'#344447'],[.69,'#283b3d'],[1,'#1d2c30']]); ctx.fill();
    ctx.strokeStyle = '#8a958a'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.clip();
    printPanel(ctx,panels.front,art,0,0,w,76);
    ctx.fillStyle = gradient(ctx,0,0,0,76,[[0,'rgba(16,22,23,.07)'],[.87,'rgba(13,18,19,.08)'],[1,'rgba(8,11,12,.22)']]); ctx.fillRect(0,0,w,76);ctx.restore();
  }

  function fitCard(art, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / art.width, maxHeight / art.height);
    return { w: art.width * ratio, h: art.height * ratio };
  }

  function drawCard(ctx, art, w, h, x, y) {
    ctx.save(); rounded(ctx,x,y,w,h,Math.min(w,h)*.042); ctx.clip(); ctx.drawImage(art,x,y,w,h); ctx.restore();
  }

  function drawSleeve(ctx, art, opts) {
    const matte = opts.variant === 'mat';
    const {w,h} = fitCard(art,354,495);
    const sw = w+20, sh = h+31, sx = -sw/2, sy = -sh/2;
    groundShadow(ctx,462,H/2+sh/2+18,sw*.55,25,.55);
    ctx.save(); ctx.translate(W/2,H/2); ctx.rotate(-.044);
    ctx.shadowColor='rgba(0,2,5,.57)'; ctx.shadowBlur=22; ctx.shadowOffsetX=10; ctx.shadowOffsetY=15;
    rounded(ctx,sx,sy+2,sw,sh,5); ctx.fillStyle=matte?'#293538':'rgba(155,177,183,.22)'; ctx.fill();
    ctx.shadowColor=transparent;
    if (matte) {
      const rand = seedRandom(12);
      for(let i=0;i<1250;i++) { ctx.fillStyle=i%2?'rgba(233,242,231,.10)':'rgba(12,16,19,.11)'; ctx.fillRect(sx+2+rand()*(sw-4),sy+2+rand()*(sh-4),.85,.62); }
    }
    drawCard(ctx,art,w,h,-w/2,sy+17);
    rounded(ctx,sx+1,sy+7,sw-2,sh-6,4); ctx.strokeStyle='rgba(216,236,239,.58)'; ctx.lineWidth=1.2; ctx.stroke();
    ctx.fillStyle=gradient(ctx,sx,sy,sx+sw,sy+sh,[[0,'rgba(225,240,241,.17)'],[.15,'rgba(236,246,245,.025)'],[.36,'rgba(232,246,245,.05)'],[.43,'rgba(225,244,241,.18)'],[.465,'rgba(225,244,241,.08)'],[.47,'rgba(238,245,245,.035)'],[.54,transparent],[.85,transparent],[1,'rgba(226,242,241,.12)']]);
    ctx.save(); ctx.globalAlpha=matte?.53:1; ctx.fill(); ctx.restore();
    for (const side of [sx+3,sx+sw-3]) {
      line(ctx,side,sy+10,side,sy+sh-4,'rgba(222,237,239,.50)',.9);
      line(ctx,side+1.3,sy+13,side+1.3,sy+sh-4,'rgba(19,38,46,.30)',.65);
    }
    ctx.beginPath(); ctx.moveTo(sx,sy+6); ctx.quadraticCurveTo(sx+sw*.49,sy+8,sx+sw,sy+5);
    ctx.strokeStyle='rgba(233,244,243,.8)'; ctx.lineWidth=1.35; ctx.stroke();
    line(ctx,sx+3,sy+1,sx+sw-4,sy,'rgba(226,238,242,.54)',1);
    line(ctx,sx+3,sy+sh-2,sx+sw-3,sy+sh-2,'rgba(239,242,236,.66)',1.35);
    ctx.restore();
  }

  function drawCase(ctx, art, opts) {
    const smoked = opts.variant === 'fumé' || opts.variant === 'fume';
    const {w,h}=fitCard(art,326,459), cw=w+57, ch=h+83, left=-cw/2, top=-ch/2;
    groundShadow(ctx,469,H/2+ch/2+21,cw*.56,29,.64);
    ctx.save(); ctx.translate(W/2,H/2); ctx.rotate(-.045);
    ctx.shadowColor='rgba(0,2,6,.63)'; ctx.shadowBlur=28; ctx.shadowOffsetX=13; ctx.shadowOffsetY=16;
    rounded(ctx,left+4,top+6,cw,ch,15); ctx.fillStyle=smoked?'rgba(41,48,55,.86)':'rgba(124,150,157,.52)'; ctx.fill();
    ctx.shadowColor=transparent;
    rounded(ctx,left,top,cw,ch,15);
    ctx.fillStyle=gradient(ctx,left,top,left+cw,top+ch,[[0,smoked?'rgba(136,151,153,.85)':'rgba(229,242,239,.86)'],[.13,smoked?'rgba(52,65,71,.88)':'rgba(130,155,160,.54)'],[.31,smoked?'rgba(69,83,91,.59)':'rgba(190,215,219,.52)'],[.69,smoked?'rgba(36,47,55,.8)':'rgba(97,120,128,.53)'],[.88,smoked?'rgba(71,84,89,.68)':'rgba(202,225,223,.64)'],[1,'rgba(115,134,139,.78)']]); ctx.fill();
    ctx.strokeStyle='rgba(224,241,242,.81)'; ctx.lineWidth=1.65; ctx.stroke();
    rounded(ctx,left+4,top+4,cw-8,ch-8,12); ctx.strokeStyle='rgba(42,59,64,.65)'; ctx.lineWidth=2; ctx.stroke();
    rounded(ctx,left+6,top+6,cw-12,ch-12,11); ctx.strokeStyle='rgba(236,246,245,.50)'; ctx.lineWidth=1; ctx.stroke();
    const cx=-w/2, cy=top+52;
    rounded(ctx,cx-7,cy-7,w+14,h+14,Math.min(w,h)*.042+5);
    ctx.fillStyle='rgba(20,35,42,.54)'; ctx.fill(); ctx.strokeStyle='rgba(236,246,245,.58)'; ctx.lineWidth=1.5; ctx.stroke();
    rounded(ctx,cx-4,cy-4,w+8,h+8,Math.min(w,h)*.042+3); ctx.strokeStyle='rgba(17,33,40,.76)'; ctx.lineWidth=2; ctx.stroke();
    drawCard(ctx,art,w,h,cx,cy);
    // Corner recesses and the two bottom hinge tabs are machined into the base.
    for (const mx of [cx-3,cx+w+3]) for (const my of [cy-3,cy+h+3]) {
      ctx.beginPath(); ctx.arc(mx,my,3,0,Math.PI*2); ctx.fillStyle='rgba(85,108,115,.65)'; ctx.fill(); ctx.strokeStyle='rgba(234,246,244,.49)'; ctx.lineWidth=.8; ctx.stroke();
    }
    for (const mx of [-cw*.22,cw*.22]) {
      rounded(ctx,mx-16,top+ch-13,32,6,2); ctx.fillStyle='rgba(80,97,102,.64)'; ctx.fill(); ctx.strokeStyle='rgba(239,245,239,.46)'; ctx.lineWidth=.85; ctx.stroke();
    }
    const my=top+25;
    ctx.beginPath(); ctx.arc(0,my,11,0,Math.PI*2); ctx.fillStyle='rgba(49,60,61,.8)'; ctx.fill();
    ctx.beginPath(); ctx.arc(0,my,8.6,0,Math.PI*2); ctx.fillStyle=foilInk(ctx,-8,my-8,18,18); ctx.fill();
    ctx.strokeStyle='rgba(247,239,203,.74)'; ctx.lineWidth=1; ctx.stroke();
    line(ctx,-4,my-2,4,my-3,'rgba(254,246,210,.55)',.7);
    rounded(ctx,left+2,top+2,cw-4,ch-4,14); ctx.clip();
    ctx.fillStyle=gradient(ctx,left,top,left+cw,top+ch*.63,[[0,'rgba(231,245,247,.14)'],[.06,transparent],[.35,transparent],[.39,'rgba(222,238,239,.08)'],[.43,'rgba(246,255,250,.13)'],[.445,'rgba(245,255,255,.06)'],[.49,transparent],[.80,transparent],[.98,'rgba(236,247,246,.14)'],[1,transparent]]); ctx.fillRect(left,top,cw,ch);
    ctx.restore();
  }

  function drawFan(ctx, art, opts) {
    const n = String(opts.variant) === '5' ? 5 : 3; const {w,h} = fitCard(art, 300, 420);
    groundShadow(ctx, W/2, H/2 + h/2 + 34, w*1.15, 28, .55);
    for (let i = 0; i < n; i++) {
      const a = (i - (n-1)/2) * (n === 5 ? .15 : .2);
      ctx.save(); ctx.translate(W/2, H/2 + h*.62); ctx.rotate(a); ctx.translate(0, -h*.62);
      ctx.shadowColor='rgba(0,2,6,.5)'; ctx.shadowBlur=18; ctx.shadowOffsetX=6; ctx.shadowOffsetY=10;
      rounded(ctx,-w/2,-h/2,w,h,w*.042); ctx.fillStyle='#111'; ctx.fill(); ctx.shadowColor=transparent;
      drawCard(ctx, art, w, h, -w/2, -h/2);
      rounded(ctx,-w/2,-h/2,w,h,w*.042); ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=1; ctx.stroke(); ctx.restore();
    }
  }
  function drawStack(ctx, art, opts) {
    const count = Math.max(1, Math.min(120, Number(opts.count) || 10)); const {w,h} = fitCard(art, 330, 440);
    const t = w / 63 * 0.33; const dx = t * .42, dy = t * .95; const dark = opts.variant === 'noir';
    const x0 = W/2 - w/2 - count*dx/2, y0 = H/2 - h/2 + count*dy/2;
    groundShadow(ctx, W/2 + 12, y0 + h + 16, w*.8, 26, .6);
    ctx.save(); ctx.translate(x0, y0);
    for (let i = count-1; i > 0; i--) {
      const ox = i*dx, oy = -i*dy;
      ctx.fillStyle = i % 2 ? (dark ? '#1b1b20' : '#ebe6da') : (dark ? '#2a2a30' : '#d9d3c5');
      rounded(ctx, ox, oy, w, h, w*.042); ctx.fill(); ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=.5; ctx.stroke();
    }
    const ox = count*dx, oy = -count*dy;
    ctx.shadowColor='rgba(0,2,6,.35)'; ctx.shadowBlur=10; ctx.shadowOffsetY=4; rounded(ctx,ox,oy,w,h,w*.042); ctx.fillStyle='#111'; ctx.fill(); ctx.shadowColor=transparent;
    drawCard(ctx, art, w, h, ox, oy); ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.65)'; ctx.font='600 15px Inter, Helvetica, sans-serif'; ctx.textAlign='center';
    ctx.fillText(count+' cartes · '+(count*0.33).toFixed(2).replace('.',',')+' mm d’épaisseur', W/2, H-36); ctx.textAlign='left';
  }
  function drawFramed(ctx, art, opts) {
    const wood = opts.variant === 'bois'; const {w,h} = fitCard(art, 280, 390); const mat = 42, fr = 24;
    const fw = w + 2*mat + 2*fr, fh = h + 2*mat + 2*fr; const x = (W-fw)/2, y = (H-fh)/2;
    ctx.fillStyle = gradient(ctx,0,0,0,H,[[0,'#2c2f35'],[1,'#17191d']]); ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.shadowColor='rgba(0,0,0,.7)'; ctx.shadowBlur=40; ctx.shadowOffsetY=18; ctx.fillStyle = wood ? '#4a2e1b' : '#141414'; ctx.fillRect(x,y,fw,fh); ctx.restore();
    ctx.fillStyle = wood ? gradient(ctx,x,y,x+fw,y+fh,[[0,'#6b4426'],[.5,'#8a5a33'],[1,'#4a2e1b']]) : gradient(ctx,x,y,x+fw,y,[[0,'#2b2b2b'],[.5,'#0f0f0f'],[1,'#2b2b2b']]); ctx.fillRect(x,y,fw,fh);
    ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(x,y,fw,2); ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(x,y+fh-3,fw,3);
    ctx.fillStyle='#f3efe6'; ctx.fillRect(x+fr,y+fr,fw-2*fr,fh-2*fr);
    ctx.fillStyle='rgba(0,0,0,.22)'; ctx.fillRect(x+fr+mat-1.5,y+fr+mat-1.5,w+3,h+3);
    drawCard(ctx, art, w, h, x+fr+mat, y+fr+mat);
    ctx.fillStyle = gradient(ctx,x,y,x+fw,y+fh,[[0,'rgba(255,255,255,.13)'],[.4,'rgba(255,255,255,0)'],[1,'rgba(0,0,0,.12)']]); ctx.fillRect(x+fr+mat,y+fr+mat,w,h);
  }
  function drawTable(ctx, art, opts) {
    const slate = opts.variant === 'ardoise'; const {w,h} = fitCard(art, 330, 460);
    ctx.fillStyle = slate ? gradient(ctx,0,0,0,H,[[0,'#30343a'],[1,'#15181b']]) : gradient(ctx,0,0,0,H,[[0,'#6d4b2f'],[.5,'#5a3d25'],[1,'#3a2617']]); ctx.fillRect(0,0,W,H);
    if (!slate) { ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.lineWidth=1; for (let i=0;i<62;i++){ ctx.beginPath(); ctx.moveTo(0, 10+i*12+Math.sin(i)*4); ctx.bezierCurveTo(W*.3, 14+i*12, W*.6, 6+i*12, W, 10+i*12+Math.cos(i)*5); ctx.stroke(); } }
    ctx.save(); ctx.translate(W/2, H/2+16); ctx.transform(1, 0, -0.3, 0.8, 0, 0);
    ctx.shadowColor='rgba(0,0,0,.65)'; ctx.shadowBlur=30; ctx.shadowOffsetX=18; ctx.shadowOffsetY=22; rounded(ctx,-w/2,-h/2,w,h,w*.042); ctx.fillStyle='#111'; ctx.fill(); ctx.shadowColor=transparent;
    drawCard(ctx, art, w, h, -w/2, -h/2);
    rounded(ctx,-w/2,-h/2,w,h,w*.042); ctx.fillStyle = gradient(ctx,-w/2,-h/2,w/2,h/2,[[0,'rgba(255,255,255,.2)'],[.35,'rgba(255,255,255,.02)'],[1,'rgba(0,0,0,.15)']]); ctx.fill();
    ctx.restore();
  }

  function draw(canvas, cardCanvas, mode = 'card', opts = {}) {
    if (!canvas || !cardCanvas || !(cardCanvas.width > 0 && cardCanvas.height > 0)) return canvas;
    const width = Math.max(1,Math.round(Number(opts.width) || W));
    const height = Math.max(1,Math.round(Number(opts.height) || H));
    // Reuse is safe even when a caller passes its source canvas as the output target.
    let art = cardCanvas;
    if (canvas === cardCanvas) { art=surface(cardCanvas.width,cardCanvas.height); art.getContext('2d').drawImage(cardCanvas,0,0); }
    canvas.width=width; canvas.height=height;
    const ctx=canvas.getContext('2d'), scale=Math.min(width/W,height/H);
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    if (opts.background) {
      ctx.fillStyle='#19202c'; ctx.fillRect(0,0,width,height);
      const glow=ctx.createRadialGradient(width*.45,height*.28,0,width*.5,height*.45,Math.max(width,height)*.77);
      glow.addColorStop(0,'rgba(103,111,119,.33)'); glow.addColorStop(.68,'rgba(18,23,33,.35)'); glow.addColorStop(1,'rgba(3,5,11,.73)'); ctx.fillStyle=glow; ctx.fillRect(0,0,width,height);
      ctx.save(); ctx.strokeStyle='rgba(232,241,239,.016)'; ctx.lineWidth=Math.max(.5,scale*.55);
      const step=Math.max(2,3*scale);
      for(let x=0;x<width+height;x+=step) line(ctx,x,0,x-height,height,ctx.strokeStyle,ctx.lineWidth);
      ctx.restore();
    }
    ctx.setTransform(scale,0,0,scale,(width-W*scale)/2,(height-H*scale)/2);
    const density=Math.max(1, Math.min(4,scale*1.5));
    switch(mode) {
      case 'booster': drawBooster(ctx,art,opts,density); break;
      case 'display': drawDisplay(ctx,art,opts,density); break;
      case 'sleeve': drawSleeve(ctx,art,opts); break;
      case 'case': drawCase(ctx,art,opts); break;
      case 'fan': drawFan(ctx,art,opts); break;
      case 'stack': drawStack(ctx,art,opts); break;
      case 'frame': drawFramed(ctx,art,opts); break;
      case 'table': drawTable(ctx,art,opts); break;
      default: {
        const {w,h}=fitCard(art,410,530);
        ctx.shadowColor='rgba(0,2,6,.60)'; ctx.shadowBlur=22; ctx.shadowOffsetY=14;
        rounded(ctx,(W-w)/2,(H-h)/2,w,h,Math.min(w,h)*.042); ctx.fillStyle='rgba(16,22,27,.9)'; ctx.fill(); ctx.shadowColor=transparent;
        drawCard(ctx,art,w,h,(W-w)/2,(H-h)/2);
      }
    }
    ctx.setTransform(1,0,0,1,0,0);
    return canvas;
  }

    return { draw };
  })();

