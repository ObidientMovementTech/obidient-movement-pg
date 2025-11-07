import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  RefreshCw,
  Clock,
  ChevronRight,
  Home,
  Search,
  X
} from 'lucide-react';
import {
  resultsDashboardService,
  type ActiveElection,
  type ElectionHierarchy,
  type LGAData,
  type WardData,
  type PollingUnitData
} from '../../../services/resultsDashboardService';
import LGAResultsView from './results/LGAResultsView';
import WardResultsView from './results/WardResultsView';
import PollingUnitDetailView from './results/PollingUnitDetailView';
import EC8AFormModal from '../../../components/EC8AFormModal';

type ViewLevel = 'overview' | 'lga' | 'ward' | 'pu';

interface BreadcrumbItem {
  label: string;
  level: ViewLevel;
  onClick: () => void;
}

/**
 * Results Dashboard Page
 * Hierarchical election results viewer with performance optimizations
 * Features: Multi-election tabs, auto-refresh, breadcrumbs, search, admin-only
 */
export default function ResultsDashboardPage() {
  // State
  const [elections, setElections] = useState<ActiveElection[]>([]);
  const [selectedElection, setSelectedElection] = useState<ActiveElection | null>(null);
  const [hierarchy, setHierarchy] = useState<ElectionHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewLevel>('overview');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedLGA, setSelectedLGA] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedPU, setSelectedPU] = useState<string>('');

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ url: '', title: '' });

  // Load elections on mount
  useEffect(() => {
    loadElections();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!selectedElection) return;

    const interval = setInterval(() => {
      loadHierarchy(selectedElection.election_id, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedElection]);

  // Load initial hierarchy when election selected
  useEffect(() => {
    if (selectedElection) {
      loadHierarchy(selectedElection.election_id);
    }
  }, [selectedElection]);

  const loadElections = async () => {
    try {
      setLoading(true);
      const data = await resultsDashboardService.getActiveElections();
      setElections(data);

      // Auto-select first election if available
      if (data.length > 0 && !selectedElection) {
        setSelectedElection(data[0]);
      }
    } catch (error) {
      console.error('Error loading elections:', error);
      alert('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const loadHierarchy = async (electionId: string, silent = false) => {
    try {
      if (!silent) setRefreshing(true);

      const data = await resultsDashboardService.getElectionHierarchy(electionId, !silent);
      setHierarchy(data);
      setLastUpdated(new Date());

      // Auto-select first state if none selected
      if (!selectedState && data.hierarchy && Object.keys(data.hierarchy).length > 0) {
        const firstState = Object.keys(data.hierarchy)[0];
        setSelectedState(firstState);
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
      if (!silent) {
        alert('Failed to load results data');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Navigation handlers
  const handleLGASelect = useCallback((lgaName: string) => {
    setSelectedLGA(lgaName);
    setSelectedWard('');
    setSelectedPU('');
    setCurrentView('lga');
  }, []);

  const handleWardSelect = useCallback((wardName: string) => {
    setSelectedWard(wardName);
    setSelectedPU('');
    setCurrentView('ward');
  }, []);

  const handlePUSelect = useCallback((puCode: string) => {
    setSelectedPU(puCode);
    setCurrentView('pu');
  }, []);

  const handleBackToOverview = useCallback(() => {
    setCurrentView('overview');
    setSelectedLGA('');
    setSelectedWard('');
    setSelectedPU('');
  }, []);

  const handleBackToLGA = useCallback(() => {
    setCurrentView('lga');
    setSelectedWard('');
    setSelectedPU('');
  }, []);

  const handleBackToWard = useCallback(() => {
    setCurrentView('ward');
    setSelectedPU('');
  }, []);

  // Image preview handler
  const handleImagePreview = useCallback((url: string, title: string) => {
    setModalImage({ url, title });
    setImageModalOpen(true);
  }, []);

  // Get current data based on view
  const getCurrentLGAData = (): LGAData | null => {
    if (!hierarchy || !selectedState || !selectedLGA) return null;
    return hierarchy.hierarchy[selectedState]?.lgas[selectedLGA] || null;
  };

  const getCurrentWardData = (): WardData | null => {
    const lgaData = getCurrentLGAData();
    if (!lgaData || !selectedWard) return null;
    return lgaData.wards[selectedWard] || null;
  };

  const getCurrentPUData = (): PollingUnitData | null => {
    const wardData = getCurrentWardData();
    if (!wardData || !selectedPU) return null;
    return wardData.pollingUnits[selectedPU] || null;
  };

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Overview', level: 'overview', onClick: handleBackToOverview }
  ];

  if (selectedLGA) {
    breadcrumbs.push({
      label: selectedLGA,
      level: 'lga',
      onClick: handleBackToLGA
    });
  }

  if (selectedWard) {
    breadcrumbs.push({
      label: selectedWard,
      level: 'ward',
      onClick: handleBackToWard
    });
  }

  if (selectedPU) {
    const puData = getCurrentPUData();
    breadcrumbs.push({
      label: puData?.puName || selectedPU,
      level: 'pu',
      onClick: () => { }
    });
  }

  // Filter LGAs by search
  const filteredLGAs = () => {
    if (!hierarchy || !selectedState) return [];

    const lgas = Object.values(hierarchy.hierarchy[selectedState]?.lgas || {});

    if (!searchTerm.trim()) return lgas;

    const search = searchTerm.toLowerCase();
    return lgas.filter(lga =>
      lga.lga.toLowerCase().includes(search)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#8cc63f] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Results Dashboard...</p>
        </div>
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Elections</h2>
          <p className="text-gray-600 mb-6">
            There are no active elections to display results for.
          </p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 bg-[#8cc63f] text-white rounded-lg hover:bg-[#7ab52f] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-[#8cc63f]" />
              Results Dashboard
            </h1>

            <button
              onClick={() => loadHierarchy(selectedElection!.election_id)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-[#8cc63f] text-white rounded-lg hover:bg-[#7ab52f] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Election Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {elections.map(election => (
              <button
                key={election.election_id}
                onClick={() => {
                  setSelectedElection(election);
                  handleBackToOverview();
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${selectedElection?.election_id === election.election_id
                    ? 'bg-[#8cc63f] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <div className="text-sm font-medium">{election.election_name}</div>
                <div className="text-xs opacity-75">
                  {election.result_submissions} results submitted
                </div>
              </button>
            ))}
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <span>•</span>
            <span>Auto-refreshes every 30 seconds</span>
          </div>
        </div>

        {/* Breadcrumbs */}
        {currentView !== 'overview' && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <button
                    onClick={crumb.onClick}
                    className={`${index === breadcrumbs.length - 1
                        ? 'text-[#8cc63f] font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                      } transition-colors`}
                    disabled={index === breadcrumbs.length - 1}
                  >
                    {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                    {crumb.label}
                  </button>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {currentView === 'overview' && hierarchy && (
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search LGAs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* LGA Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLGAs().map(lga => {
                const totalVotes = Object.values(lga.partyTotals).reduce((sum, votes) => sum + votes, 0);
                const leadingParty = Object.entries(lga.partyTotals)
                  .sort(([, a], [, b]) => b - a)[0];
                const wardsCount = Object.keys(lga.wards).length;

                return (
                  <button
                    key={lga.lga}
                    onClick={() => handleLGASelect(lga.lga)}
                    className="text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#8cc63f] rounded-lg p-5 transition-all shadow-sm hover:shadow-md"
                  >
                    <h3 className="font-bold text-lg text-gray-900 mb-3">{lga.lga}</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Wards:</span>
                        <span className="font-semibold text-gray-900">{wardsCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Results:</span>
                        <span className="font-semibold text-gray-900">{lga.resultSubmissions}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Votes:</span>
                        <span className="font-semibold text-gray-900">{totalVotes.toLocaleString()}</span>
                      </div>

                      {leadingParty && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Leading:</span>
                          <span className="font-bold text-[#8cc63f]">{leadingParty[0]}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredLGAs().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No LGAs found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {currentView === 'lga' && getCurrentLGAData() && hierarchy && (
          <div className="max-w-7xl mx-auto">
            <LGAResultsView
              lgaData={getCurrentLGAData()!}
              parties={hierarchy.parties}
              onWardSelect={handleWardSelect}
            />
          </div>
        )}

        {currentView === 'ward' && getCurrentWardData() && hierarchy && (
          <div className="max-w-7xl mx-auto">
            <WardResultsView
              wardData={getCurrentWardData()!}
              parties={hierarchy.parties}
              onPollingUnitSelect={handlePUSelect}
              onImagePreview={handleImagePreview}
            />
          </div>
        )}

        {currentView === 'pu' && getCurrentPUData() && hierarchy && (
          <div className="max-w-5xl mx-auto">
            <PollingUnitDetailView
              pollingUnit={getCurrentPUData()!}
              parties={hierarchy.parties}
              onImagePreview={handleImagePreview}
            />
          </div>
        )}
      </div>

      {/* EC8A Form Modal */}
      {imageModalOpen && (
        <EC8AFormModal
          imageUrl={modalImage.url}
          pollingUnitName={modalImage.title}
          onClose={() => setImageModalOpen(false)}
        />
      )}
    </div>
  );
}
