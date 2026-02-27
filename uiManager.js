/**
 * @file uiManager.js
 * Fonctions purement liées à l'interface utilisateur (DOM, animations, modals).
 * Aucune logique de jeu ici — uniquement de l'affichage.
 * 
 * Dépendances globales attendues :
 * - ALL_ITEMS (constants.js)
 * - POKEMON_BASE_STATS (pokemonStats.js)
 * - POKEMON_SPRITE_IDS (constants.js) — optionnel pour getPokemonSpriteUrl
 * - STATUS_EFFECTS (constants.js) — pour STATUS_ICONS si déplacé plus tard
 * - game (gameManager.js) — pour togglePension
 * - formatNumber (formatters.js)
 * - getShardKey (formatters.js)
 * - POKEMART_ITEMS, SHOP_ITEMS, TOWER_SHOP_ITEMS, DUST_SHOP_ITEMS, DUST_CONVERSION_RATES, POKEMON_POOL, RARITY (constants.js)
 */

// Icônes des effets de statut (combat)
const STATUS_ICONS = (typeof STATUS_EFFECTS !== 'undefined') ? {
    [STATUS_EFFECTS.PARALYZED]: '⚡',
    [STATUS_EFFECTS.FROZEN]: '❄️',
    [STATUS_EFFECTS.BURNED]: '🔥',
    [STATUS_EFFECTS.POISONED]: '☣️',
    [STATUS_EFFECTS.STUNNED]: '😵',
    [STATUS_EFFECTS.CONFUSED]: '❓',
    [STATUS_EFFECTS.SCARED]: '😨',
    [STATUS_EFFECTS.REINFORCED]: '🛡️',
    [STATUS_EFFECTS.AGILE]: '💨',
    [STATUS_EFFECTS.THORNY]: '🌵',
    [STATUS_EFFECTS.ENRAGED]: '😡',
    [STATUS_EFFECTS.PUNCHER]: '🥊'
} : {};

// ============================================================
// FLOATING TEXT (Texte flottant de combat)
// ============================================================

/**
 * Affiche un texte flottant animé (dégâts, soins, etc.)
 * @param {string} text Le texte à afficher
 * @param {HTMLElement} targetContainer Le conteneur parent
 * @param {string} type La classe CSS additionnelle (ex: 'damage', 'heal')
 * @param {boolean} isCritical Si true, applique le style critique
 */
function showFloatingText(text, targetContainer, type = '', isCritical = false) {
    if (!targetContainer) return;

    const textElement = document.createElement('div');

    // Ajout de la classe critique pour le style
    const critClass = isCritical ? ' ft-crit' : '';
    textElement.className = `floating-text ${type}${critClass}`;

    // Contenu : Texte simple + petit indicateur
    let content = text;
    if (isCritical) content = `${text}`;
    else if (type.includes('heal')) content = `+${text}`;

    textElement.textContent = content;

    // Positionnement : si ft-from-rj, partir du bas du conteneur (ex. bloc Jeton Rocket)
    if (type.includes('ft-from-rj')) {
        textElement.style.left = '22%';
        textElement.style.bottom = '0';
        textElement.style.transform = 'translateX(-50%)';
    } else {
        const randomOffset = (Math.random() * 40) - 20;
        textElement.style.left = `calc(50% + ${randomOffset}%)`;
        const randomBottom = 40 + (Math.random() * 20);
        textElement.style.bottom = `${randomBottom}px`;
    }

    targetContainer.appendChild(textElement);

    // Nettoyage automatique
    setTimeout(() => {
        if (textElement.parentElement) {
            textElement.parentElement.removeChild(textElement);
        }
    }, 1000); // Durée alignée avec l'animation CSS float-fade
}

// ============================================================
// FERMETURE DE MODALS
// ============================================================

function closeSynergyModal() {
    const modal = document.getElementById('synergyModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function closeSynergyListModal() {
    const modal = document.getElementById('synergyListModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function closeOfflineModal() {
    const modal = document.getElementById('offlineModal');
    if (modal) modal.style.display = 'none';
}

// ============================================================
// NAVIGATION PAR ONGLETS
// ============================================================

/**
 * Change l'onglet actif dans l'interface principale.
 * @param {string} tabName - Le nom de l'onglet (sans le suffixe 'Tab')
 */
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const targetBtn = (event && event.target && event.target.classList.contains('tab-btn'))
        ? event.target
        : Array.from(buttons).find(btn => (btn.getAttribute('onclick') || '').indexOf("'" + tabName + "'") !== -1);
    if (targetBtn) targetBtn.classList.add('active');
}

// switchShopSubTab reste dans index.html car elle contient de la logique métier (game.updateXXXDisplay)

// ============================================================
// ANIMATION DE CAPTURE (Pokéball)
// ============================================================

/**
 * Joue l'animation de capture avec la ball et les secousses.
 * @param {string} ballImage - URL de l'image de la ball
 * @param {HTMLElement} spriteElement - L'élément du sprite Pokémon
 * @param {boolean} success - Si la capture réussit
 * @param {number} shakesCount - Nombre de secousses (1-3)
 * @returns {Promise} Résolu quand l'animation est terminée
 */
async function playCaptureSequence(ballImage, spriteElement, success, shakesCount = 3) {
    return new Promise(resolve => {
        const container = spriteElement.parentElement;
        if (!container) { resolve(); return; }

        const ball = document.createElement('img');
        ball.src = ballImage;
        ball.className = 'flying-ball';

        // Position
        ball.style.bottom = '10px';
        ball.style.left = '50%';
        ball.style.marginLeft = '-32px';
        ball.style.opacity = '0';

        container.appendChild(ball);

        // Force Reflow
        void ball.offsetWidth;

        // --- PHASE 1 : LANCER (0.75s) ---
        ball.style.opacity = '1';
        ball.classList.add('anim-throw');

        // --- PHASE 2 : IMPACT (à 750ms) ---
        setTimeout(() => {
            if (spriteElement) spriteElement.classList.add('absorbed');
            ball.classList.add('grounded');
            ball.classList.remove('anim-throw');
            ball.classList.add('anim-bounce');
        }, 750);

        // --- PHASE 3 : SECOUSSES (à 1350ms) ---
        setTimeout(async () => {
            const shake = (cls) => new Promise(r => {
                ball.classList.remove('anim-bounce', 'anim-shake-1', 'anim-shake-2', 'anim-shake-3');
                void ball.offsetWidth;
                ball.classList.add(cls);
                setTimeout(r, 900);
            });

            // On joue simplement le nombre de shakes calculés
            if (shakesCount >= 1) await shake('anim-shake-1');
            if (shakesCount >= 2) await shake('anim-shake-2');
            if (shakesCount >= 3) await shake('anim-shake-3');

            // --- PHASE 4 : RÉSULTAT ---
            if (success) {
                ball.classList.add('anim-lock');
                const star = document.createElement('div');
                star.textContent = '✨';
                star.style.position = 'absolute';
                star.style.bottom = '60px';
                star.style.left = '50%';
                star.style.fontSize = '40px';
                star.style.transform = 'translateX(-50%)';
                star.style.animation = 'catch-stars 0.5s ease-out forwards';
                container.appendChild(star);

                setTimeout(() => { resolve(); }, 800);
            } else {
                ball.classList.add('anim-break');
                setTimeout(() => {
                    if (spriteElement) {
                        spriteElement.classList.remove('absorbed');
                        spriteElement.style.filter = "sepia(1) hue-rotate(-50deg) saturate(3)";
                        setTimeout(() => spriteElement.style.filter = "", 500);
                    }
                    ball.remove();
                    resolve();
                }, 300);
            }

        }, 1350);
    });
}

// ============================================================
// UTILITAIRES D'AFFICHAGE (Icônes, Sprites, Classes CSS)
// ============================================================

/**
 * Récupère le chemin de l'image d'un objet.
 * @param {string} itemKey - L'identifiant de l'objet
 * @returns {string} L'URL de l'image
 */
function getItemIconPath(itemKey) {
    // 1. On regarde dans la constante ALL_ITEMS
    if (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[itemKey]) {
        const item = ALL_ITEMS[itemKey];

        // PRIORITÉ 1 : La propriété 'img' (PokeAPI)
        if (item.img) return item.img;

        // Compatibilité : Si jamais certains objets utilisent d'autres noms
        if (item.image) return item.image;
        if (item.sprite) return item.sprite;
    }

    // 2. Gestion des Œufs (Si pas définis dans ALL_ITEMS)
    if (itemKey.startsWith('egg_')) {
        return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png";
    }

    // 3. Fallback : sprite item générique hébergé (fiable sur GitHub Pages)
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
}

/**
 * Récupère le chemin du sprite d'un Pokémon.
 * @param {string} name - Le nom du Pokémon
 * @param {boolean} isShiny - Si c'est un shiny
 * @returns {string} L'URL du sprite
 */
function getPokemonSpritePath(name, isShiny) {
    // 1. La "Source de Vérité" : Les stats locales
    if (typeof POKEMON_BASE_STATS !== 'undefined' && POKEMON_BASE_STATS[name]) {
        const stats = POKEMON_BASE_STATS[name];

        // Si c'est Shiny, on regarde s'il y a un sprite shiny défini
        if (isShiny && stats.shinySprite) return stats.shinySprite;
        // Sinon sprite normal
        if (!isShiny && stats.sprite) return stats.sprite;

        // Parfois on met juste "image" pour le normal
        if (!isShiny && stats.image) return stats.image;
    }

    // 2. Fallback : Fonction API (doit être définie globalement)
    if (typeof getPokemonSpriteUrl === 'function') {
        return getPokemonSpriteUrl(name, isShiny);
    }

    // 3. Fallback ultime
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";
}

/**
 * Récupère la classe CSS de rareté pour un objet.
 * @param {string} itemKey - L'ID de l'objet (ex: 'super_potion')
 * @returns {string} La classe CSS (ex: 'rarity-rare')
 */
function getRarityClass(itemKey) {
    // 1. Gestion des œufs (qui n'ont pas forcément d'entrée dans ALL_ITEMS)
    if (itemKey.startsWith('egg_')) {
        // egg_common, egg_rare, etc.
        const rarity = itemKey.replace('egg_', '');
        return `rarity-${rarity}`;
    }

    // 2. Recherche dans la base de données items
    if (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[itemKey]) {
        return `rarity-${ALL_ITEMS[itemKey].rarity || 'common'}`;
    }

    // 3. Par défaut
    return 'rarity-common';
}

// ============================================================
// ZONE INFO & MODAL
// ============================================================

/**
 * Met à jour l'affichage des infos de zone (maîtrise, mode tour, etc.)
 * Dépendances globales : game, currentZone, ZONES
 */
function updateZoneInfo() {
    const zoneSelectorDiv = document.querySelector('.zone-selector');
    const zoneInfoDiv = document.getElementById('zoneInfo');
    if (!zoneSelectorDiv || !zoneInfoDiv) return;

    // --- MODE TOUR ---
    if (game && game.towerState && game.towerState.isActive) {
        zoneSelectorDiv.classList.add('tower-mode');
        const floor = game.towerState.currentFloor;
        let floorText = `🏰 TOUR DE COMBAT - ÉTAGE ${floor}`;
        if (floor % 10 === 0) floorText = `💀 BOSS MAJEUR - ÉTAGE ${floor} 💀`;
        else if (floor % 5 === 0) floorText = `⚔️ DRESSEUR D'ÉLITE - ÉTAGE ${floor}`;
        zoneInfoDiv.innerHTML = floorText;
        return;
    }

    // --- MODE ZONE ---
    if (zoneSelectorDiv.classList.contains('tower-mode')) {
        zoneSelectorDiv.classList.remove('tower-mode');
    }

    const zone = typeof ZONES !== 'undefined' ? ZONES[currentZone] : null;
    if (!game || !game.zoneProgress || !game.zoneProgress[currentZone]) {
        if (zone && zoneInfoDiv) zoneInfoDiv.textContent = "Zone actuelle : " + zone.name;
        return;
    }

    const progress = game.zoneProgress[currentZone];
    const maxTier = zone.maxTier || 50;
    const tiersInZone = progress.pokemonTiers || {};

    const pokemonInZone = game.getReachablePokemonInZone(currentZone);
    const totalPokemon = pokemonInZone.length;
    const pokemonAtMaxTier = pokemonInZone.filter(name => (tiersInZone[name] || 0) >= maxTier).length;

    let bossScore = 0, bossMax = 0;
    if (zone.requiredBosses > 0) {
        bossMax = 1;
        if ((progress.bossesDefeated || 0) >= zone.requiredBosses) bossScore = 1;
    }

    let epicScore = 0, epicMax = 0;
    if (zone.requiredEpics > 0) {
        epicMax = 1;
        if ((progress.epicsDefeated || 0) >= zone.requiredEpics) epicScore = 1;
    }

    const currentTotal = pokemonAtMaxTier + bossScore + epicScore;
    const maxTotal = totalPokemon + bossMax + epicMax;
    const masteryComplete = currentTotal >= maxTotal && maxTotal > 0;

    let html = `
        <div class="zone-objective">
            <div>
                <span class="zone-objective-label">Maîtrise</span>
                <button class="zone-details-btn" onclick="showZoneTierModal()">Détails</button>
            </div>
            <span class="zone-objective-progress ${masteryComplete ? '' : 'incomplete'}">
                ${currentTotal}/${maxTotal}
            </span>
        </div>
    `;

    if (zoneInfoDiv) zoneInfoDiv.innerHTML = html;
}

/**
 * Affiche le modal de progression des tiers de zone.
 * Dépendances globales : game, currentZone, ZONES, getPokemonSpriteUrl
 */
function showZoneTierModal() {
    if (!game) return;

    const zone = ZONES[currentZone];
    const pokemonInZone = game.getReachablePokemonInZone(currentZone);
    const progress = game.zoneProgress[currentZone];
    const tiersInZone = progress.pokemonTiers || {};
    const maxTier = zone.maxTier || 50;

    const modal = document.getElementById('zoneTierModal');
    const title = document.getElementById('zoneTierModalTitle');
    const grid = document.getElementById('zoneTierModalGrid');

    if (!modal || !title || !grid) return;

    title.textContent = `Progression - ${zone.name}`;
    grid.innerHTML = '';

    let bossHTML = '';
    let epicHTML = '';

    if (zone.requiredBosses > 0) {
        const currentBosses = progress.bossesDefeated || 0;
        const bossComplete = currentBosses >= zone.requiredBosses;
        bossHTML = `
            <div class="zone-objective" style="flex: 1; min-width: 150px;">
                <span class="zone-objective-label">Boss</span>
                <span class="zone-objective-progress ${bossComplete ? '' : 'incomplete'}">
                    ${currentBosses}/${zone.requiredBosses}
                </span>
            </div>`;
    }

    if (zone.requiredEpics > 0) {
        const currentEpics = progress.epicsDefeated || 0;
        const epicComplete = currentEpics >= zone.requiredEpics;
        epicHTML = `
            <div class="zone-objective" style="flex: 1; min-width: 150px;">
                <span class="zone-objective-label">Epics</span>
                <span class="zone-objective-progress ${epicComplete ? '' : 'incomplete'}">
                    ${currentEpics}/${zone.requiredEpics}
                </span>
            </div>`;
    }

    if (bossHTML || epicHTML) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">${bossHTML}${epicHTML}</div>`;
    }

    if (!pokemonInZone || pokemonInZone.length === 0) {
        if (!bossHTML && !epicHTML) grid.innerHTML = "<p>Aucun Pokémon accessible.</p>";
        modal.classList.add('show');
        return;
    }

    pokemonInZone.forEach(pokemonName => {
        const currentTier = tiersInZone[pokemonName] || 0;
        const percent = Math.min(100, (currentTier / maxTier) * 100);
        const spriteUrl = getPokemonSpriteUrl(pokemonName, false, false);
        const isMaxed = currentTier >= maxTier;

        const card = document.createElement('div');
        card.className = 'creature-card';
        if (isMaxed) {
            card.style.borderColor = "#22c55e";
            card.style.background = "#f0fdf4";
        }

        card.innerHTML = `
            <img src="${spriteUrl}" alt="${pokemonName}" class="team-slot-sprite">
            <div class="team-slot-name">${pokemonName}</div>
            <div style="font-size: 11px; color: ${isMaxed ? '#16a34a' : '#666'}; font-weight:bold;">
                Tier ${currentTier}/${maxTier}
            </div>
            <div class="tier-progress-bar">
                <div class="tier-progress-fill" style="width: ${percent}%; background: ${isMaxed ? '#16a34a' : ''}"></div>
            </div>
        `;
        grid.appendChild(card);
    });

    modal.classList.add('show');
}

/**
 * Change le sous-onglet de la boutique (Epicerie, Pokédollars, Jetons, etc.)
 * @param {string} tabName - Nom du sous-onglet
 */
function switchShopSubTab(tabName) {
    const subContents = document.querySelectorAll('#boutiqueTab .sub-tab-content');
    subContents.forEach(tab => tab.classList.remove('active'));

    const subButtons = document.querySelectorAll('#boutiqueTab .sub-tab-btn');
    subButtons.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById('shop-' + tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    if (typeof event !== 'undefined' && event && event.target) {
        event.target.classList.add('active');
    }

    if (game) {
        if (tabName === 'epicerie') {
            game.updatePokeMartDisplay();
        } else if (tabName === 'pokedollars') {
            game.updateUpgradesDisplay();
        } else if (tabName === 'jetons') {
            game.updateShopDisplay();
        } else if (tabName === 'marques') {
            game.updateTowerShopDisplay();
        } else if (tabName === 'recycleur') {
            game.updateRecyclerDisplay();
        }
    }
}

// ============================================================
// MODALS - Fermeture Zone Tier
// ============================================================

/**
 * Ferme le modal de progression des tiers de zone.
 */
function closeZoneTierModal() {
    const modal = document.getElementById('zoneTierModal');
    if (modal) modal.classList.remove('show');
}

// ============================================================
// SPRITE URL (API PokeAPI)
// ============================================================

/**
 * Récupère l'URL du sprite Pokémon (PokeAPI). Blindé contre les crashs.
 * @param {string} name - Nom du Pokémon
 * @param {boolean} shiny - Si c'est un shiny
 * @param {boolean} back - Si c'est le dos (back sprite)
 * @returns {string} L'URL du sprite
 */
function getPokemonSpriteUrl(name, shiny, back = false) {
    // SÉCURITÉ : Si le nom est vide ou undefined
    if (!name) {
        return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";
    }

    // Nettoyage du nom pour l'API
    let cleanName = name.toLowerCase()
        .replace(" ", "-")
        .replace("♀", "-f")
        .replace("♂", "-m")
        .replace(".", "")
        .replace("'", "");

    // Cas spéciaux pour les sprites API
    if (cleanName === "nidoran") cleanName = "nidoran-m";
    if (cleanName === "mr-mime") cleanName = "mr-mime";
    if (cleanName === "mime-jr") cleanName = "mime-jr";
    if (cleanName === "farfetchd") cleanName = "farfetchd";

    // Construction URL
    const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
    const shinyPath = shiny ? "/shiny" : "";
    const backPath = back ? "/back" : "";

    if (typeof POKEMON_SPRITE_IDS !== 'undefined' && POKEMON_SPRITE_IDS[name]) {
        return `${baseUrl}${backPath}${shinyPath}/${POKEMON_SPRITE_IDS[name]}.png`;
    }

    return `${baseUrl}${backPath}${shinyPath}/${cleanName}.png`;
}

// ============================================================
// TOGGLE PENSION (Affichage repliable)
// ============================================================

/**
 * Inverse l'état replié/déplié du panneau Pension.
 * Utilise game.isPensionCollapsed (doit être défini sur l'objet game).
 */
function togglePension() {
    if (typeof game === 'undefined' || !game) return;

    game.isPensionCollapsed = !game.isPensionCollapsed;

    const pensionContainer = document.getElementById('pensionContainer');
    const pensionIcon = document.getElementById('pensionToggleIcon');

    if (!pensionContainer || !pensionIcon) return;

    if (game.isPensionCollapsed) {
        pensionContainer.style.display = 'none';
        pensionIcon.textContent = '▶';
    } else {
        pensionContainer.style.display = 'block';
        pensionIcon.textContent = '▼';
    }
}

// ============================================================
// LOG MESSAGE (Affichage dans le modal log)
// ============================================================

/**
 * Affiche un message dans le journal de combat (modal log).
 * @param {string} msg - Le message à afficher
 */
function logMessage(msg) {
    const container = document.getElementById('gameLog');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'log-entry';

    const time = new Date().toLocaleTimeString('fr-FR');
    div.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;

    container.appendChild(div);

    // Nettoyage (Max 50 lignes pour perf)
    if (container.children.length > 50) {
        container.removeChild(container.firstChild);
    }

    // Auto-scroll si le modal log est ouvert
    const logModal = document.getElementById('logModal');
    if (logModal && logModal.classList.contains('show')) {
        container.scrollTop = container.scrollHeight;
    }
}

// ============================================================
// UTILITAIRE : Icône HTML pour un objet
// ============================================================

/**
 * Génère le HTML de l'icône d'un objet (image ou emoji).
 * @param {Object} item - Objet avec img, icon, name
 * @returns {string} HTML
 */
function getItemIconHTML(item) {
    if (!item) return '📦';
    if (item.img) {
        return `<img src="${item.img}" class="item-sprite-img" alt="${item.name || ''}">`;
    }
    return item.icon || '📦';
}

/**
 * Badge HTML pour l'objet tenu sur une carte créature (en haut à droite).
 * @param {Object} creature - Créature avec heldItem
 * @returns {string} HTML ou chaîne vide
 */
function getHeldItemBadgeHTML(creature) {
    if (!creature || !creature.heldItem || typeof HELD_ITEMS === 'undefined') return '';
    const item = HELD_ITEMS[creature.heldItem];
    if (!item) return '';
    const name = (item.name || creature.heldItem).replace(/"/g, '&quot;');
    if (item.img) {
        return `<img src="${item.img}" class="creature-card-held-item" alt="${name}" title="${name}">`;
    }
    return `<span class="creature-card-held-item creature-card-held-item-icon" title="${name}">${item.icon || '🎒'}</span>`;
}

// ============================================================
// BLOC 3 : Mise à jour des panneaux (Inventaire, Équipe, Boutiques)
// Ces fonctions reçoivent game en paramètre et accèdent aux données via game.xxx
// ============================================================

/**
 * Affiche le contenu du Sac à Dos (Inventaire).
 */
// Filtre actif pour l'inventaire (sac à dos)
// 'all' | 'combat' | 'permanent' | 'held' | 'key' | 'evolution_stones' | 'ct' | 'misc'
let currentInventoryFilter = 'all';

function setInventoryFilter(filter) {
    currentInventoryFilter = filter || 'all';
    if (typeof game !== 'undefined') {
        updateItemsDisplayUI(game);
    }
}

function updateItemsDisplayUI(game) {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    const allItemKeys = Object.keys(game.items).filter(key => game.items[key] > 0);

    let headerCount = document.getElementById('inventory-total-count');
    let grid = container.querySelector('.inventory-grid');
    let emptyMsg = document.getElementById('inventory-empty-msg');

    if (!grid) {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; color:#334155; font-size:18px; display:flex; align-items:center; gap:6px;"><img src="img/sac.png" alt="Sac" style="width:22px; height:22px; object-fit:contain; image-rendering:pixelated;"> Sac à dos</h3>

                <span id="inventory-total-count" style="font-size:11px; color:#64748b; font-weight:700; background:#f1f5f9; padding:4px 8px; border-radius:12px;">0 OBJETS</span>
            </div>
            <div class="inventory-filters" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                <button class="sort-btn inventory-tab-btn" data-filter="all" onclick="setInventoryFilter('all')">Tous</button>
                <button class="sort-btn inventory-tab-btn" data-filter="combat" onclick="setInventoryFilter('combat')">Combat</button>
                <button class="sort-btn inventory-tab-btn" data-filter="permanent" onclick="setInventoryFilter('permanent')">Permanents</button>
                <button class="sort-btn inventory-tab-btn" data-filter="held" onclick="setInventoryFilter('held')">Objets tenus</button>
                <button class="sort-btn inventory-tab-btn" data-filter="key" onclick="setInventoryFilter('key')">Objets clés</button>
                <button class="sort-btn inventory-tab-btn" data-filter="evolution_stones" onclick="setInventoryFilter('evolution_stones')">Pierres d'évolution</button>
                <button class="sort-btn inventory-tab-btn" data-filter="ct" onclick="setInventoryFilter('ct')">CT</button>
                <button class="sort-btn inventory-tab-btn" data-filter="misc" onclick="setInventoryFilter('misc')">Divers</button>
            </div>
            <div id="inventory-empty-msg" style="display:none; text-align: center; color: #94a3b8; padding: 30px; border: 2px dashed #e2e8f0; border-radius: 10px; font-style: italic;">Votre sac est vide.</div>
            <div class="inventory-grid"></div>
        `;
        grid = container.querySelector('.inventory-grid');
        headerCount = document.getElementById('inventory-total-count');
        emptyMsg = document.getElementById('inventory-empty-msg');
    }

    // Met à jour l'onglet actif visuellement
    const tabButtons = container.querySelectorAll('.inventory-tab-btn');
    tabButtons.forEach(btn => {
        const f = btn.getAttribute('data-filter') || 'all';
        if (f === currentInventoryFilter) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    const evolutionStoneKeysSet = new Set(
        (typeof EVOLUTION_CONDITION_ITEM_MAP !== 'undefined')
            ? Object.values(EVOLUTION_CONDITION_ITEM_MAP)
            : []
    );
    const evolutionSpecialKeysSet = new Set(
        (typeof EVOLUTION_SPECIAL_ITEM_IDS !== 'undefined' && Array.isArray(EVOLUTION_SPECIAL_ITEM_IDS))
            ? EVOLUTION_SPECIAL_ITEM_IDS
            : []
    );

    // Filtrage par type
    const filteredKeys = allItemKeys.filter(key => {
        if (currentInventoryFilter === 'all') return true;
        const item = ALL_ITEMS[key] || {};
        const isKeyItem = item.type === 'key_item';
        const isHeldItem = typeof HELD_ITEMS !== 'undefined' && HELD_ITEMS[key];
        const effect = item.effect || null;
        const isPermanent = !!(effect && effect.duration === null);
        const isCombat = !!(effect && effect.duration !== null);
        const isCT = typeof key === 'string' && key.startsWith('ct_');
        const isEvolutionStone = key === 'evolution_stone'
            || evolutionStoneKeysSet.has(key)
            || evolutionSpecialKeysSet.has(key)
            || item.evolutionItem === true;

        switch (currentInventoryFilter) {
            case 'key': return isKeyItem;
            case 'held': return isHeldItem;
            case 'permanent': return isPermanent;
            case 'combat': return isCombat && !isKeyItem && !isHeldItem;
            case 'evolution_stones': return isEvolutionStone;
            case 'ct': return isCT;
            case 'misc': return !isKeyItem && !isHeldItem && !isPermanent && !isCombat && !isCT && !isEvolutionStone;
            default: return true;
        }
    });

    if (headerCount) headerCount.textContent = `${filteredKeys.length} TYPES D'OBJETS`;

    if (filteredKeys.length === 0) {
        if (grid) grid.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    if (grid) grid.style.display = 'grid';
    if (emptyMsg) emptyMsg.style.display = 'none';

    filteredKeys.sort((a, b) => {
        const itemA = ALL_ITEMS[a] || { rarity: 'common' };
        const itemB = ALL_ITEMS[b] || { rarity: 'common' };
        const getWeight = (key, item) => {
            if (item.type === 'key_item') return 0;
            if (key.includes('ball') || (item.type && item.type === 'ball')) return 1;
            if (typeof HELD_ITEMS !== 'undefined' && HELD_ITEMS[key]) return 2;
            if (item.effect) return 3;
            return 4;
        };
        return getWeight(a, itemA) - getWeight(b, itemB);
    });

    const currentSlots = Array.from(grid.children);
    const activeIds = new Set();

    filteredKeys.forEach(key => {
        const item = ALL_ITEMS[key] || { name: key, description: "Objet inconnu", icon: "❓", rarity: "common" };
        const count = game.items[key];
        const slotId = `inv-slot-${key}`;
        activeIds.add(slotId);

        let card = document.getElementById(slotId);

        if (card) {
            const countDiv = card.querySelector('.item-count');
            if (countDiv && countDiv.textContent !== `x${count}`) countDiv.textContent = `x${count}`;
            grid.appendChild(card);
        } else {
            card = document.createElement('div');
            card.id = slotId;
            card.className = `inventory-slot rarity-${item.rarity || 'common'}`;

            let typeIcon = '';
            let clickAction = `game.useItem('${key}', 1, event)`;

            if (item.type === 'key_item') {
                typeIcon = '<span class="item-type-badge" style="background:transparent; color:#fbbf24; text-shadow:0 0 4px rgba(251, 191, 36, 0.7);">CLÉ</span>';
                clickAction = "toast.info('Objet Clé', 'Cet objet s\\'active automatiquement dans les zones appropriées.')";
            } else if (typeof HELD_ITEMS !== 'undefined' && HELD_ITEMS[key]) {
                card.classList.add('is-held-item');
                typeIcon = '<span class="item-type-badge">ÉQUIP.</span>';
                clickAction = "toast.info('Objet Tenu', 'Équipez cet objet depuis le menu d\\'une créature.')";
            }

            let iconHTML = `<div style="font-size:28px;">${item.icon || '📦'}</div>`;
            if (item.img) {
                iconHTML = `<img src="${item.img}" class="item-sprite-img" alt="${item.name}" style="width:40px; height:40px; object-fit:contain;">`;
            }

            const isVitamin = item.effect && item.effect.duration === null;
            const safeName = (item.name || '').replace(/'/g, "\\'");
            const safeDesc = (item.description || "").replace(/'/g, "\\'");

            card.innerHTML = `
                <div class="inventory-slot-content" 
                     onmouseenter="game.scheduleTooltip(event, '${safeName}', '${safeDesc}')" 
                     onmouseleave="game.hideTooltip()"
                     onclick="${clickAction}" 
                     style="width:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:4px;">
                    ${typeIcon}
                    <div class="item-icon">${iconHTML}</div>
                    <div class="item-count">x${count}</div>
                    <div class="item-name">${item.name}</div>
                    <div style="font-size: 9px; color: #94a3b8; margin-top: 2px; opacity: 1; min-height:11px;">${isVitamin ? 'Ctrl: Tout' : ''}</div>
                </div>
            `;
            grid.appendChild(card);
        }
    });

    currentSlots.forEach(slot => {
        if (!activeIds.has(slot.id)) slot.remove();
    });
}

/**
 * Affiche l'équipe (teamList).
 */
function updateTeamDisplayUI(game) {
    const teamList = document.getElementById('teamList');
    const teamCount = document.getElementById('teamCount');
    if (!teamList || !teamCount) return;

    const maxTeamSize = 6 + game.getAccountTalentBonus('team_slot');
    teamCount.textContent = game.playerTeam.length + "/" + maxTeamSize;
    teamList.innerHTML = '';

    let teamDragFromIndex = -1;
    let teamDragToIndex = -1;
    let teamDragApplied = false;

    for (let i = 0; i < maxTeamSize; i++) {
        if (i < game.playerTeam.length) {
            const creature = game.playerTeam[i];
            const card = document.createElement('div');
            card.className = "creature-card rarity-" + creature.rarity;
            card.setAttribute('data-team-index', String(i));
            card.draggable = true;

            card.addEventListener('click', function (e) {
                if (card.classList.contains('team-card-dragging')) return;
                // 🛑 OPTIMISATION : Déporter la génération de modale lourde 
                // pour que le clic réponde instantanément 
                requestAnimationFrame(() => {
                    game.showCreatureModal(i, 'team');
                });
            });
            card.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                if (creature.isAlive()) game.setActiveCreature(i);
            });
            card.addEventListener('dragstart', function (e) {
                teamDragFromIndex = i;
                teamDragToIndex = -1;
                teamDragApplied = false;
                card.classList.add('team-card-dragging');
                e.dataTransfer.setData('text/plain', String(i));
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/team-index', String(i));
            });
            card.addEventListener('dragend', function () {
                if (!teamDragApplied && teamDragFromIndex >= 0 && teamDragToIndex >= 0 && teamDragFromIndex !== teamDragToIndex && typeof game.reorderTeam === 'function') {
                    game.reorderTeam(teamDragFromIndex, teamDragToIndex);
                }
                teamDragFromIndex = -1;
                teamDragToIndex = -1;
                teamDragApplied = false;
                card.classList.remove('team-card-dragging');
                teamList.querySelectorAll('.creature-card.team-drag-over, .team-slot-empty.team-drag-over').forEach(el => el.classList.remove('team-drag-over'));
            });
            card.addEventListener('dragenter', function (e) {
                e.preventDefault();
                if (teamDragFromIndex !== -1 && teamDragFromIndex !== i) {
                    teamDragToIndex = i;
                    card.classList.add('team-drag-over');
                }
            });
            card.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (teamDragFromIndex !== -1 && teamDragFromIndex !== i) {
                    teamDragToIndex = i;
                    card.classList.add('team-drag-over');
                }
            });
            card.addEventListener('dragleave', function (e) {
                if (e.relatedTarget && card.contains(e.relatedTarget)) return;
                card.classList.remove('team-drag-over');
            });
            card.addEventListener('drop', function (e) {
                e.preventDefault();
                card.classList.remove('team-drag-over');
                const fromIdx = parseInt(e.dataTransfer.getData('application/team-index'), 10);
                if (isNaN(fromIdx) || fromIdx === i) return;
                teamDragApplied = true;
                if (typeof game.reorderTeam === 'function') game.reorderTeam(fromIdx, i);
            });

            if (creature.isShiny) card.className += " shiny";
            if (i === game.activeCreatureIndex) card.classList.add('active');
            const isFaintedInTower = game.towerState && game.towerState.isActive && game.faintedThisCombat && game.faintedThisCombat.has(creature.name);
            if (!creature.isAlive() || isFaintedInTower) card.classList.add('fainted');

            const maxLevel = 100 + (creature.prestige * 10);
            const shardKey = typeof getShardKey === 'function' ? getShardKey(creature.name, creature.rarity) : creature.name;
            const currentShards = game.shards[shardKey] || 0;
            const prestigeCost = game.getPrestigeCost(creature.prestige);
            const expPercent = (creature.exp / creature.expToNext) * 100;
            const spriteUrl = getPokemonSpriteUrl(creature.name, creature.isShiny, false);

            if (creature.level >= maxLevel && currentShards >= prestigeCost) card.classList.add('prestige-ready');

            const teamTransferRate = ((game.getTeamContributionRate && game.getTeamContributionRate()) || 0.10) * 100;
            const teamTransferRateStr = teamTransferRate.toFixed(0);
            const shinyStars = creature.isShiny ? '<div class="shiny-stars" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : '';
            const heldItemBadge = typeof getHeldItemBadgeHTML === 'function' ? getHeldItemBadgeHTML(creature) : '';

            card.innerHTML = shinyStars + heldItemBadge + `
                <img src="${spriteUrl}" alt="${creature.name}" class="team-slot-sprite">
                <div class="team-slot-name">${creature.name} ${creature.prestige > 0 ? `★${creature.prestige}` : ''}</div>
                <div class="team-slot-level">Niv. ${creature.level}</div>
                <div class="exp-bar" style="height: 8px; margin-top: 5px;">
                    <div class="exp-fill" style="width: ${expPercent}%;"></div>
                </div>
                <div class="team-slot-info">
                    <span style="color: ${creature.currentStamina === 0 ? '#ef4444' : '#22c55e'};">⚡ ${creature.currentStamina}/${creature.maxStamina}</span>
                    <span style="color: #8a2be2;"><img src="img/shard.png" class="shard-inline" alt=""> ${currentShards}/${prestigeCost}</span>
                </div>
                <div class="team-contribution-trigger" data-creature-index="${i}" style="background: rgba(34, 197, 94, 0.15); padding: 6px 8px; border-radius: 5px; margin-top: 5px; width: 100%; font-size: 11px;">
                    <span style="font-weight: bold; color: #16a34a;">Contribution (${teamTransferRateStr}%) :</span>
                    <span class="team-contribution-btn">Voir détails</span>
                </div>
            `;
            teamList.appendChild(card);
            const triggerEl = card.querySelector('.team-contribution-trigger');
            if (triggerEl) {
                triggerEl.addEventListener('mouseenter', function (e) { e.stopPropagation(); game.showTeamContributionPopover(i, this); });
                triggerEl.addEventListener('mouseleave', function () { game.scheduleHidePensionContributionPopover(150); });
            }
        } else {
            const emptySlot = document.createElement('div');
            emptySlot.className = "team-slot-empty";
            emptySlot.setAttribute('data-slot-index', String(i));
            emptySlot.textContent = "+";
            emptySlot.addEventListener('dragenter', function (e) {
                e.preventDefault();
                if (teamDragFromIndex !== -1 && game.playerTeam.length > 1) {
                    teamDragToIndex = Math.min(i, game.playerTeam.length - 1);
                    emptySlot.classList.add('team-drag-over');
                }
            });
            emptySlot.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (teamDragFromIndex !== -1) {
                    teamDragToIndex = Math.min(i, game.playerTeam.length - 1);
                    emptySlot.classList.add('team-drag-over');
                }
            });
            emptySlot.addEventListener('dragleave', function (e) {
                if (e.relatedTarget && emptySlot.contains(e.relatedTarget)) return;
                emptySlot.classList.remove('team-drag-over');
            });
            emptySlot.addEventListener('drop', function (e) {
                e.preventDefault();
                emptySlot.classList.remove('team-drag-over');
                const fromIdx = parseInt(e.dataTransfer.getData('application/team-index'), 10);
                if (isNaN(fromIdx)) return;
                const toIndex = Math.min(i, game.playerTeam.length - 1);
                if (fromIdx === toIndex) return;
                teamDragApplied = true;
                if (typeof game.reorderTeam === 'function') game.reorderTeam(fromIdx, toIndex);
            });
            teamList.appendChild(emptySlot);
        }
    }
    if (typeof game.updateSynergyDisplay === 'function') game.updateSynergyDisplay();
    if (typeof game.checkAchievements === 'function') game.checkAchievements('team_changed');
}

/**
 * Affiche le stockage (storageList).
 */
function updateStorageDisplayUI(game) {
    const storageList = document.getElementById('storageList');
    const storageCount = document.getElementById('storageCount');
    if (!storageList || !storageCount) return;

    const searchInput = document.getElementById('storageSearchInput');
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const typeFilterInput = document.getElementById('storageTypeFilter');
    const selectedType = typeFilterInput ? typeFilterInput.value : 'all';

    const sortButtons = ['pokedex', 'level', 'rarity', 'hp', 'attack', 'defense', 'speed', 'total', 'shards', 'type'];
    sortButtons.forEach(btnId => {
        const btn = document.getElementById('sort-' + btnId);
        if (btn) {
            btn.className = 'sort-btn';
            if (game.sortBy === btnId) {
                btn.className += ' active';
                if (game.sortOrder === 'asc') btn.className += ' asc';
            }
        }
    });

    storageList.innerHTML = '';
    let displayedCount = 0;

    for (let i = 0; i < game.storage.length; i++) {
        const creature = game.storage[i];
        if (searchText && !creature.name.toLowerCase().includes(searchText)) continue;
        if (selectedType !== 'all' && creature.type !== selectedType && creature.secondaryType !== selectedType) continue;

        displayedCount++;
        const card = document.createElement('div');
        card.className = "creature-card rarity-" + creature.rarity;
        if (creature.isShiny) card.className += " shiny";
        card.style.opacity = "0.8";
        card.style.cursor = 'pointer';
        card.setAttribute('onclick', `game.showCreatureModal(${i}, 'storage')`);

        const maxLevel = 100 + (creature.prestige * 10);
        const shardKey = typeof getShardKey === 'function' ? getShardKey(creature.name, creature.rarity) : creature.name;
        const currentShards = game.shards[shardKey] || 0;
        const prestigeCost = game.getPrestigeCost(creature.prestige);
        const expPercent = (creature.exp / creature.expToNext) * 100;
        const spriteUrl = getPokemonSpriteUrl(creature.name, creature.isShiny, false);

        if (creature.level >= maxLevel && currentShards >= prestigeCost) card.classList.add('prestige-ready');

        const shinyStars = creature.isShiny ? '<div class="shiny-stars" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : '';
        const heldItemBadge = typeof getHeldItemBadgeHTML === 'function' ? getHeldItemBadgeHTML(creature) : '';
        card.innerHTML = shinyStars + heldItemBadge + `
            <img src="${spriteUrl}" alt="${creature.name}" class="team-slot-sprite">
            <div class="team-slot-name">${creature.name} ${creature.prestige > 0 ? `★${creature.prestige}` : ''}</div>
            <div class="team-slot-level">Niv. ${creature.level}</div>
            <div class="exp-bar" style="height: 4px; margin-top: 2px;">
                <div class="exp-fill" style="width: ${expPercent}%;"></div>
            </div>
            <div class="team-slot-info" style="justify-content: center;">
                <span style="color: #8a2be2;"><img src="img/shard.png" class="shard-inline" alt=""> ${currentShards}/${prestigeCost}</span>
            </div>
        `;
        storageList.appendChild(card);
    }

    storageCount.textContent = `${displayedCount}/${game.storage.length}`;
    if (displayedCount === 0 && game.storage.length > 0) {
        storageList.innerHTML = `<div style="text-align: center; color: #666; padding: 20px; grid-column: 1 / -1;">Aucun Pokémon ne correspond à vos filtres.</div>`;
    }
}

/**
 * Affiche le PokéMart (épicerie).
 */
function updatePokeMartDisplayUI(game) {
    const container = document.getElementById('martContainer');
    const moneyDisplay = document.getElementById('martMoney');
    if (!container || !moneyDisplay) return;

    moneyDisplay.textContent = typeof formatNumber === 'function' ? formatNumber(game.pokedollars) : game.pokedollars;
    container.innerHTML = '';

    if (typeof POKEMART_ITEMS === 'undefined') return;
    let html = '';
    Object.entries(POKEMART_ITEMS).forEach(([key, shopEntry]) => {
        const realItem = ALL_ITEMS[shopEntry.itemId];
        const iconHTML = getItemIconHTML(realItem || shopEntry);
        const canAfford = game.pokedollars >= shopEntry.cost;

        html += `
        <div class="shop-item">
            <div class="shop-item-name" style="display:flex; align-items:center; gap:10px;">
                ${iconHTML}
                <span>${shopEntry.name}</span>
            </div>
            <div class="shop-item-description">${shopEntry.description}</div>
            <div class="shop-item-cost" style="color: #333;">💰 ${formatNumber(shopEntry.cost)}</div>
            <button class="shop-buy-btn" 
                    style="background: ${canAfford ? 'linear-gradient(135deg, #2196f3, #1976d2)' : '#ccc'};"
                    onclick="game.buyPokeMartItem('${key}')" 
                    ${!canAfford ? 'disabled' : ''}>
                ${canAfford ? 'Acheter' : "Pas assez d'argent"}
            </button>
        </div>`;
    });
    container.innerHTML = html;
}

/**
 * Affiche les améliorations (upgrades).
 */
function updateUpgradesDisplayUI(game) {
    const upgradesContainer = document.getElementById('upgradesContainer');
    if (!upgradesContainer) return;

    upgradesContainer.innerHTML = '';

    if (!game.upgrades) return;
    const entries = Object.entries(game.upgrades);
    const sorted = entries.slice().sort((a, b) => {
        const aMaxed = a[1].level >= a[1].maxLevel;
        const bMaxed = b[1].level >= b[1].maxLevel;
        if (aMaxed === bMaxed) return 0;
        return aMaxed ? 1 : -1;
    });

    let html = '';
    sorted.forEach(([key, upgrade]) => {
        const cost = game.getUpgradeCost(key);
        const canAfford = game.canAffordUpgrade(key);
        const isMaxLevel = upgrade.level >= upgrade.maxLevel;

        let currentEffect = "";
        switch (key) {
            case 'critMastery': currentEffect = "Bonus actuel: +" + (upgrade.level * 1).toFixed(0) + "%"; break;
            case 'expBoost': currentEffect = "Multiplicateur: x" + (game.getExpMultiplier() * 100 / 100).toFixed(1); break;
            case 'eggDrop': currentEffect = "Bonus: +" + (game.getEggDropBonus() * 100).toFixed(0) + "%"; break;
            case 'staminaRegen': currentEffect = "Temps: " + (game.getStaminaRegenTime() / 1000).toFixed(1) + "s"; break;
            case 'shardBonus': currentEffect = "Chance: " + (game.getShardBonusChance() * 100).toFixed(0) + "%"; break;
            case 'pension': currentEffect = "Slots: " + game.getPensionSlots() + " | Transfert: " + (game.getPensionTransferRate() * 100).toFixed(0) + "%"; break;
            case 'respawn': currentEffect = `Délai réduit: -${upgrade.level * 50}ms`; break;
            case 'recycle': currentEffect = "Chance d'économie: " + (upgrade.level * 2.5).toFixed(0) + "%"; break;
            case 'second_chance': currentEffect = "Chance de relance: " + (upgrade.level * 1).toFixed(0) + "%"; break;
            case 'incubatorSlots': currentEffect = "Incubateurs: " + (1 + (upgrade.level || 0)) + "/4"; break;
            case 'incubationSpeed': currentEffect = "Temps d'incubation: -" + ((upgrade.level || 0) * 10) + "%"; break;
        }

        const classList = `upgrade-card ${isMaxLevel ? 'maxed' : ''} ${!canAfford && !isMaxLevel ? 'not-affordable' : ''}`;

        html += `
        <div class="${classList}">
            <div class="upgrade-title">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-stats">
                <div class="upgrade-level">Niv. ${upgrade.level}/${upgrade.maxLevel}</div>
                <div class="upgrade-effect">${upgrade.effect}</div>
            </div>
            ${currentEffect ? `<div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 10px; font-weight: 600;">${currentEffect}</div>` : ''}
            <div class="upgrade-cost" style="margin-bottom: 15px;">
                ${isMaxLevel ? 'NIVEAU MAX' : `<img src="img/pokedollars.png" class="pokedollars-inline" alt=""> ${typeof formatNumber === 'function' ? formatNumber(cost) : cost}`}
            </div>
            <button class="upgrade-btn" 
                    onclick="game.buyUpgrade('${key}')" 
                    ${!canAfford || isMaxLevel ? 'disabled' : ''}>
                ${isMaxLevel ? 'NIVEAU MAX' : (canAfford ? 'ACHETER' : 'PAS ASSEZ DE FONDS')}
            </button>
        </div>`;
    });
    upgradesContainer.innerHTML = html;
}

/**
 * Affiche la boutique aux jetons (Shop).
 */
function updateShopDisplayUI(game) {
    const shopContainer = document.getElementById('shopContainer');
    const shopTokens = document.getElementById('shopTokens');
    if (!shopContainer) return;

    if (shopTokens) {
        shopTokens.textContent = typeof formatNumber === 'function' ? formatNumber(game.questTokens) : game.questTokens;
    }
    shopContainer.innerHTML = '';

    if (typeof SHOP_ITEMS === 'undefined') return;

    let html = '';
    const shopEntries = Object.entries(SHOP_ITEMS).map(([key, item]) => {
        let currentCost = item.cost;
        let isMaxed = false;
        let levelInfo = "";

        if (Array.isArray(item.cost)) {
            let storedValue = 0;
            if (item.effect.type === 'pensionSlot') storedValue = game.permanentBoosts.pensionSlots || 0;
            else if (item.effect.type === 'permanentXP') storedValue = game.permanentBoosts.xp || 0;

            const currentLevel = Math.round(storedValue / item.effect.value);
            if (currentLevel >= item.maxLevel) {
                isMaxed = true;
                currentCost = 0;
            } else {
                currentCost = item.cost[currentLevel] || item.cost[item.cost.length - 1];
            }
            levelInfo = ` <span style="font-size:11px; color:#666;">(Niv ${currentLevel}/${item.maxLevel})</span>`;
        }

        return { key, item, currentCost, isMaxed, levelInfo };
    });
    const sortedShop = shopEntries.slice().sort((a, b) => {
        if (a.isMaxed === b.isMaxed) return 0;
        return a.isMaxed ? 1 : -1;
    });
    sortedShop.forEach(({ key, item, currentCost, isMaxed, levelInfo }) => {
        const canAfford = !isMaxed && game.questTokens >= currentCost;

        const classList = `shop-item ${isMaxed ? 'maxed' : ''} ${!canAfford && !isMaxed ? 'not-affordable' : ''}`;

        let extraInfo = '';
        if (item.type === 'permanent' && item.effect.type === 'permanentXP') {
            extraInfo = `<div style="font-size: 11px; color: #666; margin-top: 5px;">Actuel : +${((game.permanentBoosts.xp || 0) * 100).toFixed(0)}% XP</div>`;
        }
        if (item.type === 'permanent' && item.effect.type === 'pensionSlot') {
            extraInfo = `<div style="font-size: 11px; color: #666; margin-top: 5px;">Slots bonus : ${game.permanentBoosts.pensionSlots || 0}</div>`;
        }

        const buttonText = isMaxed ? "MAXIMISÉ" : (canAfford ? 'Acheter' : 'Pas assez de jetons');
        const formattedCurrentCost = typeof formatNumber === 'function' ? formatNumber(currentCost) : currentCost;
        const costText = isMaxed ? "" : `<img src="img/quest-token.png" class="quest-token-inline" alt=""> ${formattedCurrentCost} Jetons`;
        const iconHTML = getItemIconHTML(item);

        html += `
        <div class="${classList}">
            <div class="shop-item-name" style="display:flex; align-items:center; gap:10px;">
                ${iconHTML}
                <span>${item.name}${levelInfo}</span>
            </div>
            <div class="shop-item-description">${item.description}</div>
            ${extraInfo}
            <div class="shop-item-cost">${costText}</div>
            <button class="shop-buy-btn" onclick="game.buyShopItem('${key}')" ${!canAfford ? 'disabled' : ''}>
                ${buttonText}
            </button>
        </div>`;
    });
    shopContainer.innerHTML = html;
}

/**
 * Affiche la boutique Tour (Marques du Triomphe).
 */
function updateTowerShopDisplayUI(game) {
    const shopContainer = document.getElementById('towerShopContainer');
    if (!shopContainer) return;

    shopContainer.innerHTML = '';

    if (typeof TOWER_SHOP_ITEMS === 'undefined') return;

    let html = '';
    Object.entries(TOWER_SHOP_ITEMS).forEach(([key, item]) => {
        let currentLevel = 0;
        let isMaxLevel = false;
        let cost = item.cost;
        let levelText = '';

        if (item.maxLevel && item.effect) {
            const readKey = item.effect.type === 'pensionSlot' ? 'pensionSlots' : item.effect.type;
            currentLevel = Math.round((game.permanentBoosts[readKey] || 0) / item.effect.value);
            isMaxLevel = currentLevel >= item.maxLevel;
            levelText = ` (Niv. ${currentLevel}/${item.maxLevel})`;
            if (Array.isArray(item.cost)) cost = isMaxLevel ? 'MAX' : item.cost[currentLevel];
        }

        const canAfford = !isMaxLevel && game.marquesDuTriomphe >= cost;

        const formattedTowerCost = (isMaxLevel || cost === 'MAX')
            ? 'MAX'
            : (typeof formatNumber === 'function' ? formatNumber(cost) : cost);

        html += `
        <div class="shop-item">
            <div class="shop-item-name">${item.name}${levelText}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-cost"><img src="img/marque-triomphe.png" class="marque-triomphe-inline" alt=""> ${formattedTowerCost} Marques</div>
            <button class="shop-buy-btn" onclick="game.buyTowerShopItem('${key}')" ${!canAfford || isMaxLevel ? 'disabled' : ''}>
                ${isMaxLevel ? 'NIVEAU MAX' : (canAfford ? 'Acheter' : 'Marques insuffisantes')}
            </button>
        </div>`;
    });
    shopContainer.innerHTML = html;
}

/**
 * Affiche le Recycleur (Shards + Boutique Poussière).
 */
function updateRecyclerDisplayUI(game) {
    const shardListDiv = document.getElementById('recyclerShardList');
    const shopDiv = document.getElementById('recyclerDustShop');
    const dustCountSpan = document.getElementById('essenceDustCount');
    const searchInput = document.getElementById('recyclerSearchInput');
    const sortRarityBtn = document.getElementById('recyclerSort-rarity');
    const sortCountBtn = document.getElementById('recyclerSort-count');

    if (!shardListDiv || !shopDiv || !dustCountSpan) return;

    dustCountSpan.textContent = typeof formatNumber === 'function' ? formatNumber(game.essenceDust) : game.essenceDust;

    const query = (searchInput && searchInput.value) ? searchInput.value.toLowerCase().trim() : '';
    const sortMode = game.recyclerSortMode || 'rarity';
    const sortDir = game.recyclerSortDir === 'asc' ? 'asc' : 'desc';

    if (sortRarityBtn && sortCountBtn) {
        sortRarityBtn.classList.toggle('active', sortMode === 'rarity');
        sortCountBtn.classList.toggle('active', sortMode === 'count');
    }

    const getFamilyRarity = (familyName) => {
        try {
            if (typeof POKEMON_POOL === 'undefined' || typeof RARITY === 'undefined') return 'common';
            for (const typeKey in POKEMON_POOL[RARITY.COMMON] || {}) {
                if ((POKEMON_POOL[RARITY.COMMON][typeKey] || []).includes(familyName)) return RARITY.COMMON;
            }
            for (const typeKey in POKEMON_POOL[RARITY.RARE] || {}) {
                if ((POKEMON_POOL[RARITY.RARE][typeKey] || []).includes(familyName)) return RARITY.RARE;
            }
            for (const typeKey in POKEMON_POOL[RARITY.EPIC] || {}) {
                if ((POKEMON_POOL[RARITY.EPIC][typeKey] || []).includes(familyName)) return RARITY.EPIC;
            }
            for (const typeKey in POKEMON_POOL[RARITY.LEGENDARY] || {}) {
                if ((POKEMON_POOL[RARITY.LEGENDARY][typeKey] || []).includes(familyName)) return RARITY.LEGENDARY;
            }
        } catch (e) { return 'common'; }
        return 'common';
    };

    const rarityOrder = {
        [RARITY.COMMON]: 0,
        [RARITY.RARE]: 1,
        [RARITY.EPIC]: 2,
        [RARITY.LEGENDARY]: 3
    };

    const shardsArray = [];

    Object.entries(game.shards || {}).forEach(([shardKey, count]) => {
        if (count > 0) {
            const familyName = shardKey;
            if (query && !familyName.toLowerCase().includes(query)) return;

            const rarity = getFamilyRarity(familyName);
            const dustValue = count * (typeof DUST_CONVERSION_RATES !== 'undefined' ? (DUST_CONVERSION_RATES[rarity] || 1) : 1);

            shardsArray.push({
                shardKey,
                familyName,
                rarity,
                count,
                dustValue
            });
        }
    });

    if (sortMode === 'count') {
        shardsArray.sort((a, b) => {
            if (b.count !== a.count) {
                const base = b.count - a.count; // desc naturel
                return sortDir === 'asc' ? -base : base;
            }
            const ra = rarityOrder[a.rarity] ?? 0;
            const rb = rarityOrder[b.rarity] ?? 0;
            if (rb !== ra) {
                const baseR = rb - ra; // LEGENDARY > ...
                return sortDir === 'asc' ? -baseR : baseR;
            }
            return a.familyName.localeCompare(b.familyName);
        });
    } else {
        // Tri par rareté (LEGENDARY > EPIC > RARE > COMMON), puis nom
        shardsArray.sort((a, b) => {
            const ra = rarityOrder[a.rarity] ?? 0;
            const rb = rarityOrder[b.rarity] ?? 0;
            if (rb !== ra) {
                const baseR = rb - ra; // LEGENDARY > ...
                return sortDir === 'asc' ? -baseR : baseR;
            }
            return a.familyName.localeCompare(b.familyName);
        });
    }

    let shardHtml = '<div class="recycler-header">Vos Shards</div>';

    if (shardsArray.length === 0) {
        shardHtml += '<p style="font-size: 12px; color: #666;">Aucun shard à recycler.</p>';
    } else {
        shardsArray.forEach(entry => {
            const formattedCount = typeof formatNumber === 'function' ? formatNumber(entry.count) : entry.count;
            const formattedDustValue = typeof formatNumber === 'function' ? formatNumber(entry.dustValue) : entry.dustValue;

            shardHtml += `
                <div class="recycler-item">
                    <div>
                        <span class="recycler-item-name">${entry.familyName}<span class="rarity-label ${entry.rarity}">${entry.rarity}</span></span>
                        <div style="font-size: 12px; color: #666;">x${formattedCount} ➜ <img src="img/essence-dust.png" class="essence-dust-inline" alt=""> ${formattedDustValue}</div>
                    </div>
                    <button class="recycler-btn" onclick="game.recycleShards('${entry.shardKey}', '${entry.rarity}')">Recycler</button>
                </div>
            `;
        });
    }
    shardListDiv.innerHTML = shardHtml;

    let shopHtml = '<div class="recycler-header">Boutique de Poussière</div>';
    if (typeof DUST_SHOP_ITEMS !== 'undefined') {
        Object.values(DUST_SHOP_ITEMS).forEach(item => {
            if (item.id === 'shiny_egg') return;
            const canAfford = game.essenceDust >= item.cost;
            shopHtml += `
                <div class="dust-shop-item">
                    <div>
                        <div class="shop-item-name" style="color: #a855f7;">${item.name}</div>
                        <div class="shop-item-description" style="font-size: 11px;">${item.description}</div>
                        <div class="shop-item-cost" style="font-size: 16px; margin: 5px 0 0 0;"><img src="img/essence-dust.png" class="essence-dust-inline" alt=""> ${formatNumber(item.cost)}</div>
                    </div>
                    <button class="btn shop-buy-btn" onclick="game.buyDustItem('${item.id}')" ${!canAfford ? 'disabled' : ''}>Acheter</button>
                </div>
            `;
        });
    }
    shopDiv.innerHTML = shopHtml;
}

function updateTeamRocketDisplayUI(game) {
    const panel = document.getElementById('teamRocketPanel');
    if (!panel || !game.teamRocketState) return;

    const tr = game.teamRocketState;
    const now = Date.now();
    const bank = tr.bank || {};
    const loan = tr.loan || {};
    const staking = tr.staking || {};
    const trust = (typeof ROCKET_TRUST_LEVELS !== 'undefined' && ROCKET_TRUST_LEVELS[tr.trustLevel]) ? ROCKET_TRUST_LEVELS[tr.trustLevel] : null;
    const debtPct = loan.totalDebt > 0 ? Math.floor(((loan.totalDebt - loan.remainingDebt) / loan.totalDebt) * 100) : 0;
    const trustLevelRate = Math.max(1, Math.floor(Number(tr.trustLevel) || 1));
    const loanCap = game.getRocketLoanCap ? game.getRocketLoanCap() : 0;

    const fmt = (v) => typeof formatNumber === 'function' ? formatNumber(v) : v;
    const fmtFloat = (v) => {
        const n = Number(v) || 0;
        if (typeof formatFloatingNumber === 'function') return formatFloatingNumber(n);
        return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const fmtMoneyPrecise = (v) => {
        const n = Number(v) || 0;
        return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const totalInterestRaw = Math.max(0, Number(bank.totalInterestGenerated) || 0) + Math.max(0, Number(bank.interestCarry) || 0);
    const totalInterestDisplay = Math.max(0, totalInterestRaw - Math.max(0, Number(bank.interestDisplayOffset) || 0));
    const activeSession = staking.activeSession || null;
    const cycleMs = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined' && Number(ROCKET_PUSH_STAKING_CONFIG.cycleMs) > 0)
        ? Number(ROCKET_PUSH_STAKING_CONFIG.cycleMs)
        : 30000;
    let cycleProgressMs = 0;
    let cycleLeftMs = cycleMs;
    if (activeSession && activeSession.nextPhaseEndAt != null && activeSession.currentPhaseDurationMs != null) {
        cycleLeftMs = Math.max(0, Number(activeSession.nextPhaseEndAt) - now);
        cycleProgressMs = Math.max(0, Number(activeSession.currentPhaseDurationMs) - cycleLeftMs);
    } else if (activeSession) {
        cycleProgressMs = Math.max(0, (now - (activeSession.startedAt || now)) % cycleMs);
        cycleLeftMs = Math.max(0, cycleMs - cycleProgressMs);
    }
    const cycleLeftText = (typeof formatTimeString === 'function') ? formatTimeString(cycleLeftMs) : `${Math.ceil(cycleLeftMs / 1000)}s`;
    const stakeableItems = (typeof game.getRocketStakeableOfferItems === 'function') ? game.getRocketStakeableOfferItems(now) : [];
    const nextRotateAt = Math.max(0, Number(staking.nextOfferRotateAt) || 0);
    const rotateLeftMs = Math.max(0, nextRotateAt - now);
    const rotateLeftText = (typeof formatTimeString === 'function') ? formatTimeString(rotateLeftMs) : `${Math.ceil(rotateLeftMs / 1000)}s`;
    const stealFeedback = (staking.lastStealFeedback && typeof staking.lastStealFeedback === 'object')
        ? staking.lastStealFeedback
        : null;
    const waitingNextSelection = !activeSession && stakeableItems.length === 0 && rotateLeftMs > 0;

    const categoryLabel = (c) => {
        if (c === 'legendary') return 'Légendaire';
        if (c === 'rare') return 'Rare';
        if (c === 'uncommon') return 'Peu commun';
        return 'Commun';
    };

    const riskPct = activeSession && typeof game.getRocketStealRiskPercent === 'function'
        ? game.getRocketStealRiskPercent(activeSession.tier || 1, activeSession)
        : 0;
    const isHighRisk = riskPct > 20;
    const stakeableHtml = stakeableItems.map(item => {
        const canStake = !activeSession;
        const iconHtml = (typeof getItemIconHTML === 'function')
            ? getItemIconHTML({ name: item.name, img: item.img, icon: item.icon })
            : (item.icon || '📦');
        return `
            <div class="shop-item ${canStake ? '' : 'not-affordable'}">
                <div style="display:flex; gap:10px; align-items:center;">
                    <div style="min-width:34px; display:flex; align-items:center; justify-content:center;">${iconHtml}</div>
                    <div class="shop-item-name">${item.name}</div>
                </div>
                <div class="shop-item-description">Catégorie: ${categoryLabel(item.category)} • Possédé: ${fmt(item.amount)}</div>
                <div class="shop-item-cost">Base: ${fmt(item.baseGps)} RJ/s</div>
                <button class="shop-buy-btn" onclick="game.handleRocketStartContract('${item.key}')" ${!canStake ? 'disabled' : ''}>Staker x1</button>
            </div>
        `;
    }).join('') || (
            waitingNextSelection
                ? `<p style="color:#94a3b8;">Sélection verrouillée. Prochaine sélection dans ${rotateLeftText}.</p>`
                : '<p style="color:#94a3b8;">Aucun objet stakeable dans l\'inventaire.</p>'
        );

    const activeSessionHtml = activeSession ? `
        <div class="shop-item ${isHighRisk ? 'rocket-risk-shake' : ''}">
            <div class="shop-item-name">Session Push Your Luck</div>
            <div class="shop-item-description" id="rocketPushSessionItemText">
                Objet: ${activeSession.itemName} • Catégorie: ${categoryLabel(activeSession.category)}
            </div>
            <div class="rocket-push-live-wrap">
                <div id="rocketPushTimerCircle" class="rocket-push-timer-circle" style="--progress:${activeSession && activeSession.currentPhaseDurationMs
            ? Math.max(0, Math.min(100, (cycleProgressMs / activeSession.currentPhaseDurationMs) * 100)).toFixed(2)
            : Math.max(0, Math.min(100, (cycleProgressMs / cycleMs) * 100)).toFixed(2)};">
                    <div id="rocketPushTimerText" class="rocket-push-timer-text">${cycleLeftText}</div>
                </div>
                <div style="flex:1; min-width:0;">
                    <div class="shop-item-cost" id="rocketPushRjLive">RJ accumulés: ${fmt(Math.floor(activeSession.accruedRJ || 0))}</div>
                    <div class="shop-item-description" id="rocketPushGpsLive">
                        GPS: ${fmtFloat(activeSession.currentGps || 0)} RJ/s (x${fmtFloat(activeSession.multiplier || 1)})
                    </div>
                    <div class="shop-item-description" id="rocketPushRiskLive" style="color:${isHighRisk ? '#ef4444' : '#f59e0b'};">
                        Risque de vol fin de cycle: ${riskPct}%
                    </div>
                </div>
            </div>
            <button class="shop-buy-btn" onclick="game.handleRocketRecoverStake()">RÉCUPÉRER</button>
        </div>
    ` : '<p style="color:#94a3b8;">Aucune session active. Lancez un objet pour commencer.</p>';

    const stealFeedbackHtml = stealFeedback ? `
        <div class="shop-item rocket-steal-feedback">
            <div class="shop-item-name">🚨 Objet volé par la Team Rocket</div>
            <div class="shop-item-description">
                ${stealFeedback.itemName || 'Objet'} a été volé au palier ${stealFeedback.tier || 1} (risque ${stealFeedback.riskPercent || 0}%).
            </div>
            <div class="shop-item-cost" style="color:#fecaca;">Perte session: ${fmt(stealFeedback.lostRJ || 0)} RJ</div>
            <button class="shop-buy-btn" style="background:#7f1d1d;" onclick="game.handleRocketDismissStealFeedback()">Compris</button>
        </div>
    ` : '';

    panel.innerHTML = `
        <div class="quest-stats" style="margin-bottom: 12px;">
            <div class="quest-stat"><div class="quest-stat-value">${fmt(tr.rj || 0)}</div><div class="quest-stat-label">RJ</div></div>
            <div class="quest-stat"><div class="quest-stat-value">${tr.trustLevel || 1}</div><div class="quest-stat-label">Confiance</div></div>
            <div class="quest-stat"><div class="quest-stat-value">${fmt(loanCap)}</div><div class="quest-stat-label">Cap prêt</div></div>
        </div>

        <div class="team-rocket-grid">
            <div class="shop-item tr-bank-card">
                <button class="tr-bank-gear-btn" onclick="game.handleRocketBankOptionsToggle()" title="Options banque">⚙</button>
                <div class="shop-item-name">Banque Team Rocket</div>
                <div class="shop-item-description" id="rocketBankRateText">Rendement ${trustLevelRate}%/h, payé chaque minute.</div>
                <div class="shop-item-cost" id="rocketBankBalanceText">Solde: ${fmt(bank.balance || 0)}$ • Intérêts cumulés: ${fmtMoneyPrecise(totalInterestDisplay)}$</div>
                <div class="tr-input-row" style="margin-top:8px;">
                    <input id="rocketBankDepositInput" type="number" min="0" placeholder="Montant dépôt" style="padding:8px;">
                    <button class="shop-buy-btn" onclick="game.handleRocketDeposit()">Déposer</button>
                </div>
                <div class="tr-input-row" style="margin-top:8px;">
                    <input id="rocketBankWithdrawInput" type="number" min="0" placeholder="Montant retrait" style="padding:8px;">
                    <button class="shop-buy-btn" onclick="game.handleRocketWithdraw()">Retirer</button>
                </div>
                <div style="margin-top:8px; font-size:12px; color:#22c55e;">
                    Retrait disponible
                </div>
                <div style="margin-top:8px;">
                    <button class="shop-buy-btn" onclick="game.handleRocketResetInterestCounter()">Reset intérêts cumulés</button>
                </div>
                <div class="tr-bank-options ${game.rocketBankOptionsOpen ? 'open' : ''}">
                    <label style="display:flex; gap:8px; align-items:center; margin-top:8px; font-size:12px; color:#cbd5e1;">
                        <input type="checkbox" ${(bank.autoInjectCombatHalf ? 'checked' : '')} onchange="game.handleRocketAutoInjectCombatHalfToggle(this.checked)">
                        Injecter 50% des gains de combats
                    </label>
                    <label style="display:flex; gap:8px; align-items:center; margin-top:8px; font-size:12px; color:#cbd5e1;">
                        <input type="checkbox" ${(bank.autoInjectInterests ? 'checked' : '')} onchange="game.handleRocketAutoInjectInterestsToggle(this.checked)">
                        Injecter les intérêts
                    </label>
                </div>
            </div>

            <div class="shop-item ${loan.active ? '' : 'not-affordable'}" id="rocketLoanCard">
                <div class="shop-item-name">Prêt Team Rocket</div>
                <div class="shop-item-description">Prélèvement auto 50% sur gains de combat.</div>
                <div class="shop-item-cost">Maximum empruntable: ${fmt(loanCap)}$</div>
                <div class="shop-item-cost" id="rocketLoanDebtText">Dette: ${fmt(loan.remainingDebt || 0)}$ / ${fmt(loan.totalDebt || 0)}$</div>
                <div style="width:100%; height:10px; border-radius:6px; background:#1f2937; overflow:hidden; margin:8px 0;">
                    <div id="rocketLoanDebtFill" style="height:100%; width:${debtPct}%; background:${loan.active ? '#ef4444' : '#22c55e'};"></div>
                </div>
                <div class="tr-input-row">
                    <input id="rocketLoanInput" type="number" min="0" placeholder="Montant prêt" style="padding:8px;">
                    <button class="shop-buy-btn" id="rocketLoanBorrowBtn" onclick="game.handleRocketTakeLoan()" ${(loan.active && loan.remainingDebt > 0) ? 'disabled' : ''}>Emprunter</button>
                </div>
                <div id="rocketLoanStatusText" style="margin-top:8px; font-size:12px; color:${loan.active ? '#ef4444' : '#94a3b8'};">
                    ${loan.active ? `Endetté: ${debtPct}% remboursé` : 'Aucune dette active'}
                </div>
            </div>
        </div>

        <h4 style="margin:16px 0 8px 0;">Staking Push Your Luck</h4>
        ${stealFeedbackHtml}
        <div id="rocketStakingContractTimerText" style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
            Rotation aléatoire: 3 objets • Après un choix, nouvelle sélection dans 10 min minimum • ${rotateLeftText}
        </div>
        <div class="team-rocket-grid" style="margin-bottom:8px;">${activeSessionHtml}</div>
        <div class="team-rocket-grid">${stakeableHtml}</div>

        <h4 style="margin:16px 0 8px 0;">Casino Rocket</h4>
        <div class="shop-item">
            <div class="shop-item-name">Machine à Sous Rocket</div>
            <div class="shop-item-description">Rouleaux animés, mises RJ, historique local des spins et table des gains.</div>
            <div class="shop-item-cost">Niveau: ${trust ? trust.label : 'Recrue'} • XP confiance: ${fmt(tr.trustXp || 0)}</div>
            <button class="shop-buy-btn" style="margin-top:8px;" onclick="game.handleRocketOpenCasinoModal()">Ouvrir la machine à sous</button>
        </div>
    `;
}

// ============================================================
// BLOC 4 : Combat et Header (Helpers + Affichage)
// ============================================================

/**
 * Met en cache les références DOM du combat (évite document.getElementById à chaque frame).
 * @param {Object} game - Instance du jeu
 */
function initUiCacheUI(game) {
    game.ui = {
        playerSprite: document.getElementById('playerSprite'),
        playerContainer: document.getElementById('playerSpriteContainer'),
        playerName: document.getElementById('playerCreatureName'),
        playerLevel: document.getElementById('playerCreatureLevel'),
        playerStats: document.getElementById('playerHudStats'),
        playerHpFill: document.getElementById('playerHealthFill'),
        playerHpText: document.getElementById('playerHealthText'),
        playerStatus: document.getElementById('playerStatusIcons'),
        playerATB: document.getElementById('playerATB'),
        playerATBStack: document.getElementById('playerATBStack'),
        enemySprite: document.getElementById('enemySprite'),
        enemyContainer: document.getElementById('enemySpriteContainer'),
        enemyName: document.getElementById('enemyCreatureName'),
        enemyLevel: document.getElementById('enemyCreatureLevel'),
        enemyStats: document.getElementById('enemyHudStats'),
        enemyHpFill: document.getElementById('enemyHealthFill'),
        enemyHpText: document.getElementById('enemyHealthText'),
        enemyStatus: document.getElementById('enemyStatusIcons'),
        enemyATB: document.getElementById('enemyATB'),
        effectiveness: document.getElementById('effectivenessIndicator'),
        ultBtn: document.getElementById('ultimateButton'),
        ultFill: document.getElementById('ultFill'),
        ultText: document.getElementById('ultText'),
        autoSelectBtn: document.getElementById('autoSelectBtn'),
        forfeitBtn: document.getElementById('forfeitBtn')
    };
}

/**
 * Dirty checking : ne met à jour le DOM que si la valeur a changé.
 */
function updateTextContentUI(element, text) {
    if (element && element.textContent !== text) {
        element.textContent = text;
    }
}

/**
 * Optimisation GPU : met à jour le transform scaleX uniquement si nécessaire.
 */
function updateTransformScaleXUI(element, ratio) {
    const transformValue = `scaleX(${ratio})`;
    if (element && element.style.transform !== transformValue) {
        element.style.transform = transformValue;
    }
}

/**
 * Affiche le Header : Stats du joueur (HP, ATK, etc.) + Ressources (Or, Jetons, Marques).
 */
function updatePlayerStatsDisplayUI(game) {
    const hpWithBoost = game.getPlayerMaxHp();
    const attackWithBoost = Math.floor(game.playerMainStats.attack * (1 + game.getStatBoostMultiplier('attack')));
    const spAttackWithBoost = Math.floor(game.playerMainStats.spattack * (1 + game.getStatBoostMultiplier('spattack')));
    const defenseWithBoost = Math.floor(game.playerMainStats.defense * (1 + game.getStatBoostMultiplier('defense')));
    const spDefenseWithBoost = Math.floor(game.playerMainStats.spdefense * (1 + game.getStatBoostMultiplier('spdefense')));
    const speedWithBoost = Math.floor(game.playerMainStats.speed * (1 + game.getStatBoostMultiplier('speed')));

    const setStatVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            const statVal = el.querySelector('.stat-value');
            if (statVal) {
                if (typeof formatNumberHeader === 'function') {
                    statVal.innerText = formatNumberHeader(val);
                } else if (typeof formatNumber === 'function') {
                    statVal.innerText = formatNumber(val);
                } else {
                    statVal.innerText = val;
                }
            }
        }
    };
    setStatVal('headerStatHP', hpWithBoost);
    setStatVal('headerStatAtk', attackWithBoost);
    setStatVal('headerStatSpAtk', spAttackWithBoost);
    setStatVal('headerStatDef', defenseWithBoost);
    setStatVal('headerStatSpDef', spDefenseWithBoost);
    setStatVal('headerStatSpd', speedWithBoost);

    const pensionStats = game.calculatePensionStats();
    const baseContribution = 0.10;
    const towerBonus = game.permanentBoosts.team_contribution || 0;
    const teamContributionRate = baseContribution + towerBonus;
    const vitaminBonus = {
        hp: 1 + (game.activeVitamins.hp || 0) + (game.activeVitamins.all || 0),
        attack: 1 + (game.activeVitamins.attack || 0) + (game.activeVitamins.all || 0),
        defense: 1 + (game.activeVitamins.defense || 0) + (game.activeVitamins.all || 0),
        speed: 1 + (game.activeVitamins.speed || 0) + (game.activeVitamins.all || 0)
    };
    const totalHPGain = ((game.playerTeamStats.hp * teamContributionRate) + pensionStats.hp) * vitaminBonus.hp;
    const totalAttackGain = ((game.playerTeamStats.attack * teamContributionRate) + pensionStats.attack) * vitaminBonus.attack;
    const totalSpAttackGain = ((game.playerTeamStats.spattack * teamContributionRate) + pensionStats.spattack) * vitaminBonus.attack;
    const totalDefenseGain = ((game.playerTeamStats.defense * teamContributionRate) + pensionStats.defense) * vitaminBonus.defense;
    const totalSpDefenseGain = ((game.playerTeamStats.spdefense * teamContributionRate) + pensionStats.spdefense) * vitaminBonus.defense;
    const totalSpeedGain = ((game.playerTeamStats.speed * teamContributionRate) + pensionStats.speed) * vitaminBonus.speed;

    const headerFmt = (v) =>
        typeof formatNumberHeader === 'function'
            ? formatNumberHeader(v)
            : (typeof formatNumber === 'function' ? formatNumber(v) : v);

    document.getElementById('playerHPGain').textContent = `+${headerFmt(totalHPGain)}/s`;
    document.getElementById('playerAttackGain').textContent = `+${headerFmt(totalAttackGain)}/s`;
    document.getElementById('playerSpAttackGain').textContent = `+${headerFmt(totalSpAttackGain)}/s`;
    document.getElementById('playerDefenseGain').textContent = `+${headerFmt(totalDefenseGain)}/s`;
    document.getElementById('playerSpDefenseGain').textContent = `+${headerFmt(totalSpDefenseGain)}/s`;
    document.getElementById('playerSpeedGain').textContent = `+${headerFmt(totalSpeedGain)}/s`;

    const setResVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            const resVal = el.querySelector('.resource-val');
            if (resVal) {
                if (typeof formatNumberHeader === 'function') {
                    resVal.innerText = formatNumberHeader(val);
                } else if (typeof formatNumber === 'function') {
                    resVal.innerText = formatNumber(val);
                } else {
                    resVal.innerText = val;
                }
            }
        }
    };
    setResVal('headerStatMoney', game.pokedollars);
    setResVal('headerStatTokens', game.questTokens);
    setResVal('headerStatMarques', game.marquesDuTriomphe);

    const headerStatIds = [
        { id: 'headerStatHP', stat: 'hp' },
        { id: 'headerStatAtk', stat: 'attack' },
        { id: 'headerStatSpAtk', stat: 'spattack' },
        { id: 'headerStatDef', stat: 'defense' },
        { id: 'headerStatSpDef', stat: 'spdefense' },
        { id: 'headerStatSpd', stat: 'speed' }
    ];
    headerStatIds.forEach(({ id, stat }) => {
        const chip = document.getElementById(id);
        if (!chip) return;
        const hasBoost = game.getBoostInfoForStat(stat).length > 0;
        if (hasBoost) chip.classList.add('stat-chip-boosted');
        else chip.classList.remove('stat-chip-boosted');
    });
}

/**
 * Affiche l'état du combat : sprites, barres HP, ATB, ultime, statuts.
 */
function updateCombatDisplayUI(game) {
    if (!game.ui) initUiCacheUI(game);
    const ui = game.ui;

    // Fond d'arène : afficher img/background-arena.png sur la scène de combat quand le joueur est en arène
    const battleDisplayEl = document.getElementById('battleDisplay');
    if (battleDisplayEl) {
        if (game.arenaState.active) {
            battleDisplayEl.classList.add('arena-background');
        } else {
            battleDisplayEl.classList.remove('arena-background');
        }
    }

    if (game.currentPlayerCreature) {
        const creature = game.currentPlayerCreature;
        let maxHp = game.arenaState.active ? creature.maxHp : game.getPlayerMaxHp();
        let currentHp = game.arenaState.active ? creature.currentHp : (creature.mainAccountCurrentHp ?? maxHp);
        if (isNaN(maxHp) || maxHp === 0) maxHp = 1;
        const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));

        const statusIcon = creature.hasStatusEffect() && STATUS_ICONS[creature.statusEffect.type] ? STATUS_ICONS[creature.statusEffect.type] : '';
        if (ui.playerStatus && ui.playerStatus.innerHTML !== statusIcon) ui.playerStatus.innerHTML = statusIcon;

        const playerSpriteUrl = getPokemonSpriteUrl(creature.name, creature.isShiny, true);
        if (ui.playerSprite) {
            const currentSrc = ui.playerSprite.getAttribute('src');
            if (currentSrc !== playerSpriteUrl) ui.playerSprite.src = playerSpriteUrl;
        }

        updateTextContentUI(ui.playerName, creature.name + (creature.hasStatusEffect() ? ` [${creature.getStatusEffectName()}]` : ""));
        updateTextContentUI(ui.playerLevel, `Niv. ${creature.level} ${creature.prestige > 0 ? `★${creature.prestige}` : ''}`);
        updateTransformScaleXUI(ui.playerHpFill, hpRatio);
        updateTextContentUI(ui.playerHpText, `${formatNumber(currentHp)} / ${formatNumber(maxHp)}`);

        const stats = game.getEffectiveStats();
        if (ui.playerStats) {
            updateTextContentUI(document.getElementById('playerHudAtk'), formatNumber(stats.attack));
            updateTextContentUI(document.getElementById('playerHudSpAtk'), formatNumber(stats.spattack));
            updateTextContentUI(document.getElementById('playerHudDef'), formatNumber(stats.defense));
            updateTextContentUI(document.getElementById('playerHudSpDef'), formatNumber(stats.spdefense));
            updateTextContentUI(document.getElementById('playerHudSpd'), formatNumber(stats.speed));
        }

        const pThreshold = creature.actionThreshold || 10000;
        const rawAtbRatio = creature.actionGauge / pThreshold;
        updateTransformScaleXUI(ui.playerATB, Math.min(1, rawAtbRatio));

        const turnsStored = Math.floor(rawAtbRatio);
        const barColor = turnsStored > 1 ? '#eab308' : '#3b82f6';
        if (ui.playerATB && ui.playerATB.style.backgroundColor !== barColor) ui.playerATB.style.backgroundColor = barColor;

        if (ui.ultBtn && creature) {
            const ult = creature.ultimateAbility;
            const ultRatio = ult ? Math.min(1, creature.ultimateCharge / ult.chargeNeeded) : 0;
            updateTransformScaleXUI(ui.ultFill, ultRatio);
            const isActive = creature.ultimateActive;
            const isReady = ult && creature.ultimateCharge >= ult.chargeNeeded;

            if (isActive) {
                if (!ui.ultBtn.classList.contains('active')) {
                    ui.ultBtn.disabled = true;
                    ui.ultBtn.classList.add('active');
                    ui.ultBtn.classList.remove('ready');
                    updateTextContentUI(ui.ultText, "⚡ ACTIF");
                }
            } else if (isReady) {
                if (!ui.ultBtn.classList.contains('ready')) {
                    ui.ultBtn.disabled = false;
                    ui.ultBtn.classList.add('ready');
                    ui.ultBtn.classList.remove('active');
                    updateTextContentUI(ui.ultText, "★ PRÊT !");
                }
            } else {
                if (ui.ultBtn.classList.contains('ready') || ui.ultBtn.classList.contains('active')) {
                    ui.ultBtn.disabled = true;
                    ui.ultBtn.classList.remove('ready', 'active');
                }
                updateTextContentUI(ui.ultText, Math.floor(ultRatio * 100) + "%");
            }
        }
    }

    if ((game.combatState === 'starting' || game.combatState === 'fighting' || game.combatState === 'capture') && game.currentEnemy) {
        const enemy = game.currentEnemy;
        const maxHp = enemy.maxHp || 1;
        const enemyHpRatio = Math.max(0, Math.min(1, enemy.currentHp / maxHp));

        const enemyStatusIcon = enemy.hasStatusEffect() && STATUS_ICONS[enemy.statusEffect.type] ? STATUS_ICONS[enemy.statusEffect.type] : '';
        if (ui.enemyStatus && ui.enemyStatus.innerHTML !== enemyStatusIcon) ui.enemyStatus.innerHTML = enemyStatusIcon;

        const enemySpriteUrl = getPokemonSpriteUrl(enemy.name, enemy.isShiny, false);
        if (ui.enemySprite) {
            const currentSrc = ui.enemySprite.getAttribute('src');
            if (currentSrc !== enemySpriteUrl) ui.enemySprite.src = enemySpriteUrl;
            if (ui.enemySprite.style.opacity !== '1') ui.enemySprite.style.opacity = '1';
        }

        let eName = enemy.name;
        if (enemy.isBoss) eName = "[BOSS] " + eName;
        if (enemy.isEpic) eName = "[EPIC] " + eName;
        if (enemy.tier > 0) eName += ` [T${enemy.tier}]`;

        updateTextContentUI(ui.enemyName, eName + (enemy.hasStatusEffect() ? ` [${enemy.getStatusEffectName()}]` : ""));
        updateTextContentUI(ui.enemyLevel, `Niv. ${enemy.level}`);
        updateTransformScaleXUI(ui.enemyHpFill, enemyHpRatio);

        const rawEnemyAtb = enemy.actionGauge / (enemy.actionThreshold || 10000);
        updateTransformScaleXUI(ui.enemyATB, Math.min(1, rawEnemyAtb));
        updateTextContentUI(ui.enemyHpText, `${formatNumber(enemy.currentHp)} / ${formatNumber(maxHp)}`);

        if (ui.enemyStats) {
            updateTextContentUI(document.getElementById('enemyHudAtk'), formatNumber(enemy.attack));
            updateTextContentUI(document.getElementById('enemyHudSpAtk'), formatNumber(enemy.spattack));
            updateTextContentUI(document.getElementById('enemyHudDef'), formatNumber(enemy.defense));
            updateTextContentUI(document.getElementById('enemyHudSpDef'), formatNumber(enemy.spdefense));
            updateTextContentUI(document.getElementById('enemyHudSpd'), formatNumber(enemy.speed));
        }
    } else {
        const placeholderUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";
        if (ui.enemySprite) {
            const currentSrc = ui.enemySprite.getAttribute('src');
            if (currentSrc !== placeholderUrl) ui.enemySprite.src = placeholderUrl;
            if (ui.enemySprite.style.opacity !== '0.3') ui.enemySprite.style.opacity = '0.3';
        }
        updateTextContentUI(ui.enemyName, "En attente...");
        updateTextContentUI(ui.enemyLevel, "Niveau -");
        updateTransformScaleXUI(ui.enemyHpFill, 0);
        updateTransformScaleXUI(ui.enemyATB, 0);
        updateTextContentUI(ui.enemyHpText, "- / -");
        if (ui.enemyStats) {
            updateTextContentUI(document.getElementById('enemyHudAtk'), "-");
            updateTextContentUI(document.getElementById('enemyHudSpAtk'), "-");
            updateTextContentUI(document.getElementById('enemyHudDef'), "-");
            updateTextContentUI(document.getElementById('enemyHudSpDef'), "-");
            updateTextContentUI(document.getElementById('enemyHudSpd'), "-");
        }
        if (ui.effectiveness) ui.effectiveness.classList.remove('show');
    }

    const inCombat = (game.combatState === 'starting' || game.combatState === 'fighting') && game.currentEnemy;
    const alive = game.playerTeam ? game.playerTeam.filter(c => c.isAlive()).length : 0;

    if (ui.autoSelectBtn) {
        // Toujours cliquable : on ne désactive plus le bouton entre les combats
        ui.autoSelectBtn.disabled = false;
        const hasActive = ui.autoSelectBtn.classList.contains('auto-active');
        if (game.autoSelectEnabled && !hasActive) ui.autoSelectBtn.classList.add('auto-active');
        else if (!game.autoSelectEnabled && hasActive) ui.autoSelectBtn.classList.remove('auto-active');
    }

    if (ui.forfeitBtn) {
        ui.forfeitBtn.classList.remove('hidden');
        // Toujours cliquable : la logique de `forfeitCombat` gère déjà le cas "aucun combat"
        ui.forfeitBtn.disabled = false;
    }
}

// ============================================================
// MODALS MÉTIER (rendu HTML — logique dans Game)
// ============================================================

/**
 * Génère le HTML du contenu du modal d'éclosion d'œuf.
 * @param {Object} data - { title, spriteUrl, name, type, secondaryType, statsHTML, talentHTML, ultimateHTML }
 * @returns {string} HTML
 */
function renderEggHatchModalContent(data) {
    const type2 = data.secondaryType ? `<span class="type-badge type-${data.secondaryType}">${data.secondaryType}</span>` : '';
    const rarityLabels = { common: '★ COMMUN ★', rare: '★★ RARE ★★', epic: '★★★ EPIC ★★★', legendary: '✦ LÉGENDAIRE ✦' };
    const rarityLabel = rarityLabels[data.rarity] || data.rarity || '';
    const rarityBadge = rarityLabel ? `<div class="egg-hatch-rarity rarity-${data.rarity}">${rarityLabel}</div>` : '';
    const particlesHTML = '<div class="egg-hatch-particles" aria-hidden="true">' +
        '<span class="egg-particle"></span><span class="egg-particle"></span><span class="egg-particle"></span><span class="egg-particle"></span>' +
        '<span class="egg-particle"></span><span class="egg-particle"></span><span class="egg-particle"></span><span class="egg-particle"></span>' +
        '</div>';
    return particlesHTML + `
        ${rarityBadge}
        <div class="egg-hatch-title">${data.title}</div>
        <img src="${data.spriteUrl}" alt="${data.name}" class="egg-hatch-sprite">
        <h3 class="egg-hatch-name" style="font-size: 20px;">${data.name}</h3>
        <div class="egg-hatch-types">
            <span class="type-badge type-${data.type}">${data.type}</span>
            ${type2}
        </div>
        <div class="egg-hatch-stats">
            <div class="creature-stats">
                ${data.statsHTML}
            </div>
        </div>
        <button class="btn btn-save btn-super-confirm" onclick="game.closeEggHatchModal()">Super !</button>
    `;
}

/**
 * Affiche le modal d'éclosion (classes + contenu).
 * @param {HTMLElement} modalEl - #eggHatchModal
 * @param {HTMLElement} contentEl - #eggHatchContent
 * @param {Object} data - données pour renderEggHatchModalContent
 * @param {Object} options - { contentClass: 'shiny' | 'legendary' | '' }
 */
function showEggHatchModalUI(modalEl, contentEl, data, options) {
    if (!modalEl || !contentEl) return;
    let className = "quest-completion-content";
    if (options.contentClass) className += ' ' + options.contentClass;
    if (options.rarity) className += ' rarity-' + options.rarity;
    contentEl.className = className;
    contentEl.innerHTML = renderEggHatchModalContent(data);
    modalEl.classList.add('show');
}

/**
 * Ferme le modal d'éclosion (retire la classe show).
 */
function closeEggHatchModalUI() {
    const modal = document.getElementById('eggHatchModal');
    if (modal) modal.classList.remove('show');
}

/**
 * Affiche le modal de sélection d'objet à équiper.
 * @param {Array<{itemKey:string, name:string, description:string, count:number, iconHtml:string}>} itemsData
 * @param {number} creatureIndex
 * @param {string} location - 'team' | 'storage' | 'pension'
 */
function showItemSelectModalUI(itemsData, creatureIndex, location) {
    const existingOverlay = document.getElementById('itemSelectOverlay');
    if (existingOverlay) existingOverlay.remove();

    const modal = document.createElement('div');
    modal.id = 'itemSelectOverlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10001;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(4px);
    `;
    modal.onclick = function (e) { if (e.target === modal) modal.remove(); };

    let listHTML = '';
    if (itemsData.length === 0) {
        listHTML = `
            <div style="text-align: center; padding: 30px; color: #64748b; background: #f8fafc; border-radius: 10px; border: 2px dashed #cbd5e1;">
                <div style="font-size: 32px; margin-bottom: 10px;">🎒</div>
                <div>Aucun objet équipable disponible.</div>
                <div style="font-size: 11px; margin-top: 5px;">Trouvez des objets en Expédition ou dans la Tour !</div>
            </div>
        `;
    } else {
        itemsData.forEach(function (item) {
            listHTML += `
                <div class="item-select-card"
                     style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='#3b82f6';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#e2e8f0';"
                     onclick="game.equipItem('${item.itemKey}', ${creatureIndex}, '${location}'); document.getElementById('itemSelectOverlay').remove();">
                    <div style="font-size: 24px;">${item.iconHtml}</div>
                    <div style="flex: 1; text-align: left;">
                        <div style="font-weight: bold; color: #333;">${item.name} <span style="font-size: 10px; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 10px;">x${item.count}</span></div>
                        <div style="font-size: 11px; color: #666;">${item.description}</div>
                    </div>
                    <div style="font-weight: bold; color: #22c55e; font-size: 12px;">ÉQUIPER</div>
                </div>
            `;
        });
    }

    const content = `
        <div style="background: white; padding: 20px; border-radius: 15px; max-width: 450px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #333;">Choisir un Objet</h3>
                <button onclick="document.getElementById('itemSelectOverlay').remove()" style="background: #ef4444; color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-weight: bold;">×</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${listHTML}
            </div>
        </div>
    `;
    modal.innerHTML = content;
    document.body.appendChild(modal);
}

function closeEvolutionChoiceModalUI() {
    const modal = document.getElementById('evolutionChoiceOverlay');
    if (modal) modal.remove();
}

function showEvolutionChoiceModalUI(payload) {
    closeEvolutionChoiceModalUI();
    if (!payload || !Array.isArray(payload.options) || payload.options.length === 0) return;

    const modal = document.createElement('div');
    modal.id = 'evolutionChoiceOverlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10001;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(4px);
    `;
    modal.onclick = function (e) { if (e.target === modal) closeEvolutionChoiceModalUI(); };

    let optionsHTML = '';
    payload.options.forEach(function (opt, idx) {
        const evoName = String(opt.evolves_to || 'Inconnu');
        const itemKey = String(opt.requiredItem || '');
        const itemDef = (typeof ALL_ITEMS !== 'undefined' && itemKey && ALL_ITEMS[itemKey]) ? ALL_ITEMS[itemKey] : null;
        const reqLabel = itemKey
            ? `${(itemDef && itemDef.icon) ? itemDef.icon + ' ' : ''}${(itemDef && itemDef.name) ? itemDef.name : itemKey}`
            : `Niveau ${opt.requiredLevel || 1}`;
        const spriteId = (typeof POKEMON_SPRITE_IDS !== 'undefined' && POKEMON_SPRITE_IDS[evoName]) ? POKEMON_SPRITE_IDS[evoName] : null;
        const sprite = spriteId
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`
            : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

        optionsHTML += `
            <button class="shop-buy-btn" style="display:flex; align-items:center; gap:10px; width:100%; justify-content:flex-start;" onclick="game.evolveCreatureWithOption(${payload.creatureIndex}, '${payload.location}', ${idx}); closeEvolutionChoiceModalUI(); game.closeCreatureModal();">
                <img src="${sprite}" alt="${evoName}" style="width:36px; height:36px; object-fit:contain; image-rendering: pixelated;">
                <span style="font-weight:700;">${evoName}</span>
                <span style="margin-left:auto; font-size:12px; opacity:0.9;">Requis: ${reqLabel}</span>
            </button>
        `;
    });

    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 15px; max-width: 560px; width: 92%; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <h3 style="margin:0; color:#111827;">Choisir l'évolution (${payload.creatureName || 'Pokémon'})</h3>
                <button onclick="closeEvolutionChoiceModalUI()" style="background:#ef4444; color:white; border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-weight:bold;">×</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${optionsHTML}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Génère le HTML du contenu du modal créature (détail).
 * @param {Object} data - { titleLine, spriteUrl, type, secondaryType, rarity, maxLevel, tokenDisplay, statsBoxTitle, statsRowsHTML, moveHTML, talentHTML, ultimateHTML, itemHTML, actionsHTML }
 * @returns {string} HTML
 */
function renderCreatureModalContent(data) {
    const type2 = data.secondaryType ? `<span class="type-badge type-${data.secondaryType}">${data.secondaryType}</span>` : '';
    return `
        <div class="stats-header" style="border: none;">
            <h2 style="margin: 0;">${data.titleLine}</h2>
            <button class="stats-close" onclick="game.closeCreatureModal()">✕</button>
        </div>
        <div class="creature-modal-grid">
            <div class="creature-modal-sprite-wrap">
                <img src="${data.spriteUrl}" alt="${data.creatureName}" class="creature-modal-sprite">
                <div class="creature-modal-badges">
                    <span class="type-badge type-${data.type}">${data.type}</span>
                    ${type2}
                    <span class="rarity-label ${data.rarity}">${data.rarity}</span>
                </div>
            </div>
            <div class="creature-modal-main">
                ${data.tokenDisplay}
                <div class="creature-modal-stats-box">
                    <div class="creature-modal-stats-box-title">❤️ Stats ${data.ivButton}</div>
                    <div class="creature-modal-stats-row">
                        ${data.statsRowsHTML}
                    </div>
                </div>
                <div class="creature-modal-cards">
                    ${data.moveHTML}
                    <div class="creature-modal-info">
                        ${data.talentHTML}
                        ${data.ultimateHTML}
                        ${data.itemHTML}
                    </div>
                </div>
                <div class="creature-modal-actions">
                    ${data.actionsHTML}
                </div>
            </div>
        </div>
    `;
}

/**
 * Ferme le modal créature (retire la classe show).
 */
function closeCreatureModalUI() {
    const modal = document.getElementById('creatureModal');
    if (modal) modal.classList.remove('show');
}

function closeRocketContractSelectModalUI() {
    const existing = document.getElementById('rocketContractSelectOverlay');
    if (existing) existing.remove();
}

let rocketCasinoSpinLock = false;

function closeRocketCasinoModalUI() {
    const existing = document.getElementById('rocketCasinoOverlay');
    if (existing) existing.remove();
    rocketCasinoSpinLock = false;
}

// Anciennes clés de symboles → clés actuelles (pour l'historique)
var ROCKET_CASINO_SYMBOL_KEY_LEGACY = { 'logo_r': 'red_gyarados' };

function getRocketCasinoSymbolMeta(symbolKey) {
    const resolvedKey = (typeof ROCKET_CASINO_SYMBOL_KEY_LEGACY !== 'undefined' && ROCKET_CASINO_SYMBOL_KEY_LEGACY[symbolKey])
        ? ROCKET_CASINO_SYMBOL_KEY_LEGACY[symbolKey]
        : symbolKey;
    const cfg = (typeof ROCKET_CASINO_CONFIG !== 'undefined' && Array.isArray(ROCKET_CASINO_CONFIG.symbols))
        ? ROCKET_CASINO_CONFIG.symbols
        : [];
    const symbol = cfg.find(s => s.key === resolvedKey);
    if (!symbol) return { key: resolvedKey || symbolKey || 'unknown', id: 'N/A', label: resolvedKey || symbolKey || 'Inconnu', sprite: '', payMultiplier: 0 };
    return {
        key: symbol.key,
        id: symbol.id || symbol.key,
        label: symbol.label || symbol.key,
        sprite: symbol.sprite || '',
        payMultiplier: Number(symbol.payMultiplier) || 0
    };
}

function getRocketCasinoRewardSprite(reward) {
    if (!reward || !reward.rewardType) return { src: '', alt: '', label: '' };
    const t = String(reward.rewardType);
    const id = String(reward.targetId || '');
    if (t === 'currency') {
        if (id === 'marques_du_triomphe') return { src: 'img/marque-triomphe.png', alt: 'Marques du Triomphe', label: 'Marques' };
        if (id === 'essence_dust') return { src: 'img/essence-dust.png', alt: "Poussière d'essence", label: "Poussière" };
        if (id === 'pokedollars_scaled' || id === 'pokedollars') return { src: 'img/pokedollars.png', alt: 'Pokédollars', label: '$' };
    }
    if (t === 'quest_token') return { src: 'img/quest-token.png', alt: 'Jetons de Quête', label: 'Jetons' };
    if (t === 'jackpot') {
        const symbols = (typeof ROCKET_CASINO_CONFIG !== 'undefined' && ROCKET_CASINO_CONFIG.symbols) ? ROCKET_CASINO_CONFIG.symbols : [];
        const meowth = symbols.find(s => (s.key || '').toString() === 'meowth');
        return { src: (meowth && meowth.sprite) ? meowth.sprite : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png', alt: 'Jackpot Miaouss', label: 'Jackpot' };
    }
    if (t === 'item' && typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS) {
        const item = ALL_ITEMS[id] || (id.startsWith('ct_') ? { name: 'CT ' + id.replace('ct_', ''), img: null, icon: '📿' } : null);
        if (item) return { src: item.img || '', alt: item.name || id, label: item.name || id, icon: item.icon };
    }
    return { src: '', alt: id || t, label: id || t, icon: '📦' };
}

function rollRocketCasinoSymbolKey() {
    const cfg = (typeof ROCKET_CASINO_CONFIG !== 'undefined' && Array.isArray(ROCKET_CASINO_CONFIG.symbols))
        ? ROCKET_CASINO_CONFIG.symbols
        : [];
    if (cfg.length === 0) return null;
    const totalWeight = cfg.reduce((sum, s) => sum + Math.max(0, Number(s.weight) || 0), 0) || 1;
    let r = Math.random() * totalWeight;
    for (const s of cfg) {
        const w = Math.max(0, Number(s.weight) || 0);
        if (r < w) return s.key;
        r -= w;
    }
    return cfg[0].key;
}

function renderRocketCasinoHistoryUI(game) {
    const list = document.getElementById('rocketCasinoHistoryList');
    if (!list) return;
    const history = (game && game.teamRocketState && game.teamRocketState.casino && Array.isArray(game.teamRocketState.casino.history))
        ? game.teamRocketState.casino.history
        : [];
    if (history.length === 0) {
        list.innerHTML = '<div style="font-size:12px; color:#94a3b8;">Aucun spin pour le moment.</div>';
        return;
    }
    list.innerHTML = history.slice(0, 10).map(entry => {
        const centerLine = (entry.matrix && entry.matrix.length === 3)
            ? [entry.matrix[0][1], entry.matrix[1][1], entry.matrix[2][1]]
            : [];
        const reels = centerLine.map(k => {
            const meta = getRocketCasinoSymbolMeta(k);
            return `<img src="${meta.sprite}" alt="${meta.label}" class="rocket-casino-mini-symbol">`;
        }).join('');
        const pokedollarsGain = Number(entry.pokedollarsGain) || 0;
        const color = pokedollarsGain > 0 ? '#22c55e' : '#94a3b8';
        const formatFull = (n) => (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
        const gainsHtml = pokedollarsGain > 0
            ? `<span style="color:${color}; font-weight:600;">+${formatFull(pokedollarsGain)} <img src="img/pokedollars.png" alt="" class="rocket-casino-reward-sprite rocket-casino-gain-pokedollar"></span>`
            : '—';
        const rewardsList = Array.isArray(entry.rewards) ? entry.rewards : [];
        const otherRewards = rewardsList.filter(r => !(r.rewardType === 'currency' && (r.targetId === 'pokedollars_scaled' || r.targetId === 'pokedollars')));
        const rewardParts = otherRewards.map(r => {
            const meta = getRocketCasinoRewardSprite(r);
            const amount = Math.floor(Number(r.amount) || 0);
            const amountStr = amount > 0 ? formatFull(amount) : '';
            if (meta.src) {
                return `<span class="rocket-casino-history-reward" title="${meta.alt}"><img src="${meta.src}" alt="${meta.alt}" class="rocket-casino-reward-sprite">${amountStr ? ` ×${amountStr}` : ''}</span>`;
            }
            return `<span class="rocket-casino-history-reward" title="${meta.alt}">${meta.icon || '📦'}${amountStr ? ` ×${amountStr}` : ''}</span>`;
        });
        const rewardHtml = rewardParts.length ? rewardParts.join(' ') : '';
        return `
            <div class="rocket-casino-history-row">
                <div class="rocket-casino-history-reels">${reels}</div>
                <div class="rocket-casino-history-gains">${gainsHtml}</div>
                ${rewardHtml ? `<div class="rocket-casino-history-rewards">${rewardHtml}</div>` : ''}
            </div>
        `;
    }).join('');
}

function getRocketCasinoGridCellEl(col, row) {
    return document.getElementById(`rocketCasinoCell_${col}_${row}`);
}

function setRocketCasinoGridColumn(columnIndex, matrix, revealedClass = 'revealed') {
    for (let row = 0; row < 3; row++) {
        const key = matrix[columnIndex] && matrix[columnIndex][row];
        const meta = getRocketCasinoSymbolMeta(key);
        const cell = getRocketCasinoGridCellEl(columnIndex, row);
        if (!cell) continue;
        cell.innerHTML = `<img src="${meta.sprite}" alt="${meta.label}" class="rocket-casino-symbol-img">`;
        cell.classList.add(revealedClass);
    }
}

function clearRocketCasinoGridHighlights() {
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            const cell = getRocketCasinoGridCellEl(col, row);
            if (!cell) continue;
            cell.classList.remove('win-highlight');
        }
    }
}

function animateRocketCasinoCounter(startValue, endValue, durationMs, onUpdate, onDone) {
    const start = performance.now();
    const delta = endValue - startValue;
    const tick = (now) => {
        const t = Math.min(1, (now - start) / Math.max(1, durationMs));
        const eased = 1 - Math.pow(1 - t, 3);
        const value = Math.floor(startValue + (delta * eased));
        if (typeof onUpdate === 'function') onUpdate(value);
        if (t < 1) {
            requestAnimationFrame(tick);
        } else if (typeof onDone === 'function') {
            onDone();
        }
    };
    requestAnimationFrame(tick);
}

function animateRocketCasinoGridReveal(result, onDone) {
    const matrix = result.matrix || [[], [], []];
    const gridEl = document.getElementById('rocketCasinoGrid3x3');
    if (!gridEl) {
        if (typeof onDone === 'function') onDone();
        return;
    }
    clearRocketCasinoGridHighlights();

    const REEL_EXTRA_SYMBOLS = 12;
    const REEL_DURATION_MS = 2200;
    const REEL_STAGGER_MS = 180;
    const REEL_EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

    function buildReelStripHtml(colIndex) {
        const finalSymbols = [matrix[colIndex][0], matrix[colIndex][1], matrix[colIndex][2]].filter(Boolean);
        const keys = [];
        for (let i = 0; i < REEL_EXTRA_SYMBOLS; i++) keys.push(rollRocketCasinoSymbolKey());
        keys.push(...finalSymbols);
        return keys.map(key => {
            const meta = getRocketCasinoSymbolMeta(key || 'unknown');
            return `<div class="rocket-casino-reel-symbol"><img src="${meta.sprite}" alt="${meta.label}" class="rocket-casino-symbol-img"></div>`;
        }).join('');
    }

    gridEl.classList.add('rocket-casino-reels-mode');
    gridEl.innerHTML = [0, 1, 2].map(col => `
        <div class="rocket-casino-reel" id="rocketCasinoReel_${col}" data-col="${col}">
            <div class="rocket-casino-reel-strip">${buildReelStripHtml(col)}</div>
        </div>
    `).join('');

    gridEl.offsetHeight;

    [0, 1, 2].forEach((col, idx) => {
        const strip = document.querySelector(`#rocketCasinoReel_${col} .rocket-casino-reel-strip`);
        if (!strip) return;
        strip.style.transform = 'translateY(0)';
        strip.style.transition = `transform ${REEL_DURATION_MS}ms ${REEL_EASE}`;
        setTimeout(() => {
            strip.style.transform = 'translateY(-80%)';
        }, idx * REEL_STAGGER_MS);
    });

    const totalAnimMs = REEL_STAGGER_MS * 2 + REEL_DURATION_MS + 300;
    setTimeout(() => {
        gridEl.classList.remove('rocket-casino-reels-mode');
        gridEl.innerHTML = [0, 1, 2].map(row => [0, 1, 2].map(col => {
            const key = matrix[col] && matrix[col][row];
            const meta = getRocketCasinoSymbolMeta(key);
            return `<div class="rocket-casino-cell revealed" id="rocketCasinoCell_${col}_${row}"><img src="${meta.sprite}" alt="${meta.label}" class="rocket-casino-symbol-img"></div>`;
        }).join('')).join('');

        const wins = Array.isArray(result.winningLines) ? result.winningLines : [];
        let delay = 0;
        wins.forEach(win => {
            setTimeout(() => {
                (win.coords || []).forEach(([c, r]) => {
                    const cell = getRocketCasinoGridCellEl(c, r);
                    if (cell) cell.classList.add('win-highlight');
                });
            }, delay);
            delay += 260;
        });
        setTimeout(() => {
            if (typeof onDone === 'function') onDone();
        }, Math.max(0, delay));
    }, totalAnimMs);
}

function showRocketCasinoModalUI(game) {
    closeRocketCasinoModalUI();
    const tr = game && game.teamRocketState ? game.teamRocketState : {};
    const cfg = (typeof ROCKET_CASINO_CONFIG !== 'undefined') ? ROCKET_CASINO_CONFIG : { lineCostRJ: 250, defaultActivePaylines: 8 };
    const lineCost = Math.max(1, Math.floor(Number(cfg.lineCostRJ) || 250));
    const maxPaylines = 8;
    const defaultLines = Math.max(1, Math.min(maxPaylines, Math.floor(Number(cfg.defaultActivePaylines) || maxPaylines)));

    const overlay = document.createElement('div');
    overlay.id = 'rocketCasinoOverlay';
    overlay.className = 'stats-modal js-modal-overlay';
    overlay.style.display = 'flex';
    overlay.onclick = function (e) { if (e.target === overlay) closeRocketCasinoModalUI(); };

    overlay.innerHTML = `
        <div class="stats-content js-modal-content rocket-casino-modal-content">
            <div class="stats-header">
                <h2>🎰 Machine à Sous Rocket</h2>
                <button class="stats-close js-close-modal" type="button" onclick="closeRocketCasinoModalUI()">&times;</button>
            </div>
            <div class="rocket-casino-modal-grid">
                <div class="rocket-casino-main">
                    <div class="slots-machine">
                        <div class="slots-machine-screen" aria-hidden="false">
                            <div class="rocket-casino-grid3x3" id="rocketCasinoGrid3x3">
                                ${[0, 1, 2].map(row => [0, 1, 2].map(col => `<div class="rocket-casino-cell" id="rocketCasinoCell_${col}_${row}"><div class="rocket-casino-cell-mask">?</div></div>`).join('')).join('')}
                            </div>
                        </div>
                        <div class="slots-machine-scanlines" aria-hidden="true"></div>
                        <img src="img/slots-machine.png" class="slots-machine-frame" alt="">
                        <button class="spin-btn" id="rocketCasinoSpinBtn" aria-label="Lancer la machine"></button>
                    </div>
                </div>
                <div class="rocket-casino-side">
                    <div id="rocketCasinoModalRjText" class="shop-item-cost rocket-casino-rj-display" style="margin-bottom:12px; position:relative;">Jeton Rocket : ${typeof formatNumber === 'function' ? formatNumber(tr.rj || 0) : (tr.rj || 0)}</div>
                    <h4>Historique (10 derniers)</h4>
                    <div id="rocketCasinoHistoryList" class="rocket-casino-history"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    renderRocketCasinoHistoryUI(game);

    const rjText = document.getElementById('rocketCasinoModalRjText');
    const spinBtn = document.getElementById('rocketCasinoSpinBtn');

    const refreshRjLabel = () => {
        if (rjText && game && game.teamRocketState) {
            rjText.textContent = `Jeton Rocket : ${typeof formatNumber === 'function' ? formatNumber(game.teamRocketState.rj || 0) : (game.teamRocketState.rj || 0)}`;
        }
    };

    const runCasinoSpin = () => {
        if (!game || rocketCasinoSpinLock) return null;
        const linesPlayed = defaultLines;
        let stakeCost = lineCost * linesPlayed;

        // Calculate discounted cost for the UI
        if (game.upgrades && game.upgrades.casinoRoyal) {
            const reduction = game.upgrades.casinoRoyal.level * 0.05;
            stakeCost = Math.floor(stakeCost * (1 - reduction));
        }

        const beforeRJ = Math.max(0, Math.floor(Number(game.teamRocketState.rj) || 0));
        const result = (typeof game.handleRocketCasinoSpinAmount === 'function')
            ? game.handleRocketCasinoSpinAmount(linesPlayed)
            : null;
        if (!result) return null;
        const afterRJ = Math.max(0, Math.floor(Number(game.teamRocketState.rj) || 0));

        rocketCasinoSpinLock = true;
        if (spinBtn) spinBtn.disabled = true;

        if (rjText && typeof showFloatingText === 'function') {
            showFloatingText(`-${typeof formatNumber === 'function' ? formatNumber(stakeCost) : stakeCost}`, rjText, 'ft-debt ft-from-rj');
        }

        animateRocketCasinoGridReveal(result, () => {
            renderRocketCasinoHistoryUI(game);

            animateRocketCasinoCounter(beforeRJ, afterRJ, 550, (value) => {
                if (rjText) rjText.textContent = `Jeton Rocket : ${typeof formatNumber === 'function' ? formatNumber(value) : value}`;
            }, () => {
                if (rjText) rjText.textContent = `Jeton Rocket : ${typeof formatNumber === 'function' ? formatNumber(afterRJ) : afterRJ}`;
            });

            rocketCasinoSpinLock = false;
            if (spinBtn) spinBtn.disabled = false;
            refreshRjLabel();
        });
        return result;
    };

    if (spinBtn) {
        spinBtn.onclick = function () {
            runCasinoSpin();
        };
        spinBtn.onmousedown = function () {
            spinBtn.classList.add('spin-pressed-btn');
        };
        const releaseSpin = function () {
            spinBtn.classList.remove('spin-pressed-btn');
        };
        spinBtn.onmouseup = releaseSpin;
        spinBtn.onmouseleave = releaseSpin;
    }
    refreshRjLabel();
}

function updateTeamRocketLoanRealtimeUI(game) {
    if (!game || !game.teamRocketState) return;
    const tr = game.teamRocketState;
    const loan = tr.loan || {};
    const debtPct = loan.totalDebt > 0 ? Math.floor(((loan.totalDebt - loan.remainingDebt) / loan.totalDebt) * 100) : 0;
    const fmt = (v) => typeof formatNumber === 'function' ? formatNumber(v) : v;

    const card = document.getElementById('rocketLoanCard');
    if (card) {
        if (loan.active) card.classList.remove('not-affordable');
        else card.classList.add('not-affordable');
    }

    const debtText = document.getElementById('rocketLoanDebtText');
    if (debtText) debtText.textContent = `Dette: ${fmt(loan.remainingDebt || 0)}$ / ${fmt(loan.totalDebt || 0)}$`;

    const fill = document.getElementById('rocketLoanDebtFill');
    if (fill) {
        fill.style.width = `${debtPct}%`;
        fill.style.background = loan.active ? '#ef4444' : '#22c55e';
    }

    const status = document.getElementById('rocketLoanStatusText');
    if (status) {
        status.style.color = loan.active ? '#ef4444' : '#94a3b8';
        status.textContent = loan.active ? `Endetté: ${debtPct}% remboursé` : 'Aucune dette active';
    }

    const borrowBtn = document.getElementById('rocketLoanBorrowBtn');
    if (borrowBtn) borrowBtn.disabled = !!(loan.active && loan.remainingDebt > 0);
}

function updateTeamRocketBankRealtimeUI(game) {
    if (!game || !game.teamRocketState) return;
    const tr = game.teamRocketState;
    const bank = tr.bank || {};
    const trustLevelRate = Math.max(1, Math.floor(Number(tr.trustLevel) || 1));
    const fmt = (v) => typeof formatNumber === 'function' ? formatNumber(v) : v;
    const totalInterestRaw = Math.max(0, Number(bank.totalInterestGenerated) || 0) + Math.max(0, Number(bank.interestCarry) || 0);
    const totalInterestDisplay = Math.max(0, totalInterestRaw - Math.max(0, Number(bank.interestDisplayOffset) || 0));

    const rateText = document.getElementById('rocketBankRateText');
    if (rateText) rateText.textContent = `Rendement ${trustLevelRate}%/h, payé chaque minute.`;

    const balanceText = document.getElementById('rocketBankBalanceText');
    if (balanceText) {
        const precise = totalInterestDisplay.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        balanceText.textContent = `Solde: ${fmt(bank.balance || 0)}$ • Intérêts cumulés: ${precise}$`;
    }
}

function updateTeamRocketStakingRealtimeUI(game) {
    if (!game || !game.teamRocketState || !game.teamRocketState.staking) return;
    const staking = game.teamRocketState.staking;
    if (typeof game.updateRocketStakingPushSession === 'function') game.updateRocketStakingPushSession(Date.now());
    const session = staking.activeSession;
    const now = Date.now();
    const cycleMs = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined' && Number(ROCKET_PUSH_STAKING_CONFIG.cycleMs) > 0)
        ? Number(ROCKET_PUSH_STAKING_CONFIG.cycleMs)
        : 30000;
    const nextRotateAt = Math.max(0, Number(staking.nextOfferRotateAt) || 0);
    const rotateLeftMs = Math.max(0, nextRotateAt - now);
    const rotateLeftText = (typeof formatTimeString === 'function') ? formatTimeString(rotateLeftMs) : `${Math.ceil(rotateLeftMs / 1000)}s`;

    const timerText = document.getElementById('rocketStakingContractTimerText');
    if (timerText) {
        timerText.textContent = session
            ? `Session active: risque testé à chaque phase (25–35 s) • Prochaine sélection possible dans ${rotateLeftText}`
            : `Rotation aléatoire: 3 objets • Nouvelle sélection dans ${rotateLeftText}`;
    }
    if (!session) {
        if (document.getElementById('rocketPushTimerCircle') && typeof game.updateTeamRocketDisplay === 'function') {
            game.updateTeamRocketDisplay();
        }
        return;
    }

    let cycleLeftMs = cycleMs;
    let cycleProgressPct = 0;
    if (session.nextPhaseEndAt != null && session.currentPhaseDurationMs != null) {
        cycleLeftMs = Math.max(0, Number(session.nextPhaseEndAt) - now);
        const phaseDuration = Math.max(1, Number(session.currentPhaseDurationMs) || 1);
        const progressInPhase = Math.max(0, phaseDuration - cycleLeftMs);
        cycleProgressPct = Math.max(0, Math.min(100, (progressInPhase / phaseDuration) * 100));
    } else {
        const elapsedMs = Math.max(0, now - (session.startedAt || now));
        const cycleProgress = elapsedMs % cycleMs;
        cycleLeftMs = Math.max(0, cycleMs - cycleProgress);
        cycleProgressPct = Math.max(0, Math.min(100, (cycleProgress / cycleMs) * 100));
    }
    const cycleLeftText = (typeof formatTimeString === 'function') ? formatTimeString(cycleLeftMs) : `${Math.ceil(cycleLeftMs / 1000)}s`;
    const riskPct = (typeof game.getRocketStealRiskPercent === 'function') ? game.getRocketStealRiskPercent(session.tier || 1, session) : 0;
    const isHighRisk = riskPct > 20;

    const circle = document.getElementById('rocketPushTimerCircle');
    if (circle) circle.style.setProperty('--progress', `${cycleProgressPct.toFixed(2)}`);

    const timer = document.getElementById('rocketPushTimerText');
    if (timer) timer.textContent = cycleLeftText;

    const rjLive = document.getElementById('rocketPushRjLive');
    if (rjLive) rjLive.textContent = `RJ accumulés: ${typeof formatNumber === 'function' ? formatNumber(Math.floor(session.accruedRJ || 0)) : Math.floor(session.accruedRJ || 0)}`;

    const gpsLive = document.getElementById('rocketPushGpsLive');
    if (gpsLive) {
        const gpsVal = Number(session.currentGps || 0);
        const multVal = Number(session.multiplier || 1);
        const gpsStr = (typeof formatFloatingNumber === 'function')
            ? formatFloatingNumber(gpsVal)
            : gpsVal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const multStr = (typeof formatFloatingNumber === 'function')
            ? formatFloatingNumber(multVal)
            : multVal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        gpsLive.textContent = `GPS: ${gpsStr} RJ/s (x${multStr})`;
    }

    const riskLive = document.getElementById('rocketPushRiskLive');
    if (riskLive) {
        riskLive.textContent = `Risque de vol fin de phase: ${riskPct}%`;
        riskLive.style.color = isHighRisk ? '#ef4444' : '#f59e0b';
    }
}

function showRocketContractSelectModalUI(game, contract, options) {
    closeRocketContractSelectModalUI();
    const list = Array.isArray(options) ? options : [];
    const needed = Math.max(1, Number(contract && contract.amount) || 1);
    const requestedType = (contract && contract.requestedType) || '';
    const requestedKey = (contract && contract.requestedKey) || '';

    const modal = document.createElement('div');
    modal.id = 'rocketContractSelectOverlay';
    modal.className = 'stats-modal js-modal-overlay';
    modal.style.display = 'flex';
    modal.onclick = function (e) {
        if (e.target === modal) closeRocketContractSelectModalUI();
    };

    let bodyHtml = '';
    if (requestedType === 'item') {
        const opt = list[0] || { name: requestedKey, key: requestedKey, have: 0, needed, img: null, icon: '📦' };
        const ok = (opt.have || 0) >= needed;
        const iconHtml = (typeof getItemIconHTML === 'function')
            ? getItemIconHTML({ name: opt.name, img: opt.img, icon: opt.icon })
            : (opt.icon || '📦');
        bodyHtml = `
            <div class="shop-item ${ok ? '' : 'not-affordable'}" style="margin-top:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="min-width:32px; display:flex; align-items:center; justify-content:center;">${iconHtml}</div>
                    <div class="shop-item-name">${opt.name}</div>
                </div>
                <div class="shop-item-cost">Possédé: ${typeof formatNumber === 'function' ? formatNumber(opt.have || 0) : (opt.have || 0)} / ${needed}</div>
                ${!ok ? '<div style="font-size:12px; color:#ef4444; margin-top:6px;">Ressources insuffisantes.</div>' : ''}
            </div>
        `;
    } else {
        const cards = list.map(opt => `
            <label class="shop-item rocket-contract-select-card" style="display:block; cursor:pointer; margin-top:8px;">
                <div class="rocket-contract-select-row">
                    <input type="checkbox" class="rocket-contract-choice" value="${opt.storageIndex}">
                    <img src="${typeof getPokemonSpriteUrl === 'function' ? getPokemonSpriteUrl(opt.name, opt.isShiny) : ''}" alt="${opt.name}" style="width:44px; height:44px; image-rendering:pixelated; object-fit:contain;">
                    <div class="rocket-contract-select-meta">
                        <div class="shop-item-name">${opt.isShiny ? '✨ ' : ''}${opt.name}</div>
                        <div class="shop-item-description">Rareté: ${opt.rarity} • Niveau ${opt.level}</div>
                    </div>
                </div>
            </label>
        `).join('');
        bodyHtml = cards || `<div style="font-size:12px; color:#ef4444; margin-top:10px;">Aucun Pokémon compatible disponible.</div>`;
    }

    modal.innerHTML = `
        <div class="stats-content js-modal-content" style="max-width: 760px; width:min(92vw, 760px);">
            <div class="stats-header">
                <h2>Sélection contrat Rocket</h2>
                <button class="stats-close js-close-modal" type="button" onclick="closeRocketContractSelectModalUI()">&times;</button>
            </div>
            <div style="font-size:12px; color:#cbd5e1;">
                Exigence: ${requestedType} ${requestedKey} x${needed}
            </div>
            <div id="rocketContractSelectList" style="margin-top: 8px;">
                ${bodyHtml}
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top: 12px;">
                <button class="shop-buy-btn" onclick="closeRocketContractSelectModalUI()">Annuler</button>
                <button class="shop-buy-btn" id="rocketContractConfirmBtn">Confirmer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const confirmBtn = document.getElementById('rocketContractConfirmBtn');
    if (!confirmBtn) return;
    confirmBtn.onclick = function () {
        if (!game || typeof game.handleRocketConfirmContractSelection !== 'function') return;
        if (requestedType === 'item') {
            const ok = game.handleRocketConfirmContractSelection(contract.contractId, []);
            if (ok) closeRocketContractSelectModalUI();
            return;
        }
        const checked = Array.from(document.querySelectorAll('#rocketContractSelectList .rocket-contract-choice:checked'))
            .map(el => Number(el.value))
            .filter(Number.isInteger);
        if (checked.length !== needed) {
            if (typeof logMessage === 'function') logMessage(`❌ Sélection invalide: choisissez exactement ${needed} Pokémon.`);
            return;
        }
        const ok = game.handleRocketConfirmContractSelection(contract.contractId, checked);
        if (ok) closeRocketContractSelectModalUI();
    };
}

// ============================================================
// EXPORTS GLOBAUX (Pas d'import/export ES6 - Scope window)
// ============================================================

// Toutes les fonctions sont déjà globales (function declaration),
// mais on les attache explicitement à window pour la clarté et la sécurité.
window.showFloatingText = showFloatingText;
window.closeSynergyModal = closeSynergyModal;
window.closeSynergyListModal = closeSynergyListModal;
window.closeOfflineModal = closeOfflineModal;
window.switchTab = switchTab;
window.switchShopSubTab = switchShopSubTab;
window.updateZoneInfo = updateZoneInfo;
window.showZoneTierModal = showZoneTierModal;
window.playCaptureSequence = playCaptureSequence;
window.getItemIconPath = getItemIconPath;
window.getPokemonSpritePath = getPokemonSpritePath;
window.getRarityClass = getRarityClass;
window.closeZoneTierModal = closeZoneTierModal;
window.getPokemonSpriteUrl = getPokemonSpriteUrl;
window.togglePension = togglePension;
window.logMessage = logMessage;
window.getItemIconHTML = getItemIconHTML;
window.updateItemsDisplayUI = updateItemsDisplayUI;
window.updateTeamDisplayUI = updateTeamDisplayUI;
window.updateStorageDisplayUI = updateStorageDisplayUI;
window.updatePokeMartDisplayUI = updatePokeMartDisplayUI;
window.updateUpgradesDisplayUI = updateUpgradesDisplayUI;
window.updateShopDisplayUI = updateShopDisplayUI;
window.updateTowerShopDisplayUI = updateTowerShopDisplayUI;
window.updateRecyclerDisplayUI = updateRecyclerDisplayUI;
window.initUiCacheUI = initUiCacheUI;
window.updateTextContentUI = updateTextContentUI;
window.updateTransformScaleXUI = updateTransformScaleXUI;
window.updatePlayerStatsDisplayUI = updatePlayerStatsDisplayUI;
window.updateCombatDisplayUI = updateCombatDisplayUI;
window.updateTeamRocketDisplayUI = updateTeamRocketDisplayUI;
window.STATUS_ICONS = STATUS_ICONS;
window.renderEggHatchModalContent = renderEggHatchModalContent;
window.showEggHatchModalUI = showEggHatchModalUI;
window.closeEggHatchModalUI = closeEggHatchModalUI;
window.showItemSelectModalUI = showItemSelectModalUI;
window.showEvolutionChoiceModalUI = showEvolutionChoiceModalUI;
window.closeEvolutionChoiceModalUI = closeEvolutionChoiceModalUI;
window.renderCreatureModalContent = renderCreatureModalContent;
window.closeCreatureModalUI = closeCreatureModalUI;
window.showRocketContractSelectModalUI = showRocketContractSelectModalUI;
window.closeRocketContractSelectModalUI = closeRocketContractSelectModalUI;
window.showRocketCasinoModalUI = showRocketCasinoModalUI;
window.closeRocketCasinoModalUI = closeRocketCasinoModalUI;
window.updateTeamRocketBankRealtimeUI = updateTeamRocketBankRealtimeUI;
window.updateTeamRocketLoanRealtimeUI = updateTeamRocketLoanRealtimeUI;
window.updateTeamRocketStakingRealtimeUI = updateTeamRocketStakingRealtimeUI;

// ============================================================
// MOBILE NAVIGATION
// ============================================================

/**
 * Bascule entre les 3 panneaux principaux sur mobile.
 * @param {'combat'|'team'|'extras'} panelName
 */
function switchMobilePanel(panelName) {
    // Only act on mobile viewports
    if (window.innerWidth > 768) return;

    const combatArea = document.querySelector('.combat-area');
    const teamArea = document.querySelector('.team-area');
    const secondaryContent = document.getElementById('secondaryContent');

    // Remove active class from all panels
    [combatArea, teamArea, secondaryContent].forEach(el => {
        if (el) el.classList.remove('mobile-active');
    });

    // Show the selected panel
    switch (panelName) {
        case 'combat':
            if (combatArea) combatArea.classList.add('mobile-active');
            break;
        case 'team':
            if (teamArea) teamArea.classList.add('mobile-active');
            break;
        case 'extras':
            if (secondaryContent) secondaryContent.classList.add('mobile-active');
            break;
    }

    // Update nav buttons
    const navBtns = document.querySelectorAll('.mobile-nav-btn');
    navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === panelName);
    });
}

/**
 * Initialize mobile layout on load (set combat as default active panel).
 */
function initMobileLayout() {
    if (window.innerWidth <= 768) {
        switchMobilePanel('combat');
    }
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileLayout);
} else {
    initMobileLayout();
}

// Re-init when resizing between mobile/desktop
window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    const combatArea = document.querySelector('.combat-area');
    const teamArea = document.querySelector('.team-area');
    const secondaryContent = document.getElementById('secondaryContent');

    if (!isMobile) {
        // Desktop: remove mobile classes
        [combatArea, teamArea, secondaryContent].forEach(el => {
            if (el) el.classList.remove('mobile-active');
        });
    } else {
        // Mobile: ensure one panel is active
        const anyActive = document.querySelector('.combat-area.mobile-active, .team-area.mobile-active, .secondary-content.mobile-active');
        if (!anyActive) switchMobilePanel('combat');
    }
});

window.switchMobilePanel = switchMobilePanel;

// --- GESTION DES SWIPES (MOBILE) ---
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
const SWIPE_THRESHOLD = 50;

function handleGesture() {
    if (window.innerWidth > 768) return;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Ignore swipe if it's more vertical than horizontal (user is scrolling)
    if (Math.abs(diffY) > Math.abs(diffX)) return;

    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        const activeNavBtn = document.querySelector('.mobile-nav-btn.active');
        if (!activeNavBtn) return;

        const currentPanel = activeNavBtn.dataset.panel;
        const panels = ['combat', 'team', 'extras'];
        const currentIndex = panels.indexOf(currentPanel);

        if (diffX < 0) {
            // Swipe Left -> next panel
            if (currentIndex < panels.length - 1) {
                switchMobilePanel(panels[currentIndex + 1]);
            }
        } else {
            // Swipe Right -> previous panel
            if (currentIndex > 0) {
                switchMobilePanel(panels[currentIndex - 1]);
            }
        }
    }
}

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
}, { passive: true });
