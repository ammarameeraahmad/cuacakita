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
  totalQueries: 450,
  totalContributions: 1250,
  acceptedContributions: 1100,
  rejectedContributions: 150,
  activeUsers: 300,
  validationScoreSum: 1062.5,
};

const state = globalThis.__climsightDashboardState ?? { ...defaultState };
globalThis.__climsightDashboardState = state;

export function recordQuery() {
  state.totalQueries += 1;
}

export function recordContribution(accepted: boolean, validationScore: number) {
  state.totalContributions += 1;
  state.validationScoreSum += validationScore;

  if (accepted) {
    state.acceptedContributions += 1;
  } else {
    state.rejectedContributions += 1;
  }
}

export function getDashboardStats() {
  const averageValidationScore = state.validationScoreSum / Math.max(state.totalContributions, 1);

  return {
    totalQueries: state.totalQueries,
    totalContributions: state.totalContributions,
    acceptedContributions: state.acceptedContributions,
    rejectedContributions: state.rejectedContributions,
    activeUsers: state.activeUsers,
    avgValidationScore: Number(averageValidationScore.toFixed(2)),
  };
}
