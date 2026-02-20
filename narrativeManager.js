/**
* @file narrativeManager.js
* Professor Chen Narrative Engine — intro, milestones, billion finale, tutorials.
* Handles dialogue triggers, fake/real starter choice, and achievement unlock.
* Depends: narrativeData.js, toastManager (toast), game (Game), Creature, TYPES, RARITY.
*/

class NarrativeManager {
    constructor() {
        this.state = {
            introComplete: false,
            starterChoice: null,
            milestonesSeen: [],
            billionComplete: false,
            ultimateTutorialSeen: false,
            phase: 'idle'
        };
        this.overlay = null;
        this.epicAnimationTimeout = null;
        this.postChoicePartIndex = 0;
        this.introPartIndex = 0;
        this.inflationPartIndex = 0;

        // Timers
        this.postChoiceDelayTimeout = null;
        this.firstStoryQuestTimeout = null;
        this.ultimateTutorialTimeout = null;

        this.POST_CHOICE_DELAY_MS = 10000;
        this.FIRST_STORY_QUEST_DELAY_MS = 10000;
        this.ULTIMATE_TUTORIAL_DELAY_MS = 60000;

        this.currentChoiceCallback = null;
        this.currentActionCallback = null;
    }

    static getTotalStats(game) {
        if (!game || !game.playerMainStats) return 0;
        const s = game.playerMainStats;
        return (s.hp || 0) + (s.attack || 0) + (s.spattack || 0) + (s.defense || 0) + (s.spdefense || 0) + (s.speed || 0);
    }

    getSaveData() {
        return {
            introComplete: this.state.introComplete,
            starterChoice: this.state.starterChoice,
            milestonesSeen: [...this.state.milestonesSeen],
            billionComplete: this.state.billionComplete,
            ultimateTutorialSeen: this.state.ultimateTutorialSeen
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.state.introComplete = data.introComplete === true;
        this.state.starterChoice = data.starterChoice || null;
        this.state.milestonesSeen = Array.isArray(data.milestonesSeen) ? data.milestonesSeen : [];
        this.state.billionComplete = data.billionComplete === true;
        this.state.ultimateTutorialSeen = data.ultimateTutorialSeen === true;
    }

    // -------------------------------------------------------------------------
    // DOM DATA-BINDING (Refactorisation de innerHTML)
    // -------------------------------------------------------------------------

    ensureOverlay() {
        if (this.overlay) return;
        this.overlay = document.createElement('div');
        this.overlay.id = 'narrativeOverlay';
        this.overlay.className = 'narrative-overlay js-modal-overlay';

        const url = typeof CHEN_SPRITE_URL !== 'undefined' ? CHEN_SPRITE_URL : (window.CHEN_SPRITE_URL || '');
        const img = url ? `<img src="${url}" alt="Chen" class="narrative-chen-sprite" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.classList.add('narrative-chen-fallback-visible');">` : '';
        const fallback = '<span class="narrative-chen-fallback">👨‍🔬</span>';

        this.overlay.innerHTML = `
           <div class="narrative-dialogue js-modal-content" id="narrativeDialogueBox">
               <div class="narrative-dialogue-inner" id="narrativeInnerBox">
                   <div class="narrative-chen-column" id="narrativeChenSprite">
                       ${img}${fallback}
                   </div>
                   <div class="narrative-content-column">
                       <div class="narrative-speaker" id="narrativeSpeaker">Professeur Chen</div>
                       <div class="narrative-story-quest-title" id="narrativeTitle" style="display:none;"></div>
                       <div class="narrative-text" id="narrativeText"></div>
                       <div class="narrative-quest-rewards-title" id="narrativeRewardsTitle" style="display:none;">Récompenses reçues</div>
                       <div class="narrative-quest-rewards" id="narrativeRewards" style="display:none;"></div>
                       <div class="narrative-starters" id="narrativeExtraContainer" style="display:none;"></div>
                       <div class="narrative-page-indicator" id="narrativePageIndicator" style="display:none;"></div>
                       <div class="narrative-actions" id="narrativeActionsContainer"></div>
                   </div>
               </div>
               <div id="narrativeEpicContainer" style="display:none; width:100%;"></div>
           </div>
       `;
        document.body.appendChild(this.overlay);

        // Délégation d'événements pour les boutons d'actions (Suivant, OK, etc.)
        document.getElementById('narrativeActionsContainer').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn && this.currentActionCallback) {
                this.currentActionCallback(btn.dataset.actionId);
            }
        });

        // Délégation d'événements pour les choix de starters
        document.getElementById('narrativeExtraContainer').addEventListener('click', (e) => {
            const btn = e.target.closest('.narrative-starter-btn');
            if (btn && this.currentChoiceCallback) {
                this.currentChoiceCallback(btn);
            }
        });
    }

    bindData({ speaker = "Professeur Chen", title = "", text = "", rewards = "", extraHtml = "", indicator = "", actions = [], choiceCallback = null, actionCallback = null, boxClass = "", epicHtml = "" }) {
        this.ensureOverlay();

        const box = document.getElementById('narrativeDialogueBox');
        box.className = 'narrative-dialogue js-modal-content ' + boxClass;

        const innerBox = document.getElementById('narrativeInnerBox');
        const epicBox = document.getElementById('narrativeEpicContainer');

        if (epicHtml) {
            // Mode Billion Finale "Epic" ou "Reveal" : On remplace temporairement le dialogue standard
            innerBox.style.display = 'none';
            epicBox.innerHTML = epicHtml;
            epicBox.style.display = 'block';
            return;
        } else {
            innerBox.style.display = 'flex';
            epicBox.style.display = 'none';
            epicBox.innerHTML = '';
        }

        // speaker
        const elSpeaker = document.getElementById('narrativeSpeaker');
        if (speaker) { elSpeaker.textContent = speaker; elSpeaker.style.display = 'block'; } else elSpeaker.style.display = 'none';

        // title
        const elTitle = document.getElementById('narrativeTitle');
        if (title) { elTitle.innerHTML = title; elTitle.style.display = 'block'; } else elTitle.style.display = 'none';

        // text
        const elText = document.getElementById('narrativeText');
        if (text) { elText.innerHTML = text; elText.style.display = 'block'; } else elText.style.display = 'none';

        // rewards
        const elRewardsTitle = document.getElementById('narrativeRewardsTitle');
        const elRewards = document.getElementById('narrativeRewards');
        if (rewards) {
            elRewards.innerHTML = rewards;
            elRewards.style.display = 'block';
            elRewardsTitle.style.display = 'block';
        } else {
            elRewards.style.display = 'none';
            elRewardsTitle.style.display = 'none';
        }

        // extra (starters)
        const elExtra = document.getElementById('narrativeExtraContainer');
        if (extraHtml) {
            elExtra.innerHTML = extraHtml;
            elExtra.style.display = 'flex';
            this.currentChoiceCallback = choiceCallback;
        } else {
            elExtra.style.display = 'none';
            this.currentChoiceCallback = null;
        }

        // indicator
        const elInd = document.getElementById('narrativePageIndicator');
        if (indicator) { elInd.textContent = indicator; elInd.style.display = 'block'; } else elInd.style.display = 'none';

        // actions
        const elActions = document.getElementById('narrativeActionsContainer');
        if (actions && actions.length > 0) {
            elActions.innerHTML = actions.map((a, i) => `<button type="button" class="${a.class || 'narrative-continue-btn'}" data-action-id="${i}" id="${a.id || ''}">${a.text}</button>`).join('');
            elActions.style.display = 'block';
            this.currentActionCallback = (idx) => { if (actionCallback) actionCallback(actions[idx], idx); };
        } else {
            elActions.innerHTML = '';
            elActions.style.display = 'none';
            this.currentActionCallback = null;
        }
    }

    closeOverlay() {
        if (this.postChoiceDelayTimeout) { clearTimeout(this.postChoiceDelayTimeout); this.postChoiceDelayTimeout = null; }
        if (this.firstStoryQuestTimeout) { clearTimeout(this.firstStoryQuestTimeout); this.firstStoryQuestTimeout = null; }
        if (this.ultimateTutorialTimeout) { clearTimeout(this.ultimateTutorialTimeout); this.ultimateTutorialTimeout = null; }

        if (this.overlay) this.overlay.classList.remove('narrative-open');
        if (document.body) document.body.classList.remove('narrative-stats-visible');
        this.state.phase = 'idle';
    }

    // -------------------------------------------------------------------------
    // Phase A: Intro & fake/real choice
    // -------------------------------------------------------------------------

    startIntro(game) {
        if (this.state.introComplete) return;
        this.state.phase = 'intro';
        this.introPartIndex = 0;
        this.inflationPartIndex = 0;
        this.renderIntroContent(game, false);
        this.overlay.classList.add('narrative-open');
    }

    renderIntroContent(game, isRealChoice) {
        const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;
        const fakeStarters = typeof NARRATIVE_FAKE_STARTERS !== 'undefined' ? NARRATIVE_FAKE_STARTERS : window.NARRATIVE_FAKE_STARTERS;
        const realStarters = typeof NARRATIVE_REAL_STARTERS !== 'undefined' ? NARRATIVE_REAL_STARTERS : window.NARRATIVE_REAL_STARTERS;
        const spriteBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
        const parts = isRealChoice ? (data.INFLATION_RANT_PARTS || [data.INFLATION_RANT]) : (data.INTRO_PARTS || [data.INTRO]);
        const partIndex = isRealChoice ? this.inflationPartIndex : this.introPartIndex;
        const isLastPart = partIndex >= parts.length - 1;
        const text = parts[partIndex] || parts[parts.length - 1];
        const starters = isRealChoice ? realStarters : fakeStarters;

        let extraHtml = '';
        if (isLastPart) {
            extraHtml = starters.map(s => `
               <button type="button" class="narrative-starter-btn ${isRealChoice ? 'narrative-real' : 'narrative-fake'}" data-key="${s.key}" data-name="${s.name}" data-sprite-id="${s.spriteId}">
                   <img src="${spriteBase}${s.spriteId}.png" alt="${s.displayName || s.name}">
                   <span>${s.displayName || s.name}</span>
               </button>
           `).join('');
        }

        this.bindData({
            text: this.escapeHtml(text),
            indicator: isLastPart ? "" : `${partIndex + 1} / ${parts.length}`,
            extraHtml: extraHtml,
            actions: isLastPart ? [] : [{ text: 'Suivant', class: 'narrative-next-btn' }],
            actionCallback: () => this.onIntroSlideNext(game, isRealChoice),
            choiceCallback: (btn) => this.onStarterClick(game, btn, isRealChoice)
        });
    }

    onIntroSlideNext(game, isRealChoice) {
        if (isRealChoice) {
            this.inflationPartIndex++;
            this.renderIntroContent(game, true);
        } else {
            this.introPartIndex++;
            this.renderIntroContent(game, false);
        }
    }

    onStarterClick(game, btn, isRealChoice) {
        if (isRealChoice) {
            this.confirmRealStarter(game, btn.dataset.key, btn.dataset.name);
        } else {
            this.showInflationRant(game);
        }
    }

    showInflationRant(game) {
        this.state.phase = 'inflation_rant';
        this.renderIntroContent(game, true);
    }

    giveStarterToPlayer(game) {
        if (!game || !Array.isArray(game.playerTeam)) return;
        const creatureName = this.state.starterChoice === 'weedle' ? 'Weedle' : 'Caterpie';
        const displayName = this.state.starterChoice === 'weedle' ? 'Chenipan' : 'Aspicot';
        const creatureType = this.state.starterChoice === 'weedle' ? TYPES.POISON : TYPES.BUG;
        const starter = new Creature(creatureName, creatureType, 5, RARITY.COMMON, false);
        starter.isStarter = true;
        starter.ivHP = 8;
        starter.ivAttack = 8;
        starter.ivDefense = 8;
        starter.ivSpAttack = 8;
        starter.ivSpDefense = 8;
        starter.ivSpeed = 8;
        starter.recalculateStats();
        starter.heal();
        game.playerTeam.push(starter);
        game.pokedollars = 500;
        game.eggs[RARITY.COMMON] = 10;
        if (!game.items) game.items = {};
        game.items['pokeball'] = 5;
        if (typeof logMessage === 'function') logMessage(`✨ Professeur Chen vous a confié ${creatureName} (${displayName}) !`);
        if (typeof toast !== 'undefined') toast.success('Starter reçu !', `${displayName} rejoint votre équipe.`);
        if (typeof game.updateDisplay === 'function') game.updateDisplay();
    }

    confirmRealStarter(game, key, creatureName) {
        if (this.state.starterChoice) return;
        this.state.starterChoice = key;
        this.state.phase = 'post_choice';
        this.giveStarterToPlayer(game);
        this.startGameEngineOnly(game);
        this.postChoicePartIndex = 0;
        this.renderPostChoiceContent(game);
    }

    startGameEngineOnly(game) {
        if (!game) return;
        if (typeof game.setupEggHandler === 'function') game.setupEggHandler();
        game.lastTickTime = Date.now();
        if (typeof game.updateZoneSelector === 'function') game.updateZoneSelector();
        if (typeof game.updateDisplay === 'function') game.updateDisplay();
        if (typeof game.startGameLoop === 'function') game.startGameLoop();
    }

    renderPostChoiceContent(game) {
        const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;
        const parts = data.POST_CHOICE_RANTPARTS || data.POST_CHOICE_RANT_PARTS || [data.POST_CHOICE_RANT];
        const totalSlides = 1 + (parts ? parts.length : 0);
        if (!parts || parts.length === 0) {
            this.finishIntro(game);
            return;
        }
        const partIndex = Math.min(this.postChoicePartIndex, totalSlides - 1);
        this.postChoicePartIndex = partIndex;
        const isLastPart = partIndex >= totalSlides - 1;
        const displayName = this.state.starterChoice === 'weedle' ? 'Chenipan' : 'Aspicot';
        const starterReceivedTpl = (data.POST_CHOICE_STARTER_RECEIVED || 'Voilà, {starter} est à toi !').replace('{starter}', displayName);
        const text = partIndex === 0 ? starterReceivedTpl : (parts[partIndex - 1] || parts[parts.length - 1]);

        const isStatsSlide = (partIndex === 3 && parts.length >= 3);
        if (document.body) {
            if (isStatsSlide) document.body.classList.add('narrative-stats-visible');
            else document.body.classList.remove('narrative-stats-visible');
        }

        this.bindData({
            text: this.escapeHtml(text),
            indicator: `${partIndex + 1} / ${totalSlides}`,
            actions: [{ text: isLastPart ? "C'est parti !" : 'Suivant', class: isLastPart ? 'narrative-continue-btn' : 'narrative-next-btn' }],
            actionCallback: () => isLastPart ? this.finishIntro(game) : this.onPostChoiceNext(game)
        });
    }

    onPostChoiceNext(game) {
        const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;
        const parts = data.POST_CHOICE_RANTPARTS || data.POST_CHOICE_RANT_PARTS || [data.POST_CHOICE_RANT];
        const totalSlides = 1 + (parts ? parts.length : 0);
        const delaySlideIndex = 2;
        if (this.postChoicePartIndex === delaySlideIndex && totalSlides > delaySlideIndex + 1) {
            this.closeOverlay();
            if (this.postChoiceDelayTimeout) clearTimeout(this.postChoiceDelayTimeout);
            this.postChoiceDelayTimeout = setTimeout(() => {
                this.postChoiceDelayTimeout = null;
                if (!game) return;
                this.postChoicePartIndex = delaySlideIndex + 1;
                this.renderPostChoiceContent(game);
                if (this.overlay) this.overlay.classList.add('narrative-open');
            }, this.POST_CHOICE_DELAY_MS);
            return;
        }
        this.postChoicePartIndex++;
        this.renderPostChoiceContent(game);
    }

    finishIntro(game) {
        if (!game || !Array.isArray(game.playerTeam)) return;
        const alreadyHasStarter = game.playerTeam.length > 0 && this.state.starterChoice;
        if (!alreadyHasStarter) this.giveStarterToPlayer(game);

        this.state.introComplete = true;
        this.state.suppressNextStoryQuestIntro = true;
        this.closeOverlay();

        game.setupEggHandler();
        game.lastTickTime = Date.now();
        game.updateZoneSelector();
        game.updateDisplay();
        game.startGameLoop();

        game.generateQuest();
        game.nextQuestTimer = 60000;

        this.scheduleFirstStoryQuestIntro(game);
        game.startAutoSave();
        game.saveGame();
    }

    scheduleFirstStoryQuestIntro(game) {
        if (this.firstStoryQuestTimeout) clearTimeout(this.firstStoryQuestTimeout);
        this.firstStoryQuestTimeout = setTimeout(() => {
            this.firstStoryQuestTimeout = null;
            if (game) this.showFirstStoryQuestIfAny(game);
        }, this.FIRST_STORY_QUEST_DELAY_MS);
    }

    showFirstStoryQuestIfAny(game) {
        if (!game || !game.quests) return;
        const storyQuestsData = (typeof window !== 'undefined' && window.STORY_QUESTS) ? window.STORY_QUESTS : (typeof STORY_QUESTS !== 'undefined' ? STORY_QUESTS : null);
        if (!storyQuestsData) return;

        const storyQuest = game.quests.find(q => q.questType === 'STORY' && !q.claimed);
        if (!storyQuest) return;

        const def = Object.values(storyQuestsData).find(d => d.id === storyQuest.id);
        if (def) {
            this.state.suppressNextStoryQuestIntro = false;
            if (typeof window.switchTab === 'function') window.switchTab('quests');
            this.showStoryQuestIntro(game, def);
        }
    }

    scheduleUltimateTutorial(game) {
        if (this.state.ultimateTutorialSeen) return;
        if (this.ultimateTutorialTimeout) clearTimeout(this.ultimateTutorialTimeout);
        this.ultimateTutorialTimeout = setTimeout(() => {
            this.ultimateTutorialTimeout = null;
            if (game) this.showUltimateTutorial(game);
        }, this.ULTIMATE_TUTORIAL_DELAY_MS);
    }

    showUltimateTutorial(game) {
        if (this.state.ultimateTutorialSeen) return;
        const text = "Je vois que tu as un peu de mal à battre ton premier adversaire, essaie donc de forcer le destin en cliquant sur le petit bouton \"Prêt\", même un si faible pokémon à un Ultime !";

        this.bindData({
            text: this.escapeHtml(text),
            actions: [{ text: "Compris, Professeur !", class: "narrative-continue-btn" }],
            actionCallback: () => {
                this.closeOverlay();
            }
        });
        this.overlay.classList.add('narrative-open');

        this.state.ultimateTutorialSeen = true;
        if (game && game.saveGame) game.saveGame();
    }

    // -------------------------------------------------------------------------
    // Phase B: Milestones
    // -------------------------------------------------------------------------

    checkMilestones(game) {
        if (!game) return;
        const total = NarrativeManager.getTotalStats(game);
        const milestones = typeof NARRATIVE_MILESTONES !== 'undefined' ? NARRATIVE_MILESTONES : window.NARRATIVE_MILESTONES;
        const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;

        for (const m of milestones) {
            if (total >= m.value && !this.state.milestonesSeen.includes(m.value)) {
                this.state.milestonesSeen.push(m.value);
                const msg = data[m.key];
                this.showMilestoneModal(game, m.value, msg);
                if (game.saveGame) game.saveGame();
            }
        }

        const billion = typeof NARRATIVE_BILLION !== 'undefined' ? NARRATIVE_BILLION : 1e9;
        if (total >= billion && !this.state.billionComplete) this.startBillionFinale(game);
    }

    showInfoModal(game, title, message) {
        this.bindData({
            title: this.escapeHtml(title || 'Information'),
            text: this.escapeHtml(message || ''),
            boxClass: 'narrative-story-quest',
            actions: [{ text: "OK", class: "narrative-continue-btn" }],
            actionCallback: () => {
                this.closeOverlay();
                if (game && typeof game.saveGame === 'function') game.saveGame();
            }
        });
        this.overlay.classList.add('narrative-open');
    }

    showMilestoneModal(game, value, message) {
        this.bindData({
            text: this.escapeHtml(message),
            actions: [{ text: "OK", class: "narrative-continue-btn" }],
            actionCallback: () => {
                this.closeOverlay();
                if (game && game.saveGame) game.saveGame();
            }
        });
        this.overlay.classList.add('narrative-open');
    }

    // -------------------------------------------------------------------------
    // Phase C: Billion finale
    // -------------------------------------------------------------------------

    startBillionFinale(game) {
        if (this.state.billionComplete) return;
        this.state.billionComplete = true;
        this.state.phase = 'billion_intro';
        const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;
        const fakeStarters = typeof NARRATIVE_FAKE_STARTERS !== 'undefined' ? NARRATIVE_FAKE_STARTERS : window.NARRATIVE_FAKE_STARTERS;
        const spriteBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

        const optionsHtml = fakeStarters.map(s => `
           <button type="button" class="narrative-starter-btn" data-key="${s.key}">
               <img src="${spriteBase}${s.spriteId}.png" alt="${s.name}">
               <span>${s.name}</span>
           </button>
       `).join('');

        this.bindData({
            text: this.escapeHtml(data.BILLION_INTRO),
            extraHtml: optionsHtml,
            boxClass: 'narrative-billion',
            choiceCallback: () => this.onBillionStarterClick(game)
        });
        this.overlay.classList.add('narrative-open');
    }

    onBillionStarterClick(game) {
        if (this.state.phase !== 'billion_intro') return;
        this.state.phase = 'billion_epic';

        this.bindData({
            epicHtml: `
               <div class="narrative-epic-fx">
                   <div class="narrative-epic-particles"></div>
                   <div class="narrative-epic-shake"></div>
                   <div class="narrative-epic-text">✨ LEGENDAIRE ✨</div>
               </div>
           `,
            boxClass: 'narrative-epic'
        });

        const uglyText = typeof NARRATIVE_UGLY_REVEAL_TEXT !== 'undefined' ? NARRATIVE_UGLY_REVEAL_TEXT : 'Level 1. HP: 12. Atk: 5. IVs: 0';
        const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;

        this.epicAnimationTimeout = setTimeout(() => {
            this.epicAnimationTimeout = null;
            this.state.phase = 'billion_reveal';

            this.bindData({
                epicHtml: `
                   <div class="narrative-ugly-box">
                       <div class="narrative-ugly-title">Pokémon</div>
                       <div class="narrative-ugly-stats">${this.escapeHtml(uglyText)}</div>
                   </div>
               `,
                boxClass: 'narrative-reveal'
            });
            setTimeout(() => this.showBillionOutro(game, data), 2500);
        }, 3500);
    }

    showBillionOutro(game, data) {
        this.state.phase = 'billion_outro';
        this.bindData({
            text: this.escapeHtml(data.BILLION_OUTRO),
            actions: [{ text: "OK...", class: "narrative-continue-btn" }],
            actionCallback: () => this.finishBillionFinale(game)
        });
    }

    finishBillionFinale(game) {
        if (this.epicAnimationTimeout) { clearTimeout(this.epicAnimationTimeout); this.epicAnimationTimeout = null; }
        this.unlockBillionAchievement(game);
        this.closeOverlay();
        if (game.saveGame) game.saveGame();
    }

    unlockBillionAchievement(game) {
        const ach = typeof narrativeData !== 'undefined' ? narrativeData.ACHIEVEMENT_DATA : window.narrativeData.ACHIEVEMENT_DATA;
        const id = ach.id;
        const ACHIEVEMENTS = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : window.ACHIEVEMENTS;
        const def = ACHIEVEMENTS && ACHIEVEMENTS[id];
        if (def && game.unlockAchievement) {
            if (!game.achievementsCompleted) game.achievementsCompleted = {};
            if (game.achievementsCompleted[id]) return;
            game.unlockAchievement(id, def);
        }
        if (typeof toast !== 'undefined') toast.legendary(ach.title, ach.reward, 6000);
    }

    showStoryQuestCompletionSummary(game, data, onContinue) {
        if (!data) return;
        const title = this.escapeHtml(data.title || 'Quête terminée');
        const desc = this.escapeHtml(data.description || '');
        const dialogue = data.dialogue ? this.escapeHtml(data.dialogue) : '';

        let finalDesc = desc;
        if (dialogue) {
            finalDesc += `<p class="narrative-quest-dialogue" style="color:#555;font-style:italic;margin:8px 0;border-left:3px solid #f59e0b;padding-left:10px;">"${dialogue}"</p>`;
        }

        this.bindData({
            speaker: "Quête terminée",
            title: title,
            text: finalDesc,
            rewards: data.rewardsHtml || '',
            boxClass: 'narrative-story-quest narrative-quest-completion',
            actions: [{ text: "Continuer", class: "narrative-continue-btn" }],
            actionCallback: () => {
                this.closeOverlay();
                if (typeof onContinue === 'function') onContinue();
            }
        });
        this.overlay.classList.add('narrative-open');
    }

    showStoryQuestIntro(game, storyDef) {
        if (!storyDef) return;
        const title = storyDef.title || 'Quête';
        const dialogue = storyDef.dialogue || storyDef.description || '';

        this.bindData({
            title: this.escapeHtml(title),
            text: this.escapeHtml(dialogue),
            boxClass: 'narrative-story-quest',
            actions: [{ text: "Compris", class: "narrative-continue-btn" }],
            actionCallback: () => {
                this.closeOverlay();
                if (storyDef.id === 'story_shop_improvements') {
                    if (typeof window.switchTab === 'function') window.switchTab('boutique');
                    if (typeof window.switchShopSubTab === 'function') window.switchShopSubTab('pokedollars');
                } else {
                    if (typeof window.switchTab === 'function') window.switchTab('quests');
                }
                this.scheduleUltimateTutorial(game);
            }
        });
        this.overlay.classList.add('narrative-open');
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

const narrativeManager = new NarrativeManager();
if (typeof window !== 'undefined') window.narrativeManager = narrativeManager;