<!-- LEEWAY HEADER — DO NOT REMOVE | REGION: LEEWAY.LEARNING_LEDGER | TAG: LEEWAY.LEARNING.ROOT | WHO: LeeWay Industries / Creator-authorized engineering | WHAT: Source home for experiential memory and growth | WHY: Preserve learning, including uncertainty and failure, without replacing governance | WHERE: 4citeB4U/LeeWay-Learning-Ledger | WHEN: 2026-10-27 | HOW: Tested, evidence-bounded candidate subsystem | LICENSE: MIT -->
# LeeWay Learning Ledger — Experiential Memory & Growth Engine

This repository is the **source home** for LeeWay's experiential growth development. The initial module is an **owner-scoped, encrypted, non-production candidate experience vault**, not a new canonical Receipt Ledger, Veritas authority, Formula runtime, Agent Lee identity, or production Learning Ledger writer.

## Development purpose

Support individual and collective agents learning from attempts, unexpected results, feedback, corrections, preferences and interaction patterns. Learning includes imperfect and failed experiences. Every learned conclusion should carry evidence, scope, uncertainty, counterexamples and correction history. User patterns can inform *suggestions*, never silently authorize monitoring, notifications or actions.

A conversation at 4 a.m. means *interaction observed at 4 a.m.*; it does **not** prove wake time, sleep time, fatigue or psychological state. Absence of messages proves none of these things. Temporal patterns are candidate hypotheses, and should remain adjustable by the user.

## Existing authority — reuse, do not duplicate

- Creator/Human Authority and [LeeWay Standards Book 59](https://github.com/4citeB4U/Leeway-Runtime-Fabric/blob/main/standards/standards/BOOK-59-SKILL-DEVELOPMENT-LEDGER-LAW.md)
- [Learning Ledger constitutional skill](https://github.com/4citeB4U/LeeWay-Agent-Skills/blob/main/skills/leeway-learning-ledger/SKILL.md)
- [Runtime Fabric C3 learning admission boundary](https://github.com/4citeB4U/Leeway-Runtime-Fabric/blob/main/automation-runtime/c3-learning-admission-boundary.mjs)
- Canonical Veritas / Receipt Authority, Formula, Continuum and Agent University retain their existing roles.

**C3 production admission stays BLOCKED until a separately qualified same-request end-to-end path proves actual execution, Veritas PRE/POST, canonical receipt and exact learning admission/readback.** These modules never emit `ADMITTED_VERIFIED`.

## Initial modules

- `src/experience-vault.mjs`: encrypted, owner-scoped candidate journal with hash-chain integrity, explicit initialization, fsync, writer lock, duplicate event rejection and exact readback. Requires caller-owned 32-byte key; captures experience arcs (goal, environment, expectation, observation, friction, recovery, uncertainty) and consent-change events without promoting their claims.
- `src/experience-projection.mjs`: deterministic, read-only tentative interaction windows, candidate experience arcs and explicit-preference projections; requires matching owner and separate personalization permission; revocation removes previous data from active projections; no sleep/mood inference or proactive authorization.
- `src/university-handoff.mjs`: source-only private University/Agent Skills candidate-context adapter requiring an independent expected journal head and an externally supplied owner-access decision. No production authorization or admission is implied.
- `test/experience.test.mjs` and `test/university-handoff.test.mjs`: fictional, ephemeral-key regression tests.
- `docs/ARCHITECTURE.md`: boundary, University contract, privacy, resilience and missing production gates.

Run `npm test` with Node 22 or newer (no npm dependencies).

## Public repository privacy and survival rule

**NEVER commit real conversation transcripts, personal preference records, sleep hypotheses, audio, identity profiles, encrypted private journals, vault keys, access tokens, or production receipts.** Personal runtime data must remain in authorized private owner storage with a real key manager and revocation/deletion workflow. The example vault provides confidentiality and local integrity checks, not a complete multi-device backup or production key-management system.

A missing, locked or corrupted journal fails closed. Vault creation requires explicit `vault.initialize()`, and callers may supply an expected external head hash on readback. No automatic lock deletion, history rewriting, production provider registration, or simulated Veritas proof is allowed. Dormant or outdated lessons remain indexed with provenance; correcting a projection does not alter the original observation.

## Development status

`SOURCE_IMPLEMENTED / LOCAL_TESTS_REQUIRED / PRODUCTION_UNVERIFIED`. GitHub CI is a source-level regression gate, not operational admission. No protected local host ledger has been read or modified by this repository initialization.

## C3 canonical Learning ingress and University projection — stacked source review

[Draft PR #3](https://github.com/4citeB4U/LeeWay-Learning-Ledger/pull/3), stacked on the original experiential candidate PR #1, adds **source-only** contracts around the EXISTING canonical Learning Ledger provider:

- `src/canonical-learning-inbox.mjs`: takes a **committed receipt-owned** outbox obligation, rechecks the original Receipt Authority's atomic commit and independently qualified Veritas outcome, refuses mismatched issuer roles, and asks the original canonical Learning writer to perform unique-key admission and durable readback. Existing errors become `BLOCKED`, `DISPUTED` or `PENDING_RECONCILIATION`, never invented production success. A bounded delivery scanner does not mutate Receipt Authority acknowledgments or cursors.
- `src/institutional-readonly-projection.mjs`: retrieves only authenticated, nonpersonal, verified record identifiers and coded technical patterns for authorized University/Agent Skills readers. Raw prompts, interaction rhythms and private preferences never enter the projection; it has no skills, tool or permission mutation path.
- Synthetic Node source tests cover receipt/Veritas/Formula correlation, independent provider roles, private-record refusal, concurrent duplicates, failure/denial learning, lost acknowledgments, restarts and query failures. They do **not** exercise production credentials or the original canonical writer on the owner's host.

**Unresolved production dependencies:** Original Receipt Authority must implement the atomic receipt/outbox obligation and durable ACK; the original canonical Learning writer must enforce multi-process unique admission keys; actual independent Veritas and Receipt issuer bindings, live owner-host readback, crash/backup testing and qualified University access remain unverified. [Full contract and live acceptance checklist](docs/C3-CANONICAL-LEARNING-PRODUCTION-INGRESS-20261027.md). Do not confuse draft-source readiness with production certification.
