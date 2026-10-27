/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.LEARNING_LEDGER.EXPERIENCE_PROJECTIONS
TAG: LEEWAY.LEARNING.TENTATIVE_CADENCE_V0
WHAT: Produce bounded, non-authoritative interaction-cadence and explicit-preference projections.
WHY: Useful adaptation should survive imperfect observations without inventing sleep or emotion claims.
WHO: Authorized Agent University / Agent Skills consumers.
WHERE: LeeWay-Learning-Ledger/src/experience-projection.mjs
WHEN: Retrieval after owner-scoped consent; never a self-executing scheduler.
HOW: Deterministic time-window counts, distinct-day support and correction-aware explicit preference view.
AUTHORIZED_ROLES: Read-only candidate projection; no production learning promotion or proactive action.
LICENSE: MIT
*/
const windows = [
  {id: 'early_morning', from: 4, to: 9},
  {id: 'daytime', from: 9, to: 17},
  {id: 'evening', from: 17, to: 21},
  {id: 'late', from: 21, to: 24},
  {id: 'overnight', from: 0, to: 4}
];
function local(event, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23', weekday: 'short'}).formatToParts(new Date(event.occurredAt));
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return {day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), weekend: ['Sat','Sun'].includes(p.weekday)};
}
export function projectExperience(events, {timeZone, minDistinctDays = 3} = {}) {
  if (!Array.isArray(events) || !Number.isInteger(minDistinctDays) || minDistinctDays < 3 ||
      typeof timeZone !== 'string') throw Error('PROJECTION_ARGUMENTS_INVALID');
  try { new Intl.DateTimeFormat('en-US', {timeZone}); } catch { throw Error('PROJECTION_TIMEZONE_INVALID'); }
  const sets = new Map();
  for (const e of events) {
    if (e?.kind !== 'INTERACTION' || e.scope !== 'interaction_cadence' || e.consent !== true) continue;
    const t = local(e, timeZone);
    const w = windows.find(x => t.hour >= x.from && t.hour < x.to);
    const key = (t.weekend ? 'weekend:' : 'weekday:') + w.id;
    if (!sets.has(key)) sets.set(key, {count: 0, days: new Set()});
    const group = sets.get(key);
    group.count += 1;
    group.days.add(t.day);
  }
  const cadence = [...sets].map(([window, data]) => ({
    window, observations: data.count, distinctDays: data.days.size,
    state: data.days.size >= minDistinctDays ? 'TENTATIVE_PATTERN' : 'INSUFFICIENT_EVIDENCE',
    interpretation: 'observed_interaction_activity_only'
  })).sort((a,b) => a.window.localeCompare(b.window));
  const corrected = new Set(events.filter(e => e?.kind === 'CORRECTION').map(e => e.data.targetEventId));
  const preferences = events.filter(e => e?.kind === 'EXPLICIT_PREFERENCE' && !corrected.has(e.eventId))
    .map(e => ({eventId: e.eventId, dimension: e.data.dimension, value: e.data.value,
      state: 'USER_ASSERTED_NOT_INFERRED', occurredAt: e.occurredAt}));
  return {schema: 'leeway.experience.projection.v1', authority: 'NON_AUTHORITATIVE_CANDIDATES',
    timeZone, interactionCadence: cadence, explicitPreferences: preferences,
    unsupportedInferences: ['sleep_schedule', 'wake_time', 'mental_state', 'emotion', 'food_intake_from_chat_absence'],
    proactiveActionAuthorized: false, canonicalLearningAdmitted: false};
}
