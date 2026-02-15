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

    // POSITIONNEMENT RESSERRÉ (Moins éparpillé)
    
    // On réduit la zone horizontale : entre -20% et +20% (au lieu de -40/+40)
    const randomOffset = (Math.random() * 40) - 20; 
    textElement.style.left = `calc(50% + ${randomOffset}%)`;
    
    // On réduit la variation verticale : entre 40px et 60px (au lieu de 40 à 80)
    const randomBottom = 40 + (Math.random() * 20);
    textElement.style.bottom = `${randomBottom}px`;

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
            if(spriteElement) spriteElement.classList.add('absorbed');
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
                    if(spriteElement) {
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
    
    // 3. Fallback : Si aucune image n'est définie
    return `assets/items/${itemKey}.png`; 
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
    return `assets/sprites/${name.toLowerCase()}.png`;
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

// ============================================================
// BLOC 3 : Mise à jour des panneaux (Inventaire, Équipe, Boutiques)
// Ces fonctions reçoivent game en paramètre et accèdent aux données via game.xxx
// ============================================================

/**
 * Affiche le contenu du Sac à Dos (Inventaire).
 */
function updateItemsDisplayUI(game) {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    const itemKeys = Object.keys(game.items).filter(key => game.items[key] > 0);

    let headerCount = document.getElementById('inventory-total-count');
    let grid = container.querySelector('.inventory-grid');

    if (!grid) {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; color:#334155; font-size:18px;">🎒 Sac à dos</h3>
                <span id="inventory-total-count" style="font-size:11px; color:#64748b; font-weight:700; background:#f1f5f9; padding:4px 8px; border-radius:12px;">0 OBJETS</span>
            </div>
            <div id="inventory-empty-msg" style="display:none; text-align: center; color: #94a3b8; padding: 30px; border: 2px dashed #e2e8f0; border-radius: 10px; font-style: italic;">Votre sac est vide.</div>
        `;
        grid = document.createElement('div');
        grid.className = 'inventory-grid';
        container.appendChild(grid);
        headerCount = document.getElementById('inventory-total-count');
    }

    if (headerCount) headerCount.textContent = `${itemKeys.length} TYPES D'OBJETS`;

    const emptyMsg = document.getElementById('inventory-empty-msg');
    if (itemKeys.length === 0) {
        if (grid) grid.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    if (grid) grid.style.display = 'grid';
    if (emptyMsg) emptyMsg.style.display = 'none';

    itemKeys.sort((a, b) => {
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

    itemKeys.forEach(key => {
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
                card.style.borderColor = "#ffd700";
                card.style.background = "#fffbeb";
                typeIcon = '<span class="item-type-badge" style="background:#fef3c7; color:#d97706;">CLÉ</span>';
                clickAction = "toast.info('Objet Clé', 'Cet objet s\\'active automatiquement dans les zones appropriées.')";
            } else if (typeof HELD_ITEMS !== 'undefined' && HELD_ITEMS[key]) {
                card.classList.add('is-held-item');
                typeIcon = '<span class="item-type-badge">ÉQUIP.</span>';
                clickAction = "toast.info('Objet Tenu', 'Équipez cet objet depuis le menu d\\'une créature.')";
            }

            let iconHTML = `<div style="font-size:32px;">${item.icon || '📦'}</div>`;
            if (item.img) {
                iconHTML = `<img src="${item.img}" class="item-sprite-img" alt="${item.name}" style="width:48px; height:48px; object-fit:contain;">`;
            }

            const isVitamin = item.effect && item.effect.duration === null;
            const safeName = (item.name || '').replace(/'/g, "\\'");
            const safeDesc = (item.description || "").replace(/'/g, "\\'");

            card.innerHTML = `
                <div class="inventory-slot-content" 
                     onmouseenter="game.scheduleTooltip(event, '${safeName}', '${safeDesc}')" 
                     onmouseleave="game.hideTooltip()"
                     onclick="${clickAction}" 
                     style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
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

    for (let i = 0; i < maxTeamSize; i++) {
        if (i < game.playerTeam.length) {
            const creature = game.playerTeam[i];
            const card = document.createElement('div');
            card.className = "creature-card rarity-" + creature.rarity;
            card.style.cursor = 'pointer';
            card.setAttribute('onclick', `game.showCreatureModal(${i}, 'team')`);

            if (creature.isShiny) card.className += " shiny";
            if (i === game.activeCreatureIndex) card.classList.add('active');
            if (!creature.isAlive()) card.classList.add('fainted');

            const maxLevel = 100 + (creature.prestige * 10);
            const shardKey = typeof getShardKey === 'function' ? getShardKey(creature.name, creature.rarity) : creature.name;
            const currentShards = game.shards[shardKey] || 0;
            const prestigeCost = game.getPrestigeCost(creature.prestige);
            const expPercent = (creature.exp / creature.expToNext) * 100;
            const spriteUrl = getPokemonSpriteUrl(creature.name, creature.isShiny, false);

            if (creature.level >= maxLevel && currentShards >= prestigeCost) card.classList.add('prestige-ready');

            const teamTransferRate = ((game.getTeamContributionRate && game.getTeamContributionRate()) || 0.10) * 100;
            const teamTransferRateStr = teamTransferRate.toFixed(0);

            card.innerHTML = `
                <img src="${spriteUrl}" alt="${creature.name}" class="team-slot-sprite">
                <div class="team-slot-name">${creature.name} ${creature.prestige > 0 ? `★${creature.prestige}` : ''}</div>
                <div class="team-slot-level">Niv. ${creature.level}</div>
                <div class="exp-bar" style="height: 8px; margin-top: 5px;">
                    <div class="exp-fill" style="width: ${expPercent}%;"></div>
                </div>
                <div class="team-slot-info">
                    <span style="color: ${creature.currentStamina === 0 ? '#ef4444' : '#22c55e'};">⚡ ${creature.currentStamina}/${creature.maxStamina}</span>
                    <span style="color: #8a2be2;">💎 ${currentShards}/${prestigeCost}</span>
                </div>
                <div class="team-contribution-trigger" data-creature-index="${i}" style="background: rgba(34, 197, 94, 0.15); padding: 6px 8px; border-radius: 5px; margin-top: 5px; width: 100%; font-size: 11px;">
                    <span style="font-weight: bold; color: #16a34a;">Contribution (${teamTransferRateStr}%) :</span>
                    <span class="team-contribution-btn">Voir détails</span>
                </div>
            `;
            teamList.appendChild(card);
            const triggerEl = card.querySelector('.team-contribution-trigger');
            if (triggerEl) {
                triggerEl.addEventListener('mouseenter', function(e) { e.stopPropagation(); game.showTeamContributionPopover(i, this); });
                triggerEl.addEventListener('mouseleave', function() { game.scheduleHidePensionContributionPopover(150); });
            }
        } else {
            const emptySlot = document.createElement('div');
            emptySlot.className = "team-slot-empty";
            emptySlot.textContent = "+";
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

        card.innerHTML = `
            <img src="${spriteUrl}" alt="${creature.name}" class="team-slot-sprite">
            <div class="team-slot-name">${creature.name} ${creature.prestige > 0 ? `★${creature.prestige}` : ''}</div>
            <div class="team-slot-level">Niv. ${creature.level}</div>
            <div class="exp-bar" style="height: 4px; margin-top: 2px;">
                <div class="exp-fill" style="width: ${expPercent}%;"></div>
            </div>
            <div class="team-slot-info" style="justify-content: center;">
                <span style="color: #8a2be2;">💎 ${currentShards}/${prestigeCost}</span>
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
    Object.entries(POKEMART_ITEMS).forEach(([key, shopEntry]) => {
        const card = document.createElement('div');
        card.className = 'shop-item';
        const realItem = ALL_ITEMS[shopEntry.itemId];
        const iconHTML = getItemIconHTML(realItem || shopEntry);
        const canAfford = game.pokedollars >= shopEntry.cost;

        card.innerHTML = `
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
        `;
        container.appendChild(card);
    });
}

/**
 * Affiche les améliorations (upgrades).
 */
function updateUpgradesDisplayUI(game) {
    const upgradesContainer = document.getElementById('upgradesContainer');
    if (!upgradesContainer) return;

    upgradesContainer.innerHTML = '';

    if (!game.upgrades) return;
    Object.entries(game.upgrades).forEach(([key, upgrade]) => {
        const upgradeCard = document.createElement('div');
        upgradeCard.className = 'upgrade-card';

        const cost = game.getUpgradeCost(key);
        const canAfford = game.canAffordUpgrade(key);
        const isMaxLevel = upgrade.level >= upgrade.maxLevel;

        let currentEffect = "";
        switch (key) {
            case 'critMastery':
                currentEffect = "Bonus actuel: +" + (upgrade.level * 1).toFixed(0) + "%";
                break;
            case 'expBoost':
                currentEffect = "Multiplicateur: x" + (game.getExpMultiplier() * 100 / 100).toFixed(1);
                break;
            case 'eggDrop':
                currentEffect = "Bonus: +" + (game.getEggDropBonus() * 100).toFixed(0) + "%";
                break;
            case 'staminaRegen':
                currentEffect = "Temps: " + (game.getStaminaRegenTime() / 1000).toFixed(1) + "s";
                break;
            case 'shardBonus':
                currentEffect = "Chance: " + (game.getShardBonusChance() * 100).toFixed(0) + "%";
                break;
            case 'pension':
                currentEffect = "Slots: " + game.getPensionSlots() + " | Transfert: " + (game.getPensionTransferRate() * 100).toFixed(0) + "%";
                break;
            case 'respawn':
                currentEffect = `Délai réduit: -${upgrade.level * 50}ms`;
                break;
            case 'recycle':
                currentEffect = "Chance d'économie: " + (upgrade.level * 2.5).toFixed(0) + "%";
                break;
            case 'second_chance':
                currentEffect = "Chance de relance: " + (upgrade.level * 1).toFixed(0) + "%";
                break;
        }

        upgradeCard.innerHTML = `
            <div class="upgrade-title">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-stats">
                <div class="upgrade-level">Niveau: ${upgrade.level}/${upgrade.maxLevel}</div>
                <div class="upgrade-effect">${upgrade.effect}</div>
            </div>
            ${currentEffect ? `<div style="font-size: 12px; color: #666; margin-bottom: 10px;">${currentEffect}</div>` : ''}
            <div class="upgrade-cost" style="margin-bottom: 15px;">
                ${isMaxLevel ? 'NIVEAU MAX' : cost + ' Pokedollars'}
            </div>
            <button class="upgrade-btn" 
                    onclick="game.buyUpgrade('${key}')" 
                    ${!canAfford || isMaxLevel ? 'disabled' : ''}>
                ${isMaxLevel ? 'NIVEAU MAX' : (canAfford ? 'ACHETER' : 'PAS ASSEZ DE FONDS')}
            </button>
        `;
        upgradesContainer.appendChild(upgradeCard);
    });
}

/**
 * Affiche la boutique aux jetons (Shop).
 */
function updateShopDisplayUI(game) {
    const shopContainer = document.getElementById('shopContainer');
    const shopTokens = document.getElementById('shopTokens');
    if (!shopContainer) return;

    if (shopTokens) shopTokens.textContent = game.questTokens;
    shopContainer.innerHTML = '';

    if (typeof SHOP_ITEMS === 'undefined') return;
    Object.entries(SHOP_ITEMS).forEach(([key, item]) => {
        const card = document.createElement('div');
        card.className = 'shop-item';

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

        const canAfford = !isMaxed && game.questTokens >= currentCost;

        let extraInfo = '';
        if (item.type === 'permanent' && item.effect.type === 'permanentXP') {
            extraInfo = `<div style="font-size: 11px; color: #666; margin-top: 5px;">Actuel : +${((game.permanentBoosts.xp || 0) * 100).toFixed(0)}% XP</div>`;
        }
        if (item.type === 'permanent' && item.effect.type === 'pensionSlot') {
            extraInfo = `<div style="font-size: 11px; color: #666; margin-top: 5px;">Slots bonus : ${game.permanentBoosts.pensionSlots || 0}</div>`;
        }

        const buttonText = isMaxed ? "MAXIMISÉ" : (canAfford ? 'Acheter' : 'Pas assez de jetons');
        const costText = isMaxed ? "" : `🎫 ${currentCost} Jetons`;
        const iconHTML = getItemIconHTML(item);

        card.innerHTML = `
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
        `;
        shopContainer.appendChild(card);
    });
}

/**
 * Affiche la boutique Tour (Marques du Triomphe).
 */
function updateTowerShopDisplayUI(game) {
    const shopContainer = document.getElementById('towerShopContainer');
    if (!shopContainer) return;

    shopContainer.innerHTML = '';

    if (typeof TOWER_SHOP_ITEMS === 'undefined') return;
    Object.entries(TOWER_SHOP_ITEMS).forEach(([key, item]) => {
        const card = document.createElement('div');
        card.className = 'shop-item';

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

        card.innerHTML = `
            <div class="shop-item-name">${item.name}${levelText}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-cost">Ⓜ️ ${isMaxLevel ? 'MAX' : cost} Marques</div>
            <button class="shop-buy-btn" onclick="game.buyTowerShopItem('${key}')" ${!canAfford || isMaxLevel ? 'disabled' : ''}>
                ${isMaxLevel ? 'NIVEAU MAX' : (canAfford ? 'Acheter' : 'Marques insuffisantes')}
            </button>
        `;
        shopContainer.appendChild(card);
    });
}

/**
 * Affiche le Recycleur (Shards + Boutique Poussière).
 */
function updateRecyclerDisplayUI(game) {
    const shardListDiv = document.getElementById('recyclerShardList');
    const shopDiv = document.getElementById('recyclerDustShop');
    const dustCountSpan = document.getElementById('essenceDustCount');

    if (!shardListDiv || !shopDiv || !dustCountSpan) return;

    dustCountSpan.textContent = typeof formatNumber === 'function' ? formatNumber(game.essenceDust) : game.essenceDust;

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

    shardListDiv.innerHTML = '<div class="recycler-header">Vos Shards</div>';
    let shardsFound = 0;

    Object.entries(game.shards || {}).forEach(([shardKey, count]) => {
        if (count > 0) {
            shardsFound++;
            const familyName = shardKey;
            const rarity = getFamilyRarity(familyName);
            const dustValue = count * (typeof DUST_CONVERSION_RATES !== 'undefined' ? (DUST_CONVERSION_RATES[rarity] || 1) : 1);

            shardListDiv.innerHTML += `
                <div class="recycler-item">
                    <div>
                        <span class="recycler-item-name">${familyName}<span class="rarity-label ${rarity}">${rarity}</span></span>
                        <div style="font-size: 12px; color: #666;">x${count} ➜ 💠 ${dustValue}</div>
                    </div>
                    <button class="recycler-btn" onclick="game.recycleShards('${shardKey}', '${rarity}')">Recycler</button>
                </div>
            `;
        }
    });

    if (shardsFound === 0) {
        shardListDiv.innerHTML += '<p style="font-size: 12px; color: #666;">Aucun shard à recycler.</p>';
    }

    shopDiv.innerHTML = '<div class="recycler-header">Boutique de Poussière</div>';
    if (typeof DUST_SHOP_ITEMS !== 'undefined') {
        Object.values(DUST_SHOP_ITEMS).forEach(item => {
            if (item.id === 'shiny_egg') return;
            const canAfford = game.essenceDust >= item.cost;
            shopDiv.innerHTML += `
                <div class="dust-shop-item">
                    <div>
                        <div class="shop-item-name" style="color: #a855f7;">${item.name}</div>
                        <div class="shop-item-description" style="font-size: 11px;">${item.description}</div>
                        <div class="shop-item-cost" style="font-size: 16px; margin: 5px 0 0 0;">💠 ${formatNumber(item.cost)}</div>
                    </div>
                    <button class="btn shop-buy-btn" onclick="game.buyDustItem('${item.id}')" ${!canAfford ? 'disabled' : ''}>Acheter</button>
                </div>
            `;
        });
    }
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
            if (statVal) statVal.innerText = typeof formatNumber === 'function' ? formatNumber(val) : val;
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

    document.getElementById('playerHPGain').textContent = `+${formatNumber(totalHPGain)}/s`;
    document.getElementById('playerAttackGain').textContent = `+${formatNumber(totalAttackGain)}/s`;
    document.getElementById('playerSpAttackGain').textContent = `+${formatNumber(totalSpAttackGain)}/s`;
    document.getElementById('playerDefenseGain').textContent = `+${formatNumber(totalDefenseGain)}/s`;
    document.getElementById('playerSpDefenseGain').textContent = `+${formatNumber(totalSpDefenseGain)}/s`;
    document.getElementById('playerSpeedGain').textContent = `+${formatNumber(totalSpeedGain)}/s`;

    const setResVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            const resVal = el.querySelector('.resource-val');
            if (resVal) resVal.innerText = formatNumber(val);
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
        const statsText = `⚔️ ${formatNumber(stats.attack)} | 💥 ${formatNumber(stats.spattack)} | 🛡️ ${formatNumber(stats.defense)} | 💠 ${formatNumber(stats.spdefense)} | 👟 ${formatNumber(stats.speed)}`;
        if (ui.playerStats && ui.playerStats.innerHTML !== statsText) ui.playerStats.innerHTML = statsText;

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

        const eStatsText = `⚔️ ${formatNumber(enemy.attack)} | 💥 ${formatNumber(enemy.spattack)} | 🛡️ ${formatNumber(enemy.defense)} | 💠 ${formatNumber(enemy.spdefense)} | 👟 ${formatNumber(enemy.speed)}`;
        if (ui.enemyStats && ui.enemyStats.innerHTML !== eStatsText) ui.enemyStats.innerHTML = eStatsText;
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
        if (ui.enemyStats) ui.enemyStats.innerHTML = "⚔️ - | 🛡️ - | 👟 -";
        if (ui.effectiveness) ui.effectiveness.classList.remove('show');
    }

    const inCombat = (game.combatState === 'starting' || game.combatState === 'fighting') && game.currentEnemy;
    const alive = game.playerTeam ? game.playerTeam.filter(c => c.isAlive()).length : 0;

    if (ui.autoSelectBtn) {
        if (alive > 1) {
            if (ui.autoSelectBtn.disabled !== !inCombat) ui.autoSelectBtn.disabled = !inCombat;
            const targetOpacity = inCombat ? '1' : '0.5';
            if (ui.autoSelectBtn.style.opacity !== targetOpacity) ui.autoSelectBtn.style.opacity = targetOpacity;
            const hasActive = ui.autoSelectBtn.classList.contains('auto-active');
            if (game.autoSelectEnabled && !hasActive) ui.autoSelectBtn.classList.add('auto-active');
            else if (!game.autoSelectEnabled && hasActive) ui.autoSelectBtn.classList.remove('auto-active');
        } else {
            if (!ui.autoSelectBtn.disabled) ui.autoSelectBtn.disabled = true;
            if (ui.autoSelectBtn.style.opacity !== '0.3') ui.autoSelectBtn.style.opacity = '0.3';
        }
    }

    if (ui.forfeitBtn) {
        ui.forfeitBtn.classList.remove('hidden');
        if (ui.forfeitBtn.disabled !== !inCombat) ui.forfeitBtn.disabled = !inCombat;
        const targetOpacity = inCombat ? '1' : '0.5';
        if (ui.forfeitBtn.style.opacity !== targetOpacity) ui.forfeitBtn.style.opacity = targetOpacity;
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
    return `
        <div class="egg-hatch-title">${data.title}</div>
        <img src="${data.spriteUrl}" alt="${data.name}" class="egg-hatch-sprite">
        <h3 style="font-size: 20px;">${data.name}</h3>
        <div>
            <span class="type-badge type-${data.type}">${data.type}</span>
            ${type2}
        </div>
        <div class="egg-hatch-stats">
            <div class="creature-stats">
                ${data.statsHTML}
            </div>
        </div>
        <button class="btn btn-save" onclick="game.closeEggHatchModal()">Super !</button>
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
    contentEl.className = "quest-completion-content" + (options.contentClass ? ' ' + options.contentClass : '');
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
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

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
        itemsData.forEach(function(item) {
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
            <button class="stats-close" onclick="game.closeCreatureModal()">Fermer</button>
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
window.STATUS_ICONS = STATUS_ICONS;
window.renderEggHatchModalContent = renderEggHatchModalContent;
window.showEggHatchModalUI = showEggHatchModalUI;
window.closeEggHatchModalUI = closeEggHatchModalUI;
window.showItemSelectModalUI = showItemSelectModalUI;
window.renderCreatureModalContent = renderCreatureModalContent;
window.closeCreatureModalUI = closeCreatureModalUI;
