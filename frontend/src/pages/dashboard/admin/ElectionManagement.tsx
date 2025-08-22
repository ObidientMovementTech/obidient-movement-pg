import { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  MapPin,
  // Users,
  Search,
  Filter,
  X,
  AlertTriangle,
  // Eye,
  BarChart3
} from 'lucide-react';
import { electionService, Election, ElectionFormData } from '../../../services/electionService';

const ElectionManagement = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [formData, setFormData] = useState<ElectionFormData>({
    election_name: '',
    election_type: 'gubernatorial',
    state: '',
    lga: '',
    election_date: ''
  });
  const [availableLGAs, setAvailableLGAs] = useState<Array<{ value: string, label: string }>>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const electionTypes = electionService.getElectionTypes();
  const nigerianStates = electionService.getNigerianStates();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await electionService.getElections();
      setElections(response.data.elections);
    } catch (error) {
      setError('Failed to fetch elections');
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await electionService.createElection(formData);
      setSuccess('Election created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchElections();
    } catch (error: any) {
      setError(error.message || 'Failed to create election');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElection) return;

    setFormLoading(true);
    setError('');

    try {
      await electionService.updateElection(selectedElection.id, formData);
      setSuccess('Election updated successfully!');
      setShowEditModal(false);
      setSelectedElection(null);
      resetForm();
      fetchElections();
    } catch (error: any) {
      setError(error.message || 'Failed to update election');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (electionId: number, newStatus: string) => {
    try {
      await electionService.updateElectionStatus(electionId, newStatus as 'upcoming' | 'active' | 'completed');

      setElections(prev => prev.map(election =>
        election.id === electionId
          ? { ...election, status: newStatus as Election['status'] }
          : election
      ));

      setSuccess(`Election status changed to ${newStatus}`);
    } catch (error: any) {
      setError(error.message || 'Failed to change election status');
    }
  };

  const handleDeleteElection = async (election: Election) => {
    if (!window.confirm(`Are you sure you want to delete "${election.election_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await electionService.deleteElection(election.id);
      setElections(prev => prev.filter(e => e.id !== election.id));
      setSuccess('Election deleted successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to delete election');
    }
  };

  const openEditModal = (election: Election) => {
    setSelectedElection(election);
    setFormData({
      election_name: election.election_name,
      election_type: election.election_type,
      state: election.state,
      lga: election.lga,
      election_date: election.election_date
    });

    // Set available LGAs for the selected state
    if (election.state) {
      const lgas = electionService.getLGAsByState(election.state);
      setAvailableLGAs(lgas);
    }

    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      election_name: '',
      election_type: 'gubernatorial',
      state: '',
      lga: '',
      election_date: ''
    });
    setAvailableLGAs([]);
  };

  // Handle state change to update available LGAs
  const handleStateChange = (newState: string) => {
    setFormData(prev => ({
      ...prev,
      state: newState,
      lga: '' // Reset LGA when state changes
    }));

    if (newState) {
      const lgas = electionService.getLGAsByState(newState);
      setAvailableLGAs(lgas);
    } else {
      setAvailableLGAs([]);
    }
  };

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.election_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.election_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return electionService.getStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Election Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage elections and monitoring assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Election</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-600 dark:text-red-400">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-600 dark:text-green-400">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Elections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredElections.map((election) => (
          <div key={election.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {election.election_name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{election.state}{election.lga && `, ${election.lga}`}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(election.election_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                  {getStatusIcon(election.status)}
                  <span className="capitalize">{election.status}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {election.election_type.replace('_', ' ')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(election)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit Election"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteElection(election)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Election"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View Analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {election.status === 'upcoming' && (
                    <button
                      onClick={() => handleStatusChange(election.id, 'active')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      <span>Start</span>
                    </button>
                  )}
                  {election.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(election.id, 'completed')}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(election.id, 'upcoming')}
                        className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Pause className="h-3 w-3" />
                        <span>Pause</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredElections.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No elections found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first election.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Election</span>
            </button>
          )}
        </div>
      )}

      {/* Create Election Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Election</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateElection} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Election Name
                </label>
                <input
                  type="text"
                  value={formData.election_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, election_name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Anambra Gubernatorial Election 2025"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Election Type
                  </label>
                  <select
                    value={formData.election_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, election_type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {electionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LGA (Optional)
                  </label>
                  <select
                    value={formData.lga}
                    onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={!formData.state}
                  >
                    <option value="">All LGAs / State-wide</option>
                    {availableLGAs.map(lga => (
                      <option key={lga.value} value={lga.value}>{lga.label}</option>
                    ))}
                  </select>
                  {!formData.state && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Select a state first to see available LGAs
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Election Date
                  </label>
                  <input
                    type="date"
                    value={formData.election_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, election_date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {formLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>{formLoading ? 'Creating...' : 'Create Election'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Election Modal */}
      {showEditModal && selectedElection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Election</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateElection} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Election Name
                </label>
                <input
                  type="text"
                  value={formData.election_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, election_name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Election Type
                  </label>
                  <select
                    value={formData.election_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, election_type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {electionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LGA (Optional)
                  </label>
                  <select
                    value={formData.lga}
                    onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={!formData.state}
                  >
                    <option value="">All LGAs / State-wide</option>
                    {availableLGAs.map(lga => (
                      <option key={lga.value} value={lga.value}>{lga.label}</option>
                    ))}
                  </select>
                  {!formData.state && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Select a state first to see available LGAs
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Election Date
                  </label>
                  <input
                    type="date"
                    value={formData.election_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, election_date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {formLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>{formLoading ? 'Updating...' : 'Update Election'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionManagement;
