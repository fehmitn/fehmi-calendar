/* Harness : génère un vrai .ai via export-ai.js sans navigateur (voir SESSION.md §4).
   Usage : node test/harness-ai.mjs  →  écrit test/calendrier-test.ai            */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = join(here, "..", "export-ai.js");

/* --- constantes/fonctions normalement définies dans index.html --- */
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DOW    = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const GRADS = [
  ["#0e2a47","#155e8f","#7ab5dd"],
  ["#1a2a4f","#2c5f9e","#9ec9ec"],["#3b2f63","#7b5ea7","#cbb3e6"],
  ["#1d4d3b","#3e8e63","#bfe3c0"],["#5a3d5c","#b56fae","#f3c6e2"],
  ["#2e7d4f","#66bb6a","#d7f5d0"],["#1f6f8b","#3ca7c9","#c2ecf5"],
  ["#b3541e","#e8862e","#ffd8a0"],["#c2195c","#f4643c","#ffd1a1"],
  ["#7a4f1d","#c98a3b","#f0d9a8"],["#8e4a1f","#d17935","#f5c48f"],
  ["#3f4b54","#6c7f8c","#c3ccd2"],["#0d2b52","#274b8f","#a8c6ee"]
];
const FIXED_HOLIDAYS = {
  "01-01":"Nouvel An","03-20":"Fête de l'Indépendance","04-09":"Journée des Martyrs",
  "05-01":"Fête du Travail","07-25":"Fête de la République","08-13":"Fête de la Femme",
  "10-15":"Fête de l'Évacuation","12-17":"Fête de la Révolution"
};
const pad2 = n => String(n).padStart(2, "0");
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDow = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;
const dayKey = (y, m, d) => y + "-" + pad2(m + 1) + "-" + pad2(d);
const mdKey = (m, d) => pad2(m + 1) + "-" + pad2(d);
const state = {
  year: 2027,
  footer: { logo: null, company: "Société Test", phone: "+216 12 345 678", site: "www.exemple.tn" },
  overrides: {},
  pages: Array.from({ length: 13 }, () => ({ layout: "fullscreen", bg: null, zoom: 100, x: 50, y: 50, opacity: 100, dark: 30 }))
};
function holidayFor(y, m, d){
  const fixed = FIXED_HOLIDAYS[mdKey(m, d)];
  return fixed ? { label: fixed, type: "fixed" } : null;
}
function monthHolidays(y, m){
  const out = [], n = daysIn(y, m);
  for(let d = 1; d <= n; d++){ const h = holidayFor(y, m, d); if(h) out.push({ d, ...h }); }
  return out;
}
const toast = m => console.log("[toast] " + m);
const pagesEl = { querySelector: () => null };

/* --- chargement de export-ai.js (sans sa dernière ligne) dans une Function --- */
let src = readFileSync(srcPath, "utf8");
src = src.split("\n").filter(l => !l.startsWith('document.getElementById("aiBtn")')).join("\n");
src += "\nreturn { _buildPDF, _imgType, _jpegDims, MMPT, PW, PH };";
const api = new Function("state", "MONTHS", "DOW", "GRADS", "daysIn", "firstDow", "holidayFor",
  "monthHolidays", "toast", "pagesEl", "atob", "Image", "document", "fetch", "URL", "Blob",
  "createImageBitmap", src)(
  state, MONTHS, DOW, GRADS, daysIn, firstDow, holidayFor, monthHolidays, toast, pagesEl,
  globalThis.atob, undefined, undefined, globalThis.fetch, globalThis.URL, globalThis.Blob,
  undefined);

/* --- une vraie photo JPEG (Wikimedia, CORS ouvert) --- */
const url = "https://picsum.photos/seed/sidibou/1600/800";
console.log("Téléchargement photo de test…");
const r = await fetch(url);
if(!r.ok) throw new Error("photo introuvable : " + r.status);
const bytes = new Uint8Array(await r.arrayBuffer());
const type = api._imgType(bytes);
const dims = api._jpegDims(bytes);
console.log("Photo :", type, dims.w + "x" + dims.h, (bytes.length / 1024).toFixed(0) + " Ko");

const img = { bytes, w: dims.w, h: dims.h };
const imgs = Array.from({ length: 13 }, () => img);

console.log("Construction du PDF…");
const chunks = api._buildPDF(imgs, img, null);   // fonts = null → Helvetica
const total = chunks.reduce((a, c) => a + c.length, 0);
const out = new Uint8Array(total);
let o = 0;
for(const c of chunks){ out.set(c, o); o += c.length; }
const outPath = join(here, "calendrier-test.ai");
writeFileSync(outPath, out);
console.log("Écrit :", outPath, (total / 1024 / 1024).toFixed(2) + " Mo");
