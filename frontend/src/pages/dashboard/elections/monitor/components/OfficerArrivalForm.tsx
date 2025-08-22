// pages/monitor/components/OfficerArrivalForm.tsx
import { useState } from 'react';
import ArrivalTracking from './stages/officer-arrival/ArrivalTracking';
import OfficerIdentity from './stages/officer-arrival/INECIdentityVerification';
import OfficerContext from './stages/officer-arrival/ContextualNotes';
import { submitOfficerArrivalData } from '../../../../../services/monitorService';

interface OfficerArrivalFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext?: () => void;
}

export default function OfficerArrivalForm({ formData, setFormData, onNext }: OfficerArrivalFormProps) {
  const [stage, setStage] = useState<number>(1);

  const totalStages = 3;
  const stages = [
    'Arrival Tracking',
    'Officer Identity',
    'Contextual Notes',
  ];

  const handleNext = (data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      officerArrival: {
        ...prev.officerArrival,
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
          <ArrivalTracking
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {stage === 2 && (
          <OfficerIdentity
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {stage === 3 && (
          <OfficerContext
            onNext={async (data) => {
              const updatedData = {
                ...formData,
                officerArrival: {
                  ...formData.officerArrival,
                  ...data.officerArrival,
                },
              };

              setFormData(updatedData);

              try {
                const token = localStorage.getItem('token') || '';
                const response = await submitOfficerArrivalData(updatedData, token);
                console.log('✅ Officer Arrival Data Saved:', response);
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
