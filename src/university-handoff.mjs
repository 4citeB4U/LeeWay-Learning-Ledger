/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.UNIVERSITY_HANDOFF
TAG: LEEWAY.LEARNING.OWNER_SCOPED_CANDIDATE_CONTEXT_V0
WHAT: Expose verified-local-journal candidate context to an authorized University or agent consumer.
WHY: Context must retain owner isolation and external replay anchors without pretending to be canonical learning.
WHO: Creator-authorized private caller; LeeWay Memory Harness authorizes retrieval externally.
WHERE: LeeWay-Learning-Ledger/src/university-handoff.mjs
WHEN: Private, on-demand contextual retrieval only.
HOW: Explicit authorization adapter, original vault readback, bounded projection, fail-closed response.
AUTHORIZED_ROLES: Read-only candidate context; no scheduling, sharing, new permissions, or production admission.
LICENSE: MIT
*/
import {LocalExperienceVault} from './experience-vault.mjs';
import {projectExperience} from './experience-projection.mjs';

const HASH = /^[0-9a-f]{64}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;
const deny = reason => ({status: 'BLOCKED', reason, context: null,
  proactiveActionAuthorized: false, canonicalLearningAdmitted: false});

/**
 * This is a SOURCE-ONLY handoff. Caller-supplied authorization is not a Veritas
 * signature or production identity proof. The provider must be qualified by
 * existing LeeWay security and Memory Harness before any live deployment.
 */
export async function prepareUniversityCandidateContext({
  vault, expectedHead, consumerId, timeZone, authorizeRead,
  personalizationAuthorized = false, maxEntries = 12
} = {}) {
  if (!(vault instanceof LocalExperienceVault) || !HASH.test(expectedHead ?? '') ||
      !ID.test(consumerId ?? '') || typeof timeZone !== 'string' ||
      !Number.isInteger(maxEntries) || maxEntries < 1 || maxEntries > 50)
    return deny('HANDOFF_ARGUMENTS_INVALID');
  if (personalizationAuthorized !== true) return deny('PERSONALIZATION_NOT_AUTHORIZED');
  if (typeof authorizeRead !== 'function') return deny('AUTHORIZATION_ADAPTER_UNBOUND');
  let authorized = false;
  try {
    authorized = (await authorizeRead({
      ownerId: vault.ownerId, consumerId, capability: 'experience.candidate.read',
      scope: 'PRIVATE_OWNER_ONLY'
    })) === true;
  } catch { return deny('AUTHORIZATION_ADAPTER_FAILED'); }
  if (!authorized) return deny('OWNER_ACCESS_DENIED');
  let readback, view;
  try {
    readback = vault.read({expectedHead});
    view = projectExperience(readback.events, {ownerId: vault.ownerId,
      timeZone, personalizationAuthorized: true});
  } catch { return deny('JOURNAL_OR_PROJECTION_UNVERIFIED'); }
  if (view.personalizationAuthorized !== true)
    return deny('PERSONALIZATION_REVOKED');
  const bounded = values => values.slice(0, maxEntries);
  const all = {
    interactionCadence: view.interactionCadence,
    explicitPreferences: view.explicitPreferences,
    experienceArcs: view.experienceArcs
  };
  return {status: 'CANDIDATE_CONTEXT_ONLY', consumerId, ownerId: vault.ownerId,
    scope: 'PRIVATE_OWNER_ONLY', authority: 'NON_AUTHORITATIVE_CANDIDATES',
    source: {kind: 'LOCAL_ENCRYPTED_JOURNAL_READBACK', head: readback.head,
      eventCount: readback.events.length},
    context: {
      timeZone, interactionCadence: bounded(all.interactionCadence),
      explicitPreferences: bounded(all.explicitPreferences),
      experienceArcs: bounded(all.experienceArcs),
      truncated: Object.fromEntries(Object.entries(all)
        .map(([kind, entries]) => [kind, entries.length > maxEntries])),
      unsupportedInferences: view.unsupportedInferences
    },
    proactiveActionAuthorized: false, canonicalLearningAdmitted: false,
    sharedAcrossOwners: false};
}
