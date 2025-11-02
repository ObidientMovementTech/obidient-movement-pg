import { Routes, Route, Link, useLocation } from "react-router";
import {
  MessageSquare,
  Phone,
  List,
  Music,
  Home
} from "lucide-react";
import CampaignsListPage from "./CampaignsListPage";
import CreateSMSCampaignPage from "./CreateSMSCampaignPage";
import CreateVoiceCampaignPage from "./CreateVoiceCampaignPage";
import CampaignDetailsPage from "./CampaignDetailsPage";
import AudioAssetsPage from "./AudioAssetsPage";
import DashboardPage from "./DashboardPage";

export default function CommunicationsPage() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-green-600" />
              Bulk Communications
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Send bulk SMS and voice calls to mobilize supporters across LGAs
            </p>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-8 -mb-px">
            <Link
              to="/dashboard/admin/communications"
              className={`${location.pathname === "/dashboard/admin/communications"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/dashboard/admin/communications/campaigns"
              className={`${isActive("/campaigns") && !location.pathname.includes("/create")
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <List className="w-4 h-4" />
              All Campaigns
            </Link>
            <Link
              to="/dashboard/admin/communications/create/sms"
              className={`${location.pathname.includes("/create/sms")
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <MessageSquare className="w-4 h-4" />
              Create SMS
            </Link>
            <Link
              to="/dashboard/admin/communications/create/voice"
              className={`${location.pathname.includes("/create/voice")
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Phone className="w-4 h-4" />
              Create Voice
            </Link>
            <Link
              to="/dashboard/admin/communications/audio"
              className={`${isActive("/audio")
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Music className="w-4 h-4" />
              Audio Assets
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="campaigns" element={<CampaignsListPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailsPage />} />
          <Route path="create/sms" element={<CreateSMSCampaignPage />} />
          <Route path="create/voice" element={<CreateVoiceCampaignPage />} />
          <Route path="audio" element={<AudioAssetsPage />} />
        </Routes>
      </div>
    </div>
  );
}
