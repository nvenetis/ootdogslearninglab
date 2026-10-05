// @ts-nocheck
/* ============================================================
   i18n — runtime helpers
   Each language is its own page (/ = Greek, /en/ = English) with the
   text already baked in by build.js, so nothing is swapped here. This
   only exposes the strings JS needs (typewriter words, form messages)
   and keeps the typewriter from reflowing the hero title.
   Requires js/translations.js to be loaded first.
   ============================================================ */

const currentLang = document.documentElement.lang === 'en' ? 'en' : 'el';

function getVal(lang, key) {
  return key.split('.').reduce((o, k) => (o != null ? o[k] : undefined), translations[lang]);
}

// Reserve enough width for the longest typed string so the accent word
// never reflows the surrounding title while it types/backspaces.
function fitAccentWidth(lang) {
  const target = document.getElementById('typewriterTarget');
  const strings = getVal(lang, 'typed');
  if (!target || !strings) return;

  const cs = getComputedStyle(target);
  const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

  const measure = () => {
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'nowrap';
    probe.style.font = font;
    probe.style.letterSpacing = cs.letterSpacing;
    document.body.appendChild(probe);

    let max = 0;
    strings.forEach(s => {
      probe.textContent = s;
      max = Math.max(max, probe.offsetWidth);
    });
    document.body.removeChild(probe);

    // Reserve the width on the wrapper (not the target itself) so the
    // animated text stays its natural width and the cursor sits right
    // next to it, instead of trailing after a padded-out box.
    const wrap = target.closest('.hero__accent-wrap') || target;
    wrap.style.minWidth = `${max}px`;
  };

  measure();
  // The display font (and its Greek subset) may still be downloading —
  // measure again once the glyphs are actually available.
  if (document.fonts && document.fonts.load) {
    document.fonts.load(font, strings.join(' ')).then(measure).catch(() => {});
  }
}

let _fitWidthResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_fitWidthResizeTimer);
  _fitWidthResizeTimer = setTimeout(() => fitAccentWidth(currentLang), 150);
});

/* ── Public API (used by main.js) ────────────────────────────────────────── */
window.i18n = {
  t: key => getVal(currentLang, key),
  typedStrings: () => getVal(currentLang, 'typed'),
  get currentLang() { return currentLang; },
};

fitAccentWidth(currentLang);
