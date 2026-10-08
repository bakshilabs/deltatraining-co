/* Delta Learning · kids-style version.
   Content: icons, the six lesson steps (wording from the v2 engagement deck)
   and the example-app screen switcher.
   Motion: split-word headings with a drawn underline, staggered reveals, the
   hero entrance and parallax, scroll progress, the timeline fill, counters,
   pointer-tracked card light and project tilt. Everything degrades to static
   content without JS or with reduced motion. */
(function () {
  "use strict";

  var ui = window.DECK.ui;
  var esc = ui.esc;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- Lesson steps --------------------------------------------------------- */
  var STEPS = [
    { label: "Idea", role: "Child decides", child: "The child starts with something they care about: space, sport, music or the planet.", ai: null },
    { label: "Prompt", role: "AI responds", child: "The child writes a prompt, one rung of the ladder at a time.", ai: "The AI builds what it understood and highlights everything it guessed." },
    { label: "Predict", role: "Child decides", child: "The child predicts what will happen before running it.", ai: null },
    { label: "Test", role: "Child, with AI", child: "The child runs it and compares the result with the prediction. The numbers show cause and effect.", ai: "When asked, the AI runs a fair test and shows the evidence." },
    { label: "Decide", role: "Child decides", child: "The child keeps it, changes it or undoes it, then writes the next version of the prompt.", ai: null },
    { label: "Explain", role: "Child decides", child: "The child explains what they asked for, what the AI guessed and how they know it works.", ai: null },
  ];
  var NODE = '<svg class="node" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4 29 27H3Z" fill="#8ccbe6"/><path d="M16 11 23.5 24h-15Z" fill="#0f2a3a"/></svg>';

  $("#steps").innerHTML = STEPS.map(function (s, k) {
    return (
      '<details class="tl"' + (k === 0 ? " open" : "") + ">" + NODE +
      '<summary><span class="when">Step ' + (k + 1) + "<b>" + esc(s.role) + '</b></span><span class="what">' + esc(s.label) + '</span><span class="plus">+</span></summary>' +
      "<ul><li><b>The child</b>" + esc(s.child) + "</li>" +
      (s.ai
        ? '<li class="ai"><b>The AI</b>' + esc(s.ai) + "</li>"
        : '<li class="ai none"><b>The AI</b>The AI does nothing in this step. The child does it alone.</li>') +
      "</ul></details>"
    );
  }).join("");

  // Icons from the shared kit (js/ui.js); the CSS sets the lighter kids-site stroke.
  $$("i[data-icon]").forEach(function (el) {
    el.outerHTML = ui.icon(el.getAttribute("data-icon"));
  });

  /* ---- Example app: switch the screenshot ---------------------------------- */
  var shot = $("#app-shot");
  var thumbs = $$(".thumbs button");
  thumbs.forEach(function (b) {
    b.addEventListener("click", function () {
      thumbs.forEach(function (t) { t.setAttribute("aria-pressed", String(t === b)); });
      shot.style.opacity = "0";
      setTimeout(function () {
        shot.src = "assets/img/" + b.getAttribute("data-shot") + ".jpg";
        shot.alt = b.getAttribute("data-alt");
        shot.onload = function () { shot.style.opacity = "1"; };
      }, 150);
    });
  });

  $("#year").textContent = new Date().getFullYear();

  /* ==========================================================================
     Motion
     ========================================================================== */

  /* Split headings into words; the emphasised word gets a drawn underline. */
  var SWASH = '<svg class="swash" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 7 C 22 2, 48 2, 70 5 S 92 8, 98 3"/></svg>';
  function splitWords(el) {
    var n = 0;
    function wrapText(node) {
      var parts = node.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var w = document.createElement("span");
        w.className = "w";
        var inner = document.createElement("span");
        inner.textContent = p;
        inner.style.setProperty("--i", n++);
        w.appendChild(inner);
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) wrapText(node);
      else if (node.nodeType === 1) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) { if (c.nodeType === 3) wrapText(c); });
        if (node.tagName === "EM") node.insertAdjacentHTML("beforeend", SWASH);
      }
    });
    el.style.setProperty("--n", n);
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    el.classList.add("split");
  }
  $$("h1, .sec-head h2, .cta h2").forEach(splitWords);

  /* Tag elements for staggered reveals. [selector, type, stagger within parent] */
  var REVEALS = [
    [".badges .badge", "pop", true],
    [".ticket", "", false],
    [".nights-list li:not(.nl-head)", "right", true],
    [".sec-head > p:not(.label)", "", false],
    [".services .svc", "", true],
    [".projects .proj", "", true],
    [".facts .fact", "pop", true],
    [".research .rq", "", true],
    [".tiers .tier", "", true],
    [".team .person", "", true],
    [".incl-wrap > *", "", true],
    [".bring > *", "", true],
    [".faq-grid details", "", true],
    [".ip-grid .ip", "", true],
    [".ip-foot", "", false],
    [".steps3 li", "pop", true],
    [".safety-top .photo, .photo-split .photo, .banner", "photo", false],
    [".thumbs", "", false],
    [".dip .note", "", false],
    [".loop-note", "", false],
    [".timeline .tl", "left", true],
  ];
  REVEALS.forEach(function (r) {
    $$(r[0]).forEach(function (el) {
      el.setAttribute("data-r", r[1]);
      if (r[2]) {
        var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (c) { return c.matches(r[0]); });
        el.style.setProperty("--i", sibs.indexOf(el) % 8);
      }
    });
  });
  $$(".stop").forEach(function (el, i) {
    el.style.setProperty("--i", i);
    $(".pin", el).style.setProperty("--i", i);
  });

  /* Count numbers up when they appear. */
  function countUp(el) {
    var to = parseInt(el.getAttribute("data-to"), 10);
    if (reduce || !to) return;
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = "0";
    requestAnimationFrame(tick);
  }
  $$(".fact b").forEach(function (b) { b.setAttribute("data-to", b.textContent.trim()); });

  var observed = $$(".split, [data-r], .map, .stop, .dip-art, .tl");
  if (reduce || !("IntersectionObserver" in window)) {
    observed.forEach(function (el) { el.classList.add("is-in"); });
    $(".hero-photo").classList.add("is-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("is-in");
        if (el.matches(".fact")) $$("b", el).forEach(countUp);
        if (el.matches(".tl")) el.classList.add("is-lit");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    observed.forEach(function (el) { io.observe(el); });
    // Hero plays on load, after the first paint.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $(".hero-photo").classList.add("is-in");
        $$(".hero .split").forEach(function (h) { h.classList.add("is-in"); });
      });
    });
  }

  /* Scroll-linked: progress bar, nav shadow, hero and banner parallax, timeline fill. */
  var nav = $("nav.top");
  var heroPhoto = $(".hero-photo");
  var banner = $(".banner img");
  var timeline = $(".timeline");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    nav.style.setProperty("--sp", max > 0 ? (y / max).toFixed(4) : 0);
    nav.classList.toggle("is-scrolled", y > 8);
    if (reduce) return;
    if (y < vh * 1.2) heroPhoto.style.setProperty("--py", (y * 0.18).toFixed(1) + "px");
    if (banner) {
      var br = banner.getBoundingClientRect();
      if (br.bottom > 0 && br.top < vh) {
        var p = (br.top + br.height / 2 - vh / 2) / vh;
        banner.style.setProperty("--by", (p * -40).toFixed(1) + "px");
      }
    }
    var tr = timeline.getBoundingClientRect();
    var tp = Math.max(0, Math.min(1, (vh * 0.65 - tr.top) / tr.height));
    timeline.style.setProperty("--tp", tp.toFixed(3));
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* Pointer: card light follows the cursor; project cards tilt in 3D. */
  if (finePointer && !reduce) {
    $$(".svc, .rq, .ip, .person").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
    $$(".proj").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }
})();
