/*
LEEWAY HEADER — DO NOT REMOVE
WHO: Learning Ledger custodian and GUARD_FAMILY_6_CHRONOS_HISTORIAN.
WHAT: Signed admission with durable restart readback and custody verification.
WHEN: 2026-11-15.
WHERE: src/http-admission-service.mjs.
HOW: Pinned dual signatures, live Receipt GET, request replay reservation and fsync.
WHY: Repair volatile readback and unverified ADMITTED status in the earlier provider.
*/
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
import {randomUUID,createHash,createPublicKey,createPrivateKey,sign,verify} from 'node:crypto';
export const canonical=x=>Array.isArray(x)?`[${x.map(canonical).join(',')}]`:x&&typeof x==='object'?`{${Object.keys(x).sort().map(k=>`${JSON.stringify(k)}:${canonical(x[k])}`).join(',')}}`:JSON.stringify(x);
const hash=x=>createHash('sha256').update(canonical(x)).digest('hex');
const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(body));};
function signed(record,key){const{signature,...body}=record||{};if(typeof signature!=='string'||Buffer.from(signature,'base64').length!==64||!verify(null,Buffer.from(canonical(body)),key,Buffer.from(signature,'base64')))throw Error('LEDGER_SIGNATURE_INVALID');}
function url(value){const u=new URL(value);if(u.username||u.password||u.search||u.hash||!(u.protocol==='https:'||u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)))throw Error('LEDGER_RECEIPT_BINDING_INVALID');return u;}
export function createLedgerAdmissionService({receiptReadbackBaseUrl,storagePath,receiptPublicKeyPem,veritasPublicKeyPem,privateKeyPem,keyId='leeway-ledger-local-ed25519-v1',workerBehavioralImprint,recoverDeadWriter=false}={}){
 const base=url(receiptReadbackBaseUrl),receiptKey=createPublicKey(receiptPublicKeyPem),veritasKey=createPublicKey(veritasPublicKeyPem),privateKey=createPrivateKey(privateKeyPem),publicKey=createPublicKey(privateKey);
 if([receiptKey,veritasKey,privateKey].some(k=>k.asymmetricKeyType!=='ed25519'))throw Error('LEDGER_KEY_TYPE_INVALID');
 if(!path.isAbsolute(storagePath||''))throw Error('LEDGER_ABSOLUTE_STORAGE_REQUIRED');
 if(!workerBehavioralImprint||!['actingWorkerId','assignedStationGuard','sentinelTestPath','imprintedRule'].every(k=>typeof workerBehavioralImprint[k]==='string'&&workerBehavioralImprint[k].trim()&&workerBehavioralImprint[k].length<=512))throw Error('LEDGER_WORKER_IMPRINT_REQUIRED');
 const imprint=structuredClone(workerBehavioralImprint),records=new Map(),requests=new Set(),receiptIds=new Set(),bundles=new Set(),pending=new Set();
 fs.mkdirSync(path.dirname(storagePath),{recursive:true});const lockPath=`${storagePath}.lock`;
 const acquire=()=>{
  try{return fs.openSync(lockPath,'wx',0o600);}catch(e){if(e.code!=='EEXIST'||!recoverDeadWriter)throw e;}
  const recovery=fs.openSync(`${lockPath}.recovery`,'wx',0o600);
  try{
   const owner=Number(fs.readFileSync(lockPath,'utf8'));if(!Number.isSafeInteger(owner)||owner<=0)throw Error('LEDGER_WRITER_LOCK_INVALID');
   try{process.kill(owner,0);throw Error('LEDGER_WRITER_STILL_ACTIVE');}catch(e){if(e.code!=='ESRCH')throw e;}
   fs.renameSync(lockPath,`${lockPath}.retired-${randomUUID()}`);
   return fs.openSync(lockPath,'wx',0o600);
  }finally{fs.closeSync(recovery);fs.unlinkSync(`${lockPath}.recovery`);}
 };
 const lock=acquire();fs.writeFileSync(lock,String(process.pid));fs.fsyncSync(lock);
 let released=false;
 const release=()=>{if(released)return;released=true;fs.closeSync(lock);fs.unlinkSync(lockPath);};
 const acceptRecord=record=>{
  signed(record,publicKey);
  if(record.schema!=='leeway.learning-ledger.admission.v1'||record.state!=='ADMITTED'||!record.requestId||!record.receiptId||!record.workerBehavioralImprint||requests.has(record.requestId)||receiptIds.has(record.receiptId)||bundles.has(record.bundleSha256)||records.has(record.admissionId))throw Error('LEDGER_STORED_RECORD_INVALID');
  records.set(record.admissionId,record);requests.add(record.requestId);receiptIds.add(record.receiptId);bundles.add(record.bundleSha256);
 };
 try{if(fs.existsSync(storagePath)){const content=fs.readFileSync(storagePath,'utf8');if(content&&!content.endsWith('\n'))throw Error('LEDGER_PARTIAL_RECORD');for(const line of content.split('\n').filter(Boolean))acceptRecord(JSON.parse(line));}}
 catch(e){release();throw e;}
 const server=http.createServer(async(req,res)=>{
  if(req.headers.origin)return send(res,403,{error:'LEDGER_BROWSER_DENIED'});
  if(req.method==='GET'&&req.url==='/v1/ledger/public-key')return send(res,200,{keyId,publicKeySpki:publicKey.export({type:'spki',format:'pem'})});
  if(req.method==='GET'&&/^\/v1\/ledger\/ll-[a-f0-9-]{36}$/i.test(req.url)){const record=records.get(req.url.split('/').pop());return record?send(res,200,record):send(res,404,{error:'LEDGER_ADMISSION_NOT_FOUND'});}
  if(req.method!=='POST'||req.url!=='/v1/ledger/admit')return send(res,404,{error:'LEDGER_ROUTE_NOT_FOUND'});
  let reservation;
  try{
   if(!String(req.headers['content-type']).startsWith('application/json'))throw Error('LEDGER_JSON_REQUIRED');
   const chunks=[];let size=0;for await(const b of req){size+=b.length;if(size>262144)throw Error('LEDGER_BODY_TOO_LARGE');chunks.push(b);}
   const{evidenceBundle:bundle,receipt}=JSON.parse(Buffer.concat(chunks));
   const{bundleSha256,...body}=bundle||{};
   if(bundle?.schema!=='leeway.g3-evidence-bundle.v1'||!bundle.requestId||hash(body)!==bundleSha256||receipt?.requestId!==bundle.requestId||receipt?.bundleSha256!==bundleSha256||!/^ra-[a-f0-9-]{36}$/i.test(receipt?.receiptId||''))throw Error('LEDGER_REQUEST_BINDING_INVALID');
   if(requests.has(bundle.requestId)||receiptIds.has(receipt.receiptId)||bundles.has(bundleSha256)||pending.has(bundle.requestId))return send(res,409,{error:'LEDGER_REPLAY_REJECTED'});
   reservation=bundle.requestId;pending.add(reservation);
   const rb=await fetch(new URL(`/v1/receipts/${receipt.receiptId}`,base),{redirect:'error',signal:AbortSignal.timeout(5000)});if(!rb.ok)throw Error('LEDGER_RECEIPT_READBACK_UNAVAILABLE');
   const raw=await rb.text();if(Buffer.byteLength(raw)>524288)throw Error('LEDGER_READBACK_TOO_LARGE');const observed=JSON.parse(raw);
   if(canonical(observed)!==canonical(receipt))throw Error('LEDGER_RECEIPT_READBACK_MISMATCH');
   signed(observed,receiptKey);
   const{signature,receiptHash,...receiptBody}=observed;
   if(observed.schema!=='leeway.receipt-authority.receipt.v1'||hash(receiptBody)!==receiptHash)throw Error('LEDGER_RECEIPT_HASH_INVALID');
   const attestation=observed.veritasAttestation;signed(attestation,veritasKey);
   if(attestation.schema!=='leeway.veritas.attestation.v1'||attestation.verdict!=='PASS'||attestation.requestId!==bundle.requestId||attestation.bundleSha256!==bundleSha256||hash(attestation)!==observed.veritasAttestationSha256)throw Error('LEDGER_VERITAS_BINDING_INVALID');
   const core={schema:'leeway.learning-ledger.admission.v1',admissionId:`ll-${randomUUID()}`,requestId:bundle.requestId,bundleSha256,receiptId:receipt.receiptId,receiptHash,state:'ADMITTED',admittedAt:new Date().toISOString(),keyId,workerBehavioralImprint:imprint};
   const admission={...core,signature:sign(null,Buffer.from(canonical(core)),privateKey).toString('base64')};
   const fd=fs.openSync(storagePath,'a',0o600);try{fs.writeFileSync(fd,JSON.stringify(admission)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
   acceptRecord(admission);return send(res,201,admission);
  }catch(e){return send(res,422,{error:/^[A-Z][A-Z0-9_]+$/.test(e.message)?e.message:'LEDGER_ADMISSION_REJECTED'});}
  finally{if(reservation)pending.delete(reservation);}
 });server.requestTimeout=15000;server.once('close',release);server.once('error',release);return server;
}
