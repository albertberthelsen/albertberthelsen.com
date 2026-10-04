(function () {
  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Live Bergen clock ----------
  var clockFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Europe/Oslo"
  });
  function tick() {
    var clock = document.getElementById("clock");
    if (clock) clock.textContent = clockFmt.format(new Date()) + " Bergen";
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Per-page setup (runs on load and after every page swap) ----------
  function initPage(fromNav) {
    // Current page in navigation
    var path = location.pathname.replace(/\/+$/, "") || "/";
    document.querySelectorAll(".site-nav a").forEach(function (link) {
      var href = link.getAttribute("href").replace(/\/+$/, "");
      if (path === href || path.indexOf(href + "/") === 0) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // Content rises into place, one element after another
    var main = document.querySelector("main");
    if (main) {
      var container = main.querySelector(".wrap") || main;
      Array.prototype.forEach.call(container.children, function (el, i) {
        if (el.tagName === "DIALOG") return;
        el.classList.add("rv");
        el.style.setProperty("--i", Math.min(i, 8));
        if (fromNav) el.style.setProperty("--d", "180ms");
      });
    }

    // Portrait lightbox
    document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
      var dialog = document.getElementById(btn.getAttribute("data-lightbox"));
      if (!dialog || !dialog.showModal) return;
      btn.addEventListener("click", function () { dialog.showModal(); });
      dialog.addEventListener("click", function () { dialog.close(); });
    });

    startWaves(document.getElementById("market"), !fromNav);
  }

  // ---------- Background: ocean swell (home page only) ----------
  var waves = null;

  function startWaves(canvas, fadeIn) {
    if (waves) { waves.stop(); waves = null; }
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var w, h, raf, start = null, last = 0;
    var LINES = 18, ACCENT = 11;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Lower lines sit further apart and move more, like looking out over the sea.
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

    function frame(now) {
      if (start === null) start = now;
      // About 30 fps is plenty for motion this slow, and it saves battery.
      if (now - last > 33) {
        last = now;
        var s = (now - start) / 1000;
        draw(now / 1000, fadeIn ? Math.min(1, s / 1.5) : 1);
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    if (reducedMotion) draw(0, 1);
    else raf = requestAnimationFrame(frame);

    waves = {
      stop: function () {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
      }
    };
  }

  // ---------- Page transitions ----------
  // Pages are fetched and swapped in place instead of reloaded, so the
  // curtain moves without the browser tearing the page down in between.
  var cache = {};
  var busy = false;
  var label = document.querySelector(".curtain-label");

  function load(path) {
    if (!cache[path]) {
      cache[path] = fetch(path, { credentials: "same-origin" }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      });
      cache[path].catch(function () { delete cache[path]; });
    }
    return cache[path];
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function nextFrames(n) {
    return new Promise(function (r) {
      (function step() { if (n-- <= 0) r(); else requestAnimationFrame(step); })();
    });
  }

  // The main sections get their name on the curtain. Everything else gets a
  // plain, quicker curtain.
  function pageLabel(path) {
    var names = { "/projects": "Projects", "/about": "About", "/contact": "Contact" };
    return names[path.replace(/\/+$/, "")] || "";
  }

  function swap(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    document.title = doc.title;
    var desc = doc.querySelector('meta[name="description"]');
    var ourDesc = document.querySelector('meta[name="description"]');
    if (desc && ourDesc) ourDesc.setAttribute("content", desc.getAttribute("content"));

    var curtain = document.querySelector(".curtain");
    Array.prototype.slice.call(document.body.children).forEach(function (el) {
      if (el !== curtain && el.tagName !== "SCRIPT") el.remove();
    });
    Array.prototype.slice.call(doc.body.children).forEach(function (el) {
      if (el.classList.contains("curtain") || el.tagName === "SCRIPT") return;
      document.body.insertBefore(document.adoptNode(el), curtain);
    });
  }

  function go(url, text, push) {
    if (busy) return;
    busy = true;
    label.textContent = text;
    root.classList.remove("arrived");
    root.classList.add("leaving");

    // With a name on the curtain, hold it long enough to be read.
    var hold = reducedMotion ? 0 : text ? 750 : 380;
    Promise.all([load(url.pathname), wait(hold)])
      .then(function (res) {
        swap(res[0]);
        if (push) history.pushState({}, "", url.href);
        window.scrollTo(0, 0);
        initPage(true);
        // Let the browser finish laying out the new page before the curtain
        // starts moving, so the first frames of the reveal are smooth.
        return nextFrames(2);
      })
      .then(function () {
        root.classList.remove("leaving");
        root.classList.add("arrived");
        return wait(600);
      })
      .then(function () {
        root.classList.remove("arrived");
        busy = false;
      })
      .catch(function () {
        location.href = url.href;
      });
  }

  function internalLink(e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || a.target || a.hasAttribute("download")) return null;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return null;
    return { a: a, url: url };
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var hit = internalLink(e);
    if (!hit) return;
    e.preventDefault();
    var here = location.pathname.replace(/\/+$/, "");
    if (hit.url.pathname.replace(/\/+$/, "") === here) return;
    go(hit.url, pageLabel(hit.url.pathname), true);
  });

  // Start fetching the next page as soon as a link is hovered or touched.
  function prefetch(e) {
    var hit = internalLink(e);
    if (hit) load(hit.url.pathname);
  }
  document.addEventListener("mouseover", prefetch);
  document.addEventListener("touchstart", prefetch, { passive: true });

  window.addEventListener("popstate", function () {
    var url = new URL(location.href);
    go(url, pageLabel(url.pathname), false);
  });

  initPage(false);
  requestAnimationFrame(function () { root.classList.add("ready"); });
})();
