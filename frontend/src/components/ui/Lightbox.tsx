import React from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../../context/ModalContext';

interface LightboxProps {
  imageSrc: string;
  onClose: () => void;
  alt?: string;
  isOpen: boolean; // Added this prop to match ModalPortal
}

const Lightbox: React.FC<LightboxProps> = ({
  imageSrc,
  onClose,
  alt = "Image",
  isOpen
}) => {
  const { portalContainer } = useModal();

  if (!isOpen || !portalContainer) return null;

  return createPortal(
    <div
      className="lightbox-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <img
        src={imageSrc}
        alt={alt}
        className="max-h-[85vh] max-w-[85vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    portalContainer
  );
};

export default Lightbox;
