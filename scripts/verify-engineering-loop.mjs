/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.ENGINEERING_GATE
TAG: LEEWAY.LEARNING.ENGINEERING_LOOP_CI_DOCUMENT_GATE_V1
WHAT: Verify completeness of an existing source development loop checkpoint.
WHY: A green unit-test workflow must not silently omit investigation, repair or evidence.
WHO: LeeWay Learning Ledger CI and authorized source reviewers.
WHERE: LeeWay-Learning-Ledger/scripts/verify-engineering-loop.mjs.
WHEN: Pull request source qualification.
HOW: Parse repository checkpoint and reject absent stages, links, rollback, or false Veritas claims.
AUTHORIZED_ROLES: Documentation validation only, no Veritas, admission or production authority.
LICENSE: MIT
*/
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessEngineeringCheckpoint} from '../src/engineering-loop-evidence.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const location=path.join(root,'docs','checkpoints','C3-LEARNING-CUSTODY-SOURCE-20261027.json');
let assessed;
try {
  const st=fs.lstatSync(location);
  if(!st.isFile()||st.isSymbolicLink())throw Error('CHECKPOINT_NOT_REGULAR_FILE');
  assessed=assessEngineeringCheckpoint(JSON.parse(fs.readFileSync(location,'utf8')));
} catch(error) {
  assessed={status:'BLOCKED_DOCUMENTATION',errors:[error.message],
    canonicalLearningAdmitted:false,productionAdmissionAuthorized:false};
}
process.stdout.write(JSON.stringify(assessed,null,2)+'\n');
if(assessed.status!=='SOURCE_LOOP_DOCUMENTED')process.exitCode=1;
