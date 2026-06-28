/* ============================================================
   H2O2U site JS (hamburger, active nav, carousels, form)
   ============================================================ */

/* ---------- Hamburger / mobile menu ---------- */
(function () {
  var burger = document.querySelector('.hamburger');
  var menu = document.querySelector('.mobile-menu');
  var backdrop = document.querySelector('.nav-backdrop');
  if (!burger || !menu) return;

  function open() {
    burger.classList.add('is-open');
    menu.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    document.body.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
  }
  function close() {
    burger.classList.remove('is-open');
    menu.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    if (menu.classList.contains('is-open')) close(); else open();
  }

  burger.addEventListener('click', toggle);
  if (backdrop) backdrop.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) close(); });
})();

/* ---------- Active nav state ---------- */
(function () {
  var page = document.body.getAttribute('data-page');
  if (!page) return;
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === page) a.classList.add('is-active');
  });
})();

/* ---------- Gallery carousel (5-state peek) ---------- */
(function () {
  var track = document.querySelector('.car-track');
  if (!track) return;
  var slides = Array.prototype.slice.call(track.querySelectorAll('.car-slide'));
  var total = slides.length;
  if (total === 0) return;
  var dotsWrap = document.querySelector('.car-dots');
  var current = 0;
  var timer = null;

  var dots = [];
  if (dotsWrap) {
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'car-dot';
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }

  function render() {
    slides.forEach(function (s, idx) {
      s.classList.remove('is-far-left', 'is-prev', 'is-active', 'is-next', 'is-far-right');
      var rel = (idx - current + total) % total;
      if (rel === 0) s.classList.add('is-active');
      else if (rel === 1) s.classList.add('is-next');
      else if (rel === total - 1) s.classList.add('is-prev');
      else if (rel <= Math.floor(total / 2)) s.classList.add('is-far-right');
      else s.classList.add('is-far-left');
    });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
  }
  function go(i) { current = (i + total) % total; render(); restart(); }
  function next() { go(current + 1); }
  function prev() { go(current - 1); }
  function start() { timer = setInterval(next, 2000); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  var nextBtn = document.querySelector('.car-btn.next');
  var prevBtn = document.querySelector('.car-btn.prev');
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  slides.forEach(function (s, idx) {
    s.addEventListener('click', function () {
      if (s.classList.contains('is-next')) next();
      else if (s.classList.contains('is-prev')) prev();
    });
  });

  var vp = document.querySelector('.car-viewport');
  if (vp) {
    vp.addEventListener('mouseenter', stop);
    vp.addEventListener('mouseleave', start);
    vp.addEventListener('touchstart', stop, { passive: true });
    vp.addEventListener('touchend', start, { passive: true });
    var sx = 0;
    vp.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
    }, { passive: true });
  }
  document.addEventListener('keydown', function (e) {
    if (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  render();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) start();
})();

/* ---------- Reviews carousel (one at a time) ---------- */
(function () {
  var wrap = document.querySelector('.rev-track');
  if (!wrap) return;
  var cards = Array.prototype.slice.call(wrap.querySelectorAll('.rev-card'));
  var total = cards.length;
  if (total < 2) return;
  var dotsWrap = document.querySelector('.rev-dots');
  var cur = 0, timer = null;

  var dots = [];
  if (dotsWrap) {
    cards.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'car-dot';
      d.setAttribute('aria-label', 'Review ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }
  function render() {
    cards.forEach(function (c, i) { c.classList.toggle('is-active', i === cur); });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === cur); });
  }
  function go(i) { cur = (i + total) % total; render(); restart(); }
  function next() { go(cur + 1); }
  function prev() { go(cur - 1); }
  function start() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(next, 7000);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  var nb = document.querySelector('.rev-btn.next');
  var pb = document.querySelector('.rev-btn.prev');
  if (nb) nb.addEventListener('click', next);
  if (pb) pb.addEventListener('click', prev);

  var vp = document.querySelector('.rev-viewport');
  if (vp) {
    vp.addEventListener('mouseenter', stop);
    vp.addEventListener('mouseleave', start);
    vp.addEventListener('focusin', stop);
    vp.addEventListener('focusout', start);
  }
  render();
  start();
})();

/* ---------- Formspree _next absolute URL ---------- */
(function () {
  var nextField = document.querySelector('input[name="_next"]');
  if (nextField) nextField.value = new URL('thank-you.html', window.location.href).href;
})();
