/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.EXPERIENTIAL_CANDIDATES
TAG: LEEWAY.LEARNING.EXPERIENCE_VAULT_V0
WHAT: Owner-scoped encrypted candidate-experience journal with strict integrity readback.
WHY: Preserve useful experiential observations without impersonating canonical learning admission.
WHO: Creator-authorized local caller; no autonomous Veritas or permission issuance.
WHERE: LeeWay-Learning-Ledger/src/experience-vault.mjs
WHEN: Explicit user-authorized local capture only.
HOW: AES-256-GCM encrypted events, hash-chained append, fsync, exclusive writer lock, exact replay.
AUTHORIZED_ROLES: Candidate observations; no canonical admission, Veritas, or production grants.
LICENSE: MIT
*/
import fs from 'node:fs';
import path from 'node:path';
import {createCipheriv, createDecipheriv, createHash, randomBytes} from 'node:crypto';

const HASH = /^[0-9a-f]{64}$/;
const IDENTIFIER = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/;
const GENESIS = '0'.repeat(64);
const KIND_TO_SCOPE = Object.freeze({
  INTERACTION: 'interaction_cadence',
  EXPLICIT_PREFERENCE: 'preferences',
  CORRECTION: 'preferences',
  FEEDBACK: 'preferences',
  OPERATIONAL_OBSERVATION: 'operational'
});
const SAFE_PREFERENCE_DIMENSIONS = new Set([
  'briefing_window', 'communication_style', 'activity', 'food', 'movie', 'notification'
]);
const fail = code => { throw new Error(code); };
const sha = x => createHash('sha256').update(x).digest('hex');
const isObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const json = x => JSON.stringify(x);
const validDate = x => typeof x === 'string' && !Number.isNaN(Date.parse(x)) && /(?:Z|[+-]\d\d:\d\d)$/.test(x);
const validZone = zone => {
  if (typeof zone !== 'string' || zone.length > 100) return false;
  try { new Intl.DateTimeFormat('en-US', {timeZone: zone}); return true; } catch { return false; }
};
const exactKeys = (obj, keys) => Object.keys(obj).sort().join('|') === [...keys].sort().join('|');

export function validateCandidate(candidate, ownerId) {
  if (!isObject(candidate) || !exactKeys(candidate,
    ['eventId', 'kind', 'occurredAt', 'timeZone', 'ownerId', 'agentId', 'scope', 'consent', 'data'])) fail('CANDIDATE_SCHEMA_INVALID');
  if (!IDENTIFIER.test(candidate.eventId) || candidate.ownerId !== ownerId || !IDENTIFIER.test(candidate.agentId)) fail('CANDIDATE_IDENTITY_INVALID');
  if (!(candidate.kind in KIND_TO_SCOPE) || candidate.scope !== KIND_TO_SCOPE[candidate.kind]) fail('CANDIDATE_SCOPE_INVALID');
  if (!validDate(candidate.occurredAt) || !validZone(candidate.timeZone)) fail('CANDIDATE_TIME_INVALID');
  if (candidate.consent !== true) fail('CAPTURE_CONSENT_REQUIRED');
  const d = candidate.data;
  if (!isObject(d)) fail('CANDIDATE_DATA_INVALID');
  if (candidate.kind === 'INTERACTION') {
    if (!exactKeys(d, ['mode']) || !['technical', 'casual', 'unspecified'].includes(d.mode)) fail('INTERACTION_DATA_INVALID');
  } else if (candidate.kind === 'EXPLICIT_PREFERENCE') {
    if (!exactKeys(d, ['dimension', 'value', 'explicit']) || !SAFE_PREFERENCE_DIMENSIONS.has(d.dimension) ||
      typeof d.value !== 'string' || d.value.length < 1 || d.value.length > 180 || d.explicit !== true) fail('PREFERENCE_DATA_INVALID');
  } else if (candidate.kind === 'CORRECTION') {
    if (!exactKeys(d, ['targetEventId', 'correction']) || !IDENTIFIER.test(d.targetEventId) ||
      typeof d.correction !== 'string' || d.correction.length < 1 || d.correction.length > 250) fail('CORRECTION_DATA_INVALID');
  } else if (candidate.kind === 'FEEDBACK') {
    if (!exactKeys(d, ['targetEventId', 'usefulness']) || !IDENTIFIER.test(d.targetEventId) ||
      !['helpful', 'not_helpful', 'neutral'].includes(d.usefulness)) fail('FEEDBACK_DATA_INVALID');
  } else if (candidate.kind === 'OPERATIONAL_OBSERVATION') {
    if (!exactKeys(d, ['requestId', 'outcome', 'receiptSha256']) || !IDENTIFIER.test(d.requestId) ||
      !['PASS', 'FAIL', 'BLOCKED', 'UNVERIFIED'].includes(d.outcome) ||
      !(d.receiptSha256 === null || HASH.test(d.receiptSha256))) fail('OPERATIONAL_DATA_INVALID');
  }
  return true;
}

function seal(candidate, key, sequence, previousHash) {
  const iv = randomBytes(12);
  const aad = Buffer.from(json({schema: 'leeway.experience.encrypted.v1', sequence, previousHash}), 'utf8');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(json(candidate), 'utf8'), cipher.final()]);
  const body = {schema: 'leeway.experience.encrypted.v1', sequence, previousHash,
    nonce: iv.toString('base64'), ciphertext: ciphertext.toString('base64'), tag: cipher.getAuthTag().toString('base64')};
  return {...body, recordHash: sha(json(body))};
}
function unseal(entry, key) {
  const {sequence, previousHash, nonce, ciphertext, tag} = entry;
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'base64'));
  decipher.setAAD(Buffer.from(json({schema: entry.schema, sequence, previousHash}), 'utf8'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8'));
}
function decodeChain(raw, key, ownerId) {
  if (!raw.length) return {events: [], head: GENESIS};
  if (!raw.endsWith('\n')) fail('INCOMPLETE_JOURNAL_TAIL');
  const events = [];
  let head = GENESIS;
  const ids = new Set();
  for (const [index, line] of raw.trimEnd().split('\n').entries()) {
    let entry;
    try { entry = JSON.parse(line); } catch { fail('JOURNAL_JSON_INVALID'); }
    if (!isObject(entry) || !exactKeys(entry,
      ['schema', 'sequence', 'previousHash', 'nonce', 'ciphertext', 'tag', 'recordHash']) ||
       entry.schema !== 'leeway.experience.encrypted.v1' || entry.sequence !== index + 1 ||
       entry.previousHash !== head || !HASH.test(entry.recordHash)) fail('JOURNAL_CHAIN_INVALID');
    const {recordHash, ...body} = entry;
    if (sha(json(body)) !== recordHash) fail('JOURNAL_HASH_INVALID');
    let event;
    try { event = unseal(entry, key); } catch { fail('JOURNAL_AUTHENTICATION_FAILED'); }
    validateCandidate(event, ownerId);
    if (ids.has(event.eventId)) fail('DUPLICATE_JOURNAL_EVENT');
    ids.add(event.eventId);
    events.push(event);
    head = recordHash;
  }
  return {events, head};
}

/** Local candidate storage only. NOT a canonical Learning Ledger writer or verifier. */
export class LocalExperienceVault {
  constructor({filePath, ownerId, key}) {
    if (typeof filePath !== 'string' || !path.isAbsolute(filePath)) fail('ABSOLUTE_VAULT_PATH_REQUIRED');
    if (!IDENTIFIER.test(ownerId) || !Buffer.isBuffer(key) || key.length !== 32) fail('OWNER_KEY_REQUIRED');
    this.filePath = filePath;
    this.ownerId = ownerId;
    this.key = Buffer.from(key);
  }
  read() {
    try {
      const stat = fs.lstatSync(this.filePath);
      if (!stat.isFile() || stat.isSymbolicLink()) fail('VAULT_SOURCE_INVALID');
      return decodeChain(fs.readFileSync(this.filePath, 'utf8'), this.key, this.ownerId);
    } catch (error) {
      if (error.code === 'ENOENT') return {events: [], head: GENESIS};
      throw error;
    }
  }
  append(candidate) {
    validateCandidate(candidate, this.ownerId);
    fs.mkdirSync(path.dirname(this.filePath), {recursive: true, mode: 0o700});
    const lockPath = this.filePath + '.lock';
    let lock;
    try { lock = fs.openSync(lockPath, 'wx', 0o600); }
    catch { fail('VAULT_WRITE_LOCKED_RECONCILE_REQUIRED'); }
    try {
      const state = this.read();
      const existing = state.events.find(x => x.eventId === candidate.eventId);
      if (existing) {
        if (json(existing) !== json(candidate)) fail('EVENT_ID_CONFLICT');
        return {status: 'ALREADY_RECORDED', recordCount: state.events.length, head: state.head};
      }
      const envelope = seal(candidate, this.key, state.events.length + 1, state.head);
      const fd = fs.openSync(this.filePath, 'a', 0o600);
      try { fs.writeSync(fd, json(envelope) + '\n'); fs.fsyncSync(fd); }
      finally { fs.closeSync(fd); }
      const again = this.read();
      if (again.events.length !== state.events.length + 1 || again.head !== envelope.recordHash) fail('VAULT_POSTWRITE_MISMATCH');
      return {status: 'CANDIDATE_RECORDED', recordCount: again.events.length, head: again.head};
    } finally {
      fs.closeSync(lock);
      fs.unlinkSync(lockPath);
    }
  }
}
