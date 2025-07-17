import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import KYCFormStepValidID from "./KYCFormStepValidID";
import KYCFormStepSelfie from "./KYCFormStepSelfie";
import Progressbar from "../../../components/Progressbar";
import { submitKYCData, getUserKYC } from "../../../services/kycService";
import { toast } from "react-hot-toast";

export default function KYCFormWrapper({ setActivePage }: { setActivePage: (page: string) => void }) {
  const navigate = useNavigate(); // Get the navigate function
  const [step, setStep] = useState(1); // Now starts at 1 (Valid ID), then 2 (Selfie)
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [validID, setValidID] = useState<any>(null);
  const [selfie, setSelfie] = useState<any>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Log when component mounts to verify props
  useEffect(() => {
    console.log('KYCFormWrapper mounted, setActivePage function available:', typeof setActivePage === 'function');
  }, [setActivePage]);

  // Load existing KYC data on mount
  useEffect(() => {
    const fetchKycData = async () => {
      try {
        setIsLoading(true);
        const kycData = await getUserKYC();

        if (kycData) {
          setKycStatus(kycData.kycStatus);

          // Set Valid ID data if it exists 
          if (kycData.validID) {
            setValidID({
              idType: kycData.validID.idType || "",
              idNumber: kycData.validID.idNumber || "",
              idImageUrl: kycData.validID.idImageUrl || null,
              idImageBase64: ""
            });

            // If we have valid ID data and draft/rejected status, determine what step to start from
            if ((kycData.kycStatus === 'draft' || kycData.kycStatus === 'rejected')) {
              // If we have valid ID data but no selfie, go to step 2 (selfie)
              if (kycData.validID?.idType && kycData.validID?.idNumber && !kycData.selfieImageUrl) {
                setStep(2);
              }
            }
          }

          // Set selfie data if it exists
          if (kycData.selfieImageUrl) {
            setSelfie({
              selfiePreviewUrl: kycData.selfieImageUrl,
              selfieBase64: "",
              selfieBlob: null
            });
          }
        }
      } catch (error) {
        console.error("Error fetching KYC data:", error);
        toast.error("Could not load your existing KYC data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKycData();
  }, []);

  const handleNext = (data: any) => {
    console.log(`handleNext called from step ${step} with data:`, data);
    if (step === 1) {
      console.log("Setting valid ID state:", data);
      setValidID(data);
    }
    if (step === 2) {
      console.log("Setting selfie state:", data);
      setSelfie(data);
    }
    console.log(`Moving from step ${step} to step ${step + 1}`);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    console.log(`Moving back from step ${step} to step ${Math.max(1, step - 1)}`);
  };

  // Debug the current state
  useEffect(() => {
    console.log("Current step:", step);
    console.log("Valid ID:", validID);
    console.log("Selfie:", selfie);
  }, [step, validID, selfie]);

  // Show KYC status message/banner
  const renderKycStatusMessage = () => {
    switch (kycStatus) {
      case 'approved':
        return (
          <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-200">
            <p className="text-green-700 font-medium">Your KYC has been approved</p>
          </div>
        );
      case 'pending':
        return (
          <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
            <p className="text-yellow-700 font-medium">Your KYC is pending approval</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-50 p-4 rounded-md mb-6 border border-red-200">
            <p className="text-red-700 font-medium">Your KYC was rejected. Please update your information and try again.</p>
          </div>
        );
      case 'draft':
        return (
          <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
            <p className="text-blue-700 font-medium">Your KYC is in progress. Complete all steps to submit for review.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitSuccess) {
    return (
      <div className="max-w-6xl w-full mx-auto py-10 px-4">
        <div className="bg-green-50 p-8 rounded-lg border border-green-200 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">KYC Submitted Successfully!</h2>
          <p className="text-gray-700 mb-4">Your KYC information has been submitted for review. We'll notify you once it's approved.</p>

          {/* Multiple navigation options for redundancy */}
          <div className="flex justify-center gap-4">
            {/* Primary button: Uses React Router navigation */}
            <button
              onClick={() => {
                console.log("Button clicked, using router navigation");
                // First try setting the active page
                setActivePage("Overview");
                // As a fallback, force navigate to the profile page (this will refresh the component)
                setTimeout(() => navigate("/dashboard"), 50);
              }}
              className="px-6 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00552d]"
            >
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-2xl mb-6 font-bold text-[#006837]">KYC Verification</h1>
        {renderKycStatusMessage()}
        <Progressbar
          currentNumber={step}
          totalSteps={2} // Updated: Only 2 steps now (Valid ID + Selfie)
          onStepClick={(clickedStep) => {
            // Only allow going back to previous steps or current step
            if (clickedStep <= step) {
              // If data is available for the clicked step, navigate to it
              if (
                (clickedStep === 1) ||
                (clickedStep === 2 && validID?.idType && validID?.idNumber)
              ) {
                setStep(clickedStep);
              } else {
                // If data is missing for a previous step, show an error
                toast.error("Please complete previous steps first");
              }
            }
          }}
          // Mark steps as completed if we have their data
          completedSteps={[
            ...(validID?.idType && validID?.idNumber && (validID?.idImageBase64 || validID?.idImageUrl) ? [1] : []),
            ...(selfie?.selfieBase64 || selfie?.selfiePreviewUrl ? [2] : [])
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006837]"></div>
        </div>
      ) : (
        <>
          {step === 1 && (
            <KYCFormStepValidID
              initialData={validID || undefined}
              onNext={handleNext}
            /* No onBack for first step */
            />
          )}

          {step === 2 && (
            <KYCFormStepSelfie
              initialData={selfie || undefined}
              onBack={handleBack}
              onNext={async (finalSelfieData) => {
                const finalPayload = {
                  validID,
                  selfie: finalSelfieData,
                };

                // ✅ Type guards to prevent calling the API with nulls
                if (!finalPayload.validID) {
                  toast.error("Incomplete KYC data. Please fill all steps.");
                  return;
                }

                try {
                  setIsLoading(true);

                  // Validate that all required data is present before submitting
                  if (!finalPayload.validID.idType || !finalPayload.validID.idNumber) {
                    toast.error("Missing ID information. Please complete step 1.");
                    setStep(1);
                    return;
                  }

                  // Strengthen validation for the selfie
                  // Check if we have either a base64 image or a Cloudinary URL
                  const hasSelfie = !!(finalPayload.selfie.selfieBase64 && finalPayload.selfie.selfieBase64.length > 0) ||
                    !!(finalPayload.selfie.selfiePreviewUrl && finalPayload.selfie.selfiePreviewUrl.length > 0);

                  if (!hasSelfie) {
                    toast.error("Missing selfie image. Please capture a selfie.");
                    setStep(2); // Go back to selfie step
                    return;
                  }

                  console.log("📸 Using selfie URL:", finalPayload.selfie.selfiePreviewUrl);

                  // For the simplified KYC, we don't need personal info anymore
                  // Personal info is now handled through profile completion
                  const response = await submitKYCData(
                    null, // No personal info step
                    {
                      idType: finalPayload.validID.idType,
                      idNumber: finalPayload.validID.idNumber,
                      // Only send base64 if we don't have a URL
                      idImageBase64: !finalPayload.validID.idImageUrl ? (finalPayload.validID.idImageBase64 || "") : ""
                    },
                    // Only send selfie base64 if we don't have a cloudinary URL
                    // This should be empty string now as we upload in the selfie step
                    finalPayload.selfie.selfieBase64 || ""
                  );

                  console.log("✅ KYC submitted:", response);
                  toast.success("KYC submitted successfully!");

                  // Set success state immediately
                  console.log("Setting isSubmitSuccess to true");
                  setIsSubmitSuccess(true);

                  // Option: automatically navigate back to overview after 3 seconds
                  // setTimeout(() => {
                  //   navigateToOverview();
                  // }, 3000);
                } catch (err: any) {
                  console.error("❌ KYC submission failed:", err);

                  // Try to extract the most specific error message
                  const errorMessage = err.message ||
                    err.response?.data?.message ||
                    "Something went wrong while submitting your KYC. Please try again.";

                  toast.error(errorMessage);
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
