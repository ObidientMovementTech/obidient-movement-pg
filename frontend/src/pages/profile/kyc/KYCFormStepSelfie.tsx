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

  useEffect(() => {
    // Only start camera if we don't already have a selfie preview from the server
    if (cameraActive && !previewUrl) {
      const startCamera = async () => {
        try {
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
        } catch (err) {
          console.error("Camera access error:", err);

          toast.error("Unable to access camera. Please allow camera access to continue.");

          // If user has an existing selfie from the server, let them proceed with that
          if (initialData?.selfiePreviewUrl) {
            setPreviewUrl(initialData.selfiePreviewUrl);
            setCameraActive(false);
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
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
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
            <button
              type="button"
              onClick={handleCapture}
              className="px-5 py-2 rounded-full bg-[#0f0f0f] hover:cursor-pointer text-white font-semibold hover:bg-[#343434] transition-colors"
            >
              Capture Selfie
            </button>
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
