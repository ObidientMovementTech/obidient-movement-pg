// pages/monitor/components/ResultTrackingForm.tsx
import CombinedResultForm from './stages/result-tracking/CombinedResultForm';
import { monitoringService } from '../../../../../services/monitoringService';

interface ResultTrackingFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext?: () => void;
}

export default function ResultTrackingForm({ formData, setFormData, onNext }: ResultTrackingFormProps) {
  const handleSubmit = async (data: any) => {
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
        console.log('Polling unit data:', {
          puCode: formData.puCode,
          puName: formData.puName,
          ward: formData.ward,
          lga: formData.lga,
          state: formData.state
        });

        const puSubmission = await monitoringService.submitPollingUnitInfo({
          electionId: formData.electionId || 1,
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

      // Create result tracking report object for API - simplified
      const resultTrackingData = {
        submissionId: submissionId,
        electionId: formData.electionId,
        // Include polling unit info for validation
        pollingUnitCode: formData.puCode,
        pollingUnitName: formData.puName,
        stats: {
          registered: updatedData.resultTracking.stats?.registered || 0,
          accredited: updatedData.resultTracking.stats?.accredited || 0,
          valid: updatedData.resultTracking.stats?.valid || 0,
          rejected: updatedData.resultTracking.stats?.rejected || 0,
          total: updatedData.resultTracking.stats?.total || 0,
          votesPerParty: updatedData.resultTracking.stats?.votesPerParty || []
        },
        evidence: {
          ec8aPhoto: updatedData.resultTracking.ec8aPhoto || ''
        }
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
      throw error; // Re-throw to allow parent component to handle loading state
    }
  };

  return (
    <div className="w-full">
      <CombinedResultForm
        onNext={handleSubmit}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
