/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.C3.CANONICAL_INGRESS
TAG: LEEWAY.LEARNING.C3.RECEIPT_OWNED_INBOX_V1
WHAT: Reconcile one already committed Receipt Authority learning obligation with the original canonical Learning Ledger provider.
WHY: Prevent lost, repeated, conflicted or unverified promotions after a crash.
WHO: Learning Ledger consumer; Receipt Authority, Independent Veritas and canonical writer retain their distinct authority.
WHERE: src/canonical-learning-inbox.mjs.
WHEN: 2026-10-27, Creator-authorized source hardening.
HOW: Host-qualified read-only receipt obligation, independent proof, unique admission key, read-before-retry and durable readback.
AUTHORIZED_ROLES: No independent signer, receipt writer, new database, production permission or personal-data transfer.
LICENSE: MIT.
*/
import {createHash} from 'node:crypto';

const HASH=/^[a-f0-9]{64}$/;
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
// Admission key uses colon separators. The two tuple IDs must not contain
// colon or distinct request/outcome pairs can collide in its wire format.
const KEY_PART=/^[A-Za-z0-9][A-Za-z0-9._-]{2,159}$/;
export const LEARNING_OBLIGATION_SCHEMA='leeway.receipt.learning-obligation.v1';
export const LEARNING_EVENT_SCHEMA='leeway.learning.verified-technical-outcome.v1';
export const INSTITUTIONAL_SCOPE='LEEWAY_INSTITUTIONAL_NONPERSONAL';
export const OUTCOMES=Object.freeze(['VERIFIED_SUCCESS','VERIFIED_FAILURE','VERIFIED_DENIAL']);
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const canonical=x=>JSON.stringify(x,(key,value)=>obj(value)
  ?Object.fromEntries(Object.keys(value).sort().map(k=>[k,value[k]])):value);
const sha=x=>createHash('sha256').update(x).digest('hex');
const same=(a,b)=>canonical(a)===canonical(b);
const result=(status,reason,extra={})=>({
 status,reason,canonicalLearningAdmitted:false,productionAdmissionAuthorized:false,
 skillPromotionAuthorized:false,receiptMutationPerformed:false,
 ...extra
});
const blocked=(reason,more)=>result('BLOCKED',reason,more);
const pending=(reason,more)=>result('PENDING_RECONCILIATION',reason,more);
const disputed=(reason,more)=>result('DISPUTED',reason,more);
const eventKeys=['schema','requestId','outcomeId','receiptHash','formulaReceiptHash',
 'veritasPreReceiptHash','veritasPostReceiptHash','independentReadbackHash',
 'sourceRevision','capabilityId','patternCode','outcomeState','scope'];
const obligationKeys=['schema','obligationId','requestId','outcomeId','receiptHash',
 'receiptRecordId','receiptCommitId','admissionKey','eventDigest','commitState',
 'scope','origin','event'];
const hasExact=(x,keys)=>obj(x)&&Object.keys(x).sort().join('|')===[...keys].sort().join('|');

/** Stable, language-neutral canonical JSON: recursively sort object keys. */
export function digestLearningEvent(event){
 if(!obj(event))throw Error('LEARNING_EVENT_INVALID');
 return sha(canonical(event));
}

export function assessCommittedObligation(obligation,{obligationId,scope=INSTITUTIONAL_SCOPE}={}){
 if(!hasExact(obligation,obligationKeys)||!hasExact(obligation?.event,eventKeys))
  return blocked('OBLIGATION_SCHEMA_UNRECOGNIZED');
 if(!ID.test(obligationId||'')||obligation.obligationId!==obligationId||
    !KEY_PART.test(obligation.requestId)||!KEY_PART.test(obligation.outcomeId)||
    !ID.test(obligation.receiptRecordId)||!ID.test(obligation.receiptCommitId)||
    !HASH.test(obligation.receiptHash)||!HASH.test(obligation.eventDigest))
  return blocked('OBLIGATION_IDENTITY_OR_DIGEST_INVALID');
 if(obligation.schema!==LEARNING_OBLIGATION_SCHEMA||
    obligation.event.schema!==LEARNING_EVENT_SCHEMA||
    obligation.commitState!=='COMMITTED'||
    obligation.origin!=='CANONICAL_RECEIPT_AUTHORITY'||
    obligation.scope!==scope||scope!==INSTITUTIONAL_SCOPE)
  return blocked('OBLIGATION_NOT_COMMITTED_OR_SCOPE_INELIGIBLE');
 if(obligation.admissionKey!==obligation.requestId+':'+obligation.outcomeId+':'+obligation.receiptHash)
  return blocked('ADMISSION_KEY_CORRELATION_INVALID');
 const e=obligation.event;
 if(e.scope!==scope||e.requestId!==obligation.requestId||
    e.outcomeId!==obligation.outcomeId||e.receiptHash!==obligation.receiptHash||
    ![e.formulaReceiptHash,e.veritasPreReceiptHash,e.veritasPostReceiptHash,
       e.independentReadbackHash].every(x=>HASH.test(x))||
    !ID.test(e.capabilityId)||!ID.test(e.patternCode)||
    !/^[a-f0-9]{40}$/.test(e.sourceRevision)||!OUTCOMES.includes(e.outcomeState))
  return blocked('EVENT_PROVENANCE_OR_OUTCOME_INVALID');
 if(digestLearningEvent(e)!==obligation.eventDigest)
  return disputed('OBLIGATION_EVENT_DIGEST_MISMATCH');
 return result('SOURCE_SHAPE_VALID','NO_AUTHORITY_VALIDATION_PERFORMED',
    {admissionKey:obligation.admissionKey,eventDigest:obligation.eventDigest});
}

const roles=[
 ['receiptAuthority','CANONICAL_RECEIPT_OUTBOX_READER'],
 ['independentVeritas','INDEPENDENT_VERITAS_EVIDENCE_VERIFIER'],
 ['canonicalLedger','CANONICAL_LEARNING_LEDGER_WRITER']
];
async function inspectBindings(deps,scope){
 const providerIds=new Set();
 for(const [key,role] of roles){
  if(!obj(deps[key])||typeof deps[key].verifyBinding!=='function')
   return blocked('PROVIDER_BINDING_MISSING:'+role);
  let proof;
  try{proof=await deps[key].verifyBinding({role,scope,readOnly:key!=='canonicalLedger'});}
  catch{return blocked('PROVIDER_BINDING_CHECK_FAILED:'+role);}
  if(proof?.status!=='QUALIFIED'||proof.role!==role||proof.scope!==scope||
     proof.independentlyAuthenticated!==true||!ID.test(proof.providerId||''))
   return blocked('PROVIDER_NOT_INDEPENDENTLY_QUALIFIED:'+role);
  if(providerIds.has(proof.providerId))
   return blocked('INDEPENDENT_AUTHORITY_ROLE_SEPARATION_FAILED');
  providerIds.add(proof.providerId);
 }
 return {status:'QUALIFIED_BOUNDARY_CLAIM'};
}
const actualRecord=(record,obligation)=>obj(record)&&record.status==='ADMITTED_VERIFIED'&&
 record.authority==='leeway-learning-ledger'&&record.durableReadbackVerified===true&&
 ID.test(record.recordId||'')&&HASH.test(record.readbackSha256||'')&&
 record.admissionKey===obligation.admissionKey&&
 record.requestId===obligation.requestId&&record.outcomeId===obligation.outcomeId&&
 record.receiptHash===obligation.receiptHash&&
 record.receiptRecordId===obligation.receiptRecordId&&
 record.receiptCommitId===obligation.receiptCommitId&&
 record.eventDigest===obligation.eventDigest&&
 record.scope===obligation.scope&&record.outcomeState===obligation.event.outcomeState&&
 record.formulaReceiptHash===obligation.event.formulaReceiptHash&&
 record.veritasPreReceiptHash===obligation.event.veritasPreReceiptHash&&
 record.veritasPostReceiptHash===obligation.event.veritasPostReceiptHash&&
 record.independentReadbackHash===obligation.event.independentReadbackHash&&
 record.sourceRevision===obligation.event.sourceRevision&&
 record.capabilityId===obligation.event.capabilityId&&
 record.patternCode===obligation.event.patternCode;

/**
 * The canonical writer MUST enforce a UNIQUE admissionKey with exact eventDigest
 * atomically. This consumer cannot enforce uniqueness across other processes.
 * The Receipt Authority MUST have atomically committed obligation + receipt.
 * No arbitrary LLM, queue task, URL or user input may create trust providers.
 */
export async function reconcileLearningObligation({
 obligationId,receiptAuthority,independentVeritas,canonicalLedger,
 scope=INSTITUTIONAL_SCOPE
}={}){
 if(!ID.test(obligationId||'')||scope!==INSTITUTIONAL_SCOPE)
  return blocked('INGRESS_SCOPE_OR_ID_INVALID');
 const deps={receiptAuthority,independentVeritas,canonicalLedger};
 const binding=await inspectBindings(deps,scope);
 if(binding.status!=='QUALIFIED_BOUNDARY_CLAIM')return binding;
 if(typeof receiptAuthority.readCommittedObligation!=='function'||
    typeof receiptAuthority.verifyAtomicReceiptCommit!=='function'||
    typeof independentVeritas.verifyOutcomeEvidence!=='function'||
    typeof canonicalLedger.findByAdmissionKey!=='function'||
    typeof canonicalLedger.admit!=='function'||
    typeof canonicalLedger.readback!=='function')
  return blocked('CANONICAL_PROVIDER_METHOD_UNBOUND');

 let obligation;
 try{obligation=await receiptAuthority.readCommittedObligation({obligationId,scope,readOnly:true});}
 catch{return pending('RECEIPT_OWNED_OBLIGATION_UNAVAILABLE');}
 const shape=assessCommittedObligation(obligation,{obligationId,scope});
 if(shape.status!=='SOURCE_SHAPE_VALID')return shape;
 // Original receipt keeper, not Learning, must attest that the OUTBOX
 // obligation was committed in the SAME durable transaction as the receipt.
 let commit;
 try{commit=await receiptAuthority.verifyAtomicReceiptCommit({
   obligationId,requestId:obligation.requestId,receiptHash:obligation.receiptHash,
   receiptRecordId:obligation.receiptRecordId,
   receiptCommitId:obligation.receiptCommitId,eventDigest:obligation.eventDigest,
   readOnly:true
 });}catch{return pending('RECEIPT_ATOMIC_COMMIT_RECHECK_UNAVAILABLE');}
 if(commit?.status!=='VERIFIED'||commit.atomicWithReceipt!==true||
    commit.canonicalChainVerified!==true||commit.independentReadbackVerified!==true||
    commit.obligationId!==obligationId||commit.requestId!==obligation.requestId||
    commit.receiptHash!==obligation.receiptHash||
    commit.receiptRecordId!==obligation.receiptRecordId||
    commit.receiptCommitId!==obligation.receiptCommitId||
    commit.eventDigest!==obligation.eventDigest)
  return blocked('RECEIPT_ATOMIC_COMMIT_NOT_VERIFIED');

 let decision;
 try{decision=await independentVeritas.verifyOutcomeEvidence({
   obligationId,admissionKey:obligation.admissionKey,event:obligation.event,
   receiptHash:obligation.receiptHash,readOnly:true
 });}catch{return pending('INDEPENDENT_VERITAS_RECHECK_UNAVAILABLE');}
 if(decision?.status!=='VERIFIED'||decision.independentVerified!==true||
    decision.privacyCleared!==true||decision.transferEligible!==true||
    decision.admissionKey!==obligation.admissionKey||
    decision.eventDigest!==obligation.eventDigest||
    decision.requestId!==obligation.requestId||
    decision.receiptHash!==obligation.receiptHash||
    decision.outcomeState!==obligation.event.outcomeState||
    decision.scope!==scope)
  return blocked('INDEPENDENT_VERITAS_OUTCOME_NOT_QUALIFIED');

 async function readAndCheck(recordId){
  let record;
  try{record=await canonicalLedger.readback({recordId,admissionKey:obligation.admissionKey,
     scope,readOnly:true});}
  catch{return pending('CANONICAL_LEARNING_READBACK_UNAVAILABLE',{admissionKey:obligation.admissionKey});}
  if(!actualRecord(record,obligation))
   return disputed('LEARNING_READBACK_IDENTITY_OR_DIGEST_DISPUTED',
     {admissionKey:obligation.admissionKey});
  return result('ADMITTED_VERIFIED','CANONICAL_SAME_KEY_DURABLE_READBACK',{
   canonicalLearningAdmitted:true,admissionKey:obligation.admissionKey,
   recordId:record.recordId,readbackSha256:record.readbackSha256,
   outcomeState:record.outcomeState,replaySafe:true,
   verifiedByHostBindingsNotLocalSignatures:true
  });
 }

 let found;
 try{found=await canonicalLedger.findByAdmissionKey({admissionKey:obligation.admissionKey,
   scope,readOnly:true});}
 catch{return pending('CANONICAL_LEARNING_LOOKUP_UNAVAILABLE',{admissionKey:obligation.admissionKey});}
 if(found?.status==='FOUND'){
   if(found.eventDigest!==obligation.eventDigest)
     return disputed('ADMISSION_KEY_REUSED_WITH_DIFFERENT_DIGEST',{admissionKey:obligation.admissionKey});
   if(!ID.test(found.recordId||''))
     return disputed('CANONICAL_RECORD_ID_INVALID');
   return readAndCheck(found.recordId);
 }
 if(found?.status==='DISPUTED')
   return disputed('CANONICAL_ADMISSION_KEY_DISPUTED',{admissionKey:obligation.admissionKey});
 if(found?.status!=='NOT_FOUND')
   return pending('CANONICAL_LOOKUP_UNCERTAIN',{admissionKey:obligation.admissionKey});

 // A write failure may be an ACK loss after a successful canonical append.
 // Reconciliation must first read by key; never retry blindly in this call.
 let accepted;
 try{accepted=await canonicalLedger.admit({admissionKey:obligation.admissionKey,
    eventDigest:obligation.eventDigest,event:obligation.event,
    qualification:decision,receiptCommit:commit,scope});}
 catch{return pending('CANONICAL_APPEND_OUTCOME_UNKNOWN_RECONCILE_BY_KEY',
    {admissionKey:obligation.admissionKey});}
 if(accepted?.status==='CONFLICT')
   return disputed('CANONICAL_ADMISSION_KEY_CONFLICT',{admissionKey:obligation.admissionKey});
 if(!['ADMITTED','ALREADY_ADMITTED'].includes(accepted?.status)||
    !ID.test(accepted?.recordId||'')||
    accepted.eventDigest!==obligation.eventDigest)
   return pending('CANONICAL_ADMISSION_RESPONSE_UNQUALIFIED_RECONCILE_BY_KEY',
     {admissionKey:obligation.admissionKey});
 return readAndCheck(accepted.recordId);
}

/** Read-only liveness report: provider health never implies real production admission. */
export function inspectLearningIngressRequirements({receiptOutbox,veritas,canonicalWriter,
 historicalCustody,universityReadPolicy}={}){
 const gates=[
  ['RECEIPT_ATOMIC_OUTBOX',receiptOutbox],
  ['INDEPENDENT_VERITAS',veritas],
  ['CANONICAL_LEARNING_WRITER',canonicalWriter],
  ['HISTORICAL_LEDGER_CUSTODY',historicalCustody],
  ['UNIVERSITY_READ_POLICY',universityReadPolicy]
 ];
 return {schema:'leeway.learning.ingress-readiness.v1',status:'SOURCE_DIAGNOSTIC_ONLY',
  requirements:gates.map(([gate,reported])=>({gate,reported:
    reported===true?'REPORTED_READY_NOT_INDEPENDENTLY_VERIFIED':'UNVERIFIED'})),
  canonicalLearningAdmitted:false,productionAdmissionAuthorized:false,
  mutationPerformed:false};
}

/**
 * Receipt-owned outbox discovery. The consumer never deletes an obligation,
 * moves the issuer's durable cursor, or acknowledges delivery on its own.
 * Items are independently reconciled, so one disputed item need not block
 * unrelated admitted items. The original receipt owner retains the ACK duty.
 */
export async function drainCommittedLearningObligations({
 receiptAuthority,independentVeritas,canonicalLedger,
 scope=INSTITUTIONAL_SCOPE,limit=10
}={}){
 if(scope!==INSTITUTIONAL_SCOPE||!Number.isInteger(limit)||limit<1||limit>50)
  return blocked('DELIVERY_BATCH_SCOPE_OR_LIMIT_INVALID');
 if(!receiptAuthority||typeof receiptAuthority.listPendingObligationIds!=='function')
  return blocked('RECEIPT_OWNED_OUTBOX_DISCOVERY_UNBOUND');
 if(typeof receiptAuthority.verifyBinding!=='function')
  return blocked('RECEIPT_OUTBOX_PROVIDER_UNQUALIFIED');
 let binding;
 try{binding=await receiptAuthority.verifyBinding({
   role:'CANONICAL_RECEIPT_OUTBOX_READER',scope,readOnly:true});}
 catch{return pending('RECEIPT_OUTBOX_BINDING_UNAVAILABLE');}
 if(binding?.status!=='QUALIFIED'||
    binding.role!=='CANONICAL_RECEIPT_OUTBOX_READER'||
    binding.scope!==scope||binding.independentlyAuthenticated!==true||
    !ID.test(binding.providerId||''))
  return blocked('RECEIPT_OUTBOX_PROVIDER_UNQUALIFIED');
 let ids;
 try{ids=await receiptAuthority.listPendingObligationIds({
   scope,limit,readOnly:true});}
 catch{return pending('RECEIPT_OUTBOX_PENDING_INDEX_UNAVAILABLE');}
 if(!Array.isArray(ids)||ids.length>limit||
    ids.some(x=>!ID.test(x||''))||new Set(ids).size!==ids.length)
  return blocked('RECEIPT_OUTBOX_PENDING_INDEX_INVALID');
 const results=[];
 for(const obligationId of ids){
   const decision=await reconcileLearningObligation({
     obligationId,receiptAuthority,independentVeritas,canonicalLedger,scope});
   results.push({obligationId,status:decision.status,reason:decision.reason,
     recordId:decision.recordId||null,admissionKey:decision.admissionKey||null});
 }
 return {status:'SOURCE_DELIVERY_BATCH_EVALUATED',
   inspected:ids.length,admitted:results.filter(x=>x.status==='ADMITTED_VERIFIED').length,
   disputed:results.filter(x=>x.status==='DISPUTED').length,
   held:results.filter(x=>x.status==='BLOCKED'||x.status==='PENDING_RECONCILIATION').length,
   results,
   receiptOutboxAcknowledged:false,receiptOutboxCursorAdvanced:false,
   productionAdmissionAuthorized:false,skillPromotionAuthorized:false};
}
