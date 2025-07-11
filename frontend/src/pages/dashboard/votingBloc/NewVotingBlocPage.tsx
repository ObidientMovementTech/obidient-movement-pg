import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import { createVotingBloc, uploadVotingBlocBannerImage, uploadRichDescriptionImage } from "../../../services/votingBlocService";
import { statesLGAWardList } from "../../../utils/StateLGAWard";
import RichTextEditor from "../../../components/inputs/RichTextEditor";
import Toast from "../../../components/Toast";
// import { useUserContext } from "../../../context/UserContext";

export default function NewVotingBlocPage() {
  const navigate = useNavigate();
  // const { profile } = useUserContext();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    richDescription: "",
    goals: [] as string[],
    targetCandidate: "",
    scope: "",
    location: {
      state: "",
      lga: "",
      ward: "",
    },
    bannerImageUrl: "",
    toolkits: [] as { label: string; url: string; type: string }[],
  });

  const [goalInput, setGoalInput] = useState("");
  const [toolkitInput, setToolkitInput] = useState({ label: "", url: "", type: "Toolkit" });
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lgaOptions, setLgaOptions] = useState<string[]>([]);
  const [wardOptions, setWardOptions] = useState<string[]>([]);
  const [toastInfo, setToastInfo] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KYC verification removed - all users can now create voting blocs

  useEffect(() => {
    if (success) {
      navigate("/dashboard");
      sessionStorage.setItem("dashboardPage", "Create your Voting Bloc");
    }
  }, [success, navigate]);

  // Update LGA options when state changes
  useEffect(() => {
    if (formData.location.state) {
      const stateData = statesLGAWardList.find(s => s.state === formData.location.state);
      setLgaOptions(stateData ? stateData.lgas.map(lga => lga.lga) : []);
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, lga: "", ward: "" }
      }));
    }
  }, [formData.location.state]);

  // Update Ward options when LGA changes
  useEffect(() => {
    if (formData.location.state && formData.location.lga) {
      const stateData = statesLGAWardList.find(s => s.state === formData.location.state);
      if (stateData) {
        const lgaData = stateData.lgas.find(l => l.lga === formData.location.lga);
        setWardOptions(lgaData ? lgaData.wards : []);
      }
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, ward: "" }
      }));
    }
  }, [formData.location.state, formData.location.lga]);

  const handleBack = () => {
    navigate("/dashboard");
    sessionStorage.setItem("dashboardPage", "Create your Voting Bloc");
  };

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file) return "";

    try {
      setUploading(true);
      const response = await uploadVotingBlocBannerImage(file);

      if (!response.success || !response.imageUrl) {
        throw new Error("Upload failed - no image URL received");
      }

      return response.imageUrl;
    } catch (error: any) {
      console.error("Image upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload image";
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, goalInput.trim()]
    }));
    setGoalInput("");
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const addToolkit = () => {
    if (!toolkitInput.label.trim() || !toolkitInput.url.trim()) return;
    setFormData(prev => ({
      ...prev,
      toolkits: [...prev.toolkits, toolkitInput]
    }));
    setToolkitInput({ label: "", url: "", type: "Toolkit" });
  };

  const removeToolkit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      toolkits: prev.toolkits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.targetCandidate.trim()) {
      setToastInfo({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    try {
      setLoading(true);

      let bannerImageUrl = "";
      if (bannerImage) {
        try {
          setToastInfo({ message: "Uploading banner image...", type: "success" });
          bannerImageUrl = await handleImageUpload(bannerImage);
          if (!bannerImageUrl) {
            throw new Error("Image upload failed - no URL returned");
          }
        } catch (imageError: any) {
          setToastInfo({
            message: imageError.message || "Failed to upload banner image",
            type: "error"
          });
          setLoading(false);
          return; // Stop the process if image upload fails
        }
      }

      setToastInfo({ message: "Creating voting bloc...", type: "success" });
      await createVotingBloc({
        ...formData,
        bannerImageUrl,
      });

      setToastInfo({ message: "Voting bloc created successfully!", type: "success" });
      setSuccess(true);
    } catch (error: any) {
      setToastInfo({
        message: error.response?.data?.message || "Failed to create voting bloc",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-5 border-b flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Voting Bloc
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Create Voting Bloc</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voting Bloc Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter voting bloc name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Candidate *
                  </label>
                  <input
                    type="text"
                    value={formData.targetCandidate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetCandidate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter target candidate name"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your voting bloc and its purpose"
                  required
                />
              </div>
            </div>

            {/* Location & Scope */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Location & Scope</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scope *
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select scope</option>
                    <option value="National">National</option>
                    <option value="State">State</option>
                    <option value="LG">LG</option>
                    <option value="Ward">Ward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.location.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select state</option>
                    {statesLGAWardList.map(state => (
                      <option key={state.state} value={state.state}>{state.state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LGA *
                  </label>
                  <select
                    value={formData.location.lga}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, lga: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={!formData.location.state}
                  >
                    <option value="">Select LGA</option>
                    {lgaOptions.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward {formData.scope === 'Ward' ? '*' : '(Optional)'}
                  </label>
                  <select
                    value={formData.location.ward}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, ward: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    required={formData.scope === 'Ward'}
                    disabled={!formData.location.lga}
                  >
                    <option value="">Select Ward</option>
                    {wardOptions.map(ward => (
                      <option key={ward} value={ward}>{ward}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Goals */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Goals</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter a goal for your voting bloc"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    disabled={!goalInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {formData.goals.length > 0 && (
                  <div className="space-y-2">
                    {formData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="flex-1 text-gray-700">{goal}</span>
                        <button
                          type="button"
                          onClick={() => removeGoal(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Banner Image</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {bannerPreview ? (
                  <div className="relative">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerImage(null);
                        setBannerPreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-16 w-16 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <span>Upload banner image</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rich Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Detailed Description</h2>
              <RichTextEditor
                content={formData.richDescription}
                onChange={(value) => setFormData(prev => ({ ...prev, richDescription: value }))}
                onImageUpload={async (file) => {
                  try {
                    const response = await uploadRichDescriptionImage(file);
                    return response.imageUrl;
                  } catch (error) {
                    setToastInfo({ message: "Failed to upload image", type: "error" });
                    throw error;
                  }
                }}
                placeholder="Provide a detailed description of your voting bloc, its mission, and how members can contribute..."
              />
            </div>

            {/* Toolkits */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Toolkits & Resources</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={toolkitInput.label}
                    onChange={(e) => setToolkitInput(prev => ({ ...prev, label: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Resource name"
                  />
                  <input
                    type="url"
                    value={toolkitInput.url}
                    onChange={(e) => setToolkitInput(prev => ({ ...prev, url: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Resource URL"
                  />
                  <div className="flex gap-2">
                    <select
                      value={toolkitInput.type}
                      onChange={(e) => setToolkitInput(prev => ({ ...prev, type: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="Toolkit">Toolkit</option>
                      <option value="Policy">Policy</option>
                    </select>
                    <button
                      type="button"
                      onClick={addToolkit}
                      disabled={!toolkitInput.label.trim() || !toolkitInput.url.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {formData.toolkits.length > 0 && (
                  <div className="space-y-2">
                    {formData.toolkits.map((toolkit, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{toolkit.label}</div>
                          <div className="text-sm text-gray-500">{toolkit.url}</div>
                          <div className="text-xs text-green-600">{toolkit.type}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeToolkit(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Voting Bloc"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}
    </section>
  );
}
