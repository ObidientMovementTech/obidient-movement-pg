import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import PUInfoForm from "../components/PUInfoForm";
import { ArrowLeft } from "lucide-react";
import { monitoringService } from '../../../../../services/monitoringService';
import Toast from '../../../../../components/Toast';


export default function PUInfoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    pollingUnitInfo: {
      code: '',
      name: '',
      ward: '',
      lga: '',
      state: '',
      gpsCoordinates: '',
      locationType: '',
      locationOther: '',
    },
  });

  // Auto-populate from monitoring_location
  useEffect(() => {
    const loadMonitoringData = async () => {
      try {
        const statusData = await monitoringService.getMonitoringStatus();

        if (statusData.monitoringScope) {
          setFormData(prev => ({
            pollingUnitInfo: {
              ...prev.pollingUnitInfo,
              code: statusData.monitoringScope?.pollingUnit || prev.pollingUnitInfo.code,
              name: statusData.monitoringScope?.pollingUnitLabel || prev.pollingUnitInfo.name,
              ward: statusData.monitoringScope?.wardLabel || statusData.monitoringScope?.ward || prev.pollingUnitInfo.ward,
              lga: statusData.monitoringScope?.lgaLabel || statusData.monitoringScope?.lga || prev.pollingUnitInfo.lga,
              state: statusData.monitoringScope?.stateLabel || statusData.monitoringScope?.state || prev.pollingUnitInfo.state,
              // Don't overwrite GPS, locationType, locationOther if already set
            },
          }));
        }
      } catch (error) {
        console.error('Error loading monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMonitoringData();
  }, []);

  const handleBack = () => {
    navigate("/dashboard/elections/monitor");
  };

  const handleSubmit = async () => {
    // Validate required fields
    const { pollingUnitInfo } = formData;
    if (!(pollingUnitInfo as any).electionId) {
      setToast({ message: 'Please select an election first', type: 'error' });
      return;
    }

    if (!pollingUnitInfo.code || !pollingUnitInfo.name || !pollingUnitInfo.ward ||
      !pollingUnitInfo.lga || !pollingUnitInfo.state || !pollingUnitInfo.locationType) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const puData = {
        electionId: (formData.pollingUnitInfo as any).electionId,
        puCode: formData.pollingUnitInfo.code,
        puName: formData.pollingUnitInfo.name,
        ward: formData.pollingUnitInfo.ward,
        lga: formData.pollingUnitInfo.lga,
        state: formData.pollingUnitInfo.state,
        gpsCoordinates: formData.pollingUnitInfo.gpsCoordinates || '',
        locationType: formData.pollingUnitInfo.locationType,
        locationOther: formData.pollingUnitInfo.locationOther || ''
      };

      console.log('Submitting PU data:', puData);
      await monitoringService.submitPollingUnitInfo(puData);

      setToast({ message: 'Polling Unit setup completed successfully! Redirecting to dashboard...', type: 'success' });

      // Navigate back to monitoring dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard/elections/monitor');
      }, 2000);

    } catch (error) {
      console.error('Error submitting PU info:', error);
      setToast({ message: 'Failed to submit polling unit information. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white p-5 border-b flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-600 hover:text-[#006837] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        <span className="text-sm text-gray-400">Vote Protection Setup</span>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Confirm Polling Unit Details</h1>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
            <p className="text-green-900 dark:text-green-100 text-sm">
              <strong>Quick Setup:</strong> Your polling unit information has been pre-filled from your assignment.
              Please verify the details and add GPS coordinates if available.
            </p>
          </div>
        </div>

        <PUInfoForm
          formData={formData}
          setFormData={setFormData}
          onNext={handleSubmit}
          loading={loading}
        />
      </div>
    </section>
  );
}