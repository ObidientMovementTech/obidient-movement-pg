// pages/monitor/components/ResultTrackingForm.tsx
import { useState } from 'react';
import PollingUnitInfo from './stages/result-tracking/PollingUnitInfo';
import PUResultDetails from './stages/result-tracking/PUResultDetails';
import ResultEvidenceUpload from './stages/result-tracking/ResultEvidenceUpload';
import { monitoringService } from '../../../../../services/monitoringService';

interface ResultTrackingFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext?: () => void;
}

export default function ResultTrackingForm({ formData, setFormData, onNext }: ResultTrackingFormProps) {
  const [stage, setStage] = useState<number>(1);

  const totalStages = 3;
  const stages = [
    'Polling Unit Info',
    'Result Details (EC8A)',
    'Evidence Upload',
  ];

  const handleNext = (data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      resultTracking: {
        ...prev.resultTracking,
        ...data,
      },
    }));
    setStage(stage + 1);
  };

  const handleBack = () => {
    if (stage > 1) {
      setStage(stage - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="mb-10">
        <div className="flex justify-between items-center">
          {stages.map((label, index) => (
            <div key={index} className="flex-1 text-center">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${stage > index + 1
                  ? 'bg-[#006837] text-white'
                  : stage === index + 1
                    ? 'bg-[#8cc63f] text-white'
                    : 'bg-gray-200 text-gray-500'}`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-sm font-medium ${stage >= index + 1 ? 'text-[#006837]' : 'text-gray-500'}`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="relative mt-4 h-1 bg-gray-200">
          <div
            className="absolute top-0 left-0 h-1 bg-[#006837] transition-all duration-500"
            style={{ width: `${(stage / totalStages) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Stages */}
      <div className="animate-fade-in">
        {stage === 1 && (
          <PollingUnitInfo
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {stage === 2 && (
          <PUResultDetails
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        )}
        {stage === 3 && (
          <ResultEvidenceUpload
            onNext={async (data) => {
              const updatedData = {
                ...formData,
                resultTracking: {
                  ...formData.resultTracking,
                  ...data,
                },
              };

              setFormData(updatedData);

              try {
                // First, create polling unit submission if it doesn't exist
                let submissionId = formData.submissionId;

                if (!submissionId) {
                  console.log('📝 Creating polling unit submission first...');
                  // We need to get election and PU details from somewhere
                  // For now, use placeholder - this should come from a parent component
                  const puSubmission = await monitoringService.submitPollingUnitInfo({
                    electionId: formData.electionId || 1, // This should be passed from parent
                    puCode: formData.puCode || 'TEMP-PU',
                    puName: formData.puName || 'Polling Unit',
                    ward: formData.ward || 'Ward',
                    lga: formData.lga || 'LGA',
                    state: formData.state || 'State',
                    gpsCoordinates: formData.gpsCoordinates || null,
                    locationType: formData.locationType || 'public',
                    locationOther: formData.locationOther || ''
                  });

                  submissionId = puSubmission.data.submissionId;
                  console.log('✅ Polling unit created with ID:', submissionId);
                }

                // Create result tracking report object for API - matching backend structure
                const resultTrackingData = {
                  submissionId: submissionId,
                  officerName: updatedData.resultTracking.pollingInfo?.officerName || '',
                  resultAnnouncerPhoto: updatedData.resultTracking.pollingInfo?.officerPhotoUrl || '',
                  partyAgents: updatedData.resultTracking.pollingInfo?.partyAgents || '',
                  reporterName: updatedData.resultTracking.pollingInfo?.reporterName || '',
                  reporterPhone: updatedData.resultTracking.pollingInfo?.reporterPhone || '',
                  date: updatedData.resultTracking.pollingInfo?.electionDate || new Date().toISOString().split('T')[0],
                  timeAnnounced: updatedData.resultTracking.pollingInfo?.resultTime || '',
                  stats: {
                    registered: updatedData.resultTracking.stats?.registered || 0,
                    accredited: updatedData.resultTracking.stats?.accredited || 0,
                    valid: updatedData.resultTracking.stats?.valid || 0,
                    rejected: updatedData.resultTracking.stats?.rejected || 0,
                    total: updatedData.resultTracking.stats?.total || 0,
                    votesPerParty: updatedData.resultTracking.stats?.votesPerParty || []
                  },
                  discrepancies: updatedData.resultTracking.discrepancy || '',
                  signedByAgents: updatedData.resultTracking.formSigned === 'Yes',
                  agentsSignedCount: parseInt(updatedData.resultTracking.agentsSigned) || 0,
                  resultPosted: updatedData.resultTracking.posted === 'Yes',
                  bvasSeen: updatedData.resultTracking.bvasStatus || '',
                  evidence: {
                    ec8aPhoto: updatedData.resultTracking.ec8aPhoto || '',
                    announcementVideo: updatedData.resultTracking.resultVideo || '',
                    wallPhoto: updatedData.resultTracking.wallPhoto || '',
                    reporterSelfie: updatedData.resultTracking.selfieProof || ''
                  },
                  notes: updatedData.resultTracking.notes || ''
                };

                console.log('📤 Submitting result tracking data:', resultTrackingData);
                const response = await monitoringService.submitResultTracking(resultTrackingData);
                console.log('✅ Result Tracking Data Saved:', response);

                // Save submissionId for future use
                setFormData((prev: any) => ({
                  ...prev,
                  submissionId: submissionId
                }));

                if (onNext) onNext();
              } catch (error: any) {
                console.error('❌ Error:', error);
                alert(error?.message || 'Submission failed. Try again.');
              }
            }}
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
}
