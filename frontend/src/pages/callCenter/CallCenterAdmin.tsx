import React, { useState, useEffect } from 'react';
import { Upload, Users, Phone, BarChart3, CheckCircle, Clock, AlertCircle, Navigation } from 'lucide-react';
import Toast from '../../components/Toast';
import ColumnMappingModal from '../../components/callCenter/ColumnMappingModal';
import VoterStatisticsTable from '../../components/callCenter/VoterStatisticsTable';
import CallCenterAdminNavigator from '../../components/callCenter/CallCenterAdminNavigator';
import { callCenterService, type ImportStats, type RecentImport, type Volunteer } from '../../services/callCenterService';

// Interface definitions now imported from service

const CallCenterAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'stats' | 'volunteers' | 'navigation'>('navigation');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [recentImports, setRecentImports] = useState<RecentImport[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // Column mapping workflow state
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [excelPreview, setExcelPreview] = useState<any>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');

  const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch stats and volunteers on component mount
  useEffect(() => {
    fetchStats();
    fetchVolunteers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await callCenterService.getImportStats();

      if (response.success) {
        setStats(response.stats);
        setRecentImports(response.recentImports);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      setToastInfo({
        message: error.response?.data?.message || 'Failed to fetch statistics',
        type: 'error'
      });
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await callCenterService.getVolunteers();

      if (response.success) {
        setVolunteers(response.volunteers);
      }
    } catch (error: any) {
      console.error('Failed to fetch volunteers:', error);
      setToastInfo({
        message: error.response?.data?.message || 'Failed to fetch volunteers',
        type: 'error'
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!allowedTypes.includes(fileExtension)) {
        setToastInfo({
          message: 'Please select an Excel file (.xlsx or .xls)',
          type: 'error'
        });
        return;
      }

      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setToastInfo({
        message: 'Please select a file to import',
        type: 'error'
      });
      return;
    }

    setImporting(true);
    try {
      // First, preview the Excel file to get column structure
      const response = await callCenterService.previewExcelFile(importFile);

      if (response.success) {
        const { preview, filePath } = response;

        // Store preview data and file path
        setExcelPreview(preview);
        setUploadedFilePath(filePath);

        // Show column mapping modal
        setShowColumnMapping(true);
      }
    } catch (error: any) {
      console.error('Preview failed:', error);
      setToastInfo({
        message: error.response?.data?.message || 'Failed to preview Excel file',
        type: 'error'
      });
    } finally {
      setImporting(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleColumnMapping = async (columnMapping: Record<string, number>) => {
    if (!uploadedFilePath) {
      setToastInfo({
        message: 'File path not found. Please upload the file again.',
        type: 'error'
      });
      return;
    }

    setImporting(true);
    try {
      const response = await callCenterService.importVotersWithMapping(uploadedFilePath, columnMapping);

      if (response.success) {
        const { results } = response;
        setToastInfo({
          message: `Import completed! ${results.inserted} records imported, ${results.duplicatesSkipped} duplicates skipped`,
          type: 'success'
        });

        // Reset form and refresh data
        setImportFile(null);
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Close modals and clear state
        setShowColumnMapping(false);
        setExcelPreview(null);
        setUploadedFilePath('');

        // Refresh stats
        await fetchStats();

        // Show detailed results
        console.log('Import results:', results);
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      setToastInfo({
        message: error.response?.data?.message || 'Import failed',
        type: 'error'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCancelMapping = () => {
    setShowColumnMapping(false);
    setExcelPreview(null);
    setUploadedFilePath('');
    setImporting(false);

    // Reset file input
    setImportFile(null);
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Center Administration</h1>
        <p className="text-gray-600">Manage voter data import and volunteer assignments</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('navigation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'navigation'
                ? 'border-[#006837] text-[#006837]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Navigation className="w-4 h-4 inline mr-2" />
              Navigate Voters
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats'
                ? 'border-[#006837] text-[#006837]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'import'
                ? 'border-[#006837] text-[#006837]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Import Data
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'volunteers'
                ? 'border-[#006837] text-[#006837]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Volunteers
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <div>
              <CallCenterAdminNavigator />
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Summary Stats Row */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-xs font-medium text-blue-600">Total Voters</p>
                        <p className="text-lg font-bold text-blue-900">{formatNumber(stats.total_voters)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-xs font-medium text-green-600">Confirmed</p>
                        <p className="text-lg font-bold text-green-900">{formatNumber(stats.confirmed_voters)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-xs font-medium text-yellow-600">Called</p>
                        <p className="text-lg font-bold text-yellow-900">{formatNumber(stats.recently_called)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Phone className="w-6 h-6 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-xs font-medium text-purple-600">Polling Units</p>
                        <p className="text-lg font-bold text-purple-900">{formatNumber(stats.polling_units_count)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voter Statistics Table */}
              <VoterStatisticsTable />

              {/* Recent Imports - Smaller Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-base font-medium text-gray-900 mb-3">Recent Imports</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Imported By</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Records</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentImports.slice(0, 5).map((importRecord, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-gray-900">{formatDate(importRecord.import_date)}</td>
                          <td className="px-3 py-2 text-gray-900">{importRecord.imported_by_name}</td>
                          <td className="px-3 py-2 text-gray-900">{formatNumber(importRecord.records_imported)}</td>
                        </tr>
                      ))}
                      {recentImports.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                            No imports found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Excel File Requirements</h4>
                    <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                      <li>File must be in .xlsx or .xls format</li>
                      <li>Required columns: STATE, LGA, WARD, POLLING UNIT, PHONE NUMBER</li>
                      <li>Optional: POLLING UNIT CODE</li>
                      <li>Phone numbers should be in Nigerian format</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Voter Data</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="excel-file" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Excel File
                    </label>
                    <input
                      id="excel-file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#006837] file:text-white hover:file:bg-[#00592e] cursor-pointer"
                    />
                  </div>

                  {importFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        Selected: <span className="font-medium">{importFile.name}</span> ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${!importFile || importing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#006837] text-white hover:bg-[#00592e]'
                      }`}
                  >
                    {importing ? 'Importing...' : 'Import Data'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assigned Call Center Volunteers
                </h3>
                <p className="text-sm text-gray-600">
                  {volunteers.filter(v => v.is_active).length} active assignments
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Volunteer Management</h4>
                    <p className="mt-1 text-sm text-blue-700">
                      To assign volunteers to call center locations, go to Admin → User Management → Edit User and use the "Call Center Assignment" section.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Volunteer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Assignment Location</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Assigned Voters</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Calls Made</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {volunteers.filter(v => v.is_active).map((volunteer) => (
                      <tr key={volunteer.id}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
                            <p className="text-xs text-gray-500">
                              Assigned by: {volunteer.assigned_by_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(volunteer.assigned_at)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-900">{volunteer.email}</p>
                            <p className="text-sm text-gray-600">{volunteer.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{volunteer.lga}</p>
                            <p className="text-sm text-gray-600">{volunteer.ward}</p>
                            <p className="text-xs text-gray-500">
                              {volunteer.polling_unit} ({volunteer.polling_unit_code})
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-semibold text-blue-600">
                            {formatNumber(volunteer.voter_count)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-semibold text-green-600">
                            {formatNumber(volunteer.total_calls_made)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {volunteer.voter_count > 0 ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {Math.round((volunteer.total_calls_made / volunteer.voter_count) * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">completion rate</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {volunteers.filter(v => v.is_active).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <div className="text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h4 className="text-lg font-medium mb-2">No Active Volunteer Assignments</h4>
                            <p className="text-sm">
                              Volunteers can be assigned to call center locations through the User Management section.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column Mapping Modal */}
      {showColumnMapping && excelPreview && (
        <ColumnMappingModal
          preview={excelPreview}
          onMapping={handleColumnMapping}
          onCancel={handleCancelMapping}
          loading={importing}
        />
      )}



      {/* Toast */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}
    </div>
  );
};

export default CallCenterAdmin;