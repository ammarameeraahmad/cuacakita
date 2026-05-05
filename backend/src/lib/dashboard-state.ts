import { getFirebaseDb } from './firebase.js';

type DashboardState = {
  totalQueries: number;
  totalContributions: number;
  acceptedContributions: number;
  rejectedContributions: number;
  activeUsers: number;
  validationScoreSum: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __climsightDashboardState: DashboardState | undefined;
}

const defaultState: DashboardState = {
  totalQueries: 0,
  totalContributions: 0,
  acceptedContributions: 0,
  rejectedContributions: 0,
  activeUsers: 0,
  validationScoreSum: 0,
};

const state = globalThis.__climsightDashboardState ?? { ...defaultState };
globalThis.__climsightDashboardState = state;

function coerceState(value: Partial<DashboardState> | null | undefined): DashboardState {
  return {
    ...defaultState,
    ...(value || {}),
  };
}

async function updateStats(mutator: (draft: DashboardState) => void) {
  const db = getFirebaseDb();
  if (!db) {
    mutator(state);
    return state;
  }

  const ref = db.ref('stats/global');
  const result = await ref.transaction((current) => {
    const next = coerceState(current as DashboardState | null | undefined);
    mutator(next);
    return next;
  });

  return coerceState(result.snapshot?.val() as DashboardState | null | undefined);
}

export async function recordQuery() {
  await updateStats((draft) => {
    draft.totalQueries += 1;
  });
}

export async function recordContribution(accepted: boolean, validationScore: number) {
  await updateStats((draft) => {
    draft.totalContributions += 1;
    draft.validationScoreSum += validationScore;

    if (accepted) {
      draft.acceptedContributions += 1;
    } else {
      draft.rejectedContributions += 1;
    }
  });
}

export async function getDashboardStats() {
  const db = getFirebaseDb();
  let currentState = state;

  if (db) {
    const snapshot = await db.ref('stats/global').get();
    currentState = coerceState(snapshot.val() as DashboardState | null | undefined);
    if (!snapshot.exists()) {
      await db.ref('stats/global').set(currentState);
    }
  }

  const averageValidationScore = currentState.validationScoreSum / Math.max(currentState.totalContributions, 1);

  return {
    totalQueries: currentState.totalQueries,
    totalContributions: currentState.totalContributions,
    acceptedContributions: currentState.acceptedContributions,
    rejectedContributions: currentState.rejectedContributions,
    activeUsers: currentState.activeUsers,
    avgValidationScore: Number(averageValidationScore.toFixed(2)),
  };
}
