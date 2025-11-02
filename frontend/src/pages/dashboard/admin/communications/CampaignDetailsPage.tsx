import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  StopCircle,
  RefreshCw
} from "lucide-react";
import { getCampaignById, cancelCampaign, CampaignStats } from "../../../../services/communicationsService";
import { format } from "date-fns";

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchStats = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getCampaignById(parseInt(id));
      setStats(data);
      setError(null);
    } catch (err) {
      setError("Failed to load campaign details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 seconds if campaign is processing
    const interval = setInterval(() => {
      if (stats?.campaign.status === "processing" || stats?.campaign.status === "pending") {
        fetchStats();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, stats?.campaign.status]);

  const handleCancel = async () => {
    if (!id || !confirm("Are you sure you want to cancel this campaign?")) return;

    try {
      setCancelling(true);
      await cancelCampaign(parseInt(id));
      fetchStats();
    } catch (err) {
      alert("Failed to cancel campaign");
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

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
        <p className="text-red-700">{error || "Campaign not found"}</p>
        <Link to="/dashboard/admin/communications/campaigns" className="text-green-600 hover:underline mt-2 inline-block">
          ← Back to Campaigns
        </Link>
      </div>
    );
  }

  const { campaign } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/admin/communications/campaigns"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Created {format(new Date(campaign.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {(campaign.status === "processing" || campaign.status === "pending") && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <StopCircle className="w-4 h-4" />
              {cancelling ? "Cancelling..." : "Cancel Campaign"}
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.status === "completed"
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
          {campaign.status.toUpperCase()}
        </span>
        <span className="text-sm text-gray-600">
          {campaign.type.toUpperCase()} Campaign
        </span>
      </div>

      {/* Progress Bar */}
      {(campaign.status === "processing" || campaign.status === "pending") && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{stats.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Processing batch {campaign.processed_batches} of {campaign.total_batches}
            {stats.estimatedTimeRemaining && ` • ${stats.estimatedTimeRemaining} remaining`}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Recipients</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{campaign.total_recipients.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Delivered</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{campaign.delivered_count.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.deliveryRate.toFixed(1)}% delivery rate</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Failed</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{campaign.failed_count.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Total Cost</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦{parseFloat(campaign.total_cost.toString()).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">
            ₦{stats.avgCostPerRecipient.toFixed(2)} per recipient
          </p>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target LGAs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Target LGAs</h2>
          <div className="flex flex-wrap gap-2">
            {campaign.lgas.map((lga) => (
              <span
                key={lga}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {lga}
              </span>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900 font-medium">
                {format(new Date(campaign.created_at), "MMM d, yyyy h:mm a")}
              </span>
            </div>
            {campaign.started_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Started:</span>
                <span className="text-gray-900 font-medium">
                  {format(new Date(campaign.started_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            )}
            {campaign.completed_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Completed:</span>
                <span className="text-gray-900 font-medium">
                  {format(new Date(campaign.completed_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Template */}
      {campaign.message_template && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Template</h2>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700">
            {campaign.message_template}
          </div>
        </div>
      )}

      {/* Error Message */}
      {campaign.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
          <p className="text-red-700 text-sm">{campaign.error_message}</p>
        </div>
      )}
    </div>
  );
}
