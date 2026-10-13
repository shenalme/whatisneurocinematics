// Inter-subject correlation simulator.
// Each simulated viewer's signal = shared "film-driven" component * w + private noise * (1 - w).
// We report mean pairwise Pearson r and leave-one-out ISC (each viewer vs. the mean of the others).
(function () {
  var canvas = document.getElementById('isc-plot');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var shared = document.getElementById('shared');
  var viewers = document.getElementById('viewers');
  var sharedOut = document.getElementById('shared-out');
  var viewersOut = document.getElementById('viewers-out');
  var outPair = document.getElementById('isc-pair');
  var outLoo = document.getElementById('isc-loo');
  var outRead = document.getElementById('isc-read');
  var T = 240;
  var seed = 7;

  function rand() { // small deterministic PRNG so "New viewers" is reproducible per click
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  function gauss() {
    var u = Math.max(rand(), 1e-9), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function smooth(arr, k) {
    var out = new Array(arr.length);
    for (var i = 0; i < arr.length; i++) {
      var s = 0, n = 0;
      for (var j = -k; j <= k; j++) { var t = i + j; if (t >= 0 && t < arr.length) { s += arr[t]; n++; } }
      out[i] = s / n;
    }
    return out;
  }
  function zscore(a) {
    var m = a.reduce(function (p, c) { return p + c; }, 0) / a.length;
    var sd = Math.sqrt(a.reduce(function (p, c) { return p + (c - m) * (c - m); }, 0) / a.length) || 1;
    return a.map(function (x) { return (x - m) / sd; });
  }
  function pearson(a, b) {
    var za = zscore(a), zb = zscore(b), s = 0;
    for (var i = 0; i < za.length; i++) s += za[i] * zb[i];
    return s / za.length;
  }

  var film, noises;
  function makeSignals(n) {
    film = zscore(smooth(Array.from({ length: T }, gauss), 6));
    noises = [];
    for (var v = 0; v < n; v++) noises.push(zscore(smooth(Array.from({ length: T }, gauss), 6)));
  }

  function colours() {
    var cs = getComputedStyle(document.documentElement);
    return { accent: cs.getPropertyValue('--accent').trim() || '#503aa8', line: cs.getPropertyValue('--line').trim() || '#e4e2dc', ink: cs.getPropertyValue('--ink').trim() || '#111' };
  }

  function render() {
    var w = Number(shared.value) / 100;
    var n = Number(viewers.value);
    if (!noises || noises.length < n) makeSignals(Math.max(n, 12));
    sharedOut.textContent = Math.round(w * 100) + '%';
    viewersOut.textContent = n;

    var sig = [];
    for (var v = 0; v < n; v++) {
      sig.push(zscore(film.map(function (f, i) { return w * f + (1 - w) * noises[v][i]; })));
    }

    // Mean pairwise r
    var sum = 0, cnt = 0;
    for (var a = 0; a < n; a++) for (var b = a + 1; b < n; b++) { sum += pearson(sig[a], sig[b]); cnt++; }
    var pair = cnt ? sum / cnt : 0;
    // Leave-one-out ISC
    var loo = 0;
    for (var s = 0; s < n; s++) {
      var others = new Array(T).fill(0);
      for (var o = 0; o < n; o++) if (o !== s) for (var i = 0; i < T; i++) others[i] += sig[o][i] / (n - 1);
      loo += pearson(sig[s], others);
    }
    loo /= n;
    outPair.textContent = pair.toFixed(2);
    outLoo.textContent = loo.toFixed(2);
    outRead.textContent = pair > 0.5 ? 'Strong grip: viewers respond in lockstep'
      : pair > 0.2 ? 'Moderate: a shared response is emerging'
      : 'Weak: each viewer is mostly doing their own thing';

    // Draw
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var c = colours();
    ctx.strokeStyle = c.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    var pad = 16, sx = (W - pad * 2) / (T - 1), sy = (H - pad * 2) / 7;
    sig.forEach(function (series) {
      ctx.beginPath();
      series.forEach(function (y, i) {
        var px = pad + i * sx, py = H / 2 - y * sy;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.globalAlpha = 0.35; ctx.strokeStyle = c.ink; ctx.lineWidth = 1; ctx.stroke();
    });
    // Group mean on top
    ctx.globalAlpha = 1; ctx.beginPath();
    for (var t = 0; t < T; t++) {
      var m = 0; for (var k = 0; k < n; k++) m += sig[k][t]; m /= n;
      var x = pad + t * sx, yy = H / 2 - m * sy;
      if (t === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.strokeStyle = c.accent; ctx.lineWidth = 2.5; ctx.stroke();
  }

  shared.addEventListener('input', render);
  viewers.addEventListener('input', render);
  document.getElementById('reseed').addEventListener('click', function () {
    seed = Math.floor(Math.random() * 2147483646) + 1; makeSignals(12); render();
  });
  window.addEventListener('resize', render);
  makeSignals(12);
  render();
})();
