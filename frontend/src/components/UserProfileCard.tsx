import { useUser } from "../context/UserContext";
import { CheckCircle, User, LogOut } from "lucide-react";
import { logoutUser } from "../services/authService";

type UserProfileCardProps = {
  setActivePage: (page: string) => void;
};

const UserProfileCard = ({ setActivePage }: UserProfileCardProps) => {
  const { profile, logout } = useUser();

  if (!profile) return null;

  const kycStatusColors = {
    approved: "bg-green-100 text-green-700 border-green-300",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    rejected: "bg-red-100 text-red-700 border-red-300",
    unsubmitted: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const kycText = profile.kycStatus.charAt(0).toUpperCase() + profile.kycStatus.slice(1);

  const handleLogout = async () => {
    try {
      // Clear user context state immediately
      logout();

      // Clear any local storage or session storage
      localStorage.clear();
      sessionStorage.clear();

      // Call the logout API
      await logoutUser();

      // Use window.location.replace instead of href to prevent back navigation
      window.location.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if logout API fails, clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/auth/login");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-full max-w-xs">
      <div className="flex items-center gap-4">
        <img
          src={profile.profileImage || "/default-avatar.png"}
          alt="Profile"
          className="w-12 h-12 rounded-full border"
        />
        <div className="flex flex-col p-2">
          <h2 className="text-sm font-semibold text-gray-800">{profile.name}</h2>
          <p
            title={profile.email}
            className="text-xs text-gray-500 truncate text-ellipsis overflow-hidden max-w-[120px] block"
          >
            {profile.email}
          </p>

        </div>
      </div>

      <div
        className={`mt-3 flex items-center justify-center gap-1 text-xs font-medium px-3 py-1 rounded-lg border ${kycStatusColors[profile.kycStatus]}`}
      >
        <CheckCircle className="w-4 h-4" />
        KYC {kycText}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          className="flex items-center justify-center w-1/2 gap-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setActivePage("My Profile")}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          className="flex items-center justify-center w-1/2 gap-1 px-3 py-2 text-sm bg-[#006837] text-white rounded-lg hover:bg-green-700 transition"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;
