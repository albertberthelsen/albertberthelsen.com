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

  // ---------- Background: slowly drifting contour lines ----------
  var canvas = document.getElementById("market");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Two "mountains": one top right, one rising from the bottom left.
  var peaks = [
    { x: 0.8, y: 0.25, rings: 16, seed: 0 },
    { x: 0.1, y: 1.05, rings: 14, seed: 2.1 }
  ];

  var w, h, dpr, step;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    step = Math.max(22, Math.min(w, h) * 0.045);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(t, alpha) {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    peaks.forEach(function (pk) {
      var cx = pk.x * w, cy = pk.y * h;
      for (var i = 1; i <= pk.rings; i++) {
        ctx.beginPath();
        for (var a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
          var r = i * step
            + step * 0.35 * Math.sin(3 * a + t * 0.15 + i * 0.45 + pk.seed)
            + step * 0.25 * Math.sin(5 * a - t * 0.1 + i * 0.8 + pk.seed);
          var x = cx + Math.cos(a) * r * 1.35, y = cy + Math.sin(a) * r;
          a ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        // Every fifth line is an "index contour" in the accent colour.
        ctx.strokeStyle = i % 5 === 0
          ? "rgba(143,176,212," + (0.22 * alpha) + ")"
          : "rgba(236,231,220," + (0.06 * alpha) + ")";
        ctx.stroke();
      }
    });
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
