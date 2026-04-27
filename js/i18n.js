// Tiny i18n layer. Loads ./i18n/<lang>.json, swaps text on [data-i18n] nodes,
// flips dir=rtl for Arabic, and persists the choice in localStorage.

(function () {
  const STORAGE_KEY = 'little-bee-lang';
  const DEFAULT = 'en';

  const cache = {};
  let current = localStorage.getItem(STORAGE_KEY) || DEFAULT;

  // Resolve i18n root relative to the current page (works for / and /games/*)
  const I18N_BASE = (() => {
    const path = location.pathname;
    // crude: if we're under /games/ go up one
    if (/\/games\//.test(path)) return '../i18n/';
    return './i18n/';
  })();

  async function load(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const res = await fetch(`${I18N_BASE}${lang}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cache[lang] = await res.json();
      return cache[lang];
    } catch (err) {
      console.warn('[i18n] failed to load', lang, err);
      return null;
    }
  }

  function getKey(obj, key) {
    return key.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
  }

  async function apply(lang) {
    const dict = await load(lang);
    if (!dict) return;
    document.documentElement.lang = lang;
    document.documentElement.dir  = (lang === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = getKey(dict, el.dataset.i18n);
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      // data-i18n-attr="placeholder:form.namePh,title:form.titleTip"
      el.dataset.i18nAttr.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':');
        const v = getKey(dict, key.trim());
        if (typeof v === 'string') el.setAttribute(attr.trim(), v);
      });
    });

    // Toggle button state
    document.querySelectorAll('.lang-toggle button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    current = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle button');
    if (!btn) return;
    const lang = btn.dataset.lang;
    if (lang && lang !== current) apply(lang);
  });

  // ready promise — resolves once the initial language has been applied to the
  // DOM. Pages that build content dynamically (trivia, emoji, etc.) can
  // `await window.LittleBeeI18n.ready` so they don't paint in the wrong
  // language before the async fetch + apply completes.
  let _resolveReady;
  const readyPromise = new Promise((resolve) => { _resolveReady = resolve; });

  if (current !== DEFAULT) {
    document.addEventListener('DOMContentLoaded', () => apply(current).then(_resolveReady));
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.lang-toggle button').forEach((b) => {
        b.classList.toggle('active', b.dataset.lang === DEFAULT);
      });
      _resolveReady();
    });
  }

  // Synchronous string lookup for use inside game JS. Returns the cached
  // translation if available, otherwise the supplied fallback (or the key).
  // Pre-load the current language so first call after DOM-ready already has
  // the dictionary in cache.
  load(current);
  function t(key, fallback) {
    const dict = cache[current];
    if (dict) {
      const v = getKey(dict, key);
      if (typeof v === 'string') return v;
    }
    return fallback != null ? fallback : key;
  }

  // Notify listeners when the language changes so they can re-render
  // dynamic content. Wraps apply().
  const _origApply = apply;
  apply = async function (lang) {
    await _origApply(lang);
    window.dispatchEvent(new CustomEvent('lb-lang-changed', { detail: { lang } }));
  };

  window.LittleBeeI18n = { apply, current: () => current, t, isAr: () => current === 'ar', ready: readyPromise };
})();
