/* eslint-disable no-console */
/**
 * Release gate runner.
 *
 * Usage:
 *   node qa-release-gate.js
 *   node qa-release-gate.js --manual-pass
 *   node qa-release-gate.js --manual-fail
 *
 * Notes:
 * - Automatic checks come from qa-regression-tests.js.
 * - Manual status is optional but required for final GO verdict.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const AUTO_TEST_FILE = 'qa-regression-tests.js';
const REPORT_FILE = 'qa-release-gate-report.json';

function nowIso() {
    return new Date().toISOString();
}

function hasArg(flag) {
    return process.argv.includes(flag);
}

function runAutoChecks() {
    const run = spawnSync(process.execPath, [AUTO_TEST_FILE], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
    });

    const stdout = run.stdout || '';
    const stderr = run.stderr || '';
    const success = run.status === 0;

    return {
        success,
        exitCode: run.status,
        stdout,
        stderr
    };
}

function computeManualStatus() {
    if (hasArg('--manual-pass')) return 'pass';
    if (hasArg('--manual-fail')) return 'fail';
    return 'pending';
}

function computeVerdict(autoSuccess, manualStatus) {
    if (!autoSuccess) return 'NO-GO';
    if (manualStatus === 'fail') return 'NO-GO';
    if (manualStatus === 'pass') return 'GO';
    return 'PENDING_MANUAL';
}

function exitCodeForVerdict(verdict) {
    if (verdict === 'GO') return 0;
    if (verdict === 'PENDING_MANUAL') return 2;
    return 1;
}

function buildNextSteps(verdict) {
    if (verdict === 'GO') {
        return [
            'Release gate validated.',
            'You can prepare your release/changelog now.'
        ];
    }
    if (verdict === 'PENDING_MANUAL') {
        return [
            'Automatic checks are green.',
            'Run the manual smoke checklist in QA_RELEASE_GATE_CHECKLIST.md.',
            'Then rerun: node qa-release-gate.js --manual-pass'
        ];
    }
    return [
        'Do not release.',
        'Fix failing checks, then rerun: node qa-release-gate.js',
        'Use the output above to identify failing scenarios.'
    ];
}

function writeReport(report) {
    fs.writeFileSync(path.resolve(REPORT_FILE), JSON.stringify(report, null, 2), 'utf8');
}

function printSection(title, content) {
    console.log(`\n=== ${title} ===`);
    console.log(content);
}

function main() {
    if (!fs.existsSync(path.resolve(AUTO_TEST_FILE))) {
        console.error(`Missing required file: ${AUTO_TEST_FILE}`);
        process.exit(1);
    }

    const manualStatus = computeManualStatus();
    const auto = runAutoChecks();
    const verdict = computeVerdict(auto.success, manualStatus);

    printSection('Automatic Checks Output', auto.stdout.trim() || '(no stdout)');
    if (auto.stderr && auto.stderr.trim()) {
        printSection('Automatic Checks Errors', auto.stderr.trim());
    }

    const report = {
        generatedAt: nowIso(),
        autoChecks: {
            file: AUTO_TEST_FILE,
            success: auto.success,
            exitCode: auto.exitCode
        },
        manualSmoke: {
            status: manualStatus,
            checklistFile: 'QA_RELEASE_GATE_CHECKLIST.md'
        },
        verdict,
        nextSteps: buildNextSteps(verdict)
    };

    writeReport(report);

    printSection('Release Gate Verdict', verdict);
    printSection('Next Steps', report.nextSteps.map((s) => `- ${s}`).join('\n'));
    printSection('Report File', REPORT_FILE);

    process.exit(exitCodeForVerdict(verdict));
}

main();
