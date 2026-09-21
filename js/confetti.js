/**
 * PURE HTML5 CANVAS CONFETTI ENGINE
 * Zero external libraries. Responsive with gravity, drag, velocity, and auto-cleanup.
 */
let canvas = null;
let ctx = null;
let confettiParticles = [];
let confettiAnimationId = null;

function initConfettiCanvas() {
  canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);
}

function resizeConfetti() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function triggerConfetti() {
  if (!canvas || !ctx) initConfettiCanvas();
  if (!canvas || !ctx) return;

  resizeConfetti();
  confettiParticles = [];
  const colors = ['#06B6D4', '#22D3EE', '#FACC15', '#10B981', '#075985', '#38BDF8'];
  const count = 140;

  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + (Math.random() * 80 - 40),
      w: Math.random() * 9 + 5,
      h: Math.random() * 7 + 4,
      vx: (Math.random() - 0.5) * 24,
      vy: (Math.random() - 0.7) * 22,
      gravity: 0.45,
      drag: 0.96,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let activeParticles = 0;

  confettiParticles.forEach(p => {
    p.vx *= p.drag;
    p.vy = (p.vy + p.gravity) * p.drag;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.opacity -= 0.007;

    if (p.opacity > 0) {
      activeParticles++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  if (activeParticles > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
