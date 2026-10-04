(function () {
  // ---------- Current page in navigation ----------
  var path = window.location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll(".site-nav a").forEach(function (link) {
    var href = link.getAttribute("href").replace(/\/+$/, "");
    if (path === href || path.indexOf(href + "/") === 0) {
      link.setAttribute("aria-current", "page");
    }
  });

  // ---------- Live Bergen clock ----------
  var clock = document.getElementById("clock");
  if (clock) {
    var fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Europe/Oslo"
    });
    var tick = function () { clock.textContent = fmt.format(new Date()) + " Bergen"; };
    tick();
    setInterval(tick, 1000);
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cameFromNav = root.classList.contains("arriving");

  // ---------- Content reveal ----------
  var main = document.querySelector("main");
  if (main) {
    var container = main.querySelector(".wrap") || main;
    var items = Array.prototype.slice.call(container.children).filter(function (el) {
      return el.tagName !== "DIALOG";
    });
    var arriving = root.classList.contains("arriving");
    items.forEach(function (el, i) {
      el.classList.add("rv");
      el.style.setProperty("--i", Math.min(i, 8));
      if (arriving) el.style.setProperty("--d", "550ms");
    });
  }
  requestAnimationFrame(function () { root.classList.add("ready"); });

  // ---------- Page transitions ----------
  if (root.classList.contains("arriving")) {
    try {
      sessionStorage.removeItem("ab-nav");
      sessionStorage.removeItem("ab-label");
    } catch (e) {}
    requestAnimationFrame(function () {
      root.classList.add("arrived");
      root.classList.remove("arriving");
    });
  }

  // The name shown on the curtain: a project's own title when the link has
  // one, otherwise the section it leads to.
  function pageLabel(link, path) {
    var title = link.querySelector("h2");
    if (title) return title.textContent.trim();
    var section = path.replace(/^\/+|\/+$/g, "").split("/")[0];
    var names = { "": "Home", projects: "Projects", about: "About", contact: "Contact" };
    return names[section] || "Albert";
  }

  if (!reducedMotion) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (url.pathname.replace(/\/+$/, "") === location.pathname.replace(/\/+$/, "")) return;
      e.preventDefault();
      var label = pageLabel(a, url.pathname);
      document.querySelector(".curtain-label").textContent = label;
      try {
        sessionStorage.setItem("ab-nav", "1");
        sessionStorage.setItem("ab-label", label);
      } catch (err) {}
      root.classList.remove("arrived");
      root.classList.add("leaving");
      setTimeout(function () { location.href = url.href; }, 800);
    });
  }

  // Coming back with the browser's back button can restore the page with the
  // curtain still closed, so reset it.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) root.classList.remove("leaving", "arriving");
  });

  // ---------- Portrait lightbox ----------
  document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
    var dialog = document.getElementById(btn.getAttribute("data-lightbox"));
    if (!dialog || !dialog.showModal) return;
    btn.addEventListener("click", function () { dialog.showModal(); });
    dialog.addEventListener("click", function () { dialog.close(); });
  });

  // ---------- Background: slow ocean swell ----------
  var canvas = document.getElementById("market");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Horizontal swell lines. Lower lines sit further apart and move more,
  // which gives a sense of looking out over the sea.
  var LINES = 18, ACCENT = 11;
  function draw(t, alpha) {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (var i = 0; i < LINES; i++) {
      var p = i / (LINES - 1);
      var y0 = h * (0.18 + 0.86 * Math.pow(p, 1.35));
      var amp = 2 + p * Math.min(18, h * 0.02);
      ctx.beginPath();
      for (var x = 0; x <= w + 6; x += 6) {
        var y = y0
          + amp * Math.sin(x * 0.006 + t * 1.3 + i * 0.6)
          + amp * 0.6 * Math.sin(x * 0.013 - t * 0.85 + i * 1.3);
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = i === ACCENT
        ? "rgba(143,176,212," + (0.4 * alpha) + ")"
        : "rgba(236,231,220," + ((0.05 + p * 0.08) * alpha) + ")";
      ctx.stroke();
    }
  }

  resize();
  if (reduced) {
    draw(0, 1);
    window.addEventListener("resize", function () { resize(); draw(0, 1); });
    return;
  }
  window.addEventListener("resize", resize);

  // About 30 fps is plenty for motion this slow, and it saves battery.
  var start = null, last = 0;
  function frame(now) {
    if (start === null) start = now;
    if (now - last > 33) {
      last = now;
      var s = (now - start) / 1000;
      // Wall-clock phase keeps the waves continuous from one page to the next.
      draw(Date.now() / 1000 % 3600, cameFromNav ? 1 : Math.min(1, s / 1.5));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
