import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Phone, ArrowLeft, AlertCircle, Upload, Loader2, Users } from "lucide-react";
import {
  createVoiceCampaign,
  getAudioAssets,
  AudioAsset,
  getAvailableStates,
  getLgasForState,
  getVoterCount
} from "../../../../services/communicationsService";

export default function CreateVoiceCampaignPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLgas, setSelectedLgas] = useState<string[]>([]);
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<number | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic data from DB
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [voterCount, setVoterCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(false);

  // Fetch audio assets
  useEffect(() => {
    const fetchAudioAssets = async () => {
      try {
        const assets = await getAudioAssets();
        setAudioAssets(assets);
      } catch (err) {
        console.error("Failed to fetch audio assets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudioAssets();
  }, []);

  // Fetch available states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const availableStates = await getAvailableStates();
        setStates(availableStates);
      } catch (err) {
        console.error("Failed to fetch states:", err);
        setError("Failed to load available states");
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    if (!selectedState) {
      setLgas([]);
      setSelectedLgas([]);
      setVoterCount(0);
      return;
    }

    const fetchLgas = async () => {
      try {
        setLoadingLgas(true);
        const stateLgas = await getLgasForState(selectedState);
        setLgas(stateLgas);
        setSelectedLgas([]); // Reset selected LGAs when state changes
        setVoterCount(0);
      } catch (err) {
        console.error("Failed to fetch LGAs:", err);
        setError(`Failed to load LGAs for ${selectedState}`);
      } finally {
        setLoadingLgas(false);
      }
    };
    fetchLgas();
  }, [selectedState]);

  // Fetch voter count when LGAs change
  useEffect(() => {
    if (!selectedState || selectedLgas.length === 0) {
      setVoterCount(0);
      return;
    }

    const fetchVoterCount = async () => {
      try {
        setLoadingCount(true);
        const result = await getVoterCount(selectedState, selectedLgas);
        setVoterCount(result.voterCount);
      } catch (err) {
        console.error("Failed to fetch voter count:", err);
        setVoterCount(0);
      } finally {
        setLoadingCount(false);
      }
    };

    // Debounce to avoid too many requests
    const timer = setTimeout(fetchVoterCount, 500);
    return () => clearTimeout(timer);
  }, [selectedState, selectedLgas]);

  const handleLgaToggle = (lga: string) => {
    setSelectedLgas(prev =>
      prev.includes(lga) ? prev.filter(l => l !== lga) : [...prev, lga]
    );
  };

  const handleSelectAll = () => {
    setSelectedLgas(lgas);
  };

  const handleDeselectAll = () => {
    setSelectedLgas([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Campaign title is required");
      return;
    }
    if (!selectedState) {
      setError("Please select a state");
      return;
    }
    if (selectedLgas.length === 0) {
      setError("Please select at least one LGA");
      return;
    }
    if (!selectedAudioId && !fallbackUrl.trim()) {
      setError("Please select an audio file or provide a fallback URL");
      return;
    }
    if (voterCount === 0) {
      setError("No voters found for selected LGAs. Please check your selection.");
      return;
    }

    try {
      setSubmitting(true);
      const campaign = await createVoiceCampaign({
        title: title.trim(),
        lgas: selectedLgas,
        audioAssetId: selectedAudioId || undefined,
        fallbackAudioUrl: fallbackUrl.trim() || undefined,
      });
      navigate(`/dashboard/admin/communications/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create campaign");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/admin/communications")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Voice Campaign</h1>
            <p className="text-sm text-gray-600 mt-1">Make automated voice calls to supporters</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Campaign Title */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., GOTV Reminder Calls"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Select State */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select State *
          </label>
          {loadingStates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading states...</span>
            </div>
          ) : !states || states.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              No states found. Please upload voter data first.
            </div>
          ) : (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Choose a state --</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Select LGAs */}
        {selectedState && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Target LGAs * ({selectedLgas?.length || 0} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={loadingLgas}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {loadingLgas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading LGAs...</span>
              </div>
            ) : !lgas || lgas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                No LGAs found for {selectedState}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lgas.map((lga) => (
                  <label
                    key={lga}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${selectedLgas.includes(lga)
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLgas.includes(lga)}
                      onChange={() => handleLgaToggle(lga)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{lga}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Voter Count Display */}
            {selectedLgas && selectedLgas.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {loadingCount ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating recipients...
                      </span>
                    ) : (
                      <>
                        <span className="text-lg">{voterCount.toLocaleString()}</span> recipients will receive this call
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Audio Message
            </label>
            <button
              type="button"
              onClick={() => navigate("/dashboard/admin/communications/audio")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
              Upload New Audio
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !audioAssets || audioAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No audio files uploaded yet.</p>
              <button
                type="button"
                onClick={() => navigate("/dashboard/admin/communications/audio")}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload an audio file →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {audioAssets.map((asset) => (
                <label
                  key={asset.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedAudioId === asset.id
                    ? "bg-blue-50 border-blue-500"
                    : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="audio"
                    checked={selectedAudioId === asset.id}
                    onChange={() => setSelectedAudioId(asset.id)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{asset.original_name}</p>
                    <p className="text-sm text-gray-500">
                      {asset.duration_seconds ? `${asset.duration_seconds}s` : "Duration unknown"}
                    </p>
                  </div>
                  <audio controls src={asset.file_url} className="max-w-xs" />
                </label>
              ))}
            </div>
          )}

          {/* Fallback URL */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fallback Audio URL (Optional)
            </label>
            <input
              type="url"
              value={fallbackUrl}
              onChange={(e) => setFallbackUrl(e.target.value)}
              placeholder="https://example.com/audio.mp3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used as backup if the selected audio asset is unavailable
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/dashboard/admin/communications")}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Phone className="w-4 h-4" />
            {submitting ? "Creating Campaign..." : "Create & Start Calling"}
          </button>
        </div>
      </form>
    </div>
  );
}
