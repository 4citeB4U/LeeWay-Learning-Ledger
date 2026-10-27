/* LeeWay source test; fictional identifiers and ephemeral keys only; MIT. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {LocalExperienceVault} from '../src/experience-vault.mjs';
import {projectExperience} from '../src/experience-projection.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'leeway-experience-test-'));
const specimen = (eventId, occurredAt = '2026-10-01T11:30:00Z', kind = 'INTERACTION', data = {mode: 'technical'}) => ({
  eventId, kind, occurredAt, timeZone: 'America/Chicago', ownerId: 'fictional-owner', agentId: 'fictional-agent',
  scope: kind === 'INTERACTION' ? 'interaction_cadence' : kind === 'OPERATIONAL_OBSERVATION' ? 'operational' : 'preferences',
  consent: true, data
});
function make() {
  const folder = tmp();
  const filePath = path.join(folder, 'private-events.jsonl');
  const key = randomBytes(32);
  const vault = new LocalExperienceVault({filePath, ownerId: 'fictional-owner', key});
  vault.initialize();
  return {folder, filePath, key, vault};
}

test('encrypted, append/readback, restart and idempotent replay', () => {
  const {folder, filePath, key, vault} = make();
  try {
    const e = specimen('event-1');
    assert.equal(vault.append(e).status, 'CANDIDATE_RECORDED');
    assert.equal(vault.append(e).status, 'ALREADY_RECORDED');
    assert.equal(vault.read().events.length, 1);
    assert.equal(fs.readFileSync(filePath,'utf8').includes('technical'), false);
    const reopened = new LocalExperienceVault({filePath, ownerId: 'fictional-owner', key});
    assert.deepEqual(reopened.read().events, [e]);
    assert.throws(() => reopened.append({...e, data:{mode:'casual'}}), /EVENT_ID_CONFLICT/);
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});

test('tampering, missing key and torn final line fail closed', () => {
  const {folder,filePath,key,vault} = make();
  try {
    vault.append(specimen('event-2'));
    const badKey = new LocalExperienceVault({filePath, ownerId: 'fictional-owner', key: randomBytes(32)});
    assert.throws(() => badKey.read(), /JOURNAL_AUTHENTICATION_FAILED/);
    const clean = fs.readFileSync(filePath,'utf8');
    fs.writeFileSync(filePath, clean.trimEnd());
    assert.throws(() => vault.read(), /INCOMPLETE_JOURNAL_TAIL/);
    fs.writeFileSync(filePath, clean.replace('"sequence":1', '"sequence":9'));
    assert.throws(() => vault.read(), /JOURNAL_CHAIN_INVALID/);
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});

test('candidate scope, consent and payload checks reject unsafe observation', () => {
  const {folder,vault} = make();
  try {
    assert.throws(() => vault.append({...specimen('n1'),consent:false}), /CAPTURE_CONSENT_REQUIRED/);
    assert.throws(() => vault.append({...specimen('n2'),scope:'operational'}), /CANDIDATE_SCOPE_INVALID/);
    assert.throws(() => vault.append({...specimen('n3'),data:{mode:'technical',emotionalState:'fatigued'}}), /INTERACTION_DATA_INVALID/);
    assert.throws(() => vault.append({...specimen('n4'),ownerId:'someone-else'}), /CANDIDATE_IDENTITY_INVALID/);
    assert.equal(vault.read().events.length, 0);
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});

test('an abandoned writer lock is preserved for reconciliation', () => {
  const {folder, filePath, vault} = make();
  try {
    fs.writeFileSync(filePath+'.lock','existing-writer');
    assert.throws(() => vault.append(specimen('locked')), /VAULT_WRITE_LOCKED_RECONCILE_REQUIRED/);
    assert.equal(fs.readFileSync(filePath+'.lock','utf8'),'existing-writer');
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});

test('cadence is a tentative interaction pattern, not a sleep or mood diagnosis', () => {
  const events = [
    specimen('w1', '2026-10-01T11:00:00Z'),
    specimen('w2', '2026-10-02T11:00:00Z'),
    specimen('w3', '2026-10-05T11:00:00Z')
  ];
  const projection = projectExperience(events,{timeZone:'America/Chicago',ownerId:'fictional-owner',personalizationAuthorized:true});
  assert.equal(projection.interactionCadence[0].state,'TENTATIVE_PATTERN');
  assert.equal(projection.interactionCadence[0].distinctDays,3);
  assert.equal(projection.proactiveActionAuthorized,false);
  assert.equal(projection.canonicalLearningAdmitted,false);
  assert.ok(projection.unsupportedInferences.includes('sleep_schedule'));
});

test('explicit preference correction removes active projection without rewriting history', () => {
  const pref = specimen('pref-1','2026-10-01T11:00:00Z','EXPLICIT_PREFERENCE',
    {dimension:'briefing_window',value:'morning',explicit:true});
  const correction = specimen('correction-1','2026-10-02T11:00:00Z','CORRECTION',
    {targetEventId:'pref-1',correction:'This is no longer accurate.'});
  assert.equal(projectExperience([pref],{timeZone:'UTC',ownerId:'fictional-owner',personalizationAuthorized:true}).explicitPreferences.length,1);
  assert.equal(projectExperience([pref,correction],{timeZone:'UTC',ownerId:'fictional-owner',personalizationAuthorized:true}).explicitPreferences.length,0);
});

test('operational candidate never implies Veritas PASS or canonical learning admission', () => {
  const event = specimen('op-1', '2026-10-01T11:00:00Z','OPERATIONAL_OBSERVATION',
    {requestId:'fictional-request', outcome:'FAIL',receiptSha256:null});
  assert.equal(projectExperience([event],{timeZone:'UTC',ownerId:'fictional-owner',personalizationAuthorized:true}).canonicalLearningAdmitted,false);
});


test('disappeared journal and mismatched external head never become a new empty history', () => {
  const {folder,filePath,vault} = make();
  try {
    const {head} = vault.append(specimen('needs-recovery'));
    assert.equal(vault.read({expectedHead:head}).events.length, 1);
    assert.throws(() => vault.read({expectedHead:'f'.repeat(64)}), /VAULT_ANCHOR_MISMATCH/);
    fs.unlinkSync(filePath);
    assert.throws(() => vault.read(), /VAULT_MISSING_RECONCILE_REQUIRED/);
    assert.throws(() => vault.append(specimen('should-not-recreate')), /VAULT_MISSING_RECONCILE_REQUIRED/);
    assert.equal(fs.existsSync(filePath), false);
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});

test('personalization is separate from capture consent, with strict owner isolation', () => {
  const e = specimen('private-1');
  const denied = projectExperience([e], {timeZone:'America/Chicago',ownerId:'fictional-owner'});
  assert.equal(denied.interactionCadence.length, 0);
  assert.equal(denied.personalizationAuthorized, false);
  assert.throws(() => projectExperience([e,{...e,ownerId:'other-owner'}],
    {timeZone:'America/Chicago',ownerId:'fictional-owner',personalizationAuthorized:true}),
    /PROJECTION_OWNER_SCOPE_MISMATCH/);
});

test('privacy revocation suppresses history and re-enable starts a fresh evidence epoch', () => {
  const before = specimen('before-revoke', '2026-10-01T11:00:00Z');
  const optOut = {...specimen('opt-out', '2026-10-02T11:00:00Z','PERSONALIZATION_CONTROL',
    {enabled:false}),scope:'privacy',consent:false};
  const opted = projectExperience([before,optOut],
    {timeZone:'America/Chicago',ownerId:'fictional-owner',personalizationAuthorized:true});
  assert.equal(opted.state, 'PERSONALIZATION_REVOKED');
  assert.equal(opted.interactionCadence.length,0);
  const optIn = {...specimen('opt-in', '2026-10-03T11:00:00Z','PERSONALIZATION_CONTROL',
    {enabled:true}),scope:'privacy',consent:true};
  const fresh = specimen('new-epoch','2026-10-04T11:00:00Z');
  const result = projectExperience([before,optOut,optIn,fresh],
    {timeZone:'America/Chicago',ownerId:'fictional-owner',personalizationAuthorized:true});
  assert.equal(result.interactionCadence.length,1);
  assert.deepEqual(result.interactionCadence[0].sourceEventIds,['new-epoch']);
  assert.equal(result.interactionCadence[0].state,'INSUFFICIENT_EVIDENCE');
  const {folder,vault} = make();
  try { assert.equal(vault.append(optOut).status,'CANDIDATE_RECORDED'); }
  finally {fs.rmSync(folder,{recursive:true,force:true});}
});

test('imperfect experience arcs remain candidate observations even after apparent success', () => {
  const d = {goal:'Carry out a fictional action', environment:'offline test fixture',
    expectation:'Response should match a local contract', observation:'Unexpected result',
    friction:'The provider refused', recovery:null, outcome:'FAILURE',
    lessonHypothesis:'Investigate the provider boundary before retrying',
    evidenceState:'OBSERVED',sourceEventIds:['fictional-evidence-1']};
  const {folder,vault} = make();
  try {
    const arc = {...specimen('arc-1','2026-10-05T11:00:00Z','EXPERIENCE_ARC',d),scope:'experience'};
    assert.equal(vault.append(arc).status,'CANDIDATE_RECORDED');
    const projected=projectExperience(vault.read().events,
      {timeZone:'UTC',ownerId:'fictional-owner',personalizationAuthorized:true});
    assert.equal(projected.experienceArcs[0].state,'CANDIDATE_EXPERIENCE_ONLY');
    assert.equal(projected.experienceArcs[0].canonicalLearningAdmitted,false);
    assert.throws(() => vault.append({...arc,eventId:'arc-forged',
      data:{...d,evidenceState:'VERIFIED'}}),/EXPERIENCE_ARC_INVALID/);
    assert.throws(() => vault.append({...arc,eventId:'arc-no-source',
      data:{...d,sourceEventIds:[]}}),/EXPERIENCE_ARC_INVALID/);
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});

test('corrected interaction evidence is excluded from cadence counts', () => {
  const e=specimen('withdrawn','2026-10-01T11:00:00Z');
  const correction=specimen('correction-cadence','2026-10-02T11:00:00Z','CORRECTION',
    {targetEventId:'withdrawn',correction:'Do not use this sample.'});
  const p=projectExperience([e,correction],
    {timeZone:'America/Chicago',ownerId:'fictional-owner',personalizationAuthorized:true});
  assert.equal(p.interactionCadence.length,0);
});
