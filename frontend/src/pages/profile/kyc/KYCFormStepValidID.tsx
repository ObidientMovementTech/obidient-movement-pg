import { useState, ChangeEvent, useEffect } from "react";
import TextInput from "../../../components/inputs/TextInput";
import FormSelect from "../../../components/select/FormSelect";
import NextButton from "../../../components/NextButton";
import BackButton from "../../../components/BackButton";
import { saveValidIDStep } from "../../../services/kycService";
import { toast } from "react-hot-toast";
import imageCompressor from "../../../utils/ImageCompression";

interface ValidIDInfo {
  idType: string;
  idNumber: string;
  idImageBase64?: string;
  idImageUrl?: string | null;
}

interface Props {
  initialData?: {
    idType?: string;
    idNumber?: string;
    idImageFile?: File | null;
    idImageBase64?: string;
    idImageUrl?: string | null;
  };
  onNext: (data: ValidIDInfo) => void;
  onBack?: () => void;
}

const idTypeOptions = [
  { id: 1, label: "National ID (NIN)", value: "NIN" },
  { id: 2, label: "Driver's License", value: "Driver's License" },
  { id: 3, label: "International Passport", value: "International Passport" },
  { id: 4, label: "Voter's Card", value: "Voter's Card" },
];

export default function KYCFormStepValidID({ initialData, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<ValidIDInfo>({
    idType: initialData?.idType || "",
    idNumber: initialData?.idNumber || "",
    idImageBase64: initialData?.idImageBase64 || "",
    idImageUrl: initialData?.idImageUrl || null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // If there's an existing image URL from the server, use it for preview
  useEffect(() => {
    if (initialData?.idImageUrl) {
      setPreviewUrl(initialData.idImageUrl);
    }
  }, [initialData?.idImageUrl]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      toast.loading("Compressing image...", { id: "compress-toast" });

      // Compress the image before sending
      const compressionResult = await imageCompressor(file);

      // Use the compressed file if available, otherwise use original
      const fileToUse = compressionResult.compressedFile || file;

      toast.success("Image compressed successfully", { id: "compress-toast" });

      const reader = new FileReader();
      reader.onloadend = () => {
        // The result includes the data URL prefix which we'll send to the backend
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          idImageBase64: base64String,
          idImageUrl: null  // Clear the URL since we have a new file
        }));
        setPreviewUrl(base64String);  // Use base64 for preview until we get URL from server
        setIsLoading(false);

        // Auto-save if we have the ID type and number already filled in
        if (formData.idType && formData.idNumber) {
          handleAutoSave({
            ...formData,
            idImageBase64: base64String
          });
        }
      };
      reader.onerror = () => {
        console.error('FileReader error');
        setIsLoading(false);
        toast.error("Failed to read the image", { id: "compress-toast" });
      };
      reader.readAsDataURL(fileToUse);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Failed to compress image", { id: "compress-toast" });
      setIsLoading(false);
    }
  };

  const handleAutoSave = async (data: ValidIDInfo) => {
    // Only auto-save if both ID type and number are provided
    if (!data.idType || !data.idNumber) {
      return;
    }

    try {
      // Only send image data if we have a new image with base64 data
      const imageData = data.idImageBase64;

      if (imageData && imageData.length > 1000000) {
        console.warn('Image is very large:', Math.round(imageData.length / 1024), 'KB');
      }

      const response = await saveValidIDStep({
        idType: data.idType,
        idNumber: data.idNumber,
        idImageBase64: imageData
      });

      // Update with Cloudinary URL if available
      if (response.validID?.idImageUrl) {
        setFormData(prev => ({
          ...prev,
          idImageUrl: response.validID.idImageUrl,
          // Clear base64 data once we have the URL
          idImageBase64: undefined
        }));

        // Update preview with the Cloudinary URL
        setPreviewUrl(response.validID.idImageUrl);

        console.log('Successfully saved image to Cloudinary, URL:', response.validID.idImageUrl);
      }

      // No toast for auto-save to avoid disrupting user
    } catch (error) {
      console.error('Error auto-saving valid ID:', error);
      // No toast for auto-save errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      toast.loading("Saving ID information...", { id: "saving-id-toast" });

      // Only send image data if we have base64 data (new or existing image)
      const imageData = formData.idImageBase64;

      if (imageData && imageData.length > 1000000) {
        console.warn('Image is very large:', Math.round(imageData.length / 1024), 'KB');
        toast.loading("Uploading large image, this may take a moment...", { id: "saving-id-toast" });
      }

      // Save valid ID data to backend
      const response = await saveValidIDStep({
        idType: formData.idType,
        idNumber: formData.idNumber,
        idImageBase64: imageData
      });

      // Update form data with Cloudinary URL if available
      const updatedFormData = { ...formData };
      if (response.validID?.idImageUrl) {
        updatedFormData.idImageUrl = response.validID.idImageUrl;
        updatedFormData.idImageBase64 = undefined; // Clear base64 data

        toast.success("ID information saved successfully", { id: "saving-id-toast" });
      } else {
        toast.success("ID information saved", { id: "saving-id-toast" });
      }

      // Continue to next step with updated data
      onNext(updatedFormData);
    } catch (error: any) {
      console.error('Error saving valid ID:', error);
      // Show more specific error message if available
      toast.error(error.message || "Failed to save valid ID information", { id: "saving-id-toast" });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when important fields change
  const handleFieldChange = (updatedData: Partial<ValidIDInfo>) => {
    const newFormData = { ...formData, ...updatedData };
    setFormData(newFormData);

    // We'll auto-save when both ID type and number are filled
    if (newFormData.idType && newFormData.idNumber) {
      handleAutoSave(newFormData);
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    if (!formData.idType) {
      toast.error("Please select an ID type");
      return false;
    }

    if (!formData.idNumber) {
      toast.error("Please enter your ID number");
      return false;
    }

    // Check for either a new image being uploaded (base64) or an existing image URL
    if (!formData.idImageBase64 && !formData.idImageUrl) {
      toast.error("Please upload an image of your ID");
      return false;
    }

    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 max-w-3xl mx-auto mt-12">
      <h2 className="text-xl font-semibold text-[#006837]">Step 2: Upload Your Valid ID</h2>

      <FormSelect
        label="Select ID Type"
        options={idTypeOptions}
        defaultSelected={formData.idType}
        onChange={(opt) => {
          if (opt) handleFieldChange({ idType: opt.value });
        }}
        required
      />

      <TextInput
        label="ID Number"
        placeholder="e.g. 12345678901"
        value={formData.idNumber}
        onChange={(e) => handleFieldChange({ idNumber: e.target.value })}
        required
      />

      <div>
        <label className="block mb-2 font-medium text-sm text-gray-700">Upload ID Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-[#006837] file:text-white hover:file:bg-[#00552d]"
        />
        {isLoading && <p className="mt-2 text-sm text-gray-500">Loading image...</p>}
        {previewUrl && (
          <img src={previewUrl} alt="Preview" className="mt-4 rounded border max-h-60 object-contain" />
        )}
      </div>

      <div className="flex justify-between">
        {/* <BackButton onClick={onBack} /> */}
        <div className="flex justify-between gap-2 items-center">
          <div className="max-w-[100px]">
            {onBack && (
              <BackButton content="Back" onClick={onBack} disabled={isSaving} />
            )}
          </div>
          <div className="max-w-[100px]">
            <NextButton content={isSaving ? "Saving..." : "Next"} disabled={isSaving} />
          </div>
        </div>
      </div>
    </form>
  );
}
