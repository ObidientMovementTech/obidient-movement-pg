import { motion } from "framer-motion";
import { useState } from "react";
import { UserProfile } from "../../context/UserContext";
import EditProfileModal from "./EditProfileModal";
import Loading from "../../components/Loader";

export default function ProfileHero({
  profile,
  onKYCStart,
  onTabChange
}: {
  profile: UserProfile | null;
  onKYCStart?: () => void;
  onTabChange?: (tab: string) => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!profile) {
    return (
      <div className="w-full flex justify-center items-center h-[300px]">
        <Loading />
      </div>
    );
  }

  const initials = profile.name?.charAt(0).toUpperCase() || "C";

  return (
    <>
      <div className="relative w-full mx-auto rounded-3xl overflow-hidden shadow-xl bg-[#232323] font-host">
        {/* Top Gradient Banner */}
        <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-green-700 via-green-600 to-green-700" />

        {/* Avatar overlaps banner */}
        <div className="absolute left-7 top-16 sm:top-16">
          <div className="w-28 h-28 sm:w-48 sm:h-48 rounded-full border-4 border-white dark:border-border overflow-hidden shadow-lg">
            {profile.profileImage ? (
              <motion.img
                src={profile.profileImage}
                alt="Profile"
                className="object-cover w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
            ) : (
              <div className="bg-gray-500 dark:bg-gray-600 w-full h-full flex items-center justify-center text-7xl text-white">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Main Profile Section */}
        <div className="px-6 sm:px-10 pt-20 sm:pt-10 pb-10">
          <div className="sm:ml-56">
            <h1 className="text-2xl text-white  sm:text-3xl font-semibold tracking-tight">{profile.name}</h1>
            <p className="text-white font-[300] text-sm mt-1">{profile.email}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setIsEditOpen(true)}
                className="bg-white text-black cursor-pointer px-5 py-2 rounded-full text-sm hover:scale-95 transition"
              >
                Edit Profile
              </button>

              {/* Begin KYC Button - Show when KYC is unsubmitted */}
              {(!profile.kycStatus || profile.kycStatus === 'unsubmitted') && (
                <button
                  onClick={() => {
                    // Start KYC process directly or navigate to Security tab
                    if (onKYCStart) {
                      onKYCStart();
                    } else if (onTabChange) {
                      onTabChange('Security');
                    } else {
                      // Fallback: navigate to KYC page
                      window.location.href = '/kyc';
                    }
                  }}
                  className="bg-blue-600 text-white cursor-pointer px-5 py-2 rounded-full text-sm hover:bg-blue-700 hover:scale-95 transition flex items-center gap-2"
                >
                  Begin KYC
                </button>
              )}

              {/* KYC Status Badge - Show verification status */}
              {profile.kycStatus && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${profile.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  profile.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    profile.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {profile.kycStatus === 'approved' && '✓ Verified'}
                  {profile.kycStatus === 'pending' && '⏱ Pending Verification'}
                  {profile.kycStatus === 'rejected' && '✗ Verification Rejected'}
                  {profile.kycStatus === 'unsubmitted' && 'Not Verified'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profile={profile}
        />
      )}
    </>
  );
}
