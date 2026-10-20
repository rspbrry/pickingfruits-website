(function () {
  'use strict';

  var FEHLER_TEXT = 'Da ist etwas schiefgelaufen. Schreib mir gern direkt per WhatsApp.';
  var OK_TEXT = 'Danke für deine Anfrage. Ich melde mich innerhalb von 24 Stunden bei dir.';

  // --- Mobile-Navigation ---
  var burger = document.querySelector('.burger');
  var navLinks = document.getElementById('nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    // Nach Klick auf einen Link das Menü schließen
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Menü öffnen');
      });
    });
  }

  // --- Footer-Jahr ---
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Kontaktformulare (Hero und Kontaktbereich), Versand über Formspree ---
  document.querySelectorAll('form.contact-form').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    if (!msg) { return; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var button = form.querySelector('button[type="submit"]');
      var originalLabel = button ? button.textContent : '';

      function show(type, text) {
        msg.textContent = text;
        msg.className = 'form-msg show ' + type;
      }

      // Honeypot ausgefüllt: Bot. Still "Danke" zeigen, nichts senden.
      var trap = form.querySelector('input[name="_gotcha"]');
      if (trap && trap.value) {
        show('ok', OK_TEXT);
        form.reset();
        return;
      }

      // Betreff der Mail aus dem gewählten Thema bilden
      var topic = form.querySelector('select[name="topic"]');
      var subject = form.querySelector('input[name="subject"]');
      if (topic && subject && topic.selectedIndex > 0) {
        subject.value = 'Neue Anfrage: ' + topic.options[topic.selectedIndex].text;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Wird gesendet …';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          return res.json().catch(function () {
            return { ok: res.ok };
          });
        })
        .then(function (data) {
          if (data && data.ok) {
            show('ok', OK_TEXT);
            form.reset();
          } else {
            show('err', FEHLER_TEXT);
          }
        })
        .catch(function () {
          show('err', FEHLER_TEXT);
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.textContent = originalLabel;
          }
        });
    });
  });

  // --- Bewegung: Einblenden beim Scrollen, Wort-Reveal, Zahlen hochzählen ---
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Überschrift in Wörter zerlegen, jedes Wort steckt in einer Maske
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) { nodes.push(walker.currentNode); }
    var n = 0;
    nodes.forEach(function (node) {
      var parts = (node.textContent || '').split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (p === '') { return; }
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        var outer = document.createElement('span');
        outer.className = 'split-w';
        var inner = document.createElement('span');
        inner.className = 'split-wi';
        inner.style.setProperty('--wi', Math.min(n, 14));
        inner.textContent = p;
        outer.appendChild(inner);
        frag.appendChild(outer);
        n++;
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  // Zahl von 0 auf den Endwert hochzählen (weich auslaufend)
  function countUp(el) {
    if (reduceMotion) { return; }
    var end = parseFloat(el.getAttribute('data-count'));
    if (isNaN(end)) { return; }
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    // Breite festhalten, damit das Layout beim Zählen nicht springt
    var box = el.closest('.case-stats > div') || el;
    box.style.minWidth = box.getBoundingClientRect().width + 'px';
    el.textContent = pre + '0' + suf;
    var start = null;
    var dur = 1700;
    function step(ts) {
      if (start === null) { start = ts; }
      var t = Math.min((ts - start) / dur, 1);
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = pre + Math.round(end * eased) + suf;
      if (t < 1) { requestAnimationFrame(step); }
    }
    setTimeout(function () { requestAnimationFrame(step); }, 250);
  }

  function revealAll() {
    document.querySelectorAll('[data-reveal],[data-split]').forEach(function (el) {
      el.classList.add('is-in');
    });
  }

  try {
    // Gruppen: Kinder nacheinander einblenden
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        if (child.hasAttribute('data-split')) { return; }
        if (!child.hasAttribute('data-reveal')) { child.setAttribute('data-reveal', ''); }
        child.style.setProperty('--d', (Math.min(i, 6) * 0.09) + 's');
      });
    });

    document.querySelectorAll('[data-split]').forEach(splitWords);

    var targets = document.querySelectorAll('[data-reveal],[data-split]');

    if (!('IntersectionObserver' in window) || reduceMotion) {
      revealAll();
    } else {
      // Elemente mit Zuschnitt (clip) sind im Ausgangszustand unsichtbar, der Browser
      // würde sie nie als "im Bild" melden. Deshalb beobachten wir stattdessen ihren
      // Elternbereich und schalten das Element von dort aus frei.
      var watch = new Map();
      targets.forEach(function (el) {
        var node = (el.getAttribute('data-reveal') === 'clip' && el.parentElement) ? el.parentElement : el;
        watch.set(node, (watch.get(node) || []).concat(el));
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          var list = watch.get(entry.target) || [];
          io.unobserve(entry.target);
          list.forEach(function (el) {
            el.classList.add('is-in');
            el.querySelectorAll('[data-count]').forEach(countUp);
          });
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      watch.forEach(function (list, node) { io.observe(node); });
    }
  } catch (err) {
    // Sicherheitsnetz: Inhalte niemals versteckt lassen
    revealAll();
  }

  // --- Hero-Video: Klick auf den Button startet das Video (Ton an) ---
  var videoEl = document.getElementById('hero-video-el');
  var playBtn = document.querySelector('#hero-video .video-play');

  if (videoEl && playBtn) {
    // Steuerleiste erst nach dem Start zeigen (ohne JavaScript bleibt sie sichtbar)
    videoEl.removeAttribute('controls');

    var videoBox = document.getElementById('hero-video');
    if (videoBox) { videoBox.classList.add('is-idle'); }

    function startVideo() {
      videoEl.setAttribute('controls', '');
      videoEl.play().catch(function () { /* Browser blockiert: Nutzer startet über die Steuerung */ });
    }
    playBtn.addEventListener('click', startVideo);
    // Auch ein Klick auf das Vorschaubild startet das Video (solange die Steuerung noch aus ist)
    videoEl.addEventListener('click', function () {
      if (!playBtn.hidden) { startVideo(); }
    });
    videoEl.addEventListener('play', function () {
      playBtn.hidden = true;
      if (videoBox) { videoBox.classList.remove('is-idle'); }
    });
    videoEl.addEventListener('ended', function () {
      playBtn.hidden = false;
      if (videoBox) { videoBox.classList.add('is-idle'); }
    });
  }

  // --- Mobiler Schnellzugriff: erst zeigen, wenn der Hero aus dem Bild ist,
  //     und wieder ausblenden, sobald der Kontaktbereich sichtbar ist ---
  var sticky = document.getElementById('sticky-cta');
  var hero = document.getElementById('start');
  var contact = document.getElementById('kontakt');

  if (sticky && hero && contact && 'IntersectionObserver' in window) {
    var heroVisible = true;
    var contactVisible = false;

    var update = function () {
      sticky.classList.toggle('show', !heroVisible && !contactVisible);
    };

    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      update();
    }).observe(hero);

    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting;
      update();
    }, { rootMargin: '0px 0px -25% 0px' }).observe(contact);
  }
})();
