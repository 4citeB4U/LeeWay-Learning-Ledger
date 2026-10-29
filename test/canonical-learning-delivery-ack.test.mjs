/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.C3.DELIVERY_ACK_TEST
TAG: LEEWAY.LEARNING.C3.RECEIPT_OWNED_ACK_RECOVERY_TEST_V1
WHAT: Source-test original Receipt Authority ACK handoff, crash and disputed delivery.
WHY: A successful Learning append must never imply an unrecorded Receipt outbox ACK.
WHO: LeeWay Learning Ledger source CI.
WHERE: test/canonical-learning-delivery-ack.test.mjs
WHEN: C3 source review; simulated provider only; no production authorities.
LICENSE: MIT
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {digestLearningEvent,LEARNING_EVENT_SCHEMA,LEARNING_OBLIGATION_SCHEMA,INSTITUTIONAL_SCOPE}
 from '../src/canonical-learning-inbox.mjs';
import {reconcileLearningDeliveryAck as run} from '../src/canonical-learning-delivery-ack.mjs';

const hex=c=>c.repeat(64);
const requestId='c3-ack-original-001',outcomeId='c3-ack-outcome-001';
const obligationId='receipt-outbox-learning-ack-001',receiptHash=hex('a');
const event=()=>({
 schema:LEARNING_EVENT_SCHEMA,requestId,outcomeId,receiptHash,
 formulaReceiptHash:hex('b'),veritasPreReceiptHash:hex('c'),
 veritasPostReceiptHash:hex('d'),independentReadbackHash:hex('e'),
 sourceRevision:'f'.repeat(40),capabilityId:'device-info-001',
 patternCode:'verified-failure-001',outcomeState:'VERIFIED_FAILURE',
 scope:INSTITUTIONAL_SCOPE
});
const obligation=()=>({
 schema:LEARNING_OBLIGATION_SCHEMA,obligationId,requestId,outcomeId,receiptHash,
 receiptRecordId:'canonical-receipt-001',receiptCommitId:'receipt-commit-001',
 admissionKey:requestId+':'+outcomeId+':'+receiptHash,
 eventDigest:digestLearningEvent(event()),commitState:'COMMITTED',
 scope:INSTITUTIONAL_SCOPE,origin:'CANONICAL_RECEIPT_AUTHORITY',event:event()
});
const role=(id)=>async({role,scope})=>({
 status:'QUALIFIED',role,scope,providerId:id,independentlyAuthenticated:true
});
function harness({ackFile=null,ackFailure=false,learningFailure=false,ackReadFailure=false}={}){
 const o=obligation(),stored=new Map(),counts={ack:0,admit:0};
 const acks=ackFile&&fs.existsSync(ackFile)?JSON.parse(fs.readFileSync(ackFile,'utf8')):{};
 const persist=()=>{if(ackFile)fs.writeFileSync(ackFile,JSON.stringify(acks));};
 const record={
   status:'ADMITTED_VERIFIED',authority:'leeway-learning-ledger',
   durableReadbackVerified:true,recordId:'learning-record-001',readbackSha256:hex('9'),
   admissionKey:o.admissionKey,requestId,outcomeId,receiptHash,
   receiptRecordId:o.receiptRecordId,receiptCommitId:o.receiptCommitId,
   eventDigest:o.eventDigest,scope:INSTITUTIONAL_SCOPE,
   outcomeState:o.event.outcomeState,formulaReceiptHash:o.event.formulaReceiptHash,
   veritasPreReceiptHash:o.event.veritasPreReceiptHash,veritasPostReceiptHash:o.event.veritasPostReceiptHash,
   independentReadbackHash:o.event.independentReadbackHash,sourceRevision:o.event.sourceRevision,
   capabilityId:o.event.capabilityId,patternCode:o.event.patternCode
 };
 if(!learningFailure)stored.set(o.admissionKey,record);
 const makeAck=()=>({
   status:'ACKNOWLEDGED_VERIFIED',authority:'CANONICAL_RECEIPT_AUTHORITY',
   durableReadbackVerified:true,ackRecordId:'receipt-ack-001',
   ackReadbackSha256:hex('8'),
   obligationId,receiptCommitId:o.receiptCommitId,
   receiptRecordId:o.receiptRecordId,receiptHash,
   eventDigest:o.eventDigest,admissionKey:o.admissionKey,
   learningRecordId:record.recordId,learningReadbackSha256:record.readbackSha256
 });
 const deps={
   obligationId,
   counts,
   acks,
   receiptAuthority:{
      verifyBinding:role('distinct-receipt-issuer'),
      async readCommittedObligation(){return structuredClone(o);},
      async verifyAtomicReceiptCommit(){return {
         status:'VERIFIED',atomicWithReceipt:true,canonicalChainVerified:true,
         independentReadbackVerified:true,obligationId,requestId,receiptHash,
         receiptRecordId:o.receiptRecordId,receiptCommitId:o.receiptCommitId,eventDigest:o.eventDigest
      };},
      async readDeliveryAck(){if(ackReadFailure)throw Error('ACK_READ_OFFLINE');
         return acks[obligationId]?{status:'FOUND',ack:structuredClone(acks[obligationId])}:
           {status:'NOT_FOUND'};},
      async acknowledgeLearningDelivery(){counts.ack++;
         acks[obligationId]=makeAck();persist();
         if(ackFailure)throw Error('COMMIT_WROTE_BUT_ACK_RESPONSE_LOST');
         return {status:'RECORDED'};
      }
   },
   independentVeritas:{
      verifyBinding:role('distinct-veritas-issuer'),
      async verifyOutcomeEvidence(){return {
         status:'VERIFIED',independentVerified:true,privacyCleared:true,
         transferEligible:true,requestId,receiptHash,
         admissionKey:o.admissionKey,eventDigest:o.eventDigest,
         outcomeState:o.event.outcomeState,scope:INSTITUTIONAL_SCOPE
      };}
   },
   canonicalLedger:{
      verifyBinding:role('distinct-canonical-learning-writer'),
      async findByAdmissionKey(){return learningFailure?{status:'NOT_FOUND'}:
          {status:'FOUND',recordId:record.recordId,eventDigest:record.eventDigest};},
      async admit(){counts.admit++;return {status:'REJECTED'};},
      async readback(){return structuredClone(record);}
   }
 };
 return deps;
}
test('01 original issuer ACK only after separately qualified canonical Learning readback',async()=>{
 const d=harness(),r=await run(d);
 assert.equal(r.status,'DELIVERY_ACKNOWLEDGED_VERIFIED');
 assert.equal(r.deliveryAcknowledged,true);
 assert.equal(r.productionAdmissionAuthorized,false);
 assert.equal(r.canonicalHistoryRewritten,false);
 assert.equal(d.counts.ack,1);
 assert.equal(d.counts.admit,0);
});
test('02 replay finds exact prior issuer ACK without another write',async()=>{
 const d=harness();
 assert.equal((await run(d)).deliveryAcknowledged,true);
 const replay=await run(d);
 assert.equal(replay.status,'DELIVERY_ACKNOWLEDGED_VERIFIED');
 assert.equal(replay.replayed,true);
 assert.equal(d.counts.ack,1);
});
test('03 lost write acknowledgement after durable ACK holds then reconciles on restart',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'leeway-c3-ack-')),file=path.join(dir,'ack.json');
 try{
   const first=harness({ackFile:file,ackFailure:true});
   assert.equal((await run(first)).status,'PENDING_RECONCILIATION');
   assert.equal(first.counts.ack,1);
   const second=harness({ackFile:file});
   const replay=await run(second);
   assert.equal(replay.deliveryAcknowledged,true);
   assert.equal(replay.replayed,true);
   assert.equal(second.counts.ack,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('04 missing canonical Learning cannot ACK a receipt obligation',async()=>{
 const d=harness({learningFailure:true});
 const r=await run(d);
 assert.equal(r.status,'PENDING_RECONCILIATION');
 assert.equal(r.deliveryAcknowledged,false);
 assert.equal(d.counts.ack,0);
});
test('05 foreign receipt outbox ACK is disputed without modification',async()=>{
 const d=harness();
 d.acks[obligationId]={status:'ACKNOWLEDGED_VERIFIED',authority:'CANONICAL_RECEIPT_AUTHORITY',
   durableReadbackVerified:true,ackRecordId:'ack-foreign-001',
   ackReadbackSha256:hex('8'),obligationId,receiptCommitId:'forged-commit',
   receiptRecordId:'canonical-receipt-001',receiptHash,eventDigest:obligation().eventDigest,
   admissionKey:obligation().admissionKey,learningRecordId:'learning-record-001',
   learningReadbackSha256:hex('9')};
 const r=await run(d);
 assert.equal(r.status,'DISPUTED');
 assert.equal(d.counts.ack,0);
});
test('06 ACK read unavailable prevents blind new ACK attempt',async()=>{
 const d=harness({ackReadFailure:true});
 const r=await run(d);
 assert.equal(r.status,'PENDING_RECONCILIATION');
 assert.equal(r.reason,'RECEIPT_ACK_LOOKUP_UNAVAILABLE');
 assert.equal(d.counts.ack,0);
});
test('07 missing original ACK mutation method fails closed',async()=>{
 const d=harness();
 delete d.receiptAuthority.acknowledgeLearningDelivery;
 assert.equal((await run(d)).reason,'ORIGINAL_RECEIPT_ACK_PROVIDER_UNBOUND');
});
test('08 invalid request identity cannot reach Receipt Authority',async()=>{
 const d=harness();
 const r=await run({...d,obligationId:'bad id with spaces'});
 assert.equal(r.reason,'ACK_SCOPE_OR_OBLIGATION_INVALID');
 assert.equal(d.counts.ack,0);
});
test('09 ACK write result cannot substitute readback',async()=>{
 const d=harness();
 const orig=d.receiptAuthority.readDeliveryAck;
 let reads=0;
 d.receiptAuthority.readDeliveryAck=async(...args)=>{
   reads++;
   if(reads===2)return {status:'NOT_FOUND'};
   return orig(...args);
 };
 const r=await run(d);
 assert.equal(r.status,'PENDING_RECONCILIATION');
 assert.equal(d.counts.ack,1);
 assert.equal(r.deliveryAcknowledged,false);
});
test('10 original Receipt ACK must not turn verified failure into production success',async()=>{
 const d=harness();const r=await run(d);
 assert.equal(r.status,'DELIVERY_ACKNOWLEDGED_VERIFIED');
 assert.equal(r.productionAdmissionAuthorized,false);
 assert.equal(r.skillPromotionAuthorized,false);
});

test('11 changed receipt obligation between Learning readback and ACK is quarantined',async()=>{
 const d=harness();
 const original=d.receiptAuthority.readCommittedObligation;
 let count=0;
 d.receiptAuthority.readCommittedObligation=async (...args)=>{
   const o=await original(...args);
   count++;
   if(count===2){o.receiptCommitId='different-receipt-commit-001';}
   return o;
 };
 const r=await run(d);
 assert.equal(count,2);
 assert.equal(r.status,'DISPUTED');
 assert.equal(r.reason,'ACK_ORIGINAL_RECEIPT_OBLIGATION_CHANGED');
 assert.equal(r.deliveryAcknowledged,false);
 assert.equal(d.counts.ack,0);
});
