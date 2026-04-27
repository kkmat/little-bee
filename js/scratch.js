// Scratch-off canvas — drag/touch to scratch the gold layer away.
// Auto-reveals the underlying message once ~50% of the card is scratched.

(function () {
  const canvas = document.getElementById('scratch-canvas');
  const hint   = document.querySelector('.scratch-hint');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let revealed  = false;

  function fitCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    paintTopLayer(rect.width, rect.height);
  }

  function paintTopLayer(w, h) {
    // Gold-leaf top with subtle texture lines.
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,    '#E8B547');
    grad.addColorStop(0.5,  '#C99936');
    grad.addColorStop(1,    '#8E6B22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Hatching for texture
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = -h; i < w + h; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }

    // Sprinkle of tiny stars
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  function scratch(e) {
    if (!isDrawing || revealed) return;
    e.preventDefault();
    const { x, y } = pointerPos(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    if (hint) hint.style.opacity = '0';

    // Throttled progress check
    if (!scratch._t) {
      scratch._t = setTimeout(() => {
        scratch._t = null;
        checkProgress();
      }, 220);
    }
  }

  function checkProgress() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (w === 0) return;
    // Sample on a 24x24 grid for speed
    const grid = 24;
    const data = ctx.getImageData(0, 0, w * devicePixelRatio, h * devicePixelRatio).data;
    const stride = w * devicePixelRatio;
    let cleared = 0, samples = 0;
    for (let yy = 0; yy < grid; yy++) {
      for (let xx = 0; xx < grid; xx++) {
        const px = Math.floor((xx + 0.5) / grid * w * devicePixelRatio);
        const py = Math.floor((yy + 0.5) / grid * h * devicePixelRatio);
        const idx = (py * stride + px) * 4;
        if (data[idx + 3] < 32) cleared++;
        samples++;
      }
    }
    if (cleared / samples > 0.5) {
      revealAll();
    }
  }

  function revealAll() {
    revealed = true;
    canvas.style.transition = 'opacity 700ms ease';
    canvas.style.opacity = '0';
    setTimeout(() => { canvas.style.pointerEvents = 'none'; }, 750);
  }

  canvas.addEventListener('mousedown',  (e) => { isDrawing = true;  scratch(e); });
  canvas.addEventListener('mousemove',  scratch);
  canvas.addEventListener('mouseup',    () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });

  canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
  canvas.addEventListener('touchmove',  scratch, { passive: false });
  canvas.addEventListener('touchend',   () => { isDrawing = false; });

  window.addEventListener('resize', () => {
    // Re-fit only if canvas hasn't been scratched yet.
    if (!revealed && canvas.width === 0) fitCanvas();
  });

  fitCanvas();
})();
