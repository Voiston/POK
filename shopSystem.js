/**
 * @file shopSystem.js
 * Logique des boutiques : Pokémart, Upgrades, Tour, Recycler.
 * Les fonctions reçoivent game en paramètre.
 *
 * Dépendances globales : POKEMART_ITEMS, SHOP_ITEMS, UPGRADES, TOWER_SHOP_ITEMS,
 * DUST_CONVERSION_RATES, logMessage, toast,
 * updatePokeMartDisplayUI, updateUpgradesDisplayUI, updateShopDisplayUI,
 * updateTowerShopDisplayUI, updateRecyclerDisplayUI
 */

function updatePokeMartDisplayLogic(game) {
    if (typeof updatePokeMartDisplayUI === 'function') updatePokeMartDisplayUI(game);
}

function buyPokeMartItemLogic(game, key) {
    const item = POKEMART_ITEMS[key];
    if (!item) return;

    if (game.pokedollars < item.cost) {
        logMessage("Pas assez de Pokédollars !");
        return;
    }

    game.pokedollars -= item.cost;
    if (typeof game.checkSpecialQuests === 'function') game.checkSpecialQuests('money_spent');
    
    if (typeof game.addItem === 'function') game.addItem(item.itemId, item.amount);
    
    logMessage(`Achat : ${item.amount}x ${item.name} pour ${item.cost}$`);
    
    updatePokeMartDisplayLogic(game);
}

function updateUpgradesDisplayLogic(game) {
    if (typeof updateUpgradesDisplayUI === 'function') updateUpgradesDisplayUI(game);
}

function updateShopDisplayLogic(game) {
    if (typeof updateShopDisplayUI === 'function') updateShopDisplayUI(game);
}

function updateTowerShopDisplayLogic(game) {
    if (typeof updateTowerShopDisplayUI === 'function') updateTowerShopDisplayUI(game);
}

function updateRecyclerDisplayLogic(game) {
    if (typeof updateRecyclerDisplayUI === 'function') updateRecyclerDisplayUI(game);
}

/**
 * Recycle les shards d'un type en Poussière d'Essence
 */
function recycleShardsLogic(game, shardKey, rarity) {
    const count = game.shards && game.shards[shardKey] || 0;
    if (count === 0) return;

    const rate = DUST_CONVERSION_RATES[rarity] || 1;
    const dustGained = count * rate;

    game.essenceDust += dustGained;
    game.shards[shardKey] = 0;

    logMessage(`♻️ ${count} Shards de ${shardKey} recyclés en 💠 ${dustGained} Poussière !`);
    toast.success("Shards Recyclés !", `+${dustGained} 💠 Poussière d'Essence`);

    updateRecyclerDisplayLogic(game);
}

function buyShopItemLogic(game, itemKey) {
    const item = SHOP_ITEMS[itemKey];
    if (!item) {
        logMessage("❌ Objet inconnu !");
        return;
    }

    let cost = item.cost;
    if (item.type === 'upgrade' && game.upgrades && game.upgrades[item.upgradeKey]) {
        cost *= Math.pow(UPGRADES[item.upgradeKey].costScaling || 1.15, game.upgrades[item.upgradeKey].level);
    }
    cost = Math.floor(cost);

    if (game.pokedollars < cost) {
        logMessage("Pas assez de Pokédollars pour acheter " + item.name + " !");
        return;
    }

    game.pokedollars -= cost;
    if (typeof game.checkSpecialQuests === 'function') game.checkSpecialQuests('money_spent');
    
    logMessage(`Achat : ${item.name} pour ${cost}$`);

    if (item.type === 'upgrade') {
        if (!game.upgrades[item.upgradeKey]) {
            game.upgrades[item.upgradeKey] = { level: 0 };
        }
        game.upgrades[item.upgradeKey].level++;
        if (typeof game.applyAccountTalents === 'function') game.applyAccountTalents();
        if (typeof game.refreshTeamStats === 'function') game.refreshTeamStats();
        
        logMessage(`Amélioration : ${item.name} Niveau ${game.upgrades[item.upgradeKey].level} !`);

    } else if (item.type === 'stat_booster') {
        if (item.targetStat === 'all') {
            game.activeVitamins.all = (game.activeVitamins.all || 0) + item.value;
        } else {
            game.activeVitamins[item.targetStat] = (game.activeVitamins[item.targetStat] || 0) + item.value;
        }
        logMessage(`Vitamine ${item.name} appliquée !`);
        if (typeof game.incrementPlayerStats === 'function') game.incrementPlayerStats();

    } else if (item.type === 'boost_item') {
        const existingBoost = game.activeBoosts.find(function(b) { return b.type === item.boostType; });
        if (existingBoost) {
            existingBoost.endTime += item.duration;
        } else {
            game.activeBoosts.push({ type: item.boostType, value: item.boostValue, endTime: Date.now() + item.duration });
        }
        logMessage(`Boost ${item.name} activé ! Durée : ${item.duration / 60000} min`);

    } else if (item.type === 'item') {
        if (typeof game.addItem === 'function') game.addItem(item.itemId, item.amount);

    } else if (item.type === 'tower_buff_token') {
        if (!game.towerState) game.towerState = { buffs: {} };
        if (!game.towerState.buffs[item.buffType]) game.towerState.buffs[item.buffType] = 0;
        game.towerState.buffs[item.buffType] += item.value;
        logMessage(`Jeton de Tour : ${item.name} appliqué !`);

    } else {
        logMessage("Type d'objet inconnu : " + item.type);
    }

    updateShopDisplayLogic(game);
    updateUpgradesDisplayLogic(game);
    updatePokeMartDisplayLogic(game);
    updateRecyclerDisplayLogic(game);
    updateTowerShopDisplayLogic(game);
    if (typeof game.updateTeamDisplay === 'function') game.updateTeamDisplay(); // Pour les boosts de stats d'équipe
}


// Export global pour être appelé par game.js
window.updatePokeMartDisplayLogic = updatePokeMartDisplayLogic;
window.buyPokeMartItemLogic = buyPokeMartItemLogic;
window.updateUpgradesDisplayLogic = updateUpgradesDisplayLogic;
window.updateShopDisplayLogic = updateShopDisplayLogic;
window.updateTowerShopDisplayLogic = updateTowerShopDisplayLogic;
window.updateRecyclerDisplayLogic = updateRecyclerDisplayLogic;
window.recycleShardsLogic = recycleShardsLogic;
window.buyShopItemLogic = buyShopItemLogic;
