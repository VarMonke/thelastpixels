// The Last Pixels — dot-grid world map.
//
// data/grid.json is baked by tools/build_grid.py from Natural Earth 50m
// (public domain), projected with Winkel tripel. Each "cell" is one dot.
//
// At this density (~100k cells) per-frame dot drawing won't hold 60fps, so:
//   - the resting map is drawn once into an offscreen canvas ("base")
//   - each frame blits base, then redraws only the moving bits on top
//     (cursor lens, hovered country) as batched Path2D fills
//   - the intro reveal draws new dots straight into base as they come due

const BG_MID = "#1d160c"; // centre of the sheet, where light remains
const BG_EDGE = "#0d0905"; // edges lost to the dark — matches index.html
const LIGHT = "#e3d5ab"; // a resting dot — a life still alight
const EMBER = "#e08a35"; // dots in the lantern's reach, or hovered country
const BORDER = "#6f5c40"; // engraved borders, dim as old ink
const DOT = 0.72; // dot size as a fraction of its cell
const INTRO_JITTER = 0.7; // seconds of randomness in the fade-in
const BORDER_TIME = 0.7; // seconds the borders get alone before the land pours in
const LENS = 10; // cells under the cursor that get the full lift
const CUTOFF = 55; // beyond this many cells, the pull is exactly zero
const LIFT = 2.2; // max size boost at the centre of the lens
const PULL = 0.55; // how far dots slide toward the cursor, as a fraction of a cell
const MAX_BLEED = 1.0; // fit the whole map — cropping countries off the page is off-brand

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const tip = document.getElementById("tip");
const foot = document.getElementById("foot");
const box = document.getElementById("map");

const grid = await (await fetch("data/grid.json")).json();
const { w, h, countries } = grid;
const cells = grid.cells; // flat [x, y, ci] triples — one dot each
const n = cells.length / 3;

// --- lookups ----------------------------------------------------------------

const at = new Int16Array(w * h).fill(-1); // grid pos -> country index
const atI = new Int32Array(w * h).fill(-1); // grid pos -> index in cells
const byCountry = new Map(); // country index -> [cell indices]
const delay = new Float32Array(n); // when each dot appears
const revealed = new Uint8Array(n); // dot is baked into base
const lit = new Uint8Array(n); // dot belongs to the hovered country
const tone = new Float32Array(n); // uneven pigment — no two dots alike

for (let i = 0; i < n; i++) {
  const cx = cells[i * 3], cy = cells[i * 3 + 1], ci = cells[i * 3 + 2];
  at[cy * w + cx] = ci;
  atI[cy * w + cx] = i;
  let list = byCountry.get(ci);
  if (!list) byCountry.set(ci, (list = []));
  list.push(i);
  delay[i] = BORDER_TIME + (cy / h) * 0.9 + Math.random() * INTRO_JITTER;
  tone[i] = 0.72 + Math.random() * 0.28;
}
// reveal in 1/60s buckets — cheaper than sorting half a million delays
const BUCKETS = 200;
const buckets = Array.from({ length: BUCKETS }, () => []);
for (let i = 0; i < n; i++)
  buckets[Math.min(BUCKETS - 1, Math.floor(delay[i] * 60))].push(i);
let bucket = 0;
let hover = -1;

foot.textContent = `${n.toLocaleString()} pixels · ${countries.length} countries`;

// --- borders + coastlines, marching-squares style. --------------------------
// mark every unit edge that separates different owners — two countries, or
// land and sea (vEdge = vertical edge left of a cell, hEdge = horizontal edge
// above it; cells off the map edge count as sea)...
const we = w + 1;
const vEdge = new Uint8Array(we * h);
const hEdge = new Uint8Array(w * (h + 1));
for (let y = 0; y < h; y++)
  for (let x = 0; x <= w; x++) {
    const a = x > 0 ? at[y * w + x - 1] : -1;
    const b = x < w ? at[y * w + x] : -1;
    if (a !== b && (a >= 0 || b >= 0)) vEdge[y * we + x] = 1;
  }
for (let y = 0; y <= h; y++)
  for (let x = 0; x < w; x++) {
    const a = y > 0 ? at[(y - 1) * w + x] : -1;
    const b = y < h ? at[y * w + x] : -1;
    if (a !== b && (a >= 0 || b >= 0)) hEdge[y * w + x] = 1;
  }

// ...then at each grid vertex, connect the midpoints of the edges touching
// it. two edges = one line through (diagonal borders get cut corners, and
// checkerboard speckle collapses into a single straight border — no doubles);
// three or more = spokes to the vertex for a proper junction.
const segs = [];
for (let vy = 0; vy <= h; vy++) {
  for (let vx = 0; vx <= w; vx++) {
    const mid = [];
    if (vy > 0 && vEdge[(vy - 1) * we + vx]) mid.push(vx, vy - 0.5); // N
    if (vy < h && vEdge[vy * we + vx]) mid.push(vx, vy + 0.5); // S
    if (vx > 0 && hEdge[vy * w + vx - 1]) mid.push(vx - 0.5, vy); // W
    if (vx < w && hEdge[vy * w + vx]) mid.push(vx + 0.5, vy); // E
    if (mid.length === 4) {
      segs.push(mid[0], mid[1], mid[2], mid[3]);
    } else {
      for (let i = 0; i < mid.length; i += 2)
        segs.push(mid[i], mid[i + 1], vx, vy);
    }
  }
}

// --- sizing: fit/cover the grid inside the canvas, centred, retina ----------

let px = 1, ox = 0, oy = 0, dpr = 1, d = 1, inset = 0, cwCss = 0, chCss = 0;
const base = document.createElement("canvas"); // the resting map
const bctx = base.getContext("2d");

function drawRest(i) {
  // cell i's resting dot, into the offscreen canvas
  bctx.fillRect(
    ox + cells[i * 3] * px + inset,
    oy + cells[i * 3 + 1] * px + inset,
    d,
    d,
  );
}

function bake() {
  base.width = canvas.width;
  base.height = canvas.height;
  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // the sheet itself: faintly lit at the centre, dark at the edges
  const g = bctx.createRadialGradient(
    cwCss / 2, chCss / 2, Math.min(cwCss, chCss) * 0.2,
    cwCss / 2, chCss / 2, Math.hypot(cwCss, chCss) * 0.55,
  );
  g.addColorStop(0, BG_MID);
  g.addColorStop(1, BG_EDGE);
  bctx.fillStyle = g;
  bctx.fillRect(0, 0, cwCss, chCss);
  bctx.fillStyle = LIGHT;
  for (let i = 0; i < n; i++)
    if (revealed[i]) {
      bctx.globalAlpha = tone[i];
      drawRest(i);
    }
  bctx.globalAlpha = 1;
}

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  const r = box.getBoundingClientRect();
  cwCss = r.width;
  chCss = r.height;
  canvas.width = cwCss * dpr;
  canvas.height = chCss * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
  const fit = Math.min(cwCss / w, chCss / h); // whole map visible
  const cover = Math.max(cwCss / w, chCss / h); // screen fully covered
  px = Math.min(cover, fit * MAX_BLEED);
  ox = (cwCss - w * px) / 2;
  oy = (chCss - h * px) / 2;
  d = px * DOT;
  inset = (px - d) / 2;
  bake();
}
addEventListener("resize", resize);
resize();

// --- hover: which country owns this cell -----------------------------------
// tx/ty track the raw cursor in cell units; mx/my chase it so the lens drifts
// lazily instead of snapping. "inside" fades the whole effect on pointerleave.

let tx = -1e4, ty = -1e4, mx = -1e4, my = -1e4;
let lens = 0, inside = false;

canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  tx = (e.clientX - r.left - ox) / px;
  ty = (e.clientY - r.top - oy) / px;
  inside = true;
  const gx = Math.floor(tx);
  const gy = Math.floor(ty);
  const ci = gx >= 0 && gx < w && gy >= 0 && gy < h ? at[gy * w + gx] : -1;

  if (ci !== hover) {
    hover = ci;
    lit.fill(0);
    if (ci >= 0) {
      for (const i of byCountry.get(ci)) lit[i] = 1;
      tip.textContent = countries[ci].name;
      tip.style.opacity = 1;
    } else {
      tip.style.opacity = 0;
    }
    canvas.style.cursor = ci >= 0 ? "pointer" : "default";
  }
  tip.style.left = e.clientX - r.left + "px";
  tip.style.top = e.clientY - r.top + "px";
});

canvas.addEventListener("pointerleave", () => {
  hover = -1;
  inside = false;
  lit.fill(0);
  tip.style.opacity = 0;
});

canvas.addEventListener("click", () => {
  if (hover >= 0) console.log("picked", countries[hover]); // hook: /regions/CODE
});

// --- render ------------------------------------------------------------------

let glow = 0; // eased 0..1 so the highlight fades instead of snapping
const t0 = performance.now();

function frame(now) {
  const t = (now - t0) / 1000;
  glow += ((hover >= 0 ? 1 : 0) - glow) * 0.2;
  mx += (tx - mx) * 0.3;
  my += (ty - my) * 0.3;
  lens += ((inside ? 1 : 0) - lens) * 0.15;

  // dots materialise straight into the baked map
  const due = Math.floor(t * 60);
  while (bucket < BUCKETS && bucket <= due) {
    for (const i of buckets[bucket++]) {
      revealed[i] = 1;
      bctx.globalAlpha = tone[i];
      drawRest(i);
    }
  }
  bctx.globalAlpha = 1;

  ctx.drawImage(base, 0, 0, cwCss, chCss);

  // lens: lifted + pulled dots on top of the resting map.
  // lift = (min(1, LENS/dist))² — decays visibly, dies at CUTOFF.
  if (lens > 0.01) {
    const x0 = Math.max(0, Math.ceil(mx - CUTOFF));
    const x1 = Math.min(w - 1, Math.floor(mx + CUTOFF));
    const y0 = Math.max(0, Math.ceil(my - CUTOFF));
    const y1 = Math.min(h - 1, Math.floor(my + CUTOFF));
    // lifted dots are always >= resting size, so they cover their resting
    // dot — no erase pass needed
    const lightPath = new Path2D();
    const emberPath = new Path2D();
    for (let cy = y0; cy <= y1; cy++)
      for (let cx = x0; cx <= x1; cx++) {
        const i = atI[cy * w + cx];
        if (i < 0 || !revealed[i]) continue;
        const dx = cx - mx, dy = cy - my;
        const d2 = dx * dx + dy * dy;
        if (d2 >= CUTOFF * CUTOFF) continue;
        const dist = Math.sqrt(d2);
        const f = Math.min(1, LENS / dist);
        const lift = f * f * lens;
        if (lift <= 0.03) continue;
        const s = d * (lit[i] ? 1.35 : 1) * (1 + lift * LIFT);
        const off = (lift * px * PULL) / (dist || 1);
        (lit[i] || lift > 0.2 ? emberPath : lightPath).rect(
          ox + cx * px + (px - s) / 2 - dx * off,
          oy + cy * px + (px - s) / 2 - dy * off,
          s,
          s,
        );
      }
    ctx.fillStyle = LIGHT;
    ctx.fill(lightPath);
    ctx.fillStyle = EMBER;
    ctx.fill(emberPath);
  }

  // hovered country as one batched path — at this density every 4th dot is
  // plenty for a big country, and russia thanks you for it
  if (hover >= 0 && glow > 0.01) {
    const list = byCountry.get(hover);
    const stride = Math.ceil(list.length / 20000);
    const s = d * 1.35, off = (px - s) / 2;
    const p = new Path2D();
    for (let k = 0; k < list.length; k += stride) {
      const i = list[k];
      if (!revealed[i]) continue;
      p.rect(ox + cells[i * 3] * px + off, oy + cells[i * 3 + 1] * px + off, s, s);
    }
    ctx.globalAlpha = 0.5 + 0.5 * glow;
    ctx.fillStyle = EMBER;
    ctx.fill(p);
    ctx.globalAlpha = 1;
  }

  // borders on top — exactly 1 device pixel, snapped, no AA smear
  ctx.globalAlpha = 0.6 * Math.min(1, t / 0.5);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1 / dpr;
  const snap = (v) => (Math.round(v * dpr - 0.5) + 0.5) / dpr;
  ctx.beginPath();
  for (let i = 0; i < segs.length; i += 4) {
    ctx.moveTo(snap(ox + segs[i] * px), snap(oy + segs[i + 1] * px));
    ctx.lineTo(snap(ox + segs[i + 2] * px), snap(oy + segs[i + 3] * px));
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
