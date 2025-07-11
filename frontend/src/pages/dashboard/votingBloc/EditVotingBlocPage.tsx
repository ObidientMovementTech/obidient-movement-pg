import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import {
  getVotingBlocById,
  updateVotingBloc,
  uploadVotingBlocBannerImage,
  uploadRichDescriptionImage
} from "../../../services/votingBlocService";
import { statesLGAWardList } from "../../../utils/StateLGAWard";
import RichTextEditor from "../../../components/inputs/RichTextEditor";
import Toast from "../../../components/Toast";
import { useUserContext } from "../../../context/UserContext";
import Loading from "../../../components/Loader";

export default function EditVotingBlocPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useUserContext();
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  // KYC verification removed - all users can now edit voting blocs

  useEffect(() => {
    if (id) {
      fetchVotingBloc();
    }
  }, [navigate, id]);

  const fetchVotingBloc = async () => {
    try {
      setInitialLoading(true);
      const data = await getVotingBlocById(id!);
      const bloc = data.votingBloc;

      // Check if user is the creator
      if (bloc.creator._id !== profile?._id) {
        setToastInfo({ message: "You can only edit your own voting blocs", type: "error" });
        navigate("/dashboard");
        return;
      }

      setFormData({
        name: bloc.name,
        description: bloc.description,
        richDescription: bloc.richDescription || "",
        goals: bloc.goals || [],
        targetCandidate: bloc.targetCandidate,
        scope: bloc.scope,
        location: bloc.location,
        bannerImageUrl: bloc.bannerImageUrl || "",
        toolkits: bloc.toolkits || [],
      });

      if (bloc.bannerImageUrl) {
        setBannerPreview(bloc.bannerImageUrl);
      }
    } catch (error: any) {
      setToastInfo({
        message: error.response?.data?.message || "Failed to load voting bloc",
        type: "error"
      });
      navigate("/dashboard");
    } finally {
      setInitialLoading(false);
    }
  };

  // Update LGA options when state changes
  useEffect(() => {
    if (formData.location.state) {
      const stateData = statesLGAWardList.find(s => s.state === formData.location.state);
      setLgaOptions(stateData ? stateData.lgas.map(lga => lga.lga) : []);
      if (!stateData?.lgas.find(l => l.lga === formData.location.lga)) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lga: "", ward: "" }
        }));
      }
    }
  }, [formData.location.state]);

  // Update Ward options when LGA changes
  useEffect(() => {
    if (formData.location.state && formData.location.lga) {
      const stateData = statesLGAWardList.find(s => s.state === formData.location.state);
      if (stateData) {
        const lgaData = stateData.lgas.find(l => l.lga === formData.location.lga);
        setWardOptions(lgaData ? lgaData.wards : []);
        if (!lgaData?.wards.includes(formData.location.ward)) {
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, ward: "" }
          }));
        }
      }
    }
  }, [formData.location.state, formData.location.lga]);

  useEffect(() => {
    if (success) {
      navigate(`/dashboard/manage-voting-bloc/${id}`);

    }
  }, [success, navigate]);

  const handleBack = () => {
    navigate(`/dashboard/manage-voting-bloc/${id}`);
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

      let bannerImageUrl = formData.bannerImageUrl;
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
          return;
        }
      }

      setToastInfo({ message: "Updating voting bloc...", type: "success" });
      await updateVotingBloc(id!, {
        ...formData,
        bannerImageUrl,
      });

      setToastInfo({ message: "Voting bloc updated successfully!", type: "success" });
      setSuccess(true);
    } catch (error: any) {
      setToastInfo({
        message: error.response?.data?.message || "Failed to update voting bloc",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Loading />;
  }

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
        <h1 className="text-xl font-semibold text-gray-900">Edit Voting Bloc</h1>
        <div className="w-24"></div>
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
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Describe your voting bloc"
                required
              />
            </div>

            {/* Location and Scope */}
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
              <div className="space-y-3">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {goal}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Add a new goal"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGoal();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-700"
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
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
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerImage(null);
                        setBannerPreview("");
                        setFormData(prev => ({ ...prev, bannerImageUrl: "" }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label className="cursor-pointer text-green-600 hover:text-green-500">
                        <span>Upload banner image</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rich Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Rich Description</h2>
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
                placeholder="Write a detailed description of your voting bloc..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Use this editor to create a rich, formatted description with images, links, and styling.
              </p>
            </div>

            {/* Toolkits */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Toolkits</h2>
              <div className="space-y-3">
                {formData.toolkits.map((toolkit, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="font-medium">{toolkit.label}</div>
                    <div className="text-sm text-blue-600 truncate">{toolkit.url}</div>
                    <div className="text-sm text-gray-600">{toolkit.type}</div>
                    <button
                      type="button"
                      onClick={() => removeToolkit(index)}
                      className="text-red-500 hover:text-red-700 justify-self-end"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={toolkitInput.label}
                    onChange={(e) => setToolkitInput(prev => ({ ...prev, label: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Toolkit label"
                  />
                  <input
                    type="url"
                    value={toolkitInput.url}
                    onChange={(e) => setToolkitInput(prev => ({ ...prev, url: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Toolkit URL"
                  />
                  <select
                    value={toolkitInput.type}
                    onChange={(e) => setToolkitInput(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Toolkit">Toolkit</option>
                    <option value="Policy">Policy</option>
                  </select>
                  <button
                    type="button"
                    onClick={addToolkit}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-green-600 hover:text-green-700"
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Voting Bloc"}
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
