# UI Refinement Implementation Plan

**État du projet** : Rounds 3–5 décrits ci-dessous. Fichiers UI actuels : `styles.css`, `compact-popup-style.css`, `index.html`, `uiManager.js`, `game.js`. Référence technique : `TECHNICAL_SUMMARY.md`, `.cursor/FILE_MAP.md`.

---

## Round 3: UI Polish & Consistency

### Objectives
- Add distinct colors for AutoSelect button (ON/OFF).
- Align Ultimate text/button with Pokémon name in HUD.
- Remove decorative window dots from Team, Combat, and Extras panels.

### [Component Name] [styles.css]
#### [MODIFY] [styles.css](file:///c:/Users/David/Desktop/POKETIME%20-%20Copie/styles.css)
- Remove `::before` traffic light dots from `.team-area`, `.combat-area`, and `.secondary-content`.
- Add `.cmd-btn#autoSelectBtn` styles for OFF state (neutral gray-brown) and `.auto-active` for ON state (success green).
- Add `.hud-header-row` container styles to center Ultimate button and Name.
- [x] Refine `.ult-rect-btn` centering.

### [Component Name] [index.html]
#### [MODIFY] [index.html](file:///c:/Users/David/Desktop/POKETIME%20-%20Copie/index.html)
- Wrap `ultimateButton` and `playerCreatureName` in a `<div class="hud-header-row">`.

---

## Round 4: Creature Modal Refinement

### Objectives
- Establish button hierarchy (Primary: Active, Secondary: Neutral, Special: Prestige).
- Improve "Move Category" badge contrast.
- Style IV values as subtle "pills".
- Redesign Close button for a cleaner look.

### [Component Name] [styles.css]
#### [MODIFY] [styles.css](file:///c:/Users/David/Desktop/POKETIME%20-%20Copie/styles.css)
- Update `.move-category.physical` and `.move-category.special` with high-contrast colors (white text).
- Transform `.stat-iv` into a "pill" style with localized background and padding.
- Define `.btn-prestige` for the special prestige action (golden gradient, glow).
- Redesign `.stats-close` as a discrete circular "X" button in the corner.

### [Component Name] [game.js]
#### [MODIFY] [game.js](file:///c:/Users/David/Desktop/POKETIME%20-%20Copie/game.js)
- Update `generateCreatureActionsHTML` to apply the new button classes/styles.
- Use `background: #6b7280` (gray) for storage/pension movements.
- Use the new `.btn-prestige` class for the prestige action.

---

## Round 5: Secondary Content Menu Refinement

### Objectives
- Fix critical contrast issues ("Bonus actuel" text, green on gray).
- Restructure card stats with flexbox (level left, bonus right).
- Simplify descriptions and add icons where appropriate.
- Enhance purchase buttons (vibrant when affordable, gray when not).
- Customize scrollbars to match retro theme.

### [Component Name] [styles.css]
#### [MODIFY] [styles.css](file:///c:/Users/David/Desktop/POKETIME%20-%20Copie/styles.css)
- Fix `.upgrade-stats` contrast: Change "Bonus actuel" text from `#666` to `rgba(255,255,255,0.7)`.
- Restructure `.upgrade-stats` with proper flexbox alignment (level left, effect right).
- Update `.upgrade-level` color to a vibrant orange (`#fb923c`).
- Update `.upgrade-effect` color to a darker green (`#15803d`) for better contrast.
- Enhance `.upgrade-btn` with vibrant gradient when affordable (`linear-gradient(135deg, #3b82f6, #2563eb)`).
- Style disabled `.upgrade-btn` with gray and clear "PAS ASSEZ DE FONDS" text.
- Customize scrollbars for `.secondary-content` with retro brown theme.

### [Component Name] [uiManager.js]
#### [MODIFY] [uiManager.js](file:///c:/Users/David/Desktop/POKETIME%20-%20Copie/uiManager.js)
- Update `updateUpgradesDisplayUI` to use `rgba(255,255,255,0.7)` for "Bonus actuel" text.
- Simplify upgrade descriptions where possible.
- Add icons to upgrade titles for visual clarity.

---

*Dernière mise à jour : aligné avec l’état du projet (fév. 2025).*
