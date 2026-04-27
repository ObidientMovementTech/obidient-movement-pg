import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface NigeriaLocation {
  id: number;
  name: string;
  abbreviation?: string;
  source_id?: string;
  delimitation?: string;
  remark?: string;
}

// Simple in-memory cache to avoid redundant fetches within the same session
const cache = new Map<string, { data: NigeriaLocation[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): NigeriaLocation[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: NigeriaLocation[]) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchStates(): Promise<NigeriaLocation[]> {
  const cacheKey = 'states';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(`${API_BASE}/api/nigeria-locations/states`);
  const data: NigeriaLocation[] = res.data.data;
  setCache(cacheKey, data);
  return data;
}

export async function fetchLGAs(stateId: number): Promise<NigeriaLocation[]> {
  const cacheKey = `lgas-${stateId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(`${API_BASE}/api/nigeria-locations/states/${stateId}/lgas`);
  const data: NigeriaLocation[] = res.data.data;
  setCache(cacheKey, data);
  return data;
}

export async function fetchWards(lgaId: number): Promise<NigeriaLocation[]> {
  const cacheKey = `wards-${lgaId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(`${API_BASE}/api/nigeria-locations/lgas/${lgaId}/wards`);
  const data: NigeriaLocation[] = res.data.data;
  setCache(cacheKey, data);
  return data;
}

export async function fetchPollingUnits(wardId: number): Promise<NigeriaLocation[]> {
  const cacheKey = `pus-${wardId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(`${API_BASE}/api/nigeria-locations/wards/${wardId}/polling-units`);
  const data: NigeriaLocation[] = res.data.data;
  setCache(cacheKey, data);
  return data;
}

// ── Backward-compatible async helpers ──
// Drop-in replacements for the old synchronous getStateNames/getFormattedLGAs/getFormattedWards
// that previously came from StateLGAWardPollingUnits.ts

export type OptionType = { id: number; label: string; value: string };

/** Returns sorted list of state names */
export async function getStateNamesAsync(): Promise<string[]> {
  const states = await fetchStates();
  return states.map(s => s.name).sort();
}

/** Returns OptionType[] for LGAs of a given state name */
export async function getFormattedLGAsAsync(stateName: string): Promise<OptionType[]> {
  const states = await fetchStates();
  const state = states.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  if (!state) return [];
  const lgas = await fetchLGAs(state.id);
  return lgas.map((l, i) => ({ id: i + 1, label: l.name, value: l.name }));
}

/** Returns OptionType[] for wards of a given state+LGA name */
export async function getFormattedWardsAsync(stateName: string, lgaName: string): Promise<OptionType[]> {
  const states = await fetchStates();
  const state = states.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  if (!state) return [];
  const lgas = await fetchLGAs(state.id);
  const lga = lgas.find(l => l.name.toLowerCase() === lgaName.toLowerCase());
  if (!lga) return [];
  const wards = await fetchWards(lga.id);
  return wards.map((w, i) => ({ id: i + 1, label: w.name, value: w.name }));
}

/** Returns OptionType[] for polling units of a given state+LGA+ward name */
export async function getFormattedPollingUnitsAsync(stateName: string, lgaName: string, wardName: string): Promise<OptionType[]> {
  const states = await fetchStates();
  const state = states.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  if (!state) return [];
  const lgas = await fetchLGAs(state.id);
  const lga = lgas.find(l => l.name.toLowerCase() === lgaName.toLowerCase());
  if (!lga) return [];
  const wards = await fetchWards(lga.id);
  const ward = wards.find(w => w.name.toLowerCase() === wardName.toLowerCase());
  if (!ward) return [];
  const pus = await fetchPollingUnits(ward.id);
  return pus.map((p, i) => ({ id: i + 1, label: p.name, value: p.name }));
}
