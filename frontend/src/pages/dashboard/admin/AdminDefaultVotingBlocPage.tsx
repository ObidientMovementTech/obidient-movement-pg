import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Plus, Trash2, Settings, Upload, Link, X } from "lucide-react";
import { useUserContext } from "../../../context/UserContext";
import { statesLGAWardList } from "../../../utils/StateLGAWard";
import RichTextEditor from "../../../components/inputs/RichTextEditor";
import Toast from "../../../components/Toast";
import Loading from "../../../components/Loader";
import {
  getDefaultSettings,
  updateDefaultSettings,
  uploadBannerImage,
  validateImageFile
} from "../../../services/adminDefaultVotingBlocService";

interface DefaultSettings {
  id?: string;
  descriptionTemplate: string;
  targetCandidate: string;
  scope: string;
  goals: string[];
  toolkits: Array<{
    label: string;
    url: string;
    type: string;
  }>;
  bannerImageUrl: string;
  richDescriptionTemplate: string;
  locationDefaults: {
    useUserLocation: boolean;
    defaultState: string;
    defaultLga: string;
    defaultWard: string;
  };
}

export default function AdminDefaultVotingBlocPage() {
  const { profile } = useUserContext();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<DefaultSettings>({
    descriptionTemplate: "",
    targetCandidate: "Peter Obi",
    scope: "National",
    goals: [],
    toolkits: [],
    bannerImageUrl: "",
    richDescriptionTemplate: "",
    locationDefaults: {
      useUserLocation: true,
      defaultState: "",
      defaultLga: "",
      defaultWard: ""
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [lgaOptions, setLgaOptions] = useState<string[]>([]);
  const [wardOptions, setWardOptions] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      setToast({ message: "Access denied. Admin privileges required.", type: "error" });
      navigate("/dashboard");
      return;
    }
  }, [profile, navigate]);

  // Load default settings
  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDefaultSettings();
    }
  }, [profile]);

  // Update LGA options when state changes
  useEffect(() => {
    if (settings.locationDefaults.defaultState) {
      const stateData = statesLGAWardList.find(s => s.state === settings.locationDefaults.defaultState);
      setLgaOptions(stateData ? stateData.lgas.map(lga => lga.lga) : []);

      // Reset LGA and Ward if state changed
      if (settings.locationDefaults.defaultLga) {
        setSettings(prev => ({
          ...prev,
          locationDefaults: {
            ...prev.locationDefaults,
            defaultLga: "",
            defaultWard: ""
          }
        }));
      }
    } else {
      setLgaOptions([]);
      setWardOptions([]);
    }
  }, [settings.locationDefaults.defaultState]);

  // Update Ward options when LGA changes
  useEffect(() => {
    if (settings.locationDefaults.defaultState && settings.locationDefaults.defaultLga) {
      const stateData = statesLGAWardList.find(s => s.state === settings.locationDefaults.defaultState);
      const lgaData = stateData?.lgas.find(lga => lga.lga === settings.locationDefaults.defaultLga);
      setWardOptions(lgaData ? lgaData.wards : []);

      // Reset Ward if LGA changed
      if (settings.locationDefaults.defaultWard) {
        setSettings(prev => ({
          ...prev,
          locationDefaults: {
            ...prev.locationDefaults,
            defaultWard: ""
          }
        }));
      }
    } else {
      setWardOptions([]);
    }
  }, [settings.locationDefaults.defaultLga]);

  const fetchDefaultSettings = async () => {
    try {
      setLoading(true);
      const data = await getDefaultSettings();

      if (data.success && data.settings) {
        // Parse JSON fields if they're strings
        const parsedSettings = {
          ...data.settings,
          goals: typeof data.settings.goals === 'string'
            ? JSON.parse(data.settings.goals)
            : data.settings.goals || [],
          toolkits: typeof data.settings.toolkits === 'string'
            ? JSON.parse(data.settings.toolkits)
            : data.settings.toolkits || [],
          locationDefaults: typeof data.settings.locationDefaults === 'string'
            ? JSON.parse(data.settings.locationDefaults)
            : data.settings.locationDefaults || {
              useUserLocation: true,
              defaultState: "",
              defaultLga: "",
              defaultWard: ""
            }
        };
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error fetching default settings:', error);
      setToast({
        message: error instanceof Error ? error.message : "Failed to load default settings",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await updateDefaultSettings(settings);

      if (data.success) {
        setToast({ message: "Default settings saved successfully!", type: "success" });
      }
    } catch (error) {
      console.error('Error saving default settings:', error);
      setToast({
        message: error instanceof Error ? error.message : "Failed to save settings",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () => {
    setSettings(prev => ({
      ...prev,
      goals: [...prev.goals, ""]
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const removeGoal = (index: number) => {
    setSettings(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const addToolkit = () => {
    setSettings(prev => ({
      ...prev,
      toolkits: [...prev.toolkits, { label: "", url: "", type: "Toolkit" }]
    }));
  };

  const updateToolkit = (index: number, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      toolkits: prev.toolkits.map((toolkit, i) =>
        i === index ? { ...toolkit, [field]: value } : toolkit
      )
    }));
  };

  const removeToolkit = (index: number) => {
    setSettings(prev => ({
      ...prev,
      toolkits: prev.toolkits.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file using the service
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setToast({ message: validation.error || "Invalid file", type: "error" });
      return;
    }

    try {
      setUploading(true);
      const data = await uploadBannerImage(file);

      if (data.success) {
        setSettings(prev => ({ ...prev, bannerImageUrl: data.imageUrl }));
        setToast({ message: "Image uploaded successfully!", type: "success" });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setToast({
        message: error instanceof Error ? error.message : "Failed to upload image",
        type: "error"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearBannerImage = () => {
    setSettings(prev => ({ ...prev, bannerImageUrl: "" }));
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings size={24} />
            Manage Default Voting Bloc Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure the default settings for auto-generated voting blocs for new users
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Candidate *
                </label>
                <input
                  type="text"
                  value={settings.targetCandidate}
                  onChange={(e) => setSettings(prev => ({ ...prev, targetCandidate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scope
                </label>
                <select
                  value={settings.scope}
                  onChange={(e) => setSettings(prev => ({ ...prev, scope: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="National">National</option>
                  <option value="Regional">Regional</option>
                  <option value="State">State</option>
                  <option value="Local">Local</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description Template *
              </label>
              <textarea
                value={settings.descriptionTemplate}
                onChange={(e) => setSettings(prev => ({ ...prev, descriptionTemplate: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter the default description template for auto-generated voting blocs..."
                required
              />
            </div>
          </div>

          {/* Rich Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rich Description Template</h3>
            <RichTextEditor
              content={settings.richDescriptionTemplate}
              onChange={(value) => setSettings(prev => ({ ...prev, richDescriptionTemplate: value }))}
              placeholder="Enter rich description template with formatting..."
            />
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Default Goals</h3>
              <button
                type="button"
                onClick={addGoal}
                className="flex items-center gap-2 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
              >
                <Plus size={16} />
                Add Goal
              </button>
            </div>

            <div className="space-y-3">
              {settings.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`Goal ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toolkits */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Default Resources & Toolkits</h3>
              <button
                type="button"
                onClick={addToolkit}
                className="flex items-center gap-2 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
              >
                <Plus size={16} />
                Add Resource
              </button>
            </div>

            <div className="space-y-4">
              {settings.toolkits.map((toolkit, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={toolkit.label}
                      onChange={(e) => updateToolkit(index, 'label', e.target.value)}
                      placeholder="Resource Label"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      value={toolkit.url}
                      onChange={(e) => updateToolkit(index, 'url', e.target.value)}
                      placeholder="Resource URL"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <select
                        value={toolkit.type}
                        onChange={(e) => updateToolkit(index, 'type', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Toolkit">Toolkit</option>
                        <option value="Policy">Policy</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeToolkit(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Defaults */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Defaults</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useUserLocation"
                  checked={settings.locationDefaults.useUserLocation}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    locationDefaults: {
                      ...prev.locationDefaults,
                      useUserLocation: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="useUserLocation" className="text-sm text-gray-700">
                  Use user's location from profile when available
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default State
                  </label>
                  <select
                    value={settings.locationDefaults.defaultState}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      locationDefaults: {
                        ...prev.locationDefaults,
                        defaultState: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {statesLGAWardList.map((state) => (
                      <option key={state.state} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default LGA
                  </label>
                  <select
                    value={settings.locationDefaults.defaultLga}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      locationDefaults: {
                        ...prev.locationDefaults,
                        defaultLga: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={!settings.locationDefaults.defaultState}
                  >
                    <option value="">Select LGA</option>
                    {lgaOptions.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Ward
                  </label>
                  <select
                    value={settings.locationDefaults.defaultWard}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      locationDefaults: {
                        ...prev.locationDefaults,
                        defaultWard: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={!settings.locationDefaults.defaultLga}
                  >
                    <option value="">Select Ward</option>
                    {wardOptions.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Banner Image</h3>

            {/* Upload Mode Toggle */}
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${imageUploadMode === 'url'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Link size={16} />
                  Use URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${imageUploadMode === 'upload'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Upload size={16} />
                  Upload File
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {imageUploadMode === 'url' ? (
                /* URL Input */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={settings.bannerImageUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, bannerImageUrl: e.target.value }))}
                      placeholder="Enter banner image URL..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {settings.bannerImageUrl && (
                      <button
                        type="button"
                        onClick={clearBannerImage}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* File Upload */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Banner Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <div className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${uploading
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'hover:bg-gray-50 cursor-pointer'
                        }`}>
                        <Upload size={16} />
                        {uploading ? 'Uploading...' : 'Choose Image'}
                      </div>
                    </label>

                    {settings.bannerImageUrl && (
                      <button
                        type="button"
                        onClick={clearBannerImage}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        <X size={16} />
                        Remove
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>
              )}

              {/* Preview */}
              {settings.bannerImageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative">
                    <img
                      src={settings.bannerImageUrl}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setToast({ message: "Failed to load image preview", type: "error" });
                      }}
                    />
                    <button
                      type="button"
                      onClick={clearBannerImage}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
