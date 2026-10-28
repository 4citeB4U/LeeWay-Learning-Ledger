/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.C3.DELIVERY_ACK
TAG: LEEWAY.LEARNING.C3.RECEIPT_OWNED_ACK_HANDOFF_V1
WHAT: Confirm independently qualified Learning readback to the original Receipt outbox owner.
WHY: A persisted Learning append and a lost ACK must reconcile without erasing receipts or delivering twice.
WHO: Receipt Authority owns ACK persistence. Learning owns exact canonical readback handoff.
WHERE: src/canonical-learning-delivery-ack.mjs
WHEN: Creator-authorized C3 integration, source only.
HOW: Reuse current Learning inbox qualification, original Receipt Authority ACK lookup and exact durable readback.
AUTHORITY: No new Receipt Ledger writer, issuer, verifier, skill promotion, or production grant.
LICENSE: MIT
*/
import {
 assessCommittedObligation,reconcileLearningObligation,INSTITUTIONAL_SCOPE
} from './canonical-learning-inbox.mjs';

const HASH=/^[a-f0-9]{64}$/;
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const respond=(status,reason,more={})=>({
 status,reason,deliveryAcknowledged:false,canonicalHistoryRewritten:false,
 productionAdmissionAuthorized:false,skillPromotionAuthorized:false,
 ...more
});
const blocked=(reason)=>respond('BLOCKED',reason);
const pending=(reason)=>respond('PENDING_RECONCILIATION',reason);
const disputed=(reason)=>respond('DISPUTED',reason);
const ackMatches=(ack,obligation,learning)=>{
 if(ack?.status!=='ACKNOWLEDGED_VERIFIED'||
    ack.authority!=='CANONICAL_RECEIPT_AUTHORITY'||
    ack.durableReadbackVerified!==true||
    !ID.test(ack.ackRecordId||'')||
    !HASH.test(ack.ackReadbackSha256||''))return false;
 return ack.obligationId===obligation.obligationId&&
    ack.receiptCommitId===obligation.receiptCommitId&&
    ack.receiptRecordId===obligation.receiptRecordId&&
    ack.receiptHash===obligation.receiptHash&&
    ack.eventDigest===obligation.eventDigest&&
    ack.admissionKey===obligation.admissionKey&&
    ack.learningRecordId===learning.recordId&&
    ack.learningReadbackSha256===learning.readbackSha256;
};

/**
 * ACK is a separate durable delivery-state transition OWNED by original Receipt
 * Authority. Canonical receipt history and original Learning records are NEVER
 * edited. The underlying outbox writer must enforce atomic unique ACK identity.
 * After an uncertain ACK return, a future invocation first reads the original
 * ACK. A new ACK is not attempted on this same ambiguous invocation.
 */
export async function reconcileLearningDeliveryAck({
 obligationId,receiptAuthority,independentVeritas,canonicalLedger,
 scope=INSTITUTIONAL_SCOPE
}={}){
 if(!ID.test(obligationId||'')||scope!==INSTITUTIONAL_SCOPE)
   return blocked('ACK_SCOPE_OR_OBLIGATION_INVALID');
 if(typeof receiptAuthority?.readCommittedObligation!=='function'||
    typeof receiptAuthority?.readDeliveryAck!=='function'||
    typeof receiptAuthority?.acknowledgeLearningDelivery!=='function')
   return blocked('ORIGINAL_RECEIPT_ACK_PROVIDER_UNBOUND');

 // Reuse original independent receipt+Veritas+canonical Learning qualification
 // and its durable readback, not a task-supplied "learning completed" flag.
 const learning=await reconcileLearningObligation({
   obligationId,receiptAuthority,independentVeritas,canonicalLedger,scope
 });
 if(learning.status!=='ADMITTED_VERIFIED'||learning.canonicalLearningAdmitted!==true)
   return respond(learning.status==='DISPUTED'?'DISPUTED':
     learning.status==='BLOCKED'?'BLOCKED':'PENDING_RECONCILIATION',
     'ACK_WITHHELD_LEARNING_NOT_AUTHENTICATED',
     {learningStatus:learning.status,learningReason:learning.reason});

 let obligation;
 try{obligation=await receiptAuthority.readCommittedObligation({
   obligationId,scope,readOnly:true});}
 catch{return pending('ACK_ORIGINAL_OBLIGATION_UNAVAILABLE');}
 if(assessCommittedObligation(obligation,{obligationId,scope}).status!=='SOURCE_SHAPE_VALID'||
    obligation.admissionKey!==learning.admissionKey)
   return disputed('ACK_ORIGINAL_RECEIPT_OBLIGATION_CHANGED');

 const expected={
   obligationId,
   receiptCommitId:obligation.receiptCommitId,
   receiptRecordId:obligation.receiptRecordId,
   receiptHash:obligation.receiptHash,
   admissionKey:obligation.admissionKey,
   eventDigest:obligation.eventDigest,
   learningRecordId:learning.recordId,
   learningReadbackSha256:learning.readbackSha256
 };
 let before;
 try{before=await receiptAuthority.readDeliveryAck({
   obligationId,scope,readOnly:true});}
 catch{return pending('RECEIPT_ACK_LOOKUP_UNAVAILABLE');}
 if(before?.status==='FOUND'){
   if(!ackMatches(before.ack,obligation,learning))
      return disputed('EXISTING_RECEIPT_ACK_CONFLICT');
   return respond('DELIVERY_ACKNOWLEDGED_VERIFIED','EXISTING_DURABLE_RECEIPT_ACK',{
     deliveryAcknowledged:true,ackRecordId:before.ack.ackRecordId,
     ackReadbackSha256:before.ack.ackReadbackSha256,replayed:true
   });
 }
 if(before?.status==='CONFLICT')
   return disputed('RECEIPT_ACK_INDEX_CONFLICT');
 if(before?.status!=='NOT_FOUND')
   return pending('RECEIPT_ACK_LOOKUP_UNCERTAIN');

 // Only the original Receipt Authority can atomically write its own delivery
 // ACK. It must independently authenticate the Learning issuer/custody.
 let response;
 try{response=await receiptAuthority.acknowledgeLearningDelivery({
   ...expected,scope,learningProofSource:'CANONICAL_LEARNING_LEDGER_READBACK',
   idempotencyKey:obligationId
 });}
 catch{return pending('RECEIPT_ACK_OUTCOME_UNKNOWN_REQUERY_ORIGINAL');}
 if(response?.status==='CONFLICT')return disputed('RECEIPT_ACK_WRITE_CONFLICT');
 if(!['RECORDED','ALREADY_RECORDED'].includes(response?.status))
   return pending('RECEIPT_ACK_WRITE_UNQUALIFIED_REQUERY_ORIGINAL');

 let after;
 try{after=await receiptAuthority.readDeliveryAck({
   obligationId,scope,readOnly:true});}
 catch{return pending('RECEIPT_ACK_DURABLE_READBACK_UNAVAILABLE');}
 if(after?.status!=='FOUND')
   return pending('RECEIPT_ACK_DURABLE_READBACK_PENDING');
 if(!ackMatches(after.ack,obligation,learning))
   return disputed('RECEIPT_ACK_DURABLE_READBACK_MISMATCH');
 return respond('DELIVERY_ACKNOWLEDGED_VERIFIED','NEW_DURABLE_RECEIPT_ACK',{
   deliveryAcknowledged:true,ackRecordId:after.ack.ackRecordId,
   ackReadbackSha256:after.ack.ackReadbackSha256,replayed:false
 });
}
