import React, { useState, useRef } from 'react';
import axios from 'axios';
import { User, Camera, Loader2, Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
  prevStep: (stepDecrement?: number) => void;
}

const ProfileStep: React.FC<Props> = ({ data, updateData, nextStep, prevStep }) => {
  const [name, setName] = useState(data.name || data.googleData?.displayName || '');
  const [profileImage, setProfileImage] = useState(data.profileImage || data.googleData?.photoUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error: any) {
      console.error('Camera access denied:', error);
      setCameraError('Unable to access camera. Please allow camera permissions or upload a photo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    setIsCameraActive(false);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const context = canvas.getContext('2d');
    if (!context) {
      setIsCapturing(false);
      return;
    }

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const minDimension = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - minDimension) / 2;
    const sy = (video.videoHeight - minDimension) / 2;

    context.drawImage(video, sx, sy, minDimension, minDimension, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setProfileImage(dataUrl);

    stopCamera();
    setIsCapturing(false);
  };

  const dataURLToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[arr.length - 1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your full name');
      return;
    }

    setUploadError('');

    // If user uploaded or captured a new image, upload it
    let imageUrl = profileImage;

    if (!imageUrl) {
      setUploadError('Please capture or upload a photo before continuing.');
      return;
    }

    if (!imageUrl.startsWith('http')) {
      const fileToUpload = imageFile || dataURLToFile(imageUrl, 'profile.jpg');

      if (!fileToUpload) {
        setUploadError('Failed to prepare photo for upload. Please try again.');
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);

        const response = await axios.post(
          `${API_URL}/auth/onboarding/upload-profile-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-onboarding-token': data.token,
            },
          }
        );

        imageUrl = response.data?.data?.url || response.data?.url;
        if (!imageUrl) {
          throw new Error('Upload did not return a file URL');
        }
      } catch (error: any) {
        console.error('Error uploading image:', error);
        setUploadError(error.response?.data?.message || 'Failed to upload image. Please try again.');
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    }

    updateData({
      name: name.trim(),
      profileImage: imageUrl,
    });

    nextStep();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <User className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-gray-600 mt-1">Add your photo and confirm your details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Profile Photo
          </label>
          <div className="grid gap-6 md:grid-cols-[auto,1fr]">
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-36 h-36 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : isCameraActive ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-100">
                    <User className="w-16 h-16 text-green-600" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full">
                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center justify-center gap-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                  >
                    <Camera className="w-4 h-4" />
                    {profileImage ? 'Retake Photo' : 'Capture Photo'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={isCapturing}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Instead
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Use your device camera to capture a clear selfie. Make sure your face is centered, well lit, and without head coverings or sunglasses.
              </p>
              <p className="text-xs text-gray-500">
                We keep photos secure and only use them for internal identity verification.
              </p>
              {cameraError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {cameraError}
                </p>
              )}
              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {uploadError}
                </p>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter your full name as it appears on official documents
          </p>
        </div>

        {/* Google Account Info */}
        {data.googleData && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Google Account Information:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> {data.googleData.email}</p>
              <p><strong>Account:</strong> Verified by Google</p>
            </div>
          </div>
        )}

        {/* Phone Number (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={data.phone}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Phone number cannot be changed
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => prevStep()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileStep;
