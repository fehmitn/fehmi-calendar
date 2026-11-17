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

## Utilisation

Ouvrir `index.html` dans un navigateur (Chrome/Edge recommandé), puis **Exporter en PDF (Prêt à imprimer)**.
