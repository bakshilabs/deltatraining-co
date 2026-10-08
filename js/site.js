/* ==========================================================================
   Delta Training · page behaviour
   Hydrates icons, Bits and tickers (from js/ui.js), and drives the
   interactive parts: prototype screens, the learning model, the worlds,
   the sessions, the partnership wires, the nav and the progress bar.
   Content comes from the v2 engagement deck (deck-deltaops-v2: js/content.js and js/slides.js).
   ========================================================================== */
(function () {
  "use strict";

  var ui = window.DECK.ui;
  var icon = ui.icon;
  var esc = ui.esc;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Content (from the deck) ------------------------------------------------ */
  var MODEL = [
    { label: "Idea", icon: "bulb", shot: "build-lab", url: "AI Lab · Choose a build", role: "child", child: "The child starts with something they care about: space, sport, music or the planet.", ai: null },
    { label: "Prompt", icon: "chat", shot: "prompt-ladder", url: "Planet Builder · Prompt", role: "ai", child: "The child writes a prompt, one rung of the ladder at a time.", ai: "The AI builds what it understood and highlights everything it guessed." },
    { label: "Predict", icon: "eye", shot: "build-planet", url: "Planet Builder · Predict", role: "child", child: "The child predicts what will happen before running it.", ai: null },
    { label: "Test", icon: "flask", shot: "build-planet", url: "Planet Builder · Test", role: "both", child: "The child runs it and compares the result with the prediction. The numbers show cause and effect.", ai: "When asked, the AI runs a fair test and shows the evidence." },
    { label: "Decide", icon: "check", shot: "prompt-ladder", url: "Planet Builder · Next version", role: "child", child: "The child keeps it, changes it or undoes it, then writes the next version of the prompt.", ai: null },
    { label: "Explain", icon: "users", shot: "build-planet", url: "Planet Builder · Explain", role: "child", child: "The child explains what they asked for, what the AI guessed and how they know it works.", ai: null },
  ];
  var ROLE = {
    child: ["chip--child", "user", "Child decides"],
    ai: ["chip--ai", "wand", "AI responds"],
    both: ["chip--ai", "users", "Child, with AI"],
  };

  var BUILDS = [
    {
      id: "planet", name: "Planet Builder", interest: "Space", icon: "globe", science: "Gravity and forces", maths: "Halving and doubling", product: "Planet Passport", productNote: "for the planet they built", shot: "build-planet",
      versions: [
        { skill: "Say what you want", prompt: "Make a planet", guess: "Earth-like gravity", result: "The AI made a planet like Earth and highlighted everything it guessed." },
        { skill: "Add details", prompt: "Make a small red planet like Mars", result: "The planet is small and red like Mars, so the AI used Mars's gravity. The astronaut jumps 1.3 m." },
        { skill: "Add numbers", prompt: "Make gravity half of Earth's so my astronaut can jump twice as high", result: "First, predict: will half the gravity give twice the jump? The test shows the jump goes from 0.5 m to 1.0 m." },
      ],
    },
    {
      id: "kick", name: "Kick Lab", interest: "Sport", icon: "target", science: "Forces", maths: "Angles", product: "Free-Kick Challenge", productNote: "that friends can try", shot: "build-kick",
      versions: [
        { skill: "Say what you want", prompt: "Kick it over the wall into the goal", guess: "a 70° kick", result: "The ball lands short of the goal. A steeper kick does not always go further." },
        { skill: "Ask it to test and explain", prompt: "Test 30°, 45° and 60° at 90% power and show me a table", result: "Kicks at 30° and 60° land in the same place, and 45° goes furthest." },
        { skill: "Decide", prompt: "The child decides from the evidence", result: "They choose the angle and explain why it works." },
      ],
    },
    {
      id: "beat", name: "Beat Lab", interest: "Music", icon: "volume", science: "Sound and pitch", maths: "Fractions and beats per minute", product: "A named track", productNote: "with their own beat and melody", shot: "build-beat",
      versions: [
        { skill: "Say what you want", prompt: "Make a beat", guess: "the speed and the drums", result: "The AI made a beat, but it chose the speed and the drums itself." },
        { skill: "Add numbers", prompt: "Kick on beats 1 and 3, clap on 2 and 4, at 100 BPM", result: "The AI made exactly that beat, at 100 beats per minute." },
        { skill: "Add details", prompt: "Add a melody that goes up: C D E G", result: "Higher notes mean faster vibrations." },
      ],
    },
    {
      id: "power", name: "Power Town", interest: "Planet", icon: "sun", science: "Energy", maths: "Percentages and line graphs", product: "Town Energy Plan", productNote: "that keeps the lights on", shot: "build-power",
      versions: [
        { skill: "Say what you want", prompt: "Power my town with clean energy", guess: "solar panels only", result: "The town loses power at night because there is no sun." },
        { skill: "Set a goal and limits", prompt: "Use solar and wind, add a battery, and keep gas under 20% as a backup", result: "The lights stay on and carbon dioxide stays low." },
        { skill: "Explain", prompt: "The child explains the cause and effect", result: "Solar power alone failed at night. Wind and the battery kept the lights on." },
      ],
    },
  ];

  var SESSIONS = [
    { n: 1, title: "Say what you want", does: "Children open their build and write a first, simple prompt. The AI fills the gaps with guesses and highlights each one. The class talks about what the AI assumed, and why it had to guess.", ingredients: 1, guesses: 4, level: 0, prompt: "Make a planet", res: "4 AI guesses, highlighted in pink" },
    { n: 2, title: "Add details", does: "Children add details only they know, such as a size, a colour or a name. There is less left for the AI to guess, and the build starts to look like theirs.", ingredients: 2, guesses: 3, level: 1, prompt: "Make a small red planet like Mars", res: "Mars's gravity. The jump is 1.3 m" },
    { n: 3, title: "Add numbers", does: "Children put numbers into the prompt and predict the result before they test it. They change one number at a time and watch what happens.", ingredients: 3, guesses: 2, level: 1, prompt: "Make gravity half of Earth's so my astronaut can jump twice as high", res: "Gravity ÷ 2, jump × 2: 0.5 m → 1.0 m" },
    { n: 4, title: "Set a goal and limits", does: "Children tell the AI what success looks like and what it must avoid. Sometimes its suggestion is wrong, and they have to notice.", ingredients: 4, guesses: 1, level: 2, prompt: "…as high as possible, but my astronaut must land within 10 seconds", res: "Without the limit, gravity 0 and the astronaut floats away" },
    { n: 5, title: "Test and explain", does: "Children ask the AI to run a fair test and set the results side by side. They choose the option the evidence supports, then explain it in their own words.", ingredients: 5, guesses: 0, level: 2, prompt: "Test the same jump on Earth, Mars and the Moon", res: "0.5 m, 1.3 m and 3.0 m. A fair test" },
    { n: 6, title: "Finish, share and present", does: "Each child finishes their product and presents it to the class. They explain what they asked for, what the AI guessed and how they made each decision.", ingredients: 6, guesses: 0, level: 3, prompt: "Call my planet Zorb… keep the gravity the same… explain it", res: "6 of 6 ingredients. A Planet Passport to share" },
  ];
  var LEVELS = ["Passive AI user", "AI-assisted creator", "AI-aware creator", "Independent creator"];

  /* ---- Hydrate icons, Bits and tickers --------------------------------------------- */
  function hydrate(root) {
    $$("i[data-icon]", root).forEach(function (el) {
      el.outerHTML = icon(el.getAttribute("data-icon"));
    });
  }
  $$("[data-bit]").forEach(function (el) {
    var p = el.getAttribute("data-bit").split(":");
    if (p[2]) el.style.setProperty("--size", p[2] + "px");
    if (p[3]) el.style.setProperty("--rot", p[3] + "deg");
    el.innerHTML = ui.bitSvg(p[0], p[1] || "happy");
  });
  $$("[data-ticker]").forEach(function (el) {
    var items = el.getAttribute("data-ticker").split("|");
    var run = items.map(function (t) {
      return '<span class="ticker__item">' + esc(t) + icon("sparkle") + "</span>";
    }).join("");
    el.setAttribute("role", "marquee");
    el.setAttribute("aria-label", items.join(", "));
    el.innerHTML = '<div class="ticker__track" aria-hidden="true">' + run + run + run + run + "</div>";
  });
  hydrate(document);

  function swapImg(img, src) {
    if (img.getAttribute("src") === src) return;
    if (reduceMotion) { img.src = src; return; }
    img.style.opacity = "0";
    setTimeout(function () {
      img.src = src;
      img.onload = function () { img.style.opacity = "1"; };
    }, 180);
  }

  /* ---- 2 · Prototype screens -------------------------------------------------------- */
  var thumbs = $$("#thumbs .thumb");
  thumbs.forEach(function (b) {
    b.addEventListener("click", function () {
      thumbs.forEach(function (t) { t.setAttribute("aria-pressed", String(t === b)); });
      var img = $("#proto-shot");
      img.alt = b.getAttribute("data-alt");
      swapImg(img, "../assets/img/" + b.getAttribute("data-shot") + ".jpg");
      $("#proto-url").textContent = b.getAttribute("data-url");
    });
  });

  /* ---- 3 · The learning model --------------------------------------------------------- */
  var steps = $("#steps");
  steps.innerHTML = MODEL.map(function (m, k) {
    var r = ROLE[m.role];
    return (
      '<div class="step"><button class="step__btn" type="button" data-step="' + k + '" aria-pressed="false">' +
      '<span class="step__n">' + (k + 1) + "</span>" + icon(m.icon) + esc(m.label) + "</button>" +
      '<span class="chip ' + r[0] + '">' + icon(r[1]) + r[2] + "</span></div>"
    );
  }).join("");

  var V = BUILDS[0].versions;
  $("#versions").innerHTML =
    '<li class="vitem" data-vi="0"><span class="vitem__v">' + icon("bulb") + '</span><span class="vitem__p">Idea: I want my own planet</span></li>' +
    V.map(function (v, k) {
      return (
        '<li class="vitem" data-vi="' + (k + 1) + '"><span class="vitem__v">v' + (k + 1) + '</span><span class="vitem__p">“' + esc(v.prompt) + "”</span>" +
        (v.guess ? '<span class="vitem__x">' + icon("help") + "AI guessed: " + esc(v.guess) + "</span>" : "") +
        (k === 2 ? '<span class="vitem__x vitem__x--teal">' + icon("flask") + "Jump: 0.5 m → 1.0 m</span>" : "") +
        "</li>"
      );
    }).join("") +
    '<li class="vitem" data-vi="4"><span class="vitem__v">' + icon("chat") + '</span><span class="vitem__p">Explained: half the gravity gives twice the jump</span></li>';

  var stepNow = -1;
  function setStep(k) {
    if (k === stepNow) return;
    stepNow = k;
    var m = MODEL[k];
    $$("[data-step]", steps).forEach(function (b, i) {
      b.setAttribute("aria-pressed", String(i === k));
      b.classList.toggle("is-done", i < k);
    });
    steps.style.setProperty("--p", k / (MODEL.length - 1));
    var shown = [1, 2, 2, 2, 4, 5][k];
    $$("[data-vi]").forEach(function (li) {
      var n = parseInt(li.getAttribute("data-vi"), 10);
      li.classList.toggle("is-on", n < shown);
      li.classList.toggle("is-now", n === shown - 1);
    });
    swapImg($("#model-shot"), "../assets/img/" + m.shot + ".jpg");
    $("#model-url").textContent = m.url;
    $("#model-detail").innerHTML =
      '<p class="mdet__k">Step ' + (k + 1) + " of 6</p>" +
      '<h3 class="mdet__t">' + icon(m.icon) + esc(m.label) + "</h3>" +
      '<div class="mdet__row"><span class="who who--child">' + icon("user") + "The child</span><p>" + esc(m.child) + "</p></div>" +
      '<div class="mdet__row"><span class="who who--ai">' + icon("wand") + "The AI</span><p" + (m.ai ? "" : ' class="none"') + ">" + esc(m.ai || "The AI does nothing in this step. The child does it alone.") + "</p></div>";
  }
  steps.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]");
    if (b) { stopAuto(); setStep(parseInt(b.getAttribute("data-step"), 10)); }
  });
  setStep(0);

  // Step through the model once it is in view, until someone takes over.
  var autoTimer = null;
  function stopAuto() { clearInterval(autoTimer); autoTimer = null; }
  if (!reduceMotion && "IntersectionObserver" in window) {
    var seen = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && !seen) {
          seen = true;
          autoTimer = setInterval(function () {
            if (stepNow >= MODEL.length - 1) return stopAuto();
            setStep(stepNow + 1);
          }, 2600);
        }
      });
    }, { threshold: 0.45 }).observe($("#model"));
  }

  /* ---- 4 · Worlds ------------------------------------------------------------------------ */
  var wtabs = $("#worldtabs");
  wtabs.innerHTML = BUILDS.map(function (b, k) {
    return '<button role="tab" type="button" id="wt-' + b.id + '" aria-controls="world" aria-selected="' + (k === 0) + '" tabindex="' + (k === 0 ? 0 : -1) + '" data-w="' + k + '">' + icon(b.icon) + esc(b.interest) + "</button>";
  }).join("");
  function setWorld(k) {
    var b = BUILDS[k];
    $$("[data-w]", wtabs).forEach(function (t, i) {
      t.setAttribute("aria-selected", String(i === k));
      t.tabIndex = i === k ? 0 : -1;
    });
    var world = $("#world");
    world.setAttribute("aria-labelledby", "wt-" + b.id);
    world.innerHTML =
      '<div class="browser"><div class="browser__bar"><i></i><i></i><i></i><span class="browser__url">' + icon("globe") + esc(b.name) + "</span></div>" +
      '<div class="browser__shot"><img src="../assets/img/' + b.shot + '.jpg" width="1600" height="1000" alt="' + esc(b.name) + ', in the AI Lab prototype." /></div></div>' +
      '<div class="card world__info"><span class="tag tag--built">' + icon(b.icon) + esc(b.interest) + "</span>" +
      "<h3>" + esc(b.name) + "</h3>" +
      '<dl class="world__facts"><div><dt>Science</dt><dd>' + esc(b.science) + "</dd></div><div><dt>Maths</dt><dd>" + esc(b.maths) + '</dd></div><div class="wide"><dt>Session 6 product</dt><dd>' + esc(b.product) + " " + esc(b.productNote) + "</dd></div></dl>" +
      '<ul class="vlist">' + b.versions.map(function (v) {
        return (
          '<li><span class="skill">' + esc(v.skill) + '</span><br /><span class="prompt">“' + esc(v.prompt) + "”</span><br />" +
          (v.guess ? '<span class="mini mini--guess">' + icon("help") + esc(v.guess) + " <small>AI guessed</small></span><br />" : "") +
          '<span class="res">' + esc(v.result) + "</span></li>"
        );
      }).join("") + "</ul></div>";
  }
  wtabs.addEventListener("click", function (e) {
    var t = e.target.closest("[data-w]");
    if (t) setWorld(parseInt(t.getAttribute("data-w"), 10));
  });
  wtabs.addEventListener("keydown", function (e) {
    var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    var cur = $$("[data-w]", wtabs).findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
    var next = (cur + d + BUILDS.length) % BUILDS.length;
    setWorld(next);
    $$("[data-w]", wtabs)[next].focus();
  });
  setWorld(0);

  /* ---- 5 · Sessions ---------------------------------------------------------------------- */
  var stabs = $("#stabs");
  stabs.innerHTML = SESSIONS.map(function (s, k) {
    return (
      '<button class="stab" role="tab" type="button" aria-selected="' + (k === 0) + '" tabindex="' + (k === 0 ? 0 : -1) + '" data-s="' + k + '"><b>S' + s.n + "</b><span>" + esc(s.title) + "</span>" +
      (s.n === 6 ? icon("star", "star") : "") + "</button>"
    );
  }).join("");
  $("#ladder").innerHTML =
    SESSIONS.map(function (s) { return '<div class="rung" data-r="' + s.n + '"><b>S' + s.n + "</b>" + esc(s.title) + "</div>"; }).join("") +
    '<p class="ladder__title">The prompt ladder</p>';
  $("#meter").innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i>";

  function setSession(k) {
    var s = SESSIONS[k];
    $$("[data-s]", stabs).forEach(function (t, i) {
      t.setAttribute("aria-selected", String(i === k));
      t.tabIndex = i === k ? 0 : -1;
    });
    $$(".rung").forEach(function (r, i) {
      r.classList.toggle("is-on", i < k);
      r.classList.toggle("is-now", i === k);
    });
    $("#sess-main").innerHTML =
      '<p class="mdet__k">Session ' + s.n + " of 6 · one hour</p>" +
      "<h3>" + esc(s.title) + "</h3>" +
      '<p class="does">' + esc(s.does) + "</p>" +
      '<p class="minilabel">In Planet Builder</p>' +
      '<p class="sess__prompt">“' + esc(s.prompt) + "”</p>" +
      '<p class="sess__res">' + icon("flask") + esc(s.res) + "</p>";
    $$("#meter i").forEach(function (m, i) {
      m.classList.toggle("on", i < s.ingredients);
      m.classList.toggle("full", s.ingredients === 6);
    });
    $("#meter-t").textContent = s.ingredients + (s.ingredients === 1 ? " ingredient" : " ingredients");
    $("#guesses").innerHTML = s.guesses
      ? new Array(s.guesses + 1).join("<i>" + icon("question") + "</i>")
      : '<span class="none">' + icon("check") + "Nothing left to guess</span>";
    $("#guesses-t").textContent = s.guesses + (s.guesses === 1 ? " guess" : " guesses");
    $("#levels").innerHTML = LEVELS.map(function (l, i) {
      return '<li class="' + (i === s.level ? "is-now" : "") + '">' + esc(l) + "</li>";
    }).join("");
  }
  stabs.addEventListener("click", function (e) {
    var t = e.target.closest("[data-s]");
    if (t) setSession(parseInt(t.getAttribute("data-s"), 10));
  });
  stabs.addEventListener("keydown", function (e) {
    var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    var cur = $$("[data-s]", stabs).findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
    var next = (cur + d + SESSIONS.length) % SESSIONS.length;
    setSession(next);
    $$("[data-s]", stabs)[next].focus();
  });
  setSession(0);

  /* ---- 8 · Partnership wires: each pill to the hub --------------------------------------- */
  var withEl = $("#with");
  var wires = $("#wires");
  function drawWires() {
    if (getComputedStyle(wires).display === "none") return;
    var box = withEl.getBoundingClientRect();
    var hub = $(".with__hub", withEl).getBoundingClientRect();
    var cx = hub.left + hub.width / 2 - box.left;
    var cy = hub.top + hub.height / 2 - box.top;
    var r = hub.width / 2;
    wires.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    var d = "";
    $$(".with__col--you .pill", withEl).forEach(function (p) {
      var b = p.getBoundingClientRect();
      var x = b.right - box.left + 8, y = b.top + b.height / 2 - box.top;
      var ex = cx - r * 0.92, ey = cy + (y - cy) * 0.25;
      d += "M" + x + " " + y + " C " + (x + 50) + " " + y + ", " + (ex - 60) + " " + ey + ", " + ex + " " + ey;
    });
    $$(".with__col--we .pill", withEl).forEach(function (p) {
      var b = p.getBoundingClientRect();
      var x = b.left - box.left - 8, y = b.top + b.height / 2 - box.top;
      var ex = cx + r * 0.92, ey = cy + (y - cy) * 0.25;
      d += "M" + x + " " + y + " C " + (x - 50) + " " + y + ", " + (ex + 60) + " " + ey + ", " + ex + " " + ey;
    });
    wires.innerHTML = '<path d="' + d + '" />';
  }
  drawWires();
  window.addEventListener("resize", drawWires);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWires);

  /* ---- Count-up stats --------------------------------------------------------------------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion) return;
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 900);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = "0";
    requestAnimationFrame(tick);
  }

  /* ---- Reveal on scroll -------------------------------------------------------------------- */
  var revealed = $$("[data-a]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealed.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        $$("[data-count]", en.target).forEach(countUp);
        if (en.target.matches("[data-count]")) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealed.forEach(function (el) { io.observe(el); });
  }

  /* ---- Top bar, menu, section nav and progress ----------------------------------------------- */
  var topbar = $("#topbar");
  var menu = $("#menu");
  var menubtn = $("#menubtn");
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    menubtn.setAttribute("aria-expanded", String(open));
    menubtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menubtn.innerHTML = icon(open ? "close" : "grid");
  }
  menubtn.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  var secs = $$("[data-sec]");
  var bar = $("#progress");
  bar.innerHTML = secs.map(function () { return "<i></i>"; }).join("");
  var segs = $$("i", bar);
  var navLinks = $$(".stagenav a");

  function onScroll() {
    var y = window.scrollY;
    topbar.classList.toggle("is-scrolled", y > 20);
    var mid = y + window.innerHeight * 0.4;
    var current = null;
    secs.forEach(function (s, i) {
      var top = s.offsetTop, h = s.offsetHeight || 1;
      var p = Math.max(0, Math.min(1, (y + window.innerHeight - top) / h));
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 4) p = 1;
      segs[i].style.setProperty("--p", p);
      if (mid >= top && mid < top + h) current = s.id;
    });
    var passed = true;
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + current;
      if (on) passed = false;
      a.setAttribute("aria-current", String(on));
      a.classList.toggle("is-past", passed && !!current && !on);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  $("#year").textContent = new Date().getFullYear();
})();
