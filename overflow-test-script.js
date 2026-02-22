/**
 * LARGE NUMBER UI OVERFLOW TEST SCRIPT
 * 
 * IMPORTANT: This script only tests and reports. It does NOT modify files.
 * 
 * Usage:
 * 1. Open: file:///C:/Users/David/Desktop/POKETIME%20-%20Copie/index.html
 * 2. Open DevTools Console (F12)
 * 3. Paste this entire script
 * 4. Run: testUIOverflow()
 * 5. Follow prompts for viewport testing
 */

const OVERFLOW_TEST_RESULTS = [];

// Test values - extreme but realistic for overflow detection
const TEST_VALUES = {
    small: 999,
    large: 999999,
    veryLarge: 999999999,
    extreme: 999999999999,
    trillion: 999999999999999,
    absurd: 9999999999999999999
};

// Store original state for restoration
let originalSave = null;

function logOverflowFinding(severity, area, reproSteps, observed, expected, suggestedFix) {
    OVERFLOW_TEST_RESULTS.push({
        severity,
        area,
        reproSteps,
        observed,
        expected,
        suggestedFix
    });
}

// ============================================================
// STEP 1: Initialize and backup
// ============================================================
function initializeTest() {
    console.log('%c=== LARGE NUMBER UI OVERFLOW TEST ===', 'font-size: 18px; font-weight: bold; color: #4CAF50;');
    console.log('Backing up current state...\n');
    
    // Backup original save
    originalSave = localStorage.getItem('creatureGameSave');
    
    // Verify game is loaded
    if (typeof game === 'undefined' || !game) {
        console.error('❌ Game not loaded. Wait for page to fully initialize.');
        return false;
    }
    
    console.log('✅ Game loaded successfully');
    console.log('✅ Original save backed up\n');
    return true;
}

// ============================================================
// STEP 2: Inject large values (runtime only)
// ============================================================
function injectLargeValues() {
    console.log('%cInjecting large test values...', 'font-weight: bold; color: #2196F3;');
    
    try {
        // Money and tokens
        game.pokedollars = TEST_VALUES.extreme;
        game.questTokens = TEST_VALUES.trillion;
        game.marquesDuTriomphe = TEST_VALUES.veryLarge;
        
        // Main stats
        game.playerMainStats.hp = TEST_VALUES.extreme;
        game.playerMainStats.attack = TEST_VALUES.trillion;
        game.playerMainStats.spattack = TEST_VALUES.veryLarge;
        game.playerMainStats.defense = TEST_VALUES.extreme;
        game.playerMainStats.spdefense = TEST_VALUES.trillion;
        game.playerMainStats.speed = TEST_VALUES.veryLarge;
        
        // Items/eggs if available
        if (game.eggs) {
            Object.keys(game.eggs).forEach(rarity => {
                game.eggs[rarity] = TEST_VALUES.large;
            });
        }
        
        if (game.items) {
            Object.keys(game.items).forEach(item => {
                game.items[item] = TEST_VALUES.large;
            });
        }
        
        // Combat tickets and other currencies
        game.combatTickets = TEST_VALUES.veryLarge;
        game.essenceDust = TEST_VALUES.extreme;
        
        // Shards if available
        if (game.shards) {
            Object.keys(game.shards).forEach(shard => {
                game.shards[shard] = TEST_VALUES.large;
            });
        }
        
        // Update display to reflect changes
        game.updateDisplay();
        if (game.updateHeaderDisplay) game.updateHeaderDisplay();
        if (game.updateTeamDisplay) game.updateTeamDisplay();
        
        console.log('✅ Large values injected successfully\n');
        return true;
    } catch (e) {
        console.error('❌ Failed to inject values:', e);
        return false;
    }
}

// ============================================================
// STEP 3: Check specific UI areas for overflow
// ============================================================

function checkHeaderResourceChips() {
    console.log('%cChecking: Header Resource Chips', 'font-weight: bold;');
    
    const checks = [
        { id: 'headerStatMoney', selector: '#headerStatMoney .resource-val', label: 'Pokédollars' },
        { id: 'headerStatTokens', selector: '#headerStatTokens .resource-val', label: 'Quest Tokens' },
        { id: 'headerStatMarques', selector: '#headerStatMarques .resource-val', label: 'Marques' }
    ];
    
    checks.forEach(check => {
        const element = document.querySelector(check.selector);
        if (!element) {
            console.warn(`⚠️ Element not found: ${check.selector}`);
            return;
        }
        
        const text = element.textContent;
        const rect = element.getBoundingClientRect();
        const parent = element.parentElement.getBoundingClientRect();
        
        // Check for NaN/Infinity
        if (text.includes('NaN') || text.includes('Infinity') || text.includes('undefined')) {
            logOverflowFinding(
                'Major',
                `Header - ${check.label}`,
                '1. Inject extreme values 2. Check header display',
                `Displays: "${text}"`,
                'Should display formatted number (e.g., "999.99T")',
                'Fix formatNumber() to handle NaN/Infinity: if (!isFinite(num)) return "999.99Q+";'
            );
            console.error(`  ❌ ${check.label}: Shows "${text}"`);
        }
        
        // Check for visual overflow (text wider than container)
        if (rect.width > parent.width * 1.1) { // 10% tolerance
            logOverflowFinding(
                'Minor',
                `Header - ${check.label}`,
                '1. Inject extreme values 2. Observe header chips',
                `Text width (${Math.round(rect.width)}px) exceeds container (${Math.round(parent.width)}px)`,
                'Text should fit within container or truncate gracefully',
                'Add CSS: .resource-val { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }'
            );
            console.warn(`  ⚠️ ${check.label}: Text overflow detected (${Math.round(rect.width)}px > ${Math.round(parent.width)}px)`);
        } else {
            console.log(`  ✅ ${check.label}: OK (${text})`);
        }
    });
}

function checkHeaderStatChips() {
    console.log('%cChecking: Header Combat Stat Chips', 'font-weight: bold;');
    
    const stats = ['HP', 'Atk', 'SpAtk', 'Def', 'SpDef', 'Spd'];
    const statKeys = ['hp', 'attack', 'spattack', 'defense', 'spdefense', 'speed'];
    
    statKeys.forEach((statKey, index) => {
        const chipId = `headerStat${statKey.charAt(0).toUpperCase() + statKey.slice(1).replace('spattack', 'SpAtk').replace('spdefense', 'SpDef').replace('speed', 'Spd')}`;
        const chip = document.getElementById(chipId);
        
        if (!chip) return;
        
        const valueEl = chip.querySelector('.stat-value');
        if (!valueEl) return;
        
        const text = valueEl.textContent;
        const rect = valueEl.getBoundingClientRect();
        const chipRect = chip.getBoundingClientRect();
        
        // Check for invalid values
        if (text.includes('NaN') || text.includes('Infinity')) {
            logOverflowFinding(
                'Major',
                `Header Stat - ${stats[index]}`,
                '1. Inject extreme stat values 2. Check header',
                `Displays: "${text}"`,
                'Should display formatted number',
                'Ensure formatNumber() is called on stat display and handles edge cases'
            );
            console.error(`  ❌ ${stats[index]}: Shows "${text}"`);
        } else if (rect.width > chipRect.width * 0.8) { // Stats should use ~80% of chip width max
            console.warn(`  ⚠️ ${stats[index]}: Tight fit (${text})`);
        } else {
            console.log(`  ✅ ${stats[index]}: OK (${text})`);
        }
    });
}

function checkShopCurrencyDisplays() {
    console.log('%cChecking: Shop/Upgrade Currency Displays', 'font-weight: bold;');
    
    // Switch to shop tab to test
    const shopTab = document.querySelector('[onclick="switchTab(\'boutique\')"]');
    if (shopTab) shopTab.click();
    
    setTimeout(() => {
        // Check upgrade costs
        const upgradeCosts = document.querySelectorAll('.upgrade-cost, .cost-value, .price');
        let issuesFound = 0;
        
        upgradeCosts.forEach((costEl, index) => {
            const text = costEl.textContent;
            
            if (text.includes('NaN') || text.includes('Infinity')) {
                issuesFound++;
                console.error(`  ❌ Cost display ${index + 1}: Shows "${text}"`);
            }
        });
        
        if (issuesFound > 0) {
            logOverflowFinding(
                'Major',
                'Shop - Cost Displays',
                '1. Open shop tab 2. Check upgrade/item costs',
                `${issuesFound} cost element(s) showing NaN/Infinity`,
                'All costs should be formatted numbers',
                'Ensure all price calculations use Number.isFinite() checks before display'
            );
        } else {
            console.log('  ✅ Shop costs: All OK');
        }
        
        // Check currency balance in shop
        const martMoney = document.getElementById('martMoney');
        if (martMoney) {
            const text = martMoney.textContent;
            if (text.includes('NaN') || text.includes('Infinity')) {
                logOverflowFinding(
                    'Major',
                    'Shop - Balance Display',
                    '1. Open shop 2. Check "Porte-monnaie" display',
                    `Shows: "${text}"`,
                    'Should show formatted currency',
                    'Fix formatNumber() call in shop balance display'
                );
                console.error(`  ❌ Shop balance: Shows "${text}"`);
            } else {
                console.log(`  ✅ Shop balance: OK (${text})`);
            }
        }
    }, 100);
}

function checkQuestCounters() {
    console.log('%cChecking: Quest/Tower/Expedition Counters', 'font-weight: bold;');
    
    // Switch to quests tab
    const questTab = document.querySelector('[onclick="switchTab(\'quests\')"]');
    if (questTab) questTab.click();
    
    setTimeout(() => {
        const questTokens = document.getElementById('questTokens');
        if (questTokens) {
            const text = questTokens.textContent;
            if (text.includes('NaN') || text.includes('Infinity')) {
                logOverflowFinding(
                    'Major',
                    'Quests Tab - Token Counter',
                    '1. Open quests tab 2. Check token display',
                    `Shows: "${text}"`,
                    'Should show formatted number',
                    'Apply formatNumber() to quest token display'
                );
                console.error(`  ❌ Quest tokens: Shows "${text}"`);
            } else {
                console.log(`  ✅ Quest tokens: OK (${text})`);
            }
        }
        
        // Check tower tab
        const towerTab = document.querySelector('[onclick="switchTab(\'tower\')"]');
        if (towerTab) {
            towerTab.click();
            
            setTimeout(() => {
                const combatTickets = document.getElementById('combatTickets');
                const marques = document.getElementById('marquesDuTriomphe');
                
                if (combatTickets && combatTickets.textContent.includes('NaN')) {
                    console.error(`  ❌ Combat tickets: Shows "${combatTickets.textContent}"`);
                } else if (combatTickets) {
                    console.log(`  ✅ Combat tickets: OK (${combatTickets.textContent})`);
                }
                
                if (marques && marques.textContent.includes('NaN')) {
                    console.error(`  ❌ Marques: Shows "${marques.textContent}"`);
                } else if (marques) {
                    console.log(`  ✅ Marques: OK (${marques.textContent})`);
                }
            }, 100);
        }
    }, 100);
}

function checkTeamCreatureStats() {
    console.log('%cChecking: Team/Storage Creature Stats', 'font-weight: bold;');
    
    // Check team display
    const teamCards = document.querySelectorAll('#teamList .creature-card, #storageList .creature-card');
    let issuesFound = 0;
    
    teamCards.forEach((card, index) => {
        const statValues = card.querySelectorAll('.stat-value, .creature-stat-value');
        
        statValues.forEach(statEl => {
            const text = statEl.textContent;
            if (text.includes('NaN') || text.includes('Infinity')) {
                issuesFound++;
            }
        });
    });
    
    if (issuesFound > 0) {
        logOverflowFinding(
            'Major',
            'Team/Storage - Creature Stats',
            '1. View team or storage 2. Check creature stat displays',
            `${issuesFound} stat display(s) showing NaN/Infinity`,
            'All creature stats should be valid numbers',
            'Add validation in creature stat display logic before rendering'
        );
        console.error(`  ❌ Found ${issuesFound} invalid stat displays`);
    } else {
        console.log(`  ✅ Creature stats: All OK (checked ${teamCards.length} cards)`);
    }
}

function checkTooltipsAndPopups() {
    console.log('%cChecking: Tooltips and Popups', 'font-weight: bold;');
    
    // Try to trigger a creature modal if possible
    const firstCreatureCard = document.querySelector('#teamList .creature-card');
    if (firstCreatureCard) {
        firstCreatureCard.click();
        
        setTimeout(() => {
            const modal = document.getElementById('creatureModal');
            if (modal && window.getComputedStyle(modal).display !== 'none') {
                const modalStats = modal.querySelectorAll('.stat-value, .modal-stat-value');
                let issues = 0;
                
                modalStats.forEach(statEl => {
                    const text = statEl.textContent;
                    if (text.includes('NaN') || text.includes('Infinity')) {
                        issues++;
                    }
                });
                
                if (issues > 0) {
                    logOverflowFinding(
                        'Major',
                        'Creature Modal - Stats',
                        '1. Click creature 2. Check modal stats',
                        `${issues} stat(s) showing NaN/Infinity`,
                        'Modal stats should be formatted',
                        'Apply formatNumber() to modal stat displays'
                    );
                    console.error(`  ❌ Modal stats: ${issues} invalid displays`);
                } else {
                    console.log('  ✅ Creature modal: OK');
                }
                
                // Close modal
                game.closeCreatureModal();
            }
        }, 200);
    }
}

function checkRecyclerShardCounts() {
    console.log('%cChecking: Recycler/Shard Counts', 'font-weight: bold;');
    
    // Go to shop → recycleur
    const shopTab = document.querySelector('[onclick="switchTab(\'boutique\')"]');
    if (shopTab) shopTab.click();
    
    setTimeout(() => {
        const recyclerTab = document.querySelector('[onclick="switchShopSubTab(\'recycleur\')"]');
        if (recyclerTab) recyclerTab.click();
        
        setTimeout(() => {
            const essenceCount = document.getElementById('essenceDustCount');
            if (essenceCount) {
                const text = essenceCount.textContent;
                if (text.includes('NaN') || text.includes('Infinity')) {
                    logOverflowFinding(
                        'Major',
                        'Recycler - Essence Count',
                        '1. Go to Boutique → Recycleur 2. Check essence display',
                        `Shows: "${text}"`,
                        'Should show formatted number',
                        'Fix essence dust display with formatNumber()'
                    );
                    console.error(`  ❌ Essence dust: Shows "${text}"`);
                } else {
                    console.log(`  ✅ Essence dust: OK (${text})`);
                }
            }
            
            // Check shard list
            const shardCounts = document.querySelectorAll('.shard-count, .shard-amount');
            let issues = 0;
            shardCounts.forEach(countEl => {
                if (countEl.textContent.includes('NaN')) issues++;
            });
            
            if (issues > 0) {
                console.error(`  ❌ Shard counts: ${issues} showing NaN`);
            } else {
                console.log('  ✅ Shard counts: OK');
            }
        }, 100);
    }, 100);
}

// ============================================================
// STEP 4: Viewport testing
// ============================================================

function testViewport(width, height, zoom = 100) {
    console.log(`%cTesting viewport: ${width}x${height} @ ${zoom}%`, 'font-weight: bold; color: #FF9800;');
    
    // Note: Browser zoom must be set manually by user
    console.log(`📐 Current window: ${window.innerWidth}x${window.innerHeight}`);
    
    if (zoom !== 100) {
        console.log(`⚠️ Please set browser zoom to ${zoom}% (Ctrl+Plus/Minus) and press Enter to continue`);
        return new Promise(resolve => {
            const listener = (e) => {
                if (e.key === 'Enter') {
                    document.removeEventListener('keydown', listener);
                    resolve();
                }
            };
            document.addEventListener('keydown', listener);
        });
    }
    
    return Promise.resolve();
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================

async function testUIOverflow() {
    console.clear();
    
    // Step 1: Initialize
    if (!initializeTest()) return;
    
    // Step 2: Inject large values
    if (!injectLargeValues()) {
        console.error('Failed to inject test values. Aborting.');
        return;
    }
    
    console.log('%cRunning UI overflow checks...', 'font-size: 16px; font-weight: bold; color: #FF9800;');
    console.log('Please wait while all areas are tested.\n');
    
    // Step 3: Check all UI areas
    checkHeaderResourceChips();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    checkHeaderStatChips();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    checkShopCurrencyDisplays();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    checkQuestCounters();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    checkTeamCreatureStats();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    checkTooltipsAndPopups();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    checkRecyclerShardCounts();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 4: Viewport testing instructions
    console.log('\n%c=== VIEWPORT TESTING ===', 'font-size: 16px; font-weight: bold; color: #9C27B0;');
    console.log('Now test at different resolutions:');
    console.log('1. Current resolution (check results above)');
    console.log('2. Resize window to ~1366x768 and run: recheckAtCurrentViewport()');
    console.log('3. Set browser zoom to 125% (Ctrl++) and run: recheckAtCurrentViewport()');
    console.log('');
    
    // Print results
    printOverflowResults();
    
    // Cleanup instructions
    console.log('\n%c⚠️ CLEANUP:', 'font-weight: bold; color: #FF5722;');
    console.log('Run: restoreOriginalState() to restore your save');
}

function recheckAtCurrentViewport() {
    console.log(`\n%cRe-checking at ${window.innerWidth}x${window.innerHeight}`, 'font-weight: bold;');
    
    checkHeaderResourceChips();
    checkHeaderStatChips();
    
    console.log('\n📊 Check results above. If new issues found, they are viewport-specific.');
}

function printOverflowResults() {
    console.log('\n' + '='.repeat(80));
    console.log('%c📊 OVERFLOW TEST RESULTS', 'font-size: 18px; font-weight: bold;');
    console.log('='.repeat(80) + '\n');
    
    if (OVERFLOW_TEST_RESULTS.length === 0) {
        console.log('%c✅ No overflow issues found in tested areas', 'font-size: 16px; color: #4CAF50; font-weight: bold;');
        console.log('\nResidual Risks (Untested):');
        console.log('- Deeply nested modals with stats');
        console.log('- Evolution preview screens');
        console.log('- Combat damage numbers (floating text)');
        console.log('- Specific edge-case popups');
        console.log('- Mobile/tablet viewports');
    } else {
        const major = OVERFLOW_TEST_RESULTS.filter(r => r.severity === 'Major');
        const minor = OVERFLOW_TEST_RESULTS.filter(r => r.severity === 'Minor');
        
        console.log(`Found ${OVERFLOW_TEST_RESULTS.length} issue(s): ${major.length} Major, ${minor.length} Minor\n`);
        
        if (major.length > 0) {
            console.log('%c🔴 MAJOR ISSUES:', 'font-weight: bold; font-size: 14px; color: #f44336;');
            major.forEach((issue, i) => {
                console.log(`\n${i + 1}. ${issue.area}`);
                console.log(`   Repro: ${issue.reproSteps}`);
                console.log(`   Observed: ${issue.observed}`);
                console.log(`   Expected: ${issue.expected}`);
                console.log(`   Fix: ${issue.suggestedFix}`);
            });
        }
        
        if (minor.length > 0) {
            console.log('\n%c⚠️ MINOR ISSUES:', 'font-weight: bold; font-size: 14px; color: #ff9800;');
            minor.forEach((issue, i) => {
                console.log(`\n${i + 1}. ${issue.area}`);
                console.log(`   Observed: ${issue.observed}`);
                console.log(`   Fix: ${issue.suggestedFix}`);
            });
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('Test complete. Review findings above.');
    console.log('='.repeat(80));
}

function restoreOriginalState() {
    console.log('%cRestoring original state...', 'font-weight: bold; color: #2196F3;');
    
    if (originalSave) {
        localStorage.setItem('creatureGameSave', originalSave);
        console.log('✅ Original save restored to localStorage');
    }
    
    console.log('🔄 Reloading page...');
    setTimeout(() => location.reload(), 500);
}

// Export results for external report
function exportOverflowResults() {
    const report = {
        timestamp: new Date().toISOString(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
        findings: OVERFLOW_TEST_RESULTS
    };
    
    console.log('Copying results to clipboard...');
    copy(JSON.stringify(report, null, 2));
    console.log('✅ Results copied! Paste into report.');
}

// ============================================================
// USAGE INSTRUCTIONS
// ============================================================

console.log('%c📋 LARGE NUMBER UI OVERFLOW TEST LOADED', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
console.log('\n%cCommands:', 'font-weight: bold;');
console.log('  testUIOverflow()           - Run full test suite');
console.log('  recheckAtCurrentViewport() - Re-check after resize/zoom');
console.log('  restoreOriginalState()     - Restore save and reload');
console.log('  exportOverflowResults()    - Copy results to clipboard');
console.log('\n%c⚠️ IMPORTANT:', 'font-weight: bold; color: #f44336;');
console.log('  This script modifies runtime state only (not files)');
console.log('  Always run restoreOriginalState() when done');
console.log('  Original save is automatically backed up\n');
