/**
 * @file questSystem.js
 * Classe Quest et logique du système de quêtes.
 * Fonctions globales recevant game (instance du jeu) en paramètre.
 *
 * Dépendances globales : TYPES, RARITY, QUEST_TYPES, QUEST_TEMPLATES, QUEST_DIFFICULTIES,
 * STORY_QUESTS, STORY_QUEST_ORDER, ZONES, ALL_ITEMS, currentZone, formatNumber, logMessage, toast
 */

// ============================================================
// CLASSE QUEST
// ============================================================

class Quest {
    constructor(template, multiplier = 1, difficulty = 'EASY') {
        this.id = Date.now() + Math.random();
        this.title = template.title;
        this.description = template.desc;
        this.target = Array.isArray(template.target)
            ? template.target[Math.floor(Math.random() * template.target.length)]
            : template.target;
        this.progress = 0;
        this.current = 0;
        this.completed = false;
        this.claimed = false;
        this.accepted = false;
        this.trackingKey = template.trackingKey;
        this.difficulty = difficulty;
        this.special = template.special || null;
        this.startTime = Date.now();
        this.startValue = 0;
        this.questType = null;

        this.specialParams = {};

        if (template.special === 'monotype') {
            const types = Object.values(TYPES);
            this.specialParams.requiredType = types[Math.floor(Math.random() * types.length)];
            this.description = this.description.replace('{type}', this.specialParams.requiredType);
        }

        if (template.time) {
            this.specialParams.timeLimit = Array.isArray(template.time)
                ? template.time[Math.floor(Math.random() * template.time.length)]
                : template.time;
            this.description = this.description.replace('{time}', this.specialParams.timeLimit);
        }

        if (template.special === 'zone_unlock') {
            this.specialParams.targetZone = Math.floor(Math.random() * 5) + 2;
            this.description = this.description.replace('{zone}', this.specialParams.targetZone);
        }

        this.description = this.description.replace('{target}', this.target);

        const diffMultiplier = QUEST_DIFFICULTIES[difficulty].multiplier;
        this.rewards = this.calculateRewards(diffMultiplier * multiplier);
    }

    calculateRewards(multiplier) {
        const base = {
            pokedollars: Math.floor(100 * multiplier),
            tokens: Math.floor(1 * multiplier),
            eggs: {}
        };
        if (this.difficulty === 'MEDIUM') {
            base.eggs[RARITY.RARE] = 1;
        } else if (this.difficulty === 'HARD') {
            base.eggs[RARITY.EPIC] = 1;
            base.tokens += 2;
        } else if (this.difficulty === 'EXTREME') {
            base.eggs[RARITY.LEGENDARY] = 1;
            base.tokens += 5;
            base.pokedollars *= 2;
        }
        return base;
    }

    updateProgress(value) {
        this.current = Math.min(value, this.target);
        this.progress = this.current;
        if (this.current >= this.target && !this.completed) {
            this.completed = true;
            return true;
        }
        return false;
    }

    getProgressPercent() {
        return Math.min(100, (this.current / this.target) * 100);
    }
}

// Exporter globalement pour loadGame (saveSystem)
if (typeof window !== 'undefined') window.Quest = Quest;

// ============================================================
// GÉNÉRATION & STORY
// ============================================================

/**
 * Ajoute la prochaine quête scénario en ordre (tutoriel linéaire).
 * Appelé au chargement, au changement de zone, et quand une quête scénario est terminée.
 */
function ensureStoryQuestProgress(game) {
    if (typeof STORY_QUEST_ORDER === 'undefined' || typeof STORY_QUESTS === 'undefined') return;
    if (game.quests.length >= 10) return;

    const order = STORY_QUEST_ORDER;
    for (let i = 0; i < order.length; i++) {
        const key = order[i];
        const def = STORY_QUESTS[key];
        if (!def) continue;
        const alreadyInList = game.quests.some(q => q.id === def.id);
        if (alreadyInList) continue;
        const completed = game.completedStoryQuests && game.completedStoryQuests.includes(def.id);
        if (completed) continue;
        const prevCompleted = i === 0 || (game.completedStoryQuests && game.completedStoryQuests.includes(STORY_QUESTS[order[i - 1]].id));
        const prevInListCompleted = i === 0 || game.quests.some(q => q.id === STORY_QUESTS[order[i - 1]].id && q.completed);
        if (i > 0 && !prevCompleted && !prevInListCompleted) return;
        addStoryQuestLogic(game, def);
        return;
    }
}

function generateQuestLogic(game) {
    if (game.quests.length >= 10) return;

    ensureStoryQuestProgress(game);
    if (game.quests.length >= 10) return;

    let difficulty = 'EASY';
    const totalCreatures = game.playerTeam.length + game.storage.length + game.pension.length;
    const prestigeCount = game.stats.prestigeCount || 0;
    const badgesCount = Object.values(game.badges).filter(b => b).length;

    if (prestigeCount >= 3 || badgesCount >= 5) {
        const roll = Math.random();
        if (roll < 0.3) difficulty = 'EXTREME';
        else if (roll < 0.6) difficulty = 'HARD';
        else difficulty = 'MEDIUM';
    } else if (totalCreatures > 50 || badgesCount >= 3) {
        const roll = Math.random();
        if (roll < 0.4) difficulty = 'HARD';
        else difficulty = 'MEDIUM';
    } else if (totalCreatures > 20) {
        const roll = Math.random();
        if (roll < 0.6) difficulty = 'MEDIUM';
        else difficulty = 'EASY';
    }

    const questTypeKeys = Object.keys(QUEST_TYPES);
    const randomType = QUEST_TYPES[questTypeKeys[Math.floor(Math.random() * questTypeKeys.length)]];
    const templates = QUEST_TEMPLATES[randomType];

    if (!templates || templates.length === 0) return;

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const quest = new Quest(randomTemplate, 1, difficulty);
    quest.questType = randomType;

    game.quests.push(quest);
    if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(game);

    const diffInfo = QUEST_DIFFICULTIES[difficulty];
    logMessage(`${diffInfo.icon} Nouvelle quête ${diffInfo.name} : ${quest.title}`);
}

function addStoryQuestLogic(game, storyDef) {
    const quest = new Quest({
        title: storyDef.title,
        desc: storyDef.description,
        target: storyDef.target,
        trackingKey: storyDef.trackingKey
    }, 1, storyDef.difficulty);

    quest.id = storyDef.id;
    quest.rewards = storyDef.rewards || {};
    quest.questType = 'STORY';
    if (storyDef.dialogue) quest.dialogue = storyDef.dialogue;
    if (storyDef.requiredSpecies) quest.requiredSpecies = storyDef.requiredSpecies;

    if (storyDef.id === 'story_vitamin' && game.items) {
        game.items['pv_plus'] = (game.items['pv_plus'] || 0) + 1;
        if (typeof logMessage === 'function') logMessage("🎁 Le Professeur vous donne 1 PV Plus pour tester les vitamines !");
        if (typeof toast !== 'undefined') toast.info("Vitamine offerte", "1 PV Plus ajouté au sac. Les vitamines s'obtiennent aussi en drop ou en boutique.");
    }
    if (storyDef.id === 'story_stat_boost' && game.items) {
        game.items['defense_plus'] = (game.items['defense_plus'] || 0) + 1;
        if (typeof logMessage === 'function') logMessage("🎁 Le Professeur vous donne 1 Défense + pour tester les boosts temporaires !");
        if (typeof toast !== 'undefined') toast.info("Boost offert", "1 Défense + ajouté au sac. Les boosts (Défense +, Attaque +, etc.) s'obtiennent en drop ou en boutique.");
    }
    if (storyDef.id === 'story_equip_item' && game.items) {
        game.items['leftovers'] = (game.items['leftovers'] || 0) + 1;
        if (typeof logMessage === 'function') logMessage("🎁 Le Professeur vous donne des Restes pour équiper un Pokémon !");
        if (typeof toast !== 'undefined') toast.info("Objet tenu offert", "1 Restes ajouté au sac. Équipez-le sur un Pokémon (fiche → Objet tenu).");
    }
    if (storyDef.id === 'story_tower_climb') {
        game.combatTickets = (game.combatTickets || 0) + 1;
        if (typeof logMessage === 'function') logMessage("🎁 Le Professeur vous donne 1 Ticket de Combat pour tenter la Tour ! Les autres tickets se récupèrent en droppant sur les Boss.");
        if (typeof toast !== 'undefined') toast.info("Ticket de Combat offert", "1 ticket ajouté. Les tickets supplémentaires dropent sur les Boss. La Tour rapporte des Marques du Triomphe (boutique Tour).");
    }

    game.quests.push(quest);
    if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(game);

    if (typeof narrativeManager !== 'undefined' && narrativeManager.showStoryQuestIntro) {
        const introDone = !narrativeManager.state || narrativeManager.state.introComplete;
        const suppressFirst = narrativeManager.state && narrativeManager.state.suppressNextStoryQuestIntro;
        if (introDone && !suppressFirst) {
            narrativeManager.showStoryQuestIntro(game, storyDef);
        }
    } else if (typeof toast !== 'undefined') {
        toast.legendary("Quête Spéciale !", storyDef.title);
    }
    logMessage(`📜 QUÊTE SCÉNARIO : ${storyDef.title}`);

    // Les quêtes de scénario sont désormais automatiquement acceptées
    if (typeof acceptQuestLogic === 'function') {
        acceptQuestLogic(game, storyDef.id);
    } else {
        // Fallback minimal : marquer la quête comme acceptée pour qu'elle progresse
        const q = game.quests.find(qt => qt.id === storyDef.id);
        if (q) q.accepted = true;
    }
}

// ============================================================
// VÉRIFICATION PROGRESSION
// ============================================================

function checkSpecialQuestsLogic(game, eventType, params = {}) {
    if (!game.quests) return;

    game.quests.forEach(quest => {
        if (!quest.accepted || quest.completed) return;

        let questWasJustCompleted = false;

        const simpleCounters = [
            'combatsWon', 'bossDefeated', 'eggsOpened', 'creaturesObtained',
            'newDiscoveriesDuringQuest', 'legendariesObtainedDuringQuest',
            'statusInflicted', 'totalShards', 'shiniesObtained',
            'zone_visited', 'level_up', 'creature_captured'
        ];

        let effectiveEvent = eventType;
        if (eventType === 'creature_obtained' && quest.trackingKey === 'creaturesObtained') {
            effectiveEvent = 'creaturesObtained';
        }
        if (eventType === 'new_discovery' && quest.trackingKey === 'newDiscoveriesDuringQuest') {
            effectiveEvent = 'newDiscoveriesDuringQuest';
        }

        if (quest.trackingKey === 'prestigeCount' && eventType === 'prestigeCount') {
            quest.current = (quest.current || 0) + 1;
        }

        // Cas spécial : fusions (doublons) — utilisé notamment pour la famille du starter
        if (quest.trackingKey === 'fusion_completed' && eventType === 'fusion_completed') {
            const species = params.species;

            // Si pas de starter défini ou pas d'info de créature, on incrémente simplement (comportement générique)
            if (!species || typeof narrativeManager === 'undefined' || !narrativeManager.state || !narrativeManager.state.starterChoice) {
                quest.current = (quest.current || 0) + 1;
                quest.updateProgress(quest.current);
            } else {
                // Familles de starters
                const starterKey = narrativeManager.state.starterChoice;
                const weedleFamily = ['Weedle', 'Kakuna', 'Beedrill'];
                const caterpieFamily = ['Caterpie', 'Metapod', 'Butterfree'];
                const family = starterKey === 'weedle' ? weedleFamily : caterpieFamily;

                if (quest.id === 'story_duplicates') {
                    // Pour la quête scénario sur les doublons, on ne compte que la famille du starter
                    if (family.includes(species)) {
                        quest.current = (quest.current || 0) + 1;
                        quest.updateProgress(quest.current);
                    }
                } else {
                    // Pour d'autres quêtes éventuelles basées sur fusion_completed, on garde le comportement générique
                    quest.current = (quest.current || 0) + 1;
                    quest.updateProgress(quest.current);
                }
            }
        }

        if (simpleCounters.includes(quest.trackingKey) && effectiveEvent === quest.trackingKey) {
            if (quest.special === 'type_hunt' && quest.requiredType) {
                const type1 = (params.creatureType || '').toLowerCase();
                const type2 = (params.secondaryType || '').toLowerCase();
                const required = quest.requiredType.toLowerCase();
                if (type1 !== required && type2 !== required) return;
            }
            if (quest.trackingKey === 'creature_captured' && quest.requiredSpecies) {
                if ((params.species || '') !== quest.requiredSpecies) return;
            }
            quest.current = (quest.current || 0) + 1;
        }

        switch (quest.trackingKey) {
            case 'totalPokedollarsEarned':
                if (eventType === 'pokedollars_gained') {
                    const moneyGainedSinceStart = game.stats.totalPokedollarsEarned - (quest.startValue || 0);
                    quest.updateProgress(moneyGainedSinceStart);
                }
                break;
            case 'maxCreatureLevel':
                if (eventType === 'level_up') {
                    const allCreatures = [...game.playerTeam, ...game.storage, ...game.pension];
                    const maxLevel = Math.max(0, ...allCreatures.map(c => c.level));
                    quest.updateProgress(maxLevel);
                }
                break;
            case 'maxTierEnemies':
                if (eventType === 'tier_increased') {
                    const zone = ZONES[currentZone];
                    const maxTier = zone.maxTier || 50;
                    const progress = game.zoneProgress[currentZone];
                    const enemyTiers = progress?.enemyTiers ? Object.values(progress.enemyTiers) : (progress?.pokemonTiers ? Object.values(progress.pokemonTiers) : []);
                    const enemiesAtMaxTier = enemyTiers.filter(tier => tier >= maxTier).length;
                    quest.updateProgress(enemiesAtMaxTier);
                }
                break;
            case 'winStreak':
                if (eventType === 'combatsWon') {
                    game.sessionStats.currentWinStreak = (game.sessionStats.currentWinStreak || 0) + 1;
                    quest.updateProgress(game.sessionStats.currentWinStreak);
                } else if (eventType === 'combat_lost') {
                    game.sessionStats.currentWinStreak = 0;
                    quest.updateProgress(0);
                }
                break;
            case 'perfectWins':
                if (eventType === 'combatsWon' && params.noDeath) {
                    quest.current = (quest.current || 0) + 1;
                } else if (eventType === 'combat_lost' || (eventType === 'combatsWon' && !params.noDeath)) {
                    quest.current = 0;
                }
                break;
            case 'currentMoney':
                if (eventType === 'pokedollars_gained') {
                    const progress = game.pokedollars - (quest.startValue || 0);
                    quest.updateProgress(Math.max(0, progress));
                } else if (eventType === 'money_spent') {
                    quest.startValue = game.pokedollars;
                    quest.current = 0;
                    quest.updateProgress(0);
                    if (typeof toast !== 'undefined') toast.warning("Économe", "Dépense détectée ! La quête repart à zéro.");
                }
                break;
            case 'zonesUnlocked':
                if (eventType === 'zone_unlocked') {
                    const unlockedZones = typeof ZONES !== 'undefined'
                        ? Object.keys(ZONES).filter(z => game.isZoneUnlocked(z)).length
                        : 0;
                    quest.updateProgress(unlockedZones);
                }
                break;
            case 'zone_2_visited':
                if (eventType === 'zone_2_visited') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'rareObtained':
                if (eventType === 'rareObtained' && params.rarity === 'rare') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'totalOwned':
                if (eventType === 'creature_obtained' || eventType === 'creature_captured' || eventType === 'creature_hatched') {
                    const total = (game.playerTeam ? game.playerTeam.length : 0) + (game.storage ? game.storage.length : 0) + (game.pension ? game.pension.length : 0);
                    quest.updateProgress(total);
                }
                break;
            case 'synergyActive':
                if (eventType === 'synergyActive') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'evolutionCount':
                if (eventType === 'evolutionCount') {
                    const count = game.stats && game.stats.evolutionsCount !== undefined ? game.stats.evolutionsCount : 0;
                    quest.updateProgress(count);
                }
                break;
            case 'starter_level_up':
                if (eventType === 'starter_level_up') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'starter_evolved':
                if (eventType === 'starter_evolved') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'pensionCount':
                if (eventType === 'pensionCount') {
                    const count = game.stats && game.stats.pensionCount !== undefined ? game.stats.pensionCount : (game.pension ? game.pension.length : 0);
                    quest.updateProgress(count);
                }
                break;
            case 'pensionUpgradeBought':
                if (eventType === 'pensionUpgradeBought') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'badgesEarned':
                if (eventType === 'badgesEarned') {
                    const count = game.stats && game.stats.badgesEarned !== undefined ? game.stats.badgesEarned : (Object.values(game.badges || {}).filter(Boolean).length);
                    quest.updateProgress(count);
                }
                break;
            case 'collectionSynergyActive':
                if (eventType === 'collectionSynergyActive') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'vitaminUsed':
                if (eventType === 'vitaminUsed') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'statBoostUsed':
                if (eventType === 'statBoostUsed') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'heldItemEquipped':
                if (eventType === 'heldItemEquipped') {
                    // Pour la quête scénario, on veut équiper un objet sur le starter specifically
                    if (!params || params.isStarter || quest.id === 'story_equip_item') {
                        quest.current = 1;
                        quest.updateProgress(1);
                    }
                }
                break;
            case 'towerFloor':
                if (eventType === 'towerFloor') {
                    const floor = game.towerRecord !== undefined ? game.towerRecord : 0;
                    quest.updateProgress(Math.min(floor, quest.target));
                }
                break;
            case 'recyclerUsed':
                if (eventType === 'recyclerUsed') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'expeditionLaunched':
                if (eventType === 'expeditionLaunched') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'evolution_fusion':
                if (eventType === 'evolution_fusion') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
            case 'ultimateUsed':
                if (eventType === 'ultimateUsed') {
                    quest.current = 1;
                    quest.updateProgress(1);
                }
                break;
        }

        if (quest.special === 'legendary_counter' && eventType === 'legendary_obtained') {
            const current = (quest.current || 0) + 1;
            quest.updateProgress(current);
        }

        if ((quest.special === 'rainbow' || quest.trackingKey === 'newTypesDuringQuest') && eventType === 'creature_obtained') {
            if (!quest.typesObtained) quest.typesObtained = new Set();
            if (params.creatureType) quest.typesObtained.add(params.creatureType);
            if (params.secondaryType) quest.typesObtained.add(params.secondaryType);
            quest.updateProgress(quest.typesObtained.size);
        }

        if (quest.current >= quest.target && !quest.completed) {
            quest.completed = true;
            questWasJustCompleted = true;
        }

        if (questWasJustCompleted) {
            showQuestCompletionModalLogic(game, quest);
            if (quest.questType === 'STORY' && typeof ensureStoryQuestProgress === 'function') {
                ensureStoryQuestProgress(game);
            }
        }
    });

    if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(game);
}

// ============================================================
// TIMER & UI
// ============================================================

function updateQuestTimerLogic(game, deltaTime) {
    if (game.quests.length >= 10) {
        if (typeof updateQuestTimerDisplayLogic === 'function') updateQuestTimerDisplayLogic(game);
        return;
    }

    if (isNaN(game.nextQuestTimer) || game.nextQuestTimer === undefined) {
        console.warn("⚠️ Timer Quête corrompu (NaN). Réinitialisation forcée.");
        game.nextQuestTimer = 60000;
    }

    if (typeof deltaTime === 'number') {
        game.nextQuestTimer -= deltaTime;
    } else {
        const now = Date.now();
        const elapsed = now - game.lastQuestUpdate;
        game.lastQuestUpdate = now;
        game.nextQuestTimer -= elapsed;
    }

    if (game.nextQuestTimer <= 0) {
        if (typeof generateQuestLogic === 'function') generateQuestLogic(game);
        game.nextQuestTimer = 120000 + (Math.random() * 360000);
        logMessage("📜 Une nouvelle quête est disponible !");
    }

    if (typeof updateQuestTimerDisplayLogic === 'function') updateQuestTimerDisplayLogic(game);
}

function updateQuestTimerDisplayLogic(game) {
    const timerElement = document.getElementById('nextQuestTime');
    if (!timerElement) return;

    if (game.quests.length >= 10) {
        timerElement.textContent = "MAX (10/10)";
        timerElement.style.color = "#ef4444";
        timerElement.style.fontWeight = "bold";
        timerElement.title = "Terminez ou refusez des quêtes pour en recevoir de nouvelles.";
        return;
    }

    let seconds = Math.ceil(game.nextQuestTimer / 1000);
    if (seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerElement.textContent = `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    timerElement.style.color = "#333";
    timerElement.style.fontWeight = "normal";
}

// ============================================================
// ACCEPT / REFUSE / ABANDON
// ============================================================

function acceptQuestLogic(game, questId) {
    const quest = game.quests.find(q => q.id == questId);
    if (!quest || quest.accepted) return;

    quest.accepted = true;

    switch (quest.trackingKey) {
        case 'totalPokedollarsEarned':
            quest.startValue = game.stats.totalPokedollarsEarned || 0;
            break;
        case 'currentMoney':
            quest.startValue = game.pokedollars;
            quest.current = 0;
            break;
        case 'evolutionCount':
            quest.current = game.stats && game.stats.evolutionsCount !== undefined ? game.stats.evolutionsCount : 0;
            break;
        case 'pensionCount':
            quest.current = game.stats && game.stats.pensionCount !== undefined ? game.stats.pensionCount : (game.pension ? game.pension.length : 0);
            break;
        case 'pensionUpgradeBought':
            quest.current = (game.upgrades && game.upgrades.pension && game.upgrades.pension.level > 0) ? 1 : 0;
            break;
        case 'badgesEarned':
            quest.current = game.stats && game.stats.badgesEarned !== undefined ? game.stats.badgesEarned : (Object.values(game.badges || {}).filter(Boolean).length);
            break;
        case 'collectionSynergyActive':
            quest.current = (game.getCollectionSynergyDetails && game.getCollectionSynergyDetails().some(d => d.isActive)) ? 1 : 0;
            break;
        case 'zonesUnlocked':
            if (typeof ZONES !== 'undefined' && typeof game.isZoneUnlocked === 'function') {
                quest.current = Object.keys(ZONES).filter(z => game.isZoneUnlocked(z)).length;
            }
            break;
        case 'zone_2_visited':
            quest.current = (typeof currentZone !== 'undefined' && currentZone === 2) || (game.sessionStats && game.sessionStats.zonesVisited && game.sessionStats.zonesVisited.has(2)) ? 1 : 0;
            break;
        case 'vitaminUsed':
        case 'statBoostUsed':
        case 'heldItemEquipped':
        case 'recyclerUsed':
        case 'expeditionLaunched':
            quest.current = 0;
            break;
        case 'towerFloor':
            quest.current = game.towerRecord !== undefined ? Math.min(game.towerRecord, quest.target || 5) : 0;
            break;
        case 'ultimateUsed':
            quest.current = 0;
            break;
        default:
            quest.current = 0;
            break;
    }

    if (quest.current >= quest.target && !quest.completed) {
        quest.completed = true;
        showQuestCompletionModalLogic(game, quest);
        if (quest.questType === 'STORY' && typeof ensureStoryQuestProgress === 'function') {
            ensureStoryQuestProgress(game);
        }
    }

    if (quest.special === 'rainbow' || quest.trackingKey === 'newTypesDuringQuest') {
        quest.typesObtained = new Set();
    }

    // Quête Léo (fusion) : 5 Poké Balls à l'acceptation pour capturer des doublons
    if (quest.trackingKey === 'fusion_completed') {
        game.items['pokeball'] = (game.items['pokeball'] || 0) + 5;
        logMessage("🎁 Léo vous donne 5 Poké Balls pour l'expérience.");
        if (typeof toast !== 'undefined') toast.info("Léo vous donne 5 Poké Balls", "Pour capturer des doublons !");
    }

    logMessage("✅ Quête acceptée : " + quest.title);
    if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(game);
    // Afficher le guide détaillé pour les quêtes scénario (sans masquer le module de capture)
    if (quest.questType === 'STORY' && game.showQuestGuide) game.showQuestGuide(quest.id);
}

function refuseQuestLogic(game, questId) {
    const index = game.quests.findIndex(q => q.id == questId);
    if (index === -1) return;

    const quest = game.quests[index];
    game.quests.splice(index, 1);

    logMessage("❌ Quête refusée : " + quest.title);
    if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(game);
}

function abandonQuestLogic(game, questId) {
    const index = game.quests.findIndex(q => q.id == questId);
    if (index === -1) return;

    const quest = game.quests[index];

    if (quest.questType === 'STORY') {
        logMessage("❌ Les quêtes scénario ne peuvent pas être abandonnées !");
        return;
    }

    if (!quest.accepted || quest.completed) {
        logMessage("❌ Impossible d'abandonner cette quête !");
        return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir abandonner la quête "${quest.title}" ?\nVotre progression sera perdue.`)) {
        return;
    }

    game.quests.splice(index, 1);

    logMessage("❌ Quête abandonnée : " + quest.title);
    if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(game);
}

// ============================================================
// MODAL COMPLÉTION & CLAIM
// ============================================================

/** Construit le HTML des récompenses d'une quête pour le modal de récap (story quest terminée). */
function buildQuestRewardsSummaryHtml(quest) {
    if (!quest || !quest.rewards) return '';
    let html = '';
    if (quest.rewards.pokedollars && quest.rewards.pokedollars > 0) {
        html += `<div class="quest-completion-reward">💰 ${typeof formatNumber === 'function' ? formatNumber(quest.rewards.pokedollars) : quest.rewards.pokedollars} Pokédollars</div>`;
    }
    if (quest.rewards.tokens && quest.rewards.tokens > 0) {
        html += `<div class="quest-completion-reward">🎫 ${quest.rewards.tokens} Jetons de Quêtes</div>`;
    }
    if (quest.rewards.eggs && typeof quest.rewards.eggs === 'object') {
        Object.entries(quest.rewards.eggs).forEach(([rarity, count]) => {
            if (count > 0) html += `<div class="quest-completion-reward">🥚 ${count}x Œuf ${rarity}</div>`;
        });
    }
    if (quest.rewards.boosts && Array.isArray(quest.rewards.boosts)) {
        const boostNames = { xp: 'XP', money: 'Pokédollars', eggDrop: 'Drop Œufs' };
        quest.rewards.boosts.forEach(boost => {
            const duration = Math.floor((boost.duration || 0) / 60000);
            html += `<div class="quest-completion-reward">⚡ +${((boost.value || 0) * 100)}% ${boostNames[boost.type] || boost.type} (${duration}min)</div>`;
        });
    }
    if (quest.rewards.items && typeof quest.rewards.items === 'object') {
        Object.entries(quest.rewards.items).forEach(([itemKey, count]) => {
            if (count <= 0) return;
            const itemDef = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[itemKey]) ? ALL_ITEMS[itemKey] : (typeof KEY_ITEMS !== 'undefined' && KEY_ITEMS[itemKey]) ? KEY_ITEMS[itemKey] : { name: itemKey, icon: '📦' };
            html += `<div class="quest-completion-reward">${itemDef.icon || '📦'} ${count}x ${itemDef.name || itemKey}</div>`;
        });
    }
    return html;
}

function showQuestCompletionModalLogic(game, quest) {
    // Ancien modal supprimé : on signale seulement la complétion ; la récompense se récupère depuis l'onglet Quêtes.
    if (typeof logMessage === 'function') logMessage("🎉 Quête terminée : " + quest.title + " ! Récupérez la récompense dans l'onglet Quêtes.");
    if (typeof toast !== 'undefined' && toast.info) toast.info("Quête terminée", quest.title + " — Récupérez la récompense dans l'onglet Quêtes.");
}

function claimQuestRewardLogic(game, quest) {
    const toClaim = quest != null ? quest : game.pendingQuestReward;
    if (!toClaim) return;

    const questToUse = toClaim;

    if (questToUse.rewards) {
        if (questToUse.rewards.pokedollars && questToUse.rewards.pokedollars > 0) {
            game.pokedollars += questToUse.rewards.pokedollars;
            if (typeof checkSpecialQuestsLogic === 'function') checkSpecialQuestsLogic(game, 'pokedollars_gained');
            if (game.checkAchievements) game.checkAchievements('totalPokedollarsEarned');
            if (game.showUiFloatingText) game.showUiFloatingText('headerStatMoney', `+${formatNumber(questToUse.rewards.pokedollars)}$`, 'ft-money');
        }

        if (questToUse.rewards.tokens && questToUse.rewards.tokens > 0) {
            game.questTokens = (game.questTokens || 0) + questToUse.rewards.tokens;
            if (game.showUiFloatingText) game.showUiFloatingText('headerStatTokens', `+${questToUse.rewards.tokens}🎫`, 'ft-token');
        }

        if (questToUse.rewards.eggs) {
            Object.entries(questToUse.rewards.eggs).forEach(([rarity, count]) => {
                if (count > 0) game.eggs[rarity] = (game.eggs[rarity] || 0) + count;
            });
        }

        if (questToUse.rewards.boosts && Array.isArray(questToUse.rewards.boosts)) {
            questToUse.rewards.boosts.forEach(boost => game.addBoost(boost));
        }

        if (questToUse.rewards.items) {
            Object.entries(questToUse.rewards.items).forEach(([itemKey, count]) => {
                game.addItem(itemKey, count);
            });
        }
    }

    // Dialogue spécial : canne à pêche débloquée après la quête doublons
    if (questToUse.id === 'story_duplicates' && typeof narrativeManager !== 'undefined' && typeof narrativeManager.showInfoModal === 'function') {
        narrativeManager.showInfoModal(
            game,
            "Nouveaux Pokémon aquatiques",
            "Grâce à cette canne à pêche, des Pokémon de type Eau apparaissent maintenant sur certaines routes. Repère les zones où la pêche est possible pour les rencontrer."
        );
    }

    game.questsCompleted = (game.questsCompleted || 0) + 1;

    if (questToUse.questType === 'STORY') {
        if (!game.completedStoryQuests) game.completedStoryQuests = [];
        if (!game.completedStoryQuests.includes(questToUse.id)) {
            game.completedStoryQuests.push(questToUse.id);
        }
    }

    questToUse.claimed = true;
    const index = game.quests.findIndex(q => q.id === questToUse.id);
    if (index !== -1) game.quests.splice(index, 1);

    game.pendingQuestReward = null;

    // Story quest : d'abord modal récap (récompenses + infos), puis après « Continuer » + délai, le Prof Chen propose la suivante
    if (questToUse.questType === 'STORY') {
        if (typeof narrativeManager !== 'undefined' && typeof narrativeManager.showStoryQuestCompletionSummary === 'function') {
            const completionData = {
                title: questToUse.title,
                description: questToUse.description || '',
                dialogue: questToUse.dialogue || '',
                rewardsHtml: buildQuestRewardsSummaryHtml(questToUse)
            };
            narrativeManager.showStoryQuestCompletionSummary(game, completionData, () => {
                const delayMs = 2500;
                setTimeout(() => {
                    if (typeof ensureStoryQuestProgress === 'function') ensureStoryQuestProgress(game);
                }, delayMs);
            });
        } else {
            if (typeof ensureStoryQuestProgress === 'function') ensureStoryQuestProgress(game);
        }
    }

    if (typeof updateQuestsDisplayLogic === 'function') updateQuestsDisplayLogic(game);
    if (game.updateEggsDisplay) game.updateEggsDisplay();
    if (game.updatePlayerStatsDisplay) game.updatePlayerStatsDisplay();
    if (game.updateShopDisplay) game.updateShopDisplay();
    if (game.updateItemsDisplay) game.updateItemsDisplay();
    if (typeof updateZoneInfo === 'function') updateZoneInfo();

    if (game.saveGame) game.saveGame();
}

// ============================================================
// AFFICHAGE DES QUÊTES
// ============================================================

function buildQuestCardHTML(game, quest) {
    let badgeClass = 'badge-easy';
    let badgeText = 'Facile';
    if (quest.questType === 'STORY') {
        badgeClass = 'badge-extreme';
        badgeText = 'Scénario';
    } else {
        if (quest.difficulty === 'MEDIUM') { badgeClass = 'badge-medium'; badgeText = 'Moyen'; }
        if (quest.difficulty === 'HARD') { badgeClass = 'badge-hard'; badgeText = 'Difficile'; }
        if (quest.difficulty === 'EXTREME') { badgeClass = 'badge-extreme'; badgeText = 'Extrême'; }
    }
    const current = quest.current || 0;
    const target = quest.target || 1;
    const percent = Math.min(100, (current / target) * 100);
    let rewardsHTML = '';
    if (quest.rewards) {
        if (quest.rewards.pokedollars) rewardsHTML += `<span class="quest-reward-item">💰 ${formatNumber(quest.rewards.pokedollars)}</span>`;
        if (quest.rewards.tokens) rewardsHTML += `<span class="quest-reward-item">🎫 ${quest.rewards.tokens}</span>`;
        if (quest.rewards.items) {
            Object.entries(quest.rewards.items).forEach(([key, count]) => {
                const itemDef = (typeof ALL_ITEMS !== 'undefined' && ALL_ITEMS[key]) ? ALL_ITEMS[key] : { name: key, icon: '📦' };
                rewardsHTML += `<span class="quest-reward-item">${itemDef.icon} ${count}x ${itemDef.name}</span>`;
            });
        }
        if (quest.rewards.eggs) {
            Object.entries(quest.rewards.eggs).forEach(([rarity, count]) => {
                if (count > 0) rewardsHTML += `<span class="quest-reward-item">🥚 ${count}x ${rarity}</span>`;
            });
        }
    }
    let actionsHTML = '';
    if (!quest.accepted) {
        actionsHTML = `<div class="quest-actions"><button class="quest-btn btn-accept" onclick="game.acceptQuest('${quest.id}')">Accepter</button><button class="quest-btn btn-refuse" onclick="game.refuseQuest('${quest.id}')">Refuser</button></div>`;
    } else if (quest.completed) {
        actionsHTML = `<button class="quest-btn btn-claim" onclick="game.showQuestCompletionModal(game.quests.find(q => q.id == '${quest.id}'))">🎁 Récupérer</button>`;
    } else {
        if (quest.questType !== 'STORY') {
            actionsHTML = `<button class="quest-btn btn-refuse" style="width:100%;" onclick="game.abandonQuest('${quest.id}')">Abandonner</button>`;
        } else {
            actionsHTML = `<div class="quest-actions" style="color:#94a3b8;font-size:12px;">Quête scénario — non abandonnable</div>`;
        }
    }
    const dialogueBlock = quest.dialogue ? `<div class="quest-dialogue" style="color:#555;font-style:italic;margin:6px 0;font-size:12px;">"${quest.dialogue}"</div>` : '';
    const guideBtn = quest.questType === 'STORY' ? `<button type="button" class="quest-btn" onclick="game.showQuestGuide('${String(quest.id).replace(/'/g, "\\'")}')" title="Comment faire ?" style="padding:4px 10px;font-size:12px;margin-left:6px;">?</button>` : '';
    return `
        <div class="quest-header"><div class="quest-title" style="display:flex;align-items:center;flex-wrap:wrap;">${quest.title}${guideBtn}</div><div class="quest-badge ${badgeClass}">${badgeText}</div></div>
        <div class="quest-description">${quest.description}</div>${dialogueBlock}
        <div class="quest-progress-container"><div class="quest-progress-bar"><div class="quest-progress-fill" style="width: ${percent}%"></div></div><div class="quest-progress-text">${formatNumber(current)} / ${formatNumber(target)}</div></div>
        <div class="quest-rewards">${rewardsHTML}</div>${actionsHTML}
    `;
}

function updateQuestsDisplayLogic(game) {
    const questContainer = document.getElementById('questContainer');
    const questCount = document.getElementById('questCount');
    const questTokens = document.getElementById('questTokens');
    const questCompleted = document.getElementById('questCompleted');
    const questsTabBadge = document.getElementById('questsTabBadge');

    if (!questContainer) return;

    if (questCount) questCount.textContent = game.quests.length;
    if (questTokens) questTokens.textContent = game.questTokens;
    if (questCompleted) questCompleted.textContent = game.questsCompleted;

    questContainer.innerHTML = '';

    const displayableQuests = game.quests.filter(q => !q.claimed);
    const storyQuests = displayableQuests.filter(q => q.questType === 'STORY');
    const otherQuests = displayableQuests.filter(q => q.questType !== 'STORY');

    if (questsTabBadge) {
        if (storyQuests.length > 0) {
            questsTabBadge.innerHTML = '<span class="story-quest-tab-badge">📜</span>';
            questsTabBadge.style.display = '';
        } else {
            questsTabBadge.innerHTML = '';
            questsTabBadge.style.display = 'none';
        }
    }

    if (game.quests.length === 0) {
        questContainer.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 30px; font-style: italic;">Aucune quête disponible.<br>Revenez plus tard !</div>';
        return;
    }

    const chenSpriteUrl = (typeof CHEN_SPRITE_URL !== 'undefined' ? CHEN_SPRITE_URL : (window.CHEN_SPRITE_URL || ''));
    const chenImg = chenSpriteUrl ? `<img src="${chenSpriteUrl}" alt="Chen" class="story-quest-section-chen" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.classList.add('visible');">` : '';
    const chenFallback = '<span class="story-quest-section-chen-fallback">👨‍🔬</span>';

    if (storyQuests.length > 0) {
        const storySection = document.createElement('div');
        storySection.className = 'story-quests-section';
        storySection.innerHTML = `
            <div class="story-quests-header">
                <div class="story-quests-header-icon">${chenImg}${chenFallback}</div>
                <div class="story-quests-header-text">
                    <h3 class="story-quests-section-title">Quêtes du Professeur Chen</h3>
                    <p class="story-quests-section-desc">Objectifs scénario à ne pas louper.</p>
                </div>
            </div>
            <div class="story-quests-list" id="storyQuestsList"></div>
        `;
        questContainer.appendChild(storySection);
        const storyList = document.getElementById('storyQuestsList');
        storyQuests.forEach(quest => {
            const card = document.createElement('div');
            card.className = 'quest-card quest-card-story';
            if (quest.accepted && !quest.completed) card.classList.add('accepted');
            if (quest.completed) card.classList.add('completed');
            card.style.borderLeft = '4px solid #f59e0b';
            card.innerHTML = buildQuestCardHTML(game, quest);
            storyList.appendChild(card);
        });
    }

    if (otherQuests.length > 0) {
        const otherHeader = document.createElement('h3');
        otherHeader.className = 'other-quests-title';
        otherHeader.textContent = storyQuests.length > 0 ? 'Autres quêtes' : 'Quêtes du Jour';
        questContainer.appendChild(otherHeader);
        otherQuests.forEach(quest => {
            const card = document.createElement('div');
            card.className = 'quest-card';
            if (quest.accepted && !quest.completed) card.classList.add('accepted');
            if (quest.completed) card.classList.add('completed');
            card.innerHTML = buildQuestCardHTML(game, quest);
            questContainer.appendChild(card);
        });
    }
}
