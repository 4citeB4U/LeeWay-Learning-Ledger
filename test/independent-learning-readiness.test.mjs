/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.INDEPENDENT_READINESS_TEST
TAG: LEEWAY.LEARNING.INDEPENDENT_COMPONENT_NO_FAKE_PASS_TEST_V1
WHAT: Refuse component-only source audit promotion, forged issuer ownership and incomplete exit gates.
WHY: Real Learning host acceptance and separate Receipt/Veritas providers remain unverified by GitHub CI.
WHO: Original LeeWay Learning Ledger source CI.
WHERE: test/independent-learning-readiness.test.mjs
WHEN: 2026-10-28.
HOW: Read versioned audit, apply tampered source fixtures, assert safe fail-closed statuses.
LICENSE: MIT
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assessLearningIndependentReadiness as assess} from '../src/independent-learning-readiness.mjs';
const source=JSON.parse(readFileSync(
 new URL('../docs/learning-ledger-independent-readiness.v1.json',import.meta.url),'utf8'));
const fixture=()=>structuredClone(source);
test('01 actual source inventory has exactly 18 owned gates, 6 external dependencies and remains blocked',()=>{
 const a=assess(fixture());
 assert.equal(a.status,'SOURCE_READINESS_INVENTORY_VALID');
 assert.deepEqual([a.ownedGateCount,a.externalGateCount],[18,6]);
 assert.deepEqual([a.sourceTested,a.partialSource,a.notImplemented],[3,8,7]);
 assert.equal(a.readyForIntegration,false);
 assert.equal(a.componentIndependentlyQualified,false);
 assert.equal(a.productionAdmissionAuthorized,false);
});
test('02 externally issued production pass cannot be embedded in independent source audit',()=>{
 const s=fixture();s.integrationEligibility.productionAdmissionAuthorized=true;
 assert.equal(assess(s).reason,'PREINTEGRATION_FALSE_PROMOTION');
});
test('03 no fake independently qualified gate after only source review',()=>{
 const s=fixture();s.independentGates[0].independentlyQualified=true;
 assert.equal(assess(s).reason,'LEARNING_GATE_FALSE_OR_MISSING_PROOF:LL-01');
});
test('04 no synthetic INDEPENDENTLY_QUALIFIED or production-green state',()=>{
 const s=fixture();s.independentGates[0].status='INDEPENDENTLY_QUALIFIED';
 assert.equal(assess(s).reason,'LEARNING_GATE_FALSE_OR_MISSING_PROOF:LL-01');
 const t=fixture();t.readinessStatusAllowed.push('INDEPENDENTLY_QUALIFIED');
 assert.equal(assess(t).reason,'UNQUALIFIED_STATUS_TAMPERING');
});
test('05 standalone independent goal cannot become entire runtime or receipt integration',()=>{
 const s=fixture();s.targetComponent='LEEWAY_FOUR_AUTHORITY_RUNTIME';
 assert.equal(assess(s).reason,'LEARNING_SCOPE_OR_SOURCE_STAGE_INVALID');
});
test('06 duplicate owned or missing gate IDs never silently pass',()=>{
 const s=fixture();s.independentGates[1].id='LL-01';
 assert.equal(assess(s).reason,'INDEPENDENT_GATE_OR_EXTERNAL_SCOPE_INCOMPLETE');
 const t=fixture();t.independentGates.pop();
 assert.equal(assess(t).reason,'INDEPENDENT_GATE_OR_EXTERNAL_SCOPE_INCOMPLETE');
});
test('07 original Receipt writer must not be claimed as Learning authority',()=>{
 const s=fixture();s.authorityBoundaries.owns.push('canonical_receipt_writer_or_outbox_commit');
 assert.equal(assess(s).reason,'LEARNING_INDEPENDENT_AUTHORITY_BOUNDARY_INVALID');
});
test('08 independent Veritas signer cannot be duplicated in Learning',()=>{
 const s=fixture();s.authorityBoundaries.owns.push('independent_veritas_issuer_or_trust_root');
 assert.equal(assess(s).reason,'LEARNING_INDEPENDENT_AUTHORITY_BOUNDARY_INVALID');
});
test('09 untrusted external receipt provider cannot be marked qualified by Learning source',()=>{
 const s=fixture();s.externalProviderPrerequisites[0].state='PRODUCTION_PASS';
 assert.equal(assess(s).reason,'EXTERNAL_CUSTODIAN_MISCLASSIFIED:EXT-01');
});
test('10 missing actual source revision pin fails closed',()=>{
 const s=fixture();s.sourceRefs.canonicalMain='not-a-commit';
 assert.equal(assess(s).reason,'SOURCE_REVISION_OR_EVIDENCE_NOT_PINNED');
});
test('11 source test count cannot replace real 18-gate original writer qualification',()=>{
 const s=fixture();s.sourceRefs.sourceTestsPassing=100000;
 assert.equal(assess(s).reason,'SOURCE_REVISION_OR_EVIDENCE_NOT_PINNED');
});
test('12 every gate needs concrete component-owned work and physical PASS criterion',()=>{
 const s=fixture();s.independentGates[3].exitCriterion='';
 assert.equal(assess(s).reason,'LEARNING_GATE_FALSE_OR_MISSING_PROOF:LL-04');
});
test('13 mismatched evidence origin or other-company repository cannot assert custodian',()=>{
 const s=fixture();s.externalProviderPrerequisites[0].sourceReference='https://example.com/receipt-proof';
 assert.equal(assess(s).reason,'EXTERNAL_CUSTODIAN_MISCLASSIFIED:EXT-01');
});
test('14 source-only inventory must not claim it mutated original ledger',()=>{
 const s=fixture();s.integrationEligibility.protectedLedgerMutationPerformed=true;
 assert.equal(assess(s).reason,'PREINTEGRATION_FALSE_PROMOTION');
});
test('15 actual component status preserves separate private and institutional roles',()=>{
 const s=fixture(),a=assess(s);
 assert.equal(a.status,'SOURCE_READINESS_INVENTORY_VALID');
 assert.ok(s.authorityBoundaries.owns.includes('owner_private_encrypted_candidate_custody'));
 assert.ok(s.authorityBoundaries.owns.includes('canonical_learning_admission_and_unique_writer_effect'));
 assert.ok(s.authorityBoundaries.doesNotOwn.includes('receipt_delivery_ack_writer'));
 assert.equal(a.allIndependentOwnedGatesQualified,false);
});
test('16 out-of-scope external dependency cannot be silently removed',()=>{
 const s=fixture();s.externalProviderPrerequisites.splice(0,1);
 assert.equal(assess(s).reason,'INDEPENDENT_GATE_OR_EXTERNAL_SCOPE_INCOMPLETE');
});
