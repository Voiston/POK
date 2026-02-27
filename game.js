/**
 * @file game.js
 * Classe Game - Logique métier principale du jeu
 */

class Game {
    constructor() {
        this.playerTeam = [];
        this.storage = [];
        this.pension = [];
        this.playerMainStats = { hp: 0, attack: 0, spattack: 0, defense: 0, spdefense: 0, speed: 0 };
        this.playerTeamStats = { hp: 0, attack: 0, spattack: 0, defense: 0, spdefense: 0, speed: 0 };
        this.eggs = {
            [RARITY.COMMON]: 0,
            [RARITY.RARE]: 0,
            [RARITY.EPIC]: 0,
            [RARITY.LEGENDARY]: 0
        };
        this.shards = {};
        this.pokedollars = 0;
        this.talentRerolls = 0; // Cristaux de Réinitialisation (aléatoire)
        this.talentChoices = 0; // Orbes de Maîtrise (au choix)
        this.essenceDust = 0;
        this.pokedex = {};
        this.hasAutoCatcher = false; // Débloqué ou non
        this.autoCatcherSettings = {
            enabled: true,     // Auto-catch des cibles sélectionnées
            catchShiny: true   // Auto-catch des shinies / roamers
        };
        this.pokedexSortBy = 'id';   // Critère par défaut
        this.pokedexSortOrder = 'asc'; // Ordre par défaut
        this.pokedexSubTab = 'pokedex'; // 'pokedex' | 'collectionbonuses'
        this.collectionBonusTab = 'all'; // 'all' ou id de famille
        this.captureMode = 0; // 0 = OFF, 2 = TARGET
        this.captureTargets = null; // Nom du Pokémon ciblé
        this.zoneProgress = {};
        Object.keys(ZONES).forEach(zoneId => {
            this.zoneProgress[zoneId] = {
                pokemonTiers: {}, // (Anciennement enemyTiers)
                bossesDefeated: 0,
                epicsDefeated: 0
            };
        });
        this.quests = [];
        this.pendingRoamer = null;
        this.pauseOnRare = true; // Par défaut : On s'arrête (Sécurité)
        this.unlockedHeaderSkins = [(typeof HEADER_SKIN_DEFAULT_ID === 'string' && HEADER_SKIN_DEFAULT_ID) ? HEADER_SKIN_DEFAULT_ID : 'classic_lab'];
        this.selectedHeaderSkin = (typeof HEADER_SKIN_DEFAULT_ID === 'string' && HEADER_SKIN_DEFAULT_ID) ? HEADER_SKIN_DEFAULT_ID : 'classic_lab';
        this.headerSkinFadeColorCache = {};
        this.offlineSimMaxCombatsPerSecond = (GAME_SPEEDS && GAME_SPEEDS.OFFLINE_SIM_MAX_COMBATS_PER_SECOND) || 300;
        this.recyclerSortMode = 'rarity'; // Tri par défaut dans le recycleur
        this.recyclerSortDir = 'desc';    // 'desc' = les plus rares / plus nombreux d'abord
        this.achievements = {};
        this.tooltipTimer = null; // Stocke le timer
        this.TOOLTIP_DELAY = 200; // Délai en millisecondes (0.2s) - Modifiez ici !
        this.sessionStats = {
            combatsWon: 0,
            eggsOpenedThisRush: 0,
            lastEggOpenTime: 0,
            currentWinStreak: 0,
            perfectWinsStreak: 0,
            combatStartTime: 0,
            lastSpendTime: Date.now(),
            statusInflictedTypes: new Set()
        };
        this.questTokens = 0;
        this.questsCompleted = 0;
        this.nextQuestTimer = 0;
        this.lastQuestUpdate = Date.now();
        this.activeBoosts = [];
        this.permanentBoosts = { xp: 0, pensionSlots: 0 };
        this.activeExpeditions = []; // Stocke les missions en cours
        this.maxExpeditionSlots = 1;

        // ✅ NOUVEAU : Inventaire d'objets
        this.items = {};  // { item_key: quantity }

        // ✅ NOUVEAU : Vitamines actives (permanent)
        this.activeVitamins = {
            hp: 0,
            attack: 0,
            spattack: 0,
            defense: 0,
            spdefense: 0,
            speed: 0,
            all: 0
        };

        this.activeExpeditions = [];
        this.maxExpeditionSlots = 3;

        this.availableExpeditions = []; // ✅ Demandé : Stocke les missions générées
        this.maxAvailableExpeditions = 6; // ✅ Demandé : 6 en attente max
        this.expeditionTimer = 0; // Temps restant avant la prochaine
        this.EXPEDITION_GEN_TIME = 300000; // Temps de génération (ex: 5 minutes = 300000ms)

        // ✅ NOUVEAU : Boosts de stats actifs (temporaire)
        this.activeStatBoosts = [];  // [{ stat, value, endTime }, ...]

        // ✅ Propriétés pour le game loop optimisé
        this.lastDisplayUpdate = 0;
        this.gameLoopId = null;

        // ✅ Variables pour la Tour de Combat
        this.combatTickets = 100;
        this.marquesDuTriomphe = 0; // Notre nouvelle monnaie
        this.towerRecord = 0;
        this.towerState = {
            isActive: false,
            currentFloor: 0,
            currentEnemyIndex: 0,
            enemyTeam: []
        };

        this.isPensionCollapsed = false; // Par défaut, la pension est visible
        this.upgrades = {
            critMastery: { level: 0, baseCost: 300, costMultiplier: 1.6, name: "Maître Critique", description: "Augmente la chance de coup critique de l'équipe", effect: "+1% Chance par niveau", maxLevel: 10 },
            expBoost: { level: 0, baseCost: 150, costMultiplier: 1.6, name: "Boost d'Experience", description: "Augmente l'XP gagnee par l'equipe", effect: "+10% XP par niveau", maxLevel: 15 },
            eggDrop: { level: 0, baseCost: 200, costMultiplier: 1.7, name: "Chasseur d'Oeufs", description: "Augmente les chances de drop d'oeufs", effect: "+0.1% chance par niveau", maxLevel: 20 },
            staminaRegen: { level: 0, baseCost: 120, costMultiplier: 1.5, name: "Regeneration Rapide", description: "Augmente la vitesse de regeneration d'endurance", effect: "-0.2s par niveau", maxLevel: 12 },
            shardBonus: { level: 0, baseCost: 250, costMultiplier: 1.8, name: "Collecteur de Shards", description: "Chance d'obtenir des shards bonus", effect: "+2% chance par niveau", maxLevel: 10 },
            pension: { level: 0, baseCost: 500, costMultiplier: 2.5, name: "Pension Pokemon", description: "Debloque des emplacements pour des creatures qui contribuent aux stats", effect: "+1 slot et +1% transfert de stats par niveau", maxLevel: 20 },
            respawn: { level: 0, baseCost: 500, costMultiplier: 1.5, name: "Fast Respawn ", description: " Rédui le délai de réapparation des adversaires! ", effect: " - 50 ms par niveau", maxLevel: 15 },
            recycle: { level: 0, baseCost: 500, costMultiplier: 1.5, name: "Recycleur de balls ", description: " Obtiens la probabilité de conserver la ball lancée ! ", effect: " 2.5% par niveau", maxLevel: 10 },
            second_chance: { level: 0, baseCost: 500, costMultiplier: 1.5, name: "Seconde chance ", description: " Obtiens une chance de d'obtenir un deuxième lancé ! ", effect: " 1% par niveau", maxLevel: 25 },
            incubatorSlots: { level: 0, baseCost: 1500, costMultiplier: 2, name: "Slot d'incubateur", description: "Débloque un emplacement d'incubateur supplémentaire (max 4)", effect: "+1 incubateur", maxLevel: 3 },
            incubationSpeed: { level: 0, baseCost: 800, costMultiplier: 1.8, name: "Incubation rapide", description: "Réduit le temps d'incubation des œufs", effect: "-10% temps par niveau", maxLevel: 5 },
            prizeMoney: { level: 0, baseCost: 500, costMultiplier: 1.5, name: "The prize money", description: "Augmente le gain de pokedollars par combat", effect: "+1% gain pokkedollar par combat", maxLevel: 20 },
            shinyHunt: { level: 0, baseCost: 1000, costMultiplier: 1.5, name: "Chasse au shiny", description: "Augmente les chances d'obtenir un shiny", effect: "+5% chance par niveau", maxLevel: 20 },
            casinoRoyal: { level: 0, baseCost: 750, costMultiplier: 1.5, name: "Casino Royal", description: "Réduit le coût de lancer de la machine à sous", effect: "-5% coût par niveau", maxLevel: 10 },
        };

        // Incubateurs : tableau de 4 slots. Chaque slot : null ou { rarity, startTime, durationMs }
        this.incubators = [null, null, null, null];
        this.autoIncubation = this.createDefaultAutoIncubationState();
        this.offlineIncubationLastReport = null;

        // Temps offline "en attente" (cas : onglet quitté pendant une simulation déjà en cours)
        this.pendingOfflineTimeMs = 0;


        this.currentEnemy = null;
        this.currentPlayerCreature = null;
        this.activeCreatureIndex = 0;
        this.sortBy = 'none';
        this.sortOrder = 'desc';
        this.autoSelectEnabled = false;
        // Flags individuels pour les fonctionnalités auto
        this.autoSwitchDisadvantage = true;
        this.autoSwitchStamina = true;
        this.autoUltimate = true;
        this.badges = {};
        Object.keys(ACCOUNT_TALENTS).forEach(talentKey => {
            this.badges[talentKey] = false;
        });

        this.arenaState = {
            active: false, arenaId: null, championTeam: [], currentChampionIndex: 0, startTime: 0, maxDuration: null, playerKOCount: 0
        };
        this.recentCombatDurations = [];

        this.combatState = 'waiting';
        this.lastCombatTime = 0;
        this.combatStartTime = 0;

        // TEMPS D'ATTENTE ENTRE DEUX COMBATS (Respawn)
        // C'est le temps pour looter, sauvegarder, et trouver le prochain ennemi.
        // 1000ms est bien. Si vous le baissez trop (ex: 100ms), le jeu peut paraître épileptique.
        this.combatCooldown = 200;
        this.baseCombatCooldown = 200; // Sert de référence pour les upgrades (si vous gardez l'upgrade de réduction de temps d'attente)

        // TEMPS DE RÉCUPÉRATION (Game Over)
        // 4 secondes pour punir la défaite, c'est très bien. Ça donne du poids à la mort.
        this.deathCooldown = 4000;

        // ANIMATION DE DÉBUT ("Ready... Fight!")
        // 500ms est parfait. Assez pour voir le nom de l'ennemi, assez court pour ne pas frustrer en farming.
        this.combatStartDelay = 100;

        // ✅ LE PLUS IMPORTANT : LE MÉTRONOME (ATB)
        // C'est le délai minimum entre deux coups d'affilée.
        // 500ms = 2 attaques par seconde max visuellement.
        // C'est ce qui rend le combat "lisible" et empêche les bugs de calcul.
        this.combatTurnDelay = 250;;     // 250 entre chaque tour
        this.lastCombatTurnTime = 0;    // Timestamp du dernier tour

        this.enemiesByZone = {};
        this.lastStaminaRegen = 0;

        this.stats = {
            // --- COMBATS ---
            combatsWon: 0,          // (Anciennement totalWins)
            combatsLost: 0,
            bossDefeated: 0,        // (Anciennement bossKilled)
            epicDefeated: 0,        // (Anciennement epicKilled)
            totalDamageDealt: 0,
            totalDamageTaken: 0,

            // --- COLLECTION ---
            creaturesObtained: 0,
            shiniesObtained: 0,     // (Anciennement shiniesCaught)
            eggsOpened: 0,
            evolutionsCount: 0,

            // ✅ NOUVEAUX TRACKERS (Spécial Succès)
            perfectIvCount: 0,      // Nombre de 100% IV capturés
            perfectShinyCount: 0,   // Nombre de Shiny 100% IV capturés
            highestLevelReached: 0, // Niveau max atteint par un Pokémon

            // --- ÉCONOMIE & PROGRESSION ---
            totalPokedollarsEarned: 0, // (Anciennement totalGoldEarned)
            totalRocketBankInterestGained: 0, // Total intérêts générés par la banque Team Rocket
            rocketTrustLevelMax: 1,
            rocketLoanActiveRealtimeMs: 0,
            rocketLargeLoansRepaid: 0,
            rocketStakingTier8Reached: 0,
            rocketStakingRecoveredTier9Plus: 0,
            rocketStakingRecoveredHighRisk: 0,
            rocketStakingLegendaryStolen: 0,
            rocketCasinoSpins: 0,      // Spins à la machine Team Rocket (achievements + stats)
            prestigeCount: 0,          // (Anciennement prestigesDone)
            upgradesPurchased: 0,      // Pour "Investisseur Avisé"
            badgesEarned: 0,           // Pour "Collectionneur de Badges"

            // --- TOUR DE COMBAT ---
            towerFloorsClimbed: 0,

            // --- ÉTATS DYNAMIQUES (Mises à jour en temps réel) ---
            pensionCount: 0,           // Pour "Élevage Intensif" (Valeur actuelle)
            teamPower: 0,              // Pour "Équipe d'Élite" (Valeur actuelle)

            // --- SYSTÈME ---
            startTime: Date.now(),
            totalPlayTime: 0
        };

        this.teamRocketState = this.createDefaultTeamRocketState();
        this.refreshRocketContractsIfNeeded(true);
        this.rocketBankOptionsOpen = false;

        // 2. Progression des Succès (On garde ça séparé, c'est propre)
        this.achievementsProgress = {};

        // On initialise à 0 pour toutes les clés de base (les préfixes avant le underscore)
        // Ce n'est pas strictement obligatoire car le code gère le "undefined", mais c'est plus propre.

        // =========================================================

        this.tabHiddenTime = null;

        // GESTION DU RETOUR SUR L'ONGLET (Rattrapage du temps perdu)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.tabHiddenTime = Date.now();
                console.log("📴 Onglet caché.");
            } else {
                if (this.tabHiddenTime) {
                    const timeHidden = Date.now() - this.tabHiddenTime;
                    console.log("📱 Retour après:", (timeHidden / 1000).toFixed(1) + "s");

                    // Cas 1 : aucune simulation offline en cours -> comportement normal
                    if (!this.isOfflineSimulating) {
                        if (timeHidden > 1000) { // Si absence > 1 seconde

                            // 1. Rattrapage des Combats + tout le reste (stats passives, banque, prêt, staking, quêtes, boosts)
                            if (timeHidden > 5000) {
                                this.catchupMissedCombats(timeHidden);
                            } else {
                                // Absence courte (<5s) : pas de simu combats, mais on rattrape le reste
                                this.catchUpPassiveStats(timeHidden);
                                this.catchUpAllSystems(timeHidden);
                            }

                            // 2. Affichage à jour (expéditions déjà rattrapées dans catchUpAllSystems / catchupMissedCombats)
                            this.updateExpeditionsDisplay();
                        }
                    } else {
                        // Cas 2 : une simulation offline est DÉJÀ en cours
                        // -> on empile simplement ce temps pour le rattraper une fois la simu actuelle terminée
                        if (timeHidden > 1000) {
                            this.pendingOfflineTimeMs = (this.pendingOfflineTimeMs || 0) + timeHidden;
                            console.log("⏱️ Temps offline ajouté en attente:", (this.pendingOfflineTimeMs / 1000).toFixed(1), "s");
                        }
                    }

                    this.tabHiddenTime = null;
                }
            }
        });

        this.selectHeaderSkin(this.selectedHeaderSkin, { save: false, silent: true });
        this.initBalanceTelemetry();
        this.init();
    }


    // initUiCache -> logique déplacée vers uiManager.js (initUiCacheUI)
    initUiCache() {
        if (typeof initUiCacheUI === 'function') initUiCacheUI(this);
    }

    init() {
        // Cas 1 : Une sauvegarde existe
        this.initUiCache();
        if (this.loadGame()) {
            logMessage("Partie chargée !");

            // Lancement des systèmes
            this.setupEggHandler();
            this.lastTickTime = Date.now();
            this.updateZoneSelector();
            this.updateDisplay();
            this.startGameLoop();
            this.startAutoSave();
            this.runSanityCheck();
            this.resetBalanceTelemetrySession('loaded_save');

            // Sécurité : Si par hasard aucune quête n'est chargée, on en lance une
            if (this.quests.length === 0) {
                this.nextQuestTimer = 60000;
                this.generateQuest();
            }
            if (typeof ensureStoryQuestProgress === 'function') ensureStoryQuestProgress(this);

        } else {
            // Cas 2 : Nouvelle partie — Professor Chen narrative (intro + fake/real starter)
            if (typeof narrativeManager !== 'undefined' && narrativeManager.startIntro) {
                logMessage("Bienvenue dans le monde des Pokémon Incrémentaux !");
                narrativeManager.startIntro(this);
            } else {
                logMessage("Bienvenue ! Veuillez choisir votre starter.");
                this.showConceptModal();
            }
        }
    }

    // ---------------------------------------------------------
    // BALANCE TELEMETRY (auto metrics + export)
    // ---------------------------------------------------------
    initBalanceTelemetry() {
        this.balanceTelemetry = {
            enabled: true,
            sessionStartedAt: Date.now(),
            samples: [],
            events: [],
            maxSamples: 7200, // ~2h at 1 sample/sec
            maxEvents: 5000,
            lastSnapshot: null
        };
        this.resetBalanceTelemetrySession('auto');
    }

    resetBalanceTelemetrySession(label = 'manual') {
        if (!this.balanceTelemetry) this.initBalanceTelemetry();
        this.balanceTelemetry.sessionStartedAt = Date.now();
        this.balanceTelemetry.samples = [];
        this.balanceTelemetry.events = [];
        this.balanceTelemetry.lastSnapshot = this.buildBalanceSnapshot();
        this.balanceTelemetry.samples.push({
            t: Date.now(),
            ...this.balanceTelemetry.lastSnapshot,
            tokenDelta: 0
        });
        this.trackBalanceEvent('session_reset', { label });
    }

    buildBalanceSnapshot() {
        const stats = this.stats || {};
        const won = Number(stats.combatsWon) || 0;
        const lost = Number(stats.combatsLost) || 0;
        return {
            zone: (typeof currentZone !== 'undefined' ? Number(currentZone) : 1) || 1,
            combatsWon: won,
            combatsLost: lost,
            combatsTotal: won + lost,
            totalPokedollarsEarned: Number(stats.totalPokedollarsEarned) || 0,
            questTokens: Number(this.questTokens) || 0,
            questsCompleted: Number(this.questsCompleted) || 0,
            pokedollars: Number(this.pokedollars) || 0
        };
    }

    updateBalanceTelemetryTick() {
        const tel = this.balanceTelemetry;
        if (!tel || !tel.enabled) return;
        const now = Date.now();
        const snapshot = this.buildBalanceSnapshot();
        const prev = tel.lastSnapshot || snapshot;
        const tokenDelta = snapshot.questTokens - prev.questTokens;

        tel.samples.push({
            t: now,
            ...snapshot,
            tokenDelta
        });

        if (tel.samples.length > tel.maxSamples) {
            tel.samples.splice(0, tel.samples.length - tel.maxSamples);
        }

        tel.lastSnapshot = snapshot;
    }

    trackBalanceEvent(type, payload = {}) {
        const tel = this.balanceTelemetry;
        if (!tel || !tel.enabled) return;
        tel.events.push({
            t: Date.now(),
            type,
            ...payload
        });
        if (tel.events.length > tel.maxEvents) {
            tel.events.splice(0, tel.events.length - tel.maxEvents);
        }
    }

    countBalanceEvents(type, sinceTs) {
        const tel = this.balanceTelemetry;
        if (!tel) return 0;
        return tel.events.filter(e => e.type === type && e.t >= sinceTs).length;
    }

    buildBalanceReport(windowMinutes = 30) {
        const tel = this.balanceTelemetry;
        if (!tel || !tel.samples || tel.samples.length === 0) return null;

        const now = Date.now();
        const windowMs = Math.max(1, Number(windowMinutes) || 30) * 60 * 1000;
        const sinceTs = now - windowMs;
        const samples = tel.samples.filter(s => s.t >= sinceTs);
        const useSamples = samples.length >= 2 ? samples : tel.samples;
        if (useSamples.length < 2) return null;

        const first = useSamples[0];
        const last = useSamples[useSamples.length - 1];
        const durationMs = Math.max(1000, last.t - first.t);
        const durationMin = durationMs / 60000;

        const wins = Math.max(0, last.combatsWon - first.combatsWon);
        const losses = Math.max(0, last.combatsLost - first.combatsLost);
        const combats = wins + losses;
        const cpm = combats / durationMin;
        const winRate = combats > 0 ? (wins / combats) * 100 : 0;

        const moneyEarned = Math.max(0, last.totalPokedollarsEarned - first.totalPokedollarsEarned);
        const moneyPerMin = moneyEarned / durationMin;

        let tokensGained = 0;
        let tokensSpent = 0;
        useSamples.forEach((s, idx) => {
            if (idx === 0) return;
            if (s.tokenDelta > 0) tokensGained += s.tokenDelta;
            else tokensSpent += Math.abs(s.tokenDelta);
        });
        const tokenNet = Math.max(0, last.questTokens - first.questTokens);

        const questsCompleted = Math.max(0, last.questsCompleted - first.questsCompleted);

        return {
            generatedAt: new Date(now).toISOString(),
            windowMinutes: Number(windowMinutes) || 30,
            durationMin: Number(durationMin.toFixed(2)),
            zoneReached: last.zone,
            combats: {
                total: combats,
                wins,
                losses,
                cpm: Number(cpm.toFixed(2)),
                winRatePct: Number(winRate.toFixed(2))
            },
            economy: {
                moneyEarned,
                moneyPerMin: Number(moneyPerMin.toFixed(2)),
                tokensGained,
                tokensSpent,
                tokenNet
            },
            quests: {
                generated: this.countBalanceEvents('quest_generated', sinceTs),
                accepted: this.countBalanceEvents('quest_accepted', sinceTs),
                refused: this.countBalanceEvents('quest_refused', sinceTs),
                abandoned: this.countBalanceEvents('quest_abandoned', sinceTs),
                claimed: this.countBalanceEvents('quest_claimed', sinceTs),
                completed: questsCompleted
            },
            expeditions: {
                launched: this.countBalanceEvents('expedition_launched', sinceTs),
                claimed: this.countBalanceEvents('expedition_claimed', sinceTs)
            }
        };
    }

    formatBalanceReportMarkdown(windowMinutes = 30) {
        const report = this.buildBalanceReport(windowMinutes);
        if (!report) return '# Balance Report\n\nNo data yet.';

        return [
            '# Balance Auto Report',
            '',
            `Generated: ${report.generatedAt}`,
            `Window: ${report.windowMinutes} min`,
            '',
            '## Core',
            '',
            '| KPI | Current |',
            '| --- | --- |',
            `| Zone reached | ${report.zoneReached} |`,
            `| Combats per minute | ${report.combats.cpm} |`,
            `| Win rate | ${report.combats.winRatePct}% |`,
            '',
            '## Economy',
            '',
            '| KPI | Current |',
            '| --- | --- |',
            `| Money earned | ${report.economy.moneyEarned} |`,
            `| Money per minute | ${report.economy.moneyPerMin} |`,
            `| Tokens gained | ${report.economy.tokensGained} |`,
            `| Tokens spent | ${report.economy.tokensSpent} |`,
            `| Tokens net | ${report.economy.tokenNet} |`,
            '',
            '## Quests',
            '',
            '| KPI | Current |',
            '| --- | --- |',
            `| Generated | ${report.quests.generated} |`,
            `| Accepted | ${report.quests.accepted} |`,
            `| Refused | ${report.quests.refused} |`,
            `| Abandoned | ${report.quests.abandoned} |`,
            `| Claimed | ${report.quests.claimed} |`,
            `| Completed | ${report.quests.completed} |`,
            '',
            '## Expeditions',
            '',
            '| KPI | Current |',
            '| --- | --- |',
            `| Launched | ${report.expeditions.launched} |`,
            `| Claimed | ${report.expeditions.claimed} |`,
            ''
        ].join('\n');
    }

    exportBalanceReport(windowMinutes = 30, format = 'json') {
        const fmt = (format || 'json').toLowerCase();
        const data = fmt === 'md'
            ? this.formatBalanceReportMarkdown(windowMinutes)
            : JSON.stringify(this.buildBalanceReport(windowMinutes), null, 2);
        const mime = fmt === 'md' ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8';
        const ext = fmt === 'md' ? 'md' : 'json';
        const blob = new Blob([data], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balance-report-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof toast !== 'undefined') toast.success('Balance', `Rapport exporté (${ext}).`);
    }

    // SÉCURITÉ : Vérifie l'intégrité de la base de données (Compatible Zones Complexes)
    runSanityCheck() {
        console.groupCollapsed("🔍 Diagnostic des Données");
        let errors = 0;

        // 1. Vérifier les Zones
        for (const [zoneId, zone] of Object.entries(ZONES)) {

            // ✅ FIX : On utilise le helper pour aplatir la zone avant de la scanner
            const enemies = this.getAllPokemonInZone(zoneId);

            if (!enemies || enemies.length === 0) {
                console.error(`Zone ${zoneId} (${zone.name}) est vide ou mal configurée !`);
                errors++;
                continue;
            }

            enemies.forEach(name => {
                if (!POKEMON_BASE_STATS[name]) {
                    console.warn(`⚠️ MISSING STATS : ${name} (Zone ${zoneId})`);
                    errors++;
                }
                // Si tu utilises des sprites
                if (typeof POKEMON_SPRITE_IDS !== 'undefined' && !POKEMON_SPRITE_IDS[name]) {
                    console.warn(`⚠️ MISSING SPRITE ID : ${name}`);
                }
            });
        }

        // 2. Vérifier les Évolutions
        if (typeof EVOLUTIONS !== 'undefined') {
            for (const [base, evoData] of Object.entries(EVOLUTIONS)) {
                if (!POKEMON_BASE_STATS[base]) {
                    console.warn(`⚠️ Évolution orpheline : ${base} n'a pas de stats.`);
                }
                const targets = [];
                if (evoData.evolves_to) targets.push(evoData.evolves_to);
                if (Array.isArray(evoData.options)) {
                    evoData.options.forEach((opt) => {
                        if (opt && opt.evolves_to) targets.push(opt.evolves_to);
                    });
                }
                targets.forEach((targetName) => {
                    if (!POKEMON_BASE_STATS[targetName]) {
                        console.error(`⛔ Évolution brisée : ${base} -> ${targetName} (Cible inexistante)`);
                        errors++;
                    }
                });
            }
        }

        if (errors === 0) {
            console.log("✅ Toutes les données semblent intègres.");
        } else {
            console.log(`❌ ${errors} erreurs trouvées. Vérifiez constants.js et pokemonStats.js`);
        }
        console.groupEnd();
    }


    showConceptModal() {
        const modal = document.getElementById('gameConceptModal');
        if (modal) modal.classList.add('show');
    }
    closeConceptModal() {
        const modal = document.getElementById('gameConceptModal');
        if (modal) modal.classList.remove('show');
        this.showStarterSelection();
    }
    showStarterSelection() {
        const modal = document.getElementById('starterModal');
        if (modal) modal.classList.add('show');
    }
    showQuestGuide(questId) {
        if (typeof STORY_QUEST_GUIDES === 'undefined') return;
        const guide = STORY_QUEST_GUIDES[questId];
        if (!guide) return;
        const titleEl = document.getElementById('questGuideTitle');
        const bodyEl = document.getElementById('questGuideBody');
        const modal = document.getElementById('questGuideModal');
        if (!titleEl || !bodyEl || !modal) return;
        titleEl.textContent = guide.title || '📋 Guide';
        let html = '';
        if (guide.steps && guide.steps.length) {
            html += '<ol style="margin:0; padding-left:20px;">';
            guide.steps.forEach(s => { html += '<li>' + s + '</li>'; });
            html += '</ol>';
        }
        if (guide.where) {
            html += '<div class="where"><strong>Où cliquer :</strong> ' + guide.where + '</div>';
        }
        bodyEl.innerHTML = html || '<p>Aucun détail pour cette quête.</p>';
        modal.classList.add('show');
    }
    closeQuestGuide() {
        const modal = document.getElementById('questGuideModal');
        if (modal) modal.classList.remove('show');
    }
    selectStarter(type) {
        let name, creatureType;

        // Définition du Pokémon selon le choix
        switch (type) {
            case 'grass':
                name = 'Bulbasaur';
                creatureType = TYPES.GRASS;
                break;
            case 'fire':
                name = 'Charmander';
                creatureType = TYPES.FIRE;
                break;
            case 'water':
                name = 'Squirtle';
                creatureType = TYPES.WATER;
                break;
            default:
                return;
        }

        // 1. Création du Starter (IVs parfaits pour bien commencer)
        const starter = new Creature(name, creatureType, 5, RARITY.EPIC, false);
        starter.ivHP = 1;
        starter.ivAttack = 1;
        starter.ivDefense = 1;
        starter.ivSpeed = 1;
        starter.recalculateStats();
        starter.heal();

        this.playerTeam.push(starter);

        // 2. Ressources de départ (remplace vos anciennes valeurs de test 200/100/100)
        // On donne un kit de démarrage équilibré
        this.pokedollars = 500;
        this.eggs[RARITY.COMMON] = 10;
        this.items['pokeball'] = 5;

        logMessage(`✨ Vous avez choisi ${name} comme partenaire !`);
        toast.success("Aventure Commencée !", `${name} rejoint votre équipe !`);

        // 3. Fermer le modal
        const modal = document.getElementById('starterModal');
        if (modal) {
            modal.classList.remove('show');
        }

        // 4. LANCEMENT DU MOTEUR DE JEU (C'est ici qu'on met ce qui était dans votre init)
        this.setupEggHandler();
        this.lastTickTime = Date.now();
        this.updateZoneSelector();
        this.updateDisplay();
        this.startGameLoop();
        this.resetBalanceTelemetrySession('manual_starter_start');

        // 5. Initialisation des Quêtes pour le nouveau joueur
        this.nextQuestTimer = 60000; // Première quête dans 1 minute
        this.generateQuest();

        // 6. Lancer l'auto-sauvegarde et sauvegarder immédiatement
        this.startAutoSave();
        this.saveGame();
    }

    // ✅ REMPLACEZ votre fonction initAchievements par celle-ci
    initAchievements() {
        // ✅ CORRECTION : S'assurer que this.achievements est un objet
        if (!this.achievements || typeof this.achievements !== 'object') {
            this.achievements = {};
        }

        // Si chargé depuis la sauvegarde...
        if (Object.keys(this.achievements).length > 0) {
            for (const key in ACHIEVEMENTS) {
                if (!this.achievements[key]) {
                    this.achievements[key] = {
                        current: 0,
                        completed: false,
                        claimed: false
                    };
                }
            }
        } else {
            // Démarrage frais
            for (const key in ACHIEVEMENTS) {
                this.achievements[key] = {
                    current: 0,
                    completed: false,
                    claimed: false
                };
            }
        }
    }

    useItem(itemKey, quantity = 1, event = null) {
        const item = ALL_ITEMS[itemKey];
        if (!item) return false;
        if (this.isRocketStakingItemLocked(itemKey)) {
            logMessage("❌ Cet objet est immobilisé en staking Team Rocket.");
            return false;
        }

        let amountToUse = quantity;

        // Gestion du Ctrl + Clic (Tout utiliser) pour les vitamines uniquement
        if (event && (event.ctrlKey || event.metaKey) && item.effect && item.effect.duration === null) {
            amountToUse = this.items[itemKey];
        }

        // Vérification stock
        if (!this.items[itemKey] || this.items[itemKey] < amountToUse) {
            logMessage(`❌ Pas assez d'objets !`);
            return false;
        }

        // Si l'objet est une pierre d'évolution, on indique au joueur de l'utiliser via l'équipe
        const isEvolutionItem = Object.values(EVOLUTIONS).some((evo) => {
            if (!evo) return false;
            if (this.resolveEvolutionConditionItem(evo.condition) === itemKey) return true;
            if (Array.isArray(evo.options)) {
                return evo.options.some((opt) => this.resolveEvolutionConditionItem(opt && opt.conditionItem) === itemKey);
            }
            return false;
        });
        if (isEvolutionItem) {
            toast.info("Objet d'Évolution", "Utilisez cet objet directement depuis le menu d'un Pokémon compatible dans votre Équipe ou Stockage.");
            return false;
        }

        // 1. Consommer
        this.items[itemKey] -= amountToUse;

        // Nettoyer si vide
        if (this.items[itemKey] <= 0) {
            delete this.items[itemKey];
        }

        // 2. Appliquer l'effet
        if (item.effect && item.effect.type === 'timeDust') {
            const hoursPerUse = Number(item.effect.hours) || 0;
            this.applyTimeDust(hoursPerUse, amountToUse, item);
        } else if (item.effect.duration === null) {
            // ✅ VITAMINE (Permanent) : On envoie la quantité totale ici
            this.applyVitamin(item, amountToUse);
        } else {
            // ✅ BOOST (Temporaire) : réutilisation = temps ajouté, pas bonus cumulé
            for (let i = 0; i < amountToUse; i++) {
                this.applyStatBoost(itemKey, item);
            }
        }

        this.updateItemsDisplay();
        this.updatePlayerStatsDisplay();
        return true;
    }

    getPassiveStatGainPerSecond() {
        this.calculateTeamStats();
        const pensionStats = this.calculatePensionStats();

        const hpBonus = 1 + this.getAccountTalentBonus('hp_mult');
        const baseContribution = 0.10;
        const towerBonus = this.permanentBoosts.team_contribution || 0;
        const teamContributionRate = baseContribution + towerBonus;

        const vitaminBonus = {
            hp: 1 + (this.activeVitamins.hp || 0) + (this.activeVitamins.all || 0),
            attack: 1 + (this.activeVitamins.attack || 0) + (this.activeVitamins.all || 0),
            spattack: 1 + (this.activeVitamins.spattack || 0) + (this.activeVitamins.all || 0),
            defense: 1 + (this.activeVitamins.defense || 0) + (this.activeVitamins.all || 0),
            spdefense: 1 + (this.activeVitamins.spdefense || 0) + (this.activeVitamins.all || 0),
            speed: 1 + (this.activeVitamins.speed || 0) + (this.activeVitamins.all || 0)
        };

        return {
            hp: Math.floor(this.playerTeamStats.hp * teamContributionRate * hpBonus * vitaminBonus.hp) + Math.floor(pensionStats.hp * hpBonus * vitaminBonus.hp),
            attack: Math.floor(this.playerTeamStats.attack * teamContributionRate * vitaminBonus.attack) + Math.floor(pensionStats.attack * vitaminBonus.attack),
            spattack: Math.floor(this.playerTeamStats.spattack * teamContributionRate * vitaminBonus.spattack) + Math.floor(pensionStats.spattack * vitaminBonus.spattack),
            defense: Math.floor(this.playerTeamStats.defense * teamContributionRate * vitaminBonus.defense) + Math.floor(pensionStats.defense * vitaminBonus.defense),
            spdefense: Math.floor(this.playerTeamStats.spdefense * teamContributionRate * vitaminBonus.spdefense) + Math.floor(pensionStats.spdefense * vitaminBonus.spdefense),
            speed: Math.floor(this.playerTeamStats.speed * teamContributionRate * vitaminBonus.speed) + Math.floor(pensionStats.speed * vitaminBonus.speed)
        };
    }

    applyTimeDust(hours, quantity = 1, itemDef = null) {
        const safeHours = Number(hours) || 0;
        const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
        const totalSeconds = Math.floor(safeHours * 3600 * safeQty);
        if (totalSeconds <= 0) return;

        const perSecondGain = this.getPassiveStatGainPerSecond();
        this.playerMainStats.hp += perSecondGain.hp * totalSeconds;
        this.playerMainStats.attack += perSecondGain.attack * totalSeconds;
        this.playerMainStats.spattack += perSecondGain.spattack * totalSeconds;
        this.playerMainStats.defense += perSecondGain.defense * totalSeconds;
        this.playerMainStats.spdefense += perSecondGain.spdefense * totalSeconds;
        this.playerMainStats.speed += perSecondGain.speed * totalSeconds;

        const fmt = (v) => (typeof formatNumber === 'function' ? formatNumber(v) : v);
        const itemName = (itemDef && itemDef.name) ? itemDef.name : 'Time Dust';
        logMessage(`⏳ ${safeQty}x ${itemName} utilisé : +${safeHours * safeQty}h de gains passifs appliqués instantanément !`);
        logMessage(`📈 Gains Time Dust — HP +${fmt(perSecondGain.hp * totalSeconds)}, ATK +${fmt(perSecondGain.attack * totalSeconds)}, ATK SP +${fmt(perSecondGain.spattack * totalSeconds)}, DEF +${fmt(perSecondGain.defense * totalSeconds)}, DEF SP +${fmt(perSecondGain.spdefense * totalSeconds)}, SPD +${fmt(perSecondGain.speed * totalSeconds)}`);
    }

    hasCreatureInCollection(name, type) {
        // Vérifier dans l'équipe
        if (this.playerTeam.some(c => c.name === name && c.type === type)) {
            return true;
        }

        // Vérifier dans le stockage
        if (this.storage.some(c => c.name === name && c.type === type)) {
            return true;
        }

        // Vérifier dans la pension
        if (this.pension.some(c => c.name === name && c.type === type)) {
            return true;
        }

        return false;
    }

    // updateTextContent, updateTransformScaleX -> déplacés vers uiManager.js ; wrappers pour compatibilité
    updateTextContent(element, text) {
        if (typeof updateTextContentUI === 'function') updateTextContentUI(element, text);
    }
    updateTransformScaleX(element, ratio) {
        if (typeof updateTransformScaleXUI === 'function') updateTransformScaleXUI(element, ratio);
    }

    applyVitamin(item, quantity = 1) {
        const effect = item.effect;

        // ✅ C'EST ICI LA CORRECTION : On multiplie par la quantité
        const totalBonus = effect.value * quantity;

        // S'assurer que l'objet activeVitamins existe
        if (!this.activeVitamins) {
            this.activeVitamins = { hp: 0, attack: 0, defense: 0, speed: 0, all: 0 };
        }

        if (effect.stat === 'all') {
            this.activeVitamins.all = (this.activeVitamins.all || 0) + totalBonus;
            logMessage(`✅ ${quantity}x ${item.name} utilisés ! +${(totalBonus * 100).toFixed(0)}% Stats (Perm.)`);
        } else {
            this.activeVitamins[effect.stat] = (this.activeVitamins[effect.stat] || 0) + totalBonus;
            const statLabels = { hp: 'PV', attack: 'Attaque', defense: 'Défense', speed: 'Vitesse', spattack: 'Att. Spé.', spdefense: 'Déf. Spé.' };
            const statLabel = statLabels[effect.stat] || effect.stat;
            logMessage(`✅ ${quantity}x ${item.name} utilisés ! +${(totalBonus * 100).toFixed(0)}% ${statLabel} (Perm.)`);
        }

        // Recalculer et Sauvegarder immédiatement
        this.incrementPlayerStats();
        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('vitaminUsed');
        this.saveGame();
    }

    // ========================================
    // ✅ ÉTAPE 5 : Appliquer les boosts temporaires
    // ========================================

    applyStatBoost(itemKey, item) {
        const effect = item.effect;
        const now = Date.now();
        const newEndTime = now + effect.duration;
        let didAddOrReplace = false;

        if (effect.stat === 'all') {
            const existingAll = this.activeStatBoosts.find(b => b.stat === 'all');
            if (existingAll) {
                if (existingAll.itemId === itemKey) {
                    existingAll.endTime += effect.duration;
                    const minutes = Math.floor(effect.duration / 60000);
                    logMessage(`✅ ${item.icon} ${item.name} : +${minutes} min (temps ajouté).`);
                } else {
                    this.activeStatBoosts = this.activeStatBoosts.filter(b => b.stat !== 'all');
                    this.activeStatBoosts.push({
                        stat: 'all',
                        value: effect.value,
                        endTime: newEndTime,
                        itemId: itemKey
                    });
                    didAddOrReplace = true;
                    const minutes = Math.floor(effect.duration / 60000);
                    logMessage(`✅ ${item.icon} ${item.name} utilisé ! +${(effect.value * 100).toFixed(0)}% à toutes les stats pendant ${minutes} min (remplace l'autre potion globale).`);
                }
            } else {
                this.activeStatBoosts.push({
                    stat: 'all',
                    value: effect.value,
                    endTime: newEndTime,
                    itemId: itemKey
                });
                didAddOrReplace = true;
                const minutes = Math.floor(effect.duration / 60000);
                logMessage(`✅ ${item.icon} ${item.name} utilisé ! +${(effect.value * 100).toFixed(0)}% à toutes les stats pendant ${minutes} min.`);
            }
        } else {
            const existing = this.activeStatBoosts.find(b => b.stat === effect.stat);
            if (existing) {
                existing.endTime += effect.duration;
                const minutes = Math.floor(effect.duration / 60000);
                const statLabels = { attack: 'Attaque', defense: 'Défense', spattack: 'Att. Spé.', spdefense: 'Déf. Spé.', speed: 'Vitesse', hp: 'PV' };
                const statLabel = statLabels[effect.stat] || effect.stat;
                logMessage(`✅ ${item.icon} ${item.name} : +${minutes} min pour ${statLabel} (temps ajouté).`);
            } else {
                this.activeStatBoosts.push({
                    stat: effect.stat,
                    value: effect.value,
                    endTime: newEndTime
                });
                didAddOrReplace = true;
                const minutes = Math.floor(effect.duration / 60000);
                const statLabels = { attack: 'Attaque', defense: 'Défense', spattack: 'Att. Spé.', spdefense: 'Déf. Spé.', speed: 'Vitesse', hp: 'PV' };
                const statLabel = statLabels[effect.stat] || effect.stat;
                logMessage(`✅ ${item.icon} ${item.name} utilisé ! +${(effect.value * 100).toFixed(0)}% ${statLabel} pendant ${minutes} min.`);
            }
        }

        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('statBoostUsed');

        if (didAddOrReplace && (effect.stat === 'hp' || effect.stat === 'all') && this.currentPlayerCreature && this.playerMainStats && this.playerMainStats.hp > 0) {
            const newMaxHp = this.getPlayerMaxHp();
            const oldMaxHp = this.currentPlayerCreature.mainAccountCurrentHp != null ? this.currentPlayerCreature.mainAccountCurrentHp : this.playerMainStats.hp;
            const hpRatio = oldMaxHp / this.playerMainStats.hp;
            this.currentPlayerCreature.mainAccountCurrentHp = Math.floor(newMaxHp * hpRatio);
            logMessage(`💚 PV max : ${formatNumber(this.currentPlayerCreature.mainAccountCurrentHp)} / ${formatNumber(newMaxHp)}`);
        }

        this.updateStatBoostsDisplay();
    }


    getPlayerMaxHp() {
        const hpBonus = 1 + this.getAccountTalentBonus('hp_mult');
        const hpBoost = 1 + this.getStatBoostMultiplier('hp');
        const synergies = this.getActiveSynergies();
        const synergyMaxHpMult = synergies.max_hp_mult || 1;

        let total = Math.floor(this.playerMainStats.hp * hpBonus * hpBoost * synergyMaxHpMult);

        // ✅ AJOUT : Relique de Tour (Cœur de Golem)
        if (this.towerState.isActive && this.towerState.buffs && this.towerState.buffs.max_hp_mult) {
            total = Math.floor(total * this.towerState.buffs.max_hp_mult);
        }
        // Bonus de collection (Water Starters → max_hp_mult 1% par prestige)
        const collHpMult = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).max_hp_mult || 0;
        total = Math.floor(total * (1 + collHpMult));

        return total;
    }

    createDefaultAutoIncubationState() {
        const defaultPriority = Array.isArray(AUTO_INCUBATION_DEFAULT_PRIORITY) && AUTO_INCUBATION_DEFAULT_PRIORITY.length
            ? [...AUTO_INCUBATION_DEFAULT_PRIORITY]
            : [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.COMMON];
        return {
            unlockedAutoSlots: 0,
            slotSettings: [0, 1, 2, 3].map(() => ({
                enabled: false,
                priorityOrder: [...defaultPriority],
                autoCollectOnlyWhenReady: true
            }))
        };
    }

    normalizePriorityOrder(priorityOrder) {
        const allowed = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.COMMON];
        const next = [];
        if (Array.isArray(priorityOrder)) {
            priorityOrder.forEach(r => {
                if (allowed.includes(r) && !next.includes(r)) next.push(r);
            });
        }
        allowed.forEach(r => {
            if (!next.includes(r)) next.push(r);
        });
        return next;
    }

    normalizeAutoIncubationState(rawState) {
        const defaults = this.createDefaultAutoIncubationState();
        const normalized = {
            unlockedAutoSlots: Math.max(0, Math.min(4, Number(rawState && rawState.unlockedAutoSlots) || 0)),
            slotSettings: []
        };
        for (let i = 0; i < 4; i++) {
            const rawSlot = rawState && Array.isArray(rawState.slotSettings) ? rawState.slotSettings[i] : null;
            const base = defaults.slotSettings[i];
            normalized.slotSettings.push({
                enabled: !!(rawSlot && rawSlot.enabled),
                priorityOrder: this.normalizePriorityOrder(rawSlot && rawSlot.priorityOrder ? rawSlot.priorityOrder : base.priorityOrder),
                autoCollectOnlyWhenReady: rawSlot && rawSlot.autoCollectOnlyWhenReady !== undefined
                    ? !!rawSlot.autoCollectOnlyWhenReady
                    : true
            });
        }
        return normalized;
    }

    createDefaultTeamRocketState() {
        return {
            rj: 0,
            trustLevel: 1,
            trustXp: 0,
            questProgress: {
                captures: 0,
                interestsGenerated: 0,
                stakingCompleted: 0,
                teamRocketQuestsCompleted: 0
            },
            bank: {
                balance: 0,
                accruedUnclaimed: 0,
                totalInterestGenerated: 0,
                interestDisplayOffset: 0,
                depositLockedUntil: 0,
                lastInterestTickAt: Date.now(),
                interestCarry: 0,
                autoInjectCombatHalf: false,
                autoInjectInterests: false
            },
            loan: {
                active: false,
                principal: 0,
                taxRate: 0,
                totalDebt: 0,
                remainingDebt: 0,
                repaidTotal: 0,
                withholdingRate: 0.5,
                startedAt: 0,
                lastRealtimeTickAt: 0
            },
            staking: {
                activeSession: null,
                completedSessions: 0,
                stolenSessions: 0,
                offeredItemKeys: [],
                nextOfferRotateAt: 0,
                lastStealFeedback: null
            },
            casino: {
                stats: {
                    spins: 0,
                    rjSpent: 0,
                    rjWon: 0,
                    jackpots: 0
                },
                history: []
            }
        };
    }

    normalizeTeamRocketState(rawState) {
        const defaults = this.createDefaultTeamRocketState();
        const safe = (rawState && typeof rawState === 'object') ? rawState : {};
        const bank = (safe.bank && typeof safe.bank === 'object') ? safe.bank : {};
        const loan = (safe.loan && typeof safe.loan === 'object') ? safe.loan : {};
        const staking = (safe.staking && typeof safe.staking === 'object') ? safe.staking : {};
        const questProgress = (safe.questProgress && typeof safe.questProgress === 'object') ? safe.questProgress : {};
        const casino = (safe.casino && typeof safe.casino === 'object') ? safe.casino : {};
        const casinoStats = (casino.stats && typeof casino.stats === 'object') ? casino.stats : {};

        const normalized = {
            rj: Math.max(0, Number(safe.rj) || 0),
            trustLevel: Math.max(1, Number(safe.trustLevel) || 1),
            trustXp: Math.max(0, Number(safe.trustXp) || 0),
            questProgress: {
                captures: Math.max(0, Number(questProgress.captures) || 0),
                interestsGenerated: Math.max(0, Number(questProgress.interestsGenerated) || 0),
                stakingCompleted: Math.max(0, Number(questProgress.stakingCompleted) || 0),
                teamRocketQuestsCompleted: Math.max(0, Number(questProgress.teamRocketQuestsCompleted) || 0)
            },
            bank: {
                balance: Math.max(0, Number(bank.balance) || 0),
                accruedUnclaimed: Math.max(0, Number(bank.accruedUnclaimed) || 0),
                totalInterestGenerated: Math.max(0, Number(bank.totalInterestGenerated) || 0),
                interestDisplayOffset: Math.max(0, Number(bank.interestDisplayOffset) || 0),
                depositLockedUntil: Math.max(0, Number(bank.depositLockedUntil) || 0),
                lastInterestTickAt: Math.max(0, Number(bank.lastInterestTickAt) || Date.now()),
                interestCarry: Math.max(0, Number(bank.interestCarry) || 0),
                autoInjectCombatHalf: (bank.autoInjectCombatHalf !== undefined)
                    ? !!bank.autoInjectCombatHalf
                    : !!bank.autoInjectCombatGains,
                autoInjectInterests: (bank.autoInjectInterests !== undefined)
                    ? !!bank.autoInjectInterests
                    : !!bank.autoInjectCombatGains
            },
            loan: {
                active: !!loan.active,
                principal: Math.max(0, Number(loan.principal) || 0),
                taxRate: Number.isFinite(Number(loan.taxRate)) ? Number(loan.taxRate) : defaults.loan.taxRate,
                totalDebt: Math.max(0, Number(loan.totalDebt) || 0),
                remainingDebt: Math.max(0, Number(loan.remainingDebt) || 0),
                repaidTotal: Math.max(0, Number(loan.repaidTotal) || 0),
                withholdingRate: Number.isFinite(Number(loan.withholdingRate)) ? Number(loan.withholdingRate) : defaults.loan.withholdingRate,
                startedAt: Math.max(0, Number(loan.startedAt) || 0),
                lastRealtimeTickAt: Math.max(0, Number(loan.lastRealtimeTickAt) || Date.now())
            },
            staking: {
                activeSession: this.normalizeRocketStakingSession(staking.activeSession),
                completedSessions: Math.max(0, Number(staking.completedSessions ?? staking.completedContracts) || 0),
                stolenSessions: Math.max(0, Number(staking.stolenSessions) || 0),
                offeredItemKeys: Array.isArray(staking.offeredItemKeys) ? staking.offeredItemKeys.map(v => String(v || '').trim()).filter(Boolean) : [],
                nextOfferRotateAt: Math.max(0, Number(staking.nextOfferRotateAt) || 0),
                lastStealFeedback: (staking.lastStealFeedback && typeof staking.lastStealFeedback === 'object')
                    ? {
                        at: Math.max(0, Number(staking.lastStealFeedback.at) || 0),
                        itemName: String(staking.lastStealFeedback.itemName || ''),
                        lostRJ: Math.max(0, Number(staking.lastStealFeedback.lostRJ) || 0),
                        riskPercent: Math.max(0, Math.min(100, Number(staking.lastStealFeedback.riskPercent) || 0)),
                        tier: Math.max(1, Number(staking.lastStealFeedback.tier) || 1)
                    }
                    : null
            },
            casino: {
                stats: {
                    spins: Math.max(0, Number(casinoStats.spins) || 0),
                    rjSpent: Math.max(0, Number(casinoStats.rjSpent) || 0),
                    rjWon: Math.max(0, Number(casinoStats.rjWon) || 0),
                    jackpots: Math.max(0, Number(casinoStats.jackpots) || 0)
                },
                history: Array.isArray(casino.history)
                    ? casino.history
                        .filter(e => e && typeof e === 'object')
                        .map(e => ({
                            at: Math.max(0, Number(e.at) || 0),
                            stake: Math.max(0, Math.floor(Number(e.stake) || 0)),
                            pokedollarsGain: Math.max(0, Math.floor(Number(e.pokedollarsGain) || Number(e.payout) || 0)),
                            matrix: Array.isArray(e.matrix) ? e.matrix.slice(0, 3).map(col => Array.isArray(col) ? col.slice(0, 3).map(v => String(v || '')) : []) : [],
                            winningLines: Array.isArray(e.winningLines) ? e.winningLines.slice(0, 5) : [],
                            rewardMessages: Array.isArray(e.rewardMessages) ? e.rewardMessages.slice(0, 5) : [],
                            rewards: Array.isArray(e.rewards) ? e.rewards.slice(0, 10).map(r => r && typeof r === 'object' ? { rewardType: r.rewardType, targetId: r.targetId, amount: r.amount } : null).filter(Boolean) : []
                        }))
                        .slice(0, 12)
                    : []
            }
        };

        this.teamRocketState = normalized;
        this.syncRocketTrustLevelFromXp();
        this.refreshRocketStakeableOffers(Date.now(), false);
        this.updateRocketStakingPushSession(Date.now());
        return normalized;
    }

    catchUpPassiveStats(deltaTime) {
        const ticks = Math.floor(deltaTime / 1000);
        if (ticks > 0) {
            console.log(`Rattrapage de ${ticks} secondes de stats passives...`);
            for (let i = 0; i < ticks; i++) {
                this.incrementPlayerStats();
                this.regenerateStamina();
            }
        }
    }

    /**
     * Rattrape tous les systèmes qui avancent avec le temps (hors combats / incubateurs déjà gérés ailleurs).
     * À appeler quand l'onglet revient au premier plan ou au chargement après absence.
     */
    catchUpAllSystems(missedTime) {
        const now = Date.now();
        if (missedTime <= 0) return;

        // Quêtes : avance le timer
        this.updateQuestTimer(missedTime);

        // Banque Team Rocket : intérêts (tick par minute)
        this.tickRocketBank(now);

        // Prêt Team Rocket : temps actif pour achievements
        this.tickRocketLoanRealtime(now);

        // Staking Team Rocket : session en cours (RJ accumulés, risques)
        this.updateRocketStakingPushSession(now);

        // Rotation des offres staking (autant de fois qu'il faut)
        const tr = this.teamRocketState;
        if (tr && tr.staking) {
            const rotationMs = this.getRocketOfferRotationMs();
            let nextAt = Number(tr.staking.nextOfferRotateAt) || 0;
            while (nextAt > 0 && now >= nextAt) {
                this.refreshRocketStakeableOffers(nextAt, true);
                nextAt += rotationMs;
            }
            tr.staking.nextOfferRotateAt = nextAt > 0 ? nextAt : now + rotationMs;
        }

        // Expéditions : timer de génération (nouvelles missions disponibles)
        if (this.availableExpeditions.length < this.maxAvailableExpeditions) {
            let remainingTime = missedTime;
            while (remainingTime > 0 && this.availableExpeditions.length < this.maxAvailableExpeditions) {
                if (remainingTime >= this.expeditionTimer) {
                    remainingTime -= this.expeditionTimer;
                    this.generateRandomExpedition();
                    this.expeditionTimer = this.EXPEDITION_GEN_TIME;
                } else {
                    this.expeditionTimer -= remainingTime;
                    remainingTime = 0;
                }
            }
        }

        // Boosts temporaires : retirer ceux expirés (now a avancé de missedTime)
        this.updateStatBoosts();
    }

    // OPTIMISATION : Architecture "Game Loop" découplée (Logic vs Render)
    startGameLoop() {
        console.log("🚀 Moteur de jeu optimisé démarré (60 FPS)");

        // Initialisation des Timers
        this.lastFrameTime = performance.now();
        this.lowFreqTimer = 0; // Accumulateur pour les actions lentes (1s)

        // La fonction de boucle qui s'appelle elle-même
        const loop = (currentTime) => {
            // 0. Onglet caché : on ne fait pas avancer le jeu pour éviter un doublon avec le rattrapage au retour
            if (document.hidden) {
                this.lastFrameTime = currentTime;
                this.gameLoopId = requestAnimationFrame(loop);
                return;
            }

            // 1. Calcul du Delta Time (Temps écoulé depuis la dernière image en ms)
            // SÉCURITÉ : On plafonne à 100ms. Si le jeu lag ou onglet inactif,
            // on évite de simuler 1 heure d'un coup ici (ça ferait planter le PC).
            const deltaTime = Math.min(currentTime - this.lastFrameTime, 100);
            this.lastFrameTime = currentTime;

            // 2. LOGIQUE RAPIDE (Ce qui doit être fluide)
            // On met à jour l'ATB et les timers précis
            this.updateHighFreqLogic(deltaTime);

            // 3. LOGIQUE LENTE (Ce qui arrive chaque seconde)
            this.lowFreqTimer += deltaTime;
            if (this.lowFreqTimer >= 1000) {
                this.updateLowFreqLogic();
                this.lowFreqTimer -= 1000; // On garde le reste pour la précision
            }

            // 4. RENDU (Dessiner l'écran)
            // Grâce à nos optimisations précédentes (Cache + GPU), 
            // on peut le faire à chaque frame sans ralentir !
            this.updateCombatDisplay();


            // 5. Boucle suivante
            this.gameLoopId = requestAnimationFrame(loop);
        };

        // Lancement initial
        this.gameLoopId = requestAnimationFrame(loop);

        // INTERVALLES SECONDAIRES (UI lente & Sauvegarde)
        // On sort ça de la boucle principale pour ne pas surcharger le processeur graphique
        if (this.secondaryInterval) clearInterval(this.secondaryInterval);
        this.secondaryInterval = setInterval(() => {
            if (document.hidden) return; // Pas de progression en arrière-plan, le rattrapage s'en charge au retour
            this.updatePlayerStatsDisplay(); // Argent, stats globales...
            this.updateUpgradesDisplay();    // Boutons d'achat
            this.checkCompletedNotifications();
            this.checkActiveExpeditions();
            this.updateQuestTimerDisplay();  // Timer de quête (pas besoin de ms)
            this.processAutoIncubatorsOnline();
            this.updateIncubatorsDisplay(); // Timer des incubateurs
            if (typeof narrativeManager !== 'undefined' && narrativeManager.checkMilestones) {
                narrativeManager.checkMilestones(this);
            }

            // Gestion du Modal de Tiers (seulement si ouvert)
            const tierModal = document.getElementById('zoneTierModal');
            if (tierModal && tierModal.classList.contains('show')) {
                if (window.showZoneTierModal) window.showZoneTierModal();
            }

            const now = Date.now();
            const rocketTab = document.getElementById('teamrocketTab');
            if (rocketTab && rocketTab.classList.contains('active')) {
                if (!this._lastRocketLoanUiTick || (now - this._lastRocketLoanUiTick) >= 1000) {
                    this._lastRocketLoanUiTick = now;
                    if (typeof window.updateTeamRocketBankRealtimeUI === 'function') {
                        window.updateTeamRocketBankRealtimeUI(this);
                    }
                    if (typeof window.updateTeamRocketLoanRealtimeUI === 'function') {
                        window.updateTeamRocketLoanRealtimeUI(this);
                    }
                    if (typeof window.updateTeamRocketStakingRealtimeUI === 'function') {
                        window.updateTeamRocketStakingRealtimeUI(this);
                    }
                }
            }
        }, 500); // 2 fois par seconde suffit largement pour l'UI statique

        // Calcul initial
        this.calculateTeamStats();
        this.updateDisplay();
    }

    // OPTIMISATION : Logique rapide (séparée du rendu)
    // CORRECTION : On réintègre la gestion des états (handleCombat)
    updateHighFreqLogic(deltaTime) {
        // 1. Gérer les états (Waiting / Starting / Dead)
        // On le fait à chaque frame pour être réactif au clic
        this.handleCombat();

        // 2. Si on se bat, on fait avancer les barres ATB avec le temps précis
        if (this.combatState === 'fighting') {
            this.updateATB(deltaTime);
        }

        // 3. Timer d'expédition
        this.updateExpeditionTimer(deltaTime);
    }

    // OPTIMISATION : Logique lente (1 fois/sec) - Économise le CPU
    // OPTIMISATION : Logique lente (1 fois/sec) - Inclut maintenant les Statuts !
    updateLowFreqLogic() {
        const now = Date.now();

        // 1. Régénération
        this.incrementPlayerStats();
        this.regenerateStamina();

        // 2. Nettoyage des boosts
        this.updateStatBoosts();

        this.updateQuestTimer(1000);
        this.tickRocketBank(now);
        this.tickRocketLoanRealtime(now);
        this.refreshRocketStakeableOffers(now, false);
        const rocketStakeTick = this.updateRocketStakingPushSession(now);
        if (rocketStakeTick && rocketStakeTick.stolen) {
            const rocketTab = document.getElementById('teamrocketTab');
            if (rocketTab && rocketTab.classList.contains('active')) this.updateTeamRocketDisplay();
            this.updateItemsDisplay();
        }
        const rocketMinute = Math.floor(now / 60000);
        if (this._lastRocketUiMinute !== rocketMinute) {
            this._lastRocketUiMinute = rocketMinute;
            const rocketTab = document.getElementById('teamrocketTab');
            if (rocketTab && rocketTab.classList.contains('active')) {
                this.updateTeamRocketDisplay();
            }
        }

        // 3. ✅ GESTION DES STATUTS (DoT & Durée)
        // C'est ici que les statuts avancent et s'enlèvent !
        if (this.combatState === 'fighting') {
            // Joueur
            if (this.currentPlayerCreature && this.currentPlayerCreature.isAlive()) {
                const pResult = this.currentPlayerCreature.processStatusEffect(this);
                // Si le DoT (Poison/Brûlure) tue le joueur
                if (pResult.isDead) this.playerCreatureFainted();
            }

            // Ennemi
            if (this.currentEnemy && this.currentEnemy.isAlive()) {
                const eResult = this.currentEnemy.processStatusEffect(this);
                // Si le DoT tue l'ennemi
                if (eResult.isDead) this.winCombat();
            }

            // 4. 🍎 Leftovers (Restes) — régénération par seconde du porteur actif
            if (this.currentPlayerCreature && this.currentPlayerCreature.heldItem === 'leftovers' && typeof HELD_ITEMS !== 'undefined') {
                const cfg = HELD_ITEMS['leftovers'];
                const baseHealPercent = (cfg && cfg.effect && cfg.effect.heal_percent) ? cfg.effect.heal_percent : 0.02;

                // Bonus de collection ZzZzZ
                const collBoost = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).leftovers_heal_mult || 0;

                const healPercent = baseHealPercent + collBoost;

                if (healPercent > 0) {
                    const isArena = this.arenaState.active;
                    if (isArena) {
                        const maxHp = this.currentPlayerCreature.maxHp || 1;
                        const heal = Math.floor(maxHp * healPercent);
                        if (heal > 0) {
                            this.currentPlayerCreature.currentHp = Math.min(maxHp, this.currentPlayerCreature.currentHp + heal);
                            if (window.showFloatingText) {
                                window.showFloatingText(
                                    "+" + (typeof formatFloatingNumber === 'function' ? formatFloatingNumber(heal) : heal),
                                    document.getElementById('playerSpriteContainer'),
                                    'ft-heal'
                                );
                            }
                        }
                    } else {
                        const maxHp = this.getPlayerMaxHp();
                        const heal = Math.floor(maxHp * healPercent);
                        if (heal > 0) {
                            this.currentPlayerCreature.mainAccountCurrentHp = Math.min(maxHp, this.currentPlayerCreature.mainAccountCurrentHp + heal);
                            if (window.showFloatingText) {
                                window.showFloatingText(
                                    "+" + (typeof formatFloatingNumber === 'function' ? formatFloatingNumber(heal) : heal),
                                    document.getElementById('playerSpriteContainer'),
                                    'ft-heal'
                                );
                            }
                        }
                    }
                }
            }
        }

        this.updateBalanceTelemetryTick();
    }

    // ========================================
    // ✅ AJOUTE cette fonction pour arrêter proprement le game loop
    // ========================================

    stopGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
            console.log("Game loop arrêté");
        }
    }




    catchupMissedCombats(missedTime) {
        // 1. Rattraper les stats passives (Toujours)
        this.catchUpPassiveStats(missedTime);

        // 2. Rattraper tous les autres systèmes (banque, prêt, staking, quêtes, boosts)
        this.catchUpAllSystems(missedTime);

        // 3. Vérifier si un mode spécial est actif
        if (this.towerState.isActive || this.arenaState.active) {
            const mode = this.towerState.isActive ? "de la Tour" : "d'Arène";
            logMessage(`⚡ Le combat ${mode} a été mis en pause pendant votre absence.`);

            this.lastCombatTime = Date.now();
            this.lastCombatTurnTime = Date.now();
            if (this.combatState !== 'fighting') this.combatState = 'fighting';

            this.updateDisplay();
            return;
        }

        /// 3. Simulation de zone (Farm)
        // A. Calcul de la moyenne
        let avgCombatTime = this.recentCombatDurations && this.recentCombatDurations.length > 0
            ? this.recentCombatDurations.reduce((a, b) => a + b, 0) / this.recentCombatDurations.length
            : 2000; // Par défaut 2s si pas de données

        // B. Limites physiques et Taxe de Lag
        const minPossibleTime = (this.combatStartDelay || 50) + (this.combatTurnDelay || 250);
        avgCombatTime = Math.max(avgCombatTime, minPossibleTime);
        avgCombatTime = Math.floor(avgCombatTime * 1.1); // +10% marge erreur

        // C. Calcul du nombre de combats
        const averageCombatDuration = this.combatCooldown + avgCombatTime;
        let maxPossibleCombats = Math.floor(missedTime / averageCombatDuration);

        if (maxPossibleCombats <= 0) {
            // Pas assez de temps pour un combat complet, mais on applique quand même l'incubation hors-ligne
            let stats = {
                simulated: 0, won: 0, lost: 0, xp: 0, money: 0, items: {},
                captured: 0, capturedPokemonList: [], time: missedTime,
                incubation: this.createOfflineIncubationStats()
            };
            this.simulateIncubatorsForElapsedOffline(missedTime, stats);
            if (stats.incubation) {
                const slotsWithEgg = this.incubators.filter(s => s != null).length;
                stats.incubation.placedTotal = stats.incubation.hatchedTotal + slotsWithEgg;
            }
            this.offlineIncubationLastReport = stats.incubation;
            this.isOfflineSimulating = false;
            return;
        }

        console.log(`🔄 Simulation: ${maxPossibleCombats} combats (Moyenne: ${(averageCombatDuration / 1000).toFixed(2)}s)`);

        this.isOfflineSimulating = true;

        // Objet unique pour tout suivre
        let stats = {
            simulated: 0,
            won: 0,
            lost: 0,
            xp: 0,
            money: 0,
            items: {},
            captured: 0,
            capturedPokemonList: [],
            time: missedTime,
            incubation: this.createOfflineIncubationStats(),
            offlineMissedTime: missedTime,
            incubationElapsedApplied: 0
        };

        const MIN_OFFLINE_FOR_MODAL_MS = 30000;

        // Ouvrir directement le rapport hors-ligne et mettre à jour les compteurs en live.
        if (missedTime >= MIN_OFFLINE_FOR_MODAL_MS) {
            this.initOfflineReportUi(stats, maxPossibleCombats);
        }


        // Coupe les logs normaux
        const originalLogFunction = window.logMessage;
        window.logMessage = function () { };

        // E. TIME-SLICED SIMULATION
        // Traitement par tranches de ~16ms pour ne jamais bloquer le navigateur,
        // même avec 20 000+ combats. Entre chaque tranche : setTimeout(0) = yield.
        const CHUNK_BUDGET_MS = 16; // une frame cible
        let currentCombat = 0;
        let isSkipped = false;

        this.offlineSimSkip = () => { isSkipped = true; };

        const finalize = () => {
            // G. INCUBATEURS (une seule passe à la fin)
            this.simulateIncubatorsChunk(missedTime, stats);

            // H. NETTOYAGE FINAL
            this.isOfflineSimulating = false;
            window.logMessage = originalLogFunction;

            for (const creature of this.playerTeam) {
                creature.heal();
                creature.currentStamina = creature.maxStamina;
                creature.clearStatusEffect();
            }

            this.combatState = 'waiting';
            this.lastCombatTime = Date.now();

            for (let idx = 0; idx < this.getMaxIncubatorSlots(); idx++) {
                const slot = this.incubators[idx];
                if (slot && slot.durationMs != null) slot.startTime = Date.now();
            }

            if (stats.incubation) {
                const slotsWithEgg = this.incubators.filter(s => s != null).length;
                stats.incubation.placedTotal = stats.incubation.hatchedTotal + slotsWithEgg;
            }

            this.offlineIncubationLastReport = stats.incubation;
            this.updateItemsDisplay();
            this.updateDisplay();
            logMessage(`⚡ Rattrapage terminé : ${stats.simulated} combats simulés.`);
            console.log(`✅ Fin Simu: ${stats.simulated} combats, ${stats.won} wins, Gain: ${stats.money}$`);

            // Vérification batch des quêtes (skippées pendant la simulation pour la perf)
            // isOfflineSimulating est déjà false → checkSpecialQuests passe normalement
            const _offlineQuestBatch = [
                'eggsOpened', 'creature_hatched', 'creature_obtained',
                'incubator_hatched', 'incubator_hatched_rare_plus',
                'bossDefeated', 'epicDefeated',
                'level_up', 'totalShards',
                'new_discovery', 'shiniesObtained', 'legendary_obtained', 'rareObtained',
                'pokedollars_gained'
            ];
            _offlineQuestBatch.forEach(e => this.checkSpecialQuests(e));


            if (missedTime >= MIN_OFFLINE_FOR_MODAL_MS) {
                // Les compteurs sont déjà live: on fige l'état final et on déverrouille la fermeture.
                this.updateOfflineReportUi(stats, currentCombat, maxPossibleCombats);
                this.finalizeOfflineReportUi(stats);
            }

            const extraOffline = this.pendingOfflineTimeMs || 0;
            if (extraOffline > 1000) {
                this.pendingOfflineTimeMs = 0;
                setTimeout(() => this.catchupMissedCombats(extraOffline), 0);
            }
        };

        const chunkStep = () => {
            if (isSkipped) {
                // Terminer d'un coup (skip demandé explicitement)
                while (currentCombat < maxPossibleCombats) {
                    this.faintedThisCombat = new Set();
                    this.currentPlayerCreature = this.getFirstAliveCreature();
                    if (!this.currentPlayerCreature) { maxPossibleCombats = currentCombat; break; }
                    this.activeCreatureIndex = this.playerTeam.indexOf(this.currentPlayerCreature);
                    const r = this.simulateCombat();
                    stats.simulated++;
                    if (r) {
                        stats.won++; stats.xp += r.xp || 0; stats.money += r.money || 0;
                        if (r.items) for (const [k, v] of Object.entries(r.items)) stats.items[k] = (stats.items[k] || 0) + v;
                        if (r.captured) { stats.captured++; if (stats.capturedPokemonList.length < 50) stats.capturedPokemonList.push(r.captured); }
                    } else { stats.lost++; }
                    const rt = Math.floor(this.combatCooldown / 1000); for (let j = 0; j < rt; j++) this.regenerateStamina();
                    this.combatState = 'waiting';
                    currentCombat++;
                }
                finalize();
                return;
            }

            // Tranche normale : traiter des combats pendant CHUNK_BUDGET_MS ms
            const sliceStart = performance.now();
            while (currentCombat < maxPossibleCombats) {
                this.faintedThisCombat = new Set();
                this.currentPlayerCreature = this.getFirstAliveCreature();
                if (!this.currentPlayerCreature) { maxPossibleCombats = currentCombat; break; }
                this.activeCreatureIndex = this.playerTeam.indexOf(this.currentPlayerCreature);

                const result = this.simulateCombat();
                stats.simulated++;

                if (result) {
                    stats.won++;
                    stats.xp += result.xp || 0;
                    stats.money += result.money || 0;
                    if (result.items) for (const [k, v] of Object.entries(result.items)) stats.items[k] = (stats.items[k] || 0) + v;
                    if (result.captured) {
                        stats.captured++;
                        if (stats.capturedPokemonList.length < 50) stats.capturedPokemonList.push(result.captured);
                    }
                } else {
                    stats.lost++;
                }

                const regenTicks = Math.floor(this.combatCooldown / 1000);
                for (let j = 0; j < regenTicks; j++) this.regenerateStamina();
                this.combatState = 'waiting';
                currentCombat++;

                // Vérifier le budget temps toutes les 50 itérations pour limiter l'overhead
                if (currentCombat % 50 === 0 && performance.now() - sliceStart >= CHUNK_BUDGET_MS) break;
            }

            if (missedTime >= MIN_OFFLINE_FOR_MODAL_MS) {
                this.updateOfflineReportUi(stats, currentCombat, maxPossibleCombats);
            }

            if (currentCombat < maxPossibleCombats) {
                setTimeout(chunkStep, 0);
            } else {
                setTimeout(finalize, 0);
            }
        };

        // Premier yield pour laisser le modal s'afficher avant de commencer
        setTimeout(chunkStep, 0);

    }

    initOfflineReportUi(stats, maxPossibleCombats) {
        const modal = document.getElementById('offlineModal');
        if (!modal) return;

        const totalSeconds = Math.floor(stats.time / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        let timeStr = "";
        if (h > 0) timeStr = `${h}h ${m}m ${s}s`;
        else if (m > 0) timeStr = `${m}m ${s}s`;
        else timeStr = `${s}s`;

        modal.innerHTML = `
        <div class="modal-content" style="position: relative; overflow: hidden; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h2>Rapport Hors-Ligne</h2>
            </div>
            
            

            <div class="modal-body" style="flex: 1; overflow-y: auto;">
                <div class="offline-summary">
                    <div class="offline-time" id="offlineTimeDisplay">${timeStr}</div>
                    <div class="offline-subtitle">Temps écoulé</div>
                </div>

                <div class="stats-row">
                    <div class="mini-stat">
                        <span class="val" id="anim-simulated" style="color:#ef4444">0</span>
                        <span class="lbl" id="lbl-simulated">Combats / ${formatNumber(maxPossibleCombats)}</span>
                    </div>
                    <div class="mini-stat">
                        <span class="val" id="anim-money" style="color:#f59e0b">+0</span>
                        <span class="lbl">Argent</span>
                    </div>
                    <div class="mini-stat">
                        <span class="val" id="anim-xp" style="color:#8b5cf6">+0</span>
                        <span class="lbl">XP</span>
                    </div>
                </div>

                <div id="offlineDynamicLootContainer" style="display:none;">
                    <div class="section-title">📦 Butin (<span id="anim-loot-count">0</span>)</div>
                    <div class="loot-scroll-area" id="lootArea"></div>
                </div>

                <div id="offlineDynamicIncubationContainer" style="display:none;">
                    <div class="section-title" id="incubationTitle">🥚 Incubations automatiques</div>
                    <div class="offline-incubation-panel" id="offlineIncubationPanel">
                        <div class="offline-incubation-summary" id="offlineIncubationSummary"></div>
                        <div class="offline-incubation-columns">
                            <div class="offline-incubation-column">
                                <div class="offline-incubation-subtitle">Par rareté</div>
                                <div id="offlineIncubationByRarity"></div>
                            </div>
                            <div class="offline-incubation-column">
                                <div class="offline-incubation-subtitle">Par incubateur</div>
                                <div id="offlineIncubationBySlot"></div>
                            </div>
                        </div>
                        <div class="offline-incubation-subtitle">Aperçu Pokémon obtenus</div>
                        <div id="offlineIncubationPreview" class="offline-incubation-preview"></div>
                    </div>
                </div>

                <div id="offlineDynamicCaptureContainer" style="display:none;">
                    <div class="section-title" id="captureTitle">🕸️ Captures (<span id="anim-captured">0</span>)</div>
                    <div class="pokemon-grid" id="captureGrid"></div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="claim-btn" onclick="if(window.game && typeof window.game.offlineSimSkip === 'function') window.game.offlineSimSkip()">Passer le calcul</button>
            </div>
        </div>
        `;


        // Désactiver la fermeture pendant la simulation (clic extérieur interdit temporairement)
        if (modal._offlineBackdropClick) {
            modal.removeEventListener('click', modal._offlineBackdropClick);
            modal._offlineBackdropClick = null;
        }

        modal.style.display = 'flex';
    }

    updateOfflineReportUi(stats, currentCombat, maxPossibleCombats) {
        const elSim = document.getElementById('anim-simulated');
        const elMoney = document.getElementById('anim-money');
        const elXp = document.getElementById('anim-xp');
        if (elSim) elSim.innerHTML = formatNumber(stats.simulated);
        if (elMoney) elMoney.innerHTML = '+' + formatNumber(stats.money);
        if (elXp) elXp.innerHTML = '+' + formatNumber(stats.xp);
    }

    finalizeOfflineReportUi(stats) {
        const modal = document.getElementById('offlineModal');
        if (!modal) return;

        // Harmoniser l'affichage des combats une fois la simulation terminée :
        // on remplace le maximum théorique par le nombre réel de combats simulés
        const lblSimulated = document.getElementById('lbl-simulated');
        if (lblSimulated) {
            lblSimulated.textContent = `Combats / ${formatNumber(stats.simulated)}`;
        }

        // On peut maintenant fermer la modal !
        if (!modal._offlineBackdropClick) {
            modal._offlineBackdropClick = function (e) {
                if (e.target === modal) closeOfflineModal();
            };
            modal.addEventListener('click', modal._offlineBackdropClick);
        }

        const closeBtnHTML = '<div style="cursor:pointer;" onclick="closeOfflineModal()">✕</div>';
        const header = modal.querySelector('.modal-header');
        if (header && !header.innerHTML.includes('✕')) {
            header.innerHTML += closeBtnHTML;
        }

        // Transformer le bouton "Skip" en "Tout récupérer"
        const footerBtn = modal.querySelector('.modal-footer button');
        if (footerBtn) {
            footerBtn.className = 'claim-btn claim-button-glow'; // petite classe stylée si tu veux
            footerBtn.onclick = closeOfflineModal;
            footerBtn.innerHTML = 'Tout Récupérer';
        }

        // 1. Lancer l'UI Loot (Seulement s'il y a du loot)
        const lootContainer = document.getElementById('offlineDynamicLootContainer');
        const lootArea = document.getElementById('lootArea');
        if (lootContainer && lootArea) {
            const items = Object.entries(stats.items);
            const totalLootCount = items.reduce((a, b) => a + b[1], 0);

            if (totalLootCount > 0) {
                lootContainer.style.display = 'block';
                document.getElementById('anim-loot-count').innerHTML = formatNumber(totalLootCount);

                let lootHtml = '';
                items.forEach(([key, count]) => {
                    const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const iconPath = getItemIconPath(key);
                    const rarityClass = getRarityClass(key);
                    lootHtml += `
                    <div class="loot-item ${rarityClass}">
                        <img src="${iconPath}" class="item-icon" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                        <div class="item-info">
                            <span class="item-name">${displayName}</span>
                        </div>
                        <span class="item-qty "> x${formatNumber(count)}</span>
                    </div>`;
                });
                lootArea.innerHTML = lootHtml;
            }
        }

        // 2. Incubations Auto
        const incubationContainer = document.getElementById('offlineDynamicIncubationContainer');
        if (incubationContainer && stats.incubation && stats.incubation.hatchedTotal > 0) {
            incubationContainer.style.display = 'block';

            const incubation = stats.incubation;
            document.getElementById('incubationTitle').textContent = `🥚 Incubations automatiques (${formatNumber(incubation.hatchedTotal)})`;

            document.getElementById('offlineIncubationSummary').innerHTML = `
                <div class="offline-incubation-pill">Éclosions: <strong>${formatNumber(incubation.hatchedTotal)}</strong></div>
                <div class="offline-incubation-pill">Placés auto: <strong>${formatNumber(incubation.placedTotal)}</strong></div>
            `;

            const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.COMMON];
            const rarityLabel = { [RARITY.LEGENDARY]: 'Légendaire', [RARITY.EPIC]: 'Epic', [RARITY.RARE]: 'Rare', [RARITY.COMMON]: 'Common' };

            const byRarity = document.getElementById('offlineIncubationByRarity');
            byRarity.innerHTML = rarityOrder
                .filter(r => (incubation.byRarity[r] || 0) > 0)
                .map(r => `<div class="offline-incubation-row"><span>${rarityLabel[r]}</span><strong>${formatNumber(incubation.byRarity[r])}</strong></div>`)
                .join('') || '<div class="offline-incubation-empty">Aucune éclosion.</div>';

            const bySlot = document.getElementById('offlineIncubationBySlot');
            bySlot.innerHTML = [0, 1, 2, 3]
                .filter(i => (incubation.bySlot[i] || 0) > 0)
                .map(i => `<div class="offline-incubation-row"><span>Incubateur ${i + 1}</span><strong>${formatNumber(incubation.bySlot[i])}</strong></div>`)
                .join('') || '<div class="offline-incubation-empty">Aucune éclosion.</div>';

            const preview = document.getElementById('offlineIncubationPreview');
            if (Array.isArray(incubation.obtainedPokemonPreview) && incubation.obtainedPokemonPreview.length > 0) {
                preview.innerHTML = incubation.obtainedPokemonPreview
                    .map(p => {
                        const shiny = p.isShiny ? ' ✨' : '';
                        return `<span class="offline-incubation-pokemon-chip">${p.name}${shiny}</span>`;
                    }).join('');
            } else {
                preview.innerHTML = '<div class="offline-incubation-empty">Aucun Pokémon listé.</div>';
            }
        }

        // 3. Captures
        const captureContainer = document.getElementById('offlineDynamicCaptureContainer');
        const captureGrid = document.getElementById('captureGrid');
        if (captureContainer && captureGrid && stats.capturedPokemonList && stats.capturedPokemonList.length > 0) {
            captureContainer.style.display = 'block';
            document.getElementById('anim-captured').innerHTML = formatNumber(stats.captured);

            let captureHtml = '';
            stats.capturedPokemonList.forEach(poke => {
                const sprite = getPokemonSpritePath(poke.name, poke.shiny);
                const shinyEffect = poke.shiny ? '<span class="shiny-sparkle">✨</span>' : '';
                const bgStyle = poke.shiny ? 'background: #fffbeb; border-color: #f59e0b;' : '';

                captureHtml += `
                <div class="poke-capture" style="${bgStyle}">
                    ${shinyEffect}
                    <img src="${sprite}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png'" title="${poke.name}">
                </div>
                `;
            });
            captureGrid.innerHTML = captureHtml;
        }
    }

    // Animation cosmétique des compteurs du modal après simulation synchrone
    animateOfflineCounters(stats, maxPossibleCombats) {
        const DURATION = 1500;
        const start = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);

        const bar = document.getElementById('offlineProgressBarNeutral');
        const txt = document.getElementById('offlineProgressTextNeutral');
        const elSim = document.getElementById('anim-simulated');
        const elMoney = document.getElementById('anim-money');
        const elXp = document.getElementById('anim-xp');
        const elCap = document.getElementById('anim-captured');
        const lblSim = document.getElementById('lbl-simulated');
        if (lblSim) lblSim.textContent = `Combats / ${formatNumber(stats.simulated)}`;

        const tick = (now) => {
            const t = Math.min(1, (now - start) / DURATION);
            const e = easeOut(t);

            if (bar) bar.style.width = (e * 100).toFixed(1) + '%';
            if (txt) txt.textContent = Math.floor(e * 100) + '%';
            if (elSim) elSim.textContent = formatNumber(Math.floor(e * stats.simulated));
            if (elMoney) elMoney.textContent = '+' + formatNumber(Math.floor(e * stats.money));
            if (elXp) elXp.textContent = '+' + formatNumber(Math.floor(e * stats.xp));
            if (elCap) elCap.textContent = Math.floor(e * (stats.captured || 0));

            if (t < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
    }

    getSpawnDelay() {
        // 1. Sécurité : Si GAME_SPEEDS n'est pas trouvé, on met 250 par défaut
        const baseDelay = (typeof GAME_SPEEDS !== 'undefined') ? GAME_SPEEDS.RESPAWN_DELAY : 2500;

        // 2. Sécurité CRITIQUE : Vérifier si l'upgrade existe dans la sauvegarde
        // Si le joueur a une vieille save, this.upgrades.respawn est undefined -> CRASH
        let level = 0;
        if (this.upgrades && this.upgrades.respawn) {
            level = this.upgrades.respawn.level;
        }

        // 3. Calcul
        const collectionBonus = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).respawn_delay_reduction || 0;
        const reduction = (level * 50) + collectionBonus;

        // 4. Résultat (Min 50ms)
        return Math.max(50, baseDelay - reduction);
    }

    startTowerRun() {
        if (typeof startTowerRunLogic === 'function') startTowerRunLogic(this);
    }

    checkActiveExpeditions() {
        if (this.activeExpeditions.length > 0) {
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id === 'expeditionsTab') this.updateExpeditionsDisplay();
        }
    }

    nextTowerFloor() {
        if (typeof nextTowerFloorLogic === 'function') nextTowerFloorLogic(this);
    }

    offerTowerRelic() {
        if (typeof offerTowerRelicLogic === 'function') offerTowerRelicLogic(this);
    }

    selectTowerRelic(key, rarity) {
        if (typeof selectTowerRelicLogic === 'function') selectTowerRelicLogic(this, key, rarity);
    }

    endTowerRun(isForfeit = false) {
        if (typeof endTowerRunLogic === 'function') endTowerRunLogic(this, isForfeit);
    }

    updateTowerShopDisplay() {
        if (typeof updateTowerShopDisplayUI === 'function') updateTowerShopDisplayUI(this);
    }

    buyTowerShopItem(itemKey) {
        if (typeof buyTowerShopItemLogic === 'function') buyTowerShopItemLogic(this, itemKey);
    }
    // Réinitialisation aléatoire
    // Réinitialisation aléatoire du talent
    useTalentReroll(creatureIndex, location) { // ✅ Argument 'location' est maintenant un string ('team', 'storage', 'pension')
        if (this.talentRerolls <= 0) {
            logMessage("Vous n'avez pas de Cristal de Réinitialisation !");
            return false;
        }

        // 1. Trouver la créature selon le lieu
        let creature;
        if (location === 'team') creature = this.playerTeam[creatureIndex];
        else if (location === 'storage') creature = this.storage[creatureIndex];
        else if (location === 'pension') creature = this.pension[creatureIndex];

        if (!creature) {
            console.error("Créature introuvable !");
            return false;
        }

        // Vérifications de base
        if (creature.rarity !== RARITY.EPIC && creature.rarity !== RARITY.LEGENDARY) {
            logMessage("Seules les créatures Epic et Legendary peuvent changer de talent !");
            return false;
        }

        if (!creature.passiveTalent) return false;

        // 2. Logique de Reroll (Inchangée)
        const oldTalent = creature.passiveTalent;
        const oldTalentInfo = PASSIVE_TALENTS[oldTalent];

        let attempts = 0;
        do {
            creature.assignRandomTalent();
            attempts++;
        } while (creature.passiveTalent === oldTalent && attempts < 20);

        this.talentRerolls--;

        const newTalentInfo = PASSIVE_TALENTS[creature.passiveTalent];
        logMessage(`✨ ${creature.name} : ${oldTalentInfo.name} → ${newTalentInfo.name} !`);

        // 3. Mise à jour des données
        this.calculateTeamStats();
        this.uiDirty = true; // Signaler que l'interface doit changer
        this.updateDisplay(); // Mettre à jour l'arrière-plan (listes, stats)

        // 4. ✅ RAFRAÎCHIR LE MODAL (Le garder ouvert avec les nouvelles infos)
        this.showCreatureModal(creatureIndex, location);

        return true;
    }

    // Choix manuel du talent
    useTalentChoice(creatureIndex, isStorage = false) {
        if (this.talentChoices <= 0) {
            logMessage("Vous n'avez pas d'Orbe de Maîtrise !");
            return false;
        }

        const creature = isStorage ? this.storage[creatureIndex] : this.playerTeam[creatureIndex];

        if (!creature) {
            logMessage("Créature introuvable !");
            return false;
        }

        if (creature.rarity !== RARITY.EPIC && creature.rarity !== RARITY.LEGENDARY) {
            logMessage("Seules les créatures Epic et Legendary peuvent changer de talent !");
            return false;
        }

        if (!creature.passiveTalent) {
            logMessage(creature.name + " n'a pas de talent passif !");
            return false;
        }

        // Ouvrir un modal pour choisir le talent
        this.openTalentChoiceModal(creature, creatureIndex, isStorage);
    }

    openTalentChoiceModal(creature, creatureIndex, isStorage) {
        // Créer le modal
        const modal = document.createElement('div');
        modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100 %;
                    height: 100 %;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify - content: center;
                    align - items: center;
                    z - index: 10000;
                    `;

        const content = document.createElement('div');
        content.style.cssText = `
                    background: linear - gradient(135deg, #1e293b 0 %, #0f172a 100 %);
                    padding: 30px;
                    border - radius: 15px;
                    max - width: 600px;
                    max - height: 80vh;
                    overflow - y: auto;
                    border: 2px solid #a855f7;
                    box - shadow: 0 0 30px rgba(168, 85, 247, 0.5);
                    `;

        let html = `
                        < h2 style = "color: #a855f7; margin-bottom: 20px; text-align: center;" >
            🌟 Choisir un Talent pour ${creature.name}
        </h2 >
        <p style="color: #94a3b8; text-align: center; margin-bottom: 20px;">
            Talent actuel : <strong>${PASSIVE_TALENTS[creature.passiveTalent].name}</strong>
        </p>
        <div style="display: grid; gap: 10px;">
    `;

        // Filtrer les talents selon la rareté
        const availableTalents = creature.rarity === RARITY.LEGENDARY
            ? Object.keys(PASSIVE_TALENTS)
            : Object.keys(PASSIVE_TALENTS).filter(key => PASSIVE_TALENTS[key].rarity === RARITY.EPIC);

        availableTalents.forEach(talentKey => {
            const talent = PASSIVE_TALENTS[talentKey];
            const isCurrent = talentKey === creature.passiveTalent;
            const rarityColor = talent.rarity === RARITY.LEGENDARY ? '#ffd700' : '#9333ea';

            html += `
            <button 
                onclick="game.applyTalentChoice('${talentKey}', ${creatureIndex}, ${isStorage}); document.body.removeChild(this.closest('[style*=fixed]'));"
                style="
                    padding: 15px;
                    background: ${isCurrent ? 'linear-gradient(135deg, #374151, #1f2937)' : 'linear-gradient(135deg, #4c1d95, #5b21b6)'};
                    color: white;
                    border: 2px solid ${rarityColor};
                    border-radius: 10px;
                    cursor: ${isCurrent ? 'not-allowed' : 'pointer'};
                    opacity: ${isCurrent ? '0.5' : '1'};
                    text-align: left;
                    transition: all 0.3s;
                "
                ${isCurrent ? 'disabled' : ''}
                onmouseover="if(!this.disabled) this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'"
            >
                <div style="font-weight: bold; font-size: 16px; color: ${rarityColor};">
                    ${talent.name} ${isCurrent ? '(Actuel)' : ''}
                </div>
                <div style="font-size: 13px; margin-top: 5px; color: #cbd5e1;">
                    ${talent.description}
                </div>
            </button>
        `;
        });

        html += `
        </div>
        <button 
            onclick="document.body.removeChild(this.closest('[style*=fixed]'))"
            style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                width: 100%;
                font-weight: bold;
            "
        >
            Annuler
        </button>
                    `;

        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    applyTalentChoice(talentKey, creatureIndex, isStorage) {
        const creature = isStorage ? this.storage[creatureIndex] : this.playerTeam[creatureIndex];

        const oldTalent = creature.passiveTalent;
        const oldTalentInfo = PASSIVE_TALENTS[oldTalent];

        creature.passiveTalent = talentKey;
        this.talentChoices--;

        const newTalentInfo = PASSIVE_TALENTS[talentKey];
        logMessage(`🌟 ${creature.name} : ${oldTalentInfo.name} → ${newTalentInfo.name} !`);
        logMessage(`📜 ${newTalentInfo.description} `);

        this.calculateTeamStats();
        this.updateDisplay();
    }

    showTowerCompletionModal(floor, isNewRecord, isForfeit) {
        if (typeof showTowerCompletionModalLogic === 'function') showTowerCompletionModalLogic(this, floor, isNewRecord, isForfeit);
    }

    updateTowerDisplay() {
        if (typeof updateTowerDisplayLogic === 'function') updateTowerDisplayLogic(this);
    }

    // ... Tu peux coller ici toutes tes autres fonctions (saveGame, loadGame, winCombat, etc.)
    // ... Assure-toi de remplacer winCombat et playerCreatureFainted par les versions que je t'ai données
    // ... qui contiennent la logique pour la Tour.

    updatePensionVisibility() {
        const pensionContainer = document.getElementById('pensionContainer');
        const pensionIcon = document.getElementById('pensionToggleIcon');

        if (!pensionContainer || !pensionIcon) return;

        if (this.isPensionCollapsed) {
            pensionContainer.style.display = 'none';
            pensionIcon.textContent = '▶';
        } else {
            pensionContainer.style.display = 'block';
            pensionIcon.textContent = '▼';
        }
    }

    hasCreatureInCollection(name, type) {
        // Vérifier dans l'équipe
        if (this.playerTeam.some(c => c.name === name && c.type === type)) {
            return true;
        }

        // Vérifier dans le stockage
        if (this.storage.some(c => c.name === name && c.type === type)) {
            return true;
        }

        // Vérifier dans la pension
        if (this.pension.some(c => c.name === name && c.type === type)) {
            return true;
        }

        return false;
    }

    // UI : Affiche un texte flottant sur un élément d'interface (Header, Bouton...)
    showUiFloatingText(elementId, text, type = 'ft-money') {
        const target = document.getElementById(elementId);
        if (!target) return;

        // 1. Calcul de la position exacte sur l'écran
        const rect = target.getBoundingClientRect();

        // 2. Création de l'élément
        const el = document.createElement('div');
        el.className = `ui-floating-text ${type}`;
        el.textContent = text;

        // 3. Positionnement (Centré horizontalement sur la cible)
        // On compense légèrement vers le haut (top) pour ne pas cacher le chiffre actuel
        el.style.left = `${rect.left + (rect.width / 2)}px`;
        el.style.top = `${rect.top}px`;

        // Centrage CSS final du texte lui-même par rapport au point
        el.style.transform = "translateX(-50%)";

        document.body.appendChild(el);

        // 4. Nettoyage automatique
        setTimeout(() => {
            if (el.parentElement) el.remove();
        }, 1500);
    }


    // handleCombat -> logique déplacée vers combatSystem.js
    handleCombat() {
        if (typeof handleCombatLogic === 'function') handleCombatLogic(this);
    }

    // updateATB -> logique déplacée vers combatSystem.js
    updateATB(deltaTime) {
        if (typeof updateATBLogic === 'function') updateATBLogic(this, deltaTime);
    }


    // processPendingAttacks -> logique déplacée vers combatSystem.js
    processPendingAttacks() {
        if (typeof processPendingAttacksLogic === 'function') processPendingAttacksLogic(this);
    }

    // executeCreatureTurn -> logique déplacée vers combatSystem.js
    executeCreatureTurn(attacker, target, isPlayer, now) {
        if (typeof executeCreatureTurnLogic === 'function') executeCreatureTurnLogic(this, attacker, target, isPlayer, now);
    }

    // ✅ REMPLACEZ startCombat (index.html)
    startCombat() {
        this.sessionStats.combatStartTime = Date.now();
        this.faintedThisCombat = new Set();
        this.currentPlayerCreature = null;
        this.reflexActive = false;

        // Logique de sélection (inchangée)
        if (this.activeCreatureIndex < this.playerTeam.length && this.playerTeam[this.activeCreatureIndex].isAlive()) {
            this.currentPlayerCreature = this.playerTeam[this.activeCreatureIndex];
        } else {
            this.currentPlayerCreature = this.getFirstAliveCreature();
            if (this.currentPlayerCreature) {
                this.activeCreatureIndex = this.playerTeam.indexOf(this.currentPlayerCreature);
            }
        }

        // ⬇️⬇️⬇️ AJOUTEZ CE BLOC DE CODE ICI ⬇️⬇️⬇️
        if (!this.currentPlayerCreature) {
            // Aucune créature vivante n'a été trouvée, on ne peut pas démarrer le combat.
            // On se met en état de récupération pour réanimer l'équipe.
            this.combatState = 'dead';
            this.lastCombatTime = Date.now();
            return; // On arrête la fonction startCombat ici.
        }

        this.currentPlayerCreature.recalculateStats();

        this.currentPlayerCreature.actionGauge = 0;
        this.currentPlayerCreature.mainAccountCurrentHp = this.getPlayerMaxHp();

        this.currentEnemy = this.getOrCreateEnemy();
        this.combatState = 'starting';
        this.combatStartTime = Date.now();
        if (this.getCollectionBonusDetails && this.getCollectionBonusDetails().some(d => d.isActive)) {
            this.checkSpecialQuests('synergyActive');
            this.checkSpecialQuests('collectionBonusActive');
        }

        logMessage("Combat contre " + this.currentEnemy.name + " niveau " + this.currentEnemy.level + " - Preparation...");

        if (this.autoSelectEnabled) {
            const bestIndex = this.findBestCreatureForEnemy();
            if (bestIndex !== -1 && bestIndex !== this.activeCreatureIndex) {
                this.setActiveCreature(bestIndex);
            }
        }
    }

    getOrCreateEnemy() {
        return typeof getOrCreateEnemyLogic === 'function' ? getOrCreateEnemyLogic(this) : null;
    }

    // getAllPokemonInZone, getReachablePokemonInZone -> logique déplacée vers zoneSystem.js
    getAllPokemonInZone(zoneId) {
        return typeof getAllPokemonInZoneLogic === 'function' ? getAllPokemonInZoneLogic(this, zoneId) : [];
    }
    getReachablePokemonInZone(zoneId) {
        return typeof getReachablePokemonInZoneLogic === 'function' ? getReachablePokemonInZoneLogic(this, zoneId) : [];
    }


    setupEggHandler() {
        let isProcessingEgg = false;

        document.addEventListener('click', (event) => {
            if (isProcessingEgg) return;

            let target = event.target;
            let eggElement = null;

            for (let i = 0; i < 5 && target; i++) {
                if (target.classList && target.classList.contains('egg-clickable')) {
                    eggElement = target;
                    break;
                }
                target = target.parentElement;
            }

            if (!eggElement) return;

            const rarity = eggElement.getAttribute('data-rarity');
            if (!rarity) return;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            isProcessingEgg = true;

            // ✅ DÉSACTIVER temporairement les logs pour éviter les ralentissements
            const originalLogFunction = window.logMessage;
            let eggsOpened = 0;

            // Ctrl+Clic : Ouvrir maximum 100 œufs
            if (event.ctrlKey || event.metaKey) {
                const maxToOpen = Math.min(100, this.eggs[rarity]);
                if (maxToOpen > 0) {
                    // ✅ Désactiver les logs pendant l'ouverture massive
                    window.logMessage = function () { };

                    logMessage(`Ouverture de ${maxToOpen} œufs ${rarity}...`);

                    for (let i = 0; i < maxToOpen; i++) {
                        this.openEgg(rarity);
                        eggsOpened++;
                    }

                    // ✅ Réactiver les logs
                    window.logMessage = originalLogFunction;
                    logMessage(`✅ ${eggsOpened} œufs ${rarity} ouverts!`);
                }
            }
            // Shift+Clic : Ouvrir 5 œufs
            else if (event.shiftKey) {
                const maxToOpen = Math.min(5, this.eggs[rarity]);
                for (let i = 0; i < maxToOpen; i++) {
                    if (this.eggs[rarity] > 0) {
                        this.openEgg(rarity);
                    }
                }
            }
            // Clic simple : Ouvrir 1 œuf
            else {
                this.openEgg(rarity);
            }

            // ✅ Mettre à jour l'affichage UNE SEULE FOIS à la fin
            // 🛑 OPTIMISATION : Déporter les mises à jour DOM lourdes hors du thread de clic
            requestAnimationFrame(() => {
                this.updateEggsDisplay();
                this.updateTeamDisplay();
                this.updatePlayerStatsDisplay();
                this.updatePokedexDisplay();
                this.updateStorageDisplay();
            });

            setTimeout(() => {
                isProcessingEgg = false;
            }, 100);
        }, true);
    }


    // Gestion du Modal Logs
    openLogModal() {
        console.log("🖱️ Clic reçu : Tentative d'ouverture du Journal...");

        const modal = document.getElementById('logModal');
        if (modal) {
            modal.classList.add('show');

            // Scroll en bas
            const container = document.getElementById('gameLog');
            if (container) container.scrollTop = container.scrollHeight;

            console.log("✅ Journal ouvert !");
        } else {
            console.error("❌ ERREUR CRITIQUE : L'élément HTML <div id='logModal'> est introuvable !");
            alert("Erreur : Le modal de logs n'existe pas dans le HTML.");
        }
    }

    closeLogModal() {
        const modal = document.getElementById('logModal');
        if (modal) modal.classList.remove('show');
    }

    clearLogs() {
        const div = document.getElementById('gameLog');
        if (div) div.innerHTML = '<div class="log-entry" style="color:#666;">Journal vidé.</div>';
    }


    regenerateStamina() {
        const now = Date.now();
        const regenTime = this.getStaminaRegenTime();

        if (this.combatState === 'waiting' || this.combatState === 'dead') {
            if (now - this.lastStaminaRegen >= regenTime) {
                this.lastStaminaRegen = now;

                for (const creature of this.playerTeam) {
                    if (creature.currentStamina < creature.maxStamina) {
                        creature.currentStamina++;
                    }
                }

                this.updateTeamDisplay();
            }
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.saveGame();

            const indicator = document.getElementById('autoSaveIndicator');
            if (indicator) {
                const time = new Date().toLocaleTimeString();
                // On garde le point vert (.auto-save-dot) et on change juste le texte à côté
                indicator.innerHTML = `< span class= "auto-save-dot" ></span > Sauvegardé à ${time}`;

                // Petit effet visuel (flash vert sur le texte)
                indicator.style.color = "#16a34a";
                setTimeout(() => {
                    indicator.style.color = "#94a3b8"; // Revient au gris
                }, 1000);
            }
        }, 15000); // Toutes les 15 secondes
    }


    incrementPlayerStats() {
        const gain = this.getPassiveStatGainPerSecond();
        this.playerMainStats.hp += gain.hp;
        this.playerMainStats.attack += gain.attack;
        this.playerMainStats.spattack += gain.spattack;
        this.playerMainStats.defense += gain.defense;
        this.playerMainStats.spdefense += gain.spdefense;
        this.playerMainStats.speed += gain.speed;

        this.updatePlayerStatsDisplay();
    }

    addCombatPokedollars(amount, source = 'combat') {
        const raw = Math.max(0, Math.floor(Number(amount) || 0));
        if (raw <= 0) return { net: 0, withheld: 0 };

        let withheld = 0;
        const tr = this.teamRocketState || this.createDefaultTeamRocketState();
        if (tr.loan && tr.loan.active && tr.loan.remainingDebt > 0) {
            const ratio = tr.loan.withholdingRate || 0.5;
            withheld = Math.min(tr.loan.remainingDebt, Math.floor(raw * ratio));
            tr.loan.remainingDebt = Math.max(0, tr.loan.remainingDebt - withheld);
            tr.loan.repaidTotal = (tr.loan.repaidTotal || 0) + withheld;
            this.handleRocketLoanRepaidIfNeeded(tr.loan);
            this.teamRocketState = tr;
        }

        const net = Math.max(0, raw - withheld);
        let injectedToBank = 0;
        let creditedToWallet = net;
        const isCombatSource = (source === 'combat' || source === 'combat_simulated');
        const injectCombatHalf = !!(tr.bank && tr.bank.autoInjectCombatHalf);
        if (isCombatSource && injectCombatHalf) {
            injectedToBank = Math.floor(net * 0.5);
            creditedToWallet = Math.max(0, net - injectedToBank);
            tr.bank.balance = (tr.bank.balance || 0) + injectedToBank;
        }
        this.pokedollars += creditedToWallet;
        this.stats.totalPokedollarsEarned = (this.stats.totalPokedollarsEarned || 0) + net;
        this.checkAchievements('totalPokedollarsEarned');
        this.checkSpecialQuests('pokedollars_gained');

        if (withheld > 0 && source !== 'silent') {
            logMessage(`🚨 Team Rocket prélève ${formatNumber(withheld)}$ pour rembourser la dette.`);
        }
        return { net, withheld, injectedToBank, creditedToWallet };
    }

    getRocketLoanCap() {
        const tr = this.teamRocketState || this.createDefaultTeamRocketState();
        const interests = Math.floor((tr.bank && tr.bank.totalInterestGenerated) || 0);
        return interests;
    }

    canTakeRocketLoan(amount) {
        const tr = this.teamRocketState || this.createDefaultTeamRocketState();
        if (tr.loan && tr.loan.active && tr.loan.remainingDebt > 0) {
            return { ok: false, reason: 'Un prêt Team Rocket est déjà actif.' };
        }
        const req = Math.max(0, Math.floor(Number(amount) || 0));
        if (req <= 0) return { ok: false, reason: 'Montant invalide.' };
        const cap = this.getRocketLoanCap();
        if (req > cap) return { ok: false, reason: `Plafond dépassé (${formatNumber(cap)}$ max).` };
        return { ok: true, reason: '' };
    }

    takeRocketLoan(amount) {
        const check = this.canTakeRocketLoan(amount);
        if (!check.ok) {
            logMessage(`❌ ${check.reason}`);
            return false;
        }
        const principal = Math.floor(Number(amount) || 0);
        const tr = this.teamRocketState;
        const debt = principal;
        tr.loan.active = true;
        tr.loan.principal = principal;
        tr.loan.totalDebt = debt;
        tr.loan.remainingDebt = debt;
        tr.loan.repaidTotal = 0;
        tr.loan.startedAt = Date.now();
        tr.loan.lastRealtimeTickAt = tr.loan.startedAt;
        this.pokedollars += principal;
        logMessage(`💼 Prêt Team Rocket accordé: +${formatNumber(principal)}$ (dette: ${formatNumber(debt)}$).`);
        this.updatePlayerStatsDisplay();
        return true;
    }

    tickRocketLoanRealtime(now = Date.now()) {
        const tr = this.teamRocketState;
        if (!tr || !tr.loan) return;
        const loan = tr.loan;
        if (!loan.active || loan.remainingDebt <= 0) {
            loan.lastRealtimeTickAt = now;
            return;
        }
        if (!loan.lastRealtimeTickAt || loan.lastRealtimeTickAt > now) {
            loan.lastRealtimeTickAt = now;
            return;
        }
        const elapsed = Math.max(0, now - loan.lastRealtimeTickAt);
        loan.lastRealtimeTickAt = now;
        if (elapsed <= 0) return;
        this.stats.rocketLoanActiveRealtimeMs = Math.max(0, Number(this.stats.rocketLoanActiveRealtimeMs) || 0) + elapsed;
        this.checkAchievements('rocketLoanActiveRealtimeMs');
    }

    handleRocketLoanRepaidIfNeeded(loan) {
        if (!loan || !loan.active || loan.remainingDebt > 0) return;
        loan.active = false;
        loan.lastRealtimeTickAt = Date.now();
        if (Number(loan.principal) >= 1000000) {
            this.stats.rocketLargeLoansRepaid = Math.max(0, Number(this.stats.rocketLargeLoansRepaid) || 0) + 1;
            this.checkAchievements('rocketLargeLoansRepaid');
        }
        logMessage("💳 Dette Team Rocket remboursée. Prélèvement arrêté.");
    }

    rocketDeposit(amount) {
        const val = Math.max(0, Math.floor(Number(amount) || 0));
        if (val <= 0) return false;
        if (this.pokedollars < val) {
            logMessage("❌ Fonds insuffisants pour dépôt Team Rocket.");
            return false;
        }
        this.pokedollars -= val;
        const bank = this.teamRocketState.bank;
        bank.balance += val;
        if (!bank.lastInterestTickAt) bank.lastInterestTickAt = Date.now();
        logMessage(`🏦 Dépôt Team Rocket: ${formatNumber(val)}$.`);
        this.updatePlayerStatsDisplay();
        return true;
    }

    rocketWithdraw(amount) {
        const bank = this.teamRocketState.bank;
        const req = Math.max(0, Math.floor(Number(amount) || 0));
        if (req <= 0) return false;
        if (bank.balance < req) {
            logMessage("❌ Solde banque Team Rocket insuffisant.");
            return false;
        }
        bank.balance -= req;
        this.pokedollars += req;
        logMessage(`🏦 Retrait Team Rocket: ${formatNumber(req)}$.`);
        this.updatePlayerStatsDisplay();
        return true;
    }

    tickRocketBank(now = Date.now()) {
        const tr = this.teamRocketState;
        if (!tr || !tr.bank) return;
        const bank = tr.bank;
        const loan = tr.loan || {};
        const lastTick = Number(bank.lastInterestTickAt) || now;
        const elapsedMs = Math.max(0, now - lastTick);
        if (elapsedMs < 60000) return;
        const ticks = Math.floor(elapsedMs / 60000);
        bank.lastInterestTickAt = lastTick + (ticks * 60000);
        if (bank.balance <= 0) return;

        const trustLevel = Math.max(1, Math.floor(Number(tr.trustLevel) || 1));
        const perMinuteRate = (trustLevel / 100) / 60;
        const carry = Math.max(0, Number(bank.interestCarry) || 0);
        const totalGain = (bank.balance * perMinuteRate * ticks) + carry;
        const gain = Math.floor(totalGain);
        bank.interestCarry = Math.max(0, totalGain - gain);
        if (gain <= 0) return;

        if (bank.autoInjectInterests) {
            bank.balance += gain;
        } else {
            this.pokedollars += gain;
        }
        bank.accruedUnclaimed += gain;
        bank.totalInterestGenerated += gain;
        this.stats.totalRocketBankInterestGained = (this.stats.totalRocketBankInterestGained || 0) + gain;
        this.checkAchievements('totalRocketBankInterestGained');
        tr.questProgress.interestsGenerated = (tr.questProgress.interestsGenerated || 0) + gain;

        if (loan.active && loan.remainingDebt > 0) {
            const autoDebtPay = Math.min(loan.remainingDebt, Math.floor(gain * 0.15));
            if (autoDebtPay > 0) {
                loan.remainingDebt -= autoDebtPay;
                loan.repaidTotal += autoDebtPay;
                this.handleRocketLoanRepaidIfNeeded(loan);
            }
        }
    }

    addRocketTrustProgress(type, value, meta = {}) {
        const delta = Math.max(0, Math.floor(Number(value) || 0));
        if (delta <= 0) return;
        const tr = this.teamRocketState;
        if (type === 'capture') {
            const species = String(meta.species || '').toLowerCase();
            const isRocketSpecies = species === 'meowth' || species === 'miaouss' || species === 'persian';
            if (!isRocketSpecies) return;
            tr.questProgress.captures = (tr.questProgress.captures || 0) + delta;
        }
        if (type === 'staking') tr.questProgress.stakingCompleted = (tr.questProgress.stakingCompleted || 0) + delta;
        if (type === 'quest') tr.questProgress.teamRocketQuestsCompleted = (tr.questProgress.teamRocketQuestsCompleted || 0) + delta;
        if (type === 'spin') tr.questProgress.spins = (tr.questProgress.spins || 0) + delta;

        const weight = (type === 'capture') ? 2 : (type === 'quest' ? 40 : (type === 'spin' ? 1 : 25));
        tr.trustXp += Math.max(1, Math.floor(delta * weight));
        this.syncRocketTrustLevelFromXp();
    }

    syncRocketTrustLevelFromXp() {
        if (typeof ROCKET_TRUST_LEVELS === 'undefined') return;
        const tr = this.teamRocketState;
        let lvl = 1;
        Object.keys(ROCKET_TRUST_LEVELS).forEach(k => {
            const id = Number(k);
            if (tr.trustXp >= (ROCKET_TRUST_LEVELS[id].requiredXp || 0)) lvl = Math.max(lvl, id);
        });
        if (lvl > tr.trustLevel) {
            tr.trustLevel = lvl;
            logMessage(`📈 Confiance Team Rocket montée au niveau ${lvl}.`);
            this.refreshRocketContractsIfNeeded(true);
        } else {
            tr.trustLevel = lvl;
        }
        const prevBest = Math.max(1, Number(this.stats.rocketTrustLevelMax) || 1);
        if (lvl > prevBest) {
            this.stats.rocketTrustLevelMax = lvl;
            this.checkAchievements('rocketTrustLevelMax');
        } else if (!this.stats.rocketTrustLevelMax) {
            this.stats.rocketTrustLevelMax = lvl;
        }
    }

    getCreatureRocketSignature(creature) {
        if (!creature) return '';
        return [
            creature.name || '',
            creature.rarity || '',
            creature.level || 0,
            creature.isShiny ? 1 : 0,
            creature.ivHP || 0,
            creature.ivAttack || 0,
            creature.ivDefense || 0,
            creature.ivSpeed || 0
        ].join('|');
    }

    isCreatureRocketLocked(creature) {
        return false;
    }

    normalizeRocketStakingSession(raw) {
        if (!raw || typeof raw !== 'object') return null;
        const itemKey = String(raw.itemKey || '').trim();
        if (!itemKey) return null;
        const itemDef = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[itemKey]) ? ALL_ITEMS[itemKey] : null;
        const startedAt = Math.max(0, Number(raw.startedAt) || 0);
        const lastTickAt = Math.max(startedAt || Date.now(), Number(raw.lastTickAt) || Date.now());
        const tier = Math.max(1, Number(raw.tier) || 1);
        const multiplier = Math.max(1, Number(raw.multiplier) || Math.pow(2, tier - 1));
        const baseGps = Math.max(0, Number(raw.baseGps) || this.getRocketStakingBaseGps(itemKey));
        const currentGps = Math.max(0, Number(raw.currentGps) || (baseGps * multiplier));
        const cycleMs = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined' && Number(ROCKET_PUSH_STAKING_CONFIG.cycleMs) > 0)
            ? Number(ROCKET_PUSH_STAKING_CONFIG.cycleMs)
            : 30000;
        const nextPhaseEndAt = (raw.nextPhaseEndAt != null && Number(raw.nextPhaseEndAt) > 0)
            ? Number(raw.nextPhaseEndAt)
            : (lastTickAt + this.getRocketStakingRandomPhaseDurationMs());
        const currentPhaseDurationMs = (raw.currentPhaseDurationMs != null && Number(raw.currentPhaseDurationMs) > 0)
            ? Number(raw.currentPhaseDurationMs)
            : (nextPhaseEndAt > lastTickAt ? Math.max(1, nextPhaseEndAt - lastTickAt) : 30000);
        const nextRiskCheckCycle = Math.max(1, Number(raw.nextRiskCheckCycle) || (Math.floor(Math.max(0, Date.now() - startedAt) / cycleMs) + 1));
        return {
            itemKey,
            itemName: String(raw.itemName || (itemDef && itemDef.name) || itemKey),
            itemImg: String(raw.itemImg || (itemDef && itemDef.img) || ''),
            itemIcon: String(raw.itemIcon || (itemDef && itemDef.icon) || '📦'),
            category: this.getRocketStakingCategory(itemKey),
            baseGps,
            tier,
            multiplier,
            currentGps,
            startedAt,
            lastTickAt,
            accruedRJ: Math.max(0, Number(raw.accruedRJ) || 0),
            nextPhaseEndAt,
            currentPhaseDurationMs,
            nextRiskCheckCycle,
            tier8AchievementGranted: !!raw.tier8AchievementGranted,
            itemLocked: !!raw.itemLocked,
            dynamicRiskByTier: (raw.dynamicRiskByTier && typeof raw.dynamicRiskByTier === 'object')
                ? { ...raw.dynamicRiskByTier }
                : { 1: 1 }
        };
    }

    isRocketStakingItemLocked(itemKey) {
        const key = String(itemKey || '').trim();
        if (!key) return false;
        const tr = this.teamRocketState;
        const session = tr && tr.staking ? tr.staking.activeSession : null;
        return !!(session && String(session.itemKey || '') === key);
    }

    ensureRocketStakingItemLocked(session) {
        if (!session || !session.itemKey) return false;
        if (session.itemLocked) return true;
        const key = String(session.itemKey);
        const have = Math.max(0, Math.floor(Number(this.items && this.items[key]) || 0));
        if (have > 0) {
            this.items[key] = have - 1;
            if (this.items[key] <= 0) delete this.items[key];
        }
        session.itemLocked = true;
        this.updateItemsDisplay();
        return true;
    }

    getRocketStakingCategory(itemKey) {
        const itemDef = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[itemKey]) ? ALL_ITEMS[itemKey] : null;
        const rarity = String((itemDef && itemDef.rarity) || '').toLowerCase();
        if (rarity === 'legendary') return 'legendary';
        if (rarity === 'epic') return 'rare';
        if (rarity === 'rare') return 'uncommon';
        return 'common';
    }

    getRocketStakingBaseGps(itemKey) {
        const cfg = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined') ? ROCKET_PUSH_STAKING_CONFIG : null;
        const gpsByCategory = (cfg && cfg.gpsByCategory) ? cfg.gpsByCategory : {};
        const category = this.getRocketStakingCategory(itemKey);
        return Math.max(1, Number(gpsByCategory[category]) || 1);
    }

    getRocketStakingRandomPhaseDurationMs() {
        const cfg = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined') ? ROCKET_PUSH_STAKING_CONFIG : null;
        const min = (cfg && Number(cfg.phaseDurationMinMs) > 0) ? Number(cfg.phaseDurationMinMs) : 25000;
        const max = (cfg && Number(cfg.phaseDurationMaxMs) > 0) ? Number(cfg.phaseDurationMaxMs) : 35000;
        return min + Math.random() * (max - min);
    }

    getRocketStakingRandomMultiplier() {
        const cfg = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined') ? ROCKET_PUSH_STAKING_CONFIG : null;
        const min = (cfg && Number(cfg.multiplierMin) > 0) ? Number(cfg.multiplierMin) : 2;
        const max = (cfg && Number(cfg.multiplierMax) > 0) ? Number(cfg.multiplierMax) : 3;
        return min + Math.random() * (max - min);
    }

    getRocketStealRiskPercent(tier, session = null) {
        const level = Math.max(1, Math.floor(Number(tier) || 1));
        const riskCap = 95;
        if (!session || typeof session !== 'object') {
            return level === 1 ? 1 : riskCap;
        }
        if (!session.dynamicRiskByTier || typeof session.dynamicRiskByTier !== 'object') {
            session.dynamicRiskByTier = { 1: 1 };
        }
        session.dynamicRiskByTier[1] = 1;

        for (let i = 2; i <= level; i++) {
            if (session.dynamicRiskByTier[i] !== undefined) continue;
            const prev = Math.max(0.01, Number(session.dynamicRiskByTier[i - 1]) || 1);
            const randomFactor = 2 + Math.random();
            const next = Math.min(riskCap, prev * randomFactor);
            session.dynamicRiskByTier[i] = Math.max(0, Math.round(next * 100) / 100);
        }

        return Math.max(0, Math.min(100, Number(session.dynamicRiskByTier[level]) || 1));
    }

    getRocketStakeableItems(limit = 30) {
        const entries = Object.entries(this.items || {})
            .filter(([, amount]) => Number(amount) > 0)
            .map(([key, amount]) => {
                const itemDef = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[key]) ? ALL_ITEMS[key] : null;
                if (!itemDef) return null;
                const baseGps = this.getRocketStakingBaseGps(key);
                const category = this.getRocketStakingCategory(key);
                return {
                    key,
                    amount: Math.max(0, Math.floor(Number(amount) || 0)),
                    name: itemDef.name || key,
                    img: itemDef.img || '',
                    icon: itemDef.icon || '📦',
                    category,
                    baseGps
                };
            })
            .filter(Boolean);
        const categoryRank = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
        entries.sort((a, b) => {
            const byCategory = (categoryRank[a.category] ?? 99) - (categoryRank[b.category] ?? 99);
            if (byCategory !== 0) return byCategory;
            return a.name.localeCompare(b.name, 'fr');
        });
        return entries.slice(0, Math.max(1, Math.floor(Number(limit) || 30)));
    }

    getRocketOfferRotationMs() {
        const cfg = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined') ? ROCKET_PUSH_STAKING_CONFIG : null;
        return Math.max(600000, Number(cfg && cfg.offerRotationMs) || 600000);
    }

    refreshRocketStakeableOffers(now = Date.now(), force = false) {
        const tr = this.teamRocketState;
        if (!tr || !tr.staking) return [];
        const staking = tr.staking;
        const rotationMs = this.getRocketOfferRotationMs();
        const candidates = this.getRocketStakeableItems(999);
        const candidateMap = new Map(candidates.map(e => [e.key, e]));
        const validOffers = Array.isArray(staking.offeredItemKeys)
            ? staking.offeredItemKeys.filter(k => candidateMap.has(k)).slice(0, 3)
            : [];
        staking.offeredItemKeys = validOffers;

        if (!force && staking.activeSession) {
            return [];
        }

        const inCooldown = Number(staking.nextOfferRotateAt) > now;
        if (!force && validOffers.length === 0 && inCooldown) {
            return [];
        }

        const shouldRotate = force ||
            (validOffers.length === 0 && (!staking.nextOfferRotateAt || now >= staking.nextOfferRotateAt)) ||
            (validOffers.length > 0 && now >= staking.nextOfferRotateAt);
        if (shouldRotate) {
            const shuffled = candidates.slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = tmp;
            }
            staking.offeredItemKeys = shuffled.slice(0, 3).map(e => e.key);
            staking.nextOfferRotateAt = now + rotationMs;
        }
        return staking.offeredItemKeys
            .map(k => candidateMap.get(k))
            .filter(Boolean);
    }

    getRocketStakeableOfferItems(now = Date.now()) {
        const offers = this.refreshRocketStakeableOffers(now, false);
        return offers.slice(0, 3);
    }

    startRocketStake(itemKey) {
        const tr = this.teamRocketState;
        if (!tr || !tr.staking) return false;
        if (tr.staking.activeSession) {
            logMessage("❌ Une session de staking est déjà en cours.");
            return false;
        }
        const key = String(itemKey || '').trim();
        if (!key) return false;
        const offerKeys = this.getRocketStakeableOfferItems(Date.now()).map(e => e.key);
        if (!offerKeys.includes(key)) {
            logMessage("❌ Objet non disponible dans la rotation actuelle.");
            return false;
        }
        const have = Math.max(0, Math.floor(Number(this.items[key]) || 0));
        if (have < 1) {
            logMessage("❌ Objet indisponible dans l'inventaire.");
            return false;
        }
        const itemDef = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[key]) ? ALL_ITEMS[key] : null;
        if (!itemDef) {
            logMessage("❌ Objet incompatible avec le staking.");
            return false;
        }

        this.items[key] = have - 1;
        if (this.items[key] <= 0) delete this.items[key];

        const baseGps = this.getRocketStakingBaseGps(key);
        const now = Date.now();
        const phaseDurationMs = this.getRocketStakingRandomPhaseDurationMs();
        tr.staking.activeSession = {
            itemKey: key,
            itemName: itemDef.name || key,
            itemImg: itemDef.img || '',
            itemIcon: itemDef.icon || '📦',
            category: this.getRocketStakingCategory(key),
            baseGps,
            tier: 1,
            multiplier: 1,
            currentGps: baseGps,
            startedAt: now,
            lastTickAt: now,
            accruedRJ: 0,
            nextPhaseEndAt: now + phaseDurationMs,
            currentPhaseDurationMs: phaseDurationMs,
            nextRiskCheckCycle: 1,
            itemLocked: true,
            dynamicRiskByTier: { 1: 1 }
        };
        tr.staking.offeredItemKeys = [];
        tr.staking.nextOfferRotateAt = now + this.getRocketOfferRotationMs();
        logMessage(`🕶️ Staking lancé: ${itemDef.name || key} (${baseGps} RJ/s).`);
        this.updateItemsDisplay();
        return true;
    }

    updateRocketStakingPushSession(now = Date.now()) {
        const tr = this.teamRocketState;
        if (!tr || !tr.staking || !tr.staking.activeSession) return null;
        const session = tr.staking.activeSession;
        this.ensureRocketStakingItemLocked(session);
        const cfg = (typeof ROCKET_PUSH_STAKING_CONFIG !== 'undefined') ? ROCKET_PUSH_STAKING_CONFIG : null;
        const baseGps = Math.max(0, Number(session.baseGps) || 0);

        const elapsedMs = Math.max(0, now - Math.max(0, Number(session.lastTickAt) || now));
        if (elapsedMs > 0) {
            session.accruedRJ = Math.max(0, Number(session.accruedRJ) || 0) + (elapsedMs / 1000) * Math.max(0, Number(session.currentGps) || 0);
            session.lastTickAt = now;
        }

        if (session.nextPhaseEndAt == null || session.nextPhaseEndAt <= 0) {
            const phaseMs = this.getRocketStakingRandomPhaseDurationMs();
            session.nextPhaseEndAt = (session.startedAt || now) + phaseMs;
            session.currentPhaseDurationMs = phaseMs;
        }

        while (now >= session.nextPhaseEndAt) {
            const cycleTier = session.tier || 1;
            const riskPercent = this.getRocketStealRiskPercent(cycleTier, session);
            if (Math.random() < (riskPercent / 100)) {
                tr.staking.activeSession = null;
                tr.staking.stolenSessions = (tr.staking.stolenSessions || 0) + 1;
                const lostRJ = Math.max(0, Math.floor(session.accruedRJ || 0));
                tr.staking.lastStealFeedback = {
                    at: now,
                    itemName: session.itemName || session.itemKey || 'Objet',
                    lostRJ,
                    riskPercent,
                    tier: cycleTier
                };
                if (typeof toast !== 'undefined' && toast && typeof toast.error === 'function') {
                    toast.error("Vol Team Rocket", `${tr.staking.lastStealFeedback.itemName} volé ! ${lostRJ} RJ perdus.`);
                }
                if (session.category === 'legendary') {
                    this.stats.rocketStakingLegendaryStolen = Math.max(0, Number(this.stats.rocketStakingLegendaryStolen) || 0) + 1;
                    this.checkAchievements('rocketStakingLegendaryStolen');
                }
                logMessage(`🚨 Vol Team Rocket ! ${tr.staking.lastStealFeedback.itemName} perdu et ${lostRJ} RJ envolés.`);
                return { stolen: true, riskPercent, tier: cycleTier };
            }
            session.tier = (session.tier || 1) + 1;
            session.multiplier = Math.round((session.multiplier || 1) * this.getRocketStakingRandomMultiplier() * 100) / 100;
            session.currentPhaseDurationMs = this.getRocketStakingRandomPhaseDurationMs();
            session.nextPhaseEndAt += session.currentPhaseDurationMs;
        }

        const safeTier = Math.max(1, session.tier || 1);
        session.currentGps = baseGps * (session.multiplier || 1);
        session.nextRiskCheckCycle = safeTier + 1;

        if (safeTier >= 8 && !session.tier8AchievementGranted) {
            session.tier8AchievementGranted = true;
            this.stats.rocketStakingTier8Reached = Math.max(0, Number(this.stats.rocketStakingTier8Reached) || 0) + 1;
            this.checkAchievements('rocketStakingTier8Reached');
        }

        return { stolen: false };
    }

    dismissRocketStealFeedback() {
        const tr = this.teamRocketState;
        if (!tr || !tr.staking) return false;
        tr.staking.lastStealFeedback = null;
        return true;
    }

    recoverRocketStake() {
        const tr = this.teamRocketState;
        if (!tr || !tr.staking || !tr.staking.activeSession) {
            logMessage("❌ Aucune session de staking active.");
            return false;
        }
        this.updateRocketStakingPushSession(Date.now());
        const session = tr.staking.activeSession;
        if (!session) return false;
        this.ensureRocketStakingItemLocked(session);
        const reward = Math.max(0, Math.floor(Number(session.accruedRJ) || 0));
        const finalRisk = this.getRocketStealRiskPercent(session.tier || 1, session);
        tr.rj += reward;
        if (session.itemLocked) {
            this.items[session.itemKey] = Math.max(0, Math.floor(Number(this.items[session.itemKey]) || 0)) + 1;
        }
        tr.staking.activeSession = null;
        tr.staking.completedSessions = (tr.staking.completedSessions || 0) + 1;
        if ((session.tier || 1) >= 9) {
            this.stats.rocketStakingRecoveredTier9Plus = Math.max(0, Number(this.stats.rocketStakingRecoveredTier9Plus) || 0) + 1;
            this.checkAchievements('rocketStakingRecoveredTier9Plus');
        }
        if (finalRisk >= 50) {
            this.stats.rocketStakingRecoveredHighRisk = Math.max(0, Number(this.stats.rocketStakingRecoveredHighRisk) || 0) + 1;
            this.checkAchievements('rocketStakingRecoveredHighRisk');
        }
        this.refreshRocketStakeableOffers(Date.now(), false);
        this.addRocketTrustProgress('staking', 1);
        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('rocket_staking_completed');
        logMessage(`✅ Récupération sécurisée: +${reward} RJ et ${session.itemName} rendu.`);
        this.updateItemsDisplay();
        return true;
    }

    // Compatibilité: anciennes entrées sauvegardées / anciens appels.
    refreshRocketContractsIfNeeded() {
        const tr = this.teamRocketState;
        if (!tr || !tr.staking) return;
        if (!tr.staking.activeSession && Array.isArray(tr.staking.activeContracts) && tr.staking.activeContracts.length > 0) {
            const legacy = tr.staking.activeContracts[0];
            const key = legacy && legacy.lockedItem && legacy.lockedItem.key;
            if (key) {
                tr.staking.activeSession = this.normalizeRocketStakingSession({
                    itemKey: key,
                    itemName: key,
                    baseGps: this.getRocketStakingBaseGps(key),
                    startedAt: legacy.startAt || Date.now(),
                    lastTickAt: Date.now(),
                    accruedRJ: 0
                });
            }
        }
    }

    cleanupExpiredRocketStakes() {
        this.updateRocketStakingPushSession(Date.now());
    }

    refuseRocketContract() {
        return false;
    }

    getRocketCasinoPaylines() {
        return [
            { id: 1, coords: [[0, 0], [1, 0], [2, 0]], label: 'Ligne haute' },
            { id: 2, coords: [[0, 1], [1, 1], [2, 1]], label: 'Ligne centrale' },
            { id: 3, coords: [[0, 2], [1, 2], [2, 2]], label: 'Ligne basse' },
            { id: 4, coords: [[0, 0], [1, 1], [2, 2]], label: 'Diagonale descendante' },
            { id: 5, coords: [[0, 2], [1, 1], [2, 0]], label: 'Diagonale montante' },
            { id: 6, coords: [[0, 0], [0, 1], [0, 2]], label: 'Verticale gauche' },
            { id: 7, coords: [[1, 0], [1, 1], [1, 2]], label: 'Verticale centre' },
            { id: 8, coords: [[2, 0], [2, 1], [2, 2]], label: 'Verticale droite' }
        ];
    }

    rollRocketCasinoSymbol() {
        const cfg = ROCKET_CASINO_CONFIG;
        const symbols = Array.isArray(cfg && cfg.symbols) ? cfg.symbols : [];
        if (symbols.length === 0) return null;
        const totalWeight = symbols.reduce((sum, s) => sum + Math.max(0, Number(s.weight) || 0), 0) || 1;
        let r = Math.random() * totalWeight;
        for (const symbol of symbols) {
            r -= Math.max(0, Number(symbol.weight) || 0);
            if (r <= 0) return symbol;
        }
        return symbols[0];
    }

    generateRocketCasinoMatrix() {
        const matrix = [[], [], []];
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < 3; row++) {
                const symbol = this.rollRocketCasinoSymbol();
                matrix[col][row] = symbol ? symbol.key : 'zubat';
            }
        }
        return matrix;
    }

    evaluateRocketCasinoMatrix(matrix, activePaylines = 5) {
        const cfg = ROCKET_CASINO_CONFIG;
        const lineCost = Math.max(1, Math.floor(Number(cfg && cfg.lineCostRJ) || 250));
        const allPaylines = this.getRocketCasinoPaylines();
        const maxPaylines = allPaylines.length;
        const paylines = allPaylines.slice(0, Math.max(1, Math.min(maxPaylines, Math.floor(Number(activePaylines) || maxPaylines))));
        const symbolMap = Object.fromEntries((cfg.symbols || []).map(s => [s.key, s]));
        const winningLines = [];

        paylines.forEach(line => {
            const [aPos, bPos, cPos] = line.coords;
            const a = matrix[aPos[0]] && matrix[aPos[0]][aPos[1]];
            const b = matrix[bPos[0]] && matrix[bPos[0]][bPos[1]];
            const c = matrix[cPos[0]] && matrix[cPos[0]][cPos[1]];
            if (!a || !b || !c) return;
            if (a !== b || b !== c) return;
            const sym = symbolMap[a];
            winningLines.push({
                lineId: line.id,
                lineLabel: line.label,
                symbolKey: a,
                symbolId: sym && sym.id ? sym.id : null,
                coords: line.coords
            });
        });
        return { totalPayout: 0, winningLines, lineCost, linesPlayed: paylines.length };
    }

    pickRocketWeightedReward(pool) {
        const candidates = Array.isArray(pool) ? pool.filter(Boolean) : [];
        if (candidates.length === 0) return null;
        const totalWeight = candidates.reduce((sum, entry) => sum + Math.max(0, Number(entry.weight) || 0), 0) || 1;
        let r = Math.random() * totalWeight;
        for (const entry of candidates) {
            r -= Math.max(0, Number(entry.weight) || 0);
            if (r <= 0) return entry;
        }
        return candidates[0];
    }

    getRocketSlotRewardPool(symbolId) {
        if (typeof SLOT_REWARDS === 'undefined' || !Array.isArray(SLOT_REWARDS)) return [];
        return SLOT_REWARDS.filter(entry => entry && entry.symbolId === symbolId);
    }

    computeRocketCasinoScaledPokedollars(multiplier = 1) {
        const totalEarned = Math.max(0, Number(this.stats && this.stats.totalPokedollarsEarned) || 0);
        const base = Math.max(1800, Math.floor(totalEarned * 0.0018));
        const amount = Math.floor(base * Math.max(0.2, Number(multiplier) || 1));
        return Math.max(500, Math.min(5000000, amount));
    }

    resolveRocketCasinoLineRewards(win) {
        const symbolId = win && win.symbolId ? win.symbolId : null;
        if (!symbolId) return [];

        const pickFrom = (id, predicate = null) => {
            const pool = this.getRocketSlotRewardPool(id).filter(entry => (typeof predicate === 'function' ? predicate(entry) : true));
            return this.pickRocketWeightedReward(pool);
        };
        const rewards = [];
        const pushIf = (entry) => { if (entry) rewards.push({ ...entry }); };
        const pushScaledMoney = (id) => {
            const moneyReward = pickFrom(id, entry => entry.rewardType === 'currency' && entry.targetId === 'pokedollars_scaled');
            pushIf(moneyReward);
        };

        if (symbolId === 'ID_1') {
            pushScaledMoney('ID_1');
            return rewards;
        }

        if (symbolId === 'ID_2') {
            pushScaledMoney('ID_2');
            pushIf(pickFrom('ID_2', entry => entry.rewardType !== 'currency' || entry.targetId !== 'pokedollars_scaled'));
            return rewards;
        }

        if (symbolId === 'ID_3') {
            pushScaledMoney('ID_3');
            pushIf(pickFrom('ID_2', entry => entry.rewardType !== 'currency' || entry.targetId !== 'pokedollars_scaled'));
            pushIf(pickFrom('ID_3', entry => entry.rewardType === 'item'));
            return rewards;
        }

        if (symbolId === 'ID_4') {
            pushScaledMoney('ID_4');
            pushIf(pickFrom('ID_4', entry => entry.rewardType === 'item'));
            pushIf(pickFrom('ID_4', entry => entry.rewardType === 'quest_token' || (entry.rewardType === 'currency' && entry.targetId === 'marques_du_triomphe')));
            return rewards;
        }

        if (symbolId === 'ID_6') {
            pushScaledMoney('ID_1');
            pushScaledMoney('ID_2');
            pushScaledMoney('ID_4');
            pushScaledMoney('ID_6');
            pushIf(pickFrom('ID_2', entry => entry.rewardType !== 'currency' || entry.targetId !== 'pokedollars_scaled'));
            pushIf(pickFrom('ID_4', entry => entry.rewardType === 'item'));
            pushIf(pickFrom('ID_4', entry => entry.rewardType === 'quest_token' || (entry.rewardType === 'currency' && entry.targetId === 'marques_du_triomphe')));
            pushIf(pickFrom('ID_6', entry => entry.rewardType === 'item'));
            return rewards;
        }

        if (symbolId === 'ID_5') {
            // Miaouss jackpot: reprend les gains cumulés + bonus Giovanni + CT.
            pushScaledMoney('ID_1');
            pushScaledMoney('ID_2');
            pushScaledMoney('ID_4');
            pushScaledMoney('ID_5');
            pushIf(pickFrom('ID_2', entry => entry.rewardType !== 'currency' || entry.targetId !== 'pokedollars_scaled'));
            pushIf(pickFrom('ID_4', entry => entry.rewardType === 'item'));
            pushIf(pickFrom('ID_4', entry => entry.rewardType === 'quest_token' || (entry.rewardType === 'currency' && entry.targetId === 'marques_du_triomphe')));
            pushIf(pickFrom('ID_6', entry => entry.rewardType === 'item'));
            pushIf(pickFrom('ID_5', entry => entry.rewardType === 'item' && String(entry.targetId || '').startsWith('ct_')));
            pushIf(pickFrom('ID_5', entry => entry.rewardType === 'jackpot'));
            return rewards;
        }

        pushScaledMoney(symbolId);
        return rewards;
    }

    applyRocketCasinoRewards(rawRewards) {
        const rewards = Array.isArray(rawRewards) ? rawRewards : [];
        if (!this.items) this.items = {};
        const aggregated = {};

        const trustLevel = Math.max(1, Math.floor(Number(this.teamRocketState && this.teamRocketState.trustLevel) || 1));
        const trustScaledCurrency = { pokedollars_scaled: true, pokedollars: true, marques_du_triomphe: true, essence_dust: true };
        const trustScaledItems = { hyperball: true, greatball: true, time_dust_1h: true, prism_iv: true, time_dust_3h: true };

        rewards.forEach(entry => {
            if (!entry || !entry.rewardType) return;
            const rewardType = String(entry.rewardType);
            const targetId = String(entry.targetId || '');
            const sourceAmount = Math.max(0, Number(entry.amount) || 0);
            let amount = sourceAmount;
            if (rewardType === 'currency' && targetId === 'pokedollars_scaled') {
                amount = this.computeRocketCasinoScaledPokedollars(sourceAmount || 1);
            }
            if (amount <= 0 && rewardType !== 'jackpot') return;
            const isScaled = (rewardType === 'currency' && trustScaledCurrency[targetId])
                || (rewardType === 'quest_token' && targetId === 'quest_token')
                || (rewardType === 'item' && trustScaledItems[targetId]);
            if (isScaled) {
                amount = (rewardType === 'currency') ? (amount * trustLevel) : Math.floor(amount * trustLevel);
            }
            const key = `${rewardType}:${targetId || 'none'}`;
            if (!aggregated[key]) {
                aggregated[key] = { rewardType, targetId, amount: 0 };
            }
            aggregated[key].amount += amount;
        });

        const finalRewards = Object.values(aggregated);
        const rewardMessages = [];
        let jackpotCount = 0;

        finalRewards.forEach(reward => {
            const amount = Math.floor(Number(reward.amount) || 0);
            if (reward.rewardType === 'currency') {
                if (reward.targetId === 'pokedollars_scaled' || reward.targetId === 'pokedollars') {
                    this.pokedollars += amount;
                    this.stats.totalPokedollarsEarned = (this.stats.totalPokedollarsEarned || 0) + amount;
                    rewardMessages.push(`💰 +${formatNumber(amount)} Pokédollars`);
                } else if (reward.targetId === 'marques_du_triomphe') {
                    this.marquesDuTriomphe = (this.marquesDuTriomphe || 0) + amount;
                    rewardMessages.push(`🏅 +${formatNumber(amount)} Marques du Triomphe`);
                } else if (reward.targetId === 'essence_dust') {
                    this.essenceDust = (this.essenceDust || 0) + amount;
                    rewardMessages.push(`✨ +${formatNumber(amount)} Poussière d'essence`);
                }
            } else if (reward.rewardType === 'quest_token') {
                this.questTokens = (this.questTokens || 0) + amount;
                rewardMessages.push(`🎟️ +${formatNumber(amount)} Jetons de Quête`);
            } else if (reward.rewardType === 'item') {
                this.addItem(reward.targetId, amount, false);
                const itemDef = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS) ? ALL_ITEMS[reward.targetId] : null;
                const itemName = itemDef ? (itemDef.name || reward.targetId) : reward.targetId;
                rewardMessages.push(`🎁 +${formatNumber(amount)} ${itemName}`);
            } else if (reward.rewardType === 'jackpot') {
                jackpotCount++;
                rewardMessages.push("💎 JACKPOT MIAOUSS !");
            }
        });

        if (finalRewards.some(r => r.rewardType === 'currency' && (r.targetId === 'pokedollars_scaled' || r.targetId === 'pokedollars'))) {
            this.checkSpecialQuests('pokedollars_gained');
            this.checkAchievements('totalPokedollarsEarned');
        }
        return { finalRewards, rewardMessages, jackpotCount };
    }

    spinRocketSlot(linesPlayed = null) {
        if (typeof ROCKET_CASINO_CONFIG === 'undefined') return null;
        const cfg = ROCKET_CASINO_CONFIG;
        const maxPaylines = this.getRocketCasinoPaylines().length;
        const defaultLines = Math.max(1, Math.min(maxPaylines, Math.floor(Number(cfg.defaultActivePaylines) || maxPaylines)));
        const activeLines = Math.max(1, Math.min(maxPaylines, Math.floor(Number(linesPlayed) || defaultLines)));
        const lineCost = Math.max(1, Math.floor(Number(cfg.lineCostRJ) || 250));
        let totalStake = lineCost * activeLines;

        if (this.upgrades && this.upgrades.casinoRoyal) {
            const reduction = this.upgrades.casinoRoyal.level * 0.05;
            totalStake = Math.floor(totalStake * (1 - reduction));
        }

        if (this.teamRocketState.rj < totalStake) {
            logMessage(`❌ Pas assez de RJ (coût: ${formatNumber(totalStake)} RJ).`);
            return null;
        }

        const matrix = this.generateRocketCasinoMatrix();
        const evaluation = this.evaluateRocketCasinoMatrix(matrix, activeLines);
        const rewardsToApply = [];
        evaluation.winningLines.forEach(win => {
            rewardsToApply.push(...this.resolveRocketCasinoLineRewards(win));
        });

        this.teamRocketState.rj -= totalStake;
        this.teamRocketState.casino.stats.spins++;
        this.teamRocketState.casino.stats.rjSpent += totalStake;

        this.addRocketTrustProgress('spin', 1);
        this.stats.rocketCasinoSpins = (this.stats.rocketCasinoSpins || 0) + 1;
        this.checkAchievements('rocketCasinoSpins');
        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('rocket_spins');

        const appliedRewards = this.applyRocketCasinoRewards(rewardsToApply);
        if (appliedRewards.jackpotCount > 0) {
            this.teamRocketState.casino.stats.jackpots += appliedRewards.jackpotCount;
        }

        const pokedollarsGain = (appliedRewards.finalRewards || [])
            .filter(r => r.rewardType === 'currency' && (r.targetId === 'pokedollars_scaled' || r.targetId === 'pokedollars'))
            .reduce((sum, r) => sum + (Math.floor(Number(r.amount)) || 0), 0);

        if (appliedRewards.rewardMessages.length > 0) {
            logMessage(`🎰 Casino Rocket: ${appliedRewards.rewardMessages.join(' • ')}`);
        } else {
            logMessage("🎰 Casino Rocket: perdu.");
        }

        if (!this.teamRocketState.casino.history) this.teamRocketState.casino.history = [];
        this.teamRocketState.casino.history.unshift({
            at: Date.now(),
            stake: totalStake,
            pokedollarsGain,
            matrix: matrix.map(col => col.slice()),
            winningLines: evaluation.winningLines.map(w => ({ ...w })),
            rewards: appliedRewards.finalRewards.map(r => ({ ...r })),
            rewardMessages: appliedRewards.rewardMessages.slice()
        });
        this.teamRocketState.casino.history = this.teamRocketState.casino.history.slice(0, 12);

        return {
            matrix,
            winningLines: evaluation.winningLines,
            stake: totalStake,
            pokedollarsGain,
            rewards: appliedRewards.finalRewards,
            rewardMessages: appliedRewards.rewardMessages,
            lineCost,
            linesPlayed: activeLines
        };
    }

    getNumericInputValue(inputId, fallback = 0) {
        const el = document.getElementById(inputId);
        if (!el) return fallback;
        return Math.max(0, Math.floor(Number(el.value) || fallback));
    }

    handleRocketDeposit() {
        const amount = this.getNumericInputValue('rocketBankDepositInput', 0);
        this.rocketDeposit(amount);
        this.updateTeamRocketDisplay();
    }

    handleRocketWithdraw() {
        const amount = this.getNumericInputValue('rocketBankWithdrawInput', 0);
        this.rocketWithdraw(amount);
        this.updateTeamRocketDisplay();
    }

    handleRocketBankOptionsToggle() {
        this.rocketBankOptionsOpen = !this.rocketBankOptionsOpen;
        this.updateTeamRocketDisplay();
    }

    resetRocketBankInterestCounter() {
        const tr = this.teamRocketState;
        if (!tr || !tr.bank) return false;
        const bank = tr.bank;
        const currentDisplayBase = Math.max(0, Number(bank.totalInterestGenerated) || 0) + Math.max(0, Number(bank.interestCarry) || 0);
        bank.interestDisplayOffset = currentDisplayBase;
        logMessage("🧾 Affichage des intérêts cumulés réinitialisé (logique inchangée).");
        return true;
    }

    setRocketBankAutoInjectCombatHalf(enabled) {
        const tr = this.teamRocketState;
        if (!tr || !tr.bank) return false;
        tr.bank.autoInjectCombatHalf = !!enabled;
        logMessage(tr.bank.autoInjectCombatHalf
            ? "🏦 Option activée : 50% des gains de combat sont injectés en banque."
            : "🏦 Option désactivée : les gains de combat vont entièrement au solde principal.");
        return true;
    }

    setRocketBankAutoInjectInterests(enabled) {
        const tr = this.teamRocketState;
        if (!tr || !tr.bank) return false;
        tr.bank.autoInjectInterests = !!enabled;
        logMessage(tr.bank.autoInjectInterests
            ? "🏦 Option activée : les intérêts sont réinjectés en banque."
            : "🏦 Option désactivée : les intérêts vont au solde principal.");
        return true;
    }

    handleRocketResetInterestCounter() {
        this.resetRocketBankInterestCounter();
        this.updateTeamRocketDisplay();
    }

    handleRocketAutoInjectCombatHalfToggle(enabled) {
        this.setRocketBankAutoInjectCombatHalf(enabled);
        this.updateTeamRocketDisplay();
        this.updatePlayerStatsDisplay();
    }

    handleRocketAutoInjectInterestsToggle(enabled) {
        this.setRocketBankAutoInjectInterests(enabled);
        this.updateTeamRocketDisplay();
        this.updatePlayerStatsDisplay();
    }

    handleRocketTakeLoan() {
        const amount = this.getNumericInputValue('rocketLoanInput', 0);
        this.takeRocketLoan(amount);
        this.updateTeamRocketDisplay();
    }

    handleRocketStartContract(contractId) {
        this.startRocketStake(contractId);
        this.updateTeamRocketDisplay();
    }

    handleRocketRefuseContract() {
        this.updateTeamRocketDisplay();
    }

    openRocketContractSelection(contractId) {
        return this.startRocketStake(contractId);
    }

    handleRocketConfirmContractSelection(contractId) {
        const ok = this.startRocketStake(contractId);
        if (ok) this.updateTeamRocketDisplay();
        return ok;
    }

    handleRocketClaimContract() {
        this.recoverRocketStake();
        this.updateTeamRocketDisplay();
    }

    handleRocketRecoverStake() {
        this.recoverRocketStake();
        this.updateTeamRocketDisplay();
    }

    handleRocketDismissStealFeedback() {
        this.dismissRocketStealFeedback();
        this.updateTeamRocketDisplay();
    }

    handleRocketOpenCasinoModal() {
        if (typeof showRocketCasinoModalUI === 'function') {
            showRocketCasinoModalUI(this);
        }
    }

    handleRocketCasinoSpin() {
        const cfg = typeof ROCKET_CASINO_CONFIG !== 'undefined' ? ROCKET_CASINO_CONFIG : {};
        const maxPaylines = this.getRocketCasinoPaylines().length;
        const lines = Math.max(1, Math.min(maxPaylines, Math.floor(Number(cfg.defaultActivePaylines) || maxPaylines)));
        return this.handleRocketCasinoSpinAmount(lines);
    }

    handleRocketCasinoSpinAmount(linesPlayed = null) {
        const result = this.spinRocketSlot(linesPlayed);
        if (!document.getElementById('rocketCasinoOverlay')) {
            this.updateTeamRocketDisplay();
        }
        return result;
    }


    calculateTeamStats() {
        this.playerTeamStats = { hp: 0, attack: 0, spattack: 0, defense: 0, spdefense: 0, speed: 0 };

        // Étape 1 : On additionne d'abord les stats de base de chaque créature
        for (const creature of this.playerTeam) {
            this.playerTeamStats.hp += creature.maxHp;
            this.playerTeamStats.attack += creature.attack;
            this.playerTeamStats.spattack += creature.spattack;
            this.playerTeamStats.defense += creature.defense;
            this.playerTeamStats.spdefense += creature.spdefense;
            this.playerTeamStats.speed += creature.speed;
        }

        // Étape 2 : APRÈS avoir calculé le total, on applique le bonus d'Aura une seule fois
        const auraBonus = this.getTalentStackBonus('aura');
        if (auraBonus > 0) {
            this.playerTeamStats.attack = Math.floor(this.playerTeamStats.attack * (1 + auraBonus));
            this.playerTeamStats.spattack = Math.floor(this.playerTeamStats.spattack * (1 + auraBonus));
            this.playerTeamStats.defense = Math.floor(this.playerTeamStats.defense * (1 + auraBonus));
            this.playerTeamStats.spdefense = Math.floor(this.playerTeamStats.spdefense * (1 + auraBonus));
            this.playerTeamStats.speed = Math.floor(this.playerTeamStats.speed * (1 + auraBonus));
        }
    }


    calculatePensionStats() {
        const pensionContribution = { hp: 0, attack: 0, spattack: 0, defense: 0, spdefense: 0, speed: 0 };
        const pensionRate = this.getPensionTransferRate(); // C'est ici que le 1% par niveau est calculé

        if (pensionRate > 0) {
            for (const creature of this.pension) {
                pensionContribution.hp += Math.floor(creature.maxHp * pensionRate);
                pensionContribution.attack += Math.floor(creature.attack * pensionRate);
                pensionContribution.spattack += Math.floor(creature.spattack * pensionRate);
                pensionContribution.defense += Math.floor(creature.defense * pensionRate);
                pensionContribution.spdefense += Math.floor(creature.spdefense * pensionRate);
                pensionContribution.speed += Math.floor(creature.speed * pensionRate);
            }
        }
        return pensionContribution;
    }

    // OPTIMISATION : Calcul des stats avec prise en compte des Statuts (Nerf Paralysie)
    getEffectiveStats() {
        let hpBoost = 1;
        let attackBoost = 1;
        let spattackBoost = 1;
        let defenseBoost = 1;
        let spdefenseBoost = 1;
        let speedBoost = 1;

        // 1. Boosts temporaires (Potions)
        this.activeStatBoosts.forEach(boost => {
            if (boost.stat === 'all') {
                hpBoost += boost.value; attackBoost += boost.value; spattackBoost += boost.value; defenseBoost += boost.value; spdefenseBoost += boost.value; speedBoost += boost.value;
            } else if (boost.stat === 'hp') hpBoost += boost.value;
            else if (boost.stat === 'attack') attackBoost += boost.value;
            else if (boost.stat === 'spattack') spattackBoost += boost.value;
            else if (boost.stat === 'defense') defenseBoost += boost.value;
            else if (boost.stat === 'spdefense') spdefenseBoost += boost.value;
            else if (boost.stat === 'speed') speedBoost += boost.value;
        });

        // 2. Synergies d'équipe
        const synergies = this.getActiveSynergies();
        hpBoost += (synergies.max_hp_mult - 1);
        attackBoost += (synergies.attack_mult - 1);
        spattackBoost += (synergies.attack_mult - 1);
        defenseBoost += (synergies.defense_mult - 1);
        spdefenseBoost += (synergies.defense_mult - 1);
        speedBoost += (synergies.speed_mult ? synergies.speed_mult - 1 : 0);

        // 2.5 Bonus de collection (appliqué en multiplicateur de DEF/DEF SP)
        const collBonuses = this.getCollectionBonuses ? this.getCollectionBonuses() : {};
        const collDefense = collBonuses.defense_mult || 0;
        if (collDefense > 0) {
            defenseBoost += collDefense;
            spdefenseBoost += collDefense;
        }

        // 3. Objets Tenus (Par le Pokémon actif)
        if (this.currentPlayerCreature && this.currentPlayerCreature.heldItem) {
            const item = HELD_ITEMS[this.currentPlayerCreature.heldItem];
            if (item && item.effect) {
                if (item.effect.attack_mult) {
                    attackBoost += item.effect.attack_mult;
                    spattackBoost += item.effect.attack_mult;
                }
                if (item.effect.speed_mult) speedBoost += item.effect.speed_mult;
            }
        }

        // 4. Reliques de Tour
        if (this.towerState.isActive && this.towerState.buffs) {
            const buffs = this.towerState.buffs;
            if (buffs.attack_mult) {
                attackBoost *= buffs.attack_mult;
                spattackBoost *= buffs.attack_mult;
            }
            if (buffs.defense_mult) {
                defenseBoost *= buffs.defense_mult;
                spdefenseBoost *= buffs.defense_mult;
            }
            if (buffs.speed_mult) speedBoost *= buffs.speed_mult;
        }

        // 5. ✅ STATUTS DU POKÉMON ACTIF (C'est ici qu'on applique le nerf)
        if (this.currentPlayerCreature && this.currentPlayerCreature.hasStatusEffect()) {
            const type = this.currentPlayerCreature.statusEffect.type;

            // NERF : La paralysie réduit la vitesse de 25% (x0.75) au lieu de 50%
            if (type === STATUS_EFFECTS.PARALYZED) speedBoost *= 0.75;

            // BUFF : Enragé augmente la vitesse de 15%
            if (type === STATUS_EFFECTS.ENRAGED) speedBoost *= 1.15;
        }

        // --- SÉLECTION DE LA BASE DE STATS ---
        let baseHp, baseAttack, baseSpAttack, baseDefense, baseSpDefense, baseSpeed;

        if (this.arenaState.active && this.currentPlayerCreature) {
            // 🏟️ MODE ARÈNE : Stats Individuelles
            baseHp = this.currentPlayerCreature.maxHp;
            baseAttack = this.currentPlayerCreature.attack;
            baseSpAttack = this.currentPlayerCreature.spattack;
            baseDefense = this.currentPlayerCreature.defense;
            baseSpDefense = this.currentPlayerCreature.spdefense;
            baseSpeed = this.currentPlayerCreature.speed;
        } else {
            // 🌍 MODE ZONE : Stats du Compte
            baseHp = this.playerMainStats.hp;
            baseAttack = this.playerMainStats.attack;
            baseSpAttack = this.playerMainStats.spattack;
            baseDefense = this.playerMainStats.defense;
            baseSpDefense = this.playerMainStats.spdefense;
            baseSpeed = this.playerMainStats.speed;
        }

        // Calcul final
        return {
            hp: Math.floor(baseHp * hpBoost),
            attack: Math.floor(baseAttack * attackBoost),
            spattack: Math.floor(baseSpAttack * spattackBoost),
            defense: Math.floor(baseDefense * defenseBoost),
            spdefense: Math.floor(baseSpDefense * spdefenseBoost),
            speed: Math.floor(baseSpeed * speedBoost)
        };
    }

    updateStatBoosts() {
        const now = Date.now();

        // Retirer les boosts expirés
        this.activeStatBoosts = this.activeStatBoosts.filter(boost => {
            if (boost.endTime <= now) {
                logMessage(`⏱️ Boost ${boost.stat.toUpperCase()} expiré!`);
                return false;
            }
            return true;
        });

        this.updateStatBoostsDisplay();
    }

    // UTILITAIRE : Trouve le type (Sans crasher)
    findTypeForPokemon(name) {
        if (!name) return 'normal'; // Fallback ultime

        // Recherche dans POKEMON_BASE_STATS (si le type y est stocké, ce qui serait mieux)
        // Sinon, on cherche dans les pools par rareté comme avant

        for (const [rarity, pool] of Object.entries(POKEMON_POOL)) {
            for (const [type, names] of Object.entries(pool)) {
                if (names.includes(name)) return type;
            }
        }

        // Si non trouvé (cas des nouveaux pokémons gen 4 non classés), on renvoie normal pour ne pas crasher
        // Idéalement, il faudrait une table POKEMON_TYPES complète.
        console.warn(`Type inconnu pour ${name}, défaut: normal`);
        return 'normal';
    }


    toggleRarePause() {
        this.pauseOnRare = !this.pauseOnRare;
        this.saveGame();

        const state = this.pauseOnRare ? "ACTIVÉE" : "DÉSACTIVÉE";
        const color = this.pauseOnRare ? "success" : "error"; // Rouge pour dire "Danger"

        if (typeof toast !== 'undefined') {
            if (this.pauseOnRare) toast.success("Sécurité Activée", "Le jeu s'arrêtera sur les Shinies/Légendaires.");
            else toast.error("Mode Tueur", "Le jeu TUERA les Shinies/Légendaires en mode AFK !");
        }

        this.openSaveManager();
        this.updateOptionButtons();
    }






    createBoss() {
        return typeof createBossLogic === 'function' ? createBossLogic(this) : null;
    }

    createEpic() {
        return typeof createEpicLogic === 'function' ? createEpicLogic(this) : null;
    }

    processCombatTurn() {
        if (!this.currentPlayerCreature || !this.currentEnemy) return;

        // --- 🛡️ SÉCURITÉ ANTI-BUG (Auto-Fix) ---
        // Si la jauge n'existe pas ou est NaN, on la force à 0 immédiatement
        if (typeof this.currentPlayerCreature.actionGauge !== 'number' || isNaN(this.currentPlayerCreature.actionGauge)) {
            this.currentPlayerCreature.actionGauge = 0;
        }
        if (typeof this.currentEnemy.actionGauge !== 'number' || isNaN(this.currentEnemy.actionGauge)) {
            this.currentEnemy.actionGauge = 0;
        }

        // --- 1. Gestion du Temps (Delta Time) ---
        const now = Date.now();
        // ⚠ Ancien système ATB supprimé.
        // La logique de jauge d'action et de résolution de tour est désormais
        // centralisée dans `combatSystem.updateATBLogic(game, deltaTime)`.
    }

    simulateCombat() {
        // 1. Sélection ou récupération du combattant
        if (!this.currentPlayerCreature || !this.currentPlayerCreature.isAlive()) {
            this.currentPlayerCreature = this.getFirstAliveCreature();
            if (!this.currentPlayerCreature) return null;
        }

        // --- SÉCURITÉ 1 : Reset des PV Virtuels du Joueur ---
        // On s'assure que la créature commence avec ses PV actuels (ou Max selon ta logique)
        // Ici on suppose qu'elle commence Full vie pour la simulation simplifiée, 
        // ou alors this.currentPlayerCreature.currentHp si tu veux gérer l'usure entre les combats simulés.
        // Pour le rattrapage, le plus simple/juste est de dire qu'elle commence Full HP grâce au Heal post-combat.
        this.currentPlayerCreature.mainAccountCurrentHp = this.currentPlayerCreature.maxHp;

        // 2. Gestion Ennemi (Boss et Épiques autorisés en simulation : stats déjà augmentées via zoneMultiplier)
        const enemy = this.getOrCreateEnemy();

        // --- SÉCURITÉ 2 : Reset des PV de l'Ennemi (CRUCIAL) ---
        // Si l'objet 'enemy' est réutilisé par le cache, il faut le soigner !
        enemy.currentHp = enemy.maxHp;

        // Sauvegarde du contexte
        const previousEnemy = this.currentEnemy;
        this.currentEnemy = enemy;

        // --- 3. Initialisation des Stats (AVANT la boucle) ---
        // On récupère les stats de la créature ACTUELLE
        let currentStats = this.getEffectiveStats();
        let playerSpeed = currentStats.speed;
        let hasRobustesse = this.currentPlayerCreature.passiveTalent === 'robustesse';

        // ATB
        let simPlayerGauge = 0;
        let simEnemyGauge = 0;
        const threshold = 10000;
        const enemySpeed = enemy.speed;

        let turns = 0;
        const maxTurns = 200;

        // --- 4. Boucle de Combat ---
        while (turns < maxTurns) {
            turns++;

            // Saut temporel
            const ticksToPlayer = Math.max(0, threshold - simPlayerGauge) / playerSpeed;
            const ticksToEnemy = Math.max(0, threshold - simEnemyGauge) / enemySpeed;
            const timeJump = Math.min(ticksToPlayer, ticksToEnemy);

            simPlayerGauge += playerSpeed * timeJump + 0.01;
            simEnemyGauge += enemySpeed * timeJump + 0.01;

            // --- TOUR JOUEUR ---
            if (simPlayerGauge >= threshold) {
                simPlayerGauge -= threshold;
                const playerMoveName = this.currentPlayerCreature.getMove ? this.currentPlayerCreature.getMove() : 'Charge';
                const playerMove = MOVES_DB[playerMoveName];
                const dmg = this.calculateSimulatedDamageForCatchup(
                    currentStats.attack, // Utilise la stat mise à jour
                    enemy.defense,
                    this.currentPlayerCreature.type,
                    enemy.type,
                    true,
                    hasRobustesse,
                    playerMove.power
                );
                enemy.currentHp -= dmg;

                if (enemy.currentHp <= 0) {
                    const result = this.processSimulatedVictory(enemy);
                    this.currentEnemy = previousEnemy;
                    return result;
                }
                continue;
            }

            // --- TOUR ENNEMI ---
            if (simEnemyGauge >= threshold) {
                simEnemyGauge -= threshold;
                const enemyMoveName = enemy.getMove ? enemy.getMove() : 'Charge';
                const enemyMove = MOVES_DB[enemyMoveName];
                const dmg = this.calculateSimulatedDamageForCatchup(
                    enemy.attack,
                    currentStats.defense, // Utilise la stat mise à jour
                    enemy.type,
                    this.currentPlayerCreature.type,
                    false,
                    false,
                    enemyMove.power
                );

                this.currentPlayerCreature.mainAccountCurrentHp -= dmg;

                if (this.currentPlayerCreature.mainAccountCurrentHp <= 0) {
                    // KO
                    this.faintedThisCombat.add(this.activeCreatureIndex);

                    // Swap
                    this.currentPlayerCreature = this.getFirstAliveCreature();

                    if (!this.currentPlayerCreature) {
                        this.processSimulatedDefeat();
                        this.currentEnemy = previousEnemy;
                        return null;
                    }

                    // Setup nouvelle créature
                    this.currentPlayerCreature.mainAccountCurrentHp = this.currentPlayerCreature.maxHp;
                    this.activeCreatureIndex = this.playerTeam.indexOf(this.currentPlayerCreature);
                    simPlayerGauge = 0;

                    // --- SÉCURITÉ 3 : Mise à jour des Stats après Swap ---
                    currentStats = this.getEffectiveStats();
                    playerSpeed = currentStats.speed;
                    hasRobustesse = this.currentPlayerCreature.passiveTalent === 'robustesse';
                }
            }
        }

        // Timeout
        this.processSimulatedDefeat();
        this.currentEnemy = previousEnemy;
        return null;
    }


    calculateSimulatedDamage(attack, defense, attackerType, defenderType, isPlayer, movePower = 50) {
        // 1. Efficacité des types (avec double type si disponible)
        let effectiveness = TYPE_EFFECTIVENESS[attackerType]?.[defenderType] || 1;

        // Si la cible a un type secondaire, multiplier aussi
        if (!isPlayer && this.currentEnemy && this.currentEnemy.secondaryType) {
            const secondaryEffectiveness = TYPE_EFFECTIVENESS[attackerType]?.[this.currentEnemy.secondaryType] || 1;
            effectiveness *= secondaryEffectiveness;
        }

        // 2. STAB (Same Type Attack Bonus)
        let stab = 1.0;
        if (isPlayer && this.currentPlayerCreature) {
            // Vérifier si l'attaque correspond au type primaire ou secondaire
            const hasStab = this.currentPlayerCreature.type === attackerType ||
                (this.currentPlayerCreature.secondaryType && this.currentPlayerCreature.secondaryType === attackerType);

            if (hasStab) {
                stab = 1.2;

                // Maître Élémentaire (+20% de bonus STAB)
                if (game) {
                    const maitreBonus = game.getTalentStackBonus('maitre');
                    if (maitreBonus > 0) {
                        stab = 1.2 * (1 + maitreBonus); // 1.2 * 1.2 = 1.44 pour 1 Maître
                    }
                }
            }
        }

        // 3. Talents de compte (badges d'arène) + Bonus de collection
        let damageMultiplier = 1.0;
        if (isPlayer) {
            const collDmg = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).damage_mult || 0;
            damageMultiplier = 1 + this.getAccountTalentBonus('damage_mult') + collDmg;
        } else {
            // Resilience: -5% dégâts reçus
            damageMultiplier = 1 - this.getAccountTalentBonus('damage_reduction');
        }

        const multiplier = effectiveness * stab * damageMultiplier;

        const power = movePower || 50;
        const rawDamage = attack * (power / 100) * multiplier;

        const mitigationRatio = attack / (attack + (defense * 1.5) + 1);

        let finalDamage = Math.floor(rawDamage * mitigationRatio);

        const minDamageFromPower = Math.max(1, Math.round(power / 20));
        return Math.max(minDamageFromPower, finalDamage);
    }

    calculateSimulatedDamageForCatchup(attack, defense, attackerType, defenderType, isPlayer, hasRobustesse, movePower = 50) {
        // 1. Efficacité des types
        let effectiveness = TYPE_EFFECTIVENESS[attackerType]?.[defenderType] || 1;

        // Type secondaire ennemi
        if (!isPlayer && this.currentEnemy && this.currentEnemy.secondaryType) {
            const secondaryEffectiveness = TYPE_EFFECTIVENESS[attackerType]?.[this.currentEnemy.secondaryType] || 1;
            effectiveness *= secondaryEffectiveness;
        }

        // 2. STAB
        let stab = 1.0;
        if (isPlayer && this.currentPlayerCreature) {
            const hasStab = this.currentPlayerCreature.type === attackerType ||
                (this.currentPlayerCreature.secondaryType && this.currentPlayerCreature.secondaryType === attackerType);

            if (hasStab) {
                stab = 1.2;
                const maitreBonus = this.getTalentStackBonus('maitre');
                if (maitreBonus > 0) {
                    stab = 1.2 * (1 + maitreBonus);
                }
            }
        }

        // 3. Pénalité Stamina
        let staminaMultiplier = 1.0;
        if (isPlayer && this.currentStamina <= 0 && !hasRobustesse) {
            staminaMultiplier = 0.5;
        }

        // 4. Talents de compte + Bonus de collection
        let accountDamageMultiplier = 1.0;
        if (isPlayer) {
            const collDmg = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).damage_mult || 0;
            accountDamageMultiplier = 1 + this.getAccountTalentBonus('damage_mult') + collDmg;
        } else {
            accountDamageMultiplier = 1 - this.getAccountTalentBonus('damage_reduction');
        }

        // 5. Multipliers
        const multiplier = effectiveness * stab * staminaMultiplier * accountDamageMultiplier;

        // 6. Calcul Final
        const power = movePower || 50;
        const rawDamage = attack * (power / 100) * multiplier;

        const mitigationRatio = attack / (attack + (defense * 1.5) + 1);

        let finalDamage = Math.floor(rawDamage * mitigationRatio);

        const minDamageFromPower = Math.max(1, Math.round(power / 20));
        return Math.max(minDamageFromPower, finalDamage);
    }
    // OPTIMISATION : Victoire simulée (XP + Loot + AUTO-CATCH SILENCIEUX)
    processSimulatedVictory(enemy) {
        const isBoss = enemy.isBoss;
        const isEpic = enemy.isEpic;

        // --- 1. STATISTIQUES & SUCCÈS ---
        this.stats.combatsWon++;
        if (isBoss) {
            this.stats.bossDefeated++;
            if (this.zoneProgress[currentZone]) this.zoneProgress[currentZone].bossesDefeated++;
            this.checkSpecialQuests('bossDefeated');
        }
        if (isEpic) {
            this.stats.epicDefeated++;
            if (this.zoneProgress[currentZone]) this.zoneProgress[currentZone].epicsDefeated++;
            this.checkSpecialQuests('epicDefeated');
        }

        this.checkAchievements('combatsWon');
        this.checkAchievements('bossDefeated');
        this.checkAchievements('epicDefeated');

        // --- 2. XP (ratio Boss x50 / Épique x25 / standard x10, cf. COMBAT_FORMULAS.md) ---
        const expMultiplier = isBoss ? 50 : (isEpic ? 25 : 10);
        const baseExpGain = Math.floor(enemy.level * expMultiplier);
        const expGain = Math.floor(baseExpGain * this.getExpMultiplier());
        const teamTalents = this.playerTeam.filter(c => c.passiveTalent).map(c => c.passiveTalent);
        this.playerTeam.forEach(c => c.gainExp(expGain, teamTalents));

        // XP Pension (1%) — aligné sur finalizeCombat
        const pensionExpGain = Math.floor(expGain * 0.01);
        if (pensionExpGain > 0 && this.pension && this.pension.length > 0) {
            let pensionLeveledUp = false;
            this.pension.forEach(c => {
                if (c.gainExp(pensionExpGain, teamTalents)) pensionLeveledUp = true;
            });
            if (pensionLeveledUp) {
                this.updatePensionDisplay();
                this.incrementPlayerStats();
            }
        }

        // --- 3. ARGENT (Boss x5, Épique x2, aligné sur finalizeCombat) ---
        let pokedollars = Math.floor((currentZone * 20) + (Math.random() * currentZone * 10));
        if (isBoss) pokedollars *= 5;
        else if (isEpic) pokedollars *= 2;
        const collecteurBonus = this.getTalentStackBonus('collecteur');
        if (collecteurBonus > 0) pokedollars = Math.floor(pokedollars * (1 + collecteurBonus));
        const collGold = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).gold_mult || 0;
        const fortuneBonus = 1 + this.getAccountTalentBonus('pokedollars_mult') + collGold;
        let upgradeBonus = 0;
        if (this.upgrades && this.upgrades.prizeMoney) {
            upgradeBonus = this.upgrades.prizeMoney.level * 0.01;
        }
        pokedollars = Math.floor(pokedollars * (fortuneBonus + upgradeBonus));
        this.addCombatPokedollars(pokedollars, 'combat_simulated');

        // --- 4. TIERS (même logique que finalizeCombat : source de vérité = zoneProgress) ---
        const zone = ZONES[currentZone];
        const maxTier = (zone && zone.maxTier) || 50;
        if (!this.zoneProgress[currentZone].pokemonTiers) {
            this.zoneProgress[currentZone].pokemonTiers = {};
        }
        const currentTier = this.zoneProgress[currentZone].pokemonTiers[enemy.name] || 0;
        if (currentTier < maxTier) {
            this.zoneProgress[currentZone].pokemonTiers[enemy.name] = currentTier + 1;
        }

        // --- 5. ITEMS & OEUFS (DYNAMIQUE VIA ROLLITEMDROP) ---

        // Objet pour stocker le butin de CE combat (pour le rapport)
        let dropsInThisCombat = {};

        // A. Appel de la VRAIE fonction de drop
        // On passe 'true' pour dire que c'est une simulation
        // (L'item est ajouté à l'inventaire DANS rollItemDrop, on récupère juste son nom ici)
        const droppedItem = this.rollItemDrop(true);

        if (droppedItem) {
            dropsInThisCombat[droppedItem] = 1;
        }
        if (isBoss) {
            const tradeStoneDrop = this.tryDropTradeStone('Boss (Simulation)');
            if (tradeStoneDrop) {
                dropsInThisCombat[tradeStoneDrop] = (dropsInThisCombat[tradeStoneDrop] || 0) + 1;
            }
        }

        // Tickets de combat (mêmes taux qu'en online)
        if ((isBoss && Math.random() < 0.10) || (isEpic && Math.random() < 0.01)) {
            this.combatTickets++;
            logMessage("🎟️ Ticket de Combat trouvé !");
        }

        // Time Dust sur Boss (aligné sur finalizeCombat, mais compté dans le rapport)
        if (isBoss) {
            const timeDustDrop = this.tryDropTimeDust('Boss (Simulation)');
            if (timeDustDrop) {
                dropsInThisCombat[timeDustDrop] = (dropsInThisCombat[timeDustDrop] || 0) + 1;
            }
        }

        // B. Gestion Oeufs — alignée sur finalizeCombat
        if (isBoss) {
            // Boss : œuf garanti (rare/épique/légendaire) + chance d'œuf bonus
            let bossEggRarity = RARITY.RARE;
            const r = Math.random();
            if (r < 0.10) bossEggRarity = RARITY.LEGENDARY;
            else if (r < 0.55) bossEggRarity = RARITY.EPIC;
            this.addEgg(bossEggRarity);
            const bossEggKey = `egg_${bossEggRarity}`;
            dropsInThisCombat[bossEggKey] = (dropsInThisCombat[bossEggKey] || 0) + 1;

            // Chance d'œuf bonus (même logique que finalizeCombat)
            if (Math.random() < 0.5) {
                const bonusEggRarity = this.determineEggRarity();
                this.addEgg(bonusEggRarity);
                const bonusKey = `egg_${bonusEggRarity}`;
                dropsInThisCombat[bonusKey] = (dropsInThisCombat[bonusKey] || 0) + 1;
            }
        } else if (isEpic) {
            // Épique : œuf Rare garanti + chance d'œuf Epic
            const rareKey = `egg_${RARITY.RARE}`;
            this.addEgg(RARITY.RARE);
            dropsInThisCombat[rareKey] = (dropsInThisCombat[rareKey] || 0) + 1;

            if (Math.random() < 0.3) {
                const epicKey = `egg_${RARITY.EPIC}`;
                this.addEgg(RARITY.EPIC);
                dropsInThisCombat[epicKey] = (dropsInThisCombat[epicKey] || 0) + 1;
            }
        } else {
            // Standard : même formule qu'en online
            const baseEggChance = currentZone * 0.001 + 0.01;
            if (Math.random() < (baseEggChance + this.getEggDropBonus())) {
                const eggRarity = this.determineEggRarity();
                this.addEgg(eggRarity);

                const eggName = `egg_${eggRarity}`;
                dropsInThisCombat[eggName] = (dropsInThisCombat[eggName] || 0) + 1;
            }
        }

        // --- 6. AUTO-CATCH ---
        let capturedData = null;


        if (this.hasAutoCatcher) {
            const targets = [];
            if (Array.isArray(this.captureTargets)) targets.push(...this.captureTargets);
            if (this.captureTarget && !targets.includes(this.captureTarget)) targets.push(this.captureTarget);
            const s = this.autoCatcherSettings || {};
            const autoTargetsEnabled = s.enabled !== false;
            const autoShinyEnabled = s.catchShiny !== false;
            const inTargetMode = this.captureMode === 2;
            const targetMatches = targets.includes(enemy.name);
            const shinyOrRoamer = !!enemy.isShiny || !!enemy.isRoaming;
            const shouldCatchTarget = autoTargetsEnabled && inTargetMode && targetMatches;
            const shouldCatchShiny = autoShinyEnabled && shinyOrRoamer;
            if (!shouldCatchTarget && !shouldCatchShiny) {
                return {
                    xp: expGain,
                    money: pokedollars,
                    items: dropsInThisCombat,
                    captured: null
                };
            }

            if (shouldCatchTarget || shouldCatchShiny) {
                const ballType = 'pokeball';
                if ((this.items[ballType] || 0) > 0) {
                    const recycleLevel = (this.upgrades && this.upgrades.recycle) ? this.upgrades.recycle.level : 0;
                    const recycleChance = recycleLevel * 0.025; // 2.5% par niveau
                    if (Math.random() >= recycleChance) this.items[ballType]--;

                    const baseChance = (typeof CATCH_RATES !== 'undefined' ? CATCH_RATES[enemy.rarity] : 0.1) || 0.1;
                    const ballMult = (typeof BALLS !== 'undefined' ? BALLS[ballType].catchMult : 1);

                    if (Math.random() < (baseChance * ballMult)) {
                        this.stats.creaturesObtained++;
                        this.addRocketTrustProgress('capture', 1, { species: enemy.name });

                        // Création
                        const capturedCreature = new Creature(enemy.name, enemy.type, enemy.level, enemy.rarity, false, enemy.isShiny, enemy.secondaryType);
                        capturedCreature.ivHP = enemy.ivHP; capturedCreature.ivAttack = enemy.ivAttack;
                        capturedCreature.ivSpAttack = enemy.ivSpAttack; capturedCreature.ivSpDefense = enemy.ivSpDefense;
                        capturedCreature.ivDefense = enemy.ivDefense; capturedCreature.ivSpeed = enemy.ivSpeed;
                        capturedCreature.recalculateStats();

                        const existing = this.findCreatureByName(capturedCreature.name, capturedCreature.isShiny);
                        if (existing) {
                            this.processFusion(capturedCreature, existing);
                        } else {
                            this.storage.push(capturedCreature);
                            const key = capturedCreature.name + "_" + capturedCreature.type + "_" + capturedCreature.rarity;
                            if (!this.pokedex[key]) {
                                this.pokedex[key] = { discovered: true, count: 1, name: capturedCreature.name, type: capturedCreature.type, rarity: capturedCreature.rarity };
                            }
                        }
                        // Capture réussie pour le rapport
                        capturedData = { name: enemy.name, shiny: enemy.isShiny };
                    }
                }
            }
        }

        // --- 7. RETOUR DES RÉSULTATS ---
        return {
            xp: expGain,
            money: pokedollars,
            items: dropsInThisCombat, // Contient l'item réel des rates + l'oeuf éventuel
            captured: capturedData
        };
    }


    processSimulatedDefeat() {
        this.stats.combatsLost++;
        // Pas de pénalité supplémentaire en simulation
    }

    // performAttackWithBonus -> logique déplacée vers combatSystem.js
    performAttackWithBonus(attacker, target, playerMainStats, isPlayerAttacking, hasMaitreElementaire) {
        return typeof performAttackWithBonusLogic === 'function' ? performAttackWithBonusLogic(this, attacker, target, playerMainStats, isPlayerAttacking, hasMaitreElementaire) : false;
    }

    // Helper pour gérer le soin (utilisé par DAMAGE_AND_STATUS et autres)
    applyHeal(creature, amountOrPercent) {
        if (!creature || !creature.isAlive()) return;

        let healAmount = 0;

        // Gestion Pourcentage (0.5) vs Fixe (500)
        if (amountOrPercent <= 1) {
            healAmount = Math.floor(creature.maxHp * amountOrPercent);
        } else {
            healAmount = Math.floor(amountOrPercent);
        }

        // Application
        const oldHp = creature.currentHp;
        creature.currentHp = Math.min(creature.maxHp, creature.currentHp + healAmount);

        // Mise à jour de la variable de sauvegarde si c'est le joueur principal (et pas un clone/invocation)
        if (creature.mainAccountCurrentHp !== undefined) {
            creature.mainAccountCurrentHp = creature.currentHp;
        }

        // Feedback
        const actualHeal = creature.currentHp - oldHp;
        if (actualHeal > 0) {
            logMessage(`💚 ${creature.name} récupère ${formatNumber(actualHeal)} PV!`);

            // Texte flottant (Si disponible)
            const containerId = creature.isEnemy ? 'enemySpriteContainer' : 'playerSpriteContainer';
            const container = document.getElementById(containerId);
            if (container && window.showFloatingText) {
                window.showFloatingText(`+ ${formatNumber(actualHeal)}`, container, 'ft-heal');
            }

            this.updateCombatDisplay();
        }
    }

    // ✅ AJOUTER CETTE FONCTION MANQUANTE DANS LA CLASSE GAME

    activateUltimate() {
        const creature = this.currentPlayerCreature;
        if (!creature) return;

        const ult = creature.ultimateAbility;
        if (!ult) return;

        if (creature.ultimateCharge < ult.chargeNeeded) {
            logMessage("Charge insuffisante !");
            return;
        }

        if (creature.ultimateActive) {
            logMessage("L'ultime est déjà actif !");
            return;
        }

        logMessage(`⚡ ${creature.name} utilise son ultime : ${ult.name}!`);
        creature.ultimateCharge = 0; // Consomme la charge

        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('ultimateUsed');

        // Gérer les effets immédiats (ex: Soin)
        if (ult.effect.type === 'HEAL') {
            const maxHp = this.getPlayerMaxHp();
            const healAmount = Math.floor(maxHp * ult.effect.value);
            creature.mainAccountCurrentHp = Math.min(maxHp, creature.mainAccountCurrentHp + healAmount);
            logMessage(`💚 ${creature.name} se soigne de ${healAmount} PV!`);

        } else if (ult.effect.type === 'MULTI_BUFF') {
            ult.effect.status.forEach(statusEffect => {
                // Gérer le poison x3 de Gengar
                let sourceAtk = this.playerMainStats.attack;
                if (ult.effect.statusMult && ult.effect.statusMult > 1) {
                    sourceAtk *= ult.effect.statusMult;
                }
                creature.applyStatusEffect(statusEffect, sourceAtk);
                logMessage(`💥 ${creature.name} applique ${creature.getStatusEffectName()}!`);
            });

        } else if (ult.effect.type === 'APPLY_STATUS') {
            creature.applyStatusEffect(ult.effect.status, this.playerMainStats.attack);
            logMessage(`💥 ${creature.name} applique ${creature.getStatusEffectName()}!`);

        } else {
            // Si ce n'est pas un effet immédiat, on "arme" la prochaine attaque
            creature.ultimateActive = true;
        }

        this.updateCombatDisplay();
    }


    // winCombat -> logique déplacée vers combatSystem.js
    winCombat() {
        if (typeof winCombatLogic === 'function') winCombatLogic(this);
    }

    // Petite fonction utilitaire pour garder winCombat propre (si vous ne l'avez pas déjà)
    // handleSpecialModeVictory -> logique déplacée vers combatSystem.js
    handleSpecialModeVictory() {
        if (typeof handleSpecialModeVictoryLogic === 'function') handleSpecialModeVictoryLogic(this);
    }

    /**
     * Lance le chrono pour afficher l'infobulle.
     * @param {MouseEvent} event - L'événement de la souris.
     * @param {string} title - Le titre de l'objet.
     * @param {string} description - La description.
     */
    scheduleTooltip(event, title, description) {
        // 1. Annuler la fermeture programmée si la souris vient juste de "sortir" (Anti-clignotement)
        if (this.hideTooltipTimer) {
            clearTimeout(this.hideTooltipTimer);
            this.hideTooltipTimer = null;
        }

        // 2. Annuler tout autre chrono d'ouverture en attente
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
            this.tooltipTimer = null;
        }

        const x = event.clientX;
        const y = event.clientY;
        const tooltip = document.getElementById('customTooltip');
        if (!tooltip) return;

        // Fonction pour remplir et positionner le tooltip
        const showNow = () => {
            tooltip.innerHTML = `<span class="tooltip-title">${title}</span>${description}`;
            let left = x + 15;
            let top = y + 15;
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.style.display = 'block';
        };

        // 3. Si le tooltip est DÉJÀ affiché (ex: UI qui se rafraîchit sous la souris),
        // on l'actualise IMMÉDIATEMENT sans attendre les 300ms de confort.
        if (tooltip.style.display === 'block') {
            showNow();
        } else {
            // 4. Sinon (nouvel élément survolé), on utilise le Timer classique de lecture
            this.tooltipTimer = setTimeout(showNow, this.TOOLTIP_DELAY);
        }
    }

    /**
     * Cache l'infobulle et annule le timer en cours.
     * Utilise un debounce de 50ms pour ignorer les micro-sorties de souris (rafraîchissement DOM).
     */
    hideTooltip() {
        // Annuler toute ouverture programmée
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
            this.tooltipTimer = null;
        }

        // Lancer la fermeture avec 50ms de sursis
        if (!this.hideTooltipTimer) {
            this.hideTooltipTimer = setTimeout(() => {
                const tooltip = document.getElementById('customTooltip');
                if (tooltip) tooltip.style.display = 'none';
                this.hideTooltipTimer = null;
            }, 50);
        }
    }

    /**
     * Affiche l'infobulle pour voir l'apport de l'équipe principale
     */
    showTeamContributionTooltip(event) {
        const baseContribution = 0.10;
        const towerBonus = this.permanentBoosts.team_contribution || 0;
        const teamContributionRate = baseContribution + towerBonus;
        const vitaminBonus = {
            hp: 1 + (this.activeVitamins.hp || 0) + (this.activeVitamins.all || 0),
            attack: 1 + (this.activeVitamins.attack || 0) + (this.activeVitamins.all || 0),
            defense: 1 + (this.activeVitamins.defense || 0) + (this.activeVitamins.all || 0),
            speed: 1 + (this.activeVitamins.speed || 0) + (this.activeVitamins.all || 0)
        };

        const hpGain = (this.playerTeamStats.hp * teamContributionRate) * vitaminBonus.hp;
        const attackGain = (this.playerTeamStats.attack * teamContributionRate) * vitaminBonus.attack;
        const spAttackGain = (this.playerTeamStats.spattack * teamContributionRate) * vitaminBonus.attack;
        const defenseGain = (this.playerTeamStats.defense * teamContributionRate) * vitaminBonus.defense;
        const spDefenseGain = (this.playerTeamStats.spdefense * teamContributionRate) * vitaminBonus.defense;
        const speedGain = (this.playerTeamStats.speed * teamContributionRate) * vitaminBonus.speed;

        const headerFmt = (v) => typeof formatNumberHeader === 'function' ? formatNumberHeader(v) : (typeof formatNumber === 'function' ? formatNumber(v) : v);

        const desc = `Taux de Transfert : ${(teamContributionRate * 100).toFixed(0)}%\n\n` +
            `PV: <span style="color:#22c55e"><b>+${headerFmt(hpGain)}/s</b></span>\n` +
            `ATK: <span style="color:#22c55e"><b>+${headerFmt(attackGain)}/s</b></span>\n` +
            `ATK SP: <span style="color:#22c55e"><b>+${headerFmt(spAttackGain)}/s</b></span>\n` +
            `DEF: <span style="color:#22c55e"><b>+${headerFmt(defenseGain)}/s</b></span>\n` +
            `DEF SP: <span style="color:#22c55e"><b>+${headerFmt(spDefenseGain)}/s</b></span>\n` +
            `VIT: <span style="color:#22c55e"><b>+${headerFmt(speedGain)}/s</b></span>`;

        this.scheduleTooltip(event, "📈 Apport Équipe", desc);
    }

    /**
     * Affiche l'infobulle pour voir l'apport de la pension
     */
    showPensionContributionTooltip(event) {
        const pensionStats = this.calculatePensionStats(); // Gère déjà le taux de transfert (5%)
        const vitaminBonus = {
            hp: 1 + (this.activeVitamins.hp || 0) + (this.activeVitamins.all || 0),
            attack: 1 + (this.activeVitamins.attack || 0) + (this.activeVitamins.all || 0),
            defense: 1 + (this.activeVitamins.defense || 0) + (this.activeVitamins.all || 0),
            speed: 1 + (this.activeVitamins.speed || 0) + (this.activeVitamins.all || 0)
        };

        const hpGain = pensionStats.hp * vitaminBonus.hp;
        const attackGain = pensionStats.attack * vitaminBonus.attack;
        const spAttackGain = pensionStats.spattack * vitaminBonus.attack;
        const defenseGain = pensionStats.defense * vitaminBonus.defense;
        const spDefenseGain = pensionStats.spdefense * vitaminBonus.defense;
        const speedGain = pensionStats.speed * vitaminBonus.speed;

        const headerFmt = (v) => typeof formatNumberHeader === 'function' ? formatNumberHeader(v) : (typeof formatNumber === 'function' ? formatNumber(v) : v);

        // La pension utilise un taux fixe de 5% par défaut
        const desc = `Taux de Transfert: 5 %\n\n` +
            `PV: <span style="color:#22c55e"><b>+${headerFmt(hpGain)}/s</b></span>\n` +
            `ATK: <span style="color:#22c55e"><b>+${headerFmt(attackGain)}/s</b></span>\n` +
            `ATK SP: <span style="color:#22c55e"><b>+${headerFmt(spAttackGain)}/s</b></span>\n` +
            `DEF: <span style="color:#22c55e"><b>+${headerFmt(defenseGain)}/s</b></span>\n` +
            `DEF SP: <span style="color:#22c55e"><b>+${headerFmt(spDefenseGain)}/s</b></span>\n` +
            `VIT: <span style="color:#22c55e"><b>+${headerFmt(speedGain)}/s</b></span>`;

        this.scheduleTooltip(event, "📈 Apport Pension", desc);
    }

    // --- DÉBUT DES FONCTIONS DE CAPTURE À AJOUTER ---

    // OPTIMISATION : Capture UI avec Vrais Sprites & Nouveau Titre
    startCapturePhase() {
        // Sécurités
        if (this.towerState.isActive || this.arenaState.active || (typeof window.logMessage === 'function' && window.logMessage.toString() === 'function() {}')) {
            this.finalizeCombat(false);
            return;
        }

        this.combatState = 'capture';
        const enemy = this.currentEnemy;
        const modal = document.getElementById('captureModal');
        const content = modal.querySelector('.quest-completion-content');

        const baseChance = (typeof CATCH_RATES !== 'undefined' ? CATCH_RATES[enemy.rarity] : 0.1) || 0.1;
        const spriteUrl = getPokemonSpriteUrl(enemy.name, enemy.isShiny);

        // Construction des boutons de balles
        let ballsHTML = '';
        const ballTypes = ['pokeball', 'greatball', 'hyperball', 'masterball'];

        ballTypes.forEach(type => {
            const count = this.items[type] || 0;
            // On récupère la définition depuis notre constante BALLS
            const ballDef = (typeof BALLS !== 'undefined' && BALLS[type]) ? BALLS[type] : { name: type, catchMult: 1, img: '' };

            // Calcul du taux visuel
            let charmBonus = (this.currentPlayerCreature && this.currentPlayerCreature.passiveTalent === 'charmeur') ? 1.25 : 1.0;
            let visualRate = Math.min(100, baseChance * ballDef.catchMult * charmBonus * 100);
            if (type === 'masterball') visualRate = 100;

            // Couleur de la barre de chance
            let barColor = '#ef4444'; // Rouge
            if (visualRate > 30) barColor = '#f59e0b'; // Orange
            if (visualRate > 70) barColor = '#22c55e'; // Vert

            // L'Image de la Ball (Fallback sur l'emoji si pas d'image)
            const iconHTML = ballDef.img
                ? `<img src="${ballDef.img}" class="ball-icon-img" alt="${ballDef.name}">`
                : `<div class="ball-icon-large">${ballDef.icon || '🔴'}</div>`;

            ballsHTML += `
                <button class="ball-select-btn" onclick="game.tryCapture('${type}')" ${count === 0 ? 'disabled' : ''}>
                    <div class="ball-count-badge">x${count}</div>
                    ${iconHTML}
                    <div style="font-weight:bold; font-size:12px; margin-bottom:2px;">${ballDef.name}</div>
                    <div style="font-size:11px; color:#666;">${visualRate.toFixed(0)}%</div>
                    <div class="capture-chance-bar">
                        <div class="capture-chance-fill" style="width:${visualRate}%; background:${barColor};"></div>
                    </div>
                </button>
            `;
        });

        // Contenu du Modal
        content.innerHTML = `
            <div class="quest-completion-title" style="color: #3b82f6; margin-bottom:15px;">Capture</div>
            <div class="capture-layout">
                <div class="capture-target-card rarity-${enemy.rarity}">
                    <div class="capture-scene">
                        <img src="${spriteUrl}" class="capture-sprite">
                    </div>
                    <div style="font-weight:800; font-size:16px; margin-top:10px;">${enemy.name}</div>
                    <span class="rarity-label ${enemy.rarity}" style="font-size:10px;">${enemy.rarity}</span>
                    <div style="font-size:11px; color:#666; margin-top:5px;">Niv. ${enemy.level}</div>
                </div>
                <div class="balls-grid">
                    ${ballsHTML}
                </div>
            </div>
            <button class="btn capture-flee-btn" onclick="game.skipCapture()">Fuir</button>
        `;

        modal.classList.add('show');
    }
    // OPTIMISATION : Cycle des modes avec Forçage de la Liste
    cycleCaptureMode() {
        // 0 (OFF) <-> 2 (TARGET) uniquement (mode ALL supprimé)
        this.captureMode = (this.captureMode === 0) ? 2 : 0;

        console.log("🔄 Changement mode : " + this.captureMode);

        // ✅ IMPORTANT : Si on passe en mode Cible (2), on remplit la liste IMMÉDIATEMENT
        if (this.captureMode === 2) {
            // On vérifie si la fonction existe avant de l'appeler
            if (this.updateCaptureTargetList) {
                this.updateCaptureTargetList();
            } else {
                console.error("❌ ERREUR : La fonction updateCaptureTargetList n'existe pas !");
            }
        }

        this.updateCaptureButtonDisplay();
    }



    /// UI : Mise à jour de la grille de cibles (Ton Design Grid)
    updateCaptureTargetList() {
        const grid = document.getElementById('captureTargetGrid');
        const wrapper = document.getElementById('captureTargetWrapper');
        const limitText = document.getElementById('captureTargetLimit');
        if (!grid || !wrapper) return;

        const zoneId = (typeof currentZone !== 'undefined') ? currentZone : 1;
        const zonePokemon = this.getReachablePokemonInZone(zoneId);

        // Initialisation du tableau si vide
        if (!this.captureTargets) this.captureTargets = [];
        // Migration de sécurité
        if (this.captureTarget && !this.captureTargets.includes(this.captureTarget)) {
            this.captureTargets.push(this.captureTarget);
        }

        // Affichage du nombre de slots disponibles
        const hasScope = (this.items['scope'] || 0) > 0;
        const maxSlots = hasScope ? 2 : 1;
        const currentSlots = this.captureTargets.length;
        if (limitText) {
            limitText.textContent = `${currentSlots}/${maxSlots} cible(s) sélectionnée(s)${hasScope ? ' (Jumelles actives)' : ''}`;
        }

        grid.innerHTML = '';

        if (!zonePokemon || zonePokemon.length === 0) {
            grid.innerHTML = '<div style="font-size:10px; color:#666; padding:10px;">Aucune cible</div>';
            return;
        }

        // Boucle d'affichage
        zonePokemon.forEach(name => {
            const slot = document.createElement('div');

            // ✅ CHANGEMENT ICI : On vérifie si le nom est dans le tableau
            const isSelected = this.captureTargets.includes(name);

            // On applique tes classes CSS exactes
            slot.className = isSelected ? 'target-slot selected' : 'target-slot';
            slot.setAttribute('data-name', name);

            const img = document.createElement('img');
            img.src = getPokemonSpriteUrl(name, false);
            slot.appendChild(img);

            // ✅ CHANGEMENT ICI : Au clic, on appelle la nouvelle fonction Toggle
            slot.onclick = () => {
                this.toggleCaptureTarget(name);
                // On ne manipule plus les classes manuellement ici, 
                // car toggleCaptureTarget va rappeler cette fonction entière pour tout redessiner proprement.
            };

            grid.appendChild(slot);
        });

        // Affichage du wrapper si mode Cible actif
        if (this.captureMode === 2) {
            wrapper.classList.add('show');
            wrapper.style.display = 'flex';
        }
    }
    // MODIFICATION : Sélection Multi-Cibles (Compatible avec ton design Grid)
    toggleCaptureTarget(name) {
        // 1. Initialisation / Migration vers un Tableau
        if (!this.captureTargets) this.captureTargets = [];
        // Si tu avais une ancienne cible unique qui traîne, on la récupère
        if (this.captureTarget && this.captureTargets.length === 0) {
            this.captureTargets.push(this.captureTarget);
            this.captureTarget = null;
        }

        // 2. Vérification Jumelles
        const hasScope = (this.items['scope'] || 0) > 0;
        const maxSlots = hasScope ? 2 : 1;

        const index = this.captureTargets.indexOf(name);

        if (index > -1) {
            // A. DÉJÀ SÉLECTIONNÉ -> On le retire (Désélection)
            this.captureTargets.splice(index, 1);
        } else {
            // B. NOUVELLE SÉLECTION
            if (this.captureTargets.length < maxSlots) {
                // Il y a de la place -> On ajoute
                this.captureTargets.push(name);
            } else {
                // C'est plein !
                if (maxSlots === 1) {
                    // Si 1 seul slot, on remplace l'ancien (ton comportement actuel)
                    this.captureTargets = [name];
                } else {
                    // Si 2 slots pleins, on avertit
                    if (typeof toast !== 'undefined') toast.warning("Jumelles Saturées", "Retirez une cible pour en ajouter une autre.");
                    return;
                }
            }
        }

        // 3. Mise à jour Visuelle
        this.updateCaptureTargetList();       // On redessine la grille avec les bonnes cases bleues
        this.updateCaptureButtonDisplay();    // On met à jour le texte du bouton principal
    }


    // OPTIMISATION : Mise à jour UI avec affichage FORCÉ du menu
    updateCaptureButtonDisplay() {
        const btn = document.getElementById('captureModeBtn');
        const wrapper = document.getElementById('captureTargetWrapper');

        if (!btn) return;

        // Reset
        btn.classList.remove('capture-off', 'capture-target');
        // Nettoyer l'ancien sprite s'il existe
        btn.style.removeProperty('--sprite-url');
        btn.classList.remove('has-sprite');

        if (wrapper && this.captureMode !== 2) {
            wrapper.classList.remove('show');
            wrapper.style.display = 'none';
        }

        // Application du Mode
        if (this.captureMode === 0) {
            // Mode OFF
            btn.classList.add('capture-off');
        }
        else if (this.captureMode === 2) {
            // Mode TARGET (ON)
            btn.classList.add('capture-target');

            const count = this.captureTargets ? this.captureTargets.length : 0;

            if (count === 0) {
                // Pas de cible sélectionnée
                btn.classList.remove('has-sprite');
            } else {
                // Au moins une cible sélectionnée - afficher le sprite
                const firstTarget = this.captureTargets[0];
                const spriteUrl = getPokemonSpriteUrl(firstTarget, false);

                btn.style.setProperty('--sprite-url', `url(${spriteUrl})`);
                btn.classList.add('has-sprite');

                // Si 2 cibles exactement, afficher les deux sprites
                if (count === 2) {
                    const secondTarget = this.captureTargets[1];
                    const spriteUrl2 = getPokemonSpriteUrl(secondTarget, false);
                    btn.style.setProperty('--sprite-url-2', `url(${spriteUrl2})`);
                    btn.setAttribute('data-count', '2');
                } else if (count > 2) {
                    // Plus de 2 cibles (ne devrait pas arriver avec limite à 2)
                    btn.setAttribute('data-count', count);
                } else {
                    // 1 seule cible
                    btn.removeAttribute('data-count');
                    btn.style.removeProperty('--sprite-url-2');
                }
            }

            // Forçage affichage du modal
            if (wrapper) {
                wrapper.style.display = 'flex';
                wrapper.classList.add('show');
            }
        }
    }


    /// tryCapture -> logique déplacée vers combatSystem.js
    async tryCapture(ballType, isBonusThrow = false) {
        if (typeof tryCaptureLogic === 'function') return tryCaptureLogic(this, ballType, isBonusThrow);
    }
    // Passe la capture
    skipCapture() {
        document.getElementById('captureModal').classList.remove('show');
        logMessage("Vous laissez l'ennemi partir.");
        this.finalizeCombat(false);
    }

    // triggerAutoCatch -> logique déplacée vers combatSystem.js
    triggerAutoCatch() {
        return typeof triggerAutoCatchLogic === 'function' ? triggerAutoCatchLogic(this) : false;
    }

    // UI : Mise à jour du panneau Auto-Catcher
    updateAutoCatcherUI() {
        const panel = document.getElementById('autoCatcherPanel');
        if (!panel) return;

        if (this.hasAutoCatcher) {
            panel.style.display = 'block';
            const enabledBtn = document.getElementById('ac-enabled');
            const shinyBtn = document.getElementById('ac-shiny');
            const s = this.autoCatcherSettings || {};
            const applyToggleVisual = (btn, on) => {
                if (!btn) return;
                const wasOn = btn.getAttribute('aria-pressed') === 'true';
                btn.classList.toggle('is-on', !!on);
                btn.classList.toggle('is-off', !on);
                btn.textContent = on ? 'ON' : 'OFF';
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
                // Petite pulse uniquement lors du passage OFF -> ON.
                if (on && !wasOn) {
                    btn.classList.remove('just-enabled');
                    void btn.offsetWidth; // force reflow to restart animation
                    btn.classList.add('just-enabled');
                }
            };
            applyToggleVisual(enabledBtn, s.enabled !== false);
            applyToggleVisual(shinyBtn, s.catchShiny !== false);
        } else {
            panel.style.display = 'none';
        }
    }

    toggleAutoCatch(setting) {
        if (!this.autoCatcherSettings || typeof this.autoCatcherSettings !== 'object') {
            this.autoCatcherSettings = { enabled: true, catchShiny: true };
        }
        if (setting === 'enabled') this.autoCatcherSettings.enabled = !(this.autoCatcherSettings.enabled !== false);
        if (setting === 'shiny') this.autoCatcherSettings.catchShiny = !(this.autoCatcherSettings.catchShiny !== false);
        this.updateAutoCatcherUI();
        this.saveGame(); // Sauvegarde la préférence
    }

    // Vérifie si une créature a 31 IV partout (ou le max de ton jeu)
    isCreaturePerfect(creature) {
        if (!creature.ivs) return false; // Sécurité
        // Vérifie que chaque stat (hp, attack, defense, speed, etc.) est à 31
        return Object.values(creature.ivs).every(ivValue => ivValue >= 31);
    }

    finalizeCombat(captured) {
        const enemy = this.currentEnemy;
        if (!enemy) return;

        // 1. Nettoyage (Statuts & Berserker)
        if (this.currentPlayerCreature) {
            this.currentPlayerCreature.clearStatusEffect();
            this.currentPlayerCreature.berserkStacks = 0;
        }

        // =================================================
        // CAS 1 : TOUR DE COMBAT
        // =================================================
        if (this.towerState.isActive) {
            // XP x15
            const expGain = Math.floor(enemy.level * 0.1 * this.getExpMultiplier());
            this.playerTeam.forEach(c => c.gainExp(expGain));

            // Marques
            this.marquesDuTriomphe = Number(this.marquesDuTriomphe) || 0;
            const floor = this.towerState.currentFloor;
            let marksWon = 1 + Math.floor(floor / 100);
            if (Math.random() < ((floor % 100) / 100)) marksWon++;

            if (marksWon > 0) {
                this.marquesDuTriomphe += marksWon;
                if (this.towerState.runStats) {
                    this.towerState.runStats.marksGained = (this.towerState.runStats.marksGained || 0) + marksWon;
                }
                if (document.getElementById('enemySpriteContainer')) {
                    window.showFloatingText(`+${marksWon} Ⓜ️`, document.getElementById('enemySpriteContainer'), 'ft-damage-enemy');
                }
            }

            // Boss de Tour (x10)
            if (floor % 10 === 0) {
                // Soin 30%
                this.playerTeam.forEach(c => {
                    if (c.isAlive()) {
                        const heal = Math.floor(c.maxHp * 0.30);
                        c.mainAccountCurrentHp = Math.min(this.getPlayerMaxHp(), (c.mainAccountCurrentHp || 0) + heal);
                        window.showFloatingText(`+${formatFloatingNumber(heal)}`, document.getElementById('playerSpriteContainer'), 'ft-heal');
                    }
                });

                const droppedItem = this.rollItemDrop();
                if (droppedItem && this.towerState.runStats) {
                    const stats = this.towerState.runStats;
                    stats.items = stats.items || {};
                    stats.items[droppedItem] = (stats.items[droppedItem] || 0) + 1;
                }
                const timeDustDrop = this.tryDropTimeDust('Boss Tour');
                if (timeDustDrop && this.towerState.runStats) {
                    const stats = this.towerState.runStats;
                    stats.items = stats.items || {};
                    stats.items[timeDustDrop] = (stats.items[timeDustDrop] || 0) + 1;
                }
                const tradeStoneDrop = this.tryDropTradeStone('Boss Tour');
                if (tradeStoneDrop && this.towerState.runStats) {
                    const stats = this.towerState.runStats;
                    stats.items = stats.items || {};
                    stats.items[tradeStoneDrop] = (stats.items[tradeStoneDrop] || 0) + 1;
                }

                let bossEggRarity = RARITY.RARE;
                const roll = Math.random();
                if (roll < 0.10) bossEggRarity = RARITY.LEGENDARY;
                else if (roll < 0.55) bossEggRarity = RARITY.EPIC;
                this.addEgg(bossEggRarity);
                if (this.towerState.runStats) {
                    const stats = this.towerState.runStats;
                    stats.eggs = stats.eggs || {};
                    stats.eggs[bossEggRarity] = (stats.eggs[bossEggRarity] || 0) + 1;
                }

                logMessage(`✨ MAÎTRE D'ÉTAGE VAINCU ! +${marksWon} Marques, Œuf ${bossEggRarity} & Soin !`);
                toast.success("Boss Tour Vaincu !", `+${marksWon} Ⓜ️, Œuf ${bossEggRarity} & Soin`);
            }

            // Étage suivant
            this.towerState.currentEnemyIndex++;
            if (this.towerState.currentEnemyIndex < this.towerState.enemyTeam.length) {
                this.currentEnemy = this.towerState.enemyTeam[this.towerState.currentEnemyIndex];
                this.combatState = 'starting';
                this.combatStartTime = Date.now();
                this.triggerAutoSelect();
            } else {
                this.nextTowerFloor();
            }

            this.updateTeamDisplay();
            this.updateCombatDisplay();
            return; // STOP
        }

        // =================================================
        // CAS 2 : ARÈNE
        // =================================================
        if (this.arenaState.active) {
            this.arenaState.currentChampionIndex++;
            if (this.arenaState.currentChampionIndex >= this.arenaState.championTeam.length) {
                this.winArena();
            } else {
                this.currentEnemy = this.arenaState.championTeam[this.arenaState.currentChampionIndex];
                this.currentEnemy.clearStatusEffect();
                logMessage("Le champion envoie " + this.currentEnemy.name + " !");
                this.combatState = 'fighting';
            }
            return; // STOP
        }

        // =================================================
        // CAS 3 : COMBAT DE ZONE (Standard)
        // =================================================

        if (!captured) logMessage(enemy.name + " est vaincu !");

        const zone = ZONES[currentZone];
        const isBoss = enemy.isBoss;
        const isEpic = enemy.isEpic;

        // Compteurs Boss/Epic
        if (isBoss) {
            this.stats.bossDefeated++;
            if (this.zoneProgress[currentZone]) this.zoneProgress[currentZone].bossesDefeated++;
            this.checkSpecialQuests('bossDefeated');
        }
        if (isEpic) {
            this.stats.epicDefeated++;
            if (this.zoneProgress[currentZone]) this.zoneProgress[currentZone].epicsDefeated++;
        }

        // 1. GAIN : POKÉDOLLARS
        let pokedollarsEarned = Math.floor((currentZone * 20) + (Math.random() * currentZone * 10));
        if (isBoss) pokedollarsEarned *= 5;
        else if (isEpic) pokedollarsEarned *= 2;

        // Bonus (Collecteur + Fortune)
        const collecteurBonus = this.getTalentStackBonus('collecteur');
        pokedollarsEarned = Math.floor(pokedollarsEarned * (1 + collecteurBonus));

        const collGold = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).gold_mult || 0;
        const fortuneBonus = 1 + this.getAccountTalentBonus('pokedollars_mult') + collGold;
        let upgradeBonus = 0;
        if (this.upgrades && this.upgrades.prizeMoney) {
            upgradeBonus = this.upgrades.prizeMoney.level * 0.01;
        }
        pokedollarsEarned = Math.floor(pokedollarsEarned * (fortuneBonus + upgradeBonus));

        const combatGold = this.addCombatPokedollars(pokedollarsEarned, 'combat');
        if (pokedollarsEarned > 0) {
            this.showUiFloatingText('headerStatMoney', `+${formatNumber(combatGold.creditedToWallet || combatGold.net)}$`, 'ft-money');
            if ((combatGold.injectedToBank || 0) > 0) {
                setTimeout(() => {
                    this.showUiFloatingText('headerStatMoney', `+${formatNumber(combatGold.injectedToBank)}$ banque`, 'ft-bank');
                }, 80);
            }
            if (combatGold.withheld > 0) {
                setTimeout(() => {
                    this.showUiFloatingText('headerStatMoney', `-${formatNumber(combatGold.withheld)}$ dette`, 'ft-debt');
                }, 120);
            }
        }

        // 2. GAIN : XP
        let expMultiplier = isBoss ? 50 : (isEpic ? 25 : 10);
        const baseExpGain = Math.floor(enemy.level * expMultiplier);
        const expGain = Math.floor(baseExpGain * this.getExpMultiplier());

        const teamTalents = this.playerTeam.filter(c => c.passiveTalent).map(c => c.passiveTalent);

        // XP Équipe
        let anyLeveledUp = false;

        this.playerTeam.forEach(c => { // Ici 'c' représente le Pokémon
            // Si le Pokémon gagne un niveau (gainExp retourne true)
            if (c.gainExp(expGain, teamTalents)) {
                anyLeveledUp = true;

                // ✅ VÉRIFICATION SUCCÈS (Déplacé ici, sur 'c')
                if (c.level > this.stats.highestLevelReached) {
                    this.stats.highestLevelReached = c.level;
                    this.checkAchievements('highestLevelReached');
                }

                // Suivi spécifique du starter pour la quête d'entraînement
                if (c.isStarter && typeof this.checkSpecialQuests === 'function') {
                    this.checkSpecialQuests('starter_level_up');
                }

                this.updateTeamPowerStat();
            }
        });

        if (anyLeveledUp) this.checkSpecialQuests('level_up');

        // XP Pension (1%)
        const pensionExpGain = Math.floor(expGain * 0.01);
        if (pensionExpGain > 0 && this.pension.length > 0) {
            let pensionLeveledUp = false;
            this.pension.forEach(c => {
                if (c.gainExp(pensionExpGain, teamTalents)) pensionLeveledUp = true;
            });
            if (pensionLeveledUp) {
                this.updatePensionDisplay();
                this.incrementPlayerStats();
            }
        }

        // 3. BUTIN (Tickets, Objets, Œufs)
        if ((isBoss && Math.random() < 0.10) || (isEpic && Math.random() < 0.01)) {
            this.combatTickets++;
            logMessage("🎟️ Ticket de Combat trouvé !");
        }

        this.rollItemDrop();
        if (isBoss) this.tryDropTimeDust('Boss');
        if (isBoss) this.tryDropTradeStone('Boss');

        // Drop Œufs
        let eggChance = 0;
        if (isBoss) {
            let rarity = RARITY.RARE;
            const r = Math.random();
            if (r < 0.10) rarity = RARITY.LEGENDARY;
            else if (r < 0.55) rarity = RARITY.EPIC;

            this.addEgg(rarity);
            logMessage(`🎁 Butin Boss : Œuf ${rarity} !`);

            // Chance double drop
            if (Math.random() < 0.5) {
                this.addEgg(this.determineEggRarity());
                logMessage("🎁 Œuf bonus !");
            }
        } else if (isEpic) {
            this.addEgg(RARITY.RARE);
            if (Math.random() < 0.3) {
                this.addEgg(RARITY.EPIC);
                logMessage("🎁 Butin Épique : Œuf Epic !");
            }
        } else {
            const baseEggChance = currentZone * 0.001 + 0.01;
            if (Math.random() < (baseEggChance + this.getEggDropBonus())) {
                this.addEgg(this.determineEggRarity());
            }
        }

        // 4. PROGRESSION (Tiers)
        const maxTier = zone.maxTier || 50;
        if (!this.zoneProgress[currentZone].pokemonTiers) {
            this.zoneProgress[currentZone].pokemonTiers = {};
        }
        const currentTier = this.zoneProgress[currentZone].pokemonTiers[enemy.name] || 0;
        if (currentTier < maxTier) {
            this.zoneProgress[currentZone].pokemonTiers[enemy.name] = currentTier + 1;
        }

        // Déblocage Zone Suivante
        const nextZone = parseInt(currentZone) + 1;
        if (this.isZoneMastered(currentZone)) {
            // Si on débloque une zone jamais atteinte
            if (nextZone > maxReachedZone && ZONES[nextZone]) {
                maxReachedZone = nextZone;
                logMessage(`🎉 NOUVELLE ZONE DÉBLOQUÉE : ${ZONES[nextZone].name} !`);
                toast.success("Progression", `Accès ouvert vers ${ZONES[nextZone].name}`);
                this.checkSpecialQuests('zone_unlocked');
                this.updateZoneSelector();
            }
        }
        this.updateZoneSelector();

        if (ZONES[nextZone] && !this.isZoneUnlocked(nextZone) && this.isZoneUnlocked(nextZone, true)) {
            logMessage(`✅ ZONE DÉBLOQUÉE : ${ZONES[nextZone].name} !`);
            this.updateZoneSelector();
        }

        // Stats de durée
        if (this.combatStartTime) {
            const duration = Date.now() - this.combatStartTime;
            if (!this.recentCombatDurations) this.recentCombatDurations = [];
            this.recentCombatDurations.push(duration);
            if (this.recentCombatDurations.length > 10) this.recentCombatDurations.shift();
        }

        // ... (dans finalizeCombat)

        // 1. Passage en état d'attente
        this.combatState = 'waiting';
        this.lastCombatTime = Date.now();
        this.currentEnemy = null;
        this.faintedThisCombat = new Set();

        // 2. Synchronisation et soin (important après une arène ou pour éviter les blocages UI)
        this.playerTeam.forEach(c => {
            if (c.mainAccountCurrentHp > 0) {
                c.currentHp = c.mainAccountCurrentHp;
            }
        });

        // 3. CIBLAGE : On récupère la carte qui pose problème
        // (Adapte le sélecteur si ta carte est ailleurs, mais vu ton HTML, c'est une .creature-card)
        const enemyCard = document.querySelector('#enemySpriteContainer .creature-card')
            || document.querySelector('.creature-card');

        if (enemyCard) {
            // ✅ ÉTAPE 1 : Nettoyage Visuel
            // On enlève 'shiny', 'rarity-rare', etc. L'étoile va disparaître.
            enemyCard.className = 'creature-card';

            // On cache le tout visuellement
            enemyCard.style.opacity = '0';

            // ✅ ÉTAPE 2 : Désactivation des Clics (Le plus important !)
            // On empêche le curseur de devenir une main
            enemyCard.style.cursor = 'default';

            // On rend l'élément "transparent" à la souris (on ne peut plus cliquer dessus)
            enemyCard.style.pointerEvents = 'none';

            // Sécurité ultime : on supprime l'action de clic
            enemyCard.removeAttribute('onclick');
        }

        // 3. Mise à jour du reste
        this.updateZoneSelector();
        this.rollRoamingEncounter();
        if (typeof updateZoneInfo === 'function') updateZoneInfo();

        // 🛑 OPTIMISATION : On cible précisément les mises à jour UI 
        // au lieu de tout redessiner (updateDisplay() = ~150ms de frame time).
        // L'UI statique restante est gérée par secondaryInterval.
        this.updateTeamDisplay();
        this.updateCombatDisplay();
        this.updateItemsDisplay();
        this.updateEggsDisplay();

        if (captured) {
            this.updateStorageDisplay();
            this.updatePokedexDisplay();
            this.updateAchievementsDisplay(); // Pour shiny/perfect IVs
        }
    }


    // OPTIMISATION : Fusion avec Correction de Rareté (Fix Snorlax)
    processFusion(source, target) {
        let improved = false;
        let ivImproved = false; // Uniquement quand au moins un IV est meilleur
        let prestigeImproved = false;
        let shinyFound = false;
        let rarityFixed = false; // Nouveau flag

        // 1. Fusion des IVs (on garde le meilleur pour chaque stat)
        if (source.ivHP > target.ivHP) { target.ivHP = source.ivHP; improved = true; ivImproved = true; }
        if (source.ivAttack > target.ivAttack) { target.ivAttack = source.ivAttack; improved = true; ivImproved = true; }
        if (source.ivSpAttack > target.ivSpAttack) { target.ivSpAttack = source.ivSpAttack; improved = true; ivImproved = true; }
        if (source.ivDefense > target.ivDefense) { target.ivDefense = source.ivDefense; improved = true; ivImproved = true; }
        if (source.ivSpDefense > target.ivSpDefense) { target.ivSpDefense = source.ivSpDefense; improved = true; ivImproved = true; }
        if (source.ivSpeed > target.ivSpeed) { target.ivSpeed = source.ivSpeed; improved = true; ivImproved = true; }

        // ============================================================
        // 2. TRANSFERT D'EXPÉRIENCE (Nouveau & Intelligent)
        // ============================================================
        // On doit calculer tout l'XP que le 'source' a accumulé dans sa vie

        let sourceTotalXP = source.exp; // On commence avec la barre actuelle

        // On ajoute l'XP de tous les niveaux précédents
        // On boucle de 1 jusqu'au niveau actuel du Pokémon source
        for (let i = 1; i < source.level; i++) {
            // On recrée ta formule de baseExp pour le niveau 'i'
            const baseExp = Math.floor((200 * Math.pow(1.02, i)) + (i * i));

            // On applique le multiplicateur de rareté du SOURCE
            const rarityMult = (typeof XP_CURVE_MULTIPLIERS !== 'undefined' && XP_CURVE_MULTIPLIERS[source.rarity])
                ? XP_CURVE_MULTIPLIERS[source.rarity]
                : 1.0;

            sourceTotalXP += Math.floor(baseExp * rarityMult);
        }

        // On donne ce gros paquet d'XP à la cible
        if (sourceTotalXP > 0) {
            // Ta fonction gainExp gère déjà les montées de niveau en cascade (while loop)
            target.gainExp(Math.floor(sourceTotalXP / 2)); //50% de pénalité pour éviter le farm abusif
            improved = true;
        }

        // NOTE : Si ton jeu a une fonction pour vérifier la montée de niveau
        // (du genre target.checkLevelUp()), tu peux l'ajouter ici.
        // Sinon, target.recalculateStats() à la fin devrait gérer l'affichage.

        // ============================================================
        // 2. FUSION DU PRESTIGE (Universelle & Sécurisée)
        // ============================================================

        const sourceLevel = source.prestige || 0;
        const targetLevel = target.prestige || 0;

        // Si le sacrifié (Source) est plus gradé que le receveur (Target)
        // Peu importe l'espèce, on prend le grade le plus élevé.
        if (sourceLevel > targetLevel) {

            // A. On copie le niveau supérieur
            target.prestige = sourceLevel;
            prestigeImproved = true;
            improved = true;

            // B. On calcule la différence de niveaux
            const levelDiff = sourceLevel - targetLevel;

            // C. On convertit cette différence en JETONS
            // Le joueur utilisera ces jetons pour racheter les bonus sur la nouvelle créature.
            // Cela remplace l'addition des stats (qui causait les bugs).
            target.prestigeTokens = (target.prestigeTokens || 0) + levelDiff;
        }


        // 3. Fusion Shiny
        if (source.isShiny && !target.isShiny) {
            target.isShiny = true;
            shinyFound = true;
            improved = true;
        }

        // 4. ✅ CORRECTION RARETÉ (Le Fix pour ton Snorlax)
        // On définit une hiérarchie de valeur
        const rarityValue = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };

        // Si le nouveau est "plus rare" (la bonne rareté) que l'ancien (le bugué)
        if (rarityValue[source.rarity] > rarityValue[target.rarity]) {
            target.rarity = source.rarity;
            rarityFixed = true;
            improved = true;
            // On vérifie si un talent doit être assigné (ex: passage de Rare à Epic)
            if (!target.passiveTalent && (target.rarity === 'epic' || target.rarity === 'legendary')) {
                target.assignRandomTalent(); // On lui donne son talent manquant !
            }
        }

        // 5. Recalcul
        if (improved) {
            target.recalculateStats();
            target.heal();
        }

        // 6. Shards
        let shardsGained = source.isShiny ? 3 : 1;
        if (Math.random() < this.getShardBonusChance()) shardsGained *= 2;

        const shardKey = getShardKey(target.name, target.rarity);
        this.shards[shardKey] = (this.shards[shardKey] || 0) + shardsGained;

        for (let i = 0; i < shardsGained; i++) this.checkSpecialQuests('totalShards');
        // Ne pas compter ici : fusion_completed est compté uniquement pour les doublons capturés (combat), pas œufs/évolution

        return {
            improved: improved,
            ivImproved: ivImproved,
            shards: shardsGained,
            prestigeUp: prestigeImproved,
            becameShiny: shinyFound,
            rarityUp: rarityFixed // On renvoie l'info
        };
    }

    // LOGIQUE : Drop d'objets (Sécurisé : Pas d'Objets Clés)
    rollItemDrop(isSimulation = false) {
        const zone = ZONES[currentZone];

        // Taux de base
        let dropChance = 0.05 + (currentZone * 0.001);

        if (Math.random() < dropChance) {
            const rarityRoll = Math.random();
            let itemRarity;

            if (rarityRoll < 0.81) itemRarity = 'common';
            else if (rarityRoll < 0.96) itemRarity = 'rare';
            else if (rarityRoll < 0.99) itemRarity = 'epic';
            else itemRarity = 'legendary';

            const itemsOfRarity = Object.keys(ALL_ITEMS).filter(key => {
                const item = ALL_ITEMS[key];

                // ✅ On interdit les objets clés en drop aléatoire
                if (item.type === 'key_item') return false;

                return item.rarity === itemRarity;
            });

            if (itemsOfRarity.length > 0) {
                const itemKey = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];

                // Si simulation => updateUI = false (pour ne pas lagger)
                // !isSimulation renvoie 'false' si on est en simulation, donc pas d'update UI
                this.addItem(itemKey, 1, !isSimulation);

                // ✅ LE CHANGEMENT CRUCIAL EST ICI :
                return itemKey; // On retourne le nom de l'objet pour le rapport
            }
        }

        return null; // ✅ On retourne null si rien n'est tombé
    }

    // Drop ultra-rare de Time Dust (boss / contenus endgame)
    tryDropTimeDust(sourceLabel = 'Boss') {
        const dropTable = [
            { key: 'time_dust_9h', chance: 0.00015 },
            { key: 'time_dust_3h', chance: 0.0006 },
            { key: 'time_dust_1h', chance: 0.0020 }
        ];

        for (const entry of dropTable) {
            if (Math.random() < entry.chance) {
                this.addItem(entry.key, 1);
                const item = (typeof ALL_ITEMS !== 'undefined') ? ALL_ITEMS[entry.key] : null;
                const itemName = item && item.name ? item.name : entry.key;
                logMessage(`⌛ Drop ultra rare (${sourceLabel}) : ${itemName} !`);
                if (typeof toast !== 'undefined' && toast.legendary) {
                    toast.legendary("DROP ULTRA RARE", `${itemName} obtenu !`);
                }
                return entry.key;
            }
        }
        return null;
    }

    // Drop dédié boss : Pierre d'échange
    tryDropTradeStone(sourceLabel = 'Boss') {
        const chance = 0.03;
        if (Math.random() < chance) {
            this.addItem('trade_stone', 1);
            const item = (typeof ALL_ITEMS !== 'undefined') ? ALL_ITEMS.trade_stone : null;
            const itemName = item && item.name ? item.name : "Pierre d'échange";
            logMessage(`🔁 Drop spécial (${sourceLabel}) : ${itemName} !`);
            if (typeof toast !== 'undefined' && toast.success) {
                toast.success("Drop Boss", `${itemName} obtenu !`);
            }
            return 'trade_stone';
        }
        return null;
    }

    // Dans la classe Game
    addItem(itemKey, quantity = 1, updateUI = true) {
        const item = ALL_ITEMS[itemKey];
        // Autoriser les CT (ct_*) même si pas dans ALL_ITEMS (robustesse)
        if (!item && !(typeof itemKey === 'string' && itemKey.startsWith('ct_'))) return;
        if (!this.items) this.items = {};

        this.items[itemKey] = (this.items[itemKey] || 0) + quantity;

        const displayName = item ? `${item.icon || '📿'} ${item.name}` : (itemKey.startsWith('ct_') ? `📿 CT ${itemKey.replace('ct_', '')}` : itemKey);
        logMessage(`✨ ${displayName} x${quantity} obtenu !`);

        // On ne met à jour l'affichage que si demandé
        if (updateUI) {
            this.updateItemsDisplay();
        }
    }

    // updateItemsDisplay -> logique déplacée vers uiManager.js (updateItemsDisplayUI)
    updateItemsDisplay() {
        if (typeof updateItemsDisplayUI === 'function') updateItemsDisplayUI(this);
        // Maintient l'UI Auto-Catch visible/synchronisée dans l'onglet Sac à dos.
        this.updateAutoCatcherUI();
    }
    updateStatBoostsDisplay() {
        const container = document.getElementById('activeStatBoosts');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
    }

    // SÉCURITÉ : Vérification déblocage Arène (Correction Data Model)
    isArenaUnlocked(arenaId) {
        // Sécurité de base
        if (typeof ARENAS === 'undefined') return true;
        const arena = ARENAS[arenaId];
        if (!arena) return false;

        // 1. Condition de Badge précédent (Progression linéaire des arènes)
        // Exemple : L'arène 2 nécessite le badge de l'arène 1
        // (Si tu as défini 'requiredBadge' dans tes constantes, sinon on ignore)
        if (arena.requiredBadge) {
            if (!this.hasBadge(arena.requiredBadge)) return false;
        }

        // 2. ✅ LE FIX EST ICI : Condition de Zone Requise
        // Tes données utilisent 'requiredZone' (ex: 3 pour Argenta)
        if (arena.requiredZone) {
            // On vérifie si cette zone spécifique est MAÎTRISÉE à 100%
            if (!this.isZoneMastered(arena.requiredZone)) return false;
        }

        // 3. Condition Legacy (Pour compatibilité si tu changes tes données plus tard)
        if (arena.unlockCondition && arena.unlockCondition.type === 'zone_mastery') {
            return this.isZoneMastered(arena.unlockCondition.zoneId);
        }

        // Si toutes les conditions passent, l'arène est ouverte
        return true;
    }

    hasBadge(badgeKey) {
        return this.badges[badgeKey] === true;
    }

    getAccountTalentBonus(effectType) {
        let totalBonus = 0;

        Object.entries(this.badges).forEach(([talentKey, unlocked]) => {
            if (unlocked) {
                const talent = ACCOUNT_TALENTS[talentKey];
                if (talent && talent.effect === effectType) {
                    totalBonus += talent.value;
                }
            }
        });

        return totalBonus;
    }

    /**
     * Retourne toutes les créatures "possédées" pour les bonus de collection :
     * équipe + stockage + pension + Pokémon actuellement en expédition (pour qu'ils comptent dans les synergies).
     */
    getAllCreaturesForSynergies() {
        const list = [...(this.playerTeam || []), ...(this.storage || []), ...(this.pension || [])];
        (this.activeExpeditions || []).forEach(exp => {
            if (exp.squadData && Array.isArray(exp.squadData)) {
                exp.squadData.forEach(data => {
                    if (data && data.name != null) list.push({ name: data.name, prestige: data.prestige ?? 0 });
                });
            } else if (exp.creatureData && exp.creatureData.name != null) {
                list.push({ name: exp.creatureData.name, prestige: exp.creatureData.prestige ?? 0 });
            }
        });
        return list;
    }

    /**
     * Bonus de collection — Bonus passifs "Maillon Faible".
     * Retourne les bonus agrégés : { crit_chance, life_steal, gold_mult, xp_mult, damage_mult, defense_mult, max_hp_mult }.
     * Chaque valeur = somme des (niveau × effet) pour toutes les familles complètes.
     */
    getCollectionBonuses() {
        const out = {
            crit_chance: 0, life_steal: 0, gold_mult: 0, xp_mult: 0, damage_mult: 0,
            defense_mult: 0, max_hp_mult: 0, hp_regen_per_turn: 0,
            attack_mult: 0, spattack_mult: 0, spdefense_mult: 0, speed_mult: 0,
            leftovers_heal_mult: 0, respawn_delay_reduction: 0, crit_damage_mult: 0,
            egg_drop_chance: 0, bonus_shard_chance: 0, expedition_time_reduction: 0
        };
        if (typeof COLLECTION_BONUSES === 'undefined') return out;

        const allCreatures = this.getAllCreaturesForSynergies();
        const prestigeBySpecies = {};
        allCreatures.forEach(c => {
            if (c && c.name != null) {
                const p = c.prestige || 0;
                prestigeBySpecies[c.name] = Math.max(prestigeBySpecies[c.name] || 0, p);
            }
        });

        Object.values(COLLECTION_BONUSES).forEach(synergy => {
            const minPrestige = Math.min(...synergy.pokemon.map(name => prestigeBySpecies[name] ?? 0));
            if (minPrestige <= 0) return;
            const level = minPrestige;
            Object.entries(synergy.effect || {}).forEach(([key, val]) => {
                if (key in out && typeof val === 'number') out[key] += val * level;
            });
        });

        return out;
    }

    /**
     * Détails par famille pour l'affichage Pokédex : prestige par espèce, niveau actif, texte effet.
     */
    getCollectionBonusDetails() {
        if (typeof COLLECTION_BONUSES === 'undefined') return [];
        const allCreatures = this.getAllCreaturesForSynergies();
        const prestigeBySpecies = {};
        allCreatures.forEach(c => {
            if (c && c.name != null) {
                const p = c.prestige || 0;
                prestigeBySpecies[c.name] = Math.max(prestigeBySpecies[c.name] || 0, p);
            }
        });

        const effectLabels = {
            crit_chance: 'Critique', life_steal: 'Life Steal', gold_mult: 'Argent', xp_mult: 'XP',
            damage_mult: 'Dégâts', defense_mult: 'Défense', max_hp_mult: 'PV Max', hp_regen_per_turn: 'Regen PV/tour',
            attack_mult: 'Attaque', spattack_mult: 'Atk Spé', spdefense_mult: 'Déf Spé', speed_mult: 'Vitesse',
            leftovers_heal_mult: 'Effet Restes', respawn_delay_reduction: 'Respawn delay', crit_damage_mult: 'Dégâts Critiques',
            egg_drop_chance: 'Drop Œuf', bonus_shard_chance: 'Shard Bonus', expedition_time_reduction: 'Temps d\'expédition'
        };
        const effectFormatters = {
            crit_chance: v => `+${(v * 100).toFixed(1)}%`, life_steal: v => `+${(v * 100).toFixed(1)}%`,
            gold_mult: v => `+${(v * 100).toFixed(1)}%`, xp_mult: v => `+${(v * 100).toFixed(1)}%`,
            damage_mult: v => `+${(v * 100).toFixed(1)}%`, defense_mult: v => `+${(v * 100).toFixed(1)}%`,
            max_hp_mult: v => `+${(v * 100).toFixed(1)}%`, hp_regen_per_turn: v => `+${(v * 100).toFixed(1)}% PV/tour`,
            attack_mult: v => `+${(v * 100).toFixed(1)}%`, spattack_mult: v => `+${(v * 100).toFixed(1)}%`,
            spdefense_mult: v => `+${(v * 100).toFixed(1)}%`, speed_mult: v => `+${(v * 100).toFixed(1)}%`,
            leftovers_heal_mult: v => `+${(v * 100).toFixed(1)}%`, respawn_delay_reduction: v => `-${v}ms`,
            crit_damage_mult: v => `+${(v * 100).toFixed(1)}%`, egg_drop_chance: v => `+${(v * 100).toFixed(1)}%`,
            bonus_shard_chance: v => `+${(v * 100).toFixed(1)}%`, expedition_time_reduction: v => `-${(v * 100).toFixed(1)}%`
        };
        const effectPerPrestigeLabels = {
            crit_chance: v => `+${((v || 0) * 100).toFixed(1)}% Critique/prestige`,
            life_steal: v => `+${((v || 0) * 100).toFixed(1)}% Life Steal/prestige`,
            gold_mult: v => `+${((v || 0) * 100).toFixed(1)}% Argent/prestige`,
            xp_mult: v => `+${((v || 0) * 100).toFixed(1)}% XP/prestige`,
            damage_mult: v => `+${((v || 0) * 100).toFixed(1)}% Dégâts/prestige`,
            defense_mult: v => `+${((v || 0) * 100).toFixed(1)}% Défense/prestige`,
            max_hp_mult: v => `+${((v || 0) * 100).toFixed(1)}% PV/prestige`,
            hp_regen_per_turn: v => `+${((v || 0) * 100).toFixed(1)}% Regen PV/tour`,
            attack_mult: v => `+${((v || 0) * 100).toFixed(1)}% Attaque/prestige`,
            spattack_mult: v => `+${((v || 0) * 100).toFixed(1)}% Atk Spé/prestige`,
            spdefense_mult: v => `+${((v || 0) * 100).toFixed(1)}% Déf Spé/prestige`,
            speed_mult: v => `+${((v || 0) * 100).toFixed(1)}% Vitesse/prestige`,
            leftovers_heal_mult: v => `+${((v || 0) * 100).toFixed(1)}% Effet Restes/prestige`,
            respawn_delay_reduction: v => `-${v || 0}ms de délai de spawn/prestige`,
            crit_damage_mult: v => `+${((v || 0) * 100).toFixed(1)}% Dégâts Critiques/prestige`,
            egg_drop_chance: v => `+${((v || 0) * 100).toFixed(1)}% Chance de Drop Œuf/prestige`,
            bonus_shard_chance: v => `+${((v || 0) * 100).toFixed(1)}% Chance de shard bonus/prestige`,
            expedition_time_reduction: v => `-${((v || 0) * 100).toFixed(1)}% Temps d'expédition/prestige`
        };

        return Object.entries(COLLECTION_BONUSES).map(([id, synergy]) => {
            const members = synergy.pokemon.map(name => {
                const prestige = prestigeBySpecies[name] ?? -1;
                const status = prestige < 0 ? 'missing' : (prestige === 0 ? 'prestige_0' : 'ok');
                return { name, prestige: Math.max(0, prestige), status };
            });
            const minPrestige = Math.min(...synergy.pokemon.map(name => prestigeBySpecies[name] ?? 0));
            const allOwned = synergy.pokemon.every(name => (prestigeBySpecies[name] ?? -1) >= 0);
            const level = (allOwned && minPrestige > 0) ? minPrestige : 0;
            const effectEntries = Object.entries(synergy.effect || {});
            const effectTexts = effectEntries.map(([key, val]) => {
                const label = effectLabels[key] || key;
                const fmt = effectFormatters[key] || (v => v);
                const total = typeof val === 'number' ? val * level : 0;
                return total > 0 ? fmt(total) + ' ' + label : null;
            }).filter(Boolean);
            let bonusPerPrestige = effectEntries.map(([key, val]) => {
                const fn = effectPerPrestigeLabels[key];
                return fn ? fn(val) : null;
            }).filter(Boolean).join(', ');

            if (id === 'menu_best_of') {
                bonusPerPrestige = '+1% all stats / prestige';
            } else if (id === 'eco_plus') {
                bonusPerPrestige = '+2.5% all stats / prestige';
            } else if (id === 'not_a_pikachu') {
                bonusPerPrestige = '+1.5% attaque spéciale / prestige';
            } else if (id === 'zzzzz') {
                bonusPerPrestige = '+0.5% d\'effet Restes / prestige';
            } else if (id === 'hm_slaves') {
                bonusPerPrestige = '+1% PV / prestige';
            } else if (id === 'god_i_need_repel') {
                bonusPerPrestige = '-25ms de spawn ennemi / prestige';
            } else if (id === 'directed_by_michael_bay') {
                bonusPerPrestige = '+10% de dégâts critiques / prestige';
            } else if (id === 'god_i_need_one_friend' || id === 'god_i_need_two_friends') {
                bonusPerPrestige = '+0.5% de chance de loot un oeuf / prestige';
            } else if (id === 'three_friends') {
                bonusPerPrestige = '+5% de chance de shard bonus / prestige';
            } else if (id === 'forever_alone') {
                bonusPerPrestige = '+1% de chance de shard bonus / prestige';
            } else if (id === 'out_of_this_world') {
                bonusPerPrestige = '-5% de temps d\'expédition / prestige';
            } else if (id === 'the_600_club') {
                bonusPerPrestige = '+1% de dégâts / prestige';
            }
            return { id, name: synergy.name, members, minPrestige, level, effectTexts, bonusPerPrestige, isActive: level > 0 };
        });
    }

    getTalentStackBonus(talentName) {
        const count = this.playerTeam.filter(c => c.passiveTalent === talentName).length;
        if (count === 0) return 0;

        // Définir les bonus par niveau de stack
        const bonusTables = {
            'mentor': [0, 0.25, 0.40, 0.50, 0.55, 0.58, 0.60],        // XP
            'collecteur': [0, 0.50, 0.75, 0.90, 1.00, 1.05, 1.10],    // Pokédollars
            'maitre': [0, 0.20, 0.35, 0.45, 0.50, 0.53, 0.55],        // Dégâts STAB
            'catalyseur': [0, 0.025, 0.045, 0.060, 0.070, 0.075, 0.08], // Chance statut
            'catalyseur_supreme': [0, 0.05, 0.08, 0.10, 0.11, 0.115, 0.12], // Chance statut
            'aura': [0, 0.10, 0.17, 0.22, 0.25, 0.27, 0.28]           // Stats équipe
        };

        const table = bonusTables[talentName];
        if (!table) return 0;

        const index = Math.min(count, table.length - 1);
        return table[index];
    }

    createChampionTeam(arenaId) {
        const arena = ARENAS[arenaId];
        if (!arena) return [];

        const team = [];
        const level = arena.teamLevel;
        const type = arena.type;

        // On s'assure d'avoir un nombre (1 à 8)
        const difficulty = parseInt(arenaId) || 1;

        const teamNames = arena.fixedTeam || [];

        teamNames.forEach(name => {
            const creature = new Creature(
                name,
                type,
                level,
                RARITY.EPIC,
                true, // isEnemy
                false // isShiny
            );

            // --- BOOST CHAMPION DYNAMIQUE (Selon le N° d'Arène) ---

            // PV 
            const hpMult = 2 + (difficulty * 1);

            // Stats (ATK/DEF) : 
            const statMult = 2 + (difficulty * 1);

            // Vitesse :
            const speedMult = 2 + (difficulty * 1);

            creature.maxHp = Math.floor(creature.maxHp * hpMult);
            creature.attack = Math.floor(creature.attack * statMult);
            creature.spattack = Math.floor(creature.spattack * statMult);
            creature.defense = Math.floor(creature.defense * statMult);
            creature.spdefense = Math.floor(creature.spdefense * statMult);
            creature.speed = Math.floor(creature.speed * speedMult);

            // Soin complet avec les nouveaux PV
            creature.currentHp = creature.maxHp;

            // Talent & ATB
            creature.assignRandomTalent();
            creature.actionGauge = 0;
            creature.actionThreshold = 10000;

            team.push(creature);
        });

        return team;
    }

    startArena(arenaId) {
        // 1. Vérifications de base
        if (!this.isArenaUnlocked(arenaId)) {
            logMessage("Cette arène n'est pas encore débloquée !");
            return false;
        }

        const arena = ARENAS[arenaId];
        if (this.hasBadge(arena.badge)) {
            logMessage("Vous avez déjà obtenu le badge de cette arène !");
            return false;
        }

        if (this.towerState.isActive) {
            logMessage("Quittez la Tour de Combat avant de défier un champion !");
            return false;
        }
        if (this.arenaState.active) {
            logMessage("Un défi d'arène est déjà en cours !");
            return false;
        }

        // 2. Interruption du Farming
        if (this.combatState === 'fighting' || this.combatState === 'starting') {
            logMessage("Combat sauvage interrompu pour le défi d'arène !");
            this.currentEnemy = null;
            this.combatState = 'waiting';
        }

        // 3. ✅ PRÉPARATION CRITIQUE (Le Fix est ici)
        console.log("🏟️ Préparation Arène : Application des synergies...");

        // A. On force le recalcul pour "cuire" les synergies dans les stats brutes
        this.playerTeam.forEach(c => c.recalculateStats());

        // B. On soigne tout le monde (pour remplir la nouvelle barre de PV boostée)
        this.playerTeam.forEach(c => {
            c.heal();
            c.currentStamina = c.maxStamina;
            c.clearStatusEffect();
            c.actionGauge = 0;
            c.ultimateCharge = 0;
            c.ultimateActive = false;
        });

        // 4. Lancement de l'Arène
        this.arenaState.active = true;
        this.arenaState.arenaId = arenaId;
        this.arenaState.championTeam = this.createChampionTeam(arenaId);
        this.arenaState.currentChampionIndex = 0;
        this.arenaState.startTime = Date.now();
        this.arenaState.maxDuration = null;

        // 5. Configuration Combat
        this.activeCreatureIndex = 0;
        this.currentPlayerCreature = this.playerTeam[0];

        // Backup des stats globales (au cas où)
        this.currentPlayerCreature.mainAccountCurrentHp = this.playerMainStats.hp;

        this.currentEnemy = this.arenaState.championTeam[0];
        this.combatState = 'starting';
        this.combatStartTime = Date.now();

        logMessage("=== 🏟️ DÉFI D'ARÈNE COMMENCÉ ===");
        logMessage(`Champion ${arena.championName} vous défie !`);

        this.updateDisplay();
        return true;
    }

    checkArenaTimeout() {
        if (!this.arenaState.active) return false;

        // Temps limite des combats d'arène désactivé : plus de défaite automatique au bout de 90s.
        return false;
    }

    // Affiche la modale de synergie avec les détails
    showSynergyModal(name, description, icon) {
        const modal = document.getElementById('synergyModal');
        const title = document.getElementById('synergyModalTitle');
        const content = document.getElementById('synergyModalContent');

        if (!modal || !title || !content) return;

        // Mise à jour du contenu
        title.innerHTML = `${icon} ${name}`;
        content.innerHTML = description;

        // Affichage
        modal.classList.add('show');
    }



    winArena() {
        if (!this.arenaState.active) return;

        const arena = ARENAS[this.arenaState.arenaId];
        const elapsedTime = ((Date.now() - this.arenaState.startTime) / 1000).toFixed(1);

        // 1. On valide l'acquisition du badge (Source de vérité)
        this.badges[arena.badge] = true;

        // ============================================================
        // ✅ LA CORRECTION EST ICI
        // ============================================================
        // 2. On compte combien on a de badges au total (Dynamique)
        const totalBadges = Object.values(this.badges).filter(val => val === true).length;

        // 3. On met à jour la stat que le succès surveille (badgesEarned)
        // Comme ça, ton trackingKey: 'badgesEarned' fonctionne parfaitement !
        this.stats.badgesEarned = totalBadges;
        // ============================================================

        // 4. Maintenant on vérifie le succès (il va lire this.stats.badgesEarned qui vaut maintenant 1, 2, etc.)
        this.checkAchievements('badgesEarned');
        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('badgesEarned');

        logMessage("=== VICTOIRE D'ARENE ===");
        logMessage("Vous avez vaincu " + arena.championName + " en " + elapsedTime + "s !");
        logMessage("BADGE OBTENU: " + ACCOUNT_TALENTS[arena.badge].name);

        // Sécurité si description manquante
        if (ACCOUNT_TALENTS[arena.badge]) {
            logMessage(ACCOUNT_TALENTS[arena.badge].description);
        }

        this.stats.arenasWon = (this.stats.arenasWon || 0) + 1;

        this.resetArenaState();
        this.applyAccountTalents();

        // (Optionnel) Sauvegarde pour ne rien perdre
        this.saveGame();
    }
    loseArena(reason = "Defaite") {
        if (!this.arenaState.active) return;

        const arena = ARENAS[this.arenaState.arenaId];

        logMessage("=== DEFAITE D'ARENE ===");
        logMessage(reason);
        logMessage("Champion " + arena.championName + " n'a pas ete vaincu.");
        logMessage("Vous pouvez reessayer !");

        this.resetArenaState();
    }

    resetArenaState() {
        this.arenaState = {
            active: false,
            arenaId: null,
            championTeam: [],
            currentChampionIndex: 0,
            startTime: 0,
            maxDuration: 90000
        };

        this.combatState = 'waiting';
        this.lastCombatTime = Date.now();
        this.currentEnemy = null;

        for (const creature of this.playerTeam) {
            creature.heal();
            creature.currentStamina = creature.maxStamina;
            creature.clearStatusEffect();
        }
    }

    /**
        * Calcule les multiplicateurs de synergies actifs pour l'équipe du joueur.
        * CORRECTIF : On compte TOUS les membres (même KO) pour éviter de perdre les bonus en plein combat.
        */
    getActiveSynergies() {
        const typeCounts = {};

        // 1. Compter les types (Inclus les KO)
        this.playerTeam.forEach(c => {
            // ✅ RETRAIT de "if (c.isAlive())"
            // Une synergie est une construction d'équipe, elle doit rester stable.
            if (c) {
                typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
                if (c.secondaryType) {
                    typeCounts[c.secondaryType] = (typeCounts[c.secondaryType] || 0) + 1;
                }
            }
        });

        // Les bonus commencent à 1.0 (100%)
        const bonuses = { attack_mult: 1, defense_mult: 1, max_hp_mult: 1, exp_mult: 1, speed_mult: 1 };

        if (typeof TEAM_SYNERGIES === 'undefined') return bonuses;

        Object.values(TEAM_SYNERGIES).forEach(synergy => {
            let isActive = false;

            if (synergy.all_required) {
                isActive = synergy.types.every(type => (typeCounts[type] || 0) >= synergy.min_count);
            } else {
                isActive = synergy.types.some(type => (typeCounts[type] || 0) >= synergy.min_count);
            }

            if (isActive) {
                if (synergy.effect.attack_mult) bonuses.attack_mult += synergy.effect.attack_mult;
                if (synergy.effect.defense_mult) bonuses.defense_mult += synergy.effect.defense_mult;
                if (synergy.effect.max_hp_mult) bonuses.max_hp_mult += synergy.effect.max_hp_mult;
                if (synergy.effect.exp_mult) bonuses.exp_mult += synergy.effect.exp_mult;
                if (synergy.effect.speed_mult) bonuses.speed_mult += synergy.effect.speed_mult;
            }
        });

        return bonuses;
    }

    refreshTeamStats() {
        this.playerTeam.forEach(creature => {
            // C'est cette ligne qui fait le travail !
            if (creature.recalculateStats) creature.recalculateStats();
        });
        console.log("🔄 Stats de l'équipe mises à jour (Synergies recalculées) !");

        // Mettre à jour l'affichage après le calcul
        this.updateDisplay();
    }
    changeZone(zoneId) {
        if (typeof changeZoneLogic === 'function') changeZoneLogic(this, zoneId);
    }

    // getItemIconHTML -> déplacé vers uiManager.js ; wrapper pour compatibilité
    getItemIconHTML(item) {
        return typeof getItemIconHTML === 'function' ? getItemIconHTML(item) : (item && item.icon) || '📦';
    }
    claimAchievement(key) {
        const achievementState = this.achievements[key];
        const achievementDef = ACHIEVEMENTS[key];

        if (!achievementState || !achievementDef || !achievementState.completed || achievementState.claimed) {
            logMessage("❌ Impossible de récupérer ce succès !");
            return;
        }

        achievementState.claimed = true;

        const rewards = achievementDef.rewards;

        // Donner les récompenses
        if (rewards.pokedollars && rewards.pokedollars > 0) {
            this.pokedollars += rewards.pokedollars;
            logMessage(`💰 +${formatNumber(rewards.pokedollars)} Pokédollars (Succès)`);
            this.checkSpecialQuests('pokedollars_gained');
            this.checkAchievements('totalPokedollarsEarned');
        }
        if (rewards.tokens && rewards.tokens > 0) {
            this.questTokens += rewards.tokens;
            logMessage(`🎫 +${rewards.tokens} Jetons (Succès)`);
        }
        if (rewards.eggs) {
            Object.entries(rewards.eggs).forEach(([rarity, count]) => {
                this.eggs[rarity] = (this.eggs[rarity] || 0) + count;
                logMessage(`🥚 +${count}x Œuf ${rarity} (Succès)`);
            });
        }

        toast.success('Récompense Récupérée !', achievementDef.title);
        this.updateAchievementsDisplay();
        this.updatePlayerStatsDisplay();
        this.updateEggsDisplay();
        this.updateShopDisplay();
        this.updateTabBadges();
    }

    /**
 * Filtre les succès pour n'afficher que le prochain niveau pertinent
 * (Ex: Si Guerrier I est fini, on affiche Guerrier II)
 */
    getVisibleAchievements() {
        const visibleList = [];
        const families = {};

        // 1. Regrouper par famille (ex: "shinyHunter")
        // On suppose que les clés sont formatées comme "nomFamille_1"
        for (const [key, data] of Object.entries(ACHIEVEMENTS)) {
            const parts = key.split('_');
            // Sécurité : si la clé n'a pas de underscore, on prend la clé entière comme famille
            const familyName = parts.length > 1 ? parts[0] : key;

            if (!families[familyName]) families[familyName] = [];
            families[familyName].push({ key, ...data });
        }

        // 2. Trouver le prochain niveau pertinent pour chaque famille
        for (const familyName in families) {
            // Trier par difficulté (target) pour avoir l'ordre 1 -> 2 -> 3
            const sorted = families[familyName].sort((a, b) => a.target - b.target);

            let active = null;

            for (const ach of sorted) {
                // Est-ce que ce succès est déjà validé ?
                const isCompleted = this.achievementsCompleted && this.achievementsCompleted[ach.key];

                if (!isCompleted) {
                    active = ach; // C'est le premier non fini, c'est celui qu'on affiche !
                    break;
                }
            }

            // Cas spécial : Si tous les succès de la famille sont finis (ex: Guerrier I, II et III)
            // On affiche le dernier (le III) pour montrer fièrement qu'il est "COMPLÉTÉ"
            if (!active && sorted.length > 0) {
                active = sorted[sorted.length - 1];
            }

            if (active) {
                visibleList.push(active);
            }
        }
        return visibleList;
    }

    // ✅ CORRECTION DU NOM : updateAchievementsDisplay au lieu de updateAchievementsUI
    updateAchievementsDisplay() {
        const container = document.getElementById('achievementsContainer');
        const countEl = document.getElementById('achievementsCount');
        const totalEl = document.getElementById('achievementsTotal');

        if (!container) return;

        // 1. FILTRE INTELLIGENT (Slot unique)
        const visibleList = this.getVisibleAchievements();

        container.innerHTML = '';

        // Mise à jour des compteurs
        if (countEl) countEl.textContent = Object.keys(this.achievementsCompleted || {}).length;
        if (totalEl) totalEl.textContent = Object.keys(ACHIEVEMENTS).length;

        if (visibleList.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucun succès visible.</div>';
            return;
        }

        visibleList.forEach(ach => {
            // 2. DONNÉES DEPUIS 'this.stats'
            const currentVal = this.stats[ach.trackingKey] || 0;
            const target = ach.target;

            let percent = Math.floor((currentVal / target) * 100);
            if (percent > 100) percent = 100;

            const isCompleted = this.achievementsCompleted && this.achievementsCompleted[ach.key];

            // 3. UI
            const card = document.createElement('div');
            card.className = `quest-card ${isCompleted ? 'completed' : ''}`;

            let rewardsHTML = '';
            if (ach.rewards) {
                if (ach.rewards.pokedollars) rewardsHTML += `<span class="quest-reward-item">💰 ${formatNumber(ach.rewards.pokedollars)}</span>`;
                if (ach.rewards.tokens) rewardsHTML += `<span class="quest-reward-item"><img src="img/quest-token.png" class="quest-token-inline" alt=""> ${ach.rewards.tokens}</span>`;
                if (ach.rewards.items) {
                    Object.entries(ach.rewards.items).forEach(([item, qty]) => {
                        rewardsHTML += `<span class="quest-reward-item">🎒 ${qty}x ${item}</span>`;
                    });
                }
                if (ach.rewards.eggs) {
                    Object.entries(ach.rewards.eggs).forEach(([rarity, count]) => {
                        rewardsHTML += `<span class="quest-reward-item">🥚 ${count}x ${rarity}</span>`;
                    });
                }
            }

            let progressText = isCompleted ? "COMPLÉTÉ" : `${formatNumber(currentVal)} / ${formatNumber(target)}`;
            let progressBarColor = isCompleted ? '#4ade80' : '#fbbf24';

            card.innerHTML = `
                <div class="quest-header">
                    <div class="quest-title" style="color: ${isCompleted ? '#4ade80' : '#fbbf24'};">
                        ${isCompleted ? '✅' : '🏆'} ${ach.title}
                    </div>
                </div>
                
                <div class="quest-description">${ach.desc}</div>
                
                <div class="quest-progress-container">
    <div class="quest-progress-bar">
        <div class="quest-progress-fill" style="width: ${percent}%; background-color: ${progressBarColor};">
        </div>
    </div>
    
    <div class="quest-progress-text">
        ${isCompleted ? 'COMPLÉTÉ' : `${formatNumber(currentVal)} / ${formatNumber(target)}`}
    </div>
</div>
                
                <div class="quest-rewards">${rewardsHTML}</div>
            `;

            container.appendChild(card);
        });
    }

    /**
     * Affiche les talents actifs (Version Stabilisée Anti-Clignotement).
     */
    displayActiveTalents() {
        const talentsDiv = document.getElementById('activeTalentsDisplay');
        if (!talentsDiv) return;

        const talentCounts = {};
        this.playerTeam.forEach(c => {
            if (c.passiveTalent) {
                talentCounts[c.passiveTalent] = (talentCounts[c.passiveTalent] || 0) + 1;
            }
        });

        // 1. Gestion de l'affichage global
        if (Object.keys(talentCounts).length === 0) {
            talentsDiv.style.display = 'none';
            return;
        }
        talentsDiv.style.display = 'block';

        // 2. Initialisation de la structure (si pas encore faite)
        let grid = document.getElementById('talentGrid');
        if (!grid) {
            talentsDiv.innerHTML = `
            <div class="talents-header-title">⚡ Talents d'Équipe Actifs</div>
            <div class="talent-summary-grid" id="talentGrid"></div>
        `;
            grid = document.getElementById('talentGrid');
        }

        const activeIds = new Set();

        // 3. Mise à jour intelligente (Diffing)
        Object.entries(talentCounts).forEach(([talentKey, count]) => {
            const talent = PASSIVE_TALENTS[talentKey];
            if (!talent) return;

            const chipId = `talent-chip-${talentKey}`;
            activeIds.add(chipId);

            // Calcul du bonus
            const bonus = this.getTalentStackBonus(talentKey);
            let bonusText = '';
            if (talentKey === 'mentor') bonusText = `+${(bonus * 100).toFixed(0)}% XP`;
            else if (talentKey === 'collecteur') bonusText = `+${(bonus * 100).toFixed(0)}% $`;
            else if (talentKey === 'maitre') bonusText = `+${(bonus * 100).toFixed(0)}% STAB`;
            else if (talentKey === 'catalyseur' || talentKey === 'catalyseur_supreme') bonusText = `+${(bonus * 100).toFixed(1)}% Statut`;
            else if (talentKey === 'aura') bonusText = `+${(bonus * 100).toFixed(0)}% Stats`;

            const rarityClass = talent.rarity === 'legendary' ? 'legendary' : 'epic';

            // Textes sécurisés pour le tooltip
            const safeName = talent.name.replace(/'/g, "\\'");
            const safeDesc = `Cumul : x${count}\nEffet total : ${bonusText || 'Actif'}\n\n${talent.description}`.replace(/'/g, "\\'").replace(/\n/g, "<br>");

            // Récupération de l'élément existant
            let chip = document.getElementById(chipId);

            if (chip) {
                // CAS 1 : EXISTE DÉJÀ -> On met à jour uniquement si le nombre change
                // (L'attribut data-count sert de mémoire)
                if (chip.getAttribute('data-count') != count) {
                    chip.setAttribute('data-count', count);
                    chip.innerHTML = `
                    <strong>${talent.name}</strong>
                    <span style="font-size:9px; opacity:1;">x${count}</span>
                    ${bonusText ? `<span class="talent-bonus-text">${bonusText}</span>` : ''}
                `;
                    // Mise à jour du tooltip pour refléter le nouveau bonus
                    chip.setAttribute('onmouseenter', `game.scheduleTooltip(event, '${safeName}', '${safeDesc}')`);
                }
            } else {
                // CAS 2 : NOUVEAU -> Création
                chip = document.createElement('div');
                chip.id = chipId;
                chip.className = `talent-chip ${rarityClass}`;
                chip.setAttribute('data-count', count);

                // Événements de souris
                chip.setAttribute('onmouseenter', `game.scheduleTooltip(event, '${safeName}', '${safeDesc}')`);
                chip.setAttribute('onmouseleave', `game.hideTooltip()`);

                chip.innerHTML = `
                <strong>${talent.name}</strong>
                <span style="font-size:9px; opacity:1;">x${count}</span>
                ${bonusText ? `<span class="talent-bonus-text">${bonusText}</span>` : ''}
            `;

                grid.appendChild(chip);
            }
        });

        // 4. Nettoyage (Supprimer les talents qui ne sont plus actifs)
        Array.from(grid.children).forEach(child => {
            if (!activeIds.has(child.id)) {
                child.remove();
            }
        });
    }
    applyAccountTalents() {
        // Les talents sont appliqués via getAccountTalentBonus() dans les calculs
        this.calculateTeamStats();
        this.updateDisplay();
    }

    // playerCreatureFainted -> logique déplacée vers combatSystem.js
    playerCreatureFainted() {
        if (typeof playerCreatureFaintedLogic === 'function') playerCreatureFaintedLogic(this);
    }
    getFirstAliveCreature() {
        return this.playerTeam.find(creature => creature.isAlive()) || null;
    }

    // isZoneMastered, isZoneUnlocked, updateZoneSelector -> logique déplacée vers zoneSystem.js
    isZoneMastered(zoneId) {
        return typeof isZoneMasteredLogic === 'function' ? isZoneMasteredLogic(this, zoneId) : false;
    }
    isZoneUnlocked(zoneId, checkPrevious) {
        if (checkPrevious === undefined) checkPrevious = true;
        return typeof isZoneUnlockedLogic === 'function' ? isZoneUnlockedLogic(this, zoneId, checkPrevious) : false;
    }
    updateZoneSelector() {
        if (typeof updateZoneSelectorLogic === 'function') updateZoneSelectorLogic(this);
    }


    // CORRECTION : Ajout du bonus de Badge Wisdom (+10% XP)
    getExpMultiplier() {
        let multiplier = 1 + (this.upgrades.expBoost.level * 0.1); // Améliorations (Shop)

        // Boosts temporaires (Potions)
        multiplier += this.getActiveBoostMultiplier('xp');

        // Boosts permanents (Tour)
        if (this.permanentBoosts && this.permanentBoosts.xp) {
            multiplier += this.permanentBoosts.xp;
        }

        // ✅ FIX : Ajout du Badge d'Arène (Wisdom)
        multiplier += this.getAccountTalentBonus('exp_mult');

        // Synergies d'équipe
        const synergies = this.getActiveSynergies();
        if (synergies.exp_mult > 1) {
            multiplier += (synergies.exp_mult - 1);
        }
        // Bonus de collection
        const collXp = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).xp_mult || 0;
        multiplier += collXp;

        return multiplier;
    }

    getTeamAverageRarity() {
        if (this.playerTeam.length === 0) return 0;
        const total = this.playerTeam.reduce((sum, c) => sum + this.getRarityValue(c.rarity), 0);
        return total / this.playerTeam.length;
    }

    getRarityValue(rarity) {
        const values = {
            [RARITY.COMMON]: 1,
            [RARITY.RARE]: 2,
            [RARITY.EPIC]: 3,
            [RARITY.LEGENDARY]: 4
        };
        return values[rarity] || 1;
    }

    // Dans la classe Game
    getStatusProcBonus() {
        let totalBonus = 0;

        // Catalyseur normal
        const catalyseurBonus = this.getTalentStackBonus('catalyseur');
        totalBonus += catalyseurBonus;

        // Catalyseur Suprême
        const catalyseurSupremeBonus = this.getTalentStackBonus('catalyseur_supreme');
        totalBonus += catalyseurSupremeBonus;

        return totalBonus;
    }

    getEggDropBonus() {
        let bonus = this.upgrades.eggDrop.level * 0.002;

        // Ajouter le bonus de la collection
        const collBonus = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).egg_drop_chance || 0;
        bonus += collBonus;

        // Ajouter les boosts temporaires
        bonus += this.getActiveBoostMultiplier('eggDrop');

        return bonus;
    }

    // --- INCUBATEURS D'OEUFS ---
    getMaxIncubatorSlots() {
        const level = (this.upgrades.incubatorSlots && this.upgrades.incubatorSlots.level) || 0;
        return Math.min(4, 1 + level);
    }

    getIncubationSpeedMultiplier() {
        const level = (this.upgrades.incubationSpeed && this.upgrades.incubationSpeed.level) || 0;
        return Math.max(0.5, 1 - level * 0.10);
    }

    getIncubationDurationMs(rarity, slotIndex = 0) {
        if (typeof EGG_INCUBATION_BASE_MS === 'undefined' || !EGG_INCUBATION_BASE_MS[rarity]) return 5 * 60 * 1000;

        let baseMs = EGG_INCUBATION_BASE_MS[rarity];

        // --- NOUVEAU : Bonus spécifiques par slot d'incubateur ---
        // slotIndex 0: Incubateur 1 (Temps normal)
        // slotIndex 1: Incubateur 2 (-10% sur Commun/Rare)
        // slotIndex 2: Incubateur 3 (-20% sur Commun/Rare/Epique)
        // slotIndex 3: Incubateur 4 (-30% sur toutes les raretés)

        let slotModifier = 1.0;
        if (slotIndex === 1 && (rarity === RARITY.COMMON || rarity === RARITY.RARE)) {
            slotModifier = 0.90; // -10%
        } else if (slotIndex === 2 && (rarity === RARITY.COMMON || rarity === RARITY.RARE || rarity === RARITY.EPIC)) {
            slotModifier = 0.80; // -20%
        } else if (slotIndex === 3) {
            slotModifier = 0.70; // -30%
        }

        // On applique le modificateur de slot au temps de base
        let timeWithSlotBonus = baseMs * slotModifier;

        // Puis on applique le bonus global de l'amélioration (incubationSpeed)
        return Math.floor(timeWithSlotBonus * this.getIncubationSpeedMultiplier());
    }

    getIncubatorRemainingMs(slotIndex) {
        const slot = this.incubators[slotIndex];
        if (!slot || !slot.startTime || !slot.durationMs) return 0;
        const elapsed = Date.now() - slot.startTime;
        return Math.max(0, slot.durationMs - elapsed);
    }

    isIncubatorReady(slotIndex) {
        return this.getIncubatorRemainingMs(slotIndex) === 0 && this.incubators[slotIndex] != null;
    }

    placeEggInIncubator(slotIndex, rarity, options = {}) {
        if (slotIndex < 0 || slotIndex >= this.getMaxIncubatorSlots()) return false;
        if (this.eggs[rarity] <= 0) return false;
        if (this.incubators[slotIndex] != null) return false;
        this.eggs[rarity]--;
        const durationMs = this.getIncubationDurationMs(rarity, slotIndex);
        this.incubators[slotIndex] = { rarity, startTime: Date.now(), durationMs };
        if (!options.silent) {
            logMessage(`Œuf ${rarity} placé dans l'incubateur ${slotIndex + 1}. Incubation : ${Math.ceil(durationMs / 60000)} min.`);
        }
        this.updateEggsDisplay();
        this.updateIncubatorsDisplay();
        return true;
    }

    openIncubatorEgg(slotIndex, options = {}) {
        if (slotIndex < 0 || slotIndex >= this.getMaxIncubatorSlots()) return;
        const forceReady = !!options.forceReady;
        if (!forceReady && !this.isIncubatorReady(slotIndex)) return;
        const slot = this.incubators[slotIndex];
        if (!slot) return;
        const rarity = slot.rarity;
        this.incubators[slotIndex] = null;
        // Ne pas re-rendre le DOM à chaque œuf en mode silent (simulation offline) — très coûteux
        if (!options.silent) this.updateIncubatorsDisplay();
        return this.openEgg(rarity, true, {
            silent: !!options.silent,
            source: 'incubator',
            slotIndex,
            offline: !!options.offline
        }); // true = œuf déjà retiré de l'inventaire (placé dans l'incubateur)
    }

    openChooseEggModal(slotIndex) {
        this._chooseEggSlotIndex = slotIndex;
        const modal = document.getElementById('chooseEggModal');
        const optionsEl = document.getElementById('chooseEggOptions');
        if (!modal || !optionsEl) return;
        optionsEl.innerHTML = '';
        const rarities = [RARITY.COMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];
        rarities.forEach(rarity => {
            const count = this.eggs[rarity] || 0;
            if (count <= 0) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `choose-egg-btn rarity-${rarity}`;
            const filterClass = rarity === 'common' ? '' : ` egg-filter-${rarity}`;
            const label = rarity.charAt(0).toUpperCase() + rarity.slice(1);
            const eggSpriteUrl = `img/${rarity}-egg.png`;
            btn.innerHTML = `<img src="${eggSpriteUrl}" alt="" class="choose-egg-btn-icon egg-sprite${filterClass}"> <span class="choose-egg-btn-label">${label}</span> <span class="choose-egg-btn-count">× ${count}</span>`;
            btn.onclick = () => this.chooseEggForIncubator(rarity);
            optionsEl.appendChild(btn);
        });
        if (optionsEl.children.length === 0) {
            optionsEl.innerHTML = '<p class="choose-egg-empty-msg">Aucun œuf disponible.</p>';
        }
        modal.classList.add('show');
    }

    closeChooseEggModal() {
        this._chooseEggSlotIndex = undefined;
        const modal = document.getElementById('chooseEggModal');
        if (modal) modal.classList.remove('show');
    }

    chooseEggForIncubator(rarity) {
        if (this._chooseEggSlotIndex === undefined) return;
        this.placeEggInIncubator(this._chooseEggSlotIndex, rarity);
        this.closeChooseEggModal();
    }

    isAutoIncubationUnlockedForSlot(slotIndex) {
        return slotIndex >= 0
            && slotIndex < 4
            && this.autoIncubation
            && slotIndex < (this.autoIncubation.unlockedAutoSlots || 0);
    }

    getAutoIncubationSettings(slotIndex) {
        const state = this.autoIncubation || this.createDefaultAutoIncubationState();
        const slotSettings = Array.isArray(state.slotSettings) ? state.slotSettings[slotIndex] : null;
        if (!slotSettings) return { enabled: false, priorityOrder: this.normalizePriorityOrder([]), autoCollectOnlyWhenReady: true };
        return {
            enabled: !!slotSettings.enabled,
            priorityOrder: this.normalizePriorityOrder(slotSettings.priorityOrder),
            autoCollectOnlyWhenReady: slotSettings.autoCollectOnlyWhenReady !== false
        };
    }

    setAutoIncubationEnabled(slotIndex, enabled) {
        if (!this.autoIncubation) this.autoIncubation = this.createDefaultAutoIncubationState();
        if (!this.isAutoIncubationUnlockedForSlot(slotIndex)) return;
        const settings = this.getAutoIncubationSettings(slotIndex);
        this.autoIncubation.slotSettings[slotIndex] = {
            ...settings,
            enabled: !!enabled
        };
        this.updateIncubatorsDisplay();
        this.saveGame();
    }

    cycleIncubatorPriority(slotIndex) {
        if (!this.autoIncubation || !this.isAutoIncubationUnlockedForSlot(slotIndex)) return;
        const settings = this.getAutoIncubationSettings(slotIndex);
        const current = settings.priorityOrder[0] || RARITY.LEGENDARY;
        const order = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.COMMON];
        const idx = order.indexOf(current);
        const nextFirst = order[(idx + 1) % order.length];
        const nextOrder = [nextFirst, ...order.filter(r => r !== nextFirst)];
        this.autoIncubation.slotSettings[slotIndex] = {
            ...settings,
            priorityOrder: nextOrder
        };
        this.updateIncubatorsDisplay();
        this.saveGame();
    }

    getSlotPriorityLabel(slotIndex) {
        const settings = this.getAutoIncubationSettings(slotIndex);
        const first = settings.priorityOrder[0] || RARITY.LEGENDARY;
        const labels = {
            [RARITY.LEGENDARY]: 'Légendaire',
            [RARITY.EPIC]: 'Epic',
            [RARITY.RARE]: 'Rare',
            [RARITY.COMMON]: 'Common'
        };
        return labels[first] || first;
    }

    pickNextEggByPriority(slotIndex) {
        const settings = this.getAutoIncubationSettings(slotIndex);
        const priorities = this.normalizePriorityOrder(settings.priorityOrder);
        for (const rarity of priorities) {
            if ((this.eggs[rarity] || 0) > 0) return rarity;
        }
        return null;
    }

    tryAutoRefillIncubator(slotIndex, options = {}) {
        if (slotIndex < 0 || slotIndex >= this.getMaxIncubatorSlots()) return false;
        if (this.incubators[slotIndex] != null) return false;
        if (!this.isAutoIncubationUnlockedForSlot(slotIndex)) return false;
        const settings = this.getAutoIncubationSettings(slotIndex);
        if (!settings.enabled) return false;
        const rarity = this.pickNextEggByPriority(slotIndex);
        if (!rarity) return false;
        const placed = this.placeEggInIncubator(slotIndex, rarity, { silent: options.silent !== false });
        if (placed && options.stats && options.stats.incubation) {
            options.stats.incubation.placedTotal++;
            options.stats.incubation.byRarityPlaced[rarity] = (options.stats.incubation.byRarityPlaced[rarity] || 0) + 1;
            options.stats.incubation.bySlotPlaced[slotIndex] = (options.stats.incubation.bySlotPlaced[slotIndex] || 0) + 1;
        }
        return placed;
    }

    processAutoIncubatorsOnline() {
        if (!this.autoIncubation) return;
        for (let i = 0; i < this.getMaxIncubatorSlots(); i++) {
            if (!this.isAutoIncubationUnlockedForSlot(i)) continue;
            const settings = this.getAutoIncubationSettings(i);
            if (!settings.enabled) continue;

            if (this.isIncubatorReady(i)) {
                this.openIncubatorEgg(i, { silent: true });
            }
            if (!this.incubators[i]) {
                this.tryAutoRefillIncubator(i, { silent: true });
            }
        }
    }

    createOfflineIncubationStats() {
        return {
            hatchedTotal: 0,
            placedTotal: 0,
            byRarity: {},
            bySlot: {},
            byRarityPlaced: {},
            bySlotPlaced: {},
            obtainedPokemonPreview: []
        };
    }

    pushOfflineIncubationPreview(stats, hatchResult) {
        const limit = typeof OFFLINE_INCUBATION_PREVIEW_LIMIT === 'number' ? OFFLINE_INCUBATION_PREVIEW_LIMIT : 12;
        if (!hatchResult || !hatchResult.creatureName) return;
        if (stats.obtainedPokemonPreview.length >= limit) return;
        stats.obtainedPokemonPreview.push({
            name: hatchResult.creatureName,
            rarity: hatchResult.rarity,
            isShiny: !!hatchResult.isShiny
        });
    }

    /**
     * Avance les incubateurs d'un chunk de temps (pour simulation progressive pendant le rattrapage).
     * Utilise stats.incubationVirtualTs et stats.offlineMissedTime ; met à jour slot.startTime en temps virtuel.
     */
    simulateIncubatorsChunk(chunkMs, statsContainer) {
        if (!chunkMs || chunkMs <= 0 || !statsContainer) return;
        const incubationStats = statsContainer.incubation || this.createOfflineIncubationStats();
        if (!statsContainer.incubation) statsContainer.incubation = incubationStats;
        if (statsContainer.incubationVirtualTs == null) {
            statsContainer.incubationVirtualTs = Date.now() - (statsContainer.offlineMissedTime || 0);
        }
        const virtualTs = statsContainer.incubationVirtualTs;

        for (let i = 0; i < this.getMaxIncubatorSlots(); i++) {
            if (!this.isAutoIncubationUnlockedForSlot(i)) continue;
            const settings = this.getAutoIncubationSettings(i);
            if (!settings.enabled) continue;

            let remainingMs = chunkMs;
            while (remainingMs > 0) {
                if (!this.incubators[i]) {
                    const placed = this.tryAutoRefillIncubator(i, { silent: true, stats: statsContainer });
                    if (!placed) break;
                    if (this.incubators[i]) this.incubators[i].startTime = virtualTs;
                }

                const slot = this.incubators[i];
                if (!slot) break;
                let slotRemaining = Math.max(0, Number(slot.durationMs) || 0);
                if (slot.startTime != null && slot.startTime < virtualTs) {
                    const elapsedBefore = virtualTs - slot.startTime;
                    slotRemaining = Math.max(0, slotRemaining - elapsedBefore);
                }
                if (slotRemaining <= remainingMs) {
                    remainingMs -= slotRemaining;
                    const result = this.openIncubatorEgg(i, { silent: true, offline: true, forceReady: true });
                    if (!result || !result.ok) break;
                    incubationStats.hatchedTotal++;
                    incubationStats.byRarity[result.rarity] = (incubationStats.byRarity[result.rarity] || 0) + 1;
                    incubationStats.bySlot[i] = (incubationStats.bySlot[i] || 0) + 1;
                    this.pushOfflineIncubationPreview(incubationStats, result);
                } else {
                    slot.durationMs = slotRemaining - remainingMs;
                    slot.startTime = virtualTs + remainingMs;
                    remainingMs = 0;
                }
            }
        }
        statsContainer.incubationVirtualTs = virtualTs + chunkMs;
    }

    simulateIncubatorsForElapsedOffline(elapsedMs, statsContainer) {
        if (!elapsedMs || elapsedMs <= 0) return;
        const incubationStats = statsContainer && statsContainer.incubation
            ? statsContainer.incubation
            : this.createOfflineIncubationStats();
        if (statsContainer && !statsContainer.incubation) statsContainer.incubation = incubationStats;
        const hiddenStartTs = Date.now() - elapsedMs;

        for (let i = 0; i < this.getMaxIncubatorSlots(); i++) {
            if (!this.isAutoIncubationUnlockedForSlot(i)) continue;
            const settings = this.getAutoIncubationSettings(i);
            if (!settings.enabled) continue;

            let remainingMs = elapsedMs;
            while (remainingMs > 0) {
                if (!this.incubators[i]) {
                    const placed = this.tryAutoRefillIncubator(i, { silent: true, stats: statsContainer });
                    if (!placed) break;
                }

                const slot = this.incubators[i];
                if (!slot) break;
                let slotRemaining = Math.max(0, Number(slot.durationMs) || 0);
                if (slot.startTime && slot.startTime < hiddenStartTs) {
                    const elapsedBeforeHidden = hiddenStartTs - slot.startTime;
                    slotRemaining = Math.max(0, slotRemaining - elapsedBeforeHidden);
                }
                if (slotRemaining <= remainingMs) {
                    remainingMs -= slotRemaining;
                    const result = this.openIncubatorEgg(i, { silent: true, offline: true, forceReady: true });
                    if (!result || !result.ok) break;
                    incubationStats.hatchedTotal++;
                    incubationStats.byRarity[result.rarity] = (incubationStats.byRarity[result.rarity] || 0) + 1;
                    incubationStats.bySlot[i] = (incubationStats.bySlot[i] || 0) + 1;
                    this.pushOfflineIncubationPreview(incubationStats, result);
                } else {
                    slot.durationMs = slotRemaining - remainingMs;
                    slot.startTime = Date.now();
                    remainingMs = 0;
                }
            }
        }
    }

    getStaminaRegenTime() {
        const baseTime = 10000;
        const reduction = this.upgrades.staminaRegen.level * 200;
        return Math.max(1000, baseTime - reduction);
    }

    // CORRECTION : Ajout du bonus de Badge Prestige (+10% Chance Shard)
    getShardBonusChance() {
        let chance = this.upgrades.shardBonus.level * 0.02; // Amélioration (Shop)

        // ✅ FIX : Ajout du Badge d'Arène (Prestige)
        chance += this.getAccountTalentBonus('shard_chance');

        // Bonus de la collection
        const collBonus = (this.getCollectionBonuses ? this.getCollectionBonuses() : {}).bonus_shard_chance || 0;
        chance += collBonus;

        return chance;
    }

    // Calcul du coût du prestige (Prestige + 1)
    getPrestigeCost(currentPrestige) {
        // Si aucun argument n'est passé (ex: pour l'affichage boutique), on renvoie 1 par défaut
        if (currentPrestige === undefined || currentPrestige === null) return 1;

        // Formule demandée : Prestige 0 (veut passer 1) = 1 Shard
        // Prestige 5 (veut passer 6) = 6 Shards
        let cost = currentPrestige + 1;

        // Note : L'amélioration "Maître du Prestige" (réduction de coût) est désactivée
        // avec cette formule pour éviter les coûts négatifs ou nuls.

        return Math.max(1, cost);
    }


    // CORRECTION : Ajout du bonus de badge (+2 slots Parmanie) au calcul
    getPensionSlots() {
        // 1. Slots achetés (Améliorations)
        const upgradeSlots = this.upgrades.pension.level;

        // 2. Slots permanents (Tour de combat)
        const towerSlots = this.permanentBoosts.pensionSlots || 0;

        // 3. ✅ FIX : Slots du Badge Parmanie
        const badgeSlots = this.getAccountTalentBonus('pension_slots');

        return upgradeSlots + towerSlots + badgeSlots;
    }

    getPensionTransferRate() {
        return this.upgrades.pension.level * 0.01;
    }

    getTeamContributionRate() {
        const baseContribution = 0.10;
        const towerBonus = this.permanentBoosts.team_contribution || 0;
        return baseContribution + towerBonus;
    }

    getUpgradeCost(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        if (!upgrade) return 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    }

    canAffordUpgrade(upgradeKey) {
        const cost = this.getUpgradeCost(upgradeKey);
        return this.pokedollars >= cost;
    }

    buyUpgrade(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        if (!upgrade) return false;

        if (upgrade.level >= upgrade.maxLevel) {
            logMessage("Cette amelioration est deja au niveau maximum !");
            return false;
        }

        const cost = this.getUpgradeCost(upgradeKey);
        if (!this.canAffordUpgrade(upgradeKey)) {
            logMessage("Pas assez de Pokedollars ! (" + this.pokedollars + "/" + cost + ")");
            return false;
        }

        this.pokedollars -= cost;
        this.stats.upgradesPurchased = (this.stats.upgradesPurchased || 0) + 1;
        this.checkAchievements('upgradesPurchased');

        this.checkSpecialQuests('money_spent');
        if (upgradeKey === 'pension') this.checkSpecialQuests('pensionUpgradeBought');
        if (upgradeKey === 'incubationSpeed') this.checkSpecialQuests('incubation_speed_upgraded');
        upgrade.level++;

        logMessage("Amelioration achetee : " + upgrade.name + " niveau " + upgrade.level + " !");

        this.updateUpgradesDisplay();
        this.updatePlayerStatsDisplay();
        this.updateTeamDisplay();
        this.updateStorageDisplay();
        this.updatePensionDisplay();



        return true;
    }


    updateSynergyDisplay() {
        const btn = document.getElementById('synergyBtn');
        if (!btn) return;

        // 1. Compter les types
        const typeCounts = {};
        this.playerTeam.forEach(c => {
            if (c.isAlive()) { // Seuls les vivants comptent pour l'activation
                typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
                if (c.secondaryType) typeCounts[c.secondaryType] = (typeCounts[c.secondaryType] || 0) + 1;
            }
        });

        // 2. Vérifier si AU MOINS UNE synergie est active
        let hasActiveSynergy = false;

        // On utilise some() pour s'arrêter dès qu'on en trouve une
        hasActiveSynergy = Object.values(TEAM_SYNERGIES).some(synergy => {
            if (synergy.all_required) {
                // Mode ET (Combinaison)
                return synergy.types.every(type => (typeCounts[type] || 0) >= synergy.min_count);
            } else {
                // Mode OU (Classique)
                return synergy.types.some(type => (typeCounts[type] || 0) >= synergy.min_count);
            }
        });

        // 3. Mettre à jour le sprite uniquement (synergy-on / synergy-off)
        const spriteName = hasActiveSynergy ? 'synergy-on' : 'synergy-off';
        if (hasActiveSynergy && typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('synergyActive');
        const img = btn.querySelector('.synergy-btn-sprite');
        if (img) img.src = `img/${spriteName}.png`;
        else btn.innerHTML = `<img src="img/${spriteName}.png" class="synergy-btn-sprite" alt="Synergies">`;
    }

    updateArenasDisplay() {
        const arenasContainer = document.getElementById('arenasContainer');
        const badgesList = document.getElementById('badgesList');

        if (!arenasContainer || !badgesList) return;

        // Afficher les badges obtenus
        badgesList.innerHTML = '';
        let badgesObtained = 0;

        Object.entries(ACCOUNT_TALENTS).forEach(([talentKey, talent]) => {
            if (this.hasBadge(talentKey)) {
                badgesObtained++;
                const badgeCard = document.createElement('div');
                badgeCard.style.cssText = 'padding: 10px; background: rgba(34, 197, 94, 0.2); border: 2px solid #22c55e; border-radius: 8px;';
                badgeCard.innerHTML = `
                <div style="font-weight: bold; color: #22c55e; margin-bottom: 5px;">✓ ${talent.name}</div>
                <div style="font-size: 12px; color: #666;">${talent.description}</div>
            `;
                badgesList.appendChild(badgeCard);
            }
        });

        if (badgesObtained === 0) {
            badgesList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Aucun badge obtenu. Complétez des arènes pour débloquer des talents !</div>';
        }

        // Afficher les arènes
        arenasContainer.innerHTML = '';

        Object.entries(ARENAS).forEach(([arenaId, arena]) => {
            const unlocked = this.isArenaUnlocked(arenaId);
            const completed = this.hasBadge(arena.badge);
            const talent = ACCOUNT_TALENTS[arena.badge];

            const arenaCard = document.createElement('div');
            arenaCard.className = 'upgrade-card';
            if (completed) arenaCard.classList.add('arena-completed');
            if (!unlocked) arenaCard.classList.add('arena-locked');

            const requiredZone = ZONES[arena.requiredZone];
            const requiredZoneName = requiredZone ? requiredZone.name : "Zone " + arena.requiredZone;

            arenaCard.innerHTML = `
            <div class="upgrade-title">${arena.name}</div>
            <div class="upgrade-description">
                <strong>Champion:</strong> ${arena.championName}<br>
                <strong>Type:</strong> ${arena.type}<br>
                <strong>Niveau:</strong> ${arena.teamLevel}<br>
                <strong>Équipe:</strong> 6 Pokémon<br>
                <strong>Temps limite:</strong> Aucun (durée illimitée)
            </div>
            <div class="arena-reward-box">
                <div class="arena-reward-title">Récompense: ${talent.name}</div>
                <div class="arena-reward-desc">${talent.description}</div>
            </div>
            <div class="arena-unlock-status">
                ${unlocked ? '✓ Débloquée' : '🔒 Requiert: ' + requiredZoneName + ' complète'}
            </div>
            <button class="upgrade-btn" 
                    onclick="game.startArena(${arenaId})" 
                    ${!unlocked || completed ? 'disabled' : ''}>
                ${completed ? '✓ BADGE OBTENU' : (unlocked ? 'COMBATTRE' : 'VERROUILLÉ')}
            </button>
        `;

            arenasContainer.appendChild(arenaCard);
        });
    }
    updateUpgradesDisplay() {
        if (typeof updateUpgradesDisplayUI === 'function') updateUpgradesDisplayUI(this);
    }

    determineEggRarity() {
        const roll = Math.random() * 100;
        let cumulative = 0;

        for (const [rarity, chance] of Object.entries(RARITY_CHANCES)) {
            cumulative += chance;
            if (roll <= cumulative) {
                return rarity;
            }
        }
        return RARITY.COMMON;
    }

    addEgg(rarity) {
        this.eggs[rarity]++;
        logMessage("Oeuf " + rarity + " obtenu !");
    }




    // OPTIMISATION : Ouverture d'œuf nettoyée avec Fusion Centralisée
    // fromIncubator = true : l'œuf vient d'un incubateur (déjà retiré de l'inventaire au placement)
    openEgg(rarity, fromIncubator = false, options = {}) {
        const silent = !!options.silent;
        const source = options.source || (fromIncubator ? 'incubator' : 'manual');
        const slotIndex = Number.isInteger(options.slotIndex) ? options.slotIndex : null;
        const offline = !!options.offline;
        if (!fromIncubator) {
            if (this.eggs[rarity] <= 0) {
                if (!silent) logMessage("Aucun oeuf de cette rareté disponible !");
                return { ok: false, reason: 'no_egg', rarity, source, slotIndex };
            }
            this.eggs[rarity]--;
        }

        // 1. Mise à jour des stats et quêtes d'ouverture
        this.stats.eggsOpened++;
        this.checkSpecialQuests('eggsOpened');

        if (!silent) {
            logMessage("Ouverture d'un oeuf " + rarity + "...");
        }

        // 2. Génération de la créature
        const egg = new Egg(rarity);
        const creature = egg.open();

        // 3. Gestion Pokédex
        const pokedexKey = creature.name + "_" + creature.type + "_" + creature.rarity;
        if (!this.pokedex[pokedexKey]) {
            this.pokedex[pokedexKey] = {
                discovered: true,
                count: 1,
                shinyCount: creature.isShiny ? 1 : 0,
                hasShiny: creature.isShiny,
                name: creature.name,
                type: creature.type,
                rarity: creature.rarity,
                firstDiscoveredAt: Date.now()
            };
            logMessage("NOUVEAU ! " + creature.name + (creature.isShiny ? " ✨SHINY✨" : "") + " ajouté au Pokedex !");
            this.checkSpecialQuests('new_discovery');
        } else {
            this.pokedex[pokedexKey].count++;
            if (creature.isShiny && !this.pokedex[pokedexKey].hasShiny) {
                this.pokedex[pokedexKey].hasShiny = true;
            }
        }

        // 4. Gestion Shiny & Légendaire (Feedback)
        if (creature.isShiny) {
            this.stats.shiniesObtained++;
            this.checkSpecialQuests('shiniesObtained');
            if (!silent) toast.shiny('✨ SHINY OBTENU !', `${creature.name} brille de mille feux !`);
        }

        if (creature.rarity === RARITY.LEGENDARY) {
            this.checkSpecialQuests('legendary_obtained');
            if (!creature.isShiny) {
                if (!silent) toast.legendary('👑 LÉGENDAIRE !', `${creature.name} rejoint votre collection !`);
            }
        }

        // 5. Recherche de doublon (Fusion)
        const existingCreature = this.findCreatureByName(creature.name, creature.isShiny);

        if (existingCreature) {
            // ✅ APPEL DE LA FUSION CENTRALISÉE
            const result = this.processFusion(creature, existingCreature);

            let msg = `♻️ DOUBLON : ${creature.name} recyclé en ${result.shards} Shards.`;
            if (result.ivImproved) msg += " IVs Améliorés !";
            if (result.becameShiny) msg += " ✨ DEVIENT SHINY !"; // Cas rare fusion Normal->Shiny

            if (!silent) logMessage(msg);

            // Toast de feedback
            if (result.improved) {
                if (!silent) toast.success("Fusion Réussie !", `${existingCreature.name} est plus fort ! (+${result.shards} Shards)` + (result.ivImproved ? " IVs améliorés" : ""));
            } else {
                // Optionnel : Toast discret pour le farm
                // toast.info("Doublon", `+${result.shards} Shards`); 
            }

            // La 'creature' temporaire est abandonnée au Garbage Collector ici

        } else {
            // CE N'EST PAS UN DOUBLON -> Ajout à l'équipe/stockage puis événements
            this.stats.creaturesObtained++;
            const maxTeamSize = 6 + this.getAccountTalentBonus('team_slot');
            if (this.playerTeam.length < maxTeamSize) {
                this.playerTeam.push(creature);
            } else {
                this.storage.push(creature);
            }
            this.checkSpecialQuests('creature_obtained', {
                creatureType: creature.type,
                secondaryType: creature.secondaryType
            });
            this.checkSpecialQuests('creature_hatched');
            if (creature.rarity === 'rare') {
                this.checkSpecialQuests('rareObtained', { rarity: 'rare' });
            }
        }

        if (source === 'incubator') {
            this.checkSpecialQuests('incubator_hatched', { rarity: creature.rarity, slotIndex });
            if (this.getRarityValue(creature.rarity) >= this.getRarityValue(RARITY.RARE)) {
                this.checkSpecialQuests('incubator_hatched_rare_plus', { rarity: creature.rarity, slotIndex });
            }
            if (creature.rarity === RARITY.EPIC) {
                this.checkSpecialQuests('incubator_hatched_epic', { rarity: creature.rarity, slotIndex });
            }
            if (creature.rarity === RARITY.LEGENDARY) {
                this.checkSpecialQuests('incubator_hatched_legendary', { rarity: creature.rarity, slotIndex });
            }
        }

        // 6. Affichage final
        // ⚠️ Pas de modale d'éclosion en mode offline (rattrapage)
        if (!offline && !silent) {
            this.showEggHatchModal(creature, rarity);
        } else {
            if (!offline && source === 'incubator') {
                this.showAutoEggHatchMiniModal(creature, rarity);
            }
            // Ne pas re-rendre toute l'UI pour chaque œuf en simulation offline — catastrophique en perf
            if (!offline) this.updateDisplay();
        }

        return {
            ok: true,
            source,
            slotIndex,
            rarity: creature.rarity,
            creatureName: creature.name,
            isShiny: !!creature.isShiny
        };
    }

    // --- GESTION DU POKÉMART (ÉPICERIE) ---

    updatePokeMartDisplay() {
        if (typeof updatePokeMartDisplayUI === 'function') updatePokeMartDisplayUI(this);
    }

    buyPokeMartItem(key) {
        const item = POKEMART_ITEMS[key];
        if (!item) return;

        if (this.pokedollars < item.cost) {
            logMessage("Pas assez de Pokédollars !");
            return;
        }

        // Transaction
        this.pokedollars -= item.cost;
        this.checkSpecialQuests('money_spent'); // Important pour les quêtes "Économe" ou "Dépensier"

        // Ajout de l'objet
        this.addItem(item.itemId, item.amount);

        // Feedback
        logMessage(`Achat : ${item.amount}x ${item.name} pour ${item.cost}$`);

        // Mise à jour des affichages
        this.updatePokeMartDisplay();
        this.updatePlayerStatsDisplay(); // Pour mettre à jour l'argent dans le header
        this.updateItemsDisplay(); // Pour le sac à dos
    }

    showEggHatchModal(creature, rarity) {
        if (this.isOfflineSimulating) return;
        const modal = document.getElementById('eggHatchModal');
        const content = document.getElementById('eggHatchContent');
        if (!modal || !content) return;

        const payload = this.buildEggHatchDisplayPayload(creature, rarity);
        const data = payload.data;
        const contentClass = payload.contentClass;
        if (typeof showEggHatchModalUI === 'function') showEggHatchModalUI(modal, content, data, { contentClass, rarity });
    }

    buildEggHatchDisplayPayload(creature, rarity) {
        let title = "Un Œuf éclot !";
        if (creature.isShiny) title = "✨ SHINY OBTENU ! ✨";
        else if (creature.rarity === RARITY.LEGENDARY) title = "👑 LÉGENDAIRE OBTENU ! 👑";

        let talentHTML = '';
        if (creature.passiveTalent) {
            const talent = creature.getTalentInfo();
            talentHTML = `<div style="font-size: 14px; margin-top: 5px;"><strong>Talent:</strong> ${talent.name}</div>`;
        }
        let ultimateHTML = '';
        if (creature.ultimateAbility) {
            ultimateHTML = `<div style="font-size: 14px; margin-top: 5px;"><strong>Ultime:</strong> ${creature.ultimateAbility.name}</div>`;
        }

        const statsHTML = `<strong>Stats de base :</strong><br>
                ⚔️ ${creature.attack} | 🛡️ ${creature.defense} | 👟 ${creature.speed} | ❤️ ${creature.maxHp}
                <br>
                <span style='color:#007bff; font-weight:bold;'>🧬 IVs: ${creature.ivHP} / ${creature.ivAttack} / ${creature.ivDefense} / ${creature.ivSpeed}</span>
                ${talentHTML}
                ${ultimateHTML}`;

        return {
            data: {
                title,
                rarity,
                spriteUrl: getPokemonSpriteUrl(creature.name, creature.isShiny, false),
                name: creature.name,
                type: creature.type,
                secondaryType: creature.secondaryType || '',
                statsHTML
            },
            contentClass: creature.isShiny ? 'shiny' : (creature.rarity === RARITY.LEGENDARY ? 'legendary' : '')
        };
    }

    showAutoEggHatchMiniModal(creature, rarity) {
        if (this.isOfflineSimulating) return;
        if (typeof renderEggHatchModalContent !== 'function') return;
        const payload = this.buildEggHatchDisplayPayload(creature, rarity);
        let container = document.getElementById('autoEggHatchMiniContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'autoEggHatchMiniContainer';
            container.className = 'auto-egg-hatch-mini-container';
            document.body.appendChild(container);
        }

        const card = document.createElement('div');
        card.className = `auto-egg-hatch-mini quest-completion-content ${payload.contentClass || ''} rarity-${rarity}`;
        card.innerHTML = renderEggHatchModalContent(payload.data);
        const actionBtn = card.querySelector('.btn-super-confirm');
        if (actionBtn) actionBtn.remove();
        container.prepend(card);

        while (container.children.length > 3) {
            container.removeChild(container.lastElementChild);
        }

        requestAnimationFrame(() => card.classList.add('show'));
        setTimeout(() => {
            card.classList.remove('show');
            setTimeout(() => {
                if (card.parentNode) card.parentNode.removeChild(card);
            }, 220);
        }, 3200);
    }

    closeEggHatchModal() {
        if (typeof closeEggHatchModalUI === 'function') closeEggHatchModalUI();
        this.updateDisplay();
    }

    // ✅ REMPLACEZ VOTRE FONCTION showCreatureModal PAR CELLE-CI


    // UI : Affiche la liste des objets équipables (rendu délégué à uiManager)
    showItemSelectModal(creatureIndex, location) {
        const itemsData = [];
        Object.keys(this.items).forEach(itemKey => {
            if (this.items[itemKey] > 0 && typeof HELD_ITEMS !== 'undefined' && HELD_ITEMS[itemKey]) {
                const itemDef = HELD_ITEMS[itemKey];
                let iconHtml = itemDef.icon || '🎒';
                if (itemDef.img) iconHtml = `<img src="${itemDef.img}" style="width:32px; height:32px; vertical-align:middle;">`;
                itemsData.push({
                    itemKey,
                    name: itemDef.name,
                    description: itemDef.description || '',
                    count: this.items[itemKey],
                    iconHtml
                });
            }
        });
        if (typeof showItemSelectModalUI === 'function') showItemSelectModalUI(itemsData, creatureIndex, location);
    }

    // LOGIQUE : Équiper l'objet
    equipItem(itemKey, creatureIndex, location) {
        let creature;
        if (location === 'team') creature = this.playerTeam[creatureIndex];
        else if (location === 'storage') creature = this.storage[creatureIndex];
        else if (location === 'pension') creature = this.pension[creatureIndex];

        if (!creature) return;

        // Sécurité stock
        if (!this.items[itemKey] || this.items[itemKey] <= 0) {
            toast.error("Erreur", "Vous n'avez plus cet objet !");
            return;
        }

        // 1. Si déjà un objet, on le retire d'abord (échange)
        if (creature.heldItem) {
            this.items[creature.heldItem] = (this.items[creature.heldItem] || 0) + 1;
        }

        // 2. On prend le nouveau
        this.items[itemKey]--;
        creature.heldItem = itemKey;

        // 3. Feedback & Update
        const itemName = HELD_ITEMS[itemKey] ? HELD_ITEMS[itemKey].name : itemKey;
        toast.success("Équipé !", `${creature.name} tient maintenant : ${itemName}`);
        logMessage(`🎒 ${creature.name} a été équipé avec ${itemName}.`);

        this.updateItemsDisplay();
        this.showCreatureModal(creatureIndex, location); // Rafraîchir le modal pour voir l'objet
    }

    // LOGIQUE : Retirer l'objet
    unequipItem(creatureIndex, location) {
        let creature;
        if (location === 'team') creature = this.playerTeam[creatureIndex];
        else if (location === 'storage') creature = this.storage[creatureIndex];
        else if (location === 'pension') creature = this.pension[creatureIndex];

        if (!creature || !creature.heldItem) return;

        // 1. Remettre en stock
        const itemKey = creature.heldItem;
        this.items[itemKey] = (this.items[itemKey] || 0) + 1;

        // 2. Retirer de la créature
        creature.heldItem = null;

        // 3. Feedback & Update
        const itemName = HELD_ITEMS[itemKey] ? HELD_ITEMS[itemKey].name : itemKey;
        toast.info("Retiré", `${itemName} remis dans le sac.`);

        this.updateItemsDisplay();
        this.showCreatureModal(creatureIndex, location); // Rafraîchir le modal
    }

    /** Affiche le modal pour choisir une CT à enseigner à la créature */
    showTeachCTModal(creatureIndex, location) {
        let creature;
        if (location === 'team') creature = this.playerTeam[creatureIndex];
        else if (location === 'storage') creature = this.storage[creatureIndex];
        else if (location === 'pension') creature = this.pension[creatureIndex];
        if (!creature) return;

        const ctEntries = Object.entries(this.items || {}).filter(([k, v]) => k.startsWith('ct_') && v > 0);
        if (ctEntries.length === 0) {
            if (typeof toast !== 'undefined') toast.info("Aucune CT", "Vous n'avez aucune CT en possession.");
            return;
        }

        const moveNameFromKey = (k) => k.replace(/^ct_/, '').replace(/_/g, ' ');
        let html = `<div class="creature-modal-info-box" style="padding:16px; max-height:400px; overflow-y:auto;"><h5 style="margin:0 0 12px 0; display:flex; align-items:center; gap:6px;"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png" alt="CT" style="width:18px; height:18px; image-rendering:pixelated;"> Choisir une CT à enseigner à ${creature.name}</h5>`;

        html += `<p style="font-size:12px; color:#94a3b8; margin-bottom:12px;">Attaque actuelle : <strong>${creature.getMove ? creature.getMove() : 'Charge'}</strong></p>`;

        const moveKeyMap = {};
        Object.keys(MOVES_DB || {}).forEach(mn => { moveKeyMap[mn.replace(/ /g, '_').replace(/'/g, '')] = mn; });
        ctEntries.forEach(([itemKey, qty]) => {
            const rawMove = itemKey.replace(/^ct_/, '');
            const moveName = MOVES_DB && Object.keys(MOVES_DB).find(m => 'ct_' + m === itemKey) || rawMove.replace(/_/g, ' ');
            const compat = typeof canLearnCT === 'function' ? canLearnCT(creature.name, moveName) : false;
            const moveDef = MOVES_DB && MOVES_DB[moveName];
            const typeColor = moveDef && TYPE_COLORS && TYPE_COLORS[moveDef.type] ? TYPE_COLORS[moveDef.type].bg : '#64748b';
            const compatText = compat ? '✓ Compatible' : '✗ Incompatible';
            const compatStyle = compat ? 'color:#22c55e' : 'color:#ef4444';
            html += `<button class="btn" style="width:100%; margin:6px 0; text-align:left; padding:10px; background:${compat ? typeColor + '22' : '#334155'}; border:2px solid ${typeColor}; color:${typeColor};" ${!compat ? 'disabled' : ''} onclick="game.teachCTToCreature(${creatureIndex}, '${location}', '${itemKey}'); document.getElementById('teachCTModal')?.remove();">
                <strong>${moveName}</strong> <span style="font-size:11px;">(x${qty})</span> — <span style="${compatStyle}">${compatText}</span>
            </button>`;
        });
        html += `<button class="btn" style="margin-top:12px; background:#64748b; color:white; width:100%;" onclick="document.getElementById('teachCTModal')?.remove();">Annuler</button></div>`;

        const overlay = document.createElement('div');
        overlay.id = 'teachCTModal';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10000;';
        overlay.innerHTML = html;
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);
    }

    /** Enseigne la CT à la créature (consomme la CT, remplace l'attaque) */
    teachCTToCreature(creatureIndex, location, ctItemKey) {
        let creature;
        if (location === 'team') creature = this.playerTeam[creatureIndex];
        else if (location === 'storage') creature = this.storage[creatureIndex];
        else if (location === 'pension') creature = this.pension[creatureIndex];
        if (!creature) return;

        const moveName = Object.keys(MOVES_DB || {}).find(m => 'ct_' + m === ctItemKey) || ctItemKey.replace(/^ct_/, '').replace(/_/g, ' ');
        if (!MOVES_DB || !MOVES_DB[moveName]) {
            if (typeof toast !== 'undefined') toast.error("Erreur", "CT inconnue.");
            return;
        }
        if (typeof canLearnCT !== 'function' || !canLearnCT(creature.name, moveName)) {
            if (typeof toast !== 'undefined') toast.error("Incompatible", `${creature.name} ne peut pas apprendre ${moveName}.`);
            return;
        }
        if (!this.items[ctItemKey] || this.items[ctItemKey] <= 0) {
            if (typeof toast !== 'undefined') toast.error("Manquant", "Vous n'avez plus cette CT.");
            return;
        }

        const oldMove = creature.getMove ? creature.getMove() : 'Charge';
        creature.currentMove = moveName;
        this.items[ctItemKey]--;
        if (this.items[ctItemKey] <= 0) delete this.items[ctItemKey];

        if (typeof toast !== 'undefined') toast.success("CT utilisée !", `${creature.name} a appris ${moveName} (remplace ${oldMove}).`);
        if (typeof logMessage === 'function') logMessage(`📿 ${creature.name} a appris ${moveName} !`);
        this.updateItemsDisplay();
        this.saveGame();
        this.showCreatureModal(creatureIndex, location);
    }

    // UI : Affiche le détail d'une créature (Version Corrigée avec Prisme)
    showCreatureModal(index, location) {
        let creature;
        if (location === 'team') creature = this.playerTeam[index];
        else if (location === 'storage') creature = this.storage[index];
        else if (location === 'pension') creature = this.pension[index];

        if (!creature) return;

        const modal = document.getElementById('creatureModal');
        const content = document.getElementById('creatureModalContent');
        if (!modal || !content) return;

        const spriteUrl = getPokemonSpriteUrl(creature.name, creature.isShiny, false);
        const maxLevel = 100 + (creature.prestige * 10);

        // --- PRÉPARATION DES DONNÉES (LOGIQUE JS) ---
        // On calcule tout ICI, AVANT de commencer à écrire le HTML

        // 1. Talent
        let talentHTML = '<div><strong>Talent:</strong> Aucun</div>';
        if (creature.passiveTalent) {
            const talent = creature.getTalentInfo();
            talentHTML = `<div style="border-left: 4px solid #a855f7; padding-left: 8px; margin-bottom: 5px;">
                <strong>Talent: ${talent.name}</strong><br>
                <span style="font-size: 12px; color: #555;">${talent.description}</span>
            </div>`;
        }

        // 2. Ultime
        let ultimateHTML = '<div><strong>Ultime:</strong> Aucun</div>';
        if (creature.ultimateAbility) {
            const ult = creature.ultimateAbility;
            ultimateHTML = `<div style="border-left: 4px solid #f59e0b; padding-left: 8px;">
                <strong>Ultime: ${ult.name}</strong> (${ult.chargeNeeded} charge)<br>
                <span style="font-size: 12px; color: #555;">${ult.description}</span>
            </div>`;
        }

        // 3. Objet Tenu
        let itemHTML = '';
        if (creature.heldItem) {
            const item = HELD_ITEMS[creature.heldItem];
            if (item) {
                itemHTML = `
                    <div class="held-item-slot equipped" onclick="game.unequipItem(${index}, '${location}')">
                        <div style="font-weight:bold; color:#667eea;">🎒 ${item.name}</div>
                        <div style="font-size:11px;">${item.effect ? (item.description || 'Effet actif') : ''}</div>
                        <div style="font-size:10px; color:#ef4444; margin-top:5px;">(Cliquer pour retirer)</div>
                    </div>
                `;
            }
        } else {
            itemHTML = `
                <div class="held-item-slot" onclick="game.showItemSelectModal(${index}, '${location}')">
                    <div style="color:#999;">Emplacement d'objet vide</div>
                    <div style="font-size:11px; font-weight:bold;">+ Équiper un objet</div>
                </div>
            `;
        }

        // 4. ✅ BOUTON PRISME (Préparé ici)
        let ivButton = '';
        if (this.items['prism_iv'] && this.items['prism_iv'] > 0) {
            ivButton = `<button onclick="game.optimizeCreatureIVs(${index}, '${location}')" 
                style="font-size:10px; padding:2px 6px; background:linear-gradient(135deg, #a855f7, #ec4899); color:white; border:none; border-radius:4px; cursor:pointer; margin-left:5px; display:flex; align-items:center; gap:4px;">
                <img src="img/Prism.png" class="shard-inline" alt=""> Optimiser
            </button>`;
        }

        // 5. Prestige
        const tokens = creature.prestigeTokens || 0;
        const bonuses = creature.prestigeBonuses || { hp: 0, attack: 0, spattack: 0, defense: 0, spdefense: 0, speed: 0 };
        let tokenDisplay = '';
        if (tokens > 0) {
            tokenDisplay = `<div class="creature-modal-tokens">⭐ <strong>${tokens} Jetons de Prestige</strong> — Améliorez une stat ci-dessous.</div>`;
        }

        // Helper affichage ligne de stat
        const statLine = (label, value, statKey, icon, ivVal) => {
            let btnHTML = '';
            if (tokens > 0) {
                btnHTML = `<button onclick="game.spendPrestigeToken(${index}, '${location}', '${statKey}')" 
                           style="padding:0 6px; font-size:10px; margin-left:5px; background:#22c55e; color:white; border:none; border-radius:4px; cursor:pointer; transition:0.2s;"
                           onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                           +5%
                           </button>`;
            }
            let bonusText = '';
            if (bonuses[statKey] > 0) {
                bonusText = `<span style="font-size:10px; color:#22c55e; font-weight:bold; margin-left:3px;">(+${bonuses[statKey] * 5}%)</span>`;
            }
            const ivTitle = 'IV (Valeur Individuelle)';
            const ivDesc = 'Bonus permanent à cette stat (0-31). Plus la valeur est haute, plus la stat finale est élevée.';
            const ivStr = (ivVal !== undefined && ivVal !== null) ? ` <span class="stat-iv stat-iv-tooltip" onmouseenter="game.scheduleTooltip(event, '${ivTitle}', '${ivDesc}')" onmouseleave="game.hideTooltip()">IV (${ivVal})</span>` : '';
            return `<div class="stat-item-inner">${icon} <strong>${label}:</strong> <span class="stat-value">${formatNumber(value)}</span>${ivStr} ${bonusText} ${btnHTML}</div>`;
        };

        // --- RÉCUPÉRATION DE L'ATTAQUE ---
        const moveName = creature.getMove ? creature.getMove() : 'Charge';
        const move = MOVES_DB[moveName];
        const moveCategoryClass = move.category === 'special' ? 'special' : 'physical';
        const moveTypeColors = (typeof TYPE_COLORS !== 'undefined' && TYPE_COLORS[move.type]) ? TYPE_COLORS[move.type] : { bg: '#868e96', text: '#fafafa' };
        const moveTypeBg = moveTypeColors.bg;
        const moveTypeText = moveTypeColors.text;

        // Bouton CT inline (présent seulement si le joueur a des CTs)
        const ctCount = Object.keys(this.items || {}).filter(k => k.startsWith('ct_') && this.items[k] > 0).length;
        const ctBtnHTML = ctCount > 0
            ? `<button class="btn-ct-inline" title="Enseigner une CT (${ctCount} disponible${ctCount > 1 ? 's' : ''})" onclick="game.showTeachCTModal(${index}, '${location}')"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png" alt="CT" class="btn-ct-sprite"></button>`
            : '';


        const moveHTML = `
            <div class="creature-modal-info-box creature-modal-move-box" style="border-left-color: ${moveTypeBg};">
                <h5 class="creature-modal-move-title" style="color: ${moveTypeBg};">Attaque</h5>
                <div class="modal-move-details">
                    <span class="move-pill" style="background: ${moveTypeBg}; color: ${moveTypeText};">${move.name}</span>
                    <span class="move-category ${moveCategoryClass}">${move.category}</span>
                    <span class="move-power">Pui. ${move.power}</span>
                    ${ctBtnHTML}
                </div>
            </div>
        `;

        // --- RENDU DÉLÉGUÉ À uiManager ---
        const actionsHTML = this.generateCreatureActionsHTML(creature, index, location, maxLevel);
        const statsRowsHTML = `
            <div class="stat-item"><strong>Niv.</strong> <span class="stat-value">${creature.level} / ${maxLevel}</span></div>
            <div class="stat-item">${statLine('HP', creature.maxHp, 'hp', '❤️', creature.ivHP)}</div>
            <div class="stat-item">${statLine('Att', creature.attack, 'attack', '⚔️', creature.ivAttack)}</div>
            <div class="stat-item">${statLine('Atq.Sp', creature.spattack, 'spattack', '💥', creature.ivSpAttack)}</div>
            <div class="stat-item">${statLine('Déf', creature.defense, 'defense', '🛡️', creature.ivDefense)}</div>
            <div class="stat-item">${statLine('Déf.Sp', creature.spdefense, 'spdefense', '💠', creature.ivSpDefense)}</div>
            <div class="stat-item">${statLine('Vit', creature.speed, 'speed', '👟', creature.ivSpeed)}</div>
            <div class="stat-item"><strong>End.</strong> <span class="stat-value">${creature.currentStamina} / ${creature.maxStamina}</span></div>
        `;
        const titleLine = `${creature.name} ${creature.isShiny ? '✨' : ''} ${creature.prestige > 0 ? `★${creature.prestige}` : ''}`;
        const data = {
            titleLine,
            spriteUrl,
            creatureName: creature.name,
            type: creature.type,
            secondaryType: creature.secondaryType || '',
            rarity: creature.rarity,
            tokenDisplay,
            ivButton,
            statsRowsHTML,
            moveHTML,
            talentHTML,
            ultimateHTML,
            itemHTML,
            actionsHTML: actionsHTML.length > 0 ? actionsHTML : '<span style="font-size:12px;color:#999;">Aucune action.</span>'
        };
        if (typeof renderCreatureModalContent === 'function') {
            content.innerHTML = renderCreatureModalContent(data);
            modal.classList.add('show');
        }
    }

    resolveEvolutionConditionItem(condition) {
        if (!condition) return null;
        if (typeof EVOLUTION_CONDITION_ITEM_MAP !== 'undefined' && EVOLUTION_CONDITION_ITEM_MAP[condition]) {
            return EVOLUTION_CONDITION_ITEM_MAP[condition];
        }
        return condition;
    }

    getCreatureByLocation(location, creatureIndex) {
        if (location === 'team') return this.playerTeam[creatureIndex];
        if (location === 'storage') return this.storage[creatureIndex];
        if (location === 'pension') return this.pension[creatureIndex];
        return null;
    }

    getAvailableEvolutionOptions(creature) {
        const evolutionData = EVOLUTIONS[creature && creature.name];
        if (!evolutionData) return [];

        const hasItem = (itemKey) => !!(itemKey && this.items && this.items[itemKey] > 0);
        const options = [];
        const pushOptionIfValid = (raw) => {
            if (!raw) return;
            const requiredItem = this.resolveEvolutionConditionItem(raw.conditionItem || raw.condition || null);
            const requiredLevel = Number(raw.level != null ? raw.level : evolutionData.level);
            const evolvesTo = raw.evolves_to || evolutionData.evolves_to;
            const newType = raw.new_type || evolutionData.new_type;
            if (!evolvesTo) return;

            const levelOk = Number.isFinite(requiredLevel) ? creature.level >= requiredLevel : true;
            const itemOk = requiredItem ? hasItem(requiredItem) : true;
            if (!levelOk || !itemOk) return;

            options.push({
                evolves_to: evolvesTo,
                new_type: newType,
                requiredItem,
                requiredLevel: Number.isFinite(requiredLevel) ? requiredLevel : null
            });
        };

        if (Array.isArray(evolutionData.options) && evolutionData.options.length > 0) {
            evolutionData.options.forEach(pushOptionIfValid);
            return options;
        }

        pushOptionIfValid({
            conditionItem: evolutionData.condition,
            level: evolutionData.level,
            evolves_to: evolutionData.evolves_to,
            new_type: evolutionData.new_type
        });
        return options;
    }

    showEvolutionChoiceModal(creatureIndex, location) {
        const creature = this.getCreatureByLocation(location, creatureIndex);
        if (!creature) return;
        const options = this.getAvailableEvolutionOptions(creature);
        if (options.length === 0) {
            logMessage("⛔ Aucune évolution disponible pour le moment.");
            return;
        }
        if (options.length === 1) {
            this.evolveCreature(creatureIndex, location, options[0]);
            return;
        }
        if (typeof showEvolutionChoiceModalUI === 'function') {
            showEvolutionChoiceModalUI({
                creatureName: creature.name,
                creatureIndex,
                location,
                options
            });
        }
    }

    evolveCreatureWithOption(creatureIndex, location, optionIndex) {
        const creature = this.getCreatureByLocation(location, creatureIndex);
        if (!creature) return;
        const options = this.getAvailableEvolutionOptions(creature);
        const option = options[optionIndex];
        if (!option) {
            logMessage("⛔ Option d'évolution invalide.");
            return;
        }
        this.evolveCreature(creatureIndex, location, option);
    }

    // Helper pour ne pas surcharger la fonction principale
    generateCreatureActionsHTML(creature, index, location, maxLevel) {
        let actionsHTML = '';
        const maxTeamSize = 6 + this.getAccountTalentBonus('team_slot');
        const maxPensionSlots = this.getPensionSlots();
        const isTowerActive = this.towerState.isActive;
        const canUsePension = maxPensionSlots > 0;

        if (location === 'team') {
            if (this.playerTeam.length > 1) {
                actionsHTML += `<button class="btn" style="background: #6b7280; color: white; border: 2px solid #4b5563; box-shadow: 0 4px 0 #374151;" onclick="game.moveToStorage(${index}); game.closeCreatureModal();" ${isTowerActive ? 'disabled' : ''}>${isTowerActive ? 'VERROUILLÉ' : 'Stocker'}</button>`;
            }
            if (canUsePension && this.pension.length < maxPensionSlots && this.playerTeam.length > 1) {
                actionsHTML += `<button class="btn" style="background: #6b7280; color: white; border: 2px solid #4b5563; box-shadow: 0 4px 0 #374151;" onclick="game.moveToPension(${index}, true); game.closeCreatureModal();" ${isTowerActive ? 'disabled' : ''}>${isTowerActive ? 'VERROUILLÉ' : 'Pension'}</button>`;
            }
        } else if (location === 'storage') {
            if (this.playerTeam.length < maxTeamSize) {
                actionsHTML += `<button class="btn" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1f2937; font-weight: 800; box-shadow: 0 4px 0 #d97706;" onclick="game.moveToTeam(${index}); game.closeCreatureModal();" ${isTowerActive ? 'disabled' : ''}>${isTowerActive ? 'VERROUILLÉ' : 'Vers Équipe'}</button>`;
            }
            if (canUsePension && this.pension.length < maxPensionSlots) {
                actionsHTML += `<button class="btn" style="background: #6b7280; color: white; border: 2px solid #4b5563; box-shadow: 0 4px 0 #374151;" onclick="game.moveToPension(${index}, false); game.closeCreatureModal();">Pension</button>`;
            }
            if (this.activeExpeditions.length < this.maxExpeditionSlots) {
                actionsHTML += `<button class="btn" style="background: #0dcaf0; color: white;" onclick="game.showExpeditionSendModal(${index}); game.closeCreatureModal();">🗺️ Envoyer</button>`;
            }
        } else if (location === 'pension') {
            if (this.playerTeam.length < maxTeamSize) {
                actionsHTML += `<button class="btn" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1f2937; font-weight: 800; box-shadow: 0 4px 0 #d97706;" onclick="game.moveFromPension(${index}, true); game.closeCreatureModal();" ${isTowerActive ? 'disabled' : ''}>${isTowerActive ? 'VERROUILLÉ' : 'Vers Équipe'}</button>`;
            }
            actionsHTML += `<button class="btn" style="background: #6b7280; color: white; border: 2px solid #4b5563; box-shadow: 0 4px 0 #374151;" onclick="game.moveFromPension(${index}, false); game.closeCreatureModal();">Stockage</button>`;
        }


        // Évolution
        const evolutionOptions = this.getAvailableEvolutionOptions(creature);
        if (evolutionOptions.length > 0) {
            const existingDuplicate = (evolutionOptions.length === 1)
                ? this.findCreatureByName(evolutionOptions[0].evolves_to, creature.isShiny)
                : null;
            const label = existingDuplicate ? "🧬 FUSIONNER" : "✨ ÉVOLUER";
            const color = existingDuplicate ? "linear-gradient(135deg, #a855f7, #9333ea)" : "linear-gradient(135deg, #34d399, #059669)";
            const actionFn = evolutionOptions.length > 1 ? 'showEvolutionChoiceModal' : 'evolveCreature';
            actionsHTML += `<button class="btn" style="background: ${color}; color: white; animation: pulse-reward 2s infinite;" onclick="game.${actionFn}(${index}, '${location}');">${label}</button>`;
        }

        // Prestige
        const canPrestige = creature.level >= maxLevel;
        if (canPrestige) {
            const shardKey = getShardKey(creature.name, creature.rarity);
            const currentShards = this.shards[shardKey] || 0;
            const prestigeCost = this.getPrestigeCost(creature.prestige);

            if (currentShards >= prestigeCost) {
                actionsHTML += `<button class="btn btn-prestige" style="background: linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24); color: #1f2937; font-weight: 900; text-transform: uppercase; box-shadow: 0 4px 0 #d97706, 0 0 20px rgba(251, 191, 36, 0.5); animation: pulse-glow 2s infinite;" onclick="game.prestigeCreature(${index}, '${location}'); game.closeCreatureModal();">⭐ PRESTIGE (${prestigeCost})</button>`;
            } else {
                actionsHTML += `<button class="btn" disabled style="background: #9ca3af; color: #4b5563; border: 2px solid #6b7280;">⭐ PRESTIGE (${currentShards}/${prestigeCost})</button>`;
            }
        }

        // Reroll / Choix Talent
        if (creature.passiveTalent) {
            if (this.talentRerolls > 0) {
                actionsHTML += `<button class="btn" style="background: #a855f7; color: white;" onclick="game.useTalentReroll(${index}, '${location}')">🔮 Reroll (${this.talentRerolls})</button>`;
            }
            if (this.talentChoices > 0) {
                actionsHTML += `<button class="btn" style="background: #f59e0b; color: white;" onclick="game.useTalentChoice(${index}, '${location}'); game.closeCreatureModal();">🌟 Choisir (${this.talentChoices})</button>`;
            }
        }

        // Note : le bouton CT est affiché directement dans la zone move-details du modal

        return actionsHTML;
    }

    closeCreatureModal() {
        if (typeof closeCreatureModalUI === 'function') closeCreatureModalUI();
        this.updateDisplay();
    }

    showPensionContributionPopover(creatureIndex, triggerElement) {
        if (this._pensionPopoverHideTimeout) {
            clearTimeout(this._pensionPopoverHideTimeout);
            this._pensionPopoverHideTimeout = null;
        }
        const creature = this.pension[creatureIndex];
        if (!creature) return;
        const rate = this.getPensionTransferRate();
        const transferRate = (rate * 100).toFixed(0);
        const contributedHP = Math.floor(creature.maxHp * rate);
        const contributedATK = Math.floor(creature.attack * rate);
        const contributedSpATK = Math.floor(creature.spattack * rate);
        const contributedDEF = Math.floor(creature.defense * rate);
        const contributedSpDEF = Math.floor(creature.spdefense * rate);
        const contributedSPD = Math.floor(creature.speed * rate);
        const totalContribution = Math.floor(contributedHP / 2 + contributedATK + contributedSpATK + contributedDEF + contributedSpDEF + contributedSPD);
        const content = document.getElementById('pensionContributionContent');
        const popover = document.getElementById('pensionContributionPopover');
        if (!content || !popover) return;
        content.innerHTML = `
            <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">${creature.name} — Contribution (${transferRate}%)</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <th style="text-align: left; padding: 4px 8px 4px 0;">Stat</th>
                        <th style="text-align: right; padding: 4px 0;">Valeur</th>
                        <th style="text-align: right; padding: 4px 0 4px 8px;">Contribution</th>
                    </tr>
                </thead>
                <tbody style="color: #334155;">
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">❤️ PV</td><td style="text-align: right;">${creature.maxHp}</td><td style="text-align: right; color: #ff1493; font-weight: bold; padding-left: 8px;">+${contributedHP}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">⚔️ Attaque</td><td style="text-align: right;">${creature.attack}</td><td style="text-align: right; color: #ff1493; font-weight: bold; padding-left: 8px;">+${contributedATK}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">✨ Att. spéciale</td><td style="text-align: right;">${creature.spattack}</td><td style="text-align: right; color: #ff1493; font-weight: bold; padding-left: 8px;">+${contributedSpATK}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">🛡️ Défense</td><td style="text-align: right;">${creature.defense}</td><td style="text-align: right; color: #ff1493; font-weight: bold; padding-left: 8px;">+${contributedDEF}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">🌟 Déf. spéciale</td><td style="text-align: right;">${creature.spdefense}</td><td style="text-align: right; color: #ff1493; font-weight: bold; padding-left: 8px;">+${contributedSpDEF}</td></tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px 4px 0;">👟 Vitesse</td><td style="text-align: right;">${creature.speed}</td><td style="text-align: right; color: #ff1493; font-weight: bold; padding-left: 8px;">+${contributedSPD}</td></tr>
                    <tr><td colspan="2" style="padding: 6px 8px 4px 0; font-weight: bold; border-top: 1px solid #e2e8f0;">📊 Contribution totale</td><td style="text-align: right; padding: 6px 0 4px 8px; color: #ff1493; font-weight: bold; border-top: 1px solid #e2e8f0;">+${totalContribution}</td></tr>
                </tbody>
            </table>
        `;
        const rect = triggerElement.getBoundingClientRect();
        const popoverWidth = 280;
        const popoverHeight = 240;
        let left = rect.right + 8;
        let top = rect.top;
        if (left + popoverWidth > window.innerWidth) left = rect.left - popoverWidth - 8;
        if (top + popoverHeight > window.innerHeight) top = window.innerHeight - popoverHeight - 8;
        if (top < 8) top = 8;
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
        popover.classList.add('show');
        if (!this._pensionPopoverListenersAttached) {
            popover.addEventListener('mouseenter', () => {
                if (this._pensionPopoverHideTimeout) {
                    clearTimeout(this._pensionPopoverHideTimeout);
                    this._pensionPopoverHideTimeout = null;
                }
            });
            popover.addEventListener('mouseleave', () => this.scheduleHidePensionContributionPopover(0));
            this._pensionPopoverListenersAttached = true;
        }
    }

    scheduleHidePensionContributionPopover(delayMs) {
        if (this._pensionPopoverHideTimeout) clearTimeout(this._pensionPopoverHideTimeout);
        if (delayMs <= 0) {
            const popover = document.getElementById('pensionContributionPopover');
            if (popover) popover.classList.remove('show');
            return;
        }
        this._pensionPopoverHideTimeout = setTimeout(() => {
            const popover = document.getElementById('pensionContributionPopover');
            if (popover) popover.classList.remove('show');
            this._pensionPopoverHideTimeout = null;
        }, delayMs);
    }

    showTeamContributionPopover(creatureIndex, triggerElement) {
        if (this._pensionPopoverHideTimeout) {
            clearTimeout(this._pensionPopoverHideTimeout);
            this._pensionPopoverHideTimeout = null;
        }
        const creature = this.playerTeam[creatureIndex];
        if (!creature) return;
        const rate = this.getTeamContributionRate();
        const transferRate = (rate * 100).toFixed(0);
        const contributedHP = Math.floor(creature.maxHp * rate);
        const contributedATK = Math.floor(creature.attack * rate);
        const contributedSpATK = Math.floor(creature.spattack * rate);
        const contributedDEF = Math.floor(creature.defense * rate);
        const contributedSpDEF = Math.floor(creature.spdefense * rate);
        const contributedSPD = Math.floor(creature.speed * rate);
        const totalContribution = Math.floor(contributedHP / 2 + contributedATK + contributedSpATK + contributedDEF + contributedSpDEF + contributedSPD);
        const content = document.getElementById('pensionContributionContent');
        const popover = document.getElementById('pensionContributionPopover');
        if (!content || !popover) return;
        content.innerHTML = `
            <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">${creature.name} — Contribution équipe (${transferRate}%)</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <th style="text-align: left; padding: 4px 8px 4px 0;">Stat</th>
                        <th style="text-align: right; padding: 4px 0;">Valeur</th>
                        <th style="text-align: right; padding: 4px 0 4px 8px;">Contribution</th>
                    </tr>
                </thead>
                <tbody style="color: #334155;">
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">❤️ PV</td><td style="text-align: right;">${creature.maxHp}</td><td style="text-align: right; color: #22c55e; font-weight: bold; padding-left: 8px;">+${contributedHP}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">⚔️ Attaque</td><td style="text-align: right;">${creature.attack}</td><td style="text-align: right; color: #22c55e; font-weight: bold; padding-left: 8px;">+${contributedATK}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">✨ Att. spéciale</td><td style="text-align: right;">${creature.spattack}</td><td style="text-align: right; color: #22c55e; font-weight: bold; padding-left: 8px;">+${contributedSpATK}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">🛡️ Défense</td><td style="text-align: right;">${creature.defense}</td><td style="text-align: right; color: #22c55e; font-weight: bold; padding-left: 8px;">+${contributedDEF}</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 4px 8px 4px 0;">🌟 Déf. spéciale</td><td style="text-align: right;">${creature.spdefense}</td><td style="text-align: right; color: #22c55e; font-weight: bold; padding-left: 8px;">+${contributedSpDEF}</td></tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px 4px 0;">👟 Vitesse</td><td style="text-align: right;">${creature.speed}</td><td style="text-align: right; color: #22c55e; font-weight: bold; padding-left: 8px;">+${contributedSPD}</td></tr>
                    <tr><td colspan="2" style="padding: 6px 8px 4px 0; font-weight: bold; border-top: 1px solid #e2e8f0;">📊 Contribution totale</td><td style="text-align: right; padding: 6px 0 4px 8px; color: #22c55e; font-weight: bold; border-top: 1px solid #e2e8f0;">+${totalContribution}</td></tr>
                </tbody>
            </table>
        `;
        const rect = triggerElement.getBoundingClientRect();
        const popoverWidth = 280;
        const popoverHeight = 240;
        let left = rect.right + 8;
        let top = rect.top;
        if (left + popoverWidth > window.innerWidth) left = rect.left - popoverWidth - 8;
        if (top + popoverHeight > window.innerHeight) top = window.innerHeight - popoverHeight - 8;
        if (top < 8) top = 8;
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
        popover.classList.add('show');
        if (!this._pensionPopoverListenersAttached) {
            popover.addEventListener('mouseenter', () => {
                if (this._pensionPopoverHideTimeout) {
                    clearTimeout(this._pensionPopoverHideTimeout);
                    this._pensionPopoverHideTimeout = null;
                }
            });
            popover.addEventListener('mouseleave', () => this.scheduleHidePensionContributionPopover(0));
            this._pensionPopoverListenersAttached = true;
        }
    }

    /**
      * Cherche si une créature existe déjà dans toutes les collections (équipe, stockage, pension)
      * @param {string} nameToFind - Le nom du Pokémon (ex: "Charizard")
      * @param {boolean} isShiny - Le statut Shiny
      * @returns {Creature|null} La créature trouvée, ou null
      */
    findCreatureByName(nameToFind, isShiny) {
        const locations = [this.playerTeam, this.storage, this.pension];
        for (const location of locations) {
            const found = location.find(c => c.name === nameToFind && c.isShiny === isShiny);
            if (found) {
                return found; // Retourne la première créature trouvée
            }
        }
        return null; // Non trouvé
    }


    updatePokedexDisplay() {
        const pokedexList = document.getElementById('pokedexList');
        const pokedexCount = document.getElementById('pokedexCount');
        const pokedexTotal = document.getElementById('pokedexTotal');

        if (!pokedexList) return;

        // SÉCURITÉ 1 : Initialiser si vide
        if (!this.pokedex) this.pokedex = {};

        const entries = Object.values(this.pokedex);

        if (pokedexCount) pokedexCount.textContent = entries.length;

        // SÉCURITÉ 2 : Vérifier si la liste des IDs existe
        const hasIds = typeof POKEMON_SPRITE_IDS !== 'undefined';
        if (pokedexTotal) pokedexTotal.textContent = hasIds ? Object.keys(POKEMON_SPRITE_IDS).length : "???";

        pokedexList.innerHTML = '';

        if (entries.length === 0) {
            pokedexList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px; grid-column: 1 / -1;">Aucun Pokémon découvert. Lancez une réparation !</div>';
            return;
        }

        entries.forEach(entry => {
            // SÉCURITÉ 3 : Ignorer les entrées corrompues (null ou undefined)
            if (!entry || !entry.name) return;

            const card = document.createElement('div');
            card.className = "creature-card rarity-" + (entry.rarity || 'common');
            if (entry.hasShiny) card.className += " shiny";

            // Gestion de l'ID (Numéro)
            let formattedId = "???";
            if (hasIds) {
                const dexId = POKEMON_SPRITE_IDS[entry.name];
                if (dexId) formattedId = "#" + dexId.toString().padStart(3, '0');
            }

            // Gestion de l'image (Sprite)
            const spriteUrl = getPokemonSpriteUrl(entry.name, false);

            const shinyIcon = entry.hasShiny ? '<span title="Shiny capturé">✨</span>' : '';

            // SÉCURITÉ 4 : Date valide
            let discoveryDate = "Inconnu";
            if (entry.firstDiscoveredAt) {
                discoveryDate = new Date(entry.firstDiscoveredAt).toLocaleDateString();
            }

            card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:5px;">
                <span style="font-size:10px; color:#666; font-weight:bold;">${formattedId}</span>
                ${shinyIcon}
            </div>
            
            <img src="${spriteUrl}" class="team-slot-sprite" style="width:64px; height:64px; margin:0 auto; display:block;" onerror="this.style.display='none'">
            
            <h4 style="font-size:14px; margin:5px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${entry.name}</h4>
            
            

            <div style="margin-top: 10px; font-size: 11px; color: #555; border-top:1px solid rgba(0,0,0,0.1); padding-top:8px; margin-bottom:3px;">
                <div>Capturés : <strong>${entry.count || 1}</strong></div>
                ${entry.hasShiny ? `<div style="color:#d97706;">Dont Shinies : <strong>${entry.shinyCount || 1}</strong></div>` : ''}
                <div style="font-size:8px; color:#aaa; margin-top:3px; opacity:0.8;">${discoveryDate}</div>
            </div>
        `;

            pokedexList.appendChild(card);
        });

        this.updateCollectionBonusesDisplay();
    }

    switchPokedexSubTab(subTab) {
        this.pokedexSubTab = subTab || 'pokedex';
        const pokedexView = document.getElementById('pokedexSubView-pokedex');
        const synergiesView = document.getElementById('pokedexSubView-collectionbonuses');
        const btnPokedex = document.getElementById('pokedexSubTab-pokedex');
        const btnSynergies = document.getElementById('pokedexSubTab-collectionbonuses');
        if (pokedexView) pokedexView.style.display = this.pokedexSubTab === 'pokedex' ? '' : 'none';
        if (synergiesView) synergiesView.style.display = this.pokedexSubTab === 'collectionbonuses' ? '' : 'none';
        if (btnPokedex) btnPokedex.classList.toggle('active', this.pokedexSubTab === 'pokedex');
        if (btnSynergies) btnSynergies.classList.toggle('active', this.pokedexSubTab === 'collectionbonuses');
        if (this.pokedexSubTab === 'collectionbonuses') this.updateCollectionBonusesDisplay();
    }

    updateCollectionBonusesDisplay() {
        const container = document.getElementById('collectionBonusesContainer');
        const tabsContainer = document.getElementById('collectionBonusesTabs');
        if (!container) return;
        if (typeof COLLECTION_BONUSES === 'undefined') { container.innerHTML = ''; if (tabsContainer) tabsContainer.innerHTML = ''; return; }

        const details = this.getCollectionBonusDetails();
        if (!details || details.length === 0) { container.innerHTML = ''; if (tabsContainer) tabsContainer.innerHTML = ''; return; }

        const tab = this.collectionBonusTab || 'all';
        const filteredDetails = tab === 'all' ? details : details.filter(f => f.id === tab);

        if (tabsContainer) {
            tabsContainer.innerHTML = `<button class="sort-btn ${tab === 'all' ? 'active' : ''}" onclick="game.collectionBonusTab='all'; game.updateCollectionBonusesDisplay();" style="font-size:12px; padding:6px 10px;">Tous</button>`;
            details.forEach(fam => {
                const isActive = tab === fam.id;
                tabsContainer.innerHTML += `<button class="sort-btn ${isActive ? 'active' : ''}" onclick="game.collectionBonusTab='${fam.id}'; game.updateCollectionBonusesDisplay();" style="font-size:12px; padding:6px 10px;">${fam.name}</button>`;
            });
        }

        let html = '';
        filteredDetails.forEach(fam => {
            const statusClass = fam.isActive ? 'synergy-active' : 'synergy-inactive';
            const effectStr = fam.effectTexts.length > 0 ? fam.effectTexts.join(', ') : '—';
            let inactiveReason = '—';
            if (!fam.isActive) {
                const miss = fam.members.filter(m => m.status === 'missing').length;
                const zero = fam.members.filter(m => m.status === 'prestige_0').length;
                inactiveReason = miss > 0 ? `${miss} manquant${miss > 1 ? 's' : ''}` : (zero > 0 ? `${zero} à prestige 0` : 'incomplet');
            }
            html += `<div class="collection-bonus-card ${statusClass}" style="margin-bottom:20px; padding:15px; background:${fam.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.03)'}; border-radius:12px; border:1px solid ${fam.isActive ? 'rgba(34,197,94,0.3)' : '#e2e8f0'};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                <h4 style="margin:0; font-size:16px; font-weight:900; color:#1a1a1a;">${fam.name}</h4>
                <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                    ${fam.bonusPerPrestige ? `<span style="font-size:11px; color:#e0e0e0; font-weight:700; background:rgba(0,0,0,0.3); padding:3px 8px; border-radius:6px;" title="Bonus par niveau de prestige">${fam.bonusPerPrestige}</span>` : ''}
                    <span style="font-size:13px; font-weight:800; color:${fam.isActive ? '#16a34a' : '#e0e0e0'}; ${fam.isActive ? '' : 'background:rgba(0,0,0,0.3); padding:3px 8px; border-radius:6px;'}">
                        Niv. ${fam.level} ${fam.isActive ? `→ ${effectStr}` : `(${inactiveReason})`}
                    </span>
                </div>
            </div>
            <div class="collection-bonus-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(52px, 1fr)); gap:8px;">`;
            fam.members.forEach(m => {
                const rarity = this.getNaturalRarity ? this.getNaturalRarity(m.name) : 'common';
                const rClass = `rarity-${rarity || 'common'}`;
                const spriteUrl = typeof getPokemonSpriteUrl === 'function' ? getPokemonSpriteUrl(m.name, false) : '';
                const title = m.status === 'missing' ? `${m.name} : Non possédé` : (m.status === 'prestige_0' ? `${m.name} : Prestige 0` : `${m.name} : ★${m.prestige}`);
                const style = m.status === 'missing' ? 'filter:grayscale(1); opacity:0.5;' : (m.status === 'prestige_0' ? 'opacity:0.75; border:2px solid #eab308;' : '');
                html += `<div class="creature-card ${rClass}" title="${title}" style="text-align:center; padding:4px; border-radius:8px; ${style}">
                <img src="${spriteUrl}" alt="${m.name}" style="width:48px; height:48px; display:block; margin:0 auto;" onerror="this.style.display='none'">
                ${m.status === 'ok' ? `<span style="font-size:10px; color:#16a34a; font-weight:900; display:block; margin-top:2px; text-shadow:0 1px 2px rgba(0,0,0,0.3);">★${m.prestige}</span>` : (m.status === 'prestige_0' ? '<span style="font-size:10px; color:#1a1a1a; font-weight:900; display:block; margin-top:2px; text-shadow:0 1px 2px rgba(255,255,255,0.5);">0</span>' : '<span style="font-size:10px; color:#444; font-weight:700; display:block; margin-top:2px;">—</span>')}
            </div>`;
            });
            html += '</div></div>';
        });
        container.innerHTML = html;
    }

    /**
     * Trouve la rareté naturelle d'un Pokémon dans les constantes.
     */
    getNaturalRarity(pokemonName) {
        // On parcourt les raretés (Legendary, Epic, Rare, Common)
        const rarities = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.COMMON];

        for (const rarity of rarities) {
            const pool = POKEMON_POOL[rarity];
            if (!pool) continue;

            // On cherche dans chaque type de ce pool
            for (const type in pool) {
                if (pool[type].includes(pokemonName)) {
                    return rarity;
                }
            }
        }

        // Par défaut (ou si introuvable, ex: starter forcé)
        return RARITY.COMMON;
    }

    /**
         
       /**
         * Équipe un objet sur une créature (Version Corrigée)
         */
    equipItem(itemKey, creatureIndex, location) {
        try {
            if (this.isRocketStakingItemLocked(itemKey)) {
                if (typeof toast !== 'undefined' && toast && typeof toast.error === 'function') {
                    toast.error("Objet bloqué", "Cet objet est immobilisé en staking Team Rocket.");
                } else {
                    logMessage("❌ Cet objet est immobilisé en staking Team Rocket.");
                }
                return;
            }
            let creature;
            if (location === 'team') creature = this.playerTeam[creatureIndex];
            else if (location === 'storage') creature = this.storage[creatureIndex];
            else if (location === 'pension') creature = this.pension[creatureIndex];

            // Sécurités
            if (!creature) {
                console.error("Créature introuvable pour équipement");
                return;
            }

            // On s'assure que la quantité est un nombre
            let currentQty = parseInt(this.items[itemKey] || 0);

            if (currentQty > 0) {
                // 1. Si elle tient déjà un objet, on le déséquipe d'abord (remise en stock)
                if (creature.heldItem) {
                    const oldItemKey = creature.heldItem;
                    this.items[oldItemKey] = parseInt(this.items[oldItemKey] || 0) + 1;
                }

                // 2. Décrémenter l'objet sélectionné
                this.items[itemKey] = currentQty - 1;

                // Si le compte tombe à 0 ou moins, on peut nettoyer la clé (optionnel mais propre)
                if (this.items[itemKey] <= 0) delete this.items[itemKey];

                // 3. Assigner l'objet
                creature.heldItem = itemKey;

                // 3bis. Suivi de quête : objet équipé sur le starter ?
                if (typeof this.checkSpecialQuests === 'function') {
                    this.checkSpecialQuests('heldItemEquipped', { isStarter: !!creature.isStarter });
                }

                // 4. Feedback (avec sécurité)
                const itemName = (HELD_ITEMS[itemKey] && HELD_ITEMS[itemKey].name) ? HELD_ITEMS[itemKey].name : itemKey;
                if (typeof toast !== 'undefined') {
                    toast.success("Objet équipé", `${creature.name} tient maintenant : ${itemName}`);
                } else {
                    logMessage(`✅ Objet équipé : ${itemName}`);
                }
                if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('heldItemEquipped');

                // 5. Fermer le modal de la créature
                this.closeCreatureModal();
            }
        } catch (error) {
            console.error("Erreur dans equipItem:", error);
        } finally {
            // 6. Mettre à jour l'affichage QUOI QU'IL ARRIVE
            this.updateDisplay();
        }
    }

    /**
     * Déséquipe un objet (Version Corrigée)
     */
    unequipItem(creatureIndex, location) {
        try {
            let creature;
            if (location === 'team') creature = this.playerTeam[creatureIndex];
            else if (location === 'storage') creature = this.storage[creatureIndex];
            else if (location === 'pension') creature = this.pension[creatureIndex];

            if (creature && creature.heldItem) {
                const itemKey = creature.heldItem;

                // Remettre dans l'inventaire
                this.items[itemKey] = parseInt(this.items[itemKey] || 0) + 1;

                const itemName = (HELD_ITEMS[itemKey] && HELD_ITEMS[itemKey].name) ? HELD_ITEMS[itemKey].name : itemKey;

                // Retirer de la créature
                creature.heldItem = null;

                if (typeof toast !== 'undefined') {
                    toast.info("Objet retiré", `${itemName} remis dans le sac.`);
                } else {
                    logMessage(`⬇️ Objet retiré : ${itemName}`);
                }

                this.closeCreatureModal();
            }
        } catch (error) {
            console.error("Erreur dans unequipItem:", error);
        } finally {
            this.updateDisplay();
        }
    }



    // ============= SYSTÈME DE QUÊTES =============
    generateQuest() {
        if (typeof generateQuestLogic === 'function') generateQuestLogic(this);
    }

    addStoryQuest(storyDef) {
        if (typeof addStoryQuestLogic === 'function') addStoryQuestLogic(this, storyDef);
    }

    checkSpecialQuests(eventType, params = {}) {
        // Court-circuit pendant la simulation offline : évite des milliers d'itérations
        // sur les quêtes actives. Les stats sous-jacentes (this.stats, this.pokedex) sont
        // correctement mises à jour — les quêtes se déclencheront à la prochaine action réelle.
        if (this.isOfflineSimulating) return;
        if (typeof checkSpecialQuestsLogic === 'function') checkSpecialQuestsLogic(this, eventType, params);
    }

    // LOGIQUE : Optimisation des IVs (Conserve le meilleur)
    optimizeCreatureIVs(creatureIndex, location) {
        // 1. Vérification Item
        if (!this.items['prism_iv'] || this.items['prism_iv'] <= 0) {
            toast.error("Erreur", "Vous n'avez pas de Prisme d'Optimisation !");
            return;
        }

        // 2. Récupération Créature
        let creature;
        if (location === 'team') creature = this.playerTeam[creatureIndex];
        else if (location === 'storage') creature = this.storage[creatureIndex];
        else if (location === 'pension') creature = this.pension[creatureIndex];

        if (!creature) return;

        // 3. Consommation
        this.items['prism_iv']--;

        // 4. Le "Roll" (Tirage)
        // On génère 6 nouveaux IVs entre 0 et 31 (comme dans le constructeur)
        const newHP = Math.floor(Math.pow(Math.random(), 3) * 32);
        const newAtk = Math.floor(Math.pow(Math.random(), 3) * 32);
        const newSpAtk = Math.floor(Math.pow(Math.random(), 3) * 32);
        const newDef = Math.floor(Math.pow(Math.random(), 3) * 32);
        const newSpDef = Math.floor(Math.pow(Math.random(), 3) * 32);
        const newSpd = Math.floor(Math.pow(Math.random(), 3) * 32);

        // 5. Comparaison et Application (On garde le meilleur !)
        let improvements = 0;

        if (newHP > creature.ivHP) { creature.ivHP = newHP; improvements++; }
        if (newAtk > creature.ivAttack) { creature.ivAttack = newAtk; improvements++; }
        if (newSpAtk > creature.ivSpAttack) { creature.ivSpAttack = newSpAtk; improvements++; }
        if (newDef > creature.ivDefense) { creature.ivDefense = newDef; improvements++; }
        if (newSpDef > creature.ivSpDefense) { creature.ivSpDefense = newSpDef; improvements++; }
        if (newSpd > creature.ivSpeed) { creature.ivSpeed = newSpd; improvements++; }

        // 6. Sauvegarde et Feedback
        creature.recalculateStats();
        creature.heal(); // On soigne les nouveaux PV max

        this.updateItemsDisplay();
        this.updateDisplay();

        // On rafraîchit le modal pour voir les nouveaux chiffres en direct
        this.showCreatureModal(creatureIndex, location);

        if (improvements > 0) {
            toast.success("Optimisation Réussie !", `💎 ${creature.name} a amélioré ${improvements} stat(s) !`);
            logMessage(`💎 Le Prisme brille ! ${creature.name} devient plus fort (IVs améliorés).`);
        } else {
            toast.warning("Pas de changement", "Le Prisme n'a pas trouvé de meilleur potentiel...");
            logMessage(`💎 Le potentiel de ${creature.name} était déjà supérieur au Prisme.`);
        }
    }



    // LOGIQUE : Évolution Sécurisée (Préserve Shiny, IVs, Prestige)
    evolveCreature(creatureIndex, location, selectedOption = null) {
        let creature;
        let containerArray;

        // 1. Identification de la cible
        if (location === 'team') {
            creature = this.playerTeam[creatureIndex];
            containerArray = this.playerTeam;
        } else if (location === 'storage') {
            creature = this.storage[creatureIndex];
            containerArray = this.storage;
        } else if (location === 'pension') {
            creature = this.pension[creatureIndex];
            containerArray = this.pension;
        }

        if (!creature) {
            console.error(`❌ Erreur Évolution : Créature introuvable [${location}:${creatureIndex}]`);
            return;
        }

        // 2. Vérification des conditions
        const evolutionData = EVOLUTIONS[creature.name];
        if (!evolutionData) return; // Pas d'évolution

        const availableOptions = this.getAvailableEvolutionOptions(creature);
        if (availableOptions.length === 0) {
            logMessage(`⛔ ${creature.name} ne remplit pas les conditions d'évolution.`);
            return;
        }

        let chosenOption = null;
        if (selectedOption && selectedOption.evolves_to) {
            chosenOption = availableOptions.find((opt) => (
                opt.evolves_to === selectedOption.evolves_to &&
                (opt.requiredItem || null) === (selectedOption.requiredItem || null)
            )) || null;
        }
        if (!chosenOption) chosenOption = availableOptions[0];

        const oldName = creature.name;
        const newName = chosenOption.evolves_to;

        // Consommer l'objet si nécessaire
        if (chosenOption.requiredItem) {
            const requiredItem = chosenOption.requiredItem;
            this.items[requiredItem]--;
            if (this.items[requiredItem] <= 0) {
                delete this.items[requiredItem];
            }
            this.updateItemsDisplay();
        }

        // 3. VÉRIFICATION DOUBLON (Fusion)
        // On regarde si on possède DÉJÀ la forme évoluée (avec le même statut Shiny)
        const existingEvo = this.findCreatureByName(newName, creature.isShiny);

        if (existingEvo) {
            // CAS A : FUSION ÉVOLUTIVE (on possède déjà la forme évoluée)
            // On fusionne l'actuel (source) DANS celui qui existe déjà (target)
            const result = this.processFusion(creature, existingEvo);

            // Remettre l'objet tenu par la créature fusionnée dans l'inventaire (sinon il est perdu)
            if (creature.heldItem) {
                const itemKey = creature.heldItem;
                this.items[itemKey] = (this.items[itemKey] || 0) + 1;
                const itemName = HELD_ITEMS[itemKey] ? HELD_ITEMS[itemKey].name : itemKey;
                toast.info("Objet récupéré", `${itemName} remis dans le sac (fusion).`);
            }

            // On supprime la créature qui vient d'évoluer (elle a été absorbée)
            if (location === 'team') this.playerTeam.splice(creatureIndex, 1);
            else if (location === 'storage') this.storage.splice(creatureIndex, 1);
            else if (location === 'pension') this.pension.splice(creatureIndex, 1);

            let msg = `🧬 FUSION ÉVOLUTIVE ! ${oldName} absorbé par ${existingEvo.name}.`;
            if (result.ivImproved) msg += " Stats améliorées !";
            if (result.prestigeUp) msg += " Prestige transféré !";

            logMessage(msg);
            toast.success("Fusion Réussie", `+${result.shards} Shards` + (result.ivImproved ? " & Boost Stats" : ""));

            // Quête spéciale : Évolution Fusion (et évolution du starter si concerné)
            if (typeof this.checkSpecialQuests === 'function') {
                this.checkSpecialQuests('evolution_fusion', { baseName: oldName, evolvedName: newName });
                if (creature.isStarter) {
                    this.checkSpecialQuests('starter_evolved', { baseName: oldName, evolvedName: newName });
                }
            }

            // Mise à jour UI globale car une créature a disparu
            this.updateDisplay();
            this.closeCreatureModal();
            return;
        }

        // CAS B : ÉVOLUTION (Mutation sur place)
        // C'est ici qu'on garde les propriétés (IV, Shiny...) car c'est le MÊME objet JS

        // Sauvegarde pour feedback
        const oldRarity = creature.rarity;

        // Modification des propriétés de base
        creature.name = newName;
        creature.type = this.findTypeForPokemon(newName);
        creature.secondaryType = POKEMON_SECONDARY_TYPES[newName] || null;

        // Mise à jour de la rareté (ex: Magicarpe Common -> Léviator Epic)
        const newRarity = this.getNaturalRarity(newName);
        if (creature.rarity !== newRarity) {
            creature.rarity = newRarity;
            // Si on passe à Epic/Legendary et qu'on n'a pas de talent, on en donne un !
            if (!creature.passiveTalent && (newRarity === RARITY.EPIC || newRarity === RARITY.LEGENDARY)) {
                creature.assignRandomTalent();
                logMessage(`✨ Nouveau talent débloqué : ${PASSIVE_TALENTS[creature.passiveTalent].name} !`);
            }
        }

        // Recalcul complet des stats (Base stats changent + Rareté change)
        creature.recalculateStats();
        creature.heal(); // Soin complet pour fêter ça

        // Mise à jour Pokédex
        const pokedexKey = getShardKey(creature.name, creature.rarity); // Utilise le format Name_Rarity
        // Note: Pour le pokédex on utilise une clé plus complète habituellement
        const dexKeyFull = creature.name + "_" + creature.type + "_" + creature.rarity;

        if (!this.pokedex[dexKeyFull]) {
            this.pokedex[dexKeyFull] = {
                discovered: true, count: 1,
                shinyCount: creature.isShiny ? 1 : 0,
                hasShiny: creature.isShiny,
                name: creature.name, type: creature.type, rarity: creature.rarity,
                firstDiscoveredAt: Date.now()
            };
            this.checkSpecialQuests('new_discovery');
        } else {
            this.pokedex[dexKeyFull].count++;
            if (creature.isShiny) {
                this.pokedex[dexKeyFull].shinyCount = (this.pokedex[dexKeyFull].shinyCount || 0) + 1;
                this.pokedex[dexKeyFull].hasShiny = true;
            }
        }

        this.stats.evolutionsCount++;
        if (typeof this.checkSpecialQuests === 'function') {
            this.checkSpecialQuests('evolutionCount');
            if (creature.isStarter) {
                this.checkSpecialQuests('starter_evolved', { baseName: oldName, evolvedName: newName });
            }
        }

        // Feedback Joueur
        let evoMsg = `🎉 ÉVOLUTION ! ${oldName} devient ${newName} !`;
        if (creature.isShiny) evoMsg += " (✨ SHINY CONSERVÉ)";
        if (creature.prestige > 0) evoMsg += ` (Prestige ${creature.prestige} conservé)`;

        logMessage(evoMsg);
        toast.success("Évolution !", `${newName} rejoint vos rangs.`);

        // Si la créature évoluée est dans l'équipe active, on update l'affichage combat
        if (location === 'team' && this.currentPlayerCreature === creature) {
            this.updateCombatDisplay();
        }

        this.updateDisplay();
        this.closeCreatureModal();
    }

    /**
         * Vérifie si des succès sont débloqués en fonction d'une stat modifiée.
         * @param {string} changedStatKey - La clé de this.stats qui vient de changer (ex: 'combatsWon')
         */
    checkAchievements(changedStatKey) {
        // 1. On parcourt les définitions constantes
        for (const [id, achievementDef] of Object.entries(ACHIEVEMENTS)) {

            // 2. Optimisation : On ne vérifie que les succès liés à la stat modifiée
            if (achievementDef.trackingKey !== changedStatKey) continue;

            // 3. Ignorer si déjà complété (Sauvegardé dans this.achievementsCompleted)
            // Note : Assure-toi d'avoir initialisé cet objet dans ton constructor
            if (this.achievementsCompleted && this.achievementsCompleted[id]) continue;

            // 4. RÉCUPÉRATION DE LA VALEUR ACTUELLE (Source de vérité = this.stats)
            const currentValue = this.stats[changedStatKey] || 0;

            // 5. VÉRIFICATION
            if (currentValue >= achievementDef.target) {
                this.unlockAchievement(id, achievementDef);
            }
        }
    }

    /**
     * Débloque un succès, donne les récompenses et sauvegarde.
     * @param {string} id - L'identifiant unique du succès (ex: 'shinyHunter_1')
     * @param {Object} def - La définition du succès (titre, récompenses...)
     */
    unlockAchievement(id, def) {
        // 1. Initialisation & Sécurité
        if (!this.achievementsCompleted) this.achievementsCompleted = {};
        if (!this.stats) this.stats = {}; // Sécurité

        // Si déjà débloqué, on arrête
        if (this.achievementsCompleted[id]) return;

        // 2. Marquer comme complété
        this.achievementsCompleted[id] = true;
        this.achievementsCompleted[id + '_date'] = Date.now();
        this.unlockHeaderSkinByAchievement(id);

        // 3. DISTRIBUTION DES RÉCOMPENSES
        if (def.rewards) {
            const r = def.rewards;

            // --- A. Monnaies (Ressources directes) ---

            // POKÉDOLLARS (Monnaie principale)
            if (r.pokedollars) {
                this.pokedollars = (this.pokedollars || 0) + r.pokedollars;
                this.stats.totalPokedollarsEarned = (this.stats.totalPokedollarsEarned || 0) + r.pokedollars;
            }

            // COMBAT TICKETS (Jetons Tour/Arène)
            if (r.combatTickets) {
                this.combatTickets = (this.combatTickets || 0) + r.combatTickets;
            }

            // QUEST TOKENS (Monnaie Quêtes)
            if (r.questTokens) {
                this.questTokens = (this.questTokens || 0) + r.questTokens;
            }

            // MARQUES DU TRIOMPHE (Monnaie Élite/Tour)
            if (r.marquesDuTriomphe) {
                this.marquesDuTriomphe = (this.marquesDuTriomphe || 0) + r.marquesDuTriomphe;
            }
            // C. Objets (Master Ball, Bonbons...)
            if (r.items) {
                if (!this.items) this.items = {};
                for (const [itemKey, qty] of Object.entries(r.items)) {
                    this.items[itemKey] = (this.items[itemKey] || 0) + qty;
                    logMessage(`🎒 Obtenu : ${qty}x ${itemKey}`);
                }
            }

            // D. Œufs (Sécurité || 0)
            if (r.eggs) {
                if (!this.eggs) {
                    this.eggs = { [RARITY.COMMON]: 0, [RARITY.RARE]: 0, [RARITY.EPIC]: 0, [RARITY.LEGENDARY]: 0 };
                }
                for (const [rarity, qty] of Object.entries(r.eggs)) {
                    this.eggs[rarity] = (this.eggs[rarity] || 0) + qty;
                    logMessage(`🥚 Obtenu : ${qty}x Œuf ${rarity}`);
                }
            }
        }

        // 4. FEEDBACK VISUEL & Log
        const rewardText = this.formatRewardText(def.rewards);
        logMessage(`🏆 SUCCÈS DÉBLOQUÉ : ${def.title}`);

        if (window.showFloatingText) {
            window.showFloatingText("🏆 SUCCÈS !", document.getElementById('playerSpriteContainer'), 'ft-crit');
        }
        if (typeof toast !== 'undefined') {
            toast.success(def.title, `Récompense : ${rewardText}`);
        }

        // 5. MISE À JOUR UI & SAUVEGARDE
        if (this.updateAchievementsDisplay) this.updateAchievementsDisplay();
        if (this.updateResources) this.updateResources();

        this.saveGame();

        // 6. CHECK EN CHAÎNE (UNIQUEMENT POUR L'ARGENT/STATS QUI VIENNENT D'ÊTRE MODIFIÉES)
        // C'est pour débloquer le Niveau 2, 3, etc. d'un coup (si on gagne 1M de Pokédollars)
        if (def.rewards && def.rewards.pokedollars) {
            this.checkAchievements('totalPokedollarsEarned');
        }
    }

    /**
     * Petit utilitaire pour afficher proprement les récompenses en texte
     */
    formatRewardText(rewards) {
        if (!rewards) return "";
        let parts = [];
        if (rewards.pokedollars) parts.push(`${formatNumber(rewards.pokedollars)}$`);
        if (rewards.tokens) parts.push(`${rewards.tokens} Tickets`);
        if (rewards.items) parts.push(`${Object.values(rewards.items).reduce((a, b) => a + b, 0)} Obj.`);
        if (rewards.eggs) parts.push(`${Object.values(rewards.eggs).reduce((a, b) => a + b, 0)} Œufs`);
        return parts.join(", ");
    }
    updateQuestTimer(deltaTime) {
        if (typeof updateQuestTimerLogic === 'function') updateQuestTimerLogic(this, deltaTime);
    }

    updateQuestTimerDisplay() {
        if (typeof updateQuestTimerDisplayLogic === 'function') updateQuestTimerDisplayLogic(this);
    }

    acceptQuest(questId) {
        const before = (this.quests || []).filter(q => q.accepted).length;
        if (typeof acceptQuestLogic === 'function') acceptQuestLogic(this, questId);
        const after = (this.quests || []).filter(q => q.accepted).length;
        if (after > before) this.trackBalanceEvent('quest_accepted', { questId });
    }

    refuseQuest(questId) {
        const before = (this.quests || []).length;
        if (typeof refuseQuestLogic === 'function') refuseQuestLogic(this, questId);
        const after = (this.quests || []).length;
        if (after < before) this.trackBalanceEvent('quest_refused', { questId });
    }

    abandonQuest(questId) {
        const before = (this.quests || []).length;
        if (typeof abandonQuestLogic === 'function') abandonQuestLogic(this, questId);
        const after = (this.quests || []).length;
        if (after < before) this.trackBalanceEvent('quest_abandoned', { questId });
    }

    showQuestCompletionModal(quest) {
        // Ancien modal supprimé : clic sur "Récupérer" = réclamation directe
        if (quest && typeof claimQuestRewardLogic === 'function') claimQuestRewardLogic(this, quest);
    }

    claimQuestReward(questId) {
        const quest = this.quests && this.quests.find(q => q.id == questId);
        if (quest && typeof claimQuestRewardLogic === 'function') claimQuestRewardLogic(this, quest);
    }

    toggleCaptureMode() {
        this.captureModeEnabled = !this.captureModeEnabled;
        this.updateCaptureButtonDisplay();
    }

    // updateCaptureButtonDisplay() — version principale définie plus haut (ligne ~2688)
    // Cette surcharge est supprimée car elle écrasait les classes CSS structurelles
    // (cmd-btn, bouton-part, bouton-capture) nécessaires au quart de cercle.

    addBoost(boost) {
        const boostObj = {
            type: boost.type,
            value: boost.value,
            endTime: Date.now() + boost.duration
        };

        this.activeBoosts.push(boostObj);

        const boostNames = { xp: 'XP', money: 'Pokédollars', eggDrop: 'Drop Œufs', shiny: 'Shiny' };
        logMessage("⚡ Boost activé : +" + (boost.value * 100) + "% " + boostNames[boost.type] + " !");

        this.updateBoostsDisplay();
    }

    // LOGIQUE : Tenter de faire apparaître un Roamer pour le prochain combat
    rollRoamingEncounter() {
        // 1. Conditions : Pas en Tour, Pas en Arène
        if (this.towerState.isActive || this.arenaState.active) return;

        // 2. Probabilité (0.5% soit 1 chance sur 200 par combat)
        // Tu peux ajuster ce taux (ex: 0.002 pour 1/500)
        const roamingChance = 0.0005;

        if (Math.random() < roamingChance) {
            // 3. Choix du Roamer
            const name = ROAMING_POKEMON[Math.floor(Math.random() * ROAMING_POKEMON.length)];

            // 4. On stocke l'info pour le prochain startCombat
            this.pendingRoamer = name;

            // 5. HYPE : On prévient le joueur !
            toast.legendary("⚠️ ALERTE", `Une présence légendaire approche... (${name})`);
            logMessage(`⚡ L'air devient électrique... Quelque chose approche !`);
        }
    }

    updateBoosts() {
        const now = Date.now();
        const expiredBoosts = [];

        this.activeBoosts = this.activeBoosts.filter((boost, index) => {
            if (boost.endTime <= now) {
                expiredBoosts.push(boost);
                return false;
            }
            return true;
        });

        if (expiredBoosts.length > 0) {
            this.updateBoostsDisplay();
        }
    }

    openSynergyListModal() {
        const modal = document.getElementById('synergyListModal');
        const container = document.getElementById('synergyListContent');
        if (!modal || !container) return;

        const typeCounts = {};
        this.playerTeam.forEach(c => {
            typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
            if (c.secondaryType) {
                typeCounts[c.secondaryType] = (typeCounts[c.secondaryType] || 0) + 1;
            }
        });

        let html = '';

        // Dictionnaire d'icônes "Sprite" pour le texte (On garde ceux-là pour les prérequis)
        const typeIcons = {
            fire: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/fire.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            water: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/water.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            grass: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/grass.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            electric: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/electric.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            normal: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/normal.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            flying: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/flying.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            bug: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/bug.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            poison: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/poison.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            ground: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/ground.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            rock: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/rock.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            fighting: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/fighting.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            psychic: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/psychic.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            ghost: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/ghost.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            ice: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/ice.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            dragon: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/dragon.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            steel: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/steel.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            dark: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/dark.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">',
            fairy: '<img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/fairy.png" class="type-icon-img" style="vertical-align:middle; width:16px; height:16px;">'
        };

        const sortedSynergies = Object.values(TEAM_SYNERGIES).sort((a, b) => {
            const checkActive = (syn) => {
                if (syn.all_required) return syn.types.every(t => (typeCounts[t] || 0) >= syn.min_count);
                return syn.types.some(t => (typeCounts[t] || 0) >= syn.min_count);
            };
            return (checkActive(b) ? 1 : 0) - (checkActive(a) ? 1 : 0);
        });

        sortedSynergies.forEach(synergy => {
            let progressHTML = "";
            let progressPercent = 0;
            let isActive = false;

            if (synergy.all_required) {
                let totalReq = synergy.types.length * synergy.min_count;
                let totalCur = synergy.types.reduce((sum, t) => sum + Math.min(typeCounts[t] || 0, synergy.min_count), 0);
                progressPercent = (totalCur / totalReq) * 100;
                isActive = progressPercent >= 100;

                const parts = synergy.types.map(t => {
                    const cur = typeCounts[t] || 0;
                    const req = synergy.min_count;
                    const color = cur >= req ? "#16a34a" : "#64748b";
                    return `<span style="color:${color}; white-space:nowrap; display:inline-flex; align-items:center; gap:2px;">${typeIcons[t] || ''} ${cur}/${req}</span>`;
                });
                progressHTML = parts.join(' <span style="font-size:10px; color:#ccc;">+</span> ');

            } else {
                let currentMax = 0;
                synergy.types.forEach(t => {
                    const count = typeCounts[t] || 0;
                    if (count > currentMax) currentMax = count;
                });
                const displayCount = Math.min(currentMax, synergy.min_count);
                isActive = currentMax >= synergy.min_count;
                progressPercent = (displayCount / synergy.min_count) * 100;

                progressHTML = `<span>${displayCount} / ${synergy.min_count} Pokémon</span>`;
            }

            // --- ❌ SUPPRESSION DE LA VARIABLE ICONE ICI ---

            let shortDesc = synergy.message.split('!')[1] || synergy.message;
            shortDesc = shortDesc.replace(/[()]/g, '').trim();

            const separator = synergy.all_required ? ' ET ' : ' OU ';
            const reqString = synergy.types.map(t => `${typeIcons[t] || ''} ${t.toUpperCase()}`).join(separator);
            const tooltipTitle = synergy.name;
            const tooltipDesc = `Requis : ${synergy.min_count}x (${reqString})<br><br>Effet : ${shortDesc}`;

            const safeTitle = tooltipTitle.replace(/'/g, "\\'");
            const safeDesc = tooltipDesc
                .replace(/'/g, "\\'")
                .replace(/"/g, "&quot;")
                .replace(/\n/g, "<br>");

            const typesBadgeHtml = synergy.types.map(t => `<span class="synergy-type-badge" title="${t}">${typeIcons[t] || ''}</span>`).join('');

            html += `
            <div class="synergy-list-card ${isActive ? 'active' : ''}"
                 onmouseenter="game.scheduleTooltip(event, '${safeTitle}', '${safeDesc}')"
                 onmouseleave="game.hideTooltip()">
                <div class="synergy-list-types">${typesBadgeHtml}</div>
                <div class="synergy-list-info">
                    <div class="synergy-list-title">
                        <span>${synergy.name}</span>
                        ${isActive ? '<span class="synergy-list-active-badge">ACTIF</span>' : ''}
                    </div>
                    <div class="synergy-list-desc">${shortDesc}</div>
                    <div class="synergy-progress">${progressHTML}</div>
                    <div class="synergy-progress-bar">
                        <div class="synergy-progress-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>
            </div>
        `;
        });

        container.innerHTML = html;
        modal.classList.add('show');
    }

    updateBoostsDisplay() {
        const boostsDiv = document.getElementById('activeBoosts');
        const boostsList = document.getElementById('boostsList');

        if (this.activeBoosts.length === 0) {
            boostsDiv.style.display = 'none';
            return;
        }

        boostsDiv.style.display = 'block';
        boostsList.innerHTML = '';

        const boostNames = { xp: 'XP', money: 'Pokédollars', eggDrop: 'Drop Œufs', shiny: 'Shiny' };

        this.activeBoosts.forEach(boost => {
            const timeLeft = boost.endTime - Date.now();
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);

            const boostItem = document.createElement('div');
            boostItem.className = 'boost-item';
            boostItem.innerHTML = `
            <span class="boost-name">⚡ +${(boost.value * 100)}% ${boostNames[boost.type]}</span>
            <span class="boost-timer">${minutes}:${seconds < 10 ? '0' : ''}${seconds}</span>
        `;
            boostsList.appendChild(boostItem);
        });
    }


    updateRecyclerDisplay() {
        if (typeof updateRecyclerDisplayUI === 'function') updateRecyclerDisplayUI(this);
    }

    toggleRecyclerSort(mode) {
        if (!mode) return;
        if (this.recyclerSortMode === mode) {
            this.recyclerSortDir = this.recyclerSortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.recyclerSortMode = mode;
            this.recyclerSortDir = 'desc';
        }
        this.updateRecyclerDisplay();
    }

    /**
     * Recycle les shards d'un type en Poussière d'Essence
     */
    recycleShards(shardKey, rarity) {
        const count = this.shards[shardKey] || 0;
        if (count === 0) return;

        const rate = DUST_CONVERSION_RATES[rarity] || 1;
        const dustGained = count * rate;

        this.essenceDust += dustGained;
        this.shards[shardKey] = 0;

        logMessage(`♻️ ${count} Shards de ${shardKey} recyclés en 💠 ${dustGained} Poussière !`);
        toast.success("Shards Recyclés !", `+${dustGained} 💠 Poussière d'Essence`);
        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('recyclerUsed');

        this.updateRecyclerDisplay();
        this.updateStorageDisplay(); // Mettre à jour les compteurs de shards sur les cartes
        this.updateTeamDisplay();
        this.updatePensionDisplay();
    }

    buyDustItem(itemId) {
        const item = DUST_SHOP_ITEMS[itemId];
        if (!item) return;

        // Vérification condition spéciale (Badge)
        if (item.requiredBadge && !this.hasBadge(item.requiredBadge)) {
            logMessage(`🔒 Verrouillé ! Vous devez posséder le badge : ${ACCOUNT_TALENTS[item.requiredBadge].name}`);
            return;
        }

        // Vérification si déjà possédé (Unique)
        if (itemId === 'auto_catcher' && this.hasAutoCatcher) {
            logMessage("Vous possédez déjà ce module !");
            return;
        }

        if (this.essenceDust < item.cost) {
            logMessage("Pas assez de Poussière d'Essence !");
            return;
        }

        this.essenceDust -= item.cost;

        // Effets
        if (itemId === 'talent_reroll') {
            this.talentRerolls++;
            logMessage(`🔮 Achat : Cristal (+1). Total: ${this.talentRerolls}`);
        }
        else if (itemId === 'talent_choice') {
            this.talentChoices++;
            logMessage(`🌟 Achat : Orbe (+1). Total: ${this.talentChoices}`);
        }
        else if (itemId === 'auto_catcher') {
            this.hasAutoCatcher = true;
            toast.legendary("SYSTÈME UPGRADE", "Module Porygon-Z installé ! Configurez-le dans le menu Extras.");
            logMessage("🤖 Module Auto-Catch activé !");
            this.updateAutoCatcherUI(); // On crée cette fonction juste après
        } else if (item.type === 'item' && item.item) {
            const qty = item.amount || 1;
            this.addItem(item.item, qty);
            logMessage(`🛒 Achat : ${item.name} x${qty}`);
        }

        this.updateRecyclerDisplay();
        this.updatePlayerStatsDisplay(); // Pour mettre à jour l'affichage si besoin
    }



    updateExpeditionsDisplay() {
        if (typeof updateExpeditionsDisplayLogic === 'function') updateExpeditionsDisplayLogic(this);
    }

    updateAvailableExpeditionsList() {
        if (typeof updateAvailableExpeditionsListLogic === 'function') updateAvailableExpeditionsListLogic(this);
    }

    showMasteryModal() {
        const modal = document.getElementById('masteryModal');
        const grid = document.getElementById('masteryListGrid');
        if (!modal || !grid) return;

        grid.innerHTML = '';

        // 1. Vérification de sécurité (si l'objet n'existe pas encore)
        if (!this.expeditionMastery) this.expeditionMastery = {};

        // 2. Parcourir tous les biomes définis
        Object.keys(BIOME_DISPLAY).forEach(biomeKey => {
            const xp = this.expeditionMastery[biomeKey] || 0;
            const displayInfo = BIOME_DISPLAY[biomeKey];

            // 3. Calculer le niveau actuel
            let currentLevel = 1;
            let nextLevelXP = BIOME_MASTERY_LEVELS[2].xpRequired;
            let prevLevelXP = 0;
            let bonusDesc = "Aucun bonus";

            // On cherche le niveau le plus haut atteint
            for (let lvl = 5; lvl >= 1; lvl--) {
                if (xp >= BIOME_MASTERY_LEVELS[lvl].xpRequired) {
                    currentLevel = lvl;
                    bonusDesc = BIOME_MASTERY_LEVELS[lvl].desc;

                    // Définir les bornes pour la barre de progression
                    if (lvl < 5) {
                        prevLevelXP = BIOME_MASTERY_LEVELS[lvl].xpRequired;
                        nextLevelXP = BIOME_MASTERY_LEVELS[lvl + 1].xpRequired;
                    } else {
                        // Niveau Max
                        prevLevelXP = BIOME_MASTERY_LEVELS[5].xpRequired;
                        nextLevelXP = xp; // Barre pleine
                    }
                    break;
                }
            }

            // 4. Calcul du pourcentage
            let percent = 0;
            if (currentLevel < 5) {
                percent = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
            } else {
                percent = 100; // Max
            }

            // 5. Création de la carte
            const card = document.createElement('div');
            card.style.cssText = `
            background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; 
            padding: 10px 15px; display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
        `;

            card.innerHTML = `
            <div style="font-size: 24px; background:white; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.1); flex-shrink: 0;">
                ${displayInfo.icon}
            </div>
            
            <div style="flex: 1;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="font-size:14px; color:#333;">${displayInfo.name}</strong>
                    <span style="font-size:11px; font-weight:bold; color:#8b5cf6;">Niveau ${currentLevel}</span>
                </div>
                
                <div style="width: 100%; height: 6px; background: #ddd; border-radius: 3px; overflow: hidden; margin-bottom: 4px;">
                    <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #6d28d9); transition: width 0.3s;"></div>
                </div>
                
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#666;">
                    <span>XP: ${xp} / ${currentLevel < 5 ? nextLevelXP : 'MAX'}</span>
                    <span style="color:#16a34a; font-weight:bold;">${bonusDesc}</span>
                </div>
            </div>
        `;

            grid.appendChild(card);
        });

        modal.classList.add('show');
    }
    showCreatureSelectForExpedition(expeditionUid, expeditionId) {
        if (typeof showCreatureSelectForExpeditionLogic === 'function') showCreatureSelectForExpeditionLogic(this, expeditionUid, expeditionId);
    }

    /**
     * Tente de changer de créature automatiquement si l'option est activée.
     */
    triggerAutoSelect() {
        if (this.autoSelectEnabled && this.currentEnemy) {
            const bestIndex = this.findBestCreatureForEnemy();
            if (bestIndex !== -1 && bestIndex !== this.activeCreatureIndex) {
                this.setActiveCreature(bestIndex);
            }
        }
    }

    /**
         * Calcule et met à jour la stat this.stats.teamPower.
         * Cette valeur est le SUM des stats de combat de toutes les créatures actives.
         * @returns {number} La nouvelle puissance totale de l'équipe.
         */
    updateTeamPowerStat() {
        // La puissance totale est la somme de (HP + Attaque + Défense + Vitesse) de chaque membre
        const currentPower = this.playerTeam.reduce((sum, creature) => {
            // Assurez-vous que les créatures ont leurs stats recalculées (maxHp, attack, defense, speed)
            return sum + creature.maxHp + creature.attack + creature.defense + creature.speed;
        }, 0);

        // Mettre à jour la stat centrale
        this.stats.teamPower = currentPower;

        // Déclencher la vérification des succès liés à cette stat
        this.checkAchievements('teamPower');

        return currentPower;
    }

    toggleSquadSelection(storageIndex, maxSize, divId, expeditionId) {
        if (typeof toggleSquadSelectionLogic === 'function') toggleSquadSelectionLogic(this, storageIndex, maxSize, divId, expeditionId);
    }

    finalizeSquadStart(expeditionUid, expeditionId) {
        if (this.tempSquad.length === 0) return;
        const modal = document.getElementById('creatureSelectModal');
        if (modal) document.body.removeChild(modal);
        this.startExpedition(this.tempSquad, expeditionUid, expeditionId);
        this.tempSquad = [];
    }

    calculateIndividualScore(creature, expeditionDef) {
        return creature.maxHp + creature.attack + creature.defense + creature.speed;
    }

    calculateTeamSuccessRate(squad, expeditionDef) {
        if (typeof calculateTeamSuccessRateLogic === 'function') return calculateTeamSuccessRateLogic(this, squad, expeditionDef);
        return 0.5;
    }
    showExpeditionSendModal(storageIndex) {
        if (typeof showExpeditionSendModalLogic === 'function') showExpeditionSendModalLogic(this, storageIndex);
    }

    // ✅ AJOUTER CES DEUX FONCTIONS DANS LA CLASSE GAME

    showBadge(elementId, show) {
        const badge = document.getElementById(elementId);
        if (!badge) return; // Ne plante pas si l'élément n'existe pas

        // Si on doit l'afficher et qu'il n'y a pas déjà un badge
        if (show && badge.innerHTML === '') {
            badge.innerHTML = '<div class="notification-badge"></div>';
        }
        // Si on doit le cacher
        else if (!show) {
            badge.innerHTML = '';
        }
    }

    updateExtrasBadge() {
        // Vérifie si N'IMPORTE QUEL onglet a un badge
        const questBadge = document.getElementById('questsTabBadge')?.innerHTML !== '';
        const expBadge = document.getElementById('expeditionsTabBadge')?.innerHTML !== '';
        const rocketBadge = document.getElementById('teamRocketTabBadge')?.innerHTML !== '';

        // Met à jour le badge principal sur "Extras"
        this.showBadge('extrasBadge', questBadge || expBadge || rocketBadge);
    }

    /**
     * Met à jour les indicateurs des onglets Quêtes et Expéditions :
     * - Quêtes : récompenses à récupérer, quêtes à accepter, quête scénario
     * - Expéditions : récompenses à récupérer, slot disponible
     */
    updateTabBadges() {
        const displayableQuests = (this.quests || []).filter(q => !q.claimed);
        const toClaimQuests = displayableQuests.filter(q => q.completed && !q.claimed);
        const toAcceptQuests = displayableQuests.filter(q => !q.accepted);
        const hasStoryQuest = displayableQuests.some(q => q.questType === 'STORY');
        const hasRocketQuest = displayableQuests.some(q => q.questType === 'TEAM_ROCKET');
        const achievToClaim = (this.achievements && Object.values(this.achievements).filter(a => a.completed && !a.claimed).length) || 0;
        const toClaimTotal = toClaimQuests.length + achievToClaim;

        const questBadge = document.getElementById('questsTabBadge');
        if (questBadge) {
            const parts = [];
            if (toClaimTotal > 0) parts.push(`<span class="tab-badge tab-badge-claim" title="Récompense(s) à récupérer">${toClaimTotal}</span>`);
            if (toAcceptQuests.length > 0) parts.push(`<span class="tab-badge tab-badge-accept" title="Quête(s) à accepter">${toAcceptQuests.length}</span>`);
            if (hasStoryQuest && toClaimTotal === 0 && toAcceptQuests.length === 0) parts.push(`<span class="tab-badge tab-badge-story" title="Quête scénario">Scénario</span>`);
            if (hasRocketQuest && toClaimTotal === 0 && toAcceptQuests.length === 0) parts.push(`<span class="tab-badge tab-badge-story" title="Mission Team Rocket">Rocket</span>`);
            questBadge.innerHTML = parts.join('');
            questBadge.style.display = parts.length ? '' : 'none';
        }

        const expToClaim = (this.activeExpeditions || []).filter(e => Date.now() >= e.endTime).length;
        const expSlotsFree = this.activeExpeditions && this.maxExpeditionSlots != null && this.activeExpeditions.length < this.maxExpeditionSlots;
        const expBadge = document.getElementById('expeditionsTabBadge');
        if (expBadge) {
            const parts = [];
            if (expToClaim > 0) parts.push(`<span class="tab-badge tab-badge-claim" title="Récompense(s) d'expédition à récupérer">${expToClaim}</span>`);

            // Calcul du nombre de missions disponibles (non lancées) et slots libres
            const availableMissionsCount = this.availableExpeditions ? this.availableExpeditions.length : 0;
            const freeSlotsCount = this.maxExpeditionSlots - (this.activeExpeditions ? this.activeExpeditions.length : 0);

            // On affiche le nombre de missions qu'on peut REELLEMENT lancer (le minimum entre les slots libres et les missions disponibles)
            const playableMissionsCount = Math.min(availableMissionsCount, freeSlotsCount);

            if (playableMissionsCount > 0) {
                parts.push(`<span class="tab-badge tab-badge-accept" title="Mission(s) d'expédition disponible(s)">${playableMissionsCount}</span>`);
            }

            expBadge.innerHTML = parts.join('');
            expBadge.style.display = parts.length ? '' : 'none';
        }

        const tr = this.teamRocketState || {};
        const staking = tr.staking || {};
        const hasActiveSession = !!staking.activeSession;
        const rocketToClaim = hasActiveSession ? 1 : 0;
        const rocketToAccept = hasActiveSession ? 0 : this.getRocketStakeableOfferItems(Date.now()).length;
        const teamRocketBadge = document.getElementById('teamRocketTabBadge');
        if (teamRocketBadge) {
            const parts = [];
            if (rocketToClaim > 0) parts.push(`<span class="tab-badge tab-badge-claim" title="Session Push Your Luck active">${rocketToClaim}</span>`);
            if (rocketToAccept > 0) parts.push(`<span class="tab-badge tab-badge-accept" title="Objet(s) stakeables">${rocketToAccept}</span>`);
            teamRocketBadge.innerHTML = parts.join('');
            teamRocketBadge.style.display = parts.length ? '' : 'none';
        }

        this.updateExtrasBadge();
    }

    checkCompletedNotifications() {
        this.updateTabBadges();
    }

    /**
* Calcule le taux de réussite (0.0 à 1.0+) basé sur la difficulté
*/
    /**
     * Calcule le taux de réussite (0.0 à 1.0+) basé sur la difficulté
     */
    calculateExpeditionSuccessRate(creature, expeditionDef) {
        if (typeof calculateExpeditionSuccessRateLogic === 'function') return calculateExpeditionSuccessRateLogic(this, creature, expeditionDef);
        return 0.5;
    }

    updateExpeditionTimer(deltaTime) {
        if (typeof updateExpeditionTimerLogic === 'function') updateExpeditionTimerLogic(this, deltaTime);
    }

    /**
     * Vérifie si une créature remplit les conditions strictes (Type/Talent) de la mission.
     * @returns {boolean} True si compatible (ou aucune restriction), False sinon.
     */
    meetsExpeditionRequirements(creature, expeditionDef) {
        if (typeof meetsExpeditionRequirementsLogic === 'function') return meetsExpeditionRequirementsLogic(this, creature, expeditionDef);
        return true;
    }

    generateRandomExpedition() {
        if (typeof generateRandomExpeditionLogic === 'function') generateRandomExpeditionLogic(this);
    }

    startExpedition(storageIndices, expeditionUid, expeditionId) {
        if (typeof startExpeditionLogic === 'function') startExpeditionLogic(this, storageIndices, expeditionUid, expeditionId);
    }
    claimExpedition(index) {
        if (typeof claimExpeditionLogic === 'function') claimExpeditionLogic(this, index);
    }

    calculateExpeditionRewards(expeditionDef, creature, successRate) {
        if (typeof calculateExpeditionRewardsLogic === 'function') return calculateExpeditionRewardsLogic(this, expeditionDef, creature, successRate);
        return { pokedollars: 0, tokens: 0, shards: 0, eggs: {}, items: {}, performance: 'NORMAL' };
    }

    /**
     * Supprime une expédition disponible (par exemple si elle est impossible pour le joueur).
     */
    deleteAvailableExpedition(expeditionUid) {
        const idx = this.availableExpeditions ? this.availableExpeditions.findIndex(e => e.uid == expeditionUid) : -1;
        if (idx === -1) return;
        this.availableExpeditions.splice(idx, 1);
        if (typeof this.updateExpeditionsDisplay === 'function') this.updateExpeditionsDisplay();
    }

    /**
     * Ouvre un petit modal de confirmation avant de supprimer une expédition.
     */
    confirmDeleteAvailableExpedition(expeditionUid, expeditionName) {
        const existing = document.getElementById('confirmDeleteExpeditionModal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'confirmDeleteExpeditionModal';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: radial-gradient(
                ellipse 80% 70% at 50% 45%,
                rgba(255, 248, 240, 0.15) 0%,
                rgba(72, 62, 52, 0.5) 50%,
                rgba(58, 50, 42, 0.92) 100%
            );
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 11000;
        `;

        const box = document.createElement('div');
        box.style.cssText = `
            background: linear-gradient(165deg, #5c5042 0%, #4a4035 45%, #3d352b 100%);
            color: #f1f5f9;
            padding: 18px 20px 16px;
            border-radius: 18px;
            border: 1px solid rgba(180, 155, 100, 0.35);
            max-width: 360px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            font-size: 13px;
        `;

        // Si aucun nom n'est passé, on essaie de le déduire à partir des définitions d'expédition
        let resolvedName = expeditionName;
        if (!resolvedName && this.availableExpeditions) {
            const inst = this.availableExpeditions.find(e => e.uid == expeditionUid);
            if (inst && typeof EXPEDITION_DEFINITIONS !== 'undefined') {
                const def = EXPEDITION_DEFINITIONS[inst.defId];
                if (def && def.name) resolvedName = def.name;
            }
        }
        const safeName = resolvedName || 'cette expédition';
        box.innerHTML = `
            <div style="font-weight:800; margin-bottom:6px; color:#fef3c7;">Supprimer l'expédition ?</div>
            <p style="margin:0 0 14px 0; color:#e5e7eb;">
                Voulez-vous vraiment supprimer <strong>${safeName}</strong> de la liste des missions disponibles ?
            </p>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button"
                        style="padding:6px 10px; background:#e5e7eb; color:#111827; border:none; border-radius:999px; font-weight:600; cursor:pointer;"
                        onclick="document.getElementById('confirmDeleteExpeditionModal')?.remove()">
                    Annuler
                </button>
                <button type="button"
                        style="padding:6px 12px; background:#ef4444; color:white; border:none; border-radius:999px; font-weight:700; cursor:pointer;"
                        onclick="(function(){ game.deleteAvailableExpedition('${expeditionUid}'); document.getElementById('confirmDeleteExpeditionModal')?.remove(); })()">
                    Supprimer
                </button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    getActiveBoostMultiplier(type) {
        let multiplier = 0;

        this.activeBoosts.forEach(boost => {
            if (boost.type === type) {
                multiplier += boost.value;
            }
        });

        return multiplier;
    }
    getStatBoostMultiplier(stat) {
        let multiplier = 0;

        this.activeStatBoosts.forEach(boost => {
            if (boost.stat === 'all') {
                multiplier += boost.value;
            } else if (boost.stat === stat) {
                multiplier += boost.value;
            }
        });

        return multiplier;
    }

    // Retourne les infos des boosts actifs pour une stat (pour tooltip header)
    getBoostInfoForStat(stat) {
        if (!this.activeStatBoosts || this.activeStatBoosts.length === 0) return [];
        const now = Date.now();
        const list = [];
        this.activeStatBoosts.forEach(boost => {
            if (boost.endTime <= now) return;
            const affects = (boost.stat === stat || boost.stat === 'all');
            if (!affects) return;
            const timeLeftMs = boost.endTime - now;
            let label = 'Bonus';
            if (boost.itemId && typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[boost.itemId]) {
                label = ALL_ITEMS[boost.itemId].name || label;
            } else if (boost.stat === 'all') {
                label = boost.itemId === 'potion_max' ? 'Potion Max' : (boost.itemId === 'super_potion' ? 'Super Potion' : 'Toutes stats');
            }
            list.push({
                label: label,
                valuePct: Math.round(boost.value * 100),
                timeLeftMs: timeLeftMs
            });
        });
        return list;
    }

    showBoostTooltip(event, stat) {
        const infos = this.getBoostInfoForStat(stat);
        if (infos.length === 0) {
            this.scheduleTooltip(event, 'Boost', 'Aucun boost actif sur cette stat.');
            return;
        }
        const lines = infos.map(b => {
            const min = Math.floor(b.timeLeftMs / 60000);
            const sec = Math.floor((b.timeLeftMs % 60000) / 1000);
            const timeStr = min + ' min ' + sec.toString().padStart(2, '0') + ' s';
            return '• ' + b.label + ' : +' + b.valuePct + '% — ' + timeStr;
        });
        const statNames = { hp: 'PV', attack: 'Attaque', spattack: 'Att. Spé.', defense: 'Défense', spdefense: 'Déf. Spé.', speed: 'Vitesse' };
        const statLabel = statNames[stat] || stat;
        this.scheduleTooltip(event, '⚡ Boost ' + statLabel, lines.join('\n'));
    }

    updateQuestsDisplay() {
        if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(this);
    }

    // SÉCURITÉ : Sauvegarde avec protection anti-corruption
    saveGame() {
        return typeof saveGameLogic === 'function' ? saveGameLogic(this) : false;
    }

    handleSaveClick(btnElement) {
        // Lancer la vraie sauvegarde
        this.saveGame();

        // Ajouter le feedback visuel au bouton
        const originalText = btnElement.innerText;
        btnElement.classList.add('btn-save-success');
        btnElement.innerText = '✅ Sauvegardé !';

        // Retirer le feedback après un court instant et fermer proprement le menu
        setTimeout(() => {
            btnElement.classList.remove('btn-save-success');
            btnElement.innerText = "Sauvegarder";
            this.closeSaveManager();
        }, 600);
    }

    loadGame() {
        return typeof loadGameLogic === 'function' ? loadGameLogic(this) : false;
    }

    getDefaultHeaderSkinId() {
        return (typeof HEADER_SKIN_DEFAULT_ID === 'string' && HEADER_SKIN_DEFAULT_ID)
            ? HEADER_SKIN_DEFAULT_ID
            : 'classic_lab';
    }

    colorToRgbTriplet(colorValue, fallback = '44, 62, 80') {
        if (typeof colorValue !== 'string') return fallback;
        const color = colorValue.trim();

        const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (hexMatch) {
            let hex = hexMatch[1];
            if (hex.length === 3) {
                hex = hex.split('').map((c) => c + c).join('');
            }
            const intVal = parseInt(hex, 16);
            const r = (intVal >> 16) & 255;
            const g = (intVal >> 8) & 255;
            const b = intVal & 255;
            return `${r}, ${g}, ${b}`;
        }

        const rgbMatch = color.match(/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/i);
        if (rgbMatch) {
            const clamp = (n) => Math.max(0, Math.min(255, Number(n) || 0));
            return `${clamp(rgbMatch[1])}, ${clamp(rgbMatch[2])}, ${clamp(rgbMatch[3])}`;
        }

        return fallback;
    }

    sampleBottomImageRgbTriplet(imagePath, fallback = '44, 62, 80') {
        if (typeof imagePath !== 'string' || !imagePath.trim()) {
            return Promise.resolve(fallback);
        }

        // Note: avec un lancement direct en file://, la lecture pixels via canvas
        // peut être bloquée (origine opaque). On retourne le fallback pour éviter
        // un comportement instable.
        if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
            if (!this._headerSkinSamplingFileWarned) {
                this._headerSkinSamplingFileWarned = true;
                console.warn('[HeaderSkin] Pixel sampling disabled on file://. Use http://localhost to enable accurate sampling.');
            }
            return Promise.resolve(fallback);
        }

        const normalizedPath = imagePath.trim();
        const cacheKey = `${normalizedPath}::v4`;
        if (this.headerSkinFadeColorCache && this.headerSkinFadeColorCache[cacheKey]) {
            return Promise.resolve(this.headerSkinFadeColorCache[cacheKey]);
        }

        return new Promise((resolve) => {
            const img = new Image();
            try {
                const parsedUrl = new URL(normalizedPath, window.location.href);
                const isHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
                const isCrossOrigin = parsedUrl.origin !== window.location.origin;
                if (isHttp && isCrossOrigin) img.crossOrigin = 'anonymous';
            } catch (e) {
                // Ignore URL parsing failures and continue without crossOrigin.
            }
            img.onload = () => {
                try {
                    const srcW = img.naturalWidth || img.width || 0;
                    const srcH = img.naturalHeight || img.height || 0;
                    if (!srcW || !srcH) {
                        resolve(fallback);
                        return;
                    }

                    const collectPixels = (bandRatio, minBandPx, maxCanvasH) => {
                        const bandHeight = Math.max(minBandPx, Math.floor(srcH * bandRatio));
                        const canvasW = Math.min(256, srcW);
                        const canvasH = Math.min(maxCanvasH, bandHeight);
                        const canvas = document.createElement('canvas');
                        canvas.width = canvasW;
                        canvas.height = canvasH;
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        if (!ctx) return [];

                        ctx.drawImage(
                            img,
                            0,
                            Math.max(0, srcH - bandHeight),
                            srcW,
                            bandHeight,
                            0,
                            0,
                            canvasW,
                            canvasH
                        );

                        const data = ctx.getImageData(0, 0, canvasW, canvasH).data;
                        const extracted = [];
                        for (let i = 0; i < data.length; i += 4) {
                            const alpha = data[i + 3] / 255;
                            if (alpha <= 0.05) continue;
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];

                            const maxCh = Math.max(r, g, b);
                            const minCh = Math.min(r, g, b);
                            const saturation = maxCh === 0 ? 0 : (maxCh - minCh) / maxCh;
                            const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);

                            // Ignore les highlights chauds/vifs qui biaisent le fondu.
                            if (luminance > 170 && saturation > 0.22) continue;

                            extracted.push({ r, g, b, luminance, saturation });
                        }
                        return extracted;
                    };

                    let pixels = collectPixels(0.04, 4, 64);
                    if (pixels.length < 24) {
                        pixels = collectPixels(0.18, 10, 96);
                    }

                    if (pixels.length === 0) {
                        resolve(fallback);
                        return;
                    }

                    const sortedLum = pixels.map((p) => p.luminance).sort((a, b) => a - b);
                    const darkCut = sortedLum[Math.max(0, Math.floor(sortedLum.length * 0.36))];
                    const midCut = sortedLum[Math.max(0, Math.floor(sortedLum.length * 0.50))];

                    let corePixels = pixels.filter((p) => p.luminance <= darkCut && p.saturation <= 0.7);
                    if (corePixels.length < Math.max(20, Math.floor(pixels.length * 0.10))) {
                        corePixels = pixels.filter((p) => p.luminance <= midCut);
                    }
                    if (corePixels.length < Math.max(16, Math.floor(pixels.length * 0.08))) {
                        corePixels = pixels;
                    }

                    let weightedR = 0;
                    let weightedG = 0;
                    let weightedB = 0;
                    let totalWeight = 0;

                    for (const p of corePixels) {
                        const darkness = 1 - (p.luminance / 255);
                        const satPenalty = 1 - (0.40 * p.saturation);
                        const weight = Math.max(0.05, darkness * darkness * satPenalty);
                        weightedR += p.r * weight;
                        weightedG += p.g * weight;
                        weightedB += p.b * weight;
                        totalWeight += weight;
                    }

                    if (totalWeight <= 0) {
                        resolve(fallback);
                        return;
                    }

                    const r = Math.round(weightedR / totalWeight);
                    const g = Math.round(weightedG / totalWeight);
                    const b = Math.round(weightedB / totalWeight);
                    const rgb = `${r}, ${g}, ${b}`;
                    this.headerSkinFadeColorCache[cacheKey] = rgb;
                    resolve(rgb);
                } catch (error) {
                    resolve(fallback);
                }
            };
            img.onerror = () => resolve(fallback);
            img.src = normalizedPath;
        });
    }

    normalizeHeaderSkinState() {
        const defaultId = this.getDefaultHeaderSkinId();
        if (!Array.isArray(this.unlockedHeaderSkins)) this.unlockedHeaderSkins = [];
        if (!this.unlockedHeaderSkins.includes(defaultId)) this.unlockedHeaderSkins.push(defaultId);

        if (typeof HEADER_SKINS !== 'undefined' && HEADER_SKINS && typeof HEADER_SKINS === 'object') {
            this.unlockedHeaderSkins = this.unlockedHeaderSkins
                .filter((id, index, arr) => !!HEADER_SKINS[id] && arr.indexOf(id) === index);
            if (!this.unlockedHeaderSkins.includes(defaultId)) this.unlockedHeaderSkins.push(defaultId);
        }

        if (typeof this.selectedHeaderSkin !== 'string' || !this.selectedHeaderSkin) {
            this.selectedHeaderSkin = defaultId;
        }
    }

    refreshUnlockedHeaderSkinsFromAchievements(options = {}) {
        const silent = options.silent !== false;
        if (typeof HEADER_SKINS === 'undefined' || !HEADER_SKINS) return false;
        this.normalizeHeaderSkinState();
        let unlockedAny = false;
        const completed = this.achievementsCompleted || {};

        Object.entries(HEADER_SKINS).forEach(([skinId, skinDef]) => {
            if (!skinDef) return;
            const unlockId = skinDef.unlockAchievementId;
            const isUnlockedByDefault = !unlockId;
            if (!isUnlockedByDefault && !completed[unlockId]) return;
            if (this.unlockedHeaderSkins.includes(skinId)) return;
            this.unlockedHeaderSkins.push(skinId);
            unlockedAny = true;
            if (!silent && !isUnlockedByDefault && typeof logMessage === 'function') {
                logMessage(`🎨 Skin de header débloqué : ${skinDef.name}`);
            }
        });

        return unlockedAny;
    }

    unlockHeaderSkinByAchievement(achievementId, options = {}) {
        if (!achievementId || typeof HEADER_SKINS === 'undefined' || !HEADER_SKINS) return false;
        this.normalizeHeaderSkinState();
        const silent = !!options.silent;
        let unlockedAny = false;

        Object.entries(HEADER_SKINS).forEach(([skinId, skinDef]) => {
            if (!skinDef || skinDef.unlockAchievementId !== achievementId) return;
            if (this.unlockedHeaderSkins.includes(skinId)) return;
            this.unlockedHeaderSkins.push(skinId);
            unlockedAny = true;
            if (!silent) {
                if (typeof logMessage === 'function') logMessage(`🎨 Skin de header débloqué : ${skinDef.name}`);
                if (typeof toast !== 'undefined' && toast.info) toast.info("Nouveau skin", `Header: ${skinDef.name}`);
            }
        });

        if (unlockedAny) this.updateHeaderSkinOptionsUI();
        return unlockedAny;
    }

    applyHeaderSkinVisual(skinId) {
        const header = document.querySelector('.header');
        const gameContainer = document.querySelector('.game-container');
        if (!header || typeof HEADER_SKINS === 'undefined' || !HEADER_SKINS) return;
        const defaultId = this.getDefaultHeaderSkinId();
        const skin = HEADER_SKINS[skinId] || HEADER_SKINS[defaultId];
        if (!skin) return;
        const isThemeSelected = skin.id !== defaultId;

        const colors = skin.colors || {};
        const imagePath = (typeof skin.imagePath === 'string') ? skin.imagePath.trim() : '';
        const fadeRgb = this.colorToRgbTriplet(colors.fadeFallback || colors.bg || colors.panelBg || '#2c3e50');

        header.style.setProperty('--header-skin-bg', colors.bg || '#947864');
        header.style.setProperty('--header-skin-border', colors.border || '#5d4a3e');
        header.style.setProperty('--header-skin-panel-bg', colors.panelBg || '#bec3c6');
        header.style.setProperty('--header-skin-panel-border', colors.panelBorder || '#3b3b3b');
        header.style.setProperty('--header-skin-panel-bg-themed', colors.panelBgThemed || 'rgba(15, 23, 42, 0.56)');
        header.style.setProperty('--header-skin-panel-border-themed', colors.panelBorderThemed || colors.panelBorder || '#3b3b3b');
        header.style.setProperty('--header-skin-title-color', colors.titleColor || '#5d4a3e');
        header.style.setProperty('--header-skin-overlay', colors.overlay || 'rgba(0,0,0,0)');
        header.style.setProperty('--header-skin-glow', colors.glow || 'rgba(0,0,0,0.25)');
        header.style.setProperty('--header-skin-image', imagePath ? `url("${imagePath}")` : 'none');
        header.classList.toggle('header-theme-active', isThemeSelected);

        if (gameContainer) {
            gameContainer.style.setProperty('--header-skin-container-image', imagePath ? `url("${imagePath}")` : 'none');
            gameContainer.style.setProperty('--header-skin-fade-rgb', fadeRgb);
            gameContainer.classList.toggle('has-themed-header-bg', isThemeSelected);

            if (isThemeSelected && imagePath) {
                const expectedSkinId = skin.id;
                this.sampleBottomImageRgbTriplet(imagePath, fadeRgb).then((sampledRgb) => {
                    if (this.selectedHeaderSkin !== expectedSkinId) return;
                    const currentContainer = document.querySelector('.game-container');
                    if (!currentContainer || !currentContainer.classList.contains('has-themed-header-bg')) return;
                    currentContainer.style.setProperty('--header-skin-fade-rgb', sampledRgb || fadeRgb);
                });
            }
        }
    }

    updateHeaderSkinOptionsUI() {
        const select = document.getElementById('optHeaderSkinSelect');
        const desc = document.getElementById('optHeaderSkinDesc');
        const unlockCounter = document.getElementById('optHeaderSkinUnlock');
        if (!select || typeof HEADER_SKINS === 'undefined' || !HEADER_SKINS) return;

        this.normalizeHeaderSkinState();
        this.refreshUnlockedHeaderSkinsFromAchievements({ silent: true });

        const defaultId = this.getDefaultHeaderSkinId();
        if (!this.unlockedHeaderSkins.includes(this.selectedHeaderSkin)) {
            this.selectedHeaderSkin = defaultId;
        }

        select.innerHTML = '';
        Object.values(HEADER_SKINS).forEach((skin) => {
            if (!skin || !skin.id) return;
            const unlocked = this.unlockedHeaderSkins.includes(skin.id);
            const option = document.createElement('option');
            option.value = skin.id;
            option.textContent = unlocked ? skin.name : `🔒 ${skin.name}`;
            option.disabled = !unlocked;
            if (skin.id === this.selectedHeaderSkin) option.selected = true;
            select.appendChild(option);
        });

        if (unlockCounter) {
            unlockCounter.textContent = `${this.unlockedHeaderSkins.length}/${Object.keys(HEADER_SKINS).length} débloqués`;
        }

        const activeSkinId = select.value || this.selectedHeaderSkin || defaultId;
        const activeSkin = HEADER_SKINS[activeSkinId] || HEADER_SKINS[defaultId];
        if (desc && activeSkin) {
            let unlockLabel = 'Débloqué de base';
            if (activeSkin.unlockAchievementId) {
                const ach = (typeof ACHIEVEMENTS !== 'undefined') ? ACHIEVEMENTS[activeSkin.unlockAchievementId] : null;
                unlockLabel = ach ? `Succès: ${ach.title}` : `Succès: ${activeSkin.unlockAchievementId}`;
            }
            desc.textContent = `${activeSkin.description} · ${unlockLabel}`;
        }
    }

    selectHeaderSkin(skinId, options = {}) {
        const save = options.save !== false;
        const silent = !!options.silent;
        if (typeof HEADER_SKINS === 'undefined' || !HEADER_SKINS) return;

        this.normalizeHeaderSkinState();
        this.refreshUnlockedHeaderSkinsFromAchievements({ silent: true });

        const defaultId = this.getDefaultHeaderSkinId();
        const targetId = (typeof skinId === 'string' && skinId) ? skinId : defaultId;
        if (!this.unlockedHeaderSkins.includes(targetId)) {
            this.selectedHeaderSkin = defaultId;
            if (!silent && typeof toast !== 'undefined' && toast.warning) {
                toast.warning("Skin verrouillé", "Terminez le succès associé pour l'équiper.");
            }
        } else {
            this.selectedHeaderSkin = targetId;
        }

        this.applyHeaderSkinVisual(this.selectedHeaderSkin);
        this.updateHeaderSkinOptionsUI();
        if (save && typeof this.saveGame === 'function') this.saveGame();
    }

    // UI : Menu des Données (Mise à jour avec Option Pause Rare)
    openSaveManager() {
        const modal = document.getElementById('saveManagerModal');
        if (modal) {
            modal.classList.add('show');

            // ✅ MISE À JOUR DES BOUTONS D'OPTION
            this.updateOptionButtons();
        }
    }

    updateOfflineSimSliderLabel(rawValue) {
        const value = Number(rawValue) || 300;
        const offlineValue = document.getElementById('optOfflineSimValue');
        if (offlineValue) {
            offlineValue.textContent = `${value} combats/s`;
        }
    }

    updateOfflineSimFromSlider(rawValue) {
        const value = Number(rawValue) || 300;
        // Clamp de sécurité
        const clamped = Math.min(1000, Math.max(1, value));
        this.offlineSimMaxCombatsPerSecond = clamped;
        this.updateOfflineSimSliderLabel(clamped);
        // Rafraîchit tout le bloc Options pour refléter immédiatement la nouvelle valeur
        this.updateOptionButtons();
    }

    // Nouvelle fonction pour gérer les couleurs des boutons
    updateOptionButtons() {
        const btnFusion = document.getElementById('optSmartFusion');
        const btnPause = document.getElementById('optPauseRare');
        const offlineValue = document.getElementById('optOfflineSimValue');
        const offlineSlider = document.getElementById('optOfflineSimSlider');

        if (btnFusion) {
            btnFusion.textContent = this.smartFusion ? "ON" : "OFF";
            btnFusion.style.background = this.smartFusion ? "#22c55e" : "#94a3b8"; // Vert ou Gris
            btnFusion.style.color = "white";
        }

        if (btnPause) {
            btnPause.textContent = this.pauseOnRare ? "PAUSE" : "KILL";
            btnPause.style.background = this.pauseOnRare ? "#22c55e" : "#ef4444"; // Vert ou Rouge (Danger)
            btnPause.style.color = "white";
        }

        if (offlineValue) {
            const v = this.offlineSimMaxCombatsPerSecond || ((GAME_SPEEDS && GAME_SPEEDS.OFFLINE_SIM_MAX_COMBATS_PER_SECOND) || 300);
            offlineValue.textContent = `${v} combats/s`;
        }

        if (offlineSlider) {
            const v = this.offlineSimMaxCombatsPerSecond || ((GAME_SPEEDS && GAME_SPEEDS.OFFLINE_SIM_MAX_COMBATS_PER_SECOND) || 300);
            offlineSlider.value = v;
        }

        this.updateHeaderSkinOptionsUI();
    }

    // SYSTEM : Fermer le modal
    closeSaveManager() {
        const modal = document.getElementById('saveManagerModal');
        if (modal) modal.classList.remove('show');
    }

    // --- GESTION DES FENÊTRES (STATS & BONUS) ---

    // --- GESTION DES STATS (Ton code intégré) ---

    openStatsModal() {
        const modal = document.getElementById('statsModal');
        if (!modal) {
            console.error("❌ Erreur : Div statsModal introuvable");
            return;
        }

        // 1. On affiche le modal
        modal.classList.add('show');

        // 2. On lance ta fonction de calcul et d'affichage
        this.updateStatsUI();
    }

    closeStatsModal() {
        const modal = document.getElementById('statsModal');
        if (modal) modal.classList.remove('show');
    }

    // Ta fonction showStats(), transformée en méthode de classe
    updateStatsUI() {
        const display = document.getElementById('statsDisplay');
        if (!display) return;

        // --- 1. TES CALCULS (Adaptés avec 'this') ---
        const currentPlayTime = this.stats.totalPlayTime + (Date.now() - this.stats.startTime);
        const hours = Math.floor(currentPlayTime / 3600000);
        const minutes = Math.floor((currentPlayTime % 3600000) / 60000);
        const seconds = Math.floor((currentPlayTime % 60000) / 1000);

        const totalCombats = this.stats.combatsWon + this.stats.combatsLost;
        const winRate = totalCombats > 0
            ? ((this.stats.combatsWon / totalCombats) * 100).toFixed(1)
            : 0;

        const totalCreatures = this.playerTeam.length + this.storage.length + this.pension.length;

        const shinyRate = this.stats.eggsOpened > 0
            ? ((this.stats.shiniesObtained / this.stats.eggsOpened) * 100).toFixed(3)
            : 0;

        // Récupération sécurisée de la zone (variable globale ou propriété de classe)
        const zoneId = (typeof currentZone !== 'undefined') ? currentZone : 0;
        const zoneName = (typeof ZONES !== 'undefined' && ZONES[zoneId]) ? ZONES[zoneId].name : "Zone Inconnue";

        // Badges (Sécurité si l'objet badges n'est pas encore init)
        const badgesCount = this.badges ? Object.values(this.badges).filter(b => b).length : 0;
        const maxLevel = this.playerTeam.length > 0 ? Math.max(...this.playerTeam.map(c => c.level)) : 0;


        // --- 2. TON HTML EXACT (Injecté) ---
        display.innerHTML = `
            <h3 style="color: #cbd5e1; margin-bottom: 15px;">Combat</h3>
            <div class="stats-grid">
                <div class="stat-box highlight">
                    <div class="stat-title">Combats Gagnes</div>
                    <div class="stat-number">${formatNumber(this.stats.combatsWon)}</div>
                    <div class="stat-subtitle">Taux de victoire: ${winRate}%</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Combats Perdus</div>
                    <div class="stat-number">${formatNumber(this.stats.combatsLost)}</div>
                </div>
                <div class="stat-box highlight">
                    <div class="stat-title">Boss Vaincus</div>
                    <div class="stat-number">${formatNumber(this.stats.bossDefeated)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Epic Vaincus</div>
                    <div class="stat-number">${formatNumber(this.stats.epicDefeated)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Degats Infliges</div>
                    <div class="stat-number">${formatNumber(this.stats.totalDamageDealt)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Degats Recus</div>
                    <div class="stat-number">${formatNumber(this.stats.totalDamageTaken)}</div>
                </div>
            </div>

            <h3 style="color: #cbd5e1; margin: 25px 0 15px 0;">Creatures</h3>
            <div class="stats-grid">
                <div class="stat-box highlight">
                    <div class="stat-title">Creatures Possedees</div>
                    <div class="stat-number">${totalCreatures}</div>
                    <div class="stat-subtitle">Equipe: ${this.playerTeam.length} | Pension: ${this.pension.length} | Stockage: ${this.storage.length}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Creatures Obtenues</div>
                    <div class="stat-number">${formatNumber(this.stats.creaturesObtained)}</div>
                </div>
                <div class="stat-box highlight">
                    <div class="stat-title">Shinies Obtenus</div>
                    <div class="stat-number">${this.stats.shiniesObtained}</div>
                    <div class="stat-subtitle">Taux: ${shinyRate}%</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Oeufs Ouverts</div>
                    <div class="stat-number">${formatNumber(this.stats.eggsOpened)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Evolutions</div>
                    <div class="stat-number">${formatNumber(this.stats.evolutionsCount)}</div>
                </div>
                <div class="stat-box highlight">
                    <div class="stat-title">Prestiges</div>
                    <div class="stat-number">${formatNumber(this.stats.prestigeCount)}</div>
                </div>
            </div>

            <h3 style="color: #cbd5e1; margin: 25px 0 15px 0;">Arènes</h3>
            <div class="stats-grid">
                <div class="stat-box highlight">
                    <div class="stat-title">Arènes Complétées</div>
                    <div class="stat-number">${this.stats.arenasWon || 0}/8</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Badges Obtenus</div>
                    <div class="stat-number">${badgesCount}/8</div>
                </div>
            </div>

            <h3 style="color: #cbd5e1; margin: 25px 0 15px 0;">Progression</h3>
            <div class="stats-grid">
                <div class="stat-box highlight">
                    <div class="stat-title">Temps de Jeu</div>
                    <div class="stat-number">${hours}h ${minutes}m ${seconds}s</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Pokedollars Total</div>
                    <div class="stat-number">${formatNumber(this.pokedollars)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Total intérêts banque Team Rocket</div>
                    <div class="stat-number">${formatNumber(this.stats.totalRocketBankInterestGained || 0)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Spins (machine Team Rocket)</div>
                    <div class="stat-number">${formatNumber(this.stats.rocketCasinoSpins || 0)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Zone Actuelle</div>
                    <div class="stat-number">${zoneId}</div>
                    <div class="stat-subtitle">${zoneName}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Niveau Max Equipe</div>
                    <div class="stat-number">${maxLevel}</div>
                </div>
            </div>
        `;
    }

    // DANS LA CLASSE GAME
    toggleSecondaryContent() {
        const content = document.getElementById('secondaryContent');
        const icon = document.getElementById('toggleIcon');

        if (!content || !icon) return;

        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            icon.textContent = '▼';
        } else {
            content.style.display = 'none';
            icon.textContent = '▲';

            // Mise à jour (Note le 'this')
            setTimeout(() => {
                const activeTab = document.querySelector('.tab-content.active');
                if (activeTab && activeTab.id === 'itemsTab') {
                    // Assure-toi que ces méthodes existent ou adapte les noms
                    if (this.updateItemsDisplay) this.updateItemsDisplay();
                    if (this.updateStatBoostsDisplay) this.updateStatBoostsDisplay();
                }
            }, 50);
        }
    }

    // --- GESTION DES BONUS ---

    openBonusModal() {
        const modal = document.getElementById('bonusModal');
        if (modal) {
            modal.classList.add('show');
            this.updateBonusUI(); // On affiche le contenu
        } else {
            console.error("❌ Erreur : <div id='bonusModal'> introuvable.");
        }
    }

    closeBonusModal() {
        const modal = document.getElementById('bonusModal');
        if (modal) modal.classList.remove('show');
    }

    // Fonction pour générer l'interface des Bonus (Placeholder joli)
    // AFFICHE LES BONUS ET BUFFS (Adaptation de ton code showAccountBuffs)
    updateBonusUI() {
        const display = document.getElementById('bonusDisplay');
        if (!display) return;

        // 1. BOUTIQUE (Placeholder pour l'instant, tu pourras remettre tes boutons d'achat ici)
        let html = '<h3 style="color: #8b5cf6; margin-bottom: 15px;">🛍️ Boutique</h3>';
        html += '<div class="stats-grid" style="margin-bottom:30px;">';
        html += '<div class="stat-box"><div class="stat-title">Bientôt disponible</div><div class="stat-subtitle">La boutique ouvrira prochainement</div></div>';
        html += '</div>';

        // 2. TALENTS D'ARÈNE (BADGES)
        html += '<h3 style="color: #667eea; margin-bottom: 15px;">🏆 Talents d\'Arène (Badges)</h3>';
        html += '<div class="stats-grid">';

        let badgeCount = 0;
        // Vérifie si ACCOUNT_TALENTS existe, sinon utilise un objet vide pour éviter le crash
        const talents = (typeof ACCOUNT_TALENTS !== 'undefined') ? ACCOUNT_TALENTS : {};

        Object.entries(talents).forEach(([key, talent]) => {
            if (this.hasBadge && this.hasBadge(key)) {
                badgeCount++;
                html += `
                    <div class="stat-box highlight">
                        <div class="stat-title">✅ ${talent.name}</div>
                        <div class="stat-subtitle">${talent.description}</div>
                    </div>
                `;
            }
        });

        if (badgeCount === 0) {
            html += '<div class="stat-box"><div class="stat-title">Aucun badge obtenu</div></div>';
        }
        html += '</div>';

        // 3. AMÉLIORATIONS (POKÉDOLLARS)
        html += '<h3 style="color: #667eea; margin: 25px 0 15px 0;">💰 Améliorations (Pokédollars)</h3>';
        html += '<div class="stats-grid">';

        let hasUpgrades = false;



        // Boost XP
        if (this.upgrades.expBoost.level > 0) {
            hasUpgrades = true;
            const expMultiplier = ((this.getExpMultiplier() - 1) * 100).toFixed(0);
            html += `
                <div class="stat-box">
                    <div class="stat-title">📚 Boost d'Expérience</div>
                    <div class="stat-number">Niveau ${this.upgrades.expBoost.level}</div>
                    <div class="stat-subtitle">+${expMultiplier}% XP (base)</div>
                </div>`;
        }

        // Drop œufs
        if (this.upgrades.eggDrop.level > 0) {
            hasUpgrades = true;
            const eggBonus = (this.getEggDropBonus() * 100).toFixed(0);
            html += `
                <div class="stat-box">
                    <div class="stat-title">🥚 Chasseur d'Œufs</div>
                    <div class="stat-number">Niveau ${this.upgrades.eggDrop.level}</div>
                    <div class="stat-subtitle">+${eggBonus}% chance de drop</div>
                </div>`;
        }

        // Autres upgrades (Stamina, Shards, etc...)
        // J'ai compacté pour l'exemple, mais tu peux remettre tous tes ifs ici
        // en remplaçant game. par this.

        if (!hasUpgrades) {
            html += '<div class="stat-box"><div class="stat-title">Aucune amélioration achetée</div></div>';
        }
        html += '</div>';

        // 4. RÉSUMÉ TOTAL DES BONUS
        html += '<h3 style="color: #667eea; margin: 25px 0 15px 0;">📊 Résumé des Bonus Totaux</h3>';
        html += '<div class="stats-grid">';

        // Sécurisation des méthodes + Bonus de collection
        const collBonuses = this.getCollectionBonuses ? this.getCollectionBonuses() : {};
        const hpBonus = (this.getAccountTalentBonus ? this.getAccountTalentBonus('hp_mult') : 0) * 100;
        const damageBonus = ((this.getAccountTalentBonus ? this.getAccountTalentBonus('damage_mult') : 0) + (collBonuses.damage_mult || 0)) * 100;
        const moneyBonus = ((this.getAccountTalentBonus ? this.getAccountTalentBonus('pokedollars_mult') : 0) + (collBonuses.gold_mult || 0)) * 100;
        const maxHpBonus = (collBonuses.max_hp_mult || 0) * 100;
        const defenseBonus = (collBonuses.defense_mult || 0) * 100;
        const critBonus = (collBonuses.crit_chance || 0) * 100;
        const lifestealBonus = (collBonuses.life_steal || 0) * 100;
        const regenBonus = (collBonuses.hp_regen_per_turn || 0) * 100;

        if (hpBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">❤️ HP Max</div><div class="stat-number">+${hpBonus.toFixed(0)}%</div></div>`;
        }
        if (maxHpBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">❤️ PV (Synergies)</div><div class="stat-number">+${maxHpBonus.toFixed(1)}%</div></div>`;
        }
        if (damageBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">⚔️ Dégâts</div><div class="stat-number">+${damageBonus.toFixed(0)}%</div></div>`;
        }
        if (defenseBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">🛡️ Défense</div><div class="stat-number">+${defenseBonus.toFixed(1)}%</div></div>`;
        }
        if (moneyBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">💰 Argent</div><div class="stat-number">+${moneyBonus.toFixed(0)}%</div></div>`;
        }
        if (critBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">💥 Critique</div><div class="stat-number">+${critBonus.toFixed(0)}%</div></div>`;
        }
        if (lifestealBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">🩸 Life Steal</div><div class="stat-number">+${lifestealBonus.toFixed(1)}%</div></div>`;
        }
        if (regenBonus > 0) {
            html += `<div class="stat-box highlight"><div class="stat-title">🌿 Regen PV/tour</div><div class="stat-number">+${regenBonus.toFixed(1)}%</div></div>`;
        }

        html += '</div>';

        // Injection Finale
        display.innerHTML = html;

    }

    // SÉCURITÉ : Exporter la sauvegarde (Téléchargement)
    exportSaveFile() {
        if (typeof exportSaveLogic === 'function') exportSaveLogic(this);
    }

    // SÉCURITÉ : Importer une sauvegarde (Upload + Validation)
    importSaveFile() {
        if (typeof importSaveLogic === 'function') importSaveLogic(this);
    }


    updateShopDisplay() {
        if (typeof updateShopDisplayUI === 'function') updateShopDisplayUI(this);
    }

    buyShopItem(itemKey) {
        console.log("🖱️ CLIC DÉTECTÉ sur", itemKey);
        const item = SHOP_ITEMS[itemKey];
        if (!item) {
            logMessage("❌ Objet inconnu !");
            return;
        }

        // --- 1. CALCUL DU COÛT DYNAMIQUE ---
        let cost = item.cost;

        if (Array.isArray(item.cost)) {
            let storedValue = 0;

            // Récupération de la valeur actuelle
            if (item.effect.type === 'pensionSlot') {
                storedValue = this.permanentBoosts.pensionSlots || 0;
            }
            else if (item.effect.type === 'permanentXP') {
                // ✅ CORRECTIF : On prend la valeur exacte (ex: 0.05), sans multiplication bizarre
                storedValue = this.permanentBoosts.xp || 0;
            }

            // Calcul du niveau actuel
            // Math.round est vital pour éviter que 0.05 / 0.05 donne 0.999999
            const currentLevel = Math.round(storedValue / item.effect.value);

            // Vérification si niveau max atteint (basé sur la taille du tableau de prix)
            if (currentLevel >= item.cost.length) {
                logMessage("❌ Niveau maximum atteint pour cet objet !");
                return;
            }

            // On récupère le prix correspondant au niveau actuel
            cost = item.cost[currentLevel];
        }
        // -----------------------------

        // --- 2. VÉRIFICATION DU PAIEMENT ---
        if (this.questTokens < cost) {
            logMessage(`❌ Pas assez de Jetons ! (${this.questTokens}/${cost})`);
            return;
        }

        // --- 3. DÉBIT ET APPLICATION ---
        this.questTokens -= cost;
        logMessage(`Achat : ${item.name} pour ${cost} Jetons.`);

        switch (item.type) {
            case 'boost':
                this.addBoost(item);
                break;

            case 'egg':
                this.eggs[item.rarity] = (this.eggs[item.rarity] || 0) + item.amount;
                logMessage(`✅ Vous avez reçu ${item.amount}x Œuf ${item.rarity} !`);
                this.updateEggsDisplay();
                break;

            case 'item':
                this.addItem(item.item, item.amount);
                break;

            case 'ct':
                this.addItem(item.item || ('ct_' + (item.moveName || '').replace(/ /g, '_')), item.amount || 1);
                logMessage(`✅ Vous avez reçu la CT ${item.name} !`);
                break;

            case 'permanent':
                const effectType = item.effect.type;

                if (effectType === 'permanentXP') {
                    // ✅ CORRECTIF : Gestion propre des décimales
                    let currentXp = this.permanentBoosts.xp || 0;
                    let newXp = currentXp + item.effect.value;

                    // On arrondit à 2 chiffres après la virgule pour éviter les bugs (ex: 0.300000004)
                    this.permanentBoosts.xp = parseFloat(newXp.toFixed(2));

                    logMessage(`✅ Gain d'XP permanent augmenté de ${(item.effect.value * 100).toFixed(0)}% !`);

                } else if (effectType === 'pensionSlot') {
                    this.permanentBoosts.pensionSlots = (this.permanentBoosts.pensionSlots || 0) + item.effect.value;
                    logMessage("✅ +1 emplacement de pension permanent !");
                }
                break;

            default:
                logMessage(`⚠️ Type d'objet inconnu: ${item.type}`);
        }

        // --- 4. RAFRAÎCHISSEMENT ---
        this.updateShopDisplay();
        this.updateBoostsDisplay();
        this.updatePensionDisplay();
        if (this.updateItemsDisplay) this.updateItemsDisplay();
    }



    sortPokedex(sortBy) {
        // Sécurité
        if (!this.pokedex) this.pokedex = {};

        // 1. Gestion de l'inversion de l'ordre
        if (this.pokedexSortBy === sortBy) {
            // Si on clique sur le même, on inverse
            this.pokedexSortOrder = (this.pokedexSortOrder === 'asc') ? 'desc' : 'asc';
        } else {
            // Si on change de critère, on remet un ordre logique par défaut
            this.pokedexSortBy = sortBy;
            // Par défaut : 'asc' pour ID/Nom, 'desc' pour Rareté/Compte
            this.pokedexSortOrder = (sortBy === 'rarity' || sortBy === 'count') ? 'desc' : 'asc';
        }

        const pokedexArray = Object.values(this.pokedex);
        const order = this.pokedexSortOrder === 'asc' ? 1 : -1;

        // 2. Mise à jour visuelle des boutons (Classe active + Flèche CSS)
        ['id', 'name', 'rarity', 'count', 'type'].forEach(type => {
            const btn = document.getElementById('sort-pokedex-' + type);
            if (btn) {
                btn.classList.remove('active', 'asc', 'desc'); // Nettoyage complet
            }
        });

        const activeBtn = document.getElementById('sort-pokedex-' + sortBy);
        if (activeBtn) {
            activeBtn.classList.add('active');
            // Ajoute une classe pour que le CSS affiche la flèche (si vous avez le CSS correspondant)
            activeBtn.classList.add(this.pokedexSortOrder);

            // Fallback texte si pas de CSS : Ajout d'une flèche temporaire
            // (Optionnel si vous avez déjà le CSS .sort-btn.active::after)
            // activeBtn.innerHTML = activeBtn.innerHTML.split(' ')[0] + (order === 1 ? ' ↑' : ' ↓');
        }

        // 3. Le Tri
        pokedexArray.sort((a, b) => {
            let valA, valB;

            switch (sortBy) {
                case 'id':
                    const ids = (typeof POKEMON_SPRITE_IDS !== 'undefined') ? POKEMON_SPRITE_IDS : {};
                    valA = ids[a.name] || 9999;
                    valB = ids[b.name] || 9999;
                    return (valA - valB) * order;

                case 'name':
                    return a.name.localeCompare(b.name) * order;

                case 'rarity':
                    const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };
                    valA = rarityOrder[a.rarity] || 0;
                    valB = rarityOrder[b.rarity] || 0;
                    return (valA - valB) * order;

                case 'count':
                    return (a.count - b.count) * order;

                case 'type':
                    return a.type.localeCompare(b.type) * order;

                default:
                    return 0;
            }
        });

        // 4. Reconstruction
        this.pokedex = {};
        pokedexArray.forEach(entry => {
            const key = entry.name + "_" + entry.type + "_" + entry.rarity + (entry.hasShiny ? "_shiny" : "");
            this.pokedex[key] = entry;
        });

        this.updatePokedexDisplay();
    }



    updatePlayerStatsDisplay() {
        if (typeof updatePlayerStatsDisplayUI === 'function') updatePlayerStatsDisplayUI(this);
    }

    // updateCombatDisplay -> logique déplacée vers uiManager.js (updateCombatDisplayUI)
    updateCombatDisplay() {
        if (typeof updateCombatDisplayUI === 'function') updateCombatDisplayUI(this);
    }

    updateTowerBuffsDisplay() {
        if (typeof updateTowerBuffsDisplayLogic === 'function') updateTowerBuffsDisplayLogic(this);
    }

    updateTeamRocketDisplay() {
        this.refreshRocketContractsIfNeeded();
        this.refreshRocketStakeableOffers(Date.now(), false);
        if (typeof updateTeamRocketDisplayUI === 'function') updateTeamRocketDisplayUI(this);
    }

    updateDisplay() {
        if (typeof updateZoneInfo === 'function') updateZoneInfo();
        this.updateTeamDisplay();
        this.updateStorageDisplay();
        this.updatePensionDisplay();
        this.updateEggsDisplay();
        this.updateIncubatorsDisplay();
        this.updateUpgradesDisplay();
        this.updateCombatDisplay();
        this.updateTowerBuffsDisplay();
        this.updatePokedexDisplay();
        this.updateArenasDisplay();
        this.displayActiveTalents();
        this.updateAchievementsDisplay();
        this.updateQuestsDisplay();
        this.updateItemsDisplay();
        this.updateStatBoostsDisplay();
        this.updateTowerDisplay();
        this.updateTowerShopDisplay();
        this.updateShopDisplay();
        this.updatePensionVisibility();
        this.updateBoostsDisplay();
        this.updateExpeditionsDisplay();
        this.updateTeamRocketDisplay();
    }

    getTypeEffectiveness(attackerType, defenderType) {
        return TYPE_EFFECTIVENESS[attackerType] && TYPE_EFFECTIVENESS[attackerType][defenderType] || 1;
    }

    getEffectivenessText(effectiveness) {
        if (effectiveness > 1) {
            return { text: "▲ Super Efficace", color: "#22c55e", class: "super-effective" };
        } else if (effectiveness < 1) {
            return { text: "▼ Pas Efficace", color: "#ef4444", class: "not-effective" };
        } else {
            return { text: "-", color: "#666", class: "normal-effective" };
        }
    }

    findBestCreatureForEnemy() {
        if (!this.currentEnemy || this.playerTeam.length === 0) return -1;

        let bestIndex = -1;
        let bestEffectiveness = 0;
        let bestStats = 0;

        for (let i = 0; i < this.playerTeam.length; i++) {
            const creature = this.playerTeam[i];
            if (!creature.isAlive()) continue;

            const effectiveness = this.getTypeEffectiveness(creature.type, this.currentEnemy.type);
            const statsSum = creature.attack + creature.defense + creature.speed;

            if (effectiveness > bestEffectiveness ||
                (effectiveness === bestEffectiveness && statsSum > bestStats)) {
                bestIndex = i;
                bestEffectiveness = effectiveness;
                bestStats = statsSum;
            }
        }

        return bestIndex;
    }

    selectBestCreature() {
        const bestIndex = this.findBestCreatureForEnemy();

        if (bestIndex === -1) {
            logMessage("Aucune creature vivante trouvee !");
            return;
        }

        if (bestIndex === this.activeCreatureIndex) {
            logMessage("La creature active est deja optimale !");
            return;
        }

        const bestCreature = this.playerTeam[bestIndex];
        const effectiveness = this.getTypeEffectiveness(bestCreature.type, this.currentEnemy.type);

        this.setActiveCreature(bestIndex);

        let message = bestCreature.name + " selectionne automatiquement !";
        if (effectiveness > 1) {
            message += " (Avantage de type!)";
        } else if (effectiveness < 1) {
            message += " (Meilleure option disponible)";
        }

        logMessage(message);
    }

    /**
     * Auto-check : si le Pokémon actif a un DÉSAVANTAGE de type,
     * on cherche un remplaçant avec avantage ou neutre.
     */
    autoCheckDisadvantage() {
        if (!this.autoSwitchDisadvantage) return; // Vérifier le flag individuel
        if (!this.autoSelectEnabled || !this.currentEnemy || !this.currentPlayerCreature) return;
        // Cooldown pour éviter les switchs en boucle (2s)
        const now = Date.now();
        if (this._lastAutoSwitchTime && now - this._lastAutoSwitchTime < 2000) return;

        const currentEff = this.getTypeEffectiveness(this.currentPlayerCreature.type, this.currentEnemy.type);
        if (currentEff >= 1) return; // Pas de désavantage → on reste

        // Chercher un meilleur candidat (avantage ou neutre)
        let bestIndex = -1;
        let bestEff = currentEff;
        let bestStats = 0;

        for (let i = 0; i < this.playerTeam.length; i++) {
            if (i === this.activeCreatureIndex) continue;
            const c = this.playerTeam[i];
            if (!c.isAlive()) continue;

            const eff = this.getTypeEffectiveness(c.type, this.currentEnemy.type);
            const stats = c.attack + c.defense + c.speed;

            if (eff > bestEff || (eff === bestEff && stats > bestStats)) {
                bestIndex = i;
                bestEff = eff;
                bestStats = stats;
            }
        }

        if (bestIndex !== -1 && bestEff > currentEff) {
            const newCreature = this.playerTeam[bestIndex];
            this._lastAutoSwitchTime = now;
            this.setActiveCreature(bestIndex);
            logMessage(`🔄 Switch auto : ${newCreature.name} remplace (désavantage de type !)`);
        }
    }

    /**
     * Auto-check : si le Pokémon actif a PLUS D'ENDURANCE,
     * on cherche un coéquipier qui en a encore.
     */
    autoCheckStamina() {
        if (!this.autoSwitchStamina) return; // Vérifier le flag individuel
        if (!this.autoSelectEnabled || !this.currentPlayerCreature) return;
        if (this.currentPlayerCreature.currentStamina > 0) return; // Encore de l'endurance
        // Talent robustesse = pas de malus, on reste
        if (this.currentPlayerCreature.passiveTalent === 'robustesse') return;

        const now = Date.now();
        if (this._lastAutoSwitchTime && now - this._lastAutoSwitchTime < 2000) return;

        let bestIndex = -1;
        let bestEff = 0;
        let bestStamina = 0;

        for (let i = 0; i < this.playerTeam.length; i++) {
            if (i === this.activeCreatureIndex) continue;
            const c = this.playerTeam[i];
            if (!c.isAlive() || c.currentStamina <= 0) continue;

            const eff = this.currentEnemy ? this.getTypeEffectiveness(c.type, this.currentEnemy.type) : 1;
            if (eff > bestEff || (eff === bestEff && c.currentStamina > bestStamina)) {
                bestIndex = i;
                bestEff = eff;
                bestStamina = c.currentStamina;
            }
        }

        if (bestIndex !== -1) {
            const newCreature = this.playerTeam[bestIndex];
            this._lastAutoSwitchTime = now;
            this.setActiveCreature(bestIndex);
            logMessage(`⚡ Switch auto : ${newCreature.name} prend le relais (endurance épuisée !)`);
        }
    }

    toggleAutoSelect() {
        this.autoSelectEnabled = !this.autoSelectEnabled;

        const btn = document.getElementById('autoSelectBtn');
        if (btn) {
            if (this.autoSelectEnabled) {
                btn.classList.add('auto-active');
                logMessage("🤖 Auto activé : sélection de type, switch désavantage/endurance, ultime auto.");
            } else {
                btn.classList.remove('auto-active');
                logMessage("Auto désactivé.");
            }
        }
    }

    openAutoSettings() {
        const modal = document.getElementById('autoSettingsModal');
        if (modal) {
            // Synchroniser le toggle principal
            const masterToggle = document.getElementById('autoMasterToggle');
            const masterLabel = document.getElementById('autoMasterLabel');
            if (masterToggle) masterToggle.checked = this.autoSelectEnabled;
            if (masterLabel) masterLabel.textContent = `Mode Auto : ${this.autoSelectEnabled ? 'ON' : 'OFF'}`;

            // Synchroniser les checkboxes avec l'état actuel
            const disCheck = document.getElementById('autoSwitchDisadvantageCheck');
            const stamCheck = document.getElementById('autoSwitchStaminaCheck');
            const ultCheck = document.getElementById('autoUltimateCheck');
            if (disCheck) disCheck.checked = this.autoSwitchDisadvantage;
            if (stamCheck) stamCheck.checked = this.autoSwitchStamina;
            if (ultCheck) ultCheck.checked = this.autoUltimate;

            modal.classList.add('show');
            // Pas de style.display = 'flex' car compact-popup utilise display: block

            // Repositionnement dynamique par rapport au centre du bouton
            this.positionCompactModal('autoSettingsModal', 'autoSelectBtn');
        }
    }

    closeAutoSettings() {
        const modal = document.getElementById('autoSettingsModal');
        if (modal) {
            modal.classList.remove('show');
            // Le CSS compact-popup gère le display: none via la classe
        }
    }

    toggleAutoSetting(setting) {
        if (setting === 'disadvantage') {
            this.autoSwitchDisadvantage = !this.autoSwitchDisadvantage;
            logMessage(`Switch désavantage : ${this.autoSwitchDisadvantage ? 'ON' : 'OFF'}`);
        } else if (setting === 'stamina') {
            this.autoSwitchStamina = !this.autoSwitchStamina;
            logMessage(`Switch endurance : ${this.autoSwitchStamina ? 'ON' : 'OFF'}`);
        } else if (setting === 'ultimate') {
            this.autoUltimate = !this.autoUltimate;
            logMessage(`Ultime auto : ${this.autoUltimate ? 'ON' : 'OFF'}`);
        }
    }

    toggleAutoMaster() {
        this.autoSelectEnabled = !this.autoSelectEnabled;

        // Mettre à jour le label
        const masterLabel = document.getElementById('autoMasterLabel');
        if (masterLabel) masterLabel.textContent = `Mode Auto : ${this.autoSelectEnabled ? 'ON' : 'OFF'}`;

        // Mettre à jour le bouton visuel
        const btn = document.getElementById('autoSelectBtn');
        if (btn) {
            if (this.autoSelectEnabled) {
                btn.classList.add('auto-active');
                logMessage("🤖 Auto activé : sélection de type, switch désavantage/endurance, ultime auto.");
            } else {
                btn.classList.remove('auto-active');
                logMessage("Auto désactivé.");
            }
        }
        this.updateAutoBadge(); // Mettre à jour le badge
    }

    // === UX ENHANCEMENTS ===

    // Mettre à jour le badge du bouton Auto
    updateAutoBadge() {
        const badge = document.getElementById('autoBadge');
        if (badge) {
            if (this.autoSelectEnabled) {
                badge.classList.add('active');
            } else {
                badge.classList.remove('active');
            }
        }
    }

    // Mettre à jour le badge du bouton Capture
    updateCaptureBadge() {
        const badge = document.getElementById('captureBadge');
        if (badge && this.captureMode === 2 && this.captureTargets) {
            const count = this.captureTargets.size || 0;
            badge.textContent = count;
            if (count > 0) {
                badge.classList.add('show');
            } else {
                badge.classList.remove('show');
            }
        } else if (badge) {
            badge.classList.remove('show');
        }
    }

    // Positionner un modal compact par rapport au centre de son bouton déclencheur
    positionCompactModal(modalId, btnId) {
        const modal = document.getElementById(modalId);
        const btn = document.getElementById(btnId);
        if (!modal || !btn) return;

        const rect = btn.getBoundingClientRect();
        // Calcul du centre du bouton
        const btnCenterX = rect.left + (rect.width / 2);
        const btnCenterY = rect.top + (rect.height / 2);

        // Décalage pour placer le coin bas-gauche du modal
        // "je vois que pour rapprocher les modals... il m'a fallu augmenter les valeurs" -> On veut s'éloigner du coin écran, pour aller vers le bouton.
        // Ici on part du BOUTON. Donc on ajoute un petit offset positif.
        const offsetX = 10;
        const offsetY = 10;

        modal.style.left = `${btnCenterX + offsetX}px`;
        modal.style.bottom = `${(window.innerHeight - btnCenterY) + offsetY}px`;

        // Reset transform/margin
        modal.style.transform = 'none';
        modal.style.margin = '0';
    }

    // Afficher le tooltip enrichi au survol du bouton Auto
    showAutoTooltip() {
        const tooltip = document.getElementById('autoTooltip');
        if (!tooltip) return;

        // Mettre à jour le contenu
        const statusSpan = document.getElementById('tooltipStatus');
        const disSpan = document.getElementById('tooltipDisadvantage');
        const stamSpan = document.getElementById('tooltipStamina');
        const ultSpan = document.getElementById('tooltipUltimate');

        if (statusSpan) statusSpan.textContent = this.autoSelectEnabled ? 'ON' : 'OFF';

        if (disSpan) {
            disSpan.textContent = this.autoSwitchDisadvantage ? 'ON' : 'OFF';
            disSpan.className = this.autoSwitchDisadvantage ? 'tooltip-status' : 'tooltip-status off';
        }
        if (stamSpan) {
            stamSpan.textContent = this.autoSwitchStamina ? 'ON' : 'OFF';
            stamSpan.className = this.autoSwitchStamina ? 'tooltip-status' : 'tooltip-status off';
        }
        if (ultSpan) {
            ultSpan.textContent = this.autoUltimate ? 'ON' : 'OFF';
            ultSpan.className = this.autoUltimate ? 'tooltip-status' : 'tooltip-status off';
        }

        // Positionnement dynamique (comme les modals)
        const btn = document.getElementById('autoSelectBtn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = rect.left + (rect.width / 2);
            const btnCenterY = rect.top + (rect.height / 2);

            // Offset légèrement différent pour le tooltip (plus haut ?)
            const offsetX = 50;
            const offsetY = 50;

            tooltip.style.left = `${btnCenterX + offsetX}px`;
            tooltip.style.bottom = `${(window.innerHeight - btnCenterY) + offsetY}px`;
            tooltip.style.transform = 'none'; // Évite les conflits
        }

        tooltip.classList.add('show');
    }

    // Masquer le tooltip
    hideAutoTooltip() {
        const tooltip = document.getElementById('autoTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }


    // Afficher le tooltip Capture
    showCaptureTooltip() {
        const tooltip = document.getElementById('captureTooltip');
        if (!tooltip) return;

        // Mise à jour du statut
        const statusSpan = document.getElementById('tooltipCaptureStatus');
        if (statusSpan) {
            statusSpan.textContent = (this.captureMode === 2) ? 'ON' : 'OFF';
            statusSpan.className = (this.captureMode === 2) ? 'tooltip-status' : 'tooltip-status off';
        }

        // Positionnement dynamique
        const btn = document.getElementById('captureModeBtn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = rect.left + (rect.width / 2);
            const btnCenterY = rect.top + (rect.height / 2);

            const offsetX = 50;
            const offsetY = 50;

            tooltip.style.left = `${btnCenterX + offsetX}px`;
            tooltip.style.bottom = `${(window.innerHeight - btnCenterY) + offsetY}px`;
            tooltip.style.transform = 'none';
        }

        tooltip.classList.add('show');
    }

    hideCaptureTooltip() {
        const tooltip = document.getElementById('captureTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    // Afficher le tooltip Fuite
    showForfeitTooltip() {
        const tooltip = document.getElementById('forfeitTooltip');
        if (!tooltip) return;

        // Positionnement dynamique
        const btn = document.getElementById('forfeitBtn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = rect.left + (rect.width / 2);
            const btnCenterY = rect.top + (rect.height / 2);

            // Le bouton Fuite est à DROITE.
            // Donc on veut le tooltip à GAUCHE du bouton.
            // On décale de -200px (largeur approx du tooltip) - 20px
            const offsetX = -220;
            const offsetY = 50;

            tooltip.style.left = `${btnCenterX + offsetX}px`;
            tooltip.style.bottom = `${(window.innerHeight - btnCenterY) + offsetY}px`;
            tooltip.style.transform = 'none';
        }

        tooltip.classList.add('show');
    }

    hideForfeitTooltip() {
        const tooltip = document.getElementById('forfeitTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    forfeitCombat() {
        // 1. Cas Tour de Combat : Abandon stratégique
        if (this.towerState.isActive) {
            if (confirm("Voulez-vous quitter la Tour ?\nVous conserverez toutes les Marques gagnées jusqu'ici.")) {
                logMessage("🏳️ Vous décidez de quitter la Tour avec vos gains.");
                this.endTowerRun(true); // true = Abandon volontaire
            }
            return;
        }

        // 2. Cas Arène
        if (this.arenaState.active) {
            this.loseArena("Abandon");
            return;
        }

        // 3. Cas Capture en cours
        if (document.getElementById('captureModal').classList.contains('show')) {
            this.skipCapture();
            return;
        }

        // 4. Cas Combat Standard (Zone)
        if (this.combatState !== 'fighting' && this.combatState !== 'starting') {
            logMessage("Aucun combat en cours !");
            return;
        }

        this.combatState = 'waiting';
        this.lastCombatTime = Date.now();
        this.currentEnemy = null;

        logMessage("Combat abandonné ! Prochain combat dans quelques secondes...");
        this.updateCombatDisplay();
    }

    prestigeCreature(creatureIndex, location) {
        let creature;

        // 1. Identifier la créature selon l'endroit
        if (location === 'pension') {
            creature = this.pension[creatureIndex];
        } else if (location === 'storage') {
            creature = this.storage[creatureIndex];
        } else {
            // Par défaut, ou si location === 'team'
            creature = this.playerTeam[creatureIndex];
        }

        if (!creature) {
            console.error("Erreur Prestige : Créature introuvable à l'index " + creatureIndex + " dans " + location);
            return;
        }

        const maxLevel = 100 + (creature.prestige * 10);
        if (creature.level < maxLevel) {
            logMessage(creature.name + " doit etre niveau " + maxLevel + " pour prestige !");
            return;
        }

        const shardKey = getShardKey(creature.name, creature.rarity);
        const shardsNeeded = this.getPrestigeCost(creature.prestige);

        const currentShards = this.shards[shardKey] || 0;

        if (currentShards < shardsNeeded) {
            logMessage("Pas assez de shards ! (" + currentShards + "/" + shardsNeeded + ")");
            return;
        }

        this.shards[shardKey] -= shardsNeeded;
        creature.prestige++;
        // ✅ GAIN DU TOKEN
        if (!creature.prestigeTokens) creature.prestigeTokens = 0;
        creature.prestigeTokens++;

        creature.level = 1;
        creature.exp = 0;
        creature.expToNext = creature.getExpToNext();

        creature.recalculateStats();
        creature.heal();
        creature.currentStamina = creature.maxStamina;
        creature.level = 1;
        creature.exp = 0;
        creature.expToNext = creature.getExpToNext();

        creature.recalculateStats();
        creature.heal();
        creature.currentStamina = creature.maxStamina;

        this.stats.prestigeCount++;
        this.updateTeamPowerStat();
        this.checkSpecialQuests('prestigeCount');
        this.checkAchievements('prestigeCount');
        this.checkAchievements('team_changed');

        const shinyText = creature.isShiny ? " ✨SHINY✨" : "";
        logMessage("PRESTIGE ! " + creature.name + shinyText + " monte au prestige " + creature.prestige + " ! (+20% stats, +50 stamina max)");
        logMessage(`⭐ PRESTIGE ! ${creature.name} gagne +1 Jeton de Prestige !`);
        toast.success("Prestige Réussi !", `${creature.name} est passé Prestige ${creature.prestige} !`);

        this.calculateTeamStats();
        this.updateTeamDisplay();
        this.updateStorageDisplay();
        this.updatePensionDisplay();
        // Mise à jour des compteurs de shards du recycleur si ouvert
        if (document.getElementById('shop-recycleur').classList.contains('active')) {
            this.updateRecyclerDisplay();
        }
    }

    // LOGIQUE : Dépense d'un jeton de prestige
    spendPrestigeToken(creatureIndex, location, stat) {
        let creature;
        if (location === 'team') creature = this.playerTeam[creatureIndex];
        else if (location === 'storage') creature = this.storage[creatureIndex];
        else if (location === 'pension') creature = this.pension[creatureIndex];

        if (!creature) return;

        if (creature.prestigeTokens > 0) {
            creature.prestigeTokens--;

            if (!creature.prestigeBonuses) creature.prestigeBonuses = { hp: 0, attack: 0, defense: 0, speed: 0 };
            creature.prestigeBonuses[stat]++;

            creature.recalculateStats();

            // Feedback
            const statNames = { hp: 'PV', attack: 'ATK', defense: 'DEF', speed: 'VIT' };
            logMessage(`💪 ${creature.name} : +5% ${statNames[stat]} permanent !`);

            // Rafraîchir le modal pour voir le changement immédiat
            this.showCreatureModal(creatureIndex, location);

            // Rafraîchir les affichages globaux
            this.updateDisplay();
        }
    }

    moveToTeam(creatureIndex) {
        const maxTeamSize = 6 + this.getAccountTalentBonus('team_slot');

        if (this.playerTeam.length >= maxTeamSize) {
            logMessage("Equipe pleine ! (" + this.playerTeam.length + "/" + maxTeamSize + ")");
            return;
        }


        if (creatureIndex < 0 || creatureIndex >= this.storage.length) return;
        if (this.isCreatureRocketLocked(this.storage[creatureIndex])) {
            logMessage("🔒 Ce Pokémon est immobilisé par un contrat Team Rocket.");
            return;
        }

        const creature = this.storage.splice(creatureIndex, 1)[0];
        this.playerTeam.push(creature);

        logMessage(creature.name + " rejoint l'equipe principale !");
        this.stats.pensionCount = this.pension.length;
        this.calculateTeamStats();
        this.updateTeamDisplay();
        this.updateTeamPowerStat();
        this.checkSpecialQuests('pensionCount');
        this.displayActiveTalents();
        this.updateStorageDisplay();
    }


    moveToStorage(creatureIndex) {
        if (this.playerTeam.length <= 1) {
            logMessage("Impossible de retirer la derniere creature de l'equipe !");
            return;
        }

        if (creatureIndex < 0 || creatureIndex >= this.playerTeam.length) return;

        if (creatureIndex === this.activeCreatureIndex) {
            this.activeCreatureIndex = creatureIndex === 0 ? 1 : 0;
        } else if (creatureIndex < this.activeCreatureIndex) {
            this.activeCreatureIndex--;
        }

        const creature = this.playerTeam.splice(creatureIndex, 1)[0];
        this.storage.push(creature);

        logMessage(creature.name + " va au stockage !");
        this.stats.pensionCount = this.pension.length;
        this.calculateTeamStats();
        this.updateTeamDisplay();
        this.checkSpecialQuests('pensionCount');
        this.displayActiveTalents();
        this.updateStorageDisplay();
    }

    moveToPension(creatureIndex, fromTeam = false) {
        const maxSlots = this.getPensionSlots();

        if (maxSlots === 0) {
            logMessage("La pension n'est pas encore debloquee ! Ameliorez-la d'abord.");
            return;
        }

        if (this.pension.length >= maxSlots) {
            logMessage("La pension est pleine ! (" + this.pension.length + "/" + maxSlots + ")");
            return;
        }

        let creature;
        if (fromTeam) {
            if (this.playerTeam.length <= 1) {
                logMessage("Impossible de retirer la derniere creature de l'equipe !");
                return;
            }

            if (creatureIndex < 0 || creatureIndex >= this.playerTeam.length) return;

            if (creatureIndex === this.activeCreatureIndex) {
                this.activeCreatureIndex = creatureIndex === 0 ? 1 : 0;
            } else if (creatureIndex < this.activeCreatureIndex) {
                this.activeCreatureIndex--;
            }

            creature = this.playerTeam.splice(creatureIndex, 1)[0];
        } else {
            if (creatureIndex < 0 || creatureIndex >= this.storage.length) return;
            if (this.isCreatureRocketLocked(this.storage[creatureIndex])) {
                logMessage("🔒 Ce Pokémon est immobilisé par un contrat Team Rocket.");
                return;
            }
            creature = this.storage.splice(creatureIndex, 1)[0];
        }

        this.pension.push(creature);
        logMessage(creature.name + " rejoint la pension !");
        this.stats.pensionCount = this.pension.length;
        this.checkAchievements('pensionCount');
        this.checkSpecialQuests('pensionCount');
        this.calculateTeamStats();
        this.displayActiveTalents();
        this.updateTeamDisplay();
        this.updateStorageDisplay();
        this.updatePensionDisplay();
    }

    moveFromPension(creatureIndex, toTeam = false) {
        if (creatureIndex < 0 || creatureIndex >= this.pension.length) return;

        // 1. On récupère la créature (retrait de la pension)
        const creature = this.pension.splice(creatureIndex, 1)[0];

        // 2. Calculer la VRAIE taille max de l'équipe (comme dans l'UI)
        const teamBonus = (this.getAccountTalentBonus) ? this.getAccountTalentBonus('team_slot') : 0;
        const maxTeamSize = 6 + teamBonus;

        if (toTeam) {
            // ✅ CORRECTION : On compare avec maxTeamSize, pas 6
            if (this.playerTeam.length >= maxTeamSize) {
                logMessage("Équipe pleine ! Créature envoyée au stockage.");
                this.storage.push(creature);
                if (typeof toast !== 'undefined') toast.info("Pension", "Équipe pleine : envoyé au stockage.");
            } else {
                this.playerTeam.push(creature);
                logMessage(creature.name + " quitte la pension et rejoint l'équipe !");
                if (typeof toast !== 'undefined') toast.success("Pension", `${creature.name} a rejoint l'équipe !`);
            }
        } else {
            this.storage.push(creature);
            logMessage(creature.name + " quitte la pension et va au stockage !");
        }

        // 3. Mises à jour
        if (this.stats) this.stats.pensionCount = this.pension.length;

        this.checkAchievements('pensionCount');
        this.checkSpecialQuests('pensionCount');

        this.calculateTeamStats();
        this.updateTeamDisplay();
        this.updateStorageDisplay();

        if (this.displayActiveTalents) this.displayActiveTalents();

        this.updatePensionDisplay();
        this.saveGame(); // Toujours utile de sauvegarder après un mouvement
    }

    /**
     * Réordonne l'équipe : déplace la créature de fromIndex vers toIndex.
     * Désactivé en combat / tour / arène.
     */
    reorderTeam(fromIndex, toIndex) {
        if (this.towerState.isActive || this.arenaState.active) return;
        if (this.combatState === 'fighting' || this.combatState === 'starting') return;
        if (fromIndex < 0 || fromIndex >= this.playerTeam.length) return;
        if (toIndex < 0 || toIndex >= this.playerTeam.length) return;
        if (fromIndex === toIndex) return;

        const creature = this.playerTeam.splice(fromIndex, 1)[0];
        this.playerTeam.splice(toIndex, 0, creature);

        if (this.activeCreatureIndex === fromIndex) {
            this.activeCreatureIndex = toIndex;
        } else if (fromIndex < this.activeCreatureIndex && toIndex >= this.activeCreatureIndex) {
            this.activeCreatureIndex--;
        } else if (fromIndex > this.activeCreatureIndex && toIndex <= this.activeCreatureIndex) {
            this.activeCreatureIndex++;
        }

        this.updateTeamDisplay();
        this.updateCombatDisplay();
        this.saveGame();
    }

    setActiveCreature(index) {
        if (index < 0 || index >= this.playerTeam.length) return;

        this.activeCreatureIndex = index;

        if (this.combatState === 'fighting' || this.combatState === 'starting') {
            const newCreature = this.playerTeam[index];

            if (this.faintedThisCombat && this.faintedThisCombat.has(newCreature.name)) {
                logMessage(newCreature.name + " est KO et ne peut pas rejoindre ce combat !");
                return;
            }

            if (newCreature.isAlive()) {
                const currentMainHp = this.currentPlayerCreature ? this.currentPlayerCreature.mainAccountCurrentHp : this.playerMainStats.hp;

                this.currentPlayerCreature = newCreature;
                this.currentPlayerCreature.mainAccountCurrentHp = currentMainHp;


                logMessage(newCreature.name + " entre en combat !");
            } else {
                logMessage(newCreature.name + " est KO et ne peut pas combattre !");
                return;
            }
        }

        this.updateTeamDisplay();
        this.updateCombatDisplay();
    }

    sortStorage(sortBy) {
        // 1. Gestion de l'ordre (Ascendant / Descendant)
        if (this.sortBy === sortBy) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortBy;
            // Par défaut, on trie les stats du plus grand au plus petit (desc)
            // Mais pour le Pokédex ou le Type, on veut souvent l'ordre alphabétique (asc)
            const ascDefaults = ['pokedex', 'type'];
            this.sortOrder = ascDefaults.includes(sortBy) ? 'asc' : 'desc';
        }

        // 2. Mise à jour visuelle des boutons
        const sortButtons = ['pokedex', 'level', 'rarity', 'hp', 'attack', 'spattack', 'defense', 'spdefense', 'speed', 'total', 'shards', 'type'];

        sortButtons.forEach(btnId => {
            const btn = document.getElementById('sort-' + btnId);
            if (btn) {
                btn.className = 'sort-btn'; // Reset classe
                if (this.sortBy === btnId) {
                    btn.className += ' active';
                    if (this.sortOrder === 'asc') btn.className += ' asc';
                }
            }
        });

        // 3. Le Tri
        this.storage.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'type': // ✅ NOUVEAU CAS
                    valueA = a.type;
                    valueB = b.type;
                    // Astuce : Si les types sont égaux, on trie par niveau ensuite pour que ce soit propre
                    if (valueA === valueB) return b.level - a.level;
                    break;

                case 'pokedex':
                    const ids = (typeof POKEMON_SPRITE_IDS !== 'undefined') ? POKEMON_SPRITE_IDS : {};
                    valueA = ids[a.name] || 9999;
                    valueB = ids[b.name] || 9999;
                    break;

                case 'level':
                    valueA = a.level; valueB = b.level;
                    break;
                case 'rarity':
                    const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };
                    valueA = rarityOrder[a.rarity] || 0;
                    valueB = rarityOrder[b.rarity] || 0;
                    break;
                case 'hp':
                    valueA = a.maxHp; valueB = b.maxHp;
                    break;
                case 'attack':
                    valueA = a.attack; valueB = b.attack;
                    break;
                case 'spattack':
                    valueA = a.spattack; valueB = b.spattack;
                    break;
                case 'defense':
                    valueA = a.defense; valueB = b.defense;
                    break;
                case 'spdefense':
                    valueA = a.spdefense; valueB = b.spdefense;
                    break;
                case 'speed':
                    valueA = a.speed; valueB = b.speed;
                    break;
                case 'total':
                    valueA = a.maxHp + a.attack + a.defense + a.speed;
                    valueB = b.maxHp + b.attack + b.defense + b.speed;
                    break;
                case 'shards':
                    // Fonction utilitaire pour la clé de shard
                    const getSKey = (c) => (typeof getShardKey === 'function') ? getShardKey(c.name, c.rarity) : c.name;
                    valueA = this.shards[getSKey(a)] || 0;
                    valueB = this.shards[getSKey(b)] || 0;
                    break;
                default:
                    return 0;
            }

            // ✅ LOGIQUE DE COMPARAISON UNIFIÉE (Nombres & Textes)
            if (typeof valueA === 'string') {
                return this.sortOrder === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            } else {
                return this.sortOrder === 'asc'
                    ? valueA - valueB
                    : valueB - valueA;
            }
        });

        this.updateStorageDisplay();
    }


    updateTeamDisplay() {
        if (typeof updateTeamDisplayUI === 'function') updateTeamDisplayUI(this);
    }



    updateStorageDisplay() {
        if (typeof updateStorageDisplayUI === 'function') updateStorageDisplayUI(this);
    }

    updatePensionDisplay() {
        const pensionList = document.getElementById('pensionList');
        const pensionCount = document.getElementById('pensionCount');
        const maxSlots = this.getPensionSlots();
        const transferRate = (this.getPensionTransferRate() * 100).toFixed(0);

        if (!pensionList || !pensionCount) return;

        pensionCount.textContent = this.pension.length + "/" + maxSlots;
        pensionList.innerHTML = '';

        if (maxSlots === 0) {
            // ... (message pension non débloquée) ...
            return;
        }
        if (this.pension.length === 0) {
            // ... (message pension vide) ...
            return;
        }

        for (let i = 0; i < this.pension.length; i++) {
            const creature = this.pension[i];
            const card = document.createElement('div');
            card.className = "creature-card rarity-" + creature.rarity;
            if (creature.isShiny) {
                card.className += " shiny";
            }
            card.style.border = "1px solid #ff69b4";
            card.style.boxShadow = "0 0 5px rgba(255, 105, 180, 0.5)";
            card.style.cursor = 'pointer';
            card.setAttribute('onclick', `game.showCreatureModal(${i}, 'pension')`);

            // --- ✅ DÉCLARATIONS DÉPLACÉES ICI ---
            const maxLevel = 100 + (creature.prestige * 10);
            const shardKey = getShardKey(creature.name, creature.rarity);
            const currentShards = this.shards[shardKey] || 0;
            const prestigeCost = this.getPrestigeCost(creature.prestige);
            const spriteUrl = getPokemonSpriteUrl(creature.name, creature.isShiny, false);
            // --- FIN DU DÉPLACEMENT ---

            if (creature.level >= maxLevel && currentShards >= prestigeCost) {
                card.classList.add('prestige-ready');
            }

            const shinyStars = creature.isShiny ? '<div class="shiny-stars" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : '';
            const heldItemBadge = typeof getHeldItemBadgeHTML === 'function' ? getHeldItemBadgeHTML(creature) : '';
            const pensionCardContent = `
                        <img src="${spriteUrl}" alt="${creature.name}" class="team-slot-sprite">
                        <div class="team-slot-name">${creature.name} ${creature.prestige > 0 ? `★${creature.prestige}` : ''}</div>
                        <div class="team-slot-level">Niv. ${creature.level}</div>
                        
                        <div class="team-slot-info" style="justify-content: center;">
                            <span style="color: #8a2be2;">💎 ${currentShards}/${prestigeCost}</span>
                        </div>

                        <div class="pension-contribution-trigger" data-creature-index="${i}" style="background: rgba(255,105,180,0.2); padding: 6px 8px; border-radius: 5px; margin-top: 5px; width: 100%; font-size: 11px;">
                            <span style="font-weight: bold; color: #ff1493;">Contribution (${transferRate}%) :</span>
                            <span class="pension-contribution-btn">Voir détails</span>
                        </div>
                    `;
            card.innerHTML = shinyStars + heldItemBadge + pensionCardContent;

            const contributedHP = Math.floor(creature.maxHp * this.getPensionTransferRate());
            const contributedATK = Math.floor(creature.attack * this.getPensionTransferRate());
            const contributedSpATK = Math.floor(creature.spattack * this.getPensionTransferRate());
            const contributedDEF = Math.floor(creature.defense * this.getPensionTransferRate());
            const contributedSpDEF = Math.floor(creature.spdefense * this.getPensionTransferRate());
            const contributedSPD = Math.floor(creature.speed * this.getPensionTransferRate());

            pensionList.appendChild(card);
            const triggerEl = card.querySelector('.pension-contribution-trigger');
            if (triggerEl) {
                triggerEl.addEventListener('mouseenter', function (e) { e.stopPropagation(); game.showPensionContributionPopover(i, this); });
                triggerEl.addEventListener('mouseleave', function (e) { game.scheduleHidePensionContributionPopover(150); });
            }
        }
    }


    formatMsAsTime(ms) {
        if (ms <= 0) return '0:00';
        const s = Math.floor((ms / 1000) % 60);
        const m = Math.floor(ms / 60000);
        const h = Math.floor(m / 60);
        const mm = m % 60;
        if (h > 0) return `${h}:${String(mm).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${mm}:${String(s).padStart(2, '0')}`;
    }

    initIncubatorsDOM(container) {
        container.innerHTML = '';
        container.setAttribute('data-initialized', 'true');

        // Délégation d'événements pour les 4 slots
        container.addEventListener('click', (e) => {
            const autoBtn = e.target.closest('.incubator-auto-toggle');
            if (autoBtn && !autoBtn.disabled) {
                e.stopPropagation();
                const slotIndex = parseInt(autoBtn.getAttribute('data-slot'), 10);
                const currentState = this.getAutoIncubationSettings(slotIndex).enabled;
                this.setAutoIncubationEnabled(slotIndex, !currentState);
                return;
            }

            const prioBtn = e.target.closest('.incubator-priority-chip');
            if (prioBtn && !prioBtn.disabled) {
                e.stopPropagation();
                const slotIndex = parseInt(prioBtn.getAttribute('data-slot'), 10);
                this.cycleIncubatorPriority(slotIndex);
                return;
            }

            const slotTarget = e.target.closest('.incubator-slot');
            if (!slotTarget) return;

            const slotIndex = parseInt(slotTarget.getAttribute('data-slot'), 10);
            const isReady = slotTarget.classList.contains('incubator-ready');
            const hasEgg = slotTarget.getAttribute('data-has-egg') === 'true';

            if (isReady) {
                e.stopPropagation();
                this.openIncubatorEgg(slotIndex);
            } else if (!hasEgg && slotIndex < this.getMaxIncubatorSlots()) {
                e.stopPropagation();
                this.openChooseEggModal(slotIndex);
            }
        });

        // Génération du squelette des 4 slots
        for (let i = 0; i < 4; i++) {
            const slotEl = document.createElement('div');
            slotEl.className = 'incubator-slot';
            slotEl.setAttribute('data-slot', i);

            slotEl.innerHTML = `
                <div class="incubator-slot-inner" style="display:none;">
                    <span class="incubator-lock-label">Débloquer (Boutique)</span>
                </div>
                <div class="incubator-content" style="display:none;">
                    <div class="incubator-capsule">
                        <div class="incubator-body">
                            <div class="incubator-progress-wrap" style="--progress: 0;">
                                <div class="incubator-ring"></div>
                                <div class="incubator-egg-center">
                                    <img src="" class="egg-sprite incubator-egg-breath" alt="Oeuf" style="display:none;">
                                </div>
                            </div>
                        </div>
                        <div class="incubator-footer">
                            <span class="incubator-timer">--:--</span>
                        </div>
                    </div>
                </div>
                <div class="incubator-auto-controls" style="display:none;">
                    <button type="button" class="incubator-auto-toggle" data-slot="${i}">OFF</button>
                    <button type="button" class="incubator-priority-chip" data-slot="${i}">Commun</button>
                    <div class="incubator-locked-by-quest">Quête Génétique étape ${i + 1} requise</div>
                </div>
            `;
            container.appendChild(slotEl);
        }
    }

    updateIncubatorsDisplay() {
        const container = document.getElementById('incubatorsContainer');
        if (!container) return;

        if (container.getAttribute('data-initialized') !== 'true') {
            this.initIncubatorsDOM(container);
        }

        const maxSlots = this.getMaxIncubatorSlots();

        // Data-Binding: mise à jour des éléments sans reflow
        for (let i = 0; i < 4; i++) {
            const slotEl = container.children[i];
            const slot = this.incubators[i];
            const isAutoUnlocked = this.isAutoIncubationUnlockedForSlot(i);
            const autoSettings = this.getAutoIncubationSettings(i);

            const innerLock = slotEl.querySelector('.incubator-slot-inner');
            const contentWrap = slotEl.querySelector('.incubator-content');
            const autoControlsWrap = slotEl.querySelector('.incubator-auto-controls');

            if (i >= maxSlots) {
                // Incubateur verrouillé
                if (slotEl.className !== 'incubator-slot incubator-locked') slotEl.className = 'incubator-slot incubator-locked';
                if (innerLock.style.display !== 'block') innerLock.style.display = 'block';
                if (contentWrap.style.display !== 'none') contentWrap.style.display = 'none';
                if (autoControlsWrap.style.display !== 'none') autoControlsWrap.style.display = 'none';
                slotEl.removeAttribute('data-has-egg');
            } else {
                // Incubateur Débloqué
                if (innerLock.style.display !== 'none') innerLock.style.display = 'none';
                if (contentWrap.style.display !== 'block') contentWrap.style.display = 'block';

                const hasEgg = !!slot;
                slotEl.setAttribute('data-has-egg', hasEgg ? 'true' : 'false');

                const remaining = hasEgg ? this.getIncubatorRemainingMs(i) : 0;
                const ready = hasEgg && remaining === 0;
                const durationMs = hasEgg ? (slot.durationMs || 1) : 1;
                const progress = hasEgg ? Math.min(1, 1 - remaining / durationMs) : 0;
                const rarity = hasEgg ? slot.rarity : 'common';

                let filterClass = '';
                if (rarity === 'rare') filterClass = 'egg-filter-rare';
                else if (rarity === 'epic') filterClass = 'egg-filter-epic';
                else if (rarity === 'legendary') filterClass = 'egg-filter-legendary';

                const expectedClass = 'incubator-slot rarity-' + rarity + (ready ? ' incubator-ready' : '');
                if (slotEl.className !== expectedClass) slotEl.className = expectedClass;

                // Tooltip
                let tooltipText = "Incubateur Classique";
                if (i === 1) tooltipText = "Incubateur Avancé : -10% temps sur œufs Communs et Rares";
                if (i === 2) tooltipText = "Incubateur Expert : -20% temps sur œufs Communs, Rares et Épiques";
                if (i === 3) tooltipText = "Incubateur Maître : -30% temps sur toutes les raretés";
                if (slotEl.title !== tooltipText) slotEl.title = tooltipText;

                // Capsule & Progress
                const capsule = slotEl.querySelector('.incubator-capsule');
                const expectedCapsuleClass = `incubator-capsule rarity-${rarity}`;
                if (capsule.className !== expectedCapsuleClass) capsule.className = expectedCapsuleClass;

                const progressWrap = slotEl.querySelector('.incubator-progress-wrap');
                progressWrap.style.setProperty('--progress', progress);

                // Image Oeuf
                const eggImg = slotEl.querySelector('.egg-sprite');
                if (hasEgg) {
                    const eggSpriteUrl = `img/${rarity}-egg.png`;
                    if (eggImg.getAttribute('src') !== eggSpriteUrl) eggImg.src = eggSpriteUrl;
                    const expectedImgClass = `egg-sprite incubator-egg-breath ${filterClass}`;
                    if (eggImg.className !== expectedImgClass) eggImg.className = expectedImgClass;
                    if (eggImg.style.display !== 'block') eggImg.style.display = 'block';
                } else {
                    if (eggImg.style.display !== 'none') eggImg.style.display = 'none';
                }

                // Timer texte
                const timerEl = slotEl.querySelector('.incubator-timer');
                const timeStr = hasEgg ? (ready ? 'Prêt !' : this.formatMsAsTime(remaining)) : '--:--';
                if (timerEl.textContent !== timeStr) timerEl.textContent = timeStr;

                // Contrôles Auto
                if (autoControlsWrap.style.display !== 'flex') {
                    autoControlsWrap.style.display = 'flex';
                }
                const expectedAutoClass = `incubator-auto-controls ${isAutoUnlocked ? '' : 'incubator-auto-controls-locked'}`;
                if (autoControlsWrap.className !== expectedAutoClass) autoControlsWrap.className = expectedAutoClass;

                const autoBtn = autoControlsWrap.querySelector('.incubator-auto-toggle');
                autoBtn.disabled = !isAutoUnlocked;
                const expectedAutoBtnClass = `incubator-auto-toggle ${autoSettings.enabled ? 'incubator-auto-on' : 'incubator-auto-off'}`;
                if (autoBtn.className !== expectedAutoBtnClass) autoBtn.className = expectedAutoBtnClass;
                const expectedAutoBtnText = autoSettings.enabled ? 'ON' : 'OFF';
                if (autoBtn.textContent !== expectedAutoBtnText) autoBtn.textContent = expectedAutoBtnText;

                const prioBtn = autoControlsWrap.querySelector('.incubator-priority-chip');
                prioBtn.disabled = !isAutoUnlocked;
                const priorityLabel = this.getSlotPriorityLabel(i);
                const priorityClass = `priority-${(priorityLabel || '').toLowerCase()}`;
                const expectedPrioClass = `incubator-priority-chip ${priorityClass}`;
                if (prioBtn.className !== expectedPrioClass) prioBtn.className = expectedPrioClass;
                if (prioBtn.textContent !== priorityLabel) prioBtn.textContent = priorityLabel;

                const questLock = autoControlsWrap.querySelector('.incubator-locked-by-quest');
                if (isAutoUnlocked) {
                    if (questLock.style.display !== 'none') questLock.style.display = 'none';
                } else {
                    if (questLock.style.display !== 'block') questLock.style.display = 'block';
                }
            }
        }
    }

    initEggsDOM(container) {
        container.innerHTML = '';
        container.setAttribute('data-initialized', 'true');

        const rarities = ['common', 'rare', 'epic', 'legendary'];
        rarities.forEach(rarity => {
            const eggElement = document.createElement('div');
            eggElement.className = `ball-item rarity-${rarity} egg-item-${rarity}`;
            eggElement.setAttribute('data-egg-rarity', rarity);
            eggElement.style.display = 'none';

            let filterClass = "";
            if (rarity === 'rare') filterClass = "egg-filter-rare";
            else if (rarity === 'epic') filterClass = "egg-filter-epic";
            else if (rarity === 'legendary') filterClass = "egg-filter-legendary";

            const eggSpriteUrl = `img/${rarity}-egg.png`;

            eggElement.innerHTML = `
                <div class="rarity-label ${rarity}" style="pointer-events: none; margin-bottom:2px; font-size:9px; padding:1px 4px;">
                    ${rarity.toUpperCase()}
                </div>
                <img src="${eggSpriteUrl}" class="egg-sprite ${filterClass}" alt="Oeuf ${rarity}">
                <div class="egg-count-label" style="font-size: 13px; font-weight: bold; color:#333; pointer-events: none; line-height:1;">
                    x0
                </div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Placer dans un incubateur</div>
            `;
            container.appendChild(eggElement);
        });

        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-eggs-message';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#94a3b8';
        emptyMessage.style.padding = '15px';
        emptyMessage.style.gridColumn = '1 / -1';
        emptyMessage.style.border = '2px dashed #e2e8f0';
        emptyMessage.style.borderRadius = '10px';
        emptyMessage.style.display = 'none';
        emptyMessage.innerHTML = `
            <img src="img/common-egg.png" style="width:24px; opacity:0.4; filter:grayscale(1);">
            <div style="font-weight:bold; margin-top:5px; font-size:14px; opacity:0.8;">Aucun œuf en stock</div>
            <div style="font-size:12px; margin-top:2px;">Gagnez des combats pour en trouver !</div>
        `;
        container.appendChild(emptyMessage);
    }

    updateEggsDisplay() {
        const eggsContainer = document.getElementById('ballsContainer');
        const eggCount = document.getElementById('ballCount');

        if (!eggsContainer || !eggCount) return;

        if (eggsContainer.getAttribute('data-initialized') !== 'true') {
            this.initEggsDOM(eggsContainer);
        }

        const totalEggs = Object.values(this.eggs).reduce((sum, count) => sum + count, 0);
        if (eggCount.textContent != totalEggs) eggCount.textContent = totalEggs;

        const rarities = ['common', 'rare', 'epic', 'legendary'];
        rarities.forEach(rarity => {
            const count = this.eggs[rarity] || 0;
            const eggElement = eggsContainer.querySelector(`.egg-item-${rarity}`);
            if (eggElement) {
                if (count > 0) {
                    if (eggElement.style.display !== 'block') eggElement.style.display = 'block';
                    const label = eggElement.querySelector('.egg-count-label');
                    const countTxt = `x${count}`;
                    if (label.textContent.trim() !== countTxt) label.textContent = countTxt;
                } else {
                    if (eggElement.style.display !== 'none') eggElement.style.display = 'none';
                }
            }
        });

        const emptyMessage = eggsContainer.querySelector('.empty-eggs-message');
        if (emptyMessage) {
            if (totalEggs === 0) {
                if (emptyMessage.style.display !== 'block') emptyMessage.style.display = 'block';
            } else {
                if (emptyMessage.style.display !== 'none') emptyMessage.style.display = 'none';
            }
        }
    }
}

window.Game = Game;
// Initialisation des écouteurs globaux

// Écouteurs pour les tooltips des stats (Délégation d'événements)
document.addEventListener('mouseover', (e) => {
    const statChip = e.target.closest('.header-stat-chip');
    if (statChip && typeof game !== 'undefined' && game !== null && typeof game.showBoostTooltip === 'function') {
        const statType = statChip.getAttribute('data-stat');
        game.showBoostTooltip(e, statType);
    }
});

document.addEventListener('mouseout', (e) => {
    const statChip = e.target.closest('.header-stat-chip');
    if (statChip && typeof game !== 'undefined' && game !== null && typeof game.hideTooltip === 'function') {
        game.hideTooltip();
    }
});

window.addEventListener('click', (e) => {
    // 1. Fermeture générique des Modales (Croix ou bouton fermer)
    const closeBtn = e.target.closest('.js-close-modal');
    if (closeBtn) {
        const modalToClose = closeBtn.closest('.js-modal-overlay') || closeBtn.closest('.modal') || closeBtn.closest('.compact-popup');
        if (modalToClose) {
            modalToClose.classList.remove('show');
            if (modalToClose.style.display === 'block') modalToClose.style.display = 'none';
        }
        // Cas spécial ciblé par data-target
        const targetId = closeBtn.getAttribute('data-target');
        if (targetId) {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.classList.remove('show');
                if (targetEl.style.display === 'block') targetEl.style.display = 'none';
            }
        }
        return;
    }

    // 2. Fermeture générique au clic sur l'Overlay sombre (Extérieur de la modale)
    if (e.target.classList.contains('js-modal-overlay')) {
        e.target.classList.remove('show');
        if (e.target.style.display === 'block') e.target.style.display = 'none';
        return;
    }

    // 3. Fermeture des popups compacts au clic extérieur
    if (!e.target.closest('.compact-popup') &&
        !e.target.closest('#autoSelectBtn') &&
        !e.target.closest('#captureModeBtn')) {

        const autoModal = document.getElementById('autoSettingsModal');
        if (autoModal && autoModal.classList.contains('show')) {
            if (typeof game !== 'undefined') game.closeAutoSettings();
        }

        const captureModal = document.querySelector('#captureTargetWrapper.show');
        if (captureModal) {
            captureModal.classList.remove('show');
        }
    }
});

// Observer pour positionner le modal Capture quand il s'ouvre
document.addEventListener('DOMContentLoaded', () => {
    const captureModal = document.getElementById('captureTargetWrapper');
    if (captureModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' &&
                    captureModal.classList.contains('show')) {
                    // Utiliser game si disponible, sinon attendre
                    if (window.game) {
                        window.game.positionCompactModal('captureTargetWrapper', 'captureModeBtn');
                    }
                }
            });
        });
        observer.observe(captureModal, { attributes: true });
    }
});

// Écouteur pour le bouton capture (mise à jour du badge après changement de mode)
const captureBtn = document.getElementById('captureModeBtn');
if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        setTimeout(() => {
            if (typeof game !== 'undefined') {
                game.updateCaptureBadge();
            }
        }, 50);
    });
}

// Initialiser les badges au chargement
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof game !== 'undefined') {
            game.updateAutoBadge();
            game.updateCaptureBadge();
        }
    }, 1000);
});
