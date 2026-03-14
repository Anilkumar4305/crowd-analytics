/* ═══════════════════════════════════════════════════════════════════
   ADAPTIVE CROWD ANALYTICA — app.js v3
   Full interactive logic · Home + Scope + Team pages
   ═══════════════════════════════════════════════════════════════════ */
(function bootstrapAdaptiveCrowdAnalytica() {
'use strict';

if (window.__ACA_APP_V3_LOADED__) {
  console.warn('Adaptive Crowd Analytica app.js already loaded; skipping duplicate init.');
  return;
}
window.__ACA_APP_V3_LOADED__ = true;

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ── Page detection ─────────────────────────────────────────── */
const isHome  = !!$('.home-competition');
const isScope = !!$('.scope-vision');
const isTeam  = !!$('#teamSection');

/* ╔══════════════════════════════════════════╗
   ║  LOADER                                  ║
   ╚══════════════════════════════════════════╝ */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;
  const hide = () => {
    loader.classList.add('hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  };
  document.readyState === 'complete' ? setTimeout(hide, 400) : window.addEventListener('load', () => setTimeout(hide, 400));
  setTimeout(hide, 2600);
})();

/* ╔══════════════════════════════════════════╗
   ║  TOPBAR SCROLL                           ║
   ╚══════════════════════════════════════════╝ */
(function initTopbar() {
  const bar = $('.topbar');
  if (!bar) return;
  const update = () => bar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ╔══════════════════════════════════════════╗
   ║  TAB INDICATOR                           ║
   ╚══════════════════════════════════════════╝ */
(function initTabIndicator() {
  const nav = $('.tabs');
  if (!nav) return;
  const indicator = nav.querySelector('.tab-indicator');
  const active    = nav.querySelector('.tab.active');
  const move = tab => {
    if (!tab || !indicator) return;
    const tr = tab.getBoundingClientRect(), nr = nav.getBoundingClientRect();
    indicator.style.left  = (tr.left - nr.left + 4) + 'px';
    indicator.style.width = (tr.width - 8) + 'px';
  };
  if (active) move(active);
  $$('.tab', nav).forEach(t => {
    t.addEventListener('mouseenter', () => move(t));
    t.addEventListener('mouseleave', () => move(active));
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  PAGE TRANSITIONS                        ║
   ╚══════════════════════════════════════════╝ */
(function initPageTransitions() {
  const pt = $('#pageTransition');
  if (!pt) return;
  $$('a.tab').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      e.preventDefault();
      pt.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 400);
    });
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  TOAST                                   ║
   ╚══════════════════════════════════════════╝ */
function showToast(msg, ms = 2800) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), ms);
}

/* ╔══════════════════════════════════════════╗
   ║  COUNTER ANIMATIONS                      ║
   ╚══════════════════════════════════════════╝ */
function initCounters(attr = '[data-hc-counter], [data-counter-scope]') {
  const els = $$(attr);
  if (!els.length) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const DUR = 2000;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el     = e.target;
      const target = parseFloat(el.dataset.target || 0);
      const dec    = parseInt(el.dataset.dec || 0);
      const suffix = el.dataset.suffix || '';
      const sep    = el.dataset.sep    || '';
      const t0 = performance.now();
      (function tick(now) {
        const p = clamp((now - t0) / DUR, 0, 1);
        const v = target * easeOut(p);
        let s;
        if (dec > 0) s = v.toFixed(dec);
        else { const r = Math.round(v); s = sep === ',' ? r.toLocaleString('en-US') : String(r); }
        el.textContent = s + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.3 });
  els.forEach(el => io.observe(el));
}
initCounters();

/* ╔══════════════════════════════════════════╗
   ║  SCROLL REVEAL                           ║
   ╚══════════════════════════════════════════╝ */
(function initScrollReveal() {
  const selectors = [
    '.hc-metrics__grid .hc-mcard',
    '.ademo__header',
    '.hc-bento__header',
    '.hc-bento__grid .hc-bcard',
    '.pillar-card',
    '.roadmap-phase .phase-card',
    '.domain-card-scope',
    '.globe-insight-card',
    '.hero-stat',
  ];
  selectors.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 70) + 'ms';
    });
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));
})();

/* ╔══════════════════════════════════════════╗
   ║  3D TILT ON CARDS                        ║
   ╚══════════════════════════════════════════╝ */
(function initTilt() {
  const cards = $$('.hc-bcard, .hc-mcard, .pillar-card, .domain-card-scope, .globe-insight-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(700px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  FPS COUNTER                             ║
   ╚══════════════════════════════════════════╝ */
(function initFps() {
  const el = $('#hcFps');
  if (!el) return;
  let last = performance.now(), frames = 0;
  (function loop() {
    const now = performance.now();
    frames++;
    if (now - last >= 1000) {
      el.textContent = clamp(Math.round(frames * 1000 / (now - last)), 55, 60);
      frames = 0; last = now;
    }
    requestAnimationFrame(loop);
  })();
})();

/* ╔══════════════════════════════════════════╗
   ║  TYPEWRITER                              ║
   ╚══════════════════════════════════════════╝ */
(function initTypewriter() {
  const el = $('#hcTypewriter');
  if (!el) return;
  const words = ['count', 'confidence', 'density level', 'process time'];
  let wi = 0, ci = 0, del = false;
  const type = () => {
    const w = words[wi];
    if (!del) { el.textContent = w.slice(0, ++ci); if (ci === w.length) { del = true; return setTimeout(type, 1800); } }
    else       { el.textContent = w.slice(0, --ci); if (ci === 0) { del = false; wi = (wi + 1) % words.length; } }
    setTimeout(type, del ? 55 : 85);
  };
  setTimeout(type, 1000);
})();

/* ╔══════════════════════════════════════════╗
   ║  HERO PARTICLE CANVAS                    ║
   ╚══════════════════════════════════════════╝ */
(function initHeroCanvas() {
  const canvas = $('#heroNeuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;
  const N = 70, DIST = 110;

  const colors = [
    [98,64,216],   // violet
    [26,128,196],  // sky
    [46,200,152],  // mint
    [240,128,96],  // peach
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 480;
    H = canvas.height = canvas.offsetHeight || 480;
  }

  function make() {
    pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.5 + 1.5,
      c: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.45 + 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < DIST) {
          const a = (1 - d/DIST) * 0.18;
          const [r,g,b] = pts[i].c;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth = 1;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      const [r,g,b] = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
      ctx.fill();
    });
  }

  function update() {
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > W) { p.x = W; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > H) { p.y = H; p.vy *= -1; }
    });
  }

  resize(); make();
  window.addEventListener('resize', () => { resize(); make(); });
  (function loop() { update(); draw(); requestAnimationFrame(loop); })();
})();

/* ╔══════════════════════════════════════════╗
   ║  DROP ZONE                               ║
   ╚══════════════════════════════════════════╝ */
(function initDropZone() {
  const dz   = $('#dropZoneUltimate');
  const inp  = $('#fileInputUltimate');
  const clr  = $('#adzClear');
  const fnEl = $('#adzFileName');
  const fsEl = $('#adzFileSize');
  if (!dz) return;

  const fmt = b => b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB';

  const load = f => {
    if (!f) return;
    dz.classList.add('ademo__dz--loaded');
    dz.classList.remove('ademo__dz--dragover');
    if (fnEl) fnEl.textContent = f.name;
    if (fsEl) fsEl.textContent = fmt(f.size);
    showToast('📎 ' + f.name + ' loaded');
  };

  dz.addEventListener('click', () => inp && inp.click());
  dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') inp && inp.click(); });
  if (inp) inp.addEventListener('change', () => inp.files[0] && load(inp.files[0]));

  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('ademo__dz--dragover'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('ademo__dz--dragover'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && inp) { const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; }
    load(f);
  });

  if (clr) {
    clr.addEventListener('click', e => {
      e.stopPropagation();
      dz.classList.remove('ademo__dz--loaded');
      if (inp) inp.value = '';
      if (fnEl) fnEl.textContent = '—';
      if (fsEl) fsEl.textContent = '—';
    });
  }
})();

/* ╔══════════════════════════════════════════╗
   ║  REAL SUBMIT FLOW (UPLOAD -> PROCESSING) ║
   ╚══════════════════════════════════════════╝ */
(function initPredictFlow() {
  const form = $('#predictForm');
  const fileInput = $('#fileInputUltimate');
  if (!form || !fileInput) return;

  const uploadStage = $('#demoStageUpload');
  const processStage = $('#demoStageProcessing');
  const railUpload = $('#ademoRailUpload');
  const railProcess = $('#ademoRailProcess');
  const railResults = $('#ademoRailResults');
  const railProgress = $('#ademoPipelineProgress');
  const progressBar = $('#processingProgress');
  const progressPct = $('#processingPercent');
  const progressStatus = $('#adeCurrentStage');
  const runBtn = $('#simulateUploadBtn');

  const setRail = step => {
    [railUpload, railProcess, railResults].forEach(el => {
      if (!el) return;
      el.classList.remove('ademo__rail-step--active', 'ademo__rail-step--done');
      el.removeAttribute('aria-current');
    });
    if (step === 'processing') {
      railUpload?.classList.add('ademo__rail-step--done');
      railProcess?.classList.add('ademo__rail-step--active');
      railProcess?.setAttribute('aria-current', 'step');
      if (railProgress) railProgress.style.width = '66%';
      return;
    }
    if (step === 'results') {
      railUpload?.classList.add('ademo__rail-step--done');
      railProcess?.classList.add('ademo__rail-step--done');
      railResults?.classList.add('ademo__rail-step--active');
      railResults?.setAttribute('aria-current', 'step');
      if (railProgress) railProgress.style.width = '100%';
      return;
    }
    railUpload?.classList.add('ademo__rail-step--active');
    railUpload?.setAttribute('aria-current', 'step');
    if (railProgress) railProgress.style.width = '0%';
  };

  const setStage = stageEl => {
    $$('.ademo__stage').forEach(el => el.classList.remove('active'));
    stageEl?.classList.add('active');
  };

  form.addEventListener('submit', e => {
    if (form.dataset.submitting === '1') return;
    if (!fileInput.files || fileInput.files.length === 0) {
      e.preventDefault();
      showToast('Please upload an image before running analysis.');
      return;
    }

    e.preventDefault();
    form.dataset.submitting = '1';
    setStage(processStage);
    setRail('processing');
    if (runBtn) {
      runBtn.disabled = true;
      runBtn.textContent = 'Submitting...';
    }

    let pct = 6;
    const labels = [
      'Validating upload...',
      'Running model inference...',
      'Generating density heatmap...',
      'Preparing response...',
    ];
    let idx = 0;
    if (progressStatus) progressStatus.textContent = labels[0];

    const timer = setInterval(() => {
      pct = Math.min(92, pct + Math.floor(Math.random() * 11) + 5);
      if (progressBar) progressBar.style.width = pct + '%';
      if (progressPct) progressPct.textContent = pct + '%';
      progressBar?.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', String(pct));
      if (pct >= 25 && idx < labels.length - 1) {
        idx += 1;
        if (progressStatus) progressStatus.textContent = labels[idx];
      }
    }, 180);

    setTimeout(() => {
      clearInterval(timer);
      if (progressBar) progressBar.style.width = '100%';
      if (progressPct) progressPct.textContent = '100%';
      if (progressStatus) progressStatus.textContent = 'Finalizing backend response...';
      form.submit();
    }, 2300);
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  CTA BUTTONS                             ║
   ╚══════════════════════════════════════════╝ */
(function initCta() {
  $('#hcUploadBtn')?.addEventListener('click', () => {
    $('#aiDemoSection')?.scrollIntoView({ behavior:'smooth', block:'start' });
    setTimeout(() => $('#fileInputUltimate')?.click(), 800);
  });
  $('#hcExploreBtn')?.addEventListener('click', () => $('.hc-bento')?.scrollIntoView({ behavior:'smooth', block:'start' }));
  $('#adeDownloadBtn')?.addEventListener('click', e => {
    const btn = e.currentTarget;
    if (!btn) return;
    const count = btn.getAttribute('data-count');
    if (!count) {
      showToast('Run an analysis first to generate a report.');
      return;
    }
    showToast('Generating report…');
    const params = new URLSearchParams({
      count: btn.getAttribute('data-count') || '',
      confidence: btn.getAttribute('data-confidence') || '',
      process_time_ms: btn.getAttribute('data-process') || '',
      density_level: btn.getAttribute('data-density') || '',
      uploaded_image: btn.getAttribute('data-uploaded') || '',
      result_image: btn.getAttribute('data-result') || ''
    });
    window.location.href = `/download-report?${params.toString()}`;
  });
  $('#resetDemoBtn')?.addEventListener('click', () => {
    window.location.href = '/home.html';
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  SCOPE: MESH CANVAS                      ║
   ╚══════════════════════════════════════════╝ */
(function initMeshCanvas() {
  const c = $('#meshCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H;

  const colorSets = [
    [98,64,216], [26,128,196], [46,200,152], [240,128,96], [240,160,32]
  ];

  const pts = Array.from({length:50}, () => ({
    x:0,y:0,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,
    c: colorSets[Math.floor(Math.random()*colorSets.length)]
  }));

  function resize() {
    W = c.width  = c.parentElement.offsetWidth  || 800;
    H = c.height = c.parentElement.offsetHeight || 480;
    pts.forEach(p => { p.x = Math.random()*W; p.y = Math.random()*H; });
  }

  (function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => { p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1; });
    for (let i=0;i<pts.length;i++) {
      for (let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if (d < 120) {
          const a=(1-d/120)*0.14,[r,g,b]=pts[i].c;
          ctx.beginPath(); ctx.strokeStyle=`rgba(${r},${g},${b},${a})`; ctx.lineWidth=1;
          ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      const [r,g,b]=p.c;
      ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},0.4)`; ctx.fill();
    });
    requestAnimationFrame(draw);
  })();

  window.addEventListener('resize', resize);
  resize();
})();

/* ╔══════════════════════════════════════════╗
   ║  SCOPE: GLOBE CANVAS                     ║
   ╚══════════════════════════════════════════╝ */
(function initGlobe() {
  const c = $('#scopeGlobeCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;

  // City nodes (approximate normalized coordinates)
  const nodes = [
    { x:0.50, y:0.32, state:'active',   label:'London' },
    { x:0.54, y:0.34, state:'active',   label:'Paris' },
    { x:0.60, y:0.38, state:'active',   label:'Istanbul' },
    { x:0.71, y:0.40, state:'active',   label:'Mumbai' },
    { x:0.77, y:0.45, state:'active',   label:'Bengaluru' },
    { x:0.82, y:0.38, state:'planned',  label:'Tokyo' },
    { x:0.85, y:0.48, state:'planned',  label:'Singapore' },
    { x:0.38, y:0.35, state:'research', label:'New York' },
    { x:0.32, y:0.40, state:'research', label:'São Paulo' },
    { x:0.62, y:0.60, state:'planned',  label:'Cape Town' },
    { x:0.66, y:0.34, state:'active',   label:'Dubai' },
    { x:0.27, y:0.30, state:'planned',  label:'Chicago' },
  ];

  const stateColors = {
    active:   [46,200,152],
    planned:  [98,64,216],
    research: [240,160,32],
  };

  let t = 0;
  let pulseRings = nodes.filter(n => n.state === 'active').map(n => ({ node:n, progress:Math.random() }));

  (function draw() {
    ctx.clearRect(0,0,W,H);

    // Background
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#e8f5ff'); bg.addColorStop(0.5,'#f2effe'); bg.addColorStop(1,'#e8faf3');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // World map grid
    ctx.strokeStyle='rgba(98,64,216,0.06)'; ctx.lineWidth=1;
    for (let lx=0;lx<W;lx+=W/12) { ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,H); ctx.stroke(); }
    for (let ly=0;ly<H;ly+=H/6)  { ctx.beginPath(); ctx.moveTo(0,ly); ctx.lineTo(W,ly); ctx.stroke(); }

    // Connection lines between active nodes
    const activeNodes = nodes.filter(n=>n.state==='active');
    for (let i=0;i<activeNodes.length-1;i++) {
      const a=activeNodes[i], b=activeNodes[i+1];
      const pulse = 0.3 + 0.3*Math.sin(t*0.04 + i*0.8);
      ctx.beginPath();
      ctx.moveTo(a.x*W, a.y*H); ctx.lineTo(b.x*W, b.y*H);
      ctx.strokeStyle=`rgba(46,200,152,${pulse})`; ctx.lineWidth=1.5;
      ctx.setLineDash([4,6]); ctx.stroke(); ctx.setLineDash([]);
    }

    // Pulse rings
    pulseRings.forEach(pr => {
      pr.progress += 0.008;
      if (pr.progress > 1) pr.progress = 0;
      const x=pr.node.x*W, y=pr.node.y*H;
      const r=pr.progress*36, a=(1-pr.progress)*0.5;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(46,200,152,${a})`; ctx.lineWidth=1.5; ctx.stroke();
    });

    // Nodes
    nodes.forEach(n => {
      const x=n.x*W, y=n.y*H;
      const [r,g,b]=stateColors[n.state];
      const pulse=0.75+0.25*Math.sin(t*0.06+x*0.01);

      // Outer glow
      const glow=ctx.createRadialGradient(x,y,0,x,y,14);
      glow.addColorStop(0,`rgba(${r},${g},${b},${pulse*0.35})`);
      glow.addColorStop(1,`rgba(${r},${g},${b},0)`);
      ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();

      // Core dot
      ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2);
      ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=1.5; ctx.stroke();
    });

    t++;
    requestAnimationFrame(draw);
  })();
})();

/* ╔══════════════════════════════════════════╗
   ║  SCOPE: PILLAR PROGRESS BARS             ║
   ╚══════════════════════════════════════════╝ */
(function initPillarBars() {
  const fills = $$('.pillar-progress-fill');
  if (!fills.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.style.animation = 'none';
      e.target.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          e.target.style.transition = 'width 1.8s cubic-bezier(0.22,1,0.36,1)';
          e.target.style.width = e.target.style.getPropertyValue('--target-width') || getComputedStyle(e.target).getPropertyValue('--target-width') || '50%';
        });
      });
    });
  }, { threshold: 0.3 });
  fills.forEach(f => io.observe(f));
})();

/* ╔══════════════════════════════════════════╗
   ║  TEAM: AVATAR IMAGE LOAD                 ║
   ╚══════════════════════════════════════════╝ */
(function initAvatarLoad() {
  $$('.avatar-image').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  TEAM: CARD TILT (stronger effect)       ║
   ╚══════════════════════════════════════════╝ */
(function initTeamTilt() {
  const cards = $$('.team-card-elite');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.setProperty('--tx', `${dx * 8}deg`);
      card.style.setProperty('--ty', `${-dy * 8}deg`);
      card.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateY(-12px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  A11Y: KEYBOARD INTERACTIONS             ║
   ╚══════════════════════════════════════════╝ */
(function initA11y() {
  $$('[role="button"]').forEach(el => {
    if (el.tagName !== 'BUTTON') {
      el.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); el.click(); } });
    }
  });
})();

/* ╔══════════════════════════════════════════╗
   ║  AOS (if available)                      ║
   ╚══════════════════════════════════════════╝ */
if (typeof AOS !== 'undefined') {
  AOS.init({ duration:650, easing:'ease-out', once:true, offset:60 });
}

/* ╔══════════════════════════════════════════╗
   ║  Hide legacy dark elements               ║
   ╚══════════════════════════════════════════╝ */
['shaderBg','particles-js','particleCanvas'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.style.display='none';
});

(function initHomeHeroVideoPlayback() {
  const heroVideo = document.querySelector('.hc-hero-video');
  if (!heroVideo) return;
  const applySpeed = () => { heroVideo.playbackRate = 0.68; };
  applySpeed();
  heroVideo.addEventListener('loadedmetadata', applySpeed, { once: true });
})();

(function initScopeHeroVideoPlayback() {
  const scopeVideo = document.querySelector('.scope-hero-video');
  if (!scopeVideo) return;
  const applySpeed = () => { scopeVideo.playbackRate = 0.42; };
  applySpeed();
  scopeVideo.addEventListener('loadedmetadata', applySpeed, { once: true });
})();

console.info('%cAdaptive Crowd Analytica%c v3.0 · Soft Palette Edition',
  'color:#6240d8;font-weight:700;font-size:14px',
  'color:#9888b8;font-size:11px');
})();
function initializeAboutPage() {
  console.log('📖 Initializing About Page...');
  try {

    /* ── 1. Staggered block reveal on scroll ── */
    const blocks = document.querySelectorAll('#about .ab-block');
    if (blocks.length) {
      const blockObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ab-visible');
            blockObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.10 });
      blocks.forEach((b, i) => {
        b.style.transitionDelay = `${i * 0.07}s`;
        blockObs.observe(b);
      });
    }

    /* ── 2. SVG gauge animation ── */
    const gaugeFill = document.querySelector('#about .ab-gauge-fill');
    if (gaugeFill) {
      const pct    = parseFloat(gaugeFill.dataset.pct || '0');
      const r      = 38;
      const circum = 2 * Math.PI * r;          /* ≈ 238.76 */
      gaugeFill.style.strokeDasharray  = circum;
      gaugeFill.style.strokeDashoffset = circum;
      /* inject gradient def into the SVG */
      const svg = gaugeFill.closest('svg');
      if (svg && !svg.querySelector('#abGaugeGrad')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<linearGradient id="abGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366F1"/>
          <stop offset="100%" stop-color="#A855F7"/>
        </linearGradient>`;
        svg.prepend(defs);
      }
      const gaugeObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const offset = circum - (pct / 100) * circum;
            gaugeFill.style.strokeDashoffset = offset;
            gaugeObs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      gaugeObs.observe(gaugeFill);
    }

    /* ── 4. Count-up numbers (hero stats + gauge label) ── */
    const countEls = document.querySelectorAll('#about [data-target]');
    if (countEls.length) {
      const countObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          let current  = 0;
          const step   = Math.ceil(target / 40);
          const tick   = () => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current < target) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          countObs.unobserve(el);
        });
      }, { threshold: 0.5 });
      countEls.forEach(el => countObs.observe(el));
    }

    /* ── 5. Progress bars animate in ── */
    const bars = document.querySelectorAll('#about .ab-bar-fill');
    if (bars.length) {
      const barObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const pct = bar.dataset.pct || '0';
            setTimeout(() => { bar.style.width = pct + '%'; }, 150);
            barObs.unobserve(bar);
          }
        });
      }, { threshold: 0.3 });
      bars.forEach(b => { b.style.width = '0%'; barObs.observe(b); });
    }

    /* ── 6. Pipeline node sequential pulse ── */
    const pipeNodes = document.querySelectorAll('#about .ab-pipe-node');
    if (pipeNodes.length) {
      let idx = 0;
      let pipeInterval = null;
      const pipeArea = document.querySelector('#about .ab-pipeline');

      const startPulse = () => {
        pipeInterval = setInterval(() => {
          pipeNodes.forEach(n => n.classList.remove('ab-pipe-active'));
          pipeNodes[idx].classList.add('ab-pipe-active');
          idx = (idx + 1) % pipeNodes.length;
        }, 800);
      };

      if (pipeArea) {
        const pipeAreaObs = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) { startPulse(); pipeAreaObs.disconnect(); }
          });
        }, { threshold: 0.3 });
        pipeAreaObs.observe(pipeArea);
      }

      /* tooltip on hover */
      pipeNodes.forEach(node => {
        const tip = document.getElementById('abPipeTip');
        node.addEventListener('mouseenter', () => {
          if (!tip) return;
          const text = node.dataset.tip || '';
          tip.textContent = text;
          /* position tooltip relative to pipeline container */
          const nodeRect = node.getBoundingClientRect();
          const pipeRect = node.closest('.ab-pipeline').getBoundingClientRect();
          tip.style.left = (nodeRect.left - pipeRect.left + nodeRect.width / 2) + 'px';
          tip.classList.add('ab-tip-show');
        });
        node.addEventListener('mouseleave', () => {
          if (tip) tip.classList.remove('ab-tip-show');
        });
      });
    }

    /* ── 7. Contribution cards shimmer reveal ── */
    const contribCards = document.querySelectorAll('#about .ab-contrib-card');
    if (contribCards.length) {
      const contribObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            contribObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      contribCards.forEach((c, i) => {
        c.style.opacity = '0';
        c.style.transform = 'translateY(22px)';
        c.style.transition = `opacity 0.5s ease ${i * 0.10}s, transform 0.5s cubic-bezier(.22,.68,0,1.2) ${i * 0.10}s`;
        contribObs.observe(c);
      });
    }

    console.log('✅ About Page Initialized Successfully');
  } catch (error) {
    console.error('❌ About initialization error:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAboutPage, { once: true });
} else {
  initializeAboutPage();
}
