const tabs = document.querySelectorAll('.tab[data-tab]');
const panels = document.querySelectorAll('.panel');
const tabIndicator = document.querySelector('.tab-indicator');
const loader = document.getElementById('loader');
const pageTransition = document.getElementById('pageTransition');
const toast = document.getElementById('toast');
const overlay = document.getElementById('overlay');
const previewTrigger = document.getElementById('previewTrigger');
const scopeTrigger = document.getElementById('scopeTrigger');
const closeOverlay = document.getElementById('closeOverlay');
const uploadTrigger = document.getElementById('uploadTrigger');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const simulateBtn = document.getElementById('simulateBtn');
const pipelineState = document.getElementById('pipelineState');
const avgCount = document.getElementById('avgCount');
const confidence = document.getElementById('confidence');
const fpsNode = document.getElementById('fps');
const progressBar = document.getElementById('progressBar');
const cursorGlow = document.querySelector('.cursor-glow');
const orbs = document.querySelectorAll('.bg-orb');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const particleCanvas = document.getElementById('particleCanvas');
const infoLines = document.querySelectorAll('.info-line');
const counterNodes = document.querySelectorAll('[data-counter]');
const aiStage = document.getElementById('aiStage');
const aiUpload = document.getElementById('aiUpload');
const aiProcessing = document.getElementById('aiProcessing');
const aiResult = document.getElementById('aiResult');
const aiUploadInput = document.getElementById('aiUploadInput');
const aiProgressFill = document.getElementById('aiProgressFill');
const aiProgressLabel = document.getElementById('aiProgressLabel');
const aiResultCount = document.getElementById('aiResultCount');
const aiConfidence = document.getElementById('aiConfidence');
const aiTime = document.getElementById('aiTime');
const aiConfidenceFill = document.getElementById('aiConfidenceFill');
const aiResultImage = document.getElementById('aiResultImage');
const aiResultVideo = document.getElementById('aiResultVideo');
const aiReset = document.getElementById('aiReset');
const nnCanvas = document.getElementById('nnCanvas');
const processSteps = document.querySelectorAll('.process-step');
const scopeVision = document.getElementById('scopeVision');
const teamVision = document.getElementById('teamVision');
const tiltCards = document.querySelectorAll('[data-tilt]');
const aboutResearch = document.getElementById('aboutResearch');

const updateIndicator = () => {
  if (!tabIndicator) return;
  const activeTab = document.querySelector('.tab.active');
  if (!activeTab) return;
  const tabsRect = activeTab.parentElement.getBoundingClientRect();
  const tabRect = activeTab.getBoundingClientRect();
  const width = tabRect.width;
  const offset = tabRect.left - tabsRect.left;
  tabIndicator.style.width = `${width}px`;
  tabIndicator.style.transform = `translateX(${offset}px)`;
};

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
};

const switchTab = (tabName) => {
  if (pageTransition) {
    pageTransition.classList.add('active');
  }
  tabs.forEach(tab => {
    const active = tab.dataset.tab === tabName;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  try {
    panels.forEach(panel => {
      if (panel.id === tabName) {
        panel.classList.add('active');
        if (window.gsap) {
          gsap.fromTo(panel, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        }
      } else {
        if (panel.classList.contains('active')) {
          panel.classList.add('leaving');
          setTimeout(() => {
            panel.classList.remove('active', 'leaving');
          }, 350);
        } else {
          panel.classList.remove('active');
        }
      }
    });
  } finally {
    updateIndicator();

    setTimeout(() => {
      if (pageTransition) {
        pageTransition.classList.remove('active');
      }
    }, 300);
  }
};

tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

document.querySelectorAll('button, .upload-action, .portal-action').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

window.addEventListener('resize', updateIndicator);
updateIndicator();

window.addEventListener('load', () => {
  if (loader) {
    loader.classList.add('hidden');
  }
});

if (previewTrigger && overlay) {
  previewTrigger.addEventListener('click', () => {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
  });
}

if (scopeTrigger) {
  scopeTrigger.addEventListener('click', () => {
    if (tabs.length) {
      switchTab('scope');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/templates/scope.html';
    }
  });
}

if (closeOverlay && overlay) {
  closeOverlay.addEventListener('click', () => {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  });
}

if (overlay) {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
  });
}

if (uploadTrigger && fileInput) {
  uploadTrigger.addEventListener('click', () => {
    fileInput.click();
  });
}

if (dropZone) {
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('active');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('active');
    const files = event.dataTransfer.files;
    handleFiles(files);
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    handleFiles(event.target.files);
  });
}

const handleFiles = (files) => {
  if (!files || files.length === 0) return;
  if (!pipelineState || !progressBar) return;
  pipelineState.textContent = `Loaded ${files.length} file(s)`;
  progressBar.style.width = '18%';
};

if (simulateBtn) {
  simulateBtn.addEventListener('click', () => {
  if (!pipelineState || !avgCount || !confidence || !progressBar) return;
  pipelineState.textContent = 'Running';
  avgCount.textContent = '--';
  confidence.textContent = '--';
  progressBar.style.width = '0%';

  const fakeCount = Math.floor(320 + Math.random() * 180);
  const fakeConfidence = (0.82 + Math.random() * 0.12).toFixed(2);

  const steps = [20, 45, 70, 100];
  steps.forEach((step, idx) => {
    setTimeout(() => {
      progressBar.style.width = `${step}%`;
    }, 300 + idx * 260);
  });

  setTimeout(() => {
    pipelineState.textContent = 'Complete';
    avgCount.textContent = `${fakeCount} avg`;
    confidence.textContent = `${fakeConfidence} σ`;
  }, 1400);
  });
}

const typewriter = (node, speed = 26) => {
  if (!node) return;
  const text = node.dataset.text || node.textContent || '';
  node.textContent = '';
  node.classList.add('typing');
  let i = 0;
  const tick = () => {
    node.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) {
      setTimeout(tick, speed + Math.random() * 18);
    } else {
      node.classList.remove('typing');
    }
  };
  tick();
};

const animateCounters = () => {
  counterNodes.forEach((node) => {
    const target = parseFloat(node.dataset.target || '0');
    const decimals = parseInt(node.dataset.decimals || '0', 10);
    const suffix = node.dataset.suffix || '';

    if (window.CountUp) {
      const counter = new window.CountUp.CountUp(node, target, {
        duration: 2,
        decimalPlaces: decimals,
        suffix
      });
      if (!counter.error) {
        counter.start();
        return;
      }
    }

    const duration = 1600 + Math.random() * 600;
    const start = performance.now();
    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const value = target * (0.15 + 0.85 * progress);
      const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
      node.textContent = `${display}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  });
};

const revealInfoLines = () => {
  infoLines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-on');
    }, 900 + idx * 220);
  });
};

const playHeroSequence = () => {
  if (!heroTitle || !heroSubtitle) return;
  if (particleCanvas) {
    particleCanvas.style.opacity = '1';
  }

  if (window.gsap) {
    gsap.set('.hero-seq', { opacity: 0, y: 16 });
    const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' } });
    tl.to(heroTitle, { opacity: 1, y: 0, duration: 0.6 }, 0);
    tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 0.7 }, 0.5);
    tl.to('#glassInfo', { opacity: 1, y: 0, duration: 0.7 }, 0.7);
    tl.to('#liveStats', { opacity: 1, y: 0, duration: 0.7 }, 0.9);
    tl.to('.hero-actions', { opacity: 1, y: 0, duration: 0.7 }, 1.1);
    tl.to('.hero-right', { opacity: 1, y: 0, duration: 0.9 }, 1.2);
  } else {
    document.querySelectorAll('.hero-seq').forEach((node) => {
      node.style.opacity = '1';
      node.style.transform = 'translateY(0)';
    });
  }

  typewriter(heroTitle);
  setTimeout(revealInfoLines, 900);
  setTimeout(animateCounters, 1300);
};

if (heroTitle) {
  playHeroSequence();
}

// Scroll reveal
const revealElements = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      if (window.gsap) {
        gsap.fromTo(entry.target, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

revealElements.forEach(el => revealObserver.observe(el));

const setAIMode = (mode) => {
  if (!aiStage) return;
  aiStage.classList.toggle('processing', mode === 'processing');
  aiUpload.classList.toggle('is-active', mode === 'upload');
  aiProcessing.classList.toggle('is-active', mode === 'processing');
  aiResult.classList.toggle('is-active', mode === 'result');
};

const animateCount = (node, target, duration = 1600) => {
  if (window.CountUp) {
    const counter = new window.CountUp.CountUp(node, target, { duration: duration / 1000 });
    if (!counter.error) {
      counter.start();
      return;
    }
  }
  const start = performance.now();
  const step = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const value = Math.round(target * (0.15 + 0.85 * progress));
    node.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const runAIPipeline = () => {
  if (!aiStage) return;
  aiStage.classList.add('processing');
  processSteps.forEach(step => step.classList.remove('active'));
  aiProgressFill.style.width = '0%';
  aiProgressLabel.textContent = 'Initializing feature encoder…';

  setTimeout(() => {
    setAIMode('processing');
  }, 300);

  const stages = [
    { label: 'Frame extraction running…', progress: 25, time: 1500 },
    { label: 'Encoding multi-scale features…', progress: 55, time: 1500 },
    { label: 'Generating density regression map…', progress: 82, time: 2000 },
    { label: 'Output aggregation in progress…', progress: 100, time: 1000 }
  ];

  let elapsed = 0;
  stages.forEach((stage, idx) => {
    elapsed += stage.time;
    setTimeout(() => {
      processSteps[idx].classList.add('active');
      aiProgressLabel.textContent = stage.label;
      aiProgressFill.style.width = `${stage.progress}%`;
    }, elapsed - stage.time + 300);
  });

  setTimeout(() => {
    setAIMode('result');
    const count = Math.floor(170 + Math.random() * 120);
    const confidenceValue = 0.87 + Math.random() * 0.1;
    const timeValue = (3.0 + Math.random() * 0.6).toFixed(1);
    aiConfidence.textContent = `${(confidenceValue * 100).toFixed(1)}%`;
    aiTime.textContent = `${timeValue}s`;
    aiConfidenceFill.style.width = `${confidenceValue * 100}%`;
    animateCount(aiResultCount, count);
  }, 6200);
};

const handleAIUpload = (file) => {
  if (!file) return;
  if (window.AudioContext || window.webkitAudioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = () => {
      aiResultImage.src = reader.result;
      aiResultImage.style.display = 'block';
      aiResultVideo.style.display = 'none';
    };
    reader.readAsDataURL(file);
  } else if (file.type.startsWith('video/')) {
    const url = URL.createObjectURL(file);
    aiResultVideo.src = url;
    aiResultVideo.style.display = 'block';
    aiResultImage.style.display = 'none';
  }
  showToast('AI ingest started');
  runAIPipeline();
};

if (aiStage) {
  setAIMode('upload');
  aiStage.addEventListener('dragover', (event) => {
    event.preventDefault();
    aiStage.classList.add('dragging');
  });
  aiStage.addEventListener('dragleave', () => {
    aiStage.classList.remove('dragging');
  });
  aiStage.addEventListener('drop', (event) => {
    event.preventDefault();
    aiStage.classList.remove('dragging');
    const file = event.dataTransfer.files[0];
    handleAIUpload(file);
  });
}

if (aiUploadInput) {
  aiUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleAIUpload(file);
  });
}

if (aiReset) {
  aiReset.addEventListener('click', () => {
    setAIMode('upload');
    aiProgressFill.style.width = '0%';
    aiProgressLabel.textContent = 'Initializing feature encoder…';
    aiResultCount.textContent = '0';
    aiConfidence.textContent = '--';
    aiTime.textContent = '--';
    aiConfidenceFill.style.width = '0%';
    aiResultImage.removeAttribute('src');
    aiResultVideo.removeAttribute('src');
    aiResultVideo.load();
  });
}

if (scopeVision) {
  const scopeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        scopeVision.classList.add('is-live');
        scopeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  scopeObserver.observe(scopeVision);
}

if (teamVision) {
  const teamObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        teamVision.classList.add('is-live');
        teamObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  teamObserver.observe(teamVision);
}

if (aboutResearch) {
  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        aboutResearch.classList.add('is-live');
        aboutObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  aboutObserver.observe(aboutResearch);
}

tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateX = (-y * 8).toFixed(2);
    const rotateY = (x * 8).toFixed(2);
    card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max: 8,
    speed: 400,
    glare: true,
    "max-glare": 0.2
  });
}

if (window.AOS) {
  AOS.init({ duration: 800, once: true, easing: 'ease-out' });
}

if (window.particlesJS) {
  window.particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: ['#38e0ff', '#8a5cff'] },
      shape: { type: 'circle' },
      opacity: { value: 0.35, random: true },
      size: { value: 2, random: true },
      line_linked: { enable: true, distance: 140, color: '#38e0ff', opacity: 0.2, width: 1 },
      move: { enable: true, speed: 0.6 }
    },
    interactivity: {
      events: { onhover: { enable: true, mode: 'grab' } },
      modes: { grab: { distance: 140, line_linked: { opacity: 0.4 } } }
    },
    retina_detect: true
  });
}

// Cursor glow + parallax orbs
let mouseX = 0;
let mouseY = 0;
let rafPending = false;

const updateGlow = () => {
  cursorGlow.style.transform = `translate(${mouseX - 130}px, ${mouseY - 130}px)`;
  cursorGlow.style.opacity = '1';
  orbs.forEach((orb, index) => {
    const depth = (index + 1) * 0.02;
    const tx = (mouseX - window.innerWidth / 2) * depth;
    const ty = (mouseY - window.innerHeight / 2) * depth;
    orb.style.setProperty('--orb-x', `${tx}px`);
    orb.style.setProperty('--orb-y', `${ty}px`);
  });
  rafPending = false;
};

window.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(updateGlow);
  }
});

window.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});

// Button hotspot tracking
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('pointermove', (event) => {
    const rect = btn.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--x', `${x}%`);
    btn.style.setProperty('--y', `${y}%`);
  });
});

// Lottie animations
if (window.lottie) {
  document.querySelectorAll('.lottie').forEach((container) => {
    const path = container.dataset.lottie;
    window.lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path
    });
  });
}

// Shader background
const shaderCanvas = document.getElementById('shaderBg');
const gl = shaderCanvas.getContext('webgl');
if (gl) {
  const vertexSrc = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSrc = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = st * 3.0;
      float n = noise(p + u_time * 0.05);
      float wave = sin((st.x + u_time * 0.05) * 8.0) * 0.04;
      vec3 color = vec3(0.02, 0.05, 0.1) + vec3(0.0, 0.35, 0.45) * n + vec3(0.0, 0.2, 0.15) * wave;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  };

  const vertexShader = compile(gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const position = gl.getAttribLocation(program, 'position');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');

  const resizeGL = () => {
    shaderCanvas.width = window.innerWidth;
    shaderCanvas.height = window.innerHeight;
    gl.viewport(0, 0, shaderCanvas.width, shaderCanvas.height);
    gl.uniform2f(uResolution, shaderCanvas.width, shaderCanvas.height);
  };

  const renderGL = (time) => {
    gl.uniform1f(uTime, time * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(renderGL);
  };

  window.addEventListener('resize', resizeGL);
  resizeGL();
  requestAnimationFrame(renderGL);
}

// Particle network background
if (particleCanvas) {
  const ctx = particleCanvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];

  const resizeParticles = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    particleCanvas.width = width;
    particleCanvas.height = height;
    const count = Math.min(90, Math.max(50, Math.floor(width / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    }));
  };

  const drawParticles = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(78, 196, 255, 0.7)';
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          ctx.strokeStyle = `rgba(138, 92, 255, ${0.12 - dist / 1400})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  };

  window.addEventListener('resize', resizeParticles);
  resizeParticles();
  requestAnimationFrame(drawParticles);
}

if (nnCanvas) {
  const ctx = nnCanvas.getContext('2d');
  let nodes = [];

  const resizeNN = () => {
    nnCanvas.width = nnCanvas.clientWidth;
    nnCanvas.height = nnCanvas.clientHeight;
    nodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * nnCanvas.width,
      y: Math.random() * nnCanvas.height,
      pulse: Math.random() * Math.PI * 2
    }));
  };

  const drawNN = () => {
    ctx.clearRect(0, 0, nnCanvas.width, nnCanvas.height);
    nodes.forEach((node, i) => {
      node.pulse += 0.02;
      const glow = 0.6 + Math.sin(node.pulse) * 0.4;
      ctx.fillStyle = `rgba(56, 224, 255, ${0.5 + glow * 0.5})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = node.x - nodes[j].x;
        const dy = node.y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          ctx.strokeStyle = `rgba(138, 92, 255, ${0.25 - dist / 900})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(drawNN);
  };

  window.addEventListener('resize', resizeNN);
  resizeNN();
  requestAnimationFrame(drawNN);
}

// Three.js density scene
const threeCanvas = document.getElementById('densityCanvas');
if (window.THREE && threeCanvas) {
  const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 520 / 360, 0.1, 1000);
  camera.position.set(0, 0, 9);

  const resizeThree = () => {
    const { width, height } = threeCanvas.getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
  };

  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.12, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffa3, emissive: 0x00bda0, roughness: 0.2 });

  for (let i = 0; i < 180; i += 1) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 3.5,
      (Math.random() - 0.5) * 4
    );
    mesh.material.color.setHSL(0.5 + Math.random() * 0.2, 0.8, 0.55);
    group.add(mesh);
  }

  const ambient = new THREE.AmbientLight(0x3de4ff, 0.6);
  const point = new THREE.PointLight(0x00ffa3, 1.2, 20);
  point.position.set(2, 2, 6);

  scene.add(group);
  scene.add(ambient);
  scene.add(point);

  let lastTime = performance.now();
  let frames = 0;

  const animate = (time) => {
    group.rotation.y += 0.0015;
    group.rotation.x = Math.sin(time * 0.0004) * 0.2;

    renderer.render(scene, camera);

    frames += 1;
    if (time - lastTime > 1000) {
      const fps = Math.round((frames * 1000) / (time - lastTime));
      fpsNode.textContent = fps.toString();
      lastTime = time;
      frames = 0;
    }

    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resizeThree);
  resizeThree();
  requestAnimationFrame(animate);
}
