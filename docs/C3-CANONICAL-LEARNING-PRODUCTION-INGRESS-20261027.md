<!-- LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.C3.PRODUCTION_INGRESS
TAG: LEEWAY.LEARNING.C3.PRODUCTION_SOURCE_CONTRACT_V1
WHAT: Qualify every owned Learning Ledger interface without confusing source tests with live trust.
WHY: Protect immutable history, avoid duplicate learning, survive receipt/learning crashes and keep University read-only.
WHO: LeeWay Learning Ledger; original Receipt Authority, Independent Veritas and Production remain distinct.
WHERE: docs/C3-CANONICAL-LEARNING-PRODUCTION-INGRESS-20261027.md.
WHEN: 2026-10-27.
HOW: Exact request/digest contracts, role separation, retries, recovery, source tests and live admission matrix.
AUTHORITY: SOURCE CONTRACT ONLY; no protected writer, signers or receipt mutation.
-->
# C3 Learning Ledger — production ingress and read-only retrieval contract

**Parent original C3 mission:** [Runtime Fabric #21](https://github.com/4citeB4U/Leeway-Runtime-Fabric/issues/21). **Learning forensic owner:** [Learning Ledger Issue #2](https://github.com/4citeB4U/LeeWay-Learning-Ledger/issues/2). **Receipt Authority dependency:** [Runtime Issue #111](https://github.com/4citeB4U/Leeway-Runtime-Fabric/issues/111). **Execution/Veritas owners:** Runtime PRs [#75](https://github.com/4citeB4U/Leeway-Runtime-Fabric/pull/75), [#92](https://github.com/4citeB4U/Leeway-Runtime-Fabric/pull/92), [#105](https://github.com/4citeB4U/Leeway-Runtime-Fabric/pull/105), [#112](https://github.com/4citeB4U/Leeway-Runtime-Fabric/pull/112). This branch stacks on original Learning Ledger PR #1; original canonical GPU writer remains `Leeway-Runtime-Fabric/scripts/c3-learning-ledger-admission.mjs` and is NOT replaced.

## Distinguish contract readiness from live admission

Build order: Learning Ledger → Receipt Ledger → Independent Veritas → Production. A real transaction must prove original authorized execution, independent PRE/POST, exact Formula/effect/readback, canonical receipt atomic obligation, eligible Learning admission/readback, final production decision. A Learning Ledger candidate cannot become a real receipt signer.

| Learning-owned boundary | Newly implemented source | Unresolved production qualification |
| --- | --- | --- |
| Epistemic admission | `assessCommittedObligation` rejects mixed scope, raw personal fields, unexpected schema, unverified outcome and bogus digest | Authenticate *original* receipt/Veritas providers and deploy approved actor policy |
| Receipt correlation | `reconcileLearningObligation` rechecks exact original record and atomic learning obligation with Receipt Authority | Original Receipt Authority must **actually implement** atomic commit and independently attest it, Issue #111 |
| Independent qualification | Host binding roles separated, fresh Veritas outcome evidence required for the same key/digest/outcome | Real production independent issuer enrollment and cryptographically verified PRE/POST still open |
| Writer and idempotency | Read before append, compare unique admission key + digest, refuse conflict, read back result | Existing canonical writer must implement **atomic unique-key constraint**; source callbacks cannot ensure concurrent uniqueness |
| Crash/restart | ACK-loss returns `PENDING_RECONCILIATION`; replay queries original canonical writer; batch scanner never advances Receipt's cursor | Live process kill across all commit/ACK boundaries, on-disk original provider and receipt-owned relay/ACK required |
| Historical custody | Original prefix/snapshot adapter and readback from prior PR #1 unchanged | Current actual owner-host historical readback, valid/invalid tail quarantine and independent recovery proof |
| Private candidates | Existing owner AES-256-GCM hash-chain vault, consent and corrections from PR #1 remain isolated | KMS, authorized key rotation, retention/deletion/export, backup and cross-device restore |
| University / Skills retrieval | `retrieveVerifiedInstitutionalLessons` uses read policy, canonical record readback, bounded metadata only, excludes prompt text and private preferences | Qualify original University reader provider, issuer-backed permissions, indexed scope enforcement and retention policy |

**Not a parallel ledger:** The new inbox module has **no local canonical storage**, no signer, no new Veritas provider, no permission issuer and no Receipt writer. It only calls the canonical provider's approved `verifyBinding`, `findByAdmissionKey`, `admit` and `readback`. Existing diagnostic GPU-only writer remains restricted to its exact operation and must not be silently repurposed as a universal writer.

## Exact first-class states

- `CANDIDATE_EXPERIENCE`: private encrypted observation, no institutional authority.
- `SOURCE_SHAPE_VALID`: JSON schema/digest match only, no independent proof.
- `BLOCKED`: mismatch/unqualified identity/authority, no admission.
- `PENDING_RECONCILIATION`: provider unavailable, write outcome unknown, ACK lost, query before retry.
- `DISPUTED`: admission key or content conflict; no mutation, preserve evidence.
- `ADMITTED_VERIFIED`: only a qualified original canonical writer + exact durable readback under previously authenticated Receipt and Veritas host bindings. Source unit fixtures do not qualify this state on the actual host.
- `READ_ONLY_VERIFIED_LESSON_REFERENCES`: bounded metadata readback; never action/skill/policy authority.

**Prohibition:** A verified operational FAIL or DENIAL is a valid factual lesson outcome, not an execution success; the consumer's `productionAdmissionAuthorized` remains false. Model confidence, task fields and source CI never authorize a new skill.

## Immutable admission contract

A Receipt Authority outbox obligation is versioned `leeway.receipt.learning-obligation.v1` and is part of the **same durable canonical receipt commit**, not a second file appended afterward. It has `obligationId`, `requestId`, `outcomeId`, `receiptHash`, `receiptRecordId`, `receiptCommitId`, `admissionKey`, `eventDigest`, `commitState:COMMITTED`, `scope`, `origin`, and an exactly defined technical `event`.

The deterministic admission key is `requestId:outcomeId:receiptHash`. `eventDigest` is SHA-256 of recursively key-sorted UTF-8 JSON of a fixed nonpersonal technical event schema (identifiers, Formula/Veritas PRE/POST/readback hashes, source revision and verified outcome code). **Cross-language canonicalization must be verified with independent golden fixtures before actual integration.** Unknown fields—including conversation text or personal preferences—are rejected. Receipt and Veritas providers must independently authenticate their own signatures, version, scope, revocation and original physical proof.

The canonical Learning writer must impose a **durable, transactionally unique admission key**:
1. Same key + same digest → return same original record, with durable readback.
2. Same key + conflicting digest → `DISPUTED`, never replace.
3. If writer ACK is lost after append → requery original ledger by key, do not reappend blindly.
4. If original receipt is committed but Learning provider unavailable → original Receipt outbox remains pending, retry with bounded policy.
5. If outbox enumerator returns duplicate, malformed or over-limit IDs → hold the batch.
6. Batch consumer does not ACK/advance/delete Receipt outbox records; **Receipt Authority owns acknowledgment and checkpoint**, with original durable proof.

Exactly-once delivery is not claimed. Receipt-origin at-least-once delivery plus atomic unique-key canonical admission is the required effectively-once *effect* when fully implemented and proved.

## Root-of-trust and privilege controls

Three distinct providers and roles must be independently qualified under host trust:
`CANONICAL_RECEIPT_OUTBOX_READER`,
`INDEPENDENT_VERITAS_EVIDENCE_VERIFIER`,
`CANONICAL_LEARNING_LEDGER_WRITER`.
`providerId` cannot be reused across these roles. The source `verifyBinding` contract is an interface, **not** proof of signed issuer enrollment; real host providers must validate independently and must not be selected by untrusted task fields.

An Agent University reader has separate `CANONICAL_LEARNING_LEDGER_READER` permission, identity/scope and per-record readback. Only recognized metadata identifiers and verified status are returned. Raw untrusted model text, owner preferences and prompts cannot become executable instructions. Personal experiences continue via a separate consent-bound private owner-scoped vault.

## Full engineering-cycle checkpoint

1. **Investigate:** Read exact Learning PR #1 source tree, existing Runtime C3 canonical learning writer, Runtime `c3-learning-admission-boundary.mjs`, original Receipt issue #111, four-authority mission #21 and PR #112.
2. **Diagnose:** No reusable generic atomic receipt-outbox consumer, canonical per-key preappend lookup, conflict quarantine or scoped institutional University reader in the new Learning repo; existing GPU writer is specialized, and the legacy direct-file provider may falsely return `admitted:true` for candidates.
3. **Plan:** Reuse original issuer/writer/verifier, build only Learning ingress and retrieval adapters; fail closed when missing external authority.
4. **Implement:** `src/canonical-learning-inbox.mjs`; `src/institutional-readonly-projection.mjs` and source tests. No protected history changed.
5. **Test:** Run native Node source tests with synthetic provider roles, restart-on-disk fixture, missing/forged receipts, ambiguous ACKs, duplicate keys, role collisions and injection metadata.
6. **Validate:** Source contract, not live production signer/canonical writer.
7. **Repair:** Record exact failed CI and correct only reviewed defect, preserving original test.
8. **Retest:** Run full source suite + engineering archive scanner after each correction.
9. **Verify:** Require exact head GitHub Actions job logs, no claim of actual Independent Veritas.
10. **Evidence:** Source commit, PR, CI run, this document; production/receipt/learning permission all denied until independent host readback.

## Owner-host production acceptance matrix — NOT YET EXECUTED

- [ ] Verify old Learning Ledger protected bytes and historical prefix independent of newer appended records.
- [ ] Verify original Receipt Authority supports atomic immutable learning obligations in real committed receipt.
- [ ] Verify qualified authentic provider identity, source pin, same request and independently authenticated PRE/POST.
- [ ] Verify unique admissionKey and digest enforced transactionally by original canonical writer under **concurrent** delivery.
- [ ] Kill process after receipt commit, before Learning append; restart, reconcile, admit exactly one effect.
- [ ] Kill process after Learning append, before ACK; restart returns original record, no double append.
- [ ] Attempt same key with conflicting digest; original record remains unchanged, dispute is durable.
- [ ] Test verified success, verified failure and verified denial without reporting all as successful execution.
- [ ] Simulate invalid last record, missing proof, disk full, torn append, rollback and backup read-only reconstruction.
- [ ] Verify partial scoped outage and unrelated authorized workload continuation.
- [ ] Test cross-tenant access refusal, memory prompt injection refusal and private key/consent revocation.
- [ ] Verify qualified University reader projection from real original canonical readback.
- [ ] Verify full C3 original physical request across all four authorities and restart, with independently signed evidence.
- [ ] Publish genuine host/Veritas/Receipt/Learning evidence to original mission #21; promote only after independent policy/production admission.

**Current authoritative status:** `SOURCE_DEVELOPMENT_IN_REVIEW / REAL_CANONICAL_AUTHORITY_NOT_ENROLLED / PRODUCTION_BLOCKED`. The Creator's 98% reduction target remains **unmeasured**; no source CI ratio is a production failure-reduction statistic.
