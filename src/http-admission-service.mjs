/* LEEWAY HEADER — WHO=Learning Ledger; WHAT=G4 admission/readback HTTP provider; WHEN=2026-11-15; WHERE=src/http-admission-service.mjs; HOW=live Receipt readback and durable JSONL; WHY=admit only custody-confirmed evidence. */
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { randomUUID } from 'node:crypto';
const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(body));};
export function createLedgerAdmissionService({receiptReadbackBaseUrl, storagePath}={}) {
 if(typeof receiptReadbackBaseUrl!=='string'||typeof storagePath!=='string') throw new Error('LEDGER_PROVIDER_CONFIGURATION_REQUIRED');
 const records=new Map(); fs.mkdirSync(path.dirname(storagePath),{recursive:true});
 return http.createServer(async(req,res)=>{
  if(req.method==='POST'&&req.url==='/v1/ledger/admit') try {
   const chunks=[];for await(const c of req)chunks.push(c);const {evidenceBundle,receipt}=JSON.parse(Buffer.concat(chunks).toString());
   const rb=await fetch(`${receiptReadbackBaseUrl.replace(/\/$/,'')}/v1/receipts/${encodeURIComponent(receipt.receiptId)}`);if(!rb.ok) return send(res,422,{error:'LEDGER_RECEIPT_READBACK_UNAVAILABLE'});const observed=await rb.json();
   if(observed.receiptHash!==receipt.receiptHash||observed.bundleSha256!==evidenceBundle.bundleSha256) return send(res,422,{error:'LEDGER_RECEIPT_READBACK_MISMATCH'});
   const admission={schema:'leeway.learning-ledger.admission.v1',admissionId:`ll-${randomUUID()}`,state:'ADMITTED',bundleSha256:evidenceBundle.bundleSha256,receiptHash:receipt.receiptHash,admittedAt:new Date().toISOString()}; records.set(admission.admissionId,admission);fs.appendFileSync(storagePath,JSON.stringify(admission)+'\n');return send(res,201,admission);
  } catch(error){return send(res,422,{error:error.message});}
  if(req.method==='GET'&&req.url.startsWith('/v1/ledger/')){const record=records.get(req.url.split('/').pop());return record?send(res,200,record):send(res,404,{error:'LEDGER_ADMISSION_NOT_FOUND'});}
  return send(res,404,{error:'LEDGER_ROUTE_NOT_FOUND'});
 });
}
