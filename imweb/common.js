/* ==========================================================
   LUCINA TAROT · common.js (v1.0) — Vanilla JS, 외부 라이브러리 없음
   - 중복 로드/실행되어도 이벤트가 한 번만 등록됩니다.
   - 각 모듈은 try/catch로 격리되어 하나가 실패해도 나머지는 동작합니다.
   - 이 스크립트가 실패해도 모든 콘텐츠는 보이고, 상담 버튼은 #lucina-cta로 이동합니다.
   ========================================================== */
(function (w, d) {
  'use strict';
  if (w.LucinaTarot && w.LucinaTarot.version) { try { w.LucinaTarot.refresh(); } catch (e) {} return; }

  var C = {};
  var mq = function (q) { return !!(w.matchMedia && w.matchMedia(q).matches); };
  var REDUCE = mq('(prefers-reduced-motion: reduce)');
  var FINE = mq('(hover: hover) and (pointer: fine)');
  var HAS_IO = 'IntersectionObserver' in w;

  function readConfig() {
    var c = w.LUCINA_CONFIG || {};
    return {
      consultationUrl: (c.consultationUrl || w.LUCINA_CONSULTATION_URL || '').trim(),
      consultationLabel: c.consultationLabel || '상담 창구',
      passQueryParams: !!c.passQueryParams,
      stickyCta: c.stickyCta !== false,
      hero3d: c.hero3d !== false,
      threeUrl: c.threeUrl || 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js',
      info: c.info || {},
      images: c.images || {},
      assetBase: c.assetBase || '',
      reviews: Array.isArray(c.reviews) ? c.reviews : []
    };
  }
  function safe(name, fn) { try { fn(); } catch (e) { if (w.console) console.warn('[lucina] ' + name + ' 실패:', e); } }
  function all(sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); }
  function once(el, key) { var k = 'lucina' + key; if (el.getAttribute('data-' + k)) return false; el.setAttribute('data-' + k, '1'); return true; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- content: images / fields ---------- */
  function asset(p) {
    if (!p || /^(https?:|data:|\/\/|\/)/.test(p) || !C.assetBase) return p;
    return C.assetBase.replace(/\/?$/, '/') + p.replace(/^\.?\//, '');
  }
  function content() {
    all('[data-lucina-src]').forEach(function (el) { var s = asset(el.getAttribute('data-lucina-src')); if (s && el.getAttribute('src') !== s) el.setAttribute('src', s); });
    all('[data-lucina-img]').forEach(function (el) {
      var src = C.images[el.getAttribute('data-lucina-img')];
      if (!src || el.querySelector('img') || !once(el, 'img')) return;
      var img = d.createElement('img');
      img.src = asset(src); img.alt = el.getAttribute('data-lucina-alt') || ''; img.loading = 'lazy'; img.decoding = 'async';
      el.appendChild(img); el.classList.add('lucina-has-img');
    });
    all('[data-lucina-field]').forEach(function (el) {
      var v = C.info[el.getAttribute('data-lucina-field')];
      if (!v) return;
      el.textContent = v; el.classList.remove('lucina-todo');
      if (el.getAttribute('data-lucina-field') === 'phone' && el.tagName === 'A') el.href = 'tel:' + v.replace(/[^0-9+]/g, '');
    });
    all('[data-lucina-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- reviews v2: 후기 슬라이드 + 사진 띠 ---------- */
  function reviews() {
    all('[data-lucina-rv]').forEach(function (box) {
      if (!once(box, 'rvw')) return;
      var list = C.reviews.filter(function (r) { return r && r.quote; });
      var wrap = box.querySelector('[data-lucina-rv-slides]'), nav = box.querySelector('[data-lucina-rv-nav]');
      var media = box.querySelector('.lucina-rv2__photo .lucina-media');
      if (!list.length || !wrap) return;
      wrap.innerHTML = list.map(function (r, i) {
        var story = r.story || [r.before, r.during, r.after].filter(Boolean).join(' ');
        return '<article class="lucina-rv2__slide' + (i ? '' : ' lucina-is-on') + '">' +
          '<p class="lucina-rv2__quote">' + esc(r.quote) + '</p>' +
          (story ? '<p class="lucina-rv2__story">' + esc(story) + '</p>' : '') +
          '<p class="lucina-rv2__who"><b>' + esc(r.name || '수강생') + '</b>' + (r.course ? '<span>' + esc(r.course) + '</span>' : '') + '</p></article>';
      }).join('');
      var slides = all('.lucina-rv2__slide', wrap), cur = 0, timer = 0, paused = false, DUR = 7000;
      var curEl = box.querySelector('[data-lucina-rv-cur]'), totEl = box.querySelector('[data-lucina-rv-total]'), bar = box.querySelector('[data-lucina-rv-bar]');
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      if (totEl) totEl.textContent = pad(slides.length);
      function photo(i) {
        var src = list[i].photo; if (!src || !media) return;
        var img = media.querySelector('img');
        if (!img) { img = d.createElement('img'); img.alt = ''; media.appendChild(img); media.classList.add('lucina-has-img'); }
        img.style.opacity = '0';
        setTimeout(function () { img.src = asset(src); img.alt = (list[i].name || '수강생') + ' 사진'; img.onload = function () { img.style.opacity = '1'; }; }, 250);
      }
      function run() {
        clearTimeout(timer);
        if (!bar) return;
        bar.classList.remove('lucina-run'); void bar.offsetWidth;
        if (REDUCE || paused || slides.length < 2) return;
        bar.style.setProperty('--lucina-dur', DUR + 'ms'); bar.classList.add('lucina-run');
        timer = setTimeout(function () { go(cur + 1); }, DUR);
      }
      function go(i) {
        cur = (i + slides.length) % slides.length;
        slides.forEach(function (s, j) { s.classList.toggle('lucina-is-on', j === cur); });
        if (curEl) curEl.textContent = pad(cur + 1);
        photo(cur); run();
      }
      if (slides.length > 1 && nav) {
        nav.hidden = false;
        box.querySelector('[data-lucina-rv-prev]').addEventListener('click', function () { go(cur - 1); });
        box.querySelector('[data-lucina-rv-next]').addEventListener('click', function () { go(cur + 1); });
        box.addEventListener('mouseenter', function () { paused = true; run(); });
        box.addEventListener('mouseleave', function () { paused = false; run(); });
        box.addEventListener('focusin', function () { paused = true; run(); });
        box.addEventListener('focusout', function () { paused = false; run(); });
      }
      photo(0); run();
    });
    all('[data-lucina-strip]').forEach(function (s) {
      if (!once(s, 'strip')) return;
      var track = s.querySelector('[data-lucina-strip-track]'); if (!track) return;
      all('.lucina-rv2__shot', track).forEach(function (li) { if (!li.querySelector('.lucina-has-img')) li.parentNode.removeChild(li); });
      var items = all('.lucina-rv2__shot', track);
      if (!items.length) { s.style.display = 'none'; return; }
      if (REDUCE || items.length < 3) return;
      items.forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); all('img', c).forEach(function (im) { im.alt = ''; }); track.appendChild(c); });
      s.style.setProperty('--lucina-mq', (items.length * 9) + 's');
      s.classList.add('lucina-is-loop');
    });
  }

  /* ---------- reveal ---------- */
  var revealIO = null;
  function reveal() {
    all('.lucina-root').forEach(function (root) { root.classList.add('lucina-ready'); });
    var els = all('[data-lucina-reveal]').filter(function (el) { return once(el, 'rv'); });
    if (REDUCE || !HAS_IO) { els.forEach(function (el) { el.classList.add('lucina-in'); }); return; }
    if (!revealIO) revealIO = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('lucina-in'); revealIO.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- hero 3D deck ---------- */
  function hero() {
    all('[data-lucina-deck]').forEach(function (deck) {
      if (!once(deck, 'deck') || REDUCE) return;
      var hero = deck.closest('.lucina-hero') || deck.parentNode;
      deck.style.setProperty('--lucina-s', '0.05');
      setTimeout(function () {
        deck.style.setProperty('--lucina-s', '1');
        setTimeout(function () { deck.classList.add('lucina-deck--live'); onScroll(); }, 1500);
      }, 180);

      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      function loop() {
        cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
        deck.style.setProperty('--lucina-ry', (-12 + cx * 9).toFixed(2) + 'deg');
        deck.style.setProperty('--lucina-rx', (10 - cy * 6).toFixed(2) + 'deg');
        deck.style.setProperty('--lucina-lx', (50 + cx * 45).toFixed(1));
        raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(loop) : 0;
      }
      if (FINE && w.innerWidth > 768) {
        hero.addEventListener('pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1;
          if (!raf) raf = requestAnimationFrame(loop);
        });
        hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      }
      var ticking = false;
      function onScroll() {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var r = hero.getBoundingClientRect();
          var p = Math.min(1, Math.max(0, -r.top / (r.height * 0.85)));
          deck.style.setProperty('--lucina-p', p.toFixed(3));
          if (deck.classList.contains('lucina-deck--live')) deck.style.setProperty('--lucina-s', (1 + p * 0.6).toFixed(3));
        });
      }
      w.addEventListener('scroll', onScroll, { passive: true });
    });
  }


  /* ---------- hero v2: card orbit ---------- */
  function orbit() {
    all('[data-lucina-orbit]').forEach(function (orb) {
      if (!once(orb, 'orb')) return;
      var hero = orb.closest('.lucina-hero') || orb.parentNode;
      var cards = all('[data-lucina-orb-card]', orb), n = cards.length || 1;
      var a = 0, last = 0, tx = 0, ty = 0, cx = 0, cy = 0, visible = true, raf = 0;
      function shade() {
        cards.forEach(function (c, i) {
          var z = Math.cos((i * 360 / n + a) * Math.PI / 180);
          c.style.opacity = (z >= 0 ? 1 - 0.5 * z : 1 + 0.72 * z).toFixed(3);
        });
      }
      function frame(t) {
        if (hero.classList.contains('lucina-gl-on')) { raf = 0; return; }
        var dt = last ? Math.min(64, t - last) : 16; last = t;
        if (!REDUCE) a = (a + dt * 0.0055) % 360;
        cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
        orb.style.setProperty('--lucina-a', a.toFixed(2) + 'deg');
        hero.style.setProperty('--lucina-tx', cx.toFixed(3));
        hero.style.setProperty('--lucina-ty', cy.toFixed(3));
        shade();
        raf = (visible && !REDUCE) ? requestAnimationFrame(frame) : 0;
      }
      shade();
      if (REDUCE) return;
      raf = requestAnimationFrame(frame);
      if (HAS_IO) new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      }).observe(hero);
      if (FINE && w.innerWidth > 768) {
        hero.addEventListener('pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        });
        hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
      }
      var ticking = false;
      w.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var r = hero.getBoundingClientRect();
          hero.style.setProperty('--lucina-p', Math.min(1, Math.max(0, -r.top / (r.height * 0.9))).toFixed(3));
        });
      }, { passive: true });
    });
  }


  /* ---------- hero v3: cinematic WebGL (Three.js, 지연 로드) ---------- */
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var eOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var eIO = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  function cine() {
    all('[data-lucina-cine]').forEach(function (sec) {
      if (!once(sec, 'cine')) return;
      var pin = sec.querySelector('[data-lucina-pin]'), host = sec.querySelector('[data-lucina-gl]');
      if (!pin || !host) return;
      var tall = !REDUCE;
      if (tall) sec.classList.add('lucina-cine--tall');
      var st = { p: 0, manual: false };
      sec.__lucina = st;
      var copy = sec.querySelector('[data-lucina-reveal-copy]'), cue = sec.querySelector('[data-lucina-cue]');
      function onScroll() {
        var r = sec.getBoundingClientRect(), ph = pin.offsetHeight, span = Math.max(1, sec.offsetHeight - ph);
        st.p = clamp01(-r.top / span);
        // sticky가 부모 overflow 등으로 막힌 환경(아임웹 일부)에서는 수동 고정으로 전환
        if (!st.manual && tall && r.top < -40 && r.bottom > ph + 40 && pin.getBoundingClientRect().top < -30) st.manual = true;
        if (st.manual) pin.style.transform = 'translate3d(0,' + Math.min(Math.max(-r.top, 0), span).toFixed(1) + 'px,0)';
        if (tall && copy) {
          var o = clamp01((st.p - .28) / .16) * (1 - clamp01((st.p - .78) / .14));
          copy.style.opacity = o.toFixed(3);
          copy.style.transform = 'translateY(' + ((1 - o) * 24 * (st.p < .5 ? 1 : -1)).toFixed(1) + 'px) scale(' + (0.97 + o * .03).toFixed(3) + ')';
        }
        if (tall && cue) cue.style.opacity = (1 - clamp01(st.p / .07)).toFixed(3);
      }
      if (tall) { w.addEventListener('scroll', onScroll, { passive: true }); w.addEventListener('resize', onScroll); onScroll(); }

      if (!C.hero3d) return;
      var ok = false; try { var t = d.createElement('canvas'); ok = !!(t.getContext('webgl2') || t.getContext('webgl')); } catch (e) {}
      if (!ok) return;
      var dyn; try { dyn = new Function('u', 'return import(u)'); } catch (e) { return; }
      dyn(C.threeUrl).catch(function () { return dyn(C.threeUrl.replace('.module.min.js', '.module.js')); })
        .then(function (THREE) { safe('cine-scene', function () { buildScene(THREE, sec, host, st); }); })
        .catch(function (e) { if (w.console) console.warn('[lucina] three.js 로드 실패 — CSS 히어로 유지', e); });
    });
  }

  function cardCanvas(mode) {
    var W = 512, H = 878, c = d.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d'), cx = W / 2, cy = H / 2, i, a;
    var ink = mode === 'color' ? '#E0C285' : mode === 'metal' ? '#ffffff' : '#383838';
    var bg = mode === 'color' ? '#141c34' : mode === 'metal' ? '#000000' : '#a6a6a6';
    if (mode === 'color') {
      var g = x.createRadialGradient(cx, cy, 10, cx, cy, H * .62);
      g.addColorStop(0, '#2a3763'); g.addColorStop(.5, '#151d37'); g.addColorStop(1, '#090e1b'); x.fillStyle = g;
    } else x.fillStyle = bg;
    x.fillRect(0, 0, W, H);
    x.strokeStyle = ink; x.fillStyle = ink; x.lineCap = 'round'; x.lineJoin = 'round';
    function circ(r, lw, yy) { x.lineWidth = lw; x.beginPath(); x.arc(cx, yy == null ? cy : yy, r, 0, Math.PI * 2); x.stroke(); }
    function dia(px, py, r) { x.beginPath(); x.moveTo(px, py - r); x.lineTo(px + r * .7, py); x.lineTo(px, py + r); x.lineTo(px - r * .7, py); x.closePath(); x.fill(); }
    function star(px, py, R, n, ir, rot) { x.beginPath(); for (var k = 0; k < n * 2; k++) { var rr = k % 2 ? R * ir : R, aa = rot + k * Math.PI / n; x[k ? 'lineTo' : 'moveTo'](px + Math.cos(aa) * rr, py + Math.sin(aa) * rr); } x.closePath(); }
    function ln(x1, y1, x2, y2, lw) { x.lineWidth = lw; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); }
    if (mode !== 'rough') { x.save(); x.globalAlpha = .13; x.lineWidth = 1; x.beginPath(); for (i = -H; i < W + H; i += 24) { x.moveTo(i, 0); x.lineTo(i + H, H); x.moveTo(i, H); x.lineTo(i + H, 0); } x.stroke(); x.restore(); }
    x.lineWidth = 6; x.strokeRect(16, 16, W - 32, H - 32);
    x.lineWidth = 1.6; x.strokeRect(32, 32, W - 64, H - 64);
    x.lineWidth = 1; x.strokeRect(40, 40, W - 80, H - 80);
    [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]].forEach(function (p) { circ.call(null, 0, 0); x.lineWidth = 1.4; x.beginPath(); x.arc(p[0], p[1], 20, 0, Math.PI * 2); x.stroke(); dia(p[0], p[1], 8); });
    dia(cx, 32, 9); dia(cx, H - 32, 9); dia(32, cy, 9); dia(W - 32, cy, 9);
    for (i = 0; i < 60; i++) { a = i / 60 * Math.PI * 2; x.beginPath(); x.arc(cx + Math.cos(a) * 184, cy + Math.sin(a) * 184, i % 5 ? 1.5 : 3.2, 0, Math.PI * 2); x.fill(); }
    circ(168, 2.4); circ(158, 1); circ(120, 1.2);
    for (i = 0; i < 96; i++) { a = i / 96 * Math.PI * 2; var r2 = i % 8 === 0 ? 158 : (i % 2 ? 132 : 142); ln(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, i % 8 === 0 ? 1.8 : .8); }
    x.lineWidth = 1.8; star(cx, cy, 108, 8, .45, -Math.PI / 2); x.stroke();
    x.lineWidth = 1; star(cx, cy, 108, 4, .2, -Math.PI / 4); x.stroke();
    circ(44, 1.4); circ(34, 1);
    x.beginPath(); x.arc(cx, cy, 16, 0, Math.PI * 2); x.fill();
    // crescent (top) & sun (bottom)
    var my = cy - 296; x.save(); x.beginPath(); x.arc(cx, my, 34, 0, Math.PI * 2); x.fill();
    x.fillStyle = mode === 'color' ? '#121a31' : bg; x.beginPath(); x.arc(cx + 14, my - 8, 30, 0, Math.PI * 2); x.fill(); x.restore();
    circ(48, 1, my);
    var sy = cy + 296; x.beginPath(); x.arc(cx, sy, 16, 0, Math.PI * 2); x.fill(); circ(48, 1, sy);
    for (i = 0; i < 16; i++) { a = i / 16 * Math.PI * 2; ln(cx + Math.cos(a) * 22, sy + Math.sin(a) * 22, cx + Math.cos(a) * (i % 2 ? 32 : 40), sy + Math.sin(a) * (i % 2 ? 32 : 40), 1.2); }
    ln(cx, cy - 192, cx, cy - 240, 1); ln(cx, cy + 192, cx, cy + 240, 1);
    [[cx - 150, cy - 300], [cx + 150, cy - 300], [cx - 150, cy + 300], [cx + 150, cy + 300], [cx - 168, cy], [cx + 168 + 0, cy]].forEach(function (p, k) { if (k > 3) return; star(p[0], p[1], 9, 4, .3, -Math.PI / 2); x.fill(); });
    return c;
  }
  function blobTex(THREE, inner, size) {
    var c = d.createElement('canvas'); c.width = c.height = size || 128; var x = c.getContext('2d'), s = c.width / 2;
    var g = x.createRadialGradient(s, s, 0, s, s, s); g.addColorStop(0, inner); g.addColorStop(.25, inner.replace(/[\d.]+\)$/, '.45)')); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.width);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function envTex(THREE) {
    var c = d.createElement('canvas'); c.width = 1024; c.height = 512; var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#2b3454'); g.addColorStop(.5, '#0e1322'); g.addColorStop(1, '#04060b');
    x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
    function b(px, py, r, col) { var gg = x.createRadialGradient(px, py, 0, px, py, r); gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(px - r, py - r, r * 2, r * 2); }
    b(230, 170, 190, 'rgba(255,212,150,1)'); b(780, 200, 230, 'rgba(150,118,175,.9)'); b(520, 90, 110, 'rgba(255,246,228,1)'); b(60, 260, 120, 'rgba(255,200,130,.7)');
    x.fillStyle = 'rgba(255,232,195,.85)'; x.fillRect(0, 238, 1024, 8);
    var t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  function buildScene(THREE, sec, host, st) {
    var mobile = w.innerWidth <= 768;
    var dpr = w.devicePixelRatio || 1;
    var renderer = new THREE.WebGLRenderer({ antialias: dpr < 1.5, alpha: true, powerPreference: 'high-performance', stencil: false });
    var maxDpr = mobile ? 1 : 1.25, curDpr = Math.min(dpr, maxDpr);
    renderer.setPixelRatio(curDpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
    host.appendChild(renderer.domElement);
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b16, 0.045);
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(envTex(THREE)).texture;
    var camera = new THREE.PerspectiveCamera(mobile ? 52 : 36, 1, 0.05, 120);

    scene.add(new THREE.AmbientLight(0x4a4f78, .35));
    var key = new THREE.PointLight(0xffd59a, 60, 30, 2); scene.add(key);
    var rim = new THREE.PointLight(0x9a7cc4, 45, 30, 2); rim.position.set(-5, 3, -3); scene.add(rim);
    var fill = new THREE.DirectionalLight(0xfff0dc, .5); fill.position.set(0, 2, 10); scene.add(fill);

    // card
    var cw = 1, ch = 12 / 7, cr = .065, shape = new THREE.Shape();
    shape.moveTo(-cw / 2 + cr, -ch / 2); shape.lineTo(cw / 2 - cr, -ch / 2); shape.quadraticCurveTo(cw / 2, -ch / 2, cw / 2, -ch / 2 + cr);
    shape.lineTo(cw / 2, ch / 2 - cr); shape.quadraticCurveTo(cw / 2, ch / 2, cw / 2 - cr, ch / 2); shape.lineTo(-cw / 2 + cr, ch / 2);
    shape.quadraticCurveTo(-cw / 2, ch / 2, -cw / 2, ch / 2 - cr); shape.lineTo(-cw / 2, -ch / 2 + cr); shape.quadraticCurveTo(-cw / 2, -ch / 2, -cw / 2 + cr, -ch / 2);
    var geo = new THREE.ExtrudeGeometry(shape, { depth: .014, bevelEnabled: true, bevelThickness: .006, bevelSize: .007, bevelSegments: 1, curveSegments: 4 });
    geo.center();
    var pos = geo.attributes.position, uv = geo.attributes.uv;
    for (var i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + cw / 2) / cw, (pos.getY(i) + ch / 2) / ch);
    uv.needsUpdate = true;
    var aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    function tex(mode, srgb) { var t = new THREE.CanvasTexture(cardCanvas(mode)); t.anisotropy = aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; }
    var faceMat = new THREE.MeshStandardMaterial({ map: tex('color', true), metalnessMap: tex('metal'), roughnessMap: tex('rough'), metalness: 1, roughness: 1, envMapIntensity: 1.4 });
    var goldMat = new THREE.MeshStandardMaterial({ color: 0xd8b46c, metalness: 1, roughness: .26, envMapIntensity: 1.6 });
    var N = mobile ? 10 : 13, cards = [], world = new THREE.Group(); scene.add(world);
    for (i = 0; i < N; i++) { var m = new THREE.Mesh(geo, [faceMat, goldMat]); world.add(m); cards.push(m); }

    // armillary rings
    var ringMat = new THREE.MeshStandardMaterial({ color: 0xd8b46c, metalness: 1, roughness: .3, transparent: true, opacity: .85 });
    var rings = [];
    [[3.1, .008], [3.45, .005], [2.75, .004]].forEach(function (r, k) { var mesh = new THREE.Mesh(new THREE.TorusGeometry(r[0], r[1], 4, 160), ringMat); mesh.rotation.set(Math.PI / 2 + k * .5, k * .7, 0); world.add(mesh); rings.push(mesh); });

    // glow + dust + bokeh
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobTex(THREE, 'rgba(255,214,150,1)', 256), color: 0xffd9a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 }));
    glow.scale.set(9, 9, 1); glow.position.set(0, 0, -2.5); scene.add(glow);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobTex(THREE, 'rgba(150,120,190,1)', 256), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .35 }));
    halo.scale.set(18, 12, 1); halo.position.set(-3, 2, -8); scene.add(halo);
    function pts(n, rMin, rMax, yr, size, op, col) {
      var g = new THREE.BufferGeometry(), arr = new Float32Array(n * 3);
      for (var k = 0; k < n; k++) { var a = Math.random() * Math.PI * 2, r = rMin + Math.pow(Math.random(), .7) * (rMax - rMin); arr[k * 3] = Math.cos(a) * r; arr[k * 3 + 1] = (Math.random() - .5) * yr; arr[k * 3 + 2] = Math.sin(a) * r; }
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      var p = new THREE.Points(g, new THREE.PointsMaterial({ size: size, map: blobTex(THREE, 'rgba(255,236,200,1)', 64), color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
      scene.add(p); return p;
    }
    var dust = pts(mobile ? 450 : 900, .4, 11, 14, .06, .85, 0xf0d39a);
    var bokeh = pts(mobile ? 12 : 24, 2, 9, 10, .5, .22, 0xe9c88a);

    var baseR = mobile ? 1.55 : 3.0, baseH = mobile ? .5 : .6, camZ0 = mobile ? 10 : 9.6;
    var mx = 0, my = 0, tmx = 0, tmy = 0, P = 0, start = performance.now(), visible = true, raf = 0, first = true;
    if (FINE && !mobile) sec.addEventListener('pointermove', function (e) { var r = sec.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width * 2 - 1; tmy = (e.clientY / w.innerHeight) * 2 - 1; });

    function size() { var wdt = host.clientWidth || 1, hgt = host.clientHeight || 1; renderer.setSize(wdt, hgt, false); camera.aspect = wdt / hgt; camera.updateProjectionMatrix(); }
    size(); if ('ResizeObserver' in w) new ResizeObserver(size).observe(host); else w.addEventListener('resize', size);

    var fpsT = 0, fpsN = 0, lastNow = 0;
    function frame(now) {
      var time = (now - start) / 1000, still = REDUCE;
      if (lastNow) { fpsT += now - lastNow; fpsN++; if (fpsN >= 40) { var avg = fpsT / fpsN; fpsT = 0; fpsN = 0; if (avg > 24 && curDpr > .75) { curDpr = Math.max(.75, curDpr - .25); renderer.setPixelRatio(curDpr); size(); } } }
      lastNow = now;
      P += (st.p - P) * (still ? 1 : .085);
      var e = eIO(P), spin = still ? .4 : time * .09 + e * 2.6;
      var R = lerp(baseR, baseR * 2.1, e), Hh = lerp(baseH, mobile ? 9 : 11, e), turns = lerp(1, 1.6, e);
      for (var k = 0; k < N; k++) {
        var t = k / N, th = t * Math.PI * 2 * turns + spin;
        var kk = still ? 1 : eOut(clamp01((time - .25 - t * 1.1) / 1.9));
        var fl = still ? 0 : Math.sin(time * .9 + k * 1.3) * .045;
        var c = cards[k];
        c.position.set(lerp(0, Math.sin(th) * R, kk), lerp((k - N / 2) * .012, (t - .5) * Hh + Math.sin(th * 2) * .32 * (1 - e), kk) + fl, lerp(.6, Math.cos(th) * R, kk));
        c.rotation.set(lerp(-.25, .1 * Math.sin(k * 1.7) - e * .3 * Math.sin(th), kk), lerp(0, th, kk), lerp(.05 * k / N, .14 * Math.sin(k * 2.3), kk));
      }
      world.rotation.x = lerp(.22, -.1, e); world.position.y = lerp(.35, 0, e);
      rings.forEach(function (r, k) { r.rotation.z = time * (.05 + k * .03) * (k % 2 ? -1 : 1); r.rotation.x = Math.PI / 2 + k * .5 + Math.sin(time * .2 + k) * .15; r.scale.setScalar(lerp(mobile ? .6 : 1.08, 2.4, e)); });
      ringMat.opacity = .85 * (1 - e * .85);
      mx += (tmx - mx) * .04; my += (tmy - my) * .04;
      var cz = lerp(camZ0, .9, e), cy = lerp(0, .7, e);
      camera.position.set(mx * .6, cy - my * .35, cz);
      camera.lookAt(mx * .15, cy * .3, cz - 8);
      key.position.set(Math.cos(time * .35) * 4.5, 2 + Math.sin(time * .27), Math.sin(time * .35) * 4.5 + 2);
      glow.material.opacity = (.42 + .1 * Math.sin(time * .8)) * (1 - e * .5);
      dust.rotation.y = time * .015 + e * .9; dust.position.z = e * 7.5; dust.position.y = -e * .8;
      bokeh.rotation.y = -time * .01 + e * .5; bokeh.position.z = e * 5;
      scene.fog.density = lerp(.045, .07, clamp01((P - .75) / .25));
      host.style.opacity = '';
      renderer.domElement.style.opacity = (1 - clamp01((P - .86) / .14) * .9).toFixed(3);
      renderer.render(scene, camera);
      if (first) { first = false; sec.classList.add('lucina-gl-on'); }
      raf = visible && !still ? requestAnimationFrame(frame) : 0;
    }
    raf = requestAnimationFrame(frame);
    if (HAS_IO) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !raf && !REDUCE) { lastNow = 0; raf = requestAnimationFrame(frame); } }).observe(sec);
    d.addEventListener('visibilitychange', function () { lastNow = 0; });
    if (REDUCE) w.addEventListener('resize', function () { requestAnimationFrame(frame); });
  }

  /* ---------- philosophy steps ---------- */
  function steps() {
    all('[data-lucina-steps]').forEach(function (list) {
      if (!once(list, 'st')) return;
      var items = all('[data-lucina-step]', list);
      if (!items.length || !HAS_IO) return;
      list.classList.add('lucina-steps--live');
      function set(i) {
        items.forEach(function (it, j) { it.classList.toggle('lucina-is-active', j === i); it.classList.toggle('lucina-is-done', j < i); });
        list.style.setProperty('--lucina-progress', Math.round(((i + 1) / items.length) * 100) + '%');
      }
      set(0);
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) set(items.indexOf(en.target)); });
      }, { rootMargin: '-42% 0px -42% 0px' });
      items.forEach(function (it) { io.observe(it); });
    });
  }

  /* ---------- gallery ---------- */
  function gallery() {
    all('[data-lucina-gallery]').forEach(function (g) {
      if (!once(g, 'gl')) return;
      var track = g.querySelector('[data-lucina-track]'), prev = g.querySelector('[data-lucina-prev]'), next = g.querySelector('[data-lucina-next]');
      if (!track) return;
      function go(dir) {
        var item = track.firstElementChild, gap = parseFloat(getComputedStyle(track).columnGap) || 20;
        track.scrollBy({ left: dir * ((item ? item.getBoundingClientRect().width : 300) + gap), behavior: REDUCE ? 'auto' : 'smooth' });
      }
      function upd() {
        if (prev) prev.disabled = track.scrollLeft < 4;
        if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      }
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });
      track.addEventListener('scroll', upd, { passive: true });
      w.addEventListener('resize', upd);
      upd();
    });
  }

  /* ---------- consultation modal ---------- */
  var OPTS = {
    course: ['취미반', '전문가반', '1:1 창업반', '원데이클래스', '아직 잘 모르겠어요'],
    experience: ['처음이에요', '조금 배워 봤어요', '배운 적이 있어요'],
    classType: ['개인수업', '예약제 소수정예 수업', '원데이클래스', '특강', '상담 후 결정']
  };
  var LABEL = { course: '관심 과정', experience: '타로 경험', classType: '희망 수업 방식' };
  var modal = null, lastFocus = null;

  function chips(name) {
    return '<fieldset class="lucina-field"><legend>' + LABEL[name] + '</legend><div class="lucina-chips">' +
      OPTS[name].map(function (o) {
        return '<label class="lucina-chip"><input type="radio" name="lucina-' + name + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>';
      }).join('') + '</div></fieldset>';
  }
  function buildModal() {
    var m = d.createElement('div');
    m.className = 'lucina-root lucina-modal';
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'lucina-modal-title');
    var url = C.consultationUrl;
    m.innerHTML =
      '<div class="lucina-modal__panel">' +
      '<button type="button" class="lucina-modal__close" data-lucina-close aria-label="상담 창 닫기"></button>' +
      '<div><h2 class="lucina-modal__title" id="lucina-modal-title">나에게 맞는 과정 상담하기</h2>' +
      '<p class="lucina-modal__desc">선택한 내용은 상담 메시지로 정리됩니다. 복사해서 상담 창에 붙여넣어 보내 주세요.</p></div>' +
      chips('course') + chips('experience') + chips('classType') +
      '<div class="lucina-field"><label class="lucina-field__label" for="lucina-memo">궁금한 점 (선택)</label>' +
      '<textarea class="lucina-textarea" id="lucina-memo" placeholder="예) 평일 저녁 수업이 가능한지 궁금해요"></textarea></div>' +
      '<div class="lucina-modal__guide"><b>상담에서 안내받는 내용</b><span>나에게 맞는 과정 추천 · 수업 방식과 일정 · 교육 비용 · 수강 신청 절차</span></div>' +
      '<div class="lucina-modal__actions">' +
      (url
        ? '<a class="lucina-btn lucina-btn--navy" data-lucina-go href="' + esc(url) + '" target="_blank" rel="noopener">내용 복사하고 ' + esc(C.consultationLabel) + '로 이동 <span class="lucina-arrow" aria-hidden="true"></span></a>'
        : '<p class="lucina-modal__warn"><b>상담 링크가 아직 설정되지 않았습니다.</b><br>관리자: <code>config.js</code>의 <code>consultationUrl</code>에 실제 상담 주소를 입력하면 이 자리에 상담 연결 버튼이 나타납니다.</p>') +
      '<button type="button" class="lucina-btn lucina-btn--line" data-lucina-copy>상담 내용만 복사하기</button>' +
      (C.info.phone ? '<a class="lucina-btn lucina-btn--line" href="tel:' + esc(C.info.phone.replace(/[^0-9+]/g, '')) + '">전화 문의 ' + esc(C.info.phone) + '</a>' : '') +
      '</div><p class="lucina-modal__status" aria-live="polite" data-lucina-status></p></div>';
    d.body.appendChild(m);

    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('[data-lucina-close]')) { closeModal(); return; }
      if (e.target.closest('[data-lucina-copy]')) { copy(summary(), '복사되었습니다. 상담 창에 붙여넣어 보내 주세요.'); return; }
      if (e.target.closest('[data-lucina-go]')) { copy(summary(), '상담 내용이 복사되었습니다. 새 창에서 붙여넣어 보내 주세요.'); }
    });
    m.addEventListener('change', updateLink);
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;
      var f = all('button, a[href], input, textarea', m).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    return m;
  }
  function val(name) { var el = modal.querySelector('input[name="lucina-' + name + '"]:checked'); return el ? el.value : ''; }
  function summary() {
    var lines = ['[루시나타로 수강 상담 문의]'];
    ['course', 'experience', 'classType'].forEach(function (k) { lines.push(LABEL[k] + ': ' + (val(k) || '미선택')); });
    var memo = (modal.querySelector('#lucina-memo').value || '').trim();
    if (memo) lines.push('궁금한 점: ' + memo);
    return lines.join('\n');
  }
  function updateLink() {
    var a = modal.querySelector('[data-lucina-go]');
    if (!a || !C.passQueryParams) return;
    try {
      var u = new URL(C.consultationUrl, w.location.href);
      ['course', 'experience', 'classType'].forEach(function (k) { var v = val(k); if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); });
      a.href = u.toString();
    } catch (e) {}
  }
  function copy(text, msg) {
    var status = modal.querySelector('[data-lucina-status]');
    function fallback() {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      modal.appendChild(ta); ta.select(); var ok = false; try { ok = d.execCommand('copy'); } catch (e) {} modal.removeChild(ta);
      status.textContent = ok ? msg : '자동 복사가 지원되지 않습니다. 선택한 내용을 직접 입력해 주세요.';
    }
    if (navigator.clipboard && w.isSecureContext) navigator.clipboard.writeText(text).then(function () { status.textContent = msg; }, fallback);
    else fallback();
  }
  function openModal(course) {
    if (!modal) modal = buildModal();
    lastFocus = d.activeElement;
    if (course) { var r = modal.querySelector('input[name="lucina-course"][value="' + course + '"]'); if (r) r.checked = true; }
    updateLink();
    modal.querySelector('[data-lucina-status]').textContent = '';
    modal.classList.add('lucina-is-open');
    d.documentElement.style.overflow = 'hidden';
    var f = modal.querySelector('input[name="lucina-course"]:checked') || modal.querySelector('input');
    setTimeout(function () { f && f.focus(); }, 30);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('lucina-is-open');
    d.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function bindConsult() {
    if (w.__lucinaConsultBound) return; w.__lucinaConsultBound = true;
    d.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-lucina-consult]');
      if (!t) return;
      e.preventDefault();
      openModal(t.getAttribute('data-lucina-course') || '');
    });
  }

  /* ---------- floating CTA ---------- */
  function floatCta() {
    if (!C.stickyCta || w.__lucinaFloat || !HAS_IO) return;
    var heroEl = d.querySelector('.lucina-hero');
    if (!heroEl) return;
    w.__lucinaFloat = true;
    var f = d.createElement('div');
    f.className = 'lucina-root lucina-float';
    f.innerHTML = '<a class="lucina-btn lucina-btn--gold" href="#lucina-cta" data-lucina-consult>나에게 맞는 과정 상담하기 <span class="lucina-arrow" aria-hidden="true"></span></a>';
    d.body.appendChild(f);
    var past = false, blocked = {};
    function upd() { var b = false; for (var k in blocked) if (blocked[k]) b = true; f.classList.toggle('lucina-is-on', past && !b); }
    new IntersectionObserver(function (ents) { ents.forEach(function (en) { past = !en.isIntersecting && en.boundingClientRect.top < 0; }); upd(); }).observe(heroEl);
    var io2 = new IntersectionObserver(function (ents) { ents.forEach(function (en) { blocked[en.target.id || 'x'] = en.isIntersecting; }); upd(); });
    all('#lucina-cta, #lucina-footer').forEach(function (el) { io2.observe(el); });
  }

  function refresh() {
    C = readConfig();
    safe('content', content); safe('reviews', reviews); safe('reveal', reveal); safe('hero', hero); safe('orbit', orbit); safe('cine', cine);
    safe('steps', steps); safe('gallery', gallery); safe('float', floatCta);
  }
  function boot() { refresh(); safe('consult', bindConsult); }

  w.LucinaTarot = { version: '1.0.0', refresh: refresh, openConsult: function (c) { C = readConfig(); openModal(c); } };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
  w.addEventListener('load', refresh);
})(window, document);
