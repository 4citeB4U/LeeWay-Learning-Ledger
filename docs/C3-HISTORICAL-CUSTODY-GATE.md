<!--
LEEWAY HEADER — DO NOT REMOVE | REGION: LEEWAY.LEARNING_LEDGER.C3.CUSTODY
TAG: LEEWAY.LEARNING.C3.HISTORICAL_OWNER_GATE
WHAT: Read-only original Learning Ledger custody runbook.
WHY: Existing evidence is not a substitute for fresh Veritas PRE/POST and canonical learning.
WHO: Owner-authorized engineers.
WHERE: docs/C3-HISTORICAL-CUSTODY-GATE.md
WHEN: C3 source-custody stage, 2026-10-27.
HOW: Pinned original Runtime Fabric reader, no ledger writes.
LICENSE: MIT
-->
# C3 source custody — original historical Learning Ledger

## What is independently available as of this review
- Runtime Fabric source: `scripts/existing-learning-ledger-readback.mjs` (Git blob `288bb789c5e6c2cae11e5f353b920f7afc5e3142`).
- 2026-10-23 live owner-host readback **reported** SHA-256 `f927f3c5365af763b02be3c6a2f5cefc17e73bdd08b4ec62f127b9c2cbfde2f0` for the qualified deployed read-only adapter.
- The original Learning Ledger historical 133-record SHA-256 was `1167118df27d8f028055ebef9f2cf3e0ca549be1732cc56150a422a968ac1f72`; original event proof SHA-256 `1102d6a8474d4e3a8070b623669d6f128fc5a45675264acfb154532b75a79bb1`. The 2026-10-23 observed ledger had 134 records; later appends, if any, remain unauthenticated by the historical prefix proof.
- Runtime Fabric `provider.registry.json` at review lists 51 static providers but lacks independent `evidence.veritas` and `learning.ledger.admission` provider registrations. `receipt.ledger` BOUND_PASS in static registry is not proof of local live health.

**Critical distinction:** `71d54205154897ef4d0e3945f77e5cfd22dad8838b3e229494454ac4e5a801a5` belongs to the **Receipt Ledger** writer, not the Learning Ledger writer. The historic Learning Ledger writer's own SHA-256 is validated by the original qualified reader against the historical receipt/config. Never substitute hashes across authorities.

## Run only on the actual authorized owner Windows host

Using Node.js 22+ in this source checkout and the **existing** Runtime Fabric reader at its previously reviewed location, invoke:

```powershell
node .\scripts\c3-custody-preflight.mjs --reader "E:\LeeWay-Work\pc-consciousness-live\runtime\scripts\existing-learning-ledger-readback.mjs"
```

The reader resolves its own original proof/config/ledger paths and checks writer source, original proof, and exact historical prefix. Optional explicit `--proof` and `--config` flags must both be given and point to regular absolute files.

Expected classification if all evidence remains intact: `SCOPED_HISTORICAL_CUSTODY_OBSERVED`, with historical/current counts, SHA-256s, no writes and **no new canonical learning admission**. On any mismatch, unknown source, incomplete data, or missing host: `BLOCKED`. No automatic migration, repair, installer, provider enrollment, stale lock deletion, or actual execution is performed.

## Limits and next gate
This preflight is not live operator authority, no new signed Veritas PRE/POST and no C3 production certificate. It **cannot be honestly executed from a remote GitHub code review**: host files and original local Receipt Ledger are not exposed by GitHub. CI tests only source behavior with synthetic examples. Retain the existing canonical writer and registry ownership in Runtime Fabric.

After an owner-host report is independently inspected, verify current live `127.0.0.1:4104/health`, issuer grants, correct task-scoped independent Veritas PRE/POST, Formula/Continuum evidence, canonical Receipt Ledger append/readback, and same-request qualified Learning Ledger admission/readback. The source-only University handoff remains separate from canonical production learning.
