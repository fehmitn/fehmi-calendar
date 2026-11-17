/* Vérifie que chaque libellé de férié (fixe ou islamique) possède bien une
   traduction arabe dans AR_LABELS — sinon l'option « العربية » afficherait du
   français au milieu de l'arabe.
   Usage : node test/check_labels.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "index.html"), "utf8");

function grab(name){
  const re = new RegExp("const " + name + " = (\\{[\\s\\S]*?\\n\\});");
  const m = src.match(re);
  if(!m) throw new Error("constante introuvable : " + name);
  return new Function("return " + m[1])();
}

const FIXED = grab("FIXED_HOLIDAYS");
const ISLAMIC = grab("ISLAMIC_TARGETS");
const AR = grab("AR_LABELS");

let fail = 0;
const check = (ok, msg) => { console.log((ok ? "OK  " : "ECHEC ") + msg); if(!ok) fail = 1; };

const all = [...Object.entries(FIXED), ...Object.entries(ISLAMIC)];
for(const [key, label] of all){
  const ar = AR[label];
  check(!!ar, `${key} « ${label} » → ${ar || "(aucune traduction)"}`);
  if(ar) check(/[\u0600-\u06FF]/.test(ar), `   arabe valide pour « ${label} »`);
}
check(Object.keys(AR).length === all.length,
  `${Object.keys(AR).length} traductions pour ${all.length} libellés (pas d'entrée orpheline)`);

/* L'app doit traduire à l'affichage, pas dans les données. */
check(/function holLabel\(/.test(src), "fonction holLabel() présente");
check(/holidayLang: "fr"/.test(src), "état par défaut holidayLang = fr");
check(/state\.holidayLang !== "ar"/.test(src), "holLabel() ne traduit qu'en mode arabe");
check(src.includes("esc(holLabel(h.label))"), "légende du mois traduite");
check(src.includes("esc(holLabel(fixed))"), "éditeur de jour traduit");

console.log(fail ? "\nDes libellés manquent." : "\nTous les libellés ont leur traduction arabe.");
process.exitCode = fail;
