/* LeeWay candidate handoff tests: fictional owner, ephemeral key, source-only; MIT. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {LocalExperienceVault} from '../src/experience-vault.mjs';
import {prepareUniversityCandidateContext} from '../src/university-handoff.mjs';

const event = (eventId, kind='INTERACTION', data={mode:'technical'}, consent=true) => ({
  eventId, kind, data, consent, occurredAt: '2026-10-03T12:00:00Z',
  timeZone: 'America/Chicago', ownerId:'fictional-owner', agentId:'fictional-agent',
  scope: kind==='INTERACTION'?'interaction_cadence':kind==='PERSONALIZATION_CONTROL'?'privacy':'preferences'
});
function setup() {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'leeway-handoff-'));
  const vault=new LocalExperienceVault({filePath:path.join(dir,'vault.jsonl'),
    ownerId:'fictional-owner',key:randomBytes(32)});
  vault.initialize();
  return {dir,vault};
}
const common=(vault,expectedHead)=>({vault,expectedHead,consumerId:'agent-university',
  timeZone:'America/Chicago',personalizationAuthorized:true,
  authorizeRead:async ({ownerId,consumerId,capability}) =>
    ownerId==='fictional-owner' && consumerId==='agent-university' &&
    capability==='experience.candidate.read'
});

test('unbound permission and personalization denial never reveal candidate data',async()=>{
  const {dir,vault}=setup();
  try {
    const {head}=vault.append(event('event-1'));
    let r=await prepareUniversityCandidateContext({...common(vault,head),
      authorizeRead:undefined});
    assert.equal(r.status,'BLOCKED');
    assert.equal(r.context,null);
    r=await prepareUniversityCandidateContext({...common(vault,head),
      personalizationAuthorized:false});
    assert.equal(r.reason,'PERSONALIZATION_NOT_AUTHORIZED');
    r=await prepareUniversityCandidateContext({...common(vault,head),
      authorizeRead:async()=>false});
    assert.equal(r.reason,'OWNER_ACCESS_DENIED');
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('exact anchored readback supplies only owner-scoped candidate context',async()=>{
  const {dir,vault}=setup();
  try {
    const {head}=vault.append(event('event-1'));
    const r=await prepareUniversityCandidateContext(common(vault,head));
    assert.equal(r.status,'CANDIDATE_CONTEXT_ONLY');
    assert.equal(r.context.interactionCadence[0].sourceEventIds[0],'event-1');
    assert.equal(r.source.head,head);
    assert.equal(r.canonicalLearningAdmitted,false);
    assert.equal(r.sharedAcrossOwners,false);
    assert.equal(r.proactiveActionAuthorized,false);
    const invalid=await prepareUniversityCandidateContext(common(vault,'f'.repeat(64)));
    assert.equal(invalid.status,'BLOCKED');
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('private permission revocation suppresses all University/Skills projections',async()=>{
  const {dir,vault}=setup();
  try {
    vault.append(event('interaction-1'));
    const {head}=vault.append(event('opt-out','PERSONALIZATION_CONTROL',{enabled:false},false));
    const r=await prepareUniversityCandidateContext(common(vault,head));
    assert.equal(r.reason,'PERSONALIZATION_REVOKED');
    assert.equal(r.context,null);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
