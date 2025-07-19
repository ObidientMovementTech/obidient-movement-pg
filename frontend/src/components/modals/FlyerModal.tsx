import React, { useRef, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { X, Download, Share2, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface FlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  votingBloc: any;
}

const FlyerModal: React.FC<FlyerModalProps> = ({ isOpen, onClose, userProfile, votingBloc }) => {
  const { profile } = useUserContext();
  const flyerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  // Remove all profile image loading state


  // Always use user from context for name and image
  const getUserName = () => {
    return profile?.name ||
      (profile?.personalInfo?.first_name && profile?.personalInfo?.last_name
        ? `${profile.personalInfo.first_name} ${profile.personalInfo.last_name}`
        : profile?.email?.split('@')[0] || 'Obidient Member');
  };

  const getInitials = () => {
    return getUserName().charAt(0).toUpperCase() || 'C';
  };

  const getProfileImage = () => {
    return profile?.profileImage || '';
  };

  // Fallback image state for profile image
  const [profileImgSrc, setProfileImgSrc] = useState(getProfileImage());
  React.useEffect(() => {
    setProfileImgSrc(getProfileImage());
  }, [profile, isOpen]);

  // Only preload background image for the flyer
  React.useEffect(() => {
    if (isOpen) {
      setBackgroundImageLoaded(false);
      // Preload background image only
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => setBackgroundImageLoaded(true);
      bgImg.onerror = () => {
        console.error('Failed to preload background image');
        setBackgroundImageLoaded(true);
      };
      bgImg.src = '/mobilize-dp2.png';
    }
  }, [isOpen]);

  if (!isOpen) return null;
  // If user context is not loaded, show nothing
  if (!profile) return null;

  const downloadFlyer = async () => {
    if (!flyerRef.current || !userProfile) return;

    try {
      setIsDownloading(true);

      // Ensure both images are fully loaded
      const images = flyerRef.current.querySelectorAll('img');

      // Force reload images with crossOrigin to ensure they're canvas-compatible
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve(img);
          } else {
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            newImg.onload = () => {
              img.src = newImg.src;
              resolve(newImg);
            };
            newImg.onerror = () => {
              console.warn('Failed to load image:', img.src);
              resolve(img); // Continue even if image fails
            };
            newImg.src = img.src;
          }
        });
      }));

      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create canvas with high quality settings
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        logging: true,
        imageTimeout: 30000,
        removeContainer: false,
        foreignObjectRendering: false,
        ignoreElements: (_element) => {
          // Don't ignore any elements
          return false;
        }
      });

      // Resize canvas to exact dimensions if needed
      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = 540;
      targetCanvas.height = 675;
      const ctx = targetCanvas.getContext('2d');

      if (ctx) {
        // Draw the captured canvas onto the target canvas with exact dimensions
        ctx.drawImage(canvas, 0, 0, 540, 675);
      }

      // Create high-quality PNG blob
      targetCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const sanitizedName = getUserName().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
          link.download = `${sanitizedName}_obidient_mobilization_flyer.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 0.98);

    } catch (error) {
      console.error('Error downloading flyer:', error);
      alert('Failed to download flyer. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const shareToSocialMedia = async (platform: string) => {
    if (!flyerRef.current || !userProfile) return;

    try {
      setIsSharing(true);

      // Ensure both images are fully loaded
      const images = flyerRef.current.querySelectorAll('img');

      // Force reload images with crossOrigin
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve(img);
          } else {
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            newImg.onload = () => {
              img.src = newImg.src;
              resolve(newImg);
            };
            newImg.onerror = () => {
              console.warn('Failed to load image:', img.src);
              resolve(img);
            };
            newImg.src = img.src;
          }
        });
      }));

      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate image for sharing
      const canvas = await html2canvas(flyerRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 30000,
      });

      // Resize to exact dimensions for sharing
      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = 540;
      targetCanvas.height = 675;
      const ctx = targetCanvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(canvas, 0, 0, 540, 675);
      }

      // Convert to blob for sharing
      targetCanvas.toBlob(async (blob) => {
        if (!blob) return;

        const shareText = `I am mobilizing 100 voters for ${votingBloc?.targetCandidate || 'Peter Obi'}! Join my voting bloc and let's make a difference together. #ObidientMovement`;
        const sanitizedName = getUserName().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();

        if (typeof navigator !== 'undefined' && 'share' in navigator && platform === 'native') {
          // Use native sharing if available
          try {
            await navigator.share({
              title: 'Join My Voting Bloc',
              text: shareText,
              files: [new File([blob], `${sanitizedName}_obidient_flyer.png`, { type: 'image/png' })]
            });
          } catch (error) {
            console.error('Native sharing failed:', error);
          }
        } else {
          // Fallback to platform-specific sharing
          const encodedText = encodeURIComponent(shareText);
          let shareUrl = '';

          switch (platform) {
            case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`;
              break;
            case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
              break;
            case 'whatsapp':
              shareUrl = `https://wa.me/?text=${encodedText}`;
              break;
            case 'instagram':
              // Instagram doesn't support direct sharing, so download the image
              downloadFlyer();
              return;
            default:
              return;
          }

          if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
          }
        }
      }, 'image/png', 0.95);

    } catch (error) {
      console.error('Error sharing flyer:', error);
      alert('Failed to share flyer. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Share Your Personalized Flyer</h2>
            <p className="text-sm text-gray-600 mt-1">Create and share your mobilization flyer with your network</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flyer Preview */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

              {/* Flyer Container */}
              <div
                ref={flyerRef}
                data-flyer-ref="true"
                className="relative bg-gray-800 shadow-lg mx-auto"
                style={{
                  width: '360px',
                  height: '450px',
                  maxWidth: '100vw',
                  maxHeight: 'calc(100vw * 1.25)',
                  minWidth: '320px',
                  minHeight: '400px',
                  transform: 'scale(1)'
                }}
              >
                {/* Background Flyer Image */}
                {backgroundImageLoaded && (
                  <img
                    src="/mobilize-dp.png"
                    alt="Mobilization Flyer Background"
                    className="absolute inset-0 w-full h-full object-fill"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Failed to load background image');
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}

                {/* Loading indicator while background loads */}
                {!backgroundImageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                )}

                {/* Overlay Content */}
                <div className="absolute inset-0">
                  {/* Profile Section - Positioned to match your template */}
                  <div className="absolute w-full px-4" style={{ top: '13%' }}>
                    <div className="flex flex-row items-center justify-between gap-2 w-full px-4">
                      {/* Name and details on the left */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-bold text-gray-900 leading-tight break-words"
                          style={{
                            fontSize: '1.2rem',
                            lineHeight: 1.1,
                            maxWidth: '180px',
                            marginBottom: '2px',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto'
                          }}
                        >
                          {getUserName()}
                        </p>
                        <p
                          className="text-gray-600 mt-1"
                          style={{ fontSize: '1rem', maxWidth: '180px' }}
                        >
                          Mobilizer
                        </p>
                      </div>
                      {/* Profile image on the right */}
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex items-center justify-center"
                          style={{ width: '170px', height: '170px' }}
                        >
                          {profileImgSrc ? (
                            <img
                              src={profileImgSrc}
                              alt={getUserName()}
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                              onError={() => setProfileImgSrc('/photo.png')}
                            />
                          ) : (
                            <span className="text-white" style={{ fontSize: '5rem' }}>{getInitials()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing Options */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Share Your Flyer</h3>

              {/* Download Button */}
              <button
                onClick={downloadFlyer}
                disabled={isDownloading || !backgroundImageLoaded}
                className="w-full flex items-center justify-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6 transition-colors"
              >
                {isDownloading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Download size={20} />
                )}
                {isDownloading ? 'Downloading...' : (!backgroundImageLoaded) ? 'Loading...' : 'Download High Quality PNG'}
              </button>

              {/* Social Media Sharing */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Share directly to:</h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => shareToSocialMedia('facebook')}
                    disabled={isSharing || !backgroundImageLoaded}
                    className="flex items-center justify-center gap-2 p-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    <Facebook size={20} />
                    Facebook
                  </button>

                  <button
                    onClick={() => shareToSocialMedia('twitter')}
                    disabled={isSharing || !backgroundImageLoaded}
                    className="flex items-center justify-center gap-2 p-3 border border-sky-300 text-sky-600 rounded-lg hover:bg-sky-50 disabled:opacity-50 transition-colors"
                  >
                    <Twitter size={20} />
                    Twitter
                  </button>

                  <button
                    onClick={() => shareToSocialMedia('whatsapp')}
                    disabled={isSharing || !backgroundImageLoaded}
                    className="flex items-center justify-center gap-2 p-3 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    <MessageCircle size={20} />
                    WhatsApp
                  </button>

                  <button
                    onClick={() => shareToSocialMedia('instagram')}
                    disabled={isSharing || !backgroundImageLoaded}
                    className="flex items-center justify-center gap-2 p-3 border border-pink-300 text-pink-600 rounded-lg hover:bg-pink-50 disabled:opacity-50 transition-colors"
                  >
                    <Instagram size={20} />
                    Instagram
                  </button>
                </div>

                {/* Native Share (if supported) */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={() => shareToSocialMedia('native')}
                    disabled={isSharing || !backgroundImageLoaded}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Share2 size={20} />
                    Share via...
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">📢 How to maximize your impact:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Download in high quality for crisp social media posts</li>
                  <li>• Share as your profile picture or story to show support</li>
                  <li>• Post in community groups and WhatsApp status</li>
                  <li>• Print copies for offline campaigning and events</li>
                  <li>• Include the voting bloc link when sharing: <span className="font-mono text-xs break-all">{votingBloc ? `${window.location.origin}/voting-bloc/${votingBloc.joinCode}` : ''}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyerModal;
