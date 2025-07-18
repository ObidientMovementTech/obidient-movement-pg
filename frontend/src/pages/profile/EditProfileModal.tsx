import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, useUserContext } from '../../context/UserContext';
import Toast from '../../components/Toast';
import Modal from '../../components/ui/Modal';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/getCroppedImg';
import compressImage from '../../utils/ImageCompression';
import FormSelect from '../../components/select/FormSelect';
import { genderOptions, ageRangeOptions, OptionType } from '../../utils/lookups';
import { statesLGAWardList } from '../../utils/StateLGAWard';
import { formatStateName, formatLocationName } from '../../utils/textUtils';
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
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Enhanced profile fields from migration (with backward compatibility)
  const [userName, setUserName] = useState(
    profile.userName || profile.personalInfo?.user_name || ''
  );
  const [gender, setGender] = useState(
    profile.gender || profile.personalInfo?.gender || ''
  );
  const [ageRange, setAgeRange] = useState(
    profile.ageRange || profile.personalInfo?.age_range || ''
  );
  const [stateOfOrigin, setStateOfOrigin] = useState(
    profile.stateOfOrigin || profile.personalInfo?.state_of_origin || ''
  );
  const [votingState, setVotingState] = useState(
    profile.votingState || profile.personalInfo?.voting_engagement_state || ''
  );
  const [votingLGA, setVotingLGA] = useState(
    profile.votingLGA || profile.personalInfo?.lga || ''
  );
  const [votingWard, setVotingWard] = useState(
    profile.votingWard || profile.personalInfo?.ward || ''
  );
  const [citizenship, setCitizenship] = useState(
    profile.citizenship || profile.personalInfo?.citizenship || ''
  );
  const [isVoter, setIsVoter] = useState(
    profile.isVoter || profile.onboardingData?.votingBehavior?.is_registered || ''
  );
  const [willVote, setWillVote] = useState(
    profile.willVote || profile.onboardingData?.votingBehavior?.likely_to_vote || ''
  );

  // Additional missing state variables
  const [countryCode, setCountryCode] = useState(() => {
    const existingCountry = profile.countryCode || '';
    const existingCitizenship = profile.citizenship || profile.personalInfo?.citizenship || '';

    // Set default country based on citizenship
    if (existingCitizenship === 'Nigerian Citizen' || existingCitizenship === 'Diasporan') {
      return 'Nigeria';
    }
    return existingCountry;
  });

  // For cascading dropdowns
  const [selectedState, setSelectedState] = useState(profile.votingState || '');
  const [selectedLGA, setSelectedLGA] = useState(profile.votingLGA || '');

  // Dropdown options state
  const [states, setStates] = useState<OptionType[]>([]);

  // Initialize states dropdown
  useEffect(() => {
    const stateOptions = statesLGAWardList.map((s, i) => ({
      id: i,
      label: formatStateName(s.state), // Display formatted name
      value: s.state, // Keep original value for backend
    }));
    setStates(stateOptions);
  }, []);

  // Helper functions for cascading dropdowns (same as KYC)
  const getLgas = (stateName: string): OptionType[] => {
    const found = statesLGAWardList.find(s => s.state === stateName);
    return found ? found.lgas.map((l, i) => ({
      id: i,
      label: formatLocationName(l.lga), // Display formatted name
      value: l.lga // Keep original value for backend
    })) : [];
  };

  const getWards = (lga: string, state: string): OptionType[] => {
    const stateData = statesLGAWardList.find(s => s.state === state);
    const lgaData = stateData?.lgas.find(l => l.lga === lga);
    return lgaData ? lgaData.wards.map((w, i) => ({
      id: i,
      label: formatLocationName(w), // Display formatted name
      value: w // Keep original value for backend
    })) : [];
  };

  // Dropdown options (same as KYC)
  const citizenshipOptions = [
    { id: 1, label: "Nigerian Citizen", value: "Nigerian Citizen" },
    { id: 2, label: "Diasporan", value: "Diasporan" },
    { id: 3, label: "Foreigner", value: "Foreigner" },
  ];

  const yesNoOptions = [
    { id: 1, label: "Yes", value: "Yes" },
    { id: 2, label: "No", value: "No" },
  ];

  useEffect(() => {
    if (isOpen) {
      // Debug: Log the profile object to see what data is available
      console.log('🔍 EditProfileModal - Profile object:', {
        profile: profile,
        personalInfo: profile.personalInfo,
        onboardingData: profile.onboardingData,
        directFields: {
          userName: profile.userName,
          gender: profile.gender,
          ageRange: profile.ageRange,
          citizenship: profile.citizenship,
          stateOfOrigin: profile.stateOfOrigin,
          votingState: profile.votingState,
          votingLGA: profile.votingLGA,
          votingWard: profile.votingWard,
          isVoter: profile.isVoter,
          willVote: profile.willVote
        }
      });

      setName(profile.name);
      setPhone(profile.phone);
      setImageUrl(profile.profileImage);
      setFileSrc(null);

      // Use flattened fields directly from the profile object (with fallback to nested structure)
      const newUserName = profile.userName || profile.personalInfo?.user_name || '';
      const newGender = profile.gender || profile.personalInfo?.gender || '';
      const newAgeRange = profile.ageRange || profile.personalInfo?.age_range || '';
      const newCitizenship = profile.citizenship || profile.personalInfo?.citizenship || '';
      const newStateOfOrigin = profile.stateOfOrigin || profile.personalInfo?.state_of_origin || '';
      const newVotingState = profile.votingState || profile.personalInfo?.voting_engagement_state || '';
      const newVotingLGA = profile.votingLGA || profile.personalInfo?.lga || '';
      const newVotingWard = profile.votingWard || profile.personalInfo?.ward || '';
      const newIsVoter = profile.isVoter || profile.onboardingData?.votingBehavior?.is_registered || '';
      const newWillVote = profile.willVote || profile.onboardingData?.votingBehavior?.likely_to_vote || '';

      // Debug: Log the resolved values
      console.log('🔍 EditProfileModal - Resolved values:', {
        newUserName,
        newGender,
        newAgeRange,
        newCitizenship,
        newStateOfOrigin,
        newVotingState,
        newVotingLGA,
        newVotingWard,
        newIsVoter,
        newWillVote
      });

      setUserName(newUserName);
      setGender(newGender);
      setAgeRange(newAgeRange);
      setCitizenship(newCitizenship);
      setStateOfOrigin(newStateOfOrigin);
      setVotingState(newVotingState);
      setVotingLGA(newVotingLGA);
      setVotingWard(newVotingWard);
      setIsVoter(newIsVoter);
      setWillVote(newWillVote);

      // Update cascading dropdown states
      setSelectedState(newVotingState);
      setSelectedLGA(newVotingLGA);

      console.log('✅ EditProfileModal - All fields initialized');
    }
  }, [isOpen, profile]);

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
      // Set country based on citizenship
      let finalCountryCode = countryCode;
      if (citizenship === 'Nigerian Citizen' || citizenship === 'Diasporan') {
        finalCountryCode = 'Nigeria';
      }

      // Include all the enhanced profile fields
      const updatedProfile = {
        name,
        phone,
        profileImage: imageUrl,
        // Personal information fields
        userName,
        gender,
        ageRange,
        citizenship,
        countryCode: finalCountryCode,
        // Format location data as Title Case before sending to backend
        stateOfOrigin: stateOfOrigin ? formatStateName(stateOfOrigin) : stateOfOrigin,
        votingState: votingState ? formatStateName(votingState) : votingState,
        votingLGA: votingLGA ? formatLocationName(votingLGA) : votingLGA,
        votingWard: votingWard ? formatLocationName(votingWard) : votingWard,
        isVoter,
        willVote,
      };

      await updateProfile(updatedProfile);
      setToastInfo({ message: 'Profile updated successfully', type: 'success' });
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      setToastInfo({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('Modal closed via close button');
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Edit Your Profile" maxWidth="max-w-2xl">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
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

            {/* Personal Information Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

              {/* Username */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-600 mb-1">
                  Username
                </label>
                <input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] transition text-gray-900"
                />
              </div>

              {/* Gender */}
              <div>
                <FormSelect
                  label="Gender"
                  options={genderOptions}
                  defaultSelected={gender}
                  onChange={(opt) => {
                    console.log('🔄 Gender changed:', opt);
                    if (opt) setGender(opt.value);
                  }}
                  key={`gender-${gender}`} // Force re-render when gender changes
                />
              </div>

              {/* Age Range */}
              <div>
                <FormSelect
                  label="Age Range"
                  options={ageRangeOptions}
                  defaultSelected={ageRange}
                  onChange={(opt) => {
                    console.log('🔄 Age Range changed:', opt);
                    if (opt) setAgeRange(opt.value);
                  }}
                  key={`ageRange-${ageRange}`} // Force re-render when ageRange changes
                />
              </div>

              {/* Citizenship */}
              <div>
                <FormSelect
                  label="Citizenship"
                  options={citizenshipOptions}
                  defaultSelected={citizenship}
                  onChange={(opt) => {
                    console.log('🔄 Citizenship changed:', opt);
                    if (opt) {
                      setCitizenship(opt.value);
                      // Set default country based on citizenship
                      if (opt.value === 'Nigerian Citizen' || opt.value === 'Diasporan') {
                        setCountryCode('Nigeria');
                      } else if (opt.value === 'Foreigner') {
                        setCountryCode(''); // Clear country for foreigners to enter manually
                      }
                    }
                  }}
                  key={`citizenship-${citizenship}`} // Force re-render when citizenship changes
                />
              </div>

              {/* Country - Only show for Foreigners */}
              {citizenship === 'Foreigner' && (
                <div>
                  <label htmlFor="countryCode" className="block text-sm font-medium text-gray-600 mb-1">
                    Country
                  </label>
                  <input
                    id="countryCode"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="Enter your country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] transition text-gray-900"
                  />
                </div>
              )}

              {/* State of Origin */}
              <div>
                <FormSelect
                  label="State of Origin"
                  options={states}
                  defaultSelected={stateOfOrigin}
                  onChange={(opt) => {
                    console.log('🔄 State of Origin changed:', opt);
                    if (opt) setStateOfOrigin(opt.value);
                  }}
                  key={`stateOfOrigin-${stateOfOrigin}`} // Force re-render when stateOfOrigin changes
                />
              </div>

              {/* Voting State */}
              <div>
                <FormSelect
                  label="Voting State"
                  options={states}
                  defaultSelected={selectedState}
                  onChange={(opt) => {
                    console.log('🔄 Voting State changed:', opt);
                    const newState = opt?.value || '';
                    setSelectedState(newState);
                    setVotingState(newState);
                    // Reset dependent fields
                    setSelectedLGA('');
                    setVotingLGA('');
                    setVotingWard('');
                  }}
                  key={`votingState-${selectedState}`} // Force re-render when selectedState changes
                />
              </div>

              {/* Voting LGA */}
              <div>
                <FormSelect
                  label="Voting LGA"
                  options={getLgas(selectedState)}
                  defaultSelected={selectedLGA}
                  onChange={(opt) => {
                    console.log('🔄 Voting LGA changed:', opt);
                    const newLGA = opt?.value || '';
                    setSelectedLGA(newLGA);
                    setVotingLGA(newLGA);
                    // Reset ward
                    setVotingWard('');
                  }}
                  disabled={!selectedState}
                  key={`votingLGA-${selectedLGA}`} // Force re-render when selectedLGA changes
                />
              </div>

              {/* Voting Ward */}
              <div>
                <FormSelect
                  label="Voting Ward"
                  options={getWards(selectedLGA, selectedState)}
                  defaultSelected={votingWard}
                  onChange={(opt) => {
                    console.log('🔄 Voting Ward changed:', opt);
                    if (opt) setVotingWard(opt.value);
                  }}
                  disabled={!selectedLGA}
                  key={`votingWard-${votingWard}`} // Force re-render when votingWard changes
                />
              </div>

              {/* Voter Registration Status */}
              <div>
                <FormSelect
                  label="Are you a Registered Voter?"
                  options={yesNoOptions}
                  defaultSelected={isVoter}
                  onChange={(opt) => {
                    console.log('🔄 Voter Registration changed:', opt);
                    if (opt) setIsVoter(opt.value);
                  }}
                  key={`isVoter-${isVoter}`} // Force re-render when isVoter changes
                />
              </div>

              {/* Voting Intention */}
              <div>
                <FormSelect
                  label="Will you vote in the next election?"
                  options={yesNoOptions}
                  defaultSelected={willVote}
                  onChange={(opt) => {
                    console.log('🔄 Voting Intention changed:', opt);
                    if (opt) setWillVote(opt.value);
                  }}
                  key={`willVote-${willVote}`} // Force re-render when willVote changes
                />
              </div>
            </div>

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
      </Modal>
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