import { memo } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Download, Image as ImageIcon } from 'lucide-react';
import { PollingUnitData, ElectionParty } from '../../../../services/resultsDashboardService';
import PartyResultsChart from '../../../../components/PartyResultsChart';

interface PollingUnitDetailViewProps {
  pollingUnit: PollingUnitData;
  parties: ElectionParty[];
  onImagePreview: (imageUrl: string, title: string) => void;
}

/**
 * Polling Unit Detail View
 * Shows comprehensive information about a specific polling unit
 */
function PollingUnitDetailView({ pollingUnit, parties, onImagePreview }: PollingUnitDetailViewProps) {
  const chartData = (pollingUnit.partyVotes || []).map(pv => {
    const partyInfo = parties.find(p => p.party_code === pv.party);
    return {
      party: pv.party,
      votes: pv.votes,
      color: partyInfo?.color
    };
  });

  const stats = pollingUnit.resultData?.stats || {};
  const agent = pollingUnit.agent;

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{pollingUnit.puName}</h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {pollingUnit.ward}, {pollingUnit.lga}
              </span>
              <span>•</span>
              <span>Code: {pollingUnit.puCode}</span>
            </div>
          </div>

          {pollingUnit.lastUpdated && (
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Last updated:
              </div>
              <div className="font-medium text-gray-700">
                {new Date(pollingUnit.lastUpdated).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Information */}
      {agent && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#8cc63f]" />
            Agent Information
          </h3>

          <div className="flex items-start gap-6">
            {/* Agent Photo */}
            <div className="flex-shrink-0">
              {agent.photo ? (
                <img
                  src={agent.photo}
                  alt={agent.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Agent Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{agent.name}</p>
              </div>

              {agent.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <a
                    href={`tel:${agent.phone}`}
                    className="font-semibold text-[#8cc63f] hover:text-[#7ab52f] flex items-center gap-1"
                  >
                    <Phone className="w-4 h-4" />
                    {agent.phone}
                  </a>
                </div>
              )}

              {agent.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${agent.email}`}
                    className="font-semibold text-[#8cc63f] hover:text-[#7ab52f] flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    {agent.email}
                  </a>
                </div>
              )}

              {agent.designation && (
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{agent.designation}</p>
                </div>
              )}

              {agent.supportGroup && (
                <div>
                  <p className="text-sm text-gray-600">Support Group</p>
                  <p className="font-semibold text-gray-900">{agent.supportGroup}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {pollingUnit.hasResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Statistics</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Registered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.registered || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Accredited</p>
              <p className="text-2xl font-bold text-blue-700">{stats.accredited || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Valid Votes</p>
              <p className="text-2xl font-bold text-green-700">{stats.valid || 0}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{stats.rejected || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Cast</p>
              <p className="text-2xl font-bold text-purple-700">{stats.total || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Party Results Chart */}
      {pollingUnit.hasResults && chartData.length > 0 && (
        <PartyResultsChart
          data={chartData}
          title="Party-wise Results"
          showPercentages={true}
          maxHeight="500px"
        />
      )}

      {/* EC8A Form and Evidence */}
      {pollingUnit.ec8aPhoto && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#8cc63f]" />
            EC8A Form & Evidence
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* EC8A Form - Featured */}
            <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-lg p-4 border-2 border-[#8cc63f]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Form EC8A (Primary Evidence)</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onImagePreview(pollingUnit.ec8aPhoto!, 'EC8A Form')}
                    className="px-3 py-1.5 bg-[#8cc63f] hover:bg-[#7ab52f] text-white rounded-lg text-sm transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownloadImage(pollingUnit.ec8aPhoto!, `EC8A_${pollingUnit.puCode}.jpg`)}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <img
                src={pollingUnit.ec8aPhoto}
                alt="EC8A Form"
                className="w-full h-64 object-contain bg-white rounded border border-gray-200 cursor-pointer"
                onClick={() => onImagePreview(pollingUnit.ec8aPhoto!, 'EC8A Form')}
              />
            </div>

            {/* Additional Evidence Photos */}
            {pollingUnit.evidencePhotos && pollingUnit.evidencePhotos.length > 1 && (
              <>
                {pollingUnit.evidencePhotos.slice(1).map((photo, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">Evidence {index + 1}</h4>
                      <button
                        onClick={() => handleDownloadImage(photo, `Evidence_${index + 1}_${pollingUnit.puCode}.jpg`)}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={photo}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover bg-white rounded border border-gray-200 cursor-pointer"
                      onClick={() => onImagePreview(photo, `Evidence ${index + 1}`)}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Status Message if No Results */}
      {!pollingUnit.hasResults && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-800">
            {pollingUnit.hasSetup
              ? 'Polling unit setup completed. Awaiting result submission.'
              : 'No data submitted for this polling unit yet.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(PollingUnitDetailView);
