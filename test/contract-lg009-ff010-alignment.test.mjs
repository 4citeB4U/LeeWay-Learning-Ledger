/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING.AUTHORITY.TESTS
TAG: LEEWAY.LEARNING.CONTRACT_LG009_FF010_TEST.V1
DISCOVERY_PIPELINE: Voice → Intent → Location → Vertical → Ranking -> Render
5WH:
WHAT = Verify CONTRACT-LG-009 ordered learning stages and CONTRACT-FF-010 Two-Stage Receipt Ordering alignment before canonical admission.
WHY = Prevent candidate receipts or skipped evaluation from bypassing Veritas and canonical readback checks.
WHO = Creator (The Creator <leonardlee6@outlook.com>) / LeeWay-Learning-Ledger.
WHERE = test/contract-lg009-ff010-alignment.test.mjs
WHEN = 2026-11-12
HOW = Node built-in test runner exercising evaluateLearningTransition negative and positive transitions.
LICENSE: MIT
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLearningTransition, STAGES } from '../src/learning-stage-conformance.mjs';

const hostContext = {
  hostVerified: true,
  issuerTrusted: true,
  grantReference: 'HOST-VERIFIED-GRANT-CONSTITUTION',
  permissions: [
    'LEARN_READ',
    'LEARN_CAPTURE',
    'LEARN_PRACTICE_SANDBOX',
    'LEARN_PRACTICE_LIVE',
    'LEARN_EVALUATE',
    'LEARN_PROPOSE_ADMISSION',
    'LEARN_ADMIT_CANONICAL',
    'LEARN_RELEASE_SKILL',
    'LEARN_REVOKE_OR_CORRECT'
  ]
};

test('CONTRACT-LG-009 enforces sequential stage progression without skipping LG-06/LG-07 Veritas evidence', () => {
  assert.equal(STAGES[0], 'LG-00');
  assert.equal(STAGES[8], 'LG-08');

  // Cannot skip LG-06 teachback or promote unverified candidate to LG-07 without Veritas pre/post + canonical receipt
  const missingVeritasRefs = evaluateLearningTransition(
    {
      parentMissionId: 'MISSION-CONST',
      workId: 'W-CONST-1',
      candidateId: 'CAND-1',
      objective: 'Verify Two-Stage Receipt Order',
      standardsRef: '4citeB4U/LeeWay-Standards@contracts/LEEWAY-SOVEREIGN-COLONY-CONSTITUTION.v1.json',
      stage: 'LG-06',
      actualExecutionVerified: true,
      veritasPreRef: 'VERITAS-PRE-1',
      veritasPostRef: ''
    },
    'LG-07',
    hostContext
  );
  assert.equal(missingVeritasRefs.status, 'BLOCKED');
  assert.equal(missingVeritasRefs.reason, 'LEARNING_EVIDENCE_INCOMPLETE');
});

test('CONTRACT-FF-010 allows Stage 2 LG-08 conformance check only after LG-07 and canonical readback truth', () => {
  const withoutReadback = evaluateLearningTransition(
    {
      parentMissionId: 'MISSION-CONST',
      workId: 'W-CONST-1',
      candidateId: 'CAND-1',
      objective: 'Verify Two-Stage Receipt Order',
      standardsRef: '4citeB4U/LeeWay-Standards@contracts/LEEWAY-SOVEREIGN-COLONY-CONSTITUTION.v1.json',
      stage: 'LG-07'
    },
    'LG-08',
    hostContext
  );
  assert.equal(withoutReadback.status, 'BLOCKED');
  assert.equal(withoutReadback.reason, 'CANONICAL_LEARNING_ADMISSION_NOT_PROVEN');

  const withReadback = evaluateLearningTransition(
    {
      parentMissionId: 'MISSION-CONST',
      workId: 'W-CONST-1',
      candidateId: 'CAND-1',
      objective: 'Verify Two-Stage Receipt Order',
      standardsRef: '4citeB4U/LeeWay-Standards@contracts/LEEWAY-SOVEREIGN-COLONY-CONSTITUTION.v1.json',
      stage: 'LG-07'
    },
    'LG-08',
    {
      ...hostContext,
      canonicalLedgerAuthority: true,
      independentEvidenceVerified: true,
      canonicalReadbackVerified: true
    }
  );
  assert.equal(withReadback.status, 'SOURCE_CONFORMANCE_PASS');
  assert.equal(withReadback.admissionGranted, false);
});
