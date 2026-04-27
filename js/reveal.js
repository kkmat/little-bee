// Scroll-triggered reveal: fades sections into view as they enter the viewport.

(function () {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  els.forEach(e => io.observe(e));
})();
