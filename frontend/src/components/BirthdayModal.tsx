import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Lottie from 'lottie-react';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BirthdayModal({ isOpen, onClose }: BirthdayModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [confettiData, setConfettiData] = useState<any>(null);

  // Load confetti animation data
  useEffect(() => {
    const loadConfettiAnimation = async () => {
      try {
        const response = await fetch('/Confetti.json');
        const animationData = await response.json();
        setConfettiData(animationData);
      } catch (error) {
        console.error('Failed to load confetti animation:', error);
      }
    };

    loadConfettiAnimation();
  }, []);

  // Check if we should show the birthday modal
  useEffect(() => {
    const checkBirthdayTime = () => {
      const now = new Date();
      // Convert to West African Time
      const watTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

      // Birthday is on July 19, 2025 - Peter Obi's birthday
      const birthday = new Date('2025-07-19T00:00:00');
      const birthdayEnd = new Date('2025-07-20T00:00:00'); // Ends at midnight on July 20

      // Convert birthday dates to WAT for comparison
      const birthdayWAT = new Date(birthday.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
      const birthdayEndWAT = new Date(birthdayEnd.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

      const isBirthdayTime = watTime >= birthdayWAT && watTime < birthdayEndWAT;

      console.log('🎂 Birthday check:', {
        currentWAT: watTime.toISOString(),
        birthdayStart: birthdayWAT.toISOString(),
        birthdayEnd: birthdayEndWAT.toISOString(),
        isBirthdayTime,
        shouldShow: isBirthdayTime && isOpen
      });

      return isBirthdayTime;
    };

    // Check if user has already seen the birthday modal today
    const hasSeenBirthdayModal = localStorage.getItem('hasSeenBirthdayModal2025');

    if (isOpen && checkBirthdayTime() && !hasSeenBirthdayModal) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    // Mark that user has seen the birthday modal
    localStorage.setItem('hasSeenBirthdayModal2025', 'true');
    setShowModal(false);
    onClose();
  };

  const handleLearnHow = () => {
    // Open the Twitter video in a new tab
    window.open('https://x.com/obidientupdate/status/1946483306498761104/video/2', '_blank');
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        {/* Modal content - Minimal design with transparent background */}
        <div className="relative inline-block transform transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          {/* Confetti Animation Overlay */}
          {confettiData && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <Lottie
                animationData={confettiData}
                loop={true}
                autoplay={true}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 z-20 rounded-full bg-white bg-opacity-80 p-2 text-gray-600 hover:bg-opacity-100 hover:text-gray-800 transition-all shadow-lg"
            onClick={handleClose}
          >
            <X size={20} />
          </button>

          {/* Birthday Design Image */}
          <div className="relative z-10 flex flex-col items-center">
            <img
              src="/PO-Birthday.png"
              alt="Peter Obi Birthday"
              className="max-w-full h-auto"
              style={{ maxHeight: '500px' }}
              onClick={handleClose}
            />

            {/* Learn How Button */}
            <button
              onClick={handleLearnHow}
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Learn How
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
