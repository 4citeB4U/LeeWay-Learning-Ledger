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
const directory=path.join(root,'docs','checkpoints');
let result;
try {
  const files=fs.readdirSync(directory).filter(file=>/^[A-Z0-9-]+\.json$/.test(file)).sort();
  if(!files.length)throw Error('NO_ENGINEERING_CHECKPOINTS');
  const observed=[];
  for(const file of files){
    const location=path.join(directory,file);
    const st=fs.lstatSync(location);
    if(!st.isFile()||st.isSymbolicLink())throw Error('CHECKPOINT_NOT_REGULAR_FILE:'+file);
    const checkpoint=JSON.parse(fs.readFileSync(location,'utf8'));
    const reviewed=assessEngineeringCheckpoint(checkpoint);
    if(reviewed.status!=='SOURCE_LOOP_DOCUMENTED')
      throw Error('CHECKPOINT_NOT_DOCUMENTED:'+file+':'+reviewed.errors.join(','));
    if(observed.some(x=>x.checkpointId===reviewed.checkpointId))
      throw Error('DUPLICATE_ENGINEERING_CHECKPOINT_ID');
    observed.push({file,checkpointId:reviewed.checkpointId,phaseCount:reviewed.phaseCount,
      status:reviewed.status,productionAdmissionAuthorized:false,
      canonicalLearningAdmitted:false});
  }
  result={status:'SOURCE_LOOP_DOCUMENTED',checkpointCount:observed.length,
    checkpoints:observed,canonicalLearningAdmitted:false,
    productionAdmissionAuthorized:false,externalVeritasReceiptAuthenticated:false};
} catch(error) {
  result={status:'BLOCKED_DOCUMENTATION',errors:[error.message],
    canonicalLearningAdmitted:false,productionAdmissionAuthorized:false};
}
process.stdout.write(JSON.stringify(result,null,2)+'\\n');
if(result.status!=='SOURCE_LOOP_DOCUMENTED')process.exitCode=1;
