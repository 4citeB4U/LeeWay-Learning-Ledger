/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING.AUTHORITY.TESTS
TAG: LEEWAY.LEARNING.ORDERED_STAGE_CONFORMANCE_TEST.V1
DISCOVERY_PIPELINE: Voice → Intent → Location → Vertical → Ranking → Render
5WH:
WHAT = Verify ordered learning authorization and independence boundaries.
WHY = Deny stage skipping, untrusted claims, privacy violations and self-issued admission.
WHO = Learning Ledger original owner and independent source reviewers.
WHERE = test/learning-stage-conformance.test.mjs.
WHEN = 2026-11-12.
HOW = Node built-in unit tests; not production Ledger writes or real model training.
LICENSE: Existing repository terms remain unchanged.
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLearningTransition, STAGES } from '../src/learning-stage-conformance.mjs';
const base={
  parentMissionId:'MISSION-01', workId:'W-01',candidateId:'C-01',
  objective:'diagnose a bounded read-only error', standardsRef:'Standards@approved'
};
const host={
  hostVerified:true,issuerTrusted:true,grantReference:'REAL_HOST_REFERENCE',
  permissions:['LEARN_READ','LEARN_CAPTURE','LEARN_PRACTICE_SANDBOX',
    'LEARN_PRACTICE_LIVE','LEARN_EVALUATE','LEARN_PROPOSE_ADMISSION',
    'LEARN_ADMIT_CANONICAL','LEARN_RELEASE_SKILL','LEARN_REVOKE_OR_CORRECT']
};
test('the registered eleven learning stages have stable order',()=>{
  assert.equal(STAGES.length,11);
  assert.equal(new Set(STAGES).size,11);
});
test('authorized reading is only source conformance, never learning admission',()=>{
  const result=evaluateLearningTransition(base,'LG-00',host);
  assert.equal(result.status,'SOURCE_CONFORMANCE_PASS');
  assert.equal(result.admissionGranted,false);
});
test('a self-authored LLM grant is not host trust',()=>{
  const result=evaluateLearningTransition({...base,grantReference:'FAKE'},'LG-00',{permissions:host.permissions});
  assert.equal(result.reason,'LEARNING_AUTHORITY_UNBOUND');
});
test('cannot skip directly from reading to canonical admission',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-00'},'LG-08',host);
  assert.equal(result.reason,'LEARNING_ORDER_VIOLATION');
});
test('capture requires explicit consent and data rights',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-01'},'LG-02',host);
  assert.equal(result.reason,'LEARNING_DATA_RIGHTS_MISSING');
});
test('sandbox practice requires isolated candidate with baseline',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-03'},'LG-04',host);
  assert.equal(result.reason,'LEARNING_CANDIDATE_NOT_ISOLATED');
});
test('sandbox-only training can reach evaluation only with authorized N/A for live action',()=>{
  const unit={...base,stage:'LG-04',learnerId:'learner',teacherId:'teacher',
    independentReviewerId:'reviewer',heldOutTestRef:'test-2'};
  const denied=evaluateLearningTransition(unit,'LG-06',{...host,sandboxOnly:true});
  assert.equal(denied.reason,'LEARNING_ORDER_VIOLATION');
  const result=evaluateLearningTransition(unit,'LG-06',{
    ...host,sandboxOnly:true,liveGateNAApproved:true
  });
  assert.equal(result.status,'SOURCE_CONFORMANCE_PASS');
  assert.equal(result.admissionGranted,false);
});
test('sandbox-only evaluation never becomes independent physical admission',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-06',
    heldOutTestRef:'test-2'},'LG-07',{...host,sandboxOnly:true,liveGateNAApproved:true});
  assert.equal(result.reason,'LEARNING_EVIDENCE_INCOMPLETE');
});
test('real action requires exact operation digest and OS consent',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-04'},'LG-05',host);
  assert.equal(result.reason,'LEARNING_LIVE_ACTION_UNAUTHORIZED');
});
test('teacher and learner cannot self-review teach-back',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-05',
    learnerId:'learner',teacherId:'teacher',independentReviewerId:'teacher',
    heldOutTestRef:'test-2'},'LG-06',host);
  assert.equal(result.reason,'LEARNING_TEACHBACK_NOT_INDEPENDENT');
});
test('synthetic source test cannot become independent evidence',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-06', actualExecutionVerified:true},'LG-07',host);
  assert.equal(result.reason,'LEARNING_EVIDENCE_INCOMPLETE');
});
test('a learning candidate cannot self-issue canonical admission',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-07'},'LG-08',host);
  assert.equal(result.reason,'CANONICAL_LEARNING_ADMISSION_NOT_PROVEN');
});
test('an admitted lesson alone cannot authorize a skill deployment',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-08'},'LG-09',host);
  assert.equal(result.reason,'LEARNING_SKILL_RELEASE_NOT_AUTHORIZED');
});
test('proper readback flags remain source-only, never perform a canonical write',()=>{
  const result=evaluateLearningTransition({...base,stage:'LG-07'},'LG-08',{
    ...host,canonicalLedgerAuthority:true,independentEvidenceVerified:true,canonicalReadbackVerified:true
  });
  assert.equal(result.status,'SOURCE_CONFORMANCE_PASS');
  assert.equal(result.admissionGranted,false);
});
