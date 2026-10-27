/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.STANDARDS_HANDOFF
TAG: LEEWAY.LEARNING.STANDARDS_CHECKPOINT_REUSE_ADAPTER_V1
WHAT: Delegate engineering completion eligibility to existing LeeWay Standards evaluator.
WHY: Prevent candidate archival shape validation from becoming a rival Veritas or Standards authority.
WHO: Learning Ledger source consumer of existing LeeWay Standards PR #24 interface.
WHERE: LeeWay-Learning-Ledger/src/standards-checkpoint-handoff.mjs.
WHEN: A qualified Runtime/Standards caller submits an authenticated checkpoint packet.
HOW: Validate archival syntax, require injected canonical Standards evaluator and preserve its blocked state.
AUTHORIZED_ROLES: Read-only integration readiness; not a production writer or permission grant.
LICENSE: MIT
*/
import {assessEngineeringCheckpoint} from './engineering-loop-evidence.mjs';

const deny=(reason,stage=null)=>({
  status:'BLOCKED',reason,stage,
  standardsCheckpointComplete:false,
  productionAdmissionAuthorized:false,
  canonicalLearningAdmitted:false,
  skillPromotionAuthorized:false
});

/**
 * Canonical Standards currently owns evaluateEngineeringLoopCheckpoint in draft PR #24.
 * This code NEVER builds a trusted PASS packet from a source-only learning checkpoint;
 * qualificationEvidence must come from the authorized Runtime/Veritas chain.
 */
export async function evaluateStandardsCheckpointHandoff({
  checkpoint, standardsEvaluator, qualificationEvidence
}={}){
  const source=assessEngineeringCheckpoint(checkpoint);
  if(source.status!=='SOURCE_LOOP_DOCUMENTED')
    return deny('SOURCE_ENGINEERING_CHECKPOINT_INCOMPLETE');
  if(typeof standardsEvaluator!=='function')
    return deny('CANONICAL_STANDARDS_EVALUATOR_UNBOUND');
  if(!qualificationEvidence||typeof qualificationEvidence!=='object'||
      Array.isArray(qualificationEvidence))
    return deny('INDEPENDENT_QUALIFICATION_PACKET_MISSING');
  let decision;
  try {decision=await standardsEvaluator(qualificationEvidence);}
  catch {return deny('STANDARDS_EVALUATOR_ERROR');}
  if(decision?.state!=='STANDARDS_CHECKPOINT_COMPLETE'||
     decision?.completed!==true||
     decision?.productionAuthorized!==false)
    return deny(decision?.reason||'STANDARDS_CHECKPOINT_NOT_QUALIFIED',decision?.stage??null);
  // Even a completed Standards documentary checkpoint is not the authenticated
  // Runtime/Veritas/Receipt/Learning chain; this adapter cannot promote learning.
  return {
    status:'STANDARDS_CHECKPOINT_COMPLETE_SOURCE_BOUNDARY_ONLY',
    checkpointId:checkpoint.checkpointId,
    nextGate:'AUTHENTICATED_RUNTIME_RELEASE_DECISION_AND_CANONICAL_LEARNING_ADMISSION',
    standardsCheckpointComplete:true,
    productionAdmissionAuthorized:false,
    canonicalLearningAdmitted:false,
    skillPromotionAuthorized:false
  };
}
