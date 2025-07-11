import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
import Loading from "../../components/Loader";
import ProfileHero from "./ProfileHero";
import { useUser } from "../../context/UserContext";
import KYCFormWrapper from "./kyc/KYCFormWrapper";

// Profile section components
import AccountOverview from "./sections/AccountOverview";
import SecurityVerification from "./sections/SecurityVerification";
import AccountSettings from "./sections/AccountSettings";
import ActivityHistory from "./sections/ActivityHistory";
import NotificationSettings from "./sections/NotificationSettings";

export default function ProfilePage() {
  const { profile, isLoading } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isKYCMode, setIsKYCMode] = useState<boolean>(false);

  useEffect(() => {
    console.log('ProfilePage: activeTab changed to:', activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Exit KYC mode when changing tabs
    if (isKYCMode) {
      setIsKYCMode(false);
    }
  };

  const handleKYCStart = () => {
    setIsKYCMode(true);
  };

  const handleKYCExit = () => {
    setIsKYCMode(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!profile) {
    navigate("/");
    return null;
  }

  // If in KYC mode, show KYC form instead of normal content
  if (isKYCMode) {
    return (
      <div className="flex flex-col items-center w-full md:w-full max-w-[1440px] mx-auto gap-4 py-8">
        <div className="text-black p-2 w-full rounded-xl mb-8 flex flex-col items-start">
          <KYCFormWrapper setActivePage={() => handleKYCExit()} />
        </div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return <AccountOverview profile={profile} setActivePage={handleTabChange} />;
      case "Security":
        return <SecurityVerification profile={profile} onKYCStart={handleKYCStart} />;
      case "Settings":
        return <AccountSettings profile={profile} />;
      case "Activity":
        return <ActivityHistory profile={profile} />;
      case "Notifications":
        return <NotificationSettings profile={profile} />;
      default:
        return <AccountOverview profile={profile} setActivePage={handleTabChange} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full md:w-full max-w-[1440px] mx-auto gap-4 py-8">
      {/* Profile Hero Section */}
      <div className="w-full mb-4">
        <ProfileHero
          profile={profile}
          onKYCStart={handleKYCStart}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Profile Tab Navigation */}
      <div className="w-full bg-white rounded-t-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabChange("Overview")}
            className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === "Overview"
              ? "text-[#006837] border-b-2 border-[#006837]"
              : "text-gray-600 hover:text-[#006837]"
              }`}
          >
            Account Overview
          </button>
          <button
            onClick={() => handleTabChange("Security")}
            className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === "Security"
              ? "text-[#006837] border-b-2 border-[#006837]"
              : "text-gray-600 hover:text-[#006837]"
              }`}
          >
            Security & Verification
          </button>
          <button
            onClick={() => handleTabChange("Settings")}
            className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === "Settings"
              ? "text-[#006837] border-b-2 border-[#006837]"
              : "text-gray-600 hover:text-[#006837]"
              }`}
          >
            Account Settings
          </button>
          <button
            onClick={() => handleTabChange("Activity")}
            className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === "Activity"
              ? "text-[#006837] border-b-2 border-[#006837]"
              : "text-gray-600 hover:text-[#006837]"
              }`}
          >
            Activity
          </button>
          <button
            onClick={() => handleTabChange("Notifications")}
            className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === "Notifications"
              ? "text-[#006837] border-b-2 border-[#006837]"
              : "text-gray-600 hover:text-[#006837]"
              }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full bg-white rounded-b-xl shadow-md p-6 border border-gray-200 border-t-0">
        {renderTabContent()}
      </div>
    </div>
  );
}
