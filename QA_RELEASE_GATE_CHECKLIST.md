# QA Release Gate Checklist (5 minutes)

Use this checklist after automatic tests are green.

## 0) Automatic gate

- [ ] Run `node qa-release-gate.js`
- [ ] Confirm automatic checks are green (`Passed: 8/8`)

## 1) Save robustness smoke

- [ ] Import a valid save with `pokedollars = 0` → import succeeds and game reloads.
- [ ] Import an invalid/corrupted save → no crash, clear error feedback.
- [ ] Reload game with current save → no load error toast.

## 2) Offline gains smoke

- [ ] Simulate long absence (or edit `lastSaveTime`) and reload.
- [ ] Confirm offline rewards appear without `NaN`/`Infinity`.
- [ ] Confirm rewards feel bounded (no absurd spike).

## 3) Large number UI smoke

- [ ] Header resources remain readable (no overlap/cut beyond ellipsis).
- [ ] Shop costs and currency labels are compact-formatted (`K/M/B/...`).
- [ ] Recycler counters stay readable with high values.

## 4) Click stress smoke (quick)

- [ ] Rapidly click menu/modal open-close for ~20s: no freeze, no duplicated modal stacks.
- [ ] No blocking console runtime errors during stress.

## 5) Release decision

- [ ] If all checks above pass, validate gate:
  - Run `node qa-release-gate.js --manual-pass`
- [ ] If at least one manual check fails:
  - Run `node qa-release-gate.js --manual-fail`
  - Fix issue(s) before release.

## Verdict rules

- `GO` = automatic checks green + manual smoke pass.
- `PENDING_MANUAL` = automatic checks green but manual smoke not validated yet.
- `NO-GO` = automatic checks fail or manual smoke fails.
