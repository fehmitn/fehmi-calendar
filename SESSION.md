# SESSION.md — Reprendre le travail depuis un autre PC

> **But de ce fichier** : tout ce qu'il faut savoir pour continuer ce projet sur une
> nouvelle machine après un `git clone https://github.com/fehmitn/fehmi-calendar.git`.
> Dernière mise à jour : 17 nov. 2026 — l'export .ai a été **supprimé** (voir §4).

---

## 1. Le projet en une phrase

**Studio de calendrier de bureau tunisien « chevalet à spirale »** : application web
en un seul fichier qui génère un calendrier 13 pages (couverture + 12 mois, format
210 × 105 mm) avec jours fériés tunisiens automatiques, photos de fond personnalisables
et export **impression PDF**.

- **Site en ligne (GitHub Pages)** : https://fehmitn.github.io/fehmi-calendar/
- **Dépôt** : https://github.com/fehmitn/fehmi-calendar (public, branche `main`, Pages activé sur `main` / racine)
- **Déploiement** : automatique — **chaque `git push` sur `main` redéploie le site** (attendre 1–2 min).

---

## 2. Fichiers du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | **Toute l'application** (CSS + JS inline, vanilla, aucune dépendance) |
| `README.md` | Doc utilisateur du dépôt |
| `SESSION.md` | Ce fichier (contexte de session) |

Pour tester en local : ouvrir `index.html` dans un navigateur (double-clic suffit).

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
  discrète sous la grille ; week-ends surlignés.
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

## 4. Historique de l'export .ai — pourquoi il a été supprimé

L'application a eu un export **.ai (Illustrator)** : un PDF 1.4 fait main
(`export-ai.js`, supprimé) avec photos JPEG intégrées et polices intégrées. Il
n'a **jamais fonctionné correctement chez l'utilisateur**, malgré plusieurs
tentatives de correction :

1. **Commit `5b98ac2`** — polices Roboto intégrées (Type0/Identity-H/FontFile2/ToUnicode,
   2 passes) → texte **illisible dans Vector Craft** (visionneur vectoriel utilisé
   par l'utilisateur) ; installer Roboto sur la machine a empiré les choses.
2. **Commit `a9b9f97`** — retour au repli Helvetica, puis Helvetica → **Arial**
   (Windows ne fournit pas Helvetica : les visionneurs demandaient sans fin les
   polices manquantes). Le dialogue de polices persistait.
3. **Opérateur PostScript `arc` invalide** dans les cercles des jours fériés (jamais
   dessinés) → corrigé en courbes de Bézier (points visibles, validé MuPDF).
4. **Commit `e129bf4`** — fonds **aplatiss en raster** (canvas) : dégradé + photo +
   voiles + carte rasterisés en un seul JPEG par page, supprimant Shading /
   ExtGState / clipping path (le « calque clipping path collé à l'image » signalé
   par l'utilisateur). Scan vérifié : 0 ExtGState, 0 Shading, 0 clip, 0 arc.
5. Malgré tout : **images toujours invisibles dans Vector Craft**, même avec un
   PDF structurellement minimal (1 image pleine page + texte vectoriel, validé
   indépendamment par MuPDF/PyMuPDF — les pages se rendaient parfaitement).

**Conclusion de l'utilisateur** : Vector Craft ne rend visiblement pas les XObjects
JPEG de ces fichiers. Décision : **suppression complète de l'export .ai**
(fichiers `export-ai.js` et `test/` supprimés, boutons « ✒ Exporter .ai » et
« 🔤 Polices .ai » et la modale des polices retirés de `index.html`).
L'export reste **PDF via `window.print()`** (fiable, utilisé pour l'impression).

> Si un jour on veut re-tenter : le code a existé jusqu'au commit `77e3569`
> (visible dans l'historique git). Le diagnostic PyMuPDF (pip install pymupdf)
> et le harness Node étaient la bonne méthode de validation.

---

## 5. Historique des commits (principal)

| Commit | Contenu |
|---|---|
| `9a4bf98` | Application initiale complète |
| `fc4eafe` | Export .ai + correction mise en page partagée + férié Ramadan |
| `fa0d171` | Correctif CORS des photos (chaîne d'acquisition 4 niveaux + toast N/13) |
| `5b98ac2` | Polices Roboto intégrées dans le .ai (Type0/Identity-H/FontFile2/ToUnicode) |
| `a9b9f97` | Correctifs .ai : arc→Bézier, Helvetica→Arial, modale polices |
| `e129bf4` | Fonds aplatis en raster (canvas) pour Vector Craft |
| `77e3569` | Nettoyage gitignore artefacts de test |
| **suivant** | **Suppression définitive de l'export .ai** |

---

## 6. Notes d'environnement

- Windows PowerShell : pas d'opérateur `&&` (PowerShell 5.1) → utiliser `;`.
- `node` disponible (v22) ; `python` 3.11 disponible (PyMuPDF installé si besoin :
  `python -m pip install pymupdf`).
- Git : identité configurée dans ce dépôt (`fehmitn`, email noreply GitHub).
  Warning bénin « unable to connect to cache daemon » possible, **push OK**.
- Sur un nouveau PC, après `git clone`, **rien à installer** : l'app est statique ;
  tester en ouvrant `index.html`, publier avec
  `git add -A ; git commit -m "…" ; git push`.
- Clés localStorage à connaître (pour débugger) : `chevaletStudio_v1`,
  `chevaletHijri_v2_{annee}`, `chevaletWiki_v1`.

---

## 7. Résumé pour reprendre vite

```bash
git clone https://github.com/fehmitn/fehmi-calendar.git
cd fehmi-calendar
# ouvrir index.html dans le navigateur pour tester
# chaque modification : git add -A ; git commit -m "..." ; git push
# → le site https://fehmitn.github.io/fehmi-calendar/ se met à jour automatiquement
```
