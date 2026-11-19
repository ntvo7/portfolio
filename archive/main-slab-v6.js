(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const isMobile = () => matchMedia('(max-width:760px)').matches;

/* ================= STATE ================= */
const FAR = -9999;
const mouse = { x: fine ? innerWidth / 2 : FAR, y: fine ? innerHeight / 2 : FAR, sx: innerWidth / 2, sy: innerHeight / 2, vel: 0 };
let lastTouch = -1e9;
addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mouse.x = e.clientX; mouse.y = e.clientY; } }, { passive: true });
const touchPos = e => { const t = e.touches[0]; if (!t) return; mouse.x = t.clientX; mouse.y = t.clientY; lastTouch = performance.now(); };
addEventListener('touchstart', touchPos, { passive: true });
addEventListener('touchmove', touchPos, { passive: true });
addEventListener('touchend', () => { lastTouch = performance.now(); setTimeout(() => { if (!fine) { mouse.x = FAR; mouse.y = FAR; } }, 350); }, { passive: true });

/* ================= THEME (pearl / void) ================= */
const root = document.documentElement;
const isDark = () => root.getAttribute('data-theme') === 'dark';
(function theme() {
  const btn = $('#themeBtn'), label = $('#themeLabel'), meta = $('meta[name="theme-color"]');
  const sync = () => {
    if (label) label.textContent = isDark() ? 'Light' : 'Dark';
    if (meta) meta.setAttribute('content', isDark() ? '#0A0A0B' : '#F4F3F0');
  };
  sync();
  if (btn) btn.addEventListener('click', () => {
    if (isDark()) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('nv-theme', isDark() ? 'dark' : 'light'); } catch (e) {}
    sync();
    dispatchEvent(new Event('themechange'));
  });
})();

/* ================= MOBILE MENU ================= */
(function menu() {
  const btn = $('#menuBtn'), m = $('#menu');
  if (!btn) return;
  const b = document.body;
  const set = open => { b.classList.toggle('menu-open', open); btn.textContent = open ? 'Close' : 'Menu'; btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', () => set(!b.classList.contains('menu-open')));
  $$('a', m).forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
})();

/* ================= LOADER ================= */
const body = document.body;
(function loader() {
  const num = $('#ldNum'), word = $('#ldWord'), ld = $('#loader');
  const words = ['Idea', 'Sketch', 'Break it', 'Rebuild', 'Enter'];
  const dur = reduce ? 300 : 2600, t0 = performance.now();
  function step(now) {
    const p = clamp((now - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    num.textContent = String(Math.round(e * 100)).padStart(3, '0');
    word.textContent = words[Math.min(words.length - 1, Math.floor(p * words.length))];
    if (p < 1) requestAnimationFrame(step);
    else {
      ld.classList.add('done');
      body.classList.remove('loading');
      body.classList.add('ready');
      setTimeout(() => ld.remove(), 1500);
    }
  }
  requestAnimationFrame(step);
})();

/* ================= HERO TITLE SPLIT + MAGNET ================= */
let idx = 0;
$$('[data-split]').forEach(el => {
  const txt = el.textContent; el.textContent = '';
  [...txt].forEach(c => {
    const a = document.createElement('span'); a.className = 'ch'; a.style.setProperty('--i', idx++);
    const b = document.createElement('span'); b.className = 'chi'; b.textContent = c;
    a.appendChild(b); el.appendChild(a);
  });
});
const chis = $$('.chi');
function magnet() {
  chis.forEach(el => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = mouse.x - cx, dy = mouse.y - cy, d = Math.hypot(dx, dy) || 1, R = 280;
    if (d < R) {
      const f = 1 - d / R;
      el.style.transform = `translate(${(-dx / d * f * 50).toFixed(1)}px,${(-dy / d * f * 50).toFixed(1)}px) rotate(${(dx / R * f * 14).toFixed(1)}deg)`;
    } else el.style.transform = '';
  });
}

/* ================= CURSOR ================= */
if (fine) {
  const cur = $('#cur'), dot = $('#dot'), lab = $('#curLabel');
  let cx = mouse.x, cy = mouse.y;
  addEventListener('pointermove', () => {
    dot.style.transform = `translate(${mouse.x}px,${mouse.y}px)`;
  }, { passive: true });
  cur._tick = () => {
    cx = lerp(cx, mouse.x, .2); cy = lerp(cy, mouse.y, .2);
    cur.style.transform = `translate(${cx}px,${cy}px)`;
    lab.style.left = cx + 'px'; lab.style.top = cy + 'px';
  };
  document.addEventListener('pointerover', e => {
    const t = e.target.closest ? e.target.closest('[data-cursor],a,button') : null;
    cur.classList.remove('hov', 'big'); lab.classList.remove('on');
    if (!t) return;
    const label = t.dataset && t.dataset.cursor;
    if (label) { cur.classList.add('big'); lab.textContent = label; lab.classList.add('on'); }
    else cur.classList.add('hov');
  });
  window._cursorTick = cur._tick;
}

/* ================= HUD ================= */
const timeEl = $('#time'), coordsEl = $('#coords'), secEl = $('#secName'), pctEl = $('#scrollPct'), prog = $('#prog');
const sections = $$('[data-section]');
const tickClock = () => { timeEl.textContent = new Date().toLocaleTimeString([], { hour12: false }); };
tickClock(); setInterval(tickClock, 1000);
function hud() {
  coordsEl.textContent = `X ${String(Math.round(mouse.x)).padStart(4, '0')} · Y ${String(Math.round(mouse.y)).padStart(4, '0')}`;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
  pctEl.textContent = Math.round(p * 100) + '%';
  prog.style.transform = `scaleX(${p})`;
  let cur = sections[0];
  sections.forEach(s => { if (s.getBoundingClientRect().top <= innerHeight * .5) cur = s; });
  if (secEl.textContent !== cur.dataset.section) secEl.textContent = cur.dataset.section;
}

/* ================= SCRAMBLE LINKS ================= */
const chars = '!<>-_\\/[]{}—=+*^?#01';
$$('.scr').forEach(el => {
  const orig = el.textContent; let raf;
  el.addEventListener('pointerenter', () => {
    cancelAnimationFrame(raf); let f = 0;
    const run = () => {
      el.textContent = [...orig].map((c, i) => c === ' ' ? c : (i < f / 2 ? c : chars[Math.floor(Math.random() * chars.length)])).join('');
      if (f++ < orig.length * 2) raf = requestAnimationFrame(run); else el.textContent = orig;
    };
    run();
  });
});

/* ================= HERO SHADER ================= */
const hero = $('#hero');
let heroVisible = true, glRender = null;
new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; }).observe(hero);

(function initGL() {
  const cv = $('#gl');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) { hero.classList.add('nogl'); cv.remove(); return; }
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uVel;uniform vec3 uRip;uniform float uDark;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;
 vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 vec2 p0=p;
 vec2 m=(uMouse*uRes-.5*uRes)/uRes.y;
 vec2 d=p-m; float dl=length(d);
 p+=d*exp(-dl*4.)*(.22+uVel*.7);
 float t=uTime*.06;
 vec2 q=vec2(fbm(p*1.8+t),fbm(p*1.8+vec2(5.2,1.3)-t));
 vec2 r=vec2(fbm(p*1.8+3.*q+vec2(1.7,9.2)+t*1.4),fbm(p*1.8+3.*q+vec2(8.3,2.8)-t*1.1));
 float f=fbm(p*1.8+3.*r);
 float age=uTime-uRip.z; vec2 rp=(uRip.xy*uRes-.5*uRes)/uRes.y;
 float rd=length(p0-rp); float fr=age*.55;
 float wave=sin((rd-fr)*38.)*exp(-abs(rd-fr)*10.)*exp(-age*1.3);
 f+=wave*.35;
 vec3 bgc=mix(vec3(.957,.953,.941),vec3(.039,.039,.043),uDark);
 vec3 halo=mix(vec3(.87,.872,.875),vec3(.075,.078,.085),uDark);
 vec3 dk=mix(vec3(.24,.25,.27),vec3(.035,.035,.04),uDark);
 vec3 lt=mix(vec3(.9,.905,.91),vec3(.68,.7,.73),uDark);
 float mk=smoothstep(.57,.62,f);
 float band=.5+.5*sin(f*11.+r.y*4.+q.x*2.5);
 vec3 chromeC=mix(dk,lt,smoothstep(.15,.85,band));
 chromeC+=vec3(1.)*pow(band,18.)*.8;
 chromeC=mix(chromeC,dk*.6,pow(1.-band,12.)*.5);
 chromeC=mix(chromeC,lt,(1.-smoothstep(.6,.68,f))*.65);
 vec3 c=mix(bgc,halo,smoothstep(.45,.57,f)*(1.-mk)*.6);
 float k=abs(fract(f*14.)-.5);
 c=mix(c,mix(vec3(.62),vec3(.28),uDark),(1.-smoothstep(0.,.035,k))*.1*(1.-mk));
 c=mix(c,chromeC,mk);
 float rim=smoothstep(.562,.57,f)*(1.-smoothstep(.572,.582,f));
 c=mix(c,vec3(.95,.33,.04),clamp(rim*exp(-dl*7.)*1.5,0.,1.));
 c*=1.-.3*dot(uv-.5,uv-.5)*mix(.5,1.8,uDark);
 c+=(h(gl_FragCoord.xy+uTime)-.5)*.035;
 gl_FragColor=vec4(c,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) { hero.classList.add('nogl'); cv.remove(); return; }
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uVel = U('uVel'), uRip = U('uRip'), uDark = U('uDark');
  let dark = isDark() ? 1 : 0;
  const scale = fine ? .7 : .5;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5) * scale;
    cv.width = Math.max(2, cv.clientWidth * dpr | 0); cv.height = Math.max(2, cv.clientHeight * dpr | 0);
    gl.viewport(0, 0, cv.width, cv.height);
  };
  resize(); addEventListener('resize', resize);
  let rip = [.5, .5, -100], smx = .5, smy = .5, vel = 0, lastx = .5, lasty = .5;
  const t0 = performance.now();
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    rip = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, (performance.now() - t0) / 1000];
  });
  hero.addEventListener('pointerdown', e => {
    if (e.target === cv) return;
    const r = cv.getBoundingClientRect();
    rip = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, (performance.now() - t0) / 1000];
  });
  glRender = () => {
    const r = cv.getBoundingClientRect();
    let tx = clamp((mouse.x - r.left) / r.width, 0, 1), ty = clamp(1 - (mouse.y - r.top) / r.height, 0, 1);
    if (!fine && performance.now() - lastTouch > 2500) {
      const s = (performance.now() - t0) / 1000;
      tx = .5 + .32 * Math.sin(s * .45); ty = .5 + .28 * Math.cos(s * .33);
    }
    smx = lerp(smx, tx, .08); smy = lerp(smy, ty, .08);
    vel = lerp(vel, clamp(Math.hypot(smx - lastx, smy - lasty) * 40, 0, 1), .1); lastx = smx; lasty = smy;
    gl.uniform2f(uRes, cv.width, cv.height);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, smx, smy);
    gl.uniform1f(uVel, vel);
    gl.uniform3f(uRip, rip[0], rip[1], rip[2]);
    dark = lerp(dark, isDark() ? 1 : 0, .06);
    gl.uniform1f(uDark, dark);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
})();

/* ================= REVEAL (.io) + COUNTERS ================= */
const countUp = el => {
  const to = +el.dataset.count, t0 = performance.now(), dur = 1800;
  const run = now => { const p = clamp((now - t0) / dur, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(run); };
  requestAnimationFrame(run);
};
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  const c = $('[data-count]', e.target); if (c) countUp(c);
  io.unobserve(e.target);
}), { threshold: .25 });
$$('.io').forEach(el => io.observe(el));

/* ornaments: their own clip-path hides them from IntersectionObserver,
   so watch the parent and reveal the sigil when the parent scrolls in */
const ornIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  $$('.orn', e.target).forEach(o => o.classList.add('in'));
  ornIO.unobserve(e.target);
}), { threshold: .2 });
$$('.orn').forEach(o => ornIO.observe(o.parentElement));

/* ================= STATEMENT WORD REVEAL ================= */
const st = $('#statement');
st.innerHTML = st.textContent.split(' ').map(w => `<span>${w}</span>`).join(' ');
const words = [...st.children];
function statement() {
  const r = st.getBoundingClientRect();
  const p = clamp((innerHeight * .8 - r.top) / (r.height + innerHeight * .25), 0, 1);
  const n = Math.round(p * words.length);
  words.forEach((w, i) => w.classList.toggle('on', i < n));
}

/* ================= HORIZONTAL GALLERY ================= */
const hs = $('#hs'), hsTrack = $('#hsTrack'), hsBar = $('#hsBar'), hsNum = $('#hsNum');
const pieces = $$('.piece');
let hsDist = 0, hsCur = 0;
function hsSize() {
  if (isMobile()) { hs.style.height = ''; hsTrack.style.transform = ''; return; }
  hsDist = Math.max(0, hsTrack.scrollWidth - innerWidth);
  hs.style.height = (hsDist + innerHeight) + 'px';
}
function hsUpdate() {
  if (isMobile()) return;
  const r = hs.getBoundingClientRect();
  const p = hsDist ? clamp(-r.top / hsDist, 0, 1) : 0;
  hsCur = lerp(hsCur, p * hsDist, .12);
  hsTrack.style.transform = `translate3d(${-hsCur.toFixed(2)}px,0,0)`;
  hsBar.style.transform = `scaleX(${p})`;
  let best = 0, bd = 1e9;
  pieces.forEach((pc, i) => { const b = pc.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - innerWidth / 2); if (d < bd) { bd = d; best = i; } });
  const s = String(best + 1).padStart(2, '0'); if (hsNum.textContent !== s) hsNum.textContent = s;
}
addEventListener('resize', hsSize);
addEventListener('load', hsSize);
hsSize();

/* ================= GENERATIVE ARTWORKS ================= */
const TAU = Math.PI * 2;
const INK = '#0B0B0C';
const A = {};

A.flow = {
  init(o) {
    o.S.pts = Array.from({ length: isMobile() ? 320 : 650 }, () => ({ x: Math.random() * o.w, y: Math.random() * o.h }));
    o.ctx.fillStyle = INK; o.ctx.fillRect(0, 0, o.w, o.h);
  },
  frame(o) {
    const { ctx, w, h, t } = o, mx = o.px * w, my = o.py * h;
    ctx.fillStyle = 'rgba(11,11,12,.07)'; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1.1;
    for (const p of o.S.pts) {
      let a = (Math.sin(p.x * .006 + t * .5) + Math.cos(p.y * .007 - t * .4)) * Math.PI;
      const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy);
      let near = 0;
      if (d < 200) { near = 1 - d / 200; const ta = Math.atan2(dy, dx) + Math.PI / 2; a = lerp(a, ta, near * .85); }
      const nx = p.x + Math.cos(a) * 1.6, ny = p.y + Math.sin(a) * 1.6;
      ctx.strokeStyle = near > .05 ? `rgba(242,84,10,${.35 + near * .65})` : 'rgba(196,198,201,.32)';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny;
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || Math.random() < .004) { p.x = Math.random() * w; p.y = Math.random() * h; }
    }
  }
};

A.moire = {
  init() {},
  frame(o) {
    const { ctx, w, h } = o, mx = o.px * w, my = o.py * h;
    ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = .9;
    ctx.strokeStyle = 'rgba(196,198,201,.55)';
    ctx.beginPath(); for (let i = 1; i < 90; i++) { ctx.moveTo(w / 2 + i * 7, h / 2); ctx.arc(w / 2, h / 2, i * 7, 0, TAU); } ctx.stroke();
    ctx.strokeStyle = 'rgba(242,84,10,.7)';
    ctx.beginPath(); for (let i = 1; i < 90; i++) { ctx.moveTo(mx + i * 7, my); ctx.arc(mx, my, i * 7, 0, TAU); } ctx.stroke();
  }
};

A.glitch = {
  init(o) {
    const lines = ['BREAK', 'THE', 'GRID'];
    const mk = col => {
      const c = document.createElement('canvas'); c.width = o.w * o.dpr; c.height = o.h * o.dpr;
      const g = c.getContext('2d'); g.scale(o.dpr, o.dpr);
      g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle';
      const fs = o.w * .27; g.font = `800 ${fs}px 'Inter Tight',sans-serif`;
      lines.forEach((l, i) => g.fillText(l, o.w / 2, o.h * (.3 + i * .22)));
      return c;
    };
    o.S.layers = [mk('#F2540A'), mk('#ECECEA'), mk('#6E7176')];
  },
  frame(o) {
    const { ctx, w, h, t, dpr } = o, my = o.py * h;
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const chroma = 2 + (o.hover ? 12 : 3);
    const sh = 7;
    o.S.layers.forEach((L, li) => {
      for (let y = 0; y < h; y += sh) {
        const prox = Math.exp(-Math.abs(y - my) / 70);
        const amp = 3 + (o.hover ? 55 : 8) * prox;
        const off = Math.sin(y * .09 + t * 6) * Math.sin(t * 1.3 + y * .013) * amp + (li - 1) * chroma;
        ctx.drawImage(L, 0, y * dpr, w * dpr, sh * dpr, off, y, w, sh);
      }
    });
    ctx.globalCompositeOperation = 'source-over';
  }
};

A.orbit = {
  init(o) { o.ctx.fillStyle = INK; o.ctx.fillRect(0, 0, o.w, o.h); },
  frame(o) {
    const { ctx, w, h, t } = o, cx = w / 2, cy = h / 2, base = Math.min(w, h) / 27;
    ctx.fillStyle = 'rgba(11,11,12,.1)'; ctx.fillRect(0, 0, w, h);
    const speed = .25 + o.px * 1.6, pts = [];
    for (let i = 0; i < 13; i++) {
      const r = (i + 1.5) * base, a = o.S.ang[i] = (o.S.ang[i] || 0) + (i % 2 ? 1 : -1) * speed * .012 * (1 + i * .16);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * (.55 + o.py * .45)]);
    }
    ctx.strokeStyle = 'rgba(196,198,201,.3)'; ctx.lineWidth = .8;
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    pts.forEach((p, i) => { ctx.fillStyle = i === pts.length - 1 ? '#F2540A' : '#ECECEA'; ctx.beginPath(); ctx.arc(p[0], p[1], i === pts.length - 1 ? 3.4 : 2.2, 0, TAU); ctx.fill(); });
  }
};
A.orbit.init = function (o) { o.S.ang = []; o.ctx.fillStyle = INK; o.ctx.fillRect(0, 0, o.w, o.h); };

A.ripple = {
  init() {},
  frame(o) {
    const { ctx, w, h, t } = o, mx = o.px * w, my = o.py * h, gap = 22;
    ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
    for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) {
      const d = Math.hypot(x - mx, y - my);
      const k = Math.exp(-d / 120) * (.5 + .5 * Math.sin(d * .07 - t * 4));
      const r = 1.6 + k * 7;
      ctx.fillStyle = k > .25 ? `rgba(242,84,10,${.4 + k * .6})` : 'rgba(196,198,201,.32)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }
};

const arts = $$('.art canvas').map(cv => {
  const o = { cv, ctx: cv.getContext('2d'), kind: cv.dataset.kind, w: 0, h: 0, dpr: 1, vis: false, px: .5, py: .5, tx: .5, ty: .5, hover: false, t: 0, S: {}, ph: Math.random() * 6 };
  const size = () => {
    const r = cv.getBoundingClientRect();
    o.dpr = Math.min(devicePixelRatio || 1, 2);
    o.w = cv.offsetWidth; o.h = cv.offsetHeight;
    cv.width = o.w * o.dpr; cv.height = o.h * o.dpr;
    o.ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    A[o.kind].init(o);
  };
  o.size = size;
  const host = cv.parentElement;
  host.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    o.tx = clamp((e.clientX - r.left) / r.width, 0, 1); o.ty = clamp((e.clientY - r.top) / r.height, 0, 1);
  });
  host.addEventListener('pointerenter', () => o.hover = true);
  host.addEventListener('pointerleave', () => o.hover = false);
  host.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    o.tx = clamp((e.clientX - r.left) / r.width, 0, 1); o.ty = clamp((e.clientY - r.top) / r.height, 0, 1); o.hover = true;
  });
  host.addEventListener('pointerup', () => { if (!fine) o.hover = false; });
  host.addEventListener('pointercancel', () => o.hover = false);
  new IntersectionObserver(es => { o.vis = es[0].isIntersecting; }).observe(cv);
  return o;
});
function sizeArts() { arts.forEach(o => o.size()); }
sizeArts();
addEventListener('resize', () => { clearTimeout(sizeArts._t); sizeArts._t = setTimeout(sizeArts, 200); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeArts);

function drawArts(t) {
  arts.forEach(o => {
    if (!o.vis) return;
    o.t = t;
    if (!o.hover) { o.tx = .5 + .3 * Math.sin(t * .6 + o.ph); o.ty = .5 + .3 * Math.cos(t * .45 + o.ph); }
    o.px = lerp(o.px, o.tx, .1); o.py = lerp(o.py, o.ty, .1);
    A[o.kind].frame(o);
  });
}

/* ================= PLAYGROUND ================= */
(function playground() {
  const pg = $('#pg'), ctx = pg.getContext('2d'), hint = $('#playHint');
  const pals = {
    signal: ['#F2540A', '#FF8A4C', '#C43F00'],
    chrome: ['#C4C6C9', '#8D9095', '#ECECEA'],
    void: ['#0A0A0B', '#2E3033', '#5A5D62'],
    pearl: ['#F4F3F0', '#D6D7D9', '#FFFFFF']
  };
  let pal = 'signal', mirror = false, last = null, wdt = 4, hue = 0, dpr = 1, W = 0, H = 0;
  const bgColor = () => getComputedStyle(root).getPropertyValue('--bg-2').trim() || '#E8E8E6';
  const paint = () => { ctx.fillStyle = bgColor(); ctx.fillRect(0, 0, W, H); };
  addEventListener('themechange', () => { paint(); hint.classList.remove('gone'); });
  function size() {
    const old = document.createElement('canvas'); old.width = pg.width; old.height = pg.height;
    if (pg.width) old.getContext('2d').drawImage(pg, 0, 0);
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = pg.clientWidth; H = pg.clientHeight; pg.width = W * dpr; pg.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); paint();
    if (old.width) ctx.drawImage(old, 0, 0, W, H);
  }
  size(); addEventListener('resize', size);
  const pts = (x, y) => {
    const a = [[x, y]];
    if (mirror) a.push([W - x, y], [x, H - y], [W - x, H - y]);
    return a;
  };
  function seg(x0, y0, x1, y1, w, col) {
    const A1 = pts(x0, y0), B1 = pts(x1, y1);
    ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = w;
    A1.forEach((a, i) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(B1[i][0], B1[i][1]); ctx.stroke(); });
  }
  const col = () => { const c = pals[pal]; hue += .02; return c[Math.floor(hue) % c.length]; };
  let drawOn = false;
  pg.addEventListener('pointermove', e => {
    const r = pg.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (e.pointerType === 'touch' && !drawOn) return;
    hint.classList.add('gone');
    if (last) {
      const sp = Math.hypot(x - last.x, y - last.y);
      wdt = lerp(wdt, clamp(sp * .55, 1.5, 26), .25);
      seg(last.x, last.y, x, y, wdt, col());
    }
    last = { x, y };
  });
  pg.addEventListener('pointerleave', () => last = null);
  pg.addEventListener('pointerup', () => { if (drawOn) last = null; });
  pg.addEventListener('pointercancel', () => last = null);
  const dm = $('#drawMode');
  if (dm) dm.addEventListener('click', () => {
    drawOn = !drawOn; pg.style.touchAction = drawOn ? 'none' : ''; last = null;
    dm.textContent = 'Draw: ' + (drawOn ? 'on' : 'off'); dm.classList.toggle('on', drawOn);
  });
  pg.addEventListener('pointerdown', e => {
    const r = pg.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    hint.classList.add('gone');
    if (drawOn && e.pointerType === 'touch') { last = { x, y }; return; }
    const n = 28, R = 40 + Math.random() * 110, c = pals[pal];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, rr = R * (.4 + Math.random() * .6);
      seg(x + Math.cos(a) * 8, y + Math.sin(a) * 8, x + Math.cos(a) * rr, y + Math.sin(a) * rr, 1 + Math.random() * 3, c[i % c.length]);
    }
  });
  $$('#swatches button').forEach(b => b.addEventListener('click', () => {
    $$('#swatches button').forEach(x => x.classList.remove('on')); b.classList.add('on'); pal = b.dataset.pal;
  }));
  $('#mirror').addEventListener('click', e => { mirror = !mirror; e.currentTarget.textContent = 'Mirror: ' + (mirror ? 'on' : 'off'); });
  $('#clear').addEventListener('click', () => { paint(); hint.classList.remove('gone'); });
  $('#save').addEventListener('click', () => {
    const a = document.createElement('a'); a.download = 'nguyen-vo-studio-mark.png'; a.href = pg.toDataURL('image/png'); a.click();
  });
})();

/* ================= FOOTER SPOTLIGHT ================= */
const big = $('#big');
big.addEventListener('pointermove', e => {
  const r = big.getBoundingClientRect();
  big.style.setProperty('--x', (e.clientX - r.left) + 'px');
  big.style.setProperty('--y', (e.clientY - r.top) + 'px');
});

/* ================= CHROME SLABS (3D tilt + sheen) ================= */
const slabs = $$('.slab').map(el => {
  const cs = getComputedStyle(el);
  const o = { el, vis: false, bx: parseFloat(cs.getPropertyValue('--rx')) || -12, by: parseFloat(cs.getPropertyValue('--ry')) || -30 };
  o.rx = o.bx; o.ry = o.by;
  new IntersectionObserver(es => { o.vis = es[0].isIntersecting; }).observe(el.parentElement);
  return o;
});
function slabTick(t) {
  slabs.forEach(o => {
    if (!o.vis) return;
    let tx, ty;
    if (fine) {
      tx = o.by + (mouse.x / innerWidth - .5) * 34;
      ty = o.bx + (mouse.y / innerHeight - .5) * -16;
    } else {
      tx = o.by + Math.sin(t * .6) * 12;
      ty = o.bx + Math.cos(t * .45) * 5;
    }
    if (reduce) { tx = o.by; ty = o.bx; }
    o.ry = lerp(o.ry, tx, .07); o.rx = lerp(o.rx, ty, .07);
    o.el.style.setProperty('--ry', o.ry.toFixed(2) + 'deg');
    o.el.style.setProperty('--rx', o.rx.toFixed(2) + 'deg');
    o.el.style.setProperty('--sheen', clamp(.5 + (o.ry - o.by) / 34, 0, 1).toFixed(3));
  });
}

/* ================= MAIN LOOP ================= */
function loop(now) {
  const t = now / 1000;
  if (window._cursorTick) window._cursorTick();
  hud();
  statement();
  hsUpdate();
  if (heroVisible) { magnet(); if (glRender) glRender(); }
  drawArts(t);
  slabTick(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
