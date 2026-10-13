// Shot length calculator: average shot length (ASL), median shot length (MSL),
// cutting rate and a histogram, from either a runtime + shot count or a list of cut times.
(function () {
  var form = document.getElementById('asl-form');
  if (!form) return;
  var runtime = document.getElementById('runtime');
  var shots = document.getElementById('shots');
  var cuts = document.getElementById('cuts');
  var errorBox = document.getElementById('asl-error');
  var canvas = document.getElementById('asl-hist');
  var ctx = canvas.getContext('2d');
  var out = {
    asl: document.getElementById('o-asl'), msl: document.getElementById('o-msl'),
    rate: document.getElementById('o-rate'), count: document.getElementById('o-count')
  };

  // Accepts "93", "1:33", "01:01:33" or "93.5"
  function toSeconds(str) {
    var s = String(str).trim();
    if (!s) return NaN;
    var parts = s.split(':').map(Number);
    if (parts.some(isNaN)) return NaN;
    return parts.reduce(function (acc, p) { return acc * 60 + p; }, 0);
  }
  function fmt(sec) {
    if (!isFinite(sec)) return '–';
    return sec < 60 ? sec.toFixed(1) + 's' : Math.floor(sec / 60) + 'm ' + Math.round(sec % 60) + 's';
  }

  function compute(e) {
    if (e) e.preventDefault();
    errorBox.hidden = true;
    var total = toSeconds(runtime.value);
    var lengths = [];
    var lines = cuts.value.split(/[\n,]+/).map(function (l) { return l.trim(); }).filter(Boolean);

    if (lines.length) {
      var times = lines.map(toSeconds);
      if (times.some(isNaN)) return fail('One of the cut times could not be read. Use seconds (93) or mm:ss (1:33), one per line.');
      times.sort(function (a, b) { return a - b; });
      if (times[0] !== 0) times.unshift(0);
      if (isFinite(total) && total > times[times.length - 1]) times.push(total);
      for (var i = 1; i < times.length; i++) if (times[i] > times[i - 1]) lengths.push(times[i] - times[i - 1]);
      if (!lengths.length) return fail('Add at least two cut times, or a runtime after your last cut.');
      total = times[times.length - 1];
    } else {
      var n = Number(shots.value);
      if (!isFinite(total) || total <= 0) return fail('Enter a runtime, for example 1:32:00 or 5520.');
      if (!n || n < 1) return fail('Enter the number of shots, or paste a list of cut times instead.');
      for (var k = 0; k < n; k++) lengths.push(total / n);
    }

    var sorted = lengths.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    var msl = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    out.asl.textContent = fmt(total / lengths.length);
    out.msl.textContent = lines.length ? fmt(msl) : '–';
    out.rate.textContent = (lengths.length / (total / 60)).toFixed(1);
    out.count.textContent = lengths.length;
    draw(lengths, !!lines.length);
  }

  function fail(msg) { errorBox.textContent = msg; errorBox.hidden = false; }

  function draw(lengths, real) {
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var cs = getComputedStyle(document.documentElement);
    var accent = cs.getPropertyValue('--accent').trim(), muted = cs.getPropertyValue('--muted').trim(), line = cs.getPropertyValue('--line').trim();
    ctx.font = '12px ' + (cs.getPropertyValue('--mono').trim() || 'monospace');
    if (!real) { ctx.fillStyle = muted; ctx.fillText('Paste cut times to see the distribution of shot lengths.', 16, H / 2); return; }
    var edges = [0, 1, 2, 3, 4, 6, 8, 12, 20, 30, Infinity];
    var labels = ['<1', '1–2', '2–3', '3–4', '4–6', '6–8', '8–12', '12–20', '20–30', '30+'];
    var bins = new Array(labels.length).fill(0);
    lengths.forEach(function (l) { for (var b = 0; b < labels.length; b++) if (l >= edges[b] && l < edges[b + 1]) { bins[b]++; break; } });
    var max = Math.max.apply(null, bins) || 1;
    var pad = { l: 16, r: 16, t: 20, b: 34 }, bw = (W - pad.l - pad.r) / bins.length;
    ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke();
    bins.forEach(function (v, i) {
      var h = (H - pad.t - pad.b) * v / max, x = pad.l + i * bw + 4;
      ctx.fillStyle = accent; ctx.globalAlpha = 0.85;
      ctx.fillRect(x, H - pad.b - h, bw - 8, h);
      ctx.globalAlpha = 1; ctx.fillStyle = muted; ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + (bw - 8) / 2, H - pad.b + 16);
      if (v) ctx.fillText(v, x + (bw - 8) / 2, H - pad.b - h - 6);
    });
    ctx.textAlign = 'left';
  }

  document.getElementById('sample').addEventListener('click', function () {
    runtime.value = '2:00';
    shots.value = '';
    cuts.value = ['0:00', '0:04.2', '0:06.8', '0:12.5', '0:14.1', '0:15.0', '0:21.7', '0:26.3', '0:27.9', '0:35.4', '0:41.0', '0:42.2', '0:49.8', '0:58.6', '1:03.1', '1:05.0', '1:12.4', '1:20.9', '1:24.3', '1:31.7', '1:33.0', '1:41.5', '1:47.2', '1:55.8'].join('\n');
    compute();
  });
  form.addEventListener('submit', compute);
  window.addEventListener('resize', function () { if (out.count.textContent !== '–') compute(); });
})();
