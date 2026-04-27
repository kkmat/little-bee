// Little Bee — front-end API client.
// Stores nickname + player_id in localStorage. All POSTs include X-Player-Id.
// On any 401 (unknown player), it re-registers the stored nickname so the user
// is never stuck after a server reset.

window.LittleBeeAPI = (function () {
  // Override at runtime if needed: localStorage.setItem('lb-api', 'https://...');
  const DEFAULT_API = 'https://little-bee-api.kevin-kw.workers.dev';
  const API_BASE = (localStorage.getItem('lb-api') || DEFAULT_API).replace(/\/$/, '');

  const STORE_NICK = 'lb-nick';
  const STORE_ID   = 'lb-pid';

  function nickname() { return localStorage.getItem(STORE_NICK) || ''; }
  function playerId() { return localStorage.getItem(STORE_ID) || ''; }
  function isJoined() { return Boolean(nickname() && playerId()); }

  async function _fetch(path, opts = {}, retryAuth = true) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const pid = playerId();
    if (pid) headers['X-Player-Id'] = pid;
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    if (res.status === 401 && retryAuth && nickname()) {
      // Re-register and retry once.
      const ok = await join(nickname(), /*silent*/ true);
      if (ok) return _fetch(path, opts, false);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
  }

  async function join(name, silent = false) {
    const trimmed = String(name || '').trim().slice(0, 40);
    if (!trimmed) throw new Error('nickname required');
    const data = await fetch(`${API_BASE}/api/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: trimmed }),
    }).then(r => r.json());
    if (!data || !data.id) {
      if (silent) return false;
      throw new Error('failed to join');
    }
    localStorage.setItem(STORE_NICK, data.nickname);
    localStorage.setItem(STORE_ID,   data.id);
    return true;
  }

  function logout() {
    localStorage.removeItem(STORE_NICK);
    localStorage.removeItem(STORE_ID);
  }

  // Higher-level helpers
  return {
    apiBase: API_BASE,
    nickname, playerId, isJoined, join, logout,

    submitScore: (game, score) =>
      _fetch('/api/score', { method: 'POST', body: JSON.stringify({ game, score }) }),

    getLeaderboard: () => _fetch('/api/leaderboard', { method: 'GET' }),

    postAdvice: (message) =>
      _fetch('/api/advice', { method: 'POST', body: JSON.stringify({ message }) }),
    listAdvice: () => _fetch('/api/advice', { method: 'GET' }),

    postPrediction: (prompt_key, value) =>
      _fetch('/api/predictions', { method: 'POST', body: JSON.stringify({ prompt_key, value }) }),
    listPredictions: (prompt_key) =>
      _fetch(`/api/predictions${prompt_key ? `?prompt_key=${encodeURIComponent(prompt_key)}` : ''}`, { method: 'GET' }),

    postDueDate: (guess_date) =>
      _fetch('/api/due-date', { method: 'POST', body: JSON.stringify({ guess_date }) }),
    listDueDate: () => _fetch('/api/due-date', { method: 'GET' }),

    postName: (name) =>
      _fetch('/api/name', { method: 'POST', body: JSON.stringify({ name }) }),
    voteName: (id) =>
      _fetch('/api/name/vote', { method: 'POST', body: JSON.stringify({ id }) }),
    listNames: () => _fetch('/api/names', { method: 'GET' }),

    postOnesie: (image) =>
      _fetch('/api/onesie', { method: 'POST', body: JSON.stringify({ image }) }),
    likeOnesie: (id) =>
      _fetch('/api/onesie/like', { method: 'POST', body: JSON.stringify({ id }) }),
    listOnesies: () => _fetch('/api/onesies', { method: 'GET' }),

    postVoice: (audio, mime, duration) =>
      _fetch('/api/voice', { method: 'POST', body: JSON.stringify({ audio, mime, duration }) }),
    listVoices: () => _fetch('/api/voices', { method: 'GET' }),

    postSong: (song, artist) =>
      _fetch('/api/song', { method: 'POST', body: JSON.stringify({ song, artist }) }),
    listSongs: () => _fetch('/api/songs', { method: 'GET' }),
  };
})();
