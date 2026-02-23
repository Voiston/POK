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
// Cap de progression hors-ligne pour éviter les simulations extrêmes.
const OFFLINE_CAP_MS = 72 * 60 * 60 * 1000; // 72h

// ============================================================
// SAUVEGARDE
// ============================================================

function saveGameLogic(game) {
    // 1. Contrôle d'intégrité AVANT de toucher au LocalStorage
    if (!game.playerTeam || !Array.isArray(game.playerTeam) || game.playerTeam.length === 0) {
        console.error("⛔ SAUVEGARDE BLOQUÉE : L'équipe du joueur est vide ou corrompue !");
        toast.error("Erreur Sauvegarde", "Données corrompues détectées. Sauvegarde annulée pour protéger votre progression.");
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
        incubators: game.incubators ? game.incubators.map(slot => slot ? { ...slot } : null) : [null, null, null, null],
        autoIncubation: game.autoIncubation ? JSON.parse(JSON.stringify(game.autoIncubation)) : null,
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

        achievements: { ...game.achievements },
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
        autoSwitchDisadvantage: game.autoSwitchDisadvantage,
        autoSwitchStamina: game.autoSwitchStamina,
        autoUltimate: game.autoUltimate,
        offlineSimMaxCombatsPerSecond: game.offlineSimMaxCombatsPerSecond,
        isPensionCollapsed: game.isPensionCollapsed,
        captureMode: game.captureMode,
        captureTargets: game.captureTargets,
        teamRocketState: game.teamRocketState ? JSON.parse(JSON.stringify(game.teamRocketState)) : null,

        // -- Objets & Buffs --
        items: game.items ? { ...game.items } : {},
        activeVitamins: game.activeVitamins,
        activeStatBoosts: game.activeStatBoosts,
        activeBoosts: game.activeBoosts,
        permanentBoosts: game.permanentBoosts,
        hasAutoCatcher: game.hasAutoCatcher,
        autoCatcherSettings: game.autoCatcherSettings,

        // -- Zone Progress (Copie propre mais directe) --
        zoneProgress: Object.keys(game.zoneProgress).reduce((acc, zoneId) => {
            const z = game.zoneProgress[zoneId];
            acc[zoneId] = {
                pokemonTiers: { ...z.pokemonTiers },
                bossesDefeated: z.bossesDefeated,
                epicsDefeated: z.epicsDefeated
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
            tags: quest.tags,
            accepted: quest.accepted,
            completed: quest.completed,
            claimed: quest.claimed,
            rewards: quest.rewards,
            dialogue: quest.dialogue
        })),

        questsCompleted: game.questsCompleted,
        completedStoryQuests: game.completedStoryQuests || [],
        completedTeamRocketQuests: game.completedTeamRocketQuests || [],
        nextQuestTimer: game.nextQuestTimer,
        lastQuestUpdate: game.lastQuestUpdate,

        // -- Narrative (Professor Chen) --
        narrative: (narrativeManager && narrativeManager.getSaveData) ? narrativeManager.getSaveData() : {},

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
        return json;
    } catch (error) {
        console.error("ERREUR FATALE SAUVEGARDE :", error);
        toast.error("Erreur Critique", "Impossible de sauvegarder (Quota de stockage dépassé ?).");
        return false;
    }
}

// ============================================================
// CHARGEMENT
// ============================================================

/**
 * Vérifie qu'une entrée "créature" sérialisée a les champs requis pour désérialisation.
 */
function isValidCreatureEntry(entry, context) {
    if (!entry || typeof entry !== 'object') return context + ' : entrée créature invalide.';
    if (typeof entry.name !== 'string' || !entry.name) return context + ' : créature sans nom.';
    if (typeof entry.level !== 'number' || entry.level < 1 || entry.level > 999) return context + ' : niveau invalide (' + entry.name + ').';
    if (typeof entry.type !== 'string' || !entry.type) return context + ' : type manquant (' + entry.name + ').';
    if (typeof entry.rarity !== 'string' && typeof entry.rarity !== 'undefined') return context + ' : rareté invalide (' + entry.name + ').';
    return null;
}

/**
 * Vérifie qu'une entrée "quête" a une structure minimale cohérente.
 */
function isValidQuestEntry(entry, index) {
    if (!entry || typeof entry !== 'object') return 'Quête #' + index + ' : entrée invalide.';
    if (typeof entry.id !== 'string' && typeof entry.id !== 'number' && typeof entry.id !== 'undefined') return 'Quête #' + index + ' : id invalide.';
    if (typeof entry.target !== 'number' && typeof entry.target !== 'undefined') return 'Quête #' + index + ' : target invalide.';
    if (typeof entry.current !== 'number' && typeof entry.current !== 'undefined') return 'Quête #' + index + ' : current invalide.';
    if (entry.target != null && entry.current != null && entry.current > entry.target) return 'Quête #' + index + ' : current > target.';
    return null;
}

/**
 * Vérifie que les données chargées ont une structure complète et cohérente (équipe, quêtes, créatures, etc.).
 * Retourne une chaîne d'erreur ou null si OK.
 */
function validateSaveData(gameData) {
    if (!gameData || typeof gameData !== 'object') return 'Sauvegarde vide ou invalide.';

    // --- Équipe (obligatoire, non vide) ---
    if (!Array.isArray(gameData.playerTeam)) return 'Données corrompues : équipe manquante ou invalide.';
    if (gameData.playerTeam.length === 0) return 'Données corrompues : équipe vide.';
    for (let i = 0; i < gameData.playerTeam.length; i++) {
        const err = isValidCreatureEntry(gameData.playerTeam[i], 'Équipe slot ' + (i + 1));
        if (err) return err;
    }

    // --- Stockage & Pension (doivent être des tableaux) ---
    if (gameData.storage != null && !Array.isArray(gameData.storage)) return 'Données corrompues : stockage invalide.';
    if (gameData.storage && gameData.storage.length > 0) {
        for (let i = 0; i < gameData.storage.length; i++) {
            const err = isValidCreatureEntry(gameData.storage[i], 'Stockage slot ' + (i + 1));
            if (err) return err;
        }
    }
    if (gameData.pension != null && !Array.isArray(gameData.pension)) return 'Données corrompues : pension invalide.';
    if (gameData.pension && gameData.pension.length > 0) {
        for (let i = 0; i < gameData.pension.length; i++) {
            const err = isValidCreatureEntry(gameData.pension[i], 'Pension slot ' + (i + 1));
            if (err) return err;
        }
    }

    // --- Ressources & Stats ---
    if (typeof gameData.pokedollars !== 'number' || gameData.pokedollars < 0 || !Number.isFinite(gameData.pokedollars)) return 'Données corrompues : Pokédollars invalides.';
    if (!gameData.stats || typeof gameData.stats !== 'object') return 'Données corrompues : statistiques manquantes.';
    if (!gameData.playerMainStats || typeof gameData.playerMainStats !== 'object') return 'Données corrompues : stats joueur manquantes.';
    if (!gameData.upgrades || typeof gameData.upgrades !== 'object') return 'Données corrompues : upgrades manquants.';

    // --- Quêtes (tableau, chaque entrée valide) ---
    if (gameData.quests != null && !Array.isArray(gameData.quests)) return 'Données corrompues : quêtes invalides.';
    if (gameData.quests) {
        for (let i = 0; i < gameData.quests.length; i++) {
            const err = isValidQuestEntry(gameData.quests[i], i);
            if (err) return err;
        }
    }

    // --- Objets & listes optionnels mais typés ---
    if (gameData.items != null && typeof gameData.items !== 'object') return 'Données corrompues : items invalides.';
    if (gameData.pokedex != null && typeof gameData.pokedex !== 'object') return 'Données corrompues : Pokédex invalide.';
    if (gameData.badges != null && typeof gameData.badges !== 'object') return 'Données corrompues : badges invalides.';
    if (gameData.achievements != null && typeof gameData.achievements !== 'object') return 'Données corrompues : succès invalides.';
    if (gameData.activeExpeditions != null && !Array.isArray(gameData.activeExpeditions)) return 'Données corrompues : expéditions actives invalides.';
    if (gameData.incubators != null && !Array.isArray(gameData.incubators)) return 'Données corrompues : incubateurs invalides.';
    if (gameData.teamRocketState != null && typeof gameData.teamRocketState !== 'object') return 'Données corrompues : Team Rocket invalide.';

    // --- Index équipe dans les bornes ---
    const teamLen = gameData.playerTeam.length;
    const idx = gameData.activeCreatureIndex;
    if (typeof idx === 'number' && (idx < 0 || idx >= teamLen)) return 'Données corrompues : index de créature active hors limites.';

    return null;
}

function loadGameLogic(game) {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) return false;

        let gameData;
        try {
            gameData = JSON.parse(savedData);
        } catch (parseError) {
            console.error('Sauvegarde corrompue (JSON invalide):', parseError);
            if (typeof toast !== 'undefined') toast.error('Sauvegarde corrompue', 'Le fichier de sauvegarde est illisible (JSON invalide). Impossible de charger.');
            return false;
        }

        const validationError = validateSaveData(gameData);
        if (validationError) {
            console.error('Sauvegarde corrompue (structure invalide):', validationError);
            if (typeof toast !== 'undefined') toast.error('Sauvegarde corrompue', validationError + ' Le chargement a été annulé.');
            return false;
        }

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
        if (typeof gameData.offlineSimMaxCombatsPerSecond === 'number' && gameData.offlineSimMaxCombatsPerSecond > 0) {
            game.offlineSimMaxCombatsPerSecond = gameData.offlineSimMaxCombatsPerSecond;
        }

        game.hasAutoCatcher = gameData.hasAutoCatcher || false;
        if (gameData.autoCatcherSettings) {
            game.autoCatcherSettings = gameData.autoCatcherSettings;
        }

        game.availableExpeditions = gameData.availableExpeditions || [];
        game.expeditionTimer = gameData.expeditionTimer || game.EXPEDITION_GEN_TIME;

        game.playerMainStats = { ...gameData.playerMainStats };
        game.eggs = { ...gameData.eggs };
        // Incubateurs : 4 slots max, chaque slot = null ou { rarity, startTime, durationMs }
        game.incubators = Array.isArray(gameData.incubators)
            ? gameData.incubators.slice(0, 4).map(s => {
                if (!s || !s.rarity) return null;
                const startTime = Number(s.startTime);
                const durationMs = Number(s.durationMs);
                if (isNaN(startTime) || isNaN(durationMs) || durationMs <= 0) return null;
                return { rarity: s.rarity, startTime, durationMs };
            })
            : [null, null, null, null];
        while (game.incubators.length < 4) game.incubators.push(null);
        game.autoIncubation = game.normalizeAutoIncubationState ? game.normalizeAutoIncubationState(gameData.autoIncubation) : gameData.autoIncubation;
        game.shards = gameData.shards || {};
        game.pokedollars = gameData.pokedollars || 0;
        game.talentRerolls = gameData.talentRerolls || 0;
        game.talentChoices = gameData.talentChoices || 0;
        game.pokedex = gameData.pokedex || {};
        game.badges = gameData.badges || {};
        game.essenceDust = gameData.essenceDust || 0;
        game.activeExpeditions = gameData.activeExpeditions || [];
        game.maxExpeditionSlots = gameData.maxExpeditionSlots || 3;

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
        game.completedTeamRocketQuests = gameData.completedTeamRocketQuests || [];

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
                quest.id = (questData.id === undefined || questData.id === null) ? quest.id : String(questData.id);
                quest.type = questData.type;
                quest.questType = questData.questType || questData.type;
                quest.current = questData.current || 0;
                quest.startValue = questData.startValue || 0;
                quest.accepted = questData.accepted || false;
                quest.completed = questData.completed || false;
                quest.claimed = questData.claimed || false;
                quest.rewards = questData.rewards;
                if (questData.specialParams) quest.specialParams = questData.specialParams;
                if (questData.tags) quest.tags = Array.isArray(questData.tags) ? questData.tags : [questData.tags];
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

        game.items = (gameData.items && typeof gameData.items === 'object') ? { ...gameData.items } : {};
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
        game.autoSwitchDisadvantage = gameData.autoSwitchDisadvantage !== undefined ? gameData.autoSwitchDisadvantage : true;
        game.autoSwitchStamina = gameData.autoSwitchStamina !== undefined ? gameData.autoSwitchStamina : true;
        game.autoUltimate = gameData.autoUltimate !== undefined ? gameData.autoUltimate : true;
        game.isPensionCollapsed = gameData.isPensionCollapsed || false;
        if (typeof game.normalizeTeamRocketState === 'function') {
            game.teamRocketState = game.normalizeTeamRocketState(gameData.teamRocketState);
        } else {
            game.teamRocketState = gameData.teamRocketState || null;
        }

        if (gameData.stats) {
            game.stats = { ...game.stats, ...gameData.stats };
        }
        game.achievementsCompleted = gameData.achievementsCompleted || {};

        if (typeof narrativeManager !== 'undefined' && narrativeManager && typeof narrativeManager.loadSaveData === 'function') {
            if (gameData.narrative) {
                narrativeManager.loadSaveData(gameData.narrative);
            } else if (gameData.playerTeam && gameData.playerTeam.length > 0) {
                narrativeManager.loadSaveData({ introComplete: true, starterChoice: null, milestonesSeen: [] });
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
            window.currentZone = currentZone;
            const zoneSelect = document.getElementById('zoneSelect');
            if (zoneSelect) zoneSelect.value = currentZone;
            if (typeof updateZoneInfo === 'function') updateZoneInfo();
        }

        maxReachedZone = gameData.maxReachedZone || currentZone;
        window.maxReachedZone = maxReachedZone;

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
            const rawOfflineTime = Date.now() - gameData.lastSaveTime;
            const offlineTime = Math.max(0, Math.min(rawOfflineTime, OFFLINE_CAP_MS));
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

                // Déléguer toute la simulation hors-ligne (combats, butin, œufs) à la fonction unifiée
                if (game.catchupMissedCombats) {
                    setTimeout(() => game.catchupMissedCombats(offlineTime), 500);
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
        if (typeof toast !== 'undefined') toast.error('Erreur de chargement', 'La sauvegarde est corrompue ou incompatible. Chargement annulé.');
        return false;
    }
}

// ============================================================
// GESTION — Export / Import / Reset
// ============================================================

function exportSaveLogic(game) {
    const saveData = saveGameLogic(game);
    if (!saveData) {
        toast.error("Erreur", "Aucune donnée à exporter.");
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

    toast.success("Export Réussi", "Fichier de sauvegarde téléchargé !");
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
                const validationError = validateSaveData(parsedData);
                if (validationError) {
                    throw new Error(validationError);
                }
                localStorage.setItem(SAVE_KEY, content);
                toast.success("Import Réussi", "Le jeu va recharger...");
                setTimeout(() => location.reload(), 1000);
            } catch (err) {
                console.error("Erreur Import :", err);
                toast.error("Fichier Invalide", "Ce fichier n'est pas une sauvegarde compatible.");
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
