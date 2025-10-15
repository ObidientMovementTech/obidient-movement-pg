import React from 'react';
import { X, Users, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

// User type definition
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  votingState?: string;
  votingLGA?: string;
  votingWard?: string;
  votingPU?: string;
  userName?: string;
  gender?: string;
  ageRange?: string;
  countryOfResidence?: string;
  stateOfOrigin?: string;
  citizenship?: string;
  role: 'user' | 'admin';
  kycStatus: 'unsubmitted' | 'draft' | 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  isVoter?: boolean;
  designation?: string;
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;
  createdAt: string;
  updatedAt: string;
  totalMembersInOwnedBlocs?: number;
  ownedVotingBlocsCount?: number;
  lastVotingBlocActivity?: string;
}

// View modal state interface
interface ViewModalState {
  isOpen: boolean;
  user: User | null;
}

interface AdminViewUserModalProps {
  viewModal: ViewModalState;
  onClose: () => void;
}

const AdminViewUserModal: React.FC<AdminViewUserModalProps> = ({
  viewModal,
  onClose
}) => {
  if (!viewModal.isOpen || !viewModal.user) return null;

  const { user } = viewModal;

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {/* User Header */}
          <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <Users size={32} className="text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.role === 'admin' ? (
                    <>
                      <Shield size={12} className="mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <Users size={12} className="mr-1" />
                      User
                    </>
                  )}
                </span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.emailVerified ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className="mr-1" />
                      Unverified
                    </>
                  )}
                </span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKycStatusColor(user.kycStatus)}`}>
                  <Clock size={12} className="mr-1" />
                  KYC: {user.kycStatus}
                </span>
              </div>
            </div>
          </div>

          {/* User Details Sections */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Username:</span>
                  <span className="ml-2 text-gray-900">{user.userName || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-2 text-gray-900">{user.gender || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Age Range:</span>
                  <span className="ml-2 text-gray-900">{user.ageRange || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 text-gray-900">{user.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Citizenship:</span>
                  <span className="ml-2 text-gray-900">{user.citizenship || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Country of Residence:</span>
                  <span className="ml-2 text-gray-900">{user.countryOfResidence || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-500">State of Origin:</span>
                  <span className="ml-2 text-gray-900">{user.stateOfOrigin || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Registered Voter:</span>
                  <span className="ml-2 text-gray-900">{user.isVoter ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Voting Location Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                <MapPin size={16} className="mr-2" />
                Voting Location
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Voting State:</span>
                  <span className="ml-2 text-gray-900">{user.votingState || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Voting LGA:</span>
                  <span className="ml-2 text-gray-900">{user.votingLGA || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Voting Ward:</span>
                  <span className="ml-2 text-gray-900">{user.votingWard || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Polling Unit:</span>
                  <span className="ml-2 text-gray-900">{user.votingPU || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Administrative Information */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
                <Shield size={16} className="mr-2" />
                Administrative Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2 text-gray-900 capitalize">{user.role}</span>
                </div>
                <div>
                  <span className="text-gray-500">KYC Status:</span>
                  <span className="ml-2 text-gray-900 capitalize">{user.kycStatus}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email Verified:</span>
                  <span className={`ml-2 ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Designation:</span>
                  <span className="ml-2 text-gray-900">{user.designation || 'Not assigned'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Assignment Information */}
              {(user.assignedState || user.assignedLGA || user.assignedWard) && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h5 className="text-sm font-medium text-green-800 mb-2">Assignment Details</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Assigned State:</span>
                      <span className="ml-2 text-gray-900">{user.assignedState || 'Not assigned'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Assigned LGA:</span>
                      <span className="ml-2 text-gray-900">{user.assignedLGA || 'Not assigned'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Assigned Ward:</span>
                      <span className="ml-2 text-gray-900">{user.assignedWard || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Voting Bloc Activity */}
            {(user.ownedVotingBlocsCount !== undefined && user.ownedVotingBlocsCount > 0) && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-3">Voting Bloc Activity</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Owned Voting Blocs:</span>
                    <span className="ml-2 text-gray-900 font-medium">{user.ownedVotingBlocsCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Members in Owned Blocs:</span>
                    <span className="ml-2 text-gray-900 font-medium">{user.totalMembersInOwnedBlocs || 0}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Last Activity:</span>
                    <span className="ml-2 text-gray-900">
                      {user.lastVotingBlocActivity ? new Date(user.lastVotingBlocActivity).toLocaleDateString() : 'No activity'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-3">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail size={16} className="text-gray-400 mr-3" />
                  <span className="text-gray-500 w-20">Email:</span>
                  <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800">
                    {user.email}
                  </a>
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm">
                    <Phone size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-500 w-20">Phone:</span>
                    <a href={`tel:${user.phone}`} className="text-blue-600 hover:text-blue-800">
                      {user.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminViewUserModal;