/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.ENGINEERING_EVIDENCE_TEST
TAG: LEEWAY.LEARNING.ENGINEERING_LOOP_NEGATIVE_REGRESSION_V1
WHAT: Verify stage coverage, scope, blockers, no-fake-Veritas and candidate-only cross-team lesson.
WHY: Prevent repeated undocumented or falsely promoted engineering completions.
WHO: LeeWay Learning Ledger source regression maintainers.
WHERE: LeeWay-Learning-Ledger/test/engineering-loop-evidence.test.mjs.
WHEN: Node 22 CI and local source tests.
HOW: Validate the real repository source checkpoint and controlled cloned negative cases.
LICENSE: MIT
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assessEngineeringCheckpoint,projectEngineeringLesson,LEEWAY_ENGINEERING_PHASES} from '../src/engineering-loop-evidence.mjs';
const source=new URL('../docs/checkpoints/C3-LEARNING-CUSTODY-SOURCE-20261027.json',import.meta.url);
const checkpoint=JSON.parse(fs.readFileSync(source,'utf8'));
const altered=fn=>{const c=structuredClone(checkpoint);fn(c);return c};
test('canonical Standards lifecycle is documented in exact ten-stage order with stage-specific references',()=>{
  const result=assessEngineeringCheckpoint(checkpoint);
  assert.equal(result.status,'SOURCE_LOOP_DOCUMENTED');
  assert.deepEqual(checkpoint.loop.map(x=>x.phase),LEEWAY_ENGINEERING_PHASES);
  assert.equal(result.phaseCount,10);
  assert.equal(result.canonicalLearningAdmitted,false);
  assert.equal(result.productionAdmissionAuthorized,false);
});
test('missing or reordered stages and absent evidence fail closed',()=>{
  assert.equal(assessEngineeringCheckpoint(altered(c=>c.loop.pop())).status,'BLOCKED_DOCUMENTATION');
  assert.equal(assessEngineeringCheckpoint(altered(c=>[c.loop[4],c.loop[5]]=[c.loop[5],c.loop[4]])).status,'BLOCKED_DOCUMENTATION');
  assert.equal(assessEngineeringCheckpoint(altered(c=>c.loop[6].evidence=[])).status,'BLOCKED_DOCUMENTATION');
  assert.equal(assessEngineeringCheckpoint(altered(c=>c.loop[2].observation='')).status,'BLOCKED_DOCUMENTATION');
});
test('forged green Veritas, production and learning promotion are disallowed even with 20 passing tests',()=>{
  for(const edit of [
    c=>c.acceptance.veritas='VERITAS_VERIFIED',
    c=>c.acceptance.production='QUALIFIED',
    c=>c.acceptance.canonicalLearning='ADMITTED_VERIFIED',
    c=>c.acceptance.canonicalReceipt='CREATED',
    c=>c.learningCandidate.promoteAutomatically=true
  ]) {
    const result=assessEngineeringCheckpoint(altered(edit));
    assert.equal(result.status,'BLOCKED_DOCUMENTATION');
    assert.equal(result.productionAdmissionAuthorized,false);
  }
});
test('reporting 20 tests without actionable CI evidence or rollback does not qualify',()=>{
  assert.equal(assessEngineeringCheckpoint(altered(c=>c.acceptance.source.workflowRun='')).status,'BLOCKED_DOCUMENTATION');
  assert.equal(assessEngineeringCheckpoint(altered(c=>c.scopeAndSafeguards.rollback='')).status,'BLOCKED_DOCUMENTATION');
  assert.equal(assessEngineeringCheckpoint(altered(c=>c.blockers=[])).status,'BLOCKED_DOCUMENTATION');
});
test('University/Agent Skills receive candidate lesson and blocker references, never production authority',()=>{
  const lesson=projectEngineeringLesson(checkpoint);
  assert.equal(lesson.status,'CANDIDATE_ENGINEERING_LESSON_ONLY');
  assert.equal(lesson.sourceStages.length,10);
  assert.equal(lesson.skillPromotionAuthorized,false);
  assert.equal(lesson.canonicalLearningAdmitted,false);
  assert.equal(lesson.privateOwnerDataIncluded,false);
  assert.equal(lesson.proactiveActionAuthorized,false);
  const reject=projectEngineeringLesson(altered(c=>c.loop[9].evidence=[]));
  assert.equal(reject.status,'BLOCKED');
  assert.equal(reject.skillPromotionAuthorized,false);
});
