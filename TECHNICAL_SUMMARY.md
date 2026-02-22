# Résumé Technique du Projet - Jeu de Combat de Créatures

## Vue d'Ensemble

Ce projet est un jeu de combat/collection de type Pokémon idle développé en JavaScript vanilla. Le jeu fonctionne entièrement côté client dans le navigateur, sans serveur backend. Il peut être ouvert en **file://** (double-clic sur `index.html`) ou via un serveur HTTP.

**Références** : `.cursor/FILE_MAP.md` (carte des fichiers), `.cursor/TODO.md` (tâches), `.cursor/COMBAT_FORMULAS.md`, `.cursor/DATA_STRUCTURE.md`, `.cursor/DESIGN_SYSTEM.md`.

---

## 1. Architecture et Structure des Fichiers

### Fichiers Sources

| Fichier | Rôle |
|---------|------|
| `index.html` | Point d'entrée, HTML du layout, modals dans `<script type="text/html" id="modals-template">` (injection au load via #modals-root, sans fetch — fonctionne en file:// et avec serveur HTTP). Wrappers globaux (saveGame, loadGame, resetGame, changeZone), init Game au load. Liens CSS : styles.css, compact-popup-style.css. |
| `modals.html` | Copie de référence du HTML des modals (optionnel ; éditer le template dans index.html pour modifier). |
| `styles.css` | Tous les styles CSS du jeu (layout, composants, combat, Pokédex, boutiques). |
| `compact-popup-style.css` | Styles des popups/modals compacts. |
| `game.js` | Classe **Game** — logique métier principale : boucle de jeu, équipe, inventaire, tour, expéditions, quêtes, modals (délégation rendu → uiManager), etc. Délègue à zoneSystem, combatSystem, shopSystem, saveSystem, questSystem, expeditionSystem, towerSystem. |
| `constants.js` | Base de données statique : TYPES, RARITY, MOVES_DB, POKEMON_POOL, POKEMON_SECONDARY_TYPES, TYPE_EFFECTIVENESS, POKEMON_DEFAULT_MOVES, CATCH_RATES, BALLS, HELD_ITEMS, EVOLUTIONS, STATUS_EFFECTS, TEAM_SYNERGIES, COLLECTION_BONUSES, boutiques (POKEMART_ITEMS, SHOP_ITEMS, TOWER_SHOP_ITEMS, DUST_SHOP_ITEMS), quêtes, succès, etc. |
| `Creature.js` | Classes `Creature` et `Egg`. Creature : stats, IV, combat, XP, sérialisation, statuts, ultimes, talents. |
| `pokemonStats.js` | POKEMON_BASE_STATS, getPokemonBaseStats(name, level). Stats de base (Gen 1–4). |
| `formatters.js` | formatNumber, formatTime, getShardKey, etc. |
| `gameManager.js` | Variables globales (game, currentZone, etc.). |
| `toastManager.js` | Classe ToastManager, instance `toast` pour les notifications. |
| `uiManager.js` | Fonctions UI uniquement : showFloatingText, modals (renderEggHatchModalContent, showEggHatchModalUI, showItemSelectModalUI, renderCreatureModalContent, closeEggHatchModalUI, closeCreatureModalUI), panneaux (updateItemsDisplayUI, updateTeamDisplayUI, updatePokeMartDisplayUI, etc.), combat/header (updatePlayerStatsDisplayUI, updateCombatDisplayUI), getPokemonSpriteUrl, getItemIconHTML, switchTab, switchShopSubTab, updateZoneInfo, showZoneTierModal, etc. |
| `shopSystem.js` | Logique boutiques : updatePokeMartDisplayLogic, buyPokeMartItemLogic, updateUpgradesDisplayLogic, updateShopDisplayLogic, updateTowerShopDisplayLogic, updateRecyclerDisplayLogic, recycleShardsLogic, buyShopItemLogic. Game délègue à ces fonctions ; elles appellent les *UI dans uiManager. |
| `combatSystem.js` | Logique de combat : performAttackWithBonusLogic, winCombatLogic, tryCaptureLogic, updateATBLogic, handleCombatLogic, etc. Game délègue à ces fonctions. |
| `saveSystem.js` | Sauvegarde, chargement, export/import, reset (saveGameLogic, loadGameLogic, hardResetLogic, etc.). Clé localStorage : creatureGameSave. |
| `questSystem.js` | Classe Quest et logique des quêtes : generateQuestLogic, addStoryQuestLogic, ensureStoryQuestProgress, checkSpecialQuestsLogic, acceptQuestLogic, claimQuestRewardLogic, buildQuestRewardsSummaryHtml, updateQuestsDisplayLogic. Dépend de STORY_QUESTS, STORY_QUEST_ORDER, STORY_QUEST_GUIDES (constants.js). |
| `expeditionSystem.js` | Logique des expéditions (startExpeditionLogic, claimExpeditionLogic, updateExpeditionsDisplayLogic, etc.). |
| `towerSystem.js` | Logique de la Tour (startTowerRunLogic, buyTowerShopItemLogic, showTowerCompletionModalLogic, etc.). |
| `zoneSystem.js` | Logique des zones (changeZoneLogic, updateZoneSelectorLogic, isZoneUnlockedLogic, etc.). |
| `narrativeData.js` | Données narratives Professeur Chen : INTRO, INTRO_PARTS, INFLATION_RANT, INFLATION_RANT_PARTS, POST_CHOICE_RANT, POST_CHOICE_RANTPARTS, POST_CHOICE_STARTER_RECEIVED, MILESTONE_*, BILLION_*, ACHIEVEMENT_DATA, NARRATIVE_FAKE_STARTERS, NARRATIVE_REAL_STARTERS, NARRATIVE_MILESTONES, CHEN_SPRITE_URL. |
| `narrativeManager.js` | Moteur narratif Professeur Chen : startIntro, giveStarterToPlayer (starter.isStarter = true), startGameEngineOnly, renderPostChoiceContent, finishIntro, scheduleFirstStoryQuestIntro, showFirstStoryQuestIfAny, showStoryQuestIntro, showStoryQuestCompletionSummary (récap quête terminée), showInfoModal (ex. canne à pêche), showMilestoneModal, checkMilestones, startBillionFinale. Overlay narratif (modals avec sprite Chen). |

### Ordre de Chargement

**CSS (head)** : `styles.css` → `compact-popup-style.css`.

**Scripts (head)** : constants.js, formatters.js, pokemonStats.js, creature.js, gameManager.js, narrativeData.js, narrativeManager.js, uiManager.js, shopSystem.js, combatSystem.js, questSystem.js, saveSystem.js, expeditionSystem.js, towerSystem.js, zoneSystem.js.

**Scripts (body)** : toastManager.js, game.js. Puis script inline : wrappers (saveGame, loadGame, resetGame, changeZone) + au load : injection du template #modals-template dans body via #modals-root → new Game() → updateZoneInfo().
Pas de modules ES6 : tout passe par globaux / `window`. Voir `.cursor/FILE_MAP.md` pour la carte détaillée.

---

## 2. Communication Inter-fichiers

Le projet **n'utilise pas de modules ES6** (`import`/`export`). La communication se fait via :

1. **Variables Globales** : Les constantes déclarées avec `const` dans `constants.js` sont automatiquement accessibles globalement.

2. **Objet `window`** : Les classes et fonctions importantes sont explicitement attachées à `window` :
   ```javascript
   // Creature.js
   window.Creature = Creature;
   window.Egg = Egg;
   
   // pokemonStats.js
   window.POKEMON_BASE_STATS = POKEMON_BASE_STATS;
   window.getPokemonBaseStats = getPokemonBaseStats;
   
   // formatters.js
   window.formatNumber = formatNumber;
   window.formatTime = formatTime;
   // etc.
   
   // gameManager.js
   window.game = game;
   window.currentZone = currentZone;
   ```

---

## 3. Système de Données des Pokémon

### 3.1 Données Statiques (Constantes)

Les données qui ne changent pas sont réparties dans plusieurs structures :

#### Types (`TYPES`)
```javascript
const TYPES = {
    FIRE: 'fire', WATER: 'water', GRASS: 'grass', 
    ELECTRIC: 'electric', NORMAL: 'normal', ROCK: 'rock',
    FLYING: 'flying', PSYCHIC: 'psychic', DARK: 'dark',
    STEEL: 'steel', DRAGON: 'dragon', FIGHTING: 'fighting',
    POISON: 'poison', GROUND: 'ground', BUG: 'bug',
    GHOST: 'ghost', ICE: 'ice', FAIRY: 'fairy'
};
```

#### Raretés (`RARITY`)
```javascript
const RARITY = {
    COMMON: 'common',     // 81.5% de chance
    RARE: 'rare',         // 15% de chance
    EPIC: 'epic',         // 3% de chance
    LEGENDARY: 'legendary' // 0.5% de chance
};
```

#### Statistiques de Base (`POKEMON_BASE_STATS`)
```javascript
// pokemonStats.js
const POKEMON_BASE_STATS = {
    'Pikachu': { hp: 35, attack: 55/2, spattack: 40/2, defense: 30/2, spdefense: 50/2, speed: 90/2 },
    // ... 500+ Pokémon (Gen 1 à 4)
};
```

#### Pools de Pokémon (`POKEMON_POOL`)
Définit quels Pokémon sont disponibles par rareté et par type :
```javascript
const POKEMON_POOL = {
    [RARITY.COMMON]: { [TYPES.FIRE]: ['Slugma', 'Magcargo', ...], ... },
    [RARITY.RARE]: { ... },
    [RARITY.EPIC]: { ... },      // Starters, pseudo-légendaires
    [RARITY.LEGENDARY]: { ... }  // Légendaires uniquement
};
```

#### Types Secondaires (`POKEMON_SECONDARY_TYPES`)
```javascript
const POKEMON_SECONDARY_TYPES = {
    'Charizard': TYPES.FLYING,
    'Bulbasaur': TYPES.POISON,
    // ...
};
```

#### Table d'Efficacité des Types (`TYPE_EFFECTIVENESS`)
Matrice définissant les avantages/désavantages de type (1.5x, 0.75x, 0x).

---

### 3.2 Données d'Instance (Classe `Creature`)

Chaque Pokémon capturé est une instance de la classe `Creature` avec :

#### Propriétés Principales
```javascript
class Creature {
    // Identité
    name, type, secondaryType, rarity
    
    // Niveau et expérience
    level, exp, expToNext, prestige, tier
    
    // Statistiques calculées
    maxHp, currentHp, attack, spattack, defense, spdefense, speed
    
    // IVs (Individual Values) - générés aléatoirement à la création
    ivHP, ivAttack, ivSpAttack, ivDefense, ivSpDefense, ivSpeed
    
    // Endurance (système de stamina)
    maxStamina, currentStamina
    
    // Système de combat ATB
    actionGauge, actionThreshold
    
    // Système d'ultime
    ultimateAbility, ultimateCharge, ultimateActive
    
    // Effets de statut
    statusEffect: { type, duration, sourceAttack }
    
    // Talents passifs (Epic/Legendary uniquement)
    passiveTalent
    
    // Objets tenus
    heldItem
    
    // Flags spéciaux
    isEnemy, isShiny, isBoss, isEpic
    
    // Prestige
    prestigeTokens, prestigeBonuses
}
```

#### Calcul des Statistiques
Les stats finales sont calculées via plusieurs multiplicateurs :
```javascript
stat = baseStat × rarityMult × prestigeMult × tierMult × shinyMult × zoneMult × synergyMult
```

---

## 4. Systèmes de Jeu

### 4.1 Système de Combat (ATB - Active Time Battle)
**Logique dans `combatSystem.js`** : `performAttackWithBonusLogic`, `updateATBLogic`, `processPendingAttacksLogic`, `executeCreatureTurnLogic`, `winCombatLogic`, `playerCreatureFaintedLogic`, `tryCaptureLogic`, `triggerAutoCatchLogic`, `handleCombatLogic`, `handleSpecialModeVictoryLogic`. La classe Game délègue à ces fonctions via des wrappers.

- Chaque créature a une jauge d'action (`actionGauge`) qui se remplit selon sa vitesse
- Quand la jauge atteint `actionThreshold` (10000), la créature attaque
- Formule de dégâts :
  ```javascript
  damage = attack * (power / 100) * effectiveness * STAB * critMult * (attack / (attack + defense * 1.5))
  ```

### 4.2 Effets de Statut (`STATUS_EFFECTS`)
```javascript
const STATUS_EFFECTS = {
    NONE, PARALYZED, FROZEN, BURNED, POISONED,
    STUNNED, CONFUSED, SCARED, REINFORCED,
    AGILE, THORNY, ENRAGED, PUNCHER
};
```
Chaque type est associé à un effet de statut via `TYPE_TO_STATUS`.

### 4.3 Talents Passifs
- **Epic Talents** : `EPIC_TALENTS` - 12 talents disponibles
- **Legendary Talents** : `LEGENDARY_TALENTS` - 10 talents exclusifs
- Exemples : `vampire`, `berserker`, `sniper`, `robustesse`, `muraille`

### 4.4 Capacités Ultimes
- Définies dans `POKEMON_ULTIMATE_ABILITIES` (individuelles) et `GENERIC_ULTIMATES` (génériques par rareté)
- Se chargent au fil du combat
- Effets variés : dégâts, soins, buffs, debuffs

### 4.5 Synergies d'Équipe (`TEAM_SYNERGIES`)
Bonus accordés quand l'équipe a plusieurs Pokémon du même type :
```javascript
const TEAM_SYNERGIES = {
    [TYPES.FIRE]: { min: 2, bonus: { attack_mult: 1.10 }, name: "Flamme Intérieure" },
    // ...
};
```

### 4.6 Bonus de collection (`COLLECTION_BONUSES`)
Bonus passifs **"Maillon Faible"** : évolution finale requise par famille, niveau = `min(prestige)` parmi tous les membres. Si un Pokémon manque ou a prestige 0 → bonus famille = 0.

**Source :** `constants.js` (`COLLECTION_BONUSES`), `game.js` (`getCollectionBonuses`, `getCollectionBonusDetails`, `updateCollectionBonusesDisplay`, `switchPokedexSubTab`).

**Familles (évolutions finales uniquement) :**
| Famille | Effet par prestige |
|---------|--------------------|
| Muscle Heads | +1% Critique |
| Poltergeists | +0.5% Life Steal |
| Thieves Guild | +2% Argent |
| Brainiacs | +5% XP |
| Fire Starters | +1% Dégâts |
| Water Starters | +1% PV max |
| Grass Starters | +0.5% Regen PV/tour |

**Application :** `combatSystem.js` (crit_chance, life_steal, hp_regen_per_turn), `game.js` (gold_mult, xp_mult, damage_mult, max_hp_mult via `getPlayerMaxHp`). Affichage dans l'onglet Pokédex → sous-onglet Synergies (sans scroll).

### 4.7 Système d'Évolution (`EVOLUTIONS`)
```javascript
const EVOLUTIONS = {
    'Bulbasaur': { level: 16, evolves_to: 'Ivysaur', new_type: TYPES.GRASS },
    // ... (Évolutions par niveau, pierre, etc.)
};
```
### 4.8 Système de Combat Physique / Spécial
- **Distinction :** Chaque attaque possède une catégorie (`physical` ou `special`).
- **Formule de Dégâts :**
  - Attaque Physique : Utilise `attacker.attack` vs `target.defense`.
  - Attaque Spéciale : Utilise `attacker.spattack` vs `target.spdefense`.
- **Données :**
  - `MOVES_DB` (constants.js) : Contient les définitions des attaques (~90 attaques) avec leur type et catégorie.
  - `POKEMON_DEFAULT_MOVES` : Associe chaque Pokémon à une attaque par défaut optimisée selon ses stats dominantes.
---

## 5. Économie et Progression

### 5.1 Ressources
- **Or** : Monnaie principale
- **Poussière** (`dust`) : Pour achats spéciaux
- **Fragments (Shards)** : Par famille de Pokémon et rareté
- **Jetons de Prestige** : Pour améliorer les stats individuelles

### 5.2 Boosters de stats (`STAT_BOOSTERS`)
- **Single-stat** (Attaque, Défense, Att. Spé., Déf. Spé., Vitesse, PV) : +15 % pendant 10 min ; réutiliser = ajout de durée.
- **Super Potion** : +5 % à toutes les stats, 15 min ; non cumulable avec Potion Max.
- **Potion Max** : +10 % à toutes les stats, 15 min ; non cumulable avec Super Potion.
- Single-stat et Super/Max sont cumulables. Stockage : `activeStatBoosts` (stat, value, endTime, itemId). UI : indicateur ⚡ sur les chips de stats du header + tooltip au survol (nom du boost, %, temps restant).

### 5.3 Boutiques
Logique centralisée dans **`shopSystem.js`** : Game appelle les fonctions *Logic (updatePokeMartDisplayLogic, buyPokeMartItemLogic, updateShopDisplayLogic, etc.) ; shopSystem appelle les *UI dans uiManager pour le rendu.
- **PokéMart** (`POKEMART_ITEMS`) : Potions, balls, objets de soin (pokedollars)
- **Boutique Améliorations** (`SHOP_ITEMS`, pokedollars) : Upgrades, vitamines, boosts, objets tenus
- **Boutique Jetons** (`SHOP_ITEMS`, questTokens) : Boosts, œufs, permanents (XP, emplacements pension)
- **Tour Shop** (`TOWER_SHOP_ITEMS`) : Améliorations permanentes (marques)
- **Recycleur** : Shards → Poussière d'Essence ; **Dust Shop** (`DUST_SHOP_ITEMS`) : Objets contre poussière

### 5.4 Objets Tenus (`HELD_ITEMS`)
```javascript
const HELD_ITEMS = {
    'leftovers': { effect: { heal_percent: 0.02 } },
    'choice_band': { effect: { attack_mult: 0.50, disable_ultimate: true } },
    'life_orb': { effect: { damage_mult: 1.30, self_recoil: 0.10 } },
    // ...
};
```

### 5.5 Zones et Progression (`ZONES`)
Le jeu progresse à travers des zones numérotées avec des ennemis de niveau croissant.

### 5.6 Arènes (`ARENAS`)
Combats spéciaux contre des champions avec des règles particulières.

---

## 6. Systèmes Annexes

### 6.1 Expéditions (`EXPEDITION_DEFINITIONS`)
Missions automatiques pour obtenir des ressources. **Logique :** `expeditionSystem.js` (startExpeditionLogic, claimExpeditionLogic, updateExpeditionsDisplayLogic, etc.).

### 6.2 Quêtes (`QUEST_TEMPLATES`, `STORY_QUESTS`)
Objectifs journaliers et histoire principale. **Logique :** `questSystem.js` (generateQuestLogic, addStoryQuestLogic, ensureStoryQuestProgress, checkSpecialQuestsLogic, acceptQuestLogic, claimQuestRewardLogic, buildQuestRewardsSummaryHtml, updateQuestsDisplayLogic). **Quêtes scénario** : ordre dans STORY_QUEST_ORDER ; définitions STORY_QUESTS (optionnel : requiredSpecies pour creature_captured). Auto-acceptées à l'ajout. Au claim : modal récap (showStoryQuestCompletionSummary) puis délai ~2,5 s et présentation de la suivante par Chen. **Tracking** : starter_level_up, starter_evolved, creature_captured, fusion_completed, evolution_fusion, ultimateUsed, statBoostUsed, vitaminUsed, heldItemEquipped, badgesEarned, etc. Appels checkSpecialQuests dans game.js, combatSystem.js, towerSystem.js, expeditionSystem.js, zoneSystem.js. **Guides** : STORY_QUEST_GUIDES (bouton « ? » onglet Quêtes).

### 6.2.1 Récit Professeur Chen (`narrativeData.js`, `narrativeManager.js`)
- **Intro** : slides (INTRO_PARTS, INFLATION_RANT_PARTS), faux starters puis vrais (Chenipan/Aspicot). Au clic sur un vrai starter : `giveStarterToPlayer` (équipe + ressources), `startGameEngineOnly` (boucle de jeu démarre, stats montent pendant le post-choice).
- **Post-choix** : slides (POST_CHOICE_RANTPARTS ou POST_CHOICE_RANT_PARTS), slide « Voilà, {starter} est à toi ! », puis délai 10 s après « Dès que tu auras accumulé... Allez, au travail ! » (POST_CHOICE_DELAY_MS), puis slides restantes. Sur la slide « Tu vois ce bouton qui affiche tes statistiques ? », le header des stats n’est pas flouté (classe `narrative-stats-visible` sur body).
- **Fin intro** : « C'est parti ! » → `finishIntro` (introComplete, closeOverlay, generateQuest, scheduleFirstStoryQuestIntro). Flag `suppressNextStoryQuestIntro` empêche addStoryQuestLogic d’afficher le modal tout de suite.
- **Première quête scénario** : 10 s après « C'est parti ! » (`FIRST_STORY_QUEST_DELAY_MS`), `showFirstStoryQuestIfAny(game)` affiche le modal Chen pour la première story quest et appelle `switchTab('quests')`. Données : `window.STORY_QUESTS` (éviter référence avant init).
- **Complétion quête scénario** : au claim d'une story quest, `showStoryQuestCompletionSummary` affiche un modal récap (titre, description/dialogue, récompenses) ; après « Continuer », la quête suivante est ajoutée et présentée par Chen après un délai (~2,5 s). Cas spécial (ex. canne à pêche) : `showInfoModal` après le claim.
- **Jalons** (10k, 100k, 1M stats totales) : modals Chen (`showMilestoneModal`). **1 milliard** : BILLION_INTRO, animation, BILLION_OUTRO, achievement « Tout ça pour ça ? ».

### 6.3 Succès (`ACHIEVEMENTS`)
Récompenses pour accomplissements spécifiques. Données dans `constants.js` ; affichage/logique dans `game.js`.

### 6.4 Talents de Compte (`ACCOUNT_TALENTS`)
Améliorations permanentes affectant tout le compte.

### 6.5 Reliques de Tour (`TOWER_RELICS`)
Bonus passifs pour le mode Tour. **Logique Tour :** `towerSystem.js` (startTowerRunLogic, buyTowerShopItemLogic, showTowerCompletionModalLogic, etc.).

### 6.6 Zones et spawn d'ennemis
**Logique :** `zoneSystem.js` — zones : changeZoneLogic, updateZoneSelectorLogic, isZoneUnlockedLogic, isZoneMasteredLogic. **Spawn d'ennemis** : getOrCreateEnemyLogic (Roamer, Boss, Épique, ennemi standard), createBossLogic, createEpicLogic. Game appelle `getOrCreateEnemy()` → délègue à getOrCreateEnemyLogic(game) ; zoneSystem décide quel ennemi apparaît et avec quelles stats.

---

## 7. Configuration du Jeu

### 7.1 Multiplicateurs de Rareté
```javascript
const RARITY_MULTIPLIERS = {
    common: 1.0, rare: 1.1, epic: 1.2, legendary: 1.3
};
```

### 7.2 Vitesses de Jeu (`GAME_SPEEDS`)
Options pour accélérer le jeu (x1, x2, x3, etc.).

### 7.3 Timing du Combat
```javascript
const GAME_SPEEDS = {
    PRE_ATTACK_DELAY: 200,      // Délai avant attaque
    ANIMATION_LOCK: 200,         // Durée de l'animation
    HEALTH_BAR_TRANSITION: '0.2s',
    RESPAWN_DELAY: 1000          // Délai entre ennemis
};
```

---

## 8. Interface Utilisateur

**Rendu UI dans `uiManager.js`** : Game délègue l'affichage à des fonctions *UI (updateCombatDisplayUI, updatePlayerStatsDisplayUI, updateItemsDisplayUI, updateTeamDisplayUI, updatePokeMartDisplayUI, etc.). Les panneaux boutique sont mis à jour par `shopSystem.js` qui appelle ces *UI.

**Modals** : Le HTML des modals est embarqué dans `index.html` dans un bloc `<script type="text/html" id="modals-template">`. Au chargement, le script inline injecte ce contenu dans le body (sans fetch — fonctionne en **file://** et avec un serveur HTTP). Le **rendu** des modals métier (créature, œuf, sélection d'objet) est délégué à `uiManager.js` : `renderCreatureModalContent`, `renderEggHatchModalContent`, `showEggHatchModalUI`, `showItemSelectModalUI`, `closeEggHatchModalUI`, `closeCreatureModalUI`. La **logique** (données, décisions) reste dans Game (`game.js`).

**Fichiers** : `index.html` (layout + template modals), `styles.css` (tous les styles), `compact-popup-style.css` (popups compacts).
- **Toasts** : `toastManager.js` (notifications visuelles)
- **Panels** : Combat, Équipe, Inventaire, Boutique (Épicerie, Améliorations, Jetons, Tour, Recycleur), etc.
- **Floating Combat Text** : `showFloatingText` (uiManager)
- **Indicateur de boosts actifs** : Chips de stats du header avec classe `.stat-chip-boosted` et icône ⚡ ; tooltip au survol (nom, %, temps restant)

---

## 9. Sauvegarde et Sérialisation

La classe `Creature` implémente `serialize()` et `deserialize()` pour la persistance (voir `.cursor/DATA_STRUCTURE.md` pour la forme exacte des champs).

**Sauvegarde du jeu** : gérée dans **`saveSystem.js`** — `saveGameLogic`, `loadGameLogic`, `exportSaveLogic`, `importSaveLogic`, `hardResetLogic`. Clé localStorage : `creatureGameSave`. Game appelle ces fonctions via `saveGame()`, `loadGame()`, etc.

---

## 10. Points d'Attention Techniques

1. **Couplage Fort** : Toutes les dépendances passent par l'objet global `window` (pas de modules ES6).
2. **Architecture modulaire** :
   - **`game.js`** : Classe Game et logique métier ; délègue à `combatSystem.js`, `uiManager.js`, `shopSystem.js`, `saveSystem.js`, `questSystem.js`, `expeditionSystem.js`, `towerSystem.js`, `zoneSystem.js`.
   - **`index.html`** : Layout HTML, modals dans un template `<script type="text/html">` (injection au load), wrappers globaux et init. Fonctionne en **file://** et avec un serveur HTTP.
3. **Pas de Build System** : Code vanilla sans bundler ni transpilation.
4. **Données Statiques** : `constants.js` contient les définitions du jeu (types, moves, pools, boutiques, quêtes, succès, etc.).
5. **Génération 1-4** : Le jeu supporte les Pokémon des 4 premières générations.
6. **Référence IA** : `.cursor/` contient FILE_MAP.md (carte des fichiers), TODO.md (tâches), COMBAT_FORMULAS.md, DATA_STRUCTURE.md, DESIGN_SYSTEM.md.

---

## 11. Diagramme de Dépendances

```
constants.js, formatters.js, pokemonStats.js, Creature.js, gameManager.js
     │
     ├── uiManager.js (UI, panneaux, modals rendu)
     ├── shopSystem.js ──► uiManager (*UI boutique)
     ├── combatSystem.js
     ├── narrativeData.js, narrativeManager.js (récit Professeur Chen)
     ├── questSystem.js, saveSystem.js, expeditionSystem.js, towerSystem.js, zoneSystem.js
     │
     ▼
game.js (Game, logique métier, délégations)
     │
index.html : layout, template modals, wrappers, init (load → injection template → new Game())
```

---

## 12. Glossaire

| Terme | Description |
|-------|-------------|
| ATB | Active Time Battle - système de combat au tour par tour en temps réel |
| IV | Individual Values - bonus statistiques aléatoires uniques à chaque créature |
| STAB | Same Type Attack Bonus - bonus de 20% si l'attaque est du même type que l'attaquant |
| Prestige | Système de rebirth permettant de dépasser le niveau max |
| Tier | Niveau de difficulté des ennemis (multiplicateur de stats) |
| Synergy | Bonus d'équipe activé quand plusieurs Pokémon partagent le même type |
