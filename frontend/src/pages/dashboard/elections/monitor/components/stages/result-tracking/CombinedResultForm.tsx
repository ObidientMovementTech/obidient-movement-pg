import { useState, lazy, Suspense } from 'react';
import { monitoringService } from '../../../../../../../services/monitoringService';
import Toast from '../../../../../../../components/Toast';
import DynamicPartyVotes from './DynamicPartyVotes';

// Lazy load heavy camera component
const CameraCapture = lazy(() => import('../../../../../../../components/CameraCapture'));

interface CombinedResultFormProps {
  onNext: (data: any) => void;
  formData: any;
  setFormData: (data: any) => void;
}

interface EvidenceUrls {
  ec8aPhoto: string;
  resultVideo: string;
  wallPhoto: string;
  selfieProof: string;
}

export default function CombinedResultForm({ onNext, formData, setFormData }: CombinedResultFormProps) {
  // Result Details State
  const [stats, setStats] = useState({
    registered: formData.resultTracking?.stats?.registered || 0,
    accredited: formData.resultTracking?.stats?.accredited || 0,
    valid: formData.resultTracking?.stats?.valid || 0,
    rejected: formData.resultTracking?.stats?.rejected || 0,
    total: formData.resultTracking?.stats?.total || 0,
  });

  const [votesPerParty, setVotesPerParty] = useState<{ party: string; votes: number }[]>(
    formData.resultTracking?.stats?.votesPerParty && formData.resultTracking.stats.votesPerParty.length > 0
      ? formData.resultTracking.stats.votesPerParty
      : []
  );

  // Evidence Upload State
  const [evidenceUrls, setEvidenceUrls] = useState<EvidenceUrls>({
    ec8aPhoto: formData.resultTracking?.ec8aPhoto || '',
    resultVideo: formData.resultTracking?.resultVideo || '',
    wallPhoto: formData.resultTracking?.wallPhoto || '',
    selfieProof: formData.resultTracking?.selfieProof || ''
  });

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const electionId = formData.electionId || formData.resultTracking?.electionId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setStats(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

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

  const handleSubmit = async () => {
    // Validate that all party names are filled if there are any entries
    const hasEmptyPartyNames = votesPerParty.some(entry => !entry.party.trim());
    if (hasEmptyPartyNames) {
      setToast({ message: 'Please enter party names for all entries or use the remove button.', type: 'error' });
      return;
    }

    // Validate at least EC8A photo is uploaded
    if (!evidenceUrls.ec8aPhoto) {
      setToast({ message: 'Please upload EC8A form photo (required)', type: 'error' });
      return;
    }

    // Filter out any entries with empty party names
    const validEntries = votesPerParty.filter(entry => entry.party.trim() !== '');

    // Calculate total votes from all parties
    const totalPartyVotes = validEntries.reduce((sum, entry) => sum + entry.votes, 0);

    // Validate that total party votes matches valid votes
    if (totalPartyVotes !== stats.valid) {
      setToast({
        message: `Vote mismatch! Total party votes (${totalPartyVotes}) must equal Valid Votes (${stats.valid})`,
        type: 'error'
      });
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    try {
      // Combine all data
      await onNext({
        stats: {
          ...stats,
          votesPerParty: validEntries,
        },
        ec8aPhoto: evidenceUrls.ec8aPhoto,
      });
    } catch (error) {
      setIsSubmitting(false);
      // Error handling is done in parent component
    }
  };

  const isAnyUploading = Object.values(uploading).some(u => u);

  // Calculate total votes from all parties
  const totalPartyVotes = votesPerParty.reduce((sum, entry) => sum + entry.votes, 0);
  const votesMatch = totalPartyVotes === stats.valid && stats.valid > 0;

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Section 1: Result Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-[#006837]">Result Details (Form EC8A)</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registered Voters</label>
            <input
              type="number"
              name="registered"
              placeholder="e.g. 1500"
              onChange={handleInputChange}
              value={stats.registered === 0 ? '' : stats.registered}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accredited Voters</label>
            <input
              type="number"
              name="accredited"
              placeholder="e.g. 1200"
              onChange={handleInputChange}
              value={stats.accredited === 0 ? '' : stats.accredited}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Votes</label>
            <input
              type="number"
              name="valid"
              placeholder="e.g. 1180"
              onChange={handleInputChange}
              value={stats.valid === 0 ? '' : stats.valid}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
              min="0"
              required
            />
            {stats.valid > 0 && (
              <div className={`mt-2 text-sm font-medium ${votesMatch
                ? 'text-green-600'
                : totalPartyVotes > stats.valid
                  ? 'text-red-600'
                  : 'text-amber-600'
                }`}>
                Party votes total: {totalPartyVotes} / {stats.valid}
                {votesMatch && ' ✓'}
                {totalPartyVotes > stats.valid && ' (Over)'}
                {totalPartyVotes < stats.valid && totalPartyVotes > 0 && ' (Under)'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rejected Votes</label>
            <input
              type="number"
              name="rejected"
              placeholder="e.g. 20"
              onChange={handleInputChange}
              value={stats.rejected === 0 ? '' : stats.rejected}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Votes Cast</label>
            <input
              type="number"
              name="total"
              placeholder="e.g. 1200"
              onChange={handleInputChange}
              value={stats.total === 0 ? '' : stats.total}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-base"
              min="0"
              required
            />
          </div>
        </div>

        {/* Dynamic Party Votes Component */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <DynamicPartyVotes
            electionId={electionId}
            votesPerParty={votesPerParty}
            onChange={setVotesPerParty}
          />
        </div>
      </div>

      {/* Section 2: Evidence Upload */}
      <div className="space-y-6 pt-4 border-t-2 border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-[#006837]">Result Evidence</h2>
          <p className="text-sm text-gray-600 mt-2">
            Upload proof of election results. EC8A form photo is required.
          </p>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">Loading camera...</div>}>
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
          </Suspense>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isAnyUploading || isSubmitting || !evidenceUrls.ec8aPhoto}
          className="w-full bg-[#006837] text-white px-8 py-4 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting...</span>
            </>
          ) : isAnyUploading ? (
            'Uploading...'
          ) : (
            'Submit Results'
          )}
        </button>
      </div>
    </div>
  );
}
