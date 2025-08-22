// pages/monitor/components/ResultTrackingForm.tsx
import { useState } from 'react';
import PollingUnitInfo from './stages/result-tracking/PollingUnitInfo';
import PUResultDetails from './stages/result-tracking/PUResultDetails';
import ResultEvidenceUpload from './stages/result-tracking/ResultEvidenceUpload';
import { submitResultTrackingData } from '../../../../../services/monitorService';

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
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {stage === 3 && (
          <ResultEvidenceUpload
            onNext={async (data) => {
              const updatedData = {
                ...formData,
                resultTracking: {
                  ...formData.resultTracking,
                  ...data.resultTracking,
                },
              };

              setFormData(updatedData);

              try {
                const token = localStorage.getItem('token') || '';
                const response = await submitResultTrackingData(updatedData, token);
                console.log('✅ Result Tracking Data Saved:', response);
                if (onNext) onNext();
              } catch (error: any) {
                console.error('❌ Error:', error);
                alert(error?.response?.data?.message || 'Submission failed. Try again.');
              }
            }}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
}
