/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.ENGINEERING_ARCHIVE_TEST
TAG: LEEWAY.LEARNING.MULTI_CHECKPOINT_ARCHIVE_V1
WHAT: Verify multiple documented engineering loops without granting canonical learning admission.
WHY: A new task must not inherit the previous task's single passing source checkpoint.
WHO: LeeWay Learning Ledger source maintainers.
WHERE: LeeWay-Learning-Ledger/test/engineering-archive-index.test.mjs.
WHEN: CI source-regression verification for C3 engineering history.
HOW: Load real archived records, validate each exact ten-stage record and reject duplicate IDs.
LICENSE: MIT
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessEngineeringCheckpoint,projectEngineeringLesson} from '../src/engineering-loop-evidence.mjs';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../docs/checkpoints');
const files=fs.readdirSync(dir).filter(x=>/^[A-Z0-9-]+\.json$/.test(x)).sort();
test('archive preserves two distinct evidence-linked C3 engineering cycles',()=>{
  assert.ok(files.includes('C3-LEARNING-CUSTODY-SOURCE-20261027.json'));
  assert.ok(files.includes('C3-ENGINEERING-EVIDENCE-CLOSURE-20261027.json'));
  const ids=new Set();
  for(const filename of files){
    const checkpoint=JSON.parse(fs.readFileSync(path.join(dir,filename),'utf8'));
    const result=assessEngineeringCheckpoint(checkpoint);
    assert.equal(result.status,'SOURCE_LOOP_DOCUMENTED');
    assert.equal(result.phaseCount,10);
    assert.equal(result.canonicalLearningAdmitted,false);
    assert.equal(result.productionAdmissionAuthorized,false);
    assert.equal(ids.has(result.checkpointId),false);
    ids.add(result.checkpointId);
    const lesson=projectEngineeringLesson(checkpoint);
    assert.equal(lesson.status,'CANDIDATE_ENGINEERING_LESSON_ONLY');
    assert.equal(lesson.skillPromotionAuthorized,false);
  }
});
test('cross-team correction is an archived distinct experience, not retroactive rewrite',()=>{
  const first=JSON.parse(fs.readFileSync(path.join(dir,'C3-LEARNING-CUSTODY-SOURCE-20261027.json'),'utf8'));
  const second=JSON.parse(fs.readFileSync(path.join(dir,'C3-ENGINEERING-EVIDENCE-CLOSURE-20261027.json'),'utf8'));
  assert.notEqual(first.checkpointId,second.checkpointId);
  assert.notEqual(first.source.reviewedCommit,second.source.reviewedCommit);
  assert.notEqual(first.acceptance.source.workflowRun,second.acceptance.source.workflowRun);
  assert.match(second.learningCandidate.recoveryPattern,/Standards PR #24/);
  assert.equal(first.acceptance.veritas,'NOT_OBSERVED');
  assert.equal(second.acceptance.veritas,'NOT_OBSERVED');
});
