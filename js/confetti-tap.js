// Confetti tap — strictly bound to .flora--bee / .flora--sun / .flora--daisy
// Each floral gets its own click + touchstart handler. No document-wide
// fallback, no proximity detection, no body-level event listener.

(function () {
  const FLORAL_SELECTOR = '.flora--bee, .flora--sun, .flora--daisy';
  const COLORS = ['#E8B547', '#F5C84B', '#C57A4F', '#98A77C', '#FBF6EE', '#A55F38'];
  const TAP_DEBOUNCE_MS = 220;

  // Single shared overlay canvas. Attached to <html> so body's overflow-x:
  // hidden cannot clip it, and z-index 9999 sits above everything.
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  document.documentElement.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function fit() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = innerWidth  * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);

  const particles = [];

  function spawn(x, y) {
    fit();
    for (let i = 0; i < 32; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 7 - 2,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 6 + 4,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1,
        kind: Math.random() < 0.6 ? 'rect' : 'circle',
      });
    }
    if (!ticking) tick();
  }

  let ticking = false;
  function tick() {
    ticking = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.28;
      p.vx *= 0.992;
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.vrot;
      p.life -= 0.012;
      if (p.life <= 0 || p.y > innerHeight + 30) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = p.color;
      if (p.kind === 'rect') ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size/2, 0, Math.PI*2); ctx.fill(); }
      ctx.restore();
    }
    if (particles.length > 0) requestAnimationFrame(tick);
    else { ticking = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  // Per-element binding. Idempotent — running attach() twice on the same
  // element is a no-op thanks to the dataset.confettiBound guard.
  function attach(el) {
    if (el.dataset.confettiBound) return;
    el.dataset.confettiBound = '1';

    let lastFire = 0;
    const fire = (e) => {
      const now = Date.now();
      if (now - lastFire < TAP_DEBOUNCE_MS) return; // de-dupe touchstart→click pair
      lastFire = now;
      // touchstart on iOS: don't preventDefault (would block click on links elsewhere);
      // we just need stopPropagation so the click can't bubble to anything else.
      e.stopPropagation();
      const r = el.getBoundingClientRect();
      spawn(r.left + r.width / 2, r.top + r.height / 2);
      el.animate(
        [{ transform: 'scale(1)' },
         { transform: 'scale(1.18)' },
         { transform: 'scale(1)' }],
        { duration: 360, easing: 'ease-out', composite: 'add' }
      );
    };

    el.addEventListener('click', fire);
    el.addEventListener('touchstart', fire, { passive: true });
  }

  function attachAll() {
    document.querySelectorAll(FLORAL_SELECTOR).forEach(attach);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAll, { once: true });
  } else {
    attachAll();
  }
})();
