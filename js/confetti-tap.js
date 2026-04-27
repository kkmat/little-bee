// Confetti tap easter egg — tap any floating 🐝 in the margins to release a
// small puff of cream/gold/sage particles from the tap point.
//
// Pure vanilla canvas; no external library. Particles fall with gravity,
// rotate, and fade. Performance is fine on any phone since each tap only
// spawns ~32 particles.

(function () {
  // Single shared overlay canvas pinned over the page.
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:300';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const COLORS = ['#E8B547', '#F5C84B', '#C57A4F', '#98A77C', '#FBF6EE', '#A55F38'];

  function fit() {
    canvas.width  = innerWidth  * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();
  window.addEventListener('resize', fit);

  const particles = [];

  function spawn(x, y) {
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

  // Wire taps on bees + sun (the playful florals). Use event delegation so
  // newly-added bees would also work.
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.flora--bee, .flora--sun, .flora--daisy');
    if (!target) return;
    spawn(e.clientX, e.clientY);
    // gentle bounce to confirm interaction
    target.animate(
      [{ transform: target.style.transform + ' scale(1)' },
       { transform: target.style.transform + ' scale(1.18)' },
       { transform: target.style.transform + ' scale(1)' }],
      { duration: 360, easing: 'ease-out' }
    );
  });

  // Make florals interactive (they were pointer-events:none through .flora)
  const fix = document.createElement('style');
  fix.textContent = `.flora--bee, .flora--sun, .flora--daisy { pointer-events: auto; cursor: pointer; }`;
  document.head.appendChild(fix);
})();
