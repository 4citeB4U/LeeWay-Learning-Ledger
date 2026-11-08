/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.C3.CUSTODY_CLI
TAG: LEEWAY.LEARNING.C3.READ_ONLY_CUSTODY_COMMAND
WHAT: Read-only owner-host preflight; prints bounded custody metadata only.
WHY: Avoid new writers, synthetic passes, or source path assumptions.
WHO: Creator-authorized engineering.
WHERE: scripts/c3-custody-preflight.mjs.
WHEN: Manual C3 custody gate; no automatic deployment.
HOW: Invoke existing SHA-pinned Runtime Fabric readback adapter.
LICENSE: MIT
*/
import {inspectPinnedHistoricalC3Custody} from '../src/c3-historical-custody.mjs';

const args=process.argv.slice(2);
const parsed={};
let invalid=false;
for(let i=0;i<args.length;i+=2){
  const key=args[i],value=args[i+1];
  if(!['--reader','--proof','--config'].includes(key)||typeof value!=='string'||
     value.startsWith('--')||Object.hasOwn(parsed,key)) {invalid=true;break;}
  parsed[key]=value;
}
if(args.length%2!==0||!parsed['--reader'])invalid=true;
const outcome=invalid
  ?{status:'BLOCKED',reason:'USAGE_NODE_SCRIPTS_C3_CUSTODY_PREFLIGHT_READER_ABSOLUTE_PATH_OPTIONAL_PROOF_AND_CONFIG',
    mutationPerformed:false,canonicalLearningAdmitted:false,productionAdmissionAuthorized:false}
  :await inspectPinnedHistoricalC3Custody({
    readerPath:parsed['--reader'],proofPath:parsed['--proof'],configPath:parsed['--config']
  });
process.stdout.write(JSON.stringify(outcome,null,2)+'\n');
if(outcome.status!=='SCOPED_HISTORICAL_CUSTODY_OBSERVED')process.exitCode=1;
