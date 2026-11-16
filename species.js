// The Last Pixels — species index.
//
// Fewest left first: the sort order is the story. The smallest counts get
// their literal pixels right here in the row (2 dots for the rhino); bigger
// ones get a hairline bar linear against the max — the invisible bars ARE
// the point. Extinct species keep an empty track.

const LIGHT = "#e3d5ab"; // a dot — a life still alight
const EMBER = "#e08a35"; // the last pixel
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
const list = document.getElementById("list");

const sorted = [...species].sort(
  (a, b) => a.population.value - b.population.value,
);
const max = Math.max(...species.map((s) => s.population.value));

for (const s of sorted) {
  const n = s.population.value;
  const a = document.createElement("a");
  a.className = "row";
  a.href = `animal.html?a=${s.slug}`;

  const top = document.createElement("div");
  top.className = "top";

  const st = document.createElement("span");
  st.className = "st";
  st.textContent = s.status;
  st.style.background = IUCN[s.status] || "#888";
  st.style.color = ["VU", "NT", "LC", "DD"].includes(s.status)
    ? "var(--bg)"
    : "var(--parchment)";
  top.appendChild(st);

  const nm = document.createElement("div");
  nm.className = "nm";
  const ne = document.createElement("span");
  ne.className = "n";
  ne.textContent = s.name;
  const sci = document.createElement("span");
  sci.className = "sci";
  sci.textContent = " " + s.scientific;
  nm.append(ne, sci);
  top.appendChild(nm);

  const ct = document.createElement("div");
  ct.className = "ct";
  const num = document.createElement("div");
  num.className = "num";
  num.textContent = n.toLocaleString();
  const knd = document.createElement("div");
  knd.className = "knd";
  knd.textContent = `${s.population.kind} · ~${s.population.year}`;
  ct.append(num, knd);
  top.appendChild(ct);
  a.appendChild(top);

  // the scale strip
  const tr = document.createElement("div");
  tr.className = "track";
  if (n > 0 && n <= 32) {
    tr.classList.add("lit");
    for (let i = 0; i < n; i++) tr.appendChild(document.createElement("i"));
  } else if (n > 0) {
    const fill = document.createElement("div");
    fill.className = "fill";
    fill.style.width = (n / max) * 100 + "%";
    tr.appendChild(fill);
  }
  a.appendChild(tr);

  list.appendChild(a);
}

const foot = document.getElementById("foot");
foot.textContent = `${species.length} species · every number sourced in data/species.json · `;
const add = document.createElement("a");
add.href = "CONTRIBUTING.md";
add.textContent = "add one →";
foot.appendChild(add);
