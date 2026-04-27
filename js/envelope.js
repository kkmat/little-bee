// Envelope opening animation — tap the wax seal to reveal the invitation.

(function () {
  const stage    = document.getElementById('envelope-stage');
  const envelope = document.getElementById('envelope');
  const seal     = document.getElementById('wax-seal');
  const main     = document.getElementById('main-content');

  if (!stage || !seal || !envelope || !main) return;

  // If the user has already opened it once in this session, skip the animation
  // so they aren't forced to re-tap on every reload.
  if (sessionStorage.getItem('envelope-opened') === '1') {
    stage.classList.add('opened');
    setTimeout(() => stage.remove(), 50);
    main.classList.add('visible');
    return;
  }

  function open() {
    envelope.classList.add('opening');
    setTimeout(() => {
      stage.classList.add('opened');
      main.classList.add('visible');
      sessionStorage.setItem('envelope-opened', '1');
      // Smooth scroll to top in case the page was scrolled
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 600);
    setTimeout(() => stage.remove(), 1500);
  }

  seal.addEventListener('click', open);
  seal.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
})();
