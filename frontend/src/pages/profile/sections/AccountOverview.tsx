import { UserProfile } from "../../../context/UserContext";

interface AccountOverviewProps {
  profile: UserProfile;
  setActivePage?: (page: string) => void;
}

export default function AccountOverview({ profile, setActivePage }: AccountOverviewProps) {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determine signup date
  const signupDate = formatDate(profile.createdAt);

  // Participation stats based on actual user data
  const stats = {
    // Calculate days since joining based on account creation date
    activeDays: profile.createdAt
      ? Math.min(
        Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        30 // Cap at 30 days for display purposes
      )
      : 0,
  };

  // Navigation handlers
  const navigateToSecurity = () => setActivePage && setActivePage("Security");
  const navigateToSettings = () => setActivePage && setActivePage("Settings");

  // KYC status display helper
  const getKycStatusDisplay = () => {
    switch (profile.kycStatus) {
      case 'approved':
        return "Verified";
      case 'pending':
        return "Pending Review";
      case 'rejected':
        return "Verification Failed";
      default:
        return "Not Verified";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#006837] to-[#00552d] text-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {profile.name?.split(' ')[0] || "Citizen"}!</h2>
        <p className="opacity-90">Your citizen engagement journey continues. Here's an overview of your account.</p>
      </div>

      {/* Account Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm">Days Since Joining</div>
          <div className="text-3xl font-bold text-gray-800">{stats.activeDays}</div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
          <button
            onClick={() => setActivePage && setActivePage("Settings")}
            className="text-sm text-[#006837] hover:text-[#00552d] font-medium flex items-center"
          >
            Edit
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
            <p className="mt-1 text-gray-800">{profile.name || "Not provided"}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
            <div className="mt-1 flex items-center">
              <p className="text-gray-800 mr-2">{profile.email || "Not provided"}</p>
              {profile.emailVerified && (
                <span className="bg-green-100 text-[#006837] text-xs px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
            <p className="mt-1 text-gray-800">{profile.phone || "Not provided"}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
            <p className="mt-1 text-gray-800">{signupDate}</p>
          </div>

          {profile.personalInfo?.state_of_origin && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">State of Origin</h4>
              <p className="mt-1 text-gray-800">{profile.personalInfo.state_of_origin}</p>
            </div>
          )}

          {profile.personalInfo?.voting_engagement_state && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Voting in State</h4>
              <p className="mt-1 text-gray-800">{profile.personalInfo.voting_engagement_state}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-500">KYC Status</h4>
            <div className="mt-1 flex items-center">
              <p className="text-gray-800 mr-2">{getKycStatusDisplay()}</p>
              {profile.kycStatus === 'approved' && (
                <span className="bg-green-100 text-[#006837] text-xs px-2 py-0.5 rounded-full">Verified</span>
              )}
              {profile.kycStatus === 'pending' && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Pending</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Summary and Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Recommendations</h3>
        </div>
        <div className="p-5 space-y-4">
          {!profile.emailVerified && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="text-yellow-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-sm text-yellow-800">Verify your email address</h4>
                <p className="text-sm text-yellow-700 mt-1">Secure your account by verifying your email address.</p>
                <button
                  onClick={navigateToSettings}
                  className="mt-2 text-xs font-medium bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition"
                >
                  Verify Email
                </button>
              </div>
            </div>
          )}

          {profile.kycStatus !== 'approved' && (
            <div className="flex items-start space-x-3 p-3 bg-[#e6f1ed] rounded-lg">
              <div className="text-[#006837] flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-sm text-[#006837]">Complete KYC verification</h4>
                <p className="text-sm text-[#00552d] mt-1">Verify your identity to unlock all features and build trust.</p>
                <button
                  onClick={navigateToSecurity}
                  className="mt-2 text-xs font-medium bg-[#006837] text-white px-3 py-1 rounded-md hover:bg-[#00552d] transition"
                >
                  Go to Security & Verification
                </button>
              </div>
            </div>
          )}



          {profile.emailVerified && profile.kycStatus === 'approved' && (
            <div className="flex items-start space-x-3 p-3 bg-[#e6f1ed] rounded-lg">
              <div className="text-[#006837] flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-sm text-[#006837]">Your account is fully set up!</h4>
                <p className="text-sm text-[#00552d] mt-1">You've completed all recommended account setup steps.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
