/**
 * @file towerSystem.js
 * Logique de la Tour de combat : démarrage, étages, reliques, fin.
 * Les fonctions reçoivent game en paramètre.
 *
 * Dépendances globales : Creature, POKEMON_SPRITE_IDS, POKEMON_SECONDARY_TYPES,
 * RARITY, TOWER_RELICS, TOWER_SHOP_ITEMS, logMessage, updateZoneInfo
 */

function startTowerRunLogic(game) {
    if (game.towerState.isActive) {
        logMessage("Une tentative est déjà en cours !");
        return;
    }
    var towerQuestActive = game.quests && game.quests.some(function (q) {
        return q.id === 'story_tower_climb' && q.accepted && !q.completed;
    });
    if (game.combatTickets <= 0 && !towerQuestActive) {
        logMessage("Vous n'avez pas de Ticket de Combat !");
        return;
    }

    if (!towerQuestActive) {
        game.combatTickets--;
        logMessage("Un Ticket de Combat est utilisé. L'ascension de la Tour commence !");
    } else {
        logMessage("Tour gratuite (quête Le Vertige en cours). L'ascension commence !");
    }

    for (const creature of game.playerTeam) {
        creature.heal();
        creature.clearStatusEffect();
    }
    if (!game.currentPlayerCreature && game.playerTeam.length > 0) {
        game.currentPlayerCreature = game.playerTeam[0];
    }
    if (game.currentPlayerCreature) {
        game.currentPlayerCreature.mainAccountCurrentHp = game.getPlayerMaxHp();
    }

    game.towerState = {
        isActive: true,
        currentFloor: 1,
        currentEnemyIndex: 0,
        enemyTeam: generateTowerEnemyTeamLogic(game, 1),
        buffs: { attack_mult: 1, defense_mult: 1, lifesteal: 0, crit_chance: 0 },
        runStats: {
            startMarques: game.marquesDuTriomphe || 0,
            marksGained: 0,
            items: {},
            eggs: {},
            floorsCleared: 0
        }
    };

    game.currentEnemy = game.towerState.enemyTeam[0];
    game.combatState = 'starting';
    game.combatStartTime = Date.now();
    logMessage(`Étage 1 : Le dresseur envoie ${game.currentEnemy.name} !`);
    game.triggerAutoSelect();
    updateZoneInfo();
    game.updateDisplay();
}

function generateTowerEnemyTeamLogic(game, floor) {
    const team = [];
    const maxDexId = 649;
    let targetId = ((floor - 1) % maxDexId) + 1;
    let pokemonName = Object.keys(POKEMON_SPRITE_IDS).find(key => POKEMON_SPRITE_IDS[key] === targetId) || "MissingNo";
    const isBossFloor = floor % 10 === 0;
    const type = game.findTypeForPokemon(pokemonName);
    const secondaryType = POKEMON_SECONDARY_TYPES[pokemonName] || null;
    let rarity = RARITY.COMMON;
    if (isBossFloor) rarity = RARITY.LEGENDARY;

    const creature = new Creature(pokemonName, type, floor, rarity, true, false, secondaryType, isBossFloor, false);

    const baseMult = 100;
    const linearGrowth = 1 + (floor * 0.15);
    const expoGrowth = Math.pow(1.02, floor);
    let multiplier = baseMult * linearGrowth * expoGrowth;
    if (isBossFloor) {
        multiplier *= 1.15;
        creature.assignRandomTalent();
    }

    creature.maxHp = Math.floor(creature.maxHp * multiplier);
    creature.attack = Math.floor(creature.attack * multiplier);
    creature.spattack = Math.floor(creature.spattack * multiplier);
    creature.defense = Math.floor(creature.defense * multiplier);
    creature.spdefense = Math.floor(creature.spdefense * multiplier);
    creature.speed = Math.floor(creature.speed * multiplier);
    creature.currentHp = creature.maxHp;
    team.push(creature);
    return team;
}

function nextTowerFloorLogic(game) {
    if (game.towerState.currentFloor % 10 === 0) {
        game.combatState = 'waiting';
        game.currentEnemy = null;
        offerTowerRelicLogic(game);
        return;
    }
    proceedToNextFloorLogic(game);
}

function proceedToNextFloorLogic(game) {
    game.towerState.currentFloor++;
    logMessage(`Passage à l'étage ${game.towerState.currentFloor}.`);
    game.towerState.enemyTeam = generateTowerEnemyTeamLogic(game, game.towerState.currentFloor);
    game.towerState.currentEnemyIndex = 0;
    game.currentEnemy = game.towerState.enemyTeam[0];
    game.combatState = 'starting';
    game.combatStartTime = Date.now();
    game.triggerAutoSelect();
    game.updateDisplay();
}

function endTowerRunLogic(game, isForfeit = false) {
    const floorReached = game.towerState.currentFloor;
    const floorsCleared = floorReached - 1;
    const isNewRecord = floorsCleared > game.towerRecord;
    if (isNewRecord) {
        game.towerRecord = floorsCleared;
        game.pokedollars += floorsCleared * 100;
    }
    if (!game.stats) game.stats = {};
    game.stats.towerFloorsClimbed = (game.stats.towerFloorsClimbed || 0) + Math.max(0, floorsCleared);
    if (game.checkSpecialQuests) game.checkSpecialQuests('towerFloor');

    if (game.towerState.runStats) {
        game.towerState.runStats.floorsCleared = floorsCleared;
    }

    showTowerCompletionModalLogic(game, floorsCleared, isNewRecord, isForfeit);

    game.towerState = { isActive: false, currentFloor: 0, currentEnemyIndex: 0, enemyTeam: [], buffs: {} };
    game.combatState = 'waiting';
    game.lastCombatTime = Date.now();
    game.currentEnemy = null;

    game.playerTeam.forEach(c => {
        c.heal();
        c.currentStamina = c.maxStamina;
    });

    game.updateDisplay();
    game.saveGame();
}

function offerTowerRelicLogic(game) {
    const modal = document.getElementById('relicModal');
    const grid = document.getElementById('relicOptionsGrid');
    if (!modal || !grid) return;
    grid.innerHTML = '';

    let availableKeys = Object.keys(TOWER_RELICS).filter(key => {
        const relic = TOWER_RELICS[key];
        if (relic.unique) {
            if (key === 'executioner' && game.towerState.buffs.execute_percent) return false;
            if (key === 'shadow_cloak' && game.towerState.buffs.dodge_chance) return false;
        }
        return true;
    });

    const rollRarity = () => {
        const r = Math.random() * 100;
        if (r < 60) return RARITY.COMMON;
        if (r < 90) return RARITY.RARE;
        if (r < 98) return RARITY.EPIC;
        return RARITY.LEGENDARY;
    };

    const choices = [];
    const countToPick = Math.min(3, availableKeys.length);
    while (choices.length < countToPick) {
        const k = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        if (!choices.some(c => c.key === k)) choices.push({ key: k, rarity: rollRarity() });
    }

    let html = '';
    choices.forEach(choice => {
        const relic = TOWER_RELICS[choice.key];
        const value = relic.values[choice.rarity];
        const desc = relic.getDescription(value);
        html += `<div class="relic-card relic-${choice.rarity}" data-key="${choice.key}" data-rarity="${choice.rarity}">
            <div class="relic-badge badge-${choice.rarity}">${choice.rarity}</div>
            <div style="font-size: 26px; margin-top: 6px;">${relic.icon}</div>
            <div style="font-weight:bold; margin:4px 0; color:#fff;">${relic.name}</div>
            <div style="font-size:11px; color:#ccc; line-height: 1.3;">${desc}</div>
        </div>`;
    });
    grid.innerHTML = html;

    // Ajout d'une délégation d'événement unique (si ce n'est pas déjà fait via modals.html)
    if (!grid.dataset.delegated) {
        grid.dataset.delegated = 'true';
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.relic-card');
            if (card) {
                selectTowerRelicLogic(game, card.dataset.key, card.dataset.rarity);
            }
        });
    }

    modal.classList.add('show');
}

function selectTowerRelicLogic(game, key, rarity) {
    const relic = TOWER_RELICS[key];
    if (!relic) return;
    const value = relic.values[rarity];
    relic.effect(game, value);
    logMessage(`💎 Relique obtenue : ${relic.name} (${rarity})`);
    if (!relic.immediate) game.updateTowerBuffsDisplay();
    document.getElementById('relicModal').classList.remove('show');
    proceedToNextFloorLogic(game);
}

function showTowerCompletionModalLogic(game, floor, isNewRecord, isForfeit) {
    const modal = document.getElementById('towerCompletionModal');
    const infoDiv = document.getElementById('towerCompletionInfo');
    const rewardsDiv = document.getElementById('towerCompletionRewards');
    if (!modal || !infoDiv || !rewardsDiv) return;

    let title = isForfeit ? "Retraite stratégique" : "Fin de l'ascension";
    let recordBadge = isNewRecord
        ? `<div style="color:#facc15; font-weight:bold; margin:10px 0; text-transform:uppercase;">NOUVEAU RECORD</div>`
        : "";

    infoDiv.innerHTML = `<h2 style="margin: 10px 0 5px 0;">${title}</h2>${recordBadge}<p style="font-size: 16px;">Vous avez atteint l'étage <strong>${floor}</strong>.</p>`;

    const stats = game.towerState && game.towerState.runStats ? game.towerState.runStats : {};
    const marksGained = stats.marksGained || 0;
    const floorsCleared = stats.floorsCleared || floor;
    const eggs = stats.eggs || {};
    const items = stats.items || {};

    let eggsLines = '';
    const eggEntries = Object.keys(eggs).filter(k => eggs[k] > 0);
    if (eggEntries.length > 0) {
        eggsLines =
            '<div style="margin-top: 8px;"><strong>Œufs obtenus :</strong><ul style="margin: 4px 0 0 18px; padding:0;">' +
            eggEntries.map(rarity => `<li>Œuf ${rarity} x${eggs[rarity]}</li>`).join('') +
            '</ul></div>';
    }

    let itemsLines = '';
    const itemEntries = Object.keys(items).filter(k => items[k] > 0);
    if (itemEntries.length > 0) {
        itemsLines =
            '<div style="margin-top: 8px;"><strong>Objets trouvés :</strong><ul style="margin: 4px 0 0 18px; padding:0;">' +
            itemEntries.map(key => {
                let label = key;
                try {
                    if (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[key]) {
                        label = ALL_ITEMS[key].name || key;
                    }
                } catch (e) { /* ignore */ }
                return `<li>${label} x${items[key]}</li>`;
            }).join('') +
            '</ul></div>';
    }

    rewardsDiv.innerHTML =
        `<div style="padding: 15px; background: rgba(0,0,0,0.18); border-radius: 10px; border: 1px solid rgba(180,155,100,0.35); font-size: 14px;">` +
        `<div style="font-weight:bold; margin-bottom:6px;">Récapitulatif de l'ascension</div>` +
        `<div>Étages complétés : <strong>${floorsCleared}</strong></div>` +
        `<div><img src="img/marque-triomphe.png" class="marque-triomphe-inline" alt="" style="width:16px;height:16px;"> Marques du Triomphe gagnées : <strong>+${marksGained}</strong></div>` +
        eggsLines +
        itemsLines +
        `<div style="margin-top: 10px; font-size: 12px; opacity: 0.9;">Toutes les récompenses ont été ajoutées à votre inventaire.</div>` +
        `</div>`;

    modal.classList.add('show');
    const closeBtn = document.getElementById('closeTowerBtn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('show');
}

function updateTowerDisplayLogic(game) {
    if (document.getElementById('towerRecord')) {
        document.getElementById('towerRecord').textContent = game.towerRecord;
        if (document.getElementById('combatTickets')) document.getElementById('combatTickets').textContent = game.combatTickets;
        if (document.getElementById('marquesDuTriomphe')) document.getElementById('marquesDuTriomphe').textContent = game.marquesDuTriomphe;
    }
    var startBtn = document.getElementById('towerStartBtn');
    if (startBtn) {
        startBtn.disabled = (game.combatTickets <= 0);
    }
}

function updateTowerBuffsDisplayLogic(game) {
    const container = document.getElementById('towerBuffsContainer');
    if (!container) return;
    if (!game.towerState.isActive || !game.towerState.buffs) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';
    let html = '<div class="tower-buffs-title">RELIQUES ACTIVES</div>';
    const buffs = game.towerState.buffs;
    let hasBuffs = false;

    const createChipHtml = (text, type, icon, tooltipTitle, tooltipDesc) => {
        const safeTitle = tooltipTitle.replace(/"/g, '&quot;');
        const safeDesc = tooltipDesc.replace(/"/g, '&quot;');
        html += `<div class="tower-buff-chip buff-${type}" data-tooltip-title="${safeTitle}" data-tooltip-desc="${safeDesc}">
            <span>${icon}</span><span>${text}</span>
        </div>`;
        hasBuffs = true;
    };

    if (buffs.speed_mult && buffs.speed_mult !== 1) {
        const val = Math.round((buffs.speed_mult - 1) * 100);
        createChipHtml(`VIT +${val}%`, 'speed', '👟', 'Vitesse', `Augmente la vitesse de vos créatures de ${val}%.`);
    }
    if (buffs.dodge_chance > 0) {
        const val = Math.round(buffs.dodge_chance * 100);
        createChipHtml(`Esquive ${val}%`, 'special', '👻', 'Esquive', `Chance d'éviter complètement les attaques (${val}%).`);
    }
    if (buffs.reflect_percent > 0) {
        const val = Math.round(buffs.reflect_percent * 100);
        createChipHtml(`Épines ${val}%`, 'def', '🌵', 'Dégâts de riposte', `Renvoie ${val}% des dégâts subis à l'ennemi.`);
    }
    if (buffs.status_dmg_bonus > 0) {
        const val = Math.round(buffs.status_dmg_bonus * 100);
        createChipHtml(`Prédateur +${val}%`, 'atk', '🐯', 'Prédateur', `Augmente les dégâts infligés aux ennemis affectés par un statut (${val}%).`);
    }
    if (buffs.max_hp_mult && buffs.max_hp_mult !== 1) {
        const val = Math.round((buffs.max_hp_mult - 1) * 100);
        createChipHtml(`PV +${val}%`, 'life', '🤎', 'Points de vie', `Augmente les PV max de votre équipe de ${val}%.`);
    }
    if (buffs.regen_percent > 0) {
        const val = Math.round(buffs.regen_percent * 100);
        createChipHtml(`Regen ${val}%`, 'life', '💍', 'Régénération', `Vos créatures régénèrent ${val}% de leurs PV à chaque combat.`);
    }
    if (buffs.attack_mult && buffs.attack_mult !== 1) {
        const val = Math.round((buffs.attack_mult - 1) * 100);
        createChipHtml(`ATK +${val}%`, 'atk', '⚔️', 'Attaque', `Augmente l'attaque de votre équipe de ${val}%.`);
    }
    if (buffs.defense_mult && buffs.defense_mult !== 1) {
        const val = Math.round((buffs.defense_mult - 1) * 100);
        createChipHtml(`DEF +${val}%`, 'def', '🛡️', 'Défense', `Réduit les dégâts subis de ${val}%.`);
    }
    if (buffs.lifesteal > 0) {
        const val = Math.round(buffs.lifesteal * 100);
        createChipHtml(`Vol de vie ${val}%`, 'special', '❤️', 'Vol de vie', `Une partie des dégâts infligés vous soigne (${val}%).`);
    }
    if (buffs.crit_chance > 0) {
        const val = Math.round(buffs.crit_chance * 100);
        createChipHtml(`Crit ${val}%`, 'atk', '💥', 'Critique', `Augmente la chance de coup critique de ${val}%.`);
    }
    if (buffs.execute_percent > 0) {
        const val = Math.round(buffs.execute_percent * 100);
        createChipHtml(`Exécution ${val}%`, 'special', '⚡', 'Exécution', `Permet d'achever instantanément les ennemis sous un certain seuil de PV (${val}%).`);
    }
    if (!hasBuffs) html += '<div class="tower-buffs-empty">Aucun effet actif</div>';

    container.innerHTML = html;

    // Délégation d'événement
    if (!container.dataset.delegated) {
        container.dataset.delegated = 'true';
        container.addEventListener('mouseover', (ev) => {
            const chip = ev.target.closest('.tower-buff-chip');
            if (chip && game.scheduleTooltip) {
                game.scheduleTooltip(ev, chip.dataset.tooltipTitle, chip.dataset.tooltipDesc);
            }
        });
        container.addEventListener('mouseout', (ev) => {
            const chip = ev.target.closest('.tower-buff-chip');
            if (chip && game.hideTooltip) {
                game.hideTooltip();
            }
        });
    }
}

function buyTowerShopItemLogic(game, itemKey) {
    const item = TOWER_SHOP_ITEMS[itemKey];
    if (!item) return;
    let currentLevel = 0;
    if (item.maxLevel && item.effect && item.effect.type) {
        let readKey = item.effect.type;
        if (readKey === 'pensionSlot') readKey = 'pensionSlots';
        const boostValue = game.permanentBoosts[readKey] || 0;
        currentLevel = Math.round(boostValue / item.effect.value);
    }
    if (item.maxLevel && currentLevel >= item.maxLevel) {
        logMessage("Cette amélioration est déjà au niveau maximum !");
        return;
    }
    const cost = Array.isArray(item.cost) ? item.cost[currentLevel] : item.cost;
    if (game.marquesDuTriomphe < cost) {
        logMessage(`❌ Pas assez de Marques du Triomphe ! (${game.marquesDuTriomphe}/${cost})`);
        return;
    }
    game.marquesDuTriomphe -= cost;
    logMessage(`Achat : ${item.name} pour ${cost} Marques.`);
    switch (item.type) {
        case 'permanent':
            const effectType = item.effect.type;
            let storageKey = effectType;
            if (effectType === 'pensionSlot') storageKey = 'pensionSlots';
            game.permanentBoosts[storageKey] = (game.permanentBoosts[storageKey] || 0) + item.effect.value;
            if (effectType === 'team_contribution') logMessage(`✅ Contribution d'équipe augmentée ! Bonus total : +${(game.permanentBoosts.team_contribution * 100).toFixed(0)}%`);
            else if (effectType === 'xp') logMessage(`✅ Gain d'XP permanent augmenté de ${item.effect.value * 100}% !`);
            else if (effectType === 'pensionSlot') { logMessage("✅ +1 emplacement de pension permanent !"); game.updatePensionDisplay(); }
            break;
        case 'egg':
            game.eggs[item.rarity] = (game.eggs[item.rarity] || 0) + item.amount;
            logMessage(`✅ Vous avez reçu ${item.amount}x Œuf ${item.rarity} !`);
            game.updateEggsDisplay();
            break;
        case 'boost':
            game.addBoost(item);
            break;
        case 'item':
            game.addItem(item.item, item.amount || 1);
            break;
        case 'consumable':
            if (item.item === 'talent_reroll') { game.talentRerolls++; logMessage(`✨ Cristal de Réinitialisation obtenu ! (${game.talentRerolls} disponible(s))`); }
            else if (item.item === 'talent_choice') { game.talentChoices++; logMessage(`🌟 Orbe de Maîtrise obtenu ! (${game.talentChoices} disponible(s))`); }
            break;
    }
    game.updateDisplay();
    game.updateTowerShopDisplay();
}
