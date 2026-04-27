// Curtain reveal: tap the tassel rope to part the curtains and enter the hub.
// Replaces the previous envelope opening flow.

(function () {
  const stage = document.getElementById('curtain-stage');
  const tassel = document.getElementById('curtain-tassel');
  const main = document.getElementById('main-content');
  if (!stage || !tassel || !main) return;

  // Skip the animation on subsequent visits within the same tab so guests
  // don't have to part the curtain on every reload.
  if (sessionStorage.getItem('curtain-opened') === '1') {
    stage.classList.add('opened');
    setTimeout(() => stage.remove(), 50);
    main.classList.add('visible');
    return;
  }

  function open() {
    stage.classList.add('opening');
    setTimeout(() => {
      main.classList.add('visible');
      stage.classList.add('opened');
      sessionStorage.setItem('curtain-opened', '1');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 1200);
    setTimeout(() => stage.remove(), 2400);
  }

  // The full curtain panels are also tappable so guests don't have to hit
  // the small tassel exactly.
  stage.addEventListener('click', open);
  tassel.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
})();
