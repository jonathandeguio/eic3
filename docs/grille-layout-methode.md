# Méthode de grille de page — EIC³
## Système de blocs `g-row` / `g-col`

---

## 1. Principe général

La page est organisée en une grille de **lignes** (`g-row`) et de **colonnes** (`g-col`).
Ces deux classes sont des **marqueurs sémantiques purs** : elles n'imposent aucun style visuel.
L'affichage reste piloté par les classes métier existantes (`.hero`, `.card`, `.stats`, etc.).

**Règle fondamentale : un `g-col` ne contient jamais un autre `g-col`.**
Chaque `g-col` est une feuille (leaf node) du système de grille.

---

## 2. Règles de structure HTML

### 2.1 Ligne (`g-row`)
- Représente un groupe horizontal de blocs.
- Peut être posé sur un élément HTML existant (ex. `section.hero`, `div.two-col`) ou sur un `div` neutre.
- Placé à n'importe quel niveau de profondeur dans le DOM ; le script le retrouve par traversée ascendante.

### 2.2 Colonne / bloc (`g-col`)
- Représente une zone de contenu textuel ou visuel.
- Peut être posé sur un élément HTML existant (ex. `header.header`, `footer.footer`, `div.container`, `div.card`) ou sur un `div` neutre.
- **Ne contient aucun autre `g-col`.**
- Lorsque l'élément porteur a `position: fixed` (header), la détection de fond et les coordonnées sont calculées sans `pageYOffset`.

### 2.3 Cas particuliers actuels

| Situation | Solution appliquée |
|---|---|
| Header `position: fixed` | `g-col` posé sur `header.header` directement (le wrapper `div.g-row` a hauteur zéro mais compte dans l'ordre DOM) |
| Hero (fond derrière le header fixe) | `g-row`/`g-col` placés à l'intérieur de `section.hero`, sur `div.container`, pour que le bloc commence après le `padding-top: 140px` |
| Footer fond sombre | `g-col` posé sur `footer.footer` directement, pour que `getEffectiveBg` remonte jusqu'au `background: navy` |
| Stats (4 cols, fond navy) | `g-col` combiné avec `.stat` sur le même élément ; le fond navy remonte depuis `.g-row.stats-band` |
| Cards (3 cols, CSS grid) | `g-col` combiné avec `.card` ; le `g-row` est posé sur `.cards.cards--3` qui reste une CSS grid |

---

## 3. Convention de nommage (mode DEV)

```
page . numéro-ligne . numéro-colonne
```

- **page** : nom du fichier HTML sans extension, extrait de `location.pathname`.
- **numéro-ligne** : position du `g-row` parent parmi TOUS les `g-row` du document, dans l'ordre DOM (1-based). Ajouter un `g-row` avant d'autres renumérote automatiquement la suite.
- **numéro-colonne** : `0` si le `g-col` est seul dans son `g-row`, sinon `1, 2, 3…` de gauche à droite.

Exemples sur index.html :

| Nom | Contenu |
|---|---|
| `index.1.0` | Header |
| `index.2.0` | Texte hero |
| `index.3.1` à `index.3.4` | 4 statistiques |
| `index.4.0` | Intro "Nos piliers" |
| `index.5.1` à `index.5.3` | 3 cartes |
| `index.6.1` | Texte "Pourquoi EIC³" |
| `index.6.2` | Liste features |
| `index.7.0` | CTA |
| `index.8.0` | Footer |

---

## 4. Mode DEV (Ctrl+Shift+D)

- Encadrement de chaque `g-col` avec outline 2px.
- Couleur automatique : blanc si fond sombre, noir si fond clair (calcul de luminance relative WCAG).
- Coin haut-gauche : coordonnées absolues `x: y:` dans le document.
- Centre haut : identifiant `page.ligne.col`.
- Badge fixe en bas à droite rappelant le raccourci.
- Désactivation : second appui sur `Ctrl+Shift+D` → restore tous les styles modifiés.

---

## 5. Carte de la page index actuelle

```
┌─────────────────────────────────────────────────────┐
│ index.1.0  — Header (position: fixed)               │
├─────────────────────────────────────────────────────┤
│                    section.hero                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ index.2.0  — Texte hero (div.container)       │  │
│  └───────────────────────────────────────────────┘  │
├──────────┬──────────┬──────────┬────────────────────┤
│index.3.1 │index.3.2 │index.3.3 │index.3.4           │
│  Stat 1  │  Stat 2  │  Stat 3  │  Stat 4            │
├─────────────────────────────────────────────────────┤
│ index.4.0  — Intro Nos Piliers                      │
├──────────────────┬──────────────────┬───────────────┤
│   index.5.1      │   index.5.2      │  index.5.3    │
│   MoveToAI       │   MoveToData     │  Accomp.      │
├──────────────────────────┬──────────────────────────┤
│  index.6.1               │  index.6.2               │
│  Texte Pourquoi EIC³     │  Features list           │
├─────────────────────────────────────────────────────┤
│ index.7.0  — CTA Diagnostique gratuit               │
├─────────────────────────────────────────────────────┤
│ index.8.0  — Footer (position: static, fond navy)   │
└─────────────────────────────────────────────────────┘
```

---

## 6. Propositions d'amélioration

### 6.1 Nommage — ajouter un niveau "section"

**Problème actuel :** les lignes 4 et 5 (intro piliers + cards) appartiennent visuellement à la même section, mais sont numérotées en séquence globale. Difficile de repérer leur parenté.

**Proposition :** introduire un troisième marqueur optionnel `g-section` pour regrouper des `g-row` liés :

```html
<div class="g-section" data-name="piliers">
  <div class="g-row">...</div>  <!-- index.piliers.1.0 -->
  <div class="g-row">...</div>  <!-- index.piliers.2.1 ... -->
</div>
```

Nom résultant : `page.section.ligne.colonne` → `index.piliers.1.0`, `index.piliers.2.3`.

---

### 6.2 Attribut `data-block-name` pour nommage explicite

**Problème actuel :** le nom est 100 % calculé (page.ligne.col), opaque pour un développeur qui lit le HTML.

**Proposition :** permettre un nom lisible optionnel via attribut :

```html
<div class="card g-col" data-block-name="card-movetoai">
```

Affichage en mode DEV : `index.5.1 | card-movetoai` (identifiant + nom humain).

---

### 6.3 Variantes de colonnes (`g-col--*`)

**Problème actuel :** toutes les colonnes ont `flex: 1` (largeur égale). Impossibles à pondérer sans CSS inline.

**Proposition :** classes de proportion dans le CSS :

```css
.g-col--2  { flex: 2; }   /* double largeur */
.g-col--3  { flex: 3; }
.g-col--1-3 { flex: 0 0 33.333%; }   /* tiers fixe */
.g-col--2-3 { flex: 0 0 66.666%; }   /* deux tiers fixe */
.g-col--auto { flex: 0 0 auto; }      /* taille du contenu */
```

---

### 6.4 Breakpoints déclarés dans le HTML

**Problème actuel :** le comportement responsive est invisible dans le HTML et dans le mode DEV.

**Proposition :** attribut `data-stack` sur le `g-row` pour déclarer le breakpoint de bascule :

```html
<div class="g-row" data-stack="768">   <!-- passe en colonne sous 768px -->
  <div class="g-col">...</div>
  <div class="g-col">...</div>
</div>
```

En mode DEV, afficher un badge `⇥ 768px` sur le `g-row` pour rendre le responsive visible.
CSS généré ou déclaré : `.g-row[data-stack="768"] { @media (max-width: 768px) { flex-direction: column; } }`.

---

### 6.5 Gap et espacement déclaratifs

**Problème actuel :** les espaces entre colonnes sont gérés dans les classes métier (`.cards { gap: 28px }`), couplant le layout à la sémantique.

**Proposition :** variables CSS sur le `g-row` :

```html
<div class="g-row" style="--g-gap: 28px;">
```

```css
.g-row { gap: var(--g-gap, 0); }
```

---

### 6.6 Mode DEV amélioré — panneau latéral

**Problème actuel :** les informations (nom, coords) sont affichées directement sur les blocs, ce qui peut masquer le contenu.

**Proposition :** en mode DEV, ouvrir un **panneau latéral rétractable** qui liste tous les blocs avec :
- Nom, coordonnées, dimensions (largeur × hauteur)
- Couleur de fond détectée
- Lien cliquable qui scrolle vers le bloc et le met en surbrillance

---

### 6.7 Export de la grille

**Proposition :** en mode DEV, touche `Ctrl+Shift+E` pour exporter un JSON de la grille :

```json
{
  "page": "index",
  "blocks": [
    { "id": "index.1.0", "x": 0, "y": 0, "w": 1440, "h": 68, "bg": "#ffffff" },
    { "id": "index.2.0", "x": 152, "y": 140, "w": 1136, "h": 420, "bg": "#1A3A6B" },
    ...
  ]
}
```

Utilisable pour générer automatiquement des maquettes, des tests de régression visuelle ou de la documentation.

---

### 6.8 Applicabilité générique

Pour appliquer cette approche à n'importe quelle page front-end :

1. **Ajouter** les classes `.g-row` et `.g-col` dans le CSS global (fichier partagé ou design-token).
2. **Poser** `g-row` sur chaque conteneur horizontal existant (section, flex-container, grid-container).
3. **Poser** `g-col` sur chaque zone de contenu feuille — jamais sur un élément qui contient un autre `g-col`.
4. **Inclure** le script de mode DEV dans un bundle séparé chargé uniquement en développement (`NODE_ENV !== 'production'`).
5. **Adopter** la convention de nommage `page.ligne.col` dans tous les tickets, maquettes et PR pour parler d'un bloc sans ambiguïté.
