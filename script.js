'use strict';

/* =================================================================
   CANDY NAILS & SPA — SCRIPT.JS
   1. Theme         2. Cursor           3. Sparkles
   4. Header        5. Mobile Nav       6. Scroll Reveal
   7. Floating Btn  8. Testimonials     9. Gallery Filter
   10. Lightbox     11. FAQ             12. Today's Hours
   ================================================================= */

/* ──────────────────────────────────────────
   1. Theme toggle (light / dark)
   ────────────────────────────────────────── */
function setupTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('cn-theme', next); } catch (e) {}
  });
}


/* ──────────────────────────────────────────
   2. Custom cursor glow  (desktop only)
   ────────────────────────────────────────── */
function setupCursor() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mx = 0, my = 0, cx = 0, cy = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    glow.classList.add('visible');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  });

  document.addEventListener('mouseleave', () => glow.classList.remove('visible'));
  document.addEventListener('mousedown', () => glow.classList.add('clicking'));
  document.addEventListener('mouseup',   () => glow.classList.remove('clicking'));

  function tick() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    raf = requestAnimationFrame(tick);
  }
}


/* ──────────────────────────────────────────
   3. Hero sparkle particles (canvas)
   ────────────────────────────────────────── */
function setupSparkles() {
  const canvas = document.getElementById('sparkleCanvas');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const particles = [];
  const COUNT = 55;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(min, max) { return min + Math.random() * (max - min); }

  // Particle shapes: diamond (✦) rendered via path
  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x    = rand(0, canvas.width);
      this.y    = initial ? rand(0, canvas.height) : canvas.height + 10;
      this.size = rand(2, 6);
      this.alpha= rand(0.3, 0.9);
      this.vy   = rand(-0.6, -1.8);
      this.vx   = rand(-0.4, 0.4);
      this.rot  = rand(0, Math.PI * 2);
      this.vrot = rand(-0.02, 0.02);
      this.color= Math.random() > 0.5
        ? `rgba(212,163,163,${this.alpha})`
        : `rgba(197,160,89,${this.alpha})`;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color;
      // Draw a small diamond
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size * 0.6, 0);
      ctx.lineTo(0, this.size);
      ctx.lineTo(-this.size * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.rot += this.vrot;
      this.alpha *= 0.998;
      if (this.y < -10 || this.alpha < 0.05) this.reset(false);
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}


/* ──────────────────────────────────────────
   4. Header scroll effect & active nav
   ────────────────────────────────────────── */
function setupHeader() {
  const hdr = document.getElementById('hdr');
  if (!hdr) return;

  const sections = [...document.querySelectorAll('section[id], div[id="home"]')];
  const navLinks = [...document.querySelectorAll('.nav__link')];

  function onScroll() {
    // Scrolled state
    if (window.scrollY > 50) hdr.classList.add('scrolled');
    else                     hdr.classList.remove('scrolled');

    // Active nav link
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ──────────────────────────────────────────
   5. Mobile nav (hamburger, focus trap, Esc)
   ────────────────────────────────────────── */
function setupMobileNav() {
  const btn     = document.getElementById('hamburgerBtn');
  const nav     = document.getElementById('mobileNav');
  const links   = nav ? [...nav.querySelectorAll('a, button')] : [];
  if (!btn || !nav) return;

  let focusTrap;

  function open() {
    btn.classList.add('active');
    nav.classList.add('active');
    nav.removeAttribute('aria-hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Menu sluiten');
    document.body.style.overflow = 'hidden';

    // Focus first link
    setTimeout(() => { if (links[0]) links[0].focus(); }, 80);

    focusTrap = function(e) {
      if (e.key !== 'Tab') return;
      const first = links[0], last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', focusTrap);
  }

  function close() {
    btn.classList.remove('active');
    nav.classList.remove('active');
    nav.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Menu openen');
    document.body.style.overflow = '';
    btn.focus();
    if (focusTrap) document.removeEventListener('keydown', focusTrap);
  }

  btn.addEventListener('click', () => {
    if (nav.classList.contains('active')) close(); else open();
  });

  // Close on Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('active')) close();
  });

  // Close when a link is clicked
  nav.querySelectorAll('.mobile-nav__link, .btn').forEach(el => {
    el.addEventListener('click', close);
  });

  // Close when clicking outside (on header or page)
  document.addEventListener('click', e => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      close();
    }
  });
}


/* ──────────────────────────────────────────
   6. Scroll reveal  (IntersectionObserver)
   ────────────────────────────────────────── */
function setupReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => io.observe(el));
}


/* ──────────────────────────────────────────
   7. Floating booking button visibility
   ────────────────────────────────────────── */
function setupFloatingBtn() {
  const btn  = document.getElementById('floatingBtn');
  const hero = document.querySelector('.hero');
  if (!btn || !hero) return;

  btn.removeAttribute('hidden');

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) btn.classList.remove('visible');
    else                      btn.classList.add('visible');
  }, { threshold: 0.05 });

  io.observe(hero);
}


/* ──────────────────────────────────────────
   8. Testimonial slider
   ────────────────────────────────────────── */
function setupSlider() {
  const slides  = [...document.querySelectorAll('#testimonialSlider .slide')];
  const dots    = [...document.querySelectorAll('#sliderDots .slider__dot')];
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function go(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    dots[current]?.setAttribute('aria-selected', 'false');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    dots[current]?.setAttribute('aria-selected', 'true');
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), 7000);
  }

  prevBtn?.addEventListener('click', () => { go(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { go(current + 1); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      go(Number(dot.dataset.index));
      startAuto();
    });
  });

  // Swipe support
  let startX = 0;
  const slider = document.getElementById('testimonialSlider');
  slider?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(dx < 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  startAuto();
}


/* ──────────────────────────────────────────
   9. Gallery filter
   ────────────────────────────────────────── */
function setupGalleryFilter() {
  const filterBar = document.getElementById('galleryFilters');
  const items     = [...document.querySelectorAll('#galleryGrid .gallery-item')];
  if (!filterBar || !items.length) return;

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    items.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('hidden', !show);
    });
  });
}


/* ──────────────────────────────────────────
   10. Gallery lightbox
   ────────────────────────────────────────── */
function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const img      = document.getElementById('lightboxImg');
  const close    = document.getElementById('lightboxClose');
  const backdrop = document.getElementById('lightboxBackdrop');
  const prevBtn  = document.getElementById('lightboxPrev');
  const nextBtn  = document.getElementById('lightboxNext');
  const items    = () => [...document.querySelectorAll('#galleryGrid .gallery-item:not(.hidden)')];
  if (!lightbox || !img) return;

  let currentIdx = 0;

  function openAt(idx) {
    const visible = items();
    if (!visible[idx]) return;
    currentIdx = idx;
    const src = visible[idx].dataset.src;
    const alt = visible[idx].dataset.alt || '';
    img.src = src;
    img.alt = alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to the item
    const visible = items();
    visible[currentIdx]?.focus();
  }

  function navigate(dir) {
    const visible = items();
    if (!visible.length) return;
    currentIdx = (currentIdx + dir + visible.length) % visible.length;
    const src = visible[currentIdx].dataset.src;
    const alt = visible[currentIdx].dataset.alt || '';
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = src; img.alt = alt;
      img.style.opacity = '1';
    }, 150);
  }

  // Click on gallery items
  document.getElementById('galleryGrid')?.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const visible = items();
    const idx = visible.indexOf(item);
    if (idx !== -1) openAt(idx);
  });

  // Keyboard open on gallery items
  document.getElementById('galleryGrid')?.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.gallery-item')) {
      e.preventDefault();
      e.target.closest('.gallery-item').click();
    }
  });

  close.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Swipe
  let startX = 0;
  lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  }, { passive: true });
}


/* ──────────────────────────────────────────
   11. FAQ Accordion
   ────────────────────────────────────────── */
function setupFaq() {
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = document.getElementById(answerId);
      if (!answer) return;

      btn.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        answer.hidden = true;
      } else {
        answer.hidden = false;
      }
    });
  });
}


/* ──────────────────────────────────────────
   12. Today's opening hours
   ────────────────────────────────────────── */
function setupTodayHours() {
  const el = document.getElementById('todayHours');
  if (!el) return;

  const day = new Date().getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  const isWinter = [10, 11, 0, 1, 2].includes(new Date().getMonth()); // Oct–Mar

  const schedule = {
    0: 'Vandaag: Gesloten 🙁',
    1: 'Vandaag: 10:00 – 18:00 ✅',
    2: 'Vandaag: 10:00 – 18:00 ✅',
    3: 'Vandaag: 10:00 – 18:00 ✅',
    4: isWinter ? 'Vandaag (Winter): 10:00 – 18:00 ✅' : 'Vandaag (Zomer): 10:00 – 20:00 ✅',
    5: 'Vandaag: 10:00 – 18:00 ✅',
    6: 'Vandaag: 10:00 – 18:00 ✅',
  };

  el.textContent = schedule[day] || 'Ma–Za: 10:00 – 18:00';
}


/* ──────────────────────────────────────────
   Init on DOM ready
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupHeader();
  setupMobileNav();
  setupReveal();
  setupFloatingBtn();
  setupSlider();
  setupGalleryFilter();
  setupLightbox();
  setupFaq();
  setupTodayHours();

  // Only run heavy visuals when motion is OK
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    setupSparkles();
  }

  // Cursor: only on true pointer devices
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    setupCursor();
  }

  // Make gallery items keyboard-focusable
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });
});
