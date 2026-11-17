/* ============================================================
   EXPORT ILLUSTRATOR (.ai) — Fehmi Calendar Studio
   Génère un fichier PDF 1.4 avec extension .ai (les fichiers .ai
   sont des PDF compatibles : Adobe Illustrator les ouvre avec les
   textes et tracés 100 % éditables).
   - Polices TTF intégrées (FontFile2 / Type0 / Identity-H) :
     aucune police manquante à l'ouverture.
   - Images JPEG intégrées (DCTDecode, baseline).
   Aucune dépendance externe (les TTF sont téléchargés via CDN CORS).
   ============================================================ */
"use strict";

const MMPT = 72 / 25.4;               // mm -> points PDF
const PW = 210 * MMPT, PH = 105 * MMPT; // page en pt (595.28 × 297.64)

/* ---------- Métriques Helvetica (repli si les TTF sont indisponibles) ---------- */
const _WR = {" ":278,"!":278,'"':355,"#":556,"$":556,"%":889,"&":667,"'":191,"(":333,")":333,"*":389,"+":584,",":278,"-":333,".":278,"/":278,"0":556,"1":556,"2":556,"3":556,"4":556,"5":556,"6":556,"7":556,"8":556,"9":556,":":278,";":278,"<":584,"=":584,">":584,"?":556,"@":1015,"A":667,"B":667,"C":722,"D":722,"E":667,"F":611,"G":778,"H":722,"I":278,"J":500,"K":667,"L":556,"M":833,"N":722,"O":778,"P":667,"Q":778,"R":722,"S":667,"T":611,"U":722,"V":667,"W":944,"X":667,"Y":667,"Z":611,"[":278,"\\":278,"]":278,"^":469,"_":556,"`":333,"a":556,"b":556,"c":500,"d":556,"e":556,"f":278,"g":556,"h":556,"i":222,"j":222,"k":500,"l":222,"m":833,"n":556,"o":556,"p":556,"q":556,"r":333,"s":500,"t":278,"u":556,"v":500,"w":722,"x":500,"y":500,"z":500,"{":334,"|":260,"}":334,"~":584};
const _WB = {" ":278,"!":333,'"':474,"#":556,"$":556,"%":889,"&":722,"'":238,"(":333,")":333,"*":389,"+":584,",":278,"-":333,".":278,"/":278,"0":556,"1":556,"2":556,"3":556,"4":556,"5":556,"6":556,"7":556,"8":556,"9":556,":":333,";":333,"<":584,"=":584,">":584,"?":611,"@":975,"A":722,"B":722,"C":722,"D":722,"E":667,"F":611,"G":778,"H":722,"I":278,"J":556,"K":722,"L":611,"M":833,"N":722,"O":778,"P":667,"Q":778,"R":722,"S":667,"T":611,"U":722,"V":667,"W":944,"X":667,"Y":667,"Z":611,"[":333,"\\":278,"]":333,"^":584,"_":556,"`":333,"a":556,"b":611,"c":556,"d":611,"e":556,"f":333,"g":611,"h":611,"i":278,"j":278,"k":556,"l":278,"m":889,"n":611,"o":611,"p":611,"q":611,"r":389,"s":556,"t":333,"u":611,"v":556,"w":778,"x":556,"y":556,"z":500,"{":389,"|":280,"}":389,"~":584};
const _NORM = {"à":"a","á":"a","â":"a","ä":"a","ã":"a","å":"a","é":"e","è":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ò":"o","ó":"o","ô":"o","ö":"o","õ":"o","ù":"u","ú":"u","û":"u","ü":"u","ç":"c","ñ":"n","ý":"y","ÿ":"y","œ":"o","æ":"a","À":"A","Á":"A","Â":"A","Ä":"A","Ã":"A","Å":"A","É":"E","È":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ò":"O","Ó":"O","Ô":"O","Ö":"O","Õ":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ç":"C","Ñ":"N","Ý":"Y","Œ":"O","Æ":"A"};

/* ---------- Encodage WinAnsi (mode repli) ---------- */
const _SPECIAL = {"\u2013":150,"\u2014":151,"\u2018":145,"\u2019":146,"\u201C":147,"\u201D":148,"\u2022":149,"\u2026":133,"\u0153":156,"\u0152":140,"\u20AC":128};
function _wa(s){
  let out = "";
  for(const ch of s){
    const cp = ch.codePointAt(0);
    if(_SPECIAL[ch] !== undefined) out += String.fromCharCode(_SPECIAL[ch]);
    else if(cp <= 255) out += ch;
    else out += "?";
  }
  return out;
}
function _pdfStr(s){
  return "(" + _wa(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ")";
}
function _cw(ch, bold){
  const t = bold ? _WB : _WR;
  const c = _NORM[ch] !== undefined ? _NORM[ch] : ch;
  if(t[c] !== undefined) return t[c];
  const cl = c.toLowerCase(), cu = c.toUpperCase();
  if(t[cl] !== undefined) return t[cl];
  if(t[cu] !== undefined) return t[cu];
  return 556;
}
function _tw(s, size, bold, tc){
  let w = 0, n = 0;
  for(const ch of s){ w += _cw(ch, bold); n++; }
  w = w / 1000 * size;
  if(tc) w += tc * Math.max(0, n - 1);
  return w;
}

/* ---------- Utilitaires couleurs / nombres ---------- */
function _n(v){ return Math.round(v * 1000) / 1000 + ""; }
function _rgb(hex){
  const h = hex.replace("#", "");
  return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
}
function _colsRGB(hex){ const c = _rgb(hex); return _n(c[0]) + " " + _n(c[1]) + " " + _n(c[2]); }
function _rg(hex){ return _colsRGB(hex) + " rg"; }
function _latin1(s){
  const b = new Uint8Array(s.length);
  for(let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xFF;
  return b;
}
function _pad4(v){ return v.toString(16).toUpperCase().padStart(4, "0"); }

/* ============================================================
   POLICES TTF — téléchargement (CDN CORS) + parsing minimal
   ============================================================ */
const FONT_URLS = {
  reg: [
    ["https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Regular.ttf", "Roboto-Regular"],
    ["https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf", "DejaVuSans"]
  ],
  bold: [
    ["https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Bold.ttf", "Roboto-Bold"],
    ["https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf", "DejaVuSans-Bold"]
  ]
};
function _u16(b, o){ return (b[o] << 8) | b[o + 1]; }
function _s16(b, o){ const v = (b[o] << 8) | b[o + 1]; return v >= 0x8000 ? v - 0x65536 : v; }
function _u32(b, o){ return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0; }

function _parseTTF(b){
  if(!b || b.length < 64) return null;
  const magic = _u32(b, 0);
  if(magic !== 0x00010000 && magic !== 0x74727565) return null; // TrueType uniquement (glyf)
  const num = _u16(b, 4);
  const t = {};
  for(let i = 0; i < num; i++){
    const o = 12 + i * 16;
    t[String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3])] = { o: _u32(b, o + 8), l: _u32(b, o + 12) };
  }
  if(!t.head || !t.hhea || !t.cmap || !t.hmtx) return null;
  const upem = _u16(b, t.head.o + 18);
  if(!upem) return null;
  const bbox = [_s16(b, t.head.o + 36), _s16(b, t.head.o + 38), _s16(b, t.head.o + 40), _s16(b, t.head.o + 42)];
  const asc = _s16(b, t.hhea.o + 4), desc = _s16(b, t.hhea.o + 6);
  const nhm = _u16(b, t.hhea.o + 34);

  /* sous-tables cmap : format 4 (BMP) et format 12 */
  const co = t.cmap.o, ncmap = _u16(b, co + 2);
  let f4 = null, f12 = null;
  for(let i = 0; i < ncmap; i++){
    const r = co + 4 + i * 8;
    const pid = _u16(b, r), eid = _u16(b, r + 2), s = co + _u32(b, r + 4);
    const fmt = _u16(b, s);
    if(fmt === 4 && (f4 === null || (pid === 3 && eid === 1))) f4 = s;
    if(fmt === 12 && (f12 === null || (pid === 3 && eid === 10))) f12 = s;
  }
  function gid4(cp){
    if(!f4) return 0;
    const seg = _u16(b, f4 + 6) / 2;
    const endO = f4 + 14, startO = endO + seg * 2 + 2, deltaO = startO + seg * 2, rangeO = deltaO + seg * 2;
    let lo = 0, hi = seg - 1, si = -1;
    while(lo <= hi){
      const mid = (lo + hi) >> 1;
      if(_u16(b, endO + mid * 2) >= cp){ si = mid; hi = mid - 1; } else lo = mid + 1;
    }
    if(si < 0) return 0;
    if(cp < _u16(b, startO + si * 2)) return 0;
    const ro = _u16(b, rangeO + si * 2);
    let g;
    if(ro === 0) g = (cp + _s16(b, deltaO + si * 2)) & 0xFFFF;
    else{
      g = _u16(b, rangeO + si * 2 + ro + (cp - _u16(b, startO + si * 2)) * 2);
      if(g) g = (g + _s16(b, deltaO + si * 2)) & 0xFFFF;
    }
    return g;
  }
  function gid12(cp){
    if(!f12) return 0;
    const ng = _u32(b, f12 + 12);
    let lo = 0, hi = ng - 1;
    while(lo <= hi){
      const mid = (lo + hi) >> 1, g = f12 + 16 + mid * 12;
      const s = _u32(b, g), e = _u32(b, g + 4);
      if(cp < s) hi = mid - 1;
      else if(cp > e) lo = mid + 1;
      else return (_u32(b, g + 8) + cp - s) >>> 0;
    }
    return 0;
  }
  function gidFor(cp){
    if(cp >= 0x10000 && f12) return gid12(cp);
    if(f4) return gid4(cp);
    if(f12) return gid12(cp);
    return 0;
  }
  function aw(g){
    const i = Math.min(Math.max(g, 0), nhm - 1);
    return Math.round(_u16(b, t.hmtx.o + i * 4) / upem * 1000);
  }
  return { upem, bbox, asc, desc, gidFor, aw };
}
  async function _getFont(kind){ // DÉSACTIVÉ : Vector Craft (et d'autres visionneurs) gèrent mal les Type0/FontFile2 → Helvetica Type1 de base, substitution automatique partout.
    return null;
  }

/* ============================================================
   IMAGES — chaîne d'acquisition à 4 niveaux (CORS)
   ============================================================ */
function _loadImage(url, cors){
  return new Promise((res, rej) => {
    const im = new Image();
    if(cors) im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = url;
  });
}
function _dataURLBytes(durl){
  const b64 = durl.split(",")[1];
  const bin = atob(b64);
  const b = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  return b;
}
function _imgType(b){
  if(!b || b.length < 12) return null;
  if(b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return "jpeg";
  if(b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return "png";
  if(b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) return "webp";
  if(b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "gif";
  return null;
}
function _jpegDims(b){
  let i = 2;
  while(i + 9 < b.length){
    if(b[i] !== 0xFF){ i++; continue; }
    const m = b[i + 1];
    if(m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC){
      return { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
    }
    if(m === 0xD8 || (m >= 0xD0 && m <= 0xD7) || m === 0x01){ i += 2; continue; }
    i += 2 + ((b[i + 2] << 8) | b[i + 3]);
  }
  return null;
}
function _bitmapToJpeg(bmp, maxW){
  const r = Math.min(1, (maxW || 1600) / bmp.width);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bmp.width * r));
  c.height = Math.max(1, Math.round(bmp.height * r));
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  const durl = c.toDataURL("image/jpeg", 0.9);
  return { bytes: _dataURLBytes(durl), w: c.width, h: c.height };
}
async function _blobToJpeg(blob, maxW){
  const bmp = await createImageBitmap(blob);
  const out = _bitmapToJpeg(bmp, maxW);
  if(bmp.close) bmp.close();
  return out;
}

/* ============================================================
   APLATISSEMENT DU FOND — compatibilité maximale des visionneurs
   Le dégradé + la photo (zoom/position/opacité) + les voiles + la
   carte blanche semi-transparente sont dessinés dans un canvas et
   rasterisés en un seul JPEG. Le PDF n'a alors plus besoin de
   Shading, d'ExtGState (transparence) ni de clipping path autour
   des images — trois sources connues de problèmes (Vector Craft).
   ============================================================ */
async function _bakePage(i, box, bmp, flate){
  const p = state.pages[i];
  const W = flate ? 1200 : 1600;                 // Flate = plus lourd → 1200 px (~145 dpi)
  const H = Math.round(W * PH / PW);
  const s = W / PW;                              // pt → px
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, H);
  /* dégradé + photo + voiles, confinés à la zone du fond (box) */
  x.save();
  x.beginPath(); x.rect(box.x * s, box.y * s, box.w * s, box.h * s); x.clip();
  const g = x.createLinearGradient(0, 0, W, H);  // haut-gauche → bas-droite (comme le Shading PDF)
  const cols = GRADS[i];
  g.addColorStop(0, cols[0]); g.addColorStop(0.55, cols[1]); g.addColorStop(1, cols[2]);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  if(bmp){
    const s0 = Math.max(box.w / bmp.width, box.h / bmp.height) * (p.zoom / 100);
    const cx = box.x + box.w * (p.x / 100), cy = box.y + box.h * (1 - p.y / 100);
    x.globalAlpha = Math.max(0, Math.min(1, p.opacity / 100));
    x.drawImage(bmp, (cx - bmp.width * s0 / 2) * s, (cy - bmp.height * s0 / 2) * s,
      bmp.width * s0 * s, bmp.height * s0 * s);
    x.globalAlpha = 1;
  }
  if(p.dark > 0){
    x.globalAlpha = p.dark / 100; x.fillStyle = "#000000";
    x.fillRect(box.x * s, box.y * s, box.w * s, box.h * s); x.globalAlpha = 1;
  }
  if(i === 0){ // voile de couverture (rect 45 % de coverPage)
    x.globalAlpha = 0.45; x.fillStyle = "#000000";
    x.fillRect(box.x * s, box.y * s, box.w * s, box.h * s); x.globalAlpha = 1;
  }
  x.restore();
  /* carte du calendrier (mois uniquement) — aplatissée aussi */
  if(i > 0){
    const card = p.layout === "split"
      ? { x: PW / 2, y: 0, w: PW / 2, h: PH - mm(21) }
      : { x: mm(7), y: mm(5), w: PW - mm(14), h: PH - mm(26) };
    if(p.layout !== "split") x.globalAlpha = 0.87;
    x.fillStyle = "#ffffff";
    x.fillRect(card.x * s, card.y * s, card.w * s, card.h * s);
    x.globalAlpha = 1;
  }
  if(flate){
    /* PNG-like : octets RGB bruts + FlateDecode (zlib) — accepté par les
       visionneurs qui ne gèrent pas le DCTDecode (Vector Craft p. ex.). */
    const imgd = x.getImageData(0, 0, W, H).data;
    const rgb = new Uint8Array(W * H * 3);
    for(let p2 = 0, j = 0; p2 < imgd.length; p2 += 4){
      rgb[j++] = imgd[p2]; rgb[j++] = imgd[p2 + 1]; rgb[j++] = imgd[p2 + 2];
    }
    const z = await _deflate(rgb);
    if(z) return { bytes: z, w: W, h: H, baked: true, flate: true };
    /* repli JPEG si CompressionStream indisponible */
  }
  const durl = c.toDataURL("image/jpeg", 0.9);
  return { bytes: _dataURLBytes(durl), w: W, h: H, baked: true };
}
/* zlib (RFC1950) via CompressionStream('deflate') — dispo Chrome/Edge/Firefox/Safari 16.4+ */
async function _deflate(bytes){
  if(typeof CompressionStream === "undefined") return null;
  try{
    const cs = new CompressionStream("deflate");
    const w = cs.writable.getWriter();
    w.write(bytes); w.close();
    return new Uint8Array(await new Response(cs.readable).arrayBuffer());
  }catch(e){ return null; }
}
async function _imgToJpeg(el){
  const src = el.getAttribute("src");
  if(!src) return null;
  try{
    const blob = await (await fetch(src)).blob();
    return await _blobToJpeg(blob);
  }catch(e1){}
  try{
    const im = await _loadImage(src, true);
    return _bitmapToJpeg(im);
  }catch(e2){}
  try{
    const b = src.startsWith("data:") ? _dataURLBytes(src) : new Uint8Array(await (await fetch(src, { mode: "cors" })).arrayBuffer());
    if(_imgType(b) === "jpeg"){ const d = _jpegDims(b); if(d) return { bytes: b, w: d.w, h: d.h }; }
  }catch(e3){}
  return null;
}
function _download(blob, name){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}

/* ============================================================
   CONSTRUCTION DU PDF
   ============================================================ */
function mm(v){ return v * MMPT; }

function _buildPDF(imgs, logoImg, fonts){
  const chunks = [], offs = {};
  let off = 0, next = 32;
  let res = { gs:{}, sh:{}, im:{} };
  const USED = new Set();   // caractères à intégrer (passe 1)
  let DRY = false;
  let EMB = null;           // polices intégrées après la passe 1

  function push(p){
    const b = typeof p === "string" ? _latin1(p) : p;
    chunks.push(b); off += b.length;
  }
  /* En-tête PDF obligatoire : sans lui, les moteurs stricts (PDFium/Chrome,
     Edge, nombre d'apps — Vector Craft inclus) refusent le fichier, alors que
     MuPDF/Acrobat tolèrent son absence. Le commentaire binaire marque le
     fichier comme binaire (§7.5.2 de la spec PDF). */
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  function addObj(n, body){ offs[n] = off; push(n + " 0 obj\n" + body + "\nendobj\n"); }
  function addStream(n, dict, data){
    const d = typeof data === "string" ? _latin1(data) : data;
    offs[n] = off;
    push(n + " 0 obj\n" + dict + "\nstream\n");
    push(d);
    push("\nendstream\nendobj\n");
  }

  /* --- ressources par page (aucune écriture pendant la passe sèche) --- */
  function reggs(alpha){
    if(alpha === null || alpha === undefined || alpha >= 0.999) return null;
    if(DRY) return "GSD";
    const n = next++;
    addObj(n, "<< /Type /ExtGState /ca " + _n(alpha) + " /CA " + _n(alpha) + " >>");
    res.gs["GS" + n] = n;
    return "GS" + n;
  }
  function regsh(cols){
    if(DRY) return "ShD";
    const n = next++;
    const f1 = "<< /FunctionType 2 /Domain [0 1] /C0 [" + _colsRGB(cols[0]) + "] /C1 [" + _colsRGB(cols[1]) + "] /N 1 >>";
    const f2 = "<< /FunctionType 2 /Domain [0 1] /C0 [" + _colsRGB(cols[1]) + "] /C1 [" + _colsRGB(cols[2]) + "] /N 1 >>";
    addObj(n, "<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [0 " + _n(PH) + " " + _n(PW) + " 0]" +
      " /Function << /FunctionType 3 /Domain [0 1] /Functions [" + f1 + " " + f2 + "] /Bounds [0.55] >>" +
      " /Extend [true true] >>");
    res.sh["Sh" + n] = n;
    return "Sh" + n;
  }
  function regim(im){
    if(DRY) return "ImD";
    const n = next++;
    const filter = im.flate ? "/FlateDecode" : "/DCTDecode";
    addStream(n, "<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h +
      " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter " + filter + " /Length " + im.bytes.length + " >>", im.bytes);
    res.im["Im" + n] = n;
    return "Im" + n;
  }

  /* --- texte : WinAnsi (repli) ou GIDs hexadécimaux (polices intégrées) --- */
  function txt(s, x, baseline, sizeMm, bold, color, o){
    o = o || {};
    const size = sizeMm * MMPT;
    if(DRY){ for(const ch of s) USED.add(ch); }
    let w;
    if(EMB){
      const m = bold ? EMB.bold : EMB.reg;
      let sw = 0, n = 0;
      for(const ch of s){ sw += (m.w[ch] !== undefined ? m.w[ch] : 600); n++; }
      w = sw / 1000 * size + (o.tc ? o.tc * Math.max(0, n - 1) : 0);
    }else{
      w = _tw(s, size, bold, o.tc || 0);
    }
    let tx = x;
    if(o.align === "center") tx -= w / 2;
    if(o.align === "right") tx -= w;
    let out = "BT";
    if(o.tc) out += " " + _n(o.tc) + " Tc";
    if(o.g) out += " /" + o.g + " gs";
    out += " /" + (bold ? "F2" : "F1") + " " + _n(size) + " Tf " + _rg(color) +
      " 1 0 0 1 " + _n(tx) + " " + _n(baseline) + " Tm ";
    if(EMB){
      const m = bold ? EMB.bold : EMB.reg;
      let hex = "";
      for(const ch of s) hex += _pad4(m.gid[ch] || 0);
      out += "<" + hex + "> Tj ET\n";
    }else{
      out += _pdfStr(s) + " Tj ET\n";
    }
    return out;
  }
  function rect(x, y, w, h, color, g){
    return "q " + (g ? "/" + g + " gs " : "") + _rg(color) + " " +
      _n(x) + " " + _n(y) + " " + _n(w) + " " + _n(h) + " re f\nQ\n";
  }
  function circle(cx, cy, r, color){
    /* Cercle PDF valide : 4 courbes de Bézier (l'opérateur PostScript `arc` est
       invalide en PDF et casse le rendu dans certains visionneurs stricts). */
    const k = r * 0.5522847498;
    return "q " + _rg(color) + " " +
      _n(cx + r) + " " + _n(cy) + " m " +
      _n(cx + r) + " " + _n(cy + k) + " " + _n(cx + k) + " " + _n(cy + r) + " " + _n(cx) + " " + _n(cy + r) + " c " +
      _n(cx - k) + " " + _n(cy + r) + " " + _n(cx - r) + " " + _n(cy + k) + " " + _n(cx - r) + " " + _n(cy) + " c " +
      _n(cx - r) + " " + _n(cy - k) + " " + _n(cx - k) + " " + _n(cy - r) + " " + _n(cx) + " " + _n(cy - r) + " c " +
      _n(cx + k) + " " + _n(cy - r) + " " + _n(cx + r) + " " + _n(cy - k) + " " + _n(cx + r) + " " + _n(cy) + " c f\nQ\n";
  }
  function hline(x0, x1, y, color, w){
    return "q " + _rg(color) + " " + _n(w) + " w " + _n(x0) + " " + _n(y) + " m " + _n(x1) + " " + _n(y) + " l S\nQ\n";
  }
  function vline(x, y0, y1, color, w){
    return "q " + _rg(color) + " " + _n(w) + " w " + _n(x) + " " + _n(y0) + " m " + _n(x) + " " + _n(y1) + " l S\nQ\n";
  }

  /* --- fond : image « aplatie » (dégradé + photo + voiles + carte rasterisés)
         → aucune transparence, aucun clipping, aucun shading dans le PDF --- */
  function bgBlock(i, box, im){
    if(im && im.baked){
      /* image rasterisée pleine page : le carré unité de l'image occupe la page entière */
      return "q " + _n(PW) + " 0 0 " + _n(PH) + " 0 0 cm /" + regim(im) + " Do\nQ\n";
    }
    /* repli (image non aplatie — usage du harness) : chemin historique */
    const p = state.pages[i];
    let s = "q " + _n(box.x) + " " + _n(box.y) + " " + _n(box.w) + " " + _n(box.h) + " re W n\n";
    s += "/" + regsh(GRADS[i]) + " sh\nQ\n";
    if(im){
      const g = reggs(p.opacity / 100);
      const s0 = Math.max(box.w / im.w, box.h / im.h) * (p.zoom / 100);
      const cx = box.x + box.w * (p.x / 100);
      const cy = box.y + box.h * (1 - p.y / 100);
      s += "q " + (g ? "/" + g + " gs " : "") +
        _n(box.x) + " " + _n(box.y) + " " + _n(box.w) + " " + _n(box.h) + " re W n\n";
      /* ⚠ l'image est peinte dans un carré unité : le cm doit valoir la taille
         finale en points (im.w*s0 × im.h*s0), pas le facteur par pixel. */
      s += _n(im.w * s0) + " 0 0 " + _n(im.h * s0) + " " + _n(cx - im.w * s0 / 2) + " " + _n(cy - im.h * s0 / 2) + " cm /" + regim(im) + " Do\nQ\n";
    }
    if(p.dark > 0) s += rect(box.x, box.y, box.w, box.h, "#000000", reggs(p.dark / 100));
    return s;
  }

  /* --- page de couverture --- */
  function coverPage(i){
    const p = state.pages[i];
    const split = p.layout === "split";
    const box = split ? { x: 0, y: 0, w: PW / 2, h: PH } : { x: 0, y: 0, w: PW, h: PH };
    let s = bgBlock(i, box, imgs[i]);
    if(!(imgs[i] && imgs[i].baked)) s += rect(box.x, box.y, box.w, box.h, "#000000", reggs(0.45));
    const cx = box.x + box.w / 2;
    s += txt("CALENDRIER DE BUREAU", cx, PH - mm(30) - mm(4) * 0.78, 4, true, "#ffffff",
      { align: "center", tc: mm(1.2) });
    s += txt(String(state.year), cx, PH - mm(36) - mm(26) * 0.8, 26, true, "#ffffff", { align: "center" });
    s += rect(cx - mm(15), PH - mm(66.6), mm(30), mm(0.6), "#5eead4");
    s += txt("Janvier — Décembre " + state.year + " · Édition chevalet à spirale",
      cx, PH - mm(68.5) - mm(3.6) * 0.78, 3.6, false, "#ffffff", { align: "center" });
    const parts = [state.footer.company, state.footer.phone, state.footer.site].filter(Boolean);
    if(logoImg){
      const sc = Math.min(mm(4.5) / logoImg.h, mm(20) / logoImg.w);
      s += "q " + _n(logoImg.w * sc) + " 0 0 " + _n(logoImg.h * sc) + " " + _n(cx - logoImg.w * sc / 2) + " " + _n(mm(7.5)) +
        " cm /" + regim(logoImg) + " Do\nQ\n";
    }
    if(parts.length){
      s += txt(parts.join("  ·  "), cx, mm(4.6), 2.9, false, "#ffffff", { align: "center" });
    }
    return s;
  }

  /* --- page mois --- */
  function monthPage(i){
    const m = i - 1, yr = state.year, p = state.pages[i];
    const split = p.layout === "split";
    const box = split ? { x: 0, y: 0, w: PW / 2, h: PH } : { x: 0, y: 0, w: PW, h: PH };
    let s = bgBlock(i, box, imgs[i]);
    const card = split
      ? { x: PW / 2, y: 0, w: PW / 2, h: PH - mm(21) }  // respecte la zone de reliure 18 mm (comme le plein écran)
      : { x: mm(7), y: mm(5), w: PW - mm(14), h: PH - mm(26) };
    s += split
      ? (imgs[i] && imgs[i].baked ? "" : rect(card.x, card.y, card.w, card.h, "#ffffff"))
      : (imgs[i] && imgs[i].baked ? "" : rect(card.x, card.y, card.w, card.h, "#ffffff", reggs(0.87)));
    const x0 = card.x + (split ? mm(5) : mm(4.5));
    const x1 = card.x + card.w - mm(4.5);
    const yTop = card.y + card.h - (split ? mm(5) : mm(3));
    const yBot = card.y + mm(3);

    const fParts = [state.footer.company, state.footer.phone, state.footer.site].filter(Boolean);
    const hasFoot = fParts.length > 0 || logoImg;
    const footH = hasFoot ? mm(6.8) : 0;
    const gridTop = yTop - mm(7.2) - mm(3.4);
    const gridBot = yBot + footH + mm(5.4);
    const gw = x1 - x0;
    const cw = (gw - 6 * mm(0.4)) / 7;
    const chh = (gridTop - gridBot - 5 * mm(0.4)) / 6;

    /* en-tête */
    s += txt(MONTHS[m], x0, yTop - mm(5.4) * 0.8, 5.4, true, "#111827");
    s += txt(String(yr), x1, yTop - mm(3.2) * 0.8, 3.2, false, "#667085", { align: "right" });

    /* jours de semaine */
    const dowBase = gridTop + mm(1.4);
    DOW.forEach((w, c) => {
      const cx = x0 + c * (cw + mm(0.4)) + cw / 2;
      s += txt(w, cx, dowBase, 2.5, true, c >= 5 ? "#b45309" : "#5a6472", { align: "center" });
    });

    /* grille des jours */
    const n = daysIn(yr, m), start = firstDow(yr, m);
    for(let idx = 0; idx < 42; idx++){
      const d = idx - start + 1;
      if(d < 1 || d > n) continue;
      const c = idx % 7, r = Math.floor(idx / 7);
      const x = x0 + c * (cw + mm(0.4));
      const yTopC = gridTop - r * (chh + mm(0.4));
      const yBotC = yTopC - chh;
      const h = holidayFor(yr, m, d);
      const we = c >= 5;
      if(h){
        s += rect(x, yBotC, cw, chh, h.type === "fixed" ? "#fdeaea" : h.type === "islamic" ? "#e3f4f4" : "#fdf3dc");
      }else if(we){
        s += rect(x, yBotC, cw, chh, "#eef2f7");
      }
      const colr = h
        ? (h.type === "fixed" ? "#b91c1c" : h.type === "islamic" ? "#0e7490" : "#b45309")
        : we ? "#1d3b6d" : "#222222";
      s += txt(String(d), x + cw / 2, (yTopC + yBotC) / 2 - mm(2.9) * 0.36, 2.9, false, colr, { align: "center" });
      if(h){
        s += circle(x + cw / 2, yBotC + mm(1.4), mm(0.75),
          h.type === "fixed" ? "#dc2626" : h.type === "islamic" ? "#0891b2" : "#d97706");
      }
    }

    /* légende des fêtes */
    const legLine = yBot + footH + mm(0.6);
    s += hline(x0, x1, legLine, "#d0d5dd", 0.4);
    const legBase = legLine + mm(1) + mm(2.3) * 0.8;
    const hols = monthHolidays(yr, m);
    let lx = x0;
    if(hols.length){
      hols.forEach(h => {
        const dc = h.type === "fixed" ? "#dc2626" : h.type === "islamic" ? "#0891b2" : "#d97706";
        s += circle(lx + mm(0.8), legBase + mm(0.8), mm(0.8), dc);
        const label = h.d + " " + h.label;
        s += txt(label, lx + mm(2), legBase, 2.3, false, "#374151");
        lx += mm(2) + _tw(label, mm(2.3), false) + mm(3);
      });
    }else{
      s += txt("Aucun jour férié ce mois", x0, legBase, 2.2, false, "#9aa3b0");
    }

    /* pied de page société */
    if(hasFoot){
      s += hline(x0, x1, yBot + footH - mm(0.3), "#d0d5dd", 0.4);
      let fx = x0;
      if(logoImg){
        const sc = Math.min(mm(5) / logoImg.h, mm(22) / logoImg.w);
        s += "q " + _n(logoImg.w * sc) + " 0 0 " + _n(logoImg.h * sc) + " " + _n(fx) + " " + _n(yBot + mm(0.9)) +
          " cm /" + regim(logoImg) + " Do\nQ\n";
        fx += logoImg.w * sc + mm(2.4);
      }
      fParts.forEach((t, k) => {
        if(k > 0){
          s += vline(fx, yBot + mm(1.4), yBot + mm(4.4), "#c3c9d4", 0.4);
          fx += mm(2.4);
        }
        const bold = k === 0, sz = k === 0 ? 2.7 : 2.5, col = k === 0 ? "#1f2937" : "#5a6472";
        s += txt(t, fx, yBot + mm(2.9), sz, bold, col);
        fx += _tw(t, mm(sz), bold) + mm(2.4);
      });
    }
    return s;
  }

  /* --- ressources + objet Page --- */
  function pageBody(cn){
    let eg = "", sh = "", xo = "";
    Object.keys(res.gs).forEach(k => { eg += "/" + k + " " + res.gs[k] + " 0 R "; });
    Object.keys(res.sh).forEach(k => { sh += "/" + k + " " + res.sh[k] + " 0 R "; });
    Object.keys(res.im).forEach(k => { xo += "/" + k + " " + res.im[k] + " 0 R "; });
    return "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + _n(PW) + " " + _n(PH) + "]" +
      " /Resources << /ProcSet [/PDF /Text /ImageC] /Font << /F1 30 0 R /F2 31 0 R >>" +
      (eg ? " /ExtGState << " + eg + " >>" : "") +
      (sh ? " /Shading << " + sh + " >>" : "") +
      (xo ? " /XObject << " + xo + " >>" : "") +
      " >> /Contents " + cn + " 0 R >>";
  }

  /* ================= PASSE 1 : collecte des caractères ================= */
  DRY = true;
  for(let i = 0; i < 13; i++){
    res = { gs:{}, sh:{}, im:{} };
    if(i === 0) coverPage(i); else monthPage(i);
  }
  DRY = false;

  /* ================= POLICES INTÉGRÉES ================= */
  function buildFont(rootN, f, stemV){
    const dN = next++, tuN = next++, fdN = next++, ffN = next++;
    const k = 1000 / f.upem;
    addObj(rootN, "<< /Type /Font /Subtype /Type0 /BaseFont /" + f.name +
      " /Encoding /Identity-H /DescendantFonts [" + dN + " 0 R] /ToUnicode " + tuN + " 0 R >>");
    /* /W : largeurs des glyphes utilisés (plages compactes) */
    const gids = [...new Set(Object.values(f.gid))].filter(g => g > 0).sort((a, b) => a - b);
    let wArr = "", i = 0;
    while(i < gids.length){
      let j = i;
      while(j + 1 < gids.length && gids[j + 1] === gids[j] + 1 && f.aw(gids[j + 1]) === f.aw(gids[i])) j++;
      const w = f.aw(gids[i]);
      wArr += (j === i ? gids[i] + " [" + w + "] " : gids[i] + " " + gids[j] + " " + w + " ");
      i = j + 1;
    }
    addObj(dN, "<< /Type /Font /Subtype /CIDFontType2 /BaseFont /" + f.name +
      " /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >>" +
      " /FontDescriptor " + fdN + " 0 R /DW 600 /W [" + wArr.trim() + "] /CIDToGIDMap /Identity >>");
    addObj(fdN, "<< /Type /FontDescriptor /FontName /" + f.name + " /Flags 4" +
      " /FontBBox [" + f.bbox.map(v => Math.round(v * k)).join(" ") + "]" +
      " /ItalicAngle 0 /Ascent " + Math.round(f.asc * k) + " /Descent " + Math.round(f.desc * k) +
      " /CapHeight 700 /StemV " + stemV + " /FontFile2 " + ffN + " 0 R >>");
    addStream(ffN, "<< /Length1 " + f.bytes.length + " >>", f.bytes);
    /* ToUnicode : extraction de texte correcte dans Illustrator / Acrobat */
    const chars = Object.keys(f.gid).filter(ch => f.gid[ch] > 0);
    let tu = "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n" +
      "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n" +
      "/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n";
    for(let c = 0; c < chars.length; c += 100){
      const block = chars.slice(c, c + 100);
      tu += block.length + " beginbfchar\n";
      block.forEach(ch => {
        tu += "<" + _pad4(f.gid[ch]) + "> <" + _pad4(ch.codePointAt(0)) + ">\n";
      });
      tu += "endbfchar\n";
    }
    tu += "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n";
    addStream(tuN, "<< /Length " + tu.length + " >>", tu);
  }

  if(fonts && fonts.reg && fonts.bold){
    for(const f of [fonts.reg, fonts.bold]){
      f.gid = {}; f.w = {};
      for(const ch of USED){
        const g = f.gidFor(ch.codePointAt(0));
        f.gid[ch] = g;
        f.w[ch] = f.aw(g);
      }
    }
    EMB = fonts;
    buildFont(30, fonts.reg, 80);
    buildFont(31, fonts.bold, 120);
  }else{
    addObj(30, "<< /Type /Font /Subtype /Type1 /BaseFont /Arial /Encoding /WinAnsiEncoding >>");
    addObj(31, "<< /Type /Font /Subtype /Type1 /BaseFont /Arial-Bold /Encoding /WinAnsiEncoding >>");
  }

  /* ================= PASSE 2 : pages réelles ================= */
  addObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  let kids = "";
  for(let i = 0; i < 13; i++) kids += (4 + 2 * i) + " 0 R ";
  addObj(2, "<< /Type /Pages /Count 13 /Kids [" + kids + "] >>");
  addObj(3, "<< /Title (Calendrier chevalet " + state.year + ") /Author (Fehmi Calendar Studio) /Creator (Fehmi Calendar Studio) >>");

  for(let i = 0; i < 13; i++){
    res = { gs:{}, sh:{}, im:{} };
    const c = i === 0 ? coverPage(i) : monthPage(i);
    const cn = 5 + 2 * i;
    addStream(cn, "<< /Length " + c.length + " >>", c);
    addObj(4 + 2 * i, pageBody(cn));
  }

  /* --- xref + trailer --- */
  const max = next - 1;
  const startxref = off;
  push("xref\n0 " + (max + 1) + "\n");
  push("0000000000 65535 f \n");
  for(let n = 1; n <= max; n++){
    push(String(offs[n] === undefined ? 0 : offs[n]).padStart(10, "0") + " 00000 n \n");
  }
  push("trailer\n<< /Size " + (max + 1) + " /Root 1 0 R /Info 3 0 R >>\nstartxref\n" + startxref + "\n%%EOF\n");
  return chunks;
}

/* ============================================================
   LANCEMENT DE L'EXPORT
   ============================================================ */
async function exportAI(mode){
  if(exportAI.busy) return;
  exportAI.busy = true;
  const flate = mode === "flate";
  toast(flate
    ? "Génération du .ai en PNG/Flate (plus lourd, ~15 Mo)…"
    : "Génération du fichier .ai (aplatissement des fonds + photos JPEG)…");
  try{
    const imgs = [];
    for(let i = 0; i < 13; i++){
      const el = pagesEl.querySelector('.page[data-i="' + i + '"] .bgimg');
      imgs[i] = el && el.getAttribute("src") ? await _imgToJpeg(el) : null;
    }
    const nPhotos = imgs.filter(Boolean).length;
    /* aplatir chaque fond : dégradé + photo + voiles + carte → un seul raster
       (supprime Shading / ExtGState / clipping path autour des images) */
    for(let i = 0; i < 13; i++){
      const p = state.pages[i];
      const split = p.layout === "split";
      const box = split ? { x: 0, y: 0, w: PW / 2, h: PH } : { x: 0, y: 0, w: PW, h: PH };
      let bmp = null;
      if(imgs[i]) bmp = await createImageBitmap(new Blob([imgs[i].bytes], { type: "image/jpeg" }));
      imgs[i] = await _bakePage(i, box, bmp, flate);
      if(bmp && bmp.close) bmp.close();
    }
    let logo = null;
    if(state.footer.logo){
      const le = pagesEl.querySelector('.page[data-i="1"] .pfoot img');
      if(le) logo = await _imgToJpeg(le);
    }
    let fonts = null;
    try{
      const [a, b] = await Promise.all([_getFont("reg"), _getFont("bold")]);
      if(a && b) fonts = { reg: a, bold: b };
    }catch(e){ /* repli Helvetica */ }
    const chunks = _buildPDF(imgs, logo, fonts);
    const blob = new Blob(chunks, { type: "application/postscript" });
    _download(blob, "calendrier-" + state.year + ".ai");
    const fMsg = (flate ? "photos PNG/Flate" : "photos JPEG") + " — polices Arial, fonds aplatis";
    if(nPhotos === 13){
      toast("✓ .ai exporté — 13/13 photos, " + fMsg);
    }else{
      toast("⚠ .ai exporté — " + nPhotos + "/13 photos intégrées. Fournisseur Wikimedia recommandé pour le CORS. " + fMsg, true);
    }
  }catch(e){
    console.error(e);
    toast("Erreur pendant l'export .ai : " + e.message, true);
  }
  exportAI.busy = false;
}

/* ============================================================
   MODALE D'EXPORT .ai — choix de l'encodage des photos
   ============================================================ */
document.getElementById("aiBtn").onclick = () => document.getElementById("aiModal").classList.add("open");
document.getElementById("aiCancel").onclick = () => document.getElementById("aiModal").classList.remove("open");
document.getElementById("aiJpeg").onclick = () => {
  document.getElementById("aiModal").classList.remove("open");
  exportAI("jpeg");
};
document.getElementById("aiFlate").onclick = () => {
  document.getElementById("aiModal").classList.remove("open");
  exportAI("flate");
};
document.getElementById("aiModal").addEventListener("click", e => {
  if(e.target === document.getElementById("aiModal")) document.getElementById("aiModal").classList.remove("open");
});
