import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Send, ArrowLeft, AlertCircle, Loader2, Users } from "lucide-react";
import {
  createSMSCampaign,
  getAvailableStates,
  getLgasForState,
  getVoterCount
} from "../../../../services/communicationsService";

export default function CreateSMSCampaignPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLgas, setSelectedLgas] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic data from DB
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [voterCount, setVoterCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(false);

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
        // Don't show error, just keep count at 0
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
    if (!messageTemplate.trim()) {
      setError("Message template is required");
      return;
    }
    if (voterCount === 0) {
      setError("No voters found for selected LGAs. Please check your selection.");
      return;
    }

    try {
      setSubmitting(true);
      const campaign = await createSMSCampaign({
        title: title.trim(),
        lgas: selectedLgas,
        messageTemplate: messageTemplate.trim(),
      });
      navigate(`/dashboard/admin/communications/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create campaign");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = messageTemplate.length;
  const smsCount = Math.ceil(charCount / 160);

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
            <h1 className="text-2xl font-bold text-gray-900">Create SMS Campaign</h1>
            <p className="text-sm text-gray-600 mt-1">Send personalized text messages to supporters</p>
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
            placeholder="e.g., January Mobilization Drive"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading states...</span>
            </div>
          ) : states.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              No states found. Please upload voter data first.
            </div>
          ) : (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                Target LGAs * ({selectedLgas.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={loadingLgas}
                  className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
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
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading LGAs...</span>
              </div>
            ) : lgas.length === 0 ? (
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
                      ? "bg-green-50 border-green-500"
                      : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLgas.includes(lga)}
                      onChange={() => handleLgaToggle(lga)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm">{lga}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Voter Count Display */}
            {selectedLgas.length > 0 && (
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
                        <span className="text-lg">{voterCount.toLocaleString()}</span> recipients will receive this SMS
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Template */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Template *
          </label>
          <textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            placeholder="Hello {{first_name}}, this is a message from the Obidient Movement..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">{charCount}</span> characters •
              <span className="font-medium ml-1">{smsCount}</span> SMS part{smsCount !== 1 ? 's' : ''}
            </div>
            <div className="text-gray-500">
              Available variables: {"{first_name}"}, {"{last_name}"}, {"{phone_number}"}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Preview</h3>
          <div className="bg-white rounded-lg p-4 font-mono text-sm text-gray-700">
            {messageTemplate.replace(/{{first_name}}/g, "John").replace(/{{last_name}}/g, "Doe").replace(/{{phone_number}}/g, "+2348012345678") ||
              "Your message preview will appear here..."}
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Creating Campaign..." : "Create & Send Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
