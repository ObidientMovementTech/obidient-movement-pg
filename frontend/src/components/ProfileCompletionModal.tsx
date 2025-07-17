import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import Modal from './ui/Modal';
import { MapPin, Flag, Users, Star } from 'lucide-react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  onCompleteProfile
}: ProfileCompletionModalProps) {
  const { profile } = useUser();
  const [completionScore, setCompletionScore] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      // Calculate profile completion percentage based on the new merged structure
      const requiredFields = [
        { key: 'userName', label: 'Username', getValue: (p: any) => p.userName || p.personalInfo?.user_name },
        { key: 'gender', label: 'Gender', getValue: (p: any) => p.gender || p.personalInfo?.gender },
        { key: 'ageRange', label: 'Age Range', getValue: (p: any) => p.ageRange || p.personalInfo?.age_range },
        { key: 'stateOfOrigin', label: 'State of Origin', getValue: (p: any) => p.stateOfOrigin || p.personalInfo?.state_of_origin },
        { key: 'votingState', label: 'Voting State', getValue: (p: any) => p.votingState || p.personalInfo?.voting_engagement_state },
        { key: 'votingLGA', label: 'Voting LGA', getValue: (p: any) => p.votingLGA || p.personalInfo?.lga },
        { key: 'votingWard', label: 'Voting Ward', getValue: (p: any) => p.votingWard || p.personalInfo?.ward },
        { key: 'citizenship', label: 'Citizenship', getValue: (p: any) => p.citizenship || p.personalInfo?.citizenship },
        { key: 'isVoter', label: 'Voter Status', getValue: (p: any) => p.isVoter || p.onboardingData?.votingBehavior?.is_registered },
        { key: 'willVote', label: 'Voting Intention', getValue: (p: any) => p.willVote || p.onboardingData?.votingBehavior?.likely_to_vote }
      ];

      const completedFields = requiredFields.filter(field => {
        const value = field.getValue(profile);
        return value && value.toString().trim() !== '';
      });

      const missing = requiredFields.filter(field => {
        const value = field.getValue(profile);
        return !value || value.toString().trim() === '';
      });

      setCompletionScore((completedFields.length / requiredFields.length) * 100);
      setMissingFields(missing.map(field => field.label));
    }
  }, [profile]);

  const getBenefits = () => [
    {
      icon: <Star className="w-5 h-5" />,
      title: "Enhanced Voting Power",
      description: "Complete your profile to maximize your impact in voting blocs"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Better Matching",
      description: "Get matched with voting blocs in your area and interests"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Local Engagement",
      description: "Connect with representatives and initiatives in your constituency"
    },
    {
      icon: <Flag className="w-5 h-5" />,
      title: "Personalized Experience",
      description: "Receive content and opportunities tailored to your profile"
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Profile" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* Progress Section */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-3xl font-bold text-[#006837] mb-2">
              {Math.round(completionScore)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#006837] h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Profile completion
            </p>
          </div>
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">
              Missing Information:
            </h4>
            <div className="space-y-1">
              {missingFields.slice(0, 4).map((field, index) => (
                <div key={index} className="text-sm text-orange-700 flex items-center">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                  {field}
                </div>
              ))}
              {missingFields.length > 4 && (
                <div className="text-sm text-orange-600 italic">
                  +{missingFields.length - 4} more fields
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benefits */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            Why complete your profile?
          </h4>
          <div className="space-y-3">
            {getBenefits().map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-[#006837] mt-0.5">
                  {benefit.icon}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-800">
                    {benefit.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {benefit.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onCompleteProfile}
            className="w-full bg-[#006837] hover:bg-[#005030] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Complete Profile Now
          </button>

          <button
            onClick={onClose}
            className="w-full text-gray-600 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Incentive */}
        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-800">
            <strong>Complete your profile to unlock full platform benefits!</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
}
