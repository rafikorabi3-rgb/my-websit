'use strict';

/* ──────────────────────────────────────
   STATE
────────────────────────────────────── */
let selectedColor = '#6C63FF';
let isPlaying = false;
let animFrameId = null;
let currentScene = 0;
let sceneProgress = 0;
let videoScenes = [];
let outputCtx, outputCanvas;

/* ──────────────────────────────────────
   INIT
────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  outputCanvas = document.getElementById('outputCanvas');
  outputCtx = outputCanvas.getContext('2d');

  initParticles();
  animatePreviewCanvas();
  initShowcaseCanvases();
  observeFeatureCards();
});

/* ──────────────────────────────────────
   PARTICLES
────────────────────────────────────── */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      animation-duration: ${6 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 8}s;
      background: ${Math.random() > 0.5 ? '#6C63FF' : '#FF6584'};
    `;
    container.appendChild(p);
  }
}

/* ──────────────────────────────────────
   PREVIEW CANVAS (hero)
────────────────────────────────────── */
let previewT = 0;
function animatePreviewCanvas() {
  const canvas = document.getElementById('previewCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  function draw() {
    previewT += 0.015;
    ctx.clearRect(0, 0, W, H);

    // background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0D0D1A');
    bg.addColorStop(1, '#12122A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // animated grid lines
    ctx.strokeStyle = 'rgba(108,99,255,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // glowing orb
    const cx = W / 2 + Math.sin(previewT * 0.8) * 60;
    const cy = H / 2 + Math.cos(previewT * 0.6) * 30;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
    grd.addColorStop(0, 'rgba(108,99,255,0.35)');
    grd.addColorStop(1, 'rgba(108,99,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // waveform
    ctx.strokeStyle = `rgba(108,99,255,0.7)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const y = H / 2 + Math.sin((x / W) * Math.PI * 6 + previewT * 2) * 20
               + Math.sin((x / W) * Math.PI * 12 + previewT * 3) * 10;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // glowing dots
    const dots = [
      { x: 0.15, y: 0.3, r: 4, color: '#6C63FF' },
      { x: 0.5, y: 0.7, r: 6, color: '#FF6584' },
      { x: 0.8, y: 0.25, r: 5, color: '#43E97B' },
      { x: 0.65, y: 0.6, r: 3, color: '#F7971E' },
    ];
    dots.forEach((d, i) => {
      const px = d.x * W + Math.sin(previewT + i) * 10;
      const py = d.y * H + Math.cos(previewT * 0.7 + i) * 8;
      const g2 = ctx.createRadialGradient(px, py, 0, px, py, d.r * 4);
      g2.addColorStop(0, d.color + 'AA');
      g2.addColorStop(1, d.color + '00');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(px, py, d.r * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(px, py, d.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // text overlay
    ctx.fillStyle = 'rgba(232,232,240,0.9)';
    ctx.font = 'bold 14px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('جاري التحليل بالذكاء الاصطناعي…', W / 2, H - 24);

    requestAnimationFrame(draw);
  }
  draw();
}

/* ──────────────────────────────────────
   COLOR SELECTION
────────────────────────────────────── */
function selectColor(el, color) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  selectedColor = color;
}

/* ──────────────────────────────────────
   VIDEO GENERATION
────────────────────────────────────── */
function generateVideo() {
  const prompt = document.getElementById('promptInput').value.trim();
  const type   = document.getElementById('videoType').value;
  const dur    = parseInt(document.getElementById('duration').value);
  const style  = document.getElementById('style').value;

  if (!prompt) {
    alert('يرجى كتابة وصف المشروع أولاً');
    return;
  }

  const btn = document.getElementById('generateBtn');
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span> جاري التوليد…';
  btn.disabled = true;

  clearLog();
  document.getElementById('canvasOverlay').classList.add('hidden');
  document.getElementById('playBtn').disabled = true;
  document.getElementById('downloadBtn').disabled = true;

  videoScenes = buildScenes(prompt, type, style, dur);
  renderTimeline(videoScenes);

  runGenerationLog(videoScenes, () => {
    btn.classList.remove('loading');
    btn.innerHTML = '<span class="btn-icon">✅</span> تم التوليد — جرّب مرة أخرى';
    btn.disabled = false;
    document.getElementById('playBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
    startVideoPlayback();
  });
}

/* Build scene list from prompt */
function buildScenes(prompt, type, style, dur) {
  const words = prompt.split(/\s+/).slice(0, 60);
  const sceneCount = Math.min(6, Math.max(3, Math.floor(dur / 15)));

  const titles = extractTitles(words, type);
  const scenes = [];
  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      id: i,
      title: titles[i] || `مشهد ${i + 1}`,
      duration: Math.floor(dur / sceneCount),
      color: selectedColor,
      styleKey: style,
    });
  }
  return scenes;
}

function extractTitles(words, type) {
  const defaults = {
    explainer: ['مقدمة المشروع', 'المشكلة والحل', 'المميزات الرئيسية', 'آلية العمل', 'التصميم التقني', 'الخاتمة والدعوة'],
    tutorial:  ['التهيئة والإعداد', 'الخطوة الأولى', 'الخطوة الثانية', 'الخطوة الثالثة', 'نتائج وتجربة', 'ملخص وموارد'],
    pitch:     ['نظرة عامة', 'حجم السوق', 'الحل المقترح', 'نموذج الإيرادات', 'الخطة التنفيذية', 'الفريق والاتصال'],
    promo:     ['لقطة الجذب', 'العرض الرئيسي', 'الشهادات', 'المقارنة', 'العرض الخاص', 'الدعوة للعمل'],
  };
  return defaults[type] || defaults.explainer;
}

/* ──────────────────────────────────────
   GENERATION LOG
────────────────────────────────────── */
function clearLog() {
  document.getElementById('logBody').innerHTML = '';
}

function addLog(msg, type = 'info') {
  const body = document.getElementById('logBody');
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  const t = new Date().toLocaleTimeString('ar-SA');
  line.textContent = `[${t}] ${msg}`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

const LOG_STEPS = [
  { msg: '[NLP] تحليل النص وفهم السياق…', type: 'info', delay: 200 },
  { msg: '[NLP] استخراج الكيانات والمواضيع الرئيسية…', type: 'info', delay: 600 },
  { msg: '[PLAN] بناء هيكل المشاهد والسيناريو…', type: 'info', delay: 1000 },
  { msg: '[IMG] توليد الصور بنموذج Diffusion…', type: 'warn', delay: 1500 },
  { msg: '[IMG] رفع الجودة إلى 1080p…', type: 'warn', delay: 2000 },
  { msg: '[ANIM] إضافة الرسوم المتحركة والانتقالات…', type: 'info', delay: 2500 },
  { msg: '[TTS] تحويل النص إلى كلام…', type: 'info', delay: 3000 },
  { msg: '[TTS] معالجة الصوت وإضافة الموسيقى…', type: 'info', delay: 3400 },
  { msg: '[RENDER] دمج المشاهد في فيديو واحد…', type: 'warn', delay: 3800 },
  { msg: '[RENDER] ضغط الفيديو بترميز H.264…', type: 'warn', delay: 4200 },
  { msg: '✅ اكتمل التوليد بنجاح!', type: 'success', delay: 4700 },
];

function runGenerationLog(scenes, onDone) {
  scenes.forEach(s => addLog(`[PLAN] مشهد: "${s.title}"`, 'info'));

  LOG_STEPS.forEach(step => {
    setTimeout(() => addLog(step.msg, step.type), step.delay);
  });

  setTimeout(onDone, 5000);
}

/* ──────────────────────────────────────
   TIMELINE
────────────────────────────────────── */
function renderTimeline(scenes) {
  const container = document.getElementById('timelineScenes');
  container.innerHTML = '';
  scenes.forEach((s, i) => {
    const pill = document.createElement('div');
    pill.className = 'scene-pill' + (i === 0 ? ' active' : '');
    pill.id = `pill-${i}`;
    pill.textContent = s.title;
    container.appendChild(pill);
  });
}

function updateTimeline(sceneIndex, progress) {
  document.querySelectorAll('.scene-pill').forEach((p, i) => {
    p.classList.toggle('active', i === sceneIndex);
  });
  const total = (sceneIndex / videoScenes.length + progress / videoScenes.length) * 100;
  document.getElementById('timelineProgress').style.width = total + '%';
}

/* ──────────────────────────────────────
   VIDEO PLAYBACK (canvas animation)
────────────────────────────────────── */
let playT = 0;

function startVideoPlayback() {
  currentScene = 0;
  sceneProgress = 0;
  isPlaying = true;
  document.getElementById('playBtn').textContent = '⏸';
  playLoop();
}

function togglePlay() {
  if (!videoScenes.length) return;
  isPlaying = !isPlaying;
  document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';
  if (isPlaying) playLoop();
}

function playLoop() {
  if (!isPlaying) return;

  const scene = videoScenes[currentScene];
  if (!scene) {
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶';
    currentScene = 0;
    return;
  }

  drawVideoScene(outputCtx, outputCanvas, scene, sceneProgress, playT);
  playT += 0.025;
  sceneProgress += 0.008;

  updateTimeline(currentScene, sceneProgress);

  if (sceneProgress >= 1) {
    sceneProgress = 0;
    currentScene++;
    playT = 0;
  }

  animFrameId = requestAnimationFrame(playLoop);
}

/* ──────────────────────────────────────
   SCENE RENDERER
────────────────────────────────────── */
function drawVideoScene(ctx, canvas, scene, progress, t) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const styleFns = {
    modern:    drawModernScene,
    minimal:   drawMinimalScene,
    corporate: drawCorporateScene,
    creative:  drawCreativeScene,
  };
  (styleFns[scene.styleKey] || drawModernScene)(ctx, W, H, scene, progress, t);
}

/* MODERN STYLE */
function drawModernScene(ctx, W, H, scene, progress, t) {
  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0D0D1A');
  bg.addColorStop(1, '#1A1A35');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(108,99,255,0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Glow orb
  const col = scene.color;
  const grd = ctx.createRadialGradient(W*0.7, H*0.3, 0, W*0.7, H*0.3, 200);
  grd.addColorStop(0, col + '44');
  grd.addColorStop(1, col + '00');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Progress bar top
  ctx.fillStyle = col;
  ctx.fillRect(0, 0, W * progress, 4);

  // Scene number badge
  ctx.fillStyle = col + '33';
  ctx.beginPath();
  ctx.roundRect(24, 24, 50, 28, 8);
  ctx.fill();
  ctx.fillStyle = col;
  ctx.font = 'bold 13px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${scene.id + 1}/${videoScenes.length}`, 49, 42);

  // Title (slide in)
  const tx = easeOut(progress);
  ctx.fillStyle = `rgba(232,232,240,${Math.min(1, progress * 3)})`;
  ctx.font = 'bold 28px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(scene.title, W / 2, H / 2 - 20 + (1 - tx) * 30);

  // Animated underline
  const lineW = W * 0.4 * Math.min(1, progress * 2);
  const gLine = ctx.createLinearGradient(W/2 - lineW/2, 0, W/2 + lineW/2, 0);
  gLine.addColorStop(0, col + '00');
  gLine.addColorStop(0.5, col);
  gLine.addColorStop(1, col + '00');
  ctx.strokeStyle = gLine;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W/2 - lineW/2, H/2 + 4);
  ctx.lineTo(W/2 + lineW/2, H/2 + 4);
  ctx.stroke();

  // Animated dots
  const dotsPhase = Math.max(0, progress - 0.3);
  for (let i = 0; i < 3; i++) {
    const bx = W/2 - 30 + i * 30;
    const r = 6 * Math.sin((dotsPhase * Math.PI * 2) + i * 0.8);
    if (r > 0) {
      ctx.fillStyle = col + '99';
      ctx.beginPath();
      ctx.arc(bx, H/2 + 40, Math.abs(r), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Waveform at bottom
  ctx.strokeStyle = col + '55';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = H - 30 + Math.sin((x / W) * Math.PI * 8 + t * 3) * 8;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/* MINIMAL STYLE */
function drawMinimalScene(ctx, W, H, scene, progress, t) {
  ctx.fillStyle = '#F8F8FF';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#6C63FF';
  ctx.fillRect(0, 0, W * progress, 5);

  ctx.fillStyle = '#0D0D1A';
  ctx.font = 'bold 32px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.globalAlpha = Math.min(1, progress * 2);
  ctx.fillText(scene.title, W/2, H/2);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = '#6C63FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W/2 - 60, H/2 + 20);
  ctx.lineTo(W/2 + 60, H/2 + 20);
  ctx.stroke();
}

/* CORPORATE STYLE */
function drawCorporateScene(ctx, W, H, scene, progress, t) {
  ctx.fillStyle = '#001233';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#023E8A';
  ctx.fillRect(0, 0, W, H * 0.08);
  ctx.fillStyle = '#0466C8';
  ctx.fillRect(0, H * 0.92, W, H * 0.08);

  ctx.fillStyle = scene.color;
  ctx.fillRect(0, H*0.08, 6, H*0.84 * progress);

  ctx.fillStyle = 'white';
  ctx.globalAlpha = Math.min(1, progress * 2);
  ctx.font = 'bold 28px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(scene.title, W/2, H/2);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const y = H/2 + 40 + Math.sin(x/W * Math.PI * 4 + t) * 12;
    x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.stroke();
}

/* CREATIVE STYLE */
function drawCreativeScene(ctx, W, H, scene, progress, t) {
  // Multi-color gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1a0533');
  bg.addColorStop(0.5, '#0a1a3d');
  bg.addColorStop(1, '#001a20');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Rotating shapes
  const shapes = 5;
  for (let i = 0; i < shapes; i++) {
    const angle = (t + (i / shapes) * Math.PI * 2);
    const rx = W/2 + Math.cos(angle) * 120;
    const ry = H/2 + Math.sin(angle) * 60;
    const hue = (i * 60 + t * 30) % 360;
    ctx.fillStyle = `hsla(${hue},80%,60%,0.15)`;
    ctx.beginPath();
    ctx.arc(rx, ry, 40 + Math.sin(t + i) * 15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title
  ctx.globalAlpha = Math.min(1, progress * 2.5);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 30px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = scene.color;
  ctx.shadowBlur = 20;
  ctx.fillText(scene.title, W/2, H/2);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function easeOut(t) {
  return 1 - Math.pow(1 - Math.min(t, 1), 3);
}

/* ──────────────────────────────────────
   SHOWCASE CANVASES
────────────────────────────────────── */
const SHOWCASE_CONFIGS = [
  { title: 'متجر إلكتروني', color: '#6C63FF', style: 'modern' },
  { title: 'تطبيق توصيل', color: '#FF6584', style: 'creative' },
  { title: 'إدارة مدرسة', color: '#43E97B', style: 'corporate' },
];

let showcaseTimers = [];

function initShowcaseCanvases() {
  SHOWCASE_CONFIGS.forEach((cfg, i) => {
    const canvas = document.getElementById(`sc${i}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const id = setInterval(() => {
      t += 0.02;
      const fakeScene = { id: i, title: cfg.title, color: cfg.color, styleKey: cfg.style };
      const progress = 0.5 + Math.sin(t * 0.5) * 0.3;
      drawVideoScene(ctx, canvas, fakeScene, progress, t);
    }, 33);
    showcaseTimers.push(id);
  });
}

function loadShowcase(index) {
  if (!videoScenes.length) {
    const cfg = SHOWCASE_CONFIGS[index];
    selectedColor = cfg.color;
    document.getElementById('promptInput').value =
      `شرح مشروع: ${cfg.title} - تصميم كامل شامل الواجهات والمكونات الرئيسية`;
    scrollToDemo();
  }
}

/* ──────────────────────────────────────
   DOWNLOAD
────────────────────────────────────── */
function downloadFrame() {
  const canvas = document.getElementById('outputCanvas');
  const link = document.createElement('a');
  link.download = 'vidai-frame.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* ──────────────────────────────────────
   NAVIGATION HELPERS
────────────────────────────────────── */
function scrollToDemo() {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}

function playDemoVideo() {
  document.getElementById('promptInput').value =
    'شرح تصميم موقع متجر إلكتروني متكامل يشمل صفحة الرئيسية والمنتجات وسلة التسوق وإتمام الشراء ولوحة التحكم';
  scrollToDemo();
  setTimeout(generateVideo, 600);
}

/* ──────────────────────────────────────
   INTERSECTION OBSERVER (feature cards)
────────────────────────────────────── */
function observeFeatureCards() {
  const cards = document.querySelectorAll('.feature-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => {
          e.target.style.animationPlayState = 'running';
        }, delay);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });
}

/* ──────────────────────────────────────
   NAVBAR SCROLL EFFECT
────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(13,13,26,0.97)';
  } else {
    nav.style.background = 'rgba(13,13,26,0.85)';
  }
});
