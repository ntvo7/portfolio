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
    if (btn) { btn.setAttribute('aria-checked', isDark() ? 'true' : 'false'); btn.title = isDark() ? 'Switch to light' : 'Switch to dark'; }
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

/* ================= OPEN-WORLD OBJECTS (playground sandbox) ================= */
let objTick = null;
(function openWorld() {
  const play = $('#play'), layer = $('#objLayer'), tray = $('#objTray'), light = $('#objLight');
  if (!play || !layer || !tray) return;
  const C = 'fill="url(#chromeG)" filter="url(#chromeF)"', O = 'fill="url(#orangeG)" filter="url(#chromeF)"';
  // every object: name, svg body (viewBox 0 0 100 100), click reaction, optional scale
  const OBJ = {
    heart:   { name: 'Heart', act: 'beat', svg: `<path ${C} d="M50 90C20 68 6 52 6 33 6 18 17 8 30 8c10 0 16 6 20 14 4-8 10-14 20-14 13 0 24 10 24 25 0 19-14 35-44 57z"/>` },
    sparkle: { name: 'Sparkle', act: 'spin', fx: 'sparks', svg: `<path ${C} d="M50 2c3 30 18 45 48 48-30 3-45 18-48 48-3-30-18-45-48-48 30-3 45-18 48-48z"/>` },
    flower:  { name: 'Flower medallion', act: 'spin', svg: `<path ${C} fill-rule="evenodd" d="M50 3a47 47 0 1 1 0 94 47 47 0 0 1 0-94zm0 7a40 40 0 1 0 0 80 40 40 0 0 0 0-80z"/>` +
               [0, 60, 120, 180, 240, 300].map(r => `<ellipse ${C} cx="50" cy="31" rx="10" ry="16" transform="rotate(${r} 50 50)"/>`).join('') + `<circle ${C} cx="50" cy="50" r="9"/>` },
    button:  { name: 'Button', act: 'flip', svg: `<path ${C} fill-rule="evenodd" d="M50 6a44 44 0 1 1 0 88 44 44 0 0 1 0-88zM40 34a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm20 0a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM40 54a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm20 0a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>` },
    seven:   { name: 'Lucky seven', act: 'slot', svg: `<path ${C} d="M18 10h66v14L50 92H30l32-64H18z"/>` },
    esc:     { name: 'Esc key (clears the canvas)', act: 'press', fx: 'escape', svg: `<rect ${C} x="6" y="12" width="88" height="78" rx="16"/><rect ${C} x="16" y="16" width="68" height="56" rx="11"/><text x="50" y="52" text-anchor="middle" font-family="Inter Tight,Arial,sans-serif" font-weight="700" font-size="20" fill="#1a1b1d">Esc</text>` },
    pin:     { name: 'Push pin (pins in place)', act: 'press', fx: 'pin', svg: `<g transform="rotate(32 50 50)"><path ${C} d="M49 58h2l-1 40z"/><path ${C} d="M30 48h40l-7-9H37z"/><rect ${C} x="40" y="20" width="20" height="20" rx="3"/><rect ${C} x="34" y="6" width="32" height="16" rx="6"/></g>` },
    moon:    { name: 'Moon (toggles dark mode)', act: 'flip', fx: 'theme', svg: `<path ${C} d="M64 6a44 44 0 1 0 30 66A36 36 0 1 1 64 6z"/>` },
    bear:    { name: 'Gummy bear', act: 'jiggle', svg: `<g ${C}><circle cx="33" cy="14" r="9"/><circle cx="67" cy="14" r="9"/><circle cx="50" cy="30" r="21"/><ellipse cx="50" cy="66" rx="24" ry="25"/><ellipse cx="27" cy="56" rx="8" ry="13" transform="rotate(35 27 56)"/><ellipse cx="73" cy="56" rx="8" ry="13" transform="rotate(-35 73 56)"/><ellipse cx="37" cy="90" rx="11" ry="8"/><ellipse cx="63" cy="90" rx="11" ry="8"/></g><circle cx="42" cy="27" r="2.6" fill="#1a1b1d"/><circle cx="58" cy="27" r="2.6" fill="#1a1b1d"/>` },
    cherry:  { name: 'Cherries', act: 'jiggle', fx: 'hop', svg: `<path d="M36 50C40 30 52 16 72 8M66 54C64 36 66 22 72 8" fill="none" stroke="url(#chromeG)" stroke-width="4" stroke-linecap="round" filter="url(#chromeF)"/><circle ${O} cx="34" cy="68" r="22"/><circle ${O} cx="68" cy="74" r="19"/>` },
    drop:    { name: 'Liquid drop', act: 'splash', svg: `<path ${C} d="M50 4s36 40 36 60c0 20-16 32-36 32S14 84 14 64C14 44 50 4 50 4z"/>` }
  };
  const svgOf = k => `<svg class="obj-svg" viewBox="0 0 100 100" aria-hidden="true">${OBJ[k].svg}</svg>`;

  let W = 0, H = 0, floor = 0, gravity = false, zTop = 1;
  const items = [];
  const measure = () => {
    const r = play.getBoundingClientRect(), tr = tray.getBoundingClientRect();
    W = r.width; H = r.height; floor = Math.min(H, tr.top - r.top - 6);
  };
  measure(); addEventListener('resize', measure);
  let vis = false;
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) measure(); }).observe(play);

  const rel = e => { const r = play.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const hideHint = () => { const h = $('#playHint'); if (h) h.classList.add('gone'); };

  function remove(o) {
    const i = items.indexOf(o); if (i > -1) items.splice(i, 1);
    o.el.classList.add('gone'); setTimeout(() => o.el.remove(), 420);
  }
  function spawn(k, x, y) {
    if (items.length >= 36) remove(items[0]);
    const s = (W < 760 ? 72 : 108) * (OBJ[k].scale || 1);
    const el = document.createElement('div');
    el.className = 'obj obj-' + k + ' drop';
    el.dataset.cursor = 'Drag';
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', OBJ[k].name);
    el.innerHTML = svgOf(k);
    el.style.width = el.style.height = s + 'px';
    el.style.zIndex = ++zTop;
    layer.appendChild(el);
    const o = { k, el, x, y, vx: 0, vy: 0, a: (Math.random() - .5) * 24, va: 0, s, r: s * .4, drag: false, pinned: false, moved: 0 };
    el.addEventListener('animationend', () => el.classList.remove('drop', 'a-' + OBJ[k].act));
    el.addEventListener('pointerdown', e => startDrag(o, e, false));
    items.push(o); render(o); hideHint();
    return o;
  }
  function render(o) { o.el.style.transform = `translate3d(${(o.x - o.s / 2).toFixed(1)}px,${(o.y - o.s / 2).toFixed(1)}px,0) rotate(${o.a.toFixed(1)}deg)`; }

  /* ---- drag / throw ---- */
  function startDrag(o, e, fromTray) {
    e.preventDefault(); e.stopPropagation();
    o.drag = true; o.fromTray = fromTray; o.moved = 0;
    const p = rel(e); o.offx = fromTray ? 0 : o.x - p.x; o.offy = fromTray ? 0 : o.y - p.y;
    o.lx = p.x; o.ly = p.y; o.lt = performance.now();
    o.el.style.zIndex = ++zTop; o.el.classList.add('grab');
    try { o.el.setPointerCapture(e.pointerId); } catch (err) {}
    const move = ev => {
      const q = rel(ev), now = performance.now(), dt = Math.max(8, now - o.lt);
      o.moved += Math.abs(q.x - o.lx) + Math.abs(q.y - o.ly);
      o.vx = (q.x - o.lx) / dt * 16; o.vy = (q.y - o.ly) / dt * 16;
      o.x = q.x + o.offx; o.y = q.y + o.offy; o.va = o.vx * .6;
      o.lx = q.x; o.ly = q.y; o.lt = now; render(o);
    };
    const up = () => {
      o.drag = false; o.el.classList.remove('grab');
      o.el.removeEventListener('pointermove', move); o.el.removeEventListener('pointerup', up); o.el.removeEventListener('pointercancel', up);
      if (o.moved < 6) {
        if (o.fromTray) { o.x = W * (.25 + Math.random() * .5); o.y = Math.min(floor - o.r, H * .55); o.vx = (Math.random() - .5) * 18; o.vy = -10 - Math.random() * 8; o.va = o.vx; }
        else act(o);
      }
      if (o.pinned) { o.vx = o.vy = o.va = 0; }
    };
    o.el.addEventListener('pointermove', move); o.el.addEventListener('pointerup', up); o.el.addEventListener('pointercancel', up);
  }

  /* ---- tray ---- */
  Object.keys(OBJ).forEach(k => {
    const b = document.createElement('button');
    b.className = 'tray-item'; b.type = 'button'; b.dataset.cursor = 'Grab';
    b.setAttribute('aria-label', 'Add ' + OBJ[k].name); b.innerHTML = svgOf(k);
    b.addEventListener('pointerdown', e => { measure(); const p = rel(e); startDrag(spawn(k, p.x, p.y), e, true); });
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const o = spawn(k, W / 2, floor * .5); o.vy = -8; o.vx = (Math.random() - .5) * 14; } });
    tray.appendChild(b);
  });

  /* ---- click reactions ---- */
  function sparks(o, n = 10) {
    for (let i = 0; i < n; i++) {
      const sp = document.createElement('i'); sp.className = 'spark';
      const a = Math.random() * TAU, d = 40 + Math.random() * 70;
      sp.style.left = (o.x - 7) + 'px'; sp.style.top = (o.y - 7) + 'px';
      sp.style.setProperty('--dx', Math.cos(a) * d + 'px'); sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
      layer.appendChild(sp); setTimeout(() => sp.remove(), 950);
    }
  }
  function act(o) {
    const d = OBJ[o.k];
    o.el.classList.remove('a-' + d.act); void o.el.offsetWidth; o.el.classList.add('a-' + d.act);
    if (d.fx === 'sparks') sparks(o);
    if (d.fx === 'hop') { o.vy = -16; o.va = (Math.random() - .5) * 20; }
    if (d.fx === 'pin') { o.pinned = !o.pinned; o.el.classList.toggle('pinned', o.pinned); o.vx = o.vy = o.va = 0; }
    if (d.fx === 'theme') { const t = $('#themeBtn'); if (t) t.click(); }
    if (d.fx === 'escape') { sparks(o, 6); items.filter(x => x !== o).forEach(remove); }
  }

  /* ---- toolbar: gravity, clear, save ---- */
  const gb = $('#gravity');
  if (gb) gb.addEventListener('click', () => { gravity = !gravity; gb.textContent = 'Gravity: ' + (gravity ? 'on' : 'off'); gb.classList.toggle('on', gravity); items.forEach(o => { if (!o.pinned) o.vy -= 4; }); });
  const cl = $('#clear'); if (cl) cl.addEventListener('click', () => { items.slice().forEach(remove); const h = $('#playHint'); if (h) h.classList.remove('gone'); });
  const sv = $('#save');
  if (sv) {
    sv.addEventListener('click', async () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), out = document.createElement('canvas');
      out.width = Math.round(W * dpr); out.height = Math.round(H * dpr);
      const c = out.getContext('2d');
      c.fillStyle = getComputedStyle(root).getPropertyValue('--bg-2').trim() || '#E8E8E6'; c.fillRect(0, 0, out.width, out.height);
      const k = dpr, defs = $('#objDefs defs').outerHTML;
      for (const o of items.slice().sort((a, b) => (+a.el.style.zIndex) - (+b.el.style.zIndex))) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${o.s * k}" height="${o.s * k}">${defs}${OBJ[o.k].svg}</svg>`;
        const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        try { await img.decode(); } catch (err) { continue; }
        c.save(); c.translate(o.x * k, o.y * k); c.rotate(o.a * Math.PI / 180); c.drawImage(img, -o.s * k / 2, -o.s * k / 2, o.s * k, o.s * k); c.restore();
      }
      const a = document.createElement('a'); a.download = 'nguyen-vo-open-world.png'; a.href = out.toDataURL('image/png'); a.click();
    });
  }

  /* ---- light follows the cursor (all chrome reflections shift) ---- */
  let az = 225, azT = 225;
  play.addEventListener('pointermove', e => { const p = rel(e); azT = 180 + (p.x / W - .5) * 200 + (p.y / H - .5) * 40; });

  /* ---- physics ---- */
  objTick = () => {
    if (!vis) return;
    if (light && Math.abs(az - azT) > .5) { az = lerp(az, azT, .12); light.setAttribute('azimuth', az.toFixed(1)); }
    if (!items.length) return;
    const top = 70, fr = gravity ? .992 : .975;
    for (const o of items) {
      if (o.drag || o.pinned) continue;
      if (gravity) o.vy += .55;
      o.x += o.vx; o.y += o.vy; o.a += o.va;
      o.vx *= fr; o.vy *= fr; o.va *= .96;
      if (o.x < o.r) { o.x = o.r; o.vx = Math.abs(o.vx) * .6; o.va *= -.6; }
      if (o.x > W - o.r) { o.x = W - o.r; o.vx = -Math.abs(o.vx) * .6; o.va *= -.6; }
      if (o.y < top + o.r) { o.y = top + o.r; o.vy = Math.abs(o.vy) * .6; }
      const fl = floor - o.s * .47;
      if (o.y > fl) { o.y = fl; o.vy = -Math.abs(o.vy) * (gravity ? .45 : .6); o.vx *= .9; o.va = o.vx * .5; }
    }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j];
      const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || .01, min = A.r + B.r;
      if (d >= min) continue;
      const nx = dx / d, ny = dy / d, push = (min - d) / 2;
      const am = A.drag || A.pinned, bm = B.drag || B.pinned;
      if (!am) { A.x -= nx * push * (bm ? 2 : 1); A.y -= ny * push * (bm ? 2 : 1); }
      if (!bm) { B.x += nx * push * (am ? 2 : 1); B.y += ny * push * (am ? 2 : 1); }
      const rv = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
      if (rv < 0) {
        const imp = -rv * .8;
        if (!am) { A.vx -= nx * imp * (bm ? 2 : 1) / 2; A.vy -= ny * imp * (bm ? 2 : 1) / 2; A.va -= imp; }
        if (!bm) { B.vx += nx * imp * (am ? 2 : 1) / 2; B.vy += ny * imp * (am ? 2 : 1) / 2; B.va += imp; }
      }
    }
    items.forEach(o => { if (o.drag) return; const fl = floor - o.s * .47; if (o.y > fl) o.y = fl; render(o); });
  };
})();

/* ================= FOOTER BRAND: liquid wordmark ================= */
let brandTick = null;
(function brandLockup() {
  const brand = $('#brand'), noise = $('#liquidNoise'), disp = $('#liquidDisp');
  if (!brand || !noise || !disp) return;
  const mark = $('.brand-mark', brand);
  let vis = false, hov = 0, hovT = 0;
  new IntersectionObserver(es => {
    vis = es[0].isIntersecting;
    if (vis) brand.classList.add('in');
  }, { threshold: .15 }).observe(brand);
  mark.addEventListener('pointerenter', () => { hovT = 1; });
  mark.addEventListener('pointerleave', () => { hovT = 0; });
  mark.addEventListener('pointerdown', () => { hov = 1.8; });
  brandTick = t => {
    if (!vis || reduce) return;
    hov = lerp(hov, hovT, .05);
    noise.setAttribute('baseFrequency', (0.011 + 0.002 * Math.sin(t * .7)).toFixed(4) + ' ' + (0.028 + 0.004 * Math.cos(t * .5)).toFixed(4));
    disp.setAttribute('scale', (9 + hov * 18).toFixed(1));
  };
})();

/* ================= CHROME SLABS (3D tilt + sheen) ================= */
/* turntable: needle drops when it scrolls into view; click / Enter / Space toggles */
(function turntable() {
  const tt = $('#turntable');
  if (!tt) return;
  const set = on => { tt.classList.toggle('playing', on); tt.setAttribute('aria-pressed', on ? 'true' : 'false'); tt.dataset.cursor = on ? 'Pause' : 'Play'; };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; setTimeout(() => set(true), 700); }
  }, { threshold: .35 }).observe(tt);
  tt.addEventListener('click', () => { started = true; set(!tt.classList.contains('playing')); });
  tt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tt.click(); } });
})();

/* CD player: silent until you pull the cord */
(function cdPlayer() {
  const cd = $('#cdp');
  if (!cd) return;
  const toggle = () => {
    const on = !cd.classList.contains('playing');
    cd.classList.remove('pull'); void cd.offsetWidth; cd.classList.add('pull');
    setTimeout(() => {
      cd.classList.toggle('playing', on);
      cd.setAttribute('aria-pressed', on ? 'true' : 'false');
    }, 160);
  };
  cd.addEventListener('click', toggle);
  cd.addEventListener('animationend', e => { if (e.animationName === 'cordPull') cd.classList.remove('pull'); });
  cd.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
})();

const slabs = $$('.slab, .turntable, .cdp').map(el => {
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
  if (brandTick) brandTick(t);
  if (objTick) objTick(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
