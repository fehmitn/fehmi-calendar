# SESSION.md — Reprendre le travail depuis un autre PC

> **But de ce fichier** : tout ce qu'il faut savoir pour continuer ce projet sur une
> nouvelle machine après un `git clone https://github.com/fehmitn/fehmi-calendar.git`.
> Dernière mise à jour : 17 nov. 2026 — commit `5b98ac2`.

---

## 1. Le projet en une phrase

**Studio de calendrier de bureau tunisien « chevalet à spirale »** : application web
en un seul fichier qui génère un calendrier 13 pages (couverture + 12 mois, format
210 × 105 mm) avec jours fériés tunisiens automatiques, photos de fond personnalisables,
export **impression PDF** et export **Illustrateur (.ai)**.

- **Site en ligne (GitHub Pages)** : https://fehmitn.github.io/fehmi-calendar/
- **Dépôt** : https://github.com/fehmitn/fehmi-calendar (public, branche `main`, Pages activé sur `main` / racine)
- **Déploiement** : automatique — **chaque `git push` sur `main` redéploie le site** (attendre 1–2 min).

---

## 2. Fichiers du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | **Toute l'application** (CSS + JS inline, vanilla, aucune dépendance) |
| `export-ai.js` | Générateur du fichier `.ai` (PDF 1.4 + polices TTF intégrées + photos JPEG intégrées) |
| `README.md` | Doc utilisateur du dépôt |
| `SESSION.md` | Ce fichier (contexte de session) |

Pour tester en local : ouvrir `index.html` dans un navigateur (double-clic suffit ;
l'export .ai nécessite un accès réseau pour les polices/photos).

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

## 4. Export .ai — fonctionnement technique (`export-ai.js`)

Un `.ai` est un **PDF 1.4 avec extension .ai** : Illustrator l'ouvre nativement
(textes et tracés éditables). Structure :

- Constantes : `MMPT = 72/25.4`, page `PW = 595.28 × PH = 297.64` pt.
- Objet catalogue 1, pages 2, infos 3, polices **30/31**, page i → objets `4+2i` (Page) et
  `5+2i` (contenu) ; objets dynamiques à partir du compteur `next`.
- **Génération en deux passes** : passe 1 « sèche » (`DRY=true`) collecte les caractères
  utilisés (Set `USED`) sans écrire d'objets ; passe 2 génère le vrai contenu.
- **Polices intégrées — ⚠ DÉSACTIVÉES depuis le 17 nov. 2026** (retour au repli
  Helvetica Type1 WinAnsi, comportement d'origine) :
  **Vector Craft** (visionneur vectoriel de l'utilisateur) rend le texte **illisible**
  avec les polices Type0/Identity-H + FontFile2 intégrées, et installer Roboto sur la
  machine a empiré le problème. `_getFont` dans `export-ai.js` retourne donc toujours
  `null` (code TTF conservé mais désactivé, voir commentaire). Le texte du .ai est
  écrit en **Helvetica/Helvetica-Bold Type1** — substitution automatique par tous les
  visionneurs (Arial etc.), texte toujours lisible et éditable.
  Le bouton 🔤 Polices .ai (modale `#fontModal` dans `index.html`) a été rewordé :
  il explique qu'**aucune installation n'est nécessaire** et déconseille d'installer
  des polices pour le .ai ; liens Roboto/DejaVu conservés au cas où.
- **Photos intégrées** : chaîne d'acquisition CORS à 4 niveaux `_imgToJpeg` :
  1. `fetch` → `createImageBitmap` → canvas → JPEG baseline ≤1600 px (qualité 0.9),
  2. `Image` avec `crossOrigin="anonymous"` → canvas,
  3. octets JPEG bruts en passage direct (dimensions lues via marqueurs SOF),
  4. `null` → dégradé seul.
  Image en `/XObject /Subtype /Image /Filter /DCTDecode /DeviceRGB`, recadrée
  « object-fit: cover » avec le zoom/décalage de l'utilisateur.
- **Toast final** : « ✓ .ai exporté — 13/13 photos… polices Arial (compatibilité
  maximale) » ou « ⚠ N/13 photos… » → **ce nombre est l'outil de diagnostic principal**.
- **Corrections du 17 nov. 2026 (non encore validées par l'utilisateur)** :
  1. `circle()` utilisait l'opérateur PostScript `arc` — **invalide en PDF** → remplacé
     par 4 courbes de Bézier (kappa 0.5523). Les points des jours fériés n'étaient
     donc **jamais dessinés** dans le .ai ; un visionneur strict (Vector Craft ?)
     pouvait décrocher sur cette erreur. Validé : le rendu MuPDF ne signale plus rien
     et les points apparaissent (test/harness-ai.mjs + test/check_ai.py).
  2. BaseFont Helvetica → **Arial** : Windows ne fournit pas Helvetica → les
     visionneurs affichaient un dialogue « polices manquantes » sans fin. Arial est
     métriquement identique et présente sur Windows/macOS/iOS.
  3. Harness Node + Python **récréés dans `test/`** (SESSION.md §4 décrivait le
     principe) : `node test/harness-ai.mjs` génère `test/calendrier-test.ai`
     (photo picsum réelle, polices Helvetica→null) ; `python test/check_ai.py`
     (PyMuPDF, installé) liste les XObjects et rend les pages 1-2 en PNG.
- Le logo du pied de page est aussi intégré (même chaîne).

### Harness de test Node (à recréer si besoin)
`node --check export-ai.js` pour la syntaxe. Pour tester la génération sans navigateur :
lire `export-ai.js`, retirer la dernière ligne
(`document.getElementById("aiBtn").onclick…`), l'exécuter via `new Function` en passant
des stubs (`state`, `MONTHS`, `DOW`, `GRADS`, `daysIn`, `firstDow`, `holidayFor`,
`monthHolidays`, `toast`, `pagesEl`, `atob`, `Image`, `document`, `fetch`, `URL`, `Blob`,
`createImageBitmap`) ; Node ≥ 18 a `fetch` global. Le dernier harness validé :
fonts Roboto réelles + JPEG réel 1920×1080 → PDF 1,58 Mo, 2 Type0 + 2 FontFile2 +
2 ToUnicode, xref 79 objets tous valides, repli Helvetica OK.

---

## 5. Historique des commits

| Commit | Contenu |
|---|---|
| `9a4bf98` | Application initiale complète |
| `fc4eafe` | Export .ai + correction mise en page partagée + férié Ramadan |
| `fa0d171` | Correctif CORS des photos (chaîne d'acquisition 4 niveaux + toast N/13) |
| `5b98ac2` | **Polices Roboto intégrées dans le .ai** (Type0/Identity-H/FontFile2/ToUnicode, 2 passes) |

---

## 6. ⚠ Sujet en cours — images invisibles dans le fichier .ai

L'utilisateur a signalé : « les images n'apparaissent pas dans le fichier ai » alors
qu'elles sont visibles dans le PDF d'impression. **Pas encore confirmé corrigé.**
Depuis, nouveau retour : dans **Vector Craft**, le texte du .ai devenait **illisible**
(polices Type0 intégrées) et installer Roboto empirait les choses → **les polices
intégrées ont été désactivées** (voir section 4). Avec le fichier en polices non
intégrées, Vector Craft **demandait toujours des polices** (Helvetica absente de
Windows) → correction Arial (section 4, correction 2). Les images invisibles ont
deux suspects corrigés/à retester : l'opérateur `arc` invalide (correction 1) et
éventuellement la transparence ExtGState. **En attente du retour utilisateur après
Ctrl+F5 + nouvel export .ai.**

Hypothèses par ordre de probabilité :
1. **Cache navigateur** : l'utilisateur a peut-être testé une ancienne version → lui faire
   faire **Ctrl+F5** puis ré-exporter.
2. **Fournisseur Picsum** : CORS non garanti → recommander le fournisseur **Wikimedia**
   avant l'export.
3. **Comportement Illustrator** : à l'ouverture d'un PDF multipage, Illustrator n'ouvre
   **que la 1ʳᵉ page** par défaut ; vérifier la couverture. Essayez aussi
   Fichier > Ouvrir en choisissant explicitement une page.

**Prochaine étape** : demander à l'utilisateur le nombre affiché dans le toast
(« N/13 photos intégrées »). Si 13/13 et photos quand même invisibles dans Illustrator →
investiguer les particularités PDF d'Illustrator ; possibilité de valider le fichier avec
`qpdf --check`, `mutool` ou `pip install pypdf` (aucun de ces outils n'était présent sur
le PC d'origine ; les vérifications ont été faites via un harness Node maison).

---

## 7. Idées d'améliorations futures (non demandées)

- **Sous-ensemble des polices** : le .ai fait ~1,6 Mo car les 2 TTF Roboto complets sont
  intégrés (~300 Ko chacun). On pourrait générer un TTF réduit aux glyphes utilisés.
- Sous-ensemble d'images (recadrage exact) pour réduire encore le fichier.
- Traduction arabe des fériés / interface AR.

---

## 8. Notes d'environnement (PC d'origine)

- Windows PowerShell **5.1** : pas d'opérateur `&&` → utiliser `;` ou
  `if($LASTEXITCODE -eq 0){ ... }`.
- `node` disponible (v24, `fetch` global) — pratique pour tester le générateur PDF.
- Git affiche un warning bénin « unable to connect to cache daemon » mais **push OK**.
- Dossier de travail d'origine : `C:\calendar` (pas un dépôt git au départ ; l'init a été
  fait avec le remote GitHub ci-dessus).
- Sur le nouveau PC, après `git clone`, il n'y a **rien d'autre à installer** :
  l'app est statique ; tester en ouvrant `index.html`, publier avec
  `git add -A ; git commit -m "…" ; git push`.
- Clés localStorage à connaître (pour débugger) : `chevaletStudio_v1`,
  `chevaletHijri_v2_{annee}`, `chevaletWiki_v1`.

---

## 9. Résumé pour reprendre vite

```bash
git clone https://github.com/fehmitn/fehmi-calendar.git
cd fehmi-calendar
# ouvrir index.html dans le navigateur pour tester
# chaque modification : git add -A ; git commit -m "..." ; git push
# → le site https://fehmitn.github.io/fehmi-calendar/ se met à jour automatiquement
```

Prochaine action attendue : **retour utilisateur sur le toast N/13 après export .ai**
(voir section 6), puis suite selon le diagnostic.
