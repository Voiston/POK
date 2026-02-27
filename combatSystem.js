/**
 * @file combatSystem.js
 * Logique de combat : attaques, victoire, défaite, capture, ATB.
 * Ces fonctions reçoivent game (instance du jeu) en paramètre.
 *
 * Dépendances globales : Creature, STATUS_EFFECTS, TYPE_TO_STATUS, STATUS_PROC_CHANCES,
 * POKEMON_DEFAULT_MOVES, MOVES_DB, CATCH_RATES, BALLS, RARITY, formatNumber, formatFloatingNumber,
 * logMessage, showFloatingText, GAME_SPEEDS
 */

// ============================================================
// PERFORM ATTACK WITH BONUS
// ============================================================

function performAttackWithBonusLogic(game, attacker, target, playerMainStats, isPlayerAttacking, hasMaitreElementaire) {
    let sourceStats = null;
    if (!attacker.isEnemy && isPlayerAttacking) {
        sourceStats = game.getEffectiveStats();
    }

    let effectiveAttacker = attacker;
    if (sourceStats) {
        effectiveAttacker = {
            ...attacker,
            attack: sourceStats.attack,
            spattack: sourceStats.spattack,
            defense: sourceStats.defense,
            spdefense: sourceStats.spdefense,
            getAttackMultiplier: () => attacker.getAttackMultiplier(),
            hasStatusEffect: () => attacker.hasStatusEffect(),
            canAttack: () => attacker.canAttack(),
            statusEffect: attacker.statusEffect,
            passiveTalent: attacker.passiveTalent,
            ultimateActive: attacker.ultimateActive,
            ultimateAbility: attacker.ultimateAbility,
            ultimateCharge: attacker.ultimateCharge
        };
    }

    let wasUltimate = false;
    let ultimateDamageMult = 1.0;
    let ultimateLifesteal = 0;
    let ultimateDefensePen = 0;
    let ultimateHits = 1;
    let ultimateRecoil = 0;
    let isCriticalHit = false;

    if (attacker.ultimateActive) {
        attacker.ultimateActive = false;
        wasUltimate = true;
        const ult = attacker.ultimateAbility;

        switch (ult.effect.type) {
            case 'DAMAGE_MULT': ultimateDamageMult = ult.effect.value; break;
            case 'DAMAGE_AND_STATUS':
                ultimateDamageMult = ult.effect.value;
                let statusMult = ult.effect.statusMult || 1;
                let sourceAtk = playerMainStats ? playerMainStats.attack : effectiveAttacker.attack;
                if (statusMult > 1) sourceAtk *= statusMult;
                target.applyStatusEffect(ult.effect.status, sourceAtk);
                if (ult.effect.selfHeal) {
                    if (!attacker.isEnemy) {
                        const maxHp = game.getPlayerMaxHp();
                        const heal = Math.floor(maxHp * ult.effect.selfHeal);
                        attacker.mainAccountCurrentHp = Math.min(maxHp, attacker.mainAccountCurrentHp + heal);
                        if (showFloatingText) showFloatingText(`+${heal}`, document.getElementById('playerSpriteContainer'), 'ft-heal');
                    } else {
                        const max = attacker.maxHp || (attacker.stats ? attacker.stats.HP : 100);
                        const heal = Math.floor(max * ult.effect.selfHeal);
                        attacker.currentHP = Math.min(max, (attacker.currentHP || 0) + heal);
                    }
                }
                break;
            case 'LIFESTEAL':
                ultimateDamageMult = ult.effect.value;
                ultimateLifesteal = ult.effect.steal;
                break;
            case 'DEFENSE_PENETRATION':
                ultimateDamageMult = ult.effect.value;
                ultimateDefensePen = ult.effect.penetration;
                break;
            case 'MULTI_HIT':
                ultimateDamageMult = ult.effect.value;
                ultimateHits = ult.effect.hits;
                if (ult.effect.status) {
                    let baseAtk = playerMainStats ? playerMainStats.attack : effectiveAttacker.attack;
                    target.applyStatusEffect(ult.effect.status, baseAtk);
                }
                break;
            case 'RECOIL':
                ultimateDamageMult = ult.effect.value;
                ultimateRecoil = ult.effect.recoil;
                break;
            case 'DAMAGE_AND_STATUS_TYPE':
                ultimateDamageMult = ult.effect.value;
                const statusType = TYPE_TO_STATUS[attacker.type];
                if (statusType) {
                    let baseAtk = playerMainStats ? playerMainStats.attack : effectiveAttacker.attack;
                    target.applyStatusEffect(statusType, baseAtk);
                }
                break;
        }
    }

    if (attacker.heldItem === 'life_orb') {
        ultimateDamageMult *= 1.3;
    }

    // Contrôles (Confusion, Stun, Esquive)
    if (attacker.hasStatusEffect() && attacker.statusEffect && attacker.statusEffect.type === STATUS_EFFECTS.CONFUSED && Math.random() < 0.30) {
        const selfDamage = Math.floor(effectiveAttacker.attack * 0.5);
        attacker.takeDamage(selfDamage, playerMainStats);
        if (showFloatingText) showFloatingText("😵", document.getElementById('playerSpriteContainer'), 'ft-status');
        logMessage(attacker.name + " est confus et se blesse !");
        return false;
    }

    if (!attacker.canAttack()) {
        if (showFloatingText) showFloatingText("🚫", document.getElementById('playerSpriteContainer'), 'ft-status');
        if (attacker.statusEffect.duration > 0) attacker.statusEffect.duration--;
        return false;
    }

    if (target.hasStatusEffect() && target.statusEffect && target.statusEffect.type === STATUS_EFFECTS.AGILE && target.statusEffect.dodgeCount < 2 && Math.random() < 0.30) {
        target.statusEffect.dodgeCount++;
        if (showFloatingText) showFloatingText("Miss", document.getElementById('enemySpriteContainer'), '');
        logMessage(target.name + " esquive l'attaque !");
        return false;
    }

    let bonusDamageMult = 1.0;
    const tMaxHp = target.maxHp || (target.stats ? target.stats.HP : 1);
    const tCurrHp = target.currentHP || target.currentHp || 0;
    const healthRatio = tCurrHp / tMaxHp;

    if (!attacker.isEnemy && game.towerState.isActive && game.towerState.buffs) {
        const buffs = game.towerState.buffs;
        if (buffs.status_dmg_bonus && target.hasStatusEffect()) bonusDamageMult *= (1 + buffs.status_dmg_bonus);
        if (buffs.execute_percent && (healthRatio < 0.5)) bonusDamageMult *= (1 + buffs.execute_percent);
        if (buffs.lifesteal) ultimateLifesteal += buffs.lifesteal;
        if (buffs.crit_chance && Math.random() < buffs.crit_chance) isCriticalHit = true;
        const collSyn = game.getCollectionBonuses ? game.getCollectionBonuses() : {};
        if ((collSyn.life_steal || 0) > 0) ultimateLifesteal += collSyn.life_steal;
    }

    if (!attacker.isEnemy && game.upgrades) {
        if (game.upgrades['executor']) {
            if (healthRatio < 0.30) {
                bonusDamageMult *= (1 + (game.upgrades['executor'] * 0.15));
                isCriticalHit = true;
            }
        }
        if (game.upgrades['element_master']) {
            if (target.hasStatusEffect()) bonusDamageMult *= (1 + (game.upgrades['element_master'] * 0.10));
        }
    }

    if (!attacker.isEnemy) {
        let critChance = 0.05;
        if (game.upgrades && game.upgrades.critMastery) critChance += (game.upgrades.critMastery.level * 0.01);
        if (game.upgrades && game.upgrades['precision']) critChance += (game.upgrades['precision'] * 0.02);
        if (game.towerState.isActive && game.towerState.buffs?.crit_chance) critChance += game.towerState.buffs.crit_chance;
        if (attacker.passiveTalent === 'sniper') critChance += 0.20;
        const collSyn = game.getCollectionBonuses ? game.getCollectionBonuses() : {};
        if ((collSyn.crit_chance || 0) > 0) critChance += collSyn.crit_chance;
        if (!isCriticalHit) isCriticalHit = Math.random() < critChance;
    } else {
        if (!isCriticalHit) isCriticalHit = Math.random() < 0.05;
    }

    let totalDamage = 0;
    let isDead = false;
    let attackerPushedToDeath = false;

    const moveName = attacker.getMove ? attacker.getMove() : 'Charge';
    const move = MOVES_DB[moveName];

    for (let i = 0; i < ultimateHits; i++) {
        if (isDead) break;

        let damage = Creature.calculateDamageOutput(effectiveAttacker, target, {
            isCritical: isCriticalHit,
            ultMultiplier: ultimateDamageMult * bonusDamageMult,
            ignoreDefensePct: ultimateDefensePen,
            attackCategory: move.category,
            movePower: move.power,
            gameContext: game
        });

        if (!attacker.isEnemy && target.isEnemy) {
            const dmgBonus = (game.getAccountTalentBonus ? game.getAccountTalentBonus('damage_mult') : 0) + ((game.getCollectionBonuses ? game.getCollectionBonuses() : {}).damage_mult || 0);
            damage = Math.floor(damage * (1 + dmgBonus));
        }
        if (attacker.isEnemy && !target.isEnemy) {
            damage = Math.floor(damage * (1 - game.getAccountTalentBonus('damage_reduction')));
        }

        const isBigHit = wasUltimate || isCriticalHit;

        if (target.hasStatusEffect() && target.statusEffect.type === STATUS_EFFECTS.THORNY) {
            const thornsDmg = Math.floor(damage * 0.15);
            if (thornsDmg > 0) {
                // Apply thorns damage correctly and check if attacker dies
                const attackerDied = attacker.takeDamage(thornsDmg, playerMainStats, false, 'physical');
                if (showFloatingText) {
                    const containerId = attacker.isEnemy ? 'enemySpriteContainer' : 'playerSpriteContainer';
                    showFloatingText(`💢 ${thornsDmg}`, document.getElementById(containerId), attacker.isEnemy ? 'ft-damage-enemy' : 'ft-damage-player');
                }

                if (attackerDied) {
                    isDead = true;
                    attackerPushedToDeath = true;
                    // Stop attacking if attacker died to thorns
                    break;
                }
            }
            damage = Math.floor(damage * 0.67);
        }

        isDead = target.takeDamage(damage, playerMainStats, isBigHit, move.category);
        totalDamage += damage;

        if (!isDead && target.ultimateAbility && target.ultimateCharge < target.ultimateAbility.chargeNeeded) {
            let defCharge = 6;
            if (target.passiveTalent === 'epineux') defCharge *= 2;
            if (game.arenaState.active) defCharge *= 1.5;
            target.ultimateCharge = Math.min(target.ultimateAbility.chargeNeeded, target.ultimateCharge + defCharge);
        }

        if (!target.isEnemy && game.towerState.isActive && game.towerState.buffs && game.towerState.buffs.reflect_percent) {
            const reflectDmg = Math.floor(damage * game.towerState.buffs.reflect_percent);
            if (reflectDmg > 0) {
                const attackerDied = attacker.takeDamage(reflectDmg, playerMainStats, false, 'special');
                if (showFloatingText) showFloatingText(`💢 ${reflectDmg}`, document.getElementById('enemySpriteContainer'), 'ft-damage-enemy');

                if (attackerDied) {
                    isDead = true;
                    attackerPushedToDeath = true;
                    break;
                }
            }
        }

        if (attacker.heldItem === 'life_orb') {
            const max = attacker.maxHp || (attacker.stats ? attacker.stats.HP : 100);
            let recoilBase = max;
            if (!attacker.isEnemy && !game.arenaState.active && game.getPlayerMaxHp) {
                recoilBase = game.getPlayerMaxHp();
            }

            const recoil = Math.floor(recoilBase * 0.10);
            const attackerDied = attacker.takeDamage(recoil, playerMainStats, false, 'special');

            if (showFloatingText) {
                const containerId = attacker.isEnemy ? 'enemySpriteContainer' : 'playerSpriteContainer';
                showFloatingText(
                    "-" + formatFloatingNumber(recoil),
                    document.getElementById(containerId),
                    attacker.isEnemy ? 'ft-damage-enemy' : 'ft-damage-player'
                );
            }

            if (attackerDied) {
                isDead = true;
                attackerPushedToDeath = true;
                break;
            }
        }

        if (attacker.heldItem === 'shell_bell') {
            const heal = Math.floor(damage * 0.15);
            if (!attacker.isEnemy) {
                const isArena = game.arenaState.active;
                if (isArena) {
                    const max = attacker.maxHp || (attacker.stats ? attacker.stats.HP : 100);
                    attacker.currentHp = Math.min(max, attacker.currentHp + heal);
                } else {
                    const maxHp = game.getPlayerMaxHp();
                    attacker.mainAccountCurrentHp = Math.min(maxHp, attacker.mainAccountCurrentHp + heal);
                }
                if (showFloatingText) showFloatingText(
                    "+" + formatFloatingNumber(heal),
                    document.getElementById('playerSpriteContainer'),
                    'ft-heal'
                );
            } else {
                const max = attacker.maxHp || (attacker.stats ? attacker.stats.HP : 100);
                attacker.currentHP = Math.min(max, (attacker.currentHP || 0) + heal);
            }
        }

        if (ultimateLifesteal > 0) {
            const healAmount = Math.floor(damage * ultimateLifesteal);
            if (!attacker.isEnemy) {
                const maxHp = game.getPlayerMaxHp();
                attacker.mainAccountCurrentHp = Math.min(maxHp, attacker.mainAccountCurrentHp + healAmount);
                if (showFloatingText) showFloatingText("+" + formatFloatingNumber(healAmount), document.getElementById('playerSpriteContainer'), 'ft-heal');
            } else {
                const max = attacker.maxHp || (attacker.stats ? attacker.stats.HP : 100);
                attacker.currentHP = Math.min(max, (attacker.currentHP || 0) + healAmount);
            }
        }

        if (ultimateRecoil > 0) {
            const recoilAmount = Math.floor(damage * ultimateRecoil);
            if (recoilAmount > 0) {
                const attackerDied = attacker.takeDamage(recoilAmount, playerMainStats, false, 'special');
                if (showFloatingText) {
                    const containerId = attacker.isEnemy ? 'enemySpriteContainer' : 'playerSpriteContainer';
                    showFloatingText(`-${recoilAmount}`, document.getElementById(containerId), attacker.isEnemy ? 'ft-damage-enemy' : 'ft-damage-player');
                }

                if (attackerDied) {
                    isDead = true;
                    attackerPushedToDeath = true;
                    break;
                }
            }
        }
    }

    if (attacker.currentStamina > 0 && !wasUltimate) attacker.currentStamina--;
    if (attacker.hasStatusEffect() && attacker.statusEffect && attacker.statusEffect.type === STATUS_EFFECTS.PUNCHER) attacker.clearStatusEffect();
    if (attacker.passiveTalent === 'berserker' && (attacker.berserkStacks || 0) < 10) {
        attacker.berserkStacks = (attacker.berserkStacks || 0) + 1;
    }

    let message = attacker.name + " attaque " + target.name + " pour <span class=\"damage-" + attacker.type + "\">" + formatNumber(totalDamage) + " degats</span>";
    if (wasUltimate) message += " [ULTIME]";
    if (isCriticalHit) message += " [CRITIQUE]";
    logMessage(message);

    const spriteId = !attacker.isEnemy ? 'playerSprite' : 'enemySprite';
    const targetSpriteId = !attacker.isEnemy ? 'enemySprite' : 'playerSprite';
    document.getElementById(spriteId)?.classList.add('attack-lunge');
    document.getElementById(targetSpriteId)?.classList.add('take-hit');
    setTimeout(() => {
        document.getElementById(spriteId)?.classList.remove('attack-lunge');
        document.getElementById(targetSpriteId)?.classList.remove('take-hit');
    }, 300);

    if (!isDead && !target.hasStatusEffect()) {
        let procChance = (STATUS_PROC_CHANCES[attacker.rarity] || 0) + game.getStatusProcBonus();
        if (Math.random() < procChance) {
            const statusType = TYPE_TO_STATUS[attacker.type];
            if (statusType) {
                let baseAtk = (!attacker.isEnemy && playerMainStats) ? playerMainStats.attack : effectiveAttacker.attack;
                const isBuff = ['reinforced', 'agile', 'thorny', 'enraged', 'puncher'].includes(statusType);
                const effectTarget = isBuff ? attacker : target;
                if (effectTarget.applyStatusEffect(statusType, baseAtk)) {
                    logMessage(effectTarget.name + " est maintenant " + effectTarget.getStatusEffectName() + " !");
                    if (!attacker.isEnemy) game.checkSpecialQuests('statusInflicted');
                }
            }
        }
    }

    if (!wasUltimate && attacker.ultimateAbility) {
        if (attacker.ultimateCharge < attacker.ultimateAbility.chargeNeeded) {
            let charge = 12;
            if (attacker.passiveTalent === 'adrenaline') charge *= 2;
            if (game.arenaState.active) charge *= 1.5;
            attacker.ultimateCharge = Math.min(attacker.ultimateAbility.chargeNeeded, attacker.ultimateCharge + charge);
        }
    } else if (wasUltimate && attacker.ultimateAbility?.effect?.bonusCharge) {
        attacker.ultimateCharge = Math.min(attacker.ultimateAbility.chargeNeeded, attacker.ultimateCharge + attacker.ultimateAbility.effect.bonusCharge);
    }

    if (!attacker.isEnemy) {
        let regenPercent = 0;
        if (game.towerState.isActive && game.towerState.buffs && game.towerState.buffs.regen_percent) {
            regenPercent += game.towerState.buffs.regen_percent;
        }
        const collSyn = game.getCollectionBonuses ? game.getCollectionBonuses() : {};
        if ((collSyn.hp_regen_per_turn || 0) > 0) regenPercent += collSyn.hp_regen_per_turn;
        if (regenPercent > 0) {
            const maxHp = game.getPlayerMaxHp();
            const regenAmount = Math.floor(maxHp * regenPercent);
            if (regenAmount > 0 && attacker.mainAccountCurrentHp < maxHp) {
                attacker.mainAccountCurrentHp = Math.min(maxHp, attacker.mainAccountCurrentHp + regenAmount);
                if (showFloatingText) showFloatingText(`+${formatFloatingNumber(regenAmount)}`, document.getElementById('playerSpriteContainer'), 'ft-heal');
            }
        }
    }

    if (attackerPushedToDeath) {
        // Intercept logic for when attacker dies to recoil/thorns.
        // Return structured response or just true based on function usage.
        // For performAttackWithBonusLogic, returning true means target died. But if attacker died, we need special handling.
        // Easiest is to set attacker hp to 0, which the execution loop should catch on next turn, OR we forcefully call it.
        return { isDead: isDead, attackerDied: true };
    }

    return isDead;
}

// ============================================================
// WIN COMBAT
// ============================================================

function winCombatLogic(game) {
    if (!game.currentEnemy) {
        console.warn("⚠️ winCombat appelé sans ennemi actif. Ignoré.");
        return;
    }
    const isSimulation = window.logMessage && window.logMessage.toString().includes('function() {}');

    game.stats.combatsWon++;
    game.checkAchievements('combatsWon');
    game.checkAchievements('bossDefeated');
    game.checkAchievements('epicDefeated');
    const noDeath = game.faintedThisCombat ? game.faintedThisCombat.size === 0 : true;
    game.checkSpecialQuests('combatsWon', { noDeath: noDeath });

    if (!isSimulation && triggerAutoCatchLogic(game)) return;

    let shouldTriggerCapture = false;
    const isSpecialMode = game.towerState.isActive || game.arenaState.active;

    if (!isSpecialMode && !isSimulation) {
        const enemy = game.currentEnemy;
        if (!enemy) {
            console.warn("⚠️ winCombat appelé sans ennemi actif. Annulation de la capture.");
            game.finalizeCombat(false);
            return;
        }
        const isJackpot = enemy.isShiny || enemy.isRoaming;
        if (isJackpot) {
            if (game.pauseOnRare) shouldTriggerCapture = true;
        } else if (game.captureMode === 2) {
            if (game.captureTargets && game.captureTargets.includes(enemy.name)) shouldTriggerCapture = true;
            else if (game.captureTarget === enemy.name) shouldTriggerCapture = true;
        }
    }

    let hasAnyBall = false;
    if (shouldTriggerCapture) {
        const ballTypes = ['pokeball', 'greatball', 'hyperball', 'masterball'];
        hasAnyBall = ballTypes.some(type => (game.items[type] || 0) > 0);
    }

    if (shouldTriggerCapture && hasAnyBall) {
        game.startCapturePhase();
    } else {
        game.finalizeCombat(false);
    }
}

// ============================================================
// PLAYER CREATURE FAINTED
// ============================================================

function playerCreatureFaintedLogic(game) {
    const hasPhoenix = game.currentPlayerCreature.passiveTalent === 'phoenix';
    const hpToCheck = game.arenaState.active ? game.currentPlayerCreature.currentHp : game.currentPlayerCreature.mainAccountCurrentHp;

    if (hasPhoenix && Math.random() < 0.25) {
        const restoredHp = Math.floor(game.getPlayerMaxHp() * 0.5);
        if (game.arenaState.active) {
            game.currentPlayerCreature.currentHp = Math.floor(game.currentPlayerCreature.maxHp * 0.5);
        } else {
            game.currentPlayerCreature.mainAccountCurrentHp = restoredHp;
        }
        logMessage("🔥 PHOENIX ! " + game.currentPlayerCreature.name + " renaît de ses cendres !");
        game.updateCombatDisplay();
        return;
    }

    logMessage(game.currentPlayerCreature.name + " est KO !");
    game.currentPlayerCreature.berserkStacks = 0;
    game.faintedThisCombat.add(game.currentPlayerCreature.name);
    if (game.arenaState.active) game.currentPlayerCreature.currentHp = 0;

    let nextCreature = null;
    let nextIndex = -1;
    for (let i = 0; i < game.playerTeam.length; i++) {
        if (i === game.activeCreatureIndex) continue;
        const candidate = game.playerTeam[i];
        if (candidate.currentHp > 0 && !game.faintedThisCombat.has(candidate.name)) {
            nextCreature = candidate;
            nextIndex = i;
            break;
        }
    }

    if (!nextCreature) {
        if (game.towerState.isActive) {
            game.endTowerRun();
            return;
        }
        if (game.arenaState.active) {
            game.loseArena("Toute votre équipe a été vaincue !");
            return;
        }
        game.stats.combatsLost++;
        game.checkSpecialQuests('combat_lost');
        game.combatState = 'dead';
        game.lastCombatTime = Date.now();
        if (toast) toast.error('Défaite', 'Toute votre équipe est KO !', 2000);
        logMessage("Équipe hors de combat ! Récupération...");
        game.updateTeamDisplay();
        game.updateCombatDisplay();
        return;
    }

    game.currentPlayerCreature = nextCreature;
    game.activeCreatureIndex = nextIndex;
    game.currentPlayerCreature.recalculateStats();
    game.currentPlayerCreature.actionGauge = 0;
    game.currentPlayerCreature.ultimateCharge = 0;
    game.currentPlayerCreature.ultimateActive = false;
    if (!game.arenaState.active) {
        game.currentPlayerCreature.mainAccountCurrentHp = game.getPlayerMaxHp();
    }
    logMessage(`Go ! ${nextCreature.name} prend le relais !`);
    game.updateCombatDisplay();
    game.updateTeamDisplay();
}

// ============================================================
// TRIGGER AUTO CATCH
// ============================================================

function triggerAutoCatchLogic(game) {
    if (!game.currentEnemy) return false;
    if (!game.hasAutoCatcher) return false;
    if (game.towerState.isActive || game.arenaState.active) return false;

    const enemy = game.currentEnemy;
    const s = game.autoCatcherSettings || {};
    const autoTargetsEnabled = s.enabled !== false;
    const autoShinyEnabled = s.catchShiny !== false;
    const shinyOrRoamer = !!enemy.isShiny || !!enemy.isRoaming;

    const targets = [];
    if (Array.isArray(game.captureTargets)) targets.push(...game.captureTargets);
    if (game.captureTarget && !targets.includes(game.captureTarget)) targets.push(game.captureTarget);
    const shouldCatchTarget = autoTargetsEnabled && game.captureMode === 2 && targets.includes(enemy.name);
    const shouldCatchShiny = autoShinyEnabled && shinyOrRoamer;
    if (!shouldCatchTarget && !shouldCatchShiny) return false;

    const ballToUse = 'pokeball';
    if ((game.items[ballToUse] || 0) <= 0) return false;

    game.tryCapture(ballToUse);
    return true;
}

// ============================================================
// UPDATE ATB
// ============================================================

function updateATBLogic(game, deltaTime) {
    if (game.combatState !== 'fighting' || !game.currentEnemy || !game.currentPlayerCreature || game.isAttacking) return;

    const playerStats = game.getEffectiveStats();
    let playerSpeed = Number(playerStats.speed) || 1;
    if (game.currentPlayerCreature.hasStatusEffect()) {
        const pType = game.currentPlayerCreature.statusEffect.type;
        // ⚡ Paralysie : -25% de vitesse
        if (pType === 'paralyzed') playerSpeed *= 0.75;
    }

    let enemySpeed = Number(game.currentEnemy.speed) || 1;
    if (game.currentEnemy.hasStatusEffect()) {
        const eType = game.currentEnemy.statusEffect.type;
        // ⚡ Paralysie : -25% de vitesse
        if (eType === 'paralyzed') enemySpeed *= 0.75;
        if (eType === 'enraged') enemySpeed *= 1.15;
    }

    const maxSpeed = Math.max(playerSpeed, enemySpeed, 1);
    let baseTimeRef = GAME_SPEEDS ? GAME_SPEEDS.BASE_TURN_TIME : 1000;
    let BASE_TURN_TIME = (game.arenaState.active || game.towerState.active) ? baseTimeRef * 1.5 : baseTimeRef;

    const pThreshold = game.currentPlayerCreature.actionThreshold || 10000;
    const eThreshold = game.currentEnemy.actionThreshold || 10000;
    const pTickRate = pThreshold / BASE_TURN_TIME;
    const eTickRate = eThreshold / BASE_TURN_TIME;
    const playerGain = pTickRate * (playerSpeed / maxSpeed) * deltaTime;
    const enemyGain = eTickRate * (enemySpeed / maxSpeed) * deltaTime;

    if (Number.isFinite(playerGain)) game.currentPlayerCreature.actionGauge += playerGain;
    if (Number.isFinite(enemyGain)) game.currentEnemy.actionGauge += enemyGain;

    const maxGauge = 50000;
    if (game.currentPlayerCreature.actionGauge > maxGauge) game.currentPlayerCreature.actionGauge = maxGauge;
    if (game.currentEnemy.actionGauge > maxGauge) game.currentEnemy.actionGauge = maxGauge;

    processPendingAttacksLogic(game);
}

// ============================================================
// PROCESS PENDING ATTACKS & EXECUTE CREATURE TURN
// ============================================================

function processPendingAttacksLogic(game) {
    const now = Date.now();
    const p = game.currentPlayerCreature;
    const e = game.currentEnemy;
    if (!p || !e) return;

    const VISUAL_DELAY = 500;
    if (now - game.lastCombatTurnTime < VISUAL_DELAY) return;

    const pReady = p.actionGauge >= p.actionThreshold;
    const eReady = e.actionGauge >= e.actionThreshold;

    if (pReady && eReady) {
        if (p.actionGauge >= e.actionGauge) executeCreatureTurnLogic(game, p, e, true, now);
        else executeCreatureTurnLogic(game, e, p, false, now);
    } else if (pReady) {
        executeCreatureTurnLogic(game, p, e, true, now);
    } else if (eReady) {
        executeCreatureTurnLogic(game, e, p, false, now);
    }
}

function executeCreatureTurnLogic(game, attacker, target, isPlayer, now) {
    const PRE_DELAY = GAME_SPEEDS ? GAME_SPEEDS.PRE_ATTACK_DELAY : 500;
    const ANIM_DELAY = GAME_SPEEDS ? GAME_SPEEDS.ANIMATION_LOCK : 800;
    const threshold = attacker.actionThreshold || 10000;

    if (attacker.actionGauge >= threshold) {
        if (now - game.lastCombatTurnTime < PRE_DELAY) return;

        game.isAttacking = true;
        attacker.actionGauge -= threshold;
        game.lastCombatTurnTime = now;

        if (attacker.canAttack && !attacker.canAttack()) {
            let icon = "🚫";
            const type = attacker.statusEffect.type;
            if (type === 'frozen') icon = "❄️";
            else if (type === 'stunned') icon = "💫";
            else if (type === 'sleep') icon = "💤";
            const containerId = isPlayer ? 'playerSpriteContainer' : 'enemySpriteContainer';
            const container = document.getElementById(containerId);
            if (container && showFloatingText) showFloatingText(icon, container, 'ft-status');
            logMessage(`${attacker.name} est bloqué (${type}) et passe son tour !`);
            if (attacker.statusEffect.duration > 0) {
                attacker.statusEffect.duration--;
                if (attacker.statusEffect.duration <= 0) {
                    const oldType = attacker.statusEffect.type;
                    attacker.statusEffect = { type: 'none', duration: 0 };
                    logMessage(`✨ ${attacker.name} n'est plus ${oldType} !`);
                }
            }
            setTimeout(() => {
                game.isAttacking = false;
                processPendingAttacksLogic(game);
            }, 300);
            return;
        }

        // 🌟 AUTO-ULTIME : Lancer l'ultime automatiquement si prêt (tour du joueur)
        if (isPlayer && game.autoSelectEnabled && game.autoUltimate && attacker.ultimateAbility) {
            const ult = attacker.ultimateAbility;
            if (attacker.ultimateCharge >= ult.chargeNeeded && !attacker.ultimateActive) {
                game.activateUltimate();
            }
        }

        const attackResult = performAttackWithBonusLogic(game, attacker, target, game.arenaState.active ? null : game.playerMainStats, isPlayer, false);

        let isTargetDead = false;
        let isAttackerDead = false;

        if (typeof attackResult === 'object') {
            isTargetDead = attackResult.isDead;
            isAttackerDead = attackResult.attackerDied;
        } else {
            isTargetDead = attackResult;
        }

        setTimeout(() => {
            if (isAttackerDead) {
                game.isAttacking = false;
                // L'attaquant est mort de ses propres dégâts de recul / épines
                if (isPlayer) {
                    playerCreatureFaintedLogic(game);
                } else {
                    winCombatLogic(game);
                }
            } else if (isTargetDead) {
                game.isAttacking = false;
                if (isPlayer) winCombatLogic(game);
                else playerCreatureFaintedLogic(game);
            } else {
                game.isAttacking = false;

                // 🤖 AUTO-CHECKS après l'attaque (si auto activé et combat en cours)
                if (game.autoSelectEnabled && game.currentEnemy && game.combatState === 'fighting') {
                    if (isPlayer) {
                        // ⚡ Vérifier l'endurance après l'attaque du joueur
                        game.autoCheckStamina();
                    } else {
                        // 🔄 Vérifier le désavantage de type après l'attaque ennemie
                        game.autoCheckDisadvantage();
                    }
                }

                processPendingAttacksLogic(game);
            }
        }, ANIM_DELAY);
    }
}


// ============================================================
// HANDLE COMBAT (State Machine)
// ============================================================

function handleCombatLogic(game) {
    const now = Date.now();
    if (!game.lastCombatTime || isNaN(game.lastCombatTime) || game.lastCombatTime > now) game.lastCombatTime = now;

    if (game.arenaState.active && game.checkArenaTimeout) {
        if (game.checkArenaTimeout()) return;
    }

    if (game.combatState === 'dead') {
        if (now - game.lastCombatTime >= game.deathCooldown) {
            game.combatState = 'waiting';
            game.lastCombatTime = now;
            for (const creature of game.playerTeam) {
                creature.heal();
                creature.currentStamina = creature.maxStamina;
                creature.actionGauge = 0;
            }
            game.faintedThisCombat = new Set();
            game.currentPlayerCreature = game.getFirstAliveCreature();
            if (game.currentPlayerCreature) {
                game.activeCreatureIndex = game.playerTeam.indexOf(game.currentPlayerCreature);
                game.currentPlayerCreature.mainAccountCurrentHp = game.getPlayerMaxHp();
            }
            logMessage("Récupération terminée !");
            game.updateTeamDisplay();
            game.updateCombatDisplay();
        }
        return;
    }

    if (game.combatState === 'waiting') {
        const dynamicDelay = game.getSpawnDelay();
        if (now - game.lastCombatTime >= dynamicDelay) {
            if (!game.towerState.isActive && !game.arenaState.active) game.startCombat();
        }
    }

    if (game.combatState === 'starting') {
        if (now - game.combatStartTime >= game.combatStartDelay) {
            game.combatState = 'fighting';
            logMessage("Le combat commence !");
        }
    }
}

// ============================================================
// HANDLE SPECIAL MODE VICTORY
// ============================================================

function handleSpecialModeVictoryLogic(game) {
    if (game.arenaState.active) {
        game.arenaState.currentChampionIndex++;
        if (game.arenaState.currentChampionIndex >= game.arenaState.championTeam.length) {
            game.winArena();
        } else {
            game.currentEnemy = game.arenaState.championTeam[game.arenaState.currentChampionIndex];
            game.currentEnemy.clearStatusEffect();
            logMessage("Le champion envoie " + game.currentEnemy.name + " !");
            game.combatState = 'fighting';
        }
    } else if (game.towerState.isActive) {
        game.towerState.currentEnemyIndex++;
        if (game.towerState.currentEnemyIndex < game.towerState.enemyTeam.length) {
            game.currentEnemy = game.towerState.enemyTeam[game.towerState.currentEnemyIndex];
            game.combatState = 'starting';
            game.combatStartTime = Date.now();
            game.updateCombatDisplay();
            game.updateTeamDisplay();
        } else {
            game.nextTowerFloor();
        }
    }
}

// ============================================================
// TRY CAPTURE (Async - Logique principale)
// ============================================================

async function tryCaptureLogic(game, ballType, isBonusThrow) {
    if ((game.items[ballType] || 0) <= 0) {
        if (isBonusThrow) logMessage("⚡ Réflexe annulé : Plus de balles !");
        return;
    }

    const buttonsDiv = document.querySelector('.balls-grid');
    if (buttonsDiv) { buttonsDiv.style.pointerEvents = 'none'; buttonsDiv.style.opacity = '0.5'; }

    const recycleLevel = (game.upgrades && game.upgrades.recycle) ? game.upgrades.recycle.level : 0;
    const recycleChance = recycleLevel * 0.025;
    let ballSaved = false;
    if (Math.random() < recycleChance) {
        ballSaved = true;
        logMessage(`♻️ ${ballType} recyclée avec succès !`);
        if (toast) toast.success("Recyclage !", `${ballType} économisée ♻️`);
    }
    if (!ballSaved) game.items[ballType]--;
    if (game.updateItemsDisplay) game.updateItemsDisplay();

    const enemy = game.currentEnemy;
    if (!enemy) {
        if (buttonsDiv) { buttonsDiv.style.pointerEvents = 'auto'; buttonsDiv.style.opacity = '1'; }
        return;
    }

    const ballDef = BALLS ? BALLS[ballType] : { catchMult: 1, name: 'Ball', img: '' };
    const baseChance = (CATCH_RATES ? CATCH_RATES[enemy.rarity] : 0.1) || 0.1;
    let charmBonus = (game.currentPlayerCreature && game.currentPlayerCreature.passiveTalent === 'charmeur') ? 1.25 : 1.0;
    let catchRate = baseChance * ballDef.catchMult * charmBonus;
    if (ballType === 'masterball') catchRate = 1.0;

    let success = false;
    let shakes = 0;
    if (ballType === 'masterball') {
        success = true;
        shakes = 3;
    } else {
        const shakeProbability = Math.pow(catchRate, 0.25);
        success = true;
        for (let i = 1; i <= 3; i++) {
            if (Math.random() < shakeProbability) shakes++;
            else { success = false; break; }
        }
    }

    const spriteEl = document.querySelector('.capture-sprite');
    if (spriteEl && window.playCaptureSequence) {
        const ballImg = ballDef.img || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
        await window.playCaptureSequence(ballImg, spriteEl, success, shakes);
    }

    if (success) {
        document.getElementById('captureModal').classList.remove('show');
        if (buttonsDiv) { buttonsDiv.style.pointerEvents = 'auto'; buttonsDiv.style.opacity = '1'; }
        game.reflexActive = false;
        if (isBonusThrow) logMessage("⚡ Réflexe Éclair ! Capture réussie in extremis !");

        const trueRarity = game.getNaturalRarity(enemy.name);
        const capturedCreature = new Creature(enemy.name, enemy.type, enemy.level, trueRarity, false, enemy.isShiny, enemy.secondaryType);
        capturedCreature.ivHP = enemy.ivHP; capturedCreature.ivAttack = enemy.ivAttack;
        capturedCreature.ivSpAttack = enemy.ivSpAttack; capturedCreature.ivSpDefense = enemy.ivSpDefense;
        capturedCreature.ivDefense = enemy.ivDefense; capturedCreature.ivSpeed = enemy.ivSpeed;
        capturedCreature.recalculateStats();
        if (typeof game.addRocketTrustProgress === 'function') {
            game.addRocketTrustProgress('capture', 1, { species: capturedCreature.name });
        }

        game.stats.creaturesObtained++;
        if (capturedCreature.isShiny) {
            game.stats.shiniesObtained++;
            game.checkAchievements('shiniesObtained');
        }
        const isPerfect = (capturedCreature.ivHP >= 31 && capturedCreature.ivAttack >= 31 && capturedCreature.ivDefense >= 31 && capturedCreature.ivSpeed >= 31);
        if (isPerfect) {
            game.stats.perfectIvCount++;
            game.checkAchievements('perfectIvCount');
            if (capturedCreature.isShiny) {
                game.stats.perfectShinyCount++;
                game.checkAchievements('perfectShinyCount');
            }
        }
        const pokedexKey = capturedCreature.name + "_" + capturedCreature.type + "_" + capturedCreature.rarity;
        if (!game.pokedex[pokedexKey]) {
            game.pokedex[pokedexKey] = { discovered: true, count: 1, shinyCount: capturedCreature.isShiny ? 1 : 0, hasShiny: capturedCreature.isShiny, name: capturedCreature.name, type: capturedCreature.type, rarity: capturedCreature.rarity, firstDiscoveredAt: Date.now() };
            game.checkSpecialQuests('new_discovery');
        } else {
            game.pokedex[pokedexKey].count++;
            if (capturedCreature.isShiny) game.pokedex[pokedexKey].shinyCount++;
        }

        const existingCreature = game.findCreatureByName(capturedCreature.name, capturedCreature.isShiny);
        if (existingCreature) {
            game.checkSpecialQuests('fusion_completed', { species: capturedCreature.name });
            if (capturedCreature.rarity === 'rare' || trueRarity === RARITY.RARE) {
                game.checkSpecialQuests('rareObtained', { rarity: 'rare' });
            }
            const result = game.processFusion(capturedCreature, existingCreature);
            let msg = `🧬 CAPTURE FUSION : +${result.shards} Shards.`;
            if (result.ivImproved) msg += " IVs Améliorés !";
            logMessage(msg);
            if (toast) toast.success("Capture Fusion", `+${result.shards} Shards` + (result.ivImproved ? " & Stats Up" : ""));
        } else {
            const maxTeamSize = 6 + game.getAccountTalentBonus('team_slot');
            if (game.playerTeam.length < maxTeamSize) {
                game.playerTeam.push(capturedCreature);
                logMessage(`🎯 ${capturedCreature.name} rejoint l'équipe !`);
            } else {
                game.storage.push(capturedCreature);
                logMessage(`🎯 ${capturedCreature.name} envoyé au stockage !`);
            }
            game.checkSpecialQuests('creature_obtained', { creatureType: capturedCreature.type, secondaryType: capturedCreature.secondaryType });
            game.checkSpecialQuests('creature_captured', { species: capturedCreature.name });
            if (capturedCreature.rarity === 'rare' || trueRarity === RARITY.RARE) {
                game.checkSpecialQuests('rareObtained', { rarity: 'rare' });
            }
            if (trueRarity === RARITY.LEGENDARY && toast) toast.legendary("LÉGENDAIRE", `${capturedCreature.name} capturé !`);
            else if (trueRarity === RARITY.EPIC && toast) toast.info("EPIC", `${capturedCreature.name} capturé !`);
            else if (toast) toast.success("Capture Réussie", `${capturedCreature.name} ajouté !`);
        }
        game.finalizeCombat(true);
    } else {
        let failMsg = `${enemy.name} s'est libéré !`;
        if (shakes === 0) failMsg = `La balle a cassé tout de suite !`;
        if (shakes === 1) failMsg = `Une secousse... et ça casse.`;
        if (shakes === 2) failMsg = `Argh ! ${enemy.name} y était presque !`;
        if (shakes === 3) failMsg = `INCROYABLE ! Il s'est libéré au dernier moment !`;

        if (!game.reflexActive) {
            const reflexLevel = (game.upgrades && game.upgrades.second_chance) ? game.upgrades.second_chance.level : 0;
            if (reflexLevel > 0 && Math.random() < reflexLevel * 0.01) {
                game.reflexActive = true;
                logMessage(`⚡ RÉFLEXE ACTIVÉ ! Choisissez une nouvelle Ball !`);
                if (toast) toast.info("Réflexe Éclair", "Seconde chance ! Choisissez une Ball ⚡");
                if (buttonsDiv) { buttonsDiv.style.pointerEvents = 'auto'; buttonsDiv.style.opacity = '1'; }
                return;
            }
        }
        game.reflexActive = false;
        document.getElementById('captureModal').classList.remove('show');
        if (buttonsDiv) { buttonsDiv.style.pointerEvents = 'auto'; buttonsDiv.style.opacity = '1'; }
        if (toast) toast.error("Échec...", failMsg);
        logMessage(`💨 ${failMsg}`);
        game.finalizeCombat(false);
    }
}

// ============================================================
// EXPORTS GLOBAUX
// ============================================================

window.performAttackWithBonusLogic = performAttackWithBonusLogic;
window.winCombatLogic = winCombatLogic;
window.playerCreatureFaintedLogic = playerCreatureFaintedLogic;
window.triggerAutoCatchLogic = triggerAutoCatchLogic;
window.updateATBLogic = updateATBLogic;
window.processPendingAttacksLogic = processPendingAttacksLogic;
window.executeCreatureTurnLogic = executeCreatureTurnLogic;
window.handleCombatLogic = handleCombatLogic;
window.handleSpecialModeVictoryLogic = handleSpecialModeVictoryLogic;
window.tryCaptureLogic = tryCaptureLogic;
