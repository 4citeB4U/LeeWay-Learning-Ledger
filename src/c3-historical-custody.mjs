/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.C3.CUSTODY
TAG: LEEWAY.LEARNING.C3.PINNED_HISTORIC_READBACK_V1
WHAT: Invoke the existing source-pinned Runtime Fabric historical Learning Ledger reader without writes.
WHY: Reuse evidence custody while preventing historical proof from becoming fake production admission.
WHO: Owner-governed read-only engineering preflight.
WHERE: src/c3-historical-custody.mjs in LeeWay-Learning-Ledger.
WHEN: Before qualification of any live learning provider.
HOW: Inspect exact SHA-256 of a regular source file; execute the qualified reader; verify scoped readback.
AUTHORIZED_ROLES: Historical custody observation only; no canonical writer, PRE/POST, production grant.
LICENSE: MIT
*/
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

// Values from Runtime Fabric docs/C3-CANONICAL-RECEIPT-AND-LEARNING-TRUTH-20261023.md.
// These are historical custody pins, NOT active production authorization.
export const HISTORICAL_C3_CUSTODY_PINS = Object.freeze({
  readbackSourceSha256:'f927f3c5365af763b02be3c6a2f5cefc17e73bdd08b4ec62f127b9c2cbfde2f0',
  historicalLedgerSha256:'1167118df27d8f028055ebef9f2cf3e0ca549be1732cc56150a422a968ac1f72',
  originalEventProofSha256:'1102d6a8474d4e3a8070b623669d6f128fc5a45675264acfb154532b75a79bb1',
  historicalRecordCount:133,
  historicalScope:'OWNER_LOCAL_HOST_READ_V1_ON_PC_PRIMARY_ONLY'
});
const HEX=/^[0-9a-f]{64}$/;
const deny=(reason, source='UNVERIFIED')=>({
  status:'BLOCKED',reason,source,
  mutationPerformed:false,liveReadbackPerformed:false,canonicalLearningAdmitted:false,
  productionAdmissionAuthorized:false,independentProductionCertificate:false
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

function qualifiedRegularFile(filePath) {
  if(typeof filePath!=='string'||!path.isAbsolute(filePath)) throw Error('ABSOLUTE_READER_PATH_REQUIRED');
  const info=fs.lstatSync(filePath);
  if(!info.isFile()||info.isSymbolicLink()) throw Error('READER_SOURCE_NOT_REGULAR_FILE');
  return fs.readFileSync(filePath);
}

export function qualifyHistoricalCustodyObservation(observation,{
  readerSha256, expectedReaderSha256=HISTORICAL_C3_CUSTODY_PINS.readbackSourceSha256,
  testOnly=false
}={}) {
  if(!HEX.test(readerSha256??'')||!HEX.test(expectedReaderSha256??'')||
     readerSha256!==expectedReaderSha256) return deny('READER_SOURCE_HASH_MISMATCH');
  if(expectedReaderSha256!==HISTORICAL_C3_CUSTODY_PINS.readbackSourceSha256&&!testOnly)
    return deny('HISTORICAL_READER_NOT_SOURCE_PINNED');
  if(!observation||observation.status!=='PASS_SCOPED_EXISTING_HOST_READ'||
    observation.capability!=='learning.ledger.readback'||
    observation.scope!==HISTORICAL_C3_CUSTODY_PINS.historicalScope||
    observation.unchangedHistoricPrefixVerified!==true||
    observation.historicalAnchor?.verified!==true||
    observation.historicalAnchor?.anchoring!=='SHA256_EXACT_BYTE_PREFIX'||
    observation.historicalAnchor?.historicalEntries!==HISTORICAL_C3_CUSTODY_PINS.historicalRecordCount||
    observation.historicRecordCount!==HISTORICAL_C3_CUSTODY_PINS.historicalRecordCount||
    observation.historicalAnchor?.appendedJsonSyntaxValid!==true||
    observation.historicalAnchor?.postAnchorEventsIndependentlyAuthenticated!==false||
    !Number.isSafeInteger(observation.currentRecordCount)||
    !Number.isSafeInteger(observation.laterAppendCount)||
    observation.currentRecordCount<HISTORICAL_C3_CUSTODY_PINS.historicalRecordCount||
    observation.laterAppendCount!==observation.currentRecordCount-HISTORICAL_C3_CUSTODY_PINS.historicalRecordCount||
    observation.historicalAnchor?.currentEntries!==observation.currentRecordCount||
    observation.historicalAnchor?.appendedEntries!==observation.laterAppendCount||
    observation.ledgerSha256!==HISTORICAL_C3_CUSTODY_PINS.historicalLedgerSha256||
    observation.receiptProofSha256!==HISTORICAL_C3_CUSTODY_PINS.originalEventProofSha256||
    !HEX.test(observation.writerSha256??'')||
    !HEX.test(observation.currentLedgerSha256??'')||
    observation.productionWritePerformed!==false||
    observation.gpuAdmissionAuthorized!==false||
    observation.independentProductionCertificate!==false||
    observation.canonicalLearningAdmitted===true||
    observation.productionAdmissionAuthorized===true||
    observation.durableReadbackVerified===true)
    return deny('HISTORICAL_CUSTODY_OBSERVATION_NOT_QUALIFIED');
  return {
    status:testOnly?'TEST_FIXTURE_ONLY':'SCOPED_HISTORICAL_CUSTODY_OBSERVED',
    authority:'RUNTIME_FABRIC_HISTORICAL_READBACK_ONLY',
    originalReaderSha256:readerSha256, historicalAnchorSha256:observation.ledgerSha256,
    historicalProofSha256:observation.receiptProofSha256,
    learnedWriterSha256VerifiedByOriginalReader:observation.writerSha256,
    historicalRecordCount:observation.historicRecordCount,
    currentRecordCount:observation.currentRecordCount,
    appendCount:observation.laterAppendCount,
    currentLedgerSha256:observation.currentLedgerSha256,
    appendedRecordsIndependentlyAuthenticated:false,
    mutationPerformed:false,liveReadbackPerformed:!testOnly,
    canonicalLearningAdmitted:false,productionAdmissionAuthorized:false,
    independentProductionCertificate:false
  };
}

/** Read-only on a qualified OWNER HOST. No import, write or default-zero fallback on failure. */
export async function inspectPinnedHistoricalC3Custody({
  readerPath,proofPath,configPath,
  expectedReaderSha256=HISTORICAL_C3_CUSTODY_PINS.readbackSourceSha256
}={}) {
  if(expectedReaderSha256!==HISTORICAL_C3_CUSTODY_PINS.readbackSourceSha256)
    return deny('HISTORICAL_READER_PIN_OVERRIDE_FORBIDDEN');
  if((proofPath===undefined)!==(configPath===undefined))
    return deny('HISTORICAL_PROOF_AND_CONFIG_MUST_BE_PAIRED');
  let sourceBytes;
  try {
    sourceBytes=qualifiedRegularFile(readerPath);
    if(proofPath!==undefined){qualifiedRegularFile(proofPath);qualifiedRegularFile(configPath);}
  } catch(error) {return deny(error.code==='ENOENT'?'SOURCE_NOT_FOUND':error.message);}
  const digest=sha(sourceBytes);
  if(digest!==expectedReaderSha256) return deny('READER_SOURCE_HASH_MISMATCH');
  let actual;
  try {
    const module=await import(pathToFileURL(readerPath).href);
    if(typeof module.inspectExistingLearningLedger!=='function')
      return deny('CANONICAL_READBACK_EXPORT_MISSING');
    actual=module.inspectExistingLearningLedger(proofPath===undefined?{}:{proofPath,configPath});
  } catch {return deny('ORIGINAL_READER_EXECUTION_BLOCKED');}
  // Detect ordinary source changes between the pinned read and the reader invocation.
  // This is a scoped source check, not an operating-system immutable-file guarantee.
  try {
    if(sha(qualifiedRegularFile(readerPath))!==digest)
      return deny('READER_SOURCE_CHANGED_DURING_READBACK');
  } catch{return deny('READER_SOURCE_CHANGED_DURING_READBACK');}
  return qualifyHistoricalCustodyObservation(actual,{readerSha256:digest,expectedReaderSha256});
}
