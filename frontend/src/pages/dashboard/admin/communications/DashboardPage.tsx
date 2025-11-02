import { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Activity
} from "lucide-react";
import { getDashboardStats, DashboardStats } from "../../../../services/communicationsService";
import { Link } from "react-router";
import { format } from "date-fns";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Failed to load dashboard stats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error || "Unable to load stats"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Campaigns */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCampaigns}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-gray-600">SMS: {stats.totalSmsCampaigns}</span>
            <span className="text-gray-600">Voice: {stats.totalVoiceCampaigns}</span>
          </div>
        </div>

        {/* Total Recipients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRecipients.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.deliveryRate.toFixed(1)}%</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {stats.totalDelivered}
            </span>
            <span className="text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {stats.totalFailed}
            </span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spend</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₦{stats.totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
        </div>
        <div className="p-6">
          {stats.recentCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No campaigns yet</p>
              <div className="mt-4 flex gap-3 justify-center">
                <Link
                  to="/dashboard/admin/communications/create/sms"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Create SMS Campaign
                </Link>
                <Link
                  to="/dashboard/admin/communications/create/voice"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Create Voice Campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  to={`/dashboard/admin/communications/campaigns/${campaign.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {campaign.type === "sms" ? (
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        ) : (
                          <Phone className="w-5 h-5 text-blue-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${campaign.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : campaign.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : campaign.status === "cancelled"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>{campaign.total_recipients.toLocaleString()} recipients</span>
                        <span>{campaign.lgas.length} LGA(s)</span>
                        <span>{format(new Date(campaign.created_at), "MMM d, yyyy")}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-6 text-sm">
                        <span className="text-green-600">
                          ✓ {campaign.delivered_count} delivered
                        </span>
                        <span className="text-red-600">
                          ✗ {campaign.failed_count} failed
                        </span>
                        <span className="text-gray-600">
                          ₦{parseFloat(campaign.total_cost.toString()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="pt-4 text-center">
                <Link
                  to="/dashboard/admin/communications/campaigns"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View All Campaigns →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/admin/communications/create/sms"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition-all"
        >
          <MessageSquare className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold">Create SMS Campaign</h3>
          <p className="mt-2 text-green-100">Send personalized text messages to supporters</p>
        </Link>

        <Link
          to="/dashboard/admin/communications/create/voice"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Phone className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold">Create Voice Campaign</h3>
          <p className="mt-2 text-blue-100">Make automated voice calls with custom audio</p>
        </Link>

        <Link
          to="/dashboard/admin/communications/audio"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <Activity className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold">Manage Audio Assets</h3>
          <p className="mt-2 text-purple-100">Upload and organize voice campaign audio files</p>
        </Link>
      </div>
    </div>
  );
}
