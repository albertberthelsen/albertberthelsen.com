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
          + amp * Math.sin(x * 0.006 + t * 0.35 + i * 0.6)
          + amp * 0.6 * Math.sin(x * 0.013 - t * 0.22 + i * 1.3);
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
      draw(s, Math.min(1, s / 1.5));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
