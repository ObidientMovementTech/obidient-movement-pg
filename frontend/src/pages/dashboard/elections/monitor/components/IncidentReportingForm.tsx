import { useState } from 'react';
import IncidentBasics from './stages/incident-reporting/IncidentBasics';
import IncidentDetails from './stages/incident-reporting/IncidentDetails';
import WitnessInfo from './stages/incident-reporting/WitnessInfo';
import EscalationReport from './stages/incident-reporting/EscalationReport';
import { monitoringService } from '../../../../../services/monitoringService';

interface IncidentReportingFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext?: () => void;
}

export default function IncidentReportingForm({ formData, setFormData, onNext }: IncidentReportingFormProps) {
  const [stage, setStage] = useState<number>(1);
  const totalStages = 4;

  const stages = ['Incident Basics', 'Details', 'Evidence', 'Escalation'];

  const handleNext = (data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      incidentReport: {
        ...prev.incidentReport,
        ...data,
      },
    }));
    setStage((prev) => prev + 1);
  };

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="mb-10">
        <div className="flex justify-between items-center">
          {stages.map((label, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300
                ${stage > index + 1
                  ? 'bg-[#006837] text-white'
                  : stage === index + 1
                    ? 'bg-[#8cc63f] text-white'
                    : 'bg-gray-200 text-gray-500'}`}>
                {index + 1}
              </div>
              <p className={`mt-2 text-sm font-medium ${stage >= index + 1 ? 'text-[#006837]' : 'text-gray-500'}`}>
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="relative mt-4 h-1 bg-gray-200">
          <div className="absolute top-0 left-0 h-1 bg-[#006837] transition-all duration-500" style={{ width: `${(stage / totalStages) * 100}%` }}></div>
        </div>
      </div>

      {/* Form Stages */}
      <div className="animate-fade-in">
        {stage === 1 && (
          <IncidentBasics
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {stage === 2 && (
          <IncidentDetails
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {stage === 3 && (
          <WitnessInfo
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {stage === 4 && (
          <EscalationReport
            formData={formData}
            setFormData={setFormData}
            onNext={async (data) => {
              const updatedData = {
                ...formData,
                incidentReport: {
                  ...formData.incidentReport,
                  ...data,
                },
              };

              setFormData(updatedData);

              try {
                // Create incident report object for API
                const incidentReportData = {
                  submissionId: formData.submissionId || monitoringService.generateSubmissionId(),
                  incidentType: updatedData.incidentReport.incidentType || 'General Incident',
                  severity: updatedData.incidentReport.severity || 'medium',
                  description: updatedData.incidentReport.incident_narrative || 'No description provided',
                  timeReported: new Date().toISOString(),
                  resolved: false,
                  // Map all form fields to API fields
                  officerNameOrId: updatedData.incidentReport.officerNameOrId,
                  incidentDate: updatedData.incidentReport.incidentDate,
                  incidentStartTime: updatedData.incidentReport.incidentStart,
                  incidentEndTime: updatedData.incidentReport.incidentEnd,
                  captureMethod: updatedData.incidentReport.captureMethod || [],
                  weatherConditions: updatedData.incidentReport.conditions,
                  irregularities: updatedData.incidentReport.irregularities || [],
                  perpetrators: updatedData.incidentReport.perpetrators,
                  victims: updatedData.incidentReport.victims,
                  officialsPresent: updatedData.incidentReport.officialsPresent,
                  witnesses: updatedData.incidentWitnesses || [],
                  reportedToAuthorities: updatedData.reportedToAuthorities,
                  additionalNotes: updatedData.additionalNotes
                };

                const response = await monitoringService.submitIncidentReport(incidentReportData);
                console.log('✅ Incident Report Submitted:', response);
                if (onNext) onNext();
              } catch (error: any) {
                console.error('❌ Error submitting incident report:', error);
                alert(error?.message || 'Submission failed. Please try again.');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
