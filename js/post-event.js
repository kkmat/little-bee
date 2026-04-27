// Post-event mode — auto-switches the home page after the party.
//
// Trigger: Saturday May 2 2026, 00:00 Kuwait time (UTC+3) — i.e., midnight
// after the party. The page transforms from "Welcome" to "Thank you for
// celebrating" and a "Days until baby arrives" countdown to July 6 takes
// over the slot where the menu lived.

(function () {
  const PARTY_END = new Date('2026-05-02T00:00:00+03:00').getTime();
  const DUE_DATE  = new Date('2026-07-06T00:00:00+03:00').getTime();

  if (Date.now() < PARTY_END) return;       // still pre/during party — leave page alone

  document.body.classList.add('post-event');

  // Hide elements that are no longer relevant once the party is over.
  const hide = (sel) => document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
  hide('#menu');                            // culinary button
  hide('.favor-tag');                       // "Before You Go" gift tag
  hide('.scratch-wrap');                    // the scratch-off teaser
  document.querySelectorAll('.divider').forEach(d => d.style.display = 'none');

  // Swap the hero copy
  const kicker = document.querySelector('.hero-line.h1');
  const eyebrow= document.querySelector('.hero-line.h2');
  const big    = document.querySelector('.hero-line.h3');
  const sub    = document.querySelector('.hero-line.h4');
  if (kicker)  kicker.textContent  = 'Thank you for celebrating with us 💛';
  if (eyebrow) eyebrow.textContent = 'WITH ALL OUR LOVE';
  // Don't change "Neethu" — keep the script name as the hero
  if (sub)     sub.textContent     = 'You made our day unforgettable.';

  // Inject due-date countdown after the hero
  const main = document.getElementById('main-content');
  if (!main) return;
  const hero = main.querySelector('section');
  if (!hero) return;

  const block = document.createElement('section');
  block.className = 'px-5 pb-12 max-w-3xl mx-auto reveal-up in';
  block.innerHTML = `
    <div class="section-title-wrap">
      <span class="section-eyebrow">our little bee arrives in</span>
      <h2 class="section-title">Counting down</h2>
      <span class="section-rule"></span>
    </div>
    <div class="countdown" id="due-countdown">
      <div class="countdown__cell"><span class="countdown__num" id="due-days">0</span><span class="countdown__label">Days</span></div>
      <div class="countdown__cell"><span class="countdown__num" id="due-hours">0</span><span class="countdown__label">Hours</span></div>
      <div class="countdown__cell"><span class="countdown__num" id="due-mins">0</span><span class="countdown__label">Minutes</span></div>
      <div class="countdown__cell"><span class="countdown__num" id="due-secs">0</span><span class="countdown__label">Seconds</span></div>
    </div>
    <p class="muted text-center mt-3 italic">Due July 6, 2026</p>
  `;
  hero.parentNode.insertBefore(block, hero.nextSibling);

  function pad(n) { return String(n).padStart(2, '0'); }
  function tickDue() {
    const diff = DUE_DATE - Date.now();
    if (diff <= 0) {
      ['due-days','due-hours','due-mins','due-secs'].forEach(id => document.getElementById(id).textContent = '00');
      const t = block.querySelector('.section-title');
      if (t) t.textContent = "Baby's here! 🐝💛";
      return;
    }
    document.getElementById('due-days').textContent  = pad(Math.floor(diff / 86400000));
    document.getElementById('due-hours').textContent = pad(Math.floor((diff / 3600000) % 24));
    document.getElementById('due-mins').textContent  = pad(Math.floor((diff / 60000) % 60));
    document.getElementById('due-secs').textContent  = pad(Math.floor((diff / 1000) % 60));
  }
  tickDue();
  setInterval(tickDue, 1000);
})();
