/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING.AUTHORITY.CONFORMANCE
TAG: LEEWAY.LEARNING.ORDERED_STAGE_CONFORMANCE.V1
DISCOVERY_PIPELINE: Voice → Intent → Location → Vertical → Ranking → Render
5WH:
WHAT = Validate the exact bounded stage/permission/evidence transition for proposed worker learning.
WHY = Prevent a study, simulation, untrusted teacher or staged receipt from masquerading as durable admitted learning.
WHO = Existing Learning Ledger source owner under Creator and Standards/Book 59.
WHERE = src/learning-stage-conformance.mjs.
WHEN = 2026-11-12.
HOW = Pure deterministic gate for positive/negative tests; existing Runtime C3 writer and authorities remain controlling.
LICENSE: Existing repository terms remain unchanged.
*/
export const STAGES = Object.freeze([
  'LG-00','LG-01','LG-02','LG-03','LG-04','LG-05','LG-06','LG-07','LG-08','LG-09','LG-10'
]);
const REQUIRED_PERMISSION = Object.freeze({
  'LG-00':'LEARN_READ',
  'LG-01':'LEARN_READ',
  'LG-02':'LEARN_CAPTURE',
  'LG-03':'LEARN_READ',
  'LG-04':'LEARN_PRACTICE_SANDBOX',
  'LG-05':'LEARN_PRACTICE_LIVE',
  'LG-06':'LEARN_EVALUATE',
  'LG-07':'LEARN_PROPOSE_ADMISSION',
  'LG-08':'LEARN_ADMIT_CANONICAL',
  'LG-09':'LEARN_RELEASE_SKILL',
  'LG-10':'LEARN_REVOKE_OR_CORRECT'
});
const valid = x => typeof x === 'string' && x.trim().length > 0;
const denied = reason => Object.freeze({ status:'BLOCKED', reason, admissionGranted:false });
/**
 * A source-level obligation checker only; permission claims in the proposed
 * unit cannot authenticate the issuer or confer real device privileges.
 */
export function evaluateLearningTransition(unit = {}, proposedStage, context = {}) {
  const targetIndex = STAGES.indexOf(proposedStage);
  if (targetIndex < 0) return denied('UNKNOWN_LEARNING_STAGE');
  if (!valid(unit.parentMissionId) || !valid(unit.workId) ||
      !valid(unit.candidateId) || !valid(unit.objective) || !valid(unit.standardsRef)) {
    return denied('LEARNING_PROVENANCE_INCOMPLETE');
  }
  const currentIndex = unit.stage ? STAGES.indexOf(unit.stage) : -1;
  if ((unit.stage && currentIndex < 0) || targetIndex !== currentIndex + 1)
    return denied('LEARNING_ORDER_VIOLATION');
  if (context.hostVerified !== true || context.issuerTrusted !== true ||
      !valid(context.grantReference)) return denied('LEARNING_AUTHORITY_UNBOUND');
  if (!Array.isArray(context.permissions) || !context.permissions.includes(REQUIRED_PERMISSION[proposedStage]))
    return denied('LEARNING_PERMISSION_MISSING');
  if (proposedStage === 'LG-02' && (unit.captureConsent !== true ||
      unit.dataRightsVerified !== true)) return denied('LEARNING_DATA_RIGHTS_MISSING');
  if (proposedStage === 'LG-04' && (!valid(unit.baselineEvidenceRef) ||
      unit.candidateIsolated !== true)) return denied('LEARNING_CANDIDATE_NOT_ISOLATED');
  if (proposedStage === 'LG-05' && (!valid(context.operationDigest) ||
      context.liveDeviceGrantVerified !== true || context.osConsentVerified !== true))
    return denied('LEARNING_LIVE_ACTION_UNAUTHORIZED');
  if (proposedStage === 'LG-06' && (!valid(unit.independentReviewerId) ||
      unit.independentReviewerId === unit.learnerId ||
      unit.independentReviewerId === unit.teacherId ||
      !valid(unit.heldOutTestRef))) return denied('LEARNING_TEACHBACK_NOT_INDEPENDENT');
  if (proposedStage === 'LG-07' && (unit.actualExecutionVerified !== true ||
      !valid(unit.veritasPreRef) || !valid(unit.veritasPostRef) ||
      !valid(unit.canonicalReceiptRef) || !valid(unit.continuumReadbackRef)))
    return denied('LEARNING_EVIDENCE_INCOMPLETE');
  if (proposedStage === 'LG-08' && (context.canonicalLedgerAuthority !== true ||
      context.independentEvidenceVerified !== true || context.canonicalReadbackVerified !== true))
    return denied('CANONICAL_LEARNING_ADMISSION_NOT_PROVEN');
  if (proposedStage === 'LG-09' && (context.originalSkillOwnerApproved !== true ||
      context.originalReleaseAuthorityApproved !== true))
    return denied('LEARNING_SKILL_RELEASE_NOT_AUTHORIZED');
  return Object.freeze({
    status:'SOURCE_CONFORMANCE_PASS', stage:proposedStage,
    permission:REQUIRED_PERMISSION[proposedStage],
    admissionGranted:false,
    reason:'REQUIRES_ORIGINAL_RUNTIME_AND_CANONICAL_AUTHORITY'
  });
}
