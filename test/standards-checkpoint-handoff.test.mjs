/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.STANDARDS_HANDOFF_TEST
TAG: LEEWAY.LEARNING.STANDARDS_CHECKPOINT_FAIL_CLOSED_TESTS_V1
WHAT: Test the real Learning Ledger adapter boundary with explicit synthetic Standards responses.
WHY: Prevent duplicate authority and accidental promotion from a source-only checkpoint.
WHO: LeeWay Learning Ledger source maintainers.
WHERE: LeeWay-Learning-Ledger/test/standards-checkpoint-handoff.test.mjs.
WHEN: Source CI and developer regression only.
HOW: Vary callback/qualification and assert all results remain nonproduction.
LICENSE: MIT
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateStandardsCheckpointHandoff as h} from '../src/standards-checkpoint-handoff.mjs';
const c=JSON.parse(fs.readFileSync(new URL('../docs/checkpoints/C3-LEARNING-CUSTODY-SOURCE-20261027.json',import.meta.url),'utf8'));
const packet={missionId:'mission-001',sourceSha256:'f'.repeat(64)};
test('no Standards evaluator binding blocks, not locally self-certified',async()=>{
  const out=await h({checkpoint:c,qualificationEvidence:packet});
  assert.equal(out.reason,'CANONICAL_STANDARDS_EVALUATOR_UNBOUND');
  assert.equal(out.canonicalLearningAdmitted,false);
});
test('missing independent qualification packet blocks before executing evaluator',async()=>{
  let called=false;
  const r=await h({checkpoint:c,standardsEvaluator:()=>{called=true;}});
  assert.equal(r.reason,'INDEPENDENT_QUALIFICATION_PACKET_MISSING');
  assert.equal(called,false);
});
test('current Standards denial and failed stage are preserved without escalation',async()=>{
  const r=await h({checkpoint:c,qualificationEvidence:packet,
    standardsEvaluator:()=>({state:'BLOCKED',reason:'ENGINEERING_STAGE_NOT_VERIFIED',stage:'Retest'})});
  assert.equal(r.reason,'ENGINEERING_STAGE_NOT_VERIFIED');
  assert.equal(r.stage,'Retest');
  assert.equal(r.productionAdmissionAuthorized,false);
});
test('synthetic Standards completion never grants Runtime, Veritas or Learning authority',async()=>{
  const r=await h({checkpoint:c,qualificationEvidence:packet,
    standardsEvaluator:()=>({state:'STANDARDS_CHECKPOINT_COMPLETE',completed:true,productionAuthorized:false})});
  assert.equal(r.status,'STANDARDS_CHECKPOINT_COMPLETE_SOURCE_BOUNDARY_ONLY');
  assert.equal(r.standardsCheckpointComplete,true);
  assert.equal(r.canonicalLearningAdmitted,false);
  assert.equal(r.productionAdmissionAuthorized,false);
  assert.equal(r.skillPromotionAuthorized,false);
});
test('forged Standards production approval and incomplete source checkpoint are denied',async()=>{
  const r=await h({checkpoint:c,qualificationEvidence:packet,
    standardsEvaluator:()=>({state:'STANDARDS_CHECKPOINT_COMPLETE',completed:true,productionAuthorized:true})});
  assert.equal(r.status,'BLOCKED');
  const changed=structuredClone(c);changed.loop.pop();
  const b=await h({checkpoint:changed,qualificationEvidence:packet,
    standardsEvaluator:()=>({state:'STANDARDS_CHECKPOINT_COMPLETE',completed:true,productionAuthorized:false})});
  assert.equal(b.reason,'SOURCE_ENGINEERING_CHECKPOINT_INCOMPLETE');
});
