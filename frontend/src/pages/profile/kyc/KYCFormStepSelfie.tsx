import { useEffect, useRef, useState } from "react";
import NextButton from "../../../components/NextButton";
import BackButton from "../../../components/BackButton";
import { toast } from "react-hot-toast";
import { saveSelfieStep } from "../../../services/kycService";
import imageCompressor from "../../../utils/ImageCompression";

// Helper function to convert base64 to File object for compression
const base64ToFile = (base64String: string, filename: string): File => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

interface Props {
  initialData?: {
    selfieBlob?: Blob;
    selfieBase64?: string;
    selfiePreviewUrl?: string;
  };
  onNext: (data: {
    selfieBlob?: Blob;
    selfieBase64: string;
    selfiePreviewUrl: string
  }) => void;
  onBack?: () => void;
}

export default function KYCFormStepSelfie({ initialData, onNext, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.selfiePreviewUrl || null);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(initialData?.selfieBlob || null);
  const [selfieBase64, setSelfieBase64] = useState<string>(initialData?.selfieBase64 || "");
  const [cameraActive, setCameraActive] = useState<boolean>(!initialData?.selfiePreviewUrl);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    // Only start camera if we don't already have a selfie preview from the server
    if (cameraActive && !previewUrl) {
      const startCamera = async () => {
        try {
          setCameraError(null); // Clear any previous errors
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err: any) {
          console.error("Camera access error:", err);

          let errorMessage = "Unable to access camera. ";
          let instructions = "";

          if (err.name === 'NotAllowedError') {
            errorMessage += "Camera access was denied.";
            instructions = "Please click the camera icon in your browser's address bar and allow camera access, then click 'Try Again'.";
          } else if (err.name === 'NotFoundError') {
            errorMessage += "No camera found on this device.";
            instructions = "Please ensure your device has a working camera and try again.";
          } else if (err.name === 'NotReadableError') {
            errorMessage += "Camera is being used by another application.";
            instructions = "Please close other applications using the camera and try again.";
          } else {
            errorMessage += "Please check your camera permissions.";
            instructions = "Make sure your browser has permission to access the camera and try again.";
          }

          setCameraError(`${errorMessage} ${instructions}`);
          setCameraActive(false);

          toast.error(`${errorMessage} ${instructions}`, {
            duration: 8000,
            style: {
              maxWidth: '500px',
            }
          });

          // If user has an existing selfie from the server, let them proceed with that
          if (initialData?.selfiePreviewUrl) {
            setPreviewUrl(initialData.selfiePreviewUrl);
            toast.success("Using your previously uploaded selfie", { duration: 4000 });
          }
        }
      };

      startCamera();
    }

    return () => {
      if (cameraActive) {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive, previewUrl, initialData]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Show processing toast
    toast.loading("Processing image...", { id: "processing-selfie" });

    try {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      // Get the image as base64 string (original quality)
      const originalBase64 = canvasRef.current.toDataURL("image/jpeg");

      // Convert base64 to File for compression
      const imageFile = base64ToFile(originalBase64, "selfie.jpg");

      // Compress the image
      const compressionResult = await imageCompressor(imageFile);

      // If compression succeeded, convert the compressed file back to base64
      let compressedBase64 = originalBase64;
      let usedCompression = false;

      if (compressionResult.compressedFile) {
        const reader = new FileReader();
        compressedBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressionResult.compressedFile as Blob);
        });
        usedCompression = true;
      }

      // Save the compressed base64 string
      setSelfieBase64(compressedBase64);
      setPreviewUrl(compressedBase64);

      // Also get it as a blob for preview
      if (compressionResult.compressedFile) {
        setSelfieBlob(compressionResult.compressedFile as unknown as Blob);
      } else {
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            setSelfieBlob(blob);
          }
        }, "image/jpeg");
      }

      toast.success(
        usedCompression ? "Image compressed successfully" : "Selfie captured",
        { id: "processing-selfie" }
      );
    } catch (error) {
      console.error("Error capturing or compressing selfie:", error);
      toast.error("Error processing selfie", { id: "processing-selfie" });
    } finally {
      // Stop camera after capture regardless of success or failure
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleRetake = () => {
    setSelfieBlob(null);
    setSelfieBase64("");
    setPreviewUrl(null);
    setCameraActive(true);
    setCameraError(null);
  };

  const retryCamera = () => {
    setCameraError(null);
    setCameraActive(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine if we have either:
    // 1. An existing selfie URL from the server (initialData.selfiePreviewUrl)
    // 2. A newly captured selfie (selfieBase64)
    const hasExistingSelfie = previewUrl && initialData?.selfiePreviewUrl;
    const hasNewSelfie = !!selfieBase64 && selfieBase64.length > 0;

    // If the user has an existing selfie from the server and hasn't taken a new one,
    // we can just proceed with the existing selfie
    if (!hasNewSelfie && hasExistingSelfie) {
      onNext({
        selfiePreviewUrl: initialData!.selfiePreviewUrl!,
        selfieBase64: "" // Empty means no change
      });
      return;
    }

    // If no selfie is available (neither existing nor newly captured),
    // show an error and prevent proceeding
    if (!hasNewSelfie && !hasExistingSelfie) {
      toast.error("Please capture a selfie to proceed");
      return;
    }

    try {
      setIsSaving(true);
      toast.loading("Saving your selfie...", { id: "selfie-upload" });

      // Upload the selfie to Cloudinary via our backend
      const response = await saveSelfieStep(selfieBase64);

      if (response.selfieImageUrl) {
        toast.success("Selfie saved successfully", { id: "selfie-upload" });

        // Continue to next step with the Cloudinary URL
        onNext({
          selfieBlob: selfieBlob || undefined,
          selfieBase64: "", // Don't need to send base64 anymore
          selfiePreviewUrl: response.selfieImageUrl
        });
      } else {
        throw new Error("Failed to get selfie URL from server");
      }
    } catch (error: any) {
      console.error("Error saving selfie:", error);
      toast.error(error.message || "Failed to save selfie", { id: "selfie-upload" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mt-12 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6 border">
        <div>
          <h2 className="text-2xl font-semibold text-[#006837]">Step 3: Capture Selfie</h2>
          <p className="text-sm text-gray-600 mt-1">
            Your face must be clearly visible and well-lit. This selfie will be used to verify your identity.
          </p>
          {!previewUrl && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                You must capture a selfie to complete this step
              </p>
            </div>
          )}
        </div>

        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border bg-gray-100 flex justify-center items-center relative">
          {!previewUrl ? (
            cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : cameraError ? (
              <div className="text-center p-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">{cameraError}</p>
                <button
                  type="button"
                  onClick={retryCamera}
                  className="px-4 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00552d] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">Loading camera...</p>
              </div>
            )
          ) : (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Selfie Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 right-2 bg-white/90 text-xs px-2 py-1 rounded text-gray-700 font-medium shadow">
                Preview
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-between gap-4 items-center">
          {!previewUrl ? (
            cameraActive && !cameraError ? (
              <button
                type="button"
                onClick={handleCapture}
                className="px-5 py-2 rounded-full bg-[#0f0f0f] hover:cursor-pointer text-white font-semibold hover:bg-[#343434] transition-colors"
              >
                Capture Selfie
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                {cameraError ? "Camera unavailable - please try again" : "Setting up camera..."}
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={handleRetake}
              className="px-5 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
            >
              Retake
            </button>
          )}

          <div className="flex gap-4">
            {onBack && <BackButton onClick={onBack} />}
            <NextButton
              content={isSaving ? "Saving..." : "Finish"}
              disabled={isSaving || (!previewUrl && !initialData?.selfiePreviewUrl)}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
