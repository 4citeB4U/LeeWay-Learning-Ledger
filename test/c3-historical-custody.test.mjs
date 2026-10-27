/* Source-only historical custody unit tests; fictional proof and test-only observation; MIT. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {HISTORICAL_C3_CUSTODY_PINS as P, qualifyHistoricalCustodyObservation as q,
  inspectPinnedHistoricalC3Custody as inspect} from '../src/c3-historical-custody.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const reader=sha(Buffer.from('fictional-reader-fixture'));
const fixture=()=>({
  status:'PASS_SCOPED_EXISTING_HOST_READ',capability:'learning.ledger.readback',
  scope:P.historicalScope,unchangedHistoricPrefixVerified:true,
  historicalAnchor:{verified:true,anchoring:'SHA256_EXACT_BYTE_PREFIX',
    historicalEntries:133,currentEntries:134,appendedEntries:1,
    appendedJsonSyntaxValid:true,postAnchorEventsIndependentlyAuthenticated:false},
  historicRecordCount:133,currentRecordCount:134,laterAppendCount:1,
  writerSha256:'a'.repeat(64),currentLedgerSha256:'b'.repeat(64),
  ledgerSha256:P.historicalLedgerSha256,receiptProofSha256:P.originalEventProofSha256,
  productionWritePerformed:false,gpuAdmissionAuthorized:false,
  independentProductionCertificate:false
});

test('source-only fixture stays TEST_ONLY, never becomes production Veritas admission',()=>{
  const r=q(fixture(),{readerSha256:reader,expectedReaderSha256:reader,testOnly:true});
  assert.equal(r.status,'TEST_FIXTURE_ONLY');
  assert.equal(r.canonicalLearningAdmitted,false);
  assert.equal(r.productionAdmissionAuthorized,false);
  assert.equal(r.appendedRecordsIndependentlyAuthenticated,false);
  assert.equal(r.appendCount,1);
});
test('source pin cannot be silently substituted for historical qualification',()=>{
  assert.equal(q(fixture(),{readerSha256:reader,expectedReaderSha256:reader}).status,'BLOCKED');
  assert.equal(q(fixture(),{readerSha256:'f'.repeat(64),expectedReaderSha256:reader,testOnly:true}).status,'BLOCKED');
});
test('historical readback rejects candidate PASS, forged proof, wrong scope and unsupported fresh append certification',()=>{
  for(const changed of [
    {status:'PASS'},
    {scope:'ANOTHER_HOST'},
    {receiptProofSha256:'f'.repeat(64)},
    {historicalAnchor:{...fixture().historicalAnchor,postAnchorEventsIndependentlyAuthenticated:true}},
    {laterAppendCount:0},
    {canonicalLearningAdmitted:true},
  ]){
    const f={...fixture(),...changed};
    if('canonicalLearningAdmitted' in changed) {
      // A forged promotion flag must never confer permission, even with a valid readback.
      const out=q(f,{readerSha256:reader,expectedReaderSha256:reader,testOnly:true});
      assert.equal(out.canonicalLearningAdmitted,false);
    } else assert.equal(q(f,{readerSha256:reader,expectedReaderSha256:reader,testOnly:true}).status,'BLOCKED');
  }
});
test('absolute reader source path is required; missing and substituted modules fail before import',async()=>{
  assert.equal((await inspect({readerPath:'relative/readback.mjs'})).status,'BLOCKED');
  assert.equal((await inspect({readerPath:path.join(os.tmpdir(),'nonexistent-leeway-reader-987') })).status,'BLOCKED');
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'leeway-c3-readonly-'));
  try{
    const source=path.join(directory,'reader.mjs');
    fs.writeFileSync(source,'export function inspectExistingLearningLedger(){ return {status:"PASS"} }');
    const before=fs.readFileSync(source);
    const r=await inspect({readerPath:source});
    assert.equal(r.reason,'READER_SOURCE_HASH_MISMATCH');
    assert.deepEqual(fs.readFileSync(source),before);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('symlink readback source and partial proof/config binding are rejected',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'leeway-c3-symlink-'));
  try{
    const original=path.join(directory,'real.mjs'),link=path.join(directory,'link.mjs');
    fs.writeFileSync(original,'export const test=true;');
    fs.symlinkSync(original,link);
    assert.equal((await inspect({readerPath:link})).reason,'READER_SOURCE_NOT_REGULAR_FILE');
    assert.equal((await inspect({readerPath:original,proofPath:original})).reason,'HISTORICAL_PROOF_AND_CONFIG_MUST_BE_PAIRED');
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
