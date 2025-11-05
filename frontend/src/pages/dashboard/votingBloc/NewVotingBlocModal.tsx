import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { createVotingBloc, uploadVotingBlocBannerImage, uploadRichDescriptionImage } from "../../../services/votingBlocService";
import { getStateNames, getFormattedLGAs, getFormattedWards } from "../../../utils/StateLGAWardPollingUnits";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface NewVotingBlocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function NewVotingBlocModal({ isOpen, onClose, onSuccess, onError }: NewVotingBlocModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    richDescription: "",
    goals: [""],
    targetCandidate: "",
    scope: "",
    location: {
      state: "",
      lga: "",
      ward: "",
    },
    bannerImageUrl: "",
    toolkits: [{ label: "", url: "", type: "Toolkit" }],
  });

  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lgaOptions, setLgaOptions] = useState<string[]>([]);
  const [wardOptions, setWardOptions] = useState<string[]>([]);

  // Update LGA options when state changes
  useEffect(() => {
    if (formData.location.state) {
      const formattedLGAs = getFormattedLGAs(formData.location.state);
      setLgaOptions(formattedLGAs.map(lga => lga.value));
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, lga: "", ward: "" }
      }));
    }
  }, [formData.location.state]);

  // Update Ward options when LGA changes
  useEffect(() => {
    if (formData.location.state && formData.location.lga) {
      const formattedWards = getFormattedWards(formData.location.state, formData.location.lga);
      setWardOptions(formattedWards.map(ward => ward.value));
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, ward: "" }
      }));
    }
  }, [formData.location.state, formData.location.lga]);

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file) return "";

    try {
      setUploading(true);
      const response = await uploadVotingBlocBannerImage(file);
      return response.imageUrl;
    } catch (error) {
      onError("Failed to upload image");
      return "";
    } finally {
      setUploading(false);
    }
  };

  // Rich description image handler
  const handleRichDescriptionImageUpload = async () => {
    return new Promise<string>((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const response = await uploadRichDescriptionImage(file);
            resolve(response.imageUrl);
          } catch (error) {
            onError("Failed to upload image");
            resolve("");
          }
        }
      };
      input.click();
    });
  };

  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: handleRichDescriptionImageUpload
      }
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
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, ""]
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const addToolkit = () => {
    setFormData(prev => ({
      ...prev,
      toolkits: [...prev.toolkits, { label: "", url: "", type: "Toolkit" }]
    }));
  };

  const removeToolkit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      toolkits: prev.toolkits.filter((_, i) => i !== index)
    }));
  };

  const updateToolkit = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      toolkits: prev.toolkits.map((toolkit, i) =>
        i === index ? { ...toolkit, [field]: value } : toolkit
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.targetCandidate.trim()) {
      onError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      let bannerImageUrl = "";
      if (bannerImage) {
        bannerImageUrl = await handleImageUpload(bannerImage);
      }

      const cleanedToolkits = formData.toolkits.filter(
        toolkit => toolkit.label.trim() && toolkit.url.trim()
      );

      const cleanedGoals = formData.goals.filter(goal => goal.trim());

      await createVotingBloc({
        ...formData,
        goals: cleanedGoals,
        bannerImageUrl,
        toolkits: cleanedToolkits,
      });

      onSuccess("Voting bloc created successfully!");
      onClose();

      // Reset form
      setFormData({
        name: "",
        description: "",
        richDescription: "",
        goals: [""],
        targetCandidate: "",
        scope: "",
        location: { state: "", lga: "", ward: "" },
        bannerImageUrl: "",
        toolkits: [{ label: "", url: "", type: "Toolkit" }],
      });
      setBannerImage(null);
      setBannerPreview("");
    } catch (error: any) {
      onError(error.response?.data?.message || "Failed to create voting bloc");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Create Voting Bloc</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
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

          {/* Scope and Location */}
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
                {getStateNames().map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {lgaOptions.map(lga => {
                  const formattedLGAs = getFormattedLGAs(formData.location.state);
                  const lgaData = formattedLGAs.find(l => l.value === lga);
                  return (
                    <option key={lga} value={lga}>{lgaData?.label || lga}</option>
                  );
                })}
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
                {wardOptions.map(ward => {
                  const formattedWards = getFormattedWards(formData.location.state, formData.location.lga);
                  const wardData = formattedWards.find(w => w.value === ward);
                  return (
                    <option key={ward} value={ward}>{wardData?.label || ward}</option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goals
            </label>
            {formData.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateGoal(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter goal"
                />
                {formData.goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addGoal}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <Plus size={16} />
              Add Goal
            </button>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerImage(null);
                      setBannerPreview("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rich Description
            </label>
            <ReactQuill
              value={formData.richDescription}
              onChange={(value) => setFormData(prev => ({ ...prev, richDescription: value }))}
              modules={quillModules}
              className="bg-white"
            />
          </div>

          {/* Toolkits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toolkits
            </label>
            {formData.toolkits.map((toolkit, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={toolkit.label}
                  onChange={(e) => updateToolkit(index, 'label', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Toolkit label"
                />
                <input
                  type="url"
                  value={toolkit.url}
                  onChange={(e) => updateToolkit(index, 'url', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Toolkit URL"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={toolkit.type}
                    onChange={(e) => updateToolkit(index, 'type', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Toolkit">Toolkit</option>
                    <option value="Policy">Policy</option>
                  </select>
                  {formData.toolkits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeToolkit(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addToolkit}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <Plus size={16} />
              Add Toolkit
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Voting Bloc"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
