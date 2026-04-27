// Auto-prompt for nickname on game pages. Drop into any page that needs
// a player identity. Renders a soft modal if the user hasn't joined yet.

(function () {
  if (window.LittleBeeAPI.isJoined()) {
    document.body.classList.add('lb-joined');
    return;
  }

  const wrap = document.createElement('div');
  wrap.id = 'join-modal';
  wrap.innerHTML = `
    <div class="join-backdrop"></div>
    <div class="join-card card">
      <p class="font-script text-3xl text-[color:var(--rust-deep)] text-center mb-1">Welcome 🐝</p>
      <p class="text-center text-sm text-[color:var(--ink-soft)] mb-5" data-i18n="join.intro">Pick a nickname so we can show your name on the leaderboard.</p>
      <input id="join-name" type="text" maxlength="40" autocomplete="given-name"
        class="w-full px-4 py-3 rounded-lg border border-[color:var(--ink-soft)] bg-white/80 text-lg"
        placeholder="Your name" data-i18n-attr="placeholder:common.namePh" />
      <button id="join-go" class="btn w-full mt-4">Join the party</button>
    </div>
  `;
  const style = document.createElement('style');
  style.textContent = `
    #join-modal { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; }
    #join-modal .join-backdrop { position: absolute; inset: 0; background: rgba(92,61,31,0.45); backdrop-filter: blur(6px); }
    #join-modal .join-card { position: relative; max-width: 420px; width: 100%; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(wrap);

  const input = wrap.querySelector('#join-name');
  const go    = wrap.querySelector('#join-go');

  async function tryJoin() {
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    go.disabled = true;
    go.textContent = '...';
    try {
      await window.LittleBeeAPI.join(name);
      wrap.remove();
      style.remove();
      document.body.classList.add('lb-joined');
      window.dispatchEvent(new CustomEvent('lb-joined'));
    } catch (err) {
      go.disabled = false;
      go.textContent = 'Try again';
      console.error(err);
    }
  }

  go.addEventListener('click', tryJoin);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryJoin(); });
  setTimeout(() => input.focus(), 200);
})();
