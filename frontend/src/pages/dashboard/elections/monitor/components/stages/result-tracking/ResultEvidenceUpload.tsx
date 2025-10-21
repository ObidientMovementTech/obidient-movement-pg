import { useState } from 'react';
import { monitoringService } from '../../../../../../../services/monitoringService';
import CameraCapture from '../../../../../../../components/CameraCapture';
import Toast from '../../../../../../../components/Toast';

interface ResultEvidenceUploadProps {
  onNext: (data: any) => void;
  onBack?: () => void;
  formData: any;
  setFormData: (data: any) => void;
}

interface EvidenceUrls {
  ec8aPhoto: string;
  resultVideo: string;
  wallPhoto: string;
  selfieProof: string;
}

export default function ResultEvidenceUpload({ onNext, onBack, formData, setFormData }: ResultEvidenceUploadProps) {
  const [discrepancy, setDiscrepancy] = useState(formData.resultTracking?.discrepancy || '');
  const [formSigned, setFormSigned] = useState(formData.resultTracking?.formSigned || '');
  const [agentsSigned, setAgentsSigned] = useState(formData.resultTracking?.agentsSigned || '');
  const [posted, setPosted] = useState(formData.resultTracking?.posted || '');
  const [bvasStatus, setBvasStatus] = useState(formData.resultTracking?.bvasStatus || '');
  const [notes, setNotes] = useState(formData.resultTracking?.notes || '');

  const [evidenceUrls, setEvidenceUrls] = useState<EvidenceUrls>({
    ec8aPhoto: formData.resultTracking?.ec8aPhoto || '',
    resultVideo: formData.resultTracking?.resultVideo || '',
    wallPhoto: formData.resultTracking?.wallPhoto || '',
    selfieProof: formData.resultTracking?.selfieProof || ''
  });

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleFileUpload = async (name: keyof EvidenceUrls, file: File) => {
    try {
      setUploading({ ...uploading, [name]: true });
      setUploadProgress({ ...uploadProgress, [name]: 0 });

      // Upload to S3
      const fileUrl = await monitoringService.uploadEvidence(
        file,
        {
          type: 'result_evidence',
          description: name
        },
        (progress) => {
          setUploadProgress({ ...uploadProgress, [name]: progress });
        }
      );

      // Update evidence URLs
      const updatedUrls = { ...evidenceUrls, [name]: fileUrl };
      setEvidenceUrls(updatedUrls);

      // Update parent form data
      setFormData((prev: any) => ({
        ...prev,
        resultTracking: {
          ...prev.resultTracking,
          [name]: fileUrl
        },
      }));

      setToast({ message: 'Evidence uploaded successfully', type: 'success' });
    } catch (error: any) {
      console.error('Upload failed:', error);
      setToast({ message: error.message || 'Failed to upload evidence. Please try again.', type: 'error' });
    } finally {
      setUploading({ ...uploading, [name]: false });
    }
  };

  const handleNext = () => {
    // Validate at least EC8A photo is uploaded
    if (!evidenceUrls.ec8aPhoto) {
      setToast({ message: 'Please upload EC8A form photo (required)', type: 'error' });
      return;
    }

    onNext({
      resultTracking: {
        ...formData.resultTracking,
        discrepancy,
        formSigned,
        agentsSigned,
        posted,
        bvasStatus,
        notes,
        ec8aPhoto: evidenceUrls.ec8aPhoto,
        resultVideo: evidenceUrls.resultVideo,
        wallPhoto: evidenceUrls.wallPhoto,
        selfieProof: evidenceUrls.selfieProof
      },
    });
  };

  const isAnyUploading = Object.values(uploading).some(u => u);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <h2 className="text-lg font-semibold text-[#006837]">Result Evidence Upload (PU Level)</h2>
        <p className="text-sm text-gray-600 mt-2">
          Upload proof of election results. EC8A form photo is required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Any Discrepancy Observed?</label>
          <select
            value={discrepancy}
            onChange={(e) => setDiscrepancy(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Was Result Form Signed by Agents?</label>
          <select
            value={formSigned}
            onChange={(e) => setFormSigned(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Number of Agents Who Signed</label>
          <input
            type="number"
            value={agentsSigned}
            onChange={(e) => setAgentsSigned(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Enter number"
          />
        </div>

        <div>
          <label className="block font-medium">Was Result Posted at PU?</label>
          <select
            value={posted}
            onChange={(e) => setPosted(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">BVAS Data Seen or Available?</label>
          <select
            value={bvasStatus}
            onChange={(e) => setBvasStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>
      </div>

      {/* File Uploads with Camera Capture */}
      <div className="space-y-6 pt-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <CameraCapture
            label="Photo of Form EC8A (Required)"
            accept="image/*"
            onCapture={(file) => handleFileUpload('ec8aPhoto', file)}
            currentPreview={evidenceUrls.ec8aPhoto}
            uploading={uploading.ec8aPhoto}
            uploadProgress={uploadProgress.ec8aPhoto}
            disabled={isAnyUploading}
          />
        </div>

        <CameraCapture
          label="Video of Result Announcement (Optional)"
          accept="video/*"
          onCapture={(file) => handleFileUpload('resultVideo', file)}
          currentPreview={evidenceUrls.resultVideo}
          uploading={uploading.resultVideo}
          uploadProgress={uploadProgress.resultVideo}
          disabled={isAnyUploading}
        />

        <CameraCapture
          label="Photo of Wall with Result Posted (Optional)"
          accept="image/*"
          onCapture={(file) => handleFileUpload('wallPhoto', file)}
          currentPreview={evidenceUrls.wallPhoto}
          uploading={uploading.wallPhoto}
          uploadProgress={uploadProgress.wallPhoto}
          disabled={isAnyUploading}
        />

        <CameraCapture
          label="Observer Selfie / Extra Proof (Optional)"
          accept="image/*"
          onCapture={(file) => handleFileUpload('selfieProof', file)}
          currentPreview={evidenceUrls.selfieProof}
          uploading={uploading.selfieProof}
          uploadProgress={uploadProgress.selfieProof}
          disabled={isAnyUploading}
        />
      </div>

      <div>
        <label className="block font-medium">Additional Notes or Observations</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          rows={4}
          placeholder="Any additional observations or concerns..."
        />
      </div>

      <div className="pt-4 flex justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isAnyUploading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={isAnyUploading || !evidenceUrls.ec8aPhoto}
          className="bg-[#006837] text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ml-auto"
        >
          {isAnyUploading ? 'Uploading...' : 'Submit Results'}
        </button>
      </div>
    </div>
  );
}
