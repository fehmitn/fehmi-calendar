# SESSION.md — Reprendre le travail depuis un autre PC

> **But de ce fichier** : tout ce qu'il faut savoir pour continuer ce projet sur une
> nouvelle machine après un `git clone https://github.com/fehmitn/fehmi-calendar.git`.
> Dernière mise à jour : 17 nov. 2026 — **export .ai réparé (cause racine trouvée)**.

---

## 1. Le projet en une phrase

**Studio de calendrier de bureau tunisien « chevalet à spirale »** : application web
qui génère un calendrier 13 pages (couverture + 12 mois, format 210 × 105 mm) avec
jours fériés tunisiens automatiques, photos de fond personnalisables, export
**impression PDF** et export **Illustrator (.ai)**.

- **Site en ligne (GitHub Pages)** : https://fehmitn.github.io/fehmi-calendar/
- **Dépôt** : https://github.com/fehmitn/fehmi-calendar (public, branche `main`, Pages activé sur `main` / racine)
- **Déploiement** : automatique — **chaque `git push` sur `main` redéploie le site** (attendre 1–2 min).

---

## 2. Fichiers du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | L'application (CSS + JS inline, vanilla, aucune dépendance) |
| `export-ai.js` | Générateur du fichier `.ai` (PDF 1.4 : pages aplaties en raster + texte vectoriel) |
| `test/harness-ai.mjs` | Harness Node : génère 3 `.ai` de test sans navigateur |
| `test/check_ai.py` | Validation **PDFium** (moteur de Chrome) + rendu PNG (pip install pypdfium2) |
| `test/scan_ai.py` | Compte les opérateurs sensibles (ExtGState/Shading/clip/arc) |
| `README.md` | Doc utilisateur |
| `SESSION.md` | Ce fichier |

---

## 3. Fonctionnalités (où ça se trouve dans `index.html`)

- **Année** : champ de sélection, défaut 2027 ; mois en français, semaines lundi→dimanche,
  années bissextiles gérées.
- **Jours fériés fixes tunisiens** (codés en dur) : 01-01 Nouvel An · 03-20 Indépendance ·
  04-09 Martyrs · 05-01 Travail · 07-25 République · 08-13 Femme · 10-15 Évacuation ·
  12-17 Révolution.
- **Jours fériés islamiques** via l'API gratuite AlAdhan :
  `https://api.aladhan.com/v1/gToHCalendar/{mois}/{annee}` (1 appel/mois).
  Détectés par jour/mois hijri : Ras el-Am (1-1 Mouharram), **Début du Ramadan (1-9 Ramadan)**,
  Mouled (12-3 Rabi I), Aïd el-Fitr (1-10 Kawthar/Shawwal), Aïd el-Adha (10-12 Dhu al-Hijja).
  Cache `localStorage` **par année** : clé `chevaletHijri_v2_{annee}` (fonctionne hors ligne
  grâce au repli `Intl.DateTimeFormat("en-u-ca-islamic-c")` → fonction `hijriViaIntl`).
- **Clic sur un jour** → bascule « jour férié » / édition du libellé (modal) ; légende
  discrète sous la grille (petits points de 1,5 mm) ; week-ends surlignés.
- **13 pages** 210 × 105 mm ; zone de reliure Wire-O **18 mm** visible à l'écran,
  masquée à l'impression ; `@page { size: 210mm 105mm; margin: 0; }` ; export via
  `window.print()`.
- **Fonds d'écran** : 3 fournisseurs (bouton de bascule `#provSwitch`) :
  1. **Wikimedia Commons** (défaut, CORS ouvert `*`) — API
     `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={mot-clé}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size&iiurlwidth=1600&format=json&origin=*`
     + filtre paysage ; mots-clés par page (constante `WIKI_KEYWORDS`) ; cache
     `localStorage` clé `chevaletWiki_v1` ; bouton « ⇄ Changer de photo suggérée ».
  2. **Picsum Photos** : `https://picsum.photos/seed/{graine}-{pseed}/1400/700` (CORS non garanti).
  3. **Dégradé** : repli hors ligne (constante `GRADS`).
- **Fond personnalisé** par page (glisser-déposer ou sélection de fichier ; redimensionné
  ≤1600 px, JPEG 0.85, conservé même en changeant d'année) ; curseurs Zoom / X / Y /
  Opacité / Voile sombre ; bouton « ⟲ Rétablir la photo par défaut ».
- **Pied de page société** (logo + raison sociale + tél + site) reproduit sur les 12 mois.
- **2 mises en page** par page : plein écran / partagé 50-50.
- **Sauvegarde automatique** dans `localStorage` : clé `chevaletStudio_v1`.

---

## 4. Export .ai — état actuel et pièges (À LIRE AVANT TOUT DEBUG)

Le bouton « ✒ Exporter .ai (Illustrator) » ouvre une petite modale avec **2 encodages**
pour les photos de fond : **JPEG** (léger) ou **PNG/Flate** (plus lourd, meilleure
compatibilité visionneurs). Le fichier produit est un **PDF 1.4 portant l'extension .ai**.

### Structure du fichier

- En-tête `%PDF-1.4` + commentaire binaire, puis objets : 1 catalogue, 2 pages,
  3 infos, polices 30/31 (Arial/Arial-Bold Type1 WinAnsi), page i → objets `4+2i`
  (Page) et `5+2i` (contenu) ; objets dynamiques à partir du compteur `next = 32`.
- **Chaque page = 1 image raster pleine page** (le fond est *aplati* dans un canvas :
  dégradé + photo avec zoom/position/opacité + voile sombre + voile de couverture +
  carte blanche) + texte/tracés vectoriels opaques par-dessus. **Aucun** Shading,
  ExtGState ou clipping path dans le fichier (vérifiable avec `test/scan_ai.py`).
- `_bakePage()` (canvas, navigateur seulement) : 1600 px de large en JPEG, 1200 px en
  Flate (octets RGB bruts + zlib via `CompressionStream('deflate')` → `/FlateDecode`).
- Les points des jours fériés sont des **cercles de Bézier** (l'opérateur `arc` est du
  PostScript, **invalide en PDF**).

### ⚠ Pièges déjà rencontrés (ne pas les réintroduire)

1. **NEVER oublier l'en-tête `%PDF-1.4`** : MuPDF/Acrobat acceptent son absence, mais
   **PDFium (Chrome, Edge, Vector Craft…) refuse le fichier** (« Data format error »).
   C'était la cause n°1 des « images invisibles ».
2. **Les images PDF sont peintes dans un carré unité (1×1 pt)** : le `cm` doit valoir la
   taille finale en points (`PW × PH` pour un fond pleine page, `logoImg.w*sc × logoImg.h*sc`
   pour un logo). Passer le facteur « points par pixel » (0,372) dessine un point
   minuscule — l'image était donc **invisible depuis le début**, et le dégradé dessiné
   derrière faisait croire à une photo.
3. `arc` (PostScript) est invalide en PDF → utiliser des courbes `c`.
4. Éviter ExtGState/Shading/clip autour des images : les visionneurs légers les gèrent mal.

### Validation (obligatoire après toute modification de `export-ai.js`)

```bash
node test/harness-ai.mjs          # écrit 3 .ai de test dans test/
python test/check_ai.py           # PDFium : ouverture + rendu PNG + pixel central
python test/scan_ai.py            # compte ExtGState/Shading/clip/arc (doit être 0)
```

- **PDFium est la référence** ; MuPDF (`fitz`) est trop tolérant (il ouvrait même les
  fichiers sans en-tête PDF). Ne jamais valider uniquement avec MuPDF.
- Le harness simule l'état par défaut (année 2027, photos picsum) et ne peut pas exécuter
  `_bakePage` (pas de canvas en Node) : la variante `baked` teste la structure, la
  variante `flate` teste l'encodage. Le rendu réel des fonds aplatis se vérifie dans le
  navigateur.
- Le harness retire le bloc « MODALE D'EXPORT .ai » en fin de `export-ai.js` (câblage DOM)
  avant d'exécuter le code dans une `Function`.

---

## 5. Historique des commits (principal)

| Commit | Contenu |
|---|---|
| `9a4bf98` | Application initiale complète |
| `fc4eafe` | Export .ai + correction mise en page partagée + férié Ramadan |
| `fa0d171` | Correctif CORS des photos + toast N/13 |
| `5b98ac2` | Polices Roboto intégrées dans le .ai (Type0/Identity-H) — illisible dans Vector Craft |
| `a9b9f97` | arc→Bézier, Helvetica→Arial |
| `e129bf4` | Fonds aplatis en raster (canvas) |
| `1e3e906` | Suppression provisoire de l'export .ai |
| **suivant** | **Export .ai réparé** : en-tête %PDF, cm des images corrigé, JPEG/Flate au choix, validation PDFium |

---

## 6. Notes d'environnement

- Windows PowerShell : pas d'opérateur `&&` en 5.1 → utiliser `;`.
- `node` v22 (fetch, CompressionStream globaux) ; `python` 3.11 avec `pypdfium2`,
  `pymupdf`, `pikepdf` installables via pip.
- Git : identité configurée dans ce dépôt (`fehmitn`, email noreply GitHub).
- Sur un nouveau PC, après `git clone` : ouvrir `index.html` suffit pour tester ;
  publier avec `git add -A ; git commit -m "…" ; git push`.
- Clés localStorage : `chevaletStudio_v1`, `chevaletHijri_v2_{annee}`, `chevaletWiki_v1`.

---

## 7. Résumé pour reprendre vite

```bash
git clone https://github.com/fehmitn/fehmi-calendar.git
cd fehmi-calendar
# ouvrir index.html dans le navigateur pour tester
# modifier export-ai.js ? → node test/harness-ai.mjs ; python test/check_ai.py ; python test/scan_ai.py
# chaque modification : git add -A ; git commit -m "..." ; git push
# → le site https://fehmitn.github.io/fehmi-calendar/ se met à jour automatiquement
```
