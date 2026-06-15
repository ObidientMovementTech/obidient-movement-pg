import { useState, useEffect, useCallback } from 'react';
import { mobiliseDashboardService } from '../../../../services/mobiliseDashboardService';
import type { DemographicsData, PersonRow, PeopleFilters, PaginationData } from './types';

export function useDemographics(level: string, locationId: string) {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!level || !locationId) return;
    let cancelled = false;
    setLoading(true);
    mobiliseDashboardService.getDemographics(level, locationId)
      .then(res => { if (!cancelled) setData(res.data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [level, locationId]);

  return { data, loading, error };
}

export function usePeople(level: string, locationId: string) {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<PeopleFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = useCallback(async (page = 1, currentFilters?: PeopleFilters) => {
    if (!level || !locationId) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 50 };
      const f = currentFilters || filters;
      if (f.gender) params.gender = f.gender;
      if (f.ageRange) params.ageRange = f.ageRange;
      if (f.pvc) params.pvc = f.pvc;
      if (f.willVote) params.willVote = f.willVote;
      if (f.profileHealth) params.profileHealth = f.profileHealth;
      if (f.activity) params.activity = f.activity;
      if (f.lga) params.lga = f.lga;
      if (f.search) params.search = f.search;
      if (f.sortBy) params.sortBy = f.sortBy;
      if (f.sortDir) params.sortDir = f.sortDir;

      // Support scope override (e.g. _scope: 'noState' to view users without a state)
      const effectiveLevel = (f as any)._scope || level;
      const effectiveLocationId = (f as any)._scope ? 'all' : locationId;

      const res = await mobiliseDashboardService.getPeople(effectiveLevel, effectiveLocationId, params);
      setPeople(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [level, locationId, filters]);

  const setPage = (page: number) => {
    fetchPeople(page);
  };

  const applyFilters = (newFilters: PeopleFilters) => {
    setFilters(newFilters);
    fetchPeople(1, newFilters);
  };

  const exportCsv = async () => {
    const params: Record<string, string> = {};
    if (filters.gender) params.gender = filters.gender;
    if (filters.ageRange) params.ageRange = filters.ageRange;
    if (filters.pvc) params.pvc = filters.pvc;
    if (filters.willVote) params.willVote = filters.willVote;
    if (filters.profileHealth) params.profileHealth = filters.profileHealth;
    if (filters.activity) params.activity = filters.activity;
    if (filters.lga) params.lga = filters.lga;
    if (filters.search) params.search = filters.search;

    const effectiveLevel = (filters as any)._scope || level;
    const effectiveLocationId = (filters as any)._scope ? 'all' : locationId;

    const blob = await mobiliseDashboardService.exportPeople(effectiveLevel, effectiveLocationId, params);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${effectiveLevel}_${effectiveLocationId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { people, pagination, filters, loading, error, fetchPeople, setPage, applyFilters, exportCsv };
}
