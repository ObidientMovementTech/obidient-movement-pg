import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { UserProfile } from "../../../context/UserContext";
import { getNotificationSettings, updateNotificationSettings } from "../../../services/notificationService";

interface NotificationSettingsProps {
  profile: UserProfile;
}

export default function NotificationSettings({ profile }: NotificationSettingsProps) {
  // State for notification settings
  const [emailSettings, setEmailSettings] = useState({
    accountUpdates: true,
    surveysPolls: false,
    leadersUpdates: true
  });

  const [pushSettings, setPushSettings] = useState({
    accountUpdates: true,
    surveysPolls: true,
    leadersUpdates: false
  });

  const [websiteSettings, setWebsiteSettings] = useState({
    desktopNotifications: true,
    soundAlerts: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch notification settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await getNotificationSettings();

        // If the API returns settings, update the state
        if (data && data.email) {
          setEmailSettings(data.email);
        }

        if (data && data.push) {
          setPushSettings(data.push);
        }

        if (data && data.website) {
          setWebsiteSettings(data.website);
        }
      } catch (error) {
        console.error("Failed to fetch notification settings:", error);
        // If API call fails, we keep using the default settings
        toast.error("Failed to load notification settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Toggle email notification setting
  const toggleEmailSetting = (key: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle push notification setting
  const togglePushSetting = (key: keyof typeof pushSettings) => {
    setPushSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle website notification setting
  const toggleWebsiteSetting = (key: keyof typeof websiteSettings) => {
    setWebsiteSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      setIsSaving(true);

      // Create a payload with all settings
      const settingsPayload = {
        email: emailSettings,
        push: pushSettings,
        website: websiteSettings
      };

      // Call the API to save settings
      await updateNotificationSettings(settingsPayload);

      toast.success("Notification settings saved successfully");
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      toast.error("Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
        <p className="opacity-90">Customize how and when you receive updates from Obidient Movement.</p>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Email Notifications</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">
            Notifications will be sent to: <strong>{profile.email || "No email provided"}</strong>
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-800 font-medium">Account Updates</h4>
                <p className="text-sm text-gray-500 mt-1">Security alerts, password changes, and account notices</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-account-updates"
                  checked={emailSettings.accountUpdates}
                  onChange={() => toggleEmailSetting("accountUpdates")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-gray-800 font-medium">Surveys & Polls</h4>
                <p className="text-sm text-gray-500 mt-1">Invitations to participate in surveys and opinion polls</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-surveys"
                  checked={emailSettings.surveysPolls}
                  onChange={() => toggleEmailSetting("surveysPolls")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-gray-800 font-medium">Leaders Updates</h4>
                <p className="text-sm text-gray-500 mt-1">Information and updates about your representatives</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-leaders"
                  checked={emailSettings.leadersUpdates}
                  onChange={() => toggleEmailSetting("leadersUpdates")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Push Notifications</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">
            Push notifications will be sent to your browser and mobile app (if installed)
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-800 font-medium">Account Updates</h4>
                <p className="text-sm text-gray-500 mt-1">Security alerts, password changes, and account notices</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-account-updates"
                  checked={pushSettings.accountUpdates}
                  onChange={() => togglePushSetting("accountUpdates")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-gray-800 font-medium">Surveys & Polls</h4>
                <p className="text-sm text-gray-500 mt-1">Invitations to participate in surveys and opinion polls</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-surveys"
                  checked={pushSettings.surveysPolls}
                  onChange={() => togglePushSetting("surveysPolls")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-gray-800 font-medium">Leaders Updates</h4>
                <p className="text-sm text-gray-500 mt-1">Information and updates about your representatives</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-leaders"
                  checked={pushSettings.leadersUpdates}
                  onChange={() => togglePushSetting("leadersUpdates")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Website Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Website Preferences</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-800 font-medium">Desktop Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">Show notifications in your browser while on the website</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="desktop-notifications"
                  checked={websiteSettings.desktopNotifications}
                  onChange={() => toggleWebsiteSetting("desktopNotifications")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-gray-800 font-medium">Sound Alerts</h4>
                <p className="text-sm text-gray-500 mt-1">Play sound when receiving notifications</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sound-alerts"
                  checked={websiteSettings.soundAlerts}
                  onChange={() => toggleWebsiteSetting("soundAlerts")}
                  className="h-4 w-4 text-[#006837] focus:ring-[#006837] border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveNotificationSettings}
          disabled={isLoading || isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${isLoading || isSaving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#006837] hover:bg-[#005229] text-white"
            }`}
        >
          {isSaving && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isLoading ? "Loading..." : isSaving ? "Saving..." : "Save All Notification Settings"}
        </button>
      </div>
    </div>
  );
}
