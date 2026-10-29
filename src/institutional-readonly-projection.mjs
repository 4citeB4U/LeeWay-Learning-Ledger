/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.C3.INSTITUTIONAL_READBACK
TAG: LEEWAY.LEARNING.C3.UNIVERSITY_VERIFIED_READ_ONLY_V1
WHAT: Retrieve metadata for already admitted technical lessons without granting execution rights.
WHY: University/Skills must not obey retrieved prompt injection or cross-owner preference data.
WHO: Canonical Learning Ledger owner; University and Skills are read-only consumers.
WHERE: src/institutional-readonly-projection.mjs.
WHEN: 2026-10-27.
HOW: External trusted binding, authenticated scope authorization, exact record readback and bounded metadata-only projection.
AUTHORIZED_ROLES: Read existing learning data only. No skill edits, action permissions, personal journal access or new ledger writer.
LICENSE: MIT.
*/
import {INSTITUTIONAL_SCOPE,OUTCOMES} from './canonical-learning-inbox.mjs';
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const HASH=/^[a-f0-9]{64}$/;
const deny=reason=>({status:'BLOCKED',reason,records:[],
  executionAuthorized:false,skillPromotionAuthorized:false,canonicalLedgerMutationPerformed:false});
const valid=x=>x&&x.status==='ADMITTED_VERIFIED'&&x.authority==='leeway-learning-ledger'&&
 x.durableReadbackVerified===true&&x.scope===INSTITUTIONAL_SCOPE&&
 ID.test(x.recordId||'')&&ID.test(x.requestId||'')&&ID.test(x.outcomeId||'')&&
 ID.test(x.capabilityId||'')&&ID.test(x.patternCode||'')&&
 HASH.test(x.receiptHash||'')&&HASH.test(x.eventDigest||'')&&
 HASH.test(x.readbackSha256||'')&&OUTCOMES.includes(x.outcomeState);

/** Only admission identifiers and coded procedure/failure categories are exposed. */
export async function retrieveVerifiedInstitutionalLessons({
 consumerId,capabilityId,authorizeRead,canonicalLedger,maxRecords=10
}={}){
 if(!ID.test(consumerId||'')||!ID.test(capabilityId||'')||
    !Number.isInteger(maxRecords)||maxRecords<1||maxRecords>25)
  return deny('UNIVERSITY_QUERY_INVALID');
 if(typeof authorizeRead!=='function'||!canonicalLedger||
    typeof canonicalLedger.verifyBinding!=='function'||
    typeof canonicalLedger.listVerifiedByCapability!=='function'||
    typeof canonicalLedger.readback!=='function')
  return deny('UNIVERSITY_AUTHORITY_OR_PROVIDER_UNBOUND');
 let grant,provider;
 try{
  grant=await authorizeRead({consumerId,capabilityId,scope:INSTITUTIONAL_SCOPE,
    capability:'learning.institutional.read',readOnly:true});
  provider=await canonicalLedger.verifyBinding({role:'CANONICAL_LEARNING_LEDGER_READER',
    scope:INSTITUTIONAL_SCOPE,readOnly:true});
 }catch{return deny('UNIVERSITY_AUTHENTICATION_UNAVAILABLE');}
 if(grant?.status!=='AUTHORIZED'||grant.consumerId!==consumerId||
    grant.scope!==INSTITUTIONAL_SCOPE||grant.readOnly!==true||
    provider?.status!=='QUALIFIED'||provider.role!=='CANONICAL_LEARNING_LEDGER_READER'||
    provider.scope!==INSTITUTIONAL_SCOPE||provider.independentlyAuthenticated!==true)
  return deny('UNIVERSITY_READ_NOT_QUALIFIED');
 let index;
 try{index=await canonicalLedger.listVerifiedByCapability({
   capabilityId,scope:INSTITUTIONAL_SCOPE,limit:maxRecords,readOnly:true});}
 catch{return deny('UNIVERSITY_INDEX_READ_FAILED');}
 if(!Array.isArray(index)||index.length>maxRecords||
    index.some(x=>!ID.test(x?.recordId||'')))
  return deny('UNIVERSITY_INDEX_INVALID');
 const seen=new Set(),out=[];
 for(const item of index){
  if(seen.has(item.recordId))return deny('UNIVERSITY_DUPLICATE_INDEX');
  seen.add(item.recordId);
  let record;
  try{record=await canonicalLedger.readback({recordId:item.recordId,
   scope:INSTITUTIONAL_SCOPE,readOnly:true});}
  catch{return deny('UNIVERSITY_RECORD_READBACK_FAILED');}
  if(!valid(record)||record.recordId!==item.recordId||
     record.capabilityId!==capabilityId)
    return deny('UNIVERSITY_RECORD_UNVERIFIED_OR_PRIVATE');
  // Source record descriptions, chat, executable prompts and personal data
  // are deliberately excluded. Coded patterns are DATA, never instructions.
  out.push({
   recordId:record.recordId,requestId:record.requestId,outcomeId:record.outcomeId,
   receiptHash:record.receiptHash,eventDigest:record.eventDigest,
   readbackSha256:record.readbackSha256,capabilityId:record.capabilityId,
   patternCode:record.patternCode,outcomeState:record.outcomeState,
   dataClass:'VERIFIED_NONPERSONAL_METADATA',
   authority:'READ_ONLY_REFERENCE_NOT_INSTRUCTION',
   canModifySkill:false
  });
 }
 return {status:'READ_ONLY_VERIFIED_LESSON_REFERENCES',
  scope:INSTITUTIONAL_SCOPE,consumerId,capabilityId,
  records:out,executionAuthorized:false,skillPromotionAuthorized:false,
  canonicalLedgerMutationPerformed:false,privatePersonalizationIncluded:false};
}
