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
            catchNew: false,   // Capturer les non-découverts ?
            catchShiny: true,  // Capturer les Shinies ? (OUI par défaut !)
            catchDupe: false   // Capturer les doublons (Farm de Shards) ?
        };
        this.pokedexSortBy = 'id';   // Critère par défaut
        this.pokedexSortOrder = 'asc'; // Ordre par défaut
        this.pokedexSubTab = 'pokedex'; // 'pokedex' | 'synergies'
        this.collectionSynergyTab = 'all'; // 'all' ou id de famille
        this.captureMode = 0; // 0 = OFF, 1 = ALL, 2 = TARGET
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
        this.combatTickets = 0;
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


        };




        this.currentEnemy = null;
        this.currentPlayerCreature = null;
        this.activeCreatureIndex = 0;
        this.sortBy = 'none';
        this.sortOrder = 'desc';
        this.autoSelectEnabled = false;
        this.badges = {};
        Object.keys(ACCOUNT_TALENTS).forEach(talentKey => {
            this.badges[talentKey] = false;
        });

        this.arenaState = {
            active: false, arenaId: null, championTeam: [], currentChampionIndex: 0, startTime: 0, maxDuration: 90000, playerKOCount: 0
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
            prestigeCount: 0,          // (Anciennement prestigesDone)
            upgradesPurchased: 0,      // Pour "Investisseur Avisé"
            badgesEarned: 0,           // Pour "Collectionneur de Badges"

            // --- ÉTATS DYNAMIQUES (Mises à jour en temps réel) ---
            pensionCount: 0,           // Pour "Élevage Intensif" (Valeur actuelle)
            teamPower: 0,              // Pour "Équipe d'Élite" (Valeur actuelle)

            // --- SYSTÈME ---
            startTime: Date.now(),
            totalPlayTime: 0
        };

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

                    if (timeHidden > 1000) { // Si absence > 1 seconde

                        // 1. Rattrapage des Combats (Existant)
                        if (timeHidden > 5000) {
                            this.catchupMissedCombats(timeHidden);
                        } else {
                            // Si l'absence est courte (<5s), on rattrape quand même les stats passives
                            this.catchUpPassiveStats(timeHidden);
                        }

                        // 2. ✅ RATTRAPAGE GÉNÉRATION EXPÉDITIONS (NOUVEAU)
                        // On simule l'écoulement du temps pour le timer d'expédition
                        if (this.availableExpeditions.length < this.maxAvailableExpeditions) {
                            let remainingTime = timeHidden;

                            // Boucle tant qu'on a du temps à dépenser et des slots libres
                            while (remainingTime > 0 && this.availableExpeditions.length < this.maxAvailableExpeditions) {
                                if (remainingTime >= this.expeditionTimer) {
                                    // Assez de temps pour finir le timer actuel -> Une mission apparaît !
                                    remainingTime -= this.expeditionTimer;
                                    this.generateRandomExpedition();

                                    // On reset le timer pour la suivante
                                    this.expeditionTimer = this.EXPEDITION_GEN_TIME;
                                } else {
                                    // Pas assez pour finir, on avance juste le timer
                                    this.expeditionTimer -= remainingTime;
                                    remainingTime = 0;
                                }
                            }
                        }

                        // Mise à jour immédiate de l'affichage des expéditions
                        this.updateExpeditionsDisplay();
                    }

                    this.tabHiddenTime = null;
                }
            }
        });

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
                if (!POKEMON_BASE_STATS[evoData.evolves_to]) {
                    console.error(`⛔ Évolution brisée : ${base} -> ${evoData.evolves_to} (Cible inexistante)`);
                    errors++;
                }
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

        // 1. Consommer
        this.items[itemKey] -= amountToUse;

        // Nettoyer si vide
        if (this.items[itemKey] <= 0) {
            delete this.items[itemKey];
        }

        // 2. Appliquer l'effet
        if (item.effect.duration === null) {
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
            logMessage(`✅ ${quantity}x ${item.name} utilisés ! +${(totalBonus * 100).toFixed(0)}% ${effect.stat.toUpperCase()} (Perm.)`);
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
        // Collection Synergies (Water Starters → max_hp_mult 1% par prestige)
        const collHpMult = (this.getCollectionSynergyBonuses ? this.getCollectionSynergyBonuses() : {}).max_hp_mult || 0;
        total = Math.floor(total * (1 + collHpMult));

        return total;
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

    // OPTIMISATION : Architecture "Game Loop" découplée (Logic vs Render)
    startGameLoop() {
        console.log("🚀 Moteur de jeu optimisé démarré (60 FPS)");

        // Initialisation des Timers
        this.lastFrameTime = performance.now();
        this.lowFreqTimer = 0; // Accumulateur pour les actions lentes (1s)

        // La fonction de boucle qui s'appelle elle-même
        const loop = (currentTime) => {
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
            this.updatePlayerStatsDisplay(); // Argent, stats globales...
            this.updateUpgradesDisplay();    // Boutons d'achat
            this.checkCompletedNotifications();
            this.checkActiveExpeditions();
            this.updateQuestTimerDisplay();  // Timer de quête (pas besoin de ms)
            if (typeof narrativeManager !== 'undefined' && narrativeManager.checkMilestones) {
                narrativeManager.checkMilestones(this);
            }

            // Gestion du Modal de Tiers (seulement si ouvert)
            const tierModal = document.getElementById('zoneTierModal');
            if (tierModal && tierModal.classList.contains('show')) {
                if (window.showZoneTierModal) window.showZoneTierModal();
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
        // 1. Régénération
        this.incrementPlayerStats();
        this.regenerateStamina();

        // 2. Nettoyage des boosts
        this.updateStatBoosts();

        this.updateQuestTimer(1000);

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
                const healPercent = (cfg && cfg.effect && cfg.effect.heal_percent) ? cfg.effect.heal_percent : 0.02;
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

        // 2. Vérifier si un mode spécial est actif
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

        // 🛑 SÉCURITÉ ANTI-CRASH : On limite à 2000 combats max (environ 1-2h de simu intense)
        const MAX_SAFE_SIMULATION = 2000;
        if (maxPossibleCombats > MAX_SAFE_SIMULATION) {
            console.warn(`⚠️ Trop de combats (${maxPossibleCombats}). Plafonné à ${MAX_SAFE_SIMULATION}.`);
            maxPossibleCombats = MAX_SAFE_SIMULATION;
        }

        if (maxPossibleCombats <= 0) return;

        console.log(`🔄 Simulation: ${maxPossibleCombats} combats (Moyenne: ${(averageCombatDuration / 1000).toFixed(2)}s)`);

        // D. Préparation Simulation
        const originalLogFunction = window.logMessage;
        window.logMessage = function () { }; // On coupe les logs

        // Objet unique pour tout suivre
        let stats = {
            simulated: 0,
            won: 0,
            lost: 0,
            xp: 0,
            money: 0,
            items: {},
            capturedPokemonList: [],
            time: missedTime
        };

        // E. BOUCLE DE SIMULATION
        for (let i = 0; i < maxPossibleCombats; i++) {
            // 1. Vérif équipe en vie
            this.faintedThisCombat = new Set();
            this.currentPlayerCreature = this.getFirstAliveCreature();
            if (!this.currentPlayerCreature) break; // Game Over, on arrête

            this.activeCreatureIndex = this.playerTeam.indexOf(this.currentPlayerCreature);

            // 2. SIMULATION DU COMBAT (Une seule fois !)
            // simulateCombat doit retourner un objet {xp, money...} si victoire, ou null si défaite
            const result = this.simulateCombat();

            stats.simulated++;

            if (result) {
                // Victoire
                stats.won++;
                stats.xp += result.xp || 0;
                stats.money += result.money || 0;
                if (result.items) {
                    for (const [itemName, count] of Object.entries(result.items)) {
                        // On additionne dans le total global
                        stats.items[itemName] = (stats.items[itemName] || 0) + count;
                    }
                }
                if (result.captured) {
                    stats.captured++;
                    // On ajoute le Pokémon à la liste (limite à 50 pour pas exploser le modal si besoin)
                    if (stats.capturedPokemonList.length < 50) {
                        stats.capturedPokemonList.push(result.captured);
                    }
                }
            } else {
                // Défaite
                stats.lost++;
            }

            // 3. Regen Stamina (Post-Combat)
            const regenTicks = Math.floor(this.combatCooldown / 1000);
            for (let j = 0; j < regenTicks; j++) {
                this.regenerateStamina();
            }

            // Reset état
            this.combatState = 'waiting';
        }

        // F. Nettoyage et Affichage
        window.logMessage = originalLogFunction; // On remet les logs

        // Soins complets gratuits après l'absence (Qualité de vie)
        for (const creature of this.playerTeam) {
            creature.heal();
            creature.currentStamina = creature.maxStamina;
            creature.clearStatusEffect();
        }

        this.combatState = 'waiting';
        this.lastCombatTime = Date.now();

        // Log console pour débug
        console.log(`✅ Fin Simu: ${stats.simulated} combats, ${stats.won} wins, Gain: ${stats.money}$`);

        // Log Joueur
        const xpFormatted = typeof formatNumber === 'function' ? formatNumber(stats.xp) : stats.xp;
        logMessage(`⚡ Rattrapage terminé : ${stats.simulated} combats simulés.`);

        this.updateItemsDisplay();
        this.updateDisplay();

        // G. Lancer le Modal (Seulement si on a simulé quelque chose)
        if (stats.simulated > 0) {
            this.showOfflineReport(stats);
        }
    }



    showOfflineReport(stats) {
        const modal = document.getElementById('offlineModal');
        if (!modal) return;

        // 1. Calculs de temps précis
        const totalSeconds = Math.floor(stats.time / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);

        // 2. Formatage dynamique (Ex: "1h 30m" ou "45s")
        let timeStr = "";
        if (h > 0) {
            timeStr = `${h}h ${m}m ${s}s`;
        } else if (m > 0) {
            timeStr = `${m}m ${s}s`;
        } else {
            timeStr = `${s}s`; // Juste les secondes si très court
        }
        // 2. HTML Structure
        // On recrée tout le contenu du modal dynamiquement pour être propre
        modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Offline report</h2>
                <div style="cursor:pointer;" onclick="closeOfflineModal()">✕</div>
            </div>
            
            <div class="modal-body">
                <div class="offline-summary">
                    <div class="offline-time" id="offlineTimeDisplay">${timeStr}</div>
                    <div class="offline-subtitle">Temps écoulé</div>
                </div>

                <div class="stats-row">
                    <div class="mini-stat">
                        <span class="val" style="color:#ef4444">${formatNumber(stats.simulated)}</span>
                        <span class="lbl">Combats</span>
                    </div>
                    <div class="mini-stat">
                        <span class="val" style="color:#f59e0b">+${formatNumber(stats.money)}</span>
                        <span class="lbl">Argent</span>
                    </div>
                    <div class="mini-stat">
                        <span class="val" style="color:#8b5cf6">+${formatNumber(stats.xp)}</span>
                        <span class="lbl">XP</span>
                    </div>
                </div>

                <div class="section-title">📦 Butin (${formatNumber(Object.values(stats.items).reduce((a, b) => a + b, 0))})</div>
                <div class="loot-scroll-area" id="lootArea">
                    </div>

                <div class="section-title" id="captureTitle">🕸️ Captures (${formatNumber(stats.captured)})</div>
                <div class="pokemon-grid" id="captureGrid">
                    </div>
            </div>

            <div class="modal-footer">
                <button class="claim-btn" onclick="closeOfflineModal()">Tout Récupérer</button>
            </div>
        </div>
    `;

        // 3. Remplissage des ITEMS (Loot)
        const lootArea = document.getElementById('lootArea');
        const items = Object.entries(stats.items);

        if (items.length === 0) {
            lootArea.innerHTML = '<div style="text-align:center; padding:10px; color:#cbd5e1; font-style:italic;">Aucun objet trouvé</div>';
        } else {
            items.forEach(([key, count]) => {
                const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const iconPath = getItemIconPath(key);
                const rarityClass = getRarityClass(key);

                lootArea.innerHTML += `
                <div class="loot-item ${rarityClass}">
                    <img src="${iconPath}" class="item-icon" onerror="this.src='assets/items/unknown.png'">
                    <div class="item-info">
                        <span class="item-name">${displayName}</span>
                    </div>
                    <span class="item-qty "> x${formatNumber(count)}</span>
                </div>
            `;
            });
        }

        // 4. Remplissage des CAPTURES (Pokémon)
        const captureGrid = document.getElementById('captureGrid');
        // On suppose que stats.capturedPokemonList est un tableau [{name: 'Pikachu', shiny: false}, ...]
        // Si tu n'as pas encore cette liste, voir étape 4 ci-dessous.

        if (!stats.capturedPokemonList || stats.capturedPokemonList.length === 0) {
            captureGrid.style.display = 'none';
            document.getElementById('captureTitle').style.display = 'none';
        } else {
            stats.capturedPokemonList.forEach(poke => {
                const sprite = getPokemonSpritePath(poke.name, poke.shiny);
                const shinyEffect = poke.shiny ? '<span class="shiny-sparkle">✨</span>' : '';
                const bgStyle = poke.shiny ? 'background: #fffbeb; border-color: #f59e0b;' : '';

                captureGrid.innerHTML += `
                <div class="poke-capture" style="${bgStyle}">
                    ${shinyEffect}
                    <img src="${sprite}" onerror="this.src='assets/sprites/unknown.png'" title="${poke.name}">
                </div>
            `;
            });
        }

        modal.style.display = 'flex';
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
        const reduction = level * 50;

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
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

        const content = document.createElement('div');
        content.style.cssText = `
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        padding: 30px;
        border-radius: 15px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid #a855f7;
        box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
    `;

        let html = `
        <h2 style="color: #a855f7; margin-bottom: 20px; text-align: center;">
            🌟 Choisir un Talent pour ${creature.name}
        </h2>
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
        logMessage(`📜 ${newTalentInfo.description}`);

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
        if (this.getCollectionSynergyDetails && this.getCollectionSynergyDetails().some(d => d.isActive)) {
            this.checkSpecialQuests('synergyActive');
            this.checkSpecialQuests('collectionSynergyActive');
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
                    logMessage(`✅ ${eggsOpened} œufs ${rarity} ouverts !`);
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
            this.updateEggsDisplay();
            this.updateTeamDisplay();
            this.updatePlayerStatsDisplay();
            this.updatePokedexDisplay();
            this.updateStorageDisplay();

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
                indicator.innerHTML = `<span class="auto-save-dot"></span> Sauvegardé à ${time}`;

                // Petit effet visuel (flash vert sur le texte)
                indicator.style.color = "#16a34a";
                setTimeout(() => {
                    indicator.style.color = "#94a3b8"; // Revient au gris
                }, 1000);
            }
        }, 15000); // Toutes les 15 secondes
    }


    incrementPlayerStats() {
        this.calculateTeamStats();
        const pensionStats = this.calculatePensionStats();

        const hpBonus = 1 + this.getAccountTalentBonus('hp_mult');

        const baseContribution = 0.10;
        const towerBonus = this.permanentBoosts.team_contribution || 0;
        const teamContributionRate = baseContribution + towerBonus;

        // ✅ AJOUTER LES BONUS DES VITAMINES ICI
        const vitaminBonus = {
            hp: 1 + (this.activeVitamins.hp || 0) + (this.activeVitamins.all || 0),
            attack: 1 + (this.activeVitamins.attack || 0) + (this.activeVitamins.all || 0),
            spattack: 1 + (this.activeVitamins.spattack || 0) + (this.activeVitamins.all || 0),
            defense: 1 + (this.activeVitamins.defense || 0) + (this.activeVitamins.all || 0),
            spdefense: 1 + (this.activeVitamins.spdefense || 0) + (this.activeVitamins.all || 0),
            speed: 1 + (this.activeVitamins.speed || 0) + (this.activeVitamins.all || 0)
        };

        // A. Équipe avec vitamines
        this.playerMainStats.hp += Math.floor(this.playerTeamStats.hp * teamContributionRate * hpBonus * vitaminBonus.hp);
        this.playerMainStats.attack += Math.floor(this.playerTeamStats.attack * teamContributionRate * vitaminBonus.attack);
        this.playerMainStats.spattack += Math.floor(this.playerTeamStats.spattack * teamContributionRate * vitaminBonus.spattack);
        this.playerMainStats.defense += Math.floor(this.playerTeamStats.defense * teamContributionRate * vitaminBonus.defense);
        this.playerMainStats.spdefense += Math.floor(this.playerTeamStats.spdefense * teamContributionRate * vitaminBonus.spdefense);
        this.playerMainStats.speed += Math.floor(this.playerTeamStats.speed * teamContributionRate * vitaminBonus.speed);

        // B. Pension avec vitamines
        this.playerMainStats.hp += Math.floor(pensionStats.hp * hpBonus * vitaminBonus.hp);
        this.playerMainStats.attack += Math.floor(pensionStats.attack * vitaminBonus.attack);
        this.playerMainStats.spattack += Math.floor(pensionStats.spattack * vitaminBonus.spattack);
        this.playerMainStats.defense += Math.floor(pensionStats.defense * vitaminBonus.defense);
        this.playerMainStats.spdefense += Math.floor(pensionStats.spdefense * vitaminBonus.spdefense);
        this.playerMainStats.speed += Math.floor(pensionStats.speed * vitaminBonus.speed);

        this.updatePlayerStatsDisplay();
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
                logMessage(`⏱️ Boost ${boost.stat.toUpperCase()} expiré !`);
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
                const playerMoveName = POKEMON_DEFAULT_MOVES[this.currentPlayerCreature.name] || 'Charge';
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
                const enemyMoveName = POKEMON_DEFAULT_MOVES[enemy.name] || 'Charge';
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

        // 3. Talents de compte (badges d'arène) + Collection Synergies
        let damageMultiplier = 1.0;
        if (isPlayer) {
            const collDmg = (this.getCollectionSynergyBonuses ? this.getCollectionSynergyBonuses() : {}).damage_mult || 0;
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

        // 4. Talents de compte + Collection Synergies
        let accountDamageMultiplier = 1.0;
        if (isPlayer) {
            const collDmg = (this.getCollectionSynergyBonuses ? this.getCollectionSynergyBonuses() : {}).damage_mult || 0;
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

        // --- 3. ARGENT (Boss x5, Épique x2, aligné sur finalizeCombat) ---
        let baseEarnings = currentZone * 2;
        let pokedollars = Math.floor(baseEarnings + (Math.random() * baseEarnings * 2));
        if (isBoss) pokedollars *= 5;
        else if (isEpic) pokedollars *= 2;
        const collecteurBonus = this.getTalentStackBonus('collecteur');
        if (collecteurBonus > 0) pokedollars = Math.floor(pokedollars * (1 + collecteurBonus));
        const collGold = (this.getCollectionSynergyBonuses ? this.getCollectionSynergyBonuses() : {}).gold_mult || 0;
        const fortuneBonus = 1 + this.getAccountTalentBonus('pokedollars_mult') + collGold;
        pokedollars = Math.floor(pokedollars * fortuneBonus);
        this.pokedollars += pokedollars;
        this.checkAchievements('totalPokedollarsEarned');

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

        // B. Gestion Oeufs
        const baseEggChance = currentZone * 0.001 + 0.01;
        if (Math.random() < (baseEggChance + this.getEggDropBonus())) {
            const eggRarity = this.determineEggRarity();
            this.addEgg(eggRarity);

            // On enregistre l'œuf comme un item pour le rapport
            const eggName = `egg_${eggRarity}`;
            dropsInThisCombat[eggName] = (dropsInThisCombat[eggName] || 0) + 1;
        }

        // --- 6. AUTO-CATCH ---
        let capturedData = null;


        if (this.hasAutoCatcher) {
            const s = this.autoCatcherSettings;
            let shouldCatch = false;

            if (s.catchShiny && enemy.isShiny) shouldCatch = true;

            if (!shouldCatch && s.catchNew) {
                const alreadyCaught = Object.values(this.pokedex).some(e => e.name === enemy.name && e.count > 0);
                if (!alreadyCaught) shouldCatch = true;
            }

            if (!shouldCatch && s.catchDupe && !enemy.isBoss) shouldCatch = true;

            if (shouldCatch) {
                const ballType = 'pokeball';
                if ((this.items[ballType] || 0) > 0) {
                    const recycleLevel = (this.upgrades && this.upgrades.recycle) ? this.upgrades.recycle.level : 0;
                    const recycleChance = recycleLevel * 0.025; // 2.5% par niveau
                    if (Math.random() >= recycleChance) this.items[ballType]--;

                    const baseChance = (typeof CATCH_RATES !== 'undefined' ? CATCH_RATES[enemy.rarity] : 0.1) || 0.1;
                    const ballMult = (typeof BALLS !== 'undefined' ? BALLS[ballType].catchMult : 1);

                    if (Math.random() < (baseChance * ballMult)) {
                        this.stats.creaturesObtained++;

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
            logMessage(`💚 ${creature.name} récupère ${formatNumber(actualHeal)} PV !`);

            // Texte flottant (Si disponible)
            const containerId = creature.isEnemy ? 'enemySpriteContainer' : 'playerSpriteContainer';
            const container = document.getElementById(containerId);
            if (container && window.showFloatingText) {
                window.showFloatingText(`+${formatNumber(actualHeal)}`, container, 'ft-heal');
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

        logMessage(`⚡ ${creature.name} utilise son ultime : ${ult.name} !`);
        creature.ultimateCharge = 0; // Consomme la charge

        if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('ultimateUsed');

        // Gérer les effets immédiats (ex: Soin)
        if (ult.effect.type === 'HEAL') {
            const maxHp = this.getPlayerMaxHp();
            const healAmount = Math.floor(maxHp * ult.effect.value);
            creature.mainAccountCurrentHp = Math.min(maxHp, creature.mainAccountCurrentHp + healAmount);
            logMessage(`💚 ${creature.name} se soigne de ${healAmount} PV !`);

        } else if (ult.effect.type === 'MULTI_BUFF') {
            ult.effect.status.forEach(statusEffect => {
                // Gérer le poison x3 de Gengar
                let sourceAtk = this.playerMainStats.attack;
                if (ult.effect.statusMult && ult.effect.statusMult > 1) {
                    sourceAtk *= ult.effect.statusMult;
                }
                creature.applyStatusEffect(statusEffect, sourceAtk);
                logMessage(`💥 ${creature.name} applique ${creature.getStatusEffectName()} !`);
            });

        } else if (ult.effect.type === 'APPLY_STATUS') {
            creature.applyStatusEffect(ult.effect.status, this.playerMainStats.attack);
            logMessage(`💥 ${creature.name} applique ${creature.getStatusEffectName()} !`);

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
        // 1. Si un timer existe déjà (on a bougé vite d'un item à l'autre), on l'annule
        this.hideTooltip();

        // 2. On capture la position de la souris MAINTENANT
        const x = event.clientX;
        const y = event.clientY;

        // 3. On lance le timer
        this.tooltipTimer = setTimeout(() => {
            const tooltip = document.getElementById('customTooltip');
            if (!tooltip) return;

            // Remplir le contenu
            tooltip.innerHTML = `<span class="tooltip-title">${title}</span>${description}`;

            // Positionner (légèrement décalé de la souris pour ne pas gêner)
            // On gère aussi le débordement à droite de l'écran
            let left = x + 15;
            let top = y + 15;

            // Afficher
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.style.display = 'block';

        }, this.TOOLTIP_DELAY);
    }



    /**
     * Cache l'infobulle et annule le timer en cours.
     */
    hideTooltip() {
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
            this.tooltipTimer = null;
        }
        const tooltip = document.getElementById('customTooltip');
        if (tooltip) tooltip.style.display = 'none';
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
            <div class="quest-completion-title" style="color: #3b82f6; margin-bottom:15px;">
                Capture
            </div>
            
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

            <button class="btn" style="background: #f1f5f9; color: #64748b; width: 100%; margin-top:20px; font-weight:bold;" onclick="game.skipCapture()">
                Fuir (Ne pas capturer)
            </button>
        `;

        modal.classList.add('show');
    }
    // OPTIMISATION : Cycle des modes avec Forçage de la Liste
    cycleCaptureMode() {
        // 0 (OFF) -> 1 (ALL) -> 2 (TARGET) -> 0
        this.captureMode = (this.captureMode + 1) % 3;

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
        if (!grid || !wrapper) return;

        const zoneId = (typeof currentZone !== 'undefined') ? currentZone : 1;
        const zonePokemon = this.getReachablePokemonInZone(zoneId);

        // Initialisation du tableau si vide
        if (!this.captureTargets) this.captureTargets = [];
        // Migration de sécurité
        if (this.captureTarget && !this.captureTargets.includes(this.captureTarget)) {
            this.captureTargets.push(this.captureTarget);
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
            wrapper.style.display = 'block';
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
        const icon = document.getElementById('captureIcon');
        const text = document.getElementById('captureText');

        if (!btn) return;

        // Reset
        btn.classList.remove('capture-off', 'capture-all', 'capture-target');

        if (wrapper && this.captureMode !== 2) {
            wrapper.classList.remove('show');
            wrapper.style.display = 'none';
        }

        // Application du Mode
        if (this.captureMode === 0) {
            btn.classList.add('capture-off');
            if (icon) icon.textContent = "🕸️";
            if (text) text.textContent = "Capt. OFF";
        }
        else if (this.captureMode === 1) {
            btn.classList.add('capture-all');
            if (icon) icon.textContent = "🔴";
            if (text) text.textContent = "Capt. TOUS";
        }
        else if (this.captureMode === 2) {
            btn.classList.add('capture-target');
            if (icon) icon.textContent = "🎯";

            // ✅ Gestion du texte Multiple
            const count = this.captureTargets ? this.captureTargets.length : 0;

            if (count === 0) {
                if (text) text.textContent = "Choisir...";
            } else if (count === 1) {
                const tName = this.captureTargets[0];
                if (text) text.textContent = tName.length > 9 ? tName.substring(0, 8) + "." : tName;
            } else {
                if (text) text.textContent = `${count} Cibles`;
            }

            // Forçage affichage
            if (wrapper) {
                wrapper.style.display = 'block';
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
            document.getElementById('ac-shiny').checked = this.autoCatcherSettings.catchShiny;
            document.getElementById('ac-new').checked = this.autoCatcherSettings.catchNew;
            document.getElementById('ac-dupe').checked = this.autoCatcherSettings.catchDupe;
        } else {
            panel.style.display = 'none';
        }
    }

    toggleAutoCatch(setting) {
        if (setting === 'shiny') this.autoCatcherSettings.catchShiny = !this.autoCatcherSettings.catchShiny;
        if (setting === 'new') this.autoCatcherSettings.catchNew = !this.autoCatcherSettings.catchNew;
        if (setting === 'dupe') this.autoCatcherSettings.catchDupe = !this.autoCatcherSettings.catchDupe;
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

                this.rollItemDrop();

                let bossEggRarity = RARITY.RARE;
                const roll = Math.random();
                if (roll < 0.10) bossEggRarity = RARITY.LEGENDARY;
                else if (roll < 0.55) bossEggRarity = RARITY.EPIC;
                this.addEgg(bossEggRarity);

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

            this.updateDisplay();
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

        const collGold = (this.getCollectionSynergyBonuses ? this.getCollectionSynergyBonuses() : {}).gold_mult || 0;
        const fortuneBonus = 1 + this.getAccountTalentBonus('pokedollars_mult') + collGold;
        pokedollarsEarned = Math.floor(pokedollarsEarned * fortuneBonus);

        this.pokedollars += pokedollarsEarned;
        this.stats.totalPokedollarsEarned += pokedollarsEarned;
        this.checkAchievements('totalPokedollarsEarned');
        if (pokedollarsEarned > 0) {
            this.showUiFloatingText('headerStatMoney', `+${pokedollarsEarned}$`, 'ft-money');
        }
        this.checkSpecialQuests('pokedollars_gained');

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

        // 2. CIBLAGE : On récupère la carte qui pose problème
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

        this.updateDisplay();
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

        // SI SIMULATION : On divise la chance par 2 (Équilibrage)
        // ⚠️ NOTE : Si tu veux exactement les mêmes rates qu'en online pour le rattrapage,
        // tu devrais peut-être retirer cette condition ou passer un autre paramètre.
        if (isSimulation) {
            dropChance = dropChance / 2;
        }

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

    // Dans la classe Game
    addItem(itemKey, quantity = 1, updateUI = true) { // Ajout du paramètre updateUI
        const item = ALL_ITEMS[itemKey];
        if (!item) return;

        this.items[itemKey] = (this.items[itemKey] || 0) + quantity;

        // On loggue toujours (le log est désactivé globalement pendant la simulation de toute façon)
        logMessage(`✨ ${item.icon} ${item.name} x${quantity} obtenu !`);

        // On ne met à jour l'affichage que si demandé
        if (updateUI) {
            this.updateItemsDisplay();
        }
    }

    // updateItemsDisplay -> logique déplacée vers uiManager.js (updateItemsDisplayUI)
    updateItemsDisplay() {
        if (typeof updateItemsDisplayUI === 'function') updateItemsDisplayUI(this);
    }
    updateStatBoostsDisplay() {
        const container = document.getElementById('activeStatBoosts');
        if (!container) {
            console.warn('❌ activeStatBoosts introuvable dans le HTML !');
            return;
        }

        if (!this.activeStatBoosts || this.activeStatBoosts.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = '<h3>⚡ Boosts Actifs</h3>';

        const boostsList = document.createElement('div');
        boostsList.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 10px;';

        const statNames = {
            hp: 'PV',
            attack: 'Attaque',
            defense: 'Défense',
            spattack: 'Att. Spé.',
            spdefense: 'Déf. Spé.',
            speed: 'Vitesse',
            all: 'TOUTES les stats'
        };
        const statEmojis = {
            hp: '❤️',
            attack: '⚔️',
            defense: '🛡️',
            spattack: '💥',
            spdefense: '💠',
            speed: '💨',
            all: '🧪'
        };

        this.activeStatBoosts.forEach(boost => {
            const timeLeft = boost.endTime - Date.now();
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            const emoji = boost.itemId === 'potion_max' ? '⭐' : (statEmojis[boost.stat] || '⚡');
            const label = statNames[boost.stat] || boost.stat;

            const boostItem = document.createElement('div');
            boostItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #e1f5fe 0%, #81d4fa 100%);
            border: 2px solid #0277bd;
            border-radius: 8px;
            padding: 10px 15px;
        `;

            boostItem.innerHTML = `
            <span style="font-weight: bold; color: #0277bd;">
                ${emoji} +${(boost.value * 100)}% ${label}
            </span>
            <span style="font-size: 12px; color: #666; background: rgba(255, 255, 255, 1); padding: 4px 8px; border-radius: 12px;">
                ${minutes}:${seconds.toString().padStart(2, '0')}
            </span>
        `;

            boostsList.appendChild(boostItem);
        });

        container.appendChild(boostsList);

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
     * Collection Synergies — Bonus passifs "Maillon Faible".
     * Retourne les bonus agrégés : { crit_chance, life_steal, gold_mult, xp_mult, damage_mult, max_hp_mult }.
     * Chaque valeur = somme des (niveau × effet) pour toutes les familles complètes.
     */
    getCollectionSynergyBonuses() {
        const out = { crit_chance: 0, life_steal: 0, gold_mult: 0, xp_mult: 0, damage_mult: 0, max_hp_mult: 0, hp_regen_per_turn: 0 };
        if (typeof COLLECTION_SYNERGIES === 'undefined') return out;

        const allCreatures = [...(this.playerTeam || []), ...(this.storage || []), ...(this.pension || [])];
        const prestigeBySpecies = {};
        allCreatures.forEach(c => {
            if (c && c.name != null) {
                const p = c.prestige || 0;
                prestigeBySpecies[c.name] = Math.max(prestigeBySpecies[c.name] || 0, p);
            }
        });

        Object.values(COLLECTION_SYNERGIES).forEach(synergy => {
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
    getCollectionSynergyDetails() {
        if (typeof COLLECTION_SYNERGIES === 'undefined') return [];
        const allCreatures = [...(this.playerTeam || []), ...(this.storage || []), ...(this.pension || [])];
        const prestigeBySpecies = {};
        allCreatures.forEach(c => {
            if (c && c.name != null) {
                const p = c.prestige || 0;
                prestigeBySpecies[c.name] = Math.max(prestigeBySpecies[c.name] || 0, p);
            }
        });

        const effectLabels = { crit_chance: 'Critique', life_steal: 'Life Steal', gold_mult: 'Argent', xp_mult: 'XP', damage_mult: 'Dégâts', max_hp_mult: 'PV Max', hp_regen_per_turn: 'Regen PV/tour' };
        const effectFormatters = { crit_chance: v => `+${(v * 100).toFixed(1)}%`, life_steal: v => `+${(v * 100).toFixed(1)}%`, gold_mult: v => `+${(v * 100).toFixed(1)}%`, xp_mult: v => `+${(v * 100).toFixed(1)}%`, damage_mult: v => `+${(v * 100).toFixed(1)}%`, max_hp_mult: v => `+${(v * 100).toFixed(1)}%`, hp_regen_per_turn: v => `+${(v * 100).toFixed(1)}% PV/tour` };
        const effectPerPrestigeLabels = { crit_chance: v => `+${((v || 0) * 100).toFixed(1)}% Critique/prestige`, life_steal: v => `+${((v || 0) * 100).toFixed(1)}% Life Steal/prestige`, gold_mult: v => `+${((v || 0) * 100).toFixed(1)}% Argent/prestige`, xp_mult: v => `+${((v || 0) * 100).toFixed(1)}% XP/prestige`, damage_mult: v => `+${((v || 0) * 100).toFixed(1)}% Dégâts/prestige`, max_hp_mult: v => `+${((v || 0) * 100).toFixed(1)}% PV/prestige`, hp_regen_per_turn: v => `+${((v || 0) * 100).toFixed(1)}% Regen PV/tour` };

        return Object.entries(COLLECTION_SYNERGIES).map(([id, synergy]) => {
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
            const bonusPerPrestige = effectEntries.map(([key, val]) => {
                const fn = effectPerPrestigeLabels[key];
                return fn ? fn(val) : null;
            }).filter(Boolean).join(', ');
            return { id, name: synergy.name, members, minPrestige, level, effectTexts, bonusPerPrestige, isActive: level > 0 };
        });
    }

    getTalentStackBonus(talentName) {
        const count = this.playerTeam.filter(c => c.passiveTalent === talentName).length;
        if (count === 0) return 0;

        // Définir les bonus par niveau de stack
        const bonusTables = {
            'mentor': [0, 0.25, 0.40, 0.50, 0.55, 0.58, 0.60],        // XP
            'collecteur': [0, 0.50, 15, 0.90, 1.00, 1.05, 1.10],    // Pokédollars
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
        this.arenaState.maxDuration = 90000;

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

        const elapsed = Date.now() - this.arenaState.startTime;
        if (elapsed >= this.arenaState.maxDuration) {
            this.loseArena("Temps ecoule !");
            return true;
        }

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
                if (ach.rewards.tokens) rewardsHTML += `<span class="quest-reward-item">🎫 ${ach.rewards.tokens}</span>`;
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
        // Collection Synergies
        const collXp = (this.getCollectionSynergyBonuses ? this.getCollectionSynergyBonuses() : {}).xp_mult || 0;
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

        // Ajouter les boosts temporaires
        bonus += this.getActiveBoostMultiplier('eggDrop');

        return bonus;
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

        // 3. Mettre à jour le style du bouton

        const iconHtml = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/key-stone.png" class="icon-img" style="width:20px; height:20px; margin-right:5px; vertical-align:text-bottom;">`;
        if (hasActiveSynergy) {
            if (typeof this.checkSpecialQuests === 'function') this.checkSpecialQuests('synergyActive');
            // ACTIF
            btn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
            btn.style.boxShadow = "0 0 10px rgba(34, 197, 94, 0.6)";
            btn.style.borderColor = "#86efac";
            btn.innerHTML = `${iconHtml} Synergies (ACTIF)`; // ✅ Avec l'image
            btn.classList.add("pulse-animation");
        } else {
            // INACTIF
            btn.style.background = "#8b5cf6";
            btn.style.boxShadow = "none";
            btn.style.borderColor = "transparent";
            btn.innerHTML = `${iconHtml} Synergies`; // ✅ Avec l'image
            btn.classList.remove("pulse-animation");
        }
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

            if (completed) {
                arenaCard.style.background = 'linear-gradient(135deg, #d4edda 0%, #a3d4a8 100%)';
                arenaCard.style.border = '2px solid #22c55e';
            } else if (!unlocked) {
                arenaCard.style.opacity = '0.6';
            }

            const requiredZone = ZONES[arena.requiredZone];
            const requiredZoneName = requiredZone ? requiredZone.name : "Zone " + arena.requiredZone;

            arenaCard.innerHTML = `
            <div class="upgrade-title">${arena.name}</div>
            <div class="upgrade-description">
                <strong>Champion:</strong> ${arena.championName}<br>
                <strong>Type:</strong> ${arena.type}<br>
                <strong>Niveau:</strong> ${arena.teamLevel}<br>
                <strong>Équipe:</strong> 6 Pokémon<br>
                <strong>Temps limite:</strong> 90 secondes
            </div>
            <div style="margin: 15px 0; padding: 10px; background: rgba(255, 215, 0, 0.2); border-radius: 8px; border-left: 4px solid #ffd700;">
                <div style="font-weight: bold; color: #d97706; margin-bottom: 5px;">Récompense: ${talent.name}</div>
                <div style="font-size: 12px; color: #666;">${talent.description}</div>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
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
    openEgg(rarity) {
        if (this.eggs[rarity] <= 0) {
            logMessage("Aucun oeuf de cette rareté disponible !");
            return;
        }

        // 1. Mise à jour des stats et quêtes d'ouverture
        this.eggs[rarity]--;
        this.stats.eggsOpened++;
        this.checkSpecialQuests('eggsOpened');

        logMessage("Ouverture d'un oeuf " + rarity + "...");

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
            toast.shiny('✨ SHINY OBTENU !', `${creature.name} brille de mille feux !`);
        }

        if (creature.rarity === RARITY.LEGENDARY) {
            this.checkSpecialQuests('legendary_obtained');
            if (!creature.isShiny) {
                toast.legendary('👑 LÉGENDAIRE !', `${creature.name} rejoint votre collection !`);
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

            logMessage(msg);

            // Toast de feedback
            if (result.improved) {
                toast.success("Fusion Réussie !", `${existingCreature.name} est plus fort ! (+${result.shards} Shards)` + (result.ivImproved ? " IVs améliorés" : ""));
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

        // 6. Affichage final
        this.showEggHatchModal(creature, rarity);
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
        const modal = document.getElementById('eggHatchModal');
        const content = document.getElementById('eggHatchContent');
        if (!modal || !content) return;

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

        const data = {
            title,
            spriteUrl: getPokemonSpriteUrl(creature.name, creature.isShiny, false),
            name: creature.name,
            type: creature.type,
            secondaryType: creature.secondaryType || '',
            statsHTML
        };
        const contentClass = creature.isShiny ? 'shiny' : (creature.rarity === RARITY.LEGENDARY ? 'legendary' : '');
        if (typeof showEggHatchModalUI === 'function') showEggHatchModalUI(modal, content, data, { contentClass });
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
                style="font-size:10px; padding:2px 6px; background:linear-gradient(135deg, #a855f7, #ec4899); color:white; border:none; border-radius:4px; cursor:pointer; margin-left:5px;">
                💎 Optimiser
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
        const moveName = POKEMON_DEFAULT_MOVES[creature.name] || 'Charge';
        const move = MOVES_DB[moveName];
        const moveCategoryClass = move.category === 'special' ? 'special' : 'physical';

        const moveHTML = `
            <div class="creature-modal-info-box" style="border-left-color: #f97316;">
                <h5 style="color: #f97316;">Attaque</h5>
                <div class="modal-move-details">
                    <span class="move-name">${move.name}</span>
                    <span class="move-category ${moveCategoryClass}">${move.category}</span>
                    <span class="move-power">Pui. ${move.power}</span>
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

    // Helper pour ne pas surcharger la fonction principale
    generateCreatureActionsHTML(creature, index, location, maxLevel) {
        let actionsHTML = '';
        const maxTeamSize = 6 + this.getAccountTalentBonus('team_slot');
        const maxPensionSlots = this.getPensionSlots();
        const isTowerActive = this.towerState.isActive;
        const canUsePension = maxPensionSlots > 0;

        if (location === 'team') {
            if (index !== this.activeCreatureIndex && creature.isAlive()) {
                actionsHTML += `<button class="btn" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1f2937; font-weight: 800; box-shadow: 0 4px 0 #d97706;" onclick="game.setActiveCreature(${index}); game.closeCreatureModal();">Activer</button>`;
            }
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
        const evolutionData = EVOLUTIONS[creature.name];
        if (evolutionData && creature.level >= evolutionData.level && !evolutionData.condition) {
            const existingDuplicate = this.findCreatureByName(evolutionData.evolves_to, creature.isShiny);
            const label = existingDuplicate ? "🧬 FUSIONNER" : "✨ ÉVOLUER";
            const color = existingDuplicate ? "linear-gradient(135deg, #a855f7, #9333ea)" : "linear-gradient(135deg, #34d399, #059669)";
            actionsHTML += `<button class="btn" style="background: ${color}; color: white; animation: pulse-reward 2s infinite;" onclick="game.evolveCreature(${index}, '${location}');">${label}</button>`;
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

        this.updateCollectionSynergiesDisplay();
    }

    switchPokedexSubTab(subTab) {
        this.pokedexSubTab = subTab || 'pokedex';
        const pokedexView = document.getElementById('pokedexSubView-pokedex');
        const synergiesView = document.getElementById('pokedexSubView-synergies');
        const btnPokedex = document.getElementById('pokedexSubTab-pokedex');
        const btnSynergies = document.getElementById('pokedexSubTab-synergies');
        if (pokedexView) pokedexView.style.display = this.pokedexSubTab === 'pokedex' ? '' : 'none';
        if (synergiesView) synergiesView.style.display = this.pokedexSubTab === 'synergies' ? '' : 'none';
        if (btnPokedex) btnPokedex.classList.toggle('active', this.pokedexSubTab === 'pokedex');
        if (btnSynergies) btnSynergies.classList.toggle('active', this.pokedexSubTab === 'synergies');
        if (this.pokedexSubTab === 'synergies') this.updateCollectionSynergiesDisplay();
    }

    updateCollectionSynergiesDisplay() {
        const container = document.getElementById('collectionSynergiesContainer');
        const tabsContainer = document.getElementById('collectionSynergiesTabs');
        if (!container) return;
        if (typeof COLLECTION_SYNERGIES === 'undefined') { container.innerHTML = ''; if (tabsContainer) tabsContainer.innerHTML = ''; return; }

        const details = this.getCollectionSynergyDetails();
        if (!details || details.length === 0) { container.innerHTML = ''; if (tabsContainer) tabsContainer.innerHTML = ''; return; }

        const tab = this.collectionSynergyTab || 'all';
        const filteredDetails = tab === 'all' ? details : details.filter(f => f.id === tab);

        if (tabsContainer) {
            tabsContainer.innerHTML = `<button class="sort-btn ${tab === 'all' ? 'active' : ''}" onclick="game.collectionSynergyTab='all'; game.updateCollectionSynergiesDisplay();" style="font-size:12px; padding:6px 10px;">Tous</button>`;
            details.forEach(fam => {
                const isActive = tab === fam.id;
                tabsContainer.innerHTML += `<button class="sort-btn ${isActive ? 'active' : ''}" onclick="game.collectionSynergyTab='${fam.id}'; game.updateCollectionSynergiesDisplay();" style="font-size:12px; padding:6px 10px;">${fam.name}</button>`;
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
            html += `<div class="collection-synergy-card ${statusClass}" style="margin-bottom:20px; padding:15px; background:${fam.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.03)'}; border-radius:12px; border:1px solid ${fam.isActive ? 'rgba(34,197,94,0.3)' : '#e2e8f0'};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                <h4 style="margin:0; font-size:16px; font-weight:900; color:#1a1a1a;">${fam.name}</h4>
                <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                    ${fam.bonusPerPrestige ? `<span style="font-size:11px; color:#e0e0e0; font-weight:700; background:rgba(0,0,0,0.3); padding:3px 8px; border-radius:6px;" title="Bonus par niveau de prestige">${fam.bonusPerPrestige}</span>` : ''}
                    <span style="font-size:13px; font-weight:800; color:${fam.isActive ? '#16a34a' : '#e0e0e0'}; ${fam.isActive ? '' : 'background:rgba(0,0,0,0.3); padding:3px 8px; border-radius:6px;'}">
                        Niv. ${fam.level} ${fam.isActive ? `→ ${effectStr}` : `(${inactiveReason})`}
                    </span>
                </div>
            </div>
            <div class="collection-synergy-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(52px, 1fr)); gap:8px;">`;
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
    evolveCreature(creatureIndex, location) {
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

        // On bloque si c'est une évolution par objet (géré par useItem)
        if (evolutionData.condition) {
            logMessage(`ℹ️ ${creature.name} a besoin d'un objet spécial pour évoluer.`);
            return;
        }

        if (creature.level < evolutionData.level) {
            logMessage(`⛔ ${creature.name} doit être niveau ${evolutionData.level} pour évoluer.`);
            return;
        }

        const oldName = creature.name;
        const newName = evolutionData.evolves_to;

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
        if (typeof acceptQuestLogic === 'function') acceptQuestLogic(this, questId);
    }

    refuseQuest(questId) {
        if (typeof refuseQuestLogic === 'function') refuseQuestLogic(this, questId);
    }

    abandonQuest(questId) {
        if (typeof abandonQuestLogic === 'function') abandonQuestLogic(this, questId);
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

    updateCaptureButtonDisplay() {
        const btn = document.getElementById('captureModeBtn');
        const select = document.getElementById('captureTargetSelect');

        // --- DEBUGGING ---
        console.log("🔄 Mise à jour visuelle. Mode:", this.captureMode);

        if (!btn) {
            console.error("❌ ERREUR CRITIQUE : Le bouton avec l'ID 'captureModeBtn' est introuvable dans le HTML !");
            return;
        }
        // -----------------

        // Reset des styles pour éviter les conflits
        btn.className = 'auto-select-btn'; // On garde la classe de base

        if (this.captureMode === 0) {
            // OFF (Gris)
            btn.textContent = "🕸️ Capture : OFF";
            btn.style.background = "#e0e0e0";
            btn.style.color = "#666";
            btn.style.borderColor = "#ccc";
            if (select) select.style.display = 'none';
        }
        else if (this.captureMode === 1) {
            // TOUS (Rouge)
            btn.textContent = "🕸️ Capture : TOUS";
            btn.style.background = "linear-gradient(135deg, #ff6b6b, #ee5253)";
            btn.style.color = "white";
            btn.style.borderColor = "#ff6b6b";
            if (select) select.style.display = 'none';
        }
        else if (this.captureMode === 2) {
            // CIBLE (Bleu)
            btn.textContent = "🎯 Capture : CIBLE";
            btn.style.background = "linear-gradient(135deg, #3b82f6, #2563eb)";
            btn.style.color = "white";
            btn.style.borderColor = "#3b82f6";
            if (select) select.style.display = 'block';
        }
    }

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

            html += `
            <div class="synergy-list-card ${isActive ? 'active' : ''}"
                 onmouseenter="game.scheduleTooltip(event, '${safeTitle}', '${safeDesc}')"
                 onmouseleave="game.hideTooltip()">
                 
                <div class="synergy-list-info">
                    <div class="synergy-list-title">
                        ${synergy.name}
                        ${isActive ? '✅' : ''}
                    </div>
                    <div class="synergy-list-desc">${shortDesc}</div>
                    
                    <div class="synergy-progress" style="margin-top:5px; font-size:11px; line-height:1.5;">
                        ${progressHTML}
                    </div>
                    
                    <div style="width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 4px; overflow:hidden;">
                        <div style="width: ${progressPercent}%; height: 100%; background: ${isActive ? '#22c55e' : '#9ca3af'}; transition: width 0.3s;"></div>
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
            background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 10px; 
            padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom:10px;
        `;

            card.innerHTML = `
            <div style="font-size: 32px; background:white; width:50px; height:50px; display:flex; align-items:center; justify-content:center; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                ${displayInfo.icon}
            </div>
            
            <div style="flex: 1;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <strong style="font-size:16px; color:#333;">${displayInfo.name}</strong>
                    <span style="font-size:12px; font-weight:bold; color:#8b5cf6;">Niveau ${currentLevel}</span>
                </div>
                
                <div style="width: 100%; height: 8px; background: #ddd; border-radius: 4px; overflow: hidden; margin-bottom: 5px;">
                    <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #6d28d9); transition: width 0.3s;"></div>
                </div>
                
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#666;">
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

        // Met à jour le badge principal sur "Extras"
        this.showBadge('extrasBadge', questBadge || expBadge);
    }

    // ✅ AJOUTER CETTE NOUVELLE FONCTION DANS LA CLASSE GAME

    checkCompletedNotifications() {
        // Vérifier les Quêtes et Succès
        const completedQuest = this.quests.some(q => q.completed && !q.claimed);
        const completedAchiev = Object.values(this.achievements).some(a => a.completed && !a.claimed);
        const hasStoryQuest = this.quests.some(q => q.questType === 'STORY' && !q.claimed);
        const questBadge = document.getElementById('questsTabBadge');
        if (questBadge) {
            if (completedQuest || completedAchiev) {
                questBadge.innerHTML = '<div class="notification-badge"></div>';
            } else if (hasStoryQuest) {
                questBadge.innerHTML = '<span class="story-quest-tab-badge">📜</span>';
            } else {
                questBadge.innerHTML = '';
            }
        }

        // Vérifier les Expéditions
        const completedExp = this.activeExpeditions.some(e => Date.now() >= e.endTime);
        this.showBadge('expeditionsTabBadge', completedExp);

        // Mettre à jour le badge "Extras" global
        this.updateExtrasBadge();
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

    loadGame() {
        return typeof loadGameLogic === 'function' ? loadGameLogic(this) : false;
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

    // Nouvelle fonction pour gérer les couleurs des boutons
    updateOptionButtons() {
        const btnFusion = document.getElementById('optSmartFusion');
        const btnPause = document.getElementById('optPauseRare');

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
            <h3 style="color: #667eea; margin-bottom: 15px;">Combat</h3>
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

            <h3 style="color: #667eea; margin: 25px 0 15px 0;">Creatures</h3>
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

            <h3 style="color: #667eea; margin: 25px 0 15px 0;">Arènes</h3>
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

            <h3 style="color: #667eea; margin: 25px 0 15px 0;">Progression</h3>
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

        // Sécurisation des méthodes + Collection Synergies
        const collBonuses = this.getCollectionSynergyBonuses ? this.getCollectionSynergyBonuses() : {};
        const hpBonus = (this.getAccountTalentBonus ? this.getAccountTalentBonus('hp_mult') : 0) * 100;
        const damageBonus = ((this.getAccountTalentBonus ? this.getAccountTalentBonus('damage_mult') : 0) + (collBonuses.damage_mult || 0)) * 100;
        const moneyBonus = ((this.getAccountTalentBonus ? this.getAccountTalentBonus('pokedollars_mult') : 0) + (collBonuses.gold_mult || 0)) * 100;
        const maxHpBonus = (collBonuses.max_hp_mult || 0) * 100;
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

    updateDisplay() {
        this.updateTeamDisplay();
        this.updateStorageDisplay();
        this.updatePensionDisplay();
        this.updateEggsDisplay();
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

    toggleAutoSelect() {
        this.autoSelectEnabled = !this.autoSelectEnabled;

        const btn = document.getElementById('autoSelectBtn');
        if (btn) {
            if (this.autoSelectEnabled) {
                btn.classList.add('auto-active');
                logMessage("Auto-sélection activée !");
            } else {
                btn.classList.remove('auto-active');
                logMessage("Auto-sélection désactivée !");
            }
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

            const contributedHP = Math.floor(creature.maxHp * this.getPensionTransferRate());
            const contributedATK = Math.floor(creature.attack * this.getPensionTransferRate());
            const contributedSpATK = Math.floor(creature.spattack * this.getPensionTransferRate());
            const contributedDEF = Math.floor(creature.defense * this.getPensionTransferRate());
            const contributedSpDEF = Math.floor(creature.spdefense * this.getPensionTransferRate());
            const contributedSPD = Math.floor(creature.speed * this.getPensionTransferRate());

            card.innerHTML = `
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

            pensionList.appendChild(card);
            const triggerEl = card.querySelector('.pension-contribution-trigger');
            if (triggerEl) {
                triggerEl.addEventListener('mouseenter', function (e) { e.stopPropagation(); game.showPensionContributionPopover(i, this); });
                triggerEl.addEventListener('mouseleave', function (e) { game.scheduleHidePensionContributionPopover(150); });
            }
        }
    }


    updateEggsDisplay() {
        const eggsContainer = document.getElementById('ballsContainer');
        const eggCount = document.getElementById('ballCount');

        if (!eggsContainer || !eggCount) return;

        const totalEggs = Object.values(this.eggs).reduce((sum, count) => sum + count, 0);
        eggCount.textContent = totalEggs;

        eggsContainer.innerHTML = '';

        const baseEggUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png";

        Object.entries(this.eggs).forEach(([rarity, count]) => {
            if (count > 0) {
                const eggElement = document.createElement('div');

                eggElement.className = `ball-item rarity-${rarity} egg-clickable`;
                eggElement.setAttribute('data-rarity', rarity);
                eggElement.style.cursor = 'pointer';

                let filterClass = "";
                if (rarity === 'rare') filterClass = "egg-filter-rare";
                else if (rarity === 'epic') filterClass = "egg-filter-epic";
                else if (rarity === 'legendary') filterClass = "egg-filter-legendary";

                eggElement.innerHTML = `
                <div class="rarity-label ${rarity}" style="pointer-events: none; margin-bottom:2px; font-size:9px; padding:1px 4px;">
                    ${rarity.toUpperCase()}
                </div>
                
                <img src="${baseEggUrl}" class="egg-sprite ${filterClass}" alt="Oeuf ${rarity}">
                
                <div style="font-size: 13px; font-weight: bold; color:#333; pointer-events: none; line-height:1; margin-bottom: 4px;">
                    x${count}
                </div>
                
                <div style="font-size: 10px; color: #555; line-height: 1.2; opacity:0.9;">
                    Clic : x1<br>
                    Shift : x5<br>
                    <strong>Ctrl : x100</strong>
                </div>
            `;

                eggsContainer.appendChild(eggElement);
            }
        });

        if (totalEggs === 0) {
            eggsContainer.innerHTML = `
            <div style="text-align: center; color: #94a3b8; padding: 15px; grid-column: 1 / -1; border: 2px dashed #e2e8f0; border-radius: 10px;">
                <img src="${baseEggUrl}" style="width:24px; opacity:0.4; filter:grayscale(1);">
                <div style="margin-top:5px; font-size:11px;">Vide</div>
            </div>`;
        }
    }
}

window.Game = Game;
