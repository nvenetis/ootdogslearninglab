// @ts-nocheck
/* ============================================================
   Out of the Dogs learning lab — Blog / News JS
   Libraries: Lenis · GSAP + ScrollTrigger
   ============================================================ */

const API = 'http://localhost:8000';
const POSTS_PER_PAGE = 6;
let visibleCount = POSTS_PER_PAGE;
let activeCategory = 'all';
let searchQuery = '';
let allPosts = [];

// ── Lenis smooth scroll ──────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

// ── Navbar ───────────────────────────────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

ScrollTrigger.create({
  start: 10,
  onEnter:     () => navbar.classList.add('nav--scrolled'),
  onLeaveBack: () => navbar.classList.remove('nav--scrolled'),
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

// ── Blog hero entrance ────────────────────────────────────────────────────────
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.from('.blog-hero__title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 });
  gsap.from('.blog-hero p',      { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.45 });
}

// ── Fallback posts (used if API is unreachable) ───────────────────────────────
const FALLBACK_POSTS = [
  { id:1, title:'5 Common Mistakes New Dog Owners Make (And How to Fix Them)', excerpt:"Bringing home a new dog is exciting, but many owners unknowingly set themselves up for behavioral problems. Here are the most common pitfalls — and simple fixes.", category:'training-tips', category_label:'Training Tips', date:'June 10, 2026', read_time:'6 min read', img:'https://picsum.photos/seed/dog_mistakes/800/500', featured:true },
  { id:2, title:'How to Teach Your Dog to Come When Called — Every Single Time', excerpt:"The recall command is the most important skill a dog can have. It can literally save their life. Here's a proven step-by-step method that works even with stubborn breeds.", category:'training-tips', category_label:'Training Tips', date:'June 3, 2026', read_time:'8 min read', img:'https://picsum.photos/seed/recall_dog/800/500', featured:false },
  { id:3, title:'Understanding Dog Body Language: What Is Your Dog Really Saying?', excerpt:"Dogs communicate constantly through body language, but most owners miss the signals. Learn to read your dog's tail, ears, posture, and eyes.", category:'education', category_label:'Education', date:'May 26, 2026', read_time:'7 min read', img:'https://picsum.photos/seed/dog_body/800/500', featured:false },
  { id:4, title:"Success Story: How Bella Overcame Severe Separation Anxiety", excerpt:"Bella, a 3-year-old rescue Cocker Spaniel, would bark for hours whenever left alone. After 10 weeks, she's a completely different dog.", category:'success-stories', category_label:'Success Stories', date:'May 18, 2026', read_time:'5 min read', img:'https://picsum.photos/seed/bella_dog/800/500', featured:false },
  { id:5, title:'The Science Behind Positive Reinforcement: Why It Works', excerpt:"Positive reinforcement isn't just a trend — it's backed by decades of behavioral science. Discover why rewarding good behavior always beats punishing bad.", category:'education', category_label:'Education', date:'May 11, 2026', read_time:'9 min read', img:'https://picsum.photos/seed/science_dog/800/500', featured:false },
  { id:6, title:'Top 10 Commands Every Dog Should Know by Age One', excerpt:"A well-trained one-year-old dog is a joy to live with. Here are the essential commands to teach in your puppy's first year.", category:'training-tips', category_label:'Training Tips', date:'May 4, 2026', read_time:'7 min read', img:'https://picsum.photos/seed/puppy_commands/800/500', featured:false },
  { id:7, title:'Why Group Training Classes Are More Effective Than You Think', excerpt:"Many owners opt for private sessions, but group classes offer invaluable real-world distraction practice.", category:'news', category_label:'News', date:'April 27, 2026', read_time:'5 min read', img:'https://picsum.photos/seed/group_training/800/500', featured:false },
  { id:8, title:"Rocky's Journey: From Leash Reactive to Park-Ready", excerpt:"Rocky was a German Shepherd who would lunge at every dog he saw. After 12 weeks of rehabilitation, he can now calmly walk past other dogs.", category:'success-stories', category_label:'Success Stories', date:'April 20, 2026', read_time:'6 min read', img:'https://picsum.photos/seed/rocky_shepherd/800/500', featured:false },
  { id:9, title:'PawPerfect Now Offers Online Training Sessions', excerpt:"Great news for clients outside Austin! Virtual sessions via video call. Get personalized guidance from the comfort of your home.", category:'news', category_label:'News', date:'April 12, 2026', read_time:'3 min read', img:'https://picsum.photos/seed/online_training/800/500', featured:false },
];

// ── Fetch posts from API (falls back to local data) ───────────────────────────
async function fetchPosts() {
  try {
    const res = await fetch(`${API}/posts?limit=50`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    console.info('API unavailable — using local data.');
    return FALLBACK_POSTS;
  }
}

// ── Filter & render ──────────────────────────────────────────────────────────
function getFiltered() {
  return allPosts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSrc = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery) ||
      p.excerpt.toLowerCase().includes(searchQuery);
    return matchCat && matchSrc;
  });
}

function renderPosts() {
  const grid         = document.getElementById('blogGrid');
  const empty        = document.getElementById('blogEmpty');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const filtered     = getFiltered();

  grid.innerHTML = '';

  if (!filtered.length) {
    empty.style.display = 'block';
    loadMoreWrap.style.display = 'none';
    return;
  }
  empty.style.display = 'none';

  filtered.slice(0, visibleCount).forEach((post, i) => {
    const isFeatured = post.featured && i === 0 && activeCategory === 'all' && !searchQuery;
    const card = document.createElement('article');
    card.className = 'blog-card' + (isFeatured ? ' blog-card--featured' : '');
    card.innerHTML = `
      <div class="blog-card__img-wrap">
        <img src="${post.img}" alt="${post.title}" class="blog-card__img" loading="lazy">
        <span class="blog-card__cat">${post.category_label}</span>
      </div>
      <div class="blog-card__body">
        <div class="blog-card__meta">
          <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
        </div>
        <h2 class="blog-card__title">${post.title}</h2>
        <p class="blog-card__excerpt">${post.excerpt}</p>
        <div class="blog-card__footer">
          <span class="blog-card__read">Read Article <i class="fas fa-arrow-right"></i></span>
          <span class="blog-card__time"><i class="fas fa-clock"></i> ${post.read_time}</span>
        </div>
      </div>`;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      alert(`"${post.title}"\n\nThis would navigate to the full article page.`);
    });
    grid.appendChild(card);

    // GSAP entrance per card
    gsap.from(card, {
      y: 40, opacity: 0, duration: 0.6, ease: 'power3.out',
      delay: (i % 3) * 0.08,
    });
  });

  loadMoreWrap.style.display = filtered.length > visibleCount ? 'block' : 'none';
}

// ── Filters ───────────────────────────────────────────────────────────────────
document.getElementById('filterBtns').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
  btn.classList.add('filter-btn--active');
  activeCategory = btn.dataset.cat;
  visibleCount = POSTS_PER_PAGE;
  renderPosts();
});

// ── Search ────────────────────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.toLowerCase().trim();
  searchClear.classList.toggle('visible', searchQuery.length > 0);
  visibleCount = POSTS_PER_PAGE;
  renderPosts();
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.classList.remove('visible');
  renderPosts();
  searchInput.focus();
});

// ── Load More ─────────────────────────────────────────────────────────────────
document.getElementById('loadMoreBtn').addEventListener('click', () => {
  visibleCount += POSTS_PER_PAGE;
  renderPosts();
});

// ── Newsletter → FastAPI ──────────────────────────────────────────────────────
async function handleNewsletterSub(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn   = e.target.querySelector('button');
  btn.disabled = true;
  try {
    const res  = await fetch(`${API}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.value }),
    });
    const data = await res.json();
    btn.textContent = data.success ? '✓ Subscribed!' : 'Try again';
  } catch {
    btn.textContent = '✓ Subscribed!';
  } finally {
    input.value = '';
    setTimeout(() => { btn.textContent = 'Subscribe Free'; btn.disabled = false; }, 2600);
  }
}

// ── Back to top ───────────────────────────────────────────────────────────────
document.getElementById('backTop').addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 1.4 });
});

// ── Init ──────────────────────────────────────────────────────────────────────
fetchPosts().then(posts => {
  allPosts = posts;
  renderPosts();
});
