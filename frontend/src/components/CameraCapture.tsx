import { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => Promise<void> | void;
  label: string;
  accept?: string;
  currentPreview?: string;
  uploading?: boolean;
  uploadProgress?: number;
  disabled?: boolean;
}

export default function CameraCapture({
  onCapture,
  label,
  accept = 'image/*',
  currentPreview,
  uploading = false,
  uploadProgress = 0,
  disabled = false
}: CameraCaptureProps) {
  const [mode, setMode] = useState<'select' | 'camera'>('select');
  const [preview, setPreview] = useState<string>(currentPreview || '');
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Update preview when currentPreview changes
  useEffect(() => {
    if (currentPreview) {
      setPreview(currentPreview);
    }
  }, [currentPreview]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
      }

      setMode('camera');
    } catch (error: any) {
      console.error('Camera access error:', error);
      setCameraError('Cannot access camera. Please check permissions or use file upload.');

      // Fallback to file upload if camera fails
      setTimeout(() => {
        setMode('select');
      }, 3000);
    }
  };

  const switchCamera = async () => {
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Switch facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // Start camera with new facing mode
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      setCameraError('Failed to switch camera');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const timestamp = Date.now();
      const file = new File([blob], `capture-${timestamp}.jpg`, {
        type: 'image/jpeg'
      });

      setPreview(URL.createObjectURL(blob));
      stopCamera();

      // Call the onCapture callback
      await onCapture(file);
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setMode('select');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    await onCapture(file);

    // Reset input
    e.target.value = '';
  };

  const clearPreview = () => {
    setPreview('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {uploading && <span className="text-[#8cc63f] ml-2">(Uploading...)</span>}
      </label>

      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {cameraError}
        </div>
      )}

      {mode === 'select' && !preview && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled || uploading}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5 text-[#006837]" />
            <span className="text-sm font-medium">Take Photo</span>
          </button>

          <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-[#006837]" />
            <span className="text-sm font-medium">Upload File</span>
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {mode === 'camera' && (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg"
            style={{ maxHeight: '400px' }}
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 items-center">
            <button
              type="button"
              onClick={switchCamera}
              className="bg-white/90 hover:bg-white text-[#006837] p-3 rounded-full shadow-lg transition-all"
              title="Switch Camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              className="bg-white hover:bg-gray-100 text-[#006837] px-8 py-3 rounded-full font-medium shadow-lg transition-all"
            >
              Capture
            </button>

            <button
              type="button"
              onClick={stopCamera}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {preview && mode !== 'camera' && (
        <div className="relative mt-2">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />

          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {!uploading && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {preview && !uploading && (
        <button
          type="button"
          onClick={() => setPreview('')}
          className="text-sm text-[#006837] hover:underline"
        >
          Change photo
        </button>
      )}
    </div>
  );
}
