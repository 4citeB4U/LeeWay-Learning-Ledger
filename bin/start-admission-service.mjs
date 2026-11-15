/* WHO: Ledger operator. WHAT: Configured service launcher. WHEN: 2026-11-15. WHERE: bin. HOW: Host-held key files and storage bindings. WHY: Repeatable startup and clean shutdown. */
import fs from 'node:fs';import {createLedgerAdmissionService} from '../src/http-admission-service.mjs';
const read=name=>fs.readFileSync(process.env[name],'utf8');
const server=createLedgerAdmissionService({storagePath:process.env.LEEWAY_LEDGER_STORAGE_PATH,receiptReadbackBaseUrl:process.env.LEEWAY_RECEIPT_BASE_URL,receiptPublicKeyPem:read('LEEWAY_RECEIPT_PUBLIC_KEY_PATH'),veritasPublicKeyPem:read('LEEWAY_VERITAS_PUBLIC_KEY_PATH'),privateKeyPem:read('LEEWAY_LEDGER_PRIVATE_KEY_PATH'),workerBehavioralImprint:JSON.parse(process.env.LEEWAY_WORKER_BEHAVIORAL_IMPRINT_JSON||'null'),recoverDeadWriter:process.env.LEEWAY_LEDGER_RECOVER_DEAD_WRITER==='1'});
server.listen(Number(process.env.LEEWAY_LEDGER_PORT||4305),'127.0.0.1',()=>console.log(JSON.stringify({status:'LEEWAY_LEDGER_READY',port:server.address().port})));
const shutdown=()=>server.close(()=>process.exit(0));for(const signal of ['SIGINT','SIGTERM'])process.once(signal,shutdown);process.once('message',message=>{if(message==='shutdown')shutdown();});
