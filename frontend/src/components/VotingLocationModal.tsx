import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import Modal from './ui/Modal';
import { MapPin, Vote, AlertCircle, CheckCircle } from 'lucide-react';

interface VotingLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
}

export default function VotingLocationModal({
  isOpen,
  onClose,
  onCompleteProfile
}: VotingLocationModalProps) {
  const { profile } = useUser();
  const [missingVotingFields, setMissingVotingFields] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      // Check specifically for voting location fields
      const votingFields = [
        { key: 'votingState', label: 'Voting State', getValue: (p: any) => p.votingState || p.personalInfo?.voting_engagement_state },
        { key: 'votingLGA', label: 'Voting LGA', getValue: (p: any) => p.votingLGA || p.personalInfo?.lga },
        { key: 'votingWard', label: 'Voting Ward', getValue: (p: any) => p.votingWard || p.personalInfo?.ward },
        { key: 'votingPU', label: 'Voting Polling Unit', getValue: (p: any) => p.votingPU || p.personalInfo?.voting_pu }
      ];

      const missing = votingFields.filter(field => {
        const value = field.getValue(profile);
        return !value || value.toString().trim() === '';
      });

      setMissingVotingFields(missing.map(field => field.label));
    }
  }, [profile]);

  const isVotingLocationComplete = missingVotingFields.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Voting Location"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isVotingLocationComplete ? 'Voting Location Complete!' : 'Please Complete Your Voting Location'}
          </h3>
          {!isVotingLocationComplete && (
            <p className="text-sm text-gray-600">
              This information is required for full platform access
            </p>
          )}
        </div>

        {/* Status */}
        {!isVotingLocationComplete ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">
                  Missing Voting Information:
                </h4>
                <div className="space-y-1">
                  {missingVotingFields.map((field, index) => (
                    <div key={index} className="text-sm text-orange-700 flex items-center">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div className="text-green-800">
                <p className="font-medium">Your voting location is complete!</p>
                <p className="text-sm text-green-700 mt-1">
                  You can now participate fully in voting blocs and location-based activities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Why it's Important */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            Why is this important?
          </h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-green-600 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">
                  Local Representation
                </div>
                <div className="text-xs text-gray-600">
                  Connect with representatives and initiatives in your exact polling unit
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-green-600 mt-0.5">
                <Vote className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">
                  Voting Bloc Matching
                </div>
                <div className="text-xs text-gray-600">
                  Join voting blocs that are active in your specific location
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">
                  Electoral Participation
                </div>
                <div className="text-xs text-gray-600">
                  Get updates and opportunities specific to your polling unit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isVotingLocationComplete ? (
            <>
              <button
                onClick={onCompleteProfile}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Complete Voting Location
              </button>

              <button
                onClick={onClose}
                className="w-full text-gray-600 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Skip for Now
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          )}
        </div>

        {/* Emphasis */}
        {!isVotingLocationComplete && (
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-sm text-red-800">
              <strong>⚠️ Action Required!</strong>
              <br />
              <span className="text-red-700">
                Complete your voting location to unlock all platform features and help us mobilize your area.
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}