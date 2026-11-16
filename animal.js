// The Last Pixels — species page.
//
// One dot = one living individual, a light still alight in the dark. The page
// simply gets as tall as the count requires — rhino is two dots, elephant is
// a thousand rows of scrolling. The last dot drawn is ember-coloured and
// guttering: literally the last pixel.

const LIGHT = "#e3d5ab"; // a dot — a life still alight
const EMBER = "#e08a35"; // the last pixel, guttering
const PITCH_MIN = 4; // px per dot at the dense end — scrolling takes over
const PITCH_MAX = 220; // px per dot when there are only a handful left
const DOTF = 0.72; // dot fill fraction
const CHUNK_ROWS = 40; // rows drawn per pour step
const IUCN = {
  EX: "#000000",
  EW: "#542344",
  CR: "#d81e05",
  EN: "#fc7f3f",
  VU: "#f9e814",
  NT: "#cce226",
  LC: "#60c659",
  DD: "#d1d1c6",
};

const species = await (await fetch("data/species.json")).json();
const slug = new URLSearchParams(location.search).get("a") || species[0].slug;
const s = species.find((x) => x.slug === slug) || species[0];
const n = s.population.value;

document.title = `${s.name} · the last pixels`;

// --- header card ------------------------------------------------------------

document.getElementById("name").textContent = s.name;
document.getElementById("scientific").textContent = s.scientific;

const badges = document.getElementById("badges");
const mk = (text, cls) => {
  const b = document.createElement("span");
  b.className = "badge" + (cls ? " " + cls : "");
  b.textContent = text;
  badges.appendChild(b);
  return b;
};
const st = mk(s.status, "status");
st.style.background = IUCN[s.status] || "#888";
st.style.color = ["VU", "NT", "LC", "DD"].includes(s.status)
  ? "var(--bg)"
  : "var(--parchment)";
mk(s.population.kind);
const yb = mk(`~${s.population.year}`);
if (s.trend) mk(s.trend);
// an estimate older than ~5y is a guess wearing a date — flag it.
// (not for EX: a zero can't go stale)
if (s.population.year < new Date().getFullYear() - 5 && s.status !== "EX") {
  yb.classList.add("stale");
  yb.title = `estimate from ${s.population.year} — more than five years old`;
}

const rangeEl = document.getElementById("range");
rangeEl.textContent = s.population.low
  ? `est. ${s.population.low.toLocaleString()}–${s.population.high.toLocaleString()}`
  : "";

const caption = document.getElementById("caption");
caption.textContent =
  n === 0
    ? "none left to count — the frame below stays empty"
    : n <= 2
      ? "every one of them, below"
      : `${n.toLocaleString()} individuals, below`;

document.getElementById("note").textContent = s.note || "";
document.getElementById("regions").textContent = s.regions?.length
  ? (s.status === "EX" ? "formerly: " : "found in: ") + s.regions.join(" · ")
  : "";

// the payload: who is actually standing between this species and zero
const protect = document.getElementById("protect");
if (s.donate?.length) {
  const ph = document.createElement("div");
  ph.className = "ph";
  ph.textContent = "who stands between them and zero";
  protect.appendChild(ph);
  for (const d of s.donate) {
    const a = document.createElement("a");
    a.href = d.url;
    a.target = "_blank";
    a.rel = "noopener";
    const org = document.createElement("div");
    org.className = "org";
    org.textContent = d.name;
    const why = document.createElement("div");
    why.className = "why";
    why.textContent = d.note || "";
    a.append(org, why);
    protect.appendChild(a);
  }
}

document.getElementById("foot").textContent =
  (n === 0
    ? "no pixels left to draw"
    : "each pixel is one living individual") +
  ` · ${s.population.source} · ~${s.population.year}`;

// --- the field ---------------------------------------------------------------
// pitch adapts to the count: few animals = giant pixels you can't miss,
// many animals = 4px pitch and the page scrolls. either way it's 1:1.

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const lastlight = document.getElementById("lastlight");
// 1x backing store is fine — keeps huge pages light

let pitch, cols, rows, d, inset, chunks, chunk;

function layout() {
  const bw = Math.min(innerWidth - 32, 1200);
  const bh = Math.min(innerHeight * 0.55, 480); // block target for small counts
  pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, Math.sqrt((bw * bh) / n)));
  cols = Math.floor(bw / pitch);
  rows = Math.ceil(n / cols);
  d = pitch * DOTF;
  inset = (pitch - d) / 2;
  canvas.width = cols * pitch;
  canvas.height = rows * pitch;
  canvas.style.width = cols * pitch + "px";
  canvas.style.height = rows * pitch + "px";
  chunks = Math.ceil(rows / CHUNK_ROWS);
  // ember sits exactly over where the final dot lands
  lastlight.style.width = lastlight.style.height = d + "px";
  lastlight.style.left = dx(n - 1) + "px";
  lastlight.style.top = dy(n - 1) + "px";
}

// x of dot i — last row is centred so small counts sit symmetric
const dx = (i) => {
  const row = Math.floor(i / cols);
  const inRow = row === rows - 1 ? n - row * cols : cols;
  const pad = ((cols - inRow) / 2) * pitch;
  return pad + (i % cols) * pitch + inset;
};
const dy = (i) => Math.floor(i / cols) * pitch + inset;

// extinct: nothing pours, nothing flickers. the frame stays; the light doesn't.
function drawEmpty() {
  const w = Math.min(innerWidth - 32, 640);
  canvas.width = w;
  canvas.height = 140;
  canvas.style.width = w + "px";
  canvas.style.height = "140px";
  ctx.strokeStyle = "rgba(227, 213, 171, 0.18)";
  ctx.strokeRect(0.5, 0.5, w - 1, 139);
}

// big number counts up in step with the pour
const countEl = document.getElementById("count");

if (n === 0) {
  drawEmpty();
  countEl.textContent = "0";
} else {
  layout();
  chunk = 0;
}

const t0 = performance.now();
const DURATION = Math.min(2500, 400 + Math.sqrt(n) * 30); // 2 dots = ~0.4s, flood = ~2.5s

function frame(now) {
  const t = (now - t0) / 1000;
  const done = Math.min(1, t / (DURATION / 1000));
  const target = Math.ceil(chunks * done);

  ctx.fillStyle = LIGHT;
  while (chunk < target && chunk < chunks) {
    const p = new Path2D();
    const i0 = chunk * CHUNK_ROWS * cols;
    const i1 = Math.min(n, i0 + CHUNK_ROWS * cols);
    for (let i = i0; i < i1; i++) {
      p.rect(dx(i), dy(i), d, d);
    }
    ctx.fill(p);
    chunk++;
  }

  countEl.textContent = Math.round(n * done).toLocaleString();

  if (chunk >= chunks) {
    // the last pixel — canvas draws it solid, #lastlight gutters on top
    ctx.fillStyle = EMBER;
    const i = n - 1;
    ctx.fillRect(dx(i), dy(i), d, d);
    lastlight.style.display = "block";
    countEl.textContent = n.toLocaleString();
    return; // static after the pour — no loop needed
  }
  requestAnimationFrame(frame);
}
if (n > 0) requestAnimationFrame(frame);

addEventListener("resize", () => {
  if (n === 0) return drawEmpty();
  layout();
  // just redraw everything on resize; pours are cheap
  const p = new Path2D();
  for (let i = 0; i < n; i++) p.rect(dx(i), dy(i), d, d);
  ctx.fillStyle = LIGHT;
  ctx.fill(p);
  ctx.fillStyle = EMBER;
  const i = n - 1;
  ctx.fillRect(dx(i), dy(i), d, d);
  lastlight.style.display = "block";
  chunk = chunks;
  countEl.textContent = n.toLocaleString();
});
