/**
 * Laxman Insurance v3.0 — Premium JavaScript
 * Features: Navbar, Scroll Reveal, Counters, Slider, FAQ, Form, Parallax
 */

'use strict';

/* ── HELPERS ── */
const qs  = (s,p=document) => p.querySelector(s);
const qsa = (s,p=document) => [...p.querySelectorAll(s)];

/* ── NAVBAR ── */
const navbar   = qs('#navbar');
const hamburger= qs('#hamburger');
const navLinks = qs('#navLinks');
let lastScroll = 0;

function handleScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  qs('#scrollTop')?.classList.toggle('visible', y > 450);
  updateActiveLink();

  // Subtle hide-on-scroll-down for mobile
  if (window.innerWidth < 768) {
    if (y > lastScroll + 6 && y > 120) navbar.style.transform = 'translateY(-100%)';
    else if (y < lastScroll - 6) navbar.style.transform = 'translateY(0)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScroll = y;
}

window.addEventListener('scroll', handleScroll, { passive: true });

/* Mobile menu */
const overlay = Object.assign(document.createElement('div'), {
  className: 'mobile-overlay'
});
overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:998;opacity:0;pointer-events:none;transition:opacity .3s ease;backdrop-filter:blur(3px)';
document.body.appendChild(overlay);

function openMenu() {
  hamburger.classList.add('active');
  navLinks.classList.add('open');
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () =>
  navLinks.classList.contains('open') ? closeMenu() : openMenu()
);
overlay.addEventListener('click', closeMenu);
qsa('#navLinks a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

/* Active nav link for single-page */
function updateActiveLink() {
  const sections = qsa('section[id]');
  const pos = window.scrollY + 90;
  sections.forEach(sec => {
    const link = qs(`.nav-link[href="#${sec.id}"]`);
    if (!link) return;
    const active = pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight;
    link.classList.toggle('active', active);
  });
}

/* ── SMOOTH SCROLL (hash links) ── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = qs(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const top = target.getBoundingClientRect().top + window.scrollY - (navbar?.offsetHeight || 72);
  window.scrollTo({ top, behavior: 'smooth' });
});

/* ── SCROLL REVEAL ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    setTimeout(() => en.target.classList.add('revealed'), +(en.target.dataset.delay || 0));
    revealObs.unobserve(en.target);
  });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  qsa('[data-reveal],[data-reveal-fade],[data-reveal-left],[data-reveal-right]').forEach((el, i) => {
    revealObs.observe(el);
  });

  /* Stagger children in grids */
  qsa('.services-grid,.why-grid,.plans-grid,.tl-grid,.doc-grid,.values-grid,.team-grid,.svc-page-grid,.services-page-grid,.claim-steps-grid').forEach(grid => {
    qsa('[data-reveal]', grid).forEach((child, idx) => {
      child.style.transitionDelay = `${idx * 0.07}s`;
    });
  });
}

/* ── ANIMATED COUNTERS ── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const dur = 1800;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const val = target * easeOutCubic(p);
    el.textContent = Number.isInteger(target)
      ? Math.round(val).toLocaleString('en-IN')
      : val.toFixed(1);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = Number.isInteger(target)
      ? target.toLocaleString('en-IN')
      : target.toFixed(1);
  })(t0);
}

const countObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting && !en.target.classList.contains('counted')) {
      en.target.classList.add('counted');
      animateCount(en.target);
    }
  });
}, { threshold: .6 });

qsa('[data-count]').forEach(el => countObs.observe(el));

/* ── TESTIMONIAL SLIDER ── */
function initSlider() {
  const track  = qs('#sliderTrack');
  const prev   = qs('#slPrev');
  const next   = qs('#slNext');
  const dotsEl = qs('#slDots');
  if (!track) return;

  const slides = qsa('.testi-card', track);
  const dots   = dotsEl ? qsa('.sl-dot', dotsEl) : [];
  let cur = 0, timer;

  function go(n) {
    cur = ((n % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function start() { timer = setInterval(() => go(cur + 1), 5500); }
  function stop()  { clearInterval(timer); }

  prev?.addEventListener('click', () => { stop(); go(cur - 1); start(); });
  next?.addEventListener('click', () => { stop(); go(cur + 1); start(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stop(); go(i); start(); }));

  /* Touch */
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 45) { stop(); go(dx > 0 ? cur + 1 : cur - 1); start(); }
  });

  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
  start();
}

/* ── FAQ ACCORDION ── */
function initFAQ() {
  qsa('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const ans  = qs('.faq-a', item);
      const open = item.classList.contains('open');

      qsa('.faq-item.open').forEach(it => {
        if (it !== item) {
          it.classList.remove('open');
          qs('.faq-a', it).style.maxHeight = '0';
        }
      });

      item.classList.toggle('open', !open);
      ans.style.maxHeight = open ? '0' : ans.scrollHeight + 'px';
    });
  });
}

/* ── CONTACT FORM ── */
function initForm() {
  const form = qs('#contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = qs('.form-submit', form);
    const orig = btn.innerHTML;
    btn.innerHTML = 'Sending <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
    btn.disabled = true;
    btn.style.opacity = '.7';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.opacity = '';
      form.reset();
      showToast('Message sent! We will contact you within 24 hours.');
    }, 1700);
  });
}

/* ── TOAST ── */
function showToast(msg) {
  qsa('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${msg}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4200);
}

/* ── SCROLL TOP ── */
qs('#scrollTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── HERO TILT (desktop) ── */
function initTilt() {
  const cards = qsa('.hv-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(600px) rotateY(${x*8}deg) rotateX(${-y*6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ── NAVBAR ACTIVE (multipage) ── */
function setPageActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  qsa('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  handleScroll();
  initReveal();
  initSlider();
  initFAQ();
  initForm();
  initTilt();
  setPageActive();
});
