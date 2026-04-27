import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NigeriaLocation,
  fetchStates,
  fetchLGAs,
  fetchWards,
  fetchPollingUnits,
} from '../services/nigeriaLocationsService';
import { OptionType } from '../utils/lookups';

/** Convert API items to the OptionType shape used by FormSelect. */
function toOptions(items: NigeriaLocation[]): OptionType[] {
  return items.map((item) => ({
    id: item.id,
    label: item.abbreviation ? `${item.abbreviation} - ${item.name}` : item.name,
    value: item.name,
  }));
}

/** Case-insensitive name match (handles stored UPPERCASE vs DB mixed case). */
function findByName(items: NigeriaLocation[], name: string): NigeriaLocation | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  return items.find((i) => i.name.toLowerCase() === lower) ?? null;
}

interface LocationLevel {
  data: NigeriaLocation[];
  options: OptionType[];
  isLoading: boolean;
  error: string | null;
}

interface UseNigeriaLocationsOptions {
  /** Pre-fill values (name strings from user profile / existing data) */
  initialState?: string;
  initialLGA?: string;
  initialWard?: string;
  initialPU?: string;
  /** How many cascade levels to support (2 = state+LGA, 4 = all) */
  levels?: 2 | 3 | 4;
}

const EMPTY_LEVEL: LocationLevel = { data: [], options: [], isLoading: false, error: null };

export default function useNigeriaLocations(opts: UseNigeriaLocationsOptions = {}) {
  const { initialState, initialLGA, initialWard, initialPU, levels = 4 } = opts;

  // ── Selected location objects ───────────────────────────────
  const [selectedState, setSelectedState] = useState<NigeriaLocation | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<NigeriaLocation | null>(null);
  const [selectedWard, setSelectedWard] = useState<NigeriaLocation | null>(null);
  const [selectedPU, setSelectedPU] = useState<NigeriaLocation | null>(null);

  // ── Data + loading per level ────────────────────────────────
  const [states, setStates] = useState<LocationLevel>(EMPTY_LEVEL);
  const [lgas, setLgas] = useState<LocationLevel>(EMPTY_LEVEL);
  const [wards, setWards] = useState<LocationLevel>(EMPTY_LEVEL);
  const [pollingUnits, setPollingUnits] = useState<LocationLevel>(EMPTY_LEVEL);

  // ── Prefill tracking (mirrors Flutter's _prefilledX flags) ──
  const prefilledState = useRef(false);
  const prefilledLGA = useRef(false);
  const prefilledWard = useRef(false);
  const prefilledPU = useRef(false);

  // ── 1. Fetch states on mount ────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setStates((prev) => ({ ...prev, isLoading: true, error: null }));
    fetchStates()
      .then((data) => {
        if (cancelled) return;
        setStates({ data, options: toOptions(data), isLoading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setStates({ data: [], options: [], isLoading: false, error: err.message });
      });
    return () => { cancelled = true; };
  }, []);

  // ── Prefill state from initial value ────────────────────────
  useEffect(() => {
    if (prefilledState.current || !initialState || states.data.length === 0) return;
    const match = findByName(states.data, initialState);
    if (match) {
      prefilledState.current = true;
      setSelectedState(match);
    }
  }, [states.data, initialState]);

  // ── 2. Fetch LGAs when state changes ───────────────────────
  useEffect(() => {
    if (!selectedState) {
      setLgas(EMPTY_LEVEL);
      return;
    }
    let cancelled = false;
    setLgas((prev) => ({ ...prev, isLoading: true, error: null }));
    fetchLGAs(selectedState.id)
      .then((data) => {
        if (cancelled) return;
        setLgas({ data, options: toOptions(data), isLoading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setLgas({ data: [], options: [], isLoading: false, error: err.message });
      });
    return () => { cancelled = true; };
  }, [selectedState?.id]);

  // ── Prefill LGA ─────────────────────────────────────────────
  useEffect(() => {
    if (prefilledLGA.current || !initialLGA || lgas.data.length === 0) return;
    const match = findByName(lgas.data, initialLGA);
    if (match) {
      prefilledLGA.current = true;
      setSelectedLGA(match);
    }
  }, [lgas.data, initialLGA]);

  // ── 3. Fetch wards when LGA changes ─────────────────────────
  useEffect(() => {
    if (levels < 3 || !selectedLGA) {
      setWards(EMPTY_LEVEL);
      return;
    }
    let cancelled = false;
    setWards((prev) => ({ ...prev, isLoading: true, error: null }));
    fetchWards(selectedLGA.id)
      .then((data) => {
        if (cancelled) return;
        setWards({ data, options: toOptions(data), isLoading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setWards({ data: [], options: [], isLoading: false, error: err.message });
      });
    return () => { cancelled = true; };
  }, [selectedLGA?.id, levels]);

  // ── Prefill ward ────────────────────────────────────────────
  useEffect(() => {
    if (prefilledWard.current || !initialWard || wards.data.length === 0) return;
    const match = findByName(wards.data, initialWard);
    if (match) {
      prefilledWard.current = true;
      setSelectedWard(match);
    }
  }, [wards.data, initialWard]);

  // ── 4. Fetch polling units when ward changes ────────────────
  useEffect(() => {
    if (levels < 4 || !selectedWard) {
      setPollingUnits(EMPTY_LEVEL);
      return;
    }
    let cancelled = false;
    setPollingUnits((prev) => ({ ...prev, isLoading: true, error: null }));
    fetchPollingUnits(selectedWard.id)
      .then((data) => {
        if (cancelled) return;
        setPollingUnits({ data, options: toOptions(data), isLoading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setPollingUnits({ data: [], options: [], isLoading: false, error: err.message });
      });
    return () => { cancelled = true; };
  }, [selectedWard?.id, levels]);

  // ── Prefill polling unit ────────────────────────────────────
  useEffect(() => {
    if (prefilledPU.current || !initialPU || pollingUnits.data.length === 0) return;
    const match = findByName(pollingUnits.data, initialPU);
    if (match) {
      prefilledPU.current = true;
      setSelectedPU(match);
    }
  }, [pollingUnits.data, initialPU]);

  // ── Cascading clear handlers (mirrors Flutter pattern) ──────
  const handleSetState = useCallback((loc: NigeriaLocation | null) => {
    setSelectedState(loc);
    setSelectedLGA(null);
    setSelectedWard(null);
    setSelectedPU(null);
    // Reset prefill flags for children so they don't re-fire
    prefilledLGA.current = true;
    prefilledWard.current = true;
    prefilledPU.current = true;
  }, []);

  const handleSetLGA = useCallback((loc: NigeriaLocation | null) => {
    setSelectedLGA(loc);
    setSelectedWard(null);
    setSelectedPU(null);
    prefilledWard.current = true;
    prefilledPU.current = true;
  }, []);

  const handleSetWard = useCallback((loc: NigeriaLocation | null) => {
    setSelectedWard(loc);
    setSelectedPU(null);
    prefilledPU.current = true;
  }, []);

  const handleSetPU = useCallback((loc: NigeriaLocation | null) => {
    setSelectedPU(loc);
  }, []);

  return {
    // Level data (options + loading + error)
    states,
    lgas,
    wards,
    pollingUnits,

    // Current selections
    selectedState,
    selectedLGA,
    selectedWard,
    selectedPU,

    // Setters (with cascading clear)
    setSelectedState: handleSetState,
    setSelectedLGA: handleSetLGA,
    setSelectedWard: handleSetWard,
    setSelectedPU: handleSetPU,
  };
}
