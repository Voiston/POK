/**
 * @file zoneSystem.js
 * Logique des zones : Pokémon par zone, déblocage, maîtrise, changement de zone,
 * et création d'ennemis (spawn) : getOrCreateEnemyLogic, createBossLogic, createEpicLogic.
 * Les fonctions reçoivent game en paramètre.
 *
 * Dépendances globales : ZONES, ZONE_POKEMON, STORY_QUESTS, currentZone, maxReachedZone,
 * RARITY, POKEMON_SECONDARY_TYPES, Creature, logMessage, toast, updateZoneInfo
 */

/**
 * Récupère TOUS les Pokémon d'une zone (Liste plate).
 * Sert pour le calcul technique (Tiers, Chargement, etc.)
 */
function getAllPokemonInZoneLogic(game, zoneId) {
    if (typeof ZONE_POKEMON === 'undefined') return [];
    const zoneData = ZONE_POKEMON[zoneId];
    if (!zoneData) return [];

    if (Array.isArray(zoneData)) return zoneData;

    if (typeof zoneData === 'object') {
        let all = [];
        if (zoneData.land) all = all.concat(zoneData.land);
        if (zoneData.water) all = all.concat(zoneData.water);
        if (zoneData.fishing) all = all.concat(zoneData.fishing);
        return [...new Set(all)];
    }
    return [];
}

/**
 * Récupère uniquement les Pokémon que le joueur PEUT rencontrer actuellement
 * (Exclut les poissons s'il n'a pas de canne, etc.)
 */
function getReachablePokemonInZoneLogic(game, zoneId) {
    if (typeof ZONE_POKEMON === 'undefined') return [];
    const zoneData = ZONE_POKEMON[zoneId];
    if (!zoneData) return [];

    if (Array.isArray(zoneData)) return zoneData;

    let reachable = [];
    if (zoneData.land) reachable = reachable.concat(zoneData.land);
    if (game.items && game.items['surfboard'] > 0 && zoneData.water) {
        reachable = reachable.concat(zoneData.water);
    }
    if (game.items && (game.items['old_rod'] > 0 || game.items['super_rod'] > 0 || game.items['mega_rod'] > 0) && zoneData.fishing) {
        reachable = reachable.concat(zoneData.fishing);
    }
    return [...new Set(reachable)];
}

/**
 * Vérifie si une zone est terminée à 100%
 */
function isZoneMasteredLogic(game, zoneId) {
    const zone = ZONES[zoneId];
    if (!zone) return false;

    const progress = game.zoneProgress && game.zoneProgress[zoneId];
    if (!progress) return false;

    if (zone.requiredBosses > 0 && (progress.bossesDefeated || 0) < zone.requiredBosses) return false;
    if (zone.requiredEpics > 0 && (progress.epicsDefeated || 0) < zone.requiredEpics) return false;

    const pokemonInZone = getReachablePokemonInZoneLogic(game, zoneId);
    const tiers = progress.pokemonTiers || {};
    const maxTier = zone.maxTier || 50;

    return pokemonInZone.every(function (name) { return (tiers[name] || 0) >= maxTier; });
}

/**
 * Vérification déblocage Zone (Avec système de Cliquet)
 */
function isZoneUnlockedLogic(game, zoneId, checkPrevious) {
    if (checkPrevious === undefined) checkPrevious = true;
    if (zoneId === 1) return true;
    if (zoneId <= maxReachedZone) return true;

    if (checkPrevious) {
        const prevZoneId = zoneId - 1;
        if (!isZoneUnlockedLogic(game, prevZoneId, false)) return false;
        if (!isZoneMasteredLogic(game, prevZoneId)) return false;
    }
    return true;
}

/**
 * Mise à jour du sélecteur de zone (UI)
 */
function updateZoneSelectorLogic(game) {
    const selector = document.getElementById('zoneSelect');
    if (!selector) return;

    const zoneIds = Object.keys(ZONES);

    if (selector.options.length !== zoneIds.length) {
        selector.innerHTML = '';
        zoneIds.forEach(function (zoneId) {
            const zId = parseInt(zoneId);
            const option = document.createElement('option');
            option.value = zId;
            selector.appendChild(option);
        });
    }

    Array.from(selector.options).forEach(function (option) {
        const zId = parseInt(option.value);
        const zone = ZONES[zId];
        const isUnlocked = isZoneUnlockedLogic(game, zId);

        let label = zone.name;
        if (!isUnlocked) label = label;

        if (option.text !== label) option.text = label;
        if (option.disabled !== !isUnlocked) option.disabled = !isUnlocked;
    });

    if (document.activeElement !== selector) {
        if (parseInt(selector.value) !== currentZone) {
            selector.value = currentZone;
        }
    }
}

/**
 * Change la zone actuelle du joueur
 */
function changeZoneLogic(game, zoneId) {
    const selector = document.getElementById('zoneSelect');
    if (selector) selector.blur();

    const zId = parseInt(zoneId);

    if (!isZoneUnlockedLogic(game, zId)) {
        const prevZone = zId - 1;
        const prevZoneName = ZONES[prevZone] ? ZONES[prevZone].name : "précédente";
        if (toast) toast.error("Zone Verrouillée", "Terminez d'abord : " + prevZoneName);
        updateZoneSelectorLogic(game);
        return;
    }

    currentZone = zId;
    game.currentEnemy = null;
    game.combatState = 'waiting';
    game.lastCombatTime = Date.now();

    logMessage("Voyage vers : " + ZONES[currentZone].name);

    updateZoneSelectorLogic(game);
    if (game.updateCaptureTargetList) game.updateCaptureTargetList();
    if (typeof updateZoneInfo === 'function') updateZoneInfo();

    if (!game.sessionStats.zonesVisited) game.sessionStats.zonesVisited = new Set();
    game.sessionStats.zonesVisited.add(zId);
    if (game.checkSpecialQuests) game.checkSpecialQuests('zone_visited');
    if (zId === 2 && game.checkSpecialQuests) game.checkSpecialQuests('zone_2_visited');

    if (!game.items) game.items = {};
    if (!game.completedStoryQuests) game.completedStoryQuests = [];

    var storyTriggered = false;
    if (typeof ensureStoryQuestProgress === 'function' && game.quests && game.quests.length < 10) {
        const beforeCount = game.quests.length;
        ensureStoryQuestProgress(game);
        if (game.quests.length > beforeCount) storyTriggered = true;
    }

    if (storyTriggered && game.quests && game.quests.length < 10) {
        logMessage("📜 ÉVÉNEMENT : Une nouvelle quête majeure est disponible !");
        game.nextQuestTimer = 1000;
        if (game.updateQuestTimerDisplay) game.updateQuestTimerDisplay();
    }
}

// ============================================================
// SPAWN D'ENNEMIS (création du prochain adversaire)
// ============================================================

/**
 * Crée un Boss de zone (légendaire, IV max, zone x30).
 */
function createBossLogic(game) {
    const zone = ZONES[currentZone];
    if (!zone) return null;
    const localPool = getReachablePokemonInZoneLogic(game, currentZone);
    var name = 'Mewtwo';
    if (localPool && localPool.length > 0) {
        name = localPool[Math.floor(Math.random() * localPool.length)];
    }
    const level = zone.levelRange[1] + 10;
    const type = game.findTypeForPokemon ? game.findTypeForPokemon(name) : 'normal';
    const secondaryType = POKEMON_SECONDARY_TYPES[name] || null;
    const enemy = new Creature(name, type, level, RARITY.LEGENDARY, true, false, secondaryType, true, false);
    enemy.zoneMultiplier = zone.multiplier * 30;
    enemy.recalculateStats();
    enemy.heal();
    logMessage("💀 BOSS DE ZONE : " + enemy.name + " est apparu !");
    return enemy;
}

/**
 * Crée un Épique de zone (élite, IV 25, zone x15).
 */
function createEpicLogic(game) {
    const zone = ZONES[currentZone];
    if (!zone) return null;
    const localPool = getReachablePokemonInZoneLogic(game, currentZone);
    var name = 'Snorlax';
    if (localPool && localPool.length > 0) {
        name = localPool[Math.floor(Math.random() * localPool.length)];
    }
    const level = zone.levelRange[1] + 5;
    const type = game.findTypeForPokemon ? game.findTypeForPokemon(name) : 'normal';
    const secondaryType = POKEMON_SECONDARY_TYPES[name] || null;
    const enemy = new Creature(name, type, level, RARITY.EPIC, true, false, secondaryType, false, true);
    enemy.zoneMultiplier = zone.multiplier * 15;
    enemy.recalculateStats();
    enemy.heal();
    logMessage("⚠️ UN POKÉMON ÉLITE APPARAÎT : " + enemy.name + " !");
    return enemy;
}

/**
 * Retourne le prochain ennemi à affronter (Roamer, Boss, Épique ou standard).
 * Game appelle cette fonction au moment du spawn ; zoneSystem décide lequel et avec quelles stats.
 * Les probabilités (Boss 1%, Épique 2.5%) s'appliquent quel que soit le contexte :
 * onglet actif, onglet caché ou simulation de rattrapage (catch-up).
 */
function getOrCreateEnemyLogic(game) {
    if (game.pendingRoamer) {
        var name = game.pendingRoamer;
        game.pendingRoamer = null;
        var type = game.findTypeForPokemon ? game.findTypeForPokemon(name) : 'normal';
        var secondaryType = POKEMON_SECONDARY_TYPES[name] || null;
        var zone = ZONES[currentZone];
        var level = zone ? zone.levelRange[1] + 5 : 50;
        var roamer = new Creature(name, type, level, RARITY.LEGENDARY, true, false, secondaryType, true, false);
        roamer.isRoaming = true;
        roamer.zoneMultiplier = zone ? zone.multiplier * 30 : 10;
        roamer.recalculateStats();
        roamer.heal();
        logMessage("✨ UN POKÉMON VAGABOND APPARAÎT : " + name + " !");
        return roamer;
    }
    var zone = ZONES[currentZone];
    if (!zone) return null;
    var isBossTime = Math.random() < 0.01;
    var isEpicTime = !isBossTime && Math.random() < 0.025;
    if (isBossTime) return createBossLogic(game);
    if (isEpicTime) return createEpicLogic(game);

    var enemyPool = [];
    var zoneData = typeof ZONE_POKEMON !== 'undefined' ? ZONE_POKEMON[currentZone] : null;
    if (Array.isArray(zoneData)) {
        enemyPool = zoneData;
    } else if (zoneData && typeof zoneData === 'object') {
        if (zoneData.land) enemyPool = enemyPool.concat(zoneData.land);
        if (game.items && game.items['surfboard'] > 0 && zoneData.water) enemyPool = enemyPool.concat(zoneData.water);
        if (game.items && (game.items['old_rod'] > 0 || game.items['super_rod'] > 0 || game.items['mega_rod'] > 0) && zoneData.fishing) enemyPool = enemyPool.concat(zoneData.fishing);
    }
    if (!enemyPool || enemyPool.length === 0) {
        if (typeof console !== 'undefined' && console.warn) console.warn("Zone " + currentZone + " vide ou mal configurée. Fallback Magikarp.");
        enemyPool = ['Magikarp'];
    }
    var randomName = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    var randomType = game.findTypeForPokemon ? game.findTypeForPokemon(randomName) : 'normal';
    var secondaryType = POKEMON_SECONDARY_TYPES[randomName] || null;
    var level = Math.floor(Math.random() * (zone.levelRange[1] - zone.levelRange[0] + 1)) + zone.levelRange[0];
    var trueRarity = game.getNaturalRarity ? game.getNaturalRarity(randomName) : RARITY.COMMON;
    var enemy = new Creature(randomName, randomType, level, trueRarity, true, false, secondaryType);
    var savedTier = (game.zoneProgress && game.zoneProgress[currentZone] && game.zoneProgress[currentZone].pokemonTiers && game.zoneProgress[currentZone].pokemonTiers[enemy.name]) || 0;
    enemy.tier = savedTier;
    enemy.zoneMultiplier = zone.multiplier * 5;
    enemy.recalculateStats();
    enemy.heal();
    return enemy;
}
