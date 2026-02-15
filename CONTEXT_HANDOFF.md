# Passation de contexte — Pokémon Idle / Professor Chen

Document pour enchaîner proprement dans un nouveau chat. À copier ou à référencer (@CONTEXT_HANDOFF.md) au début du prochain échange.

---

## Projet

- **Jeu :** Pokémon Idle satirique (vanilla JS, pas React).
- **Personnage récurrent :** Professeur Chen (narrateur, paresseux, brise le 4e mur).
- **Dossier principal :** `c:\Users\David\Music\Game\Game\`

---

## Fichiers clés du récit

| Fichier | Rôle |
|--------|------|
| `narrativeData.js` | Textes (INTRO, INTRO_PARTS, INFLATION_RANT, INFLATION_RANT_PARTS, POST_CHOICE_RANT, POST_CHOICE_RANTPARTS, POST_CHOICE_STARTER_RECEIVED, MILESTONE_*, BILLION_*, ACHIEVEMENT_DATA). Constantes NARRATIVE_FAKE_STARTERS, NARRATIVE_REAL_STARTERS, NARRATIVE_MILESTONES, CHEN_SPRITE_URL. |
| `narrativeManager.js` | Moteur narratif : startIntro, giveStarterToPlayer (starter.isStarter = true), startGameEngineOnly, post-choix (POST_CHOICE_RANTPARTS), finishIntro, scheduleFirstStoryQuestIntro (10 s), showFirstStoryQuestIfAny (window.STORY_QUESTS), showStoryQuestIntro, showStoryQuestCompletionSummary (récap quête terminée), showInfoModal (ex. canne à pêche), suppressNextStoryQuestIntro, jalons (showMilestoneModal), finale 1 milliard. |
| `game.js` | Appelle `narrativeManager.startIntro(this)` en nouvelle partie, `narrativeManager.checkMilestones(this)` dans la boucle secondaire. Suivi quêtes (starter level-up, evolution, stat boost, etc.) et appels checkSpecialQuests. |
| `questSystem.js` | addStoryQuestLogic, checkSpecialQuestsLogic, claimQuestRewardLogic (au claim story : showStoryQuestCompletionSummary puis après délai showStoryQuestIntro pour la suivante). STORY_QUESTS, STORY_QUEST_ORDER, STORY_QUEST_GUIDES (constants.js). |
| `saveSystem.js` | Sauvegarde / chargement de `narrative` (introComplete, starterChoice, milestonesSeen, billionComplete). |

---

## Flux narratif actuel

1. **Nouvelle partie** → `narrativeManager.startIntro(game)` : **Intro en slides** (`INTRO_PARTS`, textes courts) avec **sprite Prof Chen** à gauche ; bouton « Suivant » puis dernière slide = 3 faux starters (Bulbasaur, Charmander, Squirtle).
2. **Clic sur un faux starter** → **Inflation en slides** (`INFLATION_RANT_PARTS`) avec sprite Chen ; « Suivant » puis dernière slide = 2 vrais starters (Chenipan, Aspicot).
3. **Clic sur Chenipan ou Aspicot** → **Starter reçu immédiatement** (`giveStarterToPlayer` : Creature dans `playerTeam`, toast « Starter reçu ! », `updateDisplay()`). Modal affiche la **première slide** « Voilà, [Chenipan/Aspicot] est à toi ! », puis 8 slides post-choix (« Suivant »).
4. **Clic « Suivant »** après la slide « Dès que tu auras accumulé... Allez, au travail ! » (slide 6) → modal se ferme, **délai 10 s** (`POST_CHOICE_DELAY_MS`), puis réouverture sur les slides suivantes jusqu’à « C'est parti ! ».
5. **« C'est parti ! »** → `finishIntro(game)` : si le starter n’est pas déjà dans l’équipe, création du Creature ; sinon simple clôture. Puis `closeOverlay()`, `game.startGameLoop()`, `game.saveGame()`, etc.
6. **Jalons** (10k, 100k, 1M) → **modals Chen** avec sprite (`showMilestoneModal`).
7. **Quêtes scénario** → **Professeur Chen** présente chaque quête via `showStoryQuestIntro(game, storyDef)` (modal avec sprite, titre, dialogue, « Compris »). Au clic « Compris » → fermeture du modal puis **ouverture de l’onglet Quêtes** (`switchTab('quests')`) pour guider le joueur. **Au claim** d'une story quest : modal récap (`showStoryQuestCompletionSummary`) ; après « Continuer », délai ~2,5 s puis Chen présente la quête suivante. Cas spéciaux (ex. canne à pêche) : `showInfoModal`.
8. **1 milliard de stats** → BILLION_INTRO (avec sprite Chen), faux starters, animation « épique », révélation ridicule, BILLION_OUTRO, achievement « Tout ça pour ça ? ».

---

## Détails techniques utiles

- **Stats totales** pour les jalons : somme de `game.playerMainStats` (hp, attack, spattack, defense, spdefense, speed). Voir `NarrativeManager.getTotalStats(game)`.
- **IVs du starter narratif** : dans `giveStarterToPlayer` (au clic Chenipan/Aspicot) ou `finishIntro`, le Creature est créé avec des IVs entiers (8) pour éviter des erreurs avec `recalculateStats()`.
- **Délai post-choix** : `postChoiceDelayTimeout` et `POST_CHOICE_DELAY_MS` dans `narrativeManager.js`. Au décompte, on réattache l’overlay au DOM si besoin (`if (!this.overlay.parentNode) document.body.appendChild(this.overlay)`).
- **Sprite Prof Chen** : `CHEN_SPRITE_URL` dans `narrativeData.js` ; `getChenSpriteHtml()` et `wrapDialogueWithChen()` dans `narrativeManager.js`. Tous les modals narratifs utilisent la structure `narrative-dialogue-inner` (colonne Chen + colonne contenu).
- **Onglet Quêtes** : `showStoryQuestIntro` appelle `switchTab('quests')` à la fermeture ; `switchTab` (uiManager) active le bon bouton d’onglet même lorsqu’il est appelé programmatiquement.
- **Sauvegarde** : le jeu refuse de sauver si `playerTeam` est vide ; la première sauvegarde a lieu après `finishIntro`.
- **Première story quest** : `scheduleFirstStoryQuestIntro` programme un timeout (`FIRST_STORY_QUEST_DELAY_MS`). Au callback, `showFirstStoryQuestIfAny` utilise `window.STORY_QUESTS` (pas la constante directe) et réattache l’overlay au DOM si besoin.
- **Complétion story quest** : au claim, `showStoryQuestCompletionSummary` (récap titre/description/récompenses) puis après « Continuer » ajout quête suivante et `showStoryQuestIntro` après délai ~2,5 s. Tracking : starter_level_up, starter_evolved, creature_captured, fusion_completed, evolution_fusion, ultimateUsed, statBoostUsed, etc. (checkSpecialQuests dans game, combat, tower, expedition, zone). Guides : STORY_QUEST_GUIDES.

---

## Bugs / À déboguer

- **Modal première quête 10 s après « C'est parti ! »** : pas d’erreur en console mais le modal ne s’affiche pas. Vérifier : timeout bien exécuté, `game.quests` contient une story quest, `showStoryQuestIntro` appelé, overlay dans le DOM et `narrative-open` ajouté.

---

## Bugs récemment corrigés

- Starter non reçu / jeu ne démarre pas : sécurisation de `renderPostChoiceContent` (parts vides, index hors limites), sécurisation de `finishIntro` (vérification de `game`, `game.playerTeam`, `game.items`), IVs en entiers (8 au lieu de 0.5), réattache de l’overlay au DOM après le délai de 10 s si besoin.

---

## Pour repartir dans un nouveau chat

1. Ouvrir ou mentionner ce fichier : `@c:\Users\David\Music\Game\Game\CONTEXT_HANDOFF.md`
2. Indiquer ce que tu veux faire (ex. : modifier le délai, ajouter une slide, changer un texte, corriger un bug).
3. Si tu modifies le flux (slides, délais, starters), mettre à jour ce CONTEXT_HANDOFF.md dans le même échange.
