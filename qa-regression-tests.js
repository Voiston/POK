/* eslint-disable no-console */
/**
 * QA regression tests (no dependencies).
 * Run: node qa-regression-tests.js
 */
const fs = require('fs');
const vm = require('vm');

const SAVE_SYSTEM_SOURCE = fs.readFileSync('saveSystem.js', 'utf8');
const FORMATTERS_SOURCE = fs.readFileSync('formatters.js', 'utf8');
const CONSTANTS_SOURCE = fs.readFileSync('constants.js', 'utf8');
const GAME_SOURCE = fs.readFileSync('game.js', 'utf8');

function createBaseContext(overrides) {
    const logs = {
        toasts: [],
        messages: [],
        catchupArg: null,
        generatedQuests: 0,
        reloadCalled: false,
        savedValue: null
    };

    const storage = {};

    function MockFileReader() {
        this.onload = null;
        this.readAsText = (file) => {
            const content = (file && typeof file.content === 'string') ? file.content : '';
            if (typeof this.onload === 'function') {
                this.onload({ target: { result: content } });
            }
        };
    }

    const context = {
        console,
        Date,
        Math,
        JSON,
        Number,
        isNaN,
        setTimeout: (fn) => {
            if (typeof fn === 'function') fn();
            return 0;
        },
        clearTimeout: () => {},
        currentZone: 'FOREST',
        maxReachedZone: 'FOREST',
        ZONES: { FOREST: {} },
        updateZoneInfo: () => {},
        logMessage: (msg) => logs.messages.push(String(msg)),
        toast: {
            error: (title, msg) => logs.toasts.push({ type: 'error', title, msg }),
            success: (title, msg) => logs.toasts.push({ type: 'success', title, msg })
        },
        localStorage: {
            getItem: (k) => (k in storage ? storage[k] : null),
            setItem: (k, v) => {
                storage[k] = v;
                logs.savedValue = v;
            },
            removeItem: (k) => {
                delete storage[k];
            }
        },
        document: {
            getElementById: () => null,
            body: { appendChild: () => {}, removeChild: () => {} },
            createElement: (tag) => {
                if (tag === 'input') {
                    return {
                        type: '',
                        accept: '',
                        onchange: null,
                        click() {}
                    };
                }
                if (tag === 'a') {
                    return { click() {}, href: '', download: '' };
                }
                return {};
            }
        },
        location: {
            reload: () => {
                logs.reloadCalled = true;
            }
        },
        FileReader: MockFileReader,
        Blob: function Blob() {},
        URL: {
            createObjectURL: () => 'blob:mock',
            revokeObjectURL: () => {}
        },
        Creature: {
            deserialize: (data) => ({
                ...data,
                maxStamina: data.maxStamina || 100,
                currentStamina: data.currentStamina || 50,
                heal() {}
            })
        },
        Quest: function Quest() {},
        narrativeManager: null
    };

    Object.assign(context, overrides || {});
    context.window = context;

    vm.createContext(context);
    vm.runInContext(SAVE_SYSTEM_SOURCE, context);

    return { context, logs, storage };
}

function createGameStub(logs) {
    return {
        playerTeam: [],
        storage: [],
        pension: [],
        playerMainStats: {},
        eggs: {},
        incubators: [null, null, null, null],
        autoIncubation: null,
        shards: {},
        pokedollars: 0,
        talentRerolls: 0,
        talentChoices: 0,
        essenceDust: 0,
        combatTickets: 0,
        marquesDuTriomphe: 0,
        questTokens: 0,
        pokedex: {},
        upgrades: {},
        towerRecord: 0,
        stats: {},
        badges: {},
        achievements: {},
        achievementsCompleted: {},
        availableExpeditions: [],
        expeditionTimer: 60000,
        expeditionMastery: {},
        activeExpeditions: [],
        maxExpeditionSlots: 1,
        activeCreatureIndex: 0,
        sortBy: 'none',
        pauseOnRare: false,
        sortOrder: 'desc',
        autoSelectEnabled: false,
        autoSwitchDisadvantage: true,
        autoSwitchStamina: true,
        autoUltimate: true,
        isPensionCollapsed: false,
        captureMode: 0,
        captureTargets: null,
        items: {},
        activeVitamins: {},
        activeStatBoosts: [],
        activeBoosts: [],
        permanentBoosts: {},
        hasAutoCatcher: false,
        autoCatcherSettings: null,
        zoneProgress: { FOREST: { pokemonTiers: {}, bossesDefeated: 0, epicsDefeated: 0 } },
        quests: [],
        questsCompleted: 0,
        completedStoryQuests: [],
        nextQuestTimer: 1000,
        lastQuestUpdate: Date.now(),
        arenaState: { active: false, arenaId: null, currentChampionIndex: 0, startTime: 0 },
        EXPEDITION_GEN_TIME: 60000,
        updateCaptureButtonDisplay() {},
        updateCaptureTargetList() {},
        sortStorage() {},
        resetArenaState() {},
        applyAccountTalents() {},
        initAchievements() {},
        checkAchievements() {},
        normalizeAutoIncubationState(v) { return v; },
        generateQuest() {
            this.quests.push({ id: `q-${this.quests.length + 1}` });
            logs.generatedQuests++;
        },
        catchupMissedCombats(ms) {
            logs.catchupArg = ms;
        }
    };
}

function makeValidSave(overrides) {
    return JSON.stringify({
        playerTeam: [{ name: 'Pika', level: 5, type: 'electric', rarity: 'common' }],
        storage: [],
        pension: [],
        pokedollars: 0,
        stats: { combatsWon: 1 },
        playerMainStats: { hp: 1 },
        upgrades: {},
        quests: [],
        items: {},
        pokedex: {},
        badges: {},
        achievements: {},
        activeExpeditions: [],
        incubators: [null, null, null, null],
        activeCreatureIndex: 0,
        lastSaveTime: Date.now() - 1000,
        ...overrides
    });
}

function runFormattersInContext() {
    const context = { window: null, Intl, Math, Number, isNaN };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(FORMATTERS_SOURCE, context);
    return context;
}

function runImportWithPayload(payload) {
    const { context, logs } = createBaseContext();
    context.importSaveLogic({});
    const input = context.document.createElement('input');
    input.onchange = null;

    // Recover the real input instance created by importSaveLogic by wrapping createElement.
    let capturedInput = null;
    context.document.createElement = (tag) => {
        if (tag === 'input') {
            capturedInput = {
                type: '',
                accept: '',
                onchange: null,
                click() {}
            };
            return capturedInput;
        }
        return {};
    };
    context.importSaveLogic({});
    if (!capturedInput || typeof capturedInput.onchange !== 'function') {
        throw new Error('Import input not initialized');
    }
    capturedInput.onchange({ target: { files: [{ name: 'save.json', content: payload }] } });
    return logs;
}

function createGameRuntime() {
    const context = {
        console,
        Date,
        Math,
        JSON,
        Number,
        isNaN,
        Intl,
        performance: { now: () => 0 },
        requestAnimationFrame: () => 0,
        cancelAnimationFrame: () => {},
        setTimeout: (fn) => { if (typeof fn === 'function') fn(); return 0; },
        clearTimeout: () => {},
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        document: {
            hidden: false,
            addEventListener: () => {},
            getElementById: () => null,
            querySelectorAll: () => [],
            createElement: () => ({ style: {}, appendChild: () => {}, remove: () => {}, addEventListener: () => {} }),
            body: { appendChild: () => {}, removeChild: () => {} }
        },
        window: null,
        logMessage: () => {},
        toast: { success: () => {}, error: () => {}, legendary: () => {}, info: () => {}, show: () => {} },
        updateZoneInfo: () => {},
        showFloatingText: () => {},
        updateTextContentUI: () => {},
        updateTransformScaleXUI: () => {},
        updatePlayerStatsDisplayUI: () => {},
        updateCombatDisplayUI: () => {},
        updateTeamDisplayUI: () => {},
        updateStorageDisplayUI: () => {},
        updateItemsDisplayUI: () => {},
        updateRecyclerDisplayUI: () => {},
        updatePokeMartDisplayUI: () => {},
        updateUpgradesDisplayUI: () => {},
        updateShopDisplayUI: () => {},
        updateTowerShopDisplayUI: () => {},
        updateTeamRocketDisplayUI: () => {},
        formatNumber: (v) => String(Math.floor(Number(v) || 0))
    };
    context.window = context;
    context.window.addEventListener = () => {};
    vm.createContext(context);
    vm.runInContext(CONSTANTS_SOURCE, context);
    vm.runInContext(GAME_SOURCE, context);
    const game = new context.Game();
    game.updateDisplay = () => {};
    game.updatePlayerStatsDisplay = () => {};
    game.updateTeamDisplay = () => {};
    game.updateStorageDisplay = () => {};
    game.updateItemsDisplay = () => {};
    game.updateExpeditionsDisplay = () => {};
    game.updatePensionDisplay = () => {};
    game.calculateTeamStats = () => { game.playerTeamStats = { hp: 100, attack: 50, spattack: 50, defense: 50, spdefense: 50, speed: 50 }; };
    game.calculatePensionStats = () => ({ hp: 0, attack: 0, spattack: 0, defense: 0, spdefense: 0, speed: 0 });
    game.getAccountTalentBonus = () => 0;
    game.checkAchievements = () => {};
    game.checkSpecialQuests = () => {};
    return { context, game };
}

function expect(name, condition, details) {
    if (!condition) {
        throw new Error(details ? `${name} -> ${details}` : name);
    }
}

function run() {
    const tests = [];

    tests.push(function testCorruptJsonRejected() {
        const { context, logs, storage } = createBaseContext();
        storage.creatureGameSave = '{bad json';
        const game = createGameStub(logs);
        const ok = context.loadGameLogic(game);
        expect('corrupt_json', ok === false, 'Should reject invalid JSON');
    });

    tests.push(function testMissingTeamRejected() {
        const { context, logs, storage } = createBaseContext();
        storage.creatureGameSave = JSON.stringify({ pokedollars: 10, stats: {} });
        const game = createGameStub(logs);
        const ok = context.loadGameLogic(game);
        expect('missing_team', ok === false, 'Should reject missing playerTeam');
    });

    tests.push(function testHugePokedollarsRejected() {
        const { context, logs, storage } = createBaseContext();
        storage.creatureGameSave = makeValidSave({ pokedollars: 1e309 });
        const game = createGameStub(logs);
        const ok = context.loadGameLogic(game);
        expect('huge_pokedollars', ok === false, 'Should reject non-finite money');
    });

    tests.push(function testNarrativeNullNoCrash() {
        const { context, logs, storage } = createBaseContext({ narrativeManager: null });
        storage.creatureGameSave = makeValidSave();
        const game = createGameStub(logs);
        const ok = context.loadGameLogic(game);
        expect('narrative_null', ok === true, 'Should load when narrativeManager is null');
    });

    tests.push(function testOfflineCap72h() {
        const { context, logs, storage } = createBaseContext();
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        storage.creatureGameSave = makeValidSave({
            lastSaveTime: Date.now() - oneYearMs,
            nextQuestTimer: 1,
            quests: []
        });
        const game = createGameStub(logs);
        const ok = context.loadGameLogic(game);
        expect('offline_cap_load', ok === true, 'Load should succeed');
        expect('offline_cap_value', logs.catchupArg === 72 * 60 * 60 * 1000, `Expected 72h cap, got ${logs.catchupArg}`);
    });

    tests.push(function testImportAcceptsZeroCurrency() {
        const logs = runImportWithPayload(makeValidSave({ pokedollars: 0 }));
        const hasSuccess = logs.toasts.some((t) => t.type === 'success');
        expect('import_zero_currency', hasSuccess, 'Import should accept pokedollars = 0');
    });

    tests.push(function testFormattersSafety() {
        const fmt = runFormattersInContext();
        expect('format_nan', fmt.formatNumber(NaN) === '0', 'NaN should format to 0');
        expect('format_infinity', fmt.formatNumber(Infinity) === '0', 'Infinity should format to 0');
    });

    tests.push(function testFormattersLargeAndNegative() {
        const fmt = runFormattersInContext();
        const huge = fmt.formatNumber(1e18);
        const neg = fmt.formatNumber(-1234567);
        expect('format_huge', typeof huge === 'string' && huge.length > 0, 'Huge value should format');
        expect('format_negative', neg.startsWith('-'), 'Negative should preserve sign');
    });

    tests.push(function testRocketBankMinuteInterest() {
        const { game } = createGameRuntime();
        const now = Date.now();
        game.teamRocketState.bank.balance = 600000;
        game.teamRocketState.bank.lastInterestTickAt = now - 60000;
        game.tickRocketBank(now);
        expect('rocket_bank_interest', game.teamRocketState.bank.balance > 600000, 'Bank should accrue interest each minute');
    });

    tests.push(function testRocketWithdrawLock() {
        const { game } = createGameRuntime();
        game.pokedollars = 10000;
        game.rocketDeposit(1000);
        const ok = game.rocketWithdraw(100);
        expect('rocket_withdraw_lock', ok === false, 'Withdraw should fail during 60m lock');
    });

    tests.push(function testRocketLoanSingleAndWithholding() {
        const { game } = createGameRuntime();
        game.teamRocketState.trustLevel = 2;
        game.teamRocketState.bank.totalInterestGenerated = 500;
        const first = game.takeRocketLoan(100000);
        const second = game.takeRocketLoan(1000);
        expect('rocket_single_loan', first === true && second === false, 'Only one active loan allowed');

        game.teamRocketState.loan.active = true;
        game.teamRocketState.loan.remainingDebt = 1000;
        game.teamRocketState.loan.totalDebt = 1000;
        const result = game.addCombatPokedollars(1000, 'combat_test');
        expect('rocket_withholding', result.withheld > 0 && result.net < 1000, 'Combat gains must be withheld when indebted');
    });

    tests.push(function testRocketStakingHardLockAndClaim() {
        const { game } = createGameRuntime();
        game.storage = [
            { name: 'A', rarity: 'common', level: 5, isShiny: false, ivHP: 1, ivAttack: 1, ivDefense: 1, ivSpeed: 1 },
            { name: 'B', rarity: 'common', level: 6, isShiny: false, ivHP: 2, ivAttack: 2, ivDefense: 2, ivSpeed: 2 }
        ];
        game.teamRocketState.staking.availableContracts = [{
            contractId: 't1',
            requestedType: 'pokemon_rarity',
            requestedKey: 'common',
            amount: 1,
            durationMinutes: 1,
            rewardRJ: 10,
            status: 'open'
        }];
        const started = game.startRocketStake('t1');
        expect('rocket_stake_start', started === true, 'Staking contract should start');
        const locked = game.isCreatureRocketLocked(game.storage[0]) || game.isCreatureRocketLocked(game.storage[1]);
        expect('rocket_stake_lock', locked === true, 'At least one creature should be hard-locked');

        game.teamRocketState.staking.activeContracts[0].endAt = Date.now() - 1;
        const claimed = game.claimRocketStake('t1');
        expect('rocket_stake_claim', claimed === true && game.teamRocketState.rj >= 10, 'Claim should grant RJ and release contract');
    });

    let passed = 0;
    const failures = [];
    for (const testFn of tests) {
        const name = testFn.name || 'anonymous_test';
        try {
            testFn();
            passed++;
            console.log(`✅ ${name}`);
        } catch (err) {
            failures.push({ name, error: err.message });
            console.error(`❌ ${name}: ${err.message}`);
        }
    }

    console.log('\n--- QA Regression Summary ---');
    console.log(`Passed: ${passed}/${tests.length}`);
    if (failures.length > 0) {
        console.log('Failures:');
        failures.forEach((f) => console.log(`- ${f.name}: ${f.error}`));
        process.exitCode = 1;
    } else {
        console.log('All critical regression checks are green.');
    }
}

run();
