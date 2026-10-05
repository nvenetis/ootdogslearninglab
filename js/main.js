// @ts-nocheck
/* ============================================================
   Out of the Dogs learning lab — Main JS
   Libraries: Lenis · GSAP + ScrollTrigger · Typed.js
   ============================================================ */

const t = key => (window.i18n ? window.i18n.t(key) : key);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Lenis smooth scroll ──────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── GSAP setup ───────────────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ── Navbar ───────────────────────────────────────────────────────────────────
const navbar  = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

ScrollTrigger.create({
  start: 60,
  onEnter:      () => navbar.classList.add('nav--scrolled'),
  onLeaveBack:  () => navbar.classList.remove('nav--scrolled'),
});

ScrollTrigger.create({
  start: 500,
  onEnter:     () => document.getElementById('backTop').classList.add('visible'),
  onLeaveBack: () => document.getElementById('backTop').classList.remove('visible'),
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});
navLinks.querySelectorAll('.nav__link').forEach(l =>
  l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

// ── Hero pollen — soft motes drifting up through the sunlit photo ────────────
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, motes = [], running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function make() {
    return { x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.8 + 0.6, vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.25 + 0.05), a: Math.random() * 0.45 + 0.2,
      t: Math.random() * Math.PI * 2 };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    motes.forEach(p => {
      p.t += 0.01;
      p.x += p.vx + Math.sin(p.t) * 0.15;
      p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,248,228,${p.a * (0.6 + 0.4 * Math.sin(p.t * 2))})`;
      ctx.fill();
    });
    if (running && !reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  motes = Array.from({ length: 60 }, make);
  draw();
  window.addEventListener('resize', () => { resize(); motes = Array.from({ length: 60 }, make); });

  // Pause while the hero is off-screen
  new IntersectionObserver(([entry]) => {
    const wasRunning = running;
    running = entry.isIntersecting;
    if (running && !wasRunning) draw();
  }).observe(canvas);
})();

// Hero photo: slow push-in while scrolling away (entrance itself is CSS)
if (!reduceMotion) {
  gsap.to('.hero__img', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    scale: 1.08,
    ease: 'none',
  });
}

// ── Typed.js typewriter ──────────────────────────────────────────────────────
new Typed('#typewriterTarget', {
  strings: window.i18n ? window.i18n.typedStrings() : ['Language.', 'Needs.', 'Nature.', 'Feelings.'],
  typeSpeed: 70,
  backSpeed: 40,
  backDelay: 1800,
  loop: true,
  showCursor: true,
  cursorChar: '|',
  startDelay: 1400,
});

// ── GSAP scroll reveals ──────────────────────────────────────────────────────
function reveal(selector, fromVars = {}, toVars = {}) {
  if (reduceMotion) return;
  gsap.utils.toArray(selector).forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, ...fromVars },
      {
        opacity: 1,
        x: 0, y: 0,
        scrollTrigger: { trigger: el, start: 'top 88%' },
        duration: 0.85,
        ease: 'power3.out',
        delay: fromVars.stagger ? i * 0.1 : 0,
        ...toVars,
      }
    );
  });
}

reveal('.reveal-up',    { y: 50 });
reveal('.reveal-left',  { x: -60 });
reveal('.reveal-right', { x: 60 });

// Service cards — staggered wave
if (!reduceMotion) {
  gsap.utils.toArray('.svc-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0,
        scrollTrigger: { trigger: card, start: 'top 90%' },
        duration: 0.7, ease: 'power3.out',
        delay: (i % 4) * 0.12,
      }
    );
  });

  // About photo — the dotted card behind it drifts at its own pace
  gsap.to('.about__backing', {
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1.5 },
    y: -40,
    rotate: 7,
  });

  // Hand-drawn doodles draw themselves in
  gsap.utils.toArray('.doodle').forEach(svg => {
    gsap.fromTo(svg.querySelectorAll('path'),
      { strokeDashoffset: 1.05 },
      {
        strokeDashoffset: 0,
        duration: 0.9, ease: 'power2.inOut', stagger: 0.15,
        delay: svg.closest('.hero') ? 1.1 : 0.2,
        scrollTrigger: { trigger: svg, start: 'top 90%' },
      }
    );
  });
}

// ── Blog cards entrance (news page shares this file indirectly, skip if missing)
gsap.utils.toArray('.blog-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 92%' },
    y: 40, opacity: 0, duration: 0.6, ease: 'power3.out',
    delay: (i % 3) * 0.08,
  });
});

// ── Forms → Netlify Forms ────────────────────────────────────────────────────
// Netlify picks up any <form data-netlify="true"> at deploy time and stores
// submissions (with email notifications) — see Site → Forms in Netlify.
function submitNetlifyForm(form) {
  return fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(form)).toString(),
  }).then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const btnHtml = btn.innerHTML;
    const status = document.getElementById('formSuccess');

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('contact.sending')}`;

    try {
      await submitNetlifyForm(contactForm);
      contactForm.reset();
      status.textContent = `✓ ${t('contact.successMsg')}`;
      status.style.borderColor = '';
      status.style.display = 'block';
      gsap.from(status, { y: 10, opacity: 0, duration: 0.4 });
      setTimeout(() => (status.style.display = 'none'), 6000);
    } catch (err) {
      status.textContent = t('contact.errorMsg');
      status.style.borderColor = '#BA6375';
      status.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = btnHtml;
    }
  });
}

// Newsletter (footer)
async function handleFooterSub(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button');
  btn.disabled = true;
  try {
    await submitNetlifyForm(form);
    form.reset();
    btn.textContent = t('footer.done');
  } catch {
    btn.textContent = t('footer.retry');
  } finally {
    setTimeout(() => { btn.textContent = t('footer.go'); btn.disabled = false; }, 2600);
  }
}

// ── Magnetic button effect ─────────────────────────────────────────────────────
document.querySelectorAll('.btn--primary, .btn--ghost').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r   = btn.getBoundingClientRect();
    const dx  = e.clientX - (r.left + r.width  / 2);
    const dy  = e.clientY - (r.top  + r.height / 2);
    gsap.to(btn, { x: dx * 0.25, y: dy * 0.25, duration: 0.4, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── Back to top ───────────────────────────────────────────────────────────────
document.getElementById('backTop').addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
});

// ── Smooth anchor links ───────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80, duration: 1.2 }); }
  });
});
