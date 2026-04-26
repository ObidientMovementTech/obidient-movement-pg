import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useUserContext } from "../../context/UserContext";
import { getProfileCompleteness } from "../../utils/profileCompleteness";
import Toast from "../../components/Toast";
import FormSelect from "../../components/select/FormSelect";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/getCroppedImg";
import compressImage from "../../utils/ImageCompression";
import { genderOptions, ageRangeOptions, OptionType } from "../../utils/lookups";
import {
  getStateNames,
  getFormattedLGAs,
  getFormattedWards,
  getFormattedPollingUnits,
} from "../../utils/StateLGAWardPollingUnits";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile, logout, refreshProfile } = useUserContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──────────────────────────────────────────────
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);

  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [votingState, setVotingState] = useState("");
  const [votingLGA, setVotingLGA] = useState("");
  const [votingWard, setVotingWard] = useState("");
  const [votingPU, setVotingPU] = useState("");
  const [isVoter, setIsVoter] = useState("");
  const [willVote, setWillVote] = useState("");

  const [states, setStates] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Prefill from existing profile ───────────────────────────
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setPhone(profile.phone || "");
    setImageUrl(profile.profileImage || "");
    setGender(profile.gender || profile.personalInfo?.gender || "");
    setAgeRange(profile.ageRange || profile.personalInfo?.age_range || "");
    setStateOfOrigin(
      profile.stateOfOrigin || profile.personalInfo?.state_of_origin || ""
    );
    setVotingState(
      profile.votingState ||
        profile.personalInfo?.voting_engagement_state ||
        ""
    );
    setVotingLGA(profile.votingLGA || profile.personalInfo?.lga || "");
    setVotingWard(profile.votingWard || profile.personalInfo?.ward || "");
    setVotingPU(profile.votingPU || "");
    setIsVoter(
      profile.isVoter ||
        profile.onboardingData?.votingBehavior?.is_registered ||
        ""
    );
    setWillVote(
      profile.willVote ||
        profile.onboardingData?.votingBehavior?.likely_to_vote ||
        ""
    );
  }, [profile]);

  // ── Load Nigerian state names ───────────────────────────────
  useEffect(() => {
    const stateNames = getStateNames();
    setStates(
      stateNames.map((s, i) => ({ id: i, label: s, value: s }))
    );
  }, []);

  // ── Redirect if already complete ────────────────────────────
  useEffect(() => {
    if (profile && getProfileCompleteness(profile).isComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  // ── Completion stats ────────────────────────────────────────
  const completeness = profile ? getProfileCompleteness(profile) : null;

  // ── Cascading dropdown helpers ──────────────────────────────
  const getLgas = (state: string): OptionType[] => {
    if (!state) return [];
    return getFormattedLGAs(state).map((l, i) => ({
      id: i,
      label: l.label,
      value: l.value,
    }));
  };

  const getWards = (state: string, lga: string): OptionType[] => {
    if (!state || !lga) return [];
    return getFormattedWards(state, lga).map((w, i) => ({
      id: i,
      label: w.label,
      value: w.value,
    }));
  };

  const getPollingUnits = (): OptionType[] => {
    if (!votingState || !votingLGA || !votingWard) return [];
    try {
      return getFormattedPollingUnits(votingState, votingLGA, votingWard).map(
        (pu, i) => ({ id: i, label: pu.label, value: pu.value })
      );
    } catch {
      return [];
    }
  };

  const yesNoOptions: OptionType[] = [
    { id: 1, label: "Yes", value: "Yes" },
    { id: 2, label: "No", value: "No" },
  ];

  // ── Image upload ────────────────────────────────────────────
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { compressedFile, error } = await compressImage(file);
    if (error || !compressedFile) {
      setToastInfo({ message: "Image compression failed", type: "error" });
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
      const file = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      });
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(
        `${API_BASE}/users/upload-profile-image`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setImageUrl(res.data.url);
      setToastInfo({ message: "Image uploaded", type: "success" });
    } catch {
      setToastInfo({ message: "Upload failed", type: "error" });
    } finally {
      setLoading(false);
      setFileSrc(null);
    }
  };

  // ── Save ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      setToastInfo({ message: "Full name is required", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        name,
        phone,
        profileImage: imageUrl,
        gender,
        ageRange,
        stateOfOrigin: stateOfOrigin || undefined,
        votingState: votingState || undefined,
        votingLGA: votingLGA || undefined,
        votingWard: votingWard || undefined,
        votingPU: votingPU || undefined,
        isVoter,
        willVote,
      });
      await refreshProfile();
      setToastInfo({ message: "Profile saved!", type: "success" });
      // Router guard in ProtectedRoute will auto-redirect to dashboard
      // once profile is complete
    } catch {
      setToastInfo({ message: "Failed to save. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };

  if (!profile) return null;

  // ── UI ──────────────────────────────────────────────────────
  const inputCls =
    "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#006837] focus:border-[#006837] transition";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Complete Your Profile
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Progress */}
        {completeness && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completeness.completedCount} of {completeness.totalCount}{" "}
                fields completed
              </span>
              <span className="text-sm font-bold text-[#006837]">
                {completeness.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#006837] h-2 rounded-full transition-all duration-500"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
            {completeness.missingFields.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Missing:{" "}
                {completeness.missingFields.length <= 4
                  ? completeness.missingFields.join(", ")
                  : `${completeness.missingFields.slice(0, 3).join(", ")} +${completeness.missingFields.length - 3} more`}
              </p>
            )}
          </div>
        )}

        {/* Form Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {/* Section 1: Profile Photo */}
          <div className="p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Profile Photo
            </h2>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full border-2 border-[#006837] object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-2xl">
                  ?
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-sm px-4 py-2 rounded-lg bg-[#006837] text-white hover:bg-[#00592e] transition"
                >
                  {imageUrl ? "Change Photo" : "Upload Photo"}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>
            </div>
            {fileSrc && (
              <div className="space-y-3">
                <div className="relative w-full h-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Cropper
                    image={fileSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006837]"
                />
                <button
                  type="button"
                  onClick={uploadCroppedImage}
                  disabled={loading}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium transition ${
                    loading
                      ? "bg-[#80a79a] cursor-not-allowed"
                      : "bg-[#006837] hover:bg-[#00592e]"
                  }`}
                >
                  {loading ? "Uploading..." : "Upload Cropped Image"}
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Personal Info */}
          <div className="p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Personal Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Surname first, as on your ID"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className={inputCls}
              />
            </div>
            <FormSelect
              label="Gender"
              required
              options={genderOptions}
              defaultSelected={gender}
              onChange={(opt) => opt && setGender(opt.value)}
              key={`gender-${gender}`}
            />
            <FormSelect
              label="Age Range"
              required
              options={ageRangeOptions}
              defaultSelected={ageRange}
              onChange={(opt) => opt && setAgeRange(opt.value)}
              key={`ageRange-${ageRange}`}
            />
            <FormSelect
              label="State of Origin"
              required
              options={states}
              defaultSelected={stateOfOrigin}
              onChange={(opt) => opt && setStateOfOrigin(opt.value)}
              key={`stateOfOrigin-${stateOfOrigin}`}
            />
          </div>

          {/* Section 3: Voting Location */}
          <div className="p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Voting Location
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select your registered voting location. Each field depends on the
              previous selection.
            </p>
            <FormSelect
              label="Voting State"
              required
              options={states}
              defaultSelected={votingState}
              onChange={(opt) => {
                setVotingState(opt?.value || "");
                setVotingLGA("");
                setVotingWard("");
                setVotingPU("");
              }}
              key={`votingState-${votingState}`}
            />
            <FormSelect
              label="Voting LGA"
              required
              options={getLgas(votingState)}
              defaultSelected={votingLGA}
              onChange={(opt) => {
                setVotingLGA(opt?.value || "");
                setVotingWard("");
                setVotingPU("");
              }}
              disabled={!votingState}
              key={`votingLGA-${votingLGA}`}
            />
            <FormSelect
              label="Voting Ward"
              required
              options={getWards(votingState, votingLGA)}
              defaultSelected={votingWard}
              onChange={(opt) => {
                setVotingWard(opt?.value || "");
                setVotingPU("");
              }}
              disabled={!votingLGA}
              key={`votingWard-${votingWard}`}
            />
            <FormSelect
              label="Polling Unit"
              required
              options={getPollingUnits()}
              defaultSelected={votingPU}
              onChange={(opt) => setVotingPU(opt?.value || "")}
              disabled={!votingWard}
              key={`votingPU-${votingPU}`}
            />
          </div>

          {/* Section 4: Voter Questions */}
          <div className="p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Voter Questions
            </h2>
            <FormSelect
              label="Are you a registered voter?"
              required
              options={yesNoOptions}
              defaultSelected={isVoter}
              onChange={(opt) => opt && setIsVoter(opt.value)}
              key={`isVoter-${isVoter}`}
            />
            <FormSelect
              label="Will you vote in the next election?"
              required
              options={yesNoOptions}
              defaultSelected={willVote}
              onChange={(opt) => opt && setWillVote(opt.value)}
              key={`willVote-${willVote}`}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold text-base transition ${
            loading
              ? "bg-[#80a79a] cursor-not-allowed"
              : "bg-[#006837] hover:bg-[#00592e] active:scale-[0.98]"
          }`}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </main>

      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}
    </div>
  );
}
