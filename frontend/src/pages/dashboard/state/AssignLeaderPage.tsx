import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, ChevronRight, X, Loader2 } from 'lucide-react';
import coordinatorService, {
  SearchedUser,
  NigeriaLocation,
  CAN_ASSIGN,
  AssignDesignationPayload,
} from '../../../services/coordinatorService';
import { mobiliseDashboardService } from '../../../services/mobiliseDashboardService';

interface UserLevelData {
  userLevel: string;
  designation: string;
  role: string;
  assignedLocation: Record<string, string> | null;
  allowedLevels: string[];
}

const AssignLeaderPage: React.FC = () => {
  const navigate = useNavigate();

  // User context
  const [userLevel, setUserLevel] = useState<UserLevelData | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Assignment modal
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [designation, setDesignation] = useState('');
  const [selectedState, setSelectedState] = useState<NigeriaLocation | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<NigeriaLocation | null>(null);
  const [selectedWard, setSelectedWard] = useState<NigeriaLocation | null>(null);

  // Location data
  const [states, setStates] = useState<NigeriaLocation[]>([]);
  const [lgas, setLgas] = useState<NigeriaLocation[]>([]);
  const [wards, setWards] = useState<NigeriaLocation[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLGAs, setLoadingLGAs] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Load user level on mount
  useEffect(() => {
    const loadUserLevel = async () => {
      try {
        const response = await mobiliseDashboardService.getUserLevel();
        setUserLevel(response.data);
      } catch (err) {
        console.error('Failed to load user level:', err);
      }
    };
    loadUserLevel();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Execute search
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const doSearch = async () => {
      try {
        setSearching(true);
        const response = await coordinatorService.searchUsers(debouncedQuery);
        const data = response.data || response;
        setSearchResults(data.users || []);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };
    doSearch();
  }, [debouncedQuery]);

  // Get assignable designations based on current user's level
  const getAssignableDesignations = useCallback((): string[] => {
    if (!userLevel) return [];
    const { designation: userDesignation } = userLevel;
    // Admins can assign all coordinator roles
    if (userLevel.role === 'admin') {
      return ['National Coordinator', 'State Coordinator', 'LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'];
    }
    return CAN_ASSIGN[userDesignation] || [];
  }, [userLevel]);

  // Determine which location fields are needed
  const needsState = designation !== '' && designation !== 'Community Member';
  const needsLGA =
    designation === 'LGA Coordinator' ||
    designation === 'Ward Coordinator' ||
    designation === 'Polling Unit Agent';
  const needsWard =
    designation === 'Ward Coordinator' || designation === 'Polling Unit Agent';

  // Is the current user's state locked (not national/admin)?
  const isStateLocked =
    userLevel !== null &&
    userLevel.designation !== 'National Coordinator' &&
    userLevel.role !== 'admin' &&
    userLevel.userLevel !== 'national';

  const isLGALocked =
    userLevel !== null &&
    (userLevel.designation === 'LGA Coordinator' ||
      userLevel.designation === 'Ward Coordinator');

  // Load states when needed
  useEffect(() => {
    if (!needsState || states.length > 0) return;
    const loadStates = async () => {
      try {
        setLoadingStates(true);
        const data = await coordinatorService.getStates();
        setStates(data);

        // Auto-select locked state
        if (isStateLocked && userLevel?.assignedLocation?.stateName) {
          const match = data.find(
            (s) => s.name.toLowerCase() === userLevel.assignedLocation!.stateName.toLowerCase()
          );
          if (match) setSelectedState(match);
        }
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [needsState, states.length, isStateLocked, userLevel]);

  // Load LGAs when state changes
  useEffect(() => {
    if (!needsLGA || !selectedState) {
      setLgas([]);
      return;
    }
    const loadLGAs = async () => {
      try {
        setLoadingLGAs(true);
        const data = await coordinatorService.getLGAsByState(selectedState.id);
        setLgas(data);

        // Auto-select locked LGA
        if (isLGALocked && userLevel?.assignedLocation?.lgaName) {
          const match = data.find(
            (l) => l.name.toLowerCase() === userLevel.assignedLocation!.lgaName.toLowerCase()
          );
          if (match) setSelectedLGA(match);
        }
      } catch (err) {
        console.error('Failed to load LGAs:', err);
      } finally {
        setLoadingLGAs(false);
      }
    };
    loadLGAs();
  }, [selectedState, needsLGA, isLGALocked, userLevel]);

  // Load wards when LGA changes
  useEffect(() => {
    if (!needsWard || !selectedLGA) {
      setWards([]);
      return;
    }
    const loadWards = async () => {
      try {
        setLoadingWards(true);
        const data = await coordinatorService.getWardsByLGA(selectedLGA.id);
        setWards(data);
      } catch (err) {
        console.error('Failed to load wards:', err);
      } finally {
        setLoadingWards(false);
      }
    };
    loadWards();
  }, [selectedLGA, needsWard]);

  // Can submit?
  const canSubmit = (() => {
    if (!designation || !selectedUser) return false;
    if (needsState && !selectedState) return false;
    if (needsLGA && !selectedLGA) return false;
    if (needsWard && !selectedWard) return false;
    return true;
  })();

  const handleSelectUser = (user: SearchedUser) => {
    setSelectedUser(user);
    setDesignation('');
    setSelectedState(null);
    setSelectedLGA(null);
    setSelectedWard(null);
    setAssignError(null);
    setAssignSuccess(null);
  };

  const handleDesignationChange = (newDesignation: string) => {
    setDesignation(newDesignation);
    setSelectedState(null);
    setSelectedLGA(null);
    setSelectedWard(null);
    setAssignError(null);

    // Re-apply locked locations
    if (isStateLocked && userLevel?.assignedLocation?.stateName && states.length > 0) {
      const match = states.find(
        (s) => s.name.toLowerCase() === userLevel.assignedLocation!.stateName.toLowerCase()
      );
      if (match) setSelectedState(match);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedUser || submitting) return;

    const hasExistingDesignation =
      selectedUser.designation &&
      selectedUser.designation !== 'Community Member' &&
      selectedUser.designation !== '';

    try {
      setSubmitting(true);
      setAssignError(null);

      const payload: AssignDesignationPayload = {
        userId: selectedUser.id,
        designation,
        assignedState: selectedState?.name,
        assignedLGA: selectedLGA?.name,
        assignedWard: selectedWard?.name,
        override: !!hasExistingDesignation,
      };

      await coordinatorService.assignDesignation(payload);

      setAssignSuccess(`${selectedUser.name} has been assigned as ${designation} successfully!`);
      // Reset after success
      setTimeout(() => {
        setSelectedUser(null);
        setSearchQuery('');
        setDebouncedQuery('');
        setSearchResults([]);
        setAssignSuccess(null);
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Assignment failed. Please try again.';
      setAssignError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitial = (name: string): string => (name ? name[0].toUpperCase() : '?');

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard/state')}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Assign Leader</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition-all"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Search hint */}
        {debouncedQuery.length < 2 && !selectedUser && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Search for a user to assign a leadership position
            </p>
          </div>
        )}

        {/* No results */}
        {debouncedQuery.length >= 2 && !searching && searchResults.length === 0 && !selectedUser && (
          <p className="text-center text-sm text-gray-500 py-8">
            No users found for "{debouncedQuery}"
          </p>
        )}

        {/* Search results */}
        {!selectedUser && searchResults.length > 0 && (
          <div className="space-y-2 mb-6">
            {searchResults.map((user) => {
              const hasDes =
                user.designation &&
                user.designation !== 'Community Member' &&
                user.designation !== '';
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500">
                          {getInitial(user.name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email || user.phone || ''}
                      </p>
                      {hasDes && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-medium text-accent-green bg-green-50 rounded">
                          {user.designation}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Assignment Panel */}
        {selectedUser && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Selected user header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-base font-bold text-gray-500">
                      {getInitial(selectedUser.name)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-400">
                    {selectedUser.email || selectedUser.phone || ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {selectedUser.designation &&
                selectedUser.designation !== 'Community Member' &&
                selectedUser.designation !== '' && (
                  <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      Currently assigned as{' '}
                      <span className="font-semibold">{selectedUser.designation}</span>
                      {selectedUser.assignedState && ` in ${selectedUser.assignedState}`}. Assigning a
                      new role will override this.
                    </p>
                  </div>
                )}
            </div>

            {/* Form */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5">
              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Select Role
                </label>
                <select
                  value={designation}
                  onChange={(e) => handleDesignationChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                >
                  <option value="">Choose designation…</option>
                  {getAssignableDesignations().map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* State picker */}
              {needsState && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    State
                  </label>
                  {isStateLocked && userLevel?.assignedLocation?.stateName ? (
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {userLevel.assignedLocation.stateName}
                    </div>
                  ) : loadingStates ? (
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading states…
                    </div>
                  ) : (
                    <select
                      value={selectedState?.id || ''}
                      onChange={(e) => {
                        const state = states.find((s) => s.id === Number(e.target.value));
                        setSelectedState(state || null);
                        setSelectedLGA(null);
                        setSelectedWard(null);
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                    >
                      <option value="">Select state…</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* LGA picker */}
              {needsLGA && selectedState && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    LGA
                  </label>
                  {isLGALocked && userLevel?.assignedLocation?.lgaName ? (
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {userLevel.assignedLocation.lgaName}
                    </div>
                  ) : loadingLGAs ? (
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading LGAs…
                    </div>
                  ) : (
                    <select
                      value={selectedLGA?.id || ''}
                      onChange={(e) => {
                        const lga = lgas.find((l) => l.id === Number(e.target.value));
                        setSelectedLGA(lga || null);
                        setSelectedWard(null);
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                    >
                      <option value="">Select LGA…</option>
                      {lgas.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Ward picker */}
              {needsWard && selectedLGA && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Ward
                  </label>
                  {loadingWards ? (
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading wards…
                    </div>
                  ) : (
                    <select
                      value={selectedWard?.id || ''}
                      onChange={(e) => {
                        const ward = wards.find((w) => w.id === Number(e.target.value));
                        setSelectedWard(ward || null);
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                    >
                      <option value="">Select ward…</option>
                      {wards.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Error */}
              {assignError && (
                <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">{assignError}</p>
                </div>
              )}

              {/* Success */}
              {assignSuccess && (
                <div className="px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700">{assignSuccess}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full py-3 bg-accent-green text-white text-sm font-semibold rounded-xl hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning…
                  </>
                ) : (
                  'Assign'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignLeaderPage;
