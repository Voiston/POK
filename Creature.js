/**
 * @file creature.js
 * Toutes les classes liées aux créatures du jeu
 */

// ====== CLASSE CREATURE ======
class Creature {
    // ✅ REMPLACEZ L'INTÉGRALITÉ DU CONSTRUCTOR DANS Creature.js PAR CECI

    constructor(name, type, level = 1, rarity = RARITY.COMMON, isEnemy = false, isShiny = false, secondaryType = null, isBoss = false, isEpic = false) {
        this.name = name;
        this.type = type;
        this.secondaryType = secondaryType;
        this.level = level;
        this.rarity = rarity;
        this.isEnemy = isEnemy;
        this.isShiny = isShiny;
        this.isBoss = isBoss;   
        this.isEpic = isEpic;  
        this.exp = 0;
        this.expToNext = this.getExpToNext();
        this.prestige = 0;
        this.tier = 0;
        this.passiveTalent = null;
		this.heldItem = null;
		this.berserkStacks = 0;
		this.prestigeTokens = 0; // Jetons à dépenser
    this.prestigeBonuses = { hp: 0, attack: 0, defense: 0, spattack: 0, spdefense: 0, speed: 0 }; // Jetons dépensés (1 = +10%)
   
		
        const generateWeightedIV = () => {
            return Math.floor(Math.pow(Math.random(), 3) * 32);
        };

        this.ivHP = generateWeightedIV();
        this.ivAttack = generateWeightedIV();
        this.ivSpAttack = generateWeightedIV();
        this.ivDefense = generateWeightedIV();
        this.ivSpDefense = generateWeightedIV();
        this.ivSpeed = generateWeightedIV();
        
        // Assignation de l'ultime
        let abilityDef = POKEMON_ULTIMATE_ABILITIES[this.name];
        if (!abilityDef) {
            if (this.rarity === RARITY.LEGENDARY) {
                abilityDef = GENERIC_ULTIMATES[RARITY.LEGENDARY];
            } else if (this.rarity === RARITY.EPIC) {
                abilityDef = GENERIC_ULTIMATES[RARITY.EPIC];
            } else if (this.rarity === RARITY.RARE) {
                abilityDef = GENERIC_ULTIMATES[RARITY.RARE];
            } else {
                abilityDef = GENERIC_ULTIMATES[RARITY.COMMON];
            }
        }
        this.ultimateAbility = abilityDef;
        this.ultimateCharge = 0;
        this.ultimateActive = false; 
		
        this.statusEffect = {
            type: STATUS_EFFECTS.NONE,
            duration: 0,
            sourceAttack: 0
        };
        
        // Assigner un talent
        if (!isEnemy && (rarity === RARITY.EPIC || rarity === RARITY.LEGENDARY)) {
            this.assignRandomTalent();
        }
        
		
        // Calculer les stats
        const baseStats = this.getBaseStats();
		baseStats.hp += this.ivHP;
        baseStats.attack += this.ivAttack;
        baseStats.spattack += this.ivSpAttack;
        baseStats.defense += this.ivDefense;
        baseStats.spdefense += this.ivSpDefense;
        baseStats.speed += this.ivSpeed;
        const rarityMultiplier = RARITY_MULTIPLIERS[this.rarity];
        const prestigeMultiplier = 1 + (this.prestige * 0.25);
        const tierMultiplier = this.isEnemy ? Math.pow(1.0033, this.tier) : 1;
        const shinyMultiplier = this.isShiny ? 1.5 : 1;
        
        this.maxHp = Math.floor(baseStats.hp * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier);
        this.currentHp = this.maxHp;
        this.attack = Math.floor(baseStats.attack * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier);
        this.spattack = Math.floor(baseStats.spattack * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier);
        this.defense = Math.floor(baseStats.defense * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier);
        this.spdefense = Math.floor(baseStats.spdefense * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier);
        this.speed = Math.floor(baseStats.speed * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier);
        
        this.maxStamina = 3 + Math.floor(RARITY_STAMINA_BONUS[this.rarity] + (this.level / 6));
        this.currentStamina = this.maxStamina;
        this.actionGauge = 0; 
		this.actionThreshold = 10000;
        this.zoneMultiplier = 1;
        this.mainAccountCurrentHp = 0;
    }
    
  getBaseStats() {
        // Cette fonction vient du fichier pokemonStats.js
        // Elle va chercher les bonnes stats pour le nom du Pokémon actuel
        return getPokemonBaseStats(this.name, this.level);
    }
    
    getExpToNext() {
        // Formule de base
        const baseExp = Math.floor((200 * Math.pow(1.02, this.level))+(this.level*this.level));
        
        // Récupérer le multiplicateur de rareté (1.0 par défaut si non trouvé)
        const rarityMultiplier = (typeof XP_CURVE_MULTIPLIERS !== 'undefined' && XP_CURVE_MULTIPLIERS[this.rarity]) 
                                 ? XP_CURVE_MULTIPLIERS[this.rarity] 
                                 : 1.0;

        // Appliquer le multiplicateur
        return Math.floor(baseExp * rarityMultiplier);
    }
    
   gainExp(amount) {
        // Vérification de l'Oeuf Chance
        let finalAmount = amount;
        if (this.heldItem === 'lucky_egg') {
            finalAmount = Math.floor(amount * 2); // +100% XP
        }

        this.exp += finalAmount;
        // ... le reste de la fonction gainExp reste inchangé ...
        const maxLevel = 100 + (this.prestige * 10);
        let leveledUp = false;
        while (this.exp >= this.expToNext && this.level < maxLevel) {
            this.exp -= this.expToNext;
            this.levelUp();
            leveledUp = true;
        }
        if (this.level >= maxLevel) this.exp = 0;
        return leveledUp;
    }
    
    levelUp() {
        this.level++;
        this.expToNext = this.getExpToNext();
        
        const oldMaxHp = this.maxHp;
        const baseStats = this.getBaseStats();
		baseStats.hp += this.ivHP;
        baseStats.attack += this.ivAttack;
        baseStats.spattack += this.ivSpAttack;
        baseStats.defense += this.ivDefense;
        baseStats.spdefense += this.ivSpDefense;
        baseStats.speed += this.ivSpeed;
        const rarityMultiplier = RARITY_MULTIPLIERS[this.rarity];
        const prestigeMultiplier = 1 + (this.prestige * 0.25);
        const shinyMultiplier = this.isShiny ? 1.1 : 1;
        
        this.maxHp = Math.floor(baseStats.hp * rarityMultiplier * prestigeMultiplier * shinyMultiplier);
        this.attack = Math.floor(baseStats.attack * rarityMultiplier * prestigeMultiplier * shinyMultiplier);
        this.spattack = Math.floor(baseStats.spattack * rarityMultiplier * prestigeMultiplier * shinyMultiplier);
        this.defense = Math.floor(baseStats.defense * rarityMultiplier * prestigeMultiplier * shinyMultiplier);
        this.spdefense = Math.floor(baseStats.spdefense * rarityMultiplier * prestigeMultiplier * shinyMultiplier);
        this.speed = Math.floor(baseStats.speed * rarityMultiplier * prestigeMultiplier * shinyMultiplier);
        
        const hpGain = this.maxHp - oldMaxHp;
        this.currentHp += hpGain;
		
		this.maxStamina = 3 + Math.floor(RARITY_STAMINA_BONUS[this.rarity] + (this.level / 6));
    this.currentStamina = this.maxStamina; // On remplit l'endurance au max à chaque level up

    }
    
    assignRandomTalent() {
        // Choix de la liste selon la rareté
        const talentPool = this.rarity === RARITY.LEGENDARY ? LEGENDARY_TALENTS : EPIC_TALENTS;
        
        // Tirage aléatoire
        const randomIndex = Math.floor(Math.random() * talentPool.length);
        this.passiveTalent = talentPool[randomIndex];
    }
    
    getTalentInfo() {
        if (!this.passiveTalent) return null;
        return PASSIVE_TALENTS[this.passiveTalent];
    }
    
    // OPTIMISATION : Gestion Dégâts Universelle (Fix Arène & Affichage)
    takeDamage(damage, playerMainStats = null, isCritical = false, damageCategory = 'physical') {
        // 1. Esquive (Agile)
        if (this.hasStatusEffect() && this.statusEffect.type === STATUS_EFFECTS.AGILE) {
            if (this.statusEffect.dodgeCount < 2 && Math.random() < 0.50) { 
                 this.statusEffect.dodgeCount++;
                 return false; 
            }
        }
        
        // 2. Talent Robustesse (Anti-One-Shot)
        // On détermine les PV Max selon le mode
        let currentHpVal, maxHpVal;
        if (!this.isEnemy) {
            // Si Arène : PV Individuels, Sinon : PV Compte
            const isArena = (game && game.arenaState.active);
            currentHpVal = isArena ? this.currentHp : this.mainAccountCurrentHp;
            maxHpVal = isArena ? this.maxHp : game.getPlayerMaxHp();
        } else {
            currentHpVal = this.currentHp;
            maxHpVal = this.maxHp;
        }

        const isFullLife = currentHpVal >= maxHpVal * 0.99;

        // 3. Calcul Renvoi (Thorns / Casque Brut)
        let reflectedDamage = 0;
        if (this.hasStatusEffect() && this.statusEffect.type === STATUS_EFFECTS.THORNY) {
            reflectedDamage += Math.floor(damage * 0.30);
        }
        if (this.heldItem === 'rocky_helmet' && typeof HELD_ITEMS !== 'undefined') {
            reflectedDamage += Math.floor(damage * (HELD_ITEMS['rocky_helmet']?.effect?.reflect_mult || 0));
        }

        // --- 4. APPLICATION DES DÉGÂTS (Le Fix est ici) ---
        
        // CAS A : C'est le JOUEUR qui prend les dégâts
        if (!this.isEnemy) {
            
            // Réduction des PV du Joueur
            if (game && game.arenaState.active) {
                this.currentHp = Math.max(0, this.currentHp - damage);
            } else {
                this.mainAccountCurrentHp = Math.max(0, this.mainAccountCurrentHp - damage);
            }

            // Affichage (couleur selon catégorie : physique ou spécial)
            const damageTypeClass = (damageCategory === 'special') ? 'ft-damage-special' : 'ft-damage-physical';
            window.showFloatingText(formatFloatingNumber(damage), document.getElementById('playerSpriteContainer'), `ft-damage-player ${damageTypeClass}`, isCritical);
            
            if (game) game.stats.totalDamageTaken += damage;
            
            // ✅ C'EST ICI QU'ON APPLIQUE LE FIX (Renvoi de dégâts vers l'ennemi)
            if (reflectedDamage > 0 && game && game.currentEnemy) {
                // 1. L'ennemi prend les dégâts
                game.currentEnemy.currentHp = Math.max(0, game.currentEnemy.currentHp - reflectedDamage);
                const reflTypeClass = (damageCategory === 'special') ? 'ft-damage-special' : 'ft-damage-physical';
                window.showFloatingText("💢" + formatFloatingNumber(reflectedDamage), document.getElementById('enemySpriteContainer'), `ft-damage-enemy ${reflTypeClass}`);
                
                // 💀 2. VÉRIFICATION IMMÉDIATE DE LA MORT DE L'ENNEMI 💀
                // Si l'ennemi se tue en tapant, on déclenche la victoire tout de suite.
                if (!game.currentEnemy.isAlive()) {
                    logMessage(`💀 ${game.currentEnemy.name} s'est tué sur vos épines !`);
                    
                    // On appelle la fonction de victoire du GameManager
                    // (Assurez-vous que cette méthode est accessible)
                    game.winCombat(); 
                    
                    return false; // On retourne false pour dire "Le joueur n'est pas mort", le combat est fini.
                }
            }
            
            // Vérification Mort du Joueur (Si l'ennemi a survécu à ses propres dégâts)
            if (game && game.arenaState.active) return this.currentHp <= 0;
            return this.mainAccountCurrentHp <= 0;
        }
        
        // CAS B : C'est l'ENNEMI qui prend les dégâts
        else {
            this.currentHp = Math.max(0, this.currentHp - damage);
            
            // Affichage (couleur selon catégorie : physique ou spécial)
            const damageTypeClass = (damageCategory === 'special') ? 'ft-damage-special' : 'ft-damage-physical';
            window.showFloatingText(formatFloatingNumber(damage), document.getElementById('enemySpriteContainer'), `ft-damage-enemy ${damageTypeClass}`, isCritical);
            
            // Renvoi de dégâts vers le joueur (Si l'ennemi a des épines)
            if (reflectedDamage > 0 && game && game.currentPlayerCreature) {
                const player = game.currentPlayerCreature;
                
                if (game.arenaState.active) {
                    player.currentHp = Math.max(0, player.currentHp - reflectedDamage);
                } else {
                    player.mainAccountCurrentHp = Math.max(0, player.mainAccountCurrentHp - reflectedDamage);
                }
                const reflTypeClass = (damageCategory === 'special') ? 'ft-damage-special' : 'ft-damage-physical';
                window.showFloatingText("💢" + formatFloatingNumber(reflectedDamage), document.getElementById('playerSpriteContainer'), `ft-damage-player ${reflTypeClass}`);
                
                // Optionnel : Vérifier si le joueur meurt sur le coup des épines ennemies
                // (Généralement géré par la boucle de jeu suivante, mais vous pouvez l'ajouter ici aussi)
            }
            
            if (game) game.stats.totalDamageDealt += damage;
            return this.currentHp <= 0;
        }
    }
	/**
     * Calcule les dégâts finaux d'une attaque (Logique centralisée)
     * @param {Creature|Object} attacker - L'attaquant (ou un proxy avec stats modifiées)
     * @param {Creature} target - La cible
     * @param {Object} options - Options { isCritical, ultMultiplier, ignoreDefensePct, gameContext }
     */
    static calculateDamageOutput(attacker, target, options = {}) {
        const { 
            isCritical = false, 
            ultMultiplier = 1.0, 
            ignoreDefensePct = 0,
            attackCategory = 'physical',
            movePower = 50, // Puissance par défaut (ex: Charge)
            gameContext = null 
        } = options;

        // 1. Attaque (On utilise la valeur du proxy qui contient déjà les boosts Tour/Potions)
        const attack = attackCategory === 'special' ? attacker.spattack : attacker.attack;

        // 2. Défense (Cible)
        let defense = attackCategory === 'special' ? target.spdefense : target.defense;

        // Si la cible est le joueur, on s'assure d'avoir la défense effective (avec buffs)
        if (!target.isEnemy && gameContext && gameContext.getEffectiveStats) {
            const playerStats = gameContext.getEffectiveStats();
            defense = attackCategory === 'special' ? playerStats.spdefense : playerStats.defense;
        }

        // Application Pénétration d'Armure (Ultime / Talent)
        if (ignoreDefensePct > 0) {
            defense = Math.floor(defense * (1 - ignoreDefensePct));
        }

        // 3. Efficacité de Type
        let effectiveness = 1.0;
        if (typeof TYPE_EFFECTIVENESS !== 'undefined') {
            const type1 = TYPE_EFFECTIVENESS[attacker.type]?.[target.type] || 1;
            effectiveness *= type1;
            
            if (target.secondaryType) {
                const type2 = TYPE_EFFECTIVENESS[attacker.type]?.[target.secondaryType] || 1;
                effectiveness *= type2;
            }
        }

        // 4. STAB (Bonus de même type)
        // Note: Dans ce système, l'attaquant utilise toujours son propre type, donc STAB actif.
        let stab = 1.2; 
        
        // Bonus Talent "Maître Élémentaire" (Si disponible)
        if (!attacker.isEnemy && gameContext && gameContext.getTalentStackBonus) {
             const maitreBonus = gameContext.getTalentStackBonus('maitre');
             if (maitreBonus > 0) stab *= (1 + maitreBonus);
        }

        // 5. Multiplicateurs Finaux
        let multiplier = ultMultiplier * effectiveness * stab;

        // 🎯 Objet tenu : Ceinture Pro (Expert Belt)
        // Bonus si l'attaque est super efficace (effectiveness > 1)
        if (effectiveness > 1 && attacker.heldItem === 'expert_belt' && typeof HELD_ITEMS !== 'undefined') {
            const bonus = HELD_ITEMS['expert_belt']?.effect?.super_effective_bonus || 0;
            if (bonus > 0) {
                multiplier *= (1 + bonus);
            }
        }
        
        // ✅ CORRECTION CRITIQUE (x2 ou x3 avec Sniper)
        if (isCritical) {
            if (attacker.passiveTalent === 'sniper') {
                multiplier *= 3.0; // Sniper
            } else {
                multiplier *= 2.0; // Standard (était 1.5 avant, c'était une erreur)
            }
        }

        // Talent Opportuniste (Si cible a un statut)
        if (attacker.passiveTalent === 'opportuniste' && target.hasStatusEffect && target.hasStatusEffect()) {
            multiplier *= 1.5;
        }
        
        // Endurance (Malus si vide et pas de Robustesse)
        if (!attacker.isEnemy && attacker.currentStamina <= 0 && attacker.passiveTalent !== 'robustesse') {
            multiplier *= 0.7;
        }

        // 6. Calcul Final
        const power = movePower || 50;
        const rawDamage = attack * (power / 100) * multiplier;
        
        // Mitigation : Dégâts réduits par la défense (Ratio 1.25)
        // ✅ SÉCURITÉ : Ajout de +1 pour éviter la division par zéro
        const mitigationRatio = attack / (attack + (defense * 1.5) + 1);
        
        let finalDamage = Math.floor(rawDamage * mitigationRatio);
        
        // Minimum proportionnel à la puissance : préserve le ratio entre moves (ex. 80/60 = 4/3).
        // Formule: min = round(power/20) → 40→2, 60→3, 80→4, 100→5. Ainsi 60 vs 80 donnent 3 vs 4.
        const minDamageFromPower = Math.max(1, Math.round(power / 20));
        return Math.max(minDamageFromPower, finalDamage);
    }
	
    heal() {
        this.currentHp = this.maxHp;
    }
    
    isAlive() {
        return this.currentHp > 0;
    }
    
   // OPTIMISATION : Formule Unifiée (Ratio Dynamique) + Tous les Talents & Fixs
    // OPTIMISATION : Formule Unifiée (Ratio Défense Renforcé x1.25) + Tous Talents
    performAttack(target, playerMainStats = null, isPlayerAttacking = false, game = null) {
        
        // 1. Confusion
        if (this.hasStatusEffect() && this.statusEffect.type === STATUS_EFFECTS.CONFUSED) {
            if (Math.random() < 0.30) {
                const selfDamage = Math.floor(this.attack * 0.5);
                const died = this.takeDamage(selfDamage, playerMainStats, false);
                
                const container = this.isEnemy ? document.getElementById('enemySpriteContainer') : document.getElementById('playerSpriteContainer');
                if(container) window.showFloatingText("😵", container, 'ft-status');
                
                logMessage(this.name + " est confus et se blesse ! (" + selfDamage + " dégâts)");
                return died;
            }
        }
        
        // 2. Statut Bloquant
        if (!this.canAttack()) {
            let icon = "🚫";
            const type = this.statusEffect.type;
            if (type === STATUS_EFFECTS.FROZEN) icon = "❄️";
            else if (type === STATUS_EFFECTS.STUNNED) icon = "💫";
            else if (type === STATUS_EFFECTS.PARALYZED) icon = "⚡";
            else if (type === STATUS_EFFECTS.SCARED) icon = "😱";

            const container = this.isEnemy ? document.getElementById('enemySpriteContainer') : document.getElementById('playerSpriteContainer');
            if (container) window.showFloatingText(icon, container, 'ft-status');

            logMessage(this.name + " ne peut pas attaquer ! (" + this.getStatusEffectName() + ")");

            this.statusEffect.duration++;
            if (Math.random() < this.getStatusRemovalChance()) {
                this.clearStatusEffect();
                if (container) window.showFloatingText("LIBÉRÉ !", container, 'ft-heal');
                logMessage(this.name + " s'est libéré de " + type + " !");
            }

            return false;
        }

        const moveName = POKEMON_DEFAULT_MOVES[this.name] || 'Charge';
        const move = MOVES_DB[moveName];
        
        // 3. Calculs
        const maitreBonus = game ? game.getTalentStackBonus('maitre') : 0;
        
        let effectiveness = TYPE_EFFECTIVENESS[this.type]?.[target.type] || 1;
        if (target.secondaryType) effectiveness *= (TYPE_EFFECTIVENESS[this.type]?.[target.secondaryType] || 1);
        
        const attackMultiplier = this.getAttackMultiplier();
        
        let attackStat = !this.isEnemy && playerMainStats ? playerMainStats.attack : this.attack;
        attackStat = Math.floor(attackStat * attackMultiplier);
        
        let spAttackStat = !this.isEnemy && playerMainStats ? playerMainStats.spattack : this.spattack;
        spAttackStat = Math.floor(spAttackStat * attackMultiplier);

        let damage = Creature.calculateDamageOutput(
            { ...this, attack: attackStat, spattack: spAttackStat },
            target,
            {
                attackCategory: move.category,
                movePower: move.power,
                gameContext: game
            }
        );
        
        // 5. Application Coûts & Bonus (Endurance)
        if (!this.isEnemy && this.currentStamina > 0) {
            this.currentStamina--;
        }
        
        // Bonus de dégâts (Talents de compte + Collection Synergies - Joueur uniquement)
        if (game && !this.isEnemy && target.isEnemy) {
            const collDmg = (game.getCollectionSynergyBonuses ? game.getCollectionSynergyBonuses() : {}).damage_mult || 0;
            const damageBonus = 1 + game.getAccountTalentBonus('damage_mult') + collDmg;
            damage = Math.floor(damage * damageBonus);
        }
        
        // Réduction de dégâts (Talents de compte - Ennemi attaque joueur)
        if (game && this.isEnemy && !target.isEnemy) {
            const damageReduction = 1 - game.getAccountTalentBonus('damage_reduction');
            damage = Math.floor(damage * damageReduction);
        }
        
        let originalMaxHp = target.maxHp;
        if (target.hasStatusEffect && target.hasStatusEffect() && target.statusEffect.type === STATUS_EFFECTS.THORNY) {
            target.maxHp = Math.floor(originalMaxHp * 1.50);
        }
        
        const isBigHit = false;
        const isDead = target.takeDamage(damage, playerMainStats, isBigHit, move.category);
        
        // Talent Vampire
        if (this.passiveTalent === 'vampire') {
            const vampireHeal = Math.floor(damage * 0.20);
            if (vampireHeal > 0) {
                if (this.isEnemy) {
                    this.currentHp = Math.min(this.maxHp, this.currentHp + vampireHeal);
                    const container = document.getElementById('enemySpriteContainer');
                    if(container) window.showFloatingText(`+${formatFloatingNumber(vampireHeal)}`, container, 'ft-heal');
                } else if (playerMainStats) {
                    const maxHp = game.getPlayerMaxHp();
                    this.mainAccountCurrentHp = Math.min(maxHp, this.mainAccountCurrentHp + vampireHeal);
                }
            }
        }

        if (target.hasStatusEffect && target.hasStatusEffect() && target.statusEffect.type === STATUS_EFFECTS.THORNY) {
            target.maxHp = originalMaxHp;
        }
        
        if (this.hasStatusEffect() && this.statusEffect.type === STATUS_EFFECTS.PUNCHER) {
            this.clearStatusEffect();
        }

        // Talent Berserker
        if (this.passiveTalent === 'berserker' && (this.berserkStacks || 0) < 10) {
            this.berserkStacks = (this.berserkStacks || 0) + 1;
        }
        
        // Logs
        let message = this.name + " attaque " + target.name + " pour <span class=\"damage-" + this.type + "\">" + damage + " degats</span>";
        if (effectiveness > 1) message += " (Super efficace!)";
        if (effectiveness < 1) message += " (Peu efficace...)";
        if (attackMultiplier > 1) message += " [Buff +" + ((attackMultiplier - 1) * 100).toFixed(0) + "%]";
        
        if (maitreBonus > 0 && game) {
            const maitreCount = game.playerTeam.filter(c => c.passiveTalent === 'maitre').length;
            message += ` [Maître x${maitreCount}]`;
        }
        
        logMessage(message);
		
        // Proc Statuts
        if (!isDead && !target.hasStatusEffect()) {
            let procChance = STATUS_PROC_CHANCES[this.rarity] || 0;
            if (!this.isEnemy && game) procChance += game.getStatusProcBonus();
            
            if (Math.random() < procChance) {
                const statusType = TYPE_TO_STATUS[this.type];
                if (statusType) {
                    const sourceAttack = !this.isEnemy && playerMainStats ? playerMainStats.attack : this.attack;
                    const isBuffEffect = [STATUS_EFFECTS.REINFORCED, STATUS_EFFECTS.AGILE, STATUS_EFFECTS.THORNY, STATUS_EFFECTS.ENRAGED, STATUS_EFFECTS.PUNCHER].includes(statusType);
                    const effectTarget = isBuffEffect ? this : target;
                    
                    if (effectTarget.applyStatusEffect(statusType, sourceAttack)) {
                        const bonusText = game && game.getStatusProcBonus() > 0 ? " [Catalyseur]" : "";
                        logMessage(effectTarget.name + " est maintenant " + effectTarget.getStatusEffectName() + " !" + bonusText);
                    }
                }
            }
        }

        return isDead;
    }
    
    hasStatusEffect() {
        return this.statusEffect.type !== STATUS_EFFECTS.NONE;
    }

    applyStatusEffect(statusType, sourceAttack) {
        if (this.hasStatusEffect()) return false;
        
        this.statusEffect = {
            type: statusType,
            duration: 0,
            sourceAttack: sourceAttack,
            dodgeCount: statusType === STATUS_EFFECTS.AGILE ? 0 : undefined,
            attackReduction: statusType === STATUS_EFFECTS.SCARED ? 0.10 : undefined
        };
        return true;
    }

    clearStatusEffect() {
        this.statusEffect = {
            type: STATUS_EFFECTS.NONE,
            duration: 0,
            sourceAttack: 0
        };
    }

    // OPTIMISATION : Équilibrage des durées (Le Gel part plus vite car il bloque l'action)
    getStatusRemovalChance() {
        const type = this.statusEffect.type;
        const tick = this.statusEffect.duration;
        
        // ❄️ GEL (Accéléré) : Chance de partir dès le début pour ne pas bloquer le jeu
        if (type === STATUS_EFFECTS.FROZEN) {
            if (tick === 0) return 0.20; // 20% de chance immédiate
            if (tick === 1) return 0.50; // 50% au tour suivant
            if (tick === 2) return 0.80; // 80% ensuite
            return 1.0;                  // Fini au 3ème tour max
        }

        // 🔥 BRÛLURE (Standard DoT)
        if (type === STATUS_EFFECTS.BURNED) {
            if (tick === 0) return 0;
            if (tick === 1) return 0.25;
            if (tick === 2) return 0.50;
            if (tick === 3) return 0.75;
            return 1.0;
        }
        
        // ☣️ POISON (Persistant)
        if (type === STATUS_EFFECTS.POISONED) {
            if (tick === 0) return 0;
            if (tick === 1) return 0.15;
            if (tick === 2) return 0.30;
            if (tick === 3) return 0.45;
            if (tick === 4) return 0.60;
            if (tick === 5) return 0.75;
            return 0.90; // Le poison peut durer très longtemps
        }
        
        // ⚡ PARALYSIE (Fixe après 10 tours)
        if (type === STATUS_EFFECTS.PARALYZED) {
            if (tick >= 10) return 1.0;
            return 0; // La paralysie est souvent permanente jusqu'au soin
        }
        
        // 💫 ÉTOURDISSEMENT (Court terme)
        if (type === STATUS_EFFECTS.STUNNED) {
            return 1.0; // Dure généralement 1 tour ou géré par un compteur spécifique
        }
        
        // AUTRES (Buffs/Debuffs temporaires)
        if (type === STATUS_EFFECTS.CONFUSED || 
            type === STATUS_EFFECTS.REINFORCED || 
            type === STATUS_EFFECTS.THORNY || 
            type === STATUS_EFFECTS.ENRAGED) {
            if (tick >= 3) return 1.0;
            return 0;
        }
        
        if (type === STATUS_EFFECTS.SCARED) {
            if (tick >= 4) return 1.0;
            return 0;
        }
        
        if (type === STATUS_EFFECTS.AGILE) {
            if (tick >= 4) return 1.0;
            return 0;
        }
        
        if (type === STATUS_EFFECTS.PUNCHER) {
            return 1.0; // Dure 1 seule attaque
        }
        
        return 0;
    }

   // ✅ REMPLACEZ L'INTÉGRALITÉ de votre fonction processStatusEffect
    processStatusEffect(game) {
        if (!this.hasStatusEffect()) return { damage: 0, isDead: false };
        
        let damage = 0;
        let isDead = false;
        const type = this.statusEffect.type;
        const playerMainStats = (game && game.playerMainStats) ? game.playerMainStats : null;

        // ✅ MODIFIÉ : Détermine la bonne cible pour le FCT
        const targetContainerId = (this.isEnemy) ? 'enemySpriteContainer' : 'playerSpriteContainer';
        const targetContainer = document.getElementById(targetContainerId);

        if (type === STATUS_EFFECTS.BURNED) {
            damage = Math.floor(this.statusEffect.sourceAttack * 0.10);
            isDead = this.takeDamage(damage, playerMainStats);
            
            // ✅ MODIFIÉ : S'affiche sur la bonne cible
            if (targetContainer) {
                window.showFloatingText('🔥' + formatFloatingNumber(damage), targetContainer, 'ft-status');
            }

        } else if (type === STATUS_EFFECTS.POISONED) {
            damage = Math.floor(this.statusEffect.sourceAttack * 0.05);
            isDead = this.takeDamage(damage, playerMainStats);
            
            // ✅ MODIFIÉ : S'affiche sur la bonne cible
            if (targetContainer) {
                window.showFloatingText('☣️' + formatFloatingNumber(damage), targetContainer, 'ft-status');
            }

        } else if (type === STATUS_EFFECTS.THORNY) {
            const heal = Math.floor(this.maxHp * 0.02);
            
            if (game && game.currentPlayerCreature === this && this.mainAccountCurrentHp !== undefined) {
                const maxHp = game.getPlayerMaxHp ? game.getPlayerMaxHp() : this.maxHp;
                this.mainAccountCurrentHp = Math.min(maxHp, this.mainAccountCurrentHp + heal);
                // ✅ MODIFIÉ : S'affiche sur la bonne cible (le joueur)
                if (targetContainer) {
                    window.showFloatingText(`+${formatFloatingNumber(heal)}`, targetContainer, 'ft-heal');
                }
            } else {
                 this.currentHp = Math.min(this.maxHp, this.currentHp + heal);
                 // ✅ MODIFIÉ : S'affiche sur la bonne cible (l'ennemi)
                 if (targetContainer) {
                    window.showFloatingText(`+${formatFloatingNumber(heal)}`, targetContainer, 'ft-heal');
                 }
            }
        }
        
        this.statusEffect.duration++;
        
        const removalChance = this.getStatusRemovalChance();
        if (Math.random() < removalChance) {
            this.clearStatusEffect();
        }
        
        return { damage, isDead };
    }

   canAttack() {
        if (!this.hasStatusEffect()) return true;
        
        const type = this.statusEffect.type;
        
        // Seuls ces statuts empêchent totalement de jouer
        if (type === STATUS_EFFECTS.FROZEN) return false;
        if (type === STATUS_EFFECTS.STUNNED) return false;
        
        // La paralysie a une chance de bloquer, mais ne bloque pas tout le temps
        if (type === STATUS_EFFECTS.PARALYZED) {
            return Math.random() > 0.25; // 25% de chance de rater
        }
        
        // Note : SCARED a été retiré, il laisse attaquer mais moins fort.
        
        return true;
    }

   getAttackMultiplier() {
        let multiplier = 1.0;

        if (this.hasStatusEffect()) {
            const type = this.statusEffect.type;
            
            // ÉQUILIBRAGE : La peur réduit l'attaque de 40% (Debuff) au lieu de bloquer
            if (type === STATUS_EFFECTS.SCARED) {
                multiplier *= 0.60; 
            } 
            // ÉQUILIBRAGE : Enragé reste un gros buff risque/récompense
            else if (type === STATUS_EFFECTS.ENRAGED) {
                multiplier *= 1.30;
            } 
            // PUNCHER reste x2 (One Shot setup)
            else if (type === STATUS_EFFECTS.PUNCHER) {
                multiplier *= 2.0;
            }
            // La paralysie ne réduit pas l'attaque, elle réduit la Vitesse (géré ailleurs)
        }

        // Talent Vengeance (inchangé)
        if (this.passiveTalent === 'vengeance') {
            const hpPercent = this.currentHp / this.maxHp;
            const bonus = (1 - hpPercent) / 2; 
            multiplier += bonus; 
        }
// Dans getAttackMultiplier()
        if (this.passiveTalent === 'berserker') {
            multiplier += (this.berserkStacks * 0.05); // +5% par stack
        }
        return multiplier;
    }

    getDefenseMultiplier() {
        if (!this.hasStatusEffect()) return 1.0;
        
        const type = this.statusEffect.type;
        
        if (type === STATUS_EFFECTS.REINFORCED) return 1.25;
        
        return 1.0;
    }

    getSpeedMultiplier() {
        let multiplier = 1.0;
        
        if (this.hasStatusEffect()) {
            const type = this.statusEffect.type;
            
            // ÉQUILIBRAGE : Enragé donne de la vitesse
            if (type === STATUS_EFFECTS.ENRAGED) multiplier *= 1.15;
            
            // ÉQUILIBRAGE : Paralysie nerfée de -50% à -25%
            if (type === STATUS_EFFECTS.PARALYZED) multiplier *= 0.75;
        }
        
        // Objet Mouchoir Choix
        if (this.heldItem === 'choice_scarf') multiplier *= 1.5;
        
        return multiplier;
    }
    
    getStatusEffectName() {
        if (!this.hasStatusEffect()) return '';
        
        const names = {
            'burned': 'Brûlé',
            'poisoned': 'Empoisonné',
            'frozen': 'Gelé',
            'paralyzed': 'Paralysé',
            'stunned': 'Étourdi',
            'confused': 'Confus',
            'scared': 'Effrayé',
            'reinforced': 'Renforcé',
            'agile': 'Agile',
            'thorny': 'Épineux',
            'enraged': 'Enragé',
            'puncher': 'Puncheur'
        };
        
        return names[this.statusEffect.type] || this.statusEffect.type;
    }
    
  // OPTIMISATION : Calcul des stats AVEC Synergies incluses
    recalculateStats() {
        // 1️⃣ Base stats & IVs
        const baseStats = this.getBaseStats();
        baseStats.hp += this.ivHP;
        baseStats.attack += this.ivAttack;
        baseStats.spattack += this.ivSpAttack;
        baseStats.defense += this.ivDefense;
        baseStats.spdefense += this.ivSpDefense;
        baseStats.speed += this.ivSpeed;

        // 2️⃣ Multiplicateurs Individuels
        const rarityMultiplier = RARITY_MULTIPLIERS[this.rarity] || 1;
        const prestigeMultiplier = 1 + (this.prestige * 0.25);
        const tierMultiplier = this.isEnemy ? Math.pow(1.0033, this.tier) : 1;
        const shinyMultiplier = this.isShiny ? 1.1 : 1;
        const zoneMultiplier = this.zoneMultiplier || 1;

        // 3️⃣ Bonus Jetons Prestige (Stats perso)
        if (!this.prestigeBonuses) this.prestigeBonuses = { hp: 0, attack: 0, defense: 0, spattack: 0, spdefense: 0, speed: 0 };
        const pBonusHP = 1 + (this.prestigeBonuses.hp * 0.05);
        const pBonusATK = 1 + (this.prestigeBonuses.attack * 0.05);
        const pBonusSpATK = 1 + (this.prestigeBonuses.spattack * 0.05);
        const pBonusDEF = 1 + (this.prestigeBonuses.defense * 0.05);
        const pBonusSpDEF = 1 + (this.prestigeBonuses.spdefense * 0.05);
        const pBonusSPD = 1 + (this.prestigeBonuses.speed * 0.05);

        // 4️⃣ RÉCUPÉRATION DES SYNERGIES (C'est ici que la magie opère !)
        // On va chercher les bonus d'équipe actuels dans le GameManager
        let syn = { attack_mult: 1, defense_mult: 1, max_hp_mult: 1, speed_mult: 1 };
        
        // On s'assure que ce n'est pas un ennemi et que le jeu est chargé
        if (!this.isEnemy && typeof window.game !== 'undefined' && window.game && window.game.getActiveSynergies) {
            syn = window.game.getActiveSynergies();
        }

        // 5️⃣ Calcul Final (Tout est multiplié ici)
        const attackBonus = this.passiveTalent === 'muraille' ? Math.floor(baseStats.hp * 0.10) : 0;

        // Note : On multiplie par syn.max_hp_mult, syn.attack_mult, etc.
        this.maxHp = Math.floor(
            baseStats.hp * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier *
            zoneMultiplier * pBonusHP * syn.max_hp_mult
        );

        this.attack = Math.floor(
            (baseStats.attack * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier *
            zoneMultiplier * pBonusATK * syn.attack_mult) + attackBonus
        );

        this.spattack = Math.floor(
            (baseStats.spattack * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier *
            zoneMultiplier * pBonusSpATK * syn.attack_mult) + attackBonus
        );

        this.defense = Math.floor(
            baseStats.defense * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier *
            zoneMultiplier * pBonusDEF * syn.defense_mult
        );

        this.spdefense = Math.floor(
            baseStats.spdefense * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier *
            zoneMultiplier * pBonusSpDEF * syn.defense_mult
        );

        this.speed = Math.floor(
            baseStats.speed * rarityMultiplier * prestigeMultiplier * tierMultiplier * shinyMultiplier *
            zoneMultiplier * pBonusSPD * syn.speed_mult
        );

        // 6️⃣ Sécurité HP
        if (this.currentHp === undefined || isNaN(this.currentHp)) this.currentHp = this.maxHp;
        else this.currentHp = Math.min(this.currentHp, this.maxHp);
        
        if (this.isEnemy && this.currentHp <= 0) {
             this.currentHp = this.maxHp;
        }
    }
	
	

    serialize() {
        return {
            name: this.name,
            type: this.type,
            secondaryType: this.secondaryType,
            level: this.level,
            rarity: this.rarity,
            isEnemy: this.isEnemy,
            isShiny: this.isShiny,
            maxHp: this.maxHp,
            currentHp: this.currentHp,
            attack: this.attack,
            spattack: this.spattack,
            defense: this.defense,
            spdefense: this.spdefense,
            speed: this.speed,
            exp: this.exp,
            expToNext: this.expToNext,
            currentStamina: this.currentStamina,
            maxStamina: this.maxStamina,
            prestige: this.prestige,
            passiveTalent: this.passiveTalent,
            tier: this.tier,
            zoneMultiplier: this.zoneMultiplier,
			ivHP: this.ivHP,
            ivAttack: this.ivAttack,
            ivSpAttack: this.ivSpAttack,
            ivDefense: this.ivDefense,
            ivSpDefense: this.ivSpDefense,
            ivSpeed: this.ivSpeed,
			isBoss: this.isBoss, 
            isEpic: this.isEpic ,
			heldItem: this.heldItem,
			prestigeTokens: this.prestigeTokens,
			prestigeBonuses: this.prestigeBonuses			
        };
    }
    
    // ✅ REMPLACEZ L'INTÉGRALITÉ de votre fonction deserialize(data) PAR CELLE-CI

    static deserialize(data) {
        const creature = new Creature(
            data.name,
            data.type,
            data.level,
            data.rarity,
            data.isEnemy || false,
            data.isShiny || false,
            data.secondaryType || null,
            data.isBoss || false,   // ✅ LIGNE AJOUTÉE
            data.isEpic || false    // ✅ LIGNE AJOUTÉE
        );
        creature.ivHP = data.ivHP || 0;
        creature.ivAttack = data.ivAttack || 0;
        creature.ivSpAttack = data.ivSpAttack || 0;
        creature.ivDefense = data.ivDefense || 0;
        creature.ivSpDefense = data.ivSpDefense || 0;
        creature.ivSpeed = data.ivSpeed || 0;
        creature.maxHp = data.maxHp;
        creature.currentHp = data.currentHp;
        creature.attack = data.attack;
        creature.spattack = data.spattack || 0;
        creature.defense = data.defense;
        creature.spdefense = data.spdefense || 0;
        creature.speed = data.speed;
        creature.exp = data.exp || 0;
        creature.expToNext = data.expToNext || 100;
        creature.currentStamina = data.currentStamina || 3;
        creature.maxStamina = data.maxStamina || 3;
        creature.prestige = data.prestige || 0;
        creature.passiveTalent = data.passiveTalent || null;
        creature.tier = data.tier || 0;
        creature.zoneMultiplier = data.zoneMultiplier || 1;
		creature.heldItem = data.heldItem || null;
		creature.actionGauge = 0;
		creature.prestigeTokens = data.prestigeTokens || 0;
		creature.prestigeBonuses = data.prestigeBonuses || { hp: 0, attack: 0, defense: 0, spattack: 0, spdefense: 0, speed: 0 };
        creature.recalculateStats();
    
        
        return creature;
    }
}



// ====== CLASSE EGG ======
class Egg {
    constructor(rarity = RARITY.COMMON) {
        this.rarity = rarity;
    }
    
    open() {
        return this.generateCreatureOnOpen();
    }
    
    generateCreatureOnOpen() {
        const rarity = this.rarity;
        const poolForRarity = POKEMON_POOL[rarity];

        // --- 1. CRÉATION DU "GRAND PANIER" ---
        // On rassemble tous les noms de tous les types dans une seule liste
        let allNames = [];
        Object.keys(poolForRarity).forEach(type => {
            if (poolForRarity[type] && poolForRarity[type].length > 0) {
                allNames = allNames.concat(poolForRarity[type]);
            }
        });

        // Sécurité : Si la liste est vide (ne devrait pas arriver)
        if (allNames.length === 0) {
            console.error(`Erreur Critique : Aucun Pokémon trouvé pour la rareté ${rarity}.`);
            return new Creature('Pikachu', TYPES.ELECTRIC, 1, RARITY.COMMON, false, false, null);
        }

        // --- 2. PIOCHER LE POKÉMON ---
        // Chaque Pokémon a maintenant exactement la même probabilité d'être choisi
        const name = allNames[Math.floor(Math.random() * allNames.length)];
        
        // --- 3. RETROUVER SON TYPE ---
        // Puisqu'on a choisi le nom en premier, il faut retrouver son type
        let type = TYPES.NORMAL; // Valeur par défaut
        for (const t in poolForRarity) {
            if (poolForRarity[t].includes(name)) {
                type = t;
                break;
            }
        }
        
        // --- Suite de votre fonction (inchangée) ---
        const secondaryType = POKEMON_SECONDARY_TYPES[name] || null;
        
        let shinyChance = 0.001;
        if (window.game) { // Utilisation de window.game car 'game' peut ne pas être dans la portée locale
            const shinyBoost = window.game.getActiveBoostMultiplier('shiny');
            shinyChance *= (1 + shinyBoost);
        }
        const isShiny = Math.random() < shinyChance;
        
        return new Creature(name, type, 1, rarity, false, isShiny, secondaryType);
    }
    // ▲▲▲ FIN DE LA FONCTION MODIFIÉE ▲▲▲
}

// ====== EXPORTS ======
window.Creature = Creature;
window.Egg = Egg;