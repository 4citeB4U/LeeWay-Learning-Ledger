<!-- LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.INDEPENDENT_QUALIFICATION
TAG: LEEWAY.LEARNING.COMPONENT_GOAL_AND_GO_NOGO_V1
WHAT: State full Learning Ledger product, present source, remaining owned work and acceptance prior to integration.
WHY: Passing source tests does not prove an independently deployable, durable canonical Learning service.
WHO: Canonical Learning Ledger owner and creator-governed reviewers, not a new issuer.
WHERE: docs/LEARNING-LEDGER-INDEPENDENT-COMPONENT-QUALIFICATION-20261028.md
WHEN: 2026-10-28.
HOW: Inspect existing main/PRs, canonical source, ownership, historic custody and external interfaces.
LICENSE: MIT
-->
# Learning Ledger ONLY — full goal, actual status and work to finish BEFORE integration

**Scope:** One original `4citeB4U/LeeWay-Learning-Ledger` authority, not the whole SH-01 ecosystem and not a replacement Receipt, Veritas, Formula, Runtime or storage authority. **As-of source:** 2026-10-28. The `main` branch is README-only at `7c68a824b326b26a1d386edfba11d352863531a0`; [candidate PR #1](https://github.com/4citeB4U/LeeWay-Learning-Ledger/pull/1) and stacked [C3 ingress PR #3](https://github.com/4citeB4U/LeeWay-Learning-Ledger/pull/3) are OPEN DRAFT. [CI #40630987933](https://github.com/4citeB4U/LeeWay-Learning-Ledger/actions/runs/40630987933) passes 92/92 **source** tests and verifies four `SOURCE_LOOP_DOCUMENTED` checkpoints. No independently verified installed canonical Learning writer, real owner-host ledger, live signer or release is established.

**Machine-readable gate evidence:** [`learning-ledger-independent-readiness.v1.json`](learning-ledger-independent-readiness.v1.json). Its source classifications are neither Veritas certification nor production admission.

## I. Complete final goal

The Learning Ledger must become LeeWay's **single governed long-term learning authority**: durable, owner-scoped where personal, independently proven where institutional, historically continuous, portable, replay-safe, privacy-preserving, and retrievable as knowledge **without turning knowledge into authorization**.

It has two strictly separated lanes:

**A. Institutional technical learning:** Store true **verified success, verified failure, verified denial, recovery attempts, capability debt, measured work/cost, qualified skill weaves and technical transfer** against an exact original operation/request/outcome. Each admitted record must have the original canonical receipt and commit reference, independent Veritas PRE/POST and actual readback references, exact Formula/source provenance, bounded outcome taxonomy, unique admission key and event digest. Failure learning does NOT mean the failed operation succeeded. Real admission is performed by the original canonical Learning writer only.

**B. Owner-private experiential memory:** Encrypt observed attempts, goals, interactions, mistakes, unexpected outcomes, explicit preferences, corrections and tentative lessons in **private owner-scoped storage**, under distinct collection consent, personalization consent and proactive-action authorization. The user can correct, opt out, export and erase as authorized. Unverified observations cannot migrate to institutional records or trigger tasks without new evidence and permission.

**Shared invariants:** (1) no new authority/permission/identity; (2) no extra canonical Learning writer; (3) original 133-event anchored historical prefix is not rewritten; (4) exact immutable append/readback and dispute history; (5) read-only scoped University/Agent Skills references never become executable prompts; (6) no assumed C: or E: developer-drive dependency for portable components; (7) identical stable identity and source provenance across restart; (8) local standalone operation without GitHub Actions/Pages as the backend.

**Demonstration before integration:** Install the real original Learning writer and a private candidate vault on an isolated authorized test host; inspect original historical chain; admit one prequalified synthetic technical outcome through strictly isolated test-only issuer interfaces; prove one durable record under 64 concurrent identical writes; refuse same-key different digest; kill/restart between every write/lookup/readback boundary and reconcile; prove byte-exact recovery from backup; verify two owner scopes and consent/revocation; read back only coded institutional data, never execute retrieved instructions. Test issuer interfaces may provide controlled fixtures, **never production authorization**.

## II. Present source — what actually exists

| Source already in draft | Source-proven behavior | What it does NOT prove |
| --- | --- | --- |
| `src/experience-vault.mjs` | Encrypted AES-256-GCM journal, exclusive lock, append fsync, owner scoping, hash readback | Production owner key manager, erasure/export, clean-host restore |
| `src/experience-projection.mjs` | Tentative private experience and explicit preference projections with opt-out suppression | Live owner authentication or proactive consent |
| `src/university-handoff.mjs` | Private read-only `CANDIDATE_CONTEXT_ONLY` with external journal anchor | Qualified institutional lesson or approved action |
| `src/c3-historical-custody.mjs` | Source-pinned historical 133-event readback and fail-closed checks | Actual current owner-host historical custody |
| `src/canonical-learning-inbox.mjs` | Strict nonpersonal fields, role claims, event digest/unique key, read-before-append and reconciliation | Real original writer atomic uniqueness, issuer cryptographic trust or live service |
| `src/canonical-learning-delivery-ack.mjs` | Recheck original obligation and durable readback, source-level lost-ACK recovery | Actual Receipt Authority-owned ACK transaction, which Learning must not implement |
| `src/institutional-readonly-projection.mjs` | Bounded verified technical metadata, excludes private text and tool instructions | Production authenticated reader, durable authorized indexing |
| `test/*.test.mjs` + checkpoint docs | 92/92 synthetic source PASS, four complete documented source engineering cycles | Physical multi-process writer, key rotation, disk failures or release |

## III. Exactly how far remains

**3 SOURCE_TESTED**, **8 PARTIAL_SOURCE**, **7 NOT_IMPLEMENTED** among **18 Learning-owned independent gates**. None of the 18 has authenticated *physical original-writer* qualification. These are counts of requirements—not a 17%, 40%, 92% or other fabricated measured system-completion percentage.

| Gate | Learning-owned responsibility | Present source | Remaining engineering to do BEFORE other-component integration | Independent PASS test |
| --- | --- | --- | --- | --- |
| LL-01 | Canonical ownership and source promotion | PARTIAL_SOURCE | Prepare reviewed release line from original two drafts without losing owner history. | Merged signed/version-pinned source on approved canonical branch; no duplicate canonical writer. |
| LL-02 | Original canonical Learning writer adapter | NOT_IMPLEMENTED | Inspect/pin original Learning writer, implement its qualified provider adapter; preserve original append history. | Authentic writer identity and readback on an authorized isolated Learning host, without Receipt/Veritas dependency fakes. |
| LL-03 | Writer atomic uniqueness and replay | NOT_IMPLEMENTED | Unique constraint on original admissionKey and eventDigest, multi-worker conflict handling, durable lookup-before-retry. | 64+ concurrent same-key submits yield exactly one canonical record; mismatch never overwrites. |
| LL-04 | Historical custody and immutable prefix | PARTIAL_SOURCE | Independent original source hash/journal head check, quarantined corrupt tails, owner-approved backup/restore. | Byte-identical known prefix and exact anchor verified before/after rehearsal; no original history rewrite. |
| LL-05 | Epistemic states and source event validation | SOURCE_TESTED | Freeze code states, metadata semantics, outcome taxonomy, optional measured cost/transfer evidence with standards review. | All coded source statuses and invalid inputs are deterministic; no inferred failure becomes an execution PASS. |
| LL-06 | Original Receipt/Veritas interface contract | PARTIAL_SOURCE | Freeze source protocol and two-hash semantics, typed issuer IDs/expiry/revocation, fail-closed absent roles. | Independent adapter-conformance tests reject forged/stale issuer, wrong scope and hash provenance. |
| LL-07 | Crash/restart and uncertain-ACK reconciliation | PARTIAL_SOURCE | Implement persisted reconciliation index on original writer and exact restart-safe source consumer state. | Crash at all Learning write/readback/ACK boundaries never double-admits or blindly ACKs. |
| LL-08 | Private candidate encrypted journal | PARTIAL_SOURCE | Package approved storage layout and owner key-provider contract, lock expiry/recovery and invalid tail quarantine. | Real owner key and restart test, denied wrong key/scope and verifiable private journal readback. |
| LL-09 | Identity, consent, corrections and revocation | PARTIAL_SOURCE | Bind owner identity, collection/personalization consent separation, corrections/supersession and policy checks. | Denied/unconsented owner requests reveal no data; revocations remove derived views immediately. |
| LL-10 | Privacy retention, export and erasure | NOT_IMPLEMENTED | Create explicit privacy retention index, export, deletion/crypto-erasure proof and independent policy review. | Owner-scoped export, correction, revocation and erasure tested with durable recovery and legal holds. |
| LL-11 | Recovery backups and portable storage | NOT_IMPLEMENTED | Implement verified snapshot/restore preserving exact original history; use approved Continuum transport only after independent qualification. | Rebuild bytes/journal indexes on a clean host and prove recoverability after loss. |
| LL-12 | Institutional read-only reference projection | SOURCE_TESTED | Finalize output version, access-control adapter and indexed readback consistency. | Authorized reader receives only coded verified records, and unauthorized reader always denied. |
| LL-13 | Private owner-scoped University candidate projection | SOURCE_TESTED | Finalize private output/consent model and exact source provenance for downstream adapter. | Candidate remains CANDIDATE_CONTEXT_ONLY with no ability to issue action or verified lesson. |
| LL-14 | Tenant isolation and injection-safe retrieval | PARTIAL_SOURCE | Harden index-side scope filters, no prompt/tool authority, cross-user RAG adversarial test suite. | N-way tenants and hostile retrieved strings never cross scope, issue tools or alter permissions. |
| LL-15 | Portable deployment and service discovery | NOT_IMPLEMENTED | Node22-native capability adapter or authorized Windows-original-writer bridge using runtime configuration, explicit data root, health and readiness. | Install and restart without default E:/ or C:/, outside CI; all routes resolve approved owner-scoped storage. |
| LL-16 | Component test suite and cross-platform quality | PARTIAL_SOURCE | Expand fault injection, stable golden vectors, verify full engineering archive and reproducible cross-platform smoke. | Full Learning-only suite including actual storage survives repeat Windows/Linux restarts without mocks. |
| LL-17 | Observability, reconcile queue and operator controls | NOT_IMPLEMENTED | Implement read-only health, counts by state, bounded retry, backpressure and dispute quarantine with receipts. | Outages report accurate PENDING/BLOCKED/DISPUTED without false green; repair can resume only after evidence. |
| LL-18 | Original-release provenance and rollback | NOT_IMPLEMENTED | Publish reviewed reproducible release with source digest, config contract, immutable migration plan and rollback. | Independent artifact hash, no hidden historical writes, rollback restores service without losing receipts. |

## IV. Work package order — component engineering only

**LL-A / P0 — Establish its own canonical writer and immutable history first.** Complete LL-01, LL-02, LL-03, LL-04. Review original writer scripts and source hashes (the old GPU-only PowerShell adapter is **not** a universal service). Resolve which original writer and history are canon; preserve bytes and signed custody, do not adopt a competing JSON/SQLite ledger. Implement original-writer provider methods, unique index/locking across *all writers*, exact readback and on-disk journal replay. Test actual 64-client parallel submissions, different event digest conflict, hard kills and restart with unknown ACK; never reset history to force a green test.

**LL-B / P0 — Complete independent data trust, privacy and epistemic behavior.** Complete LL-05, LL-06, LL-08, LL-09, LL-10, LL-11, LL-14. Freeze source schemas, explicit observed vs inferred vs independently proven states, owner-authenticated private key, key rotation, private retention, owner export/deletion, correction/supersession and correct revocation, cross-owner red-team retrieval and byte-exact restore of original encrypted data. Test self-reported `VERIFIED` refusals and hostile RAG/tool-instruction content.

**LL-C / P0 — Portable learning-only API and safe recovery.** Complete LL-07, LL-12, LL-13, LL-15, LL-17. Implement an authorized configuration contract for original writer, health/readiness, private owner storage, bounded capability `learning.health.read`, `learning.custody.inspect`, consented `learning.candidate.append/read`, original-provider-only `learning.institutional.admit` and scope-bound `learning.institutional.read`. Add restart-safe reconciliation, queue/backpressure, DISPUTED quarantine, timeouts and genuine operator diagnostics. Do **not** add a second Runtime Fabric dispatcher or a Receipt-owned ACK writer.

**LL-D / P0 — Real isolated acceptance and release.** Complete LL-16 and LL-18 and retest every gate: Linux and Windows with original writer (where physically supported), genuine cold/warm startup, protected historical prefix, source and artifact SHA pins, all process crash boundaries, disk-full/torn append, clean-host backup/restore, negative tenant tests, approved private key/consent epoch, read-only University projection and traceable rollback. Archive all ten stages **Investigate → Diagnose → Plan → Implement → Test → Validate → Repair → Retest → Verify → Evidence** with actual PASS/FAIL evidence and independent custodian review. Do not declare independent readiness from GitHub fixture success alone.

## V. Separate external interfaces — later integration, not a prerequisite to writing Learning-only code

| Gate | Separate sovereign owner | Evidence it must eventually provide | Present status |
| --- | --- | --- | --- |
| EXT-01 | Original Receipt Authority | Atomically commit canonical execution receipt plus eligible nonpersonal Learning obligation and supply authenticated readCommittedObligation, verifyAtomicReceiptCommit, listPendingObligationIds and Receipt-owned delivery ACK | EXTERNAL_NOT_QUALIFIED |
| EXT-02 | Independent Veritas | Bound issuer cryptographic PRE/POST, privacyCleared and transferEligible with revocation and exact source/context keys | EXTERNAL_NOT_QUALIFIED |
| EXT-03 | Canonical Formula and Runtime Fabric | True same-request Formula and observed physical execution, provider registry and original end-to-end mission | EXTERNAL_NOT_QUALIFIED |
| EXT-04 | LeeWay Standards | Versioned original authority registry, approved policy and trust-root enrollment/rollback | EXTERNAL_NOT_QUALIFIED |
| EXT-05 | Continuum / protected host storage | Qualified owner-scoped storage and exact byte backup/recovery transport for persistent private candidate data | EXTERNAL_NOT_QUALIFIED |
| EXT-06 | Agent University/Skills consumers | Read-only independently authorized, privacy-scoped retrieval; no skill execution or policy promotion | EXTERNAL_NOT_QUALIFIED |

**Important unresolved interface:** Runtime Receipt-owner PR #115 currently defines `receiptHash` as the *execution receipt hash*. Earlier C3 Learning/Runtime evidence used it as the *canonical chained Receipt Ledger record hash*. Learning must not conflate these; freeze a reviewed two-hash/contract version with exact golden vectors, or refuse ambiguity. The Learning component can build correct schema/denial tests now; actual Receipt/Veritas signing belongs to their own owners.

## VI. Release and integration-entry gate

**Before Learning can start integration, all must be true:** canonical approved code promoted from PRs #1/#3; authentic installed original writer with immutable verified 133-event historical anchor; cross-process atomic unique admission and independent durable readback; nonpersonal candidate/verified separation; owner-scoped encryption and complete key/consent/export/erasure/backup; real portable service/health and no built-in developer path; correct scoped private and institutional read-only access; robust crash/duplicate/conflict tests; signed pinned release, rollback and complete ten-stage evidence. *Only then* independently mark `LEARNING_COMPONENT_READY_FOR_INTEGRATION` based on reviewed physical evidence.

**What remains after that point:** Independently qualified owner/Standards/Formula/Veritas actual PRE and POST → real Runtime operation → original Receipt Authority atomic commit and learning obligation/outbox → canonical Learning writer unique record and durable ACK → final independent Production acceptance. That is the integrated C3 chain; **do not require it to exist while writing the Learning-only component**, and **do not claim it has passed** from isolated component tests.

**Fail closed on:** unrecognized issuer, unknown owner key, stale/corrupt historic pin, conflicting admission key, ambiguous receipt hash, private cross-tenant leak, unsigned policy, unknown durable write, replay without independent readback, unreviewed source update, expired consent, or self-promoted skills. No real private data, keys or protected original receipts in the public GitHub repo.

**Current disposition:** `LEARNING_SOURCE_TESTED / INDEPENDENT_COMPONENT_NOT_READY / INTEGRATION_NOT_STARTED / C3_PRODUCTION_NOT_AUTHORIZED`. Original runtime and ledgers were not accessed or modified by this independent source audit.
