/* Vérifie la géométrie de _bakePage (miroir Y PDF→canvas) avec un canvas simulé.
   Usage : node test/bake_geometry.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, "..", "export-ai.js"), "utf8");
const cut = src.indexOf("MODALE D'EXPORT .ai");
if(cut >= 0) src = src.slice(0, src.lastIndexOf("/*", cut));
src += "\nreturn { _bakePage, PW, PH, mm };";

const calls = [];
function ctxStub(){
  return {
    fillStyle:"", globalAlpha:1,
    save(){}, restore(){}, beginPath(){}, clip(){},
    rect(...a){ calls.push(["clip", ...a]); },
    fillRect(...a){ calls.push(["fillRect", ...a]); },
    drawImage(...a){ calls.push(["drawImage", ...a]); },
    createLinearGradient(){ return { addColorStop(){} }; },
    getImageData(w, h){ return { data: new Uint8ClampedArray(w * h * 4) }; },
  };
}
const documentStub = {
  createElement(tag){
    return { width:0, height:0, getContext(){ return ctxStub(); },
      toDataURL(){ return "data:image/jpeg;base64,/9j/4AAQ"; } };
  },
};

const MONTHS = Array.from({length:12}, (_,i) => "M" + i);
const DOW = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const GRADS = Array.from({length:13}, () => ["#000000","#555555","#ffffff"]);
const state = {
  year: 2027, footer:{ company:"", phone:"", site:"" }, overrides:{},
  pages: Array.from({length:13}, () => ({ layout:"fullscreen", bg:null, zoom:100, x:50, y:50, opacity:100, dark:30 })),
};
const noop = () => {};
const api = new Function("state","MONTHS","DOW","GRADS","daysIn","firstDow","holidayFor",
  "monthHolidays","toast","pagesEl","atob","Image","document","fetch","URL","Blob",
  "createImageBitmap", src)(
  state, MONTHS, DOW, GRADS, () => 31, () => 0, () => null, () => [], noop,
  { querySelector: () => null }, globalThis.atob, undefined, documentStub,
  globalThis.fetch, globalThis.URL, globalThis.Blob, undefined);

const PW = api.PW, PH = api.PH;
const W = 1600, H = Math.round(W * PH / PW), s = W / PW;

async function run(layout, i){
  state.pages[i].layout = layout;
  calls.length = 0;
  const box = layout === "split" ? { x:0, y:0, w:PW/2, h:PH } : { x:0, y:0, w:PW, h:PH };
  await api._bakePage(i, box, null, false);
  return calls.filter(c => c[0] === "fillRect");
}

function check(name, cond, detail){
  console.log((cond ? "OK  " : "ECHEC ") + name + (detail ? "  " + detail : ""));
  if(!cond) process.exitCode = 1;
}

/* Mois plein écran : la carte doit couvrir y = mm(5) .. PH-mm(21), soit
   en canvas : top = H - (PH - mm(21))*s, hauteur = (PH - mm(26))*s. */
const full = await run("fullscreen", 1);
const card = full.find(c => Math.abs(c[1] - api.mm(7) * s) < 1 && Math.abs(c[3] - (PW - api.mm(14)) * s) < 1);
check("carte plein écran trouvée", !!card);
if(card){
  const topAttendu = H - (PH - api.mm(21)) * s;
  check("carte en BAS de page (top ≈ 20 % de H)", Math.abs(card[2] - topAttendu) < 1.5,
    `top=${card[2].toFixed(1)} attendu=${topAttendu.toFixed(1)}`);
  check("hauteur carte ≈ 75 % de H", Math.abs(card[4] - (PH - api.mm(26)) * s) < 1.5,
    `h=${card[4].toFixed(1)}`);
}

/* Mois split : carte à droite, de y=0 à PH-mm(21) → top = H - (PH-mm(21))*s */
const split = await run("split", 1);
const cardS = split.find(c => Math.abs(c[1] - PW / 2 * s) < 1);
check("carte split trouvée", !!cardS);
if(cardS) check("carte split en bas", Math.abs(cardS[2] - (H - (PH - api.mm(21)) * s)) < 1.5,
  `top=${cardS[2].toFixed(1)}`);

/* Couverture : voile 45 % sur toute la page même en split (box gauche) */
const cover = await run("fullscreen", 0);
const veil = cover.find(c => Math.abs(c[3] - PW * s) < 1 && Math.abs(c[4] - PH * s) < 1);
check("voile couverture pleine page", !!veil);

console.log("\nTerminé.");
