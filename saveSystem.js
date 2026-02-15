/**
 * @file saveSystem.js
 * Sauvegarde, chargement, export/import, reset.
 * Fonctions globales recevant game (instance du jeu) en paramètre.
 *
 * Dépendances globales : Creature, Quest, ZONES, currentZone, maxReachedZone,
 * updateZoneInfo, logMessage, toast
 *
 * Clé localStorage : creatureGameSave — NE PAS MODIFIER (rétrocompatibilité)
 */

// Clé localStorage — NE PAS MODIFIER
const SAVE_KEY = 'creatureGameSave';

// ============================================================
// SAUVEGARDE
// ============================================================

function saveGameLogic(game) {
    // 1. Contrôle d'intégrité AVANT de toucher au LocalStorage
    if (!game.playerTeam || !Array.isArray(game.playerTeam) || game.playerTeam.length === 0) {
        console.error("⛔ SAUVEGARDE BLOQUÉE : L'équipe du joueur est vide ou corrompue !");
        if (typeof toast !== 'undefined') {
            toast.error("Erreur Sauvegarde", "Données corrompues détectées. Sauvegarde annulée pour protéger votre progression.");
        }
        return false;
    }

    if (isNaN(game.pokedollars) || game.pokedollars < 0) {
        console.warn("⚠️ Correction auto : Pokédollars négatifs ou NaN remis à 0.");
        game.pokedollars = 0;
    }

    // 2. Préparation des données complètes
    const gameData = {
        // -- Équipes --
        playerTeam: game.playerTeam.map(creature => creature.serialize()),
        storage: game.storage.map(creature => creature.serialize()),
        pension: game.pension.map(creature => creature.serialize()),
        
        // -- Stats & Ressources --
        playerMainStats: { ...game.playerMainStats },
        eggs: { ...game.eggs },
        shards: { ...game.shards },
        pokedollars: game.pokedollars,
        talentRerolls: game.talentRerolls,
        talentChoices: game.talentChoices,
        essenceDust: game.essenceDust,
        combatTickets: game.combatTickets,
        marquesDuTriomphe: game.marquesDuTriomphe,
        questTokens: game.questTokens,
        
        // -- Progression --
        pokedex: { ...game.pokedex },
        upgrades: { ...game.upgrades },
        towerRecord: game.towerRecord,
        stats: { ...game.stats },
        badges: { ...game.badges },
        
        achievementsCompleted: { ...game.achievementsCompleted },
        currentZone: currentZone,
        maxReachedZone: maxReachedZone,

        // -- Expéditions --
        availableExpeditions: game.availableExpeditions,
        expeditionTimer: game.expeditionTimer,
        expeditionMastery: game.expeditionMastery,
        activeExpeditions: game.activeExpeditions,
        maxExpeditionSlots: game.maxExpeditionSlots,

        // -- Paramètres & États --
        activeCreatureIndex: game.activeCreatureIndex,
        sortBy: game.sortBy,
        pauseOnRare: game.pauseOnRare,
        sortOrder: game.sortOrder,
        autoSelectEnabled: game.autoSelectEnabled,
        isPensionCollapsed: game.isPensionCollapsed,
        captureMode: game.captureMode,
        captureTarget: game.captureTargets,
        
        // -- Objets & Buffs --
        items: game.items,
        activeVitamins: game.activeVitamins,
        activeStatBoosts: game.activeStatBoosts,
        activeBoosts: game.activeBoosts,
        permanentBoosts: game.permanentBoosts,
        hasAutoCatcher: game.hasAutoCatcher,
        autoCatcherSettings: game.autoCatcherSettings,
        
        // -- Zone Progress (Copie propre) --
        zoneProgress: Object.keys(game.zoneProgress).reduce((acc, zoneId) => {
            acc[zoneId] = {
                pokemonTiers: { ...game.zoneProgress[zoneId].pokemonTiers },
                bossesDefeated: game.zoneProgress[zoneId].bossesDefeated,
                epicsDefeated: game.zoneProgress[zoneId].epicsDefeated
            };
            return acc;
        }, {}),
        
        // -- Quêtes (Copie légère) --
        quests: game.quests.map(quest => ({
            id: quest.id,
            type: quest.type,
            questType: quest.questType,
            title: quest.title,
            description: quest.description,
            target: quest.target,
            current: quest.current,
            startValue: quest.startValue,
            trackingKey: quest.trackingKey,
            difficulty: quest.difficulty,
            special: quest.special,
            specialParams: quest.specialParams,
            accepted: quest.accepted,
            completed: quest.completed,
            claimed: quest.claimed,
            rewards: quest.rewards,
            dialogue: quest.dialogue
        })),
        
        questsCompleted: game.questsCompleted,
        completedStoryQuests: game.completedStoryQuests || [],
        nextQuestTimer: game.nextQuestTimer,
        lastQuestUpdate: game.lastQuestUpdate,
        
        // -- Narrative (Professor Chen) --
        narrative: (typeof narrativeManager !== 'undefined' && narrativeManager.getSaveData) ? narrativeManager.getSaveData() : {},

        // -- Timers Système --
        lastSaveTime: Date.now(),
        saveTime: Date.now(),
        
        // -- Arène --
        arenaState: {
            active: game.arenaState.active,
            arenaId: game.arenaState.arenaId,
            currentChampionIndex: game.arenaState.currentChampionIndex,
            startTime: game.arenaState.startTime
        }
    };
    
    try {
        const json = JSON.stringify(gameData);
        localStorage.setItem(SAVE_KEY, json);
        
        const btn = document.getElementById('btnSave');
        if (btn) {
            btn.classList.add('save-active');
            setTimeout(() => btn.classList.remove('save-active'), 1000);
        }
        return true;
    } catch (error) {
        console.error("ERREUR FATALE SAUVEGARDE :", error);
        if (typeof toast !== 'undefined') {
            toast.error("Erreur Critique", "Impossible de sauvegarder (Quota de stockage dépassé ?).");
        }
        return false;
    }
}

// ============================================================
// CHARGEMENT
// ============================================================

function loadGameLogic(game) {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) return false;
        
        const gameData = JSON.parse(savedData);
        
        game.playerTeam = gameData.playerTeam.map(data => Creature.deserialize(data));
        
        game.captureMode = gameData.captureMode || 0;
        game.captureTargets = gameData.captureTargets || null;
        game.updateCaptureButtonDisplay();
        game.updateCaptureTargetList();
        
        // Charger le stockage
        game.storage = [];
        if (gameData.storage) {
            game.storage = gameData.storage.map(data => Creature.deserialize(data));
        }
        
        // Charger la pension
        game.pension = [];
        if (gameData.pension) {
            game.pension = gameData.pension.map(data => Creature.deserialize(data));
        }
        
        game.expeditionMastery = gameData.expeditionMastery || { 
            FOREST: 0, CAVE: 0, CITY: 0, DARK: 0, VOLCANO: 0, 
            ICE: 0, SKY: 0 
        };
        
        if (gameData.pauseOnRare !== undefined) game.pauseOnRare = gameData.pauseOnRare;
        
        game.hasAutoCatcher = gameData.hasAutoCatcher || false;
        if (gameData.autoCatcherSettings) {
            game.autoCatcherSettings = gameData.autoCatcherSettings;
        }
        
        game.availableExpeditions = gameData.availableExpeditions || [];
        game.expeditionTimer = gameData.expeditionTimer || game.EXPEDITION_GEN_TIME;
        game.maxExpeditionSlots = 3;
        
        game.playerMainStats = { ...gameData.playerMainStats };
        game.eggs = { ...gameData.eggs };
        game.shards = gameData.shards || {};
        game.pokedollars = gameData.pokedollars || 0;
        game.talentRerolls = gameData.talentRerolls || 0;
        game.talentChoices = gameData.talentChoices || 0;
        game.pokedex = gameData.pokedex || {};
        game.badges = gameData.badges || {};
        game.essenceDust = gameData.essenceDust || 0;
        game.activeExpeditions = gameData.activeExpeditions || [];
        game.maxExpeditionSlots = gameData.maxExpeditionSlots || 1;

        const now = Date.now();
        let completedOffline = 0;
        game.activeExpeditions.forEach(exp => {
            if (now >= exp.endTime) completedOffline++;
        });
        if (completedOffline > 0) {
            logMessage(`🌍 ${completedOffline} expédition(s) se sont terminées pendant votre absence !`);
        }
        
        if (gameData.upgrades) {
            Object.keys(game.upgrades).forEach(key => {
                if (gameData.upgrades[key]) {
                    game.upgrades[key].level = gameData.upgrades[key].level || 0;
                }
            });
        }
        game.achievements = gameData.achievements || {};
        game.completedStoryQuests = gameData.completedStoryQuests || [];
        
        if (gameData.quests) {
            game.quests = gameData.quests.map(questData => {
                const template = {
                    title: questData.title,
                    desc: questData.description,
                    target: [questData.target],
                    trackingKey: questData.trackingKey,
                    special: questData.special
                };
                const quest = new Quest(template, 1, questData.difficulty || 'EASY');
                quest.id = questData.id;
                quest.type = questData.type;
                quest.questType = questData.questType || questData.type;
                quest.current = questData.current || 0;
                quest.startValue = questData.startValue || 0;
                quest.accepted = questData.accepted || false;
                quest.completed = questData.completed || false;
                quest.claimed = questData.claimed || false;
                quest.rewards = questData.rewards;
                if (questData.specialParams) quest.specialParams = questData.specialParams;
                if (questData.dialogue) quest.dialogue = questData.dialogue;
                return quest;
            });
        }

        game.questTokens = gameData.questTokens || 0;
        game.questsCompleted = gameData.questsCompleted || 0;
        game.nextQuestTimer = gameData.nextQuestTimer || 60000;
        game.lastQuestUpdate = gameData.lastQuestUpdate || Date.now();

        game.combatTickets = gameData.combatTickets || 0;
        game.marquesDuTriomphe = gameData.marquesDuTriomphe || 0;
        game.towerRecord = gameData.towerRecord || 0;
        game.towerState = {
            isActive: false,
            currentFloor: 0,
            currentEnemyIndex: 0,
            enemyTeam: []
        };
        
        if (gameData.activeBoosts) {
            game.activeBoosts = gameData.activeBoosts.filter(boost => boost.endTime > Date.now());
        }
        
        if (gameData.permanentBoosts) {
            game.permanentBoosts = gameData.permanentBoosts;
            game.permanentBoosts.pensionSlots = game.permanentBoosts.pensionSlots || 0;
        } else {
            game.permanentBoosts = { xp: 0, team_contribution: 0, pensionSlots: 0 };
        }
        
        game.items = gameData.items || {};
        game.activeVitamins = gameData.activeVitamins || {
            hp: 0, attack: 0, spattack: 0, defense: 0, spdefense: 0, speed: 0, all: 0
        };

        if (gameData.activeStatBoosts) {
            game.activeStatBoosts = gameData.activeStatBoosts.filter(boost => boost.endTime > Date.now());
        } else {
            game.activeStatBoosts = [];
        }
        
        game.activeCreatureIndex = gameData.activeCreatureIndex || 0;
        game.sortBy = gameData.sortBy || 'none';
        game.sortOrder = gameData.sortOrder || 'desc';
        game.autoSelectEnabled = gameData.autoSelectEnabled || false;
        
        if (gameData.stats) {
            game.stats = { ...game.stats, ...gameData.stats };
        }
        game.achievementsCompleted = gameData.achievementsCompleted || {};

        if (typeof narrativeManager !== 'undefined' && narrativeManager.loadSaveData) {
            if (gameData.narrative) {
                narrativeManager.loadSaveData(gameData.narrative);
            } else if (gameData.playerTeam && gameData.playerTeam.length > 0) {
                narrativeManager.loadSaveData({ introComplete: true, starterChoice: null, milestonesSeen: [], billionComplete: false });
            }
        }

        if (gameData.zoneProgress) {
            Object.keys(ZONES).forEach(zoneId => {
                if (gameData.zoneProgress[zoneId]) {
                    if (gameData.zoneProgress[zoneId].enemyTiers) {
                        game.zoneProgress[zoneId] = {
                            pokemonTiers: {},
                            bossesDefeated: 0,
                            epicsDefeated: 0
                        };
                    } else {
                        game.zoneProgress[zoneId] = gameData.zoneProgress[zoneId];
                    }
                } else {
                    game.zoneProgress[zoneId] = { pokemonTiers: {}, bossesDefeated: 0, epicsDefeated: 0 };
                }
            });
        }
        
        if (game.activeCreatureIndex >= game.playerTeam.length) {
            game.activeCreatureIndex = 0;
        }
        
        if (game.sortBy !== 'none' && game.storage.length > 0) {
            game.sortStorage(game.sortBy);
        }
        
        if (gameData.currentZone) {
            currentZone = gameData.currentZone;
            if (typeof window !== 'undefined') window.currentZone = currentZone;
            const zoneSelect = document.getElementById('zoneSelect');
            if (zoneSelect) zoneSelect.value = currentZone;
            if (typeof updateZoneInfo === 'function') updateZoneInfo();
        }
        
        if (gameData.maxReachedZone) {
            maxReachedZone = gameData.maxReachedZone;
        } else {
            maxReachedZone = currentZone;
        }
        if (typeof window !== 'undefined') window.maxReachedZone = maxReachedZone;
        
        if (gameData.badges) {
            game.badges = { ...gameData.badges };
        }

        if (gameData.arenaState && gameData.arenaState.active) {
            game.resetArenaState();
        }

        game.applyAccountTalents();
        game.initAchievements();
        
        let maxLvlFound = 0;
        game.playerTeam.forEach(c => { if (c.level > maxLvlFound) maxLvlFound = c.level; });
        if (game.storage) game.storage.forEach(c => { if (c.level > maxLvlFound) maxLvlFound = c.level; });
        if (maxLvlFound > (game.stats.highestLevelReached || 0)) {
            game.stats.highestLevelReached = maxLvlFound;
            setTimeout(() => game.checkAchievements('highestLevelReached'), 1000);
        }
        
        if (gameData.lastSaveTime) {
            const offlineTime = Date.now() - gameData.lastSaveTime;
            const offlineSeconds = Math.floor(offlineTime / 1000);
            
            if (offlineSeconds > 0) {
                for (const creature of game.playerTeam) {
                    creature.currentStamina = creature.maxStamina;
                    creature.heal();
                }
                const minutes = Math.floor(offlineSeconds / 60);
                const hours = Math.floor(minutes / 60);
                if (hours > 0) {
                    logMessage("Progression hors ligne : " + hours + "h " + (minutes % 60) + "m appliquee !");
                } else if (minutes > 0) {
                    logMessage("Progression hors ligne : " + minutes + " minutes appliquee !");
                } else {
                    logMessage("Progression hors ligne : " + offlineSeconds + " secondes appliquee !");
                }
            }
            
            if (offlineTime > 0 && game.nextQuestTimer > 0) {
                game.nextQuestTimer = Math.max(0, game.nextQuestTimer - offlineTime);
                let questsGenerated = 0;
                while (game.quests.length < 10 && game.nextQuestTimer <= 0) {
                    game.generateQuest();
                    questsGenerated++;
                    const randomTime = (Math.random() * 480000) + 120000;
                    game.nextQuestTimer = randomTime;
                }
                if (questsGenerated > 0) {
                    logMessage(questsGenerated + " quête(s) générée(s) pendant votre absence !");
                }
            }
        }
        
        setTimeout(() => {
            game.updateCaptureButtonDisplay();
            if (game.captureMode === 2) {
                game.updateCaptureTargetList();
            }
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Erreur de chargement:', error);
        return false;
    }
}

// ============================================================
// GESTION — Export / Import / Reset
// ============================================================

function exportSaveLogic(game) {
    if (!saveGameLogic(game)) return;
    
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) {
        if (typeof toast !== 'undefined') toast.error("Erreur", "Aucune donnée à exporter.");
        return;
    }

    const blob = new Blob([saveData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.getHours() + "h" + date.getMinutes();
    a.href = url;
    a.download = `pokeweb_save_${dateStr}_${timeStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof toast !== 'undefined') toast.success("Export Réussi", "Fichier de sauvegarde téléchargé !");
}

function importSaveLogic(game) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            const content = event.target.result;
            try {
                const parsedData = JSON.parse(content);
                if (!parsedData.playerTeam || !parsedData.pokedollars || !parsedData.stats) {
                    throw new Error("Format de sauvegarde invalide (Clés manquantes).");
                }
                localStorage.setItem(SAVE_KEY, content);
                if (typeof toast !== 'undefined') toast.success("Import Réussi", "Le jeu va recharger...");
                setTimeout(() => location.reload(), 1000);
            } catch (err) {
                console.error("Erreur Import :", err);
                if (typeof toast !== 'undefined') toast.error("Fichier Invalide", "Ce fichier n'est pas une sauvegarde compatible.");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function hardResetLogic() {
    if (confirm('Etes-vous sur de vouloir recommencer ? Toute progression sera perdue !')) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
}
