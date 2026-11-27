<!-- LEEWAY HEADER — DO NOT REMOVE | REGION: LEEWAY.LEARNING_LEDGER | TAG: LEEWAY.LEARNING.ROOT | WHO: LeeWay Industries / Creator-authorized engineering | WHAT: Source home for experiential memory and growth | WHY: Preserve learning, including uncertainty and failure, without replacing governance | WHERE: 4citeB4U/LeeWay-Learning-Ledger | WHEN: 2026-10-27 | HOW: Tested, evidence-bounded candidate subsystem | LICENSE: MIT -->
# LeeWay Learning Ledger — Experiential Memory & Growth Engine

This repository is the **source home** for LeeWay's experiential growth development. The initial module is an **owner-scoped, encrypted, non-production candidate experience vault**, not a new canonical Receipt Ledger, Veritas authority, Formula runtime, Agent Lee identity, or production Learning Ledger writer.

## Development purpose

Support individual and collective agents learning from attempts, unexpected results, feedback, corrections, preferences and interaction patterns. Learning includes imperfect and failed experiences. Every learned conclusion should carry evidence, scope, uncertainty, counterexamples and correction history. User patterns can inform *suggestions*, never silently authorize monitoring, notifications or actions.

A conversation at 4 a.m. means *interaction observed at 4 a.m.*; it does **not** prove wake time, sleep time, fatigue or psychological state. Absence of messages proves none of these things. Temporal patterns are candidate hypotheses, and should remain adjustable by the user.

## Mandatory first / second / last learning authority discovery

**FIRST:** the approved [LeeWay Standards](https://github.com/4citeB4U/LeeWay-Standards/blob/main/Docs/governance/LEEWAY-CANONICAL-ENGINEERING-LAWS.md) and Book 59, followed by root [AGENTS.md](AGENTS.md) and the current owning mission/role grants.

**SECOND:** [Ordered Learning Authority Contract](docs/ORDERED-LEARNING-AUTHORITY-CONTRACT.md), the existing [Agent Skills Learning Ledger skill](https://github.com/4citeB4U/LeeWay-Agent-Skills/blob/main/skills/leeway-learning-ledger/SKILL.md), original Machine Consciousness employee policy, and Digital Workforce assessment contract. Distinguish permission to read, capture, practice in isolation, practice live, evaluate, propose admission, admit and deploy.

**LAST:** the original [Runtime C3 learning admission boundary](https://github.com/4citeB4U/Leeway-Runtime-Fabric/blob/main/automation-runtime/c3-learning-admission-boundary.mjs), actual authorized Receipt Authority/Continuum readback, independent reviewer decision and owning mission checkpoint. Never infer a durable learning result from passing source tests.

The source-only stage checker [src/learning-stage-conformance.mjs](src/learning-stage-conformance.mjs) validates learning stage and permission obligations in tests; it **does not** grant real permissions, call a model trainer, or write the canonical Learning Ledger.

## Existing authority — reuse, do not duplicate

- Creator/Human Authority and [LeeWay Standards Book 59](https://github.com/4citeB4U/Leeway-Runtime-Fabric/blob/main/standards/standards/BOOK-59-SKILL-DEVELOPMENT-LEDGER-LAW.md)
- [Learning Ledger constitutional skill](https://github.com/4citeB4U/LeeWay-Agent-Skills/blob/main/skills/leeway-learning-ledger/SKILL.md)
- [Runtime Fabric C3 learning admission boundary](https://github.com/4citeB4U/Leeway-Runtime-Fabric/blob/main/automation-runtime/c3-learning-admission-boundary.mjs)
- Canonical Veritas / Receipt Authority, Formula, Continuum and Agent University retain their existing roles.

**C3 production admission stays BLOCKED until a separately qualified same-request end-to-end path proves actual execution, Veritas PRE/POST, canonical receipt and exact learning admission/readback.** These modules never emit `ADMITTED_VERIFIED`.

## Initial modules

- `src/experience-vault.mjs`: encrypted, owner-scoped candidate journal with hash-chain integrity, fsync, writer lock, duplicate event rejection and exact readback. Requires caller-owned 32-byte key and capture consent.
- `src/experience-projection.mjs`: deterministic, read-only tentative interaction windows and explicit-preference projections; correction-aware, no sleep/mood inference or proactive authorization.
- `test/experience.test.mjs`: fictitious/ephemeral-key regression tests.
- `docs/ARCHITECTURE.md`: boundary, University contract, privacy, resilience and missing production gates.

Run `npm test` with Node 22 or newer (no npm dependencies).

## Public repository privacy and survival rule

**NEVER commit real conversation transcripts, personal preference records, sleep hypotheses, audio, identity profiles, encrypted private journals, vault keys, access tokens, or production receipts.** Personal runtime data must remain in authorized private owner storage with a real key manager and revocation/deletion workflow. The example vault provides confidentiality and local integrity checks, not a complete multi-device backup or production key-management system.

A locked or corrupted journal fails closed. No automatic lock deletion, history rewriting, production provider registration, or simulated Veritas proof is allowed. Dormant or outdated lessons remain indexed with provenance; correcting a projection does not alter the original observation.

## Development status

`SOURCE_IMPLEMENTED / LOCAL_TESTS_REQUIRED / PRODUCTION_UNVERIFIED`. GitHub CI is a source-level regression gate, not operational admission. No protected local host ledger has been read or modified by this repository initialization.

<!-- LEEWAY UNIVERSAL FORMULA GOVERNANCE BEGIN -->

# LeeWay Universal Formula Governance

Authority: Creator and LeeWay Standards.
Formula identity: LEEWAY-FORMULA-v1.0.

The canonical LeeWay Formula is mandatory throughout
the entire LeeWay ecosystem.

Every current and future application, capability,
agent, worker, employee, model, provider, adapter,
automation and integration inherits this requirement.

All applicable interactions, responses, decisions,
actions, revisions, executions, computations, model
inferences, resource allocations, information transfers,
memory operations, storage operations and deployments
must consume the canonical Formula through their
authorized and qualified domain contracts.

Formula availability, documentation, configuration,
health and historical results do not constitute actual
Formula consumption for a new operation.

Recover relevant authorized memory before substantive
work. Preserve identity, provenance, Formula integrity,
authorization, original receipts and verified learning.

Never invent observations, adapter mappings, mathematical
results, execution evidence or independent verification.

No application may bypass applicable Formula governance
by dispatching directly to a provider.

Every new application and capability must demonstrate
applicable Formula consumption before production admission.

Preserve the existing authority hierarchy:

Creator > Standards > Root of Trust > Runtime Fabric >
Agent Lee > Harness > Formula > skills/models/tools >
execution > Veritas > Receipt Authority > Learning Ledger.

Execute the complete engineering loop:

INVESTIGATE > DIAGNOSE > PLAN > IMPLEMENT > TEST >
VALIDATE > REPAIR > RETEST > VERIFY > EVIDENCE >
CHECKPOINT > CONTINUE.

Documentation compliance does not establish executable
enforcement or production admission.

<!-- LEEWAY UNIVERSAL FORMULA GOVERNANCE END -->
