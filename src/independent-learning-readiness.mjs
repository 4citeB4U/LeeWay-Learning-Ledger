/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.INDEPENDENT_READINESS
TAG: LEEWAY.LEARNING.INDEPENDENT_COMPONENT_SOURCE_ASSESSMENT_V1
WHAT: Check that the Learning-only preintegration audit is complete and never misreported as production.
WHY: Contract-only CI and third-party provider callback claims cannot certify a physical canonical writer.
WHO: Canonical LeeWay Learning Ledger source review, not Veritas or Production authority.
WHERE: src/independent-learning-readiness.mjs
WHEN: 2026-10-28.
HOW: Deterministic scope/unique-gate/proof-status audit of versioned source evidence snapshot.
LICENSE: MIT
*/
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export const LEARNING_READINESS_SCHEMA='leeway.learning.independent-component-readiness.v1';
export const SOURCE_STATES=Object.freeze([
 'SOURCE_TESTED','PARTIAL_SOURCE','NOT_IMPLEMENTED','UNVERIFIED'
]);
const EXPECTED_IDS=Object.freeze(Array.from({length:18},(_,i)=>'LL-'+String(i+1).padStart(2,'0')));
const EXT_IDS=Object.freeze(Array.from({length:6},(_,i)=>'EXT-'+String(i+1).padStart(2,'0')));
const SOURCE_REFERENCE=/^[0-9a-f]{40}$/;
const fail=(reason)=>({
 status:'READINESS_AUDIT_REJECTED',reason,sourceSnapshotValid:false,
 componentIndependentlyQualified:false,readyForIntegration:false,
 productionAdmissionAuthorized:false,independentVeritasCertified:false,
 protectedLedgerMutationPerformed:false
});
const nonblank=x=>typeof x==='string'&&x.trim().length>=12;
function uniqueExact(items,expected,key='id'){
 if(!Array.isArray(items)||items.length!==expected.length)return false;
 const got=items.map(x=>x?.[key]);
 return got.every(x=>typeof x==='string')&&new Set(got).size===expected.length&&
   expected.every(x=>got.includes(x));
}
/** This only validates a pinned read-only audit, never authenticates producer trust. */
export function assessLearningIndependentReadiness(snapshot){
 if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot)||
  snapshot.schema!==LEARNING_READINESS_SCHEMA||
  snapshot.targetComponent!=='LEEWAY_LEARNING_LEDGER_ONLY'||
  snapshot.level!=='INDEPENDENT_PREINTEGRATION_ONLY'||
  snapshot.currentStage!=='SOURCE_CONTRACTS_TESTED_INDEPENDENT_COMPONENT_NOT_QUALIFIED'||
  !nonblank(snapshot.fullGoal))return fail('LEARNING_SCOPE_OR_SOURCE_STAGE_INVALID');
 const refs=snapshot.sourceRefs;
 if(!refs||!SOURCE_REFERENCE.test(refs.canonicalMain||'')||
   !SOURCE_REFERENCE.test(refs.candidateParent||'')||
   !SOURCE_REFERENCE.test(refs.canonicalIngressReview||'')||
   refs.mainRoot!=='README_ONLY'||refs.sourceTestsPassing!==92||
   refs.sourceTestsFailing!==0||refs.engineeringSourceCheckpoints!==4||
   typeof refs.ci!=='string'||!refs.ci.startsWith(
    'https://github.com/4citeB4U/LeeWay-Learning-Ledger/actions/runs/'))
   return fail('SOURCE_REVISION_OR_EVIDENCE_NOT_PINNED');
 if(!uniqueExact(snapshot.independentGates,EXPECTED_IDS)||
   !uniqueExact(snapshot.externalProviderPrerequisites,EXT_IDS))
   return fail('INDEPENDENT_GATE_OR_EXTERNAL_SCOPE_INCOMPLETE');
 const owned=snapshot.independentGates,external=snapshot.externalProviderPrerequisites;
 const states={SOURCE_TESTED:0,PARTIAL_SOURCE:0,NOT_IMPLEMENTED:0,UNVERIFIED:0};
 for(const g of owned){
  if(!SOURCE_STATES.includes(g.status)||!nonblank(g.name)||
    !nonblank(g.currentEvidence)||!nonblank(g.componentOwnedWork)||
    !nonblank(g.exitCriterion)||g.independentlyQualified!==false||
    g.evidenceLevel!=='SOURCE_INSPECTION_AND_PRIOR_TESTS_ONLY')
    return fail('LEARNING_GATE_FALSE_OR_MISSING_PROOF:'+g.id);
  states[g.status]++;
 }
 for(const e of external){
  if(!nonblank(e.owner)||!nonblank(e.contract)||
    e.state!=='EXTERNAL_NOT_QUALIFIED'||
    typeof e.sourceReference!=='string'||
    !e.sourceReference.startsWith('https://github.com/4citeB4U/'))
    return fail('EXTERNAL_CUSTODIAN_MISCLASSIFIED:'+e.id);
 }
 const a=snapshot.authorityBoundaries,i=snapshot.integrationEligibility;
 if(!a||!Array.isArray(a.owns)||!Array.isArray(a.doesNotOwn)||
   a.owns.length<5||a.doesNotOwn.length<5||
   a.owns.some(x=>a.doesNotOwn.includes(x))||
   !a.doesNotOwn.includes('canonical_receipt_writer_or_outbox_commit')||
   !a.doesNotOwn.includes('independent_veritas_issuer_or_trust_root')||
   !a.owns.includes('canonical_learning_admission_and_unique_writer_effect'))
   return fail('LEARNING_INDEPENDENT_AUTHORITY_BOUNDARY_INVALID');
 if(!i||i.eligible!==false||i.notProofOfLiveService!==true||
   i.protectedLedgerMutationPerformed!==false||
   i.independentVeritasCertified!==false||
   i.productionAdmissionAuthorized!==false||
   i.reason!=='LEARNING_OWNED_18_PREINTEGRATION_GATES_NOT_QUALIFIED')
   return fail('PREINTEGRATION_FALSE_PROMOTION');
 if(!Array.isArray(snapshot.readinessStatusAllowed)||
   snapshot.readinessStatusAllowed.length!==SOURCE_STATES.length||
   SOURCE_STATES.some(x=>!snapshot.readinessStatusAllowed.includes(x))||
   snapshot.readinessStatusAllowed.includes('INDEPENDENTLY_QUALIFIED'))
   return fail('UNQUALIFIED_STATUS_TAMPERING');
 return {
  status:'SOURCE_READINESS_INVENTORY_VALID',
  component:'LEEWAY_LEARNING_LEDGER_ONLY',
  ownedGateCount:owned.length,externalGateCount:external.length,
  sourceTested:states.SOURCE_TESTED,partialSource:states.PARTIAL_SOURCE,
  notImplemented:states.NOT_IMPLEMENTED,unverified:states.UNVERIFIED,
  allIndependentOwnedGatesQualified:false,
  componentIndependentlyQualified:false,readyForIntegration:false,
  productionAdmissionAuthorized:false,independentVeritasCertified:false,
  protectedLedgerMutationPerformed:false,
  nextMilestone:'REAL_ORIGINAL_LEARNING_WRITER_AND_OWNER_SCOPED_PRIVATE_VAULT_INDEPENDENT_ACCEPTANCE'
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 let result;
 try{
  const snap=JSON.parse(readFileSync(
   new URL('../docs/learning-ledger-independent-readiness.v1.json',import.meta.url),'utf8'));
  result=assessLearningIndependentReadiness(snap);
 }catch{result=fail('LEARNING_SOURCE_SNAPSHOT_MISSING_OR_CORRUPT');}
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='SOURCE_READINESS_INVENTORY_VALID')process.exitCode=1;
}
