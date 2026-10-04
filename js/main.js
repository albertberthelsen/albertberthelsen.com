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

  // ---------- Background: faint price lines ----------
  var canvas = document.getElementById("market");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Seeded random so the chart looks the same on every visit.
  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  function series(seed, n, drift, vol) {
    var r = rng(seed), y = 0, out = [];
    for (var i = 0; i < n; i++) {
      y += drift + (r() - 0.5) * vol;
      out.push(y);
    }
    var min = Math.min.apply(null, out), max = Math.max.apply(null, out);
    return out.map(function (v) { return (v - min) / (max - min || 1); });
  }

  var lines = [
    { data: series(7, 140, 0.03, 0.8), color: "rgba(143,176,212,0.28)", band: [0.25, 0.75], width: 1.2 },
    { data: series(42, 140, 0.01, 1.0), color: "rgba(236,231,220,0.10)", band: [0.15, 0.9], width: 1 },
    { data: series(1337, 140, -0.004, 0.8), color: "rgba(236,231,220,0.07)", band: [0.35, 0.95], width: 1 }
  ];

  var w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(progress) {
    ctx.clearRect(0, 0, w, h);

    // Horizontal grid
    ctx.strokeStyle = "rgba(236,231,220,0.035)";
    ctx.lineWidth = 1;
    for (var g = 1; g < 6; g++) {
      var gy = Math.round((h / 6) * g) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }

    lines.forEach(function (l) {
      var n = Math.max(2, Math.floor(l.data.length * progress));
      var top = h * (1 - l.band[1]), span = h * (l.band[1] - l.band[0]);
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var x = (i / (l.data.length - 1)) * w;
        var y = top + (1 - l.data[i]) * span;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.width;
      ctx.stroke();
    });

    // Marker at the head of the accent line
    var a = lines[0], ai = Math.max(1, Math.floor(a.data.length * progress)) - 1;
    var ax = (ai / (a.data.length - 1)) * w;
    var ay = h * (1 - a.band[1]) + (1 - a.data[ai]) * h * (a.band[1] - a.band[0]);
    ctx.fillStyle = "rgba(143,176,212,0.8)";
    ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  resize();
  window.addEventListener("resize", function () { resize(); draw(1); });

  if (reduced) { draw(1); return; }
  var start = null, duration = 2600;
  function frame(t) {
    if (start === null) start = t;
    var p = Math.min(1, (t - start) / duration);
    draw(1 - Math.pow(1 - p, 3));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
