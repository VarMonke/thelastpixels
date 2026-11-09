// The Last Pixels — dot-grid world map.
//
// data/grid.json is baked by tools/build_grid.py from Natural Earth 50m
// (public domain), projected with Equal Earth. Each "cell" is one dot.

const PAPER = "#f6f1e6"; // page background, matches index.html
const INK = "#2e2c26"; // a resting dot
const ACCENT = "#b0501e"; // a dot belonging to the hovered country
const DOT = 0.72; // dot size as a fraction of its cell
const INTRO_JITTER = 0.7; // seconds of randomness in the fade-in

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const tip = document.getElementById("tip");
const foot = document.getElementById("foot");
const box = document.getElementById("map");

const grid = await (await fetch("data/grid.json")).json();
const { w, h, countries, cells } = grid;

// --- lookups ----------------------------------------------------------------

const at = new Int16Array(w * h).fill(-1); // grid cell -> country index
const byCountry = new Map(); // country index -> [cell positions in `cells`]
const delay = new Float32Array(cells.length); // when each dot fades in

for (let i = 0; i < cells.length; i++) {
  const [cx, cy, ci] = cells[i];
  at[cy * w + cx] = ci;
  let list = byCountry.get(ci);
  if (!list) byCountry.set(ci, (list = []));
  list.push(i);
  delay[i] = (cy / h) * 0.9 + Math.random() * INTRO_JITTER;
}

const lit = new Uint8Array(cells.length); // 1 = hovered country's dot
let hover = -1;

foot.textContent = `${cells.length.toLocaleString()} pixels · ${countries.length} countries`;

// --- sizing: fit the grid inside the canvas, centred, sharp on retina -------

const MAX_BLEED = 1.25; // cover the screen, but never crop more than this past fit

let px = 1, ox = 0, oy = 0; // canvas px per cell + top-left offset
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const { width: cw, height: ch } = box.getBoundingClientRect();
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
  const fit = Math.min(cw / w, ch / h); // whole map visible
  const cover = Math.max(cw / w, ch / h); // screen fully covered
  px = Math.min(cover, fit * MAX_BLEED);
  ox = (cw - w * px) / 2;
  oy = (ch - h * px) / 2;
}
addEventListener("resize", resize);
resize();

// --- hover: which country owns this cell -----------------------------------

canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  const gx = Math.floor((e.clientX - r.left - ox) / px);
  const gy = Math.floor((e.clientY - r.top - oy) / px);
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
  lit.fill(0);
  tip.style.opacity = 0;
});

canvas.addEventListener("click", () => {
  if (hover >= 0) console.log("picked", countries[hover]); // hook: /regions/CODE
});

// --- render ------------------------------------------------------------------
// Full redraw every frame: ~25k fillRects is cheap, and keeping one code path
// beats juggling offscreen layers for a prototype.

let glow = 0; // eased 0..1 so the highlight fades instead of snapping
const t0 = performance.now();

function frame(now) {
  const t = (now - t0) / 1000;
  glow += ((hover >= 0 ? 1 : 0) - glow) * 0.2;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const d = px * DOT;
  const inset = (px - d) / 2;
  for (let i = 0; i < cells.length; i++) {
    const appear = t - delay[i]; // dots materialise top-to-bottom + jitter
    if (appear <= 0) continue;
    const [cx, cy] = cells[i];
    const s = lit[i] ? d * 1.3 : d;
    ctx.globalAlpha = Math.min(1, appear / 0.4) * (lit[i] ? 0.5 + 0.5 * glow : 1);
    ctx.fillStyle = lit[i] ? ACCENT : INK;
    ctx.fillRect(
      ox + cx * px + (px - s) / 2,
      oy + cy * px + (px - s) / 2,
      s,
      s,
    );
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
