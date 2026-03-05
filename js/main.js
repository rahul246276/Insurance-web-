/**
 * Laxman Insurance v3.0 — Premium JavaScript
 * Features: Navbar, Scroll Reveal, Counters, Slider, FAQ, Form, Parallax, Calculator
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

hamburger?.addEventListener('click', () => navLinks.classList.contains('open') ? closeMenu() : openMenu());
overlay.addEventListener('click', closeMenu);

// Close menu on nav link click
qsa('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

// Close menu on Escape key
document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

/* ── SMOOTH SCROLL & ACTIVE LINK ── */
function updateActiveLink() {
  const sections = qsa('section[id]');
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    const { id } = section;
    const link = qs(`.nav-link[href="#${id}"]`);
    if (!link) return;

    const top = section.offsetTop;
    const height = section.offsetHeight;

    link.classList.toggle('active', scrollPos >= top && scrollPos < top + height);
  });
}

qsa('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = qs(anchor.getAttribute('href'));
    if (target) {
      const offset = 80;
      const targetPos = target.offsetTop - offset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
      closeMenu();
    }
  });
});

/* ── SCROLL TO TOP ── */
qs('#scrollTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = +el.dataset.count;
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString('en-IN');
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
      animateCounter(entry.target);
      entry.target.classList.add('counted');
    }
  });
}, { threshold: 0.5 });

qsa('[data-count]').forEach(el => counterObserver.observe(el));

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function initReveal() {
  qsa('[data-reveal]').forEach(el => revealObserver.observe(el));
  qsa('[data-reveal-left]').forEach(el => revealObserver.observe(el));
  qsa('[data-reveal-right]').forEach(el => revealObserver.observe(el));
}

/* ── IMPROVED TESTIMONIAL SLIDER ── */
const testimonialsTrack = qs('#testimonialsTrack');
const testimonialPrev = qs('#testimonialPrev');
const testimonialNext = qs('#testimonialNext');
const testimonialDots = qs('#testimonialDots');
let currentTestimonialSlide = 0;

function updateTestimonialSlider() {
  const totalSlides = qsa('.testimonials-slide').length;
  testimonialsTrack.style.transform = `translateX(-${currentTestimonialSlide * 100}%)`;
  
  // Update dots
  qsa('.testimonial-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentTestimonialSlide);
  });
}

function nextTestimonialSlide() {
  const totalSlides = qsa('.testimonials-slide').length;
  currentTestimonialSlide = (currentTestimonialSlide + 1) % totalSlides;
  updateTestimonialSlider();
}

function prevTestimonialSlide() {
  const totalSlides = qsa('.testimonials-slide').length;
  currentTestimonialSlide = (currentTestimonialSlide - 1 + totalSlides) % totalSlides;
  updateTestimonialSlider();
}

function goToTestimonialSlide(index) {
  currentTestimonialSlide = index;
  updateTestimonialSlider();
}

// Event listeners
testimonialNext?.addEventListener('click', nextTestimonialSlide);
testimonialPrev?.addEventListener('click', prevTestimonialSlide);

// Dot navigation
qsa('.testimonial-dot').forEach((dot, index) => {
  dot.addEventListener('click', () => goToTestimonialSlide(index));
});

// Auto-play slider
setInterval(nextTestimonialSlide, 6000);

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

testimonialsTrack?.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

testimonialsTrack?.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      nextTestimonialSlide(); // Swipe left - next slide
    } else {
      prevTestimonialSlide(); // Swipe right - previous slide
    }
  }
}

/* ── CALCULATOR FUNCTIONALITY ── */
// Tab switching
qsa('.calc-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    
    // Update active tab
    qsa('.calc-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active panel
    qsa('.calc-panel').forEach(panel => panel.classList.remove('active'));
    qs(`#${targetTab}`).classList.add('active');
  });
});

// Life Insurance Calculator
function calculateLife() {
  const income = +qs('#life-income').value || 0;
  const age = +qs('#life-age').value || 30;
  const retireAge = +qs('#life-retire').value || 60;
  const existing = +qs('#life-existing').value || 0;
  const loans = +qs('#life-loans').value || 0;
  const education = +qs('#life-education').value || 0;
  
  const workingYears = Math.max(0, retireAge - age);
  const incomeReplacement = income * workingYears * 0.7; // 70% of income
  const totalCoverage = incomeReplacement + loans + education - existing;
  
  // Display results
  qs('#life-coverage').textContent = Math.max(0, totalCoverage).toLocaleString('en-IN');
  qs('#life-income-replacement').textContent = incomeReplacement.toLocaleString('en-IN');
  qs('#life-loan-coverage').textContent = loans.toLocaleString('en-IN');
  qs('#life-edu-coverage').textContent = education.toLocaleString('en-IN');
  
  qs('#life-result').style.display = 'block';
}

// Health Insurance Calculator
function calculateHealth() {
  const members = +qs('#health-members').value || 1;
  const age = +qs('#health-age').value || 35;
  const city = qs('#health-city').value;
  const preExisting = qs('#health-preexisting').value === 'yes';
  
  let baseCoverage = 500000; // Base 5L
  if (age > 40) baseCoverage *= 1.5;
  if (age > 50) baseCoverage *= 1.3;
  
  // Family floater calculation
  const floaterMultiplier = members === 1 ? 1 : members === 2 ? 1.8 : members === 3 ? 2.5 : 3.2;
  const floaterCoverage = baseCoverage * floaterMultiplier;
  
  // City loading
  const cityLoading = city === 'metro' ? 0.3 : city === 'tier1' ? 0.2 : city === 'tier2' ? 0.1 : 0;
  const cityAmount = floaterCoverage * cityLoading;
  
  const totalCoverage = Math.round(floaterCoverage + cityAmount);
  
  // Display results
  qs('#health-coverage').textContent = totalCoverage.toLocaleString('en-IN');
  qs('#health-base').textContent = Math.round(baseCoverage).toLocaleString('en-IN');
  qs('#health-floater').textContent = Math.round(floaterCoverage - baseCoverage).toLocaleString('en-IN');
  qs('#health-city-loading').textContent = Math.round(cityAmount).toLocaleString('en-IN');
  
  qs('#health-result').style.display = 'block';
}

// Car Insurance Calculator
function calculateCar() {
  const carValue = +qs('#car-value').value || 800000;
  const carAge = +qs('#car-age').value || 3;
  const fuel = qs('#car-fuel').value;
  const coverage = qs('#car-coverage').value;
  const ncb = +qs('#car-ncb').value || 0;
  const claims = +qs('#car-claims').value || 0;
  
  // Base premium calculation
  let ownDamage = carValue * 0.03; // 3% of car value
  if (carAge > 5) ownDamage *= 0.8;
  if (carAge > 10) ownDamage *= 0.6;
  
  // Fuel type loading
  if (fuel === 'diesel') ownDamage *= 1.15;
  if (fuel === 'cng') ownDamage *= 1.1;
  
  // Coverage type
  if (coverage === 'comprehensive-zero') ownDamage *= 1.3;
  else if (coverage === 'third') ownDamage = 0;
  
  // Third party premium (fixed rates)
  const thirdParty = carValue > 1500000 ? 7800 : carValue > 1000000 ? 5400 : 3200;
  
  // Apply NCB
  const ncbDiscount = ownDamage * (ncb / 100);
  ownDamage -= ncbDiscount;
  
  // Claim loading
  if (claims === 1) ownDamage *= 1.2;
  if (claims === 2) ownDamage *= 1.5;
  
  const totalPremium = Math.round(ownDamage + thirdParty);
  
  // Display results
  qs('#car-premium').textContent = totalPremium.toLocaleString('en-IN');
  qs('#car-base').textContent = Math.round(ownDamage + ncbDiscount).toLocaleString('en-IN');
  qs('#car-od').textContent = Math.round(ownDamage).toLocaleString('en-IN');
  qs('#car-tp').textContent = thirdParty.toLocaleString('en-IN');
  
  qs('#car-result').style.display = 'block';
}

/* ── FAQ FUNCTIONALITY ── */
qsa('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    qsa('.faq-item').forEach(item => item.classList.remove('active'));
    
    // Open clicked item if it wasn't active
    if (!isActive) {
      faqItem.classList.add('active');
    }
  });
});

/* ── FORM HANDLING ── */
const forms = qsa('form');
forms.forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted:', new FormData(form));
  });
});

/* ── INITIALIZATION ── */
document.addEventListener('DOMContentLoaded', () => {
  updateActiveLink();
  handleScroll();
});

// Make calculator functions globally accessible
window.calculateLife = calculateLife;
window.calculateHealth = calculateHealth;
window.calculateCar = calculateCar;

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
