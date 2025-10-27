/**
 * Professional INEC Voters Hook - Built for Scale
 * Implements efficient data fetching, caching, and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// TypeScript interfaces
export interface INECVoter {
  id: string;
  vin: string;
  full_name?: string;
  first_name: string;
  last_name: string;
  other_names?: string;
  phone_number: string;
  email?: string;
  state: string;
  lga: string;
  ward: string;
  polling_unit: string;
  polling_unit_code: string;
  address?: string;
  occupation?: string;
  gender?: string;
  age?: number;
  confirmed: boolean;
  last_called?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface VoterFilters {
  search?: string;
  lga?: string;
  ward?: string;
  polling_unit?: string;
  has_phone?: boolean;
  has_email?: boolean;
  confirmed?: boolean;
  gender?: string;
  age_min?: number;
  age_max?: number;
}

export interface VoterStats {
  overview: {
    total_voters: number;
    voters_with_phone: number;
    voters_with_email: number;
    confirmed_voters: number;
    contacted_voters: number;
    contact_rate: string;
    phone_coverage: string;
  };
  demographics: {
    average_age: string;
    male_voters: number;
    female_voters: number;
    gender_distribution: {
      male_percentage: string;
      female_percentage: string;
    };
  };
  geographic: {
    total_lgas: number;
    total_wards: number;
    total_polling_units: number;
    average_voters_per_lga: number;
    average_voters_per_ward: number;
  };
}

export interface LocationItem {
  name: string;
  code?: string;
  voter_count: number;
  child_count: number;
  voters_with_phone: number;
}

// Cache implementation for better performance
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new DataCache();

// Main hook for INEC voters data
export const useINECVoters = (
  filters: VoterFilters = {},
  page: number = 1,
  pageSize: number = 50,
  sortBy: string = 'created_at',
  sortOrder: 'ASC' | 'DESC' = 'DESC'
) => {
  const [voters, setVoters] = useState<INECVoter[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Use ref to prevent unnecessary re-renders
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchVoters = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Create cache key
    const cacheKey = `voters_${JSON.stringify({ filters, page, pageSize, sortBy, sortOrder })}`;

    setLoading(true);
    setError(null);
    setHasLoaded(false);

    // Try cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      setVoters(cachedData.voters);
      setPagination(cachedData.pagination);
      setHasLoaded(true);
      setLoading(false);
      return;
    }

    let wasCancelled = false;

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await axios.get(`${API_BASE}/api/inec-voters?${params}`, {
        withCredentials: true,
        signal: abortController.signal
      });

      if (response.data.success) {
        const { voters: voterData, pagination: paginationData } = response.data.data;

        setVoters(voterData);
        setPagination(paginationData);
        setHasLoaded(true);

        // Cache the results
        cache.set(cacheKey, { voters: voterData, pagination: paginationData }, 3);
      } else {
        setError(response.data.message || 'Failed to fetch voters');
        setHasLoaded(true);
      }
    } catch (err: any) {
      const cancelled = err?.name === 'AbortError' || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
      wasCancelled = cancelled;

      if (!cancelled) {
        console.error('Error fetching INEC voters:', err);
        setError(err.response?.data?.message || 'Failed to fetch voter data');
        setHasLoaded(true);
      }
    } finally {
      if (!wasCancelled) {
        setLoading(false);
      }
    }
  }, [filters, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchVoters();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchVoters]);

  const refetch = useCallback(() => {
    cache.clear(); // Clear cache when explicitly refetching
    fetchVoters();
  }, [fetchVoters]);

  return {
    voters,
    pagination,
    loading,
    error,
    refetch,
    hasLoaded
  };
};

// Hook for statistics
export const useINECVotersStats = () => {
  const [stats, setStats] = useState<VoterStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const cacheKey = 'voter_stats';
    const cachedStats = cache.get(cacheKey);

    if (cachedStats) {
      setStats(cachedStats);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/api/inec-voters/stats`, {
        withCredentials: true
      });

      if (response.data.success) {
        setStats(response.data.data);
        cache.set(cacheKey, response.data.data, 10); // Cache for 10 minutes
      } else {
        setError(response.data.message || 'Failed to fetch statistics');
      }
    } catch (err: any) {
      console.error('Error fetching INEC stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

// Hook for location hierarchy
export const useLocationHierarchy = (
  level: 'lga' | 'ward' | 'polling_unit',
  parentLga?: string,
  parentWard?: string
) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    // Ensure required parent selections exist before querying the API
    if (level === 'ward' && !parentLga) {
      setLocations([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (level === 'polling_unit' && (!parentLga || !parentWard)) {
      setLocations([]);
      setLoading(false);
      setError(null);
      return;
    }

    const cacheKey = `locations_${level}_${parentLga || ''}_${parentWard || ''}`;
    const cachedLocations = cache.get(cacheKey);

    if (cachedLocations) {
      setLocations(cachedLocations);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ level });
      if (parentLga) params.set('parent_lga', parentLga);
      if (parentWard) params.set('parent_ward', parentWard);

      const response = await axios.get(`${API_BASE}/api/inec-voters/locations?${params}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setLocations(response.data.data.locations);
        cache.set(cacheKey, response.data.data.locations, 15); // Cache for 15 minutes
      } else {
        setError(response.data.message || 'Failed to fetch locations');
      }
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      setError(err.response?.data?.message || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  }, [level, parentLga, parentWard]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations
  };
};

// Utility functions for common operations
export const inecVotersApi = {
  // Search voters by name or VIN
  searchVoters: async (searchTerm: string, limit: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/api/inec-voters`, {
        params: { search: searchTerm, limit },
        withCredentials: true
      });
      return response.data.success ? response.data.data.voters : [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  // Get voters by specific location
  getVotersByLocation: async (lga: string, ward?: string, pollingUnit?: string) => {
    try {
      const params: any = { lga, limit: 1000 };
      if (ward) params.ward = ward;
      if (pollingUnit) params.polling_unit = pollingUnit;

      const response = await axios.get(`${API_BASE}/api/inec-voters`, {
        params,
        withCredentials: true
      });
      return response.data.success ? response.data.data.voters : [];
    } catch (error) {
      console.error('Location fetch error:', error);
      return [];
    }
  },

  // Export voters data (for reports)
  exportVoters: async (filters: VoterFilters, format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const params = { ...filters, export: format, limit: 10000 };
      const response = await axios.get(`${API_BASE}/api/inec-voters/export`, {
        params,
        withCredentials: true,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
};