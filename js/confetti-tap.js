// Confetti tap easter egg — tap any floating 🐝 in the margins to release a
// small puff of cream/gold/sage particles from the tap point.
//
// Pure vanilla canvas; no external library. Particles fall with gravity,
// rotate, and fade. Performance is fine on any phone since each tap only
// spawns ~32 particles.

(function () {
  // Single shared overlay canvas pinned over the page. Append to <html>
  // (not <body>) so body's overflow-x:hidden never clips it.
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  document.documentElement.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const COLORS = ['#E8B547', '#F5C84B', '#C57A4F', '#98A77C', '#FBF6EE', '#A55F38'];

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
    fit(); // ensure canvas matches the current viewport for every burst
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
      p.vy += 0.28;       // gravity
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
      if (p.kind === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (particles.length > 0) requestAnimationFrame(tick);
    else { ticking = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  // The florals drift via CSS animation, so a tap aimed at them often
  // lands a few pixels off — and if the bee happens to be drifting over
  // a card/button, that element steals the click instead. Solution:
  // detect taps within 60 px of any floral's current center and treat
  // those as a hit.
  const HIT_RADIUS = 60;

  function nearestFloral(x, y) {
    let best = null, bestD = Infinity;
    document.querySelectorAll('.flora--bee, .flora--sun, .flora--daisy').forEach(f => {
      const r = f.getBoundingClientRect();
      // skip elements that are off-screen so we don't fire confetti for
      // distant florals when tapping random space
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(x - cx, y - cy);
      if (d < bestD) { bestD = d; best = f; }
    });
    return best && bestD <= HIT_RADIUS ? { el: best, dist: bestD } : null;
  }

  function fireFor(target) {
    const r = target.getBoundingClientRect();
    spawn(r.left + r.width / 2, r.top + r.height / 2);
    target.animate(
      [{ transform: 'scale(1)' },
       { transform: 'scale(1.18)' },
       { transform: 'scale(1)' }],
      { duration: 360, easing: 'ease-out', composite: 'add' }
    );
  }

  document.addEventListener('click', (e) => {
    // Direct hit?
    const direct = e.target.closest('.flora--bee, .flora--sun, .flora--daisy');
    if (direct) { fireFor(direct); return; }
    // Near miss?
    const near = nearestFloral(e.clientX, e.clientY);
    if (near) fireFor(near.el);
  });

})();
