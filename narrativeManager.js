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
           // NOUVEAU : pour ne montrer le tuto ultime qu'une fois
           ultimateTutorialSeen: false,
           phase: 'idle' // 'idle' | 'intro' | 'inflation_rant' | 'real_choice' | 'post_choice' | 'billion_intro' | 'billion_epic' | 'billion_reveal' | 'billion_outro'
       };
       this.overlay = null;
       this.epicAnimationTimeout = null;
       this.postChoicePartIndex = 0;
       this.introPartIndex = 0;
       this.inflationPartIndex = 0;
       
       // Timers
       this.postChoiceDelayTimeout = null;
       this.firstStoryQuestTimeout = null;
       this.ultimateTutorialTimeout = null; // NOUVEAU TIMER

       // Constantes de temps
       /** Délai en ms avant de réafficher le modal après "Dès que tu auras accumulé... Allez, au travail !" */
       this.POST_CHOICE_DELAY_MS = 10000;
       /** Délai en ms avant que le Prof Chen revienne présenter la première quête après "Le monde des Pokémon n'attend que toi !" */
       this.FIRST_STORY_QUEST_DELAY_MS = 10000;
       /** NOUVEAU : Délai en ms avant le tuto sur l'Ultime après la fermeture du modal de la 1ère quête */
       this.ULTIMATE_TUTORIAL_DELAY_MS = 60000;
   }

   /** HTML du sprite Professeur Chen (colonne + fallback). */
   getChenSpriteHtml() {
       const url = typeof CHEN_SPRITE_URL !== 'undefined' ? CHEN_SPRITE_URL : (window.CHEN_SPRITE_URL || '');
       const img = url ? `<img src="${url}" alt="Chen" class="narrative-chen-sprite" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.classList.add('narrative-chen-fallback-visible');">` : '';
       const fallback = '<span class="narrative-chen-fallback">👨‍🔬</span>';
       return `<div class="narrative-chen-column">${img}${fallback}</div>`;
   }

   /** Bloc dialogue avec Chen à gauche (sprite + texte + actions). */
   wrapDialogueWithChen(contentHtml) {
       return `<div class="narrative-dialogue-inner">${this.getChenSpriteHtml()}<div class="narrative-content-column">${contentHtml}</div></div>`;
   }

   // -------------------------------------------------------------------------
   // Total stats (sum of playerMainStats) — used for milestones
   // -------------------------------------------------------------------------
   static getTotalStats(game) {
       if (!game || !game.playerMainStats) return 0;
       const s = game.playerMainStats;
       return (s.hp || 0) + (s.attack || 0) + (s.spattack || 0) + (s.defense || 0) + (s.spdefense || 0) + (s.speed || 0);
   }

   // -------------------------------------------------------------------------
   // Persistence (save/load)
   // -------------------------------------------------------------------------
   getSaveData() {
       return {
           introComplete: this.state.introComplete,
           starterChoice: this.state.starterChoice,
           milestonesSeen: [...this.state.milestonesSeen],
           billionComplete: this.state.billionComplete,
           // NOUVEAU : sauvegarde de l'état du tuto
           ultimateTutorialSeen: this.state.ultimateTutorialSeen
       };
   }

   loadSaveData(data) {
       if (!data) return;
       this.state.introComplete = data.introComplete === true;
       this.state.starterChoice = data.starterChoice || null;
       this.state.milestonesSeen = Array.isArray(data.milestonesSeen) ? data.milestonesSeen : [];
       this.state.billionComplete = data.billionComplete === true;
       // NOUVEAU : chargement de l'état du tuto
       this.state.ultimateTutorialSeen = data.ultimateTutorialSeen === true;
   }

   // -------------------------------------------------------------------------
   // Phase A: Intro & fake/real choice
   // -------------------------------------------------------------------------
   startIntro(game) {
       if (this.state.introComplete) return;
       this.ensureOverlay();
       this.state.phase = 'intro';
       this.introPartIndex = 0;
       this.inflationPartIndex = 0;
       this.renderIntroContent(game, false);
       this.overlay.classList.add('narrative-open');
   }

   ensureOverlay() {
       if (this.overlay) return;
       this.overlay = document.createElement('div');
       this.overlay.id = 'narrativeOverlay';
       this.overlay.className = 'narrative-overlay';
       document.body.appendChild(this.overlay);
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

       const optionsHtml = starters.map(s => `
           <button type="button" class="narrative-starter-btn" data-key="${s.key}" data-name="${s.name}" data-sprite-id="${s.spriteId}" data-real="${isRealChoice}">
               <img src="${spriteBase}${s.spriteId}.png" alt="${s.displayName || s.name}">
               <span>${s.displayName || s.name}</span>
           </button>
       `).join('');

       let content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-text">${this.escapeHtml(text)}</div>`;
       if (isLastPart) {
           content += `<div class="narrative-starters">${optionsHtml}</div>`;
       } else {
           content += `<div class="narrative-page-indicator">${partIndex + 1} / ${parts.length}</div>`;
           content += `<div class="narrative-actions"><button type="button" class="narrative-next-btn" id="narrativeIntroNext">Suivant</button></div>`;
       }

       this.overlay.innerHTML = `<div class="narrative-dialogue">${this.wrapDialogueWithChen(content)}</div>`;

       if (isLastPart) {
           this.overlay.querySelectorAll('.narrative-starter-btn').forEach(btn => {
               btn.addEventListener('click', () => this.onStarterClick(game, btn, isRealChoice));
           });
       } else {
           const btn = document.getElementById('narrativeIntroNext');
           if (btn) btn.addEventListener('click', () => this.onIntroSlideNext(game, isRealChoice));
       }
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

   /** Donne le starter au joueur immédiatement (équipe + ressources). Appelé au clic sur Chenipan/Aspicot. */
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

   /** Démarre la boucle de jeu (stats qui montent) sans finir l'intro ni sauvegarder. Pendant les 10 s de délai, les stats augmentent. */
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

       let buttonHtml = '';
       if (isLastPart) {
           buttonHtml = `<button type="button" class="narrative-continue-btn" id="narrativePostChoiceContinue">C'est parti !</button>`;
       } else {
           buttonHtml = `<button type="button" class="narrative-next-btn" id="narrativePostChoiceNext">Suivant</button>`;
       }

       const content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-text">${this.escapeHtml(text)}</div><div class="narrative-page-indicator">${partIndex + 1} / ${totalSlides}</div><div class="narrative-actions">${buttonHtml}</div>`;
       if (!this.overlay || !this.overlay.parentNode) this.ensureOverlay();
       this.overlay.innerHTML = `<div class="narrative-dialogue">${this.wrapDialogueWithChen(content)}</div>`;

       const isStatsSlide = (partIndex === 3 && parts.length >= 3);
       if (document.body) {
           if (isStatsSlide) document.body.classList.add('narrative-stats-visible');
           else document.body.classList.remove('narrative-stats-visible');
       }

       if (isLastPart) {
           const btn = document.getElementById('narrativePostChoiceContinue');
           if (btn) btn.addEventListener('click', () => this.finishIntro(game));
       } else {
           const btn = document.getElementById('narrativePostChoiceNext');
           if (btn) btn.addEventListener('click', () => this.onPostChoiceNext(game));
       }
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
               this.ensureOverlay();
               if (!this.overlay.parentNode) document.body.appendChild(this.overlay);
               this.renderPostChoiceContent(game);
               this.overlay.classList.add('narrative-open');
           }, this.POST_CHOICE_DELAY_MS);
           return;
       }
       this.postChoicePartIndex++;
       this.renderPostChoiceContent(game);
   }

   finishIntro(game) {
       if (!game || !Array.isArray(game.playerTeam)) return;
       const creatureName = this.state.starterChoice === 'weedle' ? 'Weedle' : 'Caterpie';
       
       const alreadyHasStarter = game.playerTeam.length > 0 && this.state.starterChoice;
       if (!alreadyHasStarter) {
           // (Code de redonne starter si rechargement sauvage...)
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
           if (typeof logMessage === 'function') logMessage(`✨ Professeur Chen vous a confié ${creatureName} (${this.state.starterChoice === 'weedle' ? 'Chenipan' : 'Aspicot'}) !`);
       }
       if (typeof toast !== 'undefined') toast.success("Au travail !", `${creatureName} rejoint votre équipe. Écoutez le Professeur...`);

       this.state.introComplete = true;
       this.state.suppressNextStoryQuestIntro = true;
       this.closeOverlay();

       game.setupEggHandler();
       game.lastTickTime = Date.now();
       game.updateZoneSelector();
       game.updateDisplay();
       game.startGameLoop();

       // FIX (étape précédente) : On génère AVANT le cooldown
       game.generateQuest(); 
       game.nextQuestTimer = 60000;

       this.scheduleFirstStoryQuestIntro(game);
       game.startAutoSave();
       game.saveGame();
   }

   /** Programme l’affichage du modal de la première quête 10 s après la fin du post-choice. */
   scheduleFirstStoryQuestIntro(game) {
       if (this.firstStoryQuestTimeout) clearTimeout(this.firstStoryQuestTimeout);
       this.firstStoryQuestTimeout = setTimeout(() => {
           this.firstStoryQuestTimeout = null;
           if (game) this.showFirstStoryQuestIfAny(game);
       }, this.FIRST_STORY_QUEST_DELAY_MS);
   }

   /** Présente la première quête scénario (modal Chen + ouverture onglet Quêtes). */
   showFirstStoryQuestIfAny(game) {
       if (!game || !game.quests) return;
       
       const storyQuestsData = (typeof window !== 'undefined' && window.STORY_QUESTS) ? window.STORY_QUESTS : (typeof STORY_QUESTS !== 'undefined' ? STORY_QUESTS : null);
       
       if (!storyQuestsData) return;
       const storyQuest = game.quests.find(q => q.questType === 'STORY' && !q.claimed);
       if (!storyQuest) return;

       const def = Object.values(storyQuestsData).find(d => d.id === storyQuest.id);
       if (def) {
           this.state.suppressNextStoryQuestIntro = false;
           if (this.overlay && !this.overlay.parentNode) document.body.appendChild(this.overlay);
           
           if (typeof window.switchTab === 'function') window.switchTab('quests');
           this.showStoryQuestIntro(game, def);
       }
   }

   // -------------------------------------------------------------------------
   // NOUVEAU: Tutoriel Ultime (60s après la première quête)
   // -------------------------------------------------------------------------

   /** Programme le tutoriel sur l'Ultime 60s plus tard. */
   scheduleUltimateTutorial(game) {
       if (this.state.ultimateTutorialSeen) return; // Déjà vu, on ne programme pas
       
       if (this.ultimateTutorialTimeout) clearTimeout(this.ultimateTutorialTimeout);
       this.ultimateTutorialTimeout = setTimeout(() => {
           this.ultimateTutorialTimeout = null;
           if (game) this.showUltimateTutorial(game);
       }, this.ULTIMATE_TUTORIAL_DELAY_MS);
   }

   /** Affiche le modal du tutoriel Ultime. */
   showUltimateTutorial(game) {
       if (this.state.ultimateTutorialSeen) return; // Double sécurité
       
       this.ensureOverlay();
       if (this.overlay && !this.overlay.parentNode) document.body.appendChild(this.overlay);

       const text = "Je vois que tu as un peu de mal à battre ton premier adversaire, essaie donc de forcer le destin en cliquant sur le petit bouton \"Prêt\", même un si faible pokémon à un Ultime !";
       
       const content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-text">${this.escapeHtml(text)}</div><button type="button" class="narrative-continue-btn" id="narrativeUltimateOk">Compris, Professeur !</button>`;
       
       this.overlay.innerHTML = `<div class="narrative-dialogue">${this.wrapDialogueWithChen(content)}</div>`;
       this.overlay.classList.add('narrative-open');

       // Marquer comme vu et sauvegarder
       this.state.ultimateTutorialSeen = true;
       if (game && game.saveGame) game.saveGame();

       const btn = document.getElementById('narrativeUltimateOk');
       if (btn) btn.addEventListener('click', () => {
           this.closeOverlay();
       });
   }


   closeOverlay() {
       if (this.postChoiceDelayTimeout) {
           clearTimeout(this.postChoiceDelayTimeout);
           this.postChoiceDelayTimeout = null;
       }
       if (this.firstStoryQuestTimeout) {
           clearTimeout(this.firstStoryQuestTimeout);
           this.firstStoryQuestTimeout = null;
       }
       // NOUVEAU : nettoyage du timer ultimate
       if (this.ultimateTutorialTimeout) {
           clearTimeout(this.ultimateTutorialTimeout);
           this.ultimateTutorialTimeout = null;
       }

       if (this.overlay) this.overlay.classList.remove('narrative-open');
       if (document.body) document.body.classList.remove('narrative-stats-visible');
       this.state.phase = 'idle';
   }

   // -------------------------------------------------------------------------
   // Phase B: Milestones (modals Chen)
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

   /**
    * Petit modal d'info générique avec le Professeur Chen (titre + texte + bouton OK).
    * Utile pour signaler un nouveau système (ex. pêche débloquée).
    */
   showInfoModal(game, title, message) {
       this.ensureOverlay();
       const safeTitle = this.escapeHtml(title || 'Information');
       const safeMessage = this.escapeHtml(message || '');
       const content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-story-quest-title">${safeTitle}</div><div class="narrative-text">${safeMessage}</div><button type="button" class="narrative-continue-btn" id="narrativeInfoOk">OK</button>`;
       this.overlay.innerHTML = `<div class="narrative-dialogue narrative-story-quest">${this.wrapDialogueWithChen(content)}</div>`;
       this.overlay.classList.add('narrative-open');
       const btn = document.getElementById('narrativeInfoOk');
       if (btn) btn.addEventListener('click', () => {
           this.closeOverlay();
           if (game && typeof game.saveGame === 'function') game.saveGame();
       });
   }

   /** Affiche un modal Professeur Chen pour un jalon (10k, 100k, 1M). */
   showMilestoneModal(game, value, message) {
       this.ensureOverlay();
       const content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-text">${this.escapeHtml(message)}</div><button type="button" class="narrative-continue-btn" id="narrativeMilestoneOk">OK</button>`;
       this.overlay.innerHTML = `<div class="narrative-dialogue">${this.wrapDialogueWithChen(content)}</div>`;
       this.overlay.classList.add('narrative-open');
       const btn = document.getElementById('narrativeMilestoneOk');
       if (btn) btn.addEventListener('click', () => {
           this.closeOverlay();
           if (game && game.saveGame) game.saveGame();
       });
   }

   // -------------------------------------------------------------------------
   // Phase C: Billion finale
   // -------------------------------------------------------------------------
   startBillionFinale(game) {
       // (Code inchangé...)
       if (this.state.billionComplete) return;
       this.state.billionComplete = true;
       this.ensureOverlay();
       this.state.phase = 'billion_intro';
       const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;
       const fakeStarters = typeof NARRATIVE_FAKE_STARTERS !== 'undefined' ? NARRATIVE_FAKE_STARTERS : window.NARRATIVE_FAKE_STARTERS;
       const spriteBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

       const optionsHtml = fakeStarters.map(s => `
           <button type="button" class="narrative-starter-btn narrative-billion-starter" data-key="${s.key}">
               <img src="${spriteBase}${s.spriteId}.png" alt="${s.name}">
               <span>${s.name}</span>
           </button>
       `).join('');

       const content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-text">${this.escapeHtml(data.BILLION_INTRO)}</div><div class="narrative-starters">${optionsHtml}</div>`;
       this.overlay.innerHTML = `<div class="narrative-dialogue narrative-billion">${this.wrapDialogueWithChen(content)}</div>`;

       this.overlay.querySelectorAll('.narrative-billion-starter').forEach(btn => {
           btn.addEventListener('click', () => this.onBillionStarterClick(game));
       });
   }

   onBillionStarterClick(game) {
       // (Code inchangé...)
       if (this.state.phase !== 'billion_intro') return;
       this.state.phase = 'billion_epic';
       this.overlay.classList.add('narrative-epic');
       this.overlay.innerHTML = `
           <div class="narrative-epic-fx">
               <div class="narrative-epic-particles"></div>
               <div class="narrative-epic-shake"></div>
               <div class="narrative-epic-text">✨ LEGENDAIRE ✨</div>
           </div>
       `;

       const uglyText = typeof NARRATIVE_UGLY_REVEAL_TEXT !== 'undefined' ? NARRATIVE_UGLY_REVEAL_TEXT : 'Level 1. HP: 12. Atk: 5. IVs: 0';
       const data = typeof narrativeData !== 'undefined' ? narrativeData : window.narrativeData;

       this.epicAnimationTimeout = setTimeout(() => {
           this.epicAnimationTimeout = null;
           this.state.phase = 'billion_reveal';
           this.overlay.classList.remove('narrative-epic');
           this.overlay.classList.add('narrative-reveal');
           this.overlay.innerHTML = `
               <div class="narrative-ugly-box">
                   <div class="narrative-ugly-title">Pokémon</div>
                   <div class="narrative-ugly-stats">${this.escapeHtml(uglyText)}</div>
               </div>
           `;
           setTimeout(() => this.showBillionOutro(game, data), 2500);
       }, 3500);
   }

   showBillionOutro(game, data) {
       // (Code inchangé...)
       this.state.phase = 'billion_outro';
       this.overlay.classList.remove('narrative-reveal');
       const content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-text">${this.escapeHtml(data.BILLION_OUTRO)}</div><button type="button" class="narrative-continue-btn" id="narrativeBillionContinue">OK...</button>`;
       this.overlay.innerHTML = `<div class="narrative-dialogue">${this.wrapDialogueWithChen(content)}</div>`;
       document.getElementById('narrativeBillionContinue').addEventListener('click', () => this.finishBillionFinale(game));
   }

   finishBillionFinale(game) {
       // (Code inchangé...)
       if (this.epicAnimationTimeout) {
           clearTimeout(this.epicAnimationTimeout);
           this.epicAnimationTimeout = null;
       }
       this.unlockBillionAchievement(game);
       this.closeOverlay();
       if (game.saveGame) game.saveGame();
   }

   unlockBillionAchievement(game) {
       // (Code inchangé...)
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

   /**
    * Modal « Quête terminée » : récap des récompenses et infos sur la quête venant d’être réclamée.
    * Au clic sur Continuer, ferme l’overlay et appelle onContinue (ex. après un délai, afficher la quête suivante).
    * @param {Object} game - instance du jeu
    * @param {Object} data - { title, description, dialogue, rewardsHtml }
    * @param {Function} onContinue - appelé au clic sur Continuer (fermer l’overlay puis déclencher la suite)
    */
   showStoryQuestCompletionSummary(game, data, onContinue) {
       if (!data) return;
       this.ensureOverlay();
       const title = this.escapeHtml(data.title || 'Quête terminée');
       const desc = this.escapeHtml(data.description || '');
       const dialogue = data.dialogue ? this.escapeHtml(data.dialogue) : '';
       const rewardsBlock = data.rewardsHtml ? `<div class="narrative-quest-rewards">${data.rewardsHtml}</div>` : '';
       const dialogueBlock = dialogue ? `<p class="narrative-quest-dialogue" style="color:#555;font-style:italic;margin:8px 0;border-left:3px solid #f59e0b;padding-left:10px;">"${dialogue}"</p>` : '';
       const content = `
           <div class="narrative-speaker">Quête terminée</div>
           <div class="narrative-story-quest-title">${title}</div>
           ${desc ? `<div class="narrative-text">${desc}</div>` : ''}
           ${dialogueBlock}
           ${rewardsBlock ? `<div class="narrative-quest-rewards-title">Récompenses reçues</div>${rewardsBlock}` : ''}
           <button type="button" class="narrative-continue-btn" id="narrativeCompletionContinue">Continuer</button>
       `;
       this.overlay.innerHTML = `<div class="narrative-dialogue narrative-story-quest narrative-quest-completion">${this.wrapDialogueWithChen(content)}</div>`;
       this.overlay.classList.add('narrative-open');
       const btn = document.getElementById('narrativeCompletionContinue');
       if (btn) btn.addEventListener('click', () => {
           this.closeOverlay();
           if (typeof onContinue === 'function') onContinue();
       });
   }

   /** Présentation des quêtes scénario par le Professeur Chen (modal). Fermeture → ouvre l'onglet Quêtes. */
   showStoryQuestIntro(game, storyDef) {
       if (!storyDef) return;
       this.ensureOverlay();
       const title = storyDef.title || 'Quête';
       const dialogue = storyDef.dialogue || storyDef.description || '';
       const content = `<div class="narrative-speaker">Professeur Chen</div><div class="narrative-story-quest-title">${this.escapeHtml(title)}</div><div class="narrative-text">${this.escapeHtml(dialogue)}</div><button type="button" class="narrative-continue-btn" id="narrativeStoryQuestOk">Compris</button>`;
       this.overlay.innerHTML = `<div class="narrative-dialogue narrative-story-quest">${this.wrapDialogueWithChen(content)}</div>`;
       this.overlay.classList.add('narrative-open');
       const btn = document.getElementById('narrativeStoryQuestOk');
       if (btn) btn.addEventListener('click', () => {
           this.closeOverlay();
           if (storyDef.id === 'story_shop_improvements') {
               if (typeof window.switchTab === 'function') window.switchTab('boutique');
               if (typeof window.switchShopSubTab === 'function') window.switchShopSubTab('pokedollars');
           } else {
               if (typeof window.switchTab === 'function') window.switchTab('quests');
           }
           this.scheduleUltimateTutorial(game);
       });
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