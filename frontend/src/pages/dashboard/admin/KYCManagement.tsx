import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Eye, Search, AlertCircle, Calendar, Filter, User, X } from "lucide-react";
import Loading from "../../../components/Loader";
import Toast from "../../../components/Toast";

// Define types for KYC user data
interface KYCUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: "pending" | "approved" | "rejected" | "unsubmitted";
  kycRejectionReason?: string;
  validID?: {
    idType: string;
    idNumber: string;
    idImageUrl: string;
  };
  personalInfo?: {
    first_name: string;
    last_name: string;
    user_name: string;
    phone_number: string;
    gender: string;
    state_of_origin: string;
    age_range: string;
    [key: string]: any; // For any additional fields
  };
  selfieImageUrl?: string;
  createdAt: string;
}

export default function KYCManagement() {
  const [kycUsers, setKycUsers] = useState<KYCUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<KYCUser | null>(null);
  const [showUserDetail, setShowUserDetail] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch all KYC submissions
  useEffect(() => {
    const fetchKycData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/kyc/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        setKycUsers(response.data);
      } catch (err: any) {
        console.error("Failed to fetch KYC data:", err);
        setError(err.response?.data?.message || "Failed to load KYC submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchKycData();
  }, [API_BASE]);

  // Handle KYC approval
  const handleApprove = async (userId: string) => {
    try {
      await axios.patch(
        `${API_BASE}/kyc/${userId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      // Update UI to reflect the change
      setKycUsers(
        kycUsers.map((user) =>
          user._id === userId ? { ...user, kycStatus: "approved" } : user
        )
      );

      if (activeUser && activeUser._id === userId) {
        setActiveUser({ ...activeUser, kycStatus: "approved" });
      }

      setToast({
        message: "KYC approved successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to approve KYC:", err);
      setToast({
        message: err.response?.data?.message || "Failed to approve KYC",
        type: "error",
      });
    }
  };

  // Handle KYC rejection
  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) {
      setToast({
        message: "Please provide a reason for rejection",
        type: "error",
      });
      return;
    }

    try {
      await axios.patch(
        `${API_BASE}/kyc/${userId}/reject`,
        { reason: rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      // Update UI to reflect the change
      setKycUsers(
        kycUsers.map((user) =>
          user._id === userId
            ? { ...user, kycStatus: "rejected", kycRejectionReason: rejectionReason }
            : user
        )
      );

      if (activeUser && activeUser._id === userId) {
        setActiveUser({
          ...activeUser,
          kycStatus: "rejected",
          kycRejectionReason: rejectionReason,
        });
      }

      setToast({
        message: "KYC rejected successfully",
        type: "success",
      });
      setRejectionReason("");
    } catch (err: any) {
      console.error("Failed to reject KYC:", err);
      setToast({
        message: err.response?.data?.message || "Failed to reject KYC",
        type: "error",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter users based on status and search query
  const filteredUsers = kycUsers.filter(user => {
    // Filter by status
    if (filterStatus !== "all" && user.kycStatus !== filterStatus) {
      return false;
    }

    // Filter by search query (name, email, phone)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = user.name?.toLowerCase().includes(query);
      const matchesEmail = user.email?.toLowerCase().includes(query);
      const matchesPhone = user.phone?.toLowerCase().includes(query);
      const matchesIdNumber = user.validID?.idNumber?.toLowerCase().includes(query);

      return matchesName || matchesEmail || matchesPhone || matchesIdNumber;
    }

    return true;
  });

  // View user detail
  const viewUserDetail = (user: KYCUser) => {
    setActiveUser(user);
    setShowUserDetail(true);
  };

  // Close user detail modal
  const closeUserDetail = () => {
    setShowUserDetail(false);
    setActiveUser(null);
    setRejectionReason("");
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "";
    let textColor = "";
    let icon = null;

    switch (status) {
      case "approved":
        bgColor = "bg-green-100";
        textColor = "text-green-700";
        icon = <CheckCircle className="w-4 h-4" />;
        break;
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-700";
        icon = <AlertCircle className="w-4 h-4" />;
        break;
      case "rejected":
        bgColor = "bg-red-100";
        textColor = "text-red-700";
        icon = <XCircle className="w-4 h-4" />;
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-700";
    }

    return (
      <span
        className={`${bgColor} ${textColor} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
      >
        {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold">Error Loading KYC Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-poppins">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">KYC Management</h1>
        <p className="text-gray-600">
          Review and manage Know Your Customer (KYC) verification submissions.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, phone or ID number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="text-gray-500 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* KYC List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
          <User className="mx-auto mb-4 w-12 h-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No KYC Submissions Found</h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== "all"
              ? "Try changing your search or filter criteria"
              : "There are no KYC submissions to review at this time"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {user.validID?.idType || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.kycStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => viewUserDetail(user)}
                      className="text-[#006837] hover:text-[#00592e] bg-[#006837]/10 hover:bg-[#006837]/20 p-2 rounded-full transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && activeUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">KYC Submission Details</h2>
              <button
                onClick={closeUserDetail}
                className="hover:bg-gray-100 p-1 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${activeUser.kycStatus === "approved" ? "bg-green-50 border border-green-200" :
                  activeUser.kycStatus === "rejected" ? "bg-red-50 border border-red-200" :
                    "bg-yellow-50 border border-yellow-200"
                }`}>
                <div className="flex items-center gap-2">
                  {activeUser.kycStatus === "approved" && <CheckCircle className="text-green-600 w-5 h-5" />}
                  {activeUser.kycStatus === "rejected" && <XCircle className="text-red-600 w-5 h-5" />}
                  {activeUser.kycStatus === "pending" && <AlertCircle className="text-yellow-600 w-5 h-5" />}
                  <p className={`font-medium ${activeUser.kycStatus === "approved" ? "text-green-700" :
                      activeUser.kycStatus === "rejected" ? "text-red-700" :
                        "text-yellow-700"
                    }`}>
                    Status: {activeUser.kycStatus.charAt(0).toUpperCase() + activeUser.kycStatus.slice(1)}
                  </p>
                </div>
                {activeUser.kycStatus === "rejected" && activeUser.kycRejectionReason && (
                  <p className="text-red-700 mt-1 text-sm ml-7">
                    Reason: {activeUser.kycRejectionReason}
                  </p>
                )}
              </div>

              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-gray-700">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span> {activeUser.name}
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span> {activeUser.email}
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span> {activeUser.phone}
                  </div>
                  <div>
                    <span className="text-gray-500">Submission Date:</span> {formatDate(activeUser.createdAt)}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              {activeUser.personalInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-gray-700">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">First Name:</span> {activeUser.personalInfo.first_name}
                    </div>
                    <div>
                      <span className="text-gray-500">Last Name:</span> {activeUser.personalInfo.last_name}
                    </div>
                    <div>
                      <span className="text-gray-500">Username:</span> {activeUser.personalInfo.user_name}
                    </div>
                    <div>
                      <span className="text-gray-500">Phone Number:</span> {activeUser.personalInfo.phone_number}
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span> {activeUser.personalInfo.gender}
                    </div>
                    <div>
                      <span className="text-gray-500">State of Origin:</span> {activeUser.personalInfo.state_of_origin}
                    </div>
                    <div>
                      <span className="text-gray-500">Age Range:</span> {activeUser.personalInfo.age_range}
                    </div>
                  </div>
                </div>
              )}

              {/* ID Information */}
              {activeUser.validID && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-gray-700">ID Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">ID Type:</span> {activeUser.validID.idType}
                    </div>
                    <div>
                      <span className="text-gray-500">ID Number:</span> {activeUser.validID.idNumber}
                    </div>
                  </div>
                  {activeUser.validID.idImageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">ID Image:</p>
                      <img
                        src={activeUser.validID.idImageUrl}
                        alt="ID Document"
                        className="max-h-64 object-contain border rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Selfie */}
              {activeUser.selfieImageUrl && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-gray-700">Selfie Image</h3>
                  <img
                    src={activeUser.selfieImageUrl}
                    alt="User Selfie"
                    className="max-h-64 object-contain border rounded-md"
                  />
                </div>
              )}

              {/* Action Buttons */}
              {activeUser.kycStatus === "pending" && (
                <div className="border-t pt-4 flex flex-col gap-4">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleApprove(activeUser._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve KYC
                    </button>

                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rejection Reason (Optional)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                    />
                    <button
                      onClick={() => handleReject(activeUser._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2 ml-auto"
                    >
                      <XCircle className="w-4 h-4" /> Reject KYC
                    </button>
                  </div>
                </div>
              )}

              {/* Re-approve/Re-reject for non-pending status */}
              {activeUser.kycStatus !== "pending" && (
                <div className="border-t pt-4">
                  <div className="flex justify-end gap-3">
                    {activeUser.kycStatus !== "approved" && (
                      <button
                        onClick={() => handleApprove(activeUser._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve KYC
                      </button>
                    )}
                    {activeUser.kycStatus !== "rejected" && (
                      <>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          rows={1}
                        />
                        <button
                          onClick={() => handleReject(activeUser._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject KYC
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
