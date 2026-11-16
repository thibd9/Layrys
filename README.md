# Layrys Studio

Application web d'une seule page pour préparer des cartes à collectionner (TCG) avant impression : choix de l'illustration, finitions d'impression simulées en temps réel (holo, dorure, vernis, relief), série de cartes, maquettes 3D, studio d'animation et fichiers pour l'imprimeur.

Tout tourne dans le navigateur, sans serveur. Le travail est enregistré sur l'appareil.

## Parcours

1. **Illustration** : importer ou choisir l'image, la cadrer (centrage automatique sur le sujet).
2. **Finitions** : poser une finition, choisir sa zone (masque), superposer plusieurs masques.
3. **Série** : cartes du set, raretés, taux de tirage, planche d'imposition.
4. **Maquettes** : booster, display, slab gradé, cadre, classeur, en 3D.
5. **Impression** : plans de découpe, contrôle avant impression, export.

En dehors du parcours :

- **Studio** : 25 mouvements de présentation (une carte, plusieurs cartes, deck), enchaînements, décors, quatre types de sol, 12 effets, export vidéo et image.
- **Cadre et texte** : option pour ajouter une bordure, un nom, des textes.
- **Guide** : tutoriel pas à pas.

## Lancer

Ouvrir `index.html` dans un navigateur récent (WebGL requis).

## Construire

Les sources sont dans `src/`. La page est assemblée par deux scripts Python, sans dépendance :

```bash
python3 tools/gen_body.py
```

```bash
python3 build.py
```

```bash
node tools/check.js
```

- `tools/gen_body.py` génère `src/body.html` (structure de la page, icônes).
- `build.py` assemble `src/head.html`, `src/body.html` et les modules JavaScript en `index.html` (autonome) et `page.html` (fragment).
- `tools/check.js` vérifie la syntaxe de l'ensemble et les identifiants utilisés.

## Organisation des sources

| Fichier | Rôle |
| --- | --- |
| `shader.js`, `engine.js` | rendu WebGL de la carte, analyse de l'image, masques |
| `data.js`, `assets.js` | finitions, formats, illustrations d'exemple, dos officiel |
| `app.js`, `extras.js` | logique de l'application, calques, éditeur de zone, série |
| `mock3d.js`, `mock_ui.js`, `mockups.js` | moteur et interface des maquettes 3D |
| `studio.js` | scène d'animation et export vidéo |
| `create.js`, `help.js`, `stack.js`, `tour.js`, `gallery.js` | cadre et texte, aides, pile de calques, guide, bibliothèque |
| `dielines.js`, `pdf.js`, `print.js` | plans de découpe et fichiers d'impression |

Les dossiers `src/v7`, `src/v10`, `src/v11` contiennent d'anciennes versions dont `gen_body.py` reprend encore des fragments.
