import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { UserProfile, useUserContext } from '../../context/UserContext';
import Toast from '../../components/Toast';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/getCroppedImg';
import compressImage from '../../utils/ImageCompression';
import axios from 'axios';

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}) {
  const { updateProfile } = useUserContext();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [imageUrl, setImageUrl] = useState(profile.profileImage);
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setPhone(profile.phone);
      setImageUrl(profile.profileImage);
      setFileSrc(null);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('Modal closed via ESC key');
        onClose();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, input, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (modalRef.current) {
      const firstInput = modalRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { compressedFile, error } = await compressImage(file);
    if (error || !compressedFile) {
      console.error('Compression failed', error);
      setToastInfo({ message: 'Image compression failed', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => setFileSrc(reader.result as string);
  };

  const onCropComplete = (_: any, areaPixels: any) => {
    setCroppedArea(areaPixels);
  };

  const uploadCroppedImage = async () => {
    if (!fileSrc || !croppedArea) return;
    setLoading(true);
    try {
      const croppedBlob = await getCroppedImg(fileSrc, croppedArea);
      const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/upload-profile-image`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setImageUrl(res.data.url);
      setToastInfo({ message: 'Image uploaded', type: 'success' });
    } catch (err) {
      console.error('Upload error:', err);
      setToastInfo({ message: 'Upload failed', type: 'error' });
    } finally {
      setLoading(false);
      setFileSrc(null);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ name, phone, profileImage: imageUrl });
      setToastInfo({ message: 'Profile updated', type: 'success' });
      onClose();
    } catch {
      setToastInfo({ message: 'Save failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      console.log('Modal closed via overlay click');
      onClose();
    }
  };

  const handleClose = () => {
    console.log('Modal closed via close button');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 transform transition-all duration-300 scale-100 sm:scale-105 max-h-[80vh] overflow-y-auto font-poppins"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Your Profile</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] transition text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] transition text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-600 mb-1">
                Profile Image
              </label>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full border-2 border-[#006837] object-cover mb-3"
                />
              )}
              <input
                id="profileImage"
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#006837] file:text-white file:hover:bg-[#00592e] transition"
              />
            </div>
            {fileSrc && (
              <div className="space-y-4">
                <div
                  className="relative w-full h-64 border border-gray-300 rounded-lg shadow-sm bg-gray-100"
                  aria-describedby="cropper-instructions"
                >
                  <Cropper
                    image={fileSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    aria-label="Crop profile image"
                  />
                  <p id="cropper-instructions" className="sr-only">
                    Use arrow keys to move the crop area, mouse wheel or slider to zoom.
                  </p>
                </div>
                <div>
                  <label htmlFor="zoom" className="block text-sm font-medium text-gray-600 mb-1">
                    Zoom
                  </label>
                  <input
                    id="zoom"
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006837]"
                  />
                </div>
                <button
                  type="button"
                  onClick={uploadCroppedImage}
                  disabled={loading}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${loading ? 'bg-[#80a79a] cursor-not-allowed' : 'bg-[#006837] hover:bg-[#00592e]'
                    }`}
                >
                  {loading ? 'Uploading...' : 'Upload Cropped Image'}
                </button>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${loading ? 'bg-[#80a79a] cursor-not-allowed' : 'bg-[#006837] hover:bg-[#00592e]'
                  }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}
    </>
  );
}