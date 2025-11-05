import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, useUserContext } from '../../context/UserContext';
import Toast from '../../components/Toast';
import Modal from '../../components/ui/Modal';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/getCroppedImg';
import compressImage from '../../utils/ImageCompression';
import FormSelect from '../../components/select/FormSelect';
import { genderOptions, ageRangeOptions, OptionType } from '../../utils/lookups';
import { getStateNames, getFormattedLGAs, getFormattedWards, getFormattedPollingUnits } from '../../utils/StateLGAWardPollingUnits';
import { validateUsernameFormat, debouncedUsernameCheck } from '../../services/profileService';
import { NIGERIAN_BANKS } from '../../constants/nigerianBanks';
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

  // Username validation state
  const [usernameValidation, setUsernameValidation] = useState({
    isValidating: false,
    isValid: true,
    message: '',
    available: true
  });

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
  const [votingPU, setVotingPU] = useState(
    profile.votingPU || ''
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

  // Bank account details state
  const [bankName, setBankName] = useState(profile.bankName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(profile.bankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(profile.bankAccountName || '');

  // Dropdown options state
  const [states, setStates] = useState<OptionType[]>([]);

  // Initialize states dropdown
  useEffect(() => {
    const stateNames = getStateNames();
    const stateOptions = stateNames.map((stateName, i) => ({
      id: i,
      label: stateName, // Display UPPERCASE name (e.g., "ABIA")
      value: stateName, // Send UPPERCASE to backend
    }));
    setStates(stateOptions);
  }, []);

  // Handle username change with validation
  const handleUsernameChange = (newUsername: string) => {
    setUserName(newUsername);

    // Reset validation state
    setUsernameValidation({
      isValidating: true,
      isValid: true,
      message: 'Checking username...',
      available: true
    });

    // If empty, reset validation
    if (!newUsername.trim()) {
      setUsernameValidation({
        isValidating: false,
        isValid: true,
        message: '',
        available: true
      });
      return;
    }

    // First validate format locally
    const formatValidation = validateUsernameFormat(newUsername);
    if (!formatValidation.valid) {
      setUsernameValidation({
        isValidating: false,
        isValid: false,
        message: formatValidation.message,
        available: false
      });
      return;
    }

    // Then check availability with debouncing
    debouncedUsernameCheck(newUsername, (result: any) => {
      setUsernameValidation({
        isValidating: false,
        isValid: result.valid,
        message: result.message,
        available: result.available || false
      });
    });
  };

  // Helper functions for cascading dropdowns
  const getLgas = (stateName: string): OptionType[] => {
    if (!stateName) return [];
    const formattedLGAs = getFormattedLGAs(stateName);
    return formattedLGAs.map((lga, i) => ({
      id: i,
      label: lga.label, // Display with abbreviation (e.g., "01 - ABA NORTH")
      value: lga.value // Send only name to backend (e.g., "ABA NORTH")
    }));
  };

  const getWards = (stateName: string, lgaName: string): OptionType[] => {
    if (!stateName || !lgaName) return [];
    const formattedWards = getFormattedWards(stateName, lgaName);
    return formattedWards.map((ward, i) => ({
      id: i,
      label: ward.label, // Display with abbreviation (e.g., "01 - EZIAMA")
      value: ward.value // Send only name to backend (e.g., "EZIAMA")
    }));
  };

  // Get polling units for the selected location
  const getPollingUnits = (): OptionType[] => {
    if (!votingState || !votingLGA || !votingWard) {
      return [];
    }

    try {
      // Use the new helper function that returns formatted polling units with abbreviations
      const formattedPollingUnits = getFormattedPollingUnits(votingState, votingLGA, votingWard);
      return formattedPollingUnits.map((pu, i) => ({
        id: i,
        label: pu.label, // Display with abbreviation (e.g., "005 - ABIA POLY - ABIA POLY I")
        value: pu.value // Send only name to backend (e.g., "ABIA POLY - ABIA POLY I")
      }));
    } catch (error) {
      console.error('Error getting polling units:', error);
      return [];
    }
  };

  // Dropdown options
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

      setUserName(newUserName);
      setGender(newGender);
      setAgeRange(newAgeRange);
      setCitizenship(newCitizenship);
      setStateOfOrigin(newStateOfOrigin);
      setVotingState(newVotingState);
      setVotingLGA(newVotingLGA);
      setVotingWard(newVotingWard);
      setVotingPU(profile.votingPU || '');
      setIsVoter(newIsVoter);
      setWillVote(newWillVote);

      // Set bank account details
      setBankName(profile.bankName || '');
      setBankAccountNumber(profile.bankAccountNumber || '');
      setBankAccountName(profile.bankAccountName || '');
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
    // Validate username before saving
    if (userName && userName.trim() && (!usernameValidation.isValid || !usernameValidation.available)) {
      setToastInfo({
        message: 'Please fix the username error before saving',
        type: 'error'
      });
      return;
    }

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
        // Send location data as-is (UPPERCASE format)
        stateOfOrigin: stateOfOrigin || undefined,
        votingState: votingState || undefined,
        votingLGA: votingLGA || undefined,
        votingWard: votingWard || undefined,
        votingPU: votingPU || '', // Add polling unit
        isVoter,
        willVote,
        // Bank account details
        bankName: bankName || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        bankAccountName: bankAccountName || undefined,
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
                <div className="relative">
                  <input
                    id="userName"
                    value={userName}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="Enter your username (letters, numbers, _ only)"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 transition text-gray-900 ${usernameValidation.isValid
                      ? 'border-gray-300 focus:ring-[#006837] focus:border-[#006837]'
                      : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      }`}
                  />
                  {usernameValidation.isValidating && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#006837]"></div>
                    </div>
                  )}
                  {!usernameValidation.isValidating && !usernameValidation.isValid && (
                    <div className="absolute right-3 top-2.5 text-red-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!usernameValidation.isValidating && usernameValidation.isValid && usernameValidation.available && userName && userName.trim() && (
                    <div className="absolute right-3 top-2.5 text-green-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {usernameValidation.message && (
                  <p className={`text-xs mt-1 ${usernameValidation.isValid && usernameValidation.available
                    ? 'text-green-600'
                    : 'text-red-600'
                    }`}>
                    {usernameValidation.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  3-20 characters. Letters, numbers, and underscores only. No spaces.
                </p>
              </div>

              {/* Gender */}
              <div>
                <FormSelect
                  label="Gender"
                  options={genderOptions}
                  defaultSelected={gender}
                  onChange={(opt) => {
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
                    if (opt) {
                      setCitizenship(opt.value);
                      // Set default country based on citizenship
                      if (opt.value === 'Nigerian Citizen') {
                        setCountryCode('Nigeria');
                      } else if (opt.value === 'Diasporan') {
                        // Keep existing country or clear for user to enter diaspora country
                        if (!countryCode || countryCode === 'Nigeria') {
                          setCountryCode(''); // Clear for user to enter diaspora country
                        }
                      } else if (opt.value === 'Foreigner') {
                        setCountryCode(''); // Clear country for foreigners to enter manually
                      }
                    }
                  }}
                  key={`citizenship-${citizenship}`} // Force re-render when citizenship changes
                />
              </div>

              {/* Country - Show for Foreigners and Diasporans */}
              {(citizenship === 'Foreigner' || citizenship === 'Diasporan') && (
                <div>
                  <label htmlFor="countryCode" className="block text-sm font-medium text-gray-600 mb-1">
                    Country {citizenship === 'Diasporan' ? 'of Residence' : ''}
                  </label>
                  <input
                    id="countryCode"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder={citizenship === 'Diasporan' ? 'Enter your country of residence' : 'Enter your country'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] transition text-gray-900"
                  />
                  {citizenship === 'Diasporan' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the country where you currently reside as a Nigerian in the diaspora
                    </p>
                  )}
                </div>
              )}

              {/* State of Origin */}
              <div>
                <FormSelect
                  label="State of Origin"
                  options={states}
                  defaultSelected={stateOfOrigin}
                  onChange={(opt) => {
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
                  defaultSelected={votingState}
                  onChange={(opt) => {
                    const newState = opt?.value || '';
                    setVotingState(newState);
                    // Reset dependent fields
                    setVotingLGA('');
                    setVotingWard('');
                    setVotingPU('');
                  }}
                  key={`votingState-${votingState}`}
                />
              </div>

              {/* Voting LGA */}
              <div>
                <FormSelect
                  label="Voting LGA"
                  options={getLgas(votingState)}
                  defaultSelected={votingLGA}
                  onChange={(opt) => {
                    const newLGA = opt?.value || '';
                    setVotingLGA(newLGA);
                    // Reset dependent fields
                    setVotingWard('');
                    setVotingPU('');
                  }}
                  disabled={!votingState}
                  key={`votingLGA-${votingLGA}`}
                />
              </div>

              {/* Voting Ward */}
              <div>
                <FormSelect
                  label="Voting Ward"
                  options={getWards(votingState, votingLGA)}
                  defaultSelected={votingWard}
                  onChange={(opt) => {
                    const newWard = opt?.value || '';
                    setVotingWard(newWard);
                    // Reset polling unit when ward changes
                    setVotingPU('');
                  }}
                  disabled={!votingLGA}
                  key={`votingWard-${votingWard}`}
                />
              </div>

              {/* Voting Polling Unit */}
              <div>
                <FormSelect
                  label="Voting Polling Unit"
                  options={getPollingUnits()}
                  defaultSelected={votingPU}
                  onChange={(opt) => {
                    const newPU = opt?.value || '';
                    setVotingPU(newPU);
                  }}
                  disabled={!votingWard}
                  key={`votingPU-${votingPU}`}
                  placeholder="Select your polling unit"
                />
              </div>

              {/* Bank Account Details Section */}
              <div className="col-span-2 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Account Details (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Provide your bank details for future payments and reimbursements
                </p>
              </div>

              {/* Bank Name */}
              <div>
                <FormSelect
                  label="Bank Name"
                  options={NIGERIAN_BANKS.map((bank, index) => ({
                    id: index,
                    label: bank,
                    value: bank
                  }))}
                  defaultSelected={bankName}
                  onChange={(opt) => {
                    if (opt) setBankName(opt.value);
                  }}
                  key={`bankName-${bankName}`}
                  placeholder="Select your bank"
                />
              </div>

              {/* Bank Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
                    if (value.length <= 10) { // Nigerian account numbers are 10 digits
                      setBankAccountNumber(value);
                    }
                  }}
                  placeholder="Enter 10-digit account number"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-transparent"
                  maxLength={10}
                />
                {bankAccountNumber && bankAccountNumber.length !== 10 && (
                  <p className="text-xs text-amber-600 mt-1">Account number must be 10 digits</p>
                )}
              </div>

              {/* Bank Account Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Enter account holder name"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-transparent"
                />
              </div>

              {/* Voter Registration Status */}
              <div>
                <FormSelect
                  label="Are you a Registered Voter?"
                  options={yesNoOptions}
                  defaultSelected={isVoter}
                  onChange={(opt) => {
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
                disabled={loading || usernameValidation.isValidating || (Boolean(userName?.trim()) && (!usernameValidation.isValid || !usernameValidation.available))}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${loading || usernameValidation.isValidating || (Boolean(userName?.trim()) && (!usernameValidation.isValid || !usernameValidation.available))
                  ? 'bg-[#80a79a] cursor-not-allowed'
                  : 'bg-[#006837] hover:bg-[#00592e]'
                  }`}
              >
                {loading ? 'Saving...' : usernameValidation.isValidating ? 'Validating...' : 'Save Changes'}
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