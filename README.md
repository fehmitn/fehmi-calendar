# Fehmi Calendar — Studio Chevalet

Studio de création de **calendrier de bureau chevalet à spirale** (210 × 105 mm, 13 pages : couverture + 12 mois) — HTML5, CSS3, JavaScript vanilla, zéro dépendance (`index.html` + `export-ai.js`).

## Fonctionnalités

- **Année modifiable** (défaut 2027) avec recalcul complet : mois en français, années bissextiles, semaines débutant le lundi
- **Jours fériés tunisiens fixes** intégrés pour toute année
- **Fêtes islamiques automatiques** via l'API gratuite AlAdhan (Aïd el-Fitr, Aïd el-Adha, Ras el-Am, Mouled, **Début du Ramadan**), cache localStorage, fallback hors-ligne (calendrier hégirien Intl)
- **Langue des jours fériés** : bascule **Français / العربية** dans la barre latérale (les libellés saisis à la main ne sont jamais traduits). Portée actuelle : **noms des fériés seulement** ; l'option « tout le calendrier » (mois, jours de la semaine, chiffres) est prévue mais pas encore disponible — et l'export `.ai` reste en français pour l'instant.
- **Édition au clic** de chaque jour : activer/désactiver le statut « férié », éditer le libellé (décalage lunaire)
- **Images de fond par défaut** au choix : Wikimedia Commons (recherche thématique, sans clé API, filtre paysage) / Picsum Photos / Dégradé CSS hors-ligne — bouton « Changer de photo suggérée » par page
- **Import personnalisé** par page (drag & drop ou sélecteur), curseurs Zoom / Position X / Y / Opacité / Voile sombre
- **2 mises en page** : Plein écran (bloc calendrier semi-transparent) ou Split 50/50
- **Pied de page société** (logo, nom, téléphone, site) répliqué sur les 12 mois
- **Zone reliure Wire-O 18 mm** affichée à l'écran, masquée à l'impression
- **Export PDF** prêt pour l'imprimeur : `@page { size: 210mm 105mm; margin: 0; }` via `window.print()`
- **Export .ai (Illustrator)** : PDF 13 pages, texte/tracés vectoriels, photos intégrées — au choix en JPEG (léger) ou PNG/Flate (compatibilité visionneurs)
- Sauvegarde automatique de tous les réglages dans le localStorage

## Langue des jours fériés (Français / العربية)

Dans la barre latérale, section **« Fêtes & jours fériés »** :

- **Langue du calendrier** : `Français` ou `العربية` — le changement est immédiat et mémorisé.
- **Portée** : `Fériés seulement` (actif aujourd'hui) ou `Tout le calendrier` (grisé, prévu plus tard).

Concrètement, seuls les **noms des jours fériés** changent de langue (légende sous la grille,
infobulles, éditeur de jour), y compris dans l'**export PDF navigateur**. Les libellés que
vous avez saisis vous-même ne sont jamais traduits.

> Limites connues : l'export `.ai` reste en **français** (Arial n'a pas de glyphes arabes),
> et les noms de mois / jours de la semaine ne sont pas encore traduits.

## Tests (développement)

```bash
node test/check_labels.mjs      # toutes les traductions arabes présentes
node test/bake_geometry.mjs    # géométrie du fond aplati (miroir Y)
node test/harness-ai.mjs       # génère 3 .ai de test
python test/check_ai.py        # PDFium (moteur Chrome) : ouverture + rendu
python test/scan_ai.py         # 0 ExtGState / Shading / clip / arc
```

## Utilisation

Ouvrir `index.html` dans un navigateur (Chrome/Edge recommandé), puis **Exporter en PDF (Prêt à imprimer)**.

Le site est aussi en ligne : **https://fehmitn.github.io/fehmi-calendar/** — chaque `git push`
sur `main` redéploie automatiquement GitHub Pages (1–2 min).
