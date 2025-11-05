const ELIGIBLE_DESIGNATIONS = new Map([
  ['National Coordinator', 'national'],
  ['State Coordinator', 'state'],
  ['LGA Coordinator', 'lga'],
  ['Ward Coordinator', 'ward'],
  ['Polling Unit Agent', 'polling_unit'],
  ['Vote Defender', 'polling_unit'],
]);

class MonitoringScopeError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'MonitoringScopeError';
    this.code = options.code || 'MONITORING_SCOPE_ERROR';
    this.httpStatus = options.httpStatus || 400;
  }
}

const normalizeField = (value) => {
  if (typeof value !== 'string') {
    return { raw: null, normalized: null };
  }
  const raw = value.trim();
  if (!raw) {
    return { raw: null, normalized: null };
  }
  return {
    raw,
    normalized: raw.replace(/\s+/g, ' ').toUpperCase(),
  };
};

export const deriveMonitoringScopeFromUser = (user) => {
  if (!user) {
    throw new MonitoringScopeError('User data is required to derive monitoring scope');
  }

  const designation = (user.designation || '').trim();
  if (!ELIGIBLE_DESIGNATIONS.has(designation)) {
    throw new MonitoringScopeError('User designation is not eligible for monitoring access', {
      code: 'INELIGIBLE_DESIGNATION',
    });
  }

  const level = ELIGIBLE_DESIGNATIONS.get(designation);

  const stateField = normalizeField(user.votingState || user.assignedState);
  const lgaField = normalizeField(user.votingLGA || user.assignedLGA);
  const wardField = normalizeField(user.votingWard || user.assignedWard);
  // Check pollingUnitCode first (the delimitation), then fall back to votingPU (name)
  const puCodeField = normalizeField(user.pollingUnitCode || user.polling_unit_code);
  const puNameField = normalizeField(user.votingPU || user.pollingUnit || user.polling_unit);

  const scope = {
    level,
    designation,
    state: stateField.normalized,
    stateLabel: stateField.raw,
    lga: null,
    lgaLabel: null,
    ward: null,
    wardLabel: null,
    pollingUnit: null,
    pollingUnitLabel: null,
    source: 'profile',
  };

  const missingFields = [];

  if (level === 'national') {
    return scope;
  }

  if (!stateField.normalized) {
    missingFields.push('state');
  }

  scope.state = stateField.normalized;
  scope.stateLabel = stateField.raw;

  if (['lga', 'ward', 'polling_unit'].includes(level)) {
    if (!lgaField.normalized) {
      missingFields.push('lga');
    } else {
      scope.lga = lgaField.normalized;
      scope.lgaLabel = lgaField.raw;
    }
  }

  if (['ward', 'polling_unit'].includes(level)) {
    if (!wardField.normalized) {
      missingFields.push('ward');
    } else {
      scope.ward = wardField.normalized;
      scope.wardLabel = wardField.raw;
    }
  }

  if (level === 'polling_unit') {
    if (!puCodeField.normalized && !puNameField.normalized) {
      missingFields.push('polling unit');
    } else {
      // Use code for pollingUnit (delimitation), use name for label
      scope.pollingUnit = puCodeField.normalized || puNameField.normalized;
      scope.pollingUnitLabel = puNameField.raw || puCodeField.raw;
    }
  }

  if (missingFields.length > 0) {
    throw new MonitoringScopeError(
      `Missing required location data for ${designation}: ${missingFields.join(', ')}`,
      { code: 'MISSING_SCOPE_DATA' }
    );
  }

  return scope;
};

export const parseMonitoringScope = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  return null;
};

export const stringifyMonitoringScope = (scope) => {
  if (!scope) {
    return null;
  }

  try {
    return JSON.stringify(scope);
  } catch (error) {
    return null;
  }
};

export const buildElectionFilterClause = (scope, startIndex = 1) => {
  if (!scope || scope.level === 'national') {
    return { clause: '', params: [] };
  }

  const conditions = [];
  const params = [];
  let index = startIndex;

  if (scope.state) {
    conditions.push(`UPPER(e.state) = UPPER($${index})`);
    params.push(scope.stateLabel || scope.state);
    index += 1;
  }

  if (scope.lga) {
    conditions.push(`UPPER(COALESCE(e.lga, '')) = UPPER($${index})`);
    params.push(scope.lgaLabel || scope.lga);
    index += 1;
  }

  return {
    clause: conditions.length ? ` AND ${conditions.join(' AND ')}` : '',
    params,
  };
};

export const createScopePuSummary = (scope) => {
  if (!scope) {
    return null;
  }

  return {
    submission_id: null,
    election_id: null,
    pu_code: scope.pollingUnit || null,
    pu_name: scope.pollingUnitLabel || scope.pollingUnit || null,
    ward: scope.wardLabel || scope.ward || null,
    lga: scope.lgaLabel || scope.lga || null,
    state: scope.stateLabel || scope.state || null,
    created_at: new Date().toISOString(),
    scope_level: scope.level,
    source: scope.source,
  };
};

export { MonitoringScopeError };
