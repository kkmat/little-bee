// Scratch-off canvas — drag/touch to scratch the wax seal away.
// Painted as deep wax with embossed sunburst + dashed inner ring,
// to feel like a real sealed envelope rather than a cheap gold gradient.

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
    // Deep wax base — radial gradient warmer at top-left for highlight
    const grad = ctx.createRadialGradient(w*0.32, h*0.28, 8, w/2, h/2, Math.max(w,h));
    grad.addColorStop(0,    '#E29275');
    grad.addColorStop(0.20, '#C57A4F');
    grad.addColorStop(0.55, '#A55F38');
    grad.addColorStop(1,    '#5A2310');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Embossed sunburst rays
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.strokeStyle = 'rgba(255, 220, 190, 0.10)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 24; i++) {
      ctx.rotate(Math.PI*2/24);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, Math.max(w,h));
      ctx.stroke();
    }
    ctx.restore();

    // Dashed inner circle
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.strokeStyle = 'rgba(255, 245, 220, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(w, h) * 0.34, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Speckle texture (drips/grain)
    ctx.fillStyle = 'rgba(255, 200, 170, 0.12)';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.4 + 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(50, 20, 8, 0.18)';
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.2 + 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fill();
    }

    // Embossed ampersand at center
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.font = 'italic 700 ' + Math.floor(h * 0.5) + 'px "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(60, 20, 8, 0.35)';
    ctx.fillText('N&K', 1, 2);
    ctx.fillStyle = 'rgba(255, 220, 180, 0.18)';
    ctx.fillText('N&K', 0, 0);
    ctx.restore();

    // Outer rim
    ctx.strokeStyle = 'rgba(40, 12, 0, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w-4, h-4);
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
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    if (hint) hint.style.opacity = '0';

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
    if (cleared / samples > 0.5) revealAll();
  }

  function revealAll() {
    revealed = true;
    canvas.style.transition = 'opacity 800ms ease';
    canvas.style.opacity = '0';
    setTimeout(() => { canvas.style.pointerEvents = 'none'; }, 850);
  }

  canvas.addEventListener('mousedown',  (e) => { isDrawing = true;  scratch(e); });
  canvas.addEventListener('mousemove',  scratch);
  canvas.addEventListener('mouseup',    () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });

  canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
  canvas.addEventListener('touchmove',  scratch, { passive: false });
  canvas.addEventListener('touchend',   () => { isDrawing = false; });

  window.addEventListener('resize', () => { if (!revealed && canvas.width === 0) fitCanvas(); });

  fitCanvas();
})();
