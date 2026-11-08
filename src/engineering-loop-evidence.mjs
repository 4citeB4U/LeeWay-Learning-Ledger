/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.ENGINEERING_EVIDENCE
TAG: LEEWAY.LEARNING.ENGINEERING_LOOP_SOURCE_GATE_V1
WHAT: Qualify documentary completeness of an engineering development checkpoint.
WHY: Preserve inspectable failure, repair and retest experience for University and Skills.
WHO: Existing LeeWay Engineering and Learning Ledger source-owner team.
WHERE: LeeWay-Learning-Ledger/src/engineering-loop-evidence.mjs.
WHEN: Source checkpoint review and on-demand candidate knowledge export.
HOW: Enforce exact Standards lifecycle, evidence references, source-vs-production states and no automatic admission.
AUTHORIZED_ROLES: Read-only source record validation; not a Veritas signer or receipt issuer.
LICENSE: MIT
*/
export const LEEWAY_ENGINEERING_PHASES=Object.freeze([
  'Investigate','Diagnose','Plan','Implement','Test',
  'Validate','Repair','Retest','Verify','Evidence'
]);
const SHA=/^[a-f0-9]{40}$/;
const trustedUrl=s=>typeof s==='string'&&
  /^https:\/\/github\.com\/4citeB4U\/[A-Za-z0-9_.-]+\/(?:blob|commit|issues|pull|actions)\/[A-Za-z0-9_./-]+$/.test(s);
const invalid=(errors)=>({status:'BLOCKED_DOCUMENTATION',errors,
  candidateKnowledgeAuthorized:false,canonicalLearningAdmitted:false,
  productionAdmissionAuthorized:false});

export function assessEngineeringCheckpoint(checkpoint){
  const errors=[];
  if(!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint))
    return invalid(['CHECKPOINT_SCHEMA_INVALID']);
  if(checkpoint.schema!=='leeway.engineering.loop.checkpoint.v1'||
     typeof checkpoint.checkpointId!=='string'||!/^C3-[A-Z0-9-]{8,120}$/.test(checkpoint.checkpointId))
    errors.push('CHECKPOINT_ID_OR_SCHEMA_INVALID');
  if(checkpoint.classification!=='MISSING_GLUE'&&
     !['ALREADY_BUILT','PARTIALLY_BUILT','TRULY_MISSING'].includes(checkpoint.classification))
    errors.push('REUSE_CLASSIFICATION_INVALID');
  if(!trustedUrl(checkpoint.parentMission?.url)||
     !trustedUrl(checkpoint.source?.reviewPr)||
     !SHA.test(checkpoint.source?.reviewedCommit??'')||
     checkpoint.source?.scope!=='SOURCE_ONLY'||
     typeof checkpoint.source?.branch!=='string'||!checkpoint.source.branch)
    errors.push('CANONICAL_PROVENANCE_INCOMPLETE');
  if(!trustedUrl(checkpoint.authority?.engineeringLaw)||
     !trustedUrl(checkpoint.authority?.permanentRules)||
     !trustedUrl(checkpoint.authority?.contributorProtocol))
    errors.push('ENGINEERING_LAW_REFERENCES_MISSING');
  if(!Array.isArray(checkpoint.loop)||checkpoint.loop.length!==LEEWAY_ENGINEERING_PHASES.length)
    errors.push('EXACT_ENGINEERING_LOOP_REQUIRED');
  else for(let i=0;i<LEEWAY_ENGINEERING_PHASES.length;i++){
    const record=checkpoint.loop[i],phase=LEEWAY_ENGINEERING_PHASES[i];
    if(record?.phase!==phase){errors.push('STAGE_ORDER_INVALID:'+phase);continue;}
    if(!['EVIDENCED_SOURCE','BLOCKED','NOT_EXECUTED'].includes(record.status))
      errors.push('STAGE_STATUS_INVALID:'+phase);
    if(typeof record.observation!=='string'||record.observation.trim().length<35)
      errors.push('STAGE_OBSERVATION_MISSING:'+phase);
    if(!Array.isArray(record.evidence)||record.evidence.length<1||
       !record.evidence.every(trustedUrl))
      errors.push('STAGE_EVIDENCE_MISSING_OR_UNTRUSTED:'+phase);
  }
  const a=checkpoint.acceptance;
  if(a?.source?.status!=='CI_PASS'||!trustedUrl(a.source.workflowRun)||
     !/\/actions\/runs\/\d+$/.test(a.source.workflowRun)||
     !Number.isSafeInteger(a.source.testsPass)||a.source.testsPass<1||
     a.source.testsFail!==0||a.source.testsSkipped!==0)
    errors.push('SOURCE_TEST_EVIDENCE_INCOMPLETE');
  if(a?.production!=='BLOCKED'||a?.deployment!=='NOT_DEPLOYED'||
     a?.liveOwnerHost!=='NOT_OBSERVED'||a?.veritas!=='NOT_OBSERVED'||
     a?.canonicalReceipt!=='NOT_CREATED'||a?.canonicalLearning!=='NOT_ADMITTED')
    errors.push('UNSUPPORTED_PRODUCTION_OR_VERITAS_PROMOTION');
  const safeguards=checkpoint.scopeAndSafeguards;
  if(!Array.isArray(safeguards?.preserved)||safeguards.preserved.length<1||
     !Array.isArray(safeguards.changed)||safeguards.changed.length<1||
     typeof safeguards.rollback!=='string'||safeguards.rollback.trim().length<30||
     typeof safeguards.exactBlocker!=='string'||safeguards.exactBlocker.trim().length<30)
    errors.push('SOURCE_CUSTODY_ROLLBACK_OR_BLOCKER_MISSING');
  if(!Array.isArray(checkpoint.blockers)||checkpoint.blockers.length<1||
     !checkpoint.blockers.every(b=>typeof b.code==='string'&&b.code.length>5&&
       typeof b.owner==='string'&&b.owner.length>3&&
       typeof b.next==='string'&&b.next.length>15))
    errors.push('BLOCKER_RESUMPTION_GAP');
  const lesson=checkpoint.learningCandidate;
  if(lesson?.kind!=='ENGINEERING_EXPERIENCE_CANDIDATE'||
     lesson.truthBoundary!=='SOURCE_ONLY_NOT_CANONICAL_LEARNING'||
     lesson.promoteAutomatically!==false||
     lesson.privacy!=='PUBLIC_NON_PERSONAL_SOURCE_EVIDENCE_ONLY'||
     !Array.isArray(lesson.transferableTo)||lesson.transferableTo.length<1||
     typeof lesson.finding!=='string'||lesson.finding.trim().length<35||
     typeof lesson.recoveryPattern!=='string'||lesson.recoveryPattern.trim().length<35)
    errors.push('INSTITUTIONAL_LEARNING_BOUNDARY_INVALID');
  if(errors.length)return invalid(errors);
  const phasesAllSourceEvidenced=checkpoint.loop.every(s=>s.status==='EVIDENCED_SOURCE');
  return {
    status:phasesAllSourceEvidenced?'SOURCE_LOOP_DOCUMENTED':'SOURCE_LOOP_WITH_BLOCKED_STAGES',
    phaseCount:checkpoint.loop.length,
    sourceCI:checkpoint.acceptance.source.workflowRun,
    checkpointId:checkpoint.checkpointId,
    candidateKnowledgeAuthorized:phasesAllSourceEvidenced,
    statusLimit:'DOCUMENTARY_CHECK_ONLY_EXTERNAL_RECEIPTS_NOT_AUTHENTICATED',
    canonicalLearningAdmitted:false,productionAdmissionAuthorized:false,
    unresolvedCount:checkpoint.blockers.length,errors:[]
  };
}

/** Read-only projection; may be indexed as a CANDIDATE, never registered as a verified skill. */
export function projectEngineeringLesson(checkpoint){
  const assessed=assessEngineeringCheckpoint(checkpoint);
  if(assessed.status!=='SOURCE_LOOP_DOCUMENTED')return {
    status:'BLOCKED',reason:assessed.errors.length?assessed.errors.join('|'):'STAGES_UNFINISHED',
    canonicalLearningAdmitted:false,skillPromotionAuthorized:false
  };
  return {
    status:'CANDIDATE_ENGINEERING_LESSON_ONLY',
    checkpointId:checkpoint.checkpointId,
    missionUrl:checkpoint.parentMission.url,
    sourceCommit:checkpoint.source.reviewedCommit,
    ciRun:checkpoint.acceptance.source.workflowRun,
    sourceStages:checkpoint.loop.map(s=>s.phase),
    observedFailurePattern:checkpoint.learningCandidate.finding,
    tentativeCountermeasure:checkpoint.learningCandidate.recoveryPattern,
    applicableConsumers:checkpoint.learningCandidate.transferableTo,
    blockers:checkpoint.blockers.map(b=>({code:b.code,owner:b.owner,next:b.next})),
    evidenceClassification:'SOURCE_DOCUMENTARY_NOT_VERITAS_CERTIFIED',
    privateOwnerDataIncluded:false,
    canonicalLearningAdmitted:false,skillPromotionAuthorized:false,
    proactiveActionAuthorized:false
  };
}
