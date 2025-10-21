import { useState } from 'react';
import { monitoringService } from '../../../../../../../services/monitoringService';
import CameraCapture from '../../../../../../../components/CameraCapture';
import Toast from '../../../../../../../components/Toast';

interface OfficerPhoto {
  name: string;
  photoUrl: string;  // Changed from File to string (S3 URL)
  fileName?: string;
}

interface INECIdentityProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function INECIdentityVerification({
  onNext,
  formData,
  setFormData,
}: INECIdentityProps) {
  const [data, setData] = useState<Record<string, OfficerPhoto>>(
    formData.officerArrival?.officerNames || {
      po: { name: '', photoUrl: '' },
      apo1: { name: '', photoUrl: '' },
      apo2: { name: '', photoUrl: '' },
      apo3: { name: '', photoUrl: '' },
    }
  );

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleNameChange = (role: string, name: string) => {
    const updated = {
      ...data,
      [role]: {
        ...data[role],
        name,
      },
    };
    setData(updated);
    setFormData({
      ...formData,
      officerArrival: {
        ...formData.officerArrival,
        officerNames: updated,
      },
    });
  };

  const handlePhotoCapture = async (role: string, file: File) => {
    try {
      setUploading({ ...uploading, [role]: true });
      setUploadProgress({ ...uploadProgress, [role]: 0 });

      // Upload to S3
      const photoUrl = await monitoringService.uploadEvidence(
        file,
        {
          type: 'officer_photo',
          role: role,
          description: `Photo of ${role.toUpperCase()}`
        },
        (progress) => {
          setUploadProgress({ ...uploadProgress, [role]: progress });
        }
      );

      // Update state with S3 URL
      const updated = {
        ...data,
        [role]: {
          ...data[role],
          photoUrl: photoUrl,
          fileName: file.name
        },
      };

      setData(updated);
      setFormData({
        ...formData,
        officerArrival: {
          ...formData.officerArrival,
          officerNames: updated,
        },
      });

      setToast({ message: `${role.toUpperCase()} photo uploaded successfully`, type: 'success' });
    } catch (error: any) {
      console.error('Upload failed:', error);
      setToast({ message: error.message || 'Failed to upload photo. Please try again.', type: 'error' });
    } finally {
      setUploading({ ...uploading, [role]: false });
    }
  };

  const handleNext = () => {
    // Validate that at least PO photo is uploaded
    if (!data.po.photoUrl) {
      setToast({ message: 'Please upload at least the Presiding Officer (PO) photo', type: 'error' });
      return;
    }

    onNext({
      officerArrival: {
        ...formData.officerArrival,
        officerNames: data,
      },
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      po: 'Presiding Officer (PO)',
      apo1: 'Assistant PO 1 (APO1)',
      apo2: 'Assistant PO 2 (APO2)',
      apo3: 'Assistant PO 3 (APO3)'
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <h2 className="text-2xl font-bold text-[#006837]">INEC Officer Verification</h2>
        <p className="text-sm text-gray-600 mt-2">
          Capture or upload photos of INEC officers for verification. At minimum, PO photo is required.
        </p>
      </div>

      {['po', 'apo1', 'apo2', 'apo3'].map((role) => (
        <div
          key={role}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            {getRoleLabel(role)}
            {role === 'po' && <span className="text-red-500 ml-1">*</span>}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Officer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={data[role].name}
                onChange={(e) => handleNameChange(role, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8cc63f]"
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Photo Capture/Upload */}
            <div>
              <CameraCapture
                label="Officer Photo"
                accept="image/*"
                onCapture={(file) => handlePhotoCapture(role, file)}
                currentPreview={data[role].photoUrl}
                uploading={uploading[role]}
                uploadProgress={uploadProgress[role]}
                disabled={uploading[role]}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="pt-4 text-right">
        <button
          type="button"
          onClick={handleNext}
          disabled={Object.values(uploading).some(u => u)}
          className="bg-[#006837] hover:bg-[#00552e] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
