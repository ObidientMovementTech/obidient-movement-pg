import React, { useState } from 'react';
import { X, Twitter, ExternalLink, Users, Bell } from 'lucide-react';

interface TwitterFollowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TwitterFollowModal: React.FC<TwitterFollowModalProps> = ({ isOpen, onClose }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  if (!isOpen) return null;

  const handleFollowClick = () => {
    // Open Twitter follow link in new tab
    window.open('https://x.com/ObidientUpdate', '_blank', 'noopener,noreferrer');
    setIsFollowing(true);

    // Close modal after a short delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleLaterClick = () => {
    // Store that user clicked "Later" to avoid showing too frequently
    localStorage.setItem('twitter-follow-dismissed', Date.now().toString());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Twitter size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Stay Connected!</h2>
              <p className="text-blue-100 text-sm">Join the movement on Twitter</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Follow @ObidientUpdate
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get the latest updates, breaking news, and connect with thousands of
              Obidient members working together for a new Nigeria.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell size={16} className="text-blue-600" />
              </div>
              <span>Real-time updates on movement activities</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users size={16} className="text-green-600" />
              </div>
              <span>Connect with fellow Obidient members</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <ExternalLink size={16} className="text-yellow-600" />
              </div>
              <span>Share and amplify important messages</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleFollowClick}
              disabled={isFollowing}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-green-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isFollowing ? (
                <>
                  <span className="animate-pulse">✓</span>
                  Opening Twitter...
                </>
              ) : (
                <>
                  <Twitter size={18} />
                  Follow @ObidientUpdate
                  <ExternalLink size={16} />
                </>
              )}
            </button>

            <button
              onClick={handleLaterClick}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200"
            >
              Maybe Later
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Following helps you stay informed and strengthens our collective voice
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwitterFollowModal;
