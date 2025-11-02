import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  MessageSquare,
  Phone,
  RefreshCw,
  Search
} from "lucide-react";
import { getCampaigns, CommunicationCampaign } from "../../../../services/communicationsService";
import { format } from "date-fns";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "sms" | "voice">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const type = filter === "all" ? undefined : filter;
      const data = await getCampaigns(type);
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError("Failed to load campaigns");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium ${filter === "all"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
          >
            All Campaigns
          </button>
          <button
            onClick={() => setFilter("sms")}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${filter === "sms"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            SMS
          </button>
          <button
            onClick={() => setFilter("voice")}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${filter === "voice"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
          >
            <Phone className="w-4 h-4" />
            Voice
          </button>
        </div>

        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No campaigns found matching your search" : "No campaigns yet"}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/dashboard/admin/communications/create/sms"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create SMS Campaign
            </Link>
            <Link
              to="/dashboard/admin/communications/create/voice"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Voice Campaign
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/dashboard/admin/communications/campaigns/${campaign.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {campaign.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      {campaign.lgas.slice(0, 2).join(", ")}
                      {campaign.lgas.length > 2 && ` +${campaign.lgas.length - 2} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {campaign.type === "sms" ? (
                        <>
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <span className="text-sm">SMS</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Voice</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.total_recipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${campaign.total_recipients > 0
                              ? (campaign.delivered_count / campaign.total_recipients) * 100
                              : 0
                              }%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-600">
                        {campaign.delivered_count}/{campaign.total_recipients}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{parseFloat(campaign.total_cost.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(campaign.created_at), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
