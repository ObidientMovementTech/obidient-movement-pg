import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, UserMinus, Users, RefreshCw, Search, ChevronDown, ChevronRight, Pen, Loader2 } from 'lucide-react';
import coordinatorService, { SearchedUser, CAN_ASSIGN, NigeriaLocation } from '../../../services/coordinatorService';
import { mobiliseDashboardService } from '../../../services/mobiliseDashboardService';

// Ordered from highest to lowest rank
const DESIGNATION_OPTIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
  'Polling Unit Agent',
  'Vote Defender',
];

interface GroupedMembers {
  key: string;
  label: string;
  members: SearchedUser[];
}

const MyTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subordinates, setSubordinates] = useState<SearchedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<SearchedUser | null>(null);

  // Filters
  const [activeDesignation, setActiveDesignation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // User level (for smart grouping)
  const [userLevel, setUserLevel] = useState<string>('');
  const [userDesignation, setUserDesignation] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  // Edit designation modal
  const [editUser, setEditUser] = useState<SearchedUser | null>(null);
  const [editDesignation, setEditDesignation] = useState('');
  const [editState, setEditState] = useState<string>('');
  const [editLGA, setEditLGA] = useState<string>('');
  const [editWard, setEditWard] = useState<string>('');
  const [editStates, setEditStates] = useState<NigeriaLocation[]>([]);
  const [editLGAs, setEditLGAs] = useState<NigeriaLocation[]>([]);
  const [editWards, setEditWards] = useState<NigeriaLocation[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [loadingEditLocs, setLoadingEditLocs] = useState(false);

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Fetch user level once
  useEffect(() => {
    mobiliseDashboardService.getUserLevel().then((res) => {
      const data = res.data || res;
      setUserLevel(data.userLevel || '');
      setUserDesignation(data.designation || '');
      setUserRole(data.role || '');
    }).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const loadSubordinates = useCallback(async (pageNum = 1, designation?: string, q?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await coordinatorService.getSubordinates(pageNum, 30, designation || undefined, q || undefined);
      const data = response.data || response;
      setSubordinates(data.subordinates || data.users || []);
      setTotal(data.total || 0);
      setPage(data.page || pageNum);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load team:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadSubordinates(1, activeDesignation, debouncedSearch);
  }, [activeDesignation, debouncedSearch, loadSubordinates]);

  const handleRemove = async (user: SearchedUser) => {
    try {
      setRemovingId(user.id);
      await coordinatorService.removeDesignation(user.id);
      setConfirmRemove(null);
      await loadSubordinates(page, activeDesignation, debouncedSearch);
    } catch (err) {
      console.error('Failed to remove designation:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove designation');
    } finally {
      setRemovingId(null);
    }
  };

  // ── Edit designation logic ──
  const getAssignableDesignations = (): string[] => {
    if (userRole === 'admin') {
      return ['National Coordinator', 'State Coordinator', 'LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'];
    }
    return CAN_ASSIGN[userDesignation] || [];
  };

  const designationNeedsState = (d: string) =>
    ['State Coordinator', 'LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'].includes(d);
  const designationNeedsLGA = (d: string) =>
    ['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'].includes(d);
  const designationNeedsWard = (d: string) =>
    ['Ward Coordinator', 'Polling Unit Agent'].includes(d);

  const openEditModal = async (user: SearchedUser) => {
    setEditUser(user);
    setEditDesignation(user.designation || '');
    setEditState(user.assignedState || '');
    setEditLGA(user.assignedLGA || '');
    setEditWard(user.assignedWard || '');
    setEditError(null);

    // Pre-load states for location pickers
    if (editStates.length === 0) {
      try {
        const states = await coordinatorService.getStates();
        setEditStates(states);
      } catch { /* ignore */ }
    }
  };

  const handleEditDesignationChange = async (newDesignation: string) => {
    setEditDesignation(newDesignation);
    setEditError(null);

    // If new designation doesn't need LGA/ward, clear them
    if (!designationNeedsLGA(newDesignation)) {
      setEditLGA('');
      setEditWard('');
      setEditLGAs([]);
      setEditWards([]);
    }
    if (!designationNeedsWard(newDesignation)) {
      setEditWard('');
      setEditWards([]);
    }
  };

  const handleEditStateChange = async (stateName: string) => {
    setEditState(stateName);
    setEditLGA('');
    setEditWard('');
    setEditLGAs([]);
    setEditWards([]);
    if (stateName) {
      const stateObj = editStates.find((s) => s.name === stateName);
      if (stateObj) {
        setLoadingEditLocs(true);
        try {
          const lgas = await coordinatorService.getLGAsByState(stateObj.id);
          setEditLGAs(lgas);
        } catch { /* ignore */ }
        setLoadingEditLocs(false);
      }
    }
  };

  const handleEditLGAChange = async (lgaName: string) => {
    setEditLGA(lgaName);
    setEditWard('');
    setEditWards([]);
    if (lgaName) {
      const lgaObj = editLGAs.find((l) => l.name === lgaName);
      if (lgaObj) {
        setLoadingEditLocs(true);
        try {
          const wards = await coordinatorService.getWardsByLGA(lgaObj.id);
          setEditWards(wards);
        } catch { /* ignore */ }
        setLoadingEditLocs(false);
      }
    }
  };

  const canSubmitEdit = (): boolean => {
    if (!editDesignation || !editUser) return false;
    if (editDesignation === editUser.designation) return false; // no change
    if (designationNeedsState(editDesignation) && !editState) return false;
    if (designationNeedsLGA(editDesignation) && !editLGA) return false;
    if (designationNeedsWard(editDesignation) && !editWard) return false;
    return true;
  };

  const handleEditSubmit = async () => {
    if (!editUser || !canSubmitEdit()) return;
    try {
      setEditLoading(true);
      setEditError(null);
      await coordinatorService.assignDesignation({
        userId: editUser.id,
        designation: editDesignation,
        assignedState: designationNeedsState(editDesignation) ? editState : undefined,
        assignedLGA: designationNeedsLGA(editDesignation) ? editLGA : undefined,
        assignedWard: designationNeedsWard(editDesignation) ? editWard : undefined,
        override: true,
      });
      setEditUser(null);
      await loadSubordinates(page, activeDesignation, debouncedSearch);
    } catch (err: any) {
      const msg = err?.response?.data?.message || (err instanceof Error ? err.message : 'Failed to update designation');
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  };

  // Smart grouping based on viewer level
  const groupedData = useMemo((): GroupedMembers[] => {
    if (subordinates.length === 0) return [];

    let groupKey: (u: SearchedUser) => string;
    let groupLabel: (u: SearchedUser) => string;

    // When a specific designation filter is active, group by location
    // Otherwise group by designation first
    if (activeDesignation) {
      // Grouped by most relevant location
      switch (userLevel) {
        case 'national':
          groupKey = (u) => u.assignedState || 'Unassigned';
          groupLabel = (u) => u.assignedState || 'No State';
          break;
        case 'state':
          groupKey = (u) => u.assignedLGA || 'Unassigned';
          groupLabel = (u) => u.assignedLGA || 'No LGA';
          break;
        case 'lga':
          groupKey = (u) => u.assignedWard || 'Unassigned';
          groupLabel = (u) => u.assignedWard || 'No Ward';
          break;
        default:
          // Ward or below — flat list
          return [{ key: 'all', label: '', members: subordinates }];
      }
    } else {
      // No designation filter — group by designation
      groupKey = (u) => u.designation || 'Other';
      groupLabel = (u) => u.designation || 'Other';
    }

    const map = new Map<string, GroupedMembers>();
    for (const user of subordinates) {
      const k = groupKey(user);
      const l = groupLabel(user);
      if (!map.has(k)) {
        map.set(k, { key: k, label: l, members: [] });
      }
      map.get(k)!.members.push(user);
    }

    return Array.from(map.values());
  }, [subordinates, userLevel, activeDesignation]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getInitial = (name: string): string => {
    return name ? name[0].toUpperCase() : '?';
  };

  const getLocationString = (user: SearchedUser): string => {
    return [user.assignedState, user.assignedLGA, user.assignedWard]
      .filter(Boolean)
      .join(' · ');
  };

  // Loading skeleton
  if (loading && subordinates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-28 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 mb-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/dashboard/state')}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Team</h1>
            <p className="text-sm text-gray-500">
              {total} member{total !== 1 ? 's' : ''}
              {activeDesignation && <span> · filtered by {activeDesignation}</span>}
              {debouncedSearch && <span> · "{debouncedSearch}"</span>}
            </p>
          </div>
          <button
            onClick={() => loadSubordinates(page, activeDesignation, debouncedSearch)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Designation filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setActiveDesignation('')}
            className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              activeDesignation === ''
                ? 'bg-accent-green text-white border-accent-green'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {DESIGNATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDesignation(activeDesignation === d ? '' : d)}
              className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap ${
                activeDesignation === d
                  ? 'bg-accent-green text-white border-accent-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {d.replace(' Coordinator', ' Coord.').replace('Polling Unit ', 'PU ')}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 text-center">
            <p className="text-red-600 text-sm mb-3">Could not load team</p>
            <button
              onClick={() => loadSubordinates(1, activeDesignation, debouncedSearch)}
              className="text-sm text-red-700 font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && !loading && subordinates.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {activeDesignation || debouncedSearch ? 'No results' : 'No team members yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {activeDesignation || debouncedSearch
                ? 'Try a different filter or search term.'
                : 'Assign leaders to see them here.'}
            </p>
            {!activeDesignation && !debouncedSearch && (
              <button
                onClick={() => navigate('/dashboard/assign-leader')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-green text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
              >
                Assign Leader
              </button>
            )}
          </div>
        )}

        {/* Grouped team list */}
        {groupedData.length > 0 && (
          <div className="space-y-4">
            {groupedData.map((group) => {
              const isCollapsed = collapsedGroups.has(group.key);
              const showHeader = group.label !== '';

              return (
                <div key={group.key}>
                  {/* Group header */}
                  {showHeader && (
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="flex items-center gap-2 w-full text-left mb-2 group"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {group.label}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {group.members.length}
                      </span>
                    </button>
                  )}

                  {/* Members */}
                  {!isCollapsed && (
                    <div className="space-y-2">
                      {group.members.map((user) => {
                        const location = getLocationString(user);
                        return (
                          <div
                            key={user.id}
                            className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
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

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                {user.designation && (
                                  <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-medium text-accent-green bg-green-50 rounded">
                                    {user.designation}
                                  </span>
                                )}
                                {location && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate">{location}</p>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                  title={`Edit ${user.name}'s designation`}
                                >
                                  <Pen className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                                <button
                                  onClick={() => setConfirmRemove(user)}
                                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                                  title={`Remove ${user.name}`}
                                >
                                  <UserMinus className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => loadSubordinates(page - 1, activeDesignation, debouncedSearch)}
              disabled={page <= 1}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => loadSubordinates(page + 1, activeDesignation, debouncedSearch)}
              disabled={page >= pages}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Loading overlay for filter/search changes */}
        {loading && subordinates.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg">
            Loading…
          </div>
        )}

        {/* Confirm Remove Dialog */}
        {confirmRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Designation</h3>
              <p className="text-sm text-gray-600 mb-6">
                Remove <span className="font-semibold">"{confirmRemove.designation}"</span> from{' '}
                <span className="font-semibold">{confirmRemove.name}</span>? They will be set back
                to Community Member.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmRemove(null)}
                  disabled={removingId === confirmRemove.id}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemove(confirmRemove)}
                  disabled={removingId === confirmRemove.id}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {removingId === confirmRemove.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Designation Modal */}
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Edit Designation</h3>
              <p className="text-sm text-gray-500 mb-5">
                Change role for <span className="font-semibold text-gray-900">{editUser.name}</span>
              </p>

              {editError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-600">{editError}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Current designation (read-only) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Current
                  </label>
                  <p className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700">
                    {editUser.designation}
                  </p>
                </div>

                {/* New designation */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    New Designation
                  </label>
                  <select
                    value={editDesignation}
                    onChange={(e) => handleEditDesignationChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                  >
                    <option value="">Choose…</option>
                    {getAssignableDesignations().map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* State */}
                {designationNeedsState(editDesignation) && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      State
                    </label>
                    <select
                      value={editState}
                      onChange={(e) => handleEditStateChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                    >
                      <option value="">Select state…</option>
                      {editStates.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* LGA */}
                {designationNeedsLGA(editDesignation) && editState && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      LGA
                    </label>
                    {loadingEditLocs && editLGAs.length === 0 ? (
                      <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                      </div>
                    ) : (
                      <select
                        value={editLGA}
                        onChange={(e) => handleEditLGAChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                      >
                        <option value="">Select LGA…</option>
                        {editLGAs.map((l) => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Ward */}
                {designationNeedsWard(editDesignation) && editLGA && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Ward
                    </label>
                    {loadingEditLocs && editWards.length === 0 ? (
                      <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                      </div>
                    ) : (
                      <select
                        value={editWard}
                        onChange={(e) => setEditWard(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                      >
                        <option value="">Select ward…</option>
                        {editWards.map((w) => (
                          <option key={w.id} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditUser(null)}
                  disabled={editLoading}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!canSubmitEdit() || editLoading}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-accent-green rounded-lg hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : (
                    'Save Change'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeamPage;
