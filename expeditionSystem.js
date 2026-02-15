/**
 * @file expeditionSystem.js
 * Logique des expéditions : génération, lancement, complétion, récompenses.
 * Les fonctions reçoivent game en paramètre.
 *
 * Dépendances globales : Creature, EXPEDITION_DEFINITIONS, EXPEDITION_BIOMES,
 * BIOME_MASTERY_LEVELS, BIOME_DISPLAY, ALL_ITEMS, PASSIVE_TALENTS,
 * formatTime, formatTimeString, formatNumber, getPokemonSpriteUrl, getShardKey,
 * logMessage, toast
 */

function updateExpeditionsDisplayLogic(game) {
    const slotsUI = document.getElementById('expeditionSlots');
    if (slotsUI) slotsUI.textContent = `${game.activeExpeditions.length}/${game.maxExpeditionSlots}`;

    if (typeof game.updateAvailableExpeditionsList === 'function') {
        game.updateAvailableExpeditionsList();
    }

    const activeContainer = document.getElementById('activeExpeditionsContainer');
    if (!activeContainer) return;

    activeContainer.innerHTML = '';
    if (game.activeExpeditions.length === 0) {
        activeContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px; font-style: italic; border: 2px dashed #e2e8f0; border-radius: 10px;">Aucune expédition en cours...</p>';
        return;
    }

    const now = Date.now();
    game.activeExpeditions.forEach((exp, index) => {
        const expeditionDef = EXPEDITION_DEFINITIONS[exp.expeditionId];
        if (!expeditionDef) return;

        let creatureName = "Inconnu", spriteUrl = "", levelText = "";
        try {
            if (exp.squadData && exp.squadData.length > 0) {
                const leader = Creature.deserialize(exp.squadData[0]);
                creatureName = leader.name;
                levelText = `(Niv ${leader.level})`;
                spriteUrl = getPokemonSpriteUrl(leader.name, leader.isShiny);
                if (exp.squadData.length > 1) creatureName += ` +${exp.squadData.length - 1}`;
            } else if (exp.creatureData) {
                const creature = Creature.deserialize(exp.creatureData);
                creatureName = creature.name;
                levelText = `(Niv ${creature.level})`;
                spriteUrl = getPokemonSpriteUrl(creature.name, creature.isShiny);
            } else return;
        } catch (e) {
            console.error("Erreur affichage expédition:", e);
            return;
        }

        const card = document.createElement('div');
        const timeLeft = exp.endTime - now;
        let statusClass = '', actionHTML = '', progressHTML = '';

        if (timeLeft > 0) {
            statusClass = 'accepted';
            const { hours, minutes, seconds } = formatTime(timeLeft);
            const totalDuration = expeditionDef.duration;
            const elapsed = totalDuration - timeLeft;
            const percent = Math.min(100, (elapsed / totalDuration) * 100);
            progressHTML = `<div class="quest-progress-container" style="margin: 10px 0;"><div class="quest-progress-bar"><div class="quest-progress-fill" style="width: ${percent}%"></div></div><div class="quest-progress-text" style="font-size:10px; color:#64748b;">Reste: ${hours}h ${minutes}m ${seconds}s</div></div>`;
            actionHTML = `<button class="quest-btn" disabled style="background: #cbd5e1; color: #64748b; cursor: wait; width:100%;">⏳ En cours...</button>`;
        } else {
            statusClass = 'completed';
            progressHTML = `<div class="quest-progress-container" style="margin: 10px 0;"><div class="quest-progress-bar"><div class="quest-progress-fill" style="width: 100%; background: #22c55e;"></div></div><div class="quest-progress-text" style="color:#22c55e; font-weight:bold;">Terminée !</div></div>`;
            actionHTML = `<button class="quest-btn quest-btn-claim" onclick="game.claimExpedition(${index})">🎁 Récupérer les récompenses</button>`;
        }

        card.className = `quest-card ${statusClass}`;
        card.innerHTML = `<div class="quest-header"><div class="quest-title" style="display:flex; align-items:center; gap:10px;"><img src="${spriteUrl}" style="width:32px; height:32px; vertical-align:middle;"><span>${expeditionDef.name}</span></div></div><div class="quest-description"><strong>${creatureName}</strong> ${levelText} explorent cette zone.</div>${progressHTML}${actionHTML}`;
        activeContainer.appendChild(card);
    });
}

function updateAvailableExpeditionsListLogic(game) {
    const container = document.getElementById('availableExpeditionsList');
    if (!container) return;
    container.innerHTML = '';

    if (game.availableExpeditions.length < game.maxAvailableExpeditions) {
        const minutes = Math.floor(game.expeditionTimer / 60000);
        const seconds = Math.floor((game.expeditionTimer % 60000) / 1000);
        container.innerHTML = `<div style="text-align:center; font-size:12px; color:#666; margin-bottom:10px;">Prochaine mission dans : <strong>${minutes}m ${seconds}s</strong></div>`;
    } else {
        container.innerHTML = `<div style="text-align:center; font-size:12px; color:#e74c3c; margin-bottom:10px;">Tableau des missions complet ! (6/6)</div>`;
    }

    if (game.availableExpeditions.length === 0) {
        container.innerHTML += '<p style="text-align:center; color:#999;">Aucune mission disponible.</p>';
        return;
    }

    game.availableExpeditions.forEach(inst => {
        const exp = EXPEDITION_DEFINITIONS[inst.defId];
        if (!exp) return;
        const card = document.createElement('div');
        card.className = 'quest-card';
        let lootIcons = "";
        if (exp.rewardPool.items) {
            lootIcons = Object.keys(exp.rewardPool.items).map(k => ALL_ITEMS[k] ? ALL_ITEMS[k].icon : '📦').slice(0, 3).join(' ');
        }
        let reqText = "";
        if (exp.rewardPool.requirements && exp.rewardPool.requirements.length > 0) {
            const badges = exp.rewardPool.requirements.map(req => {
                if (req.type === 'type') return `<span class="type-badge type-${req.value}" style="font-size:10px; padding:2px 6px;">${req.value}</span>`;
                if (req.type === 'talent') {
                    const talentName = PASSIVE_TALENTS[req.value] ? PASSIVE_TALENTS[req.value].name : req.value;
                    return `<span style="background:#4b5563; color:white; border-radius:4px; padding:2px 6px; font-size:10px;">★ ${talentName}</span>`;
                }
                return '';
            }).join(' ');
            reqText = `<div style="margin-top:8px; display:flex; align-items:center; gap:5px; flex-wrap:wrap;"><span style="font-size:11px; font-weight:bold; color:#333;">Requis:</span> ${badges}</div>`;
        }
        const canLaunch = game.activeExpeditions.length < game.maxExpeditionSlots;
        card.innerHTML = `<div class="quest-header"><div class="quest-title">${exp.name}</div><div class="quest-badge badge-medium">Nv ${exp.requiredLevel}+</div></div><div class="quest-description">${exp.description}${reqText}</div><div class="quest-rewards" style="justify-content: space-between; margin-top:5px;"><span style="font-size:12px; color:#666;">🕒 ${formatTimeString(exp.duration)}</span><span>${lootIcons}</span></div><button class="quest-btn btn-accept" onclick="game.showCreatureSelectForExpedition('${inst.uid}', '${inst.defId}')" ${canLaunch ? '' : 'disabled style="background:#ccc; cursor:not-allowed;"'}>${canLaunch ? 'Choisir une équipe' : 'Actifs (3/3)'}</button>`;
        container.appendChild(card);
    });
}

function updateExpeditionTimerLogic(game, deltaTime) {
    if (game.availableExpeditions.length >= game.maxAvailableExpeditions) {
        game.expeditionTimer = game.EXPEDITION_GEN_TIME;
        return;
    }
    game.expeditionTimer -= deltaTime;
    if (game.expeditionTimer <= 0) {
        game.generateRandomExpedition();
        game.expeditionTimer = game.EXPEDITION_GEN_TIME;
    }
}

function meetsExpeditionRequirementsLogic(game, creature, expeditionDef) {
    if (!expeditionDef.rewardPool || !expeditionDef.rewardPool.requirements || expeditionDef.rewardPool.requirements.length === 0) return true;
    return expeditionDef.rewardPool.requirements.some(req => {
        if (req.type === 'type') return creature.type === req.value || creature.secondaryType === req.value;
        if (req.type === 'talent') return creature.passiveTalent === req.value;
        return false;
    });
}

function calculateIndividualScoreLogic(game, creature, expeditionDef) {
    return creature.maxHp + creature.attack + creature.defense + creature.speed;
}

function calculateTeamSuccessRateLogic(game, squad, expeditionDef) {
    let totalScore = 0;
    squad.forEach(c => { totalScore += game.calculateIndividualScore(c, expeditionDef); });
    const difficulty = expeditionDef.difficulty || 100;
    return Math.max(0.1, Math.min(1.5, totalScore / difficulty));
}

function calculateExpeditionSuccessRateLogic(game, creature, expeditionDef) {
    const creatureScore = creature.maxHp + creature.attack + creature.defense + creature.speed;
    const difficulty = expeditionDef.difficulty || 100;
    return Math.max(0.1, Math.min(1.5, creatureScore / difficulty));
}

function generateRandomExpeditionLogic(game) {
    if (game.availableExpeditions.length >= game.maxAvailableExpeditions) return;
    const keys = Object.keys(EXPEDITION_DEFINITIONS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    game.availableExpeditions.push({
        uid: Date.now() + Math.random(),
        defId: randomKey,
        generatedAt: Date.now()
    });
    if (typeof toast !== 'undefined') toast.info("Nouvelle Mission", "Une nouvelle expédition est disponible !");
    game.updateExpeditionsDisplay();
}

function startExpeditionLogic(game, storageIndices, expeditionUid, expeditionId) {
    if (game.activeExpeditions.length >= game.maxExpeditionSlots) {
        logMessage("❌ Slots d'expédition pleins !");
        return;
    }
    let missionIndex = -1;
    if (expeditionUid != null) {
        missionIndex = game.availableExpeditions.findIndex(e => e.uid == expeditionUid);
        if (missionIndex === -1) {
            logMessage("❌ Cette expédition n'est plus disponible.");
            game.updateAvailableExpeditionsList();
            return;
        }
    }
    const expeditionDef = EXPEDITION_DEFINITIONS[expeditionId];
    if (!expeditionDef) return;

    let indicesArray = Array.isArray(storageIndices) ? storageIndices : [storageIndices];
    indicesArray.sort((a, b) => b - a);
    const squad = [];
    for (let idx of indicesArray) {
        const creature = game.storage[idx];
        if (!creature) continue;
        if (creature.level < expeditionDef.requiredLevel) {
            toast.error("Niveau insuffisant", `${creature.name} n'a pas le niveau requis.`);
            return;
        }
        if (creature.currentStamina < 1) {
            toast.error("Trop fatigué", `${creature.name} a besoin de repos.`);
            return;
        }
        squad.push(creature);
    }
    if (squad.length === 0) return;

    const successRate = game.calculateTeamSuccessRate(squad, expeditionDef);
    for (let idx of indicesArray) {
        const c = game.storage[idx];
        c.currentStamina = 0;
        game.storage.splice(idx, 1);
    }

    let duration = expeditionDef.duration;
    if (typeof EXPEDITION_BIOMES !== 'undefined') {
        const biome = EXPEDITION_BIOMES[expeditionId];
        if (biome && game.expeditionMastery) {
            const xp = game.expeditionMastery[biome] || 0;
            let timeReduction = 0;
            if (typeof BIOME_MASTERY_LEVELS !== 'undefined') {
                for (let lvl = 5; lvl >= 1; lvl--) {
                    if (xp >= BIOME_MASTERY_LEVELS[lvl].xpRequired) {
                        timeReduction = BIOME_MASTERY_LEVELS[lvl].bonus;
                        break;
                    }
                }
            }
            if (timeReduction > 0) duration = Math.floor(duration * (1 - timeReduction));
        }
    }

    const expedition = {
        squadData: squad.map(c => c.serialize()),
        expeditionId: expeditionId,
        startTime: Date.now(),
        endTime: Date.now() + duration,
        successRateSnapshot: successRate
    };
    if (missionIndex >= 0) game.availableExpeditions.splice(missionIndex, 1);
    game.activeExpeditions.push(expedition);
    if (typeof game.checkSpecialQuests === 'function') game.checkSpecialQuests('expeditionLaunched');

    const names = squad.map(c => c.name).join(', ');
    let chanceStr = successRate >= 1 ? " (Succès Garanti)" : ` (${Math.floor(successRate*100)}%)`;
    logMessage(`🗺️ Départ : ${names} vers ${expeditionDef.name}${chanceStr}`);
    if (typeof toast !== 'undefined') toast.info("Expédition Lancée", `Retour dans ${formatTimeString(duration)}.`);

    const selectModal = document.getElementById('creatureSelectModal');
    if (selectModal) document.body.removeChild(selectModal);
    const oldModal = document.getElementById('expeditionSendModal');
    if (oldModal) document.body.removeChild(oldModal);

    game.updateStorageDisplay();
    game.updateExpeditionsDisplay();
}

function claimExpeditionLogic(game, index) {
    const expedition = game.activeExpeditions[index];
    if (!expedition || Date.now() < expedition.endTime) return;

    const expeditionDef = EXPEDITION_DEFINITIONS[expedition.expeditionId];
    if (!expeditionDef) {
        logMessage("❌ Erreur critique : Définition d'expédition introuvable.");
        game.activeExpeditions.splice(index, 1);
        game.updateExpeditionsDisplay();
        return;
    }

    let squad = [];
    try {
        if (expedition.squadData && Array.isArray(expedition.squadData)) {
            squad = expedition.squadData.map(data => Creature.deserialize(data));
        } else if (expedition.creatureData) {
            squad = [Creature.deserialize(expedition.creatureData)];
        } else throw new Error("Aucune donnée de créature trouvée.");
    } catch (e) {
        console.error("Erreur lors de la récupération de l'escouade :", e);
        game.activeExpeditions.splice(index, 1);
        game.updateExpeditionsDisplay();
        return;
    }

    const successRate = expedition.successRateSnapshot || 1.0;
    const leader = squad[0];
    const rewards = game.calculateExpeditionRewards(expeditionDef, leader, successRate);

    squad.forEach(creature => {
        if (rewards.performance === 'FAILURE') creature.currentHp = 1;
        else creature.heal();
        game.storage.push(creature);
    });

    const biome = EXPEDITION_BIOMES[expedition.expeditionId];
    if (!game.expeditionMastery) game.expeditionMastery = {};
    if (biome) game.expeditionMastery[biome] = (game.expeditionMastery[biome] || 0) + 1;

    let rewardMessages = [];
    let title = "Retour d'Expédition", toastType = "success";
    if (rewards.performance === 'CRITICAL') {
        title = "🌟 SUCCÈS CRITIQUE !";
        toastType = "legendary";
        rewardMessages.push("Performance exceptionnelle ! (Butin x2)");
    } else if (rewards.performance === 'FAILURE') {
        title = "⚠️ Échec...";
        toastType = "warning";
        rewardMessages.push("L'expédition a mal tourné...");
    }

    if (rewards.pokedollars > 0) {
        game.pokedollars += rewards.pokedollars;
        game.stats.totalPokedollarsEarned += rewards.pokedollars;
        game.checkAchievements('totalPokedollarsEarned');
        game.checkSpecialQuests('pokedollars_gained');
        rewardMessages.push(`💰 ${formatNumber(rewards.pokedollars)}$`);
    }
    if (rewards.tokens > 0) {
        game.questTokens += rewards.tokens;
        rewardMessages.push(`🎫 ${rewards.tokens} Jetons`);
    }
    if (rewards.shards > 0) {
        const shardKey = getShardKey(leader.name, leader.rarity);
        game.shards[shardKey] = (game.shards[shardKey] || 0) + rewards.shards;
        rewardMessages.push(`💎 ${rewards.shards} Shards (${leader.name})`);
        game.checkSpecialQuests('totalShards');
    }
    if (rewards.eggs) {
        Object.entries(rewards.eggs).forEach(([rarity, amount]) => {
            game.eggs[rarity] = (game.eggs[rarity] || 0) + amount;
            rewardMessages.push(`🥚 ${amount}x ${rarity}`);
        });
    }
    if (rewards.items) {
        Object.entries(rewards.items).forEach(([itemKey, amount]) => {
            game.addItem(itemKey, amount);
            const itemName = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[itemKey]) ? ALL_ITEMS[itemKey].name : itemKey;
            rewardMessages.push(`📦 ${amount}x ${itemName}`);
        });
    }

    game.activeExpeditions.splice(index, 1);
    const names = squad.map(c => c.name).join(', ');
    logMessage(`✅ ${names} de retour. ${rewardMessages.join(', ')}`);
    if (typeof toast !== 'undefined') toast.show({ title, message: rewardMessages.join(', '), type: toastType, duration: 6000 });

    game.updateStorageDisplay();
    game.updateExpeditionsDisplay();
    game.updateEggsDisplay();
    game.updateShopDisplay();
    game.updatePlayerStatsDisplay();
}

function calculateExpeditionRewardsLogic(game, expeditionDef, creature, successRate) {
    let performance = 'NORMAL';
    const roll = Math.random();
    if (successRate > 1.0 && roll < (successRate - 1.0)) performance = 'CRITICAL';
    else if (roll > successRate) performance = 'FAILURE';

    const rewards = { pokedollars: 0, tokens: 0, shards: 0, eggs: {}, items: {}, performance };
    const pool = expeditionDef.rewardPool;
    let lootMultiplier = 1;
    if (performance === 'FAILURE') lootMultiplier = 0.25;
    if (performance === 'CRITICAL') lootMultiplier = 2.0;

    if (pool.pokedollars) {
        const base = Math.floor(Math.random() * (pool.pokedollars.max - pool.pokedollars.min) + pool.pokedollars.min);
        rewards.pokedollars = Math.floor(base * lootMultiplier);
    }
    if (pool.tokens && performance !== 'FAILURE') {
        if (Math.random() < pool.tokens.chance) {
            const base = Math.floor(Math.random() * (pool.tokens.max - pool.tokens.min) + pool.tokens.min);
            rewards.tokens = Math.floor(base * lootMultiplier);
        }
    }
    if (pool.shards && Math.random() < pool.shards.chance) {
        rewards.shards = Math.max(1, Math.floor(pool.shards.amount * lootMultiplier));
    }
    if (pool.eggs && performance !== 'FAILURE') {
        Object.entries(pool.eggs).forEach(([rarity, eggInfo]) => {
            let chance = eggInfo.chance * (performance === 'CRITICAL' ? 1.5 : 1);
            if (Math.random() < chance) rewards.eggs[rarity] = (rewards.eggs[rarity] || 0) + eggInfo.amount;
        });
    }
    if (pool.items && performance !== 'FAILURE') {
        Object.entries(pool.items).forEach(([itemKey, itemInfo]) => {
            let chance = itemInfo.chance * (performance === 'CRITICAL' ? 1.5 : 1);
            if (Math.random() < chance) rewards.items[itemKey] = (rewards.items[itemKey] || 0) + itemInfo.amount;
        });
    }
    return rewards;
}

function showCreatureSelectForExpeditionLogic(game, expeditionUid, expeditionId) {
    const expeditionDef = EXPEDITION_DEFINITIONS[expeditionId];
    if (!expeditionDef) return;
    game.tempSquad = [];
    const teamSize = expeditionDef.teamSize || 1;

    const candidates = game.storage.map((creature, index) => {
        const meetsReqs = game.meetsExpeditionRequirements(creature, expeditionDef);
        return { creature, index, individualScore: game.calculateIndividualScore(creature, expeditionDef), compatible: creature.level >= expeditionDef.requiredLevel && creature.currentStamina > 0 && meetsReqs };
    }).filter(c => c.compatible);
    candidates.sort((a, b) => b.individualScore - a.individualScore);

    const existingModal = document.getElementById('creatureSelectModal');
    if (existingModal) document.body.removeChild(existingModal);

    const modal = document.createElement('div');
    modal.id = 'creatureSelectModal';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;`;
    modal.addEventListener('click', function(e) { if (e.target === modal) document.body.removeChild(modal); });

    const content = document.createElement('div');
    content.style.cssText = `background: white; padding: 20px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative;`;

    let html = `<h3 style="margin-top:0; color:#333;">${expeditionDef.name}</h3><p style="color:#666; font-size:12px;">Sélectionnez <strong><span id="squadCount">0</span>/${teamSize}</strong> Pokémon.</p><div id="squadList" style="display:grid; gap:10px; padding-bottom: 80px;">`;
    if (candidates.length === 0) {
        let reqsHTML = expeditionDef.rewardPool.requirements ? expeditionDef.rewardPool.requirements.map(r => (r.type === 'type' ? `Type <strong>${r.value}</strong>` : r.type === 'talent' ? `Talent <strong>${r.value}</strong>` : '')).join(" OU ") : "Aucune restriction";
        html += `<div style="text-align:center; padding:20px; color:#ef4444;">Aucun Pokémon compatible.<br><small>${reqsHTML}</small></div>`;
    } else {
        candidates.forEach(cand => {
            const c = cand.creature;
            const spriteUrl = getPokemonSpriteUrl(c.name, c.isShiny);
            const divId = `cand-${cand.index}`;
            html += `<div id="${divId}" onclick="game.toggleSquadSelection(${cand.index}, ${teamSize}, '${divId}', '${expeditionId}')" style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; transition:0.2s; background:white;"><img src="${spriteUrl}" style="width:48px; height:48px;"><div style="flex:1;"><div style="font-weight:bold; font-size:14px;">${c.name} <span style="font-size:11px; color:#666;">Niv.${c.level}</span></div><div style="font-size:11px; color:#666;">Puissance: ${formatNumber(cand.individualScore)}</div></div></div>`;
        });
    }
    html += `</div><div id="launchButtonContainer" class="squad-counter" style="display:flex; justify-content:space-between; width:90%; max-width:400px;"><div style="display:flex; flex-direction:column;"><span style="font-size:10px; color:#ccc;">CHANCES DE RÉUSSITE</span><span id="squadSuccessText" style="font-weight:bold; font-size:16px; color:#ef4444;">0%</span></div><button id="btnLaunchExpedition" class="btn" disabled style="background:#ccc; color:white; border:none; padding:8px 20px; border-radius:20px; font-weight:bold; transition:0.3s;" onclick="game.finalizeSquadStart('${expeditionUid}', '${expeditionId}')">SÉLECTIONNER (${teamSize})</button></div>`;
    html += `<button onclick="document.body.removeChild(document.getElementById('creatureSelectModal'))" style="width:100%; padding:12px; margin-top:10px; background:#f1f5f9; color:#64748b; border:none; border-radius:8px; cursor:pointer;">Annuler</button>`;
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function toggleSquadSelectionLogic(game, storageIndex, maxSize, divId, expeditionId) {
    const div = document.getElementById(divId);
    if (!div) return;
    const indexInSquad = game.tempSquad.indexOf(storageIndex);
    if (indexInSquad === -1) {
        if (game.tempSquad.length >= maxSize) { if (typeof toast !== 'undefined') toast.warning("Équipe complète", `Max ${maxSize} Pokémon.`); return; }
        game.tempSquad.push(storageIndex);
        div.classList.add('squad-selected');
    } else {
        game.tempSquad.splice(indexInSquad, 1);
        div.classList.remove('squad-selected');
    }
    const countSpan = document.getElementById('squadCount');
    if (countSpan) countSpan.textContent = game.tempSquad.length;
    const expeditionDef = EXPEDITION_DEFINITIONS[expeditionId];
    let currentRate = 0;
    if (game.tempSquad.length > 0 && expeditionDef) {
        const tempCreatures = game.tempSquad.map(idx => game.storage[idx]);
        currentRate = game.calculateTeamSuccessRate(tempCreatures, expeditionDef);
    }
    const successText = document.getElementById('squadSuccessText');
    const percent = Math.floor(currentRate * 100);
    if (successText) {
        successText.textContent = `${percent}%`;
        successText.style.color = percent >= 100 ? "#22c55e" : percent >= 70 ? "#f59e0b" : "#ef4444";
    }
    const btnLaunch = document.getElementById('btnLaunchExpedition');
    if (btnLaunch) {
        if (game.tempSquad.length === maxSize) {
            btnLaunch.disabled = false;
            btnLaunch.style.background = "#22c55e";
            btnLaunch.style.cursor = "pointer";
            btnLaunch.textContent = "LANCER !";
        } else {
            btnLaunch.disabled = true;
            btnLaunch.style.background = "#ccc";
            btnLaunch.style.cursor = "not-allowed";
            btnLaunch.textContent = `CHOISIR ENCORE ${maxSize - game.tempSquad.length}`;
        }
    }
}

function showExpeditionSendModalLogic(game, storageIndex) {
    const creature = game.storage[storageIndex];
    if (!creature) return;
    const existingModal = document.getElementById('expeditionSendModal');
    if (existingModal) document.body.removeChild(existingModal);

    const modal = document.createElement('div');
    modal.id = 'expeditionSendModal';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;`;
    modal.addEventListener('click', function(e) { if (e.target === modal) document.body.removeChild(modal); });

    const content = document.createElement('div');
    content.style.cssText = `background: white; padding: 30px; border-radius: 15px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 0 20px rgba(0,0,0,0.5); position: relative;`;

    const creatureScore = creature.maxHp + creature.attack + creature.defense + creature.speed;
    let html = `<h2 style="margin-bottom: 10px; color:#333;">Envoyer ${creature.name}</h2><div style="margin-bottom:20px; font-size:13px; color:#666;">Niveau: <strong>${creature.level}</strong> | Puissance: <strong>${formatNumber(creatureScore)}</strong> | Endurance: <span style="color:${creature.currentStamina > 0 ? '#22c55e' : '#ef4444'}">${creature.currentStamina}/${creature.maxStamina}</span></div><div style="display: grid; gap: 10px;">`;

    Object.values(EXPEDITION_DEFINITIONS).forEach(exp => {
        const canSend = creature.level >= exp.requiredLevel && creature.currentStamina > 0;
        const successRate = game.calculateExpeditionSuccessRate(creature, exp);
        const successPercent = Math.min(100, Math.floor(successRate * 100));
        let barColor = successRate >= 1.0 ? '#22c55e' : successRate >= 0.7 ? '#f59e0b' : '#ef4444';
        let bonusHTML = '';
        if (exp.rewardPool.requirements) {
            exp.rewardPool.requirements.forEach(req => {
                let isApplied = (req.type === 'type' && (creature.type === req.value || creature.secondaryType === req.value)) || (req.type === 'talent' && creature.passiveTalent === req.value);
                if (isApplied) bonusHTML += `<span style="color: #16a34a; font-weight: bold; font-size:11px; margin-right:5px;">✓ ${req.type === 'type' ? req.value : (PASSIVE_TALENTS[req.value]?.name || req.value)}</span>`;
            });
        }
        let lootIcons = exp.rewardPool.items ? Object.keys(exp.rewardPool.items).map(k => ALL_ITEMS[k] ? ALL_ITEMS[k].icon : '📦').join(' ') : '';
        html += `<button onclick="game.startExpedition(${storageIndex}, null, '${exp.id}')" style="padding: 12px; background: ${canSend ? '#f8f9fa' : '#e9ecef'}; border: 2px solid ${canSend ? '#e2e8f0' : '#ccc'}; border-radius: 10px; cursor: ${canSend ? 'pointer' : 'not-allowed'}; text-align: left;" ${canSend ? '' : 'disabled'}><div style="display:flex; justify-content:space-between;"><strong>${exp.name}</strong><span style="font-size: 12px; background:#e2e8f0; padding:2px 6px; border-radius:4px;">🕒 ${formatTimeString(exp.duration)}</span></div><div style="font-size: 12px; color: #666; margin: 4px 0;">${exp.description}</div><div style="display:flex; align-items:center; gap:10px; margin-top:8px;"><div style="flex-grow:1; height:6px; background:#ddd; border-radius:3px; overflow:hidden;"><div style="width:${successPercent}%; height:100%; background:${barColor};"></div></div><span style="font-size:11px; font-weight:bold; color:${barColor}; width:40px; text-align:right;">${successPercent}%</span></div><div style="margin-top: 5px;">${bonusHTML}</div><div style="position:absolute; bottom:10px; right:10px; font-size:14px;">${lootIcons}</div></button>`;
    });
    html += `</div><button onclick="document.body.removeChild(document.getElementById('expeditionSendModal'))" style="margin-top: 20px; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight:bold;">Annuler</button>`;
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
}
