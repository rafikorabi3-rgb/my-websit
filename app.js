'use strict';

/* ── MOBILE MENU ── */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navMobile').classList.toggle('open');
});
function closeMobileMenu() {
  document.getElementById('navMobile').classList.remove('open');
}

/* ── HERO CANVAS — starfield ── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function initStars() {
    stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.1,
      bright: Math.random()
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.bright));
      ctx.fillStyle = `rgba(255,${150 + Math.floor(s.bright * 105)},0,${alpha})`;
      ctx.fill();
      s.bright += 0.02;
      s.y -= s.speed;
      if (s.y < -2) s.y = H + 2;
    });
    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

/* ── JOYSTICK WOBBLE ── */
(function () {
  const stick = document.getElementById('joystickStick');
  if (!stick) return;
  let angle = 0;
  function wobble() {
    angle += 0.04;
    if (stick) stick.style.transform = `rotate(${Math.sin(angle) * 12}deg)`;
    requestAnimationFrame(wobble);
  }
  wobble();
})();

function pulseBtn(el) {
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 200);
}

/* ── PONG GAME ── */
(function () {
  const canvas = document.getElementById('pongCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const PAD_W = 10, PAD_H = 60, BALL = 8, SPEED = 3;

  let playerY = H / 2 - PAD_H / 2;
  let cpuY = H / 2 - PAD_H / 2;
  let ball = { x: W / 2, y: H / 2, vx: SPEED, vy: SPEED * 0.8 };
  let pScore = 0, cScore = 0;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleY = H / rect.height;
    playerY = (e.clientY - rect.top) * scaleY - PAD_H / 2;
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleY = H / rect.height;
    playerY = (e.touches[0].clientY - rect.top) * scaleY - PAD_H / 2;
  }, { passive: false });

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function reset(winner) {
    ball.x = W / 2; ball.y = H / 2;
    ball.vx = SPEED * (winner === 'cpu' ? -1 : 1) * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = (Math.random() * SPEED * 0.8 + 0.4) * (Math.random() > 0.5 ? 1 : -1);
  }

  function update() {
    playerY = clamp(playerY, 0, H - PAD_H);

    const cpuCenter = cpuY + PAD_H / 2;
    if (cpuCenter < ball.y - 5) cpuY += 2.5;
    else if (cpuCenter > ball.y + 5) cpuY -= 2.5;
    cpuY = clamp(cpuY, 0, H - PAD_H);

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= BALL / 2 || ball.y >= H - BALL / 2) ball.vy *= -1;

    const px = 20;
    if (ball.x - BALL / 2 < px + PAD_W && ball.y > playerY && ball.y < playerY + PAD_H && ball.vx < 0) {
      ball.vx *= -1.05;
      ball.x = px + PAD_W + BALL / 2;
    }
    const cx = W - 20 - PAD_W;
    if (ball.x + BALL / 2 > cx && ball.y > cpuY && ball.y < cpuY + PAD_H && ball.vx > 0) {
      ball.vx *= -1.05;
      ball.x = cx - BALL / 2;
    }
    ball.vx = clamp(ball.vx, -8, 8);

    if (ball.x < 0) { cScore++; document.getElementById('cpuScore').textContent = cScore; reset('cpu'); }
    if (ball.x > W) { pScore++; document.getElementById('playerScore').textContent = pScore; reset('player'); }
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,102,0,0.2)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ff6600';
    ctx.fillRect(20, playerY, PAD_W, PAD_H);
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(W - 20 - PAD_W, cpuY, PAD_W, PAD_H);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() { update(); draw(); requestAnimationFrame(loop); }
  loop();
})();

/* ── GAME THUMBNAILS ── */
const thumbDefs = [
  { id: 'gt0', color: '#ff6600', draw: drawPongThumb },
  { id: 'gt1', color: '#ff3333', draw: drawAsteroidsThumb },
  { id: 'gt2', color: '#33ff99', draw: drawCentipedeThumb },
  { id: 'gt3', color: '#ffff00', draw: drawMissileThumb },
  { id: 'gt4', color: '#ff66ff', draw: drawBreakoutThumb },
  { id: 'gt5', color: '#33ccff', draw: drawTempestThumb },
];

thumbDefs.forEach(def => {
  const el = document.getElementById(def.id);
  if (!el) return;
  const ctx = el.getContext('2d');
  def.draw(ctx, el.width, el.height, def.color);
});

function drawPongThumb(ctx, W, H, c) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = c;
  ctx.fillRect(12, H * 0.2, 8, 50);
  ctx.fillRect(W - 20, H * 0.3, 8, 50);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.setLineDash([]);
}

function drawAsteroidsThumb(ctx, W, H, c) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 30; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
  ctx.strokeStyle = c; ctx.lineWidth = 2;
  [[60, 40, 20], [120, 80, 14], [160, 50, 10], [30, 90, 16]].forEach(([x, y, r]) => {
    ctx.beginPath();
    for (let a = 0; a < 7; a++) {
      const angle = (a / 7) * Math.PI * 2;
      const rr = r + (Math.random() * 6 - 3);
      if (a === 0) ctx.moveTo(x + rr * Math.cos(angle), y + rr * Math.sin(angle));
      else ctx.lineTo(x + rr * Math.cos(angle), y + rr * Math.sin(angle));
    }
    ctx.closePath(); ctx.stroke();
  });
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(95, 65); ctx.lineTo(85, 55); ctx.lineTo(105, 55); ctx.closePath(); ctx.stroke();
}

function drawCentipedeThumb(ctx, W, H, c) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = c;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.arc(20 + i * 20, 40 + (i % 2) * 10, 8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(W / 2 - 6, H - 20, 12, 16);
  ctx.fillStyle = c;
  for (let x = 20; x < W - 20; x += 30) {
    for (let y = 60; y < H - 30; y += 25) {
      ctx.beginPath(); ctx.arc(x + (y * 7 % 20), y, 5, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawMissileThumb(ctx, W, H, c) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1a1a44';
  ctx.fillRect(0, H - 25, W, 25);
  ctx.fillStyle = c;
  [[30, H - 25, 16, 20], [90, H - 25, 16, 20], [150, H - 25, 16, 20]].forEach(([x, y, w, h]) => {
    ctx.fillRect(x, y, w, h);
  });
  ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 1.5;
  [[60, 10, 20, H - 35], [100, 5, 95, H - 35], [140, 15, 155, H - 35]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });
  ctx.strokeStyle = c; ctx.lineWidth = 1;
  [[60, 10, 6], [100, 5, 6], [140, 15, 6]].forEach(([x, y, r]) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  });
}

function drawBreakoutThumb(ctx, W, H, c) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const colors = ['#ff2200', '#ff6600', '#ffdd00', '#33ff99', '#33ccff', c];
  colors.forEach((col, row) => {
    for (let col2 = 0; col2 < 8; col2++) {
      ctx.fillStyle = col;
      ctx.fillRect(8 + col2 * 23, 8 + row * 13, 20, 10);
    }
  });
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(W / 2 + 10, H - 50, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#888';
  ctx.fillRect(W / 2 - 24, H - 18, 48, 8);
}

function drawTempestThumb(ctx, W, H, c) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  ctx.strokeStyle = c; ctx.lineWidth = 1.5;
  for (let i = 0; i < 16; i++) {
    const a1 = (i / 16) * Math.PI * 2;
    const a2 = ((i + 1) / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + 55 * Math.cos(a1), cy + 55 * Math.sin(a1));
    ctx.lineTo(cx + 55 * Math.cos(a2), cy + 55 * Math.sin(a2));
    ctx.moveTo(cx + 55 * Math.cos(a1), cy + 55 * Math.sin(a1));
    ctx.lineTo(cx + 20 * Math.cos(a1), cy + 20 * Math.sin(a1));
    ctx.stroke();
  }
  ctx.fillStyle = '#fff';
  const pa = 0;
  ctx.beginPath();
  ctx.moveTo(cx + 55 * Math.cos(pa), cy + 55 * Math.sin(pa));
  ctx.lineTo(cx + 48 * Math.cos(pa - 0.2), cy + 48 * Math.sin(pa - 0.2));
  ctx.lineTo(cx + 48 * Math.cos(pa + 0.2), cy + 48 * Math.sin(pa + 0.2));
  ctx.fill();
}

/* ── STATS COUNTER ── */
function animateStats() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateStats(); statsObserver.disconnect(); }
  });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) statsObserver.observe(statsSection);

/* ── NAVBAR SCROLL EFFECT ── */
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 40) navbar.style.borderBottomColor = '#ff4400';
  else navbar.style.borderBottomColor = '#ff6600';
});

/* ── CTA SIGNUP ── */
function handleSignup() {
  const input = document.querySelector('.cta-input');
  const note = document.getElementById('ctaNote');
  if (!input.value.trim() || !input.value.includes('@')) {
    note.style.color = '#ff3300';
    note.textContent = '>> INVALID EMAIL — TRY AGAIN';
    return;
  }
  note.style.color = '#33ff99';
  note.textContent = '>> PLAYER REGISTERED! GAME ON.';
  input.value = '';
}
